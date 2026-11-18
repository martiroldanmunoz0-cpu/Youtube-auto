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
import { paginate, drawSubtitles } from './lib/subtitles.mjs';
import { SCENES } from './scenes/index.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const fontDir = path.join(here, '..', 'assets', 'fonts');
for (const f of fs.readdirSync(fontDir).filter((f) => f.endsWith('.ttf'))) GlobalFonts.registerFromPath(path.join(fontDir, f), 'Poppins');

const TRANSITION = 0.35;

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
      const params = b.params || {};
      if (!SCENES[b.scene] && !params.text) params.text = '';
      const r = rng(`${timeline.seed || 'x'}-${i}-${b.scene}`);
      return { ...b, params, scene, state: scene.setup(params, r) };
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
    b.scene.draw(ctx, b.state, { t: local, dur, prog, params: b.params, frame, global: t });
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
    topShade(ctx);
    vignette(ctx, 0.7);
    grain(ctx, frame, 0.05);
    drawSubtitles(ctx, this.pages, t);
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

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const a = parseArgs(process.argv.slice(2));
  const [tlPath, out] = a._;
  if (!tlPath || !out) { console.error('Uso: node render.mjs timeline.json salida.mp4 [--audio a.m4a] | salida.png --stills N'); process.exit(1); }
  const tl = JSON.parse(fs.readFileSync(tlPath, 'utf8'));
  if (a.fps) tl.fps = Number(a.fps);
  if (a.stills) await renderStills(tl, out, Number(a.stills));
  else await renderVideo(tl, out, { audio: a.audio, preset: a.preset });
}
