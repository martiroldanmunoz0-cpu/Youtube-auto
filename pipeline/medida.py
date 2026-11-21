"""Vídeos con ESCENAS A MEDIDA (las dibuja Claude a partir del guion).

  python pipeline/medida.py guardar      (lo usa el workflow "Pedido especial" con a_medida: guarda los guiones
                                          en data/guiones/<id>.json con medida_estado "esperando" y abre un aviso)
  python pipeline/medida.py pendientes   (lista los vídeos que esperan sus escenas)

Después Claude: lee data/guiones/<id>.json, crea renderer/scenes/medida/<id>.mjs, cambia los planos a
scene "medida" (params: archivo, plano, respaldo), pone medida_estado "lista", sube los cambios y lanza
rehacer.yml con id=<id> y tanda=<rid>, que monta el vídeo con la voz y lo manda a Revisar (sin gastar API).
Instrucciones completas: docs/ESCENAS_A_MEDIDA.md
"""
from __future__ import annotations

import json
import os
import subprocess
import sys

from common import DATA, read_json, write_json, week_dir


def guardar() -> None:
    rid = os.environ["RUN_ID"]
    stories = read_json(week_dir(rid) / "stories.json", [])
    if not stories:
        sys.exit("No hay guiones que guardar")
    (DATA / "guiones").mkdir(parents=True, exist_ok=True)
    for st in stories:
        write_json(DATA / "guiones" / f"{st['id']}.json", {**st, "medida_estado": "esperando", "tanda": rid})
        planos = "\n".join(f"{i + 1}. `[{b['scene']}]` {b['text']}" for i, b in enumerate(st.get("beats", [])))
        body = (f"🎨 **Guion listo, esperando sus escenas a medida.** Dile a Claude: «haz las escenas de `{st['id']}`».\n\n"
                f"Cuando las dibuje, el vídeo se monta solo y te llega a **Revisar** (sin gastar más API).\n\n"
                f"<details><summary>Guion</summary>\n\n{planos}\n</details>\n\n<!-- medida:{st['id']} -->")
        subprocess.run(["gh", "label", "create", "medida", "--color", "BB6BD9", "--description", "Esperando escenas a medida", "--force"], capture_output=True)
        subprocess.run(["gh", "issue", "create", "--title", f"🎨 Escenas a medida: {st['title'].replace(' #shorts', '')}",
                        "--label", "medida", "--body", body], check=False)
        print(f"{st['id']}: guion guardado, esperando escenas a medida")


def pendientes() -> None:
    for f in sorted((DATA / "guiones").glob("*.json")):
        st = read_json(f, {})
        if st.get("medida_estado") == "esperando":
            print(f"{st['id']} ({st.get('tanda')}): {st.get('title')} — {len(st.get('beats', []))} planos")


if __name__ == "__main__":
    {"guardar": guardar, "pendientes": pendientes}[sys.argv[1] if len(sys.argv) > 1 else "pendientes"]()
