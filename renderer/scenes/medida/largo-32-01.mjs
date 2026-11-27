// largo-32-01 — "The Carrington Event: What If It Hit Today?"
// 79 planos horizontales (export «ancho»), uno distinto por plano. Tiendas y apps genéricas (sin marcas reales).
import { SET } from '../../lib/sets.mjs';
import '../../lib/sets_mundo.mjs';

const W = 1920, H = 1080, INK = '#1b1530';
let CAST = null;
function cast(K) {
  if (CAST) return CAST;
  const sin = { sombrero: null, corbata: null, barba: false, bigote: false };
  const [YOU, OPER, CARR, CASH, MINER, DRIVER, NEIGH, NURSE, PILOT, PHYS] = K.reparto('largo-32', 10, [
    { ...sin, estilo: 'limpio', pelo: 'raya', peloCol: '#2a1a10', ropa: '#4d96ff' },
    { ...sin, estilo: 'gordito', pelo: 'raya', peloCol: '#5a3a20', ropa: '#6b4a2b', bigote: true, sombrero: 'bombin' },
    { ...sin, estilo: 'limpio', pelo: 'raya', peloCol: '#8a5a30', ropa: '#2b2d42', barba: true, corbata: true },
    { ...sin, estilo: 'limpio', pelo: 'coleta', peloCol: '#1a120c', ropa: '#e63946' },
    { ...sin, estilo: 'gordito', pelo: 'calvo', ropa: '#8a6a46', barba: true, sombrero: 'vaquero' },
    { ...sin, estilo: 'gordito', pelo: 'rizos', peloCol: '#1a120c', ropa: '#2ec4b6', gafas: true },
    { ...sin, estilo: 'gordito', pelo: 'melena', peloCol: '#d9a441', ropa: '#f15bb5' },
    { ...sin, estilo: 'limpio', pelo: 'mono', peloCol: '#3a2414', ropa: '#6bcb77' },
    { ...sin, estilo: 'limpio', pelo: 'raya', peloCol: '#1a120c', ropa: '#1d3557', sombrero: 'gorra' },
    { ...sin, estilo: 'gordito', pelo: 'coronilla', peloCol: '#bdbdbd', ropa: '#f4f4f8', gafas: true },
  ]);
  CAST = { YOU, OPER, CARR, CASH, MINER, DRIVER, NEIGH, NURSE, PILOT, PHYS };
  return CAST;
}
const fase = (a) => Math.min(1, Math.max(0, a.t / (a.d || 4)));
const D = (K, ctx, a, p, x, gy, esc, o = {}) => K.dibuja(ctx, p, x, gy, esc, { t: a.t, ...o });
const sky = (ctx, c1, c2, y1 = H) => { const g = ctx.createLinearGradient(0, 0, 0, y1); g.addColorStop(0, c1); g.addColorStop(1, c2); ctx.fillStyle = g; ctx.fillRect(0, 0, W, y1); };
const suelo = (ctx, y, c1, c2) => { const g = ctx.createLinearGradient(0, y, 0, H); g.addColorStop(0, c1); g.addColorStop(1, c2); ctx.fillStyle = g; ctx.fillRect(0, y, W, H - y); ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); };
const lerpN = (a, b, k) => a + (b - a) * k;
const sm = (k) => k * k * (3 - 2 * k);
const ph = (a, f0, f1) => Math.min(1, Math.max(0, (fase(a) - f0) / (f1 - f0)));
const ln = (ctx, pts, col = INK, w = 6) => { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.restore(); };
const hs = (i) => { const x = Math.sin(i * 127.1) * 43758.5453; return x - Math.floor(x); };
const circ = (ctx, x, y, r, fill, lw = 6, col = INK) => { ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (lw) { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.stroke(); } ctx.restore(); };
function estrellas(ctx, a, n = 140, y1 = 700, seed = 1) { ctx.save(); for (let i = 0; i < n; i++) { const x = hs(i + seed) * W, y = hs(i * 3.7 + seed) * y1, tw = 0.5 + 0.5 * Math.sin(a.t * 2 + i); ctx.globalAlpha = 0.4 + 0.6 * tw; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 1.5 + hs(i * 9.1) * 2.5, 0, 7); ctx.fill(); } ctx.restore(); }
function big(ctx, txt, x, y, size, col = '#fff', { rot = 0, k = 1, align = 'center' } = {}) { if (k <= 0) return; ctx.save(); ctx.globalAlpha = Math.min(1, k); ctx.translate(x, y); ctx.rotate(rot); const s = 0.85 + 0.15 * sm(Math.min(1, k)); ctx.scale(s, s); ctx.font = `${size}px Anton`; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.16; ctx.strokeStyle = '#0b0818'; ctx.strokeText(txt, 0, 0); ctx.fillStyle = col; ctx.fillText(txt, 0, 0); ctx.restore(); }
function dato(K, ctx, c1 = '#141033', c2 = '#2b1f5c', glow = '#7b6cff') { sky(ctx, c1, c2); K.radial(ctx, W / 2, H / 2, 900, glow, 0.25); ctx.save(); ctx.globalAlpha = 0.07; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; for (let x = 0; x < W; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = 0; y < H; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); } ctx.restore(); }
const reloj = (K, ctx, a, txt) => K.contador(ctx, a, txt, 280, 92, { icono: 'reloj', size: 40 });

// ---------- Recursos ----------
// Aurora: cortinas de luz
function aurora(ctx, a, y0 = 80, y1 = 600, cols = ['#4dffb0', '#ff4d8a'], alpha = 0.55) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let j = 0; j < 3; j++) { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.4, cols[j % cols.length]); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.globalAlpha = alpha * (0.6 + 0.4 * Math.sin(a.t * 0.8 + j));
    ctx.beginPath(); ctx.moveTo(0, y1); for (let x = 0; x <= W; x += 40) ctx.lineTo(x, y0 + 60 * j + Math.sin(x * 0.004 + a.t * 0.9 + j * 2) * 90); ctx.lineTo(W, y1); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
// Sol con manchas y llamarada
function sol(K, ctx, a, x, y, r, flare = 0) {
  K.radial(ctx, x, y, r * 2.2, '#ffb347', 0.6); circ(ctx, x, y, r, '#ffcf3a', 10, '#c86a00');
  for (const [dx, dy, rr] of [[-0.3, -0.2, 0.09], [-0.18, -0.1, 0.06], [0.2, 0.25, 0.07]]) circ(ctx, x + dx * r, y + dy * r, rr * r, '#7a3a10', 0);
  if (flare > 0) { K.radial(ctx, x - 0.24 * r, y - 0.15 * r, r * 0.6 * flare, '#ffffff', 0.95); K.starBurst(ctx, x - 0.24 * r, y - 0.15 * r, r * 0.5 * flare, '#ffffff', 0.8); }
}
// Poste de telégrafo con cables
function postes(K, ctx, a, gy, n = 5, chispa = 0) {
  for (let i = 0; i < n; i++) { const x = 120 + i * (W - 240) / (n - 1); K.R(ctx, x - 10, gy - 520, 20, 520, 4, '#6b4a2b', 6); K.R(ctx, x - 80, gy - 500, 160, 18, 4, '#6b4a2b', 5); }
  for (let k = 0; k < 2; k++) { ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); for (let i = 0; i < n - 1; i++) { const x0 = 120 + i * (W - 240) / (n - 1) + (k ? 60 : -60), x1 = x0 + (W - 240) / (n - 1), y = gy - 495; ctx.moveTo(x0, y); ctx.quadraticCurveTo((x0 + x1) / 2, y + 60, x1, y); } ctx.stroke(); ctx.restore(); }
  if (chispa > 0) for (let i = 0; i < n; i++) { const x = 120 + i * (W - 240) / (n - 1); if (Math.sin(a.t * 17 + i * 3) > 0.2) K.starBurst(ctx, x, gy - 500, 50 * chispa, '#bfe6ff', 0.9); }
}
// Aparato telegráfico (llave + cinta de papel)
function telegrafo(K, ctx, x, y, s, t, fuego = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); K.R(ctx, -200, -40, 400, 60, 10, '#7a4b23', 7); K.R(ctx, -160, -110, 60, 70, 8, '#c9a24a', 6); K.R(ctx, -40, -80, 200, 16, 6, '#c9a24a', 5); circ(ctx, 160, -80 + Math.sin(t * 20) * 6, 18, '#2b2d42', 5);
  ctx.save(); ctx.fillStyle = '#f5ecd2'; ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-200, 10); ctx.bezierCurveTo(-300, 40, -330, 120, -380, 160); ctx.lineTo(-350, 180); ctx.bezierCurveTo(-300, 140, -270, 60, -180, 30); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  ctx.restore(); if (fuego > 0) K.prop(ctx, 'fuego', x - 340 * s, y + 160 * s, 0.5 * fuego, t);
}
// Móvil grande
function movil(K, ctx, x, y, s, { txt = '', col = '#f4f7ff', bat = null, rot = 0, sin = false } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); K.R(ctx, -150, -290, 300, 580, 40, '#22202c', 9); K.R(ctx, -130, -265, 260, 530, 22, col, 4);
  if (sin) { ctx.fillStyle = '#ff3b4e'; ctx.font = '700 26px Poppins'; ctx.textAlign = 'left'; ctx.fillText('NO SERVICE', -115, -228); }
  if (bat !== null) { K.R(ctx, 50, -248, 60, 26, 5, 'rgba(0,0,0,0)', 3); K.R(ctx, 53, -245, 54 * bat, 20, 3, bat < 0.2 ? '#ff3b4e' : '#2ecc71', 0); }
  if (txt) { ctx.fillStyle = INK; ctx.font = '900 46px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; txt.split('\n').forEach((l, i, arr) => ctx.fillText(l, 0, (i - (arr.length - 1) / 2) * 56)); }
  ctx.restore();
}
// Transformador gigante
function transfo(K, ctx, x, gy, s, calor = 0, t = 0) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s);
  const c = calor > 0.5 ? '#c0504d' : '#7d8a99'; K.R(ctx, -260, -360, 520, 360, 16, c, 9);
  for (let i = 0; i < 7; i++) K.R(ctx, -250 + i * 72, -330, 30, 300, 6, 'rgba(0,0,0,0.18)', 3);
  for (const bx of [-160, 0, 160]) { K.R(ctx, bx - 20, -470, 40, 110, 8, '#e9e9f2', 6); for (let j = 0; j < 4; j++) K.R(ctx, bx - 34, -460 + j * 26, 68, 12, 6, '#d8d8e4', 3); }
  ctx.restore(); if (calor > 0) K.radial(ctx, x, gy - 180 * s, 380 * s * calor, '#ff5a1f', 0.5 * calor); if (calor > 0.6) K.smoke(ctx, x, gy - 380 * s, t, 6);
}
// Tienda genérica (sin marca)
function tienda(K, ctx, a, luces = 1) {
  sky(ctx, luces ? '#f4f1ea' : '#4a4658', luces ? '#e2ddd0' : '#2a2838'); suelo(ctx, 860, luces ? '#d9d2c2' : '#3a3648', luces ? '#bfb6a2' : '#22202c');
  for (let i = 0; i < 4; i++) { const x = 80 + i * 470; K.R(ctx, x, 260, 400, 600, 8, '#c9ccd6', 6); for (let j = 0; j < 4; j++) { K.R(ctx, x, 260 + j * 150, 400, 14, 3, '#8a8d99', 3); for (let k = 0; k < 6; k++) K.R(ctx, x + 14 + k * 64, 290 + j * 150, 50, 110, 6, ['#ff6b6b', '#ffd93d', '#4d96ff', '#6bcb77', '#f15bb5'][(i + j + k) % 5], 3); } }
  K.R(ctx, 0, 100, W, 110, 0, luces ? '#e63946' : '#5a2a30', 7); ctx.save(); ctx.fillStyle = '#fff'; ctx.font = '80px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('SUPERSTORE', W / 2, 158); ctx.restore();
  if (luces) for (let i = 0; i < 6; i++) K.R(ctx, 120 + i * 300, 30, 200, 20, 10, '#fffbe6', 4);
}
function caja(K, ctx, x, gy, s = 1, pantalla = '#7fe0ff', txt = '') { ctx.save(); ctx.translate(x, gy); ctx.scale(s, s); K.R(ctx, -260, -300, 520, 300, 14, '#5a5f73', 8); K.R(ctx, -280, -330, 560, 40, 10, '#3a3f53', 7); K.R(ctx, 80, -520, 180, 130, 12, '#22202c', 7); K.R(ctx, 94, -506, 152, 102, 8, pantalla, 3); ctx.fillStyle = INK; ctx.font = '700 30px Poppins'; ctx.textAlign = 'center'; ctx.fillText(txt, 170, -446); K.R(ctx, 160, -390, 20, 60, 4, '#3a3f53', 4); ctx.restore(); }
// Mapa con punto azul
function mapa(K, ctx, x, y, w, h, t, err = 0, txt) {
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.fillStyle = '#e8efe0'; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 18; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(x, y + i * h / 5); ctx.lineTo(x + w, y + i * h / 5 + 30); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + i * w / 5, y); ctx.lineTo(x + i * w / 5 - 30, y + h); ctx.stroke(); }
  ctx.fillStyle = '#b9dca0'; ctx.fillRect(x + w * 0.6, y + h * 0.1, w * 0.3, h * 0.3);
  const px = x + w * 0.35 + err * w * 0.4, py = y + h * 0.6 - err * h * 0.4; ctx.globalAlpha = 0.25; circ(ctx, px, py, 30 + err * 120 + Math.sin(t * 4) * 6, '#4d96ff', 0); ctx.globalAlpha = 1; circ(ctx, px, py, 18, '#4d96ff', 5, '#fff');
  ctx.restore(); K.R(ctx, x, y, w, h, 10, 'rgba(0,0,0,0)', 6);
}
function coche(K, ctx, x, gy, s, col = '#4d96ff', dir = 1) { ctx.save(); ctx.translate(x, gy); ctx.scale(s * dir, s); K.P(ctx, [[-180, -20], [-175, -80], [-80, -95], [-30, -150], [80, -150], [140, -90], [185, -75], [190, -20]], col, 7); K.P(ctx, [[-20, -138], [70, -138], [120, -92], [-60, -92]], '#bfe6ff', 5); circ(ctx, -110, -20, 34, '#222', 6); circ(ctx, 120, -20, 34, '#222', 6); ctx.restore(); }
function torreAgua(K, ctx, x, gy, s, nivel = 1) { ctx.save(); ctx.translate(x, gy); ctx.scale(s, s); for (const dx of [-90, 90]) ln(ctx, [[dx, 0], [dx * 0.6, -420]], '#8a8d99', 16); K.R(ctx, -150, -640, 300, 230, 40, '#c9ccd6', 8); ctx.save(); ctx.beginPath(); ctx.rect(-146, -636, 292, 222); ctx.clip(); K.R(ctx, -146, -414 - 222 * nivel, 292, 222, 0, '#4d96ff', 0); ctx.restore(); K.R(ctx, -150, -640, 300, 230, 40, 'rgba(0,0,0,0)', 8); ctx.restore(); }
function surtidor(K, ctx, x, gy, s, apagado = 1) { ctx.save(); ctx.translate(x, gy); ctx.scale(s, s); K.R(ctx, -90, -340, 180, 340, 16, '#e63946', 8); K.R(ctx, -60, -300, 120, 90, 8, apagado ? '#2a2838' : '#9fe8ff', 5); ln(ctx, [[90, -200], [140, -180], [140, -60]], INK, 10); K.R(ctx, 120, -80, 50, 30, 6, '#3a3f53', 5); ctx.restore(); }
function cajero(K, ctx, x, gy, s, apagado = 1) { ctx.save(); ctx.translate(x, gy); ctx.scale(s, s); K.R(ctx, -170, -560, 340, 560, 14, '#8a8d99', 8); K.R(ctx, -120, -500, 240, 170, 8, apagado ? '#151520' : '#7fe0ff', 5); K.R(ctx, -80, -290, 160, 20, 6, '#22202c', 4); for (let i = 0; i < 9; i++) K.R(ctx, -70 + (i % 3) * 50, -250 + Math.floor(i / 3) * 44, 40, 34, 6, '#c9ccd6', 3); ctx.restore(); }
function nevera(K, ctx, x, gy, s, abierta = 0, t = 0) { ctx.save(); ctx.translate(x, gy); ctx.scale(s, s); K.R(ctx, -200, -720, 400, 720, 20, '#e9eef2', 9); if (abierta) { K.R(ctx, -180, -700, 360, 680, 12, '#c9d2da', 5); for (let j = 0; j < 3; j++) K.R(ctx, -180, -520 + j * 170, 360, 10, 3, '#8a8d99', 3); } else { ln(ctx, [[-200, -440], [200, -440]], INK, 6); K.R(ctx, 150, -600, 18, 120, 8, '#8a8d99', 4); } ctx.restore(); for (let i = 0; i < 3; i++) { const yy = gy - 20 + ((t * 120 + i * 40) % 60); K.prop(ctx, 'gota', x - 120 + i * 120, yy + 40, 0.18, t); } }
function grafica(ctx, x0, y0, w, h, k, f, col = '#ffd93d', lw = 12) { ln(ctx, [[x0, y0 - h], [x0, y0], [x0 + w, y0]], '#fff', 5); ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); const N = 120; for (let i = 0; i <= N * k; i++) { const u = i / N, px = x0 + u * w, py = y0 - f(u) * h; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); ctx.restore(); }
function tierra(K, ctx, a, x, y, s) { K.prop(ctx, 'tierra', x, y + 140 * s, s, a.t * 0.2); }
function satelite(K, ctx, x, y, s, rot = 0, roto = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); K.R(ctx, -50, -40, 100, 80, 10, '#c9a24a', 6); K.R(ctx, -230, -30, 160, 60, 6, '#3a5a9a', 5); K.R(ctx, 70, -30, 160, 60, 6, '#3a5a9a', 5); for (const bx of [-150, 150]) ln(ctx, [[bx, -30], [bx, 30]], '#8ab0ff', 3); ln(ctx, [[0, -40], [0, -90]], INK, 5); circ(ctx, 0, -95, 10, '#ff3b4e', 3); ctx.restore(); if (roto) { ctx.save(); ctx.globalAlpha = roto; ctx.fillStyle = '#ff3b4e'; ctx.font = '700 40px Poppins'; ctx.textAlign = 'center'; ctx.fillText('ERROR', x, y + 110 * s); ctx.restore(); } }
// Olas de partículas (viento solar)
function viento(ctx, a, x0, x1, y, h, col = '#ffb347', n = 60, vel = 600) { ctx.save(); for (let i = 0; i < n; i++) { const px = x0 + ((a.t * vel + hs(i) * (x1 - x0)) % (x1 - x0)), py = y - h / 2 + hs(i * 3) * h; ctx.globalAlpha = 0.7; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(px, py, 4 + hs(i * 5) * 4, 0, 7); ctx.fill(); ctx.globalAlpha = 0.3; ctx.fillRect(px - 40, py - 2, 40, 4); } ctx.restore(); }

export const ancho = {};
const A = ancho;

// ===================== CAPÍTULO 1 · THE NIGHT THE SKY BURNED =====================
Object.assign(A, {
  // 0 — 1859: el telegrafista desconecta las baterías… y los mensajes siguen saliendo
  0: (ctx, a, K) => { const { OPER } = cast(K);
    K.camara(ctx, a, () => { sky(ctx, '#3a2a1c', '#5a4028'); suelo(ctx, 900, '#4a3220', '#2a1c10');
      K.R(ctx, 300, 640, 1300, 40, 8, '#7a4b23', 7); telegrafo(K, ctx, 1050, 640, 1.1, a.t);
      K.R(ctx, 560, 560, 140, 80, 8, '#2b2d42', 6); const k = ph(a, 0.1, 0.35); ln(ctx, [[700, 600], [lerpN(880, 760, k), lerpN(610, 520, k)]], '#c9a24a', 6);
      D(K, ctx, a, OPER, 460, 920, 1.0, { pose: fase(a) > 0.5 ? 'miedo' : 'sostiene', mood: fase(a) > 0.5 ? 'shocked' : 'serio', mira: 1 });
      if (fase(a) > 0.45) { K.text(ctx, 'tap-tap-tap', 1150, 420, { size: 52, color: '#ffd93d' }); K.radial(ctx, 1050, 560, 260, '#bfe6ff', 0.4); } }, { de: 1.05, a: 1.15, foco: [900, 600] });
    K.etiqueta(ctx, a, 'BATTERIES: UNPLUGGED', 380, 460, { size: 40, p0: 0.3 }); K.etiqueta(ctx, a, '1859', 150, 120, { size: 56, rot: -0.04, col: '#ffe9b0' }); K.luz(ctx, a, { tono: 'interior', foco: [1000, 600] }); },
  // 1 — ¿Qué le haría hoy a tu móvil, tus luces, tu dinero?
  1: (ctx, a, K) => {
    dato(K, ctx, '#1a0f0a', '#3a1a10', '#ff7a2a');
    [['PHONE', () => movil(K, ctx, 420, 520, 0.7, { txt: '?' })], ['LIGHTS', () => K.prop(ctx, 'bombilla', 960, 640, 1.2, a.t)], ['MONEY', () => { K.R(ctx, 1320, 480, 360, 170, 12, '#9ed29e', 8); big(ctx, '$100', 1500, 565, 80, '#2a6a2a'); }]].forEach(([t, f], i) => { const k = ph(a, 0.1 + i * 0.2, 0.25 + i * 0.2); if (k <= 0) return; ctx.save(); ctx.globalAlpha = k; f(); ctx.restore(); big(ctx, t, 420 + i * 540, 860, 80, '#fff', { k }); });
    big(ctx, 'WHAT IF IT HIT TODAY?', W / 2, 130, 90, '#ffb347', { k: ph(a, 0, 0.12) }); },
  // 2 — 1 de septiembre de 1859: Carrington dibuja manchas solares
  2: (ctx, a, K) => { const { CARR } = cast(K);
    K.camara(ctx, a, () => { sky(ctx, '#e9d3a8', '#c9a876'); suelo(ctx, 900, '#8a6a46', '#5a432c');
      ln(ctx, [[560, 860], [900, 360]], '#3a3f53', 30); circ(ctx, 900, 360, 30, '#3a3f53', 6);
      K.R(ctx, 1080, 280, 560, 420, 10, '#fffdf5', 8); circ(ctx, 1360, 490, 170, '#ffeaa0', 6); for (const [dx, dy, r] of [[-60, -40, 18], [-30, -20, 12], [50, 50, 14]]) circ(ctx, 1360 + dx, 490 + dy, r, INK, 0);
      const y = D(K, ctx, a, CARR, 820, 920, 1.0, { pose: 'sostiene', mood: 'piensa', mira: 1 }); if (y.manoD) K.prop(ctx, 'pluma', y.manoD[0] + 30, y.manoD[1] - 20, 0.5, a.t); }, { de: 1, a: 1.12, foco: [1100, 560] });
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgba(255,214,150,0.3)'; ctx.fillRect(0, 0, W, H); ctx.restore();
    K.etiqueta(ctx, a, 'SEPT 1, 1859', 180, 120, { size: 52, rot: -0.04, col: '#ffe9b0' }); K.etiqueta(ctx, a, 'SUNSPOTS', 1420, 760, { size: 42, p0: 0.3 }); K.luz(ctx, a, { tono: 'dia' }); },
  // 3 — Dos manchas blancas estallan: más brillantes que el propio Sol (detalle)
  3: (ctx, a, K) => {
    sky(ctx, '#2a1405', '#4a2208');
    sol(K, ctx, a, W / 2, 540, 380, ph(a, 0.15, 0.4) * (0.8 + 0.2 * Math.sin(a.t * 10)));
    K.radial(ctx, W / 2 + 60, 500, 160 * ph(a, 0.25, 0.5), '#ffffff', 0.9);
    K.contador(ctx, a, `${Math.min(5, Math.floor(ph(a, 0.1, 0.9) * 5) + 1)} MIN`, 1650, 960, { icono: 'reloj', size: 46 }); K.etiqueta(ctx, a, 'BRIGHTER THAN THE SUN', 200, 140, { size: 48, p0: 0.3 }); },
  // 4 — Corre a buscar un testigo… y ya no está
  4: (ctx, a, K) => { const { CARR } = cast(K);
    K.camara(ctx, a, () => { SET.despacho(ctx, a.t, { hora: 'dia' });
      const w = K.anda(a, 1500, 300, 0, 0.6); D(K, ctx, a, CARR, w.x, 1000, 1.0, { pose: fase(a) < 0.6 ? 'corre' : 'encoge', mood: fase(a) < 0.6 ? 'sorpresa' : 'duda', mira: fase(a) < 0.6 ? -1 : 1 });
      K.speedLines(ctx, w.x + 160, 700, a.t, fase(a) < 0.6 ? 0.6 : 0); }, { de: 1, a: 1.08, foco: [900, 600] });
    if (fase(a) > 0.65) K.etiqueta(ctx, a, 'GONE.', 1400, 300, { size: 70, p0: 0.65, col: '#ffd0d0' });
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgba(255,214,150,0.3)'; ctx.fillRect(0, 0, W, H); ctx.restore(); K.luz(ctx, a, { tono: 'interior' }); },
  // 5 — Llamarada solar; 17,5 horas después la tormenta llega a la Tierra
  5: (ctx, a, K) => {
    sky(ctx, '#02030c', '#0a0d22'); estrellas(ctx, a, 150, 1080, 2);
    sol(K, ctx, a, 120, 540, 300, 0.6);
    const k = ph(a, 0.1, 0.9); viento(ctx, a, 400, lerpN(500, 1500, k), 540, 360, '#ffb347', 70, 500);
    tierra(K, ctx, a, 1650, 540, 0.9);
    K.contador(ctx, a, `${(k * 17.5).toFixed(1)} H`, W / 2, 960, { icono: 'reloj', size: 52 }); K.etiqueta(ctx, a, 'SOLAR FLARE', 300, 160, { size: 48 }); },
  // 6 — Las líneas de telégrafo chisporrotean; el papel arde; descargas a los operadores
  6: (ctx, a, K) => { const { OPER } = cast(K);
    K.camara(ctx, a, () => { sky(ctx, '#3a2a1c', '#5a4028'); suelo(ctx, 900, '#4a3220', '#2a1c10');
      K.R(ctx, 500, 640, 1100, 40, 8, '#7a4b23', 7); telegrafo(K, ctx, 1150, 640, 1.1, a.t, ph(a, 0.2, 0.5));
      for (let i = 0; i < 4; i++) if (Math.sin(a.t * 13 + i * 2) > 0.3) K.starBurst(ctx, 1100 + i * 60, 560 - i * 20, 70, '#bfe6ff', 0.9);
      const y = D(K, ctx, a, OPER, 640, 920, 1.0, { pose: 'miedo', mood: 'miedo', mira: 1 }); K.mareo(ctx, a, y.cabeza, y.hr); }, { de: 1, a: 1.12, foco: [900, 600], temblor: 5 });
    K.text(ctx, 'ZAP!', 1500, 300, { size: 110, color: '#9fe8ff' }); K.luz(ctx, a, { tono: 'tension' }); },
  // 7 — Boston–Portland: desconectados, envían mensajes 2 horas con la corriente del cielo (mapa)
  7: (ctx, a, K) => {
    sky(ctx, '#e9d3a8', '#d7bb88');
    ctx.save(); ctx.fillStyle = '#c9a876'; ctx.beginPath(); ctx.moveTo(300, 100); ctx.bezierCurveTo(700, 300, 900, 500, 1100, 1080); ctx.lineTo(0, 1080); ctx.lineTo(0, 100); ctx.fill(); ctx.restore();
    const B = [820, 820], P = [1180, 260]; circ(ctx, ...B, 22, '#e63946', 6); circ(ctx, ...P, 22, '#e63946', 6);
    K.text(ctx, 'BOSTON', B[0] - 40, B[1] + 70, { size: 48, color: INK }); K.text(ctx, 'PORTLAND', P[0] + 60, P[1] - 50, { size: 48, color: INK });
    ctx.save(); ctx.setLineDash([24, 18]); ln(ctx, [B, P], '#3b2416', 8); ctx.restore();
    const k = (a.t * 0.5) % 1; K.prop(ctx, 'rayo', lerpN(B[0], P[0], k), lerpN(B[1], P[1], k) + 50, 0.4, a.t);
    K.contador(ctx, a, '2 HOURS — NO BATTERIES', 1380, 860, { icono: 'reloj', size: 42, p0: 0.2 }); },
  // 8 — Energía del cielo: como un móvil funcionando sin batería
  8: (ctx, a, K) => {
    dato(K, ctx, '#081428', '#12305a', '#6fd3ff');
    movil(K, ctx, 760, 560, 1.1, { txt: 'CALLING...', bat: 0 });
    ctx.save(); ctx.translate(760, 560); ctx.setLineDash([12, 10]); K.R(ctx, 220, -140, 180, 120, 14, 'rgba(0,0,0,0)', 6); ctx.restore(); ln(ctx, [[1000, 450], [1140, 450]], '#ff3b4e', 10); ln(ctx, [[1000, 380], [1140, 520]], '#ff3b4e', 10);
    K.prop(ctx, 'rayo', 1500, 420, 1.0, a.t); ln(ctx, [[1450, 400], [960, 300]], 'rgba(159,232,255,0.6)', 8);
    K.etiqueta(ctx, a, 'NO BATTERY', 1000, 620, { size: 44, p0: 0.2 }); K.etiqueta(ctx, a, 'POWER FROM THE SKY', 1300, 140, { size: 48, p0: 0.45 }); },
  // 9 — Mineros de las Rocosas se despiertan a la 1 y se ponen a hacer el desayuno
  9: (ctx, a, K) => { const { MINER } = cast(K);
    K.camara(ctx, a, () => { sky(ctx, '#0a1a2a', '#1a3a3a', 820); aurora(ctx, a, 40, 700, ['#4dffb0', '#9a6bff'], 0.7); SET.montes(ctx, a.t, { hora: 'noche' });
      suelo(ctx, 900, '#3a4a3a', '#1f2a1f'); K.R(ctx, 1200, 760, 120, 140, 6, '#2b2d42', 6); K.smoke(ctx, 1260, 740, a.t, 5); K.prop(ctx, 'fuego', 1000, 900, 0.5, a.t);
      D(K, ctx, a, MINER, 760, 1000, 1.0, { pose: 'sostiene', mood: 'feliz', mira: 1 }); K.prop(ctx, 'cafe', 900, 760, 0.4, a.t); }, { de: 1, a: 1.1, foco: [960, 500] });
    K.contador(ctx, a, '1:00 AM', 1650, 92, { icono: 'reloj', size: 42 }); K.globo(ctx, a, 'Morning already!', 560, 380, { tx: 740, ty: 640, p0: 0.3, size: 42 }); },
  // 10 — Auroras hasta Cuba y el Caribe (mapa con mancha que baja)
  10: (ctx, a, K) => {
    sky(ctx, '#050a1a', '#0c1630');
    ctx.save(); ctx.fillStyle = '#1f3a2a'; ctx.strokeStyle = '#4a7a5a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(200, 120); ctx.lineTo(1500, 100); ctx.lineTo(1600, 300); ctx.lineTo(1350, 520); ctx.lineTo(1300, 700); ctx.lineTo(1180, 640); ctx.lineTo(900, 760); ctx.lineTo(700, 640); ctx.lineTo(420, 520); ctx.lineTo(260, 330); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(1250, 850, 170, 30, -0.1, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore();
    const k = ph(a, 0.05, 0.8); ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createLinearGradient(0, 0, 0, 120 + k * 800); g.addColorStop(0, 'rgba(77,255,176,0.7)'); g.addColorStop(0.7, 'rgba(255,77,138,0.4)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 120 + k * 800); ctx.restore();
    K.etiqueta(ctx, a, 'CUBA', 1160, 930, { size: 44, p0: 0.7 }); K.etiqueta(ctx, a, 'AURORAS REACH THE TROPICS', 300, 980, { size: 44, p0: 0.5 }); },
  // 11 — Los periódicos lo llamaron maravilla, no aviso
  11: (ctx, a, K) => {
    sky(ctx, '#2a1d12', '#4a3420'); K.radial(ctx, W / 2, 540, 800, '#ffcf8a', 0.35);
    ctx.save(); ctx.translate(W / 2, 520); ctx.rotate(-0.03); K.R(ctx, -560, -400, 1120, 800, 6, '#efe6cf', 9);
    ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.font = '86px Anton'; ctx.fillText('THE DAILY HERALD', 0, -300); ln(ctx, [[-500, -260], [500, -260]], INK, 5); ctx.font = '120px Anton'; ctx.fillText('A WONDROUS', 0, -140); ctx.fillText('SKY!', 0, 0);
    ctx.globalAlpha = 0.5; for (let i = 0; i < 6; i++) { ln(ctx, [[-500, 90 + i * 45], [-60, 90 + i * 45]], '#555', 6); ln(ctx, [[40, 90 + i * 45], [500, 90 + i * 45]], '#555', 6); } ctx.restore();
    if (ph(a, 0.5, 0.6) > 0) K.cartel(ctx, a, 'NOT A WARNING', 1520, 900, { tipo: 'rojo', size: 50, p0: 0.5, rot: 0.06 }); },
  // 12 — Hoy el mundo SON cables: la ciudad moderna llena de cables y antenas
  12: (ctx, a, K) => {
    K.camara(ctx, a, () => { SET.avenida(ctx, a.t, { hora: 'atardecer' });
      ctx.save(); for (let j = 0; j < 7; j++) { ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 160 + j * 40); ctx.quadraticCurveTo(W / 2, 260 + j * 40, W, 140 + j * 40); ctx.stroke(); } ctx.restore();
      for (const x of [200, 1720]) { K.R(ctx, x - 14, 120, 28, 820, 4, '#3a3f53', 6); } }, { de: 1.1, a: 1, foco: [960, 400] });
    big(ctx, 'TODAY, THE WORLD IS WIRES', W / 2, 980, 90, '#ffd93d', { k: ph(a, 0.3, 0.45) }); K.luz(ctx, a, { tono: 'atardecer' }); },
});

// ===================== CAPÍTULO 2 · HOUR ZERO =====================
Object.assign(A, {
  // 13 — Estás en la caja de una gran superficie de Ohio, un martes por la tarde
  13: (ctx, a, K) => { const { YOU, CASH } = cast(K);
    K.camara(ctx, a, () => { tienda(K, ctx, a, 1); caja(K, ctx, 1100, 1000, 1, '#7fe0ff', '$23.40');
      D(K, ctx, a, CASH, 1350, 900, 0.9, { pose: 'sostiene', mood: 'feliz', mira: -1 });
      D(K, ctx, a, YOU, 640, 1020, 1.0, { pose: 'sostiene', mood: 'feliz', mira: 1 }); K.prop(ctx, 'bolsa_dinero', 800, 900, 0.01, a.t); }, { de: 1, a: 1.1, foco: [960, 640] });
    reloj(K, ctx, a, 'TUE 4:12 PM'); K.etiqueta(ctx, a, 'OHIO', 1600, 260, { size: 50, p0: 0.2 }); K.luz(ctx, a, { tono: 'interior' }); },
  // 14 — Un satélite a un millón de millas lo detecta: 15-60 min de aviso
  14: (ctx, a, K) => {
    sky(ctx, '#02030c', '#0a0d22'); estrellas(ctx, a, 160, 1080, 7);
    sol(K, ctx, a, -60, 540, 420, 0.3); satelite(K, ctx, 960, 480, 1.2, Math.sin(a.t) * 0.05); tierra(K, ctx, a, 1720, 560, 0.5);
    ctx.save(); ctx.setLineDash([16, 14]); ln(ctx, [[1080, 480], [1640, 540]], '#ffd93d', 5); ctx.restore();
    K.etiqueta(ctx, a, '1,000,000 MILES OUT', 820, 760, { size: 46, p0: 0.15 }); K.contador(ctx, a, 'WARNING: 15–60 MIN', 1300, 960, { icono: 'reloj', size: 46, p0: 0.4, col: '#e63946' }); },
  // 15 — Apenas tiempo para hacer llamadas (sala de control con teléfonos)
  15: (ctx, a, K) => { const { PHYS } = cast(K);
    K.camara(ctx, a, () => { SET.control(ctx, a.t, { hora: 'noche' });
      D(K, ctx, a, PHYS, 960, 1010, 1.0, { pose: 'llama', mood: 'worried', mira: 1 });
      for (let i = 0; i < 3; i++) { const x = 400 + i * 560; ctx.save(); ctx.translate(x, 860); ctx.rotate(Math.sin(a.t * 30 + i) * 0.08); K.R(ctx, -60, -40, 120, 60, 12, '#e63946', 5); ctx.restore(); if (i !== 1) K.text(ctx, 'RING!', x, 760, { size: 40, color: '#ffd93d' }); } }, { de: 1, a: 1.1, foco: [960, 600] });
    K.contador(ctx, a, `${Math.max(0, 15 - Math.floor(fase(a) * 15))} MIN LEFT`, 1600, 92, { icono: 'reloj', size: 42, col: '#e63946' }); K.luz(ctx, a, { tono: 'tension' }); },
  // 16 — El móvil vibra en tu bolsillo… nada (primer plano)
  16: (ctx, a, K) => { const { YOU } = cast(K);
    tienda(K, ctx, a, 1); ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(0, 0, W, H); ctx.restore();
    const y = D(K, ctx, a, YOU, 760, 1600, 2.7, { pose: 'sostiene', mood: 'duda', mira: 1 });
    const vib = fase(a) < 0.4 ? Math.sin(a.t * 60) * 8 : 0; movil(K, ctx, 1420 + vib, 560, 0.95, { txt: fase(a) < 0.4 ? 'bzzz' : '...', rot: 0.08 });
    if (fase(a) < 0.4) K.speedLines(ctx, 1420, 560, a.t, 0.4); },
  // 17 — Las partículas golpean el campo magnético; el cielo brilla, tú no miras (contraste dentro/fuera)
  17: (ctx, a, K) => { const { YOU } = cast(K);
    sky(ctx, '#02030c', '#0a1530'); aurora(ctx, a, 20, 900, ['#4dffb0', '#ff4d8a', '#7a6bff'], 0.6);
    ctx.save(); ctx.translate(W / 2, 1300); ctx.strokeStyle = 'rgba(159,232,255,0.5)'; ctx.lineWidth = 6; for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.ellipse(0, 0, 300 + i * 160, 200 + i * 140, 0, Math.PI, 0); ctx.stroke(); } ctx.restore();
    K.R(ctx, 360, 640, 1200, 440, 10, '#e2ddd0', 8); K.R(ctx, 360, 640, 1200, 70, 6, '#e63946', 6); ctx.save(); ctx.fillStyle = 'rgba(255,250,220,0.8)'; ctx.fillRect(460, 760, 420, 320); ctx.fillRect(1040, 760, 420, 320); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(460, 760, 420, 320); ctx.clip(); D(K, ctx, a, YOU, 670, 1240, 0.8, { pose: 'sostiene', mood: 'neutral', mira: 1 }); ctx.restore();
    K.etiqueta(ctx, a, 'YOU NEVER LOOK UP', 1240, 560, { size: 48, p0: 0.4 }); },
  // 18 — Apagones de radio: pilotos pierden contacto (cabina)
  18: (ctx, a, K) => { const { PILOT } = cast(K);
    sky(ctx, '#3a6aa8', '#9fc7ef'); ctx.save(); ctx.fillStyle = '#2a2d3a'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W, 0); ctx.lineTo(W, 260); ctx.lineTo(1500, 200); ctx.lineTo(420, 200); ctx.lineTo(0, 260); ctx.fill(); ctx.fillRect(0, 700, W, 380); ctx.restore();
    for (let i = 0; i < 8; i++) { circ(ctx, 300 + i * 190, 820, 50, '#151520', 6); ln(ctx, [[300 + i * 190, 820], [300 + i * 190 + Math.cos(a.t * 3 + i) * 40, 820 + Math.sin(a.t * 3 + i) * 40]], '#7dffb0', 5); }
    D(K, ctx, a, PILOT, 760, 1500, 1.9, { pose: 'llama', mood: 'worried', mira: 1 });
    K.globo(ctx, a, 'Tower, do you copy?', 1250, 400, { tx: 950, ty: 560, p0: 0.1, size: 42 }); K.text(ctx, 'kssshhh...', 1400, 600, { size: 54, color: '#fff', k: ph(a, 0.45, 0.55) }); },
  // 19 — La cajera escanea; sigue funcionando. Pero nadie puede enviar mensajes
  19: (ctx, a, K) => { const { YOU, CASH } = cast(K);
    K.camara(ctx, a, () => { tienda(K, ctx, a, 1); caja(K, ctx, 960, 1000, 1.1, '#7dffb0', 'OK');
      D(K, ctx, a, CASH, 1300, 900, 0.9, { pose: 'sostiene', mood: 'feliz', mira: -1 });
      const g = K.reparto('l32-cola', 3); g.forEach((p, i) => { const y = D(K, ctx, a, p, 220 + i * 200, 1010, 0.9, { pose: 'sostiene', mood: 'duda', mira: -1 }); });
      movil(K, ctx, 260, 560, 0.3, { sin: true }); movil(K, ctx, 640, 560, 0.3, { sin: true }); }, { de: 1, a: 1.1, foco: [960, 640] });
    K.etiqueta(ctx, a, 'NO TEXTS GO OUT', 280, 340, { size: 44, p0: 0.4 }); K.luz(ctx, a, { tono: 'interior' }); },
});

// ===================== CAPÍTULO 3 · THE BLUE DOT LIES =====================
Object.assign(A, {
  // 20 — Hora 1: los satélites reciben el golpe; sus señales se doblan
  20: (ctx, a, K) => {
    sky(ctx, '#02030c', '#0a0d22'); estrellas(ctx, a, 120, 1080, 11); viento(ctx, a, 0, W, 300, 400, '#ffb347', 80, 700);
    tierra(K, ctx, a, 960, 1100, 1.6);
    for (let i = 0; i < 4; i++) { const x = 300 + i * 440, y = 480 + Math.sin(i) * 60; satelite(K, ctx, x, y, 0.6, Math.sin(a.t * 3 + i) * 0.2);
      ctx.save(); ctx.strokeStyle = '#7dffb0'; ctx.lineWidth = 5; ctx.beginPath(); for (let s = 0; s < 30; s++) { const u = s / 30, px = x + Math.sin(u * 12 + a.t * 6) * 40 * ph(a, 0.2, 0.6), py = y + 60 + u * 340; s ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); ctx.restore(); }
    reloj(K, ctx, a, 'HOUR 1'); K.etiqueta(ctx, a, 'SIGNALS BEND', 1400, 140, { size: 48, p0: 0.3 }); },
  // 21 — Error del GPS: de pies a manzanas (escala que crece)
  21: (ctx, a, K) => {
    dato(K, ctx, '#0a1a14', '#123a2a', '#6bff9a');
    const k = ph(a, 0.1, 0.9), r = 20 + Math.pow(k, 1.5) * 420; ctx.save(); ctx.globalAlpha = 0.25; circ(ctx, W / 2, 560, r, '#4d96ff', 0); ctx.restore(); circ(ctx, W / 2, 560, r, null, 6, '#9fd0ff'); circ(ctx, W / 2, 560, 20, '#4d96ff', 5, '#fff');
    const v = k < 0.35 ? `${Math.round(3 + k * 100)} FEET` : `${Math.max(1, Math.round((k - 0.3) * 20))} BLOCKS`; big(ctx, `GPS ERROR: ${v}`, W / 2, 140, 80, '#fff'); },
  // 22 — Los pilotos pasan a los sistemas de respaldo; vuelos en tierra (tablero de salidas)
  22: (ctx, a, K) => {
    sky(ctx, '#1a1a22', '#2a2a36'); K.R(ctx, 160, 140, 1600, 800, 14, '#0b0b12', 10);
    ctx.save(); ctx.font = '48px Anton'; ctx.fillStyle = '#ffd93d'; ctx.fillText('DEPARTURES', 220, 220); ['CHI 5:10', 'NYC 5:25', 'DEN 5:40', 'ATL 5:55', 'LAX 6:10', 'MIA 6:20'].forEach((f, i) => { const k = ph(a, 0.1 + i * 0.1, 0.15 + i * 0.1); ctx.fillStyle = '#fff'; ctx.font = '600 52px Poppins'; ctx.fillText(f, 240, 320 + i * 100); ctx.fillStyle = k > 0 ? '#ff3b4e' : '#7dffb0'; ctx.fillText(k > 0 ? 'GROUNDED' : 'ON TIME', 1200, 320 + i * 100); }); ctx.restore();
    K.prop(ctx, 'avion', 1600, 1000, 0.6, a.t); },
  // 23 — Pides un coche en la app; la rueda gira y gira (app genérica)
  23: (ctx, a, K) => { const { YOU } = cast(K);
    SET.calle(ctx, a.t, { hora: 'atardecer' });
    D(K, ctx, a, YOU, 560, 1500, 2.0, { pose: 'sostiene', mood: 'duda', mira: 1 });
    movil(K, ctx, 1200, 540, 1.1, { txt: '' }); ctx.save(); ctx.translate(1200, 480); ctx.fillStyle = INK; ctx.font = '900 44px Anton'; ctx.textAlign = 'center'; ctx.fillText('RIDE APP', 0, -150); ctx.rotate(a.t * 5); ctx.strokeStyle = '#4d96ff'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, 0, 70, 0, Math.PI * 1.4); ctx.stroke(); ctx.restore();
    K.text(ctx, 'Finding your driver...', 1200, 680, { size: 30, color: INK }); K.luz(ctx, a, { tono: 'atardecer' }); },
  // 24 — Tu pin aparece a millas; el conductor da vueltas
  24: (ctx, a, K) => {
    sky(ctx, '#e8efe0', '#e8efe0'); mapa(K, ctx, 0, 0, W, H, a.t, 0);
    circ(ctx, 600, 700, 22, '#4d96ff', 6, '#fff'); K.etiqueta(ctx, a, 'YOU', 640, 760, { size: 40 });
    ctx.save(); ctx.translate(1450, 280); K.P(ctx, [[0, 0], [-40, -70], [40, -70]], '#e63946', 6); circ(ctx, 0, -80, 40, '#e63946', 6); circ(ctx, 0, -80, 14, '#fff', 0); ctx.restore(); K.etiqueta(ctx, a, 'APP SAYS: HERE', 1300, 140, { size: 40, p0: 0.2 });
    const an = a.t * 1.6; coche(K, ctx, 1450 + Math.cos(an) * 220, 330 + Math.sin(an) * 140, 0.35, '#ffd93d', Math.sin(an) > 0 ? -1 : 1); },
  // 25 — Llamas para explicarte: tono de comunicando
  25: (ctx, a, K) => { const { DRIVER, YOU } = cast(K);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W / 2, H); ctx.clip(); SET.calle(ctx, a.t, { hora: 'atardecer' }); D(K, ctx, a, YOU, W / 4, 1400, 1.8, { pose: 'llama', mood: 'enfadado', mira: 1 }); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(W / 2, 0, W / 2, H); ctx.clip(); sky(ctx, '#2a3448', '#4a5a78'); coche(K, ctx, W * 0.75, 1100, 1.6, '#ffd93d'); D(K, ctx, a, DRIVER, W * 0.72, 1500, 1.5, { pose: 'llama', mood: 'duda', mira: -1 }); ctx.restore();
    ln(ctx, [[W / 2, 0], [W / 2, H]], INK, 10); big(ctx, 'BEEP – BEEP – BEEP', W / 2, 140, 80, '#ff3b4e', { k: ph(a, 0.3, 0.4) }); K.etiqueta(ctx, a, 'CALL DROPPED', W / 2 - 160, 960, { size: 46, p0: 0.5 }); },
  // 26 — Furgonetas de reparto perdidas; las torres móviles pierden la hora
  26: (ctx, a, K) => {
    K.camara(ctx, a, () => { SET.suburbio(ctx, a.t, { hora: 'dia' });
      for (let i = 0; i < 3; i++) { const x = 300 + i * 600 + Math.sin(a.t * 1.2 + i * 2) * 140; ctx.save(); ctx.translate(x, 990); K.R(ctx, -170, -200, 340, 180, 14, '#f4f4f8', 7); K.R(ctx, 110, -160, 90, 140, 10, '#f4f4f8', 7); circ(ctx, -100, -10, 32, '#222', 6); circ(ctx, 110, -10, 32, '#222', 6); ctx.restore(); K.simbolo(ctx, a, [x, 740], 30, '?', 0.1 + i * 0.1); }
      K.R(ctx, 1640, 200, 24, 700, 4, '#8a8d99', 5); for (let j = 0; j < 3; j++) K.R(ctx, 1600, 230 + j * 60, 104, 30, 4, '#c9ccd6', 4); K.prop(ctx, 'reloj_digital', 1650, 120, 0.4, a.t); }, { de: 1.1, a: 1, foco: [960, 700] });
    K.etiqueta(ctx, a, 'TOWER TIME: DRIFTING', 1240, 380, { size: 42, p0: 0.4 }); K.luz(ctx, a, { tono: 'dia' }); },
  // 27 — Es un peligro silencioso: nada explota, todo se va desajustando (ondas suaves)
  27: (ctx, a, K) => {
    dato(K, ctx, '#0f0f1f', '#1f1f3a', '#9a8bff');
    for (let i = 0; i < 5; i++) { ctx.save(); ctx.strokeStyle = ['#7dffb0', '#4d96ff', '#ffd93d', '#ff9ff3', '#ff6b6b'][i]; ctx.lineWidth = 6; ctx.beginPath(); for (let x = 160; x < 1760; x += 8) { const drift = ph(a, 0.1, 0.9) * (i + 1) * 0.4; const y = 300 + i * 120 + Math.sin(x * 0.01 + a.t * 2 + drift * (x - 160) * 0.006) * 30; x === 160 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); ctx.restore(); }
    big(ctx, 'QUIET DANGER', W / 2, 140, 110, '#fff', { k: ph(a, 0.05, 0.2) }); K.rotulo(ctx, a, 'Nothing explodes. Everything slips.', W / 2, 990, { size: 42, p0: 0.5 }); },
  // 28 — Tu mapa te sitúa en medio de un campo: el punto azul miente (sobre el hombro)
  28: (ctx, a, K) => { const { YOU } = cast(K);
    SET.avenida(ctx, a.t, { hora: 'atardecer' });
    movil(K, ctx, 960, 520, 1.45, { col: '#e8efe0' }); ctx.save(); ctx.beginPath(); ctx.rect(960 - 188, 520 - 384, 376, 768); ctx.clip(); ctx.fillStyle = '#9fd07a'; ctx.fillRect(700, 100, 520, 900); for (let i = 0; i < 8; i++) ln(ctx, [[760, 160 + i * 100], [1180, 180 + i * 100]], 'rgba(90,130,60,0.5)', 6); K.prop(ctx, 'vaca', 1060, 330, 0.4, a.t); ctx.restore();
    circ(ctx, 960, 560, 26 + Math.sin(a.t * 4) * 4, '#4d96ff', 6, '#fff');
    K.hombro(ctx, a, YOU, { lado: -1 }); K.etiqueta(ctx, a, 'YOU ARE HERE?!', 1300, 300, { size: 48, p0: 0.3 }); },
  // 29 — La siguiente amenaza viaja por los cables bajo tus pies (corte del suelo)
  29: (ctx, a, K) => { const { YOU } = cast(K);
    sky(ctx, '#3a4a6a', '#6a7a9a', 520); K.R(ctx, 0, 520, W, 560, 0, '#6a4a32', 7);
    for (let i = 0; i < 3; i++) { const y = 680 + i * 120; K.R(ctx, 0, y, W, 30, 15, ['#3a3f53', '#e63946', '#ffd93d'][i], 5); const px = (a.t * 700 + i * 400) % W; K.radial(ctx, px, y + 15, 80, '#bfe6ff', 0.8); }
    D(K, ctx, a, YOU, 960, 520, 0.75, { pose: 'quieto', mood: 'duda', mira: 0 });
    K.etiqueta(ctx, a, 'UNDER YOUR FEET', 300, 1000, { size: 48, p0: 0.3 }); },
});

// ===================== CAPÍTULO 4 · THE LIGHTS JUST STOP =====================
Object.assign(A, {
  // 30 — Hora 4: el suelo empuja corriente eléctrica (corte del terreno con flechas)
  30: (ctx, a, K) => {
    sky(ctx, '#0a0d22', '#1a1f3a', 400); aurora(ctx, a, 0, 400, ['#4dffb0', '#ff4d8a'], 0.6);
    const g = ctx.createLinearGradient(0, 400, 0, H); g.addColorStop(0, '#6a4a32'); g.addColorStop(1, '#2a1c10'); ctx.fillStyle = g; ctx.fillRect(0, 400, W, H - 400);
    for (let i = 0; i < 12; i++) { const x = ((a.t * 260 + i * 170) % (W + 200)) - 100, y = 520 + (i % 4) * 120; ln(ctx, [[x, y], [x + 120, y]], '#ffd93d', 10); K.P(ctx, [[x + 140, y], [x + 110, y - 18], [x + 110, y + 18]], '#ffd93d', 0); }
    reloj(K, ctx, a, 'HOUR 4'); K.etiqueta(ctx, a, 'THE GROUND PUSHES CURRENT', 1200, 360, { size: 46, p0: 0.2 }); },
  // 31 — Las corrientes suben a las líneas de alta tensión, de cientos de millas
  31: (ctx, a, K) => {
    K.camara(ctx, a, () => { sky(ctx, '#ff9a5a', '#7a3b5a'); SET.granja(ctx, a.t, { hora: 'atardecer' });
      for (let i = 0; i < 5; i++) { const x = 150 + i * 410, s = 1 - i * 0.12; ln(ctx, [[x - 90 * s, 900], [x, 260 + i * 40], [x + 90 * s, 900]], '#3a3f53', 10); ln(ctx, [[x - 140 * s, 320 + i * 40], [x + 140 * s, 320 + i * 40]], '#3a3f53', 10); }
      ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 5; for (let k = -1; k <= 1; k += 2) { ctx.beginPath(); for (let i = 0; i < 4; i++) { const x0 = 150 + i * 410 + k * 120, x1 = x0 + 410, y0 = 320 + i * 40, y1 = 360 + i * 40; ctx.moveTo(x0, y0); ctx.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + 60, x1, y1); } ctx.stroke(); } ctx.restore();
      const px = (a.t * 500) % W; K.radial(ctx, px, 360, 120, '#bfe6ff', 0.9); }, { de: 1, a: 1.1, foco: [960, 500] });
    K.etiqueta(ctx, a, 'HUNDREDS OF MILES', 1300, 160, { size: 46, p0: 0.2 }); K.luz(ctx, a, { tono: 'atardecer' }); },
  // 32 — Transformadores del tamaño de un camión (comparación con persona)
  32: (ctx, a, K) => { const { PHYS } = cast(K);
    K.camara(ctx, a, () => { sky(ctx, '#bcd4f6', '#e8f1ff'); suelo(ctx, 920, '#a9a9a9', '#7a7a7a');
      for (let i = 0; i < 8; i++) ln(ctx, [[100 + i * 230, 920], [100 + i * 230, 300]], 'rgba(90,90,110,0.4)', 4);
      transfo(K, ctx, 1100, 920, 1.25, 0, a.t); D(K, ctx, a, PHYS, 520, 930, 0.95, { pose: 'senala', mood: 'serio', mira: 1 }); }, { de: 1.1, a: 1, foco: [900, 600] });
    K.etiqueta(ctx, a, 'TRUCK-SIZED TRANSFORMER', 1150, 160, { size: 46, p0: 0.2 }); K.luz(ctx, a, { tono: 'dia' }); },
  // 33 — Se sobrecalientan: el aceite hierve, los relés saltan (primer plano del transformador)
  33: (ctx, a, K) => {
    sky(ctx, '#2a0f0a', '#4a1a10');
    transfo(K, ctx, 960, 1200, 2.2, ph(a, 0.05, 0.6), a.t);
    for (let i = 0; i < 14; i++) { const t2 = (a.t * 0.8 + hs(i)) % 1; circ(ctx, 700 + hs(i * 3) * 520, 700 - t2 * 400, 10 + hs(i) * 14, 'rgba(255,200,120,0.7)', 3); }
    if (fase(a) > 0.6) { K.starBurst(ctx, 1500, 260, 120, '#ffd93d', 0.9); K.text(ctx, 'CLACK!', 1500, 260, { size: 80, color: '#fff' }); }
    K.contador(ctx, a, `${Math.round(80 + ph(a, 0, 0.8) * 120)}°C`, 300, 120, { icono: null, size: 50, col: '#e63946' }); K.etiqueta(ctx, a, 'OIL BOILS', 240, 900, { size: 50, p0: 0.3 }); },
  // 34 — Marzo de 1989: Quebec a oscuras en 90 segundos (cuenta atrás)
  34: (ctx, a, K) => {
    const k = ph(a, 0.05, 0.85); sky(ctx, '#0a0d22', '#1a2040', 700); aurora(ctx, a, 0, 600, ['#4dffb0', '#9a6bff'], 0.5); suelo(ctx, 900, '#d9e4ee', '#aebccc');
    for (let i = 0; i < 16; i++) { const w = 90 + hs(i) * 60, h = 160 + hs(i * 5) * 320, x = i * 122; K.R(ctx, x, 900 - h, w, h, 4, '#2f3a55', 5); for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) { const on = hs(i * 13 + r * 3 + c) > k; K.R(ctx, x + 14 + c * 40, 900 - h + 20 + r * 50, 26, 30, 3, on ? '#ffd76a' : '#151a2a', 0); } }
    big(ctx, `${Math.max(0, 90 - Math.round(k * 90))} SEC`, 1600, 160, 110, '#fff'); K.etiqueta(ctx, a, 'QUEBEC, MARCH 1989', 160, 120, { size: 46, rot: -0.03 }); },
  // 35 — 6 millones de personas, 9 horas sin luz (pictograma)
  35: (ctx, a, K) => {
    dato(K, ctx, '#0c1020', '#1a2040', '#6fa0ff');
    const k = ph(a, 0.05, 0.6); for (let i = 0; i < 60; i++) { const c = i % 12, r = Math.floor(i / 12); if (i / 60 > k) break; ctx.save(); ctx.translate(380 + c * 100, 300 + r * 110); circ(ctx, 0, -30, 18, '#ffd9b8', 4); K.R(ctx, -20, -10, 40, 50, 12, '#4d96ff', 4); ctx.restore(); }
    big(ctx, '6,000,000 PEOPLE', W / 2, 900, 100, '#fff', { k: ph(a, 0.4, 0.55) }); K.contador(ctx, a, '9 HOURS DARK', W / 2, 140, { icono: 'reloj', size: 48, p0: 0.6 }); },
  // 36 — Una tormenta tipo Carrington: de costa a costa, durante semanas (mapa EE. UU. que se apaga)
  36: (ctx, a, K) => {
    sky(ctx, '#03040c', '#0a0d22');
    ctx.save(); ctx.fillStyle = '#121a2a'; ctx.strokeStyle = '#2a3a55'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(220, 240); ctx.lineTo(1650, 220); ctx.lineTo(1720, 400); ctx.lineTo(1560, 620); ctx.lineTo(1500, 840); ctx.lineTo(1380, 700); ctx.lineTo(1000, 820); ctx.lineTo(760, 900); ctx.lineTo(560, 720); ctx.lineTo(300, 640); ctx.lineTo(200, 420); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.clip();
    const k = ph(a, 0.1, 0.8); for (let i = 0; i < 400; i++) { const x = 200 + hs(i) * 1520, y = 220 + hs(i * 7) * 680; if (x / W < k * 1.1 - 0.05) continue; ctx.fillStyle = '#ffd76a'; ctx.globalAlpha = 0.9; ctx.fillRect(x, y, 5, 5); } ctx.restore();
    K.etiqueta(ctx, a, 'COAST TO COAST', 200, 140, { size: 50, p0: 0.2 }); K.cartel(ctx, a, 'FOR WEEKS', 1550, 980, { tipo: 'rojo', size: 54, p0: 0.6 }); },
  // 37 — Hechos a medida: más de un año por pieza (taller con una sola grúa)
  37: (ctx, a, K) => { const { PHYS } = cast(K);
    K.camara(ctx, a, () => { sky(ctx, '#c9ccd6', '#a9adbb'); suelo(ctx, 920, '#8a8d99', '#5a5f73');
      K.R(ctx, 100, 120, 1720, 30, 4, '#e6b800', 6); ln(ctx, [[1100, 150], [1100, 400]], INK, 5); transfo(K, ctx, 1100, 880, 0.9, 0, a.t);
      D(K, ctx, a, PHYS, 520, 930, 0.95, { pose: 'piensa', mood: 'worried', mira: 1 }); }, { de: 1, a: 1.1, foco: [900, 600] });
    K.contador(ctx, a, 'BUILD TIME: 1+ YEAR', 1400, 92, { icono: 'reloj', size: 44, p0: 0.2 }); K.cartel(ctx, a, 'CUSTOM BUILT', 400, 260, { tipo: 'papel', size: 48, p0: 0.4 }); K.luz(ctx, a, { tono: 'interior' }); },
  // 38 — Esa noche, Ohio a oscuras: estrellas sobre la ciudad por primera vez
  38: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { sky(ctx, '#02030c', '#0a0d22', 900); estrellas(ctx, a, 400, 900, 21);
      ctx.save(); ctx.globalAlpha = 0.25; ctx.fillStyle = '#c9d6ff'; ctx.beginPath(); ctx.ellipse(1100, 400, 900, 80, -0.3, 0, 7); ctx.fill(); ctx.restore();
      for (let i = 0; i < 12; i++) { const w = 140 + hs(i + 2) * 90, h = 220 + hs(i * 5 + 2) * 380; K.R(ctx, i * 165 - 20, 900 - h, w, h, 4, '#10131f', 6); }
      suelo(ctx, 900, '#141824', '#090b12'); D(K, ctx, a, YOU, 960, 1060, 0.9, { pose: 'quieto', mood: 'sorpresa', espalda: true }); }, { de: 1, a: 1.12, foco: [960, 400] });
    K.etiqueta(ctx, a, 'STARS OVER OHIO', 300, 140, { size: 48, p0: 0.3 }); },
  // 39 — Abres el grifo para un vaso de agua… y nada
  39: (ctx, a, K) => {
    sky(ctx, '#2a2f3a', '#3a404c'); K.R(ctx, 0, 700, W, 380, 0, '#5a5f73', 7);
    ctx.save(); ctx.translate(900, 200); K.R(ctx, -40, 0, 80, 240, 20, '#c9ccd6', 8); K.R(ctx, -40, 200, 320, 70, 30, '#c9ccd6', 8); K.R(ctx, 220, 240, 60, 80, 10, '#c9ccd6', 7); ctx.rotate(ph(a, 0.05, 0.3) * 1.2); K.R(ctx, -120, -30, 240, 40, 20, '#e63946', 6); ctx.restore();
    ctx.save(); ctx.translate(1150, 820); K.P(ctx, [[-90, -260], [90, -260], [70, 0], [-70, 0]], 'rgba(200,230,255,0.4)', 8); ctx.restore();
    if (fase(a) > 0.5) K.text(ctx, '...nothing', 1500, 420, { size: 64, color: '#fff' }); K.luz(ctx, a, { tono: 'noche', foco: [1100, 500] }); },
});

// ===================== CAPÍTULO 5 · DAYS ONE TO THREE =====================
Object.assign(A, {
  // 40 — Día 1: el grifo tose (gotas y escupitajo)
  40: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { SET.cocina(ctx, a.t, { hora: 'dia' });
      const y = D(K, ctx, a, YOU, 760, 1000, 1.05, { pose: 'sostiene', mood: 'duda', mira: 1 });
      for (let i = 0; i < 3; i++) { const t2 = (a.t * 1.5 + i * 0.33) % 1; K.prop(ctx, 'gota', 1050, 560 + t2 * 200, 0.2, a.t); }
      if (Math.sin(a.t * 4) > 0.6) K.text(ctx, '*cough*', 1200, 460, { size: 56, color: '#4d96ff' }); }, { de: 1.05, a: 1.15, foco: [960, 560] });
    reloj(K, ctx, a, 'DAY 1'); K.luz(ctx, a, { tono: 'dia' }); },
  // 41 — Bombas eléctricas suben el agua a las torres (esquema)
  41: (ctx, a, K) => {
    dato(K, ctx, '#0a1a2a', '#12305a', '#5ad0ff');
    K.R(ctx, 260, 640, 260, 200, 20, '#8a8d99', 7); K.text(ctx, 'PUMP', 390, 600, { size: 44, color: '#fff' }); K.prop(ctx, 'rayo', 390, 820, 0.4, a.t);
    const k = 1 - ph(a, 0.3, 0.9); ln(ctx, [[520, 740], [1300, 740], [1300, 480]], '#4d96ff', 26); for (let i = 0; i < 8; i++) { const u = ((a.t * k * 0.8 + i / 8) % 1); circ(ctx, 520 + u * 780, 740, 10, k > 0.1 ? '#bfe6ff' : 'rgba(0,0,0,0)', 0); }
    torreAgua(K, ctx, 1300, 1000, 1.0, 0.3 + k * 0.6); big(ctx, 'NO POWER = NO PRESSURE', W / 2, 140, 76, '#fff', { k: ph(a, 0.5, 0.6) }); },
  // 42 — Los pisos 10 se quedan secos primero (edificio en corte)
  42: (ctx, a, K) => {
    sky(ctx, '#bcd4f6', '#e8f1ff'); suelo(ctx, 980, '#8a9a7a', '#5a6a4a');
    const k = ph(a, 0.1, 0.9); for (let f = 0; f < 10; f++) { const y = 980 - (f + 1) * 86, dry = f >= 10 - Math.floor(k * 7); K.R(ctx, 660, y, 600, 86, 0, dry ? '#e6c9a0' : '#cfe6ff', 5); K.text(ctx, `${f + 1}`, 620, y + 46, { size: 34, color: INK }); if (!dry) K.prop(ctx, 'gota', 1200, y + 70, 0.15, a.t); else K.text(ctx, 'DRY', 1180, y + 46, { size: 30, color: '#e63946' }); }
    K.etiqueta(ctx, a, 'TOP FLOORS FIRST', 1340, 200, { size: 48, p0: 0.2 }); },
  // 43 — Gasolineras: surtidores muertos y una fila de coches
  43: (ctx, a, K) => {
    K.camara(ctx, a, () => { sky(ctx, '#ffd0a0', '#ffe9c9'); suelo(ctx, 900, '#9a9aa8', '#6a6a78');
      K.R(ctx, 260, 360, 1100, 60, 8, '#e63946', 7); for (const x of [400, 1200]) K.R(ctx, x - 20, 420, 40, 480, 4, '#c9ccd6', 5);
      surtidor(K, ctx, 600, 900, 1, 1); surtidor(K, ctx, 1000, 900, 1, 1);
      for (let i = 0; i < 6; i++) coche(K, ctx, 1450 + i * 300 - (a.t * 20) % 40, 1020, 0.8, ['#4d96ff', '#ffd93d', '#6bcb77', '#f15bb5', '#ff9f43', '#8a8d99'][i], -1); }, { de: 1, a: 1.1, foco: [960, 700] });
    K.cartel(ctx, a, 'PUMPS DOWN', 820, 230, { tipo: 'rojo', size: 54, p0: 0.2 }); K.luz(ctx, a, { tono: 'dia' }); },
  // 44 — Sin electricidad no hay gasolina, aunque los tanques estén llenos (dato)
  44: (ctx, a, K) => {
    dato(K, ctx, '#1a1008', '#3a2210', '#ffb347');
    K.R(ctx, 260, 300, 600, 500, 40, '#5a5f73', 8); ctx.save(); ctx.beginPath(); ctx.rect(268, 308, 584, 484); ctx.clip(); K.R(ctx, 268, 360, 584, 432, 0, '#c97a2a', 0); ctx.restore(); K.text(ctx, 'TANK: FULL', 560, 860, { size: 48, color: '#fff' });
    ln(ctx, [[860, 550], [1100, 550]], '#fff', 10); ctx.save(); ctx.translate(980, 550); ln(ctx, [[-60, -60], [60, 60]], '#ff3b4e', 14); ln(ctx, [[60, -60], [-60, 60]], '#ff3b4e', 14); ctx.restore();
    surtidor(K, ctx, 1400, 800, 1.3, 1); K.prop(ctx, 'rayo', 1400, 360, 0.6, a.t); ln(ctx, [[1300, 260], [1500, 380]], '#ff3b4e', 12);
    big(ctx, 'FULL TANKS. NO GAS.', W / 2, 140, 90, '#fff', { k: ph(a, 0.4, 0.55) }); },
  // 45 — La tienda abre con las puertas trabadas; cajas apagadas
  45: (ctx, a, K) => { const { CASH } = cast(K);
    K.camara(ctx, a, () => { tienda(K, ctx, a, 0); caja(K, ctx, 760, 1000, 1, '#151520', ''); caja(K, ctx, 1400, 1000, 1, '#151520', '');
      D(K, ctx, a, CASH, 1080, 960, 0.9, { pose: 'encoge', mood: 'worried' });
      K.R(ctx, 0, 300, 160, 700, 6, 'rgba(200,230,255,0.4)', 7); K.R(ctx, 170, 860, 40, 80, 6, '#c98b4a', 4); K.radial(ctx, 80, 640, 300, '#fff', 0.4); }, { de: 1, a: 1.1, foco: [960, 640] });
    K.etiqueta(ctx, a, 'DOORS PROPPED OPEN', 400, 280, { size: 44, p0: 0.2 }); K.luz(ctx, a, { tono: 'noche', foco: [200, 600] }); },
  // 46 — Pagas con tarjeta: rechazada dos veces (detalle del datáfono)
  46: (ctx, a, K) => {
    sky(ctx, '#2a2838', '#3a3648');
    ctx.save(); ctx.translate(W / 2, 560); K.R(ctx, -260, -380, 520, 760, 50, '#22202c', 9); K.R(ctx, -210, -320, 420, 260, 16, '#3a0f14', 5);
    ctx.fillStyle = '#ff3b4e'; ctx.font = '900 54px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(fase(a) < 0.5 ? 'DECLINED' : 'DECLINED x2', 0, -190); for (let i = 0; i < 12; i++) K.R(ctx, -170 + (i % 3) * 120, -10 + Math.floor(i / 3) * 90, 100, 70, 10, '#5a5f73', 4); ctx.restore();
    const k = (a.t * 1.2) % 1; ctx.save(); ctx.translate(lerpN(1500, 1200, sm(Math.min(1, k * 2))), 300); ctx.rotate(-0.3); K.R(ctx, -160, -100, 320, 200, 18, '#4d96ff', 7); K.R(ctx, -120, -50, 70, 50, 8, '#ffd93d', 4); ctx.restore(); },
  // 47 — El cajero automático también está muerto: el efectivo manda
  47: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { SET.calle(ctx, a.t, { hora: 'dia' }); ctx.save(); ctx.fillStyle = 'rgba(30,30,50,0.25)'; ctx.fillRect(0, 0, W, H); ctx.restore();
      cajero(K, ctx, 1200, 1000, 1, 1); D(K, ctx, a, YOU, 760, 1010, 1.0, { pose: 'brazos', mood: 'enfadado', mira: 1 }); }, { de: 1, a: 1.1, foco: [1000, 600] });
    K.cartel(ctx, a, 'CASH IS KING', 1500, 220, { tipo: 'amarillo', size: 60, p0: 0.45, rot: 0.05 }); K.prop(ctx, 'corona', 1500, 120, 0.01, a.t); K.luz(ctx, a, { tono: 'dia' }); },
  // 48 — Todos se registran los bolsillos (fila de gente vaciando bolsillos)
  48: (ctx, a, K) => {
    K.camara(ctx, a, () => { tienda(K, ctx, a, 0);
      K.multitud(ctx, a, { n: 6, x0: 200, x1: 1720, gy: 1010, esc: 0.95, filas: 1, reaccion: 'encoge', seed: 'l32-bolsillos', mood: 'worried' });
      for (let i = 0; i < 6; i++) { const x = 200 + i * 300, b = Math.sin(a.t * 4 + i) * 10; K.text(ctx, ['$5', '$0', '$12', '¢75', '$1', '$20'][i], x, 520 + b, { size: 46, color: '#ffd93d' }); } }, { de: 1, a: 1.08, foco: [960, 640] });
    K.etiqueta(ctx, a, 'EVERYONE CHECKS THEIR POCKETS', 560, 260, { size: 44, p0: 0.2 }); K.luz(ctx, a, { tono: 'noche' }); },
  // 49 — Camiones y almacenes parados: no hay reposición
  49: (ctx, a, K) => {
    K.camara(ctx, a, () => { sky(ctx, '#9aa8b8', '#c9d2da'); suelo(ctx, 900, '#7a7a88', '#5a5a68');
      K.R(ctx, 860, 300, 1000, 600, 6, '#c9ccd6', 8); for (let i = 0; i < 4; i++) K.R(ctx, 920 + i * 240, 600, 200, 300, 4, '#8a8d99', 6);
      for (let i = 0; i < 3; i++) { ctx.save(); ctx.translate(200 + i * 260, 900); K.R(ctx, -110, -260, 220, 240, 8, '#f4f4f8', 7); K.R(ctx, 110, -180, 90, 160, 8, '#e63946', 7); circ(ctx, -60, -10, 30, '#222', 6); circ(ctx, 150, -10, 30, '#222', 6); ctx.restore(); } }, { de: 1.1, a: 1, foco: [960, 600] });
    K.cartel(ctx, a, 'NO RESTOCK', 1360, 200, { tipo: 'rojo', size: 54, p0: 0.3 }); K.etiqueta(ctx, a, 'TRUCKS: PARKED', 200, 400, { size: 44, p0: 0.15 }); K.luz(ctx, a, { tono: 'dia' }); },
  // 50 — Al final del día 2, los móviles mueren (batería que baja)
  50: (ctx, a, K) => {
    dato(K, ctx, '#1a0a0a', '#3a1010', '#ff6b6b');
    const b = Math.max(0, 0.3 - ph(a, 0.05, 0.85) * 0.3); for (let i = 0; i < 5; i++) movil(K, ctx, 300 + i * 330, 540, 0.75, { bat: b * (1 - i * 0.15), col: b > 0.02 ? '#f4f7ff' : '#0b0b12', txt: b > 0.02 ? `${Math.round(b * 100 * (1 - i * 0.15))}%` : '' });
    reloj(K, ctx, a, 'END OF DAY 2'); big(ctx, 'PHONES DIE', W / 2, 960, 100, '#ff3b4e', { k: ph(a, 0.7, 0.85) }); },
  // 51 — Día 3: leche, pan y carne, agotados (estanterías vacías)
  51: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { sky(ctx, '#4a4658', '#2a2838'); suelo(ctx, 860, '#3a3648', '#22202c');
      for (let i = 0; i < 4; i++) { const x = 80 + i * 470; K.R(ctx, x, 260, 400, 600, 8, '#8a8d99', 6); for (let j = 0; j < 4; j++) K.R(ctx, x, 260 + j * 150, 400, 14, 3, '#5a5f73', 3); }
      ['MILK', 'BREAD', 'MEAT'].forEach((t, i) => K.cartel(ctx, a, `${t}: 0`, 280 + i * 600, 200, { tipo: 'papel', size: 40, p0: 0.1 + i * 0.12, colgado: true }));
      D(K, ctx, a, YOU, 960, 1020, 1.0, { pose: 'encoge', mood: 'worried' }); }, { de: 1, a: 1.12, foco: [960, 600] });
    reloj(K, ctx, a, 'DAY 3'); K.luz(ctx, a, { tono: 'noche', foco: [960, 600] }); },
  // 52 — La nevera gotea en el suelo de la cocina
  52: (ctx, a, K) => {
    sky(ctx, '#3a3f4c', '#2a2f3a'); suelo(ctx, 940, '#c9c2b0', '#a9a290');
    nevera(K, ctx, 960, 940, 1.1, 0, a.t);
    ctx.save(); ctx.globalAlpha = 0.6; ctx.fillStyle = '#9fd0ff'; ctx.beginPath(); ctx.ellipse(960, 990, 260 + ph(a, 0, 1) * 200, 40, 0, 0, 7); ctx.fill(); ctx.restore();
    K.text(ctx, 'drip... drip...', 1450, 500, { size: 54, color: '#bfe6ff' }); K.luz(ctx, a, { tono: 'noche', foco: [960, 600] }); },
  // 53 — Los vecinos intercambian despensas y cuentan cada lata
  53: (ctx, a, K) => { const { YOU, NEIGH } = cast(K);
    K.camara(ctx, a, () => { SET.suburbio(ctx, a.t, { hora: 'atardecer' });
      K.R(ctx, 760, 820, 400, 30, 6, '#8a5a3c', 6); for (let i = 0; i < 6; i++) K.R(ctx, 790 + i * 60, 740, 46, 80, 8, ['#e63946', '#ffd93d', '#6bcb77'][i % 3], 4);
      D(K, ctx, a, YOU, 560, 1010, 1.0, { pose: 'sostiene', mood: 'serio', mira: 1 }); D(K, ctx, a, NEIGH, 1360, 1010, 1.0, { pose: 'habla', mood: 'worried', mira: -1, habla: true }); }, { de: 1, a: 1.1, foco: [960, 640] });
    K.contador(ctx, a, `CANS: ${6 - Math.floor(fase(a) * 3)}`, 960, 600, { icono: null, size: 46 }); K.globo(ctx, a, 'Beans for rice?', 1400, 380, { tx: 1360, ty: 620, p0: 0.2, size: 40 }); K.luz(ctx, a, { tono: 'atardecer' }); },
  // 54 — Tienes 40 dólares en la cartera (detalle de la cartera)
  54: (ctx, a, K) => {
    sky(ctx, '#2a1d12', '#3a2a1c'); K.radial(ctx, W / 2, 540, 700, '#ffd27a', 0.35);
    ctx.save(); ctx.translate(W / 2, 560); K.R(ctx, -460, -260, 920, 520, 40, '#6b3a1e', 10); K.R(ctx, -420, -220, 840, 200, 20, '#4a2812', 6); ctx.restore();
    for (let i = 0; i < 2; i++) { const k = sm(ph(a, 0.1 + i * 0.15, 0.4 + i * 0.15)); ctx.save(); ctx.translate(W / 2 - 120 + i * 240, lerpN(460, 280, k)); ctx.rotate((i - 0.5) * 0.2); K.R(ctx, -170, -80, 340, 160, 10, '#9ed29e', 7); ctx.fillStyle = INK; ctx.font = '60px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('$20', 0, 0); ctx.restore(); }
    big(ctx, '$40', W / 2, 950, 150, '#ffd93d', { k: ph(a, 0.6, 0.75) }); },
});

// ===================== CAPÍTULO 6 · WEEK ONE AND BEYOND =====================
Object.assign(A, {
  // 55 — Los hospitales tiran de generadores diésel
  55: (ctx, a, K) => { const { NURSE } = cast(K);
    K.camara(ctx, a, () => { sky(ctx, '#2a3448', '#4a5a78'); suelo(ctx, 920, '#5a5f73', '#3a3f53');
      K.R(ctx, 160, 220, 1000, 700, 6, '#e9eef2', 8); ctx.save(); ctx.translate(660, 340); K.R(ctx, -60, -60, 120, 120, 10, '#e63946', 0); K.R(ctx, -20, -50, 40, 100, 0, '#fff', 0); K.R(ctx, -50, -20, 100, 40, 0, '#fff', 0); ctx.restore();
      for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) K.R(ctx, 220 + c * 190, 460 + r * 140, 120, 90, 6, Math.sin(a.t * 6 + r + c) > 0.3 ? '#ffd76a' : '#7a7f93', 4);
      K.R(ctx, 1300, 720, 440, 200, 16, '#ffd93d', 8); K.smoke(ctx, 1700, 700, a.t, 6); K.text(ctx, 'DIESEL', 1520, 820, { size: 48, color: INK });
      D(K, ctx, a, NURSE, 1250, 1020, 0.9, { pose: 'senala', mood: 'worried', mira: 1 }); }, { de: 1, a: 1.1, foco: [960, 600] });
    reloj(K, ctx, a, 'WEEK 1'); K.luz(ctx, a, { tono: 'noche' }); },
  // 56 — Combustible ↔ bombas ↔ electricidad: un círculo vicioso
  56: (ctx, a, K) => {
    dato(K, ctx, '#1a0f0a', '#3a1a10', '#ff7a2a');
    const cx = W / 2, cy = 560, R = 300, items = [['FUEL', 'fuego'], ['PUMPS', 'gota'], ['POWER', 'rayo']];
    ctx.save(); ctx.strokeStyle = '#ffb347'; ctx.lineWidth = 10; ctx.setLineDash([30, 20]); ctx.lineDashOffset = -a.t * 80; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke(); ctx.restore();
    items.forEach(([t, p], i) => { const an = -Math.PI / 2 + i * Math.PI * 2 / 3, x = cx + Math.cos(an) * R, y = cy + Math.sin(an) * R; circ(ctx, x, y, 110, '#2a1a10', 8, '#ffb347'); K.prop(ctx, p, x, y + 40, 0.5, a.t); K.text(ctx, t, x, y + 160, { size: 44, color: '#fff' }); });
    big(ctx, 'EACH NEEDS THE OTHER', W / 2, 1000, 70, '#ffd93d', { k: ph(a, 0.4, 0.55) }); },
  // 57 — Respiradores, diálisis, medicinas en frío (planta del hospital)
  57: (ctx, a, K) => { const { NURSE } = cast(K);
    K.camara(ctx, a, () => { sky(ctx, '#dfe9ef', '#c4d4de'); suelo(ctx, 900, '#b9c6cf', '#9fb0bb');
      K.R(ctx, 260, 660, 600, 120, 20, '#ffffff', 7); K.R(ctx, 220, 600, 80, 200, 10, '#c9ccd6', 6);
      K.R(ctx, 980, 440, 220, 460, 14, '#c9ccd6', 7); K.R(ctx, 1000, 470, 180, 120, 8, '#151520', 4); ln(ctx, [[1010, 540], [1050, 540], [1070, 500], [1090, 580], [1110, 540], [1170, 540]], '#7dffb0', 5);
      K.R(ctx, 1400, 480, 260, 420, 14, '#e9eef2', 7); K.text(ctx, 'MEDS 4°C', 1530, 560, { size: 34, color: '#2a6aa8' });
      D(K, ctx, a, NURSE, 820, 960, 0.95, { pose: 'sostiene', mood: 'worried', mira: 1 }); }, { de: 1, a: 1.08, foco: [960, 600] });
    ['VENTILATORS', 'DIALYSIS', 'MEDICINE'].forEach((t, i) => K.etiqueta(ctx, a, t, 260 + i * 600, 250, { size: 40, p0: 0.15 + i * 0.15, rot: 0 })); K.luz(ctx, a, { tono: 'interior' }); },
  // 58 — Un monitor parpadea y se apaga (primer plano)
  58: (ctx, a, K) => {
    sky(ctx, '#0b0b12', '#151520');
    const off = fase(a) > 0.6, fl = !off && fase(a) > 0.35 && Math.sin(a.t * 40) > 0;
    ctx.save(); ctx.translate(W / 2, 520); K.R(ctx, -620, -360, 1240, 720, 30, '#3a3f53', 12); K.R(ctx, -570, -310, 1140, 620, 12, off || fl ? '#05050a' : '#0a1a10', 5);
    if (!off && !fl) { ctx.strokeStyle = '#7dffb0'; ctx.lineWidth = 8; ctx.beginPath(); for (let x = -540; x < 540; x += 6) { const u = (x + 540 + a.t * 400) % 300, y = u > 120 && u < 135 ? -150 : u > 135 && u < 150 ? 100 : 0; x === -540 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); ctx.fillStyle = '#7dffb0'; ctx.font = '70px Anton'; ctx.fillText('72', 400, -200); }
    ctx.restore(); if (off) K.rotulo(ctx, a, 'Backup fuel ran out', W / 2, 980, { size: 44, p0: 0.65 }); },
  // 59 — Las depuradoras paran; el agua sucia enferma a la gente
  59: (ctx, a, K) => { const { NEIGH } = cast(K);
    K.camara(ctx, a, () => { sky(ctx, '#8a9aa8', '#b9c6cf'); suelo(ctx, 900, '#7a8a6a', '#5a6a4a');
      for (let i = 0; i < 3; i++) { ctx.save(); ctx.translate(320 + i * 380, 860); ctx.fillStyle = '#6a7a3a'; ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.beginPath(); ctx.ellipse(0, 0, 170, 50, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore(); K.prop(ctx, 'bacteria', 320 + i * 380, 840 + Math.sin(a.t * 2 + i) * 10, 0.3, a.t); }
      const y = D(K, ctx, a, NEIGH, 1500, 1010, 1.0, { pose: 'cansado', mood: 'sad' }); K.mareo(ctx, a, y.cabeza, y.hr); }, { de: 1, a: 1.1, foco: [960, 640] });
    K.cartel(ctx, a, 'WATER PLANT: OFFLINE', 700, 240, { tipo: 'rojo', size: 48, p0: 0.2 }); K.luz(ctx, a, { tono: 'dia' }); },
  // 60 — Lloyd's de Londres, 2013: hasta 2,6 billones de dólares
  60: (ctx, a, K) => {
    dato(K, ctx, '#0f2018', '#1b4030', '#6bff9a');
    const k = ph(a, 0.05, 0.75); for (let i = 0; i < 40 * k; i++) { const c = i % 10, r = Math.floor(i / 10); ctx.save(); ctx.translate(320 + c * 130, 800 - r * 70); K.R(ctx, -55, -30, 110, 60, 8, '#9ed29e', 5); ctx.restore(); }
    big(ctx, `$${(k * 2.6).toFixed(1)} TRILLION`, W / 2, 300, 150, '#ffd93d'); K.etiqueta(ctx, a, "LLOYD'S STUDY, 2013", 260, 120, { size: 44, rot: -0.03 }); },
  // 61 — Más que el peor huracán de la historia (barras)
  61: (ctx, a, K) => {
    dato(K, ctx, '#141428', '#24244a', '#8a9aff');
    const bars = [['WORST HURRICANE', 0.15, '#4d96ff'], ['SOLAR SUPERSTORM', 1, '#ff6b6b']];
    bars.forEach(([t, v, c], i) => { const k = sm(ph(a, 0.1 + i * 0.3, 0.4 + i * 0.3)), h = 640 * v * k, x = 600 + i * 560; K.R(ctx, x - 140, 900 - h, 280, Math.max(2, h), 20, c, 7); K.text(ctx, t, x, 960, { size: 40, color: '#fff' }); });
    K.prop(ctx, 'viento', 600, 760 - 80, 0.5, a.t); K.prop(ctx, 'sol', 1160, 240, 0.6, a.t); },
  // 62 — Las fábricas construyen unos pocos transformadores a la vez (cola de pedidos)
  62: (ctx, a, K) => {
    K.camara(ctx, a, () => { sky(ctx, '#c9ccd6', '#a9adbb'); suelo(ctx, 920, '#8a8d99', '#5a5f73');
      transfo(K, ctx, 400, 900, 0.55, 0, a.t); transfo(K, ctx, 760, 900, 0.55, 0, a.t);
      for (let i = 0; i < 9; i++) { ctx.save(); ctx.translate(1050 + i * 100, 860 - (i % 2) * 20); K.R(ctx, -40, -50, 80, 100, 6, '#fffdf5', 4); ln(ctx, [[-25, -20], [25, -20]], '#555', 4); ln(ctx, [[-25, 0], [25, 0]], '#555', 4); ctx.restore(); } }, { de: 1, a: 1.1, foco: [960, 650] });
    K.contador(ctx, a, 'ORDERS WAITING: 300+', 1400, 92, { icono: 'loop', size: 44 }); K.etiqueta(ctx, a, 'A FEW AT A TIME', 300, 300, { size: 46, p0: 0.2 }); K.luz(ctx, a, { tono: 'interior' }); },
  // 63 — Recuperarse podría llevar meses o años (calendario que pasa hojas)
  63: (ctx, a, K) => {
    sky(ctx, '#1a1430', '#2c2250');
    const m = Math.floor(ph(a, 0, 0.9) * 24), mes = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][m % 12];
    ctx.save(); ctx.translate(W / 2, 520); K.R(ctx, -320, -340, 640, 680, 30, '#fff', 10); K.R(ctx, -320, -340, 640, 160, 30, '#e63946', 10); ctx.fillStyle = '#fff'; ctx.font = '90px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(mes, 0, -260); ctx.fillStyle = INK; ctx.font = '220px Anton'; ctx.fillText(`Y${1 + Math.floor(m / 12)}`, 0, 40); ctx.restore();
    for (let i = 0; i < 5; i++) { const t2 = (a.t * 1.4 + i * 0.2) % 1; ctx.save(); ctx.globalAlpha = 1 - t2; ctx.translate(W / 2 + 200 + t2 * 500, 300 - t2 * 200); ctx.rotate(t2 * 2); K.R(ctx, -80, -60, 160, 120, 8, '#fff', 4); ctx.restore(); }
    big(ctx, 'MONTHS. MAYBE YEARS.', W / 2, 980, 90, '#ffd93d', { k: ph(a, 0.4, 0.55) }); },
  // 64 — «Pero ya estuvo a punto de pasar» (texto sobre pantalla oscura con un ojo que se abre)
  64: (ctx, a, K) => {
    sky(ctx, '#05050a', '#0b0b14'); K.radial(ctx, W / 2, 540, 600 * ph(a, 0.1, 0.6), '#ff7a2a', 0.4);
    big(ctx, 'BUT IT ALMOST', W / 2, 420, 130, '#fff', { k: ph(a, 0.1, 0.3) }); big(ctx, 'ALREADY HAPPENED.', W / 2, 600, 130, '#ff3b4e', { k: ph(a, 0.45, 0.65) }); },
});

// ===================== CAPÍTULO 7 · NINE DAYS =====================
Object.assign(A, {
  // 65 — 23 de julio de 2012: el Sol lanza una erupción tan fuerte como la de Carrington
  65: (ctx, a, K) => {
    sky(ctx, '#02030c', '#0a0d22'); estrellas(ctx, a, 120, 1080, 31);
    sol(K, ctx, a, 760, 540, 360, ph(a, 0.1, 0.4));
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; const k = ph(a, 0.2, 0.9); const g = ctx.createRadialGradient(1100, 540, 50, 1100, 540, 200 + k * 700); g.addColorStop(0, 'rgba(255,170,60,0.8)'); g.addColorStop(1, 'rgba(255,90,30,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(1080, 540); ctx.arc(1080, 540, 200 + k * 700, -0.5, 0.5); ctx.fill(); ctx.restore();
    K.etiqueta(ctx, a, 'JULY 23, 2012', 200, 120, { size: 52, rot: -0.03 }); K.cartel(ctx, a, 'CARRINGTON-CLASS', 1450, 960, { tipo: 'rojo', size: 50, p0: 0.5 }); },
  // 66 — Una ola de plasma de las más rápidas jamás medidas (velocímetro)
  66: (ctx, a, K) => {
    dato(K, ctx, '#1a0a05', '#3a1a08', '#ff9a3a');
    const k = sm(ph(a, 0.05, 0.7)); ctx.save(); ctx.translate(W / 2, 700); ctx.lineWidth = 40; ctx.lineCap = 'round'; ctx.strokeStyle = '#3a2a20'; ctx.beginPath(); ctx.arc(0, 0, 400, Math.PI, 0); ctx.stroke(); ctx.strokeStyle = '#ff6b2a'; ctx.beginPath(); ctx.arc(0, 0, 400, Math.PI, Math.PI + Math.PI * k * 0.97); ctx.stroke(); ctx.rotate(-Math.PI / 2 + Math.PI * (k * 0.97 - 0.5)); ln(ctx, [[0, 0], [0, -340]], '#fff', 14); ctx.restore(); circ(ctx, W / 2, 700, 30, '#fff', 6);
    big(ctx, `${Math.round(k * 2000).toLocaleString('en-US')} MILES / SEC`, W / 2, 880, 90, '#ffd93d'); K.etiqueta(ctx, a, 'AMONG THE FASTEST EVER', 300, 140, { size: 46, p0: 0.4 }); },
  // 67 — Una nave de la NASA lo registra todo desde el espacio (sonda genérica + datos)
  67: (ctx, a, K) => {
    sky(ctx, '#02030c', '#0a0d22'); estrellas(ctx, a, 140, 1080, 41); viento(ctx, a, 0, W, 760, 300, '#ffb347', 90, 800);
    satelite(K, ctx, 760, 400, 1.4, Math.sin(a.t * 0.6) * 0.1);
    K.R(ctx, 1160, 220, 600, 400, 16, 'rgba(10,30,20,0.85)', 6); grafica(ctx, 1200, 580, 520, 300, ph(a, 0.1, 0.8), (u) => u < 0.6 ? 0.1 + Math.random() * 0 + 0.05 * Math.sin(u * 30) : 0.2 + (u - 0.6) * 2, '#7dffb0', 6);
    K.etiqueta(ctx, a, 'SPACECRAFT RECORDING', 1180, 680, { size: 40, p0: 0.2 }); },
  // 68 — La ola cruza la órbita de la Tierra… pero la Tierra no está ahí
  68: (ctx, a, K) => {
    sky(ctx, '#02030c', '#0a0d22'); estrellas(ctx, a, 140, 1080, 51);
    sol(K, ctx, a, 200, 540, 160, 0.3);
    ctx.save(); ctx.strokeStyle = 'rgba(159,200,255,0.5)'; ctx.lineWidth = 4; ctx.setLineDash([14, 12]); ctx.beginPath(); ctx.arc(200, 540, 1100, -0.7, 0.7); ctx.stroke(); ctx.restore();
    const an = -0.45 + 0; tierra(K, ctx, a, 200 + Math.cos(an) * 1100, 540 + Math.sin(an) * 1100, 0.35);
    const k = ph(a, 0.1, 0.8); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,140,50,0.45)'; ctx.beginPath(); ctx.moveTo(200, 540); ctx.arc(200, 540, 300 + k * 1200, 0.05, 0.35); ctx.closePath(); ctx.fill(); ctx.restore();
    ctx.save(); ctx.setLineDash([10, 10]); circ(ctx, 200 + Math.cos(0.2) * 1100, 540 + Math.sin(0.2) * 1100, 70, null, 5, '#ffd93d'); ctx.restore();
    K.etiqueta(ctx, a, 'EARTH WAS HERE... 9 DAYS AGO', 1100, 900, { size: 42, p0: 0.5 }); },
  // 69 — Habíamos pasado justo por ese punto 9 días antes: pura casualidad
  69: (ctx, a, K) => {
    dato(K, ctx, '#140d2a', '#2a1a52', '#c39bff');
    for (let i = 0; i < 10; i++) { const x = 220 + i * 160, k = ph(a, i * 0.07, i * 0.07 + 0.1), hit = i === 9; ctx.save(); ctx.globalAlpha = 0.3 + 0.7 * k; K.R(ctx, x - 65, 360, 130, 160, 14, hit ? '#ff3b4e' : '#fff', 5); ctx.restore(); K.text(ctx, hit ? 'WAVE' : `${i === 0 ? 'EARTH' : ''}`, x, 560, { size: 30, color: '#fff' }); K.text(ctx, `${i}`, x, 450, { size: 60, color: hit ? '#fff' : INK }); }
    big(ctx, 'JUST TIMING.', W / 2, 820, 130, '#ffd93d', { k: ph(a, 0.7, 0.85) }); },
  // 70 — Si hubiera salido nueve días antes: impacto de lleno (simulación)
  70: (ctx, a, K) => {
    sky(ctx, '#02030c', '#0a0d22'); estrellas(ctx, a, 120, 1080, 61);
    const k = ph(a, 0.05, 0.6); viento(ctx, a, 0, lerpN(200, 1500, k), 540, 420, '#ff8a3a', 120, 900);
    tierra(K, ctx, a, 1550, 540, 0.9); if (k >= 1) { K.radial(ctx, 1550, 540, 500, '#ff4d2a', 0.6 + 0.2 * Math.sin(a.t * 10)); K.starBurst(ctx, 1450, 540, 200, '#ffd93d', 0.8); }
    K.etiqueta(ctx, a, 'WHAT IF: 9 DAYS EARLIER', 200, 140, { size: 50 }); big(ctx, 'HEAD-ON', 600, 900, 140, '#ff3b4e', { k: ph(a, 0.6, 0.7) }); },
  // 71 — Un físico: «aún estaríamos recogiendo los pedazos»
  71: (ctx, a, K) => { const { PHYS } = cast(K);
    K.camara(ctx, a, () => { SET.despacho(ctx, a.t, { hora: 'dia' });
      D(K, ctx, a, PHYS, 760, 1600, 2.4, { pose: 'habla', mood: 'serio', mira: 1, habla: true }); }, { de: 1, a: 1.08, foco: [760, 500] });
    K.globo(ctx, a, "We'd still be picking\nup the pieces.", 1380, 380, { tx: 1000, ty: 520, p0: 0.15, size: 52 }); K.etiqueta(ctx, a, 'A SPACE PHYSICIST', 1300, 760, { size: 40, p0: 0.5 }); K.luz(ctx, a, { tono: 'interior' }); },
  // 72 — Nadie se enteró. Todos siguieron haciendo scroll
  72: (ctx, a, K) => {
    K.camara(ctx, a, () => { SET.metro(ctx, a.t, { hora: 'dia' });
      const g = K.reparto('l32-scroll', 5); g.forEach((p, i) => { const x = 240 + i * 360, y = D(K, ctx, a, p, x, 1000, 0.95, { pose: 'sostiene', mood: 'neutral', mira: 1 }); movil(K, ctx, x + 70, y.cabeza[1] + y.hr * 2.4, 0.18, { col: '#bfe6ff' }); }); }, { de: 1, a: 1.08, foco: [960, 600] });
    K.etiqueta(ctx, a, 'NOBODY NOTICED', 760, 180, { size: 56, p0: 0.2 }); K.luz(ctx, a, { tono: 'interior' }); },
  // 73 — ~12% de probabilidad por década (dado de 8 caras / ruleta)
  73: (ctx, a, K) => {
    dato(K, ctx, '#1a0f0a', '#3a1a10', '#ff7a2a');
    ctx.save(); ctx.translate(700, 540); ctx.rotate(a.t * 1.5 * (1 - ph(a, 0.5, 0.9))); for (let i = 0; i < 8; i++) { ctx.fillStyle = i === 0 ? '#ff3b4e' : (i % 2 ? '#3a2a20' : '#5a4030'); ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 340, i * Math.PI / 4, (i + 1) * Math.PI / 4); ctx.closePath(); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.stroke(); } ctx.restore(); K.P(ctx, [[700, 170], [670, 120], [730, 120]], '#fff', 5);
    big(ctx, '~12%', 1400, 440, 220, '#ff3b4e', { k: ph(a, 0.2, 0.35) }); big(ctx, 'EVERY DECADE', 1400, 660, 80, '#fff', { k: ph(a, 0.35, 0.5) }); },
  // 74 — Las compañías eléctricas pueden protegerse (escudo sobre la red)
  74: (ctx, a, K) => { const { PHYS } = cast(K);
    K.camara(ctx, a, () => { sky(ctx, '#bcd4f6', '#e8f1ff'); suelo(ctx, 920, '#a9a9a9', '#7a7a7a');
      transfo(K, ctx, 1100, 920, 0.95, 0, a.t);
      const k = ph(a, 0.2, 0.6); ctx.save(); ctx.globalAlpha = 0.5 * k; ctx.fillStyle = '#7dd3ff'; ctx.beginPath(); ctx.ellipse(1100, 920, 420, 600, 0, Math.PI, 0); ctx.fill(); ctx.strokeStyle = '#2a8ad8'; ctx.lineWidth = 10; ctx.stroke(); ctx.restore();
      D(K, ctx, a, PHYS, 460, 940, 0.95, { pose: 'vitorea', mood: 'feliz', mira: 1 }); }, { de: 1, a: 1.08, foco: [900, 600] });
    K.cartel(ctx, a, 'PROTECTION EXISTS', 500, 260, { tipo: 'verde', size: 52, p0: 0.4 }); K.luz(ctx, a, { tono: 'dia' }); },
  // 75 — Los satélites vigilan el Sol cada minuto
  75: (ctx, a, K) => {
    sky(ctx, '#02030c', '#0a0d22'); estrellas(ctx, a, 140, 1080, 71);
    sol(K, ctx, a, 260, 540, 220, 0);
    for (let i = 0; i < 3; i++) { const an = a.t * 0.4 + i * 2.1, x = 1100 + Math.cos(an) * 420, y = 540 + Math.sin(an) * 260; satelite(K, ctx, x, y, 0.5, an); ctx.save(); ctx.globalAlpha = 0.25; ln(ctx, [[x, y], [260, 540]], '#ffd93d', 4); ctx.restore(); }
    K.contador(ctx, a, 'WATCHING: 24/7', 1500, 92, { icono: 'rec', size: 44 }); },
  // 76 — Nueve días de distancia de esa caja de supermercado (tú en la caja, eco del principio)
  76: (ctx, a, K) => { const { YOU, CASH } = cast(K);
    K.camara(ctx, a, () => { tienda(K, ctx, a, 1); caja(K, ctx, 1100, 1000, 1, '#7fe0ff', '$23.40');
      D(K, ctx, a, CASH, 1350, 900, 0.9, { pose: 'sostiene', mood: 'feliz', mira: -1 }); D(K, ctx, a, YOU, 640, 1020, 1.0, { pose: 'sostiene', mood: 'neutral', mira: 1 }); }, { de: 1.15, a: 1.25, foco: [800, 600] });
    const k = ph(a, 0.3, 0.9); ctx.save(); ctx.fillStyle = `rgba(255,90,30,${0.25 * k})`; ctx.fillRect(0, 0, W, H); ctx.restore();
    K.contador(ctx, a, '9 DAYS AWAY', W / 2, 92, { icono: 'reloj', size: 50, p0: 0.2, col: '#e63946' }); K.luz(ctx, a, { tono: 'interior' }); },
  // 77 — Comenta: tienes 40 $ y no hay luz, ¿qué compras primero?
  77: (ctx, a, K) => { const { YOU } = cast(K);
    sky(ctx, '#1c1440', '#352a6a'); K.radial(ctx, W / 2, 500, 900, '#7b6cff', 0.3);
    [['WATER', 'gota'], ['FOOD', 'pizza'], ['FUEL', 'fuego'], ['?', 'regalo']].forEach(([t, p], i) => { const x = 330 + i * 420, k = ph(a, 0.1 + i * 0.1, 0.2 + i * 0.1), bob = Math.sin(a.t * 3 + i) * 8; ctx.save(); ctx.globalAlpha = k; K.R(ctx, x - 170, 300 + bob, 340, 340, 40, ['#4d96ff', '#ff9f43', '#e63946', '#6bcb77'][i], 9); K.prop(ctx, p, x, 520 + bob, 0.6, a.t); ctx.restore(); big(ctx, t, x, 590 + bob, 60, '#fff', { k }); });
    big(ctx, '$40. NO POWER.', W / 2, 160, 100, '#ffd93d'); D(K, ctx, a, YOU, 960, 1100, 0.6, { pose: 'senala', mood: 'feliz' }); K.etiqueta(ctx, a, 'COMMENT BELOW', 1380, 960, { size: 44, p0: 0.5 }); },
  // 78 — Próximo vídeo: ¿y si dejaras de dormir?
  78: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { SET.dormitorio(ctx, a.t, { hora: 'noche' });
      const y = D(K, ctx, a, YOU, 900, 1010, 1.05, { pose: 'cansado', mood: 'cansado', mira: 1 }); K.mareo(ctx, a, y.cabeza, y.hr); K.prop(ctx, 'reloj_digital', 1450, 560, 0.6, a.t); }, { de: 1, a: 1.12, foco: [960, 600] });
    K.cartel(ctx, a, 'NEXT: WHAT IF YOU STOP SLEEPING?', W / 2, 170, { tipo: 'amarillo', size: 50, p0: 0.2 }); K.luz(ctx, a, { tono: 'noche' }); },
});

// ===================== PORTADA =====================
export function portada(ctx, K) {
  const { YOU } = cast(K), a = { t: 1.4, d: 4, params: {}, WW: W, WH: H };
  sky(ctx, '#05030f', '#2a0a1a'); aurora(ctx, a, 0, 900, ['#4dffb0', '#ff4d8a', '#9a6bff'], 0.75);
  sol(K, ctx, a, 1650, 230, 210, 0.9);
  for (let i = 0; i < 12; i++) { const w = 140 + hs(i + 2) * 90, h = 200 + hs(i * 5 + 2) * 300; K.R(ctx, 700 + i * 110, 1080 - h, w, h, 4, '#0b0b14', 6); }
  ctx.save(); ctx.shadowColor = 'rgba(255,200,255,0.9)'; ctx.shadowBlur = 36; D(K, ctx, a, YOU, 1220, 1180, 1.7, { pose: 'miedo', mira: -1, mood: 'shocked' }); ctx.restore();
  D(K, ctx, a, YOU, 1220, 1180, 1.7, { pose: 'miedo', mira: -1, mood: 'shocked' });
  ctx.save(); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
  const lt = (s, x, yy, size, col, rot = 0) => { ctx.save(); ctx.translate(x, yy); ctx.rotate(rot); ctx.font = `${size}px Anton`; ctx.lineWidth = size * 0.2; ctx.strokeStyle = '#05040f'; ctx.strokeText(s, 0, 0); ctx.fillStyle = col; ctx.fillText(s, 0, 0); ctx.restore(); };
  lt('SKY ON', 70, 360, 250, '#ffffff', -0.04); lt('FIRE', 70, 640, 290, '#ffd93d', -0.04);
  ctx.restore();
  ctx.save(); ctx.translate(80, 730); ctx.rotate(-0.04); K.R(ctx, 0, 0, 760, 140, 70, '#e8132b', 10); ctx.font = '92px Anton'; ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.fillText('IT ALMOST HAPPENED', 380, 76); ctx.restore();
  const v = ctx.createRadialGradient(W / 2, H / 2, 700, W / 2, H / 2, 1250); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.5)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}
