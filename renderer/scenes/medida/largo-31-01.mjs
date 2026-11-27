// largo-31-01 — "What If You Lived to 1,000? Decade by Decade"
// 77 planos horizontales (export «ancho»), uno distinto por plano. Estilo gente.mjs + escenario.mjs + decorados SET.
import { SET } from '../../lib/sets.mjs';
import '../../lib/sets_mundo.mjs';

const W = 1920, H = 1080, INK = '#1b1530';
let CAST = null;
function cast(K) {
  if (CAST) return CAST;
  const sin = { sombrero: null, corbata: null, barba: false, bigote: false };
  const [YOU, DOC, TELLER, GIRL, BRO, GRAND, NEIGH, FRANK, FRIEND] = K.reparto('largo-31', 9, [
    { ...sin, estilo: 'limpio', pelo: 'pinchos', peloCol: '#3a2414', ropa: '#4d96ff', gafas: false },
    { ...sin, estilo: 'gordito', pelo: 'calvo', gafas: true, ropa: '#f4f4f8' },
    { ...sin, estilo: 'limpio', pelo: 'coleta', peloCol: '#1a120c', ropa: '#2ec4b6' },
    { ...sin, estilo: 'limpio', pelo: 'melena', peloCol: '#a33b20', ropa: '#f15bb5' },
    { ...sin, estilo: 'gordito', pelo: 'rizos', peloCol: '#1a120c', ropa: '#ff9f43', bigote: true },
    { ...sin, estilo: 'gordito', pelo: 'rizos', peloCol: '#1a120c', ropa: '#6bcb77', gafas: true },
    { ...sin, estilo: 'gordito', pelo: 'coronilla', peloCol: '#9e9e9e', ropa: '#b07cff' },
    { ...sin, estilo: 'gordito', pelo: 'melena', peloCol: '#f2f2f2', ropa: '#5a3e2b', gafas: true },
    { ...sin, estilo: 'limpio', pelo: 'tupe', peloCol: '#e8c36a', ropa: '#ffd93d' },
  ]);
  CAST = { YOU, DOC, TELLER, GIRL, BRO, GRAND, NEIGH, FRANK, FRIEND };
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

// ---------- Recursos comunes ----------
function estrellas(ctx, a, n = 140, y1 = 700, seed = 1) { ctx.save(); for (let i = 0; i < n; i++) { const x = hs(i + seed) * W, y = hs(i * 3.7 + seed) * y1, tw = 0.5 + 0.5 * Math.sin(a.t * 2 + i); ctx.globalAlpha = 0.4 + 0.6 * tw; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 1.5 + hs(i * 9.1) * 2.5, 0, 7); ctx.fill(); } ctx.restore(); }
// Texto grande con contorno (Anton)
function big(ctx, txt, x, y, size, col = '#fff', { rot = 0, k = 1, align = 'center' } = {}) { if (k <= 0) return; ctx.save(); ctx.globalAlpha = Math.min(1, k); ctx.translate(x, y); ctx.rotate(rot); const s = 0.85 + 0.15 * sm(Math.min(1, k)); ctx.scale(s, s); ctx.font = `${size}px Anton`; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.16; ctx.strokeStyle = '#0b0818'; ctx.strokeText(txt, 0, 0); ctx.fillStyle = col; ctx.fillText(txt, 0, 0); ctx.restore(); }
// Fondo de plano «dato»
function dato(K, ctx, c1 = '#141033', c2 = '#2b1f5c', glow = '#7b6cff') { sky(ctx, c1, c2); K.radial(ctx, W / 2, H / 2, 900, glow, 0.25); ctx.save(); ctx.globalAlpha = 0.07; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; for (let x = 0; x < W; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = 0; y < H; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); } ctx.restore(); }
// Insignia del año (arriba a la izquierda)
const anio = (K, ctx, a, txt) => K.contador(ctx, a, txt, 260, 92, { icono: 'reloj', size: 40 });
// Espejo de baño
function espejo(K, ctx, x, y, w, h) { K.R(ctx, x - w / 2 - 22, y - h / 2 - 22, w + 44, h + 44, 30, '#c9b38a', 8); const g = ctx.createLinearGradient(x - w / 2, y - h / 2, x + w / 2, y + h / 2); g.addColorStop(0, '#dff3ff'); g.addColorStop(1, '#9cc7e6'); K.R(ctx, x - w / 2, y - h / 2, w, h, 20, g, 6); ctx.save(); ctx.globalAlpha = 0.5; ln(ctx, [[x - w / 2 + 40, y - h / 2 + 120], [x - w / 2 + 140, y - h / 2 + 30]], '#fff', 12); ctx.restore(); }
// Diente con capa de esmalte (grosor 0..1)
function diente(K, ctx, x, y, s, esm = 1, grieta = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const forma = (sc) => { ctx.beginPath(); ctx.moveTo(-120 * sc, -140 * sc); ctx.quadraticCurveTo(0, -200 * sc, 120 * sc, -140 * sc); ctx.quadraticCurveTo(150 * sc, 0, 90 * sc, 60 * sc); ctx.lineTo(70 * sc, 230 * sc); ctx.quadraticCurveTo(40 * sc, 250 * sc, 20 * sc, 120 * sc); ctx.lineTo(-20 * sc, 120 * sc); ctx.quadraticCurveTo(-40 * sc, 250 * sc, -70 * sc, 230 * sc); ctx.lineTo(-90 * sc, 60 * sc); ctx.quadraticCurveTo(-150 * sc, 0, -120 * sc, -140 * sc); ctx.closePath(); };
  forma(1); ctx.fillStyle = '#f3e3b8'; ctx.fill(); ctx.lineWidth = 9; ctx.strokeStyle = INK; ctx.stroke();
  ctx.save(); forma(1); ctx.clip(); ctx.fillStyle = '#ffffff'; ctx.fillRect(-200, -220, 400, 60 + 160 * esm); ctx.restore();
  ctx.save(); forma(1); ctx.lineWidth = 9; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore();
  if (grieta > 0) ln(ctx, [[-10, -170], [20, -120], [-15, -80], [25, -30]].slice(0, 1 + Math.ceil(grieta * 3)), '#ff3b4e', 8);
  ctx.restore();
}
// Oreja (corte) con células ciliadas: vivas 0..1
function oido(K, ctx, x, y, s, vivas = 1, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.fillStyle = '#ffc9b0'; ctx.beginPath(); ctx.moveTo(0, 0); for (let i = 0; i < 160; i++) { const an = i * 0.07, r = 30 + i * 1.3; ctx.lineTo(Math.cos(an) * r, Math.sin(an) * r); } ctx.stroke();
  for (let i = 0; i < 14; i++) { const ok = i / 14 < vivas, bx = -280 + i * 42, by = 300; ln(ctx, [[bx, by], [bx + (ok ? Math.sin(t * 6 + i) * 8 : 18), by - (ok ? 70 : 22)]], ok ? '#20c060' : '#8a8d99', 8); circ(ctx, bx, by + 8, 10, ok ? '#7dffb0' : '#5a5f73', 4); }
  ctx.restore();
}
// Ojo con cristalino en capas (niebla 0..1)
function ojo(K, ctx, x, y, s, niebla = 0, capas = 4) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-320, 0); ctx.quadraticCurveTo(0, -260, 320, 0); ctx.quadraticCurveTo(0, 260, -320, 0); ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = INK; ctx.stroke();
  circ(ctx, 0, 0, 130, '#3a86ff', 8); circ(ctx, 0, 0, 60, '#0b0818', 0);
  for (let i = 0; i < capas; i++) { ctx.save(); ctx.globalAlpha = 0.25 + niebla * 0.12; ctx.strokeStyle = '#fff4c2'; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(0, 0, 40 + i * 14, 70 + i * 12, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
  if (niebla > 0) { ctx.save(); ctx.globalAlpha = niebla * 0.75; ctx.fillStyle = '#e8e4d8'; ctx.beginPath(); ctx.arc(0, 0, 128, 0, 7); ctx.fill(); ctx.restore(); }
  circ(ctx, 40, -40, 22, 'rgba(255,255,255,0.85)', 0);
  ctx.restore();
}
// Billete inventado (sin marcas reales)
function billete(K, ctx, x, y, s, col = '#9ed29e', txt = '100', rot = 0, gris = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); K.R(ctx, -170, -80, 340, 160, 12, gris ? '#c9c2b0' : col, 7); K.R(ctx, -150, -60, 300, 120, 8, 'rgba(255,255,255,0.35)', 4);
  circ(ctx, 0, 0, 44, 'rgba(255,255,255,0.5)', 4); ctx.fillStyle = INK; ctx.font = '900 40px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, -110, -30); ctx.fillText(txt, 110, 30); ctx.restore();
}
function maleta(K, ctx, x, gy, s = 1, abierta = 0) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s); K.R(ctx, -60, -260, 120, 40, 18, 'rgba(0,0,0,0)', 10); K.R(ctx, -240, -230, 480, 230, 22, '#7a4b23', 9);
  ln(ctx, [[-240, -150], [240, -150]], '#3b2416', 6); K.R(ctx, -30, -165, 60, 30, 6, '#ffd93d', 5);
  if (abierta > 0) { for (let i = 0; i < 9; i++) billete(K, ctx, -170 + (i % 3) * 170, -290 - Math.floor(i / 3) * 40 - abierta * 30, 0.45, '#c9a0e8', '50', (i - 4) * 0.08); }
  ctx.restore();
}
// Foto tipo polaroid
function foto(K, ctx, x, y, s, rot, dentro, borrosa = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); K.R(ctx, -200, -240, 400, 480, 10, '#fffdf5', 8);
  ctx.save(); ctx.beginPath(); ctx.rect(-170, -210, 340, 340); ctx.clip(); ctx.fillStyle = '#f3c58f'; ctx.fillRect(-170, -210, 340, 340); dentro(); if (borrosa) { ctx.globalAlpha = borrosa; ctx.fillStyle = '#e9dcc4'; ctx.fillRect(-170, -210, 340, 340); } ctx.restore();
  K.R(ctx, -170, -210, 340, 340, 4, 'rgba(0,0,0,0)', 5); ctx.restore();
}
// Diario de cuero
function diario(K, ctx, x, y, s, abierto = 1, linea = '', k = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (abierto < 0.5) { K.R(ctx, -200, -260, 400, 520, 18, '#6b3a1e', 9); K.R(ctx, -170, -230, 340, 460, 12, 'rgba(0,0,0,0)', 4); ln(ctx, [[-200, -100], [200, -100]], '#3b2416', 6); ctx.restore(); return; }
  K.R(ctx, -460, -300, 920, 600, 24, '#6b3a1e', 9); K.R(ctx, -430, -275, 420, 550, 8, '#f5ecd2', 6); K.R(ctx, 10, -275, 420, 550, 8, '#f5ecd2', 6); ln(ctx, [[0, -280], [0, 280]], '#3b2416', 6);
  ctx.save(); ctx.strokeStyle = 'rgba(80,60,40,0.35)'; ctx.lineWidth = 3; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(-400, -170 + i * 52); ctx.lineTo(-40, -170 + i * 52); ctx.moveTo(40, -170 + i * 52); ctx.lineTo(400, -170 + i * 52); ctx.stroke(); } ctx.restore();
  if (linea) { ctx.save(); ctx.font = 'italic 600 34px Poppins'; ctx.fillStyle = '#3b2a6a'; const n = Math.floor(linea.length * Math.min(1, k)); const ws = linea.slice(0, n).split('\n'); ws.forEach((w, i) => ctx.fillText(w, -400, -185 + i * 52)); ctx.restore(); }
  else { ctx.save(); ctx.globalAlpha = 0.55; for (let i = 0; i < 16; i++) { const px = i < 8 ? -400 : 40, py = -185 + (i % 8) * 52; ln(ctx, [[px, py], [px + 120 + hs(i) * 200, py]], '#3b2a6a', 5); } ctx.restore(); }
  ctx.restore();
}
// Tarta con muchas velas
function tarta(K, ctx, x, gy, s = 1, velas = 12, t = 0, humo = 0) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s); K.R(ctx, -300, -40, 600, 40, 20, '#e9e9f2', 7); K.R(ctx, -250, -260, 500, 220, 30, '#ff9fc2', 9); K.R(ctx, -250, -270, 500, 60, 30, '#fff4e6', 7);
  for (let i = 0; i < velas; i++) { const vx = -220 + (i % 20) * 23, vy = -270 - Math.floor(i / 20) * 26; K.R(ctx, vx - 5, vy - 50, 10, 50, 3, ['#4d96ff', '#ffd93d', '#6bcb77'][i % 3], 2); ctx.fillStyle = '#ffb703'; ctx.beginPath(); ctx.ellipse(vx, vy - 60 + Math.sin(t * 9 + i) * 2, 6, 11, 0, 0, 7); ctx.fill(); }
  if (velas > 40) K.radial(ctx, 0, -380, 420, '#ffcf6a', 0.5);
  ctx.restore(); if (humo > 0) K.smoke(ctx, x, gy - 420 * s, t, Math.round(8 * humo));
}
// Pino longevo retorcido
function pino(K, ctx, x, gy, s = 1) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s);
  K.P(ctx, [[-90, 0], [-60, -160], [-120, -320], [-40, -440], [-80, -560], [20, -640], [60, -520], [20, -420], [100, -300], [60, -160], [90, 0]], '#c7a27a', 9);
  for (let i = 0; i < 5; i++) ln(ctx, [[-50 + i * 20, -40], [-70 + i * 30, -300 - i * 40]], 'rgba(90,60,40,0.55)', 5);
  ln(ctx, [[-60, -360], [-260, -470], [-330, -460]], '#c7a27a', 22); ln(ctx, [[40, -500], [240, -600], [300, -580]], '#c7a27a', 20);
  for (const [cx, cy, r] of [[-320, -490, 70], [300, -610, 80], [10, -680, 90], [-150, -560, 60]]) circ(ctx, cx, cy, r, '#3f6b3a', 7);
  ctx.restore();
}
function fuegos(K, ctx, a, n = 6, seed = 1) { for (let i = 0; i < n; i++) { const per = 1.6 + hs(i + seed) * 0.8, tt = ((a.t + hs(i * 7 + seed) * per) % per) / per, x = 200 + hs(i * 3 + seed) * 1520, y = 150 + hs(i * 5 + seed) * 330, col = ['#ff3b4e', '#ffd93d', '#4d96ff', '#6bff9a', '#ff9ff3'][i % 5]; ctx.save(); ctx.globalAlpha = 1 - tt; ctx.strokeStyle = col; ctx.lineWidth = 5; for (let j = 0; j < 14; j++) { const an = j / 14 * Math.PI * 2, r = 30 + tt * 170; ctx.beginPath(); ctx.moveTo(x + Math.cos(an) * r * 0.6, y + Math.sin(an) * r * 0.6); ctx.lineTo(x + Math.cos(an) * r, y + Math.sin(an) * r + tt * 30); ctx.stroke(); } ctx.restore(); } }
// Puerta con cerrojos
function puerta(K, ctx, x, gy, s = 1, cerrojos = 0) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s); K.R(ctx, -190, -620, 380, 620, 10, '#8a5a3c', 10); K.R(ctx, -150, -580, 300, 240, 8, 'rgba(0,0,0,0.12)', 5); K.R(ctx, -150, -300, 300, 240, 8, 'rgba(0,0,0,0.12)', 5); circ(ctx, 120, -300, 18, '#ffd93d', 5);
  for (let i = 0; i < cerrojos; i++) { const yy = -540 + i * 75; K.R(ctx, 80, yy, 120, 34, 8, '#c9ccd6', 6); K.R(ctx, 190, yy - 6, 24, 46, 6, '#8a8d99', 5); }
  ctx.restore();
}
function lapida(K, ctx, x, gy, s, txt = 'R.I.P.') { ctx.save(); ctx.translate(x, gy); ctx.scale(s, s); K.P(ctx, [[-90, 0], [-90, -170], [-60, -220], [60, -220], [90, -170], [90, 0]], '#a9adbb', 8); ctx.fillStyle = INK; ctx.font = '900 34px Anton'; ctx.textAlign = 'center'; ctx.fillText(txt, 0, -120); ctx.restore(); }
// Móvil grande con lista de contactos
function movilLista(K, ctx, x, y, s, nombres, tachados = 0, cabecera = 'CONTACTS') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); K.R(ctx, -200, -380, 400, 760, 46, '#22202c', 9); K.R(ctx, -176, -350, 352, 700, 24, '#f4f7ff', 5);
  ctx.fillStyle = INK; ctx.font = '900 34px Anton'; ctx.textAlign = 'left'; ctx.fillText(cabecera, -150, -300);
  nombres.forEach((n, i) => { const yy = -240 + i * 70; circ(ctx, -120, yy, 24, ['#ffd93d', '#4d96ff', '#ff6b6b', '#6bcb77', '#b07cff'][i % 5], 4); ctx.fillStyle = INK; ctx.font = '600 30px Poppins'; ctx.fillText(n, -80, yy + 10); if (i < tachados) ln(ctx, [[-150, yy], [150, yy]], '#ff3b4e', 6); });
  ctx.restore();
}
// Árbol genealógico de puntos (niveles visibles 0..n)
function arbol(ctx, a, x, y, niveles, k = 1, sep = 90) {
  const ver = Math.max(1, Math.round(niveles * k));
  for (let lv = 0; lv < ver; lv++) { const n = Math.pow(4, lv), cap = Math.min(n, 160), w = Math.min(1700, 60 + cap * 12); for (let i = 0; i < cap; i++) { const px = x - w / 2 + (cap === 1 ? w / 2 : i * w / (cap - 1)), py = y + lv * sep; if (lv > 0) { const pi = Math.floor(i / 4), pc = Math.min(Math.pow(4, lv - 1), 160), pw = Math.min(1700, 60 + pc * 12), ppx = x - pw / 2 + (pc === 1 ? pw / 2 : Math.min(pi, pc - 1) * pw / (pc - 1)); ctx.save(); ctx.globalAlpha = 0.35; ln(ctx, [[ppx, py - sep], [px, py]], '#bfa8ff', 2); ctx.restore(); } circ(ctx, px, py, lv === 0 ? 26 : Math.max(4, 16 - lv * 3), lv === 0 ? '#4d96ff' : ['#ffd93d', '#ff9f43', '#6bcb77', '#f15bb5', '#2ec4b6'][lv % 5], lv < 2 ? 4 : 0); } }
}

export const ancho = {};
const A = ancho;

// ===================== CAPÍTULO 1 · YOUR 100TH BIRTHDAY =====================
Object.assign(A, {
  // 0 — Cumple 100: tarta con 100 velas, tú con cara de 30; a la derecha, la foto de graduación tachada
  0: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { SET.salon(ctx, a.t, { hora: 'dia' });
      tarta(K, ctx, 760, 1000, 0.8, 100, a.t);
      const y = D(K, ctx, a, YOU, 1200, 1010, 1.0, { pose: 'sorpresa', mood: 'sorpresa', mira: -1 });
      K.cartel(ctx, a, 'HAPPY 100TH!', 960, 170, { tipo: 'amarillo', size: 62, colgado: true });
      foto(K, ctx, 1640, 470, 0.55, 0.06, () => { for (let i = 0; i < 5; i++) { circ(ctx, -120 + i * 60, -40, 26, '#ffd9b8', 4); K.R(ctx, -145 + i * 60, -10, 50, 120, 14, '#2b2d42', 4); } });
      if (fase(a) > 0.6) ln(ctx, [[1520, 300], [1760, 640]], '#ff3b4e', 14); }, { de: 1.02, a: 1.12, foco: [1000, 600] });
    K.luz(ctx, a, { tono: 'interior', foco: [800, 600] }); K.etiqueta(ctx, a, 'KNEES: 30', 1180, 360, { size: 40, p0: 0.25 }); K.etiqueta(ctx, a, 'BANK: x2', 1460, 860, { size: 40, p0: 0.4, col: '#c9ffd2' }); },
  // 1 — 900 años por delante: tres caminos que se rompen — cuerpo, dinero, mente
  1: (ctx, a, K) => { const { YOU } = cast(K);
    dato(K, ctx);
    big(ctx, '900 YEARS LEFT', W / 2, 150, 120, '#ffd93d', { k: ph(a, 0, 0.12) });
    [['BODY', '#ff6b6b', 'corazon'], ['MONEY', '#6bcb77', 'bolsa_dinero'], ['MIND', '#4d96ff', 'cerebro']].forEach(([t, c, pr], i) => { const k = ph(a, 0.15 + i * 0.15, 0.3 + i * 0.15); if (k <= 0) return; const x = 420 + i * 540; ctx.save(); ctx.globalAlpha = k; K.R(ctx, x - 210, 320, 420, 480, 30, c, 8); K.prop(ctx, pr, x, 640, 0.8, a.t); big(ctx, t, x, 740, 80, '#fff'); ctx.restore(); });
    big(ctx, '?', W / 2 + Math.sin(a.t * 4) * 8, 940, 140, '#fff', { k: ph(a, 0.7, 0.8) }); },
  // 2 — Quédate al final: un diario misterioso bajo un foco
  2: (ctx, a, K) => {
    sky(ctx, '#0d0a1c', '#22183a'); suelo(ctx, 860, '#2a1f3a', '#140f22');
    K.radial(ctx, W / 2, 620, 620, '#fff0c0', 0.45); ctx.save(); ctx.globalAlpha = 0.18; ctx.fillStyle = '#fff6d0'; ctx.beginPath(); ctx.moveTo(W / 2 - 60, 0); ctx.lineTo(W / 2 + 60, 0); ctx.lineTo(W / 2 + 420, 900); ctx.lineTo(W / 2 - 420, 900); ctx.fill(); ctx.restore();
    ctx.save(); ctx.translate(W / 2, 700); ctx.rotate(Math.sin(a.t * 0.8) * 0.03); diario(K, ctx, 0, 0, 0.7, 0); ctx.restore();
    big(ctx, '?', W / 2, 420 + Math.sin(a.t * 2) * 10, 160, '#ffd93d', { k: ph(a, 0.3, 0.45) });
    K.etiqueta(ctx, a, 'WHO WROTE THIS?', W / 2 - 150, 220, { size: 50, p0: 0.5 }); K.luz(ctx, a, { tono: 'noche', foco: [W / 2, 650] }); },
  // 3 — Te despiertas, vas al espejo: la cara de 30 (sobre el hombro)
  3: (ctx, a, K) => { const { YOU } = cast(K);
    SET.bano(ctx, a.t, { hora: 'dia' });
    espejo(K, ctx, 1100, 470, 640, 620);
    ctx.save(); ctx.beginPath(); ctx.rect(780, 160, 640, 620); ctx.clip(); D(K, ctx, a, YOU, 1100, 1250, 1.9, { pose: 'quieto', mood: 'feliz', mira: 0 }); ctx.restore();
    K.hombro(ctx, a, YOU, { lado: -1 }); K.etiqueta(ctx, a, 'AGE 100... LOOKS 30', 1100, 120, { size: 42, p0: 0.35 }); K.luz(ctx, a, { tono: 'dia', foco: [1100, 470] }); },
  // 4 — Ni canas ni arrugas; los médicos quieren tu sangre cada semana
  4: (ctx, a, K) => { const { YOU, DOC } = cast(K);
    K.camara(ctx, a, () => { SET.despacho(ctx, a.t, { hora: 'dia' });
      D(K, ctx, a, YOU, 760, 1000, 1.0, { pose: 'sentado', mood: 'duda', mira: 1 });
      const d = D(K, ctx, a, DOC, 1200, 1000, 1.05, { pose: 'sostiene', mood: 'feliz', mira: -1 });
      if (d.manoD) { K.R(ctx, d.manoD[0] - 10, d.manoD[1] - 90, 26, 90, 8, '#d62828', 5); K.R(ctx, d.manoD[0] - 4, d.manoD[1] - 120, 14, 30, 4, '#c9ccd6', 3); }
      K.cartel(ctx, a, 'BLOOD TEST: EVERY WEEK', 1420, 300, { tipo: 'papel', size: 40, p0: 0.4, rot: 0.04 }); }, { de: 1.05, a: 1.15, foco: [960, 640] });
    K.etiqueta(ctx, a, 'MIRACLE?', 560, 260, { size: 54, p0: 0.15 }); K.luz(ctx, a, { tono: 'interior' }); },
  // 5 — Las células no envejecen: reloj congelado en hielo… pero hay otra cosa que desgasta
  5: (ctx, a, K) => {
    dato(K, ctx, '#0c1a2c', '#16385a', '#6fd3ff');
    ctx.save(); ctx.translate(W / 2 - 300, 520); K.R(ctx, -230, -230, 460, 460, 40, 'rgba(190,235,255,0.55)', 8); circ(ctx, 0, 0, 170, '#fffdf5', 9); ln(ctx, [[0, 0], [0, -120]], INK, 10); ln(ctx, [[0, 0], [80, 40]], INK, 8); ctx.restore();
    big(ctx, 'AGING: FROZEN', W / 2 - 300, 860, 72, '#9fe8ff', { k: ph(a, 0.1, 0.2) });
    const k = ph(a, 0.45, 0.6); ctx.save(); ctx.globalAlpha = k; ctx.translate(W / 2 + 420, 500); ctx.rotate(Math.sin(a.t * 3) * 0.05); K.prop(ctx, 'escombros', 0, 0, 1.1, a.t); ctx.restore();
    big(ctx, 'DAMAGE: ACTIVE', W / 2 + 420, 860, 72, '#ff6b6b', { k }); },
  // 6 — Un coche que nunca se oxida pero cuyas ruedas pierden goma
  6: (ctx, a, K) => {
    K.camara(ctx, a, () => { SET.autopista(ctx, a.t, { hora: 'dia' });
      ctx.save(); ctx.translate(W / 2, 900); K.P(ctx, [[-360, -30], [-350, -110], [-150, -130], [-60, -210], [140, -210], [260, -120], [370, -100], [380, -30]], '#e63946', 9); K.P(ctx, [[-40, -190], [120, -190], [210, -124], [-120, -124]], '#bfe6ff', 6); K.radial(ctx, -100, -150, 160, '#ffffff', 0.4);
      for (const wx of [-220, 230]) { ctx.save(); ctx.translate(wx, -36); ctx.rotate(a.t * 8); circ(ctx, 0, 0, 62, '#222', 8); circ(ctx, 0, 0, 28, '#c9ccd6', 6); ln(ctx, [[-26, 0], [26, 0]], '#8a8d99', 6); ctx.restore(); }
      ctx.restore();
      for (let i = 0; i < 18; i++) { const px = W / 2 - 260 - ((a.t * 400 + i * 70) % 900), py = 880 + hs(i) * 20; ctx.save(); ctx.globalAlpha = 0.6; ctx.fillStyle = '#2a2a2a'; ctx.fillRect(px, py, 10, 6); ctx.restore(); } }, { de: 1, a: 1.1, foco: [W / 2, 800] });
    K.etiqueta(ctx, a, 'NO RUST', 720, 600, { size: 46, p0: 0.15, col: '#c9ffd2' }); K.etiqueta(ctx, a, 'TIRES STILL WEAR', 1240, 660, { size: 46, p0: 0.5, col: '#ffd0d0' }); K.luz(ctx, a, { tono: 'dia' }); },
  // 7 — Tu cuerpo: tres piezas a punto de fallar (diente, oído, ojo) señaladas en ti
  7: (ctx, a, K) => { const { YOU } = cast(K);
    sky(ctx, '#f6eedc', '#e9dcc4'); K.radial(ctx, 960, 520, 700, '#fff', 0.5);
    const y = D(K, ctx, a, YOU, 960, 1500, 2.6, { pose: 'quieto', mood: 'duda', mira: 0 });
    const hx = y.cabeza[0], hy = y.cabeza[1], r = y.hr;
    [['TEETH', hx, hy + r * 0.5, 420, 860], ['EARS', hx - r * 0.95, hy, 300, 380], ['EYES', hx + r * 0.3, hy - r * 0.2, 1560, 300]].forEach(([t, px, py, lx, ly], i) => { const k = ph(a, 0.2 + i * 0.2, 0.3 + i * 0.2); if (k <= 0) return; ctx.save(); ctx.globalAlpha = k; ln(ctx, [[lx, ly], [px, py]], '#ff3b4e', 8); circ(ctx, px, py, 18, '#ff3b4e', 5); ctx.restore(); K.etiqueta(ctx, a, t, lx, ly, { size: 50, p0: 0.2 + i * 0.2, col: '#ffe3e3' }); });
    K.rotulo(ctx, a, '3 parts about to fail', W / 2, 1010, { size: 40, p0: 0.75 }); },
});

// ===================== CAPÍTULO 2 · WORN OUT =====================
Object.assign(A, {
  // 8 — Año 150: muerdes una manzana fría y ¡zing! en un diente
  8: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { SET.cocina(ctx, a.t, { hora: 'dia' });
      const bite = fase(a) > 0.4; const y = D(K, ctx, a, YOU, 900, 1000, 1.05, { pose: bite ? 'sorpresa' : 'sostiene', mood: bite ? 'miedo' : 'feliz', mira: 1 });
      K.prop(ctx, 'manzana', bite ? 1150 : y.manoD ? y.manoD[0] + 30 : 1050, bite ? 820 : (y.manoD ? y.manoD[1] - 30 : 600), 0.7, a.t);
      if (bite) { K.starBurst(ctx, y.cabeza[0] + 40, y.cabeza[1] + y.hr * 0.4, 120, '#ffd93d', 0.9); K.text(ctx, 'ZING!', y.cabeza[0] + 230, y.cabeza[1] - 60, { size: 90, color: '#ff3b4e' }); } }, { de: 1.05, a: 1.2, foco: [960, 520], temblor: fase(a) > 0.4 ? 6 : 0 });
    anio(K, ctx, a, 'YEAR 150'); K.luz(ctx, a, { tono: 'dia' }); },
  // 9 — Esmalte: la cáscara dura del diente; nunca vuelve a crecer (detalle)
  9: (ctx, a, K) => {
    dato(K, ctx, '#0f1c2e', '#1d3557', '#9fd8ff');
    diente(K, ctx, W / 2, 560, 1.7, 1 - ph(a, 0.4, 0.9) * 0.6);
    ctx.save(); ln(ctx, [[1300, 260], [1100, 330]], '#ffd93d', 7); ctx.restore(); K.etiqueta(ctx, a, 'ENAMEL', 1320, 240, { size: 52, p0: 0.1 });
    K.cartel(ctx, a, 'REGROWS: NEVER', 460, 860, { tipo: 'rojo', size: 54, p0: 0.55, rot: -0.04 }); },
  // 10 — Café, crujidos, rechinar de noche: el esmalte se vuelve papel en un siglo
  10: (ctx, a, K) => {
    sky(ctx, '#fff3e0', '#ffd9b0');
    ['cafe', 'pizza', 'luna'].forEach((p, i) => { const k = ph(a, i * 0.15, 0.1 + i * 0.15); if (k <= 0) return; ctx.save(); ctx.globalAlpha = k; K.prop(ctx, p, 260 + i * 330, 300, 0.75, a.t); ctx.restore(); });
    ['COFFEE', 'CRUNCH', 'GRINDING'].forEach((t, i) => K.etiqueta(ctx, a, t, 140 + i * 330, 470, { size: 34, p0: i * 0.15 + 0.05, rot: 0 }));
    const g = ph(a, 0.3, 0.95); diente(K, ctx, 1450, 560, 1.2, 1 - g * 0.92, g);
    ctx.save(); const bw = 520; K.R(ctx, 1190, 920, bw, 34, 17, '#2a2240', 5); K.R(ctx, 1190, 920, bw * (1 - g * 0.92), 34, 17, '#ffffff', 0); ctx.restore();
    K.text(ctx, `${Math.round((1 - g * 0.92) * 100)}% ENAMEL`, 1450, 880, { size: 40, color: INK });
    K.contador(ctx, a, `${Math.round(g * 100)} YEARS`, 520, 880, { icono: 'reloj', size: 44 }); },
  // 11 — Segundo problema: aquel concierto a los 20 (flashback)
  11: (ctx, a, K) => { const { YOU, FRIEND } = cast(K);
    K.camara(ctx, a, () => { sky(ctx, '#1a0f33', '#3a1660');
      for (let i = 0; i < 6; i++) { ctx.save(); ctx.globalAlpha = 0.25; ctx.fillStyle = ['#ff3bf0', '#3bd5ff', '#ffd93d'][i % 3]; ctx.beginPath(); const bx = 300 + i * 270; ctx.moveTo(bx, 0); ctx.lineTo(bx + 60 + Math.sin(a.t * 2 + i) * 200, 900); ctx.lineTo(bx - 60 + Math.sin(a.t * 2 + i) * 200, 900); ctx.fill(); ctx.restore(); }
      K.R(ctx, 360, 260, 220, 520, 14, '#16121f', 8); K.R(ctx, 1340, 260, 220, 520, 14, '#16121f', 8); for (const sx of [470, 1450]) { circ(ctx, sx, 420, 70 + Math.sin(a.t * 20) * 6, '#3a3550', 7); circ(ctx, sx, 640, 50 + Math.sin(a.t * 20) * 5, '#3a3550', 6); }
      D(K, ctx, a, YOU, 880, 1060, 1.0, { pose: 'vitorea', mood: 'risa', mira: 1 }); D(K, ctx, a, FRIEND, 1080, 1060, 0.95, { pose: 'vitorea', mood: 'risa', mira: -1 });
      K.publico(ctx, a, { x0: 0, x1: W, y0: 900, y1: 1080, filas: 2, reaccion: 'vitorea', tam: 60 }); }, { de: 1, a: 1.1, foco: [960, 600], temblor: 3 });
    K.etiqueta(ctx, a, 'AGE 20', 160, 120, { size: 46, rot: -0.05 }); K.etiqueta(ctx, a, 'YOUR EARS REMEMBER', 1300, 140, { size: 44, p0: 0.5 }); },
  // 12 — Células ciliadas del oído: el ruido las mata y no vuelven
  12: (ctx, a, K) => {
    dato(K, ctx, '#2a0f1f', '#5a1838', '#ff8fb0');
    oido(K, ctx, 760, 420, 1.0, 1 - ph(a, 0.35, 0.85), a.t);
    for (let i = 0; i < 5; i++) { const r = ((a.t * 300 + i * 120) % 600); ctx.save(); ctx.globalAlpha = 1 - r / 600; ctx.strokeStyle = '#ffd93d'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(1600, 420, r * 0.5 + 40, Math.PI * 0.75, Math.PI * 1.25); ctx.stroke(); ctx.restore(); }
    K.etiqueta(ctx, a, 'HAIR CELLS', 300, 830, { size: 50, p0: 0.1 }); K.cartel(ctx, a, 'NEVER GROW BACK', 1360, 860, { tipo: 'rojo', size: 50, p0: 0.6 }); },
  // 13 — Año 200: cena con amigos, todos ríen; tú ríes sin oír (bocadillos vacíos)
  13: (ctx, a, K) => { const { YOU, FRIEND, GIRL, BRO } = cast(K);
    K.camara(ctx, a, () => { SET.cafeteria(ctx, a.t, { hora: 'noche' });
      D(K, ctx, a, FRIEND, 420, 1000, 0.95, { pose: 'risa', mood: 'risa', mira: 1 }); D(K, ctx, a, GIRL, 700, 1000, 0.9, { pose: 'aplaude', mood: 'risa', mira: 1 });
      const y = D(K, ctx, a, YOU, 1150, 1000, 1.0, { pose: 'encoge', mood: 'feliz', mira: -1 }); D(K, ctx, a, BRO, 1450, 1000, 0.95, { pose: 'habla', mood: 'risa', mira: -1, habla: true });
      K.globo(ctx, a, '... ... ...', 1500, 420, { tx: 1450, ty: 640, p0: 0.15, size: 44 });
      ctx.save(); ctx.globalAlpha = 0.85; ln(ctx, [[y.cabeza[0] - y.hr - 30, y.cabeza[1] - 30], [y.cabeza[0] - y.hr + 30, y.cabeza[1] + 30]], '#ff3b4e', 8); ln(ctx, [[y.cabeza[0] - y.hr + 30, y.cabeza[1] - 30], [y.cabeza[0] - y.hr - 30, y.cabeza[1] + 30]], '#ff3b4e', 8); ctx.restore();
      K.text(ctx, 'HA HA', 560, 480, { size: 60, color: '#ffd93d' }); }, { de: 1, a: 1.15, foco: [1150, 600] });
    anio(K, ctx, a, 'YEAR 200'); K.luz(ctx, a, { tono: 'noche', foco: [960, 600] }); },
  // 14 — Ojo: el cristalino crece en capas, como una cebolla
  14: (ctx, a, K) => {
    dato(K, ctx, '#081a2a', '#123a5a', '#5ad0ff');
    ojo(K, ctx, 720, 540, 1.3, 0, 2 + Math.floor(ph(a, 0.1, 0.9) * 7));
    ctx.save(); ctx.translate(1520, 540); for (let i = 6; i >= 0; i--) { const k = ph(a, 0.15 + (6 - i) * 0.1, 0.25 + (6 - i) * 0.1); if (k <= 0) continue; ctx.globalAlpha = k; ctx.beginPath(); ctx.ellipse(0, 0, 60 + i * 34, 80 + i * 40, 0, 0, Math.PI * 2); ctx.fillStyle = i % 2 ? '#f6e3ff' : '#e4c6f5'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.stroke(); } ctx.restore();
    K.etiqueta(ctx, a, 'THE LENS KEEPS GROWING', 520, 140, { size: 48, p0: 0.05 }); K.etiqueta(ctx, a, 'LIKE AN ONION', 1400, 960, { size: 44, p0: 0.5 }); },
  // 15 — Más grueso y turbio: el mundo tras una ventana empañada (sobre tu hombro)
  15: (ctx, a, K) => { const { YOU } = cast(K);
    SET.calle(ctx, a.t, { hora: 'dia' });
    const n = ph(a, 0.1, 0.8); ctx.save(); ctx.globalAlpha = 0.65 * n; ctx.fillStyle = '#e9eef2'; ctx.fillRect(0, 0, W, H); ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.5 * n; for (let i = 0; i < 40; i++) { circ(ctx, hs(i) * W, hs(i * 3) * 900, 20 + hs(i * 7) * 60, '#ffffff', 0); } ctx.restore();
    K.R(ctx, 0, 0, W, 40, 0, '#ffffff', 0); K.hombro(ctx, a, YOU, { lado: 1 }); K.etiqueta(ctx, a, 'FOGGY WINDOW', 300, 160, { size: 52, p0: 0.3 }); },
  // 16 — En un diner: alejas el menú más y más
  16: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { SET.cafeteria(ctx, a.t, { hora: 'dia' });
      const k = sm(ph(a, 0.15, 0.85)); const y = D(K, ctx, a, YOU, 720, 1010, 1.05, { pose: 'sostiene', mood: 'duda', mira: 1 });
      const mx = lerpN(y.cabeza[0] + 220, y.cabeza[0] + 620, k), my = y.cabeza[1] + 40;
      ctx.save(); ctx.translate(mx, my); ctx.rotate(0.05); K.R(ctx, -120, -170, 240, 340, 12, '#fff8e6', 7); ctx.fillStyle = INK; ctx.font = '900 32px Anton'; ctx.textAlign = 'center'; ctx.fillText('MENU', 0, -120);
      ctx.save(); ctx.filter = 'blur(3px)'; for (let i = 0; i < 6; i++) ln(ctx, [[-90, -70 + i * 40], [60 + hs(i) * 30, -70 + i * 40]], '#555', 6); ctx.restore(); ctx.restore();
      ln(ctx, [[y.cabeza[0] + 120, y.cabeza[1] + 40], [mx - 130, my]], 'rgba(255,59,78,0.6)', 5); }, { de: 1.02, a: 1.12, foco: [1000, 560] });
    K.etiqueta(ctx, a, 'FARTHER...', 1450, 260, { size: 46, p0: 0.5 }); K.luz(ctx, a, { tono: 'dia' }); },
  // 17 — Dientes, oídos, ojos: tres iconos que se apagan uno a uno
  17: (ctx, a, K) => {
    dato(K, ctx);
    const items = [(x) => diente(K, ctx, x, 470, 0.9, 0.3, 1), (x) => oido(K, ctx, x, 420, 0.5, 0.2, a.t), (x) => ojo(K, ctx, x, 470, 0.6, 0.8)];
    items.forEach((f, i) => { const x = 420 + i * 540, off = ph(a, 0.25 + i * 0.2, 0.4 + i * 0.2); ctx.save(); ctx.globalAlpha = 1 - off * 0.7; f(x); ctx.restore(); if (off > 0.5) { ln(ctx, [[x - 180, 280], [x + 180, 660]], '#ff3b4e', 14); } big(ctx, ['TEETH', 'EARS', 'EYES'][i], x, 820, 76, '#fff'); });
    K.rotulo(ctx, a, 'Everything else: perfect', W / 2, 990, { size: 40, p0: 0.8 }); },
  // 18 — Los médicos: «desgaste, no edad». Pizarra con dos columnas
  18: (ctx, a, K) => { const { DOC } = cast(K);
    K.camara(ctx, a, () => { SET.aula(ctx, a.t, { hora: 'dia' });
      K.R(ctx, 560, 180, 1100, 560, 20, '#1f4a3a', 12);
      ctx.fillStyle = '#f4f4f8'; ctx.font = '900 64px Anton'; ctx.textAlign = 'center'; ctx.fillText('WEAR', 830, 290); ctx.fillText('AGE', 1390, 290); ln(ctx, [[1110, 220], [1110, 700]], '#f4f4f8', 5);
      ['teeth', 'ears', 'eyes'].forEach((t, i) => { if (ph(a, 0.15 + i * 0.12, 0.2 + i * 0.12) > 0) { ctx.fillStyle = '#ffd93d'; ctx.font = '600 44px Poppins'; ctx.fillText(t, 830, 400 + i * 90); } });
      if (ph(a, 0.6, 0.7) > 0) { ctx.fillStyle = '#ff8f8f'; ctx.font = '600 44px Poppins'; ctx.fillText('(none)', 1390, 400); }
      D(K, ctx, a, DOC, 400, 1010, 1.05, { pose: 'senala', mood: 'serio', mira: 1 }); }, { de: 1.05, a: 1.1, foco: [1000, 500] });
    K.globo(ctx, a, 'Wear, not age.', 360, 300, { tx: 400, ty: 560, p0: 0.3, size: 46 }); K.luz(ctx, a, { tono: 'interior' }); },
  // 19 — Tu cuerpo no es viejo; solo está gastado (primer plano)
  19: (ctx, a, K) => { const { YOU } = cast(K);
    sky(ctx, '#2a2340', '#4a3a6a'); K.radial(ctx, 960, 400, 700, '#ffb27a', 0.35);
    D(K, ctx, a, YOU, 960, 1580, 2.8, { pose: 'cansado', mood: 'cansado', mira: 0 });
    big(ctx, 'NOT OLD.', 420, 300, 120, '#ffffff', { k: ph(a, 0.05, 0.2), rot: -0.04 }); big(ctx, 'WORN OUT.', 1500, 820, 120, '#ffd93d', { k: ph(a, 0.45, 0.6), rot: 0.03 });
    K.luz(ctx, a, { tono: 'atardecer', foco: [960, 500] }); },
});

// ===================== CAPÍTULO 3 · THE RICHEST HUMAN =====================
Object.assign(A, {
  // 20 — Año 200: tus ahorros en un banco, el interés se dispara
  20: (ctx, a, K) => { const { YOU, TELLER } = cast(K);
    K.camara(ctx, a, () => { SET.oficina(ctx, a.t, { hora: 'dia' });
      K.R(ctx, 640, 700, 900, 300, 10, '#c98b4a', 8); K.R(ctx, 640, 680, 900, 30, 8, '#7a4b23', 6);
      D(K, ctx, a, TELLER, 1240, 720, 0.9, { pose: 'senala', mood: 'feliz', mira: -1 });
      D(K, ctx, a, YOU, 520, 1040, 1.0, { pose: 'vitorea', mood: 'risa', mira: 1 });
      K.cartel(ctx, a, 'BANK', 1090, 170, { tipo: 'papel', size: 70, colgado: true });
      const v = Math.round(1000 * Math.pow(2, ph(a, 0.1, 0.9) * 8)); K.contador(ctx, a, `$${v.toLocaleString('en-US')}`, 960, 560, { icono: 'dinero', size: 52, p0: 0.05 }); }, { de: 1, a: 1.12, foco: [900, 600] });
    anio(K, ctx, a, 'YEAR 200'); K.luz(ctx, a, { tono: 'dia' }); },
  // 21 — 1790: un caballero (genérico) deja dinero a dos ciudades — escena de época en sepia
  21: (ctx, a, K) => { const { FRANK } = cast(K);
    K.camara(ctx, a, () => { sky(ctx, '#e9d3a8', '#c9a876'); suelo(ctx, 880, '#8a6a46', '#5a432c');
      K.R(ctx, 200, 640, 700, 40, 6, '#5a3e2b', 7); K.R(ctx, 240, 680, 30, 200, 4, '#5a3e2b', 6); K.R(ctx, 830, 680, 30, 200, 4, '#5a3e2b', 6);
      const y = D(K, ctx, a, FRANK, 560, 900, 1.05, { pose: 'sostiene', mood: 'feliz', mira: 1 });
      K.prop(ctx, 'pluma', y.manoD ? y.manoD[0] + 20 : 700, y.manoD ? y.manoD[1] - 40 : 560, 0.6, a.t);
      for (const [cx, nm, k] of [[1250, 'BOSTON', ph(a, 0.3, 0.45)], [1650, 'PHILADELPHIA', ph(a, 0.5, 0.65)]]) { if (k <= 0) continue; ctx.save(); ctx.globalAlpha = k; K.prop(ctx, 'bolsa_dinero', cx, 560, 0.9, a.t); ctx.restore(); K.etiqueta(ctx, a, nm, cx - 120, 760, { size: 40, p0: 0.3, rot: 0 }); K.text(ctx, '£1,000', cx, 250, { size: 54, color: '#3b2416', k }); } }, { de: 1.05, a: 1.12, foco: [960, 600] });
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgba(255,214,150,0.35)'; ctx.fillRect(0, 0, W, H); ctx.restore();
    K.etiqueta(ctx, a, '1790', 160, 120, { size: 60, rot: -0.04, col: '#ffe9b0' }); K.luz(ctx, a, { tono: 'interior' }); },
  // 22 — Una sola regla: no tocarlo en 200 años. Cofre con candado y reloj
  22: (ctx, a, K) => {
    sky(ctx, '#2b2240', '#4a3566'); suelo(ctx, 860, '#3a2c52', '#1d1530');
    ctx.save(); ctx.translate(W / 2, 860); K.R(ctx, -300, -340, 600, 340, 20, '#8a5a3c', 10); K.R(ctx, -300, -420, 600, 120, 40, '#a86f48', 10); K.R(ctx, -330, -320, 660, 30, 6, '#ffd93d', 6); K.R(ctx, -50, -300, 100, 130, 14, '#c9ccd6', 7); circ(ctx, 0, -250, 18, INK, 0); ctx.restore();
    K.cartel(ctx, a, "DON'T TOUCH", W / 2, 300, { tipo: 'rojo', size: 70, p0: 0.15, rot: -0.03 });
    K.contador(ctx, a, `${Math.round(ph(a, 0.3, 0.95) * 200)} / 200 YEARS`, W / 2, 970, { icono: 'reloj', size: 46, p0: 0.25 });
    K.luz(ctx, a, { tono: 'noche', foco: [W / 2, 650] }); },
  // 23 — 1990: el fondo de Boston ≈ 5 millones (curva que se dispara)
  23: (ctx, a, K) => {
    dato(K, ctx, '#0f2018', '#1b4030', '#6bff9a');
    const x0 = 260, y0 = 900, w = 1300, h = 640, k = ph(a, 0.05, 0.8);
    ln(ctx, [[x0, y0 - h], [x0, y0], [x0 + w, y0]], '#cfe', 6);
    ctx.save(); ctx.strokeStyle = '#6bff9a'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); const N = 60; for (let i = 0; i <= N * k; i++) { const u = i / N, px = x0 + u * w, py = y0 - (Math.exp(u * 5) - 1) / (Math.exp(5) - 1) * h; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); ctx.restore();
    K.text(ctx, '1790', x0, y0 + 50, { size: 40, color: '#cfe' }); K.text(ctx, '1990', x0 + w, y0 + 50, { size: 40, color: '#cfe' });
    if (k > 0.98) { circ(ctx, x0 + w, y0 - h, 20, '#ffd93d', 5); }
    big(ctx, '≈ $5,000,000', 1350, 220, 110, '#ffd93d', { k: ph(a, 0.75, 0.9) }); K.etiqueta(ctx, a, "BOSTON'S FUND", 340, 160, { size: 44, p0: 0.1 }); },
  // 24 — Mil años de interés compuesto: ¿el humano más rico? Tú sobre una montaña de dinero
  24: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { sky(ctx, '#ffe9a8', '#ffb86b'); K.radial(ctx, 960, 300, 800, '#fff', 0.5);
      for (let i = 0; i < 60; i++) { const r = hs(i), x = 960 + (r - 0.5) * 1300 * (1 - hs(i * 3) * 0.6), y = 1000 - hs(i * 3) * 380; billete(K, ctx, x, y, 0.5, '#9ed29e', '$', (hs(i * 5) - 0.5) * 1.2); }
      D(K, ctx, a, YOU, 960, 640, 0.9, { pose: 'vitorea', mood: 'risa' });
      K.prop(ctx, 'medalla', 1200, 360, 0.6, a.t); }, { de: 1.15, a: 1, foco: [960, 500] });
    K.etiqueta(ctx, a, 'RICHEST HUMAN EVER?', 600, 150, { size: 56, p0: 0.2 }); },
  // 25 — ¡Error! El dólar nace en 1792: tus ahorros más viejos serían otra moneda
  25: (ctx, a, K) => {
    sky(ctx, '#2a1020', '#4a1830'); K.radial(ctx, 960, 540, 800, '#ff3b4e', 0.25);
    big(ctx, 'WRONG.', W / 2, 200, 150, '#ff3b4e', { k: ph(a, 0, 0.1), rot: -0.04 });
    const xs = [['?', 360], ['?', 700], ['$', 1260]]; xs.forEach(([s, x], i) => { const k = ph(a, 0.2 + i * 0.15, 0.3 + i * 0.15); ctx.save(); ctx.globalAlpha = k; billete(K, ctx, x + (i === 2 ? 200 : 0), 580, 1.1, i === 2 ? '#9ed29e' : '#d7c49e', s, (i - 1) * 0.05); ctx.restore(); });
    ln(ctx, [[180, 820], [1740, 820]], '#fff', 6); K.text(ctx, 'YEAR 0', 300, 880, { size: 40, color: '#fff' }); K.text(ctx, '1792: DOLLAR', 1460, 880, { size: 40, color: '#ffd93d', k: ph(a, 0.5, 0.6) }); },
  // 26 — Ni la libra: unos 1.200 años. Línea del tiempo de 1.000 años con la libra marcada
  26: (ctx, a, K) => {
    dato(K, ctx, '#151530', '#24244a', '#a0a8ff');
    ln(ctx, [[160, 560], [1760, 560]], '#fff', 8);
    for (let i = 0; i <= 10; i++) { const x = 160 + i * 160; ln(ctx, [[x, 540], [x, 580]], '#fff', 4); }
    const k = ph(a, 0.15, 0.7); K.R(ctx, 160, 520, 1600 * k, 80, 20, 'rgba(255,217,61,0.5)', 0);
    K.prop(ctx, 'dinero_billete', 160 + 1600 * k, 430, 0.7, a.t);
    big(ctx, 'OLDEST MONEY STILL IN USE', W / 2, 220, 70, '#fff', { k: ph(a, 0, 0.1) }); big(ctx, '~1,200 YEARS', W / 2, 760, 110, '#ffd93d', { k: ph(a, 0.6, 0.72) });
    K.etiqueta(ctx, a, 'THE POUND', 1500, 900, { size: 46, p0: 0.7 }); },
  // 27 — Los imperios imprimen dinero y se hunden: un templo con columnas que cae, billetes volando
  27: (ctx, a, K) => {
    K.camara(ctx, a, () => { sky(ctx, '#ffb86b', '#7a3b5a'); suelo(ctx, 900, '#6a4a3a', '#3a2620');
      const k = sm(ph(a, 0.35, 0.8)); ctx.save(); ctx.translate(960, 900); K.P(ctx, [[-480, -560], [0, -720], [480, -560]], '#e9dcc4', 9); K.R(ctx, -500, -580, 1000, 50, 6, '#e9dcc4', 8);
      for (let i = 0; i < 6; i++) { ctx.save(); const cx = -400 + i * 160; ctx.translate(cx, 0); ctx.rotate(k * (i % 2 ? 0.5 : -0.4) * (i / 5 + 0.2)); K.R(ctx, -40, -530, 80, 530, 6, '#f6eedc', 7); ctx.restore(); } ctx.restore();
      for (let i = 0; i < 14; i++) { const t2 = (a.t * 0.6 + hs(i)) % 1; billete(K, ctx, 200 + hs(i * 3) * 1520, -100 + t2 * 1100, 0.35, '#d7c49e', '?', a.t * 2 + i); } }, { de: 1, a: 1.08, foco: [960, 500], temblor: fase(a) > 0.35 ? 5 : 0 });
    K.etiqueta(ctx, a, 'EMPIRES COLLAPSE', 1300, 140, { size: 52, p0: 0.3 }); K.luz(ctx, a, { tono: 'atardecer' }); },
  // 28 — Te despiertas con una maleta de billetes de un país que ya no existe
  28: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { SET.dormitorio(ctx, a.t, { hora: 'dia' });
      maleta(K, ctx, 1240, 1000, 1.0, ph(a, 0.2, 0.5));
      const y = D(K, ctx, a, YOU, 700, 1000, 1.0, { pose: 'brazos', mood: 'duda', mira: 1 }); K.simbolo(ctx, a, y.cabeza, y.hr, '?', 0.5);
      K.cartel(ctx, a, 'REPUBLIC OF ???', 1240, 560, { tipo: 'papel', size: 40, p0: 0.45, rot: -0.05 }); }, { de: 1, a: 1.12, foco: [1000, 700] });
    K.luz(ctx, a, { tono: 'interior' }); },
  // 29 — La cajera se ríe y te devuelve los ahorros por el mostrador (sobre el hombro de la cajera)
  29: (ctx, a, K) => { const { YOU, TELLER } = cast(K);
    K.camara(ctx, a, () => { SET.oficina(ctx, a.t, { hora: 'dia' });
      const y = D(K, ctx, a, YOU, 1150, 1180, 1.6, { pose: 'habla', mood: 'triste', mira: -1, habla: fase(a) < 0.5 });
      K.R(ctx, 0, 860, W, 220, 0, '#c98b4a', 8);
      const k = sm(ph(a, 0.5, 0.85)); for (let i = 0; i < 4; i++) billete(K, ctx, lerpN(600, 1050, k) + i * 30, 900 - i * 8, 0.6, '#d7c49e', '?', 0.1 * i); }, { de: 1, a: 1.1, foco: [1100, 600] });
    K.hombro(ctx, a, TELLER, { lado: -1 }); K.text(ctx, 'HA HA HA', 520, 260, { size: 70, color: '#ffd93d', k: ph(a, 0.1, 0.2) }); K.luz(ctx, a, { tono: 'interior' }); },
  // 30 — Empiezas de nuevo, otra vez: ciclo de fortunas que la historia borra (data)
  30: (ctx, a, K) => {
    dato(K, ctx, '#1d0f2a', '#36184a', '#ff9ff3');
    const x0 = 160, w = 1600, y0 = 860, k = ph(a, 0.05, 0.9);
    ln(ctx, [[x0, y0], [x0 + w, y0]], '#fff', 6);
    ctx.save(); ctx.strokeStyle = '#ffd93d'; ctx.lineWidth = 12; ctx.lineJoin = 'round'; ctx.beginPath(); for (let i = 0; i <= 200 * k; i++) { const u = i / 200, c = (u * 4) % 1, px = x0 + u * w, py = y0 - Math.pow(c, 2.4) * 560; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); ctx.restore();
    for (let j = 1; j < 4; j++) if (k > j / 4) { K.prop(ctx, 'calavera', x0 + j * w / 4, 220, 0.5, a.t); }
    big(ctx, 'BUILD. LOSE. REPEAT.', W / 2, 120, 90, '#fff', { k: ph(a, 0, 0.1) }); },
  // 31 — Sobrevivirás al dinero antes de que el dinero te sobreviva: un billete que se convierte en polvo
  31: (ctx, a, K) => {
    sky(ctx, '#120d1c', '#2a1f3a'); K.radial(ctx, W / 2, 500, 600, '#ffd27a', 0.3);
    const k = ph(a, 0.2, 0.9); ctx.save(); ctx.globalAlpha = 1 - k; billete(K, ctx, W / 2, 480, 2.2, '#9ed29e', '$', -0.05); ctx.restore();
    for (let i = 0; i < 80 * k; i++) { const px = W / 2 - 350 + hs(i) * 700 + k * 300 * hs(i * 2), py = 400 + hs(i * 5) * 200 - k * 200 * hs(i * 7); ctx.save(); ctx.globalAlpha = 0.7 * (1 - k * 0.5); ctx.fillStyle = '#d7c49e'; ctx.fillRect(px, py, 8, 8); ctx.restore(); }
    K.rotulo(ctx, a, "You'll outlive the money", W / 2, 900, { size: 46, p0: 0.5 }); },
});

// ===================== CAPÍTULO 4 · THE PEOPLE YOU LOSE =====================
Object.assign(A, {
  // 32 — Año 300: tu móvil con 150 contactos (detalle)
  32: (ctx, a, K) => { const { YOU } = cast(K);
    sky(ctx, '#e8f1ff', '#bcd4f6');
    const y = D(K, ctx, a, YOU, 420, 1400, 2.2, { pose: 'sostiene', mood: 'feliz', mira: 1 });
    movilLista(K, ctx, 1180, 560, 1.1, ['Amy', 'Ben', 'Carla', 'Dev', 'Eli', 'Fran', 'Gus']);
    K.contador(ctx, a, '150 CONTACTS', 1180, 990, { icono: null, size: 46, p0: 0.2 }); anio(K, ctx, a, 'YEAR 300'); },
  // 33 — Número de Dunbar: 150 puntos que caben en un cerebro
  33: (ctx, a, K) => {
    dato(K, ctx, '#140d2a', '#2a1a52', '#c39bff');
    K.prop(ctx, 'cerebro', 480, 760, 1.3, a.t);
    const k = ph(a, 0.1, 0.8); for (let i = 0; i < 150 * k; i++) { const c = i % 15, r = Math.floor(i / 15); circ(ctx, 1000 + c * 52, 260 + r * 56, 16, ['#ffd93d', '#4d96ff', '#ff6b6b', '#6bcb77', '#f15bb5'][i % 5], 3); }
    big(ctx, "DUNBAR'S NUMBER", 480, 150, 70, '#fff', { k: ph(a, 0, 0.1) }); big(ctx, '150', 480, 900, 140, '#ffd93d', { k: ph(a, 0.5, 0.65) }); },
  // 34 — El círculo se encoge: traje negro, otro funeral (cementerio con lluvia)
  34: (ctx, a, K) => { const { YOU, NEIGH, FRIEND } = cast(K);
    K.camara(ctx, a, () => { sky(ctx, '#5a6478', '#8a93a8'); suelo(ctx, 900, '#4a6a4a', '#2a3a2a');
      for (let i = 0; i < 6; i++) lapida(K, ctx, 180 + i * 320, 900, 0.8 + hs(i) * 0.3, 'R.I.P.');
      D(K, ctx, a, NEIGH, 1300, 1000, 0.9, { pose: 'llora', mood: 'llora', ropa: '#1b1b22' }); D(K, ctx, a, FRIEND, 1520, 1000, 0.9, { pose: 'quieto', mood: 'triste' });
      D(K, ctx, a, { ...YOU, ropa: '#1b1b22' }, 900, 1020, 1.05, { pose: 'quieto', mood: 'triste', mira: 1 });
      ctx.save(); ctx.strokeStyle = 'rgba(200,215,235,0.5)'; ctx.lineWidth = 3; for (let i = 0; i < 90; i++) { const x = (hs(i) * W + a.t * 60) % W, y = (hs(i * 3) * H + a.t * 900) % H; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 8, y + 30); ctx.stroke(); } ctx.restore(); }, { de: 1, a: 1.1, foco: [1000, 700] });
    K.contador(ctx, a, 'FUNERAL #47', 1650, 92, { icono: null, size: 40, p0: 0.2 }); K.luz(ctx, a, { tono: 'tension' }); },
  // 35 — Cada pocas décadas, círculo nuevo: caras que se reemplazan en una cuadrícula
  35: (ctx, a, K) => {
    dato(K, ctx, '#0f2228', '#1c3f48', '#6fe6ff');
    const ronda = Math.floor(fase(a) * 4);
    for (let i = 0; i < 8; i++) { const x = 330 + (i % 4) * 420, y = 360 + Math.floor(i / 4) * 360, p = K.reparto(`l31-circ-${ronda}`, 8)[i]; K.R(ctx, x - 170, y - 160, 340, 320, 24, 'rgba(255,255,255,0.1)', 5); ctx.save(); ctx.beginPath(); ctx.rect(x - 170, y - 160, 340, 320); ctx.clip(); D(K, ctx, a, p, x, y + 560, 1.6, { pose: 'quieto', mood: 'feliz' }); ctx.restore(); }
    K.contador(ctx, a, `FRIENDS: VERSION ${ronda + 1}`, W / 2, 100, { icono: 'loop', size: 44 }); },
  // 36 — Dejas de aprender sus nombres: etiquetas «HELLO my name is» en blanco
  36: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { SET.oficina(ctx, a.t, { hora: 'dia' });
      const gente = K.reparto('l31-fiesta', 4);
      gente.forEach((p, i) => { const x = 300 + i * 330 + (i > 1 ? 380 : 0), y = D(K, ctx, a, p, x, 1000, 0.95, { pose: i % 2 ? 'saluda' : 'habla', mood: 'feliz', mira: i < 2 ? 1 : -1 }); ctx.save(); ctx.translate(x, y.cabeza[1] + y.hr * 2.2); K.R(ctx, -60, -32, 120, 64, 8, '#fff', 4); K.R(ctx, -60, -32, 120, 20, 6, '#e63946', 0); ctx.fillStyle = INK; ctx.font = '700 26px Poppins'; ctx.textAlign = 'center'; ctx.fillText(fase(a) > 0.4 ? '???' : 'Hi!', 0, 20); ctx.restore(); });
      const y = D(K, ctx, a, YOU, 960, 1010, 1.0, { pose: 'encoge', mood: 'cansado', mira: 0 }); K.simbolo(ctx, a, y.cabeza, y.hr, '?', 0.4); }, { de: 1, a: 1.12, foco: [960, 640] });
    K.etiqueta(ctx, a, 'WHY BOTHER?', 1500, 200, { size: 52, p0: 0.55 }); K.luz(ctx, a, { tono: 'interior' }); },
  // 37 — Una chica que amaste a los 200 sonríe en una foto vieja; no recuerdas su apellido
  37: (ctx, a, K) => { const { GIRL } = cast(K);
    sky(ctx, '#3a2a20', '#1e140e'); K.radial(ctx, W / 2, 500, 700, '#ffd7a0', 0.4);
    foto(K, ctx, W / 2, 500, 1.3, -0.04, () => { sky(ctx, '#ffd7a0', '#f3a86f', 400); D(K, ctx, a, GIRL, 0, 520, 1.2, { pose: 'saluda', mood: 'feliz' }); }, ph(a, 0.4, 0.9) * 0.3);
    ctx.save(); ctx.translate(W / 2, 920); ctx.rotate(-0.04); ctx.font = 'italic 600 46px Poppins'; ctx.fillStyle = '#3b2a6a'; ctx.textAlign = 'center'; ctx.fillText(fase(a) > 0.5 ? 'Lucy ????' : 'Lucy', 0, 0); ctx.restore();
    K.etiqueta(ctx, a, 'YEAR 200', 300, 140, { size: 44 }); },
  // 38 — No es crueldad, es defensa propia: tú con un escudo frente a recuerdos que llueven
  38: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { sky(ctx, '#2a1f4a', '#4a3a7a'); suelo(ctx, 920, '#3a2c52', '#1d1530');
      for (let i = 0; i < 10; i++) { const t2 = (a.t * 0.4 + hs(i)) % 1; foto(K, ctx, 300 + hs(i * 3) * 1300, -100 + t2 * 700, 0.25, hs(i) - 0.5, () => { ctx.fillStyle = '#ffd9b8'; ctx.beginPath(); ctx.arc(0, -40, 60, 0, 7); ctx.fill(); }); }
      const y = D(K, ctx, a, YOU, 960, 1020, 1.1, { pose: 'levanta', mood: 'serio' });
      ctx.save(); ctx.translate(960, y.cabeza[1] - y.hr * 2); ctx.beginPath(); ctx.ellipse(0, 0, 360, 90, 0, Math.PI, 0); ctx.fillStyle = 'rgba(120,200,255,0.5)'; ctx.fill(); ctx.strokeStyle = '#bfe6ff'; ctx.lineWidth = 8; ctx.stroke(); ctx.restore(); }, { de: 1, a: 1.1, foco: [960, 600] });
    K.etiqueta(ctx, a, 'SELF-DEFENSE', 1350, 840, { size: 54, p0: 0.3 }); K.luz(ctx, a, { tono: 'noche' }); },
  // 39 — Familia: 4 hijos, cada uno con 4 hijos… árbol que crece
  39: (ctx, a, K) => { const { YOU } = cast(K);
    dato(K, ctx, '#13213a', '#22385e', '#8ac4ff');
    const k = ph(a, 0.1, 0.9); arbol(ctx, a, W / 2, 300, 4, k, 150);
    D(K, ctx, a, YOU, W / 2, 290, 0.45, { pose: 'quieto', mood: 'feliz' });
    K.contador(ctx, a, `GENERATION ${Math.max(1, Math.round(k * 4))}`, 300, 980, { icono: null, size: 44 }); K.etiqueta(ctx, a, '4 KIDS EACH', 1450, 960, { size: 46, p0: 0.2 }); },
  // 40 — Diez generaciones: más de un millón de personas con tus genes
  40: (ctx, a, K) => {
    dato(K, ctx, '#0c1022', '#18204a', '#ffd93d');
    const k = ph(a, 0.05, 0.85); const n = Math.round(Math.pow(4, 1 + k * 9));
    ctx.save(); for (let i = 0; i < Math.min(2200, n); i++) { ctx.fillStyle = ['#ffd93d', '#4d96ff', '#ff6b6b', '#6bcb77'][i % 4]; ctx.fillRect(hs(i) * W, 260 + hs(i * 7) * 600, 6, 6); } ctx.restore();
    big(ctx, n.toLocaleString('en-US'), W / 2, 540, 180, '#fff');
    K.contador(ctx, a, `GENERATION ${Math.min(10, 1 + Math.floor(k * 10))}`, W / 2, 120, { icono: null, size: 46 }); K.etiqueta(ctx, a, 'PEOPLE WITH YOUR GENES', 640, 920, { size: 50, p0: 0.7 }); },
  // 41 — Un millón de descendientes y no reconoces a ninguno: tú perdido en una multitud
  41: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { SET.plaza(ctx, a.t, { luces: 0.5 });
      K.multitud(ctx, a, { n: 14, x0: 60, x1: 1860, gy: 900, esc: 0.6, filas: 3, reaccion: 'mezcla', seed: 'l31-desc' });
      const y = D(K, ctx, a, YOU, 960, 1050, 0.9, { pose: 'piensa', mood: 'duda' }); K.simbolo(ctx, a, y.cabeza, y.hr, '?', 0.3);
      K.multitud(ctx, a, { n: 6, x0: 0, x1: 1920, gy: 1200, esc: 1.0, filas: 1, reaccion: 'quieto', seed: 'l31-desc2' }); }, { de: 1.2, a: 1, foco: [960, 700] });
    K.etiqueta(ctx, a, 'ALL FAMILY. ALL STRANGERS.', 560, 140, { size: 50, p0: 0.3 }); K.luz(ctx, a, { tono: 'dia' }); },
  // 42 — Un pueblo entero desciende de ti; alguien tiene tu nariz (detalle de narices)
  42: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { SET.suburbio(ctx, a.t, { hora: 'dia' });
      K.cartel(ctx, a, 'WELCOME TO YOUTOWN', 1460, 560, { tipo: 'verde', size: 44, p0: 0.05 });
      const desc = K.reparto('l31-nariz', 5); desc.forEach((p, i) => D(K, ctx, a, { ...p, nariz: 'bola', piel: YOU.piel }, 240 + i * 260, 1000, 0.85, { pose: 'quieto', mood: 'feliz' }));
      const k = ph(a, 0.5, 0.65); if (k > 0) { ctx.save(); ctx.globalAlpha = k; circ(ctx, 760, 690, 80, 'rgba(255,217,61,0.25)', 6, '#ffd93d'); ctx.restore(); K.etiqueta(ctx, a, 'YOUR NOSE', 800, 520, { size: 40, p0: 0.5 }); } }, { de: 1, a: 1.15, foco: [760, 700] });
    K.luz(ctx, a, { tono: 'dia' }); },
  // 43 — Cafetería: un desconocido ríe igual que tu hermano. Pasas de largo
  43: (ctx, a, K) => { const { YOU, GRAND, BRO } = cast(K);
    K.camara(ctx, a, () => { SET.cafeteria(ctx, a.t, { hora: 'dia' });
      D(K, ctx, a, GRAND, 1350, 1000, 1.0, { pose: 'risa', mood: 'risa', mira: -1 }); K.text(ctx, 'HA HA!', 1350, 420, { size: 64, color: '#ff9f43' });
      const w = K.anda(a, 300, 900, 0.1, 0.9); D(K, ctx, a, YOU, w.x, 1010, 1.0, { pose: w.pose, mood: 'triste', mira: 1 });
      if (fase(a) > 0.3) { ctx.save(); ctx.globalAlpha = 0.85; ctx.translate(480, 300); K.R(ctx, -150, -120, 300, 240, 120, 'rgba(255,255,255,0.85)', 5); ctx.beginPath(); ctx.rect(-130, -110, 260, 220); ctx.clip(); D(K, ctx, a, BRO, 0, 300, 0.8, { pose: 'risa', mood: 'risa' }); ctx.restore(); } }, { de: 1, a: 1.1, foco: [960, 600] });
    K.etiqueta(ctx, a, 'SAME LAUGH', 1460, 280, { size: 46, p0: 0.25 }); K.luz(ctx, a, { tono: 'interior' }); },
  // 44 — No puedes contárselo (llamaría a un médico): cargas el árbol tú solo
  44: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { sky(ctx, '#3a2c52', '#5a4a7a'); suelo(ctx, 920, '#4a3c62', '#2a1f3a');
      const y = D(K, ctx, a, YOU, 960, 1020, 1.0, { pose: 'cansado', mood: 'cansado' });
      ctx.save(); ctx.translate(960, y.cabeza[1] - 40); ctx.scale(0.6, 0.6); arbol(ctx, a, 0, -500, 4, 1, 120); ctx.restore();
      K.globo(ctx, a, "I'm your great-great-...", 1500, 380, { tx: 1150, ty: 600, p0: 0.15, size: 38 }); if (fase(a) > 0.5) ln(ctx, [[1260, 300], [1740, 460]], '#ff3b4e', 12); }, { de: 1, a: 1.12, foco: [960, 500] });
    K.luz(ctx, a, { tono: 'noche' }); },
  // 45 — Una familia demasiado grande para abrazar, demasiado lejos para tocar: globo terráqueo con puntos
  45: (ctx, a, K) => { const { YOU } = cast(K);
    sky(ctx, '#05071a', '#141a3a'); estrellas(ctx, a, 160, 1080, 4);
    K.prop(ctx, 'tierra', 960, 820, 1.5, a.t * 0.3);
    for (let i = 0; i < 60; i++) { const an = hs(i) * Math.PI * 2, r = 120 + hs(i * 3) * 230; circ(ctx, 960 + Math.cos(an) * r, 520 + Math.sin(an) * r * 0.8, 5, '#ffd93d', 0); }
    D(K, ctx, a, YOU, 960, 1110, 0.6, { pose: 'abraza', mood: 'triste' });
    K.rotulo(ctx, a, 'Too big to hold. Too far to touch.', W / 2, 1010, { size: 40, p0: 0.4 }); },
});

// ===================== CAPÍTULO 5 · THE LOCKED HOUSE =====================
Object.assign(A, {
  // 46 — Año 500: las neuronas de la corteza tienen tu edad (cerebro con capa brillante)
  46: (ctx, a, K) => {
    dato(K, ctx, '#1f0f2a', '#3a1a4a', '#ff9ff3');
    K.prop(ctx, 'cerebro', 760, 860, 1.8, a.t);
    ctx.save(); ctx.globalAlpha = 0.5 + 0.3 * Math.sin(a.t * 3); ctx.strokeStyle = '#ffd93d'; ctx.lineWidth = 14; ctx.beginPath(); ctx.ellipse(760, 500, 330, 240, 0, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); ctx.restore();
    K.etiqueta(ctx, a, 'CORTEX = THINKING LAYER', 1180, 300, { size: 44, p0: 0.15 }); big(ctx, 'AGE: 500', 1480, 640, 120, '#ffd93d', { k: ph(a, 0.45, 0.6) }); anio(K, ctx, a, 'YEAR 500'); },
  // 47 — Nunca se reemplazan: cerebro como un almacén lleno hasta el techo
  47: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { SET.atico(ctx, a.t, { hora: 'dia' });
      for (let i = 0; i < 30; i++) { const c = i % 10, r = Math.floor(i / 10), k = ph(a, i * 0.02, i * 0.02 + 0.1); if (k <= 0) continue; K.R(ctx, 200 + c * 150, 900 - (r + 1) * 130 - (1 - k) * 200, 140, 120, 8, ['#c98b4a', '#b5793a', '#a86f48'][i % 3], 6); }
      D(K, ctx, a, YOU, 1700, 1010, 0.9, { pose: 'empuja', mood: 'cansado', mira: -1 }); }, { de: 1, a: 1.1, foco: [960, 600] });
    K.contador(ctx, a, 'STORAGE 99%', 1500, 92, { icono: null, size: 42, col: '#e63946', p0: 0.5 }); K.luz(ctx, a, { tono: 'interior' }); },
  // 48 — Los recuerdos más viejos se van primero: fotos que se disuelven en el tiempo
  48: (ctx, a, K) => {
    sky(ctx, '#eadfc9', '#cdbf9f');
    ['100', '200', '300', '400', '500'].forEach((t, i) => { const fade = Math.max(0, 1 - i * 0.25 - ph(a, 0.2, 0.9) * (1 - i * 0.15)); foto(K, ctx, 260 + i * 350, 480, 0.6, (i - 2) * 0.05, () => { ctx.fillStyle = '#ffd9b8'; ctx.beginPath(); ctx.arc(0, -60, 70, 0, 7); ctx.fill(); ctx.fillStyle = '#4d96ff'; ctx.fillRect(-80, 20, 160, 120); }, 1 - Math.max(0.05, 1 - fade)); K.text(ctx, `YEAR ${t}`, 260 + i * 350, 820, { size: 38, color: INK }); });
    ln(ctx, [[160, 900], [1760, 900]], INK, 6); K.etiqueta(ctx, a, 'OLDEST FADE FIRST', 640, 140, { size: 50, p0: 0.1 }); },
  // 49 — Intentas imaginar tu primer amor, tu primer coche, tu primer piso: todo borroso (primer plano)
  49: (ctx, a, K) => { const { YOU } = cast(K);
    sky(ctx, '#2a2240', '#3a2c5a');
    const y = D(K, ctx, a, YOU, 1300, 1600, 2.7, { pose: 'piensa', mood: 'piensa', mira: -1 });
    const items = [['coche_rojo', 360, 260], ['casa', 760, 220], ['corazon', 560, 560]];
    items.forEach(([p, x, yy], i) => { ctx.save(); ctx.filter = `blur(${6 + ph(a, 0.2, 0.9) * 14}px)`; ctx.globalAlpha = 0.85; K.prop(ctx, p, x, yy, 0.9, a.t); ctx.restore(); });
    ['FIRST LOVE', 'FIRST CAR', 'FIRST HOME'].forEach((t, i) => K.etiqueta(ctx, a, t, 160 + i * 300, 860, { size: 34, p0: 0.1 + i * 0.12, rot: 0 })); },
  // 50 — Un vecino pregunta por tu infancia; respondes con una historia gastada (cassette en bucle)
  50: (ctx, a, K) => { const { YOU, NEIGH } = cast(K);
    K.camara(ctx, a, () => { SET.suburbio(ctx, a.t, { hora: 'atardecer' });
      D(K, ctx, a, NEIGH, 1380, 1000, 1.0, { pose: 'habla', mood: 'feliz', mira: -1, habla: fase(a) < 0.3 });
      const y = D(K, ctx, a, YOU, 640, 1000, 1.0, { pose: 'habla', mood: 'neutral', mira: 1, habla: fase(a) > 0.3 });
      K.globo(ctx, a, 'As a kid you...?', 1420, 360, { tx: 1380, ty: 600, p0: 0.05, size: 40 });
      K.globo(ctx, a, 'Ah yes, the story...', 560, 330, { tx: 640, ty: 600, p0: 0.35, size: 40 });
      K.contador(ctx, a, 'TOLD x 3,000', 620, 180, { icono: 'loop', size: 38, p0: 0.6 }); }, { de: 1, a: 1.1, foco: [960, 600] });
    K.luz(ctx, a, { tono: 'atardecer' }); },
  // 51 — Si no envejeces, solo te puede matar una cosa: los accidentes (rótulo de peligro)
  51: (ctx, a, K) => {
    sky(ctx, '#1a0a0a', '#3a1010'); K.radial(ctx, W / 2, 540, 800, '#ff3b4e', 0.3);
    ctx.save(); ctx.translate(W / 2, 480); const s = 1 + 0.03 * Math.sin(a.t * 6); ctx.scale(s, s); K.P(ctx, [[0, -300], [340, 280], [-340, 280]], '#ffd93d', 14); ctx.fillStyle = INK; ctx.font = '260px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('!', 0, 60); ctx.restore();
    big(ctx, 'ONLY ONE THING LEFT:', W / 2, 110, 70, '#fff', { k: ph(a, 0, 0.1) }); big(ctx, 'ACCIDENTS', W / 2, 920, 150, '#ff3b4e', { k: ph(a, 0.45, 0.6) }); },
  // 52 — Choque, caída, resbalón: probabilidad pequeña cada año que se acumula (gráfica)
  52: (ctx, a, K) => {
    dato(K, ctx, '#1a1220', '#3a1f30', '#ff8f6b');
    ['coche_rojo', 'escombros', 'gota'].forEach((p, i) => { K.prop(ctx, p, 260, 260 + i * 220, 0.6, a.t); K.text(ctx, ['CRASH', 'FALL', 'SLIP'][i], 440, 260 + i * 220, { size: 40, color: '#fff' }); });
    const x0 = 640, y0 = 900, w = 1100, h = 640, k = ph(a, 0.15, 0.9);
    ln(ctx, [[x0, y0 - h], [x0, y0], [x0 + w, y0]], '#fff', 5);
    ctx.save(); ctx.strokeStyle = '#ff6b6b'; ctx.lineWidth = 12; ctx.beginPath(); for (let i = 0; i <= 100 * k; i++) { const u = i / 100, px = x0 + u * w, py = y0 - (1 - Math.exp(-u * 3)) * h; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); ctx.restore();
    K.text(ctx, 'CENTURIES →', x0 + w - 120, y0 + 50, { size: 34, color: '#fff' }); K.etiqueta(ctx, a, 'ODDS PILE UP', 1180, 200, { size: 46, p0: 0.6 }); },
  // 53 — Año 650: revisas la escalera dos veces; dejas de conducir, nadar, subir escaleras de mano
  53: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { SET.pasillo(ctx, a.t, { hora: 'dia' });
      ctx.save(); for (let i = 0; i < 7; i++) K.R(ctx, 1100 + i * 90, 1000 - (i + 1) * 80, 90, (i + 1) * 80, 0, '#a86f48', 6); ctx.restore();
      const y = D(K, ctx, a, YOU, 860, 1000, 1.0, { pose: 'miedo', mood: 'miedo', mira: 1 }); K.simbolo(ctx, a, y.cabeza, y.hr, '!', 0.15);
      ['NO DRIVING', 'NO SWIMMING', 'NO LADDERS'].forEach((t, i) => K.cartel(ctx, a, t, 340, 260 + i * 160, { tipo: 'rojo', size: 40, p0: 0.3 + i * 0.15, rot: -0.04 + i * 0.03 })); }, { de: 1, a: 1.1, foco: [960, 600] });
    anio(K, ctx, a, 'YEAR 650'); K.luz(ctx, a, { tono: 'interior' }); },
  // 54 — Un camión pita fuera: el corazón se te dispara (primer plano + pulso)
  54: (ctx, a, K) => { const { YOU } = cast(K);
    SET.salon(ctx, a.t, { hora: 'dia' }); ctx.save(); ctx.fillStyle = 'rgba(80,0,20,0.25)'; ctx.fillRect(0, 0, W, H); ctx.restore();
    const y = D(K, ctx, a, YOU, 700, 1600, 2.7, { pose: 'miedo', mood: 'miedo', mira: 1 });
    K.text(ctx, 'HONK!', 1500, 260, { size: 120, color: '#ffd93d' }); K.speedLines(ctx, 1500, 260, a.t, 0.7);
    ctx.save(); ctx.strokeStyle = '#ff3b4e'; ctx.lineWidth = 10; ctx.beginPath(); for (let x = 1100; x < 1880; x += 4) { const u = (x + a.t * 600) % 160, yy = 760 + (u > 60 && u < 70 ? -150 : u > 70 && u < 80 ? 120 : 0); x === 1100 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); } ctx.stroke(); ctx.restore();
    K.contador(ctx, a, `${150 + Math.round(ph(a, 0, 0.5) * 40)} BPM`, 1490, 920, { icono: null, size: 46, col: '#e63946' }); },
  // 55 — Cierras con llave y no sales en 80 años (puerta con cerrojos que se multiplican)
  55: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { SET.pasillo(ctx, a.t, { hora: 'noche' });
      puerta(K, ctx, 1100, 1000, 1.2, Math.floor(ph(a, 0.1, 0.8) * 7));
      D(K, ctx, a, YOU, 600, 1010, 1.0, { pose: 'empuja', mood: 'serio', mira: 1 }); }, { de: 1, a: 1.15, foco: [1000, 600] });
    K.contador(ctx, a, `${Math.round(ph(a, 0.2, 0.95) * 80)} YEARS INSIDE`, 1520, 92, { icono: 'reloj', size: 42 }); K.luz(ctx, a, { tono: 'noche', foco: [1000, 600] }); },
  // 56 — Has vencido a la muerte y la cura parece una cárcel: casa con barrotes en la ventana
  56: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { sky(ctx, '#2a3448', '#4a5a78'); suelo(ctx, 940, '#3a5a3a', '#1f2f1f');
      ctx.save(); ctx.translate(W / 2, 940); K.R(ctx, -420, -560, 840, 560, 8, '#c9b38a', 10); K.P(ctx, [[-480, -540], [0, -820], [480, -540]], '#7a3b2a', 10); ctx.restore();
      K.R(ctx, W / 2 - 160, 560, 320, 260, 10, '#ffd76a', 8); ctx.save(); ctx.beginPath(); ctx.rect(W / 2 - 160, 560, 320, 260); ctx.clip(); D(K, ctx, a, YOU, W / 2, 1000, 0.8, { pose: 'quieto', mood: 'triste' }); ctx.restore();
      for (let i = 0; i < 6; i++) ln(ctx, [[W / 2 - 140 + i * 56, 560], [W / 2 - 140 + i * 56, 820]], '#3a3a4a', 12); }, { de: 1.2, a: 1, foco: [W / 2, 690] });
    K.rotulo(ctx, a, 'The cure looks like a prison', W / 2, 1010, { size: 42, p0: 0.4 }); K.luz(ctx, a, { tono: 'tension', foco: [W / 2, 690] }); },
});

// ===================== CAPÍTULO 6 · STRANGER IN TIME =====================
Object.assign(A, {
  // 57 — Año 750: sales y nadie entiende lo que dices
  57: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { SET.avenida(ctx, a.t, { hora: 'dia' });
      const g = K.reparto('l31-futuro', 3, [{ ropa: '#c0f0ff', sombrero: null }, { ropa: '#ffc0f0', sombrero: null }, { ropa: '#e0ffc0', sombrero: null }]);
      g.forEach((p, i) => { const y = D(K, ctx, a, p, 1150 + i * 240, 1000, 0.9, { pose: 'encoge', mood: 'duda', mira: -1 }); if (i === 1) K.simbolo(ctx, a, y.cabeza, y.hr, '?', 0.4); });
      D(K, ctx, a, YOU, 640, 1010, 1.0, { pose: 'habla', mood: 'feliz', mira: 1, habla: true });
      K.globo(ctx, a, 'Hey, how ya doin?', 560, 360, { tx: 640, ty: 600, p0: 0.1, size: 42 }); K.globo(ctx, a, 'Zhu vrelk?', 1440, 340, { tx: 1390, ty: 600, p0: 0.5, size: 42 }); }, { de: 1, a: 1.1, foco: [960, 600] });
    anio(K, ctx, a, 'YEAR 750'); K.luz(ctx, a, { tono: 'dia' }); },
  // 58 — Hace mil años el inglés sonaba como un poema antiguo: pergamino con letras raras
  58: (ctx, a, K) => {
    sky(ctx, '#2a1d12', '#4a3420'); K.radial(ctx, W / 2, 540, 700, '#ffcf8a', 0.4);
    ctx.save(); ctx.translate(W / 2, 520); ctx.rotate(-0.02); K.R(ctx, -560, -360, 1120, 720, 20, '#f0dfb4', 10); circ(ctx, -560, 0, 40, '#d9c38f', 8); circ(ctx, 560, 0, 40, '#d9c38f', 8);
    ctx.font = '600 52px serif'; ctx.fillStyle = '#4a2a10'; ctx.textAlign = 'center'; const ls = ['Hwæt! We Gar-Dena', 'in geardagum,', 'þeodcyninga', 'þrym gefrunon']; const n = Math.ceil(ph(a, 0.05, 0.6) * ls.length); ls.slice(0, n).forEach((l, i) => ctx.fillText(l, 0, -200 + i * 110)); ctx.restore();
    K.etiqueta(ctx, a, 'ENGLISH, 1,000 YEARS AGO', 220, 120, { size: 46, p0: 0.1 }); K.cartel(ctx, a, '= FOREIGN LANGUAGE', 1480, 960, { tipo: 'amarillo', size: 44, p0: 0.65 }); },
  // 59 — Las lenguas derivan: la palabra cambia letra a letra en una línea de tiempo
  59: (ctx, a, K) => {
    dato(K, ctx, '#0f1c2a', '#1d3a54', '#7fd0ff');
    const pal = ['HUS', 'HOUS', 'HOUSE', 'HAUS?', 'HŌZ'], gen = ['GEN 1', 'GEN 10', 'GEN 20', 'GEN 30', 'GEN 40'];
    pal.forEach((p, i) => { const k = ph(a, i * 0.16, 0.1 + i * 0.16); if (k <= 0) return; const x = 240 + i * 360; ctx.save(); ctx.globalAlpha = k; K.R(ctx, x - 150, 380, 300, 200, 26, 'rgba(255,255,255,0.12)', 5); ctx.restore(); big(ctx, p, x, 480, 80, i === 2 ? '#ffd93d' : '#fff', { k }); K.text(ctx, gen[i], x, 640, { size: 34, color: '#9fd8ff', k }); if (i) ln(ctx, [[x - 205, 480], [x - 155, 480]], '#9fd8ff', 6); });
    big(ctx, 'LANGUAGES DRIFT', W / 2, 180, 90, '#fff', { k: ph(a, 0, 0.1) }); },
  // 60 — Cuentas tu mejor chiste y la sala te mira en silencio
  60: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { SET.salon(ctx, a.t, { hora: 'noche' });
      K.multitud(ctx, a, { n: 6, x0: 900, x1: 1820, gy: 1000, esc: 0.85, filas: 1, reaccion: 'quieto', seed: 'l31-sala', mood: 'serio', mira: -1 });
      D(K, ctx, a, YOU, 520, 1010, 1.05, { pose: fase(a) < 0.45 ? 'brazos' : 'encoge', mood: fase(a) < 0.45 ? 'risa' : 'duda', mira: 1, habla: fase(a) < 0.45 });
      K.globo(ctx, a, '...and the horse says...', 520, 300, { tx: 540, ty: 560, p0: 0.05, size: 38 });
      if (fase(a) > 0.55) K.text(ctx, '*cricket*', 1360, 360, { size: 56, color: '#9aa' }); }, { de: 1, a: 1.1, foco: [960, 600] });
    K.luz(ctx, a, { tono: 'interior' }); },
  // 61 — El extranjero más solo de la Tierra sin salir de casa (gran plano, tú solo en medio)
  61: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { SET.plaza(ctx, a.t, { luces: 0.3 });
      K.multitud(ctx, a, { n: 10, x0: 60, x1: 1860, gy: 980, esc: 0.7, filas: 2, reaccion: 'habla', seed: 'l31-plaza', habla: true });
      ctx.save(); ctx.fillStyle = 'rgba(10,10,30,0.35)'; ctx.fillRect(0, 0, W, H); ctx.restore(); K.radial(ctx, 960, 760, 320, '#fff3c0', 0.6);
      D(K, ctx, a, YOU, 960, 1010, 0.95, { pose: 'quieto', mood: 'triste' }); }, { de: 1.15, a: 1, foco: [960, 700] });
    K.etiqueta(ctx, a, 'NO REFERENCES. NO SAYINGS.', 520, 140, { size: 46, p0: 0.2 }); K.cartel(ctx, a, 'FOREIGNER AT HOME', 1480, 960, { tipo: 'papel', size: 44, p0: 0.55 }); },
  // 62 — Pero el mundo no ha acabado contigo: se acerca un gran hito (calendario)
  62: (ctx, a, K) => {
    sky(ctx, '#fff3e0', '#ffd0a0'); K.radial(ctx, W / 2, 500, 700, '#fff', 0.6);
    ctx.save(); ctx.translate(W / 2, 520); K.R(ctx, -340, -340, 680, 680, 30, '#fff', 10); K.R(ctx, -340, -340, 680, 160, 30, '#e63946', 10); ctx.fillStyle = '#fff'; ctx.font = '90px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('JULY', 0, -260);
    ctx.fillStyle = INK; ctx.font = '300px Anton'; ctx.fillText('4', 0, 40 + Math.sin(a.t * 3) * 4); ctx.restore();
    K.etiqueta(ctx, a, 'ONE LAST MILESTONE', 300, 140, { size: 48, p0: 0.15 }); K.cartel(ctx, a, '2776', 1560, 880, { tipo: 'amarillo', size: 80, p0: 0.5, rot: 0.06 }); },
  // 63 — 4 de julio de 2776: EE. UU. cumple 1.000 años; fuegos sobre la ciudad
  63: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { sky(ctx, '#070a24', '#1d1a4a', 900); estrellas(ctx, a, 100, 700, 9);
      fuegos(K, ctx, a, 8, 3);
      for (let i = 0; i < 11; i++) { const w = 150 + hs(i + 3) * 110, h = 260 + hs(i * 5 + 3) * 420; K.R(ctx, i * 180 - 40, 900 - h, w, h, 6, ['#3b3f5c', '#46365e', '#2f4a66'][i % 3], 7); }
      suelo(ctx, 900, '#23243a', '#121222');
      D(K, ctx, a, YOU, 960, 1060, 0.9, { pose: 'vitorea', mood: 'feliz', espalda: true }); }, { de: 1, a: 1.1, foco: [960, 400] });
    big(ctx, 'USA: 1,000 YEARS', W / 2, 980, 90, '#ffd93d', { k: ph(a, 0.3, 0.45) }); K.luz(ctx, a, { tono: 'noche' }); },
  // 64 — Dos veces la edad del cuadro más famoso: barras comparativas
  64: (ctx, a, K) => {
    dato(K, ctx, '#1a1430', '#2c2250', '#ffd27a');
    const bars = [['A FAMOUS PAINTING', 500, '#c39bff'], ['THE USA', 1000, '#ff6b6b'], ['YOU', 1000, '#4d96ff']];
    bars.forEach(([t, v, c], i) => { const k = ph(a, 0.1 + i * 0.2, 0.3 + i * 0.2); const w = 1200 * v / 1000 * sm(k); K.R(ctx, 560, 300 + i * 220, Math.max(1, w), 140, 20, c, 6); K.text(ctx, t, 300, 370 + i * 220, { size: 40, color: '#fff' }); if (k > 0.9) K.text(ctx, `${v} YRS`, 560 + w - 110, 370 + i * 220, { size: 44, color: INK }); });
    K.etiqueta(ctx, a, "YOU'RE INSIDE HISTORY", 1200, 960, { size: 46, p0: 0.75 }); },
  // 65 — Pero no eres lo más viejo: pinos de 4.800 años en las montañas de California
  65: (ctx, a, K) => {
    K.camara(ctx, a, () => { sky(ctx, '#9fd3ff', '#e8f4ff'); SET.montes(ctx, a.t, { hora: 'dia' });
      pino(K, ctx, 960, 1000, 1.25); pino(K, ctx, 380, 980, 0.6); pino(K, ctx, 1560, 990, 0.7); }, { de: 1.1, a: 1, foco: [960, 500] });
    big(ctx, '~4,800 YEARS OLD', W / 2, 140, 100, '#ffd93d', { k: ph(a, 0.35, 0.5) }); K.etiqueta(ctx, a, 'BRISTLECONE PINE', 1380, 900, { size: 46, p0: 0.15 }); K.luz(ctx, a, { tono: 'dia' }); },
  // 66 — Brotaron cuando se alzaban las primeras pirámides (pantalla dividida)
  66: (ctx, a, K) => { const { YOU } = cast(K);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W / 2, H); ctx.clip(); sky(ctx, '#ffd28a', '#f0a050'); suelo(ctx, 820, '#e0b070', '#c08a4a'); K.prop(ctx, 'piramide', 480, 820, 0.9, a.t); D(K, ctx, a, YOU, 200, 1500, 0.01, {}); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(W / 2, 0, W / 2, H); ctx.clip(); sky(ctx, '#bfe4ff', '#eaf6ff'); suelo(ctx, 900, '#8a9a7a', '#5a6a4a'); const s = 0.15 + ph(a, 0.2, 0.9) * 0.6; pino(K, ctx, W * 0.75, 900, s); ctx.restore();
    ln(ctx, [[W / 2, 0], [W / 2, H]], INK, 10);
    K.etiqueta(ctx, a, 'PYRAMIDS RISE', 280, 140, { size: 44 }); K.etiqueta(ctx, a, 'A PINE SPROUTS', 1240, 140, { size: 44, p0: 0.15 }); K.cartel(ctx, a, 'STILL STANDING', 1440, 980, { tipo: 'verde', size: 44, p0: 0.7 }); },
  // 67 — Apoyas la mano en la corteza: por una vez eres el joven (primer plano de mano)
  67: (ctx, a, K) => { const { YOU } = cast(K);
    sky(ctx, '#c7a27a', '#8a6a46');
    ctx.save(); for (let i = 0; i < 26; i++) { const x = i * 80 + Math.sin(i) * 20; ln(ctx, [[x, 0], [x + 40 * Math.sin(i * 1.7), H]], 'rgba(90,60,40,0.6)', 10 + (i % 3) * 4); } ctx.restore();
    const k = sm(ph(a, 0.05, 0.4)); ctx.save(); ctx.translate(lerpN(1500, 1100, k), 560); ctx.rotate(-0.2); K.R(ctx, 0, -30, 700, 160, 60, YOU.ropa, 8); ctx.translate(-20, 50); ctx.beginPath(); ctx.ellipse(0, 0, 120, 100, 0, 0, Math.PI * 2); ctx.fillStyle = YOU.piel; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.stroke(); for (let i = 0; i < 4; i++) { K.R(ctx, -200 + i * 6, -80 + i * 48, 110, 36, 18, YOU.piel, 7); } ctx.restore();
    K.etiqueta(ctx, a, 'FOR ONCE: THE YOUNG ONE', 220, 160, { size: 50, p0: 0.45 }); },
  // 68 — Cumpleaños 1.000: mil velas y la alarma de humo grita
  68: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { SET.cocina(ctx, a.t, { hora: 'noche' });
      tarta(K, ctx, 960, 1000, 1.1, 80, a.t, ph(a, 0.25, 0.6));
      const y = D(K, ctx, a, YOU, 1450, 1010, 1.0, { pose: fase(a) > 0.45 ? 'miedo' : 'aplaude', mood: fase(a) > 0.45 ? 'miedo' : 'feliz', mira: -1 });
      ctx.save(); ctx.translate(960, 110); circ(ctx, 0, 0, 60, '#f4f4f8', 7); circ(ctx, 0, 0, 14, fase(a) > 0.45 && Math.sin(a.t * 20) > 0 ? '#ff3b4e' : '#8a8d99', 0); ctx.restore();
      if (fase(a) > 0.45) K.text(ctx, 'BEEP! BEEP!', 960, 250, { size: 70, color: '#ff3b4e' }); }, { de: 1, a: 1.12, foco: [960, 650], temblor: fase(a) > 0.45 ? 4 : 0 });
    K.contador(ctx, a, '1,000 CANDLES', 300, 92, { icono: null, size: 42 }); K.luz(ctx, a, { tono: 'interior', foco: [960, 650] }); },
  // 69 — Esa noche, limpiando un armario: una caja polvorienta al fondo
  69: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { SET.atico(ctx, a.t, { hora: 'noche' });
      ctx.save(); ctx.translate(1150, 960); K.R(ctx, -200, -220, 400, 220, 10, '#a8865a', 8); ln(ctx, [[-200, -160], [200, -160]], '#7a5a34', 6); ctx.globalAlpha = 0.5; ctx.fillStyle = '#ddd'; for (let i = 0; i < 40; i++) ctx.fillRect(-190 + hs(i) * 380, -220 + hs(i * 3) * 40, 6, 3); ctx.restore();
      K.smoke(ctx, 1150, 760, a.t, 4);
      D(K, ctx, a, YOU, 700, 1000, 1.0, { pose: 'sostiene', mood: 'duda', mira: 1 }); }, { de: 1, a: 1.18, foco: [1100, 800] });
    K.etiqueta(ctx, a, 'OLDER THAN MOST COUNTRIES', 1180, 200, { size: 44, p0: 0.35 }); K.luz(ctx, a, { tono: 'noche', foco: [1100, 800] }); },
  // 70 — Dentro, un diario de cuero con letra que no reconoces: nombres y fechas
  70: (ctx, a, K) => {
    sky(ctx, '#1a120c', '#2a1f14'); K.radial(ctx, W / 2, 540, 700, '#ffd7a0', 0.35);
    const k = sm(ph(a, 0.05, 0.3)); ctx.save(); ctx.translate(W / 2, 540); ctx.scale(lerpN(0.6, 1.1, k), lerpN(0.6, 1.1, k)); diario(K, ctx, 0, 0, 1, 1, 'Mary 1842 — Tom 1867\nAlma 1903 — Joe 1911\nRita 1950 — Sam 1999\nIvy 2104 — Leo 2231', ph(a, 0.2, 0.9)); ctx.restore();
    K.etiqueta(ctx, a, 'NAMES. DATES.', 160, 120, { size: 46, p0: 0.3 }); },
  // 71 — Décadas que no recuerdas; gente que amaste y odiaste: nombres con «?»
  71: (ctx, a, K) => { const { YOU } = cast(K);
    sky(ctx, '#2a1f3a', '#3a2c52');
    ['Mary', 'Tom', 'Alma', 'Joe', 'Rita', 'Sam', 'Ivy', 'Leo'].forEach((n, i) => { const k = ph(a, 0.05 + i * 0.08, 0.12 + i * 0.08); if (k <= 0) return; const x = 260 + (i % 4) * 300, y = 220 + Math.floor(i / 4) * 200; ctx.save(); ctx.globalAlpha = k; ctx.translate(x, y); ctx.rotate((hs(i) - 0.5) * 0.2); K.R(ctx, -120, -50, 240, 100, 14, i % 3 ? '#fff6dc' : '#ffd0d0', 5); ctx.fillStyle = INK; ctx.font = '700 40px Poppins'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(n + ' ?', 0, 2); ctx.restore(); });
    const y = D(K, ctx, a, YOU, 1580, 1500, 2.2, { pose: 'piensa', mood: 'duda', mira: -1 }); K.simbolo(ctx, a, y.cabeza, y.hr, '?', 0.6); },
  // 72 — Abres la primera página: «Today is my hundredth birthday» (detalle)
  72: (ctx, a, K) => {
    sky(ctx, '#140d08', '#2a1c10'); K.radial(ctx, W / 2, 540, 800, '#ffcf8a', 0.4);
    ctx.save(); ctx.translate(W / 2, 520); K.R(ctx, -600, -380, 1200, 760, 12, '#f5ecd2', 10);
    ctx.font = 'italic 600 74px Poppins'; ctx.fillStyle = '#3b2a6a'; ctx.textAlign = 'center'; const s = 'Today is my hundredth birthday.'; const n = Math.floor(s.length * ph(a, 0.1, 0.75)); ctx.fillText(s.slice(0, n), 0, -60); ctx.restore();
    K.etiqueta(ctx, a, 'PAGE 1', 360, 200, { size: 40 }); if (ph(a, 0.8, 0.9) > 0) big(ctx, '!', 1700, 300, 200, '#ff3b4e', { k: ph(a, 0.8, 0.9) }); },
  // 73 — Te tiemblan las manos; lo levantas a la luz y reconoces la letra (contraluz)
  73: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { SET.atico(ctx, a.t, { hora: 'noche' }); K.prop(ctx, 'bombilla', 1300, 200, 0.8, a.t); K.radial(ctx, 1300, 220, 520, '#fff3b0', 0.7);
      const tr = Math.sin(a.t * 30) * 4 * ph(a, 0.1, 0.4);
      const y = D(K, ctx, a, YOU, 760, 1050, 1.15, { pose: 'levanta', mood: 'sorpresa', mira: 1 });
      ctx.save(); ctx.translate(1150 + tr, 380); ctx.rotate(-0.15); K.R(ctx, -150, -110, 300, 220, 8, 'rgba(245,236,210,0.9)', 6); ctx.globalAlpha = 0.5; for (let i = 0; i < 4; i++) ln(ctx, [[-120, -60 + i * 40], [100, -60 + i * 40]], '#3b2a6a', 5); ctx.restore(); }, { de: 1, a: 1.2, foco: [1000, 500] });
    K.luz(ctx, a, { tono: 'noche', foco: [1200, 380] }); },
  // 74 — Es la tuya: lo escribiste y lo olvidaste (comparación de firmas)
  74: (ctx, a, K) => { const { YOU } = cast(K);
    dato(K, ctx, '#1a0f22', '#3a1a42', '#ff6bd5');
    const sig = (x, y, col) => { ctx.save(); ctx.translate(x, y); ctx.strokeStyle = col; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); for (let i = 0; i <= 60; i++) { const u = i / 60; const px = -260 + u * 520, py = Math.sin(u * 14) * 50 * (1 - u * 0.5) - u * 30; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); ctx.restore(); };
    K.R(ctx, 160, 260, 700, 340, 16, '#f5ecd2', 8); K.R(ctx, 1060, 260, 700, 340, 16, '#ffffff', 8); sig(510, 430, '#3b2a6a'); sig(1410, 430, '#3b2a6a');
    K.text(ctx, 'THE DIARY', 510, 220, { size: 44, color: '#fff' }); K.text(ctx, 'YOU, TODAY', 1410, 220, { size: 44, color: '#fff' });
    big(ctx, '=', W / 2, 430, 160, '#ffd93d', { k: ph(a, 0.3, 0.4) }); big(ctx, "IT'S YOURS.", W / 2, 820, 140, '#ff6bd5', { k: ph(a, 0.5, 0.65) });
    D(K, ctx, a, YOU, 1700, 1200, 0.7, { pose: 'sorpresa', mood: 'shocked', mira: -1 }); },
  // 75 — Comenta: ¿qué se rompería primero? Tres botones para votar
  75: (ctx, a, K) => { const { YOU } = cast(K);
    sky(ctx, '#1c1440', '#352a6a'); K.radial(ctx, W / 2, 500, 900, '#7b6cff', 0.3);
    [['BODY', '#ff6b6b', 'corazon'], ['MONEY', '#6bcb77', 'bolsa_dinero'], ['MIND', '#4d96ff', 'cerebro']].forEach(([t, c, p], i) => { const x = 420 + i * 540, k = ph(a, 0.1 + i * 0.12, 0.2 + i * 0.12), bob = Math.sin(a.t * 3 + i) * 8; ctx.save(); ctx.globalAlpha = k; K.R(ctx, x - 200, 300 + bob, 400, 360, 40, c, 9); K.prop(ctx, p, x, 450 + bob, 0.8, a.t); ctx.restore(); big(ctx, t, x, 600 + bob, 70, '#fff', { k }); });
    D(K, ctx, a, YOU, 960, 1100, 0.6, { pose: 'senala', mood: 'feliz' }); K.etiqueta(ctx, a, 'COMMENT BELOW 👇', 760, 150, { size: 50, p0: 0.05 }); },
  // 76 — Próximo vídeo: ¿y si nunca volvieras a dormir? (tú con ojeras frente a una cama vacía)
  76: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { SET.dormitorio(ctx, a.t, { hora: 'noche' });
      K.prop(ctx, 'reloj_digital', 1450, 560, 0.7, a.t);
      const y = D(K, ctx, a, YOU, 760, 1010, 1.05, { pose: 'cansado', mood: 'cansado', mira: 1 }); K.mareo(ctx, a, y.cabeza, y.hr); }, { de: 1, a: 1.12, foco: [960, 600] });
    K.cartel(ctx, a, 'NEXT: NEVER SLEEP AGAIN?', W / 2, 170, { tipo: 'amarillo', size: 54, p0: 0.2 }); K.luz(ctx, a, { tono: 'noche' }); },
});

// ===================== PORTADA =====================
export function portada(ctx, K) {
  const { YOU } = cast(K), a = { t: 1.2, d: 4, params: {}, WW: W, WH: H };
  sky(ctx, '#1a0f33', '#3a1a5a'); K.radial(ctx, 1300, 520, 900, '#ffb347', 0.55);
  ctx.save(); ctx.translate(1300, 520); for (let i = 0; i < 22; i++) { ctx.rotate(Math.PI * 2 / 22); ctx.fillStyle = 'rgba(255,220,150,0.08)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(1400, -80); ctx.lineTo(1400, 80); ctx.fill(); } ctx.restore();
  tarta(K, ctx, 1560, 1080, 1.05, 60, 1.2);
  ctx.save(); ctx.shadowColor = 'rgba(255,255,255,0.9)'; ctx.shadowBlur = 36; D(K, ctx, a, YOU, 1150, 1180, 1.75, { pose: 'sorpresa', mira: -1, mood: 'sorpresa' }); ctx.restore();
  D(K, ctx, a, YOU, 1150, 1180, 1.75, { pose: 'sorpresa', mira: -1, mood: 'sorpresa' });
  ctx.save(); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
  const lt = (s, x, yy, size, col, rot = 0) => { ctx.save(); ctx.translate(x, yy); ctx.rotate(rot); ctx.font = `${size}px Anton`; ctx.lineWidth = size * 0.2; ctx.strokeStyle = '#05040f'; ctx.strokeText(s, 0, 0); ctx.fillStyle = col; ctx.fillText(s, 0, 0); ctx.restore(); };
  lt('AGE', 70, 360, 260, '#ffffff', -0.04); lt('1,000', 60, 650, 300, '#ffd93d', -0.04);
  ctx.restore();
  ctx.save(); ctx.translate(80, 740); ctx.rotate(-0.04); K.R(ctx, 0, 0, 640, 140, 70, '#e8132b', 10); ctx.font = '96px Anton'; ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.fillText('WHAT BREAKS?', 320, 76); ctx.restore();
  const v = ctx.createRadialGradient(W / 2, H / 2, 700, W / 2, H / 2, 1250); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.5)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}
