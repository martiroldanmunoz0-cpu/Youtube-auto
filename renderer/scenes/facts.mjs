import { brightBg, INK } from '../lib/brightbg.mjs';
import { MAP_VARIANTS, NEWS_VARIANTS, mapSetup, pickVariant } from './variants.mjs';
// Escenas para datos curiosos: cifra grande, recorte de periódico, mapa con chincheta.
import { W, H, PALETTE as P, rr, radial, rgba, seg, ease, lerp, clamp } from '../lib/util.mjs';
import { makeDust, drawDust, makeBokeh, drawBokeh } from '../lib/fx.mjs';
import { linearBg } from './vehicle.mjs';
import { drawPlace, midShot, grade, placeName } from './bright.mjs';
import { personaWho } from '../lib/persona.mjs';

function fitFont(ctx, text, weight, maxSize, maxW) {
  let size = maxSize;
  do { ctx.font = `${weight} ${size}px Poppins`; size -= 6; } while (ctx.measureText(text).width > maxW && size > 30);
  return size + 6;
}

// Cifra o palabra gigante. params: { text, label?, color?, count_up?: bool }
export const big_text = {
  setup(p, r) { return { dust: makeDust(r, 70), bokeh: makeBokeh(r, 10, { rMin: 80, rMax: 200 }) }; },
  draw(ctx, s, { t, params, seed }) {
    const col = params.color || P.amber;
    // Nunca una cifra sola sobre un fondo vacío: el lugar del vídeo, animado, con la persona reaccionando abajo
    const lugar = params.lugar && params.lugar !== 'fondo' ? placeName(params.lugar) : null;
    const hora = ['dia', 'atardecer', 'noche'].includes(params.hora) ? params.hora : 'dia';
    if (lugar) {
      drawPlace(ctx, lugar, hora, t);
      if (params.persona !== 'no') midShot(ctx, personaWho(seed, params), { x: W / 2 + 60, y: 1330, s: 0.62, mood: params.mood || 'shocked', t, seed: 7 });
      grade(ctx, hora);
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(0, 0, W, H); // aclara un poco para que la cifra destaque
    } else brightBg(ctx, t, ['crema', 'azul', 'verde', 'rosa', 'lila'][Math.abs(String(params.text || '').length) % 5]);
    radial(ctx, W / 2, lugar ? 640 : 1050, 600, col, 0.25);
    let text = String(params.text ?? '');
    // Animación de contador si el texto empieza por número
    const m = text.match(/^([\d.,]+)(.*)$/);
    if (params.count_up !== false && m) {
      const target = Number(m[1].replace(/\./g, '').replace(',', '.'));
      if (Number.isFinite(target) && target > 1) {
        const k = ease.out(seg(t, 0.1, 1.2));
        const v = Math.round(target * k);
        if (k < 1) text = v.toLocaleString('es-ES') + m[2];
      }
    }
    const k = ease.outBack(seg(t, 0, 0.5));
    ctx.save();
    ctx.translate(W / 2, lugar ? 620 : 1080); ctx.scale(0.7 + 0.3 * k, 0.7 + 0.3 * k);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    fitFont(ctx, text, 700, 220, 760); // margen para el zoom de cámara: nunca se corta por los lados
    ctx.globalAlpha = clamp(k);
    ctx.lineJoin = 'round'; ctx.lineWidth = 28; ctx.strokeStyle = INK; ctx.strokeText(text, 10, 12);
    ctx.fillStyle = col; ctx.fillText(text, 10, 12);
    ctx.lineWidth = 18; ctx.strokeStyle = INK; ctx.strokeText(text, 0, 0);
    ctx.fillStyle = '#ffffff'; ctx.fillText(text, 0, 0);
    if (params.label) {
      fitFont(ctx, params.label, 500, 54, 900);
      ctx.fillStyle = INK;
      ctx.fillText(params.label, 0, 170);
    }
    ctx.restore();
  },
};

// Recorte de periódico bajo un foco. params: { headline, date?, kicker? }
export const newspaper = {
  setup(p, r) { return { variant: pickVariant(r, p, ['papel', 'web', 'portada']) }; },
  draw(ctx, s, args) {
    if (NEWS_VARIANTS[s.variant]) return NEWS_VARIANTS[s.variant](ctx, s, args);
    const { t, params } = args;
    ctx.fillStyle = '#d9a066'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(120,70,30,0.25)'; ctx.lineWidth = 6; for (let y = 60; y < H; y += 140) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y + 30); ctx.stroke(); }
    radial(ctx, W / 2, 1050, 800, '#fff1c8', 0.35);
    ctx.save();
    ctx.translate(W / 2, 1120); ctx.rotate(-0.05 + Math.sin(t * 0.4) * 0.005);
    const pw = 820, ph = 1000;
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(-pw / 2 + 20, -ph / 2 + 30, pw, ph);
    ctx.fillStyle = linearBg(ctx, 0, -ph / 2, 0, ph / 2, ['#e9dfc8', '#d4c6a6']);
    ctx.fillRect(-pw / 2, -ph / 2, pw, ph);
    ctx.fillStyle = '#1d1a14'; ctx.textAlign = 'center';
    ctx.font = '700 44px Poppins'; ctx.fillText(params.kicker || 'EL DIARIO', 0, -ph / 2 + 80);
    ctx.fillRect(-pw / 2 + 40, -ph / 2 + 105, pw - 80, 4);
    ctx.font = '400 22px Poppins'; ctx.fillText(params.date || '', 0, -ph / 2 + 140);
    // Titular con salto de línea automático
    const words = String(params.headline || '').split(' ');
    let lines = [], cur = '';
    ctx.font = '700 60px Poppins';
    for (const w of words) { const tst = cur ? cur + ' ' + w : w; if (ctx.measureText(tst).width > pw - 100 && cur) { lines.push(cur); cur = w; } else cur = tst; }
    if (cur) lines.push(cur);
    lines.slice(0, 4).forEach((l, i) => ctx.fillText(l, 0, -ph / 2 + 230 + i * 72));
    const yImg = -ph / 2 + 230 + Math.min(4, lines.length) * 72;
    ctx.fillStyle = '#2a261e'; ctx.fillRect(-pw / 2 + 50, yImg, pw - 100, 300);
    radial(ctx, 0, yImg + 150, 200, '#6a5f4a', 0.6);
    ctx.fillStyle = 'rgba(29,26,20,0.55)';
    for (let i = 0; i < 6; i++) ctx.fillRect(-pw / 2 + 50, yImg + 340 + i * 34, (pw - 100) * (i === 5 ? 0.6 : 1), 12);
    ctx.restore();
  },
};

// Mapa estilizado con chincheta. params: { place, detail? }
export const map_pin = {
  setup(p, r) {
    // Masas de tierra: polígonos con borde irregular (aspecto de mapa, no de manchas).
    const lands = [[-80, 520, 520], [700, 700, 420], [250, 1350, 460], [980, 1500, 380], [520, 1080, 260]].map(([cx, cy, R]) => {
      const n = 40, pts = [];
      const ph = [r.range(0, 6), r.range(0, 6), r.range(0, 6)];
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const rad = R * (0.75 + 0.18 * Math.sin(a * 3 + ph[0]) + 0.1 * Math.sin(a * 7 + ph[1]) + 0.05 * Math.sin(a * 13 + ph[2]));
        pts.push([cx + Math.cos(a) * rad * 1.15, cy + Math.sin(a) * rad * 0.8]);
      }
      return pts;
    });
    return { lands, ...mapSetup(r), variant: pickVariant(r, p, ['islas', 'globo', 'calles', 'relieve']) };
  },
  draw(ctx, s, args) {
    if (MAP_VARIANTS[s.variant]) return MAP_VARIANTS[s.variant](ctx, s, args);
    const { t, params } = args;
    ctx.fillStyle = '#0a1024'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(120,140,220,0.12)'; ctx.lineWidth = 2;
    for (let x = 0; x < W; x += 90) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 90) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    for (const pts of s.lands) {
      ctx.beginPath();
      pts.forEach(([x, y], i) => { const [nx, ny] = pts[(i + 1) % pts.length]; const mx = (x + nx) / 2, my = (y + ny) / 2; i ? ctx.quadraticCurveTo(x, y, mx, my) : ctx.moveTo(mx, my); });
      ctx.closePath();
      ctx.fillStyle = '#18224a'; ctx.fill();
      ctx.strokeStyle = 'rgba(140,160,255,0.35)'; ctx.lineWidth = 3; ctx.stroke();
    }
    // Ruta discontinua hacia la chincheta
    ctx.setLineDash([18, 16]); ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(160, 1750); ctx.quadraticCurveTo(200, 1300, W / 2, 1180); ctx.stroke(); ctx.setLineDash([]);
    const px = W / 2, py = 1180;
    const k = ease.outBack(seg(t, 0.2, 0.6));
    const ring = (t * 0.8) % 1;
    ctx.strokeStyle = rgba(P.red, 0.6 * (1 - ring)); ctx.lineWidth = 4;
    ctx.beginPath(); ctx.ellipse(px, py, 40 + ring * 140, (40 + ring * 140) * 0.4, 0, 0, 7); ctx.stroke();
    ctx.save(); ctx.translate(px, py - (1 - k) * 300);
    ctx.fillStyle = P.red;
    ctx.beginPath(); ctx.arc(0, -150, 70, Math.PI * 0.85, Math.PI * 0.15); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, -150, 26, 0, 7); ctx.fill();
    ctx.restore();
    if (params.place) {
      ctx.globalAlpha = clamp(k);
      ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.font = '700 64px Poppins';
      ctx.fillText(params.place, px, py + 140);
      if (params.detail) { ctx.font = '400 38px Poppins'; ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillText(params.detail, px, py + 200); }
      ctx.textAlign = 'left'; ctx.globalAlpha = 1;
    }
  },
};
