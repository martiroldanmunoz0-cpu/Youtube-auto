// pedido-e3-01 — "She Fell 33,000 Feet Without a Parachute" — estilo PAPEL con diálogo
import { lerp, ease, back, ph, clamp, personaje, capa, SUELO, rotulo, texto, rr, hash, signo, salpica, impacto, nube, W, H } from '../../lib/papel.mjs';
import { cielo, avion, explosion, fuselaje, carrito, monteNevado, hospital, camilla, yeso } from '../../lib/papel3.mjs';
import { bocadillo } from '../../lib/papel2.mjs';
const U = (a) => clamp(a.t / a.d);
const habla = (a, id) => a.speaker === id && a.t < (a.voice_dur || a.d) - 0.05;
export const MEDIC = { skin: '#b97a55', hair: 'corto', hairCol: '#1e1a18', ropa: '#6fc2b0', pants: '#6fc2b0', shoes: '#f1ece4', bata: true, estetoscopio: true, gafas: true };
export const REP = { skin: '#f2c9a5', hair: 'corto', hairCol: '#a0623a', ropa: '#3b4a6e', pants: '#2f2a3e', shoes: '#2c2433', traje: true, corbata: true };
export const AZAFATA = { skin: '#f4d6bc', hair: 'mono', hairCol: '#4a2e1c', ropa: '#2f5fa8', pants: '#2f5fa8', shoes: '#2c2433', mujer: true };
const F = SUELO + 40;
// cielo alto con nubes que suben (caída)
function caida(ctx, t, cam, vel = 1) { cielo(ctx, cam, '#3a6fb8', '#a9d4f0', 0.2);
  capa(ctx, cam, 0.5, () => { for (let i = 0; i < 7; i++) { const y = ((hash(i) * 2400 - t * 900 * vel) % 2400 + 2400) % 2400 - 300; nube(ctx, t, -100 + hash(i + 3) * 1300, y, 0.6 + hash(i + 5) * 0.5); } });
  capa(ctx, cam, 1, () => { ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 5; for (let i = 0; i < 14; i++) { const x = hash(i + 20) * W, y = ((hash(i + 30) * H - t * 2200) % H + H) % H; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 140); ctx.stroke(); } ctx.restore(); }); }
// Ella dentro del trozo de avión, atrapada por el carrito
const dentroFus = (c, t, mood = 'miedo') => () => { personaje(c, t, AZAFATA, -40, 70, 0.3, { mood, mira: [0.3, -0.3], manoI: [-140, -300], manoD: [140, -300], incl: 0.15 }); carrito(c, 60, 72, 0.6, -0.2); };
// Altímetro (pantalla)
function altimetro(ctx, pies, y = 640) { ctx.save(); ctx.translate(540, y); rr(ctx, -270, -80, 540, 160, 24); ctx.fillStyle = 'rgba(25,20,35,0.9)'; ctx.fill(); ctx.strokeStyle = '#ff4a4a'; ctx.lineWidth = 8; ctx.stroke();
  texto(ctx, `${Math.max(0, Math.round(pies)).toLocaleString('en-US')} FT`, 0, 18, 100, '#ffffff'); ctx.restore(); }
// Ella en la cama de hospital (tumbada)
function enCama(ctx, t, x, y, { mood = 'neutral', cierra = false, yesos = true } = {}) { camilla(ctx, x, y + 40, 640);
  rr(ctx, x - 300, y - 330, 150, 120, 30); ctx.fillStyle = '#fbfaf6'; ctx.fill(); ctx.strokeStyle = '#2a2230'; ctx.lineWidth = 4; ctx.stroke();
  personaje(ctx, t, AZAFATA, x - 170, y - 100, 0.8, { mood, cierra, sentado: true, mira: [0.4, 0], incl: -0.12 });
  ctx.save(); rr(ctx, x - 200, y - 175, 500, 80, 26); ctx.fillStyle = 'rgba(159,212,239,0.97)'; ctx.fill(); ctx.strokeStyle = '#2a2230'; ctx.lineWidth = 4; ctx.stroke(); ctx.restore();
  if (yesos) { yeso(ctx, x + 120, y - 200, 60, 260, Math.PI / 2); yeso(ctx, x + 140, y - 160, 60, 260, Math.PI / 2); } }

export default {
  // 0 — MEDIC: "She fell thirty-three thousand feet. No parachute." (imagen de choque en el frame 0)
  0: (ctx, a) => { const t = a.t, u = U(a), d = a.d; const cam = { z: lerp(1.0, 1.06, u), fx: 540, fy: 1100, t, temblor: 4 };
    caida(ctx, t, cam);
    capa(ctx, cam, 1, () => fuselaje(ctx, t, 540, 1150 + Math.sin(t * 3) * 20, 1.6, -0.35 + Math.sin(t * 2) * 0.1, dentroFus(ctx, t)));
    rotulo(ctx, -1, t, '33,000 FT', 540, 300, 170, '#ffffff'); rotulo(ctx, d * 0.5, t, 'NO PARACHUTE', 540, 470, 120, '#ff6b4a');
    altimetro(ctx, lerp(33000, 20000, u), 1620); },
  // 1 — MEDIC: "…And she's still breathing!"
  1: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.05, 1.12, u), fx: 540, fy: 1150, t };
    hospital(ctx, t, cam);
    capa(ctx, cam, 1, () => { enCama(ctx, t, 680, F - 40, { mood: 'neutral', cierra: true }); personaje(ctx, t, MEDIC, 190, F + 20, 0.95, { mood: 'sorpresa', habla: habla(a, 'medic'), mira: [0.7, 0.2], manoD: [200, -350], manoI: [-120, -300] }); });
    rotulo(ctx, 0.4, t, 'ALIVE', 540, 320, 200, '#4dff88'); },
  // 2 — NARR: "Six miles up, a bomb tears the plane apart. That's the official story."
  2: (ctx, a) => { const t = a.t, u = U(a), d = a.d; const T0 = d * 0.3; const r = ease(ph(t, T0, T0 + 1.2)); const ex = ph(t, T0, T0 + 1.1);
    const cam = { z: lerp(1.0, 1.08, u), fx: 540, fy: 1000, t, temblor: ex > 0 && ex < 0.5 ? 12 : 0 };
    cielo(ctx, cam, '#3a6fb8', '#a9d4f0', 0.2);
    capa(ctx, cam, 0.5, () => { for (let i = 0; i < 4; i++) nube(ctx, t, ((hash(i) * 1400 - t * 60) % 1400 + 1400) % 1400 - 200, 1300 + hash(i + 2) * 300, 0.8); });
    capa(ctx, cam, 1, () => { avion(ctx, t, 540 + (1 - r) * 40, 1000 + r * 80, 1.0, r * 0.15, r); explosion(ctx, 430, 1000, ex, 260); });
    rotulo(ctx, 0.2, t, '6 MILES UP', 540, 300, 150, '#ffffff'); rotulo(ctx, d * 0.7, t, '(OFFICIAL STORY)', 540, 450, 80, '#ffd93d'); },
  // 3 — NARR: "Flight attendant Vesna Vulović is trapped in a falling piece of the plane, pinned by a food cart."
  3: (ctx, a) => { const t = a.t, u = U(a), d = a.d; const cam = { z: lerp(1.0, 1.25, u), fx: 540, fy: 1150, t, temblor: 5 };
    caida(ctx, t, cam, 1.2);
    capa(ctx, cam, 1, () => fuselaje(ctx, t, 540, 1150, 2.0, Math.sin(t * 1.5) * 0.12, dentroFus(ctx, t)));
    rotulo(ctx, 0.2, t, 'TRAPPED', 540, 300, 160, '#ffffff'); rotulo(ctx, d * 0.55, t, 'PINNED BY A FOOD CART', 540, 450, 80, '#ffd93d');
    altimetro(ctx, lerp(28000, 9000, u), 1640); },
  // 4 — NARR: "It crashes into a snowy, wooded mountainside."
  4: (ctx, a) => { const t = a.t, u = U(a), d = a.d; const T0 = d * 0.45; const fk = ph(t, 0, T0); const hit = ph(t, T0, T0 + 0.7);
    const cam = { z: lerp(1.0, 1.08, u), fx: 540, fy: 1200, t, temblor: hit > 0 && hit < 0.4 ? 16 : 0 };
    monteNevado(ctx, t, cam);
    capa(ctx, cam, 1, () => { const x = lerp(900, 560, fk), y = fk < 1 ? lerp(200, SUELO - 60, fk * fk) : SUELO - 60; fuselaje(ctx, t, x, y, 1.1, fk < 1 ? 0.5 : 0.25); salpica(ctx, 560, SUELO - 40, hit, '#ffffff', 14, 340); impacto(ctx, t, 560, SUELO - 60, hit, 260, '#ffffff'); });
    rotulo(ctx, 0.2, t, 'SNOW', 540, 300, 150, '#ffffff'); rotulo(ctx, T0, t, 'TREES', 540, 450, 150, '#7fd46a');
    altimetro(ctx, fk < 1 ? lerp(9000, 0, fk) : 0, 1680); },
  // 5 — MEDIC: "Fractured skull. Both legs broken. Three vertebrae crushed."
  5: (ctx, a) => { const t = a.t, u = U(a), d = a.d; const cam = { z: lerp(1.05, 1.1, u), fx: 540, fy: 1150, t };
    hospital(ctx, t, cam);
    capa(ctx, cam, 1, () => { enCama(ctx, t, 680, F - 40, { mood: 'triste', cierra: true }); personaje(ctx, t, MEDIC, 190, F + 20, 0.95, { mood: 'neutral', habla: habla(a, 'medic'), mira: [0.7, 0.2], manoD: [220, -330] }); });
    rotulo(ctx, 0.2, t, 'SKULL', 540, 290, 120, '#ff6b4a'); rotulo(ctx, d * 0.33, t, 'BOTH LEGS', 540, 410, 120, '#ff6b4a'); rotulo(ctx, d * 0.66, t, '3 VERTEBRAE', 540, 530, 120, '#ff6b4a'); },
  // 6 — NARR: "She woke up in a hospital with no memory of the fall."
  6: (ctx, a) => { const t = a.t, u = U(a), d = a.d; const op = t > d * 0.25; const cam = { z: lerp(1.3, 1.4, u), fx: 420, fy: 1100, t };
    hospital(ctx, t, cam);
    capa(ctx, cam, 1, () => { enCama(ctx, t, 600, F - 40, { mood: op ? 'sorpresa' : 'neutral', cierra: !op }); signo(ctx, t, d * 0.4, 520, F - 700, '?', '#ffd93d'); });
    rotulo(ctx, d * 0.45, t, 'NO MEMORY', 540, 320, 160, '#ffffff'); },
  // 7 — REP: "Was she even supposed to be on that flight?"
  7: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.25, 1.32, u), fx: 600, fy: 1150, t };
    hospital(ctx, t, cam);
    capa(ctx, cam, 1, () => { personaje(ctx, t, MEDIC, 260, F + 20, 0.95, { mood: 'neutral', mira: [0.7, 0] }); personaje(ctx, t, REP, 640, F + 10, 0.98, { mood: 'sorpresa', habla: habla(a, 'rep'), mira: [-0.7, 0], manoD: [-180, -300], sostieneD: (c) => { rr(c, -10, 0, 20, 90, 6); c.fillStyle = '#2a2230'; c.fill(); c.beginPath(); c.arc(0, -10, 26, 0, 7); c.fillStyle = '#4a4458'; c.fill(); } }); });
    rotulo(ctx, 0.6, t, 'WRONG FLIGHT?', 540, 320, 130, '#ffd93d'); },
  // 8 — NARR: "No. The airline mixed her up with another flight attendant… also named Vesna."
  8: (ctx, a) => { const t = a.t, u = U(a), d = a.d; const k = ease(ph(t, d * 0.45, d * 0.75)); const cam = { z: lerp(1.05, 1.1, u), fx: 540, fy: 1150, t };
    capa(ctx, cam, 0.6, () => { ctx.fillStyle = '#e9e2d0'; ctx.fillRect(-600, -600, W + 1200, SUELO + 600); ctx.fillStyle = '#c9bfa8'; ctx.fillRect(-600, 1050, W + 1200, 400); });
    capa(ctx, cam, 1, () => { ctx.fillStyle = '#b8ad96'; ctx.fillRect(-600, SUELO - 40, W + 1200, 800);
      const OTRA = { ...AZAFATA, hairCol: '#c9a04a', skin: '#efc7a8' };
      const xa = lerp(330, 750, k), xb = lerp(750, 330, k);
      personaje(ctx, t, AZAFATA, xa, F + 10, 0.95, { mood: k > 0 ? 'sorpresa' : 'neutral', mira: [0.5, 0], salto: k > 0 && k < 1 ? 0.2 : 0 });
      personaje(ctx, t, OTRA, xb, F + 10, 0.95, { mood: 'neutral', mira: [-0.5, 0] });
      for (const [x, n] of [[xa, 'VESNA'], [xb, 'VESNA']]) { rr(ctx, x - 90, F - 640, 180, 60, 12); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = '#2a2230'; ctx.lineWidth = 4; ctx.stroke(); texto(ctx, n, x, F - 595, 46, '#2a2230'); }
    });
    rotulo(ctx, 0.2, t, 'SAME NAME', 540, 300, 150, '#ffffff'); rotulo(ctx, d * 0.5, t, 'SWAPPED', 540, 450, 150, '#ff6b4a'); },
  // 9 — NARR: "28 on board. One survivor. World record: highest fall without a parachute."
  9: (ctx, a) => { const t = a.t, u = U(a), d = a.d; const cam = { z: 1, fx: 540, fy: 960, t };
    capa(ctx, cam, 0.3, () => { ctx.fillStyle = '#1f2a3c'; ctx.fillRect(-500, -500, W + 1000, H + 1000); });
    const n = Math.min(28, Math.floor(ph(t, 0.1, d * 0.35) * 28)); const gris = ph(t, d * 0.4, d * 0.55);
    for (let i = 0; i < n; i++) { const x = 225 + (i % 7) * 105, y = 860 + Math.floor(i / 7) * 130; const yo = i === 17; ctx.save(); ctx.globalAlpha = yo ? 1 : 1 - gris * 0.75;
      ctx.beginPath(); ctx.arc(x, y - 40, 26, 0, 7); ctx.fillStyle = yo && gris > 0 ? '#ffd93d' : '#f4efe2'; ctx.fill(); rr(ctx, x - 32, y - 10, 64, 60, 22); ctx.fill(); ctx.restore(); }
    rotulo(ctx, 0.2, t, '28 ON BOARD', 540, 300, 140, '#ffffff'); rotulo(ctx, d * 0.45, t, '1 SURVIVOR', 540, 450, 140, '#ffd93d');
    if (t > d * 0.7) rotulo(ctx, d * 0.7, t, 'WORLD RECORD', 540, 1500, 140, '#ff6b4a'); },
  // 10 — REP: "And she never flew again, right?"
  10: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.3, 1.36, u), fx: 600, fy: 1150, t };
    hospital(ctx, t, cam);
    capa(ctx, cam, 1, () => { personaje(ctx, t, REP, 620, F + 10, 0.98, { mood: 'neutral', habla: habla(a, 'rep'), mira: [-0.6, 0], manoI: [-120, -260], manoD: [120, -150] }); });
    rotulo(ctx, 0.6, t, 'NEVER AGAIN?', 540, 320, 130, '#ffd93d'); },
  // 11 — MEDIC: "Wrong. She asked for her job back."
  11: (ctx, a) => { const t = a.t, u = U(a), d = a.d; const cam = { z: lerp(1.05, 1.0, u), fx: 540, fy: 1100, t };
    cielo(ctx, cam, '#7cc4ef', '#d9f0fa', 0.3);
    capa(ctx, cam, 0.6, () => avion(ctx, t, 700, 900, 1.0, 0, 0));
    capa(ctx, cam, 1, () => { ctx.fillStyle = '#9a9a96'; ctx.fillRect(-600, SUELO - 60, W + 1200, 800);
      personaje(ctx, t, MEDIC, 230, F + 20, 0.95, { mood: 'feliz', habla: habla(a, 'medic'), mira: [0.7, 0], manoD: [200, -300] });
      personaje(ctx, t, AZAFATA, 620, F + 10, 0.98, { mood: 'feliz', mira: [-0.3, -0.1], manoD: [150, -430], anda: t < d * 0.4, salto: t > d * 0.6 ? 0.15 * Math.abs(Math.sin(t * 6)) : 0 });
    });
    rotulo(ctx, 0.2, t, 'WRONG.', 540, 300, 170, '#ff6b4a'); rotulo(ctx, d * 0.45, t, 'BACK TO WORK', 540, 460, 130, '#ffffff'); },
};
