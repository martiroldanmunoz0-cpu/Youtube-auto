// ESCENARIO: decorados, luz de cine, cámara y rótulos para escenas con varios personajes (gente.mjs).
// Ideas de estilo (no copia): luz de cine con sombras de color y un foco cálido, primer plano desenfocado
// "por encima del hombro", sitios reconocibles (pasillo con taquillas, aula, calle con vallas, ciudad al atardecer,
// restaurante, sala de servidores, dormitorio, puerta iluminada), contadores en pantalla (⏱ 3:00, LOOP 12, ● REC),
// rótulos con el nombre de cada personaje y filas de personajes presentados uno a uno.
// Todas las funciones aceptan W,H (sirven en vertical 1080x1920 y en horizontal 1920x1080).
import { dibuja } from './gente.mjs';

const INK = '#1b1530';
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const fase = (a) => (a.t || 0) / (a.d || 3);
const sm = (k) => k * k * (3 - 2 * k);
function rect(ctx, x, y, w, h, fill, lw = 6, r = 0) { ctx.beginPath(); r ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke(); } }
function poly(ctx, pts, fill, lw = 6) { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke(); } }
function cielo(ctx, W, H, hora) {
  const c = { dia: ['#8fd3ff', '#d9f1ff'], atardecer: ['#5b3a7a', '#f59e6b'], noche: ['#0f1030', '#2c2a5a'] }[hora] || ['#8fd3ff', '#d9f1ff'];
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, c[0]); g.addColorStop(1, c[1]); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (hora === 'noche') { ctx.fillStyle = '#fff'; for (let i = 0; i < 40; i++) ctx.fillRect((i * 397) % W, (i * 211) % (H * 0.5), 3, 3); }
  if (hora === 'atardecer') { ctx.fillStyle = 'rgba(255,214,140,0.9)'; ctx.beginPath(); ctx.arc(W * 0.7, H * 0.55, Math.min(W, H) * 0.09, 0, 7); ctx.fill(); }
}

// ---------- Luz de cine ----------
// tono: 'noche' (azul-morado, foco cálido), 'atardecer' (naranja-lila), 'interior' (lámpara cálida), 'dia' (suave), 'tension' (rojo)
// foco: [x, y] donde cae la luz principal (normalmente la cara del protagonista).
export function luz(ctx, a, { W = 1920, H = 1080, tono = 'interior', foco = null, r = null, vineta = 0.55 } = {}) {
  const T = { noche: ['rgba(40,30,110,0.42)', 'rgba(255,190,120,0.30)'], atardecer: ['rgba(120,50,120,0.22)', 'rgba(255,170,90,0.32)'],
    interior: ['rgba(60,30,80,0.22)', 'rgba(255,200,130,0.30)'], dia: ['rgba(0,0,0,0)', 'rgba(255,250,220,0.18)'], tension: ['rgba(120,10,30,0.32)', 'rgba(255,90,70,0.22)'] }[tono] || [];
  ctx.save();
  ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = T[0]; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'screen';
  const [fx, fy] = foco || [W / 2, H * 0.4], rr = r || Math.max(W, H) * 0.45, puls = 1 + Math.sin((a.t || 0) * 1.3) * 0.02;
  const g = ctx.createRadialGradient(fx, fy, 0, fx, fy, rr * puls); g.addColorStop(0, T[1]); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over';
  const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(10,5,25,${vineta})`); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// ---------- Cámara ----------
// Acerca/aleja y desplaza suavemente durante el plano. dibujar(ctx) pinta la escena entera en coordenadas normales.
//   camara(ctx, a, () => {...}, { de: 1, a: 1.18, foco: [x, y], W, H, temblor: 0 })
export function camara(ctx, a, dibujar, { de = 1, a: hasta = 1.15, foco = null, W = 1920, H = 1080, temblor = 0, f0 = 0, f1 = 1 } = {}) {
  const k = sm(clamp((fase(a) - f0) / (f1 - f0))), z = de + (hasta - de) * k;
  const [fx, fy] = foco || [W / 2, H / 2];
  const sx = temblor ? Math.sin((a.t || 0) * 40) * temblor : 0, sy = temblor ? Math.cos((a.t || 0) * 33) * temblor : 0;
  ctx.save(); ctx.translate(W / 2 + sx, H / 2 + sy); ctx.scale(z, z); ctx.translate(-(W / 2 + (fx - W / 2) * k), -(H / 2 + (fy - H / 2) * k));
  dibujar(ctx); ctx.restore();
}

// Algo desenfocado (primer plano o fondo lejano): desenfocado(ctx, 8, () => K.dibuja(...))
export function desenfocado(ctx, px, dibujar) { ctx.save(); ctx.filter = `blur(${px}px)`; dibujar(ctx); ctx.filter = 'none'; ctx.restore(); }

// Plano "por encima del hombro": un personaje enorme, de espaldas y desenfocado en una esquina de abajo.
// Dibujarlo AL FINAL (encima de todo). lado -1 = esquina izquierda, 1 = derecha.
export function hombro(ctx, a, p, { W = 1920, H = 1080, lado = -1, esc = null, blur = 5 } = {}) {
  const e = esc || H / 460;
  desenfocado(ctx, blur, () => dibuja(ctx, p, lado < 0 ? W * 0.08 : W * 0.92, H * 1.55, e, { t: a.t, pose: 'quieto', mira: lado < 0 ? 1 : -1, espalda: true, sombra: false }));
}

// ---------- Decorados (fondo completo) ----------
// Pasillo de instituto en perspectiva con taquillas de colores a los lados.
export function pasillo(ctx, a, { W = 1920, H = 1080, hora = 'dia' } = {}) {
  const vx = W / 2, vy = H * 0.42, fw = W * 0.16, fh = H * 0.28;
  ctx.fillStyle = '#d9d2c3'; ctx.fillRect(0, 0, W, H);
  poly(ctx, [[0, H], [W, H], [vx + fw / 2, vy + fh / 2], [vx - fw / 2, vy + fh / 2]], '#b9a7c9', 0); // suelo
  for (let i = 0; i < 9; i++) { const k = i / 9; ctx.strokeStyle = 'rgba(27,21,48,0.18)'; ctx.lineWidth = 3; ctx.beginPath(); const y = vy + fh / 2 + (H - vy - fh / 2) * k * k; const hw = fw / 2 + (W / 2 - fw / 2) * k * k; ctx.moveTo(vx - hw, y); ctx.lineTo(vx + hw, y); ctx.stroke(); }
  poly(ctx, [[0, 0], [W, 0], [vx + fw / 2, vy - fh / 2], [vx - fw / 2, vy - fh / 2]], '#efe9dd', 0); // techo
  for (let i = 0; i < 4; i++) { const k = 0.25 + i * 0.22, y = vy - fh / 2 - (vy - fh / 2) * k * 0.95, hw = fw * 0.3 + W * 0.12 * k; rect(ctx, vx - hw, y - 8 * (1 + k * 3), hw * 2, 8 * (1 + k * 3), '#fffbe8', 0); }
  const cols = ['#e05a5a', '#4aa3a2', '#6c7bd9', '#e0a33a'];
  for (const s of [-1, 1]) for (let i = 0; i < 7; i++) { // taquillas
    const k0 = i / 7, k1 = (i + 0.92) / 7, X = (k) => vx + s * (fw / 2 + (W / 2 - fw / 2) * k * k), T = (k) => vy - fh / 2 * (1 - k * k) - (vy - fh / 2) * k * k * 0.55, B = (k) => vy + fh / 2 + (H - vy - fh / 2) * k * k * 0.9;
    poly(ctx, [[X(k0), T(k0)], [X(k1), T(k1)], [X(k1), B(k1)], [X(k0), B(k0)]], cols[i % 4], 4);
    ctx.strokeStyle = 'rgba(27,21,48,0.35)'; ctx.lineWidth = 2; for (let j = 1; j < 4; j++) { const kk = k0 + (k1 - k0) * 0.5; ctx.beginPath(); ctx.moveTo(X(kk) - s * 8, T(kk) + (B(kk) - T(kk)) * j * 0.07 + 20); ctx.lineTo(X(kk) + s * 18 * kk, T(kk) + (B(kk) - T(kk)) * j * 0.07 + 20); ctx.stroke(); }
  }
  rect(ctx, vx - fw / 2, vy - fh / 2, fw, fh, hora === 'noche' ? '#2c2a5a' : '#bfe6ff', 5); // fondo: puerta de cristal
}

// Calle de barrio: casas con valla blanca, farola, árboles. hora: dia | atardecer | noche (ventanas encendidas)
export function calle(ctx, a, { W = 1920, H = 1080, hora = 'dia', suelo = 0.78, coche = false } = {}) {
  cielo(ctx, W, H, hora); const gy = H * suelo, noche = hora === 'noche';
  const casas = Math.max(2, Math.round(W / 520)), cw = W / casas;
  for (let i = 0; i < casas; i++) {
    const x = i * cw + cw * 0.12, w = cw * 0.76, h = H * 0.3, y = gy - h - H * 0.02, col = ['#e9d7b9', '#c9a48b', '#b8c7d9', '#e8c4c4'][i % 4];
    rect(ctx, x, y, w, h, col, 6); poly(ctx, [[x - 20, y], [x + w / 2, y - h * 0.55], [x + w + 20, y]], ['#7a4b3a', '#4d5a7a', '#8a3b3b'][i % 3], 6);
    for (const wx of [0.18, 0.62]) rect(ctx, x + w * wx, y + h * 0.22, w * 0.2, h * 0.28, noche ? '#ffd66b' : '#cfefff', 5);
    rect(ctx, x + w * 0.42, y + h * 0.5, w * 0.16, h * 0.5, '#6b3e26', 5);
  }
  ctx.fillStyle = noche ? '#2d4a2e' : '#7cc46b'; ctx.fillRect(0, gy - H * 0.02, W, H);
  ctx.fillStyle = noche ? '#33334a' : '#9a9aa8'; ctx.fillRect(0, gy + H * 0.08, W, H); ctx.fillStyle = '#e8e2c8'; for (let x = 0; x < W; x += 160) ctx.fillRect(x, gy + H * 0.15, 80, 8);
  ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.fillStyle = noche ? '#cfcfe0' : '#ffffff'; // valla
  for (let x = 10; x < W; x += 34) { ctx.beginPath(); ctx.moveTo(x, gy + 6); ctx.lineTo(x, gy - 60); ctx.lineTo(x + 11, gy - 74); ctx.lineTo(x + 22, gy - 60); ctx.lineTo(x + 22, gy + 6); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  rect(ctx, 0, gy - 44, W, 10, noche ? '#cfcfe0' : '#ffffff', 3);
  const fx = W * 0.82; rect(ctx, fx - 7, gy - H * 0.42, 14, H * 0.42 + 8, '#2b2d42', 4); rect(ctx, fx - 30, gy - H * 0.45, 60, 34, noche ? '#ffe9a8' : '#dfe8ef', 5, 10);
  if (noche) { ctx.save(); ctx.globalCompositeOperation = 'screen'; const g = ctx.createRadialGradient(fx, gy - H * 0.42, 0, fx, gy - H * 0.2, H * 0.4); g.addColorStop(0, 'rgba(255,220,140,0.55)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  if (coche) { const cx = ((a.t || 0) * 260) % (W + 600) - 300, cy = gy + H * 0.14; rect(ctx, cx - 160, cy - 70, 320, 80, '#e05a5a', 6, 26); rect(ctx, cx - 90, cy - 120, 170, 60, '#e05a5a', 6, 20); rect(ctx, cx - 70, cy - 108, 60, 40, '#bfe6ff', 4, 6); rect(ctx, cx + 4, cy - 108, 60, 40, '#bfe6ff', 4, 6);
    for (const wx of [-90, 90]) { ctx.beginPath(); ctx.arc(cx + wx, cy + 12, 30, 0, 7); ctx.fillStyle = INK; ctx.fill(); } if (noche) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = 'rgba(255,240,180,0.35)'; poly(ctx, [[cx + 160, cy - 40], [cx + 700, cy - 160], [cx + 700, cy + 120]], 'rgba(255,240,180,0.35)', 0); ctx.restore(); } }
}

// Ciudad: rascacielos con ventanas encendidas y depósitos de agua en las azoteas.
export function ciudad(ctx, a, { W = 1920, H = 1080, hora = 'atardecer', suelo = 1 } = {}) {
  cielo(ctx, W, H, hora); const base = H * suelo;
  for (const [capa, col, esc] of [[0, '#6a4a7e', 0.75], [1, '#2d1e3e', 1]]) {
    let x = -20, i = capa * 7;
    while (x < W) { const w = 90 + (i * 53 % 90), h = H * (0.25 + ((i * 37) % 40) / 100) * esc; ctx.fillStyle = col; ctx.fillRect(x, base - h, w, h);
      if (capa) { ctx.fillStyle = hora === 'dia' ? '#bfe6ff' : '#ffd66b'; for (let yy = base - h + 18; yy < base - 20; yy += 34) for (let xx = x + 12; xx < x + w - 14; xx += 24) if ((xx * 7 + yy * 3 + i) % 5 > 1) ctx.fillRect(xx, yy, 11, 18);
        if (i % 4 === 1) { rect(ctx, x + w * 0.3, base - h - 44, 36, 30, '#7a4b3a', 3); ctx.fillStyle = INK; ctx.fillRect(x + w * 0.3 + 4, base - h - 14, 4, 14); ctx.fillRect(x + w * 0.3 + 28, base - h - 14, 4, 14); } }
      x += w + 6; i++; }
  }
}

// Interior genérico con pared, suelo de tablas, ventana y lámpara. tipo: 'aula' (pizarra y pupitres), 'dormitorio' (cama y póster),
// 'restaurante' (cortinas rojas, lamparitas cálidas), 'oficina' (cuadro con gráfico y planta), 'servidores' (armarios con luces que parpadean)
export function interior(ctx, a, { W = 1920, H = 1080, tipo: tp = 'oficina', hora = 'dia', suelo = 0.8, texto = null } = {}) {
  const gy = H * suelo, t = a.t || 0;
  const pared = { aula: '#cfe0c3', dormitorio: '#c9d6f0', restaurante: '#5b1f2e', oficina: '#e9e1d3', servidores: '#1c2238' }[tp] || '#e9e1d3';
  ctx.fillStyle = pared; ctx.fillRect(0, 0, W, gy);
  ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(0, gy - H * 0.18, W, H * 0.18 - 8); // zócalo
  ctx.fillStyle = tp === 'servidores' ? '#2a3150' : tp === 'restaurante' ? '#3a1a12' : '#b98a5a'; ctx.fillRect(0, gy, W, H - gy);
  ctx.strokeStyle = 'rgba(27,21,48,0.25)'; ctx.lineWidth = 3; for (let y = gy + 30; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  rect(ctx, -10, gy - 6, W + 20, 12, INK, 0);
  if (tp === 'aula') { rect(ctx, W * 0.25, H * 0.12, W * 0.5, H * 0.36, '#2f4f3a', 10, 8); ctx.fillStyle = '#f4f4e8'; ctx.font = `700 ${Math.round(H * 0.06)}px Poppins`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(texto || 'WHAT IF...?', W / 2, H * 0.3);
    rect(ctx, W * 0.8, H * 0.05, H * 0.12, H * 0.12, '#fff', 6, H * 0.06); ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(W * 0.8 + H * 0.06, H * 0.11); ctx.lineTo(W * 0.8 + H * 0.06, H * 0.07); ctx.moveTo(W * 0.8 + H * 0.06, H * 0.11); ctx.lineTo(W * 0.8 + H * 0.09, H * 0.12); ctx.stroke(); }
  if (tp === 'dormitorio') { rect(ctx, W * 0.08, H * 0.15, W * 0.18, H * 0.3, hora === 'noche' ? '#1b1f4a' : '#bfe6ff', 8, 6); rect(ctx, W * 0.6, H * 0.14, W * 0.12, H * 0.22, '#ffd166', 6); ctx.beginPath(); ctx.arc(W * 0.66, H * 0.25, H * 0.05, 0, 7); ctx.fillStyle = '#ef476f'; ctx.fill();
    rect(ctx, W * 0.55, gy - H * 0.2, W * 0.4, H * 0.2, '#6c7bd9', 6, 12); rect(ctx, W * 0.56, gy - H * 0.26, W * 0.1, H * 0.08, '#fff', 5, 14); }
  if (tp === 'restaurante') { for (const s of [0, 1]) { ctx.fillStyle = '#9b1c2c'; ctx.beginPath(); const x = s ? W : 0, d = s ? -1 : 1; ctx.moveTo(x, 0); ctx.lineTo(x + d * W * 0.16, 0); ctx.quadraticCurveTo(x + d * W * 0.08, H * 0.4, x + d * W * 0.12, gy); ctx.lineTo(x, gy); ctx.fill(); }
    for (let i = 0; i < 5; i++) { const x = W * (0.2 + i * 0.15), y = H * 0.2; ctx.save(); ctx.globalCompositeOperation = 'screen'; const g = ctx.createRadialGradient(x, y, 0, x, y, H * 0.16); g.addColorStop(0, 'rgba(255,200,120,0.5)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - H * 0.2, y - H * 0.2, H * 0.4, H * 0.4); ctx.restore(); ctx.beginPath(); ctx.arc(x, y, 12, 0, 7); ctx.fillStyle = '#ffe2a8'; ctx.fill(); } }
  if (tp === 'oficina') { rect(ctx, W * 0.62, H * 0.12, W * 0.2, H * 0.26, '#fff', 6); ctx.strokeStyle = '#e05a5a'; ctx.lineWidth = 7; ctx.beginPath(); [[0.05, 0.75], [0.3, 0.55], [0.5, 0.65], [0.75, 0.3], [0.95, 0.2]].forEach(([u, v], i) => { const x = W * 0.62 + W * 0.2 * u, y = H * 0.12 + H * 0.26 * v; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
    rect(ctx, W * 0.1, H * 0.12, W * 0.16, H * 0.3, hora === 'noche' ? '#1b1f4a' : '#bfe6ff', 8, 6); rect(ctx, W * 0.9, gy - H * 0.14, W * 0.05, H * 0.14, '#c98a4b', 5); ctx.beginPath(); ctx.arc(W * 0.925, gy - H * 0.2, H * 0.08, 0, 7); ctx.fillStyle = '#6bcb77'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke(); }
  if (tp === 'servidores') for (let i = 0; i < 6; i++) { const x = W * (0.02 + i * 0.165), w = W * 0.14; rect(ctx, x, H * 0.08, w, gy - H * 0.08, '#11152a', 6); for (let j = 0; j < 16; j++) { const y = H * 0.12 + j * (gy - H * 0.16) / 16; ctx.fillStyle = '#2a3150'; ctx.fillRect(x + 10, y, w - 20, (gy - H * 0.16) / 16 - 6); for (let k = 0; k < 3; k++) { const on = Math.sin(t * (3 + k) + i * 7 + j * 3) > 0.2; ctx.fillStyle = on ? ['#4dff88', '#4dc3ff', '#ffd93d'][k] : '#1a1f38'; ctx.fillRect(x + 18 + k * 16, y + 6, 9, 9); } } }
}

// Puerta iluminada en una pared oscura (encuadre estrecho dentro del plano: alguien aparece en la puerta).
// Devuelve el rectángulo de la puerta {x, y, w, h, gy} para colocar al personaje dentro.
export function puerta(ctx, a, { W = 1920, H = 1080, x = null, ancho = null, col = '#e2d6c2', abre = 1, pared = '#2a1d2e' } = {}) {
  const w = ancho || Math.min(W, H) * 0.42, h = H * 0.82, px = (x ?? W / 2) - w / 2, py = H * 0.1;
  ctx.fillStyle = pared; ctx.fillRect(0, 0, W, H);
  rect(ctx, px, py, w, h, col, 0); const g = ctx.createLinearGradient(0, py, 0, py + h); g.addColorStop(0, 'rgba(255,255,255,0.25)'); g.addColorStop(1, 'rgba(0,0,0,0.15)'); ctx.fillStyle = g; ctx.fillRect(px, py, w, h);
  const k = clamp(abre); poly(ctx, [[px, py], [px - w * 0.35 * k, py - h * 0.05 * k], [px - w * 0.35 * k, py + h + h * 0.05 * k], [px, py + h]], '#7a3b3b', 5);
  rect(ctx, px - 14, py - 14, w + 28, h + 14, null, 14);
  ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = 'rgba(255,230,180,0.12)'; poly(ctx, [[px, py + h], [px + w, py + h], [px + w * 1.6, H], [px - w * 0.6, H]], 'rgba(255,230,180,0.12)', 0); ctx.restore();
  return { x: px, y: py, w, h, gy: py + h };
}

// ---------- Rótulos y contadores en pantalla ----------
// Pastilla con icono: icono 'reloj' (⏱ 3:00), 'loop' (LOOP 12), 'rec' (● REC 02:43 AM, parpadea), 'dinero', null
export function contador(ctx, a, txt, x, y, { icono = 'reloj', size = 40, col = '#1b1530', p0 = 0 } = {}) {
  const k = clamp((fase(a) - p0) / 0.06); if (k <= 0) return;
  ctx.save(); ctx.font = `800 ${size}px Poppins`; const tw = ctx.measureText(txt).width, ic = icono ? size * 1.1 : 0, w = tw + ic + size * 1.2, h = size * 1.55;
  ctx.translate(x, y); ctx.scale(k, k); rect(ctx, -w / 2, -h / 2, w, h, icono === 'rec' ? 'rgba(20,10,20,0.75)' : col, 5, h / 2);
  const ix = -w / 2 + size * 0.6 + ic / 2;
  ctx.strokeStyle = '#fff'; ctx.fillStyle = '#ff4d5e'; ctx.lineWidth = size * 0.12;
  if (icono === 'reloj') { ctx.strokeStyle = '#ff4d5e'; ctx.beginPath(); ctx.arc(ix, 0, size * 0.38, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(ix, 0); ctx.lineTo(ix, -size * 0.25); ctx.stroke(); }
  if (icono === 'loop') { ctx.beginPath(); ctx.arc(ix, 0, size * 0.36, 0.5, Math.PI * 1.85); ctx.stroke(); }
  if (icono === 'rec' && Math.sin((a.t || 0) * 6) > -0.3) { ctx.beginPath(); ctx.arc(ix, 0, size * 0.28, 0, 7); ctx.fill(); }
  if (icono === 'dinero') { ctx.fillStyle = '#4dff88'; ctx.font = `900 ${size}px Poppins`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('$', ix, size * 0.05); }
  ctx.fillStyle = '#fff'; ctx.font = `800 ${size}px Poppins`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(txt, -w / 2 + size * 0.6 + ic, size * 0.06);
  ctx.restore();
}

// Rótulo con el nombre de un personaje (debajo o encima de él). Útil en pantallas partidas: 'YOU' / 'THE BOSS'
export function rotulo(ctx, a, txt, x, y, { size = 34, col = '#ffffff', fondo = 'rgba(20,12,30,0.8)', p0 = 0 } = {}) {
  const k = clamp((fase(a) - p0) / 0.06); if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k; ctx.font = `800 ${size}px Poppins`; const w = ctx.measureText(txt).width + size * 1.2, h = size * 1.5;
  ctx.translate(x, y + (1 - k) * 20); rect(ctx, -w / 2, -h / 2, w, h, fondo, 0, 8); ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, size * 0.06); ctx.restore();
}

// Fila de personajes presentados uno a uno (entran de un saltito) con su nombre debajo.
// personas: [p, ...] de K.reparto; nombres: ['YOU', 'MOM', ...]; poses/moods opcionales por personaje.
export function fila(ctx, a, personas, { x0 = 200, x1 = 1720, gy = 900, esc = 1, nombres = [], poses = [], moods = [], paso = 0.08, f0 = 0.05, mira = 0 } = {}) {
  const n = personas.length, out = [];
  personas.forEach((p, i) => {
    const k = clamp((fase(a) - f0 - i * paso) / 0.07); if (k <= 0) return;
    const x = n === 1 ? (x0 + x1) / 2 : x0 + (x1 - x0) * i / (n - 1), salto = Math.sin(k * Math.PI) * 60 * esc;
    const info = dibuja(ctx, p, x, gy - salto, esc * (0.7 + 0.3 * k), { t: a.t, pose: poses[i] || (k < 1 ? 'salta' : 'quieto'), mood: moods[i] || 'neutral', mira: mira === 'centro' ? Math.sign((x0 + x1) / 2 - x) : mira });
    if (nombres[i]) rotulo(ctx, a, nombres[i], x, gy + 50 * esc, { size: 30 * Math.max(0.8, esc), p0: f0 + i * paso + 0.04 });
    out.push(info);
  });
  return out;
}

export const ESCENARIO = { luz, camara, desenfocado, hombro, pasillo, calle, ciudad, interior, puerta, contador, rotulo, fila };
