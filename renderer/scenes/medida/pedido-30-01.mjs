// pedido-30-01 — "What Happens If You Stop Drinking Water" — estilo PAPEL (un plano por frase)
import { W, H, lerp, ease, back, ph, clamp, REPARTO, personaje, capa, SUELO, salaLab, pantalla, rotulo, texto,
  exterior, celda, barrotes, signo, impacto, rr, volumen, elipse, hash, tono } from '../../lib/papel.mjs';
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

export default {
  // 0 — Día tres sin agua: la sangre se espesa
  0: (ctx, a) => { const t = a.t, u = U(a);
    salaPantalla(ctx, t, u, (c, x, y, w, h) => { sangre(c, t, x, y, w, h, ease(ph(t, 0.2, 1.6))); texto(c, 'BLOOD', x + w / 2, y + 50, 50, '#ffd0d0'); }, { tom: sedTOM(t, { mood: 'esfuerzo', incl: 0.08 }) });
    rotulo(ctx, 0.05, t, 'DAY 3', 540, 270, 160, '#ffd93d'); rotulo(ctx, 0.5, t, 'NO WATER', 540, 820, 120, '#8fe3ff'); },

  // 1 — Rebobina. Hora uno: no notas nada
  1: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: 1.04, fx: 540, fy: 1250, t };
    exterior(ctx, t, cam, { cielo: 'dia' });
    capa(ctx, cam, 1, () => { personaje(ctx, t, TOM, 560, SUELO + 40, 1.05, { mood: 'feliz', mira: [0.3, -0.2], manoI: [-140, -120], manoD: [150, -330] }); });
    const rw = 1 - ph(t, 0, 0.7); if (rw > 0) { ctx.save(); ctx.globalAlpha = rw * 0.6; for (let i = 0; i < 14; i++) { ctx.fillStyle = i % 2 ? '#ffffff' : '#7fd0ff'; ctx.fillRect(0, ((i * 160 + t * 1800) % H), W, 10); } ctx.restore(); texto(ctx, '◀◀', 540, 700, 200, '#fff'); }
    rotulo(ctx, 0.05, t, 'REWIND', 540, 270, 150); rotulo(ctx, 0.7, t, 'HOUR 1', 540, 440, 170, '#ffd93d'); rotulo(ctx, 1.1, t, 'FEEL NOTHING', 540, 600, 100, '#8fe3ff'); },

  // 2 — Solo respirar ya te gasta agua
  2: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.1, 1.2, u), fx: 560, fy: 1150, t };
    exterior(ctx, t, cam, { cielo: 'dia' });
    capa(ctx, cam, 1, () => { const p = personaje(ctx, t, TOM, 460, SUELO + 40, 1.05, { mood: 'neutral', boca: (t % 1.2) < 0.6 ? 'o' : 'cerrada', mira: [1, -0.1], manoI: [-120, -110], manoD: [120, -110] });
      for (let i = 0; i < 5; i++) { const k = ((t * 0.7 + i * 0.2) % 1); ctx.globalAlpha = 1 - k; ctx.beginPath(); ctx.arc(p.cabeza[0] + 110 + k * 360, p.cabeza[1] + 80 - k * 160, 24 + k * 50, 0, 7); ctx.fillStyle = 'rgba(230,245,255,0.9)'; ctx.fill(); gota(ctx, p.cabeza[0] + 110 + k * 360, p.cabeza[1] + 80 - k * 160, 0.5 + k * 0.4); ctx.globalAlpha = 1; } });
    rotulo(ctx, 0.05, t, 'EVERY BREATH', 540, 270, 130); rotulo(ctx, 0.5, t, '= WATER LOST', 540, 430, 120, '#8fe3ff'); },

  // 3 — Pierdes un 1 % y llega la sed
  3: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: 1.06, fx: 540, fy: 1250, t }; const k = ease(ph(t, 0.2, 1.2));
    exterior(ctx, t, cam, { cielo: 'dia' });
    capa(ctx, cam, 1, () => { // depósito de agua del cuerpo
      rr(ctx, 680, 820, 200, 420, 30); volumen(ctx, 'rgba(255,255,255,0.7)', 680, 820, 200, 420, 5); const lv = lerp(400, 360, k); rr(ctx, 690, 1230 - lv, 180, lv, 22); ctx.fillStyle = '#4fb6f0'; ctx.fill(); texto(ctx, Math.round(lerp(100, 99, k)) + '%', 780, 1020, 70, '#fff');
      personaje(ctx, t, TOM, 380, SUELO + 40, 1.05, { mood: t > 1.2 ? 'esfuerzo' : 'neutral', boca: t > 1.2 ? 'a' : undefined, mira: [1, 0], manoI: [-110, -110], manoD: t > 1.2 ? [60, -420] : [120, -110] });
      signo(ctx, t, 1.2, 380, 740, '!', '#ff6b3d'); });
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
      personaje(ctx, t, TOM, 400, SUELO + 40, 1.05, { mood: 'esfuerzo', mira: [0, -0.4], incl: Math.sin(t * 3) * 0.04, manoI: [-120, -110], manoD: [110, -110] });
      for (let i = 0; i < 6; i++) { const kk = (t * 0.8 + i / 6) % 1; ctx.globalAlpha = (1 - kk) * 0.6; ctx.strokeStyle = '#ffb37a'; ctx.lineWidth = 6; ctx.beginPath(); const xx = 250 + i * 60; ctx.moveTo(xx, 900 - kk * 200); ctx.quadraticCurveTo(xx + 20, 860 - kk * 200, xx, 820 - kk * 200); ctx.stroke(); ctx.globalAlpha = 1; } });
    rotulo(ctx, 0.05, t, 'NO SWEAT', 540, 270, 150); rotulo(ctx, 0.5, t, 'OVERHEATING', 540, 440, 130, '#ff6b3d'); },

  // 7 — Te levantas y te desmayas
  7: (ctx, a) => { const t = a.t, u = U(a); const sube = ease(ph(t, 0.1, 0.6)); const cam = { z: 1.08, fx: 560, fy: 1250, t };
    salaLab(ctx, t, cam);
    capa(ctx, cam, 1, () => { rr(ctx, 360, 1240, 260, 30, 8); volumen(ctx, '#8b6446', 360, 1240, 260, 30, 4); for (const x of [380, 580]) { rr(ctx, x, 1270, 20, 150, 4); volumen(ctx, '#6b4a36', x, 1270, 20, 150, 3); }
      const caida = ease(ph(t, 1.0, 1.6)); personaje(ctx, t, TOM, 490, SUELO + 40 - (1 - sube) * 0, lerp(0.85, 1.05, sube), { mood: t > 0.7 ? 'miedo' : 'neutral', cierra: t > 1.1, incl: caida * 0.5 + Math.sin(t * 6) * 0.05 * ph(t, 0.6, 1), mira: [Math.sin(t * 5), 0], manoI: [-120, -110], manoD: [120, -110] });
      if (t > 0.6) for (let i = 0; i < 4; i++) { const an = t * 4 + i * 1.57; texto(ctx, '★', 490 + Math.cos(an) * 120, 760 + Math.sin(an) * 30, 50, '#ffd93d'); } });
    vineta(ctx, ease(ph(t, 0.7, a.d * 0.95)));
    rotulo(ctx, 0.05, t, 'STAND UP...', 540, 270, 140); rotulo(ctx, 0.8, t, 'BLACKOUT', 540, 440, 160, '#ff6b3d'); },

  // 8 — 10 %: confusión. 15 %: fallan los órganos
  8: (ctx, a) => { const t = a.t, u = U(a); const fase2 = u > 0.5;
    salaPantalla(ctx, t, u, (c, x, y, w, h) => { const p = fase2 ? 15 : 10; rr(c, x + 40, y + 160, w - 80, 80, 20); c.fillStyle = '#233'; c.fill(); rr(c, x + 40, y + 160, (w - 80) * p / 20, 80, 20); c.fillStyle = fase2 ? '#ff4a3d' : '#ffb347'; c.fill(); texto(c, `-${p}% WATER`, x + w / 2, y + 80, 64, '#fff'); texto(c, fase2 ? 'ORGANS FAIL' : 'CONFUSION', x + w / 2, y + 320, 62, fase2 ? '#ff6b6b' : '#ffd93d'); },
      { tom: sedTOM(t, { mood: fase2 ? 'miedo' : 'aburrido', mira: [Math.sin(t * 4), Math.cos(t * 3)], incl: Math.sin(t * 2) * 0.08 }) });
    if (!fase2) for (let i = 0; i < 3; i++) { const an = t * 3 + i * 2.1; texto(ctx, '?', 830 + Math.cos(an) * 140, 1020 + Math.sin(an) * 40, 80, '#ffd93d'); }
    rotulo(ctx, 0.05, t, fase2 ? '15%' : '10%', 540, 840, 170, fase2 ? '#ff4a3d' : '#ffb347'); },

  // 9 — La mayoría aguanta unos tres días
  9: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: 1.04, fx: 540, fy: 1250, t };
    salaLab(ctx, t, cam);
    const n = 1 + Math.min(2, Math.floor(ph(t, 0.1, a.d * 0.7) * 3)); const flip = ((ph(t, 0.1, a.d * 0.7) * 3) % 1);
    capa(ctx, cam, 1, () => { calendario(ctx, t, 600, 1000, n); if (n < 3) { ctx.save(); ctx.globalAlpha = 1 - flip; ctx.translate(600, 800); ctx.rotate(-flip * 0.8); ctx.translate(-600, -800 - flip * 80); calendario(ctx, t, 600, 1000, n); ctx.restore(); }
      personaje(ctx, t, TOM, 280, SUELO + 40, 0.95, sedTOM(t, { mood: 'esfuerzo', mira: [1, -0.2], incl: 0.08 })); });
    rotulo(ctx, 0.05, t, 'MOST PEOPLE', 540, 270, 130); rotulo(ctx, 0.5, t, '~3 DAYS', 540, 440, 170, '#ffd93d'); },

  // 10 — 1979: la policía austriaca olvida a un chico en una celda
  10: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: 1.04, fx: 540, fy: 1250, t }; const va = ease(ph(t, 0.4, a.d));
    celda(ctx, t, cam);
    capa(ctx, cam, 1, () => { personaje(ctx, t, CHICO, 420, SUELO + 40, 1, { mood: t > 1.2 ? 'sorpresa' : 'neutral', mira: [1, 0], manoI: [-110, -110], manoD: [150, -300] }); });
    barrotes(ctx, cam);
    capa(ctx, cam, 1.3, () => { personaje(ctx, t, POLI, lerp(760, 1500, va), SUELO + 120, 1.05, { mood: 'feliz', mira: [1, 0], incl: Math.sin(t * 10) * 0.03, manoI: [-120, -120], manoD: [130, -130] }); });
    rotulo(ctx, 0.05, t, '1979', 540, 270, 180, '#ffd93d'); rotulo(ctx, 0.6, t, 'FORGOTTEN', 540, 450, 140); },

  // 11 — Lamía la condensación de las paredes
  11: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.15, 1.3, u), fx: 300, fy: 1100, t };
    celda(ctx, t, cam, { gotas: true });
    capa(ctx, cam, 1, () => { personaje(ctx, t, CHICO, 330, SUELO + 40, 1, { mood: 'triste', boca: 'o', mira: [-1, -0.6], incl: -0.12, cabeza: -0.2, manoI: [-170, -380], manoD: [-60, -300] }); });
    barrotes(ctx, cam);
    rotulo(ctx, 0.05, t, 'LICKING', 540, 270, 150); rotulo(ctx, 0.5, t, 'THE WALLS', 540, 440, 150, '#8fe3ff'); },

  // 12 — 18 días. Guinness sigue teniéndolo como récord
  12: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: 1.06, fx: 540, fy: 1150, t }; const n = Math.round(ease(ph(t, 0.1, a.d * 0.6)) * 18);
    celda(ctx, t, cam);
    capa(ctx, cam, 0.55, () => { ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 8; ctx.lineCap = 'round'; for (let i = 0; i < n; i++) { const g = Math.floor(i / 5), j = i % 5, x = 160 + g * 120 + j * 20, y = 640; if (j === 4) { ctx.beginPath(); ctx.moveTo(x - 90, y + 80); ctx.lineTo(x + 10, y - 10); ctx.stroke(); } else { ctx.beginPath(); ctx.moveTo(x, y - 10); ctx.lineTo(x, y + 80); ctx.stroke(); } } });
    capa(ctx, cam, 1, () => { personaje(ctx, t, CHICO, 600, SUELO + 40, 1, { mood: n >= 18 ? 'feliz' : 'triste', mira: [-0.6, -0.6], manoI: [-120, -110], manoD: n >= 18 ? [140, -420] : [120, -110] }); });
    rotulo(ctx, 0.05, t, `DAY ${Math.max(1, n)}`, 540, 290, 170, '#ffd93d'); rotulo(ctx, a.d * 0.6, t, 'WORLD RECORD', 540, 460, 120, '#8fe3ff'); },

  // 13 — Para casi todos los demás, acaba por… (bucle)
  13: (ctx, a) => { const t = a.t, u = U(a);
    salaPantalla(ctx, t, u, (c, x, y, w, h) => { sangre(c, t, x, y, w, h, 1); texto(c, 'DAY 3', x + w / 2, y + 50, 56, '#ffd0d0'); }, { tom: sedTOM(t, { mood: 'miedo', mira: [-1, -0.5] }) });
    signo(ctx, t, 0.3, 830, 760, '?', '#ffd93d');
    rotulo(ctx, 0.05, t, 'FOR EVERYONE', 540, 270, 130); rotulo(ctx, 0.4, t, 'ELSE...', 540, 830, 150, '#ff6b3d'); },
};
