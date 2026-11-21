# Piezas nuevas del lunes (instrucciones para la sesión automática de Claude)

Cada lunes a las 4:01 (España) el workflow **Generar vídeos de la semana** guarda el plan en
`data/planes/<rid>.json` con `estado: "pendiente"` y la lista `piezas_nuevas` (cosas que los vídeos necesitan
mostrar y que aún no existen en la biblioteca). Tu trabajo: dibujar esas piezas, comprobarlas y lanzar el montaje.

## Pasos

1. `git pull`. Busca el plan más reciente con `estado` `"pendiente"` en `data/planes/`.
   - Si no hay ninguno: puede que el plan aún se esté generando (el análisis tarda). Espera y vuelve a mirar cada
     5 minutos, como mucho 90 minutos. Si sigue sin haber plan, haz solo las piezas pendientes (abajo) y termina.
   - Si `piezas_nuevas` está vacío: el montaje ya se lanzó solo. No lances nada, pero sigue con las piezas
     pendientes (abajo) si las hay.
   - **Piezas pendientes:** mira también `data/piezas_pendientes/*.json` (cada archivo es una lista de nombres que
     algún vídeo pidió y no existían; en el vídeo se usó la más parecida). Dibújalas igual (pasos 2-4) y **borra**
     esos archivos en el mismo commit. Si un nombre es una descripción o algo que ya existe con otro nombre, basta
     con añadir un alias.
2. Para cada pieza de `piezas_nuevas` (y de las pendientes) que no exista ya (`node renderer/tools/piezas.mjs lista`, mira también los
   alias en `renderer/lib/props.mjs`):
   - Añádela a `PROPS` en `renderer/lib/props.mjs`, con el mismo estilo que las demás: contorno `INK` grueso
     (helpers `O`, `E`, `C`, `R`, `P`, `L`, `EYE`, `MOUTH`), colores vivos, base en (0, 0) y ~400 px de alto,
     animación suave con `t` si tiene sentido. Nombre en minúsculas, sin tildes, con `_` (p. ej. `pulpo`, `faro`).
   - Añade alias útiles en `ALIAS` (con tilde, sinónimos).
   - Si es muy difícil, haz una versión sencilla pero reconocible. Nunca copies personajes o marcas de terceros.
3. Comprueba:
   - `node renderer/tools/piezas.mjs hoja /tmp/nuevas.png <nombres…>` y **mira la imagen**: que se reconozca y
     encaje con el estilo. Corrige lo que no quede bien.
   - `node renderer/tools/piezas.mjs prueba` tiene que terminar con `fallos: 0`.
4. `python pipeline/catalogo_piezas.py` (añade las piezas al catálogo que lee el guionista).
4b. **Acciones para los momentos clave:** lee las ideas del plan (`gancho`, `premisa`, `giro_final`). Para cada momento
   fuerte que no se pueda mostrar con una acción existente (`renderer/scenes/actions2.mjs` y `actions.mjs`), crea una
   acción nueva en `MORE_ACTIONS` de `actions2.mjs` (animación con principio, desarrollo y final; mira las existentes),
   añade alias en `MORE_ALIAS` y añade su nombre y una descripción corta al `tipo`/`desc` de `accion` en
   `renderer/scenes/catalog.json`. Comprueba con una hoja de fotogramas que se entiende. Ver docs/ESCENAS_A_MEDIDA.md.
5. Si había plan pendiente, pon `"estado": "escenas_listas"` en el plan. Haz commit y push a `main`
   (mensaje: `Piezas nuevas de la semana <rid>: …`). Reintenta el push con `git pull --rebase` si lo rechaza.
6. Si había plan pendiente con piezas_nuevas, lanza el montaje: `gh api -X POST repos/martiroldanmunoz0-cpu/Youtube-auto/actions/workflows/semanal_montar.yml/dispatches -f ref=main -f 'inputs[rid]=<rid>'`.
7. Si algo falla y no lo puedes arreglar en poco tiempo, no bloquees: lanza el montaje igualmente (paso 6) con
   las piezas que estén bien. El workflow **Respaldo del montaje semanal** lo lanza solo a media mañana si nadie lo hizo.

## Pedidos personalizados

**Regla del dueño: pide permiso una sola vez, antes de lanzar un pedido, explicando cómo será el vídeo. Con su sí, guion, escenas y montaje van seguidos sin volver a preguntar.**

Cuando el dueño del canal te diga en el chat qué vídeo va a pedir, comprueba qué piezas o escenas faltan, créalas
con este mismo procedimiento (pasos 2-4) y súbelas antes de que lance el pedido.
