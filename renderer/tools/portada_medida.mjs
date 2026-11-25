// Portada dibujada con nuestros personajes. Uso: node portada_medida.mjs <archivo-medida> salida.jpg
// Renderiza la exportación `portada(ctx, K)` de renderer/scenes/medida/<archivo>.mjs a 1280×720.
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url)), root = path.join(here, '..', '..');
const fd = path.join(root, 'assets', 'fonts');
for (const f of fs.readdirSync(fd).filter((f) => f.endsWith('.ttf'))) GlobalFonts.registerFromPath(path.join(fd, f), /anton/i.test(f) ? 'Anton' : 'Poppins');
GlobalFonts.registerFromPath(path.join(root, 'assets', 'branding', 'fonts', 'Anton-Regular.ttf'), 'Anton');
const [id, out] = process.argv.slice(2);
const { KIT } = await import(path.join(here, '..', 'scenes', 'medida.mjs'));
const mod = await import(path.join(here, '..', 'scenes', 'medida', `${id}.mjs`));
if (typeof mod.portada !== 'function') { console.error('Sin portada en', id); process.exit(2); }
const big = createCanvas(1920, 1080); mod.portada(big.getContext('2d'), KIT);
const c = createCanvas(1280, 720), ctx = c.getContext('2d'); ctx.imageSmoothingQuality = 'high'; ctx.drawImage(big, 0, 0, 1280, 720);
fs.writeFileSync(out, c.encodeSync('jpeg', 92));
console.log('Portada:', out);
