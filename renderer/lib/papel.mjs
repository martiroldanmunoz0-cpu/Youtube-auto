// PAPEL: estilo «recortable» de la prueba nueva (referencia de calidad: personajes bajitos de cabeza grande,
// caras muy expresivas, sombras suaves, contorno fino y escenarios con mucho detalle y profundidad).
// Personajes propios del canal: no copian a nadie.
//   personaje(ctx, t, spec, x, y, s, pose)   x,y = pies; s = escala (1 ≈ 520 px de alto)
//   laboratorio(ctx, t, cam)                  escenario detallado con capas de profundidad
export const W = 1080, H = 1920;
export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, k) => a + (b - a) * k;
export const ease = (k) => { k = clamp(k); return k * k * (3 - 2 * k); };
export const back = (k) => { k = clamp(k); const c = 1.7; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
export const ph = (t, a, b) => clamp((t - a) / (b - a));
const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

export function tono(hex, k) { // k>0 aclara, k<0 oscurece
  const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const f = (c) => Math.round(k > 0 ? c + (255 - c) * k : c * (1 + k));
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}
const LINEA = 'rgba(40,30,28,0.85)';
function rr(ctx, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
// Relleno con volumen: color base + luz arriba-izquierda + sombra abajo-derecha + contorno fino
function volumen(ctx, col, bx, by, bw, bh, lw = 4) {
  ctx.fillStyle = col; ctx.fill();
  ctx.save(); ctx.clip();
  const g = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
  g.addColorStop(0, 'rgba(255,255,255,0.28)'); g.addColorStop(0.45, 'rgba(255,255,255,0)'); g.addColorStop(0.7, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(40,20,40,0.30)');
  ctx.fillStyle = g; ctx.fillRect(bx - 5, by - 5, bw + 10, bh + 10); ctx.restore();
  if (lw) { ctx.strokeStyle = LINEA; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.stroke(); }
}
function elipse(ctx, x, y, rx, ry, col, lw = 4, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); volumen(ctx, col, x - rx, y - ry, rx * 2, ry * 2, lw); }

// ---------------- PERSONAJES ----------------
export const REPARTO = {
  // Científica protagonista: bata, gafas de laboratorio en la frente, moño
  DRA: { skin: '#f2c9a5', hair: 'mono', hairCol: '#5a2e1c', ropa: '#3f6fb5', bata: true, pants: '#3b3550', shoes: '#2c2433', gafasLab: true, mujer: true },
  // Ayudante: pelo de punta, sudadera
  TOM: { skin: '#b9825a', hair: 'punta', hairCol: '#1d1512', ropa: '#e2683c', bata: false, pants: '#4a5a6e', shoes: '#f1ece4', gorro: false },
};

function ik(sx, sy, tx, ty, l1, l2, flip) {
  let dx = tx - sx, dy = ty - sy; let d = Math.hypot(dx, dy); const max = l1 + l2 - 0.5;
  if (d > max) { dx *= max / d; dy *= max / d; d = max; }
  const a = Math.atan2(dy, dx); const c = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1);
  const a1 = a + (flip ? -1 : 1) * Math.acos(c);
  const ex = sx + Math.cos(a1) * l1, ey = sy + Math.sin(a1) * l1;
  return [ex, ey, sx + dx, sy + dy];
}
function brazo(ctx, sp, sx, sy, hx, hy, flip, manga) {
  const [ex, ey, wx, wy] = ik(sx, sy, hx, hy, 78, 74, flip);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = LINEA; ctx.lineWidth = 46; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.lineTo(wx, wy); ctx.stroke();
  ctx.strokeStyle = manga; ctx.lineWidth = 38; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(sx - 8, sy - 6); ctx.lineTo(ex - 8, ey - 6); ctx.stroke();
  // puño de la manga
  ctx.beginPath(); ctx.arc(wx, wy, 21, 0, Math.PI * 2); ctx.fillStyle = tono(manga, -0.15); ctx.fill();
  // mano en manopla con pulgar
  const an = Math.atan2(wy - ey, wx - ex); const hx2 = wx + Math.cos(an) * 20, hy2 = wy + Math.sin(an) * 20;
  elipse(ctx, hx2 + Math.cos(an - (flip ? -1.2 : 1.2)) * 18, hy2 + Math.sin(an - (flip ? -1.2 : 1.2)) * 18, 11, 9, sp.skin, 3, an);
  elipse(ctx, hx2, hy2, 24, 21, sp.skin, 4, an);
  return [hx2, hy2];
}
const BOCAS = ['cerrada', 'a', 'o', 'e', 'a', 'cerrada', 'o'];
function boca(ctx, tipo, x, y, w) {
  ctx.lineCap = 'round'; ctx.strokeStyle = '#3a1f1c'; ctx.lineWidth = 5;
  const abierta = (rx, ry, dy = 0) => { ctx.beginPath(); ctx.ellipse(x, y + dy, rx, ry, 0, 0, Math.PI * 2); ctx.fillStyle = '#5a1f22'; ctx.fill(); ctx.save(); ctx.clip(); ctx.fillStyle = '#e0656b'; ctx.beginPath(); ctx.ellipse(x, y + dy + ry * 0.75, rx * 0.7, ry * 0.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillRect(x - rx, y + dy - ry, rx * 2, ry * 0.45); ctx.restore(); ctx.beginPath(); ctx.ellipse(x, y + dy, rx, ry, 0, 0, Math.PI * 2); ctx.stroke(); };
  if (tipo === 'cerrada') { ctx.beginPath(); ctx.moveTo(x - w * 0.35, y); ctx.quadraticCurveTo(x, y + 6, x + w * 0.35, y); ctx.stroke(); }
  else if (tipo === 'sonrisa') { ctx.beginPath(); ctx.moveTo(x - w * 0.45, y - 4); ctx.quadraticCurveTo(x, y + 22, x + w * 0.45, y - 4); ctx.stroke(); }
  else if (tipo === 'triste') { ctx.beginPath(); ctx.moveTo(x - w * 0.35, y + 8); ctx.quadraticCurveTo(x, y - 8, x + w * 0.35, y + 8); ctx.stroke(); }
  else if (tipo === 'a') abierta(w * 0.32, w * 0.24, 4);
  else if (tipo === 'e') abierta(w * 0.4, w * 0.14, 2);
  else if (tipo === 'o') abierta(w * 0.2, w * 0.26, 6);
  else if (tipo === 'grito') abierta(w * 0.42, w * 0.4, 12);
  else if (tipo === 'apretada') { rr(ctx, x - w * 0.42, y - 12, w * 0.84, 26, 10); ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x - w * 0.42, y + 1); ctx.lineTo(x + w * 0.42, y + 1); for (let i = -2; i <= 2; i++) { ctx.moveTo(x + i * w * 0.15, y - 12); ctx.lineTo(x + i * w * 0.15, y + 14); } ctx.lineWidth = 3; ctx.stroke(); }
}
// pose: { manoI:[x,y], manoD:[x,y] (relativas a los pies, sin escalar), mood, boca, habla, mira:[dx,dy], incl, salto, aplasta }
export function personaje(ctx, t, sp, x, y, s, pose = {}) {
  const mood = pose.mood || 'neutral';
  const resp = Math.sin(t * 2.6 + x * 0.01) * 0.012;
  const aplasta = pose.aplasta || 0;
  ctx.save(); ctx.translate(x, y);
  // sombra en el suelo
  ctx.fillStyle = 'rgba(30,20,40,0.22)'; ctx.beginPath(); ctx.ellipse(0, 4, 120 * s, 22 * s, 0, 0, Math.PI * 2); ctx.fill();
  ctx.translate(0, -(pose.salto || 0)); ctx.scale(s * (1 + aplasta * 0.08), s * (1 + resp - aplasta * 0.08)); ctx.rotate(pose.incl || 0);
  // piernas y zapatos
  for (const k of [-1, 1]) { rr(ctx, k * 46 - 22, -78, 44, 70, 16); volumen(ctx, sp.pants, k * 46 - 22, -78, 44, 70); elipse(ctx, k * 50 + k * 8, -6, 38, 18, sp.shoes, 4); }
  // cuerpo (trapecio redondeado)
  const body = () => { ctx.beginPath(); ctx.moveTo(-80, -262); ctx.quadraticCurveTo(0, -282, 80, -262); ctx.quadraticCurveTo(112, -160, 104, -78); ctx.quadraticCurveTo(0, -56, -104, -78); ctx.quadraticCurveTo(-112, -160, -80, -262); ctx.closePath(); };
  const sx = 84, sy = -240;
  const manoI = pose.manoI || [-120 + Math.sin(t * 2.2) * 4, -120];
  const manoD = pose.manoD || [120 - Math.sin(t * 2.2 + 1) * 4, -120];
  body(); volumen(ctx, sp.bata ? '#f4f1ea' : sp.ropa, -112, -282, 224, 226, 5);
  if (sp.bata) { // bata: solapas, camisa, botones, bolsillo con bolis
    ctx.beginPath(); ctx.moveTo(-34, -270); ctx.lineTo(0, -170); ctx.lineTo(34, -270); ctx.closePath(); ctx.fillStyle = sp.ropa; ctx.fill(); ctx.strokeStyle = LINEA; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-34, -270); ctx.lineTo(-10, -175); ctx.moveTo(34, -270); ctx.lineTo(10, -175); ctx.moveTo(0, -170); ctx.lineTo(0, -66); ctx.strokeStyle = 'rgba(60,50,60,0.45)'; ctx.lineWidth = 4; ctx.stroke();
    for (const by of [-150, -115, -85]) { ctx.beginPath(); ctx.arc(12, by, 6, 0, 7); ctx.fillStyle = '#cfc6b8'; ctx.fill(); }
    rr(ctx, 36, -205, 44, 40, 6); ctx.fillStyle = '#e6e1d6'; ctx.fill(); ctx.strokeStyle = 'rgba(60,50,60,0.4)'; ctx.lineWidth = 3; ctx.stroke();
    [['#d6453d', 46], ['#3a74c9', 58], ['#2f9e6a', 70]].forEach(([c, px]) => { rr(ctx, px - 4, -222, 8, 24, 3); ctx.fillStyle = c; ctx.fill(); });
  } else { // sudadera: cuello, bolsillo canguro, cordones
    ctx.beginPath(); ctx.ellipse(0, -262, 46, 14, 0, 0, Math.PI * 2); ctx.fillStyle = tono(sp.ropa, -0.25); ctx.fill();
    rr(ctx, -56, -150, 112, 52, 18); ctx.strokeStyle = 'rgba(60,30,30,0.35)'; ctx.lineWidth = 4; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-14, -256); ctx.lineTo(-18, -200); ctx.moveTo(14, -256); ctx.lineTo(18, -200); ctx.strokeStyle = '#f5efe6'; ctx.lineWidth = 5; ctx.stroke();
  }
  const manga = sp.bata ? '#f4f1ea' : sp.ropa;
  const pI = brazo(ctx, sp, -sx + 10, sy, manoI[0], manoI[1], false, manga);
  const pD = brazo(ctx, sp, sx - 10, sy, manoD[0], manoD[1], true, manga);
  // cabeza
  ctx.save(); ctx.translate(0, -262); ctx.rotate((pose.cabeza || 0) + Math.sin(t * 1.7) * 0.02);
  const hy = -118;
  if (sp.hair === 'mono') { elipse(ctx, 0, hy - 118, 46, 40, sp.hairCol, 4); }
  if (sp.mujer) { ctx.beginPath(); ctx.ellipse(0, hy + 4, 132, 120, 0, 0, Math.PI * 2); ctx.fillStyle = sp.hairCol; ctx.fill(); ctx.strokeStyle = LINEA; ctx.lineWidth = 4; ctx.stroke(); }
  elipse(ctx, -124, hy + 6, 16, 22, tono(sp.skin, -0.08), 4); elipse(ctx, 124, hy + 6, 16, 22, tono(sp.skin, -0.08), 4);
  elipse(ctx, 0, hy, 124, 112, sp.skin, 5);
  // mejillas
  ctx.fillStyle = 'rgba(240,110,110,0.28)'; ctx.beginPath(); ctx.ellipse(-70, hy + 40, 22, 13, 0, 0, 7); ctx.ellipse(70, hy + 40, 22, 13, 0, 0, 7); ctx.fill();
  // pelo delantero
  ctx.save(); ctx.beginPath(); ctx.ellipse(0, hy, 124, 112, 0, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = sp.hairCol;
  if (sp.hair === 'mono') { ctx.beginPath(); ctx.moveTo(-130, hy - 10); ctx.quadraticCurveTo(-60, hy - 140, 40, hy - 70); ctx.quadraticCurveTo(100, hy - 110, 130, hy - 20); ctx.lineTo(130, hy - 130); ctx.lineTo(-130, hy - 130); ctx.closePath(); ctx.fill(); }
  if (sp.hair === 'punta') { ctx.beginPath(); ctx.moveTo(-130, hy - 30); for (let i = 0; i <= 8; i++) ctx.lineTo(-130 + i * 32.5, hy - (i % 2 ? 62 : 32)); ctx.lineTo(130, hy - 130); ctx.lineTo(-130, hy - 130); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  if (sp.hair === 'punta') { ctx.fillStyle = sp.hairCol; for (let i = 0; i < 6; i++) { const px = -90 + i * 36; ctx.beginPath(); ctx.moveTo(px - 26, hy - 98 + Math.abs(px) * 0.3); ctx.lineTo(px + 4, hy - 150 + Math.abs(px) * 0.35); ctx.lineTo(px + 26, hy - 98 + Math.abs(px) * 0.3); ctx.fill(); } }
  // ojos grandes juntos con párpados (parpadeo + humor)
  const parp = (t % 3.7) < 0.12 || pose.cierra ? 1 : 0;
  const [mx, my] = pose.mira || [0, 0];
  const abre = mood === 'sorpresa' || mood === 'miedo' ? 1.18 : 1;
  for (const k of [-1, 1]) {
    const ex = k * 40, ey = hy - 4;
    ctx.beginPath(); ctx.ellipse(ex, ey, 34, 38 * abre, 0, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = LINEA; ctx.lineWidth = 4; ctx.stroke();
    ctx.save(); ctx.clip();
    const pr = mood === 'sorpresa' || mood === 'miedo' ? 11 : 14;
    ctx.beginPath(); ctx.arc(ex + mx * 12 - k * 4, ey + 6 + my * 12, pr + 4, 0, 7); ctx.fillStyle = '#4b7fc4'; ctx.fill();
    ctx.beginPath(); ctx.arc(ex + mx * 12 - k * 4, ey + 6 + my * 12, pr - 2, 0, 7); ctx.fillStyle = '#1b1620'; ctx.fill();
    ctx.beginPath(); ctx.arc(ex + mx * 12 - k * 4 - 5, ey + my * 12, 5, 0, 7); ctx.fillStyle = '#fff'; ctx.fill();
    // párpado superior: enfado = inclinado hacia dentro, cansado = medio cerrado
    let lid = parp ? 1 : mood === 'enfado' || mood === 'esfuerzo' ? 0.42 : mood === 'aburrido' ? 0.55 : mood === 'sorpresa' || mood === 'miedo' ? 0 : 0.18;
    ctx.fillStyle = sp.skin; ctx.beginPath();
    const ang = mood === 'enfado' || mood === 'esfuerzo' ? k * -0.35 : mood === 'triste' || mood === 'miedo' ? k * 0.3 : 0;
    ctx.save(); ctx.translate(ex, ey - 40 * abre + lid * 78 * abre); ctx.rotate(ang); ctx.fillRect(-50, -90, 100, 90); ctx.restore();
    ctx.restore();
    ctx.beginPath(); ctx.ellipse(ex, ey, 34, 38 * abre, 0, 0, Math.PI * 2); ctx.strokeStyle = LINEA; ctx.lineWidth = 4; ctx.stroke();
    if (lid > 0.05) { ctx.save(); ctx.beginPath(); ctx.ellipse(ex, ey, 34, 38 * abre, 0, 0, Math.PI * 2); ctx.clip(); ctx.translate(ex, ey - 40 * abre + lid * 78 * abre); ctx.rotate(ang); ctx.beginPath(); ctx.moveTo(-50, 0); ctx.lineTo(50, 0); ctx.strokeStyle = LINEA; ctx.lineWidth = 5; ctx.stroke(); ctx.restore(); }
    // ceja
    const by = ey - 56 * abre - (mood === 'sorpresa' ? 14 : 0);
    const ba = mood === 'enfado' || mood === 'esfuerzo' ? k * -0.4 : mood === 'triste' || mood === 'miedo' ? k * 0.35 : k * 0.05;
    ctx.save(); ctx.translate(ex, by); ctx.rotate(ba); rr(ctx, -26, -6, 52, 12, 6); ctx.fillStyle = tono(sp.hairCol, -0.1); ctx.fill(); ctx.restore();
  }
  // nariz
  ctx.beginPath(); ctx.ellipse(0, hy + 36, 12, 9, 0, 0, Math.PI * 2); ctx.fillStyle = tono(sp.skin, -0.12); ctx.fill();
  // boca: habla = alterna formas; si no, la del humor
  let bt = pose.boca || ({ feliz: 'sonrisa', sorpresa: 'o', miedo: 'grito', enfado: 'apretada', esfuerzo: 'apretada', triste: 'triste' }[mood] || 'cerrada');
  if (pose.habla) bt = BOCAS[Math.floor(t * 11 + hash(Math.floor(t * 11)) * 3) % BOCAS.length];
  boca(ctx, bt, 0, hy + 66, 70);
  // gafas de laboratorio en la frente
  if (sp.gafasLab) { ctx.save(); ctx.translate(0, hy - 74); rr(ctx, -112, -6, 224, 14, 6); ctx.fillStyle = '#3d3a44'; ctx.fill(); for (const k of [-1, 1]) { ctx.beginPath(); ctx.ellipse(k * 40, 0, 34, 24, 0, 0, 7); ctx.fillStyle = '#2d2b33'; ctx.fill(); ctx.beginPath(); ctx.ellipse(k * 40, 0, 26, 17, 0, 0, 7); const g = ctx.createLinearGradient(k * 40 - 26, -17, k * 40 + 26, 17); g.addColorStop(0, '#bfeaf5'); g.addColorStop(1, '#5aa9c4'); ctx.fillStyle = g; ctx.fill(); ctx.beginPath(); ctx.moveTo(k * 40 - 14, -8); ctx.lineTo(k * 40 - 2, -12); ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 4; ctx.stroke(); } ctx.restore(); }
  // gotas de sudor / esfuerzo
  if (mood === 'esfuerzo' || mood === 'miedo') for (let i = 0; i < 2; i++) { const k2 = ((t * 1.4 + i * 0.5) % 1); ctx.globalAlpha = 1 - k2; ctx.beginPath(); const dx = (i ? 1 : -1) * 128, dy = hy - 60 + k2 * 70; ctx.moveTo(dx, dy - 16); ctx.quadraticCurveTo(dx + 12, dy + 4, dx, dy + 8); ctx.quadraticCurveTo(dx - 12, dy + 4, dx, dy - 16); ctx.fillStyle = '#8fd3ff'; ctx.fill(); ctx.strokeStyle = LINEA; ctx.lineWidth = 2; ctx.stroke(); ctx.globalAlpha = 1; }
  ctx.restore();
  ctx.restore();
  // devuelve la posición de las manos en coordenadas de pantalla (aprox.)
  const m = (p) => [x + p[0] * s, y - (pose.salto || 0) + p[1] * s];
  return { manoI: m(pI), manoD: m(pD), cabeza: [x, y - (262 + 118) * s] };
}

// ---------------- ESCENARIO: laboratorio con capas ----------------
// cam: { z, fx, fy } zoom y punto de foco; cada capa se desplaza según su profundidad (paralaje).
export function capa(ctx, cam, prof, fn) {
  ctx.save();
  // encuadre vertical: acerca la escena para que los personajes llenen la parte de abajo del Short
  ctx.translate(W / 2, 1700); ctx.scale(1.3, 1.3); ctx.translate(-W / 2, -1460);
  const z = 1 + (cam.z - 1) * prof; const ox = (W / 2 - cam.fx) * prof * 0.5, oy = (H / 2 - cam.fy) * prof * 0.3;
  ctx.translate(W / 2 + ox, H / 2 + oy); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
  if (cam.temblor) ctx.translate(Math.sin(cam.t * 47) * cam.temblor, Math.cos(cam.t * 39) * cam.temblor);
  fn(); ctx.restore();
}
export const SUELO = 1420;
export function laboratorio(ctx, t, cam, opt = {}) {
  // fondo: pared con zócalo, ventana redonda con estrellas, pizarra, estanterías
  capa(ctx, cam, 0.55, () => {
    const g = ctx.createLinearGradient(0, 0, 0, SUELO); g.addColorStop(0, '#d8cdb8'); g.addColorStop(1, '#efe6d3');
    ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, SUELO + 300);
    // paneles de pared
    for (let i = -2; i < 8; i++) { rr(ctx, i * 180 + 20, 120, 150, 640, 10); ctx.strokeStyle = 'rgba(120,100,80,0.18)'; ctx.lineWidth = 5; ctx.stroke(); }
    ctx.fillStyle = '#7d5c45'; ctx.fillRect(-300, 1060, W + 600, 360); ctx.fillStyle = '#6a4c38'; ctx.fillRect(-300, 1060, W + 600, 18);
    for (let i = -3; i < 14; i++) { ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(i * 90, 1078, 4, 342); }
    // ventana redonda con cielo nocturno y planeta
    const wx = 820, wy = 400, wr = 190;
    ctx.save(); ctx.beginPath(); ctx.arc(wx, wy, wr, 0, 7); ctx.clip();
    const sg = ctx.createLinearGradient(0, wy - wr, 0, wy + wr); sg.addColorStop(0, '#0d1238'); sg.addColorStop(1, '#3b2a6e'); ctx.fillStyle = sg; ctx.fillRect(wx - wr, wy - wr, wr * 2, wr * 2);
    for (let i = 0; i < 40; i++) { const px = wx - wr + hash(i) * wr * 2, py = wy - wr + hash(i + 50) * wr * 2; ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 3 + i); ctx.fillStyle = '#fff'; ctx.fillRect(px, py, 3, 3); }
    ctx.globalAlpha = 1;
    // estrella de neutrones lejana con pulsos
    const nx = wx - 60, ny = wy + 30; const pg = ctx.createRadialGradient(nx, ny, 2, nx, ny, 70); pg.addColorStop(0, '#ffffff'); pg.addColorStop(0.2, '#9fe6ff'); pg.addColorStop(1, 'rgba(60,140,255,0)');
    ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(nx, ny, 70, 0, 7); ctx.fill();
    ctx.save(); ctx.translate(nx, ny); ctx.rotate(t * 1.5); ctx.fillStyle = 'rgba(160,230,255,0.35)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-12, -170); ctx.lineTo(12, -170); ctx.closePath(); ctx.moveTo(0, 0); ctx.lineTo(-12, 170); ctx.lineTo(12, 170); ctx.closePath(); ctx.fill(); ctx.restore();
    elipse(ctx, wx + 90, wy - 90, 46, 46, '#e0a35c', 0);
    ctx.restore();
    ctx.beginPath(); ctx.arc(wx, wy, wr, 0, 7); ctx.strokeStyle = '#8a8f9c'; ctx.lineWidth = 26; ctx.stroke(); ctx.strokeStyle = LINEA; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(wx, wy, wr + 13, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(wx, wy, wr - 13, 0, 7); ctx.stroke();
    for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; ctx.beginPath(); ctx.arc(wx + Math.cos(a) * wr, wy + Math.sin(a) * wr, 6, 0, 7); ctx.fillStyle = '#5c606b'; ctx.fill(); }
    // pizarra con fórmulas
    rr(ctx, 40, 230, 470, 330, 14); ctx.fillStyle = '#7a5537'; ctx.fill(); rr(ctx, 58, 248, 434, 294, 8); ctx.fillStyle = '#2f4a3f'; ctx.fill();
    ctx.fillStyle = 'rgba(240,240,230,0.85)'; ctx.font = '38px Poppins'; ctx.fillText('ρ = 4 × 10^17 kg/m³', 84, 320); ctx.fillText('1 tsp = 10^9 t', 84, 380);
    ctx.strokeStyle = 'rgba(240,240,230,0.75)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(400, 470, 44, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(90, 470); ctx.quadraticCurveTo(200, 420, 330, 470); ctx.stroke();
    ctx.fillStyle = '#e9e4d8'; ctx.fillRect(120, 542, 60, 10);
    // estantería con frascos que brillan y libros
    for (const sy of [700, 880]) { rr(ctx, 30, sy, 520, 22, 4); ctx.fillStyle = '#8b6446'; ctx.fill(); ctx.strokeStyle = LINEA; ctx.lineWidth = 3; ctx.stroke(); }
    const cols = ['#c94f4f', '#3b6fb0', '#e0a640', '#4f9a6b', '#7a4fa0', '#d07a3a'];
    for (let i = 0; i < 9; i++) { const bx = 50 + i * 26; rr(ctx, bx, 590 + (i % 3) * 8, 22, 110 - (i % 3) * 8, 3); ctx.fillStyle = cols[i % 6]; ctx.fill(); ctx.strokeStyle = LINEA; ctx.lineWidth = 2; ctx.stroke(); }
    const fr = [['#7de8c8', 330], ['#ff9ad1', 400], ['#ffe27a', 470]];
    fr.forEach(([c, fx], i) => { const fy = 700; const glow = 0.5 + 0.3 * Math.sin(t * 2 + i);
      ctx.fillStyle = `rgba(255,255,255,0.5)`; rr(ctx, fx - 26, fy - 110, 52, 110, 14); ctx.fill(); ctx.strokeStyle = LINEA; ctx.lineWidth = 3; ctx.stroke();
      rr(ctx, fx - 22, fy - 70, 44, 66, 10); ctx.globalAlpha = glow + 0.3; ctx.fillStyle = c; ctx.fill(); ctx.globalAlpha = 1; rr(ctx, fx - 14, fy - 124, 28, 18, 4); ctx.fillStyle = '#8b6446'; ctx.fill(); });
    for (let i = 0; i < 4; i++) { const bx = 60 + i * 120; ctx.beginPath(); ctx.moveTo(bx, 880); ctx.lineTo(bx + 30, 790); ctx.lineTo(bx + 60, 880); ctx.closePath(); ctx.fillStyle = ['#cdd6e0', '#e9c7a0', '#b9d8c0', '#d8c0e0'][i]; ctx.fill(); ctx.strokeStyle = LINEA; ctx.lineWidth = 3; ctx.stroke(); }
    // reloj de pared
    elipse(ctx, 640, 260, 60, 60, '#f7f2e6', 5); ctx.save(); ctx.translate(640, 260); ctx.strokeStyle = '#333'; ctx.lineWidth = 5; ctx.rotate(t * 0.4); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -42); ctx.stroke(); ctx.rotate(-t * 0.4 + t * 0.05); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(28, 0); ctx.stroke(); ctx.restore();
  });
  // lámparas colgantes con conos de luz
  capa(ctx, cam, 0.75, () => {
    for (const lx of [300, 780]) {
      ctx.strokeStyle = '#3a3440'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(lx, -300); ctx.lineTo(lx, 90); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(lx - 70, 160); ctx.quadraticCurveTo(lx, 50, lx + 70, 160); ctx.closePath(); volumen(ctx, '#3f6b5c', lx - 70, 80, 140, 80, 4);
      const lg = ctx.createLinearGradient(0, 160, 0, SUELO); lg.addColorStop(0, 'rgba(255,240,190,0.35)'); lg.addColorStop(1, 'rgba(255,240,190,0)');
      ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(lx - 60, 160); ctx.lineTo(lx + 60, 160); ctx.lineTo(lx + 330, SUELO); ctx.lineTo(lx - 330, SUELO); ctx.closePath(); ctx.fill();
      elipse(ctx, lx, 162, 34, 10, '#fff6cf', 0);
    }
  });
  // suelo de baldosas en perspectiva
  capa(ctx, cam, 1, () => {
    const g = ctx.createLinearGradient(0, SUELO - 60, 0, H + 300); g.addColorStop(0, '#b9a58a'); g.addColorStop(1, '#8f7c63'); ctx.fillStyle = g; ctx.fillRect(-400, SUELO - 60, W + 800, H);
    ctx.strokeStyle = 'rgba(70,50,40,0.25)'; ctx.lineWidth = 3;
    for (let i = -12; i <= 12; i++) { ctx.beginPath(); ctx.moveTo(W / 2 + i * 60, SUELO - 60); ctx.lineTo(W / 2 + i * 260, H + 300); ctx.stroke(); }
    for (let j = 0; j < 8; j++) { const yy = SUELO - 60 + Math.pow(j / 7, 1.7) * 900; ctx.beginPath(); ctx.moveTo(-400, yy); ctx.lineTo(W + 400, yy); ctx.stroke(); }
    ctx.fillStyle = '#5e4636'; ctx.fillRect(-400, SUELO - 70, W + 800, 12);
  });
  if (opt.hueco) opt.hueco();
}
// mesa de laboratorio delante (se dobla con comba)
export function mesaLab(ctx, x, y, w, comba = 0) {
  ctx.save(); ctx.lineCap = 'round';
  for (const k of [-1, 1]) { rr(ctx, x + k * (w / 2 - 40) - 16 + k * comba * 0.15, y + 30, 32, SUELO - y + 10, 6); volumen(ctx, '#5a5f6a', x - w / 2, y, w, 300, 3); }
  rr(ctx, x - w / 2 + 40, y + 120 + comba * 0.4, w - 80, 16, 6); volumen(ctx, '#6a707c', x - w / 2, y, w, 300, 3);
  ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.quadraticCurveTo(x, y + comba, x + w / 2, y); ctx.lineTo(x + w / 2, y + 46); ctx.quadraticCurveTo(x, y + 46 + comba, x - w / 2, y + 46); ctx.closePath();
  volumen(ctx, '#3d4250', x - w / 2, y, w, 34 + comba, 4);
  ctx.beginPath(); ctx.moveTo(x - w / 2 + 6, y + 4); ctx.quadraticCurveTo(x, y + 4 + comba, x + w / 2 - 6, y + 4); ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 4; ctx.stroke();
  ctx.restore();
}
// cuchara con materia de estrella (brillo azul, chispas)
export function cuchara(ctx, t, x, y, s = 1, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const halo = ctx.createRadialGradient(0, -40, 10, 0, -40, 220); halo.addColorStop(0, `rgba(140,220,255,${0.55 + 0.15 * Math.sin(t * 5)})`); halo.addColorStop(1, 'rgba(140,220,255,0)');
  ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(0, -40, 220, 0, 7); ctx.fill();
  rr(ctx, -15, 40, 30, 260, 14); volumen(ctx, '#c9d1dc', -15, 40, 30, 260, 4);
  ctx.beginPath(); ctx.ellipse(0, -30, 78, 96, 0, 0, Math.PI * 2); volumen(ctx, '#d3dae4', -78, -126, 156, 192, 5);
  ctx.beginPath(); ctx.ellipse(0, -40, 58, 56, 0, 0, Math.PI * 2);
  const g = ctx.createRadialGradient(-14, -58, 4, 0, -40, 60); g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, '#a6ecff'); g.addColorStop(1, '#2a6bff'); ctx.fillStyle = g; ctx.fill();
  for (let i = 0; i < 6; i++) { const a = t * 2 + i; const r = 70 + 20 * Math.sin(t * 3 + i); ctx.globalAlpha = 0.6 + 0.4 * Math.sin(t * 6 + i * 2); ctx.fillStyle = '#e8fbff'; ctx.beginPath(); ctx.arc(Math.cos(a) * r, -40 + Math.sin(a) * r * 0.8, 5, 0, 7); ctx.fill(); }
  ctx.globalAlpha = 1; ctx.restore();
}
// Rótulo grande con contorno grueso y rebote
export function rotulo(ctx, t0, t, txt, x, y, size = 120, col = '#ffffff') {
  const k = ph(t, t0, t0 + 0.35); if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); const sc = back(k); ctx.scale(sc, sc); ctx.rotate(Math.sin(t * 2) * 0.01);
  ctx.font = `${size}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round'; ctx.strokeStyle = '#231a24'; ctx.lineWidth = size * 0.16; ctx.strokeText(txt, 0, 0);
  ctx.fillStyle = col; ctx.fillText(txt, 0, 0); ctx.restore();
}
