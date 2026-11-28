// pedido-30-01 — "What Happens If You Stop Drinking Water" — estilo PAPEL (un plano por frase)
import { W, H, lerp, ease, back, ph, clamp, REPARTO, personaje, capa, SUELO, salaLab, pantalla, rotulo, texto,
  exterior, celda, barrotes, signo, impacto, rr, volumen, elipse, hash, tono, paso, silla, salpica, cae } from '../../lib/papel.mjs';
const { DRA, TOM, POLI, CHICO } = REPARTO;
const U = (a) => clamp(a.t / a.d);
const sedTOM = (t, extra = {}) => ({ mood: 'triste', mira: [0, 0.3], incl: 0.04, manoI: [-110, -100], manoD: [110, -100], ...extra });
// Vaso sangre: glóbulos rojos que se amontonan (densidad 0..1)
function sangre(ctx, t, x, y, w, h, dens) { ctx.fillStyle = '#5a1420'; ctx.fillRect(x, y + h * 0.25, w, h * 0.5); ctx.fillStyle = tono('#e05a5a', -dens * 0.3); ctx.fillRect(x, y + h * 0.3, w, h * 0.4);
  const n = Math.round(lerp(10, 34, dens)), v = lerp(160, 25, dens); for (let i = 0; i < n; i++) { const cx = x + ((hash(i) * w + t * v) % w), cy = y + h * 0.33 + hash(i + 9) * h * 0.34; ctx.beginPath(); ctx.ellipse(cx, cy, 30, 20, hash(i) * 3, 0, 7); ctx.fillStyle = '#c0263a'; ctx.fill(); ctx.strokeStyle = '#6a0f1a'; ctx.lineWidth = 3; ctx.stroke(); ctx.beginPath(); ctx.ellipse(cx, cy, 13, 8, hash(i) * 3, 0, 7); ctx.fillStyle = '#9a1a2c'; ctx.fill(); } }
function cerebro(ctx, x, y, s, col = '#f2a3b3') { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.ellipse(0, 0, 150, 110, 0, 0, 7); volumen(ctx, col, -150, -110, 300, 220, 5); ctx.strokeStyle = tono(col, -0.35); ctx.lineWidth = 6; ctx.lineCap = 'round'; for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.moveTo(-120 + i * 38, -70 + (i % 2) * 30); ctx.quadraticCurveTo(-100 + i * 38, 0, -120 + i * 40, 60 - (i % 2) * 20); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(0, -105); ctx.lineTo(0, 100); ctx.stroke(); ctx.restore(); }
function rinon(ctx, x, y, s, col) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(0, -110); ctx.bezierCurveTo(110, -120, 120, 120, 0, 110); ctx.bezierCurveTo(-50, 100, -30, 30, -10, 0); ctx.bezierCurveTo(-30, -30, -50, -100, 0, -110); ctx.closePath(); volumen(ctx, col, -40, -120, 160, 240, 5); ctx.restore(); }
function termometro(ctx, t, x, y, k) { rr(ctx, x - 30, y - 360, 60, 360, 30); volumen(ctx, '#f4f6f8', x - 30, y - 360, 60, 360, 4); elipse(ctx, x, y + 10, 52, 52, '#e23b3b', 4); rr(ctx, x - 14, y - 340 * k, 28, 340 * k, 14); ctx.fillStyle = '#e23b3b'; ctx.fill(); for (let i = 1; i < 8; i++) { ctx.fillStyle = '#555'; ctx.fillRect(x + 30, y - i * 42, 18, 4); } }
function vineta(ctx, k) { if (k <= 0) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); const g = ctx.createRadialGradient(W / 2, H * 0.6, lerp(900, 0, k), W / 2, H * 0.6, lerp(1400, 300, k)); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(5,3,10,1)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.fillStyle = `rgba(5,3,10,${clamp((k - 0.7) / 0.3)})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
function gota(ctx, x, y, s, col = '#5fc4ff') { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(0, -40); ctx.quadraticCurveTo(30, 0, 26, 16); ctx.arc(0, 16, 26, 0, Math.PI); ctx.quadraticCurveTo(-30, 0, 0, -40); ctx.closePath(); volumen(ctx, col, -26, -40, 52, 82, 3); ctx.restore(); }
function calendario(ctx, t, x, y, n) { rr(ctx, x - 160, y - 200, 320, 380, 20); volumen(ctx, '#fbfaf6', x - 160, y - 200, 320, 380, 5); rr(ctx, x - 160, y - 200, 320, 100, 20); ctx.fillStyle = '#d64545'; ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '50px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('DAY', x, y - 150); ctx.fillStyle = '#231a24'; ctx.font = '200px Anton'; ctx.fillText(String(n), x, y + 50); for (const k of [-1, 1]) { rr(ctx, x + k * 90 - 10, y - 230, 20, 60, 8); ctx.fillStyle = '#555'; ctx.fill(); } }
function salaPantalla(ctx, t, u, dib, opt = {}) { const cam = { z: lerp(1, 1.06, u), fx: 540, fy: 1200, t };
  salaLab(ctx, t, cam, () => pantalla(ctx, t, 330, 330, 560, 400, dib));
  capa(ctx, cam, 1, () => { if (opt.actores) opt.actores(); else {
    personaje(ctx, t, TOM, 830, SUELO + 40, 0.95, opt.tom || sedTOM(t));
    personaje(ctx, t, DRA, 270, SUELO + 60, 1.0, { habla: true, mira: [0.8, -0.6], manoI: [-110, -110], manoD: [150, -380] }); } }); }

// botella de agua en la mano (nivel 0..1, rot = inclinación)
const botella = (nivel = 1, rot = 0) => (c) => { c.save(); c.rotate(rot); c.beginPath(); c.moveTo(-26, 10); c.lineTo(-26, -110); c.quadraticCurveTo(-26, -140, -10, -150); c.lineTo(10, -150); c.quadraticCurveTo(26, -140, 26, -110); c.lineTo(26, 10); c.closePath(); c.fillStyle = 'rgba(220,240,255,0.7)'; c.fill();
  if (nivel > 0) { c.save(); c.clip(); c.rotate(-rot); c.fillStyle = '#4fb6f0'; c.fillRect(-90, 10 - 160 * nivel, 180, 300); c.restore(); }
  c.strokeStyle = '#231a24'; c.lineWidth = 4; c.stroke(); rr(c, -12, -172, 24, 24, 4); c.fillStyle = '#3a74c9'; c.fill(); c.stroke(); rr(c, -26, -90, 52, 40, 4); c.fillStyle = '#fff'; c.fill(); c.restore(); };
// abanico de papel
const abanico = (t) => (c) => { c.rotate(-0.6 + Math.sin(t * 16) * 0.5); c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 120, -2.2, -0.9); c.closePath(); c.fillStyle = '#fbfaf6'; c.fill(); c.strokeStyle = '#231a24'; c.lineWidth = 3; c.stroke(); for (let i = 0; i < 6; i++) { const an = -2.2 + i * 0.26; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(an) * 120, Math.sin(an) * 120); c.stroke(); } };
const llaves = (t) => (c) => { c.rotate(Math.sin(t * 14) * 0.4); c.beginPath(); c.arc(0, 30, 22, 0, 7); c.strokeStyle = '#d9b44a'; c.lineWidth = 6; c.stroke(); for (let i = -1; i <= 1; i++) { rr(c, i * 16 - 4, 50, 8, 50, 3); c.fillStyle = '#d9b44a'; c.fill(); } };

export default {
  // 0 — Día tres sin agua: la sangre se espesa
  0: (ctx, a) => { const t = a.t, u = U(a); const vuelca = ease(ph(t, 0.6, 1.0));
    salaPantalla(ctx, t, u, (c, x, y, w, h) => { sangre(c, t, x, y, w, h, ease(ph(t, 0.2, 1.6))); texto(c, 'BLOOD', x + w / 2, y + 50, 50, '#ffd0d0'); }, { tom: sedTOM(t, { mood: t > 1.2 ? 'triste' : 'esfuerzo', boca: t > 0.8 ? 'o' : undefined, mira: [0.3, -1], incl: 0.02, cabeza: -0.15 * vuelca, manoD: [lerp(120, 60, vuelca), lerp(-180, -420, vuelca) + Math.sin(t * 25) * 10 * vuelca], sostieneD: botella(0, lerp(0, 2.8, vuelca)) }) });
    if (t > 1.0) { const gy = cae(t, 1.0, 830, 1330, 0.5); ctx.save(); ctx.translate(0, 0); gota(ctx, 815, gy, 0.6); ctx.restore(); }
    rotulo(ctx, 0.05, t, 'DAY 3', 540, 270, 160, '#ffd93d'); rotulo(ctx, 0.5, t, 'NO WATER', 540, 820, 120, '#8fe3ff'); },

  // 1 — Rebobina. Hora uno: no notas nada
  1: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: 1.04, fx: 540, fy: 1250, t }; const w = paso(t, 0, a.d, 300, 700, 8); const bebe = Math.sin(Math.PI * ph(t, 1.0, 1.9));
    exterior(ctx, t, cam, { cielo: 'dia' });
    capa(ctx, cam, 1, () => { personaje(ctx, t, TOM, w.x, SUELO + 40, 1.05, { anda: bebe > 0.2 ? null : w.anda, lado: 1, mood: 'feliz', cierra: bebe > 0.6, mira: [0.6, -0.2], manoD: [lerp(150, 60, bebe), lerp(-200, -330, bebe)], sostieneD: botella(1 - 0.3 * ph(t, 1.0, 1.9), -1.2 * bebe) }); });
    const rw = 1 - ph(t, 0, 0.7); if (rw > 0) { ctx.save(); ctx.globalAlpha = rw * 0.6; for (let i = 0; i < 14; i++) { ctx.fillStyle = i % 2 ? '#ffffff' : '#7fd0ff'; ctx.fillRect(0, ((i * 160 + t * 1800) % H), W, 10); } ctx.restore(); texto(ctx, '<<', 540, 700, 200, '#fff'); }
    rotulo(ctx, 0.05, t, 'REWIND', 540, 270, 150); rotulo(ctx, 0.7, t, 'HOUR 1', 540, 440, 170, '#ffd93d'); rotulo(ctx, 1.1, t, 'FEEL NOTHING', 540, 600, 100, '#8fe3ff'); },

  // 2 — Solo respirar ya te gasta agua
  2: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.1, 1.2, u), fx: 560, fy: 1150, t };
    exterior(ctx, t, cam, { cielo: 'dia' });
    capa(ctx, cam, 1, () => { const p = personaje(ctx, t, TOM, 460, SUELO + 40, 1.05, { anda: t * 14, lado: 1, mood: 'esfuerzo', boca: (t % 0.6) < 0.3 ? 'o' : 'cerrada', mira: [1, -0.1], manoI: [-100 + Math.sin(t * 14) * 50, -200], manoD: [100 + Math.sin(t * 14) * 50, -200] });
      for (let i = 0; i < 5; i++) { const k = ((t * 0.7 + i * 0.2) % 1); ctx.globalAlpha = 1 - k; ctx.beginPath(); ctx.arc(p.cabeza[0] + 110 + k * 360, p.cabeza[1] + 80 - k * 160, 24 + k * 50, 0, 7); ctx.fillStyle = 'rgba(230,245,255,0.9)'; ctx.fill(); gota(ctx, p.cabeza[0] + 110 + k * 360, p.cabeza[1] + 80 - k * 160, 0.5 + k * 0.4); ctx.globalAlpha = 1; } });
    rotulo(ctx, 0.05, t, 'EVERY BREATH', 540, 270, 130); rotulo(ctx, 0.5, t, '= WATER LOST', 540, 430, 120, '#8fe3ff'); },

  // 3 — Pierdes un 1 % y llega la sed
  3: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: 1.06, fx: 540, fy: 1250, t }; const k = ease(ph(t, 0.2, 1.2)); const sube = ease(ph(t, 0.9, 1.3));
    exterior(ctx, t, cam, { cielo: 'dia' });
    capa(ctx, cam, 1, () => { // depósito de agua del cuerpo
      rr(ctx, 680, 820, 200, 420, 30); volumen(ctx, 'rgba(255,255,255,0.7)', 680, 820, 200, 420, 5); const lv = lerp(400, 360, k); rr(ctx, 690, 1230 - lv, 180, lv, 22); ctx.fillStyle = '#4fb6f0'; ctx.fill(); texto(ctx, Math.round(lerp(100, 99, k)) + '%', 780, 1020, 70, '#fff');
      personaje(ctx, t, TOM, 380, SUELO + 40, 1.05, { mood: t > 1.2 ? 'sorpresa' : 'neutral', cierra: t > 1.4, boca: t > 1.3 ? 'o' : undefined, mira: [1, 0], manoI: [-110, -110], manoD: [lerp(150, 60, sube), lerp(-200, -340, sube)], sostieneD: botella(lerp(1, 0.5, ph(t, 1.3, 2.2)), -1.3 * sube) });
      signo(ctx, t, 0.8, 380, 740, '!', '#ff6b3d'); });
    rotulo(ctx, 0.05, t, '-1%', 540, 290, 190, '#8fe3ff'); rotulo(ctx, 1.1, t, 'THIRST!', 540, 480, 150, '#ff6b3d'); },

  // 4 — El cerebro literalmente encoge
  4: (ctx, a) => { const t = a.t, u = U(a); const k = ease(ph(t, 0.3, 1.6));
    salaPantalla(ctx, t, u, (c, x, y, w, h) => { c.beginPath(); c.ellipse(x + w / 2, y + h / 2 + 20, 200, 160, 0, 0, 7); c.strokeStyle = 'rgba(200,230,255,0.6)'; c.lineWidth = 8; c.setLineDash([16, 12]); c.stroke(); c.setLineDash([]); cerebro(c, x + w / 2, y + h / 2 + 20, lerp(1.1, 0.82, k)); for (const s of [-1, 1]) { c.strokeStyle = '#ffd93d'; c.lineWidth = 8; c.beginPath(); c.moveTo(x + w / 2 + s * 250, y + h / 2); c.lineTo(x + w / 2 + s * lerp(250, 190, k), y + h / 2); c.stroke(); } }, { tom: sedTOM(t, { mood: 'miedo', mira: [-0.5, -1], manoI: [-60, -420], manoD: [60, -420] }) });
    rotulo(ctx, 0.05, t, 'YOUR BRAIN', 540, 270, 140); rotulo(ctx, 0.5, t, 'SHRINKS', 540, 830, 150, '#ff6b9a'); },

  // 5 — Los riñones se apagan. La orina se oscurece
  5: (ctx, a) => { const t = a.t, u = U(a); const k = ease(ph(t, 0.2, 1.4));
    salaPantalla(ctx, t, u, (c, x, y, w, h) => { const col = k < 0.5 ? '#c05a5a' : '#7a3a3a'; rinon(c, x + 170, y + 190, 0.95, col); c.save(); c.translate(x + 390, y + 190); c.scale(-1, 1); rinon(c, 0, 0, 0.95, col); c.restore();
      ['#fff7b0', '#ffe066', '#f2b632', '#c98a1a', '#8a5a12'].forEach((cc, i) => { rr(c, x + 40 + i * 100, y + 320, 80, 50, 10); c.fillStyle = cc; c.fill(); c.strokeStyle = i === Math.round(k * 4) ? '#fff' : 'rgba(0,0,0,0.4)'; c.lineWidth = i === Math.round(k * 4) ? 8 : 3; c.stroke(); });
      if (k > 0.5 && (t * 3) % 1 < 0.6) texto(c, '⚠', x + w - 60, y + 60, 60, '#ffd93d'); }, { tom: sedTOM(t, { mood: 'triste' }) });
    rotulo(ctx, 0.05, t, 'KIDNEYS', 540, 270, 150); rotulo(ctx, 0.4, t, 'SHUT DOWN', 540, 830, 140, '#ff6b3d'); },

  // 6 — Sin saliva, sin sudor: el cuerpo deja de enfriarse
  6: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.05, 1.15, u), fx: 540, fy: 1250, t }; const k = ease(ph(t, 0.2, 1.8));
    exterior(ctx, t, cam, { cielo: 'atardecer', suelo: 'cemento' });
    ctx.save(); ctx.globalAlpha = 0.25 * k; ctx.fillStyle = '#ff5a2a'; ctx.fillRect(0, 0, W, H); ctx.restore();
    capa(ctx, cam, 1, () => { termometro(ctx, t, 790, 1300, lerp(0.4, 0.95, k));
      personaje(ctx, t, TOM, 400, SUELO + 40, 1.05, { mood: 'esfuerzo', mira: [0, -0.4], incl: Math.sin(t * 3) * 0.04, manoI: [-60, -380 + Math.sin(t * 6) * 20], manoD: [170, -330], sostieneD: abanico(t) });
      for (let i = 0; i < 6; i++) { const kk = (t * 0.8 + i / 6) % 1; ctx.globalAlpha = (1 - kk) * 0.6; ctx.strokeStyle = '#ffb37a'; ctx.lineWidth = 6; ctx.beginPath(); const xx = 250 + i * 60; ctx.moveTo(xx, 900 - kk * 200); ctx.quadraticCurveTo(xx + 20, 860 - kk * 200, xx, 820 - kk * 200); ctx.stroke(); ctx.globalAlpha = 1; } });
    rotulo(ctx, 0.05, t, 'NO SWEAT', 540, 270, 150); rotulo(ctx, 0.5, t, 'OVERHEATING', 540, 440, 130, '#ff6b3d'); },

  // 7 — Te levantas y te desmayas
  7: (ctx, a) => { const t = a.t, u = U(a); const sube = ease(ph(t, 0.2, 0.7)); const cam = { z: 1.08, fx: 560, fy: 1250, t };
    salaLab(ctx, t, cam);
    capa(ctx, cam, 1, () => { silla(ctx, 470, SUELO + 40, 1.05, '#3f6b5c');
      const caida = ease(ph(t, 1.0, 1.5)); const x = 490 + caida * 60; ctx.save(); ctx.translate(x, SUELO + 40); ctx.rotate(caida * 1.45); ctx.translate(-x, -(SUELO + 40));
      personaje(ctx, t, TOM, 490, SUELO + 40, 1.05, { sentado: 1 - sube, mood: t > 0.7 ? 'miedo' : 'neutral', cierra: t > 1.1, incl: Math.sin(t * 6) * 0.06 * ph(t, 0.6, 1), mira: [Math.sin(t * 5), 0], manoI: t < 0.7 ? [-150, -200] : [-120, -110], manoD: t < 0.7 ? [150, -200] : [120, -110] }); ctx.restore();
      if (caida >= 1) impacto(ctx, t, 820, SUELO, ph(t, 1.5, 1.9), 140);
      if (t > 0.6) for (let i = 0; i < 4; i++) { const an = t * 4 + i * 1.57; texto(ctx, '*', 490 + Math.cos(an) * 120 + caida * 300, 760 + Math.sin(an) * 30 + caida * 450, 70, '#ffd93d'); } });
    vineta(ctx, ease(ph(t, 0.9, a.d * 0.95)));
    rotulo(ctx, 0.05, t, 'STAND UP...', 540, 270, 140); rotulo(ctx, 0.8, t, 'BLACKOUT', 540, 440, 160, '#ff6b3d'); },

  // 8 — 10 %: confusión. 15 %: fallan los órganos
  8: (ctx, a) => { const t = a.t, u = U(a); const fase2 = u > 0.5;
    salaPantalla(ctx, t, u, (c, x, y, w, h) => { const p = fase2 ? 15 : 10; rr(c, x + 40, y + 160, w - 80, 80, 20); c.fillStyle = '#233'; c.fill(); rr(c, x + 40, y + 160, (w - 80) * p / 20, 80, 20); c.fillStyle = fase2 ? '#ff4a3d' : '#ffb347'; c.fill(); texto(c, `-${p}% WATER`, x + w / 2, y + 80, 64, '#fff'); texto(c, fase2 ? 'ORGANS FAIL' : 'CONFUSION', x + w / 2, y + 320, 62, fase2 ? '#ff6b6b' : '#ffd93d'); },
      { tom: sedTOM(t, { anda: fase2 ? null : t * 4, mood: fase2 ? 'miedo' : 'aburrido', mira: [Math.sin(t * 4), Math.cos(t * 3)], incl: Math.sin(t * 2) * 0.12, manoI: fase2 ? [-40, -150] : [-160, -200 + Math.sin(t * 3) * 40], manoD: fase2 ? [40, -150] : [160, -200 - Math.sin(t * 3) * 40] }) });
    if (!fase2) for (let i = 0; i < 3; i++) { const an = t * 3 + i * 2.1; texto(ctx, '?', 830 + Math.cos(an) * 140, 1020 + Math.sin(an) * 40, 80, '#ffd93d'); }
    rotulo(ctx, 0.05, t, fase2 ? '15%' : '10%', 540, 840, 170, fase2 ? '#ff4a3d' : '#ffb347'); },

  // 9 — La mayoría aguanta unos tres días
  9: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: 1.04, fx: 540, fy: 1250, t };
    salaLab(ctx, t, cam);
    const n = 1 + Math.min(2, Math.floor(ph(t, 0.1, a.d * 0.7) * 3)); const flip = ((ph(t, 0.1, a.d * 0.7) * 3) % 1);
    capa(ctx, cam, 1, () => { calendario(ctx, t, 600, 1000, n); if (n < 3) { ctx.save(); ctx.globalAlpha = 1 - flip; ctx.translate(600, 800); ctx.rotate(-flip * 0.8); ctx.translate(-600, -800 - flip * 80); calendario(ctx, t, 600, 1000, n); ctx.restore(); }
      const ar = ((ph(t, 0.1, a.d * 0.7) * 3) % 1); personaje(ctx, t, TOM, 330, SUELO + 40, 0.95, sedTOM(t, { mood: 'esfuerzo', mira: [1, -0.2], incl: 0.08, manoD: n < 3 ? [lerp(260, 360, ar < 0.3 ? ar / 0.3 : 1), lerp(-480, -540, ar < 0.3 ? ar / 0.3 : 1)] : [120, -100] })); });
    rotulo(ctx, 0.05, t, 'MOST PEOPLE', 540, 270, 130); rotulo(ctx, 0.5, t, '~3 DAYS', 540, 440, 170, '#ffd93d'); },

  // 10 — 1979: la policía austriaca olvida a un chico en una celda
  10: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: 1.04, fx: 540, fy: 1250, t }; const w = paso(t, 0.4, a.d, 760, 1500, 10);
    celda(ctx, t, cam);
    const agarra = t > 1.0; const sac = agarra ? Math.sin(t * 22) * 8 : 0;
    capa(ctx, cam, 1, () => { personaje(ctx, t, CHICO, lerp(420, 560, ease(ph(t, 0.5, 1.0))), SUELO + 40, 1, { anda: t > 0.5 && t < 1.0 ? t * 9 : null, lado: 1, mood: t > 1.0 ? 'miedo' : 'neutral', boca: agarra ? 'grito' : undefined, mira: [1, 0], manoI: agarra ? [70 + sac, -360] : [-110, -110], manoD: agarra ? [190 - sac, -360] : [150, -300] }); });
    barrotes(ctx, cam);
    capa(ctx, cam, 1.3, () => { personaje(ctx, t, POLI, w.x, SUELO + 120, 1.05, { anda: w.anda, lado: 1, mood: 'feliz', mira: [1, 0], manoD: [150, -200], sostieneD: llaves(t) }); });
    rotulo(ctx, 0.05, t, '1979', 540, 270, 180, '#ffd93d'); rotulo(ctx, 0.6, t, 'FORGOTTEN', 540, 450, 140); },

  // 11 — Lamía la condensación de las paredes
  11: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.15, 1.3, u), fx: 300, fy: 1100, t };
    celda(ctx, t, cam, { gotas: true });
    capa(ctx, cam, 1, () => { const lame = Math.sin(t * 5); personaje(ctx, t, CHICO, 330, SUELO + 40, 1, { mood: 'triste', boca: lame > 0 ? 'o' : 'cerrada', cierra: lame > 0.5, mira: [-1, -0.6], incl: -0.12 - lame * 0.04, cabeza: -0.2 - lame * 0.06, manoI: [-190, -380 + lame * 20], manoD: [-80, -300] }); const gy = 700 + ((t * 300) % 400); gota(ctx, 150, gy, 0.5); });
    barrotes(ctx, cam);
    rotulo(ctx, 0.05, t, 'LICKING', 540, 270, 150); rotulo(ctx, 0.5, t, 'THE WALLS', 540, 440, 150, '#8fe3ff'); },

  // 12 — 18 días. Guinness sigue teniéndolo como récord
  12: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: 1.06, fx: 540, fy: 1150, t }; const n = Math.round(ease(ph(t, 0.1, a.d * 0.6)) * 18); const ab = ease(ph(t, a.d * 0.62, a.d * 0.8)); const w = paso(t, a.d * 0.75, a.d, 420, 900);
    celda(ctx, t, cam);
    capa(ctx, cam, 0.55, () => { ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 8; ctx.lineCap = 'round'; for (let i = 0; i < n; i++) { const g = Math.floor(i / 5), j = i % 5, x = 160 + g * 120 + j * 20, y = 640; if (j === 4) { ctx.beginPath(); ctx.moveTo(x - 90, y + 80); ctx.lineTo(x + 10, y - 10); ctx.stroke(); } else { ctx.beginPath(); ctx.moveTo(x, y - 10); ctx.lineTo(x, y + 80); ctx.stroke(); } } });
    const raya = n < 18; capa(ctx, cam, 1, () => { personaje(ctx, t, CHICO, w.x, SUELO + 40, 1, { anda: w.anda, lado: 1, mood: n >= 18 ? 'feliz' : 'triste', mira: raya ? [-1, -0.8] : [1, -0.2], manoI: raya ? [-200, -520 + Math.sin(t * 14) * 50] : [-170, -400], manoD: raya ? [120, -110] : [170, -400], sostieneI: raya ? (c) => { rr(c, -6, -50, 12, 50, 4); c.fillStyle = '#ddd'; c.fill(); } : null }); });
    barrotes(ctx, cam, ab);
    rotulo(ctx, 0.05, t, `DAY ${Math.max(1, n)}`, 540, 290, 170, '#ffd93d'); rotulo(ctx, a.d * 0.6, t, 'WORLD RECORD', 540, 460, 120, '#8fe3ff'); },

  // 13 — Para casi todos los demás, acaba por… (bucle)
  13: (ctx, a) => { const t = a.t, u = U(a);
    salaPantalla(ctx, t, u, (c, x, y, w, h) => { sangre(c, t, x, y, w, h, 1); texto(c, 'DAY 3', x + w / 2, y + 50, 56, '#ffd0d0'); }, { tom: sedTOM(t, { mood: 'miedo', mira: [-1, -0.5], manoD: t < 0.6 ? [150, -230] : [140, -110], sostieneD: t < 0.6 ? botella(0, 0.3) : null }) });
    if (t >= 0.6) { const by = cae(t, 0.6, 1100, SUELO + 10, 0.4); ctx.save(); ctx.translate(960, by); ctx.rotate(Math.min(1, (t - 0.6) * 3) * 1.57); botella(0, 0)(ctx); ctx.restore(); }
    signo(ctx, t, 0.3, 830, 760, '?', '#ffd93d');
    rotulo(ctx, 0.05, t, 'FOR EVERYONE', 540, 270, 130); rotulo(ctx, 0.4, t, 'ELSE...', 540, 830, 150, '#ff6b3d'); },
};
