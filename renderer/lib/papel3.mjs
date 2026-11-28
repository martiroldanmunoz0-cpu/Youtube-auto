// Accesorios y fondos PAPEL — tanda "qué pasaría si" + supervivencia (agua, Sol, caída, balsa)
import { W, H, clamp, lerp, ease, ph, capa, SUELO, rr, volumen, hash, texto, pino } from './papel.mjs';
const L = '#2a2230';

// ---------- CIELO / MAR ----------
export function cielo(ctx, cam, c1, c2, prof = 0.3) { capa(ctx, cam, prof, () => { const g = ctx.createLinearGradient(0, -300, 0, SUELO); g.addColorStop(0, c1); g.addColorStop(1, c2); ctx.fillStyle = g; ctx.fillRect(-600, -600, W + 1200, SUELO + 900); }); }
// Mar abierto: nivel = altura del horizonte (world y); seco 0..1 = el agua desaparece
export function mar(ctx, t, cam, { horizonte = 900, cielo: cs = ['#7cc4ef', '#d9f0fa'], seco = 0, noche = false, tormenta = false } = {}) {
  const C = noche ? ['#05071a', '#1b1640'] : tormenta ? ['#3b4256', '#7c8296'] : cs; cielo(ctx, cam, C[0], C[1]);
  if (noche) capa(ctx, cam, 0.3, () => { for (let i = 0; i < 70; i++) { ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i)); ctx.fillStyle = '#fff'; ctx.fillRect(-200 + hash(i) * 1500, hash(i + 50) * horizonte, 3, 3); } ctx.globalAlpha = 1; });
  capa(ctx, cam, 0.7, () => {
    const hz = horizonte + seco * 700;
    if (seco > 0) { // lecho marino que queda al descubierto
      const g = ctx.createLinearGradient(0, horizonte, 0, SUELO + 300); g.addColorStop(0, '#c9a874'); g.addColorStop(1, '#8a6a44'); ctx.fillStyle = g; ctx.fillRect(-600, horizonte, W + 1200, SUELO + 600 - horizonte);
      ctx.fillStyle = 'rgba(90,60,30,0.25)'; for (let i = 0; i < 14; i++) { ctx.beginPath(); ctx.ellipse(-200 + hash(i) * 1500, horizonte + 60 + hash(i + 3) * 600, 60 + hash(i) * 80, 14, 0, 0, 7); ctx.fill(); }
    }
    const g = ctx.createLinearGradient(0, hz, 0, SUELO + 300); g.addColorStop(0, noche ? '#1a2a5a' : '#2f8fd0'); g.addColorStop(1, noche ? '#0a1430' : '#1a5a9a');
    ctx.fillStyle = g; ctx.globalAlpha = 1 - seco * 0.999; ctx.fillRect(-600, hz, W + 1200, SUELO + 600 - hz);
    ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    for (let i = 0; i < 26; i++) { const y = hz + 40 + hash(i + 9) * (SUELO + 200 - hz), x = (-300 + hash(i) * 1700 + t * 40 * (1 + hash(i))) % 1700 - 300; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 30, y - 14, x + 60, y); ctx.stroke(); }
    ctx.globalAlpha = 1;
  });
}
// Olas en primer plano (pantalla, por delante de una balsa)
export function olasDelante(ctx, t, cam, y = SUELO - 40, col = '#2a80c4') { capa(ctx, cam, 1, () => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-600, SUELO + 600); for (let x = -600; x <= W + 600; x += 30) ctx.lineTo(x, y + Math.sin(x * 0.012 + t * 2.2) * 22 + Math.sin(x * 0.03 - t * 3) * 8); ctx.lineTo(W + 600, SUELO + 600); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 7; ctx.beginPath(); for (let x = -600; x <= W + 600; x += 30) { const yy = y + Math.sin(x * 0.012 + t * 2.2) * 22 + Math.sin(x * 0.03 - t * 3) * 8; x === -600 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); } ctx.stroke(); }); }

// ---------- AGUA ----------
// Barco de carga: x,y = quilla; rot
export function barco(ctx, t, x, y, s = 1, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-330, -150); ctx.lineTo(330, -150); ctx.lineTo(260, 0); ctx.lineTo(-290, 0); ctx.closePath(); volumen(ctx, '#c0392b', -330, -150, 660, 150, 5);
  ctx.fillStyle = '#2a3440'; ctx.fillRect(-330, -150, 660, 40);
  const cont = ['#3a86b8', '#f2b33a', '#2fae7f', '#e8503a', '#9a5ad0'];
  for (let i = 0; i < 8; i++) for (let j = 0; j < 2; j++) { rr(ctx, -250 + i * 56, -230 - j * 70, 52, 66, 3); volumen(ctx, cont[(i + j * 3) % 5], -250 + i * 56, -230 - j * 70, 52, 66, 3); }
  rr(ctx, 210, -330, 100, 180, 6); volumen(ctx, '#f4efe2', 210, -330, 100, 180, 4); for (let i = 0; i < 3; i++) { ctx.fillStyle = '#5fb3d9'; ctx.fillRect(225 + i * 26, -310, 18, 22); }
  rr(ctx, 240, -400, 34, 70, 4); volumen(ctx, '#2a3440', 240, -400, 34, 70, 3);
  ctx.restore(); }
// Botella de agua (nivel 0..1)
export function botella(ctx, x, y, s = 1, nivel = 1, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(-40, -150); ctx.quadraticCurveTo(-40, -190, -16, -205); ctx.lineTo(-16, -230); ctx.lineTo(16, -230); ctx.lineTo(16, -205); ctx.quadraticCurveTo(40, -190, 40, -150); ctx.lineTo(40, 0); ctx.closePath();
  ctx.fillStyle = 'rgba(220,240,255,0.55)'; ctx.fill(); ctx.save(); ctx.clip(); if (nivel > 0) { ctx.fillStyle = '#5fb3e9'; ctx.fillRect(-40, -190 * nivel, 80, 190 * nivel); } ctx.restore();
  ctx.strokeStyle = L; ctx.lineWidth = 5; ctx.stroke(); rr(ctx, -18, -250, 36, 22, 4); volumen(ctx, '#3a86b8', -18, -250, 36, 22, 3);
  rr(ctx, -40, -120, 80, 46, 2); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = L; ctx.lineWidth = 3; ctx.stroke(); texto(ctx, 'H2O', 0, -97, 28, '#3a86b8');
  ctx.restore(); }
// Planta en maceta; seca 0..1
export function planta(ctx, t, x, y, s = 1, seca = 0) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const verde = seca > 0.5 ? '#a8946a' : '#4fae5a';
  for (let i = 0; i < 5; i++) { const a = -1.57 + (i - 2) * 0.45 + seca * (i - 2) * 0.5; const caida = seca * 1.2 * Math.sign(i - 2 || 1); ctx.save(); ctx.translate(0, -90); ctx.rotate(a + 1.57 + caida * 0.5 + Math.sin(t * 2 + i) * 0.03); ctx.beginPath(); ctx.ellipse(0, -80, 26, 80, 0, 0, 7); volumen(ctx, i % 2 ? verde : (seca > 0.5 ? '#9a8458' : '#3f9a4a'), -26, -160, 52, 160, 3); ctx.restore(); }
  ctx.beginPath(); ctx.moveTo(-70, -100); ctx.lineTo(70, -100); ctx.lineTo(55, 0); ctx.lineTo(-55, 0); ctx.closePath(); volumen(ctx, '#c46a3a', -70, -100, 140, 100, 4);
  if (seca > 0.4) { ctx.strokeStyle = 'rgba(60,40,20,0.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-30, -80); ctx.lineTo(-10, -40); ctx.lineTo(-24, -10); ctx.stroke(); }
  ctx.restore(); }
// Grifo que no echa agua (gota opcional)
export function grifo(ctx, t, x, y, s = 1, gota = 0) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rr(ctx, -20, -60, 40, 80, 6); volumen(ctx, '#b8c0cc', -20, -60, 40, 80, 3); rr(ctx, -10, -40, 150, 34, 14); volumen(ctx, '#c8d0dc', -10, -40, 150, 34, 3); rr(ctx, 110, -20, 34, 50, 8); volumen(ctx, '#c8d0dc', 110, -20, 34, 50, 3);
  rr(ctx, -50, -90, 100, 30, 10); volumen(ctx, '#d8dee8', -50, -90, 100, 30, 3);
  if (gota > 0) { ctx.beginPath(); ctx.arc(127, 50 + gota * 60, 12, 0, 7); ctx.fillStyle = '#5fb3e9'; ctx.fill(); ctx.strokeStyle = L; ctx.lineWidth = 3; ctx.stroke(); }
  ctx.restore(); }
// Corte de fosa oceánica con Everest dentro (k 0..1 = aparece el Everest)
export function fosa(ctx, t, x, y, s = 1, k = 0) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-600, -700); ctx.lineTo(-200, -700); ctx.quadraticCurveTo(-120, 0, 0, 40); ctx.quadraticCurveTo(120, 0, 200, -700); ctx.lineTo(600, -700); ctx.lineTo(600, 300); ctx.lineTo(-600, 300); ctx.closePath(); volumen(ctx, '#a8865a', -600, -700, 1200, 1000, 5);
  ctx.fillStyle = 'rgba(70,45,25,0.25)'; for (let i = 0; i < 8; i++) { ctx.fillRect(-600, -600 + i * 110, 1200, 10); }
  if (k > 0) { const e = ease(k); ctx.save(); ctx.translate(0, 30 + (1 - e) * 400); ctx.beginPath(); ctx.moveTo(-150, 0); ctx.lineTo(-30, -560); ctx.lineTo(10, -540); ctx.lineTo(40, -600); ctx.lineTo(160, 0); ctx.closePath(); volumen(ctx, '#7b8aa8', -150, -600, 310, 600, 4); ctx.beginPath(); ctx.moveTo(-60, -430); ctx.lineTo(-30, -560); ctx.lineTo(10, -540); ctx.lineTo(40, -600); ctx.lineTo(80, -440); ctx.lineTo(30, -470); ctx.lineTo(0, -430); ctx.lineTo(-30, -460); ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = L; ctx.lineWidth = 4; ctx.stroke(); ctx.restore(); }
  // flecha de cota
  ctx.strokeStyle = '#ffd93d'; ctx.lineWidth = 8; ctx.setLineDash([24, 16]); ctx.beginPath(); ctx.moveTo(260, -700); ctx.lineTo(260, 40); ctx.stroke(); ctx.setLineDash([]);
  ctx.restore(); }

// ---------- ESPACIO ----------
export function tierra(ctx, t, x, y, r, luz = 1) { ctx.save(); ctx.translate(x, y);
  if (luz > 0) { const g = ctx.createRadialGradient(0, 0, r * 0.9, 0, 0, r * 1.25); g.addColorStop(0, `rgba(120,200,255,${0.5 * luz})`); g.addColorStop(1, 'rgba(120,200,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r * 1.25, 0, 7); ctx.fill(); }
  ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fillStyle = '#2f7fc8'; ctx.fill(); ctx.save(); ctx.clip();
  ctx.fillStyle = '#4fae5a'; for (let i = 0; i < 6; i++) { const a = i * 1.1 + t * 0.15; ctx.beginPath(); ctx.ellipse(Math.cos(a) * r * 0.55, Math.sin(i * 2.1) * r * 0.5, r * (0.22 + hash(i) * 0.15), r * (0.14 + hash(i + 3) * 0.12), i, 0, 7); ctx.fill(); }
  ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.ellipse(0, -r * 0.92, r * 0.5, r * 0.14, 0, 0, 7); ctx.ellipse(0, r * 0.94, r * 0.45, r * 0.12, 0, 0, 7); ctx.fill();
  const sh = ctx.createLinearGradient(-r, 0, r, 0); sh.addColorStop(0, `rgba(5,7,26,${0.1 + (1 - luz) * 0.85})`); sh.addColorStop(1, `rgba(5,7,26,${0.55 + (1 - luz) * 0.4})`); ctx.fillStyle = sh; ctx.fillRect(-r, -r, 2 * r, 2 * r);
  ctx.restore(); ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.strokeStyle = L; ctx.lineWidth = 5; ctx.stroke(); ctx.restore(); }
export function luna(ctx, x, y, r, luz = 1) { ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); const c = Math.round(lerp(40, 236, luz)); ctx.fillStyle = `rgb(${c},${c - 6},${c - 20})`; ctx.fill(); ctx.strokeStyle = L; ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = `rgba(0,0,0,${0.12})`; for (const [dx, dy, rr2] of [[-0.3, -0.2, 0.22], [0.3, 0.25, 0.16], [0.1, -0.4, 0.1]]) { ctx.beginPath(); ctx.arc(x + dx * r, y + dy * r, rr2 * r, 0, 7); ctx.fill(); }
  if (luz > 0.3) { const g = ctx.createRadialGradient(x, y, r, x, y, r * 1.6); g.addColorStop(0, `rgba(255,250,220,${0.35 * luz})`); g.addColorStop(1, 'rgba(255,250,220,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 1.6, 0, 7); ctx.fill(); }
  ctx.restore(); }
// Termómetro: k 0..1 nivel de mercurio
export function termometro(ctx, x, y, h, k, col = '#e8503a') { ctx.save(); ctx.translate(x, y); rr(ctx, -34, -h, 68, h, 34); volumen(ctx, '#f4efe2', -34, -h, 68, h, 4);
  rr(ctx, -14, -h + 30, 28, h - 40, 14); ctx.fillStyle = '#ddd'; ctx.fill(); const lh = (h - 60) * clamp(k); rr(ctx, -14, -lh - 20, 28, lh + 20, 14); ctx.fillStyle = col; ctx.fill();
  ctx.beginPath(); ctx.arc(0, 0, 54, 0, 7); volumen(ctx, col, -54, -54, 108, 108, 4); for (let i = 1; i < 6; i++) { ctx.fillStyle = L; ctx.fillRect(18, -h + i * (h / 6), 24, 5); } ctx.restore(); }
// Chimenea hidrotermal con gusanos tubo
export function fumarola(ctx, t, x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (let i = 0; i < 10; i++) { const k = (t * 0.5 + hash(i)) % 1; ctx.globalAlpha = 0.6 * (1 - k); ctx.fillStyle = '#3a3440'; ctx.beginPath(); ctx.arc(Math.sin(i + t) * 30 * k, -320 - k * 500, 40 + k * 90, 0, 7); ctx.fill(); } ctx.globalAlpha = 1;
  ctx.beginPath(); ctx.moveTo(-160, 0); ctx.lineTo(-60, -320); ctx.lineTo(60, -320); ctx.lineTo(160, 0); ctx.closePath(); volumen(ctx, '#4a3a3a', -160, -320, 320, 320, 5);
  const g = ctx.createRadialGradient(0, -320, 5, 0, -320, 80); g.addColorStop(0, 'rgba(255,150,60,0.9)'); g.addColorStop(1, 'rgba(255,100,40,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -320, 80, 0, 7); ctx.fill();
  ctx.restore(); }
export function gusanoTubo(ctx, t, x, y, s = 1, i = 0) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const sw = Math.sin(t * 2 + i) * 0.08; ctx.rotate(sw);
  rr(ctx, -16, -220, 32, 220, 14); volumen(ctx, '#f4efe2', -16, -220, 32, 220, 3);
  ctx.beginPath(); ctx.ellipse(0, -240, 30, 44, 0, 0, 7); volumen(ctx, '#e83a4a', -30, -284, 60, 88, 3);
  for (const k of [-1, 1]) { ctx.beginPath(); ctx.arc(k * 10, -246, 7, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.beginPath(); ctx.arc(k * 10, -246, 3.5, 0, 7); ctx.fillStyle = '#111'; ctx.fill(); }
  ctx.restore(); }

// ---------- AVIÓN / CAÍDA ----------
export function avion(ctx, t, x, y, s = 1, rot = 0, roto = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const sep = roto * 160;
  // cola
  ctx.save(); ctx.translate(-sep, sep * 0.3); ctx.rotate(-roto * 0.5);
  ctx.beginPath(); ctx.moveTo(-420, -30); ctx.lineTo(-480, -170); ctx.lineTo(-420, -170); ctx.lineTo(-330, -40); ctx.closePath(); volumen(ctx, '#c0392b', -480, -170, 150, 140, 4);
  rr(ctx, -440, -50, 340, 100, 46); volumen(ctx, '#f4efe2', -440, -50, 340, 100, 5); for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(-380 + i * 60, -10, 11, 0, 7); ctx.fillStyle = '#5fb3d9'; ctx.fill(); }
  ctx.fillStyle = '#c0392b'; ctx.fillRect(-440, 14, 340, 10); ctx.restore();
  // morro + alas
  ctx.save(); ctx.translate(sep * 0.4, -sep * 0.2); ctx.rotate(roto * 0.3);
  ctx.beginPath(); ctx.moveTo(-60, 10); ctx.lineTo(60, 160); ctx.lineTo(140, 160); ctx.lineTo(100, 10); ctx.closePath(); volumen(ctx, '#d8dee8', -60, 10, 200, 150, 4);
  ctx.beginPath(); ctx.moveTo(-100, -50); ctx.lineTo(300, -50); ctx.quadraticCurveTo(420, -40, 430, 10); ctx.quadraticCurveTo(420, 50, 300, 50); ctx.lineTo(-100, 50); ctx.closePath(); volumen(ctx, '#f4efe2', -100, -50, 530, 100, 5);
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(-60 + i * 60, -10, 11, 0, 7); ctx.fillStyle = '#5fb3d9'; ctx.fill(); } ctx.fillStyle = '#2a3440'; ctx.beginPath(); ctx.moveTo(370, -24); ctx.lineTo(410, -10); ctx.lineTo(370, -4); ctx.fill(); ctx.fillStyle = '#c0392b'; ctx.fillRect(-100, 14, 470, 10);
  ctx.restore();
  ctx.restore(); }
// Explosión de dibujo (k 0..1)
export function explosion(ctx, x, y, k, r = 220) { if (k <= 0 || k >= 1) return; ctx.save(); ctx.translate(x, y); const e = ease(clamp(k * 1.6)); ctx.globalAlpha = 1 - clamp((k - 0.5) * 2);
  const cols = ['#ffe27a', '#ff9a3a', '#e8503a']; for (let j = 2; j >= 0; j--) { ctx.beginPath(); for (let i = 0; i <= 16; i++) { const a = i / 16 * 6.283, rr2 = r * e * (1 - j * 0.25) * (i % 2 ? 0.7 : 1); i ? ctx.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2) : ctx.moveTo(Math.cos(a) * rr2, Math.sin(a) * rr2); } ctx.closePath(); ctx.fillStyle = cols[2 - j]; ctx.fill(); }
  ctx.restore(); }
// Trozo de fuselaje (tubo roto) visto de lado; dentro: fn para dibujar a alguien
export function fuselaje(ctx, t, x, y, s = 1, rot = 0, dentro) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  rr(ctx, -260, -120, 520, 240, 110); volumen(ctx, '#e8e2d8', -260, -120, 520, 240, 5); ctx.fillStyle = '#c0392b'; ctx.fillRect(-250, 50, 500, 14);
  // borde roto
  ctx.beginPath(); ctx.moveTo(200, -120); for (let i = 0; i <= 8; i++) ctx.lineTo(200 + (i % 2 ? 40 : 0), -120 + i * 30); ctx.lineTo(270, 120); ctx.lineTo(270, -120); ctx.closePath(); ctx.fillStyle = '#2a2230'; ctx.fill();
  rr(ctx, -200, -80, 360, 150, 60); ctx.fillStyle = '#4a4458'; ctx.fill(); if (dentro) { ctx.save(); rr(ctx, -200, -80, 360, 150, 60); ctx.clip(); dentro(); ctx.restore(); }
  ctx.restore(); }
export function carrito(ctx, x, y, s = 1, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); rr(ctx, -60, -150, 120, 150, 8); volumen(ctx, '#b8c0cc', -60, -150, 120, 150, 4); for (let i = 0; i < 3; i++) { ctx.fillStyle = '#8a92a0'; ctx.fillRect(-50, -130 + i * 45, 100, 6); } ctx.restore(); }
// Monte nevado con árboles
export function monteNevado(ctx, t, cam, { noche = false } = {}) {
  cielo(ctx, cam, noche ? '#1a2040' : '#9fb8d8', noche ? '#4a5070' : '#e8eef6');
  capa(ctx, cam, 0.5, () => { ctx.fillStyle = '#c8d4e4'; ctx.beginPath(); ctx.moveTo(-500, 1200); ctx.lineTo(200, 700); ctx.lineTo(500, 950); ctx.lineTo(900, 650); ctx.lineTo(1600, 1150); ctx.lineTo(1600, 1500); ctx.lineTo(-500, 1500); ctx.closePath(); ctx.fill(); });
  capa(ctx, cam, 0.8, () => { for (let i = 0; i < 12; i++) pino(ctx, -200 + i * 130 + hash(i) * 40, 1220 + hash(i + 2) * 80, 0.7 + hash(i + 5) * 0.3, true); });
  capa(ctx, cam, 1, () => { ctx.fillStyle = '#f4f8fc'; ctx.fillRect(-600, SUELO - 120, W + 1200, 900); ctx.fillStyle = 'rgba(160,180,210,0.35)'; for (let i = 0; i < 10; i++) { ctx.beginPath(); ctx.ellipse(-200 + hash(i) * 1500, SUELO - 60 + hash(i + 1) * 200, 120, 18, 0, 0, 7); ctx.fill(); } });
  capa(ctx, cam, 1, () => { ctx.fillStyle = 'rgba(255,255,255,0.85)'; for (let i = 0; i < 40; i++) { const k = (t * 0.15 + hash(i)) % 1; ctx.beginPath(); ctx.arc(-100 + hash(i + 7) * 1300 + Math.sin(t + i) * 20, -100 + k * 1700, 4 + hash(i) * 4, 0, 7); ctx.fill(); } });
}
// Habitación de hospital
export function hospital(ctx, t, cam) {
  capa(ctx, cam, 0.6, () => { ctx.fillStyle = '#d8ece8'; ctx.fillRect(-600, -600, W + 1200, SUELO + 600); ctx.fillStyle = '#b8dcd4'; ctx.fillRect(-600, 1050, W + 1200, 400);
    rr(ctx, 640, 360, 300, 380, 10); volumen(ctx, '#9fd4ef', 640, 360, 300, 380, 5); ctx.strokeStyle = '#f4efe2'; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(790, 360); ctx.lineTo(790, 740); ctx.moveTo(640, 550); ctx.lineTo(940, 550); ctx.stroke();
    // monitor
    rr(ctx, 140, 520, 200, 150, 10); volumen(ctx, '#2a3440', 140, 520, 200, 150, 4); ctx.strokeStyle = '#4dff88'; ctx.lineWidth = 5; ctx.beginPath(); for (let i = 0; i <= 40; i++) { const xx = 155 + i * 4.3, ph2 = (i / 40 + t * 0.8) % 1; const yy = 600 - (ph2 > 0.45 && ph2 < 0.5 ? 50 : ph2 > 0.5 && ph2 < 0.55 ? -30 : 0); i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke(); });
  capa(ctx, cam, 1, () => { ctx.fillStyle = '#cfd8dc'; ctx.fillRect(-600, SUELO - 40, W + 1200, 800); });
}
export function camilla(ctx, x, y, w = 560) { rr(ctx, x - w / 2, y - 150, w, 60, 14); volumen(ctx, '#f4efe2', x - w / 2, y - 150, w, 60, 4); rr(ctx, x - w / 2 - 20, y - 280, 30, 280, 8); volumen(ctx, '#b8c0cc', x - w / 2 - 20, y - 280, 30, 280, 3); rr(ctx, x + w / 2 - 10, y - 220, 30, 220, 8); volumen(ctx, '#b8c0cc', x + w / 2 - 10, y - 220, 30, 220, 3); }
// Escayola (pierna/brazo enyesado) — se dibuja encima
export function yeso(ctx, x, y, w, h, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); rr(ctx, -w / 2, -h / 2, w, h, w / 2.4); volumen(ctx, '#fbfaf6', -w / 2, -h / 2, w, h, 4); ctx.strokeStyle = 'rgba(150,150,160,0.5)'; ctx.lineWidth = 3; for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2 + i * h / 4); ctx.lineTo(w / 2, -h / 2 + i * h / 4 + 10); ctx.stroke(); } ctx.restore(); }

// ---------- BALSA ----------
export function balsa(ctx, t, x, y, s = 1, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot + Math.sin(t * 1.8) * 0.03); ctx.scale(s, s);
  for (let i = 0; i < 7; i++) { rr(ctx, -330 + i * 95, -30, 90, 50, 10); volumen(ctx, i % 2 ? '#a8784a' : '#b8885a', -330 + i * 95, -30, 90, 50, 3); }
  ctx.fillStyle = '#6b4a2e'; ctx.fillRect(-340, -12, 680, 12); ctx.fillRect(-340, 8, 680, 8);
  ctx.restore(); }
export function gaviota(ctx, t, x, y, s = 1, dir = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(dir * s, s); const a = Math.sin(t * 9) * 0.5;
  ctx.beginPath(); ctx.ellipse(0, 0, 50, 22, 0, 0, 7); volumen(ctx, '#f4f4f4', -50, -22, 100, 44, 3);
  ctx.beginPath(); ctx.arc(46, -14, 18, 0, 7); volumen(ctx, '#f4f4f4', 28, -32, 36, 36, 3); ctx.fillStyle = '#f2b33a'; ctx.beginPath(); ctx.moveTo(60, -16); ctx.lineTo(90, -10); ctx.lineTo(60, -6); ctx.fill(); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(50, -18, 4, 0, 7); ctx.fill();
  for (const k of [-1, 1]) { ctx.save(); ctx.rotate(k * a - 0.2); ctx.beginPath(); ctx.moveTo(-10, -6); ctx.quadraticCurveTo(-30, -70, -90, -60); ctx.quadraticCurveTo(-40, -30, 10, -4); ctx.closePath(); volumen(ctx, k > 0 ? '#e0e4ea' : '#c8ced8', -90, -70, 100, 70, 3); ctx.restore(); }
  ctx.restore(); }
export function tiburon(ctx, t, x, y, s = 1, dir = 1, boca = 0) { ctx.save(); ctx.translate(x, y); ctx.scale(dir * s, s);
  ctx.beginPath(); ctx.moveTo(-260, 0); ctx.lineTo(-340, -70 + Math.sin(t * 6) * 10); ctx.lineTo(-320, 0); ctx.lineTo(-340, 70 + Math.sin(t * 6) * 10); ctx.closePath(); volumen(ctx, '#6a7a8c', -340, -70, 80, 140, 3);
  ctx.beginPath(); ctx.moveTo(-270, 0); ctx.quadraticCurveTo(-100, -90, 160, -30); ctx.quadraticCurveTo(250, 0, 160, 40 + boca * 30); ctx.quadraticCurveTo(-100, 80, -270, 0); ctx.closePath(); volumen(ctx, '#7f90a4', -270, -90, 520, 170, 4);
  ctx.fillStyle = '#e8eef4'; ctx.beginPath(); ctx.moveTo(-200, 20); ctx.quadraticCurveTo(0, 70, 170, 36 + boca * 26); ctx.quadraticCurveTo(0, 40, -200, 20); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-40, -60); ctx.lineTo(10, -170); ctx.lineTo(60, -50); ctx.closePath(); volumen(ctx, '#6a7a8c', -40, -170, 100, 120, 3);
  ctx.beginPath(); ctx.arc(120, -18, 9, 0, 7); ctx.fillStyle = '#111'; ctx.fill();
  if (boca > 0) { ctx.fillStyle = '#5a1a24'; ctx.beginPath(); ctx.moveTo(100, 20); ctx.lineTo(190, 10); ctx.lineTo(180, 20 + boca * 40); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#fff'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(110 + i * 18, 18); ctx.lineTo(118 + i * 18, 30); ctx.lineTo(126 + i * 18, 17); ctx.fill(); } }
  ctx.restore(); }
// Jarra de agua (la del náufrago)
export function jarra(ctx, x, y, s = 1, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(-40, -120); ctx.lineTo(40, -120); ctx.quadraticCurveTo(70, -60, 50, 0); ctx.lineTo(-50, 0); ctx.quadraticCurveTo(-70, -60, -40, -120); ctx.closePath(); volumen(ctx, '#c8a46a', -70, -120, 140, 120, 4); ctx.beginPath(); ctx.arc(55, -70, 26, -1.2, 1.2); ctx.strokeStyle = L; ctx.lineWidth = 10; ctx.stroke(); ctx.restore(); }
// Anzuelo hecho con un clavo
export function anzuelo(ctx, x, y, s = 1, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.strokeStyle = '#8a92a0'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, -120); ctx.lineTo(0, 20); ctx.arc(-30, 20, 30, 0, 2.6); ctx.stroke(); ctx.strokeStyle = L; ctx.lineWidth = 3; ctx.stroke(); rr(ctx, -16, -134, 32, 16, 4); volumen(ctx, '#8a92a0', -16, -134, 32, 16, 2); ctx.restore(); }
// Barca de pesca
export function barca(ctx, t, x, y, s = 1, dir = 1) { ctx.save(); ctx.translate(x, y + Math.sin(t * 1.6) * 8); ctx.scale(dir * s, s);
  ctx.beginPath(); ctx.moveTo(-300, -110); ctx.lineTo(320, -130); ctx.lineTo(220, 20); ctx.lineTo(-240, 20); ctx.closePath(); volumen(ctx, '#3a86b8', -300, -130, 620, 150, 5); ctx.fillStyle = '#f4efe2'; ctx.fillRect(-290, -110, 600, 18);
  ctx.strokeStyle = '#6b4a2e'; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(0, -120); ctx.lineTo(0, -560); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(10, -540); ctx.quadraticCurveTo(200, -380, 220, -150); ctx.lineTo(10, -150); ctx.closePath(); volumen(ctx, '#f4e8c8', 10, -540, 210, 390, 4);
  ctx.restore(); }
// Hoguera (para la escena de "tú" escuchando la historia)
export function hoguera(ctx, t, x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const g = ctx.createRadialGradient(0, -60, 10, 0, -60, 420); g.addColorStop(0, 'rgba(255,190,90,0.45)'); g.addColorStop(1, 'rgba(255,150,60,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -60, 420, 0, 7); ctx.fill();
  for (const r of [-0.4, 0.4]) { ctx.save(); ctx.rotate(r); rr(ctx, -90, -16, 180, 32, 12); volumen(ctx, '#6b4a2e', -90, -16, 180, 32, 3); ctx.restore(); }
  for (let i = 0; i < 3; i++) { const fh = 120 + Math.sin(t * 9 + i * 2) * 20 - i * 25; ctx.beginPath(); ctx.moveTo(-50 + i * 14, -10); ctx.quadraticCurveTo(-40 + i * 10, -fh * 0.6, 0, -fh); ctx.quadraticCurveTo(40 - i * 10, -fh * 0.6, 50 - i * 14, -10); ctx.closePath(); ctx.fillStyle = ['#e8503a', '#ff9a3a', '#ffe27a'][i]; ctx.fill(); }
  ctx.restore(); }
// Contador de días grande (tarjeta)
export function contador(ctx, x, y, n, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(ctx, -170, -110, 340, 220, 18); volumen(ctx, '#f4efe2', -170, -110, 340, 220, 5); texto(ctx, 'DAY', 0, -60, 50, '#7a6a5a'); texto(ctx, String(n), 0, 30, 130, '#c0392b'); ctx.restore(); }
