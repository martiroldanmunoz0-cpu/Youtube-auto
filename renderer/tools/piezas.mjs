// Herramienta de la biblioteca de piezas.
//   node renderer/tools/piezas.mjs lista                 -> nombres (JSON)
//   node renderer/tools/piezas.mjs hoja salida.png [n…]  -> hoja con las piezas (todas o las indicadas)
//   node renderer/tools/piezas.mjs prueba                -> dibuja todas las piezas en composiciones; sale con error si alguna falla
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..');
for (const f of fs.readdirSync(path.join(root, 'assets', 'fonts')).filter((f) => f.endsWith('.ttf'))) GlobalFonts.registerFromPath(path.join(root, 'assets', 'fonts', f), 'Poppins');
const { PROPS, PROP_NAMES } = await import('../lib/props.mjs');
const { SCENES } = await import('../scenes/index.mjs');
const { rng } = await import('../lib/util.mjs');
const [cmd, out, ...names] = process.argv.slice(2);
if (cmd === 'lista') { console.log(JSON.stringify(PROP_NAMES)); process.exit(0); }
if (cmd === 'hoja') {
  const list = names.length ? names : PROP_NAMES;
  const cell = 260, cols = Math.min(6, list.length), rows = Math.ceil(list.length / cols);
  const c = createCanvas(cols * cell, rows * cell), ctx = c.getContext('2d');
  ctx.fillStyle = '#fff4dc'; ctx.fillRect(0, 0, c.width, c.height);
  list.forEach((n, i) => {
    const x = (i % cols) * cell + cell / 2, y = Math.floor(i / cols) * cell + cell - 36;
    ctx.save(); ctx.translate(x, y); ctx.scale(0.36, 0.36); try { PROPS[n](ctx, 1.3); } catch (e) { console.error('FALLO', n, e.message); } ctx.restore();
    ctx.fillStyle = '#1c1a2b'; ctx.font = '600 18px Poppins'; ctx.textAlign = 'center'; ctx.fillText(n, x, y + 26);
  });
  fs.writeFileSync(out, c.encodeSync('png')); console.log('Hoja:', out); process.exit(0);
}
if (cmd === 'prueba') {
  const c = createCanvas(1080, 1920), ctx = c.getContext('2d'); let fails = 0;
  PROP_NAMES.forEach((n, i) => {
    for (const p of [{ lugar: 'fondo', piezas: [n] }, { lugar: 'playa', hora: 'noche', persona: 'medio', piezas: [{ pieza: n, tamano: 'grande', anim: 'girar' }] }])
      for (const t of [0, 0.5, 2.5]) { try { SCENES.composicion.draw(ctx, SCENES.composicion.setup(p, rng(n)), { t, dur: 3, params: p, seed: 's' }); } catch (e) { fails++; console.error('FALLO', n, e.message); } }
  });
  console.log(`${PROP_NAMES.length} piezas probadas · fallos: ${fails}`); process.exit(fails ? 1 : 0);
}
console.log('Uso: lista | hoja salida.png [nombres…] | prueba');
