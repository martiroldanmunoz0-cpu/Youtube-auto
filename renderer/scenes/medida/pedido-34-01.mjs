// pedido-34-01 — el ayuno de 382 días — estilo PAPEL (un plano por frase)
import { W, H, lerp, ease, back, ph, clamp, REPARTO, personaje, capa, SUELO, rotulo, texto, exterior, consulta, bascula, tienda,
  mostrador, pescado, pantalla, salaLab, signo, impacto, rr, volumen, elipse, hash, casa, pared, suelo, lamparas } from '../../lib/papel.mjs';
const { GRANDE, MEDICO } = REPARTO;
const U = (a) => clamp(a.t / a.d);
const AN = 1.6; // anchura al principio
function plato(ctx, x, y, cosas = 'comida', s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); elipse(ctx, 0, 0, 150, 38, '#fbfbf7', 4); elipse(ctx, 0, -4, 110, 26, '#eceae2', 2);
  if (cosas === 'comida') { elipse(ctx, -40, -24, 60, 30, '#c9853a', 4); for (let i = 0; i < 6; i++) { rr(ctx, 10 + i * 14, -50, 12, 46, 4); ctx.fillStyle = '#f2c34a'; ctx.fill(); ctx.strokeStyle = '#2a2026'; ctx.lineWidth = 2; ctx.stroke(); } }
  if (cosas === 'huevo') { ctx.beginPath(); ctx.ellipse(-50, -40, 34, 44, 0, 0, 7); volumen(ctx, '#fff8ec', -84, -84, 68, 88, 4); rr(ctx, 10, -60, 100, 60, 18); volumen(ctx, '#e8c088', 10, -60, 100, 60, 4); rr(ctx, 22, -48, 76, 40, 12); ctx.fillStyle = '#fbefd8'; ctx.fill(); }
  ctx.restore(); }
function mesa(ctx, x, y, w) { rr(ctx, x - w / 2, y, w, 30, 8); volumen(ctx, '#a7744c', x - w / 2, y, w, 30, 4); for (const k of [-1, 1]) { rr(ctx, x + k * (w / 2 - 40) - 10, y + 30, 20, SUELO - y - 30, 4); volumen(ctx, '#7f5638', x + k * (w / 2 - 40) - 10, y + 30, 20, SUELO - y, 3); } }
function cocina(ctx, t, cam, deco) { pared(ctx, t, cam, '#f3e2c4', '#fbeedb', '#c9a27a', () => { rr(ctx, 640, 360, 260, 300, 10); volumen(ctx, '#bfe2f2', 640, 360, 260, 300, 5); ctx.strokeStyle = '#fff'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(770, 360); ctx.lineTo(770, 660); ctx.moveTo(640, 510); ctx.lineTo(900, 510); ctx.stroke(); if (deco) deco(); }); lamparas(ctx, cam, [540], '#c0763a'); suelo(ctx, cam, 'madera'); }
function calendario(ctx, x, y, n, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(ctx, -160, -200, 320, 380, 20); volumen(ctx, '#fbfaf6', -160, -200, 320, 380, 5); rr(ctx, -160, -200, 320, 100, 20); ctx.fillStyle = '#d64545'; ctx.fill(); texto(ctx, 'DAY', 0, -150, 50, '#fff'); texto(ctx, String(n), 0, 50, n > 99 ? 110 : n > 9 ? 150 : 200, '#231a24'); ctx.restore(); }
function taza(ctx, x, y, col) { rr(ctx, x - 50, y - 90, 100, 90, 14); volumen(ctx, col, x - 50, y - 90, 100, 90, 4); ctx.beginPath(); ctx.arc(x + 54, y - 46, 26, -1.4, 1.4); ctx.strokeStyle = col; ctx.lineWidth = 12; ctx.stroke(); }
function vaso(ctx, t, x, y) { rr(ctx, x - 44, y - 140, 88, 140, 8); volumen(ctx, 'rgba(200,235,255,0.8)', x - 44, y - 140, 88, 140, 4); for (let i = 0; i < 6; i++) { const k = (t * 1.2 + hash(i)) % 1; ctx.beginPath(); ctx.arc(x - 30 + hash(i + 3) * 60, y - 10 - k * 120, 6, 0, 7); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke(); } }
function pastilla(ctx, x, y, r = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(r); rr(ctx, -50, -22, 100, 44, 22); volumen(ctx, '#f2f2f2', -50, -22, 100, 44, 4); rr(ctx, 0, -22, 50, 44, 22); ctx.fillStyle = '#e85a5a'; ctx.fill(); ctx.restore(); }
function certificado(ctx, x, y, k, l1, l2, l3) { ctx.save(); ctx.translate(x, lerp(y + 400, y, k)); ctx.rotate(0.05); rr(ctx, -210, -150, 420, 300, 12); volumen(ctx, '#fff6d8', -210, -150, 420, 300, 6); ctx.strokeStyle = '#c9a24a'; ctx.lineWidth = 10; ctx.strokeRect(-188, -128, 376, 256); texto(ctx, l1, 0, -70, 50, '#7a5a1a'); texto(ctx, l2, 0, 20, 96, '#c0392b'); texto(ctx, l3, 0, 100, 36, '#333'); ctx.restore(); }
const PG = (t, extra = {}) => ({ ancho: AN, mood: 'neutral', mira: [0.5, -0.2], manoI: [-150, -110], manoD: [150, -110], ...extra });

export default {
  // 0 — Deja de comer. 382 días
  0: (ctx, a) => { const t = a.t; const k = ease(ph(t, 0.3, 1.1)); const cam = { z: lerp(1, 1.06, U(a)), fx: 540, fy: 1200, t };
    cocina(ctx, t, cam);
    capa(ctx, cam, 1, () => { personaje(ctx, t, GRANDE, 330, SUELO + 40, 1.05, PG(t, { mood: 'esfuerzo', manoD: [lerp(170, 300, k), -330] })); mesa(ctx, 680, 1120, 520); plato(ctx, lerp(560, 780, k), 1110); });
    rotulo(ctx, 0.05, t, 'STOP EATING', 540, 270, 140); rotulo(ctx, 0.6, t, '382 DAYS', 540, 440, 170, '#ffd93d'); },

  // 1 — Y los médicos le dejaron
  1: (ctx, a) => { const t = a.t; const cam = { z: 1.04, fx: 540, fy: 1200, t };
    consulta(ctx, t, cam);
    capa(ctx, cam, 1, () => { personaje(ctx, t, GRANDE, 330, SUELO + 40, 1.05, PG(t, { mood: 'sorpresa', mira: [1, -0.2] })); personaje(ctx, t, MEDICO, 790, SUELO + 40, 1, { mood: 'feliz', habla: true, mira: [-1, -0.1], manoI: [-170, -330], manoD: [120, -110], incl: Math.sin(t * 4) * 0.03 });
      signo(ctx, t, 0.6, 620, 760, 'OK', '#8fe39a'); });
    rotulo(ctx, 0.05, t, 'DOCTORS', 540, 270, 150); rotulo(ctx, 0.5, t, 'SAID YES', 540, 440, 150, '#8fe39a'); },

  // 2 — Hora 24: se acaba el azúcar, quema grasa
  2: (ctx, a) => { const t = a.t; const k = ease(ph(t, 0.2, 1.5)); const cam = { z: 1.04, fx: 540, fy: 1200, t };
    consulta(ctx, t, cam, () => pantalla(ctx, t, 520, 330, 460, 330, (c, x, y, w, h) => { texto(c, 'SUGAR', x + 110, y + 50, 46, '#fff'); rr(c, x + 60, y + 90, 100, 210, 14); c.fillStyle = '#233'; c.fill(); rr(c, x + 60, y + 90 + 210 * k, 100, 210 * (1 - k), 14); c.fillStyle = '#ffd93d'; c.fill();
      texto(c, 'FAT', x + 330, y + 50, 46, '#fff'); for (let i = 0; i < 4; i++) { const fh = (40 + 30 * Math.sin(t * 12 + i)) * k; c.beginPath(); c.moveTo(x + 270 + i * 40, y + 290); c.quadraticCurveTo(x + 280 + i * 40, y + 290 - fh * 2, x + 290 + i * 40, y + 290); c.fillStyle = i % 2 ? '#ff7a2a' : '#ffc93d'; c.fill(); } }));
    capa(ctx, cam, 1, () => { personaje(ctx, t, GRANDE, 330, SUELO + 40, 1.05, PG(t, { mira: [1, -0.6] })); });
    rotulo(ctx, 0.05, t, 'HOUR 24', 540, 800, 150, '#ffd93d'); rotulo(ctx, 1.1, t, 'BURNING FAT', 540, 940, 120, '#ff9a5a'); },

  // 3 — Día 3: aliento afrutado, el cerebro funciona con grasa
  3: (ctx, a) => { const t = a.t; const cam = { z: lerp(1.08, 1.16, U(a)), fx: 480, fy: 1100, t };
    cocina(ctx, t, cam);
    capa(ctx, cam, 1, () => { const p = personaje(ctx, t, GRANDE, 360, SUELO + 40, 1.05, PG(t, { mood: 'sorpresa', boca: 'o', mira: [1, 0] }));
      for (let i = 0; i < 6; i++) { const k = (t * 0.6 + i / 6) % 1; const x = p.cabeza[0] + 120 + k * 380, y = p.cabeza[1] + 70 - k * 120; ctx.globalAlpha = 1 - k; ctx.beginPath(); ctx.arc(x, y, 30 + k * 40, 0, 7); ctx.fillStyle = 'rgba(255,190,220,0.7)'; ctx.fill(); elipse(ctx, x, y, 14, 14, ['#ff6b6b', '#ffb347', '#9be36b'][i % 3], 2); ctx.globalAlpha = 1; } });
    rotulo(ctx, 0.05, t, 'DAY 3', 540, 270, 160, '#ffd93d'); rotulo(ctx, 0.6, t, 'FRUITY BREATH', 540, 440, 120, '#ff9ad0'); },

  // 4 — El hambre desaparece
  4: (ctx, a) => { const t = a.t; const k = ease(ph(t, 0.4, 1.6)); const cam = { z: 1.06, fx: 540, fy: 1200, t };
    cocina(ctx, t, cam);
    capa(ctx, cam, 1, () => { personaje(ctx, t, GRANDE, 450, SUELO + 40, 1.05, PG(t, { mood: k > 0.5 ? 'feliz' : 'triste', mira: [0, 0.4], manoI: [-60, -150], manoD: [60, -150] }));
      ctx.globalAlpha = 1 - k; texto(ctx, 'GRRR', 620 + Math.sin(t * 30) * 6, 1100, 80, '#ff6b3d'); ctx.globalAlpha = 1; });
    rotulo(ctx, 0.05, t, 'HUNGER', 540, 270, 160); rotulo(ctx, 0.8, t, 'FADES AWAY', 540, 440, 140, '#8fe3ff'); },

  // 5 — Dundee, Escocia, 1965: 456 libras
  5: (ctx, a) => { const t = a.t; const cam = { z: 1.04, fx: 540, fy: 1200, t };
    exterior(ctx, t, cam, { cielo: 'dia', suelo: 'cemento', medio: () => casa(ctx, 760, SUELO - 20, 0.85) });
    capa(ctx, cam, 1, () => { personaje(ctx, t, GRANDE, 400, SUELO + 40, 1.1, PG(t, { mood: 'feliz', mira: [0.2, -0.2], manoI: [-170, -360], manoD: [170, -110] })); });
    rotulo(ctx, 0.05, t, 'SCOTLAND, 1965', 540, 270, 120); rotulo(ctx, 0.6, t, '456 LB', 540, 440, 180, '#ffd93d'); },

  // 6 — Los médicos esperaban días… y siguió
  6: (ctx, a) => { const t = a.t; const n = Math.round(lerp(1, 120, ease(ph(t, 0.2, a.d * 0.9)))); const cam = { z: 1.04, fx: 540, fy: 1200, t };
    consulta(ctx, t, cam);
    capa(ctx, cam, 1, () => { calendario(ctx, 680, 880, n, 0.8); personaje(ctx, t, MEDICO, 300, SUELO + 40, 1, { mood: n > 30 ? 'sorpresa' : 'neutral', mira: [1, -0.4], manoI: [-110, -110], manoD: [150, -340] }); personaje(ctx, t, GRANDE, 760, SUELO + 40, 1.0, PG(t, { mood: 'feliz', mira: [-1, 0] })); });
    rotulo(ctx, 0.05, t, 'DAYS...', 540, 270, 150); rotulo(ctx, 0.9, t, 'WEEKS... MONTHS', 540, 440, 110, '#ffd93d'); },

  // 7 — Té, café, agua con gas y vitaminas
  7: (ctx, a) => { const t = a.t; const cam = { z: 1.06, fx: 540, fy: 1200, t };
    cocina(ctx, t, cam);
    capa(ctx, cam, 1, () => { personaje(ctx, t, GRANDE, 270, SUELO + 40, 1.0, PG(t, { mood: 'feliz', mira: [1, 0], manoD: [180, -300] })); mesa(ctx, 700, 1150, 520);
      const it = [(x, y) => taza(ctx, x, y, '#e2775a'), (x, y) => taza(ctx, x, y, '#6b4a3a'), (x, y) => vaso(ctx, t, x, y), (x, y) => pastilla(ctx, x, y - 30, 0.3)];
      it.forEach((f, i) => { const k = back(ph(t, 0.2 + i * 0.35, 0.5 + i * 0.35)); if (k > 0) { ctx.save(); ctx.translate(0, (1 - k) * -200); f(530 + i * 115, 1150); ctx.restore(); } }); });
    rotulo(ctx, 0.05, t, 'TEA · COFFEE', 540, 270, 120); rotulo(ctx, 0.9, t, 'WATER · VITAMINS', 540, 420, 100, '#8fe3ff'); },

  // 8 — Freía pescado en la tienda de su padre
  8: (ctx, a) => { const t = a.t; const cam = { z: 1.04, fx: 540, fy: 1200, t };
    tienda(ctx, t, cam);
    capa(ctx, cam, 1, () => { mostrador(ctx, 760, 1150, 520); pescado(ctx, 700, 1130, 0.7); pescado(ctx, 850, 1132, 0.7); personaje(ctx, t, GRANDE, 330, SUELO + 40, 1.0, PG(t, { ancho: 1.45, delantal: true, mood: 'esfuerzo', mira: [1, 0.3], manoD: [190, -280] })); });
    rotulo(ctx, 0.05, t, "DAD'S CHIP SHOP", 540, 820, 100); rotulo(ctx, 0.6, t, 'NO SNACKS', 540, 960, 120, '#ff6b3d'); },

  // 9 — Iba al baño cada 40 días
  9: (ctx, a) => { const t = a.t; const n = Math.round(lerp(1, 40, ease(ph(t, 0.1, a.d * 0.8)))); const cam = { z: 1.04, fx: 540, fy: 1200, t };
    pared(ctx, t, cam, '#dbe8ef', '#eef4f7', '#9ab0bf', () => { rr(ctx, 560, 600, 300, 820, 10); volumen(ctx, '#8b6446', 560, 600, 300, 820, 5); rr(ctx, 640, 700, 140, 80, 10); ctx.fillStyle = '#fff'; ctx.fill(); texto(ctx, 'WC', 710, 740, 60, '#2a3a4a'); elipse(ctx, 600, 1050, 16, 16, '#d9b44a', 3); });
    suelo(ctx, cam, 'baldosa');
    capa(ctx, cam, 1, () => { calendario(ctx, 250, 700, n, 0.6); personaje(ctx, t, GRANDE, 330, SUELO + 40, 1.0, PG(t, { mood: n >= 40 ? 'sorpresa' : 'neutral', mira: [1, -0.2] })); });
    rotulo(ctx, 0.05, t, 'BATHROOM', 540, 270, 150); rotulo(ctx, 0.6, t, 'EVERY 40 DAYS', 540, 440, 120, '#ffd93d'); },

  // 10 — Potasio y controles del corazón
  10: (ctx, a) => { const t = a.t; const cam = { z: 1.05, fx: 540, fy: 1200, t };
    consulta(ctx, t, cam, () => pantalla(ctx, t, 520, 330, 460, 300, (c, x, y, w, h) => { c.strokeStyle = '#6bff8a'; c.lineWidth = 6; c.beginPath(); for (let i = 0; i <= 60; i++) { const xx = x + i * w / 60, ph2 = ((i / 60) * 3 - t * 1.2) % 1, f = ((ph2 % 1) + 1) % 1; const yy = y + h / 2 - (f > 0.45 && f < 0.5 ? 100 : f > 0.5 && f < 0.55 ? -50 : 0); i ? c.lineTo(xx, yy) : c.moveTo(xx, yy); } c.stroke(); texto(c, '♥ OK', x + w - 70, y + 40, 40, '#6bff8a'); }));
    capa(ctx, cam, 1, () => { personaje(ctx, t, GRANDE, 330, SUELO + 40, 1.0, PG(t, { ancho: 1.35, mira: [1, -0.4] })); personaje(ctx, t, MEDICO, 800, SUELO + 40, 1, { mood: 'neutral', mira: [-1, 0], manoI: [-200, -260], manoD: [120, -110] }); pastilla(ctx, 560, 1000 + Math.sin(t * 3) * 10, 0.2); });
    rotulo(ctx, 0.05, t, 'POTASSIUM', 540, 800, 130, '#ffd93d'); rotulo(ctx, 0.5, t, 'HEART CHECKS', 540, 930, 110); },

  // 11 — 456 → 300 → 180
  11: (ctx, a) => { const t = a.t; const k = ease(ph(t, 0.2, a.d * 0.9)); const kg = Math.round(k < 0.5 ? lerp(456, 300, k * 2) : lerp(300, 180, (k - 0.5) * 2)); const cam = { z: 1.06, fx: 540, fy: 1200, t };
    consulta(ctx, t, cam);
    capa(ctx, cam, 1, () => { bascula(ctx, t, 540, SUELO + 40, kg + ' LB', '#6bff8a'); personaje(ctx, t, GRANDE, 540, SUELO + 10, 1.0, PG(t, { ancho: lerp(AN, 1.0, k), mood: k > 0.6 ? 'feliz' : 'neutral', mira: [0, 0.4] })); });
    rotulo(ctx, 0.05, t, `${kg} LB`, 540, 290, 180, '#ffd93d'); },

  // 12 — Un huevo cocido y una rebanada de pan
  12: (ctx, a) => { const t = a.t; const cam = { z: lerp(1.08, 1.16, U(a)), fx: 600, fy: 1150, t };
    cocina(ctx, t, cam);
    capa(ctx, cam, 1, () => { personaje(ctx, t, GRANDE, 330, SUELO + 40, 1.0, PG(t, { ancho: 1.0, mood: 'feliz', habla: true, mira: [1, 0.4] })); mesa(ctx, 700, 1150, 520); plato(ctx, 700, 1140, 'huevo', 1.1); });
    rotulo(ctx, 0.05, t, 'FIRST MEAL', 540, 270, 150); rotulo(ctx, 0.6, t, '1 EGG + 1 BREAD', 540, 440, 110, '#ffd93d'); },

  // 13 — 382 días, 276 libras menos, récord
  13: (ctx, a) => { const t = a.t; const cam = { z: 1.04, fx: 540, fy: 1200, t };
    exterior(ctx, t, cam, { cielo: 'dia', suelo: 'cemento', medio: () => casa(ctx, 820, SUELO - 20, 0.8) });
    capa(ctx, cam, 1, () => { personaje(ctx, t, GRANDE, 300, SUELO + 40, 1.05, PG(t, { ancho: 1.0, mood: 'feliz', mira: [1, -0.4], manoI: [-170, -400], manoD: [170, -400], salto: Math.abs(Math.sin(t * 5)) * 20 })); certificado(ctx, 720, 950, ease(ph(t, 0.3, 1)), 'WORLD RECORD', '382 DAYS', '-276 LB'); });
    rotulo(ctx, 0.05, t, '-276 LB', 540, 290, 180, '#8fe39a'); rotulo(ctx, 0.6, t, 'WORLD RECORD', 540, 460, 120, '#ffd93d'); },

  // 14 — Y ese es el récord para cualquiera que pueda… (bucle)
  14: (ctx, a) => { const t = a.t; const cam = { z: lerp(1, 1.08, U(a)), fx: 540, fy: 1200, t };
    cocina(ctx, t, cam);
    capa(ctx, cam, 1, () => { personaje(ctx, t, GRANDE, 330, SUELO + 40, 1.05, PG(t, { mira: [1, 0.3] })); mesa(ctx, 680, 1120, 520); plato(ctx, 640, 1110); signo(ctx, t, 0.5, 330, 760, '?', '#ffd93d'); });
    rotulo(ctx, 0.05, t, 'AND THE RECORD', 540, 270, 120); rotulo(ctx, 0.5, t, 'FOR ANYONE...', 540, 430, 120, '#ffd93d'); },
};
