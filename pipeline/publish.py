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

from common import DATA, ROOT, history_file, load_config, read_json, write_json, youtube_client

QUEUE = DATA / "queue.json"


def gh(*args: str) -> str:
    return subprocess.run(["gh", *args], check=True, capture_output=True, text=True).stdout.strip()


def approved_from_issue(body: str) -> tuple[str | None, list[str]]:
    wid = re.search(r"<!-- semana:(\S+) -->", body)
    ids = re.findall(r"^\s*[-*] \[[xX]\] `([^`]+)`", body, flags=re.M)
    return (wid.group(1) if wid else None), ids


def _iso(d: dt.datetime) -> str:
    return d.astimezone(dt.timezone.utc).isoformat().replace("+00:00", "Z")


def _parse(s: str) -> dt.datetime:
    return dt.datetime.fromisoformat(s.replace("Z", "+00:00"))


def plan_slots(n: int, cfg: dict, queue: list[dict]) -> list[dt.datetime]:
    """Reparte n vídeos nuevos entre los días, respetando los que ya están programados.

    - Busca el MENOR número de vídeos por día (1, 2 o 3) con el que todo lo pendiente cabe en el
      horizonte (por defecto 7 días). Si ni con 3 cabe, usa 3 y sigue por los días siguientes.
    - Rellena primero los huecos de los días más cercanos. Nunca más de `max_por_dia` (3) en un día.
    """
    p = cfg["publicacion"]
    tz = ZoneInfo(p["zona_horaria"])
    max_day = min(3, int(p.get("max_por_dia", 3)))
    hours = [tuple(map(int, h.split(":"))) for h in p["horas"]][:max_day]
    horizon = int(p.get("dias_horizonte", 7))
    first_day = dt.datetime.now(tz).date() + dt.timedelta(days=1)

    taken: dict[dt.date, set[tuple[int, int]]] = {}
    for q in queue:
        if q.get("estado") in ("programado", "pendiente", "manual") and q.get("publish_at"):
            d = _parse(q["publish_at"]).astimezone(tz)
            if d.date() >= first_day:
                taken.setdefault(d.date(), set()).add((d.hour, d.minute))

    future_in_horizon = sum(len(v) for k, v in taken.items() if (k - first_day).days < horizon)
    per_day = next((k for k in range(1, max_day + 1) if future_in_horizon + n <= k * horizon), max_day)

    slots: list[dt.datetime] = []
    day = first_day
    while len(slots) < n:
        used = taken.setdefault(day, set())
        # Fuera del horizonte se va a 1 vídeo/día salvo que haga falta más para no alargarlo sin fin
        cap = per_day if (day - first_day).days < horizon else min(max_day, per_day)
        for h in hours[:cap]:
            if len(used) >= cap or len(slots) == n:
                break
            if h not in used:
                used.add(h)
                slots.append(dt.datetime.combine(day, dt.time(*h), tz))
        day += dt.timedelta(days=1)
    return sorted(slots)


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


def manual_report(queue: list[dict], pending: list[dict], cfg: dict) -> list[str]:
    """Modo manual (sin auditoría de la API): no sube nada, deja todo listo para subirlo a mano en 2 minutos."""
    repo = os.environ.get("GITHUB_REPOSITORY", "")
    tz = ZoneInfo(cfg["publicacion"]["zona_horaria"])
    dias = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]
    report = ["Mientras YouTube no apruebe la auditoría de la API, súbelos a mano (2 min cada uno): "
              "**YouTube Studio → Crear → Subir vídeos** → pega título y descripción → *No es para niños* → "
              "**Visibilidad → Programar** con la fecha indicada.\n"]
    for q in pending:
        local = _parse(q["publish_at"]).astimezone(tz)
        dl = f"https://github.com/{repo}/releases/download/{q['tag']}/{q['video']}"
        report.append(
            f"---\n**📅 {dias[local.weekday()]} {local:%d/%m} a las {local:%H:%M}** · [⬇️ descargar vídeo]({dl})\n\n"
            f"**Título:**\n```\n{q['title']}\n```\n**Descripción:**\n```\n{q['description']}\n```\n"
            f"**Etiquetas:** {', '.join(q.get('tags', []))}\n"
        )
        q["estado"] = "manual"
    write_json(QUEUE, queue)
    return report


def process_queue(cfg: dict) -> list[str]:
    from googleapiclient.errors import HttpError

    queue = read_json(QUEUE, [])
    pending = [q for q in queue if q["estado"] == "pendiente"]
    if not pending:
        print("No hay subidas pendientes")
        return [], None
    if not cfg["publicacion"].get("subir_por_api", True):
        return manual_report(queue, pending, cfg), pending[0].get("issue")
    yt = youtube_client()
    tmp = ROOT / "out" / "descargas"
    tmp.mkdir(parents=True, exist_ok=True)
    report = []
    for q in pending:
        # Si la hora ya pasó (p. ej. por cuota agotada varios días), se mueve al primer hueco libre.
        if dt.datetime.fromisoformat(q["publish_at"].replace("Z", "+00:00")) < dt.datetime.now(dt.timezone.utc) + dt.timedelta(hours=1):
            others = [x for x in queue if x is not q]
            q["publish_at"] = _iso(plan_slots(1, cfg, others)[0])
        path = tmp / q["video"]
        if not path.exists():
            gh("release", "download", q["tag"], "--pattern", q["video"], "--dir", str(tmp), "--clobber")
        try:
            vid = upload(yt, q, path, cfg)
            q.update(estado="programado", youtube_id=vid)
            local = dt.datetime.fromisoformat(q["publish_at"].replace("Z", "+00:00")).astimezone(ZoneInfo(cfg["publicacion"]["zona_horaria"]))
            dias = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]
            cuando = f"{dias[local.weekday()]} {local:%d/%m} a las {local:%H:%M}"
            report.append(
                f"✅ **{q['title']}**\n   📅 Se publica el **{cuando}** · [ver](https://youtu.be/{vid}) · "
                f"[abrir en YouTube Studio](https://studio.youtube.com/video/{vid}/edit)"
            )
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
        # Aprende de la revisión: marca en el historial qué vídeos aprobaste y cuáles no
        for path in (history_file(wid), DATA / "history.json"):
            hist = read_json(path, None)
            if not hist:
                continue
            week_ids = {v["id"] for v in week["videos"]}
            for h in hist:
                if h.get("id") in week_ids:
                    h["aprobado"] = h["id"] in ids
            write_json(path, hist)
        if not chosen:
            gh("issue", "comment", str(args.issue), "--body", "No había ninguna casilla marcada (o ya estaban programados). Reabre el issue, marca los vídeos y vuelve a cerrarlo.")
            return
        for v, slot in zip(chosen, plan_slots(len(chosen), cfg, queue)):
            queue.append({**v, "tag": week["tag"], "issue": args.issue, "estado": "pendiente", "publish_at": _iso(slot)})
        write_json(QUEUE, queue)

    report, issue = process_queue(cfg)
    if report:
        issue = args.issue or issue
        if issue:
            note = "" if not cfg["publicacion"].get("subir_por_api", True) else ("\n\n> ℹ️ Si aún no tienes la auditoría de la API de YouTube, los vídeos se quedan en *Privado*. "
                    "Pulsa **abrir en YouTube Studio** en cada uno → *Visibilidad* → *Programar* y pon la fecha indicada.")
            owner = os.environ.get("GITHUB_REPOSITORY_OWNER", "")
            head = f"🔔 @{owner} " if owner else ""
            gh("issue", "comment", str(issue), "--body", f"### {head}Programación en YouTube\n\n" + "\n".join(report) + note)


if __name__ == "__main__":
    main()
