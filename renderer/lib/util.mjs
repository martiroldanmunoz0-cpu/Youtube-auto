// Utilidades comunes: aleatoriedad determinista, easing, colores y formas.

export const W = 1080;
export const H = 1920;

export const PALETTE = {
  bg: '#06070c',
  night: '#0b1020',
  navy: '#121a30',
  steel: '#2a3247',
  amber: '#ffb35c',
  amberSoft: 'rgba(255,179,92,',
  warm: '#ff8a3d',
  magenta: '#e0409a',
  red: '#ff3b3b',
  blue: '#5a6cff',
  cyan: '#4fd6ff',
  ui: '#6c5cff',
  skin: '#8a5a3c',
  skinDark: '#5e3a24',
  white: '#f4f1ea',
};

// RNG determinista (mulberry32) para que el mismo guion genere siempre el mismo vídeo.
export function rng(seed = 1) {
  let a = typeof seed === 'string' ? hashStr(seed) : seed >>> 0;
  const f = () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  f.range = (lo, hi) => lo + f() * (hi - lo);
  f.int = (lo, hi) => Math.floor(f.range(lo, hi + 1));
  f.pick = (arr) => arr[Math.floor(f() * arr.length)];
  return f;
}

export function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ease = {
  linear: (t) => t,
  inOut: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  out: (t) => 1 - Math.pow(1 - t, 3),
  in: (t) => t * t * t,
  outBack: (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
};
// Progreso de una animación que empieza en `start` (s) y dura `dur` (s).
export const seg = (t, start, dur) => clamp((t - start) / dur);

export function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function radial(ctx, x, y, r, color, alpha = 1) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(color, alpha));
  g.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

export function linear(ctx, x0, y0, x1, y1, stops) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  for (const [o, c] of stops) g.addColorStop(o, c);
  return g;
}

// '#rrggbb' + alpha -> 'rgba(...)'
export function rgba(hex, a = 1) {
  if (hex.startsWith('rgba')) return hex;
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

export function mix(hexA, hexB, t) {
  const pa = parseInt(hexA.slice(1), 16), pb = parseInt(hexB.slice(1), 16);
  const r = Math.round(lerp((pa >> 16) & 255, (pb >> 16) & 255, t));
  const g = Math.round(lerp((pa >> 8) & 255, (pb >> 8) & 255, t));
  const b = Math.round(lerp(pa & 255, pb & 255, t));
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

// Ruido suave 1D (para parpadeos, temblores, luces).
export function noise1(x, seed = 0) {
  const i = Math.floor(x), f = x - i;
  const h = (n) => { const s = Math.sin((n + seed * 131.7) * 127.1) * 43758.5453; return s - Math.floor(s); };
  const u = f * f * (3 - 2 * f);
  return lerp(h(i), h(i + 1), u);
}
