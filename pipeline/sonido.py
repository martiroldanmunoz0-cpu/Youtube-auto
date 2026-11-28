"""Efectos de sonido sincronizados con lo que pasa en pantalla (estilo vídeos de curiosidades animados).

Cada plano dispara sus propios sonidos:
  - la transición y la cámara (latigazo, zoom, golpe en los "slam"),
  - la acción animada (rayo -> trueno, latido -> corazón, hundirse -> chapuzón y burbujas...),
  - las piezas que entran en escena (caen -> silbido + golpe seco, crecen -> pop...),
  - las palabras del guion en el instante en que se dicen ("flecha", "fuego", "dinero", "explosión"...),
  - y un ambiente suave según el lugar (olas en la playa, pájaros en el campo, grillos de noche...).

Sonidos reales de una biblioteca CC0 (assets/sfx), con variaciones de tono para que nunca suenen iguales.
Un plano puede fijar sus sonidos a mano con  "sonidos": [{"s": "trueno", "t": 0.4}]  (t en segundos desde el inicio del plano;
si t < 1 y "k": true, es fracción de la duración).
"""
from __future__ import annotations

import json
import re
import subprocess
import unicodedata
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SFX_DIR = ROOT / "assets" / "sfx"
SR = 44100

# Señal -> variantes de la biblioteca, y volumen (dB de pico)
CUES: dict[str, tuple[list[str], float]] = {
    "whoosh": (["whoosh_fast_1", "whoosh_fast_2", "whoosh_fast_3", "whoosh_fast_4", "whoosh_soft_1", "whoosh_soft_2", "whoosh_soft_3", "whoosh_air_1", "whoosh_air_2"], -15),
    "whoosh_big": (["whoosh_big_1", "whoosh_big_2", "whoosh_big_3", "whoosh_flyby_1", "whoosh_flyby_2"], -13),
    "whip": (["swish_whip_1", "swish_whip_2", "swish_whip_3", "swipe_1", "swipe_2", "swipe_3"], -14),
    "zoom_in": (["zoom_in_1", "zoom_in_2", "whoosh_hit_1", "whoosh_hit_2", "whoosh_hit_3"], -14),
    "zoom_out": (["zoom_out_1", "zoom_out_2", "glide_down", "whoosh_reverse_1"], -15),
    "hit": (["impact_1", "impact_2", "impact_3", "punch_1", "punch_2", "punch_3", "hit_cinematic_1"], -11),
    "hit_hard": (["impact_hard_1", "impact_hard_2", "hit_cinematic_1", "hit_cinematic_2", "trailer_hit_1", "trailer_hit_2", "braam_1"], -9),
    "boom": (["boom_1", "boom_2", "boom_sub_1", "boom_sub_2", "bass_drop_1"], -9),
    "explosion": (["explosion_1", "explosion_2"], -7),
    "thud": (["thud_1", "thud_2", "body_fall"], -11),
    "punch": (["punch_1", "punch_2", "punch_3", "slap"], -11),
    "metal": (["hit_metal_1", "hit_metal_2"], -12),
    "pop": (["pop_1", "pop_2", "pop_3", "pop_4", "pop_bubble_1", "pop_bubble_2", "pop_high", "bloop_1", "bloop_2", "pop_double", "pop_mouth"], -16),
    "pop_soft": (["pop_soft_1", "pop_soft_2", "pop_bubble_3", "bloop_2", "click_soft_1", "tap_1"], -18),
    "ding": (["ding_1", "ding_2", "ding_3", "chime_up_1", "chime_up_2", "bell_small_1", "bell_small_2"], -17),
    "sparkle": (["sparkle_1", "sparkle_2", "sparkle_3", "shimmer_1", "shimmer_2", "twinkle", "reveal_glow_1", "reveal_glow_2", "magic_wand_1"], -17),
    "poof": (["poof"], -14),
    "type": (["typewriter_keys", "typing_1", "typing_2", "key_single_1", "key_single_2"], -17),
    "year": (["counter_roll_1", "counter_roll_2", "page_flip_1", "page_flip_2"], -15),
    "count": (["counter_roll_1", "counter_roll_2", "money_counter"], -15),
    "money": (["cash_register_1", "cash_register_2", "coins_drop_1", "coins_drop_2", "cha_ching", "coin_1", "coin_2", "coin_3"], -14),
    "tick": (["tick_1", "tick_2", "clock_tick", "stopwatch"], -16),
    "alarm": (["alarm_beep_1", "alarm_beep_2", "warning_siren", "alarm_clock"], -17),
    "heartbeat": (["heartbeat"], -9),
    "thunder": (["thunder"], -7),
    "rain": (["rain"], -15),
    "wind": (["wind_1", "wind_2"], -14),
    "wave": (["wave"], -12),
    "splash": (["splash", "water_drop_1", "water_drop_2"], -11),
    "drop": (["water_drop_1", "water_drop_2"], -14),
    "bubbles": (["bubbles", "pop_bubble_1", "pop_bubble_2", "pop_bubble_3"], -13),
    "fire": (["fire_crackle"], -11),
    "sizzle": (["sizzle"], -13),
    "glass": (["glass_break"], -11),
    "door": (["door_open", "door_slam", "creak_long"], -12),
    "knock": (["knock_1", "knock_2"], -11),
    "steps": (["footsteps", "tiptoe"], -14),
    "run": (["run_away", "footsteps"], -13),
    "fall": (["slide_whistle_down"], -15),
    "rise": (["slide_whistle_up", "glide_up"], -15),
    "riser": (["riser_short_1", "riser_short_2", "riser_noise_1", "riser_tonal_1", "swell_reverse_1", "swell_reverse_2"], -15),
    "downer": (["downlifter_1", "downlifter_2", "power_down", "tail_reverb"], -14),
    "mystery": (["mystery", "suspense_sting", "suspense_hit", "dun_dun_dunnn", "question_hmm"], -14),
    "rumble": (["rumble"], -10),
    "boing": (["boing_1", "boing_2", "boing_3", "spring"], -15),
    "bonk": (["bonk_1", "bonk_2"], -13),
    "wobble": (["wobble_1", "wobble_2", "dizzy"], -15),
    "zip": (["zip_1", "zip_2"], -15),
    "splat": (["splat"], -13),
    "eyes": (["pop_eyes"], -14),
    "fail": (["wah_wah_fail", "fail_jingle", "drum_hit_fail", "wrong_buzzer"], -15),
    "win": (["tada", "success_jingle_1", "success_jingle_2", "positive_chord", "ding_success"], -15),
    "crowd_ooh": (["crowd_ooh", "crowd_wow"], -15),
    "crowd_aww": (["crowd_aww"], -15),
    "applause": (["applause_short", "cheer"], -16),
    "camera": (["shutter_1", "shutter_2", "shutter_quick"], -14),
    "paper": (["paper_1", "paper_2", "page_flip_1", "page_flip_2", "rip_1", "crumple"], -14),
    "write": (["scribble_1", "scribble_2", "pen_click"], -14),
    "stamp": (["stamp"], -12),
    "bell": (["school_bell", "bike_bell", "boxing_bell", "elevator_ding"], -16),
    "phone": (["ringtone", "vibrate_1", "message_received", "phone_dial"], -16),
    "message": (["message_received", "notif_message_1", "notif_message_2", "comment_blip"], -15),
    "car": (["car_horn_1", "car_horn_2"], -16),
    "eat": (["crunch_1", "crunch_2"], -12),
    "drink": (["pour", "can_open_fizz"], -13),
    "chop": (["chopping", "swish_sword_1"], -12),
    "arrow": (["swish_sword_1", "swish_sword_2", "swish_stick"], -12),
    "kiss": (["kiss"], -14),
    "whistle": (["referee_whistle", "finger_whistle"], -17),
    "fireworks": (["fireworks", "firecracker_string"], -14),
    "scare": (["jump_scare_1", "jump_scare_2", "ghost_whoosh"], -13),
    "laser": (["laser_1", "scanner", "teleport", "charge_up"], -16),
    "glitch": (["glitch_short_1", "glitch_short_2", "static_burst_1"], -16),
    "creak": (["creak_long"], -13),
    "cloth": (["swish_cloth_1", "swish_cloth_2", "zipper"], -15),
    "drumroll": (["drum_roll"], -16),
    "crash": (["crash"], -16),
    "keys": (["keys_jingle"], -15),
    "birds": (["birds"], -18),
}

# Ambientes de fondo (en bucle, muy bajos, cambian con el lugar)
BEDS = {"wave": -19, "birds": -20, "crickets": -21, "wind_1": -21, "stream": -20, "rain": -19, "fire_crackle": -20,
        "amb_hospital": -20, "amb_cabina": -22, "amb_espacio": -21, "amb_bajo_agua": -20, "amb_ciudad": -22, "amb_sala": -27, "amb_reloj": -23}
LUGAR_BED = {
    "playa": "wave", "bajo_el_mar": "amb_bajo_agua", "mar": "wave", "barco": "wave", "isla": "wave", "puerto": "wave", "oceano": "wave",
    "bosque": "birds", "campo": "birds", "selva": "birds", "jardin": "birds", "parque": "birds", "granja": "birds", "jungla": "birds",
    "montana": "wind_1", "desierto": "wind_1", "nieve": "wind_1", "polo": "wind_1", "espacio": "amb_espacio", "ciudad": "amb_ciudad", "calle": "amb_ciudad",
    "rio": "stream", "lago": "stream", "cueva": "stream", "tormenta": "rain", "hospital": "amb_hospital", "avion": "amb_cabina",
}
# Campo "ambiente" de cada plano (lo elige el guionista según lo que pasa). Varios a la vez con "+": "playa+viento".
AMBIENTE = {
    "playa": "wave", "mar": "wave", "olas": "wave", "oceano": "wave", "balsa": "wave", "barco": "wave",
    "bosque": "birds", "pajaros": "birds", "campo": "birds", "parque": "birds", "jardin": "birds", "selva": "birds",
    "noche": "crickets", "grillos": "crickets", "viento": "wind_1", "montana": "wind_1", "nieve": "wind_1", "desierto": "wind_1", "frio": "wind_1",
    "rio": "stream", "agua_corriendo": "stream", "lluvia": "rain", "tormenta": "rain", "fuego": "fire_crackle", "hoguera": "fire_crackle",
    "hospital": "amb_hospital", "monitor": "amb_hospital", "avion": "amb_cabina", "cabina": "amb_cabina", "espacio": "amb_espacio",
    "bajo_el_agua": "amb_bajo_agua", "bajo_el_mar": "amb_bajo_agua", "submarino": "amb_bajo_agua", "ciudad": "amb_ciudad", "calle": "amb_ciudad",
    "trafico": "amb_ciudad", "interior": "amb_sala", "casa": "amb_sala", "oficina": "amb_sala", "sala": "amb_sala", "clase": "amb_sala",
    "laboratorio": "amb_sala", "reloj": "amb_reloj", "cuenta_atras": "amb_reloj",
}
# Sin "ambiente": se adivina por lo que dice el plano (inglés o español). La primera que encaja gana.
AMB_TEXTO: list[tuple[str, str]] = [
    (r"hospital|surgery|surgeon|nurse|patient|\bicu\b|heart monitor|coma\b|quirofano|enfermer|paciente", "amb_hospital"),
    (r"underwater|deep sea|seabed|ocean floor|submarine|bajo el agua|fondo del mar|submarino", "amb_bajo_agua"),
    (r"\bspace\b|orbit|astronaut|the sun\b|planet|galaxy|espacio|orbita|astronaut|planeta", "amb_espacio"),
    (r"storm|rain|lluvia|llueve|tormenta", "rain"),
    (r"campfire|bonfire|fire\b|flames|hoguera|fuego|llamas", "fire_crackle"),
    (r"\braft\b|ocean|\bsea\b|beach|waves|shipwreck|balsa|oceano|\bmar\b|playa|olas", "wave"),
    (r"airplane|\bplane\b|flight|cabin|pilot|avion|vuelo|cabina|piloto", "amb_cabina"),
    (r"forest|jungle|birds?\b|park\b|garden|meadow|bosque|selva|pajaro|parque|jardin", "birds"),
    (r"snow|blizzard|mountain|desert|freez|nieve|montana|desierto|congel", "wind_1"),
    (r"river|stream|waterfall|\brio\b|cascada", "stream"),
    (r"\bcity\b|street|traffic|downtown|ciudad|calle|trafico", "amb_ciudad"),
    (r"\bnight\b|midnight|\bnoche\b|medianoche", "crickets"),
]


def _ambientes(b: dict, p: dict, sc: str) -> list[str]:
    """Qué suena de fondo en este plano: el "ambiente" que eligió el guion, o el que se deduce del lugar o del texto."""
    raw = b.get("ambiente")
    if raw is None:
        raw = (b.get("params") or {}).get("ambiente")
    if raw is not None:
        if isinstance(raw, list):
            raw = "+".join(map(str, raw))
        keys = [_norm(k).strip().replace(" ", "_") for k in str(raw).split("+")]
        if any(k in ("ninguno", "none", "silencio", "") for k in keys):
            return []
        return list(dict.fromkeys(AMBIENTE.get(k, k if k in BEDS else "") for k in keys if AMBIENTE.get(k, k if k in BEDS else "")))
    lugar = _norm(str(p.get("lugar") or ""))
    hora = str(p.get("hora") or "")
    txt = _norm(b.get("text", ""))
    name = LUGAR_BED.get(lugar)
    if sc in ("ocean",) or (sc == "accion" and str(p.get("tipo")) in ("tormenta_mar", "hundirse")):
        name = "wave"
    if re.search(r"lluvia|llueve|tormenta|\brain|storm", txt):
        name = "rain"
    if not name:
        name = next((n for pat, n in AMB_TEXTO if re.search(pat, txt)), None)
    if name == "birds" and hora == "noche":
        name = "crickets"
    return [name] if name else []


# Palabras del guion -> sonido (raíces sin tildes; la primera que encaja gana)
KEYWORDS: list[tuple[str, str]] = [
    (r"iceberg|colision|impacto|se estrell", "hit_hard"),
    (r"explot|explosi|bomba|estall|dinamita|detona", "explosion"),
    (r"trueno|rayo|relampag|tormenta electrica", "thunder"),
    (r"tsunami|olas?\b|oleaje|maremoto", "wave"),
    (r"flecha|lanza\b|lanzas|arquer|dardo", "arrow"),
    (r"dispar|balas?\b|tiro\b|canon|canones", "hit_hard"),
    (r"terremoto|tiembl|temblor|derrumb|avalancha|volcan|lava", "rumble"),
    (r"incendi|fuego|llamas?\b|hoguera|arde\b|ardia|quema|chispa", "fire"),
    (r"lluvia|llueve|llovi|diluvio", "rain"),
    (r"viento|huracan|tornado|vendaval|ventisca", "wind"),
    (r"hielo|helad|congel|nieve|glacial|escarcha", "sparkle"),
    (r"corazon|latido|late\b|pulso", "heartbeat"),
    (r"choc|chocar|embist|choque|golpe|golpea|punet|patada", "punch"),
    (r"cristal|vidrio|romp|rotur|se parte|hizo anicos", "glass"),
    (r"hierro|metal|acero|espada|armadura|cadena|clavo", "metal"),
    (r"cae\b|cayo|caida|caer\b|tropez|desplom", "fall"),
    (r"hund|se ahog|sumerg|naufrag", "splash"),
    (r"agua\b|chapuz|salpic|nadar|nado|rio\b|lago|charco", "splash"),
    (r"burbuj|hierve|hervir|ebulli", "bubbles"),
    (r"sangre|aplast|estruj", "splat"),
    (r"dinero|euros?\b|dolar|millonari|monedas?\b|precio|pago|pagar|cobr|fortuna|oro\b|tesoro|rico\b|ricos\b", "money"),
    (r"reloj|minutos?\b|segundos?\b|cuenta atras|tictac", "tick"),
    (r"alarma|sirena|alerta|peligro", "alarm"),
    (r"puerta|porton", "door"),
    (r"llama a la puerta|toc toc|golpes en la puerta", "knock"),
    (r"pasos|camina|caminar|camino\b|andar|anduvo", "steps"),
    (r"corre\b|corrio|correr|huye|huyo|escap|persig", "run"),
    (r"telefono|movil|llamada|whatsapp", "phone"),
    (r"mensaje|carta\b|cartas|correo", "message"),
    (r"coche|carretera|trafico|bocina|camion", "car"),
    (r"come\b|comer|comio|mord|mastic|bocado", "eat"),
    (r"bebe\b|beber|bebio|trago|refresco|cerveza|botella", "drink"),
    (r"cuchill|hacha|cortar|corta\b|corto\b|tijera", "chop"),
    (r"beso|besa\b", "kiss"),
    (r"grit|chill|terror|miedo|susto|asust|fantasma|maldic", "scare"),
    (r"rie\b|risa|carcaj|broma|gracioso|salta\b|salto\b|rebota", "boing"),
    (r"llora|lagrim|triste", "crowd_aww"),
    (r"foto|camara|fotograf", "camera"),
    (r"papel|libro|pagina|documento|periodico|diario|mapa|contrato", "paper"),
    (r"firma|escrib|apunt|anot", "write"),
    (r"campana|timbre", "bell"),
    (r"gana\b|gano|victoria|premio|record|celebr|fiesta|exito", "win"),
    (r"gente|multitud|publico|todo el mundo|nadie lo cre", "crowd_ooh"),
    (r"misterio|secreto|nadie sabe|extran|inexplic|desaparec|enigma|oculto", "mystery"),
    (r"pajaro|aves?\b|gaviota|loro", "birds"),
    (r"barco|bote\b|nave\b|navio|crucero|velero|balsa|canoa", "creak"),
    (r"avion|vuela|volar|cohete|despeg|helicoptero|dron", "whoosh_big"),
    (r"virus|bacteria|enferm|germen|contagi|infecc|plaga|resfriado", "wobble"),
    (r"helice|motor|turbina|gira\b|girando|remolino", "whoosh_big"),
    (r"bebe\b|bebes|nino|nina|abuel", "crowd_aww"),
    (r"maquina|robot|ordenador|electric|cable|radiacion|nuclear", "laser"),
    (r"idea|descubr|invent|se dio cuenta|resulta que", "ding"),
    (r"magia|brilla|brillo|estrella|luz\b|diamante|joya", "sparkle"),
    (r"mentira|error|fallo|falso|fracas", "fail"),
    (r"crece|aumenta|sube\b|subio|gigante|enorme", "rise"),
    (r"baja\b|bajo\b el|disminu|encoge|diminut", "fall"),
    (r"fuegos artificiales|petardo|polvora", "fireworks"),
    (r"silbato|arbitro", "whistle"),
    (r"llaves?\b|cerradura", "keys"),
    (r"ropa|tela|vestido|abrigo|cremallera", "cloth"),
    ]
# Inglés (The Curio Lab)
KEYWORDS += [
    (r"iceberg|collision|crash(es|ed)?\b|slams? into", "hit_hard"),
    (r"explo|bomb|blast|dynamite|deton", "explosion"),
    (r"thunder|lightning", "thunder"),
    (r"tsunami|waves?\b|tidal", "wave"),
    (r"arrows?\b|spears?\b|archer|darts?\b", "arrow"),
    (r"gunshot|shoot|shot\b|bullet|cannon|gun\b", "hit_hard"),
    (r"earthquake|shak(e|es|ing)\b|collaps|avalanche|volcan|lava", "rumble"),
    (r"fire\b|flames?\b|burn|blaze|spark", "fire"),
    (r"rain(s|ing)?\b|downpour|flood", "rain"),
    (r"wind\b|hurricane|tornado|storm", "wind"),
    (r"\bice\b|frozen|freez|snow|frost", "sparkle"),
    (r"heart\b|heartbeat|pulse", "heartbeat"),
    (r"punch|hits?\b|kick|smash", "punch"),
    (r"glass|shatter|break(s)?\b|broke", "glass"),
    (r"iron|metal|steel|sword|armor|chains?\b|nails?\b", "metal"),
    (r"falls?\b|fell\b|falling|trip(s|ped)?\b|plunge", "fall"),
    (r"sink|drown|underwater|shipwreck", "splash"),
    (r"water\b|splash|swim|river|lake|pool\b", "splash"),
    (r"bubbl|boil", "bubbles"),
    (r"blood|squash|crush", "splat"),
    (r"money|dollars?\b|cash|million(aire)?s?\b|coins?\b|price|pay(s|ing)?\b|fortune|gold\b|treasure|rich\b", "money"),
    (r"clock|minutes?\b|seconds?\b|countdown|ticking", "tick"),
    (r"alarm|siren|alert|danger", "alarm"),
    (r"door|gate\b", "door"),
    (r"knock", "knock"),
    (r"footsteps|walk(s|ing)?\b|steps\b", "steps"),
    (r"runs?\b|running|ran\b|flee|escape|chase", "run"),
    (r"phone|call(s|ed)?\b|ringing", "phone"),
    (r"message|letter|text(s|ed)?\b|email", "message"),
    (r"\bcar\b|cars\b|traffic|honk|truck|highway", "car"),
    (r"\beat|bite|chew|crunch|fries\b", "eat"),
    (r"drink|sip\b|soda|bottle", "drink"),
    (r"knife|\baxe|cut(s|ting)?\b|scissors", "chop"),
    (r"kiss", "kiss"),
    (r"scream|terrif|fear|scar(y|ed)|ghost|haunt|curse", "scare"),
    (r"laugh|joke|funny|jump(s|ed)?\b|bounce", "boing"),
    (r"\bcr(y|ies|ied)\b|tears|\bsad\b|baby\b|grandm|grandp", "crowd_aww"),
    (r"photo|camera|picture", "camera"),
    (r"paper|book|page|document|newspaper|map\b|contract|files?\b", "paper"),
    (r"sign(s|ed)?\b|writ(e|es|ing)|notes?\b", "write"),
    (r"\bbell\b|doorbell", "bell"),
    (r"\bwin(s|ner)?\b|won\b|victory|prize|record\b|celebrat|party", "win"),
    (r"crowd|everyone|people stare|heads turn", "crowd_ooh"),
    (r"myster|secret|nobody knows|strange|weird|unexplained|vanish|disappear|hidden", "mystery"),
    (r"birds?\b|seagull|parrot", "birds"),
    (r"ship|boat|vessel|canoe|raft", "creak"),
    (r"plane|fly(ing)?\b|flew|rocket|launch|helicopter|drone", "whoosh_big"),
    (r"propeller|engine|turbine|spinning|whirlpool", "whoosh_big"),
    (r"virus|bacteria|disease|germ|infect|plague|\bcold\b|flu\b", "wobble"),
    (r"machine|robot|computer|electric|wires?\b|radiation|nuclear|laser", "laser"),
    (r"\bidea|discover|invent|realize", "ding"),
    (r"magic|glow|shine|stars?\b|light\b|diamond|jewel", "sparkle"),
    (r"\blie\b|mistake|error|wrong|fake|fail", "fail"),
    (r"grow(s|ing)?\b|bigger|rises|giant|huge|massive", "rise"),
    (r"shrink|tiny|smaller|drops?\b", "fall"),
    (r"fireworks|firecracker|gunpowder", "fireworks"),
    (r"whistle|referee", "whistle"),
    (r"keys?\b|lock(ed)?\b", "keys"),
    (r"clothes|dress|jacket|zipper", "cloth"),
]
KW = [(re.compile(r"\b(?:" + rx + ")"), cue) for rx, cue in KEYWORDS]
NUM = re.compile(r"\b(mil|millon|millones|cien|cientos|hundred|thousand|million|billion|\d{2,})\b")
YEAR = re.compile(r"\bmil novecientos|\bdos mil\b|\b1[5-9]\d\d\b|\b20[0-4]\d\b|\b(?:fifteen|sixteen|seventeen|eighteen|nineteen) (?:hundred|oh|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)\b|\btwo thousand\b")

# Acciones animadas: (fracción de la duración del plano, sonido)
ACTION_SFX: dict[str, list[tuple[float, str]]] = {
    "cortarse": [(0.33, "chop"), (0.45, "splat")],
    "caer_romper": [(0.08, "fall"), (0.38, "glass")],
    "explosion": [(0.38, "explosion"), (0.4, "boom")],
    "beber": [(0.1, "drink"), (0.45, "drink")],
    "comer": [(0.15, "eat"), (0.4, "eat"), (0.65, "eat")],
    "idea": [(0.22, "ding"), (0.3, "sparkle")],
    "sorpresa": [(0.18, "eyes"), (0.22, "hit")],
    "crecer": [(0.05, "rise"), (0.85, "pop")],
    "choque": [(0.33, "hit_hard"), (0.36, "glass")],
    "dormir": [(0.1, "pop_soft"), (0.5, "sparkle")],
    "rayo": [(0.05, "rain"), (0.38, "thunder")],
    "vista_nublada": [(0.1, "wobble"), (0.55, "heartbeat")],
    "hincharse": [(0.1, "rise"), (0.42, "boing")],
    "flotar_espacio": [(0.35, "sparkle")],
    "desmayarse": [(0.1, "wobble"), (0.45, "thud")],
    "soltar_aire": [(0.15, "wind"), (0.5, "whoosh")],
    "saliva_hierve": [(0.1, "bubbles"), (0.32, "sizzle")],
    "quemarse": [(0.08, "fire"), (0.4, "sizzle")],
    "latido": [(0.0, "heartbeat"), (0.55, "heartbeat")],
    "congelarse": [(0.08, "wind"), (0.45, "sparkle")],
    "reir": [(0.1, "boing"), (0.45, "boing")],
    "llorar": [(0.2, "crowd_aww"), (0.45, "drop")],
    "cosquillas": [(0.0, "zip"), (0.2, "boing"), (0.55, "boing")],
    "tormenta_mar": [(0.0, "rain"), (0.12, "wave"), (0.5, "thunder")],
    "contar_dias": [(0.15, "write"), (0.45, "write"), (0.75, "write")],
    "gritar": [(0.08, "scare"), (0.15, "hit")],
    "correr": [(0.1, "run")],
    "hundirse": [(0.0, "splash"), (0.3, "bubbles")],
    "dudar": [(0.1, "mystery")],
    "marearse": [(0.0, "wobble"), (0.5, "wobble")],
}
ACTION_ALIAS = {"bomba": "explosion", "tormenta": "rayo", "relampago": "rayo", "chocar": "choque", "accidente": "choque", "susto": "sorpresa",
                "pensar": "idea", "descubrir": "idea", "beber_agua": "beber", "tomar": "beber", "morder": "comer", "comida": "comer", "dormirse": "dormir"}

SCENE_SFX = {
    "year_jump": [(0.15, "year"), (0.65, "ding")],
    "map_pin": [(0.35, "pop")],
    "ocean": [(0.0, "wave")],
    "big_text": [(0.3, "pop")],
}
PIECE_ANIM = {"caer": "fall", "crecer": "pop", "flotar": "pop_soft", "latir": "heartbeat"}  # entrar/acercarse/girar: sin «whoosh»
TRANSITION_SFX = {"whip": "whip", "zoom": "zoom_in", "zoomThrough": "zoom_in", "flash": "hit", "red": "hit_hard", "black": "boom", "blurDraw": "whoosh"}
GENERIC = {"whoosh", "whoosh_big", "whip", "zoom_in", "zoom_out", "hit", "pop", "pop_soft", "sparkle", "ding", "type", "count", "year", "tick", "punch", "thud", "boom", "hit_hard", "rise", "fall"}
FILLERS = ["pop_soft", "tick", "sparkle", "pop", "paper"]


def _norm(s: str) -> str:
    s = unicodedata.normalize("NFD", s.lower())
    return "".join(c for c in s if unicodedata.category(c) != "Mn")


_CACHE: dict[str, np.ndarray] = {}


def _load(name: str) -> np.ndarray | None:
    if name in _CACHE:
        return _CACHE[name]
    f = SFX_DIR / f"{name}.ogg"
    if not f.exists():
        _CACHE[name] = None
        return None
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(f), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
    x = x / (np.max(np.abs(x)) + 1e-9)
    _CACHE[name] = x
    return x


def _params(b: dict) -> tuple[str, dict]:
    """Escena y parámetros efectivos (las escenas a medida usan su respaldo para saber qué pasa)."""
    sc, p = b.get("scene", ""), b.get("params") or {}
    if sc == "medida" and isinstance(p.get("respaldo"), dict):
        return p["respaldo"].get("scene", ""), p["respaldo"].get("params") or {}
    return sc, p


class _Mixer:
    def __init__(self, n: int, rng):
        self.out = np.zeros(n)
        self.rng = rng
        self.recent: list[str] = []

    def add(self, cue: str, t: float, gain_db: float = 0.0) -> bool:
        names, db = CUES.get(cue, ([], 0))
        names = [n for n in names if _load(n) is not None]
        if not names:
            return False
        fresh = [n for n in names if n not in self.recent] or names  # variedad: no repetir el mismo archivo seguido
        name = fresh[int(self.rng.integers(len(fresh)))]
        self.recent = (self.recent + [name])[-6:]
        x = _load(name)
        rate = float(self.rng.uniform(0.92, 1.08))  # cada vez un tono un poco distinto
        if abs(rate - 1) > 0.005:
            x = np.interp(np.arange(0, len(x) - 1, rate), np.arange(len(x)), x)
        i0 = max(0, int(t * SR))
        L = min(len(x), len(self.out) - i0)
        if L <= 0:
            return False
        self.out[i0:i0 + L] += x[:L] * 10 ** ((db + gain_db + float(self.rng.uniform(-1.5, 1.5))) / 20)
        return True


def plan_cues(beats: list[dict], words: list[dict], total: float, rng, hook: bool = True) -> list[tuple[float, str, int]]:
    """Lista de (instante, sonido, prioridad). Prioridad: 5 a mano, 4 acción, 3 palabra/escena, 2 transición/pieza, 1 etiqueta, 0 relleno."""
    cues: list[tuple[float, str, int]] = []
    by_beat: dict[int, list[dict]] = {}
    for w in words:
        by_beat.setdefault(w["b"], []).append(w)
    # Sin sonido en los cambios de plano (ni «whoosh» ni «brum»): solo suenan las cosas que pasan.
    for i, b in enumerate(beats):
        s, e = float(b["start"]), float(b["end"])
        d = max(0.5, e - s)
        sc, p = _params(b)
        # 1) a mano
        for c in b.get("sonidos") or []:
            if isinstance(c, dict) and c.get("s") in CUES:
                tt = float(c.get("t", 0))
                cues.append((s + (tt * d if c.get("k") else tt), c["s"], 5))
        # 3) acción animada / tipo de escena
        tipo = _norm(str(p.get("tipo") or "")) if sc == "accion" else ""
        tipo = ACTION_ALIAS.get(tipo, tipo)
        for k, cue in ACTION_SFX.get(tipo, []):
            cues.append((s + k * d, cue, 4))
        for k, cue in SCENE_SFX.get(sc, []):
            cues.append((s + k * d, cue, 3))
        if sc == "big_text" and re.search(r"\d", str(p.get("text", ""))):
            cues.append((s + 0.25, "count", 3))
        if p.get("efecto") == "impacto":
            cues.append((s + 0.3, "hit", 3))
        elif p.get("efecto") == "humo":
            cues.append((s + 0.3, "poof", 2))
        elif p.get("efecto") == "brillo":
            cues.append((s + 0.3, "sparkle", 2))
        # 4) piezas que entran
        for j, it in enumerate((p.get("piezas") or [])[:4]):
            if not isinstance(it, dict):
                continue
            a = str(it.get("anim") or "crecer")
            t0 = s + j * 0.15
            cue = PIECE_ANIM.get(a)
            if cue:
                cues.append((t0 + 0.12, cue, 2))
            if a == "caer":
                cues.append((t0 + 0.42, "thud", 2))
            name = _norm(str(it.get("pieza") or ""))
            for rx, kc in KW:
                if rx.search(name):
                    cues.append((t0 + 0.2, kc, 2))
                    break
        if sc == "escena" and p.get("objeto") not in (None, "", "none"):
            cues.append((s + 0.3, "pop", 1))
        # 5) etiqueta
        if p.get("label"):
            cues.append((s + 0.35, "type" if len(str(p["label"])) > 14 and rng.random() < 0.4 else "pop", 1))
        # 6) palabras dichas en este plano
        ws = by_beat.get(i, [])
        used = 0
        txt_cues = set()
        for k, w in enumerate(ws):
            frag = _norm(" ".join(x["w"] for x in ws[k:k + 3]))
            first = _norm(w["w"])
            hit = None
            for rx, kc in KW:
                m = rx.search(frag)
                if m and m.start() < len(first) + 1:  # la palabra clave empieza en esta palabra
                    hit = kc
                    break
            if hit and hit not in txt_cues and used < 2:
                cues.append((float(w["start"]), hit, 3))
                txt_cues.add(hit)
                used += 1
        frase = _norm(" ".join(w["w"] for w in ws))
        if YEAR.search(frase) and sc != "year_jump" and ws:
            cues.append((float(ws[0]["start"]) + 0.1, "year", 3))
        elif NUM.search(frase) and used < 2 and ws:
            m = NUM.search(frase)
            pos = len(frase[:m.start()].split())
            cues.append((float(ws[min(pos, len(ws) - 1)]["start"]), "count", 2))
    return cues


def _thin(cues: list[tuple[float, str, int]], total: float) -> list[tuple[float, str, int]]:
    """Quita choques: si dos sonidos caen a menos de 0,3 s, se queda el más importante. Máx. 3 cada 1,5 s."""
    keep: list[tuple[float, str, int]] = []
    LAYER = {("explosion", "boom"), ("hit_hard", "glass"), ("rain", "thunder"), ("whoosh_big", "hit"), ("whoosh", "hit"), ("whip", "punch")}
    for c in sorted(cues, key=lambda c: (-c[2], c[0])):
        t, cue, pr = c
        if t < 0 or t > total - 0.1:
            continue
        clash = [k for k in keep if abs(k[0] - t) < 0.3 and (k[1], cue) not in LAYER and (cue, k[1]) not in LAYER]
        if clash:
            continue
        if sum(1 for k in keep if abs(k[0] - t) < 0.75) >= 3:
            continue
        if any(k[1] == cue and abs(k[0] - t) < (0.9 if cue in GENERIC else 7.0) for k in keep):
            if pr < 4:
                continue
        if cue not in GENERIC and pr < 5 and sum(1 for k in keep if k[1] == cue) >= 3:
            continue  # variedad: un mismo sonido especial como mucho 3 veces por vídeo
        keep.append(c)
    return sorted(keep)


def _fill(cues, words, rng, total):
    """Ritmo constante como en los vídeos de referencia: si pasan más de 2 s sin nada, un sonido suave en una palabra."""
    out = list(cues)
    times = sorted([c[0] for c in cues] + [total])
    prev = 0.0
    for t in times:
        if t - prev > 2.2:
            cand = [w for w in words if prev + 0.8 < w["start"] < t - 0.8]
            if cand:
                w = cand[len(cand) // 2]
                out.append((float(w["start"]), FILLERS[int(rng.integers(len(FILLERS)))], 0))
        prev = t
    return sorted(out)


def _bed(beats: list[dict], words: list[dict], n: int, rng) -> np.ndarray:
    bed = np.zeros(n)
    fade = int(0.7 * SR)
    tramos: list[list] = []  # [nombre, inicio, fin]
    abiertos: dict[str, list] = {}
    for i, b in enumerate(beats):
        sc, p = _params(b)
        for name in _ambientes(b, p, sc):
            tr = abiertos.get(name)
            if tr and float(b["start"]) - tr[2] < 0.3:
                tr[2] = float(b["end"])
            else:
                tr = [name, float(b["start"]), float(b["end"])]
                tramos.append(tr)
                abiertos[name] = tr
    for name, ts, te in tramos:
        x = _load(name)
        if x is None or len(x) < SR:
            continue
        i0, i1 = int(ts * SR), min(n, int(te * SR))
        L = i1 - i0
        if L <= 0:
            continue
        seg = np.zeros(L)
        pos = 0
        off = int(rng.integers(0, max(1, len(x) - SR)))
        while pos < L:  # bucle con fundidos cruzados
            chunk = x[off:]
            m = min(len(chunk), L - pos)
            c = chunk[:m].copy()
            f = min(int(0.3 * SR), m // 2)
            c[:f] *= np.linspace(0, 1, f)
            c[m - f:] *= np.linspace(1, 0, f)
            seg[pos:pos + m] += c
            pos += max(m - f, 1)
            off = 0
        f = min(fade, L // 2)
        seg[:f] *= np.linspace(0, 1, f)
        seg[L - f:] *= np.linspace(1, 0, f)
        bed[i0:i1] += seg * 10 ** (BEDS.get(name, -24) / 20)
    return bed


def _write(path: Path, x: np.ndarray) -> None:
    pcm = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def make_sfx(beats: list[dict], words: list[dict], total: float, sfx_out: Path, bed_out: Path, seed: int = 1,
             volume_db: float = 0.0, comment: dict | None = None, log: Path | None = None) -> list[tuple[float, str, int]]:
    rng = np.random.default_rng(seed)
    n = int(total * SR) + 1
    cues = plan_cues(beats, words, total, rng)
    if comment:
        cues.append((float(comment["start"]), "message", 3))
    cues = _fill(_thin(cues, total), words, rng, total)
    mix = _Mixer(n, rng)
    for t, cue, _ in cues:
        mix.add(cue, t, volume_db)
    _write(sfx_out, mix.out)
    _write(bed_out, _bed(beats, words, n, rng) * 10 ** (volume_db / 20))
    if log:
        log.write_text(json.dumps([{"t": round(t, 2), "s": c} for t, c, _ in cues], ensure_ascii=False), encoding="utf-8")
    return cues


if __name__ == "__main__":  # prueba: python pipeline/sonido.py timeline.json salida_dir
    import sys

    tl = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    od = Path(sys.argv[2])
    od.mkdir(parents=True, exist_ok=True)
    cs = make_sfx(tl["beats"], tl["words"], tl["total"], od / "sfx.wav", od / "bed.wav", seed=7, comment=tl.get("comment"))
    print(len(cs), "sonidos en", round(tl["total"], 1), "s")
    for t, c, p in cs:
        print(f"{t:6.2f} {c}")
