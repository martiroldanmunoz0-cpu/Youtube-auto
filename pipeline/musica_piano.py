"""Música de fondo de los vídeos largos: pieza ORIGINAL de piano solo (sin viento ni efectos), compuesta aquí y tocada
con muestras de un piano de cola real (Salamander Grand Piano V3, de Alexander Holm, CC-BY 3.0; empaquetado MIT por
@audio-samples). Lenta (54 pulsaciones), en La menor, emotiva, de ~1 minuto y en bucle perfecto (el final enlaza con el
principio sin corte).

Uso: python pipeline/musica_piano.py  ->  assets/music/piano_curio.ogg
"""
from __future__ import annotations

import subprocess
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SAMPLES = ROOT / "assets" / "music" / "piano_samples"
OUT = ROOT / "assets" / "music" / "piano_curio.ogg"
SR = 44100
BPM = 54
BEAT = 60 / BPM
NAMES = ["C", "Cs", "D", "Ds", "E", "F", "Fs", "G", "Gs", "A", "As", "B"]
SAMPLED = {0: "C", 3: "Ds", 6: "Fs", 9: "A"}  # notas grabadas (cada tercera menor)

_cache: dict[str, np.ndarray] = {}


def _load(name: str) -> np.ndarray:
    if name not in _cache:
        raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(SAMPLES / f"{name}.ogg"), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                             capture_output=True, check=True).stdout
        _cache[name] = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
    return _cache[name]


def note(midi: int, vel: int) -> np.ndarray:
    """Nota MIDI con la muestra grabada más cercana, afinada por re-muestreo."""
    pc, octv = midi % 12, midi // 12 - 1
    best = min(SAMPLED, key=lambda s: min(abs(pc - s), 12 - abs(pc - s)))
    shift = pc - best
    if shift > 6:
        shift -= 12
    if shift < -6:
        shift += 12
    src_oct = octv + (1 if best - pc > 6 else -1 if pc - best > 6 else 0)
    name = f"{SAMPLED[best]}{src_oct}v{vel}"
    if not (SAMPLES / f"{name}.ogg").exists():
        name = f"{SAMPLED[best]}{max(1, min(7, src_oct))}v{vel}"
    x = _load(name)
    rate = 2 ** (shift / 12)
    return np.interp(np.arange(0, len(x) - 1, rate), np.arange(len(x)), x)


def m(n: str) -> int:  # "A3" -> 57
    o = int(n[-1]); k = n[:-1].replace("#", "s")
    return NAMES.index(k) + (o + 1) * 12


# Progresión (un acorde por compás de 4 tiempos): La m – Fa – Do – Sol ×2, La m – Fa – Re m – Mi (tensión que vuelve a La m)
CHORDS = [("A2", ["A3", "C4", "E4"]), ("F2", ["F3", "A3", "C4"]), ("C3", ["G3", "C4", "E4"]), ("G2", ["G3", "B3", "D4"])] * 2 + \
         [("A2", ["A3", "C4", "E4"]), ("F2", ["F3", "A3", "C4"]), ("D3", ["F3", "A3", "D4"]), ("E2", ["E3", "G#3", "B3"])]
# Melodía (nota, tiempo de inicio dentro del compás, duración en tiempos) por compás
MELODY = [
    [("E5", 0, 1.5), ("D5", 1.5, 0.5), ("C5", 2, 2)],
    [("C5", 0, 1), ("A4", 1, 1), ("C5", 2, 1), ("F5", 3, 1)],
    [("E5", 0, 3), ("G5", 3, 1)],
    [("D5", 0, 2), ("B4", 2, 2)],
    [("A5", 0, 1.5), ("G5", 1.5, 0.5), ("E5", 2, 2)],
    [("F5", 0, 1), ("E5", 1, 1), ("C5", 2, 2)],
    [("G5", 0, 1), ("E5", 1, 1), ("C5", 2, 1), ("E5", 3, 1)],
    [("D5", 0, 4)],
    [("C5", 0, 1), ("E5", 1, 1), ("A5", 2, 2)],
    [("A5", 0, 1), ("G5", 1, 1), ("F5", 2, 1), ("C5", 3, 1)],
    [("D5", 0, 2), ("F5", 2, 1), ("E5", 3, 1)],
    [("E5", 0, 2), ("G#4", 2, 1), ("B4", 3, 1)],
]


def render(cycles: int = 2) -> np.ndarray:
    bar = 4 * BEAT
    loop = len(CHORDS) * bar
    n = int((cycles * loop + 8) * SR)
    out = np.zeros(n)

    def put(midi, t, dur, vel, gain):
        x = note(midi, vel)
        L = min(len(x), int((dur + 1.2) * SR))  # pedal: suena un poco más de lo escrito y se apaga suave
        x = x[:L].copy(); rel = min(L, int(0.9 * SR)); x[L - rel:] *= np.linspace(1, 0, rel) ** 2
        i0 = int(t * SR)
        out[i0:i0 + L] += x[:max(0, min(L, n - i0))] * gain

    rng = np.random.default_rng(7)
    for c in range(cycles):
        for b, ((bass, chord), mel) in enumerate(zip(CHORDS, MELODY)):
            t0 = c * loop + b * bar
            put(m(bass), t0, 4 * BEAT, 8, 0.38)                       # bajo grave
            put(m(bass) + 12, t0 + 2 * BEAT, 2 * BEAT, 4, 0.25)
            arp = [chord[0], chord[1], chord[2], chord[1]] * 2           # arpegio suave en corcheas
            for k, nn in enumerate(arp):
                put(m(nn), t0 + k * BEAT / 2 + rng.uniform(0, 0.012), BEAT, 4, 0.22)
            for nn, st, du in mel:                                       # melodía
                put(m(nn), t0 + st * BEAT + rng.uniform(0, 0.01), du * BEAT, 8, 0.42)
    # Sala: reverberación suave (respuesta al impulso sintética, decae en ~2,5 s)
    ir_len = int(2.6 * SR)
    ir = np.random.default_rng(3).standard_normal(ir_len) * np.exp(-np.arange(ir_len) / (0.55 * SR))
    ir[0] = 0
    wet = np.fft.irfft(np.fft.rfft(out, n + ir_len) * np.fft.rfft(ir, n + ir_len))[:n]
    mix = out + 0.12 * wet / (np.max(np.abs(wet)) + 1e-9) * np.max(np.abs(out))
    # Bucle perfecto: el último ciclo incluye la cola del anterior al empezar, así al repetirse no hay corte
    seg = mix[int((cycles - 1) * loop * SR):int(cycles * loop * SR)]
    return seg / (np.max(np.abs(seg)) + 1e-9) * 0.9


def main() -> None:
    y = render()
    wav = OUT.with_suffix(".wav")
    with wave.open(str(wav), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes())
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-af", "highpass=f=55,equalizer=f=180:t=q:w=1:g=-3", "-c:a", "libvorbis", "-q:a", "6", str(OUT)], check=True)
    wav.unlink()
    print(f"{OUT} ({len(y) / SR:.1f} s, bucle)")


if __name__ == "__main__":
    main()
