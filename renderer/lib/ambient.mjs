// VIDA DE FONDO: elementos que se mueven todo el rato en cada lugar (coches que pasan, pájaros, peces,
// burbujas, hojas, polvo con luz, estrellas fugaces...). Así ningún fotograma queda quieto ni vacío.
// ambientBack: detrás de la persona/piezas. ambientFront: partículas por delante (muy ligeras).
import { W, H, radial, noise1 } from './util.mjs';

const INK = '#1c1a2b';
const wrap = (v, a, b) => a + ((((v - a) % (b - a)) + (b - a)) % (b - a));
function ol(ctx, w = 6) { ctx.lineWidth = w; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.stroke(); }

function bird(ctx, x, y, s, t, i) {
  const f = Math.sin(t * 9 + i) * 0.6;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath();
  ctx.moveTo(-34, -14 * f - 6); ctx.quadraticCurveTo(-16, -22 * f - 10, 0, 0); ctx.quadraticCurveTo(16, -22 * f - 10, 34, -14 * f - 6); ctx.stroke();
  ctx.restore();
}
function car(ctx, x, y, s, color, dir) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s);
  ctx.beginPath(); ctx.roundRect(-120, -60, 240, 70, 22); ctx.fillStyle = color; ctx.fill(); ol(ctx, 7);
  ctx.beginPath(); ctx.roundRect(-70, -110, 130, 60, 20); ctx.fillStyle = color; ctx.fill(); ol(ctx, 7);
  ctx.fillStyle = '#bfe6ff'; ctx.fillRect(-55, -98, 48, 38); ctx.fillRect(2, -98, 46, 38);
  for (const wx of [-70, 70]) { ctx.beginPath(); ctx.arc(wx, 12, 30, 0, 7); ctx.fillStyle = '#2b2f3a'; ctx.fill(); ol(ctx, 6); ctx.beginPath(); ctx.arc(wx, 12, 11, 0, 7); ctx.fillStyle = '#cfd5de'; ctx.fill(); }
  ctx.fillStyle = '#ffe08a'; ctx.fillRect(108, -45, 14, 16);
  ctx.restore();
}
function fish(ctx, x, y, s, color, dir, t, i) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s);
  const w = Math.sin(t * 8 + i) * 0.25;
  ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(-80, -30 + w * 40); ctx.lineTo(-80, 30 + w * 40); ctx.closePath(); ctx.fillStyle = color; ctx.fill(); ol(ctx, 5);
  ctx.beginPath(); ctx.ellipse(0, 0, 55, 32, 0, 0, 7); ctx.fillStyle = color; ctx.fill(); ol(ctx, 5);
  ctx.beginPath(); ctx.arc(28, -6, 7, 0, 7); ctx.fillStyle = INK; ctx.fill();
  ctx.restore();
}
function butterfly(ctx, x, y, s, color, t, i) {
  const f = Math.abs(Math.sin(t * 12 + i));
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sx * 18 * f, -6, 20 * f + 3, 26, sx * 0.4, 0, 7); ctx.fillStyle = color; ctx.fill(); ol(ctx, 4); }
  ctx.fillStyle = INK; ctx.fillRect(-3, -20, 6, 34);
  ctx.restore();
}
function leaf(ctx, x, y, r, color) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(r);
  ctx.beginPath(); ctx.ellipse(0, 0, 14, 28, 0, 0, 7); ctx.fillStyle = color; ctx.fill(); ol(ctx, 4); ctx.restore();
}
function tumbleweed(ctx, x, y, r) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.strokeStyle = '#a7743c'; ctx.lineWidth = 6;
  for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.ellipse(0, 0, 60, 30 + k * 5, k * 0.5, 0, 7); ctx.stroke(); }
  ctx.restore();
}
function shootingStar(ctx, t, period = 3.2, seed = 0) {
  const k = ((t + seed) % period) / 0.7; if (k > 1) return;
  const x = wrap(200 + seed * 377, 100, W - 100) + k * 520, y = 180 + (seed * 131) % 500 + k * 260;
  const g = ctx.createLinearGradient(x - 220, y - 110, x, y); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,0.95)');
  ctx.strokeStyle = g; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - 220, y - 110); ctx.lineTo(x, y); ctx.stroke();
}
function motes(ctx, t, n, color, alpha, yMin = 0, yMax = H, size = 5) {
  ctx.save(); ctx.fillStyle = color;
  for (let i = 0; i < n; i++) {
    const x = wrap((i * 211) + Math.sin(t * 0.7 + i) * 50 + t * 12, -20, W + 20);
    const y = wrap(yMin + (i * 137) % (yMax - yMin) - t * (10 + (i % 4) * 8), yMin, yMax);
    ctx.globalAlpha = alpha * (0.4 + 0.6 * Math.abs(Math.sin(t * 1.3 + i)));
    ctx.beginPath(); ctx.arc(x, y, size * (0.6 + (i % 3) * 0.4), 0, 7); ctx.fill();
  }
  ctx.restore();
}
// Haces de luz que se mueven lentamente (interiores)
function lightBeams(ctx, t, hora) {
  if (hora === 'noche') return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 3; i++) {
    const x = 120 + i * 300 + Math.sin(t * 0.5 + i * 2) * 60;
    const g = ctx.createLinearGradient(x, 0, x + 300, 1500); g.addColorStop(0, 'rgba(255,245,210,0.16)'); g.addColorStop(1, 'rgba(255,245,210,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 140, 0); ctx.lineTo(x + 420, 1500); ctx.lineTo(x + 180, 1500); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
function steam(ctx, x, y, t) {
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 10; ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const k = (t * 0.6 + i / 3) % 1; ctx.globalAlpha = Math.sin(k * Math.PI) * 0.8;
    ctx.beginPath(); const yy = y - k * 260;
    ctx.moveTo(x + (i - 1) * 40, yy); ctx.bezierCurveTo(x + (i - 1) * 40 + 30, yy - 40, x + (i - 1) * 40 - 30, yy - 80, x + (i - 1) * 40, yy - 120); ctx.stroke();
  }
  ctx.restore();
}
function papers(ctx, t) {
  for (let i = 0; i < 3; i++) {
    const k = (t * 0.22 + i / 3) % 1, x = wrap(i * 360 + k * 700, -100, W + 100), y = 200 + k * 1100 + Math.sin(t * 2 + i) * 60;
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 2.4 + i) * 0.8);
    ctx.beginPath(); ctx.rect(-40, -52, 80, 104); ctx.fillStyle = '#fffaf0'; ctx.fill(); ol(ctx, 5);
    ctx.fillStyle = '#9aa3ad'; for (let l = 0; l < 4; l++) ctx.fillRect(-28, -36 + l * 22, 56, 6);
    ctx.restore();
  }
}
function fireflies(ctx, t) {
  for (let i = 0; i < 18; i++) {
    const x = wrap(i * 173 + Math.sin(t * 0.8 + i) * 80, 0, W), y = 900 + (i * 97) % 700 + Math.cos(t * 0.9 + i * 2) * 50;
    radial(ctx, x, y, 26, '#fff3a0', 0.5 + 0.5 * Math.sin(t * 4 + i));
  }
}

const BACK = {
  calle(ctx, t, h) { // coches cruzando por la carretera y pájaros
    const cols = ['#ef476f', '#118ab2', '#ffd166', '#06d6a0'];
    for (let i = 0; i < 2; i++) { const dir = i ? -1 : 1, sp = 520 + i * 140; car(ctx, dir > 0 ? wrap(t * sp + i * 900, -400, W + 400) : wrap(-t * sp + i * 600, -400, W + 400), 1560 + i * 120, 0.9 + i * 0.15, cols[(i + Math.floor(t / 2.5)) % 4], dir); }
    if (h !== 'noche') for (let i = 0; i < 3; i++) bird(ctx, wrap(t * 140 + i * 260, -60, W + 60), 330 + i * 60 + Math.sin(t * 2 + i) * 20, 0.8, t, i);
  },
  ciudad(ctx, t, h) {
    car(ctx, wrap(t * 480, -400, W + 400), 1640, 0.75, '#ef476f', 1); car(ctx, wrap(-t * 400 + 700, -400, W + 400), 1680, 0.8, '#118ab2', -1);
    if (h !== 'noche') for (let i = 0; i < 4; i++) bird(ctx, wrap(t * 120 + i * 200, -60, W + 60), 200 + i * 50 + Math.sin(t * 2 + i) * 20, 0.7, t, i);
    else shootingStar(ctx, t, 3.5, 1);
  },
  campo(ctx, t, h) {
    if (h === 'noche') { fireflies(ctx, t); shootingStar(ctx, t, 3, 2); return; }
    for (let i = 0; i < 3; i++) bird(ctx, wrap(t * 130 + i * 300, -60, W + 60), 280 + i * 70 + Math.sin(t * 2 + i) * 25, 0.9, t, i);
    for (let i = 0; i < 4; i++) butterfly(ctx, wrap(i * 270 + Math.sin(t * 0.9 + i) * 120 + t * 40, 0, W), 1350 + (i * 113) % 350 + Math.sin(t * 2.2 + i) * 60, 0.9, ['#ff8fab', '#ffd166', '#7bdff2', '#bb6bd9'][i], t, i);
  },
  desierto(ctx, t, h) {
    tumbleweed(ctx, wrap(t * 260, -150, W + 150), 1480 + Math.abs(Math.sin(t * 3)) * -50, t * 4);
    if (h !== 'noche') for (let i = 0; i < 2; i++) bird(ctx, W / 2 + Math.cos(t * 0.6 + i * 3) * 300, 320 + Math.sin(t * 0.6 + i * 3) * 80, 0.8, t, i); // buitres en círculo
    else shootingStar(ctx, t, 3, 3);
    motes(ctx, t, 20, '#f0c27b', 0.5, 1100, 1900, 6); // arena al viento
  },
  playa(ctx, t, h) {
    if (h !== 'noche') for (let i = 0; i < 3; i++) bird(ctx, wrap(t * 110 + i * 280, -60, W + 60), 300 + i * 80 + Math.sin(t * 1.5 + i) * 30, 1, t, i);
    else shootingStar(ctx, t, 3.2, 4);
    // barco a lo lejos
    const bx = wrap(t * 40 + 200, -150, W + 150);
    ctx.save(); ctx.translate(bx, 900 + Math.sin(t * 2) * 6);
    ctx.beginPath(); ctx.moveTo(-70, 0); ctx.lineTo(70, 0); ctx.lineTo(50, 28); ctx.lineTo(-50, 28); ctx.closePath(); ctx.fillStyle = '#ffffff'; ctx.fill(); ol(ctx, 5);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -90); ctx.lineTo(55, -10); ctx.closePath(); ctx.fillStyle = '#ef476f'; ctx.fill(); ol(ctx, 5); ctx.restore();
  },
  montana(ctx, t, h) {
    if (h !== 'noche') for (let i = 0; i < 2; i++) bird(ctx, W / 2 + Math.cos(t * 0.5 + i * 3) * 320, 300 + Math.sin(t * 0.5 + i * 3) * 90, 1, t, i);
    else shootingStar(ctx, t, 3, 5);
  },
  selva(ctx, t) {
    for (let i = 0; i < 5; i++) { const k = (t * 0.18 + i / 5) % 1; leaf(ctx, wrap(i * 220 + Math.sin(t * 1.5 + i) * 80, 0, W), k * 1500 + 100, Math.sin(t * 3 + i) * 1.2, ['#55b86a', '#3e9c57', '#9ed36a'][i % 3]); }
    for (let i = 0; i < 3; i++) butterfly(ctx, wrap(i * 360 + t * 60 + Math.sin(t + i) * 100, 0, W), 900 + i * 180 + Math.sin(t * 2 + i) * 70, 1, ['#5ab8ff', '#ffd166', '#ff5d8f'][i], t, i);
  },
  coche(ctx, t) { // coche que adelanta por el carril de al lado
    const k = (t * 0.35) % 1; ctx.save(); ctx.globalAlpha = 1; car(ctx, 700 + k * 260, 760 + k * 220, 0.25 + k * 0.9, '#ffd166', 1); ctx.restore();
  },
  bajo_el_mar(ctx, t) {
    const cols = ['#ffd166', '#ff8fab', '#7bdff2', '#ff9f68', '#b8f2a8'];
    for (let i = 0; i < 5; i++) { const dir = i % 2 ? -1 : 1, sp = 90 + i * 30; fish(ctx, wrap(dir * t * sp + i * 260, -120, W + 120), 350 + i * 230 + Math.sin(t * 1.4 + i) * 40, 0.8 + (i % 3) * 0.3, cols[i], dir, t, i); }
  },
  espacio(ctx, t) {
    shootingStar(ctx, t, 2.4, 0); shootingStar(ctx, t, 3.1, 6);
    // satélite que cruza girando
    ctx.save(); ctx.translate(wrap(t * 90 + 100, -150, W + 150), 1050 + Math.sin(t * 0.7) * 60); ctx.rotate(t * 0.6);
    ctx.fillStyle = '#5ab8ff'; ctx.fillRect(-110, -22, 70, 44); ctx.fillRect(40, -22, 70, 44); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.strokeRect(-110, -22, 70, 44); ctx.strokeRect(40, -22, 70, 44);
    ctx.beginPath(); ctx.roundRect(-40, -34, 80, 68, 10); ctx.fillStyle = '#cfd5de'; ctx.fill(); ol(ctx, 6); ctx.restore();
  },
  cocina(ctx, t) { steam(ctx, 820, 1000, t); },
  oficina(ctx, t, h) { lightBeams(ctx, t, h); papers(ctx, t); },
  aula(ctx, t, h) { lightBeams(ctx, t, h); papers(ctx, t); },
  salon(ctx, t, h) { lightBeams(ctx, t, h); },
  dormitorio(ctx, t, h) { if (h === 'noche') { for (let i = 0; i < 3; i++) { const k = (t * 0.4 + i / 3) % 1; ctx.save(); ctx.globalAlpha = Math.sin(k * Math.PI); ctx.font = `800 ${50 + k * 40}px Poppins`; ctx.fillStyle = '#ffffff'; ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.strokeText('Z', 300 + k * 160 + i * 20, 700 - k * 300); ctx.fillText('Z', 300 + k * 160 + i * 20, 700 - k * 300); ctx.restore(); } } else lightBeams(ctx, t, h); },
  hospital(ctx, t, h) { lightBeams(ctx, t, h); },
};

export function ambientBack(ctx, lugar, t, hora) {
  try { BACK[lugar]?.(ctx, t, hora); } catch { /* el ambiente nunca tumba la escena */ }
}

// Partículas por delante: polvo con luz en interiores, burbujas bajo el mar, nieve/arena ya van en el lugar.
const INTERIOR = new Set(['salon', 'dormitorio', 'cocina', 'oficina', 'aula', 'hospital']);
export function ambientFront(ctx, lugar, t, hora) {
  try {
    if (INTERIOR.has(lugar)) motes(ctx, t, 22, hora === 'noche' ? '#ffe7a8' : '#ffffff', 0.55, 0, H, 5);
    else if (lugar === 'bajo_el_mar') motes(ctx, t * 2.5, 16, '#ffffff', 0.45, 0, H, 8);
    else if (lugar === 'espacio') motes(ctx, t, 10, '#ffffff', 0.6, 0, H, 3);
    else if (hora !== 'noche' && (lugar === 'campo' || lugar === 'selva')) motes(ctx, t, 14, '#fff7c2', 0.5, 600, 1800, 5); // polen
  } catch { /* nada */ }
}

// Fondo liso con vida: rayos que giran desde el centro, destellos y confeti que cae.
export function livelyBg(ctx, t, cols) {
  ctx.save(); ctx.translate(W / 2, H * 0.42); ctx.rotate(t * 0.18);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  for (let i = 0; i < 16; i++) { ctx.rotate(Math.PI / 8); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-90, -1600); ctx.lineTo(90, -1600); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  radial(ctx, W / 2, H * 0.42, 620 + Math.sin(t * 2) * 40, '#ffffff', 0.45);
  for (let i = 0; i < 26; i++) { // confeti
    const k = (t * (0.12 + (i % 4) * 0.03) + i / 26) % 1, x = wrap(i * 149 + Math.sin(t * 1.5 + i) * 50, 0, W), y = k * (H + 100) - 50;
    ctx.save(); ctx.translate(x, y); ctx.rotate(t * 3 + i); ctx.scale(1, Math.sin(t * 5 + i));
    ctx.fillStyle = cols[i % cols.length]; ctx.fillRect(-12, -6, 24, 12); ctx.restore();
  }
  for (let i = 0; i < 7; i++) { // destellos
    const p = Math.max(0, Math.sin(t * 2.2 + i * 1.7)); if (p < 0.05) continue;
    const x = (i * 331 + 120) % W, y = 260 + (i * 389) % 1300, s = 26 * p;
    ctx.save(); ctx.translate(x, y); ctx.fillStyle = '#ffffff'; ctx.globalAlpha = p;
    ctx.beginPath(); ctx.moveTo(0, -s * 2); ctx.quadraticCurveTo(0, 0, s * 2, 0); ctx.quadraticCurveTo(0, 0, 0, s * 2); ctx.quadraticCurveTo(0, 0, -s * 2, 0); ctx.quadraticCurveTo(0, 0, 0, -s * 2); ctx.fill(); ctx.restore();
  }
  void noise1;
}

// Capa de vida genérica para escenas que se mueven poco por dentro (periódico, tele, personas, textos...):
// motas de luz que flotan y un brillo que respira. Discreta, para no tapar nada.
export function lifeOverlay(ctx, t, dark) {
  try {
    motes(ctx, t, 18, dark ? '#cfe3ff' : '#ffffff', dark ? 0.45 : 0.6, 0, H, 5);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    radial(ctx, W / 2 + Math.sin(t * 0.7) * 260, H * 0.35 + Math.cos(t * 0.5) * 200, 520, dark ? '#6a8cff' : '#fff2c8', dark ? 0.1 : 0.12);
    ctx.restore();
  } catch { /* nada */ }
}
