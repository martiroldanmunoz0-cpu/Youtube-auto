// Subtítulos palabra por palabra, estilo "historias": arriba, centrados,
// máximo 2 líneas; la palabra que se está diciendo va en blanco y negrita.
import { W } from './util.mjs';

const FONT_SIZE = 66;
const LINE_H = 84;
const MAX_W = 860;
const TOP = 300;

function fontFor(bold) {
  return `${bold ? '700' : '400'} ${FONT_SIZE}px Poppins`;
}

function wrap(ctx, chunk, space) {
  const lines = [[]];
  let lineW = 0;
  for (const w of chunk) {
    const ww = ctx.measureText(w.w).width;
    if (lineW + ww > MAX_W && lines.at(-1).length) { lines.push([]); lineW = 0; }
    lines.at(-1).push(w);
    lineW += ww + space;
  }
  return lines;
}

// Parte un trozo por la mitad (mejor en una coma/punto cercano al centro) hasta que
// quepa en 2 líneas y tenga como mucho 7 palabras.
function split(ctx, chunk, space) {
  const lines = wrap(ctx, chunk, space);
  if (lines.length <= 2 && chunk.length <= 7) return [lines];
  const mid = chunk.length / 2;
  let cut = Math.round(mid), best = Infinity;
  chunk.forEach((w, i) => {
    if (i === 0 || i === chunk.length - 1) return;
    if (/[,.;:!?…»]$/.test(w.w) && Math.abs(i + 1 - mid) < best && Math.abs(i + 1 - mid) <= chunk.length / 4) { best = Math.abs(i + 1 - mid); cut = i + 1; }
  });
  return [...split(ctx, chunk.slice(0, cut), space), ...split(ctx, chunk.slice(cut), space)];
}

// Agrupa las palabras en "páginas" de máx 2 líneas: por plano, luego por frase,
// y si no cabe, partiendo en mitades equilibradas (nunca queda una palabra suelta).
export function paginate(ctx, words) {
  ctx.font = fontFor(true);
  const space = ctx.measureText(' ').width;
  const sentences = [];
  let prev = null;
  for (const w of words) {
    if (!sentences.length || w.b !== prev?.b || /[.!?…]$/.test(prev.w)) sentences.push([]);
    sentences.at(-1).push(w);
    prev = w;
  }
  // Une frases muy cortas (1-2 palabras) con la anterior del mismo plano si caben.
  const merged = [];
  for (const sn of sentences) {
    const last = merged.at(-1);
    if (last && sn.length <= 2 && last.at(-1).b === sn[0].b && last.length + sn.length <= 7) last.push(...sn);
    else merged.push(sn);
  }
  return merged.flatMap((sn) => split(ctx, sn, space))
    .map((p) => ({ lines: p, start: p[0][0].start, end: p.at(-1).at(-1).end }));
}

export function drawSubtitles(ctx, pages, t) {
  // Página activa: la última cuyo inicio ya pasó (se mantiene hasta que empieza la siguiente).
  let page = null;
  for (const p of pages) if (t >= p.start - 0.05) page = p;
  if (!page) return;
  const words = page.lines.flat();
  const lastEnd = words.at(-1).end;
  if (t > lastEnd + 0.6) return;

  const appear = Math.min(1, (t - page.start + 0.05) / 0.15);
  ctx.save();
  ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = 'rgba(0,0,0,0.85)';
  ctx.shadowBlur = 18;
  page.lines.forEach((line, li) => {
    // Medimos con la fuente correcta de cada palabra para centrar bien.
    const parts = line.map((w) => {
      const active = t >= w.start - 0.03;
      const current = t >= w.start - 0.03 && t < w.end + 0.08;
      ctx.font = fontFor(active);
      return { w, active, current, width: ctx.measureText(w.w).width };
    });
    ctx.font = fontFor(false);
    const space = ctx.measureText(' ').width;
    const total = parts.reduce((s, p) => s + p.width, 0) + space * (parts.length - 1);
    let x = (W - total) / 2;
    const y = TOP + li * LINE_H + (1 - appear) * 20;
    for (const p of parts) {
      ctx.font = fontFor(p.active);
      ctx.globalAlpha = appear;
      // contorno oscuro: se lee sobre fondos claros y oscuros
      ctx.save(); ctx.shadowBlur = 0; ctx.lineJoin = 'round'; ctx.lineWidth = 10;
      ctx.strokeStyle = p.active ? 'rgba(10,10,20,0.9)' : 'rgba(10,10,20,0.55)'; ctx.strokeText(p.w.w, x, y); ctx.restore();
      ctx.fillStyle = p.current ? 'rgba(255,255,255,1)' : p.active ? 'rgba(255,255,255,0.95)' : 'rgba(225,228,240,0.85)';
      ctx.fillText(p.w.w, x, y);
      x += p.width + space;
    }
  });
  ctx.restore();
}

// Estilo "una palabra gigante" (sketches de comedia): la palabra que se dice, en mayúsculas,
// centrada, con borde negro grueso y un pequeño "pop" al aparecer.
// Las palabras del personaje que habla llevan un toque del color de su ropa.
export function drawWordSubtitles(ctx, words, t, cast = {}) {
  let cur = null;
  for (let i = 0; i < words.length; i++) {
    const w = words[i], next = words[i + 1];
    const end = next ? Math.min(next.start, w.end + 0.35) : w.end + 0.35;
    if (t >= w.start - 0.02 && t < end) { cur = w; break; }
  }
  if (!cur) return;
  const text = cur.w.replace(/[«»"“”¿?¡!.,;:…]/g, '').toUpperCase();
  if (!text) return;
  const k = Math.min(1, (t - cur.start + 0.02) / 0.09);
  const scale = 0.8 + 0.25 * k - 0.05 * Math.max(0, k - 0.6);
  let size = 128;
  ctx.save();
  do { ctx.font = `700 ${size}px Poppins`; size -= 6; } while (ctx.measureText(text).width > 900 && size > 50);
  ctx.translate(W / 2, 1330);
  ctx.scale(scale, scale);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 22; ctx.strokeStyle = '#000';
  ctx.strokeText(text, 0, 0);
  const tint = cast[cur.sp]?.look?.outfit;
  ctx.fillStyle = tint && cur.sp !== 'narrador' ? mixWhite(tint) : '#fff';
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

function mixWhite(hex) {
  const n = parseInt(hex.slice(1), 16);
  const m = (v) => Math.round(v * 0.45 + 255 * 0.55);
  return `rgb(${m((n >> 16) & 255)},${m((n >> 8) & 255)},${m(n & 255)})`;
}
