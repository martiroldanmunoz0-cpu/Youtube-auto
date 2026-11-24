// GENTE: reparto de monigotes «gorditos» (idea de estilo: cuerpo redondo y grande, brazos y piernas de palo,
// cabeza redonda, calvos / con pelo / con sombrero, caras muy simples). Diseño propio del canal, no copia de nadie.
// Pensado para escenas con MUCHOS personajes que interactúan (charlar, dar la mano, señalar, perseguirse, multitudes).
// Los personajes antiguos (persona.mjs) siguen existiendo: esto es un reparto adicional.
//
// Uso rápido (en una escena a medida, con K):
//   const [ana, bob] = K.reparto(a.seed, 2);            // mismos personajes en todo el vídeo si la semilla es la del vídeo
//   K.monigote(ctx, a, ana, 600, 1300, 1.6, { pose: 'habla', mira: 1, mood: 'feliz', habla: true });
//   K.monigote(ctx, a, bob, 900, 1300, 1.6, { pose: 'encoge', mira: -1, mood: 'duda' });
//   K.globo(ctx, a, '¿EN SERIO?', 900, 820, { p0: 0.2 });
//   K.multitud(ctx, a, { n: 14, x0: -400, x1: 1500, gy: 1500, esc: 1.1, reaccion: 'vitorea', seed: 'gradas' });
//   K.anda(a, 200, 900, 0.1, 0.8)  -> { x, pose: 'anda' | 'quieto', mira }   (moverse de un sitio a otro)
// Origen del monigote: punto entre los pies. esc 1 ≈ 400 px de alto (sin sombrero).
import { rng } from './util.mjs';

const INK = '#1b1530';
const PIELES = ['#ffd9b8', '#f4c39a', '#e0a676', '#c28152', '#9a5f38', '#6e3f22'];
const ROPA = ['#ff6b6b', '#4d96ff', '#ffd93d', '#6bcb77', '#b07cff', '#ff9f43', '#2ec4b6', '#f15bb5', '#8d99ae', '#3a86ff', '#e76f51', '#90be6d', '#ffffff', '#2b2d42'];
const PELO_COL = ['#1a120c', '#3b2416', '#6b4423', '#b5793a', '#e8c36a', '#a33b20', '#9e9e9e', '#f2f2f2'];
const PELOS = ['calvo', 'calvo', 'coronilla', 'mechon', 'pinchos', 'casco', 'rizos', 'coleta', 'mono', 'raya', 'melena', 'tupe'];
const SOMBREROS = ['gorra', 'chistera', 'vaquero', 'gorro', 'obra', 'cocinero', 'bombin', 'fiesta', 'pescador', 'corona', 'boina', 'casco'];

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
function oscurece(hex, f = 0.75) { const n = parseInt(hex.slice(1), 16); const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255; return `rgb(${Math.round(r * f)},${Math.round(g * f)},${Math.round(b * f)})`; }

// Un personaje al azar (determinista con la semilla). o permite fijar rasgos: { pelo, sombrero, ropa, piel, ancho, ... }
export function tipo(seed, o = {}) {
  const r = rng(`gente-${seed}`); const pick = (a) => a[r.int(0, a.length - 1)];
  const p = {
    piel: pick(PIELES), ropa: pick(ROPA), pantalon: pick(['#2b2d42', '#3d405b', '#5a3e2b', '#1d3557', '#4a4e69']),
    ancho: 0.8 + r() * 0.55, alto: 0.85 + r() * 0.35, cabeza: 0.85 + r() * 0.35, forma: pick(['huevo', 'pera', 'bola', 'barril']),
    pelo: pick(PELOS), peloCol: pick(PELO_COL), sombrero: r() < 0.38 ? pick(SOMBREROS) : null, somCol: pick(ROPA),
    bigote: r() < 0.25, barba: r() < 0.14, gafas: r() < 0.22, nariz: pick(['punto', 'bola', 'larga', 'nada']),
    corbata: r() < 0.2 ? pick(ROPA) : null, cejas: r() < 0.5, pecas: r() < 0.12, mejillas: r() < 0.5,
  };
  if (p.sombrero === 'casco' || p.pelo === 'casco') p.sombrero = p.sombrero === 'casco' ? 'obra' : p.sombrero;
  return { ...p, ...o, id: o.id ?? String(seed) };
}
// n personajes distintos para un vídeo (variados a propósito: al menos un calvo, uno con sombrero, uno con pelo)
export function reparto(seed, n = 4, fijos = []) {
  const out = []; let k = 0;
  while (out.length < n) {
    const i = out.length, f = fijos[i] || {};
    const base = tipo(`${seed}-${k++}`, f);
    if (i === 0 && !f.pelo && !f.sombrero) { base.pelo = 'calvo'; base.sombrero = null; }
    if (i === 1 && !f.sombrero && !f.pelo) base.sombrero = base.sombrero || 'gorra';
    if (i === 2 && !f.pelo) { base.pelo = ['rizos', 'melena', 'pinchos', 'coleta'][k % 4]; base.sombrero = null; }
    if (out.some((q) => q.ropa === base.ropa && q.piel === base.piel)) continue;
    out.push(base);
  }
  return out;
}

// ---------- Poses: ángulos (rad) de hombro y codo por lado; 0 = colgando, PI/2 = horizontal hacia fuera, PI = arriba ----------
function pose(nombre, t, mira) {
  const w = Math.sin(t * 9), s = Math.sin(t * 3);
  // [hombroIzq, codoIzq, hombroDer, codoDer, piernaIzq, rodillaIzq, piernaDer, rodillaDer, saltoY]
  const P = {
    quieto: [0.25 + s * 0.03, 0.15, 0.25 + s * 0.03, 0.15, 0.08, 0, 0.08, 0, 0],
    saluda: [0.25, 0.15, 2.5, 0.5 + w * 0.45, 0.08, 0, 0.08, 0, 0],
    habla: [0.3, 0.2, 1.1 + Math.sin(t * 5) * 0.35, -0.9 + Math.sin(t * 4) * 0.3, 0.08, 0, 0.08, 0, 0],
    senala: [0.25, 0.1, 1.55, 0.02, 0.1, 0, 0.1, 0, 0],
    vitorea: [2.7 + w * 0.15, 0.3, 2.7 - w * 0.15, 0.3, 0.12, 0, 0.12, 0, Math.abs(Math.sin(t * 7)) * 22],
    encoge: [1.0, 1.4, 1.0, 1.4, 0.08, 0, 0.08, 0, 0],
    miedo: [2.2, 0.7 + w * 0.12, 2.2, 0.7 - w * 0.12, 0.2, 0.25, 0.2, 0.25, 0],
    piensa: [0.25, 0.15, 0.7, -2.5, 0.08, 0, 0.08, 0, 0],
    brazos: [0.7, -1.7, 0.7, -1.7, 0.08, 0, 0.08, 0, 0],
    sostiene: [1.25, -0.6, 1.25, -0.6, 0.1, 0, 0.1, 0, 0],
    levanta: [2.8, 0.1, 2.8, 0.1, 0.2, 0.15, 0.2, 0.15, 0],
    empuja: [1.5, 0.05, 1.5, 0.05, -0.45, 0.2, 0.55, 0.35, 0],
    aplaude: [1.2, -1.2 + Math.abs(w) * 0.5, 1.2, -1.2 + Math.abs(w) * 0.5, 0.08, 0, 0.08, 0, 0],
    llora: [1.1, -2.4, 1.1, -2.4, 0.08, 0, 0.08, 0, Math.abs(Math.sin(t * 6)) * 4],
    sentado: [0.3, 0.2, 0.3, 0.2, 1.5, -1.5, 1.5, -1.5, 0],
    salta: [2.4, 0.4, 2.4, 0.4, 0.4, 0.8, 0.4, 0.8, 40 + Math.sin(t * 6) * 30],
    manos: [1.3, 0.3, 1.3, 0.3, 0.08, 0, 0.08, 0, 0], // tender la mano / dar la mano
  };
  if (nombre === 'anda' || nombre === 'corre') {
    const v = nombre === 'corre' ? 13 : 7, amp = nombre === 'corre' ? 0.75 : 0.4, c = Math.sin(t * v);
    return [0.3 - c * amp, nombre === 'corre' ? -1.4 : 0.1, 0.3 + c * amp, nombre === 'corre' ? -1.4 : 0.1,
      c * amp, Math.max(0, -c) * amp * 1.4, -c * amp, Math.max(0, c) * amp * 1.4, Math.abs(Math.cos(t * v)) * (nombre === 'corre' ? 18 : 7)];
  }
  return P[nombre] || P.quieto;
}

// ---------- Dibujo ----------
function linea(ctx, pts, ancho, col = INK) { ctx.strokeStyle = col; ctx.lineWidth = ancho; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); }
function elipse(ctx, x, y, rx, ry, fill, lw = 0, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, 7); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke(); } }
// extremidad de 2 tramos: desde (x,y), lado ±1, ángulo hombro/cadera a y codo/rodilla b (b relativo, positivo dobla hacia fuera)
function extremidad(x, y, lado, a, b, l1, l2) {
  const x1 = x + lado * Math.sin(a) * l1, y1 = y + Math.cos(a) * l1;
  const x2 = x1 + lado * Math.sin(a + b) * l2, y2 = y1 + Math.cos(a + b) * l2;
  return [[x, y], [x1, y1], [x2, y2]];
}

function cuerpo(ctx, p, bw, bh, by) {
  ctx.beginPath();
  const f = p.forma;
  if (f === 'pera') { ctx.moveTo(0, by - bh / 2); ctx.bezierCurveTo(bw * 0.55, by - bh / 2, bw * 0.62, by + bh * 0.5, 0, by + bh / 2); ctx.bezierCurveTo(-bw * 0.62, by + bh * 0.5, -bw * 0.55, by - bh / 2, 0, by - bh / 2); }
  else if (f === 'barril') { ctx.roundRect(-bw / 2, by - bh / 2, bw, bh, bw * 0.38); }
  else if (f === 'bola') { ctx.ellipse(0, by, bw * 0.55, bh * 0.5, 0, 0, 7); }
  else { ctx.moveTo(0, by - bh / 2); ctx.bezierCurveTo(bw * 0.62, by - bh / 2, bw * 0.56, by + bh / 2, 0, by + bh / 2); ctx.bezierCurveTo(-bw * 0.56, by + bh / 2, -bw * 0.62, by - bh / 2, 0, by - bh / 2); }
  ctx.closePath();
}

function cara(ctx, p, hx, hy, hr, o) {
  const m = o.mira || 0, dx = m * hr * 0.28, mood = o.mood || 'neutral', t = o.t || 0;
  const parp = ((t * 0.7 + (p.id.length % 5) * 0.37) % 3.2) < 0.12;
  const ey = hy - hr * 0.05, sep = hr * 0.32 * (m ? 0.85 : 1);
  const ojos = [hx + dx - sep, hx + dx + sep];
  // ojos
  for (const ex of ojos) {
    if (parp || mood === 'dormido') linea(ctx, [[ex - hr * 0.1, ey], [ex + hr * 0.1, ey]], hr * 0.06);
    else if (mood === 'sorpresa' || mood === 'miedo') { elipse(ctx, ex, ey, hr * 0.15, hr * 0.17, '#fff', hr * 0.045); elipse(ctx, ex + m * hr * 0.04, ey, hr * 0.06, hr * 0.06, INK); }
    else if (mood === 'feliz' || mood === 'risa') { ctx.strokeStyle = INK; ctx.lineWidth = hr * 0.07; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(ex, ey + hr * 0.04, hr * 0.1, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
    else elipse(ctx, ex, ey, hr * 0.075, hr * 0.1, INK);
  }
  if (p.gafas) { ctx.lineWidth = hr * 0.05; ctx.strokeStyle = INK; for (const ex of ojos) { ctx.beginPath(); ctx.arc(ex, ey, hr * 0.2, 0, 7); ctx.stroke(); } linea(ctx, [[ojos[0] + hr * 0.2, ey], [ojos[1] - hr * 0.2, ey]], hr * 0.05); }
  // cejas
  const v = { enfadado: 0.5, triste: -0.45, miedo: -0.5, llora: -0.45 }[mood];
  if (p.cejas || v !== undefined || mood === 'sorpresa' || mood === 'duda') for (let i = 0; i < 2; i++) {
    const ex = ojos[i], L = hr * 0.15, yy = ey - hr * (mood === 'sorpresa' ? 0.4 : 0.28) - (mood === 'duda' && i === 1 ? hr * 0.1 : 0), d = (v || 0) * L;
    const inner = i === 0 ? 1 : -1; // el extremo interior de cada ceja
    linea(ctx, [[ex - L, yy + (inner === -1 ? d : -d)], [ex + L, yy + (inner === 1 ? d : -d)]], hr * 0.07);
  }
  // nariz
  const nx = hx + dx * 1.4, ny = hy + hr * 0.15;
  if (p.nariz === 'bola') elipse(ctx, nx, ny, hr * 0.14, hr * 0.12, oscurece(p.piel, 0.88), hr * 0.04);
  else if (p.nariz === 'larga') { ctx.fillStyle = oscurece(p.piel, 0.88); ctx.beginPath(); ctx.moveTo(nx - hr * 0.05, ny - hr * 0.12); ctx.quadraticCurveTo(nx + (m || 1) * hr * 0.32, ny + hr * 0.05, nx, ny + hr * 0.1); ctx.closePath(); ctx.fill(); ctx.lineWidth = hr * 0.04; ctx.strokeStyle = INK; ctx.stroke(); }
  else if (p.nariz === 'punto') elipse(ctx, nx, ny, hr * 0.05, hr * 0.04, oscurece(p.piel, 0.6));
  if (p.mejillas && mood !== 'enfadado') for (const ex of ojos) elipse(ctx, ex + (ex < hx + dx ? -1 : 1) * hr * 0.08, hy + hr * 0.25, hr * 0.12, hr * 0.07, 'rgba(255,110,110,0.35)');
  if (p.pecas) for (let i = 0; i < 6; i++) elipse(ctx, hx + dx + (i < 3 ? -1 : 1) * hr * (0.25 + (i % 3) * 0.08), hy + hr * (0.15 + (i % 2) * 0.06), hr * 0.025, hr * 0.025, 'rgba(120,60,30,0.6)');
  // boca
  const mx = hx + dx * 1.2, my = hy + hr * 0.45, mw = hr * 0.26;
  const abierta = o.habla ? Math.abs(Math.sin(t * 13 + p.id.length)) : 0;
  ctx.lineWidth = hr * 0.07; ctx.strokeStyle = INK; ctx.lineCap = 'round';
  if (abierta > 0.25 || mood === 'sorpresa' || mood === 'risa' || mood === 'miedo') { const h = mood === 'sorpresa' ? hr * 0.16 : mood === 'risa' ? hr * 0.2 : hr * 0.06 + abierta * hr * 0.14; elipse(ctx, mx, my, mood === 'risa' ? mw : mw * 0.6, h, '#6b1d2a', hr * 0.05); }
  else if (mood === 'feliz') { ctx.beginPath(); ctx.arc(mx, my - hr * 0.12, mw, 0.25, Math.PI - 0.25); ctx.stroke(); }
  else if (mood === 'triste' || mood === 'enfadado') { ctx.beginPath(); ctx.arc(mx, my + hr * 0.14, mw * 0.8, Math.PI + 0.4, -0.4); ctx.stroke(); }
  else if (mood === 'duda') linea(ctx, [[mx - mw * 0.7, my + hr * 0.03], [mx + mw * 0.7, my - hr * 0.05]], hr * 0.07);
  else linea(ctx, [[mx - mw * 0.6, my], [mx + mw * 0.6, my]], hr * 0.07);
  if (p.bigote) { ctx.fillStyle = p.peloCol === '#f2f2f2' ? '#ddd' : p.peloCol; ctx.beginPath(); ctx.ellipse(mx - mw * 0.45, my - hr * 0.13, mw * 0.55, hr * 0.09, 0.25, 0, 7); ctx.ellipse(mx + mw * 0.45, my - hr * 0.13, mw * 0.55, hr * 0.09, -0.25, 0, 7); ctx.fill(); }
  if (mood === 'llora' || o.lagrimas) for (const ex of ojos) { const q = (t * 1.5 + ex * 0.01) % 1; elipse(ctx, ex, ey + hr * 0.15 + q * hr * 0.7, hr * 0.05, hr * 0.08, '#6ec6ff'); }
  if (mood === 'enfadado' && o.vapor !== false) for (let i = 0; i < 2; i++) { const q = (t * 1.2 + i * 0.5) % 1; ctx.globalAlpha = 1 - q; elipse(ctx, hx + (i ? 1 : -1) * hr * 1.1, hy - hr * (0.6 + q), hr * 0.18 * (0.6 + q), hr * 0.14 * (0.6 + q), '#e9e9ee'); ctx.globalAlpha = 1; }
}

function peloAtras(ctx, p, hx, hy, hr) {
  ctx.fillStyle = p.peloCol;
  if (p.pelo === 'melena') { ctx.beginPath(); ctx.roundRect(hx - hr * 1.08, hy - hr * 0.5, hr * 2.16, hr * 1.5, hr * 0.5); ctx.fill(); ctx.lineWidth = hr * 0.06; ctx.strokeStyle = INK; ctx.stroke(); }
  if (p.pelo === 'coleta') { elipse(ctx, hx + hr * 1.0, hy + hr * 0.1, hr * 0.28, hr * 0.6, p.peloCol, hr * 0.06, -0.4); }
  if (p.pelo === 'mono') elipse(ctx, hx, hy - hr * 1.08, hr * 0.38, hr * 0.32, p.peloCol, hr * 0.06);
  if (p.pelo === 'rizos') for (let i = 0; i < 9; i++) { const an = Math.PI * 0.95 + i / 8 * Math.PI * 1.1; elipse(ctx, hx + Math.cos(an) * hr * 0.95, hy + Math.sin(an) * hr * 0.9, hr * 0.32, hr * 0.32, p.peloCol, hr * 0.05); }
}
function peloDelante(ctx, p, hx, hy, hr, t) {
  const c = p.peloCol, lw = hr * 0.06; ctx.fillStyle = c; ctx.strokeStyle = INK; ctx.lineWidth = lw;
  // casquete de pelo: solo la parte de arriba de la cabeza (nunca tapa los ojos)
  const casquete = (_a, _b, alto = 0) => { const b = 0.45 - alto; ctx.save(); ctx.beginPath(); ctx.arc(hx, hy, hr * 1.03, 0, 7); ctx.clip();
    ctx.beginPath(); ctx.moveTo(hx - hr * 1.2, hy - hr * b); ctx.quadraticCurveTo(hx, hy - hr * (b - 0.2), hx + hr * 1.2, hy - hr * b); ctx.lineTo(hx + hr * 1.2, hy - hr * 1.3); ctx.lineTo(hx - hr * 1.2, hy - hr * 1.3); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
    ctx.beginPath(); ctx.arc(hx, hy, hr * 1.0, Math.PI * 1.12, Math.PI * 1.88); ctx.stroke(); };
  switch (p.pelo) {
    case 'calvo': elipse(ctx, hx - hr * 0.35, hy - hr * 0.6, hr * 0.22, hr * 0.12, 'rgba(255,255,255,0.45)', 0, -0.5); break;
    case 'coronilla': for (const sd of [-1, 1]) { ctx.beginPath(); ctx.ellipse(hx + sd * hr * 0.9, hy - hr * 0.05, hr * 0.22, hr * 0.42, sd * 0.2, 0, 7); ctx.fill(); ctx.stroke(); } elipse(ctx, hx - hr * 0.3, hy - hr * 0.62, hr * 0.2, hr * 0.1, 'rgba(255,255,255,0.45)', 0, -0.5); break;
    case 'mechon': for (let i = -1; i <= 1; i++) linea(ctx, [[hx + i * hr * 0.12, hy - hr * 0.97], [hx + i * hr * 0.25 + Math.sin(t * 3 + i) * hr * 0.05, hy - hr * 1.35]], hr * 0.07); elipse(ctx, hx - hr * 0.35, hy - hr * 0.6, hr * 0.2, hr * 0.1, 'rgba(255,255,255,0.45)', 0, -0.5); break;
    case 'pinchos': ctx.beginPath(); for (let i = 0; i <= 6; i++) { const an = Math.PI * 1.1 + i / 6 * Math.PI * 0.8; const r1 = i % 2 ? hr * 1.45 : hr * 0.95; ctx.lineTo(hx + Math.cos(an) * r1, hy + Math.sin(an) * r1); } ctx.closePath(); ctx.fill(); ctx.stroke(); break;
    case 'casco': case 'melena': casquete(Math.PI * 1.02, Math.PI * 1.98, 0.05); break;
    case 'raya': casquete(Math.PI * 1.05, Math.PI * 1.95, 0.08); ctx.beginPath(); ctx.ellipse(hx - hr * 0.35, hy - hr * 0.72, hr * 0.5, hr * 0.28, -0.3, 0, 7); ctx.fill(); ctx.stroke(); break;
    case 'tupe': casquete(Math.PI * 1.05, Math.PI * 1.95, 0.1); ctx.beginPath(); ctx.ellipse(hx + hr * 0.15, hy - hr * 1.0, hr * 0.62, hr * 0.32, 0.15, 0, 7); ctx.fill(); ctx.stroke(); break;
    case 'rizos': for (let i = 0; i < 5; i++) elipse(ctx, hx - hr * 0.6 + i * hr * 0.3, hy - hr * 0.88, hr * 0.26, hr * 0.24, c, lw); break;
    case 'coleta': case 'mono': casquete(Math.PI * 1.05, Math.PI * 1.95, 0.06); break;
  }
  if (p.barba) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(hx, hy + hr * 0.2, hr * 0.92, 0.1, Math.PI - 0.1); ctx.quadraticCurveTo(hx, hy + hr * 0.75, hx + hr * 0.9, hy + hr * 0.3); ctx.fill(); ctx.stroke(); }
}
function sombrero(ctx, p, hx, hy, hr) {
  const c = p.somCol, lw = hr * 0.07, top = hy - hr * 0.78; ctx.lineWidth = lw; ctx.strokeStyle = INK;
  const R = (x, y, w, h, r, f) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fillStyle = f; ctx.fill(); ctx.stroke(); };
  switch (p.sombrero) {
    case 'gorra': ctx.beginPath(); ctx.arc(hx, top + hr * 0.25, hr * 0.98, Math.PI, 0); ctx.closePath(); ctx.fillStyle = c; ctx.fill(); ctx.stroke(); R(hx, top + hr * 0.12, hr * 1.35, hr * 0.2, hr * 0.1, oscurece(c)); elipse(ctx, hx, top - hr * 0.72, hr * 0.1, hr * 0.08, oscurece(c), lw * 0.6); break;
    case 'chistera': R(hx - hr * 1.25, top + hr * 0.05, hr * 2.5, hr * 0.22, hr * 0.1, '#222'); R(hx - hr * 0.75, top - hr * 1.25, hr * 1.5, hr * 1.35, hr * 0.08, '#222'); ctx.fillStyle = c; ctx.fillRect(hx - hr * 0.72, top - hr * 0.2, hr * 1.44, hr * 0.22); break;
    case 'vaquero': elipse(ctx, hx, top + hr * 0.12, hr * 1.6, hr * 0.28, '#a0652d', lw); ctx.beginPath(); ctx.moveTo(hx - hr * 0.8, top + hr * 0.1); ctx.quadraticCurveTo(hx - hr * 0.85, top - hr * 0.95, hx, top - hr * 0.6); ctx.quadraticCurveTo(hx + hr * 0.85, top - hr * 0.95, hx + hr * 0.8, top + hr * 0.1); ctx.closePath(); ctx.fillStyle = '#b8783a'; ctx.fill(); ctx.stroke(); break;
    case 'gorro': ctx.beginPath(); ctx.arc(hx, top + hr * 0.3, hr * 1.0, Math.PI, 0); ctx.closePath(); ctx.fillStyle = c; ctx.fill(); ctx.stroke(); R(hx - hr * 1.02, top + hr * 0.1, hr * 2.04, hr * 0.32, hr * 0.12, oscurece(c)); elipse(ctx, hx, top - hr * 0.78, hr * 0.24, hr * 0.24, '#fff', lw); break;
    case 'obra': case 'casco': ctx.beginPath(); ctx.arc(hx, top + hr * 0.3, hr * 1.05, Math.PI, 0); ctx.closePath(); ctx.fillStyle = p.sombrero === 'obra' ? '#ffc93c' : c; ctx.fill(); ctx.stroke(); R(hx - hr * 1.25, top + hr * 0.2, hr * 2.5, hr * 0.18, hr * 0.09, p.sombrero === 'obra' ? '#f0b400' : oscurece(c)); break;
    case 'cocinero': R(hx - hr * 0.75, top - hr * 0.2, hr * 1.5, hr * 0.45, hr * 0.1, '#fff'); for (let i = -1; i <= 1; i++) elipse(ctx, hx + i * hr * 0.45, top - hr * 0.55, hr * 0.45, hr * 0.45, '#fff', lw); ctx.fillStyle = '#fff'; ctx.fillRect(hx - hr * 0.72, top - hr * 0.55, hr * 1.44, hr * 0.5); break;
    case 'bombin': elipse(ctx, hx, top + hr * 0.15, hr * 1.25, hr * 0.2, '#2b2b2b', lw); ctx.beginPath(); ctx.arc(hx, top + hr * 0.1, hr * 0.8, Math.PI, 0); ctx.closePath(); ctx.fillStyle = '#2b2b2b'; ctx.fill(); ctx.stroke(); break;
    case 'fiesta': ctx.beginPath(); ctx.moveTo(hx - hr * 0.6, top + hr * 0.15); ctx.lineTo(hx + hr * 0.1, top - hr * 1.3); ctx.lineTo(hx + hr * 0.7, top + hr * 0.15); ctx.closePath(); ctx.fillStyle = c; ctx.fill(); ctx.stroke(); elipse(ctx, hx + hr * 0.1, top - hr * 1.3, hr * 0.16, hr * 0.16, '#ffd93d', lw * 0.7); break;
    case 'pescador': ctx.beginPath(); ctx.moveTo(hx - hr * 1.3, top + hr * 0.35); ctx.lineTo(hx - hr * 0.8, top - hr * 0.35); ctx.lineTo(hx + hr * 0.8, top - hr * 0.35); ctx.lineTo(hx + hr * 1.3, top + hr * 0.35); ctx.closePath(); ctx.fillStyle = '#d8c48a'; ctx.fill(); ctx.stroke(); break;
    case 'corona': ctx.beginPath(); ctx.moveTo(hx - hr * 0.7, top + hr * 0.1); for (let i = 0; i <= 4; i++) { ctx.lineTo(hx - hr * 0.7 + i * hr * 0.35, top - hr * (i % 2 ? 0.2 : 0.7)); } ctx.lineTo(hx + hr * 0.7, top + hr * 0.1); ctx.closePath(); ctx.fillStyle = '#ffd93d'; ctx.fill(); ctx.stroke(); break;
    case 'boina': elipse(ctx, hx - hr * 0.1, top - hr * 0.05, hr * 1.1, hr * 0.38, c, lw, -0.12); elipse(ctx, hx - hr * 0.1, top - hr * 0.45, hr * 0.07, hr * 0.1, oscurece(c), 0); break;
  }
}

// Dibuja un monigote. o: { pose, mira (-1 izq, 0 frente, 1 der), mood, habla, t, alpha, escalaX (aplastar/estirar),
//   objeto: (ctx, mx, my, s) => dibuja algo en la mano derecha, giro (rad), sombra }
export function dibuja(ctx, p, x, gy, esc = 1, o = {}) {
  const t = o.t || 0, mira = o.mira ?? 0;
  let [h1, c1, h2, c2, l1, k1, l2, k2, sy] = Array.isArray(o.pose) ? o.pose : pose(o.pose || 'quieto', t + (p.id.length % 7) * 0.31, mira);
  if (mira < 0) [h1, c1, h2, c2] = [h2, c2, h1, c1]; // mirando a la izquierda: el brazo que actúa es el izquierdo
  const legL = 105 * (o.pose === 'sentado' ? 0.85 : 1), bw = 150 * p.ancho, bh = 175 * p.alto, hr = 60 * p.cabeza, lw = 9;
  const resp = 1 + Math.sin(t * 2.4 + p.id.length) * 0.015;
  ctx.save(); ctx.translate(x, gy); ctx.scale(esc, esc);
  if (o.sombra !== false) { ctx.globalAlpha = 0.18 * (o.alpha ?? 1); elipse(ctx, 0, 0, bw * 0.55, 12, '#000'); }
  ctx.globalAlpha = o.alpha ?? 1;
  ctx.translate(0, -sy); if (o.giro) ctx.rotate(o.giro);
  const hipY = -legL, by = hipY - bh * 0.42 * resp, topB = by - bh / 2 * resp;
  // piernas y zapatos
  for (const [lado, a, b] of [[-1, l1, k1], [1, l2, k2]]) {
    const hip = [lado * bw * 0.2, hipY - 10];
    const pts = o.pose === 'sentado' ? [[hip[0], hip[1]], [hip[0] + mira * 0 + lado * 10 + 60 * (mira || 1), hip[1]], [hip[0] + 60 * (mira || 1) + lado * 10, 0]] : extremidad(hip[0], hip[1], lado, a, b, legL * 0.55, legL * 0.5);
    linea(ctx, pts, lw, INK);
    const [fx, fy] = pts[2], d = mira || lado;
    elipse(ctx, fx + d * 14, fy - 4, 24, 12, '#2a2233', 0);
  }
  // brazo de atrás (si mira de lado, el del lado contrario va detrás del cuerpo)
  const hy0 = topB + bh * 0.3, sx = bw * 0.44;
  const brazo = (lado, a, b) => { const pts = extremidad(lado * sx, hy0, lado, a, b, 72, 68); linea(ctx, pts, lw, INK); const [mx, my] = pts[2]; elipse(ctx, mx, my, 15, 15, p.piel, 5); return [mx, my]; };
  let manoD = null, manoI = null;
  if (mira === 1) manoI = brazo(-1, h1, c1); if (mira === -1) manoD = brazo(1, h2, c2);
  // cuerpo
  ctx.save(); ctx.scale(o.escalaX || 1, resp);
  ctx.translate(0, by * (1 / resp - 1));
  cuerpo(ctx, p, bw, bh, by); ctx.fillStyle = p.ropa; ctx.fill();
  ctx.save(); ctx.clip(); elipse(ctx, bw * 0.35 * (mira >= 0 ? 1 : -1) + bw * 0.1, by + bh * 0.25, bw * 0.55, bh * 0.6, 'rgba(0,0,0,0.12)'); elipse(ctx, -bw * 0.22, by - bh * 0.25, bw * 0.15, bh * 0.1, 'rgba(255,255,255,0.25)', 0, -0.5);
  if (p.corbata) { ctx.fillStyle = p.corbata; ctx.beginPath(); ctx.moveTo(mira * 10 - 10, topB + 8); ctx.lineTo(mira * 10 + 10, topB + 8); ctx.lineTo(mira * 10 + 16, topB + bh * 0.5); ctx.lineTo(mira * 10, topB + bh * 0.6); ctx.lineTo(mira * 10 - 16, topB + bh * 0.5); ctx.closePath(); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); }
  ctx.fillStyle = p.pantalon; ctx.fillRect(-bw, by + bh * 0.32, bw * 2, bh);
  ctx.restore();
  cuerpo(ctx, p, bw, bh, by); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  ctx.restore();
  // brazos de delante
  if (mira !== 1) manoI = brazo(-1, h1, c1); if (mira !== -1) manoD = brazo(1, h2, c2);
  if (o.objeto && manoD) o.objeto(ctx, manoD[0], manoD[1], 1, manoI);
  // cabeza
  const hx = mira * 6, hyC = topB - hr * 0.62;
  peloAtras(ctx, p, hx, hyC, hr);
  elipse(ctx, hx, hyC, hr, hr * 0.98, p.piel, lw);
  if (p.sombrero !== 'chistera' && p.sombrero !== 'vaquero' && p.sombrero !== 'bombin') elipse(ctx, hx - mira * hr * 0.92, hyC + hr * 0.05, hr * 0.14, hr * 0.2, p.piel, 5); // oreja
  cara(ctx, p, hx, hyC, hr, { ...o, mira, t });
  if (!p.sombrero || ['coleta', 'melena'].includes(p.pelo)) peloDelante(ctx, p, hx, hyC, hr, t);
  else if (p.barba) peloDelante(ctx, { ...p, pelo: 'calvo_' }, hx, hyC, hr, t);
  if (p.sombrero) sombrero(ctx, p, hx, hyC, hr);
  ctx.restore();
  const k = esc, top = gy - (sy + legL + bh + hr * 1.6) * k;
  return { x, gy, top, cabeza: [x + hx * k, gy + (hyC - sy) * k], hr: hr * k,
    manoD: manoD && [x + manoD[0] * k, gy + (manoD[1] - sy) * k], manoI: manoI && [x + manoI[0] * k, gy + (manoI[1] - sy) * k] };
}

// Versión cómoda para escenas: monigote(ctx, a, p, x, gy, esc, o) usa a.t
export function monigote(ctx, a, p, x, gy, esc = 1, o = {}) { return dibuja(ctx, p, x, gy, esc, { t: a.t, ...o }); }

// Moverse de x0 a x1 entre las fases f0 y f1 del plano (0..1). Devuelve { x, pose, mira }
export function anda(a, x0, x1, f0 = 0, f1 = 1, corre = false) {
  const k = clamp((a.t / (a.d || 3) - f0) / (f1 - f0)), m = k > 0 && k < 1;
  return { x: x0 + (x1 - x0) * (k * k * (3 - 2 * k)), pose: m ? (corre ? 'corre' : 'anda') : 'quieto', mira: m ? Math.sign(x1 - x0) : 0, k };
}

// Globo de diálogo que apunta a (tx, ty). Aparece en la fase p0.
export function globo(ctx, a, txt, x, y, { tx = null, ty = null, size = 46, p0 = 0, max = 560, col = '#ffffff', grito = false } = {}) {
  const k = clamp((a.t / (a.d || 3) - p0) / 0.08); if (k <= 0) return;
  ctx.save(); ctx.font = `700 ${size}px Poppins`; const palabras = String(txt).split(' '); const lineas = []; let l = '';
  for (const w of palabras) { const p = l ? l + ' ' + w : w; if (ctx.measureText(p).width > max && l) { lineas.push(l); l = w; } else l = p; } lineas.push(l);
  const w = Math.max(...lineas.map((s) => ctx.measureText(s).width)) + 70, h = lineas.length * size * 1.2 + 44;
  const s = 0.6 + 0.4 * k + (k < 1 ? Math.sin(k * Math.PI) * 0.12 : 0); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = k;
  ctx.fillStyle = col; ctx.strokeStyle = INK; ctx.lineWidth = 7;
  if (tx != null) { ctx.beginPath(); ctx.moveTo(-24, h / 2 - 8); ctx.lineTo((tx - x) / s, (ty - y) / s); ctx.lineTo(24, h / 2 - 8); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  ctx.beginPath(); if (grito) { const n = 18; for (let i = 0; i < n; i++) { const an = i / n * Math.PI * 2, r = i % 2 ? 1 : 1.18; ctx.lineTo(Math.cos(an) * w / 2 * r, Math.sin(an) * h / 2 * r); } ctx.closePath(); } else ctx.roundRect(-w / 2, -h / 2, w, h, 34);
  ctx.fill(); ctx.stroke(); if (tx != null && !grito) { ctx.fillStyle = col; ctx.fillRect(-20, h / 2 - 12, 40, 10); }
  ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; lineas.forEach((s2, i) => ctx.fillText(s2, 0, (i - (lineas.length - 1) / 2) * size * 1.2));
  ctx.restore();
}

// Muchos monigotes a la vez (público, cola, ciudad...). reaccion: pose común o 'mezcla'. Los de atrás más pequeños y más claros.
export function multitud(ctx, a, { n = 12, x0 = 0, x1 = 1080, gy = 1500, esc = 1, filas = 2, reaccion = 'mezcla', seed = 'gente', mood = null, mira = 0, habla = false } = {}) {
  const r = rng(`mult-${seed}`); const out = [];
  const reacs = ['quieto', 'habla', 'aplaude', 'senala', 'vitorea', 'brazos', 'piensa'];
  const moods = ['neutral', 'feliz', 'sorpresa', 'duda'];
  for (let f = filas - 1; f >= 0; f--) {
    const nf = Math.ceil(n / filas), e = esc * (1 - f * 0.18), y = gy - f * 70 * esc;
    for (let i = 0; i < nf; i++) {
      const p = tipo(`${seed}-${f}-${i}`), x = x0 + (i + 0.5 + (r() - 0.5) * 0.5 + (f % 2) * 0.5) * (x1 - x0) / nf;
      const pose2 = reaccion === 'mezcla' ? reacs[r.int(0, reacs.length - 1)] : reaccion;
      const info = dibuja(ctx, p, x, y, e * (0.9 + r() * 0.2), { t: a.t + r() * 3, pose: pose2, mood: mood || moods[r.int(0, moods.length - 1)], mira: mira === 'centro' ? Math.sign(540 - x) : mira, habla: habla && r() < 0.5 });
      if (f > 0) { ctx.save(); ctx.globalAlpha = 0.12 * f; ctx.restore(); }
      out.push(info);
    }
  }
  return out;
}

// Acciones de dos: devuelven las poses listas para usar.
//   apreton(a, f0) -> para dos personajes enfrentados: tienden la mano y la agitan
export function apreton(a, f0 = 0.2) { const k = clamp((a.t / (a.d || 3) - f0) / 0.15); const sh = k >= 1 ? Math.sin(a.t * 14) * 0.15 : 0; return [0.25, 0.15, 0.25 + k * 1.05 + sh, 0.2 - k * 0.1, 0.08, 0, 0.08, 0, 0]; }
// Estrellitas / mareo sobre la cabeza
export function mareo(ctx, a, cabeza, hr) { for (let i = 0; i < 3; i++) { const an = a.t * 4 + i * 2.1; const x = cabeza[0] + Math.cos(an) * hr * 1.1, y = cabeza[1] - hr * 1.3 + Math.sin(an) * hr * 0.25; ctx.save(); ctx.translate(x, y); ctx.rotate(an); ctx.fillStyle = '#ffd93d'; ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); for (let j = 0; j < 10; j++) { const r2 = j % 2 ? hr * 0.08 : hr * 0.18; ctx.lineTo(Math.cos(j * Math.PI / 5) * r2, Math.sin(j * Math.PI / 5) * r2); } ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); } }
// Símbolo sobre la cabeza: '!' '?' '♥' '💤' (dibujado) que rebota
export function simbolo(ctx, a, cabeza, hr, s = '!', p0 = 0) { const k = clamp((a.t / (a.d || 3) - p0) / 0.08); if (k <= 0) return; const y = cabeza[1] - hr * 1.9 - Math.abs(Math.sin(a.t * 6)) * hr * 0.2; ctx.save(); ctx.translate(cabeza[0] + hr * 0.6, y); ctx.scale(k, k); ctx.font = `${Math.round(hr * 1.1)}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = hr * 0.18; ctx.strokeStyle = INK; ctx.strokeText(s, 0, 0); ctx.fillStyle = s === '♥' ? '#ff5d73' : '#ffd93d'; ctx.fillText(s, 0, 0); ctx.restore(); }

export const GENTE = { tipo, reparto, monigote, dibuja, anda, globo, multitud, apreton, mareo, simbolo };
