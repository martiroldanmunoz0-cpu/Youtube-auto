import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url)), root = path.join(here, '..', '..');
const fd = path.join(root, 'assets', 'fonts');
for (const f of fs.readdirSync(fd).filter((f) => f.endsWith('.ttf'))) GlobalFonts.registerFromPath(path.join(fd, f), /anton/i.test(f) ? 'Anton' : 'Poppins');
const [id, outdir] = process.argv.slice(2);
const { KIT } = await import(path.join(here, '..', 'scenes', 'medida.mjs'));
const mod = await import(path.join(here, '..', 'scenes', 'medida', `${id}.mjs`));
let bad = 0; const keys = Object.keys(mod.ancho).map(Number).sort((a,b)=>a-b);
for (const i of keys) for (const t of [0.2, 2.4, 3.9]) {
  const c = createCanvas(1920, 1080), ctx = c.getContext('2d');
  try { mod.ancho[i](ctx, { t, d: 4, params: {}, WW: 1920, WH: 1080 }, KIT); if (outdir && t === 2.4) { const s = createCanvas(480,270); s.getContext('2d').drawImage(c,0,0,480,270); fs.writeFileSync(`${outdir}/${String(i).padStart(2,'0')}.jpg`, s.encodeSync('jpeg', 70)); } }
  catch (e) { bad++; console.log(`plano ${i} t=${t}:`, e.message.split('\n')[0]); break; }
}
console.log('planos', keys.length, 'errores', bad);
