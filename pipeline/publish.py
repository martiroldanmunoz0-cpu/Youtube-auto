"""Paso 5: programa en YouTube los vídeos aprobados.

Se ejecuta:
  - al cerrar el issue de revisión (lee las casillas marcadas)
  - cada día, para terminar subidas pendientes si ayer se agotó la cuota de la API

Reparto: 1 vídeo al día a la primera hora configurada. Si apruebas más de 7, los días
necesarios llevan 2 (máximo `max_por_dia`). Empieza al día siguiente del último vídeo ya programado.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
import subprocess
import sys
from pathlib import Path
from zoneinfo import ZoneInfo

from common import DATA, ROOT, load_config, read_json, write_json, youtube_client

QUEUE = DATA / "queue.json"


def gh(*args: str) -> str:
    return subprocess.run(["gh", *args], check=True, capture_output=True, text=True).stdout.strip()


def approved_from_issue(body: str) -> tuple[str | None, list[str]]:
    wid = re.search(r"<!-- semana:(\S+) -->", body)
    ids = re.findall(r"^\s*[-*] \[[xX]\] `([^`]+)`", body, flags=re.M)
    return (wid.group(1) if wid else None), ids


def plan_slots(n: int, cfg: dict, after: dt.datetime | None) -> list[dt.datetime]:
    p = cfg["publicacion"]
    tz = ZoneInfo(p["zona_horaria"])
    hours = [tuple(map(int, h.split(":"))) for h in p["horas"]][: p.get("max_por_dia", 2)]
    now = dt.datetime.now(tz)
    day = (max(now, after.astimezone(tz)) if after else now).date() + dt.timedelta(days=1)
    days = max(7, -(-n // len(hours)))  # al menos una semana
    extra = max(0, n - days)            # días que llevan 2 vídeos
    slots = []
    for d in range(days):
        per_day = 2 if d < extra and len(hours) > 1 else 1
        for k in range(per_day):
            h, m = hours[k]
            slots.append(dt.datetime.combine(day + dt.timedelta(days=d), dt.time(h, m), tz))
    slots.sort()
    return slots[:n]


def upload(yt, item: dict, video_path: Path, cfg: dict) -> str:
    from googleapiclient.http import MediaFileUpload

    body = {
        "snippet": {
            "title": item["title"][:100],
            "description": item["description"][:4900],
            "tags": item["tags"][:15],
            "categoryId": cfg["publicacion"].get("categoria_id", "24"),
            "defaultLanguage": cfg["canal"].get("idioma", "es"),
            "defaultAudioLanguage": cfg["canal"].get("idioma", "es"),
        },
        "status": {
            "privacyStatus": "private",
            "publishAt": item["publish_at"],
            "selfDeclaredMadeForKids": False,
        },
    }
    media = MediaFileUpload(str(video_path), mimetype="video/mp4", resumable=True, chunksize=8 * 1024 * 1024)
    req = yt.videos().insert(part="snippet,status", body=body, media_body=media)
    resp = None
    while resp is None:
        _, resp = req.next_chunk()
    return resp["id"]


def process_queue(cfg: dict) -> list[str]:
    from googleapiclient.errors import HttpError

    queue = read_json(QUEUE, [])
    pending = [q for q in queue if q["estado"] == "pendiente"]
    if not pending:
        print("No hay subidas pendientes")
        return [], None
    yt = youtube_client()
    tmp = ROOT / "out" / "descargas"
    tmp.mkdir(parents=True, exist_ok=True)
    report = []
    for q in pending:
        # Si la hora ya pasó (p. ej. por cuota agotada varios días), se mueve al primer hueco libre.
        if dt.datetime.fromisoformat(q["publish_at"].replace("Z", "+00:00")) < dt.datetime.now(dt.timezone.utc) + dt.timedelta(hours=1):
            last = max((dt.datetime.fromisoformat(x["publish_at"].replace("Z", "+00:00")) for x in queue if x["estado"] == "programado"), default=None)
            q["publish_at"] = plan_slots(1, cfg, last)[0].astimezone(dt.timezone.utc).isoformat().replace("+00:00", "Z")
        path = tmp / q["video"]
        if not path.exists():
            gh("release", "download", q["tag"], "--pattern", q["video"], "--dir", str(tmp), "--clobber")
        try:
            vid = upload(yt, q, path, cfg)
            q.update(estado="programado", youtube_id=vid)
            report.append(f"✅ `{q['id']}` → https://youtu.be/{vid} — se publica {q['publish_at']}")
            print(report[-1])
        except HttpError as e:
            if "quotaExceeded" in str(e) or "uploadLimitExceeded" in str(e):
                report.append(f"⏳ Cuota de YouTube agotada hoy: `{q['id']}` y siguientes se subirán mañana automáticamente.")
                print(report[-1])
                break
            q.update(estado="error", error=str(e)[:300])
            report.append(f"❌ `{q['id']}`: {str(e)[:200]}")
        finally:
            write_json(QUEUE, queue)
    return report, pending[0].get("issue")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--issue", type=int, help="número del issue de revisión cerrado")
    args = ap.parse_args()
    cfg = load_config()
    queue = read_json(QUEUE, [])

    if args.issue:
        body = json.loads(gh("issue", "view", str(args.issue), "--json", "body"))["body"]
        wid, ids = approved_from_issue(body)
        week = read_json(DATA / "weeks" / f"{wid}.json") if wid else None
        if not week:
            sys.exit(f"No encuentro los datos de la semana {wid}")
        already = {q["id"] for q in queue}
        chosen = [v for v in week["videos"] if v["id"] in ids and v["id"] not in already]
        if not chosen:
            gh("issue", "comment", str(args.issue), "--body", "No había ninguna casilla marcada (o ya estaban programados). Reabre el issue, marca los vídeos y vuelve a cerrarlo.")
            return
        last = max((dt.datetime.fromisoformat(q["publish_at"].replace("Z", "+00:00")) for q in queue if q["estado"] in ("programado", "pendiente")), default=None)
        for v, slot in zip(chosen, plan_slots(len(chosen), cfg, last)):
            queue.append({**v, "tag": week["tag"], "issue": args.issue, "estado": "pendiente",
                          "publish_at": slot.astimezone(dt.timezone.utc).isoformat().replace("+00:00", "Z")})
        write_json(QUEUE, queue)

    report, issue = process_queue(cfg)
    if report:
        issue = args.issue or issue
        if issue:
            gh("issue", "comment", str(issue), "--body", "### Programación en YouTube\n\n" + "\n".join(report))


if __name__ == "__main__":
    main()
