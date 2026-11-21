import { brightBg, INK } from '../lib/brightbg.mjs';
import { drawPlace } from './bright.mjs';
// Escenas de interior / casa.
import { W, H, PALETTE as P, rr, radial, rgba, seg, ease, lerp, clamp, noise1 } from '../lib/util.mjs';
import { makeDust, drawDust, drawFog, makeBokeh, drawBokeh } from '../lib/fx.mjs';
import { drawFigure, flicker, drawEyes, blinkAt } from '../lib/parts.mjs';
import { linearBg } from './vehicle.mjs';

// Dormitorio a oscuras. params: { door_open?: 0..1, figure?: bool, phone_glow?: bool, moon?: bool }
export const bedroom = {
  setup(p, r) { return { dust: makeDust(r, 50) }; },
  draw(ctx, s, { t, params, prog }) {
    ctx.fillStyle = linearBg(ctx, 0, 0, 0, H, ['#080a14', '#0d1122', '#07080e']);
    ctx.fillRect(0, 0, W, H);
    // Ventana con luna
    const wx = 110, wy = 520, ww = 380, wh = 520;
    ctx.fillStyle = '#16203e'; ctx.fillRect(wx, wy, ww, wh);
    if (params.moon !== false) { radial(ctx, wx + 260, wy + 140, 220, '#9fb4ff', 0.35); ctx.fillStyle = '#dfe6ff'; ctx.beginPath(); ctx.arc(wx + 260, wy + 140, 46, 0, 7); ctx.fill(); }
    ctx.strokeStyle = '#05060a'; ctx.lineWidth = 18; ctx.strokeRect(wx, wy, ww, wh);
    ctx.beginPath(); ctx.moveTo(wx + ww / 2, wy); ctx.lineTo(wx + ww / 2, wy + wh); ctx.moveTo(wx, wy + wh / 2); ctx.lineTo(wx + ww, wy + wh / 2); ctx.stroke();
    // Cortina que se mueve
    const sway = Math.sin(t * 0.9) * 18;
    ctx.fillStyle = 'rgba(30,36,70,0.9)';
    ctx.beginPath(); ctx.moveTo(wx - 40, wy - 40); ctx.lineTo(wx + 90, wy - 40); ctx.quadraticCurveTo(wx + 60 + sway, wy + wh / 2, wx + 110 + sway, wy + wh + 60); ctx.lineTo(wx - 40, wy + wh + 60); ctx.fill();
    // Haz de luna en el suelo
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const bg = ctx.createLinearGradient(0, wy, 0, H);
    bg.addColorStop(0, 'rgba(140,160,255,0.10)'); bg.addColorStop(1, 'rgba(140,160,255,0)');
    ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(wx, wy + wh); ctx.lineTo(wx + ww, wy + wh); ctx.lineTo(wx + ww + 500, H); ctx.lineTo(wx + 200, H); ctx.fill();
    ctx.restore();
    // Puerta a la derecha
    const dx = 700, dy = 420, dw = 300, dh = 800;
    const open = params.door_open ?? (params.figure ? 0.6 : 0.15);
    ctx.fillStyle = '#05060a'; ctx.fillRect(dx - 16, dy - 16, dw + 32, dh + 16);
    const gap = dw * open;
    ctx.fillStyle = linearBg(ctx, dx, 0, dx + gap, 0, ['#ffcf8a', '#d98a3c']);
    ctx.fillRect(dx, dy, gap, dh);
    radial(ctx, dx + gap / 2, dy + dh / 2, 500, P.amber, 0.25 * open + 0.05);
    if (params.figure) drawFigure(ctx, dx + gap * 0.5, dy + dh, dh * 0.86, { color: '#050302' });
    ctx.fillStyle = '#121626'; ctx.fillRect(dx + gap, dy, dw - gap, dh);
    // Luz en el suelo desde la puerta
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = rgba(P.amber, 0.12 * open);
    ctx.beginPath(); ctx.moveTo(dx, dy + dh); ctx.lineTo(dx + gap, dy + dh); ctx.lineTo(dx + gap - 300, H); ctx.lineTo(dx - 500, H); ctx.fill();
    ctx.restore();
    // Cama
    ctx.fillStyle = '#0b0e1c'; rr(ctx, -80, 1300, 820, 520, 40); ctx.fill();
    ctx.fillStyle = '#1a2040'; rr(ctx, -60, 1260, 790, 200, 60); ctx.fill();
    ctx.fillStyle = '#232a52'; rr(ctx, 40, 1180, 300, 130, 50); ctx.fill();
    // Bulto bajo la sábana
    ctx.fillStyle = '#1e2548'; ctx.beginPath(); ctx.ellipse(420, 1300, 300, 90, -0.05, Math.PI, 0); ctx.fill();
    if (params.phone_glow) { radial(ctx, 260, 1220, 260, '#8fa0ff', 0.45 + 0.05 * Math.sin(t * 6)); }
    drawDust(ctx, s.dust, t, '#c9d4ff', 0.35);
  },
};

// Puerta de entrada desde dentro. params: { shadow?: bool, knock_at?: [s...], peephole_glow?: bool }
export const front_door = {
  setup() { return {}; },
  draw(ctx, s, { t, params }) {
    ctx.fillStyle = linearBg(ctx, 0, 0, 0, H, ['#0b0b10', '#121219', '#09090c']);
    ctx.fillRect(0, 0, W, H);
    let shake = 0;
    for (const k of params.knock_at || []) { const d = t - k; if (d > 0 && d < 0.25) shake = Math.sin(d * 80) * (1 - d / 0.25) * 10; }
    ctx.save(); ctx.translate(shake, 0);
    const dx = 240, dy = 360, dw = 600, dh = 1400;
    ctx.fillStyle = '#060608'; ctx.fillRect(dx - 40, dy - 40, dw + 80, dh + 40);
    ctx.fillStyle = linearBg(ctx, dx, 0, dx + dw, 0, ['#2a1c14', '#3a271b', '#24180f']);
    ctx.fillRect(dx, dy, dw, dh);
    ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 10;
    ctx.strokeRect(dx + 70, dy + 90, dw - 140, 520);
    ctx.strokeRect(dx + 70, dy + 720, dw - 140, 560);
    // Mirilla
    ctx.fillStyle = '#9a9ea8'; ctx.beginPath(); ctx.arc(dx + dw / 2, dy + 380, 22, 0, 7); ctx.fill();
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(dx + dw / 2, dy + 380, 11, 0, 7); ctx.fill();
    if (params.peephole_glow) radial(ctx, dx + dw / 2, dy + 380, 60, P.amber, 0.7);
    // Pomo
    ctx.fillStyle = linearBg(ctx, dx + dw - 120, 0, dx + dw - 60, 0, ['#9a7a3a', '#f0d48a', '#8a6a2a']);
    ctx.beginPath(); ctx.arc(dx + dw - 90, dy + 760, 32, 0, 7); ctx.fill();
    // Cerrojo
    ctx.fillStyle = '#7d828c'; rr(ctx, dx + dw - 110, dy + 640, 40, 60, 8); ctx.fill();
    ctx.restore();
    // Luz por debajo de la puerta
    const fy = dy + dh;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = rgba(P.amber, 0.9); ctx.fillRect(dx, fy - 6, dw, 8);
    const lg = ctx.createLinearGradient(0, fy, 0, fy + 260);
    lg.addColorStop(0, rgba(P.amber, 0.35)); lg.addColorStop(1, rgba(P.amber, 0));
    ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(dx, fy); ctx.lineTo(dx + dw, fy); ctx.lineTo(dx + dw + 200, fy + 260); ctx.lineTo(dx - 200, fy + 260); ctx.fill();
    ctx.restore();
    // Sombras de pies
    if (params.shadow) {
      const k = ease.out(seg(t, 0.4, 0.8));
      ctx.fillStyle = `rgba(0,0,0,${0.95 * k})`;
      ctx.fillRect(dx + 170, fy - 7, 90, 9); ctx.fillRect(dx + 330, fy - 7, 90, 9);
      ctx.fillStyle = `rgba(0,0,0,${0.55 * k})`;
      ctx.beginPath(); ctx.moveTo(dx + 170, fy); ctx.lineTo(dx + 260, fy); ctx.lineTo(dx + 300, fy + 250); ctx.lineTo(dx + 120, fy + 250); ctx.fill();
      ctx.beginPath(); ctx.moveTo(dx + 330, fy); ctx.lineTo(dx + 420, fy); ctx.lineTo(dx + 480, fy + 250); ctx.lineTo(dx + 310, fy + 250); ctx.fill();
    }
  },
};

// Pasillo con fluorescentes. params: { figure?: bool, flicker?: 0..1, color?: 'cold'|'warm', doors?: bool }
export const hallway = {
  setup(p, r) { return { seed: r.int(0, 999) }; },
  draw(ctx, s, { t, params }) {
    const cold = params.color !== 'warm';
    const base = cold ? '#8fb0c8' : '#d9a25f';
    const vx = W / 2, vy = 980;
    ctx.fillStyle = '#050608'; ctx.fillRect(0, 0, W, H);
    const fw = 160, fh = 260; // puerta del fondo
    // Paredes, suelo y techo en perspectiva
    const quad = (pts, fill) => { ctx.fillStyle = fill; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.fill(); };
    quad([[0, 0], [vx - fw, vy - fh], [vx - fw, vy + fh], [0, H]], linearBg(ctx, 0, 0, vx, 0, [cold ? '#24303a' : '#3a2a1c', '#0b0e12']));
    quad([[W, 0], [vx + fw, vy - fh], [vx + fw, vy + fh], [W, H]], linearBg(ctx, W, 0, vx, 0, [cold ? '#1d272f' : '#33241a', '#0a0c10']));
    quad([[0, H], [vx - fw, vy + fh], [vx + fw, vy + fh], [W, H]], linearBg(ctx, 0, H, 0, vy, [cold ? '#2b3640' : '#3b2b1d', '#0b0d10']));
    quad([[0, 0], [vx - fw, vy - fh], [vx + fw, vy - fh], [W, 0]], '#0b0d11');
    ctx.fillStyle = '#020203'; ctx.fillRect(vx - fw, vy - fh, fw * 2, fh * 2);
    // Puertas laterales
    if (params.doors !== false) for (let i = 0; i < 3; i++) {
      const z = 0.25 + i * 0.25;
      for (const side of [-1, 1]) {
        const x0 = lerp(side < 0 ? 0 : W, vx + side * fw, z), x1 = lerp(side < 0 ? 0 : W, vx + side * fw, z + 0.12);
        const top0 = lerp(0, vy - fh, z) + 160 * (1 - z), top1 = lerp(0, vy - fh, z + 0.12) + 160 * (1 - z - 0.12);
        const bot0 = lerp(H, vy + fh, z), bot1 = lerp(H, vy + fh, z + 0.12);
        quad([[x0, top0], [x1, top1], [x1, bot1], [x0, bot0]], 'rgba(0,0,0,0.5)');
      }
    }
    // Luces del techo
    for (let i = 0; i < 4; i++) {
      const z = 0.15 + i * 0.22;
      const y = lerp(0, vy - fh, z) + 30 * (1 - z);
      const w = lerp(260, 40, z);
      const f = params.flicker ? flicker(t + i * 3.1, s.seed + i, params.flicker) : 1;
      ctx.fillStyle = rgba('#ffffff', 0.85 * f); rr(ctx, vx - w / 2, y, w, 10 * (1 - z) + 3, 4); ctx.fill();
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      radial(ctx, vx, y + 40, 500 * (1 - z * 0.6), base, 0.35 * f);
      ctx.restore();
    }
    if (params.figure) drawFigure(ctx, vx, vy + fh, fh * 1.7, { color: '#000', rim: base, rimAlpha: 0.4 });
    drawFog(ctx, t, vy - 200, vy + 400, base, 0.06);
  },
};

// Casa aislada de noche. params: { lit_window?: bool, fog?: bool, figure?: bool }
export const house_exterior = {
  setup(p, r) {
    return { stars: Array.from({ length: 120 }, () => [r.range(0, W), r.range(0, 900), r.range(0.5, 2), r.range(0, 6)]), trees: Array.from({ length: 9 }, () => [r.range(-100, W + 100), r.range(260, 520)]) };
  },
  draw(ctx, s, { t, params }) {
    ctx.fillStyle = linearBg(ctx, 0, 0, 0, H, ['#03040a', '#0c1230', '#1b1d3a', '#07070c']);
    ctx.fillRect(0, 0, W, H);
    for (const [x, y, r2, ph] of s.stars) { ctx.fillStyle = `rgba(255,255,255,${0.3 + 0.4 * Math.abs(Math.sin(t + ph))})`; ctx.fillRect(x, y, r2, r2); }
    radial(ctx, 800, 420, 300, '#a8b8ff', 0.3);
    ctx.fillStyle = '#e8ecff'; ctx.beginPath(); ctx.arc(800, 420, 70, 0, 7); ctx.fill();
    // Colina
    ctx.fillStyle = '#05060b';
    ctx.beginPath(); ctx.moveTo(0, 1350); ctx.quadraticCurveTo(W / 2, 1120, W, 1350); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
    // Casa
    const hx = 330, hy = 920;
    ctx.fillStyle = '#07080e';
    ctx.fillRect(hx, hy, 420, 300);
    ctx.beginPath(); ctx.moveTo(hx - 40, hy); ctx.lineTo(hx + 210, hy - 200); ctx.lineTo(hx + 460, hy); ctx.fill();
    ctx.fillRect(hx + 300, hy - 170, 50, 120);
    const lit = params.lit_window !== false;
    const wins = [[hx + 60, hy + 60], [hx + 280, hy + 60], [hx + 180, hy - 110]];
    wins.forEach(([x, y], i) => {
      const on = lit && (i === 2 || i === 0);
      ctx.fillStyle = on ? rgba(P.amber, 0.9 * (0.9 + 0.1 * Math.sin(t * 5 + i))) : '#10121c';
      ctx.fillRect(x, y, 70, 90);
      if (on) radial(ctx, x + 35, y + 45, 160, P.amber, 0.3);
      if (on && params.figure && i === 2) drawFigure(ctx, x + 35, y + 90, 80, { color: '#120a04' });
    });
    // Árboles
    for (const [x, hgt] of s.trees) {
      ctx.fillStyle = '#020306';
      ctx.beginPath(); ctx.moveTo(x, 1250 - hgt); ctx.lineTo(x - hgt * 0.28, 1300); ctx.lineTo(x + hgt * 0.28, 1300); ctx.fill();
      ctx.fillRect(x - 6, 1290, 12, 40);
    }
    if (params.fog !== false) drawFog(ctx, t, 1150, 1500, '#9aa6c8', 0.1);
  },
};

// Reloj de pared. params: { time: 'HH:MM' }
export const clock = {
  setup() { return {}; },
  draw(ctx, s, { t, params }) {
    brightBg(ctx, t, 'crema');
    const cx = W / 2, cy = 1100, R = 330;
    ctx.fillStyle = '#1a1410'; ctx.beginPath(); ctx.arc(cx, cy, R + 34, 0, 7); ctx.fill();
    ctx.fillStyle = linearBg(ctx, 0, cy - R, 0, cy + R, ['#efe6d2', '#c9bca2']);
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
    ctx.fillStyle = '#1b1612'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '600 56px Poppins';
    for (let i = 1; i <= 12; i++) { const a = (i / 12) * Math.PI * 2 - Math.PI / 2; ctx.fillText(String(i), cx + Math.cos(a) * R * 0.8, cy + Math.sin(a) * R * 0.8); }
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    const [hh, mm] = String(params.time || '03:00').split(':').map(Number);
    const sec = Math.floor(t) % 60;
    const hand = (ang, len, w, c) => { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ang) * len, cy + Math.sin(ang) * len); ctx.stroke(); };
    hand(((hh % 12) + mm / 60) / 12 * Math.PI * 2 - Math.PI / 2, R * 0.5, 18, '#1b1612');
    hand((mm / 60) * Math.PI * 2 - Math.PI / 2, R * 0.72, 12, '#1b1612');
    hand(((sec + 40) / 60) * Math.PI * 2 - Math.PI / 2, R * 0.78, 4, '#c0262e');
    ctx.fillStyle = '#1b1612'; ctx.beginPath(); ctx.arc(cx, cy, 16, 0, 7); ctx.fill();
    // Sombra
    const sg = ctx.createRadialGradient(cx - 100, cy - 120, 50, cx, cy, R);
    sg.addColorStop(0, 'rgba(0,0,0,0)'); sg.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
  },
};

// Televisión antigua en habitación oscura. params: { text?: string, static?: bool }
export const tv = {
  setup() { return {}; },
  draw(ctx, s, { t, params, frame }) {
    drawPlace(ctx, 'salon', params.hora || 'dia', t);
    const tx = 150, ty = 780, tw = 780, th = 600;
    ctx.fillStyle = '#8d5a3b'; rr(ctx, 60, ty + th + 120, W - 120, 60, 12); ctx.fill();
    ctx.fillStyle = '#1a1714'; rr(ctx, tx, ty, tw, th, 50); ctx.fill();
    ctx.fillStyle = '#0d0c0a'; rr(ctx, tx + 50, ty + 50, tw - 220, th - 100, 60); ctx.fill();
    const sx = tx + 70, sy = ty + 70, sw = tw - 260, sh = th - 140;
    ctx.save(); rr(ctx, sx, sy, sw, sh, 50); ctx.clip();
    if (params.static !== false && !params.text) {
      for (let i = 0; i < 1400; i++) {
        const v = ((Math.sin(i * 12.9898 + frame * 78.233) * 43758.5453) % 1 + 1) % 1;
        ctx.fillStyle = `rgba(${200 * v},${200 * v},${220 * v},1)`;
        ctx.fillRect(sx + ((i * 37) % sw), sy + ((i * 91 + frame * 13) % sh), 14, 8);
      }
    } else {
      ctx.fillStyle = '#1a2a6a'; ctx.fillRect(sx, sy, sw, sh);
      ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = '700 46px Poppins';
      String(params.text || '').split('\n').forEach((l, i) => ctx.fillText(l, sx + sw / 2, sy + sh / 2 + i * 60));
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      for (let y = sy; y < sy + sh; y += 6) ctx.fillRect(sx, y, sw, 2);
    }
    ctx.restore();
    // Botones
    for (let i = 0; i < 2; i++) { ctx.fillStyle = '#3a342c'; ctx.beginPath(); ctx.arc(tx + tw - 85, ty + 160 + i * 120, 34, 0, 7); ctx.fill(); }
    ctx.fillStyle = '#0d0c0a'; ctx.fillRect(tx + 120, ty + th, 30, 160); ctx.fillRect(tx + tw - 150, ty + th, 30, 160);
  },
};
