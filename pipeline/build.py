"""Paso 3: convierte cada guion en vídeo (voz + música + animación + subtítulos).

Uso:
  python pipeline/build.py                 # todos los guiones de la semana actual
  python pipeline/build.py --story x.json  # un guion suelto (pruebas)
"""
from __future__ import annotations

import argparse
import os
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
LEAD_IN = 0.0   # sin silencio inicial: la voz arranca en el fotograma 0
END_CARD = 2.4  # tarjeta final (s)


VOICE_MINUTES = 12  # pasado este tiempo generando voz, no se repite ninguna frase más (prioridad: velocidad)
VOICE_ISSUES = ("narración", "La voz", "Silencio", "pisadas")


def cached_synth(cache: Path, text: str, cfg: dict, voice: dict | None) -> tuple[Path, float, list[dict]]:
    """Voz de una frase con caché: si ya se generó (y pasó la revisión de Whisper) se reutiliza tal cual."""
    # La clave incluye el motor forzado (VOZ_MOTOR) para no reutilizar nunca una voz de otro motor
    key = hashlib.sha1(json.dumps([text, voice or cfg["voz"], os.environ.get("VOZ_MOTOR", "")], ensure_ascii=False, sort_keys=True).encode()).hexdigest()[:16]
    mp3, meta = cache / f"{key}.mp3", cache / f"{key}.json"
    try:
        import voxtts  # noqa: PLC0415
    except Exception:
        voxtts = None
    if mp3.exists() and meta.exists():
        m = json.loads(meta.read_text(encoding="utf-8"))
        if voxtts is not None:
            voxtts.WARNINGS.extend(m.get("avisos", []))  # los avisos de la frase siguen apareciendo al reutilizarla
        return mp3, m["dur"], m["words"]
    cache.mkdir(parents=True, exist_ok=True)
    before = len(voxtts.WARNINGS) if voxtts is not None else 0
    dur, ws = synth(text, mp3, cfg, voice)  # aquí dentro Whisper revisa la frase y la repite si falla
    avisos = voxtts.WARNINGS[before:] if voxtts is not None else []
    meta.write_text(json.dumps({"text": text, "dur": dur, "words": ws, "avisos": avisos}, ensure_ascii=False), encoding="utf-8")
    return mp3, dur, ws


def apuntar_pendientes(nombres: list[str], vid: str) -> None:
    """Piezas por dibujar: un archivo por vídeo (data/piezas_pendientes/<id>.json), para que las máquinas que montan
    a la vez nunca choquen al guardar. La sesión de Claude del lunes las dibuja todas y borra los archivos."""
    d = RENDERER.parent / "data" / "piezas_pendientes"
    d.mkdir(parents=True, exist_ok=True)
    (d / f"{vid}.json").write_text(json.dumps(list(dict.fromkeys(map(str, nombres))), ensure_ascii=False), encoding="utf-8")


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
    try:
        import voxtts  # noqa: PLC0415

        voxtts.WARNINGS.clear()
        voxtts.DEADLINE[0] = __import__("time").time() + VOICE_MINUTES * 60  # tiempo máximo de reintentos de voz
    except Exception:
        voxtts = None
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
    tarjeta = cfg["canal"].get("tarjeta_final") or {}
    con_tarjeta = tarjeta.get("mostrar", True)
    end_dur = END_CARD if con_tarjeta else 0.2  # sin tarjeta: el final enlaza con el principio (bucle)
    outro = tarjeta.get("locucion", "").strip() if con_tarjeta else ""
    if outro:
        try:
            mp3, odur, _ = cached_synth(cache, outro, cfg, {**(narrator or {}), "tolerante": True})
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
    make_soundtrack(total, cuts, hits, music, seed=zlib.crc32(sid.encode()) % 10_000, volume=m.get("volumen_ambiente", 0.16), sfx=m.get("efectos", True), style=story.get("music", "dark"), loop=not con_tarjeta)

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
        "cast": cast, "looks": story.get("looks", {}), "subtitle_style": story.get("subtitle_style", "page"),
        "endcard": ({"duration": round(end_dur, 3), "title": c["tarjeta_final"]["titulo"], "subtitle": c["tarjeta_final"]["subtitulo"], "handle": c["handle"]}
                    if con_tarjeta else None),
        "cover": {"text": story.get("cover_text") or story.get("question") or story["title"].replace(" #shorts", ""), "channel": c.get("nombre", "")},
        "hook": {"text": story.get("cover_text") or story.get("question") or "", "dur": 2.3},
    }
    tl_path = out_dir / f"{sid}.timeline.json"
    write_json(tl_path, timeline)
    mp4 = out_dir / f"{sid}.mp4"
    r = subprocess.run(["node", str(RENDERER / "render.mjs"), str(tl_path), str(mp4), "--audio", str(audio)], capture_output=True, text=True)
    print(r.stdout[-2000:], end="")
    if r.returncode != 0:
        raise RuntimeError(f"el motor de animación falló: {r.stderr[-800:]}")
    scene_errors = [l for l in r.stderr.splitlines() if "AVISO escena con error" in l]
    unknown_pieces = sorted({l.split("AVISO pieza desconocida:")[-1].strip() for l in r.stderr.splitlines() if "AVISO pieza desconocida" in l})
    unknown_pieces += [p for b in story["beats"] for p in (b.get("params") or {}).get("_faltan", []) if p not in unknown_pieces]
    # Portada propia (se sube a YouTube como miniatura) y versión pequeña para la página de revisión
    portada = out_dir / f"{sid}_portada.jpg"
    rc = subprocess.run(["node", str(RENDERER / "render.mjs"), str(tl_path), str(portada), "--cover"], capture_output=True, text=True)
    if rc.returncode == 0 and portada.exists():
        story["portada"] = portada.name
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(portada), "-vf", "scale=540:-1", str(out_dir / f"{sid}.jpg")], check=True)
    else:
        print(f"  aviso: no se pudo hacer la portada ({rc.stderr[-300:]})")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", "1.5", "-i", str(mp4), "-frames:v", "1", "-vf", "scale=360:-1", str(out_dir / f"{sid}.jpg")], check=True)
    # Revisor automático del vídeo final
    story["qa"] = qa.check(mp4, timeline, " ".join([b["text"] for b in story["beats"]] + ([outro] if outro else [])), end_dur)
    if voxtts is not None:
        story["qa"] += list(dict.fromkeys(voxtts.WARNINGS))  # frases que no salieron perfectas (misma voz)
    story["qa"] += [f"Una escena no se pudo dibujar y salió en blanco ({e.split('AVISO escena con error')[-1].strip()[:120]})" for e in scene_errors]
    if unknown_pieces:
        # Ya no es un fallo para el dueño: se usó la pieza más parecida y queda apuntada para dibujarla el lunes
        print(f"  piezas apuntadas para dibujar: {', '.join(dict.fromkeys(unknown_pieces))}")
        story["piezas_pendientes"] = list(dict.fromkeys((story.get("piezas_pendientes") or []) + unknown_pieces))
    if story.get("piezas_pendientes"):
        apuntar_pendientes(story["piezas_pendientes"], story["id"])
    print("  revisión: " + ("✅ todo correcto" if not story["qa"] else "⚠️ " + " | ".join(story["qa"])), flush=True)
    return mp4


def build_one(st: dict, wd: Path, cfg: dict) -> bool:
    try:
        st["video"] = build_story(st, wd, cfg).name
        # Si el revisor encontró un fallo de IMAGEN/MONTAJE, se vuelve a montar reutilizando las voces (1-2 min).
        # Los avisos de VOZ no se regeneran (sería muy lento): se quedan en el issue para que decidas tú.
        image_problems = [q for q in st.get("qa", []) if not q.startswith("Frase revisable") and not any(k in q for k in VOICE_ISSUES)]
        if image_problems:
            first = st["qa"]
            print("  vuelvo a montar la imagen reutilizando las voces ya revisadas...", flush=True)
            build_story(st, wd, cfg, reuse_voice=True)
            if len(st["qa"]) > len(first):
                st["qa"] = first
        return True
    except Exception as e:
        print(f"  error montando {st['id']}: {e}", file=sys.stderr)
        return False


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--story", help="JSON con un guion (formato interno) para probar")
    ap.add_argument("--out", help="carpeta de salida")
    ap.add_argument("--parte", type=int, help="montar solo una parte de los vídeos (para ir en paralelo)")
    ap.add_argument("--partes", type=int, default=1, help="en cuántas partes se reparte la tanda")
    ap.add_argument("--unir", action="store_true", help="juntar los resultados de todas las partes")
    ap.add_argument("--revisar", action="store_true", help="publicar cada vídeo para revisión nada más montarlo")
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

    if args.unir:  # junta lo que ha montado cada máquina
        done = {}
        for f in sorted(wd.glob("parte-*.json")):
            for r in read_json(f, []):
                done[r["id"]] = r
        for st in stories:
            if st["id"] in done and (wd / done[st["id"]]["video"]).exists():
                st["video"], st["qa"] = done[st["id"]]["video"], done[st["id"]].get("qa", [])
        write_json(wd / "stories.json", stories)
        n = sum(1 for st in stories if st.get("video"))
        print(f"Vídeos montados entre todas las partes: {n}/{len(stories)}")
        if not n:
            sys.exit("No se montó ningún vídeo")
        return

    if args.parte is not None:  # solo los vídeos que tocan a esta máquina
        mine = [st for i, st in enumerate(stories) if i % args.partes == args.parte]
        print(f"Parte {args.parte + 1}/{args.partes}: {len(mine)} vídeos")
        results = []
        analysis = read_json(wd / "analysis.json", {}) or {}
        for st in mine:
            if not build_one(st, wd, cfg):
                continue
            results.append({"id": st["id"], "video": st["video"], "qa": st.get("qa", [])})
            write_json(wd / f"parte-{args.parte}.json", results)
            if args.revisar:  # en cuanto está listo: issue propio + aviso al móvil
                import review  # noqa: PLC0415

                try:
                    review.review_one(st, run_id(), wd, cfg, analysis)
                except Exception as e:
                    print(f"  error publicando {st['id']} para revisión: {e}", file=sys.stderr)
        if mine and not results:
            sys.exit("No se montó ningún vídeo de esta parte")
        return

    ok = [st for st in stories if build_one(st, wd, cfg)]
    write_json(wd / "stories.json", stories)
    print(f"\nVídeos montados: {len(ok)}/{len(stories)}")
    if not ok:
        sys.exit("No se montó ningún vídeo")


if __name__ == "__main__":
    main()
