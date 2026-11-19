"""Paso 2: con las tendencias, Claude analiza qué funciona y escribe los guiones.

1) Una llamada de ANÁLISIS: patrones de gancho, temas y formatos que funcionan -> lista de ideas.
2) Una llamada por IDEA: guion completo dividido en "planos" con la escena animada de cada uno.
Todo sale en JSON validado por esquema.
"""
from __future__ import annotations

import json
import re
import sys
import time

import anthropic

import os

from common import CATALOG, DATA, formato, load_config, pedido, read_json, run_id, week_dir, write_json

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
                    "tipo": {"type": "string", "enum": ["historia_ficcion", "dato_curioso", "caso_real", "misterio", "explicacion", "que_pasaria_si", "pedido", "comedia"]},
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
        # Primero los ganchos candidatos: el modelo los escribe y puntúa ANTES de escribir el guion.
        "ganchos_candidatos": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "texto": {"type": "string"},
                    "tipo": {"type": "string"},
                    "puntuacion": {"type": "integer"},
                    "motivo": {"type": "string"},
                },
                "required": ["texto", "tipo", "puntuacion", "motivo"],
                "additionalProperties": False,
            },
        },
        "gancho_elegido": {"type": "string"},
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
    "required": ["ganchos_candidatos", "gancho_elegido", "titulo", "descripcion", "tags", "planos"],
    "additionalProperties": False,
}

SYSTEM_ANALYST = """Eres el estratega de Curiosidario, un canal de YouTube Shorts en español de CURIOSIDADES: datos \
sorprendentes, "¿qué pasaría si...?", ciencia, historia, cuerpo humano, espacio, animales, dinero, récords y \
explicaciones de cosas cotidianas. Todos los vídeos tienen la MISMA estética (ilustración vectorial animada, \
narrador en off y subtítulos palabra a palabra). Tu trabajo: mirar qué Shorts están consiguiendo más \
visualizaciones esta semana y traducir lo que funciona a ideas de curiosidades para NUESTRO canal.

Reglas:
- Solo estos tipos: "dato_curioso", "que_pasaria_si", "explicacion" y "caso_real" (hechos históricos o \
sucesos reales y documentados). Nada de historias de terror ni ficción.
- Fíjate en el MECANISMO que hace funcionar cada vídeo (curiosidad, "no sabía esto", sorpresa, comparación \
exagerada, pregunta imposible), no en copiar su contenido. Nunca reutilices el guion de otro creador.
- Cada idea: gancho que funcione en los 2 primeros segundos y un remate final que sorprenda o invite a comentar.
- Mezcla tipos: al menos 3 "que_pasaria_si" y 3 "dato_curioso" por tanda; no repitas temas del historial.
- RIGOR: solo datos bien documentados de los que estés muy seguro. Los "¿qué pasaría si?" se basan en ciencia \
real (lo que dicen los expertos), sin inventar cifras. Si un dato es dudoso, descarta la idea.
- Las ideas tienen que poder contarse con las escenas disponibles del catálogo."""

SYSTEM_WRITER = """Eres guionista de YouTube Shorts narrados en español neutro (comprensible en España y Latinoamérica). \
Escribes guiones de 45-75 segundos que se convierten automáticamente en un vídeo animado.

PRIMERO, EL GANCHO (lo más importante: decide si la gente se queda o desliza)
Escribe 5 ganchos candidatos MUY distintos en "ganchos_candidatos", cada uno de un tipo:
  a) segunda persona in media res ("Vas en un taxi y el conductor bloquea las puertas.")
  b) afirmación chocante o imposible ("Este pueblo desapareció en una sola noche.")
  c) cifra o dato concreto que sorprende ("Cada día te dan un millón de euros. Hay una trampa.")
  d) pregunta que el espectador necesita responder ("¿Qué harías si tu madre te escribe a las tres de la mañana?")
  e) contradicción / "lo que nadie te cuenta" ("Todos creen que es un accidente. No lo fue.")
Puntúa cada uno de 1 a 10 con estos criterios: se entiende en menos de 2 segundos; abre una pregunta que solo se \
resuelve viendo el vídeo; es concreto (nada genérico); no destripa el final; máximo 12 palabras. Copia el mejor \
en "gancho_elegido" y úsalo LITERALMENTE como texto del plano 1.

TÉCNICAS DE RETENCIÓN (úsalas todas)
- Bucles abiertos: plantea una duda pronto y no la resuelvas hasta el final.
- Cada 2-3 planos, algo nuevo: un dato, un giro pequeño, una amenaza o una pregunta ("Pero había un problema.").
- Nada de relleno ni frases de transición vacías; si un plano se puede quitar sin perder nada, quítalo.
- Lo mejor va al final, y la última frase enlaza con la primera para que se vuelva a ver (bucle).

ESTRUCTURA OBLIGATORIA
1. GANCHO (plano 1, máx 12 palabras): una pregunta imposible, un dato que choca o una situación en segunda \
persona. Nada de saludos, "hoy os cuento" ni introducciones. Ejemplos de tono: "¿Qué pasaría si la Tierra \
dejara de girar?" / "Ahora mismo te estás moviendo a mil kilómetros por hora."
2. DESARROLLO: frases cortas, ritmo rápido, un detalle concreto por plano. Cada 2-3 planos, una micro-pregunta o \
tensión nueva para que nadie deslice.
3. GIRO / REMATE: el último o penúltimo plano revela algo que cambia todo o deja una pregunta. Mejor si la última \
frase conecta con la primera (bucle) para que se vuelva a ver.

REGLAS DE TEXTO
- 120-180 palabras en total. Entre 9 y 16 planos. Cada plano: 1-2 frases, 6-22 palabras.
- Escribe para el oído: sin emojis, sin abreviaturas, números escritos como se dicen si son cortos.
- Es un canal de CURIOSIDADES: tono divulgativo, cercano y con ritmo, como un amigo que te cuenta algo alucinante.
- RIGOR ABSOLUTO: cada dato y cada cifra tiene que ser correcto y estar bien documentado. Si no estás seguro de \
una cifra, no la pongas o redondea con "más de", "casi". En los "¿qué pasaría si?" explica lo que dice la ciencia.
- Haz comparaciones que se entiendan ("más rápido que un avión", "como llenar diez estadios").
- Sin violencia explícita, sin contenido sexual, sin personas reales difamadas.

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


COMEDY_EXTRA_SCENES = ["phone", "money", "big_text", "calendar", "clock", "map_pin", "tv"]


def catalog_for(fmt: str) -> dict:
    """Catálogo de escenas que puede usar cada formato."""
    c = json.loads(CATALOG.read_text(encoding="utf-8"))
    if fmt == "comedia":
        c["scenes"] = {k: v for k, v in c["scenes"].items() if v.get("formato") == "comedia" or k in COMEDY_EXTRA_SCENES}
    else:
        c["scenes"] = {k: v for k, v in c["scenes"].items() if v.get("formato") != "comedia"}
    return c


# ======================= ANTI-REPETICIÓN =======================
EXTRA_IDEAS = 4  # se piden ideas de sobra para poder descartar las repetidas
_STOP = set("""a al algo como con cual de del donde el ella ellos en es esta este esto fue ha hay la las le lo los
mas me mi mucho muy nadie ni no nos o para pero por que quien se si sin sobre son su sus te tiene tu tus un una unos
y ya yo pasaria pasa seria seria si como cuando dato datos curioso curiosos curiosidad curiosidades sabias shorts
nunca todo todos cada vez mundo esta estos estas eso existe hace hacer puede vuelve otra otro""".split())


def _keywords(text: str) -> set[str]:
    t = text.lower()
    for a, b in zip("áéíóúüñ", "aeiouun"):
        t = t.replace(a, b)
    words = re.sub(r"[^a-z0-9 ]", " ", t).split()
    # raíz sencilla: quita plurales para que "agujeros negros" == "agujero negro"
    return {w[:-1] if w.endswith("s") and len(w) > 4 else w for w in words if len(w) > 2 and w not in _STOP}


def _idea_text(item: dict) -> str:
    return " ".join(str(item.get(k, "")) for k in ("titulo", "premisa", "gancho"))


def is_repeated(idea: dict, previous: list[dict], threshold: float = 0.4) -> str | None:
    """Devuelve el título anterior con el que se repite (o None). Compara temas por palabras clave."""
    kw = _keywords(_idea_text(idea))
    if not kw:
        return None
    for old in previous:
        okw = _keywords(_idea_text(old))
        if not okw:
            continue
        overlap = len(kw & okw) / min(len(kw), len(okw))
        if overlap >= threshold and len(kw & okw) >= 2:
            return old.get("titulo") or old.get("premisa") or "?"
    return None


def pick_new_ideas(ideas: list[dict], history: list[dict], n: int, keep_last: int) -> list[dict]:
    """Elige n ideas que no repitan ninguno de los últimos `keep_last` vídeos ni se repitan entre sí."""
    recent = history[-keep_last:] if keep_last else []
    chosen: list[dict] = []
    for idea in ideas:
        clash = is_repeated(idea, recent) or is_repeated(idea, chosen)
        if clash:
            print(f"  descartada por repetida: «{idea.get('premisa', '')[:60]}» ≈ «{str(clash)[:60]}»")
            continue
        chosen.append(idea)
        if len(chosen) == n:
            break
    return chosen


def make_params(system: str, context: str | None, user: str, schema: dict, model: str, effort: str = "high") -> dict:
    """Petición con la parte fija (instrucciones + catálogo) cacheada: se paga casi una sola vez."""
    blocks = [{"type": "text", "text": system}]
    if context:
        blocks.append({"type": "text", "text": context})
    blocks[-1]["cache_control"] = {"type": "ephemeral", "ttl": "1h"}
    return dict(
        model=model,
        max_tokens=16000,
        system=blocks,
        output_config={"effort": effort, "format": {"type": "json_schema", "schema": schema}},
        messages=[{"role": "user", "content": user}],
    )


def parse_message(resp) -> dict:
    if resp.stop_reason == "refusal":
        raise RuntimeError(f"El modelo rechazó la petición: {resp.stop_details}")
    if resp.stop_reason == "max_tokens":
        raise RuntimeError("Respuesta cortada por max_tokens")
    text = next(b.text for b in resp.content if b.type == "text")
    return json.loads(text)


def call_sync(params: dict) -> dict:
    try:
        # Con "fallbacks", si el modelo rechaza la petición, la API la reintenta en otro modelo.
        resp = client.beta.messages.create(**params, betas=["server-side-fallback-2026-07-01"], fallbacks="default")
    except anthropic.BadRequestError as e:
        if "fallback" not in str(e).lower():
            raise
        resp = client.messages.create(**params)
    return parse_message(resp)


def run_many(requests: dict[str, dict], use_batch: bool, timeout_s: int = 5400) -> dict[str, dict | Exception]:
    """Ejecuta varias peticiones. En modo lote (Batch API) cuestan la mitad; lo que falle se reintenta en directo."""
    results: dict[str, dict | Exception] = {}
    if use_batch:
        try:
            batch = client.messages.batches.create(
                requests=[{"custom_id": cid, "params": params} for cid, params in requests.items()]
            )
            print(f"  lote {batch.id} enviado ({len(requests)} peticiones, -50% de coste)")
            waited = 0
            while True:
                batch = client.messages.batches.retrieve(batch.id)
                if batch.processing_status == "ended":
                    break
                if waited >= timeout_s:
                    print("  el lote tarda demasiado: lo cancelo y sigo en directo")
                    client.messages.batches.cancel(batch.id)
                    break
                time.sleep(20)
                waited += 20
            if batch.processing_status == "ended":
                for r in client.messages.batches.results(batch.id):
                    if r.result.type == "succeeded":
                        try:
                            results[r.custom_id] = parse_message(r.result.message)
                        except Exception as e:
                            results[r.custom_id] = e
                    else:
                        results[r.custom_id] = RuntimeError(f"lote: {r.result.type}")
        except anthropic.APIError as e:
            print(f"  aviso: el lote falló ({e}); sigo en directo", file=sys.stderr)
    for cid, params in requests.items():
        if not isinstance(results.get(cid), dict):
            if cid in results:
                print(f"  reintento en directo {cid}: {results[cid]}")
            try:
                results[cid] = call_sync(params)
            except Exception as e:
                results[cid] = e
    return results


def models(cfg: dict) -> tuple[str, str, bool]:
    g = cfg["generacion"]
    fallback = g.get("modelo", "claude-opus-5-5")
    return g.get("modelo_analisis", fallback), g.get("modelo_guiones", fallback), bool(g.get("usar_lotes", True))


def taste_block(history: list[dict], cfg: dict) -> str:
    """Estilo preferido del dueño + ejemplos de lo que aprobó y descartó (aprende de cada revisión)."""
    style = (cfg["generacion"].get("estilo_preferido") or "").strip()
    liked = [h["titulo"] for h in history if h.get("aprobado") is True][-15:]
    disliked = [h["titulo"] for h in history if h.get("aprobado") is False][-15:]
    out = ""
    if style:
        out += f"ESTILO QUE PREFIERE EL DUEÑO DEL CANAL (prioridad alta):\n{style}\n\n"
    if liked:
        out += f"Vídeos que APROBÓ (haz más como estos):\n{json.dumps(liked, ensure_ascii=False)}\n\n"
    if disliked:
        out += f"Vídeos que DESCARTÓ (evita ese enfoque):\n{json.dumps(disliked, ensure_ascii=False)}\n\n"
    return out


def analyze(trends: dict, history: list[dict], cfg: dict, n_ideas: int) -> dict:
    catalog = catalog_for("historias")
    compact = [
        {k: v[k] for k in ("id", "titulo", "canal", "vistas", "vistas_por_dia", "likes_pct", "comentarios_pct", "duracion_s", "descripcion", "origen")}
        for v in trends["top"]
    ]
    keep = cfg["generacion"].get("no_repetir_ultimos", 150)
    past = [h.get("premisa") or h["titulo"] for h in history[-keep:]]
    user = (
        f"Shorts con más rendimiento de los últimos {cfg['analisis']['dias']} días (ordenados por vistas/día):\n"
        f"{json.dumps(compact, ensure_ascii=False)}\n\n"
        f"Escenas disponibles para animar:\n{json.dumps({k: v['desc'] for k, v in catalog['scenes'].items()}, ensure_ascii=False)}\n\n"
        f"Títulos ya publicados o generados antes (no repetir premisas):\n{json.dumps(past, ensure_ascii=False)}\n\n"
        + taste_block(history, cfg)
        + f"Dame el análisis y exactamente {n_ideas} ideas ordenadas de mejor a peor potencial. "
        f"En 'inspirado_en' pon los id de los vídeos cuyo mecanismo aprovechas."
    )
    return make_params(SYSTEM_ANALYST, None, user, ANALYSIS_SCHEMA, models(cfg)[0])


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
    catalog = catalog_for("historias")
    user = (
        f"Pedido del dueño del canal:\n\"{request}\"\n\n"
        + taste_block(history, cfg)
        + f"Escenas disponibles para animar:\n{json.dumps({k: v['desc'] for k, v in catalog['scenes'].items()}, ensure_ascii=False)}\n\n"
        f"Dame exactamente {n} versiones distintas en 'ideas'. En 'resumen' explica en 2 frases cómo se diferencian. "
        "En 'patrones_gancho' pon los tipos de gancho que usas; 'temas_calientes' y 'formatos' pueden ir vacíos."
    )
    return make_params(SYSTEM_PEDIDO, None, user, ANALYSIS_SCHEMA, models(cfg)[0])


def story_params(idea: dict, analysis: dict, cfg: dict) -> dict:
    catalog = catalog_for("historias")
    style = (cfg["generacion"].get("estilo_preferido") or "").strip()
    # Contexto fijo (igual en todos los guiones) -> se cachea.
    context = f"Catálogo de escenas, cámaras y transiciones:\n{json.dumps(catalog, ensure_ascii=False, sort_keys=True)}"
    lo, hi = cfg["generacion"]["duracion_objetivo_seg"]
    user = (
        f"Patrones de gancho que funcionan ahora:\n{json.dumps(analysis['patrones_gancho'], ensure_ascii=False)}\n\n"
        + (f"Pedido original del dueño del canal (respétalo): \"{pedido()}\"\n\n" if pedido() else "")
        + (f"Estilo que prefiere el dueño del canal:\n{style}\n\n" if style else "")
        + f"Idea a desarrollar:\n{json.dumps(idea, ensure_ascii=False)}\n\n"
        + f"Duración objetivo: {lo}-{hi} segundos. Escribe los ganchos candidatos y después el guion completo."
    )
    return make_params(SYSTEM_WRITER, context, user, STORY_SCHEMA, models(cfg)[1])


def validate_story(story: dict) -> dict:
    """Limpia el guion: escenas/cámaras válidas, params parseados. Devuelve el formato interno."""
    catalog = catalog_for("historias")
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



# ======================= COMEDIA (sketches) =======================
VOICE_PRESETS = ["chico_1", "chico_2", "chico_grave", "chico_latino", "chica_1", "chica_2", "chica_latina"]

COMEDY_SCHEMA = {
    "type": "object",
    "properties": {
        "ganchos_candidatos": STORY_SCHEMA["properties"]["ganchos_candidatos"],
        "gancho_elegido": {"type": "string"},
        "titulo": {"type": "string"},
        "descripcion": {"type": "string"},
        "tags": {"type": "array", "items": {"type": "string"}},
        "reparto": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "id": {"type": "string"},
                    "nombre": {"type": "string"},
                    "voz": {"type": "string", "enum": VOICE_PRESETS},
                    "piel": {"type": "string", "enum": ["clara", "media", "morena", "oscura"]},
                    "pelo": {"type": "string", "enum": ["short", "bald", "long", "buzz", "curly", "mohawk"]},
                    "color_pelo": {"type": "string"},
                    "gorra": {"type": "string"},
                    "gafas_sol": {"type": "boolean"},
                    "ropa": {"type": "string"},
                    "estampado": {"type": "string", "enum": ["none", "hawaii", "stripes", "tank"]},
                    "cadena": {"type": "boolean"},
                    "barba": {"type": "boolean"},
                },
                "required": ["id", "nombre", "voz", "piel", "pelo", "color_pelo", "gorra", "gafas_sol", "ropa", "estampado", "cadena", "barba"],
                "additionalProperties": False,
            },
        },
        "planos": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "habla": {"type": "string"},
                    "texto": {"type": "string"},
                    "escena": {"type": "string"},
                    "params_json": {"type": "string"},
                    "camara": {"type": "string"},
                    "transicion": {"type": "string"},
                },
                "required": ["habla", "texto", "escena", "params_json", "camara", "transicion"],
                "additionalProperties": False,
            },
        },
    },
    "required": ["ganchos_candidatos", "gancho_elegido", "titulo", "descripcion", "tags", "reparto", "planos"],
    "additionalProperties": False,
}

SYSTEM_COMEDY_IDEAS = """Eres el jefe de guionistas de humor de un canal de YouTube Shorts en español con sketches animados \
de dibujos (personajes propios, colores vivos, ciudad tropical de neones). Te paso los vídeos de la temática que más \
están funcionando esta semana. Tu trabajo: detectar de qué se habla y qué hace gracia, y convertirlo en ideas de \
sketches ORIGINALES con nuestros propios personajes.

Reglas:
- Céntrate en situaciones con las que el público se sienta identificado ("esto me ha pasado"), con escalada y remate.
- Usa lo que esté de actualidad (rumores, retrasos, precio, novedades, memes) como gancho, pero nunca copies \\
chistes, personajes o guiones de otros creadores.
- Nuestros personajes y escenarios son propios: no uses personajes, logotipos ni nombres comerciales de terceros \\
como si fueran nuestros; se puede hablar del juego por su nombre.
- Cada idea: gancho de 2 segundos, escalada y un remate final inesperado. tipo = "comedia".
- En 'estilo_visual' indica qué escenas usará (sofá jugando vs. dentro del juego)."""

SYSTEM_COMEDY_WRITER = """Eres guionista de sketches cómicos para YouTube Shorts animados (30-55 segundos). Escribes \
diálogos rápidos entre 2 o 3 amigos, con un narrador opcional que cuenta la historia en primera persona.

FORMATO
- Cada plano es UNA intervención corta (2-14 palabras) de UN hablante: "narrador" o el id de un personaje del reparto.
- Los subtítulos salen palabra a palabra en grande: frases cortas, mucho ritmo, nada de párrafos.
- 12-26 planos. Alterna: el salón donde juegan a la consola (escena con bg "room") y lo que pasa dentro del juego \\
(street, night, beach, store, police, car_ride, police_chase...). El contraste entre lo que dicen en el sofá y lo \\
que pasa en el juego es parte del chiste.

GANCHO
Escribe 5 ganchos candidatos de tipos distintos (situación absurda, frase de un personaje, pregunta, "cuando tu \\
amigo...", dato de actualidad), puntúalos 1-10 (se entiende en 2 segundos, da ganas de ver qué pasa, es concreto) \\
y usa el mejor LITERALMENTE como primer plano.

HUMOR
- Situaciones reconocibles de jugar con amigos: el que la lía siempre, el que no sabe conducir, el que traiciona, \\
el que llama a la policía sin querer, el que dice "confía en mí"...
- Escalada: cada 2-3 planos la situación empeora. Remate final inesperado; mejor si enlaza con el principio.
- Registro coloquial de {variante}. Palabrotas: {palabrotas}. Úsalas como golpe cómico, NUNCA en el título ni en \\
los dos primeros planos (para no perder anuncios). Nada de insultos racistas, homófobos o machistas, ni contenido \\
sexual, ni burlas a personas reales.
- Personajes y escenarios propios. Se puede hablar del juego por su nombre, pero no copiar personajes ni chistes ajenos.

REPARTO
- 2-3 personajes con id corto en minúsculas (p. ej. "dani", "rober"), aspecto muy distinto entre ellos y voz \\
coherente (chico_* / chica_*). Colores en #hex. "gorra" es un #hex o "" si no lleva.

VISUAL
- "escena" debe ser una clave EXACTA del catálogo y "params_json" un objeto JSON en texto.
- En "duo" pon "left"/"right" con ids del reparto y sus moods; en "closeup" pon "who"; el que habla mueve la boca solo.
- Cambia de plano a menudo. El remate usa cámara "slam" o transición "flash".

TÍTULO Y DESCRIPCIÓN
- titulo: máx 70 caracteres, sin palabrotas, gracioso, termina con " #shorts".
- descripcion: 1-2 líneas que inviten a etiquetar a un amigo + 3-5 hashtags. tags: 8-12."""


def comedy_ideas_params(trends: dict | None, n: int, history: list[dict], cfg: dict) -> dict:
    cc = cfg.get("comedia", {})
    catalog = catalog_for("comedia")
    top = [{k: v[k] for k in ("titulo", "canal", "vistas", "vistas_por_dia", "comentarios_pct")} for v in (trends or {}).get("top", [])]
    keep = cfg["generacion"].get("no_repetir_ultimos", 150)
    past = [h.get("premisa") or h["titulo"] for h in history[-keep:]]
    tema = pedido() or cc.get("tema", "")
    user = (
        f"Tema de los sketches: {tema}\nAmbiente visual: {cc.get('ambiente', '')}\n\n"
        + (f"Vídeos de esta temática con más vistas/día ahora mismo:\n{json.dumps(top, ensure_ascii=False)}\n\n" if top else "")
        + f"Escenas disponibles:\n{json.dumps({k: v['desc'] for k, v in catalog['scenes'].items()}, ensure_ascii=False)}\n\n"
        + f"Títulos ya hechos (no repetir):\n{json.dumps(past, ensure_ascii=False)}\n\n"
        + f"Dame exactamente {n} ideas de sketch distintas, ordenadas de más a menos potencial viral. "
        "En 'inspirado_en' deja la lista vacía."
    )
    return make_params(SYSTEM_COMEDY_IDEAS, None, user, ANALYSIS_SCHEMA, models(cfg)[0])


def comedy_story_params(idea: dict, analysis: dict, cfg: dict) -> dict:
    cc = cfg.get("comedia", {})
    nivel = cc.get("palabrotas", "moderadas")
    palabrotas = {
        "ninguna": "ninguna; el humor va sin tacos",
        "moderadas": "moderadas, solo en los momentos clave del chiste",
        "muchas": (
            "MUCHAS. Los amigos hablan como colegas de verdad cuando juegan: tacos españoles en casi todas sus "
            "intervenciones (joder, hostia, coño, me cago en la leche, me cago en todo, gilipollas, cabrón, mierda, "
            "la madre que te parió, qué cojones, vete a la mierda, imbécil, capullo, tontolaba). Variados, bien colocados "
            "para el golpe cómico y sin que se repita siempre el mismo. El narrador puede soltar alguno en el remate. "
            "Nunca insultos que se metan con discapacidades, orientación sexual, origen o género"
        ),
    }.get(nivel, nivel)
    system = SYSTEM_COMEDY_WRITER.replace("{variante}", cc.get("variante", "España")).replace("{palabrotas}", palabrotas)
    context = f"Catálogo de escenas, cámaras y transiciones:\n{json.dumps(catalog_for('comedia'), ensure_ascii=False, sort_keys=True)}"
    user = (
        f"Ambiente visual: {cc.get('ambiente', '')}\n\n"
        f"Lo que funciona ahora:\n{json.dumps(analysis.get('patrones_gancho', []), ensure_ascii=False)}\n\n"
        f"Idea del sketch:\n{json.dumps(idea, ensure_ascii=False)}\n\n"
        "Escribe el reparto, los ganchos candidatos y el sketch completo."
    )
    return make_params(system, context, user, COMEDY_SCHEMA, models(cfg)[1])


def _hex(v: str, default: str) -> str:
    return v if isinstance(v, str) and re.fullmatch(r"#[0-9a-fA-F]{6}", v) else default


def validate_comedy(raw: dict) -> dict:
    catalog = catalog_for("comedia")
    scenes, cams, trans = catalog["scenes"], catalog["cameras"], catalog["transitions"]
    cast = {}
    for c in raw["reparto"][:3]:
        cid = re.sub(r"[^a-z0-9_]", "", c["id"].lower()) or f"p{len(cast) + 1}"
        cast[cid] = {
            "name": c["nombre"],
            "voice": c["voz"] if c["voz"] in VOICE_PRESETS else "chico_1",
            "look": {
                "skin": c["piel"], "hair": c["pelo"], "hair_color": _hex(c["color_pelo"], "#1d1410"),
                "cap": _hex(c["gorra"], ""), "glasses": c["gafas_sol"], "outfit": _hex(c["ropa"], "#2f7cf6"),
                "pattern": c["estampado"], "chain": c["cadena"], "beard": c["barba"],
            },
        }
    ids = list(cast)
    norm = lambda x: re.sub(r"[^a-z0-9_]", "", str(x or "").lower())
    beats = []
    for p in raw["planos"]:
        text = re.sub(r"\s+", " ", p["texto"]).strip()
        if not text:
            continue
        sp = norm(p["habla"])
        sp = sp if sp in cast else "narrador"
        scene = p["escena"] if p["escena"] in scenes else "closeup"
        try:
            params = json.loads(p["params_json"] or "{}")
            params = params if isinstance(params, dict) else {}
        except json.JSONDecodeError:
            params = {}
        for key in ("left", "right", "who", "driver", "passenger"):
            if key in params and norm(params[key]) not in cast:
                params.pop(key)
            elif key in params:
                params[key] = norm(params[key])
        if scene == "duo" and ids:
            params.setdefault("left", ids[0])
            params.setdefault("right", ids[1] if len(ids) > 1 else ids[0])
            if sp in cast and sp not in (params["left"], params["right"]):
                params["right"] = sp
        if scene == "closeup" and "who" not in params:
            params["who"] = sp if sp in cast else (ids[0] if ids else None)
        beats.append({
            "text": text, "speaker": sp, "scene": scene, "params": params,
            "camera": p["camara"] if p["camara"] in cams else "static",
            "transition": p["transicion"] if p["transicion"] in trans else "cut",
        })
    title = raw["titulo"].strip()
    if "#shorts" not in title.lower():
        title = (title[:88] + " #shorts").strip()
    return {
        "title": title[:100], "description": raw["descripcion"].strip(),
        "tags": [t.strip("# ") for t in raw["tags"]][:15], "beats": beats,
        "cast": cast, "subtitle_style": "word", "gap": 0.04, "music": "synth",
    }


def main():
    cfg = load_config()
    rid = run_id()
    wd = week_dir(rid)
    history = read_json(DATA / "history.json", [])
    use_batch = models(cfg)[2]
    request = pedido()
    fmt = formato()
    if fmt == "comedia":
        n = int(os.environ.get("PEDIDO_N") or cfg.get("comedia", {}).get("videos", 3))
        params = comedy_ideas_params(read_json(wd / "trends.json"), n + EXTRA_IDEAS, history, cfg)
    elif request:
        n = int(os.environ.get("PEDIDO_N") or 3)
        params = ideas_for_request(request, n, history, cfg)
    else:
        trends = read_json(wd / "trends.json")
        if not trends:
            sys.exit("Falta trends.json: ejecuta antes trends.py")
        n = cfg["generacion"]["videos_por_semana"]
        params = analyze(trends, history, cfg, n + EXTRA_IDEAS)
    print("Analizando e ideando...")
    analysis = run_many({"analisis": params}, use_batch)["analisis"]
    if isinstance(analysis, Exception):
        raise analysis
    write_json(wd / "analysis.json", analysis)
    if request and fmt != "comedia":
        ideas = analysis["ideas"][:n]  # pedido especial: varias versiones del MISMO tema a propósito
    else:
        keep = cfg["generacion"].get("no_repetir_ultimos", 150)
        ideas = pick_new_ideas(analysis["ideas"], history, n, keep)
    print(f"Ideas listas: {len(ideas)}. Escribiendo guiones...")

    make = comedy_story_params if fmt == "comedia" else story_params
    results = run_many({f"guion-{i + 1:02d}": make(idea, analysis, cfg) for i, idea in enumerate(ideas)}, use_batch)
    stories = []
    for i, idea in enumerate(ideas):
        raw = results[f"guion-{i + 1:02d}"]
        if isinstance(raw, Exception):
            print(f"  [{i + 1}/{n}] error escribiendo guion: {raw}", file=sys.stderr)
            continue
        st = validate_comedy(raw) if fmt == "comedia" else validate_story(raw)
        st.update({"id": f"{rid}-{i + 1:02d}", "idea": idea, "ganchos": raw.get("ganchos_candidatos", [])})
        stories.append(st)
        print(f"  [{i + 1}/{n}] {st['title']} ({len(st['beats'])} planos) · gancho: {raw.get('gancho_elegido', '')}")
    if not stories:
        sys.exit("No se pudo escribir ningún guion")
    write_json(wd / "stories.json", stories)


if __name__ == "__main__":
    main()
