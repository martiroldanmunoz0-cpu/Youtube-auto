"""Vídeos largos: genera la voz de UNA PARTE de los planos (para repartir 10 minutos de voz entre varias máquinas).

Uso: python pipeline/voces_largo.py --parte 0 --partes 8
Cada máquina deja sus frases en out/<tanda>/<id>_voces (la misma caché que usa build.py); la máquina final las junta
todas y solo tiene que montar el vídeo, sin volver a generar ninguna voz.
"""
from __future__ import annotations

import argparse
import time

from build import cached_synth
from common import load_config, read_json, run_id, week_dir


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--parte", type=int, required=True)
    ap.add_argument("--partes", type=int, required=True)
    a = ap.parse_args()
    cfg = load_config()
    wd = week_dir(run_id())
    t0 = time.time()
    try:
        import voxtts  # noqa: PLC0415

        voxtts.DEADLINE[0] = time.time() + 60 * 60  # margen de reintentos de voz para esta parte
    except Exception:  # noqa: BLE001
        pass
    for st in read_json(wd / "stories.json", []):
        mine = [b for i, b in enumerate(st["beats"]) if i % a.partes == a.parte]
        print(f"{st['id']}: parte {a.parte + 1}/{a.partes} -> {len(mine)} frases", flush=True)
        for k, b in enumerate(mine, 1):
            cached_synth(wd / f"{st['id']}_voces", b["text"], cfg, None)
            if k % 5 == 0:
                print(f"  {k}/{len(mine)} ({(time.time() - t0) / 60:.0f} min)", flush=True)
    print(f"Voces de la parte {a.parte + 1} listas en {(time.time() - t0) / 60:.0f} min")


if __name__ == "__main__":
    main()
