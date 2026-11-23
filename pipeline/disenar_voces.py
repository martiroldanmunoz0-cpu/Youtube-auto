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
CANDIDATAS: dict[str, str] = {}
# Voces de assets/voices/ de las que sacar una muestra leyendo TEXTO (clon con VoxCPM2)
CLONES = ["narrador_en3"]


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
    voces = Path(__file__).resolve().parent.parent / "assets" / "voices"
    for vid in CLONES:
        ref = voces / f"{vid}.wav"
        print(f"muestra de {vid}...", flush=True)
        wav = model.generate(text=TEXTO, prompt_wav_path=str(ref), prompt_text=(voces / f"{vid}.txt").read_text(encoding="utf-8").strip(),
                             cfg_value=2.0, inference_timesteps=10, max_len=1200)
        wav = np.asarray(wav, dtype=np.float32)
        sf.write(str(out / f"{vid}_muestra.wav"), wav, sr)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(out / f"{vid}_muestra.wav"), "-b:a", "160k", str(out / f"{vid}_muestra.mp3")], check=True)
        print(f"  {vid}: {len(wav) / sr:.1f} s", flush=True)


if __name__ == "__main__":
    main()
