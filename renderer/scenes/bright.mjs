// ESTILO LUMINOSO AMBIENTADO: escenarios con mucho detalle y contornos de dibujo animado, según el lugar y la hora
// (día / atardecer / noche), con la persona del vídeo en plano medio haciendo algo, de cuerpo entero o sin persona.
// Escena principal: "escena" { lugar, hora, plano, who, mood, objeto, label }.
import { W, H, rr, radial, clamp, noise1 } from '../lib/util.mjs';
import { personaWho, drawHead, drawFullBody } from '../lib/persona.mjs';
import { brightBg, BG_CONTEXT } from '../lib/brightbg.mjs';
import { ambientBack, ambientFront } from '../lib/ambient.mjs';

const INK = '#1c1a2b';
function outline(ctx, w = 10) { ctx.lineWidth = w; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.stroke(); }
function box(ctx, x, y, w, h, r, fill, lw = 8) { rr(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill(); if (lw) outline(ctx, lw); }
function circ(ctx, x, y, r, fill, lw = 0) { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = fill; ctx.fill(); if (lw) outline(ctx, lw); }
function poly(ctx, pts, fill, lw = 0) { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); if (lw) outline(ctx, lw); }

// ---------------- Cielo según la hora ----------------
const SKY = {
  dia: ['#5ab8ff', '#bfe6ff'], atardecer: ['#5b4b9a', '#ff9e6b'], noche: ['#0b1238', '#2a3470'],
};
function sky(ctx, x, y, w, h, hora, t) {
  const [a, b] = SKY[hora] || SKY.dia;
  const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, a); g.addColorStop(1, b);
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  if (hora === 'noche') {
    for (let i = 0; i < 70; i++) { ctx.fillStyle = `rgba(255,255,255,${0.4 + 0.5 * Math.abs(Math.sin(t * 2 + i))})`; ctx.fillRect(x + (i * 137) % w, y + (i * 61) % (h * 0.8), 3, 3); }
    circ(ctx, x + w * 0.78, y + h * 0.22, Math.min(70, w * 0.12), '#fff4d6'); radial(ctx, x + w * 0.78, y + h * 0.22, 200, '#fff4d6', 0.25);
  } else {
    if (hora === 'atardecer') { circ(ctx, x + w * 0.7, y + h * 0.75, Math.min(110, w * 0.18), '#ffd27a'); radial(ctx, x + w * 0.7, y + h * 0.75, 380, '#ffb36b', 0.45); }
    else { radial(ctx, x + w * 0.85, y + h * 0.15, 220, '#fff6c8', 0.7); }
    ctx.fillStyle = hora === 'atardecer' ? 'rgba(255,220,200,0.85)' : '#ffffff';
    for (const [cx, cy, s] of [[0.15, 0.25, 1], [0.55, 0.15, 0.8], [0.4, 0.45, 1.1]]) {
      const dx = x + ((t * 14 + cx * w) % (w + 260)) - 130, yy = y + cy * h;
      for (const [ox, oy, r] of [[0, 0, 38], [40, -16, 46], [86, 0, 36]]) circ(ctx, dx + ox * s, yy + oy * s, r * s, ctx.fillStyle);
    }
  }
  ctx.restore();
}
// Luz de la hora sobre toda la escena
function grade(ctx, hora) {
  if (hora === 'noche') {
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgb(135,145,205)'; ctx.fillRect(0, 0, W, H); ctx.restore();
  } else if (hora === 'atardecer') {
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgb(255,214,180)'; ctx.fillRect(0, 0, W, H); ctx.restore();
  }
}
function windowFrame(ctx, x, y, w, h, hora, t) {
  box(ctx, x, y, w, h, 16, '#ffffff', 10);
  sky(ctx, x + 6, y + 6, w - 12, h - 12, hora, t);
  ctx.fillStyle = INK; ctx.fillRect(x + w / 2 - 5, y, 10, h); ctx.fillRect(x, y + h / 2 - 5, w, 10);
  box(ctx, x - 20, y + h - 4, w + 40, 30, 8, '#ffffff', 8);
}
function lamp(ctx, x, hora, color = '#ff8a5b') {
  ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 150); ctx.stroke();
  poly(ctx, [[x - 70, 230], [x + 70, 230], [x + 30, 150], [x - 30, 150]], color, 7);
  radial(ctx, x, 270, hora === 'noche' ? 420 : 240, '#fff1b8', hora === 'noche' ? 0.55 : 0.3);
}
function plant(ctx, x, y, t, s = 1) {
  box(ctx, x - 60 * s, y, 120 * s, 120 * s, 16, '#d9774b', 8);
  for (let i = 0; i < 6; i++) { const a = -2.6 + i * 0.42 + Math.sin(t * 1.4 + i) * 0.04; ctx.save(); ctx.translate(x, y + 5); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(0, -90 * s, 34 * s, 100 * s, 0, 0, 7); ctx.fillStyle = '#3e9c57'; ctx.fill(); outline(ctx, 6); ctx.restore(); }
}
function floorTiles(ctx, y, a = '#f4f1ea', b = '#2c2c38', step = 120) {
  for (let yy = y; yy < H; yy += step - 10) for (let x = -(((yy - y) / (step - 10)) % 2) * (step / 2); x < W; x += step) { ctx.fillStyle = (((x + 1000) / step + (yy - y) / (step - 10)) | 0) % 2 ? b : a; ctx.fillRect(x, yy, step, step - 10); }
  ctx.fillStyle = INK; ctx.fillRect(0, y - 4, W, 8);
}
function floorWood(ctx, y, c = '#c98a4b') { ctx.fillStyle = c; ctx.fillRect(0, y, W, H - y); ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 4; for (let yy = y + 40; yy < H; yy += 70) { ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(W, yy); ctx.stroke(); } ctx.fillStyle = INK; ctx.fillRect(0, y - 4, W, 8); }
function wall(ctx, c, trim) { ctx.fillStyle = c; ctx.fillRect(0, 0, W, H); if (trim) { ctx.fillStyle = trim; ctx.fillRect(0, 1180, W, 120); ctx.fillStyle = INK; ctx.fillRect(0, 1176, W, 8); } }

// ---------------- Lugares ----------------
const PLACES = {
  salon(ctx, t, h) {
    wall(ctx, '#f3d9b1', '#e9c48e'); windowFrame(ctx, 640, 300, 360, 430, h, t);
    box(ctx, 60, 520, 300, 680, 14, '#2f9e8f', 10); box(ctx, 100, 570, 220, 250, 10, '#3fb8a6', 6); box(ctx, 100, 860, 220, 290, 10, '#3fb8a6', 6); circ(ctx, 320, 870, 16, '#ffd34a', 5);
    box(ctx, 420, 360, 170, 140, 6, '#fff7e6', 8); ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(450, 470); ctx.lineTo(500, 400); ctx.lineTo(540, 450); ctx.lineTo(565, 420); ctx.stroke();
    box(ctx, 400, 560, 210, 26, 6, '#c98a4b', 6); ['#e85d5d', '#5d8de8', '#f2c94c', '#6fcf97', '#bb6bd9'].forEach((c, i) => box(ctx, 412 + i * 36, 468 + (i % 2) * 14, 30, 92 - (i % 2) * 14, 4, c, 5));
    lamp(ctx, 540, h); plant(ctx, 960, 1080, t); floorTiles(ctx, 1300);
  },
  dormitorio(ctx, t, h) {
    wall(ctx, '#cfe0f5', null); windowFrame(ctx, 80, 280, 330, 420, h, t);
    box(ctx, 520, 300, 220, 300, 8, '#ffd166', 8); circ(ctx, 630, 420, 60, '#ef476f', 6); // póster
    box(ctx, 120, 980, 860, 260, 30, '#8e7dbe', 10); box(ctx, 140, 900, 260, 120, 40, '#ffffff', 8); box(ctx, 420, 900, 240, 120, 40, '#ffffff', 8); // cama
    box(ctx, 100, 760, 60, 480, 20, '#a0522d', 8); box(ctx, 940, 760, 60, 480, 20, '#a0522d', 8);
    box(ctx, 830, 760, 160, 140, 10, '#c98a4b', 8); poly(ctx, [[860, 760], [960, 760], [935, 680], [885, 680]], '#ffe08a', 6); radial(ctx, 910, 720, 200, '#fff1b8', h === 'noche' ? 0.6 : 0.2);
    floorWood(ctx, 1240, '#b07a4a'); box(ctx, 200, 1400, 680, 220, 100, '#ef8fa5', 8);
  },
  cocina(ctx, t, h) {
    wall(ctx, '#fff3d6', null);
    for (let y = 560; y < 1000; y += 60) for (let x = 0; x < W; x += 60) { ctx.fillStyle = ((x + y) / 60) % 2 ? '#d8f0ee' : '#ffffff'; ctx.fillRect(x, y, 58, 58); }
    windowFrame(ctx, 380, 260, 320, 280, h, t);
    box(ctx, 40, 200, 300, 260, 10, '#6fb3a8', 8); box(ctx, 740, 200, 300, 260, 10, '#6fb3a8', 8);
    box(ctx, 0, 1000, W, 80, 0, '#c98a4b', 10); box(ctx, 20, 1080, 1040, 260, 10, '#6fb3a8', 8);
    for (const x of [60, 320, 580, 840]) circ(ctx, x + 100, 1210, 12, '#ffd34a', 4);
    box(ctx, 160, 900, 200, 100, 30, '#555b6e', 8); box(ctx, 130, 880, 260, 30, 10, '#3a3f4e', 6); // olla
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 8; for (let i = 0; i < 3; i++) { const yy = 860 - ((t * 60 + i * 40) % 120); ctx.beginPath(); ctx.moveTo(220 + i * 40, yy); ctx.quadraticCurveTo(240 + i * 40, yy - 30, 220 + i * 40, yy - 60); ctx.stroke(); }
    box(ctx, 820, 620, 200, 380, 20, '#e9eef5', 8); ctx.fillStyle = INK; ctx.fillRect(820, 760, 200, 8);
    floorTiles(ctx, 1340, '#fdf6e3', '#e85d5d', 100);
  },
  oficina(ctx, t, h) {
    wall(ctx, '#e7ecef', '#cfd8dc');
    windowFrame(ctx, 620, 240, 400, 420, h, t); for (let y = 260; y < 640; y += 30) { ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(630, y, 380, 10); }
    box(ctx, 80, 300, 380, 300, 10, '#c98a4b', 8); for (let i = 0; i < 2; i++) { ctx.fillStyle = INK; ctx.fillRect(80, 400 + i * 100, 380, 8); }
    ['#e85d5d', '#5d8de8', '#f2c94c', '#6fcf97', '#bb6bd9', '#ff9f68'].forEach((c, i) => box(ctx, 100 + i * 55, 320, 40, 78, 4, c, 4));
    circ(ctx, 270, 760, 90, '#ffffff', 8); ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(270, 760); ctx.lineTo(270 + Math.cos(t) * 60, 760 + Math.sin(t) * 60); ctx.moveTo(270, 760); ctx.lineTo(310, 720); ctx.stroke();
    box(ctx, 0, 1150, W, 60, 0, '#8d6e63', 10); box(ctx, 640, 900, 300, 220, 14, '#2b2f3a', 8); box(ctx, 660, 920, 260, 170, 8, '#6ad1ff', 0); box(ctx, 760, 1120, 60, 40, 4, '#2b2f3a', 6);
    plant(ctx, 120, 1030, t, 0.9); floorWood(ctx, 1320, '#9e9e9e');
  },
  aula(ctx, t, h) {
    wall(ctx, '#fde2b8', '#f6c88e');
    box(ctx, 120, 280, 840, 460, 14, '#2f6b4f', 12); ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(200, 400); ctx.lineTo(420, 400); ctx.moveTo(200, 480); ctx.lineTo(360, 480); ctx.stroke(); ctx.beginPath(); ctx.arc(700, 500, 110, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(600, 500); ctx.lineTo(800, 500); ctx.stroke();
    box(ctx, 120, 740, 840, 24, 6, '#c98a4b', 6);
    circ(ctx, 960, 180, 60, '#ffffff', 7);
    for (const x of [60, 420, 780]) { box(ctx, x, 1150, 260, 40, 6, '#e2a65a', 7); box(ctx, x + 20, 1190, 24, 140, 4, '#555', 0); box(ctx, x + 216, 1190, 24, 140, 4, '#555', 0); }
    floorWood(ctx, 1320, '#d7a86e');
  },
  hospital(ctx, t, h) {
    wall(ctx, '#d6efe6', '#bfe3d6'); windowFrame(ctx, 90, 260, 320, 380, h, t);
    ctx.fillStyle = '#9ccfe0'; for (let x = 520; x < 1040; x += 60) { ctx.beginPath(); ctx.moveTo(x, 200); ctx.quadraticCurveTo(x + 30, 700, x, 1180); ctx.lineTo(x + 50, 1180); ctx.quadraticCurveTo(x + 80, 700, x + 50, 200); ctx.fill(); }
    ctx.fillStyle = INK; ctx.fillRect(500, 190, 560, 10);
    box(ctx, 700, 300, 260, 190, 14, '#2b2f3a', 8); ctx.strokeStyle = '#3dff8a'; ctx.lineWidth = 5; ctx.beginPath();
    for (let x = 0; x <= 230; x += 5) { const ph = ((x / 230) * 2 + t) % 1; ctx.lineTo(715 + x, 400 + (ph > 0.45 && ph < 0.5 ? -50 : ph > 0.5 && ph < 0.55 ? 35 : 0)); } ctx.stroke();
    ctx.strokeStyle = '#9aa6b2'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(560, 320); ctx.lineTo(560, 1180); ctx.stroke(); box(ctx, 515, 330, 90, 140, 30, 'rgba(200,230,255,0.9)', 6);
    floorTiles(ctx, 1300, '#f2f7f5', '#cfe3dc');
  },
  calle(ctx, t, h) {
    sky(ctx, 0, 0, W, 900, h, t);
    const lit = h === 'noche';
    for (const [c, x, top] of [['#ff9f68', 0, 420], ['#ffd166', 230, 300], ['#7bdff2', 440, 380], ['#f28482', 650, 260], ['#b8f2a8', 860, 360]]) {
      box(ctx, x - 10, top, 240, 1300 - top, 6, c, 8);
      for (let wy = top + 60; wy < 1180; wy += 170) for (const wx of [x + 25, x + 125]) { box(ctx, wx, wy, 70, 100, 8, lit && noise1(wx + wy, 2) > 0.35 ? '#ffe08a' : '#e6f7ff', 6); ctx.fillStyle = INK; ctx.fillRect(wx + 33, wy, 4, 100); }
      box(ctx, x + 70, 1140, 90, 160, 8, '#6b4f3a', 7);
    }
    for (const [y0, cols] of [[140, ['#ff5d8f', '#ffd166', '#06d6a0', '#118ab2']], [260, ['#ef476f', '#ffd166', '#8338ec']]]) {
      ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, y0); ctx.quadraticCurveTo(W / 2, y0 + 80, W, y0); ctx.stroke();
      for (let i = 0; i < 14; i++) { const x = 30 + i * 76, y = y0 + Math.sin((x / W) * Math.PI) * 40 + 4, sw = Math.sin(t * 3 + i) * 4; poly(ctx, [[x - 24, y], [x + 24, y], [x + sw, y + 50]], cols[i % cols.length], 4); }
    }
    ctx.fillStyle = '#d6d2c4'; ctx.fillRect(0, 1300, W, 120); ctx.fillStyle = INK; ctx.fillRect(0, 1296, W, 8);
    ctx.fillStyle = '#4a4e5a'; ctx.fillRect(0, 1420, W, H - 1420); ctx.fillStyle = '#ffffff'; for (let x = -((t * 300) % 240); x < W; x += 240) ctx.fillRect(x, 1640, 130, 22);
    if (lit) for (const x of [150, 930]) { ctx.fillStyle = INK; ctx.fillRect(x - 6, 980, 12, 330); circ(ctx, x, 980, 26, '#ffe08a', 5); radial(ctx, x, 1000, 260, '#ffe08a', 0.35); }
  },
  ciudad(ctx, t, h) {
    sky(ctx, 0, 0, W, 1250, h, t); const lit = h === 'noche';
    for (const [x, w, top, c] of [[-20, 200, 520, '#7aa2c8'], [170, 170, 360, '#9bb7d4'], [330, 240, 240, '#5d7fa8'], [560, 180, 420, '#a9c1dd'], [730, 230, 300, '#6d8fb8'], [950, 160, 480, '#8fb0d2']]) {
      box(ctx, x, top, w, 1300 - top, 4, c, 8);
      for (let y = top + 40; y < 1250; y += 70) for (let xx = x + 22; xx < x + w - 30; xx += 50) { ctx.fillStyle = lit && noise1(xx * 3 + y, 5) > 0.45 ? '#ffe08a' : 'rgba(255,255,255,0.55)'; ctx.fillRect(xx, y, 26, 36); }
    }
    ctx.fillStyle = '#7bc96f'; ctx.fillRect(0, 1300, W, H - 1300); ctx.fillStyle = INK; ctx.fillRect(0, 1296, W, 8);
    for (const x of [120, 420, 760, 980]) { ctx.fillStyle = '#6b4f3a'; ctx.fillRect(x - 12, 1330, 24, 130); circ(ctx, x, 1300, 90, '#3e9c57', 7); }
    ctx.fillStyle = '#e8dcc0'; ctx.fillRect(0, 1560, W, 140);
  },
  campo(ctx, t, h) {
    sky(ctx, 0, 0, W, 1150, h, t);
    ctx.beginPath(); ctx.moveTo(0, 1050); ctx.quadraticCurveTo(300, 880, 620, 1020); ctx.quadraticCurveTo(860, 1120, W, 980); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fillStyle = '#8fd16f'; ctx.fill(); outline(ctx, 8);
    ctx.beginPath(); ctx.moveTo(0, 1250); ctx.quadraticCurveTo(500, 1120, W, 1260); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fillStyle = '#6fbf58'; ctx.fill(); outline(ctx, 8);
    for (const [x, y, s] of [[160, 1000, 1], [880, 960, 0.8]]) { ctx.fillStyle = '#6b4f3a'; ctx.fillRect(x - 14 * s, y, 28 * s, 140 * s); circ(ctx, x, y - 40 * s, 110 * s, '#3e9c57', 7); }
    for (let x = 0; x < W; x += 90) { box(ctx, x, 1300, 16, 110, 3, '#e2c08d', 4); } box(ctx, 0, 1320, W, 14, 3, '#e2c08d', 4); box(ctx, 0, 1370, W, 14, 3, '#e2c08d', 4);
    for (let i = 0; i < 26; i++) circ(ctx, (i * 97) % W, 1460 + (i * 53) % 400, 10, ['#ff5d8f', '#ffd166', '#ffffff'][i % 3]);
  },
  desierto(ctx, t, h) {
    sky(ctx, 0, 0, W, 1100, h === 'dia' ? 'dia' : h, t);
    if (h === 'dia') { circ(ctx, 820, 260, 110, '#fff1a8'); radial(ctx, 820, 260, 420, '#fff1a8', 0.5); }
    for (const [y, c, a] of [[980, '#f0c27b', 0], [1120, '#e7a95c', 2], [1300, '#d98c45', 4]]) { ctx.beginPath(); ctx.moveTo(0, y); for (let x = 0; x <= W; x += 40) ctx.lineTo(x, y - Math.sin(x / 260 + a) * 60); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fillStyle = c; ctx.fill(); outline(ctx, 7); }
    const cactus = (x, y, s) => { box(ctx, x - 30 * s, y - 260 * s, 60 * s, 260 * s, 30 * s, '#4caf6e', 7); box(ctx, x - 100 * s, y - 190 * s, 50 * s, 120 * s, 25 * s, '#4caf6e', 7); box(ctx, x + 50 * s, y - 220 * s, 50 * s, 120 * s, 25 * s, '#4caf6e', 7); };
    cactus(180, 1200, 1); cactus(900, 1100, 0.7);
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; for (let i = 0; i < 4; i++) ctx.fillRect(0, 900 + i * 30 + Math.sin(t * 4 + i) * 6, W, 4);
  },
  playa(ctx, t, h) {
    sky(ctx, 0, 0, W, 900, h, t);
    ctx.fillStyle = '#2f9ec9'; ctx.fillRect(0, 880, W, 360); ctx.fillStyle = '#5cc3e6'; ctx.fillRect(0, 880, W, 40);
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 6; for (let i = 0; i < 6; i++) { const y = 960 + i * 45, off = (t * 40 + i * 80) % 200; ctx.beginPath(); for (let x = -200 + off; x < W; x += 200) { ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 50, y - 14, x + 100, y); } ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(0, 1240); for (let x = 0; x <= W; x += 60) ctx.lineTo(x, 1240 + Math.sin(x / 90 + t * 2) * 10); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fillStyle = '#f6dca0'; ctx.fill(); outline(ctx, 8);
    ctx.strokeStyle = '#8b5a2b'; ctx.lineWidth = 34; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(900, 1400); ctx.quadraticCurveTo(940, 1000, 880, 720); ctx.stroke(); ctx.lineCap = 'butt';
    for (let i = 0; i < 6; i++) { ctx.save(); ctx.translate(880, 720); ctx.rotate(-2.6 + i * 0.7 + Math.sin(t + i) * 0.05); ctx.beginPath(); ctx.ellipse(0, -130, 40, 150, 0, 0, 7); ctx.fillStyle = '#3e9c57'; ctx.fill(); outline(ctx, 6); ctx.restore(); }
    poly(ctx, [[140, 1180], [420, 1180], [280, 1060]], '#ef476f', 7); ctx.fillStyle = INK; ctx.fillRect(276, 1180, 8, 240);
  },
  montana(ctx, t, h) {
    sky(ctx, 0, 0, W, 1100, h, t);
    for (const [x, top, w, c] of [[-100, 420, 760, '#8ea6c8'], [380, 300, 820, '#a6bad6']]) { poly(ctx, [[x, 1150], [x + w / 2, top], [x + w, 1150]], c, 8); poly(ctx, [[x + w / 2 - 110, top + 160], [x + w / 2, top], [x + w / 2 + 110, top + 160], [x + w / 2 + 40, top + 120], [x + w / 2 - 30, top + 170]], '#ffffff', 6); }
    ctx.fillStyle = '#f2f7ff'; ctx.fillRect(0, 1150, W, H - 1150); ctx.fillStyle = INK; ctx.fillRect(0, 1146, W, 8);
    for (const [x, y, s] of [[120, 1250, 1], [300, 1200, 0.8], [880, 1230, 1.1]]) { poly(ctx, [[x - 90 * s, y], [x, y - 260 * s], [x + 90 * s, y]], '#2e7d5b', 6); ctx.fillStyle = '#6b4f3a'; ctx.fillRect(x - 12 * s, y, 24 * s, 40 * s); }
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; for (let i = 0; i < 60; i++) { ctx.beginPath(); ctx.arc((i * 151 + t * 30) % W, (i * 97 + t * 120) % H, 5, 0, 7); ctx.fill(); }
  },
  selva(ctx, t, h) {
    sky(ctx, 0, 0, W, 700, h, t);
    for (const [c, k] of [['#2e7d4f', 0], ['#3e9c57', 1], ['#55b86a', 2]]) for (let i = 0; i < 6; i++) { const x = (i * 210 + k * 90) % (W + 200) - 100, y = 300 + k * 260 + (i % 2) * 80; circ(ctx, x, y, 170, c, 7); }
    for (const x of [140, 560, 940]) { box(ctx, x - 40, 600, 80, 900, 20, '#6b4f3a', 8); }
    ctx.strokeStyle = '#2f5a2a'; ctx.lineWidth = 8; for (let i = 0; i < 5; i++) { const x = 100 + i * 220; ctx.beginPath(); ctx.moveTo(x, 0); ctx.quadraticCurveTo(x + 60 + Math.sin(t + i) * 20, 400, x + 10, 800); ctx.stroke(); }
    ctx.fillStyle = '#4e8f3e'; ctx.fillRect(0, 1320, W, H - 1320); ctx.fillStyle = INK; ctx.fillRect(0, 1316, W, 8);
    for (let i = 0; i < 9; i++) { ctx.save(); ctx.translate((i * 131) % W, 1380); ctx.rotate(-0.6 + (i % 3) * 0.6); ctx.beginPath(); ctx.ellipse(0, -60, 40, 110, 0, 0, 7); ctx.fillStyle = '#3e9c57'; ctx.fill(); outline(ctx, 6); ctx.restore(); }
  },
  coche(ctx, t, h) {
    sky(ctx, 0, 0, W, 900, h, t);
    ctx.fillStyle = '#7bc96f'; ctx.fillRect(0, 700, W, 300); ctx.fillStyle = '#4a4e5a'; poly(ctx, [[380, 1000], [700, 1000], [560, 700], [520, 700]], '#4a4e5a');
    ctx.fillStyle = '#ffffff'; for (let i = 0; i < 6; i++) { const k = ((t * 0.8 + i / 6) % 1); const y = 700 + k * k * 300; ctx.fillRect(536 - k * 10, y, 8 + k * 20, 10 + k * 30); }
    for (let i = 0; i < 4; i++) { const k = ((t * 0.5 + i / 4) % 1); circ(ctx, 300 - k * 400, 720 + k * 200, 30 + k * 90, '#3e9c57', 5); circ(ctx, 780 + k * 400, 720 + k * 200, 30 + k * 90, '#3e9c57', 5); }
    ctx.fillStyle = '#2b2f3a'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W, 0); ctx.lineTo(W, 140); ctx.lineTo(0, 140); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(120, 0); ctx.lineTo(60, 1000); ctx.lineTo(0, 1000); ctx.fill(); ctx.beginPath(); ctx.moveTo(W, 0); ctx.lineTo(W - 120, 0); ctx.lineTo(W - 60, 1000); ctx.lineTo(W, 1000); ctx.fill();
    box(ctx, 380, 150, 320, 70, 14, '#3a3f4e', 6);
    box(ctx, -20, 980, W + 40, 360, 40, '#3a3f4e', 10); box(ctx, 60, 1040, 260, 130, 20, '#22252f', 6);
    for (const x of [130, 250]) { circ(ctx, x, 1105, 48, '#ffffff', 6); ctx.strokeStyle = '#ef476f'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x, 1105); ctx.lineTo(x + 30 * Math.cos(-2 + Math.sin(t) * 0.3), 1105 + 30 * Math.sin(-2 + Math.sin(t) * 0.3)); ctx.stroke(); }
    ctx.fillStyle = '#2b2f3a'; ctx.fillRect(0, 1340, W, H - 1340);
  },
  bajo_el_mar(ctx, t, h) {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, h === 'noche' ? '#0b2a55' : '#3fb6e0'); g.addColorStop(1, h === 'noche' ? '#04122a' : '#0d4a7a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 5; i++) { const x = 100 + i * 220 + Math.sin(t * 0.5 + i) * 30; const gr = ctx.createLinearGradient(x, 0, x + 120, 1200); gr.addColorStop(0, 'rgba(255,255,255,0.18)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(x - 30, 0); ctx.lineTo(x + 40, 0); ctx.lineTo(x + 220, 1200); ctx.lineTo(x + 80, 1200); ctx.fill(); }
    ctx.restore();
    for (let i = 0; i < 14; i++) { const k = (t * 0.3 + i / 14) % 1; circ(ctx, (i * 137) % W + Math.sin(t + i) * 20, H - k * H, 8 + (i % 3) * 5, 'rgba(255,255,255,0.5)', 3); }
    ctx.beginPath(); ctx.moveTo(0, 1600); ctx.quadraticCurveTo(W / 2, 1500, W, 1600); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fillStyle = '#e8c98a'; ctx.fill(); outline(ctx, 8);
    for (const [x, c] of [[120, '#ff7f7f'], [300, '#ffb347'], [880, '#bb6bd9'], [980, '#ff8fab']]) for (let k = 0; k < 4; k++) { ctx.save(); ctx.translate(x, 1620); ctx.rotate(-0.6 + k * 0.4 + Math.sin(t * 1.5 + k) * 0.08); box(ctx, -14, -160, 28, 160, 14, c, 6); ctx.restore(); }
    for (const x of [200, 760]) { ctx.strokeStyle = '#3e9c57'; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(x, 1620); for (let y = 1600; y > 1250; y -= 30) ctx.lineTo(x + Math.sin(y / 40 + t * 2) * 20, y); ctx.stroke(); }
  },
  espacio(ctx, t, h) {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#120a3a'); g.addColorStop(1, '#2a1a6a'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 120; i++) { ctx.fillStyle = `rgba(255,255,255,${0.3 + 0.6 * Math.abs(Math.sin(t * 1.5 + i))})`; const r = i % 9 === 0 ? 4 : 2; ctx.fillRect((i * 137) % W, (i * 251) % H, r, r); }
    radial(ctx, 260, 500, 420, '#ff6bd6', 0.18); radial(ctx, 860, 1300, 480, '#5ab8ff', 0.18);
    circ(ctx, 900, 260, 70, '#ffd166', 7); circ(ctx, 140, 1650, 110, '#7bdff2', 8);
  },
  fondo(ctx, t, h) { BG_CONTEXT.busy = true; try { brightBg(ctx, t, h === 'noche' ? 'lila' : h === 'atardecer' ? 'rosa' : 'crema'); } finally { BG_CONTEXT.busy = false; } },
};
export const PLACE_NAMES = Object.keys(PLACES);
const EXTERIOR = new Set(['calle', 'ciudad', 'campo', 'desierto', 'playa', 'montana', 'selva', 'coche', 'bajo_el_mar', 'espacio', 'fondo']);
const ALIAS = { casa: 'salon', 'salón': 'salon', habitacion: 'dormitorio', 'habitación': 'dormitorio', trabajo: 'oficina', colegio: 'aula', escuela: 'aula',
  clase: 'aula', bosque: 'selva', mar_fondo: 'bajo_el_mar', oceano: 'bajo_el_mar', 'océano': 'bajo_el_mar', submarino: 'bajo_el_mar', agua: 'bajo_el_mar', universo: 'espacio', cielo: 'espacio', liso: 'fondo', ninguno: 'fondo', jungla: 'selva', mar: 'playa', nieve: 'montana', 'montaña': 'montana', pueblo: 'calle', carretera: 'coche', hospital_hab: 'hospital' };
export function placeName(p) { const k = String(p || 'salon').toLowerCase().trim(); return PLACES[k] ? k : (ALIAS[k] || 'salon'); }
export function drawPlace(ctx, lugar, hora, t) { const l = placeName(lugar); PLACES[l](ctx, t, hora); ambientBack(ctx, l, t, hora); }
export { ambientFront };
BG_CONTEXT.draw = drawPlace;
export { grade, EXTERIOR };

// ---------------- Persona en plano medio con un objeto ----------------
function drawProp(ctx, prop, t) {
  if (prop === 'phone' || prop === 'movil' || prop === 'móvil') { box(ctx, -60, -120, 120, 220, 18, '#2b2f3a', 8); ctx.fillStyle = '#6ad1ff'; rr(ctx, -46, -104, 92, 176, 10); ctx.fill(); radial(ctx, 0, -10, 140, '#6ad1ff', 0.25); }
  else if (prop === 'money' || prop === 'dinero') { for (let i = 0; i < 4; i++) { ctx.save(); ctx.rotate(-0.3 + i * 0.18); box(ctx, -90, -50, 180, 90, 8, '#8fd18b', 6); circ(ctx, 0, -5, 22, '#4e9a52'); ctx.restore(); } }
  else if (prop === 'cup' || prop === 'taza' || prop === 'cafe' || prop === 'café') { box(ctx, -55, -90, 110, 130, 14, '#ffffff', 8); ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(60, -30, 30, -1.2, 1.2); ctx.stroke(); }
  else if (prop === 'book' || prop === 'libro') { box(ctx, -110, -80, 220, 150, 10, '#e85d5d', 8); ctx.fillStyle = '#fff'; ctx.fillRect(-4, -80, 8, 150); }
  else if (prop === 'papel' || prop === 'carta' || prop === 'documento') { ctx.save(); ctx.rotate(0.1); box(ctx, -80, -130, 160, 210, 6, '#fffaf0', 7); ctx.fillStyle = '#9aa3ad'; for (let i = 0; i < 5; i++) ctx.fillRect(-60, -100 + i * 32, 120, 8); ctx.restore(); }
  else if (prop === 'llave' || prop === 'llaves') { circ(ctx, 0, -40, 36, '#ffd34a', 7); box(ctx, -10, -10, 20, 110, 4, '#ffd34a', 6); }
  else if (prop === 'linterna') { box(ctx, -40, -120, 80, 200, 14, '#3a3f4e', 7); ctx.save(); ctx.globalCompositeOperation = 'lighter'; poly(ctx, [[-30, -120], [30, -120], [180, -600], [-180, -600]], 'rgba(255,240,180,0.25)'); ctx.restore(); }
}

export function midShot(ctx, who, { x = W / 2, y = 820, s = 0.95, mood = 'neutral', prop = 'none', t = 0, seed = 0 } = {}) {
  const skin = who.skin.light;
  ctx.save(); ctx.translate(x, y + Math.sin(t * 1.6) * 6); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-330, 1300); ctx.lineTo(-300, 420); ctx.quadraticCurveTo(-290, 300, -150, 290); ctx.lineTo(150, 290);
  ctx.quadraticCurveTo(290, 300, 300, 420); ctx.lineTo(330, 1300); ctx.closePath(); ctx.fillStyle = who.outfit; ctx.fill(); outline(ctx, 12);
  ctx.beginPath(); ctx.moveTo(-90, 292); ctx.lineTo(0, 400); ctx.lineTo(90, 292); ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fill();
  const limb = (pts, color, w) => { for (const [lw, c] of [[w + 22, INK], [w, color]]) { ctx.lineWidth = lw; ctx.strokeStyle = c; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.stroke(); } };
  const hasProp = prop && prop !== 'none' && prop !== 'nada';
  const sway = Math.sin(t * 2) * 8;
  limb([[-270, 420], [-320, 760]], who.outfit, 120); limb([[-320, 760], [-300, 980]], skin, 104);
  ctx.beginPath(); ctx.ellipse(-300, 1010, 64, 72, 0, 0, 7); ctx.fillStyle = skin; ctx.fill(); outline(ctx, 10);
  if (hasProp) {
    limb([[270, 420], [340, 760]], who.outfit, 120); limb([[340, 760], [130 + sway, 640]], skin, 104);
    ctx.save(); ctx.translate(110 + sway, 560); ctx.rotate(-0.15); drawProp(ctx, prop, t); ctx.restore();
    ctx.beginPath(); ctx.ellipse(130 + sway, 650, 66, 58, 0, 0, 7); ctx.fillStyle = skin; ctx.fill(); outline(ctx, 10);
  } else {
    // Gesto al hablar: la mano sube y baja de vez en cuando (como quien explica algo)
    const g = Math.pow(Math.max(0, Math.sin(t * 1.7 + seed)), 2);
    const ex = 320 + g * 70, ey = 760 - g * 90, hx = 300 - g * 90, hy = 980 - g * 330 + Math.sin(t * 6) * 12 * g;
    limb([[270, 420], [ex, ey]], who.outfit, 120); limb([[ex, ey], [hx, hy]], skin, 104);
    ctx.beginPath(); ctx.ellipse(hx, hy + 30, 64, 72, 0, 0, 7); ctx.fillStyle = skin; ctx.fill(); outline(ctx, 10);
  }
  ctx.save(); ctx.rotate(Math.sin(t * 1.3 + seed) * 0.05); // la cabeza se inclina un poco al hablar
  ctx.beginPath(); ctx.ellipse(0, 0, 242, 292, 0, 0, 7); ctx.fillStyle = INK; ctx.fill();
  drawHead(ctx, 0, 0, who, { mood, t, blinkSeed: seed });
  ctx.restore();
  ctx.restore();
}

function labelPill(ctx, text, y) {
  text = String(text || '').toUpperCase(); if (!text) return;
  ctx.save(); ctx.font = '700 46px Poppins';
  const w = Math.min(W - 80, ctx.measureText(text).width + 60), hh = 82;
  box(ctx, (W - w) / 2, y - hh / 2, w, hh, 41, '#ffd166', 7);
  ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, W / 2, y + 2, w - 40);
  ctx.restore();
}

// ---------------- Escena principal ----------------
// params: { lugar, hora: dia|atardecer|noche, plano: medio|entero|sin_persona, who, mood, objeto, label, gafas }
export const escena = {
  setup(p, r) { return { seed: r.int(0, 99) }; },
  draw(ctx, s, { t, params, seed }) {
    const hora = ['dia', 'atardecer', 'noche'].includes(params.hora) ? params.hora : 'dia';
    const lugar = placeName(params.lugar);
    drawPlace(ctx, lugar, hora, t);
    const plano = params.plano || 'medio';
    if (plano !== 'sin_persona' && plano !== 'ninguno') {
      const who = personaWho(seed, params);
      if (plano === 'entero') {
        ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(W / 2, 1700, 280, 40, 0, 0, 7); ctx.fill();
        drawFullBody(ctx, W / 2, 700 + Math.sin(t * 1.5) * 4, 0.44, who, { mood: params.mood, arms: params.arms, highlight: params.highlight, t, blinkSeed: s.seed });
      } else {
        const side = (s.seed % 2 ? 1 : -1) * 140; // a un lado para que se vea el escenario
        midShot(ctx, who, { x: lugar === 'coche' ? W / 2 : W / 2 + side, y: lugar === 'coche' ? 780 : 900, s: lugar === 'coche' ? 0.9 : 0.8, mood: params.mood, prop: params.objeto || 'none', t, seed: s.seed });
        if (lugar === 'coche') { // volante delante
          ctx.save(); ctx.translate(W / 2, 1320); ctx.rotate(Math.sin(t * 0.8) * 0.08);
          ctx.beginPath(); ctx.arc(0, 0, 230, 0, 7); ctx.lineWidth = 46; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 30; ctx.strokeStyle = '#3a3f4e'; ctx.stroke();
          box(ctx, -60, -40, 120, 80, 20, '#3a3f4e', 7); ctx.restore();
        }
      }
    }
    ambientFront(ctx, lugar, t, hora);
    grade(ctx, hora);
    if (hora === 'noche' && !EXTERIOR.has(lugar)) radial(ctx, W / 2, 500, 700, '#ffe7a8', 0.12); // luz de interior
    if (params.label) labelPill(ctx, params.label, 1780);
  },
};
