// pedido-e2-01 — "What If the Sun Disappeared Right Now?" — estilo PAPEL con diálogo
import { lerp, ease, back, ph, clamp, personaje, capa, SUELO, rotulo, texto, rr, hash, exterior, espacio, W, H } from '../../lib/papel.mjs';
import { tierra, luna, termometro, fumarola, gusanoTubo, planta } from '../../lib/papel3.mjs';
const U = (a) => clamp(a.t / a.d);
const habla = (a, id) => a.speaker === id && a.t < (a.voice_dur || a.d) - 0.05;
export const ASTRO = { skin: '#c98e64', hair: 'mono', hairCol: '#1e1a18', ropa: '#5a4fcf', pants: '#2f2a3e', shoes: '#2c2433', mujer: true };
export const YOU = { skin: '#f4d0b0', hair: 'corto', hairCol: '#3a2a1a', ropa: '#4caf7a', pants: '#4a5a6e', shoes: '#f1ece4' };
const F = SUELO + 40;
// Cuenta atrás de la luz (pantalla): seg restantes
function cuenta(ctx, seg, y = 660, s = 0.85) { const sg = Math.max(0, Math.ceil(seg)); const m = Math.floor(sg / 60), ss = sg % 60; const rojo = sg <= 30;
  ctx.save(); ctx.translate(540, y); ctx.scale(s, s); rr(ctx, -250, -95, 500, 190, 26); ctx.fillStyle = 'rgba(25,20,35,0.92)'; ctx.fill(); ctx.strokeStyle = rojo ? '#ff4a4a' : '#ffd93d'; ctx.lineWidth = 10; ctx.stroke();
  texto(ctx, `${m}:${String(ss).padStart(2, '0')}`, 0, 10, 150, rojo ? '#ff6b4a' : '#ffd93d'); ctx.restore(); }
// segundos de luz restantes por plano (cámara rápida: 8:20 → 0:00 entre los planos 0 y 4)
const TRAMO = { 0: [500, 470], 1: [470, 400], 2: [400, 300], 3: [300, 1] };
const quedan = (a, n) => { const r = TRAMO[n]; return r ? lerp(r[0], r[1], U(a)) : 0; };
// Parque de día; oscuro 0..1 = se apaga todo
function parque(ctx, t, cam, oscuro = 0) { if (oscuro >= 1) exterior(ctx, t, cam, { cielo: 'noche' }); else exterior(ctx, t, cam, { cielo: 'dia' }); }
function apagon(ctx, k) { if (k <= 0) return; ctx.save(); ctx.fillStyle = `rgba(6,8,28,${0.78 * clamp(k)})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
// escarcha en pantalla
function escarcha(ctx, t, k) { if (k <= 0) return; ctx.save(); ctx.globalAlpha = 0.85 * k; ctx.fillStyle = '#e8f6ff';
  for (let i = 0; i < 60; i++) { const x = hash(i) * W, y = ((hash(i + 3) * H + t * (60 + hash(i + 9) * 80)) % H); ctx.beginPath(); ctx.arc(x, y, 3 + hash(i + 5) * 5, 0, 7); ctx.fill(); }
  const g = ctx.createRadialGradient(540, 960, 500, 540, 960, 1100); g.addColorStop(0, 'rgba(220,240,255,0)'); g.addColorStop(1, `rgba(220,240,255,${0.6 * k})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); }
// el hueco donde estaba el Sol
function hueco(ctx, t, x, y, r) { ctx.save(); ctx.setLineDash([22, 18]); ctx.lineDashOffset = -t * 30; ctx.strokeStyle = 'rgba(255,217,61,0.85)'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke(); ctx.restore(); texto(ctx, '?', x, y + 30, r * 0.9, 'rgba(255,217,61,0.85)'); }
// Inserto circular "vista desde el espacio"
function inserto(ctx, t, x, y, r, fn) { ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = '#070a20'; ctx.fill(); ctx.clip(); for (let i = 0; i < 30; i++) { ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.4 + 0.6 * hash(i); ctx.fillRect(x - r + hash(i) * 2 * r, y - r + hash(i + 40) * 2 * r, 3, 3); } ctx.globalAlpha = 1; fn(); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.strokeStyle = '#2a2230'; ctx.lineWidth = 10; ctx.stroke(); ctx.restore(); }
// Chaqueta en la mano
const CHAQ = (c) => { c.save(); c.beginPath(); c.moveTo(-50, 0); c.lineTo(50, 0); c.lineTo(70, 170); c.lineTo(-70, 170); c.closePath(); c.fillStyle = '#c0392b'; c.fill(); c.strokeStyle = '#2a2230'; c.lineWidth = 5; c.stroke(); c.restore(); };

export default {
  // 0 — ASTRO: "The Sun just disappeared. And you have no idea."
  0: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.1, 1.02, u), fx: 540, fy: 1150, t };
    parque(ctx, t, cam);
    capa(ctx, cam, 1, () => {
      personaje(ctx, t, YOU, 650, F + 20, 0.95, { mood: 'feliz', sentado: true, mira: [0.4, -0.3], manoI: [-140, -280], manoD: [140, -280], cierra: true });
      personaje(ctx, t, ASTRO, 300, F, 0.95, { mood: 'miedo', habla: habla(a, 'girl'), mira: [0.7, 0], manoD: [160, -320] });
    });
    inserto(ctx, t, 790, 980, 170, () => hueco(ctx, t, 790, 980, 90));
    rotulo(ctx, -1, t, 'THE SUN', 540, 300, 150, '#ffffff'); rotulo(ctx, -1, t, 'IS GONE', 540, 450, 170, '#ff6b4a');
    cuenta(ctx, quedan(a, 0), 640, 0.7); },
  // 1 — YOU: "Pretty sure I'd notice."
  1: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.35, 1.42, u), fx: 650, fy: 1150, t };
    parque(ctx, t, cam);
    capa(ctx, cam, 1, () => { personaje(ctx, t, YOU, 650, F + 20, 0.95, { mood: 'feliz', habla: habla(a, 'guy'), sentado: true, mira: [-0.5, -0.1], manoI: [-140, -280], manoD: [200, -380] }); });
    cuenta(ctx, quedan(a, 1), 640, 0.7); },
  // 2 — ASTRO: "Not for eight minutes."
  2: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.3, 1.38, u), fx: 300, fy: 1150, t };
    parque(ctx, t, cam);
    capa(ctx, cam, 1, () => { personaje(ctx, t, ASTRO, 300, F, 0.95, { mood: 'neutral', habla: habla(a, 'girl'), mira: [0.6, 0], manoD: [150, -430] }); });
    rotulo(ctx, 0.2, t, '8 MINUTES', 540, 320, 160, '#ffd93d');
    cuenta(ctx, quedan(a, 2), 660, 0.9); },
  // 3 — NARR: "Sunlight takes 8 min 20 s to reach us… everything looks normal."
  3: (ctx, a) => { const t = a.t, u = U(a), d = a.d; const cam = { z: 1, fx: 540, fy: 960, t };
    espacio(ctx, t, cam);
    capa(ctx, cam, 1, () => { hueco(ctx, t, 150, 1100, 110);
      const cola = lerp(260, 820, u); const g = ctx.createLinearGradient(cola, 0, 960, 0); g.addColorStop(0, 'rgba(255,220,90,0)'); g.addColorStop(0.3, 'rgba(255,220,90,0.75)'); g.addColorStop(1, 'rgba(255,240,160,0.95)'); ctx.fillStyle = g; ctx.fillRect(cola, 1040, 960 - cola, 120);
      tierra(ctx, t, 940, 1100, 110, 1);
      ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.setLineDash([16, 14]); ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(150, 1300); ctx.lineTo(940, 1300); ctx.stroke(); ctx.restore();
      texto(ctx, '150 MILLION KM', 545, 1370, 54, '#ffffff'); });
    rotulo(ctx, 0.2, t, 'LIGHT STILL', 540, 300, 130, '#ffffff'); rotulo(ctx, d * 0.35, t, 'ON ITS WAY', 540, 440, 130, '#ffd93d');
    cuenta(ctx, quedan(a, 3), 640, 0.9); },
  // 4 — NARR: "Then… the lights go out."
  4: (ctx, a) => { const t = a.t, u = U(a), d = a.d; const T0 = d * 0.35; const k = ph(t, T0, T0 + 0.25); const cam = { z: lerp(1.05, 1.1, u), fx: 540, fy: 1150, t, temblor: k > 0 && k < 1 ? 6 : 0 };
    parque(ctx, t, cam, k);
    capa(ctx, cam, 1, () => {
      personaje(ctx, t, YOU, 650, F + 20, 0.95, { mood: k > 0 ? 'miedo' : 'feliz', sentado: k <= 0, salto: k > 0 ? 0.3 : 0, mira: [-0.2, -0.6], manoI: [-140, -300], manoD: [140, -300] });
      personaje(ctx, t, ASTRO, 300, F, 0.95, { mood: 'miedo', mira: [0.3, -0.6] });
    });
    apagon(ctx, k * 0.6);
    cuenta(ctx, t < T0 ? lerp(3, 0.1, t / T0) : 0, 640, 0.9);
    if (k > 0) rotulo(ctx, T0, t, 'LIGHTS OUT', 540, 330, 170, '#ff6b4a'); },
  // 5 — YOU: "Okay. I'll use the Moon."
  5: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.1, 1.16, u), fx: 600, fy: 1100, t };
    parque(ctx, t, cam, 1);
    capa(ctx, cam, 0.4, () => luna(ctx, 300, 760, 110, 0.9));
    capa(ctx, cam, 1, () => { personaje(ctx, t, YOU, 650, F + 20, 0.95, { mood: 'feliz', habla: habla(a, 'guy'), mira: [-0.6, -0.6], manoD: [-200, -480], manoI: [-100, -150] }); });
    apagon(ctx, 0.35); },
  // 6 — ASTRO: "The Moon's dark too. It only reflects the Sun."
  6: (ctx, a) => { const t = a.t, u = U(a), d = a.d; const lz = 1 - ease(ph(t, 0.3, d * 0.5)); const cam = { z: lerp(1.0, 1.06, u), fx: 540, fy: 1100, t };
    parque(ctx, t, cam, 1);
    capa(ctx, cam, 0.4, () => luna(ctx, 540, 760, 140, lz * 0.9));
    capa(ctx, cam, 1, () => {
      personaje(ctx, t, ASTRO, 300, F, 0.95, { mood: 'neutral', habla: habla(a, 'girl'), mira: [0.3, -0.5], manoD: [150, -420] });
      personaje(ctx, t, YOU, 720, F + 20, 0.95, { mood: lz < 0.5 ? 'triste' : 'feliz', mira: [-0.3, -0.6] });
    });
    apagon(ctx, 0.35);
    rotulo(ctx, 0.3, t, 'MOON: DARK', 540, 300, 140, '#ffffff'); rotulo(ctx, d * 0.5, t, 'NO SUN TO REFLECT', 540, 450, 90, '#ffd93d'); },
  // 7 — NARR: "Earth stops orbiting… and drifts off in a straight line."
  7: (ctx, a) => { const t = a.t, u = U(a), d = a.d; const cam = { z: 1, fx: 540, fy: 960, t };
    espacio(ctx, t, cam);
    capa(ctx, cam, 1, () => { const cx = 540, cy = 1050, R = 330; hueco(ctx, t, cx, cy, 90);
      ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.setLineDash([18, 14]); ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke(); ctx.restore();
      const T0 = d * 0.3; let x, y; if (t < T0) { const ang = -2.2 + t * 0.9; x = cx + Math.cos(ang) * R; y = cy + Math.sin(ang) * R; } else { const ang = -2.2 + T0 * 0.9; const vx = -Math.sin(ang), vy = Math.cos(ang); const s = (t - T0) * 260; x = cx + Math.cos(ang) * R + vx * s; y = cy + Math.sin(ang) * R + vy * s;
        ctx.save(); ctx.strokeStyle = '#ff6b4a'; ctx.lineWidth = 8; ctx.setLineDash([24, 16]); ctx.beginPath(); ctx.moveTo(cx + Math.cos(ang) * R, cy + Math.sin(ang) * R); ctx.lineTo(x, y); ctx.stroke(); ctx.restore(); }
      tierra(ctx, t, x, y, 70, 0.25); });
    rotulo(ctx, 0.2, t, 'NO ORBIT', 540, 300, 150, '#ffffff'); rotulo(ctx, d * 0.4, t, 'STRAIGHT LINE', 540, 450, 120, '#ff6b4a'); },
  // 8 — YOU: "Fine. I'll grab a jacket."
  8: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.3, 1.36, u), fx: 600, fy: 1100, t };
    parque(ctx, t, cam, 1);
    capa(ctx, cam, 1, () => { personaje(ctx, t, YOU, 600, F + 20, 0.98, { mood: 'esfuerzo', habla: habla(a, 'guy'), mira: [-0.3, 0], manoD: [160, -330], sostieneD: CHAQ, manoI: [-120, -200], cabeza: Math.sin(t * 20) * 0.03 }); });
    apagon(ctx, 0.3); escarcha(ctx, t, 0.3); },
  // 9 — ASTRO: "In a week, below zero F. In a year, minus one hundred."
  9: (ctx, a) => { const t = a.t, u = U(a), d = a.d; const k = ease(ph(t, 0.2, d * 0.9)); const cam = { z: lerp(1.05, 1.1, u), fx: 540, fy: 1100, t };
    parque(ctx, t, cam, 1);
    capa(ctx, cam, 1, () => {
      personaje(ctx, t, ASTRO, 260, F, 0.95, { mood: 'neutral', habla: habla(a, 'girl'), mira: [0.6, 0], manoD: [180, -300] });
      personaje(ctx, t, YOU, 560, F + 20, 0.95, { mood: 'miedo', mira: [0.5, -0.2], manoI: [60, -300], manoD: [-60, -300], cabeza: Math.sin(t * 30) * 0.04 });
      termometro(ctx, 860, F - 40, 600, 1 - k * 0.95, '#5fb3e9');
    });
    apagon(ctx, 0.3); escarcha(ctx, t, 0.3 + 0.6 * k);
    rotulo(ctx, 0.2, t, '1 WEEK: BELOW 0 F', 540, 300, 100, '#8fe3ff'); rotulo(ctx, d * 0.5, t, '1 YEAR: -100 F', 540, 450, 130, '#ffffff'); },
  // 10 — NARR: "Plants stop making food… food chains collapse."
  10: (ctx, a) => { const t = a.t, u = U(a), d = a.d; const sk = ease(ph(t, 0.1, d * 0.6)); const cam = { z: lerp(1.15, 1.25, u), fx: 540, fy: 1250, t };
    parque(ctx, t, cam, 1);
    capa(ctx, cam, 1, () => { for (let i = 0; i < 4; i++) planta(ctx, t, 220 + i * 220, F + 10 - (i % 2) * 20, 0.9, sk); });
    apagon(ctx, 0.3); escarcha(ctx, t, 0.6);
    rotulo(ctx, 0.2, t, 'NO PLANTS', 540, 300, 150, '#ffffff'); rotulo(ctx, d * 0.5, t, 'NO FOOD', 540, 450, 150, '#ff6b4a'); },
  // 11 — NARR: "…deep ocean hot volcanic vents… for millions of years."
  11: (ctx, a) => { const t = a.t, u = U(a), d = a.d; const cam = { z: lerp(1.0, 1.1, u), fx: 540, fy: 1200, t };
    capa(ctx, cam, 0.3, () => { const g = ctx.createLinearGradient(0, -300, 0, H); g.addColorStop(0, '#061a2e'); g.addColorStop(1, '#020812'); ctx.fillStyle = g; ctx.fillRect(-500, -500, W + 1000, H + 1000); });
    capa(ctx, cam, 1, () => { ctx.fillStyle = '#2a2430'; ctx.fillRect(-500, SUELO - 40, W + 1000, 900); fumarola(ctx, t, 540, SUELO, 1.1); for (let i = 0; i < 6; i++) gusanoTubo(ctx, t, 240 + i * 120 + (i > 2 ? 140 : 0), SUELO + 10, 0.9 + hash(i) * 0.3, i); });
    rotulo(ctx, 0.2, t, 'VOLCANIC VENTS', 540, 300, 120, '#ff9a4a'); rotulo(ctx, d * 0.55, t, 'MILLIONS OF YEARS', 540, 450, 100, '#ffffff'); },
  // 12 — YOU: "So the winners are… worms?"
  12: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.4, 1.5, u), fx: 560, fy: 1050, t };
    parque(ctx, t, cam, 1);
    capa(ctx, cam, 1, () => { personaje(ctx, t, YOU, 560, F + 20, 1.0, { mood: 'sorpresa', habla: habla(a, 'guy'), mira: [0, -0.1], manoI: [-170, -320], manoD: [170, -320], cabeza: Math.sin(t * 30) * 0.03 }); });
    apagon(ctx, 0.3); escarcha(ctx, t, 0.8);
    rotulo(ctx, 0.7, t, 'WORMS?!', 540, 320, 170, '#ffd93d'); },
  // 13 — ASTRO: "Giant tube worms. Yep."
  13: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.25, 1.35, u), fx: 540, fy: 1250, t };
    capa(ctx, cam, 0.3, () => { const g = ctx.createLinearGradient(0, -300, 0, H); g.addColorStop(0, '#061a2e'); g.addColorStop(1, '#020812'); ctx.fillStyle = g; ctx.fillRect(-500, -500, W + 1000, H + 1000); });
    capa(ctx, cam, 1, () => { ctx.fillStyle = '#2a2430'; ctx.fillRect(-500, SUELO - 40, W + 1000, 900); fumarola(ctx, t, 820, SUELO, 0.8); for (let i = 0; i < 5; i++) gusanoTubo(ctx, t, 200 + i * 110, SUELO + 10, 1.2 + hash(i) * 0.3, i); });
    rotulo(ctx, 0.2, t, 'TUBE WORMS', 540, 300, 150, '#ff6b4a'); rotulo(ctx, 0.6, t, 'WIN.', 540, 460, 170, '#ffffff'); },
};
