"""Paso 2: con las tendencias, Claude analiza qué funciona y escribe los guiones.

1) Una llamada de ANÁLISIS: patrones de gancho, temas y formatos que funcionan -> lista de ideas.
2) Una llamada por IDEA: guion completo dividido en "planos" con la escena animada de cada uno.
Todo sale en JSON validado por esquema.
"""
from __future__ import annotations

import datetime as dt
import json
from pathlib import Path
import re
import sys
import time

import anthropic

import os

from common import CATALOG, DATA, formato, load_config, load_history, pedido, read_json, run_id, week_dir, write_json

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
                    "piezas_nuevas": {"type": "array", "items": {"type": "string"}},
                },
                "required": ["tipo", "premisa", "gancho", "giro_final", "estilo_visual", "por_que_funcionara", "inspirado_en", "piezas_nuevas"],
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
        "pregunta_central": {"type": "string"},
        "frase_bucle": {"type": "string"},
        "texto_portada": {"type": "string"},
        "personajes": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "who": {"type": "string"},
                    "nombre_real": {"type": "string"},
                    "genero": {"type": "string", "enum": ["hombre", "mujer"]},
                    "edad": {"type": "string", "enum": ["niño", "joven", "adulto", "mayor"]},
                    "piel": {"type": "string", "enum": ["muy_clara", "clara", "media", "morena", "oscura"]},
                    "pelo": {"type": "string", "enum": ["corto", "largo", "rizado", "rapado", "calvo", "coleta", "afro", "raya", "moño"]},
                    "color_pelo": {"type": "string", "enum": ["negro", "castaño_oscuro", "castaño", "castaño_claro", "rubio_oscuro", "rubio", "pelirrojo", "canoso", "blanco"]},
                    "barba": {"type": "string", "enum": ["no", "corta", "larga", "bigote"]},
                    "gafas": {"type": "boolean"},
                    "ropa": {"type": "string", "enum": ["azul", "rojo", "verde", "morado", "naranja", "negro", "gris", "blanco", "marrón", "amarillo", "granate", "celeste"]},
                },
                "required": ["who", "nombre_real", "genero", "edad", "piel", "pelo", "color_pelo", "barba", "gafas", "ropa"],
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
    "required": ["pregunta_central", "frase_bucle", "texto_portada", "personajes", "ganchos_candidatos", "gancho_elegido", "titulo", "descripcion", "tags", "planos"],
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
- Cada idea: gancho que funcione en los 2 primeros segundos y DEJE CLARO EL TEMA con una pregunta (la gente no ve título ni descripción), y un remate final que sorprenda o invite a comentar.
- Mezcla tipos en cada tanda: 2-3 "que_pasaria_si", 2-3 "dato_curioso"/"explicacion" y 2-3 "caso_real"; no repitas \
temas del historial.
- "caso_real" = HISTORIAS REALES con protagonista: personas que vivieron algo increíble (medicina, accidentes y \
supervivencia, récords, inventos, errores históricos, golpes de suerte). Solo casos públicos y muy documentados \
(prensa seria, artículos médicos, libros). Con respeto: nada morboso ni detalles desagradables.
- Varía los formatos: no propongas todas las ideas con la misma estructura (día a día, cuenta atrás, telediario, \
segunda persona, historia en tercera persona, antes/después, pregunta-respuesta, lista con giro...).
- RIGOR: solo datos bien documentados de los que estés muy seguro. Los "¿qué pasaría si?" se basan en ciencia \
real (lo que dicen los expertos), sin inventar cifras. Si un dato es dudoso, descarta la idea.
- Las ideas tienen que poder contarse con las escenas disponibles del catálogo.
- "piezas_nuevas": cosas CONCRETAS que ese vídeo necesitaría mostrar y que NO están en la lista de piezas disponibles \
(p. ej. "pulpo", "faro", "momia"). Máximo 3, en singular y en español. Vacío si todo se puede contar con lo que hay. \
Un dibujante las añadirá a la biblioteca antes de montar los vídeos."""

SYSTEM_WRITER = """Eres guionista de YouTube Shorts narrados en español neutro (comprensible en España y Latinoamérica). \
Escribes guiones de 40 a 60 segundos (nunca más de 1 minuto ni menos de 40 segundos) que se convierten automáticamente en un vídeo animado.

LOS 2 PRIMEROS SEGUNDOS LO SON TODO (dato del canal: casi 4 de cada 10 personas deslizaban al empezar)
- El vídeo arranca con "texto_portada" ENORME en pantalla sobre la imagen del plano 1, y la voz dice el plano 1 sin pausa.
- Plano 1 = MÁXIMO 8 PALABRAS, el dato o la situación más fuerte, dicho de golpe ("Cayó 3.000 metros… y sobrevivió.", \
"Este hombre se operó a sí mismo.", "Tu cuerpo aguanta 11 días sin dormir."). Nada de frases largas ni nombres raros al principio.
- Plano 1 usa la escena MÁS IMPACTANTE visualmente del vídeo (nunca una persona quieta neutra ni un fondo vacío), con \
cámara "slam" o "shake". Tiene que haber movimiento desde el primer fotograma.

PRIMERO, LA PREGUNTA CENTRAL Y EL GANCHO (lo más importante: decide si la gente se queda o desliza)
La gente ve el vídeo SIN título ni descripción: solo oye la voz. Si en los 3 primeros segundos no sabe de qué va, desliza.
1) "pregunta_central": la pregunta que responde el vídeo, en una frase clara que entienda cualquiera sin contexto ("¿Qué pasaría si cada día bajaras más hondo en el océano?", "¿Cuánto aguanta tu cuerpo sin dormir?").
2) "ganchos_candidatos": 5 ganchos MUY distintos. TODOS deben dejar claro el tema del vídeo (la pregunta central) y a la vez enganchar. Tipos:
  a) pregunta "¿qué pasaría si…?" directa y concreta ("¿Qué pasaría si cada día bajaras diez veces más hondo en el mar?")
  b) pregunta con reto o amenaza ("¿Hasta dónde podrías bajar en el océano antes de que te aplaste el agua?")
  c) dato que choca + la pregunta ("En el fondo del mar el agua pesa como un camión encima de tu dedo. ¿Llegarías?")
  d) segunda persona CON el tema dicho ("Vas a bajar al fondo del océano. Un día, un nivel más.")
  e) contradicción / "lo que nadie te cuenta" sobre el tema ("Todos creen que el fondo del mar está vacío. No lo está.")
Puntúa cada uno de 1 a 10. PRUEBA DEL DESCONOCIDO (si no la pasa, máximo 3 puntos): alguien que solo oye esa frase, sin ver nada más, ¿sabe de qué va el vídeo y quiere saber la respuesta? Además: se entiende en menos de 2 segundos; es concreto; no destripa el final; MÁXIMO 8 PALABRAS. Copia el mejor en "gancho_elegido" y úsalo LITERALMENTE como texto del plano 1.
PROHIBIDO empezar a mitad de la historia sin presentar el tema (MAL: "Día uno: bajas diez metros." BIEN: "¿Y si cada día bajaras más hondo en el mar?"). Si el gancho es una afirmación, la pregunta central va en el plano 2.

TÉCNICAS DE RETENCIÓN (caja de herramientas: elige las que mejor encajen con ESTE vídeo y combínalas)
- Bucle abierto desde el principio: una promesa o duda que solo se resuelve al final ("Pero lo que le pasó \
después es aún más raro.", "Y la respuesta no es la que piensas.").
- Anticipación: siembra un detalle y avisa de que importará ("Acuérdate de este número, porque al final lo \
cambia todo."). Luego CÚMPLELO: todo lo que anuncies se resuelve.
- Mini-giros cada 10-15 segundos: "Pero entonces...", "Y aquí empieza el problema.", un dato que cambia lo que \
creías o una amenaza nueva.
- Concreción: nombres, edades, fechas, cifras y detalles sensoriales hacen que te lo creas y te importe.
- Emoción: que al espectador le importe lo que pasa (miedo, asombro, ternura, injusticia, alivio).
- Varía las frases: no uses siempre las mismas coletillas ("casi nadie lo sabe", "nadie esperaba") en todos los \
vídeos; busca la forma propia de cada historia.
- Cada 2-3 planos, algo nuevo: un dato, un giro pequeño, una amenaza o una pregunta ("Pero había un problema.").
- Nada de relleno ni frases de transición vacías; si un plano se puede quitar sin perder nada, quítalo.
- "frase_bucle" (OBLIGATORIA): la ÚLTIMA frase del vídeo, escrita para que la PRIMERA frase (plano 1) la complete y
  el espectador no note que el vídeo ha vuelto a empezar. Termina a medias, sin punto final, y el plano 1 es la
  continuación natural. Ejemplos: frase_bucle "Y lo más curioso es que, cada vez que" + plano 1 "te cortas, sanas.";
  frase_bucle "Por eso, si mañana" + plano 1 "cayeras tres mil metros..."; frase_bucle "Y todo empezó el día en que"
  + plano 1 "un hombre se operó a sí mismo.". Léelas seguidas: tienen que sonar como UNA sola frase. NO la repitas
  como plano: el sistema la añade al final con la misma imagen del plano 1.
- BUCLE OBLIGATORIO: la última frase debe enlazar con la primera, de forma que al volver a empezar el vídeo tenga \
sentido seguir viéndolo (p. ej. termina con "…y por eso, cuando cayó 3.000 metros…" para que el plano 1 continúe la frase, \
o con una pregunta que el plano 1 responde). Así mucha gente lo ve dos veces.

ESTRUCTURA BASE (adáptala: el formato concreto lo decide cada idea; no todos los vídeos son iguales)
1. GANCHO (plano 1, máx 8 palabras): el gancho elegido, el dato o la pregunta más fuerte. Nada de saludos, "hoy os \
cuento" ni introducciones. Ejemplos de tono: "¿Y si la Tierra dejara de girar?" / "Cayó 3.000 metros… y sobrevivió."
   Plano 2: lo que está en juego o la regla del reto, para que quieran quedarse ("Cada día, diez veces más \
hondo. Y al final hay algo que nadie esperaba.").
2. DESARROLLO: frases cortas, ritmo rápido, un detalle concreto por plano. Cada 2-3 planos, una micro-pregunta o \
tensión nueva para que nadie deslice.
3. GIRO / REMATE: el último o penúltimo plano revela algo que cambia todo o deja una pregunta. Mejor si la última \
frase conecta con la primera (bucle) para que se vuelva a ver.

HISTORIAS REALES (tipo "caso_real")
- Se cuentan en TERCERA PERSONA con un protagonista (escenas character/person/hospital/group con who \
"protagonista": siempre la misma cara). Otras personas: otro "who" ("madre", "medico"...).
- Una estructura que funciona (no es obligatoria): hecho increíble + promesa (gancho) → quién era y su vida \
normal → lo que pasó → la lucha y los obstáculos (con mini-giros) → el giro → el final que pocos conocen.
- Si citas frases, solo citas reales y documentadas (escena "quote"). Saltos de tiempo con "year_jump".
- "personajes": una ficha por persona que salga (who "protagonista" para el principal y el mismo "who" que uses en \
las escenas para los demás). Descríbela COMO ERA EN LA ÉPOCA DE LA HISTORIA según sus fotos públicas: sexo, edad, \
tono de piel, peinado, color de pelo, barba/bigote, gafas y el color de ropa más típico (uniforme, bata...). \
Así el dibujo se parece a la persona real. Si no sabes cómo era algún rasgo, elige lo más probable y neutro.
- En vídeos que no son historias reales, "personajes" puede ir vacío (o describir al "tú" si quieres un aspecto concreto).
- Respeto: nada de sangre, heridas explícitas ni detalles morbosos; cuéntalo como lo contaría un buen documental.
- Si no estás muy seguro de un dato concreto (fecha, cifra, nombre), no lo pongas o redondéalo.

REGLAS DE TEXTO
- 105-145 palabras en total y entre 14 y 20 planos (historias reales: 115-150 palabras y 15-20 planos): un cambio de \
imagen cada 2-3 segundos. Cada plano, UNA frase corta (6-12 palabras). \
Cada plano: 1-2 frases, 6-22 palabras.
- Escribe para el oído: sin emojis, sin abreviaturas, números escritos como se dicen si son cortos.
- Es un canal de CURIOSIDADES: tono divulgativo, cercano y con ritmo, como un amigo que te cuenta algo alucinante.
- El estilo preferido del dueño (segunda persona, día a día) es para "qué pasaría si" e "imagina que"; las \
historias reales van en tercera persona.
- RIGOR ABSOLUTO: cada dato y cada cifra tiene que ser correcto y estar bien documentado. Si no estás seguro de \
una cifra, no la pongas o redondea con "más de", "casi". En los "¿qué pasaría si?" explica lo que dice la ciencia.
- Haz comparaciones que se entiendan ("más rápido que un avión", "como llenar diez estadios").
- Sin violencia explícita, sin contenido sexual, sin personas reales difamadas.

REGLAS VISUALES
- "escena" debe ser una clave EXACTA del catálogo. "params_json" es un objeto JSON en texto con los parámetros de \
esa escena (usa "{}" si no hace falta). Los textos dentro de pantallas o periódicos deben ser cortos y en español.
- Cambia de escena con frecuencia (no más de 2 planos seguidos en la misma escena salvo "phone" con distinta pantalla).
- ESTILO DEL CANAL: luminoso, con mucho detalle y AMBIENTADO. Usa sobre todo la escena "escena": elige el "lugar" \
donde pasa cada momento (salón, cocina, hospital, desierto, playa, montaña, calle, coche...) y la "hora" en que pasa \
(dia/atardecer/noche: si la historia ocurre de noche, de noche; si es en el desierto, en el desierto). Pon a la persona \
haciendo algo ("objeto" en la mano, expresión con "mood") y cambia de lugar o de plano (medio/entero/sin_persona) con \
frecuencia. Las escenas marcadas [ESTILO OSCURO] solo para misterio o miedo.
- PIEZAS: en "piezas" pon SOLO nombres EXACTOS de "piezas_disponibles" (p. ej. "plaqueta", "globulo_blanco"), nunca \
descripciones ("plaquetas como ladrillos" está MAL). El estilo lo dan el lugar, la animación y la etiqueta.
- LO QUE SE DICE, SE VE (clave para la retención): cada plano tiene que MOSTRAR exactamente lo que dice la voz, con \
algo que PASA, no un dibujo quieto. Si la frase tiene una acción ("te cortas", "explota", "cae", "se rompe", "bebes", \
"se le ocurre", "choca", "crece", "se duerme"), usa la escena "accion" con ese tipo. En los momentos fuertes añade \
"efecto" (pum, boom, ay, zas, wow, crac, velocidad, brillo, humo, impacto) a cualquier escena. Varía mucho: acción, \
composición, escena, cifra, mapa... casi nunca dos planos seguidos con el mismo tipo de escena.
- ESCENAS A MEDIDA: cuando la narración hable de algo concreto (un animal, un órgano del cuerpo, un planeta, un \
vehículo, una comida, un objeto, un monumento...), usa "composicion" para MOSTRARLO con piezas de la biblioteca \
("piezas_disponibles"), en el lugar y la hora que toquen, y si aporta, con la persona reaccionando al lado. Combina \
piezas para contar la idea (p. ej. dinosaurio gigante + persona asustada en la playa; tierra + meteorito cayendo en el \
espacio; vaso de agua + gota en fondo liso). Usa solo nombres de la lista; si algo no existe, elige lo más parecido.
- VARIEDAD: no uses la misma escena más de 2 veces en todo el vídeo (con "escena", cambia de lugar, hora, plano u objeto \
entre planos: cuenta como distinta) (la persona protagonista con character/person, \
máximo 4). Si necesitas repetir una idea (lugar, paso del tiempo, noticia), cambia de escena o usa otro "style" \
(map_pin: islas/globo/calles/relieve; calendar: taco/pared/marcas; newspaper: papel/web/portada). Aprovecha todo el \
catálogo: hay muchas escenas distintas.
- El plano del giro usa cámara "slam" o transición "red"/"flash".
- "camara" y "transicion" deben ser claves exactas del catálogo.

TÍTULO, PORTADA Y DESCRIPCIÓN
- texto_portada: 2-6 palabras en MAYÚSCULAS. Sale ENORME en pantalla los 2 primeros segundos y en la miniatura: \
tiene que dejar claro el tema de un vistazo y dar ganas de quedarse (p. ej. "¿11 KM BAJO EL MAR?", \
"SIN DORMIR 11 DÍAS", "SE OPERÓ A SÍ MISMO"). Distinto del título, sin destripar el giro.
- titulo: máx 70 caracteres, genera curiosidad sin destripar el giro, termina con " #shorts".
- descripcion: 2-3 líneas que inviten a comentar (pregunta al espectador) + 3-5 hashtags.
- tags: 8-12 etiquetas en español."""


COMEDY_EXTRA_SCENES = ["phone", "money", "big_text", "calendar", "clock", "map_pin", "tv"]


def catalog_for(fmt: str) -> dict:
    """Catálogo de escenas que puede usar cada formato."""
    c = json.loads(CATALOG.read_text(encoding="utf-8"))
    c.pop("piezas_alias", None)
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
nunca todo todos cada vez mundo esta estos estas eso existe hace hacer puede vuelve otra otro
dia dias ano anos vez veces solo sola tuvo tenia era fue han hombre mujer persona gente vida tiempo historia real
primer primera despues antes ahora asi tan tanto entre hasta desde durante dos tres mil""".split())


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
        shared = len(kw & okw)
        if overlap >= threshold and shared >= max(2, min(3, len(kw), len(okw))):
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


def make_params(system: str, context: str | None, user: str, schema: dict, model: str, effort: str = "high", max_tokens: int = 32000) -> dict:
    """Petición con la parte fija (instrucciones + catálogo) cacheada: se paga casi una sola vez."""
    blocks = [{"type": "text", "text": system}]
    if context:
        blocks.append({"type": "text", "text": context})
    blocks[-1]["cache_control"] = {"type": "ephemeral", "ttl": "1h"}
    return dict(
        model=model,
        max_tokens=max_tokens,  # límite alto: solo se paga lo que se escribe, y así no se corta (cortarse = pagar dos veces)
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
    disliked = [h["titulo"] + (f" (motivo: {h['motivo']})" if h.get("motivo") else "") for h in history if h.get("aprobado") is False][-15:]
    from collections import Counter  # noqa: PLC0415

    razones = Counter(r.strip().lower() for h in history[-60:] if h.get("motivo")
                      for r in h["motivo"].split("—")[0].split(",") if r.strip())
    out = ""
    if style:
        out += f"ESTILO QUE PREFIERE EL DUEÑO DEL CANAL (prioridad alta):\n{style}\n\n"
    if liked:
        out += f"Vídeos que APROBÓ (haz más como estos):\n{json.dumps(liked, ensure_ascii=False)}\n\n"
    if disliked:
        out += f"Vídeos que DESCARTÓ (evita ese enfoque):\n{json.dumps(disliked, ensure_ascii=False)}\n\n"
    if razones:
        out += ("Motivos por los que más descarta vídeos (CORRÍGELOS, son su feedback directo): "
                + ", ".join(f"{k} ({v})" for k, v in razones.most_common(6)) + "\n\n")
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
        f"Piezas disponibles en la biblioteca: {catalog['scenes'].get('composicion', {}).get('params', {}).get('piezas_disponibles', '')}\n\n"
        f"Títulos ya publicados o generados antes (no repetir premisas):\n{json.dumps(past, ensure_ascii=False)}\n\n"
        + taste_block(history, cfg)
        + f"Dame el análisis y exactamente {n_ideas} ideas ordenadas de mejor a peor potencial. "
        f"En 'inspirado_en' pon los id de los vídeos cuyo mecanismo aprovechas."
    )
    return make_params(SYSTEM_ANALYST, None, user, ANALYSIS_SCHEMA, models(cfg)[0])


SYSTEM_HISTORIAS = """Eres el investigador y estratega de Curiosidario, un canal de YouTube Shorts en español con vídeos \
animados narrados. Tu trabajo: encontrar las HISTORIAS REALES con más potencial de visualizaciones para contarlas \
en 45-60 segundos.

Qué hace que una historia real arrase en Shorts (puntúa cada candidata con esto):
- Premisa increíble que se entiende en una frase ("Le pusieron los brazos de otra persona", "Sobrevivió 438 días \
perdido en el mar", "Un error de una letra le costó millones").
- Protagonista concreto con nombre, del que te importa qué le pasa (supervivencia, superación, injusticia, suerte, \
ingenio, error absurdo, récord imposible, misterio resuelto).
- Un giro o un final que poca gente conoce (lo que pasó después, el detalle que lo cambia todo).
- Emoción fuerte (asombro, tensión, ternura, indignación) y que invite a comentar ("¿tú qué habrías hecho?").
- Poco contada en español o con un ángulo nuevo, pero MUY documentada (prensa seria, artículos científicos o \
médicos, libros, documentales). Si dudas de que sea cierta, descártala.
- Se puede animar con nuestras escenas (personas, hospital, quirófano, médico, documentos, mar, espacio, ciudad, \
calendario, años que pasan, familia...).

Reglas:
- Todas las ideas son tipo "caso_real" y de personas, sucesos o casos públicos.
- Variedad de épocas, países y temas (medicina, supervivencia, ciencia, historia, deporte, dinero, inventos, \
animales con personas...). Nada de crímenes violentos explicados con detalle ni morbo; con respeto a las víctimas.
- NUNCA repitas una historia o un protagonista que ya esté en la lista de vídeos anteriores.
- En "premisa" pon el nombre del protagonista y el hecho clave; en "gancho", la frase inicial que pasa la prueba \
del desconocido; en "giro_final", lo que poca gente sabe.
- En "por_que_funcionara" explica por qué tendrá muchas visualizaciones (y qué fuentes lo documentan)."""


def real_story_ideas(trends: dict | None, n_ideas: int, history: list[dict], cfg: dict, tema: str | None) -> dict:
    catalog = catalog_for("historias")
    keep = cfg["generacion"].get("no_repetir_ultimos", 150)
    past = [h.get("premisa") or h["titulo"] for h in history[-max(keep, 400):]]
    top = [{k: v.get(k) for k in ("id", "titulo", "canal", "vistas", "vistas_por_dia", "descripcion")} for v in (trends or {}).get("top", [])[:40]]
    user = (
        (f"Historias reales que están funcionando en Shorts estos días (para ver qué mecanismos enganchan; NO las "
         f"copies ni repitas sus protagonistas):\n{json.dumps(top, ensure_ascii=False)}\n\n" if top else "")
        + (f"El dueño del canal quiere historias sobre: \"{tema}\"\n\n" if tema else
           "El dueño del canal no ha puesto tema: busca tú las mejores historias reales que existan.\n\n")
        + f"Escenas disponibles para animar:\n{json.dumps({k: v['desc'] for k, v in catalog['scenes'].items()}, ensure_ascii=False)}\n\n"
        + f"Vídeos anteriores del canal (NO repetir historias ni protagonistas):\n{json.dumps(past, ensure_ascii=False)}\n\n"
        + taste_block(history, cfg)
        + f"Dame exactamente {n_ideas} historias reales distintas, ordenadas de MÁS a menos potencial de visualizaciones. "
        "En 'patrones_gancho' pon qué tipos de gancho usarás; 'temas_calientes' y 'formatos' pueden ir vacíos; "
        "en 'inspirado_en' pon los id de vídeos de la lista cuyo mecanismo aprovechas (o vacío)."
    )
    return make_params(SYSTEM_HISTORIAS, None, user, ANALYSIS_SCHEMA, models(cfg)[0])


SYSTEM_PEDIDO = """Eres el estratega de un canal de YouTube Shorts en español de vídeos animados narrados \
(ilustración vectorial, narrador en off y subtítulos palabra a palabra). El dueño del canal te pide un vídeo \
concreto. Tu trabajo: proponer VARIAS versiones distintas de ESE MISMO pedido, para quedarse con la mejor.

Reglas:
- Todas las versiones tratan exactamente sobre lo que se pide. No cambies el tema.
- Cada versión debe ser claramente diferente: otro gancho, otra estructura (p. ej. narración en segunda persona, \
historia de un personaje, cuenta atrás día a día, lista de datos, giro final inesperado), otro remate y otro \
estilo visual (escenas distintas del catálogo).
- Cada gancho debe enganchar en los 2 primeros segundos y DEJAR CLARO EL TEMA con una pregunta (la gente no ve título ni descripción).
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
    if idea.get("tipo") == "caso_real":
        lo, hi = cfg["generacion"].get("duracion_caso_real_seg", [60, 100])
    user = (
        f"Patrones de gancho que funcionan ahora:\n{json.dumps(analysis['patrones_gancho'], ensure_ascii=False)}\n\n"
        + (f"Pedido original del dueño del canal (respétalo): \"{pedido()}\"\n\n" if pedido() else "")
        + (f"Estilo que prefiere el dueño del canal:\n{style}\n\n" if style else "")
        + f"Idea a desarrollar:\n{json.dumps(idea, ensure_ascii=False)}\n\n"
        + (f"Para este vídeo se han añadido a la biblioteca estas piezas (úsalas en 'composicion'): {', '.join(idea['piezas_nuevas'])}\n\n" if idea.get("piezas_nuevas") else "")
        + f"Duración objetivo: {lo}-{hi} segundos. Escribe los ganchos candidatos y después el guion completo."
    )
    return make_params(SYSTEM_WRITER, context, user, STORY_SCHEMA, models(cfg)[1], effort=cfg["generacion"].get("esfuerzo_guiones", "medium"))


def _fix_pieces(params: dict, text: str) -> tuple[dict, str | None]:
    """Corrige los nombres de piezas de una composición (plurales, tildes, parecidos). Devuelve (params, escena_alternativa)."""
    import difflib  # noqa: PLC0415
    import unicodedata  # noqa: PLC0415

    cat = json.loads(CATALOG.read_text(encoding="utf-8"))
    names = [n.strip() for n in cat["scenes"]["composicion"]["params"]["piezas_disponibles"].split(",") if n.strip()]
    alias = cat.get("piezas_alias", {})
    plain = lambda x: unicodedata.normalize("NFD", str(x).lower().strip()).encode("ascii", "ignore").decode().replace(" ", "_")
    def resolve(n, fuzzy=True):
        for k in (str(n).lower().strip(), plain(n)):
            for c in (k, k[:-2] if k.endswith("es") else k, k[:-1] if k.endswith("s") else k):
                if c in names: return c
                if c in alias: return alias[c]
        if not fuzzy:
            return None
        m = difflib.get_close_matches(plain(n), names + list(alias), n=1, cutoff=0.75)
        if m:
            return alias.get(m[0], m[0])
        # Descripción en vez de nombre ("plaquetas como ladrillos rojos"): buscar dentro grupos de 2 palabras y luego 1
        words = [w for w in re.split(r"[\s_,.;:]+", str(n).lower()) if len(w) > 2]
        for size in (2, 1):
            for i in range(len(words) - size + 1):
                chunk = " ".join(words[i:i + size])
                if chunk == str(n).lower().strip():
                    continue
                r = resolve(chunk, fuzzy=False)
                if r:
                    return r
        return None
    items = params.get("piezas") or params.get("objetos") or []
    if isinstance(items, str):
        try:
            items = json.loads(items)
        except json.JSONDecodeError:
            items = [x for x in re.split(r"[,;]", items) if x.strip()]
    if not isinstance(items, list):
        items = [items]
    fixed, unknown = [], []
    for it in items:
        it = {"pieza": it} if isinstance(it, str) else dict(it or {})
        name = it.get("pieza") or it.get("nombre") or it.get("name")
        r = resolve(name) if name else None
        if r:
            it["pieza"] = r
            fixed.append(it)
        elif name:
            unknown.append(str(name))
    params = {**params, "piezas": fixed}
    params.pop("objetos", None)
    if unknown:
        print(f"  aviso: piezas que no existen en la biblioteca: {unknown}")
        params["_faltan"] = unknown
    if fixed:
        return params, None
    # Ninguna pieza válida: plano con contenido seguro en vez de un fondo vacío
    label = params.get("label") or (unknown[0] if unknown else "")
    return {"text": str(label or text.split(".")[0])[:14].upper(), "label": ""}, "big_text"


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
        if scene == "composicion":
            params, alt = _fix_pieces(params, text)
            if alt:
                print(f"  aviso: composición sin piezas válidas -> {alt}: «{text[:50]}»")
                scene = alt
        if scene == "big_text" and "text" not in params:
            params["text"] = ""
        beats.append({
            "text": text,
            "scene": scene,
            "params": params,
            "camera": p["camara"] if p["camara"] in cams else "push_in",
            "transition": p["transicion"] if p["transicion"] in trans else "fade",
        })
    from collections import Counter  # noqa: PLC0415

    reps = {k: v for k, v in Counter(f"escena:{b['params'].get('lugar')}:{b['params'].get('plano', 'medio')}" if b["scene"] == "escena"
                         else f"composicion:{json.dumps(b['params'].get('piezas'), sort_keys=True)}" if b["scene"] == "composicion"
                         else f"accion:{b['params'].get('tipo')}" if b["scene"] == "accion"
                         else b["scene"] for b in beats).items()
            if v > (4 if k in ("character", "person") else 2)}
    if reps:
        print(f"  aviso: escenas muy repetidas en este guion: {reps}")
    # Bucle: la frase final (que completa el plano 1) va al final con la MISMA imagen del plano 1
    bucle = re.sub(r"\s+", " ", story.get("frase_bucle") or "").strip().rstrip(".")
    if beats and bucle:
        if beats[-1]["text"].strip().rstrip(".…").lower() == bucle.lower().rstrip("…"):
            beats.pop()  # el guionista la repitió como plano: se sustituye por la versión con la imagen del principio
        first = beats[0]
        beats.append({**first, "text": bucle if bucle.endswith(("…", "...")) else bucle + "…", "camera": "static", "transition": "cut", "bucle": True})
    elif beats:
        print("  aviso: el guion no trae frase de bucle")
    # Red de seguridad: el vídeo tiene que presentar su tema con una pregunta al principio
    # (la gente lo ve sin título ni descripción). Si el guion no la tiene, se añade la pregunta central delante.
    pregunta = re.sub(r"\s+", " ", story.get("pregunta_central") or "").strip()
    if beats and pregunta.endswith("?") and not any("?" in b["text"] for b in beats[:3]):
        pos = 1 if len(beats) > 1 else 0  # el plano 1 queda corto y fuerte; la pregunta, justo después
        base = beats[pos - 1 if pos else 0]
        if base["scene"] == "accion":  # no repetir la acción: la persona reacciona en su sitio
            base = {**base, "scene": "escena", "params": {"lugar": base["params"].get("lugar") or "salon", "plano": "medio", "mood": "shocked", "efecto": "wow"}}
        beats.insert(pos, {**base, "text": pregunta, "camera": "push_in", "transition": "cut"})
        print(f"  (añadida la pregunta central en el plano {pos + 1}: «{pregunta}»)")
    if beats:
        beats[0]["camera"] = beats[0]["camera"] if beats[0]["camera"] in ("slam", "shake") else "slam"  # movimiento desde el fotograma 0
        if len(beats[0]["text"].split()) > 12:
            print(f"  aviso: el plano 1 es largo ({len(beats[0]['text'].split())} palabras)")
    title = story["titulo"].strip()
    if "#shorts" not in title.lower():
        title = (title[:88] + " #shorts").strip()
    return {
        "title": title[:100],
        "description": story["descripcion"].strip(),
        "tags": [t.strip("# ") for t in story["tags"]][:15],
        "beats": beats,
        "looks": {str(p.get("who") or "protagonista").lower(): {k: v for k, v in p.items() if k not in ("who", "nombre_real")}
                  for p in (story.get("personajes") or [])},
        "cover_text": re.sub(r"\s+", " ", story.get("texto_portada") or "").strip()[:60],
        "question": pregunta,
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
    history = load_history()
    use_batch = models(cfg)[2]
    request = pedido()
    fmt = formato()
    fase = os.environ.get("FASE", "").strip()  # "" = todo seguido | plan = solo ideas | guiones = desde un plan guardado
    if fase == "rehacer":
        return rehacer(os.environ["REHACER_ID"], rid, wd)
    plan_path = DATA / "planes" / f"{rid}.json"
    if fase == "guiones" and plan_path.exists():
        plan = read_json(plan_path)
        analysis, ideas = plan["analysis"], plan["ideas"]
        write_json(wd / "analysis.json", analysis)
        plan["estado"] = "montando"
        write_json(plan_path, plan)
        print(f"Plan {rid}: {len(ideas)} ideas. Escribiendo guiones con la biblioteca actual...")
        return write_scripts(ideas, analysis, cfg, rid, wd, fmt, use_batch)
    if fmt == "comedia":
        n = int(os.environ.get("PEDIDO_N") or cfg.get("comedia", {}).get("videos", 3))
        params = comedy_ideas_params(read_json(wd / "trends.json"), n + EXTRA_IDEAS, history, cfg)
    elif fmt == "historia_real":
        n = int(os.environ.get("PEDIDO_N") or 1)
        params = real_story_ideas(read_json(wd / "trends.json"), n + EXTRA_IDEAS, history, cfg, request)
    elif request:
        n = int(os.environ.get("PEDIDO_N") or 2)
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
    if request and fmt == "historias":
        ideas = analysis["ideas"][:n]  # pedido especial: varias versiones del MISMO tema a propósito
    else:
        keep = cfg["generacion"].get("no_repetir_ultimos", 150)
        if fmt == "historia_real":
            keep = len(history) or 1  # una historia real nunca se repite, aunque sea de hace mucho
        ideas = pick_new_ideas(analysis["ideas"], history, n, keep)
    if fmt == "historia_real":
        for idea in ideas:
            idea["tipo"] = "caso_real"
    if fase == "plan":
        nuevas = sorted({p.strip().lower() for i in ideas for p in (i.get("piezas_nuevas") or []) if p.strip()})
        write_json(plan_path, {"rid": rid, "fecha": dt.datetime.now(dt.timezone.utc).isoformat(), "estado": "pendiente",
                               "piezas_nuevas": nuevas, "analysis": analysis, "ideas": ideas})
        print(f"Plan guardado: {len(ideas)} ideas; piezas nuevas necesarias: {nuevas or 'ninguna'}")
        return
    return write_scripts(ideas, analysis, cfg, rid, wd, fmt, use_batch)


def _find_story(vid: str) -> dict | None:
    """Guion guardado de un vídeo: data/guiones/<id>.json o, en vídeos antiguos, la copia 'guiones' de su ejecución."""
    import subprocess  # noqa: PLC0415
    import tempfile  # noqa: PLC0415

    saved = read_json(DATA / "guiones" / f"{vid}.json")
    if saved:
        return saved
    repo = os.environ.get("GITHUB_REPOSITORY", "")
    runs = json.loads(subprocess.run(["gh", "api", f"repos/{repo}/actions/runs?per_page=80"], capture_output=True, text=True).stdout or "{}").get("workflow_runs", [])
    for r in runs:
        if not r.get("path", "").endswith(("pedido.yml", "historia.yml", "semanal.yml", "semanal_montar.yml", "rehacer.yml")):
            continue
        with tempfile.TemporaryDirectory() as tmp:
            if subprocess.run(["gh", "run", "download", str(r["id"]), "-R", repo, "-n", "guiones", "-D", tmp], capture_output=True).returncode:
                continue
            for f in Path(tmp).rglob("stories.json"):
                for st in json.loads(f.read_text(encoding="utf-8")):
                    if st.get("id") == vid:
                        print(f"  guion recuperado de la ejecución {r['id']}")
                        return st
    return None


def rehacer(vid: str, rid: str, wd) -> None:
    """Vuelve a montar un vídeo con su MISMO guion (sin llamar a la API: coste 0) y el sistema actual."""
    st = _find_story(vid)
    if not st:
        sys.exit(f"No encuentro el guion de {vid}")
    for b in st.get("beats", []):  # corrige nombres de piezas con la biblioteca actual
        if b.get("scene") == "composicion":
            params, alt = _fix_pieces(b.get("params") or {}, b.get("text", ""))
            b["params"] = params
            if alt:
                b["scene"] = alt
    base = re.sub(r"-r\d+$", "", vid)
    n = 1 + sum(1 for p in (DATA / "guiones").glob(f"{base}-r*.json")) if (DATA / "guiones").exists() else 1
    st["id"] = f"{base}-r{n}"
    st.pop("video", None); st.pop("qa", None); st.pop("portada", None)
    write_json(wd / "analysis.json", {"resumen": "", "patrones_gancho": [], "temas_calientes": [], "formatos": [], "ideas": []})
    write_json(wd / "stories.json", [st])
    print(f"Rehacer gratis: {vid} -> {st['id']} ({len(st.get('beats', []))} planos, sin gastar API)")


def write_scripts(ideas, analysis, cfg, rid, wd, fmt, use_batch):
    n = len(ideas)
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
