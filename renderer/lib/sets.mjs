// DECORADOS DETALLADOS para escenas a medida en horizontal (lienzo 1920×1080, export «ancho» de los archivos a medida).
// Idea: el personaje está DENTRO del sitio (puertas, ventanas, muebles a escala humana, capas delante y detrás),
// no un muñeco pequeño delante de un fondo plano. Cada decorado devuelve { gy } = la línea del suelo donde pisan los pies.
//   import { SET, fig, cam, fg } from '../../lib/sets.mjs'
//   cam(ctx, a, 1, 1.06)  -> acercamiento suave de cámara (llamar antes de dibujar; ctx.restore() al final lo deshace)
//   const { gy } = SET.calle(ctx, a.t, { hora: 'dia' });  fig(ctx, a, who, 700, gy, 1, 'happy')
import { DRAW } from './props.mjs';
import { INK } from './brightbg.mjs';
import { drawFullBody } from './persona.mjs';

const { C, E, R, P } = DRAW;
export const WW = 1920, WH = 1080;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const hash = (i) => { const x = Math.sin(i * 127.1) * 43758.5453; return x - Math.floor(x); };

export function grad(ctx, c1, c2, y0 = 0, y1 = WH, x = 0, w = WW) { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, c1); g.addColorStop(1, c2); ctx.fillStyle = g; ctx.fillRect(x, y0, w, y1 - y0); }
export function glow(ctx, x, y, r, col, a = 0.5) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore(); }
function line(ctx, pts, col, w) { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); }
const SKY = { dia: ['#7cc8ff', '#d8f0ff'], atardecer: ['#ff9a6a', '#ffd9a0'], noche: ['#0b1030', '#2a2f66'], amanecer: ['#ffb8c8', '#ffe9c4'] };
function sky(ctx, hora, y1 = WH, t = 0) { const [a, b] = SKY[hora] || SKY.dia; grad(ctx, a, b, 0, y1); if (hora === 'noche') for (let i = 0; i < 70; i++) { ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 2 + i); C(ctx, hash(i) * WW, hash(i + 9) * y1 * 0.8, 2 + (i % 3), '#ffffff', 0); } ctx.globalAlpha = 1; }
export function shade(ctx, hora) { if (hora === 'noche') { ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgb(120,130,200)'; ctx.fillRect(0, 0, WW, WH); ctx.restore(); } else if (hora === 'atardecer') { ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgb(255,210,175)'; ctx.fillRect(0, 0, WW, WH); ctx.restore(); } }

// Cámara: acercamiento suave hacia (fx,fy) durante el plano. Hace ctx.save(): cerrar con ctx.restore()
export function cam(ctx, a, z0 = 1, z1 = 1.06, fx = WW / 2, fy = WH / 2, dx = 0) {
  const k = clamp(a.t / a.d), e = k * k * (3 - 2 * k), z = z0 + (z1 - z0) * e;
  ctx.save(); ctx.translate(fx + dx * e, fy); ctx.scale(z, z); ctx.translate(-fx, -fy);
}
// Personaje de pie con los pies en (x, gy). esc = 1 → unos 560 px de alto (plano medio-entero). Devuelve lo alto de la cabeza
export function fig(ctx, a, who, x, gy, esc = 1, mood = 'neutral', o = {}) {
  const s = 0.21 * esc, y = gy - 2290 * s + (o.still ? 0 : Math.sin(a.t * 2.2 + x * 0.01) * 3);
  ctx.save(); ctx.globalAlpha = 0.18; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(x, gy + 6, 260 * s * 1.1, 40 * s, 0, 0, 7); ctx.fill(); ctx.restore();
  drawFullBody(ctx, x, y, s, who, { mood, t: a.t, ...o }); return { top: y - 330 * s, head: y, s, chest: y + 600 * s };
}
// Primer plano de cabeza/hombros a gran tamaño (para reacciones): lo pone dentro del decorado ya dibujado
export function close(ctx, a, who, x, y, esc = 1, mood = 'neutral', o = {}) { const s = 0.62 * esc; drawFullBody(ctx, x, y, s, who, { mood, t: a.t, ...o }); return { head: y, s }; }

// ---------------- DECORADOS ----------------
function window_(ctx, x, y, w, h, hora, t, curtain = '#e9d4b0') { R(ctx, x - 10, y - 10, w + 20, h + 20, 8, '#f6efe2', 7); const [a, b] = SKY[hora] || SKY.dia; const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, a); g.addColorStop(1, b); ctx.fillStyle = g; ctx.fillRect(x, y, w, h); for (let i = 0; i < 5; i++) { const bx = x + i * w / 5; ctx.fillStyle = hora === 'noche' ? '#1a1f45' : '#9fb7d6'; ctx.fillRect(bx + 4, y + h * (0.35 + hash(i + x) * 0.3), w / 5 - 8, h); } ctx.fillStyle = INK; ctx.fillRect(x + w / 2 - 4, y, 8, h); ctx.fillRect(x, y + h / 2 - 4, w, 8); for (const s of [-1, 1]) { ctx.fillStyle = curtain; ctx.beginPath(); const cx = s < 0 ? x - 30 : x + w + 30; ctx.moveTo(cx, y - 30); ctx.quadraticCurveTo(cx + s * -60 + Math.sin(t) * 6, y + h / 2, cx + s * -20, y + h + 40); ctx.lineTo(cx + s * 40, y + h + 40); ctx.lineTo(cx + s * 40, y - 30); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke(); } }
function frame_(ctx, x, y, w, h, col) { R(ctx, x, y, w, h, 6, '#c9a36a', 6); R(ctx, x + 14, y + 14, w - 28, h - 28, 4, col, 4); C(ctx, x + w * 0.35, y + h * 0.45, Math.min(w, h) * 0.12, 'rgba(255,255,255,0.6)', 0); P(ctx, [[x + 14, y + h - 14], [x + w * 0.45, y + h * 0.5], [x + w - 14, y + h - 14]], 'rgba(0,0,0,0.2)', 0); }
function plant(ctx, x, y, s = 1, t = 0) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); for (let i = 0; i < 7; i++) { ctx.save(); ctx.rotate(-1.2 + i * 0.4 + Math.sin(t + i) * 0.03); E(ctx, 0, -110, 26, 100, i % 2 ? '#3f9150' : '#5fc36a', 0, 5); ctx.restore(); } R(ctx, -60, -20, 120, 110, 16, '#c9673a', 7); ctx.restore(); }
function lamp(ctx, x, y, h, on, t) { R(ctx, x - 6, y - h, 12, h, 4, '#3a3d4c', 4); E(ctx, x, y, 50, 12, '#3a3d4c', 0, 4); P(ctx, [[x - 60, y - h], [x + 60, y - h], [x + 40, y - h - 80], [x - 40, y - h - 80]], '#ffe6a8', 6); if (on) glow(ctx, x, y - h - 30, 260, '#ffd76b', 0.45 + 0.05 * Math.sin(t * 3)); }
function car(ctx, x, y, s, col = '#e05a4a', t = 0) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); R(ctx, -260, -120, 520, 120, 40, col, 9); P(ctx, [[-170, -120], [-110, -220], [120, -220], [190, -120]], col, 9); R(ctx, -95, -205, 95, 75, 10, '#bfe6ff', 6); R(ctx, 15, -205, 95, 75, 10, '#bfe6ff', 6); R(ctx, 220, -90, 40, 24, 8, '#ffe066', 4); R(ctx, -262, -90, 30, 24, 8, '#ff6b6b', 4); for (const wx of [-150, 150]) { C(ctx, wx, 0, 62, '#24252e', 9); C(ctx, wx, 0, 26, '#9aa0ad', 5); } ctx.restore(); }
function tree(ctx, x, y, s = 1, t = 0, col = '#4fae5a') { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); R(ctx, -30, -360, 60, 370, 14, '#8a5a34', 8); for (let j = 0; j < 5; j++) C(ctx, Math.cos(j * 1.3) * 120, -420 - Math.sin(j * 1.7) * 90 + Math.sin(t * 1.3 + j) * 4, 150, [col, '#3f9150', '#6fcf6a'][j % 3], 8); ctx.restore(); }
function people(ctx, a, gy, n, s, seed = 0, alpha = 0.85) { ctx.save(); ctx.globalAlpha = alpha; for (let i = 0; i < n; i++) { const x = (hash(i + seed) * 1.2 - 0.1) * WW + Math.sin(a.t * 0.4 + i) * 40 * (i % 2 ? 1 : -1); const who = { skin: [{ light: '#f6d3b3' }, { light: '#c98d60' }, { light: '#8a5636' }, { light: '#e8b48a' }][i % 4], hair: ['short', 'long', 'curly', 'bun', 'buzz'][i % 5], hairColor: ['#2b1a10', '#d8b46a', '#1a100a', '#7a4a22'][i % 4], outfit: ['#2b3a66', '#7a2333', '#1f5c4a', '#a8571d', '#5b3a7a'][i % 5] }; who.skin = { ...who.skin, dark: '#000', ear: who.skin.light, neck: who.skin.light }; drawFullBody(ctx, x, gy - 2290 * s, s, who, { t: a.t + i }); } ctx.restore(); }
export { car, tree, plant, lamp, people, window_ as ventana, frame_ as cuadro };

export const SET = {
  // Calle de ciudad vista desde la acera de enfrente: tiendas con toldos y rótulos, pisos encima, acera, bordillo y calzada
  calle(ctx, t, { hora = 'dia', a = null, gente = 0, signs = ['CAFE', 'BOOKS', 'PIZZA', 'SHOES', 'DELI'] } = {}) {
    sky(ctx, hora, 400, t); const gy = 880;
    for (let i = 0; i < 9; i++) { const x = -60 + i * 260, h = 380 + hash(i) * 260; R(ctx, x, 380 - h * 0.5, 250, h, 4, hora === 'noche' ? '#2a2f55' : '#b9c7e0', 0); }
    const cols = ['#e9c49a', '#c97b5a', '#d9d0c0', '#9fb3c8', '#e0a96a'];
    for (let b = 0; b < 5; b++) { const x = b * 400 - 40, w = 400, c = cols[b];
      R(ctx, x, 40, w, 700, 0, c, 7); for (let r = 0; r < 3; r++) for (let q = 0; q < 3; q++) { const wx = x + 50 + q * 115, wy = 80 + r * 135; R(ctx, wx, wy, 80, 100, 6, hora === 'noche' && hash(b * 9 + r * 3 + q) > 0.4 ? '#ffd76b' : '#bfe6ff', 5); ctx.fillStyle = INK; ctx.fillRect(wx + 38, wy, 4, 100); R(ctx, wx - 8, wy + 100, 96, 12, 3, '#f6efe2', 4); }
      R(ctx, x + 20, 500, w - 40, 60, 10, '#2b3a66', 6); ctx.fillStyle = '#ffffff'; ctx.font = '700 40px Poppins'; ctx.textAlign = 'center'; ctx.fillText(signs[b % signs.length], x + w / 2, 545);
      for (let s = 0; s < 8; s++) { ctx.fillStyle = s % 2 ? '#ffffff' : ['#e05a4a', '#2ec27e', '#4c7bd0', '#ff8a00', '#7b5cff'][b]; ctx.beginPath(); ctx.moveTo(x + 20 + s * 45, 565); ctx.lineTo(x + 65 + s * 45, 565); ctx.lineTo(x + 70 + s * 45, 625); ctx.lineTo(x + 15 + s * 45, 625); ctx.fill(); }
      line(ctx, [[x + 20, 565], [x + w - 20, 565]], INK, 6);
      R(ctx, x + 30, 640, 220, 200, 6, hora === 'noche' ? '#ffe2a0' : '#d6efff', 7); R(ctx, x + 270, 630, 100, 210, 6, '#6b4a2b', 7); C(ctx, x + 350, 740, 7, '#ffd166', 3);
      for (let k = 0; k < 3; k++) R(ctx, x + 50 + k * 65, 760 - (k % 2) * 30, 45, 80 + (k % 2) * 30, 8, ['#ff8ab8', '#ffd166', '#4cc9f0'][k], 4); }
    ctx.fillStyle = '#cfd3db'; ctx.fillRect(0, 740, WW, 180); for (let i = 0; i < 20; i++) { ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(i * 110, 740, 4, 180); }
    ctx.fillStyle = '#8a8f9a'; ctx.fillRect(0, 920, WW, 22); ctx.fillStyle = '#4a4e5a'; ctx.fillRect(0, 942, WW, 140); for (let i = 0; i < 10; i++) { ctx.fillStyle = '#f2f2f2'; ctx.fillRect(i * 220 + ((t * 0) % 220), 1010, 120, 12); }
    if (gente && a) people(ctx, a, 800, gente, 0.11, 3, 0.9);
    R(ctx, 1500, 790, 50, 90, 16, '#e05a4a', 6); C(ctx, 1525, 790, 30, '#e05a4a', 6);
    return { gy };
  },
  // Avenida en perspectiva (plano de situación): edificios a los lados que se pierden hacia el fondo
  avenida(ctx, t, { hora = 'dia' } = {}) {
    sky(ctx, hora, 520, t); const vx = 960, vy = 470;
    for (let i = 0; i < 12; i++) { const x = 600 + i * 60, h = 120 + hash(i + 3) * 160; R(ctx, x, vy - h, 56, h, 2, hora === 'noche' ? '#2a2f55' : '#aab9d0', 0); }
    ctx.fillStyle = '#4a4e5a'; ctx.beginPath(); ctx.moveTo(vx - 30, vy); ctx.lineTo(vx + 30, vy); ctx.lineTo(1500, WH); ctx.lineTo(420, WH); ctx.fill();
    ctx.fillStyle = '#cfd3db'; ctx.beginPath(); ctx.moveTo(vx - 30, vy); ctx.lineTo(420, WH); ctx.lineTo(0, WH); ctx.lineTo(0, 1040); ctx.fill(); ctx.beginPath(); ctx.moveTo(vx + 30, vy); ctx.lineTo(1500, WH); ctx.lineTo(WW, WH); ctx.lineTo(WW, 1040); ctx.fill();
    for (let i = 0; i < 8; i++) { const k = i / 8, k2 = (i + 0.5) / 8, y1 = vy + (WH - vy) * k * k, y2 = vy + (WH - vy) * k2 * k2; ctx.fillStyle = '#f2f2f2'; ctx.beginPath(); ctx.moveTo(vx - 2 - 10 * k, y1); ctx.lineTo(vx + 2 + 10 * k, y1); ctx.lineTo(vx + 2 + 10 * k2, y2); ctx.lineTo(vx - 2 - 10 * k2, y2); ctx.fill(); }
    for (const side of [-1, 1]) for (let j = 0; j < 6; j++) { const k0 = j / 6, k1 = (j + 1) / 6, x0 = vx + side * (40 + 900 * k0 * k0), x1 = vx + side * (40 + 900 * k1 * k1), h0 = 60 + 900 * k0 * k0, h1 = 60 + 900 * k1 * k1; const col = ['#e9c49a', '#c97b5a', '#9fb3c8', '#d9d0c0', '#e0a96a', '#b9a3d6'][(j + (side > 0 ? 3 : 0)) % 6];
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x0, vy - h0 * 0.9); ctx.lineTo(x1, vy - h1 * 0.9); ctx.lineTo(x1, vy + (WH - vy) * k1 * k1 * 0.75 + 20); ctx.lineTo(x0, vy + (WH - vy) * k0 * k0 * 0.75 + 20); ctx.closePath(); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
      for (let r = 0; r < 4; r++) { const yy0 = vy - h0 * 0.9 + (h0 * 1.5) * (r + 0.3) / 5, yy1 = vy - h1 * 0.9 + (h1 * 1.5) * (r + 0.3) / 5, xa = x0 + (x1 - x0) * 0.2, xb = x0 + (x1 - x0) * 0.7; ctx.fillStyle = hora === 'noche' && hash(j * 7 + r + side) > 0.4 ? '#ffd76b' : 'rgba(191,230,255,0.9)'; ctx.beginPath(); ctx.moveTo(xa, yy0 + (yy1 - yy0) * 0.2); ctx.lineTo(xb, yy0 + (yy1 - yy0) * 0.7); ctx.lineTo(xb, yy0 + (yy1 - yy0) * 0.7 + (h0 + h1) * 0.08); ctx.lineTo(xa, yy0 + (yy1 - yy0) * 0.2 + (h0 + h1) * 0.08); ctx.fill(); } }
    for (const side of [-1, 1]) for (let j = 1; j < 6; j++) { const k = j / 6, x = vx + side * (120 + 760 * k * k), y = vy + (WH - vy) * k * k * 0.9 + 30; lamp(ctx, x, y, 40 + 500 * k * k, hora === 'noche', t); }
    return { gy: WH, vx, vy, at: (k) => ({ y: vy + (WH - vy) * k, s: k }) };
  },
  // Pasillo de instituto: taquillas a escala humana, puertas de aula, tablón, fluorescentes
  pasillo(ctx, t, { a = null, gente = 0 } = {}) {
    grad(ctx, '#f6ead2', '#efd9ae', 0, 820); for (let i = 0; i < 6; i++) { R(ctx, 80 + i * 330, 20, 220, 26, 10, '#ffffff', 4); glow(ctx, 190 + i * 330, 40, 220, '#fffbe0', 0.35); }
    R(ctx, 0, 190, WW, 16, 0, '#d9c49a', 0);
    for (let i = 0; i < 22; i++) { const x = i * 90 - 20; if (i === 7 || i === 15) { R(ctx, x, 170, 180, 650, 8, '#b5723a', 8); R(ctx, x + 40, 230, 100, 140, 6, '#d6efff', 5); C(ctx, x + 150, 520, 10, '#ffd166', 4); continue; } if (i === 8 || i === 16) continue;
      R(ctx, x + 4, 230, 84, 590, 6, i % 3 ? '#3f6cc0' : '#4a7bd0', 6); for (let v = 0; v < 4; v++) R(ctx, x + 22, 260 + v * 22, 48, 8, 3, '#2b3a66', 0); R(ctx, x + 66, 500, 10, 40, 4, '#d9d9de', 3); if (hash(i) > 0.7) R(ctx, x + 20, 380, 50, 60, 4, ['#ff8ab8', '#ffd166', '#2ec27e'][i % 3], 3); }
    R(ctx, 1150, 250, 260, 180, 8, '#c9a36a', 7); for (let k = 0; k < 5; k++) R(ctx, 1170 + (k % 3) * 80, 270 + Math.floor(k / 3) * 80, 60, 64, 3, ['#ffffff', '#ffd166', '#bfe6ff', '#ff8ab8', '#d9f5c9'][k], 3);
    grad(ctx, '#e3cfa1', '#c9a46e', 820, WH); for (let i = 0; i < 12; i++) line(ctx, [[960 + (i - 6) * 40, 820], [960 + (i - 6) * 420, WH]], 'rgba(0,0,0,0.08)', 4); ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(0, 840, WW, 18);
    if (gente && a) people(ctx, a, 820, gente, 0.13, 5, 0.85);
    return { gy: 980 };
  },
  // Aula: pizarra, ventanas, póster, reloj; pupitres por delante (usar fg.pupitres después de los personajes)
  aula(ctx, t, { hora = 'dia' } = {}) {
    grad(ctx, '#fff1d6', '#f7ddb0', 0, 800); R(ctx, 260, 140, 760, 380, 14, '#2f5d46', 12); R(ctx, 250, 520, 780, 20, 6, '#b5723a', 6); ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.font = '42px Poppins'; ctx.textAlign = 'left'; ctx.fillText('H2O + NaCl = ?', 310, 230); ctx.fillText('pH = 7', 310, 300); line(ctx, [[310, 360], [520, 330], [700, 400]], 'rgba(255,255,255,0.7)', 5);
    for (let i = 0; i < 2; i++) window_(ctx, 1200 + i * 330, 160, 240, 300, hora, t, '#f2c14e'); C(ctx, 140, 200, 60, '#ffffff', 7); line(ctx, [[140, 200], [140, 160]], INK, 6); line(ctx, [[140, 200], [168, 214]], INK, 6);
    R(ctx, 40, 320, 150, 200, 6, '#ffd1e8', 5); C(ctx, 115, 390, 40, '#4cc9f0', 4);
    grad(ctx, '#d9b07a', '#b8884f', 800, WH); for (let i = 0; i < 16; i++) line(ctx, [[i * 130, 800], [i * 130 - 200, WH]], 'rgba(0,0,0,0.07)', 4);
    for (let i = 0; i < 4; i++) { const x = 200 + i * 440; R(ctx, x, 690, 260, 24, 6, '#d9a066', 6); R(ctx, x + 20, 714, 16, 90, 4, '#6b4a2b', 4); R(ctx, x + 224, 714, 16, 90, 4, '#6b4a2b', 4); }
    return { gy: 990 };
  },
  // Oficina diáfana: ventanales con la ciudad, mesas con monitores, plantas, dispensador de agua
  oficina(ctx, t, { hora = 'dia' } = {}) {
    grad(ctx, '#eef3f8', '#dbe5ef', 0, 820); for (let i = 0; i < 5; i++) { const x = 60 + i * 380; R(ctx, x, 80, 330, 420, 8, hora === 'noche' ? '#1a1f45' : '#bfe6ff', 8); for (let b = 0; b < 4; b++) { ctx.fillStyle = hora === 'noche' ? '#2a2f66' : '#9fb7d6'; ctx.fillRect(x + 10 + b * 80, 300 - hash(i * 4 + b) * 150, 70, 200 + hash(i * 4 + b) * 150); } line(ctx, [[x + 165, 80], [x + 165, 500]], '#ffffff', 8); }
    R(ctx, 0, 500, WW, 24, 0, '#c9d3de', 0); grad(ctx, '#9aa4b5', '#7d8798', 820, WH);
    for (let i = 0; i < 4; i++) { const x = 140 + i * 460; R(ctx, x, 640, 330, 22, 6, '#f2f2f2', 6); R(ctx, x + 20, 662, 14, 160, 4, '#5b5f6b', 3); R(ctx, x + 296, 662, 14, 160, 4, '#5b5f6b', 3); R(ctx, x + 100, 520, 150, 110, 10, '#2f2f36', 6); R(ctx, x + 112, 532, 126, 84, 4, ['#4cc9f0', '#7b5cff', '#2ec27e', '#ffd166'][i], 0); R(ctx, x + 160, 630, 30, 14, 3, '#5b5f6b', 3); C(ctx, x + 290, 620, 18, '#ffffff', 4); }
    plant(ctx, 60, 820, 1.1, t); R(ctx, 1820, 560, 80, 260, 12, '#e6eef4', 6); R(ctx, 1830, 470, 60, 90, 20, '#bfe9ff', 5);
    return { gy: 990 };
  },
  // Salón: sofá, estantería con libros, lámpara de pie, ventana con cortinas, cuadros, alfombra
  salon(ctx, t, { hora = 'dia' } = {}) {
    grad(ctx, hora === 'noche' ? '#4a3d6a' : '#ffe6c9', hora === 'noche' ? '#3a2f55' : '#f6cfa4', 0, 830); window_(ctx, 1280, 150, 380, 420, hora, t, '#c94b6b');
    R(ctx, 80, 140, 360, 640, 8, '#8a5a34', 8); for (let s = 0; s < 4; s++) { R(ctx, 90, 280 + s * 150, 340, 14, 3, '#6b4a2b', 0); for (let b = 0; b < 8; b++) R(ctx, 100 + b * 40, 200 + s * 150 + (b % 3) * 8, 32, 80 - (b % 3) * 8, 3, ['#e05a4a', '#4c7bd0', '#2ec27e', '#ffd166', '#7b5cff'][(b + s) % 5], 3); }
    frame_(ctx, 560, 200, 220, 160, '#7cc8ff'); frame_(ctx, 820, 240, 160, 200, '#ffb8c8'); lamp(ctx, 1150, 830, 520, hora === 'noche', t);
    grad(ctx, '#b07a4a', '#8a5a34', 830, WH); E(ctx, 960, 960, 760, 90, hora === 'noche' ? '#6b2d55' : '#c94b6b', 0, 6);
    R(ctx, 500, 600, 700, 170, 50, '#5b6bd0', 9); R(ctx, 450, 700, 800, 150, 40, '#4f5ec0', 9); R(ctx, 420, 640, 110, 220, 40, '#5b6bd0', 9); R(ctx, 1170, 640, 110, 220, 40, '#5b6bd0', 9); R(ctx, 560, 640, 150, 100, 30, '#ffd166', 6); R(ctx, 990, 640, 150, 100, 30, '#ff8ab8', 6);
    return { gy: 1000 };
  },
  // Dormitorio: cama, mesilla con lámpara, pósteres, ventana
  dormitorio(ctx, t, { hora = 'noche' } = {}) {
    grad(ctx, hora === 'noche' ? '#2b2f5c' : '#ffe9d6', hora === 'noche' ? '#22264d' : '#fbd7b4', 0, 820); window_(ctx, 1300, 150, 340, 380, hora, t, '#7b9cff'); if (hora === 'noche') C(ctx, 1560, 240, 40, '#fff3c4', 0);
    R(ctx, 150, 180, 200, 280, 6, '#ff8ab8', 6); R(ctx, 400, 220, 180, 240, 6, '#4cc9f0', 6); C(ctx, 490, 340, 50, '#ffd166', 4);
    grad(ctx, hora === 'noche' ? '#3b3350' : '#c99a6b', hora === 'noche' ? '#2e2840' : '#b07a4a', 820, WH);
    R(ctx, 300, 560, 120, 300, 20, '#b5723a', 8); R(ctx, 300, 700, 900, 180, 30, '#ffffff', 9); R(ctx, 420, 720, 780, 200, 26, '#7b9cff', 9); R(ctx, 340, 650, 220, 110, 40, '#ffffff', 7);
    R(ctx, 1240, 700, 160, 160, 10, '#b5723a', 7); lamp(ctx, 1320, 700, 90, hora === 'noche', t);
    return { gy: 1000 };
  },
  // Parque: árboles en tres capas, camino, banco, farola, estanque, edificios al fondo
  parque(ctx, t, { hora = 'dia' } = {}) {
    sky(ctx, hora, 600, t); for (let i = 0; i < 10; i++) R(ctx, i * 200, 380 - hash(i) * 180, 180, 300, 4, hora === 'noche' ? '#2a2f55' : '#c9d6e6', 0);
    ctx.fillStyle = '#7fcf73'; ctx.fillRect(0, 560, WW, 600); for (let i = 0; i < 9; i++) tree(ctx, i * 230 - 40, 600, 0.45, t, '#5fae5a');
    E(ctx, 1500, 720, 380, 60, '#7cc8ff', 0, 6); for (let i = 0; i < 3; i++) E(ctx, 1400 + i * 90, 715, 40, 6, 'rgba(255,255,255,0.7)', 0, 0);
    ctx.fillStyle = '#e8d3a2'; ctx.beginPath(); ctx.moveTo(900, 600); ctx.lineTo(1020, 600); ctx.lineTo(1500, WH); ctx.lineTo(300, WH); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.stroke();
    tree(ctx, 150, 900, 1.1, t); tree(ctx, 1780, 920, 1.2, t, '#3f9150'); lamp(ctx, 1250, 900, 420, hora === 'noche', t);
    R(ctx, 380, 780, 380, 26, 8, '#b5723a', 6); R(ctx, 380, 820, 380, 26, 8, '#b5723a', 6); R(ctx, 400, 846, 20, 70, 4, '#3a3a44', 4); R(ctx, 720, 846, 20, 70, 4, '#3a3a44', 4);
    for (let i = 0; i < 30; i++) { const x = hash(i + 50) * WW, y = 900 + hash(i + 80) * 170; line(ctx, [[x, y], [x + 6, y - 22]], '#3f9150', 4); }
    return { gy: 960, banco: { x: 570, y: 846 } };
  },
  // Vagón de metro por dentro: asientos al fondo, ventanas con luces del túnel pasando, barras, anuncios, luz amarilla
  metro(ctx, t, { parpadeo = 0, vacio = true } = {}) {
    grad(ctx, '#6b6146', '#4a4330', 0, 860); R(ctx, 0, 60, WW, 90, 0, '#d9cf9a', 0); for (let i = 0; i < 6; i++) { R(ctx, 40 + i * 320, 70, 280, 70, 8, ['#ff8ab8', '#4cc9f0', '#ffd166', '#2ec27e', '#b67bff', '#ff8a65'][i], 4); }
    for (let i = 0; i < 6; i++) { const x = 30 + i * 320; R(ctx, x, 190, 280, 260, 30, '#0b0d16', 9); const q = (t * 1.8 + i * 0.31) % 1; ctx.fillStyle = 'rgba(255,215,130,0.8)'; ctx.fillRect(x + 280 - q * 300, 280, 80, 8); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(x + 20, 205, 60, 230); }
    R(ctx, 0, 560, WW, 130, 24, '#c07a2a', 8); R(ctx, 0, 680, WW, 160, 10, '#a3651f', 8); for (let i = 0; i < 12; i++) ctx.fillRect(i * 170, 560, 4, 130);
    for (let i = 0; i < 6; i++) { R(ctx, 140 + i * 330, 0, 16, 860, 8, '#d9d9de', 5); } line(ctx, [[0, 175], [WW, 175]], '#d9d9de', 12);
    grad(ctx, '#56565e', '#3e3e46', 840, WH); for (let i = 0; i < 14; i++) line(ctx, [[960 + (i - 7) * 60, 840], [960 + (i - 7) * 300, WH]], 'rgba(0,0,0,0.12)', 4);
    const lit = 0.85 + 0.15 * Math.sin(t * 40) * parpadeo - (parpadeo && Math.floor(t * 7) % 5 === 0 ? 0.5 : 0); ctx.fillStyle = `rgba(0,0,0,${clamp(1 - lit) * 0.8})`; ctx.fillRect(0, 0, WW, WH); glow(ctx, 960, 60, 1100, '#ffd76b', 0.18);
    return { gy: 1010, asiento: 660 };
  },
  // Playa de noche/día: mar con oleaje, arena, luna o sol
  playa(ctx, t, { hora = 'noche' } = {}) {
    sky(ctx, hora, 620, t); ctx.fillStyle = hora === 'noche' ? '#1d3a6a' : '#3a8fd6'; ctx.fillRect(0, 520, WW, 300);
    for (let i = 0; i < 6; i++) { ctx.strokeStyle = 'rgba(191,233,255,0.5)'; ctx.lineWidth = 5; ctx.beginPath(); for (let x = 0; x <= WW; x += 40) { const y = 550 + i * 45 + Math.sin(x / 110 + t * 2 + i) * 7; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
    ctx.fillStyle = '#f6f2e6'; ctx.beginPath(); ctx.moveTo(0, 810); for (let x = 0; x <= WW; x += 40) ctx.lineTo(x, 810 + Math.sin(x / 90 + t * 2.4) * 10); ctx.lineTo(WW, 850); ctx.lineTo(0, 850); ctx.fill();
    grad(ctx, '#e8cf8f', '#c9ad6a', 830, WH); for (let i = 0; i < 40; i++) C(ctx, hash(i) * WW, 860 + hash(i + 3) * 200, 3, 'rgba(0,0,0,0.15)', 0);
    return { gy: 990, mar: 520 };
  },
};

// ---------------- PRIMER TÉRMINO (dibujar DESPUÉS de los personajes: da profundidad) ----------------
export const fg = {
  farola(ctx, x, t, on = false) { lamp(ctx, x, WH + 40, 900, on, t); },
  planta(ctx, x, t) { plant(ctx, x, WH + 60, 2.2, t); },
  arbol(ctx, x, t) { tree(ctx, x, WH + 120, 1.9, t, '#3f9150'); },
  pupitres(ctx) { for (let i = 0; i < 3; i++) { const x = -60 + i * 820; R(ctx, x, 900, 560, 40, 10, '#d9a066', 8); R(ctx, x + 30, 940, 24, 200, 4, '#6b4a2b', 5); R(ctx, x + 506, 940, 24, 200, 4, '#6b4a2b', 5); R(ctx, x + 120, 860, 120, 40, 4, '#ffffff', 4); } },
  mesa(ctx, x, y, w = 520) { R(ctx, x - w / 2, y, w, 40, 10, '#d9a066', 8); R(ctx, x - w / 2 + 30, y + 40, 24, 300, 4, '#6b4a2b', 5); R(ctx, x + w / 2 - 54, y + 40, 24, 300, 4, '#6b4a2b', 5); },
  barra(ctx, x) { R(ctx, x - 14, 0, 28, WH, 10, '#e6e6ea', 7); },
  borroso(ctx, x, col = 'rgba(30,30,40,0.55)') { ctx.save(); ctx.filter = 'blur(10px)'; ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x, WH, 260, 420, 0, 0, 7); ctx.fill(); ctx.restore(); },
};
