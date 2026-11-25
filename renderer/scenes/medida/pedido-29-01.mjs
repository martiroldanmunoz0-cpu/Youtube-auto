// pedido-29-01 — "The Tunguska Explosion: What Blew Up Over Siberia?" (Short vertical, estilo nuevo)
import { W, H, INK, V, clamp, sm, lerp, fase, ph, hs, fondo, D, cielo, ln, circ, caja, estrellas, titular, sello, tacha, peli, temblor, anillos, flecha, arbol } from '../../lib/corto.mjs';

let CAST = null;
function cast(K) {
  if (CAST) return CAST;
  const sin = { sombrero: null, corbata: null, barba: false, bigote: false };
  const [SEM, KUL, READ, CITY] = K.reparto('pedido-29', 4, [
    { ...sin, estilo: 'gordito', pelo: 'corto', peloCol: '#5a3a22', ropa: '#c0392b', barba: true },
    { ...sin, estilo: 'limpio', pelo: 'corto', peloCol: '#2a1a10', ropa: '#6b705c', sombrero: 'explorador', gafas: true },
    { ...sin, estilo: 'limpio', pelo: 'tupe', peloCol: '#1a120c', ropa: '#3d405b', bigote: true, sombrero: 'bombin' },
    { ...sin, estilo: 'limpio', pelo: 'coleta', peloCol: '#a33b20', ropa: '#4d96ff' },
  ]);
  return (CAST = { SEM, KUL, READ, CITY });
}
// Bosque de taiga: árboles en filas; tumbados según la distancia a la onda (radial desde cx)
function taiga(ctx, a, gy, { caidos = 0, cx = W / 2, pelados = false, quemado = 0, n = 14 } = {}) {
  for (let fila = 0; fila < 3; fila++) for (let i = 0; i < n; i++) { const x = -60 + i * (W + 120) / (n - 1) + (fila % 2) * 40, y = gy - 120 + fila * 70, s = 0.55 + fila * 0.18;
    const lado = x < cx ? -1 : 1, d = Math.abs(x - cx), cae = clamp(caidos * 1.6 - (1 - d / W) * 0.6); const centro = d < 140;
    arbol(ctx, x, y, s, { ang: centro ? 0 : lado * cae * 1.45, pelado: pelados || (centro && caidos > 0), quemado: quemado || (caidos > 0.5 ? 1 : 0) }); } }
function fogonazo(ctx, a, x, y, k) { if (k <= 0) return; ctx.save(); const r = 120 + k * 1200; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(255,255,240,${1 - k * 0.5})`); g.addColorStop(0.3, `rgba(255,210,90,${0.9 - k * 0.5})`); g.addColorStop(1, 'rgba(255,120,40,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); }
function bola(ctx, a, x, y, s = 1, estela = 1) { ctx.save(); ctx.translate(x, y); ctx.rotate(-0.6); const g = ctx.createLinearGradient(0, 0, 0, -700 * estela); g.addColorStop(0, 'rgba(255,220,120,0.95)'); g.addColorStop(1, 'rgba(255,120,40,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-50 * s, 0); ctx.lineTo(0, -700 * estela); ctx.lineTo(50 * s, 0); ctx.fill(); ctx.restore(); circ(ctx, x, y, 50 * s, '#fff3c4', 6); circ(ctx, x, y, 30 * s, '#ffffff', 0); }
function periodico(ctx, a, x, y, s, k, titulo) { ctx.save(); ctx.translate(x, y); ctx.rotate((1 - k) * 4 - 0.06); ctx.scale(s * k, s * k); caja(ctx, -260, -330, 520, 660, 8, '#f6eedc', 8); ctx.fillStyle = INK; ctx.font = '62px Anton'; ctx.textAlign = 'center'; ctx.fillText('THE DAILY', 0, -250); ln(ctx, [[-230, -220], [230, -220]], INK, 5); ctx.font = '54px Anton'; titulo.split('\n').forEach((t, i) => ctx.fillText(t, 0, -150 + i * 62)); for (let i = 0; i < 6; i++) ln(ctx, [[-220, 30 + i * 40], [i % 2 ? 120 : 220, 30 + i * 40]], '#9a8f7a', 8); ctx.restore(); }

const PLANOS = {
  // 0 — Nadie encontró lo que explotó sobre Siberia: bosque arrasado, investigador con lupa, "???"
  0: (ctx, a, K) => { const { KUL } = cast(K);
    K.camara(ctx, a, () => { const gy = fondo(ctx, a, 'nieve', { hora: 'atardecer' }, { cx: 900 }); taiga(ctx, a, gy, { caidos: 1, quemado: 1 });
      const y = D(K, ctx, a, KUL, lerp(200, 620, sm(ph(a, 0, 0.7))), gy + 60, 1.5, { pose: 'sostiene', mood: 'duda', objeto: (c, mx, my) => K.prop(c, 'lupa', mx + 20, my - 30, 0.5, a.t) });
      K.simbolo(ctx, a, y.cabeza, y.hr, '?', 0.5); }, { ...V, de: 1.1, a: 1, foco: [W / 2, 1300] });
    K.luz(ctx, a, { ...V, tono: 'atardecer' }); titular(ctx, a, 'NOBODY FOUND', W / 2, 240, { size: 110, p0: 0.02 }); titular(ctx, a, 'WHAT BLEW UP', W / 2, 380, { size: 110, col: '#ff8c42', p0: 0.2 }); sello(ctx, a, 'SIBERIA', W / 2, 560, { p0: 0.55, size: 90 }); },
  // 1 — ¿Qué explotó en 1908 sin cráter ni meteorito? bola de fuego cruzando el cielo
  1: (ctx, a, K) => { const k = sm(ph(a, 0, 0.8));
    K.camara(ctx, a, () => { const gy = fondo(ctx, a, 'nieve', { hora: 'dia' }, { cx: 1300 }); taiga(ctx, a, gy); bola(ctx, a, lerp(1100, 300, k), lerp(200, 900, k), 1.2, 1); }, { ...V, de: 1, a: 1.1, foco: [W / 2, 1000], temblor: 2 * k });
    K.contador(ctx, a, '1908', W / 2, 180, { size: 64, p0: 0.02 }); titular(ctx, a, 'NO CRATER', 300, 1550 - 900 + 0, { size: 90, p0: 0.4, rot: -0.06 }); titular(ctx, a, 'NO METEORITE', 740, 760, { size: 90, col: '#ffd93d', p0: 0.6, rot: 0.05 }); },
  // 2 — La potencia de mil Hiroshimas: rejilla de iconos de bomba que se llena hasta ×1000
  2: (ctx, a, K) => { const n = Math.floor(sm(ph(a, 0.05, 0.8)) * 100);
    K.camara(ctx, a, () => { cielo(ctx, '#ffe8c0', '#ff9f5a'); for (let i = 0; i < n; i++) { const c = i % 10, r = Math.floor(i / 10); ctx.save(); ctx.translate(140 + c * 89, 560 + r * 89); const s = i === n - 1 ? 1.3 : 1; ctx.scale(s, s); K.prop(ctx, 'bomba', 0, 0, 0.18, a.t); ctx.restore(); } }, { ...V, de: 1, a: 1.06, foco: [W / 2, 1000] });
    titular(ctx, a, '×' + (n * 10 || 1), W / 2, 330, { size: 170, col: '#ffd93d' }); K.etiqueta(ctx, a, '1 ICON = 10 HIROSHIMAS', W / 2, 1520 - 40, { size: 44, p0: 0.3 }); },
  // 3 — Junio 1908. Eres Semyon, sentado en tu porche
  3: (ctx, a, K) => { const { SEM } = cast(K);
    K.camara(ctx, a, () => { const gy = fondo(ctx, a, 'granja', { hora: 'dia' }, { cx: 800 });
      caja(ctx, 120, gy - 700, 860, 700, 10, '#a0673a', 8); for (let i = 0; i < 9; i++) ln(ctx, [[120, gy - 700 + i * 78], [980, gy - 700 + i * 78]], '#7a4a26', 5); ctx.fillStyle = '#6b3a1e'; ctx.beginPath(); ctx.moveTo(60, gy - 690); ctx.lineTo(W / 2, gy - 1000); ctx.lineTo(W - 60, gy - 690); ctx.fill(); ln(ctx, [[60, gy - 690], [W / 2, gy - 1000], [W - 60, gy - 690]], INK, 8);
      caja(ctx, 640, gy - 520, 220, 200, 10, '#ffe6a8', 7); caja(ctx, 60, gy - 40, W - 120, 50, 8, '#c98b55', 7);
      caja(ctx, W / 2 - 120, gy - 200, 240, 24, 8, '#8b5a2b', 6); ln(ctx, [[W / 2 - 100, gy - 180], [W / 2 - 100, gy - 40]], INK, 10); ln(ctx, [[W / 2 + 100, gy - 180], [W / 2 + 100, gy - 40]], INK, 10);
      const y = D(K, ctx, a, SEM, W / 2, gy - 40, 1.5, { pose: 'sentado', mood: 'feliz', mira: 1 }); if (fase(a) > 0.4) K.globo(ctx, a, 'NICE DAY...', W / 2 + 220, gy - 820, { tx: y.cabeza[0], ty: y.cabeza[1], p0: 0.4 }); }, { ...V, de: 1.1, a: 1, foco: [W / 2, 1300] });
    K.luz(ctx, a, { ...V, tono: 'dia' }); K.contador(ctx, a, 'JUNE 1908', W / 2, 180, { size: 60 }); titular(ctx, a, 'SEMYON', W / 2, 330, { size: 130, col: '#ffd93d', p0: 0.15 }); },
  // 4 — El cielo se parte en dos; la camisa te quema
  4: (ctx, a, K) => { const { SEM } = cast(K); const k = ph(a, 0.15, 0.5);
    K.camara(ctx, a, () => { cielo(ctx, '#7fc8ff', '#ffe0a0', 0, 1300); ctx.save(); ctx.globalAlpha = k; const g = ctx.createLinearGradient(0, 0, W, 600); g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, '#ffd93d'); g.addColorStop(1, '#ff7b2a'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(W, 100); ctx.lineTo(0, 500 + k * 100); ctx.lineTo(0, 700 + k * 200); ctx.lineTo(W, 260); ctx.fill(); ctx.restore();
      fogonazo(ctx, a, 200, 650, ph(a, 0.3, 1) * 0.5); const gy = 1550; ctx.fillStyle = '#c98b55'; ctx.fillRect(0, gy, W, H - gy);
      const y = D(K, ctx, a, SEM, W / 2, gy + 260, 2.2, { pose: fase(a) > 0.5 ? 'miedo' : 'sentado', mood: fase(a) > 0.5 ? 'miedo' : 'sorpresa', mira: -1 });
      if (fase(a) > 0.5) { K.smoke(ctx, a, y.cabeza[0], y.cabeza[1] + y.hr * 2.5, { n: 6 }); for (let i = 0; i < 6; i++) { const fx = y.cabeza[0] - 120 + i * 50, fy = y.cabeza[1] + y.hr * 2 - ((a.t * 120 + i * 40) % 160); ctx.save(); ctx.globalAlpha = 0.85; K.prop(ctx, 'fuego', fx, fy, 0.22, a.t + i); ctx.restore(); } } }, { ...V, de: 1, a: 1.12, foco: [W / 2, 1100], temblor: 3 * k });
    titular(ctx, a, 'THE SKY SPLITS', W / 2, 240, { size: 110, col: '#ffffff', p0: 0.15 }); titular(ctx, a, 'HOT!', 840, 1150, { size: 140, col: '#ff4d5e', p0: 0.5, rot: 0.12 }); },
  // 5 — La onda expansiva te tira de la silla
  5: (ctx, a, K) => { const { SEM } = cast(K); const k = sm(ph(a, 0.25, 0.7));
    temblor(ctx, a, ph(a, 0.2, 0.3) > 0 ? 12 * (1 - fase(a)) : 0, () => K.camara(ctx, a, () => { const gy = fondo(ctx, a, 'granja', { hora: 'atardecer' }, { cx: 800 }); caja(ctx, 60, gy - 40, W - 120, 50, 8, '#c98b55', 7);
      anillos(ctx, a, -200, 700, { n: 3, r1: 1600, col: 'rgba(255,230,180,0.8)', lw: 30, vel: 0.9 });
      ctx.save(); ctx.translate(W / 2 + k * 300, gy - 40 - Math.sin(k * Math.PI) * 200); ctx.rotate(k * 2.2); caja(ctx, -120, -160, 240, 24, 8, '#8b5a2b', 6); ln(ctx, [[-100, -140], [-100, 0]], INK, 10); ln(ctx, [[100, -140], [100, 0]], INK, 10); ctx.restore();
      ctx.save(); ctx.translate(W / 2 + k * 240, gy - 40 - Math.sin(k * Math.PI) * 360); ctx.rotate(k * 1.3); D(K, ctx, a, SEM, 0, 0, 1.5, { pose: 'miedo', mood: 'miedo', sombra: false }); ctx.restore();
      if (ph(a, 0.25, 0.75) > 0) K.speedLines(ctx, a, W / 2, 1100, { n: 14 }); }, { ...V, de: 1.05, a: 1, foco: [W / 2, 1200] }));
    titular(ctx, a, 'SHOCKWAVE', W / 2, 280, { size: 150, col: '#ffd93d', p0: 0.2, rot: -0.04 }); },
  // 6 — 80 millones de árboles tumbados como cerillas
  6: (ctx, a, K) => { const k = sm(ph(a, 0.1, 0.7));
    K.camara(ctx, a, () => { cielo(ctx, '#ffb070', '#ffe0b0', 0, 1100); ctx.fillStyle = '#7a8450'; ctx.fillRect(0, 1000, W, H - 1000);
      for (let r = 0; r < 6; r++) { const gy = 1080 + r * 150; taiga(ctx, a, gy, { caidos: k, cx: W / 2 + 40, n: 9 + r }); }
      anillos(ctx, a, W / 2, 900, { n: 2, r1: 1100, col: 'rgba(255,255,255,0.5)', lw: 20, vel: 0.9 }); }, { ...V, de: 1.15, a: 1, foco: [W / 2, 1300] });
    K.contador(ctx, a, (Math.round(k * 80)) + ' MILLION', W / 2, 200, { size: 70, icono: 'arbol' }); titular(ctx, a, 'LIKE MATCHSTICKS', W / 2, 380, { size: 100, col: '#ffd93d', p0: 0.5 }); },
  // 7 — Esa noche, en Londres se lee el periódico a medianoche (el cielo brilla)
  7: (ctx, a, K) => { const { READ } = cast(K);
    K.camara(ctx, a, () => { const gy = fondo(ctx, a, 'calle', { hora: 'noche' }, { cx: 1000 }); ctx.save(); ctx.globalCompositeOperation = 'screen'; const g = ctx.createLinearGradient(0, 0, 0, 1100); g.addColorStop(0, 'rgba(255,190,120,0.55)'); g.addColorStop(1, 'rgba(255,190,120,0.1)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 1100); ctx.restore();
      ctx.save(); ctx.translate(820, 360); K.prop(ctx, 'reloj_arena', 0, 0, 0.8, a.t); ctx.restore(); K.etiqueta(ctx, a, '12:00 AM', 820, 520, { size: 46, p0: 0.15 });
      D(K, ctx, a, READ, W / 2 - 60, gy, 1.7, { pose: 'sostiene', mood: fase(a) > 0.5 ? 'sorpresa' : 'neutral', mira: 1, objeto: (c, mx, my) => { c.save(); c.translate(mx + 10, my - 60); caja(c, -110, -70, 220, 150, 6, '#f6eedc', 6); for (let i = 0; i < 4; i++) ln(c, [[-90, -40 + i * 30], [90, -40 + i * 30]], '#9a8f7a', 6); c.restore(); } }); }, { ...V, de: 1.05, a: 1.15, foco: [W / 2, 1300] });
    K.luz(ctx, a, { ...V, tono: 'atardecer', foco: [W / 2, 400] }); titular(ctx, a, 'LONDON', W / 2, 240, { size: 140, p0: 0.02 }); K.etiqueta(ctx, a, 'BRIGHT AS DAY AT MIDNIGHT', W / 2, 390, { size: 46, p0: 0.3 }); },
  // 8 — Nadie va en 19 años: calendario que pasa, nieve y hierba sobre el bosque caído
  8: (ctx, a, K) => { const yr = 1908 + Math.floor(sm(ph(a, 0.05, 0.85)) * 19); const inv = Math.floor(a.t * 1.2) % 2;
    K.camara(ctx, a, () => { const gy = fondo(ctx, a, inv ? 'nieve' : 'bosque', { hora: 'dia' }, { cx: 960 }); taiga(ctx, a, gy, { caidos: 1, quemado: 1 });
      caja(ctx, W / 2 - 200, 560, 400, 360, 26, '#ffffff', 8); caja(ctx, W / 2 - 200, 560, 400, 90, [26, 26, 0, 0], '#e63946', 8); ctx.fillStyle = INK; ctx.font = '150px Anton'; ctx.textAlign = 'center'; ctx.fillText(String(yr), W / 2, 860); }, { ...V, de: 1, a: 1.06, foco: [W / 2, 1100] });
    titular(ctx, a, 'NOBODY CAME', W / 2, 260, { size: 120, p0: 0.02 }); K.etiqueta(ctx, a, '19 YEARS', W / 2, 420, { size: 70, col: '#ffd93d', p0: 0.3 }); },
  // 9 — Entonces Leonid Kulik sale a cazar el meteorito (explorador genérico caminando con mapa)
  9: (ctx, a, K) => { const { KUL } = cast(K);
    K.camara(ctx, a, () => { const gy = fondo(ctx, a, 'bosque', { hora: 'dia' }, { cx: 600 + a.t * 60 }); const { x, pose, mira } = K.anda(a, 120, 700, 0, 0.9);
      const y = D(K, ctx, a, KUL, x, gy, 1.6, { pose: 'sostiene', mood: 'feliz', mira: 1, objeto: (c, mx, my) => { c.save(); c.translate(mx + 20, my - 50); caja(c, -90, -60, 180, 120, 6, '#f2d49b', 6); ln(c, [[-60, 20], [-10, -20], [40, 10], [70, -30]], '#e63946', 5); c.restore(); } });
      if (fase(a) > 0.5) K.globo(ctx, a, "IT'S OUT THERE!", 620, gy - 700, { tx: y.cabeza[0], ty: y.cabeza[1], p0: 0.5 }); }, { ...V, de: 1, a: 1.1, foco: [W / 2, 1300] });
    K.contador(ctx, a, '1927', W / 2, 160, { size: 56, p0: 0.02 }); titular(ctx, a, 'LEONID KULIK', W / 2, 300, { size: 110, col: '#ffd93d', p0: 0.1 }); K.etiqueta(ctx, a, 'METEORITE HUNTER', W / 2, 440, { size: 50, p0: 0.3 }); },
  // 10 — Pista 1: no hay cráter (Kulik mira un suelo llano)
  10: (ctx, a, K) => { const { KUL } = cast(K);
    K.camara(ctx, a, () => { const gy = fondo(ctx, a, 'marisma', { hora: 'dia', agua: 0.4 }, { cx: 960 }); const y = D(K, ctx, a, KUL, 300, gy, 1.5, { pose: fase(a) > 0.45 ? 'encoge' : 'senala', mood: fase(a) > 0.45 ? 'duda' : 'feliz', mira: 1 });
      ctx.save(); ctx.globalAlpha = 1 - ph(a, 0.3, 0.5); ctx.setLineDash([24, 18]); ctx.strokeStyle = '#ffd93d'; ctx.lineWidth = 10; ctx.beginPath(); ctx.ellipse(750, gy - 30, 260, 70, 0, 0, 7); ctx.stroke(); ctx.restore(); tacha(ctx, a, 750, gy - 120, 150, 0.45); K.simbolo(ctx, a, y.cabeza, y.hr, '?', 0.5); }, { ...V, de: 1.08, a: 1, foco: [W / 2, 1300] });
    K.cartel(ctx, a, 'CLUE 1', W / 2, 220, { tipo: 'amarillo', size: 60, p0: 0.02 }); titular(ctx, a, 'NO CRATER', W / 2, 400, { size: 140, col: '#ff4d5e', p0: 0.3 }); },
  // 11 — Pista 2: ninguna roca espacial (cava, cava… nada)
  11: (ctx, a, K) => { const { KUL } = cast(K);
    K.camara(ctx, a, () => { const gy = fondo(ctx, a, 'marisma', { hora: 'dia', agua: 0.2 }, { cx: 1300 }); ctx.fillStyle = '#5a3f22'; ctx.beginPath(); ctx.ellipse(620, gy + 10, 200, 50, 0, 0, 7); ctx.fill();
      const cav = Math.sin(a.t * 8); const y = D(K, ctx, a, KUL, 380, gy, 1.5, { pose: 'sostiene', mood: 'enfadado', mira: 1, objeto: (c, mx, my) => { c.save(); c.translate(mx, my); c.rotate(0.7 + cav * 0.3); ln(c, [[0, -60], [0, 180]], '#7a4f2e', 12); caja(c, -34, 170, 68, 70, 12, '#adb5bd', 5); c.restore(); } });
      for (let i = 0; i < 6; i++) { const k = (a.t * 1.4 + i / 6) % 1; circ(ctx, 620 + (i - 3) * 30 + k * 120, gy - Math.sin(k * Math.PI) * 220, 12, '#7a5a3a', 3); }
      ctx.save(); ctx.translate(800, 700); K.prop(ctx, 'meteorito', 0, 0, 0.7, a.t); ctx.restore(); tacha(ctx, a, 800, 700, 140, 0.4); }, { ...V, de: 1, a: 1.1, foco: [W / 2, 1300] });
    K.cartel(ctx, a, 'CLUE 2', W / 2, 220, { tipo: 'amarillo', size: 60, p0: 0.02 }); titular(ctx, a, 'NO SPACE ROCK', W / 2, 400, { size: 120, col: '#ff4d5e', p0: 0.35 }); },
  // 12 — Pista 3: los árboles del centro siguen de pie, pelados
  12: (ctx, a, K) => { const { KUL } = cast(K);
    K.camara(ctx, a, () => { const gy = fondo(ctx, a, 'nieve', { hora: 'dia' }, { cx: 960 }); taiga(ctx, a, gy, { caidos: 1, cx: W / 2, quemado: 1 });
      for (let i = -1; i <= 1; i++) arbol(ctx, W / 2 + i * 90, gy + 40, 1.1, { pelado: true, quemado: 1 });
      const pulso = 0.5 + 0.5 * Math.sin(a.t * 5); ctx.save(); ctx.globalAlpha = ph(a, 0.3, 0.5); ctx.strokeStyle = `rgba(255,217,61,${0.6 + pulso * 0.4})`; ctx.lineWidth = 12; ctx.beginPath(); ctx.ellipse(W / 2, gy - 160, 230, 260, 0, 0, 7); ctx.stroke(); ctx.restore();
      D(K, ctx, a, KUL, 880, gy + 80, 1.2, { pose: 'senala', mood: 'sorpresa', mira: -1 }); }, { ...V, de: 1.12, a: 1, foco: [W / 2, 1300] });
    K.cartel(ctx, a, 'CLUE 3', W / 2, 220, { tipo: 'amarillo', size: 60, p0: 0.02 }); titular(ctx, a, 'STILL STANDING', W / 2, 400, { size: 110, col: '#ffd93d', p0: 0.3 }); K.etiqueta(ctx, a, 'STRIPPED BARE', W / 2, 540, { size: 50, p0: 0.5 }); },
  // 13 — Solo una explosión justo encima hace eso: diagrama con flechas hacia abajo
  13: (ctx, a, K) => { const k = sm(ph(a, 0.1, 0.7));
    K.camara(ctx, a, () => { cielo(ctx, '#2a3d66', '#9fc6e8', 0, 1400); ctx.fillStyle = '#7a8450'; ctx.fillRect(0, 1400, W, H - 1400); ln(ctx, [[0, 1400], [W, 1400]], INK, 8);
      const bx = W / 2, by = 520; fogonazo(ctx, a, bx, by, 0.25 + 0.1 * Math.sin(a.t * 8)); circ(ctx, bx, by, 70, '#fff3c4', 8);
      for (let i = -3; i <= 3; i++) { const an = Math.PI / 2 + i * 0.28, L = 900 * k; flecha(ctx, bx + Math.cos(an) * 90, by + Math.sin(an) * 90, bx + Math.cos(an) * L, by + Math.sin(an) * L, i === 0 ? '#ffd93d' : '#ff8c42', 18); }
      for (let i = 0; i < 9; i++) { const x = 80 + i * 115, d = Math.abs(x - bx); arbol(ctx, x, 1420, 0.6, { ang: d < 120 ? 0 : Math.sign(x - bx) * k * 1.4, pelado: d < 120 }); } }, { ...V, de: 1, a: 1.06, foco: [W / 2, 1000] });
    titular(ctx, a, 'FROM STRAIGHT', W / 2, 200, { size: 100, p0: 0.05 }); titular(ctx, a, 'ABOVE', W / 2, 330, { size: 150, col: '#ffd93d', p0: 0.2 }); },
  // 14 — Una roca del tamaño de un edificio explotó a kilómetros de altura; nada tocó el suelo
  14: (ctx, a, K) => { const k = sm(ph(a, 0, 0.55)), boom = ph(a, 0.55, 1);
    K.camara(ctx, a, () => { cielo(ctx, '#0f1d3a', '#7fb2e0', 0, 1500); estrellas(ctx, a, 60, 700); ctx.fillStyle = '#7a8450'; ctx.fillRect(0, 1500, W, H - 1500); taiga(ctx, a, 1560, { n: 10 });
      if (boom <= 0) { ctx.save(); ctx.translate(lerp(900, 560, k), lerp(150, 620, k)); K.prop(ctx, 'meteorito', 0, 0, 1.1, a.t); ctx.restore(); ctx.save(); ctx.globalAlpha = 0.5; K.prop(ctx, 'edificio', 200, 900, 0.5, a.t); ctx.restore(); K.etiqueta(ctx, a, '= A BUILDING', 220, 640, { size: 44, p0: 0.15 }); }
      else { fogonazo(ctx, a, 560, 620, boom); K.starBurst(ctx, a, 560, 620, { r: 200 + boom * 300 }); }
      ln(ctx, [[960, 640], [960, 1490]], '#ffffff', 5); K.etiqueta(ctx, a, 'MILES UP', 900, 1050, { size: 48, rot: -0.1, p0: 0.25 }); }, { ...V, de: 1, a: 1.08, foco: [W / 2, 1000], temblor: boom * 4 });
    sello(ctx, a, 'NOTHING HIT THE GROUND', W / 2, 1720 - 500, { p0: 0.75, size: 64, col: '#1d6fd6' }); },
  // 15 — En 2013 otra explosión sobre Chelyabinsk hirió a 1.500 personas
  15: (ctx, a, K) => { const { CITY } = cast(K); const k = sm(ph(a, 0, 0.45)), boom = ph(a, 0.45, 0.6);
    K.camara(ctx, a, () => { const gy = fondo(ctx, a, 'bloques', { hora: 'dia' }, { cx: 960 }); if (boom <= 0) bola(ctx, a, lerp(1000, 400, k), lerp(150, 500, k), 0.9, 0.7); else fogonazo(ctx, a, 400, 500, ph(a, 0.45, 1) * 0.7);
      if (boom > 0) { for (let i = 0; i < 12; i++) { const tx = 120 + hs(i) * 840, ty = 700 + hs(i + 3) * 500 + ph(a, 0.5, 1) * 300; ctx.save(); ctx.translate(tx, ty); ctx.rotate(a.t * 4 + i); ctx.fillStyle = 'rgba(200,240,255,0.85)'; ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(16, 10); ctx.lineTo(-12, 16); ctx.fill(); ctx.restore(); } }
      D(K, ctx, a, CITY, W / 2, gy, 1.5, { pose: boom > 0 ? 'miedo' : 'senala', mood: boom > 0 ? 'miedo' : 'sorpresa', mira: -1 }); }, { ...V, de: 1, a: 1.08, foco: [W / 2, 1200], temblor: boom * 6 });
    K.contador(ctx, a, '2013', W / 2, 170, { size: 60 }); titular(ctx, a, 'CHELYABINSK', W / 2, 320, { size: 120, col: '#ffd93d', p0: 0.1 }); K.contador(ctx, a, Math.round(ph(a, 0.5, 0.95) * 1500) + ' INJURED', W / 2, 470, { size: 60, p0: 0.5 }); },
  // 16 — Otro momento y cae en una gran ciudad: reloj que adelanta y la diana cambia del bosque a la ciudad
  16: (ctx, a, K) => { const k = sm(ph(a, 0.2, 0.7));
    K.paneles ? null : null;
    K.camara(ctx, a, () => { cielo(ctx, '#ffd0a0', '#ffeedd', 0, 1500); const gy = 1500; ctx.fillStyle = '#7a8450'; ctx.fillRect(0, gy, W, H - gy);
      taiga(ctx, a, gy + 60, { n: 6 }); for (let i = 0; i < 5; i++) K.prop(ctx, 'edificio', 640 + i * 100, gy - 10, 0.45 + hs(i) * 0.2, a.t);
      const tx = lerp(230, 820, k); ctx.save(); ctx.strokeStyle = '#ff3b4e'; ctx.lineWidth = 12; for (const r of [120, 70]) { ctx.beginPath(); ctx.arc(tx, gy - 220, r, 0, 7); ctx.stroke(); } ln(ctx, [[tx - 160, gy - 220], [tx + 160, gy - 220]], '#ff3b4e', 8); ln(ctx, [[tx, gy - 380], [tx, gy - 60]], '#ff3b4e', 8); ctx.restore();
      ctx.save(); ctx.translate(W / 2, 700); K.prop(ctx, 'reloj_arena', 0, 0, 1.0, a.t * 6); ctx.restore(); }, { ...V, de: 1, a: 1.08, foco: [W / 2, 1100] });
    titular(ctx, a, 'DIFFERENT TIMING', W / 2, 250, { size: 100, p0: 0.02 }); sello(ctx, a, 'A MAJOR CITY', W / 2, 420, { p0: 0.65, size: 90 }); },
  // 17 — Y por eso, tras la mayor explosión registrada… (vuelve a Semyon en su porche, cielo que se parte)
  17: (ctx, a, K) => { const { SEM } = cast(K); const k = ph(a, 0.4, 0.9);
    K.camara(ctx, a, () => { const gy = fondo(ctx, a, 'granja', { hora: 'dia' }, { cx: 800 }); caja(ctx, 60, gy - 40, W - 120, 50, 8, '#c98b55', 7);
      if (k > 0) bola(ctx, a, lerp(1100, 500, k), lerp(150, 520, k), 1, 0.8);
      D(K, ctx, a, SEM, W / 2, gy - 40, 1.6, { pose: k > 0.3 ? 'senala' : 'sentado', mood: k > 0.3 ? 'sorpresa' : 'feliz', mira: 1 }); }, { ...V, de: 1.1, a: 1, foco: [W / 2, 1200] });
    K.luz(ctx, a, { ...V, tono: 'dia' }); titular(ctx, a, 'BIGGEST BLAST', W / 2, 250, { size: 110, col: '#ffd93d', p0: 0.05 }); K.etiqueta(ctx, a, 'IN RECORDED HISTORY', W / 2, 390, { size: 50, p0: 0.2 }); },
};
const BASE = (fn) => (ctx, a, K) => { cielo(ctx, '#9fd4ff', '#6a7a40'); fn(ctx, a, K); };
export default Object.fromEntries(Object.entries(PLANOS).map(([k, f]) => [k, BASE(f)]));
