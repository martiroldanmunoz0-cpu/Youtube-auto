// Genera la foto de perfil (insignia) y el banner del canal. Uso: node assets/branding/generar_marca.mjs
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
GlobalFonts.registerFromPath(path.join(here, 'fonts', 'Anton-Regular.ttf'), 'Anton');
GlobalFonts.registerFromPath(path.join(here, '..', 'fonts', 'Poppins-Bold.ttf'), 'PoppinsB');
const AMBER = '#ffb35c', CREAM = '#fff1d6', NAVY = '#0b1024';

function stars(ctx, w, h, n, seed = 1) {
  let s = seed; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < n; i++) { ctx.fillStyle = `rgba(255,255,255,${0.2 + r() * 0.7})`; ctx.beginPath(); ctx.arc(r() * w, r() * h * 0.75, 0.6 + r() * 1.8, 0, 7); ctx.fill(); }
}
function glow(ctx, x, y, r, color, a) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, color.replace('A', a)); g.addColorStop(1, color.replace('A', 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
function hills(ctx, w, y0, h, color, seed) {
  ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(0, h);
  for (let x = 0; x <= w; x += w / 40) ctx.lineTo(x, y0 - Math.sin(x / w * 7 + seed) * 25 - Math.sin(x / w * 17 + seed * 2) * 12);
  ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
}
function bulb(ctx, x, y, s) { // bombilla con "?"
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  glow(ctx, 0, 0, 260, 'rgba(255,179,92,A)', 0.55);
  const g = ctx.createRadialGradient(-40, -60, 10, 0, 0, 170); g.addColorStop(0, '#fffaf0'); g.addColorStop(1, AMBER);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 120, Math.PI * 0.8, Math.PI * 2.2); ctx.lineTo(48, 150); ctx.lineTo(-48, 150); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#9aa1b3'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.roundRect(-55, 158 + i * 24, 110, 18, 8); ctx.fill(); }
  ctx.fillStyle = NAVY; ctx.font = '170px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 2, 12);
  ctx.restore();
}
function planet(ctx, x, y, r, c1, c2, ring) {
  const g = ctx.createRadialGradient(x - r * 0.4, y - r * 0.4, r * 0.1, x, y, r); g.addColorStop(0, c1); g.addColorStop(1, c2);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  if (ring) { ctx.strokeStyle = 'rgba(255,230,190,0.8)'; ctx.lineWidth = r * 0.12; ctx.beginPath(); ctx.ellipse(x, y, r * 1.7, r * 0.45, -0.35, 0.2, Math.PI - 0.2); ctx.stroke(); }
}
function outlinedText(ctx, text, x, y, size, fill, stroke, lw) {
  ctx.font = `${size}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round'; ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.strokeText(text, x, y);
  ctx.fillStyle = fill; ctx.fillText(text, x, y);
}

// ---------- FOTO DE PERFIL (insignia) ----------
{
  const S = 800, c = createCanvas(S, S), ctx = c.getContext('2d');
  ctx.save(); ctx.beginPath(); ctx.arc(400, 400, 392, 0, 7); ctx.clip();
  const sky = ctx.createLinearGradient(0, 0, 0, S); sky.addColorStop(0, '#0a0e22'); sky.addColorStop(0.6, '#1c2350'); sky.addColorStop(1, '#3a2340');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, S, S);
  stars(ctx, S, S, 160, 7);
  planet(ctx, 165, 215, 55, '#ffe2b0', '#c0602a', true);
  planet(ctx, 650, 190, 26, '#c9dcff', '#3a5bb0', false);
  glow(ctx, 600, 300, 60, 'rgba(255,255,255,A)', 0.3);
  hills(ctx, S, 560, S, '#141a33', 1); hills(ctx, S, 600, S, '#0b0f20', 3);
  bulb(ctx, 400, 300, 1.12);
  // cinta con el nombre
  ctx.fillStyle = 'rgba(5,7,15,0.85)'; ctx.fillRect(0, 560, S, 150);
  ctx.fillStyle = AMBER; ctx.fillRect(0, 556, S, 6); ctx.fillRect(0, 706, S, 6);
  let fs_ = 112; ctx.font = `${fs_}px Anton`;
  while (ctx.measureText('CURIOSIDARIO').width > 560 && fs_ > 60) { fs_ -= 2; ctx.font = `${fs_}px Anton`; }
  outlinedText(ctx, 'CURIOSIDARIO', 400, 636, fs_, CREAM, '#000', 9);
  ctx.restore();
  // aro exterior
  ctx.strokeStyle = AMBER; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(400, 400, 386, 0, 7); ctx.stroke();
  ctx.strokeStyle = '#05060c'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(400, 400, 374, 0, 7); ctx.stroke();
  fs.writeFileSync(path.join(here, 'perfil_insignia.png'), c.encodeSync('png'));
}

// ---------- BANNER (2560x1440; zona segura central 1546x423) ----------
{
  const Wd = 2560, Hd = 1440, c = createCanvas(Wd, Hd), ctx = c.getContext('2d');
  const sky = ctx.createLinearGradient(0, 0, 0, Hd); sky.addColorStop(0, '#070a1a'); sky.addColorStop(0.55, '#1c2350'); sky.addColorStop(0.8, '#5a2c4a'); sky.addColorStop(1, '#ff9a5a');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, Wd, Hd);
  stars(ctx, Wd, Hd, 700, 3);
  planet(ctx, 330, 300, 150, '#ffe2b0', '#c0602a', true);
  planet(ctx, 2230, 300, 90, '#c9dcff', '#3a5bb0', false);
  planet(ctx, 1960, 230, 36, '#ffd0e0', '#a0406a', false);
  glow(ctx, Wd / 2, 900, 900, 'rgba(255,150,80,A)', 0.25);
  hills(ctx, Wd, 1020, Hd, '#2a1d3f', 2); hills(ctx, Wd, 1080, Hd, '#161230', 5); hills(ctx, Wd, 1150, Hd, '#0a0a18', 9);
  // banda oscura detrás del texto (zona segura)
  const cx = Wd / 2, cy = Hd / 2;
  const band = ctx.createLinearGradient(0, cy - 230, 0, cy + 230); band.addColorStop(0, 'rgba(5,6,14,0)'); band.addColorStop(0.2, 'rgba(5,6,14,0.75)'); band.addColorStop(0.8, 'rgba(5,6,14,0.75)'); band.addColorStop(1, 'rgba(5,6,14,0)');
  ctx.fillStyle = band; ctx.fillRect(0, cy - 230, Wd, 460);
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  const a = 'LO QUE NUNCA ', b = 'TE CONTARON.';
  // Que quepa en la zona segura (1546 px de ancho en 2560) con margen
  let hs = 150; ctx.font = `${hs}px Anton`;
  while (ctx.measureText(a + b).width > 1546 - 140 && hs > 90) { hs -= 2; ctx.font = `${hs}px Anton`; }
  const wa = ctx.measureText(a).width, wb = ctx.measureText(b).width, x0 = cx - (wa + wb) / 2;
  ctx.lineJoin = 'round'; ctx.lineWidth = 12; ctx.strokeStyle = '#000';
  ctx.strokeText(a, x0, cy - 30); ctx.fillStyle = CREAM; ctx.fillText(a, x0, cy - 30);
  ctx.strokeText(b, x0 + wa, cy - 30); ctx.fillStyle = AMBER; ctx.fillText(b, x0 + wa, cy - 30);
  ctx.fillStyle = AMBER; ctx.fillRect(cx - 520, cy + 75, 1040, 5);
  ctx.font = '58px PoppinsB'; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,241,214,0.9)';
  ctx.fillText('Curiosidades  ·  Datos  ·  ¿Qué pasaría si…?', cx, cy + 140);
  bulb(ctx, cx - 870, cy - 10, 0.55);
  bulb(ctx, cx + 870, cy - 10, 0.55);
  fs.writeFileSync(path.join(here, 'banner.png'), c.encodeSync('png'));
  // Versión 2048x1152 (tamaño mínimo recomendado por YouTube; zona segura 1235x338 en el centro)
  const c2 = createCanvas(2048, 1152), x2 = c2.getContext('2d');
  x2.imageSmoothingQuality = 'high'; x2.drawImage(c, 0, 0, 2048, 1152);
  fs.writeFileSync(path.join(here, 'banner_2048x1152.png'), c2.encodeSync('png'));
  // Vista previa con la zona segura marcada (solo para comprobar)
  x2.strokeStyle = '#00ff88'; x2.lineWidth = 4; x2.setLineDash([18, 12]);
  x2.strokeRect((2048 - 1235) / 2, (1152 - 338) / 2, 1235, 338);
  fs.writeFileSync(path.join(here, '..', '..', 'out', 'banner_zona_segura.png'), c2.encodeSync('png'));
}
console.log('ok');
