"""Música ambiente y efectos generados por código (sin derechos de autor).

- "bright" (por defecto): melodía suave tipo caja de música / pizzicato sobre acordes ligeros, en tonalidad mayor,
  distinta en cada vídeo (tonalidad, tempo y patrón al azar). Nada de notas graves que suenen a zumbido.
- "dark": pad grave antiguo (solo si un guion lo pide).
- Efectos MUY escasos: un golpe suave solo en el gancho y en algún momento fuerte (como mucho uno cada 15 s).
  Ya no hay "whoosh" en cada cambio de plano.
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


def _bright_loop(n: int, rng) -> np.ndarray:
    """Música luminosa y ligera: arpegio de notas pulsadas (caja de música / pizzicato) + acordes suaves."""
    t = np.arange(n) / SR
    bpm = rng.choice([84, 92, 100, 108])
    eighth = 60 / bpm / 2
    key = rng.choice([261.63, 293.66, 329.63, 349.23, 392.0])  # do, re, mi, fa, sol (registro medio)
    major = [1.0, 1.122, 1.26, 1.335, 1.498, 1.682, 1.888, 2.0]
    progs = [[0, 5, 3, 4], [0, 3, 4, 0], [5, 3, 0, 4], [0, 4, 5, 3]]
    prog = progs[rng.integers(len(progs))]
    pattern = rng.choice([[0, 2, 4, 7, 4, 2, 4, 2], [0, 4, 2, 4, 7, 4, 2, 4], [0, 2, 4, 2, 7, 4, 2, 0]])
    timbre = rng.choice(["caja", "pizz"])
    out = np.zeros(n)
    k = 0
    while k * eighth < n / SR:
        i0 = int(k * eighth * SR)
        L = min(int(eighth * SR * 3), n - i0)
        if L <= 0:
            break
        tt = np.arange(L) / SR
        chord = prog[int(k // 16) % 4]
        deg = (chord + pattern[k % 8]) % 7
        f = key * major[deg] * (2 if (chord + pattern[k % 8]) >= 7 else 1)
        if timbre == "caja":
            note = (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * f * 2 * tt)) * np.exp(-tt * 7)
        else:
            note = (np.sin(2 * np.pi * f * tt) + 0.5 * np.sin(2 * np.pi * f * 1.5 * tt) * np.exp(-tt * 20)) * np.exp(-tt * 10)
        out[i0:i0 + L] += 0.35 * note * (1.0 if k % 2 == 0 else 0.7)
        k += 1
    # acordes muy suaves de fondo (registro medio, nada de graves)
    pad = np.zeros(n)
    bar = eighth * 16
    for b in range(int(n / SR / bar) + 1):
        i0, L = int(b * bar * SR), int(bar * SR)
        L = min(L, n - i0)
        if L <= 0:
            break
        tt = np.arange(L) / SR
        c = prog[b % 4]
        env = np.minimum(1, tt / 0.6) * np.minimum(1, (bar - tt) / 0.6)
        for d in (0, 2, 4):
            pad[i0:i0 + L] += 0.06 * np.sin(2 * np.pi * key / 2 * major[(c + d) % 7] * tt) * env
    return out + pad


def make_soundtrack(duration: float, cuts: list[float], hits: list[float], out: Path, seed: int = 1, volume: float = 0.16, sfx: bool = True, style: str = "bright", loop: bool = False):
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
    elif style != "dark":
        track = _bright_loop(n, rng)

    if sfx:
        # Sin "whoosh" en cada cambio de plano. Golpe suave solo en el gancho y en momentos fuertes, separados 15 s.
        sel, last = [], -99.0
        for h in sorted(hits):
            if h - last >= 15:
                sel.append(h); last = h
        hits = sel
        for h in hits:
            i0 = int(h * SR)
            L = int(1.6 * SR)
            if i0 + L > n:
                continue
            tt = np.arange(L) / SR
            boom = np.sin(2 * np.pi * (45 + 30 * np.exp(-tt * 8)) * tt) * np.exp(-tt * 2.5)
            track[i0:i0 + L] += boom * (2.2 if style == "dark" else 0.9)

    # Fundido de entrada/salida y normalización
    fade = int((0.06 if loop else 1.5) * SR)  # en bucle: sin fundidos que delaten el final
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
