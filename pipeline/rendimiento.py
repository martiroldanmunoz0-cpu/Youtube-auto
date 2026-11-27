"""Revisión de rendimiento del canal (semanal y mensual) con YouTube Analytics.

Uso: python pipeline/rendimiento.py semanal|mensual
- Por vídeo y periodo: vistas, minutos vistos, duración media, % visto, suscriptores ganados/perdidos, likes,
  comentarios, compartidos y fuentes de tráfico. Calcula subs por cada 1000 vistas y tasa de interacción.
- Compara cada vídeo con la mediana de su tipo (Shorts con Shorts, largos con largos) y del periodo anterior.
- Claude saca patrones de éxito y, para los vídeos flojos, QUÉ FALLA y cómo mejorarlo en los PRÓXIMOS (no se rehace nada).
- Guarda data/rendimiento/<tipo>-<periodo>.json, un informe .md legible y data/rendimiento/para_guiones.json, que
  scripts.py añade al escribir guiones nuevos.
Impresiones y CTR de miniatura no salen en la API de Analytics (solo en YouTube Studio / Reporting API); ingresos solo
si el canal está monetizado y el token tiene permiso de ingresos. Si no están, el informe lo dice y sigue.
"""
from __future__ import annotations

import datetime as dt
import json
import re
import statistics as st
import sys

from common import DATA, load_config, read_json, write_json
from retencion import _creds, _segundos

OUT = DATA / "rendimiento"
METRICAS = ("views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained,subscribersLost,"
            "likes,comments,shares")
NOMBRE_FUENTE = {"YT_SEARCH": "búsqueda", "RELATED_VIDEO": "sugeridos", "SUBSCRIBER": "suscriptores", "SHORTS": "feed Shorts",
                 "BROWSE": "inicio/explorar", "EXT_URL": "externo", "PLAYLIST": "listas", "YT_CHANNEL": "página del canal",
                 "NO_LINK_OTHER": "directo/otros", "NOTIFICATION": "notificaciones", "END_SCREEN": "pantalla final",
                 "HASHTAGS": "hashtags", "YT_OTHER_PAGE": "otras páginas YT", "SOUND_PAGE": "página de sonido"}


def periodo(tipo: str, hoy: dt.date) -> tuple[str, dt.date, dt.date, dt.date, dt.date]:
    """(etiqueta, inicio, fin, inicio_anterior, fin_anterior). Analytics tarda ~2 días en tener datos."""
    if tipo == "mensual":
        fin = hoy.replace(day=1) - dt.timedelta(days=1)
        ini = fin.replace(day=1)
        fin_a = ini - dt.timedelta(days=1)
        return ini.strftime("%Y-%m"), ini, fin, fin_a.replace(day=1), fin_a
    fin = hoy - dt.timedelta(days=2)
    ini = fin - dt.timedelta(days=6)
    a, s, _ = ini.isocalendar()
    return f"{a}-S{s:02d}", ini, fin, ini - dt.timedelta(days=7), ini - dt.timedelta(days=1)


def _q(yta, ini, fin, **kw) -> dict:
    r = yta.reports().query(ids="channel==MINE", startDate=ini.isoformat(), endDate=fin.isoformat(), **kw).execute()
    cols = [c["name"] for c in r.get("columnHeaders", [])]
    return {"cols": cols, "rows": r.get("rows") or []}


def por_video(yta, ini, fin) -> dict[str, dict]:
    r = _q(yta, ini, fin, metrics=METRICAS, dimensions="video", sort="-views", maxResults=200)
    out = {}
    for row in r["rows"]:
        d = dict(zip(r["cols"], row))
        v = max(1, d["views"])
        d["subs_netos"] = d["subscribersGained"] - d["subscribersLost"]
        d["subs_por_1000"] = round(1000 * d["subscribersGained"] / v, 2)
        d["interaccion_pct"] = round(100 * (d["likes"] + d["comments"] + d["shares"]) / v, 2)
        out[d.pop("video")] = d
    return out


def fuentes(yta, ini, fin, yid: str | None = None) -> dict[str, int]:
    kw = {"filters": f"video=={yid}"} if yid else {}
    r = _q(yta, ini, fin, metrics="views", dimensions="insightTrafficSourceType", sort="-views", **kw)
    return {NOMBRE_FUENTE.get(a, a.lower()): int(b) for a, b in r["rows"]}


def ingresos(yta, ini, fin) -> float | str:
    try:
        r = _q(yta, ini, fin, metrics="estimatedRevenue")
        return round(float(r["rows"][0][0]), 2) if r["rows"] else 0.0
    except Exception as e:  # noqa: BLE001
        return f"no disponible ({'canal sin monetizar o token sin permiso de ingresos' if '403' in str(e) else str(e)[:120]})"


def _mediana(xs: list[float]) -> float:
    return st.median(xs) if xs else 0.0


def clasificar(videos: list[dict]) -> None:
    """Nota 0-100 relativa a los de su mismo tipo: % visto 35, vistas 25, subs/1000 20, interacción 20."""
    for tipo in ("short", "largo"):
        grupo = [v for v in videos if v["tipo"] == tipo]
        if not grupo:
            continue
        med = {k: _mediana([v[k] for v in grupo]) for k in ("averageViewPercentage", "views", "subs_por_1000", "interaccion_pct")}
        for v in grupo:
            nota = 0.0
            for k, peso in (("averageViewPercentage", 35), ("views", 25), ("subs_por_1000", 20), ("interaccion_pct", 20)):
                rel = v[k] / med[k] if med[k] else 1.0
                nota += peso * min(2.0, rel) / 2
            v["nota"] = round(nota)
            v["vs_mediana"] = {k: (round(v[k] / med[k], 2) if med[k] else None) for k in med}
        orden = sorted(grupo, key=lambda v: -v["nota"])
        n = max(1, len(orden) // 4) if len(orden) >= 3 else 0
        for i, v in enumerate(orden):
            v["grupo"] = "top" if i < n else ("flojo" if n and i >= len(orden) - n else "medio")


def analizar_claude(inf: dict, cfg: dict) -> dict:
    import anthropic  # noqa: PLC0415

    import gasto  # noqa: PLC0415

    lec = read_json(DATA / "retencion" / "lecciones.json") or {}
    prev = read_json(OUT / "para_guiones.json") or {}
    prompt = (
        "Eres analista de datos de YouTube de un canal de curiosidades animadas en inglés (público EE. UU.). Tipo 'short' = "
        "Shorts verticales; 'largo' = vídeos de 8-10 min. Datos REALES de la revisión "
        f"{inf['tipo']} {inf['periodo']} (métricas del periodo; vs_mediana = cociente frente a la mediana de su tipo; "
        "retencion = gancho y frases donde más gente se fue, si las hay; fuentes = vistas por fuente de tráfico):\n"
        f"{json.dumps({k: inf[k] for k in ('canal', 'canal_anterior', 'fuentes_canal', 'videos')}, ensure_ascii=False)}\n\n"
        + (f"Mejoras de retención que ya se aplican a los guiones:\n{json.dumps({k: lec.get(k) for k in ('largos', 'shorts')}, ensure_ascii=False)}\n\n" if lec else "")
        + (f"Lo que se concluyó en la revisión anterior (confírmalo o corrígelo con los datos nuevos):\n{json.dumps(prev, ensure_ascii=False)}\n\n" if prev else "")
        + (f"Comparación reciente con canales del mismo nicho (úsala para dar contexto a las cifras propias):\n"
           f"{json.dumps(inf['competencia'], ensure_ascii=False)}\n\n" if inf.get("competencia") else "")
        + "REGLA: NO se rehace ni se vuelve a publicar ningún vídeo flojo. Solo se apunta qué falló y cómo hacerlo mejor en los "
        "PRÓXIMOS. Sé concreto, en español, y basado en las cifras (cítalas). Si hay pocos datos para concluir algo, dilo. "
        "No inventes impresiones ni CTR: no están en los datos. Responde SOLO un JSON con estas claves:\n"
        '{"resumen": "3-5 frases: cómo fue el periodo frente al anterior",\n'
        ' "patrones_exito": ["qué tienen en común los mejores: tema, título, gancho, duración, fuente de tráfico..."],\n'
        ' "flojos": [{"id": "...", "titulo": "...", "que_falla": "diagnóstico con cifras", "mejora": "qué hacer distinto en los próximos vídeos de ese estilo"}],\n'
        ' "trafico": "qué dicen las fuentes de tráfico y qué hacer (búsqueda, sugeridos, feed Shorts...)",\n'
        ' "suscriptores": "qué vídeos convierten en suscriptores y por qué",\n'
        ' "acciones": ["máx. 5 acciones para el próximo periodo, ordenadas por impacto"],\n'
        ' "para_guiones": {"largos": "máx. 6 líneas para el guionista", "shorts": "máx. 6 líneas para el guionista"},\n'
        ' "temas": {"mas": ["temas/ángulos a repetir"], "menos": ["temas/ángulos a evitar o enfocar distinto"]}}'
    )
    model = (cfg.get("generacion") or {}).get("modelo_analisis", "claude-opus-5-5")
    r = anthropic.Anthropic().messages.create(model=model, max_tokens=5000, messages=[{"role": "user", "content": prompt}],
                                              output_config={"effort": "low"})
    gasto.anthropic(r.model, r.usage, que=f"revisión {inf['tipo']}")
    texto = "".join(b.text for b in r.content if b.type == "text").strip()
    m = re.search(r"\{.*\}", texto, re.S)
    try:
        return json.loads(m.group(0)) if m else {"resumen": texto}
    except json.JSONDecodeError:
        return {"resumen": texto}


def _fmt(n: float) -> str:
    return f"{n:,.0f}".replace(",", ".")


def _var(a: float, b: float) -> str:
    return f" ({'+' if a >= b else ''}{100 * (a - b) / b:.0f}%)" if b else ""


def informe_md(inf: dict, an: dict) -> str:
    c, p = inf["canal"], inf["canal_anterior"]
    L = [f"# Revisión {inf['tipo']} {inf['periodo']} ({inf['desde']} → {inf['hasta']})", "",
         "## Canal", "| Métrica | Valor | vs. periodo anterior |", "|---|---|---|"]
    for k, nom in (("views", "Vistas"), ("estimatedMinutesWatched", "Minutos vistos"), ("subs_netos", "Suscriptores netos"),
                   ("likes", "Likes"), ("comments", "Comentarios"), ("shares", "Compartidos")):
        L.append(f"| {nom} | {_fmt(c.get(k, 0))} | {_var(c.get(k, 0), p.get(k, 0)).strip(' ()') or '—'} |")
    L += [f"| Subs / 1000 vistas | {c['subs_por_1000']} | antes {p.get('subs_por_1000', '—')} |",
          f"| Interacción | {c['interaccion_pct']}% | antes {p.get('interaccion_pct', '—')}% |",
          f"| Ingresos estimados | {inf['ingresos']} | |",
          "| Impresiones / CTR | solo en YouTube Studio → Analytics → Alcance (la API no los da) | |", "",
          "**Fuentes de tráfico:** " + ", ".join(f"{k} {_fmt(v)}" for k, v in inf["fuentes_canal"].items()), "",
          "## Resumen", an.get("resumen", ""), "", "## Vídeos (nota 0-100 frente a los de su tipo)",
          "| | Vídeo | Tipo | Vistas | % visto | Media | Subs/1000 | Interacción | Fuente principal |", "|---|---|---|---|---|---|---|---|---|"]
    for v in inf["videos"]:
        ico = {"top": "🟢", "flojo": "🔴"}.get(v.get("grupo"), "⚪")
        f0 = next(iter(v.get("fuentes") or {}), "—")
        L.append(f"| {ico} {v.get('nota', '')} | {v['titulo'][:60]} | {v['tipo']} | {_fmt(v['views'])} | {v['averageViewPercentage']:.0f}% "
                 f"| {v['averageViewDuration']:.0f}s | {v['subs_por_1000']} | {v['interaccion_pct']}% | {f0} |")
    L += ["", "## Patrones de éxito"] + [f"- {x}" for x in an.get("patrones_exito", [])]
    L += ["", "## Vídeos flojos: qué falla (no se rehacen)"]
    for f in an.get("flojos", []):
        L += [f"**{f.get('titulo') or f.get('id')}**", f"- Qué falla: {f.get('que_falla', '')}", f"- Para los próximos: {f.get('mejora', '')}", ""]
    L += ["## Tráfico", an.get("trafico", ""), "", "## Suscriptores", an.get("suscriptores", ""), "",
          "## Acciones para el próximo periodo"] + [f"{i}. {x}" for i, x in enumerate(an.get("acciones", []), 1)]
    t = an.get("temas") or {}
    L += ["", "## Temas", f"- Más: {', '.join(t.get('mas', [])) or '—'}", f"- Menos / enfocar distinto: {', '.join(t.get('menos', [])) or '—'}"]
    return "\n".join(L) + "\n"


def main() -> None:
    from googleapiclient.discovery import build  # noqa: PLC0415

    tipo = (sys.argv[1] if len(sys.argv) > 1 else "semanal").lower()
    if tipo not in ("semanal", "mensual"):
        sys.exit("Uso: python rendimiento.py semanal|mensual")
    cfg = load_config()
    creds = _creds()
    yt = build("youtube", "v3", credentials=creds, cache_discovery=False)
    yta = build("youtubeAnalytics", "v2", credentials=creds, cache_discovery=False)
    etiqueta, ini, fin, ini_a, fin_a = periodo(tipo, dt.date.today())
    print(f"Revisión {tipo} {etiqueta}: {ini} → {fin}")
    try:
        vids = por_video(yta, ini, fin)
        antes = por_video(yta, ini_a, fin_a)
        f_canal = fuentes(yta, ini, fin)
    except Exception as e:  # noqa: BLE001
        sys.exit(f"YouTube Analytics no responde: {str(e)[:300]}")
    if not vids:
        print("Sin vistas en el periodo")
        return
    cola = {q["youtube_id"]: q for q in (read_json(DATA / "queue.json", []) or []) if q.get("youtube_id")}
    info = {}
    ids = list(vids)
    for i in range(0, len(ids), 50):
        for v in yt.videos().list(part="contentDetails,snippet", id=",".join(ids[i:i + 50])).execute().get("items", []):
            info[v["id"]] = v
    videos = []
    for yid, d in vids.items():
        q, v = cola.get(yid, {}), info.get(yid, {})
        dur = _segundos((v.get("contentDetails") or {}).get("duration", ""))
        vid = q.get("id") or yid
        d.update(youtube_id=yid, id=vid, titulo=(v.get("snippet") or {}).get("title") or q.get("title", yid), duracion=dur,
                 tipo="largo" if vid.startswith("largo-") or dur > 180 else "short", publicado=q.get("publish_at"),
                 lista=q.get("lista"))
        if yid in antes:
            d["periodo_anterior"] = {k: antes[yid][k] for k in ("views", "averageViewPercentage", "subs_netos")}
        r = read_json(DATA / "retencion" / f"{vid}.json")
        if r:
            d["retencion"] = {k: r.get(k) for k in ("vs_parecidos", "gancho", "peores_frases") if r.get(k)}
        videos.append(d)
    clasificar(videos)
    for d in sorted(videos, key=lambda x: -x["views"])[:15]:
        try:
            d["fuentes"] = fuentes(yta, ini, fin, d["youtube_id"])
        except Exception:  # noqa: BLE001, S110
            pass

    def total(ds: dict) -> dict:
        t = {k: sum(x[k] for x in ds.values()) for k in ("views", "estimatedMinutesWatched", "subscribersGained", "subscribersLost",
                                                       "likes", "comments", "shares")}
        v = max(1, t["views"])
        t.update(subs_netos=t["subscribersGained"] - t["subscribersLost"], subs_por_1000=round(1000 * t["subscribersGained"] / v, 2),
                 interaccion_pct=round(100 * (t["likes"] + t["comments"] + t["shares"]) / v, 2))
        return t

    inf = {"tipo": tipo, "periodo": etiqueta, "desde": ini.isoformat(), "hasta": fin.isoformat(), "canal": total(vids),
           "canal_anterior": total(antes) if antes else {}, "fuentes_canal": f_canal, "ingresos": ingresos(yta, ini, fin),
           "videos": sorted(videos, key=lambda x: -x.get("nota", 0))}
    comp = read_json(DATA / "competencia" / "ultimo.json") or {}
    if comp.get("fecha") and (dt.date.today() - dt.date.fromisoformat(comp["fecha"])).days <= 10:
        inf["competencia"] = comp.get("analisis")
    an = analizar_claude(inf, cfg)
    inf["analisis"] = an
    write_json(OUT / f"{tipo}-{etiqueta}.json", inf)
    md = informe_md(inf, an)
    if inf.get("competencia") and (DATA / "competencia" / "ultimo.md").exists():
        md += "\n" + (DATA / "competencia" / "ultimo.md").read_text(encoding="utf-8").replace("# Comparación", "## Comparación", 1)
    (OUT / f"{tipo}-{etiqueta}.md").write_text(md, encoding="utf-8")
    (OUT / "ultimo.md").write_text(md, encoding="utf-8")
    if an.get("para_guiones") or an.get("temas"):
        write_json(OUT / "para_guiones.json", {"actualizado": dt.date.today().isoformat(), "revision": f"{tipo} {etiqueta}",
                                               **(an.get("para_guiones") or {}), "temas": an.get("temas") or {}})
    print(md)


if __name__ == "__main__":
    main()
