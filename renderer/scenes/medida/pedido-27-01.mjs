// pedido-27-01 — "What Actually Happens If You Step in Quicksand?" (Short vertical, estilo nuevo: gente + escenario + SET)
import { W, H, INK, V, clamp, sm, lerp, fase, ph, hs, fondo, D, cielo, ln, circ, caja, titular, sello, tacha, peli, temblor, gotas, flecha } from '../../lib/corto.mjs';

let CAST = null;
function cast(K) {
  if (CAST) return CAST;
  const sin = { sombrero: null, corbata: null, barba: false, bigote: false };
  const [YOU, ACT, FAN, VIEW] = K.reparto('pedido-27', 4, [
    { ...sin, estilo: 'limpio', pelo: 'pinchos', peloCol: '#3a2414', ropa: '#4d96ff' },
    { ...sin, estilo: 'gordito', pelo: 'tupe', peloCol: '#1a120c', ropa: '#e9d8a6', sombrero: 'vaquero' },
    { ...sin, estilo: 'limpio', pelo: 'coleta', peloCol: '#a33b20', ropa: '#ff9f43' },
    { ...sin, estilo: 'gordito', pelo: 'calvo', ropa: '#6bcb77', gafas: true },
  ]);
  return (CAST = { YOU, ACT, FAN, VIEW });
}
const SAND = '#d9a95e', SAND2 = '#b9853f', WET = '#8f6a3a';
// Pozo de arena movediza en corte: superficie en sy; front=true tapa lo de dentro (vista normal), si no deja ver el corte
function arenaFondo(ctx, a, sy, { brillo = 1 } = {}) {
  const g = ctx.createLinearGradient(0, sy, 0, H); g.addColorStop(0, WET); g.addColorStop(1, '#5a3f22'); ctx.fillStyle = g; ctx.fillRect(0, sy, W, H - sy);
  for (let i = 0; i < 90; i++) { ctx.fillStyle = i % 3 ? 'rgba(255,230,170,0.25)' : 'rgba(60,35,15,0.3)'; ctx.beginPath(); ctx.arc(hs(i) * W, sy + 30 + hs(i + 5) * (H - sy), 3 + hs(i + 2) * 5, 0, 7); ctx.fill(); }
  if (brillo) { ctx.save(); ctx.globalAlpha = 0.5 * brillo; for (let i = 0; i < 7; i++) { const x = (hs(i + 30) * W + a.t * 30) % W; ctx.fillStyle = '#fff6d8'; ctx.beginPath(); ctx.ellipse(x, sy + 14 + (i % 3) * 8, 60, 6, 0, 0, 7); ctx.fill(); } ctx.restore(); }
}
function arenaFrente(ctx, a, sy, alpha = 1) {
  ctx.save(); ctx.globalAlpha = alpha; const g = ctx.createLinearGradient(0, sy, 0, H); g.addColorStop(0, '#a07a45'); g.addColorStop(1, '#6a4a28'); ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(0, sy); for (let x = 0; x <= W; x += 30) ctx.lineTo(x, sy + Math.sin(x / 70 + a.t * 1.5) * 5); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
  ctx.globalAlpha = 1; ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.beginPath(); for (let x = 0; x <= W; x += 30) { const y = sy + Math.sin(x / 70 + a.t * 1.5) * 5; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.restore();
}
function sol(ctx, a, x, y, r = 110) { ctx.save(); ctx.translate(x, y); ctx.rotate(a.t * 0.4); ctx.strokeStyle = '#ffb703'; ctx.lineWidth = 14; ctx.lineCap = 'round'; for (let i = 0; i < 12; i++) { ctx.rotate(Math.PI / 6); ln(ctx, [[r * 1.25, 0], [r * 1.25 + 40 + Math.sin(a.t * 5 + i) * 12, 0]], '#ffb703', 14); } ctx.restore(); circ(ctx, x, y, r, '#ffd93d', 8); }
function olas(ctx, a, y, k = 1, col = '#3a8fd6') { ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; x <= W; x += 20) ctx.lineTo(x, y + Math.sin(x / 80 + a.t * 3) * 16 * k); ctx.lineTo(W, H); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#e6f6ff'; ctx.lineWidth = 8; ctx.beginPath(); for (let x = 0; x <= W; x += 20) { const yy = y + Math.sin(x / 80 + a.t * 3) * 16 * k; x ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); } ctx.stroke(); ctx.restore(); }
// Persona hundida: los pies en sy + hundido
function hundido(K, ctx, a, p, x, sy, hund, esc, o = {}) { return D(K, ctx, a, p, x, sy + hund, esc, { sombra: false, ...o }); }

const BASE = (fn) => (ctx, a, K) => { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#9fd4ff'); g.addColorStop(0.55, WET); g.addColorStop(1, '#4a331c'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); fn(ctx, a, K); };
const PLANOS = {
  // 0 — Las películas mienten: un actor se hunde entero (fotograma de película) y cae el sello MYTH
  0: (ctx, a, K) => { const { ACT } = cast(K);
    peli(ctx, a, () => K.camara(ctx, a, () => { const sy = fondo(ctx, a, 'bosque', { hora: 'atardecer' }, { cx: 900 }) - 120; arenaFondo(ctx, a, sy);
      const h = sm(ph(a, 0, 0.6)) * 820; const y = hundido(K, ctx, a, ACT, W / 2, sy, h, 1.5, { pose: 'miedo', mood: 'miedo' });
      if (y.cabeza[1] - y.hr < sy) K.globo(ctx, a, 'HELP!', W / 2 + 160, sy - 560, { tx: y.cabeza[0], ty: y.cabeza[1], grito: true, p0: 0.05 });
      arenaFrente(ctx, a, sy); if (h > 700) K.prop(ctx, 'mano', W / 2, sy - 40 + Math.sin(a.t * 8) * 10, 0.6, a.t); }, { ...V, de: 1, a: 1.12, foco: [W / 2, 1100] }));
    titular(ctx, a, 'THE MOVIES', W / 2, 260, { size: 110, col: '#ffd93d', p0: 0.02 });
    sello(ctx, a, 'MYTH', W / 2, 560, { p0: 0.68, size: 150 }); },
  // 1 — ¿Qué pasa de verdad si pisas arena movediza? Tú al borde, cartel de peligro
  1: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { const gy = fondo(ctx, a, 'marisma', { hora: 'dia', agua: 0.2 }, { cx: 700 }); const sy = gy - 40;
      ctx.save(); ctx.beginPath(); ctx.ellipse(W / 2 + 120, sy + 60, 520, 120, 0, 0, 7); ctx.fillStyle = WET; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke(); ctx.globalAlpha = 0.5 + 0.3 * Math.sin(a.t * 3); ctx.fillStyle = '#fff6d8'; ctx.beginPath(); ctx.ellipse(W / 2 + 60, sy + 40, 200, 18, 0, 0, 7); ctx.fill(); ctx.restore();
      K.cartel(ctx, a, 'DANGER: QUICKSAND', 830, sy - 330, { tipo: 'amarillo', size: 40, rot: 0.06, p0: 0.1 });
      const { x, pose, mira } = K.anda(a, 120, 330, 0, 0.45); const y = D(K, ctx, a, YOU, x, sy + 10, 1.55, { pose: fase(a) > 0.45 ? 'piensa' : pose, mira: fase(a) > 0.45 ? 1 : mira, mood: 'duda' });
      K.simbolo(ctx, a, y.cabeza, y.hr, '?', 0.5); }, { ...V, de: 1.05, a: 1.15, foco: [520, 1300] });
    K.luz(ctx, a, { ...V, tono: 'dia', foco: [800, 300] }); titular(ctx, a, 'WHAT REALLY', W / 2, 250, { size: 100, p0: 0.05 }); titular(ctx, a, 'HAPPENS?', W / 2, 380, { size: 120, col: '#ffd93d', p0: 0.15 }); },
  // 2 — Pero aun así puede matarte: hundido hasta la cintura, luz roja, calavera
  2: (ctx, a, K) => { const { YOU } = cast(K);
    temblor(ctx, a, 4 * ph(a, 0.4, 0.6), () => K.camara(ctx, a, () => { const sy = fondo(ctx, a, 'marisma', { hora: 'atardecer', agua: 0.3 }, { cx: 1100 }) - 100; arenaFondo(ctx, a, sy);
      const y = hundido(K, ctx, a, YOU, W / 2, sy, 330, 1.7, { pose: 'miedo', mood: 'miedo' }); arenaFrente(ctx, a, sy); K.simbolo(ctx, a, y.cabeza, y.hr, '!', 0.3);
      ctx.save(); ctx.globalAlpha = ph(a, 0.35, 0.6) * 0.9; K.prop(ctx, 'calavera', W / 2, 560 + Math.sin(a.t * 2) * 12, 1.1, a.t); ctx.restore(); }, { ...V, de: 1.15, a: 1, foco: [W / 2, 1000] }));
    K.luz(ctx, a, { ...V, tono: 'tension', foco: [W / 2, 600] }); titular(ctx, a, 'BUT IT CAN', W / 2, 240, { size: 100 }); titular(ctx, a, 'STILL KILL YOU', W / 2, 370, { size: 110, col: '#ff4d5e', p0: 0.25 }); },
  // 3 — Pisas arena mojada y brillante: primer plano de la bota apoyándose, la superficie tiembla
  3: (ctx, a, K) => {
    K.camara(ctx, a, () => { cielo(ctx, '#bfe3ff', '#f6e4c0', 0, 990); const sy = 980; arenaFondo(ctx, a, sy, { brillo: 1 });
      for (let i = 0; i < 18; i++) { const x = hs(i + 40) * W, y = sy + 80 + hs(i + 41) * 700; ctx.save(); ctx.globalAlpha = 0.6 + 0.4 * Math.sin(a.t * 6 + i); ctx.fillStyle = '#ffffff'; ctx.translate(x, y); ctx.rotate(Math.PI / 4); ctx.fillRect(-7, -7, 14, 14); ctx.restore(); }
      const k = sm(ph(a, 0.05, 0.55)), by = lerp(560, 1040, k), sq = ph(a, 0.5, 0.8);
      if (sq > 0) for (let r = 0; r < 3; r++) { ctx.save(); ctx.globalAlpha = (1 - ((sq + r / 3) % 1)); ctx.strokeStyle = '#fff6d8'; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(W / 2, 1060, 120 + ((sq + r / 3) % 1) * 380, 30 + ((sq + r / 3) % 1) * 70, 0, 0, 7); ctx.stroke(); ctx.restore(); }
      // pierna + bota
      ctx.save(); ctx.translate(W / 2, by); caja(ctx, -60, -900, 120, 860, 30, '#2b2d42', 8); caja(ctx, -90, -120, 200, 150, 40, '#6b4423', 8); caja(ctx, -96, 10, 214, 34, 14, '#2a1d16', 6); ctx.restore();
      ctx.save(); ctx.fillStyle = WET; ctx.globalAlpha = 0.9; ctx.beginPath(); ctx.ellipse(W / 2 + 10, 1080, 170 * sq + 1, 40 * sq + 1, 0, 0, 7); ctx.fill(); ctx.restore(); }, { ...V, de: 1, a: 1.1, foco: [W / 2, 1050] });
    K.luz(ctx, a, { ...V, tono: 'dia', foco: [W / 2, 900] }); K.etiqueta(ctx, a, 'WET & SHINY', 780, 380, { size: 52, p0: 0.2 }); },
  // 4 — Se hunde un pie, luego el otro (corte lateral)
  4: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { cielo(ctx, '#8fd0ff', '#f9e6c4', 0, 1110); const sy = 1100; arenaFondo(ctx, a, sy);
      const k1 = sm(ph(a, 0.05, 0.45)), k2 = sm(ph(a, 0.5, 0.9)); const hund = (k1 + k2) * 110;
      const y = hundido(K, ctx, a, YOU, W / 2, sy, hund, 1.8, { pose: k2 > 0 ? 'miedo' : 'manos', mood: k2 > 0.3 ? 'miedo' : 'sorpresa', mira: 0 });
      arenaFrente(ctx, a, sy, 0.55);
      if (k1 > 0.2) flecha(ctx, W / 2 - 220, sy + 30, W / 2 - 220, sy + 30 + 140 * k1, '#ffd93d', 22);
      if (k2 > 0.2) flecha(ctx, W / 2 + 220, sy + 30, W / 2 + 220, sy + 30 + 140 * k2, '#ffd93d', 22);
      K.simbolo(ctx, a, y.cabeza, y.hr, '!', 0.55); }, { ...V, de: 1, a: 1.08, foco: [W / 2, 1100] });
    K.luz(ctx, a, { ...V, tono: 'dia' }); titular(ctx, a, 'LEFT...', 300, 300, { size: 110, p0: 0.1, rot: -0.06 }); titular(ctx, a, 'THEN RIGHT', 720, 450, { size: 110, col: '#ffd93d', p0: 0.55, rot: 0.05 }); },
  // 5 — Es el doble de densa que tú: una balanza con tu monigote y un cubo de arena
  5: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { fondo(ctx, a, 'playa', { hora: 'dia' }, { cx: 960, blur: 6 }); ctx.fillStyle = 'rgba(255,250,235,0.35)'; ctx.fillRect(0, 0, W, H);
      const inc = sm(ph(a, 0.25, 0.6)) * 0.28 + Math.sin(a.t * 4) * 0.01 * ph(a, 0.6, 1); const cx = W / 2, cy = 900;
      caja(ctx, cx - 30, cy, 60, 520, 12, '#8d99ae', 7); caja(ctx, cx - 200, cy + 500, 400, 50, 20, '#5a5f73', 7);
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(inc); caja(ctx, -420, -20, 840, 40, 20, '#c9ccd6', 7);
      const pl = (sx, fn) => { ctx.save(); ctx.translate(sx, 0); ctx.rotate(-inc); ln(ctx, [[-120, 180], [0, 0], [120, 180]], INK, 5); caja(ctx, -160, 180, 320, 30, 14, '#ffd93d', 6); fn(); ctx.restore(); };
      pl(-380, () => { D(K, ctx, a, YOU, 0, 180, 0.8, { pose: 'encoge', mood: 'sorpresa', mira: 1 }); });
      pl(380, () => { caja(ctx, -110, 40, 220, 140, 20, SAND, 7); ctx.fillStyle = SAND2; ctx.beginPath(); ctx.ellipse(0, 40, 110, 30, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '40px Anton'; ctx.textAlign = 'center'; ctx.fillText('SAND', 0, 130); });
      ctx.restore(); circ(ctx, cx, cy, 28, '#ffd93d', 7); }, { ...V, de: 1, a: 1.08, foco: [W / 2, 1000] });
    titular(ctx, a, '2X DENSER', W / 2, 330, { size: 150, col: '#ffd93d', p0: 0.45 }); K.etiqueta(ctx, a, 'THAN YOUR BODY', W / 2, 480, { size: 50, rot: 0.03, p0: 0.6 }); },
  // 6 — Flotas hasta la cintura… y te paras (señal de STOP)
  6: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { cielo(ctx, '#8fd0ff', '#f6e4c0', 0, 1110); const sy = 1100; arenaFondo(ctx, a, sy);
      const k = sm(ph(a, 0, 0.55)), rebote = ph(a, 0.55, 0.75) > 0 ? Math.sin(ph(a, 0.55, 0.75) * Math.PI) * -18 : 0; const hund = k * 330 + rebote;
      const y = hundido(K, ctx, a, YOU, W / 2, sy, hund, 1.7, { pose: k < 1 ? 'miedo' : 'brazos', mood: k < 1 ? 'miedo' : 'sorpresa' }); arenaFrente(ctx, a, sy, 0.55);
      ln(ctx, [[120, sy + 330 - 40], [W - 120, sy + 330 - 40]], '#ff4d5e', 6); K.etiqueta(ctx, a, 'WAIST-DEEP', 230, sy + 230, { size: 40, p0: 0.5, rot: -0.05 });
      if (ph(a, 0.6, 0.7) > 0) { const s = ease(ph(a, 0.6, 0.72)); ctx.save(); ctx.translate(850, 650); ctx.scale(s, s); ctx.beginPath(); for (let i = 0; i < 8; i++) { const an = Math.PI / 8 + i * Math.PI / 4; ctx.lineTo(Math.cos(an) * 130, Math.sin(an) * 130); } ctx.closePath(); ctx.fillStyle = '#e63946'; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = '#fff'; ctx.stroke(); ctx.fillStyle = '#fff'; ctx.font = '76px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('STOP', 0, 4); ctx.restore(); ln(ctx, [[850, 780], [850, 1100]], '#8d99ae', 16); } }, { ...V, de: 1.06, a: 1, foco: [W / 2, 1000] });
    titular(ctx, a, 'YOU FLOAT', W / 2, 300, { size: 130, p0: 0.05 }); },
  // 7 — El agua se escurre y la arena se cierra sobre tus piernas (corte con gotas que bajan y candado)
  7: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { cielo(ctx, '#ffc98a', '#f6e4c0', 0, 760); const sy = 760; arenaFondo(ctx, a, sy, { brillo: 1 - fase(a) });
      const y = hundido(K, ctx, a, YOU, W / 2, sy, 330 * 1.6, 2.2, { pose: 'empuja', mood: 'enfadado' }); arenaFrente(ctx, a, sy, 0.5);
      gotas(ctx, a, 120, W - 120, sy + 40, H, 26, '#5ec8ff', 500); const k = ph(a, 0.35, 0.8);
      ctx.save(); ctx.globalAlpha = k * 0.8; ctx.fillStyle = '#8a5a2a'; for (let i = 0; i < 160; i++) { const gx = W / 2 + (hs(i) - 0.5) * 520 * (1.4 - k * 0.4), gy = sy + 120 + hs(i + 1) * 900; ctx.beginPath(); ctx.arc(gx, gy, 9, 0, 7); ctx.fill(); } ctx.restore();
      if (ph(a, 0.6, 0.7) > 0) { const s = sm(ph(a, 0.6, 0.72)); ctx.save(); ctx.translate(W / 2, sy + 500); ctx.scale(s, s); ctx.lineWidth = 22; ctx.strokeStyle = '#c9ccd6'; ctx.beginPath(); ctx.arc(0, -60, 70, Math.PI, 0); ctx.stroke(); caja(ctx, -110, -60, 220, 170, 24, '#ffd93d', 8); circ(ctx, 0, 10, 18, INK, 0); ctx.restore(); } }, { ...V, de: 1.05, a: 1.12, foco: [W / 2, 1200] });
    titular(ctx, a, 'WATER DRAINS', W / 2, 220, { size: 100, col: '#5ec8ff', p0: 0.05 }); titular(ctx, a, 'SAND LOCKS', W / 2, 350, { size: 110, col: '#ffd93d', p0: 0.55 }); },
  // 8 — Sacar un pie cuesta la fuerza de levantar un coche
  8: (ctx, a, K) => { const { YOU, FAN } = cast(K);
    K.camara(ctx, a, () => { const sy = fondo(ctx, a, 'marisma', { hora: 'dia', agua: 0.2 }, { cx: 1300 }) - 60; arenaFondo(ctx, a, sy);
      const tir = Math.sin(a.t * 10) * 6; const y = hundido(K, ctx, a, YOU, 360, sy, 300 + tir, 1.55, { pose: 'empuja', mood: 'enfadado', mira: -1, giro: -0.15 + tir * 0.004 }); arenaFrente(ctx, a, sy);
      K.mareo(ctx, a, y.cabeza, y.hr);
      const lev = sm(ph(a, 0.35, 0.85)) * 120; const z = D(K, ctx, a, FAN, 770, sy - 20, 1.25, { pose: 'levanta', mood: 'enfadado' });
      ctx.save(); ctx.translate(770, z.top - 120 - lev * 0.2 + Math.sin(a.t * 12) * 4); K.prop(ctx, 'coche_rojo', 0, 0, 1.0, a.t); ctx.restore(); }, { ...V, de: 1, a: 1.1, foco: [560, 1200] });
    titular(ctx, a, '= LIFTING', W / 2, 290, { size: 110, p0: 0.3 }); titular(ctx, a, 'A CAR', W / 2, 420, { size: 140, col: '#ff4d5e', p0: 0.45 }); },
  // 9 — Sol que aprieta, sed, calambres
  9: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { cielo(ctx, '#ffb347', '#ffe8b0', 0, 1050); sol(ctx, a, 820, 330); const sy = 1050; arenaFondo(ctx, a, sy, { brillo: 0.4 });
      ctx.save(); ctx.globalAlpha = 0.25; ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; for (let i = 0; i < 6; i++) { ctx.beginPath(); for (let y2 = 600; y2 < 1000; y2 += 10) { const x = 120 + i * 170 + Math.sin(y2 / 30 + a.t * 6 + i) * 14; y2 === 600 ? ctx.moveTo(x, y2) : ctx.lineTo(x, y2); } ctx.stroke(); } ctx.restore();
      const y = hundido(K, ctx, a, YOU, W / 2 - 60, sy, 340, 1.7, { pose: 'sostiene', mood: 'triste', mira: 1, objeto: (c, mx, my) => { c.save(); c.translate(mx + 20, my - 40); c.rotate(-0.3 - Math.sin(a.t * 8) * 0.2); caja(c, -26, -90, 52, 130, 14, 'rgba(180,230,255,0.6)', 6); caja(c, -14, -110, 28, 24, 6, '#4d96ff', 5); c.restore(); } });
      for (let i = 0; i < 3; i++) { const k = ((a.t * 1.3 + i / 3) % 1); gotas(ctx, { t: 0 }, y.cabeza[0] - 60 + i * 50, y.cabeza[0] - 59 + i * 50, y.cabeza[1] - 20 + k * 120, y.cabeza[1] + 1 + k * 120, 1, '#bfe9ff'); }
      arenaFrente(ctx, a, sy); const cr = ph(a, 0.62, 0.72); if (cr > 0) { K.comicWord ? null : null; titular(ctx, a, 'CRAMP!', 830, 1200, { size: 110, col: '#ff4d5e', p0: 0.62, rot: 0.12 }); } }, { ...V, de: 1, a: 1.1, foco: [W / 2, 1000] });
    K.etiqueta(ctx, a, 'THIRSTY', 230, 560, { size: 54, rot: -0.08, p0: 0.3 }); K.contador(ctx, a, '2 HOURS', W / 2, 160, { icono: 'reloj', size: 46, p0: 0.05 }); },
  // 10 — El corazón late fuerte; detrás vuelve la marea
  10: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { cielo(ctx, '#ff9e7a', '#ffd9a0', 0, 1160); const sy = 1150; const subida = sm(ph(a, 0.3, 1));
      olas(ctx, a, lerp(820, 1060, subida), 1, '#3a8fd6'); arenaFondo(ctx, a, sy, { brillo: 0 });
      const y = hundido(K, ctx, a, YOU, W / 2, sy, 330, 1.75, { pose: 'miedo', mood: 'miedo', mira: -1 }); arenaFrente(ctx, a, sy);
      const lat = 1 + Math.max(0, Math.sin(a.t * 9)) * 0.18; ctx.save(); ctx.translate(y.cabeza[0] + 230, y.cabeza[1] + 150); ctx.scale(lat, lat); K.prop(ctx, 'corazon', 0, 0, 0.7, a.t); ctx.restore();
      K.simbolo(ctx, a, y.cabeza, y.hr, '!', 0.45); flecha(ctx, 880, 760, 640, 820 + subida * 60, '#ffffff', 22); }, { ...V, de: 1.12, a: 1, foco: [W / 2, 1000], temblor: 2 });
    K.luz(ctx, a, { ...V, tono: 'atardecer', foco: [W / 2, 700] }); titular(ctx, a, 'THE TIDE', W / 2, 260, { size: 130, col: '#5ec8ff', p0: 0.3 }); titular(ctx, a, 'IS COMING', W / 2, 400, { size: 100, p0: 0.45 }); },
  // 11 — Lo que mata no es la arena, es el agua: el agua sube hasta la barbilla
  11: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { cielo(ctx, '#5b6fa8', '#ffb38a', 0, 1160); const sy = 1150; arenaFondo(ctx, a, sy, { brillo: 0 });
      const y = hundido(K, ctx, a, YOU, W / 2, sy, 330, 1.75, { pose: 'miedo', mood: 'miedo' });
      const lvl = lerp(sy - 20, y.cabeza[1] + 30, sm(ph(a, 0.35, 0.85))); ctx.save(); ctx.globalAlpha = 0.85; olas(ctx, a, lvl, 0.7, '#2a7fc8'); ctx.restore();
      for (let i = 0; i < 5; i++) { const k = (a.t * 0.8 + i / 5) % 1; circ(ctx, y.cabeza[0] + 80 + i * 14, lvl - 20 - k * 200, 10, 'rgba(220,245,255,0.7)', 3); } }, { ...V, de: 1, a: 1.12, foco: [W / 2, 1000] });
    titular(ctx, a, 'NOT THE SAND', W / 2, 250, { size: 110, p0: 0.02 }); tacha(ctx, a, W / 2, 250, 260, 0.2); sello(ctx, a, 'THE WATER', W / 2, 470, { p0: 0.6, col: '#1d6fd6', size: 120 }); },
  // 12 — ¿Cómo escapar? No tires: cartel enorme y la mano que tira se para
  12: (ctx, a, K) => { const { YOU, FAN } = cast(K);
    K.camara(ctx, a, () => { const sy = fondo(ctx, a, 'marisma', { hora: 'dia', agua: 0.2 }, { cx: 500 }) - 60; arenaFondo(ctx, a, sy);
      const stop = fase(a) > 0.5; const tir = stop ? 0 : Math.sin(a.t * 12) * 8;
      D(K, ctx, a, FAN, 860, sy - 10, 1.3, { pose: stop ? 'senala' : 'miedo', mood: stop ? 'enfadado' : 'sorpresa', mira: -1, habla: stop });
      const y = hundido(K, ctx, a, YOU, 400, sy, 320 + tir, 1.6, { pose: stop ? 'encoge' : 'empuja', mood: stop ? 'duda' : 'enfadado', mira: -1 }); arenaFrente(ctx, a, sy);
      if (stop) K.globo(ctx, a, "DON'T PULL!", 760, sy - 640, { tx: 820, ty: sy - 420, grito: true, p0: 0.5 }); }, { ...V, de: 1, a: 1.1, foco: [600, 1200] });
    titular(ctx, a, 'HOW TO ESCAPE?', W / 2, 260, { size: 100, col: '#ffd93d', p0: 0.02 }); K.cartel(ctx, a, "DON'T PULL", W / 2, 470, { tipo: 'rojo', size: 70, p0: 0.55, rot: -0.04 }); },
  // 13 — Échate atrás y abre los brazos como en una piscina (arriba piscina, abajo arena)
  13: (ctx, a, K) => { const { YOU } = cast(K); const k = sm(ph(a, 0.15, 0.6)), hh = H / 2;
    const panel = (y0, fn) => { ctx.save(); ctx.beginPath(); ctx.rect(0, y0, W, hh); ctx.clip(); ctx.translate(0, y0); fn(); ctx.restore(); };
    panel(0, () => { cielo(ctx, '#9ee0ff', '#4dc3f0', 0, hh); for (let i = 0; i < 6; i++) ln(ctx, [[0, 120 + i * 140 + Math.sin(a.t * 2 + i) * 10], [W, 120 + i * 140 - Math.sin(a.t * 2 + i) * 10]], 'rgba(255,255,255,0.35)', 6);
      ctx.save(); ctx.translate(W / 2 + 140, 560 + Math.sin(a.t * 2) * 10); ctx.rotate(-Math.PI / 2 * 0.9); D(K, ctx, a, YOU, 0, 0, 1.2, { pose: 'brazos', mood: 'feliz', sombra: false }); ctx.restore(); K.etiqueta(ctx, a, 'POOL', 200, 120, { size: 50, p0: 0.02 }); });
    panel(hh, () => { cielo(ctx, '#ffd9a0', '#f6e4c0', 0, 420); const sy = 400; arenaFondo(ctx, a, sy, { brillo: 0 });
      ctx.save(); ctx.translate(W / 2, sy + 200); ctx.rotate(-k * 1.25); D(K, ctx, a, YOU, 0, 200, 1.2, { pose: 'brazos', mood: k > 0.8 ? 'feliz' : 'duda', sombra: false }); ctx.restore(); arenaFrente(ctx, a, sy, 0.45);
      K.etiqueta(ctx, a, 'QUICKSAND', 230, 120, { size: 50, p0: 0.1 }); flecha(ctx, W / 2 + 260, 220, W / 2 + 260 - 220 * k, 220 + 80 * k, '#ffd93d', 20); });
    ln(ctx, [[0, hh], [W, hh]], INK, 12); titular(ctx, a, 'LEAN BACK', W / 2, hh, { size: 120, col: '#ffd93d', p0: 0.35 }); },
  // 14 — Mueve las piernas en círculos lentos y pequeños (corte: piernas girando con flechas circulares)
  14: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { cielo(ctx, '#ffd9a0', '#f6e4c0', 0, 560); const sy = 560; arenaFondo(ctx, a, sy, { brillo: 0 });
      ctx.save(); ctx.translate(W / 2, sy + 120); ctx.rotate(-0.9); D(K, ctx, a, YOU, 0, 330, 1.5, { pose: 'brazos', mood: 'neutral', sombra: false }); ctx.restore(); arenaFrente(ctx, a, sy, 0.4);
      for (const [cx, cy, d] of [[380, 1150, 1], [700, 1250, -1]]) { const an = a.t * 2.2 * d; ctx.save(); ctx.translate(cx, cy); caja(ctx, -34 + Math.cos(an) * 30, -230 + Math.sin(an) * 20, 68, 300, 30, '#2b2d42', 7);
        ctx.strokeStyle = '#ffd93d'; ctx.lineWidth = 12; ctx.setLineDash([24, 18]); ctx.lineDashOffset = -a.t * 60 * d; ctx.beginPath(); ctx.arc(0, 60, 90, 0, Math.PI * 1.7); ctx.stroke(); ctx.restore(); }
      ctx.save(); ctx.globalAlpha = 0.7; for (let i = 0; i < 30; i++) { const an = a.t * 1.5 + i; circ(ctx, 540 + Math.cos(an) * (230 + i * 4), 1200 + Math.sin(an) * (120 + i * 3), 8, '#fff2c8', 0); } ctx.restore(); }, { ...V, de: 1.08, a: 1, foco: [W / 2, 1150] });
    titular(ctx, a, 'SLOW', 300, 300, { size: 130, p0: 0.05, rot: -0.06 }); titular(ctx, a, 'TINY CIRCLES', 640, 450, { size: 100, col: '#ffd93d', p0: 0.3, rot: 0.04 }); },
  // 15 — Entra el agua, se suelta la arena y ruedas hasta suelo firme
  15: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { const gy = fondo(ctx, a, 'parque', { hora: 'dia' }, { cx: 1500 }); const sy = gy - 40;
      ctx.fillStyle = WET; ctx.beginPath(); ctx.moveTo(0, sy); ctx.lineTo(620, sy); ctx.lineTo(700, H); ctx.lineTo(0, H); ctx.fill(); ln(ctx, [[0, sy], [620, sy]], INK, 7);
      gotas(ctx, a, 60, 560, sy + 20, H, 18, '#5ec8ff', 350 * (1 - ph(a, 0.4, 0.6)) + 30);
      const sal = sm(ph(a, 0.35, 0.95)); const x = lerp(300, 840, sal), rot = sal * Math.PI * 4;
      ctx.save(); ctx.translate(x, sy - 110 * sal - Math.sin(sal * Math.PI) * 60 + (1 - sal) * 150); ctx.rotate(rot); D(K, ctx, a, YOU, 0, 130, 1.0, { pose: 'brazos', mood: sal > 0.9 ? 'feliz' : 'sorpresa', sombra: false }); ctx.restore();
      if (sal < 0.3) { ctx.save(); ctx.fillStyle = WET; ctx.fillRect(0, sy + 4, 620, 400); ctx.restore(); }
      K.cartel(ctx, a, 'SOLID GROUND', 860, sy - 440, { tipo: 'verde', size: 46, p0: 0.5 }); if (sal > 0.95) K.prop(ctx, 'estrella', 900, sy - 520 + Math.sin(a.t * 4) * 10, 0.5, a.t); }, { ...V, de: 1.1, a: 1, foco: [W / 2, 1300] });
    K.luz(ctx, a, { ...V, tono: 'dia' }); titular(ctx, a, 'ROLL OUT', W / 2, 300, { size: 140, col: '#6bcb77', p0: 0.4 }); },
  // 16 — El pánico es la trampa de verdad: tú en espiral de pánico; el pánico te hunde
  16: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { cielo(ctx, '#3a1d4a', '#b33a5a', 0, 1160); ctx.save(); ctx.translate(W / 2, 620); ctx.rotate(a.t * 1.5); ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 22; ctx.beginPath(); for (let i = 0; i < 300; i++) { const an = i * 0.12, r = i * 2.2; ctx.lineTo(Math.cos(an) * r, Math.sin(an) * r); } ctx.stroke(); ctx.restore();
      const sy = 1150; arenaFondo(ctx, a, sy, { brillo: 0 }); const h = 300 + sm(ph(a, 0.2, 0.9)) * 260;
      const y = hundido(K, ctx, a, YOU, W / 2, sy, h + Math.sin(a.t * 14) * 10, 1.75, { pose: Math.sin(a.t * 8) > 0 ? 'miedo' : 'vitorea', mood: 'miedo' }); arenaFrente(ctx, a, sy); K.mareo(ctx, a, y.cabeza, y.hr); }, { ...V, de: 1, a: 1.15, foco: [W / 2, 1000], temblor: 3 });
    K.luz(ctx, a, { ...V, tono: 'tension', foco: [W / 2, 700] }); titular(ctx, a, 'PANIC', W / 2, 280, { size: 170, col: '#ff4d5e', p0: 0.05 }); titular(ctx, a, 'IS THE TRAP', W / 2, 440, { size: 100, p0: 0.3 }); },
  // 17 — La próxima vez que una peli se trague a alguien… (cine con público; tú sonríes y señalas)
  17: (ctx, a, K) => { const { YOU, VIEW, FAN } = cast(K);
    K.camara(ctx, a, () => { ctx.fillStyle = '#140d22'; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.beginPath(); ctx.roundRect(70, 180, W - 140, 640, 18); ctx.clip(); const sy = 640; cielo(ctx, '#e8b070', '#f6e4c0', 180, sy); ctx.fillStyle = WET; ctx.fillRect(70, sy, W, 300);
        const sink = sm(ph(a, 0, 0.7)) * 330; ctx.translate(0, 0); D(K, ctx, a, cast(K).ACT, W / 2, sy + 40 + sink, 0.8, { pose: 'miedo', mood: 'miedo', sombra: false }); ctx.fillStyle = WET; ctx.fillRect(70, sy + 40, W, 400); ctx.restore();
      ctx.save(); ctx.globalCompositeOperation = 'screen'; const g = ctx.createLinearGradient(W / 2, H, W / 2, 500); g.addColorStop(0, 'rgba(255,240,200,0.18)'); g.addColorStop(1, 'rgba(255,240,200,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(W / 2 - 60, H); ctx.lineTo(70, 820); ctx.lineTo(W - 70, 820); ctx.lineTo(W / 2 + 60, H); ctx.fill(); ctx.restore();
      K.publico(ctx, a, { x0: -40, x1: W + 40, y0: 1250, y1: H, filas: 3, tam: 90, reaccion: 'quieto', seed: 'cine27' });
      D(K, ctx, a, VIEW, 250, 1500, 1.1, { pose: 'miedo', mood: 'miedo', mira: 0, espalda: false });
      const y = D(K, ctx, a, YOU, 560, 1520, 1.2, { pose: fase(a) > 0.45 ? 'senala' : 'quieto', mood: fase(a) > 0.45 ? 'risa' : 'neutral', mira: 1 });
      D(K, ctx, a, FAN, 860, 1500, 1.1, { pose: 'encoge', mood: 'duda', mira: -1 });
      if (fase(a) > 0.45) K.globo(ctx, a, 'TOTAL MYTH', 560, 1000, { tx: y.cabeza[0], ty: y.cabeza[1] - y.hr, p0: 0.45 }); }, { ...V, de: 1, a: 1.08, foco: [W / 2, 1100] });
    K.luz(ctx, a, { ...V, tono: 'noche', foco: [W / 2, 500] }); K.etiqueta(ctx, a, 'NEXT TIME...', W / 2, 110, { size: 50, p0: 0.1 }); },
};
const ease = (k) => 1 - Math.pow(1 - clamp(k), 3) + Math.sin(clamp(k) * Math.PI) * 0.15;
export default Object.fromEntries(Object.entries(PLANOS).map(([k, f]) => [k, BASE(f)]));
