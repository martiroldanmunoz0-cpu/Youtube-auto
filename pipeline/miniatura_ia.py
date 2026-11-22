"""Miniaturas con IA (Google Gemini) para los vídeos largos.

Gemini dibuja la imagen (sin texto) a partir del guion; después renderer/tools/portada_ia.mjs le pone encima el
texto enorme con borde, estilo YouTube, a 1280×720. Si no hay clave (GEMINI_API_KEY) o algo falla, se usa la
miniatura de siempre (fotograma del vídeo + texto): la publicación nunca se bloquea.
"""
from __future__ import annotations

import base64
import json
import os
import subprocess
import urllib.request
from pathlib import Path

from common import RENDERER, load_config

API = "https://generativelanguage.googleapis.com/v1beta"


def _req(url: str, body: dict | None = None, key: str = "") -> dict:
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json", "x-goog-api-key": key})
    with urllib.request.urlopen(r, timeout=180) as resp:
        return json.loads(resp.read())


def _model(key: str, preferred: str) -> str:
    """El modelo de imágenes configurado o, si no existe, el primero de Gemini que genere imágenes."""
    try:
        names = [m["name"].split("/")[-1] for m in _req(f"{API}/models?pageSize=200", key=key).get("models", [])
                 if "generateContent" in m.get("supportedGenerationMethods", []) and "image" in m["name"]]
    except Exception:  # noqa: BLE001
        return preferred
    if preferred in names or not names:
        return preferred
    return sorted(names, key=lambda n: ("preview" in n, n))[0]


# Personaje propio del canal para las miniaturas (siempre el mismo: la gente reconoce el canal de un vistazo)
MASCOTA = ("Curio, the channel's own ORIGINAL mascot: a cartoon boy with a big round head, warm light-brown skin, messy "
           "dark-brown hair with one spiky tuft on top, huge expressive eyes and a bright orange hoodie")


def prompt_for(story: dict) -> str:
    beats = " / ".join(b["text"] for b in story.get("beats", [])[:6])
    return (
        "Create a viral YouTube thumbnail image (16:9 landscape) for a Spanish 'what if / curiosities' video.\n"
        f"Video title: {story.get('title', '')}\nMain idea: {story.get('question') or story.get('cover_text', '')}\n"
        f"Opening of the script: {beats}\n\n"
        "STYLE (very important): glossy, high-energy cartoon illustration like the most clicked animated 'what if' "
        "thumbnails: smooth shiny 3D-looking cartoon shading, ultra-saturated colors, purple / electric blue / hot pink "
        "background with dramatic speed lines, radial burst and glowing light, strong rim light on the character.\n"
        f"CHARACTER: {MASCOTA}. Show him BIG in the right half of the image with an EXTREME, exaggerated emotion that fits "
        "the video (screaming in panic, crying with big tears, sweating, jaw dropped in shock), dynamic pose, motion "
        "lines. Next to him, the key object or situation of the video, huge and instantly understandable (one clear "
        "focal point). If the video has a big number or danger, show it visually (fire, cracks, explosion, red glow).\n"
        "COMPOSITION: very simple and readable on a phone; the LEFT 40% of the image must be a clean, darker area of the "
        "background (big title text will be added there later).\n"
        "RULES: absolutely NO text, letters, numbers, logos or watermarks. Do not copy any existing YouTube channel's "
        "characters or any famous cartoon character; do not depict real, recognizable people."
    )


def generate(story: dict, out_dir: Path) -> Path | None:
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not key:
        return None
    cfg = (load_config().get("miniaturas_ia") or {})
    model = _model(key, cfg.get("modelo", "gemini-2.5-flash-image"))
    body = {"contents": [{"parts": [{"text": prompt_for(story)}]}],
            "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": "16:9"}}}
    try:
        res = _req(f"{API}/models/{model}:generateContent", body, key)
        part = next(p for c in res.get("candidates", []) for p in c.get("content", {}).get("parts", []) if p.get("inlineData"))
        raw = out_dir / f"{story['id']}_ia_fondo.png"
        raw.write_bytes(base64.b64decode(part["inlineData"]["data"]))
    except Exception as e:  # noqa: BLE001
        print(f"  aviso: la miniatura con IA no salió ({str(e)[:200]}); se usa la de siempre")
        return None
    final = out_dir / f"{story['id']}_portada.jpg"
    text = story.get("cover_text") or story.get("question") or story.get("title", "")
    r = subprocess.run(["node", str(RENDERER / "tools" / "portada_ia.mjs"), str(raw), text, str(final)], capture_output=True, text=True)
    if r.returncode or not final.exists():
        print(f"  aviso: no se pudo poner el texto a la miniatura ({r.stderr[-200:]})")
        return None
    print(f"  miniatura con IA lista ({model})")
    return final


if __name__ == "__main__":  # prueba: python pipeline/miniatura_ia.py data/guiones/<id>.json
    import sys
    st = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    print(generate(st, Path(".")) or "sin miniatura (¿falta GEMINI_API_KEY?)")
