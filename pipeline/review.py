"""Paso 4: prepara la revisión semanal.

- Sube los MP4 a una Release de GitHub (almacenamiento, no ensucia el repositorio).
- Genera la página de revisión (site/) con los vídeos para verlos desde el móvil.
- Abre un issue con una casilla por vídeo. Tú marcas los que te gustan y cierras el issue:
  eso dispara la programación en YouTube.
- Guarda los metadatos en data/weeks/<semana>.json y el historial en data/history/<tanda>.json.
"""
from __future__ import annotations

import html
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

import datetime as dt

from common import DATA, ROOT, formato, history_file, load_config, pedido, read_json, run_id, week_dir, write_json


def gh(*args: str, input_text: str | None = None) -> str:
    return subprocess.run(["gh", *args], check=True, capture_output=True, text=True, input=input_text).stdout.strip()


def pages_url() -> str | None:
    repo = os.environ.get("GITHUB_REPOSITORY", "")
    if "/" not in repo:
        return None
    owner, name = repo.split("/", 1)
    return f"https://{owner.lower()}.github.io/{name}/"


def tanda_titulo(wid: str, cfg: dict) -> str:
    if formato() == "comedia":
        return f"Comedia: {pedido() or cfg.get('comedia', {}).get('tema', '')}"
    return f"Pedido: {pedido()}" if pedido() else f"Vídeos de la semana {wid}"


def build_site(wid: str, stories: list[dict], analysis: dict, wd: Path, cfg: dict) -> Path:
    site = ROOT / "site" / wid
    if site.exists():
        shutil.rmtree(site)
    (site / "v").mkdir(parents=True)
    cards = []
    for i, st in enumerate(stories, 1):
        shutil.copy(wd / st["video"], site / "v" / st["video"])
        thumb = Path(st["video"]).with_suffix(".jpg").name
        if (wd / thumb).exists():
            shutil.copy(wd / thumb, site / "v" / thumb)
        guion = "".join(f"<li>{html.escape(b['text'])}</li>" for b in st["beats"])
        ganchos = "".join(
            f"<li><b>{g.get('puntuacion', '?')}/10</b> {html.escape(g.get('texto', ''))} <i>({html.escape(g.get('motivo', ''))})</i></li>"
            for g in sorted(st.get("ganchos", []), key=lambda g: -int(g.get("puntuacion", 0) or 0))
        )
        idea = st.get("idea", {})
        cards.append(f"""
<article id="{st['id']}">
  <div class="num">#{i}</div>
  <video controls playsinline preload="none" poster="v/{thumb}" src="v/{st['video']}"></video>
  <div class="meta">
    <h2>{html.escape(st['title'])}</h2>
    <p class="id">{st['id']} · {html.escape(idea.get('tipo', ''))}</p>
    {"<p class='qa ok'>✅ Revisión automática: todo correcto</p>" if not st.get("qa") else "<p class='qa warn'>⚠️ " + "<br>⚠️ ".join(html.escape(q) for q in st["qa"]) + "</p>"}
    <p>{html.escape(st['description']).replace(chr(10), '<br>')}</p>
    <details><summary>Por qué esta idea</summary><p>{html.escape(idea.get('por_que_funcionara', ''))}</p></details>
    <details><summary>Guion</summary><ol>{guion}</ol></details>
    <details><summary>Ganchos considerados</summary><ul>{ganchos}</ul></details>
  </div>
</article>""")
    heading = tanda_titulo(wid, cfg)
    pats = "".join(f"<li>{html.escape(p)}</li>" for p in analysis.get("patrones_gancho", []))
    temas = "".join(f"<li>{html.escape(p)}</li>" for p in analysis.get("temas_calientes", []))
    page = f"""<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Revisión {html.escape(heading)}</title>
<style>
:root{{color-scheme:dark}} body{{margin:0;background:#0b0c12;color:#eee;font:16px/1.5 system-ui,sans-serif}}
main{{max-width:1100px;margin:auto;padding:16px}} h1{{font-size:24px}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px}}
article{{background:#151722;border-radius:16px;overflow:hidden;position:relative}}
video{{width:100%;aspect-ratio:9/16;background:#000;display:block}}
.meta{{padding:12px 16px}} .meta h2{{font-size:17px;margin:0 0 4px}} .id{{color:#9aa4ff;font-size:13px;margin:0}}
.qa{{font-size:13px;margin:6px 0}} .qa.ok{{color:#5fd38a}} .qa.warn{{color:#ffb35c}}
.num{{position:absolute;top:10px;left:10px;background:#ffb35c;color:#000;font-weight:700;border-radius:8px;padding:2px 10px;z-index:2}}
details{{margin-top:8px;color:#ccc}} .box{{background:#151722;border-radius:16px;padding:12px 18px;margin-bottom:20px}}
</style></head><body><main>
<h1>{html.escape(heading)}</h1>
<div class="box"><p>{html.escape(analysis.get('resumen', ''))}</p>
<details><summary>Ganchos que funcionan</summary><ul>{pats}</ul></details>
<details><summary>Temas calientes</summary><ul>{temas}</ul></details>
<p><b>Para aprobar:</b> vuelve al issue de GitHub, marca los vídeos que quieras publicar y ciérralo.</p></div>
<div class="grid">{''.join(cards)}</div>
</main></body></html>"""
    (site / "index.html").write_text(page, encoding="utf-8")
    return site


def _retry(fn, tries=6, wait=6):
    import time
    for i in range(tries):
        try:
            return fn()
        except subprocess.CalledProcessError as e:
            if i == tries - 1:
                raise
            print(f"  reintento {i + 1}: {(e.stderr or '').strip()[:120]}")
            time.sleep(wait * (i + 1))


def upload_to_release(tag: str, files: list[str], wid: str, req: str | None):
    """Sube vídeos a la release de la tanda (varias máquinas a la vez: crea si no existe y reintenta)."""
    def go():
        try:
            gh("release", "upload", tag, *files, "--clobber")
        except subprocess.CalledProcessError:
            try:
                gh("release", "create", tag, *files, "--title", f"Vídeos {wid}", "--prerelease",
                   "--notes", (f"Pedido: {req}\n\n" if req else "") + "Vídeos generados para revisión. No borrar hasta que estén publicados.")
            except subprocess.CalledProcessError:
                gh("release", "upload", tag, *files, "--clobber")  # otra máquina la acaba de crear
    _retry(go)


def git_save(msg: str):
    def go():
        subprocess.run(["git", "add", "-A", "data"], check=True)
        if subprocess.run(["git", "diff", "--cached", "--quiet"]).returncode != 0:
            subprocess.run(["git", "commit", "-q", "-m", msg], check=True)
        subprocess.run(["git", "pull", "-q", "--rebase"], check=True, capture_output=True, text=True)
        subprocess.run(["git", "push", "-q"], check=True, capture_output=True, text=True)
    _retry(go)


def review_one(st: dict, wid: str, wd: Path, cfg: dict, analysis: dict):
    """Publica UN vídeo para revisión: release + página + issue propio con su casilla."""
    import pages  # noqa: PLC0415

    req = pedido()
    vid = st["id"]
    tag = wid if wid.startswith(("pedido", "comedia")) else f"semana-{wid}"
    repo = os.environ.get("GITHUB_REPOSITORY", "")
    files = [str(wd / st["video"])] + ([str(wd / st["portada"])] if st.get("portada") and (wd / st["portada"]).exists() else [])
    upload_to_release(tag, files, wid, req)

    build_site(vid, [st], analysis, wd, cfg)
    page_ok = True
    try:
        pages.main(vid, st["title"].replace(" #shorts", ""))
        subprocess.run(["gh", "workflow", "run", "pagina.yml"], check=False)
    except Exception as e:  # sin página: el enlace del issue va directo al vídeo (nunca a otra tanda)
        page_ok = False
        print(f"  aviso: página de revisión no actualizada ({e})")
    base = pages_url() if page_ok else None
    page = f"{base}?v={vid}" if base else None  # el panel web, con este vídeo resaltado
    dl = f"https://github.com/{repo}/releases/download/{tag}/{st['video']}"

    owner = os.environ.get("GITHUB_REPOSITORY_OWNER", "")
    origen = tanda_titulo(wid, cfg)
    qa = "✅ Revisión automática: todo correcto" if not st.get("qa") else "⚠️ Revisión automática: " + "; ".join(st["qa"])
    lines = [
        f"🔔 @{owner} ¡vídeo listo para revisar!" if owner else "",
        "",
        f"### {st['title']}",
        f"_{origen}_",
        "",
        f"▶️ **Verlo:** {page or dl}",
        f"⬇️ [Descargar]({dl})",
        "",
        qa,
        "",
        "**Para publicarlo:** marca la casilla y cierra el issue. **Para descartarlo:** ciérralo sin marcar.",
        "",
        f"- [ ] `{vid}` **Publicar este vídeo**",
        "",
        "<details><summary>Descripción y guion</summary>\n\n" + st["description"] + "\n\n"
        + "\n".join(f"{i}. {b['text']}" for i, b in enumerate(st["beats"], 1)) + "\n</details>",
        "",
        f"<!-- semana:{vid} -->",
    ]
    meta = {k: st[k] for k in ("id", "title", "description", "tags", "video", "portada") if k in st}
    write_json(DATA / "weeks" / f"{vid}.json", {"semana": vid, "tanda": wid, "pedido": req, "tag": tag, "videos": [meta]})
    write_json(history_file(vid), [{"id": vid, "titulo": st["title"], "tipo": st.get("idea", {}).get("tipo"),
                                    "ts": dt.datetime.now(dt.timezone.utc).isoformat(),
                                    "premisa": st.get("idea", {}).get("premisa", ""), "gancho": st.get("idea", {}).get("gancho", "")}])
    git_save(f"Vídeo listo para revisar: {vid}")  # primero los datos: así cerrar el issue al momento siempre funciona

    try:
        gh("label", "create", "revision", "--color", "FFB35C", "--description", "Vídeo pendiente de revisión", "--force")
    except subprocess.CalledProcessError:
        pass
    url = _retry(lambda: gh("issue", "create", "--title", f"🎬 Revisar: {st['title'].replace(' #shorts', '')}"[:120],
                            "--label", "revision", "--body-file", "-", input_text="\n".join(lines)))
    print("Issue de revisión:", url)
    if st.get("qa"):  # bandeja de problemas para que Claude lo revise
        import problemas  # noqa: PLC0415

        problemas.video(st, url.strip().splitlines()[-1] if url else "")




def main():
    import argparse  # noqa: PLC0415

    ap = argparse.ArgumentParser()
    ap.add_argument("--parte", type=int, help="publicar para revisión solo los vídeos de esta parte (cada uno con su issue)")
    ap.add_argument("--partes", type=int, default=1)
    args = ap.parse_args()
    if args.parte is not None:
        cfg = load_config()
        wid = run_id()
        wd = week_dir(wid)
        analysis = read_json(wd / "analysis.json", {})
        done = {r["id"]: r for r in (read_json(wd / f"parte-{args.parte}.json", []) or [])}
        stories = [s for i, s in enumerate(read_json(wd / "stories.json") or []) if i % args.partes == args.parte and s["id"] in done]
        for st in stories:
            st["video"], st["qa"] = done[st["id"]]["video"], done[st["id"]].get("qa", [])
            review_one(st, wid, wd, cfg, analysis)
        if not stories:
            print("Esta parte no tiene vídeos que revisar")
        return
    main_tanda()


def main_tanda():
    cfg = load_config()
    wid = run_id()
    wd = week_dir(wid)
    req = pedido()
    stories = [s for s in (read_json(wd / "stories.json") or []) if s.get("video")]
    analysis = read_json(wd / "analysis.json", {})
    if not stories:
        sys.exit("No hay vídeos montados esta semana")

    # 1) Release con los vídeos
    tag = wid if wid.startswith(("pedido", "comedia")) else f"semana-{wid}"
    files = [str(wd / s["video"]) for s in stories]
    try:
        gh("release", "view", tag)
        gh("release", "upload", tag, *files, "--clobber")
    except subprocess.CalledProcessError:
        gh("release", "create", tag, *files, "--title", f"Vídeos {wid}", "--notes", (f"Pedido: {req}\n\n" if req else "") + "Vídeos generados para revisión. No borrar hasta que estén publicados.", "--prerelease")
    repo = os.environ.get("GITHUB_REPOSITORY", "")

    # 2) Página de revisión
    build_site(wid, stories, analysis, wd, cfg)
    base = pages_url()
    if base:
        base = f"{base}{wid}/"

    # 3) Issue con casillas
    owner = os.environ.get("GITHUB_REPOSITORY_OWNER", "")
    lines = [
        f"## 🎬 {tanda_titulo(wid, cfg)}",
        "",
        f"🔔 @{owner} ¡tienes **{len(stories)} vídeos** listos para revisar!" if owner else "",
        "",
        f"**1.** Mira los vídeos: {base or '(activa GitHub Pages para ver la página de revisión)'}",
        "**2.** Marca las casillas de los que quieras publicar.",
        "**3.** Cierra este issue → se programan solos en YouTube detrás de los que ya estén programados (1 al día; si se acumulan muchos, hasta 3 al día como máximo).",
        "",
        f"> {analysis.get('resumen', '')}",
        "",
    ]
    for i, st in enumerate(stories, 1):
        video_link = f"{base}#{st['id']}" if base else f"https://github.com/{repo}/releases/download/{tag}/{st['video']}"
        dl = f"https://github.com/{repo}/releases/download/{tag}/{st['video']}"
        aviso = "" if not st.get("qa") else " · ⚠️ " + "; ".join(st["qa"])
        lines.append(f"- [ ] `{st['id']}` **#{i} {st['title']}** — [ver]({video_link}) · [descargar]({dl}){aviso}")
    lines += ["", "<!-- semana:" + wid + " -->"]
    try:
        gh("label", "create", "revision", "--color", "FFB35C", "--description", "Revisión semanal de Shorts", "--force")
    except subprocess.CalledProcessError:
        pass
    title = tanda_titulo(wid, cfg)[:80] if (req or formato() == "comedia") else f"Revisión de vídeos {wid}"
    url = gh("issue", "create", "--title", title, "--label", "revision", "--body-file", "-", input_text="\n".join(lines))
    print("Issue de revisión:", url)

    # 4) Estado para el paso de publicación + historial
    meta = [{k: s[k] for k in ("id", "title", "description", "tags", "video")} for s in stories]
    write_json(DATA / "weeks" / f"{wid}.json", {"semana": wid, "pedido": req, "tag": tag, "issue": url, "videos": meta})
    ts = dt.datetime.now(dt.timezone.utc).isoformat()
    write_json(history_file(wid), [{"id": s["id"], "titulo": s["title"], "tipo": s.get("idea", {}).get("tipo"), "ts": ts,
                                    "premisa": s.get("idea", {}).get("premisa", ""), "gancho": s.get("idea", {}).get("gancho", "")}
                                   for s in stories])


if __name__ == "__main__":
    main()
