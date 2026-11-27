// pedido-35-01 — "A Spoon of Neutron Star" (Short vertical, estilo nuevo)
import { W, H, INK, V, sm, lerp, ph, hs, fondo, D, cielo, ln, circ, caja, titular, sello, estrellas } from '../../lib/corto.mjs';

let CAST = null;
function cast(K) {
  if (CAST) return CAST;
  const sin = { sombrero: null, corbata: null, barba: false, bigote: false };
  const [YOU] = K.reparto('pedido-35', 1, [{ ...sin, estilo: 'limpio', pelo: 'rizos', peloCol: '#2a1a10', ropa: '#9b5de5' }]);
  return (CAST = { YOU });
}
// Cuchara con una bolita azul brillante de materia de estrella
function cuchara(ctx, a, x, y, s = 1, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  caja(ctx, -16, 0, 32, 300, 16, '#c9d1dc', 7);
  ctx.fillStyle = '#c9d1dc'; ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.beginPath(); ctx.ellipse(0, -40, 80, 100, 0, 0, 7); ctx.fill(); ctx.stroke();
  const g = ctx.createRadialGradient(0, -50, 4, 0, -50, 70); g.addColorStop(0, '#ffffff'); g.addColorStop(0.4, '#8fe3ff'); g.addColorStop(1, '#2a7bff');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, -50, 62, 60, 0, 0, 7); ctx.fill();
  ctx.save(); ctx.globalAlpha = 0.35 + 0.2 * Math.sin(a.t * 6); circ(ctx, 0, -50, 100, '#8fe3ff', 0); ctx.restore();
  ctx.restore();
}
function cocina(ctx, a, gy) { return fondo(ctx, a, 'cocina', { hora: 'dia' }, { cx: 540 }); }
function mesa(ctx, x, y, w, comba = 0) {
  ctx.fillStyle = '#b5773f'; ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.quadraticCurveTo(x, y + comba, x + w / 2, y); ctx.lineTo(x + w / 2, y + 40); ctx.quadraticCurveTo(x, y + 40 + comba, x - w / 2, y + 40); ctx.closePath(); ctx.fill(); ctx.stroke();
  ln(ctx, [[x - w / 2 + 40, y + 40], [x - w / 2 + 60 + comba * 0.3, y + 300]], INK, 22); ln(ctx, [[x + w / 2 - 40, y + 40], [x + w / 2 - 60 - comba * 0.3, y + 300]], INK, 22);
}
function grieta(ctx, x, y, k, seed = 1, r = 200) { if (k <= 0) return; for (let i = 0; i < 6; i++) { const an = i / 6 * 6.28 + hs(seed + i); let px = x, py = y; const pts = [[px, py]]; for (let j = 1; j <= 4; j++) { px = x + Math.cos(an + (hs(seed + i * 9 + j) - 0.5)) * r * k * j / 4; py = y + Math.sin(an + (hs(seed + i * 7 + j) - 0.5)) * r * k * j / 4 * 0.5; pts.push([px, py]); } ln(ctx, pts, INK, 6); } }
// Corte transversal de la Tierra con la cuchara bajando (prof 0..1)
function corteTierra(ctx, a, prof) {
  cielo(ctx, '#0b0f2a', '#1b2150'); estrellas(ctx, a, 60);
  const cx = W / 2, cy = 1150, R = 470;
  [['#4caf50', 1], ['#8d5a3b', 0.96], ['#c0562a', 0.72], ['#ff8a3d', 0.5], ['#ffd23d', 0.25]].forEach(([c, f]) => circ(ctx, cx, cy, R * f, c, 8));
  ctx.save(); ctx.fillStyle = '#ffffff'; ctx.globalAlpha = 0.5; ctx.font = '40px Anton'; ctx.textAlign = 'center'; ctx.fillText('CORE', cx, cy + 15); ctx.restore();
  const y = lerp(cy - R - 30, cy - 20, prof); ln(ctx, [[cx, cy - R], [cx, y]], 'rgba(255,255,255,0.7)', 6);
  cuchara(ctx, a, cx, y, 0.45, Math.PI);
}

const PLANOS = {
  // 0 — Esta cuchara pesa más que todos los humanos juntos (balanza)
  0: (ctx, a, K) => { const k = sm(ph(a, 0.1, 0.6));
    K.camara(ctx, a, () => { cielo(ctx, '#1b2150', '#4a3a8a'); const ang = lerp(0, 0.35, k);
      ctx.save(); ctx.translate(W / 2, 1000); ctx.scale(1.15, 1.15); ctx.translate(-W / 2, -1000); ln(ctx, [[W / 2, 1600], [W / 2, 900]], INK, 26); circ(ctx, W / 2, 900, 30, '#ffd93d', 7);
      ctx.save(); ctx.translate(W / 2, 900); ctx.rotate(-ang); ln(ctx, [[-420, 0], [420, 0]], INK, 22);
      ctx.save(); ctx.translate(-420, 0); ctx.rotate(ang); ln(ctx, [[0, 0], [0, 160]], INK, 6); caja(ctx, -170, 160, 340, 30, 15, '#c9d1dc', 7); cuchara(ctx, a, 0, 120, 0.5, Math.PI / 2); ctx.restore();
      ctx.save(); ctx.translate(420, 0); ctx.rotate(ang); ln(ctx, [[0, 0], [0, 160]], INK, 6); caja(ctx, -170, 160, 340, 30, 15, '#c9d1dc', 7); for (let r = 0; r < 5; r++) for (let c = 0; c < 9 - r; c++) { const hx = -150 + r * 17 + c * 37, hy = 130 - r * 34; circ(ctx, hx, hy, 17, ['#f3c9a8', '#c68a5a', '#8d5a3b', '#ffe0c2'][(r + c) % 4], 4); } ctx.restore();
      ctx.restore(); ctx.restore(); }, { ...V, de: 1, a: 1.1, foco: [W / 2, 1000] });
    titular(ctx, a, 'THIS SPOON', W / 2, 280, { size: 140, p0: 0.02 }); titular(ctx, a, '> ALL HUMANS', W / 2, 440, { size: 120, col: '#ffd93d', p0: 0.35 }); },
  // 1 — Una cucharadita: mil millones de toneladas
  1: (ctx, a, K) => { const n = Math.round(sm(ph(a, 0.05, 0.75)) * 1000);
    K.camara(ctx, a, () => { cielo(ctx, '#0b0f2a', '#2a2f6a'); estrellas(ctx, a, 80); K.sparkles(ctx, W / 2, 1000, a.t, 12, 300); cuchara(ctx, a, W / 2, 1100, 1.6, 0); }, { ...V, de: 1, a: 1.15, foco: [W / 2, 1000] });
    K.contador(ctx, a, n >= 1000 ? '1 BILLION' : n + ' MILLION', W / 2, 320, { size: 120 }); titular(ctx, a, 'TONS', W / 2, 500, { size: 150, col: '#8fe3ff', p0: 0.75 }); },
  // 2 — Agarras el mango. La mesa cruje.
  2: (ctx, a, K) => { const { YOU } = cast(K); const k = sm(ph(a, 0.2, 0.9));
    K.camara(ctx, a, () => { const gy = cocina(ctx, a); mesa(ctx, 620, 1250, 640, k * 90); cuchara(ctx, a, 600, 1230 + k * 80, 0.6, Math.PI / 2 - 0.1);
      D(K, ctx, a, YOU, 330, gy, 1.7, { pose: 'sostiene', mood: k > 0.4 ? 'sorpresa' : 'neutral', mira: 1 });
      if (k > 0.3) K.globo(ctx, a, 'CREEEAK', 700, 950, { p0: 0.35, grito: true }); }, { ...V, de: 1, a: 1.1, foco: [560, 1200], temblor: k * 4 });
    titular(ctx, a, 'GRAB IT...', W / 2, 280, { size: 150 }); },
  // 3 — Tu brazo no se mueve ni un centímetro
  3: (ctx, a, K) => { const { YOU } = cast(K); const tira = Math.sin(a.t * 18) * 4;
    K.camara(ctx, a, () => { const gy = cocina(ctx, a); mesa(ctx, 700, 1250, 560, 90); cuchara(ctx, a, 660, 1310, 0.6, Math.PI / 2 - 0.1);
      const y = D(K, ctx, a, YOU, 380 + tira, gy, 1.8, { pose: 'empuja', mood: 'enfado', mira: 1 }); K.smoke && ph(a, 0.4, 1) > 0 && K.sparkles(ctx, y.cabeza[0], y.cabeza[1] - y.hr, a.t, 4, 60); }, { ...V, de: 1.05, a: 1.15, foco: [560, 1200], temblor: 3 });
    titular(ctx, a, 'NOT ONE', W / 2, 280, { size: 150, p0: 0.02 }); titular(ctx, a, 'INCH', W / 2, 450, { size: 170, col: '#ff6b3d', p0: 0.3 }); },
  // 4 — Ninguna grúa de la Tierra podría levantarla (la grúa se dobla)
  4: (ctx, a, K) => { const k = sm(ph(a, 0.15, 0.85));
    K.camara(ctx, a, () => { const gy = fondo(ctx, a, 'bloques', { hora: 'dia' }, { cx: 540 }); const bx = 300, top = 500;
      ln(ctx, [[bx, gy], [bx, top]], '#ffb703', 40); ln(ctx, [[bx, gy], [bx, top]], INK, 8);
      const tipX = lerp(900, 780, k), tipY = lerp(top, top + 520, k); ctx.save(); ctx.strokeStyle = '#ffb703'; ctx.lineWidth = 34; ctx.beginPath(); ctx.moveTo(bx, top); ctx.quadraticCurveTo(lerp(600, 620, k), lerp(top, top + 80, k), tipX, tipY); ctx.stroke(); ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.stroke(); ctx.restore();
      ln(ctx, [[tipX, tipY], [tipX, gy - 60]], INK, 5); cuchara(ctx, a, tipX, gy - 60, 0.6, Math.PI);
      if (k > 0.7) K.globo(ctx, a, 'SNAP!', 700, 420, { p0: 0.75, grito: true }); }, { ...V, de: 1, a: 1.08, foco: [W / 2, 1100], temblor: k * 3 });
    titular(ctx, a, 'NO CRANE', W / 2, 260, { size: 150 }); K.etiqueta(ctx, a, 'COULD LIFT IT', W / 2, 410, { size: 56, p0: 0.3 }); },
  // 5 — La sueltas. No toca el suelo.
  5: (ctx, a, K) => { const { YOU } = cast(K); const cae = sm(ph(a, 0.25, 0.75));
    K.camara(ctx, a, () => { const gy = cocina(ctx, a); const y = D(K, ctx, a, YOU, 330, gy, 1.8, { pose: 'quieto', mood: cae > 0.5 ? 'sorpresa' : 'neutral', mira: 1 });
      cuchara(ctx, a, 680, lerp(1050, gy + 40, cae), 0.55, Math.PI); if (cae > 0.5) K.simbolo(ctx, a, y.cabeza, y.hr, '?', 0.6); }, { ...V, de: 1, a: 1.1, foco: [520, 1200] });
    titular(ctx, a, 'YOU LET GO', W / 2, 280, { size: 140 }); },
  // 6 — Lo atraviesa
  6: (ctx, a, K) => { const k = sm(ph(a, 0.05, 0.7));
    K.camara(ctx, a, () => { cielo(ctx, '#e8d9c0', '#d2bc98'); const gy = 1000; ctx.fillStyle = '#8a6a4a'; ctx.fillRect(0, gy, W, H - gy); ln(ctx, [[0, gy], [W, gy]], INK, 10);
      for (let i = 0; i < 6; i++) caja(ctx, i * 180, gy - 40, 180, 40, 0, i % 2 ? '#f3efe6' : '#d9d2c3', 5);
      ctx.fillStyle = '#1a120c'; ctx.beginPath(); ctx.ellipse(W / 2, gy - 10, 90, 26, 0, 0, 7); ctx.fill(); grieta(ctx, W / 2, gy - 10, k, 3, 260);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip(); cuchara(ctx, a, W / 2, lerp(700, 1700, k), 0.5, Math.PI); ctx.restore();
      for (let i = 0; i < 10; i++) { const f = ph(a, 0.05, 0.6); circ(ctx, W / 2 + (hs(i) - 0.5) * 400 * f, gy - 10 - Math.sin(f * 3) * 200 * hs(i + 4) + f * f * 200, 14, '#d9d2c3', 4); } }, { ...V, de: 1.05, a: 1.15, foco: [W / 2, 1000], temblor: (1 - k) * 4 });
    titular(ctx, a, 'IT GOES', W / 2, 280, { size: 150 }); titular(ctx, a, 'THROUGH', W / 2, 450, { size: 170, col: '#ffd93d', p0: 0.25 }); },
  // 7 — Por las baldosas, por la roca madre (capas que pasan)
  7: (ctx, a, K) => { const off = a.t * 900;
    K.camara(ctx, a, () => { const capas = ['#d9d2c3', '#8a6a4a', '#6b4e35', '#7a7a80', '#5a5a62', '#8a3a2a'];
      for (let i = -1; i < 8; i++) { const y = ((i * 320 - off) % (320 * 6) + 320 * 6) % (320 * 6) - 320; caja(ctx, -10, y, W + 20, 320, 0, capas[((i % 6) + 6) % 6], 6); for (let j = 0; j < 5; j++) circ(ctx, hs(i * 7 + j) * W, y + 60 + hs(j + i) * 200, 20 + hs(j * 3 + i) * 30, 'rgba(0,0,0,0.15)', 0); }
      K.speedLines(ctx, W / 2, 1000, a.t, 0.6); cuchara(ctx, a, W / 2, 1050, 0.6, Math.PI); }, { ...V, de: 1, a: 1.05, foco: [W / 2, 1000], temblor: 2 });
    titular(ctx, a, 'TILES.', W / 2, 260, { size: 130 }); titular(ctx, a, 'BEDROCK.', W / 2, 420, { size: 150, col: '#ffd93d', p0: 0.4 }); },
  // 8 — Hacia abajo, hacia el centro de la Tierra
  8: (ctx, a, K) => { K.camara(ctx, a, () => corteTierra(ctx, a, sm(ph(a, 0.05, 0.95))), { ...V, de: 1, a: 1.08, foco: [W / 2, 1150] });
    titular(ctx, a, 'TO THE CENTER', W / 2, 260, { size: 120 }); titular(ctx, a, 'OF THE EARTH', W / 2, 400, { size: 110, col: '#ff8a3d', p0: 0.3 }); },
  // 9 — ¿La estrella de origen? Doce millas de ancho
  9: (ctx, a, K) => { const k = sm(ph(a, 0.1, 0.7));
    K.camara(ctx, a, () => { cielo(ctx, '#05071a', '#141a44'); estrellas(ctx, a, 120); const r = 260; const g = ctx.createRadialGradient(W / 2, 1050, 10, W / 2, 1050, r * 2); g.addColorStop(0, '#ffffff'); g.addColorStop(0.25, '#8fe3ff'); g.addColorStop(1, 'rgba(42,123,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); circ(ctx, W / 2, 1050, r, '#bdf0ff', 8);
      ctx.save(); ctx.translate(W / 2, 1050); ctx.rotate(a.t * 2); ln(ctx, [[0, -700], [0, 700]], 'rgba(143,227,255,0.5)', 30); ctx.restore();
      if (k > 0) { ln(ctx, [[W / 2 - r, 1400], [W / 2 - r + 2 * r * k, 1400]], '#ffd93d', 10); } }, { ...V, de: 1, a: 1.1, foco: [W / 2, 1050] });
    titular(ctx, a, 'THE STAR?', W / 2, 280, { size: 150 }); K.etiqueta(ctx, a, '12 MILES WIDE', W / 2, 1500, { size: 64, p0: 0.5 }); },
  // 10 — Más pequeña que una ciudad, más pesada que el Sol
  10: (ctx, a, K) => { const k = sm(ph(a, 0.4, 0.8));
    K.camara(ctx, a, () => { cielo(ctx, '#1b2150', '#3a4a8a'); for (let i = 0; i < 9; i++) caja(ctx, 80 + i * 105, 1500 - 120 - hs(i) * 280, 90, 120 + hs(i) * 280, 6, '#5a6a9a', 6);
      circ(ctx, 300, 1150, 110, '#bdf0ff', 8); ctx.fillStyle = INK; ctx.font = '48px Anton'; ctx.textAlign = 'center'; ctx.fillText('STAR', 300, 1166);
      ctx.save(); ctx.globalAlpha = k; circ(ctx, 760, 800, 260, '#ffd23d', 8); ctx.fillStyle = INK; ctx.font = '90px Anton'; ctx.fillText('SUN', 760, 830); ctx.font = '70px Anton'; ctx.fillText('< LIGHTER', 760, 1130); ctx.restore(); }, { ...V, de: 1, a: 1.05, foco: [W / 2, 1100] });
    titular(ctx, a, '< A CITY', W / 2, 260, { size: 130 }); titular(ctx, a, '> OUR SUN', W / 2, 1780 - 60, { size: 140, col: '#ffd93d', p0: 0.45 }); },
  // 11 — Y por eso exactamente... (bucle: la cuchara brilla de nuevo)
  11: (ctx, a, K) => { const { YOU } = cast(K);
    K.camara(ctx, a, () => { const gy = cocina(ctx, a); D(K, ctx, a, YOU, 330, gy, 1.8, { pose: 'senala', mood: 'sorpresa', mira: 1 }); cuchara(ctx, a, 720, 1100, 0.9, 0); K.sparkles(ctx, 720, 1060, a.t, 8, 160); }, { ...V, de: 1, a: 1.15, foco: [600, 1100] });
    titular(ctx, a, "AND THAT'S WHY...", W / 2, 300, { size: 110, col: '#ffd93d' }); },
};
const BASE = (fn) => (ctx, a, K) => { cielo(ctx, '#1b2150', '#4a3a8a'); fn(ctx, a, K); };
export default Object.fromEntries(Object.entries(PLANOS).map(([k, f]) => [k, BASE(f)]));
