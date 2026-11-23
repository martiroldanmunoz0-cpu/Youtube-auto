"""Diseña voces de narrador NUEVAS (no clonadas de nadie) con VoxCPM2 a partir de una descripción.

Uso: python pipeline/disenar_voces.py out/voces
Genera <id>.wav + <id>.txt por cada candidata; la elegida se copia a assets/voices/ como voz del canal.
"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

import numpy as np

TEXTO = ("Imagine you could control your luck. Turn it up, turn it down, anytime you want. "
         "Sounds amazing, right? But here's the thing nobody tells you: luck always collects. "
         "And when it does, it never asks for permission.")
CANDIDATAS = {
    "voz_d": "A young American man around twenty, energetic storyteller telling a crazy personal story to friends, expressive and dramatic, fast pace, punchy emphasis, slight laugh in the voice",
    "voz_e": "A young American male YouTube narrator, deep-ish and slightly raspy voice, dramatic suspenseful delivery, confident, medium-fast pace with tense pauses",
    "voz_f": "A teenage-sounding young American guy, bright and lively voice, sarcastic and funny storyteller, very expressive intonation, quick pace",
    "voz_g": "A young American man in his early twenties, warm mid-pitched voice, casual but gripping storytime narrator, builds tension then releases it, clear diction",
}


def main() -> None:
    out = Path(sys.argv[1] if len(sys.argv) > 1 else "out/voces")
    out.mkdir(parents=True, exist_ok=True)
    import soundfile as sf  # noqa: PLC0415
    from voxcpm import VoxCPM  # noqa: PLC0415

    model = VoxCPM.from_pretrained("openbmb/VoxCPM2", load_denoiser=False, optimize=False, device="cpu")
    sr = model.tts_model.sample_rate
    for vid, desc in CANDIDATAS.items():
        print(f"diseñando {vid}...", flush=True)
        wav = model.generate(text=f"({desc}){TEXTO}", cfg_value=2.0, inference_timesteps=10, max_len=1200)
        wav = np.asarray(wav, dtype=np.float32)
        sf.write(str(out / f"{vid}.wav"), wav, sr)
        (out / f"{vid}.txt").write_text(TEXTO + "\n", encoding="utf-8")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(out / f"{vid}.wav"), "-b:a", "160k", str(out / f"{vid}.mp3")], check=True)
        print(f"  {vid}: {len(wav) / sr:.1f} s", flush=True)


if __name__ == "__main__":
    main()
