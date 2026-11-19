"""Revisor automático de cada vídeo montado.

Comprueba que el vídeo está bien antes de llegar a tu revisión:
  1. Duración: vídeo, audio y guion coinciden (nada cortado antes de tiempo).
  2. Narración completa: Whisper escucha el audio FINAL del vídeo y lo compara con el guion entero.
  3. Fluidez: no hay silencios largos entre frases ni frases pisadas.
  4. Imagen: no hay pantallazos negros ni imágenes congeladas a mitad de vídeo.
  5. Formato Short: vertical 1080x1920 y entre 15 s y 3 min.

Devuelve una lista de problemas (vacía = todo bien).
"""
from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path


def _probe(mp4: Path) -> dict:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "stream=codec_type,width,height,duration:format=duration", "-of", "json", str(mp4)],
        capture_output=True, text=True, check=True,
    ).stdout
    return json.loads(out)


def _ffmpeg_log(mp4: Path, vf: str | None = None, af: str | None = None) -> str:
    cmd = ["ffmpeg", "-hide_banner", "-nostats", "-i", str(mp4)]
    if vf:
        cmd += ["-vf", vf, "-an"]
    if af:
        cmd += ["-af", af, "-vn"]
    cmd += ["-f", "null", "-"]
    return subprocess.run(cmd, capture_output=True, text=True).stderr


def check(mp4: Path, timeline: dict, script_text: str, end_card: float = 2.4) -> list[str]:
    problems: list[str] = []
    info = _probe(mp4)
    total = float(timeline.get("total") or 0)
    fmt_dur = float(info["format"]["duration"])
    streams = {s["codec_type"]: s for s in info["streams"]}

    # 1) Duración y formato
    if "audio" not in streams:
        problems.append("El vídeo no tiene sonido")
    v = streams.get("video", {})
    if (v.get("width"), v.get("height")) != (1080, 1920):
        problems.append(f"Tamaño incorrecto {v.get('width')}x{v.get('height')} (debe ser 1080x1920)")
    if abs(fmt_dur - total) > 0.3:
        problems.append(f"Duración {fmt_dur:.1f}s distinta de la prevista {total:.1f}s (posible corte)")
    for kind in ("video", "audio"):
        d = float(streams.get(kind, {}).get("duration") or fmt_dur)
        if d < total - 0.3:
            problems.append(f"La pista de {'imagen' if kind == 'video' else 'sonido'} se corta antes de tiempo ({d:.1f}s de {total:.1f}s)")
    if fmt_dur < 15:
        problems.append(f"Demasiado corto para un Short ({fmt_dur:.0f}s)")
    if fmt_dur > 180:
        problems.append(f"Demasiado largo para un Short ({fmt_dur:.0f}s, máximo 180)")

    # 3) Fluidez: huecos entre palabras y última palabra antes del final
    words = timeline.get("words") or []
    for a, b in zip(words, words[1:]):
        gap = b["start"] - a["end"]
        if gap > 1.0:
            problems.append(f"Silencio de {gap:.1f}s en el segundo {a['end']:.0f} (entre «{a['w']}» y «{b['w']}»)")
        if gap < -0.15:
            problems.append(f"Frases pisadas en el segundo {b['start']:.0f} («{a['w']}» / «{b['w']}»)")
    if words and words[-1]["end"] > fmt_dur - end_card + 0.2:
        problems.append("La narración termina encima de la tarjeta final (se corta la última frase)")

    # 3b) Silencio total (sin voz NI música): señal de audio cortado
    for m in re.finditer(r"silence_start: ([\d.]+)", _ffmpeg_log(mp4, af="silencedetect=noise=-55dB:d=0.4")):
        st = float(m.group(1))
        if st < total - 0.5:
            problems.append(f"El sonido desaparece por completo en el segundo {st:.1f} (audio cortado)")

    # 4) Imagen: negros y congelados (ignorando el fundido inicial y la tarjeta final)
    body_end = total - end_card - 0.3
    for m in re.finditer(r"black_start:([\d.]+) black_end:([\d.]+)", _ffmpeg_log(mp4, vf="blackdetect=d=0.4:pix_th=0.06")):
        s, e = float(m.group(1)), float(m.group(2))
        if s > 0.5 and s < body_end:
            problems.append(f"Pantalla en negro del segundo {s:.1f} al {e:.1f}")
    for m in re.finditer(r"freeze_start: ([\d.]+)", _ffmpeg_log(mp4, vf="freezedetect=n=0.0005:d=1.5")):
        s = float(m.group(1))
        if 0.5 < s < body_end:
            problems.append(f"Imagen congelada en el segundo {s:.1f}")

    # 2) Narración completa en el audio final (si Whisper está disponible)
    try:
        import numpy as np  # noqa: PLC0415
        import voxtts  # noqa: PLC0415

        _, asr = voxtts._load_asr()
        raw = subprocess.run(
            ["ffmpeg", "-v", "error", "-i", str(mp4), "-vn", "-ac", "1", "-ar", "16000", "-f", "f32le", "-"],
            capture_output=True, check=True,
        ).stdout
        audio = np.frombuffer(raw, dtype=np.float32)
        segs, _ = asr.transcribe(audio, language="es", word_timestamps=True)
        heard = [w for sg in segs for w in (sg.words or [])]
        score = voxtts._similarity(script_text, " ".join(w.word for w in heard))
        if score < 0.85:
            problems.append(f"La narración del vídeo final no coincide del todo con el guion ({score:.0%})")
        if heard and heard[-1].end < (words[-1]["end"] - 1.0 if words else 0):
            problems.append(f"La voz se corta antes de terminar (última palabra oída en el segundo {heard[-1].end:.1f})")
    except ImportError:
        pass
    except Exception as e:  # el revisor nunca debe romper la tanda
        problems.append(f"No se pudo comprobar la narración con Whisper ({e})")
    return problems
