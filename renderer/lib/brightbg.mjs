// Fondo luminoso común del estilo nuevo: degradado suave + formas pastel que flotan + trama de puntos.
import { W, H } from './util.mjs';
import { livelyBg } from './ambient.mjs';

export const INK = '#1c1a2b';
const TONES = {
  crema: ['#fff4dc', '#ffe1b8', ['#ffb35c', '#ff8fab', '#7bdff2', '#b8f2a8']],
  azul: ['#e3f3ff', '#bfe3ff', ['#5ab8ff', '#ffd166', '#ff8fab', '#7bdff2']],
  verde: ['#ecfbe8', '#c9efc0', ['#6fcf97', '#ffd166', '#5ab8ff', '#ff9f68']],
  rosa: ['#ffe9f0', '#ffd0de', ['#ff8fab', '#ffd166', '#7bdff2', '#bb6bd9']],
  lila: ['#f1eaff', '#ddd0ff', ['#bb6bd9', '#7bdff2', '#ffd166', '#ff8fab']],
};
// Contexto del plano: si el vídeo tiene un lugar (salón, calle, dormitorio...), las escenas de "objeto"
// (reloj, calendario, documento, móvil...) se dibujan sobre ese lugar animado en vez de sobre un fondo liso.
export const BG_CONTEXT = { lugar: null, hora: 'dia', busy: false, draw: null };
export function brightBg(ctx, t, tone = 'crema') {
  if (BG_CONTEXT.lugar && BG_CONTEXT.draw && !BG_CONTEXT.busy) {
    BG_CONTEXT.busy = true;
    try { BG_CONTEXT.draw(ctx, BG_CONTEXT.lugar, BG_CONTEXT.hora, t); } finally { BG_CONTEXT.busy = false; }
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(0, 0, W, H); // velo: el objeto destaca y el lugar se sigue moviendo detrás
    return;
  }
  const [a, b, cols] = TONES[tone] || TONES.crema;
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, a); g.addColorStop(1, b);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(28,26,43,0.06)';
  for (let y = 40; y < H; y += 60) for (let x = (y / 60) % 2 ? 30 : 0; x < W; x += 60) { ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.fill(); }
  for (let i = 0; i < 9; i++) {
    const x = (i * 263 + Math.sin(t * 0.4 + i) * 40) % (W + 200) - 100, y = (i * 409 + t * 18 * (i % 3 + 1)) % (H + 300) - 150;
    ctx.globalAlpha = 0.13; ctx.fillStyle = cols[i % cols.length];
    ctx.beginPath(); ctx.arc(x, y, 60 + (i % 4) * 40, 0, 7); ctx.fill();
  }
  ctx.globalAlpha = 1;
  livelyBg(ctx, t, cols); // rayos que giran, confeti y destellos: el fondo liso nunca está quieto
}
