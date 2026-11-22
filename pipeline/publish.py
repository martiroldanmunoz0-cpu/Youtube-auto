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


def motivos_descarte(issue: int) -> dict[str, str]:
    """Motivos que el dueño marcó en el panel al descartar ("🗑️ Motivo de descarte · `id`: ...")."""
    try:
        data = json.loads(gh("issue", "view", str(issue), "--json", "comments"))
    except Exception:  # noqa: BLE001
        return {}
    out = {}
    for c in data.get("comments", []):
        for m in re.finditer(r"Motivo de descarte · `([^`]+)`: (.+)", c.get("body", "")):
            out[m.group(1)] = m.group(2).strip()[:300]
    return out


def approved_from_issue(body: str) -> tuple[str | None, list[str]]:
    wid = re.search(r"<!-- semana:(\S+) -->", body)
    ids = re.findall(r"^\s*[-*] \[[xX]\] `([^`]+)`", body, flags=re.M)
    return (wid.group(1) if wid else None), ids


def _iso(d: dt.datetime) -> str:
    return d.astimezone(dt.timezone.utc).isoformat().replace("+00:00", "Z")


def _parse(s: str) -> dt.datetime:
    return dt.datetime.fromisoformat(s.replace("Z", "+00:00"))


def _hours_for(p: dict, day: dt.date, k: int) -> list[tuple[int, int]]:
    """Horas para un día con k vídeos. Admite el formato antiguo (lista) y el nuevo (por tipo de día)."""
    h = p["horas"]
    if isinstance(h, list):
        lst = h[:k]
    else:
        tipo = h.get("fin_de_semana" if day.weekday() >= 5 else "laborable") or {}
        lst = tipo.get(k) or tipo.get(str(k)) or []
    return [tuple(map(int, x.split(":"))) for x in lst]


def _all_hours(p: dict, day: dt.date, max_day: int) -> list[tuple[int, int]]:
    seen: list[tuple[int, int]] = []
    for k in range(1, max_day + 1):
        for x in _hours_for(p, day, k):
            if x not in seen:
                seen.append(x)
    return seen


def _far(h: tuple[int, int], used: set[tuple[int, int]], gap_min: int = 120) -> bool:
    m = h[0] * 60 + h[1]
    return all(abs(m - (u[0] * 60 + u[1])) >= gap_min for u in used)


def plan_slots(n: int, cfg: dict, queue: list[dict]) -> list[dt.datetime]:
    """Reparte n vídeos nuevos entre los días, respetando los que ya están programados.

    - Llena cada día hasta 2 vídeos antes de pasar al siguiente. Cuando los días del horizonte (7) tienen 2,
      añade un 3.º a cada uno. Si aún sobran, sigue por los días siguientes con 2 al día.
    - Las horas dependen del día (laborable / fin de semana) y de cuántos vídeos salen ese día.
    - Nunca más de `max_por_dia` (3) en un día, y separados al menos 2 horas entre sí.
    """
    p = cfg["publicacion"]
    tz = ZoneInfo(p["zona_horaria"])
    max_day = min(3, int(p.get("max_por_dia", 3)))
    horizon = int(p.get("dias_horizonte", 7))
    first_day = dt.datetime.now(tz).date() + dt.timedelta(days=1)

    taken: dict[dt.date, set[tuple[int, int]]] = {}
    for q in queue:
        if q.get("estado") in ("programado", "pendiente", "manual") and q.get("publish_at"):
            d = _parse(q["publish_at"]).astimezone(tz)
            if d.date() >= first_day:
                taken.setdefault(d.date(), set()).add((d.hour, d.minute))

    slots: list[dt.datetime] = []

    def fill(day: dt.date, cap: int) -> None:
        used = taken.setdefault(day, set())
        # Primero las horas ideales para "cap" vídeos ese día; si chocan con uno ya programado, otras horas buenas
        for h in _hours_for(p, day, cap) + _all_hours(p, day, max_day):
            if len(used) >= cap or len(slots) == n:
                return
            if h not in used and _far(h, used):
                used.add(h)
                slots.append(dt.datetime.combine(day, dt.time(*h), tz))

    # Orden de llenado: cada día hasta 2 vídeos antes de pasar al siguiente; cuando TODOS los días de la
    # semana tienen 2, se añade un 3.º a cada día (empezando por el más cercano). Si aún sobran, días siguientes a 2.
    days = [first_day + dt.timedelta(days=i) for i in range(horizon)]
    for day in days:
        if len(slots) == n:
            break
        fill(day, min(2, max_day))
    if max_day >= 3:
        for day in days:
            if len(slots) == n:
                break
            fill(day, 3)
    day = first_day + dt.timedelta(days=horizon)
    while len(slots) < n:
        fill(day, min(2, max_day))
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


PLAYLISTS = DATA / "playlists.json"
_KEYWORDS = [("Historias reales increíbles", r"historia|sobreviv|caso real|el hombre|la mujer|el médico|el pescador|récord"),
             ("Espacio y planeta Tierra", r"espacio|tierra|luna|sol\b|planeta|agujero negro|galaxia|astronaut|rayo|océano|volc"),
             ("Cuerpo humano", r"cuerpo|cerebro|coraz|sangre|dormir|sueño|envejec|herida|piel|cosquilla|dedo|brazo"),
             ("Animales y naturaleza", r"animal|tibur|dinosaur|perro|gato|pájaro|insect|selva|arenas movedizas|naturaleza"),
             ("Mitos y verdades", r"mito|verdad|mentira|películas|cine"),
             ("¿Qué pasaría si...?", r"qué pasaría|y si |qué pasa si")]


def lista_para(q: dict, cfg: dict) -> str | None:
    """Lista temática del vídeo: la que eligió el guionista o, si no, por palabras del título."""
    import re as _re  # noqa: PLC0415
    listas = cfg["publicacion"].get("listas") or []
    if not listas:
        return None
    if q.get("lista") in listas:
        return q["lista"]
    t = (q.get("title") or "").lower()
    for name, pat in _KEYWORDS:
        if name in listas and _re.search(pat, t):
            return name
    return "Ciencia curiosa" if "Ciencia curiosa" in listas else listas[0]


def ensure_playlist(yt, name: str) -> str | None:
    """Id de la lista de reproducción (la crea pública la primera vez). Nunca bloquea la publicación."""
    cache = read_json(PLAYLISTS, {})
    if cache.get(name):
        return cache[name]
    try:
        page = None
        while True:
            res = yt.playlists().list(part="snippet", mine=True, maxResults=50, pageToken=page).execute()
            for it in res.get("items", []):
                if it["snippet"]["title"].strip().lower() == name.lower():
                    cache[name] = it["id"]
            page = res.get("nextPageToken")
            if not page or cache.get(name):
                break
        if not cache.get(name):
            pl = yt.playlists().insert(part="snippet,status", body={"snippet": {"title": name, "description":
                 f"{name}: curiosidades contadas en menos de un minuto. Un vídeo lleva a otro 👀", "defaultLanguage": "es"},
                 "status": {"privacyStatus": "public"}}).execute()
            cache[name] = pl["id"]
            print(f"  lista creada: {name}")
        write_json(PLAYLISTS, cache)
        return cache[name]
    except Exception as e:  # noqa: BLE001
        print(f"  aviso: no se pudo preparar la lista «{name}» ({str(e)[:150]})")
        return None


def add_to_playlist(yt, vid: str, pid: str | None) -> str:
    if not pid:
        return ""
    try:
        yt.playlistItems().insert(part="snippet", body={"snippet": {"playlistId": pid, "resourceId": {"kind": "youtube#video", "videoId": vid}}}).execute()
        return "\n   📂 Añadido a su lista de reproducción"
    except Exception as e:  # noqa: BLE001
        return f"\n   ⚠️ No se pudo añadir a la lista ({str(e)[:120]})"


def backfill_playlists(queue: list[dict], cfg: dict) -> int:
    """Añade a su lista los vídeos ya subidos (programados o publicados) que aún no están en ninguna. Nunca bloquea."""
    todo = [q for q in queue if q.get("youtube_id") and q.get("estado") in ("programado", "publicado") and not q.get("lista_ok")]
    if not todo or not cfg["publicacion"].get("listas") or not cfg["publicacion"].get("subir_por_api", True):
        return 0
    try:
        yt = youtube_client()
    except Exception as e:  # noqa: BLE001
        print(f"  aviso: listas: {str(e)[:120]}")
        return 0
    n = 0
    for q in todo[:20]:  # poco a poco para no gastar la cuota diaria
        lista = lista_para(q, cfg)
        msg = add_to_playlist(yt, q["youtube_id"], ensure_playlist(yt, lista) if lista else None)
        if "Añadido" in msg:
            q.update(lista=lista, lista_ok=True); n += 1
            print(f"  {q['id']} -> lista «{lista}»")
    return n


def set_thumbnail(yt, vid: str, q: dict, tmp: Path) -> str:
    """Sube la portada propia del vídeo como miniatura. Nunca bloquea la publicación si falla."""
    if not q.get("portada"):
        return ""
    try:
        from googleapiclient.http import MediaFileUpload  # noqa: PLC0415

        img = tmp / q["portada"]
        if not img.exists():
            gh("release", "download", q["tag"], "--pattern", q["portada"], "--dir", str(tmp), "--clobber")
        yt.thumbnails().set(videoId=vid, media_body=MediaFileUpload(str(img), mimetype="image/jpeg")).execute()
        q["portada_ok"] = True
        return "\n   🖼️ Portada propia puesta"
    except Exception as e:  # noqa: BLE001
        msg = str(e)
        q["portada_ok"] = False
        if "forbidden" in msg.lower() or "403" in msg:
            return ("\n   ⚠️ YouTube no dejó poner la portada propia: para miniaturas personalizadas el canal tiene que estar "
                    "**verificado por teléfono** (youtube.com/verify). Mientras, YouTube usa un fotograma del vídeo.")
        return f"\n   ⚠️ No se pudo poner la portada ({msg[:150]})"


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
            lista = lista_para(q, cfg)
            pid = ensure_playlist(yt, lista) if lista else None
            if pid and "playlist?list=" not in q["description"]:  # enlace a más vídeos del mismo tema (tiempo de sesión)
                q["description"] = q["description"].rstrip() + f"\n\n▶️ Más de «{lista}»: https://www.youtube.com/playlist?list={pid}"
            vid = upload(yt, q, path, cfg)
            q.update(estado="programado", youtube_id=vid, lista=lista)
            pl_msg = add_to_playlist(yt, vid, pid)
            q["lista_ok"] = "Añadido" in pl_msg
            portada_msg = set_thumbnail(yt, vid, q, tmp) + pl_msg
            local = dt.datetime.fromisoformat(q["publish_at"].replace("Z", "+00:00")).astimezone(ZoneInfo(cfg["publicacion"]["zona_horaria"]))
            dias = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]
            cuando = f"{dias[local.weekday()]} {local:%d/%m} a las {local:%H:%M}"
            report.append(
                f"✅ **{q['title']}**\n   📅 Se publica el **{cuando}** · [ver](https://youtu.be/{vid}) · "
                f"[abrir en YouTube Studio](https://studio.youtube.com/video/{vid}/edit)" + portada_msg
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


def sync_youtube(queue: list[dict], cfg: dict) -> int:
    """Mira en YouTube qué vídeos "programados" ya están públicos (publicados antes de tiempo, a mano) o se han
    borrado, y libera su hueco en el calendario. Devuelve cuántos ha cambiado. Nunca bloquea la programación."""
    if not cfg["publicacion"].get("subir_por_api", True):
        return 0
    now = dt.datetime.now(dt.timezone.utc)
    future = [q for q in queue if q.get("estado") == "programado" and q.get("youtube_id") and q.get("publish_at")
              and _parse(q["publish_at"]) > now]
    if not future:
        return 0
    try:
        yt = youtube_client()
        status = {}
        for i in range(0, len(future), 50):
            res = yt.videos().list(part="status", id=",".join(q["youtube_id"] for q in future[i:i + 50])).execute()
            status.update({it["id"]: it["status"].get("privacyStatus") for it in res.get("items", [])})
    except Exception as e:  # noqa: BLE001
        print(f"  aviso: no se pudo revisar el estado en YouTube ({str(e)[:150]})")
        return 0
    changed = 0
    for q in future:
        st = status.get(q["youtube_id"])
        if st in ("public", "unlisted") or st is None:
            q["fecha_prevista"] = q["publish_at"]
            q["publish_at"] = _iso(now)
            q["estado"] = "publicado" if st else "no_encontrado"
            changed += 1
            print(f"  {q['id']}: {'ya está publicado' if st else 'ya no está en YouTube'} -> se libera su hueco del {q['fecha_prevista'][:10]}")
    return changed


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--issue", type=int, help="número del issue de revisión cerrado")
    args = ap.parse_args()
    cfg = load_config()
    queue = read_json(QUEUE, [])
    if sync_youtube(queue, cfg):  # huecos liberados por vídeos publicados antes de tiempo
        write_json(QUEUE, queue)
    if backfill_playlists(queue, cfg):  # vídeos ya subidos que aún no están en su lista temática
        write_json(QUEUE, queue)

    if args.issue:
        body = json.loads(gh("issue", "view", str(args.issue), "--json", "body"))["body"]
        wid, ids = approved_from_issue(body)
        week = read_json(DATA / "weeks" / f"{wid}.json") if wid else None
        if not week:
            sys.exit(f"No encuentro los datos de la semana {wid}")
        motivos = motivos_descarte(args.issue)
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
                    if h["id"] in motivos and not h["aprobado"]:
                        h["motivo"] = motivos[h["id"]]
            write_json(path, hist)
        if not chosen:
            gh("issue", "comment", str(args.issue), "--body", "🗑️ Descartado (o ya estaba programado). Si querías publicarlo, pulsa **Reopen issue**, marca la casilla y vuelve a cerrarlo.")
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
