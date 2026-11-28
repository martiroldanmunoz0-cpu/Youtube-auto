// pedido-36-01 — guardabosques alcanzado por 7 rayos — estilo PAPEL (un plano por frase)
import { W, H, lerp, ease, ph, clamp, REPARTO, personaje, capa, SUELO, rotulo, texto, exterior, nube, rayo, fogonazo,
  torre, caseta, casa, camioneta, oso, pez, cana, rama, signo, impacto, rr, volumen, hash } from '../../lib/papel.mjs';
const { RANGER } = REPARTO;
const COLE1 = { ...RANGER, skin: '#c99068', hairCol: '#2a1c14', placa: false };
const COLE2 = { ...RANGER, skin: '#f0c8a8', hair: 'punta', hairCol: '#b0682e', sombrero: undefined, placa: false };
const U = (a) => clamp(a.t / a.d);
const T0 = 0.7; // momento del rayo
const golpe = (t, t0 = T0) => (t > t0 && t < t0 + 0.35 ? 1 - (t - t0) / 0.35 : 0);
const tras = (t, t0 = T0) => t > t0 + 0.2;
function strike(ctx, t, n) { rotulo(ctx, 0.05, t, `STRIKE ${n}`, 540, 270, 160, '#ffd93d'); }
function contador(ctx, t, n) { for (let i = 0; i < 7; i++) { const on = i < n; ctx.save(); ctx.translate(165 + i * 125, 1760); ctx.globalAlpha = on ? 1 : 0.3; ctx.beginPath(); ctx.moveTo(10, -50); ctx.lineTo(-22, 6); ctx.lineTo(2, 6); ctx.lineTo(-12, 50); ctx.lineTo(26, -10); ctx.lineTo(2, -10); ctx.lineTo(18, -50); ctx.closePath(); volumen(ctx, on ? '#ffd93d' : '#ccc', -22, -50, 48, 100, 4); ctx.restore(); } }
function nubeMala(ctx, t, x, y, s = 1) { nube(ctx, t, x, y, s, { col: '#4a5064', cara: true, lluvia: true }); }
function zap(ctx, t, x, y, tx, ty, seed, t0 = T0) { const g = golpe(t, t0); rayo(ctx, t, x, y, tx, ty, g, seed); }

export default {
  // 0 — Rayo 1: en la torre de vigilancia contra incendios
  0: (ctx, a) => { const t = a.t; const g = golpe(t); const cam = { z: 1.04, fx: 540, fy: 1200, t, temblor: g * 10 };
    exterior(ctx, t, cam, { cielo: 'tormenta', medio: () => torre(ctx, 760, SUELO - 10, 1.1) });
    capa(ctx, cam, 1, () => { const p = personaje(ctx, t, RANGER, 400, SUELO + 40, 1.05, { mood: tras(t) ? 'sorpresa' : 'neutral', mira: [0.3, -1], hollin: tras(t), humo: tras(t) ? 1 : 0, salto: g * 60, manoI: tras(t) ? [-160, -380] : [-110, -110], manoD: tras(t) ? [160, -380] : [120, -110] });
      nubeMala(ctx, t, 420, 640, 1.1); zap(ctx, t, 420, 720, p.cabeza[0], p.cabeza[1] - 60, 3); });
    fogonazo(ctx, g); strike(ctx, t, 1); rotulo(ctx, 1.1, t, 'FIRE TOWER', 540, 440, 120, '#ff9a5a'); contador(ctx, t, tras(t) ? 1 : 0); },

  // 1 — Le arrancó una uña del pie
  1: (ctx, a) => { const t = a.t; const cam = { z: 1, fx: 540, fy: 1200, t };
    exterior(ctx, t, cam, { cielo: 'tormenta' });
    capa(ctx, cam, 1, () => { personaje(ctx, t, RANGER, 330, SUELO + 40, 3.6, { mood: 'miedo', humo: 1, hollin: true, manoI: [-110, -110], manoD: [120, -110] });
      const k = ease(ph(t, 0.15, 1.5)); ctx.save(); ctx.translate(lerp(530, 900, k), lerp(SUELO + 10, SUELO - 520, Math.sin(k * Math.PI))); ctx.rotate(k * 9); ctx.beginPath(); ctx.ellipse(0, 0, 120, 55, 0, 0, 7); volumen(ctx, '#4a3424', -120, -55, 240, 110, 5); ctx.restore();
      ctx.beginPath(); ctx.ellipse(520, SUELO + 20, 110, 48, 0, 0, 7); volumen(ctx, '#f4c9a4', -110 + 520, SUELO - 28, 220, 96, 5); ctx.fillStyle = '#e45a5a'; ctx.beginPath(); ctx.ellipse(610, SUELO + 6, 18, 14, 0, 0, 7); ctx.fill();
      impacto(ctx, t, 560, SUELO, ph(t, 0.1, 0.7), 220, '#ffd93d'); });
    rotulo(ctx, 0.1, t, 'TOENAIL', 540, 270, 170, '#fff'); rotulo(ctx, 0.6, t, 'BLOWN OFF', 540, 450, 150, '#ff6b3d'); contador(ctx, t, 1); },

  // 2 — Rayo 2: carretera de montaña, se queda sin cejas
  2: (ctx, a) => { const t = a.t; const g = golpe(t); const z = lerp(1.04, 1.7, ease(ph(t, 1.2, 2))); const cam = { z, fx: 360, fy: 900, t, temblor: g * 10 };
    exterior(ctx, t, cam, { cielo: 'tormenta', suelo: 'cemento' });
    capa(ctx, cam, 1, () => { camioneta(ctx, t, 760, SUELO + 30, 0.9, 0); const p = personaje(ctx, t, RANGER, 360, SUELO + 40, 1.05, { mood: tras(t) ? 'sorpresa' : 'neutral', sinCejas: tras(t), hollin: tras(t), humo: tras(t) ? 0.6 : 0, mira: [0, -0.5], manoI: [-110, -110], manoD: tras(t) ? [80, -430] : [120, -110] });
      nubeMala(ctx, t, 380, 640, 1); zap(ctx, t, 380, 720, p.cabeza[0], p.cabeza[1] - 40, 7); });
    fogonazo(ctx, g); strike(ctx, t, 2); rotulo(ctx, 1.4, t, 'EYEBROWS: GONE', 540, 440, 110, '#ff9a5a'); contador(ctx, t, tras(t) ? 2 : 1); },

  // 3 — Rayo 3: en su propio jardín, hombro quemado
  3: (ctx, a) => { const t = a.t; const g = golpe(t); const cam = { z: 1.06, fx: 540, fy: 1200, t, temblor: g * 10 };
    exterior(ctx, t, cam, { cielo: 'tormenta', medio: () => casa(ctx, 700, SUELO - 20, 0.9) });
    capa(ctx, cam, 1, () => { const p = personaje(ctx, t, RANGER, 400, SUELO + 40, 1.05, { mood: tras(t) ? 'esfuerzo' : 'feliz', mira: [0.4, -0.4], hollin: tras(t), incl: tras(t) ? 0.1 : 0, manoI: tras(t) ? [80, -260] : [-110, -110], manoD: [120, -110] });
      if (tras(t)) for (let i = 0; i < 3; i++) { const k = (t * 0.8 + i / 3) % 1; ctx.globalAlpha = 1 - k; ctx.beginPath(); ctx.arc(320 + i * 10, 1050 - k * 200, 26 + k * 30, 0, 7); ctx.fillStyle = '#bbb'; ctx.fill(); ctx.globalAlpha = 1; }
      nubeMala(ctx, t, 330, 640, 1); zap(ctx, t, 330, 720, 320, 1110, 11); });
    fogonazo(ctx, g); strike(ctx, t, 3); rotulo(ctx, 1.2, t, 'FRONT YARD', 540, 440, 120, '#8fe3ff'); contador(ctx, t, tras(t) ? 3 : 2); },

  // 4 — Rayo 4: en la caseta, el pelo en llamas
  4: (ctx, a) => { const t = a.t; const g = golpe(t, 0.5); const corre = ease(ph(t, 0.9, a.d)); const cam = { z: 1.05, fx: 540, fy: 1200, t, temblor: g * 10 };
    exterior(ctx, t, cam, { cielo: 'tormenta', medio: () => caseta(ctx, 560, SUELO - 20, 0.95) });
    capa(ctx, cam, 1, () => { const x = lerp(420, 820, corre); const p = personaje(ctx, t, RANGER, x, SUELO + 40, 1.05, { mood: t > 0.6 ? 'miedo' : 'neutral', fuego: t > 0.6 ? 1 : 0, sombrero: t > 0.6 ? null : undefined, mira: [1, -0.3], salto: t > 0.9 ? Math.abs(Math.sin(t * 14)) * 30 : 0, incl: t > 0.9 ? 0.15 : 0, manoI: t > 0.6 ? [-60, -420] : [-110, -110], manoD: t > 0.6 ? [60, -420] : [120, -110] });
      nubeMala(ctx, t, 430, 640, 1); zap(ctx, t, 430, 720, 420, 900, 5, 0.5); });
    fogonazo(ctx, g); strike(ctx, t, 4); rotulo(ctx, 0.9, t, 'HAIR ON FIRE', 540, 440, 130, '#ff6b3d'); contador(ctx, t, t > 0.6 ? 4 : 3); },

  // 5 — Los compañeros se apartan: "el pararrayos humano"
  5: (ctx, a) => { const t = a.t; const k = ease(ph(t, 0.2, 1.6)); const cam = { z: 1.04, fx: 540, fy: 1200, t };
    exterior(ctx, t, cam, { cielo: 'dia', medio: () => caseta(ctx, 540, SUELO - 20, 0.95) });
    capa(ctx, cam, 1, () => { personaje(ctx, t, COLE1, lerp(300, 80, k), SUELO + 50, 0.9, { mood: 'miedo', mira: [1, 0], manoI: [-110, -110], manoD: [150, -200] });
      personaje(ctx, t, COLE2, lerp(780, 1000, k), SUELO + 50, 0.9, { mood: 'miedo', mira: [-1, 0], manoI: [-150, -200], manoD: [110, -110] });
      personaje(ctx, t, RANGER, 540, SUELO + 40, 1.05, { mood: 'triste', hollin: true, sinCejas: true, mira: [Math.sin(t * 2), 0], manoI: [-110, -110], manoD: [120, -110] });
      signo(ctx, t, 0.9, 540, 700, '!', '#ffd93d'); });
    rotulo(ctx, 0.3, t, 'HUMAN', 540, 270, 160); rotulo(ctx, 0.7, t, 'LIGHTNING ROD', 540, 440, 130, '#ffd93d'); contador(ctx, t, 4); },

  // 6 — Rayo 5: una nube sigue a su camioneta
  6: (ctx, a) => { const t = a.t; const g = golpe(t, a.d * 0.7); const cam = { z: 1, fx: 540, fy: 1200, t, temblor: g * 10 };
    exterior(ctx, t, { ...cam, fx: 540 + t * 120 }, { cielo: 'dia', suelo: 'cemento' });
    capa(ctx, cam, 1, () => { const x = lerp(260, 720, U(a)); camioneta(ctx, t, x, SUELO + 30, 0.95, 1); nubeMala(ctx, t, x + 20 + Math.sin(t * 3) * 30, 720, 0.9); zap(ctx, t, x + 20, 800, x + 140, SUELO - 230, 2, a.d * 0.7); });
    fogonazo(ctx, g); strike(ctx, t, 5); rotulo(ctx, 0.5, t, 'IT FOLLOWED HIM', 540, 440, 110, '#8fe3ff'); contador(ctx, t, g > 0 || t > a.d * 0.7 ? 5 : 4); },

  // 7 — Rayo 6: corre, la nube gana
  7: (ctx, a) => { const t = a.t; const t0 = a.d * 0.6; const g = golpe(t, t0); const cam = { z: 1.04, fx: 540, fy: 1200, t, temblor: g * 10 };
    exterior(ctx, t, cam, { cielo: 'tormenta' });
    capa(ctx, cam, 1, () => { const x = lerp(220, 700, ease(U(a))); const hit = t > t0; const p = personaje(ctx, t, RANGER, x, SUELO + 40, 1.05, { mood: hit ? 'sorpresa' : 'miedo', hollin: true, sinCejas: true, humo: hit ? 1 : 0, mira: [-0.6, -0.8], salto: hit ? 0 : Math.abs(Math.sin(t * 14)) * 34, incl: hit ? 0 : 0.18, manoI: [-170, -200 + Math.sin(t * 14) * 60], manoD: [170, -200 - Math.sin(t * 14) * 60] });
      nubeMala(ctx, t, x - 60 + Math.min(60, t * 30), 640, 1); zap(ctx, t, x - 40, 720, p.cabeza[0], p.cabeza[1] - 60, 9, t0); });
    fogonazo(ctx, g); strike(ctx, t, 6); rotulo(ctx, 0.4, t, 'HE RAN...', 540, 440, 120); rotulo(ctx, t0 + 0.2, t, 'CLOUD WINS', 540, 600, 130, '#ff6b3d'); contador(ctx, t, t > t0 ? 6 : 5); },

  // 8 — Rayo 7: pescando
  8: (ctx, a) => { const t = a.t; const t0 = a.d * 0.55; const g = golpe(t, t0); const cam = { z: 1.05, fx: 540, fy: 1200, t, temblor: g * 10 };
    exterior(ctx, t, cam, { cielo: 'tormenta', rio: true });
    capa(ctx, cam, 1, () => { const hit = t > t0; const p = personaje(ctx, t, RANGER, 330, SUELO + 40, 1.05, { mood: hit ? 'sorpresa' : 'feliz', hollin: true, sinCejas: true, humo: hit ? 1 : 0, mira: [1, -0.2], manoI: [-110, -110], manoD: [170, -260] }); cana(ctx, t, p.manoD[0], p.manoD[1], 420, -0.9);
      nubeMala(ctx, t, 380, 640, 1); zap(ctx, t, 380, 720, p.cabeza[0], p.cabeza[1] - 60, 13, t0); });
    fogonazo(ctx, g); strike(ctx, t, 7); rotulo(ctx, 0.5, t, 'GONE FISHING', 540, 440, 120, '#8fe3ff'); contador(ctx, t, t > t0 ? 7 : 6); },

  // 9 — Un oso le roba la trucha; él le da con una rama
  9: (ctx, a) => { const t = a.t; const t0 = a.d * 0.5; const cam = { z: 1.06, fx: 540, fy: 1200, t };
    exterior(ctx, t, cam, { cielo: 'dia', rio: true });
    capa(ctx, cam, 1, () => { const hit = t > t0; const sw = Math.sin(clamp((t - t0 + 0.3) / 0.3) * Math.PI);
      oso(ctx, t, 720, SUELO + 40, 0.9, { mira: -1, pez: true, dolor: hit, cabeza: hit ? -0.2 : 0 });
      const p = personaje(ctx, t, RANGER, 300, SUELO + 40, 1.05, { mood: 'enfado', hollin: true, sinCejas: true, mira: [1, 0], incl: -0.05 + sw * 0.1, manoI: [-110, -110], manoD: [lerp(60, 190, sw), lerp(-430, -300, sw)] });
      rama(ctx, p.manoD[0], p.manoD[1], lerp(-1.4, 0, sw), 300); if (hit) impacto(ctx, t, 600, 900, ph(t, t0, t0 + 0.5), 140, '#ffd93d'); });
    rotulo(ctx, 0.1, t, 'A BEAR', 540, 270, 160); rotulo(ctx, 0.4, t, 'STOLE HIS TROUT', 540, 430, 110, '#8fe3ff'); rotulo(ctx, t0, t, 'BONK!', 760, 760, 110, '#ffd93d'); contador(ctx, t, 7); },

  // 10 — Siete rayos, un hombre
  10: (ctx, a) => { const t = a.t; const cam = { z: lerp(1.04, 1.12, U(a)), fx: 540, fy: 1150, t };
    exterior(ctx, t, cam, { cielo: 'atardecer' });
    capa(ctx, cam, 1, () => { personaje(ctx, t, RANGER, 540, SUELO + 40, 1.1, { mood: 'feliz', hollin: true, sinCejas: true, mira: [0, -0.2], manoI: [-180, -400], manoD: [180, -400] }); });
    rotulo(ctx, 0.05, t, '7 STRIKES', 540, 290, 170, '#ffd93d'); rotulo(ctx, 0.6, t, '1 MAN', 540, 470, 160); contador(ctx, t, 7); },

  // 11 — Récord mundial
  11: (ctx, a) => { const t = a.t; const k = ease(ph(t, 0.1, 0.8)); const cam = { z: 1.05, fx: 540, fy: 1150, t };
    exterior(ctx, t, cam, { cielo: 'dia', medio: () => caseta(ctx, 540, SUELO - 20, 0.95) });
    capa(ctx, cam, 1, () => { personaje(ctx, t, RANGER, 330, SUELO + 40, 1.05, { mood: 'feliz', hollin: true, sinCejas: true, mira: [1, -0.4], manoI: [-110, -110], manoD: [180, -360] });
      ctx.save(); ctx.translate(700, lerp(1300, 900, k)); ctx.rotate(0.05); rr(ctx, -200, -150, 400, 300, 12); volumen(ctx, '#fff6d8', -200, -150, 400, 300, 6); ctx.strokeStyle = '#c9a24a'; ctx.lineWidth = 10; ctx.strokeRect(-178, -128, 356, 256);
      texto(ctx, 'WORLD RECORD', 0, -70, 52, '#7a5a1a'); texto(ctx, '7', 0, 20, 110, '#c0392b'); texto(ctx, 'LIGHTNING STRIKES', 0, 100, 34, '#333'); ctx.restore(); });
    rotulo(ctx, 0.3, t, 'WORLD RECORD', 540, 290, 140, '#ffd93d'); contador(ctx, t, 7); },

  // 12 — Y todo empezó con… (bucle a la torre)
  12: (ctx, a) => { const t = a.t; const cam = { z: lerp(1, 1.1, U(a)), fx: 540, fy: 1200, t };
    exterior(ctx, t, cam, { cielo: 'tormenta', medio: () => torre(ctx, 760, SUELO - 10, 1.1) });
    capa(ctx, cam, 1, () => { personaje(ctx, t, RANGER, 400, SUELO + 40, 1.05, { mood: 'neutral', mira: [0.3, -1], manoI: [-110, -110], manoD: [120, -110] }); nubeMala(ctx, t, lerp(900, 430, ease(U(a))), 640, 1.1); signo(ctx, t, 0.6, 400, 720, '?', '#ffd93d'); });
    rotulo(ctx, 0.1, t, 'AND IT ALL', 540, 270, 140); rotulo(ctx, 0.5, t, 'STARTED WITH...', 540, 430, 120, '#ffd93d'); contador(ctx, t, 0); },
};
