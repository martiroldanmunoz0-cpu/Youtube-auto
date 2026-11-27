"""Comparación con otros canales del mismo nicho (benchmark), mientras el canal propio tiene pocos datos.

Uso: python pipeline/competencia.py
- Elige canales de referencia del nicho (config competencia.canales fijos + descubiertos por búsqueda; se renuevan cada
  4 semanas para poder comparar en el tiempo): sobre todo canales PEQUEÑOS/MEDIANOS que están creciendo y algún grande.
- De cada uno mira sus últimos 30 vídeos con la API oficial (estadísticas públicas): frecuencia de subida, % Shorts,
  vistas medianas, vistas/suscriptor, likes y comentarios, duración, cómo son sus títulos y qué vídeos se salen de su media.
- Lo compara con el canal propio y Claude dice en qué nos diferenciamos y qué PROBAR. Solo patrones de formato y estilo:
  nunca copiar temas, títulos ni contenido de otros.
- Guarda data/competencia/<fecha>.json, ultimo.json y ultimo.md (rendimiento.py lo usa en la revisión).
Coste: ~500 unidades de cuota cada 4 semanas (búsquedas) y ~40 por semana; Claude, céntimos.
"""
from __future__ import annotations

import datetime as dt
import json
import re
import statistics as st
import sys
from collections import defaultdict

from common import DATA, load_config, read_json, write_json, youtube_client
from trends import iso_duration_to_s

OUT = DATA / "competencia"
BUSQUEDAS = ["what if animated", "animated science explained", "weird facts animated", "history mysteries explained",
             "space facts animated"]


def _med(xs: list[float]) -> float:
    return round(st.median(xs), 1) if xs else 0.0


def descubrir(yt, cfg: dict, propio: str) -> list[dict]:
    c = cfg.get("competencia") or {}
    elegidos: dict[str, str] = {}
    for h in c.get("canales") or []:
        try:
            r = yt.channels().list(part="id", forHandle=h.lstrip("@")).execute().get("items") or []
            if r:
                elegidos[r[0]["id"]] = "fijo"
        except Exception as e:  # noqa: BLE001
            print(f"  aviso: canal {h}: {e}", file=sys.stderr)
    desde = (dt.datetime.utcnow() - dt.timedelta(days=60)).replace(microsecond=0).isoformat() + "Z"
    vistos: dict[str, int] = defaultdict(int)
    for q in c.get("busquedas") or BUSQUEDAS:
        try:
            r = yt.search().list(part="snippet", q=q, type="video", order="viewCount", publishedAfter=desde,
                                 relevanceLanguage="en", maxResults=50).execute()
            for it in r.get("items", []):
                vistos[it["snippet"]["channelId"]] += 1
        except Exception as e:  # noqa: BLE001
            print(f"  aviso: búsqueda '{q}': {e}", file=sys.stderr)
    cand = [k for k in sorted(vistos, key=lambda k: -vistos[k]) if k != propio and k not in elegidos][:50]
    subs = {}
    for i in range(0, len(cand), 50):
        for ch in yt.channels().list(part="statistics", id=",".join(cand[i:i + 50])).execute().get("items", []):
            subs[ch["id"]] = int(ch["statistics"].get("subscriberCount") or 0)
    n = int(c.get("n_canales", 8))
    peq = [k for k in cand if 1_000 <= subs.get(k, 0) < 300_000][: max(1, n - 3)]  # parecidos que están creciendo
    gra = [k for k in cand if subs.get(k, 0) >= 300_000][:3]                       # referentes del nicho
    for k in peq:
        elegidos.setdefault(k, "parecido")
    for k in gra:
        elegidos.setdefault(k, "referente")
    return [{"id": k, "tipo": t} for k, t in elegidos.items()]


def perfil(yt, cid: str | None = None) -> dict | None:
    kw = {"id": cid} if cid else {"mine": True}
    ch = (yt.channels().list(part="snippet,statistics,contentDetails", **kw).execute().get("items") or [None])[0]
    if not ch:
        return None
    up = ch["contentDetails"]["relatedPlaylists"]["uploads"]
    ids = [it["contentDetails"]["videoId"] for it in
           yt.playlistItems().list(part="contentDetails", playlistId=up, maxResults=30).execute().get("items", [])]
    vids = []
    if ids:
        for v in yt.videos().list(part="snippet,statistics,contentDetails", id=",".join(ids)).execute().get("items", []):
            s = v.get("statistics", {})
            pub = dt.datetime.fromisoformat(v["snippet"]["publishedAt"].replace("Z", "+00:00"))
            vids.append({"titulo": v["snippet"]["title"], "vistas": int(s.get("viewCount", 0)), "likes": int(s.get("likeCount", 0)),
                         "coment": int(s.get("commentCount", 0)), "dur": iso_duration_to_s(v["contentDetails"]["duration"]),
                         "pub": pub, "dias": max(0.5, (dt.datetime.now(dt.timezone.utc) - pub).total_seconds() / 86400)})
    subs = int(ch["statistics"].get("subscriberCount") or 0)
    p = {"canal": ch["snippet"]["title"], "id": ch["id"], "suscriptores": subs, "videos_totales": int(ch["statistics"].get("videoCount") or 0),
         "analizados": len(vids)}
    if not vids:
        return p
    vids.sort(key=lambda v: v["pub"])
    semanas = max(1.0, (vids[-1]["pub"] - vids[0]["pub"]).days / 7)
    sh = [v for v in vids if v["dur"] <= 180]
    lg = [v for v in vids if v["dur"] > 180]
    med = _med([v["vistas"] for v in vids]) or 1
    tot = max(1, sum(v["vistas"] for v in vids))
    tits = [v["titulo"] for v in vids]
    p.update({
        "subidas_por_semana": round(len(vids) / semanas, 1),
        "pct_shorts": round(100 * len(sh) / len(vids)),
        "vistas_mediana": med, "vistas_mediana_shorts": _med([v["vistas"] for v in sh]), "vistas_mediana_largos": _med([v["vistas"] for v in lg]),
        "vistas_por_sub": round(med / subs, 2) if subs else None,
        "likes_pct": round(100 * sum(v["likes"] for v in vids) / tot, 2), "coment_pct": round(100 * sum(v["coment"] for v in vids) / tot, 3),
        "duracion_mediana_largos_s": _med([v["dur"] for v in lg]), "duracion_mediana_shorts_s": _med([v["dur"] for v in sh]),
        "titulos": {"largo_medio": round(sum(map(len, tits)) / len(tits)),
                    "pct_pregunta": round(100 * sum("?" in t for t in tits) / len(tits)),
                    "pct_numero": round(100 * sum(bool(re.search(r"\d", t)) for t in tits) / len(tits)),
                    "pct_mayusculas": round(100 * sum(bool(re.search(r"\b[A-Z]{3,}\b", t)) for t in tits) / len(tits)),
                    "pct_what_if": round(100 * sum(t.lower().startswith("what if") for t in tits) / len(tits))},
        "se_salen": [{"titulo": v["titulo"], "vistas": v["vistas"], "x_mediana": round(v["vistas"] / med, 1), "dur_s": v["dur"],
                      "tipo": "short" if v["dur"] <= 180 else "largo"} for v in sorted(vids, key=lambda v: -v["vistas"])[:3] if v["vistas"] >= 3 * med],
        "flojos": [{"titulo": v["titulo"], "vistas": v["vistas"], "tipo": "short" if v["dur"] <= 180 else "largo"}
                   for v in sorted(vids, key=lambda v: v["vistas"])[:2]],
    })
    return p


def analizar(propio: dict, otros: list[dict], cfg: dict) -> dict:
    import anthropic  # noqa: PLC0415

    import gasto  # noqa: PLC0415

    prev = (read_json(OUT / "ultimo.json") or {}).get("analisis")
    prompt = (
        "Eres analista de datos de YouTube. Canal propio (curiosidades animadas en inglés para EE. UU., aún pequeño y sin "
        "vídeos virales) frente a canales del mismo nicho ('parecido' = tamaño pequeño/medio que está creciendo; 'referente' = grande). "
        "Estadísticas públicas de sus últimos 30 vídeos; 'se_salen' = vídeos con 3x o más vistas que la mediana de su canal.\n"
        f"PROPIO: {json.dumps(propio, ensure_ascii=False, default=str)}\n\nOTROS: {json.dumps(otros, ensure_ascii=False, default=str)}\n\n"
        + (f"Conclusiones de la comparación anterior (confírmalas o corrígelas):\n{json.dumps(prev, ensure_ascii=False)}\n\n" if prev else "")
        + "REGLAS: compara cifras y saca PATRONES de formato y empaquetado (frecuencia, duración, Shorts vs largos, cómo se "
        "construyen los títulos, qué tipo de ángulo se sale de la media). NUNCA propongas copiar sus temas, títulos, personajes ni "
        "contenido: si das ejemplos, inventa ejemplos propios con temas distintos. Sé concreto y cita cifras. En español. "
        "Responde SOLO un JSON:\n"
        '{"posicion": "2-4 frases: dónde está el canal frente a los parecidos",\n'
        ' "diferencias": [{"metrica": "...", "nosotros": "...", "ellos": "mediana de los parecidos", "que_hacer": "..."}],\n'
        ' "patrones_virales": ["qué tienen en común los vídeos que se salen de la media (formato/empaquetado, no temas concretos)"],\n'
        ' "pruebas": ["máx. 4 pruebas para las próximas semanas, cada una con qué medir para saber si funciona"],\n'
        ' "para_guiones": {"largos": "máx. 4 líneas", "shorts": "máx. 4 líneas"}}'
    )
    model = (cfg.get("generacion") or {}).get("modelo_analisis", "claude-opus-5-5")
    r = anthropic.Anthropic().messages.create(model=model, max_tokens=4000, messages=[{"role": "user", "content": prompt}],
                                              output_config={"effort": "low"})
    gasto.anthropic(r.model, r.usage, que="comparación con otros canales")
    texto = "".join(b.text for b in r.content if b.type == "text").strip()
    m = re.search(r"\{.*\}", texto, re.S)
    try:
        return json.loads(m.group(0)) if m else {"posicion": texto}
    except json.JSONDecodeError:
        return {"posicion": texto}


def informe_md(propio: dict, otros: list[dict], an: dict) -> str:
    def fila(p: dict, tipo: str) -> str:
        return (f"| {p['canal'][:30]} | {tipo} | {p['suscriptores']:,} | {p.get('subidas_por_semana', '—')} | {p.get('pct_shorts', '—')}% "
                f"| {p.get('vistas_mediana_shorts', 0):,.0f} | {p.get('vistas_mediana_largos', 0):,.0f} | {p.get('vistas_por_sub', '—')} "
                f"| {p.get('likes_pct', '—')}% |").replace(",", ".")
    L = [f"# Comparación con otros canales ({dt.date.today().isoformat()})", "",
         "| Canal | Tipo | Subs | Subidas/sem | % Shorts | Vistas med. Shorts | Vistas med. largos | Vistas/sub | Likes |",
         "|---|---|---|---|---|---|---|---|---|", fila(propio, "**nosotros**")] + [fila(o, o["tipo"]) for o in otros]
    L += ["", "## Posición", an.get("posicion", ""), "", "## Diferencias", "| Métrica | Nosotros | Ellos | Qué hacer |", "|---|---|---|---|"]
    L += [f"| {d.get('metrica')} | {d.get('nosotros')} | {d.get('ellos')} | {d.get('que_hacer')} |" for d in an.get("diferencias", [])]
    L += ["", "## Qué tienen los vídeos que se salen de la media"] + [f"- {x}" for x in an.get("patrones_virales", [])]
    L += ["", "## Pruebas para las próximas semanas"] + [f"{i}. {x}" for i, x in enumerate(an.get("pruebas", []), 1)]
    L += ["", "_Solo se toman patrones de formato y estilo; nunca temas, títulos ni contenido de otros canales._"]
    return "\n".join(L) + "\n"


def main() -> None:
    cfg = load_config()
    yt = youtube_client()
    propio = perfil(yt)
    if not propio:
        sys.exit("No encuentro el canal propio")
    cache = read_json(OUT / "canales.json") or {}
    if not cache.get("canales") or (dt.date.today() - dt.date.fromisoformat(cache["fecha"])).days >= 28:
        cache = {"fecha": dt.date.today().isoformat(), "canales": descubrir(yt, cfg, propio["id"])}
        write_json(OUT / "canales.json", cache)
    otros = []
    for c in cache["canales"]:
        try:
            p = perfil(yt, c["id"])
        except Exception as e:  # noqa: BLE001
            print(f"  aviso {c['id']}: {e}", file=sys.stderr)
            continue
        if p and p.get("analizados"):
            p["tipo"] = c["tipo"]
            otros.append(p)
    if not otros:
        sys.exit("No he encontrado canales con los que comparar")
    an = analizar(propio, otros, cfg)
    res = {"fecha": dt.date.today().isoformat(), "propio": propio, "otros": otros, "analisis": an}
    write_json(OUT / f"{res['fecha']}.json", res)
    write_json(OUT / "ultimo.json", res)
    md = informe_md(propio, otros, an)
    (OUT / "ultimo.md").write_text(md, encoding="utf-8")
    print(md)


if __name__ == "__main__":
    main()
