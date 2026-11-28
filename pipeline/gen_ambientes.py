"""Ambientes de fondo sintetizados por código (sin muestras ajenas: dominio público, CC0).

Crea en assets/sfx los bucles que la biblioteca no trae:
  amb_hospital  pitido del monitor cardiaco (~70 lpm) + zumbido de sala
  amb_cabina    rumor grave de cabina de avión
  amb_espacio   dron grave y lento, con un brillo que va y viene
  amb_bajo_agua rumor sordo + burbujitas sueltas
  amb_ciudad    tráfico lejano: coches que pasan (barridos de ruido)
  amb_sala      tono de habitación (zumbido muy suave)
  amb_reloj     tic-tac de reloj de pared
Uso: python pipeline/gen_ambientes.py
"""
from __future__ import annotations

import subprocess
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "sfx"
SR = 44100
rng = np.random.default_rng(42)


def lowpass(x: np.ndarray, fc: float) -> np.ndarray:
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x)
    s = 0.0
    for i, v in enumerate(x):  # un polo; suficiente para ruido de fondo
        s = (1 - a) * v + a * s
        y[i] = s
    return y


def lp(x, fc, n=2):
    for _ in range(n):
        x = lowpass(x, fc)
    return x


def t_(sec):
    return np.arange(int(sec * SR)) / SR


def loopable(x: np.ndarray, f: float = 1.0) -> np.ndarray:
    """Funde el final con el principio para que el bucle no se note."""
    n = int(f * SR)
    y = x[:-n].copy()
    y[:n] = y[:n] * np.linspace(0, 1, n) + x[-n:] * np.linspace(1, 0, n)
    return y


def norm(x, peak=0.9):
    return x / (np.max(np.abs(x)) + 1e-9) * peak


def env(n, att, rel):
    e = np.ones(n)
    a, r = int(att * SR), int(rel * SR)
    e[:a] = np.linspace(0, 1, a)
    e[n - r:] = np.linspace(1, 0, r)
    return e


def hospital():
    T = 21.0  # 70 lpm -> intervalo 0.857 s; 21 s = 24.5 latidos -> uso 24 latidos exactos
    period = 60 / 70
    T = period * 24
    x = np.zeros(int(T * SR) + SR)
    beep = np.sin(2 * np.pi * 980 * t_(0.13)) + 0.25 * np.sin(2 * np.pi * 1960 * t_(0.13))
    beep *= env(len(beep), 0.004, 0.05)
    for k in range(25):
        i = int(k * period * SR)
        x[i:i + len(beep)] += beep * 0.55
    n = len(x)
    room = lp(rng.standard_normal(n), 400) * 0.6 + 0.05 * np.sin(2 * np.pi * 60 * np.arange(n) / SR)
    vent = lp(rng.standard_normal(n), 900) * (0.5 + 0.5 * np.sin(2 * np.pi * np.arange(n) / SR / 4.0)) ** 2 * 0.5  # respirador suave
    x += norm(room, 0.12) + norm(vent, 0.08)
    return x[:int(T * SR)]  # el periodo encaja: bucle limpio


def cabina():
    n = int(21 * SR)
    x = lp(rng.standard_normal(n), 180, 3)
    x = norm(x, 0.7) + 0.08 * np.sin(2 * np.pi * 115 * np.arange(n) / SR) + norm(lp(rng.standard_normal(n), 1500), 0.08)
    return loopable(x)


def espacio():
    n = int(25 * SR)
    t = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * f * t + p) * a for f, a, p in [(55, 0.5, 0), (82.4, 0.3, 1), (110.3, 0.2, 2), (164.6, 0.08, 3)])
    x *= 0.7 + 0.3 * np.sin(2 * np.pi * t / 12.5)
    shim = np.sin(2 * np.pi * 659 * t) * 0.04 * (0.5 + 0.5 * np.sin(2 * np.pi * t / 8.33)) ** 3
    x = x + shim + norm(lp(rng.standard_normal(n), 250, 3), 0.15)
    return loopable(x, 2.0)


def bajo_agua():
    n = int(21 * SR)
    t = np.arange(n) / SR
    x = norm(lp(rng.standard_normal(n), 140, 3), 0.6) * (0.75 + 0.25 * np.sin(2 * np.pi * t / 7))
    for _ in range(40):
        i = int(rng.uniform(0, n - SR))
        d = rng.uniform(0.04, 0.09)
        f0 = rng.uniform(500, 1100)
        tt = t_(d)
        b = np.sin(2 * np.pi * (f0 + 2500 * tt / d * f0 / 800) * tt) * env(len(tt), 0.003, d * 0.7)
        x[i:i + len(b)] += b * rng.uniform(0.05, 0.15)
    return loopable(x)


def ciudad():
    n = int(24 * SR)
    t = np.arange(n) / SR
    x = norm(lp(rng.standard_normal(n), 220, 3), 0.35)
    for _ in range(9):  # coches que pasan
        c = rng.uniform(1.5, n / SR - 1.5)
        w = rng.uniform(0.9, 1.8)
        g = np.exp(-((t - c) / w) ** 2)
        car = lp(rng.standard_normal(n), rng.uniform(500, 900), 2)
        x += norm(car, 0.35) * g
    return loopable(x)


def sala():
    n = int(20 * SR)
    t = np.arange(n) / SR
    x = norm(lp(rng.standard_normal(n), 300, 3), 0.4) + 0.04 * np.sin(2 * np.pi * 120 * t)
    return loopable(x)


def reloj():
    T = 20.0
    x = np.zeros(int(T * SR))
    for k in range(40):
        i = int(k * 0.5 * SR)
        d = t_(0.02)
        f = 3200 if k % 2 == 0 else 2600
        c = np.sin(2 * np.pi * f * d) * env(len(d), 0.0005, 0.018) + rng.standard_normal(len(d)) * 0.3 * env(len(d), 0.0005, 0.015)
        x[i:i + len(c)] += c * 0.6
    return x + norm(lp(rng.standard_normal(len(x)), 300, 2), 0.04)


def write(name, x):
    raw = norm(x).astype(np.float32).tobytes()
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-",
                    "-c:a", "libvorbis", "-q:a", "4", str(OUT / f"{name}.ogg")], input=raw, check=True)
    print("ok", name, round(len(x) / SR, 1), "s")


if __name__ == "__main__":
    for name, fn in [("amb_hospital", hospital), ("amb_cabina", cabina), ("amb_espacio", espacio), ("amb_bajo_agua", bajo_agua),
                     ("amb_ciudad", ciudad), ("amb_sala", sala), ("amb_reloj", reloj)]:
        write(name, fn())
