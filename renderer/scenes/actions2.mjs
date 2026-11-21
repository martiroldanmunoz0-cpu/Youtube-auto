// ACCIONES DETALLADAS (2): lo que dice la voz PASA en pantalla, con principio, desarrollo y final.
// Cada acción reparte sus fases en la duración del plano (d). params: { tipo, lugar, hora, who, mood, label, numero }.
import { W, H, clamp, ease, radial } from '../lib/util.mjs';
import { PROPS, DRAW } from '../lib/props.mjs';
import { drawPlace, midShot, grade } from './bright.mjs';
import { drawHead, drawFullBody } from '../lib/persona.mjs';
import { INK } from '../lib/brightbg.mjs';
import { speedLines, sparkles, smoke, flash, shakeAt, starBurst } from '../lib/impact.mjs';

const { O, E, C, R, P, L } = DRAW;
const ph = (t, d, a, b) => clamp((t / d - a) / (b - a));
function prop(ctx, name, x, y, s, t, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); PROPS[name](ctx, t); ctx.restore(); }
// Primer plano de la cara (ocupa media pantalla)
function closeFace(ctx, who, x, y, s, opts) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); drawHead(ctx, 0, 0, who, opts); ctx.restore(); }
// Texto pequeño de reacción (no cuenta como palabra de cómic)
function popText(ctx, text, x, y, k, size = 90, rot = 0, col = '#ffffff') {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const s = ease.outBack(clamp(k)); ctx.scale(s, s);
  ctx.font = `${size}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.lineWidth = size * 0.2; ctx.strokeStyle = INK; ctx.strokeText(text, 0, 0); ctx.fillStyle = col; ctx.fillText(text, 0, 0); ctx.restore();
}
function bubbles(ctx, x, y, w, t, n, col = 'rgba(255,255,255,0.85)', speed = 1, size = 14) {
  for (let i = 0; i < n; i++) {
    const k = (t * 0.7 * speed + i / n) % 1, bx = x + ((i * 97) % w) - w / 2 + Math.sin(t * 3 + i) * 12, by = y - k * 260;
    ctx.globalAlpha = 1 - k; C(ctx, bx, by, size * (0.6 + (i % 3) * 0.4) * (0.5 + k), col, 4);
  }
  ctx.globalAlpha = 1;
}
function spaceBg(ctx, t) { drawPlace(ctx, 'espacio', 'noche', t); }

export const MORE_ACTIONS = {
  // La vista se nubla: primer plano de los ojos que parpadean cada vez más lento, todo se desenfoca y se oscurece.
  vista_nublada(ctx, t, d, who, params) {
    drawPlace(ctx, params.lugar || 'salon', params.hora || 'dia', t);
    const k = ph(t, d, 0.1, 0.95);
    const blinkSpeed = 3 + k * 4, closed = Math.sin(t * blinkSpeed) > 0.55 - k * 0.6; // parpadeos más largos al final
    closeFace(ctx, who, W / 2, 1050, 2.1, { mood: 'worried', t, closed });
    // visión doble y niebla
    const blur = k * 14;
    if (blur > 0.5) {
      const off = document_safe_copy(ctx);
      ctx.save(); ctx.filter = `blur(${blur}px)`; ctx.globalAlpha = 0.85; ctx.drawImage(off, 18 * k * Math.sin(t * 2), 0); ctx.restore();
    }
    ctx.fillStyle = `rgba(230,235,245,${0.45 * k})`; ctx.fillRect(0, 0, W, H);
    const v = ctx.createRadialGradient(W / 2, H / 2, 200 + (1 - k) * 600, W / 2, H / 2, 1100); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${0.2 + k * 0.75})`);
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
    if (closed && k > 0.3) { ctx.fillStyle = `rgba(0,0,0,${0.6 * k})`; ctx.fillRect(0, 0, W, H); } // los párpados: todo negro un instante
  },
  // El cuerpo se hincha como un globo y da vueltas por el espacio
  hincharse(ctx, t, d, who, params) {
    spaceBg(ctx, t);
    const k = ease.inOut(ph(t, d, 0.1, 0.8));
    ctx.save(); ctx.translate(W / 2 + Math.sin(t * 0.7) * 60, 960 + Math.cos(t * 0.9) * 40); ctx.rotate(t * 0.9); ctx.scale(0.8, 0.8); ctx.translate(0, 300);
    ctx.scale(1 + k * 0.45, 1 + k * 0.22);
    drawFullBody(ctx, 0, -560, 0.36, who, { mood: 'shocked', arms: 'up', t });
    E(ctx, 0, -280, 100 + k * 150, 170 + k * 70, who.outfit, 0, 8); // la barriga se hincha
    ctx.restore();
    for (let i = 0; i < 4; i++) { const a = t * 2 + i * 1.6; C(ctx, W / 2 + Math.cos(a) * (330 + k * 80), 980 + Math.sin(a) * (330 + k * 80), 10, '#ffffff', 0); }
    if (k > 0.3) popText(ctx, '+40%', 820, 420, ph(t, d, 0.35, 0.5), 110, 0.15, '#ffd166');
  },
  // Flotando sin control, dando vueltas por el espacio mientras la Tierra se aleja
  flotar_espacio(ctx, t, d, who) {
    spaceBg(ctx, t);
    const k = ph(t, d, 0, 1);
    prop(ctx, 'tierra', 900 - k * 120, 1650 + k * 200, 1.4 - k * 0.5, t);
    ctx.save(); ctx.translate(200 + k * 680, 1300 - k * 700); ctx.rotate(t * 1.3);
    drawFullBody(ctx, 0, -500, 0.3, who, { mood: 'shocked', arms: 'up', t }); ctx.restore();
    speedLines(ctx, W / 2, 1000, t, 0.12);
  },
  // Se desmaya: se tambalea, pone los ojos en blanco, cae fuera de plano y la pantalla se oscurece
  desmayarse(ctx, t, d, who, params) {
    drawPlace(ctx, params.lugar || 'salon', params.hora || 'dia', t);
    const sway = ph(t, d, 0, 0.45), fall = ease.in(ph(t, d, 0.45, 0.75));
    ctx.save(); ctx.translate(W / 2, 1900); ctx.rotate(Math.sin(t * 5) * 0.08 * sway + fall * 1.45); ctx.translate(-W / 2, -1900 + fall * 260);
    midShot(ctx, who, { x: W / 2, y: 960, s: 0.78, mood: sway > 0.3 ? 'worried' : 'neutral', t, seed: sway > 0.6 ? 0 : 3 });
    ctx.restore();
    if (sway > 0.2 && fall < 0.3) for (let i = 0; i < 5; i++) { const a = t * 4 + i * 1.25; ctx.save(); ctx.translate(W / 2 + Math.cos(a) * 200, 620 + Math.sin(a) * 50); ctx.rotate(t * 3); ctx.scale(0.35, 0.35); PROPS.estrella(ctx, t); ctx.restore(); }
    const dark = ph(t, d, 0.7, 1); ctx.fillStyle = `rgba(0,0,0,${dark * 0.85})`; ctx.fillRect(0, 0, W, H);
  },
  // Suelta todo el aire de golpe: nubes de aire que salen de la boca
  soltar_aire(ctx, t, d, who, params) {
    drawPlace(ctx, params.lugar || 'espacio', params.hora || 'noche', t);
    const k = ph(t, d, 0.15, 0.85);
    closeFace(ctx, who, 420, 1000, 1.6, { mood: k > 0 ? 'shocked' : 'neutral', t });
    for (let i = 0; i < 9; i++) {
      const q = clamp((k * 1.4 - i * 0.07)); if (q <= 0) continue;
      const x = 560 + q * 560, y = 1290 + Math.sin(i * 2 + t * 3) * 60 * q, r = 30 + q * 90;
      ctx.globalAlpha = 1 - q; C(ctx, x, y, r, '#e3f3ff', 6); ctx.globalAlpha = 1;
    }
    if (k > 0 && k < 1) speedLines(ctx, 700, 1290, t, 0.25);
  },
  // La saliva hierve: boca abierta en primer plano con burbujas que suben y estallan
  saliva_hierve(ctx, t, d, who) {
    ctx.fillStyle = who.skin.dark; ctx.fillRect(0, 0, W, H);
    E(ctx, W / 2, 1000, 460, 380, '#5a1a1a', 0, 14);                 // boca abierta
    R(ctx, W / 2 - 380, 640, 760, 90, 40, '#ffffff', 8);               // dientes de arriba
    R(ctx, W / 2 - 360, 1290, 720, 80, 40, '#ffffff', 8);              // dientes de abajo
    E(ctx, W / 2, 1180, 330, 170, '#ff7a8a', 0, 10);                   // lengua
    const k = ph(t, d, 0.1, 0.9);
    bubbles(ctx, W / 2, 1150, 520, t * (1 + k * 2), Math.floor(6 + k * 18), 'rgba(235,245,255,0.95)', 1.5, 22);
    for (let i = 0; i < 3; i++) { const q = (t * 0.8 + i / 3) % 1; ctx.globalAlpha = 0.5 * (1 - q) * k; C(ctx, W / 2 - 200 + i * 200, 800 - q * 400, 60 + q * 60, '#ffffff', 0); }
    ctx.globalAlpha = 1;
    if (k > 0.2) popText(ctx, 'BLUB BLUB', W / 2, 400, ph(t, d, 0.25, 0.4), 120, -0.06);
  },
  // Se quema al sol: la piel se pone roja poco a poco, ondas de calor y destellos del sol
  quemarse(ctx, t, d, who, params) {
    drawPlace(ctx, params.lugar || 'desierto', 'dia', t);
    const k = ph(t, d, 0.1, 0.9);
    radial(ctx, 900, 220, 700 + Math.sin(t * 3) * 40, '#fff1a8', 0.6 + k * 0.3);
    midShot(ctx, who, { x: W / 2, y: 960, s: 0.78, mood: k > 0.5 ? 'worried' : 'neutral', t });
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; radial(ctx, W / 2, 980, 380, '#ff5a4a', 0.75 * k); ctx.restore();
    ctx.strokeStyle = `rgba(255,255,255,${0.35 * k})`; ctx.lineWidth = 6;
    for (let i = 0; i < 6; i++) { const x = 120 + i * 170; ctx.beginPath(); for (let y = 1700; y > 1100; y -= 20) ctx.lineTo(x + Math.sin(y / 30 + t * 6 + i) * 14, y - ((t * 200) % 60)); ctx.stroke(); }
  },
  // Corazón latiendo cada vez más rápido con el electrocardiograma
  latido(ctx, t, d, who, params) {
    ctx.fillStyle = '#1a0f1f'; ctx.fillRect(0, 0, W, H);
    const rate = 1.3 + ph(t, d, 0, 1) * (params.rapido === false ? 0 : 2.2);
    const beat = Math.pow(Math.max(0, Math.sin(t * rate * Math.PI * 2)), 8);
    radial(ctx, W / 2, 820, 600, '#ff3b5c', 0.25 + beat * 0.35);
    prop(ctx, 'corazon', W / 2, 1080, 1.6 + beat * 0.25, t);
    ctx.strokeStyle = '#3cff8f'; ctx.lineWidth = 10; ctx.lineJoin = 'round'; ctx.beginPath();
    for (let x = 0; x <= W; x += 6) { const ph2 = (x / W * 3 - t * rate) % 1, pp = ph2 < 0 ? ph2 + 1 : ph2; const y = 1560 - (pp > 0.45 && pp < 0.5 ? 220 : pp > 0.5 && pp < 0.55 ? -120 : 0); x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
    popText(ctx, `${Math.round(60 + rate * 30)} lpm`, W / 2, 1760, 1, 80, 0, '#3cff8f');
  },
  // Se congela: escarcha que crece desde los bordes, tiembla y le sale vaho
  congelarse(ctx, t, d, who, params) {
    drawPlace(ctx, params.lugar || 'montana', params.hora || 'noche', t);
    const k = ph(t, d, 0.1, 0.9);
    ctx.save(); ctx.translate(Math.sin(t * 40) * 6 * k, 0);
    midShot(ctx, who, { x: W / 2, y: 960, s: 0.78, mood: 'worried', t }); ctx.restore();
    for (let i = 0; i < 3; i++) { const q = (t * 0.7 + i / 3) % 1; ctx.globalAlpha = 0.7 * (1 - q); C(ctx, W / 2 + 40 + q * 160, 1150 - q * 200, 30 + q * 50, '#ffffff', 0); } ctx.globalAlpha = 1;
    ctx.save(); ctx.fillStyle = `rgba(180,225,255,${0.35 * k})`; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 5;
    for (let i = 0; i < 24; i++) { const edge = i % 4, len = 60 + k * 260 * ((i * 37) % 10) / 10; const p = ((i * 131) % 1000) / 1000;
      const [x, y, a] = edge === 0 ? [p * W, 0, Math.PI / 2] : edge === 1 ? [p * W, H, -Math.PI / 2] : edge === 2 ? [0, p * H, 0] : [W, p * H, Math.PI];
      ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(len, 0); for (const f of [0.4, 0.7]) { ctx.moveTo(len * f, 0); ctx.lineTo(len * f + 40, -40); ctx.moveTo(len * f, 0); ctx.lineTo(len * f + 40, 40); } ctx.stroke(); ctx.restore(); }
    ctx.restore();
  },
  // Carcajada: se ríe sin parar, tiembla, le saltan lágrimas
  reir(ctx, t, d, who, params) {
    drawPlace(ctx, params.lugar || 'salon', params.hora || 'dia', t);
    const k = ph(t, d, 0.1, 1);
    ctx.save(); ctx.translate(Math.sin(t * 22) * 8 * k, Math.abs(Math.sin(t * 11)) * -20 * k);
    midShot(ctx, who, { x: W / 2, y: 960, s: 0.8, mood: 'happy', t }); ctx.restore();
    for (const s of [-1, 1]) { const q = (t * 1.2 + (s > 0 ? 0.5 : 0)) % 1; C(ctx, W / 2 + s * (120 + q * 80), 940 + q * 140, 14, '#8fd3ff', 4); }
    for (let i = 0; i < 3; i++) popText(ctx, 'JA', W / 2 + (i - 1) * 260, 520 - i * 40 + Math.sin(t * 6 + i) * 20, ph(t, d, 0.12 + i * 0.1, 0.25 + i * 0.1), 120 - i * 15, (i - 1) * 0.2, '#ffd166');
  },
  // Llora: lágrimas que caen a chorro y una nube de lluvia encima
  llorar(ctx, t, d, who, params) {
    drawPlace(ctx, params.lugar || 'salon', params.hora || 'noche', t);
    midShot(ctx, who, { x: W / 2, y: 960, s: 0.8, mood: 'sad', t });
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) { const q = (t * 1.4 + i / 4) % 1; E(ctx, W / 2 + s * (90 + q * 30), 960 + q * 380, 12, 18, '#8fd3ff', 0, 3); }
    const k = ease.out(ph(t, d, 0.2, 0.4)); if (k > 0) { prop(ctx, 'nube', W / 2, 520, 0.8 * k, t); ctx.strokeStyle = '#5ab8ff'; ctx.lineWidth = 6; for (let i = 0; i < 8; i++) { const q = (t * 2 + i / 8) % 1; ctx.beginPath(); ctx.moveTo(W / 2 - 180 + i * 50, 540 + q * 160); ctx.lineTo(W / 2 - 190 + i * 50, 580 + q * 160); ctx.stroke(); } }
  },
  // Cosquillas: una mano con una pluma le hace cosquillas en el pie descalzo; se retuerce de risa
  cosquillas(ctx, t, d, who, params) {
    drawPlace(ctx, params.lugar || 'salon', params.hora || 'dia', t);
    const k = ph(t, d, 0.15, 1), wig = Math.sin(t * 14) * k;
    ctx.save(); ctx.translate(W / 2 - 160, 780); ctx.rotate(wig * 0.06); midShot(ctx, who, { x: 0, y: 0, s: 0.6, mood: k > 0.1 ? 'happy' : 'neutral', t }); ctx.restore();
    // pie descalzo en primer plano
    ctx.save(); ctx.translate(760, 1500); ctx.rotate(-0.3 + wig * 0.15);
    E(ctx, 0, 0, 150, 220, who.skin.light, 0, 9); for (let i = 0; i < 5; i++) C(ctx, -90 + i * 45, -215 + Math.abs(i - 2) * 12, 28 - Math.abs(i - 2) * 3, who.skin.light, 7);
    ctx.restore();
    const ent = ease.out(ph(t, d, 0, 0.15));
    ctx.save(); ctx.translate(1100 - ent * 340 + Math.sin(t * 16) * 30, 1450 + Math.cos(t * 16) * 30); ctx.rotate(-1.1); ctx.scale(0.7, 0.7); PROPS.pluma(ctx, t * 3); ctx.restore();
    if (k > 0) { speedLines(ctx, 760, 1450, t, 0.2 * k); for (let i = 0; i < 2; i++) popText(ctx, 'JI', 260 + i * 160, 460 + Math.sin(t * 8 + i) * 20, ph(t, d, 0.2 + i * 0.15, 0.32 + i * 0.15), 100, (i ? 0.2 : -0.2), '#ff8fab'); }
  },
  // Tormenta en el mar: la barca sube y baja entre olas enormes, lluvia y relámpagos
  tormenta_mar(ctx, t, d, who) {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1d2333'); g.addColorStop(1, '#2c3e57'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 5; i++) prop(ctx, 'nube', 100 + i * 240 + Math.sin(t + i) * 30, 260 + (i % 2) * 80, 0.9, t);
    const lit = (t % 2.2) < 0.12; if (lit) { ctx.fillStyle = 'rgba(230,240,255,0.5)'; ctx.fillRect(0, 0, W, H); prop(ctx, 'rayo', 300, 900, 1.4, t); }
    const wave = (x) => 1250 + Math.sin(x / 160 + t * 2.2) * 120 + Math.sin(x / 70 - t * 3) * 30;
    const bx = W / 2, by = wave(bx);
    ctx.save(); ctx.translate(bx, by - 40); ctx.rotate(Math.cos(bx / 160 + t * 2.2) * 0.35);
    ctx.scale(1.3, 1.3); ctx.save(); ctx.translate(-150, -330); ctx.scale(0.42, 0.42); drawHead(ctx, 0, 0, who, { mood: 'shocked', t }); ctx.restore();
    PROPS.barca(ctx, t); ctx.restore();
    ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; x <= W; x += 20) ctx.lineTo(x, wave(x)); ctx.lineTo(W, H); ctx.closePath(); ctx.fillStyle = '#1f6f99'; ctx.fill(); O(ctx, 10);
    for (let i = 0; i < 10; i++) C(ctx, (i * 113 + t * 80) % W, wave((i * 113 + t * 80) % W) - 10, 18, '#ffffff', 4);
    ctx.strokeStyle = 'rgba(200,220,255,0.6)'; ctx.lineWidth = 4; for (let i = 0; i < 60; i++) { const x = (i * 97 + t * 900) % (W + 200) - 100, y = (i * 211 + t * 1600) % H; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 30, y + 70); ctx.stroke(); }
  },
  // Contar los días: rayitas que se van tachando en la madera y un contador que sube
  contar_dias(ctx, t, d, who, params) {
    ctx.fillStyle = '#b07a45'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 5; for (let y = 60; y < H; y += 90) { ctx.beginPath(); ctx.moveTo(0, y); ctx.bezierCurveTo(300, y + 20, 700, y - 20, W, y + 10); ctx.stroke(); }
    const total = Math.max(5, Number(params.numero) || 100), k = ease.inOut(ph(t, d, 0.05, 0.9));
    const shown = Math.floor(k * Math.min(total, 60));
    ctx.strokeStyle = '#2b1a0f'; ctx.lineWidth = 12; ctx.lineCap = 'round';
    for (let i = 0; i < shown; i++) { const grp = Math.floor(i / 5), j = i % 5, gx = 120 + (grp % 4) * 230, gy = 520 + Math.floor(grp / 4) * 220;
      ctx.beginPath(); if (j < 4) { ctx.moveTo(gx + j * 40, gy); ctx.lineTo(gx + j * 40 + 6, gy + 150); } else { ctx.moveTo(gx - 20, gy + 120); ctx.lineTo(gx + 160, gy + 30); } ctx.stroke(); }
    popText(ctx, `DÍA ${Math.max(1, Math.round(k * total))}`, W / 2, 300, 1, 150, -0.04, '#ffd166');
  },
  // Grito: primer plano con la boca muy abierta, ondas de sonido y temblor
  gritar(ctx, t, d, who, params) {
    drawPlace(ctx, params.lugar || 'calle', params.hora || 'dia', t);
    const k = ph(t, d, 0.1, 0.9); const [sx, sy] = shakeAt(t, d * 0.1, 18, d); ctx.save(); ctx.translate(sx * k, sy * k);
    closeFace(ctx, who, W / 2, 1000, 1.9, { mood: 'shocked', t }); ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 10;
    for (let i = 0; i < 4; i++) { const q = (t * 1.5 + i / 4) % 1; ctx.globalAlpha = (1 - q) * k; ctx.beginPath(); ctx.arc(W / 2, 1340, 150 + q * 500, -2.4, -0.7); ctx.stroke(); } ctx.globalAlpha = 1;
  },
  // Corre a toda velocidad: rebota, se inclina, el fondo pasa rápido y levanta polvo
  correr(ctx, t, d, who, params) {
    drawPlace(ctx, params.lugar || 'calle', params.hora || 'dia', t * 3);
    ctx.save(); ctx.translate(W / 2, 760 - Math.abs(Math.sin(t * 9)) * 50); ctx.rotate(0.12);
    drawFullBody(ctx, 0, 0, 0.42, who, { mood: params.mood || 'worried', arms: 'normal', t: t * 6 }); ctx.restore();
    speedLines(ctx, W / 2 + 200, 1100, t, 0.35); smoke(ctx, W / 2 - 160, 1720, t * 2, 4);
  },
  // Se hunde bajo el agua: burbujas que suben y la luz que se va apagando
  hundirse(ctx, t, d, who) {
    const k = ph(t, d, 0, 1);
    drawPlace(ctx, 'bajo_el_mar', k > 0.5 ? 'noche' : 'dia', t);
    ctx.save(); ctx.translate(W / 2, 500 + k * 900); ctx.rotate(Math.sin(t * 1.2) * 0.2); drawFullBody(ctx, 0, -300, 0.3, who, { mood: 'shocked', arms: 'up', t }); ctx.restore();
    bubbles(ctx, W / 2, 500 + k * 900, 260, t, 12, 'rgba(255,255,255,0.8)', 1.3, 16);
    ctx.fillStyle = `rgba(0,10,40,${k * 0.6})`; ctx.fillRect(0, 0, W, H);
  },
  // Duda: interrogaciones que aparecen alrededor de la cabeza
  dudar(ctx, t, d, who, params) {
    drawPlace(ctx, params.lugar || 'salon', params.hora || 'dia', t);
    midShot(ctx, who, { x: W / 2, y: 980, s: 0.78, mood: 'worried', t });
    for (let i = 0; i < 3; i++) popText(ctx, '?', W / 2 + (i - 1) * 280, 520 - (i % 2) * 90 + Math.sin(t * 3 + i) * 20, ph(t, d, 0.1 + i * 0.15, 0.22 + i * 0.15), 200 - i * 20, (i - 1) * 0.25, '#ffd166');
  },
  // Mareo: la habitación da vueltas y los ojos se vuelven espirales
  marearse(ctx, t, d, who, params) {
    const k = ph(t, d, 0, 0.8);
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(Math.sin(t * 2) * 0.25 * k); ctx.scale(1.1, 1.1); ctx.translate(-W / 2, -H / 2);
    drawPlace(ctx, params.lugar || 'salon', params.hora || 'dia', t); ctx.restore();
    ctx.save(); ctx.translate(W / 2, 980); ctx.rotate(Math.sin(t * 3) * 0.12 * k); midShot(ctx, who, { x: 0, y: 0, s: 0.78, mood: 'worried', t }); ctx.restore();
    for (const s of [-1, 1]) { ctx.save(); ctx.translate(W / 2 + s * 60, 970); ctx.rotate(t * 6); ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); for (let a = 0; a < 12; a += 0.3) ctx.lineTo(Math.cos(a) * a * 3.2, Math.sin(a) * a * 3.2); ctx.globalAlpha = k; ctx.stroke(); ctx.restore(); }
    ctx.globalAlpha = 1;
  },
};

// Copia del lienzo actual (para efectos de visión doble / desenfoque)
let _copy = null;
function document_safe_copy(ctx) {
  const c = ctx.canvas;
  if (!_copy || _copy.width !== c.width) _copy = new c.constructor(c.width, c.height);
  const x = _copy.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, c.width, c.height); x.drawImage(c, 0, 0);
  return _copy;
}

export const MORE_ALIAS = {
  'vista nublada': 'vista_nublada', nublarse: 'vista_nublada', desenfocar: 'vista_nublada', parpadear: 'vista_nublada', 'perder la vista': 'vista_nublada', vision_borrosa: 'vista_nublada',
  hinchar: 'hincharse', inflarse: 'hincharse', hinchazon: 'hincharse', 'hinchazón': 'hincharse',
  flotar: 'flotar_espacio', espacio: 'flotar_espacio', gravedad_cero: 'flotar_espacio', ingravidez: 'flotar_espacio',
  desmayo: 'desmayarse', desmayar: 'desmayarse', 'perder el conocimiento': 'desmayarse', inconsciente: 'desmayarse', caerse: 'desmayarse',
  exhalar: 'soltar_aire', respirar: 'soltar_aire', aire: 'soltar_aire', expulsar_aire: 'soltar_aire',
  saliva: 'saliva_hierve', hervir: 'saliva_hierve', burbujear: 'saliva_hierve', ebullicion: 'saliva_hierve',
  quemadura: 'quemarse', sol: 'quemarse', calor: 'quemarse', insolacion: 'quemarse',
  corazon: 'latido', 'corazón': 'latido', latir: 'latido', pulso: 'latido', taquicardia: 'latido',
  congelar: 'congelarse', frio: 'congelarse', 'frío': 'congelarse', hielo: 'congelarse', temblar: 'congelarse',
  risa: 'reir', 'reír': 'reir', carcajada: 'reir', reirse: 'reir',
  lagrimas: 'llorar', 'lágrimas': 'llorar', tristeza: 'llorar', llanto: 'llorar',
  cosquilla: 'cosquillas', hacer_cosquillas: 'cosquillas',
  tormenta_en_el_mar: 'tormenta_mar', naufragio: 'tormenta_mar', olas: 'tormenta_mar', deriva: 'tormenta_mar', temporal: 'tormenta_mar',
  contar: 'contar_dias', dias: 'contar_dias', 'días': 'contar_dias', tachar_dias: 'contar_dias', calendario: 'contar_dias',
  grito: 'gritar', chillar: 'gritar',
  carrera: 'correr', huir: 'correr', escapar: 'correr',
  hundir: 'hundirse', ahogarse: 'hundirse', sumergirse: 'hundirse',
  duda: 'dudar', pregunta: 'dudar', 'no entender': 'dudar',
  mareo: 'marearse', marear: 'marearse', vueltas: 'marearse',
};
