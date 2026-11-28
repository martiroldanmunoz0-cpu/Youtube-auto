// pedido-e4-01 — "133 Days Alone on a Raft" — estilo PAPEL con diálogo
import { lerp, ease, back, ph, clamp, personaje, capa, SUELO, rotulo, texto, rr, hash, pez, salpica, impacto, W, H } from '../../lib/papel.mjs';
import { mar, olasDelante, barco, explosion, balsa, gaviota, tiburon, jarra, anzuelo, barca, hoguera, contador, avion } from '../../lib/papel3.mjs';
const U = (a) => clamp(a.t / a.d);
const habla = (a, id) => a.speaker === id && a.t < (a.voice_dur || a.d) - 0.05;
export const NAUFRAGO = { skin: '#e0b088', hair: 'corto', hairCol: '#1a1414', ropa: '#f4efe2', pants: '#2f2a3e', shoes: '#2c2433' };
export const YOU = { skin: '#c98e64', hair: 'punta', hairCol: '#2a1d16', ropa: '#e8503a', pants: '#3b4a5a', shoes: '#f1ece4' };
export const FISHER = { skin: '#a8704a', hair: 'corto', hairCol: '#1a1414', ropa: '#f2b33a', pants: '#3b4a5a', shoes: '#2c2433', bigote: true };
const F = SUELO + 40;
const RY = SUELO + 10; // altura de la balsa
// Balsa en mar abierto con el náufrago; pose = props de personaje; extra = fn en capa 1 detrás de las olas
function enBalsa(ctx, t, a, cam, { pose = {}, mood = 'neutral', cielo, noche = false, tormenta = false, extra, delante, x = 540 } = {}) {
  mar(ctx, t, cam, { horizonte: 900, cielo, noche, tormenta });
  capa(ctx, cam, 1, () => { if (extra) extra(); const b = Math.sin(t * 1.8) * 10;
    personaje(ctx, t, NAUFRAGO, x - 40, RY - 20 + b, 0.85, { mood, sentado: true, mira: [0.4, -0.1], ...pose });
    balsa(ctx, t, x, RY + b, 0.85); if (delante) delante(); });
  olasDelante(ctx, t, cam, SUELO + 30, noche ? '#16305a' : tormenta ? '#3a5a7a' : '#2a80c4');
}
// Contador de días (pantalla, arriba derecha)
const dia = (ctx, n) => contador(ctx, 900, 700, Math.round(n), 0.55);
// Playa de noche con hoguera: "tú" escuchando la historia
function hogueraTu(ctx, t, a, cam, pose = {}) {
  mar(ctx, t, cam, { horizonte: 1000, noche: true });
  capa(ctx, cam, 1, () => { ctx.fillStyle = '#5a4a3a'; ctx.beginPath(); ctx.moveTo(-600, SUELO - 80); ctx.quadraticCurveTo(540, SUELO - 160, 1700, SUELO - 80); ctx.lineTo(1700, H + 400); ctx.lineTo(-600, H + 400); ctx.fill();
    hoguera(ctx, t, 760, F - 20, 1.0);
    personaje(ctx, t, YOU, 420, F - 40, 1.0, { sentado: true, mira: [0.6, 0], habla: habla(a, 'kid'), mood: 'sorpresa', manoI: [-140, -200], manoD: [140, -200], ...pose }); });
}
// lluvia
function lluvia(ctx, t, k = 1) { ctx.save(); ctx.strokeStyle = 'rgba(200,225,255,0.7)'; ctx.lineWidth = 4; for (let i = 0; i < 70 * k; i++) { const x = hash(i) * (W + 200) - 100, y = ((hash(i + 9) * H + t * 1400) % H); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 14, y + 50); ctx.stroke(); } ctx.restore(); }
// lona alzada para recoger agua
const LONA = (c) => { c.save(); c.beginPath(); c.moveTo(-160, -20); c.quadraticCurveTo(0, 60, 160, -20); c.lineTo(150, 0); c.quadraticCurveTo(0, 80, -150, 0); c.closePath(); c.fillStyle = '#f2b33a'; c.fill(); c.strokeStyle = '#2a2230'; c.lineWidth = 5; c.stroke(); c.restore(); };

export default {
  // 0 — NARR: "This man survived one hundred thirty-three days alone on a raft." (imagen de choque en el frame 0)
  0: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.3, 1.0, ease(u)), fx: 540, fy: RY - 100, t };
    enBalsa(ctx, t, a, cam, { mood: 'triste', pose: { mira: [0.3, -0.3] } });
    rotulo(ctx, -1, t, '133 DAYS', 540, 300, 190, '#ffffff'); rotulo(ctx, -1, t, 'ALONE', 540, 470, 150, '#ff6b4a');
    dia(ctx, 133); },
  // 1 — NARR: "A torpedo hits his ship. He jumps into the Atlantic."
  1: (ctx, a) => { const t = a.t, u = U(a), d = a.d; const T0 = 0.2; const ex = ph(t, T0, d * 0.9); const J = d * 0.55; const jk = ph(t, J, J + 0.9);
    const cam = { z: lerp(1.0, 1.08, u), fx: 540, fy: 1100, t, temblor: ex > 0 && ex < 0.4 ? 14 : 0 };
    mar(ctx, t, cam, { horizonte: 900 });
    capa(ctx, cam, 0.85, () => { barco(ctx, t, 540, 1250 + ex * 40, 0.9, ex * 0.12); explosion(ctx, 380, 1180, ex, 380);
      if (jk <= 0) personaje(ctx, t, NAUFRAGO, 700, 1130, 0.55, { mood: 'miedo', manoI: [-140, -320], manoD: [140, -320] });
      if (jk > 0 && jk < 1) personaje(ctx, t, NAUFRAGO, lerp(700, 860, jk), lerp(1130, 1400, jk * jk) - Math.sin(jk * Math.PI) * 160, 0.55, { mood: 'miedo', manoI: [-140, -320], manoD: [140, -320] });
      salpica(ctx, 860, 1350, ph(t, J + 0.8, J + 1.4), '#d8f0ff', 10, 180); });
    olasDelante(ctx, t, cam, SUELO + 30);
    rotulo(ctx, T0, t, 'TORPEDO', 540, 300, 170, '#ff6b4a'); rotulo(ctx, J, t, 'JUMP!', 540, 470, 150, '#ffffff'); },
  // 2 — NARR: "Out of fifty-five men, only steward Poon Lim makes it to a tiny wooden raft."
  2: (ctx, a) => { const t = a.t, u = U(a), d = a.d; const k = ease(ph(t, d * 0.4, d * 0.8)); const cam = { z: lerp(1.15, 1.25, u), fx: 540, fy: RY - 80, t };
    mar(ctx, t, cam, { horizonte: 900, tormenta: true });
    capa(ctx, cam, 1, () => { const b = Math.sin(t * 1.8) * 10; balsa(ctx, t, 600, RY + b, 0.85);
      personaje(ctx, t, NAUFRAGO, lerp(240, 560, k), lerp(RY + 120, RY - 20, k) + b, 0.85, { mood: k > 0.9 ? 'esfuerzo' : 'miedo', sentado: k > 0.95, manoI: [120, -200], manoD: [200, -180], mira: [0.6, 0] }); });
    olasDelante(ctx, t, cam, SUELO + 30, '#3a5a7a');
    rotulo(ctx, 0.2, t, '55 MEN', 540, 300, 160, '#ffffff'); rotulo(ctx, d * 0.45, t, '1 ON THE RAFT', 540, 460, 120, '#ffd93d');
    dia(ctx, 1); },
  // 3 — KID: "What did he drink?"
  3: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.3, 1.38, u), fx: 500, fy: 1150, t };
    hogueraTu(ctx, t, a, cam, { mood: 'sorpresa' }); rotulo(ctx, 0.5, t, 'DRINK?', 540, 320, 170, '#8fe3ff'); },
  // 4 — NARR: "Rainwater… caught with the canvas of his life jacket."
  4: (ctx, a) => { const t = a.t, u = U(a), d = a.d; const cam = { z: lerp(1.2, 1.3, u), fx: 520, fy: RY - 150, t };
    enBalsa(ctx, t, a, cam, { tormenta: true, mood: 'feliz', pose: { mira: [0.1, -0.7], manoI: [-180, -430], manoD: [180, -430], sostieneD: LONA } });
    lluvia(ctx, t);
    rotulo(ctx, 0.2, t, 'RAINWATER', 540, 300, 150, '#8fe3ff'); rotulo(ctx, d * 0.5, t, 'LIFE JACKET CANVAS', 540, 450, 90, '#ffd93d');
    dia(ctx, lerp(3, 10, u)); },
  // 5 — KID: "And food?"
  5: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.35, 1.42, u), fx: 480, fy: 1150, t };
    hogueraTu(ctx, t, a, cam, { mood: 'neutral', mira: [0.5, -0.1] }); rotulo(ctx, 0.4, t, 'FOOD?', 540, 320, 170, '#ffd93d'); },
  // 6 — NARR: "He pulled a nail out of the raft and bent it into a fishhook."
  6: (ctx, a) => { const t = a.t, u = U(a), d = a.d; const k = ease(ph(t, d * 0.35, d * 0.7)); const cam = { z: lerp(1.0, 1.08, u), fx: 540, fy: 1100, t };
    enBalsa(ctx, t, a, cam, { x: 400, mood: 'esfuerzo', pose: { mira: [0.8, -0.3], manoD: [260, -460], manoI: [180, -420] } });
    capa(ctx, cam, 1, () => { ctx.save(); ctx.translate(720, 780); ctx.scale(1.6, 1.6);
      if (k < 1) { ctx.save(); ctx.globalAlpha = 1 - k; ctx.strokeStyle = '#8a92a0'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, -120); ctx.lineTo(0, 40); ctx.stroke(); rr(ctx, -24, -130, 48, 16, 6); ctx.fillStyle = '#8a92a0'; ctx.fill(); ctx.restore(); }
      if (k > 0) { ctx.globalAlpha = k; anzuelo(ctx, 0, 0, 1, 0); } ctx.restore(); });
    rotulo(ctx, 0.2, t, 'A NAIL', 540, 300, 160, '#ffffff'); rotulo(ctx, d * 0.55, t, 'A FISHHOOK', 540, 460, 150, '#ffd93d');
    dia(ctx, lerp(12, 20, u)); },
  // 7 — NARR: "He used fish as bait… to catch seabirds."
  7: (ctx, a) => { const t = a.t, u = U(a), d = a.d; const T0 = d * 0.45; const g = ease(ph(t, T0, T0 + 1.0)); const cam = { z: lerp(1.1, 1.18, u), fx: 540, fy: RY - 200, t };
    enBalsa(ctx, t, a, cam, { mood: g > 0.9 ? 'feliz' : 'neutral', pose: { mira: [0.6, -0.6], manoD: [230, -300] }, delante: () => { pez(ctx, t, 760, RY - 60, 0.55); } });
    capa(ctx, cam, 1, () => gaviota(ctx, t, lerp(1150, 780, g), lerp(500, RY - 140, g), 1.1, -1));
    rotulo(ctx, 0.2, t, 'FISH = BAIT', 540, 300, 150, '#ffffff'); rotulo(ctx, T0, t, 'SEABIRDS', 540, 460, 150, '#ffd93d');
    dia(ctx, lerp(25, 40, u)); },
  // 8 — KID: "Okay, that's genius."
  8: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.3, 1.36, u), fx: 500, fy: 1150, t };
    hogueraTu(ctx, t, a, cam, { mood: 'feliz', manoI: [-180, -380], manoD: [180, -380] }); rotulo(ctx, 0.4, t, 'GENIUS', 540, 320, 170, '#ffd93d'); },
  // 9 — NARR: "A shark attacked. He fought it off with his water jug… then caught it and ate it."
  9: (ctx, a) => { const t = a.t, u = U(a), d = a.d; const at = ph(t, 0.2, d * 0.35); const golpe = Math.max(0, Math.sin(t * 8)) * (t > d * 0.3 && t < d * 0.6 ? 1 : 0); const fin = t > d * 0.65;
    const cam = { z: lerp(1.05, 1.15, u), fx: 540, fy: RY - 100, t, temblor: golpe > 0.9 ? 8 : 0 };
    enBalsa(ctx, t, a, cam, { x: 440, mood: fin ? 'feliz' : 'enfado', pose: { mira: [0.8, 0.2], manoD: [lerp(150, 260, golpe), lerp(-420, -250, golpe)], sostieneD: (c) => jarra(c, 0, 0, 0.6, golpe * 0.8) } });
    if (!fin) capa(ctx, cam, 1, () => tiburon(ctx, t, lerp(1300, 820, ease(at)), RY + 30 - golpe * 10, 0.9, -1, 0.5 + 0.5 * Math.sin(t * 5)));
    olasDelante(ctx, t, cam, SUELO + 60);
    rotulo(ctx, 0.2, t, 'SHARK!', 540, 300, 170, '#ff6b4a'); if (fin) rotulo(ctx, d * 0.65, t, 'HE ATE IT', 540, 470, 150, '#ffd93d');
    dia(ctx, lerp(45, 60, u)); },
  // 10 — NARR: "Ships sailed past. A plane spotted him… then a storm hid him."
  10: (ctx, a) => { const t = a.t, u = U(a), d = a.d; const T1 = d * 0.45, T2 = d * 0.72; const tor = t > T2; const cam = { z: lerp(1.0, 1.06, u), fx: 540, fy: RY - 150, t };
    enBalsa(ctx, t, a, cam, { tormenta: tor, mood: tor ? 'triste' : 'sorpresa', pose: tor ? { mira: [0, 0.3] } : { mira: [0.5, -0.6], manoI: [-150, -460], manoD: [150, -460] },
      extra: () => { if (t < T1) barco(ctx, t, lerp(900, 1300, t / T1), 960, 0.35, 0); else if (!tor) avion(ctx, t, lerp(1200, -200, (t - T1) / (T2 - T1)), 420, 0.35, 0, 0); } });
    if (tor) lluvia(ctx, t, 1.5);
    rotulo(ctx, 0.2, t, 'SHIPS PASSED', 540, 300, 130, '#ffffff'); rotulo(ctx, T1, t, 'A PLANE SAW HIM', 540, 430, 100, '#ffd93d'); if (tor) rotulo(ctx, T2, t, 'LOST IN A STORM', 540, 540, 90, '#ff6b4a');
    dia(ctx, lerp(70, 120, u)); },
  // 11 — FISHER: "Hey! There's a man on that raft!"
  11: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.0, 1.05, u), fx: 540, fy: 1100, t };
    mar(ctx, t, cam, { horizonte: 900 });
    capa(ctx, cam, 0.85, () => { balsa(ctx, t, 230, 1120, 0.4); personaje(ctx, t, NAUFRAGO, 215, 1110, 0.35, { mood: 'sorpresa', sentado: true, manoI: [-150, -400], manoD: [150, -400] }); });
    capa(ctx, cam, 1, () => { barca(ctx, t, 680, RY + 20, 0.9, -1); personaje(ctx, t, FISHER, 830, RY - 40, 0.8, { mood: 'sorpresa', habla: habla(a, 'fisher'), mira: [-0.8, -0.1], manoD: [-320, -380], manoI: [-80, -300] }); });
    olasDelante(ctx, t, cam, SUELO + 40);
    rotulo(ctx, 0.3, t, 'A MAN!', 540, 300, 170, '#ffd93d'); dia(ctx, 133); },
  // 12 — NARR: "Day 133. Brazilian fishermen picked him up… and he walked off on his own."
  12: (ctx, a) => { const t = a.t, u = U(a), d = a.d; const cam = { z: lerp(1.05, 1.1, u), fx: 540, fy: 1100, t };
    mar(ctx, t, cam, { horizonte: 900 });
    capa(ctx, cam, 1, () => { ctx.fillStyle = '#e8d2a0'; ctx.beginPath(); ctx.moveTo(-600, SUELO - 60); ctx.quadraticCurveTo(540, SUELO - 140, 1700, SUELO - 60); ctx.lineTo(1700, H + 400); ctx.lineTo(-600, H + 400); ctx.fill();
      barca(ctx, t, 220, SUELO - 70, 0.6, 1);
      personaje(ctx, t, FISHER, 420, F, 0.9, { mood: 'sorpresa', mira: [0.7, 0] });
      const wk = ph(t, d * 0.4, d); personaje(ctx, t, NAUFRAGO, lerp(600, 820, wk), F, 0.95, { mood: 'feliz', anda: wk > 0 && wk < 1, lado: 1, mira: [0.6, 0] }); });
    rotulo(ctx, 0.2, t, 'RESCUED', 540, 300, 160, '#ffffff'); rotulo(ctx, d * 0.5, t, 'WALKED OFF', 540, 460, 140, '#ffd93d');
    dia(ctx, 133); },
  // 13 — KID: "What did he say after?"
  13: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.35, 1.42, u), fx: 480, fy: 1150, t };
    hogueraTu(ctx, t, a, cam, { mood: 'neutral', mira: [0.5, -0.1] }); rotulo(ctx, 0.4, t, 'HIS WORDS?', 540, 320, 150, '#ffd93d'); },
  // 14 — NARR: "I hope no one will ever have to break that record."
  14: (ctx, a) => { const t = a.t, u = U(a), d = a.d; const cam = { z: lerp(1.0, 1.15, u), fx: 540, fy: RY - 100, t };
    enBalsa(ctx, t, a, cam, { cielo: ['#e88a5a', '#f7d39a'], mood: 'neutral', pose: { mira: [0.2, -0.2] } });
    rotulo(ctx, 0.2, t, '"I HOPE NO ONE', 540, 300, 110, '#ffffff'); rotulo(ctx, d * 0.3, t, 'EVER HAS TO', 540, 420, 110, '#ffffff'); rotulo(ctx, d * 0.5, t, 'BREAK THAT RECORD."', 540, 540, 100, '#ffd93d'); },
};
