// Escenas de comedia en una ciudad tropical de neones (ambiente tipo "GTA 6", diseño propio).
import { W, H, PALETTE as P, rr, radial, rgba, seg, ease, lerp, clamp, noise1 } from '../lib/util.mjs';
import { drawToon, mouthOpen } from '../lib/toon.mjs';
import { blinkAt } from '../lib/parts.mjs';
import { linearBg } from './vehicle.mjs';

// ---------- Fondos ----------
function sky(ctx, night = false) {
  ctx.fillStyle = linearBg(ctx, 0, 0, 0, 1150, night ? ['#05061a', '#1a1040', '#3a1a5a'] : ['#2b1458', '#7a2a8c', '#ff4f8b', '#ffb35c']);
  ctx.fillRect(0, 0, W, 1200);
  if (!night) {
    // Sol con franjas
    ctx.save();
    ctx.beginPath(); ctx.arc(W / 2, 900, 260, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = linearBg(ctx, 0, 640, 0, 1160, ['#fff4a8', '#ffb35c', '#ff5f8f']);
    ctx.fillRect(W / 2 - 260, 640, 520, 520);
    ctx.fillStyle = '#ff4f8b';
    for (let i = 0; i < 6; i++) ctx.fillRect(W / 2 - 260, 900 + i * 40, 520, 6 + i * 3);
    ctx.restore();
  } else {
    for (let i = 0; i < 70; i++) { ctx.fillStyle = `rgba(255,255,255,${0.3 + (i % 5) * 0.12})`; ctx.fillRect((i * 151) % W, (i * 89) % 700, 2, 2); }
  }
}

export function palm(ctx, x, y, h, t = 0, flip = 1, color = '#1a0b2e') {
  ctx.save(); ctx.translate(x, y); ctx.scale(flip, 1);
  ctx.strokeStyle = color; ctx.lineWidth = h * 0.05; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(h * 0.15, -h * 0.5, h * 0.05, -h); ctx.stroke();
  ctx.fillStyle = color;
  const sway = Math.sin(t * 1.2) * 0.05;
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI / 2 + (i - 3) * 0.5 + sway;
    ctx.save(); ctx.translate(h * 0.05, -h); ctx.rotate(a);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(h * 0.25, -h * 0.12, h * 0.45, h * 0.08);
    ctx.quadraticCurveTo(h * 0.25, -h * 0.02, 0, 0); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function neonSign(ctx, x, y, text, color, t, size = 54) {
  const on = noise1(t * 4, x) > 0.12 ? 1 : 0.35;
  ctx.save();
  ctx.font = `700 ${size}px Poppins`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.shadowColor = color; ctx.shadowBlur = 30 * on;
  ctx.fillStyle = on > 0.5 ? '#fff' : rgba(color, 0.6);
  ctx.fillText(text, x, y);
  ctx.shadowBlur = 0; ctx.strokeStyle = rgba(color, 0.9 * on); ctx.lineWidth = 3; ctx.strokeText(text, x, y);
  ctx.restore();
}

function buildings(ctx, t, night) {
  const cols = ['#ff8fb1', '#5fd3c8', '#ffd27a', '#b48cff', '#ff9a6b'];
  const xs = [-40, 200, 430, 650, 860];
  xs.forEach((x, i) => {
    const h = 420 + ((i * 137) % 260), y = 1180 - h, w = 230;
    ctx.fillStyle = night ? '#1e1736' : cols[i];
    ctx.fillRect(x, y, w, h + 20);
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(x + w - 40, y, 40, h + 20);
    // Franjas art déco
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(x, y + 40, w, 10); ctx.fillRect(x, y + 60, w, 4);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
      ctx.fillStyle = night ? rgba(P.amber, (r + c + i) % 3 ? 0.85 : 0.15) : 'rgba(40,60,90,0.45)';
      rr(ctx, x + 25 + c * 65, y + 100 + r * 85, 40, 50, 6); ctx.fill();
    }
  });
  neonSign(ctx, 315, 760, 'MOTEL', '#ff3fa4', t);
  neonSign(ctx, 765, 640, '24H', '#38e1ff', t + 3, 70);
}

const BG = {
  street(ctx, t) {
    sky(ctx);
    buildings(ctx, t, false);
    palm(ctx, 120, 1220, 720, t, 1); palm(ctx, 980, 1220, 640, t + 1, -1);
    ctx.fillStyle = '#2a2140'; ctx.fillRect(0, 1180, W, H);
    ctx.fillStyle = '#ffd27a'; for (let x = 0; x < W; x += 160) ctx.fillRect(x, 1300, 80, 10);
  },
  night(ctx, t) {
    sky(ctx, true);
    buildings(ctx, t, true);
    palm(ctx, 120, 1220, 720, t, 1, '#07040f'); palm(ctx, 980, 1220, 640, t + 1, -1, '#07040f');
    ctx.fillStyle = '#100c1e'; ctx.fillRect(0, 1180, W, H);
  },
  beach(ctx, t) {
    sky(ctx);
    ctx.fillStyle = linearBg(ctx, 0, 1000, 0, 1250, ['#3fb6c8', '#1f6f9a']);
    ctx.fillRect(0, 1000, W, 260);
    ctx.fillStyle = 'rgba(255,240,200,0.6)';
    for (let i = 0; i < 10; i++) ctx.fillRect(W / 2 - 200 + Math.sin(t * 2 + i) * 30, 1010 + i * 22, 400 - i * 20, 5);
    ctx.fillStyle = '#f4d7a1'; ctx.beginPath(); ctx.moveTo(0, 1220); ctx.quadraticCurveTo(W / 2, 1180, W, 1230); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
    // Torre de socorrista
    ctx.fillStyle = '#ff6f91'; ctx.fillRect(820, 980, 170, 110);
    ctx.fillStyle = '#fff'; ctx.fillRect(840, 1000, 130, 40);
    ctx.strokeStyle = '#6b4a2a'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(830, 1090); ctx.lineTo(810, 1230); ctx.moveTo(980, 1090); ctx.lineTo(1000, 1230); ctx.stroke();
    palm(ctx, 90, 1250, 760, t, 1);
  },
  store(ctx, t) {
    ctx.fillStyle = linearBg(ctx, 0, 0, 0, H, ['#dfe9ef', '#c7d6de']); ctx.fillRect(0, 0, W, H);
    // Estanterías
    const prod = ['#ff4f6d', '#ffd34d', '#3fd17a', '#4f8bff', '#ff9a3d', '#b05cff'];
    for (let r = 0; r < 5; r++) {
      ctx.fillStyle = '#8a97a6'; ctx.fillRect(40, 300 + r * 170, W - 80, 14);
      for (let i = 0; i < 16; i++) { ctx.fillStyle = prod[(i + r) % prod.length]; rr(ctx, 60 + i * 61, 300 + r * 170 - 90, 46, 88, 6); ctx.fill(); }
    }
    neonSign(ctx, W / 2, 170, 'ABIERTO 24H', '#ff3fa4', t, 70);
    // Fluorescentes
    ctx.fillStyle = '#fff'; for (let i = 0; i < 3; i++) ctx.fillRect(120 + i * 320, 40, 200, 14);
    // Mostrador
    ctx.fillStyle = '#5b3a8a'; ctx.fillRect(0, 1330, W, H);
    ctx.fillStyle = '#7a52b5'; ctx.fillRect(0, 1330, W, 26);
  },
  room(ctx, t) {
    ctx.fillStyle = '#1a1230'; ctx.fillRect(0, 0, W, H);
    // Tira LED
    ctx.fillStyle = `hsl(${(t * 40) % 360},90%,60%)`; ctx.fillRect(0, 120, W, 8);
    radial(ctx, W / 2, 130, 700, '#b05cff', 0.18);
    // Tele con "partida"
    ctx.fillStyle = '#0a0a12'; rr(ctx, 140, 380, 800, 470, 20); ctx.fill();
    const g = ctx.createLinearGradient(160, 400, 160, 830); g.addColorStop(0, '#ff7aa8'); g.addColorStop(1, '#ffb35c');
    ctx.fillStyle = g; ctx.fillRect(160, 400, 760, 430);
    palm(ctx, 300, 830, 330, t, 1, '#3a1a4a'); palm(ctx, 800, 830, 280, t, -1, '#3a1a4a');
    ctx.fillStyle = '#2a1a3a'; ctx.fillRect(160, 760, 760, 70);
    radial(ctx, W / 2, 620, 800, '#ff7aa8', 0.22);
    // Sofá
    ctx.fillStyle = '#3d2a6e'; rr(ctx, -40, 1350, W + 80, 600, 80); ctx.fill();
  },
  police(ctx, t) {
    BG.night(ctx, t);
    const red = Math.sin(t * 14) > 0;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    radial(ctx, red ? 200 : 880, 900, 900, red ? '#ff2a3a' : '#2a6bff', 0.45);
    ctx.restore();
  },
};

export const BACKGROUNDS = Object.keys(BG);

function drawBg(ctx, name, t) { (BG[name] || BG.street)(ctx, t); }

// ¿Habla este personaje ahora? (el renderer marca quién habla en el plano y cuánto dura su voz)
function talkFor(id, p) {
  if (!id || p.speaker !== id) return 0;
  if (p.voice_dur && p.t > p.voice_dur) return 0;
  return mouthOpen(p.t, true, id.length);
}

const look = (p, id) => (p.cast && p.cast[id] && p.cast[id].look) || {};

// Dos personajes hablando. params: { bg, left, right, left_mood, right_mood }
export const duo = {
  setup() { return {}; },
  draw(ctx, s, p) {
    const { t, params } = p;
    const ids = Object.keys(p.cast || {});
    const left = params.left || ids[0], right = params.right || ids[1] || ids[0];
    drawBg(ctx, params.bg, t);
    const lt = talkFor(left, p), rt = talkFor(right, p);
    // El que escucha mira al que habla
    drawToon(ctx, 290, 1020, 1.12, look(p, left), { mood: params.left_mood, talk: lt, look: 0.6, blink: blinkAt(t, 1), t });
    drawToon(ctx, 800, 1045, 1.12, look(p, right), { mood: params.right_mood, talk: rt, look: -0.6, blink: blinkAt(t, 2), t });
  },
};

// Primer plano de un personaje. params: { bg, who, mood }
export const closeup = {
  setup() { return {}; },
  draw(ctx, s, p) {
    const { t, params } = p;
    const who = params.who || p.speaker || Object.keys(p.cast || {})[0];
    drawBg(ctx, params.bg, t);
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(0, 0, W, H);
    drawToon(ctx, W / 2, 880, 1.6, look(p, who), { mood: params.mood, talk: talkFor(who, p), look: Math.sin(t * 0.6) * 0.2, blink: blinkAt(t, 3), t });
  },
};

// Plano general de la ciudad. params: { night?: bool, car?: bool }
export const vice_street = {
  setup() { return {}; },
  draw(ctx, s, p) {
    const { t, params, prog } = p;
    drawBg(ctx, params.night ? 'night' : 'street', t);
    if (params.car) drawCar(ctx, lerp(-500, W + 200, ease.inOut(prog)), 1420, 1.1, '#ff3f6c', t, []);
  },
};

// Playa. params: {}
export const vice_beach = {
  setup() { return {}; },
  draw(ctx, s, p) { drawBg(ctx, 'beach', p.t); },
};

// Coche deportivo descapotable de lado.
function drawCar(ctx, x, y, sc, color, t, riders, p) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(250, 120, 300, 30, 0, 0, 7); ctx.fill();
  // Pasajeros (cabezas) detrás de la carrocería
  riders.forEach((r, i) => drawToon(ctx, 150 + i * 200, -150, 0.5, r.look, { mood: r.mood, talk: r.talk, look: i ? -0.5 : 0.5, blink: blinkAt(t, i + 4), t }));
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(-40, 60); ctx.lineTo(-20, -10); ctx.lineTo(120, -30); ctx.lineTo(380, -30); ctx.lineTo(520, 0); ctx.lineTo(540, 60); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(0, -2, 500, 8);
  ctx.fillStyle = 'rgba(160,220,255,0.6)'; ctx.beginPath(); ctx.moveTo(330, -30); ctx.lineTo(300, -90); ctx.lineTo(312, -90); ctx.lineTo(350, -30); ctx.fill();
  for (const wx of [60, 420]) {
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(wx, 70, 56, 0, 7); ctx.fill();
    ctx.fillStyle = '#c9ccd6'; ctx.beginPath(); ctx.arc(wx, 70, 26, 0, 7); ctx.fill();
    ctx.strokeStyle = '#555'; ctx.lineWidth = 5; const a = t * 20;
    ctx.beginPath(); ctx.moveTo(wx + Math.cos(a) * 24, 70 + Math.sin(a) * 24); ctx.lineTo(wx - Math.cos(a) * 24, 70 - Math.sin(a) * 24); ctx.stroke();
  }
  radial(ctx, 535, 20, 60, '#fff3b0', 0.9);
  ctx.restore();
}

// Paseo en descapotable con dos personajes. params: { driver, passenger, driver_mood, passenger_mood, night }
export const car_ride = {
  setup() { return {}; },
  draw(ctx, s, p) {
    const { t, params } = p;
    const ids = Object.keys(p.cast || {});
    const d = params.driver || ids[0], q = params.passenger || ids[1];
    sky(ctx, !!params.night);
    // Fondo que se desplaza (parallax)
    for (let i = 0; i < 6; i++) {
      const x = ((i * 260 - t * 420) % (W + 400) + W + 400) % (W + 400) - 200;
      palm(ctx, x, 1250, 600 + (i % 3) * 60, t, i % 2 ? 1 : -1, params.night ? '#07040f' : '#1a0b2e');
    }
    ctx.fillStyle = params.night ? '#100c1e' : '#2a2140'; ctx.fillRect(0, 1240, W, H);
    ctx.fillStyle = '#ffd27a';
    for (let i = 0; i < 8; i++) ctx.fillRect(((i * 200 - t * 900) % (W + 200) + W + 200) % (W + 200) - 100, 1600, 110, 12);
    const riders = [d, q].filter(Boolean).map((id, i) => ({ look: look(p, id), mood: params[i ? 'passenger_mood' : 'driver_mood'], talk: talkFor(id, p) }));
    drawCar(ctx, 110, 1380 + Math.sin(t * 8) * 4, 1.6, params.color || '#ff3f6c', t, riders);
  },
};

// Persecución policial de noche. params: { who, mood }
export const police_chase = {
  setup() { return {}; },
  draw(ctx, s, p) {
    const { t, params, prog } = p;
    drawBg(ctx, 'police', t);
    const who = params.who || Object.keys(p.cast || {})[0];
    drawCar(ctx, lerp(300, 420, prog), 1430 + Math.sin(t * 12) * 5, 1.2, '#ff3f6c', t, who ? [{ look: look(p, who), mood: params.mood || 'scared', talk: talkFor(who, p) }] : []);
    // Coche patrulla detrás
    ctx.save(); ctx.translate(lerp(-260, -120, prog), 1470); ctx.scale(1.1, 1.1);
    ctx.fillStyle = '#f2f2f2'; ctx.fillRect(0, -20, 420, 80);
    ctx.fillStyle = '#111'; ctx.fillRect(0, 10, 420, 26);
    ctx.fillStyle = Math.sin(t * 14) > 0 ? '#ff2a3a' : '#2a6bff'; rr(ctx, 160, -50, 100, 30, 8); ctx.fill();
    ctx.fillStyle = '#111'; for (const wx of [70, 340]) { ctx.beginPath(); ctx.arc(wx, 70, 50, 0, 7); ctx.fill(); }
    ctx.restore();
  },
};
