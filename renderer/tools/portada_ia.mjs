// Pone el texto enorme de la miniatura sobre la imagen generada con IA. Uso: node portada_ia.mjs fondo.png "TEXTO" salida.jpg
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
GlobalFonts.registerFromPath(path.join(here, '..', '..', 'assets', 'branding', 'fonts', 'Anton-Regular.ttf'), 'Anton');
const [bgPath, text, out] = process.argv.slice(2);
const img = await loadImage(fs.readFileSync(bgPath));
const c = createCanvas(1280, 720), ctx = c.getContext('2d');
const s = Math.max(1280 / img.width, 720 / img.height); // recorte "cover" a 16:9
ctx.drawImage(img, (1280 - img.width * s) / 2, (720 - img.height * s) / 2, img.width * s, img.height * s);
const g = ctx.createLinearGradient(0, 0, 720, 0); g.addColorStop(0, 'rgba(0,0,0,0.7)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 720, 720);
const words = String(text || '').toUpperCase().split(/\s+/).filter(Boolean);
let size = 140, lines;
do { ctx.font = `${size}px Anton`; lines = []; let cur = ''; for (const w of words) { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > 600 && cur) { lines.push(cur); cur = w; } else cur = t; } if (cur) lines.push(cur); size -= 10; } while ((lines.length > 3 || lines.some((l) => ctx.measureText(l).width > 640)) && size > 60);
size += 10; ctx.font = `${size}px Anton`;
let y = 360 - (lines.length - 1) * size * 0.53;
ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
lines.forEach((l, i) => { ctx.lineWidth = size * 0.18; ctx.strokeStyle = '#000'; ctx.strokeText(l, 46, y); ctx.fillStyle = i % 2 ? '#ffd166' : '#ffffff'; ctx.fillText(l, 46, y); y += size * 1.05; });
fs.writeFileSync(out, c.encodeSync('jpeg', 90));
console.log('Miniatura:', out);
