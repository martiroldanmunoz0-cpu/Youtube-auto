"""Bandeja de PROBLEMAS para que Claude Code los revise y arregle el código.

Cada problema es un issue con la etiqueta `problema` y todas las pruebas técnicas:
- Vídeo con avisos de la revisión automática -> issue propio con los avisos y el guion (escena + texto de cada plano).
- Tanda que ha fallado -> el issue de aviso recibe la etiqueta y un comentario con el final del registro de error.

Claude los lee con la API de GitHub, arregla el código y los cierra con un comentario de qué cambió.
El panel web (pestaña Problemas) los muestra: pendientes y resueltos.

Uso:  python pipeline/problemas.py run <run_id> <issue_number>
"""
from __future__ import annotations

import os
import subprocess
import sys

LABEL = ["problema", "6F42C1", "Para que Claude lo revise y arregle"]


def _gh(*args: str, input_text: str | None = None) -> str:
    return subprocess.run(["gh", *args], input=input_text, text=True, capture_output=True, check=True).stdout.strip()


def _label() -> None:
    try:
        _gh("label", "create", LABEL[0], "--color", LABEL[1], "--description", LABEL[2], "--force")
    except subprocess.CalledProcessError:
        pass


def video(st: dict, review_issue_url: str = "") -> None:
    """Vídeo con avisos: abre un problema con todas las pruebas (no bloquea nunca la revisión)."""
    try:
        _label()
        run_url = ""
        if os.environ.get("GITHUB_RUN_ID"):
            run_url = f"{os.environ.get('GITHUB_SERVER_URL', 'https://github.com')}/{os.environ.get('GITHUB_REPOSITORY', '')}/actions/runs/{os.environ['GITHUB_RUN_ID']}"
        guion = "\n".join(f"{i}. `[{b.get('scene', '?')}]` {b.get('text', '')}" for i, b in enumerate(st.get("beats", []), 1))
        body = "\n".join([
            f"**Vídeo:** {st['title']} (`{st['id']}`)",
            f"**Revisión del vídeo:** {review_issue_url}" if review_issue_url else "",
            f"**Ejecución:** {run_url}" if run_url else "",
            "",
            "### Avisos de la revisión automática",
            *[f"- {q}" for q in st.get("qa", [])],
            "",
            "<details><summary>Guion (escena + texto)</summary>\n",
            guion,
            "</details>",
            "",
            "_Estado: pendiente de que Claude lo revise._",
            f"<!-- problema:{st['id']} -->",
        ])
        url = _gh("issue", "create", "--title", f"🛠 Problema en vídeo: {st['title'].replace(' #shorts', '')}"[:120],
                  "--label", LABEL[0], "--body-file", "-", input_text=body)
        print("  problema registrado:", url)
    except Exception as e:  # noqa: BLE001
        print(f"  aviso: no se pudo registrar el problema ({e})")


def failed_logs(run_id: str, limit: int = 60000) -> str:
    """Final del registro de cada trabajo fallido (funciona aunque la ejecución siga abierta)."""
    import json  # noqa: PLC0415
    import re  # noqa: PLC0415

    repo = os.environ.get("GH_REPO") or os.environ.get("GITHUB_REPOSITORY", "")
    jobs = json.loads(_gh("api", f"repos/{repo}/actions/runs/{run_id}/jobs?per_page=50"))["jobs"]
    resumen = "\n".join(f"- {j['name']}: {j.get('conclusion') or j['status']}" for j in jobs)
    bad = [j for j in jobs if j.get("conclusion") in ("failure", "timed_out")]
    budget = max(3000, limit // max(1, len(bad)))
    parts = []
    for j in bad:
        try:
            txt = subprocess.run(["gh", "api", f"repos/{repo}/actions/jobs/{j['id']}/logs"],
                                 capture_output=True, text=True).stdout
            txt = re.sub(r"^\d{4}-\d\d-\d\dT[\d:.]+Z ", "", txt, flags=re.M)  # sin marcas de tiempo
        except Exception as e:  # noqa: BLE001
            txt = f"(no se pudo leer: {e})"
        parts.append(f"#### {j['name']}\n```\n{txt[-budget:]}\n```")
    return f"**Trabajos:**\n{resumen}\n\n" + ("\n".join(parts) or "_(GitHub no ha dado registro de error)_")


def run(run_id: str, issue: str) -> None:
    try:
        _label()
        _gh("issue", "edit", issue, "--add-label", LABEL[0])
        body = f"### Registro del error (para Claude)\n\n{failed_logs(run_id)}\n\n<!-- problema:run-{run_id} -->"
        if len(body) > 64000:
            body = body[:63000] + "\n```\n_(recortado)_"
        _gh("issue", "comment", issue, "--body-file", "-", input_text=body)
        print("registro añadido al problema")
    except Exception as e:  # noqa: BLE001
        print(f"aviso: no se pudo añadir el registro ({e})")


if __name__ == "__main__":
    if len(sys.argv) >= 4 and sys.argv[1] == "run":
        run(sys.argv[2], sys.argv[3])
    else:
        print(__doc__)
