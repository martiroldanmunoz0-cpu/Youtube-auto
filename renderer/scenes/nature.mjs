// Escenas exteriores / atmosféricas.
import { W, H, PALETTE as P, rr, radial, rgba, seg, ease, lerp, clamp, noise1 } from '../lib/util.mjs';
import { drawFog, makeDust, drawDust, makeRain, drawRain } from '../lib/fx.mjs';
import { drawBust, drawFigure, blinkAt } from '../lib/parts.mjs';
import { linearBg } from './vehicle.mjs';

// Bosque nocturno con niebla. params: { flashlight?: bool, eyes?: bool, figure?: bool }
export const forest = {
  setup(p, r) {
    const layers = [0, 1, 2].map((l) => Array.from({ length: 9 - l * 2 }, () => ({ x: r.range(-100, W + 100), w: r.range(30, 70) * (1 + l * 0.8), lean: r.range(-0.03, 0.03) })));
    return { layers, dust: makeDust(r, 40) };
  },
  draw(ctx, s, { t, params }) {
    ctx.fillStyle = linearBg(ctx, 0, 0, 0, H, ['#020306', '#0a1018', '#0d141a', '#040507']);
    ctx.fillRect(0, 0, W, H);
    radial(ctx, W / 2, 500, 600, '#6f86a8', 0.18);
    s.layers.forEach((layer, li) => {
      const shade = [28, 16, 6][li];
      ctx.fillStyle = `rgb(${shade},${shade + 4},${shade + 8})`;
      for (const tr of layer) {
        const x = tr.x + Math.sin(t * 0.2 + li) * (li + 1) * 6;
        ctx.save(); ctx.translate(x, 0); ctx.rotate(tr.lean);
        ctx.fillRect(-tr.w / 2, -50, tr.w, H + 100);
        ctx.restore();
      }
      drawFog(ctx, t + li * 4, 900 + li * 250, 1300 + li * 250, '#8796b0', 0.07);
    });
    if (params.figure) drawFigure(ctx, W / 2 + 140, 1350, 380, { color: '#000' });
    if (params.eyes) {
      const b = blinkAt(t, 3);
      for (const [ex, ey, sc] of [[330, 1200, 1], [720, 1050, 0.7]]) {
        if (b > 0.5) continue;
        for (const sx of [-1, 1]) radial(ctx, ex + sx * 26 * sc, ey, 22 * sc, '#ffdf6e', 0.95);
      }
    }
    if (params.flashlight) {
      const ang = Math.sin(t * 0.8) * 0.25;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.translate(W / 2, H + 100); ctx.rotate(ang);
      const g = ctx.createLinearGradient(0, 0, 0, -1500);
      g.addColorStop(0, 'rgba(255,240,200,0.35)'); g.addColorStop(1, 'rgba(255,240,200,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(40, 0); ctx.lineTo(420, -1500); ctx.lineTo(-420, -1500); ctx.fill();
      ctx.restore();
    }
    drawDust(ctx, s.dust, t, '#cfd8e8', 0.3);
  },
};

// Mar de noche con luna. params: { ship?: bool, storm?: bool }
export const ocean = {
  setup(p, r) { return { rain: makeRain(r, 200), stars: Array.from({ length: 90 }, () => [r.range(0, W), r.range(0, 900), r.range(0, 6)]) }; },
  draw(ctx, s, { t, params }) {
    const storm = !!params.storm;
    const hz = 1000;
    ctx.fillStyle = linearBg(ctx, 0, 0, 0, hz, storm ? ['#030407', '#10141c', '#1b2230'] : ['#03040b', '#0d1430', '#1d2347']);
    ctx.fillRect(0, 0, W, hz);
    if (!storm) {
      for (const [x, y, ph] of s.stars) { ctx.fillStyle = `rgba(255,255,255,${0.25 + 0.4 * Math.abs(Math.sin(t + ph))})`; ctx.fillRect(x, y, 2, 2); }
      radial(ctx, W / 2, 520, 340, '#b8c6ff', 0.35);
      ctx.fillStyle = '#eef1ff'; ctx.beginPath(); ctx.arc(W / 2, 520, 85, 0, 7); ctx.fill();
    } else if (noise1(t * 3, 5) > 0.85) { ctx.fillStyle = 'rgba(200,210,255,0.35)'; ctx.fillRect(0, 0, W, H); }
    ctx.fillStyle = linearBg(ctx, 0, hz, 0, H, ['#0d1430', '#070a18', '#020308']);
    ctx.fillRect(0, hz, W, H - hz);
    // Olas: líneas que se mueven
    for (let i = 0; i < 40; i++) {
      const z = i / 40;
      const y = hz + Math.pow(z, 1.8) * (H - hz);
      ctx.strokeStyle = `rgba(150,170,255,${0.05 + z * 0.12})`;
      ctx.lineWidth = 1 + z * 4;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 30) {
        const yy = y + Math.sin(x * 0.01 * (1.5 - z) + t * (1 + z) + i) * (4 + z * (storm ? 40 : 18));
        x ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy);
      }
      ctx.stroke();
    }
    if (!storm) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 26; i++) {
        const y = hz + 20 + i * 30;
        const w = 40 + i * 9 + Math.sin(t * 2 + i) * 20;
        ctx.fillStyle = `rgba(220,228,255,${0.35 - i * 0.012})`;
        ctx.fillRect(W / 2 - w / 2 + Math.sin(t * 1.5 + i * 0.7) * 14, y, w, 4);
      }
      ctx.restore();
    }
    if (params.ship) {
      const bob = Math.sin(t * 1.2) * 8;
      ctx.fillStyle = '#020204';
      ctx.beginPath(); ctx.moveTo(220, hz - 10 + bob); ctx.lineTo(480, hz - 10 + bob); ctx.lineTo(450, hz + 25 + bob); ctx.lineTo(250, hz + 25 + bob); ctx.fill();
      ctx.fillRect(320, hz - 60 + bob, 80, 50);
      radial(ctx, 360, hz - 40 + bob, 40, P.amber, 0.8);
    }
    if (storm) drawRain(ctx, s.rain, t);
  },
};

// Espacio: estrellas + planeta. params: { color?: hex, ring?: bool, object?: 'planet'|'blackhole'|'sun' }
export const space = {
  setup(p, r) { return { stars: Array.from({ length: 260 }, () => [r.range(0, W), r.range(0, H), r.range(0.5, 2.6), r.range(0, 6)]) }; },
  draw(ctx, s, { t, params }) {
    ctx.fillStyle = '#020208'; ctx.fillRect(0, 0, W, H);
    radial(ctx, 300, 600, 700, '#3a1f6a', 0.35);
    radial(ctx, 850, 1400, 700, '#1f3a6a', 0.3);
    for (const [x, y, r2, ph] of s.stars) { ctx.fillStyle = `rgba(255,255,255,${0.3 + 0.6 * Math.abs(Math.sin(t * 0.8 + ph))})`; ctx.beginPath(); ctx.arc(x, y, r2, 0, 7); ctx.fill(); }
    const cx = W / 2, cy = 1150, R = 300;
    const obj = params.object || 'planet';
    if (obj === 'blackhole') {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 3; i++) { ctx.strokeStyle = rgba(P.amber, 0.5 - i * 0.12); ctx.lineWidth = 40 - i * 10; ctx.beginPath(); ctx.ellipse(cx, cy, R * 1.6 + i * 30, R * 0.35 + i * 10, -0.15, 0, 7); ctx.stroke(); }
      radial(ctx, cx, cy, R * 1.4, P.warm, 0.45);
      ctx.restore();
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(cx, cy, R * 0.75, 0, 7); ctx.fill();
      return;
    }
    if (obj === 'sun') {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      radial(ctx, cx, cy, R * 2.4, P.warm, 0.6 + 0.05 * Math.sin(t * 2));
      ctx.restore();
      ctx.fillStyle = linearBg(ctx, 0, cy - R, 0, cy + R, ['#fff3c4', '#ffb35c', '#ff7a2d']);
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
      return;
    }
    const col = params.color || '#c9783e';
    radial(ctx, cx, cy, R * 1.5, col, 0.25);
    const g = ctx.createRadialGradient(cx - R * 0.4, cy - R * 0.4, R * 0.1, cx, cy, R);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.15, col); g.addColorStop(1, '#0a0608');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.clip();
    for (let i = 0; i < 8; i++) { ctx.fillStyle = `rgba(0,0,0,${0.08 + (i % 3) * 0.04})`; ctx.fillRect(cx - R, cy - R + i * R * 0.27 + Math.sin(t * 0.3 + i) * 6, R * 2, R * 0.12); }
    ctx.restore();
    if (params.ring) {
      ctx.strokeStyle = rgba('#e8d2a8', 0.55); ctx.lineWidth = 26;
      ctx.beginPath(); ctx.ellipse(cx, cy, R * 1.7, R * 0.38, -0.2, 0.1, Math.PI - 0.1); ctx.stroke();
    }
  },
};

// Oscuridad total con ojos que aparecen. params: { color?: hex, count?: 1..6 }
export const eyes_dark = {
  setup(p, r) { return { pos: Array.from({ length: 6 }, () => [r.range(160, W - 160), r.range(700, 1600), r.range(0.6, 1.3), r.range(0, 3)]) }; },
  draw(ctx, s, { t, params }) {
    ctx.fillStyle = '#010102'; ctx.fillRect(0, 0, W, H);
    const n = params.count || 1;
    const col = params.color || '#ffffff';
    s.pos.slice(0, n).forEach(([x, y, sc, d], i) => {
      const ex = n === 1 ? W / 2 : x, ey = n === 1 ? 1150 : y, ss = n === 1 ? 1.6 : sc;
      const k = ease.out(seg(t, 0.3 + i * 0.35, 0.8));
      const b = blinkAt(t, i + 2);
      if (k <= 0) return;
      for (const sx of [-1, 1]) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        radial(ctx, ex + sx * 60 * ss, ey, 90 * ss, col, 0.25 * k);
        ctx.restore();
        ctx.fillStyle = rgba(col, 0.95 * k);
        ctx.beginPath(); ctx.ellipse(ex + sx * 60 * ss, ey, 30 * ss, 13 * ss * (1 - b), sx * 0.15, 0, 7); ctx.fill();
      }
    });
  },
};

// Silueta a contraluz (busto). params: { hood?: bool, eyes?: bool, color?: hex }
export const silhouette = {
  setup(p, r) { return { dust: makeDust(r, 50) }; },
  draw(ctx, s, { t, params }) {
    const col = params.color || P.amber;
    ctx.fillStyle = '#040406'; ctx.fillRect(0, 0, W, H);
    radial(ctx, W / 2, 900, 900, col, 0.45);
    radial(ctx, W / 2, 900, 300, '#ffffff', 0.25);
    drawDust(ctx, s.dust, t, col, 0.5);
    drawBust(ctx, W / 2, 1150 + Math.sin(t * 0.8) * 6, 420, { hood: params.hood, rim: col, eyes: params.eyes ? 0.8 : 0 });
  },
};
