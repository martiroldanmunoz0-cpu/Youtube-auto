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


def trim_silence(path: Path, words: list[dict] | None = None, pad: float = 0.03) -> tuple[float, list[dict] | None]:
    """Quita el silencio del principio y del final de un audio de voz para que las frases se encadenen.
    Ajusta los tiempos de las palabras. Devuelve (duración nueva, palabras)."""
    dur = _probe_duration(path)
    log = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", str(path), "-af", "silencedetect=noise=-42dB:d=0.04", "-f", "null", "-"],
        capture_output=True, text=True,
    ).stderr
    starts = [float(x) for x in re.findall(r"silence_start: (-?[\d.]+)", log)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
    lead = ends[0] if starts and starts[0] <= 0.02 and ends else 0.0
    tail = starts[-1] if starts and (len(ends) < len(starts) or ends[-1] >= dur - 0.02) else dur
    if words:  # nunca cortar una palabra marcada por el TTS
        lead = min(lead, max(0.0, words[0]["start"] - 0.01))
        tail = max(tail, words[-1]["end"])
    a, b = max(0.0, lead - pad), min(dur, tail + pad)
    if a <= 0.01 and b >= dur - 0.01:
        return dur, words
    tmp = path.with_name(path.stem + "_trim" + path.suffix)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(path), "-ss", f"{a:.3f}", "-to", f"{b:.3f}", str(tmp)], check=True)
    tmp.replace(path)
    if words:
        words = [{**w, "start": max(0.0, w["start"] - a), "end": max(0.0, w["end"] - a)} for w in words]
    return _probe_duration(path), words


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


_CLONE_STATE: dict[str, bool] = {}


def clone_ready(name: str) -> bool:
    """¿Se puede usar la voz clonada? Se decide una sola vez por ejecución (así no se mezclan voces)."""
    if name not in _CLONE_STATE:
        try:
            import voxtts  # noqa: PLC0415

            if not voxtts.available(name):
                raise RuntimeError(f"no existe assets/voices/{name}.wav")
            voxtts.ensure_loaded()
            _CLONE_STATE[name] = True
        except Exception as e:
            print(f"  aviso: voz clonada '{name}' no disponible ({e}); TODO el vídeo usará la voz de Edge")
            _CLONE_STATE[name] = False
    return _CLONE_STATE[name]


def synth(text: str, out_mp3: Path, cfg: dict, voice: dict | None = None) -> tuple[float, list[dict]]:
    """Genera la voz de un plano. `voice` permite otra voz/tono (personajes de los sketches).
    Devuelve (duración_s, palabras con tiempos relativos)."""
    v = {**cfg["voz"], **(voice or {})}
    motor = os.environ.get("VOZ_MOTOR", v.get("motor", "edge"))
    # 1) Voz clonada (VoxCPM2). Regla: NUNCA se mezclan voces dentro de un vídeo.
    #    - Si el modelo no se puede cargar -> todo el vídeo con Edge (decidido una vez, antes de la primera frase).
    #    - Si una frase concreta no sale perfecta -> se usa la mejor toma con la voz clonada y se avisa en el issue.
    if v.get("clon") and motor in ("clon", "auto", "edge") and os.environ.get("VOZ_MOTOR") not in ("edge", "espeak") and clone_ready(v["clon"]):
        import voxtts  # noqa: PLC0415

        relaxed = bool(v.get("tolerante"))  # p. ej. la despedida con el nombre del canal
        dur, words = voxtts.synth(text, out_mp3, v["clon"], attempts=2 if relaxed else 3,
                                  min_ok=0.75 if relaxed else 0.92, floor=0.6 if relaxed else 0.8)
        dur, words = trim_silence(out_mp3, words or None)
        return dur, (words or _estimate_words(text, dur))
    if motor != "espeak":
        last_err = None
        for _ in range(3):
            try:
                words = asyncio.run(_edge(text, out_mp3, v["voz"], v.get("velocidad", "+0%"), v.get("tono", "+0Hz")))
                if words:
                    words = _attach_punctuation(text, words)
                dur, words = trim_silence(out_mp3, words or None)
                return dur, (words or _estimate_words(text, dur))
            except Exception as e:  # red caída, servicio ocupado...
                last_err = e
        print(f"  aviso: Edge TTS falló ({last_err}); uso espeak-ng de respaldo")
    if not shutil.which("espeak-ng"):
        raise RuntimeError("No hay motor de voz disponible (instala espeak-ng o revisa la conexión con Edge TTS)")
    wav = out_mp3.with_suffix(".wav")
    subprocess.run(["espeak-ng", "-v", "es", "-s", "165", "-w", str(wav), text], check=True)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), str(out_mp3)], check=True)
    dur, _ = trim_silence(out_mp3)
    return dur, _estimate_words(text, dur)
