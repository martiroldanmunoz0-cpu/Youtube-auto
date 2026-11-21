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
import { setLooks } from './lib/persona.mjs';
import { drawEffect } from './lib/impact.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const fontDir = path.join(here, '..', 'assets', 'fonts');
for (const f of fs.readdirSync(fontDir).filter((f) => f.endsWith('.ttf'))) GlobalFonts.registerFromPath(path.join(fontDir, f), 'Poppins');
const antonPath = path.join(here, '..', 'assets', 'branding', 'fonts', 'Anton-Regular.ttf');
if (fs.existsSync(antonPath)) GlobalFonts.registerFromPath(antonPath, 'Anton');

const TRANSITION = 0.32;
const SETTLE = 0.3; // tras un corte, el plano entra con un pequeño empujón que se asienta
// Escenas de estilo oscuro (misterio, noche, espacio): llevan el acabado oscuro del canal
const DARK_SCENES = new Set(['eyes_dark', 'silhouette', 'hallway', 'front_door', 'bedroom', 'house_exterior', 'car_window', 'rearview_eyes', 'city_street', 'forest', 'space', 'ocean', 'character', 'duo', 'closeup', 'vice_street', 'vice_beach', 'car_ride', 'police_chase']);

// Blindaje: la IA a veces pasa números (p. ej. día 1) donde el lienzo espera texto. Se convierten siempre.
{
  const proto = Object.getPrototypeOf(createCanvas(1, 1).getContext('2d'));
  for (const fn of ['fillText', 'strokeText', 'measureText']) {
    const orig = proto[fn];
    proto[fn] = function (text, ...rest) { return orig.call(this, String(text ?? ''), ...rest); };
  }
}
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
    this.fps = timeline.fps || 30;
    this.canvas = createCanvas(W, H);
    this.ctx = this.canvas.getContext('2d');
    this.layerA = createCanvas(W, H);
    this.layerB = createCanvas(W, H);
    this.beats = timeline.beats.map((b, i) => {
      const scene = SCENES[b.scene] || SCENES.big_text;
      if (!SCENES[b.scene]) console.warn(`Escena desconocida "${b.scene}", uso big_text`);
      const params = sanitize(b.params || {});
      if (!SCENES[b.scene] && !params.text) params.text = '';
      const r = rng(`${timeline.seed || 'x'}-${i}-${b.scene}`);
      return { ...b, params, scene, scene_name: SCENES[b.scene] ? b.scene : 'big_text', state: scene.setup(params, r) };
    });
    const words = timeline.words || [];
    this.pages = words.length ? paginate(this.ctx, words) : [];
    this.total = timeline.total || this.beats.at(-1).end;
  }

  beatIndexAt(t) {
    for (let i = this.beats.length - 1; i >= 0; i--) if (t >= this.beats[i].start) return i;
    return 0;
  }

  drawBeat(ctx, b, t, frame) {
    const local = b.bucle ? 0.02 : t - b.start; // el plano del bucle queda quieto en el primer instante del plano 1
    const dur = Math.max(0.5, b.end - b.start);
    const prog = clamp(local / dur);
    const cam = (CAMERAS[b.camera] || CAMERAS.push_in)(flowK(prog), t);
    // Respiración continua: deriva suave y un pelín de giro, para que nada esté nunca congelado
    const drift = b.bucle ? 0 : 1;
    const dx = (noise1(t * 0.6, 11) - 0.5) * 18 * drift, dy = (noise1(t * 0.6, 12) - 0.5) * 18 * drift;
    const rot = (noise1(t * 0.4, 13) - 0.5) * 0.012 * drift;
    // Entrada con energía tras un corte: arranca algo más cerca y se asienta
    const settle = b.bucle || b.camera === 'slam' ? 0 : 0.07 * (1 - ease.out(clamp(local / SETTLE)));
    ctx.save();
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    ctx.translate(W / 2 + cam.x + dx, H / 2 + cam.y + dy);
    ctx.rotate(rot + (cam.r || 0));
    ctx.scale(cam.s + settle, cam.s + settle);
    ctx.translate(-W / 2, -H / 2);
    try {
      b.scene.draw(ctx, b.state, { t: local, dur, prog, params: b.params, frame, global: t, seed: this.tl.persona || this.tl.seed, cast: this.tl.cast || {}, speaker: b.speaker, voice_dur: b.voice_dur });
      if (b.params.efecto) drawEffect(ctx, b.params.efecto, local); // ¡PUM!, ¡ZAS!, velocidad, brillo...
    } catch (e) {
      // Una escena rota no debe tumbar el vídeo entero: fondo neutro y aviso (el revisor lo verá)
      if (!sceneErrors.has(b.scene)) { sceneErrors.add(b.scene); console.error(`AVISO escena con error (${b.start}s): ${e.message}`); }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = '#0b1020'; ctx.fillRect(0, 0, W, H);
    }
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
    if (this.tl.subtitle_style !== 'word') topShade(ctx, bright ? 0.32 : 0.55);
    vignette(ctx, bright ? 0.22 : 0.7);
    grain(ctx, frame, bright ? 0.015 : 0.05);
    if (this.tl.subtitle_style === 'word') drawWordSubtitles(ctx, this.tl.words || [], t, this.tl.cast || {});
    else drawSubtitles(ctx, this.pages, t);
    if (t >= endStart) this.drawEndcard(ctx, t - endStart, end);
    // Gancho a pantalla grande en los primeros segundos (sin fundido desde negro: el fotograma 0 ya engancha)
    if (this.tl.hook?.text && t < (this.tl.hook.dur || 2.3)) this.drawHook(ctx, t, this.tl.hook);
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
    ctx.fillStyle = g; ctx.fillRect(0, 560, W, 800);
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
    ctx.fillText(end.title || 'Sígueme', W / 2, H / 2 - 40 + (1 - k) * 30);
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

async function renderVideo(tl, out, opts) {
  const r = new Renderer(tl);
  const fps = r.fps;
  const frames = Math.ceil(r.total * fps);
  const args = ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(fps), '-i', '-'];
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
  const r = new Renderer(tl);
  const cols = Math.min(4, n), rows = Math.ceil(n / cols);
  const sw = 360, sh = 640;
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

// Portada (miniatura) del vídeo: la escena más representativa + el texto de portada en grande.
export function renderCover(tl, out) {
  const r = new Renderer(tl);
  const avoid = new Set(['big_text', 'character', 'calendar', 'clock']);
  const cands = r.beats.map((b, i) => ({ b, i })).filter(({ b }) => !avoid.has(b.scene_name));
  const pickIdx = tl.cover?.beat ?? (cands.find(({ b }) => b.camera === 'slam') || cands[Math.floor(cands.length * 0.4)] || { i: Math.floor(r.beats.length / 2) }).i;
  const b = r.beats[pickIdx];
  const ctx = r.ctx;
  const faces = new Set(['person', 'group', 'doctor', 'hospital', 'surgery', 'escena', 'composicion', 'accion']);
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
  if (a.cover) renderCover(tl, out);
  else if (a.stills) await renderStills(tl, out, Number(a.stills));
  else await renderVideo(tl, out, { audio: a.audio, preset: a.preset });
}
