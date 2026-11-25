"""Retención de cada vídeo publicado (YouTube Analytics) cruzada con su guion, y lecciones para los próximos guiones.

Uso: python pipeline/retencion.py
- Para cada vídeo publicado hace más de 2 días: curva de retención (qué % sigue viendo en cada punto del vídeo),
  vistas, duración media vista y % medio visto. Lo guarda en data/retencion/<id>.json.
- Cruza la curva con los tiempos de cada frase (data/tiempos/<id>.json, o estimados por palabras) para saber en QUÉ
  FRASE se va la gente.
- Claude resume lo aprendido en data/retencion/lecciones.json; scripts.py lo añade al escribir guiones nuevos.
No gasta API de YouTube de pago (Analytics es gratis); Claude: unos céntimos por semana.
"""
from __future__ import annotations

import datetime as dt
import json
import os
import re
import sys

from common import DATA, load_config, read_json, write_json

OUT = DATA / "retencion"


def _creds():
    from google.oauth2.credentials import Credentials  # noqa: PLC0415

    return Credentials(token=None, refresh_token=os.environ["YT_REFRESH_TOKEN"], client_id=os.environ["YT_CLIENT_ID"],
                       client_secret=os.environ["YT_CLIENT_SECRET"], token_uri="https://oauth2.googleapis.com/token", scopes=None)


def _segundos(iso: str) -> float:
    m = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", iso or "")
    return sum(int(x or 0) * k for x, k in zip(m.groups(), (3600, 60, 1))) if m else 0.0


def _tiempos(vid: str, dur: float) -> list[dict] | None:
    t = read_json(DATA / "tiempos" / f"{vid}.json")
    if t:
        return t
    g = read_json(DATA / "guiones" / f"{vid}.json")
    if not g or not g.get("beats"):
        return None
    n = [max(1, len(b["text"].split())) for b in g["beats"]]
    util = max(1.0, dur - (6.0 if vid.startswith("largo-") else 3.0))
    acc, out = 0, []
    for b, k in zip(g["beats"], n):
        out.append({"start": util * acc / sum(n), "end": util * (acc + k) / sum(n), "text": b["text"], "estimado": True})
        acc += k
    return out


def analizar(yta, yid: str, vid: str, dur: float, desde: str, hasta: str) -> dict | None:
    base = dict(ids="channel==MINE", startDate=desde, endDate=hasta, filters=f"video=={yid}")
    tot = yta.reports().query(metrics="views,averageViewDuration,averageViewPercentage", **base).execute().get("rows") or []
    if not tot or not tot[0][0]:
        return None
    curva = yta.reports().query(metrics="audienceWatchRatio,relativeRetentionPerformance", dimensions="elapsedVideoTimeRatio",
                                **base).execute().get("rows") or []
    puntos = [(float(r[0]), float(r[1]), float(r[2])) for r in curva]  # (fracción del vídeo, ratio, vs. vídeos parecidos)
    res = {"id": vid, "youtube_id": yid, "duracion": dur, "vistas": int(tot[0][0]), "media_vista_s": float(tot[0][1]),
           "pct_visto": float(tot[0][2]), "curva": [[round(x, 2), round(r, 3)] for x, r, _ in puntos],
           "vs_parecidos": round(sum(p for *_, p in puntos) / len(puntos), 3) if puntos else None,
           "actualizado": hasta}
    tm = _tiempos(vid, dur)
    if puntos and tm and dur:
        def ret(sec: float) -> float:
            x = min(1.0, max(0.0, sec / dur))
            return min(puntos, key=lambda p: abs(p[0] - x))[1]
        res["gancho"] = {"seg": min(30.0, dur * 0.25), "queda": round(ret(min(30.0, dur * 0.25)), 3)}
        caidas = []
        for i, b in enumerate(tm):
            a, z = ret(b["start"]), ret(b["end"])
            if b["end"] - b["start"] > 0.5:
                caidas.append({"plano": i, "texto": b["text"], "seg": round(b["start"], 1), "pierde": round(a - z, 3)})
        res["peores_frases"] = sorted(caidas, key=lambda c: -c["pierde"])[:5]
        res["mejores_frases"] = [c for c in sorted(caidas, key=lambda c: c["pierde"])[:3] if c["pierde"] <= 0]
    return res


def lecciones(datos: list[dict], cfg: dict) -> None:
    import anthropic  # noqa: PLC0415

    import gasto  # noqa: PLC0415

    resumen = [{k: d.get(k) for k in ("id", "titulo", "duracion", "vistas", "pct_visto", "media_vista_s", "vs_parecidos", "gancho",
                                      "peores_frases", "mejores_frases")} for d in datos]
    prompt = (
        "Eres analista de retención de un canal de YouTube de curiosidades animadas (inglés, EE. UU.). Ids 'largo-' son "
        "vídeos de 8-10 min; el resto son Shorts. Estos son los datos REALES de retención de sus vídeos, con las frases "
        "del guion en las que más gente se fue (pierde = fracción de audiencia perdida en esa frase) y en las que no se fue nadie:\n"
        f"{json.dumps(resumen, ensure_ascii=False)}\n\n"
        "Saca como máximo 8 lecciones CONCRETAS y accionables para el guionista (qué tipo de frase hace que se vayan, qué "
        "aguanta, cómo debe ser el gancho de los primeros 30 s, ritmo, cuándo meter mini-ganchos). Cada una en una línea, "
        "en español, citando un ejemplo real entre comillas. Separa 'LARGOS:' y 'SHORTS:' si hay datos de ambos. "
        "Si hay pocos datos, dilo y da solo lo que esté claro. Sin introducción."
    )
    model = (cfg.get("generacion") or {}).get("modelo_analisis", "claude-opus-5-5")
    r = anthropic.Anthropic().messages.create(model=model, max_tokens=2500, messages=[{"role": "user", "content": prompt}],
                                              output_config={"effort": "low"})
    gasto.anthropic(r.model, r.usage, que="lecciones de retención")
    texto = "".join(b.text for b in r.content if b.type == "text").strip()
    write_json(OUT / "lecciones.json", {"actualizado": dt.date.today().isoformat(), "videos": len(datos), "texto": texto})
    print("\nLecciones:\n" + texto)


def main() -> None:
    from googleapiclient.discovery import build  # noqa: PLC0415

    cfg = load_config()
    creds = _creds()
    yt = build("youtube", "v3", credentials=creds, cache_discovery=False)
    yta = build("youtubeAnalytics", "v2", credentials=creds, cache_discovery=False)
    hoy = dt.datetime.now(dt.timezone.utc)
    queue = read_json(DATA / "queue.json", []) or []
    pubs = [q for q in queue if q.get("youtube_id") and q.get("publish_at")
            and dt.datetime.fromisoformat(q["publish_at"].replace("Z", "+00:00")) < hoy - dt.timedelta(days=2)]
    if not pubs:
        print("Aún no hay vídeos publicados hace más de 2 días")
        return
    info = {}
    for i in range(0, len(pubs), 50):
        for v in yt.videos().list(part="contentDetails,snippet", id=",".join(q["youtube_id"] for q in pubs[i:i + 50])).execute().get("items", []):
            info[v["id"]] = v
    datos = []
    for q in pubs:
        v = info.get(q["youtube_id"])
        if not v:
            continue
        dur = _segundos(v["contentDetails"]["duration"])
        try:
            d = analizar(yta, q["youtube_id"], q["id"], dur, q["publish_at"][:10], hoy.date().isoformat())
        except Exception as e:  # noqa: BLE001
            msg = str(e)
            if "insufficient" in msg.lower() or "403" in msg or "has not been used" in msg or "disabled" in msg:
                sys.exit("YouTube no deja leer las estadísticas: hay que activar «YouTube Analytics API» en el proyecto de "
                         f"Google Cloud o volver a autorizar el canal ({msg[:300]})")
            print(f"  aviso {q['id']}: {msg[:200]}")
            continue
        if not d:
            print(f"  {q['id']}: aún sin datos")
            continue
        d["titulo"] = v["snippet"]["title"]
        write_json(OUT / f"{q['id']}.json", d)
        datos.append(d)
        print(f"  {q['id']}: {d['vistas']} vistas · {d['pct_visto']:.0f}% visto · {d['media_vista_s']:.0f}s de media")
    if datos:
        lecciones(datos, cfg)


if __name__ == "__main__":
    main()
