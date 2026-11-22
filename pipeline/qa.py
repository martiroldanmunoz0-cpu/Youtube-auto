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


def empty_stretches(mp4: Path, w: int = 270, h: int = 480, limit: float = 0.008, min_run: int = 3) -> list[tuple[int, int]]:
    """Tramos de >= min_run segundos casi sin dibujos (solo fondo): se mide la proporción de trazos oscuros
    (contornos de los dibujos) en la zona central, sin subtítulos ni etiquetas."""
    import numpy as np  # noqa: PLC0415

    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(mp4), "-vf", f"fps=1,scale={w}:{h}", "-f", "rawvideo",
                          "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
    if not raw:
        return []
    fr = np.frombuffer(raw, np.uint8).reshape(-1, h, w, 3)
    dark = (fr[:, int(h * 0.26):int(h * 0.86)].max(axis=3) < 95).mean(axis=(1, 2))
    runs, start = [], None
    for i, v in enumerate(list(dark) + [1.0]):
        if v < limit and start is None:
            start = i
        elif v >= limit and start is not None:
            if i - start >= min_run:
                runs.append((start, i - 1))
            start = None
    return runs


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
    want = (1920, 1080) if timeline.get("formato") == "horizontal" else (1080, 1920)
    if (v.get("width"), v.get("height")) != want:
        problems.append(f"Tamaño incorrecto {v.get('width')}x{v.get('height')} (debe ser {want[0]}x{want[1]})")
    if abs(fmt_dur - total) > 0.3:
        problems.append(f"Duración {fmt_dur:.1f}s distinta de la prevista {total:.1f}s (posible corte)")
    for kind in ("video", "audio"):
        d = float(streams.get(kind, {}).get("duration") or fmt_dur)
        if d < total - 0.3:
            problems.append(f"La pista de {'imagen' if kind == 'video' else 'sonido'} se corta antes de tiempo ({d:.1f}s de {total:.1f}s)")
    if timeline.get("formato") == "horizontal":  # vídeo largo: 7-11 minutos
        if fmt_dur < 420 or fmt_dur > 660:
            problems.append(f"Dura {fmt_dur / 60:.1f} min: fuera de los 8-10 minutos previstos")
    else:
        if fmt_dur < 15:
            problems.append(f"Demasiado corto para un Short ({fmt_dur:.0f}s)")
        if 15 <= fmt_dur < 38:
            problems.append(f"Dura {fmt_dur:.0f}s: menos de los 40 s que quieres")
        elif 63 < fmt_dur <= 180:
            problems.append(f"Dura {fmt_dur:.0f}s: más de 1 minuto")
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
    def dark_scene_at(sec: float) -> bool:
        """Escenas oscuras a propósito (ojos en la oscuridad, agujero negro): no cuentan como pantallazo negro."""
        for b in timeline.get("beats", []):
            if b["start"] - 0.4 <= sec < b["end"] + 0.4:
                p = b.get("params") or {}
                if b.get("scene") == "eyes_dark" or (b.get("scene") == "space" and p.get("object") == "blackhole"):
                    return True
        return False

    for m in re.finditer(r"black_start:([\d.]+) black_end:([\d.]+)", _ffmpeg_log(mp4, vf="blackdetect=d=0.4:pix_th=0.06")):
        s, e = float(m.group(1)), float(m.group(2))
        if s > 0.5 and s < body_end and not (dark_scene_at(s) and dark_scene_at(e)):
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
    # 5) Escenas casi vacías (solo fondo, sin dibujos)
    try:
        for a_, b_ in empty_stretches(mp4):
            problems.append(f"Del segundo {a_} al {b_} casi no hay dibujos (solo el fondo)")
    except Exception as e:  # noqa: BLE001
        print(f"  aviso: no se pudo comprobar si hay escenas vacías ({e})")
    return problems
