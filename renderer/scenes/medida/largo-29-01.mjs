// largo-29-01 — "Last Person on Earth: 5 Movie Myths That Would Get You Killed"
// 73 planos horizontales (export «ancho»), uno distinto por plano. Estilo gente.mjs + escenario.mjs + decorados SET.
import { SET, glow } from '../../lib/sets.mjs';
import '../../lib/sets_mundo.mjs';

const W = 1920, H = 1080, INK = '#1b1530';
let CAST = null;
function cast(K) {
  if (CAST) return CAST;
  const sin = { sombrero: null, corbata: null, barba: false, bigote: false };
  const [YOU, AST1, AST2, AST3, ENG, ACT] = K.reparto('largo-29', 6, [
    { ...sin, estilo: 'limpio', pelo: 'pinchos', peloCol: '#3a2414', ropa: '#4d96ff' },
    { ...sin, estilo: 'gordito', pelo: 'calvo', ropa: '#f4f4f8' },
    { ...sin, estilo: 'limpio', pelo: 'coleta', peloCol: '#1a120c', ropa: '#f4f4f8' },
    { ...sin, estilo: 'gordito', pelo: 'coronilla', peloCol: '#2a2a2a', ropa: '#f4f4f8', bigote: true },
    { ...sin, estilo: 'gordito', pelo: 'calvo', sombrero: 'casco', ropa: '#ff9f1c' },
    { ...sin, estilo: 'limpio', pelo: 'melena', peloCol: '#d9a441', gafas: true, ropa: '#2b2d42' },
  ]);
  CAST = { YOU, AST1, AST2, AST3, ENG, ACT };
  return CAST;
}
const fase = (a) => Math.min(1, Math.max(0, a.t / (a.d || 4)));
const D = (K, ctx, a, p, x, gy, esc, o = {}) => K.dibuja(ctx, p, x, gy, esc, { t: a.t, ...o });
const sky = (ctx, c1, c2, y1 = H) => { const g = ctx.createLinearGradient(0, 0, 0, y1); g.addColorStop(0, c1); g.addColorStop(1, c2); ctx.fillStyle = g; ctx.fillRect(0, 0, W, y1); };
const suelo = (ctx, y, c1, c2) => { const g = ctx.createLinearGradient(0, y, 0, H); g.addColorStop(0, c1); g.addColorStop(1, c2); ctx.fillStyle = g; ctx.fillRect(0, y, W, H - y); ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); };
const lerpN = (a, b, k) => a + (b - a) * k;
const sm = (k) => k * k * (3 - 2 * k);
const ph = (a, f0, f1) => Math.min(1, Math.max(0, (fase(a) - f0) / (f1 - f0)));
const ln = (ctx, pts, col = INK, w = 6) => { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.restore(); };
const hs = (i) => { const x = Math.sin(i * 127.1) * 43758.5453; return x - Math.floor(x); };

// --- Recursos comunes ---
function estrellas(ctx, a, n = 140, y1 = 700, seed = 1) { ctx.save(); for (let i = 0; i < n; i++) { const x = hs(i + seed) * W, y = hs(i * 3.7 + seed) * y1, tw = 0.5 + 0.5 * Math.sin(a.t * 2 + i); ctx.globalAlpha = 0.4 + 0.6 * tw; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 1.5 + hs(i * 9.1) * 2.5, 0, 7); ctx.fill(); } ctx.restore(); }
function nocheCielo(ctx, a, y1 = 760, seed = 1) { sky(ctx, '#070a24', '#1d1a4a', y1); estrellas(ctx, a, 160, y1 - 60, seed); }
// Fotograma de película: borde con perforaciones y tono sepia (la versión «Hollywood»)
function peli(K, ctx, a, dibujar, txt = 'THE MOVIE VERSION') {
  ctx.save(); dibujar(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgba(255,214,150,0.35)'; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#120d1c'; ctx.fillRect(0, 0, W, 90); ctx.fillRect(0, H - 90, W, 90);
  const off = (a.t * 160) % 120; for (let x = -120 + off; x < W + 120; x += 120) { K.R(ctx, x, 24, 60, 42, 8, '#f6eedc', 0); K.R(ctx, x, H - 66, 60, 42, 8, '#f6eedc', 0); }
  ctx.restore(); K.etiqueta(ctx, a, txt, 1560, 160, { size: 40, rot: -0.04, col: '#ffd93d' });
}
function sello(K, ctx, a, txt, x, y, { p0 = 0.3, col = '#ff3b4e', size = 90, rot = -0.18 } = {}) { const k = K.clamp((fase(a) - p0) / 0.06); if (k <= 0) return; const s = 1 + (1 - k) * 1.5; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.globalAlpha = k; ctx.font = `900 ${size}px Anton`; const w = ctx.measureText(txt).width + 60; ctx.strokeStyle = col; ctx.lineWidth = 12; ctx.strokeRect(-w / 2, -size * 0.75, w, size * 1.5); ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, 6); ctx.restore(); }
function mito(K, ctx, a, n, txt) { const k = K.clamp(fase(a) / 0.15); ctx.save(); ctx.globalAlpha = k; ctx.translate(lerpN(-300, 0, sm(k)), 0); K.R(ctx, 60, 120, 230, 92, 20, '#ff3b4e', 7); ctx.fillStyle = '#fff'; ctx.font = '900 56px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(`MYTH #${n}`, 175, 168); ctx.restore(); if (txt) K.rotulo(ctx, a, txt, W / 2, 990, { size: 44, p0: 0.1 }); }
function realidad(K, ctx, a, x = 1600, y = 170) { sello(K, ctx, a, 'REALITY', x, y, { p0: 0.08, col: '#20c060', size: 80, rot: 0.08 }); }
function movil(K, ctx, x, y, s, { txt = 'NO SIGNAL', col = '#ff4d5e', bat = 1, rot = 0, t = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); K.R(ctx, -90, -170, 180, 340, 26, '#22202c', 7); K.R(ctx, -76, -150, 152, 290, 14, bat > 0 ? '#e9f1ff' : '#0b0b12', 4);
  if (bat > 0) { ctx.fillStyle = col; ctx.font = '900 26px Poppins'; ctx.textAlign = 'center'; ctx.fillText(txt, 0, 10); for (let i = 0; i < 4; i++) K.R(ctx, -60 + i * 16, -120 - i * 8, 10, 12 + i * 8, 2, i < 0 ? INK : '#c9ccd6', 0); ln(ctx, [[-66, -136], [0, -96]], '#ff4d5e', 5); K.R(ctx, 30, -126, 36, 16, 3, 'rgba(0,0,0,0)', 3); K.R(ctx, 32, -124, 32 * bat, 12, 2, bat < 0.25 ? '#ff4d5e' : '#20c060', 0); }
  ctx.restore();
}
function torre(K, ctx, x, gy, s = 1, col = '#5a5f73') { ctx.save(); ctx.translate(x, gy); ctx.scale(s, s); ln(ctx, [[-90, 0], [-20, -520], [20, -520], [90, 0]], col, 9); for (let i = 1; i < 6; i++) { const y = -i * 90, w = 90 - i * 13; ln(ctx, [[-w, y + 90], [w - 13, y]], col, 5); ln(ctx, [[w, y + 90], [-w + 13, y]], col, 5); } ln(ctx, [[-170, -420], [170, -420]], col, 9); ln(ctx, [[-130, -480], [130, -480]], col, 8); ctx.restore(); }
function cables(ctx, x0, x1, y, sag, col = '#2a2233', lw = 5) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(x0, y + i * 40); ctx.quadraticCurveTo((x0 + x1) / 2, y + i * 40 + sag, x1, y + i * 40); ctx.stroke(); } ctx.restore(); }
function edificio(K, ctx, x, gy, w, h, col, luz, seed = 1) { K.R(ctx, x, gy - h, w, h, 6, col, 7); for (let r = 0; r < Math.floor((h - 60) / 70); r++) for (let c = 0; c < Math.floor((w - 30) / 60); c++) { const on = hs(seed * 31 + r * 7 + c) < luz; K.R(ctx, x + 22 + c * 60, gy - h + 34 + r * 70, 34, 40, 4, on ? '#ffd76a' : '#2a2c44', 3); } }
function skyline(K, ctx, a, gy, luz = 1, seed = 3) { for (let i = 0; i < 11; i++) { const w = 150 + hs(i + seed) * 110, h = 260 + hs(i * 5 + seed) * 420; edificio(K, ctx, i * 180 - 40, gy, w, h, ['#3b3f5c', '#46365e', '#2f4a66'][i % 3], typeof luz === 'function' ? luz(i) : luz, i + seed); } }
function cocheDep(K, ctx, x, gy, s = 1, col = '#e63946', rueda = 0, polvo = 0) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s);
  K.P(ctx, [[-360, -30], [-350, -95], [-150, -120], [-60, -190], [120, -190], [260, -110], [370, -90], [380, -30]], col, 9);
  K.P(ctx, [[-40, -172], [100, -172], [200, -114], [-120, -114]], '#bfe6ff', 6); K.R(ctx, 340, -92, 36, 18, 6, '#fff7b0', 5); K.R(ctx, -366, -84, 26, 18, 5, '#ff4d4d', 5);
  ln(ctx, [[-330, -70], [300, -70]], 'rgba(0,0,0,0.25)', 6);
  for (const wx of [-220, 230]) { ctx.save(); ctx.translate(wx, -36); ctx.rotate(rueda); K.C(ctx, 0, 0, 58, '#222', 8); K.C(ctx, 0, 0, 28, '#c9ccd6', 6); ln(ctx, [[-26, 0], [26, 0]], '#8a8d99', 6); ctx.restore(); }
  if (polvo) { ctx.globalAlpha = 0.35 * polvo; ctx.fillStyle = '#c2a27a'; ctx.fillRect(-370, -200, 760, 200); }
  ctx.restore();
}
function bici(K, ctx, x, gy, s = 1, rueda = 0, col = '#20a4f3') { ctx.save(); ctx.translate(x, gy); ctx.scale(s, s); for (const wx of [-110, 110]) { ctx.save(); ctx.translate(wx, -70); ctx.rotate(rueda); K.C(ctx, 0, 0, 70, 'rgba(0,0,0,0)', 9); for (let i = 0; i < 4; i++) ln(ctx, [[0, 0], [Math.cos(i * 0.8) * 66, Math.sin(i * 0.8) * 66]], '#8a8d99', 4); ctx.restore(); } K.L(ctx, [[-110, -70], [-20, -70], [60, -170], [-60, -170], [-20, -70]], col, 10); K.L(ctx, [[60, -170], [110, -70]], col, 10); K.L(ctx, [[60, -170], [50, -200], [90, -205]], INK, 8); K.R(ctx, -90, -190, 70, 18, 8, INK, 0); ctx.restore(); }

export const ancho = {};
const A = ancho;

// ===================== CAPÍTULO 1 · THE HOLLYWOOD DREAM =====================
Object.assign(A, {
  // 0 — ¿Y si fueras la última persona viva? Tú solo en una plaza vacía; la Tierra gira encima
  0: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { SET.plaza(ctx, a.t, { luces: 0.3 });
      const y = D(K, ctx, a, YOU, W / 2, 1000, 1.0, { pose: 'miedo', mood: 'sorpresa', mira: Math.sin(a.t * 1.5) > 0 ? 1 : -1 }); K.simbolo(ctx, a, y.cabeza, y.hr, '?', 0.25);
      K.prop(ctx, 'tierra', W / 2, 330 + Math.sin(a.t) * 10, 0.8, a.t); }, { de: 1.25, a: 1, foco: [W / 2, 700] });
    K.luz(ctx, a, { tono: 'dia', foco: [W / 2, 700] }); K.etiqueta(ctx, a, 'LAST PERSON ALIVE', W / 2, 980, { size: 52, rot: -0.03, p0: 0.3 }); },
  // 1 — La fantasía de Hollywood: ciudades vacías, coches gratis, nadie manda (película)
  1: (ctx, a, K) => { const { YOU } = cast(K);
    peli(K, ctx, a, () => K.camara(ctx, a, () => { SET.avenida(ctx, a.t, { hora: 'atardecer' });
      cocheDep(K, ctx, 1300, 1000, 0.9, '#e63946', a.t * 3);
      const y = D(K, ctx, a, YOU, 700, 1000, 1.0, { pose: 'vitorea', mood: 'risa' });
      const xs = ['FREE CARS', 'EMPTY CITY', 'NO BOSS'];
      xs.forEach((w, i) => K.etiqueta(ctx, a, w, 360 + i * 600, 330 + (i % 2) * 70, { size: 46, rot: -0.08 + i * 0.07, p0: 0.15 + i * 0.15 })); }, { de: 1, a: 1.1, foco: [W / 2, 650] }));
    sello(K, ctx, a, 'ALMOST ALL WRONG', W / 2, 560, { p0: 0.75, size: 96 }); },
  // 2 — Cinco mitos: cinco cartas de película que se rompen una a una
  2: (ctx, a, K) => { const { YOU } = cast(K);
    sky(ctx, '#20163a', '#3b2a66'); K.radial(ctx, W / 2, 420, 900, '#ffd93d', 0.25);
    const tit = ['POWER', 'CARS', 'FOOD', 'CITIES', 'DANGER'];
    for (let i = 0; i < 5; i++) { const x = 300 + i * 330, k = K.clamp((fase(a) - 0.05 - i * 0.1) / 0.1), br = K.clamp((fase(a) - 0.55 - i * 0.07) / 0.1);
      ctx.save(); ctx.translate(x, lerpN(-300, 400, sm(k))); ctx.rotate((i - 2) * 0.05);
      if (br > 0) { ctx.save(); ctx.translate(-br * 40, br * 60); ctx.rotate(-br * 0.3); K.R(ctx, -130, -180, 130, 360, 0, '#fff6dc', 7); ctx.restore(); ctx.translate(br * 40, br * 80); ctx.rotate(br * 0.25); K.R(ctx, 0, -180, 130, 360, 0, '#fff6dc', 7); }
      else K.R(ctx, -130, -180, 260, 360, 18, '#fff6dc', 8);
      ctx.fillStyle = '#ff3b4e'; ctx.font = '900 64px Anton'; ctx.textAlign = 'center'; ctx.fillText(`#${i + 1}`, 0, -60); ctx.fillStyle = INK; ctx.font = '900 44px Anton'; ctx.fillText(tit[i], 0, 40); ctx.restore(); }
    D(K, ctx, a, YOU, W / 2, 1120, 0.75, { pose: 'senala', mood: 'feliz' }); K.luz(ctx, a, { tono: 'interior', foco: [W / 2, 400] }); },
  // 3 — Quédate hasta el final: un giro final escondido bajo una lona; un reloj de arena
  3: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { sky(ctx, '#0f0b22', '#2a1f4a'); suelo(ctx, 900, '#2b2240', '#150f26'); K.radial(ctx, 1200, 520, 520, '#fff2b0', 0.4);
      ctx.save(); ctx.translate(1200, 880); const tem = Math.sin(a.t * 9) * 0.03 * K.clamp(fase(a) * 2); ctx.rotate(tem); K.P(ctx, [[-260, 0], [-200, -420], [0, -480], [200, -420], [260, 0]], '#7b2cbf', 9); ctx.restore();
      ctx.fillStyle = '#fff'; ctx.font = '900 150px Anton'; ctx.textAlign = 'center'; ctx.fillText('?', 1200, 700 + Math.sin(a.t * 3) * 10);
      K.prop(ctx, 'reloj_arena', 1650, 760, 0.9, a.t);
      const y = D(K, ctx, a, YOU, 560, 900, 1.05, { pose: 'piensa', mood: 'duda', mira: 1 }); K.simbolo(ctx, a, y.cabeza, y.hr, '?', 0.4); }, { de: 1, a: 1.15, foco: [1100, 600] });
    K.etiqueta(ctx, a, 'THE FINAL TWIST', 1200, 230, { size: 50, p0: 0.2 }); K.luz(ctx, a, { tono: 'noche', foco: [1200, 520] }); },
  // 4 — Te despiertas: no suena la alarma; el móvil dice SIN SEÑAL
  4: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { SET.dormitorio(ctx, a.t, { hora: 'dia' });
      const sit = fase(a) > 0.25; const y = D(K, ctx, a, YOU, 820, 900, 1.0, { pose: sit ? 'sostiene' : 'sentado', mood: sit ? 'duda' : 'dormido', mira: 1 });
      if (sit && y.manoD) movil(K, ctx, y.manoD[0] + 70, y.manoD[1] - 80, 0.75, { txt: 'NO SIGNAL', t: a.t });
      K.prop(ctx, 'reloj_digital', 1350, 640, 0.6, a.t); K.text(ctx, 'zzz', 1350, 520, { size: 46, color: '#9aa', k: 1 - K.clamp(fase(a) * 4) }); }, { de: 1, a: 1.22, foco: [960, 560] });
    K.luz(ctx, a, { tono: 'interior', foco: [900, 500] }); K.rotulo(ctx, a, 'No messages. Nothing.', W / 2, 1000, { size: 40, p0: 0.55 }); },
  // 5 — Sales a la calle: ni coches, ni voces, ni perros. Silencio total
  5: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { SET.calle(ctx, a.t, { hora: 'dia' });
      const w = K.anda(a, 300, 1000, 0, 0.6); D(K, ctx, a, YOU, w.x, 1010, 0.9, { pose: w.pose, mira: w.mira, mood: 'triste' });
      ['NO CARS', 'NO VOICES', 'NO DOGS'].forEach((t, i) => { const k = K.clamp((fase(a) - 0.2 - i * 0.18) / 0.08); if (k <= 0) return; ctx.save(); ctx.globalAlpha = k; ctx.translate(1180 + i * 250, 260 + i * 170); ctx.rotate(-0.06); ctx.scale(1.7, 1.7); K.R(ctx, -110, -40, 220, 80, 40, '#ffffff', 6); ctx.fillStyle = INK; ctx.font = '900 34px Poppins'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(t, 0, 2); ln(ctx, [[-100, 30], [100, -30]], '#ff3b4e', 8); ctx.restore(); }); }, { de: 1.08, a: 1, foco: [800, 700] });
    K.luz(ctx, a, { tono: 'dia' }); },
  // 6 — Empezamos por la electricidad: mito nº 1 (un interruptor gigante)
  6: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { sky(ctx, '#ffe9b0', '#ffc46b'); K.radial(ctx, 1200, 500, 600, '#ffffff', 0.5);
      K.R(ctx, 1000, 220, 420, 640, 40, '#f4f1ea', 10); K.R(ctx, 1130, 340, 160, 400, 30, '#d9d4c8', 7);
      const k = sm(ph(a, 0.4, 0.55)); ctx.save(); ctx.translate(1210, 540); K.R(ctx, -60, lerpN(60, -180, k), 120, 140, 24, k > 0.5 ? '#ffd93d' : '#ffffff', 8); ctx.restore();
      K.prop(ctx, 'bombilla', 600, 380 + Math.sin(a.t * 2) * 12, 1.0, a.t); if (k > 0.5) K.radial(ctx, 600, 380, 320, '#fff6a0', 0.8);
      D(K, ctx, a, YOU, 760, 1040, 0.95, { pose: 'senala', mood: 'feliz', mira: 1 }); }, { de: 1, a: 1.1, foco: [1000, 520] });
    mito(K, ctx, a, 1, 'Electricity'); K.luz(ctx, a, { tono: 'dia' }); },
});

// ===================== CAPÍTULO 2 · POWER AND WHEELS =====================
Object.assign(A, {
  // 7 — Mito 1: electricidad gratis para siempre; luces, aire acondicionado, pantallas
  7: (ctx, a, K) => { const { YOU } = cast(K);
    peli(K, ctx, a, () => K.camara(ctx, a, () => { SET.salon(ctx, a.t, { hora: 'noche' });
      for (let i = 0; i < 3; i++) { K.R(ctx, 260 + i * 470, 260, 360, 220, 14, '#1a1a2a', 8); K.R(ctx, 276 + i * 470, 276, 328, 188, 8, ['#4d96ff', '#ff6b6b', '#4dff88'][i], 0); K.radial(ctx, 440 + i * 470, 370, 220, '#9fd8ff', 0.35); }
      K.R(ctx, 1560, 520, 260, 110, 16, '#ffffff', 7); for (let i = 0; i < 4; i++) ln(ctx, [[1590 + i * 60, 650 + ((a.t * 120 + i * 40) % 140)], [1600 + i * 60, 680 + ((a.t * 120 + i * 40) % 140)]], '#7cd3ff', 6);
      D(K, ctx, a, YOU, 900, 1000, 1.0, { pose: 'sentado', mood: 'risa' }); }, { de: 1, a: 1.08 }));
    mito(K, ctx, a, 1, 'Free electricity forever'); },
  // 8 — Le das a un interruptor y un rascacielos entero se enciende como un árbol de Navidad
  8: (ctx, a, K) => { const { YOU } = cast(K);
    peli(K, ctx, a, () => { nocheCielo(ctx, a, 1080); const k = ph(a, 0.35, 0.8);
      edificio(K, ctx, 1100, 1000, 520, 860, '#30324e', 0); ctx.save(); ctx.beginPath(); ctx.rect(1100, 1000 - 860 * k, 520, 860 * k); ctx.clip(); edificio(K, ctx, 1100, 1000, 520, 860, '#30324e', 1, 2); ctx.restore();
      if (k > 0) K.radial(ctx, 1360, 1000 - 860 * k, 420, '#ffd76a', 0.45);
      suelo(ctx, 1000, '#2b2240', '#150f26'); K.R(ctx, 640, 760, 120, 200, 10, '#c9ccd6', 7); K.R(ctx, 670, 790 + (k > 0 ? 0 : 60), 60, 70, 8, '#ff3b4e', 6);
      D(K, ctx, a, YOU, 480, 1000, 0.85, { pose: k > 0 ? 'vitorea' : 'senala', mood: 'feliz', mira: 1 }); });
    K.rotulo(ctx, a, 'Easy, right?', 520, 960, { size: 42, p0: 0.7 }); },
  // 9 — Realidad: las centrales necesitan gente que equilibre la red cada segundo
  9: (ctx, a, K) => { const { ENG } = cast(K);
    K.camara(ctx, a, () => { SET.control(ctx, a.t, { alarma: 0 }); const g = 0.5 + Math.sin(a.t * 2.2) * 0.35;
      [[520, 1000, 'habla'], [980, 1000, 'senala'], [1420, 1000, 'sostiene']].forEach(([x, gy, p], i) => D(K, ctx, a, K.reparto('ing29', 3)[i] || ENG, x, gy, 0.8, { pose: p, mood: 'feliz', mira: i === 0 ? 1 : -1 }));
      K.R(ctx, 760, 150, 400, 120, 16, '#0f1a2a', 7); ctx.fillStyle = '#7cd3ff'; ctx.font = '900 34px Poppins'; ctx.textAlign = 'center'; ctx.fillText('SUPPLY', 860, 200); ctx.fillText('DEMAND', 1060, 200);
      K.R(ctx, 800, 220, 120, 20, 6, '#4dff88', 0); K.R(ctx, 1000, 220, 120 * g + 20, 20, 6, '#ffd93d', 0); }, { de: 1.05, a: 1, foco: [960, 600] });
    realidad(K, ctx, a); K.rotulo(ctx, a, 'Every second, people balance the grid', W / 2, 1000, { size: 40, p0: 0.3 }); K.luz(ctx, a, { tono: 'interior' }); },
  // 10 — Sin ellos: oferta y demanda se separan, saltan las protecciones, se desconectan líneas
  10: (ctx, a, K) => {
    K.camara(ctx, a, () => { SET.control(ctx, a.t, { alarma: K.clamp(fase(a) * 2) });
      const sep = sm(ph(a, 0.1, 0.6)); K.R(ctx, 560, 170, 800, 220, 20, '#0f1a2a', 8);
      ctx.save(); ctx.strokeStyle = '#4dff88'; ctx.lineWidth = 8; ctx.beginPath(); for (let x = 0; x < 760; x += 10) ctx.lineTo(580 + x, 280 - sep * x * 0.12 + Math.sin(x * 0.05 + a.t * 4) * 10); ctx.stroke();
      ctx.strokeStyle = '#ff4d5e'; ctx.beginPath(); for (let x = 0; x < 760; x += 10) ctx.lineTo(580 + x, 280 + sep * x * 0.12 + Math.sin(x * 0.05 + a.t * 4 + 1) * 10); ctx.stroke(); ctx.restore();
      if (fase(a) > 0.55) for (let i = 0; i < 3; i++) { K.starBurst(ctx, 500 + i * 460, 760, 70 + Math.sin(a.t * 20 + i) * 15, '#ffd93d', 1); K.text(ctx, 'TRIP!', 500 + i * 460, 760, { size: 46, color: '#ff3b4e', rot: -0.1 }); }
      ctx.fillStyle = 'rgba(255,0,40,' + (0.15 + 0.15 * Math.sin(a.t * 10)) * K.clamp(fase(a) * 2) + ')'; ctx.fillRect(0, 0, W, H); }, { de: 1, a: 1.06, temblor: fase(a) > 0.55 ? 0.4 : 0 });
    K.rotulo(ctx, a, 'Safety systems trip', W / 2, 1000, { size: 42, p0: 0.5 }); },
  // 11 — En horas o días la red se apaga: ciudad por ciudad, manzana por manzana
  11: (ctx, a, K) => {
    nocheCielo(ctx, a, 1080, 4); const k = ph(a, 0.1, 0.9);
    skyline(K, ctx, a, 1000, (i) => (i / 11 < 1 - k ? 0.85 : 0), 4); suelo(ctx, 1000, '#1a1630', '#0b0918');
    K.contador(ctx, a, k < 0.5 ? 'HOURS' : 'A FEW DAYS', W / 2, 110, { icono: 'reloj', size: 40, col: '#ff3b4e' });
    K.rotulo(ctx, a, 'Block by block, light by light', W / 2, 1000, { size: 40, p0: 0.2 }); },
  // 12 — Los reactores se apagan solos pero necesitan refrigeración; las de gas y carbón se quedan sin combustible
  12: (ctx, a, K) => {
    K.camara(ctx, a, () => { sky(ctx, '#9fc6e6', '#dfeefa'); suelo(ctx, 900, '#8fbf6a', '#5c8a45');
      for (const x of [380, 760]) { K.P(ctx, [[x - 150, 900], [x - 100, 520], [x + 100, 520], [x + 150, 900]], '#d9dbe4', 9); K.smoke(ctx, x, 470, a.t, 6, '#ffffff'); }
      K.R(ctx, 260, 160, 620, 90, 20, '#ffffff', 7); ctx.fillStyle = INK; ctx.font = '900 40px Poppins'; ctx.textAlign = 'center'; ctx.fillText('NUCLEAR: SAFE SHUTDOWN', 570, 220);
      const th = 0.7 + Math.sin(a.t * 3) * 0.05; K.R(ctx, 560, 600, 60, 220, 14, '#ffffff', 6); K.R(ctx, 568, 820 - 200 * th, 44, 200 * th, 10, '#ff4d5e', 0); K.etiqueta(ctx, a, 'NEEDS COOLING', 590, 470, { size: 40 });
      K.R(ctx, 1180, 560, 520, 340, 10, '#8a6a5a', 9); for (let i = 0; i < 2; i++) K.R(ctx, 1260 + i * 260, 300, 80, 260, 6, '#6a4a3a', 8);
      const fuel = 1 - sm(ph(a, 0.3, 0.9)); for (let i = 0; i < 2; i++) K.smoke(ctx, 1300 + i * 260, 290, a.t, Math.round(5 * fuel), '#777777');
      K.R(ctx, 1260, 940 - 40, 380, 40, 10, '#ffffff', 6); K.R(ctx, 1266, 906, 368 * fuel, 28, 8, fuel < 0.3 ? '#ff4d5e' : '#ffd93d', 0); K.etiqueta(ctx, a, 'GAS & COAL: FUEL', 1450, 240, { size: 40 }); }, { de: 1, a: 1.06 });
    K.luz(ctx, a, { tono: 'dia' }); },
  // 13 — La presa Hoover: el agua que cae sigue moviendo turbinas gigantes
  13: (ctx, a, K) => {
    K.camara(ctx, a, () => { sky(ctx, '#8ec9ff', '#d9f0ff'); K.P(ctx, [[0, 300], [500, 260], [560, 1080], [0, 1080]], '#c98b5a', 9); K.P(ctx, [[1920, 300], [1400, 260], [1340, 1080], [1920, 1080]], '#c98b5a', 9);
      K.R(ctx, 0, 220, 520, 120, 0, '#3a8fd6', 0); K.P(ctx, [[520, 260], [1400, 260], [1320, 760], [600, 760]], '#d8d2c4', 9);
      ctx.save(); ctx.strokeStyle = '#7cd3ff'; ctx.lineWidth = 16; for (let i = 0; i < 5; i++) { const x = 760 + i * 100; ctx.setLineDash([60, 30]); ctx.lineDashOffset = -a.t * 400; ctx.beginPath(); ctx.moveTo(x, 300); ctx.lineTo(x - 20, 760); ctx.stroke(); } ctx.restore();
      K.R(ctx, 560, 760, 800, 320, 0, '#3a8fd6', 7);
      for (const x of [760, 1160]) { ctx.save(); ctx.translate(x, 900); ctx.rotate(a.t * 4); for (let i = 0; i < 6; i++) { ctx.rotate(Math.PI / 3); K.E(ctx, 0, -55, 26, 55, '#ffd93d', 0, 6); } K.C(ctx, 0, 0, 30, '#5a5f73', 6); ctx.restore(); } }, { de: 1, a: 1.1, foco: [960, 600] });
    K.etiqueta(ctx, a, 'HOOVER DAM · NEVADA', W / 2, 160, { size: 48, p0: 0.1 }); K.luz(ctx, a, { tono: 'dia' }); },
  // 14 — Sin red ni nadie que la controle, hasta esas turbinas acaban parándose
  14: (ctx, a, K) => {
    const k = sm(ph(a, 0.15, 0.85)); sky(ctx, '#3a3f5c', '#7a7f99'); suelo(ctx, 860, '#4a4558', '#2a2538');
    for (const x of [620, 1300]) { ctx.save(); ctx.translate(x, 560); ctx.rotate(a.t * 5 * (1 - k) + k * 2); for (let i = 0; i < 6; i++) { ctx.rotate(Math.PI / 3); K.E(ctx, 0, -110, 46, 110, '#c9b26a', 0, 7); } K.C(ctx, 0, 0, 50, '#5a5f73', 7); ctx.restore(); }
    torre(K, ctx, 1700, 860, 0.8); cables(ctx, 1630, 1920, 470, 40); if (k > 0.5) { K.text(ctx, 'NO GRID', 1760, 300, { size: 48, color: '#ff3b4e', rot: 0.06 }); }
    K.contador(ctx, a, k > 0.95 ? 'STOPPED' : 'SLOWING…', W / 2, 140, { icono: 'reloj', size: 42, col: k > 0.95 ? '#ff3b4e' : '#1b1530' }); K.luz(ctx, a, { tono: 'tension' }); },
  // 15 — Primera noche solo: ciudad negra, cielo lleno de estrellas. Bonito… y aterrador
  15: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { sky(ctx, '#03051a', '#141238', 1080); estrellas(ctx, a, 380, 760, 9); ctx.save(); ctx.globalAlpha = 0.3; ctx.fillStyle = '#c7b8ff'; ctx.beginPath(); ctx.ellipse(1100, 300, 900, 90, -0.3, 0, 7); ctx.fill(); ctx.restore();
      skyline(K, ctx, a, 1000, 0, 7); suelo(ctx, 1000, '#0d0b1c', '#05040c');
      ctx.save(); ctx.globalAlpha = 0.9; const y = D(K, ctx, a, YOU, 960, 1000, 0.8, { espalda: true, pose: 'quieto' }); ctx.restore(); }, { de: 1.15, a: 1, foco: [960, 500] });
    K.rotulo(ctx, a, 'Beautiful… and terrifying', W / 2, 1000, { size: 42, p0: 0.5 }); },
  // 16 — El congelador se calienta, el móvil muere mañana: el sueño dura lo que un apagón largo
  16: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { SET.cocina(ctx, a.t, { nevera: true, oscuro: 0.5 });
      const k = ph(a, 0.1, 0.9); K.R(ctx, 1560, 360, 60, 240, 14, '#ffffff', 6); K.R(ctx, 1568, 590 - 220 * k, 44, 220 * k + 2, 10, k > 0.6 ? '#ff4d5e' : '#7cd3ff', 0); K.text(ctx, k > 0.6 ? '+8°' : '-18°', 1590, 320, { size: 40, color: k > 0.6 ? '#ff3b4e' : '#3a8fd6' });
      for (let i = 0; i < 3; i++) K.C(ctx, 1500 + i * 40, 700 + ((a.t * 60 + i * 50) % 160), 10, '#9fd8ff', 3);
      const y = D(K, ctx, a, YOU, 760, 1000, 1.0, { pose: 'sostiene', mood: 'triste', mira: 1 });
      if (y.manoD) movil(K, ctx, y.manoD[0] + 60, y.manoD[1] - 70, 0.7, { txt: '1%', bat: Math.max(0.02, 0.4 - k * 0.4), col: '#ff3b4e' }); }, { de: 1, a: 1.12, foco: [1100, 600] });
    K.rotulo(ctx, a, 'Free power lasts as long as a long blackout', W / 2, 1000, { size: 38, p0: 0.5 }); K.luz(ctx, a, { tono: 'noche', foco: [1500, 500] }); },
  // 17 — Mito 2: conducirías el deportivo que quisieras; concesionario abierto, llaves en la mesa
  17: (ctx, a, K) => { const { YOU } = cast(K);
    peli(K, ctx, a, () => K.camara(ctx, a, () => { sky(ctx, '#f4f1ea', '#dcd6c8'); suelo(ctx, 880, '#e8e4dc', '#c9c2b4'); for (let i = 0; i < 4; i++) K.R(ctx, 80 + i * 470, 140, 420, 480, 8, '#bfe6ff', 6);
      cocheDep(K, ctx, 1200, 960, 1.0, '#e63946'); K.radial(ctx, 1200, 820, 400, '#ffffff', 0.3);
      K.R(ctx, 420, 760, 260, 30, 6, '#d9a066', 7); const kk = Math.sin(a.t * 3) * 6; K.C(ctx, 520, 740 + kk, 18, '#ffd93d', 6); ln(ctx, [[536, 740 + kk], [580, 740 + kk]], '#ffd93d', 10);
      D(K, ctx, a, YOU, 640, 980, 0.95, { pose: 'senala', mood: 'risa', mira: 1 }); }, { de: 1, a: 1.08, foco: [1000, 600] }));
    mito(K, ctx, a, 2, 'Drive any supercar you want'); },
  // 18 — Acelerar por la autopista vacía, rey del mundo
  18: (ctx, a, K) => { const { YOU } = cast(K);
    peli(K, ctx, a, () => K.camara(ctx, a, () => { SET.autopista(ctx, a.t * 6, { hora: 'dia' });
      cocheDep(K, ctx, 960, 980, 1.0, '#e63946', a.t * 14); const y = { cabeza: [930, 790] }; K.C(ctx, 930, 790, 46, '#ffd7b5', 7); K.speedLines && K.speedLines(ctx, 960, 600, a.t, 1.0);
      K.text(ctx, 'WOOO!', 760, 640, { size: 70, color: '#ffd93d', rot: -0.15 }); }, { de: 1, a: 1.08, temblor: 0.2 }));
    K.etiqueta(ctx, a, 'KING OF THE WORLD', 1500, 330, { size: 44, p0: 0.4 }); },
  // 19 — La gasolina se estropea en 6-12 meses y deja depósitos gomosos que atascan el motor
  19: (ctx, a, K) => {
    K.camara(ctx, a, () => { sky(ctx, '#f2e6c8', '#e0cfa6'); K.radial(ctx, 960, 500, 700, '#ffffff', 0.3);
      const k = sm(ph(a, 0.1, 0.8)); const col = `rgb(${Math.round(lerpN(255, 140, k))},${Math.round(lerpN(214, 110, k))},${Math.round(lerpN(90, 50, k))})`;
      K.R(ctx, 380, 300, 360, 560, 40, '#ff3b4e', 9); K.R(ctx, 410, 420 + 120 * k, 300, 400 - 120 * k, 20, col, 0); K.R(ctx, 540, 240, 100, 70, 14, '#c1121f', 8);
      for (let i = 0; i < 6 * k; i++) K.E(ctx, 450 + (i % 3) * 90, 780 - Math.floor(i / 3) * 50, 36, 18, '#6b4a2b', 0, 4);
      K.contador(ctx, a, k < 0.5 ? '6 MONTHS' : '12 MONTHS', 560, 200, { icono: 'reloj', size: 36 });
      K.R(ctx, 1000, 420, 620, 380, 30, '#8a8d99', 9); for (let i = 0; i < 3; i++) K.R(ctx, 1080 + i * 170, 360, 110, 100, 10, '#6b6e7a', 7); K.E(ctx, 1310, 620, 220, 90, '#4a3a2a', 0, 0);
      if (k > 0.6) K.smoke(ctx, 1310, 360, a.t, 5, '#444444'); }, { de: 1, a: 1.08 });
    realidad(K, ctx, a, 1650, 170); K.rotulo(ctx, a, 'Gasoline goes stale', W / 2, 1000, { size: 42, p0: 0.3 }); },
  // 20 — Los surtidores necesitan electricidad; te toca sacar combustible a mano
  20: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { sky(ctx, '#9ec9e8', '#d6ecf7'); suelo(ctx, 900, '#9a9aa6', '#6a6a76'); K.R(ctx, 200, 200, 1520, 80, 10, '#ff3b4e', 8); for (const x of [380, 1520]) K.R(ctx, x, 280, 40, 620, 6, '#ececf2', 7);
      for (const x of [700, 1150]) { K.R(ctx, x - 90, 520, 180, 380, 20, '#f4f4f8', 8); K.R(ctx, x - 60, 560, 120, 80, 8, '#0b0b12', 5); K.text(ctx, 'OFF', x, 610, { size: 34, color: '#ff3b4e' }); }
      cocheDep(K, ctx, 1500, 960, 0.55, '#4d96ff'); const y = D(K, ctx, a, YOU, 1450, 980, 0.8, { pose: 'empuja', mood: 'cansado', mira: -1 });
      K.R(ctx, 1180, 880, 90, 110, 12, '#ff3b4e', 6); ctx.save(); ctx.strokeStyle = '#5a7a5a'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(1290, 870); ctx.quadraticCurveTo(1250, 820, 1230, 880); ctx.stroke(); ctx.restore();
      const g = (a.t * 2) % 1; K.E(ctx, 1225, 890 + g * 30, 8, 12, '#e8c86a', 0, 3); }, { de: 1, a: 1.08 });
    K.rotulo(ctx, a, 'No power = no pumps', W / 2, 1000, { size: 42, p0: 0.2 }); K.luz(ctx, a, { tono: 'dia' }); },
  // 21 — Baterías muertas, ruedas pinchadas, óxido: hasta el coche más caro se vuelve chatarra
  21: (ctx, a, K) => {
    K.camara(ctx, a, () => { SET.suburbio(ctx, a.t, { ruina: 0.5 }); const k = sm(ph(a, 0.05, 0.9));
      ctx.save(); ctx.translate(960, 1000); ctx.scale(1, 1 - 0.1 * k); cocheDep(K, ctx, 0, 0, 1.3, '#e63946'); ctx.restore();
      ctx.save(); ctx.globalAlpha = k * 0.8; for (let i = 0; i < 18; i++) K.C(ctx, 600 + hs(i) * 760, 760 + hs(i * 3) * 200, 14 + hs(i * 7) * 26, '#9a4a1a', 0); ctx.restore();
      const it = [['BATTERY', 0.15], ['TIRES', 0.4], ['RUST', 0.65]]; it.forEach(([t, p], i) => K.etiqueta(ctx, a, t, 520 + i * 440, 260, { size: 44, p0: p, rot: -0.05 + i * 0.05 }));
      if (k > 0.8) K.text(ctx, 'JUNK', 960, 520, { size: 110, color: '#ff3b4e', rot: -0.12 }); }, { de: 1, a: 1.06 });
    K.luz(ctx, a, { tono: 'atardecer' }); },
  // 22 — Carreteras bloqueadas: coches del último día, árboles caídos, malas hierbas
  22: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { SET.autopista(ctx, a.t, { ruina: 0.8 });
      ctx.save(); ctx.translate(820, 860); ctx.rotate(0.25); cocheDep(K, ctx, 0, 0, 0.45, '#4d96ff'); ctx.restore(); ctx.save(); ctx.translate(1120, 880); ctx.rotate(-0.2); cocheDep(K, ctx, 0, 0, 0.5, '#ffd93d'); ctx.restore();
      ctx.save(); ctx.translate(960, 970); ctx.rotate(0.06); K.R(ctx, -520, -30, 1040, 60, 30, '#7a4b2a', 8); for (let i = 0; i < 4; i++) K.C(ctx, -420 + i * 300, -60, 70, '#3f9150', 7); ctx.restore();
      const y = D(K, ctx, a, YOU, 1500, 1060, 0.9, { pose: 'encoge', mood: 'enfadado', mira: -1 }); K.simbolo(ctx, a, y.cabeza, y.hr, '!', 0.4); }, { de: 1.1, a: 1, foco: [960, 800] });
    K.rotulo(ctx, a, 'Every road is blocked', W / 2, 1000, { size: 42, p0: 0.3 }); K.luz(ctx, a, { tono: 'dia' }); },
  // 23 — Tras el paseíto, acabas en bicicleta. Sin gasolina, sin mecánico. Solo tus piernas
  23: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { SET.avenida(ctx, a.t, { hora: 'dia' }); const x = lerpN(300, 1600, fase(a)), r = a.t * 6;
      bici(K, ctx, x, 1000, 1.0, r); D(K, ctx, a, YOU, x - 20, 870, 0.75, { pose: [0.3, 0.6, 0.3, 0.6, Math.sin(r) * 0.8, 0.6, -Math.sin(r) * 0.8, 0.6, 0], mood: 'cansado', mira: 1, sombra: false });
      ['NO FUEL', 'NO MECHANIC', 'NO SHOP'].forEach((t, i) => K.etiqueta(ctx, a, t, 420 + i * 540, 220, { size: 40, p0: 0.2 + i * 0.15, rot: -0.04 })); }, { de: 1, a: 1.05 });
    K.luz(ctx, a, { tono: 'dia' }); },
  // 24 — La bici, quizás el mejor vehículo: nunca se queda sin gasolina y la arreglas tú
  24: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { SET.parque(ctx, a.t, { hora: 'dia' }); bici(K, ctx, 1150, 1000, 1.2, Math.sin(a.t) * 0.4);
      const y = D(K, ctx, a, YOU, 800, 1010, 1.0, { pose: 'sostiene', mood: 'feliz', mira: 1 });
      if (y.manoD) { ctx.save(); ctx.translate(y.manoD[0] + 20, y.manoD[1]); ctx.rotate(-0.6 + Math.sin(a.t * 6) * 0.3); K.R(ctx, -8, -10, 16, 90, 6, '#8a8d99', 5); K.C(ctx, 0, -20, 20, '#8a8d99', 5); ctx.restore(); }
      sello(K, ctx, a, 'BEST VEHICLE LEFT', 1300, 300, { p0: 0.45, col: '#20c060', size: 70, rot: 0.06 }); }, { de: 1.08, a: 1 });
    K.luz(ctx, a, { tono: 'dia' }); },
});
function brillo(ctx, x, y, r, col = '#ffffff', al = 0.8) { ctx.save(); ctx.globalAlpha = al; ctx.fillStyle = col; ctx.beginPath(); for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * 0.25 : r, an = i * Math.PI / 4; ctx.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr); } ctx.fill(); ctx.restore(); }

// --- Supermercado ---
function estante(K, ctx, x, y, w, items, k = 0, seed = 1) { // k: deterioro 0..1
  K.R(ctx, x, y, w, 26, 6, '#c9ccd6', 6);
  for (let i = 0; i < items; i++) { const ix = x + 30 + i * ((w - 60) / items), r = hs(i + seed), col = ['#ff6b6b', '#ffd93d', '#4dff88', '#4d96ff', '#ff9f1c'][(i + seed) % 5];
    const podr = k > r; K.R(ctx, ix, y - 90, (w - 60) / items - 14, 90, 8, podr ? '#7a6a3a' : col, 5); if (podr) K.C(ctx, ix + 20, y - 60, 12, '#5a7a3a', 0); }
}
function super_(K, ctx, a, k = 0) {
  sky(ctx, '#f4f1ea', '#e6e0d2'); K.R(ctx, 0, 0, W, 110, 0, '#ffffff', 0); for (let i = 0; i < 5; i++) K.R(ctx, 80 + i * 380, 40, 260, 30, 10, k > 0.3 ? '#3a3a44' : '#fffbe0', 4);
  suelo(ctx, 900, '#dcd6c8', '#bdb5a2');
  for (const x of [80, 1180]) { K.R(ctx, x, 260, 660, 640, 10, '#e9e5dd', 8); for (let r = 0; r < 4; r++) estante(K, ctx, x + 20, 400 + r * 150, 620, 6, k, r * 3 + (x > 500 ? 1 : 0)); }
  if (k > 0.2) { ctx.save(); ctx.globalAlpha = Math.min(0.5, k * 0.6); ctx.fillStyle = '#2a2418'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
}
function lata(K, ctx, x, y, s = 1, col = '#ff6b6b', txt = 'BEANS') { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); K.R(ctx, -60, -90, 120, 180, 14, '#c9ccd6', 7); K.R(ctx, -60, -60, 120, 110, 0, col, 6); ctx.fillStyle = '#fff'; ctx.font = '900 30px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, -4); K.E(ctx, 0, -90, 60, 14, '#e6e8ee', 0, 6); ctx.restore(); }
function tarro(K, ctx, x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); K.R(ctx, -90, -110, 180, 220, 40, '#f4a300', 8); K.R(ctx, -100, -150, 200, 50, 14, '#8a5a2a', 7); K.R(ctx, -60, -30, 120, 70, 10, '#fff6dc', 5); ctx.fillStyle = INK; ctx.font = '900 34px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('HONEY', 0, 6); K.E(ctx, -50, -70, 16, 30, 'rgba(255,255,255,0.45)', 0.3, 0); ctx.restore(); }
function mosca(K, ctx, x, y, t, i) { const xx = x + Math.sin(t * 7 + i * 2) * 60, yy = y + Math.cos(t * 9 + i) * 40; K.C(ctx, xx, yy, 10, INK, 0); K.E(ctx, xx - 8, yy - 10, 10, 6, 'rgba(200,230,255,0.8)', -0.5, 2); K.E(ctx, xx + 8, yy - 10, 10, 6, 'rgba(200,230,255,0.8)', 0.5, 2); }

// ===================== CAPÍTULO 3 · THE SUPERMARKET =====================
Object.assign(A, {
  // 25 — Mito 3: los supermercados son comida infinita; carrito lleno, sin pagar
  25: (ctx, a, K) => { const { YOU } = cast(K);
    peli(K, ctx, a, () => K.camara(ctx, a, () => { super_(K, ctx, a, 0); const x = lerpN(500, 1300, fase(a));
      K.R(ctx, x + 70, 760, 300, 160, 14, 'rgba(200,210,230,0.6)', 7); for (let i = 0; i < 7; i++) K.R(ctx, x + 90 + (i % 4) * 66, 700 - Math.floor(i / 4) * 60, 56, 70, 8, ['#ff6b6b', '#ffd93d', '#4dff88', '#4d96ff'][i % 4], 5); K.C(ctx, x + 120, 950, 22, '#333', 6); K.C(ctx, x + 330, 950, 22, '#333', 6);
      D(K, ctx, a, YOU, x, 980, 0.95, { pose: 'empuja', mood: 'risa', mira: 1 });
      K.R(ctx, 120, 160, 300, 90, 12, '#ff3b4e', 7); ctx.fillStyle = '#fff'; ctx.font = '900 44px Anton'; ctx.textAlign = 'center'; ctx.fillText('PRICE: $0', 270, 222); }, { de: 1, a: 1.08 }));
    mito(K, ctx, a, 3, 'Supermarkets are endless food'); },
  // 26 — En las pelis, las estanterías siguen perfectas: manzanas brillantes, filetes fríos
  26: (ctx, a, K) => {
    peli(K, ctx, a, () => K.camara(ctx, a, () => { sky(ctx, '#f8f4ea', '#e8e2d4'); K.R(ctx, 160, 300, 1600, 600, 20, '#ffffff', 9);
      for (let i = 0; i < 9; i++) { K.prop(ctx, 'manzana', 320 + i * 150, 460, 0.5, a.t); }
      for (let i = 0; i < 5; i++) { K.R(ctx, 280 + i * 280, 620, 220, 120, 20, '#ff8fa3', 7); K.E(ctx, 390 + i * 280, 680, 70, 34, '#ffd0d8', 0, 4); }
      K.radial(ctx, 960, 300, 700, '#ffffff', 0.4); for (let i = 0; i < 6; i++) brillo(ctx, 300 + i * 280, 420 + Math.sin(a.t * 3 + i) * 20, 20 + Math.sin(a.t * 5 + i) * 6, '#ffffff', 0.6);
      K.etiqueta(ctx, a, 'FRESH FOREVER?', 960, 220, { size: 56, p0: 0.2 }); }, { de: 1.1, a: 1 })); },
  // 27 — Realidad: la refrigeración para en un día o dos; carne y lácteos se pudren, hedor
  27: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { super_(K, ctx, a, 0.3); const k = ph(a, 0.05, 0.7);
      K.R(ctx, 560, 330, 800, 560, 14, '#dfe8f0', 9); for (let i = 0; i < 3; i++) K.R(ctx, 580 + i * 260, 350, 240, 520, 8, `rgba(${Math.round(160 + 80 * k)},${Math.round(210 - 80 * k)},${Math.round(230 - 120 * k)},0.7)`, 5);
      for (let i = 0; i < 6; i++) K.R(ctx, 610 + (i % 3) * 260, 450 + Math.floor(i / 3) * 200, 180, 80, 14, k > 0.4 ? '#8a7a4a' : '#ff8fa3', 5);
      for (let i = 0; i < 5; i++) { ctx.save(); ctx.globalAlpha = 0.5 * k; ctx.strokeStyle = '#7fbf3f'; ctx.lineWidth = 10; ctx.beginPath(); const x = 700 + i * 130; for (let y = 0; y < 220; y += 10) ctx.lineTo(x + Math.sin(y * 0.05 + a.t * 3 + i) * 24, 330 - y); ctx.stroke(); ctx.restore(); }
      const y = D(K, ctx, a, YOU, 1560, 1000, 0.95, { pose: 'miedo', mood: 'enfadado', mira: -1 }); K.mareo(ctx, a, y.cabeza, y.hr); }, { de: 1, a: 1.08 });
    realidad(K, ctx, a, 1620, 180); K.rotulo(ctx, a, 'Fridges stop in a day or two', W / 2, 1000, { size: 40, p0: 0.25 }); },
  // 28 — La fruta se pudre, el pan con moho; llegan moscas y ratas
  28: (ctx, a, K) => {
    K.camara(ctx, a, () => { super_(K, ctx, a, 0.7); const k = ph(a, 0.1, 0.7);
      for (let i = 0; i < 6; i++) { const x = 360 + i * 240, c = k > i / 6 ? '#6a5a2a' : '#ffd93d'; K.E(ctx, x, 720, 80, 50, c, 0, 7); if (k > i / 6) for (let j = 0; j < 4; j++) K.C(ctx, x - 40 + j * 26, 700 + (j % 2) * 20, 12, '#7fbf3f', 0); }
      for (let i = 0; i < 8; i++) mosca(K, ctx, 400 + i * 160, 520, a.t, i);
      const rx = lerpN(-200, 1700, fase(a)); ctx.save(); ctx.translate(rx, 960); K.E(ctx, 0, 0, 70, 36, '#6b6e7a', 0, 6); K.C(ctx, 70, -16, 26, '#6b6e7a', 6); K.C(ctx, 64, -40, 12, '#ff9ab0', 4); ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-70, 0); ctx.quadraticCurveTo(-140, -40 + Math.sin(a.t * 10) * 20, -180, 10); ctx.stroke(); ctx.restore(); }, { de: 1.06, a: 1 });
    K.etiqueta(ctx, a, 'WEEKS', 960, 200, { size: 54, p0: 0.15 }); },
  // 29 — La buena noticia: las latas duran años, a menudo más allá de la fecha
  29: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { sky(ctx, '#2a2440', '#463a66'); K.radial(ctx, 960, 480, 700, '#ffd93d', 0.4); suelo(ctx, 900, '#3a3150', '#1f1a30');
      for (let i = 0; i < 5; i++) { const k = K.clamp((fase(a) - i * 0.08) / 0.15); lata(K, ctx, 560 + i * 200, lerpN(-200, 800, sm(k)), 1.1, ['#ff6b6b', '#4d96ff', '#ffd93d', '#4dff88', '#ff9f1c'][i], ['BEANS', 'SOUP', 'CORN', 'PEAS', 'FISH'][i]); }
      K.contador(ctx, a, 'YEARS', 960, 250, { icono: 'reloj', size: 46, col: '#20c060', p0: 0.4 });
      D(K, ctx, a, YOU, 260, 1000, 0.95, { pose: 'vitorea', mood: 'feliz', mira: 1 }); }, { de: 1, a: 1.08 });
    K.rotulo(ctx, a, 'If the can stays intact', W / 2, 1000, { size: 40, p0: 0.6 }); },
  // 30 — Arroz, pasta y legumbres secos duran aún más; arrasas el pasillo de latas primero
  30: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { super_(K, ctx, a, 0.5); const w = K.anda(a, 1500, 900, 0.05, 0.5, true);
      for (let i = 0; i < 3; i++) { const x = 300 + i * 220; K.R(ctx, x - 80, 640, 160, 240, 20, ['#f4e7b0', '#ffd27a', '#c98b5a'][i], 7); ctx.fillStyle = INK; ctx.font = '900 34px Anton'; ctx.textAlign = 'center'; ctx.fillText(['RICE', 'PASTA', 'BEANS'][i], x, 770); }
      const y = D(K, ctx, a, YOU, w.x, 1000, 1.0, { pose: fase(a) > 0.5 ? 'sostiene' : w.pose, mood: 'risa', mira: w.mira || -1 });
      if (fase(a) > 0.5 && y.manoD) for (let i = 0; i < 4; i++) lata(K, ctx, y.manoD[0] - 40 + (i % 2) * 70, y.manoD[1] - 40 - Math.floor(i / 2) * 110, 0.5, ['#ff6b6b', '#4d96ff', '#ffd93d', '#4dff88'][i], ''); }, { de: 1, a: 1.06 });
    K.etiqueta(ctx, a, 'CANNED AISLE FIRST', 1300, 200, { size: 48, p0: 0.3 }); K.luz(ctx, a, { tono: 'interior' }); },
  // 31 — La miel prácticamente nunca se estropea (tarro brillando)
  31: (ctx, a, K) => {
    K.camara(ctx, a, () => { sky(ctx, '#3a2410', '#7a4a12'); K.radial(ctx, 960, 520, 700, '#ffd93d', 0.55); suelo(ctx, 880, '#5a3a18', '#2a1a08');
      tarro(K, ctx, 960, 720, 2.0 + Math.sin(a.t * 2) * 0.03); for (let i = 0; i < 7; i++) { const an = a.t * 0.8 + i * 0.9; brillo(ctx, 960 + Math.cos(an) * 420, 560 + Math.sin(an) * 240, 18, '#fff6a0', 0.8); }
      const tags = ['LOW MOISTURE', 'NATURALLY ACIDIC']; tags.forEach((t, i) => K.etiqueta(ctx, a, t, i ? 1500 : 420, 300 + i * 80, { size: 40, p0: 0.25 + i * 0.2, rot: i ? 0.06 : -0.06 }));
      K.contador(ctx, a, 'NEVER SPOILS', 960, 1000, { icono: 'reloj', size: 46, col: '#20c060', p0: 0.55 }); }, { de: 1.12, a: 1, foco: [960, 640] }); },
  // 32 — No morirías de hambre ya, pero el reloj corre: cada lata abierta no vuelve
  32: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { SET.cocina(ctx, a.t, { oscuro: 0.4 }); const n = 12, k = ph(a, 0.05, 0.95);
      for (let i = 0; i < n; i++) { const vac = i / n < k; const x = 1080 + (i % 6) * 120, y = 660 - Math.floor(i / 6) * 160; if (vac) { K.R(ctx, x - 40, y - 60, 80, 120, 10, '#8a8d99', 5); K.E(ctx, x, y - 60, 40, 10, '#2a2a33', 0, 4); } else lata(K, ctx, x, y, 0.66, ['#ff6b6b', '#4d96ff', '#ffd93d'][i % 3], ''); }
      D(K, ctx, a, YOU, 600, 1000, 1.0, { pose: 'sentado', mood: 'duda', mira: 1 }); K.prop(ctx, 'reloj_arena', 300, 520, 0.8, a.t); }, { de: 1, a: 1.08 });
    K.contador(ctx, a, `${Math.max(0, 12 - Math.floor(ph(a, 0.05, 0.95) * 12))} CANS LEFT`, W / 2, 110, { icono: 'reloj', size: 42, col: '#ff3b4e' }); K.luz(ctx, a, { tono: 'interior' }); },
  // 33 — Tendrías que cultivar, pescar o recolectar; alguien criado con apps de comida a domicilio…
  33: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { SET.granja(ctx, a.t, {}); const y = D(K, ctx, a, YOU, 860, 1000, 1.0, { pose: 'sostiene', mood: 'duda', mira: 1 });
      if (y.manoD) { ctx.save(); ctx.translate(y.manoD[0], y.manoD[1]); ctx.rotate(0.5 + Math.sin(a.t * 3) * 0.2); K.R(ctx, -8, -160, 16, 260, 6, '#8a5a2a', 5); K.P(ctx, [[-40, -170], [40, -170], [30, -220], [-30, -220]], '#8a8d99', 5); ctx.restore(); }
      movil(K, ctx, 1400, 560, 0.9, { txt: 'NO DRIVERS', rot: 0.1 }); K.C(ctx, 1400, 440, 40, '#ff9f1c', 5);
      K.prop(ctx, 'pez', 420, 620 + Math.sin(a.t * 4) * 20, 0.5, a.t); }, { de: 1, a: 1.08 });
    ['FARM', 'FISH', 'FORAGE'].forEach((t, i) => K.etiqueta(ctx, a, t, 500 + i * 460, 200, { size: 46, p0: 0.15 + i * 0.15 })); K.luz(ctx, a, { tono: 'dia' }); },
  // 34 — Si crees que la comida es difícil, mira lo que le pasa a la ciudad (puerta a la ciudad)
  34: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { sky(ctx, '#ffb36b', '#6a3a7a'); skyline(K, ctx, a, 1000, 0.2, 11); suelo(ctx, 1000, '#3a2a40', '#1f1626');
      ctx.save(); ctx.globalAlpha = 0.4 + 0.3 * Math.sin(a.t * 2); ctx.fillStyle = '#3f9150'; for (let i = 0; i < 20; i++) { const x = hs(i) * W; ctx.beginPath(); ctx.moveTo(x, 1000); ctx.quadraticCurveTo(x + 30, 700 - hs(i * 3) * 300, x + 10, 400 + hs(i * 5) * 300); ctx.lineWidth = 12; ctx.strokeStyle = '#3f9150'; ctx.stroke(); } ctx.restore();
      D(K, ctx, a, YOU, 960, 1060, 1.1, { espalda: true, pose: 'quieto' }); }, { de: 1, a: 1.2, foco: [960, 500] });
    K.etiqueta(ctx, a, 'NEXT MYTH...', W / 2, 180, { size: 54, p0: 0.3 }); K.luz(ctx, a, { tono: 'atardecer' }); },
});

// ===================== CAPÍTULO 4 · THE INTACT CITY =====================
Object.assign(A, {
  // 35 — Mito 4: las ciudades seguirían intactas: rascacielos brillantes, calles limpias
  35: (ctx, a, K) => { const { YOU } = cast(K);
    peli(K, ctx, a, () => K.camara(ctx, a, () => { sky(ctx, '#8ec9ff', '#e6f4ff'); skyline(K, ctx, a, 1000, 0.15, 21); suelo(ctx, 1000, '#c9ccd6', '#9a9aa6');
      for (let i = 0; i < 5; i++) brillo(ctx, 200 + i * 380, 300 + hs(i) * 300, 24 + Math.sin(a.t * 4 + i) * 6, '#ffffff', 0.7);
      D(K, ctx, a, YOU, 960, 1040, 0.9, { pose: 'vitorea', mood: 'feliz' }); }, { de: 1, a: 1.08 }));
    mito(K, ctx, a, 4, 'Cities would stay intact'); },
  // 36 — Tú solo en una gran plaza de pantallas, girando en mitad de la calle
  36: (ctx, a, K) => { const { YOU } = cast(K);
    peli(K, ctx, a, () => K.camara(ctx, a, () => { SET.plaza(ctx, a.t, { luces: 1 }); const g = Math.sin(a.t * 4);
      D(K, ctx, a, YOU, 960, 1000, 1.05, { pose: 'brazos', mood: 'risa', mira: g > 0.3 ? 1 : g < -0.3 ? -1 : 0 });
      ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 8; ctx.beginPath(); ctx.ellipse(960, 940, 200, 40, 0, a.t * 3, a.t * 3 + 4); ctx.stroke(); ctx.restore(); }, { de: 1.2, a: 1, foco: [960, 650] }), 'BIG CITY SQUARE'); },
  // 37 — Realidad: la ciudad es una máquina que funciona porque miles de personas la arreglan cada día
  37: (ctx, a, K) => {
    K.camara(ctx, a, () => { SET.calle(ctx, a.t, { hora: 'dia' }); const crew = K.reparto('obreros29', 6);
      crew.forEach((p, i) => { const x = 200 + i * 300, ok = fase(a) < 0.6; ctx.save(); ctx.globalAlpha = ok ? 1 : Math.max(0, 1 - (fase(a) - 0.6) * 5); D(K, ctx, a, { ...p, sombrero: 'obra', ropa: '#ff9f1c' }, x, 1010, 0.7, { pose: ['empuja', 'sostiene', 'senala', 'levanta', 'habla', 'empuja'][i], mood: 'feliz', mira: i % 2 ? -1 : 1 }); ctx.restore(); });
      for (let i = 0; i < 6; i++) { const an = a.t * 2 + i; ctx.save(); ctx.translate(200 + i * 300, 560); ctx.rotate(an); for (let j = 0; j < 8; j++) { ctx.rotate(Math.PI / 4); K.R(ctx, -8, -38, 16, 16, 3, '#8a8d99', 3); } K.C(ctx, 0, 0, 26, '#8a8d99', 5); ctx.restore(); }
      if (fase(a) > 0.65) K.etiqueta(ctx, a, 'STOP = NATURE TAKES OVER', W / 2, 260, { size: 52, p0: 0.65 }); }, { de: 1, a: 1.06 });
    realidad(K, ctx, a, 1650, 160); K.luz(ctx, a, { tono: 'dia' }); },
  // 38 — Nueva York: el metro está bajo el nivel freático; bombas sacan ~13 millones de galones al día
  38: (ctx, a, K) => {
    K.camara(ctx, a, () => { sky(ctx, '#8ec9ff', '#cfe9ff', 300); K.R(ctx, 0, 240, W, 70, 0, '#9a9aa6', 6); for (let i = 0; i < 6; i++) edificio(K, ctx, i * 330, 240, 280, 200, '#46365e', 0.5, i);
      K.R(ctx, 0, 310, W, 770, 0, '#6b4a2b', 0); ctx.save(); ctx.globalAlpha = 0.85; ctx.fillStyle = '#2a6ab8'; const wl = 520 + Math.sin(a.t) * 8; ctx.fillRect(0, wl, W, H - wl); ctx.restore();
      ln(ctx, [[0, wl], [W, wl]], '#9fd8ff', 6); K.text(ctx, 'WATER TABLE', 960, wl - 34, { size: 40, color: '#ffffff' });
      K.R(ctx, 300, 640, 1320, 260, 40, '#3a3a44', 9); K.R(ctx, 340, 680, 1240, 180, 30, '#1a1a22', 0); K.R(ctx, 500 + ((a.t * 200) % 600), 700, 420, 140, 20, '#c9ccd6', 6);
      for (const x of [380, 1540]) { K.R(ctx, x - 40, 300, 80, 360, 10, '#ff9f1c', 6); for (let i = 0; i < 4; i++) K.C(ctx, x, 620 - ((a.t * 300 + i * 90) % 320), 14, '#7cd3ff', 3); } }, { de: 1, a: 1.05 });
    K.contador(ctx, a, '13,000,000 GALLONS / DAY', W / 2, 1000, { icono: 'reloj', size: 40, col: '#2a6ab8', p0: 0.3 }); K.etiqueta(ctx, a, 'NEW YORK SUBWAY', 960, 120, { size: 46, p0: 0.1 }); },
  // 39 — Las bombas necesitan electricidad: muere la red y el agua sube en silencio
  39: (ctx, a, K) => {
    K.camara(ctx, a, () => { SET.anden(ctx, a.t, { agua: 0.05 + 0.35 * ph(a, 0.25, 1), luces: fase(a) < 0.2 ? 1 : 0.35 });
      K.R(ctx, 120, 200, 260, 380, 20, '#ff9f1c', 8); K.R(ctx, 150, 240, 200, 120, 10, '#0b0b12', 5); K.text(ctx, fase(a) < 0.2 ? 'ON' : 'OFF', 250, 310, { size: 56, color: fase(a) < 0.2 ? '#4dff88' : '#ff3b4e' });
      ctx.save(); ctx.translate(250, 470); ctx.rotate(fase(a) < 0.2 ? a.t * 8 : 1.6 * 8 * 0.2); for (let j = 0; j < 4; j++) { ctx.rotate(Math.PI / 2); K.E(ctx, 0, -40, 18, 40, '#c9ccd6', 0, 5); } ctx.restore(); }, { de: 1, a: 1.1, foco: [960, 700] });
    K.rotulo(ctx, a, 'Quietly, in the dark, under your feet', W / 2, 1000, { size: 40, p0: 0.4 }); K.luz(ctx, a, { tono: 'noche', foco: [960, 700] }); },
  // 40 — Algunos cálculos: partes de los túneles se inundarían en unas 36 horas
  40: (ctx, a, K) => {
    sky(ctx, '#0a1530', '#152a50'); const k = ph(a, 0.05, 0.9);
    for (let i = 0; i < 3; i++) { const y = 200 + i * 280; K.R(ctx, 160, y, 1200, 200, 100, '#3a3a44', 9); ctx.save(); ctx.beginPath(); ctx.roundRect(170, y + 10, 1180, 180, 90); ctx.clip(); ctx.fillStyle = '#2a6ab8'; const lvl = Math.min(1, k * 1.4 - i * 0.2); ctx.fillRect(170, y + 190 - 180 * Math.max(0, lvl), 1180, 180); ctx.restore(); }
    const hrs = Math.round(36 * k); K.R(ctx, 1440, 360, 380, 300, 30, '#ffffff', 9); ctx.fillStyle = '#ff3b4e'; ctx.font = '900 150px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(hrs), 1630, 480); ctx.fillStyle = INK; ctx.font = '900 46px Poppins'; ctx.fillText('HOURS', 1630, 600);
    K.etiqueta(ctx, a, 'A DAY AND A HALF', 1630, 760, { size: 44, p0: 0.7 }); K.luz(ctx, a, { tono: 'noche' }); },
  // 41 — Piénsalo: 36 horas de silencio a un subsuelo inundado; el suelo de arriba empieza a hundirse
  41: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { sky(ctx, '#c9d6e6', '#e6eef7', 560); for (let i = 0; i < 5; i++) edificio(K, ctx, 80 + i * 380, 560, 300, 300, '#5a5f73', 0.1, i);
      K.R(ctx, 0, 560, W, 80, 0, '#8a8d99', 6); K.R(ctx, 0, 640, W, 440, 0, '#2a6ab8', 0); K.R(ctx, 300, 700, 1320, 200, 60, '#1f4f8a', 0);
      const k = ph(a, 0.3, 0.9); ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(700, 560); for (let i = 1; i <= 6; i++) ctx.lineTo(700 + i * 90 * k, 560 + (i % 2 ? 20 : 50) * k); ctx.stroke(); ctx.restore();
      ctx.save(); ctx.translate(0, 20 * k); D(K, ctx, a, YOU, 960, 580, 0.6, { pose: 'miedo', mood: 'miedo' }); ctx.restore(); }, { de: 1, a: 1.08 });
    K.contador(ctx, a, '36 HOURS', W / 2, 100, { icono: 'reloj', size: 42, col: '#ff3b4e' }); },
  // 42 — Arriba, la lluvia hace el resto: canalones atascados, tejados con goteras, plantas en cada grieta
  42: (ctx, a, K) => {
    K.camara(ctx, a, () => { SET.calle(ctx, a.t, { hora: 'dia' }); ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = '#4a5a70'; ctx.fillRect(0, 0, W, H); ctx.restore();
      ctx.save(); ctx.strokeStyle = 'rgba(200,220,255,0.7)'; ctx.lineWidth = 4; for (let i = 0; i < 120; i++) { const x = (hs(i) * W + a.t * 200) % W, y = (hs(i * 3) * H + a.t * 900) % H; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 12, y + 40); ctx.stroke(); } ctx.restore();
      const k = ph(a, 0.2, 0.9); for (let i = 0; i < 12; i++) { const x = 80 + i * 160, h = 40 + 140 * k * hs(i); ctx.save(); ctx.strokeStyle = '#3f9150'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(x, 1000); ctx.quadraticCurveTo(x + 20, 1000 - h / 2, x - 10, 1000 - h); ctx.stroke(); ctx.restore(); K.E(ctx, x - 10, 1000 - h, 26 * (0.5 + k), 14 * (0.5 + k), '#4fb062', 0.4, 4); }
      for (const x of [520, 1300]) for (let i = 0; i < 3; i++) K.E(ctx, x, 450 + ((a.t * 300 + i * 90) % 400), 8, 14, '#9fd8ff', 0, 3); }, { de: 1, a: 1.06 });
    K.rotulo(ctx, a, 'Plants push through every crack', W / 2, 1000, { size: 40, p0: 0.4 }); },
  // 43 — En años, árboles atraviesan aceras; en décadas, puentes oxidados y edificios que caen
  43: (ctx, a, K) => {
    const k = ph(a, 0.05, 0.95); K.camara(ctx, a, () => { if (k < 0.5) SET.bloques(ctx, a.t, { ruina: 0.4 + k }); else SET.puente(ctx, a.t, { rust: 0.5 + k * 0.5, roto: (k - 0.5) * 2 }); }, { de: 1, a: 1.08 });
    K.contador(ctx, a, k < 0.5 ? 'A FEW YEARS' : 'DECADES', W / 2, 110, { icono: 'reloj', size: 46, col: '#ff3b4e' }); K.luz(ctx, a, { tono: k < 0.5 ? 'dia' : 'atardecer' }); },
  // 44 — Alan Weisman, «The World Without Us»: las ciudades se degradan mucho más rápido de lo que creemos
  44: (ctx, a, K) => {
    K.camara(ctx, a, () => { SET.despacho(ctx, a.t, { hora: 'atardecer' });
      ctx.save(); ctx.translate(960, 600); ctx.rotate(-0.06 + Math.sin(a.t) * 0.02); K.R(ctx, -230, -320, 460, 640, 14, '#2e4a3a', 10); K.R(ctx, -230, -320, 40, 640, 6, '#1f3328', 6);
      ctx.fillStyle = '#f6eedc'; ctx.font = '900 54px Anton'; ctx.textAlign = 'center'; ['THE', 'WORLD', 'WITHOUT', 'US'].forEach((w, i) => ctx.fillText(w, 20, -170 + i * 70)); ctx.font = '600 30px Poppins'; ctx.fillText('Alan Weisman', 20, 250);
      ctx.strokeStyle = '#3f9150'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(-150, 180); ctx.quadraticCurveTo(-60, 100, 0, 170); ctx.quadraticCurveTo(80, 230, 150, 150); ctx.stroke(); ctx.restore();
      K.etiqueta(ctx, a, 'CITIES DECAY FAST', 1500, 300, { size: 46, p0: 0.5, rot: 0.06 }); }, { de: 1.15, a: 1, foco: [960, 600] });
    K.luz(ctx, a, { tono: 'interior', foco: [960, 500] }); },
  // 45 — ¿El horizonte perfecto de las pelis? Una foto que dura días, no años (foto que se arruga)
  45: (ctx, a, K) => {
    sky(ctx, '#2a2238', '#433758'); const k = ph(a, 0.4, 0.95);
    ctx.save(); ctx.translate(960, 540); ctx.rotate(-0.05 + k * 0.2); ctx.scale(1 - k * 0.3, 1 - k * 0.3); ctx.globalAlpha = 1 - k * 0.4;
    K.R(ctx, -600, -380, 1200, 760, 10, '#ffffff', 10); ctx.save(); ctx.beginPath(); ctx.rect(-570, -350, 1140, 600); ctx.clip(); ctx.translate(-960 * 0.6 - 0, -540 * 0.6 + 40); ctx.scale(0.6, 0.6); ctx.translate(-0, 0); sky(ctx, '#8ec9ff', '#e6f4ff'); skyline(K, ctx, a, 1000, 0.2, 21); ctx.restore();
    ctx.fillStyle = INK; ctx.font = '900 54px Anton'; ctx.textAlign = 'center'; ctx.fillText('A SNAPSHOT', 0, 330); ctx.restore();
    K.contador(ctx, a, 'DAYS, NOT YEARS', W / 2, 1010, { icono: 'reloj', size: 44, col: '#ff3b4e', p0: 0.45 }); },
  // 46 — Y aun así, nada de esto es el mayor peligro: el siguiente mito es al revés (signo de peligro)
  46: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { sky(ctx, '#2a0a14', '#5a1428'); K.radial(ctx, 1200, 460, 600, '#ff3b4e', 0.4); suelo(ctx, 920, '#3a1020', '#1a0610');
      const s = 1 + Math.sin(a.t * 6) * 0.04; ctx.save(); ctx.translate(1200, 480); ctx.scale(s, s); K.P(ctx, [[0, -300], [300, 220], [-300, 220]], '#ffd93d', 12); ctx.fillStyle = INK; ctx.font = '900 300px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('!', 0, 60); ctx.restore();
      const y = D(K, ctx, a, YOU, 520, 980, 1.0, { pose: 'miedo', mood: 'miedo', mira: 1 }); K.simbolo(ctx, a, y.cabeza, y.hr, '!', 0.2); }, { de: 1, a: 1.12, temblor: 0.25 });
    K.etiqueta(ctx, a, 'THE BIGGEST DANGER', 1200, 900, { size: 50, p0: 0.3 }); },
});

// --- Espacio ---
function estacion(K, ctx, x, y, s = 1, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  for (const sx of [-1, 1]) for (const k of [0, 1]) { const px = sx * (260 + k * 190); K.R(ctx, px - 80, -170, 160, 120, 4, '#2a4a8a', 6); K.R(ctx, px - 80, 50, 160, 120, 4, '#2a4a8a', 6); for (let i = 1; i < 4; i++) { ln(ctx, [[px - 80 + i * 40, -170], [px - 80 + i * 40, -50]], '#6a9ae0', 3); ln(ctx, [[px - 80 + i * 40, 50], [px - 80 + i * 40, 170]], '#6a9ae0', 3); } ln(ctx, [[px, -50], [px, 50]], '#8a8d99', 8); }
  K.R(ctx, -560, -16, 1120, 32, 8, '#c9ccd6', 6); K.R(ctx, -150, -60, 300, 120, 40, '#e6e8ee', 8); K.R(ctx, -40, -150, 80, 300, 30, '#d4d6de', 7); K.C(ctx, 0, 0, 36, '#bfe6ff', 6); ctx.restore(); }
function capsula(K, ctx, x, y, s = 1, para = 0, fuego = 0, t = 0) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (para > 0) { const r = 260 * para; ln(ctx, [[-70, -80], [-r * 0.9, -260 - 80 * para]], '#ffffff', 4); ln(ctx, [[70, -80], [r * 0.9, -260 - 80 * para]], '#ffffff', 4); ln(ctx, [[0, -100], [0, -330 - 80 * para]], '#ffffff', 4);
    ctx.save(); ctx.translate(0, -260 - 80 * para); for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-r + (i * 2 * r) / 6, 0); ctx.quadraticCurveTo(-r + ((i + 0.5) * 2 * r) / 6, -r * 0.9 * Math.sin(Math.PI * (i + 0.5) / 6), -r + ((i + 1) * 2 * r) / 6, 0); ctx.lineTo(0, 0); ctx.closePath(); ctx.fillStyle = i % 2 ? '#ffffff' : '#ff6b35'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.stroke(); } ctx.restore(); }
  if (fuego) { K.radial(ctx, 0, 90, 200 * fuego, '#ff9f1c', 0.9); K.P(ctx, [[-100, 60], [0, 60 + 160 * fuego + Math.sin(t * 30) * 20], [100, 60]], '#ffd93d', 5); }
  K.P(ctx, [[-50, -110], [50, -110], [110, 60], [-110, 60]], '#e6e8ee', 9); K.R(ctx, -120, 50, 240, 34, 14, '#5a3a2a', 7); K.C(ctx, 0, -30, 26, '#bfe6ff', 6); ctx.restore(); }
function casco(K, ctx, y) { if (!y || !y.cabeza) return; K.C(ctx, y.cabeza[0], y.cabeza[1], y.hr * 1.45, 'rgba(190,230,255,0.28)', 7); K.E(ctx, y.cabeza[0] - y.hr * 0.6, y.cabeza[1] - y.hr * 0.7, y.hr * 0.25, y.hr * 0.12, 'rgba(255,255,255,0.7)', -0.6, 0); }
function balon(K, ctx, x, y, s = 1, t = 0) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); K.C(ctx, 0, 0, 80, '#f6f1e4', 8); ctx.strokeStyle = '#c9b89a'; ctx.lineWidth = 6; for (const r of [-0.6, 0.5, 1.6]) { ctx.beginPath(); ctx.ellipse(0, 0, 80, 34, r, -1.2, 1.2); ctx.stroke(); }
  ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-34, -22); ctx.lineTo(-26, 30); ctx.moveTo(26, -22); ctx.lineTo(30, 28); ctx.moveTo(-40, 40); ctx.quadraticCurveTo(0, 62, 40, 40); ctx.stroke(); ctx.restore(); }

// ===================== CAPÍTULO 5 · THE REAL DANGER =====================
Object.assign(A, {
  // 47 — Mito 5: el peligro son los animales salvajes (león, lobo, oso en un centro comercial)
  47: (ctx, a, K) => { const { YOU } = cast(K);
    peli(K, ctx, a, () => K.camara(ctx, a, () => { SET.plaza(ctx, a.t, { ruina: 0.4 }); K.prop(ctx, 'leon', 1300, 820, 1.1, a.t); K.prop(ctx, 'oso', 1650, 800, 1.0, a.t);
      D(K, ctx, a, YOU, 500, 1000, 1.0, { pose: 'miedo', mood: 'miedo', mira: 1 }); K.etiqueta(ctx, a, 'ROAR!', 1350, 520, { size: 60, p0: 0.3, rot: -0.1 }); }, { de: 1, a: 1.1, temblor: 0.2 }));
    mito(K, ctx, a, 5, 'The danger is wild animals'); },
  // 48 — Hollywood: zoológicos vacíos, depredadores por el centro, tú escondido en un edificio
  48: (ctx, a, K) => { const { YOU } = cast(K);
    peli(K, ctx, a, () => K.camara(ctx, a, () => { SET.calle(ctx, a.t, { hora: 'noche' }); const x = lerpN(1900, 300, fase(a)); K.prop(ctx, 'leon', x, 960, 0.9, a.t);
      K.R(ctx, 1180, 560, 260, 200, 10, '#1a1a22', 8); ctx.save(); ctx.beginPath(); ctx.rect(1190, 570, 240, 180); ctx.clip(); D(K, ctx, a, YOU, 1310, 900, 0.8, { pose: 'miedo', mood: 'miedo', mira: -1 }); ctx.restore();
      K.cartel(ctx, a, 'ZOO', 260, 400, {}); }, { de: 1, a: 1.06 }), 'PREDATORS DOWNTOWN!'); K.luz(ctx, a, { tono: 'noche' }); },
  // 49 — Realidad: muchas mascotas y animales de zoo no sobrevivirían; los salvajes evitan a los humanos
  49: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { SET.bosque(ctx, a.t, {}); const x = lerpN(1200, 1800, ph(a, 0.3, 0.9)); D(K, ctx, a, YOU, 560, 1000, 1.0, { pose: 'saluda', mood: 'feliz', mira: 1 });
      ctx.save(); ctx.translate(x, 0); ctx.scale(-1, 1); ctx.translate(-x, 0); K.prop(ctx, 'oso', x, 860, 0.8, a.t); ctx.restore(); K.etiqueta(ctx, a, 'NOPE', x, 560, { size: 54, p0: 0.35 }); }, { de: 1, a: 1.06 });
    realidad(K, ctx, a, 1600, 170); K.rotulo(ctx, a, 'Wild animals avoid people', W / 2, 1000, { size: 40, p0: 0.3 }); K.luz(ctx, a, { tono: 'dia' }); },
  // 50 — Los peligros reales son aburridos: corte infectado, intoxicación, tobillo roto, sin médico
  50: (ctx, a, K) => {
    sky(ctx, '#f4f1ea', '#e6e0d2'); const items = [['herida', 'INFECTED CUT'], ['bacteria', 'FOOD POISONING'], ['escombros', 'BROKEN ANKLE'], ['telefono_antiguo', 'NO DOCTOR']];
    items.forEach(([p, t], i) => { const k = K.clamp((fase(a) - i * 0.15) / 0.12), x = 270 + i * 460; if (k <= 0) return; ctx.save(); ctx.translate(x, 540); ctx.scale(sm(k), sm(k)); K.R(ctx, -200, -280, 400, 520, 30, '#ffffff', 9); K.prop(ctx, p, 0, -60, 0.9, a.t); ctx.restore(); K.etiqueta(ctx, a, t, x, 900, { size: 40, p0: i * 0.15 + 0.08 }); });
    K.rotulo(ctx, a, 'The real hazards are boring', W / 2, 120, { size: 44 }); },
  // 51 — Una pequeña herida puede ser mortal: no hay ambulancia ni hospital
  51: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { SET.suburbio(ctx, a.t, { ruina: 0.6 }); const y = D(K, ctx, a, YOU, 860, 1000, 1.05, { pose: 'llora', mood: 'llora', mira: 1 }); if (y.manoD) K.prop(ctx, 'herida', y.manoD[0], y.manoD[1], 0.35, a.t);
      ctx.save(); ctx.translate(1450, 900); K.R(ctx, -200, -170, 400, 170, 20, '#f4f4f8', 8); K.R(ctx, -60, -150, 120, 40, 6, '#ff3b4e', 0); K.R(ctx, -20, -190, 40, 120, 6, '#ff3b4e', 0); K.C(ctx, -120, 0, 40, '#333', 7); K.C(ctx, 120, 0, 40, '#333', 7); ctx.globalAlpha = 0.45; ctx.fillStyle = '#5a5a5a'; ctx.fillRect(-210, -200, 420, 240); ctx.restore();
      sello(K, ctx, a, 'NO AMBULANCE', 1450, 560, { p0: 0.4, size: 64 }); }, { de: 1, a: 1.08 }); K.luz(ctx, a, { tono: 'tension' }); },
  // 52 — Pero la mayor amenaza es el silencio: la soledad
  52: (ctx, a, K) => { const { YOU } = cast(K);
    const k = ph(a, 0, 1); sky(ctx, '#1a1a2a', '#2a2a40'); K.radial(ctx, 960, 760, 420 - 200 * k, '#9ab0ff', 0.25);
    ctx.save(); ctx.translate(960, 760); ctx.scale(1 - 0.5 * k, 1 - 0.5 * k); D(K, ctx, a, YOU, 0, 200, 1.0, { pose: 'sentado', mood: 'triste' }); ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.85; ctx.fillStyle = '#ffffff'; ctx.font = '900 150px Anton'; ctx.textAlign = 'center'; ctx.fillText('SILENCE', 960, 300); ctx.restore(); K.etiqueta(ctx, a, 'LONELINESS', 960, 420, { size: 52, p0: 0.5 }); },
  // 53 — Los humanos son sociales; el aislamiento cambia el cuerpo (cerebro y corazón alterados)
  53: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { sky(ctx, '#283044', '#3a4560'); suelo(ctx, 960, '#2a3040', '#151a24'); const y = D(K, ctx, a, YOU, 960, 960, 1.2, { pose: 'quieto', mood: 'triste' });
      ctx.save(); ctx.globalAlpha = 0.9; K.prop(ctx, 'cerebro', 600, 380, 0.7, a.t); K.prop(ctx, 'corazon', 1320, 520, 0.6 + Math.sin(a.t * 6) * 0.03, a.t); ctx.restore();
      ln(ctx, [[680, 420], [y.cabeza[0] - 60, y.cabeza[1]]], '#ffd93d', 6); ln(ctx, [[1260, 540], [1010, 640]], '#ffd93d', 6);
      ['STRESS', 'SLEEP', 'IMMUNE'].forEach((t, i) => K.etiqueta(ctx, a, t, 400 + i * 560, 860 - (i % 2) * 60, { size: 40, p0: 0.3 + i * 0.12 })); }, { de: 1.1, a: 1 });
    K.rotulo(ctx, a, 'Isolation changes your body', W / 2, 1010, { size: 40, p0: 0.1 }); },
  // 54 — El aislamiento se asocia a riesgos comparables a fumar 15 cigarrillos al día
  54: (ctx, a, K) => {
    sky(ctx, '#2a1a20', '#4a2a30'); K.text(ctx, 'LONELINESS', 520, 320, { size: 80, color: '#ffffff' }); ctx.fillStyle = '#ffd93d'; ctx.font = '900 140px Anton'; ctx.textAlign = 'center'; ctx.fillText('≈', 960, 380);
    for (let i = 0; i < 15; i++) { const k = K.clamp((fase(a) - i * 0.04) / 0.08); if (k <= 0) continue; const x = 1150 + (i % 5) * 130, y = 260 + Math.floor(i / 5) * 140; ctx.save(); ctx.translate(x, y); ctx.scale(k, k); K.R(ctx, -14, -60, 28, 120, 6, '#ffffff', 5); K.R(ctx, -14, 30, 28, 30, 4, '#ff9f1c', 4); ctx.restore(); K.smoke(ctx, x, y - 70, a.t + i, 2, 'rgba(200,200,200,0.4)'); }
    K.contador(ctx, a, '15 CIGARETTES A DAY', W / 2, 820, { icono: 'reloj', size: 50, col: '#ff3b4e', p0: 0.6 }); K.rotulo(ctx, a, 'Studies link isolation to big health risks', W / 2, 960, { size: 38, p0: 0.3 }); },
  // 55 — Enfermedad cardíaca, depresión, mal sueño, muerte prematura
  55: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { SET.dormitorio(ctx, a.t, { hora: 'noche' }); K.prop(ctx, 'cama', 900, 900, 1.2, a.t); D(K, ctx, a, YOU, 900, 860, 0.9, { pose: 'sentado', mood: 'cansado' }); K.prop(ctx, 'reloj_digital', 1450, 560, 0.7, a.t);
      ['HEART DISEASE', 'DEPRESSION', 'BAD SLEEP', 'EARLY DEATH'].forEach((t, i) => K.etiqueta(ctx, a, t, i % 2 ? 1500 : 380, 260 + i * 130, { size: 42, p0: 0.1 + i * 0.15, rot: i % 2 ? 0.05 : -0.05, col: i === 3 ? '#ff3b4e' : undefined })); }, { de: 1, a: 1.08 });
    K.luz(ctx, a, { tono: 'noche', foco: [900, 700] }); },
  // 56 — Hay una razón por la que el náufrago de la peli habla con una pelota de vóley (pelota genérica)
  56: (ctx, a, K) => { const { ACT } = cast(K);
    peli(K, ctx, a, () => K.camara(ctx, a, () => { SET.playa(ctx, a.t, {}); const p = { ...ACT, barba: true, ropa: '#c9b89a' }; D(K, ctx, a, p, 760, 1000, 1.05, { pose: 'habla', mood: 'feliz', mira: 1 });
      balon(K, ctx, 1180, 880, 1, a.t); K.globo(ctx, a, 'You get me, buddy.', 820, 380, { tx: 820, ty: 560, size: 46, p0: 0.15 }); }, { de: 1, a: 1.08 }), 'CASTAWAY MOVIE'); },
  // 57 — Los supervivientes reales crean rutinas: despertar igual, diario, ejercicio, leer, construir
  57: (ctx, a, K) => { const { YOU } = cast(K);
    const acts = [['quieto', 'WAKE 7:00', 'reloj_digital'], ['sostiene', 'JOURNAL', 'carta'], ['salta', 'EXERCISE', null], ['sentado', 'READ', null], ['empuja', 'BUILD', 'escombros']]; const i = Math.min(4, Math.floor(fase(a) * 5));
    K.camara(ctx, a, () => { SET.salon(ctx, a.t, { hora: 'dia' }); const [pose, t, pr] = acts[i]; D(K, ctx, a, YOU, 860, 1000, 1.05, { pose, mood: 'feliz', mira: 1 }); if (pr) K.prop(ctx, pr, 1250, 760, 0.6, a.t);
      acts.forEach(([, tt], j) => { K.R(ctx, 210 + j * 320, 110, 280, 80, 16, j === i ? '#20c060' : j < i ? '#9ad8ae' : '#ffffff', 6); ctx.fillStyle = INK; ctx.font = '900 34px Poppins'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(tt, 350 + j * 320, 152); }); }, { de: 1, a: 1.04 });
    K.luz(ctx, a, { tono: 'dia' }); },
  // 58 — Sobrevivir no es solo comida y refugio: es seguir siendo humano
  58: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { SET.montes(ctx, a.t, {}); K.radial(ctx, 960, 700, 500, '#ffd93d', 0.35); K.prop(ctx, 'fuego', 1180, 940, 0.8, a.t); D(K, ctx, a, YOU, 860, 1000, 1.0, { pose: 'sentado', mood: 'feliz', mira: 1 }); }, { de: 1.1, a: 1, foco: [960, 800] });
    K.rotulo(ctx, a, 'Staying human', W / 2, 220, { size: 60, p0: 0.2 }); K.luz(ctx, a, { tono: 'atardecer', foco: [1000, 860] }); },
  // 59 — Grita en una plaza vacía y solo responde tu eco
  59: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { SET.plaza(ctx, a.t, { ruina: 0.6 }); const y = D(K, ctx, a, YOU, 960, 1000, 1.0, { pose: 'llama', mood: 'triste' });
      for (let i = 0; i < 4; i++) { const r = ((a.t * 260 + i * 220) % 900); ctx.save(); ctx.globalAlpha = Math.max(0, 1 - r / 900); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(y.cabeza[0], y.cabeza[1], r, 0, 7); ctx.stroke(); ctx.restore(); }
      K.globo(ctx, a, 'HELLO?!', 960, 300, { size: 60, p0: 0.05, grito: true }); ['hello...', 'hello..', 'hello.'].forEach((t, i) => K.text(ctx, t, 400 + i * 560, 380 + i * 60, { size: 46, color: `rgba(255,255,255,${0.8 - i * 0.25})`, k: ph(a, 0.3 + i * 0.15, 0.45 + i * 0.15) })); }, { de: 1.15, a: 1, foco: [960, 700] });
    K.luz(ctx, a, { tono: 'atardecer', vineta: 0.6 }); },
});

// ===================== CAPÍTULO 6 · THE TWIST =====================
Object.assign(A, {
  // 60 — «Te he estado engañando»: guiño a cámara
  60: (ctx, a, K) => { const { YOU } = cast(K); sky(ctx, '#1d1440', '#3a2470');
    K.camara(ctx, a, () => { sky(ctx, '#1d1440', '#3a2470'); K.radial(ctx, 960, 540, 600, '#ff6bd6', 0.3); const y = D(K, ctx, a, YOU, 960, 1300, 1.9, { pose: 'senala', mood: 'risa', mira: 0 }); K.simbolo(ctx, a, y.cabeza, y.hr, '!', 0.2); }, { de: 1.2, a: 1, foco: [960, 400] });
    K.rotulo(ctx, a, "I've been tricking you", W / 2, 1000, { size: 52, p0: 0.15 }); },
  // 61 — El último humano ≠ la última persona EN la Tierra (pizarra con subrayado)
  61: (ctx, a, K) => {
    sky(ctx, '#20302a', '#2a3a32'); K.R(ctx, 160, 140, 1600, 760, 20, '#2e4a3a', 12); ctx.fillStyle = '#f6eedc'; ctx.font = '900 96px Anton'; ctx.textAlign = 'center'; ctx.fillText('LAST HUMAN', 960, 380); ctx.fillText('LAST PERSON ON EARTH', 960, 700);
    ctx.fillStyle = '#ffd93d'; ctx.fillText('=', 960, 545); ln(ctx, [[1000, 450], [920, 600]], '#ffd93d', 14); const k = ph(a, 0.4, 0.7); ln(ctx, [[1170, 730], [1170 + 360 * k, 730]], '#ff6b6b', 12); K.C(ctx, 1310, 665, 110 * k, 'rgba(0,0,0,0)', 0);
    if (k > 0) { ctx.save(); ctx.strokeStyle = '#ff6b6b'; ctx.lineWidth = 9; ctx.beginPath(); ctx.ellipse(1330, 665, 130, 70, 0, 0, 7 * k); ctx.stroke(); ctx.restore(); } },
  // 62 — Ahora mismo, unas 10 personas orbitan en dos estaciones espaciales
  62: (ctx, a, K) => { const { AST1, AST2, AST3 } = cast(K);
    K.camara(ctx, a, () => { SET.espacio(ctx, a.t, {}); K.prop(ctx, 'tierra', 960, 1750, 3.2, a.t); estacion(K, ctx, 960, 380, 0.9, Math.sin(a.t * 0.4) * 0.05);
      [AST1, AST2, AST3].forEach((p, i) => { const y = D(K, ctx, a, p, 520 + i * 440, 820 + Math.sin(a.t * 1.5 + i) * 20, 0.6, { pose: 'saluda', mood: 'feliz', mira: 0 }); casco(K, ctx, y); }); }, { de: 1, a: 1.08 });
    K.contador(ctx, a, '~10 PEOPLE IN ORBIT', W / 2, 110, { icono: 'loop', size: 44, col: '#4d96ff', p0: 0.3 }); },
  // 63 — A unos 400 km (250 millas), dando la vuelta cada 90 minutos
  63: (ctx, a, K) => {
    SET.espacio(ctx, a.t, {}); K.C(ctx, 960, 560, 230, '#3a86e0', 10); K.E(ctx, 880, 480, 90, 60, '#4fb062', 0.3, 6); K.E(ctx, 1060, 640, 70, 90, '#4fb062', -0.2, 6); K.E(ctx, 900, 700, 50, 30, '#4fb062', 0, 5); ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.setLineDash([16, 14]); ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(960, 560, 480, 300, -0.2, 0, 7); ctx.stroke(); ctx.restore();
    const an = a.t * 1.6; estacion(K, ctx, 960 + Math.cos(an) * 480 * Math.cos(-0.2) - Math.sin(an) * 300 * Math.sin(-0.2), 560 + Math.cos(an) * 480 * Math.sin(-0.2) + Math.sin(an) * 300 * Math.cos(-0.2), 0.26, an);
    K.etiqueta(ctx, a, '250 MILES UP', 360, 220, { size: 46, p0: 0.15 }); K.contador(ctx, a, 'EVERY 90 MIN', 1560, 900, { icono: 'reloj', size: 46, col: '#4d96ff', p0: 0.35 }); },
  // 64 — Cápsulas para traerlos: Soyuz, Dragon, Shenzhou
  64: (ctx, a, K) => {
    SET.espacio(ctx, a.t, {}); ['SOYUZ', 'DRAGON', 'SHENZHOU'].forEach((t, i) => { const k = K.clamp((fase(a) - i * 0.15) / 0.15); capsula(K, ctx, 420 + i * 540, lerpN(-200, 560, sm(k)) + Math.sin(a.t * 2 + i) * 10, 1.4, 0, 0, a.t); K.etiqueta(ctx, a, t, 420 + i * 540, 820, { size: 46, p0: i * 0.15 + 0.12 }); });
    K.rotulo(ctx, a, 'Ride home is docked and ready', W / 2, 1000, { size: 40, p0: 0.5 }); },
  // 65 — Vuelan casi solas; paracaídas y retrocohetes las posan en tierra
  65: (ctx, a, K) => {
    const k = ph(a, 0, 1); K.camara(ctx, a, () => { SET.cielo(ctx, a.t, {}); suelo(ctx, 960, '#c2a27a', '#8a6a4a'); const y = lerpN(260, 820, k), f = k > 0.85 ? 1 : 0; capsula(K, ctx, 960, y, 1.2, Math.min(1, k * 3), f, a.t); if (f) K.smoke(ctx, 960, 960, a.t, 6, 'rgba(220,200,170,0.6)'); }, { de: 1, a: 1.06 });
    K.etiqueta(ctx, a, 'MOSTLY AUTOMATIC', 400, 200, { size: 46, p0: 0.15 }); K.etiqueta(ctx, a, 'PARACHUTES', 1500, 260, { size: 44, p0: 0.35 }); },
  // 66 — Tú, bajo un cielo negro, ves un punto brillante deslizándose
  66: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { nocheCielo(ctx, a, 800, 7); suelo(ctx, 800, '#14122a', '#07060f'); skyline(K, ctx, a, 800, 0, 5);
      const x = lerpN(200, 1700, fase(a)), y = 260 - Math.sin(fase(a) * Math.PI) * 80; K.radial(ctx, x, y, 60, '#ffffff', 0.8); K.C(ctx, x, y, 9, '#ffffff', 0); ln(ctx, [[x - 160, y + 20], [x - 20, y + 2]], 'rgba(255,255,255,0.25)', 6);
      D(K, ctx, a, YOU, 960, 1060, 1.0, { espalda: true, pose: 'senala' }); }, { de: 1.1, a: 1, foco: [960, 500] });
    K.luz(ctx, a, { tono: 'noche', vineta: 0.5 }); },
  // 67 — No parpadea como un avión; es de los objetos más brillantes del cielo
  67: (ctx, a, K) => {
    nocheCielo(ctx, a, H, 9); const p = Math.floor(a.t * 3) % 2; ctx.save(); ctx.translate(560, 540); K.radial(ctx, 0, 0, 40, '#ff3b4e', p ? 0.9 : 0.1); K.C(ctx, 0, 0, 10, p ? '#ff3b4e' : '#3a1020', 0); K.radial(ctx, 70, 0, 40, '#4dff88', p ? 0.1 : 0.9); K.C(ctx, 70, 0, 10, '#4dff88', 0); ctx.restore();
    K.radial(ctx, 1360, 540, 140, '#ffffff', 0.9); K.C(ctx, 1360, 540, 18, '#ffffff', 0);
    K.etiqueta(ctx, a, 'PLANE: BLINKS', 600, 760, { size: 46, p0: 0.1 }); K.etiqueta(ctx, a, 'STATION: STEADY & BRIGHT', 1360, 760, { size: 46, p0: 0.35 }); },
  // 68 — Ese punto son personas mirándote a ti; quizá bajando ya
  68: (ctx, a, K) => { const { AST1, AST2 } = cast(K);
    K.camara(ctx, a, () => { sky(ctx, '#0a0c22', '#1a1840'); estrellas(ctx, a, 80, H, 3); K.R(ctx, 360, 160, 1200, 720, 300, '#d4d6de', 14); K.C(ctx, 960, 520, 300, '#0a1530', 10); ctx.save(); ctx.beginPath(); ctx.arc(960, 520, 290, 0, 7); ctx.clip(); K.prop(ctx, 'tierra', 960, 640, 1.2, a.t); ctx.restore();
      const y1 = D(K, ctx, a, AST1, 560, 1100, 1.1, { pose: 'senala', mood: 'sorpresa', mira: 1 }); casco(K, ctx, y1); const y2 = D(K, ctx, a, AST2, 1380, 1100, 1.1, { pose: 'saluda', mood: 'feliz', mira: -1 }); casco(K, ctx, y2);
      K.globo(ctx, a, 'Someone is down there!', 960, 150, { size: 44, p0: 0.3 }); }, { de: 1, a: 1.08 }); },
  // 69 — La última persona en la Tierra quizá no esté sola mucho tiempo (cápsula aterrizando cerca)
  69: (ctx, a, K) => { const { YOU, AST3 } = cast(K);
    K.camara(ctx, a, () => { SET.sabana(ctx, a.t, {}); const k = ph(a, 0, 0.6); capsula(K, ctx, 1400, lerpN(-200, 870, sm(k)), 0.9, k < 1 ? 1 : 0.6, 0, a.t);
      D(K, ctx, a, YOU, 560, 1000, 1.0, { pose: 'vitorea', mood: 'sorpresa', mira: 1 }); if (k >= 1) { const y = D(K, ctx, a, AST3, 1240, 1000, 0.85, { pose: 'saluda', mood: 'feliz', mira: -1 }); casco(K, ctx, y); } }, { de: 1, a: 1.08 });
    K.rotulo(ctx, a, 'Not alone for long', W / 2, 1010, { size: 44, p0: 0.6 }); K.luz(ctx, a, { tono: 'dia' }); },
  // 70 — Esta noche, mira arriba: alguien podría estar aterrizando para encontrarte
  70: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { SET.observatorio(ctx, a.t, {}); const x = lerpN(300, 1600, fase(a)); K.radial(ctx, x, 200, 50, '#ffffff', 0.8); K.C(ctx, x, 200, 8, '#ffffff', 0);
      D(K, ctx, a, YOU, 860, 1000, 1.0, { pose: 'senala', mood: 'feliz', mira: 1 }); }, { de: 1, a: 1.1 });
    K.rotulo(ctx, a, 'Tonight, look up', W / 2, 1000, { size: 56, p0: 0.2 }); K.luz(ctx, a, { tono: 'noche', vineta: 0.4 }); },
  // 71 — Comentarios: ¿qué mito te sorprendió más? ¿Ferrari o bicicleta?
  71: (ctx, a, K) => { const { YOU } = cast(K);
    sky(ctx, '#ffd93d', '#ff9f1c'); cocheDep(K, ctx, 520, 760, 0.85, '#e63946', a.t * 2); bici(K, ctx, 1420, 760, 1.6, a.t * 3);
    ctx.fillStyle = INK; ctx.font = '900 150px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('OR', 960, 600);
    D(K, ctx, a, YOU, 960, 1080, 0.7, { pose: 'piensa', mood: 'duda' }); K.rotulo(ctx, a, 'Which myth surprised you most?', W / 2, 150, { size: 52, p0: 0.1 }); K.etiqueta(ctx, a, 'TELL US IN THE COMMENTS', W / 2, 270, { size: 42, p0: 0.3 }); },
  // 72 — Siguiente vídeo: ¿y si la Luna desapareciera?
  72: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { nocheCielo(ctx, a, H, 4); const k = ph(a, 0.3, 0.8); ctx.save(); ctx.globalAlpha = 1 - k; K.prop(ctx, 'luna', 1300, 400, 1.2 * (1 - 0.4 * k), a.t); ctx.restore(); if (k > 0) K.etiqueta(ctx, a, '?', 1300, 400, { size: 120, p0: 0.5 });
      suelo(ctx, 900, '#1a1830', '#0a0918'); D(K, ctx, a, YOU, 560, 1000, 1.0, { pose: 'miedo', mood: 'sorpresa', mira: 1 }); }, { de: 1, a: 1.08 });
    K.rotulo(ctx, a, 'Next: What if the Moon disappeared?', W / 2, 140, { size: 50, p0: 0.15 }); },
});
