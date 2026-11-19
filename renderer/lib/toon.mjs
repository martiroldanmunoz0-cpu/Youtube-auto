// Personajes de dibujos animados (estilo plano, colores vivos) para los sketches de comedia.
// Un personaje se describe con un objeto "look":
//   { skin, hair: short|bald|long|buzz|curly|mohawk, hair_color, cap: '#hex'|'', glasses: bool,
//     outfit: '#hex', pattern: none|hawaii|stripes|tank, chain: bool, beard: bool }
import { rr, radial, rgba, noise1, clamp } from './util.mjs';

export const SKINS = { clara: '#f1c9a5', media: '#d79f74', morena: '#a86b45', oscura: '#6e4229' };

export function normLook(look = {}) {
  return {
    skin: SKINS[look.skin] || look.skin || SKINS.media,
    hair: look.hair || 'short',
    hair_color: look.hair_color || '#1d1410',
    cap: look.cap || '',
    glasses: !!look.glasses,
    outfit: look.outfit || '#2f7cf6',
    pattern: look.pattern || 'none',
    chain: !!look.chain,
    beard: !!look.beard,
  };
}

function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v) => Math.max(0, Math.min(255, Math.round(v * f)));
  return `rgb(${c((n >> 16) & 255)},${c((n >> 8) & 255)},${c(n & 255)})`;
}

// Apertura de boca 0..1 mientras habla (aleteo natural con ruido).
export function mouthOpen(t, talking, seed = 0) {
  if (!talking) return 0;
  const n = noise1(t * 11, seed);
  return clamp(n < 0.3 ? 0.05 : (n - 0.2) * 1.3);
}

// Dibuja un busto centrado en (x, y) = centro de la cabeza. s = escala (1 ≈ cabeza de 300 px).
// opts: { mood: neutral|happy|angry|shocked|sad|smug|scared, talk: 0..1, look: -1..1, blink: 0..1, t }
export function drawToon(ctx, x, y, s, lookIn, opts = {}) {
  const L = normLook(lookIn);
  const mood = opts.mood || 'neutral';
  const t = opts.t || 0;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  // Bote al hablar / temblor al asustarse
  const bob = (opts.talk || 0) * 6 + (mood === 'scared' ? Math.sin(t * 40) * 3 : 0);
  ctx.translate(0, -bob);

  // ---- Torso ----
  const shirt = L.outfit;
  ctx.fillStyle = shirt;
  ctx.beginPath();
  ctx.moveTo(-270, 900); ctx.lineTo(-250, 260); ctx.quadraticCurveTo(-240, 170, -120, 160);
  ctx.lineTo(120, 160); ctx.quadraticCurveTo(240, 170, 250, 260); ctx.lineTo(270, 900); ctx.closePath();
  ctx.fill();
  ctx.save(); ctx.clip();
  if (L.pattern === 'hawaii') {
    for (let i = 0; i < 48; i++) {
      const fx = -250 + ((i * 97) % 500), fy = 180 + ((i * 61) % 700);
      ctx.fillStyle = i % 3 ? 'rgba(255,240,180,0.85)' : 'rgba(255,120,150,0.85)';
      for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2; ctx.beginPath(); ctx.ellipse(fx + Math.cos(a) * 14, fy + Math.sin(a) * 14, 12, 7, a, 0, 7); ctx.fill(); }
      ctx.fillStyle = '#ffd34d'; ctx.beginPath(); ctx.arc(fx, fy, 7, 0, 7); ctx.fill();
    }
  } else if (L.pattern === 'stripes') {
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    for (let yy = 170; yy < 900; yy += 46) ctx.fillRect(-270, yy, 540, 18);
  }
  // Sombra lateral
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(120, 150, 160, 760);
  ctx.restore();
  if (L.pattern === 'tank') {
    ctx.fillStyle = L.skin;
    for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sx * 200, 230, 70, 90, 0, 0, 7); ctx.fill(); }
  }
  // Cuello de la camisa
  ctx.fillStyle = shade(shirt, 0.75);
  ctx.beginPath(); ctx.moveTo(-70, 160); ctx.lineTo(0, 240); ctx.lineTo(70, 160); ctx.fill();
  // Cuello
  ctx.fillStyle = shade(L.skin, 0.85);
  rr(ctx, -55, 100, 110, 90, 30); ctx.fill();
  if (L.chain) {
    ctx.strokeStyle = '#f2c94c'; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.arc(0, 150, 85, 0.25, Math.PI - 0.25); ctx.stroke();
    ctx.fillStyle = '#f2c94c'; ctx.beginPath(); ctx.arc(0, 238, 16, 0, 7); ctx.fill();
  }

  // ---- Cabeza ----
  const hg = ctx.createRadialGradient(-50, -60, 30, 0, 0, 190);
  hg.addColorStop(0, shade(L.skin, 1.08)); hg.addColorStop(1, shade(L.skin, 0.82));
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.moveTo(0, -170);
  ctx.bezierCurveTo(130, -170, 155, -60, 150, 10);
  ctx.bezierCurveTo(145, 100, 80, 150, 0, 150);
  ctx.bezierCurveTo(-80, 150, -145, 100, -150, 10);
  ctx.bezierCurveTo(-155, -60, -130, -170, 0, -170);
  ctx.fill();
  // Orejas
  ctx.fillStyle = shade(L.skin, 0.9);
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sx * 150, 10, 24, 40, 0, 0, 7); ctx.fill(); }
  if (L.beard) {
    ctx.fillStyle = L.hair_color;
    ctx.beginPath(); ctx.moveTo(-140, 30); ctx.bezierCurveTo(-130, 150, 130, 150, 140, 30);
    ctx.bezierCurveTo(100, 90, -100, 90, -140, 30); ctx.fill();
  }

  // ---- Pelo / gorra ----
  ctx.fillStyle = L.hair_color;
  if (L.hair === 'short' || L.hair === 'curly' || L.hair === 'long') {
    ctx.beginPath(); ctx.moveTo(-152, -10);
    ctx.bezierCurveTo(-170, -200, 170, -200, 152, -10);
    ctx.bezierCurveTo(130, -110, 40, -120, -20, -105);
    ctx.bezierCurveTo(-90, -100, -130, -80, -152, -10); ctx.fill();
    if (L.hair === 'curly') for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(-130 + i * 32, -150 + Math.abs(i - 4) * 8, 34, 0, 7); ctx.fill(); }
    if (L.hair === 'long') { ctx.fillRect(-170, -60, 40, 260); ctx.fillRect(130, -60, 40, 260); }
  } else if (L.hair === 'buzz') {
    ctx.globalAlpha = 0.55;
    ctx.beginPath(); ctx.moveTo(-150, -40); ctx.bezierCurveTo(-160, -190, 160, -190, 150, -40); ctx.bezierCurveTo(100, -120, -100, -120, -150, -40); ctx.fill();
    ctx.globalAlpha = 1;
  } else if (L.hair === 'mohawk') {
    ctx.beginPath(); ctx.moveTo(-30, -160); ctx.lineTo(0, -260); ctx.lineTo(30, -160); ctx.fill();
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-40 + i * 20, -155); ctx.lineTo(-30 + i * 20, -240 + Math.abs(i - 2) * 15); ctx.lineTo(-20 + i * 20, -155); ctx.fill(); }
  }
  if (L.cap) {
    ctx.fillStyle = L.cap;
    ctx.beginPath(); ctx.moveTo(-158, -60); ctx.bezierCurveTo(-160, -215, 160, -215, 158, -60); ctx.closePath(); ctx.fill();
    ctx.fillStyle = shade(L.cap, 0.75);
    ctx.beginPath(); ctx.ellipse(40, -62, 175, 30, -0.05, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; rr(ctx, -40, -150, 80, 40, 10); ctx.fill();
  }

  // ---- Cara ----
  const look = (opts.look || 0) * 14;
  const blink = opts.blink || 0;
  const browY = { angry: -52, shocked: -80, scared: -78, sad: -62, smug: -62, happy: -66 }[mood] ?? -66;
  const browTilt = { angry: 0.35, sad: -0.3, scared: -0.25, smug: 0.15 }[mood] ?? 0;
  // Ojos
  for (const sx of [-1, 1]) {
    const ex = sx * 58, ey = -20;
    const eh = (mood === 'shocked' || mood === 'scared' ? 46 : mood === 'smug' || mood === 'angry' ? 26 : 36) * (1 - blink * 0.95);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.ellipse(ex, ey, 34, Math.max(2, eh), 0, 0, 7); ctx.fill();
    if (eh > 6) {
      ctx.fillStyle = '#1b1b22';
      const pr = mood === 'shocked' ? 13 : 17;
      ctx.beginPath(); ctx.arc(ex + look, ey + 4, pr, 0, 7); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ex + look - 5, ey - 2, 5, 0, 7); ctx.fill();
    }
    if (mood === 'smug' || mood === 'angry') { ctx.fillStyle = shade(L.skin, 0.9); ctx.fillRect(ex - 36, ey - 50, 72, 30 + (mood === 'angry' ? 4 : 10)); }
    // Ceja
    ctx.save();
    ctx.translate(ex, browY); ctx.rotate(-sx * browTilt);
    ctx.fillStyle = L.hair === 'bald' ? '#3a2a20' : L.hair_color;
    rr(ctx, -40, -9, 80, 18, 9); ctx.fill();
    ctx.restore();
  }
  if (L.glasses) {
    ctx.fillStyle = 'rgba(10,10,20,0.92)';
    for (const sx of [-1, 1]) { rr(ctx, sx * 58 - 52, -52, 104, 62, 20); ctx.fill(); }
    ctx.fillRect(-10, -36, 20, 10);
    ctx.fillStyle = 'rgba(255,90,180,0.35)';
    for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * 58 - 40, -45); ctx.lineTo(sx * 58 - 10, -45); ctx.lineTo(sx * 58 - 40, -5); ctx.fill(); }
  }
  // Nariz
  ctx.fillStyle = shade(L.skin, 0.8);
  ctx.beginPath(); ctx.ellipse(0, 30, 16, 12, 0, 0, 7); ctx.fill();
  // Boca
  const open = opts.talk || 0;
  const my = 82;
  ctx.fillStyle = '#4a1414';
  ctx.strokeStyle = '#3a1010'; ctx.lineWidth = 8; ctx.lineCap = 'round';
  if (open > 0.08 || mood === 'shocked' || mood === 'scared') {
    const h = mood === 'shocked' ? 40 : 10 + open * 34;
    const w = mood === 'happy' ? 50 : 38;
    ctx.beginPath(); ctx.ellipse(0, my, w, h, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillRect(-w * 0.7, my - h + 2, w * 1.4, Math.min(10, h * 0.4));
  } else if (mood === 'happy' || mood === 'smug') {
    ctx.beginPath(); ctx.moveTo(-50, my - 10); ctx.quadraticCurveTo(0, my + (mood === 'smug' ? 20 : 40), 55, my - (mood === 'smug' ? 22 : 10)); ctx.stroke();
  } else if (mood === 'sad') {
    ctx.beginPath(); ctx.moveTo(-40, my + 14); ctx.quadraticCurveTo(0, my - 16, 40, my + 14); ctx.stroke();
  } else if (mood === 'angry') {
    ctx.beginPath(); ctx.moveTo(-42, my + 8); ctx.lineTo(42, my); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.moveTo(-34, my); ctx.quadraticCurveTo(0, my + 8, 34, my); ctx.stroke();
  }
  // Gota de sudor
  if (mood === 'scared' || mood === 'shocked') {
    const k = (t * 0.7) % 1;
    ctx.fillStyle = 'rgba(150,210,255,0.9)';
    ctx.beginPath(); ctx.ellipse(130, -110 + k * 90, 12, 20, 0, 0, 7); ctx.fill();
  }
  // Vena de enfado
  if (mood === 'angry') {
    ctx.strokeStyle = '#e0303a'; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(85, -130); ctx.lineTo(105, -110); ctx.moveTo(105, -130); ctx.lineTo(85, -110); ctx.stroke();
  }
  ctx.restore();
}
