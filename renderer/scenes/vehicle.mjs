// Escenas de coche / calle.
import { W, H, PALETTE as P, rr, radial, rgba, seg, ease, lerp } from '../lib/util.mjs';
import { makeBokeh, drawBokeh, makeStreaks, drawStreaks, makeRain, drawRain, drawFog } from '../lib/fx.mjs';
import { drawEyes, blinkAt, drawFigure, drawFinger } from '../lib/parts.mjs';

// Ventanilla del coche desde dentro, ciudad pasando. params: { locked_at?: seg, hand?: bool }
export const car_window = {
  setup(p, r) {
    return { streaks: makeStreaks(r, 26, 160, 900), bokeh: makeBokeh(r, 22, { yMin: 150, yMax: 900, rMin: 30, rMax: 110 }) };
  },
  draw(ctx, s, { t, params }) {
    // Cristal (noche exterior)
    ctx.fillStyle = linearBg(ctx, 0, 0, 0, 1000, ['#0d0f1a', '#1a1426', '#0a0a12']);
    ctx.fillRect(0, 0, W, 1000);
    drawBokeh(ctx, s.bokeh, t, { dx: -500 });
    drawStreaks(ctx, s.streaks, t);
    // Marco de la ventana (pilar inclinado)
    ctx.fillStyle = '#050508';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W, 0); ctx.lineTo(W, 60); ctx.lineTo(260, 60); ctx.lineTo(0, 260); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#08080c';
    ctx.fillRect(W - 60, 0, 60, 1000);
    // Reflejo en el cristal
    const rg = ctx.createLinearGradient(0, 0, W, 1000);
    rg.addColorStop(0, 'rgba(255,255,255,0.05)'); rg.addColorStop(0.5, 'rgba(255,255,255,0)'); rg.addColorStop(0.7, 'rgba(255,255,255,0.04)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, 1000);
    // Seguro cromado
    const lockedAt = params.locked_at ?? null;
    const locked = lockedAt !== null && t >= lockedAt;
    const lockY = locked ? 900 : lerp(800, 900, 0);
    ctx.fillStyle = linearBg(ctx, 200, 0, 260, 0, ['#888c96', '#eceef2', '#7a7e88']);
    rr(ctx, 205, lockY - 120 + (locked ? 40 : 0), 50, 150, 20); ctx.fill();
    // Panel de la puerta
    ctx.fillStyle = linearBg(ctx, 0, 980, 0, H, ['#1d1c22', '#141318', '#0b0b0e']);
    ctx.fillRect(0, 980, W, H - 980);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(0, 980, W, 6);
    // Costuras
    ctx.setLineDash([16, 12]); ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, 1140); ctx.lineTo(W, 1140); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 1450); ctx.lineTo(W, 1450); ctx.stroke();
    ctx.setLineDash([]);
    // Tirador
    ctx.fillStyle = '#0a0a0d'; rr(ctx, 330, 1210, 380, 150, 70); ctx.fill();
    ctx.strokeStyle = '#cfd2da'; ctx.lineWidth = 8; rr(ctx, 330, 1210, 380, 150, 70); ctx.stroke();
    ctx.fillStyle = linearBg(ctx, 0, 1260, 0, 1310, ['#f4f4f6', '#9a9ea8']);
    rr(ctx, 380, 1262, 280, 46, 23); ctx.fill();
    // Botón de bloqueo
    ctx.fillStyle = '#121216'; rr(ctx, 770, 1230, 110, 110, 22); ctx.fill();
    const lc = locked ? P.red : '#555a66';
    if (locked) radial(ctx, 825, 1285, 160, P.red, 0.45 + 0.15 * Math.sin(t * 8));
    drawLockIcon(ctx, 825, 1285, 34, lc);
    // Altavoz
    ctx.fillStyle = '#0c0c10';
    ctx.beginPath(); ctx.ellipse(560, 1720, 330, 210, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    for (let yy = 1540; yy < 1900; yy += 22) for (let xx = 260; xx < 860; xx += 22) {
      if (((xx - 560) / 330) ** 2 + ((yy - 1720) / 210) ** 2 < 0.9) { ctx.beginPath(); ctx.arc(xx, yy, 4, 0, 7); ctx.fill(); }
    }
    // Mano pulsando
    if (params.hand && lockedAt !== null) {
      const k = ease.inOut(seg(t, lockedAt - 0.8, 0.8)) - ease.inOut(seg(t, lockedAt + 0.6, 0.6));
      const hx = lerp(1200, 900, k);
      ctx.fillStyle = '#1a1a22'; rr(ctx, hx + 60, 1220, 600, 150, 70); ctx.fill();
      drawFinger(ctx, hx, 1285, 60, 200, Math.PI / 2, P.skin);
    }
  },
};

// Retrovisor con los ojos del conductor. params: { mood, look, glow }
export const rearview_eyes = {
  setup(p, r) { return { bokeh: makeBokeh(r, 30, { yMin: 1000, yMax: 1500, rMin: 20, rMax: 80 }), seed: r.int(0, 100) }; },
  draw(ctx, s, { t, params, prog }) {
    ctx.fillStyle = linearBg(ctx, 0, 0, 0, H, ['#05060a', '#0d0d16', '#151018', '#07070a']);
    ctx.fillRect(0, 0, W, H);
    // Carretera vista por el parabrisas (abajo)
    drawBokeh(ctx, s.bokeh, t);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 5; i++) radial(ctx, 540 + (i - 2) * 60, 1180, 40, P.amber, 0.25);
    ctx.restore();
    // Brazo del retrovisor
    ctx.fillStyle = '#0a0a0e'; ctx.fillRect(500, 0, 80, 560);
    // Espejo
    const mx = 100, my = 560, mw = 880, mh = 420;
    ctx.fillStyle = '#0c0c10'; rr(ctx, mx - 22, my - 22, mw + 44, mh + 44, 70); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 4; rr(ctx, mx - 22, my - 22, mw + 44, mh + 44, 70); ctx.stroke();
    ctx.save();
    rr(ctx, mx, my, mw, mh, 52); ctx.clip();
    const fg = ctx.createRadialGradient(W / 2, my + mh * 0.55, 50, W / 2, my + mh * 0.5, mw * 0.65);
    fg.addColorStop(0, '#a86a44'); fg.addColorStop(0.55, '#6e4229'); fg.addColorStop(1, '#2a170d');
    ctx.fillStyle = fg; ctx.fillRect(mx, my, mw, mh);
    const look = params.look ?? Math.sin(prog * Math.PI) * (params.glance ? 0.6 : 0);
    drawEyes(ctx, W / 2, my + mh * 0.55, 120, { mood: params.mood || 'calm', look, blink: blinkAt(t, s.seed), glow: params.glow ? 0.5 + 0.5 * Math.sin(t * 3) : 0 });
    // Reflejo del cristal
    const rg = ctx.createLinearGradient(mx, my, mx + mw, my + mh);
    rg.addColorStop(0, 'rgba(255,255,255,0.1)'); rg.addColorStop(0.3, 'rgba(255,255,255,0)'); rg.addColorStop(1, 'rgba(0,0,0,0.3)');
    ctx.fillStyle = rg; ctx.fillRect(mx, my, mw, mh);
    ctx.restore();
  },
};

// Calle de noche en perspectiva. params: { car?: bool, figure?: bool, rain?: bool, fog?: bool }
export const city_street = {
  setup(p, r) {
    const buildings = [];
    for (const side of [-1, 1]) {
      let x = side < 0 ? -40 : W + 40;
      for (let i = 0; i < 7; i++) {
        const bw = r.range(110, 220), bh = r.range(500, 1100);
        const depth = i / 7;
        buildings.push({ side, x, bw, bh, depth, wins: Array.from({ length: 80 }, () => r() < 0.28 ? r.range(0.4, 1) : 0) });
        x += side * -bw * (1 - depth * 0.6);
      }
    }
    return { buildings, rain: makeRain(r, 180), bokeh: makeBokeh(r, 14, { yMin: 900, yMax: 1300, rMin: 30, rMax: 90, colors: [P.amber, P.warm] }) };
  },
  draw(ctx, s, { t, params, prog }) {
    const hy = 1050; // horizonte
    ctx.fillStyle = linearBg(ctx, 0, 0, 0, hy, ['#04050a', '#0e1328', '#1d1b33']);
    ctx.fillRect(0, 0, W, hy);
    radial(ctx, W / 2, hy, 700, '#3a2a40', 0.6);
    // Edificios
    for (const b of [...s.buildings].sort((a, c) => c.depth - a.depth)) {
      const scale = 1 - b.depth * 0.55;
      const bw = b.bw * scale, bh = b.bh * scale;
      const x = b.side < 0 ? lerp(b.x, W / 2 - 160, b.depth * 0.9) : lerp(b.x, W / 2 + 160, b.depth * 0.9) - bw;
      const y = hy - bh + (1 - scale) * 80;
      const shade = Math.round(10 + b.depth * 18);
      ctx.fillStyle = `rgb(${shade},${shade + 2},${shade + 12})`;
      ctx.fillRect(x, y, bw, bh + 400);
      const cols = 4, rows = 12, cw = bw / (cols * 2 + 1), chh = bh / (rows * 2 + 1);
      for (let c = 0; c < cols; c++) for (let rr2 = 0; rr2 < rows; rr2++) {
        const v = b.wins[(c * rows + rr2) % b.wins.length];
        if (!v) continue;
        ctx.fillStyle = rgba(P.amber, v * (0.55 + 0.1 * Math.sin(t + c + rr2)));
        ctx.fillRect(x + cw * (1 + c * 2), y + chh * (1 + rr2 * 2), cw, chh);
      }
    }
    // Calzada
    ctx.fillStyle = linearBg(ctx, 0, hy, 0, H, ['#0b0b10', '#121118', '#08080b']);
    ctx.beginPath(); ctx.moveTo(W / 2 - 60, hy); ctx.lineTo(W / 2 + 60, hy); ctx.lineTo(W + 600, H); ctx.lineTo(-600, H); ctx.closePath(); ctx.fill();
    // Líneas de la carretera
    ctx.fillStyle = 'rgba(255,200,120,0.55)';
    for (let i = 0; i < 9; i++) {
      const z = ((i / 9 + t * 0.25 * (params.car ? 0 : 1)) % 1);
      const y = hy + Math.pow(z, 2.2) * (H - hy);
      const w = 4 + z * 26, l = 10 + z * 120;
      ctx.fillRect(W / 2 - w / 2, y, w, l);
    }
    // Farolas
    for (const side of [-1, 1]) for (let i = 0; i < 4; i++) {
      const z = 0.25 + i * 0.22;
      const x = W / 2 + side * (90 + z * z * 900);
      const y = hy + z * z * (H - hy) * 0.5;
      const ph = 900 * z;
      ctx.fillStyle = '#050508'; ctx.fillRect(x - 4 * z, y - ph, 8 * z + 2, ph);
      radial(ctx, x, y - ph, 220 * z, P.amber, 0.55);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const cg = ctx.createLinearGradient(0, y - ph, 0, y + 40 * z);
      cg.addColorStop(0, 'rgba(255,179,92,0.10)'); cg.addColorStop(1, 'rgba(255,179,92,0)');
      ctx.fillStyle = cg; ctx.beginPath(); ctx.moveTo(x - 10, y - ph); ctx.lineTo(x + 10, y - ph); ctx.lineTo(x + 160 * z, y + 40 * z); ctx.lineTo(x - 160 * z, y + 40 * z); ctx.fill();
      ctx.restore();
    }
    if (params.figure) {
      drawFigure(ctx, W / 2 + 220, hy + 230, 420, { rim: P.amber, hood: params.hood });
    }
    if (params.car) {
      const k = ease.inOut(prog);
      const z = lerp(0.15, 1, k);
      const cy = lerp(hy + 40, 1500, k), cw = 160 + z * 600;
      ctx.fillStyle = '#07070b';
      rr(ctx, W / 2 - cw / 2, cy - cw * 0.42, cw, cw * 0.5, cw * 0.08); ctx.fill();
      ctx.fillStyle = '#14141c';
      rr(ctx, W / 2 - cw * 0.36, cy - cw * 0.62, cw * 0.72, cw * 0.26, cw * 0.06); ctx.fill();
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (const sx of [-1, 1]) {
        radial(ctx, W / 2 + sx * cw * 0.36, cy - cw * 0.22, cw * 0.4, '#e8f0ff', 0.9);
        radial(ctx, W / 2 + sx * cw * 0.36, cy - cw * 0.22, cw * 0.1, '#ffffff', 1);
      }
      ctx.restore();
      // Reflejo en el asfalto mojado
      ctx.save(); ctx.globalAlpha = 0.25;
      ctx.fillStyle = linearBg(ctx, 0, cy, 0, H, ['rgba(230,240,255,0.6)', 'rgba(230,240,255,0)']);
      ctx.fillRect(W / 2 - cw * 0.45, cy, cw * 0.18, H - cy);
      ctx.fillRect(W / 2 + cw * 0.27, cy, cw * 0.18, H - cy);
      ctx.restore();
    }
    drawBokeh(ctx, s.bokeh, t);
    if (params.fog) drawFog(ctx, t, hy - 200, hy + 300);
    if (params.rain) drawRain(ctx, s.rain, t);
  },
};

export function linearBg(ctx, x0, y0, x1, y1, colors) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  colors.forEach((c, i) => g.addColorStop(i / (colors.length - 1), c));
  return g;
}

export function drawLockIcon(ctx, x, y, s, color) {
  ctx.save();
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = s * 0.22;
  ctx.beginPath(); ctx.arc(x, y - s * 0.25, s * 0.45, Math.PI, 0); ctx.stroke();
  rr(ctx, x - s * 0.7, y - s * 0.25, s * 1.4, s * 1.05, s * 0.2); ctx.fill();
  ctx.restore();
}
