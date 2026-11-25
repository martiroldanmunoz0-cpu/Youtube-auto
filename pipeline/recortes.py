"""Shorts recortados de un vídeo largo (casi gratis: la voz y la animación ya están hechas).

Uso: python pipeline/recortes.py <id-largo>   (p. ej. largo-29-01)

1. Baja el vídeo largo de su release y lee su guion (data/guiones/<id>.json).
2. Claude (modelo barato) elige los mejores tramos de 25-58 s que se entienden solos y empiezan con gancho.
3. Cada tramo se monta en vertical 1080×1920: el vídeo grande en el centro, fondo desenfocado,
   el gancho arriba y «FULL VIDEO ON THE CHANNEL» abajo.
4. Cada Short va a «Revisar» como cualquier otro (issue propio, misma publicación).
Tiempos de los planos: data/tiempos/<id>.json (lo guarda el montaje). Si no existe (vídeos antiguos) se estiman por
palabras y los cortes se ajustan al silencio más cercano.
"""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from pathlib import Path

from common import DATA, ROOT, load_config, read_json, week_dir, write_json

FONT = ROOT / "assets" / "branding" / "fonts" / "Anton-Regular.ttf"
MODELO = "claude-haiku-5-5"

SCHEMA = {
    "type": "object",
    "properties": {"cortos": {"type": "array", "items": {"type": "object", "properties": {
        "desde": {"type": "integer"}, "hasta": {"type": "integer"},
        "gancho": {"type": "string"}, "titulo": {"type": "string"}, "descripcion": {"type": "string"},
        "por_que": {"type": "string"}},
        "required": ["desde", "hasta", "gancho", "titulo", "descripcion", "por_que"], "additionalProperties": False}}},
    "required": ["cortos"], "additionalProperties": False,
}


def sh(*a: str, **k) -> subprocess.CompletedProcess:
    return subprocess.run(list(a), check=True, capture_output=True, text=True, **k)


def silencios(video: Path) -> list[float]:
    """Centros de los silencios de la voz (para cortar entre frases, nunca a mitad de palabra)."""
    r = subprocess.run(["ffmpeg", "-i", str(video), "-af", "silencedetect=noise=-32dB:d=0.25", "-f", "null", "-"],
                       capture_output=True, text=True)
    ini = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", r.stderr)]
    fin = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", r.stderr)]
    return [(a + b) / 2 for a, b in zip(ini, fin)]


def tiempos(vid: str, beats: list[dict], video: Path, dur: float) -> list[dict]:
    t = read_json(DATA / "tiempos" / f"{vid}.json")
    if t and len(t) == len(beats):
        return t
    # Estimación por palabras (la voz va a ritmo casi constante) y ajuste a los silencios reales
    n = [max(1, len(b["text"].split())) for b in beats]
    total, acc, out = sum(n), 0, []
    util = dur - 6.0  # la tarjeta final no cuenta
    sil = silencios(video)
    snap = lambda x: min(sil, key=lambda s: abs(s - x)) if sil and min(abs(s - x) for s in sil) < 2.5 else x  # noqa: E731
    for b, k in zip(beats, n):
        a, acc = acc, acc + k
        out.append({"start": round(snap(util * a / total), 2), "end": round(snap(util * acc / total), 2), "text": b["text"]})
    out[0]["start"] = 0.0
    return out


def elegir(story: dict, tm: list[dict], n: int, cfg: dict) -> list[dict]:
    import anthropic  # noqa: PLC0415

    import gasto  # noqa: PLC0415

    planos = "\n".join(f"{i}. [{t['start']:.0f}-{t['end']:.0f}s] {t['text']}" for i, t in enumerate(tm))
    prompt = (
        f"Vídeo largo de YouTube (canal de curiosidades en inglés, público de EE. UU.): «{story['title']}».\n"
        f"Planos numerados con su tiempo:\n{planos}\n\n"
        f"Elige los {n} MEJORES tramos para convertirlos en YouTube Shorts independientes. Reglas:\n"
        "- Cada tramo son planos SEGUIDOS (desde..hasta, ambos incluidos) que duran entre 25 y 58 segundos en total.\n"
        "- El PRIMER plano del tramo tiene que enganchar por sí solo (pregunta, dato increíble, giro). Nunca empieces "
        "con 'And', 'But', 'So', 'That', 'This' ni nada que dependa de lo anterior.\n"
        "- Se entiende sin ver el resto del vídeo y termina con una frase que cierre o deje con ganas del vídeo completo.\n"
        "- Tramos que no se solapen y de partes distintas del vídeo. Nada del principio del vídeo (planos 0-2).\n"
        "- gancho: 2-5 palabras en MAYÚSCULAS, en inglés, para ponerlo enorme arriba (no repitas la primera frase).\n"
        "- titulo: título de Short en inglés, intrigante, máx. 70 caracteres, termina en ' #shorts'.\n"
        "- descripcion: 1-2 frases en inglés + 3 hashtags.\n"
    )
    r = anthropic.Anthropic().messages.create(model=MODELO, max_tokens=3000, messages=[{"role": "user", "content": prompt}],
                                              output_config={"effort": "low", "format": {"type": "json_schema", "schema": SCHEMA}})
    gasto.anthropic(r.model, r.usage, que="elegir Shorts del largo")
    data = json.loads(next(b.text for b in r.content if b.type == "text"))
    ok, usados = [], set()
    for c in data["cortos"]:
        a, b = max(3, int(c["desde"])), min(len(tm) - 1, int(c["hasta"]))
        if b < a or usados & set(range(a, b + 1)):
            continue
        while b > a and tm[b]["end"] - tm[a]["start"] > 58:
            b -= 1
        if tm[b]["end"] - tm[a]["start"] < 18:
            continue
        usados |= set(range(a, b + 1))
        ok.append({**c, "desde": a, "hasta": b})
    return ok[:n]


def esc(s: str) -> str:
    return s.replace("\\", "\\\\").replace(":", "\\:").replace("'", "’").replace("%", "\\%")


def montar(video: Path, ini: float, fin: float, gancho: str, out: Path) -> None:
    dur = fin - ini
    # Fondo: el mismo vídeo ampliado y desenfocado; delante, el vídeo a 1250 px de ancho (recorta un 7 % por lado)
    lineas = _partir(gancho.upper(), 14)
    top = "".join(
        f"drawtext=fontfile='{FONT}':text='{esc(l)}':fontsize=118:fontcolor=white:borderw=10:bordercolor=black:"
        f"x=(w-text_w)/2:y={190 + i * 140}," for i, l in enumerate(lineas))
    fc = (
        "[0:v]split[a][b];"
        "[a]scale=-2:1920,crop=1080:1920,boxblur=28:2,eq=brightness=-0.18[bg];"
        "[b]scale=1250:-2,crop=1080:ih[fg];"
        f"[bg][fg]overlay=(W-w)/2:(H-h)/2+40,{top}"
        f"drawtext=fontfile='{FONT}':text='FULL VIDEO ON THE CHANNEL':fontsize=62:fontcolor=0xFFD93D:borderw=7:bordercolor=black:"
        "x=(w-text_w)/2:y=h-330,"
        f"fade=t=out:st={dur - 0.35:.2f}:d=0.35[v]"
    )
    sh("ffmpeg", "-y", "-loglevel", "error", "-ss", f"{ini:.2f}", "-t", f"{dur:.2f}", "-i", str(video),
       "-filter_complex", fc, "-map", "[v]", "-map", "0:a", "-af", f"afade=t=in:d=0.15,afade=t=out:st={dur - 0.4:.2f}:d=0.4",
       "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-r", "30",
       "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", str(out))


def _partir(s: str, n: int) -> list[str]:
    out, cur = [], ""
    for w in s.split():
        if cur and len(cur) + 1 + len(w) > n:
            out.append(cur); cur = w
        else:
            cur = f"{cur} {w}".strip()
    return (out + [cur])[:3]


def main(vid: str) -> None:
    cfg = load_config()
    n = int(os.environ.get("CUANTOS") or (cfg.get("generacion") or {}).get("shorts_por_largo", 3))
    story = read_json(DATA / "guiones" / f"{vid}.json")
    week = read_json(DATA / "weeks" / f"{vid}.json")
    if not story or not week:
        sys.exit(f"No encuentro el guion o la release de {vid}")
    meta = week["videos"][0]
    wid = f"cortos-{vid}"
    wd = week_dir(wid)
    video = wd / meta["video"]
    if not video.exists():
        sh("gh", "release", "download", week["tag"], "--pattern", meta["video"], "--dir", str(wd), "--clobber")
    dur = float(sh("ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(video)).stdout.strip())
    beats = story["beats"]
    tm = tiempos(vid, beats, video, dur)
    elegidos = elegir(story, tm, n, cfg)
    print(f"Tramos elegidos: {len(elegidos)}")
    os.environ["RUN_ID"] = wid
    import review  # noqa: PLC0415

    num = re.sub(r"^largo-", "", vid)
    for k, c in enumerate(elegidos, 1):
        sid = f"corto-{num}-c{k}"
        ini = max(0.0, tm[c["desde"]]["start"] - 0.05)
        fin = min(dur, tm[c["hasta"]]["end"] + 0.35)
        mp4 = wd / f"{sid}.mp4"
        montar(video, ini, fin, c["gancho"], mp4)
        portada = wd / f"{sid}_portada.jpg"
        sh("ffmpeg", "-y", "-loglevel", "error", "-ss", "1.2", "-i", str(mp4), "-frames:v", "1", str(portada))
        sh("ffmpeg", "-y", "-loglevel", "error", "-i", str(portada), "-vf", "scale=540:-1", str(wd / f"{sid}.jpg"))
        titulo = c["titulo"] if c["titulo"].endswith("#shorts") else c["titulo"].rstrip() + " #shorts"
        st = {
            "id": sid, "title": titulo,
            "description": c["descripcion"].strip() + f"\n\n▶️ Full video: «{story['title']}» on our channel.",
            "tags": (story.get("tags") or [])[:10], "video": mp4.name, "portada": portada.name,
            "lista": story.get("lista"), "beats": beats[c["desde"]:c["hasta"] + 1], "qa": [],
            "origen_largo": vid, "idea": {"tipo": "recorte", "premisa": c["por_que"], "gancho": c["gancho"]},
        }
        print(f"  {sid}: planos {c['desde']}-{c['hasta']} ({fin - ini:.0f} s) · {titulo}")
        review.review_one(st, wid, wd, cfg, {})


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit("Uso: python pipeline/recortes.py <id-largo>")
    main(sys.argv[1])
