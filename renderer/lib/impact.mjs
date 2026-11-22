// EFECTOS DE IMPACTO (estilo cómic): palabras "¡PUM!", líneas de velocidad, destellos, humo, chispas y temblor.
import { W, H, clamp, ease } from './util.mjs';
import { INK } from './brightbg.mjs';
import { T } from './lang.mjs';

const WORDS_ES = { pum: '¡PUM!', boom: '¡BOOM!', ay: '¡AY!', zas: '¡ZAS!', wow: '¡WOW!', crac: '¡CRAC!', glup: '¡GLUP!', ups: '¡UPS!', bip: '¡BIP!', ring: '¡RING!', plaf: '¡PLAF!', ñam: '¡ÑAM!' };
const WORDS_EN = { pum: 'BOOM!', boom: 'BOOM!', ay: 'OUCH!', zas: 'WHAM!', wow: 'WOW!', crac: 'CRACK!', glup: 'GULP!', ups: 'OOPS!', bip: 'BEEP!', ring: 'RING!', plaf: 'SPLAT!', ñam: 'CHOMP!' };
const COLS = ['#ffd166', '#ff8fab', '#7bdff2', '#b8f2a8'];

export function starBurst(ctx, x, y, r, color, k = 1, spikes = 14) {
  ctx.beginPath();
  for (let i = 0; i <= spikes * 2; i++) { const a = (i / (spikes * 2)) * Math.PI * 2, rr = (i % 2 ? r * 0.62 : r) * k; i ? ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : ctx.moveTo(x + rr, y); }
  ctx.closePath(); ctx.fillStyle = color; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.stroke();
}

// Palabra de cómic que aparece de golpe con estrella detrás
// Interruptor: el motor apaga las palabras de cómic en los planos que pasan del límite por vídeo.
export const comicGate = { on: true };
export function comicWord(ctx, word, x, y, t, { size = 130, color } = {}) {
  if (!comicGate.on) return;
  const WORDS = T(WORDS_ES, WORDS_EN); const text = WORDS[String(word).toLowerCase()] || String(word).toUpperCase();
  const k = ease.outBack(clamp(t / 0.25)); if (t < 0) return;
  const shake = t < 0.4 ? Math.sin(t * 90) * 8 * (1 - t / 0.4) : 0;
  ctx.save(); ctx.translate(x + shake, y); ctx.rotate(-0.12); ctx.scale(k, k);
  ctx.font = `${size}px Anton`; const w = ctx.measureText(text).width;
  starBurst(ctx, 0, -size * 0.32, Math.max(w * 0.75, size * 1.2), color || COLS[text.length % COLS.length], 1);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.lineWidth = size * 0.16; ctx.strokeStyle = INK; ctx.strokeText(text, 0, -size * 0.3);
  ctx.fillStyle = '#ffffff'; ctx.fillText(text, 0, -size * 0.3);
  ctx.restore();
}

export function speedLines(ctx, cx, cy, t, alpha = 0.6) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = INK; ctx.lineCap = 'round';
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2 + (i % 3) * 0.05, r0 = 520 + ((i * 97 + t * 900) % 300), r1 = r0 + 160 + (i % 4) * 60;
    ctx.lineWidth = 4 + (i % 3) * 3; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); ctx.stroke();
  }
  ctx.restore();
}

export function sparkles(ctx, cx, cy, t, n = 10, radius = 260) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + t * 0.8, r = radius * (0.6 + 0.4 * Math.sin(t * 3 + i)), s = 18 + 12 * Math.abs(Math.sin(t * 5 + i));
    const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
    ctx.save(); ctx.translate(x, y); ctx.rotate(t * 2 + i);
    ctx.beginPath(); for (let k = 0; k < 8; k++) { const aa = (k / 8) * Math.PI * 2, rr = k % 2 ? s * 0.3 : s; k ? ctx.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr) : ctx.moveTo(rr, 0); }
    ctx.closePath(); ctx.fillStyle = COLS[i % COLS.length]; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore();
  }
}

export function smoke(ctx, cx, cy, t, n = 8, color = 'rgba(220,220,225,0.95)') {
  for (let i = 0; i < n; i++) {
    const k = ((t * 0.7 + i / n) % 1), x = cx + Math.sin(i * 2.3) * 120 * k, y = cy - k * 380, r = 40 + k * 90;
    ctx.globalAlpha = 1 - k; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = color; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

export function flash(ctx, t, at = 0, dur = 0.18, color = '255,255,255') {
  const k = 1 - clamp((t - at) / dur); if (t < at || k <= 0) return;
  ctx.fillStyle = `rgba(${color},${0.75 * k})`; ctx.fillRect(0, 0, W, H);
}

// Temblor de cámara tras un impacto (devuelve desplazamiento)
export function shakeAt(t, at, strength = 22, dur = 0.45) {
  const k = 1 - clamp((t - at) / dur); if (t < at || k <= 0) return [0, 0];
  return [Math.sin(t * 95) * strength * k, Math.cos(t * 83) * strength * k];
}

// Efecto sobre cualquier escena: params.efecto = pum|boom|ay|zas|wow|crac|... | velocidad | brillo | humo | impacto
export function drawEffect(ctx, efecto, t, { x = W / 2, y = 560 } = {}) {
  const e = String(efecto || '').toLowerCase();
  if (!e || e === 'none' || e === 'ninguno') return;
  if (e === 'velocidad') return speedLines(ctx, W / 2, 1000, t);
  if (e === 'brillo') return sparkles(ctx, W / 2, 1000, t);
  if (e === 'humo') return smoke(ctx, W / 2, 1500, t);
  if (e === 'impacto') { flash(ctx, t, 0.05); speedLines(ctx, W / 2, 1000, t, clamp(1 - t)); return; }
  if (!comicGate.on) { sparkles(ctx, x, y + 300, t, 6); return; } // sin palabra: solo un brillo discreto
  flash(ctx, t, 0.02, 0.15);
  if (t < 1.2) speedLines(ctx, x, y + 100, t, 0.5 * (1 - t / 1.2));
  comicWord(ctx, e, x, y, t - 0.05);
}
