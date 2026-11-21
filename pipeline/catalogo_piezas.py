"""Actualiza en el catálogo la lista de piezas disponibles (después de añadir piezas a renderer/lib/props.mjs).
Uso: python pipeline/catalogo_piezas.py"""
import json
import subprocess

from common import CATALOG, ROOT

names = json.loads(subprocess.run(["node", str(ROOT / "renderer" / "tools" / "piezas.mjs"), "lista"], capture_output=True, text=True, check=True).stdout)
c = json.loads(CATALOG.read_text(encoding="utf-8"))
c["scenes"]["composicion"]["params"]["piezas_disponibles"] = ", ".join(names)
CATALOG.write_text(json.dumps(c, ensure_ascii=False, indent=1), encoding="utf-8")
print(f"Catálogo actualizado: {len(names)} piezas")
