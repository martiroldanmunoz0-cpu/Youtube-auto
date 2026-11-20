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

const here = path.dirname(fileURLToPath(import.meta.url));
const fontDir = path.join(here, '..', 'assets', 'fonts');
for (const f of fs.readdirSync(fontDir).filter((f) => f.endsWith('.ttf'))) GlobalFonts.registerFromPath(path.join(fontDir, f), 'Poppins');
const antonPath = path.join(here, '..', 'assets', 'branding', 'fonts', 'Anton-Regular.ttf');
if (fs.existsSync(antonPath)) GlobalFonts.registerFromPath(antonPath, 'Anton');

const TRANSITION = 0.35;

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
const CAMERAS = {
  push_in: (k) => ({ s: lerp(1.02, 1.14, k), x: 0, y: 0 }),
  pull_out: (k) => ({ s: lerp(1.16, 1.03, k), x: 0, y: 0 }),
  pan_left: (k) => ({ s: 1.14, x: lerp(60, -60, k), y: 0 }),
  pan_right: (k) => ({ s: 1.14, x: lerp(-60, 60, k), y: 0 }),
  tilt_up: (k) => ({ s: 1.14, x: 0, y: lerp(-90, 90, k) }),
  tilt_down: (k) => ({ s: 1.14, x: 0, y: lerp(90, -90, k) }),
  static: (k) => ({ s: lerp(1.03, 1.06, k), x: 0, y: 0 }),
  shake: (k, t) => ({ s: 1.1, x: (noise1(t * 14, 1) - 0.5) * 22, y: (noise1(t * 14, 2) - 0.5) * 22 }),
  slam: (k, t) => ({ s: lerp(1.45, 1.08, ease.out(clamp(k * 4))), x: (noise1(t * 20, 3) - 0.5) * 12 * (1 - clamp(k * 3)), y: 0 }),
};

export class Renderer {
  constructor(timeline) {
    this.tl = timeline;
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
    const local = t - b.start;
    const dur = Math.max(0.5, b.end - b.start);
    const prog = clamp(local / dur);
    const cam = (CAMERAS[b.camera] || CAMERAS.push_in)(ease.inOut(prog), t);
    ctx.save();
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    ctx.translate(W / 2 + cam.x, H / 2 + cam.y);
    ctx.scale(cam.s, cam.s);
    ctx.translate(-W / 2, -H / 2);
    try {
      b.scene.draw(ctx, b.state, { t: local, dur, prog, params: b.params, frame, global: t, seed: this.tl.persona || this.tl.seed, cast: this.tl.cast || {}, speaker: b.speaker, voice_dur: b.voice_dur });
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
      ctx.globalAlpha = 1; ctx.drawImage(this.layerA, 0, 0);
      if (b.transition === 'black') {
        ctx.fillStyle = `rgba(0,0,0,${Math.sin(k * Math.PI)})`; ctx.fillRect(0, 0, W, H);
        if (k > 0.5) { ctx.globalAlpha = (k - 0.5) * 2; ctx.drawImage(this.layerB, 0, 0); ctx.globalAlpha = 1; }
      } else {
        ctx.globalAlpha = k; ctx.drawImage(this.layerB, 0, 0); ctx.globalAlpha = 1;
      }
      if (b.transition === 'flash') { ctx.fillStyle = `rgba(255,255,255,${Math.sin(k * Math.PI) * 0.8})`; ctx.fillRect(0, 0, W, H); }
      if (b.transition === 'red') { ctx.fillStyle = `rgba(200,20,30,${Math.sin(k * Math.PI) * 0.6})`; ctx.fillRect(0, 0, W, H); }
    } else {
      this.drawBeat(ctx, b, t, frame);
    }
    // Acabado común del canal
    if (this.tl.subtitle_style !== 'word') topShade(ctx);
    vignette(ctx, 0.7);
    grain(ctx, frame, 0.05);
    if (this.tl.subtitle_style === 'word') drawWordSubtitles(ctx, this.tl.words || [], t, this.tl.cast || {});
    else drawSubtitles(ctx, this.pages, t);
    if (t >= endStart) this.drawEndcard(ctx, t - endStart, end);
    // Fundido de entrada
    if (t < 0.25) { ctx.fillStyle = `rgba(0,0,0,${1 - t / 0.25})`; ctx.fillRect(0, 0, W, H); }
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
  r.drawBeat(ctx, { ...b, camera: 'static' }, b.start + Math.min(1.2, (b.end - b.start) * 0.6), 0);
  // Oscurecer arriba para que el texto se lea
  let g = ctx.createLinearGradient(0, 0, 0, H * 0.62);
  g.addColorStop(0, 'rgba(0,0,0,0.88)'); g.addColorStop(0.7, 'rgba(0,0,0,0.45)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H * 0.62);
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
  let y = 250 + size * 0.85;
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
