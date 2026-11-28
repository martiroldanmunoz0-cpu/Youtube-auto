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

import gasto
from common import CATALOG, DATA, formato, idioma, load_config, load_history, pedido, read_json, run_id, week_dir, write_json

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
        # Antes de nada: analizar vídeos PARECIDOS (competencia + nuestros), qué gancho usan y si funcionaría aquí.
        "analisis_gancho": {
            "type": "object",
            "properties": {
                "parecidos": {"type": "array", "items": {"type": "string"}},
                "que_gancho_usan": {"type": "string"},
                "funcionaria_aqui": {"type": "string"},
                "decision": {"type": "string"},
            },
            "required": ["parecidos", "que_gancho_usan", "funcionaria_aqui", "decision"],
            "additionalProperties": False,
        },
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
        "pregunta_comentarios": {"type": "string"},
        "lista": {"type": "string"},
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
    "required": ["analisis_gancho", "pregunta_central", "frase_bucle", "texto_portada", "personajes", "ganchos_candidatos", "gancho_elegido", "titulo", "descripcion", "pregunta_comentarios", "lista", "tags", "planos"],
    "additionalProperties": False,
}

# Vídeos largos: el mismo esquema, y cada plano puede abrir un capítulo ("capitulo": título o "")
import copy as _copy
LONG_SCHEMA = _copy.deepcopy(STORY_SCHEMA)
LONG_SCHEMA["properties"]["planos"]["items"]["properties"]["capitulo"] = {"type": "string"}
LONG_SCHEMA["properties"]["planos"]["items"]["required"].append("capitulo")
# Títulos: 5 candidatos puntuados ANTES de elegir (el título y la miniatura deciden si alguien entra)
LONG_SCHEMA["properties"]["titulos_candidatos"] = {"type": "array", "items": {"type": "object", "additionalProperties": False,
    "required": ["titulo", "nota"], "properties": {"titulo": {"type": "string"}, "nota": {"type": "integer"}}}}
LONG_SCHEMA["required"] = ["titulos_candidatos"] + LONG_SCHEMA["required"]

LONG_RULES = """VÍDEO LARGO (NO es un Short): formato horizontal de {lo_min}-{hi_min} minutos para YouTube.
- LONGITUD: entre {lo_w} y {hi_w} palabras en total (en los vídeos largos la voz lee ~3 palabras por segundo). Entre 70 y 100 planos
  (cada plano 1-2 frases, 12-22 palabras, unos 5-7 segundos).
- CADA PLANO ES UNA ESCENA ÚNICA (el dueño lo exige): cada plano se dibuja a medida con su propia animación, así que
  cada uno tiene que ser un MOMENTO VISUAL DISTINTO y concreto (qué se ve, qué se mueve, dónde, quién). NUNCA repitas
  el mismo lugar con la misma acción, ni la misma idea visual; nada de "otra vez la persona hablando". Si dos frases
  seguidas cuentan lo mismo, júntalas en un plano. Describe lo que se ve con detalle en params (lugar, piezas, acción,
  label) para que el dibujante sepa qué animar.
- CAPÍTULOS: 4-6 capítulos. En el primer plano de cada capítulo pon "capitulo" con un título corto y llamativo
  ("Capítulo 2 · Lo que encontraron"); en el resto de planos, "capitulo": "". El plano 1 también abre capítulo.
- LOS PRIMEROS 30 SEGUNDOS deciden todo: gancho fuerte en el plano 1 (sin destripar la respuesta), la pregunta
  central dicha en pocas palabras en el plano 2 (nunca una copia del título) y una PROMESA concreta de lo que va a
  ver ("y al final te cuento lo más increíble de todo"). Cada frase de la entrada tiene que pasar la PRUEBA DEL OÍDO:
  sin siglas ni nombres sin explicar, una cifra por frase como mucho.
- RETENCIÓN: cada 45-60 segundos un mini-gancho que obligue a seguir ("pero eso no es lo peor", "aquí es donde la
  historia se vuelve rara", "en un minuto vas a entender por qué"). Guarda la mayor sorpresa para el último capítulo.
- Ritmo: cambia de escena en cada plano; usa mucho "accion" y "composicion".
- FINAL: remate sorprendente + pregunta para comentarios + invita a ver otro vídeo del canal ("si te ha gustado, en
  el siguiente vídeo…"). Aquí NO hay bucle: deja "frase_bucle" vacía ("").
- TÍTULO (decide si la gente entra): primero escribe 5 "titulos_candidatos" MUY distintos y ponles nota del 1 al 10
  según cuántas ganas dan de hacer clic. Fórmulas que funcionan en vídeos largos de curiosidades: "¿Qué pasaría si…?",
  "Qué hay realmente…", "Por qué nadie…", "Lo que pasó cuando…", cifra extrema ("…durante 1000 años"), reto o
  misterio sin resolver. Concreto, con emoción, sin mentir ni prometer lo que el vídeo no da, máx 60-70 caracteres y
  con las palabras que la gente busca. En "titulo" pon el de mayor nota, SIN "#shorts".
- texto_portada: 2-4 palabras ENORMES para la miniatura que COMPLEMENTEN al título sin repetirlo (añaden intriga o
  la cifra impactante), p. ej. título "¿Qué hay a 12 km bajo tierra?" -> portada "LO TAPARON". Se lee en el móvil.
"""


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
Escribes guiones de 28 a 38 segundos (nunca más de 40: los Shorts que más se ven enteros y se repiten duran ~30 s) que se convierten automáticamente en un vídeo animado.

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
PROHIBIDO empezar a mitad de la historia sin presentar el tema (MAL: "Día uno: bajas diez metros." BIEN: "¿Y si cada día bajaras más hondo en el mar?"). El plano 1 tiene que dejar claro el tema POR SÍ SOLO (si no, reescríbelo). NUNCA pongas en el plano 2 la pregunta central larga ni repitas o reformules el título ("What actually happens if you step in quicksand, and how do you survive it?" = el espectador ya se ha ido).
EMPIEZA POR EL MOMENTO MÁS FUERTE (datos reales del canal: más de la mitad desliza en el primer segundo).
- El plano 1 cuenta el momento MÁS impactante de toda la historia (el clímax, la cifra brutal, el peligro), NUNCA \
el contexto. PROHIBIDO abrir con fechas, lugares, "En 1971…", "Esta es la historia de…", "Imagina que…" o presentar \
al personaje. MAL: "En 1971, un avión despegó de Lima." BIEN: "Cayó 3 kilómetros del cielo… y vivió."
- Da prioridad a los ganchos de tipo c) y a las afirmaciones de impacto; puntúa con máximo 5 cualquier gancho que \
sea introducción o contexto. El contexto llega después (plano 2-3), contado deprisa.
- Planos 1-3: frases muy cortas (máx 8-10 palabras), una idea por plano y cambio de imagen en cada uno.

TÉCNICAS DE RETENCIÓN (caja de herramientas: elige las que mejor encajen con ESTE vídeo y combínalas)
- Bucle abierto desde el principio: una promesa o duda que solo se resuelve al final ("Pero lo que le pasó \
después es aún más raro.", "Y la respuesta no es la que piensas.").
- Anticipación: siembra un detalle y avisa de que importará ("Acuérdate de este número, porque al final lo \
cambia todo."). Luego CÚMPLELO: todo lo que anuncies se resuelve.
- Mini-giros cada 6-8 segundos (cada 3-4 planos): "Pero entonces...", "Y aquí empieza el problema.", un dato que cambia lo que \
creías o una amenaza nueva.
- Concreción: nombres, edades, fechas, cifras y detalles sensoriales hacen que te lo creas y te importe.
- Emoción: que al espectador le importe lo que pasa (miedo, asombro, ternura, injusticia, alivio).
- Varía las frases: no uses siempre las mismas coletillas ("casi nadie lo sabe", "nadie esperaba") en todos los \
vídeos; busca la forma propia de cada historia.
- Cada 2-3 planos, algo nuevo: un dato, un giro pequeño, una amenaza o una pregunta ("Pero había un problema.").
- Nada de relleno ni frases de transición vacías; si un plano se puede quitar sin perder nada, quítalo.
- PRUEBA DEL OÍDO (obligatoria en cada frase): se entiende oída UNA vez, sin ver la imagen ni leer nada. Prohibidas \
siglas y nombres que no se expliquen en la misma frase (MAL: "You're a NOAA analyst." BIEN: "You're a navy sound \
spy."), frases elípticas que exigen pensar (MAL: "London reads newspapers at midnight." BIEN: "In London, the night \
sky glowed so bright people read outside.") y más de UNA cifra por frase.
- NO DESTRIPES: ni el gancho ni los primeros planos dan la respuesta (MAL: "Quicksand can't swallow you."). La \
respuesta llega en el último tercio; antes, solo pistas y amenazas.
- La escena manda: cada frase describe algo que SE VE en ese plano (acción, peligro, cambio), no un dato abstracto.
- "frase_bucle" (OBLIGATORIA): la ÚLTIMA frase del vídeo, escrita para que la PRIMERA frase (plano 1) la complete y
  el espectador no note que el vídeo ha vuelto a empezar. Termina a medias, sin punto final, y el plano 1 es la
  continuación natural. Ejemplos: frase_bucle "Y lo más curioso es que, cada vez que" + plano 1 "te cortas, sanas.";
  frase_bucle "Por eso, si mañana" + plano 1 "cayeras tres mil metros..."; frase_bucle "Y todo empezó el día en que"
  + plano 1 "un hombre se operó a sí mismo.". Léelas seguidas: tienen que sonar como UNA sola frase. NO la repitas
  como plano: el sistema la añade al final con la misma imagen del plano 1.
  Si el plano 1 es una PREGUNTA, la frase_bucle tiene que llevar a ella desde la propia historia, como si alguien
  la dijera en voz alta: frase_bucle "Así que la próxima vez que notes el suelo quieto, piensa" + plano 1 "¿y si la
  Tierra frenara en seco?". PROHIBIDO hablar del vídeo o de la pregunta en sí ("la pregunta sigue en pie", "volvamos
  al principio", "como decíamos", "otra vez"): el espectador NO debe notar el truco. Si no sale natural, cambia el
  plano 1 por una afirmación que se pueda continuar. Léela en voz alta: si suena rara o gramaticalmente rota, reescríbela.

ESTRUCTURA BASE (adáptala: el formato concreto lo decide cada idea; no todos los vídeos son iguales)
1. GANCHO (plano 1, máx 8 palabras): el gancho elegido, el dato o la pregunta más fuerte. Nada de saludos, "hoy os \
cuento" ni introducciones. Ejemplos de tono: "¿Y si la Tierra dejara de girar?" / "Cayó 3.000 metros… y sobrevivió."
   Plano 2 (MÁXIMO 7 PALABRAS): sube la apuesta o abre la duda que solo se cierra al final, sin repetir el plano 1 \
ni el título ("Pero no es lo que te mata.", "Y nadie encontró la roca.", "Los científicos tardaron 20 años.").
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
- 75-100 palabras en total y entre 10 y 14 planos (historias reales: 85-105 palabras y 11-15 planos): un cambio de \
imagen cada 2-3 segundos. Cada plano, UNA frase corta (4-12 palabras). Si sobra algo, quítalo: mejor corto y entero \
que largo y abandonado.
- Escribe para el oído: sin emojis, sin abreviaturas, números escritos como se dicen si son cortos.
- Es un canal de CURIOSIDADES: tono divulgativo, cercano y con ritmo, como un amigo que te cuenta algo alucinante.
- El estilo preferido del dueño (inmersivo, a menudo en segunda persona) es para "qué pasaría si" e "imagina que"; \
las historias reales van en tercera persona.
- ESTRUCTURA VARIADA (el dueño lo pide): NO uses por defecto la cuenta por tiempos ("Día uno…", "Hora tres…", \
"Segundo diez…", "Mes uno…"). Como mucho 2 planos pueden empezar con una marca de tiempo así. Elige la estructura \
que mejor cuente ESTA idea: mito contra realidad, misterio que se resuelve, escala de pequeño a enorme, comparación, \
experimento mental, historia con giro, ranking, antes y después…
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
- MUY DETALLADO (lo más importante del canal, el dueño lo exige): cada frase se tiene que VER PASAR en pantalla, \
literalmente, como en una animación cuidada. Si la voz dice "la vista se nubla", se ven los ojos parpadeando y todo \
desenfocándose (accion vista_nublada); "el cuerpo se hincha" -> accion hincharse; "te desmayas" -> desmayarse; "la saliva \
hierve" -> saliva_hierve; "el corazón se acelera" -> latido; "pasan los días" -> contar_dias; "una tormenta" -> tormenta_mar. \
Usa "accion" en AL MENOS la mitad de los planos (todas las que encajen: mira la lista de tipos del catálogo). Nada de \
personas quietas mirando a cámara ("person", "group", "character") salvo que no haya otra opción; nunca dos seguidas.
- LO QUE SE DICE, SE VE (clave para la retención): cada plano tiene que MOSTRAR exactamente lo que dice la voz, con \
algo que PASA, no un dibujo quieto. Si la frase tiene una acción ("te cortas", "explota", "cae", "se rompe", "bebes", \
"se le ocurre", "choca", "crece", "se duerme"), usa la escena "accion" con ese tipo. Puedes añadir "efecto" a una \
escena, pero las PALABRAS DE CÓMIC (pum, boom, ay, zas, wow, crac...) cansan: como mucho 2 en todo el vídeo, solo en \
los 2 momentos más fuertes (las acciones cortarse, explosion, choque, rayo, caer_romper, beber y comer ya traen la \
suya y cuentan). En el resto, si hace falta, usa velocidad, brillo o humo, o nada. Varía mucho: acción, \
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
- titulo: máx 70 caracteres, genera curiosidad sin destripar el giro, termina con " #shorts". Incluye las \
PALABRAS QUE LA GENTE BUSCA en YouTube sobre ese tema (p. ej. "qué pasa si te cae un rayo", "arenas movedizas"): \
muchas visitas de los Shorts llegan desde la búsqueda.
- descripcion: primera línea = frase con las palabras clave del tema (para la búsqueda); luego 1-2 líneas con un \
dato extra + 3-5 hashtags.
- pregunta_comentarios: UNA pregunta corta (máx 9 palabras) que den ganas de responder en comentarios: personal, \
de opinión o de elegir bando ("¿Tú habrías aguantado?", "¿Saldrías o esperarías ayuda?", "¿Lo sabías?"). \
Sale en pantalla al final y en la descripción. Nada de pedir likes ni suscripciones.
- lista: la lista de reproducción del canal donde encaja, EXACTAMENTE una de: {LISTAS}.
- tags: 8-12 etiquetas en español (incluye las búsquedas típicas del tema)."""


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
primer primera despues antes ahora asi tan tanto entre hasta desde durante dos tres mil
the an and or of to in on at for with from by is are was were be been it its this that these those you your what if
would could should will can how why when where who which there their they them he she his her we our us not no do does
did have has had just about into than then so very more most one two three thousand million day days year years time
fact facts happen happens happened really ever never every world people life story true""".split())


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


EN_OVERRIDE = """

=== LANGUAGE OVERRIDE (this overrides anything above about Spanish) ===
The channel is now "{nombre}" ({handle}), an ENGLISH-language YouTube channel for a US audience (also UK, Canada, Australia).
- Write EVERY viewer-facing text in natural, punchy American English: narration ("texto"), the loop sentence, titles,
  descriptions, hashtags, tags, cover text, hook question, comment question, labels ("label"), on-screen texts, numbers
  shown on screen, chapter names and playlist names. Never Spanish.
- Pick topics, references, examples and comparisons that a US viewer instantly gets (US places, money in dollars,
  American culture), and use US units (miles, feet, pounds, °F) — add metric only if it helps.
- Titles and descriptions are optimised for ENGLISH YouTube search ("What If…", "Why…", "How…", "The…").
- Second-person immersive narration ("You wake up…", "Imagine…") works great; keep sentences short and spoken.
- Words per second in English are similar: respect the same word limits.
- KEEP all JSON field names and all technical identifiers EXACTLY as the catalog defines them (scene names, camera,
  transition, "lugar", "hora", "tipo", piece names like "barco", "fuego", "mano", moods...). Those stay in Spanish:
  they are code, not text the viewer sees. Only translate what appears on screen or is heard.
"""


def _lang_system(system: str) -> str:
    cfg = load_config()
    if idioma(cfg) != "en":
        return system
    c = cfg.get("canal") or {}
    return system + EN_OVERRIDE.format(nombre=c.get("nombre", ""), handle=c.get("handle", ""))


def make_params(system: str, context: str | None, user: str, schema: dict, model: str, effort: str = "high", max_tokens: int = 32000) -> dict:
    """Petición con la parte fija (instrucciones + catálogo) cacheada: se paga casi una sola vez."""
    blocks = [{"type": "text", "text": _lang_system(system)}]
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


def parse_message(resp, batch: bool = False) -> dict:
    gasto.anthropic(getattr(resp, "model", ""), getattr(resp, "usage", None), batch)  # se paga aunque luego falle
    if resp.stop_reason == "refusal":
        raise RuntimeError(f"El modelo rechazó la petición: {resp.stop_details}")
    if resp.stop_reason == "max_tokens":
        raise RuntimeError("Respuesta cortada por max_tokens")
    text = next(b.text for b in resp.content if b.type == "text")
    return json.loads(text)


def call_sync(params: dict) -> dict:
    # Respuestas muy largas (guiones de vídeos largos): en streaming para que no caduque la conexión
    big = params.get("max_tokens", 0) > 32000
    try:
        # Con "fallbacks", si el modelo rechaza la petición, la API la reintenta en otro modelo.
        if big:
            with client.beta.messages.stream(**params, betas=["server-side-fallback-2026-07-01"], fallbacks="default") as st:
                resp = st.get_final_message()
        else:
            resp = client.beta.messages.create(**params, betas=["server-side-fallback-2026-07-01"], fallbacks="default")
    except anthropic.BadRequestError as e:
        if "fallback" not in str(e).lower():
            raise
        if big:
            with client.messages.stream(**params) as st:
                resp = st.get_final_message()
        else:
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
                            results[r.custom_id] = parse_message(r.result.message, batch=True)
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
    out += retention_block()
    return out


def retention_block() -> str:
    """Lecciones sacadas de la retención REAL de los vídeos publicados (pipeline/retencion.py)."""
    lec = read_json(DATA / "retencion" / "lecciones.json") or {}
    texto = lec.get("largos" if formato() == "largo" else "shorts") or lec.get("texto")
    out = ("MEJORAS SACADAS DE LA RETENCIÓN REAL DEL CANAL (en qué frases se va la gente y qué aguanta; aplícalas al "
           f"gancho, al ritmo, a las escenas y a cada frase):\n{texto}\n\n") if texto else ""
    rend = read_json(DATA / "rendimiento" / "para_guiones.json") or {}
    nota = rend.get("largos" if formato() == "largo" else "shorts")
    nota = "\n".join(nota) if isinstance(nota, list) else nota
    if nota:
        out += f"LO QUE DICE LA ÚLTIMA REVISIÓN DE RENDIMIENTO ({rend.get('revision', '')}: vistas, suscriptores, interacción, tráfico):\n{nota}\n\n"
    comp = (read_json(DATA / "competencia" / "ultimo.json") or {}).get("analisis") or {}
    nuevos = [f for f in comp.get("formatos_emergentes") or [] if isinstance(f, dict) and f.get("aplicar")]
    if nuevos:
        out += ("FORMATOS NUEVOS QUE ESTÁN EMPEZANDO A FUNCIONAR EN EL NICHO (forma de contar, nunca temas ni títulos de otros; "
                "aplícalos con nuestro estilo cuando encajen con la idea):\n"
                + "\n".join(f"- {f.get('formato')} → {f.get('como_aplicarlo')}" for f in nuevos) + "\n\n")
    temas = rend.get("temas") or {}
    if temas.get("mas") or temas.get("menos"):
        out += (f"Temas/ángulos que funcionan: {', '.join(temas.get('mas', [])) or '—'}. "
                f"Evitar o enfocar distinto: {', '.join(temas.get('menos', [])) or '—'}.\n\n")
    return out


_VACIAS = set("a an the of to in on if you your what why how is are was it and or for with by at from that this would happens".split())


def _palabras(txt: str) -> set[str]:
    return {w for w in re.findall(r"[a-z0-9']+", (txt or "").lower()) if len(w) > 2 and w not in _VACIAS}


def parecidos_block(idea: dict) -> str:
    """Vídeos parecidos a esta idea (competencia y nuestros, con vistas/retención) para ANALIZAR qué gancho usan
    y decidir si funcionaría aquí, en vez de aplicar un tipo de gancho fijo."""
    clave = _palabras(" ".join(str(idea.get(k, "")) for k in ("titulo", "premisa", "gancho", "pregunta_central")))
    comp = read_json(DATA / "competencia" / "ultimo.json") or {}
    vistos, filas = set(), []
    for c in comp.get("otros") or []:
        med = c.get("vistas_mediana_shorts") or c.get("vistas_mediana") or 1
        for grupo in ("se_salen", "en_auge", "flojos"):
            for v in c.get(grupo) or []:
                t = v.get("titulo", "")
                if t in vistos:
                    continue
                vistos.add(t)
                filas.append((len(clave & _palabras(t)), v.get("vistas", 0), f'- [{c.get("canal")}] "{t}" · {v.get("vistas", 0):,} vistas '
                              f'({round(v.get("vistas", 0) / med, 1)}x su mediana{", FLOJO" if grupo == "flojos" else ""})'))
    filas.sort(key=lambda f: (-f[0], -f[1]))
    comp_txt = "\n".join(f[2] for f in filas[:12])
    propios = []
    for f in sorted((DATA / "retencion").glob("*.json")):
        r = read_json(f) or {}
        if not r.get("id") or not r.get("vistas"):
            continue
        g = read_json(DATA / "guiones" / f"{r['id']}.json") or {}
        primera = (g.get("beats") or [{}])[0].get("text", "")
        propios.append(f'- "{r.get("titulo", "")}" · gancho: "{primera}" · {r.get("vistas")} vistas · {r.get("pct_visto")}% visto')
    if not comp_txt and not propios:
        return ""
    return ("VÍDEOS PARECIDOS (para ANALIZAR el gancho; no copies títulos ni frases):\n" + comp_txt
            + ("\nNuestros Shorts con su gancho real y su retención:\n" + "\n".join(propios) if propios else "") + "\n\n")


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
    largo = formato() == "largo"
    if largo:
        lo, hi = cfg["generacion"].get("duracion_largo_seg", [480, 600])
    user = (
        f"Patrones de gancho que funcionan ahora:\n{json.dumps(analysis['patrones_gancho'], ensure_ascii=False)}\n\n"
        + (f"Pedido original del dueño del canal (respétalo): \"{pedido()}\"\n\n" if pedido() else "")
        + (f"Estilo que prefiere el dueño del canal:\n{style}\n\n" if style else "")
        + retention_block()
        + f"Idea a desarrollar:\n{json.dumps(idea, ensure_ascii=False)}\n\n"
        + parecidos_block(idea)
        + ("ANÁLISIS DEL GANCHO (rellena 'analisis_gancho' ANTES que los candidatos): en 'parecidos' apunta los vídeos de arriba "
           "(y los que conozcas) más parecidos a ESTE tema; en 'que_gancho_usan', qué hace su primer segundo (imagen + frase) y "
           "cuáles funcionaron mejor o peor; en 'funcionaria_aqui', si ese mismo mecanismo funcionaría con ESTE vídeo y por qué "
           "(tema, personajes, lo que se ve en pantalla, nuestra retención real); en 'decision', el gancho que vas a usar y el motivo. "
           "Los tipos de gancho de las reglas son solo ideas: manda el análisis.\n\n")
        + (f"Para este vídeo se han añadido a la biblioteca estas piezas (úsalas en 'composicion'): {', '.join(idea['piezas_nuevas'])}\n\n" if idea.get("piezas_nuevas") else "")
        + (LONG_RULES.format(lo_min=lo // 60, hi_min=hi // 60, lo_w=int(lo * 2.9), hi_w=int(hi * 2.9)) + "\n" if largo else "")
        + f"Duración objetivo: {lo}-{hi} segundos. LÍMITE DE PALABRAS (la voz lee unas {2.9 if largo else 2.8} palabras por segundo): "
        f"entre {int(lo * (2.9 if largo else 2.8))} y {int(hi * (2.9 if largo else 2.8))} palabras EN TOTAL sumando todos los planos y la frase_bucle. "
        f"Cuéntalas antes de terminar; si te pasas, quita planos o acorta frases (nunca el gancho). "
        "Escribe los ganchos candidatos y después el guion completo."
    )
    listas = ", ".join(f'"{x}"' for x in cfg.get("publicacion", {}).get("listas", []))
    return make_params(SYSTEM_WRITER.replace("{LISTAS}", listas), context, user, LONG_SCHEMA if largo else STORY_SCHEMA, models(cfg)[1],
                       effort=cfg["generacion"].get("esfuerzo_guiones", "medium"), max_tokens=64000 if largo else 32000)


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
    # Ninguna pieza válida: nunca un texto suelto ni un fondo vacío. Se usa la escena animada del lugar con la
    # persona reaccionando y el nombre de lo que falta en la etiqueta (el aviso llega al revisor para dibujarla).
    label = params.get("label") or (unknown[0] if unknown else "")
    return {"lugar": params.get("lugar") or "calle", "hora": params.get("hora") or "dia", "plano": "medio",
            "mood": params.get("mood") or "shocked", "objeto": params.get("objeto") or "none", "who": params.get("who") or "protagonista",
            "label": str(label)[:28], "efecto": params.get("efecto") or "", "_faltan": unknown}, "escena"


META_BUCLE = re.compile(r"(la pregunta|este v[ií]deo|el v[ií]deo|al principio|volvamos|otra vez|de nuevo|como dec[ií]amos|sigue en pie|vuelve a empezar"
                        r"|the question|this video|the video|the beginning|let's go back|once again|all over again|as we said|still stands|starts again)", re.I)
MODELO_BARATO = "claude-haiku-5-5"


def _cheap_json(prompt: str, schema: dict) -> dict | None:
    """Llamada mínima a Haiku para tareas pequeñas de limpieza (cuesta una milésima de euro). Si falla, None."""
    try:
        r = client.messages.create(model=MODELO_BARATO, max_tokens=2000, messages=[{"role": "user", "content": prompt}],
                                   output_config={"effort": "low", "format": {"type": "json_schema", "schema": schema}})
        return parse_message(r)
    except Exception as e:  # noqa: BLE001
        print(f"  aviso: ayuda barata no disponible ({str(e)[:120]})")
        return None


def _exact_piece(n, names: list[str], alias: dict) -> bool:
    import unicodedata  # noqa: PLC0415
    k = str(n).lower().strip()
    plain = unicodedata.normalize("NFD", k).encode("ascii", "ignore").decode().replace(" ", "_")
    return any(c in names or c in alias for x in (k, plain) for c in (x, x[:-2] if x.endswith("es") else x, x[:-1] if x.endswith("s") else x))


def map_missing_pieces(planos: list[dict]) -> dict[str, str]:
    """Las piezas que el guionista inventó se traducen a la más parecida de la biblioteca (nunca un hueco ni un texto).
    Las originales se apuntan como pendientes para dibujarlas el lunes."""
    cat = json.loads(CATALOG.read_text(encoding="utf-8"))
    names = [n.strip() for n in cat["scenes"]["composicion"]["params"]["piezas_disponibles"].split(",") if n.strip()]
    missing = []
    for p in planos:
        if p.get("escena") != "composicion":
            continue
        try:
            params = json.loads(p.get("params_json") or "{}")
        except json.JSONDecodeError:
            continue
        items = params.get("piezas") or params.get("objetos") or []
        if isinstance(items, str):
            items = [x for x in re.split(r"[,;]", items) if x.strip()]
        for it in items if isinstance(items, list) else [items]:
            n = it if isinstance(it, str) else (it or {}).get("pieza") or (it or {}).get("nombre")
            if n and not _exact_piece(n, names, cat.get("piezas_alias", {})) and n not in missing:
                missing.append(str(n))  # todo lo que no sea nombre exacto o alias lo decide Haiku (entiende el significado)
    if not missing:
        return {}
    schema = {"type": "object", "additionalProperties": False, "required": ["mapa"], "properties": {"mapa": {"type": "array", "items": {
        "type": "object", "additionalProperties": False, "required": ["original", "pieza"],
        "properties": {"original": {"type": "string"}, "pieza": {"type": "string", "enum": names}}}}}}
    out = _cheap_json("Para un vídeo animado necesito dibujar estas cosas, pero no existen en mi biblioteca de dibujos. "
                      "Para cada una, elige la pieza de la biblioteca que mejor la REPRESENTE visualmente (la más parecida o la "
                      f"que mejor cuente la misma idea).\nCosas: {json.dumps(missing, ensure_ascii=False)}", schema)
    mapa = {m["original"]: m["pieza"] for m in (out or {}).get("mapa", []) if m.get("pieza") in names}
    for k, v in mapa.items():
        print(f"  pieza «{k}» no existe: se usa «{v}» (y queda apuntada para dibujarla)")
    return mapa


def fix_loop_phrase(bucle: str, first: str, last: str) -> str:
    """Si la frase del bucle habla del propio vídeo ("la pregunta sigue en pie"), Haiku la reescribe para que enlace sola."""
    if not bucle or not META_BUCLE.search(bucle):
        return bucle
    schema = {"type": "object", "additionalProperties": False, "required": ["frase_bucle"], "properties": {"frase_bucle": {"type": "string"}}}
    LENGUA = "inglés (American English)" if idioma() == "en" else "español"
    out = _cheap_json(f"Un vídeo corto termina con una frase a medias que la PRIMERA frase del vídeo completa, para que al repetirse "
                      f"parezca que sigue. La actual suena rara porque habla del vídeo o de la pregunta. Reescríbela en {LENGUA}: "
                      "máximo 14 palabras, sin punto final, que salga de la historia y que al leerla seguida de la primera frase "
                      "suene como UNA frase natural. No menciones el vídeo, la pregunta, el principio ni 'otra vez'.\n"
                      f"Penúltima frase del vídeo: {last}\nFrase actual: {bucle}\nPrimera frase: {first}", schema)
    nueva = re.sub(r"\s+", " ", (out or {}).get("frase_bucle") or "").strip().rstrip(".")
    if nueva and not META_BUCLE.search(nueva):
        print(f"  frase de bucle reescrita: «{bucle}» -> «{nueva}»")
        return nueva
    return bucle


# Red de seguridad: frases que describen algo con animación propia -> esa acción (si el plano era una persona quieta)
ACCION_POR_FRASE = [
    (r"nubla|borros|se te cierran los ojos|parpade", "vista_nublada"), (r"hincha|infla", "hincharse"),
    (r"desmay|pierdes el conocimiento|pierde el conocimiento|inconsciente", "desmayarse"),
    (r"saliva|hierve|burbuje", "saliva_hierve"), (r"coraz[oó]n|latido|pulso", "latido"),
    (r"congel|tirit|hipotermia", "congelarse"), (r"carcajada|te r[ií]es|se r[ií]e|risa", "reir"),
    (r"llora|l[aá]grima", "llorar"), (r"cosquilla", "cosquillas"), (r"tormenta|temporal|naufrag", "tormenta_mar"),
    (r"grita|chilla", "gritar"), (r"corre[sn]?\b|huye|escapa", "correr"), (r"se hunde|te hundes|ahoga", "hundirse"),
    (r"mare[ao]|da vueltas", "marearse"), (r"quema|abrasa|insolaci", "quemarse"),
    (r"pulmones|el aire sale|sueltas el aire|soltar el aire", "soltar_aire"), (r"flota|a la deriva por el espacio", "flotar_espacio"),
    (r"te duermes|se duerme|dormid", "dormir"), (r"tachas los d[ií]as|cuenta los d[ií]as|pasan los d[ií]as|d[ií]a tras d[ií]a", "contar_dias"),
    # inglés
    (r"vision blurs|blurry|your eyes close|eyelids", "vista_nublada"), (r"\bswell|\bbloat|puff(s|ed)? up", "hincharse"),
    (r"pass(es)? out|faint|black out|unconscious", "desmayarse"), (r"saliva|boils|bubbl", "saliva_hierve"),
    (r"\bheart\b|heartbeat|\bpulse", "latido"), (r"freez|shiver|hypothermia", "congelarse"), (r"laugh", "reir"),
    (r"\bcr(y|ies|ying)\b|\btears\b", "llorar"), (r"tickl", "cosquillas"), (r"\bstorm|shipwreck", "tormenta_mar"),
    (r"scream|\bshout|\byell", "gritar"), (r"\brun(s|ning)?\b|\bflee|escape", "correr"), (r"\bsink|drown", "hundirse"),
    (r"dizz|spinning", "marearse"), (r"\bburn|sunburn|scorch", "quemarse"), (r"\blungs\b|air rushes out|exhale", "soltar_aire"),
    (r"\bfloat|drift(ing)? through space", "flotar_espacio"), (r"fall(s)? asleep|\basleep\b", "dormir"),
    (r"count(ing)? the days|days pass|day after day", "contar_dias"),
]
ESCENAS_QUIETAS = {"person", "group", "character", "closeup", "duo", "quote"}


def _accion_para(text: str) -> str | None:
    for pat, tipo in ACCION_POR_FRASE:
        if re.search(pat, text, re.I):
            return tipo
    return None


def validate_story(story: dict) -> dict:
    """Limpia el guion: escenas/cámaras válidas, params parseados. Devuelve el formato interno."""
    catalog = catalog_for("historias")
    scenes, cams, trans = catalog["scenes"], catalog["cameras"], catalog["transitions"]
    beats = []
    mapa_piezas = map_missing_pieces(story["planos"])
    pendientes = list(mapa_piezas)
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
            if mapa_piezas:  # piezas inventadas -> la más parecida que sí existe
                items = params.get("piezas") or params.get("objetos") or []
                if isinstance(items, list):
                    params["piezas"] = [({**it, "pieza": mapa_piezas.get(it.get("pieza") or it.get("nombre"), it.get("pieza") or it.get("nombre"))}
                                         if isinstance(it, dict) else mapa_piezas.get(it, it)) for it in items]
            params, alt = _fix_pieces(params, text)
            if alt:
                print(f"  aviso: composición sin piezas válidas -> {alt}: «{text[:50]}»")
                scene = alt
        quieta = scene in ESCENAS_QUIETAS or (scene == "escena" and params.get("plano", "medio") == "medio" and params.get("objeto", "none") in ("none", "", None))
        tipo = _accion_para(text) if quieta else None
        if tipo:
            n = re.search(r"\b(\d{2,4})\b", text)
            params = {"tipo": tipo, "lugar": params.get("lugar"), "hora": params.get("hora"), "who": params.get("who") or "protagonista",
                      **({"numero": int(n.group(1))} if n and tipo == "contar_dias" else {})}
            params = {k: v for k, v in params.items() if v is not None}
            print(f"  plano quieto -> acción «{tipo}»: «{text[:60]}»")
            scene = "accion"
        if scene == "big_text" and "text" not in params:
            params["text"] = ""
        beats.append({
            **({"capitulo": p["capitulo"].strip()} if (p.get("capitulo") or "").strip() else {}),
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
    largo = formato() == "largo"
    bucle = "" if largo else re.sub(r"\s+", " ", story.get("frase_bucle") or "").strip().rstrip(".")
    if beats:
        bucle = fix_loop_phrase(bucle, beats[0]["text"], beats[-1]["text"])
    if beats and bucle:
        if beats[-1]["text"].strip().rstrip(".…").lower() == bucle.lower().rstrip("…"):
            beats.pop()  # el guionista la repitió como plano: se sustituye por la versión con la imagen del principio
        first = beats[0]
        beats.append({**{k: v for k, v in first.items() if k != "capitulo"}, "text": bucle if bucle.endswith(("…", "...")) else bucle + "…", "camera": "static", "transition": "cut", "bucle": True})
    elif beats and not largo:
        print("  aviso: el guion no trae frase de bucle")
    # Red de seguridad: el vídeo tiene que presentar su tema con una pregunta al principio
    # (la gente lo ve sin título ni descripción). Si el guion no la tiene, se añade la pregunta central delante.
    pregunta = re.sub(r"\s+", " ", story.get("pregunta_central") or "").strip()
    if beats and pregunta.endswith("?") and len(pregunta.split()) <= 8 and not any("?" in b["text"] for b in beats[:3]):
        pos = 1 if len(beats) > 1 else 0  # el plano 1 queda corto y fuerte; la pregunta, justo después
        base = beats[pos - 1 if pos else 0]
        if base["scene"] == "accion":  # no repetir la acción: la persona reacciona en su sitio
            base = {**base, "scene": "escena", "params": {"lugar": base["params"].get("lugar") or "salon", "plano": "medio", "mood": "shocked", "efecto": "wow"}}
        beats.insert(pos, {**{k: v for k, v in base.items() if k != "capitulo"}, "text": pregunta, "camera": "push_in", "transition": "cut"})
        print(f"  (añadida la pregunta central en el plano {pos + 1}: «{pregunta}»)")
    marcas = sum(bool(re.match(r"(d[ií]a|hora|segundo|minuto|mes|a[nñ]o|semana)s?\s+(\d+|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|cero)\b", b["text"], re.I)) for b in beats)
    if marcas > 2:
        print(f"  aviso: estructura por tiempos repetida ({marcas} planos empiezan con 'día/hora/segundo N')")
    n_acc = sum(b["scene"] == "accion" for b in beats)
    if beats and n_acc < len(beats) / 3:
        print(f"  aviso: pocas acciones animadas ({n_acc} de {len(beats)} planos)")
    palabras = sum(len(b["text"].split()) for b in beats)
    if palabras > 110 and not largo:
        print(f"  aviso: guion largo ({palabras} palabras ≈ {palabras / 2.8:.0f} s)")
    if len(beats) > 1 and not largo and len(beats[1]["text"].split()) > 9:
        print(f"  aviso: el plano 2 es largo ({len(beats[1]['text'].split())} palabras): ahí se va la gente")
    if beats:
        beats[0]["camera"] = beats[0]["camera"] if beats[0]["camera"] in ("slam", "shake") else "slam"  # movimiento desde el fotograma 0
        if len(beats[0]["text"].split()) > 12:
            print(f"  aviso: el plano 1 es largo ({len(beats[0]['text'].split())} palabras)")
    title = story["titulo"].strip()
    if largo:
        title = re.sub(r"\s*#shorts", "", title, flags=re.I).strip()
    elif "#shorts" not in title.lower():
        title = (title[:88] + " #shorts").strip()
    return {
        "title": title[:100],
        "description": ((re.sub(r"\s+", " ", story.get("pregunta_comentarios") or "").strip() + " 👇\n\n") if story.get("pregunta_comentarios") else "") + story["descripcion"].strip(),
        "tags": [t.strip("# ") for t in story["tags"]][:15],
        "beats": beats,
        "looks": {str(p.get("who") or "protagonista").lower(): {k: v for k, v in p.items() if k not in ("who", "nombre_real")}
                  for p in (story.get("personajes") or [])},
        "cover_text": re.sub(r"\s+", " ", story.get("texto_portada") or "").strip()[:60],
        "comment_q": re.sub(r"\s+", " ", story.get("pregunta_comentarios") or "").strip()[:80],
        "lista": (story.get("lista") or "").strip(),
        **({"formato": "horizontal"} if largo else {}),
        "question": pregunta,
        # Piezas que el guion pidió y no existían (ya sustituidas por la más parecida): se dibujan el lunes
        "piezas_pendientes": list(dict.fromkeys(pendientes + [x for b in beats for x in (b.get("params") or {}).get("_faltan", [])])),
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
    elif fmt == "largo":
        n = 1
        request = request or ("Elige TÚ el tema con más potencial para un vídeo LARGO de 8-10 minutos que no se haya hecho antes "
                              "en el canal. PRIORIDAD (el dueño lo pide, es lo que mejor funciona en largos): HISTORIA contada como "
                              "viaje o experiencia, p. ej. «¿Qué pasaría si viajaras 20.000 años atrás?», «Sobrevivir un día en la "
                              "prehistoria», «La historia completa de…» (una civilización, un imperio, una época, un invento), "
                              "«Qué pasaría si despertaras en la Edad Media / en Roma / en el Egipto de las pirámides». "
                              "Datos históricos reales y comprobables. Solo si ya se hizo todo eso: qué pasaría si, misterios reales.")
        params = ideas_for_request(request, n, history, cfg)
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
    if request and fmt in ("historias", "largo"):
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
    if st.pop("medida_estado", None) == "lista":
        st["id"] = vid  # primera vez que se monta (escenas a medida recién dibujadas): conserva su nombre
    else:
        base = re.sub(r"-r\d+$", "", vid)
        n = 1 + sum(1 for p in (DATA / "guiones").glob(f"{base}-r*.json")) if (DATA / "guiones").exists() else 1
        st["id"] = f"{base}-r{n}"
    st.pop("tanda", None)
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
        st.update({"id": f"{rid}-{i + 1:02d}", "idea": idea, "ganchos": raw.get("ganchos_candidatos", []), "analisis_gancho": raw.get("analisis_gancho")})
        stories.append(st)
        print(f"  [{i + 1}/{n}] {st['title']} ({len(st['beats'])} planos) · gancho: {raw.get('gancho_elegido', '')}")
    if not stories:
        sys.exit("No se pudo escribir ningún guion")
    write_json(wd / "stories.json", stories)


if __name__ == "__main__":
    main()
