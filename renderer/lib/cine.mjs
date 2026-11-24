// LENGUAJE «CINE» para los planos en horizontal de los vídeos largos (export «ancho» de las escenas a medida).
// Se aprendió de mirar cómo están hechos los vídeos de animación explicativa más detallados (solo el lenguaje visual,
// nunca sus dibujos ni sus guiones):
//   · el personaje está DENTRO del lugar, y la cámara está a su altura;
//   · muchos tipos de plano: general con mucha gente, primer plano con el fondo desenfocado, por encima del hombro,
//     detalle de un objeto que llena la pantalla, dato con el lugar desenfocado detrás;
//   · luz con intención (atardecer malva, noche azul, lámparas cálidas), viñeta y colores menos chillones;
//   · contornos finos, sombreado suave en los personajes;
//   · rótulos pequeños y elegantes (letras espaciadas, «pastillas» con cifras) dentro del plano, no pantallas aparte.
// Uso (en un archivo a medida):
//   import { plano, actor, etiqueta, pastilla } from '../../lib/cine.mjs'
//   export const ancho = { 4: plano.general({ set: 'calle', o: { hora: 'atardecer' }, actores: [{ q: 'jogger', x: 900 }] }), ... }
import { createCanvas } from '@napi-rs/canvas';
import { SET, WW, WH, glow, people } from './sets.mjs';
import { STYLE } from './props.mjs';
import { maleza } from './sets_mundo.mjs';
import { drawFullBody } from './persona.mjs';

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const sm = (k) => { k = clamp(k); return k * k * (3 - 2 * k); };
const BUF = {};
function buf(name, w, h) { let c = BUF[name]; if (!c || c.width !== w || c.height !== h) c = BUF[name] = createCanvas(w, h); const x = c.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.filter = 'none'; x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, w, h); return c; }

// ---------------- Luz y color ----------------
// tint: multiplica (da el color de la hora); key: luz principal (color, x, y, radio, fuerza); sat: cuánto se apagan los colores
export const LOOK = {
  dia: { tint: 'rgb(252,242,248)', key: ['#fff0d0', 1500, 80, 1300, 0.22], sat: 0.12, vig: 0.4 },
  atardecer: { tint: 'rgb(240,206,230)', key: ['#ffb27a', 1550, 160, 1400, 0.34], sat: 0.16, vig: 0.5 },
  interior: { tint: 'rgb(246,222,230)', key: ['#ffd2a0', 1450, 260, 1300, 0.28], sat: 0.15, vig: 0.48 },
  noche: { tint: 'rgb(165,165,222)', key: ['#ffd59a', 960, 120, 1200, 0.24], sat: 0.25, vig: 0.62 },
  tension: { tint: 'rgb(214,160,190)', key: ['#ff6a6a', 300, 200, 1300, 0.2], sat: 0.32, vig: 0.66 },
  frio: { tint: 'rgb(186,200,236)', key: ['#bfe0ff', 960, 60, 1300, 0.22], sat: 0.34, vig: 0.55 },
  espacio: { tint: 'rgb(200,190,240)', key: ['#c8b8ff', 960, 300, 1300, 0.18], sat: 0.2, vig: 0.6 },
};
// Antes de dibujar: contornos finos y tintados
export function inicio() { STYLE.k = 0.42; STYLE.ink = 'rgba(38,26,58,0.8)'; }
// Al final del plano (en coordenadas de pantalla): color de la hora, luz principal, colores apagados, viñeta
export function acabado(ctx, look = 'atardecer') {
  const L = LOOK[look] || LOOK.atardecer; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'saturation'; ctx.globalAlpha = L.sat; ctx.fillStyle = 'rgb(128,128,128)'; ctx.fillRect(0, 0, WW, WH);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = L.tint; ctx.fillRect(0, 0, WW, WH);
  ctx.globalCompositeOperation = 'screen'; const [kc, kx, ky, kr, ka] = L.key; const g = ctx.createRadialGradient(kx, ky, 0, kx, ky, kr); g.addColorStop(0, kc); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.globalAlpha = ka; ctx.fillStyle = g; ctx.fillRect(0, 0, WW, WH);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  const v = ctx.createRadialGradient(WW / 2, WH / 2, WH * 0.38, WW / 2, WH / 2, WW * 0.62); v.addColorStop(0, 'rgba(10,6,24,0)'); v.addColorStop(1, `rgba(10,6,24,${L.vig})`); ctx.fillStyle = v; ctx.fillRect(0, 0, WW, WH);
  ctx.restore(); STYLE.k = 1;
}

// ---------------- Cámara ----------------
// Acercamiento suave con un leve balanceo de cámara en mano. Hace ctx.save(): cerrar con ctx.restore()
export function camara(ctx, a, z0 = 1, z1 = 1.06, fx = WW / 2, fy = WH / 2, dx = 0, dy = 0) {
  const e = sm(a.t / a.d), z = z0 + (z1 - z0) * e, hx = Math.sin(a.t * 0.7) * 5, hy = Math.cos(a.t * 0.53) * 4;
  ctx.save(); ctx.translate(fx + dx * e + hx, fy + dy * e + hy); ctx.scale(z, z); ctx.translate(-fx, -fy);
}

// ---------------- Fondo ----------------
// Dibuja un decorado (nombre de SET o función propia (ctx,t,o)=>info) nítido o desenfocado; zoom > 1 lo acerca hacia (fx,fy)
export function fondo(ctx, a, set, o = {}, { blur = 0, zoom = 1, fx = WW / 2, fy = WH / 2, oscuro = 0 } = {}) {
  const fn = typeof set === 'function' ? set : SET[set];
  const draw = (c) => { c.save(); if (zoom !== 1) { c.translate(fx, fy); c.scale(zoom, zoom); c.translate(-fx, -fy); } const r = fn(c, a.t, { a, ...o }) || {}; if (o.maleza) maleza(c, a.t, o.maleza, r.gy ?? 960, 4); c.restore(); return r; };
  let info;
  if (!blur) info = draw(ctx);
  else { // a media resolución y desenfocado (rápido y suave): la profundidad de campo de una cámara de verdad
    const h = buf('h', WW / 2, WH / 2), hx = h.getContext('2d'); hx.setTransform(0.5, 0, 0, 0.5, 0, 0); info = draw(hx);
    const d = buf('d', WW / 2, WH / 2), dx = d.getContext('2d'); dx.filter = `blur(${blur / 2}px)`; dx.drawImage(h, 0, 0); dx.filter = 'none';
    ctx.drawImage(d, 4, 4, WW / 2 - 8, WH / 2 - 8, -10, -10, WW + 20, WH + 20);
  }
  if (oscuro) { ctx.save(); ctx.fillStyle = `rgba(14,8,30,${oscuro})`; ctx.fillRect(-200, -200, WW + 400, WH + 400); ctx.restore(); }
  return info || {};
}

// ---------------- Personajes ----------------
// Personaje de pie con los pies en (x, gy), con sombreado de volumen (luz de un lado, sombra del otro, pies más oscuros).
// esc 1 ≈ 560 px de alto. luz: -1 viene de la izquierda, 1 de la derecha. Devuelve { top, head, chest, s, x }
export function actor(ctx, a, who, x, gy, esc = 1, mood = 'neutral', o = {}) {
  const s = 0.21 * esc, bob = o.still ? 0 : Math.sin(a.t * 2.2 + x * 0.01) * 3 * esc, y = gy - 2290 * s + bob;
  if (!o.sinSombra) { ctx.save(); ctx.globalAlpha = 0.22; ctx.fillStyle = '#0a0618'; ctx.beginPath(); ctx.ellipse(x, gy + 4, 300 * s, 46 * s, 0, 0, 7); ctx.fill(); ctx.restore(); }
  pintaSombreado(ctx, x, y, s, who, { mood, t: a.t, ...o });
  return { top: y - 330 * s, head: y, chest: y + 600 * s, s, x, feet: gy };
}
// Busto grande (primeros planos): la cabeza en (x, y). esc 1 ≈ cabeza de 170 px de radio
export function busto(ctx, a, who, x, y, esc = 1, mood = 'neutral', o = {}) {
  const s = 0.55 * esc; pintaSombreado(ctx, x, y + (o.still ? 0 : Math.sin(a.t * 1.6) * 4), s, who, { mood, t: a.t, ...o });
  return { head: y, s, chest: y + 600 * s, hand: [x + 330 * s, y + 900 * s] };
}
function pintaSombreado(ctx, x, y, s, who, o) {
  const m = ctx.getTransform(), sc = Math.hypot(m.a, m.b) || 1, S = s * sc; // resolución real en pantalla
  const L = -560, T = -820, Wd = 1120, Hd = 3200, w = Math.ceil(Wd * S) + 2, h = Math.ceil(Hd * S) + 2;
  if (w > 2600 || h > 4200 || o.plano) { drawFullBody(ctx, x, y, s, who, o); return; }
  const c = buf('p' + (o.slot || 0), w, h), cx = c.getContext('2d');
  cx.setTransform(S, 0, 0, S, -L * S, -T * S); drawFullBody(cx, 0, 0, 1, who, o); cx.setTransform(1, 0, 0, 1, 0, 0);
  cx.globalCompositeOperation = 'source-atop';
  const lado = o.luz ?? -1, g = cx.createLinearGradient(lado < 0 ? 0 : w, 0, lado < 0 ? w : 0, 0);
  g.addColorStop(0, 'rgba(255,236,214,0.20)'); g.addColorStop(0.45, 'rgba(255,236,214,0)'); g.addColorStop(0.62, 'rgba(26,12,46,0.06)'); g.addColorStop(1, 'rgba(26,12,46,0.34)');
  cx.fillStyle = g; cx.fillRect(0, 0, w, h);
  const v = cx.createLinearGradient(0, (1250 - T) * S, 0, h); v.addColorStop(0, 'rgba(20,10,40,0)'); v.addColorStop(1, 'rgba(20,10,40,0.3)'); cx.fillStyle = v; cx.fillRect(0, 0, w, h);
  // brillo de contraluz en el borde de la cabeza
  const hx = (lado < 0 ? -1 : 1) * 200 * S - L * S, hy = -120 * S - T * S, r = cx.createRadialGradient(hx, hy, 0, hx, hy, 260 * S); r.addColorStop(0, 'rgba(255,240,225,0.22)'); r.addColorStop(1, 'rgba(255,240,225,0)'); cx.fillStyle = r; cx.fillRect(0, 0, w, h);
  cx.globalCompositeOperation = 'source-over';
  ctx.save(); ctx.translate(x, y); ctx.scale(1 / sc * (m.a < 0 ? -1 : 1), 1 / sc); ctx.drawImage(c, L * S, T * S); ctx.restore();
}
// Silueta borrosa en primer término (alguien de espaldas tapando un lado): da profundidad al plano
export function primerTermino(ctx, a, who, x, y, esc = 1.4, blur = 14) {
  const s = 0.55 * esc, w = Math.ceil(1300 * s), h = Math.ceil(2000 * s), c = buf('ft', w, h), cx = c.getContext('2d');
  cx.setTransform(s, 0, 0, s, w / 2, 450 * s); const b = { ...who, glasses: false, beard: false, mustache: false };
  drawFullBody(cx, 0, 0, 1, b, { mood: 'neutral', t: a.t }); cx.setTransform(1, 0, 0, 1, 0, 0);
  cx.globalCompositeOperation = 'source-atop'; cx.fillStyle = 'rgba(16,8,32,0.55)'; cx.fillRect(0, 0, w, h); cx.globalCompositeOperation = 'source-over';
  ctx.save(); ctx.filter = `blur(${blur}px)`; ctx.drawImage(c, x - w / 2, y - 450 * s); ctx.restore(); ctx.filter = 'none';
}

// ---------------- Rótulos ----------------
function spaced(ctx, txt, x, y, sp, align = 'left') {
  const ws = [...txt].map((ch) => ctx.measureText(ch).width), tot = ws.reduce((p, q) => p + q, 0) + sp * (ws.length - 1);
  let cx = align === 'center' ? x - tot / 2 : align === 'right' ? x - tot : x; ctx.textAlign = 'left';
  [...txt].forEach((ch, i) => { ctx.fillText(ch, cx, y); cx += ws[i] + sp; }); return tot;
}
// Rótulo pequeño de letras espaciadas (como un subtítulo de documental), arriba a la izquierda por defecto
export function etiqueta(ctx, a, txt, x = 110, y = 150, { size = 30, color = '#f6dcb4', k = null, align = 'left' } = {}) {
  const al = k ?? clamp(a.t / 0.4) * clamp((a.d - a.t) / 0.3); if (al <= 0) return;
  ctx.save(); ctx.globalAlpha = al; ctx.font = `600 ${size}px Poppins`; ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 12; ctx.fillStyle = color; spaced(ctx, String(txt).toUpperCase(), x, y, size * 0.22, align); ctx.restore();
}
// Pastilla oscura con borde dorado y una cifra o palabra (p. ej. «7 MIN», «$3,000,000») anclada a algo del plano
export function pastilla(ctx, a, txt, x, y, { size = 40, k = null, color = '#ffe6c2' } = {}) {
  const al = k ?? clamp((a.t - 0.15) / 0.35); if (al <= 0) return; const e = 0.85 + 0.15 * sm(al);
  ctx.save(); ctx.globalAlpha = clamp(al); ctx.translate(x, y); ctx.scale(e, e); ctx.font = `700 ${size}px Poppins`; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
  const w = ctx.measureText(txt).width + size * 1.1, h = size * 1.55;
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 20; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = 'rgba(28,16,40,0.82)'; ctx.fill(); ctx.shadowBlur = 0;
  ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,214,160,0.75)'; ctx.stroke(); ctx.fillStyle = color; ctx.fillText(txt, 0, 3); ctx.restore();
}
// Cifra grande con brillo (para planos de dato)
export function cifra(ctx, a, txt, x, y, { size = 150, color = '#ffe6c2', k = null, glowCol = '#ffb27a' } = {}) {
  const al = k ?? clamp((a.t - 0.1) / 0.4); if (al <= 0) return; const e = 0.9 + 0.1 * sm(al);
  ctx.save(); ctx.globalAlpha = al; ctx.translate(x, y); ctx.scale(e, e); ctx.font = `700 ${size}px Poppins`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.shadowColor = glowCol; ctx.shadowBlur = size * 0.35; ctx.fillStyle = color; ctx.fillText(txt, 0, 0); ctx.shadowBlur = 0; ctx.fillText(txt, 0, 0); ctx.restore();
}
// Bocadillo de diálogo blanco con cola hacia (tx,ty); aparece con un pequeño salto
export function bocadillo(ctx, a, txt, x, y, { tx = null, ty = null, size = 40, p0 = 0.1, max = 620 } = {}) {
  const k = clamp((a.t / a.d - p0) / 0.08); if (k <= 0) return; const e = 0.7 + 0.3 * sm(k);
  ctx.save(); ctx.font = `600 ${size}px Poppins`; const words = String(txt).split(' '), lines = []; let ln = '';
  for (const w of words) { const tt = ln ? ln + ' ' + w : w; if (ctx.measureText(tt).width > max && ln) { lines.push(ln); ln = w; } else ln = tt; } lines.push(ln);
  const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + size * 1.4, h = lines.length * size * 1.25 + size * 0.9;
  ctx.globalAlpha = k; ctx.translate(x, y); ctx.scale(e, e); ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 24; ctx.fillStyle = '#fffaf3';
  ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, size * 0.7); ctx.fill();
  if (tx !== null) { ctx.beginPath(); ctx.moveTo(-size * 0.5, h / 2 - 4); ctx.lineTo((tx - x) * 0.35, (ty - y) * 0.35); ctx.lineTo(size * 0.5, h / 2 - 4); ctx.fill(); }
  ctx.shadowBlur = 0; ctx.fillStyle = '#2a1e3a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  lines.forEach((l, i) => ctx.fillText(l, 0, (i - (lines.length - 1) / 2) * size * 1.25 + 2)); ctx.restore();
}
// Confeti cayendo
export function confeti(ctx, a, n = 60) { for (let i = 0; i < n; i++) { const h1 = Math.abs(Math.sin(i * 12.9898)), h2 = Math.abs(Math.sin(i * 78.233)); const x = h1 * WW + Math.sin(a.t * 2 + i) * 30, y = ((h2 * WH + a.t * (180 + h1 * 120)) % (WH + 100)) - 50;
  ctx.save(); ctx.translate(x, y); ctx.rotate(a.t * 3 + i); ctx.fillStyle = ['#ffd166', '#ff6fa3', '#4cc9f0', '#2ec27e', '#b67bff'][i % 5]; ctx.fillRect(-8, -5, 16, 10); ctx.restore(); } }
// Panel de cristal oscuro (móvil, ficha, gráfico) centrado en (x,y)
export function panel(ctx, x, y, w, h, r = 28) {
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 40; ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, r); ctx.fillStyle = 'rgba(34,22,52,0.86)'; ctx.fill(); ctx.shadowBlur = 0;
  ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,214,160,0.45)'; ctx.stroke(); ctx.restore();
}
// Haz de luz (ventana, linterna, foco) de (x1,y1) abriéndose hacia (x2,y2)
export function haz(ctx, x1, y1, x2, y2, ancho = 300, col = 'rgba(255,226,180,0.22)') {
  const ang = Math.atan2(y2 - y1, x2 - x1), len = Math.hypot(x2 - x1, y2 - y1); ctx.save(); ctx.translate(x1, y1); ctx.rotate(ang); ctx.globalCompositeOperation = 'screen';
  const g = ctx.createLinearGradient(0, 0, len, 0); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(len, -ancho / 2); ctx.lineTo(len, ancho / 2); ctx.lineTo(0, 20); ctx.fill(); ctx.restore();
}
// Motas de polvo / bokeh flotando en la luz
export function motas(ctx, a, n = 26, col = '#ffe2b8', seed = 1) {
  ctx.save(); for (let i = 0; i < n; i++) { const h1 = Math.abs(Math.sin((i + seed) * 91.7)), h2 = Math.abs(Math.sin((i + seed) * 47.3)); const x = (h1 * WW + a.t * (10 + h2 * 20)) % WW, y = (h2 * WH - a.t * (6 + h1 * 10) + WH) % WH;
    ctx.globalAlpha = 0.12 + 0.18 * Math.abs(Math.sin(a.t + i)); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 3 + h1 * 9, 0, 7); ctx.fill(); } ctx.restore();
}

// ---------------- Plantillas de plano ----------------
// Cada una devuelve (ctx, a, K) => {} listo para «export const ancho». Comunes:
//   set: nombre de SET o función; o: opciones del decorado; look: luz (LOOK); quien(a, q): resuelve un personaje
//   antes(ctx,a,K,info) se dibuja tras el fondo; despues(ctx,a,K,info) encima de los personajes (info.A = sus posiciones)
//   texto: { etiqueta, pastilla:[txt,x,y] }
const resolver = (a, q, quien) => (typeof q === 'function' ? q(a) : q && typeof q === 'object' ? q : quien ? quien(a, q) : a.who);
function rotulos(ctx, a, tx) { if (!tx) return; if (tx.etiqueta) etiqueta(ctx, a, tx.etiqueta); if (tx.pastilla) pastilla(ctx, a, ...tx.pastilla); }
function posX(a, s) { if (!Array.isArray(s.anda)) return s.x; const [x0, x1, p0 = 0, p1 = 1] = s.anda; return x0 + (x1 - x0) * sm((a.t / a.d - p0) / (p1 - p0)); }

export const plano = {
  // Plano general/medio: el decorado nítido y los personajes dentro, a escala con puertas y muebles
  general: ({ set, o = {}, look = 'atardecer', z = [1, 1.06], f = [WW / 2, WH / 2], actores = [], gente = 0, antes, despues, delante, quien, texto } = {}) => (ctx, a, K) => {
    inicio(); camara(ctx, a, z[0], z[1], f[0], f[1]); const info = fondo(ctx, a, set, o); const gy = info.gy ?? 980;
    if (gente) people(ctx, a, gy - 150, gente, 0.1, 7, 0.75);
    antes?.(ctx, a, K, info); info.A = [];
    actores.forEach((s, i) => { const x = posX(a, s); info.A[i] = actor(ctx, a, resolver(a, s.q, quien), x, (s.gy ?? gy) + (s.dy || 0), s.esc ?? 1, s.mood || 'neutral', { arms: s.arms, still: s.still || Array.isArray(s.anda), luz: s.luz, slot: i }); });
    delante?.(ctx, a, K, info); acabado(ctx, look); despues?.(ctx, a, K, info); ctx.restore(); rotulos(ctx, a, texto);
  },
  // Primer plano: busto grande, el lugar detrás desenfocado. lado 'der' (por defecto) o 'izq'
  primer: ({ set, o = {}, look = 'atardecer', q, mood = 'neutral', arms, lado = 'der', esc = 1, y = 520, blur = 14, z = [1.02, 1.08], antes, despues, quien, otro, texto } = {}) => (ctx, a, K) => {
    inicio(); const x = lado === 'izq' ? 640 : lado === 'centro' ? 960 : 1280; camara(ctx, a, z[0], z[1], x, y);
    const info = fondo(ctx, a, set, o, { blur, zoom: 1.25, fx: x, fy: 500 }); antes?.(ctx, a, K, info);
    info.B = busto(ctx, a, resolver(a, q, quien), x, y, esc, mood, { arms, luz: lado === 'izq' ? 1 : -1 });
    if (otro) primerTermino(ctx, a, resolver(a, otro, quien), lado === 'izq' ? 1720 : 200, 620, 1.5);
    acabado(ctx, look); despues?.(ctx, a, K, info); ctx.restore(); rotulos(ctx, a, texto);
  },
  // Por encima del hombro: alguien de espaldas borroso en primer término y el otro personaje de cara, enfocado
  hombro: ({ set, o = {}, look = 'atardecer', q, de, mood = 'neutral', arms, lado = 'der', blur = 10, z = [1, 1.05], despues, quien, texto } = {}) => (ctx, a, K) => {
    inicio(); const x = lado === 'izq' ? 700 : 1240; camara(ctx, a, z[0], z[1], x, 520);
    const info = fondo(ctx, a, set, o, { blur, zoom: 1.15, fx: x, fy: 520 });
    info.B = busto(ctx, a, resolver(a, q, quien), x, 470, 0.72, mood, { arms, luz: lado === 'izq' ? 1 : -1 });
    primerTermino(ctx, a, resolver(a, de, quien), lado === 'izq' ? 1650 : 270, 560, 1.6, 12);
    acabado(ctx, look); despues?.(ctx, a, K, info); ctx.restore(); rotulos(ctx, a, texto);
  },
  // Detalle: un objeto (o una mano con algo) llenando la pantalla, el lugar desenfocado detrás
  detalle: ({ set, o = {}, look = 'atardecer', blur = 16, oscuro = 0.12, z = [1.04, 1.12], dibuja, texto } = {}) => (ctx, a, K) => {
    inicio(); camara(ctx, a, z[0], z[1]); const info = fondo(ctx, a, set, o, { blur, zoom: 1.35, oscuro });
    acabado(ctx, look); ctx.save(); ctx.shadowColor = 'rgba(10,4,24,0.45)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20; dibuja?.(ctx, a, K, info); ctx.restore();
    ctx.restore(); rotulos(ctx, a, texto);
  },
  // Dato: el lugar desenfocado y oscurecido detrás, y una cifra, gráfico o lista elegante delante
  dato: ({ set, o = {}, look = 'atardecer', blur = 18, oscuro = 0.38, z = [1, 1.04], titulo, valor, sub, dibuja, texto } = {}) => (ctx, a, K) => {
    inicio(); camara(ctx, a, z[0], z[1]); const info = fondo(ctx, a, set, o, { blur, zoom: 1.2, oscuro }); ctx.restore(); acabado(ctx, look);
    if (titulo) etiqueta(ctx, a, titulo, WW / 2, valor ? 330 : 200, { align: 'center', size: 34 });
    if (valor) cifra(ctx, a, valor, WW / 2, 500, { size: 170 });
    if (sub) etiqueta(ctx, a, sub, WW / 2, 650, { align: 'center', size: 28, color: '#e8cfe8', k: clamp((a.t - 0.5) / 0.4) });
    dibuja?.(ctx, a, K, info); rotulos(ctx, a, texto);
  },
};
export { glow, people, sm, clamp, maleza };
