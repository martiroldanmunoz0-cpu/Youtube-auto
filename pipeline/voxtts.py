"""Voces clonadas con VoxCPM2 (Apache-2.0) + comprobación con Whisper (MIT).

- Cada voz es assets/voices/<nombre>.wav + <nombre>.txt (audio de referencia y su transcripción).
- Cada frase se genera "continuando" la referencia, así imita timbre y forma de narrar.
- Whisper escucha el resultado: si no dice el texto del guion se repite (hasta 3 intentos, se queda el mejor).
- Whisper también da el momento exacto de cada palabra para los subtítulos.

Funciona en CPU (unas 3-4 veces más lento que tiempo real). Si algo falla, voice.py usa Edge TTS.
"""
from __future__ import annotations

import difflib
import re
import subprocess
from pathlib import Path

import numpy as np

from common import ROOT

VOICES_DIR = ROOT / "assets" / "voices"
_model = None
_asr = None


def available(name: str) -> bool:
    return (VOICES_DIR / f"{name}.wav").exists() and (VOICES_DIR / f"{name}.txt").exists()


def _load_asr():
    """Whisper solo (para el revisor de vídeos)."""
    global _asr
    if _asr is None:
        from faster_whisper import WhisperModel  # noqa: PLC0415

        _asr = WhisperModel("small", device="cpu", compute_type="int8")
    return None, _asr


def _load():
    global _model
    if _model is None:
        import warnings

        warnings.filterwarnings("ignore")
        from voxcpm import VoxCPM  # noqa: PLC0415

        print("  cargando VoxCPM2 (voces clonadas)...", flush=True)
        _model = VoxCPM.from_pretrained("openbmb/VoxCPM2", load_denoiser=False, optimize=False, device="cpu")
    return _model, _load_asr()[1]


_UNITS = {"cero": 0, "un": 1, "uno": 1, "una": 1, "dos": 2, "tres": 3, "cuatro": 4, "cinco": 5, "seis": 6, "siete": 7,
          "ocho": 8, "nueve": 9, "diez": 10, "once": 11, "doce": 12, "trece": 13, "catorce": 14, "quince": 15,
          "dieciseis": 16, "diecisiete": 17, "dieciocho": 18, "diecinueve": 19, "veinte": 20, "veintiuno": 21,
          "veintiun": 21, "veintiuna": 21, "veintidos": 22, "veintitres": 23, "veinticuatro": 24, "veinticinco": 25,
          "veintiseis": 26, "veintisiete": 27, "veintiocho": 28, "veintinueve": 29, "treinta": 30, "cuarenta": 40,
          "cincuenta": 50, "sesenta": 60, "setenta": 70, "ochenta": 80, "noventa": 90, "cien": 100, "ciento": 100,
          "doscientos": 200, "doscientas": 200, "trescientos": 300, "trescientas": 300, "cuatrocientos": 400,
          "cuatrocientas": 400, "quinientos": 500, "quinientas": 500, "seiscientos": 600, "seiscientas": 600,
          "setecientos": 700, "setecientas": 700, "ochocientos": 800, "ochocientas": 800, "novecientos": 900,
          "novecientas": 900}
_SCALES = {"mil": 1000, "millon": 1_000_000, "millones": 1_000_000}
_ROMAN = {"ii": "2", "iii": "3", "iv": "4", "vi": "6", "vii": "7", "viii": "8", "ix": "9"}


def _merge_numbers(words: list[str]) -> list[str]:
    """«ocho mil trescientos» -> «8300», «cuarenta» -> «40» (para comparar con lo que escribe Whisper)."""
    out, i = [], 0
    while i < len(words):
        w = words[i]
        if w in _UNITS or (w in _SCALES and w != "millon"):
            total, cur, j = 0, 0, i
            while j < len(words) and (words[j] in _UNITS or words[j] in _SCALES or (words[j] == "y" and j + 1 < len(words) and words[j + 1] in _UNITS)):
                t = words[j]
                if t == "y":
                    j += 1
                    continue
                if t in _UNITS:
                    cur += _UNITS[t]
                else:
                    cur = max(cur, 1) * _SCALES[t]
                    if _SCALES[t] >= 1000:
                        total += cur
                        cur = 0
                j += 1
            out.append(str(total + cur))
            i = j
        else:
            out.append(w)
            i += 1
    return out


def _words(s: str) -> list[str]:
    s = s.lower()
    for a, b in zip("áéíóúü", "aeiouu"):
        s = s.replace(a, b)
    s = re.sub(r"(?<=\d)[.,](?=\d{3}\b)", "", s)  # 8.300 -> 8300
    s = re.sub(r"[.,;:!?¿¡…]", " | ", s)              # la puntuación corta los números ("dos. cuarenta" ≠ 42)
    out = [_ROMAN.get(w, w) for w in re.sub(r"[^a-zñ0-9| ]", " ", s).split()]
    return [w for w in _merge_numbers(out) if w != "|"]


def _similarity(target: str, heard: str) -> float:
    """Proporción de palabras del guion que se oyen bien.
    Una palabra cambiada solo se perdona si es casi igual letra a letra (Rober/Robert);
    palabras que faltan o sobran ("no", "las"...) siempre cuentan como error."""
    tw, hw = _words(target), _words(heard)
    if not tw:
        return 1.0
    ok = 0
    for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(None, tw, hw).get_opcodes():
        if tag == "equal":
            ok += i2 - i1
        elif tag == "replace":
            # Palabra partida o unida por Whisper ("curiosi diario" / "curiosidario"): comparar el bloque junto
            if difflib.SequenceMatcher(None, "".join(tw[i1:i2]), "".join(hw[j1:j2])).ratio() >= 0.9:
                ok += i2 - i1
                continue
            for x, y in zip(tw[i1:i2], hw[j1:j2]):
                if difflib.SequenceMatcher(None, x, y).ratio() >= 0.85:
                    ok += 1
    return ok / max(len(tw), len(hw))


def _transcribe(asr, wav: np.ndarray, sr: int):
    import librosa  # noqa: PLC0415

    y = librosa.resample(np.asarray(wav, dtype=np.float32), orig_sr=sr, target_sr=16000)
    segs, _ = asr.transcribe(y, language="es", word_timestamps=True)
    return [w for s in segs for w in (s.words or [])]


def _align(text: str, heard) -> list[dict]:
    """Tiempos de Whisper aplicados a las palabras ORIGINALES del guion (con su puntuación)."""
    tokens = text.split()
    hw = [(_words(w.word) or [""])[0] for w in heard]
    tw = [(_words(t) or [""])[0] for t in tokens]
    sm = difflib.SequenceMatcher(None, tw, hw)
    times: list[tuple[float, float] | None] = [None] * len(tokens)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            w = heard[blk.b + k]
            times[blk.a + k] = (float(w.start), float(w.end))
    # Rellenar palabras sin pareja interpolando entre vecinas
    known = [i for i, t in enumerate(times) if t]
    end_all = float(heard[-1].end) if heard else 0.5 * len(tokens)
    for i, t in enumerate(times):
        if t:
            continue
        prev = max((k for k in known if k < i), default=None)
        nxt = min((k for k in known if k > i), default=None)
        a = times[prev][1] if prev is not None else 0.0
        b = times[nxt][0] if nxt is not None else end_all
        gap_idx = [j for j in range(len(tokens)) if (prev is None or j > prev) and (nxt is None or j < nxt)]
        pos = gap_idx.index(i)
        step = (b - a) / max(1, len(gap_idx))
        times[i] = (a + pos * step, a + (pos + 1) * step)
    return [{"w": tok, "start": round(s, 3), "end": round(e, 3)} for tok, (s, e) in zip(tokens, times)]


def synth(text: str, out_audio: Path, voice_name: str, attempts: int = 4, min_ok: float = 0.92, floor: float = 0.8) -> tuple[float, list[dict]]:
    """Genera `text` con la voz clonada `voice_name`. Devuelve (duración, palabras con tiempos)."""
    import soundfile as sf  # noqa: PLC0415

    model, asr = _load()
    ref = VOICES_DIR / f"{voice_name}.wav"
    ref_text = (VOICES_DIR / f"{voice_name}.txt").read_text(encoding="utf-8").strip()
    sr = model.tts_model.sample_rate
    best = None
    for i in range(attempts):
        wav = model.generate(
            text=text, cfg_value=2.0, inference_timesteps=10, max_len=1200, retry_badcase=False,
            reference_wav_path=str(ref), prompt_wav_path=str(ref), prompt_text=ref_text,
        )
        heard = _transcribe(asr, wav, sr)
        score = _similarity(text, " ".join(w.word for w in heard))
        if best is None or score > best[0]:
            best = (score, wav, heard)
        if score >= min_ok:
            break
        print(f"    reintento ({score:.0%} parecido): «{text[:50]}»", flush=True)
    score, wav, heard = best
    if score < floor:
        raise RuntimeError(f"la voz clonada no dice bien el texto ({score:.0%})")
    wav_path = out_audio.with_suffix(".wav")
    sf.write(str(wav_path), np.asarray(wav, dtype=np.float32), sr)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav_path), "-b:a", "192k", str(out_audio)], check=True)
    words = _align(text, heard) if heard else []
    return len(wav) / sr, words
