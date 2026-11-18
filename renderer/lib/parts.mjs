// Piezas de dibujo reutilizables: ojos, manos, móvil, siluetas.
import { PALETTE as P, rr, radial, rgba, clamp, noise1 } from './util.mjs';

// ---------- OJOS ----------
// mood: calm | suspicious | wide | angry | sad
// look: -1..1 (izquierda/derecha), blink: 0..1 (1 = cerrado)
export function drawEyes(ctx, cx, cy, size, { mood = 'calm', look = 0, lookY = 0, blink = 0, skin = P.skin, glow = 0 } = {}) {
  const gap = size * 1.35;
  for (const side of [-1, 1]) drawEye(ctx, cx + side * gap, cy, size, side, { mood, look, lookY, blink, skin, glow });
}

function drawEye(ctx, x, y, s, side, { mood, look, lookY, blink, glow }) {
  const open = { calm: 0.42, suspicious: 0.26, wide: 0.62, angry: 0.3, sad: 0.36 }[mood] ?? 0.42;
  const h = s * open * (1 - blink);
  const w = s;
  ctx.save();
  // Ceja
  const browY = y - s * (mood === 'wide' ? 0.75 : mood === 'angry' ? 0.42 : 0.6);
  const tilt = mood === 'angry' ? 0.22 : mood === 'sad' ? -0.18 : mood === 'suspicious' ? 0.1 : 0;
  ctx.strokeStyle = '#1a0f0a';
  ctx.lineCap = 'round';
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const bx = x - w * 0.75 * side * -1 * (t - 0.5) * 2;
    const by = browY - Math.sin(t * Math.PI) * s * 0.12 + (side * (t - 0.5)) * -tilt * s * 0.8;
    ctx.lineWidth = s * (0.07 - Math.abs(t - 0.45) * 0.05);
    ctx.beginPath(); ctx.moveTo(bx - 10, by + 4); ctx.lineTo(bx + 12, by - 6); ctx.stroke();
  }
  // Sombra de la cuenca
  radial(ctx, x, y, s * 1.1, '#2a160c', 0.35);
  if (h > 1.5) {
    // Forma del ojo (almendra)
    ctx.beginPath();
    ctx.moveTo(x - w, y);
    ctx.bezierCurveTo(x - w * 0.5, y - h * 1.6, x + w * 0.5, y - h * 1.6, x + w, y);
    ctx.bezierCurveTo(x + w * 0.5, y + h * 1.25, x - w * 0.5, y + h * 1.25, x - w, y);
    ctx.closePath();
    ctx.save();
    ctx.clip();
    const sg = ctx.createLinearGradient(0, y - h, 0, y + h);
    sg.addColorStop(0, '#9c8a7a'); sg.addColorStop(0.5, '#e8ddd0'); sg.addColorStop(1, '#c9b8a6');
    ctx.fillStyle = sg;
    ctx.fillRect(x - w, y - h * 2, w * 2, h * 4);
    // Iris + pupila
    const ix = x + look * w * 0.45, iy = y + lookY * h * 0.4;
    const ir = s * 0.36;
    const ig = ctx.createRadialGradient(ix, iy, ir * 0.2, ix, iy, ir);
    ig.addColorStop(0, '#6b3d1f'); ig.addColorStop(1, '#2b170b');
    ctx.fillStyle = ig;
    ctx.beginPath(); ctx.arc(ix, iy, ir, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0a0503';
    ctx.beginPath(); ctx.arc(ix, iy, ir * 0.48, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath(); ctx.arc(ix - ir * 0.3, iy - ir * 0.32, ir * 0.16, 0, Math.PI * 2); ctx.fill();
    if (glow) radial(ctx, ix, iy, ir * 1.4, P.red, glow * 0.6);
    // Sombra del párpado superior
    const lg = ctx.createLinearGradient(0, y - h * 1.3, 0, y);
    lg.addColorStop(0, 'rgba(40,20,10,0.75)'); lg.addColorStop(1, 'rgba(40,20,10,0)');
    ctx.fillStyle = lg;
    ctx.fillRect(x - w, y - h * 2, w * 2, h * 2);
    ctx.restore();
  }
  // Línea del párpado superior (gruesa) e inferior (fina)
  ctx.strokeStyle = '#140a05';
  ctx.lineWidth = s * 0.075;
  ctx.beginPath();
  ctx.moveTo(x - w * 1.05, y + s * 0.02);
  ctx.bezierCurveTo(x - w * 0.5, y - h * 1.6 - 2, x + w * 0.5, y - h * 1.6 - 2, x + w * 1.05, y - s * 0.02);
  ctx.stroke();
  ctx.lineWidth = s * 0.03;
  ctx.strokeStyle = 'rgba(20,10,5,0.6)';
  ctx.beginPath();
  ctx.moveTo(x - w * 0.95, y);
  ctx.bezierCurveTo(x - w * 0.5, y + h * 1.25, x + w * 0.5, y + h * 1.25, x + w * 0.95, y);
  ctx.stroke();
  ctx.restore();
}

// Parpadeo natural: devuelve 0..1 según el tiempo.
export function blinkAt(t, seed = 0) {
  const period = 3.1 + (seed % 3) * 0.7;
  const ph = (t + seed * 0.37) % period;
  return ph < 0.16 ? Math.sin((ph / 0.16) * Math.PI) : 0;
}

// ---------- MANOS + MÓVIL ----------
export function drawFinger(ctx, x, y, w, h, angle, skin = P.skin) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(angle);
  const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
  g.addColorStop(0, P.skinDark); g.addColorStop(0.5, skin); g.addColorStop(1, P.skinDark);
  ctx.fillStyle = g;
  rr(ctx, -w / 2, -h / 2, w, h, w / 2);
  ctx.fill();
  ctx.restore();
}

// Dibuja un móvil sujetado con las manos. `drawScreen(ctx, sx, sy, sw, sh)` pinta la pantalla.
export function drawPhoneInHands(ctx, cx, cy, { scale = 1, tilt = -0.04, drawScreen, screenGlow = P.ui, skin = P.skin } = {}) {
  const pw = 470 * scale, ph = 960 * scale;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(tilt);
  // Brillo de la pantalla en el entorno
  radial(ctx, 0, 0, 900 * scale, screenGlow, 0.18);
  // Palma izquierda (detrás)
  ctx.save();
  const pg = ctx.createLinearGradient(-pw / 2 - 120, 0, -pw / 2 + 60, 0);
  pg.addColorStop(0, P.skinDark); pg.addColorStop(1, skin);
  ctx.fillStyle = pg;
  ctx.beginPath();
  ctx.ellipse(-pw / 2 - 10, ph * 0.22, 90 * scale, 260 * scale, 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // Cuerpo del teléfono
  const bg = ctx.createLinearGradient(-pw / 2, 0, pw / 2, 0);
  bg.addColorStop(0, '#5a6070'); bg.addColorStop(0.15, '#c9ccd6'); bg.addColorStop(0.5, '#7a7f8c'); bg.addColorStop(0.85, '#c9ccd6'); bg.addColorStop(1, '#4a4f5c');
  ctx.fillStyle = bg;
  rr(ctx, -pw / 2, -ph / 2, pw, ph, 70 * scale);
  ctx.fill();
  ctx.fillStyle = '#0b0c12';
  rr(ctx, -pw / 2 + 12 * scale, -ph / 2 + 12 * scale, pw - 24 * scale, ph - 24 * scale, 60 * scale);
  ctx.fill();
  // Pantalla
  const sx = -pw / 2 + 24 * scale, sy = -ph / 2 + 24 * scale, sw = pw - 48 * scale, sh = ph - 48 * scale;
  ctx.save();
  rr(ctx, sx, sy, sw, sh, 50 * scale);
  ctx.clip();
  ctx.fillStyle = '#10121c';
  ctx.fillRect(sx, sy, sw, sh);
  if (drawScreen) drawScreen(ctx, sx, sy, sw, sh, scale);
  // Reflejo
  const rg = ctx.createLinearGradient(sx, sy, sx + sw, sy + sh);
  rg.addColorStop(0, 'rgba(255,255,255,0.07)'); rg.addColorStop(0.4, 'rgba(255,255,255,0)');
  ctx.fillStyle = rg;
  ctx.fillRect(sx, sy, sw, sh);
  ctx.restore();
  // Isla de la cámara
  ctx.fillStyle = '#000';
  rr(ctx, -70 * scale, -ph / 2 + 36 * scale, 140 * scale, 36 * scale, 18 * scale);
  ctx.fill();
  // Dedos derecha (delante)
  for (let i = 0; i < 4; i++) drawFinger(ctx, pw / 2 + 8 * scale, ph * (0.02 + i * 0.1), 66 * scale, 120 * scale, -1.35 + i * 0.05, skin);
  // Pulgar izquierdo
  drawFinger(ctx, -pw / 2 + 6 * scale, ph * 0.12, 70 * scale, 200 * scale, 0.35, skin);
  ctx.restore();
  return { pw, ph };
}

// ---------- SILUETA HUMANA ----------
// Silueta de pie (x = centro, y = pies, h = altura).
export function drawFigure(ctx, x, y, h, { color = '#020204', hood = false, rim = null, rimAlpha = 0.6 } = {}) {
  const s = h / 1000;
  ctx.save();
  ctx.translate(x, y - h);
  ctx.scale(s, s);
  ctx.fillStyle = color;
  ctx.beginPath();
  if (hood) {
    ctx.moveTo(-70, 40); ctx.quadraticCurveTo(0, -30, 70, 40); ctx.quadraticCurveTo(95, 120, 80, 190);
  } else {
    ctx.ellipse(0, 75, 58, 72, 0, 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-40, 170); ctx.quadraticCurveTo(-150, 190, -170, 280);
  ctx.lineTo(-190, 640); ctx.lineTo(-140, 650); ctx.lineTo(-120, 420);
  ctx.lineTo(-110, 1000); ctx.lineTo(-20, 1000); ctx.lineTo(0, 600); ctx.lineTo(20, 1000); ctx.lineTo(110, 1000);
  ctx.lineTo(120, 420); ctx.lineTo(140, 650); ctx.lineTo(190, 640); ctx.lineTo(170, 280);
  ctx.quadraticCurveTo(150, 190, 40, 170);
  ctx.closePath();
  ctx.fill();
  if (rim) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = rgba(rim, rimAlpha);
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(170, 280); ctx.lineTo(190, 640); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, 75, 58, 72, 0, -1.2, 0.8); ctx.stroke();
  }
  ctx.restore();
}

// Busto (cabeza + hombros) a contraluz.
export function drawBust(ctx, x, y, size, { color = '#030305', hood = false, rim = P.amber, rimAlpha = 0.7, eyes = 0 } = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-size * 1.3, size * 1.6);
  ctx.quadraticCurveTo(-size * 1.2, size * 0.75, -size * 0.35, size * 0.6);
  ctx.lineTo(size * 0.35, size * 0.6);
  ctx.quadraticCurveTo(size * 1.2, size * 0.75, size * 1.3, size * 1.6);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  if (hood) {
    ctx.moveTo(-size * 0.62, size * 0.7);
    ctx.quadraticCurveTo(-size * 0.75, -size * 0.75, 0, -size * 0.78);
    ctx.quadraticCurveTo(size * 0.75, -size * 0.75, size * 0.62, size * 0.7);
  } else {
    ctx.ellipse(0, 0, size * 0.45, size * 0.58, 0, 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = rgba(rim, rimAlpha);
  ctx.lineWidth = size * 0.03;
  ctx.beginPath();
  if (hood) ctx.arc(0, -size * 0.05, size * 0.7, -1.4, -0.1);
  else ctx.ellipse(0, 0, size * 0.45, size * 0.58, 0, -1.3, 0.4);
  ctx.stroke();
  if (eyes > 0) {
    for (const sx of [-1, 1]) radial(ctx, sx * size * 0.16, -size * 0.02, size * 0.08, '#ffffff', eyes * 0.9);
  }
  ctx.restore();
}

// Luz parpadeante (fluorescente estropeado). Devuelve 0..1.
export function flicker(t, seed = 0, bad = 0.5) {
  const n = noise1(t * 9, seed);
  return n < bad * 0.35 ? 0.15 + n : clamp(0.85 + noise1(t * 3, seed + 7) * 0.15);
}
