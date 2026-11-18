"""Voz en off gratuita con tiempos por palabra (para los subtítulos).

Motor principal: Microsoft Edge TTS (gratis, voces neuronales, sin clave).
Respaldo: espeak-ng (robótico) con tiempos estimados, para que el sistema nunca se quede parado.
"""
from __future__ import annotations

import asyncio
import json
import os
import re
import shutil
import subprocess
from pathlib import Path


def _probe_duration(path: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", str(path)],
        capture_output=True, text=True, check=True,
    ).stdout
    return float(json.loads(out)["format"]["duration"])


async def _edge(text: str, out: Path, voice: str, rate: str, pitch: str) -> list[dict]:
    import edge_tts

    proxy = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
    com = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch, boundary="WordBoundary", proxy=proxy)
    words = []
    with open(out, "wb") as f:
        async for chunk in com.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                start = chunk["offset"] / 1e7
                words.append({"w": chunk["text"], "start": start, "end": start + chunk["duration"] / 1e7})
    return words


def _attach_punctuation(text: str, words: list[dict]) -> list[dict]:
    """Edge devuelve palabras sin signos; recuperamos los del texto original para los subtítulos."""
    tokens = text.split()
    out, ti = [], 0
    norm = lambda s: re.sub(r"[^\wáéíóúüñ]", "", s.lower())
    for w in words:
        target = norm(w["w"])
        j = ti
        while j < len(tokens) and norm(tokens[j]) != target and j < ti + 3:
            j += 1
        if j < len(tokens) and norm(tokens[j]) == target:
            # Palabras sueltas del texto que el TTS no marcó (p. ej. "¿") se pegan a la siguiente.
            prefix = " ".join(t for t in tokens[ti:j] if not norm(t))
            out.append({**w, "w": (prefix + " " if prefix else "") + tokens[j]})
            ti = j + 1
        else:
            out.append(w)
    return out


def _estimate_words(text: str, duration: float) -> list[dict]:
    tokens = text.split()
    weights = [len(t) + 2 for t in tokens]
    total = sum(weights) or 1
    t, out = 0.05, []
    for tok, wgt in zip(tokens, weights):
        d = (duration - 0.1) * wgt / total
        out.append({"w": tok, "start": t, "end": t + d})
        t += d
    return out


def synth(text: str, out_mp3: Path, cfg: dict) -> tuple[float, list[dict]]:
    """Genera la voz de un plano. Devuelve (duración_s, palabras con tiempos relativos)."""
    v = cfg["voz"]
    if os.environ.get("VOZ_MOTOR", v.get("motor", "edge")) == "edge":
        last_err = None
        for _ in range(3):
            try:
                words = asyncio.run(_edge(text, out_mp3, v["voz"], v.get("velocidad", "+0%"), v.get("tono", "+0Hz")))
                dur = _probe_duration(out_mp3)
                words = _attach_punctuation(text, words) if words else _estimate_words(text, dur)
                return dur, words
            except Exception as e:  # red caída, servicio ocupado...
                last_err = e
        print(f"  aviso: Edge TTS falló ({last_err}); uso espeak-ng de respaldo")
    if not shutil.which("espeak-ng"):
        raise RuntimeError("No hay motor de voz disponible (instala espeak-ng o revisa la conexión con Edge TTS)")
    wav = out_mp3.with_suffix(".wav")
    subprocess.run(["espeak-ng", "-v", "es", "-s", "165", "-w", str(wav), text], check=True)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), str(out_mp3)], check=True)
    dur = _probe_duration(out_mp3)
    return dur, _estimate_words(text, dur)
