// pedido-30-01 — "What Happens If You Stop Drinking Water" (Short vertical, estilo nuevo)
import { W, H, INK, V, clamp, sm, lerp, fase, ph, hs, fondo, D, cielo, ln, circ, caja, titular, sello, temblor, tacha } from '../../lib/corto.mjs';

let CAST = null;
function cast(K) {
  if (CAST) return CAST;
  const sin = { sombrero: null, corbata: null, barba: false, bigote: false };
  const [YOU, TEEN, COP1, COP2] = K.reparto('pedido-30', 4, [
    { ...sin, estilo: 'gordito', pelo: 'pinchos', peloCol: '#3a2614', ropa: '#4d96ff' },
    { ...sin, estilo: 'limpio', pelo: 'mechon', peloCol: '#c99a3a', ropa: '#ff9f43' },
    { ...sin, estilo: 'gordito', pelo: 'corto', peloCol: '#2a1a10', ropa: '#2b3a67', sombrero: 'gorra', bigote: true },
    { ...sin, estilo: 'limpio', pelo: 'raya', peloCol: '#1a120c', ropa: '#2b3a67', sombrero: 'gorra' },
  ]);
  return (CAST = { YOU, TEEN, COP1, COP2 });
}
function desierto(ctx, a, { calor = 0.5 } = {}) {
  cielo(ctx, '#ffd27a', '#ff9a4a', 0, 1200); const sx = 820, sy = 360; circ(ctx, sx, sy, 150 + Math.sin(a.t * 3) * 6, '#fff3b0', 0); circ(ctx, sx, sy, 110, '#ffffff', 0);
  ctx.fillStyle = '#f0b96a'; ctx.beginPath(); ctx.moveTo(0, 1150); ctx.quadraticCurveTo(300, 1000, 620, 1120); ctx.quadraticCurveTo(880, 1200, W, 1080); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
  ctx.fillStyle = '#e2a256'; ctx.beginPath(); ctx.moveTo(0, 1380); ctx.quadraticCurveTo(500, 1260, W, 1400); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill(); ln(ctx, [[0, 1380], [540, 1290], [W, 1400]], INK, 6);
  ctx.save(); ctx.globalAlpha = 0.25 * calor; for (let i = 0; i < 8; i++) { const y = 1000 + i * 60; ln(ctx, Array.from({ length: 12 }, (_, j) => [j * 100, y + Math.sin(a.t * 5 + j + i) * 10]), '#ffffff', 6); } ctx.restore();
  return 1420;
}
// Depósito de agua del cuerpo (0..1)
function tanque(ctx, a, x, y, nivel, { w = 200, h = 520, col = '#4dc3ff', txt = null } = {}) {
  caja(ctx, x - w / 2, y - h, w, h, 40, '#ffffff', 9); ctx.save(); ctx.beginPath(); ctx.roundRect(x - w / 2, y - h, w, h, 40); ctx.clip();
  const ly = y - h * nivel; ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x - w, H); for (let i = 0; i <= 12; i++) ctx.lineTo(x - w / 2 + i * w / 12, ly + Math.sin(a.t * 4 + i) * 8); ctx.lineTo(x + w, H); ctx.fill(); ctx.restore(); caja(ctx, x - w / 2, y - h, w, h, 40, null, 9);
  if (txt) { ctx.fillStyle = INK; ctx.font = '64px Anton'; ctx.textAlign = 'center'; ctx.fillText(txt, x, y + 80); }
}
function gota(ctx, x, y, s = 1, col = '#4dc3ff') { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = col; ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, -60); ctx.bezierCurveTo(40, -10, 45, 40, 0, 45); ctx.bezierCurveTo(-45, 40, -40, -10, 0, -60); ctx.fill(); ctx.stroke(); ctx.restore(); }
function cruz(ctx, x, y, r = 70, k = 1) { if (k <= 0) return; ln(ctx, [[x - r, y - r], [x - r + 2 * r * Math.min(1, k * 2), y - r + 2 * r * Math.min(1, k * 2)]], '#ff3b4e', 18); if (k > 0.5) ln(ctx, [[x + r, y - r], [x + r - 2 * r * (k - 0.5) * 2, y - r + 2 * r * (k - 0.5) * 2]], '#ff3b4e', 18); }
function celda(ctx, a, gy) {
  cielo(ctx, '#5c6170', '#3c404c'); for (let r = 0; r < 12; r++) for (let c = 0; c < 6; c++) caja(ctx, c * 200 - (r % 2) * 100, r * 110 + 100, 200, 110, 0, null, 3);
  ctx.fillStyle = '#4a4e5a'; ctx.fillRect(0, gy, W, H - gy); ln(ctx, [[0, gy], [W, gy]], INK, 8);
  caja(ctx, 640, 380, 220, 160, 8, '#22252e', 7); for (let i = 0; i < 4; i++) ln(ctx, [[670 + i * 55, 380], [670 + i * 55, 540]], '#9aa0ad', 9);
}
function barrotes(ctx, x0 = 0, x1 = W) { for (let x = x0 + 40; x < x1; x += 120) { ln(ctx, [[x, 0], [x, H]], '#2a2d36', 26); ln(ctx, [[x - 6, 0], [x - 6, H]], '#9aa0ad', 6); } ln(ctx, [[x0, 300], [x1, 300]], '#2a2d36', 30); }

const PLANOS = {
  // 0 — Día tres sin agua: tu sangre se espesa (vaso sanguíneo con glóbulos que se atascan)
  0: (ctx, a, K) => { const k = sm(ph(a, 0.1, 0.9)); const lat = Math.pow(Math.max(0, Math.sin(a.t * 6)), 8);
    K.camara(ctx, a, () => { cielo(ctx, '#3a0a14', '#7a1a28'); const y0 = 760, y1 = 1260; ctx.fillStyle = lerp(0, 1, k) > 0.5 ? '#9e1b2d' : '#c2263a'; ctx.fillRect(0, y0, W, y1 - y0); ln(ctx, [[0, y0], [W, y0]], INK, 12); ln(ctx, [[0, y1], [W, y1]], INK, 12);
      for (let i = 0; i < 26; i++) { const vel = lerp(420, 40, k), x = ((hs(i) * 1400 + a.t * vel * (0.7 + hs(i + 9) * 0.6)) % 1400) - 160, y = y0 + 50 + hs(i + 3) * (y1 - y0 - 100), cx = lerp(x, W * 0.62 + (i % 6) * 40 - 120, k * 0.7);
        ctx.save(); ctx.translate(cx, lerp(y, 1010 + ((i % 5) - 2) * 70, k * 0.6)); ctx.scale(1 + lat * 0.05, 1); K.prop(ctx, 'globulo_rojo', 0, 0, 0.32, a.t); ctx.restore(); } }, { ...V, de: 1, a: 1.15, foco: [W / 2, 1010] });
    titular(ctx, a, 'DAY 3', W / 2, 300, { size: 190, col: '#ffd93d', p0: 0.02 }); titular(ctx, a, 'BLOOD THICKENS', W / 2, 520, { size: 100, p0: 0.35 }); },
  // 1 — Rebobina. Hora uno: no notas nada (rebobinado + paseando con el móvil)
  1: (ctx, a, K) => { const { YOU } = cast(K); const rw = 1 - ph(a, 0, 0.25);
    K.camara(ctx, a, () => { const gy = fondo(ctx, a, 'calle', { hora: 'dia' }, { cx: 900 + a.t * 40 });
      D(K, ctx, a, YOU, W / 2, gy, 1.7, { pose: 'sostiene', mood: 'feliz', mira: 1, objeto: (c, mx, my) => caja(c, mx - 30, my - 110, 70, 120, 14, '#2b2d42', 6) });
      if (rw > 0) { ctx.save(); ctx.globalAlpha = rw * 0.6; ctx.fillStyle = '#ffffff'; for (let i = 0; i < 14; i++) ctx.fillRect(0, ((i * 160 + a.t * 2400) % H), W, 10); ctx.restore(); } }, { ...V, de: 1.1, a: 1, foco: [W / 2, 1200] });
    if (rw > 0) titular(ctx, a, '◀◀ REWIND', W / 2, 900, { size: 130, col: '#ffffff' });
    titular(ctx, a, 'HOUR 1', W / 2, 260, { size: 160, col: '#ffd93d', p0: 0.25 }); K.etiqueta(ctx, a, 'YOU FEEL NOTHING', W / 2, 430, { size: 50, p0: 0.4 }); },
  // 2 — Solo respirar ya te vacía: cada aliento saca gotas y baja el depósito
  2: (ctx, a, K) => { const { YOU } = cast(K); const k = fase(a);
    K.camara(ctx, a, () => { const gy = fondo(ctx, a, 'calle', { hora: 'dia' }, { cx: 1100, blur: 3 });
      const y = D(K, ctx, a, YOU, 360, gy, 1.8, { pose: 'quieto', mood: 'neutral', mira: 1, habla: true });
      for (let i = 0; i < 7; i++) { const f = (a.t * 0.6 + i / 7) % 1; ctx.save(); ctx.globalAlpha = 1 - f; circ(ctx, y.cabeza[0] + y.hr + f * 380, y.cabeza[1] + 20 - f * 260 + Math.sin(f * 9) * 20, 30 + f * 40, 'rgba(255,255,255,0.85)', 4); gota(ctx, y.cabeza[0] + y.hr + f * 380, y.cabeza[1] + 20 - f * 260, 0.35); ctx.restore(); }
      tanque(ctx, a, 860, gy - 100, lerp(1, 0.9, k), { txt: Math.round(lerp(100, 99.5, k) * 10) / 10 + '%' }); }, { ...V, de: 1, a: 1.08, foco: [W / 2, 1200] });
    titular(ctx, a, 'BREATHING', W / 2, 260, { size: 150, p0: 0.02 }); titular(ctx, a, 'DRAINS YOU', W / 2, 420, { size: 120, col: '#4dc3ff', p0: 0.3 }); },
  // 3 — Un uno por ciento menos y llega la sed (lengua fuera, depósito 99 %)
  3: (ctx, a, K) => { const { YOU } = cast(K); const k = sm(ph(a, 0.05, 0.5));
    K.camara(ctx, a, () => { const gy = fondo(ctx, a, 'oficina', { hora: 'dia' }, { cx: 800 });
      const y = D(K, ctx, a, YOU, 400, gy, 1.8, { pose: k > 0.8 ? 'manos' : 'sentado', mood: k > 0.8 ? 'triste' : 'neutral', mira: 1 });
      if (k > 0.8) { ctx.save(); ctx.translate(y.cabeza[0] + 10, y.cabeza[1] + y.hr * 0.55); ctx.fillStyle = '#ff7a8a'; ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(0, 20 + Math.sin(a.t * 8) * 6, 22, 34, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore(); K.simbolo(ctx, a, y.cabeza, y.hr, '!', 0.55); }
      tanque(ctx, a, 840, gy - 120, lerp(1, 0.99, k), { txt: '-' + Math.round(k * 100) / 100 * 1 + '%' }); }, { ...V, de: 1.05, a: 1.12, foco: [500, 1100] });
    titular(ctx, a, '1% GONE', W / 2, 280, { size: 170, col: '#ffd93d' }); titular(ctx, a, 'THIRST!', W / 2, 460, { size: 120, col: '#ff6b3d', p0: 0.55, rot: -0.05 }); },
  // 4 — Tu cerebro literalmente encoge (corte de la cabeza: el cerebro se separa del cráneo)
  4: (ctx, a, K) => { const k = sm(ph(a, 0.15, 0.8));
    K.camara(ctx, a, () => { cielo(ctx, '#2a2f5a', '#5a4f9a'); ctx.save(); ctx.translate(W / 2, 1050); circ(ctx, 0, 0, 380, '#f3c9a8', 12); circ(ctx, 0, -10, 330, '#ffe6d6', 6); ctx.restore();
      ctx.save(); ctx.translate(W / 2, 1050 + k * 50); const s = lerp(1.5, 1.1, k); K.prop(ctx, 'cerebro', 0, 0, s, a.t); ctx.restore();
      if (k > 0.2) { [[-1, 0], [1, 0], [0, -1]].forEach(([dx, dy]) => { const x = W / 2 + dx * 300, y = 1050 + dy * 280; ctx.save(); ctx.globalAlpha = k; const ex = dx * -60 * k, ey = dy * -60 * k; ln(ctx, [[x, y], [x + ex, y + ey]], '#ffd93d', 12); ctx.restore(); }); } }, { ...V, de: 1, a: 1.15, foco: [W / 2, 1050] });
    titular(ctx, a, 'YOUR BRAIN', W / 2, 300, { size: 140, p0: 0.02 }); titular(ctx, a, 'SHRINKS', W / 2, 460, { size: 150, col: '#ff8cc6', p0: 0.3 }); },
  // 5 — Los riñones se apagan; la orina se oscurece (tabla de colores que avanza)
  5: (ctx, a, K) => { const k = sm(ph(a, 0.4, 0.9)); const off = ph(a, 0.05, 0.3);
    K.camara(ctx, a, () => { cielo(ctx, '#fff4e0', '#ffe0c2');
      [[-1, 360], [1, 720]].forEach(([s, x]) => { ctx.save(); ctx.translate(x, 760); ctx.scale(s, 1); const col = off > 0.5 ? '#8a3a3a' : '#d65a5a'; ctx.fillStyle = col; ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.beginPath(); ctx.ellipse(0, 0, 120, 190, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff4e0'; ctx.beginPath(); ctx.ellipse(110, 0, 50, 70, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore(); ln(ctx, [[x + (s < 0 ? 60 : -60), 760], [W / 2, 1000]], '#e0b0a0', 14); });
      if (off > 0) { caja(ctx, W / 2 - 130, 700, 260, 110, 20, '#2b2d42', 7); ctx.fillStyle = off > 0.5 ? '#ff3b4e' : '#6bcb77'; ctx.font = '80px Anton'; ctx.textAlign = 'center'; ctx.fillText(off > 0.5 ? 'OFF' : 'ON', W / 2, 785); }
      const cols = ['#fff6b0', '#ffe46a', '#f3c53a', '#d9962a', '#a8641c', '#6b3a12']; cols.forEach((c, i) => caja(ctx, 110 + i * 145, 1280, 130, 220, 18, c, 7));
      const mx = 175 + k * 5 * 145; ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(mx, 1530); ctx.lineTo(mx - 40, 1600); ctx.lineTo(mx + 40, 1600); ctx.fill(); }, { ...V, de: 1, a: 1.08, foco: [W / 2, 1000] });
    titular(ctx, a, 'KIDNEYS: OFF', W / 2, 300, { size: 140, col: '#ff3b4e', p0: 0.05 }); K.etiqueta(ctx, a, 'PEE TURNS DARK', W / 2, 1720, { size: 50, p0: 0.4 }); },
  // 6 — Sin saliva, sin sudor: el cuerpo no se enfría (termómetro que sube)
  6: (ctx, a, K) => { const { YOU } = cast(K); const k = sm(ph(a, 0.1, 0.9));
    K.camara(ctx, a, () => { const gy = desierto(ctx, a, { calor: 1 }); ctx.save(); ctx.globalAlpha = k * 0.35; ctx.fillStyle = '#ff2a2a'; ctx.fillRect(0, 0, W, H); ctx.restore();
      const y = D(K, ctx, a, YOU, 420, gy, 1.8, { pose: 'encoge', mood: 'triste', mira: 1 });
      gota(ctx, 820, 620, 0.9); cruz(ctx, 820, 620, 70, ph(a, 0.15, 0.4)); ctx.save(); ctx.translate(820, 880); circ(ctx, 0, 0, 60, '#ffffff', 6); ctx.fillStyle = INK; ctx.font = '60px Anton'; ctx.textAlign = 'center'; ctx.fillText('~', 0, 22); ctx.restore(); cruz(ctx, 820, 880, 70, ph(a, 0.3, 0.55));
      caja(ctx, 780, 1000, 80, 380, 40, '#ffffff', 8); caja(ctx, 795, 1380 - 340 * lerp(0.4, 1, k), 50, 340 * lerp(0.4, 1, k), 25, '#ff3b4e', 0); circ(ctx, 820, 1400, 60, '#ff3b4e', 8);
      if (k > 0.6) K.smoke(ctx, y.cabeza[0], y.cabeza[1] - y.hr, a.t, 4); }, { ...V, de: 1.08, a: 1, foco: [W / 2, 1100] });
    titular(ctx, a, 'NO SALIVA', W / 2, 250, { size: 120, p0: 0.05 }); titular(ctx, a, 'NO SWEAT', W / 2, 390, { size: 120, col: '#ffd93d', p0: 0.25 }); },
  // 7 — Te levantas y te desmayas (todo se cierra a negro)
  7: (ctx, a, K) => { const { YOU } = cast(K); const up = sm(ph(a, 0, 0.3)), cae = sm(ph(a, 0.55, 0.8)), neg = ph(a, 0.35, 0.75);
    K.camara(ctx, a, () => { const gy = desierto(ctx, a); ctx.save(); ctx.translate(W / 2, gy + 60); ctx.rotate(cae * 1.5); D(K, ctx, a, YOU, 0, 0, 1.9, { pose: up < 1 ? 'sentado' : 'quieto', mood: cae > 0 ? 'dormido' : neg > 0 ? 'duda' : 'neutral', mira: 0, sombra: false }); ctx.restore();
      if (neg > 0 && cae < 1) K.mareo && K.mareo(ctx, a, [W / 2, gy - 420], 60); }, { ...V, de: 1, a: 1.1, foco: [W / 2, 1200], temblor: neg * 3 });
    const r = lerp(1400, 0, neg); ctx.save(); ctx.fillStyle = '#000'; ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.arc(W / 2, 1000, Math.max(1, r), 0, 7, true); ctx.fill('evenodd'); ctx.restore();
    titular(ctx, a, 'STAND UP...', W / 2, 280, { size: 130, p0: 0.05 }); titular(ctx, a, 'BLACKOUT', W / 2, 1000, { size: 150, col: '#ff3b4e', p0: 0.8 }); },
  // 8 — 10 %: confusión. 15 %: fallan los órganos (barra que avanza)
  8: (ctx, a, K) => { const { YOU } = cast(K); const k = sm(ph(a, 0.05, 0.85)), p = k * 15;
    K.camara(ctx, a, () => { cielo(ctx, '#2b2d42', '#5a2a3a'); const y = D(K, ctx, a, YOU, W / 2, 1380, 1.7, { pose: p > 10 ? 'llora' : 'piensa', mood: p > 12 ? 'miedo' : 'duda', mira: 0 });
      if (p > 8) K.simbolo(ctx, a, y.cabeza, y.hr, '?', 0.4);
      caja(ctx, 100, 1500, 880, 90, 45, '#ffffff', 8); caja(ctx, 108, 1508, Math.max(10, 864 * k), 74, 37, p > 12 ? '#ff3b4e' : p > 9 ? '#ff9f43' : '#ffd93d', 0); caja(ctx, 100, 1500, 880, 90, 45, null, 8);
      [[10, 'CONFUSION'], [15, 'ORGANS FAIL']].forEach(([v, t]) => { const x = 100 + 880 * v / 15 - (v === 15 ? 40 : 0); ln(ctx, [[x, 1480], [x, 1610]], INK, 8); ctx.fillStyle = '#fff'; ctx.font = '44px Anton'; ctx.textAlign = 'center'; ctx.fillText(v + '%', x, 1670); });
      if (p > 13) ['corazon', 'pulmones', 'estomago'].forEach((o, i) => { const x = 220 + i * 320; ctx.save(); ctx.globalAlpha = ph(a, 0.75, 0.9); K.prop(ctx, o, x, 620, 0.5, a.t); cruz(ctx, x, 620, 60, ph(a, 0.8, 0.95)); ctx.restore(); }); }, { ...V, de: 1, a: 1.08, foco: [W / 2, 1100] });
    titular(ctx, a, '-' + Math.round(p) + '%', W / 2, 330, { size: 200, col: p > 12 ? '#ff3b4e' : '#ffd93d' }); },
  // 9 — La mayoría aguanta unos tres días (calendario 1-2-3 tachado, el sol cae)
  9: (ctx, a, K) => { const k = sm(ph(a, 0, 0.9));
    K.camara(ctx, a, () => { cielo(ctx, lerp(0, 1, k) > 0.5 ? '#ff7a4a' : '#ffb070', '#5a3a6a'); circ(ctx, W / 2, lerp(500, 1200, k), 160, '#ffdf7a', 0); ctx.fillStyle = '#c7823e'; ctx.fillRect(0, 1250, W, H); ln(ctx, [[0, 1250], [W, 1250]], INK, 8);
      [1, 2, 3].forEach((d, i) => { const x = 220 + i * 320; caja(ctx, x - 130, 1330, 260, 280, 22, '#ffffff', 8); caja(ctx, x - 130, 1330, 260, 70, [22, 22, 0, 0], '#e63946', 8); ctx.fillStyle = INK; ctx.font = '130px Anton'; ctx.textAlign = 'center'; ctx.fillText(String(d), x, 1560); cruz(ctx, x, 1470, 90, ph(a, 0.15 + i * 0.25, 0.35 + i * 0.25)); }); }, { ...V, de: 1.05, a: 1, foco: [W / 2, 1200] });
    titular(ctx, a, 'MOST PEOPLE', W / 2, 260, { size: 120, p0: 0.02 }); titular(ctx, a, '~3 DAYS', W / 2, 430, { size: 170, col: '#ffd93d', p0: 0.25 }); },
  // 10 — 1979: la policía austríaca olvida a un chaval en una celda (los agentes se van charlando)
  10: (ctx, a, K) => { const { TEEN, COP1, COP2 } = cast(K); const k = sm(ph(a, 0.2, 1));
    K.camara(ctx, a, () => { const gy = 1500; celda(ctx, a, gy); D(K, ctx, a, TEEN, 330, gy, 1.5, { pose: 'senala', mood: 'sorpresa', mira: 1, habla: true }); barrotes(ctx, 0, 620);
      ln(ctx, [[620, 0], [620, H]], INK, 14);
      const x1 = lerp(780, 1250, k); D(K, ctx, a, COP1, x1, gy + 20, 1.35, { pose: 'anda', mood: 'risa', mira: 1, habla: true }); D(K, ctx, a, COP2, x1 + 180, gy + 30, 1.3, { pose: 'anda', mood: 'feliz', mira: -1, habla: true });
      K.globo(ctx, a, 'HELLO?!', 330, 820, { p0: 0.45, grito: true }); }, { ...V, de: 1, a: 1.08, foco: [W / 2, 1200] });
    K.contador(ctx, a, '1979 · AUSTRIA', W / 2, 180, { size: 60 }); titular(ctx, a, 'FORGOTTEN', W / 2, 340, { size: 150, col: '#ffd93d', p0: 0.3 }); },
  // 11 — Lame la condensación de las paredes
  11: (ctx, a, K) => { const { TEEN } = cast(K);
    K.camara(ctx, a, () => { const gy = 1550; celda(ctx, a, gy); ctx.save(); for (let i = 0; i < 40; i++) { const x = 560 + hs(i) * 480, y = 300 + ((hs(i + 5) * 1100 + a.t * (30 + hs(i) * 40)) % 1150); gota(ctx, x, y, 0.18 + hs(i + 2) * 0.12, 'rgba(160,220,255,0.9)'); } ctx.restore();
      const y = D(K, ctx, a, TEEN, 470, gy, 1.9, { pose: 'manos', mood: 'triste', mira: 1 });
      ctx.save(); ctx.translate(y.cabeza[0] + y.hr * 0.95, y.cabeza[1] + y.hr * 0.4); ctx.fillStyle = '#ff7a8a'; ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(18 + Math.abs(Math.sin(a.t * 5)) * 22, 0, 30, 16, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore(); }, { ...V, de: 1.1, a: 1.2, foco: [620, 1100] });
    titular(ctx, a, 'LICKING', W / 2, 260, { size: 140, p0: 0.02 }); titular(ctx, a, 'THE WALLS', W / 2, 420, { size: 140, col: '#4dc3ff', p0: 0.25 }); },
  // 12 — Dieciocho días. Guinness aún lo tiene como récord
  12: (ctx, a, K) => { const { TEEN } = cast(K); const n = Math.max(1, Math.round(sm(ph(a, 0.02, 0.6)) * 18));
    K.camara(ctx, a, () => { cielo(ctx, '#1f2a5a', '#4d5fa8'); K.sparkles(ctx, W / 2, 1100, a.t, 14, 480);
      caja(ctx, W / 2 - 260, 560, 520, 520, 34, '#ffffff', 10); caja(ctx, W / 2 - 260, 560, 520, 130, [34, 34, 0, 0], '#e63946', 10); ctx.fillStyle = '#fff'; ctx.font = '70px Anton'; ctx.textAlign = 'center'; ctx.fillText('DAY', W / 2, 650); ctx.fillStyle = INK; ctx.font = '300px Anton'; ctx.fillText(String(n), W / 2, 1010);
      D(K, ctx, a, TEEN, W / 2, 1620, 1.4, { pose: n >= 18 ? 'vitorea' : 'quieto', mood: n >= 18 ? 'feliz' : 'triste', mira: 0 });
      if (n >= 18) { ctx.save(); ctx.globalAlpha = ph(a, 0.62, 0.75); K.prop(ctx, 'trofeo', 860, 1350, 0.6, a.t); ctx.restore(); } }, { ...V, de: 1, a: 1.08, foco: [W / 2, 900] });
    titular(ctx, a, '18 DAYS', W / 2, 300, { size: 170, col: '#ffd93d', p0: 0.55 }); sello(ctx, a, 'WORLD RECORD', W / 2, 1780 - 90, { p0: 0.7, size: 80 }); },
  // 13 — Para casi todos los demás, se acaba en... (vuelve al desierto: bucle)
  13: (ctx, a, K) => { const { YOU } = cast(K); const lat = Math.pow(Math.max(0, Math.sin(a.t * 5)), 8);
    K.camara(ctx, a, () => { const gy = desierto(ctx, a, { calor: 1 }); D(K, ctx, a, YOU, W / 2, gy + 40, 1.9 + lat * 0.03, { pose: 'encoge', mood: 'triste', mira: 0 });
      ctx.save(); ctx.translate(W / 2, 700); ctx.scale(1 + lat * 0.15, 1 + lat * 0.15); K.prop(ctx, 'corazon', 0, 0, 0.7, a.t); ctx.restore(); }, { ...V, de: 1, a: 1.15, foco: [W / 2, 1000] });
    titular(ctx, a, 'FOR EVERYONE ELSE', W / 2, 260, { size: 100, p0: 0.05 }); titular(ctx, a, 'IT ENDS BY...', W / 2, 400, { size: 120, col: '#ff6b3d', p0: 0.4 }); },
};
const BASE = (fn) => (ctx, a, K) => { cielo(ctx, '#ffd27a', '#e2a256'); fn(ctx, a, K); };
export default Object.fromEntries(Object.entries(PLANOS).map(([k, f]) => [k, BASE(f)]));
