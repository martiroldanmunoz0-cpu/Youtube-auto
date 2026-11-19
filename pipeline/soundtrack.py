"""Música ambiente oscura y efectos generados por código (sin derechos de autor).

- Pad grave con dos notas que respiran + ruido filtrado (atmósfera).
- "Whoosh" en cada cambio de plano.
- Golpe grave ("boom") en el gancho y en el giro final.
"""
from __future__ import annotations

import wave
from pathlib import Path

import numpy as np

SR = 44100


def _fast_lowpass(x: np.ndarray, k: int) -> np.ndarray:
    kernel = np.ones(k) / k
    return np.convolve(x, kernel, mode="same")


def _synth_loop(n: int, rng) -> np.ndarray:
    """Base synthwave animada (para comedia): bombo, bajo arpegiado y charles a ~105 BPM."""
    t = np.arange(n) / SR
    bpm = rng.choice([100, 105, 110])
    beat = 60 / bpm
    root = rng.choice([55.0, 58.27, 61.74, 65.41])
    prog = [1.0, 1.0, 0.749, 0.841]  # i - i - VI - VII (aprox.)
    out = np.zeros(n)
    eighth = beat / 2
    k = 0
    while k * eighth < n / SR:
        i0 = int(k * eighth * SR)
        L = min(int(eighth * SR), n - i0)
        tt = np.arange(L) / SR
        bar = int(k // 8) % 4
        f = root * prog[bar] * (2 if k % 4 == 3 else 1)
        saw = 2 * ((tt * f) % 1) - 1
        out[i0:i0 + L] += 0.35 * saw * np.exp(-tt * 6)
        if k % 2 == 0:  # bombo en negras
            out[i0:i0 + L] += 0.9 * np.sin(2 * np.pi * (50 + 90 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 9)
        hat = rng.standard_normal(L) * np.exp(-tt * 60) * 0.12
        out[i0:i0 + L] += np.diff(np.concatenate([[0], hat]))
        k += 1
    pad = 0.12 * np.sin(2 * np.pi * root * 2 * t) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.1 * t))
    return out + pad


def make_soundtrack(duration: float, cuts: list[float], hits: list[float], out: Path, seed: int = 1, volume: float = 0.16, sfx: bool = True, style: str = "dark"):
    rng = np.random.default_rng(seed)
    n = int(duration * SR) + SR
    t = np.arange(n) / SR
    # Escala menor: elegimos una tónica grave al azar para que cada vídeo suene distinto.
    root = rng.choice([49.0, 55.0, 58.27, 61.74, 65.41])
    fifth, minor3 = root * 1.5, root * 1.189
    lfo = 0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * t + rng.uniform(0, 6))
    pad = (
        0.5 * np.sin(2 * np.pi * root * t)
        + 0.25 * np.sin(2 * np.pi * root * 2.003 * t)
        + 0.22 * np.sin(2 * np.pi * fifth * t + 1.0) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.05 * t))
        + 0.15 * np.sin(2 * np.pi * minor3 * 2 * t + 2.0) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.033 * t + 1))
    ) * lfo
    air = _fast_lowpass(rng.standard_normal(n), 60) * 2.5
    track = 0.75 * pad + 0.25 * air
    if style == "synth":
        track = _synth_loop(n, rng)

    if sfx:
        for c in cuts:
            i0 = int(c * SR) - int(0.35 * SR)
            L = int(0.7 * SR)
            if i0 < 0:
                continue
            env = np.sin(np.linspace(0, np.pi, L)) ** 2
            noise = _fast_lowpass(rng.standard_normal(L), 12) * 1.2
            track[i0:i0 + L] += noise * env * 0.9
        for h in hits:
            i0 = int(h * SR)
            L = int(1.6 * SR)
            if i0 + L > n:
                continue
            tt = np.arange(L) / SR
            boom = np.sin(2 * np.pi * (45 + 30 * np.exp(-tt * 8)) * tt) * np.exp(-tt * 2.5)
            track[i0:i0 + L] += boom * 2.2

    # Fundido de entrada/salida y normalización
    fade = int(1.5 * SR)
    track[:fade] *= np.linspace(0, 1, fade)
    end = int(duration * SR)
    track[end - fade:end] *= np.linspace(1, 0, fade)
    track[end:] = 0
    track = track[:end]
    track = track / (np.max(np.abs(track)) + 1e-9) * volume
    pcm = (np.clip(track, -1, 1) * 32767).astype(np.int16)
    with wave.open(str(out), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
