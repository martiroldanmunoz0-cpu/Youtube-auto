// pedido-36-01 — "Roy Sullivan: Struck by Lightning 7 Times" (Short vertical, estilo nuevo)
import { W, H, INK, V, clamp, sm, lerp, fase, ph, hs, fondo, D, cielo, ln, circ, caja, titular, sello, temblor, anillos, arbol } from '../../lib/corto.mjs';

let CAST = null;
function cast(K) {
  if (CAST) return CAST;
  const sin = { sombrero: null, corbata: null, barba: false, bigote: false };
  const [ROY, CO1, CO2, CO3] = K.reparto('pedido-36', 4, [
    { ...sin, estilo: 'gordito', pelo: 'corto', peloCol: '#3a2614', ropa: '#6b705c', sombrero: 'explorador' },
    { ...sin, estilo: 'limpio', pelo: 'coleta', peloCol: '#a33b20', ropa: '#4d96ff' },
    { ...sin, estilo: 'limpio', pelo: 'raya', peloCol: '#2a1a10', ropa: '#ffd93d', gafas: true },
    { ...sin, estilo: 'gordito', pelo: 'calvo', peloCol: '#2a1a10', ropa: '#ff6b6b', bigote: true },
  ]);
  return (CAST = { ROY, CO1, CO2, CO3 });
}
// Rayo en zigzag con resplandor (k = 0..1 aparición)
function rayo(ctx, x0, y0, x1, y1, k, seed = 1, w = 26) {
  if (k <= 0) return; const n = 9, pts = [];
  for (let i = 0; i <= n; i++) { const f = i / n; if (f > k) break; pts.push([lerp(x0, x1, f) + (i && i < n ? (hs(seed * 31 + i) - 0.5) * 150 : 0), lerp(y0, y1, f)]); }
  if (pts.length < 2) return;
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.shadowColor = '#bfe4ff'; ctx.shadowBlur = 60; ln(ctx, pts, 'rgba(160,210,255,0.6)', w * 2.4); ctx.shadowBlur = 0;
  ln(ctx, pts, '#fffbe0', w); ln(ctx, pts, '#ffffff', w * 0.45); ctx.restore();
}
function nube(ctx, a, x, y, s = 1, col = '#4a4f63') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const b = Math.sin(a.t * 2) * 6;
  [[-170, 10, 110], [-60, -40, 140], [80, -20, 130], [190, 20, 100], [0, 40, 120]].forEach(([cx, cy, r]) => circ(ctx, cx, cy + b, r, col, 8));
  ctx.fillStyle = col; ctx.fillRect(-250, 20 + b, 520, 110); ln(ctx, [[-270, 130 + b], [290, 130 + b]], INK, 8); ctx.restore();
}
function tormenta(ctx) { cielo(ctx, '#2b2f45', '#5b6382'); }
function fogonazo(ctx, k) { if (k <= 0) return; ctx.save(); ctx.globalAlpha = k * 0.85; ctx.fillStyle = '#f4f8ff'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
function llamas(ctx, K, a, x, y, s = 1, n = 5) { for (let i = 0; i < n; i++) { const fx = x - 60 * s + i * 30 * s, fy = y - ((a.t * 140 + i * 37) % 90) * s; ctx.save(); ctx.globalAlpha = 0.9; K.prop(ctx, 'fuego', fx, fy, 0.2 * s, a.t + i); ctx.restore(); } }
function torre(ctx, x, gy, s = 1) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s);
  ln(ctx, [[-120, 0], [-70, -520]], '#7a4f2e', 18); ln(ctx, [[120, 0], [70, -520]], '#7a4f2e', 18);
  for (let i = 1; i < 5; i++) { const y = -i * 104, w = 120 - i * 10; ln(ctx, [[-w, y + 104], [w - 10, y]], '#8b5a2b', 9); ln(ctx, [[w, y + 104], [-w + 10, y]], '#8b5a2b', 9); }
  caja(ctx, -130, -680, 260, 170, 10, '#c98b55', 8); caja(ctx, -100, -650, 200, 80, 8, '#bfe4ff', 6);
  ctx.fillStyle = '#6b3a1e'; ctx.beginPath(); ctx.moveTo(-170, -680); ctx.lineTo(0, -790); ctx.lineTo(170, -680); ctx.fill(); ln(ctx, [[-170, -680], [0, -790], [170, -680]], INK, 8);
  ln(ctx, [[0, -790], [0, -870]], INK, 7); ctx.restore();
}
function camioneta(ctx, x, gy, s = 1, t = 0) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s);
  caja(ctx, -260, -190, 520, 130, 26, '#2e7d4f', 8); caja(ctx, -60, -310, 230, 130, [30, 30, 0, 0], '#2e7d4f', 8); caja(ctx, -35, -290, 180, 90, 12, '#bfe4ff', 6);
  ctx.fillStyle = '#fff'; ctx.font = '40px Anton'; ctx.textAlign = 'center'; ctx.fillText('PARK', -150, -110);
  [-160, 160].forEach((wx) => { circ(ctx, wx, -50, 62, '#2b2d42', 8); circ(ctx, wx, -50, 24, '#c0c0c8', 5); ln(ctx, [[wx, -50], [wx + Math.cos(t * 12) * 24, -50 + Math.sin(t * 12) * 24]], INK, 5); });
  ctx.restore();
}
function monte(ctx, a, gy, col = '#3f7a45') {
  ctx.fillStyle = '#58637e'; ctx.beginPath(); ctx.moveTo(0, gy - 200); ctx.lineTo(260, gy - 560); ctx.lineTo(520, gy - 260); ctx.lineTo(780, gy - 640); ctx.lineTo(W, gy - 300); ctx.lineTo(W, gy); ctx.lineTo(0, gy); ctx.fill();
  ctx.fillStyle = col; ctx.fillRect(0, gy, W, H - gy); ln(ctx, [[0, gy], [W, gy]], INK, 8);
  for (let i = 0; i < 7; i++) arbol(ctx, 40 + i * 170, gy + 20, 0.45, {});
}
function contador7(ctx, a, n, y = 1580) { for (let i = 0; i < 7; i++) { const x = W / 2 + (i - 3) * 130, on = i < n; ctx.save(); ctx.globalAlpha = on ? 1 : 0.25; ctx.translate(x, y); ctx.fillStyle = on ? '#ffd93d' : '#ffffff'; ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(10, -60); ctx.lineTo(-30, 8); ctx.lineTo(0, 8); ctx.lineTo(-14, 62); ctx.lineTo(34, -12); ctx.lineTo(4, -12); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); } }

const PLANOS = {
  // 0 — Rayo 1: estás en lo alto de una torre de vigilancia; el rayo cae sobre ella
  0: (ctx, a, K) => { const { ROY } = cast(K); const k = ph(a, 0.45, 0.6);
    temblor(ctx, a, k > 0 ? 10 * (1 - fase(a)) : 0, () => K.camara(ctx, a, () => { tormenta(ctx); nube(ctx, a, 420, 260, 1.3); nube(ctx, a, 900, 200, 1); const gy = 1650; monte(ctx, a, gy); torre(ctx, W / 2, gy, 1.25);
      const y = D(K, ctx, a, ROY, W / 2, gy - 650 * 1.25, 0.75, { pose: k > 0 ? 'miedo' : 'senala', mood: k > 0 ? 'miedo' : 'neutral', mira: 1 });
      rayo(ctx, 420, 320, W / 2 + 10, gy - 1090, k, 3); if (k > 0) K.sparkles(ctx, y.cabeza[0], y.cabeza[1], a.t, 12, 160); }, { ...V, de: 1.15, a: 1, foco: [W / 2, 900] }));
    fogonazo(ctx, ph(a, 0.45, 0.5) * (1 - ph(a, 0.5, 0.62))); titular(ctx, a, 'STRIKE #1', W / 2, 240, { size: 150, col: '#ffd93d', p0: 0.02 }); K.etiqueta(ctx, a, 'FIRE TOWER · 1942', W / 2, 400, { size: 46, p0: 0.2 }); },
  // 1 — El rayo te arranca la uña del dedo gordo: primer plano del pie, la bota sale volando y la uña gira
  1: (ctx, a, K) => { const k = sm(ph(a, 0.3, 0.85)), b = ph(a, 0.15, 0.3);
    temblor(ctx, a, b > 0 && b < 1 ? 14 : 0, () => K.camara(ctx, a, () => { cielo(ctx, '#3a3f58', '#7d86a8'); ctx.fillStyle = '#8b6b4a'; ctx.fillRect(0, 1450, W, H - 1450);
      ln(ctx, [[180, 400], [400, 1150]], '#e0b98f', 120); ln(ctx, [[180, 400], [400, 1150]], INK, 6);
      ctx.save(); ctx.translate(520, 1260); ctx.fillStyle = '#f0c8a0'; ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.beginPath(); ctx.ellipse(0, 0, 230, 120, -0.15, 0, 7); ctx.fill(); ctx.stroke();
      for (let i = 0; i < 5; i++) { const tx = 140 + i * -40 + 70, ty = -90 + i * 32, r = i ? 34 - i * 3 : 58; circ(ctx, tx + 60, ty, r, '#f0c8a0', 7); }
      if (b < 1) caja(ctx, 30, -140, 130, 60, 18, '#ffe9c9', 5); ctx.restore();
      ctx.save(); ctx.translate(lerp(560, 950, k), lerp(1250, 500, k) - Math.sin(k * Math.PI) * 300); ctx.rotate(k * 14); caja(ctx, -60, -26, 120, 52, 20, '#fff1d8', 7); ctx.restore();
      ctx.save(); ctx.translate(lerp(380, -200, k), lerp(1200, 700, k)); ctx.rotate(-k * 5); caja(ctx, -170, -90, 340, 180, 50, '#6b4423', 9); ctx.restore();
      if (b > 0) { K.smoke(ctx, 640, 1150, a.t, 7); rayo(ctx, 700, -40, 640, 1150, 1 - ph(a, 0.3, 0.45), 7, 20); } }, { ...V, de: 1, a: 1.2, foco: [620, 1200] }));
    fogonazo(ctx, b * (1 - ph(a, 0.3, 0.4))); titular(ctx, a, 'TOENAIL: GONE', W / 2, 250, { size: 120, col: '#ffffff', p0: 0.35 }); },
  // 2 — Rayo 2, carretera de montaña: el rayo da en la camioneta y las cejas desaparecen en humo
  2: (ctx, a, K) => { const { ROY } = cast(K); const k = ph(a, 0.25, 0.4), c = ph(a, 0.45, 0.75);
    K.camara(ctx, a, () => { tormenta(ctx); nube(ctx, a, 600, 260, 1.2); const gy = 1050; monte(ctx, a, gy, '#5f6b3f'); ctx.fillStyle = '#3a3a44'; ctx.fillRect(0, gy + 60, W, 160);
      for (let i = 0; i < 6; i++) caja(ctx, ((i * 220 - a.t * 300) % 1320) - 120, gy + 130, 120, 16, 4, '#ffd93d', 0);
      camioneta(ctx, W / 2 - 40, gy + 180, 1.2, a.t); rayo(ctx, 600, 330, W / 2, gy - 180, k, 11);
      // primer plano de la cara en una ventanilla redonda
      ctx.save(); ctx.translate(W / 2, 1520); circ(ctx, 0, 0, 300, '#bfe4ff', 12); ctx.beginPath(); ctx.arc(0, 0, 294, 0, 7); ctx.clip();
      const y = D(K, ctx, a, ROY, 0, 820, 2.8, { pose: 'quieto', mood: c > 0 ? 'sorpresa' : 'neutral', mira: 0 });
      if (c < 1) { const [hx, hy] = y.cabeza, hr = y.hr; ctx.globalAlpha = 1 - c; ln(ctx, [[hx - hr * 0.55, hy - hr * 0.42], [hx - hr * 0.15, hy - hr * 0.52]], '#3a2614', 18); ln(ctx, [[hx + hr * 0.15, hy - hr * 0.52], [hx + hr * 0.55, hy - hr * 0.42]], '#3a2614', 18); ctx.globalAlpha = 1; }
      if (c > 0) K.smoke(ctx, y.cabeza[0], y.cabeza[1] - y.hr * 0.6, a.t, 5); ctx.restore(); circ(ctx, W / 2, 1520, 300, null, 12); }, { ...V, de: 1.05, a: 1, foco: [W / 2, 1200] });
    fogonazo(ctx, k * (1 - ph(a, 0.4, 0.5))); titular(ctx, a, 'STRIKE #2', W / 2, 220, { size: 140, col: '#ffd93d' }); titular(ctx, a, 'EYEBROWS?', W / 2, 1000, { size: 100, p0: 0.5, rot: -0.05 }); },
  // 3 — Rayo 3: en el jardín de casa; el hombro chamuscado echa humo
  3: (ctx, a, K) => { const { ROY } = cast(K); const k = ph(a, 0.3, 0.45);
    K.camara(ctx, a, () => { cielo(ctx, '#ff9a5a', '#6a5a8a'); nube(ctx, a, 760, 260, 1); const gy = 1500;
      caja(ctx, 60, gy - 620, 520, 620, 10, '#f2e3c6', 8); ctx.fillStyle = '#b5523b'; ctx.beginPath(); ctx.moveTo(20, gy - 610); ctx.lineTo(320, gy - 880); ctx.lineTo(620, gy - 610); ctx.fill(); ln(ctx, [[20, gy - 610], [320, gy - 880], [620, gy - 610]], INK, 8);
      caja(ctx, 250, gy - 260, 140, 260, 8, '#7a4f2e', 7); caja(ctx, 110, gy - 480, 120, 110, 8, '#ffe6a8', 6); caja(ctx, 410, gy - 480, 120, 110, 8, '#ffe6a8', 6);
      ctx.fillStyle = '#6bab55'; ctx.fillRect(0, gy, W, H - gy); ln(ctx, [[0, gy], [W, gy]], INK, 8); for (let i = 0; i < 9; i++) ln(ctx, [[30 + i * 120, gy + 40], [30 + i * 120, gy - 40]], '#ffffff', 10);
      const y = D(K, ctx, a, ROY, 780, gy + 120, 1.9, { pose: k > 0 ? 'miedo' : 'anda', mood: k > 0 ? 'miedo' : 'feliz', mira: -1 });
      rayo(ctx, 760, 330, y.cabeza[0] + y.hr * 1.2, y.cabeza[1] + y.hr * 1.4, k, 5);
      if (k >= 1) { K.smoke(ctx, y.cabeza[0] + y.hr * 1.3, y.cabeza[1] + y.hr * 1.4, a.t, 6); ctx.save(); ctx.globalAlpha = 0.85; circ(ctx, y.cabeza[0] + y.hr * 1.3, y.cabeza[1] + y.hr * 1.6, 40, '#2b2020', 0); ctx.restore(); } }, { ...V, de: 1, a: 1.12, foco: [780, 1200] });
    fogonazo(ctx, k * (1 - ph(a, 0.45, 0.55))); titular(ctx, a, 'STRIKE #3', W / 2, 230, { size: 140, col: '#ffd93d' }); K.etiqueta(ctx, a, 'SHOULDER: SEARED', W / 2, 390, { size: 50, p0: 0.5 }); },
  // 4 — Rayo 4: dentro de la caseta de guardas; entra por la ventana y el pelo se prende
  4: (ctx, a, K) => { const { ROY, CO2 } = cast(K); const k = ph(a, 0.3, 0.42);
    K.camara(ctx, a, () => { const gy = fondo(ctx, a, 'oficina', { hora: 'noche' }, { cx: 900 }); caja(ctx, 640, 380, 360, 360, 10, '#2b2f45', 9); ln(ctx, [[820, 380], [820, 740]], INK, 8); ln(ctx, [[640, 560], [1000, 560]], INK, 8);
      rayo(ctx, 900, 400, 820, 700, ph(a, 0.2, 0.3), 9, 14);
      const y = D(K, ctx, a, ROY, 420, gy, 1.7, { pose: k > 0 ? 'miedo' : 'sentado', mood: k > 0 ? 'miedo' : 'neutral', mira: 1, sombrero: false });
      rayo(ctx, 820, 700, y.cabeza[0], y.cabeza[1] - y.hr, k, 13, 18);
      if (k >= 1) llamas(ctx, K, a, y.cabeza[0], y.cabeza[1] - y.hr * 0.8, 1.4);
      D(K, ctx, a, CO2, 900, gy + 40, 1.4, { pose: k > 0 ? 'miedo' : 'quieto', mood: k > 0 ? 'sorpresa' : 'neutral', mira: -1 }); }, { ...V, de: 1.08, a: 1, foco: [W / 2, 1200] });
    fogonazo(ctx, k * (1 - ph(a, 0.42, 0.5))); titular(ctx, a, 'STRIKE #4', W / 2, 230, { size: 140, col: '#ffd93d' }); titular(ctx, a, 'HAIR ON FIRE', W / 2, 380, { size: 90, col: '#ff6b3d', p0: 0.5 }); },
  // 5 — Los compañeros se apartan: te llaman el pararrayos humano
  5: (ctx, a, K) => { const { ROY, CO1, CO2, CO3 } = cast(K); const k = sm(ph(a, 0.1, 0.7));
    K.camara(ctx, a, () => { cielo(ctx, '#8fd0ff', '#dff2ff'); const gy = 1450; monte(ctx, a, gy, '#6bab55');
      const y = D(K, ctx, a, ROY, W / 2, gy, 1.5, { pose: 'saluda', mood: 'feliz', mira: 0 });
      ln(ctx, [[y.cabeza[0], y.cabeza[1] - y.hr * 1.6], [y.cabeza[0], y.cabeza[1] - y.hr * 3.2]], '#c0c0c8', 12); circ(ctx, y.cabeza[0], y.cabeza[1] - y.hr * 3.3, 16, '#ffd93d', 6);
      [[CO1, -1, 250], [CO2, 1, 270], [CO3, 1, 420]].forEach(([p, s, d], i) => { const x = W / 2 + s * (d + k * 260) * (i === 2 ? -1 : 1); D(K, ctx, a, p, x, gy + 30 + i * 30, 1.2, { pose: 'corre', mood: 'miedo', mira: x < W / 2 ? -1 : 1 }); }); }, { ...V, de: 1.05, a: 1, foco: [W / 2, 1200] });
    titular(ctx, a, 'HUMAN', W / 2, 240, { size: 140, p0: 0.2 }); titular(ctx, a, 'LIGHTNING ROD', W / 2, 390, { size: 110, col: '#ffd93d', p0: 0.35 }); },
  // 6 — Rayo 5: una nube sigue a tu camioneta; vuelve el fuego en el pelo
  6: (ctx, a, K) => { const k = ph(a, 0.6, 0.72), x = lerp(-150, 640, sm(ph(a, 0, 0.6)));
    K.camara(ctx, a, () => { cielo(ctx, '#ffb070', '#7a6a9a'); const gy = 1250; monte(ctx, a, gy, '#5f6b3f'); ctx.fillStyle = '#3a3a44'; ctx.fillRect(0, gy + 60, W, 160);
      nube(ctx, a, x, 360, 1.1); for (let i = 0; i < 6; i++) { ctx.save(); ctx.globalAlpha = 0.5; ln(ctx, [[x - 200 + i * 80, 520], [x - 220 + i * 80, 560 + ((a.t * 600 + i * 50) % 300)]], '#bfe4ff', 5); ctx.restore(); }
      camioneta(ctx, x, gy + 180, 1.1, a.t); K.speedLines && fase(a) < 0.6 && K.speedLines(ctx, x - 400, gy + 80, a.t, 0.3);
      rayo(ctx, x, 470, x + 30, gy - 160, k, 17); if (k >= 1) llamas(ctx, K, a, x + 40, gy - 150, 1.3); }, { ...V, de: 1, a: 1.08, foco: [W / 2, 1100] });
    fogonazo(ctx, k * (1 - ph(a, 0.72, 0.8))); titular(ctx, a, 'STRIKE #5', W / 2, 220, { size: 140, col: '#ffd93d' }); titular(ctx, a, 'IT FOLLOWS HIM', W / 2, 1600, { size: 90, p0: 0.25 }); titular(ctx, a, 'AGAIN.', W / 2, 1000, { size: 120, col: '#ff6b3d', p0: 0.75, rot: -0.06 }); },
  // 7 — Rayo 6: corres; la nube corre más
  7: (ctx, a, K) => { const { ROY } = cast(K); const k = ph(a, 0.7, 0.8), f = sm(ph(a, 0, 0.7)); const x = lerp(250, 820, f), cx = lerp(-200, 820, sm(ph(a, 0, 0.66)));
    K.camara(ctx, a, () => { tormenta(ctx); const gy = 1500; monte(ctx, a, gy);
      nube(ctx, a, cx, 420, 1.1); const y = D(K, ctx, a, ROY, x, gy + 40, 1.5, { pose: k > 0 ? 'miedo' : 'corre', mood: 'miedo', mira: 1 });
      if (k <= 0) K.speedLines(ctx, x - 220, y.cabeza[1] + 100, a.t, 0.3); rayo(ctx, cx, 540, y.cabeza[0], y.cabeza[1] - y.hr, k, 19);
      if (k >= 1) K.smoke(ctx, y.cabeza[0], y.cabeza[1], a.t, 6); }, { ...V, de: 1, a: 1.06, foco: [W / 2, 1200] });
    fogonazo(ctx, k * (1 - ph(a, 0.8, 0.88))); titular(ctx, a, 'STRIKE #6', W / 2, 220, { size: 140, col: '#ffd93d' }); titular(ctx, a, 'THE CLOUD WINS', W / 2, 1640, { size: 90, p0: 0.75 }); },
  // 8 — Rayo 7: pescando; pecho y tripa quemados
  8: (ctx, a, K) => { const { ROY } = cast(K); const k = ph(a, 0.4, 0.52);
    K.camara(ctx, a, () => { cielo(ctx, '#3a3f58', '#8d99ae'); nube(ctx, a, 700, 280, 1.2); const gy = 1250; monte(ctx, a, gy, '#5f8b4f');
      ctx.fillStyle = '#3d7ea6'; ctx.fillRect(560, gy + 60, 560, H); ln(ctx, [[560, gy + 60], [560, H]], INK, 8);
      for (let i = 0; i < 5; i++) ln(ctx, [[620 + i * 90, gy + 200 + Math.sin(a.t * 3 + i) * 10], [680 + i * 90, gy + 200 + Math.sin(a.t * 3 + i) * 10]], '#bfe4ff', 6);
      const y = D(K, ctx, a, ROY, 330, gy + 300, 1.7, { pose: k > 0 ? 'miedo' : 'sostiene', mood: k > 0 ? 'miedo' : 'feliz', mira: 1 });
      const [mx, my] = y.manoD || [y.cabeza[0] + 120, y.cabeza[1] + 200]; ln(ctx, [[mx, my], [900, gy - 160]], '#7a4f2e', 9); ln(ctx, [[900, gy - 160], [930, gy + 260 + Math.sin(a.t * 2) * 10]], '#ffffff', 3);
      rayo(ctx, 700, 380, y.cabeza[0] + 10, y.cabeza[1] + y.hr * 2.2, k, 23);
      if (k >= 1) { K.smoke(ctx, y.cabeza[0], y.cabeza[1] + y.hr * 2.4, a.t, 7); } }, { ...V, de: 1.05, a: 1, foco: [W / 2, 1300] });
    fogonazo(ctx, k * (1 - ph(a, 0.52, 0.6))); titular(ctx, a, 'STRIKE #7', W / 2, 220, { size: 140, col: '#ffd93d' }); K.etiqueta(ctx, a, 'CHEST + STOMACH BURNED', W / 2, 380, { size: 46, p0: 0.55 }); },
  // 9 — Un oso intenta robarte la trucha; le das con una rama
  9: (ctx, a, K) => { const { ROY } = cast(K); const s = ph(a, 0.45, 0.6), huye = sm(ph(a, 0.62, 1));
    K.camara(ctx, a, () => { const gy = fondo(ctx, a, 'bosque', { hora: 'dia' }, { cx: 900 });
      const ox = lerp(760, 1300, huye); ctx.save(); if (huye > 0) { ctx.translate(ox, 0); ctx.scale(-1, 1); ctx.translate(-ox, 0); } K.prop(ctx, 'oso', ox, gy - 230, 1.15, a.t); ctx.restore();
      ctx.save(); ctx.translate(lerp(560, 300, sm(s)), gy - 330); ctx.rotate(Math.sin(a.t * 8) * 0.2); K.prop(ctx, 'pez', 0, 0, 0.45, a.t); ctx.restore();
      const y = D(K, ctx, a, ROY, 300, gy + 20, 1.6, { pose: 'sostiene', mood: 'enfadado', mira: 1 });
      const [mx, my] = y.manoD || [y.cabeza[0] + 100, y.cabeza[1] + 150]; const ang = lerp(-2.2, 0.2, sm(s)); ln(ctx, [[mx, my], [mx + Math.cos(ang) * 380, my + Math.sin(ang) * 380]], '#7a4f2e', 26);
      if (s > 0 && s < 1) K.starBurst(ctx, 700, gy - 450, 120, '#ffd93d', 1); }, { ...V, de: 1.05, a: 1, foco: [W / 2, 1200] });
    titular(ctx, a, 'MY TROUT!', W / 2, 260, { size: 130, p0: 0.05 }); titular(ctx, a, 'WHACK!', 700, 760, { size: 160, col: '#ffd93d', p0: 0.47, rot: -0.12 }); },
  // 10 — Siete rayos. Un hombre.
  10: (ctx, a, K) => { const { ROY } = cast(K); const n = Math.min(7, Math.max(1, Math.floor(sm(ph(a, 0.05, 0.8)) * 7.99)));
    K.camara(ctx, a, () => { tormenta(ctx); for (let i = 0; i < n; i++) rayo(ctx, 100 + i * 150, 0, W / 2 + (i - 3) * 30, 900, 1, 40 + i, 10);
      const gy = 1400; ctx.fillStyle = '#3f5a45'; ctx.fillRect(0, gy, W, H - gy); D(K, ctx, a, ROY, W / 2, gy + 20, 1.8, { pose: 'brazos', mood: 'feliz', mira: 0 }); contador7(ctx, a, n); }, { ...V, de: 1.1, a: 1, foco: [W / 2, 1000] });
    titular(ctx, a, String(n), W / 2, 380, { size: 300, col: '#ffd93d' }); K.etiqueta(ctx, a, 'STRIKES · ONE MAN', W / 2, 500, { size: 50, p0: 0.3 }); },
  // 11 — Récord oficial: certificado con su nombre
  11: (ctx, a, K) => { const k = sm(ph(a, 0, 0.35));
    K.camara(ctx, a, () => { cielo(ctx, '#1f2a5a', '#4d5fa8'); K.sparkles(ctx, W / 2, 900, a.t, 16, 520);
      ctx.save(); ctx.translate(W / 2, 950); ctx.rotate((1 - k) * 0.4); ctx.scale(k, k); caja(ctx, -400, -520, 800, 1040, 20, '#fbf3df', 10); caja(ctx, -370, -490, 740, 980, 14, null, 5);
      ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.font = '70px Anton'; ctx.fillText('WORLD RECORD', 0, -380); ctx.font = '40px Poppins'; ctx.fillText('Most lightning strikes', 0, -260); ctx.fillText('survived', 0, -205);
      ctx.font = '230px Anton'; ctx.fillStyle = '#e8a400'; ctx.fillText('7', 0, 40); ctx.fillStyle = INK; ctx.font = '84px Anton'; ctx.fillText('ROY SULLIVAN', 0, 230);
      ln(ctx, [[-260, 260], [lerp(-260, 260, ph(a, 0.45, 0.7)), 260]], '#ff3b4e', 12); circ(ctx, 250, 400, 80, '#e8a400', 8); ctx.font = '40px Anton'; ctx.fillStyle = '#fff'; ctx.fillText('★', 250, 415); ctx.restore(); }, { ...V, de: 1, a: 1.08, foco: [W / 2, 950] });
    sello(ctx, a, 'OFFICIAL', 760, 1500, { p0: 0.7, size: 100 }); },
  // 12 — Y todo empezó con... (vuelve a la torre, el cielo se oscurece: bucle)
  12: (ctx, a, K) => { const { ROY } = cast(K); const k = ph(a, 0.85, 0.97);
    K.camara(ctx, a, () => { tormenta(ctx); nube(ctx, a, lerp(1300, 420, sm(ph(a, 0, 0.8))), 260, 1.3); const gy = 1650; monte(ctx, a, gy); torre(ctx, W / 2, gy, 1.25);
      D(K, ctx, a, ROY, W / 2, gy - 650 * 1.25, 0.75, { pose: 'senala', mood: 'duda', mira: -1 }); rayo(ctx, 420, 320, W / 2 + 10, gy - 1090, k, 3); }, { ...V, de: 1, a: 1.15, foco: [W / 2, 900] });
    fogonazo(ctx, k); titular(ctx, a, 'IT ALL STARTED', W / 2, 240, { size: 110, p0: 0.05 }); titular(ctx, a, 'WITH...', W / 2, 380, { size: 110, col: '#ffd93d', p0: 0.3 }); },
};
const BASE = (fn) => (ctx, a, K) => { cielo(ctx, '#3a3f58', '#3f5a45'); fn(ctx, a, K); };
export default Object.fromEntries(Object.entries(PLANOS).map(([k, f]) => [k, BASE(f)]));
