"""Cambia el día y la hora de publicación de un vídeo programado (botón del calendario del panel).

Uso: python pipeline/reprogramar.py --id historia-1-01 --fecha 2026-11-25 --hora 20:30   (hora de España)
- Si el vídeo ya está subido a YouTube, cambia su "publishAt" (necesita el permiso "youtube" en el token).
- Si aún no se ha subido (pendiente), solo cambia la fecha en la cola.
"""
from __future__ import annotations

import argparse
import datetime as dt
import sys
from zoneinfo import ZoneInfo

from common import DATA, load_config, read_json, write_json, youtube_client

QUEUE = DATA / "queue.json"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--id", required=True)
    ap.add_argument("--fecha", required=True, help="AAAA-MM-DD (hora de España)")
    ap.add_argument("--hora", required=True, help="HH:MM (hora de España)")
    a = ap.parse_args()
    cfg = load_config()
    tz = ZoneInfo(cfg["publicacion"]["zona_horaria"])
    try:
        local = dt.datetime.strptime(f"{a.fecha} {a.hora}", "%Y-%m-%d %H:%M").replace(tzinfo=tz)
    except ValueError:
        sys.exit(f"Fecha u hora no válidas: {a.fecha} {a.hora}")
    when = local.astimezone(dt.timezone.utc)
    if when < dt.datetime.now(dt.timezone.utc) + dt.timedelta(minutes=15):
        sys.exit("La nueva fecha tiene que ser al menos 15 minutos en el futuro")

    queue = read_json(QUEUE, [])
    item = next((q for q in queue if q["id"] == a.id), None)
    if not item:
        sys.exit(f"No encuentro el vídeo {a.id} en la cola")
    old = item.get("publish_at")
    if old and dt.datetime.fromisoformat(old.replace("Z", "+00:00")) <= dt.datetime.now(dt.timezone.utc):
        sys.exit("Ese vídeo ya se ha publicado: no se puede cambiar su fecha")
    iso = when.strftime("%Y-%m-%dT%H:%M:%SZ")

    if item.get("youtube_id"):
        from googleapiclient.errors import HttpError  # noqa: PLC0415

        yt = youtube_client()
        # Si ya está publicado (público) en YouTube, no se cambia nada: se marca como publicado y listo.
        info = yt.videos().list(part="status", id=item["youtube_id"]).execute().get("items", [])
        status = info[0]["status"] if info else {}
        if not info or status.get("privacyStatus") in ("public", "unlisted"):
            item["estado"] = "publicado" if info else "no_encontrado"
            if dt.datetime.fromisoformat(item["publish_at"].replace("Z", "+00:00")) > dt.datetime.now(dt.timezone.utc):
                item["publish_at"] = dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
            write_json(QUEUE, queue)
            print(f"{a.id}: ya está {'publicado' if info else 'fuera de YouTube'} ({status.get('privacyStatus', '?')}); no se cambia nada")
            return
        try:
            yt.videos().update(part="status", body={"id": item["youtube_id"], "status": {
                "privacyStatus": "private", "publishAt": iso, "selfDeclaredMadeForKids": False}}).execute()
        except HttpError as e:
            msg = str(e)
            if "invalidPublishAt" in msg:
                sys.exit("YouTube no acepta esa fecha para este vídeo (¿ya no está programado como privado?). " + msg[:200])
            if "insufficient" in msg.lower() or "403" in msg:
                sys.exit("YouTube no dejó cambiar la fecha: hace falta volver a conectar el canal con el permiso "
                         "«Gestionar tu cuenta de YouTube» (pídeselo a Claude). " + msg[:200])
            raise
        print(f"YouTube actualizado: {item['youtube_id']}")
    item["publish_at"] = iso
    item["reprogramado"] = True
    write_json(QUEUE, queue)
    print(f"{a.id}: {old} -> {iso} ({local:%d/%m %H:%M} en España)")


if __name__ == "__main__":
    main()
