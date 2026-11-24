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
