"""Busca vídeos DUPLICADOS en el canal (mismo título) y borra las copias sobrantes, dejando uno.

Se ejecuta solo después de cada subida (publicar.yml). Cuál se queda: el que está apuntado en la cola (data/queue.json);
si ninguno lo está, el más antiguo. Nunca borra el único vídeo de un título.
Uso: python pipeline/duplicados.py [--simular]
"""
from __future__ import annotations

import argparse
import datetime as dt
from collections import defaultdict

from common import DATA, read_json, write_json, youtube_client


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--simular", action="store_true", help="solo dice qué borraría")
    a = ap.parse_args()
    yt = youtube_client()
    ch = yt.channels().list(part="contentDetails", mine=True).execute()["items"][0]
    up = ch["contentDetails"]["relatedPlaylists"]["uploads"]
    ids, tok = [], None
    while True:
        r = yt.playlistItems().list(part="contentDetails", playlistId=up, maxResults=50, pageToken=tok).execute()
        ids += [i["contentDetails"]["videoId"] for i in r.get("items", [])]
        tok = r.get("nextPageToken")
        if not tok or len(ids) >= 500:
            break
    vids = []
    for i in range(0, len(ids), 50):
        vids += yt.videos().list(part="snippet,status", id=",".join(ids[i:i + 50])).execute().get("items", [])
    queue = read_json(DATA / "queue.json", [])
    en_cola = {q.get("youtube_id") for q in queue if q.get("youtube_id")}
    grupos = defaultdict(list)
    for v in vids:
        grupos[v["snippet"]["title"].strip().lower()].append(v)
    borrados = []
    for vs in grupos.values():
        if len(vs) < 2:
            continue
        vs.sort(key=lambda v: (v["id"] not in en_cola, v["snippet"]["publishedAt"]))
        queda = vs[0]
        for v in vs[1:]:
            print(f"Duplicado: {v['id']} ({v['status'].get('privacyStatus')}) «{v['snippet']['title']}» — se queda {queda['id']}")
            if not a.simular:
                yt.videos().delete(id=v["id"]).execute()
                borrados.append({"youtube_id": v["id"], "titulo": v["snippet"]["title"], "se_queda": queda["id"],
                                 "eliminado": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), "motivo": "duplicado"})
    if borrados:
        log = read_json(DATA / "eliminados.json", [])
        write_json(DATA / "eliminados.json", log + borrados)
    print(f"{len(borrados)} duplicado(s) borrado(s)" if borrados or not a.simular else "simulación hecha")


if __name__ == "__main__":
    main()
