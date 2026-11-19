"""Paso 3: convierte cada guion en vídeo (voz + música + animación + subtítulos).

Uso:
  python pipeline/build.py                 # todos los guiones de la semana actual
  python pipeline/build.py --story x.json  # un guion suelto (pruebas)
"""
from __future__ import annotations

import argparse
import subprocess
import sys
import tempfile
import zlib
from pathlib import Path

from common import RENDERER, load_config, read_json, run_id, week_dir, write_json
from soundtrack import make_soundtrack
from voice import synth

GAP = 0.12      # silencio entre planos (s): las frases van seguidas
LEAD_IN = 0.2   # silencio inicial
END_CARD = 2.4  # tarjeta final (s)


def build_story(story: dict, out_dir: Path, cfg: dict) -> Path:
    sid = story["id"]
    work = Path(tempfile.mkdtemp(prefix=f"{sid}-"))
    print(f"\n== {sid}: {story['title']}")

    # 1) Voz por plano -> tiempos (en los sketches, cada personaje tiene su voz)
    cast = story.get("cast") or {}
    presets = (cfg.get("comedia") or {}).get("voces", {})
    narrator = presets.get((cfg.get("comedia") or {}).get("narrador", "")) if cast else None
    gap = story.get("gap", GAP)
    t = LEAD_IN
    beats, words, parts = [], [], []
    for i, b in enumerate(story["beats"]):
        mp3 = work / f"b{i:02d}.mp3"
        sp = b.get("speaker") or "narrador"
        voice = presets.get(cast[sp]["voice"]) if sp in cast else narrator
        dur, ws = synth(b["text"], mp3, cfg, voice)
        start = t
        for w in ws:
            words.append({"w": w["w"], "b": i, "sp": sp, "start": round(start + w["start"], 3), "end": round(start + w["end"], 3)})
        end = start + dur + gap
        # El primer plano empieza en 0 para que no haya negro.
        bstart = 0.0 if i == 0 else round(start - gap / 2, 3)
        beats.append({**b, "speaker": sp, "start": bstart, "end": round(end - gap / 2, 3), "voice_dur": round(start + dur - bstart, 3)})
        parts.append((mp3, start))
        t = end
    total = t + END_CARD
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

    # 4) Mezcla final (la música baja cuando habla la voz)
    audio = work / "audio.m4a"
    subprocess.run([
        "ffmpeg", "-y", "-loglevel", "error", "-i", str(voice), "-i", str(music), "-filter_complex",
        "[0:a]loudnorm=I=-15:TP=-1.5:LRA=7,asplit=2[vo][sc];[1:a][sc]sidechaincompress=threshold=0.04:ratio=6:attack=20:release=400[bg];"
        "[vo][bg]amix=inputs=2:normalize=0,alimiter=limit=0.95[out]",
        "-map", "[out]", "-c:a", "aac", "-b:a", "192k", str(audio),
    ], check=True)

    # 5) Timeline -> render
    c = cfg["canal"]
    timeline = {
        "seed": sid, "fps": 30, "total": round(total, 3),
        "beats": beats, "words": words,
        "cast": cast, "subtitle_style": story.get("subtitle_style", "page"),
        "endcard": {"duration": END_CARD, "title": c["tarjeta_final"]["titulo"], "subtitle": c["tarjeta_final"]["subtitulo"], "handle": c["handle"]},
    }
    tl_path = out_dir / f"{sid}.timeline.json"
    write_json(tl_path, timeline)
    mp4 = out_dir / f"{sid}.mp4"
    subprocess.run(["node", str(RENDERER / "render.mjs"), str(tl_path), str(mp4), "--audio", str(audio)], check=True)
    # Miniatura para la página de revisión (fotograma del gancho)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", "1.5", "-i", str(mp4), "-frames:v", "1", "-vf", "scale=360:-1", str(out_dir / f"{sid}.jpg")], check=True)
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
            ok.append(st)
        except Exception as e:
            print(f"  error montando {st['id']}: {e}", file=sys.stderr)
    write_json(wd / "stories.json", stories)
    print(f"\nVídeos montados: {len(ok)}/{len(stories)}")
    if not ok:
        sys.exit("No se montó ningún vídeo")


if __name__ == "__main__":
    main()
