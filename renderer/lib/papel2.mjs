// PAPEL 2: decorados y objetos nuevos del estilo papel (Guerra de los emús, ketchup medicinal, torre Eiffel, gamba mantis).
// Mismas reglas que papel.mjs: volumen + contorno fino; coordenadas de escena (zona visible x≈125–955, y≈150–1630).
import { W, H, lerp, ease, ph, clamp, capa, SUELO, rr, volumen, elipse, hash, tono, suelo, pared, texto } from './papel.mjs';
const L = 'rgba(40,30,28,0.85)';

// ---------- GUERRA DE LOS EMÚS ----------
// Campo de trigo australiano (cielo, colinas ocres, valla, trigo que se mece)
export function campo(ctx, t, cam, opt = {}) {
  capa(ctx, cam, 0.3, () => {
    const g = ctx.createLinearGradient(0, -300, 0, SUELO); g.addColorStop(0, opt.cielo || '#f0b36a'); g.addColorStop(1, '#fbe6b8'); ctx.fillStyle = g; ctx.fillRect(-500, -500, W + 1000, SUELO + 500);
    const sg = ctx.createRadialGradient(800, 420, 10, 800, 420, 180); sg.addColorStop(0, '#fff6d0'); sg.addColorStop(0.4, '#ffd36a'); sg.addColorStop(1, 'rgba(255,211,106,0)'); ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(800, 420, 180, 0, 7); ctx.fill();
    [[100, 980, 420, '#c98b54'], [620, 940, 520, '#b8794a'], [1100, 1000, 420, '#c98b54']].forEach(([x, y, w, c]) => { ctx.beginPath(); ctx.moveTo(x - w, 1180); ctx.quadraticCurveTo(x, y - 120, x + w, 1180); ctx.closePath(); ctx.fillStyle = c; ctx.fill(); });
  });
  capa(ctx, cam, 0.6, () => {
    ctx.fillStyle = '#d9b25a'; ctx.fillRect(-500, 1130, W + 1000, SUELO);
    // árbol solitario
    ctx.fillStyle = '#6b4a2e'; rr(ctx, 860, 930, 22, 210, 6); ctx.fill(); for (const [dx, dy, r] of [[0, 0, 80], [-60, 30, 60], [60, 30, 64]]) { ctx.beginPath(); ctx.arc(872 + dx, 930 + dy, r, 0, 7); ctx.fillStyle = '#6f8a44'; ctx.fill(); }
    // valla
    for (let i = -3; i < 14; i++) { rr(ctx, i * 110, 1120, 14, 110, 3); ctx.fillStyle = '#7a5a3a'; ctx.fill(); }
    ctx.strokeStyle = '#5a4030'; ctx.lineWidth = 4; for (const y of [1140, 1180]) { ctx.beginPath(); ctx.moveTo(-400, y); ctx.lineTo(W + 400, y); ctx.stroke(); }
    if (opt.lejos) opt.lejos();
  });
  suelo(ctx, cam, 'hierba');
  capa(ctx, cam, 1, () => { ctx.fillStyle = 'rgba(214,170,80,0.55)'; ctx.fillRect(-400, SUELO - 60, W + 800, H); });
  if (opt.trigo !== false) capa(ctx, cam, 1.08, () => { for (let i = 0; i < 46; i++) { const x = -200 + i * 32 + hash(i) * 20, y = 1560 + hash(i + 3) * 80, sw = Math.sin(t * 2 + i * 0.6) * 10; ctx.strokeStyle = '#b8862e'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + sw * 0.5, y - 60, x + sw, y - 120); ctx.stroke(); ctx.beginPath(); ctx.ellipse(x + sw, y - 136, 9, 24, sw * 0.02, 0, 7); ctx.fillStyle = '#e6b84a'; ctx.fill(); ctx.strokeStyle = 'rgba(120,80,20,0.6)'; ctx.lineWidth = 2; ctx.stroke(); } });
}
// Emú: x,y = pies; dir 1 mira a la derecha; corre = fase de carrera (null parado); picotea 0..1; susto 0..1
export function emu(ctx, t, x, y, s = 1, opt = {}) {
  const dir = opt.dir || 1, fa = opt.corre; const corre = fa !== undefined && fa !== null;
  ctx.save(); ctx.translate(x, y); ctx.scale(dir * s, s);
  ctx.fillStyle = 'rgba(30,20,40,0.2)'; ctx.beginPath(); ctx.ellipse(0, 4, 90, 16, 0, 0, 7); ctx.fill();
  const bote = corre ? Math.abs(Math.sin(fa)) * 16 : 0;
  // patas
  for (const k of [0, 1]) { const f = (fa || 0) + k * Math.PI; const px = corre ? Math.sin(f) * 46 : (k ? 18 : -18), lev = corre ? Math.max(0, Math.cos(f)) * 30 : 0;
    ctx.strokeStyle = '#8a6a4a'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(k ? 14 : -14, -170 - bote); ctx.lineTo(px * 0.5 - 10, -90 - lev * 0.5 - bote * 0.5); ctx.lineTo(px, -6 - lev); ctx.stroke();
    ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(px, -6 - lev); ctx.lineTo(px + 24, -4 - lev); ctx.moveTo(px, -6 - lev); ctx.lineTo(px - 14, -2 - lev); ctx.stroke(); }
  ctx.translate(0, -bote);
  // cuerpo plumoso
  ctx.beginPath(); ctx.ellipse(-10, -210, 96, 70, -0.1, 0, 7); volumen(ctx, '#5a4636', -106, -280, 192, 140, 4);
  ctx.strokeStyle = 'rgba(30,22,16,0.45)'; ctx.lineWidth = 4; for (let i = 0; i < 9; i++) { const a = -2.6 + i * 0.35; ctx.beginPath(); ctx.moveTo(-10 + Math.cos(a) * 60, -210 + Math.sin(a) * 40); ctx.lineTo(-10 + Math.cos(a) * 92, -205 + Math.sin(a) * 66 + 14); ctx.stroke(); }
  // cuello + cabeza
  const pic = opt.picotea || 0, sus = opt.susto || 0;
  const hx = lerp(70, 110, pic), hy = lerp(-380, -150, pic) - sus * 20;
  ctx.strokeStyle = L; ctx.lineWidth = 34; ctx.beginPath(); ctx.moveTo(50, -240); ctx.quadraticCurveTo(lerp(90, 110, pic), lerp(-300, -220, pic), hx, hy); ctx.stroke();
  ctx.strokeStyle = '#7f8fa8'; ctx.lineWidth = 26; ctx.stroke();
  ctx.save(); ctx.translate(hx, hy); ctx.rotate(pic * 0.8);
  ctx.beginPath(); ctx.ellipse(0, 0, 34, 28, 0, 0, 7); volumen(ctx, '#7f8fa8', -34, -28, 68, 56, 4);
  ctx.beginPath(); ctx.moveTo(24, -6); ctx.lineTo(66, 4); ctx.lineTo(24, 12); ctx.closePath(); volumen(ctx, '#3a2e24', 24, -6, 42, 18, 3);
  const ojo = 9 + sus * 5; ctx.beginPath(); ctx.arc(6, -8, ojo + 4, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = L; ctx.lineWidth = 3; ctx.stroke(); ctx.beginPath(); ctx.arc(9 + (opt.mira || 0) * 4, -8, ojo * 0.55, 0, 7); ctx.fillStyle = '#c2782a'; ctx.fill(); ctx.beginPath(); ctx.arc(9 + (opt.mira || 0) * 4, -8, ojo * 0.3, 0, 7); ctx.fillStyle = '#111'; ctx.fill();
  if (opt.ceja) { ctx.save(); ctx.translate(6, -26); ctx.rotate(-0.4); rr(ctx, -18, -4, 36, 8, 4); ctx.fillStyle = '#2a2018'; ctx.fill(); ctx.restore(); }
  ctx.fillStyle = '#3a2e24'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-26 + i * 10, -24); ctx.lineTo(-30 + i * 10, -40 - hash(i) * 10); ctx.lineTo(-20 + i * 10, -26); ctx.fill(); }
  ctx.restore(); ctx.restore();
}
// Ametralladora antigua sobre trípode; ang = inclinación; fuego 0..1 (fogonazo)
export function ametralladora(ctx, t, x, y, s = 1, ang = 0, fuego = 0, dir = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(dir * s, s);
  ctx.strokeStyle = '#3a3a3a'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, -120); ctx.lineTo(-70, 0); ctx.moveTo(0, -120); ctx.lineTo(70, 0); ctx.moveTo(0, -120); ctx.lineTo(10, 0); ctx.stroke();
  ctx.translate(0, -130 + (fuego ? Math.sin(t * 60) * 3 : 0)); ctx.rotate(ang);
  rr(ctx, -110, -26, 220, 52, 14); volumen(ctx, '#4a4f3a', -110, -26, 220, 52, 4); // cuerpo con aletas
  for (let i = 0; i < 7; i++) { ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-60 + i * 22, -24); ctx.lineTo(-60 + i * 22, 24); ctx.stroke(); }
  rr(ctx, 110, -10, 120, 20, 6); volumen(ctx, '#2b2b2b', 110, -10, 120, 20, 3); // cañón
  ctx.beginPath(); ctx.ellipse(-10, -46, 64, 16, 0, 0, 7); volumen(ctx, '#3a3a30', -74, -62, 128, 32, 3); // cargador de disco
  rr(ctx, -190, -16, 90, 34, 10); volumen(ctx, '#7a5434', -190, -16, 90, 34, 3); // culata
  if (fuego > 0) { const f = (Math.sin(t * 70) > 0 ? 1 : 0.55) * fuego; ctx.save(); ctx.translate(250, 0); ctx.fillStyle = `rgba(255,220,90,${f})`; ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283, r = i % 2 ? 22 : 62 * f; ctx.lineTo(Math.cos(a) * r * 1.3, Math.sin(a) * r * 0.7); } ctx.closePath(); ctx.fill(); ctx.fillStyle = `rgba(255,255,220,${f})`; ctx.beginPath(); ctx.arc(0, 0, 16, 0, 7); ctx.fill(); ctx.restore(); }
  ctx.restore();
}
// Casquillos que saltan
export function casquillos(ctx, t, x, y, on) { if (!on) return; for (let i = 0; i < 6; i++) { const k = ((t * 3 + i / 6) % 1); ctx.save(); ctx.translate(x - k * 60, y - Math.sin(k * Math.PI) * 90 + k * 40); ctx.rotate(k * 9); rr(ctx, -5, -10, 10, 20, 3); ctx.fillStyle = '#d9a640'; ctx.fill(); ctx.restore(); } }
// Polvo de balas en el suelo
export function polvo(ctx, t, x, y, on, n = 5) { if (!on) return; for (let i = 0; i < n; i++) { const k = ((t * 2.4 + i / n) % 1); const px = x + (hash(Math.floor(t * 2.4 + i / n) * 7 + i) - 0.5) * 360; ctx.globalAlpha = (1 - k) * 0.8; ctx.beginPath(); ctx.arc(px, y - k * 50, 14 + k * 40, 0, 7); ctx.fillStyle = '#c9a670'; ctx.fill(); } ctx.globalAlpha = 1; }
// Camión militar con caja descubierta
export function camion(ctx, t, x, y, s = 1, bote = 0) { ctx.save(); ctx.translate(x, y + Math.abs(Math.sin(t * 16)) * -10 * bote); ctx.rotate(Math.sin(t * 13) * 0.04 * bote); ctx.scale(s, s);
  rr(ctx, -330, -230, 420, 130, 10); volumen(ctx, '#6b6a3e', -330, -230, 420, 130, 4); for (let i = 0; i < 6; i++) { ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(-320 + i * 70, -226, 6, 120); }
  rr(ctx, 90, -320, 190, 220, 18); volumen(ctx, '#77764a', 90, -320, 190, 220, 4); rr(ctx, 130, -300, 110, 80, 10); ctx.fillStyle = '#bfe0ee'; ctx.fill(); ctx.strokeStyle = L; ctx.lineWidth = 4; ctx.stroke();
  rr(ctx, 270, -170, 50, 70, 8); volumen(ctx, '#55542f', 270, -170, 50, 70, 3);
  for (const wx of [-230, 190]) { ctx.save(); ctx.translate(wx, -90); ctx.rotate(t * 8 * bote); ctx.beginPath(); ctx.arc(0, 0, 66, 0, 7); volumen(ctx, '#232323', -66, -66, 132, 132, 4); ctx.beginPath(); ctx.arc(0, 0, 28, 0, 7); ctx.fillStyle = '#8a8a7a'; ctx.fill(); ctx.strokeStyle = '#555'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-26, 0); ctx.lineTo(26, 0); ctx.stroke(); ctx.restore(); }
  ctx.restore(); }

// ---------- KETCHUP MEDICINAL (1834) ----------
// Consulta antigua: papel pintado de rayas, estantería de frascos, título enmarcado, ventana
export function consultaAntigua(ctx, t, cam, deco) {
  pared(ctx, t, cam, '#e8d6b0', '#d6bf92', '#7a4a2e', () => {
    for (let i = -3; i < 16; i++) { ctx.fillStyle = 'rgba(140,80,50,0.12)'; ctx.fillRect(i * 80, -300, 26, 1360); }
    rr(ctx, 120, 330, 300, 380, 10); volumen(ctx, '#7a5434', 120, 330, 300, 380, 4); for (const y of [430, 530, 630]) { ctx.fillStyle = '#5a3a22'; ctx.fillRect(130, y, 280, 12); }
    [['#c94f4f', 150, 430], ['#4f9a6b', 210, 430], ['#3f6fb5', 280, 430], ['#e0a640', 350, 430], ['#7a4fa0', 160, 530], ['#c94f4f', 240, 530], ['#e8e0c8', 320, 530], ['#4f9a6b', 180, 630], ['#3f6fb5', 300, 630]].forEach(([c, x, y], i) => { rr(ctx, x, y - 70 + (i % 3) * 8, 44, 70 - (i % 3) * 8, 8); volumen(ctx, c, x, y - 70, 44, 70, 3); rr(ctx, x + 10, y - 84 + (i % 3) * 8, 24, 16, 4); ctx.fillStyle = '#8a6a4a'; ctx.fill(); });
    rr(ctx, 640, 360, 220, 160, 6); volumen(ctx, '#b0884a', 640, 360, 220, 160, 4); rr(ctx, 660, 380, 180, 120, 4); ctx.fillStyle = '#f6efdc'; ctx.fill(); texto(ctx, 'M.D.', 750, 430, 40, '#5a3a22'); ctx.fillStyle = '#c94f4f'; ctx.beginPath(); ctx.arc(750, 476, 12, 0, 7); ctx.fill();
    rr(ctx, 560, 560, 360, 380, 8); volumen(ctx, '#7a5434', 560, 560, 360, 380, 6); rr(ctx, 580, 580, 320, 340, 4); ctx.fillStyle = '#bfe3f0'; ctx.fill(); ctx.strokeStyle = '#7a5434'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(740, 580); ctx.lineTo(740, 920); ctx.moveTo(580, 750); ctx.lineTo(900, 750); ctx.stroke();
    if (deco) deco();
  });
  suelo(ctx, cam, 'madera');
}
// Escritorio de madera antiguo
export function escritorio(ctx, x, y, w = 520) { rr(ctx, x - w / 2, y, w, 40, 8); volumen(ctx, '#8a5a36', x - w / 2, y, w, 40, 4); rr(ctx, x - w / 2 + 20, y + 40, 120, SUELO - y - 20, 6); volumen(ctx, '#7a4e2e', x - w / 2 + 20, y + 40, 120, SUELO - y - 20, 4); rr(ctx, x + w / 2 - 140, y + 40, 120, SUELO - y - 20, 6); volumen(ctx, '#7a4e2e', x + w / 2 - 140, y + 40, 120, SUELO - y - 20, 4); for (const dy of [70, 160]) { ctx.beginPath(); ctx.arc(x - w / 2 + 80, y + dy, 8, 0, 7); ctx.fillStyle = '#e0c060'; ctx.fill(); } }
// Bote de ketchup antiguo (botella de cristal con etiqueta); nivel 0..1
export function ketchup(ctx, x, y, s = 1, rot = 0, nivel = 0.8) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(-40, -120); ctx.quadraticCurveTo(-40, -150, -16, -170); ctx.lineTo(-14, -220); ctx.lineTo(14, -220); ctx.lineTo(16, -170); ctx.quadraticCurveTo(40, -150, 40, -120); ctx.lineTo(40, 0); ctx.closePath();
  ctx.save(); ctx.clip(); ctx.fillStyle = 'rgba(220,240,240,0.5)'; ctx.fillRect(-60, -240, 120, 260); ctx.rotate(-rot); ctx.fillStyle = '#c0281e'; ctx.fillRect(-120, -220 * nivel + 20, 240, 400); ctx.restore(); ctx.strokeStyle = L; ctx.lineWidth = 4; ctx.stroke();
  rr(ctx, -40, -110, 80, 66, 6); ctx.fillStyle = '#f2e6c4'; ctx.fill(); ctx.stroke(); texto(ctx, 'TOMATO', 0, -86, 20, '#8a2a1e'); texto(ctx, 'CURE', 0, -60, 22, '#8a2a1e');
  rr(ctx, -18, -238, 36, 22, 5); ctx.fillStyle = '#d9c070'; ctx.fill(); ctx.stroke(); ctx.restore(); }
// Frasco de píldoras con etiqueta; abierto = sin tapa
export function frascoPildoras(ctx, x, y, s = 1, rot = 0, etiqueta = 'TOMATO PILLS', abierto = false) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  rr(ctx, -50, -130, 100, 130, 16); volumen(ctx, '#8a4a2a', -50, -130, 100, 130, 4); rr(ctx, -44, -100, 88, 60, 6); ctx.fillStyle = '#f2e6c4'; ctx.fill(); ctx.strokeStyle = L; ctx.lineWidth = 3; ctx.stroke();
  const [a, b] = etiqueta.split(' '); texto(ctx, a, 0, -82, 20, '#8a2a1e'); texto(ctx, b || '', 0, -58, 18, '#8a2a1e');
  if (!abierto) { rr(ctx, -40, -156, 80, 30, 6); volumen(ctx, '#d9c070', -40, -156, 80, 30, 3); } ctx.restore(); }
export function pildora(ctx, x, y, s = 1, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); rr(ctx, -18, -9, 36, 18, 9); volumen(ctx, '#c0281e', -18, -9, 36, 18, 2); ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(-10, -6, 10, 4); ctx.restore(); }
export function tomate(ctx, x, y, s = 1, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.beginPath(); ctx.ellipse(0, 0, 60, 52, 0, 0, 7); volumen(ctx, '#d8352a', -60, -52, 120, 104, 4); ctx.fillStyle = '#4f8a3a'; for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283; ctx.beginPath(); ctx.ellipse(Math.cos(a) * 16, -46 + Math.sin(a) * 6, 18, 6, a, 0, 7); ctx.fill(); } ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.ellipse(-22, -18, 14, 9, -0.5, 0, 7); ctx.fill(); ctx.restore(); }
// Periódico / cartel antiguo
export function periodico(ctx, x, y, s, titular, sub = '', rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); rr(ctx, -200, -260, 400, 520, 6); volumen(ctx, '#f1e8d2', -200, -260, 400, 520, 4); texto(ctx, 'THE DAILY HERALD', 0, -220, 34, '#2a2230'); ctx.fillStyle = '#2a2230'; ctx.fillRect(-180, -196, 360, 4);
  titular.split('\n').forEach((l, i) => texto(ctx, l, 0, -140 + i * 66, 60, '#2a2230')); if (sub) texto(ctx, sub, 0, 30, 28, '#5a4a4a', 'center', 'Poppins');
  ctx.fillStyle = 'rgba(40,30,30,0.25)'; for (let i = 0; i < 6; i++) { ctx.fillRect(-180, 80 + i * 26, 170, 8); ctx.fillRect(10, 80 + i * 26, 170, 8); } ctx.restore(); }
// Patatas fritas en cucurucho
export function patatas(ctx, x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); for (let i = 0; i < 9; i++) { ctx.save(); ctx.translate(-50 + i * 12, -80); ctx.rotate((i - 4) * 0.08); rr(ctx, -7, -60, 14, 90, 4); volumen(ctx, '#f2c14a', -7, -60, 14, 90, 2); ctx.restore(); } ctx.beginPath(); ctx.moveTo(-70, -90); ctx.lineTo(70, -90); ctx.lineTo(40, 30); ctx.lineTo(-40, 30); ctx.closePath(); volumen(ctx, '#d9483b', -70, -90, 140, 120, 4); ctx.restore(); }

// ---------- TORRE EIFFEL (París, 1925) ----------
export function torreEiffel(ctx, x, y, s = 1, col = '#6b5a4a') { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = col; ctx.strokeStyle = tono(col, -0.3); ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-220, 0); ctx.quadraticCurveTo(-110, -260, -40, -620); ctx.lineTo(-14, -980); ctx.lineTo(0, -1060); ctx.lineTo(14, -980); ctx.lineTo(40, -620); ctx.quadraticCurveTo(110, -260, 220, 0); ctx.lineTo(140, 0); ctx.quadraticCurveTo(0, -260, -140, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = tono(col, -0.2); ctx.fillRect(-150, -310, 300, 26); ctx.fillRect(-70, -640, 140, 22); ctx.fillRect(-26, -990, 52, 16);
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 2; for (let i = 0; i < 14; i++) { const yy = -40 - i * 60; const w = 200 * Math.pow(1 - i / 16, 1.6); ctx.beginPath(); ctx.moveTo(-w, yy); ctx.lineTo(w * 0.6, yy - 50); ctx.moveTo(w, yy); ctx.lineTo(-w * 0.6, yy - 50); ctx.stroke(); }
  ctx.restore(); }
// Salón de hotel lujoso: papel pintado, molduras doradas, lámpara de araña, ventanal con la torre
export function salonHotel(ctx, t, cam, deco) {
  pared(ctx, t, cam, '#7a2e3a', '#5e2230', '#3e2a22', () => {
    for (let i = -2; i < 8; i++) { rr(ctx, i * 180 + 20, 120, 150, 640, 10); ctx.strokeStyle = 'rgba(232,192,74,0.45)'; ctx.lineWidth = 5; ctx.stroke(); }
    rr(ctx, 560, 300, 380, 640, 190); ctx.fillStyle = '#f4e1b8'; ctx.fill(); ctx.save(); ctx.clip(); const g = ctx.createLinearGradient(0, 300, 0, 940); g.addColorStop(0, '#9fd0ec'); g.addColorStop(1, '#f6dcb4'); ctx.fillStyle = g; ctx.fillRect(560, 300, 380, 640); torreEiffel(ctx, 750, 960, 0.6, '#6b6a7a'); ctx.fillStyle = '#c8c2c0'; for (let i = 0; i < 6; i++) ctx.fillRect(560 + i * 70, 880 - hash(i) * 60, 60, 120); ctx.restore();
    rr(ctx, 560, 300, 380, 640, 190); ctx.strokeStyle = '#d9b25a'; ctx.lineWidth = 16; ctx.stroke(); ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(750, 300); ctx.lineTo(750, 940); ctx.moveTo(560, 620); ctx.lineTo(940, 620); ctx.stroke();
    ctx.fillStyle = '#8a2030'; for (const k of [-1, 1]) { ctx.beginPath(); ctx.moveTo(750 + k * 230, 260); ctx.quadraticCurveTo(750 + k * 170, 600, 750 + k * 220, 980); ctx.lineTo(750 + k * 260, 980); ctx.lineTo(750 + k * 260, 260); ctx.closePath(); ctx.fill(); }
    rr(ctx, 140, 380, 260, 320, 8); volumen(ctx, '#d9b25a', 140, 380, 260, 320, 4); rr(ctx, 160, 400, 220, 280, 4); ctx.fillStyle = '#3e5a4a'; ctx.fill(); ctx.beginPath(); ctx.arc(270, 520, 60, 0, 7); ctx.fillStyle = '#e8d6b0'; ctx.fill(); // cuadro
    if (deco) deco();
  });
  capa(ctx, cam, 0.8, () => { ctx.strokeStyle = '#8a6a2a'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(400, 0); ctx.lineTo(400, 170); ctx.stroke(); ctx.beginPath(); ctx.ellipse(400, 200, 120, 34, 0, 0, 7); volumen(ctx, '#d9b25a', 280, 166, 240, 68, 4); for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.arc(300 + i * 33, 238, 12, 0, 7); ctx.fillStyle = '#fff3c0'; ctx.fill(); } const g = ctx.createRadialGradient(400, 230, 10, 400, 230, 300); g.addColorStop(0, 'rgba(255,240,180,0.35)'); g.addColorStop(1, 'rgba(255,240,180,0)'); ctx.fillStyle = g; ctx.fillRect(100, 0, 600, 600); });
  suelo(ctx, cam, 'madera');
  capa(ctx, cam, 1, () => { ctx.fillStyle = 'rgba(140,30,40,0.55)'; ctx.beginPath(); ctx.ellipse(540, SUELO + 90, 520, 110, 0, 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(232,192,74,0.6)'; ctx.lineWidth = 8; ctx.stroke(); });
}
// Mesita redonda con mantel
export function mesita(ctx, x, y, w = 300) { rr(ctx, x - 16, y, 32, SUELO - y, 6); volumen(ctx, '#5a3a22', x - 16, y, 32, SUELO - y, 3); ctx.beginPath(); ctx.ellipse(x, SUELO, 90, 18, 0, 0, 7); ctx.fillStyle = '#4a2e1a'; ctx.fill(); ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.lineTo(x + w / 2, y); ctx.lineTo(x + w / 2 + 20, y + 90); ctx.lineTo(x - w / 2 - 20, y + 90); ctx.closePath(); volumen(ctx, '#f4efe2', x - w / 2 - 20, y, w + 40, 90, 4); }
// Fajo de billetes / maleta de dinero
export function fajo(ctx, x, y, s = 1, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); for (let i = 0; i < 4; i++) { rr(ctx, -60, -18 - i * 8, 120, 40, 4); volumen(ctx, '#9ac47a', -60, -18 - i * 8, 120, 40, 2); } rr(ctx, -12, -44, 24, 48, 2); ctx.fillStyle = '#f2e6c4'; ctx.fill(); texto(ctx, '₣', 0, -2, 26, '#3a5a2a'); ctx.restore(); }
export function maletin(ctx, x, y, s = 1, abre = 0, dinero = true) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(ctx, -150, -150, 300, 150, 14); volumen(ctx, '#5a3a22', -150, -150, 300, 150, 4); rr(ctx, -40, -180, 80, 36, 10); ctx.strokeStyle = '#3a2414'; ctx.lineWidth = 10; ctx.stroke();
  if (abre > 0) { ctx.save(); ctx.translate(0, -150); ctx.scale(1, Math.cos(abre * 1.4)); rr(ctx, -150, -150 * Math.min(1, abre * 1.2), 300, 150 * Math.min(1, abre * 1.2), 14); volumen(ctx, '#6a4630', -150, -150, 300, 150, 4); ctx.restore(); if (dinero) for (let i = 0; i < 5; i++) fajo(ctx, -110 + i * 55, -150, 0.5, (i - 2) * 0.1); }
  for (const k of [-1, 1]) { rr(ctx, k * 100 - 12, -158, 24, 18, 3); ctx.fillStyle = '#d9b25a'; ctx.fill(); } ctx.restore(); }
// Calle de París de noche / estación: farolas y adoquines
export function calleParis(ctx, t, cam, opt = {}) {
  capa(ctx, cam, 0.3, () => { const g = ctx.createLinearGradient(0, -300, 0, SUELO); g.addColorStop(0, opt.noche ? '#151a3e' : '#8fc4e6'); g.addColorStop(1, opt.noche ? '#4a3a6e' : '#f4dcb8'); ctx.fillStyle = g; ctx.fillRect(-500, -500, W + 1000, SUELO + 500);
    if (opt.noche) for (let i = 0; i < 50; i++) { ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 3 + i); ctx.fillStyle = '#fff'; ctx.fillRect(-200 + hash(i) * 1500, hash(i + 50) * 700, 3, 3); } ctx.globalAlpha = 1;
    torreEiffel(ctx, opt.torreX || 700, 1180, opt.torreS || 0.85, opt.noche ? '#3a3050' : '#7a6a6a'); });
  capa(ctx, cam, 0.6, () => { for (let i = -2; i < 9; i++) { const bx = i * 160, bh = 380 + hash(i + 3) * 160; rr(ctx, bx, 1180 - bh, 150, bh + 20, 4); volumen(ctx, ['#e8dcc4', '#d9c8a8', '#efe4cc'][(i + 9) % 3], bx, 1180 - bh, 150, bh, 3); ctx.fillStyle = '#4a5a6e'; ctx.beginPath(); ctx.moveTo(bx - 6, 1180 - bh); ctx.lineTo(bx + 75, 1180 - bh - 70); ctx.lineTo(bx + 156, 1180 - bh); ctx.fill(); for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) { rr(ctx, bx + 26 + c * 60, 1200 - bh + 40 + r * 110, 38, 70, 4); ctx.fillStyle = opt.noche ? (hash(i * 7 + r * 3 + c) > 0.4 ? '#ffd970' : '#2a2a40') : '#9fc8e0'; ctx.fill(); } }
    if (opt.lejos) opt.lejos(); });
  suelo(ctx, cam, 'cemento');
  capa(ctx, cam, 1, () => { for (let j = 0; j < 6; j++) for (let i = -6; i < 20; i++) { ctx.strokeStyle = 'rgba(40,40,50,0.2)'; ctx.lineWidth = 3; ctx.strokeRect(i * 70 + (j % 2) * 35, SUELO - 50 + j * 44, 70, 44); }
    for (const fx of opt.farolas || [160, 940]) { rr(ctx, fx - 8, 980, 16, SUELO - 980 + 30, 4); ctx.fillStyle = '#2a2a2a'; ctx.fill(); rr(ctx, fx - 30, 930, 60, 70, 10); volumen(ctx, '#2a2a2a', fx - 30, 930, 60, 70, 3); rr(ctx, fx - 20, 942, 40, 46, 6); ctx.fillStyle = '#ffe9a0'; ctx.fill(); if (opt.noche) { const g = ctx.createRadialGradient(fx, 965, 10, fx, 965, 260); g.addColorStop(0, 'rgba(255,233,160,0.45)'); g.addColorStop(1, 'rgba(255,233,160,0)'); ctx.fillStyle = g; ctx.fillRect(fx - 260, 700, 520, 520); } } });
}
// Tren de vapor (sale a la derecha con k 0..1)
export function tren(ctx, t, x, y, s = 1, humo = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (let v = 0; v < 2; v++) { const vx = -560 * (v + 1); rr(ctx, vx, -300, 520, 240, 12); volumen(ctx, '#3a5a4a', vx, -300, 520, 240, 4); for (let i = 0; i < 4; i++) { rr(ctx, vx + 30 + i * 120, -270, 90, 80, 8); ctx.fillStyle = '#ffe09a'; ctx.fill(); } for (const wx of [vx + 90, vx + 430]) { ctx.beginPath(); ctx.arc(wx, -50, 50, 0, 7); volumen(ctx, '#2a2a2a', wx - 50, -100, 100, 100, 3); } }
  rr(ctx, 0, -330, 420, 270, 20); volumen(ctx, '#2a2a30', 0, -330, 420, 270, 4); rr(ctx, 280, -420, 70, 100, 6); volumen(ctx, '#1e1e24', 280, -420, 70, 100, 3); rr(ctx, 20, -400, 160, 160, 10); volumen(ctx, '#8a2a2a', 20, -400, 160, 160, 4); rr(ctx, 50, -370, 100, 70, 8); ctx.fillStyle = '#ffe09a'; ctx.fill();
  for (const wx of [80, 220, 360]) { ctx.save(); ctx.translate(wx, -50); ctx.rotate(t * 9); ctx.beginPath(); ctx.arc(0, 0, 56, 0, 7); volumen(ctx, '#c0392b', -56, -56, 112, 112, 4); ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-50, 0); ctx.lineTo(50, 0); ctx.moveTo(0, -50); ctx.lineTo(0, 50); ctx.stroke(); ctx.restore(); }
  for (let i = 0; i < 6; i++) { const k = (t * 0.8 + i / 6) % 1; ctx.globalAlpha = (1 - k) * 0.7 * humo; ctx.beginPath(); ctx.arc(315 - k * 300, -440 - k * 260, 30 + k * 70, 0, 7); ctx.fillStyle = '#d9d4cc'; ctx.fill(); } ctx.globalAlpha = 1;
  ctx.restore(); }

// ---------- GAMBA MANTIS (acuario) ----------
// Sala de acuario: pared azul oscura con luz ondulante; el tanque se dibuja aparte
export function salaAcuario(ctx, t, cam, deco) {
  pared(ctx, t, cam, '#1c3550', '#122638', '#2a3e52', () => {
    for (let i = 0; i < 8; i++) { const x = (i * 170 + t * 30) % 1400 - 200; ctx.globalAlpha = 0.08 + 0.05 * Math.sin(t * 2 + i); ctx.fillStyle = '#9fe6ff'; ctx.beginPath(); ctx.ellipse(x, 500 + Math.sin(t + i) * 60, 160, 30, 0.2, 0, 7); ctx.fill(); } ctx.globalAlpha = 1;
    rr(ctx, 120, 260, 260, 160, 8); volumen(ctx, '#f4efe2', 120, 260, 260, 160, 4); texto(ctx, 'DO NOT', 250, 310, 44, '#c0392b'); texto(ctx, 'TAP THE GLASS', 250, 370, 34, '#2a2230');
    if (deco) deco();
  });
  suelo(ctx, cam, 'baldosa');
}
// Tanque: x,y = centro de la base; w,h; grieta 0..1; temblor
export function tanque(ctx, t, x, y, w, h, dentro, grieta = 0, grietaX = 0, grietaY = 0) {
  rr(ctx, x - w / 2 - 30, y, w + 60, SUELO - y + 10, 8); volumen(ctx, '#3a3a44', x - w / 2 - 30, y, w + 60, SUELO - y, 4);
  rr(ctx, x - w / 2, y - h, w, h, 10); const g = ctx.createLinearGradient(0, y - h, 0, y); g.addColorStop(0, '#5fc4e6'); g.addColorStop(1, '#1f6f9a'); ctx.fillStyle = g; ctx.fill();
  ctx.save(); rr(ctx, x - w / 2, y - h, w, h, 10); ctx.clip();
  for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.ellipse(x - w / 2 + 30 + i * (w / 9), y - 20, 40 + hash(i) * 30, 30, 0, 0, 7); ctx.fillStyle = ['#c9b48a', '#a8946a', '#8a7a5a'][i % 3]; ctx.fill(); }
  for (let i = 0; i < 4; i++) { const px = x - w / 2 + 60 + i * (w / 4); ctx.strokeStyle = '#3f9a5a'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(px, y - 20); ctx.quadraticCurveTo(px + Math.sin(t * 2 + i) * 30, y - 140, px + Math.sin(t * 2.4 + i) * 20, y - 230 - hash(i) * 60); ctx.stroke(); }
  for (let i = 0; i < 8; i++) { const k = (t * 0.4 + hash(i)) % 1; ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.arc(x - w / 2 + 40 + hash(i + 2) * (w - 80), y - k * h, 6 + hash(i) * 6, 0, 7); ctx.strokeStyle = '#e8fbff'; ctx.lineWidth = 3; ctx.stroke(); } ctx.globalAlpha = 1;
  if (dentro) dentro();
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.moveTo(x - w / 2 + 40, y - h); ctx.lineTo(x - w / 2 + 120, y - h); ctx.lineTo(x - w / 2 + 20, y); ctx.lineTo(x - w / 2 - 60, y); ctx.fill();
  ctx.restore();
  rr(ctx, x - w / 2, y - h, w, h, 10); ctx.strokeStyle = '#2a3440'; ctx.lineWidth = 14; ctx.stroke(); rr(ctx, x - w / 2 - 14, y - h - 24, w + 28, 30, 6); volumen(ctx, '#3a3a44', x - w / 2 - 14, y - h - 24, w + 28, 30, 3);
  if (grieta > 0) grietas(ctx, grietaX, grietaY, grieta);
}
export function grietas(ctx, x, y, k, n = 9, r = 220) { ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 5; ctx.lineCap = 'round'; for (let i = 0; i < n; i++) { const a = i / n * 6.283 + hash(i) * 0.5; let px = x, py = y; ctx.beginPath(); ctx.moveTo(px, py); const seg = 4; for (let j = 1; j <= seg; j++) { const d = r * k * j / seg * (0.6 + hash(i * 3 + j) * 0.6); px = x + Math.cos(a + (hash(i + j * 7) - 0.5) * 0.5) * d; py = y + Math.sin(a + (hash(i + j * 7) - 0.5) * 0.5) * d; ctx.lineTo(px, py); } ctx.stroke(); }
  ctx.beginPath(); ctx.arc(x, y, 24 * k, 0, 7); ctx.stroke(); ctx.restore(); }
// Gamba mantis: x,y = centro; dir; golpe 0..1 (extiende el puño); ojos que giran
export function mantis(ctx, t, x, y, s = 1, opt = {}) { const dir = opt.dir || 1, g = opt.golpe || 0; ctx.save(); ctx.translate(x, y); ctx.scale(dir * s, s);
  const cols = ['#2fbf8f', '#3aa0d9', '#e8503a', '#f2b33a', '#9a5ad0'];
  // cola en abanico
  ctx.save(); ctx.translate(-230, 0); for (let i = 0; i < 5; i++) { ctx.save(); ctx.rotate((i - 2) * 0.32 + Math.sin(t * 4) * 0.05); ctx.beginPath(); ctx.ellipse(-50, 0, 60, 18, 0, 0, 7); volumen(ctx, cols[i], -110, -18, 120, 36, 3); ctx.restore(); } ctx.restore();
  // segmentos del cuerpo
  for (let i = 0; i < 6; i++) { const sx = -180 + i * 50, sy = Math.sin(t * 3 + i * 0.7) * 5; ctx.beginPath(); ctx.ellipse(sx, sy, 40, 46 - i * 2, 0, 0, 7); volumen(ctx, i % 2 ? '#2fae7f' : '#3cc493', sx - 40, sy - 46, 80, 92, 4); ctx.fillStyle = 'rgba(230,80,60,0.6)'; ctx.fillRect(sx - 30, sy + 30, 60, 8); }
  // patitas
  ctx.strokeStyle = '#e8503a'; ctx.lineWidth = 7; ctx.lineCap = 'round'; for (let i = 0; i < 5; i++) { const lx = -160 + i * 45; ctx.beginPath(); ctx.moveTo(lx, 36); ctx.lineTo(lx + Math.sin(t * 8 + i) * 10, 80); ctx.stroke(); }
  // cabeza
  ctx.beginPath(); ctx.ellipse(130, -10, 70, 56, 0, 0, 7); volumen(ctx, '#3aa0d9', 60, -66, 140, 112, 4);
  // ojos en tallos (giran por separado)
  for (const [k, ph2] of [[-1, 0], [1, 1.7]]) { const ax = 150 + k * 22, ay = -60; const ang = -1.4 + Math.sin(t * 2.2 + ph2) * 0.4; const ex = ax + Math.cos(ang) * 70, ey = ay + Math.sin(ang) * 70;
    ctx.strokeStyle = L; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ex, ey); ctx.stroke(); ctx.strokeStyle = '#e8503a'; ctx.lineWidth = 10; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(ex, ey, 26, 20, ang, 0, 7); volumen(ctx, '#f2b33a', ex - 26, ey - 20, 52, 40, 3); ctx.fillStyle = '#1b1620'; ctx.fillRect(ex - 22, ey - 3, 44, 6); }
  // antenas
  ctx.strokeStyle = '#f2b33a'; ctx.lineWidth = 4; for (const k of [0, 1]) { ctx.beginPath(); ctx.moveTo(190, -20); ctx.quadraticCurveTo(260, -120 - k * 30 + Math.sin(t * 3 + k) * 20, 320, -60 - k * 50); ctx.stroke(); }
  // brazo mazo (golpe)
  const ext = g; const bx = 170 + ext * 150, by = 40 - ext * 10;
  ctx.strokeStyle = L; ctx.lineWidth = 34; ctx.beginPath(); ctx.moveTo(150, 30); ctx.lineTo(lerp(170, 240, ext), lerp(90, 40, ext)); ctx.lineTo(bx, by); ctx.stroke(); ctx.strokeStyle = '#e8503a'; ctx.lineWidth = 26; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(bx + 10, by, 32, 26, 0, 0, 7); volumen(ctx, '#f06a4a', bx - 22, by - 26, 64, 52, 4);
  if (ext > 0.5) { ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 6; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(bx - 60 - i * 30, by - 30 + i * 20); ctx.lineTo(bx - 140 - i * 30, by - 30 + i * 20); ctx.stroke(); } }
  ctx.restore(); }
// Burbuja de cavitación que colapsa con destello (k 0..1)
export function cavitacion(ctx, x, y, k, r = 90) { if (k <= 0 || k >= 1) return; const grow = k < 0.6 ? ease(k / 0.6) : 1 - ease((k - 0.6) / 0.4); ctx.save();
  ctx.beginPath(); ctx.arc(x, y, r * grow, 0, 7); ctx.strokeStyle = 'rgba(230,250,255,0.95)'; ctx.lineWidth = 6; ctx.stroke(); ctx.fillStyle = 'rgba(200,240,255,0.25)'; ctx.fill();
  if (k > 0.75) { const f = 1 - (k - 0.75) / 0.25; const g = ctx.createRadialGradient(x, y, 2, x, y, r * 2.4); g.addColorStop(0, `rgba(255,255,230,${f})`); g.addColorStop(0.3, `rgba(255,200,120,${f * 0.7})`); g.addColorStop(1, 'rgba(255,160,80,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 2.4, 0, 7); ctx.fill();
    ctx.strokeStyle = `rgba(255,255,220,${f})`; ctx.lineWidth = 5; for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * 30, y + Math.sin(a) * 30); ctx.lineTo(x + Math.cos(a) * r * 1.8, y + Math.sin(a) * r * 1.8); ctx.stroke(); } }
  ctx.restore(); }
// Cangrejo (se rompe con roto 0..1)
export function cangrejo(ctx, t, x, y, s = 1, roto = 0) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 8; ctx.lineCap = 'round'; for (const k of [-1, 1]) for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(k * 40, 10 + i * 8); ctx.lineTo(k * (80 + i * 10), 40 + i * 6 + Math.sin(t * 10 + i) * 4); ctx.stroke(); }
  const pieces = roto > 0 ? 4 : 1; for (let p = 0; p < pieces; p++) { ctx.save(); if (roto > 0) { const a = p * 1.57 + 0.7; ctx.translate(Math.cos(a) * roto * 90, Math.sin(a) * roto * 60 - roto * 40); ctx.rotate((p - 1.5) * roto); ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 70, p * 1.57 + 3.14, p * 1.57 + 4.71); ctx.closePath(); } else { ctx.beginPath(); ctx.ellipse(0, 0, 70, 46, 0, 0, 7); } volumen(ctx, '#e0503a', -70, -46, 140, 92, 4); ctx.restore(); }
  if (!roto) { for (const k of [-1, 1]) { ctx.beginPath(); ctx.ellipse(k * 90, -40, 30, 20, k * 0.5, 0, 7); volumen(ctx, '#e0503a', k * 90 - 30, -60, 60, 40, 3); ctx.beginPath(); ctx.arc(k * 16, -50, 10, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = L; ctx.lineWidth = 3; ctx.stroke(); ctx.beginPath(); ctx.arc(k * 16, -50, 5, 0, 7); ctx.fillStyle = '#111'; ctx.fill(); } }
  ctx.restore(); }
// Bocadillo de diálogo pequeño encima de una cabeza (para onomatopeyas cortas)
export function bocadillo(ctx, t, t0, x, y, txt, size = 60) { const k = ph(t, t0, t0 + 0.2); if (k <= 0) return; ctx.save(); ctx.translate(x, y); const s = 0.6 + 0.4 * k; ctx.scale(s, s); ctx.font = `${size}px Anton`; const w = ctx.measureText(txt).width + 60;
  ctx.beginPath(); ctx.moveTo(-w / 2 + 30, -size); ctx.arcTo(w / 2, -size, w / 2, 20, 30); ctx.arcTo(w / 2, 20, -w / 2, 20, 30); ctx.lineTo(20, 20); ctx.lineTo(0, 60); ctx.lineTo(-10, 20); ctx.arcTo(-w / 2, 20, -w / 2, -size, 30); ctx.arcTo(-w / 2, -size, w / 2, -size, 30); ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = L; ctx.lineWidth = 5; ctx.stroke();
  texto(ctx, txt, 0, -size / 2 + 10, size, '#2a2230'); ctx.restore(); }
