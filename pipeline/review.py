"""Paso 4: prepara la revisión semanal.

- Sube los MP4 a una Release de GitHub (almacenamiento, no ensucia el repositorio).
- Genera la página de revisión (site/) con los vídeos para verlos desde el móvil.
- Abre un issue con una casilla por vídeo. Tú marcas los que te gustan y cierras el issue:
  eso dispara la programación en YouTube.
- Guarda los metadatos en data/weeks/<semana>.json y actualiza data/history.json.
"""
from __future__ import annotations

import html
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

from common import DATA, ROOT, load_config, read_json, week_dir, week_id, write_json


def gh(*args: str, input_text: str | None = None) -> str:
    return subprocess.run(["gh", *args], check=True, capture_output=True, text=True, input=input_text).stdout.strip()


def pages_url() -> str | None:
    repo = os.environ.get("GITHUB_REPOSITORY", "")
    if "/" not in repo:
        return None
    owner, name = repo.split("/", 1)
    return f"https://{owner.lower()}.github.io/{name}/"


def build_site(wid: str, stories: list[dict], analysis: dict, wd: Path, cfg: dict) -> Path:
    site = ROOT / "site"
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
        idea = st.get("idea", {})
        cards.append(f"""
<article id="{st['id']}">
  <div class="num">#{i}</div>
  <video controls playsinline preload="none" poster="v/{thumb}" src="v/{st['video']}"></video>
  <div class="meta">
    <h2>{html.escape(st['title'])}</h2>
    <p class="id">{st['id']} · {html.escape(idea.get('tipo', ''))}</p>
    <p>{html.escape(st['description']).replace(chr(10), '<br>')}</p>
    <details><summary>Por qué esta idea</summary><p>{html.escape(idea.get('por_que_funcionara', ''))}</p></details>
    <details><summary>Guion</summary><ol>{guion}</ol></details>
  </div>
</article>""")
    pats = "".join(f"<li>{html.escape(p)}</li>" for p in analysis.get("patrones_gancho", []))
    temas = "".join(f"<li>{html.escape(p)}</li>" for p in analysis.get("temas_calientes", []))
    page = f"""<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Revisión {wid}</title>
<style>
:root{{color-scheme:dark}} body{{margin:0;background:#0b0c12;color:#eee;font:16px/1.5 system-ui,sans-serif}}
main{{max-width:1100px;margin:auto;padding:16px}} h1{{font-size:24px}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px}}
article{{background:#151722;border-radius:16px;overflow:hidden;position:relative}}
video{{width:100%;aspect-ratio:9/16;background:#000;display:block}}
.meta{{padding:12px 16px}} .meta h2{{font-size:17px;margin:0 0 4px}} .id{{color:#9aa4ff;font-size:13px;margin:0}}
.num{{position:absolute;top:10px;left:10px;background:#ffb35c;color:#000;font-weight:700;border-radius:8px;padding:2px 10px;z-index:2}}
details{{margin-top:8px;color:#ccc}} .box{{background:#151722;border-radius:16px;padding:12px 18px;margin-bottom:20px}}
</style></head><body><main>
<h1>Vídeos de la semana {wid}</h1>
<div class="box"><p>{html.escape(analysis.get('resumen', ''))}</p>
<details><summary>Ganchos que funcionan</summary><ul>{pats}</ul></details>
<details><summary>Temas calientes</summary><ul>{temas}</ul></details>
<p><b>Para aprobar:</b> vuelve al issue de GitHub, marca los vídeos que quieras publicar y ciérralo.</p></div>
<div class="grid">{''.join(cards)}</div>
</main></body></html>"""
    (site / "index.html").write_text(page, encoding="utf-8")
    return site


def main():
    cfg = load_config()
    wid = week_id()
    wd = week_dir(wid)
    stories = [s for s in (read_json(wd / "stories.json") or []) if s.get("video")]
    analysis = read_json(wd / "analysis.json", {})
    if not stories:
        sys.exit("No hay vídeos montados esta semana")

    # 1) Release con los vídeos
    tag = f"semana-{wid}"
    files = [str(wd / s["video"]) for s in stories]
    try:
        gh("release", "view", tag)
        gh("release", "upload", tag, *files, "--clobber")
    except subprocess.CalledProcessError:
        gh("release", "create", tag, *files, "--title", f"Vídeos {wid}", "--notes", "Vídeos generados para revisión. No borrar hasta que estén publicados.", "--prerelease")
    repo = os.environ.get("GITHUB_REPOSITORY", "")

    # 2) Página de revisión
    build_site(wid, stories, analysis, wd, cfg)
    base = pages_url()

    # 3) Issue con casillas
    lines = [
        f"## 🎬 Vídeos de la semana {wid}",
        "",
        f"**1.** Mira los vídeos: {base or '(activa GitHub Pages para ver la página de revisión)'}",
        "**2.** Marca las casillas de los que quieras publicar.",
        "**3.** Cierra este issue → se programan solos en YouTube (1 al día; 2 al día si apruebas más de 7).",
        "",
        f"> {analysis.get('resumen', '')}",
        "",
    ]
    for i, st in enumerate(stories, 1):
        video_link = f"{base}#{st['id']}" if base else f"https://github.com/{repo}/releases/download/{tag}/{st['video']}"
        dl = f"https://github.com/{repo}/releases/download/{tag}/{st['video']}"
        lines.append(f"- [ ] `{st['id']}` **#{i} {st['title']}** — [ver]({video_link}) · [descargar]({dl})")
    lines += ["", "<!-- semana:" + wid + " -->"]
    try:
        gh("label", "create", "revision", "--color", "FFB35C", "--description", "Revisión semanal de Shorts", "--force")
    except subprocess.CalledProcessError:
        pass
    url = gh("issue", "create", "--title", f"Revisión de vídeos {wid}", "--label", "revision", "--body-file", "-", input_text="\n".join(lines))
    print("Issue de revisión:", url)

    # 4) Estado para el paso de publicación + historial
    meta = [{k: s[k] for k in ("id", "title", "description", "tags", "video")} for s in stories]
    write_json(DATA / "weeks" / f"{wid}.json", {"semana": wid, "tag": tag, "issue": url, "videos": meta})
    history = read_json(DATA / "history.json", [])
    history += [{"id": s["id"], "titulo": s["title"], "tipo": s.get("idea", {}).get("tipo")} for s in stories]
    write_json(DATA / "history.json", history[-400:])


if __name__ == "__main__":
    main()
