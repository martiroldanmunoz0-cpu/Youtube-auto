import { brightBg, INK } from '../lib/brightbg.mjs';
import { CAL_VARIANTS, pickVariant } from './variants.mjs';
// Escenas generales para temas cotidianos / "qué pasaría si": personaje, dinero, calendario.
import { W, H, PALETTE as P, rr, radial, rgba, seg, ease, lerp, clamp } from '../lib/util.mjs';
import { makeBokeh, drawBokeh, makeDust, drawDust } from '../lib/fx.mjs';
import { drawEyes, blinkAt } from '../lib/parts.mjs';
import { linearBg } from './vehicle.mjs';
import { personaWho, drawHead } from '../lib/persona.mjs';

// Personaje (busto frontal, estilo plano). params: { mood: neutral|happy|worried|shocked|angry|sad,
//   prop?: 'money'|'phone'|'none', bg?: 'night'|'warm'|'cold'|'red', outfit?: #hex }
export const character = {
  setup(p, r) { return { bokeh: makeBokeh(r, 14, { rMin: 60, rMax: 160 }), seed: r.int(0, 99) }; },
  draw(ctx, s, { t, params, seed }) {
    const who = personaWho(seed, params);
    const bgs = { night: ['#07080f', '#141a30', '#08080d'], warm: ['#0d0806', '#2a160c', '#0b0605'], cold: ['#05080c', '#0e1c2a', '#05070a'], red: ['#0a0405', '#2a0a0e', '#080304'] };
    ctx.fillStyle = linearBg(ctx, 0, 0, 0, H, bgs[params.bg] || bgs.night);
    ctx.fillRect(0, 0, W, H);
    drawBokeh(ctx, s.bokeh, t);
    const mood = params.mood || 'neutral';
    const cx = W / 2, cy = 1080 + Math.sin(t * 1.6) * 6 + (mood === 'shocked' ? -Math.abs(Math.sin(t * 9)) * 6 : 0);
    radial(ctx, cx, cy - 100, 700, mood === 'angry' || params.bg === 'red' ? P.red : P.amber, 0.18);
    const outfit = who.outfit;
    // Cuerpo
    ctx.fillStyle = outfit;
    ctx.beginPath();
    ctx.moveTo(cx - 420, H + 40); ctx.quadraticCurveTo(cx - 400, cy + 330, cx - 150, cy + 290);
    ctx.lineTo(cx + 150, cy + 290); ctx.quadraticCurveTo(cx + 400, cy + 330, cx + 420, H + 40); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.moveTo(cx - 90, cy + 290); ctx.lineTo(cx, cy + 420); ctx.lineTo(cx + 90, cy + 290); ctx.fill();
    drawHead(ctx, cx, cy, who, { mood, t, blinkSeed: s.seed });
    // Objeto en la mano
    if (params.prop === 'money') {
      for (let i = 0; i < 5; i++) drawBill(ctx, cx + 260 + i * 14, cy + 420 - i * 10, 0.9, -0.4 + i * 0.12);
    } else if (params.prop === 'phone') {
      ctx.fillStyle = '#c9ccd6'; rr(ctx, cx + 200, cy + 300, 150, 280, 26); ctx.fill();
      ctx.fillStyle = '#1b1f33'; rr(ctx, cx + 210, cy + 312, 130, 256, 20); ctx.fill();
      radial(ctx, cx + 275, cy + 440, 200, P.ui, 0.35);
    }
  },
};

export function drawBill(ctx, x, y, s = 1, rot = 0) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = '#c99a4a'; rr(ctx, -110, -55, 220, 110, 10); ctx.fill();
  ctx.strokeStyle = '#7a5520'; ctx.lineWidth = 4; rr(ctx, -98, -43, 196, 86, 8); ctx.stroke();
  ctx.fillStyle = '#7a5520'; ctx.font = '700 54px Poppins'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('€', 0, 2);
  ctx.beginPath(); ctx.arc(-62, 0, 18, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(62, 0, 18, 0, 7); ctx.stroke();
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.restore();
}

// Lluvia de billetes con cifra. params: { amount?: '1.000.000 €', label?: string, rain?: bool, stack?: bool }
export const money = {
  setup(p, r) {
    return {
      bills: Array.from({ length: 34 }, () => ({ x: r.range(-60, W + 60), y: r.range(-H, H), v: r.range(220, 520), rot: r.range(0, 6), vr: r.range(-2, 2), s: r.range(0.7, 1.3), sw: r.range(0, 6) })),
      dust: makeDust(r, 50),
    };
  },
  draw(ctx, s, { t, params }) {
    brightBg(ctx, t, 'verde');
    if (params.stack !== false) {
      for (let row = 0; row < 7; row++) for (let i = 0; i < 3; i++) {
        const x = W / 2 + (i - 1) * 240, y = 1620 - row * 34;
        ctx.fillStyle = row % 2 ? '#b98a3c' : '#c99a4a'; rr(ctx, x - 115, y - 30, 230, 60, 8); ctx.fill();
        ctx.fillStyle = 'rgba(122,85,32,0.8)'; ctx.fillRect(x - 20, y - 30, 40, 60);
      }
    }
    if (params.rain !== false) {
      for (const b of s.bills) {
        const y = ((b.y + b.v * t) % (H + 300) + H + 300) % (H + 300) - 150;
        drawBill(ctx, b.x + Math.sin(t * 1.5 + b.sw) * 50, y, b.s * 0.8, b.rot + b.vr * t);
      }
    }
    if (params.amount) {
      let text = String(params.amount);
      const m = text.match(/^([\d.,]+)(.*)$/);
      if (m) {
        const target = Number(m[1].replace(/\./g, '').replace(',', '.'));
        const k = ease.out(seg(t, 0.1, 1.4));
        if (Number.isFinite(target) && target > 1 && k < 1) text = Math.round(target * k).toLocaleString('es-ES') + m[2];
      }
      ctx.save();
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      let size = 170; do { ctx.font = `700 ${size}px Poppins`; size -= 8; } while (ctx.measureText(text).width > 960 && size > 40);
      ctx.lineJoin = 'round'; ctx.lineWidth = 18; ctx.strokeStyle = INK; ctx.strokeText(text, W / 2, 1000);
      ctx.fillStyle = '#fff'; ctx.fillText(text, W / 2, 1000);
      if (params.label) { ctx.font = '600 52px Poppins'; ctx.fillStyle = INK; ctx.fillText(params.label, W / 2, 1130); }
      ctx.restore();
    }
  },
};

// Calendario de taco que pasa hojas. params: { day: número o texto, month?: texto, label?: texto, from?: número }
export const calendar = {
  setup(p, r) { return { variant: pickVariant(r, p, ['taco', 'pared', 'marcas']) }; },
  draw(ctx, s, args) {
    if (CAL_VARIANTS[s.variant]) return CAL_VARIANTS[s.variant](ctx, s, args);
    const { t, params, dur } = args;
    brightBg(ctx, t, 'azul');
    const cx = W / 2, cy = 1100, cw = 620, ch = 700;
    const target = Number(params.day);
    const from = Number.isFinite(Number(params.from)) ? Number(params.from) : (Number.isFinite(target) ? Math.max(1, target - 5) : null);
    let shown = String(params.day ?? '1');
    let flipK = 0;
    if (Number.isFinite(target) && from !== null && target !== from) {
      const span = Math.max(0.6, Math.min(dur * 0.6, 2.2));
      const k = clamp(t / span);
      const n = Math.abs(target - from);
      const f = k * n;
      shown = String(Math.round(from + Math.sign(target - from) * Math.floor(f)));
      flipK = k < 1 ? f - Math.floor(f) : 0;
    }
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; rr(ctx, cx - cw / 2 + 20, cy - ch / 2 + 30, cw, ch, 40); ctx.fill();
    ctx.fillStyle = '#efe7d6'; rr(ctx, cx - cw / 2, cy - ch / 2, cw, ch, 40); ctx.fill();
    ctx.fillStyle = '#c0262e'; rr(ctx, cx - cw / 2, cy - ch / 2, cw, 170, 40); ctx.fill(); ctx.fillRect(cx - cw / 2, cy - ch / 2 + 120, cw, 50);
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '700 64px Poppins'; ctx.fillText(String(params.month || 'DÍA').toUpperCase(), cx, cy - ch / 2 + 88);
    ctx.fillStyle = '#1b1612';
    let size = 330; do { ctx.font = `700 ${size}px Poppins`; size -= 10; } while (ctx.measureText(shown).width > cw - 80 && size > 60);
    ctx.fillText(shown, cx, cy + 70);
    if (params.label) { ctx.font = '500 44px Poppins'; ctx.fillStyle = '#6a5f4a'; ctx.fillText(params.label, cx, cy + ch / 2 - 70); }
    // Hoja que se arranca: sube y se desvanece
    if (flipK > 0) {
      ctx.save();
      ctx.globalAlpha = 0.85 * (1 - flipK);
      ctx.translate(cx, cy - ch / 2 + 170 - flipK * 260);
      ctx.rotate(-flipK * 0.25);
      ctx.fillStyle = '#e6dcc6';
      ctx.fillRect(-cw / 2, 0, cw, ch - 170);
      ctx.restore();
    }
    // Anillas
    for (let i = 0; i < 6; i++) { ctx.fillStyle = '#9a9ea8'; rr(ctx, cx - cw / 2 + 70 + i * 96, cy - ch / 2 - 30, 22, 70, 11); ctx.fill(); }
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  },
};
