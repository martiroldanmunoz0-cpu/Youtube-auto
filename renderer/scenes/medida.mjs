// ESCENAS A MEDIDA: animaciones dibujadas por Claude para un plano concreto de un vídeo concreto.
// Cada vídeo tiene su archivo renderer/scenes/medida/<id>.mjs que exporta por defecto { <nº de plano>: (ctx, a, K) => {...} }.
//   a = { t, dur, prog, params, seed, who }   (t = segundos desde el inicio del plano)
//   K = caja de herramientas: lugares, persona, piezas, acciones, efectos y utilidades (ver abajo).
// El guion apunta a ellas con  scene: "medida", params: { archivo: "<id>", plano: <n>, ...lo que haga falta }.
// Si falta el archivo o el plano, se dibuja la escena de respaldo (params.respaldo) para no dejar nunca un hueco.
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { W, H, clamp, ease, lerp, seg, radial, noise1, rr, rng } from '../lib/util.mjs';
import { PROPS, DRAW, propName } from '../lib/props.mjs';
import { drawPlace, midShot, grade } from './bright.mjs';
import { personaWho, drawHead, drawFullBody } from '../lib/persona.mjs';
import { INK, brightBg } from '../lib/brightbg.mjs';
import { comicWord, speedLines, sparkles, smoke, flash, shakeAt, starBurst, drawEffect } from '../lib/impact.mjs';
import { accion } from './actions.mjs';
import { composicion } from './compose.mjs';
import { escena } from './bright.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const LOADED = {}, LOADED_WIDE = {};

// Carga (antes de dibujar) los archivos a medida que usa un timeline.
export async function preloadMedida(timeline) {
  const files = new Set((timeline.beats || []).filter((b) => b.scene === 'medida').map((b) => String(b.params?.archivo || '')));
  for (const f of files) {
    const p = path.join(here, 'medida', `${f.replace(/[^\w.-]/g, '')}.mjs`);
    if (!f || !fs.existsSync(p)) { console.error(`AVISO escena a medida no encontrada: ${f}`); continue; }
    const mod = await import(pathToFileURL(p).href);
    LOADED[f] = mod.default || {};
    LOADED_WIDE[f] = mod.ancho || {}; // escenas dibujadas directamente en horizontal (vídeos largos)
  }
}

const ph = (t, d, a, b) => clamp((t / d - a) / (b - a));
const prop = (ctx, name, x, y, s, t, rot = 0) => { const n = propName(name); if (!n) return; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); PROPS[n](ctx, t); ctx.restore(); };
const face = (ctx, who, x, y, s, opts) => { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); drawHead(ctx, 0, 0, who, opts); ctx.restore(); };
const text = (ctx, str, x, y, { size = 110, color = '#ffffff', rot = 0, k = 1 } = {}) => {
  if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const s = ease.outBack(clamp(k)); ctx.scale(s, s);
  ctx.font = `${size}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.lineWidth = size * 0.2; ctx.strokeStyle = INK; ctx.strokeText(str, 0, 0); ctx.fillStyle = color; ctx.fillText(str, 0, 0); ctx.restore();
};
export const KIT = { X0: 0, XW: 1080, W, H, INK, clamp, ease, lerp, seg, ph, radial, noise1, rr, ...DRAW, PROPS, prop, face, text,
  drawPlace, midShot, grade, brightBg, drawHead, drawFullBody, personaWho,
  comicWord, speedLines, sparkles, smoke, flash, shakeAt, starBurst, drawEffect };

const FALLBACK = { accion, composicion, escena };
export function medidaFn(params) { const fn = LOADED[String(params?.archivo || '')]?.[params?.plano]; return typeof fn === 'function' ? fn : null; }
export function medidaWide(params) { const fn = LOADED_WIDE[String(params?.archivo || '')]?.[params?.plano]; return typeof fn === 'function' ? fn : null; }
export const medida = {
  setup(p, r) { return { seed: r.int(0, 99), sub: {} }; },
  draw(ctx, s, args) {
    const { params } = args;
    const fn = LOADED[String(params.archivo || '')]?.[params.plano];
    if (typeof fn === 'function') {
      const who = personaWho(args.seed, params);
      fn(ctx, { ...args, who, d: Math.max(0.5, args.dur || 3) }, KIT);
      if (params.label) { ctx.save(); ctx.font = '700 46px Poppins'; const lbl = String(params.label).toUpperCase(); const w = Math.min(W - 80, ctx.measureText(lbl).width + 60); ctx.beginPath(); ctx.roundRect((W - w) / 2, 1739, w, 82, 41); ctx.fillStyle = '#ffd166'; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke(); ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(lbl, W / 2, 1782, w - 40); ctx.restore(); }
      return;
    }
    // Respaldo: la escena que tenía el plano antes de hacerlo a medida
    const rb = params.respaldo || { scene: 'escena', params: { lugar: 'salon' } };
    const sc = FALLBACK[rb.scene] || escena;
    if (!s.sub.st) s.sub.st = sc.setup(rb.params || {}, rng('respaldo'));
    sc.draw(ctx, s.sub.st, { ...args, params: rb.params || {} });
  },
};
