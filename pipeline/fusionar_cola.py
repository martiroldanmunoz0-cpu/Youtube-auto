"""Fusiona data/queue.json vídeo a vídeo cuando dos procesos lo cambian a la vez (driver de merge de git).

Uso (lo llama git): python3 pipeline/fusionar_cola.py BASE ACTUAL OTRO  -> deja el resultado en ACTUAL.
Cada lado conserva sus cambios: los vídeos que uno añadió, cambió o quitó se aplican sobre los del otro.
"""
import json
import sys


def _load(p):
    try:
        with open(p, encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []


def merge(base, cur, other):
    if isinstance(cur, dict) or isinstance(other, dict):  # p. ej. data/playlists.json: une las dos versiones
        cur, other = cur if isinstance(cur, dict) else {}, other if isinstance(other, dict) else {}
        return {**other, **cur}
    b = {q["id"]: q for q in base}
    res = {q["id"]: q for q in cur}
    order = [q["id"] for q in cur]
    o = {q["id"]: q for q in other}
    for vid, q in o.items():  # lo que cambió o añadió el otro lado
        if b.get(vid) != q:
            if vid not in res:
                order.append(vid)
            res[vid] = q
    for vid in b:  # lo que quitó el otro lado (p. ej. un vídeo eliminado)
        if vid not in o and vid in res and res[vid] == b[vid]:
            del res[vid]
    return [res[v] for v in order if v in res]


if __name__ == "__main__":
    base, cur, other = (_load(p) for p in sys.argv[1:4])
    with open(sys.argv[2], "w", encoding="utf-8") as f:
        json.dump(merge(base, cur, other), f, ensure_ascii=False, indent=2)
