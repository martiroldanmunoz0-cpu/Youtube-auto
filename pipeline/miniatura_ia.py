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
import urllib.error
import urllib.request
from pathlib import Path

import gasto
from common import RENDERER, load_config

API = "https://generativelanguage.googleapis.com/v1beta"


def _req(url: str, body: dict | None = None, key: str = "") -> dict:
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json", "x-goog-api-key": key})
    try:
        with urllib.request.urlopen(r, timeout=180) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:  # se muestra el motivo que da Google (facturación, cuota, modelo...)
        try:
            msg = json.loads(e.read()).get("error", {}).get("message", "")
        except Exception:  # noqa: BLE001
            msg = ""
        raise RuntimeError(f"HTTP {e.code}: {msg[:300]}") from None


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


def prompt_for(story: dict) -> str:
    beats = " / ".join(b["text"] for b in story.get("beats", [])[:6])
    return (
        "Create a viral YouTube thumbnail image (16:9 landscape) for a 'what if / curiosities' video (English-language channel, US audience).\n"
        f"Video title: {story.get('title', '')}\nMain idea: {story.get('question') or story.get('cover_text', '')}\n"
        f"Opening of the script: {beats}\n\n"
        "STYLE (very important): glossy, high-energy cartoon illustration like the most clicked animated 'what if' "
        "thumbnails: smooth shiny 3D-looking cartoon shading, ultra-saturated colors, vivid "
        "backgrounds with dramatic speed lines, radial burst and glowing light, strong rim light on the character.\n"
        "CHARACTERS AND SCENE: invent them specifically for THIS video (who suffers or lives the situation: a person, an "
        "astronaut, a fisherman, an animal...), different every time, never a generic mascot. Show the main character BIG "
        "in the right half of the image with an EXTREME, exaggerated emotion that fits the video (screaming in panic, "
        "crying with big tears, sweating, jaw dropped in shock), dynamic pose, motion lines. Next to it, the key object or "
        "situation of the video, huge and instantly understandable (one clear focal point). If the video has a big number "
        "or danger, show it visually (fire, cracks, explosion, red glow). Choose the color palette that best fits this "
        "topic (space = purple/blue, fire = orange/red, ocean = cyan/blue...).\n"
        "COMPOSITION: very simple and readable on a phone; the LEFT 40% of the image must be a clean, darker area of the "
        "background (big title text will be added there later).\n"
        "RULES: absolutely NO text, letters, numbers, logos or watermarks. Do not copy any existing YouTube channel's "
        "characters or any famous cartoon character; do not depict real, recognizable people."
    )


def _gemini_image(key: str, model: str, prompt: str) -> bytes:
    parts = [{"text": prompt}]  # cada miniatura se crea desde cero para su vídeo (sin imágenes de referencia)
    body = {"contents": [{"parts": parts}], "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": "16:9"}}}
    res = _req(f"{API}/models/{model}:generateContent", body, key)
    part = next(p for c in res.get("candidates", []) for p in c.get("content", {}).get("parts", []) if p.get("inlineData"))
    return base64.b64decode(part["inlineData"]["data"])


def _openai_image(key: str, cfg: dict, prompt: str) -> bytes:
    """Imagen con la API de OpenAI (apaisada). El modelo se elige solo si el configurado no existe."""
    model = cfg.get("modelo_openai", "gpt-image-1")
    try:
        r = urllib.request.Request("https://api.openai.com/v1/models", headers={"Authorization": f"Bearer {key}"})
        with urllib.request.urlopen(r, timeout=60) as resp:
            names = sorted(m["id"] for m in json.loads(resp.read()).get("data", []) if "image" in m["id"])
        if names and model not in names:
            model = names[-1]
    except Exception:  # noqa: BLE001
        pass
    body = {"model": model, "prompt": prompt, "size": cfg.get("tamano_openai", "1536x1024"), "quality": cfg.get("calidad_openai", "medium"), "n": 1}
    r = urllib.request.Request("https://api.openai.com/v1/images/generations", data=json.dumps(body).encode(),
                               headers={"Content-Type": "application/json", "Authorization": f"Bearer {key}"})
    try:
        with urllib.request.urlopen(r, timeout=240) as resp:
            data_all = json.loads(resp.read())
            data = data_all["data"][0]
    except urllib.error.HTTPError as e:
        try:
            msg = json.loads(e.read()).get("error", {}).get("message", "")
        except Exception:  # noqa: BLE001
            msg = ""
        raise RuntimeError(f"OpenAI HTTP {e.code}: {msg[:300]}") from None
    gasto.openai_image(model, data_all.get("usage"), cfg.get("calidad_openai", "medium"))
    if data.get("b64_json"):
        return base64.b64decode(data["b64_json"])
    with urllib.request.urlopen(data["url"], timeout=120) as resp:
        return resp.read()


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
                    f"Es la miniatura de un vídeo de YouTube titulado «{story.get('title', '')}» (texto grande que se le pondrá encima: «{story.get('cover_text', '')}»). Puntúala del 1 al 10 según si, junto al título, dan MUCHAS GANAS DE HACER CLIC, como "
                    "miniatura VIRAL de canal de curiosidades animadas (estilo dibujos brillantes, muy llamativa). Exige: "
                    "personaje con emoción EXAGERADA y bien visible; objeto o situación del vídeo enorme y entendible al "
                    "instante; colores muy vivos y contraste (nada oscuro ni apagado); composición simple que se lea en el "
                    "móvil; lado izquierdo despejado para el título; SIN letras, números ni marcas de agua dentro del dibujo; "
                    "sin deformidades raras (manos, caras). En 'problemas' di en inglés, en una frase, qué corregir.")}]}])
        gasto.anthropic(r.model, r.usage, que="revisar miniatura")
        out = json.loads(next(b.text for b in r.content if b.type == "text"))
        return int(out["nota"]), out["problemas"]
    except Exception as e:  # noqa: BLE001
        print(f"  aviso: no se pudo revisar la miniatura ({str(e)[:120]})")
        return 7, ""


def reuse_existing(story: dict, out_dir: Path) -> Path | None:
    """Si el vídeo ya tuvo miniatura con IA (p. ej. al volver a montarlo), se reutiliza en vez de pagar otra."""
    try:
        repo = os.environ.get("GITHUB_REPOSITORY", "")
        name = f"{story['id']}_portada.jpg"
        rels = json.loads(subprocess.run(["gh", "api", f"repos/{repo}/releases?per_page=100"], capture_output=True, text=True).stdout or "[]")
        asset = next((a for r in rels for a in r.get("assets", []) if a["name"] == name), None)
        if not asset:
            return None
        dst = out_dir / name
        data = subprocess.run(["gh", "api", "-H", "Accept: application/octet-stream", f"repos/{repo}/releases/assets/{asset['id']}"], capture_output=True).stdout
        if len(data) < 10000:
            return None
        dst.write_bytes(data)
        print("  miniatura con IA reutilizada (no se paga otra)")
        return dst
    except Exception:  # noqa: BLE001
        return None


def generate(story: dict, out_dir: Path) -> Path | None:
    if story.get("portada_ia_reusar", True):
        found = reuse_existing(story, out_dir)
        if found:
            return found
    cfg = (load_config().get("miniaturas_ia") or {})
    okey, gkey = os.environ.get("OPENAI_API_KEY", "").strip(), os.environ.get("GEMINI_API_KEY", "").strip()
    proveedor = cfg.get("proveedor", "openai")
    if proveedor == "openai" and not okey and gkey:
        proveedor = "gemini"
    if proveedor == "gemini" and not gkey and okey:
        proveedor = "openai"
    key = okey if proveedor == "openai" else gkey
    if not key:
        return None
    model = "openai" if proveedor == "openai" else _model(key, cfg.get("modelo", "gemini-2.5-flash-image"))
    raw = out_dir / f"{story['id']}_ia_fondo.png"
    prompt, best = prompt_for(story), None
    for intento in range(int(cfg.get("intentos", 2))):  # como mucho 2 imágenes: la segunda solo si la primera es floja
        try:
            raw.write_bytes(_openai_image(key, cfg, prompt) if proveedor == "openai" else _gemini_image(key, model, prompt))
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
    print(f"  miniatura con IA lista ({proveedor})")
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
