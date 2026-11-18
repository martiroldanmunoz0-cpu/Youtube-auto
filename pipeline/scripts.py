"""Paso 2: con las tendencias, Claude analiza qué funciona y escribe los guiones.

1) Una llamada de ANÁLISIS: patrones de gancho, temas y formatos que funcionan -> lista de ideas.
2) Una llamada por IDEA: guion completo dividido en "planos" con la escena animada de cada uno.
Todo sale en JSON validado por esquema.
"""
from __future__ import annotations

import json
import re
import sys

import anthropic

import os

from common import CATALOG, DATA, load_config, pedido, read_json, run_id, week_dir, write_json

client = anthropic.Anthropic()

ANALYSIS_SCHEMA = {
    "type": "object",
    "properties": {
        "resumen": {"type": "string"},
        "patrones_gancho": {"type": "array", "items": {"type": "string"}},
        "temas_calientes": {"type": "array", "items": {"type": "string"}},
        "formatos": {"type": "array", "items": {"type": "string"}},
        "ideas": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "tipo": {"type": "string", "enum": ["historia_ficcion", "dato_curioso", "caso_real", "misterio", "explicacion", "que_pasaria_si", "pedido"]},
                    "premisa": {"type": "string"},
                    "gancho": {"type": "string"},
                    "giro_final": {"type": "string"},
                    "estilo_visual": {"type": "string"},
                    "por_que_funcionara": {"type": "string"},
                    "inspirado_en": {"type": "array", "items": {"type": "string"}},
                },
                "required": ["tipo", "premisa", "gancho", "giro_final", "estilo_visual", "por_que_funcionara", "inspirado_en"],
                "additionalProperties": False,
            },
        },
    },
    "required": ["resumen", "patrones_gancho", "temas_calientes", "formatos", "ideas"],
    "additionalProperties": False,
}

STORY_SCHEMA = {
    "type": "object",
    "properties": {
        "titulo": {"type": "string"},
        "descripcion": {"type": "string"},
        "tags": {"type": "array", "items": {"type": "string"}},
        "planos": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "texto": {"type": "string"},
                    "escena": {"type": "string"},
                    "params_json": {"type": "string"},
                    "camara": {"type": "string"},
                    "transicion": {"type": "string"},
                },
                "required": ["texto", "escena", "params_json", "camara", "transicion"],
                "additionalProperties": False,
            },
        },
    },
    "required": ["titulo", "descripcion", "tags", "planos"],
    "additionalProperties": False,
}

SYSTEM_ANALYST = """Eres el estratega de un canal de YouTube Shorts en español de historias animadas narradas \
(suspense, misterio, terror suave, datos curiosos, casos reales, giros inesperados). Todos los vídeos del canal \
tienen la MISMA estética: ilustración vectorial oscura y nocturna, luces cálidas, narrador en off y subtítulos \
palabra a palabra. Tu trabajo: mirar qué Shorts están consiguiendo más visualizaciones esta semana (de cualquier \
temática) y traducir lo que funciona a ideas para NUESTRO formato.

Reglas:
- Fíjate en el MECANISMO que hace funcionar cada vídeo (curiosidad, miedo, identificación, indignación, \
"no sabía esto", giro final), no en copiar su contenido. Nunca reutilices la historia, personajes o guion de otro creador.
- Cada idea debe tener un gancho que funcione en los 2 primeros segundos y un giro o remate final que haga \
que la gente lo vuelva a ver o comente.
- Varía tipos y escenarios: no más de 3 ideas del mismo tipo y no repitas premisas del historial.
- Las ideas tienen que poder contarse con las escenas disponibles del catálogo.
- Los datos y casos reales tienen que ser hechos bien documentados de los que estés muy seguro. Si dudas, \
conviértelo en ficción."""

SYSTEM_WRITER = """Eres guionista de YouTube Shorts narrados en español neutro (comprensible en España y Latinoamérica). \
Escribes guiones de 45-75 segundos que se convierten automáticamente en un vídeo animado.

ESTRUCTURA OBLIGATORIA
1. GANCHO (plano 1, máx 12 palabras): empieza in media res, en segunda persona o con una afirmación imposible \
de ignorar. Nada de saludos, "hoy os cuento" ni introducciones. Ejemplos de tono: "Vas en un taxi de noche y el \
conductor bloquea las puertas." / "Este pueblo desapareció en una sola noche."
2. DESARROLLO: frases cortas, ritmo rápido, un detalle concreto por plano. Cada 2-3 planos, una micro-pregunta o \
tensión nueva para que nadie deslice.
3. GIRO / REMATE: el último o penúltimo plano revela algo que cambia todo o deja una pregunta. Mejor si la última \
frase conecta con la primera (bucle) para que se vuelva a ver.

REGLAS DE TEXTO
- 120-180 palabras en total. Entre 9 y 16 planos. Cada plano: 1-2 frases, 6-22 palabras.
- Escribe para el oído: sin emojis, sin abreviaturas, números escritos como se dicen si son cortos.
- Las historias de ficción NO se presentan como reales. Solo di "caso real" si lo es y está documentado.
- Sin violencia explícita, sin sangre, sin contenido sexual, sin menores en peligro, sin personas reales difamadas. \
Miedo psicológico, sí; gore, no.

REGLAS VISUALES
- "escena" debe ser una clave EXACTA del catálogo. "params_json" es un objeto JSON en texto con los parámetros de \
esa escena (usa "{}" si no hace falta). Los textos dentro de pantallas o periódicos deben ser cortos y en español.
- Cambia de escena con frecuencia (no más de 2 planos seguidos en la misma escena salvo "phone" con distinta pantalla).
- El plano del giro usa cámara "slam" o transición "red"/"flash".
- "camara" y "transicion" deben ser claves exactas del catálogo.

TÍTULO Y DESCRIPCIÓN
- titulo: máx 70 caracteres, genera curiosidad sin destripar el giro, termina con " #shorts".
- descripcion: 2-3 líneas que inviten a comentar (pregunta al espectador) + 3-5 hashtags.
- tags: 8-12 etiquetas en español."""


def call_json(system: str, user: str, schema: dict, model: str, max_tokens: int = 16000) -> dict:
    params = dict(
        model=model,
        max_tokens=max_tokens,
        system=system,
        output_config={"effort": "high", "format": {"type": "json_schema", "schema": schema}},
        messages=[{"role": "user", "content": user}],
    )
    try:
        # Con "fallbacks", si el modelo rechaza la petición, la API la reintenta en otro modelo.
        resp = client.beta.messages.create(**params, betas=["server-side-fallback-2026-07-01"], fallbacks="default")
    except anthropic.BadRequestError as e:
        if "fallback" not in str(e).lower():
            raise
        resp = client.messages.create(**params)
    if resp.stop_reason == "refusal":
        raise RuntimeError(f"El modelo rechazó la petición: {resp.stop_details}")
    if resp.stop_reason == "max_tokens":
        raise RuntimeError("Respuesta cortada por max_tokens")
    text = next(b.text for b in resp.content if b.type == "text")
    return json.loads(text)


def analyze(trends: dict, history: list[dict], cfg: dict, n_ideas: int) -> dict:
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    compact = [
        {k: v[k] for k in ("id", "titulo", "canal", "vistas", "vistas_por_dia", "likes_pct", "comentarios_pct", "duracion_s", "descripcion", "origen")}
        for v in trends["top"]
    ]
    past = [h["titulo"] for h in history[-80:]]
    user = (
        f"Shorts con más rendimiento de los últimos {cfg['analisis']['dias']} días (ordenados por vistas/día):\n"
        f"{json.dumps(compact, ensure_ascii=False)}\n\n"
        f"Escenas disponibles para animar:\n{json.dumps({k: v['desc'] for k, v in catalog['scenes'].items()}, ensure_ascii=False)}\n\n"
        f"Títulos ya publicados o generados antes (no repetir premisas):\n{json.dumps(past, ensure_ascii=False)}\n\n"
        f"Dame el análisis y exactamente {n_ideas} ideas ordenadas de mejor a peor potencial. "
        f"En 'inspirado_en' pon los id de los vídeos cuyo mecanismo aprovechas."
    )
    return call_json(SYSTEM_ANALYST, user, ANALYSIS_SCHEMA, cfg["generacion"]["modelo"])


SYSTEM_PEDIDO = """Eres el estratega de un canal de YouTube Shorts en español de vídeos animados narrados \
(ilustración vectorial, narrador en off y subtítulos palabra a palabra). El dueño del canal te pide un vídeo \
concreto. Tu trabajo: proponer VARIAS versiones distintas de ESE MISMO pedido, para quedarse con la mejor.

Reglas:
- Todas las versiones tratan exactamente sobre lo que se pide. No cambies el tema.
- Cada versión debe ser claramente diferente: otro gancho, otra estructura (p. ej. narración en segunda persona, \
historia de un personaje, cuenta atrás día a día, lista de datos, giro final inesperado), otro remate y otro \
estilo visual (escenas distintas del catálogo).
- Cada gancho debe enganchar en los 2 primeros segundos.
- En 'estilo_visual' indica qué escenas del catálogo dominarán esa versión y cómo.
- En 'inspirado_en' deja la lista vacía.
- Si el pedido incluye hechos reales, usa solo datos bien documentados."""


def ideas_for_request(request: str, n: int, history: list[dict], cfg: dict) -> dict:
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    user = (
        f"Pedido del dueño del canal:\n\"{request}\"\n\n"
        f"Escenas disponibles para animar:\n{json.dumps({k: v['desc'] for k, v in catalog['scenes'].items()}, ensure_ascii=False)}\n\n"
        f"Dame exactamente {n} versiones distintas en 'ideas'. En 'resumen' explica en 2 frases cómo se diferencian. "
        "En 'patrones_gancho' pon los tipos de gancho que usas; 'temas_calientes' y 'formatos' pueden ir vacíos."
    )
    return call_json(SYSTEM_PEDIDO, user, ANALYSIS_SCHEMA, cfg["generacion"]["modelo"])


def write_story(idea: dict, analysis: dict, cfg: dict) -> dict:
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    user = (
        f"Catálogo de escenas, cámaras y transiciones:\n{json.dumps(catalog, ensure_ascii=False)}\n\n"
        + f"Patrones de gancho que funcionan esta semana:\n{json.dumps(analysis['patrones_gancho'], ensure_ascii=False)}\n\n"
        + (f"Pedido original del dueño del canal (respétalo): \"{pedido()}\"\n\n" if pedido() else "")
        + f"Idea a desarrollar:\n{json.dumps(idea, ensure_ascii=False)}\n\n"
        f"Duración objetivo: {cfg['generacion']['duracion_objetivo_seg'][0]}-{cfg['generacion']['duracion_objetivo_seg'][1]} segundos. "
        "Escribe el guion completo."
    )
    return call_json(SYSTEM_WRITER, user, STORY_SCHEMA, cfg["generacion"]["modelo"])


def validate_story(story: dict) -> dict:
    """Limpia el guion: escenas/cámaras válidas, params parseados. Devuelve el formato interno."""
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    scenes, cams, trans = catalog["scenes"], catalog["cameras"], catalog["transitions"]
    beats = []
    for p in story["planos"]:
        text = re.sub(r"\s+", " ", p["texto"]).strip()
        if not text:
            continue
        scene = p["escena"] if p["escena"] in scenes else "big_text"
        try:
            params = json.loads(p["params_json"] or "{}")
            if not isinstance(params, dict):
                params = {}
        except json.JSONDecodeError:
            params = {}
        if scene == "big_text" and "text" not in params:
            params["text"] = ""
        beats.append({
            "text": text,
            "scene": scene,
            "params": params,
            "camera": p["camara"] if p["camara"] in cams else "push_in",
            "transition": p["transicion"] if p["transicion"] in trans else "fade",
        })
    title = story["titulo"].strip()
    if "#shorts" not in title.lower():
        title = (title[:88] + " #shorts").strip()
    return {
        "title": title[:100],
        "description": story["descripcion"].strip(),
        "tags": [t.strip("# ") for t in story["tags"]][:15],
        "beats": beats,
    }


def main():
    cfg = load_config()
    rid = run_id()
    wd = week_dir(rid)
    history = read_json(DATA / "history.json", [])
    request = pedido()
    if request:
        n = int(os.environ.get("PEDIDO_N") or 3)
        analysis = ideas_for_request(request, n, history, cfg)
    else:
        trends = read_json(wd / "trends.json")
        if not trends:
            sys.exit("Falta trends.json: ejecuta antes trends.py")
        n = cfg["generacion"]["videos_por_semana"]
        analysis = analyze(trends, history, cfg, n)
    write_json(wd / "analysis.json", analysis)
    print(f"Ideas listas: {len(analysis['ideas'])}")

    stories = []
    for i, idea in enumerate(analysis["ideas"][:n]):
        try:
            raw = write_story(idea, analysis, cfg)
            st = validate_story(raw)
            st.update({"id": f"{rid}-{i + 1:02d}", "idea": idea})
            stories.append(st)
            print(f"  [{i + 1}/{n}] {st['title']} ({len(st['beats'])} planos)")
        except Exception as e:
            print(f"  [{i + 1}/{n}] error escribiendo guion: {e}", file=sys.stderr)
    if not stories:
        sys.exit("No se pudo escribir ningún guion")
    write_json(wd / "stories.json", stories)


if __name__ == "__main__":
    main()
