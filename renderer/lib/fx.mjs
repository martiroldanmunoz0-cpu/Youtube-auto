// Efectos de "acabado" compartidos por todas las escenas: viñeta, grano,
// bokeh, lluvia, rayos de luz. Son los que dan coherencia visual al canal.
import { createCanvas } from '@napi-rs/canvas';
import { W, H, rgba, rng, radial } from './util.mjs';

let grainFrames = null;
function buildGrain() {
  const r = rng(99);
  grainFrames = [];
  for (let k = 0; k < 6; k++) {
    const c = createCanvas(W / 3, H / 3);
    const x = c.getContext('2d');
    const img = x.createImageData(c.width, c.height);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = r() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    grainFrames.push(c);
  }
}

export function grain(ctx, frame, amount = 0.045) {
  if (!grainFrames) buildGrain();
  ctx.save();
  ctx.globalAlpha = amount;
  ctx.globalCompositeOperation = 'overlay';
  ctx.drawImage(grainFrames[frame % grainFrames.length], 0, 0, W, H);
  ctx.restore();
}

let vignetteCanvas = null;
export function vignette(ctx, strength = 0.75) {
  if (!vignetteCanvas) {
    vignetteCanvas = createCanvas(W, H);
    const x = vignetteCanvas.getContext('2d');
    const g = x.createRadialGradient(W / 2, H / 2, H * 0.22, W / 2, H / 2, H * 0.72);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,1)');
    x.fillStyle = g;
    x.fillRect(0, 0, W, H);
  }
  ctx.save();
  ctx.globalAlpha = strength;
  ctx.drawImage(vignetteCanvas, 0, 0);
  ctx.restore();
}

// Degradado oscuro arriba para que los subtítulos se lean siempre.
export function topShade(ctx, a = 0.55) {
  const g = ctx.createLinearGradient(0, 0, 0, 760);
  g.addColorStop(0, `rgba(0,0,0,${a})`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, 760);
}

// Luces desenfocadas (bokeh) a partir de una lista generada en setup.
export function makeBokeh(r, n, opts = {}) {
  const colors = opts.colors || ['#ffb35c', '#ff8a3d', '#e0409a', '#f4f1ea', '#ff3b3b'];
  const out = [];
  for (let i = 0; i < n; i++) {
    out.push({
      x: r.range(-100, W + 100),
      y: r.range(opts.yMin ?? 0, opts.yMax ?? H),
      r: r.range(opts.rMin ?? 20, opts.rMax ?? 90),
      c: r.pick(colors),
      a: r.range(0.15, 0.55),
      s: r.range(0.3, 1.2),
      ph: r.range(0, 10),
    });
  }
  return out;
}

export function drawBokeh(ctx, list, t, opts = {}) {
  const dx = opts.dx || 0; // desplazamiento horizontal (px/s) para luces que pasan
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const b of list) {
    let x = b.x + dx * t * b.s;
    if (dx) x = ((x % (W + 400)) + W + 400) % (W + 400) - 200;
    const flick = 0.75 + 0.25 * Math.sin(t * 2 * b.s + b.ph);
    radial(ctx, x, b.y, b.r, b.c, b.a * flick);
  }
  ctx.restore();
}

// Estelas de luz horizontales (coche en movimiento).
export function makeStreaks(r, n, yMin, yMax) {
  const out = [];
  for (let i = 0; i < n; i++) {
    out.push({
      y: r.range(yMin, yMax), len: r.range(120, 520), w: r.range(4, 14),
      speed: r.range(900, 2600), off: r.range(0, 3000),
      c: r.pick(['#f4f1ea', '#ff3b3b', '#e0409a', '#ffb35c', '#f4f1ea']), a: r.range(0.35, 0.9),
    });
  }
  return out;
}

export function drawStreaks(ctx, list, t, dir = -1) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const s of list) {
    const span = W + s.len + 400;
    let x = ((s.off + s.speed * t) % span);
    x = dir < 0 ? W + 200 - x : x - s.len - 200;
    const g = ctx.createLinearGradient(x, 0, x + s.len, 0);
    g.addColorStop(0, rgba(s.c, 0));
    g.addColorStop(0.5, rgba(s.c, s.a));
    g.addColorStop(1, rgba(s.c, 0));
    ctx.fillStyle = g;
    ctx.fillRect(x, s.y - s.w / 2, s.len, s.w);
    radial(ctx, x + s.len / 2, s.y, s.w * 5, s.c, s.a * 0.25);
  }
  ctx.restore();
}

export function makeRain(r, n = 160) {
  const out = [];
  for (let i = 0; i < n; i++) out.push({ x: r.range(0, W), y: r.range(0, H), l: r.range(30, 80), v: r.range(1400, 2200), a: r.range(0.08, 0.25) });
  return out;
}

export function drawRain(ctx, list, t) {
  ctx.save();
  ctx.lineWidth = 2;
  for (const d of list) {
    const y = (d.y + d.v * t) % (H + 100) - 100;
    const x = d.x - (y * 0.08);
    ctx.strokeStyle = `rgba(200,210,255,${d.a})`;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - d.l * 0.12, y + d.l); ctx.stroke();
  }
  ctx.restore();
}

// Niebla: bandas de radiales grandes que se desplazan.
export function drawFog(ctx, t, y0, y1, color = '#8a96b8', alpha = 0.12) {
  ctx.save();
  for (let i = 0; i < 7; i++) {
    const x = ((i * 380 + t * (18 + i * 6)) % (W + 800)) - 400;
    const y = y0 + ((i * 137) % Math.max(1, y1 - y0));
    radial(ctx, x, y, 420, color, alpha);
  }
  ctx.restore();
}

// Partículas de polvo flotando en la luz.
export function makeDust(r, n = 60) {
  const out = [];
  for (let i = 0; i < n; i++) out.push({ x: r.range(0, W), y: r.range(0, H), s: r.range(1, 3.5), v: r.range(6, 25), ph: r.range(0, 6) });
  return out;
}
export function drawDust(ctx, list, t, color = '#ffd9a0', alpha = 0.5) {
  ctx.save();
  for (const p of list) {
    const y = ((p.y - p.v * t) % H + H) % H;
    const x = p.x + Math.sin(t * 0.6 + p.ph) * 14;
    ctx.fillStyle = rgba(color, alpha * (0.4 + 0.6 * Math.abs(Math.sin(t + p.ph))));
    ctx.beginPath(); ctx.arc(x, y, p.s, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
