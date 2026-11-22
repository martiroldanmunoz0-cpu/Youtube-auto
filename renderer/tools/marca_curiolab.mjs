// Foto de perfil (800x800) y banner (2560x1440) de The Curio Lab, en el estilo de dibujo del canal.
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PROPS, DRAW } from '../lib/props.mjs';
import { INK } from '../lib/brightbg.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const FONTS = path.join(here, '..', '..', 'assets', 'fonts');
for (const f of fs.readdirSync(FONTS)) if (/\.ttf$/i.test(f)) GlobalFonts.registerFromPath(path.join(FONTS, f), 'Poppins');
GlobalFonts.registerFromPath(path.join(here, '..', '..', 'assets', 'branding', 'fonts', 'Anton-Regular.ttf'), 'Anton');
const OUT = path.join(here, '..', '..', 'assets', 'branding', 'curiolab');
const { C, E, R, P } = DRAW;
const prop = (ctx, n, x, y, s, rot = 0) => { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); PROPS[n](ctx, 0.6); ctx.restore(); };

// Matraz de laboratorio con un "?" de burbujas: el logo del canal
function flask(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // líquido + cristal
  const shape = () => { ctx.beginPath(); ctx.moveTo(-70, -260); ctx.lineTo(-70, -90); ctx.lineTo(-230, 170); ctx.quadraticCurveTo(-260, 240, -190, 250); ctx.lineTo(190, 250); ctx.quadraticCurveTo(260, 240, 230, 170); ctx.lineTo(70, -90); ctx.lineTo(70, -260); ctx.closePath(); };
  shape(); ctx.fillStyle = '#e9f4ff'; ctx.fill();
  ctx.save(); ctx.clip(); const g = ctx.createLinearGradient(0, 0, 0, 260); g.addColorStop(0, '#7b5cff'); g.addColorStop(1, '#ff4fa3'); ctx.fillStyle = g; ctx.fillRect(-300, 20, 600, 300);
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.ellipse(0, 20, 300, 26, 0, 0, 7); ctx.fill(); ctx.restore();
  shape(); ctx.lineWidth = 16; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.stroke();
  R(ctx, -95, -300, 190, 50, 20, '#ffd166', 14);
  // burbujas subiendo
  for (const [bx, by, br] of [[-60, 150, 26], [70, 190, 18], [10, 90, 14], [-20, -150, 22], [40, -230, 16]]) C(ctx, bx, by, br, 'rgba(255,255,255,0.9)', 8);
  // brillo
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-40, -220); ctx.lineTo(-40, -110); ctx.stroke();
  ctx.restore();
}
function qmark(ctx, x, y, size, rot, col = '#ffd166') { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.font = `${size}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.16; ctx.strokeStyle = INK; ctx.strokeText('?', 0, 0); ctx.fillStyle = col; ctx.fillText('?', 0, 0); ctx.restore(); }
function burst(ctx, x, y, r, n, c1, c2) { for (let i = 0; i < n; i++) { const a0 = i / n * Math.PI * 2, a1 = (i + 0.5) / n * Math.PI * 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, r, a0, a1); ctx.closePath(); ctx.fillStyle = i % 2 ? c1 : c2; ctx.fill(); } }
function title(ctx, txt, x, y, size, fill = '#ffffff') { ctx.save(); ctx.font = `${size}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.22; ctx.strokeStyle = INK; ctx.strokeText(txt, x, y); ctx.fillStyle = fill; ctx.fillText(txt, x, y); ctx.restore(); }

// ---- Foto de perfil (YouTube la recorta en círculo) ----
{
  const c = createCanvas(800, 800), ctx = c.getContext('2d');
  ctx.fillStyle = '#2b1f6e'; ctx.fillRect(0, 0, 800, 800); burst(ctx, 400, 400, 600, 24, '#2b1f6e', '#3a2a8f');
  const rg = ctx.createRadialGradient(400, 420, 60, 400, 420, 420); rg.addColorStop(0, 'rgba(255,170,90,0.35)'); rg.addColorStop(1, 'rgba(255,210,120,0)'); ctx.fillStyle = rg; ctx.fillRect(0, 0, 800, 800);
  for (let i = 0; i < 26; i++) { const a = i * 2.4, r = 250 + (i * 37) % 120; C(ctx, 400 + Math.cos(a) * r, 400 + Math.sin(a) * r, 4 + (i % 3) * 3, '#ffffff', 0); }
  flask(ctx, 400, 450, 1.05);
  qmark(ctx, 585, 190, 190, 0.2);
  fs.writeFileSync(path.join(OUT, 'perfil.png'), c.encodeSync('png'));
}
// ---- Banner (2560x1440; lo que se ve en todos los dispositivos es el centro 1546x423) ----
{
  const W = 2560, H = 1440, c = createCanvas(W, H), ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#24185e'); g.addColorStop(0.5, '#3b2a96'); g.addColorStop(1, '#5b2a86'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  burst(ctx, W / 2, H / 2, 1800, 40, 'rgba(255,255,255,0.03)', 'rgba(255,255,255,0)');
  for (let i = 0; i < 90; i++) C(ctx, (i * 397) % W, (i * 233) % H, 3 + (i % 4) * 2, 'rgba(255,255,255,0.8)', 0);
  // curiosidades alrededor (fuera y en el borde de la zona segura)
  const items = [['planeta', 260, 380, 0.9, -0.2], ['cohete', 2330, 330, 0.75, 0.5], ['dinosaurio', 300, 1130, 0.75, 0], ['volcan', 2280, 1180, 0.7, 0], ['cerebro', 2390, 760, 0.45, -0.15],
    ['lupa', 160, 760, 0.45, 0.3], ['reloj_arena', 900, 300, 0.4, -0.2], ['rayo', 1650, 300, 0.45, 0.2], ['tiburon', 1000, 1180, 0.5, 0], ['ovni', 1620, 1170, 0.5, 0.1], ['calavera', 680, 1220, 0.4, -0.2]];
  for (const [n, x, y, s, r] of items) if (PROPS[n]) prop(ctx, n, x, y, s, r);
  // zona segura: logo + nombre + lema
  const sx = (W - 1546) / 2, sy = (H - 423) / 2;
  R(ctx, sx + 40, sy + 20, 1466, 383, 80, 'rgba(20,16,50,0.75)', 12);
  flask(ctx, sx + 250, sy + 225, 0.62);
  title(ctx, 'THE CURIO LAB', sx + 900, sy + 165, 170, '#ffd166');
  ctx.save(); ctx.font = '600 58px Poppins'; ctx.textAlign = 'center'; ctx.fillStyle = '#ffffff'; ctx.fillText('Weird facts · What ifs · True stories', sx + 900, sy + 300); ctx.restore();
  ctx.save(); ctx.font = '700 40px Poppins'; ctx.textAlign = 'center'; ctx.fillStyle = '#9bd1ff'; ctx.fillText('NEW SHORTS EVERY DAY', sx + 900, sy + 365); ctx.restore();
  qmark(ctx, sx + 1440, sy + 90, 150, 0.25);
  fs.writeFileSync(path.join(OUT, 'banner.png'), c.encodeSync('png'));
}
console.log('ok', OUT);
