"""Mantiene la web de revisión con varias tandas a la vez (semanales y pedidos).

GitHub Pages solo publica un sitio entero cada vez, así que guardamos las últimas tandas
en la rama `gh-pages` (sin historial, para que no crezca) y montamos la web desde ahí.
Resultado en la carpeta `pages/`, lista para `actions/upload-pages-artifact`.
"""
from __future__ import annotations

import datetime as dt
import html
import json
import os
import shutil
import subprocess
from pathlib import Path

from common import ROOT, formato, pedido, run_id

PAGES = ROOT / "pages"
MAX_BYTES = 800 * 1024 * 1024  # GitHub Pages admite hasta 1 GB
MAX_TANDAS = 6


def git(*args: str, env: dict | None = None) -> str:
    return subprocess.run(["git", *args], cwd=ROOT, check=True, capture_output=True, text=True, env=env).stdout.strip()


def size_of(p: Path) -> int:
    return sum(f.stat().st_size for f in p.rglob("*") if f.is_file())


def build_and_push() -> int:
    rid = run_id()
    if PAGES.exists():
        shutil.rmtree(PAGES)
    PAGES.mkdir()

    # 1) Recuperar lo publicado antes
    base_sha = ""
    head = git("ls-remote", "--heads", "origin", "gh-pages")
    if head:
        base_sha = head.split()[0]
        git("fetch", "--depth", "1", "origin", "gh-pages")
        archive = subprocess.run(["git", "archive", "FETCH_HEAD"], cwd=ROOT, check=True, capture_output=True).stdout
        subprocess.run(["tar", "-x", "-C", str(PAGES)], input=archive, check=True)

    # 2) Añadir la tanda nueva
    src = ROOT / "site" / rid
    if src.exists():
        dst = PAGES / rid
        if dst.exists():
            shutil.rmtree(dst)
        shutil.copytree(src, dst)

    manifest_path = PAGES / "tandas.json"
    tandas = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.exists() else []
    tandas = [t for t in tandas if t["id"] != rid and (PAGES / t["id"]).exists()]
    if src.exists():
        titulo = f"Comedia: {pedido() or 'GTA'}" if formato() == "comedia" else (f"Pedido: {pedido()}" if pedido() else f"Semana {rid}")
        tandas.append({"id": rid, "titulo": titulo, "fecha": dt.date.today().isoformat()})

    # 3) Quitar tandas antiguas (por número y por tamaño)
    while len(tandas) > MAX_TANDAS or (len(tandas) > 1 and size_of(PAGES) > MAX_BYTES):
        old = tandas.pop(0)
        shutil.rmtree(PAGES / old["id"], ignore_errors=True)
    manifest_path.write_text(json.dumps(tandas, ensure_ascii=False, indent=2), encoding="utf-8")

    # 4) Portada con todas las tandas
    items = "".join(
        f'<li><a href="{html.escape(t["id"])}/">{html.escape(t["titulo"])}</a> <span>{t["fecha"]}</span></li>'
        for t in reversed(tandas)
    )
    (PAGES / "index.html").write_text(f"""<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Revisión de vídeos</title>
<style>:root{{color-scheme:dark}}body{{margin:0;background:#0b0c12;color:#eee;font:17px/1.6 system-ui,sans-serif}}
main{{max-width:700px;margin:auto;padding:16px}}a{{color:#ffb35c}}span{{color:#888;font-size:14px;margin-left:8px}}
li{{margin:10px 0}}</style></head><body><main><h1>Tandas de vídeos</h1><ul>{items}</ul></main></body></html>""",
                                      encoding="utf-8")
    (PAGES / ".nojekyll").write_text("")

    # 5) Guardar en gh-pages como un único commit (sin historial)
    gitdir = ROOT / ".git"
    env = {**os.environ, "GIT_INDEX_FILE": str(gitdir / "pages-index"),
           "GIT_AUTHOR_NAME": "shorts-bot", "GIT_AUTHOR_EMAIL": "shorts-bot@users.noreply.github.com",
           "GIT_COMMITTER_NAME": "shorts-bot", "GIT_COMMITTER_EMAIL": "shorts-bot@users.noreply.github.com"}
    g = lambda *a: subprocess.run(["git", f"--git-dir={gitdir}", f"--work-tree={PAGES}", *a], cwd=PAGES, check=True, capture_output=True, text=True, env=env).stdout.strip()
    g("add", "-A", ".")
    tree = g("write-tree")
    commit = g("commit-tree", tree, "-m", f"Revisión {rid}")
    lease = f"--force-with-lease=gh-pages:{base_sha}" if base_sha else "--force-with-lease=gh-pages:"
    git("push", lease, "origin", f"{commit}:refs/heads/gh-pages")
    print(f"Página actualizada con {len(tandas)} tandas")
    return len(tandas)


def main():
    import time
    for attempt in range(6):  # si otra tanda actualizó la página a la vez, se vuelve a juntar y se reintenta
        try:
            build_and_push()
            return
        except subprocess.CalledProcessError as e:
            print(f"  reintento {attempt + 1}: otra tanda estaba actualizando la página ({(e.stderr or '').strip()[:120]})")
            time.sleep(10 + attempt * 10)
    raise SystemExit("No se pudo actualizar la página de revisión")





if __name__ == "__main__":
    main()
