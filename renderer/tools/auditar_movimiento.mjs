// Uso: node tools/auditar_movimiento.mjs $PWD  (columnas: escena, %contorno y %movimiento en t=1.5 y t=3)
// Auditoría: por cada escena, cuánto "contenido" (contornos/detalle) y cuánto movimiento hay entre fotogramas.
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import fs from 'node:fs';
const R = process.argv[2];
const { SCENES } = await import(R + '/scenes/index.mjs');
const { rng } = await import(R + '/lib/util.mjs');
const cat = JSON.parse(fs.readFileSync(R + '/scenes/catalog.json')).scenes;
const W = 1080, H = 1920, c1 = createCanvas(W, H), c2 = createCanvas(W, H);
const PARAMS = JSON.parse(process.argv[3] || '{}');
function stats(a, b) {
  let ink = 0, mov = 0, n = 0;
  for (let y = 300; y < 1700; y += 6) for (let x = 0; x < W; x += 6) {
    const i = (y * W + x) * 4; n++;
    const l = a[i] * 0.3 + a[i + 1] * 0.59 + a[i + 2] * 0.11; if (l < 70) ink++;
    if (Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]) > 30) mov++;
  }
  return [(ink / n * 100).toFixed(1), (mov / n * 100).toFixed(1)];
}
const out = [];
for (const name of Object.keys(cat)) {
  const sc = SCENES[name]; if (!sc) continue;
  const params = { text: 'DATO CURIOSO', label: '', ...(PARAMS[name] || {}) };
  try {
    const st = sc.setup(params, rng('a' + name));
    const res = [];
    for (const t of [1.5, 3.0]) {
      const x1 = c1.getContext('2d'), x2 = c2.getContext('2d');
      x1.setTransform(1,0,0,1,0,0); x2.setTransform(1,0,0,1,0,0);
      sc.draw(x1, st, { t, dur: 4, prog: t / 4, params, frame: 0, global: t, seed: 's', cast: {} });
      sc.draw(x2, st, { t: t + 0.2, dur: 4, prog: (t + 0.2) / 4, params, frame: 6, global: t + 0.2, seed: 's', cast: {} });
      res.push(stats(x1.getImageData(0,0,W,H).data, x2.getImageData(0,0,W,H).data));
    }
    out.push([name, ...res.flat()]);
  } catch (e) { out.push([name, 'ERR ' + e.message]); }
}
for (const r of out.sort((a, b) => parseFloat(a[2]) - parseFloat(b[2]))) console.log(r.join('\t'));
