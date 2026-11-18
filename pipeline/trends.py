"""Paso 1: analiza qué Shorts están funcionando esta semana en YouTube.

Usa la API oficial de YouTube (sin scraping):
  - "Tendencias" (chart=mostPopular) de cada país configurado
  - búsquedas amplias ordenadas por visualizaciones de los últimos N días
Filtra a Shorts (<= duracion_max_seg) y ordena por visualizaciones por día.
"""
from __future__ import annotations

import datetime as dt
import re
import sys

from common import load_config, week_dir, week_id, write_json, youtube_client


def iso_duration_to_s(d: str) -> int:
    m = re.match(r"P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", d or "")
    if not m:
        return 0
    days, h, mi, s = (int(x or 0) for x in m.groups())
    return days * 86400 + h * 3600 + mi * 60 + s


def collect(yt, cfg) -> list[dict]:
    a = cfg["analisis"]
    since = (dt.datetime.utcnow() - dt.timedelta(days=a["dias"])).replace(microsecond=0).isoformat() + "Z"
    ids: dict[str, str] = {}

    for q in a["busquedas"]:
        try:
            res = yt.search().list(
                part="id", q=q, type="video", videoDuration="short", order="viewCount",
                publishedAfter=since, relevanceLanguage=cfg["canal"]["idioma"], maxResults=50,
            ).execute()
            for it in res.get("items", []):
                ids.setdefault(it["id"]["videoId"], f"búsqueda: {q}")
        except Exception as e:  # una búsqueda fallida no debe parar el análisis
            print(f"  aviso: búsqueda '{q}' falló: {e}", file=sys.stderr)

    trending: list[dict] = []
    for region in a["regiones"]:
        try:
            res = yt.videos().list(part="id", chart="mostPopular", regionCode=region, maxResults=50).execute()
            for it in res.get("items", []):
                ids.setdefault(it["id"], f"tendencias {region}")
        except Exception as e:
            print(f"  aviso: tendencias {region} falló: {e}", file=sys.stderr)

    videos = []
    id_list = list(ids)
    for i in range(0, len(id_list), 50):
        res = yt.videos().list(part="snippet,statistics,contentDetails", id=",".join(id_list[i:i + 50])).execute()
        for v in res.get("items", []):
            dur = iso_duration_to_s(v["contentDetails"].get("duration"))
            if dur == 0 or dur > a["duracion_max_seg"]:
                continue
            st = v.get("statistics", {})
            views = int(st.get("viewCount", 0))
            published = dt.datetime.fromisoformat(v["snippet"]["publishedAt"].replace("Z", "+00:00"))
            age_days = max(0.25, (dt.datetime.now(dt.timezone.utc) - published).total_seconds() / 86400)
            likes = int(st.get("likeCount", 0))
            comments = int(st.get("commentCount", 0))
            videos.append({
                "id": v["id"],
                "url": f"https://www.youtube.com/shorts/{v['id']}",
                "origen": ids[v["id"]],
                "titulo": v["snippet"]["title"],
                "canal": v["snippet"]["channelTitle"],
                "descripcion": (v["snippet"].get("description") or "")[:400],
                "tags": (v["snippet"].get("tags") or [])[:12],
                "idioma": v["snippet"].get("defaultAudioLanguage") or v["snippet"].get("defaultLanguage"),
                "duracion_s": dur,
                "vistas": views,
                "vistas_por_dia": round(views / age_days),
                "likes_pct": round(100 * likes / views, 2) if views else 0,
                "comentarios_pct": round(100 * comments / views, 3) if views else 0,
                "dias": round(age_days, 1),
            })
    videos.sort(key=lambda x: x["vistas_por_dia"], reverse=True)
    return videos


def main():
    cfg = load_config()
    wid = week_id()
    yt = youtube_client()
    videos = collect(yt, cfg)
    top = videos[: cfg["analisis"]["top_videos"]]
    out = week_dir(wid) / "trends.json"
    write_json(out, {"semana": wid, "fecha": dt.date.today().isoformat(), "total_analizados": len(videos), "top": top})
    print(f"Tendencias: {len(videos)} Shorts analizados, top {len(top)} guardados en {out}")


if __name__ == "__main__":
    main()
