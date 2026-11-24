// Escenas a medida de largo-18-01: «What If You Could See Who Has a Crush on You?»
// Historia inventada (idea propia del canal): personajes genéricos, sin marcas. Números rosas y hilos que solo ve el protagonista.
// Horizontal: se ve x ≈ -860…1940 e y ≈ 230…1810 (los subtítulos tapan abajo: lo importante en y 350-1350).

import { SET, fig, cam, fg, glow, shade } from '../../lib/sets.mjs';
import { plano, actor, etiqueta, pastilla, panel, cifra, bocadillo, confeti, motas } from '../../lib/cine.mjs';

const PINK = '#ff4fa3', PINK2 = '#ffc2e0';
const SK = [
  { light: '#f6d3b3', dark: '#d29a72', ear: '#d9a07a', neck: '#c98e66' },
  { light: '#e8b48a', dark: '#b97a50', ear: '#c18559', neck: '#a96f47' },
  { light: '#c98d60', dark: '#8a5434', ear: '#94603c', neck: '#7c4c2e' },
  { light: '#b47a52', dark: '#6e4229', ear: '#7e4c30', neck: '#5f3922' },
  { light: '#8a5636', dark: '#4a2a18', ear: '#5a331e', neck: '#40251a' },
];
const CAST = {
  jogger: { skin: SK[3], hair: 'ponytail', hairColor: '#1a100a', outfit: '#ff7a59', female: true },
  suit: { skin: SK[0], hair: 'side', hairColor: '#4a2c17', outfit: '#2f2f36' },
  granny: { skin: SK[1], hair: 'bun', hairColor: '#e4e4e4', outfit: '#8c3a6b', glasses: true, female: true },
  bench: { skin: SK[2], hair: 'bald', hairColor: '#1a100a', outfit: '#3d6b2f', beard: true, glasses: true },
  qb: { skin: SK[1], hair: 'short', hairColor: '#d8b46a', outfit: '#c0392b' },
  quiet: { skin: SK[4], hair: 'curly', hairColor: '#1a100a', outfit: '#6b6b20', glasses: true },
  cheer: { skin: SK[0], hair: 'ponytail', hairColor: '#b07a3a', outfit: '#ff8a00', female: true, earrings: true },
  band: { skin: SK[2], hair: 'long', hairColor: '#2b1a10', outfit: '#5b3a7a', female: true, earrings: true },
  paper: { skin: SK[3], hair: 'buzz', hairColor: '#1a100a', outfit: '#1d5c8c', glasses: true },
  crush: { skin: SK[1], hair: 'long', hairColor: '#8c2e16', outfit: '#1f5c4a', female: true, earrings: true },
  lab: { skin: SK[2], hair: 'side', hairColor: '#1a100a', outfit: '#a8571d' },
  boss: { skin: SK[0], hair: 'bun', hairColor: '#2b1a10', outfit: '#2b3a66', glasses: true, female: true },
  intern: { skin: SK[1], hair: 'short', hairColor: '#7a4a22', outfit: '#4f8fd0' },
  hr: { skin: SK[3], hair: 'afro', hairColor: '#1a100a', outfit: '#7a2333', glasses: true, female: true },
  director: { skin: SK[2], hair: 'bald', hairColor: '#1a100a', outfit: '#1f1f26', mustache: true },
  mia: { skin: SK[2], hair: 'long', hairColor: '#4a2c17', outfit: '#ff6fa3', female: true, earrings: true },
  bf: { skin: SK[0], hair: 'side', hairColor: '#b07a3a', outfit: '#2f2f36', beard: true },
  jess: { skin: SK[1], hair: 'ponytail', hairColor: '#d8b46a', outfit: '#1d5c8c', female: true },
  hood: { skin: SK[2], hair: 'buzz', hairColor: '#1a100a', outfit: '#3a3f4a', beard: true },
  x1: { skin: SK[4], hair: 'afro', hairColor: '#1a100a', outfit: '#1f5c4a' },
  x2: { skin: SK[0], hair: 'long', hairColor: '#d8b46a', outfit: '#7a2333', female: true },
  x3: { skin: SK[3], hair: 'short', hairColor: '#2b1a10', outfit: '#a8571d' },
  x4: { skin: SK[1], hair: 'bun', hairColor: '#7a4a22', outfit: '#1d5c8c', female: true },
};
const EXTRAS = ['x1', 'x2', 'x3', 'x4', 'cheer', 'paper', 'band', 'lab'];
const pp = (a, n, o = {}) => ({ ...a.who, glasses: false, beard: false, mustache: false, earrings: false, female: false, ...(CAST[n] || {}), ...o });
const you = (a, o = {}) => ({ ...a.who, ...o });

function bg(ctx, K, c1, c2) { const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, c1); g.addColorStop(1, c2); ctx.fillStyle = g; ctx.fillRect(K.X0, 0, K.XW, 1920); }
function floor(ctx, K, y, col, line = true) { ctx.fillStyle = col; ctx.fillRect(K.X0, y, K.XW, 1920 - y); if (line) { ctx.fillStyle = K.INK; ctx.fillRect(K.X0, y - 4, K.XW, 8); } }
function veil(ctx, K, col, al) { if (al <= 0) return; ctx.globalAlpha = Math.min(1, al); ctx.fillStyle = col; ctx.fillRect(K.X0, 0, K.XW, 1920); ctx.globalAlpha = 1; }
// Persona de pie con los pies en fy; devuelve la y de lo alto de la cabeza
const SZ = 1.45; // personajes más grandes y con más detalle
function stand(ctx, a, K, x, fy, s, w, mood = 'neutral', o = {}) { s *= SZ; const y = fy - 2290 * s + (o.still ? 0 : Math.sin(a.t * 2.2 + x * 0.01) * 4); K.drawFullBody(ctx, x, y, s, w, { mood, t: a.t, ...o }); return y - 330 * s; }
function heartPath(ctx, x, y, s) { ctx.beginPath(); ctx.moveTo(x, y + s * 0.55); ctx.bezierCurveTo(x - s * 1.25, y - s * 0.25, x - s * 0.55, y - s * 1.1, x, y - s * 0.4); ctx.bezierCurveTo(x + s * 0.55, y - s * 1.1, x + s * 1.25, y - s * 0.25, x, y + s * 0.55); ctx.closePath(); }
function heart(ctx, K, x, y, s, col = PINK, lw = 8) { heartPath(ctx, x, y, s); ctx.fillStyle = col; ctx.fill(); if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = K.INK; ctx.lineJoin = 'round'; ctx.stroke(); } }
// Número rosa brillante (un corazón con la cifra) flotando sobre una cabeza
function tag(ctx, K, x, y, n, k = 1, t = 0, sz = 1, col = PINK) {
  if (k <= 0) return; const s = K.ease.outBack(K.clamp(k)) * sz * (1 + Math.sin(t * 4 + x) * 0.04);
  ctx.save(); ctx.translate(x, y + Math.sin(t * 2.5 + x) * 8); ctx.scale(s, s);
  K.radial(ctx, 0, -10, 150, col, 0.5); heart(ctx, K, 0, 0, 80, col, 7); K.text(ctx, String(n), 0, -18, { size: 78, color: '#ffffff' });
  ctx.restore();
}
// Hilo rosa brillante de (x1,y1) a (x2,y2), dibujado hasta k; devuelve el extremo
function thread(ctx, K, x1, y1, x2, y2, k = 1, t = 0, bend = -220, col = PINK, w = 9) {
  k = K.clamp(k); if (k <= 0) return [x1, y1];
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + bend, n = 48, m = Math.max(1, Math.round(n * k));
  const pt = (u) => [(1 - u) ** 2 * x1 + 2 * (1 - u) * u * mx + u * u * x2, (1 - u) ** 2 * y1 + 2 * (1 - u) * u * my + u * u * y2 + Math.sin(u * 10 + t * 3) * 6 * Math.sin(u * Math.PI)];
  for (const [lw, c, al] of [[w * 3.2, col, 0.22], [w, col, 1], [w * 0.35, '#ffffff', 0.9]]) {
    ctx.globalAlpha = al; ctx.lineWidth = lw; ctx.strokeStyle = c; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
    for (let i = 0; i <= m; i++) { const [x, y] = pt(i / n); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
  }
  ctx.globalAlpha = 1; const [sx, sy] = pt(((t * 0.45) % 1) * k); K.C(ctx, sx, sy, w * 1.1, '#ffffff', 0);
  return pt(k);
}
function city(ctx, K, t, night = false) {
  bg(ctx, K, night ? '#10163a' : '#8fd3ff', night ? '#3b2a5a' : '#ffe1b8');
  if (night) for (let i = 0; i < 70; i++) K.C(ctx, K.X0 + (i * 397) % K.XW, 260 + (i * 131) % 400, 3, '#ffffff', 0);
  for (let i = 0; i < 30; i++) {
    const x = K.X0 + i * 125, h = 300 + ((i * 97) % 420), c = night ? ['#262c55', '#2e3462', '#20264a'][i % 3] : ['#9bb3d6', '#b9c7e0', '#8aa2c8'][i % 3];
    K.R(ctx, x, 1130 - h, 118, h + 10, 4, c, 6);
    for (let r = 0; r < Math.floor(h / 80) - 1; r++) for (let q = 0; q < 2; q++) { const on = night ? ((i * 7 + r * 3 + q) % 4 !== 0) : true; ctx.fillStyle = on ? (night ? '#ffd76b' : '#e8f4ff') : '#1a1d33'; ctx.fillRect(x + 20 + q * 48, 1160 - h + r * 80, 30, 40); }
  }
  floor(ctx, K, 1130, night ? '#3a3d4c' : '#a8acb8'); ctx.fillStyle = night ? '#55596a' : '#c9ccd6'; ctx.fillRect(K.X0, 1130, K.XW, 70);
}
function park(ctx, K, t) {
  bg(ctx, K, '#9fe0ff', '#e6fbff'); K.C(ctx, 1600, 420, 90, '#ffe066', 8);
  for (let i = 0; i < 9; i++) { const x = K.X0 + 200 + i * 400; K.R(ctx, x - 22, 830, 44, 340, 10, '#8a5a34', 7); for (let j = 0; j < 3; j++) K.C(ctx, x + (j - 1) * 80, 780 - (j % 2) * 70 + Math.sin(t + i + j) * 4, 120, ['#4fae5a', '#3f9150', '#5fc36a'][j], 7); }
  floor(ctx, K, 1150, '#6fcf6a'); ctx.fillStyle = '#e8d3a2'; ctx.beginPath(); ctx.ellipse(540, 1500, 1400, 160, 0, 0, 7); ctx.fill();
}
function bench(ctx, K, x, y) { K.R(ctx, x - 230, y - 90, 460, 34, 10, '#b5723a', 6); K.R(ctx, x - 230, y - 30, 460, 34, 10, '#b5723a', 6); K.R(ctx, x - 200, y, 24, 110, 6, '#3a3a44', 5); K.R(ctx, x + 176, y, 24, 110, 6, '#3a3a44', 5); }
function hallway(ctx, K, t) {
  bg(ctx, K, '#f6e7c8', '#efd9ae');
  for (let i = 0; i < 30; i++) { const x = K.X0 + i * 120; K.R(ctx, x + 6, 430, 108, 760, 8, i % 2 ? '#4a7bd0' : '#3f6cc0', 6); for (let v = 0; v < 3; v++) K.R(ctx, x + 30, 470 + v * 26, 60, 10, 4, '#2b3a66', 0); K.C(ctx, x + 90, 800, 9, '#d9d9de', 3); }
  floor(ctx, K, 1190, '#d9c49a'); for (let i = 0; i < 20; i++) { ctx.fillStyle = 'rgba(0,0,0,0.06)'; ctx.fillRect(K.X0 + i * 200, 1190, 6, 700); }
}
function classroom(ctx, K, t) {
  bg(ctx, K, '#fff1d6', '#f7ddb0'); K.R(ctx, -300, 380, 1100, 420, 20, '#2f5d46', 12); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '60px Poppins'; ctx.fillText('H2O + NaCl', -200, 520); ctx.fillText('pH = 7', -200, 620);
  for (let i = 0; i < 3; i++) { const x = 1050 + i * 300; K.R(ctx, x, 380, 240, 360, 10, '#bfe6ff', 8); ctx.fillStyle = K.INK; ctx.fillRect(x + 116, 380, 8, 360); }
  floor(ctx, K, 1220, '#c9a46e');
}
function desk(ctx, K, x, y, w = 300) { K.R(ctx, x - w / 2, y, w, 34, 8, '#d9a066', 6); K.R(ctx, x - w / 2 + 20, y + 34, 20, 120, 4, '#6b4a2b', 4); K.R(ctx, x + w / 2 - 40, y + 34, 20, 120, 4, '#6b4a2b', 4); }
function office(ctx, K, t) {
  bg(ctx, K, '#e9f1f7', '#d6e3ee');
  for (let i = 0; i < 6; i++) { const x = K.X0 + 250 + i * 600; K.R(ctx, x, 360, 380, 420, 12, '#bfe6ff', 8); ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(x + 40, 380, 30, 380); }
  floor(ctx, K, 1210, '#8d97a8'); for (let i = 0; i < 18; i++) { ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(K.X0 + i * 220, 1210, 110, 700); }
}
function computer(ctx, K, x, y, s = 1, glow = '#4cc9f0') { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); K.R(ctx, -110, -150, 220, 150, 12, '#2f2f36', 6); K.R(ctx, -96, -136, 192, 120, 6, glow, 0); K.R(ctx, -20, 0, 40, 30, 4, '#5b5f6b', 4); ctx.restore(); }
function livingroom(ctx, K, t, night = false) {
  bg(ctx, K, night ? '#3d3560' : '#ffe6c9', night ? '#2a2445' : '#f6cfa4');
  K.R(ctx, 1150, 400, 420, 460, 14, night ? '#1a2350' : '#bfe6ff', 10); if (night) { K.C(ctx, 1450, 520, 40, '#fff6d0', 0); }
  K.R(ctx, -650, 450, 260, 320, 10, '#c97b4a', 8); K.C(ctx, -520, 600, 70, '#ffd166', 6);
  floor(ctx, K, 1230, night ? '#4b3b2e' : '#b07a4a'); K.E(ctx, 540, 1350, 700, 70, night ? '#5b2d4a' : '#c94b6b', 0, 6);
}
function sofa(ctx, K, x, y, col = '#5b6bd0') { K.R(ctx, x - 380, y - 260, 760, 200, 60, col, 8); K.R(ctx, x - 420, y - 120, 840, 160, 40, col, 8); K.R(ctx, x - 460, y - 200, 110, 240, 40, col, 8); K.R(ctx, x + 350, y - 200, 110, 240, 40, col, 8); }
function bedroom(ctx, K, t, night = true) {
  bg(ctx, K, night ? '#1d2147' : '#ffe9d6', night ? '#2b2f5c' : '#fbd7b4');
  K.R(ctx, 1200, 400, 360, 420, 14, night ? '#0e1330' : '#bfe6ff', 10); if (night) { K.C(ctx, 1460, 520, 50, '#fff3c4', 0); for (let i = 0; i < 6; i++) K.C(ctx, 1240 + i * 50, 700 - (i % 3) * 90, 4, '#fff', 0); }
  floor(ctx, K, 1260, night ? '#3b3350' : '#c99a6b');
}
function phone(ctx, K, x, y, s, draw, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  K.R(ctx, -170, -330, 340, 660, 50, '#1b1c25', 10); ctx.save(); ctx.beginPath(); ctx.roundRect(-148, -300, 296, 600, 34); ctx.clip(); ctx.fillStyle = '#ffffff'; ctx.fillRect(-148, -300, 296, 600); if (draw) draw(); ctx.restore();
  K.R(ctx, -40, -318, 80, 12, 6, '#33343f', 0); ctx.restore();
}
function subwayCar(ctx, K, t, flick = 0) {
  bg(ctx, K, '#3a3527', '#2a261c');
  for (let i = 0; i < 7; i++) { const x = K.X0 + 120 + i * 520; K.R(ctx, x, 420, 380, 300, 30, '#0b0d16', 10); const q = ((t * 1.6 + i * 0.37) % 1); ctx.fillStyle = 'rgba(255,220,140,0.6)'; ctx.fillRect(x + 380 - q * 380, 480, 60, 8); }
  for (let i = 0; i < 14; i++) K.R(ctx, K.X0 + i * 260, 300, 12, 900, 6, '#c9c9cf', 4);
  K.R(ctx, K.X0, 930, K.XW, 110, 20, '#c07a2a', 8); K.R(ctx, K.X0, 1030, K.XW, 120, 10, '#a3651f', 8);
  floor(ctx, K, 1200, '#4a4a52');
  const lit = 0.8 + 0.2 * Math.sin(t * 30) * flick; veil(ctx, K, '#000', (1 - lit) * 0.9);
  K.radial(ctx, 540, 260, 900, '#ffd76b', 0.25);
}
function mirror(ctx, K, x, y, w, h, inner) { K.R(ctx, x - w / 2 - 24, y - h / 2 - 24, w + 48, h + 48, 40, '#d9a066', 10); ctx.save(); ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, 26); ctx.clip(); const g = ctx.createLinearGradient(x - w / 2, y - h / 2, x + w / 2, y + h / 2); g.addColorStop(0, '#d9f1ff'); g.addColorStop(1, '#a8cfe6'); ctx.fillStyle = g; ctx.fillRect(x - w / 2, y - h / 2, w, h); if (inner) inner(); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.moveTo(x - w / 2 + 40, y - h / 2); ctx.lineTo(x - w / 2 + 140, y - h / 2); ctx.lineTo(x - w / 2, y + 60); ctx.lineTo(x - w / 2, y - 40); ctx.fill(); ctx.restore(); }
function bigQ(ctx, K, x, y, k, t, col = '#ffd166') { K.text(ctx, '?', x, y + Math.sin(t * 4) * 10, { size: 220, color: col, k }); }
function confetti(ctx, K, t, n = 60, x0 = -700, x1 = 1800) { for (let i = 0; i < n; i++) { const x = x0 + ((i * 173) % (x1 - x0)), y = 200 + ((t * 300 + i * 97) % 1300); ctx.save(); ctx.translate(x + Math.sin(t * 3 + i) * 30, y); ctx.rotate(t * 4 + i); ctx.fillStyle = ['#ff4fa3', '#ffd166', '#4cc9f0', '#2ec27e', '#7b5cff'][i % 5]; ctx.fillRect(-12, -6, 24, 12); ctx.restore(); } }
function tears(ctx, K, x, y, t) { for (let i = 0; i < 2; i++) { const q = (t * 0.9 + i * 0.5) % 1; K.E(ctx, x + i * 70 - 35, y + q * 120, 10, 16, '#8fd3ff', 0, 3); } }
function sweat(ctx, K, x, y, t) { for (let i = 0; i < 3; i++) { const q = (t * 1.2 + i * 0.33) % 1; K.E(ctx, x + i * 40 - 40, y + q * 120, 10, 15, '#8fd3ff', 0, 3); } }
function heartbeat(ctx, K, x, y, s, t) { const p = 1 + 0.18 * Math.max(0, Math.sin(t * 9)); heart(ctx, K, x, y, s * p, '#ff3b5c', 8); }
function chart(ctx, K, x, y, w, h, k, col = '#2ec27e') { K.R(ctx, x, y, w, h, 20, '#ffffff', 8); ctx.lineWidth = 14; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.beginPath(); for (let i = 0; i <= 20 * k; i++) { const u = i / 20; const yy = y + h - 40 - (h - 90) * (u ** 2.2); i ? ctx.lineTo(x + 40 + u * (w - 80), yy) : ctx.moveTo(x + 40, yy); } ctx.stroke(); }
const fmt = (n) => Math.round(n).toLocaleString('en-US');

export default {
  // 0 What if you could see who likes you? -> tú en primer plano y, poco a poco, un corazón rosa con «?» que aparece sobre tu cabeza
  0: (ctx, a, K) => {
    bg(ctx, K, '#2b1a4a', '#ff7ab8'); for (let i = 0; i < 14; i++) heart(ctx, K, -700 + i * 200, 1400 - ((a.t * 120 + i * 90) % 1200), 24 + (i % 3) * 10, 'rgba(255,255,255,0.35)', 0);
    K.midShot(ctx, you(a), { x: 540, y: 900, s: 0.8, mood: 'shocked', t: a.t });
    const k = K.ph(a.t, a.d, 0.2, 0.6); tag(ctx, K, 540, 330, '?', k, a.t, 1.4);
    thread(ctx, K, -700, 1200, 470, 420, K.ph(a.t, a.d, 0.5, 0.95), a.t, -300); thread(ctx, K, 1800, 1100, 610, 420, K.ph(a.t, a.d, 0.55, 1), a.t, -260);
  },
  // 1 Despiertas y un número rosa flota sobre cada cabeza -> dormitorio: te incorporas en la cama, frotándote los ojos; por la ventana, cabezas con números
  1: (ctx, a, K) => {
    bedroom(ctx, K, a.t, false);
    K.R(ctx, -300, 1000, 900, 220, 40, '#ffffff', 9); K.R(ctx, -300, 1060, 900, 200, 30, '#7b9cff', 9); K.R(ctx, -380, 820, 100, 440, 30, '#b5723a', 8);
    const up = K.ease.out(K.ph(a.t, a.d, 0, 0.3)); K.face(ctx, you(a), -150, 960 - up * 120, 0.42, { mood: up > 0.9 ? 'shocked' : 'neutral', t: a.t, closed: up < 0.5 });
    for (let i = 0; i < 4; i++) { stand(ctx, a, K, 1250 + i * 90, 820, 0.07, pp(a, EXTRAS[i])); tag(ctx, K, 1250 + i * 90, 600, [3, 1, 5, 0][i], K.ph(a.t, a.d, 0.35 + i * 0.1, 0.5 + i * 0.1), a.t, 0.45); }
    K.text(ctx, '!', 60, 650, { size: 200, color: '#ff4fa3', k: K.ph(a.t, a.d, 0.7, 0.85) });
  },
  // 2 Hilos rosas unen a cada admirador con su amor; solo tú los ves. Quédate hasta el final: hay un giro
  2: (ctx, a, K) => {
    city(ctx, K, a.t, false); const xs = [-600, -250, 150, 520, 900, 1280, 1650];
    xs.forEach((x, i) => stand(ctx, a, K, x, 1340, 0.13, pp(a, EXTRAS[i % EXTRAS.length]), i === 3 ? 'happy' : 'neutral'));
    [[0, 3], [1, 3], [5, 2], [6, 4], [4, 1]].forEach(([f, to], j) => thread(ctx, K, xs[f], 1050, xs[to], 1010, K.ph(a.t, a.d, j * 0.1, 0.35 + j * 0.1), a.t, -260 - j * 30));
    stand(ctx, a, K, 520, 1340, 0.16, you(a), 'shocked'); K.text(ctx, 'ONLY YOU', 520, 640, { size: 110, color: PINK, k: K.ph(a.t, a.d, 0.55, 0.7) });
    K.text(ctx, 'TWIST AHEAD', 1500, 480, { size: 90, color: '#ffd166', rot: -0.08, k: K.ph(a.t, a.d, 0.8, 0.95) });
  },
  // 3 Al espejo del baño: tu reflejo NO tiene número. Recuérdalo
  3: (ctx, a, K) => {
    bg(ctx, K, '#d9f3f0', '#b6e2dc'); for (let i = 0; i < 30; i++) for (let j = 0; j < 8; j++) { ctx.strokeStyle = 'rgba(0,0,0,0.06)'; ctx.lineWidth = 3; ctx.strokeRect(K.X0 + i * 120, 300 + j * 120, 120, 120); }
    K.R(ctx, -500, 1180, 2200, 120, 20, '#ffffff', 9); K.E(ctx, 540, 1200, 220, 40, '#e6eef2', 0, 6);
    mirror(ctx, K, 540, 760, 640, 720, () => { K.face(ctx, you(a), 540, 820, 0.55, { mood: 'shocked', t: a.t }); const k = K.ph(a.t, a.d, 0.3, 0.6); if (k > 0) { ctx.setLineDash([18, 14]); ctx.lineWidth = 8; ctx.strokeStyle = `rgba(255,79,163,${k})`; heartPath(ctx, 540, 520, 80); ctx.stroke(); ctx.setLineDash([]); } });
    K.text(ctx, 'NO NUMBER', 540, 300, { size: 100, color: PINK, k: K.ph(a.t, a.d, 0.5, 0.65) });
    K.text(ctx, 'REMEMBER THIS', 1500, 700, { size: 80, color: '#ffffff', rot: 0.06, k: K.ph(a.t, a.d, 0.75, 0.9) });
  },
  // 4 Una corredora pasa con un 2 rosa: dos desconocidos esperan que se fije en ellos
  4: (ctx, a, K) => {
    park(ctx, K, a.t); const x = -700 + K.ph(a.t, a.d, 0, 1) * 1600;
    const top = stand(ctx, a, K, x, 1360, 0.15, pp(a, 'jogger'), 'happy', { still: true }); tag(ctx, K, x, top - 70, 2, K.ph(a.t, a.d, 0.1, 0.25), a.t, 0.8);
    ctx.save(); for (let i = 0; i < 6; i++) { ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(x - 140 - i * 30, 1000 + i * 40); ctx.lineTo(x - 300 - i * 30, 1000 + i * 40); ctx.stroke(); } ctx.restore();
    const ys = [[1450, 1360, 'x3'], [1750, 1360, 'x1']]; ys.forEach(([sx, fy, n], i) => { stand(ctx, a, K, sx, fy, 0.13, pp(a, n), 'happy'); thread(ctx, K, sx, 1050, x, top + 40, K.ph(a.t, a.d, 0.3 + i * 0.1, 0.6 + i * 0.1), a.t, -200); });
  },
  // 5 Un hombre de traje tiene un 7… y está gritando a un parquímetro
  5: (ctx, a, K) => {
    city(ctx, K, a.t, false); const sh = K.shakeAt(a.t, a.d * 0.4, 10, 2);
    K.R(ctx, 820 + sh[0], 880, 60, 460, 10, '#5b5f6b', 7); K.R(ctx, 770 + sh[0], 760, 160, 180, 30, '#9aa0ad', 8); K.R(ctx, 800 + sh[0], 790, 100, 60, 10, '#1b2a3a', 4); K.text(ctx, '0:00', 850 + sh[0], 822, { size: 34, color: '#ff3b30' });
    const top = stand(ctx, a, K, 500, 1360, 0.16, pp(a, 'suit'), 'angry', { arms: 'up' }); tag(ctx, K, 500, top - 80, 7, K.ph(a.t, a.d, 0.05, 0.2), a.t, 0.9);
    K.text(ctx, '#@!%', 700, 600, { size: 110, color: '#ff3b30', rot: -0.1, k: K.ph(a.t, a.d, 0.35, 0.5) });
    for (let i = 0; i < 7; i++) { const ang = Math.PI * (0.15 + i * 0.12); thread(ctx, K, 500 + Math.cos(ang) * 1600, 1300 - Math.sin(ang) * 900, 500, top - 40, K.ph(a.t, a.d, 0.2 + i * 0.05, 0.5 + i * 0.05), a.t, -100); }
  },
  // 6 Una anciana da de comer a las palomas: un 1, y un hilo cruza el parque hasta un hombre en un banco
  6: (ctx, a, K) => {
    park(ctx, K, a.t); bench(ctx, K, 1350, 1260);
    const top = stand(ctx, a, K, -200, 1380, 0.15, pp(a, 'granny'), 'happy'); tag(ctx, K, -200, top - 70, 1, K.ph(a.t, a.d, 0.05, 0.2), a.t, 0.8);
    for (let i = 0; i < 6; i++) { const px = -400 + i * 90 + Math.sin(a.t * 3 + i) * 10, py = 1400 + (i % 2) * 30; K.E(ctx, px, py, 34, 24, '#9aa0ad', 0, 5); K.C(ctx, px + 26, py - 20, 16, '#8a909c', 4); K.P(ctx, [[px + 40, py - 22], [px + 56, py - 16], [px + 40, py - 12]], '#ffb347', 3); if ((a.t * 2 + i) % 2 < 0.4) K.C(ctx, px + 50, py + 20, 5, '#e8d3a2', 0); }
    const btop = stand(ctx, a, K, 1350, 1330, 0.14, pp(a, 'bench'), 'neutral');
    thread(ctx, K, 1350, btop + 120, -200, top + 30, K.ph(a.t, a.d, 0.3, 0.85), a.t, -380);
  },
  // 7 Ella no lo sabe, él no lo sabe, y tú eres el único en la Tierra que lo sabe
  7: (ctx, a, K) => {
    bg(ctx, K, '#1b1f4a', '#3a2a6a'); K.prop(ctx, 'tierra', 540, 1500, 1.8, a.t);
    const k = K.ph(a.t, a.d, 0, 0.35); K.face(ctx, pp(a, 'granny'), -500, 700, 0.45, { mood: 'neutral', t: a.t }); K.face(ctx, pp(a, 'bench'), 1600, 700, 0.45, { mood: 'neutral', t: a.t });
    K.text(ctx, '?', -500, 430, { size: 130, color: '#ffffff', k }); K.text(ctx, '?', 1600, 430, { size: 130, color: '#ffffff', k });
    thread(ctx, K, -400, 760, 1500, 760, K.ph(a.t, a.d, 0.2, 0.6), a.t, -260);
    K.face(ctx, you(a), 540, 980, 0.5, { mood: 'worried', t: a.t }); K.prop(ctx, 'llave_antigua', 760, 1120, 0.4, a.t, 0.5);
    K.text(ctx, 'ONLY YOU KNOW', 540, 340, { size: 100, color: PINK, k: K.ph(a.t, a.d, 0.6, 0.75) });
  },
  // 8 El corazón te late fuerte: cientos de hilos cruzan la ciudad como telarañas rosas
  8: (ctx, a, K) => {
    city(ctx, K, a.t, true); const N = 26;
    for (let i = 0; i < N; i++) { const x1 = K.X0 + 300 + ((i * 331) % 3000), x2 = K.X0 + 300 + ((i * 577 + 900) % 3000); thread(ctx, K, x1, 700 + (i % 5) * 80, x2, 760 + (i % 4) * 90, K.ph(a.t, a.d, (i / N) * 0.5, 0.4 + (i / N) * 0.5), a.t, -150 - (i % 4) * 80, PINK, 6); }
    heartbeat(ctx, K, 540, 1200, 120, a.t); K.radial(ctx, 540, 1150, 260, '#ff3b5c', 0.35 + 0.2 * Math.sin(a.t * 9));
  },
  // 9 ¿Qué pasa cuando una persona normal conoce los sentimientos secretos de todos? Escuela, trabajo, amistad, el mundo
  9: (ctx, a, K) => {
    bg(ctx, K, '#ffe6f2', '#ffd1e8'); const items = [['🏫', 'SCHOOL', '#4a7bd0'], ['💼', 'WORK', '#2f2f36'], ['🤝', 'FRIENDS', '#2ec27e'], ['🌍', 'WORLD', '#7b5cff']];
    items.forEach(([, lbl, col], i) => { const k = K.ph(a.t, a.d, 0.1 + i * 0.15, 0.3 + i * 0.15); if (k <= 0) return; const x = -450 + i * 660; ctx.save(); ctx.translate(x, 800); ctx.scale(K.ease.outBack(k), K.ease.outBack(k)); K.R(ctx, -260, -260, 520, 520, 60, col, 10); K.text(ctx, lbl, 0, 170, { size: 80, color: '#ffffff' }); ctx.restore();
      if (i === 0) K.prop(ctx, 'castillo', x, 760, 0.5 * k, a.t); if (i === 1) K.prop(ctx, 'ordenador', x, 760, 0.5 * k, a.t); if (i === 2) K.prop(ctx, 'mano', x, 760, 0.5 * k, a.t); if (i === 3) K.prop(ctx, 'tierra', x, 760, 0.55 * k, a.t); });
    for (let i = 0; i < 3; i++) thread(ctx, K, -450 + i * 660 + 260, 800, -450 + (i + 1) * 660 - 260, 800, K.ph(a.t, a.d, 0.3 + i * 0.15, 0.45 + i * 0.15), a.t, -120);
  },
  // 10 El pasillo del instituto se ilumina como fuegos artificiales rosas
  10: (ctx, a, K) => {
    hallway(ctx, K, a.t); const xs = [-700, -420, -150, 150, 430, 760, 1060, 1350, 1640];
    xs.forEach((x, i) => { const top = stand(ctx, a, K, x, 1380, 0.12, pp(a, EXTRAS[i % EXTRAS.length])); tag(ctx, K, x, top - 60, [2, 0, 5, 1, 3, 9, 0, 4, 2][i], K.ph(a.t, a.d, i * 0.05, 0.15 + i * 0.05), a.t, 0.6); });
    for (let i = 0; i < 6; i++) { const q = K.ph(a.t, a.d, 0.25 + i * 0.1, 0.55 + i * 0.1); if (q > 0 && q < 1) K.starBurst(ctx, -500 + i * 420, 450 + (i % 2) * 120, 120 * q, PINK, 1 - q); }
    for (let i = 0; i < 5; i++) thread(ctx, K, xs[i], 1100, xs[8 - i], 1080, K.ph(a.t, a.d, 0.3 + i * 0.08, 0.6 + i * 0.08), a.t, -240);
  },
  // 11 El quarterback al que todos adoran tiene un gran cero
  11: (ctx, a, K) => {
    hallway(ctx, K, a.t); for (let i = 0; i < 5; i++) stand(ctx, a, K, -600 + i * 180 + (i > 2 ? 1500 : 0), 1400, 0.11, pp(a, EXTRAS[i]), 'happy', { arms: 'up' });
    const top = stand(ctx, a, K, 540, 1400, 0.18, pp(a, 'qb'), 'happy', { arms: 'cross' }); K.text(ctx, '12', 540, 1120, { size: 90, color: '#ffffff' });
    const k = K.ph(a.t, a.d, 0.35, 0.6); tag(ctx, K, 540, top - 110, 0, k, a.t, 1.3, '#b9b9c6'); K.text(ctx, 'ZERO', 980, 520, { size: 120, color: '#ffffff', rot: 0.1, k: K.ph(a.t, a.d, 0.6, 0.75) });
  },
  // 12 Sonrisa segura, pero algo triste: ser popular y ser querido son cosas distintas
  12: (ctx, a, K) => {
    bg(ctx, K, '#f6e7c8', '#e9cf9c'); const k = K.ph(a.t, a.d, 0.3, 0.7);
    K.midShot(ctx, pp(a, 'qb'), { x: 540, y: 900, s: 0.75, mood: k > 0.5 ? 'sad' : 'happy', t: a.t });
    const sc = K.ease.outBack(K.ph(a.t, a.d, 0.5, 0.75)); if (sc > 0) { ctx.save(); ctx.translate(-450, 800); ctx.scale(sc, sc); K.R(ctx, -280, -180, 560, 360, 40, '#ffd166', 10); K.text(ctx, 'POPULAR', 0, 0, { size: 100, color: '#ffffff' }); ctx.restore(); ctx.save(); ctx.translate(1530, 800); ctx.scale(sc, sc); K.R(ctx, -280, -180, 560, 360, 40, PINK, 10); K.text(ctx, 'LIKED', 0, 0, { size: 100, color: '#ffffff' }); ctx.restore(); }
    K.text(ctx, '≠', 540, 340, { size: 200, color: '#ff3b30', k: K.ph(a.t, a.d, 0.7, 0.85) });
  },
  // 13 El chico callado que come solo: sobre su cabeza, un 7
  13: (ctx, a, K) => {
    bg(ctx, K, '#fff3d9', '#f3dcae'); floor(ctx, K, 1220, '#d9c49a');
    for (let i = 0; i < 3; i++) { K.R(ctx, -700 + i * 520, 1100, 380, 30, 8, '#c9cfd8', 6); for (let j = 0; j < 3; j++) stand(ctx, a, K, -650 + i * 520 + j * 130, 1300, 0.09, pp(a, EXTRAS[(i * 3 + j) % 8]), 'happy'); }
    K.R(ctx, 1150, 1100, 460, 30, 8, '#c9cfd8', 6); const top = stand(ctx, a, K, 1380, 1320, 0.14, pp(a, 'quiet'), 'sad');
    K.R(ctx, 1300, 1060, 160, 40, 10, '#ff8a65', 5); K.prop(ctx, 'manzana', 1480, 1050, 0.25, a.t);
    tag(ctx, K, 1380, top - 80, 7, K.ph(a.t, a.d, 0.4, 0.6), a.t, 1.1); K.sparkles(ctx, 1380, top - 80, a.t, 10, 180);
  },
  // 14 Siete personas lo adoran en secreto, y él cree que nadie se fijaría en él
  14: (ctx, a, K) => {
    bg(ctx, K, '#2a2450', '#4a3a7a'); const k = K.ph(a.t, a.d, 0.05, 0.3);
    K.midShot(ctx, pp(a, 'quiet'), { x: 540, y: 950, s: 0.7, mood: 'sad', t: a.t });
    for (let i = 0; i < 7; i++) { const ang = Math.PI * (0.05 + i * 0.15), r = 1200; const x = 540 + Math.cos(ang + Math.PI) * r, y = 900 - Math.sin(ang) * 500; heart(ctx, K, x, y, 44, PINK, 6); thread(ctx, K, x, y, 540, 620, K.ph(a.t, a.d, 0.15 + i * 0.06, 0.45 + i * 0.06), a.t, -60, PINK, 7); }
    K.text(ctx, 'NOBODY NOTICES ME…', 540, 1400, { size: 70, color: '#ffffff', k: K.ph(a.t, a.d, 0.6, 0.75) });
  },
  // 15 Un hilo de una animadora, uno de una chica de la banda y uno del chico del periódico
  15: (ctx, a, K) => {
    hallway(ctx, K, a.t); const qtop = stand(ctx, a, K, 540, 1400, 0.15, pp(a, 'quiet'), 'neutral'); tag(ctx, K, 540, qtop - 70, 7, 1, a.t, 0.8);
    const L = [['cheer', -550, 'POM'], ['band', 1250, 'TRUMPET'], ['paper', 1700, 'PAPER']];
    L.forEach(([n, x], i) => { const k = K.ph(a.t, a.d, i * 0.25, 0.25 + i * 0.25); if (k <= 0) return; const top = stand(ctx, a, K, x, 1400, 0.14, pp(a, n), 'happy');
      if (i === 0) { K.C(ctx, x - 130, 1150, 60, '#ffd166', 6); K.C(ctx, x + 130, 1150, 60, '#ffd166', 6); } if (i === 1) { K.R(ctx, x + 60, 1080, 160, 40, 16, '#f2c14e', 6); K.C(ctx, x + 230, 1100, 40, '#f2c14e', 6); } if (i === 2) { K.R(ctx, x - 200, 1050, 140, 180, 6, '#ffffff', 5); for (let j = 0; j < 5; j++) { ctx.fillStyle = '#888'; ctx.fillRect(x - 185, 1080 + j * 28, 110, 8); } }
      thread(ctx, K, x, top + 60, 540, qtop + 60, k, a.t, -260); });
  },
  // 16 Casi vas a decírselo, pero te quedas helado: ¿cómo explicas algo tan imposible?
  16: (ctx, a, K) => {
    hallway(ctx, K, a.t); stand(ctx, a, K, 1300, 1400, 0.15, pp(a, 'quiet'), 'neutral');
    const step = K.ease.out(K.ph(a.t, a.d, 0, 0.35)); const x = -300 + step * 600; stand(ctx, a, K, x, 1400, 0.16, you(a), step > 0.9 ? 'worried' : 'happy', { still: step > 0.9 });
    const fr = K.ph(a.t, a.d, 0.4, 0.6); if (fr > 0) { ctx.save(); ctx.globalAlpha = fr * 0.6; ctx.fillStyle = '#bfe9ff'; ctx.fillRect(x - 160, 960, 320, 460); ctx.restore(); for (let i = 0; i < 6; i++) K.P(ctx, [[x - 180 + i * 70, 950], [x - 150 + i * 70, 900], [x - 120 + i * 70, 950]], '#e6f7ff', 4); }
    K.text(ctx, 'HOW DO I EXPLAIN THIS?', 540, 560, { size: 80, color: '#ffffff', k: K.ph(a.t, a.d, 0.6, 0.75) });
  },
  // 17 Ves a tu crush venir hacia clase; el corazón se acelera mientras buscas el hilo hacia ti
  17: (ctx, a, K) => {
    hallway(ctx, K, a.t); const x = 1800 - K.ease.out(K.ph(a.t, a.d, 0, 0.7)) * 900;
    const ctop = stand(ctx, a, K, x, 1400, 0.16, pp(a, 'crush'), 'happy'); K.sparkles(ctx, x, ctop + 120, a.t, 8, 220);
    stand(ctx, a, K, -200, 1400, 0.17, you(a), 'shocked'); heartbeat(ctx, K, -150, 1050, 50, a.t);
    for (let i = 0; i < 3; i++) K.text(ctx, '?', 150 + i * 120, 700 + Math.sin(a.t * 3 + i) * 20, { size: 90, color: PINK, k: K.ph(a.t, a.d, 0.4 + i * 0.1, 0.55 + i * 0.1) });
  },
  // 18 Sigues la línea rosa desde su cabeza: cruza el aula, por encima de los pupitres y junto a las ventanas
  18: (ctx, a, K) => {
    classroom(ctx, K, a.t); for (let i = 0; i < 4; i++) { desk(ctx, K, -450 + i * 650, 1180, 340); }
    const ctop = stand(ctx, a, K, -650, 1420, 0.15, pp(a, 'crush'), 'happy');
    const k = K.ph(a.t, a.d, 0.05, 0.95); const [ex, ey] = thread(ctx, K, -650, ctop + 30, 1700, 900, k, a.t, -500);
    K.C(ctx, ex, ey, 26, '#ffffff', 6); for (let i = 0; i < 4; i++) K.C(ctx, ex - i * 40, ey + i * 10, 14 - i * 3, PINK2, 0);
  },
  // 19 No apunta a ti: apunta a tu compañero de laboratorio, el que te pidió un lápiz ayer
  19: (ctx, a, K) => {
    classroom(ctx, K, a.t); desk(ctx, K, 700, 1180, 700);
    stand(ctx, a, K, 480, 1420, 0.15, you(a), 'shocked'); const ltop = stand(ctx, a, K, 920, 1420, 0.15, pp(a, 'lab'), 'happy');
    K.R(ctx, 900, 1140, 160, 18, 8, '#ffd166', 4); K.P(ctx, [[1060, 1140], [1090, 1149], [1060, 1158]], '#f6d3b3', 3);
    thread(ctx, K, -800, 800, 920, ltop + 40, K.ph(a.t, a.d, 0, 0.5), a.t, -300);
    K.text(ctx, 'NOT YOU', 480, 650, { size: 110, color: '#ff3b30', k: K.ph(a.t, a.d, 0.55, 0.7), rot: -0.06 });
  },
  // 20 Se te cae el estómago: tu crush quiere a tu compañero, y solo tú lo sabes
  20: (ctx, a, K) => {
    bg(ctx, K, '#2a2c50', '#45305f'); const drop = K.ease.in(K.ph(a.t, a.d, 0.15, 0.6));
    K.midShot(ctx, you(a), { x: 540, y: 900, s: 0.75, mood: 'sad', t: a.t });
    K.prop(ctx, 'estomago', 1400, 500 + drop * 800, 0.7, a.t); for (let i = 0; i < 4; i++) { ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(1320 + i * 50, 300 + drop * 800); ctx.lineTo(1320 + i * 50, 150 + drop * 800); ctx.stroke(); }
    K.face(ctx, pp(a, 'crush'), -550, 650, 0.3, { mood: 'happy', t: a.t }); K.face(ctx, pp(a, 'lab'), -550, 1150, 0.3, { mood: 'happy', t: a.t }); thread(ctx, K, -550, 720, -550, 1060, 1, a.t, 120);
  },
  // 21 ¿Se lo cuentas? ¿Lo saboteas? ¿O te quedas callado con el mayor secreto del instituto?
  21: (ctx, a, K) => {
    bg(ctx, K, '#fff1e0', '#ffd9b8'); K.face(ctx, you(a), 540, 1050, 0.45, { mood: 'worried', t: a.t });
    const opts = [['TELL', '#2ec27e', 'telefono_antiguo'], ['SABOTAGE', '#ff3b30', 'bomba'], ['STAY SILENT', '#7b5cff', 'llave_antigua']];
    opts.forEach(([lbl, col, pr], i) => { const k = K.ph(a.t, a.d, i * 0.25, 0.2 + i * 0.25); if (k <= 0) return; const x = -350 + i * 890, s = K.ease.outBack(k); ctx.save(); ctx.translate(x, 520); ctx.scale(s, s); K.R(ctx, -300, -150, 600, 300, 50, col, 10); K.text(ctx, lbl, 0, 70, { size: 70, color: '#ffffff' }); ctx.restore(); K.prop(ctx, pr, x, 470, 0.35 * s, a.t); });
  },
  // 22 Decides callar, pero los hilos tiran de ti todo el día: cada mirada parece una peli
  22: (ctx, a, K) => {
    classroom(ctx, K, a.t); for (let i = 0; i < 3; i++) desk(ctx, K, -450 + i * 900, 1200, 380);
    stand(ctx, a, K, 540, 1420, 0.16, you(a), 'neutral', { arms: 'none' }); K.R(ctx, 480, 1030, 120, 30, 15, '#ff3b30', 5);
    for (let i = 0; i < 4; i++) { const x = [-650, -250, 1250, 1650][i]; const top = stand(ctx, a, K, x, 1420, 0.13, pp(a, EXTRAS[i]), i % 2 ? 'happy' : 'neutral'); thread(ctx, K, x, top + 40, 540 + (i < 2 ? -40 : 40), 1100, 0.5 + 0.5 * Math.abs(Math.sin(a.t * 2 + i)), a.t, -200); }
    for (let i = 0; i < 3; i++) { const x = -300 + i * 900; K.R(ctx, x - 90, 450, 180, 120, 12, '#1b1c25', 6); K.C(ctx, x - 40, 510, 20, PINK, 0); K.C(ctx, x + 40, 510, 20, PINK, 0); }
  },
  // 23 A la hora de comer sabes más de tus compañeros que cien diarios
  23: (ctx, a, K) => {
    bg(ctx, K, '#fff3d9', '#f3dcae'); floor(ctx, K, 1260, '#d9c49a');
    for (let i = 0; i < 10; i++) { const k = K.ph(a.t, a.d, i * 0.06, 0.15 + i * 0.06); if (k <= 0) continue; ctx.save(); ctx.translate(-600 + (i % 5) * 330, 520 + Math.floor(i / 5) * 360); ctx.rotate((i % 3 - 1) * 0.12); ctx.scale(k, k); K.R(ctx, -120, -150, 240, 300, 16, ['#ff8a65', '#7b5cff', '#4cc9f0', '#2ec27e', '#ffd166'][i % 5], 8); K.R(ctx, -90, -110, 180, 50, 8, '#ffffff', 0); heart(ctx, K, 0, 50, 40, PINK, 5); ctx.restore(); }
    const k2 = K.ph(a.t, a.d, 0.6, 0.8); K.text(ctx, '× 100', 540, 1180, { size: 120, color: '#ffffff', k: k2 });
    K.face(ctx, you(a), 1550, 950, 0.45, { mood: 'happy', t: a.t }); K.prop(ctx, 'lupa', 1450, 1080, 0.5, a.t, -0.4);
  },
  // 24 Te fijas en el chico callado: siete hilos, todos atascados en silencio, esperando a que alguien se atreva
  24: (ctx, a, K) => {
    bg(ctx, K, '#2b2f5c', '#41356e'); const qtop = stand(ctx, a, K, 540, 1400, 0.17, pp(a, 'quiet'), 'sad'); tag(ctx, K, 540, qtop - 80, 7, 1, a.t, 0.9);
    for (let i = 0; i < 7; i++) { const x = -750 + i * 400 + (i >= 3 ? 400 : 0); if (i === 3) continue; const top = stand(ctx, a, K, x, 1400, 0.11, pp(a, EXTRAS[i]), 'worried'); const [ex, ey] = thread(ctx, K, x, top + 40, 540, qtop + 80, 0.55, a.t, -200); K.C(ctx, ex, ey, 18, '#ffffff', 5); K.text(ctx, '…', ex, ey - 50, { size: 70, color: '#ffffff', k: 0.6 + 0.4 * Math.sin(a.t * 3 + i) }); }
    K.text(ctx, 'STUCK IN SILENCE', 540, 380, { size: 90, color: PINK, k: K.ph(a.t, a.d, 0.5, 0.65) });
  },
  // 25 Haces algo pequeño: le dices a la chica de la banda «Oye, a él también le gusta la música». Un empujoncito
  25: (ctx, a, K) => {
    hallway(ctx, K, a.t); stand(ctx, a, K, 200, 1400, 0.16, you(a), 'happy'); const btop = stand(ctx, a, K, 650, 1400, 0.16, pp(a, 'band'), 'shocked');
    const k = K.ph(a.t, a.d, 0.1, 0.4); if (k > 0) { ctx.save(); ctx.translate(-100, 650); ctx.scale(K.ease.outBack(k), K.ease.outBack(k)); K.R(ctx, -330, -110, 660, 220, 50, '#ffffff', 8); K.P(ctx, [[150, 100], [250, 180], [220, 100]], '#ffffff', 0); ctx.fillStyle = K.INK; ctx.font = '48px Poppins'; ctx.textAlign = 'center'; ctx.fillText('"He likes music too."', 0, 16); ctx.restore(); }
    for (let i = 0; i < 4; i++) { const q = (a.t * 0.8 + i * 0.25) % 1; ctx.fillStyle = K.INK; ctx.font = '70px Poppins'; ctx.fillText('♪', 700 + q * 600, btop - q * 200); }
    stand(ctx, a, K, 1550, 1400, 0.14, pp(a, 'quiet'), 'neutral'); const nk = K.ph(a.t, a.d, 0.55, 0.85); K.R(ctx, 380, 1060, 60 + nk * 100, 24, 12, '#ffd166', 4);
  },
  // 26 El viernes ya se sientan juntos: tu empujoncito encendió algo. Fue increíble… y solo era el principio
  26: (ctx, a, K) => {
    bg(ctx, K, '#ffe8d1', '#ffc9a6'); floor(ctx, K, 1260, '#d9a066'); K.R(ctx, 150, 1080, 780, 36, 10, '#c97b4a', 7);
    stand(ctx, a, K, 360, 1400, 0.14, pp(a, 'quiet'), 'happy'); stand(ctx, a, K, 720, 1400, 0.14, pp(a, 'band'), 'happy');
    thread(ctx, K, 360, 1100, 720, 1100, 1, a.t, -160); const k = K.ph(a.t, a.d, 0.2, 0.5); if (k > 0) K.sparkles(ctx, 540, 980, a.t, 14, 300);
    K.R(ctx, -700, 420, 400, 140, 20, '#ffffff', 8); K.text(ctx, 'FRIDAY', -500, 490, { size: 80, color: '#ff4fa3' });
    K.face(ctx, you(a), 1600, 1000, 0.45, { mood: 'happy', t: a.t }); K.text(ctx, 'JUST THE BEGINNING', 540, 380, { size: 80, color: '#ffffff', k: K.ph(a.t, a.d, 0.7, 0.85) });
  },
  // 27 Lunes por la mañana en la oficina: de pronto la cafetera es lo menos interesante
  27: (ctx, a, K) => {
    office(ctx, K, a.t); for (let i = 0; i < 4; i++) { desk(ctx, K, -400 + i * 620, 1160, 360); computer(ctx, K, -400 + i * 620, 1160, 0.8); const top = stand(ctx, a, K, -400 + i * 620 + 160, 1400, 0.12, pp(a, EXTRAS[i + 3])); tag(ctx, K, -400 + i * 620 + 160, top - 60, [1, 4, 0, 2][i], K.ph(a.t, a.d, 0.3 + i * 0.08, 0.45 + i * 0.08), a.t, 0.55); }
    K.R(ctx, 1500, 950, 240, 320, 20, '#5b5f6b', 8); K.R(ctx, 1560, 1150, 120, 90, 10, '#ffffff', 5); K.smoke(ctx, 1620, 1100, a.t, 4, 'rgba(255,255,255,0.7)');
    K.text(ctx, 'MONDAY', -650, 420, { size: 100, color: '#2b3a66', k: K.ph(a.t, a.d, 0, 0.15) });
  },
  // 28 Tu jefa, seria, que nunca sonríe, tiene un 3: tres admiradores y ella ni idea
  28: (ctx, a, K) => {
    office(ctx, K, a.t); const top = stand(ctx, a, K, 540, 1420, 0.19, pp(a, 'boss'), 'angry', { arms: 'cross' }); tag(ctx, K, 540, top - 100, 3, K.ph(a.t, a.d, 0.2, 0.4), a.t, 1.1);
    for (let i = 0; i < 3; i++) { const x = [-500, 1400, 1750][i]; const t2 = stand(ctx, a, K, x, 1400, 0.12, pp(a, EXTRAS[i + 4]), 'happy'); thread(ctx, K, x, t2 + 40, 540, top + 80, K.ph(a.t, a.d, 0.35 + i * 0.1, 0.7 + i * 0.1), a.t, -220); }
    K.R(ctx, 380, 1000, 320, 60, 10, '#ffffff', 5); K.text(ctx, 'NO CLUE', 540, 1032, { size: 40, color: '#2b3a66' });
  },
  // 29 Su propio hilo sale de ella y cruza la oficina hasta el becario nuevo, de 22 años
  29: (ctx, a, K) => {
    office(ctx, K, a.t); const btop = stand(ctx, a, K, -400, 1420, 0.17, pp(a, 'boss'), 'happy'); desk(ctx, K, 1500, 1180, 380); computer(ctx, K, 1500, 1180, 0.8);
    const itop = stand(ctx, a, K, 1500, 1440, 0.14, pp(a, 'intern'), 'neutral');
    const [ex, ey] = thread(ctx, K, -400, btop + 60, 1500, itop + 40, K.ph(a.t, a.d, 0.1, 0.7), a.t, -420); K.C(ctx, ex, ey, 14, '#ffffff', 0);
    K.R(ctx, 1380, 1100, 240, 70, 14, '#ffffff', 6); K.text(ctx, 'INTERN · 22', 1500, 1137, { size: 40, color: '#2b3a66' });
  },
  // 30 Tu jefa enamorada de un chico de 22 que le reporta a ella: una demanda esperando a pasar
  30: (ctx, a, K) => {
    office(ctx, K, a.t); stand(ctx, a, K, -300, 1420, 0.15, pp(a, 'boss'), 'happy'); stand(ctx, a, K, 300, 1420, 0.14, pp(a, 'intern'), 'worried');
    ctx.lineWidth = 10; ctx.strokeStyle = '#2b3a66'; ctx.beginPath(); ctx.moveTo(-300, 900); ctx.lineTo(300, 900); ctx.stroke(); K.P(ctx, [[300, 900], [260, 880], [260, 920]], '#2b3a66', 0); K.text(ctx, 'REPORTS TO', 0, 840, { size: 50, color: '#2b3a66' });
    const k = K.ph(a.t, a.d, 0.35, 0.6); if (k > 0) { ctx.save(); ctx.translate(1300, 820); ctx.rotate(-0.08); ctx.scale(K.ease.outBack(k), K.ease.outBack(k)); K.R(ctx, -260, -330, 520, 660, 16, '#ffffff', 8); K.text(ctx, 'LAWSUIT', 0, -230, { size: 80, color: '#ff3b30' }); for (let i = 0; i < 6; i++) { ctx.fillStyle = '#9aa0ad'; ctx.fillRect(-200, -120 + i * 60, 400, 16); } ctx.restore(); }
    const w = K.ph(a.t, a.d, 0.6, 0.9); if (w > 0) K.flash(ctx, a.t, a.d * 0.62, 0.15, '255,80,80');
  },
  // 31 Durante una semana la ves rondar su mesa, dándole los mejores proyectos; todo el equipo se da cuenta
  31: (ctx, a, K) => {
    office(ctx, K, a.t); desk(ctx, K, 540, 1180, 400); computer(ctx, K, 540, 1180, 0.8); stand(ctx, a, K, 540, 1440, 0.14, pp(a, 'intern'), 'worried');
    const hx = 120 + Math.sin(a.t * 1.6) * 90; stand(ctx, a, K, hx, 1420, 0.15, pp(a, 'boss'), 'happy');
    for (let i = 0; i < 3; i++) { const q = K.ph(a.t, a.d, 0.15 + i * 0.2, 0.35 + i * 0.2); if (q <= 0) continue; const x = hx + (540 - hx) * K.ease.out(q), y = 980 - Math.sin(q * Math.PI) * 200 - i * 40; K.R(ctx, x - 70, y - 50, 140, 100, 10, '#ffd166', 6); K.prop(ctx, 'estrella', x, y, 0.15, a.t); }
    for (let i = 0; i < 3; i++) { const x = [1250, 1500, 1750][i]; stand(ctx, a, K, x, 1420, 0.12, pp(a, EXTRAS[i]), 'shocked'); K.text(ctx, 'O_O', x, 820, { size: 50, color: '#2b3a66', k: K.ph(a.t, a.d, 0.5 + i * 0.1, 0.6 + i * 0.1) }); }
  },
  // 32 No puedes ignorarlo más: entras en Recursos Humanos, cierras la puerta: «Tenemos que hablar»
  32: (ctx, a, K) => {
    bg(ctx, K, '#efe6d6', '#e2d3b8'); floor(ctx, K, 1240, '#9a7a56'); K.R(ctx, 1200, 520, 360, 720, 10, '#b5723a', 9); K.C(ctx, 1500, 880, 18, '#ffd166', 5);
    const close = K.ph(a.t, a.d, 0.15, 0.4); ctx.save(); ctx.translate(1200, 520); ctx.scale(1 - close * 0.0, 1); ctx.restore(); if (close < 1) { K.R(ctx, 1200, 520, 360 * (1 - close), 720, 10, '#3a2a1a', 0); }
    K.R(ctx, 1240, 440, 280, 60, 10, '#ffffff', 6); K.text(ctx, 'HR', 1380, 472, { size: 44, color: '#7a2333' });
    desk(ctx, K, 300, 1160, 520); stand(ctx, a, K, 120, 1440, 0.15, pp(a, 'hr'), 'neutral'); stand(ctx, a, K, 800, 1420, 0.16, you(a), 'worried');
    const k = K.ph(a.t, a.d, 0.5, 0.75); if (k > 0) { ctx.save(); ctx.translate(800, 620); ctx.scale(K.ease.outBack(k), K.ease.outBack(k)); K.R(ctx, -330, -100, 660, 200, 50, '#ffffff', 8); ctx.fillStyle = K.INK; ctx.font = '54px Poppins'; ctx.textAlign = 'center'; ctx.fillText('"We need to talk."', 0, 18); ctx.restore(); }
  },
  // 33 RR. HH. investiga en silencio: en un mes, la jefa cambia de departamento y el becario está a salvo
  33: (ctx, a, K) => {
    office(ctx, K, a.t); const k = K.ease.inOut(K.ph(a.t, a.d, 0.25, 0.75));
    K.R(ctx, 1300, 600, 420, 620, 10, '#cfd6e0', 8); K.R(ctx, 1340, 640, 340, 80, 8, '#ffffff', 5); K.text(ctx, 'DEPT. B', 1510, 680, { size: 44, color: '#2b3a66' });
    const bx = -200 + k * 1700; stand(ctx, a, K, bx, 1420, 0.14, pp(a, 'boss'), 'sad'); K.R(ctx, bx + 70, 1150, 120, 100, 8, '#c97b4a', 6); K.prop(ctx, 'bombilla', bx + 130, 1110, 0.2, a.t);
    stand(ctx, a, K, 300, 1440, 0.14, pp(a, 'intern'), k > 0.8 ? 'happy' : 'neutral'); if (k > 0.8) K.sparkles(ctx, 300, 1000, a.t, 6, 160);
    for (let i = 0; i < 30; i++) { const day = i < k * 30; K.R(ctx, -700 + (i % 10) * 70, 400 + Math.floor(i / 10) * 70, 60, 60, 8, day ? '#ff8a65' : '#ffffff', 4); }
  },
  // 34 La empresa alucina: paraste un problema antes de que nadie pusiera una queja
  34: (ctx, a, K) => {
    office(ctx, K, a.t); for (let i = 0; i < 6; i++) stand(ctx, a, K, -600 + i * 450, 1420, 0.13, pp(a, EXTRAS[i]), 'shocked');
    const k = K.ph(a.t, a.d, 0.2, 0.5); ctx.save(); ctx.translate(540, 700); ctx.scale(K.ease.outBack(k), K.ease.outBack(k)); K.R(ctx, -280, -200, 560, 400, 20, '#ffffff', 9); K.text(ctx, 'COMPLAINTS', 0, -120, { size: 60, color: '#2b3a66' }); K.text(ctx, '0', 0, 60, { size: 200, color: '#2ec27e' }); ctx.restore();
    K.starBurst(ctx, 540, 700, 360 * K.ph(a.t, a.d, 0.45, 0.7), '#ffd166', 1 - K.ph(a.t, a.d, 0.6, 1));
  },
  // 35 Te llaman al despacho del director: título nuevo, aumento y mesa en la esquina
  35: (ctx, a, K) => {
    bg(ctx, K, '#2b3a66', '#1f2a4a'); for (let i = 0; i < 3; i++) K.R(ctx, -700 + i * 900, 380, 600, 700, 14, '#5b7fb5', 10); floor(ctx, K, 1240, '#6b4a2b');
    desk(ctx, K, 1350, 1150, 600); stand(ctx, a, K, 1450, 1430, 0.16, pp(a, 'director'), 'happy');
    stand(ctx, a, K, 400, 1420, 0.17, you(a), 'shocked');
    const ks = [['NEW TITLE', '#ffd166'], ['+ RAISE', '#2ec27e'], ['CORNER DESK', '#4cc9f0']];
    ks.forEach(([lbl, col], i) => { const k = K.ph(a.t, a.d, 0.25 + i * 0.2, 0.4 + i * 0.2); if (k <= 0) return; ctx.save(); ctx.translate(-300 + i * 0, 520 + i * 170); ctx.scale(K.ease.outBack(k), K.ease.outBack(k)); K.R(ctx, -260, -60, 520, 120, 30, col, 8); K.text(ctx, lbl, 0, 0, { size: 60, color: '#ffffff' }); ctx.restore(); });
    if (K.ph(a.t, a.d, 0.45, 0.6) > 0) K.prop(ctx, 'bolsa_dinero', 900, 1000 - K.ph(a.t, a.d, 0.45, 0.6) * 80, 0.4, a.t);
  },
  // 36 ¡Ascenso! Confeti, cupcakes, ovación… pero alguien susurra «¿Cómo lo sabías siempre?»
  36: (ctx, a, K) => {
    office(ctx, K, a.t); confetti(ctx, K, a.t); K.R(ctx, 340, 1080, 400, 40, 10, '#ffffff', 6); for (let i = 0; i < 4; i++) { K.R(ctx, 380 + i * 90, 1030, 60, 50, 8, '#c97b4a', 4); K.C(ctx, 410 + i * 90, 1020, 32, ['#ff8ab8', '#ffd166', '#bfe9ff', '#2ec27e'][i], 4); }
    stand(ctx, a, K, 540, 1420, 0.16, you(a), 'happy', { arms: 'up' }); for (let i = 0; i < 4; i++) stand(ctx, a, K, [-500, -150, 1250, 1650][i], 1420, 0.13, pp(a, EXTRAS[i]), 'happy', { arms: 'up' });
    const k = K.ph(a.t, a.d, 0.6, 0.8); if (k > 0) { stand(ctx, a, K, 1950 - k * 150, 1420, 0.13, pp(a, 'x3'), 'neutral'); K.R(ctx, 1150, 520, 640, 160, 50, '#1b1c25', 8); ctx.fillStyle = '#ffffff'; ctx.font = 'italic 46px Poppins'; ctx.textAlign = 'center'; ctx.fillText('"How did you always know?"', 1470, 615); }
  },
  // 37 Tus compañeros te miran distinto: unos te admiran, otros te temen, otros preguntan demasiado
  37: (ctx, a, K) => {
    office(ctx, K, a.t); stand(ctx, a, K, 540, 1420, 0.17, you(a), 'worried');
    const G = [['ADMIRE', '#2ec27e', 'happy', -600], ['AFRAID', '#4cc9f0', 'shocked', -150], ['QUESTIONS', '#ff8a00', 'angry', 1250]];
    G.forEach(([lbl, col, mood, x], i) => { const k = K.ph(a.t, a.d, i * 0.2, 0.25 + i * 0.2); if (k <= 0) return; for (let j = 0; j < 2; j++) stand(ctx, a, K, x + j * 200, 1420, 0.12, pp(a, EXTRAS[i * 2 + j]), mood); K.R(ctx, x - 60, 760, 330, 90, 20, col, 6); K.text(ctx, lbl, x + 105, 805, { size: 50, color: '#ffffff' }); if (i === 2) for (let q = 0; q < 3; q++) K.text(ctx, '?', x + q * 90, 650 + Math.sin(a.t * 4 + q) * 15, { size: 80, color: '#ff8a00' }); });
  },
  // 38 En la cafetería: «En serio, ¿lees mentes?» Te ríes, pero te sudan las manos bajo la mesa
  38: (ctx, a, K) => {
    bg(ctx, K, '#fff1e0', '#f6d8b5'); floor(ctx, K, 1260, '#c9a46e'); K.R(ctx, -100, 1060, 1300, 40, 10, '#ffffff', 7); K.R(ctx, -60, 1100, 1220, 300, 10, 'rgba(0,0,0,0.15)', 0);
    stand(ctx, a, K, 160, 1440, 0.15, pp(a, 'x2'), 'happy'); stand(ctx, a, K, 920, 1440, 0.15, you(a), 'happy');
    K.R(ctx, -380, 520, 600, 160, 50, '#ffffff', 8); ctx.fillStyle = K.INK; ctx.font = '44px Poppins'; ctx.textAlign = 'center'; ctx.fillText('"Do you read minds?"', -80, 615);
    K.prop(ctx, 'cerebro', 160, 780, 0.3, a.t); K.text(ctx, 'HA HA', 1180, 720, { size: 70, color: '#ffd166', k: K.ph(a.t, a.d, 0.3, 0.45) });
    const k = K.ph(a.t, a.d, 0.5, 0.7); if (k > 0) { K.C(ctx, 1100, 1250, 120 * k, 'rgba(255,255,255,0.6)', 6); K.prop(ctx, 'mano', 1100, 1250, 0.3 * k, a.t); sweat(ctx, K, 1100, 1180, a.t); }
  },
  // 39 Un poder que ayuda a la gente también puede hacer que te tengan miedo
  39: (ctx, a, K) => {
    bg(ctx, K, '#1b1f4a', '#3a2a6a'); const k = K.ph(a.t, a.d, 0.2, 0.7);
    K.midShot(ctx, you(a), { x: 540, y: 960, s: 0.7, mood: 'worried', t: a.t });
    ctx.save(); ctx.globalAlpha = 0.3 + 0.5 * k; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(540 + 600 * k, 1500, 700 + 400 * k, 160, 0, 0, 7); ctx.fill(); ctx.restore();
    K.R(ctx, -700, 520, 520, 180, 40, '#2ec27e', 8); K.text(ctx, 'HELP', -440, 610, { size: 90, color: '#ffffff' }); K.R(ctx, 1300, 520, 520, 180, 40, '#7a2333', 8); K.text(ctx, 'FEAR', 1560, 610, { size: 90, color: '#ffffff', k: K.ph(a.t, a.d, 0.4, 0.6) });
  },
  // 40 Tu mejor amiga desde tercero llama gritando de alegría: su novio va a pedirle matrimonio
  40: (ctx, a, K) => {
    livingroom(ctx, K, a.t); const sh = K.shakeAt(a.t, a.d * 0.1, 14, 1.2);
    ctx.save(); ctx.translate(sh[0], sh[1]); phone(ctx, K, 540, 820, 0.85, () => { bg(ctx, K, '#ffe6f2', '#ffc2e0'); K.face(ctx, pp(a, 'mia'), 0, -20, 0.36, { mood: 'happy', t: a.t }); }); ctx.restore();
    // (el teléfono se dibuja en coordenadas locales; la cara de Mia va dentro de su pantalla)
    K.text(ctx, '!!!', 1150, 520, { size: 140, color: PINK, rot: 0.1, k: K.ph(a.t, a.d, 0.1, 0.2) });
    const k = K.ph(a.t, a.d, 0.45, 0.65); if (k > 0) { ctx.save(); ctx.translate(-350, 700); ctx.rotate(-0.1); ctx.scale(K.ease.outBack(k), K.ease.outBack(k)); K.prop(ctx, 'diamante', 0, 0, 0.5, a.t); ctx.restore(); K.text(ctx, 'PROPOSAL!', -350, 1000, { size: 80, color: '#ffd166', k }); }
  },
  // 41 La abrazas en el salón: brilla, tiene un 4 sobre la cabeza y nunca ha estado tan feliz
  41: (ctx, a, K) => {
    livingroom(ctx, K, a.t); const k = K.ease.out(K.ph(a.t, a.d, 0, 0.3));
    stand(ctx, a, K, 300 + k * 120, 1420, 0.17, you(a), 'happy', { arms: 'up' }); const mtop = stand(ctx, a, K, 800 - k * 120, 1420, 0.17, pp(a, 'mia'), 'happy', { arms: 'up' });
    tag(ctx, K, 800 - k * 120, mtop - 90, 4, K.ph(a.t, a.d, 0.3, 0.5), a.t, 1); K.sparkles(ctx, 680, 1000, a.t, 12, 360);
    for (let i = 0; i < 6; i++) heart(ctx, K, 400 + i * 60, 900 - ((a.t * 120 + i * 60) % 400), 22, PINK2, 4);
  },
  // 42 Entra el novio con flores: tiene un 2, pero el hilo que manda no apunta a ella
  42: (ctx, a, K) => {
    livingroom(ctx, K, a.t); K.R(ctx, 1500, 520, 260, 720, 8, '#8a5a34', 8);
    const mtop = stand(ctx, a, K, 0, 1420, 0.16, pp(a, 'mia'), 'happy'); const x = 1900 - K.ease.out(K.ph(a.t, a.d, 0, 0.35)) * 600;
    const btop = stand(ctx, a, K, x, 1420, 0.17, pp(a, 'bf'), 'happy'); for (let i = 0; i < 5; i++) K.C(ctx, x - 200 + (i % 3) * 30, 1060 + Math.floor(i / 3) * 30, 22, ['#ff4fa3', '#ffd166', '#ff8a65'][i % 3], 4);
    tag(ctx, K, x, btop - 80, 2, K.ph(a.t, a.d, 0.3, 0.45), a.t, 0.9);
    const k = K.ph(a.t, a.d, 0.5, 0.9); thread(ctx, K, x, btop + 60, x + 900, 500, k, a.t, -150); K.text(ctx, 'NOT HER', 500, 600, { size: 100, color: '#ff3b30', k: K.ph(a.t, a.d, 0.8, 0.95) });
  },
  // 43 El hilo sale por la ventana, baja por la calle y llega hasta una compañera llamada Jessica
  43: (ctx, a, K) => {
    city(ctx, K, a.t, false); const k = K.ph(a.t, a.d, 0, 0.85);
    K.R(ctx, -780, 520, 360, 600, 10, '#ffe6c9', 8); K.R(ctx, -720, 600, 240, 260, 10, '#bfe6ff', 6); K.text(ctx, 'HOME', -600, 470, { size: 50, color: '#2b3a66' });
    const jtop = stand(ctx, a, K, 1700, 1380, 0.15, pp(a, 'jess'), 'happy'); K.R(ctx, 1560, 960, 280, 70, 14, '#ffffff', 6); K.text(ctx, 'JESSICA', 1700, 995, { size: 44, color: '#1d5c8c', k: K.ph(a.t, a.d, 0.7, 0.85) });
    const P2 = [[-600, 730], [-200, 1250], [600, 1230], [1200, 1100], [1700, jtop + 40]]; const seg = P2.length - 1;
    for (let i = 0; i < seg; i++) { const kk = K.clamp(k * seg - i); if (kk > 0) thread(ctx, K, P2[i][0], P2[i][1], P2[i + 1][0], P2[i + 1][1], kk, a.t, i % 2 ? 160 : -120); }
  },
  // 44 Se te retuerce el estómago: va a prometerle para siempre a tu amiga con el corazón apuntando a otra
  44: (ctx, a, K) => {
    bg(ctx, K, '#3a2440', '#5b2d4a'); K.midShot(ctx, pp(a, 'bf'), { x: 900, y: 920, s: 0.7, mood: 'happy', t: a.t });
    K.prop(ctx, 'diamante', 1150, 1250, 0.4, a.t); thread(ctx, K, 850, 1050, 1900, 300, 1, a.t, -100);
    K.face(ctx, you(a), -350, 900, 0.5, { mood: 'sad', t: a.t }); const tw = Math.sin(a.t * 6) * 0.1; K.prop(ctx, 'estomago', -350, 1400, 0.45, a.t, tw);
    K.text(ctx, 'FOREVER?', 540, 380, { size: 110, color: '#ffffff', k: K.ph(a.t, a.d, 0.4, 0.6) });
  },
  // 45 Puedes callar y dejar que haya boda, o romper el momento más feliz de su vida
  45: (ctx, a, K) => {
    bg(ctx, K, '#2b2f5c', '#41356e'); const tilt = Math.sin(a.t * 1.4) * 0.18;
    ctx.save(); ctx.translate(540, 900); ctx.rotate(tilt); K.R(ctx, -900, -20, 1800, 40, 20, '#d9a066', 8); ctx.restore(); K.P(ctx, [[540, 900], [460, 1150], [620, 1150]], '#8a5a34', 8);
    const lx = 540 - Math.cos(tilt) * 750, ly = 900 - Math.sin(tilt) * 750, rx = 540 + Math.cos(tilt) * 750, ry = 900 + Math.sin(tilt) * 750;
    K.prop(ctx, 'tarta_cumpleanos', lx, ly - 160, 0.6, a.t); K.text(ctx, 'SILENCE', lx, ly - 360, { size: 70, color: '#ffffff' });
    K.prop(ctx, 'bomba', rx, ry - 140, 0.55, a.t); K.text(ctx, 'TRUTH', rx, ry - 360, { size: 70, color: '#ff3b30' });
    K.face(ctx, you(a), 540, 1350, 0.3, { mood: 'worried', t: a.t });
  },
  // 46 Esa noche no duermes: miras el techo contando cada recuerdo con ella
  46: (ctx, a, K) => {
    bedroom(ctx, K, a.t, true); K.R(ctx, -200, 1050, 1300, 200, 40, '#5b6bd0', 9); K.R(ctx, -260, 980, 300, 120, 40, '#ffffff', 8);
    K.face(ctx, you(a), -110, 960, 0.4, { mood: 'worried', t: a.t });
    const mem = ['3RD GRADE', 'SLEEPOVER', 'ROAD TRIP', 'PROM', 'GRADUATION'];
    mem.forEach((m, i) => { const k = K.ph(a.t, a.d, i * 0.15, 0.2 + i * 0.15); if (k <= 0) return; const x = 200 + i * 300, y = 440 + (i % 2) * 140 + Math.sin(a.t + i) * 10; ctx.save(); ctx.translate(x, y); ctx.rotate((i % 2 ? 1 : -1) * 0.08); ctx.globalAlpha = Math.min(1, k * 1.5) * 0.9; K.R(ctx, -120, -90, 240, 180, 10, '#ffffff', 6); K.R(ctx, -100, -70, 200, 110, 4, '#ffe6f2', 0); K.face(ctx, you(a), 0, -15, 0.16, { mood: 'happy', t: a.t }); ctx.restore(); ctx.globalAlpha = 1; });
    // (las caras de los recuerdos se dibujan pequeñas con escala)
    K.text(ctx, '3:12 AM', 1650, 1100, { size: 70, color: '#ff3b30' });
  },
  // 47 Al día siguiente quedáis en el parque. Te tiembla la voz: «Tengo que contarte algo horrible»
  47: (ctx, a, K) => {
    park(ctx, K, a.t); bench(ctx, K, 540, 1300); stand(ctx, a, K, 360, 1370, 0.15, you(a), 'worried'); stand(ctx, a, K, 720, 1370, 0.15, pp(a, 'mia'), 'neutral');
    const k = K.ph(a.t, a.d, 0.35, 0.6); if (k > 0) { const sh = Math.sin(a.t * 30) * 4; ctx.save(); ctx.translate(100 + sh, 620); ctx.scale(K.ease.outBack(k), K.ease.outBack(k)); K.R(ctx, -420, -100, 840, 200, 50, '#ffffff', 8); ctx.fillStyle = K.INK; ctx.font = '44px Poppins'; ctx.textAlign = 'center'; ctx.fillText('"I have to tell you something awful."', 0, 16); ctx.restore(); }
  },
  // 48 Se lo explicas todo: los hilos, los números y el que lleva a Jessica. Ella solo te mira
  48: (ctx, a, K) => {
    park(ctx, K, a.t); stand(ctx, a, K, 200, 1400, 0.17, you(a), 'worried', { arms: 'up' }); stand(ctx, a, K, 900, 1400, 0.17, pp(a, 'mia'), 'shocked', { still: true });
    const items = [() => thread(ctx, K, -700, 600, -200, 520, 1, a.t, -100), () => tag(ctx, K, -450, 760, 4, 1, a.t, 0.7), () => { K.face(ctx, pp(a, 'jess'), -450, 1050, 0.3, { mood: 'happy', t: a.t }); }];
    items.forEach((f, i) => { const k = K.ph(a.t, a.d, i * 0.25, 0.2 + i * 0.25); if (k <= 0) return; ctx.save(); ctx.globalAlpha = k; f(); ctx.restore(); });
    K.text(ctx, '…', 900, 700, { size: 120, color: '#ffffff', k: K.ph(a.t, a.d, 0.7, 0.85) });
  },
  // 49 «Eso es una locura… ¿esperas que me lo crea?» Se le llenan los ojos de lágrimas y se aparta
  49: (ctx, a, K) => {
    park(ctx, K, a.t); const back = K.ease.out(K.ph(a.t, a.d, 0.4, 0.9));
    stand(ctx, a, K, 200, 1400, 0.17, you(a), 'sad'); stand(ctx, a, K, 850 + back * 400, 1400, 0.17, pp(a, 'mia'), 'sad');
    tears(ctx, K, 850 + back * 400, 1060 - 2290 * 0.17 + 900 * 0.17 - 200, a.t);
    K.R(ctx, 900, 470, 760, 170, 50, '#ffffff', 8); ctx.fillStyle = K.INK; ctx.font = '46px Poppins'; ctx.textAlign = 'center'; ctx.fillText('"You expect me to believe this?"', 1280, 570);
  },
  // 50 Esa noche se enfrenta a su novio: lo niega, se calla y al final admite que escribe a Jessica
  50: (ctx, a, K) => {
    livingroom(ctx, K, a.t, true); stand(ctx, a, K, 120, 1420, 0.17, pp(a, 'mia'), 'angry', { arms: 'cross' }); const ph3 = a.t / a.d;
    stand(ctx, a, K, 950, 1420, 0.17, pp(a, 'bf'), ph3 < 0.33 ? 'angry' : ph3 < 0.66 ? 'neutral' : 'sad');
    const L = ['"NO!"', '…', '"Okay. Jessica."']; const i = Math.min(2, Math.floor(ph3 * 3)); K.R(ctx, 950, 520, 620, 160, 50, '#ffffff', 8); ctx.fillStyle = K.INK; ctx.font = '52px Poppins'; ctx.textAlign = 'center'; ctx.fillText(L[i], 1260, 615);
    if (i === 2) phone(ctx, K, 1500, 1100, 0.35, () => { K.R(ctx, -130, -200, 220, 70, 20, '#4cc9f0', 0); K.R(ctx, -90, -100, 220, 70, 20, '#e6e6ee', 0); K.R(ctx, -130, 0, 220, 70, 20, '#4cc9f0', 0); }, 0.1);
  },
  // 51 Se cancela el compromiso. Pero en vez de darte las gracias, tu mejor amiga te bloquea
  51: (ctx, a, K) => {
    bg(ctx, K, '#3a2440', '#2a1d33'); K.prop(ctx, 'diamante', -400, 800, 0.6, a.t); const k = K.ph(a.t, a.d, 0.1, 0.35); if (k > 0) { ctx.lineWidth = 30; ctx.strokeStyle = '#ff3b30'; ctx.beginPath(); ctx.moveTo(-600, 600); ctx.lineTo(-600 + 400 * k, 600 + 400 * k); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-200, 600); ctx.lineTo(-200 - 400 * k, 600 + 400 * k); ctx.stroke(); }
    phone(ctx, K, 900, 850, 0.95, () => { bg(ctx, K, '#ffffff', '#f2f2f6'); K.face(ctx, pp(a, 'mia'), 0, -60, 0.4, { mood: 'angry', t: a.t }); const b = K.ph(a.t, a.d, 0.5, 0.7); if (b > 0) { ctx.save(); ctx.translate(540, 1050); ctx.scale(K.ease.outBack(b), K.ease.outBack(b)); K.R(ctx, -200, -70, 400, 140, 30, '#ff3b30', 6); K.text(ctx, 'BLOCKED', 0, 0, { size: 60, color: '#ffffff' }); ctx.restore(); } });
  },
  // 52 Mia dice que le has arruinado la vida: prefería ser feliz y equivocarse que sufrir y tener razón
  52: (ctx, a, K) => {
    bg(ctx, K, '#2b2033', '#45304f'); K.midShot(ctx, pp(a, 'mia'), { x: 540, y: 920, s: 0.7, mood: 'angry', t: a.t }); tears(ctx, K, 540, 860, a.t);
    const k = K.ph(a.t, a.d, 0.35, 0.6); K.R(ctx, -760, 520, 520, 180, 40, '#ffd166', 8); K.text(ctx, 'HAPPY + WRONG', -500, 610, { size: 56, color: '#ffffff' });
    K.R(ctx, 1320, 520, 520, 180, 40, '#7a2333', 8); K.text(ctx, 'HURT + RIGHT', 1580, 610, { size: 56, color: '#ffffff' });
    if (k > 0) { K.C(ctx, -500, 800, 70 * k, '#2ec27e', 6); K.text(ctx, '✓', -500, 800, { size: 80, color: '#ffffff', k }); K.C(ctx, 1580, 800, 70 * k, '#ff3b30', 6); K.text(ctx, '✗', 1580, 800, { size: 80, color: '#ffffff', k }); }
  },
  // 53 Solo en el sofá, con lágrimas: dijiste la verdad y te costó tu mejor amiga
  53: (ctx, a, K) => {
    livingroom(ctx, K, a.t, true); sofa(ctx, K, 540, 1300, '#4a4f80'); K.face(ctx, you(a), 540, 960, 0.4, { mood: 'sad', t: a.t }); K.R(ctx, 400, 1080, 280, 120, 40, a.who.outfit, 8);
    tears(ctx, K, 540, 1000, a.t); veil(ctx, K, '#0a0c20', 0.2 + 0.25 * K.ph(a.t, a.d, 0, 1));
    const k = K.ph(a.t, a.d, 0.3, 0.6); if (k > 0) { ctx.save(); ctx.translate(1400, 700); ctx.globalAlpha = k; K.R(ctx, -150, -110, 300, 220, 10, '#ffffff', 6); K.face(ctx, pp(a, 'mia'), 0, 0, 0.2, { mood: 'happy', t: a.t }); ctx.restore(); ctx.globalAlpha = 1; ctx.lineWidth = 14; ctx.strokeStyle = '#ff3b30'; ctx.beginPath(); ctx.moveTo(1260, 600); ctx.lineTo(1540, 800); ctx.stroke(); }
  },
  // 54 La parte cruel del poder: la verdad no siempre es un regalo; a veces parece un arma
  54: (ctx, a, K) => {
    bg(ctx, K, '#1b1f4a', '#2a1d33'); const k = K.ease.inOut(K.ph(a.t, a.d, 0.25, 0.7));
    ctx.save(); ctx.translate(540, 820); ctx.rotate(k * Math.PI); K.prop(ctx, 'regalo', 0, 0, 2.4 * (1 - k), a.t); K.prop(ctx, 'espada', 0, 0, 2.4 * k, a.t, -Math.PI * 0.75); ctx.restore();
    K.text(ctx, 'GIFT', 540 - 700 * (1 - k), 400, { size: 110, color: '#2ec27e', k: 1 - k }); K.text(ctx, 'WEAPON', 540 + 700 * (1 - k), 400, { size: 110, color: '#ff3b30', k });
  },
  // 55 Dejas de avisar y miras en silencio. Pero el poder tienta demasiado y empiezas a pensar en grande
  55: (ctx, a, K) => {
    city(ctx, K, a.t, true); for (let i = 0; i < 12; i++) thread(ctx, K, -700 + i * 230, 1000, -500 + ((i * 7) % 12) * 230, 980, 1, a.t, -160, PINK, 5);
    const z = 1 + K.ease.inOut(K.ph(a.t, a.d, 0.45, 1)) * 0.8; ctx.save(); ctx.translate(540, 900); K.face(ctx, you(a), 0, 0, 0.6 * z, { mood: 'neutral', t: a.t }); ctx.restore();
    const k = K.ph(a.t, a.d, 0.55, 0.8); K.prop(ctx, 'bombilla', 900, 450, 0.6 * k, a.t); if (k > 0) K.starBurst(ctx, 900, 450, 200 * k, '#ffd166', k);
    K.R(ctx, 380, 780, 320, 30, 15, '#ff3b30', 0);
  },
  // 56 Una noche tienes una idea: si no puedes decirlo en voz alta, construye algo que lo diga
  56: (ctx, a, K) => {
    bedroom(ctx, K, a.t, true); desk(ctx, K, 540, 1140, 600); computer(ctx, K, 540, 1140, 1.4, '#7b5cff'); stand(ctx, a, K, 120, 1440, 0.16, you(a), 'happy');
    const k = K.ph(a.t, a.d, 0.2, 0.5); K.prop(ctx, 'bombilla', 150, 600, 0.7 * K.ease.outBack(k), a.t); if (k > 0) K.radial(ctx, 150, 600, 300, '#ffd166', 0.5 * k);
    for (let i = 0; i < 6; i++) { const q = K.ph(a.t, a.d, 0.45 + i * 0.07, 0.55 + i * 0.07); ctx.fillStyle = '#ffffff'; ctx.globalAlpha = q; ctx.fillRect(420, 880 + i * 22, 80 + (i * 37) % 120, 10); } ctx.globalAlpha = 1;
  },
  // 57 Creas una app de citas llamada Pink: «¿A quién le gustas? 100% exacto»
  57: (ctx, a, K) => {
    bg(ctx, K, '#ffe6f2', '#ff9ccf'); const k = K.ph(a.t, a.d, 0, 0.3), s = K.ease.outBack(k);
    ctx.save(); ctx.translate(540, 820); ctx.scale(s, s); phone(ctx, K, 0, 0, 1.25, () => { bg(ctx, K, PINK, '#ff7ab8'); heart(ctx, K, 0, -130, 90, '#ffffff', 6); K.text(ctx, 'PINK', 0, 20, { size: 110, color: '#ffffff' }); ctx.fillStyle = '#ffffff'; ctx.font = '26px Poppins'; ctx.textAlign = 'center'; ctx.fillText('Who likes you?', 0, 120); K.R(ctx, -110, 170, 220, 70, 35, '#ffffff', 0); ctx.fillStyle = PINK; ctx.fillText('100% accurate', 0, 214); }); ctx.restore();
    for (let i = 0; i < 8; i++) heart(ctx, K, -600 + i * 340, 1350 - ((a.t * 200 + i * 130) % 1000), 30, '#ffffff', 5);
  },
  // 58 La app adivina a quién le gustas y nunca falla, porque tú la alimentas en secreto con lo que ves
  58: (ctx, a, K) => {
    bg(ctx, K, '#1f1a3a', '#3a2a6a'); K.face(ctx, you(a), -350, 900, 0.5, { mood: 'happy', t: a.t });
    for (let i = 0; i < 8; i++) { const q = ((a.t * 0.6 + i / 8) % 1); const x = -150 + q * 800, y = 850 + Math.sin(q * 6 + i) * 80; tag(ctx, K, x, y, (i * 3) % 9, 1, a.t, 0.35); }
    phone(ctx, K, 900, 850, 0.9, () => { bg(ctx, K, '#ffffff', '#fff0f7'); for (let j = 0; j < 4; j++) { const kk = K.ph(a.t, a.d, 0.2 + j * 0.15, 0.3 + j * 0.15); K.R(ctx, -130, -240 + j * 120, 260, 90, 20, kk > 0 ? '#ffe6f2' : '#f2f2f6', 4); if (kk > 0) K.text(ctx, '✓', 90, -195 + j * 120, { size: 50, color: '#2ec27e', k: kk }); } });
    K.R(ctx, 1300, 520, 460, 120, 30, '#2ec27e', 8); K.text(ctx, 'NEVER WRONG', 1530, 580, { size: 56, color: '#ffffff', k: K.ph(a.t, a.d, 0.7, 0.85) });
  },
  // 59 Los cien primeros usuarios: ven los nombres, mandan mensajes temblando… y todo acierta
  59: (ctx, a, K) => {
    bg(ctx, K, '#fff1e0', '#ffd9b8'); for (let i = 0; i < 10; i++) for (let j = 0; j < 4; j++) { const n = i + j * 10, k = K.ph(a.t, a.d, n / 40 * 0.7, n / 40 * 0.7 + 0.1); const x = -700 + i * 280, y = 450 + j * 230; if (k <= 0) { K.C(ctx, x, y, 40, '#e0d4c8', 4); continue; } K.face(ctx, pp(a, EXTRAS[n % 8]), x, y, 0.26, { mood: 'happy', t: a.t + n }); }
    // (cabezas pequeñas: se dibujan con escala por la persona por defecto)
    K.text(ctx, '100 / 100 ✓', 540, 1350, { size: 110, color: '#2ec27e', k: K.ph(a.t, a.d, 0.8, 0.95) });
  },
  // 60 En una semana, 10.000; en un mes, 10 millones. El móvil no para de vibrar
  60: (ctx, a, K) => {
    bg(ctx, K, '#1f1a3a', '#45305f'); const k = K.ph(a.t, a.d, 0, 0.9), n = k < 0.4 ? 10000 * (k / 0.4) : 10000 + (10_000_000 - 10000) * ((k - 0.4) / 0.6) ** 2;
    K.text(ctx, fmt(n), 540, 520, { size: 170, color: PINK }); K.text(ctx, k < 0.4 ? 'WEEK 1' : 'MONTH 1', 540, 700, { size: 70, color: '#ffffff' });
    const sh = Math.sin(a.t * 60) * 8; phone(ctx, K, 540 + sh, 1150, 0.55, () => { bg(ctx, K, '#ffffff', '#f2f2f6'); for (let j = 0; j < 5; j++) K.R(ctx, -130, -260 + j * 100 + ((a.t * 120) % 100), 260, 80, 16, '#ffe6f2', 4); }, sh * 0.005);
    for (let i = 0; i < 2; i++) { ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(540, 1150, 260 + i * 60 + ((a.t * 200) % 60), -0.6, 0.6); ctx.stroke(); ctx.beginPath(); ctx.arc(540, 1150, 260 + i * 60 + ((a.t * 200) % 60), Math.PI - 0.6, Math.PI + 0.6); ctx.stroke(); }
  },
  // 61 Las apps de citas se hunden: deslizar no tiene sentido si una máquina te dice quién te quiere
  61: (ctx, a, K) => {
    bg(ctx, K, '#2b2f5c', '#1b1f3a'); const k = K.ease.in(K.ph(a.t, a.d, 0.2, 0.8));
    for (let i = 0; i < 3; i++) { const x = -450 + i * 600, rot = k * (i - 1) * 0.6; ctx.save(); ctx.translate(x, 800 + k * 700); ctx.rotate(rot); phone(ctx, K, 0, 0, 0.7, () => { bg(ctx, K, ['#ff7a59', '#ffd166', '#4cc9f0'][i], '#ffffff'); K.R(ctx, -110, -200, 220, 260, 20, '#ffffff', 5); K.text(ctx, '✗', -60, 160, { size: 70, color: '#ff3b30' }); K.text(ctx, '♥', 60, 160, { size: 70, color: '#2ec27e' }); }); ctx.restore(); }
    phone(ctx, K, 1550, 800, 0.8, () => { bg(ctx, K, PINK, '#ff7ab8'); K.text(ctx, 'PINK', 0, 0, { size: 90, color: '#ffffff' }); }); K.starBurst(ctx, 1550, 800, 260, '#ffd166', 0.4 + 0.2 * Math.sin(a.t * 4));
  },
  // 62 Los inversores hacen cola en tu puerta: vales más de mil millones y no tienes ni 30
  62: (ctx, a, K) => {
    city(ctx, K, a.t, false); K.R(ctx, 1500, 700, 320, 520, 10, '#8a5a34', 9); K.C(ctx, 1780, 960, 16, '#ffd166', 5);
    for (let i = 0; i < 7; i++) { const x = 1300 - i * 260 + Math.sin(a.t * 3 + i) * 6; stand(ctx, a, K, x, 1380, 0.12, pp(a, EXTRAS[i % 8], { outfit: '#2f2f36' }), 'happy'); K.prop(ctx, 'bolsa_dinero', x + 80, 1280, 0.2, a.t); }
    const k = K.ph(a.t, a.d, 0.4, 0.8); K.text(ctx, '$' + (k * 1).toFixed(1) + ' BILLION', 540, 500, { size: 130, color: '#2ec27e', k: K.ph(a.t, a.d, 0.35, 0.45) }); K.text(ctx, 'AGE: 29', 540, 680, { size: 80, color: '#ffffff', k: K.ph(a.t, a.d, 0.7, 0.85) });
  },
  // 63 Titular: «Las apps de citas se hunden: conoce al Oráculo del Amor». Tu cara en todas las pantallas de EE. UU.
  63: (ctx, a, K) => {
    bg(ctx, K, '#14152a', '#2a2c50'); for (let i = 0; i < 12; i++) { const x = -700 + (i % 6) * 480, y = 450 + Math.floor(i / 6) * 520, k = K.ph(a.t, a.d, 0.2 + i * 0.04, 0.3 + i * 0.04); K.R(ctx, x - 200, y - 150, 400, 300, 16, '#1b1c25', 8); if (k > 0) { ctx.save(); ctx.beginPath(); ctx.rect(x - 184, y - 134, 368, 268); ctx.clip(); bg(ctx, K, '#ffe6f2', '#ff9ccf'); ctx.translate(x, y + 40); ctx.scale(0.35, 0.35); K.drawHead(ctx, 0, 0, you(a), { mood: 'happy', t: a.t }); ctx.restore(); } }
    K.R(ctx, -760, 1220, 2600, 130, 0, '#ff3b30', 0); K.text(ctx, 'DATING APPS COLLAPSE: MEET THE LOVE ORACLE', 540 - ((a.t * 120) % 600) + 300, 1285, { size: 70, color: '#ffffff' });
  },
  // 64 Desconocidos te dan las gracias, parejas te mencionan en sus bodas, alguien llama a su cachorro como tú
  64: (ctx, a, K) => {
    bg(ctx, K, '#fff1e0', '#ffd9b8'); const s = [0, 1, 2].map(i => K.ph(a.t, a.d, i * 0.28, 0.2 + i * 0.28));
    if (s[0] > 0) { ctx.save(); ctx.globalAlpha = s[0]; K.R(ctx, -800, 400, 780, 880, 30, '#c97b4a', 8); stand(ctx, a, K, -560, 1200, 0.12, pp(a, 'x2'), 'happy'); stand(ctx, a, K, -260, 1200, 0.12, you(a), 'happy'); K.prop(ctx, 'cafe', -410, 1000, 0.3, a.t); K.text(ctx, 'THANK YOU!', -410, 520, { size: 60, color: '#ffffff' }); ctx.restore(); }
    if (s[1] > 0) { ctx.save(); ctx.globalAlpha = s[1]; K.R(ctx, 150, 400, 780, 880, 30, '#ffe6f2', 8); stand(ctx, a, K, 400, 1200, 0.12, pp(a, 'x4', { outfit: '#ffffff' }), 'happy'); stand(ctx, a, K, 680, 1200, 0.12, pp(a, 'x1', { outfit: '#2f2f36' }), 'happy'); K.prop(ctx, 'tarta_cumpleanos', 540, 1050, 0.35, a.t); K.text(ctx, 'JUST MARRIED', 540, 520, { size: 60, color: PINK }); ctx.restore(); }
    if (s[2] > 0) { ctx.save(); ctx.globalAlpha = s[2]; K.R(ctx, 1100, 400, 780, 880, 30, '#bfe9ff', 8); K.prop(ctx, 'perro', 1490, 950, 0.7, a.t); K.R(ctx, 1350, 1120, 280, 80, 20, '#ffd166', 6); K.text(ctx, 'NAMED AFTER YOU', 1490, 520, { size: 52, color: '#1d5c8c' }); ctx.restore(); }
  },
  // 65 Mucha gente te odia: dicen que mataste el romance; el amor debería ser un misterio, no una hoja de cálculo
  65: (ctx, a, K) => {
    city(ctx, K, a.t, false); for (let i = 0; i < 7; i++) { const x = -650 + i * 380; stand(ctx, a, K, x, 1400, 0.13, pp(a, EXTRAS[i]), 'angry', { arms: i % 2 ? 'up' : 'normal' }); const sx = x + 80, sy = 820 + Math.sin(a.t * 5 + i) * 15; K.R(ctx, sx - 10, sy, 20, 280, 6, '#8a5a34', 5); K.R(ctx, sx - 150, sy - 160, 300, 180, 10, '#ffffff', 7); K.text(ctx, ['LOVE IS', 'NO APPS', 'BRING', 'NOT A', 'KEEP IT', 'BOO', 'STOP'][i], sx, sy - 100, { size: 40, color: '#ff3b30' }); K.text(ctx, ['A MYSTERY', 'FOR LOVE', 'ROMANCE BACK', 'SPREADSHEET', 'SECRET', 'PINK', 'PINK'][i], sx, sy - 40, { size: 32, color: K.INK }); }
    const k = K.ph(a.t, a.d, 0.4, 0.7); if (k > 0) { ctx.save(); ctx.translate(540, 450); ctx.scale(k, k); K.R(ctx, -230, -150, 460, 300, 10, '#ffffff', 8); for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) ctx.strokeRect(-210 + c * 105, -130 + r * 65, 105, 65); heart(ctx, K, 0, 0, 60, PINK, 6); ctx.restore(); }
  },
  // 66 De noche, solo en tu ático, un detalle te inquieta: te miras al espejo y sobre tu cabeza… nada
  66: (ctx, a, K) => {
    bg(ctx, K, '#0e1330', '#1d2147'); for (let i = 0; i < 4; i++) K.R(ctx, -800 + i * 700, 380, 600, 820, 10, '#0b0e24', 10);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 30; j++) { ctx.fillStyle = (i + j) % 3 ? '#ffd76b' : '#6b7bd0'; ctx.fillRect(-780 + i * 700 + (j % 6) * 95, 700 + Math.floor(j / 6) * 90, 40, 30); }
    floor(ctx, K, 1260, '#2a2440'); mirror(ctx, K, 540, 800, 520, 760, () => { K.face(ctx, you(a), 540, 880, 0.5, { mood: 'worried', t: a.t }); });
    const k = K.ph(a.t, a.d, 0.5, 0.75); K.text(ctx, 'NOTHING', 540, 360, { size: 100, color: '#ffffff', k }); if (k > 0) { ctx.setLineDash([16, 12]); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.strokeRect(460, 470, 160, 140); ctx.setLineDash([]); }
  },
  // 67 Has dicho a millones quién los quiere; nunca has sabido quién te quiere a ti
  67: (ctx, a, K) => {
    bg(ctx, K, '#1f1a3a', '#3a2a6a'); for (let i = 0; i < 60; i++) { const x = -800 + (i % 15) * 190, y = 380 + Math.floor(i / 15) * 150; heart(ctx, K, x, y + Math.sin(a.t * 2 + i) * 6, 26, i % 7 === 0 ? '#ffd166' : PINK, 4); }
    K.text(ctx, 'MILLIONS', 540, 1000, { size: 130, color: PINK, k: K.ph(a.t, a.d, 0.1, 0.25) });
    const k = K.ph(a.t, a.d, 0.5, 0.75); K.face(ctx, you(a), 540, 1290, 0.3, { mood: 'sad', t: a.t }); K.text(ctx, 'YOU: ?', 540, 1150, { size: 80, color: '#ffffff', k });
  },
  // 68 Buscas en el aire vacío sobre tu reflejo: ¿cero? ¿cien? No hay forma de saberlo
  68: (ctx, a, K) => {
    bg(ctx, K, '#0e1330', '#1d2147'); mirror(ctx, K, 540, 860, 520, 720, () => { K.face(ctx, you(a), 540, 940, 0.5, { mood: 'worried', t: a.t }); });
    const n = [0, 100, 7, 1, 42, 0, 13]; const i = Math.floor(a.t * 3) % n.length; ctx.globalAlpha = 0.4 + 0.3 * Math.sin(a.t * 6); tag(ctx, K, 540, 470, n[i], 1, a.t, 0.9, '#9aa0ad'); ctx.globalAlpha = 1;
    K.text(ctx, '0?', -450, 650, { size: 150, color: '#ffffff', k: K.ph(a.t, a.d, 0.2, 0.35), rot: -0.1 }); K.text(ctx, '100?', 1550, 650, { size: 150, color: '#ffffff', k: K.ph(a.t, a.d, 0.4, 0.55), rot: 0.1 });
  },
  // 69 Cuanto más famoso eres, más dudas de si alguien te quiere por quien eres de verdad
  69: (ctx, a, K) => {
    bg(ctx, K, '#14152a', '#2a2c50'); const flashes = Math.floor(a.t * 5);
    for (let i = 0; i < 8; i++) { const x = -700 + i * 330; K.R(ctx, x - 70, 1000, 140, 100, 12, '#1b1c25', 6); K.C(ctx, x, 1050, 30, '#5b5f6b', 5); if ((flashes + i) % 4 === 0) K.radial(ctx, x, 1050, 200, '#ffffff', 0.8); }
    K.midShot(ctx, you(a), { x: 540, y: 820, s: 0.55, mood: 'worried', t: a.t });
    const k = K.ph(a.t, a.d, 0.5, 0.8); if (k > 0) { ctx.save(); ctx.globalAlpha = k; K.R(ctx, 1250, 450, 520, 300, 30, '#ffffff', 8); K.text(ctx, 'FAME', 1380, 600, { size: 70, color: '#ffd166' }); K.text(ctx, 'vs', 1510, 600, { size: 50, color: K.INK }); K.text(ctx, 'ME', 1640, 600, { size: 70, color: PINK }); ctx.restore(); }
  },
  // 70 Pasada la medianoche sales de una gala, pasas de la limusina y caminas solo hacia el metro
  70: (ctx, a, K) => {
    city(ctx, K, a.t, true); K.R(ctx, -700, 1150, 900, 180, 60, '#14151c', 8); for (let i = 0; i < 3; i++) K.C(ctx, -560 + i * 300, 1340, 60, '#2a2a33', 7);
    K.R(ctx, 1450, 900, 360, 220, 10, '#2e7d4f', 8); K.text(ctx, 'SUBWAY', 1630, 1000, { size: 60, color: '#ffffff' });
    const x = 300 + K.ph(a.t, a.d, 0, 1) * 900; stand(ctx, a, K, x, 1420, 0.15, you(a, { outfit: '#1f1f26' }), 'neutral');
    K.text(ctx, '12:07 AM', -500, 450, { size: 80, color: '#ffd76b' });
  },
  // 71 La calle está vacía; tus pasos hacen eco… y detrás, otros pasos siguen tu ritmo
  71: (ctx, a, K) => {
    city(ctx, K, a.t, true); veil(ctx, K, '#000018', 0.35); for (let i = 0; i < 4; i++) { K.R(ctx, -600 + i * 800, 700, 20, 520, 6, '#3a3d4c', 5); K.radial(ctx, -590 + i * 800, 700, 220, '#ffd76b', 0.4); }
    const x = 900 + K.ph(a.t, a.d, 0, 1) * 300; stand(ctx, a, K, x, 1420, 0.15, you(a, { outfit: '#1f1f26' }), 'worried');
    ctx.save(); ctx.globalAlpha = 0.85; ctx.fillStyle = '#05060d'; const hx = -500 + K.ph(a.t, a.d, 0, 1) * 300; ctx.beginPath(); ctx.ellipse(hx, 1100, 80, 220, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(hx, 840, 70, 0, 7); ctx.fill(); ctx.restore();
    for (let i = 0; i < 4; i++) { const on = Math.floor(a.t * 2.2) % 2 === i % 2; K.text(ctx, 'TAP', x - 150 + i * 60, 1480, { size: 40, color: on ? '#ffffff' : '#666' }); K.text(ctx, 'TAP', hx - 100 + i * 60, 1480, { size: 40, color: on ? '#ff8a8a' : '#444' }); }
  },
  // 72 Pasas el torniquete y entras en un vagón casi vacío, con luz amarilla que parpadea
  72: (ctx, a, K) => {
    subwayCar(ctx, K, a.t, 1); const x = -700 + K.ease.out(K.ph(a.t, a.d, 0, 0.6)) * 1100; stand(ctx, a, K, x, 1420, 0.16, you(a, { outfit: '#1f1f26' }), 'neutral');
    for (let i = 0; i < 2; i++) { const kk = K.ph(a.t, a.d, 0.1, 0.3); ctx.save(); ctx.translate(-760, 1100); ctx.rotate(kk * Math.PI * 0.5 + i * Math.PI); K.R(ctx, -10, -150, 20, 150, 8, '#c9c9cf', 5); ctx.restore(); }
  },
  // 73 Al fondo, un hombre con capucha te mira fijamente. No a la cara
  73: (ctx, a, K) => {
    subwayCar(ctx, K, a.t, 1); stand(ctx, a, K, -350, 1420, 0.15, you(a, { outfit: '#1f1f26' }), 'neutral');
    const z = 1 + K.ph(a.t, a.d, 0.2, 1) * 0.35; ctx.save(); ctx.translate(1350, 1400); ctx.scale(z, z); ctx.translate(-1350, -1400); const top = stand(ctx, a, K, 1350, 1400, 0.15, pp(a, 'hood'), 'neutral', { still: true }); ctx.fillStyle = '#2a2e38'; ctx.beginPath(); ctx.arc(1350, top + 50, 70, Math.PI, 0); ctx.lineTo(1420, top + 120); ctx.lineTo(1280, top + 120); ctx.fill(); ctx.restore();
    ctx.lineWidth = 6; ctx.setLineDash([20, 16]); ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.moveTo(1300, 1000); ctx.lineTo(-300, 900); ctx.stroke(); ctx.setLineDash([]);
  },
  // 74 Mira el espacio vacío sobre tu cabeza; se levanta despacio y el tren chirría en una curva
  74: (ctx, a, K) => {
    const sh = K.shakeAt(a.t, a.d * 0.55, 18, 1.5); ctx.save(); ctx.translate(sh[0], sh[1]); ctx.rotate(Math.sin(K.ph(a.t, a.d, 0.5, 1) * Math.PI) * 0.03);
    subwayCar(ctx, K, a.t, 1); const ytop = stand(ctx, a, K, -300, 1420, 0.15, you(a, { outfit: '#1f1f26' }), 'worried');
    const rise = K.ease.out(K.ph(a.t, a.d, 0.1, 0.5)); stand(ctx, a, K, 1300, 1420 + (1 - rise) * 120, 0.15, pp(a, 'hood'), 'neutral');
    ctx.setLineDash([14, 12]); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.strokeRect(-380, ytop - 200, 160, 160); ctx.setLineDash([]); ctx.restore();
    K.text(ctx, 'SCREEEECH', 1100, 450, { size: 100, color: '#ffd166', rot: -0.08, k: K.ph(a.t, a.d, 0.55, 0.65) });
  },
  // 75 Se sienta frente a ti y susurra: «Tú también los ves, ¿verdad?» Se te hiela la sangre
  75: (ctx, a, K) => {
    subwayCar(ctx, K, a.t, 0.6); stand(ctx, a, K, 100, 1420, 0.17, you(a, { outfit: '#1f1f26' }), 'shocked', { still: true }); stand(ctx, a, K, 980, 1420, 0.17, pp(a, 'hood'), 'neutral');
    K.R(ctx, 850, 470, 760, 160, 50, '#ffffff', 8); ctx.fillStyle = K.INK; ctx.font = 'italic 50px Poppins'; ctx.textAlign = 'center'; ctx.fillText('"You see them too, don\'t you?"', 1230, 565);
    const k = K.ph(a.t, a.d, 0.5, 0.9); if (k > 0) { ctx.save(); ctx.globalAlpha = 0.5 * k; ctx.fillStyle = '#8fd3ff'; ctx.fillRect(-100, 880, 400, 560); ctx.restore(); for (let i = 0; i < 8; i++) K.P(ctx, [[-120 + i * 55, 870], [-95 + i * 55, 830 - (i % 2) * 20], [-70 + i * 55, 870]], '#e6f7ff', 4); }
  },
  // 76 No puedes responder: por primera vez, no eres el único con este poder
  76: (ctx, a, K) => {
    bg(ctx, K, '#14152a', '#2a1d33'); const k = K.ph(a.t, a.d, 0.2, 0.6);
    ctx.save(); ctx.translate(-300 + 300 * k, 0); K.face(ctx, you(a), 0, 850, 0.55, { mood: 'shocked', t: a.t }); ctx.restore(); ctx.save(); ctx.translate(1380 - 300 * k, 0); K.face(ctx, pp(a, 'hood'), 0, 850, 0.55, { mood: 'neutral', t: a.t }); ctx.restore();
    for (const [x, d] of [[-300 + 300 * k, 1], [1380 - 300 * k, -1]]) for (let i = 0; i < 3; i++) { ctx.strokeStyle = PINK; ctx.lineWidth = 6; ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.arc(x, 850, 260 + i * 50 + ((a.t * 60) % 50), 0, 7); ctx.stroke(); ctx.globalAlpha = 1; }
    K.text(ctx, 'NOT THE ONLY ONE', 540, 380, { size: 100, color: PINK, k: K.ph(a.t, a.d, 0.6, 0.75) });
  },
  // 77 Sonríe: «Te he observado durante meses: cada entrevista, cada lanzamiento. Sabía que lo descubrirías»
  77: (ctx, a, K) => {
    bg(ctx, K, '#14152a', '#2a2c50'); K.midShot(ctx, pp(a, 'hood'), { x: 540, y: 900, s: 0.65, mood: 'happy', t: a.t });
    const pics = 6; for (let i = 0; i < pics; i++) { const k = K.ph(a.t, a.d, 0.1 + i * 0.1, 0.25 + i * 0.1); if (k <= 0) continue; const x = i < 3 ? -650 + (i % 3) * 0 : 1700, y = 420 + (i % 3) * 330; ctx.save(); ctx.translate(x + (i < 3 ? -0 : 0), y); ctx.rotate((i % 2 ? 1 : -1) * 0.1); ctx.scale(k, k); K.R(ctx, -170, -130, 340, 260, 10, '#ffffff', 6); K.R(ctx, -150, -110, 300, 180, 6, '#ffe6f2', 0); ctx.translate(0, -10); ctx.scale(0.18, 0.18); K.drawHead(ctx, 0, 0, you(a), { mood: 'happy', t: a.t }); ctx.restore(); }
  },
  // 78 «Tu número es algo que nunca podrás ver. Yo sí. Y no es cero»
  78: (ctx, a, K) => {
    subwayCar(ctx, K, a.t, 0.4); const ytop = stand(ctx, a, K, 200, 1420, 0.18, you(a, { outfit: '#1f1f26' }), 'shocked'); stand(ctx, a, K, 1100, 1420, 0.17, pp(a, 'hood'), 'happy');
    const k = K.ph(a.t, a.d, 0.3, 0.6); ctx.save(); ctx.globalAlpha = 0.5 + 0.5 * K.ph(a.t, a.d, 0.6, 0.8); tag(ctx, K, 200, ytop - 110, k < 1 ? '0' : '≠0', k, a.t, 1.1); ctx.restore();
    K.text(ctx, 'NOT ZERO', 1100, 450, { size: 110, color: PINK, k: K.ph(a.t, a.d, 0.65, 0.8) });
  },
  // 79 Se acerca: «El tuyo dice uno. Y el hilo va hacia mí»
  79: (ctx, a, K) => {
    subwayCar(ctx, K, a.t, 0.4); const lean = K.ease.out(K.ph(a.t, a.d, 0, 0.4)); const ytop = stand(ctx, a, K, 200, 1420, 0.18, you(a, { outfit: '#1f1f26' }), 'shocked');
    stand(ctx, a, K, 1100 - lean * 300, 1420, 0.17, pp(a, 'hood'), 'happy'); tag(ctx, K, 200, ytop - 110, 1, K.ph(a.t, a.d, 0.2, 0.45), a.t, 1.4);
    K.text(ctx, '"YOURS SAYS ONE."', 1150, 450, { size: 80, color: '#ffffff', k: K.ph(a.t, a.d, 0.3, 0.45) });
  },
  // 80 Las luces parpadean: una fina línea rosa brilla en el aire, desde su pecho directa a ti
  80: (ctx, a, K) => {
    subwayCar(ctx, K, a.t, 3); const off = Math.floor(a.t * 7) % 3 === 0; if (off) veil(ctx, K, '#000', 0.7);
    stand(ctx, a, K, 200, 1420, 0.18, you(a, { outfit: '#1f1f26' }), 'shocked'); stand(ctx, a, K, 900, 1420, 0.17, pp(a, 'hood'), 'happy');
    thread(ctx, K, 870, 1080, 230, 1060, K.ph(a.t, a.d, 0.2, 0.7), a.t, -160, PINK, 12); heart(ctx, K, 870, 1080, 40 * (1 + 0.15 * Math.sin(a.t * 8)), PINK, 5);
  },
  // 81 Ahora sabes dos cosas: a quién quiere todo el mundo… y que alguien ha estado vigilando a quién quieres tú
  81: (ctx, a, K) => {
    bg(ctx, K, '#1b1f4a', '#3a2a6a'); const k1 = K.ph(a.t, a.d, 0.05, 0.3), k2 = K.ph(a.t, a.d, 0.45, 0.7);
    if (k1 > 0) { ctx.save(); ctx.translate(-250, 820); ctx.scale(K.ease.outBack(k1), K.ease.outBack(k1)); K.R(ctx, -430, -330, 860, 660, 40, '#ffe6f2', 10); K.text(ctx, '1', -330, -230, { size: 110, color: PINK }); for (let i = 0; i < 6; i++) heart(ctx, K, -280 + (i % 3) * 280, -40 + Math.floor(i / 3) * 200, 50, PINK, 5); ctx.restore(); }
    if (k2 > 0) { ctx.save(); ctx.translate(1330, 820); ctx.scale(K.ease.outBack(k2), K.ease.outBack(k2)); K.R(ctx, -430, -330, 860, 660, 40, '#14152a', 10); K.text(ctx, '2', -330, -230, { size: 110, color: '#ffffff' }); K.E(ctx, 0, 30, 220, 120, '#ffffff', 0, 8); K.C(ctx, Math.sin(a.t * 2) * 60, 30, 70, '#2b1a10', 0); K.C(ctx, Math.sin(a.t * 2) * 60, 30, 30, '#000', 0); ctx.restore(); }
  },
  // 82 ¿Querrías ver tu propio número? Dímelo en comentarios y mira el próximo What If
  82: (ctx, a, K) => {
    bg(ctx, K, '#ffe6f2', '#ff9ccf'); K.midShot(ctx, you(a), { x: 540, y: 920, s: 0.65, mood: 'happy', t: a.t }); tag(ctx, K, 540, 360, '?', K.ph(a.t, a.d, 0.05, 0.25), a.t, 1.3);
    const k = K.ph(a.t, a.d, 0.35, 0.55); if (k > 0) { ctx.save(); ctx.translate(-430, 820); ctx.scale(K.ease.outBack(k), K.ease.outBack(k)); K.R(ctx, -330, -200, 660, 400, 40, '#ffffff', 9); K.R(ctx, -280, -140, 560, 90, 20, '#f2f2f6', 4); K.R(ctx, -280, -20, 420, 90, 20, '#ffe6f2', 4); K.text(ctx, 'YES / NO?', 0, 130, { size: 70, color: PINK }); ctx.restore(); }
    const k2 = K.ph(a.t, a.d, 0.6, 0.8); if (k2 > 0) { ctx.save(); ctx.translate(1500, 820); ctx.scale(K.ease.outBack(k2), K.ease.outBack(k2)); K.R(ctx, -300, -170, 600, 340, 40, '#ff3b30', 9); K.P(ctx, [[-50, -70], [-50, 70], [70, 0]], '#ffffff', 6); K.text(ctx, 'NEXT WHAT IF', 0, 120, { size: 52, color: '#ffffff' }); ctx.restore(); }
  },
};

// ---------- Versión en ancho (1920×1080) con decorados detallados: el personaje está DENTRO del sitio ----------
// ---------------- HORIZONTAL «CINE» (lib/cine.mjs): personajes dentro del lugar, planos variados, luz de atardecer ----------------
const Q = (a, n) => (n === 'you' ? you(a) : pp(a, n));
const T = (ctx, K, a, x, y, n, p0 = 0.05, sz = 0.7) => tag(ctx, K, x, y, n, K.ph(a.t, a.d, p0, p0 + 0.15), a.t, sz);
// bokeh rosa (números lejanos desenfocados)
function bokeh(ctx, K, a, n = 14, seed = 3) { for (let i = 0; i < n; i++) { const x = (Math.abs(Math.sin((i + seed) * 77.1)) * 1900) | 0, y = 160 + (Math.abs(Math.sin((i + seed) * 31.7)) * 420) | 0; ctx.globalAlpha = 0.25 + 0.2 * Math.sin(a.t * 2 + i); K.radial(ctx, x, y + Math.sin(a.t + i) * 8, 40 + (i % 3) * 18, PINK, 0.9); } ctx.globalAlpha = 1; }
const B = (txt, x, y, o = {}) => (ctx, a) => bocadillo(ctx, a, txt, x, y, o);
const movil = (ctx, a, K, y, lines, head = 'Pink') => { panel(ctx, 960, y, 440, 780, 54); heart(ctx, K, 960, y - 240, 56, PINK, 0); K.text(ctx, head, 960, y - 150, { size: 52, color: '#ffffff' }); lines.forEach((l, i) => { const k = K.ph(a.t, a.d, 0.15 + i * 0.12, 0.3 + i * 0.12); if (k <= 0) return; ctx.globalAlpha = k; ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.beginPath(); ctx.roundRect(780, y - 70 + i * 100, 360, 80, 20); ctx.fill(); K.text(ctx, l, 960, y - 30 + i * 100, { size: 30, color: PINK2 }); ctx.globalAlpha = 1; }); };
const rise = (K, a, p0 = 0, p1 = 0.3) => (1 - K.ease.out(K.ph(a.t, a.d, p0, p1))) * 320;
const fan = (ctx, K, a, tx, ty, n, x0 = -100, x1 = 2000, y0 = 300, bend = -150) => { for (let i = 0; i < n; i++) thread(ctx, K, x0 + (x1 - x0) * (i / Math.max(1, n - 1)), y0 + (i % 3) * 90, tx, ty, K.ph(a.t, a.d, 0.1 + i * 0.06, 0.45 + i * 0.06), a.t, bend + (i % 2) * 80); };
export const ancho = {
  // 0 ¿Y si pudieras ver quién te quiere? Tú en primer plano en la calle; detrás, números rosas sobre la gente
  0: plano.primer({ set: 'calle', o: { hora: 'atardecer', gente: 8 }, q: 'you', mood: 'shocked', lado: 'izq', quien: Q,
    antes: (ctx, a, K) => { bokeh(ctx, K, a, 16); [[1250, 300, 3], [1560, 340, 1], [1780, 280, 5]].forEach(([x, y, n], i) => T(ctx, K, a, x, y, n, 0.1 + i * 0.1, 0.45)); } }),
  // 1 Te despiertas: por la ventana, números flotando sobre la gente de la calle
  1: plano.general({ set: 'dormitorio', o: { hora: 'dia' }, look: 'interior', z: [1, 1.08], f: [1400, 420], quien: Q,
    actores: [{ q: 'you', x: 760, mood: 'shocked', esc: 1.15 }],
    despues: (ctx, a, K) => { [[1380, 330, 2], [1480, 380, 0], [1580, 320, 4]].forEach(([x, y, n], i) => T(ctx, K, a, x, y, n, 0.15 + i * 0.12, 0.35)); } }),
  // 2 Hilos rosas unen a cada admirador con su crush; solo tú los ves
  2: plano.general({ set: 'calle', o: { hora: 'atardecer', gente: 3 }, quien: Q, z: [1.04, 1],
    actores: [{ q: 'x2', x: 260, esc: 0.95, mood: 'happy' }, { q: 'x3', x: 720, esc: 1.05 }, { q: 'x4', x: 1180, esc: 0.95, mood: 'happy' }, { q: 'x1', x: 1660, esc: 1.05 }],
    despues: (ctx, a, K, { A }) => { [[0, 1], [2, 1], [3, 2]].forEach(([p, q], j) => thread(ctx, K, A[p].x, A[p].chest, A[q].x, A[q].chest, K.ph(a.t, a.d, 0.1 + j * 0.15, 0.45 + j * 0.15), a.t, -200)); A.forEach((f, i) => T(ctx, K, a, f.x, f.top - 50, [0, 2, 1, 0][i], 0.05 + i * 0.05, 0.55)); },
    texto: { etiqueta: 'Only you can see them' } }),
  // 3 El espejo del baño: tu reflejo no tiene número
  3: plano.hombro({ set: 'bano', look: 'interior', q: 'you', de: 'you', mood: 'worried', quien: Q,
    despues: (ctx, a, K, info) => { const k = K.ph(a.t, a.d, 0.3, 0.6); ctx.save(); ctx.globalAlpha = k; ctx.setLineDash([14, 14]); ctx.lineWidth = 6; ctx.strokeStyle = PINK2; heartPath(ctx, 1240, info.B.head - 260, 70); ctx.stroke(); ctx.restore(); },
    texto: { pastilla: ['?', 1240, 170] } }),
  // 4 Una corredora con un 2; dos desconocidos la miran
  4: plano.general({ set: 'calle', o: { hora: 'atardecer', gente: 4 }, f: [960, 560], quien: Q,
    actores: [{ q: 'x3', x: 300, gy: 860, esc: 0.95, mood: 'happy' }, { q: 'x1', x: 1640, gy: 860, esc: 0.95, mood: 'happy' }, { q: 'jogger', anda: [-150, 2100], mood: 'happy' }],
    despues: (ctx, a, K, { A }) => { const j = A[2]; T(ctx, K, a, j.x, j.top - 60, 2); thread(ctx, K, 300, A[0].chest, j.x, j.chest, K.ph(a.t, a.d, 0.25, 0.6), a.t, -160); thread(ctx, K, 1640, A[1].chest, j.x, j.chest, K.ph(a.t, a.d, 0.35, 0.7), a.t, -160); },
    delante: (ctx, a) => fg.farola(ctx, 1830, a.t, true) }),
  // 5 Un hombre de traje con un 7 grita a un parquímetro
  5: plano.general({ set: 'calle', o: { hora: 'atardecer' }, quien: Q, z: [1, 1.1], f: [1000, 560],
    antes: (ctx, a, K) => { K.R(ctx, 1240, 620, 24, 260, 6, '#5b5f6b', 5); K.R(ctx, 1200, 520, 104, 120, 18, '#9aa4b5', 6); K.R(ctx, 1222, 545, 60, 40, 6, '#1f3a2a', 3); },
    actores: [{ q: 'suit', x: 980, mood: 'angry', arms: 'up', esc: 1.1 }],
    despues: (ctx, a, K, { A }) => { T(ctx, K, a, 980, A[0].top - 70, 7, 0.1, 0.8); bocadillo(ctx, a, '!!!', 1250, 380, { size: 56 }); } }),
  // 6 Anciana con las palomas (un 1) y un hilo hasta el hombre del banco
  6: plano.general({ set: 'parque', o: { hora: 'atardecer' }, quien: Q, f: [900, 650],
    actores: [{ q: 'bench', x: 570, gy: 886, esc: 0.8, still: true }, { q: 'granny', x: 1180, dy: 40, esc: 1.05, mood: 'happy' }],
    despues: (ctx, a, K, { A }) => { const g = A[1]; T(ctx, K, a, 1180, g.top - 70, 1, 0.05, 0.75); for (let i = 0; i < 7; i++) { const px = 1300 + i * 70 + Math.sin(a.t * 3 + i) * 10, py = 1010 + (i % 2) * 30; K.E(ctx, px, py, 30, 22, '#9aa0ad', 0, 3); K.C(ctx, px + 24, py - 18, 15, '#8a909c', 3); } thread(ctx, K, 1180, g.chest, 570, A[0].chest, K.ph(a.t, a.d, 0.3, 0.85), a.t, -300); },
    delante: (ctx, a) => fg.arbol(ctx, -120, a.t) }),
  // 7 Ella no lo sabe, él tampoco; solo tú
  7: plano.primer({ set: 'parque', o: { hora: 'atardecer' }, q: 'you', mood: 'worried', lado: 'der', quien: Q, antes: (ctx, a, K) => bokeh(ctx, K, a, 6, 9), texto: { etiqueta: 'Only you know' } }),
  // 8 Cientos de hilos cruzan la ciudad como telarañas rosas
  8: plano.general({ set: 'avenida', o: { hora: 'noche' }, look: 'noche', z: [1, 1.12], f: [960, 480], quien: Q,
    despues: (ctx, a, K) => { for (let i = 0; i < 16; i++) { const x1 = (i * 263) % 1920, x2 = (i * 617 + 400) % 1920; thread(ctx, K, x1, 500 + (i % 4) * 60, x2, 420 + (i % 3) * 80, K.ph(a.t, a.d, i * 0.03, 0.3 + i * 0.04), a.t, -180 - (i % 3) * 60, PINK, 5); } } }),
  // 9 Lo seguimos por el instituto, el trabajo, la amistad y el mundo entero
  9: plano.dato({ set: 'calle', o: { hora: 'atardecer' }, titulo: 'What happens next',
    dibuja: (ctx, a) => ['School', 'Work', 'Friendship', 'The world'].forEach((w, i) => pastilla(ctx, a, w, 420 + i * 360, 560, { size: 44, k: Math.max(0, Math.min(1, (a.t / a.d - 0.1 - i * 0.15) / 0.1)) })) }),
  // 10 Pasillo del instituto lleno de números e hilos
  10: plano.general({ set: 'pasillo', o: { gente: 6 }, look: 'interior', quien: Q,
    actores: [180, 520, 860, 1200, 1520, 1800].map((x, i) => ({ q: EXTRAS[i], x, dy: -(i % 2) * 40, esc: 1 - (i % 2) * 0.08, mood: ['happy', 'neutral', 'happy', 'shocked', 'happy', 'neutral'][i] })),
    despues: (ctx, a, K, { A }) => { const ns = [2, 0, 5, 1, 9, 3]; A.forEach((f, i) => T(ctx, K, a, f.x, f.top - 55, ns[i], i * 0.05, 0.6)); [[0, 2], [5, 2], [3, 4], [1, 4]].forEach(([p, q], j) => thread(ctx, K, A[p].x, A[p].chest, A[q].x, A[q].chest, K.ph(a.t, a.d, 0.3 + j * 0.1, 0.6 + j * 0.1), a.t, -200)); } }),
  // 11 El quarterback: un cero enorme
  11: plano.primer({ set: 'pasillo', o: { gente: 5 }, look: 'interior', q: 'qb', mood: 'happy', quien: Q,
    despues: (ctx, a, K, { B }) => T(ctx, K, a, 1280, B.head - 300, 0, 0.15, 1.1), texto: { etiqueta: 'The most popular guy' } }),
  // 12 Popular no es lo mismo que querido
  12: plano.primer({ set: 'pasillo', o: { gente: 5 }, look: 'interior', q: 'qb', mood: 'worried', lado: 'izq', quien: Q, z: [1.08, 1.14],
    despues: (ctx, a, K, { B }) => T(ctx, K, a, 640, B.head - 300, 0, 0, 0.9), texto: { pastilla: ['Popular  ≠  liked', 1330, 300] } }),
  // 13 El chico callado que come solo: un siete
  13: plano.general({ set: 'cafeteria', look: 'interior', z: [1.12, 1.04], f: [1380, 600], quien: Q,
    actores: [{ q: 'quiet', x: 1380, mood: 'sad', esc: 1.1 }],
    despues: (ctx, a, K, { A }) => T(ctx, K, a, 1380, A[0].top - 70, 7, 0.3, 0.9), delante: (ctx) => fg.mesa(ctx, 1380, 860, 620), texto: { etiqueta: 'Eats lunch alone' } }),
  // 14 Siete personas le adoran en secreto; él no tiene ni idea
  14: plano.primer({ set: 'cafeteria', look: 'interior', q: 'quiet', mood: 'sad', quien: Q,
    despues: (ctx, a, K, { B }) => { T(ctx, K, a, 1280, B.head - 300, 7, 0.05, 1); fan(ctx, K, a, 1280, B.chest, 7, -100, 700, 200); } }),
  // 15 Un hilo de una animadora, otro de una chica de la banda y otro del chico del periódico
  15: plano.general({ set: 'cafeteria', look: 'interior', quien: Q,
    actores: [{ q: 'cheer', x: 260, mood: 'happy' }, { q: 'band', x: 640, mood: 'happy' }, { q: 'paper', x: 1700, mood: 'happy' }, { q: 'quiet', x: 1200, esc: 1.08 }],
    despues: (ctx, a, K, { A }) => { [0, 1, 2].forEach((i) => thread(ctx, K, A[i].x, A[i].chest, A[3].x, A[3].chest, K.ph(a.t, a.d, 0.1 + i * 0.22, 0.4 + i * 0.22), a.t, -180)); T(ctx, K, a, A[3].x, A[3].top - 60, 7, 0, 0.7); } }),
  // 16 Casi vas a decírselo, pero te quedas helado
  16: plano.primer({ set: 'cafeteria', look: 'interior', q: 'you', mood: 'worried', lado: 'izq', quien: Q, otro: 'quiet', texto: { pastilla: ['How do you explain this?', 1300, 260, { size: 36 }] } }),
  // 17 Tu crush se acerca por el pasillo
  17: plano.hombro({ set: 'pasillo', o: { gente: 4 }, look: 'interior', q: 'crush', de: 'you', mood: 'happy', quien: Q,
    despues: (ctx, a, K) => { for (let i = 0; i < 4; i++) heart(ctx, K, 420 + i * 40, 560 - ((a.t * 140 + i * 70) % 320), 16, PINK, 0); } }),
  // 18 Sigues la línea rosa: cruza el aula por encima de los pupitres
  18: plano.general({ set: 'aula', look: 'interior', z: [1.08, 1.02], quien: Q,
    actores: [{ q: 'crush', x: 260, esc: 1.05, mood: 'happy' }, { q: 'you', x: 1000, dy: 10, esc: 1.05, mood: 'shocked' }],
    despues: (ctx, a, K, { A }) => { const [ex, ey] = thread(ctx, K, 260, A[0].top + 60, 1700, 380, K.ph(a.t, a.d, 0.05, 0.95), a.t, -260); K.C(ctx, ex, ey, 18, '#ffffff', 0); },
    delante: (ctx) => fg.pupitres(ctx) }),
  // 19 No te apunta a ti: va a tu compañero de laboratorio
  19: plano.general({ set: 'aula', look: 'interior', z: [1, 1.1], f: [1350, 560], quien: Q,
    actores: [{ q: 'you', x: 700, mood: 'shocked' }, { q: 'lab', x: 1350 }],
    despues: (ctx, a, K, { A }) => thread(ctx, K, -200, 200, 1350, A[1].chest, K.ph(a.t, a.d, 0, 0.6), a.t, -100), delante: (ctx) => fg.pupitres(ctx) }),
  // 20 Se te cae el alma a los pies
  20: plano.primer({ set: 'aula', look: 'interior', q: 'you', mood: 'sad', quien: Q, z: [1.02, 1.14], antes: (ctx, a, K) => thread(ctx, K, 100, 380, 600, 520, 1, a.t, -60, PINK, 6) }),
  // 21 ¿Se lo dices? ¿Lo saboteas? ¿O te callas?
  21: plano.dato({ set: 'aula', look: 'interior', titulo: 'What do you do?',
    dibuja: (ctx, a) => ['Tell them?', 'Sabotage it?', 'Stay quiet?'].forEach((w, i) => pastilla(ctx, a, w, 520 + i * 440, 540, { size: 46, k: Math.max(0, Math.min(1, (a.t / a.d - 0.1 - i * 0.2) / 0.1)) })) }),
  // 22 Te callas, pero los hilos tiran de ti todo el día
  22: plano.general({ set: 'aula', look: 'interior', quien: Q, z: [1, 1.08], f: [960, 560],
    actores: [{ q: 'x1', x: 250 }, { q: 'x4', x: 560, mood: 'happy' }, { q: 'you', x: 960, mood: 'worried', esc: 1.1 }, { q: 'x2', x: 1380 }, { q: 'x3', x: 1700, mood: 'happy' }],
    despues: (ctx, a, K, { A }) => { thread(ctx, K, A[0].x, A[0].chest, A[3].x, A[3].chest, K.ph(a.t, a.d, 0.1, 0.5), a.t, -260); thread(ctx, K, A[4].x, A[4].chest, A[1].x, A[1].chest, K.ph(a.t, a.d, 0.3, 0.7), a.t, -320); }, delante: (ctx) => fg.pupitres(ctx) }),
  // 23 A la hora de comer sabes más que cien diarios
  23: plano.general({ set: 'cafeteria', look: 'interior', quien: Q,
    actores: [{ q: 'x2', x: 220, mood: 'happy' }, { q: 'cheer', x: 520 }, { q: 'you', x: 960, esc: 1.1, mood: 'happy' }, { q: 'paper', x: 1400, mood: 'happy' }, { q: 'x4', x: 1720 }],
    despues: (ctx, a, K, { A }) => A.forEach((f, i) => i !== 2 && T(ctx, K, a, f.x, f.top - 50, [3, 1, 0, 2, 6][i], 0.05 + i * 0.07, 0.5)), texto: { pastilla: ['100 diaries', 960, 180] } }),
  // 24 Siete hilos atascados en silencio
  24: plano.primer({ set: 'cafeteria', look: 'interior', q: 'quiet', mood: 'neutral', lado: 'izq', quien: Q, despues: (ctx, a, K, { B }) => fan(ctx, K, a, 640, B.chest, 7, 1200, 2000, 200, -120) }),
  // 25 Le das un empujoncito a la chica de la banda
  25: plano.hombro({ set: 'pasillo', o: { gente: 3 }, look: 'interior', q: 'band', de: 'you', mood: 'happy', quien: Q, despues: B('"Hey, he likes music too."', 1240, 170) }),
  // 26 El viernes ya se sientan juntos
  26: plano.general({ set: 'cafeteria', look: 'interior', quien: Q, z: [1, 1.08], f: [1350, 600],
    actores: [{ q: 'quiet', x: 1220, mood: 'happy' }, { q: 'band', x: 1500, mood: 'happy' }],
    despues: (ctx, a, K) => { for (let i = 0; i < 6; i++) heart(ctx, K, 1260 + i * 50, 520 - ((a.t * 120 + i * 60) % 360), 16, PINK, 0); }, delante: (ctx) => fg.mesa(ctx, 1360, 860, 640), texto: { pastilla: ['FRIDAY', 1360, 200] } }),
  // 27 El lunes llegas a la oficina
  27: plano.general({ set: 'oficina', o: { hora: 'dia' }, look: 'dia', quien: Q, actores: [{ q: 'x3', x: 400 }, { q: 'x2', x: 1500 }, { q: 'you', anda: [-100, 960, 0, 0.7], mood: 'neutral', esc: 1.05 }], texto: { etiqueta: 'Monday' } }),
  // 28 Tu jefa, seria, tiene un 3
  28: plano.primer({ set: 'oficina', o: { hora: 'dia' }, look: 'dia', q: 'boss', mood: 'angry', quien: Q, despues: (ctx, a, K, { B }) => T(ctx, K, a, 1280, B.head - 300, 3, 0.15, 1) }),
  // 29 Su propio hilo cruza la oficina hasta el becario
  29: plano.general({ set: 'oficina', o: { hora: 'dia' }, look: 'dia', quien: Q, actores: [{ q: 'boss', x: 360, mood: 'happy' }, { q: 'intern', x: 1550 }],
    despues: (ctx, a, K, { A }) => { thread(ctx, K, A[0].x, A[0].chest, A[1].x, A[1].chest, K.ph(a.t, a.d, 0.1, 0.7), a.t, -280); pastilla(ctx, a, '22', A[1].x, A[1].top - 50); } }),
  // 30 Dato: el becario tiene 22 años y depende de ella
  30: plano.dato({ set: 'oficina', look: 'tension', titulo: 'Your boss  ·  the intern', valor: '22', sub: 'years old · reports to her' }),
  // 31 Ella ronda su mesa; el equipo se da cuenta
  31: plano.general({ set: 'oficina', o: { hora: 'dia' }, look: 'dia', quien: Q, z: [1, 1.07], f: [1300, 560],
    actores: [{ q: 'x1', x: 250, mood: 'shocked' }, { q: 'x4', x: 560, mood: 'worried' }, { q: 'intern', x: 1200 }, { q: 'boss', x: 1480, mood: 'happy' }],
    despues: (ctx, a, K, { A }) => thread(ctx, K, A[3].x, A[3].chest, A[2].x, A[2].chest, 1, a.t, -120), delante: (ctx) => fg.mesa(ctx, 1260, 870, 700) }),
  // 32 Entras en Recursos Humanos: «Tenemos que hablar»
  32: plano.general({ set: 'despacho', look: 'interior', quien: Q, actores: [{ q: 'you', x: 560, mood: 'worried' }, { q: 'hr', x: 1500, mood: 'neutral' }], despues: B('"We need to talk."', 560, 230), texto: { etiqueta: 'HR office' } }),
  // 33 Trasladan a la jefa: sale con su caja
  33: plano.general({ set: 'oficina', o: { hora: 'dia' }, look: 'dia', quien: Q, actores: [{ q: 'intern', x: 400, mood: 'happy' }, { q: 'boss', anda: [1200, 2200, 0.1, 0.9], mood: 'sad' }],
    despues: (ctx, a, K, { A }) => K.R(ctx, A[1].x - 120, A[1].chest - 10, 240, 150, 8, '#c9a36a', 4), texto: { etiqueta: 'One month later' } }),
  // 34 La empresa se queda de piedra
  34: plano.general({ set: 'oficina', o: { hora: 'dia' }, look: 'dia', quien: Q, actores: [{ q: 'x2', x: 280, mood: 'shocked' }, { q: 'x1', x: 620, mood: 'shocked' }, { q: 'you', x: 960, esc: 1.1, mood: 'happy' }, { q: 'x3', x: 1300, mood: 'shocked' }, { q: 'x4', x: 1640, mood: 'shocked' }] }),
  // 35 El director te llama: ascenso
  35: plano.general({ set: 'despacho', look: 'interior', quien: Q, actores: [{ q: 'director', x: 1450, mood: 'happy' }, { q: 'you', x: 620, mood: 'happy' }], texto: { pastilla: ['PROMOTED', 960, 240] } }),
  // 36 Confeti, magdalenas y aplausos en la sala de descanso
  36: plano.general({ set: 'cafeteria', look: 'interior', quien: Q, actores: [{ q: 'x1', x: 250, arms: 'up', mood: 'happy' }, { q: 'x2', x: 600, arms: 'up', mood: 'happy' }, { q: 'you', x: 960, esc: 1.1, mood: 'happy' }, { q: 'x3', x: 1320, arms: 'up', mood: 'happy' }, { q: 'x4', x: 1680, mood: 'worried' }],
    despues: (ctx, a, K) => { confeti(ctx, a); if (a.t / a.d > 0.6) bocadillo(ctx, a, '"How did you always know?"', 1560, 220, { size: 34, p0: 0.6 }); } }),
  // 37 Todos te miran distinto
  37: plano.general({ set: 'oficina', o: { hora: 'dia' }, look: 'tension', quien: Q, z: [1.06, 1], actores: [{ q: 'x1', x: 260, mood: 'happy' }, { q: 'x2', x: 600, mood: 'worried' }, { q: 'you', x: 960, esc: 1.1, mood: 'worried' }, { q: 'x3', x: 1320, mood: 'shocked' }, { q: 'x4', x: 1660, mood: 'angry' }] }),
  // 38 En la cafetería: «¿lees mentes?»
  38: plano.hombro({ set: 'cafeteria', look: 'interior', q: 'x2', de: 'you', mood: 'happy', quien: Q, despues: B('"Okay, seriously, do you read minds?"', 1240, 180, { size: 36 }) }),
  // 39 Un poder que ayuda también puede asustar
  39: plano.primer({ set: 'cafeteria', look: 'tension', q: 'you', mood: 'worried', lado: 'centro', quien: Q, z: [1.02, 1.16] }),
  // 40 Te llama tu mejor amiga gritando de alegría
  40: plano.detalle({ set: 'salon', look: 'interior', dibuja: (ctx, a, K) => { const y = 560 + rise(K, a); panel(ctx, 960, y, 440, 780, 54); K.C(ctx, 960, y - 170, 90, '#ff6fa3', 0); K.text(ctx, 'Mia', 960, y - 20, { size: 64, color: '#ffffff' }); K.text(ctx, 'calling...', 960, y + 60, { size: 34, color: PINK2 }); for (const d of [-1, 1]) K.C(ctx, 960 + d * 110, y + 240, 50, d < 0 ? '#e05a4a' : '#2ec27e', 0); } }),
  // 41 La abrazas en el salón: un 4 y nunca ha estado tan feliz
  41: plano.general({ set: 'salon', look: 'interior', z: [1, 1.1], f: [960, 520], quien: Q,
    actores: [{ q: 'you', x: 830, esc: 1.2, mood: 'happy', arms: 'up' }, { q: 'mia', x: 1090, esc: 1.2, mood: 'happy', arms: 'up' }],
    despues: (ctx, a, K, { A }) => { T(ctx, K, a, 1090, A[1].top - 80, 4, 0.3, 0.9); for (let i = 0; i < 6; i++) heart(ctx, K, 880 + i * 40, 560 - ((a.t * 120 + i * 60) % 400), 18, PINK2, 0); } }),
  // 42 Entra el novio con flores: un 2, pero su hilo no va hacia ella
  42: plano.general({ set: 'salon', look: 'interior', quien: Q, actores: [{ q: 'mia', x: 520, mood: 'happy' }, { q: 'bf', anda: [2100, 1250, 0, 0.4] }],
    despues: (ctx, a, K, { A }) => { const b = A[1]; K.E(ctx, b.x - 140, b.chest, 60, 40, '#ff6fa3', 0, 3); T(ctx, K, a, b.x, b.top - 60, 2, 0.35, 0.7); thread(ctx, K, b.x, b.chest, 1460, 300, K.ph(a.t, a.d, 0.5, 0.95), a.t, -150); } }),
  // 43 Sale por la ventana, baja la calle y llega a una compañera, Jessica
  43: plano.general({ set: 'avenida', o: { hora: 'noche' }, look: 'noche', z: [1, 1.12], f: [960, 520], quien: Q, actores: [{ q: 'jess', x: 1120, gy: 760, esc: 0.55, mood: 'happy' }],
    despues: (ctx, a, K, { A }) => { thread(ctx, K, -100, 200, A[0].x, A[0].chest, K.ph(a.t, a.d, 0, 0.8), a.t, 120); if (a.t / a.d > 0.7) pastilla(ctx, a, 'Jessica', A[0].x, A[0].top - 40, { k: (a.t / a.d - 0.7) / 0.1 }); } }),
  // 44 Va a prometerle «para siempre» con el corazón en otra parte
  44: plano.primer({ set: 'salon', look: 'tension', q: 'you', mood: 'worried', lado: 'izq', otro: 'mia', quien: Q }),
  // 45 Callar o romperle el momento más feliz
  45: plano.dato({ set: 'salon', look: 'tension', titulo: 'Your choice',
    dibuja: (ctx, a) => { pastilla(ctx, a, 'Stay silent', 640, 540, { size: 48 }); pastilla(ctx, a, 'Break her heart', 1300, 540, { size: 48, k: Math.max(0, (a.t / a.d - 0.4) / 0.1) }); } }),
  // 46 Esa noche no duermes
  46: plano.general({ set: 'dormitorio', o: { hora: 'noche' }, look: 'noche', quien: Q, z: [1.06, 1.12], f: [760, 560], actores: [{ q: 'you', x: 760, mood: 'sad', esc: 1.1 }], despues: (ctx, a) => motas(ctx, a, 18, '#bcd0ff') }),
  // 47 Quedáis en el parque: «Tengo que contarte algo horrible»
  47: plano.general({ set: 'parque', o: { hora: 'atardecer' }, quien: Q, actores: [{ q: 'you', x: 760, mood: 'worried' }, { q: 'mia', x: 1180, mood: 'happy' }], despues: B('"I have to tell you something awful."', 760, 230, { size: 36 }), delante: (ctx, a) => fg.arbol(ctx, 1950, a.t) }),
  // 48 Se lo cuentas todo: ella solo te mira
  48: plano.hombro({ set: 'parque', o: { hora: 'atardecer' }, q: 'mia', de: 'you', mood: 'shocked', quien: Q, despues: (ctx, a, K) => thread(ctx, K, 300, 150, 1100, 300, K.ph(a.t, a.d, 0.2, 0.7), a.t, -80, PINK, 6) }),
  // 49 «Es una locura», susurra, y se aparta llorando
  49: plano.primer({ set: 'parque', o: { hora: 'atardecer' }, q: 'mia', mood: 'sad', quien: Q, despues: B('"That\'s insane."', 640, 300) }),
  // 50 Se enfrenta a su novio esa noche
  50: plano.general({ set: 'salon', o: { hora: 'noche' }, look: 'noche', quien: Q, actores: [{ q: 'mia', x: 700, mood: 'angry', arms: 'up' }, { q: 'bf', x: 1250, mood: 'worried' }], despues: (ctx, a, K, { A }) => { if (a.t / a.d > 0.6) pastilla(ctx, a, 'texting Jessica', 1250, A[1].top - 50, { k: (a.t / a.d - 0.6) / 0.1 }); } }),
  // 51 Se cancela la boda... y te bloquea
  51: plano.detalle({ set: 'salon', o: { hora: 'noche' }, look: 'noche', dibuja: (ctx, a, K) => { const y = 560 + rise(K, a); panel(ctx, 960, y, 440, 780, 54); K.C(ctx, 960, y - 170, 90, '#ff6fa3', 0); K.text(ctx, 'Mia', 960, y - 20, { size: 64, color: '#ffffff' }); if (a.t / a.d > 0.4) pastilla(ctx, a, 'BLOCKED', 960, y + 120, { color: '#ff8a8a', k: (a.t / a.d - 0.4) / 0.1 }); } }),
  // 52 «Prefería ser feliz y equivocada»
  52: plano.primer({ set: 'salon', o: { hora: 'noche' }, look: 'noche', q: 'mia', mood: 'angry', quien: Q, despues: B('"I\'d rather be happy and wrong."', 640, 300, { size: 38 }) }),
  // 53 Sola en el sofá, llorando
  53: plano.general({ set: 'salon', o: { hora: 'noche' }, look: 'noche', quien: Q, z: [1.1, 1.18], f: [960, 620], actores: [{ q: 'you', x: 960, gy: 900, esc: 1, mood: 'sad' }],
    despues: (ctx, a, K, { A }) => { for (const d of [-1, 1]) { const q = (a.t * 0.6 + (d > 0 ? 0.5 : 0)) % 1; K.E(ctx, 960 + d * 30, A[0].head + 40 + q * 120, 7, 11, '#9fd8ff', 0, 0); } } }),
  // 54 La verdad no siempre es un regalo: a veces es un arma
  54: plano.dato({ set: 'salon', o: { hora: 'noche' }, look: 'noche', titulo: 'The truth', dibuja: (ctx, a) => { pastilla(ctx, a, 'a gift', 700, 540, { size: 54 }); pastilla(ctx, a, 'a weapon', 1220, 540, { size: 54, color: '#ff8a8a', k: Math.max(0, (a.t / a.d - 0.45) / 0.1) }); } }),
  // 55 Dejas de avisar y miras en silencio
  55: plano.general({ set: 'calle', o: { hora: 'noche', gente: 6 }, look: 'noche', quien: Q, actores: [{ q: 'x1', x: 300 }, { q: 'x4', x: 620 }, { q: 'you', x: 1300, esc: 1.15, mood: 'neutral' }],
    despues: (ctx, a, K, { A }) => { T(ctx, K, a, 300, A[0].top - 50, 2, 0.1, 0.5); T(ctx, K, a, 620, A[1].top - 50, 1, 0.2, 0.5); thread(ctx, K, 300, A[0].chest, 620, A[1].chest, 1, a.t, -150); }, delante: (ctx, a) => fg.farola(ctx, 1800, a.t, true) }),
  // 56 Una noche tienes una idea
  56: plano.general({ set: 'dormitorio', o: { hora: 'noche' }, look: 'noche', quien: Q, z: [1, 1.08], f: [900, 560], actores: [{ q: 'you', x: 900, mood: 'happy', esc: 1.1 }],
    despues: (ctx, a, K, { A }) => { const k = K.ph(a.t, a.d, 0.2, 0.4); if (k > 0) { glow(ctx, 900, A[0].top - 90, 200, '#ffe08a', 0.6 * k); K.C(ctx, 900, A[0].top - 100, 46 * k, '#ffe08a', 0); } }, delante: (ctx) => fg.mesa(ctx, 900, 880, 700) }),
  // 57 Tu app «Pink»
  57: plano.detalle({ set: 'dormitorio', o: { hora: 'noche' }, look: 'noche',
    dibuja: (ctx, a, K) => { const y = 560 + rise(K, a); panel(ctx, 960, y, 420, 760, 50); heart(ctx, K, 960, y - 180, 90, PINK, 0); K.text(ctx, 'Pink', 960, y - 20, { size: 70, color: '#ffffff' }); K.text(ctx, 'Who likes you?', 960, y + 80, { size: 34, color: PINK2 }); pastilla(ctx, a, '100% accurate', 960, y + 200, { size: 30 }); } }),
  // 58 Adivina quién te quiere y nunca falla
  58: plano.detalle({ set: 'dormitorio', o: { hora: 'noche' }, look: 'noche', dibuja: (ctx, a, K) => movil(ctx, a, K, 560, ['Sam  ·  likes you', 'Alex  ·  likes you', 'Jo  ·  likes you'], 'Pink') }),
  // 59 Los primeros cien usuarios: todo acierto
  59: plano.general({ set: 'cafeteria', look: 'interior', quien: Q, actores: ['x1', 'x2', 'x3', 'x4', 'cheer'].map((q, i) => ({ q, x: 200 + i * 380, mood: i % 2 ? 'shocked' : 'happy' })),
    despues: (ctx, a, K, { A }) => A.forEach((f, i) => { K.R(ctx, f.x + 30, f.chest - 20, 40, 70, 8, '#1c1a2b', 0); K.R(ctx, f.x + 34, f.chest - 14, 32, 54, 5, PINK2, 0); if (K.ph(a.t, a.d, 0.2 + i * 0.1, 0.3 + i * 0.1) >= 1) { ctx.lineWidth = 12; ctx.strokeStyle = '#2ec27e'; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(f.x - 24, f.top - 50); ctx.lineTo(f.x - 6, f.top - 30); ctx.lineTo(f.x + 28, f.top - 72); ctx.stroke(); } }), texto: { pastilla: ['First 100 users', 960, 170] } }),
  // 60 En una semana diez mil; en un mes, diez millones
  60: plano.dato({ set: 'atico', look: 'noche', titulo: 'Users', dibuja: (ctx, a, K) => { const k = K.ease.inOut(K.ph(a.t, a.d, 0.05, 0.85)), v = Math.round(10 ** (4 + 3 * k)); cifra(ctx, a, v.toLocaleString('en-US'), 960, 520, { size: 150 }); etiqueta(ctx, a, k < 0.5 ? 'in a week' : 'in a month', 960, 660, { align: 'center', size: 30 }); } }),
  // 61 Las apps de citas se hunden
  61: plano.dato({ set: 'noticias', look: 'noche', titulo: 'Dating apps', dibuja: (ctx, a, K) => { const k = K.ease.inOut(K.ph(a.t, a.d, 0.1, 0.9)); ctx.lineWidth = 10; ctx.strokeStyle = '#ff6a6a'; ctx.lineCap = 'round'; ctx.beginPath(); for (let i = 0; i <= 40 * k; i++) { const x = 560 + i * 20, y = 420 + (i / 40) ** 2 * 300 + Math.sin(i) * 12; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); pastilla(ctx, a, '-90%', 1450, 720, { color: '#ff8a8a', k: Math.max(0, (a.t / a.d - 0.8) / 0.1) }); } }),
  // 62 Los inversores hacen cola: más de mil millones
  62: plano.general({ set: 'calle', o: { hora: 'atardecer' }, quien: Q, actores: [0, 1, 2, 3, 4].map((i) => ({ q: pp({ who: {} }, 'suit', { outfit: ['#2f2f36', '#1f1f26', '#2b3a66', '#2f2f36', '#3a3f4a'][i], hair: ['side', 'bald', 'short', 'buzz', 'side'][i] }), x: 1700 - i * 250, esc: 1 - i * 0.04, mood: 'happy' })), texto: { pastilla: ['$1,000,000,000', 960, 190, { size: 50 }] } }),
  // 63 Titular: «Conoce al Oráculo del Amor». Tu cara en todas las pantallas
  63: plano.general({ set: 'noticias', look: 'noche', quien: Q, despues: (ctx, a, K) => { for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) K.face(ctx, a.who, 380 + i * 580, 250 + j * 330, 0.28, { mood: 'happy', t: a.t }); }, texto: { pastilla: ['"Meet the Love Oracle"', 960, 960, { size: 44 }] } }),
  // 64 Desconocidos te dan las gracias; parejas te nombran en sus bodas
  64: plano.general({ set: 'calle', o: { hora: 'atardecer', gente: 5 }, quien: Q, actores: [{ q: 'x4', x: 500, mood: 'happy', arms: 'up' }, { q: 'you', x: 960, esc: 1.1, mood: 'happy' }, { q: 'x1', x: 1400, mood: 'happy' }, { q: 'x2', x: 1600, mood: 'happy' }],
    despues: (ctx, a, K) => { for (let i = 0; i < 8; i++) heart(ctx, K, 300 + i * 190, 400 - ((a.t * 100 + i * 50) % 260), 20, PINK, 0); } }),
  // 65 Mucha gente te odia: dicen que mataste el romance
  65: plano.general({ set: 'calle', o: { hora: 'noche' }, look: 'tension', quien: Q, actores: ['x1', 'x3', 'x2', 'x4'].map((q, i) => ({ q, x: 360 + i * 400, mood: 'angry', arms: 'up' })),
    despues: (ctx, a, K, { A }) => A.forEach((f, i) => { K.R(ctx, f.x - 150, f.top - 230, 300, 150, 10, '#fffaf3', 4); K.text(ctx, ['LOVE IS A', 'NO MORE', 'BRING BACK', 'NOT A'][i], f.x, f.top - 180, { size: 30, color: '#c0392b' }); K.text(ctx, ['MYSTERY', 'PINK', 'ROMANCE', 'SPREADSHEET'][i], f.x, f.top - 130, { size: 30, color: '#c0392b' }); }) }),
  // 66 De noche, solo en tu ático: encima de tu cabeza, nada
  66: plano.general({ set: 'atico', look: 'noche', quien: Q, z: [1, 1.1], f: [960, 560], actores: [{ q: 'you', x: 960, mood: 'sad', esc: 1.15 }],
    despues: (ctx, a, K, { A }) => { ctx.save(); ctx.globalAlpha = K.ph(a.t, a.d, 0.4, 0.6); ctx.setLineDash([12, 12]); ctx.lineWidth = 5; ctx.strokeStyle = PINK2; heartPath(ctx, 960, A[0].top - 90, 60); ctx.stroke(); ctx.restore(); } }),
  // 67 Has dicho a millones quién les quiere; nunca a ti
  67: plano.primer({ set: 'atico', look: 'noche', q: 'you', mood: 'sad', quien: Q, antes: (ctx, a, K) => bokeh(ctx, K, a, 10, 5) }),
  // 68 Buscas en el aire vacío sobre tu reflejo
  68: plano.hombro({ set: 'bano', look: 'noche', q: 'you', de: 'you', mood: 'worried', quien: Q, despues: (ctx, a, K) => ['0?', '100?', '?'].forEach((w, i) => pastilla(ctx, a, w, 1000 + i * 220, 200 + (i % 2) * 70, { k: Math.max(0, (a.t / a.d - 0.15 - i * 0.2) / 0.1) })) }),
  // 69 ¿Alguien te quiere de verdad?
  69: plano.primer({ set: 'atico', look: 'noche', q: 'you', mood: 'worried', lado: 'izq', quien: Q, z: [1.04, 1.16] }),
  // 70 Pasada la medianoche sales de una gala y vas andando al metro
  70: plano.general({ set: 'calle', o: { hora: 'noche' }, look: 'noche', quien: Q, actores: [{ q: you({ who: {} }, {}), x: 0 }].slice(0, 0).concat([{ q: (a) => you(a, { outfit: '#1f1f26' }), anda: [300, 1500] }]), delante: (ctx, a) => fg.farola(ctx, 1840, a.t, true), texto: { etiqueta: 'Past midnight' } }),
  // 71 La calle vacía; unos pasos detrás siguen tu ritmo
  71: plano.general({ set: 'avenida', o: { hora: 'noche' }, look: 'noche', quien: Q, z: [1, 1.1], f: [960, 600], actores: [{ q: (a) => you(a, { outfit: '#1f1f26' }), x: 1100, esc: 1.2, mood: 'worried' }, { q: 'hood', x: 820, gy: 700, esc: 0.45 }] }),
  // 72 Entras en un vagón casi vacío con luz amarilla
  72: plano.general({ set: 'metro', o: { parpadeo: 1 }, look: 'noche', quien: Q, actores: [{ q: (a) => you(a, { outfit: '#1f1f26' }), anda: [-200, 600, 0, 0.6], esc: 1.15 }, { q: 'hood', x: 1650, gy: 860, esc: 0.9, still: true }], delante: (ctx) => fg.barra(ctx, 1320) }),
  // 73 Al fondo, un hombre con capucha te mira
  73: plano.hombro({ set: 'metro', o: { parpadeo: 1 }, look: 'noche', q: 'hood', de: 'you', quien: Q }),
  // 74 Mira el espacio vacío sobre tu cabeza
  74: plano.primer({ set: 'metro', o: { parpadeo: 1 }, look: 'noche', q: 'hood', mood: 'neutral', quien: Q, despues: (ctx, a, K) => { ctx.save(); ctx.globalAlpha = 0.5; ctx.setLineDash([10, 14]); ctx.lineWidth = 4; ctx.strokeStyle = PINK2; ctx.beginPath(); ctx.moveTo(1200, 360); ctx.lineTo(500, 150); ctx.stroke(); ctx.restore(); } }),
  // 75 Se sienta enfrente: «Tú también los ves, ¿verdad?»
  75: plano.hombro({ set: 'metro', o: { parpadeo: 1 }, look: 'noche', q: 'hood', de: 'you', quien: Q, despues: B('"You see them too, don\'t you?"', 1240, 170, { size: 38 }) }),
  // 76 No eres el único con este poder
  76: plano.primer({ set: 'metro', o: { parpadeo: 1 }, look: 'tension', q: 'you', mood: 'shocked', lado: 'izq', quien: Q, z: [1.02, 1.18] }),
  // 77 «Te he observado durante meses»
  77: plano.primer({ set: 'metro', o: { parpadeo: 1 }, look: 'noche', q: 'hood', mood: 'happy', quien: Q, despues: B('"I\'ve watched you for months."', 640, 300, { size: 38 }) }),
  // 78 «Tu número no es cero»
  78: plano.hombro({ set: 'metro', o: { parpadeo: 1 }, look: 'noche', q: 'hood', de: 'you', mood: 'happy', quien: Q, despues: B('"And it isn\'t zero."', 1240, 170) }),
  // 79 «El tuyo dice uno. Y el hilo va hacia mí»
  79: plano.primer({ set: 'metro', o: { parpadeo: 1 }, look: 'tension', q: 'you', mood: 'shocked', lado: 'izq', quien: Q, despues: (ctx, a, K, { B: b }) => T(ctx, K, a, 640, b.head - 300, 1, 0.3, 1.1) }),
  // 80 Una línea rosa va de su pecho al tuyo
  80: plano.general({ set: 'metro', o: { parpadeo: 1 }, look: 'noche', quien: Q, actores: [{ q: (a) => you(a, { outfit: '#1f1f26' }), x: 520, gy: 1010, esc: 1.1, mood: 'shocked' }, { q: 'hood', x: 1420, esc: 1.1, mood: 'happy' }],
    despues: (ctx, a, K, { A }) => { thread(ctx, K, A[1].x, A[1].chest, A[0].x, A[0].chest, K.ph(a.t, a.d, 0.1, 0.7), a.t, -120, PINK, 12); T(ctx, K, a, A[0].x, A[0].top - 60, 1, 0.05, 0.7); } }),
  // 81 Ahora sabes dos cosas
  81: plano.dato({ set: 'metro', look: 'noche', titulo: 'Now you know', dibuja: (ctx, a) => { pastilla(ctx, a, 'who likes everyone', 960, 470, { size: 44 }); pastilla(ctx, a, 'who has been watching you', 960, 600, { size: 44, k: Math.max(0, (a.t / a.d - 0.4) / 0.1) }); } }),
  // 82 ¿Querrías ver tu propio número? Cuéntamelo en los comentarios
  82: plano.primer({ set: 'calle', o: { hora: 'atardecer', gente: 6 }, q: 'you', mood: 'happy', lado: 'izq', quien: Q, antes: (ctx, a, K) => bokeh(ctx, K, a, 14, 2), despues: (ctx, a, K, { B: b }) => { ctx.save(); ctx.globalAlpha = 0.8; ctx.setLineDash([12, 12]); ctx.lineWidth = 6; ctx.strokeStyle = PINK2; heartPath(ctx, 640, b.head - 300, 70); ctx.stroke(); ctx.restore(); pastilla(ctx, a, '?', 640, b.head - 310, { size: 50 }); }, texto: { pastilla: ['Would you want to see your number?', 1300, 300, { size: 38 }] } }),
};
