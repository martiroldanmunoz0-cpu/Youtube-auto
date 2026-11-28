// pedido-d2-01 — "Doctors Once Prescribed Ketchup" (píldoras de tomate, 1834) — estilo PAPEL con diálogo
import { lerp, ease, back, ph, clamp, personaje, capa, SUELO, rotulo, texto, rr, volumen, hash, paso, silla, puerta, salpica, exterior } from '../../lib/papel.mjs';
import { consultaAntigua, escritorio, ketchup, frascoPildoras, pildora, tomate, periodico, patatas, calleParis } from '../../lib/papel2.mjs';
const U = (a) => clamp(a.t / a.d);
const habla = (a, id) => a.speaker === id && a.t < (a.voice_dur || a.d) - 0.05;
export const DOC = { skin: '#f0c4a0', hair: 'corto', hairCol: '#c8c8c8', ropa: '#2a2a3a', traje: true, camisa: '#f4efe2', corbata: '#8a2a2a', pants: '#2a2a3a', shoes: '#1a1a1a', sombrero: 'chistera', bigote: true, bigoteCol: '#e0e0e0', gafas: true };
export const PAT = { skin: '#d9a77c', hair: 'punta', hairCol: '#5a3a22', ropa: '#5b7db1', pants: '#6b5a4a', shoes: '#3a2a1a' };
const F = SUELO + 40;
const bote = (sc = 0.5, rot = 0) => (c) => ketchup(c, 0, 60, sc * 1.6, rot);
const frasco = (sc = 0.6, et) => (c) => frascoPildoras(c, 0, 50, sc * 1.5, 0, et);
// consulta con doctor tras el escritorio y paciente en la silla
function consulta(ctx, t, a, cam, poseD = {}, poseP = {}) {
  consultaAntigua(ctx, t, cam);
  capa(ctx, cam, 1, () => {
    personaje(ctx, t, DOC, 330, F - 20, 1.0, { mood: 'feliz', habla: habla(a, 'doc'), mira: [0.6, 0], manoI: [-100, -120], manoD: [120, -130], ...poseD });
    escritorio(ctx, 330, 1250, 480);
    silla(ctx, 790, F + 40, 0.95, '#6a3a2a');
    personaje(ctx, t, PAT, 790, F + 40, 0.95, { sentado: 1, mood: 'neutral', habla: habla(a, 'pat'), mira: [-0.7, 0], manoI: [-90, -150], manoD: [90, -150], ...poseP });
  });
}
function papelera(ctx, x, y) { ctx.beginPath(); ctx.moveTo(x - 110, y - 220); ctx.lineTo(x + 110, y - 220); ctx.lineTo(x + 85, y); ctx.lineTo(x - 85, y); ctx.closePath(); volumen(ctx, '#7a7a80', x - 110, y - 220, 220, 220, 4); for (let i = -2; i <= 2; i++) { ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x + i * 36, y - 210); ctx.lineTo(x + i * 28, y - 10); ctx.stroke(); } }
const GENTE = [{ skin: '#f2c9a5', hair: 'mono', hairCol: '#5a2e1c', ropa: '#c94f4f', pants: '#3b3550', shoes: '#2c2433', mujer: true, delantal: false },
  { skin: '#b9825a', hair: 'corto', hairCol: '#1d1512', ropa: '#4f9a6b', pants: '#4a5a6e', shoes: '#2c2433', sombrero: 'bombin' },
  { skin: '#e8b48c', hair: 'corto', hairCol: '#8a5a32', ropa: '#e0a640', pants: '#3b3a4a', shoes: '#2c2433', ancho: 1.3 },
  { skin: '#8a5a3a', hair: 'mono', hairCol: '#1d1512', ropa: '#7a4fa0', pants: '#3b3550', shoes: '#2c2433', mujer: true }];

export default {
  // 0 — DOC: "Your prescription: ketchup. Twice a day."
  0: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.05, 1.12, u), fx: 540, fy: 1150, t };
    const sube = back(ph(t, 0.15, 0.55));
    consulta(ctx, t, a, cam, { manoD: [lerp(120, 170, sube), lerp(-130, -330, sube)], sostieneD: bote(0.55) }, { mood: t > 1.2 ? 'sorpresa' : 'neutral' });
    rotulo(ctx, 0.9, t, 'RX: KETCHUP', 540, 300, 140, '#ff6b4a'); rotulo(ctx, 1.4, t, '2X A DAY', 540, 450, 100); },
  // 1 — PAT: "…Ketchup?"
  1: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.55, 1.65, u), fx: 780, fy: 1000, t };
    consulta(ctx, t, a, cam, { manoD: [170, -330], sostieneD: bote(0.55) }, { mood: 'sorpresa', cabeza: Math.sin(t * 3) * 0.05, mira: [-0.9, -0.3] });
    ctx.save(); ctx.globalAlpha = ease(ph(t, 0.2, 0.5)); texto(ctx, '?', 900, 520, 200, '#ffd93d'); ctx.restore(); },
  // 2 — DOC: "Tomato pills. For indigestion, diarrhea… and pretty much everything else."
  2: (ctx, a) => { const t = a.t, u = U(a), d = a.d; const cam = { z: lerp(1.25, 1.3, u), fx: 400, fy: 1100, t };
    consulta(ctx, t, a, cam, { manoD: [170, -320], sostieneD: frasco(0.7), manoI: [-170, -280], mood: 'feliz' }, { mood: 'sorpresa' });
    rotulo(ctx, d * 0.25, t, 'INDIGESTION', 540, 260, 110, '#ffd93d'); rotulo(ctx, d * 0.45, t, 'DIARRHEA', 540, 390, 110, '#8fe3ff'); rotulo(ctx, d * 0.7, t, 'EVERYTHING?!', 540, 520, 120, '#ff6b4a'); },
  // 3 — NARR: "1834. An American doctor claimed tomatoes could treat almost anything."
  3: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: 1, fx: 540, fy: 960, t };
    consultaAntigua(ctx, t, cam);
    ctx.fillStyle = 'rgba(30,20,20,0.35)'; ctx.fillRect(0, 0, 1080, 1920);
    for (let i = 0; i < 8; i++) { const k = ((t * 0.5 + hash(i)) % 1); tomate(ctx, 100 + hash(i + 4) * 880, -80 + k * 2000, 0.7 + hash(i) * 0.4, t * (hash(i) - 0.5) * 3); }
    const k = back(ph(t, 0, 0.5)); periodico(ctx, 540, 1000, lerp(0.2, 1.7, k) + u * 0.08, 'TOMATOES\nCURE\nALMOST ALL!', 'says doctor', lerp(-0.6, -0.04, k));
    rotulo(ctx, 0.1, t, '1834', 540, 270, 150, '#ffd93d'); },
  // 4 — NARR: "Soon, tomato pills were sold all over the country."
  4: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: 1.0, fx: 540, fy: 1250, t };
    exterior(ctx, t, cam, { cielo: 'dia' });
    capa(ctx, cam, 1, () => { rr(ctx, 540, 860, 440, 600, 10); volumen(ctx, '#a8543a', 540, 860, 440, 600, 4); rr(ctx, 520, 820, 480, 90, 8); volumen(ctx, '#f2e6c4', 520, 820, 480, 90, 4); texto(ctx, 'TOMATO PILLS', 760, 868, 54, '#8a2a1e');
      for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) frascoPildoras(ctx, 600 + c * 100, 1060 + r * 140, 0.6);
      GENTE.forEach((g, i) => { const w = paso(t, i * 0.25, i * 0.25 + 2.2, -150 - i * 40, 560 - i * 130); personaje(ctx, t, g, w.x, F + 20 + (i % 2) * 30, 0.85, { anda: w.anda, lado: 1, mood: 'feliz', manoD: [130, -160], sostieneD: frasco(0.5), mira: [0.6, 0] }); }); });
    rotulo(ctx, 0.3, t, 'SOLD', 540, 270, 150, '#ffd93d'); rotulo(ctx, 0.55, t, 'EVERYWHERE', 540, 420, 120); },
  // 5 — PAT: "Do they work?"
  5: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.5, 1.58, u), fx: 790, fy: 1020, t };
    consulta(ctx, t, a, cam, {}, { mood: 'aburrido', manoD: [140, -300], sostieneD: (c) => pildora(c, 0, -10, 1.3, 0.3), mira: [0.2, -0.6] }); },
  // 6 — DOC: "Of course! Sign here."
  6: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.2, 1.25, u), fx: 520, fy: 1100, t };
    const k = ease(ph(t, 0.4, 0.9));
    consulta(ctx, t, a, cam, { mood: 'feliz', manoD: [lerp(120, 260, k), lerp(-130, -170, k)], manoI: [-140, -300] }, { mood: 'neutral' });
    capa(ctx, cam, 1, () => { ctx.save(); ctx.translate(lerp(380, 560, k), 1232); ctx.rotate(-0.05); rr(ctx, -90, -14, 180, 28, 3); volumen(ctx, '#f4efe2', -90, -14, 180, 28, 2); ctx.restore(); });
    rotulo(ctx, 0.5, t, '$$$', 540, 330, 150, '#9fe07a'); },
  // 7 — NARR: "Then copycats showed up. Some pills had no tomato at all. Just laxatives."
  7: (ctx, a) => { const t = a.t, u = U(a), d = a.d; const cam = { z: 1, fx: 540, fy: 1200, t };
    consultaAntigua(ctx, t, cam);
    capa(ctx, cam, 1, () => { rr(ctx, 120, 1260, 840, 40, 8); volumen(ctx, '#8a5a36', 120, 1260, 840, 40, 4);
      ['TOMATO PILLS', 'TOMATO EXTRACT', 'TOMATO CURE'].forEach((e, i) => { const kk = back(ph(t, i * 0.25, i * 0.25 + 0.35)); if (kk > 0) frascoPildoras(ctx, 260 + i * 280, 1260, 1.9 * kk, 0, e); });
      const sello = back(ph(t, d * 0.55, d * 0.7)); if (sello > 0) [260, 540, 820].forEach((x, i) => { ctx.save(); ctx.translate(x, 1110); ctx.rotate(-0.2); ctx.scale(sello * 1.1, sello * 1.1); rr(ctx, -120, -40, 240, 80, 8); ctx.strokeStyle = '#d23a2a'; ctx.lineWidth = 8; ctx.stroke(); texto(ctx, i === 1 ? 'LAXATIVE' : 'NO TOMATO', 0, 0, 44, '#d23a2a'); ctx.restore(); }); });
    rotulo(ctx, 0.2, t, 'COPYCATS', 540, 280, 150, '#ff6b4a'); rotulo(ctx, d * 0.7, t, 'JUST LAXATIVES', 540, 440, 100, '#ffd93d'); },
  // 8 — PAT: "Doc… why am I running to the bathroom?"
  8: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: 1.05, fx: 540, fy: 1200, t, temblor: 3 };
    consultaAntigua(ctx, t, cam);
    capa(ctx, cam, 1, () => { const ab = ease(ph(t, a.d * 0.6, a.d * 0.8)); puerta(ctx, 760, F + 40, 220, 520, ab, '#7a4e2e', 'WC');
      const w = paso(t, 0, a.d * 0.8, 120, 830, 18); if (w.k < 0.98) personaje(ctx, t, PAT, w.x, F + 40, 0.95, { anda: w.anda, lado: 1, mood: 'miedo', habla: habla(a, 'pat'), mira: [-0.5, 0], manoI: [40, -170], manoD: [-20, -160], incl: 0.08 }); });
    rotulo(ctx, 0.3, t, '!!!', 540, 330, 180, '#ff6b4a'); },
  // 9 — NARR: "By the 1850s, the craze was dead. But ketchup stayed."
  9: (ctx, a) => { const t = a.t, u = U(a), d = a.d; const cam = { z: 1, fx: 540, fy: 1200, t };
    consultaAntigua(ctx, t, cam);
    capa(ctx, cam, 1, () => { ctx.save(); ctx.translate(360, F + 30); ctx.scale(1.6, 1.6); papelera(ctx, 0, 0); ctx.restore(); for (let i = 0; i < 3; i++) { const k = ph(t, i * 0.3, i * 0.3 + 0.6); if (k < 1) frascoPildoras(ctx, lerp(150 + i * 120, 360, k), lerp(900, F - 150, k * k), 0.6, k * 4); }
      const kk = back(ph(t, d * 0.5, d * 0.75)); if (kk > 0) { const g = ctx.createRadialGradient(760, 1250, 10, 760, 1250, 300); g.addColorStop(0, 'rgba(255,240,170,0.7)'); g.addColorStop(1, 'rgba(255,240,170,0)'); ctx.fillStyle = g; ctx.fillRect(400, 900, 720, 700); ketchup(ctx, 760, F + 20, 1.5 * kk); } });
    rotulo(ctx, 0.1, t, '1850s', 540, 280, 150, '#ffd93d'); rotulo(ctx, d * 0.55, t, 'KETCHUP STAYED', 540, 430, 100); },
  // 10 — PAT: "So is it medicine or not?"
  10: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.2, 1.28, u), fx: 560, fy: 1100, t };
    consultaAntigua(ctx, t, cam);
    capa(ctx, cam, 1, () => { puerta(ctx, 760, F + 40, 220, 520, lerp(0.9, 0.9, u), '#7a4e2e', 'WC');
      const w = paso(t, 0, 0.8, 820, 600); personaje(ctx, t, PAT, w.x, F + 40, 0.95, { anda: w.anda, lado: -1, mood: 'triste', habla: habla(a, 'pat'), mira: [-0.6, 0], manoI: [-100, -130], manoD: [140, -280] });
      personaje(ctx, t, DOC, 300, F + 40, 1.0, { mood: 'neutral', mira: [0.7, 0], manoD: [110, -150], sostieneD: bote(0.45), manoI: [-100, -130] }); }); },
  // 11 — DOC: "Just put it on your fries."
  11: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.25, 1.35, u), fx: 500, fy: 1100, t };
    consultaAntigua(ctx, t, cam);
    capa(ctx, cam, 1, () => { const ver = ease(ph(t, 0.3, 0.7));
      personaje(ctx, t, DOC, 390, F + 40, 1.0, { mood: 'feliz', habla: habla(a, 'doc'), mira: [0.6, 0.2], manoD: [lerp(110, 200, ver), lerp(-150, -300, ver)], sostieneD: bote(0.45, lerp(0, 2.4, ver)), manoI: [-100, -130] });
      personaje(ctx, t, PAT, 760, F + 40, 0.95, { mood: t > 1.2 ? 'feliz' : 'neutral', mira: [-0.4, 0.4], manoI: [-130, -230], sostieneI: (c) => patatas(c, 0, 0, 0.9), manoD: [100, -140] });
      if (ver > 0.9) { ctx.fillStyle = '#c0281e'; for (let i = 0; i < 4; i++) { const k = (t * 2 + i / 4) % 1; ctx.beginPath(); ctx.arc(lerp(610, 640, k), lerp(1100, 1180, k), 10, 0, 7); ctx.fill(); } } }); },
};
