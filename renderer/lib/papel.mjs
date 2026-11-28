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
  // Guardabosques genérico (camisa caqui, sombrero de ala ancha)
  RANGER: { skin: '#e8b48c', hair: 'corto', hairCol: '#6b4a2e', ropa: '#9a8a4e', pants: '#4e5a3a', shoes: '#4a3424', sombrero: 'ranger', placa: true },
  // Hombre grande (dueño de la historia del ayuno), delantal opcional
  GRANDE: { skin: '#f0c4a0', hair: 'corto', hairCol: '#8a5a32', ropa: '#5b7db1', pants: '#3b3a4a', shoes: '#2c2433', ancho: 1.45 },
  // Policía genérico
  POLI: { skin: '#d9a77c', hair: 'corto', hairCol: '#2a1d16', ropa: '#2f4470', pants: '#232c44', shoes: '#151515', sombrero: 'poli', placa: true },
  // Chico joven (preso)
  CHICO: { skin: '#f4d0b0', hair: 'punta', hairCol: '#c08a4a', ropa: '#8f9479', pants: '#5a5a5a', shoes: '#e8e2d8' },
  // Médico
  MEDICO: { skin: '#c99068', hair: 'corto', hairCol: '#2b2b2b', ropa: '#4f9a8a', bata: true, pants: '#3b4a5a', shoes: '#2c2433', estetoscopio: true },
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
  // andar: pose.anda = fase del paso (p. ej. t*9); pose.lado = hacia dónde va (-1/1)
  const fa = pose.anda, andando = fa !== undefined && fa !== null && fa !== false;
  const lado = pose.lado || 1;
  const bote = andando ? Math.abs(Math.sin(fa)) * 12 : 0;
  ctx.translate(0, -(pose.salto || 0) - bote); ctx.scale(s * (1 + aplasta * 0.08), s * (1 + resp - aplasta * 0.08)); ctx.rotate((pose.incl || 0) + (andando ? lado * 0.04 : 0));
  const an = pose.ancho || sp.ancho || 1;
  const sent = pose.sentado || 0; // 0..1: se sienta (baja la cadera y dobla las rodillas)
  // piernas y zapatos
  for (const k of [-1, 1]) { const lx = k * 46 * (0.6 + 0.4 * an);
    if (sent > 0) { const dy = 40 * sent; ctx.save(); ctx.translate(0, dy); rr(ctx, lx - 26 * an, -98, 52 * an, 46 + 20 * (1 - sent), 20); volumen(ctx, sp.pants, lx - 26, -98, 52, 50); ctx.restore();
      rr(ctx, lx - 20 * an, -56 + dy * 0.6, 40 * an, 56 - dy * 0.6, 14); volumen(ctx, tono(sp.pants, -0.08), lx - 20, -56, 40, 56); elipse(ctx, lx + k * 8, -6, 38, 18, sp.shoes, 4); continue; }
    const fk = fa + (k > 0 ? Math.PI : 0);
    const dx = andando ? Math.sin(fk) * 34 * lado : 0, lev = andando ? Math.max(0, Math.cos(fk)) * 22 : 0;
    const p0 = pose.piernas ? pose.piernas[k > 0 ? 1 : 0] : 0;
    const fx = lx + dx + p0 * 60, fy = -6 - lev;
    ctx.beginPath(); ctx.moveTo(lx - 22 * an, -78); ctx.lineTo(lx + 22 * an, -78); ctx.lineTo(fx + 20, fy - 4); ctx.lineTo(fx - 20, fy - 4); ctx.closePath(); volumen(ctx, sp.pants, lx - 22, -78, 44, 70);
    elipse(ctx, fx + k * 8 + (andando ? lado * 8 : 0), fy, 38, 18, sp.shoes, 4, andando ? -Math.sin(fk) * 0.25 * lado : 0); }
  if (sent > 0) ctx.translate(0, 40 * sent);
  // cuerpo (trapecio redondeado)
  const body = () => { ctx.save(); ctx.scale(an, 1); ctx.beginPath(); ctx.moveTo(-80, -262); ctx.quadraticCurveTo(0, -282, 80, -262); ctx.quadraticCurveTo(112, -160, 104, -78); ctx.quadraticCurveTo(0, -56, -104, -78); ctx.quadraticCurveTo(-112, -160, -80, -262); ctx.closePath(); ctx.restore(); };
  const sx = 84 * an, sy = -240;
  const bal = andando ? Math.sin(fa) * 46 : 0; // los brazos se balancean al andar (al revés que las piernas)
  const manoI = pose.manoI || [-120 + Math.sin(t * 2.2) * 4 + bal, -120 - Math.abs(bal) * 0.3];
  const manoD = pose.manoD || [120 - Math.sin(t * 2.2 + 1) * 4 + bal, -120 - Math.abs(bal) * 0.3];
  body(); volumen(ctx, sp.bata ? '#f4f1ea' : sp.ropa, -112 * an, -282, 224 * an, 226, 5);
  if (an > 1.15) { ctx.save(); ctx.beginPath(); ctx.ellipse(0, -120, 70 * an, 70, 0, 0, 7); ctx.strokeStyle = 'rgba(60,30,30,0.18)'; ctx.lineWidth = 5; ctx.stroke(); ctx.restore(); }
  if (pose.delantal || sp.delantal) { ctx.beginPath(); ctx.moveTo(-60 * an, -230); ctx.lineTo(60 * an, -230); ctx.lineTo(80 * an, -70); ctx.lineTo(-80 * an, -70); ctx.closePath(); volumen(ctx, '#f3efe6', -80 * an, -230, 160 * an, 160, 3); }
  if (sp.placa) { ctx.beginPath(); ctx.moveTo(-50, -220); for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283 - 1.57, r = i % 2 ? 9 : 18; ctx.lineTo(-50 + Math.cos(a) * r, -205 + Math.sin(a) * r); } ctx.closePath(); volumen(ctx, '#e8c04a', -68, -223, 36, 36, 2); }
  if (sp.estetoscopio) { ctx.beginPath(); ctx.moveTo(-40, -262); ctx.quadraticCurveTo(-60, -160, 0, -150); ctx.quadraticCurveTo(50, -160, 40, -262); ctx.strokeStyle = '#2b2b33'; ctx.lineWidth = 6; ctx.stroke(); ctx.beginPath(); ctx.arc(0, -146, 12, 0, 7); ctx.fillStyle = '#b8bec8'; ctx.fill(); ctx.stroke(); }
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
  // objetos en la mano: pose.sostieneI / sostieneD = (ctx) => dibuja centrado en la mano (escala del personaje)
  for (const [f, pm] of [[pose.sostieneI, pI], [pose.sostieneD, pD]]) if (f) { ctx.save(); ctx.translate(pm[0], pm[1]); f(ctx); ctx.restore(); }
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
  if (sp.hair === 'corto') { ctx.beginPath(); ctx.moveTo(-130, hy - 20); ctx.quadraticCurveTo(-90, hy - 70, -20, hy - 66); ctx.quadraticCurveTo(60, hy - 80, 130, hy - 30); ctx.lineTo(130, hy - 130); ctx.lineTo(-130, hy - 130); ctx.closePath(); ctx.fill(); }
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
    if (!pose.sinCejas) { ctx.save(); ctx.translate(ex, by); ctx.rotate(ba); rr(ctx, -26, -6, 52, 12, 6); ctx.fillStyle = tono(sp.hairCol, -0.1); ctx.fill(); ctx.restore(); }
  }
  // nariz
  ctx.beginPath(); ctx.ellipse(0, hy + 36, 12, 9, 0, 0, Math.PI * 2); ctx.fillStyle = tono(sp.skin, -0.12); ctx.fill();
  // boca: habla = alterna formas; si no, la del humor
  let bt = pose.boca || ({ feliz: 'sonrisa', sorpresa: 'o', miedo: 'grito', enfado: 'apretada', esfuerzo: 'apretada', triste: 'triste' }[mood] || 'cerrada');
  if (pose.habla) bt = BOCAS[Math.floor(t * 11 + hash(Math.floor(t * 11)) * 3) % BOCAS.length];
  boca(ctx, bt, 0, hy + 66, 70);
  // gafas de laboratorio en la frente
  if (sp.gafasLab) { ctx.save(); ctx.translate(0, hy - 74); rr(ctx, -112, -6, 224, 14, 6); ctx.fillStyle = '#3d3a44'; ctx.fill(); for (const k of [-1, 1]) { ctx.beginPath(); ctx.ellipse(k * 40, 0, 34, 24, 0, 0, 7); ctx.fillStyle = '#2d2b33'; ctx.fill(); ctx.beginPath(); ctx.ellipse(k * 40, 0, 26, 17, 0, 0, 7); const g = ctx.createLinearGradient(k * 40 - 26, -17, k * 40 + 26, 17); g.addColorStop(0, '#bfeaf5'); g.addColorStop(1, '#5aa9c4'); ctx.fillStyle = g; ctx.fill(); ctx.beginPath(); ctx.moveTo(k * 40 - 14, -8); ctx.lineTo(k * 40 - 2, -12); ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 4; ctx.stroke(); } ctx.restore(); }
  if (pose.hollin) { ctx.fillStyle = 'rgba(40,30,30,0.35)'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.ellipse(-80 + hash(i) * 160, hy - 40 + hash(i + 9) * 110, 16 + hash(i + 3) * 14, 10, 0, 0, 7); ctx.fill(); } }
  const somb = pose.sombrero === undefined ? sp.sombrero : pose.sombrero;
  if (somb === 'ranger') { ctx.beginPath(); ctx.ellipse(0, hy - 78, 190, 34, 0, 0, 7); volumen(ctx, '#b08a52', -190, hy - 112, 380, 68, 4);
    ctx.beginPath(); ctx.moveTo(-96, hy - 82); ctx.quadraticCurveTo(-90, hy - 190, -30, hy - 196); ctx.lineTo(0, hy - 176); ctx.lineTo(30, hy - 196); ctx.quadraticCurveTo(90, hy - 190, 96, hy - 82); ctx.closePath(); volumen(ctx, '#c49a5c', -96, hy - 196, 192, 114, 4);
    rr(ctx, -96, hy - 112, 192, 22, 4); ctx.fillStyle = '#5a4026'; ctx.fill(); }
  if (somb === 'poli') { ctx.beginPath(); ctx.moveTo(-118, hy - 66); ctx.quadraticCurveTo(-130, hy - 150, 0, hy - 160); ctx.quadraticCurveTo(130, hy - 150, 118, hy - 66); ctx.closePath(); volumen(ctx, '#2a3a60', -130, hy - 160, 260, 94, 4);
    ctx.beginPath(); ctx.ellipse(30, hy - 60, 110, 22, 0.08, 0, 7); volumen(ctx, '#111522', -80, hy - 82, 220, 44, 3); ctx.beginPath(); ctx.arc(0, hy - 112, 16, 0, 7); volumen(ctx, '#e8c04a', -16, hy - 128, 32, 32, 2); }
  if (somb === 'gorra') { ctx.beginPath(); ctx.moveTo(-120, hy - 54); ctx.quadraticCurveTo(-120, hy - 150, 0, hy - 150); ctx.quadraticCurveTo(120, hy - 150, 120, hy - 54); ctx.closePath(); volumen(ctx, pose.gorraCol || '#c0392b', -120, hy - 150, 240, 96, 4); ctx.beginPath(); ctx.ellipse(70, hy - 54, 100, 20, 0.05, 0, 7); volumen(ctx, tono(pose.gorraCol || '#c0392b', -0.25), -30, hy - 74, 200, 40, 3); }
  if (pose.fuego) { const f = pose.fuego; for (let i = 0; i < 7; i++) { const fx = -110 + i * 36, fh = (70 + 50 * Math.sin(t * 13 + i * 2.1)) * f; ctx.beginPath(); ctx.moveTo(fx - 26, hy - 100); ctx.quadraticCurveTo(fx - 18, hy - 100 - fh * 0.6, fx + Math.sin(t * 9 + i) * 10, hy - 110 - fh); ctx.quadraticCurveTo(fx + 18, hy - 100 - fh * 0.6, fx + 26, hy - 100); ctx.closePath(); ctx.fillStyle = i % 2 ? '#ff8a2a' : '#ffc93d'; ctx.fill(); ctx.strokeStyle = 'rgba(180,60,20,0.8)'; ctx.lineWidth = 3; ctx.stroke(); } }
  if (pose.humo) { for (let i = 0; i < 4; i++) { const k2 = (t * 0.7 + i * 0.25) % 1; ctx.globalAlpha = (1 - k2) * 0.6 * pose.humo; ctx.beginPath(); ctx.arc(-40 + i * 30 + Math.sin(t * 2 + i) * 20, hy - 130 - k2 * 200, 26 + k2 * 40, 0, 7); ctx.fillStyle = '#8a8590'; ctx.fill(); } ctx.globalAlpha = 1; }
  // gotas de sudor / esfuerzo
  if (mood === 'esfuerzo' || mood === 'miedo') for (let i = 0; i < 2; i++) { const k2 = ((t * 1.4 + i * 0.5) % 1); ctx.globalAlpha = 1 - k2; ctx.beginPath(); const dx = (i ? 1 : -1) * 128, dy = hy - 60 + k2 * 70; ctx.moveTo(dx, dy - 16); ctx.quadraticCurveTo(dx + 12, dy + 4, dx, dy + 8); ctx.quadraticCurveTo(dx - 12, dy + 4, dx, dy - 16); ctx.fillStyle = '#8fd3ff'; ctx.fill(); ctx.strokeStyle = LINEA; ctx.lineWidth = 2; ctx.stroke(); ctx.globalAlpha = 1; }
  ctx.restore();
  ctx.restore();
  // devuelve la posición de las manos en coordenadas de pantalla (aprox.)
  const dyS = 40 * (pose.sentado || 0);
  const m = (p) => [x + p[0] * s, y - (pose.salto || 0) - bote + (p[1] + dyS) * s];
  return { manoI: m(pI), manoD: m(pD), cabeza: [x, y - (262 + 118 - dyS) * s] };
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

// ================= DECORADOS Y OBJETOS (todos con capas de profundidad) =================
export { rr, volumen, elipse, hash };
// Suelo genérico en perspectiva: baldosas, madera, cemento, hierba
export function suelo(ctx, cam, tipo = 'baldosa') {
  capa(ctx, cam, 1, () => {
    const C = { baldosa: ['#b9a58a', '#8f7c63'], madera: ['#a7774c', '#7a5435'], cemento: ['#9a9a96', '#6f6f6c'], hierba: ['#7aa84e', '#4f7a34'], blanco: ['#d9dde0', '#aeb4ba'] }[tipo];
    const g = ctx.createLinearGradient(0, SUELO - 60, 0, H + 300); g.addColorStop(0, C[0]); g.addColorStop(1, C[1]); ctx.fillStyle = g; ctx.fillRect(-400, SUELO - 60, W + 800, H);
    ctx.strokeStyle = 'rgba(60,45,35,0.22)'; ctx.lineWidth = 3;
    if (tipo === 'hierba') { for (let i = 0; i < 90; i++) { const x = -300 + hash(i) * (W + 600), y = SUELO - 50 + Math.pow(hash(i + 7), 1.5) * 500; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 6, y - 18); ctx.moveTo(x, y); ctx.lineTo(x + 7, y - 16); ctx.strokeStyle = 'rgba(40,80,30,0.5)'; ctx.stroke(); } }
    else if (tipo === 'madera') { for (let j = 0; j < 9; j++) { const yy = SUELO - 60 + Math.pow(j / 8, 1.6) * 900; ctx.beginPath(); ctx.moveTo(-400, yy); ctx.lineTo(W + 400, yy); ctx.stroke(); for (let i = 0; i < 6; i++) { const xx = -300 + ((i * 260 + j * 130) % (W + 600)); ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx, yy + 20 + j * 12); ctx.stroke(); } } }
    else { for (let i = -12; i <= 12; i++) { ctx.beginPath(); ctx.moveTo(W / 2 + i * 60, SUELO - 60); ctx.lineTo(W / 2 + i * 260, H + 300); ctx.stroke(); } for (let j = 0; j < 8; j++) { const yy = SUELO - 60 + Math.pow(j / 7, 1.7) * 900; ctx.beginPath(); ctx.moveTo(-400, yy); ctx.lineTo(W + 400, yy); ctx.stroke(); } }
    if (tipo !== 'hierba') { ctx.fillStyle = 'rgba(40,30,25,0.6)'; ctx.fillRect(-400, SUELO - 70, W + 800, 12); }
  });
}
// Pared interior con paneles y zócalo; deco() dibuja encima en la misma capa
export function pared(ctx, t, cam, c1, c2, zocalo, deco) {
  capa(ctx, cam, 0.55, () => {
    const g = ctx.createLinearGradient(0, 0, 0, SUELO); g.addColorStop(0, c1); g.addColorStop(1, c2); ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, SUELO + 300);
    for (let i = -2; i < 8; i++) { rr(ctx, i * 180 + 20, 120, 150, 640, 10); ctx.strokeStyle = 'rgba(80,70,60,0.13)'; ctx.lineWidth = 5; ctx.stroke(); }
    if (zocalo) { ctx.fillStyle = zocalo; ctx.fillRect(-300, 1060, W + 600, 360); ctx.fillStyle = tono(zocalo, -0.15); ctx.fillRect(-300, 1060, W + 600, 18); for (let i = -3; i < 14; i++) { ctx.fillStyle = 'rgba(0,0,0,0.07)'; ctx.fillRect(i * 90, 1078, 4, 342); } }
    if (deco) deco();
  });
}
export function lamparas(ctx, cam, xs = [300, 780], col = '#3f6b5c', luz = 'rgba(255,240,190,0.33)') {
  capa(ctx, cam, 0.75, () => { for (const lx of xs) {
    ctx.strokeStyle = '#3a3440'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(lx, -300); ctx.lineTo(lx, 90); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(lx - 70, 160); ctx.quadraticCurveTo(lx, 50, lx + 70, 160); ctx.closePath(); volumen(ctx, col, lx - 70, 80, 140, 80, 4);
    const lg = ctx.createLinearGradient(0, 160, 0, SUELO); lg.addColorStop(0, luz); lg.addColorStop(1, 'rgba(255,240,190,0)');
    ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(lx - 60, 160); ctx.lineTo(lx + 60, 160); ctx.lineTo(lx + 330, SUELO); ctx.lineTo(lx - 330, SUELO); ctx.closePath(); ctx.fill();
    elipse(ctx, lx, 162, 34, 10, '#fff6cf', 0); } });
}
// Pantalla grande colgada (infografías). dibuja(ctx, x, y, w, h) en coordenadas de la pantalla
export function pantalla(ctx, t, x, y, w, h, dibuja) {
  ctx.save(); rr(ctx, x - 14, y - 14, w + 28, h + 28, 18); volumen(ctx, '#2c2a33', x - 14, y - 14, w + 28, h + 28, 4);
  rr(ctx, x, y, w, h, 8); const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#173246'); g.addColorStop(1, '#0d1c2a'); ctx.fillStyle = g; ctx.fill();
  ctx.save(); rr(ctx, x, y, w, h, 8); ctx.clip();
  ctx.strokeStyle = 'rgba(120,200,255,0.08)'; ctx.lineWidth = 2; for (let i = 0; i < w; i += 40) { ctx.beginPath(); ctx.moveTo(x + i, y); ctx.lineTo(x + i, y + h); ctx.stroke(); } for (let j = 0; j < h; j += 40) { ctx.beginPath(); ctx.moveTo(x, y + j); ctx.lineTo(x + w, y + j); ctx.stroke(); }
  dibuja(ctx, x, y, w, h);
  ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w * 0.45, y); ctx.lineTo(x + w * 0.2, y + h); ctx.lineTo(x, y + h); ctx.fill();
  ctx.restore(); ctx.restore();
}
export function texto(ctx, txt, x, y, size, col = '#fff', align = 'center', font = 'Anton') { ctx.save(); ctx.font = `${size}px ${font}`; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#231a24'; ctx.lineWidth = size * 0.14; ctx.strokeText(txt, x, y); ctx.fillStyle = col; ctx.fillText(txt, x, y); ctx.restore(); }

// ---- Celda de comisaría (pared de bloques, ventanuco con barrotes, banco, gotas en la pared)
export function celda(ctx, t, cam, opt = {}) {
  capa(ctx, cam, 0.55, () => {
    const g = ctx.createLinearGradient(0, 0, 0, SUELO); g.addColorStop(0, '#8d9196'); g.addColorStop(1, '#a9aca9'); ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, SUELO + 300);
    for (let j = 0; j < 16; j++) for (let i = -2; i < 9; i++) { const x = i * 160 + (j % 2) * 80, y = j * 90; rr(ctx, x + 3, y + 3, 154, 84, 6); ctx.strokeStyle = 'rgba(50,55,60,0.25)'; ctx.lineWidth = 4; ctx.stroke(); }
    // ventanuco alto con luz
    rr(ctx, 600, 330, 260, 170, 6); ctx.fillStyle = '#cfe3ef'; ctx.fill(); ctx.strokeStyle = LINEA; ctx.lineWidth = 5; ctx.stroke();
    for (let i = 1; i < 5; i++) { ctx.fillStyle = '#3b3f46'; ctx.fillRect(600 + i * 52 - 6, 330, 12, 170); }
    const lg = ctx.createLinearGradient(0, 500, 0, SUELO); lg.addColorStop(0, 'rgba(255,250,220,0.22)'); lg.addColorStop(1, 'rgba(255,250,220,0)'); ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(600, 500); ctx.lineTo(860, 500); ctx.lineTo(700, SUELO); ctx.lineTo(300, SUELO); ctx.closePath(); ctx.fill();
    // gotas de condensación
    if (opt.gotas) for (let i = 0; i < 26; i++) { const x = 120 + hash(i) * 820, y0 = 560 + hash(i + 40) * 420, y = y0 + ((t * 0.25 + hash(i + 3)) % 1) * 40; ctx.beginPath(); ctx.ellipse(x, y, 6, 9, 0, 0, 7); ctx.fillStyle = 'rgba(210,240,255,0.85)'; ctx.fill(); ctx.strokeStyle = 'rgba(90,120,140,0.6)'; ctx.lineWidth = 2; ctx.stroke(); }
    // banco de cemento y retrete
    rr(ctx, 90, 1180, 420, 60, 8); volumen(ctx, '#7c7f82', 90, 1180, 420, 60, 4); rr(ctx, 110, 1240, 40, 180, 6); volumen(ctx, '#6c6f72', 110, 1240, 40, 180, 3); rr(ctx, 450, 1240, 40, 180, 6); volumen(ctx, '#6c6f72', 450, 1240, 40, 180, 3);
    ctx.beginPath(); ctx.ellipse(880, 1340, 70, 30, 0, 0, 7); volumen(ctx, '#e8ecef', 810, 1310, 140, 60, 4); rr(ctx, 850, 1340, 60, 80, 10); volumen(ctx, '#dfe4e8', 850, 1340, 60, 80, 3);
  });
  suelo(ctx, cam, 'cemento');
}
// Barrotes delante (capa más cercana)
export function barrotes(ctx, cam, abierta = 0) {
  capa(ctx, cam, 1.25, () => { for (let i = -2; i < 12; i++) { const x = i * 110 + abierta * 600; rr(ctx, x, -300, 26, SUELO + 600, 12); volumen(ctx, '#4a4f58', x, -300, 26, 2400, 3); } rr(ctx, -300 + abierta * 600, 380, W + 600, 30, 8); volumen(ctx, '#3e434b', -300, 380, W + 600, 30, 3); });
}
// ---- Laboratorio sin pizarra de la estrella (para otras historias): pared + estanterías + reloj
export function salaLab(ctx, t, cam, deco) {
  pared(ctx, t, cam, '#d8cdb8', '#efe6d3', '#7d5c45', () => {
    for (const sy of [700, 880]) { rr(ctx, 40, sy, 300, 22, 4); ctx.fillStyle = '#8b6446'; ctx.fill(); ctx.strokeStyle = LINEA; ctx.lineWidth = 3; ctx.stroke(); }
    const cols = ['#c94f4f', '#3b6fb0', '#e0a640', '#4f9a6b', '#7a4fa0', '#d07a3a'];
    for (let i = 0; i < 9; i++) { rr(ctx, 60 + i * 26, 590 + (i % 3) * 8, 22, 110 - (i % 3) * 8, 3); ctx.fillStyle = cols[i % 6]; ctx.fill(); ctx.strokeStyle = LINEA; ctx.lineWidth = 2; ctx.stroke(); }
    [['#7de8c8', 120], ['#ff9ad1', 200], ['#ffe27a', 280]].forEach(([c, fx], i) => { rr(ctx, fx - 24, 772, 48, 106, 14); ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fill(); ctx.strokeStyle = LINEA; ctx.lineWidth = 3; ctx.stroke(); rr(ctx, fx - 20, 812, 40, 62, 10); ctx.globalAlpha = 0.7 + 0.25 * Math.sin(t * 2 + i); ctx.fillStyle = c; ctx.fill(); ctx.globalAlpha = 1; });
    elipse(ctx, 930, 260, 56, 56, '#f7f2e6', 5); ctx.save(); ctx.translate(930, 260); ctx.strokeStyle = '#333'; ctx.lineWidth = 5; ctx.rotate(t * 0.5); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -38); ctx.stroke(); ctx.restore();
    if (deco) deco();
  });
  lamparas(ctx, cam); suelo(ctx, cam, 'baldosa');
}
// ---- Consulta médica (pared verde menta, cartel de vista, camilla, monitor)
export function consulta(ctx, t, cam, deco) {
  pared(ctx, t, cam, '#cfe6de', '#e6f2ee', '#8fb3aa', () => {
    rr(ctx, 90, 300, 200, 280, 6); volumen(ctx, '#fbfbf7', 90, 300, 200, 280, 4);
    ['E', 'F P', 'T O Z', 'L P E D'].forEach((r, i) => { ctx.fillStyle = '#222'; ctx.font = `${70 - i * 14}px Anton`; ctx.textAlign = 'center'; ctx.fillText(r, 190, 380 + i * 58); });
    rr(ctx, 330, 360, 120, 160, 4); volumen(ctx, '#f6f0e4', 330, 360, 120, 160, 3); ctx.strokeStyle = '#d65a5a'; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(390, 400); ctx.lineTo(390, 480); ctx.moveTo(350, 440); ctx.lineTo(430, 440); ctx.stroke();
    // camilla
    rr(ctx, 80, 1140, 420, 50, 14); volumen(ctx, '#e9eef0', 80, 1140, 420, 50, 4); rr(ctx, 80, 1120, 420, 30, 10); volumen(ctx, '#f3f6f7', 80, 1120, 420, 30, 3);
    for (const x of [110, 450]) { rr(ctx, x, 1190, 22, 230, 6); volumen(ctx, '#9aa3ab', x, 1190, 22, 230, 3); }
    if (deco) deco();
  });
  lamparas(ctx, cam, [540], '#e9eef0', 'rgba(240,255,255,0.3)'); suelo(ctx, cam, 'blanco');
}
// Báscula de columna con aguja y cifra
export function bascula(ctx, t, x, y, cifra, col = '#fff') {
  rr(ctx, x - 110, y - 40, 220, 46, 10); volumen(ctx, '#7f8a94', x - 110, y - 40, 220, 46, 4);
  rr(ctx, x + 70, y - 560, 26, 530, 8); volumen(ctx, '#9aa5ae', x + 70, y - 560, 26, 530, 3);
  rr(ctx, x - 40, y - 680, 230, 130, 18); volumen(ctx, '#e9eef1', x - 40, y - 680, 230, 130, 4);
  rr(ctx, x - 22, y - 662, 194, 94, 10); ctx.fillStyle = '#16313d'; ctx.fill();
  ctx.save(); ctx.font = '70px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 16; ctx.fillText(String(cifra), x + 75, y - 614); ctx.restore();
}
// ---- Tienda de fish & chips (azulejos, mostrador, freidora que burbujea, menú)
export function tienda(ctx, t, cam, deco) {
  capa(ctx, cam, 0.55, () => {
    ctx.fillStyle = '#f2efe6'; ctx.fillRect(-300, -300, W + 600, SUELO + 300);
    for (let j = 0; j < 18; j++) for (let i = -3; i < 14; i++) { ctx.fillStyle = (i + j) % 2 ? '#e7f0f2' : '#fdfdfb'; ctx.fillRect(i * 80, 300 + j * 80, 78, 78); }
    ctx.fillStyle = '#2f6f8f'; ctx.fillRect(-300, 270, W + 600, 30); ctx.fillRect(-300, 860, W + 600, 20);
    // menú
    rr(ctx, 140, 330, 800, 230, 14); volumen(ctx, '#23303a', 140, 330, 800, 230, 5);
    texto(ctx, 'FISH & CHIPS', 540, 400, 92, '#ffd93d'); ctx.fillStyle = '#e8e8e8'; ctx.font = '34px Poppins'; ctx.textAlign = 'center'; ctx.fillText('COD · HADDOCK · MUSHY PEAS', 540, 480);
    // freidora con aceite que burbujea y vapor
    rr(ctx, 620, 680, 300, 200, 12); volumen(ctx, '#b9c0c8', 620, 680, 300, 200, 4); rr(ctx, 640, 660, 260, 40, 8); ctx.fillStyle = '#c9a24a'; ctx.fill();
    for (let i = 0; i < 8; i++) { const k = (t * 1.6 + hash(i)) % 1; ctx.beginPath(); ctx.arc(650 + hash(i + 5) * 240, 676 - k * 10, 6 + k * 6, 0, 7); ctx.strokeStyle = 'rgba(255,240,180,0.9)'; ctx.lineWidth = 3; ctx.stroke(); }
    for (let i = 0; i < 4; i++) { const k = (t * 0.5 + i * 0.25) % 1; ctx.globalAlpha = (1 - k) * 0.45; ctx.beginPath(); ctx.arc(680 + i * 60 + Math.sin(t + i) * 20, 640 - k * 240, 30 + k * 40, 0, 7); ctx.fillStyle = '#ffffff'; ctx.fill(); } ctx.globalAlpha = 1;
    if (deco) deco();
  });
  lamparas(ctx, cam, [300, 780], '#c0392b');
  suelo(ctx, cam, 'baldosa');
}
export function mostrador(ctx, x, y, w) { rr(ctx, x - w / 2, y, w, SUELO - y + 10, 10); volumen(ctx, '#2f6f8f', x - w / 2, y, w, SUELO - y, 4); rr(ctx, x - w / 2 - 20, y - 20, w + 40, 34, 8); volumen(ctx, '#e9e4da', x - w / 2 - 20, y - 20, w + 40, 34, 4); for (let i = 0; i < 4; i++) { ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(x - w / 2 + 30 + i * (w - 60) / 4, y + 40, (w - 60) / 4 - 20, SUELO - y - 80); } }
// Pescado rebozado + patatas en papel
export function pescado(ctx, x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(-120, 0); ctx.lineTo(120, -30); ctx.lineTo(90, 40); ctx.closePath(); volumen(ctx, '#f3efe6', -120, -30, 240, 70, 3); ctx.beginPath(); ctx.ellipse(0, -10, 90, 34, -0.1, 0, 7); volumen(ctx, '#e0a040', -90, -44, 180, 68, 4); for (let i = 0; i < 7; i++) { rr(ctx, -80 + i * 20, -60 - (i % 3) * 8, 14, 50, 4); volumen(ctx, '#f2c255', -80 + i * 20, -60, 14, 50, 2); } ctx.restore(); }

// ---- Exterior: cielo (día/tormenta/noche), montañas, pinos, río opcional
export function exterior(ctx, t, cam, opt = {}) {
  const cielo = opt.cielo || 'dia';
  capa(ctx, cam, 0.3, () => {
    const C = { dia: ['#7cc4ef', '#d9f0fa'], tormenta: ['#3b4256', '#7c8296'], atardecer: ['#e88a5a', '#f7d39a'], noche: ['#0d1238', '#3b2a6e'] }[cielo];
    const g = ctx.createLinearGradient(0, -300, 0, SUELO); g.addColorStop(0, C[0]); g.addColorStop(1, C[1]); ctx.fillStyle = g; ctx.fillRect(-500, -500, W + 1000, SUELO + 500);
    if (cielo === 'dia') { const sg = ctx.createRadialGradient(860, 380, 10, 860, 380, 160); sg.addColorStop(0, '#fffbe0'); sg.addColorStop(0.4, '#ffe27a'); sg.addColorStop(1, 'rgba(255,226,122,0)'); ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(860, 380, 160, 0, 7); ctx.fill(); }
    if (cielo === 'noche') for (let i = 0; i < 60; i++) { ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 3 + i); ctx.fillStyle = '#fff'; ctx.fillRect(-200 + hash(i) * 1500, hash(i + 50) * 900, 3, 3); }
    ctx.globalAlpha = 1;
    // montañas lejanas
    const mc = cielo === 'tormenta' ? ['#59607a', '#4a5168'] : ['#8fa8c8', '#7b93b4'];
    [[0, 820, 260], [360, 760, 300], [760, 840, 280], [1100, 780, 300]].forEach(([mx, my, mw], i) => { ctx.beginPath(); ctx.moveTo(mx - mw, 1150); ctx.lineTo(mx - 40, my); ctx.lineTo(mx + 30, my + 30); ctx.lineTo(mx + mw, 1150); ctx.closePath(); ctx.fillStyle = mc[i % 2]; ctx.fill(); ctx.beginPath(); ctx.moveTo(mx - 40, my); ctx.lineTo(mx - 90, my + 70); ctx.lineTo(mx - 40, my + 55); ctx.lineTo(mx + 10, my + 75); ctx.lineTo(mx + 30, my + 30); ctx.closePath(); ctx.fillStyle = cielo === 'tormenta' ? '#9aa0b0' : '#eef4fa'; ctx.fill(); });
  });
  capa(ctx, cam, 0.6, () => {
    ctx.fillStyle = cielo === 'tormenta' ? '#3d5a3a' : '#5f9a4c'; ctx.beginPath(); ctx.moveTo(-500, 1200); ctx.quadraticCurveTo(300, 1020, 700, 1120); ctx.quadraticCurveTo(1000, 1180, 1600, 1080); ctx.lineTo(1600, SUELO); ctx.lineTo(-500, SUELO); ctx.closePath(); ctx.fill();
    for (let i = 0; i < 14; i++) pino(ctx, -200 + i * 110 + hash(i) * 50, 1170 + hash(i + 4) * 60, 0.55 + hash(i + 9) * 0.3, cielo === 'tormenta');
    if (opt.lejos) opt.lejos();
  });
  if (opt.rio) capa(ctx, cam, 0.85, () => { const g = ctx.createLinearGradient(0, 1250, 0, 1420); g.addColorStop(0, '#5fb3d9'); g.addColorStop(1, '#3a86b8'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-500, 1260); ctx.quadraticCurveTo(540, 1220, 1600, 1270); ctx.lineTo(1600, 1400); ctx.quadraticCurveTo(540, 1370, -500, 1400); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 4; for (let i = 0; i < 10; i++) { const x = ((i * 170 + t * 60) % 1600) - 300; ctx.beginPath(); ctx.moveTo(x, 1300 + (i % 3) * 30); ctx.lineTo(x + 60, 1300 + (i % 3) * 30); ctx.stroke(); } });
  if (opt.medio) capa(ctx, cam, 0.85, opt.medio);
  suelo(ctx, cam, opt.suelo || 'hierba');
}
export function pino(ctx, x, y, s = 1, oscuro = false) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(ctx, -12, -40, 24, 50, 4); ctx.fillStyle = '#6b4a2e'; ctx.fill(); for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-90 + i * 18, -30 - i * 70); ctx.lineTo(0, -150 - i * 70); ctx.lineTo(90 - i * 18, -30 - i * 70); ctx.closePath(); volumen(ctx, oscuro ? ['#2f4a33', '#355438', '#3b5e3f'][i] : ['#2f7a45', '#3a8c50', '#46a05c'][i], -90, -150 - i * 70, 180, 120, 3); } ctx.restore(); }
// Nube de tormenta (puede seguir a alguien); enfado = cara de nube
export function nube(ctx, t, x, y, s = 1, opt = {}) {
  ctx.save(); ctx.translate(x, y + Math.sin(t * 1.3) * 8); ctx.scale(s, s);
  const bolas = [[-150, 20, 90], [-60, -30, 110], [60, -40, 120], [160, 10, 90], [0, 40, 110], [-100, 60, 70], [110, 60, 80]];
  ctx.beginPath(); bolas.forEach(([bx, by, r]) => { ctx.moveTo(bx + r, by); ctx.arc(bx, by, r, 0, 7); }); volumen(ctx, opt.col || '#5a6174', -240, -160, 480, 300, 5);
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.beginPath(); ctx.arc(-60, -60, 70, 0, 7); ctx.arc(60, -70, 70, 0, 7); ctx.fill();
  if (opt.cara) { for (const k of [-1, 1]) { ctx.beginPath(); ctx.ellipse(k * 50, 10, 22, 26, 0, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.beginPath(); ctx.arc(k * 50 + 6, 16, 10, 0, 7); ctx.fillStyle = '#1b1620'; ctx.fill(); ctx.save(); ctx.translate(k * 50, -22); ctx.rotate(k * -0.45); ctx.fillStyle = '#2a2d3a'; ctx.fillRect(-30, -8, 60, 16); ctx.restore(); } ctx.beginPath(); ctx.moveTo(-40, 70); ctx.quadraticCurveTo(0, 50, 40, 70); ctx.strokeStyle = '#2a2d3a'; ctx.lineWidth = 7; ctx.stroke(); }
  if (opt.lluvia) { ctx.strokeStyle = 'rgba(180,200,230,0.7)'; ctx.lineWidth = 4; for (let i = 0; i < 18; i++) { const lx = -200 + hash(i) * 400, k = (t * 2.5 + hash(i + 3)) % 1; ctx.beginPath(); ctx.moveTo(lx, 100 + k * 600); ctx.lineTo(lx - 12, 140 + k * 600); ctx.stroke(); } }
  ctx.restore();
}
// Rayo en zigzag entre dos puntos, con resplandor; k = intensidad 0..1
export function rayo(ctx, t, x1, y1, x2, y2, k = 1, seed = 1) {
  if (k <= 0) return; const pts = [[x1, y1]]; const n = 9;
  for (let i = 1; i < n; i++) { const f = i / n; pts.push([lerp(x1, x2, f) + (hash(seed * 31 + i + Math.floor(t * 20)) - 0.5) * 110, lerp(y1, y2, f)]); } pts.push([x2, y2]);
  ctx.save(); ctx.globalAlpha = k; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  for (const [w, c] of [[60, 'rgba(160,200,255,0.25)'], [26, 'rgba(200,230,255,0.6)'], [10, '#ffffff']]) { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.strokeStyle = c; ctx.lineWidth = w; ctx.stroke(); }
  const g = ctx.createRadialGradient(x2, y2, 10, x2, y2, 260); g.addColorStop(0, 'rgba(255,255,230,0.9)'); g.addColorStop(1, 'rgba(255,255,230,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x2, y2, 260, 0, 7); ctx.fill();
  ctx.restore();
}
// Destello de pantalla completa (fogonazo)
export function fogonazo(ctx, k, col = '255,255,240') { if (k <= 0) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = `rgba(${col},${k})`; ctx.fillRect(0, 0, 4000, 4000); ctx.restore(); }
// Torre de vigilancia de incendios
export function torre(ctx, x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = '#6b4a2e'; ctx.lineWidth = 18; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-120, 0); ctx.lineTo(-70, -560); ctx.moveTo(120, 0); ctx.lineTo(70, -560); ctx.moveTo(-110, -120); ctx.lineTo(100, -300); ctx.moveTo(110, -120); ctx.lineTo(-100, -300); ctx.moveTo(-95, -300); ctx.lineTo(85, -480); ctx.moveTo(95, -300); ctx.lineTo(-85, -480); ctx.stroke(); rr(ctx, -130, -720, 260, 170, 8); volumen(ctx, '#a0744a', -130, -720, 260, 170, 4); rr(ctx, -110, -700, 220, 90, 4); ctx.fillStyle = '#bfe2f2'; ctx.fill(); ctx.beginPath(); ctx.moveTo(-160, -720); ctx.lineTo(0, -820); ctx.lineTo(160, -720); ctx.closePath(); volumen(ctx, '#7a3b2a', -160, -820, 320, 100, 4); ctx.restore(); }
// Caseta de guardabosques
export function caseta(ctx, x, y, s = 1, texto2 = 'RANGER STATION') { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(ctx, -260, -330, 520, 330, 6); volumen(ctx, '#8a5a36', -260, -330, 520, 330, 4); for (let i = 0; i < 8; i++) { ctx.fillStyle = 'rgba(0,0,0,0.1)'; ctx.fillRect(-260, -320 + i * 42, 520, 4); } ctx.beginPath(); ctx.moveTo(-300, -330); ctx.lineTo(0, -480); ctx.lineTo(300, -330); ctx.closePath(); volumen(ctx, '#4f3a2a', -300, -480, 600, 150, 4); rr(ctx, -60, -210, 120, 210, 6); volumen(ctx, '#5a3a22', -60, -210, 120, 210, 3); rr(ctx, -220, -250, 120, 100, 4); ctx.fillStyle = '#ffe9a8'; ctx.fill(); ctx.strokeStyle = LINEA; ctx.stroke(); rr(ctx, 100, -250, 120, 100, 4); ctx.fillStyle = '#ffe9a8'; ctx.fill(); ctx.stroke(); rr(ctx, -170, -400, 340, 50, 8); volumen(ctx, '#e9dcb8', -170, -400, 340, 50, 3); ctx.fillStyle = '#3a2a1a'; ctx.font = '32px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(texto2, 0, -375); ctx.restore(); }
// Casa con porche
export function casa(ctx, x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(ctx, -280, -340, 560, 340, 6); volumen(ctx, '#e8dcc4', -280, -340, 560, 340, 4); ctx.beginPath(); ctx.moveTo(-320, -340); ctx.lineTo(0, -520); ctx.lineTo(320, -340); ctx.closePath(); volumen(ctx, '#b0473a', -320, -520, 640, 180, 4); rr(ctx, -50, -220, 100, 220, 6); volumen(ctx, '#3f6fb5', -50, -220, 100, 220, 3); for (const wx of [-200, 120]) { rr(ctx, wx, -260, 90, 90, 4); ctx.fillStyle = '#cfe9f5'; ctx.fill(); ctx.strokeStyle = LINEA; ctx.lineWidth = 4; ctx.stroke(); } rr(ctx, -300, -30, 600, 30, 4); volumen(ctx, '#9a7a5a', -300, -30, 600, 30, 3); ctx.restore(); }
// Camioneta pick-up de guardabosques
export function camioneta(ctx, t, x, y, s = 1, mueve = 0) { ctx.save(); ctx.translate(x, y + Math.sin(t * 18) * 2 * mueve); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-300, -60); ctx.lineTo(-300, -170); ctx.lineTo(20, -170); ctx.lineTo(60, -280); ctx.lineTo(230, -280); ctx.lineTo(300, -170); ctx.lineTo(320, -60); ctx.closePath(); volumen(ctx, '#4f7a4a', -300, -280, 620, 220, 5);
  ctx.beginPath(); ctx.moveTo(80, -260); ctx.lineTo(210, -260); ctx.lineTo(265, -180); ctx.lineTo(60, -180); ctx.closePath(); ctx.fillStyle = '#bfe2f2'; ctx.fill(); ctx.strokeStyle = LINEA; ctx.lineWidth = 4; ctx.stroke();
  rr(ctx, -280, -140, 280, 26, 6); ctx.fillStyle = '#e8dcb8'; ctx.fill(); ctx.fillStyle = '#2a3a22'; ctx.font = '22px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('PARK SERVICE', -140, -127);
  for (const wx of [-190, 200]) { ctx.save(); ctx.translate(wx, -50); ctx.rotate(t * 8 * mueve); elipse(ctx, 0, 0, 62, 62, '#2a2a30', 5); elipse(ctx, 0, 0, 28, 28, '#a0a6b0', 3); ctx.fillStyle = '#555'; ctx.fillRect(-4, -26, 8, 52); ctx.restore(); }
  ctx.restore(); }
// Oso (pardo, de pie o a cuatro patas), con pez opcional en la boca
export function oso(ctx, t, x, y, s = 1, opt = {}) { ctx.save(); ctx.translate(x, y); ctx.scale((opt.mira || 1) * s, s); const c = '#7a4f2e';
  ctx.fillStyle = 'rgba(30,20,40,0.22)'; ctx.beginPath(); ctx.ellipse(0, 4, 200, 26, 0, 0, 7); ctx.fill();
  for (const lx of [-120, -60, 70, 130]) { rr(ctx, lx - 26, -120, 52, 124, 22); volumen(ctx, tono(c, -0.1), lx - 26, -120, 52, 124, 4); }
  ctx.beginPath(); ctx.ellipse(0, -170, 190, 110, 0, 0, 7); volumen(ctx, c, -190, -280, 380, 220, 5);
  ctx.save(); ctx.translate(190, -220 + Math.sin(t * 3) * 6); ctx.rotate(opt.cabeza || 0);
  elipse(ctx, -20, -80, 26, 26, c, 4); elipse(ctx, 60, -80, 26, 26, c, 4); elipse(ctx, 20, 0, 100, 86, c, 5); elipse(ctx, 80, 20, 48, 36, '#c49a6c', 4);
  ctx.beginPath(); ctx.ellipse(112, 8, 16, 12, 0, 0, 7); ctx.fillStyle = '#1b1620'; ctx.fill();
  for (const ex of [0, 46]) { ctx.beginPath(); ctx.arc(ex, -20, 12, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.beginPath(); ctx.arc(ex + 3, -18, 7, 0, 7); ctx.fillStyle = '#1b1620'; ctx.fill(); }
  if (opt.pez) { ctx.save(); ctx.translate(90, 60); ctx.rotate(0.3 + Math.sin(t * 12) * 0.2); pez(ctx, t, 0, 0, 0.9); ctx.restore(); }
  if (opt.dolor) { ctx.save(); ctx.translate(20, -110); for (let i = 0; i < 3; i++) { const a = t * 6 + i * 2.1; ctx.fillStyle = '#ffd93d'; ctx.beginPath(); for (let j = 0; j < 10; j++) { const r = j % 2 ? 7 : 16, an = j / 10 * 6.283; ctx.lineTo(Math.cos(a) * 60 + Math.cos(an) * r, Math.sin(a) * 18 + Math.sin(an) * r); } ctx.fill(); } ctx.restore(); }
  ctx.restore(); ctx.restore(); }
export function pez(ctx, t, x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(-90, 0); ctx.quadraticCurveTo(0, -50, 80, 0); ctx.quadraticCurveTo(0, 50, -90, 0); ctx.closePath(); volumen(ctx, '#9ab8c8', -90, -40, 170, 80, 4); ctx.beginPath(); ctx.moveTo(-80, 0); ctx.lineTo(-130, -36 + Math.sin(t * 14) * 8); ctx.lineTo(-130, 36 + Math.sin(t * 14) * 8); ctx.closePath(); volumen(ctx, '#86a6b8', -130, -36, 50, 72, 3); ctx.fillStyle = 'rgba(230,120,140,0.5)'; ctx.fillRect(-50, -6, 100, 12); ctx.beginPath(); ctx.arc(50, -8, 6, 0, 7); ctx.fillStyle = '#1b1620'; ctx.fill(); ctx.restore(); }
// Caña de pescar con sedal desde la mano
export function cana(ctx, t, hx, hy, len = 420, ang = -0.9) { const ex = hx + Math.cos(ang) * len, ey = hy + Math.sin(ang) * len; ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = '#5a3a22'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(ex, ey); ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.quadraticCurveTo(ex + 60, ey + 200, ex + 40, 1290 + Math.sin(t * 3) * 6); ctx.stroke(); ctx.restore(); return [ex, ey]; }
// Rama
export function rama(ctx, x, y, ang, len = 300) { ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.lineCap = 'round'; ctx.strokeStyle = '#6b4a2e'; ctx.lineWidth = 22; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(len, 0); ctx.moveTo(len * 0.6, 0); ctx.lineTo(len * 0.8, -50); ctx.stroke(); ctx.fillStyle = '#4f9a4c'; ctx.beginPath(); ctx.ellipse(len * 0.82, -58, 26, 14, 0.4, 0, 7); ctx.ellipse(len, 0, 26, 14, 0, 0, 7); ctx.fill(); ctx.restore(); }

// ---- Espacio
export function espacio(ctx, t, cam) { capa(ctx, cam, 0.3, () => { const g = ctx.createLinearGradient(0, -300, 0, H); g.addColorStop(0, '#05071a'); g.addColorStop(1, '#1b1640'); ctx.fillStyle = g; ctx.fillRect(-600, -600, W + 1200, H + 1200); for (let i = 0; i < 140; i++) { ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i)); ctx.fillStyle = '#fff'; const r = hash(i + 7) * 3 + 1; ctx.fillRect(-300 + hash(i) * 1700, -200 + hash(i + 50) * 1900, r, r); } ctx.globalAlpha = 1; const n = ctx.createRadialGradient(300, 600, 10, 300, 600, 500); n.addColorStop(0, 'rgba(160,90,200,0.25)'); n.addColorStop(1, 'rgba(160,90,200,0)'); ctx.fillStyle = n; ctx.fillRect(-300, 0, 1200, 1200); }); }
export function estrellaN(ctx, t, x, y, r) { const g = ctx.createRadialGradient(x, y, r * 0.1, x, y, r * 3); g.addColorStop(0, 'rgba(170,230,255,0.7)'); g.addColorStop(1, 'rgba(120,180,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 3, 0, 7); ctx.fill(); ctx.save(); ctx.translate(x, y); ctx.rotate(t * 1.2); ctx.fillStyle = 'rgba(180,235,255,0.35)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-r * 0.25, -r * 5); ctx.lineTo(r * 0.25, -r * 5); ctx.closePath(); ctx.moveTo(0, 0); ctx.lineTo(-r * 0.25, r * 5); ctx.lineTo(r * 0.25, r * 5); ctx.closePath(); ctx.fill(); ctx.restore(); const c = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 2, x, y, r); c.addColorStop(0, '#ffffff'); c.addColorStop(0.5, '#a6ecff'); c.addColorStop(1, '#3a7bff'); ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.strokeStyle = LINEA; ctx.lineWidth = 3; ctx.stroke(); }
export function sol(ctx, t, x, y, r) { const g = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 1.4); g.addColorStop(0, 'rgba(255,200,80,0.6)'); g.addColorStop(1, 'rgba(255,160,40,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 1.4, 0, 7); ctx.fill(); const c = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 4, x, y, r); c.addColorStop(0, '#fff6c0'); c.addColorStop(0.5, '#ffc93d'); c.addColorStop(1, '#ff8a2a'); ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(230,120,30,0.35)'; for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.arc(x + Math.cos(i * 2.3 + t * 0.2) * r * 0.6 * hash(i), y + Math.sin(i * 1.7) * r * 0.6, r * 0.08, 0, 7); ctx.fill(); } }
// Silueta de ciudad (rascacielos con ventanas)
export function ciudad(ctx, t, x, y, w, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); for (let i = 0; i < 12; i++) { const bw = 50 + hash(i) * 40, bh = 120 + hash(i + 9) * 260, bx = -w / 2 + i * (w / 12); rr(ctx, bx, -bh, bw, bh, 4); volumen(ctx, ['#4a5a7a', '#5a6a8a', '#3e4c6a'][i % 3], bx, -bh, bw, bh, 3); ctx.fillStyle = '#ffe27a'; for (let j = 0; j < bh / 30 - 1; j++) for (let k = 0; k < 2; k++) if (hash(i * 50 + j * 3 + k) > 0.4) ctx.fillRect(bx + 10 + k * (bw - 30), -bh + 14 + j * 30, 10, 14); } ctx.restore(); }
// Corte de la Tierra (capas) con algo bajando por el centro a profundidad k
export function corteTierra(ctx, t, x, y, R, k, dibujaObjeto) {
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.clip();
  [['#3f8fd0', 1], ['#5aa64e', 0.985], ['#8d5a3b', 0.95], ['#c0562a', 0.78], ['#ff8a3d', 0.55], ['#ffd23d', 0.3]].forEach(([c, f]) => { ctx.beginPath(); ctx.arc(x, y, R * f, 0, 7); ctx.fillStyle = c; ctx.fill(); });
  const cg = ctx.createRadialGradient(x, y, 4, x, y, R * 0.3); cg.addColorStop(0, '#fffbe0'); cg.addColorStop(1, 'rgba(255,240,150,0)'); ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(x, y, R * 0.3, 0, 7); ctx.fill();
  // cuña recortada (vista interior)
  ctx.restore();
  ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.strokeStyle = LINEA; ctx.lineWidth = 6; ctx.stroke();
  const oy = lerp(y - R - 40, y, k); ctx.strokeStyle = 'rgba(200,240,255,0.8)'; ctx.lineWidth = 8; ctx.setLineDash([18, 14]); ctx.beginPath(); ctx.moveTo(x, y - R); ctx.lineTo(x, oy); ctx.stroke(); ctx.setLineDash([]);
  if (dibujaObjeto) dibujaObjeto(x, oy);
}
// Grúa intentando levantar algo (brazo + cable + gancho); dobla = 0..1 cuánto se dobla
export function grua(ctx, t, x, y, s = 1, dobla = 0, cableY = 300) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rr(ctx, -150, -120, 300, 100, 12); volumen(ctx, '#f2b33d', -150, -120, 300, 100, 5); rr(ctx, -40, -230, 140, 120, 10); volumen(ctx, '#f2b33d', -40, -230, 140, 120, 4); rr(ctx, -20, -210, 70, 60, 6); ctx.fillStyle = '#bfe2f2'; ctx.fill();
  for (const wx of [-100, 0, 100]) elipse(ctx, wx, -14, 34, 34, '#2a2a30', 4);
  ctx.save(); ctx.translate(30, -200); const a = -1.0 + dobla * 0.55; ctx.rotate(a);
  ctx.strokeStyle = '#d99a2a'; ctx.lineWidth = 30; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(300, dobla * 160, 600, dobla * 260); ctx.stroke(); ctx.strokeStyle = LINEA; ctx.lineWidth = 3; ctx.stroke();
  ctx.restore();
  const tipX = 30 + Math.cos(a) * 600 - Math.sin(a) * dobla * 260, tipY = -200 + Math.sin(a) * 600 + Math.cos(a) * dobla * 260;
  ctx.strokeStyle = '#333'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(tipX, tipY); ctx.lineTo(tipX, tipY + cableY); ctx.stroke();
  ctx.restore(); return [x + tipX * s, y + (tipY + cableY) * s]; }
// Signo de exclamación / interrogación sobre una cabeza
export function signo(ctx, t, t0, x, y, txt = '!', col = '#ffd93d') { const k = ph(t, t0, t0 + 0.25); if (k <= 0) return; ctx.save(); ctx.translate(x, y - 20 * back(k)); ctx.scale(back(k), back(k)); texto(ctx, txt, 0, 0, 110, col); ctx.restore(); }
// Líneas de movimiento/impacto alrededor de un punto
export function impacto(ctx, t, x, y, k, r = 120, col = '#ffffff') { if (k <= 0 || k >= 1) return; ctx.save(); ctx.globalAlpha = 1 - k; ctx.strokeStyle = col; ctx.lineWidth = 10; ctx.lineCap = 'round'; for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r * (0.5 + k), y + Math.sin(a) * r * (0.5 + k)); ctx.lineTo(x + Math.cos(a) * r * (0.9 + k * 1.3), y + Math.sin(a) * r * (0.9 + k * 1.3)); ctx.stroke(); } ctx.restore(); }

// ---------------- ACCIÓN: andar, puertas, vasos, objetos que caen ----------------
// paso(t, t0, t1, x0, x1): posición y fase de andar entre dos instantes (fase null = parado)
export function paso(t, t0, t1, x0, x1, vel = 9) { const k = ph(t, t0, t1); const mueve = k > 0 && k < 1; return { x: lerp(x0, x1, ease(k) * 0.15 + k * 0.85), anda: mueve ? t * vel : null, lado: x1 >= x0 ? 1 : -1, k }; }
// alcance(t, t0, dur, desde, hasta): mano que va a coger algo y vuelve (0→1→0 si vuelve)
export function alcance(t, t0, t1, a, b) { const k = ease(ph(t, t0, t1)); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]; }
// puerta con marco que se abre (abre 0..1), bisagra a la izquierda
export function puerta(ctx, x, y, w, h, abre = 0, col = '#8a5a36', cartel) { rr(ctx, x - 14, y - h - 14, w + 28, h + 14, 6); volumen(ctx, '#e9e4da', x - 14, y - h - 14, w + 28, h + 14, 4); ctx.fillStyle = '#2a2030'; ctx.fillRect(x, y - h, w, h);
  const ww = w * Math.cos(abre * 1.35); ctx.save(); ctx.beginPath(); ctx.moveTo(x, y - h); ctx.lineTo(x + ww, y - h - 18 * abre); ctx.lineTo(x + ww, y + 18 * abre); ctx.lineTo(x, y); ctx.closePath(); volumen(ctx, abre > 0.5 ? tono(col, -0.2) : col, x, y - h, Math.max(4, ww), h, 4);
  if (ww > 30) { ctx.beginPath(); ctx.arc(x + ww - 26, y - h / 2, 10, 0, 7); ctx.fillStyle = '#e8c04a'; ctx.fill(); ctx.strokeStyle = LINEA; ctx.lineWidth = 3; ctx.stroke(); if (cartel && abre < 0.4) texto(ctx, cartel, x + ww / 2, y - h * 0.72, 60, '#fff'); }
  ctx.restore(); }
// vaso con líquido (nivel 0..1), centrado en la base
export function vaso(ctx, x, y, s = 1, nivel = 0.8, col = '#7fc8ff', rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(-34, -100); ctx.lineTo(-26, 0); ctx.lineTo(26, 0); ctx.lineTo(34, -100); ctx.closePath(); ctx.fillStyle = 'rgba(230,245,255,0.55)'; ctx.fill();
  if (nivel > 0) { ctx.save(); ctx.clip(); ctx.rotate(-rot); ctx.fillStyle = col; ctx.fillRect(-80, -100 * nivel, 160, 200); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(-80, -100 * nivel, 160, 6); ctx.restore(); }
  ctx.beginPath(); ctx.moveTo(-34, -100); ctx.lineTo(-26, 0); ctx.lineTo(26, 0); ctx.lineTo(34, -100); ctx.strokeStyle = LINEA; ctx.lineWidth = 4; ctx.stroke(); ctx.restore(); }
// silla vista de frente; el personaje se sienta encima con pose.sentado
export function silla(ctx, x, y, s = 1, col = '#b0473a') { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(ctx, -120, -300, 240, 240, 20); volumen(ctx, col, -120, -300, 240, 240, 4); rr(ctx, -140, -80, 280, 40, 10); volumen(ctx, tono(col, 0.1), -140, -80, 280, 40, 4); for (const k of [-1, 1]) { rr(ctx, k * 110 - 10, -42, 20, 42, 6); ctx.fillStyle = '#4a3528'; ctx.fill(); } ctx.restore(); }
// salpicón (k 0..1) para líquidos o caídas
export function salpica(ctx, x, y, k, col = '#7fc8ff', n = 9, r = 160) { if (k <= 0 || k >= 1) return; ctx.save(); ctx.globalAlpha = 1 - k; for (let i = 0; i < n; i++) { const a = -Math.PI * (0.1 + 0.8 * i / (n - 1)), d = r * k; ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d + k * k * 120, 14 * (1 - k * 0.5), 0, 7); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = LINEA; ctx.lineWidth = 2; ctx.stroke(); } ctx.restore(); }
// caída con rebote: devuelve y para un objeto soltado en t0 desde y0 hasta el suelo yS
export function cae(t, t0, y0, yS, dur = 0.5) { const k = ph(t, t0, t0 + dur); if (k < 1) return lerp(y0, yS, k * k); const r = ph(t, t0 + dur, t0 + dur + 0.3); return yS - Math.sin(r * Math.PI) * (yS - y0) * 0.12; }
