// pedido-d4-01 — "Don't Tap This Glass" (gamba mantis) — estilo PAPEL con diálogo
import { lerp, ease, back, ph, clamp, personaje, capa, SUELO, rotulo } from '../../lib/papel.mjs';
import { salaAcuario, tanque, grietas, mantis, cavitacion, cangrejo, bocadillo } from '../../lib/papel2.mjs';
const U = (a) => clamp(a.t / a.d);
const habla = (a, id) => a.speaker === id && a.t < (a.voice_dur || a.d) - 0.05;
export const KEEPER = { skin: '#d9a77c', hair: 'mono', hairCol: '#2a1d16', ropa: '#2f8a7a', pants: '#3b4a5a', shoes: '#2c2433', mujer: true, placa: true };
export const INTERN = { skin: '#f4d0b0', hair: 'punta', hairCol: '#c08a4a', ropa: '#f2b33a', pants: '#4a5a6e', shoes: '#f1ece4' };
const F = SUELO + 40;
// golpe periódico 0..1 (rápido)
const golpe = (t, t0, per = 1.4) => { if (t < t0) return 0; const k = ((t - t0) % per) / per; return k < 0.06 ? k / 0.06 : k < 0.3 ? 1 - (k - 0.06) / 0.24 : 0; };
// Escena estándar: tanque a la derecha, cuidadora e becario
const TX = 760, TY = 1250, TW = 600, TH = 480;
function sala(ctx, t, a, cam, { pK = {}, pI = {}, g = 0, grieta = 0, gx = TX - 220, gy = TY - 380, ix = 560, kx = 210 } = {}) {
  salaAcuario(ctx, t, cam);
  capa(ctx, cam, 1, () => {
    tanque(ctx, t, TX, TY, TW, TH, () => mantis(ctx, t, TX + 60, TY - 140, 0.55, { dir: -1, golpe: g }), grieta, gx, gy);
    personaje(ctx, t, KEEPER, kx, F + 20, 0.95, { mood: 'neutral', habla: habla(a, 'keeper'), mira: [0.6, 0], manoI: [-100, -140], manoD: [100, -140], ...pK });
    personaje(ctx, t, INTERN, ix, F + 30, 0.98, { mood: 'feliz', habla: habla(a, 'intern'), mira: [0.6, -0.1], manoI: [-100, -140], manoD: [100, -140], ...pI });
  });
}
// Primer plano dentro del tanque
function dentro(ctx, t, cam, fn, grieta = 0, gx = 540, gy = 900) {
  salaAcuario(ctx, t, cam);
  capa(ctx, cam, 1, () => tanque(ctx, t, 540, 1420, 1000, 1150, fn, grieta, gx, gy));
}

export default {
  // 0 — KEEPER: "Don't tap the glass. He taps back."
  0: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.05, 1.12, u), fx: 540, fy: 1050, t };
    const k = ease(ph(t, 0.0, 0.4));
    sala(ctx, t, a, cam, { pK: { mood: 'enfado', mira: [0.8, -0.1], manoD: [lerp(100, 230, k), lerp(-140, -330, k)] }, pI: { mood: t > 1.2 ? 'sorpresa' : 'feliz', manoD: [lerp(200, 120, k), lerp(-330, -160, k)], mira: [-0.6, 0] }, g: golpe(t, 1.5) });
    bocadillo(ctx, t, a.d * 0.65, 860, 700, 'TAP TAP', 120); },
  // 1 — INTERN: "It's a shrimp."
  1: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.3, 1.36, u), fx: 640, fy: 1100, t };
    const tap = Math.max(0, Math.sin(t * 9)) * (t > 0.3 ? 1 : 0);
    sala(ctx, t, a, cam, { pI: { mood: 'feliz', mira: [0.3, 0], manoD: [lerp(180, 230, tap), -320] } });
    bocadillo(ctx, t, 0.4, 700, 640, 'TAP', 120); },
  // 2 — KEEPER: "That's a mantis shrimp."
  2: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.35, 1.42, u), fx: 120, fy: 1150, t };
    sala(ctx, t, a, cam, { pK: { mood: 'neutral', mira: [0.4, -0.05], cierra: t > 0.9 && t < 1.0, manoI: [-60, -330], manoD: [60, -330] } });
    rotulo(ctx, 0.3, t, 'MANTIS SHRIMP', 540, 300, 120, '#ff6b4a'); },
  // 3 — NARR: one of the fastest strikes in nature… 50 mph underwater
  3: (ctx, a) => { const t = a.t, u = U(a), d = a.d; const cam = { z: lerp(1.0, 1.08, u), fx: 540, fy: 1100, t, temblor: golpe(t, 0.8, 1.1) * 6 };
    dentro(ctx, t, cam, () => mantis(ctx, t, 520, 1150, 0.95, { dir: 1, golpe: golpe(t, 0.8, 1.1) }));
    rotulo(ctx, 0.2, t, 'FASTEST PUNCH', 540, 290, 110, '#ffd93d'); rotulo(ctx, d * 0.45, t, '50 MPH', 540, 450, 160, '#ff6b4a'); rotulo(ctx, d * 0.7, t, 'UNDERWATER', 540, 580, 80, '#8fe3ff'); },
  // 4 — INTERN: "Okay, but it's tiny."
  4: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.25, 1.3, u), fx: 600, fy: 1100, t };
    sala(ctx, t, a, cam, { pI: { mood: 'feliz', mira: [-0.6, 0], manoI: [-160, -260], manoD: [-40, -260] } });
    rotulo(ctx, 0.5, t, 'TINY?', 540, 300, 140, '#ffd93d'); },
  // 5 — KEEPER: "It hits twice."
  5: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.35, 1.42, u), fx: 120, fy: 1150, t };
    const k = back(ph(t, 0.1, 0.5));
    sala(ctx, t, a, cam, { pK: { mood: 'neutral', mira: [0.3, 0], manoD: [lerp(100, 150, k), lerp(-140, -430, k)], sostieneD: k > 0 ? (c) => { c.save(); c.fillStyle = KEEPER.skin; c.strokeStyle = '#2a2230'; c.lineWidth = 5; for (const x of [-12, 12]) { c.beginPath(); c.roundRect(x - 9, -60, 18, 60, 9); c.fill(); c.stroke(); } c.restore(); } : null } });
    rotulo(ctx, 0.4, t, 'HITS TWICE', 540, 300, 140, '#ff6b4a'); },
  // 6 — NARR: water rips, bubble collapses, flash of light and heat
  6: (ctx, a) => { const t = a.t, u = U(a), d = a.d; const T0 = d * 0.15, P = d * 0.42; const g = golpe(t, T0, P);
    const kc = ((t - T0) % P) / P; const cam = { z: lerp(1.15, 1.3, u), fx: 640, fy: 1050, t, temblor: kc > 0.25 && kc < 0.35 && t > T0 ? 10 : 0 };
    dentro(ctx, t, cam, () => { mantis(ctx, t, 400, 1150, 0.95, { dir: 1, golpe: g }); if (t > T0) cavitacion(ctx, 720, 1130, clamp((kc - 0.04) / 0.4), 110); });
    rotulo(ctx, 0.2, t, 'BUBBLE', 540, 290, 140, '#8fe3ff'); rotulo(ctx, d * 0.55, t, 'LIGHT + HEAT', 540, 440, 110, '#ffd93d'); },
  // 7 — KEEPER: "Even if it misses, the bubble hits you."
  7: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.05, 1.1, u), fx: 540, fy: 1100, t };
    const kc = clamp((t - 0.6) / 0.6);
    sala(ctx, t, a, cam, { pK: { mood: 'neutral', mira: [0.4, 0], manoD: [220, -300] }, pI: { mood: kc > 0.7 ? 'miedo' : 'neutral', incl: kc > 0.7 ? -0.08 : 0, mira: [0.7, 0] }, g: golpe(t, 0.6, 3) });
    capa(ctx, cam, 1, () => cavitacion(ctx, TX - 140, TY - 150, kc > 0 && kc < 1 ? kc : 0, 70));
    rotulo(ctx, 1.0, t, 'MISS = STILL HIT', 540, 300, 110, '#ff6b4a'); },
  // 8 — INTERN: "Why would a shrimp need that?"
  8: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.3, 1.36, u), fx: 620, fy: 1100, t };
    sala(ctx, t, a, cam, { pI: { mood: 'sorpresa', mira: [-0.5, -0.1], manoI: [-170, -280], manoD: [170, -280], cabeza: Math.sin(t * 3) * 0.05 } });
    rotulo(ctx, 0.6, t, 'WHY?!', 540, 300, 150, '#ffd93d'); },
  // 9 — KEEPER: "To smash crab shells."
  9: (ctx, a) => { const t = a.t, u = U(a), d = a.d; const T0 = d * 0.45; const g = t > T0 ? golpe(t, T0, 5) : 0;
    const cam = { z: lerp(1.05, 1.12, u), fx: 540, fy: 1100, t, temblor: t > T0 && t < T0 + 0.25 ? 10 : 0 };
    dentro(ctx, t, cam, () => { mantis(ctx, t, 330, 1150, 0.9, { dir: 1, golpe: g }); cangrejo(ctx, t, 760, 1180, 1.3, clamp((t - T0 - 0.05) / 0.5)); });
    rotulo(ctx, T0, t, 'CRACK!', 540, 320, 170, '#ff6b4a'); },
  // 10 — NARR: "Some have even cracked aquarium glass… thick acrylic tanks."
  10: (ctx, a) => { const t = a.t, u = U(a), d = a.d; const T0 = d * 0.25; const g = golpe(t, T0, d * 0.3);
    const gr = clamp((t - T0) / (d * 0.6)); const cam = { z: lerp(1.0, 1.1, u), fx: 540, fy: 1050, t, temblor: g > 0.8 ? 8 : 0 };
    dentro(ctx, t, cam, () => mantis(ctx, t, 520, 1100, 0.95, { dir: 1, golpe: g }), gr > 0 ? ease(gr) * 1.3 : 0, 760, 1040);
    rotulo(ctx, 0.2, t, 'CRACKED GLASS', 540, 300, 120, '#ff6b4a'); rotulo(ctx, d * 0.55, t, 'THICK ACRYLIC', 540, 450, 90, '#ffd93d'); },
  // 11 — INTERN: "...It tapped back."
  11: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.3, 1.42, u), fx: 680, fy: 1080, t };
    const T0 = 0.25, gr = ease(clamp((t - T0) / 0.35));
    sala(ctx, t, a, cam, { pI: { mood: gr > 0 ? 'miedo' : 'neutral', mira: [-0.2, 0], incl: -0.1 * gr, manoI: [-130, -150], manoD: [130, -150] }, g: golpe(t, T0 - 0.05, 9), grieta: gr, gx: TX + 20, gy: TY - 300 });
    bocadillo(ctx, t, T0 + 0.05, 820, 560, 'TAP.', 140); },
};
