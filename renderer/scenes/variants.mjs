// Variantes visuales de las escenas más usadas (mismo significado, otro dibujo) para que los vídeos no se repitan.
// Si el guion no elige "style", cada plano elige una al azar (según su semilla): dos mapas seguidos salen distintos.
import { W, H, PALETTE as P, rr, radial, rgba, seg, ease, clamp, noise1 } from '../lib/util.mjs';
import { linearBg } from './vehicle.mjs';

function pinDrop(ctx, px, py, t, color = P.red) {
  const k = ease.outBack(seg(t, 0.2, 0.6));
  const ring = (t * 0.8) % 1;
  ctx.strokeStyle = rgba(color, 0.6 * (1 - ring)); ctx.lineWidth = 4;
  ctx.beginPath(); ctx.ellipse(px, py, 40 + ring * 140, (40 + ring * 140) * 0.4, 0, 0, 7); ctx.stroke();
  ctx.save(); ctx.translate(px, py - (1 - k) * 300);
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(0, -150, 70, Math.PI * 0.85, Math.PI * 0.15); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, -150, 26, 0, 7); ctx.fill();
  ctx.restore();
  return k;
}
function placeLabel(ctx, params, x, y, k, { card = false, dark = false } = {}) {
  if (!params.place) return;
  ctx.save(); ctx.globalAlpha = clamp(k); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (card) {
    ctx.font = '700 60px Poppins';
    const w = Math.min(W - 80, Math.max(ctx.measureText(params.place).width, params.detail ? ctx.measureText(params.detail).width * 0.65 : 0) + 100);
    const h = params.detail ? 190 : 130;
    ctx.fillStyle = dark ? 'rgba(10,14,30,0.85)' : 'rgba(255,255,255,0.95)'; rr(ctx, x - w / 2, y - 65, w, h, 30); ctx.fill();
  }
  ctx.fillStyle = card && !dark ? '#14161c' : '#fff'; ctx.font = '700 60px Poppins'; ctx.fillText(params.place, x, y);
  if (params.detail) { ctx.font = '400 38px Poppins'; ctx.fillStyle = card && !dark ? '#555b66' : 'rgba(255,255,255,0.75)'; ctx.fillText(params.detail, x, y + 62); }
  ctx.restore();
}

// ---------------- MAPAS ----------------
export const MAP_VARIANTS = {
  // Globo terráqueo girando en el espacio
  globo(ctx, s, { t, params }) {
    ctx.fillStyle = '#03040a'; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 160; i++) { ctx.fillStyle = `rgba(255,255,255,${0.2 + noise1(i, 4) * 0.6})`; ctx.fillRect((i * 137) % W, (i * 251) % H, 2, 2); }
    const cx = W / 2, cy = 1000, R = 400;
    radial(ctx, cx, cy, R * 1.5, '#4f8cff', 0.25);
    const g = ctx.createRadialGradient(cx - 140, cy - 160, 40, cx, cy, R);
    g.addColorStop(0, '#2f6fd0'); g.addColorStop(1, '#0b2252');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.clip();
    const rot = t * 0.15 + s.phase;
    ctx.fillStyle = '#3f9a5a';
    for (const [lon, lat, rx, ry] of s.blobs) {
      const x = Math.sin(lon + rot), z = Math.cos(lon + rot);
      if (z < -0.1) continue;
      ctx.globalAlpha = clamp(z + 0.3);
      ctx.beginPath(); ctx.ellipse(cx + x * R * Math.cos(lat), cy + Math.sin(lat) * R, rx * (0.4 + 0.6 * z), ry, 0, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 2;
    for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.ellipse(cx, cy + i * 150, Math.sqrt(Math.max(0, R * R - (i * 150) ** 2)), 30, 0, 0, 7); ctx.stroke(); }
    const sh = ctx.createRadialGradient(cx + 200, cy + 200, 50, cx, cy, R * 1.1); sh.addColorStop(0, 'rgba(0,0,0,0.55)'); sh.addColorStop(0.6, 'rgba(0,0,0,0)');
    ctx.fillStyle = sh; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
    ctx.restore();
    const k = pinDrop(ctx, cx + 60, cy - 40, t);
    placeLabel(ctx, params, cx, 1560, k);
  },
  // Plano de calles visto desde arriba (como un navegador)
  calles(ctx, s, { t, params }) {
    ctx.fillStyle = '#e8e2d4'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#d6cfbd';
    for (let y = -40; y < H; y += 220) for (let x = -40; x < W; x += 260) rr(ctx, x + (y / 220 % 2) * 40, y, 200, 170, 14), ctx.fill();
    ctx.fillStyle = '#b9d8a6'; rr(ctx, 600, 320, 380, 300, 30); ctx.fill(); // parque
    ctx.strokeStyle = '#8ec3e6'; ctx.lineWidth = 70; ctx.beginPath(); ctx.moveTo(-50, 1500); ctx.bezierCurveTo(300, 1300, 700, 1750, 1150, 1450); ctx.stroke(); // río
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 34;
    for (const [x0, y0, x1, y1] of [[0, 760, W, 700], [380, 0, 420, H], [0, 1200, W, 1260], [800, 0, 760, H]]) { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }
    // ruta animada
    const k = clamp(t / 1.4);
    ctx.strokeStyle = '#3b7bff'; ctx.lineWidth = 16; ctx.lineCap = 'round';
    const pts = [[120, 1860], [400, 1230], [420, 730], [600, 715], [W / 2 + 40, 980]];
    ctx.beginPath(); ctx.moveTo(...pts[0]);
    const n = pts.length - 1, f = k * n;
    for (let i = 1; i <= Math.ceil(f); i++) { const a = pts[i - 1], b = pts[i], u = Math.min(1, f - (i - 1)); ctx.lineTo(a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u); }
    ctx.stroke(); ctx.lineCap = 'butt';
    // franja oscura arriba para que los subtítulos blancos se lean sobre el plano claro
    const sh = ctx.createLinearGradient(0, 0, 0, 620); sh.addColorStop(0, 'rgba(8,10,18,0.92)'); sh.addColorStop(0.65, 'rgba(8,10,18,0.6)'); sh.addColorStop(1, 'rgba(8,10,18,0)');
    ctx.fillStyle = sh; ctx.fillRect(0, 0, W, 620);
    const kp = pinDrop(ctx, W / 2 + 40, 980, Math.max(0, t - 0.8));
    placeLabel(ctx, params, W / 2, 1440, kp, { card: true });
  },
  // Mapa de relieve con curvas de nivel
  relieve(ctx, s, { t, params }) {
    ctx.fillStyle = linearBg(ctx, 0, 0, 0, H, ['#1d3b2a', '#2f5a3a', '#4a6a3a', '#6a6a40']); ctx.fillRect(0, 0, W, H);
    for (const [cx, cy, n] of s.peaks) {
      for (let i = n; i > 0; i--) {
        ctx.strokeStyle = `rgba(240,230,200,${0.12 + i * 0.03})`; ctx.lineWidth = 3;
        ctx.beginPath();
        for (let a = 0; a <= 6.3; a += 0.2) {
          const rad = i * 55 * (1 + 0.15 * Math.sin(a * 3 + cx));
          a ? ctx.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad * 0.8) : ctx.moveTo(cx + rad, cy);
        }
        ctx.closePath(); ctx.stroke();
      }
    }
    ctx.strokeStyle = '#6fb6d6'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(0, 300); ctx.bezierCurveTo(400, 600, 200, 1300, 1080, 1700); ctx.stroke();
    const k = pinDrop(ctx, W / 2, 1100, t, '#ff5a3a');
    placeLabel(ctx, params, W / 2, 1300, k, { card: true, dark: true });
  },
};
export function mapSetup(r) {
  return {
    phase: r.range(0, 6),
    blobs: Array.from({ length: 9 }, () => [r.range(0, 6.28), r.range(-1, 1), r.range(70, 160), r.range(50, 120)]),
    peaks: Array.from({ length: 4 }, () => [r.range(100, W - 100), r.range(300, H - 400), r.int(4, 8)]),
  };
}

// ---------------- CALENDARIOS ----------------
export const CAL_VARIANTS = {
  // Calendario de pared: se van tachando los días
  pared(ctx, s, { t, params, dur }) {
    ctx.fillStyle = linearBg(ctx, 0, 0, 0, H, ['#16110c', '#2a1f14', '#120d09']); ctx.fillRect(0, 0, W, H);
    radial(ctx, W / 2, 900, 700, P.amber, 0.14);
    const target = clamp(Math.round(Number(params.day) || 1), 1, 31);
    const x0 = 110, y0 = 700, cw = 860, ch = 860;
    ctx.fillStyle = '#f2ece0'; rr(ctx, x0, y0 - 160, cw, ch + 180, 24); ctx.fill();
    ctx.fillStyle = '#2b4a7a'; rr(ctx, x0, y0 - 160, cw, 150, 24); ctx.fill(); ctx.fillRect(x0, y0 - 40, cw, 30);
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '700 64px Poppins';
    ctx.fillText(String(params.month || 'DÍAS').toUpperCase(), W / 2, y0 - 90);
    const cell = cw / 7;
    const shown = Math.ceil(target * clamp(t / Math.max(0.8, Math.min(dur * 0.7, 2.5))));
    for (let d = 1; d <= 31; d++) {
      const cx = x0 + ((d - 1) % 7) * cell + cell / 2, cy = y0 + 40 + Math.floor((d - 1) / 7) * cell + cell / 2;
      ctx.fillStyle = d === target ? '#c0262e' : '#3a3530'; ctx.font = `${d === target ? 700 : 500} 44px Poppins`;
      ctx.fillText(String(d), cx, cy);
      if (d < shown || (d === shown && d < target)) {
        ctx.strokeStyle = 'rgba(200,40,40,0.85)'; ctx.lineWidth = 8; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(cx - 34, cy - 34); ctx.lineTo(cx + 34, cy + 34); ctx.moveTo(cx + 34, cy - 34); ctx.lineTo(cx - 34, cy + 34); ctx.stroke();
      }
      if (d === target && shown >= target) { ctx.strokeStyle = '#c0262e'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(cx, cy, 52, 0, 7); ctx.stroke(); }
    }
    if (params.label) { ctx.font = '600 50px Poppins'; ctx.fillStyle = '#f2ece0'; ctx.fillText(params.label, W / 2, y0 + ch + 120); }
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.lineCap = 'butt';
  },
  // Marcas de recuento en una pared (supervivencia, encierro, días contados)
  marcas(ctx, s, { t, params, dur }) {
    ctx.fillStyle = linearBg(ctx, 0, 0, 0, H, ['#2a2622', '#3a342c', '#1e1b18']); ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 40; i++) { ctx.fillStyle = `rgba(0,0,0,${0.08 + noise1(i, 9) * 0.12})`; ctx.fillRect((i * 97) % W, (i * 173) % H, 120, 6); }
    radial(ctx, W / 2, 700, 600, '#ffe2b0', 0.18);
    const target = Math.max(1, Math.round(Number(params.day) || 1));
    const n = Math.min(target, 60);
    const shown = Math.ceil(n * clamp(t / Math.max(0.8, Math.min(dur * 0.7, 2.5))));
    ctx.strokeStyle = 'rgba(240,235,220,0.9)'; ctx.lineWidth = 9; ctx.lineCap = 'round';
    for (let i = 0; i < shown; i++) {
      const g = Math.floor(i / 5), j = i % 5;
      const gx = 140 + (g % 4) * 220, gy = 420 + Math.floor(g / 4) * 230;
      ctx.beginPath();
      if (j < 4) { ctx.moveTo(gx + j * 36, gy); ctx.lineTo(gx + j * 36 + 6, gy + 160); }
      else { ctx.moveTo(gx - 20, gy + 140); ctx.lineTo(gx + 150, gy + 20); }
      ctx.stroke();
    }
    ctx.lineCap = 'butt';
    ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.font = '200px Anton';
    ctx.lineWidth = 14; ctx.strokeStyle = '#000';
    const txt = `${String(params.month || 'DÍA').toUpperCase()} ${target}`;
    ctx.strokeText(txt, W / 2, 1620); ctx.fillText(txt, W / 2, 1620);
    if (params.label) { ctx.font = '600 48px Poppins'; ctx.fillStyle = '#e8dcc4'; ctx.fillText(params.label, W / 2, 1720); }
    ctx.textAlign = 'left';
  },
};

// ---------------- NOTICIAS ----------------
function wrapText(ctx, text, maxW) {
  const words = String(text || '').split(/\s+/); const lines = []; let cur = '';
  for (const w of words) { const tt = cur ? cur + ' ' + w : w; if (ctx.measureText(tt).width > maxW && cur) { lines.push(cur); cur = w; } else cur = tt; }
  if (cur) lines.push(cur); return lines;
}
export const NEWS_VARIANTS = {
  // Noticia en una tablet (web de noticias con "ÚLTIMA HORA")
  web(ctx, s, { t, params }) {
    ctx.fillStyle = linearBg(ctx, 0, 0, 0, H, ['#0a0c14', '#151a2a', '#08090f']); ctx.fillRect(0, 0, W, H);
    radial(ctx, W / 2, 1000, 700, P.cyan, 0.12);
    const x = 110, y = 420, w = 860, h = 1180;
    ctx.fillStyle = '#1c1f26'; rr(ctx, x - 26, y - 26, w + 52, h + 52, 50); ctx.fill();
    ctx.fillStyle = '#ffffff'; rr(ctx, x, y, w, h, 26); ctx.fill();
    ctx.fillStyle = '#c62f2f'; ctx.fillRect(x, y + 26, w, 90);
    ctx.fillStyle = '#fff'; ctx.font = '700 44px Poppins'; ctx.textBaseline = 'middle';
    ctx.fillText((params.kicker || 'NOTICIAS').toUpperCase(), x + 40, y + 72);
    const blink = Math.sin(t * 6) > 0;
    ctx.fillStyle = '#ffd34a'; rr(ctx, x + 40, y + 150, 300, 56, 12); ctx.fill();
    ctx.fillStyle = '#1a1206'; ctx.font = '700 32px Poppins'; ctx.fillText(blink ? '● ÚLTIMA HORA' : '  ÚLTIMA HORA', x + 56, y + 179);
    ctx.fillStyle = '#121418'; ctx.font = '700 62px Poppins'; ctx.textBaseline = 'alphabetic';
    const lines = wrapText(ctx, params.headline, w - 80).slice(0, 4);
    lines.forEach((l, i) => ctx.fillText(l, x + 40, y + 300 + i * 74));
    const yi = y + 330 + lines.length * 74;
    ctx.fillStyle = '#d6dbe3'; rr(ctx, x + 40, yi, w - 80, 320, 18); ctx.fill();
    radial(ctx, x + w / 2, yi + 160, 220, '#9aa6b8', 0.6);
    ctx.fillStyle = '#7a808c'; ctx.font = '400 30px Poppins'; ctx.fillText(params.date || '', x + 40, yi + 370);
    ctx.fillStyle = '#c9ced8';
    for (let i = 0; i < 4; i++) rr(ctx, x + 40, yi + 410 + i * 46, (w - 80) * (i === 3 ? 0.55 : 1), 18, 9), ctx.fill();
    ctx.textBaseline = 'alphabetic';
  },
  // Portada de periódico grande, plana, con foto en blanco y negro
  portada(ctx, s, { t, params }) {
    ctx.fillStyle = '#0b0a09'; ctx.fillRect(0, 0, W, H);
    const k = ease.out(clamp(t * 1.5));
    ctx.save(); ctx.translate(W / 2, 1000); ctx.rotate(0.03 - k * 0.03); ctx.scale(1.12 - k * 0.12, 1.12 - k * 0.12);
    const pw = 920, ph = 1300;
    ctx.fillStyle = '#f1ead8'; ctx.fillRect(-pw / 2, -ph / 2, pw, ph);
    ctx.fillStyle = '#111'; ctx.textAlign = 'center';
    ctx.font = '700 74px Poppins'; ctx.fillText(String(params.kicker || 'LA GACETA').toUpperCase(), 0, -ph / 2 + 100);
    ctx.fillRect(-pw / 2 + 30, -ph / 2 + 130, pw - 60, 6); ctx.fillRect(-pw / 2 + 30, -ph / 2 + 190, pw - 60, 2);
    ctx.font = '400 26px Poppins'; ctx.fillText(params.date || '', 0, -ph / 2 + 168);
    ctx.font = '86px Anton';
    const lines = wrapText(ctx, String(params.headline || '').toUpperCase(), pw - 80).slice(0, 3);
    lines.forEach((l, i) => ctx.fillText(l, 0, -ph / 2 + 300 + i * 96));
    const yi = -ph / 2 + 330 + lines.length * 96;
    ctx.fillStyle = '#3a3733'; ctx.fillRect(-pw / 2 + 40, yi, 520, 420);
    for (let i = 0; i < 300; i++) { ctx.fillStyle = `rgba(255,255,255,${noise1(i, 2) * 0.12})`; ctx.beginPath(); ctx.arc(-pw / 2 + 40 + (i * 53) % 520, yi + (i * 31) % 420, 4, 0, 7); ctx.fill(); }
    ctx.fillStyle = 'rgba(17,17,17,0.55)';
    for (let c = 0; c < 2; c++) for (let i = 0; i < 12; i++) ctx.fillRect(-pw / 2 + 590 + c * 0, yi + i * 36 + (c ? 0 : 0), c ? 0 : 290, 12);
    for (let col = 0; col < 3; col++) for (let i = 0; i < 6; i++) ctx.fillRect(-pw / 2 + 40 + col * 290, yi + 460 + i * 34, 260, 12);
    ctx.restore();
  },
};

export function pickVariant(r, params, names) {
  const want = String(params.style || '').toLowerCase();
  return names.includes(want) ? want : names[Math.floor(r() * names.length)];
}
