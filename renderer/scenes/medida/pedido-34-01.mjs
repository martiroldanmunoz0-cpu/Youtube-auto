// pedido-34-01 — el ayuno de 382 días — estilo PAPEL (un plano por frase)
import { W, H, lerp, ease, back, ph, clamp, REPARTO, personaje, capa, SUELO, rotulo, texto, exterior, consulta, bascula, tienda,
  mostrador, pescado, pantalla, salaLab, signo, impacto, rr, volumen, elipse, hash, casa, pared, suelo, lamparas, paso, alcance, puerta, silla, salpica, cae } from '../../lib/papel.mjs';
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

// --- piezas para acciones ---
const MESA_Y = 1250; // mesa baja para comer sentado
function nevera(ctx, t, x, y, abre) { const w = 260, h = 640; rr(ctx, x - 10, y - h - 10, w + 20, h + 10, 16); volumen(ctx, '#e8eef2', x - 10, y - h - 10, w + 20, h + 10, 4); rr(ctx, x, y - h, w, h, 10); ctx.fillStyle = '#fff6c8'; ctx.fill();
  for (let i = 1; i < 4; i++) { ctx.fillStyle = '#d9d3b8'; ctx.fillRect(x + 10, y - h + i * 150, w - 20, 8); }
  elipse(ctx, x + 70, y - h + 128, 40, 22, '#e85a5a', 3); rr(ctx, x + 140, y - h + 230, 60, 70, 8); volumen(ctx, '#7fc8ff', x + 140, y - h + 230, 60, 70, 3); elipse(ctx, x + 90, y - h + 432, 50, 18, '#f2c34a', 3); elipse(ctx, x + 180, y - h + 430, 34, 22, '#9be36b', 3);
  if (abre > 0.2) { ctx.fillStyle = `rgba(255,250,200,${0.25 * abre})`; ctx.beginPath(); ctx.moveTo(x + w, y - h); ctx.lineTo(x + w + 300, y - h - 80); ctx.lineTo(x + w + 300, y + 60); ctx.lineTo(x + w, y); ctx.fill(); }
  const ww = w * Math.cos(abre * 1.4); ctx.save(); ctx.translate(x + w, 0); ctx.scale(-1, 1); ctx.beginPath(); ctx.moveTo(0, y - h); ctx.lineTo(ww, y - h - 20 * abre); ctx.lineTo(ww, y + 20 * abre); ctx.lineTo(0, y); ctx.closePath(); volumen(ctx, '#f4f7f9', 0, y - h, Math.max(6, ww), h, 4); if (ww > 40) { rr(ctx, ww - 40, y - h + 200, 16, 140, 6); ctx.fillStyle = '#9aa5ae'; ctx.fill(); } ctx.restore(); }
function freidora(ctx, t, x, y, burbujas = 1) { rr(ctx, x - 170, y, 340, SUELO - y + 10, 10); volumen(ctx, '#9aa5ae', x - 170, y, 340, SUELO - y, 4); rr(ctx, x - 150, y - 10, 300, 40, 8); ctx.fillStyle = '#d9a23a'; ctx.fill(); ctx.strokeStyle = '#2a2026'; ctx.lineWidth = 3; ctx.stroke();
  for (let i = 0; i < 8 * burbujas; i++) { const k = (t * 2 + hash(i)) % 1; ctx.beginPath(); ctx.arc(x - 130 + hash(i + 4) * 260, y + 6 - k * 26, 6 + k * 6, 0, 7); ctx.strokeStyle = 'rgba(255,240,180,0.9)'; ctx.lineWidth = 3; ctx.stroke(); }
  for (let i = 0; i < 3; i++) { const k = (t * 0.6 + i / 3) % 1; ctx.globalAlpha = (1 - k) * 0.5; ctx.beginPath(); ctx.arc(x - 60 + i * 60 + Math.sin(t * 2 + i) * 20, y - 40 - k * 260, 30 + k * 40, 0, 7); ctx.fillStyle = '#d8d4dc'; ctx.fill(); } ctx.globalAlpha = 1; }
function portapapeles(c) { c.rotate(-0.2); rr(c, -60, -150, 120, 160, 10); volumen(c, '#a7744c', -60, -150, 120, 160, 3); rr(c, -48, -134, 96, 136, 4); c.fillStyle = '#fff'; c.fill(); for (let i = 0; i < 4; i++) { c.fillStyle = '#9aa'; c.fillRect(-36, -110 + i * 26, 72, 6); } }
const tenedor = (bocado) => (c) => { c.rotate(-0.5); rr(c, -6, -110, 12, 110, 5); c.fillStyle = '#c8ced4'; c.fill(); c.strokeStyle = '#2a2026'; c.lineWidth = 2; c.stroke(); for (let i = -1; i <= 1; i++) c.fillRect(i * 8 - 2, -140, 4, 34); if (bocado) elipse(c, 0, -146, 22, 16, bocado, 2); };
const tazaMano = (col, rot = 0) => (c) => { c.rotate(rot); rr(c, -40, -80, 80, 80, 12); volumen(c, col, -40, -80, 80, 80, 3); c.beginPath(); c.arc(-44, -40, 20, 1.8, 4.5); c.strokeStyle = col; c.lineWidth = 10; c.stroke(); };
const pildoraMano = (c) => { rr(c, -30, -50, 60, 26, 13); volumen(c, '#f2f2f2', -30, -50, 60, 26, 3); rr(c, 0, -50, 30, 26, 13); c.fillStyle = '#e85a5a'; c.fill(); };
// Sentado a la mesa: silla detrás, mesa delante
function aLaMesa(ctx, t, x, pose, cosas) { silla(ctx, x, SUELO + 40, 1.05); personaje(ctx, t, GRANDE, x, SUELO + 40, 1.05, { sentado: 1, ...pose }); mesa(ctx, x + 250, MESA_Y, 560); if (cosas) cosas(); }
// beber: mano de la mesa a la boca y vuelta
function bebe(t, t0, t1) { const k = Math.sin(Math.PI * clamp((t - t0) / (t1 - t0))); return { k, mano: [lerp(190, 70, ease(k)), lerp(-240, -330, ease(k))], rot: lerp(0, -1.1, ease(k)) }; }

export default {
  // 0 — Deja de comer: sentado a la mesa, aparta el plato que patina y se cruza de brazos
  0: (ctx, a) => { const t = a.t; const k = ease(ph(t, 0.4, 0.9)); const cruz = ph(t, 1.0, 1.3); const cam = { z: lerp(1, 1.08, U(a)), fx: 540, fy: 1250, t };
    cocina(ctx, t, cam);
    capa(ctx, cam, 1, () => { const px = lerp(520, 800, ease(ph(t, 0.55, 1.2)));
      aLaMesa(ctx, t, 340, PG(t, { mood: t > 0.4 ? 'enfado' : 'neutral', mira: [1, 0.3], manoI: cruz > 0 ? [lerp(-150, 60, ease(cruz)), lerp(-240, -170, ease(cruz))] : [-160, -240], manoD: cruz > 0 ? [lerp(190, -60, ease(cruz)), lerp(-240, -180, ease(cruz))] : [lerp(150, 300, k), -240] }),
        () => { plato(ctx, px, MESA_Y - 6, 'comida', 0.9); if (t > 0.7 && t < 1.2) { ctx.strokeStyle = 'rgba(60,40,40,0.5)'; ctx.lineWidth = 6; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(px - 170 - i * 30, MESA_Y - 30 - i * 16); ctx.lineTo(px - 230 - i * 30, MESA_Y - 30 - i * 16); ctx.stroke(); } } }); });
    rotulo(ctx, 0.05, t, 'STOP EATING', 540, 270, 140); rotulo(ctx, 0.6, t, '382 DAYS', 540, 440, 170, '#ffd93d'); },

  // 1 — El médico entra andando con el portapapeles y le pone el sello OK
  1: (ctx, a) => { const t = a.t; const cam = { z: 1.04, fx: 540, fy: 1200, t }; const w = paso(t, 0, 1.0, 1150, 780); const sello = ph(t, 1.2, 1.4);
    consulta(ctx, t, cam);
    capa(ctx, cam, 1, () => { personaje(ctx, t, GRANDE, 330, SUELO + 40, 1.05, PG(t, { mood: sello > 0 ? 'feliz' : 'sorpresa', mira: [1, -0.2], salto: sello >= 1 ? Math.abs(Math.sin((t - 1.4) * 8)) * 16 : 0 }));
      personaje(ctx, t, MEDICO, w.x, SUELO + 40, 1, { anda: w.anda, lado: w.lado, mood: 'feliz', habla: t > 1, mira: [-1, -0.1], manoI: t > 1 ? [-150, -250] : undefined, sostieneI: portapapeles, manoD: t > 1 ? [lerp(140, -60, back(sello)), lerp(-300, -250, back(sello))] : undefined });
      if (sello > 0) { impacto(ctx, t, w.x - 160, SUELO - 270, ph(t, 1.35, 1.7), 90, '#8fe39a'); signo(ctx, t, 1.35, w.x - 160, 900, 'OK', '#8fe39a'); } });
    rotulo(ctx, 0.05, t, 'DOCTORS', 540, 270, 150); rotulo(ctx, 0.5, t, 'SAID YES', 540, 440, 150, '#8fe39a'); },

  // 2 — Hora 24: el médico señala la pantalla con un puntero; él se toca la barriga
  2: (ctx, a) => { const t = a.t; const k = ease(ph(t, 0.2, 1.5)); const cam = { z: 1.04, fx: 540, fy: 1200, t };
    consulta(ctx, t, cam, () => pantalla(ctx, t, 520, 330, 460, 330, (c, x, y, w, h) => { texto(c, 'SUGAR', x + 110, y + 50, 46, '#fff'); rr(c, x + 60, y + 90, 100, 210, 14); c.fillStyle = '#233'; c.fill(); rr(c, x + 60, y + 90 + 210 * k, 100, 210 * (1 - k), 14); c.fillStyle = '#ffd93d'; c.fill();
      texto(c, 'FAT', x + 330, y + 50, 46, '#fff'); for (let i = 0; i < 4; i++) { const fh = (40 + 30 * Math.sin(t * 12 + i)) * k; c.beginPath(); c.moveTo(x + 270 + i * 40, y + 290); c.quadraticCurveTo(x + 280 + i * 40, y + 290 - fh * 2, x + 290 + i * 40, y + 290); c.fillStyle = i % 2 ? '#ff7a2a' : '#ffc93d'; c.fill(); } }));
    capa(ctx, cam, 1, () => { const fr = Math.sin(t * 6) * 10;
      personaje(ctx, t, GRANDE, 250, SUELO + 40, 1.0, PG(t, { mira: [1, -0.6], mood: k > 0.6 ? 'sorpresa' : 'neutral', manoI: [-40 + fr, -150], manoD: [60 - fr, -140] }));
      const pm = k < 0.5 ? [-150, -380] : [-170, -480]; personaje(ctx, t, MEDICO, 560, SUELO + 40, 0.95, { habla: true, mira: [0.3, -1], cabeza: -0.08, manoI: pm, sostieneI: (c) => { c.rotate(-0.6); rr(c, -4, -200, 8, 210, 4); c.fillStyle = '#5a3a22'; c.fill(); }, manoD: [130, -110] }); });
    rotulo(ctx, 0.05, t, 'HOUR 24', 540, 800, 150, '#ffd93d'); rotulo(ctx, 1.1, t, 'BURNING FAT', 540, 940, 120, '#ff9a5a'); },

  // 3 — Día 3: echa el aliento en la mano, lo huele y la planta se aparta
  3: (ctx, a) => { const t = a.t; const cam = { z: lerp(1.08, 1.16, U(a)), fx: 520, fy: 1100, t }; const sopla = t > 0.7;
    cocina(ctx, t, cam);
    capa(ctx, cam, 1, () => { mesa(ctx, 820, 1180, 300); // planta que se dobla hacia atrás
      const dob = ease(ph(t, 1.0, 1.5)) * 0.6; rr(ctx, 780, 1100, 80, 80, 10); volumen(ctx, '#b0473a', 780, 1100, 80, 80, 3); ctx.save(); ctx.translate(820, 1100); ctx.rotate(dob); ctx.strokeStyle = '#3a8c50'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(0, -120, 20, -200); ctx.stroke(); for (let i = 0; i < 4; i++) elipse(ctx, (i % 2 ? 30 : -30) + i * 4, -60 - i * 40, 34, 16, '#46a05c', 3, i % 2 ? 0.5 : -0.5); ctx.restore();
      const p = personaje(ctx, t, GRANDE, 380, SUELO + 40, 1.05, PG(t, { mood: sopla ? 'sorpresa' : 'neutral', boca: t > 0.3 && t < 0.7 ? 'o' : undefined, mira: sopla ? [1, 0] : [0, 0.3], manoD: t < 0.7 ? [80, -300] : [190, -150] }));
      if (t > 0.3) for (let i = 0; i < 6; i++) { const k = (t * 0.6 + i / 6) % 1; const x = p.cabeza[0] + 120 + k * 360, y = p.cabeza[1] + 70 - k * 60; ctx.globalAlpha = (1 - k) * clamp((t - 0.3) * 3); ctx.beginPath(); ctx.arc(x, y, 30 + k * 40, 0, 7); ctx.fillStyle = 'rgba(255,190,220,0.7)'; ctx.fill(); elipse(ctx, x, y, 14, 14, ['#ff6b6b', '#ffb347', '#9be36b'][i % 3], 2); ctx.globalAlpha = 1; } });
    rotulo(ctx, 0.05, t, 'DAY 3', 540, 270, 160, '#ffd93d'); rotulo(ctx, 0.6, t, 'FRUITY BREATH', 540, 440, 120, '#ff9ad0'); },

  // 4 — El hambre desaparece: abre la nevera, la mira… y la cierra sonriendo
  4: (ctx, a) => { const t = a.t; const cam = { z: 1.06, fx: 540, fy: 1200, t }; const ab = ease(ph(t, 0.3, 0.6)) * (1 - ease(ph(t, 1.6, 1.9))); const k = ph(t, 0.9, 1.6);
    cocina(ctx, t, cam);
    capa(ctx, cam, 1, () => { nevera(ctx, t, 560, SUELO + 10, ab);
      personaje(ctx, t, GRANDE, 380, SUELO + 40, 1.05, PG(t, { mood: k > 0.5 ? 'feliz' : 'triste', mira: [1, 0], manoD: ab > 0.05 && t < 1.7 ? [200, -280] : [150, -110], manoI: [-60, -150] }));
      ctx.globalAlpha = 1 - ease(k); texto(ctx, 'GRRR', 260 + Math.sin(t * 30) * 6, 1180, 70, '#ff6b3d'); ctx.globalAlpha = 1; if (t > 1.9) signo(ctx, t, 1.9, 380, 800, 'NAH', '#8fe3ff'); });
    rotulo(ctx, 0.05, t, 'HUNGER', 540, 270, 160); rotulo(ctx, 0.8, t, 'FADES AWAY', 540, 440, 140, '#8fe3ff'); },

  // 5 — Dundee 1965: sale de casa andando y saluda
  5: (ctx, a) => { const t = a.t; const cam = { z: 1.04, fx: 540, fy: 1200, t }; const w = paso(t, 0.2, 1.4, 760, 380);
    exterior(ctx, t, cam, { cielo: 'dia', suelo: 'cemento', medio: () => casa(ctx, 760, SUELO - 20, 0.85) });
    capa(ctx, cam, 1, () => { const sal = t > 1.4; personaje(ctx, t, GRANDE, w.x, SUELO + 40, 1.1, PG(t, { anda: w.anda, lado: w.lado, mood: 'feliz', mira: sal ? [0.2, -0.2] : [-1, 0], manoI: sal ? [-170 + Math.sin(t * 12) * 30, -380] : undefined, manoD: sal ? [170, -110] : undefined })); });
    rotulo(ctx, 0.05, t, 'SCOTLAND, 1965', 540, 270, 120); rotulo(ctx, 0.6, t, '456 LB', 540, 440, 180, '#ffd93d'); },

  // 6 — El médico arranca hojas del calendario que salen volando; él, sentado, tan tranquilo
  6: (ctx, a) => { const t = a.t; const n = Math.round(lerp(1, 120, ease(ph(t, 0.2, a.d * 0.9)))); const cam = { z: 1.04, fx: 540, fy: 1200, t };
    consulta(ctx, t, cam);
    capa(ctx, cam, 1, () => { calendario(ctx, 520, 880, n, 0.8);
      for (let i = 0; i < 5; i++) { const k = ((t * 2.2 + i / 5) % 1); if (t < 0.3) break; ctx.save(); ctx.translate(520 + k * 500 * (i % 2 ? 1 : -0.6), 800 - Math.sin(k * 3) * 200 + k * 300); ctx.rotate(k * 6 + i); ctx.globalAlpha = 1 - k; rr(ctx, -60, -70, 120, 140, 8); volumen(ctx, '#fbfaf6', -60, -70, 120, 140, 3); ctx.restore(); } ctx.globalAlpha = 1;
      const tira = (t * 2.2) % 1; personaje(ctx, t, MEDICO, 270, SUELO + 40, 1, { mood: n > 30 ? 'sorpresa' : 'neutral', mira: [1, -0.4], manoI: [-110, -110], manoD: [lerp(250, 330, tira < 0.3 ? tira / 0.3 : 0), lerp(-420, -340, tira < 0.3 ? tira / 0.3 : 0)] });
      silla(ctx, 830, SUELO + 40, 1.0); personaje(ctx, t, GRANDE, 830, SUELO + 40, 1.0, PG(t, { sentado: 1, mood: 'feliz', mira: [-1, -0.2], manoD: [70, -260], sostieneD: tazaMano('#e2775a') })); });
    rotulo(ctx, 0.05, t, 'DAYS...', 540, 270, 150); rotulo(ctx, 0.9, t, 'WEEKS... MONTHS', 540, 440, 110, '#ffd93d'); },

  // 7 — Té, café, agua con gas y vitaminas: sentado, coge la taza y bebe
  7: (ctx, a) => { const t = a.t; const cam = { z: 1.06, fx: 540, fy: 1250, t }; const b = bebe(t, 1.3, 2.6);
    cocina(ctx, t, cam);
    capa(ctx, cam, 1, () => { aLaMesa(ctx, t, 300, PG(t, { mood: b.k > 0.5 ? 'feliz' : 'neutral', cierra: b.k > 0.6, mira: [1, 0.3], manoD: t > 1.1 ? b.mano : [200, -240], sostieneD: t > 1.1 ? tazaMano('#e2775a', b.rot) : null, manoI: [-160, -240] }), () => {
        const it = [(x, y) => { if (t < 1.1) taza(ctx, x, y, '#e2775a'); }, (x, y) => taza(ctx, x, y, '#6b4a3a'), (x, y) => vaso(ctx, t, x, y), (x, y) => pastilla(ctx, x, y - 30, 0.3)];
        it.forEach((f, i) => { const yy = cae(t, 0.1 + i * 0.25, MESA_Y - 400, MESA_Y, 0.35); f(500 + i * 120, yy); if (t > 0.45 + i * 0.25 && t < 0.8 + i * 0.25) impacto(ctx, t, 500 + i * 120, MESA_Y - 40, ph(t, 0.45 + i * 0.25, 0.8 + i * 0.25), 60); }); }); });
    rotulo(ctx, 0.05, t, 'TEA · COFFEE', 540, 270, 120); rotulo(ctx, 0.9, t, 'WATER · VITAMINS', 540, 420, 100, '#8fe3ff'); },

  // 8 — Freía pescado: lo coge, lo echa a la freidora (salpica), lo huele… y dice que no
  8: (ctx, a) => { const t = a.t; const cam = { z: 1.04, fx: 540, fy: 1200, t }; const ech = ph(t, 0.5, 0.9);
    tienda(ctx, t, cam);
    capa(ctx, cam, 1, () => { freidora(ctx, t, 720, 1180, 1 + ech); mostrador(ctx, 260, 1260, 0);
      const fx = lerp(560, 720, ease(ech)), fy = ech < 1 ? lerp(1000, 1060, ech) + Math.sin(ech * Math.PI) * -120 : 1190;
      const no = t > 1.4; personaje(ctx, t, GRANDE, 330, SUELO + 40, 1.0, PG(t, { ancho: 1.45, delantal: true, mood: no ? 'enfado' : 'esfuerzo', cabeza: no ? Math.sin(t * 14) * 0.15 : 0, mira: [1, 0.3], manoD: ech < 1 ? [lerp(200, 330, ech), lerp(-330, -280, ech)] : [180, -160] }));
      if (ech < 1) pescado(ctx, fx, fy, 0.55); salpica(ctx, 720, 1170, ph(t, 0.9, 1.4), '#f2c34a', 9, 140);
      if (no) texto(ctx, 'NOPE', 330, 800, 90, '#ff6b3d'); });
    rotulo(ctx, 0.05, t, "DAD'S CHIP SHOP", 540, 270, 100); rotulo(ctx, 0.6, t, 'NO SNACKS', 540, 420, 120, '#ff6b3d'); },

  // 9 — Baño cada 40 días: anda hasta la puerta, la abre, entra y se cierra
  9: (ctx, a) => { const t = a.t; const n = Math.round(lerp(1, 40, ease(ph(t, 0.1, a.d * 0.6)))); const cam = { z: 1.04, fx: 540, fy: 1200, t };
    const w = paso(t, 0.3, 1.3, 260, 700); const ab = ease(ph(t, 1.2, 1.5)) * (1 - ease(ph(t, 2.1, 2.4))); const dentro = ph(t, 1.5, 2.0);
    pared(ctx, t, cam, '#dbe8ef', '#eef4f7', '#9ab0bf'); suelo(ctx, cam, 'baldosa');
    capa(ctx, cam, 1, () => { calendario(ctx, 250, 700, n, 0.6); puerta(ctx, 570, SUELO + 30, 280, 760, ab, '#8b6446', 'WC');
      if (dentro < 1) { ctx.save(); ctx.globalAlpha = 1 - dentro; personaje(ctx, t, GRANDE, w.x, SUELO + 40 - dentro * 30, 1.0 - dentro * 0.15, PG(t, { anda: w.anda ?? (dentro > 0 ? t * 9 : null), lado: 1, mood: n >= 40 ? 'sorpresa' : 'feliz', mira: [1, -0.2], manoD: t > 1.1 && t < 1.6 ? [200, -220] : undefined })); ctx.restore(); }
      if (t > 2.4) impacto(ctx, t, 710, 1000, ph(t, 2.4, 2.8), 160); });
    rotulo(ctx, 0.05, t, 'BATHROOM', 540, 270, 150); rotulo(ctx, 0.6, t, 'EVERY 40 DAYS', 540, 440, 120, '#ffd93d'); },

  // 10 — Potasio: el médico le da la pastilla y él se la toma con agua
  10: (ctx, a) => { const t = a.t; const cam = { z: 1.05, fx: 540, fy: 1200, t }; const da = ease(ph(t, 0.3, 0.8)); const b = bebe(t, 1.2, 2.2);
    consulta(ctx, t, cam, () => pantalla(ctx, t, 520, 330, 460, 300, (c, x, y, w, h) => { c.strokeStyle = '#6bff8a'; c.lineWidth = 6; c.beginPath(); for (let i = 0; i <= 60; i++) { const xx = x + i * w / 60, ph2 = ((i / 60) * 3 - t * 1.2) % 1, f = ((ph2 % 1) + 1) % 1; const yy = y + h / 2 - (f > 0.45 && f < 0.5 ? 100 : f > 0.5 && f < 0.55 ? -50 : 0); i ? c.lineTo(xx, yy) : c.moveTo(xx, yy); } c.stroke(); texto(c, 'HEART OK', x + w - 110, y + 40, 40, '#6bff8a'); }));
    capa(ctx, cam, 1, () => { const tiene = t > 0.8;
      personaje(ctx, t, GRANDE, 330, SUELO + 40, 1.0, PG(t, { ancho: 1.35, mira: [1, -0.2], cierra: b.k > 0.6, manoD: t > 1.2 ? [b.mano[0], b.mano[1] - 60] : [190, -200], sostieneD: tiene ? (t > 1.2 ? (c) => vaso(c, 0, 50, 0.9, 0.8 - b.k * 0.5, '#7fc8ff', b.rot) : pildoraMano) : null }));
      personaje(ctx, t, MEDICO, 800, SUELO + 40, 1, { mood: 'neutral', habla: t < 0.8, mira: [-1, 0], manoI: [lerp(-110, -230, da) + (tiene ? 60 : 0), lerp(-110, -220, da)], sostieneI: tiene ? null : pildoraMano, manoD: [120, -110] }); });
    rotulo(ctx, 0.05, t, 'POTASSIUM', 540, 800, 130, '#ffd93d'); rotulo(ctx, 0.5, t, 'HEART CHECKS', 540, 930, 110); },

  // 11 — 456 → 300 → 180: se sube a la báscula y adelgaza
  11: (ctx, a) => { const t = a.t; const w = paso(t, 0, 0.6, 200, 470); const sube = ease(ph(t, 0.6, 0.9)); const k = ease(ph(t, 0.9, a.d * 0.9)); const kg = Math.round(k < 0.5 ? lerp(456, 300, k * 2) : lerp(300, 180, (k - 0.5) * 2)); const cam = { z: 1.06, fx: 540, fy: 1200, t };
    consulta(ctx, t, cam);
    capa(ctx, cam, 1, () => { bascula(ctx, t, 540, SUELO + 40, kg + ' LB', '#6bff8a'); personaje(ctx, t, GRANDE, lerp(w.x, 540, sube), SUELO + 40 - 30 * sube, 1.0, PG(t, { anda: w.anda, lado: 1, salto: Math.sin(sube * Math.PI) * 60, ancho: lerp(AN, 1.0, k), mood: k > 0.6 ? 'feliz' : 'neutral', mira: [0, 0.4], manoI: k > 0.6 ? [-170, -380] : undefined, manoD: k > 0.6 ? [170, -380] : undefined })); });
    rotulo(ctx, 0.05, t, `${kg} LB`, 540, 290, 180, '#ffd93d'); },

  // 12 — Primera comida: pincha el huevo y se lo come
  12: (ctx, a) => { const t = a.t; const cam = { z: lerp(1.08, 1.16, U(a)), fx: 560, fy: 1200, t }; const ciclo = (t % 1.2) / 1.2; const sube = Math.sin(Math.PI * ciclo); const bocados = Math.floor(t / 1.2);
    cocina(ctx, t, cam);
    capa(ctx, cam, 1, () => { aLaMesa(ctx, t, 330, PG(t, { ancho: 1.0, mood: 'feliz', boca: sube > 0.8 ? 'o' : undefined, mira: [1, 0.4 - sube], manoD: [lerp(240, 90, sube), lerp(-230, -330, sube)], sostieneD: tenedor(sube > 0.1 && ciclo < 0.5 ? '#fff8ec' : null), manoI: [-160, -240] }), () => {
      ctx.save(); ctx.translate(640, MESA_Y - 6); ctx.scale(1, 1); plato(ctx, 0, 0, bocados > 1 ? 'nada' : 'huevo', 1.0); ctx.restore(); if (sube > 0.95) signo(ctx, t, Math.floor(t / 1.2) * 1.2 + 0.55, 330, 860, 'YUM', '#ffd93d'); }); });
    rotulo(ctx, 0.05, t, 'FIRST MEAL', 540, 270, 150); rotulo(ctx, 0.6, t, '1 EGG + 1 BREAD', 540, 440, 110, '#ffd93d'); },

  // 13 — Récord: el certificado le cae en las manos y salta de alegría
  13: (ctx, a) => { const t = a.t; const cam = { z: 1.04, fx: 540, fy: 1200, t }; const k = ease(ph(t, 0.2, 0.8));
    exterior(ctx, t, cam, { cielo: 'dia', suelo: 'cemento', medio: () => casa(ctx, 820, SUELO - 20, 0.8) });
    capa(ctx, cam, 1, () => { const coge = t > 0.8; const sal = coge ? Math.abs(Math.sin((t - 0.8) * 5)) * 30 : 0;
      personaje(ctx, t, GRANDE, 420, SUELO + 40, 1.05, PG(t, { ancho: 1.0, mood: 'feliz', mira: [0, -0.6], salto: sal, manoI: [-150, -420], manoD: [150, -420] }));
      ctx.save(); ctx.translate(420, coge ? 860 - sal : lerp(200, 860, k)); ctx.rotate(coge ? 0 : Math.sin(t * 8) * 0.3); ctx.scale(0.7, 0.7); certificado(ctx, 0, 0, 1, 'WORLD RECORD', '382 DAYS', '-276 LB'); ctx.restore();
      for (let i = 0; i < 14 && coge; i++) { const kk = ((t - 0.8) * 0.6 + hash(i)) % 1; ctx.fillStyle = ['#ffd93d', '#ff6b9a', '#8fe3ff', '#8fe39a'][i % 4]; ctx.fillRect(hash(i + 3) * 1080, kk * 1300 + 200, 18, 12); } });
    rotulo(ctx, 0.05, t, '-276 LB', 540, 290, 180, '#8fe39a'); rotulo(ctx, 0.6, t, 'WORLD RECORD', 540, 460, 120, '#ffd93d'); },

  // 14 — Bucle: sentado ante el plato, va a coger el tenedor… y duda
  14: (ctx, a) => { const t = a.t; const cam = { z: lerp(1, 1.08, U(a)), fx: 540, fy: 1250, t }; const va = ease(ph(t, 0.2, 0.8)) * (1 - ease(ph(t, 1.0, 1.4)));
    cocina(ctx, t, cam);
    capa(ctx, cam, 1, () => { aLaMesa(ctx, t, 340, PG(t, { mira: [1, 0.3], mood: t > 1 ? 'sorpresa' : 'neutral', manoD: [lerp(160, 300, va), -240], manoI: [-160, -240] }), () => { plato(ctx, 620, MESA_Y - 6, 'comida', 0.9); signo(ctx, t, 1.0, 340, 840, '?', '#ffd93d'); }); });
    rotulo(ctx, 0.05, t, 'AND THE RECORD', 540, 270, 120); rotulo(ctx, 0.5, t, 'FOR ANYONE...', 540, 430, 120, '#ffd93d'); },
};
