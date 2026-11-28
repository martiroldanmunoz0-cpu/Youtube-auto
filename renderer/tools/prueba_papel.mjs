// Prueba del estilo «papel» (pedido-35: cuchara de estrella de neutrones), 15 s vertical.
//   node tools/prueba_papel.mjs hoja <salida.png>      fotogramas clave en una hoja
//   node tools/prueba_papel.mjs video <salida.mp4>     vídeo de prueba (sin voz)
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { W, H, lerp, ease, ph, laboratorio, personaje, REPARTO, mesaLab, cuchara, rotulo, capa, SUELO } from '../lib/papel.mjs';
const R = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const f of fs.readdirSync(path.join(R, '..', 'assets', 'fonts')).filter((f) => f.endsWith('.ttf'))) GlobalFonts.registerFromPath(path.join(R, '..', 'assets', 'fonts', f), 'Poppins');
GlobalFonts.registerFromPath(path.join(R, '..', 'assets', 'branding', 'fonts', 'Anton-Regular.ttf'), 'Anton');
const { DRA, TOM } = REPARTO;
const DUR = 15;

function plano(ctx, T) {
  // A: presentación (0–3.5)
  if (T < 3.5) { const t = T; const k = ease(t / 3.5);
    const cam = { z: lerp(1, 1.08, k), fx: 560, fy: 1300, t };
    laboratorio(ctx, t, cam);
    capa(ctx, cam, 1, () => {
      mesaLab(ctx, 540, 1250, 520);
      personaje(ctx, t, TOM, 830, SUELO + 40, 0.95, { mood: 'neutral', mira: [-0.8, 0.1], manoI: [-90, -150], manoD: [110, -110] });
      const sub = ease(ph(t, 0.2, 1));
      const p = personaje(ctx, t, DRA, 290, SUELO + 60, 1.05, { habla: t > 0.3, mira: [0.6, -0.2], manoI: [-120, -110], manoD: [lerp(110, 150, sub), lerp(-120, -330, sub)] });
      cuchara(ctx, t, p.manoD[0] + 10, p.manoD[1] - 40, 0.42, 0.25);
    });
    rotulo(ctx, 0.1, t, 'THIS SPOON', 540, 260, 150); rotulo(ctx, 1.4, t, 'OUTWEIGHS', 540, 420, 110, '#ffd93d'); rotulo(ctx, 1.9, t, 'EVERY HUMAN', 540, 550, 120, '#8fe3ff');
    return; }
  // B: la deja en la mesa y la mesa se dobla (3.5–7)
  if (T < 7) { const t = T - 3.5; const baja = ease(ph(t, 0.2, 1.1)), dobla = ease(ph(t, 1.1, 1.8)) * 110;
    const cam = { z: 1.1, fx: 620, fy: 1300, t: T, temblor: ph(t, 1.1, 1.3) > 0 && t < 2.2 ? 6 : 0 };
    laboratorio(ctx, T, cam);
    capa(ctx, cam, 1, () => {
      mesaLab(ctx, 600, 1250, 560, dobla);
      const susto = t > 1.3;
      personaje(ctx, T, TOM, 880, SUELO + 40, 0.95, { mood: susto ? 'miedo' : 'neutral', mira: [-1, 0.6], manoI: susto ? [-60, -380] : [-90, -150], manoD: susto ? [60, -380] : [110, -110], salto: susto ? Math.max(0, Math.sin(ph(t, 1.3, 1.7) * Math.PI)) * 40 : 0 });
      const sx = lerp(560, 600, baja), sy = lerp(1040, 1225 + dobla, baja);
      const p = personaje(ctx, T, DRA, 330, SUELO + 60, 1.05, { mood: susto ? 'sorpresa' : 'neutral', mira: [1, 0.8], incl: susto ? -0.05 : 0.04, manoI: [-120, -110], manoD: t < 1.4 ? [lerp(190, 250, baja), lerp(-380, -230, baja)] : [150, -300] });
      cuchara(ctx, T, sx, sy, 0.42, Math.PI / 2 - 0.15);
      if (t > 1.15) rotulo(ctx, 1.15, t, 'CREEEAK!', 720, 980, 90, '#ffb347');
    });
    rotulo(ctx, 0.2, t, '1 TEASPOON =', 540, 270, 120); rotulo(ctx, 0.8, t, '1 BILLION TONS', 540, 420, 120, '#8fe3ff');
    return; }
  // C: tira con las dos manos, no se mueve (7–11)
  if (T < 11) { const t = T - 7; const tira = Math.sin(t * 22) * 5;
    const cam = { z: lerp(1.18, 1.28, ease(t / 4)), fx: 600, fy: 1300, t: T, temblor: 2 };
    laboratorio(ctx, T, cam);
    capa(ctx, cam, 1, () => {
      mesaLab(ctx, 640, 1250, 560, 110);
      cuchara(ctx, T, 640, 1335, 0.42, Math.PI / 2 - 0.15);
      // asa hacia la izquierda: la agarra
      personaje(ctx, T, DRA, 330 + tira, SUELO + 60, 1.05, { mood: 'esfuerzo', mira: [1, 0.5], incl: -0.16, cabeza: -0.08, manoI: [170, -120], manoD: [200, -140] });
      personaje(ctx, T, TOM, 870, SUELO + 40, 0.95, { mood: 'sorpresa', habla: t > 2, mira: [-1, 0.3], manoI: [-140, -260], manoD: [100, -110] });
    });
    rotulo(ctx, 0.1, t, 'NOT ONE', 540, 270, 150); rotulo(ctx, 0.6, t, 'INCH', 540, 440, 190, '#ff6b3d');
    return; }
  // D: la suelta, atraviesa mesa y suelo (11–15)
  const t = T - 11; const cae = ease(ph(t, 0.4, 1.6));
  const cam = { z: lerp(1.08, 1, ease(t / 4)), fx: 620, fy: 1350, t: T, temblor: ph(t, 1.0, 1.2) > 0 && t < 1.8 ? 7 : 0 };
  laboratorio(ctx, T, cam);
  capa(ctx, cam, 1, () => {
    // agujero en el suelo
    const hk = ease(ph(t, 1.0, 1.3));
    if (hk > 0) { ctx.fillStyle = '#1b120d'; ctx.beginPath(); ctx.ellipse(620, SUELO + 40, 110 * hk, 32 * hk, 0, 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(40,30,28,0.85)'; ctx.lineWidth = 5; ctx.stroke();
      ctx.fillStyle = '#9fe6ff'; ctx.globalAlpha = 0.35 + 0.2 * Math.sin(T * 9); ctx.beginPath(); ctx.ellipse(620, SUELO + 46, 70 * hk, 16 * hk, 0, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
    mesaLab(ctx, 640, 1250, 560, t < 0.9 ? 110 : 0);
    if (t > 0.9 && t < 1.6) { for (let i = 0; i < 8; i++) { const a = i * 0.8, r = 60 + (t - 0.9) * 500; ctx.fillStyle = ['#3d4250', '#b9a58a'][i % 2]; ctx.fillRect(620 + Math.cos(a) * r, 1300 + Math.sin(a) * r * 0.6 - (t - 0.9) * 200, 22, 14); } }
    if (cae < 1) { ctx.save(); ctx.beginPath(); ctx.rect(-400, -400, W + 800, SUELO + 440); ctx.clip(); cuchara(ctx, T, 625, lerp(1335, SUELO + 260, cae), 0.42, Math.PI); ctx.restore(); }
    const mira = t > 1;
    personaje(ctx, T, DRA, 330, SUELO + 60, 1.05, { mood: mira ? 'miedo' : 'neutral', mira: [1, 1], incl: mira ? 0.12 : 0, manoI: mira ? [-60, -400] : [-120, -110], manoD: mira ? [80, -400] : [150, -150] });
    personaje(ctx, T, TOM, 870, SUELO + 40, 0.95, { mood: mira ? 'miedo' : 'sorpresa', mira: [-1, 1], incl: mira ? -0.1 : 0, manoI: [-120, -300], manoD: [110, -300], salto: mira ? Math.abs(Math.sin(T * 10)) * 8 : 0 });
  });
  rotulo(ctx, 0.3, t, 'YOU LET GO...', 540, 270, 130); rotulo(ctx, 1.3, t, 'STRAIGHT TO', 540, 420, 110, '#ffd93d'); rotulo(ctx, 1.6, t, "EARTH'S CORE", 540, 550, 130, '#ff6b3d');
}

const [modo, out] = process.argv.slice(2);
const c = createCanvas(W, H), ctx = c.getContext('2d');
const frame = (T) => { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); plano(ctx, T); };
if (modo === 'hoja') {
  const ts = [0.5, 2.6, 4.2, 5.5, 8.5, 10.5, 11.6, 13.5]; const S = 0.25, cols = 4;
  const sh = createCanvas(cols * W * S, Math.ceil(ts.length / cols) * H * S), sx = sh.getContext('2d');
  ts.forEach((T, i) => { frame(T); sx.drawImage(c, (i % cols) * W * S, Math.floor(i / cols) * H * S, W * S, H * S); });
  fs.writeFileSync(out, await sh.encode('png'));
} else {
  const fps = 30; const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(fps), '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-preset', 'fast', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = 0; f < DUR * fps; f++) { frame(f / fps); const buf = ctx.getImageData(0, 0, W, H).data; if (!ff.stdin.write(Buffer.from(buf.buffer))) await new Promise((r) => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
}
