// Hoja de prueba de una escena a medida VERTICAL: node tools/hoja_medida.mjs <id> <salida.png> [duracion=4]
// Dibuja cada plano en 3 momentos (inicio, mitad, final) y los pone en una hoja (fila por plano).
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const R = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fontDir = path.join(R, '..', 'assets', 'fonts');
for (const f of fs.readdirSync(fontDir).filter((f) => f.endsWith('.ttf'))) GlobalFonts.registerFromPath(path.join(fontDir, f), 'Poppins');
GlobalFonts.registerFromPath(path.join(R, '..', 'assets', 'branding', 'fonts', 'Anton-Regular.ttf'), 'Anton');
const [id, out, durS] = process.argv.slice(2); const dur = Number(durS || 4);
const { KIT } = await import(pathToFileURL(path.join(R, 'scenes', 'medida.mjs')).href);
const { personaWho } = await import(pathToFileURL(path.join(R, 'lib', 'persona.mjs')).href);
const mod = (await import(pathToFileURL(path.join(R, 'scenes', 'medida', id + '.mjs')).href)).default;
const keys = Object.keys(mod).map(Number).sort((a, b) => a - b);
const W = 1080, H = 1920, S = 0.17, cw = W * S, ch = H * S, cols = 6;
const rows = Math.ceil(keys.length / 2);
const sheet = createCanvas(cols * cw, rows * ch), sx = sheet.getContext('2d'); sx.fillStyle = '#333'; sx.fillRect(0, 0, sheet.width, sheet.height);
const c = createCanvas(W, H), x = c.getContext('2d');
keys.forEach((k, i) => {
  [0.1, 0.5, 0.92].forEach((f, j) => {
    x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.filter = 'none'; x.globalCompositeOperation = 'source-over'; x.fillStyle = '#ff00ff'; x.fillRect(0, 0, W, H);
    const t = dur * f;
    try { mod[k](x, { t, dur, d: dur, prog: f, params: {}, seed: id, who: personaWho(id, {}), global: t, frame: 0 }, KIT); }
    catch (e) { console.log(`plano ${k}: ERROR ${e.stack.split('\n').slice(0, 2).join(' ')}`); }
    x.setTransform(1, 0, 0, 1, 0, 0);
    sx.drawImage(c, ((i % 2) * 3 + j) * cw, Math.floor(i / 2) * ch, cw, ch);
  });
  sx.fillStyle = '#fff'; sx.font = '28px Poppins'; sx.fillText(String(k), (i % 2) * 3 * cw + 8, Math.floor(i / 2) * ch + 30);
});
fs.writeFileSync(out, sheet.toBuffer('image/png')); console.log('ok', keys.length, 'planos');
