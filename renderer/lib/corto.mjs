// AYUDAS para escenas a medida VERTICALES (Shorts, 1080×1920) con el estilo nuevo (gente.mjs + escenario.mjs + SET).
// Los subtítulos van hacia y≈1330: los rótulos importantes mejor arriba (y 200-650) y la acción en el centro.
import { SET } from './sets.mjs';
import './sets_mundo.mjs';

export const W = 1080, H = 1920, INK = '#1b1530', V = { W, H };
export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const sm = (k) => { k = clamp(k); return k * k * (3 - 2 * k); };
export const lerp = (a, b, k) => a + (b - a) * k;
export const fase = (a) => clamp(a.t / (a.d || 3));
export const ph = (a, f0, f1) => clamp((fase(a) - f0) / (f1 - f0));
export const hs = (i) => { const x = Math.sin(i * 127.1) * 43758.5453; return x - Math.floor(x); };

// Un decorado horizontal de SET llenando la pantalla vertical (se amplía ×1.78 y se encuadra en cx, en coordenadas 1920).
// Devuelve gy (suelo) en coordenadas de pantalla.
export function fondo(ctx, a, set, o = {}, { cx = 960, zoom = 1, blur = 0 } = {}) {
  const s = (H / 1080) * zoom;
  ctx.save(); if (blur) ctx.filter = `blur(${blur}px)`;
  ctx.translate(W / 2 - cx * s, H - 1080 * s); ctx.scale(s, s);
  const r = SET[set](ctx, a.t, { a, ...o }) || {};
  ctx.restore();
  return H - 1080 * s + (r.gy ?? 1000) * s;
}
export const D = (K, ctx, a, p, x, gy, esc, o = {}) => K.dibuja(ctx, p, x, gy, esc, { t: a.t, ...o });
export function cielo(ctx, c1, c2, y0 = 0, y1 = H) { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, c1); g.addColorStop(1, c2); ctx.fillStyle = g; ctx.fillRect(0, y0, W, y1 - y0); }
export function ln(ctx, pts, col = INK, w = 6) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.restore(); }
export function circ(ctx, x, y, r, fill, lw = 6, stroke = INK) { ctx.beginPath(); ctx.arc(x, y, Math.max(0.1, r), 0, 7); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.stroke(); } }
export function caja(ctx, x, y, w, h, r, fill, lw = 6) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke(); } }
export function estrellas(ctx, a, n = 120, y1 = 900, seed = 1) { ctx.save(); for (let i = 0; i < n; i++) { ctx.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(a.t * 1.5 + i)); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(hs(i + seed) * W, hs(i * 3.7 + seed) * y1, 1.5 + hs(i * 9.1) * 2.5, 0, 7); ctx.fill(); } ctx.restore(); }

// Titular grande (Anton, borde grueso) que entra con rebote
export function titular(ctx, a, txt, x, y, { size = 120, col = '#ffffff', p0 = 0, rot = 0, max = W - 80 } = {}) {
  const k = clamp((fase(a) - p0) / 0.08); if (k <= 0) return;
  const s = k < 1 ? 0.4 + 0.6 * k + Math.sin(k * Math.PI) * 0.25 : 1 + Math.sin(a.t * 3) * 0.015;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.font = `${size}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  const w = ctx.measureText(txt).width; if (w > max) ctx.scale(max / w, max / w);
  ctx.lineWidth = size * 0.2; ctx.strokeStyle = INK; ctx.strokeText(txt, 0, 0); ctx.fillStyle = col; ctx.fillText(txt, 0, 0); ctx.restore();
}
// Sello que cae y se estampa
export function sello(ctx, a, txt, x, y, { p0 = 0.3, col = '#ff3b4e', size = 96, rot = -0.14 } = {}) {
  const k = clamp((fase(a) - p0) / 0.06); if (k <= 0) return; const s = 1 + (1 - k) * 1.5;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.globalAlpha = k; ctx.font = `${size}px Anton`; const w = Math.min(W - 120, ctx.measureText(txt).width + 60);
  ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillRect(-w / 2, -size * 0.72, w, size * 1.44);
  ctx.strokeStyle = col; ctx.lineWidth = 12; ctx.strokeRect(-w / 2, -size * 0.72, w, size * 1.44); ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, 6, w - 40); ctx.restore();
}
// Cruz roja que se dibuja sobre algo
export function tacha(ctx, a, x, y, r, p0 = 0.5) { const k = ph(a, p0, p0 + 0.12), k2 = ph(a, p0 + 0.08, p0 + 0.2); ctx.save(); ctx.strokeStyle = '#ff3b4e'; ctx.lineWidth = r * 0.16; ctx.lineCap = 'round';
  if (k > 0) { ctx.beginPath(); ctx.moveTo(x - r, y - r); ctx.lineTo(x - r + 2 * r * k, y - r + 2 * r * k); ctx.stroke(); }
  if (k2 > 0) { ctx.beginPath(); ctx.moveTo(x + r, y - r); ctx.lineTo(x + r - 2 * r * k2, y - r + 2 * r * k2); ctx.stroke(); } ctx.restore(); }
// Marco de película (sepia, perforaciones laterales en vertical)
export function peli(ctx, a, dibujar) {
  ctx.save(); dibujar(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgba(255,205,140,0.45)'; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#120d1c'; ctx.fillRect(0, 0, 90, H); ctx.fillRect(W - 90, 0, 90, H);
  const off = (a.t * 200) % 110; for (let y = -110 + off; y < H + 110; y += 110) { caja(ctx, 22, y, 46, 64, 8, '#f6eedc', 0); caja(ctx, W - 68, y, 46, 64, 8, '#f6eedc', 0); }
  ctx.globalAlpha = 0.25; for (let i = 0; i < 6; i++) { const x = hs(Math.floor(a.t * 12) + i) * W; ln(ctx, [[x, 0], [x + 4, H]], '#fff8e0', 2); } ctx.restore();
}
// Temblor de pantalla (envolver el dibujo)
export function temblor(ctx, a, fuerza, dibujar) { ctx.save(); ctx.translate(Math.sin(a.t * 47) * fuerza, Math.cos(a.t * 39) * fuerza); dibujar(); ctx.restore(); }
// Onda expansiva / anillos de sonido
export function anillos(ctx, a, x, y, { n = 3, r1 = 600, col = 'rgba(255,255,255,0.8)', lw = 10, vel = 0.8 } = {}) {
  ctx.save(); for (let i = 0; i < n; i++) { const k = ((a.t * vel + i / n) % 1); ctx.globalAlpha = 1 - k; ctx.strokeStyle = col; ctx.lineWidth = lw * (1 - k * 0.6); ctx.beginPath(); ctx.arc(x, y, 20 + k * r1, 0, 7); ctx.stroke(); } ctx.restore();
}
// Forma de onda de sonido animada (osciloscopio)
export function onda(ctx, a, x, y, w, h, { amp = 1, col = '#4dff88', pico = null, lw = 6, vel = 6 } = {}) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.shadowColor = col; ctx.shadowBlur = 18; ctx.beginPath();
  for (let i = 0; i <= 120; i++) { const u = i / 120, px = x + u * w; let v = Math.sin(u * 40 + a.t * vel) * 0.12 + Math.sin(u * 13 - a.t * vel * 0.7) * 0.08;
    if (pico != null) { const g = Math.exp(-((u - pico) ** 2) / 0.006); v += g * Math.sin(u * 70 + a.t * 9) * 0.9; }
    const py = y + v * h * amp; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
  ctx.stroke(); ctx.restore();
}
// Gota / partículas de agua cayendo
export function gotas(ctx, a, x0, x1, y0, y1, n = 20, col = '#5ec8ff', vel = 400) { ctx.save(); ctx.fillStyle = col; ctx.strokeStyle = INK; ctx.lineWidth = 3; for (let i = 0; i < n; i++) { const x = lerp(x0, x1, hs(i + 3)), y = y0 + ((a.t * vel + hs(i + 9) * (y1 - y0)) % (y1 - y0)); ctx.beginPath(); ctx.moveTo(x, y - 18); ctx.quadraticCurveTo(x + 11, y + 2, x, y + 8); ctx.quadraticCurveTo(x - 11, y + 2, x, y - 18); ctx.fill(); ctx.stroke(); } ctx.restore(); }
// Flecha gruesa
export function flecha(ctx, x0, y0, x1, y1, col = '#ffd93d', w = 26) { const an = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0); ctx.save(); ctx.translate(x0, y0); ctx.rotate(an); ctx.beginPath(); ctx.moveTo(0, -w / 2); ctx.lineTo(L - w * 1.6, -w / 2); ctx.lineTo(L - w * 1.6, -w * 1.3); ctx.lineTo(L, 0); ctx.lineTo(L - w * 1.6, w * 1.3); ctx.lineTo(L - w * 1.6, w / 2); ctx.lineTo(0, w / 2); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); }
// Árbol de pie (o tumbado con ang) y pelado (sin copa)
export function arbol(ctx, x, gy, s = 1, { ang = 0, pelado = false, col = '#3f7a45', tronco = '#7a4f2e', quemado = 0 } = {}) {
  ctx.save(); ctx.translate(x, gy); ctx.rotate(ang); ctx.scale(s, s);
  ctx.fillStyle = quemado ? '#3a2a22' : tronco; ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(-8, -260); ctx.lineTo(8, -260); ctx.lineTo(12, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  if (pelado) { ln(ctx, [[0, -180], [-50, -230]], INK, 7); ln(ctx, [[0, -140], [44, -190]], INK, 7); ln(ctx, [[0, -230], [30, -280]], INK, 6); }
  else { for (const [dx, dy, r] of [[0, -300, 70], [-45, -250, 55], [45, -250, 55], [0, -360, 48]]) circ(ctx, dx, dy, r, quemado ? '#4a3a2a' : col, 6); }
  ctx.restore();
}
export { SET };
