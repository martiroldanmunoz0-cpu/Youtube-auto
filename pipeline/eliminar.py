"""Elimina un vídeo programado que aún NO se ha publicado (botón «Eliminar» del calendario del panel).

Uso: python pipeline/eliminar.py --id historia-1-01
- Si ya está subido a YouTube como privado/programado, lo borra de YouTube.
- Si ya es público, NO toca nada (por seguridad) y avisa.
- Lo quita de la cola (su hueco del calendario queda libre) y lo apunta en data/eliminados.json.
"""
from __future__ import annotations

import argparse
import datetime as dt
import sys

from common import DATA, read_json, write_json, youtube_client

QUEUE = DATA / "queue.json"
LOG = DATA / "eliminados.json"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--id", required=True)
    ap.add_argument("--aunque_publico", action="store_true", help="borrarlo aunque ya sea público (solo si el dueño lo pide, p. ej. al sustituirlo por una versión rehecha)")
    a = ap.parse_args()
    queue = read_json(QUEUE, [])
    item = next((q for q in queue if q["id"] == a.id), None)
    if not item:
        sys.exit(f"No encuentro el vídeo {a.id} en la cola")
    now = dt.datetime.now(dt.timezone.utc)
    if not a.aunque_publico and item.get("estado") == "publicado" or not a.aunque_publico and (item.get("publish_at") and item.get("youtube_id")
                                             and dt.datetime.fromisoformat(item["publish_at"].replace("Z", "+00:00")) <= now):
        sys.exit("Ese vídeo ya se ha publicado: no se elimina desde aquí (bórralo en YouTube Studio si de verdad quieres)")
    if item.get("youtube_id"):
        from googleapiclient.errors import HttpError  # noqa: PLC0415

        yt = youtube_client()
        info = yt.videos().list(part="status", id=item["youtube_id"]).execute().get("items", [])
        if info and not a.aunque_publico and info[0]["status"].get("privacyStatus") in ("public", "unlisted"):
            item["estado"] = "publicado"
            write_json(QUEUE, queue)
            sys.exit("En YouTube ya es público: no se elimina (por seguridad). Se marca como publicado.")
        if info:
            try:
                yt.videos().delete(id=item["youtube_id"]).execute()
            except HttpError as e:
                if "insufficient" in str(e).lower() or "403" in str(e):
                    sys.exit("YouTube no dejó borrarlo: hace falta el permiso «Gestionar tu cuenta de YouTube» (pídeselo a Claude). " + str(e)[:200])
                raise
            print(f"Borrado de YouTube: {item['youtube_id']}")
        else:
            print("En YouTube ya no existía; solo se quita de la cola")
    queue.remove(item)
    write_json(QUEUE, queue)
    log = read_json(LOG, [])
    log.append({**item, "eliminado": now.strftime("%Y-%m-%dT%H:%M:%SZ")})
    write_json(LOG, log)
    print(f"{a.id} eliminado: su hueco del calendario queda libre")


if __name__ == "__main__":
    main()
