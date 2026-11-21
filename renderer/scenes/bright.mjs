// PROTOTIPO de estilo "luminoso": escenarios de día con mucho detalle y el personaje en plano medio haciendo algo.
// Estilo propio (personajes del canal con su persona/look), inspirado en lo que funciona: color, detalle y acción.
import { W, H, rr, radial, clamp, noise1, ease } from '../lib/util.mjs';
import { personaWho, drawHead } from '../lib/persona.mjs';

const INK = '#1c1a2b';

function outline(ctx, w = 10) { ctx.lineWidth = w; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.stroke(); }
function box(ctx, x, y, w, h, r, fill, lw = 8) { rr(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill(); outline(ctx, lw); }

// ---------------- Fondos ----------------
export function roomDay(ctx, t, { wall = '#f3d9b1', accent = '#2f9e8f', floor = 'tiles' } = {}) {
  ctx.fillStyle = wall; ctx.fillRect(0, 0, W, H);
  // friso inferior de la pared
  ctx.fillStyle = '#e9c48e'; ctx.fillRect(0, 1180, W, 120);
  ctx.fillStyle = INK; ctx.fillRect(0, 1176, W, 8);
  // ventana con cielo y nubes
  box(ctx, 640, 300, 360, 430, 18, '#8fd3ff', 10);
  ctx.save(); rr(ctx, 645, 305, 350, 420, 14); ctx.clip();
  const g = ctx.createLinearGradient(0, 300, 0, 730); g.addColorStop(0, '#6cc4ff'); g.addColorStop(1, '#c9ecff'); ctx.fillStyle = g; ctx.fillRect(640, 300, 360, 430);
  ctx.fillStyle = '#ffffff';
  for (const [x, y, s] of [[700, 420, 1], [880, 380, 0.8], [800, 560, 1.1]]) {
    const dx = ((t * 12 + x) % 460) + 560;
    for (const [ox, oy, r] of [[0, 0, 38], [40, -16, 46], [86, 0, 36]]) { ctx.beginPath(); ctx.arc(dx + ox * s, y + oy * s, r * s, 0, 7); ctx.fill(); }
  }
  ctx.fillStyle = '#7bc96f'; ctx.beginPath(); ctx.ellipse(820, 760, 260, 90, 0, 0, 7); ctx.fill();
  ctx.restore();
  ctx.fillStyle = INK; ctx.fillRect(815, 300, 10, 430); ctx.fillRect(640, 510, 360, 10);
  box(ctx, 610, 725, 420, 34, 8, '#ffffff', 8);
  // puerta
  box(ctx, 60, 520, 300, 680, 14, accent, 10);
  box(ctx, 100, 570, 220, 250, 10, '#3fb8a6', 6); box(ctx, 100, 860, 220, 290, 10, '#3fb8a6', 6);
  ctx.beginPath(); ctx.arc(320, 870, 16, 0, 7); ctx.fillStyle = '#ffd34a'; ctx.fill(); outline(ctx, 5);
  // cuadro
  box(ctx, 420, 360, 170, 140, 6, '#fff7e6', 8);
  ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(450, 470); ctx.lineTo(500, 400); ctx.lineTo(540, 450); ctx.lineTo(565, 420); ctx.stroke();
  ctx.beginPath(); ctx.arc(555, 395, 14, 0, 7); ctx.fillStyle = '#ffb347'; ctx.fill();
  // estantería con libros
  box(ctx, 400, 560, 210, 26, 6, '#c98a4b', 6);
  ['#e85d5d', '#5d8de8', '#f2c94c', '#6fcf97', '#bb6bd9'].forEach((c, i) => box(ctx, 412 + i * 36, 468 + (i % 2) * 14, 30, 92 - (i % 2) * 14, 4, c, 5));
  // lámpara de techo
  ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(540, 0); ctx.lineTo(540, 150); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(470, 230); ctx.lineTo(610, 230); ctx.lineTo(570, 150); ctx.lineTo(510, 150); ctx.closePath(); ctx.fillStyle = '#ff8a5b'; ctx.fill(); outline(ctx, 7);
  radial(ctx, 540, 260, 240, '#fff4c2', 0.35);
  // planta
  box(ctx, 900, 1080, 120, 120, 16, '#d9774b', 8);
  ctx.fillStyle = '#3e9c57';
  for (let i = 0; i < 6; i++) { const a = -2.6 + i * 0.42 + Math.sin(t * 1.4 + i) * 0.04; ctx.save(); ctx.translate(960, 1085); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(0, -90, 34, 100, 0, 0, 7); ctx.fill(); outline(ctx, 6); ctx.restore(); }
  // suelo
  if (floor === 'tiles') {
    for (let y = 1300; y < H; y += 110) for (let x = -((y / 110) % 2) * 60; x < W; x += 120) { ctx.fillStyle = ((x / 120 + y / 110) | 0) % 2 ? '#2c2c38' : '#f4f1ea'; ctx.fillRect(x, y, 120, 110); }
  } else { ctx.fillStyle = '#c98a4b'; ctx.fillRect(0, 1300, W, H - 1300); ctx.strokeStyle = '#a8703a'; ctx.lineWidth = 4; for (let y = 1340; y < H; y += 70) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); } }
  ctx.fillStyle = INK; ctx.fillRect(0, 1296, W, 8);
}

export function streetDay(ctx, t) {
  const g = ctx.createLinearGradient(0, 0, 0, 900); g.addColorStop(0, '#5ab8ff'); g.addColorStop(1, '#bfe6ff'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  radial(ctx, 860, 180, 200, '#fff6c8', 0.8);
  const facades = [['#ff9f68', 0, 420], ['#ffd166', 230, 300], ['#7bdff2', 440, 380], ['#f28482', 650, 260], ['#b8f2a8', 860, 360]];
  for (const [c, x, top] of facades) {
    box(ctx, x - 10, top, 240, 1300 - top, 6, c, 8);
    for (let wy = top + 60; wy < 1180; wy += 170) for (const wx of [x + 25, x + 125]) {
      box(ctx, wx, wy, 70, 100, 8, '#e6f7ff', 6);
      ctx.fillStyle = INK; ctx.fillRect(wx + 33, wy, 4, 100);
    }
    box(ctx, x + 70, 1140, 90, 160, 8, '#6b4f3a', 7);
  }
  // guirnaldas
  for (const [y0, cols] of [[140, ['#ff5d8f', '#ffd166', '#06d6a0', '#118ab2']], [260, ['#ef476f', '#ffd166', '#8338ec']]]) {
    ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, y0); ctx.quadraticCurveTo(W / 2, y0 + 80, W, y0); ctx.stroke();
    for (let i = 0; i < 14; i++) {
      const x = 30 + i * 76, y = y0 + Math.sin((x / W) * Math.PI) * 40 + 4, sw = Math.sin(t * 3 + i) * 4;
      ctx.beginPath(); ctx.moveTo(x - 24, y); ctx.lineTo(x + 24, y); ctx.lineTo(x + sw, y + 50); ctx.closePath(); ctx.fillStyle = cols[i % cols.length]; ctx.fill(); outline(ctx, 4);
    }
  }
  // acera y calle
  ctx.fillStyle = '#d6d2c4'; ctx.fillRect(0, 1300, W, 120); ctx.fillStyle = INK; ctx.fillRect(0, 1296, W, 8);
  ctx.fillStyle = '#4a4e5a'; ctx.fillRect(0, 1420, W, H - 1420);
  ctx.fillStyle = '#ffffff'; for (let x = -((t * 300) % 240); x < W; x += 240) ctx.fillRect(x, 1640, 130, 22);
}

// ---------------- Personaje en plano medio con objeto en la mano ----------------
function drawProp(ctx, prop, t) {
  if (prop === 'phone') { box(ctx, -60, -120, 120, 220, 18, '#2b2f3a', 8); ctx.fillStyle = '#6ad1ff'; rr(ctx, -46, -104, 92, 176, 10); ctx.fill(); radial(ctx, 0, -10, 140, '#6ad1ff', 0.25); }
  else if (prop === 'money') { for (let i = 0; i < 4; i++) { ctx.save(); ctx.rotate(-0.3 + i * 0.18); box(ctx, -90, -50, 180, 90, 8, '#8fd18b', 6); ctx.fillStyle = '#4e9a52'; ctx.beginPath(); ctx.arc(0, -5, 22, 0, 7); ctx.fill(); ctx.restore(); } }
  else if (prop === 'cup') { box(ctx, -55, -90, 110, 130, 14, '#ffffff', 8); ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(60, -30, 30, -1.2, 1.2); ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-10, -110 - (t * 40) % 40); ctx.quadraticCurveTo(10, -140, -5, -170); ctx.stroke(); }
  else if (prop === 'book') { box(ctx, -110, -80, 220, 150, 10, '#e85d5d', 8); ctx.fillStyle = '#fff'; ctx.fillRect(-4, -80, 8, 150); }
}

export function midShot(ctx, who, { x = W / 2, y = 820, s = 0.95, mood = 'neutral', prop = 'phone', t = 0, seed = 0 } = {}) {
  const skin = who.skin.light;
  ctx.save(); ctx.translate(x, y + Math.sin(t * 1.6) * 6); ctx.scale(s, s);
  // torso
  ctx.beginPath(); ctx.moveTo(-330, 1300); ctx.lineTo(-300, 420); ctx.quadraticCurveTo(-290, 300, -150, 290); ctx.lineTo(150, 290);
  ctx.quadraticCurveTo(290, 300, 300, 420); ctx.lineTo(330, 1300); ctx.closePath(); ctx.fillStyle = who.outfit; ctx.fill(); outline(ctx, 12);
  ctx.beginPath(); ctx.moveTo(-90, 292); ctx.lineTo(0, 400); ctx.lineTo(90, 292); ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fill();
  // brazos como trazos gruesos con contorno: izquierdo cuelga; derecho doblado con el objeto delante del pecho
  const limb = (pts, color, w) => {
    for (const [lw, c] of [[w + 22, INK], [w, color]]) {
      ctx.lineWidth = lw; ctx.strokeStyle = c; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.stroke();
    }
  };
  const sway = Math.sin(t * 2) * 8;
  limb([[-270, 420], [-320, 760]], who.outfit, 120); limb([[-320, 760], [-300, 980]], skin, 104);
  ctx.beginPath(); ctx.ellipse(-300, 1010, 64, 72, 0, 0, 7); ctx.fillStyle = skin; ctx.fill(); outline(ctx, 10);
  limb([[270, 420], [340, 760]], who.outfit, 120); limb([[340, 760], [130 + sway, 640]], skin, 104);
  ctx.save(); ctx.translate(110 + sway, 560); ctx.rotate(-0.15);
  drawProp(ctx, prop, t);
  ctx.restore();
  ctx.beginPath(); ctx.ellipse(130 + sway, 650, 66, 58, 0, 0, 7); ctx.fillStyle = skin; ctx.fill(); outline(ctx, 10);
  // cabeza con contorno
  ctx.beginPath(); ctx.ellipse(0, 0, 242, 292, 0, 0, 7); ctx.fillStyle = INK; ctx.fill();
  drawHead(ctx, 0, 0, who, { mood, t, blinkSeed: seed });
  ctx.restore();
}

// Escenas de prueba (aún no están en el catálogo)
export const room_day = {
  setup(p, r) { return { seed: r.int(0, 99) }; },
  draw(ctx, s, { t, params, seed }) {
    roomDay(ctx, t, params);
    midShot(ctx, personaWho(seed, params), { mood: params.mood, prop: params.prop || 'phone', t, seed: s.seed });
  },
};
export const street_day = {
  setup(p, r) { return { seed: r.int(0, 99) }; },
  draw(ctx, s, { t, params, seed }) {
    streetDay(ctx, t);
    midShot(ctx, personaWho(seed, params), { x: W / 2 - 40, mood: params.mood, prop: params.prop || 'cup', t, seed: s.seed });
  },
};
