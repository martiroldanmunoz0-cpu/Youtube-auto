// largo-27-01 — "What If You Had to Spend $1 Billion in 30 Days?"
// 79 planos horizontales (export «ancho»), uno distinto por plano. Estilo gente.mjs + escenario.mjs.
import { SET } from '../../lib/sets.mjs';

const W = 1920, H = 1080, INK = '#1b1530';
let CAST = null;
function cast(K) {
  if (CAST) return CAST;
  const sin = { sombrero: null, corbata: null, barba: false, bigote: false };
  const [YOU, MAYA, DEON, PRIYA, LAW] = K.reparto('largo-27', 5, [
    { ...sin, estilo: 'limpio', pelo: 'pinchos', peloCol: '#3a2414', ropa: '#4d96ff' },
    { ...sin, estilo: 'limpio', pelo: 'melena', peloCol: '#1a120c', ropa: '#ff6b6b' },
    { ...sin, estilo: 'gordito', pelo: 'calvo', sombrero: 'gorra', ropa: '#ffd93d' },
    { ...sin, estilo: 'limpio', pelo: 'coleta', peloCol: '#120c08', gafas: true, ropa: '#b07cff' },
    { ...sin, estilo: 'gordito', pelo: 'coronilla', peloCol: '#9a9a9a', corbata: '#c1121f', bigote: true, ropa: '#2b2d42' },
  ]);
  CAST = { YOU, MAYA, DEON, PRIYA, LAW };
  return CAST;
}
const fase = (a) => Math.min(1, Math.max(0, a.t / (a.d || 4)));
const $ = (n) => '$' + Math.round(n).toLocaleString('en-US');
const D = (K, ctx, a, p, x, gy, esc, o = {}) => K.dibuja(ctx, p, x, gy, esc, { t: a.t, ...o });
const sky = (ctx, c1, c2, y1 = H) => { const g = ctx.createLinearGradient(0, 0, 0, y1); g.addColorStop(0, c1); g.addColorStop(1, c2); ctx.fillStyle = g; ctx.fillRect(0, 0, W, y1); };
const suelo = (ctx, y, c1, c2) => { const g = ctx.createLinearGradient(0, y, 0, H); g.addColorStop(0, c1); g.addColorStop(1, c2); ctx.fillStyle = g; ctx.fillRect(0, y, W, H - y); ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); };
const lerpN = (a, b, k) => a + (b - a) * k;
const sm = (k) => k * k * (3 - 2 * k);

// --- Marcador gigante de dinero (pantalla digital) ---
function marcador(K, ctx, a, valor, x, y, { w = 900, size = 110, col = '#4dff88', marco = '#2a2440', parp = false } = {}) {
  ctx.save(); const h = size * 1.7;
  K.R(ctx, x - w / 2 - 18, y - h / 2 - 18, w + 36, h + 36, 26, marco, 9);
  K.R(ctx, x - w / 2, y - h / 2, w, h, 16, '#07120c', 6);
  for (let i = 0; i < 2; i++) K.R(ctx, x - w * 0.3 + i * w * 0.6 - 8, y - h / 2 - 90, 16, 72, 4, '#3a3450', 5);
  const on = !parp || Math.sin(a.t * 18) > -0.4;
  if (on) {
    ctx.shadowColor = col; ctx.shadowBlur = 30; ctx.fillStyle = col; ctx.font = `900 ${size}px Poppins`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const txt = typeof valor === 'number' ? $(valor) : valor;
    let s = size; while (ctx.measureText(txt).width > w * 0.92 && s > 30) { s -= 4; ctx.font = `900 ${s}px Poppins`; }
    ctx.fillText(txt, x, y + 6);
  }
  ctx.shadowBlur = 0; ctx.globalAlpha = 0.12; ctx.fillStyle = '#fff'; for (let yy = y - h / 2; yy < y + h / 2; yy += 8) ctx.fillRect(x - w / 2, yy, w, 3);
  ctx.restore();
}
const dia = (K, ctx, a, n, x = 170, y = 70) => K.contador(ctx, a, `DAY ${n}`, x, y, { icono: 'reloj', size: 36 });
const saldo = (K, ctx, a, v, x = 1700, y = 70, col) => K.contador(ctx, a, typeof v === 'number' ? $(v) : v, x, y, { icono: 'dinero', size: 34, ...(col ? { col } : {}) });

// --- Billetes ---
function billete(K, ctx, x, y, s = 1, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); K.R(ctx, -70, -34, 140, 68, 8, '#8fd694', 5); K.C(ctx, 0, 0, 20, '#c8f2c9', 4); ctx.fillStyle = '#2d6b35'; ctx.font = '900 26px Poppins'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('$', 0, 1); ctx.restore(); }
function lluvia(K, ctx, a, n = 26, seed = 1, x0 = 0, x1 = W) { for (let i = 0; i < n; i++) { const r = Math.sin((i + seed) * 91.7) * 0.5 + 0.5, r2 = Math.sin((i + seed) * 37.3) * 0.5 + 0.5; const y = ((a.t * (120 + r2 * 140) + r * H * 1.4) % (H + 200)) - 100; billete(K, ctx, x0 + r * (x1 - x0) + Math.sin(a.t * 2 + i) * 30, y, 0.7 + r2 * 0.5, Math.sin(a.t * 3 + i) * 0.8); } }
function fajo(K, ctx, x, y, s = 1, n = 5) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); for (let i = 0; i < n; i++) { K.R(ctx, -90, -i * 22 - 22, 180, 24, 5, i % 2 ? '#7ccf83' : '#8fd694', 5); } K.R(ctx, -20, -n * 22 - 2, 40, n * 22 + 4, 3, '#f4e7b0', 4); ctx.restore(); }
function sello(K, ctx, a, txt, x, y, { p0 = 0.3, col = '#ff3b4e', size = 90, rot = -0.18 } = {}) { const k = K.clamp((fase(a) - p0) / 0.06); if (k <= 0) return; const s = 1 + (1 - k) * 1.5; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.globalAlpha = k; ctx.font = `900 ${size}px Anton`; const w = ctx.measureText(txt).width + 60; ctx.strokeStyle = col; ctx.lineWidth = 12; ctx.strokeRect(-w / 2, -size * 0.75, w, size * 1.5); ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, 6); ctx.restore(); }

// --- Objetos grandes ---
function mansion(K, ctx, x, gy, s = 1, noche = false) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s);
  K.R(ctx, -520, -420, 1040, 420, 8, '#f4ede0', 9); K.P(ctx, [[-560, -420], [0, -620], [560, -420]], '#7a4b3a', 9);
  K.R(ctx, -160, -560, 320, 140, 6, '#f4ede0', 8); K.P(ctx, [[-190, -560], [0, -680], [190, -560]], '#7a4b3a', 8);
  for (let i = -3; i <= 3; i++) { if (i === 0) continue; for (let j = 0; j < 2; j++) K.R(ctx, i * 140 - 45, -370 + j * 180, 90, 120, 6, noche ? '#ffd76a' : '#9fd8ff', 6); }
  for (const c of [-110, 110]) K.R(ctx, c - 18, -300, 36, 300, 4, '#ffffff', 6);
  K.R(ctx, -60, -200, 120, 200, 50, '#5a3a28', 7); K.C(ctx, 0, -500, 38, noche ? '#ffd76a' : '#9fd8ff', 6);
  ctx.restore();
}
function piscina(K, ctx, x, y, w, h, t) { K.R(ctx, x, y, w, h, 30, '#3fc1ff', 8); ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 5; for (let i = 0; i < 4; i++) { ctx.beginPath(); for (let xx = x + 30; xx < x + w - 30; xx += 20) ctx.lineTo(xx, y + 30 + i * (h - 60) / 3 + Math.sin(xx * 0.03 + t * 3 + i) * 6); ctx.stroke(); } ctx.restore(); }
function coche(K, ctx, x, gy, s = 1, col = '#1f6fff', t = 0, rueda = 0) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s);
  K.P(ctx, [[-330, -40], [-320, -120], [-170, -150], [-80, -220], [120, -220], [230, -140], [330, -110], [340, -40]], col, 9);
  K.P(ctx, [[-60, -200], [100, -200], [180, -145], [-130, -145]], '#bfe6ff', 6);
  K.L(ctx, [[-10, -200], [-20, -145]], col, 6); K.R(ctx, 290, -110, 40, 22, 6, '#fff7b0', 5); K.R(ctx, -330, -100, 30, 20, 5, '#ff4d4d', 5);
  for (const wx of [-200, 210]) { ctx.save(); ctx.translate(wx, -40); ctx.rotate(rueda); K.C(ctx, 0, 0, 62, '#222', 8); K.C(ctx, 0, 0, 30, '#c9ccd6', 6); K.L(ctx, [[-28, 0], [28, 0]], '#c9ccd6', 2); ctx.restore(); }
  ctx.restore();
}
function avion(K, ctx, x, y, s = 1, rot = 0, nombre = 'VIVIAN') {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  K.P(ctx, [[-60, -10], [60, -10], [-120, 190], [-200, 190]], '#c9d3e6', 8);
  K.E(ctx, 0, 0, 420, 70, '#ffffff', 0, 9); K.P(ctx, [[-330, -40], [-420, -190], [-340, -190], [-250, -40]], '#4d96ff', 8);
  K.P(ctx, [[-60, -20], [60, -20], [-100, -170], [-170, -170]], '#e3e9f4', 8);
  for (let i = 0; i < 6; i++) K.C(ctx, -150 + i * 60, -12, 14, '#7cc8ff', 4);
  K.P(ctx, [[340, -30], [420, 0], [340, 30]], '#9fb4d9', 6);
  ctx.fillStyle = '#4d96ff'; ctx.font = '900 40px Anton'; ctx.textAlign = 'center'; ctx.fillText(nombre, 40, 48); ctx.restore();
}
function yate(K, ctx, x, y, s = 1, t = 0) {
  ctx.save(); ctx.translate(x, y + Math.sin(t * 2) * 6); ctx.scale(s, s);
  K.P(ctx, [[-420, -60], [420, -60], [330, 60], [-380, 60]], '#ffffff', 9); K.R(ctx, -260, -150, 440, 90, 20, '#f2f4fa', 8); K.R(ctx, -180, -220, 270, 70, 20, '#f2f4fa', 8);
  for (let i = 0; i < 5; i++) K.R(ctx, -230 + i * 80, -130, 56, 40, 8, '#2a4a7a', 5);
  K.L(ctx, [[-410, 0], [400, 0]], '#4d96ff', 6); ctx.restore();
}
function isla(K, ctx, x, y, s = 1, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  K.E(ctx, 0, 0, 520, 110, '#ffe3a3', 0, 9); K.E(ctx, 0, -30, 380, 70, '#6bcb77', 0, 7);
  K.R(ctx, -300, -60, 420, 24, 6, '#5d5d6e', 5); for (let i = 0; i < 6; i++) K.R(ctx, -280 + i * 70, -52, 34, 8, 2, '#fff', 0);
  for (const [px, ph] of [[170, 1], [290, 0.8], [-380, 0.9]]) palmera(K, ctx, px, -40, ph, t);
  ctx.restore();
}
function palmera(K, ctx, x, y, s = 1, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineCap = 'round';
  ctx.strokeStyle = INK; ctx.lineWidth = 34; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(30, -150, 10, -300); ctx.stroke();
  ctx.strokeStyle = '#a8743f'; ctx.lineWidth = 20; ctx.stroke();
  for (let i = 0; i < 6; i++) { ctx.save(); ctx.translate(10, -300); ctx.rotate(-Math.PI + i * 0.62 + Math.sin(t * 1.5 + i) * 0.06); K.E(ctx, 90, 0, 100, 26, '#3fa85a', 0.25, 6); ctx.restore(); }
  K.C(ctx, 0, -285, 18, '#7a4b2a', 5); K.C(ctx, 26, -282, 18, '#7a4b2a', 5); ctx.restore();
}
function estadio(K, ctx, x, gy, s = 1, t = 0, luces = true) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s);
  K.E(ctx, 0, -140, 640, 220, '#c9ccd6', 0, 9); K.E(ctx, 0, -160, 540, 160, '#5d6680', 0, 7); K.E(ctx, 0, -150, 420, 110, '#4caf50', 0, 7);
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(0, -150, 60, 25, 0, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, -260); ctx.lineTo(0, -40); ctx.stroke();
  for (const lx of [-560, 560]) { K.R(ctx, lx - 10, -560, 20, 360, 4, '#8a8fa6', 6); K.R(ctx, lx - 70, -620, 140, 70, 8, '#3a3d4c', 6); if (luces) for (let i = 0; i < 4; i++) K.C(ctx, lx - 48 + i * 32, -585, 12, '#fff7c2', 3); }
  ctx.restore();
}
function camion(K, ctx, x, gy, s = 1, col = '#ff6b6b', txt = 'TACOS') {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s);
  K.R(ctx, -260, -330, 400, 270, 20, col, 9); K.R(ctx, 140, -250, 130, 190, 20, col, 9); K.R(ctx, 170, -230, 80, 70, 10, '#bfe6ff', 6);
  K.R(ctx, -220, -280, 300, 110, 10, '#2a1d2e', 6); K.P(ctx, [[-240, -290], [100, -290], [120, -250], [-260, -250]], '#ffd93d', 6);
  ctx.fillStyle = '#fff'; ctx.font = '900 46px Anton'; ctx.textAlign = 'center'; ctx.fillText(txt, -60, -100);
  for (const wx of [-160, 180]) { K.C(ctx, wx, -55, 48, '#222', 8); K.C(ctx, wx, -55, 20, '#c9ccd6', 5); }
  ctx.restore();
}
function hospital(K, ctx, a, x, gy, s = 1, { pisos = 6, luces = 1, noche = false, obra = 0 } = {}) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s);
  const ph = 110, w = 760;
  const alto = pisos * ph;
  if (obra < 1) { K.R(ctx, -w / 2, -alto, w, alto, 6, 'rgba(200,205,215,0.5)', 6); ctx.strokeStyle = '#8a8fa6'; ctx.lineWidth = 6; for (let i = 0; i <= pisos; i++) { ctx.beginPath(); ctx.moveTo(-w / 2, -i * ph); ctx.lineTo(w / 2, -i * ph); ctx.stroke(); } for (let j = 0; j <= 6; j++) { ctx.beginPath(); ctx.moveTo(-w / 2 + j * w / 6, 0); ctx.lineTo(-w / 2 + j * w / 6, -alto); ctx.stroke(); } }
  const hecho = Math.round(pisos * Math.max(obra, 0));
  if (hecho > 0) {
    K.R(ctx, -w / 2, -hecho * ph, w, hecho * ph, 6, '#f4f6fb', 9);
    for (let f = 0; f < hecho; f++) for (let c = 0; c < 7; c++) { const on = (f + 1) / pisos <= luces; K.R(ctx, -w / 2 + 34 + c * 102, -(f + 1) * ph + 26, 70, 60, 6, on ? (noche ? '#ffe27a' : '#bfe6ff') : '#3a4258', 5); }
    if (hecho === pisos) {
      K.R(ctx, -230, -alto - 90, 460, 90, 10, '#e63946', 8); ctx.fillStyle = '#fff'; ctx.font = '900 64px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('HOSPITAL', 0, -alto - 42);
      K.R(ctx, w / 2 - 150, -alto - 46, 120, 46, 6, '#3a3d4c', 5); ctx.fillStyle = '#ffd93d'; ctx.font = '900 34px Anton'; ctx.fillText('H', w / 2 - 90, -alto - 22);
      K.R(ctx, -90, -150, 180, 150, 10, '#9fd8ff', 7); K.R(ctx, -w / 2 - 80, -260, 170, 160, 8, '#f4f6fb', 8); K.R(ctx, -w / 2 - 40, -225, 90, 90, 8, '#e63946', 0); ctx.fillStyle = '#fff'; ctx.fillRect(-w / 2 - 10, -215, 30, 70); ctx.fillRect(-w / 2 - 30, -195, 70, 30);
    }
  }
  ctx.restore();
}
function grua(K, ctx, x, gy, s = 1, t = 0, col = '#ffc93d') {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s);
  K.R(ctx, -26, -900, 52, 900, 4, col, 7); ctx.strokeStyle = INK; ctx.lineWidth = 4; for (let y = -880; y < 0; y += 60) { ctx.beginPath(); ctx.moveTo(-26, y); ctx.lineTo(26, y + 60); ctx.stroke(); }
  const r = Math.sin(t * 0.6) * 0.12; ctx.save(); ctx.translate(0, -900); ctx.rotate(r);
  K.R(ctx, -200, -30, 760, 40, 4, col, 7); K.R(ctx, -230, -10, 80, 70, 6, '#5d5d6e', 6); K.R(ctx, -40, -10, 80, 70, 8, '#ff8c42', 6);
  const hx = 420; ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(hx, 10); ctx.lineTo(hx, 260 + Math.sin(t) * 30); ctx.stroke(); K.R(ctx, hx - 80, 260 + Math.sin(t) * 30, 160, 40, 4, '#e05a4a', 6);
  ctx.restore(); ctx.restore();
}
function resonancia(K, ctx, x, gy, s = 1, t = 0) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s);
  K.R(ctx, -300, -520, 400, 520, 60, '#f4f6fb', 9); K.C(ctx, -100, -270, 140, '#2a3550', 8); K.C(ctx, -100, -270, 100, '#1b2236', 5);
  ctx.save(); ctx.globalAlpha = 0.4 + 0.3 * Math.sin(t * 4); K.C(ctx, -100, -270, 70, '#4dc9ff', 0); ctx.restore();
  K.R(ctx, -120, -230, 520, 50, 16, '#dfe6f2', 7); K.R(ctx, 100, -180, 40, 180, 6, '#c9ccd6', 6); K.R(ctx, -260, -480, 160, 50, 10, '#4d96ff', 5);
  ctx.fillStyle = '#fff'; ctx.font = '900 30px Poppins'; ctx.textAlign = 'center'; ctx.fillText('MRI', -180, -444); ctx.restore();
}
function movil(K, ctx, x, y, s, dentro, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  K.R(ctx, -170, -330, 340, 660, 46, '#1b1530', 9); ctx.save(); ctx.beginPath(); ctx.roundRect(-148, -300, 296, 600, 30); ctx.clip(); ctx.fillStyle = '#f7f8fc'; ctx.fillRect(-148, -300, 296, 600); dentro(ctx); ctx.restore();
  K.R(ctx, -50, -318, 100, 14, 7, '#3a3450', 0); ctx.restore();
}
function carpeta(K, ctx, x, y, s = 1, rot = 0, txt = 'ESTATE OF\nVIVIAN') {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  K.R(ctx, -200, -150, 400, 300, 14, '#d9a35b', 8); K.R(ctx, -200, -175, 150, 40, 10, '#d9a35b', 7); K.R(ctx, -150, -95, 300, 120, 8, '#fdf6e3', 5);
  ctx.fillStyle = INK; ctx.font = '800 32px Poppins'; ctx.textAlign = 'center'; txt.split('\n').forEach((l, i) => ctx.fillText(l, 0, -48 + i * 40)); ctx.restore();
}
function ambulancia(K, ctx, a, x, gy, s = 1) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s);
  K.R(ctx, -330, -320, 460, 270, 18, '#ffffff', 9); K.P(ctx, [[130, -250], [250, -250], [330, -150], [330, -50], [130, -50]], '#ffffff', 9); K.P(ctx, [[150, -235], [240, -235], [300, -150], [150, -150]], '#bfe6ff', 6);
  K.R(ctx, -330, -170, 660, 30, 0, '#e63946', 0); ctx.fillStyle = '#e63946'; ctx.fillRect(-140, -290, 40, 110); ctx.fillRect(-175, -255, 110, 40);
  const on = Math.sin(a.t * 14) > 0; K.R(ctx, -60, -350, 120, 32, 8, on ? '#ff3b4e' : '#4d8cff', 5);
  if (on) K.radial && K.radial(ctx, 0, -340, 220, 'rgba(255,60,80,0.6)', 0.7); else K.radial && K.radial(ctx, 0, -340, 220, 'rgba(70,130,255,0.6)', 0.7);
  for (const wx of [-200, 210]) { K.C(ctx, wx, -50, 56, '#222', 8); K.C(ctx, wx, -50, 24, '#c9ccd6', 5); }
  ctx.restore();
}
// Fondo de despacho del abogado con el marcador encima
function despacho(K, ctx, a, valor, { col = '#4dff88', parp = false, hora = 'atardecer', mw = 760 } = {}) {
  const { gy } = SET.despacho(ctx, a.t, { a, hora });
  marcador(K, ctx, a, valor, W / 2, 150, { w: mw, size: 84, col, parp });
  return gy;
}
// Escritorio grande en primer término
function escritorio(K, ctx, x, y, w = 900) { K.R(ctx, x - w / 2, y, w, 40, 10, '#8a5a35', 8); K.R(ctx, x - w / 2 + 20, y + 40, w - 40, H - y, 0, '#6e4527', 8); }

export const ancho = {};
const A = ancho;

// ===================== CAPÍTULO 1 · THE RULE =====================
Object.assign(A, {
  // 0 — Gancho: tú bajo un foco, el marcador de mil millones cae del techo, lluvia de billetes
  0: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { sky(ctx, '#140d26', '#2b1d4a'); suelo(ctx, 880, '#2a2040', '#140d26'); K.radial(ctx, W / 2, 700, 520, '#ffe696', 0.45);
      const k = K.ease.outBack ? K.ease.outBack(K.clamp(fase(a) / 0.25)) : K.clamp(fase(a) / 0.25);
      marcador(K, ctx, a, 1000000000, W / 2, lerpN(-200, 240, k), { w: 1100, size: 120 });
      lluvia(K, ctx, a, 30, 3);
      const y = D(K, ctx, a, YOU, W / 2, 990, 1.35, { pose: 'vitorea', mood: 'sorpresa' }); K.simbolo(ctx, a, y.cabeza, y.hr, '!', 0.3); }, { de: 1.15, a: 1, foco: [W / 2, 500], temblor: 0.3, f0: 0, f1: 0.2 });
    K.luz(ctx, a, { tono: 'noche', foco: [W / 2, 600], r: 700 }); K.contador(ctx, a, '30 DAYS', W / 2, 1020, { icono: 'reloj', size: 40, col: '#c1121f', p0: 0.45 }); },
  // 1 — ¿Podrías? Un único dólar sobrante: tú sostienes un billete y el marcador marca $1
  1: (ctx, a, K) => { const { YOU } = cast(K);
    K.interior(ctx, a, { tipo: 'oficina', hora: 'noche' }); marcador(K, ctx, a, fase(a) < 0.45 ? 1000000000 : 1, W / 2, 190, { w: 820, size: 96, col: fase(a) < 0.45 ? '#4dff88' : '#ff4d5e', parp: fase(a) >= 0.45 });
    const y = D(K, ctx, a, YOU, 820, 990, 1.3, { pose: 'sostiene', mood: fase(a) < 0.45 ? 'feliz' : 'miedo', mira: 1 }); billete(K, ctx, y.manoD[0] + 40, y.manoD[1] - 10, 1.1, -0.2);
    K.globo(ctx, a, 'Just ONE dollar?', 1320, 430, { tx: y.cabeza[0] + 60, ty: y.cabeza[1] - 40, p0: 0.5, size: 44 });
    K.luz(ctx, a, { tono: 'tension', foco: [900, 500] }); K.contador(ctx, a, 'LEFTOVER = LOSE ALL', 330, 70, { icono: null, size: 32, col: '#c1121f', p0: 0.55 }); },
  // 2 — La regla: medianoche del día 30, tú te quedas sin nada (todo se esfuma de tus manos)
  2: (ctx, a, K) => { const { YOU } = cast(K);
    sky(ctx, '#0b1030', '#2a2f66'); for (let i = 0; i < 60; i++) K.C(ctx, (i * 337) % W, (i * 151) % 600, 2 + (i % 3), '#fff', 0);
    K.C(ctx, 1560, 220, 150, '#f6f1e3', 9); ctx.save(); ctx.translate(1560, 220); ctx.strokeStyle = INK; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -110); ctx.moveTo(0, 0); ctx.lineTo(0, -100); ctx.stroke(); ctx.fillStyle = INK; ctx.font = '900 40px Anton'; ctx.textAlign = 'center'; ctx.fillText('12', 0, -112 + 40); ctx.restore();
    suelo(ctx, 900, '#3a3352', '#1b1530');
    const k = K.clamp((fase(a) - 0.3) / 0.5);
    for (let i = 0; i < 14; i++) { const r = Math.sin(i * 12.9) * 0.5 + 0.5; ctx.save(); ctx.globalAlpha = 1 - k * 0.9; billete(K, ctx, 700 + r * 300 + k * (i - 7) * 80, 640 - k * (200 + r * 400), 0.8, k * 4 + i); ctx.restore(); }
    const y = D(K, ctx, a, YOU, 800, 1000, 1.3, { pose: k > 0.3 ? 'llora' : 'sostiene', mood: k > 0.3 ? 'triste' : 'feliz', mira: 1 });
    K.text(ctx, 'EVERY LAST CENT', 1280, 620, { size: 80, color: '#ff4d5e', rot: -0.05, k: K.clamp((fase(a) - 0.45) / 0.1) });
    K.luz(ctx, a, { tono: 'noche', foco: [800, 600] }); dia(K, ctx, a, 30); K.contador(ctx, a, '12:00 AM', 400, 70, { icono: 'rec', size: 30 }); },
  // 3 — Ni regalarlo ni quemarlo: dos viñetas con sello NO
  3: (ctx, a, K) => { const { YOU, MAYA } = cast(K);
    K.paneles(ctx, a, [
      (c, { w }) => { K.calle(c, a, { W: w, H, hora: 'dia' }); const y = D(K, c, a, YOU, w * 0.35, 990, 1.05, { pose: 'sostiene', mira: 1, mood: 'feliz' }); fajo(K, c, y.manoD[0] + 70, y.manoD[1] + 50, 0.9, 4);
        D(K, c, a, MAYA, w * 0.72, 990, 1.05, { pose: 'senala', mira: -1, mood: 'sorpresa' }); K.rotulo(c, a, 'GIVE IT AWAY?', w / 2, 70); sello(K, c, a, 'NO', w / 2, 480, { p0: 0.3, size: 130 }); K.luz(c, a, { W: w, H, tono: 'dia', foco: [w / 2, 500] }); },
      (c, { w }) => { K.interior(c, a, { W: w, H, tipo: 'dormitorio', hora: 'noche' }); fajo(K, c, w * 0.62, 960, 1.4, 6); const fl = 1 + Math.sin(a.t * 12) * 0.1; c.save(); c.translate(w * 0.62, 800); c.scale(fl, fl); K.prop(c, 'fuego', 0, 0, 0.35, a.t); c.restore();
        D(K, c, a, YOU, w * 0.3, 990, 1.05, { pose: 'miedo', mira: 1, mood: 'miedo' }); K.rotulo(c, a, 'BURN IT?', w / 2, 70); sello(K, c, a, 'NO', w / 2, 480, { p0: 0.45, size: 130 }); K.luz(c, a, { W: w, H, tono: 'noche', foco: [w * 0.62, 760] }); },
    ], { W, H }); },
  // 4 — Despacho del abogado: desliza la carpeta por la mesa
  4: (ctx, a, K) => { const { YOU, LAW } = cast(K);
    const { gy } = SET.despacho(ctx, a.t, { a, hora: 'atardecer' });
    const l = D(K, ctx, a, LAW, 1180, gy - 20, 1.25, { pose: 'empuja', mira: -1, mood: 'neutral', habla: true });
    escritorio(K, ctx, W / 2, 780, 1500);
    carpeta(K, ctx, lerpN(1100, 760, sm(K.clamp(fase(a) / 0.5))), 770, 0.7, -0.05);
    K.globo(ctx, a, 'Your great-aunt Vivian left you... everything.', 1420, 300, { tx: l.cabeza[0] + 40, ty: l.cabeza[1] - 70, p0: 0.35, size: 40, max: 620 });
    K.hombro(ctx, a, YOU, { lado: -1 }); K.luz(ctx, a, { tono: 'atardecer', foco: [1100, 450] }); },
  // 5 — Detalle: la carpeta abierta, 1 billion y la condición extraña
  5: (ctx, a, K) => {
    K.camara(ctx, a, () => { sky(ctx, '#6b4429', '#4a2e1b'); for (let i = 0; i < 9; i++) K.R(ctx, 0, i * 130, W, 6, 0, 'rgba(0,0,0,0.12)', 0);
      K.R(ctx, 360, 120, 1200, 860, 20, '#d9a35b', 10); K.R(ctx, 420, 160, 540, 780, 8, '#fdf6e3', 6); K.R(ctx, 980, 160, 540, 780, 8, '#fdf6e3', 6);
      ctx.fillStyle = INK; ctx.font = '800 34px Poppins'; ctx.textAlign = 'left'; ['LAST WILL OF', 'VIVIAN ', '', 'CASH', 'STOCKS', 'ACCOUNTS'].forEach((t, i) => ctx.fillText(t, 470, 240 + i * 60));
      ctx.font = '900 70px Anton'; ctx.fillStyle = '#2d6b35'; ctx.fillText('$1,000,000,000', 455, 680);
      ctx.fillStyle = INK; ctx.font = '800 34px Poppins'; ctx.fillText('CONDITION:', 1030, 240); ctx.font = '600 30px Poppins'; ['Spend it ALL', 'in 30 days.', 'One dollar left', '= lose everything.'].forEach((t, i) => ctx.fillText(t, 1030, 320 + i * 50));
      ctx.strokeStyle = '#ff3b4e'; ctx.lineWidth = 8; ctx.beginPath(); ctx.ellipse(1190, 380, 230, 140, -0.05, 0, 7 * K.clamp((fase(a) - 0.4) / 0.3)); ctx.stroke();
      K.text(ctx, 'Vivian ✎', 1240, 820, { size: 54, color: '#3a2a6a', rot: -0.1 }); }, { de: 1, a: 1.18, foco: [1190, 420] });
    K.luz(ctx, a, { tono: 'interior', foco: [1150, 420], vineta: 0.7 }); K.etiqueta(ctx, a, 'STRANGE CONDITION', 1500, 120, { p0: 0.55 }); },
  // 6 — Treinta días y un marcador gigante que se enciende sobre la ciudad
  6: (ctx, a, K) => { const { YOU, LAW } = cast(K);
    K.ciudad(ctx, a, { hora: 'noche' });
    const k = K.clamp(fase(a) / 0.2); ctx.save(); ctx.globalAlpha = k; marcador(K, ctx, a, 1000000000, W / 2, 330, { w: 1150, size: 120 }); ctx.restore();
    K.contador(ctx, a, '30 DAYS', W / 2, 560, { icono: 'reloj', size: 56, col: '#c1121f', p0: 0.3 });
    D(K, ctx, a, LAW, 1400, 1080, 1.0, { pose: 'senala', mira: -1, mood: 'neutral' }); D(K, ctx, a, YOU, 560, 1080, 1.05, { pose: 'quieto', mira: 1, espalda: true });
    K.luz(ctx, a, { tono: 'noche', foco: [W / 2, 330], r: 800 }); K.etiqueta(ctx, a, 'tracks every cent', 1560, 690, { p0: 0.5, cx: 1450, cy: 420 }); },
  // 7 — Te ríes a carcajadas: primer plano en el despacho, el abogado serio detrás
  7: (ctx, a, K) => { const { YOU, LAW } = cast(K);
    K.camara(ctx, a, () => { const { gy } = SET.despacho(ctx, a.t, { a, hora: 'dia' });
      K.desenfocado(ctx, 5, (c) => D(K, c, a, LAW, 1450, gy, 1.2, { pose: 'brazos', mira: -1, mood: 'neutral' }));
      const y = D(K, ctx, a, YOU, 760, 1250, 2.0, { pose: 'aplaude', mira: 1, mood: 'risa', habla: true });
      K.globo(ctx, a, 'HA! A month? EASY!', 1180, 230, { tx: y.cabeza[0] + 120, ty: y.cabeza[1] - 60, p0: 0.15, size: 52 });
      for (let i = 0; i < 3; i++) K.text(ctx, 'HA', 260 + i * 90, 300 + i * 70 + Math.sin(a.t * 8 + i) * 10, { size: 60, color: '#ffd93d', rot: -0.3 + i * 0.2 }); }, { de: 1, a: 1.08, foco: [800, 500] });
    K.luz(ctx, a, { tono: 'interior', foco: [800, 450] }); },
  // 8 — "Wrong." El abogado de frente, contraplano por encima de tu hombro
  8: (ctx, a, K) => { const { YOU, LAW } = cast(K);
    K.camara(ctx, a, () => { const { gy } = SET.despacho(ctx, a.t, { a, hora: 'atardecer' });
      const l = D(K, ctx, a, LAW, 1100, gy + 160, 1.7, { pose: 'senala', mira: -1, mood: 'enfadado', habla: true });
      K.globo(ctx, a, 'Wrong.', 1500, 260, { tx: l.cabeza[0] + 80, ty: l.cabeza[1] - 60, p0: 0.1, size: 80, grito: true }); }, { de: 1.0, a: 1.15, foco: [1100, 450], temblor: 0.2, f0: 0.1, f1: 0.2 });
    K.luz(ctx, a, { tono: 'tension', foco: [1100, 420] }); K.hombro(ctx, a, YOU, { lado: -1 }); K.etiqueta(ctx, a, 'hardest challenge in the world', 1420, 940, { p0: 0.45, size: 38 }); },
  // 9 — $1,000 al día = más de 2.700 años: tú envejeces en una línea temporal
  9: (ctx, a, K) => { const { YOU } = cast(K);
    sky(ctx, '#ffe9c4', '#ffd2a0'); suelo(ctx, 860, '#e8cf8f', '#c9ad6a');
    const k = K.clamp(fase(a) / 0.8);
    ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(120, 380); ctx.lineTo(1800, 380); ctx.stroke();
    const eras = ['TODAY', 'YEAR 500', 'YEAR 1000', 'YEAR 1500', 'YEAR 2000', 'YEAR 2740'];
    eras.forEach((e, i) => { const x = 160 + i * 320; K.C(ctx, x, 380, 16, i / 5 <= k ? '#4dff88' : '#fff', 6); K.text(ctx, e, x, 330, { size: 34, color: INK }); });
    const x = 160 + k * 1600; K.prop(ctx, 'dinero_billete', x, 360, 0.25, a.t);
    const y = D(K, ctx, a, YOU, 480, 990, 1.15, { pose: 'sostiene', mira: 1, mood: 'feliz' }); billete(K, ctx, y.manoD[0] + 30, y.manoD[1], 1, 0.2);
    ctx.save(); ctx.globalAlpha = K.clamp((fase(a) - 0.5) / 0.2); K.prop(ctx, 'calavera', 1450, 980, 0.55, a.t); K.prop(ctx, 'reloj_arena', 1150, 990, 0.45, a.t); ctx.restore();
    K.contador(ctx, a, '$1,000 / DAY', 400, 80, { icono: 'dinero', size: 36 }); K.text(ctx, '2,700+ YEARS', 1350, 600, { size: 96, color: '#c1121f', k: K.clamp((fase(a) - 0.55) / 0.1) });
    K.luz(ctx, a, { tono: 'dia', foco: [900, 500] }); },
  // 10 — Un millón de segundos vs mil millones: dos relojes de arena y dos personajes
  10: (ctx, a, K) => { const { YOU, PRIYA } = cast(K);
    K.paneles(ctx, a, [
      (c, { w }) => { K.interior(c, a, { W: w, H, tipo: 'dormitorio', hora: 'dia' }); c.save(); c.translate(w / 2, 650); K.prop(c, 'reloj_arena', 0, 0, 0.9, a.t); c.restore();
        D(K, c, a, YOU, w * 0.25, 1000, 1.0, { pose: 'senala', mira: 1, mood: 'feliz' }); K.rotulo(c, a, '1 MILLION SECONDS', w / 2, 70, { size: 38 }); K.text(c, '≈ 11 DAYS', w / 2, 780, { size: 90, color: '#2d6b35' }); K.luz(c, a, { W: w, H, tono: 'dia', foco: [w / 2, 500] }); },
      (c, { w }) => { K.interior(c, a, { W: w, H, tipo: 'aula', hora: 'dia' }); c.save(); c.translate(w / 2, 700); K.prop(c, 'reloj_arena', 0, 0, 1.4, a.t); c.restore();
        const p = D(K, c, a, PRIYA, w * 0.8, 1000, 1.0, { pose: 'miedo', mira: -1, mood: 'sorpresa' }); K.simbolo(c, a, p.cabeza, p.hr, '!', 0.35);
        K.rotulo(c, a, '1 BILLION SECONDS', w / 2, 70, { size: 38 }); K.text(c, '31+ YEARS', w / 2, 860, { size: 100, color: '#c1121f', k: K.clamp((fase(a) - 0.35) / 0.1) }); K.luz(c, a, { W: w, H, tono: 'interior', foco: [w / 2, 500] }); },
    ], { W, H, paso: 0.25 }); },
  // 11 — Firmas los papeles y el marcador del despacho se enciende
  11: (ctx, a, K) => { const { YOU, LAW } = cast(K);
    const on = fase(a) > 0.45; const gy = despacho(K, ctx, a, on ? 1000000000 : '', { mw: 700 });
    if (on) K.radial(ctx, W / 2, 150, 600, '#4dff88', 0.35);
    D(K, ctx, a, LAW, 1250, gy - 10, 1.15, { pose: 'aplaude', mira: -1, mood: 'neutral' });
    const y = D(K, ctx, a, YOU, 700, gy + 10, 1.2, { pose: 'sostiene', mira: 1, mood: 'feliz' });
    escritorio(K, ctx, W / 2, 800, 1300); K.R(ctx, 780, 760, 300, 40, 4, '#fdf6e3', 5);
    ctx.save(); const pk = K.clamp(fase(a) / 0.4); ctx.translate(820 + pk * 200 + Math.sin(a.t * 20) * 8 * (pk < 1), 760); ctx.rotate(0.6); K.R(ctx, -8, -90, 16, 90, 4, '#1b1530', 4); ctx.restore();
    if (on) { K.flash(ctx, a.t, 0.45 * (a.d || 4), 0.2); K.contador(ctx, a, 'DAY 1 · START', W / 2, 330, { icono: 'reloj', size: 40, col: '#c1121f', p0: 0.5 }); }
    K.luz(ctx, a, { tono: 'atardecer', foco: [W / 2, 300] }); },
});

// ===================== CAPÍTULO 2 · THE SPENDING SPREE =====================
Object.assign(A, {
  // 12 — Día 1: mansión de $10M con piscina y cine
  12: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { sky(ctx, '#7cc8ff', '#d8f0ff', 700); suelo(ctx, 700, '#6bcb77', '#3f9150');
      mansion(K, ctx, 960, 700, 0.95); piscina(K, ctx, 300, 760, 640, 160, a.t);
      palmera(K, ctx, 1650, 760, 1.1, a.t); palmera(K, ctx, 130, 760, 0.9, a.t);
      K.cartel(ctx, a, 'SOLD!', 1500, 820, { tipo: 'rojo', size: 60, p0: 0.25 });
      D(K, ctx, a, YOU, 1150, 1020, 1.15, { pose: 'vitorea', mira: -1, mood: 'risa' }); }, { de: 1.0, a: 1.08, foco: [960, 500] });
    K.luz(ctx, a, { tono: 'dia', foco: [960, 400] }); dia(K, ctx, a, 1); saldo(K, ctx, a, -10000000, 1680, 70, '#c1121f'); K.etiqueta(ctx, a, 'private movie theater', 1500, 300, { p0: 0.45, cx: 1180, cy: 380 }); },
  // 13 — Concesionario: Bugatti azul y luego uno rojo
  13: (ctx, a, K) => { const { YOU, LAW } = cast(K);
    sky(ctx, '#eef2fa', '#d6dcec', 860); for (let i = 0; i < 5; i++) K.R(ctx, 80 + i * 380, 120, 300, 520, 10, '#cfe6ff', 7); suelo(ctx, 860, '#c9ccd6', '#9aa0b4');
    ctx.save(); ctx.globalAlpha = 0.18; ctx.translate(0, 1720); ctx.scale(1, -1); coche(K, ctx, 620, 860, 1.0, '#1f6fff'); ctx.restore();
    coche(K, ctx, 620, 860, 1.0, '#1f6fff'); const k = K.clamp((fase(a) - 0.35) / 0.25); coche(K, ctx, lerpN(2400, 1400, sm(k)), 870, 1.0, '#e63946', a.t, -k * 6);
    const y = D(K, ctx, a, YOU, 980, 1050, 1.05, { pose: 'senala', mira: 1, mood: 'feliz', habla: true });
    K.globo(ctx, a, 'And a red one. Just because.', 1050, 240, { tx: y.cabeza[0] + 50, ty: y.cabeza[1] - 50, p0: 0.4, size: 42 });
    K.etiqueta(ctx, a, '$3,000,000', 620, 560, { p0: 0.1 }); K.luz(ctx, a, { tono: 'interior', foco: [960, 400] }); dia(K, ctx, a, 1); },
  // 14 — Cinco superdeportivos y el gerente llorando de alegría
  14: (ctx, a, K) => { const { YOU } = cast(K);
    const [ger] = K.reparto('gerente-27', 1, [{ estilo: 'gordito', pelo: 'raya', corbata: '#ffd93d', ropa: '#3a5a8a', sombrero: null, barba: false, bigote: true }]);
    sky(ctx, '#ffd9a0', '#ff9a6a', 800); suelo(ctx, 800, '#5d5d6e', '#3a3d4c'); for (let i = 0; i < 6; i++) K.R(ctx, i * 340 + 100, 900, 160, 14, 0, '#fff', 0);
    ['#ffd93d', '#6bcb77', '#e63946', '#1f6fff', '#b07cff'].forEach((c, i) => coche(K, ctx, 200 + i * 380, 790 + (i % 2) * 20, 0.55, c));
    const g = D(K, ctx, a, ger, 1350, 1060, 1.25, { pose: 'llora', mira: -1, mood: 'risa' });
    for (let i = 0; i < 6; i++) K.C(ctx, g.cabeza[0] + (i % 2 ? 40 : -40) + Math.sin(i) * 6, g.cabeza[1] + 30 + ((a.t * 300 + i * 60) % 200), 9, '#7cd3ff', 3);
    D(K, ctx, a, YOU, 620, 1060, 1.25, { pose: 'saluda', mira: 1, mood: 'feliz' });
    K.globo(ctx, a, 'Best. Day. EVER.', 1650, 300, { tx: g.cabeza[0] + 60, ty: g.cabeza[1] - 60, p0: 0.25 }); K.luz(ctx, a, { tono: 'atardecer', foco: [960, 500] });
    saldo(K, ctx, a, -15000000, 1680, 70, '#c1121f'); K.contador(ctx, a, '11:42 AM', 160, 70, { icono: 'reloj', size: 34 }); },
  // 15 — Jet privado VIVIAN en el hangar
  15: (ctx, a, K) => { const { YOU, LAW } = cast(K);
    sky(ctx, '#7cc8ff', '#ffe9c4', 820); suelo(ctx, 820, '#7a7f93', '#4a4f63');
    ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 10; ctx.fillStyle = '#c9ccd6'; ctx.beginPath(); ctx.moveTo(0, 820); ctx.lineTo(0, 240); ctx.quadraticCurveTo(W / 2, -80, W, 240); ctx.lineTo(W, 820); ctx.lineTo(W - 120, 820); ctx.lineTo(W - 120, 300); ctx.quadraticCurveTo(W / 2, 40, 120, 300); ctx.lineTo(120, 820); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
    avion(K, ctx, 1000, 660 - Math.sin(a.t) * 4, 1.3, 0, fase(a) > 0.35 ? 'VIVIAN' : '');
    const y = D(K, ctx, a, YOU, 450, 1030, 1.1, { pose: 'senala', mira: 1, mood: 'feliz', habla: true });
    K.globo(ctx, a, 'I name her... VIVIAN.', 560, 300, { tx: y.cabeza[0] + 40, ty: y.cabeza[1] - 60, p0: 0.25 });
    K.etiqueta(ctx, a, '~$12,000,000', 1500, 360, { p0: 0.1 }); K.luz(ctx, a, { tono: 'dia', foco: [1000, 600] }); dia(K, ctx, a, 1); },
  // 16 — Dentro del jet: champán a 35.000 pies
  16: (ctx, a, K) => { const { YOU } = cast(K);
    sky(ctx, '#e8dcc8', '#cdbb9e'); for (let i = 0; i < 3; i++) { const x = 260 + i * 560; K.R(ctx, x, 200, 260, 340, 130, '#3a3d4c', 9); ctx.save(); ctx.beginPath(); ctx.roundRect(x + 20, 220, 220, 300, 110); ctx.clip(); sky(ctx, '#4d96ff', '#bfe6ff'); for (let j = 0; j < 4; j++) K.E(ctx, x + ((j * 90 + a.t * 60) % 300) - 20, 420 + j * 20, 60, 20, '#fff', 0, 0); ctx.restore(); }
    K.R(ctx, 0, 760, W, 320, 0, '#6b4429', 0); K.R(ctx, 860, 620, 900, 420, 80, '#8a5a3a', 9); K.R(ctx, 880, 820, 860, 200, 40, '#a0693f', 7);
    const y = D(K, ctx, a, YOU, 1300, 1060, 1.35, { pose: 'sentado', mira: -1, mood: 'feliz' });
    ctx.save(); ctx.translate(y.manoI ? y.manoI[0] : 1200, y.manoI ? y.manoI[1] : 800); K.P(ctx, [[-22, -70], [22, -70], [6, -10], [-6, -10]], '#fff3b0', 5); K.R(ctx, -4, -10, 8, 40, 2, '#fff', 3); ctx.restore();
    K.sparkles(ctx, 1180, 700, a.t, 8, 120);
    K.contador(ctx, a, '35,000 FT', 200, 70, { icono: null, size: 36 }); K.globo(ctx, a, 'This is the life.', 760, 640, { tx: y.cabeza[0] - 60, ty: y.cabeza[1], p0: 0.35 });
    K.luz(ctx, a, { tono: 'interior', foco: [1300, 600] }); },
  // 17 — Esa noche: marcador en el despacho, $30M menos
  17: (ctx, a, K) => { const { YOU, LAW } = cast(K);
    const v = lerpN(1000000000, 970000000, sm(K.clamp(fase(a) / 0.6))); const gy = despacho(K, ctx, a, v, { hora: 'noche', mw: 820 });
    const items = ['MANSION −$10M', 'CARS −$15M', 'JET −$12M']; items.forEach((s, i) => K.etiqueta(ctx, a, s, 400 + i * 560, 400, { p0: 0.1 + i * 0.12, rot: -0.1 + i * 0.1, size: 40 }));
    D(K, ctx, a, LAW, 1450, gy, 1.1, { pose: 'brazos', mira: -1, mood: 'neutral' }); D(K, ctx, a, YOU, 560, gy + 20, 1.2, { pose: 'vitorea', mira: 1, mood: 'feliz' });
    K.luz(ctx, a, { tono: 'noche', foco: [W / 2, 300] }); dia(K, ctx, a, 1); },
  // 18 — 3% gastado, 97% sigue ahí: un tarro gigante de billetes casi lleno
  18: (ctx, a, K) => { const { YOU } = cast(K);
    sky(ctx, '#fdf3dc', '#f4e3bd'); suelo(ctx, 900, '#d9a066', '#b07a44');
    const k = K.clamp(fase(a) / 0.4);
    K.R(ctx, 760, 140, 560, 760, 80, 'rgba(191,230,255,0.45)', 10); ctx.save(); ctx.beginPath(); ctx.roundRect(770, 150, 540, 740, 74); ctx.clip(); const top = 150 + 740 * 0.03 * k; K.R(ctx, 770, top, 540, 900, 0, '#8fd694', 0); for (let i = 0; i < 60; i++) billete(K, ctx, 800 + (i * 97) % 480, top + 30 + Math.floor(i / 5) * 60, 0.6, (i % 7) * 0.3); ctx.restore();
    K.R(ctx, 740, 110, 600, 60, 20, '#c9ccd6', 8);
    K.text(ctx, '97%', 1040, 560, { size: 160, color: '#fff' }); K.text(ctx, '3% spent', 1560, 220, { size: 64, color: '#c1121f', rot: 0.08 });
    ctx.strokeStyle = '#c1121f'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(1450, 250); ctx.lineTo(1320, 172); ctx.stroke();
    const y = D(K, ctx, a, YOU, 450, 1010, 1.2, { pose: 'encoge', mira: 1, mood: 'duda' }); K.simbolo(ctx, a, y.cabeza, y.hr, '?', 0.4);
    K.luz(ctx, a, { tono: 'interior', foco: [1040, 500] }); },
  // 19 — Te miras al espejo de estrella de cine; el marcador casi no se movió
  19: (ctx, a, K) => { const { YOU } = cast(K);
    K.interior(ctx, a, { tipo: 'dormitorio', hora: 'noche' });
    K.R(ctx, 1080, 160, 520, 640, 20, '#e9c46a', 10); K.R(ctx, 1110, 190, 460, 580, 10, '#cfe6ff', 6); for (let i = 0; i < 8; i++) K.C(ctx, 1100 + (i % 4) * 160, i < 4 ? 170 : 790, 18, '#fff7c2', 4);
    ctx.save(); ctx.beginPath(); ctx.rect(1110, 190, 460, 580); ctx.clip(); D(K, ctx, a, YOU, 1340, 1060, 1.35, { pose: 'quieto', mira: -1, mood: 'duda' }); ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(1110, 190, 460, 580); ctx.restore();
    const y = D(K, ctx, a, YOU, 700, 1060, 1.35, { pose: 'quieto', mira: 1, mood: 'duda', espalda: true });
    ctx.save(); ctx.translate(y.cabeza[0], y.cabeza[1] - y.hr * 0.9); K.P(ctx, [[-50, 0], [50, 0], [40, -40], [0, -10], [-40, -40]], '#ffd93d', 5); ctx.restore();
    marcador(K, ctx, a, 970000000, 520, 160, { w: 620, size: 62 }); K.etiqueta(ctx, a, 'barely moved', 520, 300, { p0: 0.35 });
    K.text(ctx, 'LESSON #1', 1340, 900, { size: 70, color: '#ffd93d', k: K.clamp((fase(a) - 0.55) / 0.1) }); K.luz(ctx, a, { tono: 'noche', foco: [1340, 480] }); },
  // 20 — Día 3: ropa, relojes, primera fila, cena para todo un restaurante
  20: (ctx, a, K) => { const { YOU } = cast(K);
    const { gy } = SET.cafeteria(ctx, a.t, { hora: 'atardecer' });
    K.multitud(ctx, a, { n: 9, x0: 140, x1: 1780, gy: gy - 20, esc: 0.7, filas: 2, reaccion: 'vitorea', seed: 'resto27' });
    const y = D(K, ctx, a, YOU, 960, gy + 40, 1.25, { pose: 'vitorea', mira: 0, mood: 'risa' });
    ctx.save(); ctx.translate(y.cabeza[0], y.cabeza[1] + y.hr * 2.6); for (let i = 0; i < 2; i++) { K.C(ctx, -60 + i * 120, 0, 18, '#ffd93d', 4); } ctx.restore();
    K.globo(ctx, a, 'Dinner is on ME!', 1350, 250, { tx: y.cabeza[0] + 50, ty: y.cabeza[1] - 60, p0: 0.15 });
    ['DESIGNER CLOTHES', 'DIAMOND WATCHES', 'FRONT ROW SEATS'].forEach((s, i) => K.etiqueta(ctx, a, s, 320, 260 + i * 110, { p0: 0.3 + i * 0.1, size: 34, rot: -0.08 }));
    K.luz(ctx, a, { tono: 'atardecer', foco: [960, 500] }); dia(K, ctx, a, 3); },
  // 21 — Día 5: las noticias hablan del heredero misterioso
  21: (ctx, a, K) => { const { YOU, LAW } = cast(K);
    const [pres] = K.reparto('presentadora-27', 1, [{ estilo: 'limpio', pelo: 'melena', peloCol: '#d9a35b', ropa: '#e63946', sombrero: null, corbata: null, barba: false, bigote: false }]);
    const { gy } = SET.noticias(ctx, a.t);
    K.R(ctx, 0, 820, W, 260, 0, '#2a2440', 9); const p = D(K, ctx, a, pres, 760, 900, 1.1, { pose: 'habla', mira: 1, mood: 'sorpresa', habla: true });
    K.R(ctx, 1080, 300, 640, 420, 14, '#0e1024', 9); ctx.save(); ctx.beginPath(); ctx.rect(1100, 320, 600, 380); ctx.clip(); sky(ctx, '#3b5bdb', '#1a2a6a'); D(K, ctx, a, YOU, 1400, 900, 1.2, { pose: 'quieto', mood: 'neutral', alpha: 1 }); ctx.fillStyle = 'rgba(0,0,0,0.85)'; ctx.fillRect(1330, 420, 140, 50); ctx.restore();
    K.R(ctx, 0, 940, W, 110, 0, '#c1121f', 0); ctx.fillStyle = '#fff'; ctx.font = '900 58px Anton'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('BREAKING: WHO IS THE MYSTERY HEIR?', 60 - ((a.t * 120) % 400), 996);
    ['YACHT', 'PENTHOUSE', 'STADIUM SUITE'].forEach((s, i) => K.cartel(ctx, a, s, 300 + i * 0, 200 + i * 150, { tipo: 'amarillo', size: 40, p0: 0.2 + i * 0.12, rot: -0.05 }));
    K.luz(ctx, a, { tono: 'interior', foco: [1100, 500] }); dia(K, ctx, a, 5, 170, 60); K.contador(ctx, a, 'LIVE', 1800, 60, { icono: 'rec', size: 30 }); },
  // 22 — El móvil vibra: tres amigos, chat de grupo, en el ático
  22: (ctx, a, K) => { const { YOU, MAYA, DEON, PRIYA } = cast(K);
    const { gy } = SET.atico(ctx, a.t);
    const y = D(K, ctx, a, YOU, 560, gy, 1.2, { pose: 'sostiene', mira: 1, mood: 'sorpresa' });
    const sh = Math.sin(a.t * 40) * 6;
    movil(K, ctx, 1260 + sh, 520, 1.15, (c) => { c.fillStyle = '#4d96ff'; c.fillRect(-148, -300, 296, 70); c.fillStyle = '#fff'; c.font = '800 26px Poppins'; c.textAlign = 'center'; c.fillText('OLD FRIENDS (3)', 0, -255);
      [[MAYA, 'Saw the news!! 😳', '#ffe1e1'], [DEON, 'DINNER. TONIGHT.', '#fff4c2'], [PRIYA, 'I have a plan.', '#efe3ff']].forEach(([p, t, col], i) => { if (fase(a) < 0.15 + i * 0.15) return; const yy = -180 + i * 150; c.fillStyle = col; c.beginPath(); c.roundRect(-90, yy - 40, 230, 80, 18); c.fill(); c.fillStyle = INK; c.font = '700 22px Poppins'; c.textAlign = 'left'; c.fillText(t, -80, yy + 8); K.dibuja(c, p, -115, yy + 150, 0.22, { t: a.t, pose: 'quieto', mood: 'feliz' }); }); });
    for (let i = 0; i < 3; i++) { ctx.strokeStyle = '#ffd93d'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(1260, 520, 380 + i * 30 + (a.t * 60 % 30), -0.4, 0.4); ctx.stroke(); }
    K.luz(ctx, a, { tono: 'noche', foco: [1100, 500] }); K.simbolo(ctx, a, y.cabeza, y.hr, '!', 0.1); },
});

// ===================== CAPÍTULO 3 · THREE FRIENDS, THREE PLANS =====================
Object.assign(A, {
  // 23 — Día 7: restaurante en la azotea, presentación de los tres amigos
  23: (ctx, a, K) => { const { YOU, MAYA, DEON, PRIYA } = cast(K);
    K.ciudad(ctx, a, { hora: 'atardecer', suelo: 0.75 }); suelo(ctx, 820, '#5a4a6a', '#3a2f4a');
    for (let i = 0; i < 9; i++) { const x = i * 240 + 40; ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, 120); ctx.quadraticCurveTo(x + 120, 170, x + 240, 120); ctx.stroke(); K.C(ctx, x + 120, 160, 12, '#ffe27a', 3); }
    K.mesa(ctx, W / 2, 1000, 900, { alto: 170 });
    K.fila(ctx, a, [MAYA, DEON, PRIYA], { x0: 520, x1: 1400, gy: 980, esc: 1.0, nombres: ['MAYA · CHEF', 'DEON · SPORTS FAN', 'PRIYA · ENGINEER'], moods: ['feliz', 'risa', 'duda'], mira: 'centro', paso: 0.12 });
    K.luz(ctx, a, { tono: 'atardecer', foco: [960, 500] }); dia(K, ctx, a, 7); K.hombro(ctx, a, YOU, { lado: 1 }); },
  // 24 — Maya: imperio de food trucks
  24: (ctx, a, K) => { const { MAYA, YOU } = cast(K);
    K.calle(ctx, a, { hora: 'dia' });
    const k = K.clamp(fase(a) / 0.6); for (let i = 0; i < 6; i++) { if (i / 6 > k) break; camion(K, ctx, 1900 - i * 260, 760 - i * 30, 0.45 - i * 0.03, ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#b07cff', '#ff9a3d'][i], ['TACOS', 'PIZZA', 'BBQ', 'SUSHI', 'PHO', 'BURGER'][i]); }
    const m = D(K, ctx, a, { ...MAYA, sombrero: 'cocinero' }, 640, 1000, 1.25, { pose: 'senala', mira: 1, mood: 'feliz', habla: true });
    K.globo(ctx, a, 'A thousand trucks. Coast to coast!', 680, 280, { tx: m.cabeza[0] + 40, ty: m.cabeza[1] - 60, p0: 0.15 });
    K.text(ctx, '×1,000', 1450, 300, { size: 110, color: '#c1121f', k: K.clamp((fase(a) - 0.5) / 0.1) }); K.luz(ctx, a, { tono: 'dia', foco: [1000, 500] }); K.rotulo(ctx, a, 'MAYA', 640, 1040); },
  // 25 — Las hojas de cálculo de Maya: $40M, una gota en el cubo
  25: (ctx, a, K) => { const { MAYA, YOU } = cast(K);
    K.interior(ctx, a, { tipo: 'restaurante', hora: 'noche' });
    K.R(ctx, 700, 160, 720, 520, 12, '#ffffff', 9); for (let r = 0; r < 7; r++) for (let c = 0; c < 4; c++) K.R(ctx, 720 + c * 172, 180 + r * 70, 168, 66, 0, r === 0 ? '#6bcb77' : '#f4f6fb', 3);
    ctx.fillStyle = INK; ctx.font = '700 28px Poppins'; ctx.textAlign = 'center'; ['TRUCKS', 'COST', 'CITIES', 'PROFIT'].forEach((s, c) => ctx.fillText(s, 804 + c * 172, 222)); ctx.font = '900 40px Anton'; ctx.fillStyle = '#c1121f'; ctx.fillText('TOTAL: $40,000,000', 1060, 650);
    const m = D(K, ctx, a, MAYA, 450, 1020, 1.25, { pose: 'senala', mira: 1, mood: 'feliz', habla: true });
    ctx.save(); ctx.translate(1660, 940); K.R(ctx, -150, -260, 300, 260, 30, '#9aa0b4', 9); K.E(ctx, 0, -260, 150, 30, '#3fc1ff', 0, 7); ctx.restore();
    const dk = K.clamp((fase(a) - 0.45) / 0.3); K.C(ctx, 1660, lerpN(420, 680, dk * dk), 22, '#3fc1ff', 5);
    K.etiqueta(ctx, a, 'a drop in your bucket', 1650, 500, { p0: 0.6 }); K.luz(ctx, a, { tono: 'interior', foco: [1060, 400] }); K.hombro(ctx, a, YOU, { lado: 1, esc: 0.9 }); },
  // 26 — Deon ríe y niega: quiere un estadio nuevo (bocadillo de pensamiento)
  26: (ctx, a, K) => { const { DEON, MAYA } = cast(K);
    K.interior(ctx, a, { tipo: 'restaurante', hora: 'noche' });
    const d = D(K, ctx, a, DEON, 760, 1060, 1.5, { pose: 'brazos', mira: 1, mood: 'risa', habla: true, giro: Math.sin(a.t * 6) * 0.3 });
    K.desenfocado(ctx, 4, (c) => D(K, c, a, MAYA, 260, 1040, 1.2, { pose: 'quieto', mira: 1, mood: 'duda' }));
    const k = K.clamp((fase(a) - 0.25) / 0.2); if (k > 0) { ctx.save(); ctx.globalAlpha = k; for (let i = 0; i < 3; i++) K.C(ctx, d.cabeza[0] + 120 + i * 60, d.cabeza[1] - 80 - i * 50, 14 + i * 8, '#fff', 5); K.E(ctx, 1400, 330, 420, 260, '#fff', 0, 8); ctx.save(); ctx.beginPath(); ctx.ellipse(1400, 330, 400, 240, 0, 0, 7); ctx.clip(); sky(ctx, '#7cc8ff', '#d8f0ff'); estadio(K, ctx, 1400, 560, 0.55, a.t); ctx.restore(); ctx.restore(); }
    K.text(ctx, 'BIGGER.', 1400, 680, { size: 80, color: '#ffd93d', k: K.clamp((fase(a) - 0.5) / 0.1) }); K.luz(ctx, a, { tono: 'interior', foco: [900, 450] }); K.rotulo(ctx, a, 'DEON', 760, 1040); },
});

Object.assign(A, {
  // 27 — SoFi costó unos $5.000 millones: estadio de noche con marcador de precio
  27: (ctx, a, K) => { const { DEON, YOU } = cast(K);
    sky(ctx, '#0b1030', '#2a2f66', 820); for (let i = 0; i < 50; i++) K.C(ctx, (i * 389) % W, (i * 173) % 400, 2, '#fff', 0); suelo(ctx, 820, '#2b3a2e', '#18221a');
    K.radial(ctx, 960, 500, 900, '#fffac8', 0.25); estadio(K, ctx, 960, 900, 1.25, a.t);
    const v = lerpN(0, 5000000000, sm(K.clamp(fase(a) / 0.6))); marcador(K, ctx, a, v, 960, 150, { w: 900, size: 90, col: '#ffd93d' });
    const d = D(K, ctx, a, DEON, 1580, 1070, 1.15, { pose: 'vitorea', mira: -1, mood: 'risa' }); D(K, ctx, a, YOU, 330, 1070, 1.1, { pose: 'miedo', mira: 1, mood: 'sorpresa' });
    K.etiqueta(ctx, a, 'SoFi Stadium, L.A. ≈ $5B', 960, 330, { p0: 0.55, size: 40 }); K.luz(ctx, a, { tono: 'noche', foco: [960, 500], r: 900 }); },
  // 28 — Priya se inclina: plano de hombro sobre Deon, ella con el cohete en el móvil
  28: (ctx, a, K) => { const { PRIYA, DEON } = cast(K);
    K.camara(ctx, a, () => { K.interior(ctx, a, { tipo: 'restaurante', hora: 'noche' });
      const p = D(K, ctx, a, PRIYA, 1100, lerpN(1180, 1140, sm(K.clamp(fase(a) / 0.3))), 1.75, { pose: 'senala', mira: -1, mood: 'feliz', habla: true });
      ctx.save(); ctx.translate(1500, 420); K.R(ctx, -150, -200, 300, 400, 20, '#0e1024', 8); ctx.beginPath(); ctx.rect(-130, -180, 260, 360); ctx.clip(); sky(ctx, '#0b1030', '#3b2a6a'); ctx.translate(0, 160 - K.clamp(fase(a) / 0.8) * 180); K.prop(ctx, 'cohete', 0, 0, 0.5, a.t); ctx.restore();
      K.globo(ctx, a, 'Our own rocket company.', 600, 240, { tx: p.cabeza[0] - 60, ty: p.cabeza[1] - 40, p0: 0.2 }); }, { de: 1, a: 1.1, foco: [1100, 450] });
    K.luz(ctx, a, { tono: 'interior', foco: [1150, 400] }); K.hombro(ctx, a, DEON, { lado: -1 }); K.rotulo(ctx, a, 'PRIYA · ENGINEER', 1150, 1030); },
  // 29 — Lanzamiento: el cohete despega y se traga cientos de millones
  29: (ctx, a, K) => { const { PRIYA, YOU } = cast(K);
    const k = K.clamp((fase(a) - 0.15) / 0.7), sh = k > 0 && k < 1 ? Math.sin(a.t * 50) * 6 : 0;
    ctx.save(); ctx.translate(sh, 0); sky(ctx, '#ff9a6a', '#ffd9a0', 860); suelo(ctx, 860, '#c9ad6a', '#a08a50');
    K.R(ctx, 1080, 260, 50, 600, 4, '#9aa0b4', 7); const ry = 860 - k * k * 900;
    if (k > 0) K.smoke(ctx, 960, 860, a.t, 10); ctx.save(); ctx.translate(960, ry); K.prop(ctx, 'cohete', 0, 0, 1.1, a.t); ctx.restore();
    if (k > 0) { ctx.save(); ctx.translate(960, ry + 10); K.prop(ctx, 'fuego', 0, 100, 0.5 + Math.sin(a.t * 20) * 0.05, a.t, Math.PI); ctx.restore(); }
    for (let i = 0; i < 12; i++) billete(K, ctx, 960 + Math.sin(i * 7) * 200 * k, ry + 300 + i * 30 * k, 0.6, i);
    D(K, ctx, a, PRIYA, 400, 1040, 1.1, { pose: 'vitorea', mira: 1, mood: 'risa' }); D(K, ctx, a, YOU, 1550, 1040, 1.1, { pose: 'miedo', mira: -1, mood: 'sorpresa' }); ctx.restore();
    K.contador(ctx, a, '−$300,000,000', 1640, 70, { icono: 'dinero', size: 34, col: '#c1121f', p0: 0.4 }); K.luz(ctx, a, { tono: 'atardecer', foco: [960, 500] }); K.etiqueta(ctx, a, '...to SPACE?', 1500, 330, { p0: 0.6 }); },
  // 30 — Asientes a los tres; algo te inquieta (primer plano, amigos desenfocados)
  30: (ctx, a, K) => { const { YOU, MAYA, DEON, PRIYA } = cast(K);
    K.interior(ctx, a, { tipo: 'restaurante', hora: 'noche' });
    K.desenfocado(ctx, 6, (c) => { D(K, c, a, MAYA, 260, 1000, 1.0, { pose: 'habla', mira: 1, mood: 'feliz', habla: true }); D(K, c, a, DEON, 1550, 1000, 1.05, { pose: 'aplaude', mira: -1, mood: 'risa' }); D(K, c, a, PRIYA, 1780, 1000, 1.0, { pose: 'senala', mira: -1, mood: 'feliz' }); });
    const y = D(K, ctx, a, YOU, 930, 1350, 2.2, { pose: fase(a) < 0.5 ? 'quieto' : 'piensa', mira: 0, mood: fase(a) < 0.5 ? 'feliz' : 'duda' });
    if (fase(a) > 0.5) K.simbolo(ctx, a, y.cabeza, y.hr, '?', 0.5);
    K.luz(ctx, a, { tono: 'interior', foco: [930, 500], vineta: 0.7 }); K.etiqueta(ctx, a, 'something nags...', 1450, 230, { p0: 0.55 }); },
  // 31 — Mencionas un hospital: "Boring." y todos se ríen
  31: (ctx, a, K) => { const { YOU, MAYA, DEON, PRIYA } = cast(K);
    K.ciudad(ctx, a, { hora: 'noche', suelo: 0.75 }); suelo(ctx, 820, '#5a4a6a', '#3a2f4a'); K.mesa(ctx, W / 2, 1020, 1100, { alto: 160 });
    const y = D(K, ctx, a, YOU, 420, 1000, 1.05, { pose: 'habla', mira: 1, mood: fase(a) > 0.6 ? 'risa' : 'neutral', habla: fase(a) < 0.3 });
    K.globo(ctx, a, '...a hospital?', 380, 330, { tx: y.cabeza[0], ty: y.cabeza[1] - 60, p0: 0.03, size: 36 });
    const d = D(K, ctx, a, DEON, 1000, 990, 1.1, { pose: 'encoge', mira: -1, mood: 'risa', habla: true }); K.globo(ctx, a, 'Boring.', 1050, 300, { tx: d.cabeza[0], ty: d.cabeza[1] - 60, p0: 0.3, size: 64 });
    D(K, ctx, a, MAYA, 1400, 990, 1.0, { pose: 'aplaude', mira: -1, mood: 'risa' }); D(K, ctx, a, PRIYA, 1650, 990, 1.0, { pose: 'aplaude', mira: -1, mood: 'risa' });
    for (let i = 0; i < 4; i++) K.text(ctx, 'HA', 1300 + i * 120, 380 + Math.sin(a.t * 9 + i) * 15, { size: 52, color: '#ffd93d', k: K.clamp((fase(a) - 0.45 - i * 0.04) / 0.08), rot: -0.2 + i * 0.13 });
    K.luz(ctx, a, { tono: 'noche', foco: [960, 500] }); },
  // 32 — Repartes el dinero en tres pilas: trucks, estadio, cohete
  32: (ctx, a, K) => { const { YOU, MAYA, DEON, PRIYA } = cast(K);
    K.interior(ctx, a, { tipo: 'oficina', hora: 'dia' }); K.mesa(ctx, W / 2, 1060, 1500, { alto: 220, mantel: '#2f6b3a' });
    const k = K.clamp(fase(a) / 0.5);
    [[MAYA, 420, 'FOOD TRUCKS', 'camion'], [DEON, 960, 'STADIUM DEAL', 'estadio'], [PRIYA, 1500, 'ROCKETS', 'cohete']].forEach(([p, x, lab, ic], i) => {
      D(K, ctx, a, p, x, 830, 0.85, { pose: 'vitorea', mira: 0, mood: 'feliz' }); fajo(K, ctx, lerpN(960, x, sm(k)), 830, 1.0, 3 + i); K.cartel(ctx, a, lab, x, 220, { tipo: 'verde', size: 40, p0: 0.3 + i * 0.1, colgado: true }); });
    K.hombro(ctx, a, YOU, { lado: -1 }); K.luz(ctx, a, { tono: 'interior', foco: [960, 500] }); K.etiqueta(ctx, a, 'Hold that thought.', 1600, 900, { p0: 0.65 }); },
  // 33 — Miras el móvil… y se te cae el estómago (zoom al móvil)
  33: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { K.calle(ctx, a, { hora: 'atardecer' });
      const y = D(K, ctx, a, YOU, 760, 1250, 1.9, { pose: 'sostiene', mira: 1, mood: fase(a) < 0.5 ? 'feliz' : 'miedo' });
      movil(K, ctx, 1250, 560, 0.9, (c) => { c.fillStyle = INK; c.font = '700 26px Poppins'; c.textAlign = 'center'; c.fillText('BALANCE', 0, -160); c.fillStyle = fase(a) < 0.5 ? '#888' : '#2d6b35'; c.font = '900 40px Poppins'; c.fillText(fase(a) < 0.5 ? 'loading…' : '$1,0??,???,???', 0, -90); if (fase(a) > 0.5) { c.fillStyle = '#2d6b35'; c.font = '900 120px Anton'; c.fillText('▲', 0, 90); } }, 0.08);
      if (fase(a) > 0.5) K.mareo(ctx, a, y.cabeza, y.hr); }, { de: 1, a: 1.25, foco: [1100, 500], f0: 0.4, f1: 0.7 });
    K.luz(ctx, a, { tono: 'tension', foco: [1100, 500] }); },
});

// ===================== CAPÍTULO 4 · THE COUNTER GOES UP =====================
Object.assign(A, {
  // 34 — Día 15: compras empresas, una tras otra (rascacielos con letreros SOLD)
  34: (ctx, a, K) => { const { YOU, LAW } = cast(K);
    K.ciudad(ctx, a, { hora: 'dia' });
    ['BURGER CO.', 'SHOE INC.', 'TECH LTD.', 'TOY CORP.'].forEach((n, i) => { const x = 300 + i * 440; K.R(ctx, x - 150, 260 + (i % 2) * 80, 300, 820, 6, ['#ffd0a8', '#cfe6ff', '#d9ffd4', '#f2d4ff'][i], 8); for (let r = 0; r < 8; r++) for (let c = 0; c < 3; c++) K.R(ctx, x - 120 + c * 90, 320 + (i % 2) * 80 + r * 90, 60, 50, 4, '#7cc8ff', 4); K.cartel(ctx, a, n, x, 220 + (i % 2) * 80, { tipo: 'papel', size: 32, p0: 0.05 + i * 0.1 }); sello(K, ctx, a, 'SOLD', x, 600, { p0: 0.15 + i * 0.12, size: 64, col: '#2d6b35' }); });
    D(K, ctx, a, YOU, 960, 1080, 1.0, { pose: 'senala', mira: 1, mood: 'risa' }); K.luz(ctx, a, { tono: 'dia', foco: [960, 500] }); dia(K, ctx, a, 15); },
  // 35 — Te compras un equipo profesional: rueda de prensa con camiseta
  35: (ctx, a, K) => { const { YOU, DEON } = cast(K);
    K.R(ctx, 0, 0, W, H, 0, '#1f3a8a', 0); for (let i = 0; i < 8; i++) for (let j = 0; j < 5; j++) { K.R(ctx, i * 250 + (j % 2) * 125, j * 160 + 20, 230, 140, 10, '#2a4ab0', 0); ctx.fillStyle = '#ffd93d'; ctx.font = '900 30px Anton'; ctx.textAlign = 'center'; ctx.fillText('CURIO FC', i * 250 + (j % 2) * 125 + 115, j * 160 + 100); }
    K.R(ctx, 300, 820, 1320, 260, 10, '#14214f', 9);
    const y = D(K, ctx, a, YOU, 760, 1000, 1.2, { pose: 'levanta', mira: 1, mood: 'risa' });
    ctx.save(); ctx.translate(y.manoD[0], y.manoD[1] - 120); ctx.rotate(0.1); K.P(ctx, [[-110, -100], [-40, -130], [40, -130], [110, -100], [150, -30], [90, 0], [90, 150], [-90, 150], [-90, 0], [-150, -30]], '#ffd93d', 7); ctx.fillStyle = INK; ctx.font = '900 80px Anton'; ctx.textAlign = 'center'; ctx.fillText('1', 0, 90); ctx.restore();
    D(K, ctx, a, DEON, 1250, 1000, 1.15, { pose: 'vitorea', mira: -1, mood: 'risa' });
    for (let i = 0; i < 6; i++) if (Math.sin(a.t * 7 + i * 2) > 0.85) K.radial(ctx, 200 + i * 300, 760, 120, '#ffffff', 0.9);
    K.etiqueta(ctx, a, 'expansion fee ≈ $500,000,000', 1450, 330, { p0: 0.4, size: 38 }); K.luz(ctx, a, { tono: 'interior', foco: [960, 500] }); },
  // 36 — Medio billón en un equipo: te sientes invencible (pose de héroe con capa)
  36: (ctx, a, K) => { const { YOU } = cast(K);
    sky(ctx, '#2a1d4a', '#ff9a6a'); K.radial(ctx, 960, 500, 800, '#ffdc78', 0.5); for (let i = 0; i < 16; i++) { ctx.save(); ctx.translate(960, 520); ctx.rotate(i * Math.PI / 8 + a.t * 0.1); ctx.fillStyle = 'rgba(255,240,180,0.12)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(1400, -120); ctx.lineTo(1400, 120); ctx.fill(); ctx.restore(); }
    for (let i = 0; i < 7; i++) fajo(K, ctx, 960 + (i - 3) * 150, 1000 - Math.abs(i - 3) * 40, 1.3, 7 - Math.abs(i - 3));
    ctx.save(); ctx.translate(960, 640); ctx.rotate(Math.sin(a.t * 3) * 0.05); K.P(ctx, [[-80, -150], [80, -150], [210, 210], [-210, 210]], '#e63946', 8); ctx.restore();
    D(K, ctx, a, YOU, 960, 880, 1.2, { pose: 'vitorea', mira: 0, mood: 'risa' });
    marcador(K, ctx, a, 'FALLING…?', 960, 120, { w: 620, size: 70, col: '#ffd93d' }); K.text(ctx, 'INVINCIBLE', 960, 1010, { size: 90, color: '#ffd93d', k: K.clamp((fase(a) - 0.3) / 0.1) }); K.luz(ctx, a, { tono: 'atardecer', foco: [960, 500] }); },
  // 37 — Isla privada en el Caribe vista desde el aire, con pista
  37: (ctx, a, K) => {
    K.camara(ctx, a, () => { sky(ctx, '#3fc1ff', '#1f8fd6'); for (let i = 0; i < 9; i++) { ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 5; ctx.beginPath(); for (let x = 0; x <= W; x += 40) ctx.lineTo(x, 120 + i * 110 + Math.sin(x / 120 + a.t * 1.5 + i) * 10); ctx.stroke(); }
      isla(K, ctx, 960, 640, 1.5, a.t); K.E(ctx, 1500 + Math.sin(a.t) * 20, 260, 140, 40, 'rgba(255,255,255,0.8)', 0, 0); K.E(ctx, 400, 200, 180, 50, 'rgba(255,255,255,0.8)', 0, 0);
      ctx.save(); ctx.translate(960, 330); const pk = K.clamp(fase(a) / 0.3); ctx.scale(pk, pk); ctx.fillStyle = '#ff3b4e'; ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(0, -60, 50, Math.PI, 0); ctx.lineTo(0, 30); ctx.closePath(); ctx.fill(); ctx.stroke(); K.C(ctx, 0, -60, 18, '#fff', 4); ctx.restore(); }, { de: 1.15, a: 1, foco: [960, 540] });
    K.rotulo(ctx, a, 'PRIVATE ISLAND · CARIBBEAN', 960, 960, { size: 40, p0: 0.2 }); K.etiqueta(ctx, a, 'tens of millions', 1550, 760, { p0: 0.45 }); K.luz(ctx, a, { tono: 'dia', foco: [960, 540] }); },
  // 38 — Paseas descalzo por la arena con un coco; Vivian aparcado detrás
  38: (ctx, a, K) => { const { YOU } = cast(K);
    const { gy } = SET.playa(ctx, a.t, { hora: 'atardecer' }); avion(K, ctx, 1550, 640, 0.55, 0);
    palmera(K, ctx, 200, 1000, 1.6, a.t); palmera(K, ctx, 1800, 1020, 1.4, a.t);
    const w = K.anda(a, 600, 1050, 0, 1); const y = D(K, ctx, a, YOU, w.x, gy, 1.2, { pose: w.pose, mira: 1, mood: 'feliz' });
    K.C(ctx, y.manoD[0] + 10, y.manoD[1] - 20, 42, '#7a4b2a', 7); K.L(ctx, [[y.manoD[0] + 10, y.manoD[1] - 60], [y.manoD[0] + 30, y.manoD[1] - 120]], '#ff6bb5', 4);
    for (let i = 0; i < 6; i++) K.E(ctx, 640 + i * 70, gy + 8 + (i % 2) * 20, 16, 8, 'rgba(120,90,50,0.4)', 0, 0);
    K.globo(ctx, a, 'So THIS is rich.', 1100, 360, { tx: y.cabeza[0] + 40, ty: y.cabeza[1] - 50, p0: 0.35 }); K.luz(ctx, a, { tono: 'atardecer', foco: [900, 450] }); },
  // 39 — El móvil vibra en la hamaca: el saldo SUBIÓ
  39: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { sky(ctx, '#ffb070', '#ffe0b0'); K.R(ctx, 0, 700, W, 380, 0, '#e8cf8f', 0);
      ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(80, 520); ctx.quadraticCurveTo(700, 940, 1300, 520); ctx.stroke(); ctx.fillStyle = '#4d96ff'; ctx.beginPath(); ctx.moveTo(200, 600); ctx.quadraticCurveTo(700, 960, 1200, 600); ctx.quadraticCurveTo(700, 840, 200, 600); ctx.fill(); ctx.stroke();
      const y = D(K, ctx, a, YOU, 640, 900, 1.25, { pose: 'sentado', mira: 1, mood: fase(a) < 0.4 ? 'feliz' : 'sorpresa' });
      const sh = fase(a) < 0.3 ? Math.sin(a.t * 50) * 8 : 0;
      movil(K, ctx, 1450 + sh, 520, 1.1, (c) => { c.fillStyle = '#2d6b35'; c.fillRect(-148, -300, 296, 80); c.fillStyle = '#fff'; c.font = '800 26px Poppins'; c.textAlign = 'center'; c.fillText('MY BANK', 0, -250); c.fillStyle = INK; c.font = '700 24px Poppins'; c.fillText('Available balance', 0, -160);
        const v = lerpN(640000000, 655000000, sm(K.clamp((fase(a) - 0.35) / 0.4))); c.font = '900 34px Poppins'; c.fillStyle = '#2d6b35'; c.fillText($(v), 0, -100); if (fase(a) > 0.5) { c.font = '900 50px Poppins'; c.fillText('+$15M', 0, 0); } c.strokeStyle = '#2d6b35'; c.lineWidth = 6; c.beginPath(); [[-120, 220], [-60, 180], [0, 190], [60, 120], [120, 60]].forEach(([x, yy], i) => (i ? c.lineTo(x, yy) : c.moveTo(x, yy))); c.stroke(); }, 0.06);
      K.simbolo(ctx, a, y.cabeza, y.hr, '?', 0.45); }, { de: 1, a: 1.12, foco: [1300, 500] });
    K.text(ctx, 'IT WENT UP.', 760, 220, { size: 96, color: '#4dff88', k: K.clamp((fase(a) - 0.55) / 0.1) }); K.luz(ctx, a, { tono: 'atardecer', foco: [1300, 500] }); },
  // 40 — El dinero trabaja mientras duermes: billetes con cara trabajando en la fábrica
  40: (ctx, a, K) => { const { YOU } = cast(K);
    sky(ctx, '#1b1530', '#2a2440'); K.R(ctx, 0, 0, 760, H, 0, '#2a2f66', 0); K.R(ctx, 100, 760, 560, 200, 20, '#d9d2e6', 8); K.R(ctx, 80, 700, 120, 120, 20, '#fff', 6);
    D(K, ctx, a, YOU, 400, 900, 1.0, { pose: 'sentado', mira: 1, mood: 'dormido' }); for (let i = 0; i < 3; i++) K.text(ctx, 'z', 520 + i * 40, 520 - i * 50 - (a.t * 30 % 30), { size: 40 + i * 10, color: '#fff' });
    K.R(ctx, 760, 0, 10, H, 0, INK, 0); sky(ctx, '#ffe9c4', '#ffd2a0', 0);
    ctx.save(); ctx.beginPath(); ctx.rect(770, 0, W - 770, H); ctx.clip(); ctx.fillStyle = '#fdf3dc'; ctx.fillRect(770, 0, W, H); K.R(ctx, 780, 760, W, 60, 0, '#5d5d6e', 7);
    for (let i = 0; i < 7; i++) { const x = 800 + ((i * 170 + a.t * 160) % 1200); billete(K, ctx, x, 710, 1.2, 0); K.caraObjeto(ctx, a, x, 712, 22, { mood: 'feliz' }); }
    ['TICKETS', 'PROFIT', 'INTEREST'].forEach((s, i) => K.cartel(ctx, a, s, 1000 + i * 320, 200 + (i % 2) * 70, { tipo: 'amarillo', size: 40, p0: 0.1 + i * 0.12, colgado: true }));
    K.text(ctx, '$ → $$', 1350, 500, { size: 120, color: '#2d6b35', k: K.clamp((fase(a) - 0.4) / 0.1) }); ctx.restore();
    K.luz(ctx, a, { tono: 'interior', foco: [1300, 500] }); },
  // 41 — 5% de interés = $50M al año (pizarra de clase con el profe-abogado)
  41: (ctx, a, K) => { const { LAW, YOU } = cast(K);
    K.interior(ctx, a, { tipo: 'aula', hora: 'dia', texto: ' ' });
    ctx.fillStyle = '#fff'; ctx.font = '800 64px Poppins'; ctx.textAlign = 'center'; const k = K.clamp(fase(a) / 0.5); const l1 = '$1,000,000,000 × 5%'; ctx.fillText(l1.slice(0, Math.round(l1.length * k)), 960, 300);
    if (fase(a) > 0.5) K.text(ctx, '= $50,000,000 / YEAR', 960, 430, { size: 90, color: '#4dff88', k: K.clamp((fase(a) - 0.5) / 0.1) });
    const l = D(K, ctx, a, LAW, 1550, 1000, 1.2, { pose: 'senala', mira: -1, mood: 'neutral', habla: true });
    D(K, ctx, a, YOU, 370, 1040, 1.25, { pose: 'piensa', mira: 1, mood: 'duda' }); K.etiqueta(ctx, a, 'REMEMBER THIS', 400, 500, { p0: 0.2 }); K.luz(ctx, a, { tono: 'interior', foco: [960, 400] }); },
  // 42 — $137.000 al día sin hacer nada: un grifo de dinero que no se cierra
  42: (ctx, a, K) => { const { YOU } = cast(K);
    K.interior(ctx, a, { tipo: 'oficina', hora: 'dia' });
    K.R(ctx, 820, 120, 120, 300, 10, '#c9ccd6', 8); K.R(ctx, 820, 380, 420, 90, 30, '#c9ccd6', 8); K.R(ctx, 1160, 470, 80, 60, 10, '#9aa0b4', 7); K.R(ctx, 880, 60, 200, 60, 20, '#e63946', 7);
    for (let i = 0; i < 10; i++) billete(K, ctx, 1200 + Math.sin(i * 3 + a.t) * 20, 540 + ((a.t * 300 + i * 50) % 500), 0.8, i);
    fajo(K, ctx, 1200, 1060, 2.2, Math.min(9, 2 + Math.floor(fase(a) * 8)));
    const y = D(K, ctx, a, YOU, 600, 1060, 1.3, { pose: 'empuja', mira: 1, mood: 'enfadado', habla: true }); K.globo(ctx, a, "It won't turn OFF!", 420, 340, { tx: y.cabeza[0], ty: y.cabeza[1] - 60, p0: 0.3 });
    K.contador(ctx, a, '+$137,000 / DAY', W / 2, 70, { icono: 'dinero', size: 40, col: '#2d6b35' }); K.luz(ctx, a, { tono: 'interior', foco: [1100, 500] }); },
  // 43 — Un Bugatti extra cada tres semanas, aparece de la nada en tu garaje
  43: (ctx, a, K) => { const { YOU } = cast(K);
    K.R(ctx, 0, 0, W, H, 0, '#3a3d4c', 0); for (let i = 0; i < 6; i++) K.R(ctx, i * 330, 0, 20, 820, 0, '#2a2d3a', 0); suelo(ctx, 820, '#8a8fa6', '#5d6680');
    for (let i = 0; i < 3; i++) { K.radial(ctx, 380 + i * 580, 300, 280, '#fffad2', 0.35); }
    const k = K.clamp((fase(a) - 0.2) / 0.2); coche(K, ctx, 380, 840, 0.75, '#1f6fff'); coche(K, ctx, 960, 840, 0.75, '#e63946');
    if (k > 0) { ctx.save(); ctx.globalAlpha = k; coche(K, ctx, 1540, 840, 0.75, '#ffd93d'); ctx.restore(); K.starBurst(ctx, 1540, 650, 220, '#ffd93d', k * 0.6); }
    D(K, ctx, a, YOU, 960, 1060, 1.1, { pose: 'miedo', mira: 1, mood: 'sorpresa' });
    K.contador(ctx, a, 'EVERY 3 WEEKS', 960, 70, { icono: 'loop', size: 38 }); K.etiqueta(ctx, a, 'out of thin air', 1560, 420, { p0: 0.4 }); K.luz(ctx, a, { tono: 'interior', foco: [1200, 500] }); },
  // 44 — En el despacho, el marcador parpadea en verde y SUBE
  44: (ctx, a, K) => { const { YOU, LAW } = cast(K);
    K.camara(ctx, a, () => { const v = lerpN(640000000, 702000000, K.clamp(fase(a) / 0.9)); const gy = despacho(K, ctx, a, v, { parp: true, hora: 'dia', mw: 860 });
      for (let i = 0; i < 3; i++) K.text(ctx, '▲', 1440 + i * 70, 160 - ((a.t * 80 + i * 30) % 90), { size: 60, color: '#4dff88' });
      D(K, ctx, a, LAW, 1450, gy, 1.15, { pose: 'senala', mira: -1, mood: 'neutral' }); const y = D(K, ctx, a, YOU, 600, gy + 30, 1.25, { pose: 'miedo', mira: 1, mood: 'sorpresa' }); K.simbolo(ctx, a, y.cabeza, y.hr, '!', 0.3); }, { de: 1, a: 1.1, foco: [W / 2, 200] });
    K.radial(ctx, W / 2, 160, 700, '#4dff88', 0.2); K.luz(ctx, a, { tono: 'interior', foco: [W / 2, 250] }); },
  // 45 — Pánico: la habitación da vueltas
  45: (ctx, a, K) => { const { YOU } = cast(K);
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(Math.sin(a.t * 1.5) * 0.12 + a.t * 0.05); ctx.translate(-W / 2, -H / 2); SET.salon(ctx, a.t, { hora: 'noche' }); ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.3; for (let i = 0; i < 8; i++) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(W / 2, H / 2, 200 + i * 120, a.t * 2 + i, a.t * 2 + i + 1.4); ctx.stroke(); } ctx.restore();
    const y = D(K, ctx, a, YOU, W / 2, 1080, 1.8, { pose: 'llora', mira: 0, mood: 'miedo' }); K.mareo(ctx, a, y.cabeza, y.hr);
    for (let i = 0; i < 5; i++) billete(K, ctx, W / 2 + Math.cos(a.t * 2 + i * 1.25) * 600, 480 + Math.sin(a.t * 2 + i * 1.25) * 300, 1.2, a.t + i);
    K.text(ctx, 'THE MONEY FIGHTS BACK', W / 2, 140, { size: 80, color: '#ff4d5e', k: K.clamp((fase(a) - 0.3) / 0.1) }); K.luz(ctx, a, { tono: 'tension', foco: [W / 2, 500] }); },
  // 46 — Día 20: gastar más rápido (cuatro viñetas)
  46: (ctx, a, K) => { const { YOU, MAYA } = cast(K);
    const [cant] = K.reparto('cantante-27', 1, [{ estilo: 'limpio', pelo: 'tupe', peloCol: '#000', ropa: '#ff3bd4', sombrero: null, corbata: null, barba: false, bigote: false }]);
    K.paneles(ctx, a, [
      (c, { w }) => { K.interior(c, a, { W: w, H, tipo: 'restaurante', hora: 'noche' }); D(K, c, a, { ...MAYA, sombrero: 'cocinero' }, w / 2, 1000, 1.0, { pose: 'sostiene', mood: 'feliz' }); K.rotulo(c, a, 'PRIVATE CHEFS', w / 2, 70, { size: 30 }); },
      (c, { w }) => { c.fillStyle = '#1b1530'; c.fillRect(0, 0, w, H); for (let i = 0; i < 4; i++) { c.fillStyle = `rgba(${i % 2 ? '255,59,212' : '77,150,255'},0.3)`; c.beginPath(); c.moveTo(w / 2, 0); c.lineTo(i * w / 3 - 100, 800); c.lineTo(i * w / 3 + 100, 800); c.fill(); } D(K, c, a, cant, w / 2, 780, 1.0, { pose: 'vitorea', mood: 'risa', habla: true }); K.publico(c, a, { x0: 0, x1: w, y0: 820, y1: 1080, filas: 2, reaccion: 'vitorea', tam: 60 }); K.rotulo(c, a, 'GIANT CONCERTS', w / 2, 70, { size: 30 }); },
      (c, { w }) => { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#9fd8ff'); g.addColorStop(1, '#fff'); c.fillStyle = g; c.fillRect(0, 0, w, H); K.P(c, [[-50, 900], [w * 0.4, 250], [w + 50, 900]], '#dfe8f6', 8); K.P(c, [[w * 0.3, 420], [w * 0.4, 250], [w * 0.5, 420]], '#fff', 6); K.R(c, 0, 900, w, 180, 0, '#fff', 0); D(K, c, a, YOU, w / 2, 1000, 1.0, { pose: 'vitorea', mood: 'feliz' }); K.rotulo(c, a, 'SKI RESORT', w / 2, 70, { size: 30 }); },
      (c, { w }) => { K.interior(c, a, { W: w, H, tipo: 'oficina', hora: 'dia' }); K.multitud(c, a, { n: 10, x0: 20, x1: w - 20, gy: 1000, esc: 0.6, filas: 3, reaccion: 'vitorea', seed: 'empleo27' }); K.rotulo(c, a, '+1,000 JOBS', w / 2, 70, { size: 30 }); },
    ], { W, H, paso: 0.12 }); dia(K, ctx, a, 20, W / 2, 1030); },
  // 47 — La trampa: los empleos devuelven dinero (bucle gastar→ganar)
  47: (ctx, a, K) => { const { YOU } = cast(K);
    sky(ctx, '#1b1530', '#3a2f5a'); const r = 330, cx = 1100, cy = 540;
    ctx.save(); ctx.strokeStyle = '#ffd93d'; ctx.lineWidth = 26; ctx.setLineDash([60, 30]); ctx.lineDashOffset = -a.t * 120; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke(); ctx.restore();
    [['SPEND', '#ff6b6b', 0], ['JOBS', '#4d96ff', 2.1], ['PROFIT', '#4dff88', 4.2]].forEach(([s, col, an]) => { const x = cx + Math.cos(an - Math.PI / 2) * r, y = cy + Math.sin(an - Math.PI / 2) * r; K.C(ctx, x, y, 110, col, 9); ctx.fillStyle = INK; ctx.font = '900 40px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); });
    const an = a.t * 1.2; const y = D(K, ctx, a, YOU, cx + Math.cos(an) * 180, cy + 220 + Math.sin(an) * 60, 0.7, { pose: 'corre', mira: Math.sin(an) > 0 ? -1 : 1, mood: 'miedo' });
    K.text(ctx, 'RICHER', cx, cy - 20, { size: 90, color: '#4dff88', k: K.clamp((fase(a) - 0.4) / 0.1) });
    K.cartel(ctx, a, 'THE TRAP', 360, 300, { tipo: 'rojo', size: 70, p0: 0.15 }); K.luz(ctx, a, { tono: 'noche', foco: [cx, cy] }); },
  // 48 — Cada mañana el abogado repite: "Ten days. Any plans?" (tres mañanas)
  48: (ctx, a, K) => { const { YOU, LAW } = cast(K);
    K.paneles(ctx, a, [0, 1, 2].map((i) => (c, { w }) => { const ctx2 = c; ctx2.fillStyle = ['#e9dccb', '#e2d3bf', '#d8c6ae'][i]; ctx2.fillRect(0, 0, w, H); K.R(ctx2, 40, 140, w - 80, 380, 10, '#9fd8ff', 7); K.C(ctx2, w - 140, 260, 60, '#ffd93d', 6); suelo(ctx2, 820, '#8a5a3a', '#6b4429');
      const l = D(K, ctx2, a, LAW, w * 0.6, 980, 1.0, { pose: 'habla', mira: -1, mood: 'neutral', habla: true }); D(K, ctx2, a, YOU, w * 0.2, 1000, 0.95, { pose: 'quieto', mira: 1, mood: ['duda', 'triste', 'miedo'][i] });
      K.globo(ctx2, a, 'Ten days. Any plans?', w / 2, 620, { tx: l.cabeza[0], ty: l.cabeza[1] - 50, p0: 0.1 + i * 0.15, size: 30, max: 380 }); K.rotulo(ctx2, a, ['MONDAY 8:00', 'TUESDAY 8:00', 'WEDNESDAY 8:00'][i], w / 2, 70, { size: 28 }); K.luz(ctx2, a, { W: w, H, tono: 'interior', foco: [w / 2, 500] }); }), { W, H, paso: 0.18 }); },
});

// ===================== CAPÍTULO 5 · PANIC =====================
Object.assign(A, {
  // 49 — Día 25, 3 AM: te despiertas sudando; el marcador en la pared: $400M
  49: (ctx, a, K) => { const { YOU } = cast(K);
    K.interior(ctx, a, { tipo: 'dormitorio', hora: 'noche' });
    marcador(K, ctx, a, 400000000, 1350, 260, { w: 640, size: 70, col: '#ff4d5e', parp: true });
    K.R(ctx, 200, 760, 800, 220, 20, '#3a4a8a', 8); K.R(ctx, 220, 700, 160, 90, 30, '#e8e4f0', 6);
    const k = sm(K.clamp(fase(a) / 0.25)); const y = D(K, ctx, a, YOU, 520, lerpN(900, 860, k), 1.3, { pose: k > 0.5 ? 'miedo' : 'sentado', mira: 1, mood: 'miedo' });
    for (let i = 0; i < 4; i++) K.E(ctx, y.cabeza[0] + 70 + i * 12, y.cabeza[1] - 40 + ((a.t * 120 + i * 40) % 120), 8, 13, '#7cc8ff', 0, 3);
    K.contador(ctx, a, '3:00 AM', 1350, 470, { icono: 'reloj', size: 40, col: '#1b1530' }); dia(K, ctx, a, 25);
    K.luz(ctx, a, { tono: 'noche', foco: [1300, 300], vineta: 0.75 }); },
  // 50 — $80M al día durante 5 días; calle de noche, no puedes respirar
  50: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { const { gy } = SET.calle(ctx, a.t, { hora: 'noche' });
      const w = K.anda(a, 300, 1500, 0, 1, true); const y = D(K, ctx, a, YOU, w.x, gy + 120, 1.3, { pose: 'corre', mira: 1, mood: 'miedo' });
      K.simbolo(ctx, a, y.cabeza, y.hr, '!', 0.4); }, { de: 1, a: 1.08, foco: [960, 600], temblor: 4 });
    K.R(ctx, 0, 0, W, 170, 0, 'rgba(10,6,20,0.7)', 0); K.text(ctx, '$80,000,000 / DAY × 5 DAYS', W / 2, 95, { size: 76, color: '#ff4d5e', k: K.clamp(fase(a) / 0.1) });
    K.etiqueta(ctx, a, "can't breathe", 1550, 330, { p0: 0.5 }); K.luz(ctx, a, { tono: 'noche', foco: [960, 600], vineta: 0.8 }); },
  // 51 — El marcador se vuelve ROJO (primerísimo plano de los dígitos)
  51: (ctx, a, K) => {
    K.R(ctx, 0, 0, W, H, 0, '#0a0812', 0); const red = fase(a) > 0.35;
    ctx.save(); ctx.translate(W / 2, H / 2); const s = lerpN(1, 1.15, fase(a)); ctx.scale(s, s); ctx.translate(-W / 2, -H / 2);
    marcador(K, ctx, a, 398250000, W / 2, H / 2, { w: 1700, size: 220, col: red ? '#ff2b3e' : '#4dff88', parp: red }); ctx.restore();
    if (red) { K.radial(ctx, W / 2, H / 2, 1100, '#ff2b3e', 0.35 + Math.sin(a.t * 12) * 0.1); }
    K.flash(ctx, a.t, 0.35 * (a.d || 4), 0.15, '255,40,60'); K.text(ctx, 'RED', W / 2, 1000, { size: 90, color: '#ff2b3e', k: K.clamp((fase(a) - 0.4) / 0.1) }); },
  // 52 — El corazón late como un tambor (corazón enorme sobre el pecho, rayos X)
  52: (ctx, a, K) => { const { YOU } = cast(K);
    sky(ctx, '#2a0a1a', '#120612'); const beat = 1 + Math.max(0, Math.sin(a.t * 9)) ** 6 * 0.25;
    for (let i = 0; i < 4; i++) { ctx.strokeStyle = `rgba(255,59,78,${0.4 - i * 0.09})`; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(960, 560, 220 * beat + i * 90 + ((a.t * 200) % 90), 0, 7); ctx.stroke(); }
    D(K, ctx, a, YOU, 960, 1400, 2.6, { pose: 'quieto', mira: 0, mood: 'miedo', alpha: 0.35 });
    K.prop(ctx, 'corazon', 960, 600, 1.4 * beat, a.t);
    ctx.strokeStyle = '#4dff88'; ctx.lineWidth = 7; ctx.beginPath(); for (let x = 0; x <= W; x += 8) { const ph = (x / 300 - a.t * 2) % 1, sp = ph > 0 && ph < 0.08 ? Math.sin(ph / 0.08 * Math.PI * 2) * 120 : 0; ctx.lineTo(x, 960 - sp); } ctx.stroke();
    K.text(ctx, 'THUD', 360, 300, { size: 110, color: '#ff4d5e', k: Math.max(0, Math.sin(a.t * 9)) ** 4, rot: -0.15 }); K.text(ctx, 'THUD', 1560, 360, { size: 90, color: '#ff4d5e', k: Math.max(0, Math.sin(a.t * 9 + 1)) ** 4, rot: 0.12 }); },
  // 53 — Priya llama a medianoche: centro de datos de servidores azules
  53: (ctx, a, K) => { const { PRIYA, YOU } = cast(K);
    K.interior(ctx, a, { tipo: 'servidores', hora: 'noche' });
    const p = D(K, ctx, a, PRIYA, 1150, 1000, 1.15, { pose: 'llama', mira: -1, mood: 'feliz', habla: true });
    K.globo(ctx, a, 'A data center! Thousands of servers!', 1150, 260, { tx: p.cabeza[0], ty: p.cabeza[1] - 60, p0: 0.15, max: 520 });
    ctx.save(); ctx.translate(330, 640); K.R(ctx, -230, -360, 460, 560, 24, '#1b1530', 9); D(K, ctx, a, YOU, 0, 240, 0.95, { pose: 'llama', mira: 1, mood: 'cansado' }); ctx.restore();
    K.contador(ctx, a, '12:00 AM', 330, 250, { icono: 'reloj', size: 36 }); K.luz(ctx, a, { tono: 'noche', foco: [1150, 500] }); },
  // 54 — Firmas: −$100M… pero los servidores ganan el mismo día. Corres en círculos
  54: (ctx, a, K) => { const { YOU } = cast(K);
    K.pasillo(ctx, a, { hora: 'noche' });
    const an = a.t * 2.4, x = 960 + Math.cos(an) * 520, gy = 1000 + Math.sin(an) * 50;
    D(K, ctx, a, YOU, x, gy, 1.0 + Math.sin(an) * 0.08, { pose: 'corre', mira: Math.sin(an) > 0 ? -1 : 1, mood: 'miedo' });
    ctx.save(); ctx.globalAlpha = 0.5; for (let i = 0; i < 3; i++) K.E(ctx, 960, 1020 + i * 6, 540 - i * 4, 70, 'rgba(0,0,0,0)', 0, 3); ctx.restore();
    K.contador(ctx, a, '−$100,000,000', 600, 90, { icono: 'dinero', size: 40, col: '#c1121f', p0: 0.05 });
    K.contador(ctx, a, '+$100,000,000', 1320, 90, { icono: 'dinero', size: 40, col: '#2d6b35', p0: 0.45 });
    K.text(ctx, 'IN CIRCLES', W / 2, 260, { size: 100, color: '#ffd93d', k: K.clamp((fase(a) - 0.6) / 0.1) }); K.luz(ctx, a, { tono: 'noche', foco: [960, 600] }); },
  // 55 — Mensaje de Maya: "Where are you? You sound awful." (chat en pantalla)
  55: (ctx, a, K) => { const { MAYA, YOU } = cast(K);
    sky(ctx, '#121028', '#1f1a40'); const y = D(K, ctx, a, YOU, 470, 1250, 2.0, { pose: 'sostiene', mira: 1, mood: 'triste' });
    movil(K, ctx, 1250, 540, 1.35, (c) => { c.fillStyle = '#f4f1fa'; c.fillRect(-148, -300, 296, 600); c.fillStyle = '#e63946'; c.fillRect(-148, -300, 296, 70); c.fillStyle = '#fff'; c.font = '800 26px Poppins'; c.textAlign = 'center'; c.fillText('Maya', 0, -255);
      const msgs = ['Where are you?', 'You sound awful.', 'Call me. Please.']; msgs.forEach((m, i) => { const k = K.clamp((fase(a) - 0.1 - i * 0.2) / 0.08); if (k <= 0) return; c.globalAlpha = k; c.fillStyle = '#fff'; c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.roundRect(-130, -200 + i * 90, 230, 66, 18); c.fill(); c.stroke(); c.fillStyle = INK; c.font = '600 21px Poppins'; c.textAlign = 'left'; c.fillText(m, -116, -158 + i * 90); c.globalAlpha = 1; });
      c.fillStyle = '#999'; c.font = '500 18px Poppins'; c.textAlign = 'center'; c.fillText('typing…', 0, 250); }, -0.05);
    ctx.save(); ctx.translate(1750, 200); K.C(ctx, 0, 0, 90, '#ffd0d4', 6); ctx.beginPath(); ctx.arc(0, 0, 84, 0, 7); ctx.clip(); D(K, ctx, a, MAYA, 0, 260, 0.75, { pose: 'quieto', mood: 'triste' }); ctx.restore();
    K.luz(ctx, a, { tono: 'noche', foco: [1250, 540], vineta: 0.75 }); },
  // 56 — Día 27: quedan $200M (calendario arrancando hojas)
  56: (ctx, a, K) => { const { YOU } = cast(K);
    K.R(ctx, 0, 0, W, H, 0, '#2a2440', 0); K.R(ctx, 560, 160, 800, 680, 20, '#fff', 10); K.R(ctx, 560, 160, 800, 140, 20, '#e63946', 10);
    K.text(ctx, 'DAY', 960, 250, { size: 70, color: '#fff' }); const n = fase(a) < 0.4 ? 26 : 27;
    K.text(ctx, String(n), 960, 600, { size: 340, color: INK });
    const k = K.clamp((fase(a) - 0.25) / 0.3); if (k > 0 && k < 1) { ctx.save(); ctx.translate(960 + k * 700, 500 + k * k * 600); ctx.rotate(k * 2.5); K.R(ctx, -400, -200, 800, 540, 10, '#fff', 8); ctx.fillStyle = INK; ctx.font = '900 250px Anton'; ctx.textAlign = 'center'; ctx.fillText('26', 0, 180); ctx.restore(); }
    D(K, ctx, a, YOU, 300, 1060, 1.15, { pose: 'cansado', mira: 1, mood: 'cansado' });
    marcador(K, ctx, a, 200000000, 1640, 960, { w: 520, size: 60, col: '#ff4d5e' }); K.luz(ctx, a, { tono: 'interior', foco: [960, 450] }); },
  // 57 — Paseas por el pasillo vacío del edificio del abogado, de noche
  57: (ctx, a, K) => { const { YOU } = cast(K);
    const { gy } = SET.pasillo(ctx, a.t, { hora: 'noche' });
    const w = K.anda(a, 400, 1500, 0, 1); const y = D(K, ctx, a, YOU, w.x, gy + 60, 1.15, { pose: w.pose === 'quieto' ? 'piensa' : w.pose, mira: 1, mood: 'piensa' });
    K.globo(ctx, a, 'What costs this much… and never pays you back?', 960, 230, { tx: y.cabeza[0], ty: y.cabeza[1] - 60, p0: 0.2, max: 760, pensamiento: true });
    K.luz(ctx, a, { tono: 'noche', foco: [y.cabeza[0], y.cabeza[1]], r: 600, vineta: 0.85 }); },
  // 58 — Recuerdas "Boring." → ¡un hospital! (flashback sepia + bombilla)
  58: (ctx, a, K) => { const { YOU, DEON } = cast(K);
    sky(ctx, '#2a2440', '#3a2f5a');
    ctx.save(); ctx.beginPath(); ctx.ellipse(1300, 380, 480, 280, 0, 0, 7); ctx.clip(); ctx.fillStyle = '#e8d2a8'; ctx.fillRect(800, 80, 1000, 600);
    const d = D(K, ctx, a, DEON, 1300, 720, 1.0, { pose: 'encoge', mira: -1, mood: 'risa', habla: true }); K.globo(ctx, a, 'Boring.', 1450, 220, { tx: d.cabeza[0], ty: d.cabeza[1] - 40, size: 46 }); ctx.fillStyle = 'rgba(160,110,50,0.25)'; ctx.fillRect(800, 80, 1000, 600); ctx.restore();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 8; ctx.beginPath(); ctx.ellipse(1300, 380, 480, 280, 0, 0, 7); ctx.stroke();
    const y = D(K, ctx, a, YOU, 450, 1060, 1.35, { pose: fase(a) > 0.55 ? 'vitorea' : 'piensa', mira: 1, mood: fase(a) > 0.55 ? 'sorpresa' : 'piensa' });
    if (fase(a) > 0.55) { K.radial(ctx, y.cabeza[0], y.cabeza[1] - 230, 220, '#ffd93d', 0.7); K.C(ctx, y.cabeza[0], y.cabeza[1] - 240, 60, '#ffe66d', 7); K.R(ctx, y.cabeza[0] - 28, y.cabeza[1] - 190, 56, 40, 6, '#9aa0b4', 6); }
    K.text(ctx, 'A HOSPITAL.', 1300, 880, { size: 120, color: '#fff', k: K.clamp((fase(a) - 0.6) / 0.1) }); K.luz(ctx, a, { tono: 'noche', foco: [900, 500] }); },
});

// ===================== CAPÍTULO 6 · THE LAST DOLLAR =====================
Object.assign(A, {
  // 59 — Hospital ≥ $400M: desglose (terreno, acero, cableado, camas)
  59: (ctx, a, K) => {
    sky(ctx, '#cfe6ff', '#f3f8ff'); K.R(ctx, 0, 0, W, H, 0, 'rgba(40,90,160,0.08)', 0);
    for (let x = 0; x < W; x += 60) K.L(ctx, [[x, 0], [x, H]], 'rgba(40,90,160,0.18)', 2); for (let y = 0; y < H; y += 60) K.L(ctx, [[0, y], [W, y]], 'rgba(40,90,160,0.18)', 2);
    hospital(K, ctx, a, 620, 1000, 0.95, { pisos: 6, obra: 1, luces: 0 });
    [['LAND', '$60M'], ['STEEL & CONCRETE', '$140M'], ['WIRING & PIPES', '$90M'], ['BEDS & GEAR', '$110M']].forEach(([n, v], i) => { const k = K.clamp((fase(a) - 0.1 - i * 0.13) / 0.08); if (k <= 0) return; ctx.save(); ctx.globalAlpha = k; K.R(ctx, 1180, 220 + i * 150, 620, 120, 14, '#fff', 6); ctx.fillStyle = INK; ctx.font = '800 38px Poppins'; ctx.textAlign = 'left'; ctx.fillText(n, 1210, 295 + i * 150); ctx.fillStyle = '#c1121f'; ctx.textAlign = 'right'; ctx.fillText(v, 1770, 295 + i * 150); ctx.restore(); });
    K.text(ctx, '= $400,000,000+', 1490, 900, { size: 90, color: '#c1121f', k: K.clamp((fase(a) - 0.7) / 0.1) }); K.luz(ctx, a, { tono: 'dia', foco: [960, 500] }); },
  // 60 — Llamas a la constructora al amanecer: el capataz se ríe… y para
  60: (ctx, a, K) => { const { YOU } = cast(K);
    const [cap] = K.reparto('capataz-27', 1, [{ estilo: 'gordito', pelo: 'calvo', peloCol: '#3a2a1a', ropa: '#ff8c1a', sombrero: 'casco', corbata: null, barba: true, bigote: false }]);
    K.R(ctx, 0, 0, W / 2, H, 0, '#ffb48a', 0); sky(ctx, '#ff9a6a', '#ffd9a0', 0); ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W / 2, H); ctx.clip(); K.ciudad(ctx, a, { hora: 'atardecer' }); const y = D(K, ctx, a, YOU, 480, 1180, 1.6, { pose: 'llama', mira: 1, mood: 'serio', habla: fase(a) < 0.4 }); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(W / 2, 0, W / 2, H); ctx.clip(); ctx.fillStyle = '#e9c98a'; ctx.fillRect(W / 2, 0, W / 2, H); grua(K, ctx, 1700, 900, 0.7, a.t, '#ffd93d'); suelo(ctx, 900, '#a08060', '#806040');
    const laughing = fase(a) < 0.55; const c = D(K, ctx, a, cap, 1440, 1180, 1.6, { pose: laughing ? 'llama' : 'miedo', mira: -1, mood: laughing ? 'risa' : 'sorpresa', habla: laughing }); ctx.restore();
    K.R(ctx, W / 2 - 6, 0, 12, H, 0, INK, 0);
    K.globo(ctx, a, 'I need a hospital. Built in 4 days.', 480, 200, { tx: y.cabeza[0], ty: y.cabeza[1] - 60, p0: 0.05, max: 520 });
    if (laughing) for (let i = 0; i < 3; i++) K.text(ctx, 'HA', 1300 + i * 140, 320 + Math.sin(a.t * 10 + i) * 14, { size: 60, color: '#fff', k: K.clamp((fase(a) - 0.2 - i * 0.05) / 0.06) });
    else K.globo(ctx, a, "…you're serious.", 1440, 260, { tx: c.cabeza[0], ty: c.cabeza[1] - 60, p0: 0.6 });
    K.contador(ctx, a, '5:40 AM', W / 2, 1020, { icono: 'reloj', size: 34 }); K.luz(ctx, a, { tono: 'atardecer', foco: [W / 2, 500] }); },
  // 61 — Grúas y cientos de obreros, 24/7 (timelapse día/noche)
  61: (ctx, a, K) => {
    const cyc = (a.t * 0.5) % 1, noche = cyc > 0.5; sky(ctx, noche ? '#0b1030' : '#7cc8ff', noche ? '#2a2f66' : '#d9f0ff', 900); suelo(ctx, 900, '#a08060', '#806040');
    const sx = 300 + cyc * 1320, sy = 300 - Math.sin(cyc * Math.PI * 2) * 200; K.C(ctx, sx, sy, 60, noche ? '#f4f1fa' : '#ffd93d', 6);
    hospital(K, ctx, a, 960, 900, 0.9, { pisos: 6, obra: 0.2 + fase(a) * 0.5, luces: noche ? 0.5 : 0, noche });
    grua(K, ctx, 380, 900, 1.1, a.t, '#ffd93d'); grua(K, ctx, 1560, 900, 1.0, a.t + 1, '#ff8c1a');
    K.multitud(ctx, a, { n: 18, x0: 60, x1: 1860, gy: 1060, esc: 0.5, filas: 2, reaccion: 'trabaja', seed: 'obreros27', sombrero: 'casco' });
    K.contador(ctx, a, '24 / 7', 960, 70, { icono: 'reloj', size: 40 }); if (noche) K.R(ctx, 0, 0, W, H, 0, 'rgba(10,10,40,0.25)', 0); },
  // 62 — Quirófanos, urgencias, helipuerto, cables (corte transversal)
  62: (ctx, a, K) => {
    K.R(ctx, 0, 0, W, H, 0, '#2a2440', 0); const fl = [['OPERATING ROOMS', '#cfe6ff'], ['ER WING', '#ffd0d4'], ['WARDS', '#d9ffd4'], ['LABS', '#f2d4ff']];
    K.R(ctx, 260, 120, 1400, 120, 6, '#5d5d6e', 8); K.C(ctx, 960, 180, 50, '#ffd93d', 6); K.text(ctx, 'H', 960, 200, { size: 60, color: INK }); K.text(ctx, 'HELIPAD', 1350, 200, { size: 48, color: '#fff', k: K.clamp((fase(a) - 0.65) / 0.1) });
    fl.forEach(([n, col], i) => { const y = 260 + i * 200, k = K.clamp((fase(a) - i * 0.12) / 0.1); K.R(ctx, 260, y, 1400, 190, 6, k > 0 ? col : '#4a4460', 8); if (k <= 0) return; ctx.save(); ctx.globalAlpha = k;
      for (let j = 0; j < 4; j++) { const x = 380 + j * 340; if (i === 0) { K.R(ctx, x - 80, y + 100, 160, 40, 8, '#fff', 5); K.C(ctx, x, y + 40, 30, '#fff8b0', 4); } else if (i === 1) { K.R(ctx, x - 70, y + 90, 140, 50, 10, '#fff', 5); K.text(ctx, '+', x, y + 80, { size: 50, color: '#e63946' }); } else if (i === 2) { K.R(ctx, x - 90, y + 110, 180, 40, 10, '#fff', 5); K.R(ctx, x - 90, y + 90, 50, 30, 8, '#ffd0d4', 4); } else { K.R(ctx, x - 70, y + 70, 140, 80, 8, '#9aa0b4', 5); K.C(ctx, x, y + 60, 20, '#4d96ff', 4); } }
      ctx.fillStyle = INK; ctx.font = '800 30px Poppins'; ctx.textAlign = 'left'; ctx.fillText(n, 280, y + 36); ctx.restore(); });
    for (let i = 0; i < 4; i++) { ctx.strokeStyle = ['#ffd93d', '#4d96ff', '#e63946', '#4dff88'][i]; ctx.lineWidth = 7; ctx.setLineDash([30, 14]); ctx.lineDashOffset = -a.t * 80; ctx.beginPath(); ctx.moveTo(1700 + i * 30, 120); ctx.lineTo(1700 + i * 30, 1060); ctx.stroke(); } ctx.setLineDash([]);
    K.luz(ctx, a, { tono: 'interior', foco: [960, 540] }); },
  // 63 — Máquinas de resonancia, ~$3M cada una, varias en fila
  63: (ctx, a, K) => { const { YOU } = cast(K);
    K.interior(ctx, a, { tipo: 'oficina', hora: 'dia' }); K.R(ctx, 0, 0, W, 820, 0, 'rgba(220,240,255,0.7)', 0);
    for (let i = 0; i < 3; i++) { const k = K.clamp((fase(a) - i * 0.15) / 0.12); if (k <= 0) continue; ctx.save(); ctx.translate(0, (1 - sm(k)) * -400); resonancia(K, ctx, 380 + i * 580, 980, 0.8, a.t); ctx.restore(); K.contador(ctx, a, '−$3,000,000', 380 + i * 580, 380, { icono: 'dinero', size: 30, col: '#c1121f', p0: i * 0.15 + 0.08 }); }
    D(K, ctx, a, YOU, 960, 1080, 1.0, { pose: 'vitorea', mira: 0, mood: 'feliz' }); K.etiqueta(ctx, a, 'MRI ≈ $3M each', 960, 220, { p0: 0.5 }); K.luz(ctx, a, { tono: 'interior', foco: [960, 500] }); },
  // 64 — Vendes el jet: Vivian se aleja entre las nubes
  64: (ctx, a, K) => { const { YOU } = cast(K);
    sky(ctx, '#7cc8ff', '#d9f0ff', 880); suelo(ctx, 880, '#5d5d6e', '#3a3d4c'); for (let i = 0; i < 8; i++) K.R(ctx, i * 260, 960, 140, 18, 4, '#fff', 0);
    const k = sm(K.clamp(fase(a) / 0.9)); avion(K, ctx, lerpN(800, 1900, k), lerpN(720, 160, k), lerpN(0.9, 0.3, k), -0.25 * k);
    for (let i = 0; i < 5; i++) K.E(ctx, ((i * 450 + a.t * 40) % 2300) - 200, 140 + (i % 3) * 90, 160, 50, '#ffffff', 0, 0);
    const y = D(K, ctx, a, YOU, 450, 1040, 1.2, { pose: 'despide', mira: 1, mood: 'triste' }); K.cartel(ctx, a, 'SOLD', 260, 560, { tipo: 'rojo', size: 70, p0: 0.1 });
    K.globo(ctx, a, 'Bye, Vivian.', 600, 380, { tx: y.cabeza[0] + 30, ty: y.cabeza[1] - 50, p0: 0.4 }); K.luz(ctx, a, { tono: 'dia', foco: [1300, 400] }); },
  // 65 — Vendes mansión, coches, isla, equipo: el marcador baja más rápido
  65: (ctx, a, K) => {
    K.R(ctx, 0, 0, W, H, 0, '#1f1a40', 0);
    const items = [(x, y) => mansion(K, ctx, x, y + 120, 0.32, false), (x, y) => coche(K, ctx, x, y + 90, 0.45, '#ffd93d'), (x, y) => isla(K, ctx, x, y + 40, 0.45, a.t), (x, y) => { K.P(ctx, [[x - 90, y - 80], [x - 30, y - 110], [x + 30, y - 110], [x + 90, y - 80], [x + 120, y - 20], [x + 70, y], [x + 70, y + 110], [x - 70, y + 110], [x - 70, y], [x - 120, y - 20]], '#ffd93d', 7); }];
    items.forEach((fn, i) => { const x = 280 + i * 450, y = 520; K.R(ctx, x - 200, y - 200, 400, 400, 20, '#2f2a55', 6); fn(x, y); sello(K, ctx, a, 'SOLD', x, y, { p0: 0.08 + i * 0.12, size: 80, col: '#e63946', rot: -0.2 }); });
    const v = lerpN(180000000, 40000000, K.clamp(fase(a) / 0.9)); marcador(K, ctx, a, v, W / 2, 150, { w: 760, size: 80, col: '#ff4d5e' });
    K.text(ctx, '▼ ▼ ▼', W / 2, 950, { size: 90, color: '#ff4d5e', k: K.clamp((fase(a) - 0.5) / 0.1) }); K.luz(ctx, a, { tono: 'noche', foco: [W / 2, 500] }); },
  // 66 — Día 30, 10 PM: $12M; Priya llora, Maya abraza; el hospital se ilumina piso a piso
  66: (ctx, a, K) => { const { YOU, MAYA, PRIYA } = cast(K);
    sky(ctx, '#0b1030', '#2a2f66', 900); for (let i = 0; i < 40; i++) K.C(ctx, (i * 389) % W, (i * 173) % 380, 2, '#fff', 0); suelo(ctx, 900, '#3a3d4c', '#2a2d3a');
    hospital(K, ctx, a, 1250, 900, 0.95, { pisos: 6, obra: 1, luces: K.clamp(fase(a) / 0.9), noche: true });
    D(K, ctx, a, PRIYA, 330, 1060, 1.1, { pose: 'llora', mira: 1, mood: 'llora' }); D(K, ctx, a, MAYA, 470, 1060, 1.1, { pose: 'abraza', mira: -1, mood: 'triste' }); D(K, ctx, a, YOU, 700, 1070, 1.15, { pose: 'quieto', mira: 1, mood: 'serio' });
    dia(K, ctx, a, 30); K.contador(ctx, a, '10:00 PM', 170, 160, { icono: 'reloj', size: 34 }); saldo(K, ctx, a, 12000000, 1700, 70, '#ff4d5e'); K.luz(ctx, a, { tono: 'noche', foco: [1250, 500] }); },
  // 67 — 11:15: quedan $3M, una resonancia más… el camión llega tarde
  67: (ctx, a, K) => { const { YOU } = cast(K);
    const { gy } = SET.calle(ctx, a.t, { hora: 'noche' });
    const k = K.clamp((fase(a) - 0.5) / 0.4); const tx = lerpN(2300, 1300, sm(k));
    ctx.save(); ctx.translate(tx, gy + 40); K.R(ctx, -260, -300, 400, 300, 10, '#f4f1fa', 8); K.R(ctx, 140, -220, 150, 220, 14, '#4d96ff', 8); K.R(ctx, 170, -200, 90, 80, 8, '#bfe3ff', 5); K.C(ctx, -150, 0, 50, INK, 0); K.C(ctx, 200, 0, 50, INK, 0); ctx.fillStyle = INK; ctx.font = '900 46px Anton'; ctx.textAlign = 'center'; ctx.fillText('MRI', -60, -130); ctx.restore();
    const y = D(K, ctx, a, YOU, 500, gy + 120, 1.2, { pose: k > 0 ? 'vitorea' : 'mira_reloj', mira: 1, mood: k > 0 ? 'sorpresa' : 'miedo' });
    const big = K.clamp(fase(a) / 0.1); ctx.save(); ctx.translate(500, 260); ctx.scale(big, big); K.C(ctx, 0, 0, 110, '#fff', 9); for (let i = 0; i < 12; i++) { ctx.save(); ctx.rotate(i * Math.PI / 6); K.R(ctx, -3, -100, 6, 16, 2, INK, 0); ctx.restore(); } ctx.rotate(1.57 + 0.5); K.R(ctx, -5, -70, 10, 70, 4, INK, 0); ctx.rotate(-0.5 + a.t * 3); K.R(ctx, -3, -95, 6, 95, 3, '#e63946', 0); ctx.restore();
    K.contador(ctx, a, '11:15 PM', 500, 420, { icono: null, size: 40, col: '#c1121f' }); saldo(K, ctx, a, 3000000, 1700, 70, '#ff4d5e'); K.etiqueta(ctx, a, 'LATE!', 1400, 380, { p0: 0.6 }); K.luz(ctx, a, { tono: 'noche', foco: [900, 500] }); },
  // 68 — 11:58: error del banco, faltan unos miles. ¡Corre!
  68: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { const { gy } = SET.avenida(ctx, a.t, { hora: 'noche' });
      const w = K.anda(a, -100, 2000, 0.2, 1, true); D(K, ctx, a, YOU, w.x, gy + 100, 1.25, { pose: 'corre', mira: 1, mood: 'miedo' });
      for (let i = 0; i < 6; i++) K.L(ctx, [[w.x - 160 - i * 40, gy - 120 + i * 30], [w.x - 400 - i * 60, gy - 120 + i * 30]], 'rgba(255,255,255,0.5)', 6); }, { de: 1.05, a: 1.05, temblor: 6 });
    ctx.save(); ctx.translate(W / 2, 220); ctx.rotate(-0.03); K.R(ctx, -520, -110, 1040, 220, 16, '#fff', 9); K.R(ctx, -520, -110, 1040, 64, 16, '#c1121f', 9); ctx.fillStyle = '#fff'; ctx.font = '800 34px Poppins'; ctx.textAlign = 'center'; ctx.fillText('⚠ BANK ERROR', 0, -66); ctx.fillStyle = INK; ctx.font = '700 36px Poppins'; ctx.fillText('Transfer failed: −$4,870 remaining', 0, 30); ctx.restore();
    K.contador(ctx, a, '11:58 PM', 1700, 70, { icono: 'reloj', size: 40, col: '#c1121f' }); K.text(ctx, 'RUN!', 1500, 520, { size: 140, color: '#ffd93d', k: K.clamp((fase(a) - 0.3) / 0.08), rot: -0.1 }); K.luz(ctx, a, { tono: 'tension', foco: [960, 600] }); },
  // 69 — Irrumpes en el despacho y pagas la cuota de instalación con la última cuenta
  69: (ctx, a, K) => { const { YOU, LAW } = cast(K);
    const gy = despacho(K, ctx, a, 4870, { col: '#ff4d5e', parp: true, hora: 'noche', mw: 620 });
    const k = sm(K.clamp(fase(a) / 0.2)); K.puerta ? K.puerta(ctx, a, 260, gy, { abierta: k }) : null;
    D(K, ctx, a, LAW, 1450, gy, 1.15, { pose: 'quieto', mira: -1, mood: 'neutral' });
    const y = D(K, ctx, a, YOU, lerpN(300, 760, k), gy + 30, 1.25, { pose: fase(a) > 0.45 ? 'sostiene' : 'corre', mira: 1, mood: 'serio' });
    if (fase(a) > 0.45) { movil(K, ctx, y.manoD[0] + 60, y.manoD[1] - 120, 0.45, (c) => { c.fillStyle = '#2d6b35'; c.fillRect(-148, -300, 296, 600); c.fillStyle = '#fff'; c.font = '900 60px Poppins'; c.textAlign = 'center'; c.fillText('PAY', 0, -20); c.font = '700 34px Poppins'; c.fillText('Installation fee', 0, 60); }, 0.1); K.flash(ctx, a.t, 0.6 * (a.d || 4), 0.15); }
    K.etiqueta(ctx, a, 'last account', 760, 400, { p0: 0.5 }); escritorio(K, ctx, 1450, gy - 40, 600); K.luz(ctx, a, { tono: 'noche', foco: [W / 2, 300] }); },
  // 70 — 11:59: el marcador 1000 → 100 → 10 → 1 → 0
  70: (ctx, a, K) => {
    K.R(ctx, 0, 0, W, H, 0, '#0a0812', 0); const seq = ['$1,000', '$100', '$10', '$1', '$0'], i = Math.min(4, Math.floor(fase(a) / 0.16)), z = i === 4;
    K.radial(ctx, W / 2, H / 2, 1000, z ? '#ffd93d' : '#ff2b3e', 0.3);
    ctx.save(); ctx.translate(W / 2, H / 2); const pop = 1 + Math.max(0, 0.15 - ((fase(a) % 0.16))) * 2; ctx.scale(pop, pop); ctx.translate(-W / 2, -H / 2);
    marcador(K, ctx, a, seq[i], W / 2, H / 2, { w: 1300, size: 260, col: z ? '#ffd93d' : '#ff4d5e' }); ctx.restore();
    K.contador(ctx, a, '11:59 PM', W / 2, 180, { icono: 'reloj', size: 48, col: '#c1121f' });
    if (z) { K.radial(ctx, W / 2, H / 2, 700, '#ffffff', 0.35); K.sparkles(ctx, W / 2, H / 2, a.t, 14, 600); K.text(ctx, 'ZERO.', W / 2, 950, { size: 120, color: '#ffd93d', k: K.clamp((fase(a) - 0.66) / 0.08) }); } },
  // 71 — El abogado se pone en pie y sonríe (contrapicado)
  71: (ctx, a, K) => { const { LAW } = cast(K);
    K.camara(ctx, a, () => { const gy = despacho(K, ctx, a, 0, { col: '#ffd93d', hora: 'noche', mw: 520 }); const k = sm(K.clamp(fase(a) / 0.35));
      const l = D(K, ctx, a, LAW, W / 2, lerpN(gy + 120, gy + 20, k), 1.6, { pose: k > 0.9 ? 'aplaude' : 'quieto', mira: 0, mood: fase(a) > 0.4 ? 'feliz' : 'neutral' });
      escritorio(K, ctx, W / 2, gy + 10, 1100); K.globo(ctx, a, 'Well done.', 1400, 360, { tx: l.cabeza[0] + 60, ty: l.cabeza[1] - 50, p0: 0.55 }); }, { de: 1.15, a: 1.0, foco: [W / 2, 400] });
    K.luz(ctx, a, { tono: 'interior', foco: [W / 2, 400], vineta: 0.7 }); },
  // 72 — Ganaste, no tienes nada: zapatillas viejas, cartera ligera (detalle)
  72: (ctx, a, K) => { const { YOU } = cast(K);
    K.calle(ctx, a, { hora: 'noche' }); K.R(ctx, 0, 0, W, H, 0, 'rgba(10,6,30,0.35)', 0);
    const y = D(K, ctx, a, YOU, 960, 1060, 1.3, { pose: 'sostiene', mira: 0, mood: 'feliz' });
    ctx.save(); ctx.translate(y.manoD[0] + 40, y.manoD[1] - 30); ctx.rotate(-0.15); K.R(ctx, -90, -55, 180, 110, 14, '#8a5a3a', 7); K.R(ctx, -80, -20, 160, 40, 6, '#6b4429', 4); ctx.restore();
    const k = K.clamp((fase(a) - 0.4) / 0.2); if (k > 0) { ctx.save(); ctx.globalAlpha = k; for (let i = 0; i < 3; i++) K.E(ctx, y.manoD[0] + 40 + Math.sin(a.t * 3 + i) * 20, y.manoD[1] - 100 - i * 40 - ((a.t * 40) % 40), 12, 6, '#c9ccd6', 0, 3); ctx.restore(); }
    K.etiqueta(ctx, a, 'old sneakers', 700, 1000, { p0: 0.2 }); K.etiqueta(ctx, a, 'light wallet', 1350, 560, { p0: 0.35 });
    K.text(ctx, 'YOU WON. YOU OWN NOTHING.', W / 2, 160, { size: 86, color: '#fff', k: K.clamp((fase(a) - 0.55) / 0.1) }); K.luz(ctx, a, { tono: 'noche', foco: [960, 600] }); },
  // 73 — Amanece: el hospital brilla; enfermeras en fila
  73: (ctx, a, K) => {
    const k = sm(K.clamp(fase(a) / 0.6)); sky(ctx, '#ff9a6a', '#ffe0b0', 900); K.C(ctx, 1650, lerpN(900, 420, k), 120, '#ffd93d', 0); K.radial(ctx, 1650, lerpN(900, 420, k), 600, '#ffd93d', 0.5); suelo(ctx, 900, '#8a8fa6', '#5d6680');
    hospital(K, ctx, a, 900, 900, 0.95, { pisos: 6, obra: 1, luces: 1 });
    const [nurse] = K.reparto('enfermera-27', 1, [{ estilo: 'limpio', pelo: 'coleta', peloCol: '#3a2a1a', ropa: '#3fbfa0', sombrero: null, corbata: null, barba: false, bigote: false }]);
    K.multitud(ctx, a, { n: 8, x0: 200, x1: 1720, gy: 1060, esc: 0.75, filas: 1, reaccion: 'aplaude', seed: 'enfermeras27', ropa: '#3fbfa0' });
    K.luz(ctx, a, { tono: 'atardecer', foco: [1300, 450] }); K.rotulo(ctx, a, 'SUNRISE · DAY 31', 960, 70, { size: 40 }); },
  // 74 — Llega una ambulancia; entra el primer paciente en camilla
  74: (ctx, a, K) => {
    sky(ctx, '#ffd9a0', '#fff0d8', 900); suelo(ctx, 900, '#8a8fa6', '#5d6680'); hospital(K, ctx, a, 1350, 900, 0.8, { pisos: 6, obra: 1, luces: 1 });
    const k = sm(K.clamp(fase(a) / 0.45)); ambulancia(K, ctx, a, lerpN(-400, 560, k), 1000, 0.9);
    if (fase(a) > 0.5) { const s = K.clamp((fase(a) - 0.5) / 0.45), sx = lerpN(800, 1180, s); K.R(ctx, sx - 130, 960, 260, 30, 10, '#fff', 6); K.C(ctx, sx - 100, 1010, 14, INK, 0); K.C(ctx, sx + 100, 1010, 14, INK, 0); K.E(ctx, sx - 100, 945, 34, 26, '#ffd0d4', 0, 5); K.R(ctx, sx - 70, 930, 190, 30, 10, '#bfe3ff', 5); }
    K.etiqueta(ctx, a, 'first patient', 1000, 760, { p0: 0.55 }); K.luz(ctx, a, { tono: 'dia', foco: [1100, 600] }); },
  // 75 — Es Deon: "Okay. Not boring."
  75: (ctx, a, K) => { const { DEON, YOU } = cast(K);
    K.interior(ctx, a, { tipo: 'dormitorio', hora: 'dia' }); K.R(ctx, 0, 0, W, H, 0, 'rgba(220,245,255,0.55)', 0);
    K.R(ctx, 900, 700, 900, 220, 20, '#fff', 8); K.R(ctx, 900, 640, 200, 100, 30, '#e8f4ff', 6);
    const d = D(K, ctx, a, DEON, 1200, 900, 1.25, { pose: 'sentado', mira: -1, mood: fase(a) > 0.35 ? 'feliz' : 'cansado', habla: fase(a) > 0.35 && fase(a) < 0.7 });
    K.R(ctx, 1450, 880, 200, 40, 8, '#fff', 5); const y = D(K, ctx, a, YOU, 450, 1060, 1.2, { pose: 'risa', mira: 1, mood: 'risa' });
    K.globo(ctx, a, 'Okay. Not boring.', 1150, 230, { tx: d.cabeza[0], ty: d.cabeza[1] - 60, p0: 0.35, size: 56 }); K.luz(ctx, a, { tono: 'dia', foco: [1000, 500] }); },
  // 76 — Moraleja: lo difícil es gastarlo en algo que importe (balanza)
  76: (ctx, a, K) => { const { YOU } = cast(K);
    sky(ctx, '#1f1a40', '#3a2f5a'); const tilt = lerpN(-0.25, 0.25, sm(K.clamp((fase(a) - 0.2) / 0.5)));
    K.R(ctx, 950, 380, 20, 560, 6, '#c9ccd6', 7); K.P(ctx, [[860, 960], [1060, 960], [960, 900]], '#c9ccd6', 7);
    ctx.save(); ctx.translate(960, 400); ctx.rotate(tilt); K.R(ctx, -600, -12, 1200, 24, 10, '#c9ccd6', 7);
    [[-560, 1], [560, -1]].forEach(([x, s]) => { ctx.save(); ctx.translate(x, 0); ctx.rotate(-tilt); K.L(ctx, [[-110, 220], [0, 0], [110, 220]], INK, 5); K.E(ctx, 0, 230, 160, 40, '#ffd93d', 0, 7);
      if (s > 0) { for (let i = 0; i < 3; i++) fajo(K, ctx, -60 + i * 60, 210, 0.8, 4); K.text(ctx, 'STUFF', 0, 330, { size: 52, color: '#fff' }); } else { K.prop(ctx, 'corazon', 0, 160, 0.6, a.t); K.text(ctx, 'MATTERS', 0, 330, { size: 52, color: '#fff' }); } ctx.restore(); }); ctx.restore();
    D(K, ctx, a, YOU, 960, 1080, 0.8, { pose: 'piensa', mira: 0, mood: 'feliz' });
    K.text(ctx, 'SPEND IT ON SOMETHING THAT MATTERS', W / 2, 120, { size: 72, color: '#ffd93d', k: K.clamp((fase(a) - 0.6) / 0.1) }); K.luz(ctx, a, { tono: 'noche', foco: [960, 500] }); },
  // 77 — Comentarios: ¿hospital o isla? (votación)
  77: (ctx, a, K) => { const { YOU } = cast(K);
    K.R(ctx, 0, 0, W, H, 0, '#fdf3dc', 0);
    [[480, '#cfe6ff', 'HOSPITAL', (x) => hospital(K, ctx, a, x, 760, 0.42, { pisos: 6, obra: 1, luces: 1 })], [1440, '#bff0ff', 'ISLAND', (x) => isla(K, ctx, x, 560, 0.75, a.t)]].forEach(([x, col, lab, fn], i) => { K.R(ctx, x - 400, 160, 800, 700, 30, col, 9); ctx.save(); ctx.beginPath(); ctx.roundRect(x - 395, 165, 790, 690, 26); ctx.clip(); fn(x); ctx.restore(); K.text(ctx, lab, x, 960, { size: 90, color: i ? '#4d96ff' : '#e63946' }); });
    K.text(ctx, 'OR', W / 2, 520, { size: 130, color: '#e63946', k: K.clamp((fase(a) - 0.2) / 0.1) });
    D(K, ctx, a, YOU, W / 2, 1100, 0.7, { pose: 'encoge', mira: 0, mood: 'duda' });
    K.contador(ctx, a, 'TELL ME IN THE COMMENTS 💬', W / 2, 70, { icono: null, size: 40, col: '#4d96ff', p0: 0.4 }); },
  // 78 — Próximo vídeo: 30 días sin dormir (avance)
  78: (ctx, a, K) => { const { YOU } = cast(K);
    K.interior(ctx, a, { tipo: 'dormitorio', hora: 'noche' }); K.R(ctx, 0, 0, W, H, 0, 'rgba(10,6,30,0.5)', 0);
    const y = D(K, ctx, a, YOU, 760, 1060, 1.4, { pose: 'quieto', mira: 1, mood: 'cansado' }); for (let i = 0; i < 2; i++) K.E(ctx, y.cabeza[0] - 30 + i * 60, y.cabeza[1] + 30, 26, 10, 'rgba(120,60,140,0.6)', 0, 0);
    marcador(K, ctx, a, 'DAY 1 / 30', 1400, 300, { w: 560, size: 70, col: '#7cc8ff' });
    K.cartel(ctx, a, 'NEXT VIDEO', 1400, 560, { tipo: 'amarillo', size: 60, p0: 0.15 }); K.text(ctx, 'NEVER SLEEPING FOR 30 DAYS', 1360, 760, { size: 64, color: '#fff', k: K.clamp((fase(a) - 0.3) / 0.1) });
    K.luz(ctx, a, { tono: 'noche', foco: [1100, 500], vineta: 0.8 }); },
});
