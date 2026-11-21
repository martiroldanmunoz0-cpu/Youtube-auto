"""Apunta los planos de un guion a sus escenas a medida (renderer/scenes/medida/<id>.mjs).
Uso: python pipeline/aplicar_medida.py <id> [--lista]   (--lista: marca medida_estado "lista" para montarlo)
Los planos sin función en el archivo se quedan como estaban. El plano del bucle usa la escena del plano 1."""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
vid = sys.argv[1]
f = ROOT / "data" / "guiones" / f"{vid}.json"
st = json.loads(f.read_text(encoding="utf-8"))
js = (ROOT / "renderer" / "scenes" / "medida" / f"{vid}.mjs").read_text(encoding="utf-8")
hechos = {int(n) for n in re.findall(r"^\s{2}(\d+):\s*\(ctx", js, re.M)}
for i, b in enumerate(st["beats"]):
    n = 0 if b.get("bucle") else i
    if b["scene"] == "medida":
        b["params"]["plano"] = n
        continue
    if n in hechos:
        label = (b.get("params") or {}).get("label")
        b["params"] = {"archivo": vid, "plano": n, "respaldo": {"scene": b["scene"], "params": b.get("params") or {}},
                       **({"who": b["params"]["who"]} if (b.get("params") or {}).get("who") else {})}
        b["scene"] = "medida"
faltan = [i for i, b in enumerate(st["beats"]) if b["scene"] != "medida"]
if "--lista" in sys.argv:
    st["medida_estado"] = "lista"
f.write_text(json.dumps(st, ensure_ascii=False, indent=1), encoding="utf-8")
print(f"{vid}: {len(st['beats']) - len(faltan)} planos a medida" + (f"; sin escena a medida: {faltan}" if faltan else ""))
