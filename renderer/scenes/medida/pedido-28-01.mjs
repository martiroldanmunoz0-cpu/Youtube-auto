// pedido-28-01 — "The Bloop: The Ocean Sound Nobody Could Explain" (Short vertical, estilo nuevo)
import { W, H, INK, V, clamp, sm, lerp, fase, ph, hs, fondo, D, cielo, ln, circ, caja, estrellas, titular, sello, tacha, temblor, anillos, onda, flecha } from '../../lib/corto.mjs';

let CAST = null;
function cast(K) {
  if (CAST) return CAST;
  const sin = { sombrero: null, corbata: null, barba: false, bigote: false };
  const [YOU, BOSS, GEEK, SCI] = K.reparto('pedido-28', 4, [
    { ...sin, estilo: 'limpio', pelo: 'corto', peloCol: '#2a1a10', ropa: '#3d5a80', gafas: true },
    { ...sin, estilo: 'gordito', pelo: 'calvo', ropa: '#6c757d', bigote: true, corbata: '#c1121f' },
    { ...sin, estilo: 'limpio', pelo: 'rizos', peloCol: '#1a120c', ropa: '#9b5de5' },
    { ...sin, estilo: 'limpio', pelo: 'coleta', peloCol: '#e0b04a', ropa: '#e63946' },
  ]);
  return (CAST = { YOU, BOSS, GEEK, SCI });
}
const SEA1 = '#0b3a5e', SEA2 = '#020c1c';
function mar(ctx, a, y0 = 0) { cielo(ctx, SEA1, SEA2, y0, H); ctx.save(); ctx.globalAlpha = 0.12; ctx.fillStyle = '#9fe3ff'; for (let i = 0; i < 5; i++) { const x = (hs(i) * W + a.t * 20) % W; ctx.beginPath(); ctx.moveTo(x - 40, y0); ctx.lineTo(x + 40, y0); ctx.lineTo(x + 200, H); ctx.lineTo(x - 120, H); ctx.fill(); } ctx.restore();
  ctx.save(); ctx.globalAlpha = 0.5; for (let i = 0; i < 40; i++) { const k = (a.t * 0.15 + hs(i + 7)) % 1; circ(ctx, hs(i) * W + Math.sin(a.t + i) * 10, H - k * (H - y0), 3 + hs(i + 2) * 5, 'rgba(200,240,255,0.5)', 0); } ctx.restore(); }
function cascos(ctx, x, y, r, vib = 0) { ctx.save(); ctx.translate(x + vib, y); ctx.strokeStyle = INK; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(0, 0, r * 1.15, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); caja(ctx, -r * 1.3, -r * 0.15, r * 0.4, r * 0.65, 12, '#2b2d42', 6); caja(ctx, r * 0.9, -r * 0.15, r * 0.4, r * 0.65, 12, '#2b2d42', 6); ctx.restore(); }
function pantalla(ctx, x, y, w, h, fn) { caja(ctx, x - 14, y - 14, w + 28, h + 28, 20, '#3a3f55', 8); ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, 10); ctx.clip(); ctx.fillStyle = '#04150c'; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(77,255,136,0.15)'; ctx.lineWidth = 2; for (let gx = x; gx < x + w; gx += 40) ln(ctx, [[gx, y], [gx, y + h]], 'rgba(77,255,136,0.12)', 2); for (let gy = y; gy < y + h; gy += 40) ln(ctx, [[x, gy], [x + w, gy]], 'rgba(77,255,136,0.12)', 2); fn(); ctx.restore(); }
function consola(ctx, a, K, y, { pico = null, amp = 1 } = {}) { caja(ctx, 40, y + 330, W - 80, 200, 24, '#5a6275', 8); for (let i = 0; i < 10; i++) circ(ctx, 110 + i * 90, y + 400, 16, ['#ff4d5e', '#ffd93d', '#4dff88'][i % 3], 5);
  pantalla(ctx, 120, y, W - 240, 300, () => onda(ctx, a, 120, y + 150, W - 240, 300, { amp, pico })); }
// Silueta genérica de tentáculos (no es un personaje concreto)
function tentaculos(ctx, a, x, y, s = 1, col = '#2a6a8c') { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = col; ctx.shadowColor = '#7fe0ff'; ctx.shadowBlur = 40;
  for (let i = 0; i < 6; i++) { const bx = -250 + i * 100, sw = Math.sin(a.t * 1.6 + i) * 60; ctx.beginPath(); ctx.moveTo(bx - 34, 0); ctx.bezierCurveTo(bx - 40 + sw, -200, bx + 60 - sw, -380, bx + sw * 1.5, -520 - i % 2 * 80); ctx.bezierCurveTo(bx + 40 - sw, -360, bx + 30 + sw, -200, bx + 34, 0); ctx.fill(); }
  ctx.beginPath(); ctx.ellipse(0, 60, 330, 160, 0, 0, 7); ctx.fill(); ctx.restore(); }
function ruinas(ctx, y, col = '#16324a') { ctx.save(); ctx.fillStyle = col; ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 4; for (let i = 0; i < 7; i++) { const x = 40 + i * 150, h = 160 + hs(i + 3) * 260; ctx.save(); ctx.translate(x, y); ctx.rotate((hs(i) - 0.5) * 0.25); ctx.fillRect(0, -h, 90, h); ctx.fillRect(-14, -h - 24, 118, 26); ctx.restore(); } ctx.restore(); }
function mapa(ctx, a, { sensores = [], origen = null, ondas = 0 } = {}) { cielo(ctx, '#2a6f97', '#1d4e6e', 0, H);
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 2; for (let x = 0; x < W; x += 90) ln(ctx, [[x, 0], [x, H]], 'rgba(255,255,255,0.1)', 2); for (let y = 0; y < H; y += 90) ln(ctx, [[0, y], [W, y]], 'rgba(255,255,255,0.1)', 2); ctx.restore();
  ctx.fillStyle = '#f2d49b'; ctx.strokeStyle = INK; ctx.lineWidth = 7; // Sudamérica esquemática
  ctx.beginPath(); ctx.moveTo(780, 380); ctx.bezierCurveTo(980, 420, 1060, 620, 960, 820); ctx.bezierCurveTo(900, 1000, 820, 1200, 760, 1500); ctx.bezierCurveTo(730, 1560, 700, 1520, 710, 1400); ctx.bezierCurveTo(690, 1100, 650, 800, 640, 560); ctx.bezierCurveTo(660, 440, 720, 380, 780, 380); ctx.fill(); ctx.stroke();
  if (origen) { anillos(ctx, a, origen[0], origen[1], { n: 4, r1: 900 * ondas + 100, col: 'rgba(255,217,61,0.9)', lw: 12, vel: 0.7 }); circ(ctx, origen[0], origen[1], 24, '#ff4d5e', 7); }
  for (const [x, y, on] of sensores) { caja(ctx, x - 26, y - 26, 52, 52, 10, on ? '#4dff88' : '#c9ccd6', 6); if (on) anillos(ctx, a, x, y, { n: 2, r1: 80, col: 'rgba(77,255,136,0.8)', lw: 6, vel: 1.5 }); } }

const PLANOS = {
  // 0 — El océano hizo un sonido que ningún animal podría: ondas desde el abismo, peces que huyen
  0: (ctx, a, K) => { temblor(ctx, a, 6 * ph(a, 0.3, 0.5), () => K.camara(ctx, a, () => { mar(ctx, a);
      anillos(ctx, a, W / 2, 1750, { n: 5, r1: 1500, col: 'rgba(160,230,255,0.7)', lw: 18, vel: 0.6 });
      for (let i = 0; i < 9; i++) { const k = sm(ph(a, 0.25, 0.9)), x = hs(i) * W + (hs(i) > 0.5 ? 1 : -1) * k * 700, y = 900 + hs(i + 4) * 600 - k * 300; ctx.save(); ctx.translate(x, y); ctx.scale(hs(i) > 0.5 ? 1 : -1, 1); ctx.fillStyle = ['#ffb703', '#fb8500', '#8ecae6'][i % 3]; ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(0, 0, 50, 26, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-44, 0); ctx.lineTo(-84, -26); ctx.lineTo(-84, 26); ctx.closePath(); ctx.fill(); ctx.stroke(); circ(ctx, 26, -6, 6, '#fff', 3); ctx.restore(); }
      K.prop(ctx, 'ballena', 280 - ph(a, 0.3, 1) * 400, 700, 0.9, a.t); }, { ...V, de: 1, a: 1.15, foco: [W / 2, 1300] }));
    titular(ctx, a, 'THE OCEAN', W / 2, 240, { size: 120, p0: 0.02 }); titular(ctx, a, 'MADE A SOUND', W / 2, 380, { size: 100, col: '#5ec8ff', p0: 0.2 }); sello(ctx, a, 'NO ANIMAL COULD', W / 2, 560, { p0: 0.6, size: 80 }); },
  // 1 — ¿Qué hizo el Bloop en 1997? onda gigante y signos de interrogación
  1: (ctx, a, K) => { K.camara(ctx, a, () => { mar(ctx, a); pantalla(ctx, 80, 700, W - 160, 500, () => onda(ctx, a, 80, 950, W - 160, 500, { pico: 0.5, amp: 0.4 + sm(ph(a, 0.2, 0.7)) * 0.8 }));
      for (let i = 0; i < 4; i++) { ctx.save(); ctx.globalAlpha = ph(a, 0.2 + i * 0.12, 0.3 + i * 0.12); ctx.font = '170px Anton'; ctx.fillStyle = '#ffd93d'; ctx.strokeStyle = INK; ctx.lineWidth = 12; ctx.textAlign = 'center'; const x = 150 + i * 260, y = 1450 + Math.sin(a.t * 3 + i) * 30; ctx.strokeText('?', x, y); ctx.fillText('?', x, y); ctx.restore(); } }, { ...V, de: 1.05, a: 1.12, foco: [W / 2, 950] });
    titular(ctx, a, 'WHAT MADE', W / 2, 240, { size: 110 }); titular(ctx, a, 'THE BLOOP?', W / 2, 380, { size: 150, col: '#5ec8ff', p0: 0.15 }); K.contador(ctx, a, '1997', W / 2, 560, { size: 60, p0: 0.3 }); },
  // 2 — 1997, eres analista de la NOAA escuchando submarinos soviéticos
  2: (ctx, a, K) => { const { YOU, BOSS } = cast(K);
    K.camara(ctx, a, () => { const gy = fondo(ctx, a, 'control', { hora: 'noche' }, { cx: 960 });
      pantalla(ctx, 140, 560, W - 280, 380, () => { ctx.save(); ctx.translate(W / 2, 750); ctx.strokeStyle = '#4dff88'; ctx.lineWidth = 3; for (let r = 60; r < 200; r += 60) { ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.stroke(); } ctx.rotate(a.t * 2); ctx.fillStyle = 'rgba(77,255,136,0.3)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 200, 0, 0.6); ctx.fill(); ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.5 + 0.5 * Math.sin(a.t * 4); K.prop(ctx, 'submarino', W / 2 + 110, 700, 0.35, a.t); ctx.restore(); });
      caja(ctx, 60, gy - 380, W - 120, 60, 16, '#5a6275', 7);
      const y = D(K, ctx, a, YOU, W / 2 - 120, gy, 1.5, { pose: 'sentado', mood: 'neutral', espalda: false, mira: 1 }); cascos(ctx, y.cabeza[0], y.cabeza[1], y.hr);
      D(K, ctx, a, BOSS, W - 200, gy, 1.3, { pose: fase(a) > 0.4 ? 'senala' : 'brazos', mood: 'enfadado', mira: -1 });
      K.cartel(ctx, a, 'NOAA', 230, 300, { tipo: 'azul', size: 60, p0: 0.05 }); }, { ...V, de: 1.1, a: 1, foco: [W / 2, 1200] });
    K.luz(ctx, a, { ...V, tono: 'interior', foco: [W / 2, 700] }); K.contador(ctx, a, '1997', 800, 300, { size: 64, p0: 0.1 }); K.etiqueta(ctx, a, 'LISTENING FOR SUBS', W / 2, 470, { size: 52, p0: 0.35 }); },
  // 3 — Una noche, un rugido profundo entra por los cascos
  3: (ctx, a, K) => { const { YOU } = cast(K); const hit = ph(a, 0.35, 0.45);
    temblor(ctx, a, hit > 0 ? 8 * (1 - ph(a, 0.45, 1)) + 2 : 0, () => K.camara(ctx, a, () => { cielo(ctx, '#141a33', '#2b2142'); consola(ctx, a, K, 260, { pico: hit > 0 ? 0.5 : null, amp: 0.4 + hit * 1.2 });
      const y = D(K, ctx, a, YOU, W / 2, 1900, 2.6, { pose: 'quieto', mood: hit > 0 ? 'sorpresa' : 'dormido', mira: 0 }); cascos(ctx, y.cabeza[0], y.cabeza[1], y.hr, hit > 0 ? Math.sin(a.t * 60) * 8 : 0);
      if (hit > 0) { anillos(ctx, a, y.cabeza[0] - y.hr * 1.2, y.cabeza[1], { n: 3, r1: 300, col: 'rgba(255,217,61,0.9)', lw: 10, vel: 1.6 }); anillos(ctx, a, y.cabeza[0] + y.hr * 1.2, y.cabeza[1], { n: 3, r1: 300, col: 'rgba(255,217,61,0.9)', lw: 10, vel: 1.6 }); } }, { ...V, de: 1, a: 1.15, foco: [W / 2, 1100] }));
    K.luz(ctx, a, { ...V, tono: 'noche', foco: [W / 2, 500] }); titular(ctx, a, 'BOOOOM', W / 2, 140, { size: 130, col: '#ffd93d', p0: 0.38, rot: -0.05 }); },
  // 4 — Das un salto
  4: (ctx, a, K) => { const { YOU, BOSS } = cast(K); const k = ph(a, 0.05, 0.6), j = Math.sin(clamp(k) * Math.PI);
    temblor(ctx, a, 5 * (1 - fase(a)), () => K.camara(ctx, a, () => { const gy = fondo(ctx, a, 'control', { hora: 'noche' }, { cx: 1100 });
      ctx.save(); ctx.translate(W / 2 + 160 + k * 120, gy - 20); ctx.rotate(k * 1.4); caja(ctx, -70, -140, 140, 30, 10, '#e63946', 6); ln(ctx, [[0, -110], [0, 0]], INK, 10); ctx.restore();
      const y = D(K, ctx, a, YOU, W / 2, gy - j * 520, 1.7, { pose: k < 1 ? 'salta' : 'miedo', mood: 'sorpresa' }); cascos(ctx, y.cabeza[0], y.cabeza[1] - j * 40, y.hr);
      K.simbolo(ctx, a, y.cabeza, y.hr, '!', 0.05); if (k > 0.2 && k < 0.9) K.speedLines(ctx, a, y.cabeza[0], y.cabeza[1] + 400, { n: 12 });
      D(K, ctx, a, BOSS, 160, gy, 1.2, { pose: 'encoge', mood: fase(a) > 0.6 ? 'risa' : 'sorpresa', mira: 1 }); }, { ...V, de: 1.15, a: 1, foco: [W / 2, 1200] }));
    titular(ctx, a, 'YOU JUMP!', W / 2, 300, { size: 150, col: '#ffd93d', p0: 0.1, rot: 0.04 }); },
  // 5 — Sensores a más de 3.000 millas lo oyeron
  5: (ctx, a, K) => { const s = [[200, 300, ph(a, 0.25, 0.3) > 0], [180, 1200, ph(a, 0.4, 0.45) > 0], [380, 1700, ph(a, 0.55, 0.6) > 0], [980, 1750, ph(a, 0.7, 0.75) > 0]];
    K.camara(ctx, a, () => { mapa(ctx, a, { sensores: s, origen: [420, 1250], ondas: sm(ph(a, 0, 0.8)) }); ln(ctx, [[200, 300], [380, 1700]], 'rgba(255,255,255,0.0)', 2); }, { ...V, de: 1.2, a: 1, foco: [500, 1100] });
    caja(ctx, 120, 160, W - 240, 300, 30, 'rgba(255,255,255,0.92)', 8); titular(ctx, a, '3,000+ MILES', W / 2, 260, { size: 120, col: '#ff4d5e', p0: 0.1 }); K.etiqueta(ctx, a, 'APART - ALL HEARD IT', W / 2, 390, { size: 48, p0: 0.3 }); },
  // 6 — Venía del Pacífico Sur, frente a Chile
  6: (ctx, a, K) => { K.camara(ctx, a, () => { mapa(ctx, a, { origen: [420, 1250], ondas: 0.5 }); const k = sm(ph(a, 0.1, 0.5)); ctx.save(); ctx.translate(420, lerp(300, 1180, k)); K.prop(ctx, 'lupa', 0, 0, 0.8, a.t); ctx.restore();
      K.etiqueta(ctx, a, 'CHILE', 900, 1150, { size: 60, rot: 0.1, p0: 0.4 }); K.etiqueta(ctx, a, 'SOUTH PACIFIC', 300, 1000, { size: 46, rot: -0.06, p0: 0.55 }); }, { ...V, de: 1, a: 1.5, foco: [460, 1200] });
    titular(ctx, a, 'RIGHT HERE', W / 2, 240, { size: 130, col: '#ffd93d', p0: 0.45 }); },
  // 7 — ¿Una ballena azul? No es lo bastante fuerte: medidor que no llega
  7: (ctx, a, K) => { K.camara(ctx, a, () => { mar(ctx, a, 0); ctx.save(); ctx.translate(W / 2 - 120, 1150 + Math.sin(a.t * 1.5) * 20); K.prop(ctx, 'ballena', 0, 0, 1.6, a.t); ctx.restore();
      anillos(ctx, a, 220, 1100, { n: 2, r1: 200, col: 'rgba(160,230,255,0.8)', lw: 8, vel: 1 });
      const mx = 900, top = 520, bot = 1500; caja(ctx, mx - 60, top, 120, bot - top, 30, '#1d2440', 8); const lvl = sm(ph(a, 0.1, 0.55)) * 0.45; const g = ctx.createLinearGradient(0, bot, 0, top); g.addColorStop(0, '#4dff88'); g.addColorStop(0.6, '#ffd93d'); g.addColorStop(1, '#ff4d5e'); ctx.fillStyle = g; ctx.fillRect(mx - 44, bot - 16 - (bot - top - 32) * lvl, 88, (bot - top - 32) * lvl);
      ln(ctx, [[mx - 100, top + 60], [mx + 100, top + 60]], '#ff4d5e', 10); K.etiqueta(ctx, a, 'BLOOP', mx - 30, top + 20, { size: 40, p0: 0.05 }); }, { ...V, de: 1, a: 1.1, foco: [W / 2, 1100] });
    titular(ctx, a, 'A BLUE WHALE?', W / 2, 260, { size: 110, col: '#5ec8ff', p0: 0.02 }); sello(ctx, a, 'NOT LOUD ENOUGH', W / 2, 1600, { p0: 0.6, size: 72 }); },
  // 8 — Ni submarino ni bomba: sube como la llamada de un animal
  8: (ctx, a, K) => { K.camara(ctx, a, () => { mar(ctx, a);
      ctx.save(); ctx.translate(290, 650); K.prop(ctx, 'submarino', 0, 0, 0.7, a.t); ctx.restore(); tacha(ctx, a, 290, 650, 150, 0.1);
      ctx.save(); ctx.translate(790, 650); K.prop(ctx, 'bomba', 0, 0, 0.8, a.t); ctx.restore(); tacha(ctx, a, 790, 650, 150, 0.3);
      pantalla(ctx, 80, 1000, W - 160, 420, () => { const k = sm(ph(a, 0.45, 0.95)); ctx.save(); ctx.strokeStyle = '#4dff88'; ctx.shadowColor = '#4dff88'; ctx.shadowBlur = 16; ctx.lineWidth = 7; ctx.beginPath(); for (let i = 0; i <= 200 * k; i++) { const u = i / 200, x = 80 + u * (W - 160), y = 1370 - u * u * 300 + Math.sin(u * (30 + u * 80) + a.t * 4) * 30 * (0.4 + u); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.restore(); });
      if (ph(a, 0.55, 0.6) > 0) flecha(ctx, 300, 1360, 840, 1100, 'rgba(255,217,61,0.9)', 18); }, { ...V, de: 1, a: 1.08, foco: [W / 2, 1000] });
    titular(ctx, a, 'NOT A SUB. NOT A BOMB.', W / 2, 250, { size: 90, p0: 0.05 }); K.etiqueta(ctx, a, 'IT RISES LIKE A CALL', W / 2, 400, { size: 54, col: '#4dff88', p0: 0.5 }); },
  // 9 — Internet lo bautiza "the Bloop": móviles, gente comentando
  9: (ctx, a, K) => { const { GEEK, SCI, BOSS } = cast(K);
    K.camara(ctx, a, () => { const gy = fondo(ctx, a, 'salon', { hora: 'noche' }, { cx: 900 });
      caja(ctx, 140, 460, W - 280, 560, 24, '#f8f9fa', 8); caja(ctx, 140, 460, W - 280, 70, [24, 24, 0, 0], '#4d96ff', 8);
      for (let i = 0; i < 4; i++) { const k = ph(a, 0.1 + i * 0.15, 0.2 + i * 0.15); if (k <= 0) continue; ctx.save(); ctx.globalAlpha = k; caja(ctx, 180, 560 + i * 110, W - 360, 90, 16, ['#ffe066', '#c7f9cc', '#ffd6e0', '#cde7ff'][i], 5); ctx.fillStyle = INK; ctx.font = '44px Anton'; ctx.textAlign = 'left'; ctx.fillText(['THE BLOOP!!', 'it’s a MONSTER', 'listen at 0:07', '#bloop'][i], 210, 620 + i * 110); ctx.restore(); }
      D(K, ctx, a, GEEK, 220, gy, 1.25, { pose: 'sostiene', mood: 'risa', mira: 1, objeto: (c, mx, my) => K.prop(c, 'telefono_antiguo', mx, my - 20, 0.4, a.t) });
      D(K, ctx, a, SCI, 540, gy, 1.25, { pose: 'vitorea', mood: 'sorpresa', habla: true });
      D(K, ctx, a, BOSS, 860, gy, 1.25, { pose: 'piensa', mood: 'duda', mira: -1 }); }, { ...V, de: 1.08, a: 1, foco: [W / 2, 1200] });
    K.luz(ctx, a, { ...V, tono: 'interior' }); titular(ctx, a, '"THE BLOOP"', W / 2, 270, { size: 150, col: '#5ec8ff', p0: 0.05 }); },
  // 10 — Algunos dicen que es una criatura gigante, junto a la ciudad hundida de Lovecraft (silueta genérica + ruinas)
  10: (ctx, a, K) => { K.camara(ctx, a, () => { mar(ctx, a); ruinas(ctx, 1750); const k = sm(ph(a, 0.1, 0.8)); tentaculos(ctx, a, W / 2, lerp(2300, 1600, k), 1.3);
      ctx.save(); ctx.globalAlpha = k; circ(ctx, W / 2 - 90, lerp(2300, 1600, k) + 30, 22, '#ffd93d', 0); circ(ctx, W / 2 + 90, lerp(2300, 1600, k) + 30, 22, '#ffd93d', 0); ctx.restore(); }, { ...V, de: 1, a: 1.18, foco: [W / 2, 1300], temblor: 1.5 });
    K.luz(ctx, a, { ...V, tono: 'tension', foco: [W / 2, 1300] }); titular(ctx, a, 'A GIANT', W / 2, 240, { size: 140, col: '#ff4d5e', p0: 0.05 }); titular(ctx, a, 'CREATURE?', W / 2, 390, { size: 130, p0: 0.2 }); K.etiqueta(ctx, a, 'SUNKEN CITY OF LEGEND', W / 2, 560, { size: 46, p0: 0.5 }); },
  // 11 — Un animal así empequeñecería a cualquier ballena
  11: (ctx, a, K) => { K.camara(ctx, a, () => { mar(ctx, a); const g = 0.6 + sm(ph(a, 0.1, 0.7)) * 1.2; tentaculos(ctx, a, W / 2 + 120, 1700, g);
      ctx.save(); ctx.translate(250, 900 + Math.sin(a.t * 2) * 12); K.prop(ctx, 'ballena', 0, 0, 0.6, a.t); ctx.restore(); K.etiqueta(ctx, a, 'BLUE WHALE', 260, 1040, { size: 38, p0: 0.15 });
      ln(ctx, [[900, 1880], [900, 1880 - 520 * g]], '#ffd93d', 8); K.etiqueta(ctx, a, '???', 940, 1880 - 520 * g, { size: 50, p0: 0.4 }); }, { ...V, de: 1.15, a: 1, foco: [W / 2, 1100] });
    titular(ctx, a, 'BIGGER THAN', W / 2, 250, { size: 110, p0: 0.02 }); titular(ctx, a, 'ANY WHALE', W / 2, 390, { size: 130, col: '#5ec8ff', p0: 0.2 }); },
  // 12 — Años después, la NOAA pone micrófonos cerca de la Antártida
  12: (ctx, a, K) => { const { SCI } = cast(K);
    K.camara(ctx, a, () => { cielo(ctx, '#bfe6ff', '#e9f6ff', 0, 900); mar(ctx, a, 900); ctx.fillStyle = '#f4fbff'; ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(0, 700); ctx.lineTo(420, 660); ctx.lineTo(460, 940); ctx.lineTo(0, 960); ctx.fill(); ctx.stroke();
      ctx.save(); ctx.translate(720, 900 + Math.sin(a.t * 2) * 8); K.prop(ctx, 'barco', 0, -40, 1.0, a.t); ctx.restore();
      const y = D(K, ctx, a, SCI, 700, 830 + Math.sin(a.t * 2) * 8, 0.9, { pose: 'sostiene', mood: 'feliz' }); const dep = sm(ph(a, 0.15, 0.8)) * 700;
      ln(ctx, [[y.manoD[0], y.manoD[1]], [y.manoD[0] + 60, 960 + dep]], '#ffd93d', 5); caja(ctx, y.manoD[0] + 30, 960 + dep, 60, 110, 20, '#ff9f43', 6); if (dep > 600) anillos(ctx, a, y.manoD[0] + 60, 1010 + dep, { n: 2, r1: 160, col: 'rgba(77,255,136,0.8)', lw: 6, vel: 1.4 });
      K.etiqueta(ctx, a, 'ANTARCTICA', 230, 600, { size: 50, rot: -0.05, p0: 0.25 }); }, { ...V, de: 1, a: 1.08, foco: [W / 2, 1100] });
    K.contador(ctx, a, 'YEARS LATER', W / 2, 180, { size: 56, p0: 0.02 }); titular(ctx, a, 'NEW MICS', W / 2, 330, { size: 130, col: '#4dff88', p0: 0.3 }); },
  // 13 — El mismo sonido, una y otra vez
  13: (ctx, a, K) => { const { YOU } = cast(K); const n = 1 + Math.floor(fase(a) * 5.99);
    K.camara(ctx, a, () => { cielo(ctx, '#141a33', '#2b2142'); for (let r = 0; r < 3; r++) pantalla(ctx, 80, 300 + r * 330, W - 160, 260, () => onda(ctx, a, 80, 430 + r * 330, W - 160, 260, { pico: ((a.t * 0.5 + r * 0.33) % 1), amp: 0.8 }));
      const y = D(K, ctx, a, YOU, W / 2, 1950, 2.2, { pose: 'manos', mood: 'sorpresa', mira: 0 }); cascos(ctx, y.cabeza[0], y.cabeza[1], y.hr); }, { ...V, de: 1, a: 1.06, foco: [W / 2, 900] });
    titular(ctx, a, 'SAME SOUND', W / 2, 160, { size: 110, col: '#ffd93d' }); K.contador(ctx, a, 'x' + n, 900, 1300 - 450, { size: 70 }); },
  // 14 — Icequakes: icebergs del tamaño de ciudades que se desprenden
  14: (ctx, a, K) => { const k = sm(ph(a, 0.3, 0.9));
    temblor(ctx, a, ph(a, 0.25, 0.35) > 0 ? 6 * (1 - k) : 0, () => K.camara(ctx, a, () => { cielo(ctx, '#9fd3ff', '#e6f6ff', 0, 1100); mar(ctx, a, 1100);
      ctx.fillStyle = '#eef9ff'; ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, 650); ctx.lineTo(520, 640); ctx.lineTo(540, 1350); ctx.lineTo(0, 1350); ctx.fill(); ctx.stroke();
      ctx.save(); ctx.translate(540 + k * 160, 640 + k * 260); ctx.rotate(k * 0.25); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(480, 20); ctx.lineTo(460, 720); ctx.lineTo(10, 710); ctx.closePath(); ctx.fillStyle = '#dff3ff'; ctx.fill(); ctx.stroke();
      ctx.restore();
      if (ph(a, 0.3, 0.32) > 0) { ln(ctx, [[530, 640], [560, 820], [520, 980], [550, 1150], [535, 1350]], '#1b1530', 10); anillos(ctx, a, 600, 1250, { n: 4, r1: 700, col: 'rgba(255,255,255,0.9)', lw: 12, vel: 0.9 }); }
      K.etiqueta(ctx, a, 'CITY-SIZED', 760, 560, { size: 50, rot: 0.08, p0: 0.5 }); }, { ...V, de: 1.05, a: 1.15, foco: [W / 2, 1000] }));
    titular(ctx, a, 'ICEQUAKES', W / 2, 260, { size: 150, col: '#5ec8ff', p0: 0.05 }); titular(ctx, a, 'CRACK!', 320, 470, { size: 120, col: '#ffffff', p0: 0.32, rot: -0.1 }); },
  // 15 — El monstruo era real, pero no estaba vivo: la silueta se convierte en hielo
  15: (ctx, a, K) => { const k = sm(ph(a, 0.2, 0.75));
    K.camara(ctx, a, () => { mar(ctx, a); ctx.save(); ctx.globalAlpha = 1 - k; tentaculos(ctx, a, W / 2, 1650, 1.2); ctx.restore();
      ctx.save(); ctx.globalAlpha = k; ctx.translate(W / 2, 1300); ctx.scale(0.6 + k * 0.4, 0.6 + k * 0.4); ctx.beginPath(); ctx.moveTo(-380, 0); ctx.lineTo(-300, -420); ctx.lineTo(-80, -560); ctx.lineTo(160, -480); ctx.lineTo(360, -300); ctx.lineTo(400, 0); ctx.lineTo(300, 260); ctx.lineTo(-320, 260); ctx.closePath(); ctx.fillStyle = '#dff3ff'; ctx.strokeStyle = INK; ctx.lineWidth = 10; ctx.fill(); ctx.stroke(); ctx.fillStyle = 'rgba(94,200,255,0.3)'; ctx.fillRect(-400, 0, 820, 270); ctx.restore();
      if (k > 0.9) K.sparkles(ctx, a, W / 2, 1100, { n: 10, r: 420 }); }, { ...V, de: 1.05, a: 1, foco: [W / 2, 1200] });
    titular(ctx, a, 'THE MONSTER WAS REAL', W / 2, 250, { size: 90, p0: 0.02 }); sello(ctx, a, 'NOT ALIVE', W / 2, 450, { p0: 0.6, col: '#1d6fd6', size: 120 }); },
  // 16 — Y así, cuando un hielo así se rompe, en 1997… (vuelve al analista)
  16: (ctx, a, K) => { const { YOU } = cast(K); const k = sm(ph(a, 0, 0.5));
    K.camara(ctx, a, () => { cielo(ctx, '#141a33', '#2b2142'); consola(ctx, a, K, 260, { pico: 0.5, amp: 1.2 });
      ctx.save(); ctx.beginPath(); ctx.arc(820, 300, 170, 0, 7); ctx.clip(); cielo(ctx, '#9fd3ff', '#0b3a5e', 130, 470); ctx.translate(820 + k * 30, 260 + k * 40); ctx.rotate(k * 0.2); ctx.fillStyle = '#eef9ff'; ctx.fillRect(-70, -40, 140, 160); ctx.restore(); circ(ctx, 820, 300, 170, null, 10);
      const y = D(K, ctx, a, YOU, W / 2 - 80, 1950, 2.4, { pose: 'quieto', mood: 'sorpresa', mira: 1 }); cascos(ctx, y.cabeza[0], y.cabeza[1], y.hr, Math.sin(a.t * 50) * 5); }, { ...V, de: 1.12, a: 1, foco: [W / 2, 1000] });
    K.luz(ctx, a, { ...V, tono: 'noche', foco: [W / 2, 500] }); K.contador(ctx, a, '1997', 220, 150, { size: 60, p0: 0.3 }); },
};
const BASE = (fn) => (ctx, a, K) => { cielo(ctx, SEA1, SEA2); fn(ctx, a, K); };
export default Object.fromEntries(Object.entries(PLANOS).map(([k, f]) => [k, BASE(f)]));
