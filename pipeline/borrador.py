"""Borrador rápido SIN VOZ de un guion ya escrito (no gasta nada: ni API ni voz).

Sirve para ver cómo queda el montaje (escenas, ritmo, transiciones, efectos) antes de montar el vídeo de verdad.
Los tiempos se calculan con la velocidad media de la voz del canal y los subtítulos salen igual que en el vídeo final.

Uso:  python pipeline/borrador.py data/guiones/<id>.json [salida.mp4]
"""
from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RENDERER = ROOT / "renderer"
PALABRAS_POR_SEG = 2.7  # ritmo medio de la voz clonada
GAP = 0.12



def comment_window(story: dict, beats: list[dict]) -> dict | None:
    """Pregunta para comentarios: en pantalla durante el último plano antes del bucle (invita a comentar)."""
    q = (story.get("comment_q") or "").strip()
    if not q or len(beats) < 3:
        return None
    last = beats[-2] if beats[-1].get("bucle") else beats[-1]
    return {"text": q, "start": round(max(last["start"], last["end"] - 3.2), 3), "end": last["end"]}

def timeline_from_story(story: dict) -> dict:
    t, beats, words = 0.0, [], []
    for i, b in enumerate(story["beats"]):
        ws = [w for w in re.split(r"\s+", b["text"].strip()) if w]
        dur = max(1.4, len(ws) / PALABRAS_POR_SEG + 0.25)
        step = dur / max(1, len(ws))
        for k, w in enumerate(ws):
            words.append({"w": w, "b": i, "sp": "narrador", "start": round(t + k * step, 3), "end": round(t + (k + 1) * step - 0.03, 3)})
        beats.append({**b, "speaker": "narrador", "start": round(t, 3), "end": round(t + dur + GAP, 3), "voice_dur": round(dur, 3)})
        t += dur + GAP
    total = round(t + 0.2, 3)
    beats[-1]["end"] = total
    return {
        "seed": story.get("id", "borrador"), "fps": 30, "total": total, "beats": beats, "words": words,
        "cast": story.get("cast") or {}, "looks": story.get("looks", {}), "subtitle_style": story.get("subtitle_style", "page"),
        "endcard": None,
        "hook": {"text": story.get("cover_text") or story.get("question") or "", "dur": 2.3},
        "comment": comment_window(story, beats),
    }


def main() -> None:
    src = Path(sys.argv[1])
    out = Path(sys.argv[2]) if len(sys.argv) > 2 else src.with_suffix(".borrador.mp4")
    story = json.loads(src.read_text(encoding="utf-8"))
    tl = timeline_from_story(story)
    tl_path = out.with_suffix(".timeline.json")
    tl_path.write_text(json.dumps(tl, ensure_ascii=False), encoding="utf-8")
    r = subprocess.run(["node", str(RENDERER / "render.mjs"), str(tl_path), str(out)], capture_output=True, text=True)
    if r.returncode:
        sys.exit(f"falló el render: {r.stderr[-800:]}")
    avisos = sorted({l.strip() for l in r.stderr.splitlines() if "AVISO" in l})
    print(f"{out} ({tl['total']:.1f} s)" + ("" if not avisos else "\n  " + "\n  ".join(avisos)))


if __name__ == "__main__":
    main()
