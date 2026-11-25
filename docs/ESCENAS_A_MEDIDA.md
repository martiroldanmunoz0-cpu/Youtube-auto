# Escenas a medida (las dibuja Claude a partir del guion)

El dueño del canal quiere que cada frase **se vea pasar** con detalle (si la voz dice "la vista se nubla", se ven
los ojos parpadeando y todo desenfocándose; si dice "el cuerpo se hincha", el personaje se infla y rueda por el
espacio). Para los **pedidos especiales** no se eligen escenas de la biblioteca: Claude dibuja una animación propia
para cada plano.

## Flujo de un pedido a medida

**Regla del dueño: pide permiso UNA sola vez, ANTES de lanzar el pedido, explicando cómo será el vídeo (tema, enfoque, momentos clave). Con su sí, haz todo seguido: guion, escenas a medida y montaje automático (paso 6) sin volver a preguntar.**

1. Lanzar el pedido con `a_medida: true` (solo escribe el guion; NO monta):
   `gh api -X POST repos/martiroldanmunoz0-cpu/Youtube-auto/actions/workflows/pedido.yml/dispatches -f ref=main -f 'inputs[pedido]=…' -f 'inputs[cantidad]=1' -f 'inputs[a_medida]=true'`
2. Cuando termina (~5 min), `git pull` y `python pipeline/medida.py pendientes` → ids que esperan.
3. Para cada id, leer `data/guiones/<id>.json` (lista `beats`: texto, escena elegida y params) y crear
   `renderer/scenes/medida/<id>.mjs`:
   ```js
   // Escenas a medida de <id>: <título>
   export default {
     0: (ctx, a, K) => { /* plano 1 */ },
     4: (ctx, a, K) => { /* plano 5 */ },
   };
   ```
   - `a.t` = segundos desde que empieza el plano; `a.d` = duración del plano; `a.who` = la persona del vídeo
     (misma cara en todo el vídeo; `params.who` para otra persona); `a.params` = params del plano.
   - `K` = caja de herramientas (ver `renderer/scenes/medida.mjs`): `drawPlace(ctx, lugar, hora, t)`,
     `midShot`, `drawFullBody`, `face(ctx, who, x, y, escala, {mood, t, closed})`, `prop(ctx, 'pieza', x, y, escala, t)`,
     formas `O E C R P L`, `text(ctx, 'TEXTO', x, y, {size, color, k})`, efectos `speedLines sparkles smoke flash
     shakeAt starBurst`, `ph(t, d, a, b)` (progreso de una fase), `ease`, `clamp`, `radial`, `grade`, `INK`, `W`, `H`.
   - Lienzo 1080×1920. Estilo del canal: luminoso, contorno `INK` grueso, colores vivos, mucho detalle.
   - **Cada plano tiene que tener movimiento todo el rato** (principio → desarrollo → final dentro de `a.d`) y mostrar
     LITERALMENTE lo que dice la frase. Mejor 15 líneas de animación cuidada que una escena quieta.
   - Se puede reutilizar lo que ya existe (lugares, persona, piezas, acciones) combinándolo de forma nueva.
   - No copiar personajes ni marcas de terceros.
4. En `data/guiones/<id>.json`, cada plano dibujado pasa a:
   `"scene": "medida", "params": {"archivo": "<id>", "plano": <índice>, "respaldo": {"scene": <escena anterior>, "params": <params anteriores>}, "label": <si tenía>}`
   y en la raíz `"medida_estado": "lista"`.
5. Comprobar: `python pipeline/borrador.py data/guiones/<id>.json /tmp/<id>.mp4` y mirar fotogramas
   (`ffmpeg -i /tmp/<id>.mp4 -vf "fps=1/2,scale=180:-1,tile=8x4" -frames:v 1 /tmp/<id>.png`). Nada vacío ni quieto.
6. Commit y push a `main` (escenas + guion). Lanzar el montaje (voz + vídeo + Revisar, sin gastar API):
   `gh api -X POST repos/martiroldanmunoz0-cpu/Youtube-auto/actions/workflows/rehacer.yml/dispatches -f ref=main -f 'inputs[id]=<id>' -f 'inputs[tanda]=<tanda del guion>'`
7. Cerrar el issue "🎨 Escenas a medida" de ese vídeo con un comentario.

Las escenas a medida quedan guardadas para siempre. Si una animación sirve para más vídeos, pásala además a
`renderer/scenes/actions2.mjs` como acción nueva (y añádela al catálogo), así la biblioteca crece.

## Tanda del lunes

La tanda semanal sigue siendo automática (no espera a Claude). La sesión del lunes (docs/PIEZAS_LUNES.md), además
de las piezas, crea **acciones nuevas** en `actions2.mjs` para los momentos clave de las ideas del plan (gancho y
giro final) cuando no exista ya una acción que lo muestre, y las añade al catálogo para que el guionista las use.

## Vídeos largos (horizontal, 8-10 min)

- Se lanzan con `largo.yml` (pestaña «Crear vídeos largos» del panel). Con `a_medida` (por defecto) solo escribe el
  guion y lo deja en `data/guiones/largo-N-01.json` (planos con `capitulo` en el primero de cada capítulo).
- **Regla del dueño (23-11-2026): en los vídeos largos se dibujan TODOS los planos (70-100), cada uno con una escena
  única.** Nunca dos planos con la misma escena ni el mismo dibujo con otro texto: cada plano muestra literalmente su
  frase, con su propio fondo, personajes, objetos y movimiento. Se pueden compartir funciones de ayuda (lugares,
  personajes), pero la composición y la animación de cada plano son distintas.
- **Portada OBLIGATORIA (regla del dueño, 25-11-2026):** cada vídeo largo lleva `export function portada(ctx, K)`
  en su archivo a medida (1920×1080, se reduce a 1280×720), dibujada con NUESTROS personajes del reparto, como
  largo-27-01 y largo-29-01: un único foco (el protagonista grande con contorno brillante), 2-3 palabras ENORMES en
  Anton (blanco + amarillo, borde negro grueso) a la izquierda, una etiqueta roja y fondo de mucho contraste. Nada de
  miniaturas con IA (`miniaturas_ia.activo: false`). El montaje la usa sola; probarla antes con
  `node renderer/tools/portada_medida.mjs <id> /tmp/p.jpg`. Para cambiarla en un vídeo ya montado: `portada.yml`.
- La tanda semanal (lunes 04:01) escribe `generacion.largos_por_semana` guiones largos con `a_medida`. La sesión del
  lunes (tarea programada) los dibuja enteros y lanza el montaje de cada uno. Respaldo: el martes 08:41 UTC se monta
  lo que siga sin montar.
- **Estilo «cine» (por defecto desde el 24-11-2026, pedido del dueño):** cada plano se dibuja DIRECTAMENTE en
  horizontal con `export const ancho = { n: ... }` usando `renderer/lib/cine.mjs` (ver largo-18/19/20 de ejemplo).
  Lo que se aprendió mirando vídeos de animación muy detallados (solo el lenguaje visual, nunca sus dibujos ni guiones):
  - El personaje está DENTRO del lugar y a escala (puertas, muebles, gente al fondo), con la cámara a su altura.
  - Variar el tipo de plano: `plano.general` (lugar nítido y personajes), `plano.primer` (busto grande con el fondo
    desenfocado), `plano.hombro` (alguien de espaldas borroso delante), `plano.detalle` (un objeto o un móvil llenando
    la pantalla), `plano.dato` (cifra o lista elegante sobre el lugar desenfocado). Más o menos: 45 % generales,
    25 % primeros/hombro, 15 % detalles, 15 % datos. Nunca dos planos seguidos iguales.
  - Luz con intención: `look` atardecer, interior, dia, noche, tension, frio, espacio (tiñe, apaga colores, viñeta).
  - Rótulos pequeños y elegantes dentro del plano: `etiqueta` (letras espaciadas), `pastilla` (cifra con borde
    dorado), `cifra`, `bocadillo` (diálogo). Nada de pantallas de texto aparte.
  - Decorados listos en `SET` (lib/sets.mjs + lib/sets_mundo.mjs): calle, avenida, plaza, pasillo, aula, oficina,
    despacho, cafeteria, salon, dormitorio, bano, atico, cocina, metro, anden, noticias, parque, playa, autopista,
    control, bloques, suburbio, puente, bosque, oceano, arrecife, cielo, espacio, montes, granja, monticulos, sabana,
    rocas, marisma, nieve, marte, observatorio. `{ maleza: 0..1 }` llena cualquiera de plantas y grietas. Si hace falta
    un sitio nuevo, se añade allí (reutilizable) en vez de dibujarlo dentro del plano.
  - Prueba rápida antes de montar: renderiza un fotograma de cada plano y míralos en una hoja (todos sin errores).
- Si un plano no tiene versión `ancho`, el motor usa la vertical (1080×1920) en la franja central (y ≈ 430-1610).
- Montaje (voz repartida en 8 máquinas + vídeo + Revisar, sin gastar API):
  `gh api -X POST repos/martiroldanmunoz0-cpu/Youtube-auto/actions/workflows/largo.yml/dispatches -f ref=main -f 'inputs[id]=<id>'`

## Sonidos de cada plano

Los efectos de sonido salen solos (pipeline/sonido.py): transición, cámara, acción, piezas y palabras del guion.
Si en una escena a medida pasa algo que debe sonar en un instante concreto, añade al plano del guion:

    "sonidos": [{"s": "thunder", "t": 0.6}, {"s": "splash", "t": 0.5, "k": true}]

`t` en segundos desde el inicio del plano (o fracción de su duración si `"k": true`). Nombres válidos: las claves de CUES en sonido.py
(whoosh, whip, hit, hit_hard, boom, explosion, thud, pop, ding, sparkle, money, tick, heartbeat, thunder, rain, wind, wave, splash,
bubbles, fire, glass, door, steps, run, fall, rise, mystery, rumble, boing, arrow, metal, paper, camera, scare, laser...).

## Personajes «gorditos» y escenas con mucha gente (regla del dueño, 24-11-2026)

Idea de estilo tomada de canales grandes de animación explicativa (sin copiar sus diseños): personajes MUY básicos
—cuerpo redondo y grande, brazos y piernas de palo, cabeza redonda, calvos / con pelo / con sombrero— y **escenas con
varios personajes que interactúan** (no solo 1-2): charlan, se dan la mano, se señalan, se persiguen, reacciona el público.

- Módulo: `renderer/lib/gente.mjs`, disponible en `K`:
  - `K.reparto(semilla, n, fijos)` → n personajes distintos (usa la misma semilla en todo el vídeo para que sean los mismos).
  - `K.tipo(semilla, {pelo, sombrero, ropa, bigote, corbata, ancho...})` → un personaje suelto (extras, público).
  - `K.monigote(ctx, a, p, x, sueloY, esc, {pose, mira: -1|0|1, mood, habla, objeto})` → devuelve `{cabeza, hr, manoD, manoI, top}`.
    Poses: quieto saluda habla senala vitorea encoge miedo piensa brazos sostiene levanta empuja aplaude llora sentado salta
    manos anda corre (o un array de 9 ángulos; `K.apreton(a, fase)` = dar la mano).
    Moods: neutral feliz risa triste enfadado sorpresa miedo duda dormido.
  - `K.anda(a, x0, x1, f0, f1, corre)` → mover a alguien de un sitio a otro dentro del plano.
  - `K.globo(ctx, a, 'TEXT', x, y, {tx, ty, grito, p0})`, `K.simbolo(ctx, a, cabeza, hr, '!'|'?'|'♥')`, `K.mareo(...)`.
  - `K.multitud(ctx, a, {n, x0, x1, gy, esc, filas, reaccion, seed, mood})` → público / calle / cola de gente.
- **En los vídeos nuevos, usar este reparto por defecto**: 3-6 personajes con nombre que se repiten en todo el vídeo +
  extras/multitud de fondo, y en la mayoría de planos alguna interacción entre ellos. Textos en inglés (canal en EE. UU.).
- Los personajes antiguos (`drawFullBody`, `persona.mjs`) NO se borran: siguen sirviendo para los vídeos ya hechos y
  para quien se quiera.
- Muestra de cómo se ven: la genera `node` con `K.reparto` + `K.multitud` (ver commit).

### Estilo «limpio» y escenarios llenos de gente (24-11-2026)
- `K.tipo(seed, { estilo: 'limpio' })`: cabeza grande casi tan ancha como el cuerpo, cuerpo cápsula/judía, brazos y piernas finos sin manos, cara mínima. `estilo: 'gordito'` es el de antes. `K.reparto` mezcla los dos.
- `K.publico(ctx, a, { x0, x1, y0, y1, filas, tam, reaccion: 'quieto'|'vitorea'|'mezcla', seed })`: gradas llenas de cabezas y hombros (auditorio, subasta, estadio, junta de accionistas). Poner a los protagonistas delante.
- `K.cartel(ctx, a, 'NEVER', x, y, { tipo: 'madera'|'verde'|'rojo'|'papel'|'amarillo', colgado, rot, p0 })`, `K.etiqueta(ctx, a, '$33', x, y, { cx, cy })` (etiqueta de precio con cordel atado a una mano o un objeto).
- `K.paneles(ctx, a, [fn1, fn2, fn3])`: pantalla partida en viñetas que entran una tras otra (comparar, «mientras tanto…»).
- `K.caraObjeto(ctx, a, x, y, r, { mood })`: los objetos también hablan y reaccionan (un chip, una moneda, un edificio).
- `K.mesa(ctx, x, gy, w)`: mesa de frente; dibujar después de los personajes `pose: 'sentado'`.
- Regla: los fondos tienen sitio reconocible (casa con valla, ciudad al atardecer, sala de servidores, restaurante) y casi siempre hay carteles, precios o cifras escritos dentro de la escena, en inglés.

### Escenas de cine con varios personajes: `escenario.mjs` (24-11-2026)
Ideas de estilo (no copia): luz de cine, primeros planos por encima del hombro, sitios reconocibles y rótulos en pantalla. Todo acepta `{ W, H }` (vertical u horizontal).
- **Decorados:** `K.pasillo` (taquillas en perspectiva), `K.calle` (casas con valla y farola; `hora: 'dia'|'atardecer'|'noche'`, `coche: true`), `K.ciudad` (rascacielos con ventanas), `K.interior(ctx, a, { tipo: 'aula'|'dormitorio'|'restaurante'|'oficina'|'servidores', texto })`, `K.puerta` (pared oscura y una puerta iluminada; devuelve `{x, y, w, h, gy}` para poner a alguien dentro).
- **Luz:** `K.luz(ctx, a, { tono: 'noche'|'atardecer'|'interior'|'dia'|'tension', foco: [x, y] })`. Va DESPUÉS de los personajes y ANTES de los rótulos. Casi todos los planos llevan una.
- **Cámara:** `K.camara(ctx, a, () => {...escena...}, { de: 1, a: 1.15, foco: [x, y], temblor })` para acercarse despacio a quien habla.
- **Encuadre:** `K.hombro(ctx, a, p, { lado: -1|1 })` pone a un personaje enorme, de espaldas y desenfocado en primer plano, y se dibuja al final. `K.desenfocado(ctx, px, fn)`. Los personajes aceptan `espalda: true`.
- **Rótulos:** `K.contador(ctx, a, '3:00', x, y, { icono: 'reloj'|'loop'|'rec'|'dinero' })`, `K.rotulo(ctx, a, 'YOU', x, y)` y `K.fila(ctx, a, personas, { nombres: ['YOU', 'MAYA', ...] })`. `fila` presenta a los personajes uno a uno con su nombre.
- **Regla por plano:** usar un decorado reconocible, 2–5 personajes que reaccionan entre sí, una luz y, cuando cuadre, un contador, rótulo o cartel. Alternar planos generales, por encima del hombro, de la puerta y en pantalla partida, y no repetir dos veces seguidas el mismo tipo de plano.

## Shorts recortados y retención (25-11-2026)
- **Recortes**: al terminar un largo, `recortes.yml` corta 3 Shorts (`generacion.shorts_por_largo`) de sus mejores tramos
  (`pipeline/recortes.py`, modelo barato). Van a «Revisar» como cualquier Short. Tiempos de planos: `data/tiempos/<id>.json`.
- **Retención**: `retencion.yml` (lunes) lee de YouTube Analytics en qué frase se va la gente de cada vídeo publicado,
  lo guarda en `data/retencion/` y resume lecciones en `lecciones.json`, que `scripts.py` mete en cada guion nuevo.
