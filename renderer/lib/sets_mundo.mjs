// MÁS DECORADOS en horizontal (1920×1080) para el lenguaje «cine»: exteriores grandes, naturaleza y lugares técnicos.
// Se añaden al mismo objeto SET de sets.mjs (importar este archivo una vez basta: cine.mjs ya lo hace).
// Muchos aceptan { ruina: 0..1 }: plantas, grietas, cristales rotos y manchas (el mundo sin nadie que lo cuide).
import { SET, WW, WH, grad, glow, tree, car, lamp } from './sets.mjs';
import { DRAW } from './props.mjs';
const { C, E, R, P } = DRAW;
const hash = (i) => { const x = Math.sin(i * 127.1) * 43758.5453; return x - Math.floor(x); };
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const SKY = { dia: ['#7cc8ff', '#d8f0ff'], atardecer: ['#ff9a6a', '#ffd9a0'], noche: ['#0b1030', '#2a2f66'], amanecer: ['#ffb8c8', '#ffe9c4'], gris: ['#8c97a8', '#c9ced6'] };
function sky(ctx, hora, y1 = WH, t = 0) { const [a, b] = SKY[hora] || SKY.dia; grad(ctx, a, b, 0, y1); if (hora === 'noche') for (let i = 0; i < 90; i++) { ctx.globalAlpha = 0.4 + 0.5 * Math.abs(Math.sin(t * 1.5 + i)); C(ctx, hash(i) * WW, hash(i + 9) * y1 * 0.85, 1.5 + (i % 3), '#ffffff', 0); } ctx.globalAlpha = 1; }
function hills(ctx, y, col, amp = 60, f = 0.004, seed = 0) { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, WH); for (let x = 0; x <= WW; x += 30) ctx.lineTo(x, y - amp * (0.5 + 0.5 * Math.sin(x * f + seed)) - amp * 0.4 * Math.sin(x * f * 2.7 + seed * 2)); ctx.lineTo(WW, WH); ctx.fill(); }
function pine(ctx, x, y, s, col = '#2f6b45') { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); R(ctx, -14, -60, 28, 70, 4, '#6b4a2b', 4); for (let i = 0; i < 3; i++) P(ctx, [[-110 + i * 22, -40 - i * 90], [110 - i * 22, -40 - i * 90], [0, -200 - i * 90]], col, 6); ctx.restore(); }

// Plantas, grietas y suciedad encima de cualquier decorado (k 0..1). gy = línea del suelo
export function maleza(ctx, t, k = 0.6, gy = 960, seed = 1) {
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = 0.12 * k; ctx.fillStyle = '#3a3020'; for (let i = 0; i < 14; i++) { const x = hash(i + seed) * WW, y = hash(i + seed + 5) * gy * 0.7, h = 80 + hash(i + 2) * 220; const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#3a3020'); g.addColorStop(1, 'rgba(58,48,32,0)'); ctx.fillStyle = g; ctx.fillRect(x, y, 14 + hash(i) * 30, h); } ctx.restore();
  ctx.lineCap = 'round';
  for (let i = 0; i < Math.round(14 * k); i++) { const x = hash(i * 3 + seed) * WW, len = (120 + hash(i + 7) * 380) * k; ctx.strokeStyle = '#2f7a3a'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(x, -10); for (let y = 0; y < len; y += 20) ctx.lineTo(x + Math.sin(y / 40 + i + t) * 16, y); ctx.stroke();
    for (let y = 30; y < len; y += 46) E(ctx, x + Math.sin(y / 40 + i + t) * 16 + (y % 92 ? 18 : -18), y, 20, 12, ['#4fae5a', '#3f9150'][(y / 46) & 1], (y % 92 ? 0.5 : -0.5), 0); }
  for (let i = 0; i < Math.round(60 * k); i++) { const x = hash(i + seed + 30) * WW, h = (24 + hash(i + 3) * 70) * k; ctx.strokeStyle = ['#4fae5a', '#3f9150', '#6fbf5a'][i % 3]; ctx.lineWidth = 7; for (const d of [-1, 0, 1]) { ctx.beginPath(); ctx.moveTo(x, gy + 6); ctx.quadraticCurveTo(x + d * 10, gy - h * 0.6, x + d * 26, gy - h); ctx.stroke(); } }
  ctx.strokeStyle = 'rgba(30,20,10,0.45)'; ctx.lineWidth = 4; for (let i = 0; i < Math.round(10 * k); i++) { let x = hash(i + seed + 60) * WW, y = gy + 10 + hash(i + 61) * 80; ctx.beginPath(); ctx.moveTo(x, y); for (let j = 0; j < 5; j++) { x += 30 + hash(i * 5 + j) * 40; y += (hash(i * 7 + j) - 0.5) * 40; ctx.lineTo(x, y); } ctx.stroke(); }
}

Object.assign(SET, {
  // Gran cruce de avenidas con pantallas gigantes (sin marcas): luces 0..1 apaga las pantallas
  plaza(ctx, t, { hora = 'dia', luces = 1, ruina = 0, a = null } = {}) {
    const r = SET.avenida(ctx, t, { hora });
    for (const [x, y, w, h, c] of [[40, 120, 380, 300, '#ff5c8a'], [70, 470, 300, 180, '#4cc9f0'], [1500, 100, 380, 320, '#ffd166'], [1540, 470, 300, 200, '#7b5cff'], [700, 260, 180, 120, '#2ec27e'], [1060, 250, 170, 130, '#ff8a00']]) {
      R(ctx, x - 8, y - 8, w + 16, h + 16, 6, '#15172e', 6); const on = luces * (0.85 + 0.15 * Math.sin(t * 3 + x)); ctx.fillStyle = '#1a1c30'; ctx.fillRect(x, y, w, h);
      if (on > 0.05) { ctx.globalAlpha = on; const g = ctx.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, c); g.addColorStop(1, '#ffffff'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h); ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x + w * 0.1, y + h * 0.6, w * 0.6, h * 0.12); ctx.globalAlpha = 1; glow(ctx, x + w / 2, y + h / 2, w, c, 0.25 * on); }
    }
    for (let i = 0; i < 8; i++) { const y = 900 + i * 0; ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.beginPath(); const x0 = 560 + i * 100; ctx.moveTo(x0, 930); ctx.lineTo(x0 + 60, 930); ctx.lineTo(x0 + 70 + (i - 4) * 14, 1000); ctx.lineTo(x0 - 10 + (i - 4) * 14, 1000); ctx.fill(); }
    maleza(ctx, t, ruina, 1000, 3); return { ...r, gy: 1000 };
  },
  // Autopista en perspectiva con carriles, quitamiedos y farolas
  autopista(ctx, t, { hora = 'dia', ruina = 0 } = {}) {
    sky(ctx, hora, 520, t); hills(ctx, 520, '#8fb08a', 50, 0.003, 1); hills(ctx, 560, '#6f9a6a', 40, 0.005, 4);
    const vx = 960, vy = 500; ctx.fillStyle = '#4a4e5a'; ctx.beginPath(); ctx.moveTo(vx - 40, vy); ctx.lineTo(vx + 40, vy); ctx.lineTo(WW + 600, WH); ctx.lineTo(-600, WH); ctx.fill();
    ctx.fillStyle = '#7fa86f'; ctx.beginPath(); ctx.moveTo(0, 520); ctx.lineTo(vx - 40, vy); ctx.lineTo(-600, WH); ctx.lineTo(0, WH); ctx.fill(); ctx.beginPath(); ctx.moveTo(WW, 520); ctx.lineTo(vx + 40, vy); ctx.lineTo(WW + 600, WH); ctx.lineTo(WW, WH); ctx.fill();
    for (const l of [-1, -0.33, 0.33, 1]) for (let i = 0; i < 10; i++) { const k0 = (i / 10) ** 2, k1 = ((i + 0.5) / 10) ** 2; ctx.strokeStyle = Math.abs(l) === 1 ? '#f2f2f2' : '#ffd166'; ctx.lineWidth = 2 + 14 * k1; ctx.beginPath(); ctx.moveTo(vx + l * 40 + l * 1500 * k0, vy + (WH - vy) * k0); ctx.lineTo(vx + l * 40 + l * 1500 * k1, vy + (WH - vy) * k1); ctx.stroke(); }
    for (const s of [-1, 1]) { ctx.strokeStyle = '#c9ced6'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(vx + s * 60, vy - 6); ctx.lineTo(vx + s * 1700, WH - 120); ctx.stroke(); for (let j = 1; j < 6; j++) { const k = (j / 6) ** 2; lamp(ctx, vx + s * (70 + 1100 * k), vy + (WH - vy) * k * 0.8, 40 + 520 * k, false, t); } }
    maleza(ctx, t, ruina, 1000, 5); return { gy: 1000, vx, vy, at: (k) => ({ y: vy + (WH - vy) * k * k, x: (l) => vx + l * 40 + l * 1500 * k * k, s: k * k }) };
  },
  // Sala de control de una central: pared de pantallas, consolas con botones, sillas vacías
  control(ctx, t, { alarma = 0, luces = 1 } = {}) {
    grad(ctx, '#1d2236', '#262c45', 0, WH); R(ctx, 0, 60, WW, 520, 0, '#141828', 0);
    for (let i = 0; i < 5; i++) for (let j = 0; j < 2; j++) { const x = 70 + i * 360, y = 90 + j * 240; R(ctx, x, y, 330, 210, 8, '#0b0e1a', 6); if (luces <= 0.05) continue; ctx.globalAlpha = luces; ctx.fillStyle = (i + j) % 3 ? '#1f4a6a' : '#1f5a4a'; ctx.fillRect(x + 10, y + 10, 310, 190); ctx.strokeStyle = (i + j) % 2 ? '#4cc9f0' : '#2ec27e'; ctx.lineWidth = 4; ctx.beginPath(); for (let q = 0; q <= 30; q++) { const px = x + 20 + q * 10, py = y + 120 + Math.sin(q * 0.7 + t * 2 + i) * 40 * Math.sin(q * 0.2 + j); q ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); ctx.globalAlpha = 1; }
    if (alarma) { const on = Math.sin(t * 8) > 0; for (let i = 0; i < 4; i++) { C(ctx, 250 + i * 470, 40, 22, on ? '#ff3b30' : '#6a1a1a', 4); if (on) glow(ctx, 250 + i * 470, 40, 220, '#ff3b30', 0.35 * alarma); } }
    R(ctx, 0, 580, WW, 30, 0, '#3a4058', 0); grad(ctx, '#2e3348', '#232739', 610, WH);
    for (let i = 0; i < 3; i++) { const x = 120 + i * 600; P(ctx, [[x, 760], [x + 520, 760], [x + 480, 690], [x + 40, 690]], '#4a5170', 6); R(ctx, x, 760, 520, 200, 6, '#3a4058', 6); for (let b = 0; b < 12; b++) C(ctx, x + 70 + (b % 6) * 70, 712 + Math.floor(b / 6) * 32, 10, alarma && (b + Math.floor(t * 4)) % 5 === 0 ? '#ff3b30' : ['#2ec27e', '#ffd166', '#4cc9f0'][b % 3], 2); R(ctx, x + 170, 590, 180, 110, 6, '#0b0e1a', 5); ctx.fillStyle = luces > 0.05 ? '#1f4a6a' : '#111'; ctx.fillRect(x + 180, 600, 160, 90); }
    for (let i = 0; i < 3; i++) { const x = 380 + i * 600; R(ctx, x - 60, 860, 120, 30, 10, '#2a2f44', 5); R(ctx, x - 50, 760, 100, 110, 20, '#2a2f44', 5); R(ctx, x - 6, 890, 12, 90, 3, '#1a1d2a', 0); }
    return { gy: 1000 };
  },
  // Andén de metro: pared de azulejos, nombre de estación, vías, tren con puertas abiertas; agua 0..1 sube desde las vías
  anden(ctx, t, { agua = 0, luces = 1, tren = true } = {}) {
    ctx.fillStyle = '#d8d2c0'; ctx.fillRect(0, 0, WW, 760); for (let x = 0; x < WW; x += 60) for (let y = 0; y < 760; y += 30) { ctx.fillStyle = (x / 60 + y / 30) % 2 ? '#e6e0cf' : '#d2cbb8'; ctx.fillRect(x + 1 + ((y / 30) % 2) * 30, y + 1, 58, 28); }
    R(ctx, 0, 300, WW, 70, 0, '#2a6a5a', 0); for (let i = 0; i < 3; i++) { R(ctx, 160 + i * 620, 170, 380, 90, 8, '#1c1a2b', 5); ctx.fillStyle = '#ffffff'; ctx.font = '700 46px Poppins'; ctx.textAlign = 'center'; ctx.fillText(['CENTRAL', '42 ST', 'CENTRAL'][i], 350 + i * 620, 232); }
    for (let i = 0; i < 6; i++) { R(ctx, 60 + i * 340, 20, 240, 22, 8, '#fffbe0', 3); if (luces > 0.05) glow(ctx, 180 + i * 340, 40, 260, '#fffbe0', 0.3 * luces); }
    if (tren) { R(ctx, 900, 380, 1100, 420, 30, '#b9c2cc', 8); for (let i = 0; i < 4; i++) R(ctx, 960 + i * 260, 440, 150, 110, 12, '#22283a', 5); R(ctx, 1170, 450, 170, 340, 6, '#ffe9a8', 5); R(ctx, 1150, 450, 20, 340, 4, '#8a929c', 3); R(ctx, 1340, 450, 20, 340, 4, '#8a929c', 3); R(ctx, 900, 600, 1100, 22, 0, '#2b6cb0', 0); }
    ctx.fillStyle = '#5a5448'; ctx.fillRect(0, 760, WW, 60); R(ctx, -10, 800, WW + 20, 26, 0, '#ffd166', 0); grad(ctx, '#8a8272', '#6e6758', 826, WH);
    if (agua > 0) { const y = 830 - agua * 420 + Math.sin(t * 2) * 4; ctx.save(); ctx.globalAlpha = 0.72; grad(ctx, '#3a6a8a', '#1e3a5a', y, WH); ctx.globalAlpha = 0.5; ctx.strokeStyle = '#bfe9ff'; ctx.lineWidth = 4; for (let i = 0; i < 5; i++) { ctx.beginPath(); for (let x = 0; x <= WW; x += 40) { const yy = y + 6 + i * 26 + Math.sin(x / 70 + t * 2 + i) * 5; x ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); } ctx.stroke(); } ctx.restore(); }
    if (luces < 1) { ctx.fillStyle = `rgba(6,8,20,${(1 - luces) * 0.75})`; ctx.fillRect(0, 0, WW, WH); }
    return { gy: 1000, borde: 800 };
  },
  // Cocina: armarios, nevera (abierta opcional), encimera, ventana, mesa
  cocina(ctx, t, { hora = 'dia', nevera = false, oscuro = 0 } = {}) {
    grad(ctx, '#f3e6d2', '#e8d4b8', 0, 800); for (let i = 0; i < 4; i++) R(ctx, 80 + i * 220, 90, 200, 220, 8, '#d9b48a', 6); R(ctx, 1080, 120, 420, 320, 8, '#f6efe2', 8); const [a1, b1] = SKY[hora] || SKY.dia; const g = ctx.createLinearGradient(0, 130, 0, 430); g.addColorStop(0, a1); g.addColorStop(1, b1); ctx.fillStyle = g; ctx.fillRect(1095, 135, 390, 290);
    R(ctx, 60, 520, 1000, 300, 6, '#c99a6b', 7); R(ctx, 40, 500, 1040, 34, 6, '#efe6d6', 6); for (let i = 0; i < 4; i++) { R(ctx, 90 + i * 240, 560, 210, 230, 6, '#d9b48a', 5); C(ctx, 280 + i * 240, 600, 8, '#8a6a4a', 2); } R(ctx, 300, 400, 160, 100, 12, '#9aa4b5', 5);
    R(ctx, 1560, 160, 300, 660, 20, '#e6eef4', 8); if (nevera) { R(ctx, 1580, 180, 260, 620, 12, '#fffbe8', 4); glow(ctx, 1710, 480, 380, '#fffbe0', 0.4); for (let s = 0; s < 3; s++) { R(ctx, 1590, 330 + s * 150, 240, 8, 2, '#c9d3de', 0); for (let q = 0; q < 3; q++) R(ctx, 1610 + q * 75, 270 + s * 150, 55, 60, 8, ['#ff8a65', '#2ec27e', '#ffd166'][(s + q) % 3], 3); } P(ctx, [[1560, 160], [1300, 120], [1300, 860], [1560, 820]], '#d9e3ea', 7); } else R(ctx, 1600, 330, 14, 120, 6, '#9aa4b5', 3);
    grad(ctx, '#b89b78', '#9c7f5e', 820, WH); E(ctx, 1150, 760, 220, 34, '#d9a066', 0, 6); R(ctx, 1140, 790, 20, 140, 4, '#6b4a2b', 3);
    if (oscuro) { ctx.fillStyle = `rgba(10,12,30,${oscuro})`; ctx.fillRect(0, 0, WW, WH); }
    return { gy: 1000 };
  },
  // Bloques de pisos abandonados con un descampado (ciudad fantasma)
  bloques(ctx, t, { hora = 'gris', ruina = 0.7 } = {}) {
    sky(ctx, hora, 600, t); for (let i = 0; i < 5; i++) { const x = -60 + i * 420, w = 360, h = 420 + (i % 2) * 120, y = 640 - h; R(ctx, x, y, w, h, 2, ['#b8b4a8', '#a9a597', '#c2beb2'][i % 3], 6); for (let r = 0; r < h / 70 - 1; r++) for (let q = 0; q < 5; q++) { const bx = x + 24 + q * 68, by = y + 24 + r * 70; R(ctx, bx, by, 44, 44, 2, hash(i * 50 + r * 5 + q) > 0.8 ? '#2a2a33' : '#5a6b7a', 3); if (hash(i * 50 + r * 5 + q + 3) > 0.85) R(ctx, bx - 4, by + 44, 52, 10, 2, '#8a8576', 2); } }
    grad(ctx, '#8aa06a', '#6f8a52', 640, WH); for (let i = 0; i < 6; i++) tree(ctx, 100 + i * 340 + hash(i) * 80, 700, 0.5 + hash(i + 2) * 0.2, t, ['#5f8f4a', '#4f7f3a'][i % 2]);
    ctx.fillStyle = '#9a978c'; ctx.fillRect(0, 760, WW, 60); maleza(ctx, t, ruina, 820, 9); return { gy: 980 };
  },
  // Urbanización de casas con jardín; ruina hunde los tejados y lo llena todo de plantas
  suburbio(ctx, t, { hora = 'dia', ruina = 0 } = {}) {
    sky(ctx, hora, 560, t); hills(ctx, 560, '#9ab88a', 40, 0.004, 2);
    for (let i = 0; i < 4; i++) { const x = 60 + i * 480, sag = ruina * (hash(i) * 0.8 + 0.2) * 120, col = ['#f2c14e', '#7cc8ff', '#ff8ab8', '#b8e0a0'][i];
      R(ctx, x, 420, 380, 300, 4, col, 7); P(ctx, [[x - 30, 430], [x + 190, 260 + sag], [x + 410, 430]], ruina > 0.6 ? '#6b4a3a' : '#a0442f', 7);
      R(ctx, x + 40, 480, 90, 90, 4, ruina > 0.4 ? '#2a2a33' : '#bfe6ff', 5); R(ctx, x + 250, 480, 90, 90, 4, '#bfe6ff', 5); R(ctx, x + 150, 560, 80, 160, 4, '#6b4a2b', 5); }
    grad(ctx, ruina > 0.3 ? '#6f9a52' : '#7fcf73', '#5fae5a', 720, WH); ctx.fillStyle = '#cfd3db'; ctx.fillRect(0, 900, WW, 40); maleza(ctx, t, ruina, 900, 11);
    return { gy: 1000 };
  },
  // Río con un puente de acero; rust 0..1 lo oxida, roto 0..1 lo parte y lo hace caer
  puente(ctx, t, { hora = 'dia', rust = 0, roto = 0 } = {}) {
    sky(ctx, hora, 640, t); hills(ctx, 560, '#7f9a72', 70, 0.003, 3); grad(ctx, '#4f86b0', '#2f5f86', 640, WH); for (let i = 0; i < 6; i++) { ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 4; ctx.beginPath(); for (let x = 0; x <= WW; x += 50) { const y = 680 + i * 60 + Math.sin(x / 90 + t * 1.5 + i) * 6; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
    const col = rust > 0.5 ? '#9a4a2a' : rust > 0.2 ? '#7a6a5a' : '#5a6b7a', drop = roto * 320;
    for (const half of [0, 1]) { ctx.save(); if (half && roto) { ctx.translate(960, 520); ctx.rotate(roto * 0.35); ctx.translate(-960, -520 + drop * 0.6); }
      const x0 = half ? 960 : 0, x1 = half ? WW : 960; R(ctx, x0, 500, x1 - x0, 40, 0, col, 6); for (let x = x0; x < x1; x += 120) { ctx.strokeStyle = col; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(x, 500); ctx.lineTo(x + 60, 380); ctx.lineTo(x + 120, 500); ctx.stroke(); } R(ctx, x0, 370, x1 - x0, 20, 0, col, 4); ctx.restore(); }
    for (const x of [300, 1620]) R(ctx, x - 40, 540, 80, 400, 6, '#8a8f9a', 6);
    if (rust) { ctx.save(); ctx.globalAlpha = rust * 0.6; for (let i = 0; i < 40; i++) C(ctx, hash(i) * WW, 380 + hash(i + 5) * 160, 6 + hash(i + 9) * 10, '#b5582a', 0); ctx.restore(); }
    return { gy: 1000, rio: 640 };
  },
  // Bosque frondoso en capas con haces de luz entre los árboles
  bosque(ctx, t, { hora = 'dia', denso = 1 } = {}) {
    sky(ctx, hora, 600, t); hills(ctx, 560, '#6f9a6a', 80, 0.003, 7);
    for (let l = 0; l < 3; l++) for (let i = 0; i < 9; i++) tree(ctx, i * 240 - 60 + l * 80 + hash(i + l * 9) * 60, 640 + l * 140, (0.5 + l * 0.35) * (0.8 + hash(i + l) * 0.4), t, ['#3f7a45', '#4f8f4a', '#2f6b3a'][(i + l) % 3]);
    grad(ctx, '#4f7f3a', '#3a6a2a', 900, WH); for (let i = 0; i < 40; i++) { const x = hash(i + 70) * WW, y = 920 + hash(i + 71) * 150; for (const d of [-1, 1]) E(ctx, x + d * 22, y, 34, 12, '#5fae5a', d * 0.5, 0); }
    ctx.save(); ctx.globalCompositeOperation = 'screen'; for (let i = 0; i < 4; i++) { const x = 300 + i * 450, g = ctx.createLinearGradient(x, 0, x + 200, WH); g.addColorStop(0, 'rgba(255,240,190,0.22)'); g.addColorStop(1, 'rgba(255,240,190,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 90, 0); ctx.lineTo(x + 360, WH); ctx.lineTo(x + 150, WH); ctx.fill(); } ctx.restore();
    return { gy: 1000 };
  },
  // Bajo el mar: azul profundo, rayos de luz, burbujas
  oceano(ctx, t) {
    grad(ctx, '#1f6a9a', '#0a1f3a', 0, WH); ctx.save(); ctx.globalCompositeOperation = 'screen'; for (let i = 0; i < 6; i++) { const x = 100 + i * 340 + Math.sin(t * 0.5 + i) * 30; const g = ctx.createLinearGradient(x, 0, x, WH * 0.8); g.addColorStop(0, 'rgba(190,235,255,0.25)'); g.addColorStop(1, 'rgba(190,235,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 70, 0); ctx.lineTo(x + 220, WH); ctx.lineTo(x + 40, WH); ctx.fill(); } ctx.restore();
    for (let i = 0; i < 30; i++) { const x = hash(i) * WW, y = (WH - ((t * 40 + hash(i + 3) * WH) % WH)); C(ctx, x + Math.sin(t + i) * 8, y, 3 + (i % 4) * 2, 'rgba(220,245,255,0.5)', 0); }
    grad(ctx, '#0a1f3a', '#06142a', 960, WH); return { gy: 1000 };
  },
  // Cielo nocturno sin contaminación lumínica: vía láctea sobre un paisaje oscuro
  cielo(ctx, t, { suelo = 'colinas' } = {}) {
    grad(ctx, '#05071a', '#1a1d4a', 0, WH); ctx.save(); ctx.translate(960, 400); ctx.rotate(-0.35); const g = ctx.createLinearGradient(0, -160, 0, 160); g.addColorStop(0, 'rgba(160,140,255,0)'); g.addColorStop(0.5, 'rgba(200,180,255,0.28)'); g.addColorStop(1, 'rgba(160,140,255,0)'); ctx.fillStyle = g; ctx.fillRect(-1400, -160, 2800, 320); ctx.restore();
    for (let i = 0; i < 420; i++) { ctx.globalAlpha = 0.3 + 0.7 * Math.abs(Math.sin(t * (0.5 + hash(i)) + i)); C(ctx, hash(i + 11) * WW, hash(i + 13) * 860, hash(i + 17) > 0.95 ? 3.5 : 1.4, '#ffffff', 0); } ctx.globalAlpha = 1;
    hills(ctx, 900, '#0e1026', 70, 0.004, 2); for (let i = 0; i < 14; i++) pine(ctx, i * 150 + hash(i) * 60, 930 + hash(i + 3) * 40, 0.8 + hash(i + 5) * 0.5, '#0a0c1e');
    return { gy: 1000 };
  },
  // Espacio profundo: estrellas y nebulosa
  espacio(ctx, t) { grad(ctx, '#05061a', '#120a2a', 0, WH); glow(ctx, 1400, 300, 700, '#6a3aa8', 0.35); glow(ctx, 400, 800, 600, '#2a4aa8', 0.3); for (let i = 0; i < 300; i++) { ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(t + i)); C(ctx, hash(i + 3) * WW, hash(i + 7) * WH, hash(i) > 0.95 ? 3 : 1.3, '#ffffff', 0); } ctx.globalAlpha = 1; return { gy: WH }; },
  // Montañas de granito con pinos (Black Hills); caras: un monumento de cuatro caras de piedra genéricas talladas en la roca
  montes(ctx, t, { hora = 'dia', caras = false, desgaste = 0 } = {}) {
    sky(ctx, hora, 700, t); hills(ctx, 640, '#7f8f9a', 140, 0.002, 1);
    ctx.fillStyle = '#b9b2a6'; ctx.beginPath(); ctx.moveTo(260, WH); ctx.lineTo(380, 360); ctx.lineTo(620, 190); ctx.lineTo(1000, 150); ctx.lineTo(1380, 210); ctx.lineTo(1600, 380); ctx.lineTo(1700, WH); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(38,26,58,0.5)'; ctx.stroke();
    for (let i = 0; i < 20; i++) { ctx.strokeStyle = 'rgba(80,70,60,0.25)'; ctx.lineWidth = 3; ctx.beginPath(); const x = 400 + hash(i) * 1200; ctx.moveTo(x, 300 + hash(i + 2) * 400); ctx.lineTo(x + 20, 500 + hash(i + 4) * 400); ctx.stroke(); }
    if (caras) [[560, 420, 0.95], [800, 400, 1], [1060, 450, 0.9], [1290, 430, 0.95]].forEach(([x, y, s], i) => { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const g = ctx.createLinearGradient(-110, -150, 110, 150); g.addColorStop(0, '#d8d2c6'); g.addColorStop(1, '#9e968a'); E(ctx, 0, 0, 105, 150, g, 0, 5); ctx.fillStyle = '#857d71';
      for (const d of [-1, 1]) { E(ctx, d * 40, -30, 26, 12, '#857d71', 0, 0); E(ctx, d * 40, -56, 34, 8, '#a59d91', 0, 0); } P(ctx, [[0, -20], [-16, 40], [16, 40]], '#a59d91', 0); E(ctx, 0, 80, 40, 8, '#857d71', 0, 0); if (i === 2) { ctx.fillStyle = '#857d71'; ctx.fillRect(-50, 50, 100, 14); } ctx.restore(); });
    if (desgaste) { ctx.save(); ctx.globalAlpha = desgaste * 0.4; for (let i = 0; i < 30; i++) C(ctx, 500 + hash(i) * 900, 300 + hash(i + 1) * 300, 4 + hash(i + 2) * 8, '#6f685e', 0); ctx.restore(); }
    for (let i = 0; i < 22; i++) { const x = i * 95 - 20 + hash(i) * 40, mid = Math.abs(x - 960) < 520; pine(ctx, x, (mid ? 1060 : 980) + hash(i + 3) * 60, (mid ? 0.6 : 0.9) + hash(i + 5) * 0.6); }
    return { gy: 1000 };
  },
  // Campos con valla y granero
  granja(ctx, t, { hora = 'dia', valla = 0 } = {}) {
    sky(ctx, hora, 560, t); hills(ctx, 560, '#9ec27a', 50, 0.003, 5); grad(ctx, '#8fc46a', '#6fa44a', 600, WH); for (let i = 0; i < 12; i++) { ctx.strokeStyle = 'rgba(60,100,40,0.25)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 640 + i * 40); ctx.lineTo(WW, 620 + i * 42); ctx.stroke(); }
    R(ctx, 1380, 330, 380, 300, 6, '#b5402f', 8); P(ctx, [[1350, 340], [1570, 200], [1790, 340]], '#7a2a20', 8); R(ctx, 1500, 460, 140, 170, 4, '#f6efe2', 6);
    for (let i = 0; i < 14; i++) { const x = 40 + i * 140, fallen = valla && hash(i) < valla; ctx.save(); ctx.translate(x, 900); if (fallen) ctx.rotate(1.2); R(ctx, -10, -140, 20, 150, 4, '#a07a4a', 4); ctx.restore(); if (!fallen && i < 13 && !(valla && hash(i + 1) < valla)) for (const y of [-110, -60]) R(ctx, x, 900 + y, 140, 14, 4, '#c09a6a', 3); }
    return { gy: 1000 };
  },
  // Montículos verdes donde hubo una ciudad, con un río que ha cambiado de curso
  monticulos(ctx, t, { hora = 'dia' } = {}) {
    sky(ctx, hora, 600, t); for (let i = 0; i < 7; i++) { const x = i * 300 + hash(i) * 80, h = 140 + hash(i + 2) * 180; E(ctx, x, 640, 220, h, ['#5f8f4a', '#4f7f3a', '#6f9f5a'][i % 3], 0, 6); }
    grad(ctx, '#6f9f5a', '#5a8a4a', 640, WH); ctx.strokeStyle = '#4f86b0'; ctx.lineWidth = 80; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-50, 760); ctx.bezierCurveTo(500, 700, 700, 980, 1200, 860); ctx.bezierCurveTo(1500, 790, 1700, 900, 2000, 840); ctx.stroke();
    for (let i = 0; i < 10; i++) tree(ctx, hash(i + 40) * WW, 700 + hash(i + 41) * 300, 0.3 + hash(i + 42) * 0.3, t); return { gy: 1000 };
  },
});

Object.assign(SET, {
  // Sabana africana (de noche por defecto): hierba alta, acacias, colinas
  sabana(ctx, t, { hora = 'noche' } = {}) {
    sky(ctx, hora, 640, t); hills(ctx, 640, hora === 'noche' ? '#1a1d3a' : '#c9a86a', 50, 0.003, 6); grad(ctx, hora === 'noche' ? '#2a2a3a' : '#d9b86a', hora === 'noche' ? '#1e1e2a' : '#b8964a', 640, WH);
    for (const [x, y, s] of [[300, 700, 1], [1500, 680, 1.3], [1100, 660, 0.6]]) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); R(ctx, -10, -200, 20, 210, 6, hora === 'noche' ? '#1a1410' : '#6b4a2b', 3); E(ctx, 0, -210, 180, 40, hora === 'noche' ? '#141a14' : '#5f7a3a', 0, 4); ctx.restore(); }
    for (let i = 0; i < 120; i++) { const x = hash(i + 3) * WW, y = 700 + hash(i + 4) * 380, h = 30 + hash(i) * 50; ctx.strokeStyle = hora === 'noche' ? '#3a3a4a' : '#c9a84a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.sin(t + i) * 6, y - h); ctx.stroke(); }
    return { gy: 1000 };
  },
  // Costa rocosa con charcas de marea; marea 0..1 sube el agua
  rocas(ctx, t, { hora = 'dia', marea = 0.3 } = {}) {
    sky(ctx, hora, 520, t); grad(ctx, '#3a8fd6', '#2f6fa6', 500, WH);
    for (let i = 0; i < 9; i++) { const x = i * 240 - 60 + hash(i) * 60, y = 760 + hash(i + 1) * 160; E(ctx, x, y, 200 + hash(i + 2) * 80, 110, ['#6a5a4a', '#7a6a58', '#5a4a3a'][i % 3], 0, 6); }
    for (const [x, y, w] of [[520, 860, 220], [1240, 900, 260], [900, 1000, 180]]) { E(ctx, x, y, w, 50, '#2f8fb0', 0, 5); E(ctx, x - w * 0.3, y, 16, 10, '#ff8a65', 0, 0); for (let k = 0; k < 5; k++) { const an = k / 5 * 6.28; C(ctx, x + w * 0.35 + Math.cos(an) * 14, y + Math.sin(an) * 8, 6, '#ff5c8a', 0); } }
    const wy = 560 + marea * 380 + Math.sin(t * 1.2) * 12; ctx.save(); ctx.globalAlpha = 0.65; ctx.fillStyle = '#3a8fd6'; ctx.beginPath(); ctx.moveTo(0, wy); for (let x = 0; x <= WW; x += 40) ctx.lineTo(x, wy + Math.sin(x / 90 + t * 2) * 8); ctx.lineTo(WW, 480); ctx.lineTo(0, 480); ctx.fill(); ctx.restore();
    grad(ctx, SKY[hora]?.[0] || '#7cc8ff', SKY[hora]?.[1] || '#d8f0ff', 0, 480); R(ctx, 0, 476, WW, 14, 0, '#2f6fa6', 0);
    return { gy: 1000 };
  },
  // Marisma con llanuras de barro, juncos y manglares
  marisma(ctx, t, { hora = 'atardecer', agua = 0.3 } = {}) {
    sky(ctx, hora, 560, t); hills(ctx, 560, '#5f7a5a', 30, 0.004, 3); grad(ctx, '#8a7a5a', '#6a5a3a', 580, WH);
    for (let i = 0; i < 6; i++) { ctx.save(); ctx.globalAlpha = 0.5 + agua * 0.4; E(ctx, hash(i) * WW, 700 + i * 60, 300 + hash(i + 1) * 300, 30 + agua * 30, '#5a8aa8', 0, 0); ctx.restore(); }
    for (let i = 0; i < 80; i++) { const x = hash(i + 9) * WW, y = 640 + hash(i + 10) * 120; ctx.strokeStyle = '#6a8a4a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 6, y - 50 - hash(i) * 40); ctx.stroke(); }
    for (const x of [200, 1700]) { ctx.save(); ctx.translate(x, 700); for (let r = -3; r <= 3; r++) { ctx.strokeStyle = '#5a3a22'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, -60); ctx.quadraticCurveTo(r * 30, 0, r * 50, 60); ctx.stroke(); } C(ctx, 0, -140, 120, '#3f7a45', 5); ctx.restore(); }
    return { gy: 1000 };
  },
  // Paisaje nevado de invierno con casas con luz y pinos
  nieve(ctx, t, { hora = 'noche' } = {}) {
    sky(ctx, hora, 620, t); hills(ctx, 640, '#dfe8f2', 60, 0.003, 2); grad(ctx, '#eef4fa', '#cfdbe8', 660, WH);
    for (let i = 0; i < 4; i++) { const x = 200 + i * 460; R(ctx, x, 560, 260, 200, 4, '#8a5a3a', 6); P(ctx, [[x - 30, 570], [x + 130, 440], [x + 290, 570]], '#f6faff', 6); R(ctx, x + 40, 610, 70, 60, 4, hora === 'noche' ? '#ffd98a' : '#bfe6ff', 4); if (hora === 'noche') glow(ctx, x + 75, 640, 140, '#ffd98a', 0.4); }
    for (let i = 0; i < 10; i++) pine(ctx, i * 210 + 60, 900 + (i % 2) * 60, 0.9, '#2f5a45');
    ctx.fillStyle = 'rgba(255,255,255,0.85)'; for (let i = 0; i < 90; i++) { ctx.beginPath(); ctx.arc((hash(i) * WW + t * 30) % WW, (hash(i + 5) * WH + t * 80) % WH, 2 + (i % 3), 0, 7); ctx.fill(); }
    return { gy: 1000 };
  },
  // Superficie de Marte: desierto rojo, rocas, cielo polvoriento
  marte(ctx, t) { grad(ctx, '#d99a6a', '#f2c9a0', 0, 600); C(ctx, 1500, 200, 30, '#fff3e0', 0); hills(ctx, 620, '#b5582a', 80, 0.003, 4); grad(ctx, '#c9683a', '#9a4a22', 640, WH); for (let i = 0; i < 30; i++) E(ctx, hash(i) * WW, 700 + hash(i + 1) * 360, 20 + hash(i + 2) * 50, 10 + hash(i + 3) * 20, '#7a3a1a', 0, 3); return { gy: 1000 }; },
  // Observatorio: cúpula abierta al cielo nocturno con un telescopio que dispara un láser
  observatorio(ctx, t, { laser = 1 } = {}) {
    grad(ctx, '#05071a', '#1a1d4a', 0, WH); for (let i = 0; i < 200; i++) C(ctx, hash(i + 2) * WW, hash(i + 3) * 700, 1.4, '#ffffff', 0);
    hills(ctx, 860, '#0e1026', 40, 0.004, 3); ctx.fillStyle = '#c9ced6'; ctx.beginPath(); ctx.arc(960, 860, 320, Math.PI, 0); ctx.fill(); ctx.fillStyle = '#05071a'; ctx.fillRect(900, 540, 120, 320); R(ctx, 620, 860, 680, 240, 0, '#9aa4b5', 6);
    if (laser) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.strokeStyle = '#4cff7a'; ctx.lineWidth = 8; ctx.shadowColor = '#4cff7a'; ctx.shadowBlur = 30; ctx.beginPath(); ctx.moveTo(960, 640); ctx.lineTo(1500, -20); ctx.stroke(); ctx.restore(); }
    return { gy: 1060 };
  },
  // Arrecife de coral bajo el agua
  arrecife(ctx, t) {
    SET.oceano(ctx, t); grad(ctx, '#2a4a6a', '#1a2a4a', 820, WH);
    for (let i = 0; i < 16; i++) { const x = i * 130 + hash(i) * 40, y = 860 + hash(i + 1) * 120, c = ['#ff8a65', '#ff5c8a', '#ffd166', '#b67bff', '#4cc9f0'][i % 5]; if (i % 3 === 0) for (let b = 0; b < 5; b++) { ctx.strokeStyle = c; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + (b - 2) * 30, y - 80, x + (b - 2) * 50 + Math.sin(t + b) * 6, y - 160 - (b % 2) * 40); ctx.stroke(); } else if (i % 3 === 1) { E(ctx, x, y - 40, 80, 60, c, 0, 5); for (let k = 0; k < 6; k++) C(ctx, x - 50 + k * 20, y - 60 + (k % 2) * 20, 8, 'rgba(0,0,0,0.15)', 0); } else { for (let k = 0; k < 8; k++) { ctx.strokeStyle = c; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.sin(t * 2 + k) * 20 + (k - 4) * 10, y - 100); ctx.stroke(); } } }
    return { gy: 1000 };
  },
});
export { maleza as _maleza };
