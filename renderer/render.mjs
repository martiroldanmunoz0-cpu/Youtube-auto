#!/usr/bin/env node
// Motor de render: timeline.json -> vídeo vertical 1080x1920 (MP4).
//
// Uso:
//   node render.mjs timeline.json salida.mp4 [--audio voz.m4a] [--fps 30]
//   node render.mjs timeline.json fotogramas.png --stills 8   (hoja de previsualización)
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { W, H, rng, clamp, ease, lerp, seg, noise1 } from './lib/util.mjs';
import { grain, vignette, topShade } from './lib/fx.mjs';
import { paginate, drawSubtitles, drawWordSubtitles } from './lib/subtitles.mjs';
import { SCENES } from './scenes/index.mjs';
import { preloadMedida } from './scenes/medida.mjs';
import { setLooks } from './lib/persona.mjs';
import { drawEffect, comicGate } from './lib/impact.mjs';
import { drawPlace as drawPlaceWide } from './scenes/bright.mjs';
import { BG_CONTEXT, INK as INK_BASE } from './lib/brightbg.mjs';
import { medidaWide, medidaFn, KIT } from './scenes/medida.mjs';
import { personaWho } from './lib/persona.mjs';
import { lifeOverlay } from './lib/ambient.mjs';
import { propName, STYLE } from './lib/props.mjs';
import { T, LANG } from './lib/lang.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const fontDir = path.join(here, '..', 'assets', 'fonts');
for (const f of fs.readdirSync(fontDir).filter((f) => f.endsWith('.ttf'))) GlobalFonts.registerFromPath(path.join(fontDir, f), 'Poppins');
const antonPath = path.join(here, '..', 'assets', 'branding', 'fonts', 'Anton-Regular.ttf');
if (fs.existsSync(antonPath)) GlobalFonts.registerFromPath(antonPath, 'Anton');

const TRANSITION = 0.32;
const SETTLE = 0.3; // tras un corte, el plano entra con un pequeño empujón que se asienta
// Escenas de estilo oscuro (misterio, noche, espacio): llevan el acabado oscuro del canal
const OPAQUE_SCENES = new Set(['map_pin']);
const DARK_SCENES = new Set(['eyes_dark', 'silhouette', 'hallway', 'front_door', 'bedroom', 'house_exterior', 'car_window', 'rearview_eyes', 'city_street', 'forest', 'space', 'ocean', 'character', 'duo', 'closeup', 'vice_street', 'vice_beach', 'car_ride', 'police_chase']);

// Blindaje: la IA a veces pasa números (p. ej. día 1) donde el lienzo espera texto. Se convierten siempre.
{
  const proto = Object.getPrototypeOf(createCanvas(1, 1).getContext('2d'));
  for (const fn of ['fillText', 'strokeText', 'measureText']) {
    const orig = proto[fn];
    proto[fn] = function (text, ...rest) { return orig.call(this, String(text ?? ''), ...rest); };
  }
}
// Escenas que ya tienen mucho movimiento propio; al resto se les añade una capa de vida discreta
const LIVELY = new Set(['escena', 'composicion', 'accion', 'medida', 'money', 'police_chase', 'car_ride', 'car_window', 'ocean', 'big_text', 'surgery', 'clock', 'document']);
const sceneErrors = new Set();

// Campos que las escenas usan como TEXTO: si la IA manda un número, se convierte a texto.
const TEXT_KEYS = new Set(['text', 'label', 'place', 'detail', 'title', 'subtitle', 'caller', 'name', 'contact', 'status_text',
  'time', 'date', 'app', 'headline', 'kicker', 'query', 'amount', 'balance', 'month', 'kicker', 'who', 'left', 'right',
  'driver', 'passenger']);
function sanitize(v, key) {
  if (Array.isArray(v)) return v.map((x) => sanitize(x, key));
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, sanitize(x, k)]));
  if (TEXT_KEYS.has(key) && (typeof v === 'number' || typeof v === 'boolean')) return String(v);
  if (key === 'results' && typeof v !== 'string' && v != null) return String(v);
  return v;
}

function parseArgs(argv) {
  const a = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) a[argv[i].slice(2)] = argv[i + 1]?.startsWith('--') || argv[i + 1] === undefined ? true : argv[++i];
    else a._.push(argv[i]);
  }
  return a;
}

// Movimientos de cámara: devuelven {s (zoom), x, y, r (rotación)} según progreso 0..1.
// Velocidad casi constante (sin arrancar ni frenar en seco) y recorridos amplios: la imagen nunca se queda quieta.
const CAMERAS = {
  push_in: (k) => ({ s: lerp(1.04, 1.24, k), x: 0, y: lerp(10, -10, k) }),
  pull_out: (k) => ({ s: lerp(1.26, 1.05, k), x: 0, y: 0 }),
  pan_left: (k) => ({ s: 1.2, x: lerp(110, -110, k), y: 0 }),
  pan_right: (k) => ({ s: 1.2, x: lerp(-110, 110, k), y: 0 }),
  tilt_up: (k) => ({ s: 1.2, x: 0, y: lerp(-150, 150, k) }),
  tilt_down: (k) => ({ s: 1.2, x: 0, y: lerp(150, -150, k) }),
  static: (k) => ({ s: lerp(1.05, 1.12, k), x: lerp(-15, 15, k), y: 0 }),
  shake: (k, t) => ({ s: lerp(1.1, 1.18, k), x: (noise1(t * 14, 1) - 0.5) * 22, y: (noise1(t * 14, 2) - 0.5) * 22 }),
  slam: (k, t) => ({ s: lerp(1.45, 1.1, ease.out(clamp(k * 4))) + k * 0.06, x: (noise1(t * 20, 3) - 0.5) * 12 * (1 - clamp(k * 3)), y: 0 }),
};
// Progreso "fluido": casi lineal (velocidad constante) con un toque de suavizado.
const flowK = (p) => 0.8 * p + 0.2 * ease.inOut(p);
// Dirección del movimiento de cada cámara (para que la transición siga el mismo sentido).
const CAM_DIR = { pan_left: [-1, 0], pan_right: [1, 0], tilt_up: [0, 1], tilt_down: [0, -1] };

export class Renderer {
  constructor(timeline) {
    this.tl = timeline;
    setLooks(timeline.looks || {});
    LANG.code = timeline.lang || 'es';
    this.fps = timeline.fps || 30;
    this.canvas = createCanvas(W, H);
    this.ctx = this.canvas.getContext('2d');
    this.layerA = createCanvas(W, H);
    this.layerB = createCanvas(W, H);
    // Guiones antiguos: un "texto en grande" que nombra un objeto de la biblioteca (SEÑAL DE TRÁFICO,
    // MÁQUINA DE PINBALL...) se convierte en una composición con ese objeto animado y su nombre en la etiqueta.
    const realPlace = (b) => (b.params?.lugar && !['fondo', 'espacio'].includes(b.params.lugar) ? b.params.lugar : null);
    let lastPlace = timeline.beats.map(realPlace).find(Boolean) || 'salon';
    timeline.beats = timeline.beats.map((b) => {
      if (realPlace(b)) lastPlace = b.params.lugar;
      b = { ...b, ctxPlace: lastPlace, ctxHora: b.params?.hora || 'dia' };
      // Fondo liso de color: se sustituye por el lugar del vídeo (nunca un plano "vacío" con rayos)
      if (b.params?.lugar === 'fondo') b = { ...b, params: { ...b.params, lugar: lastPlace } };
      if (b.scene !== 'big_text') return b;
      if (/^[\d.,+-]/.test(String(b.params?.text || '').trim())) return { ...b, params: { lugar: lastPlace, ...b.params } }; // cifra: sobre el lugar del vídeo
      const txt = String(b.params?.text || '').toLowerCase().trim();
      const ws = txt.split(/\s+/);
      const cands = [txt, ws.slice(0, 3).join(' '), ws.slice(0, 2).join(' '), ...ws];
      const pieza = cands.map((c) => propName(c)).find(Boolean);
      if (!pieza) return { ...b, params: { lugar: lastPlace, ...b.params } };
      return { ...b, scene: 'composicion', params: { lugar: lastPlace, persona: 'medio', mood: 'shocked', piezas: [{ pieza, tamano: 'grande', anim: 'crecer' }], label: b.params.text, efecto: b.params.efecto } };
    });
    this.beats = timeline.beats.map((b, i) => {
      const scene = SCENES[b.scene] || SCENES.big_text;
      if (!SCENES[b.scene]) console.warn(`Escena desconocida "${b.scene}", uso big_text`);
      const params = sanitize(b.params || {});
      if (!SCENES[b.scene] && !params.text) params.text = '';
      const r = rng(`${timeline.seed || 'x'}-${i}-${b.scene}`);
      return { ...b, params, scene, scene_name: SCENES[b.scene] ? b.scene : 'big_text', state: scene.setup(params, r) };
    });
    this.limitComic();
    const words = timeline.words || [];
    this.pages = words.length ? paginate(this.ctx, words) : [];
    this.total = timeline.total || this.beats.at(-1).end;
  }

  // Palabras de cómic (¡PUM!, ¡ZAS!, ¡AY!...): como mucho MAX_COMIC por vídeo y separadas; el resto se apagan.
  limitComic() {
    const MAX_COMIC = 2, GAP = 10;
    const EFFECT_WORDS = new Set(['pum', 'boom', 'ay', 'zas', 'wow', 'crac', 'glup', 'ups', 'bip', 'ring', 'plaf', 'ñam']);
    const ACTION_WORDS = new Set(['cortarse', 'cortar', 'caer_romper', 'romper', 'explosion', 'explotar', 'beber', 'comer', 'choque', 'chocar', 'rayo']);
    let used = 0, last = -Infinity;
    for (const b of this.beats) {
      const e = String(b.params.efecto || '').toLowerCase();
      const hasWord = EFFECT_WORDS.has(e) || (b.scene_name === 'accion' && ACTION_WORDS.has(String(b.params.tipo || b.params.accion || '').toLowerCase()));
      if (b.bucle) { b.sinPalabra = true; continue; } // el bucle no repite la palabra de cómic
      if (!hasWord) continue;
      if (used < MAX_COMIC && b.start - last >= GAP) { used++; last = b.start; }
      else b.sinPalabra = true;
    }
  }

  beatIndexAt(t) {
    for (let i = this.beats.length - 1; i >= 0; i--) if (t >= this.beats[i].start) return i;
    return 0;
  }

  drawBeat(ctx, b, t, frame) {
    // Plano del bucle (repite el plano 1): sigue animado (cámara, ambiente, piezas). En las acciones
    // (cortarse, explotar...) el tiempo va a cámara lenta para quedarse en la preparación y no repetir el golpe.
    const local = b.bucle && b.scene_name === 'accion' ? 0.02 + (t - b.start) * 0.25 : t - b.start;
    const dur = Math.max(0.5, b.end - b.start);
    const prog = clamp(local / dur);
    const cam = this.noCam ? { s: 1, x: 0, y: 0 } : (CAMERAS[b.camera] || CAMERAS.push_in)(flowK(prog), t);
    // Respiración continua: deriva suave y un pelín de giro, para que nada esté nunca congelado
    const drift = this.noCam ? 0 : 1;
    const dx = (noise1(t * 0.6, 11) - 0.5) * 18 * drift, dy = (noise1(t * 0.6, 12) - 0.5) * 18 * drift;
    const rot = (noise1(t * 0.4, 13) - 0.5) * 0.012 * drift;
    // Entrada con energía tras un corte: arranca algo más cerca y se asienta
    const settle = b.bucle || b.camera === 'slam' || this.noCam ? 0 : 0.07 * (1 - ease.out(clamp(local / SETTLE)));
    ctx.save();
    if (!this.subjectOnly) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); }
    ctx.translate(W / 2 + cam.x + dx, H / 2 + cam.y + dy);
    ctx.rotate(rot + (cam.r || 0));
    ctx.scale(cam.s + settle, cam.s + settle);
    ctx.translate(-W / 2, -H / 2);
    comicGate.on = !b.sinPalabra;
    BG_CONTEXT.lugar = DARK_SCENES.has(b.scene_name) ? null : b.ctxPlace; BG_CONTEXT.hora = b.ctxHora || 'dia';
    try {
      b.scene.draw(ctx, b.state, { t: local, dur, prog, params: b.params, frame, global: t, seed: this.tl.persona || this.tl.seed, cast: this.tl.cast || {}, speaker: b.speaker, voice_dur: b.voice_dur });
      if (!LIVELY.has(b.scene_name) && !this.subjectOnly) lifeOverlay(ctx, local, DARK_SCENES.has(b.scene_name));
      if (b.params.efecto) drawEffect(ctx, b.params.efecto, local); // ¡PUM!, ¡ZAS!, velocidad, brillo...
      comicGate.on = true;
    } catch (e) {
      // Una escena rota no debe tumbar el vídeo entero: fondo neutro y aviso (el revisor lo verá)
      if (!sceneErrors.has(b.scene)) { sceneErrors.add(b.scene); console.error(`AVISO escena con error (${b.start}s): ${e.message}`); }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = '#0b1020'; ctx.fillRect(0, 0, W, H);
    }
    comicGate.on = true;
    ctx.restore();
  }

  renderFrame(frame) {
    const t = frame / this.fps;
    const ctx = this.ctx;
    const end = this.tl.endcard;
    const endStart = end ? this.total - (end.duration || 2.2) : Infinity;
    const i = this.beatIndexAt(t);
    const b = this.beats[i];
    const prev = this.beats[i - 1];
    const inTrans = prev && b.transition !== 'cut' && t < b.start + TRANSITION;
    if (inTrans) {
      const k = ease.inOut(seg(t, b.start, TRANSITION));
      this.drawBeat(this.layerA.getContext('2d'), prev, t, frame);
      this.drawBeat(this.layerB.getContext('2d'), b, t, frame);
      if (b.transition === 'black') {
        ctx.globalAlpha = 1; ctx.drawImage(this.layerA, 0, 0);
        ctx.fillStyle = `rgba(0,0,0,${Math.sin(k * Math.PI)})`; ctx.fillRect(0, 0, W, H);
        if (k > 0.5) { ctx.globalAlpha = (k - 0.5) * 2; ctx.drawImage(this.layerB, 0, 0); ctx.globalAlpha = 1; }
      } else if (b.transition === 'whip' || (b.transition === 'fade' && CAM_DIR[prev.camera])) {
        this.whip(ctx, k, CAM_DIR[prev.camera] || CAM_DIR[b.camera] || [-1, 0]);
      } else {
        this.zoomThrough(ctx, k); // transición fluida por defecto: se "atraviesa" el plano hacia el siguiente
      }
      if (b.transition === 'flash') { ctx.fillStyle = `rgba(255,255,255,${Math.sin(k * Math.PI) * 0.8})`; ctx.fillRect(0, 0, W, H); }
      if (b.transition === 'red') { ctx.fillStyle = `rgba(200,20,30,${Math.sin(k * Math.PI) * 0.6})`; ctx.fillRect(0, 0, W, H); }
    } else {
      this.drawBeat(ctx, b, t, frame);
    }
    // Acabado común del canal
    const bright = !DARK_SCENES.has(b.scene_name); // estilo luminoso: acabado suave; el oscuro solo en escenas de misterio/noche
    if (this.tl.subtitle_style !== 'word' && !this.wide) topShade(ctx, bright ? 0.32 : 0.55);
    vignette(ctx, bright ? 0.22 : 0.7);
    grain(ctx, frame, bright ? 0.015 : 0.05);
    if (this.wide) return; // en horizontal, subtítulos y rótulos los pone WideRenderer sobre el fotograma ancho
    if (this.tl.subtitle_style === 'word') drawWordSubtitles(ctx, this.tl.words || [], t, this.tl.cast || {});
    else drawSubtitles(ctx, this.pages, t);
    if (t >= endStart) this.drawEndcard(ctx, t - endStart, end);
    // Gancho a pantalla grande en los primeros segundos (sin fundido desde negro: el fotograma 0 ya engancha)
    if (this.tl.hook?.text && t < (this.tl.hook.dur || 2.3)) this.drawHook(ctx, t, this.tl.hook);
    // Pregunta para comentarios (al final, antes del bucle): invita a comentar
    const cm = this.tl.comment;
    if (cm?.text && t >= cm.start && t < cm.end) this.drawComment(ctx, t - cm.start, cm.end - cm.start, cm.text);
  }

  // Dibuja una capa escalada desde el centro, con estela de desenfoque (varias copias tenues).
  blurDraw(ctx, img, scale, ox, oy, alpha, streak, dir) {
    const n = streak > 2 ? 10 : 1;
    for (let j = 0; j < n; j++) {
      const f = n === 1 ? 0 : j / (n - 1) - 0.5;
      ctx.save();
      ctx.globalAlpha = alpha / (n === 1 ? 1 : n * 0.55);
      ctx.translate(W / 2 + ox + dir[0] * streak * f, H / 2 + oy - dir[1] * streak * f);
      const sc = scale * (1 + (dir[0] || dir[1] ? 0 : streak * f * 0.0006));
      ctx.scale(sc, sc);
      ctx.drawImage(img, -W / 2, -H / 2);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  // Zoom a través: el plano saliente se acelera hacia dentro y el entrante llega desde cerca y se asienta.
  zoomThrough(ctx, k) {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    const speed = Math.sin(k * Math.PI); // máxima velocidad a mitad de la transición
    this.blurDraw(ctx, this.layerA, 1 + ease.in(k) * 0.9, 0, 0, 1, speed * 90, [0, 0]);
    this.blurDraw(ctx, this.layerB, 1 + (1 - ease.out(k)) * 0.45, 0, 0, clamp(k * 1.8 - 0.2), speed * 60, [0, 0]);
  }

  // Barrido rápido: los dos planos se deslizan juntos en el sentido del movimiento de cámara, con estela.
  whip(ctx, k, dir) {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    const speed = Math.sin(k * Math.PI);
    const dx = -dir[0] * W, dy = dir[1] * H;
    this.blurDraw(ctx, this.layerA, 1.02, dx * k, dy * k, 1, speed * 140, dir);
    this.blurDraw(ctx, this.layerB, 1.02, -dx * (1 - k), -dy * (1 - k), 1, speed * 140, dir);
  }

  // Burbuja de comentario: icono de bocadillo + pregunta, entra con rebote y sale al final
  drawComment(ctx, t, dur, text) {
    const k = ease.outBack(clamp(t / 0.35)), out = clamp((dur - t) / 0.25);
    ctx.save(); ctx.globalAlpha = out; ctx.translate(W / 2, 600); ctx.scale(k, k);
    ctx.font = '800 54px Poppins';
    const lines = []; let cur = '';
    for (const w of String(text).split(' ')) { const tryL = cur ? cur + ' ' + w : w; if (ctx.measureText(tryL).width > 720 && cur) { lines.push(cur); cur = w; } else cur = tryL; }
    if (cur) lines.push(cur);
    const tw = Math.max(...lines.map((l) => ctx.measureText(l).width)), bw = Math.min(W - 60, tw + 190), bh = 60 + lines.length * 66;
    ctx.beginPath(); ctx.roundRect(-bw / 2, -bh / 2, bw, bh, 40); ctx.moveTo(-bw / 2 + 90, bh / 2 - 2); ctx.lineTo(-bw / 2 + 60, bh / 2 + 50); ctx.lineTo(-bw / 2 + 140, bh / 2 - 2);
    ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = '#1c1a2b'; ctx.lineJoin = 'round'; ctx.stroke();
    // icono de comentarios
    const ix = -bw / 2 + 70, wig = Math.sin(t * 8) * 0.08;
    ctx.save(); ctx.translate(ix, 0); ctx.rotate(wig); ctx.beginPath(); ctx.roundRect(-38, -32, 76, 56, 16); ctx.moveTo(-14, 22); ctx.lineTo(-22, 44); ctx.lineTo(6, 22); ctx.fillStyle = '#ff4d6d'; ctx.fill();
    ctx.fillStyle = '#fff'; for (const dx of [-18, 0, 18]) { ctx.beginPath(); ctx.arc(dx, -4, 6, 0, 7); ctx.fill(); } ctx.restore();
    ctx.fillStyle = '#1c1a2b'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    lines.forEach((l, i) => ctx.fillText(l, -bw / 2 + 130, -((lines.length - 1) * 66) / 2 + i * 66));
    ctx.restore();
  }

  drawHook(ctx, t, hook) {
    const dur = hook.dur || 2.3;
    const alpha = t < dur - 0.3 ? 1 : clamp((dur - t) / 0.3);
    const pop = 1 + 0.14 * (1 - ease.out(clamp(t / 0.22)));
    const text = String(hook.text).toUpperCase().trim();
    const words = text.split(/\s+/).filter(Boolean);
    ctx.save();
    ctx.globalAlpha = alpha;
    // banda oscura detrás del texto para que se lea sobre cualquier imagen
    const g = ctx.createLinearGradient(0, 560, 0, 1360);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.25, 'rgba(0,0,0,0.6)'); g.addColorStop(0.75, 'rgba(0,0,0,0.6)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(this.wide ? -(WW - W) / 2 : 0, 560, this.wide ? WW : W, 800); // en horizontal, banda de lado a lado
    let size = 200, lines = [];
    for (; size >= 90; size -= 10) {
      ctx.font = `${size}px Anton`;
      lines = []; let cur = '';
      for (const w of words) { const tt = cur ? cur + ' ' + w : w; if (ctx.measureText(tt).width > W - 120 && cur) { lines.push(cur); cur = w; } else cur = tt; }
      if (cur) lines.push(cur);
      if (lines.length <= 3 && lines.every((l) => ctx.measureText(l).width <= W - 120)) break;
    }
    const lh = size * 1.06;
    ctx.translate(W / 2, 960); ctx.scale(pop, pop); ctx.translate(-W / 2, -960);
    let y = 960 - ((lines.length - 1) * lh) / 2 + size * 0.36;
    ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
    const hot = (w) => /[0-9?¿!¡]/.test(w);
    for (const line of lines) {
      let x = (W - ctx.measureText(line).width) / 2;
      for (const w of line.split(' ')) {
        ctx.lineWidth = size * 0.13; ctx.strokeStyle = '#000'; ctx.strokeText(w, x, y);
        ctx.fillStyle = hot(w) ? '#ffb35c' : '#ffffff'; ctx.fillText(w, x, y);
        x += ctx.measureText(w + ' ').width;
      }
      y += lh;
    }
    ctx.restore();
  }

  drawEndcard(ctx, t, end) {
    const k = ease.out(clamp(t / 0.5));
    ctx.fillStyle = `rgba(5,6,10,${0.92 * k})`;
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.globalAlpha = k;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.font = '700 72px Poppins';
    ctx.fillText(end.title || T('Sígueme', 'Follow'), W / 2, H / 2 - 40 + (1 - k) * 30);
    ctx.font = '400 44px Poppins';
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    if (end.subtitle) ctx.fillText(end.subtitle, W / 2, H / 2 + 40);
    if (end.handle) {
      ctx.font = '600 42px Poppins';
      ctx.fillStyle = '#ffb35c';
      ctx.fillText(end.handle, W / 2, H / 2 + 140);
    }
    ctx.restore();
  }
}

// ---------------- VÍDEOS LARGOS (horizontal 1920×1080, pantalla completa) ----------------
// El fondo es PANORÁMICO: el lugar del plano dibujado nítido a lo ancho de toda la pantalla (la parte central tal cual
// y los lados como continuación en espejo, sin costuras). Encima, solo los personajes, piezas y efectos de la escena
// (la escena se dibuja «sin fondo»). Las escenas a medida de los vídeos largos pueden dibujarse directamente en ancho.
export const WW = 1920, WH = 1080;
// Cada plano se dibuja en un lienzo vertical MUY ancho (la escena de siempre en el centro y PAD píxeles más a cada lado),
// con el lugar continuado a lo ancho en espejo. Así lo que entra o se mueve por los lados nunca se corta.
// El encuadre (qué franja vertical se ve) se calcula para cada plano mirando dónde hay dibujo: nada queda cortado arriba.
// La cámara (acercar, paneo...) se aplica al fotograma ancho entero, fondo y personajes a la vez, y más suave que en los Shorts.
const PAD = 1250, VW = W + 2 * PAD;
const MEDIDA_CROP = { cy: 230, ch: 1580 };
export class WideRenderer extends Renderer {
  constructor(timeline) {
    super(timeline);
    this.wide = true;
    this.pc = createCanvas(VW, H); this.pctx = this.pc.getContext('2d');
    const orig = this.pctx.fillRect.bind(this.pctx);
    // un relleno de «toda la pantalla» de la escena vertical se extiende a todo el ancho (velos, luz de la hora, fondos lisos)
    this.pctx.fillRect = (x, y, w, h) => (x <= 2 && y <= 2 && w >= W - 4 && h >= H - 4 ? orig(x - PAD - 60, y, w + 2 * PAD + 120, h) : orig(x, y, w, h));
    this.canvas = createCanvas(WW, WH); this.ctx = this.canvas.getContext('2d');
    this.bg = createCanvas(W, H);
    this.wa = createCanvas(WW, WH); this.wb = createCanvas(WW, WH);
    this.crops = new Map();
  }
  placeOf(b) { return b.params?.lugar || b.params?.respaldo?.params?.lugar || b.ctxPlace || 'salon'; }
  horaOf(b) { return b.params?.hora || b.params?.respaldo?.params?.hora || b.ctxHora || 'dia'; }
  // El lugar continuado a lo ancho (coordenadas verticales, con la transformación actual): copias en espejo sin costuras
  panoV(ctx, lugar, hora, t) {
    const bctx = this.bg.getContext('2d'); bctx.setTransform(1, 0, 0, 1, 0, 0); bctx.clearRect(0, 0, W, H);
    const none = BG_CONTEXT.none; BG_CONTEXT.none = false;
    try { drawPlaceWide(bctx, lugar, hora, t); } finally { BG_CONTEXT.none = none; }
    const E = 10, tw = W - 2 * E;
    for (let k = -2; k <= 2; k++) {
      const x = E + k * tw;
      ctx.save();
      if (k % 2) { ctx.translate(x + tw, 0); ctx.scale(-1, 1); ctx.drawImage(this.bg, E, 0, tw, H, 0, 0, tw, H); }
      else ctx.drawImage(this.bg, E, 0, tw, H, x, 0, tw, H);
      ctx.restore();
    }
  }
  gradeV(ctx, hora) {
    if (hora !== 'noche' && hora !== 'atardecer') return;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = hora === 'noche' ? 'rgb(135,145,205)' : 'rgb(255,214,180)';
    ctx.fillRect(0, 0, VW + 1, H + 1); ctx.restore(); // (tamaño distinto de W×H: no lo toca el ensanchado)
  }
  isOpaque(b) {
    if (b._opaque === undefined) { // ¿la escena se pinta su propio fondo? (se mira a mitad del plano, sin el lugar)
      const p = this.pctx, t = (b.start + b.end) / 2;
      p.setTransform(1, 0, 0, 1, 0, 0); p.clearRect(0, 0, VW, H); p.setTransform(1, 0, 0, 1, PAD, 0);
      BG_CONTEXT.none = true; this.subjectOnly = true; this.noCam = true;
      try { this.drawBeat(p, b, t, Math.round(t * this.fps)); } finally { BG_CONTEXT.none = false; this.subjectOnly = false; this.noCam = false; }
      const a = p.getImageData(PAD + 4, 1000, 1, 1).data[3], c = p.getImageData(PAD + W - 4, 240, 1, 1).data[3];
      b._opaque = DARK_SCENES.has(b.scene_name) || OPAQUE_SCENES.has(b.scene_name) || (a > 200 && c > 200);
    }
    return b._opaque;
  }
  // Dibuja el plano en el lienzo ancho vertical (sin cámara)
  paint(b, t, frame) {
    const p = this.pctx, local = t - b.start, dur = Math.max(0.5, b.end - b.start);
    p.setTransform(1, 0, 0, 1, 0, 0); p.clearRect(0, 0, VW, H); p.setTransform(1, 0, 0, 1, PAD, 0);
    this.noCam = true;
    try {
      const vfn = b.scene_name === 'medida' ? medidaFn(b.params) : null;
      if (vfn) {
        const who = personaWho(this.tl.persona || this.tl.seed, b.params);
        const K2 = { ...KIT, X0: -PAD, XW: VW, drawPlace: (c, l, h, tt) => this.panoV(c, l, h, tt), grade: (c, h) => this.gradeV(c, h) };
        p.fillStyle = '#1c1a2b'; p.fillRect(0, 0, W, H);
        try { vfn(p, { t: local, dur, d: dur, prog: clamp(local / dur), params: b.params, who, frame }, K2); if (b.params.efecto) drawEffect(p, b.params.efecto, local); }
        catch (e) { console.error('AVISO escena con error: ' + e.message); }
        return 'medida';
      }
      if (this.isOpaque(b)) { // escena con fondo propio (papel, mapa, espacio...): su fondo se extiende a todo el ancho
        BG_CONTEXT.none = false; this.subjectOnly = false;
        this.drawBeat(p, b, t, frame);
        const L = p.getImageData(PAD - 500, 960, 1, 1).data, C = p.getImageData(PAD + 6, 960, 1, 1).data;
        if (L[0] + L[1] + L[2] < 8 && C[0] + C[1] + C[2] > 8) { // los lados se quedaron negros: se continúa el borde de la escena
          p.save(); p.setTransform(1, 0, 0, 1, 0, 0);
          p.drawImage(this.pc, PAD + 3, 0, 4, H, 0, 0, PAD + 3, H);
          p.drawImage(this.pc, PAD + W - 7, 0, 4, H, PAD + W - 3, 0, PAD + 3, H);
          p.restore();
        }
        return 'opaca';
      }
      this.panoV(p, this.placeOf(b), this.horaOf(b), local);
      BG_CONTEXT.none = true; this.subjectOnly = true;
      try { this.drawBeat(p, b, t, frame); } finally { BG_CONTEXT.none = false; this.subjectOnly = false; }
      this.gradeV(p, this.horaOf(b));
      return 'normal';
    } finally { this.noCam = false; }
  }
  // Encuadre de cada plano: la franja vertical donde está todo lo que se dibuja (se mira en varios momentos del plano)
  cropOf(b) {
    if (this.crops.has(b)) return this.crops.get(b);
    let cr = { cy: 430, ch: 1300 };
    if (b.scene_name === 'medida' && medidaFn(b.params)) cr = MEDIDA_CROP;
    else if (b.scene_name === 'medida' && medidaWide(b.params)) cr = MEDIDA_CROP;
    else if (this.isOpaque(b)) cr = { cy: 300, ch: 1440 };
    else {
      let y0 = H, y1 = 0;
      const p = this.pctx;
      for (const f of [0.15, 0.45, 0.75, 0.97]) {
        const t = b.start + f * (b.end - b.start);
        p.setTransform(1, 0, 0, 1, 0, 0); p.clearRect(0, 0, VW, H); p.setTransform(1, 0, 0, 1, PAD, 0);
        BG_CONTEXT.none = true; this.subjectOnly = true; this.noCam = true;
        try { this.drawBeat(p, b, t, Math.round(t * this.fps)); } finally { BG_CONTEXT.none = false; this.subjectOnly = false; this.noCam = false; }
        const x0 = PAD - 700, d = p.getImageData(x0, 0, W + 1400, H).data, rw = W + 1400;
        for (let y = 0; y < H; y += 6) { const o = y * rw * 4; for (let x = 0; x < rw; x += 6) if (d[o + x * 4 + 3] > 24) { if (y < y0) y0 = y; if (y > y1) y1 = y; break; } }
      }
      if (y1 > y0) {
        let cy = clamp(Math.min(430, y0 - 90), 0, 430);
        let ch = Math.max(1300, Math.min(H, y1 + 60) - cy);
        if (cy + ch > H) ch = H - cy;
        if (ch < 1300) { cy = H - 1300; ch = 1300; }
        cr = { cy, ch };
      }
    }
    this.crops.set(b, cr);
    return cr;
  }
  gradeWide(ctx, hora) {
    if (hora !== 'noche' && hora !== 'atardecer') return;
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = hora === 'noche' ? 'rgb(135,145,205)' : 'rgb(255,214,180)'; ctx.fillRect(0, 0, WW, WH); ctx.restore();
  }
  // Un plano completo en ancho (fondo + sujeto + cámara), en el lienzo ctx
  drawWideBeat(ctx, b, t, frame) {
    const local = t - b.start, dur = Math.max(0.5, b.end - b.start);
    const wideFn = b.scene_name === 'medida' ? medidaWide(b.params) : null;
    if (wideFn) { // escena a medida dibujada directamente en horizontal
      const who = personaWho(this.tl.persona || this.tl.seed, b.params);
      ctx.save(); try { wideFn(ctx, { t: local, d: dur, params: b.params, who, WW, WH }, KIT); } catch (e) { console.error('AVISO escena con error: ' + e.message); } ctx.restore(); STYLE.k = 1; STYLE.ink = INK_BASE;
      return;
    }
    const cr = this.cropOf(b);
    this.paint(b, t, frame);
    const sc = WH / cr.ch, vw = WW / sc;
    // cámara suave sobre el fotograma entero
    const prog = clamp(local / dur);
    const cam = (CAMERAS[b.camera] || CAMERAS.push_in)(flowK(prog), t);
    const s = 1 + (cam.s - 1) * 0.3, dx = cam.x * sc * 0.5 + (noise1(t * 0.6, 11) - 0.5) * 10, dy = cam.y * sc * 0.25 + (noise1(t * 0.6, 12) - 0.5) * 8;
    const M = 90; // margen extra para que la cámara nunca enseñe el borde
    ctx.fillStyle = '#1c1a2b'; ctx.fillRect(0, 0, WW, WH);
    ctx.save(); ctx.translate(WW / 2 + dx, WH / 2 + dy); ctx.rotate((noise1(t * 0.4, 13) - 0.5) * 0.006); ctx.scale(s, s); ctx.translate(-WW / 2, -WH / 2);
    const sx = PAD + W / 2 - vw / 2 - M / sc, sy = Math.max(0, cr.cy - M / sc), sy1 = Math.min(H, cr.cy + cr.ch + M / sc);
    ctx.drawImage(this.pc, sx, sy, vw + 2 * M / sc, sy1 - sy, -M, (sy - cr.cy) * sc, WW + 2 * M, (sy1 - sy) * sc);
    ctx.restore();
  }
  renderFrame(frame) {
    const t = frame / this.fps, ctx = this.ctx;
    const i = this.beatIndexAt(t), b = this.beats[i], prev = this.beats[i - 1];
    const inTrans = prev && b.transition !== 'cut' && t < b.start + TRANSITION;
    if (inTrans) { // transición en ancho: el plano nuevo entra con zoom suave sobre el anterior
      const k = ease.inOut(seg(t, b.start, TRANSITION));
      const A = this.wa.getContext('2d'), B = this.wb.getContext('2d');
      A.setTransform(1, 0, 0, 1, 0, 0); B.setTransform(1, 0, 0, 1, 0, 0);
      this.drawWideBeat(A, prev, t, frame); this.drawWideBeat(B, b, t, frame);
      ctx.drawImage(this.wa, 0, 0);
      const z = 1 + (1 - k) * 0.08; ctx.save(); ctx.globalAlpha = k; ctx.translate(WW / 2, WH / 2); ctx.scale(z, z); ctx.drawImage(this.wb, -WW / 2, -WH / 2); ctx.restore();
      if (b.transition === 'flash') { ctx.fillStyle = `rgba(255,255,255,${Math.sin(k * Math.PI) * 0.8})`; ctx.fillRect(0, 0, WW, WH); }
      if (b.transition === 'black') { ctx.fillStyle = `rgba(0,0,0,${Math.sin(k * Math.PI)})`; ctx.fillRect(0, 0, WW, WH); }
    } else {
      ctx.setTransform(1, 0, 0, 1, 0, 0); this.drawWideBeat(ctx, b, t, frame);
    }
    // acabado: viñeta suave y degradado bajo los subtítulos
    const vg = ctx.createRadialGradient(WW / 2, WH / 2, WH * 0.45, WW / 2, WH / 2, WW * 0.62); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.28)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, WW, WH);
    const sh = ctx.createLinearGradient(0, WH - 280, 0, WH); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,0.5)'); ctx.fillStyle = sh; ctx.fillRect(0, WH - 280, WW, 280);
    ctx.save(); ctx.translate((WW - W) / 2, WH - 300 - 168); drawSubtitles(ctx, this.pages, t); ctx.restore();
    ctx.save(); ctx.translate((WW - W) / 2, -380);
    if (this.tl.hook?.text && t < (this.tl.hook.dur || 2.3)) this.drawHook(ctx, t, this.tl.hook);
    const cm = this.tl.comment; if (cm?.text && t >= cm.start && t < cm.end) this.drawComment(ctx, t - cm.start, cm.end - cm.start, cm.text);
    ctx.restore();
    if (this.tl.chapters) this.drawChapter(ctx, t);
  }
  // Rótulo de capítulo (vídeos largos): aparece arriba a la izquierda al empezar cada capítulo
  drawChapter(ctx, t) {
    const ch = (this.tl.chapters || []).filter((c) => t >= c.start).at(-1);
    if (!ch || t - ch.start > 3.5) return;
    const k = ease.outBack(clamp((t - ch.start) / 0.4)), out = clamp((ch.start + 3.5 - t) / 0.4);
    ctx.save(); ctx.globalAlpha = out; ctx.translate(80, 90); ctx.scale(k, k); ctx.font = '700 44px Poppins';
    const w = ctx.measureText(ch.title).width + 80; ctx.beginPath(); ctx.roundRect(0, -45, w, 90, 45); ctx.fillStyle = '#ffd166'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#1c1a2b'; ctx.stroke();
    ctx.fillStyle = '#1c1a2b'; ctx.textBaseline = 'middle'; ctx.fillText(ch.title, 40, 2); ctx.restore();
  }
}

async function renderVideo(tl, out, opts) {
  const r = tl.formato === 'horizontal' ? new WideRenderer(tl) : new Renderer(tl);
  const OW = r.canvas.width, OH = r.canvas.height;
  const fps = r.fps;
  const frames = Math.ceil(r.total * fps);
  const args = ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${OW}x${OH}`, '-r', String(fps), '-i', '-'];
  if (opts.audio) args.push('-i', opts.audio);
  args.push('-c:v', 'libx264', '-preset', opts.preset || 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart');
  if (opts.audio) args.push('-af', 'apad', '-c:a', 'aac', '-b:a', '192k');
  args.push('-t', (frames / fps).toFixed(3));
  args.push(out);
  const ff = spawn('ffmpeg', args, { stdio: ['pipe', 'inherit', 'inherit'] });
  ff.stdin.on('error', (e) => { if (e.code !== 'EPIPE') throw e; });
  const done = new Promise((res, rej) => ff.on('close', (c) => (c === 0 ? res() : rej(new Error('ffmpeg salió con código ' + c)))));
  const t0 = Date.now();
  for (let f = 0; f < frames; f++) {
    r.renderFrame(f);
    const buf = r.canvas.data();
    if (!ff.stdin.write(buf)) await new Promise((res) => ff.stdin.once('drain', res));
    if (f % (fps * 10) === 0) process.stdout.write(`  fotograma ${f}/${frames} (${((Date.now() - t0) / 1000).toFixed(0)}s)\n`);
  }
  ff.stdin.end();
  await done;
  console.log(`Vídeo listo: ${out} (${frames} fotogramas en ${((Date.now() - t0) / 1000).toFixed(0)}s)`);
}

// Hoja de previsualización: N fotogramas repartidos en una cuadrícula.
async function renderStills(tl, out, n) {
  const r = tl.formato === 'horizontal' ? new WideRenderer(tl) : new Renderer(tl);
  const cols = Math.min(4, n), rows = Math.ceil(n / cols);
  const sw = tl.formato === 'horizontal' ? 640 : 360, sh = tl.formato === 'horizontal' ? 360 : 640;
  const sheet = createCanvas(cols * sw, rows * sh);
  const sctx = sheet.getContext('2d');
  for (let i = 0; i < n; i++) {
    const t = tl.stills_at ? tl.stills_at[i] : (r.total * (i + 0.5)) / n;
    r.renderFrame(Math.floor(t * r.fps));
    sctx.drawImage(r.canvas, (i % cols) * sw, Math.floor(i / cols) * sh, sw, sh);
  }
  fs.writeFileSync(out, sheet.encodeSync('png'));
  console.log('Previsualización:', out);
}

// Miniatura de vídeo largo (1280×720): fotograma con más fuerza del vídeo + texto enorme con borde, estilo YouTube.
export function renderCoverWide(tl, out) {
  const r = new WideRenderer(tl);
  const cands = r.beats.map((b, i) => ({ b, i })).filter(({ b }) => ['accion', 'medida', 'composicion'].includes(b.scene_name));
  const pick = tl.cover?.beat ?? (cands[Math.floor(cands.length * 0.35)] || { i: Math.floor(r.beats.length / 3) }).i;
  const b = r.beats[pick];
  r.tl.hook = null; r.tl.comment = null; r.tl.chapters = null; r.pages = [];
  r.renderFrame(Math.floor((b.start + (b.end - b.start) * 0.65) * r.fps));
  const c = createCanvas(1280, 720), ctx = c.getContext('2d');
  ctx.drawImage(r.canvas, 0, 0, 1280, 720);
  const g = ctx.createLinearGradient(0, 0, 760, 0); g.addColorStop(0, 'rgba(0,0,0,0.75)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 760, 720);
  const words = String(tl.cover?.text || '').toUpperCase().split(/\s+/).filter(Boolean);
  const lines = []; ctx.font = '120px Anton'; let cur = '';
  for (const w of words) { const t2 = cur ? cur + ' ' + w : w; if (ctx.measureText(t2).width > 620 && cur) { lines.push(cur); cur = w; } else cur = t2; }
  if (cur) lines.push(cur);
  let size = lines.length > 3 ? 100 : 130; ctx.font = `${size}px Anton`;
  let y = 360 - (lines.length - 1) * size * 0.55;
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  lines.forEach((l, i) => { ctx.lineWidth = size * 0.16; ctx.strokeStyle = '#000'; ctx.strokeText(l, 50, y); ctx.fillStyle = i % 2 ? '#ffd166' : '#ffffff'; ctx.fillText(l, 50, y); y += size * 1.05; });
  fs.writeFileSync(out, c.encodeSync('jpeg', 90));
  console.log('Portada ancha:', out, `(plano ${pick + 1})`);
}

// Portada (miniatura) del vídeo: la escena más representativa + el texto de portada en grande.
export function renderCover(tl, out) {
  if (tl.formato === 'horizontal') return renderCoverWide(tl, out);
  const r = new Renderer(tl);
  const avoid = new Set(['big_text', 'character', 'calendar', 'clock']);
  const cands = r.beats.map((b, i) => ({ b, i })).filter(({ b }) => !avoid.has(b.scene_name));
  const pickIdx = tl.cover?.beat ?? (cands.find(({ b }) => b.camera === 'slam') || cands[Math.floor(cands.length * 0.4)] || { i: Math.floor(r.beats.length / 2) }).i;
  const b = r.beats[pickIdx];
  const ctx = r.ctx;
  const faces = new Set(['person', 'group', 'doctor', 'hospital', 'surgery', 'escena', 'composicion', 'accion', 'medida']);
  const textLow = faces.has(b.scene_name);
  r.drawBeat(ctx, { ...b, camera: 'static', params: { ...b.params, label: '' } }, b.start + Math.min(1.2, (b.end - b.start) * 0.6), 0);
  // Oscurecer arriba para que el texto se lea
  let g;
  if (textLow) { // texto abajo para no tapar la cara
    g = ctx.createLinearGradient(0, H * 0.45, 0, H);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.35, 'rgba(0,0,0,0.6)'); g.addColorStop(1, 'rgba(0,0,0,0.92)');
    ctx.fillStyle = g; ctx.fillRect(0, H * 0.45, W, H * 0.55);
  } else {
    g = ctx.createLinearGradient(0, 0, 0, H * 0.62);
    g.addColorStop(0, 'rgba(0,0,0,0.88)'); g.addColorStop(0.7, 'rgba(0,0,0,0.45)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H * 0.62);
  }
  g = ctx.createLinearGradient(0, H * 0.82, 0, H);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.7)');
  ctx.fillStyle = g; ctx.fillRect(0, H * 0.82, W, H * 0.18);
  // Texto grande, ajustado a 4 líneas como mucho
  const text = String(tl.cover?.text || '').toUpperCase().trim();
  const words = text.split(/\s+/).filter(Boolean);
  const font = GlobalFonts.has?.('Anton') === false ? 'Poppins' : 'Anton';
  let size = 230, lines = [];
  for (; size >= 90; size -= 10) {
    ctx.font = `${font === 'Poppins' ? '800 ' : ''}${size}px ${font}`;
    lines = []; let cur = '';
    for (const w of words) {
      const t = cur ? cur + ' ' + w : w;
      if (ctx.measureText(t).width > W - 120 && cur) { lines.push(cur); cur = w; } else cur = t;
    }
    if (cur) lines.push(cur);
    if (lines.length <= 4 && lines.every((l) => ctx.measureText(l).width <= W - 120)) break;
  }
  const lh = size * 1.08;
  let y = textLow ? H - 250 - lines.length * lh + size * 0.85 : 250 + size * 0.85;
  const hot = (w) => /[0-9?¿!¡]/.test(w);
  ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
  for (const line of lines) {
    const ws = line.split(' ');
    let x = (W - ctx.measureText(line).width) / 2;
    for (const w of ws) {
      ctx.lineWidth = size * 0.12; ctx.strokeStyle = '#000'; ctx.strokeText(w, x, y);
      ctx.fillStyle = hot(w) ? '#ffb35c' : '#ffffff'; ctx.fillText(w, x, y);
      x += ctx.measureText(w + ' ').width;
    }
    y += lh;
  }
  // Sello del canal
  const label = String(tl.cover?.channel || '').toUpperCase();
  if (label) {
    ctx.font = '700 46px Poppins';
    const w = ctx.measureText(label).width + 60;
    ctx.fillStyle = '#ffb35c'; rrPath(ctx, (W - w) / 2, H - 190, w, 84, 42); ctx.fill();
    ctx.fillStyle = '#1a1206'; ctx.fillText(label, (W - w) / 2 + 30, H - 133);
  }
  fs.writeFileSync(out, r.canvas.encodeSync(out.endsWith('.png') ? 'png' : 'jpeg', 90));
  console.log('Portada:', out, `(plano ${pickIdx + 1}: ${b.scene_name})`);
}
function rrPath(ctx, x, y, w, h, rad) {
  ctx.beginPath(); ctx.moveTo(x + rad, y); ctx.arcTo(x + w, y, x + w, y + h, rad); ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad); ctx.arcTo(x, y, x + w, y, rad); ctx.closePath();
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const a = parseArgs(process.argv.slice(2));
  const [tlPath, out] = a._;
  if (!tlPath || !out) { console.error('Uso: node render.mjs timeline.json salida.mp4 [--audio a.m4a] | salida.png --stills N'); process.exit(1); }
  const tl = JSON.parse(fs.readFileSync(tlPath, 'utf8'));
  if (a.fps) tl.fps = Number(a.fps);
  await preloadMedida(tl); // escenas a medida dibujadas por Claude para este vídeo
  if (a.cover) renderCover(tl, out);
  else if (a.stills) await renderStills(tl, out, Number(a.stills));
  else await renderVideo(tl, out, { audio: a.audio, preset: a.preset });
}
