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


REF = Path(__file__).resolve().parent.parent / "data" / "mascota_ref.png"  # miniatura aprobada: Curio siempre igual


def _gemini_image(key: str, model: str, prompt: str) -> bytes:
    parts = [{"text": prompt}]
    if REF.exists():  # referencia del personaje aprobada por el dueño
        parts.append({"inline_data": {"mime_type": "image/png", "data": base64.b64encode(REF.read_bytes()).decode()}})
        parts[0]["text"] += ("\nThe attached image is the approved reference: draw Curio EXACTLY like in it (same face, hair, "
                             "hoodie and art style), but in a new scene and pose for this video.")
    body = {"contents": [{"parts": parts}], "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": "16:9"}}}
    res = _req(f"{API}/models/{model}:generateContent", body, key)
    part = next(p for c in res.get("candidates", []) for p in c.get("content", {}).get("parts", []) if p.get("inlineData"))
    return base64.b64decode(part["inlineData"]["data"])


def review(img: Path, story: dict) -> tuple[int, str]:
    """Claude mira la miniatura y le pone nota (1-10) con criterios de miniatura viral. Coste: décimas de céntimo."""
    try:
        import anthropic  # noqa: PLC0415

        schema = {"type": "object", "additionalProperties": False, "required": ["nota", "problemas"],
                  "properties": {"nota": {"type": "integer"}, "problemas": {"type": "string"}}}
        media = "image/jpeg" if img.suffix.lower() in (".jpg", ".jpeg") else "image/png"
        r = anthropic.Anthropic().messages.create(
            model="claude-haiku-5-5", max_tokens=600, output_config={"effort": "low", "format": {"type": "json_schema", "schema": schema}},
            messages=[{"role": "user", "content": [
                {"type": "image", "source": {"type": "base64", "media_type": media, "data": base64.b64encode(img.read_bytes()).decode()}},
                {"type": "text", "text": (
                    f"Es la miniatura de un vídeo de YouTube titulado «{story.get('title', '')}». Puntúala del 1 al 10 como "
                    "miniatura VIRAL de canal de curiosidades animadas (estilo dibujos brillantes, muy llamativa). Exige: "
                    "personaje con emoción EXAGERADA y bien visible; objeto o situación del vídeo enorme y entendible al "
                    "instante; colores muy vivos y contraste (nada oscuro ni apagado); composición simple que se lea en el "
                    "móvil; lado izquierdo despejado para el título; SIN letras, números ni marcas de agua dentro del dibujo; "
                    "sin deformidades raras (manos, caras). En 'problemas' di en inglés, en una frase, qué corregir.")}]}])
        out = json.loads(next(b.text for b in r.content if b.type == "text"))
        return int(out["nota"]), out["problemas"]
    except Exception as e:  # noqa: BLE001
        print(f"  aviso: no se pudo revisar la miniatura ({str(e)[:120]})")
        return 7, ""


def generate(story: dict, out_dir: Path) -> Path | None:
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not key:
        return None
    cfg = (load_config().get("miniaturas_ia") or {})
    model = _model(key, cfg.get("modelo", "gemini-2.5-flash-image"))
    raw = out_dir / f"{story['id']}_ia_fondo.png"
    prompt, best = prompt_for(story), None
    for intento in range(int(cfg.get("intentos", 2))):  # como mucho 2 imágenes: la segunda solo si la primera es floja
        try:
            raw.write_bytes(_gemini_image(key, model, prompt))
        except Exception as e:  # noqa: BLE001
            print(f"  aviso: la miniatura con IA no salió ({str(e)[:200]}); se usa la de siempre")
            break
        nota, fallos = review(raw, story)
        print(f"  miniatura IA, intento {intento + 1}: nota {nota}/10 {('· ' + fallos) if fallos else ''}")
        if best is None or nota > best[0]:
            best = (nota, raw.read_bytes())
        if nota >= int(cfg.get("nota_minima", 8)):
            break
        prompt = prompt_for(story) + f"\nFIX THESE PROBLEMS from a previous attempt: {fallos}"
    if not best or best[0] < int(cfg.get("nota_descartar", 5)):
        print("  la miniatura con IA no llega al nivel: se usa la de siempre")
        return None
    raw.write_bytes(best[1])
    final = out_dir / f"{story['id']}_portada.jpg"
    text = story.get("cover_text") or story.get("question") or story.get("title", "")
    r = subprocess.run(["node", str(RENDERER / "tools" / "portada_ia.mjs"), str(raw), text, str(final)], capture_output=True, text=True)
    if r.returncode or not final.exists():
        print(f"  aviso: no se pudo poner el texto a la miniatura ({r.stderr[-200:]})")
        return None
    print(f"  miniatura con IA lista ({model})")
    return final


if __name__ == "__main__":
    # Prueba: python pipeline/miniatura_ia.py "Título" "Idea" "TEXTO PORTADA"  -> data/miniaturas_prueba/
    import datetime as _dt
    import sys
    if len(sys.argv) > 1 and sys.argv[1].endswith(".json"):
        st = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    else:
        st = {"id": "prueba", "title": sys.argv[1], "question": sys.argv[2], "cover_text": sys.argv[3], "beats": [{"text": sys.argv[2]}]}
    out = Path(__file__).resolve().parent.parent / "data" / "miniaturas_prueba"
    out.mkdir(parents=True, exist_ok=True)
    st["id"] = f"prueba-{_dt.datetime.now():%Y%m%d-%H%M%S}"
    res = generate(st, out)
    print(res or "sin miniatura (¿falta GEMINI_API_KEY o la facturación?)")
    if not res:
        sys.exit(1)
