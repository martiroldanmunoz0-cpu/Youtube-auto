"""Paso 3: convierte cada guion en vídeo (voz + música + animación + subtítulos).

Uso:
  python pipeline/build.py                 # todos los guiones de la semana actual
  python pipeline/build.py --story x.json  # un guion suelto (pruebas)
"""
from __future__ import annotations

import argparse
import shutil
import json
import hashlib
import subprocess
import sys
import tempfile
import zlib
from pathlib import Path

from common import RENDERER, load_config, read_json, run_id, week_dir, write_json
from soundtrack import make_soundtrack
from voice import synth
import qa

GAP = 0.12      # silencio entre planos (s): las frases van seguidas
LEAD_IN = 0.2   # silencio inicial
END_CARD = 2.4  # tarjeta final (s)


VOICE_ISSUES = ("narración", "La voz", "Silencio", "pisadas")


def cached_synth(cache: Path, text: str, cfg: dict, voice: dict | None) -> tuple[Path, float, list[dict]]:
    """Voz de una frase con caché: si ya se generó (y pasó la revisión de Whisper) se reutiliza tal cual."""
    key = hashlib.sha1(json.dumps([text, voice or cfg["voz"]], ensure_ascii=False, sort_keys=True).encode()).hexdigest()[:16]
    mp3, meta = cache / f"{key}.mp3", cache / f"{key}.json"
    if mp3.exists() and meta.exists():
        m = json.loads(meta.read_text(encoding="utf-8"))
        return mp3, m["dur"], m["words"]
    cache.mkdir(parents=True, exist_ok=True)
    dur, ws = synth(text, mp3, cfg, voice)  # aquí dentro Whisper revisa la frase y la repite si falla
    meta.write_text(json.dumps({"text": text, "dur": dur, "words": ws}, ensure_ascii=False), encoding="utf-8")
    return mp3, dur, ws


def build_story(story: dict, out_dir: Path, cfg: dict, reuse_voice: bool = True) -> Path:
    sid = story["id"]
    work = Path(tempfile.mkdtemp(prefix=f"{sid}-"))
    cache = out_dir / f"{sid}_voces"
    if not reuse_voice and cache.exists():
        shutil.rmtree(cache)  # el revisor encontró un fallo de voz: se generan de nuevo (y se revisan otra vez)
    print(f"\n== {sid}: {story['title']}" + ("" if reuse_voice else " (regenerando voces)"))

    # 1) Voz por plano -> tiempos (en los sketches, cada personaje tiene su voz)
    cast = story.get("cast") or {}
    presets = (cfg.get("comedia") or {}).get("voces", {})
    narrator = presets.get((cfg.get("comedia") or {}).get("narrador", "")) if cast else None
    gap = story.get("gap", GAP)
    t = LEAD_IN
    beats, words, parts = [], [], []
    for i, b in enumerate(story["beats"]):
        sp = b.get("speaker") or "narrador"
        voice = presets.get(cast[sp]["voice"]) if sp in cast else narrator
        mp3, dur, ws = cached_synth(cache, b["text"], cfg, voice)
        start = t
        for w in ws:
            words.append({"w": w["w"], "b": i, "sp": sp, "start": round(start + w["start"], 3), "end": round(start + w["end"], 3)})
        end = start + dur + gap
        # El primer plano empieza en 0 para que no haya negro.
        bstart = 0.0 if i == 0 else round(start - gap / 2, 3)
        beats.append({**b, "speaker": sp, "start": bstart, "end": round(end - gap / 2, 3), "voice_dur": round(start + dur - bstart, 3)})
        parts.append((mp3, start))
        t = end
    # Despedida hablada en la tarjeta final ("Sígueme para más curiosidades...") con la voz del narrador
    end_dur = END_CARD
    outro = (cfg["canal"].get("tarjeta_final") or {}).get("locucion", "").strip()
    if outro:
        try:
            mp3, odur, _ = cached_synth(cache, outro, cfg, narrator)
            parts.append((mp3, t + 0.35))
            end_dur = max(END_CARD, odur + 0.9)
        except Exception as e:
            print(f"  aviso: no se pudo generar la despedida hablada ({e})")
            outro = ""
    total = t + end_dur
    beats[-1]["end"] = round(total, 3)

    # 2) Pista de voz: cada plano colocado en su instante
    voice = work / "voice.wav"
    inputs, filters = [], []
    for k, (mp3, start) in enumerate(parts):
        inputs += ["-i", str(mp3)]
        ms = int(start * 1000)
        filters.append(f"[{k}:a]aresample=44100,adelay={ms}|{ms}[a{k}]")
    mix = "".join(f"[a{k}]" for k in range(len(parts)))
    filters.append(f"{mix}amix=inputs={len(parts)}:normalize=0,apad=whole_dur={total:.2f}[v]")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *inputs, "-filter_complex", ";".join(filters), "-map", "[v]", "-ac", "1", str(voice)], check=True)

    # 3) Música ambiente + efectos
    cuts = [b["start"] for b in beats[1:]]
    hits = [0.05] + [b["start"] for b in beats if b.get("camera") == "slam" or b.get("transition") in ("red", "flash")]
    music = work / "music.wav"
    m = cfg.get("musica", {})
    make_soundtrack(total, cuts, hits, music, seed=zlib.crc32(sid.encode()) % 10_000, volume=m.get("volumen_ambiente", 0.16), sfx=m.get("efectos", True), style=story.get("music", "dark"))

    # 4) Mezcla final (la música baja cuando habla la voz).
    # En dos pasos: normalizar la voz y luego mezclar con duración fija (en un solo paso ffmpeg recortaba el final).
    voice_norm = work / "voice_norm.wav"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(voice), "-af", "loudnorm=I=-15:TP=-1.5:LRA=7", "-ar", "44100", str(voice_norm)], check=True)
    audio = work / "audio.m4a"
    subprocess.run([
        "ffmpeg", "-y", "-loglevel", "error", "-i", str(voice_norm), "-i", str(music), "-filter_complex",
        "[0:a]asplit=2[vo][sc];[1:a][sc]sidechaincompress=threshold=0.04:ratio=6:attack=20:release=400[bg];"
        "[vo][bg]amix=inputs=2:duration=longest:normalize=0,alimiter=limit=0.95,apad[out]",
        "-map", "[out]", "-t", f"{total:.3f}", "-c:a", "aac", "-b:a", "192k", str(audio),
    ], check=True)

    # 5) Timeline -> render
    c = cfg["canal"]
    timeline = {
        "seed": sid, "fps": 30, "total": round(total, 3),
        "beats": beats, "words": words,
        "cast": cast, "subtitle_style": story.get("subtitle_style", "page"),
        "endcard": {"duration": round(end_dur, 3), "title": c["tarjeta_final"]["titulo"], "subtitle": c["tarjeta_final"]["subtitulo"], "handle": c["handle"]},
    }
    tl_path = out_dir / f"{sid}.timeline.json"
    write_json(tl_path, timeline)
    mp4 = out_dir / f"{sid}.mp4"
    subprocess.run(["node", str(RENDERER / "render.mjs"), str(tl_path), str(mp4), "--audio", str(audio)], check=True)
    # Miniatura para la página de revisión (fotograma del gancho)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", "1.5", "-i", str(mp4), "-frames:v", "1", "-vf", "scale=360:-1", str(out_dir / f"{sid}.jpg")], check=True)
    # Revisor automático del vídeo final
    story["qa"] = qa.check(mp4, timeline, " ".join([b["text"] for b in story["beats"]] + ([outro] if outro else [])), end_dur)
    print("  revisión: " + ("✅ todo correcto" if not story["qa"] else "⚠️ " + " | ".join(story["qa"])), flush=True)
    return mp4


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--story", help="JSON con un guion (formato interno) para probar")
    ap.add_argument("--out", help="carpeta de salida")
    args = ap.parse_args()
    cfg = load_config()
    if args.story:
        story = read_json(Path(args.story))
        out_dir = Path(args.out or Path(args.story).parent)
        build_story(story, out_dir, cfg)
        return
    wd = week_dir(run_id())
    stories = read_json(wd / "stories.json")
    if not stories:
        sys.exit("No hay stories.json en esta tanda")
    ok = []
    for st in stories:
        try:
            st["video"] = build_story(st, wd, cfg).name
            if st.get("qa"):  # el revisor encontró algo: se monta otra vez y se queda el mejor
                first = st["qa"]
                voice_problem = any(k in q for q in first for k in VOICE_ISSUES)
                print("  vuelvo a montarlo " + ("regenerando las voces..." if voice_problem else "reutilizando las voces ya revisadas..."), flush=True)
                build_story(st, wd, cfg, reuse_voice=not voice_problem)
                if len(st["qa"]) > len(first):
                    st["qa"] = first
            ok.append(st)
        except Exception as e:
            print(f"  error montando {st['id']}: {e}", file=sys.stderr)
    write_json(wd / "stories.json", stories)
    print(f"\nVídeos montados: {len(ok)}/{len(stories)}")
    if not ok:
        sys.exit("No se montó ningún vídeo")


if __name__ == "__main__":
    main()
