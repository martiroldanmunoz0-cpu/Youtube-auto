// Escenas a medida de largo-19-01: «What If Every Human Disappeared? The Last Thing Left of Us»
// Sin personas (han desaparecido) salvo «tú» como testigo. Las caras del monte Rushmore se dibujan como caras de piedra genéricas.
// Horizontal: se ve x ≈ -860…1940 e y ≈ 230…1810 (lo importante en y 350-1350).

const SZ = 1.45;
function bg(ctx, K, c1, c2) { const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, c1); g.addColorStop(1, c2); ctx.fillStyle = g; ctx.fillRect(K.X0, 0, K.XW, 1920); }
function floor(ctx, K, y, col) { ctx.fillStyle = col; ctx.fillRect(K.X0, y, K.XW, 1920 - y); ctx.fillStyle = K.INK; ctx.fillRect(K.X0, y - 4, K.XW, 8); }
function veil(ctx, K, col, al) { if (al <= 0) return; ctx.globalAlpha = Math.min(1, al); ctx.fillStyle = col; ctx.fillRect(K.X0, 0, K.XW, 1920); ctx.globalAlpha = 1; }
function stand(ctx, a, K, x, fy, s, w, mood = 'neutral', o = {}) { s *= SZ; const y = fy - 2290 * s + Math.sin(a.t * 2.2 + x * 0.01) * 4; K.drawFullBody(ctx, x, y, s, w, { mood, t: a.t, ...o }); return y - 330 * s; }
const you = (a, o = {}) => ({ ...a.who, ...o });
// Cuadrúpedo genérico: lobo, jabalí, ciervo, caballo, zorro, perro, vaca
const AN = { wolf: ['#8a8f9a', '#5b606b'], boar: ['#6b4a2b', '#4a3220'], deer: ['#c98a4a', '#8a5a2a'], horse: ['#8a5a34', '#3a2414'], fox: ['#e0733a', '#ffffff'], dog: ['#d9a066', '#8a5a34'], cow: ['#ffffff', '#2a2a2a'], beaver: ['#7a4a22', '#4a2c17'], raccoon: ['#8a8f9a', '#2a2a2a'] };
function animal(ctx, K, x, y, s, kind, t, dir = 1, walk = 1) {
  const [c1, c2] = AN[kind]; ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s);
  const big = kind === 'horse' || kind === 'cow' ? 1.25 : kind === 'beaver' || kind === 'raccoon' ? 0.7 : 1;
  ctx.scale(big, big);
  for (let i = 0; i < 4; i++) { const sw = Math.sin(t * 8 * walk + i * Math.PI / 2) * 0.35 * walk; ctx.save(); ctx.translate(-70 + (i % 2) * 30 + (i > 1 ? 120 : 0), 30); ctx.rotate(sw); K.R(ctx, -12, 0, 24, 90, 10, i % 2 ? c2 : c1, 6); ctx.restore(); }
  K.E(ctx, 0, 0, 120, 55, c1, 0, 8);
  if (kind === 'cow') { K.E(ctx, -30, -10, 35, 25, c2, 0, 0); K.E(ctx, 50, 15, 25, 18, c2, 0, 0); }
  if (kind === 'raccoon') for (let i = 0; i < 3; i++) K.R(ctx, -150 - i * 30, -20, 22, 40, 8, i % 2 ? c2 : c1, 4);
  else if (kind !== 'beaver') { ctx.save(); ctx.translate(-115, -10); ctx.rotate(-0.6 + Math.sin(t * 6) * 0.2); K.E(ctx, -30, 0, kind === 'fox' ? 50 : 40, kind === 'fox' ? 22 : 14, kind === 'horse' ? c2 : c1, 0, 6); if (kind === 'fox') K.C(ctx, -70, 0, 12, '#ffffff', 0); ctx.restore(); }
  else K.E(ctx, -140, 20, 50, 20, '#3a2a1a', 0.2, 6);
  ctx.save(); ctx.translate(120, -50 + Math.sin(t * 4) * 4); K.E(ctx, 30, 0, kind === 'boar' ? 60 : 50, 40, c1, 0.2, 7);
  if (kind === 'boar') { K.E(ctx, 85, 12, 22, 18, '#d99a8a', 0, 5); K.P(ctx, [[70, 30], [80, 5], [90, 30]], '#ffffff', 3); }
  if (kind === 'deer') { ctx.strokeStyle = '#6b4a2b'; ctx.lineWidth = 9; for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(15 + d * 8, -35); ctx.lineTo(5 + d * 30, -100); ctx.moveTo(10 + d * 20, -70); ctx.lineTo(30 + d * 35, -85); ctx.stroke(); } }
  if (kind === 'horse') { for (let i = 0; i < 5; i++) K.E(ctx, -25, -30 + i * 14, 14, 10, c2, 0, 0); }
  if (kind === 'raccoon') K.E(ctx, 45, -5, 30, 12, '#2a2a2a', 0, 0);
  K.P(ctx, [[0, -30], [12, -70], [28, -32]], c1, 6); if (kind !== 'beaver') K.P(ctx, [[30, -30], [45, -70], [55, -30]], c1, 6);
  K.C(ctx, 45, -8, 7, K.INK, 0); K.C(ctx, kind === 'boar' ? 100 : 80, 10, 8, '#2a1a10', 0);
  ctx.restore(); ctx.restore();
}
function bird(ctx, K, x, y, s, t, col = '#5b606b') { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const f = Math.sin(t * 10) * 0.6; ctx.strokeStyle = col; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-60, -20 * f); ctx.quadraticCurveTo(-30, -30, 0, 0); ctx.quadraticCurveTo(30, -30, 60, -20 * f); ctx.stroke(); ctx.restore(); }
function skyline(ctx, K, t, { night = false, dark = 0, ruin = 0, green = 0, lights = 1 } = {}) {
  bg(ctx, K, night ? '#10163a' : '#8fd3ff', night ? '#3b2a5a' : '#ffe1b8');
  if (night) for (let i = 0; i < 90; i++) K.C(ctx, K.X0 + (i * 397) % K.XW, 250 + (i * 131) % 500, 2 + (i % 3), '#ffffff', 0);
  for (let i = 0; i < 30; i++) {
    const x = K.X0 + i * 125, h0 = 320 + ((i * 97) % 460), h = h0 * (1 - ruin * ((i * 37) % 5) / 8);
    const c = night ? ['#262c55', '#2e3462', '#20264a'][i % 3] : ['#9bb3d6', '#b9c7e0', '#8aa2c8'][i % 3];
    if (ruin > 0) { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x, 1130); ctx.lineTo(x, 1130 - h); ctx.lineTo(x + 50, 1130 - h + 30 * ruin); ctx.lineTo(x + 118, 1130 - h * (1 - 0.2 * ruin)); ctx.lineTo(x + 118, 1130); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = K.INK; ctx.stroke(); }
    else K.R(ctx, x, 1130 - h, 118, h + 10, 4, c, 6);
    for (let r = 0; r < Math.floor(h / 80) - 1; r++) for (let q = 0; q < 2; q++) { const on = night && lights > ((i * 7 + r * 3 + q) % 10) / 10; ctx.fillStyle = night ? (on ? '#ffd76b' : '#141833') : (ruin ? '#3a3f4a' : '#e8f4ff'); ctx.fillRect(x + 20 + q * 48, 1160 - h + r * 80, 30, 40); }
    if (green > 0) for (let v = 0; v < 4; v++) K.C(ctx, x + 20 + (v * 37) % 90, 1130 - h * ((v + 1) / 5) * green, 26 + v * 4, ['#3f9150', '#5fc36a'][v % 2], 4);
  }
  floor(ctx, K, 1130, night ? '#3a3d4c' : '#a8acb8'); if (dark) veil(ctx, K, '#05071a', dark);
}
function tree(ctx, K, x, y, s, t, col = '#3f9150') { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); K.R(ctx, -25, -200, 50, 210, 10, '#8a5a34', 7); for (let j = 0; j < 3; j++) K.C(ctx, (j - 1) * 70, -260 - (j % 2) * 60 + Math.sin(t + j + x) * 4, 110, [col, '#5fc36a', '#2f7a3a'][j], 7); ctx.restore(); }
function grass(ctx, K, y, t, h = 40, col = '#4fae5a', n = 160) { ctx.strokeStyle = col; ctx.lineWidth = 6; for (let i = 0; i < n; i++) { const x = K.X0 + (i * 223) % K.XW, hh = h * (0.6 + (i % 5) / 8); ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 6, y - hh / 2, x + Math.sin(t * 2 + i) * 10, y - hh); ctx.stroke(); } }
function vine(ctx, K, x, y, len, t, k = 1) { ctx.strokeStyle = '#2f7a3a'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(x, y); const n = Math.round(14 * k); for (let i = 1; i <= n; i++) ctx.lineTo(x + Math.sin(i * 0.9 + t * 0.5) * 30, y - (len / 14) * i); ctx.stroke(); for (let i = 1; i <= n; i += 2) K.E(ctx, x + Math.sin(i * 0.9) * 30 + 22, y - (len / 14) * i, 22, 12, '#4fae5a', 0.6, 4); }
function car(ctx, K, x, y, s, col = '#ff5c5c', door = 0) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); K.R(ctx, -170, -70, 340, 90, 30, col, 8); K.P(ctx, [[-100, -70], [-60, -140], [70, -140], [110, -70]], col, 8); K.R(ctx, -55, -128, 55, 50, 8, '#bfe6ff', 5); K.R(ctx, 10, -128, 55, 50, 8, '#bfe6ff', 5); if (door) { ctx.save(); ctx.translate(-60, -70); ctx.rotate(-door); K.R(ctx, -90, 0, 90, 80, 8, col, 6); ctx.restore(); } K.C(ctx, -100, 20, 38, '#2a2a33', 8); K.C(ctx, 100, 20, 38, '#2a2a33', 8); ctx.restore(); }
function taxi(ctx, K, x, y, s, door) { car(ctx, K, x, y, s, '#ffd23f', door); ctx.save(); ctx.translate(x, y); ctx.scale(s, s); K.R(ctx, -30, -165, 60, 26, 6, '#ffffff', 5); ctx.restore(); }
function cross(ctx, K, x, y, r, k) { if (k <= 0) return; ctx.lineWidth = 34; ctx.strokeStyle = '#ff3b30'; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - r, y - r); ctx.lineTo(x - r + 2 * r * K.clamp(k * 2), y - r + 2 * r * K.clamp(k * 2)); ctx.stroke(); if (k > 0.5) { const q = K.clamp(k * 2 - 1); ctx.beginPath(); ctx.moveTo(x + r, y - r); ctx.lineTo(x + r - 2 * r * q, y - r + 2 * r * q); ctx.stroke(); } }
function suspect(ctx, K, n, label, x, y, k, crossed = 0) { if (k <= 0) return; const s = K.ease.outBack(K.clamp(k)); ctx.save(); ctx.translate(x, y); ctx.scale(s, s); K.R(ctx, -260, -170, 520, 340, 24, '#fff6e0', 9); K.text(ctx, `SUSPECT #${n}`, 0, -100, { size: 60, color: '#7a2333' }); K.text(ctx, label, 0, 40, { size: 64, color: '#2b3a66' }); ctx.restore(); cross(ctx, K, x, y, 170, crossed); }
function clock(ctx, K, x, y, r, t, label) { K.C(ctx, x, y, r, '#ffffff', 10); for (let i = 0; i < 12; i++) { const an = i / 12 * Math.PI * 2; K.C(ctx, x + Math.cos(an) * r * 0.8, y + Math.sin(an) * r * 0.8, 6, K.INK, 0); } ctx.lineWidth = 12; ctx.strokeStyle = K.INK; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(t * 6 - 1.57) * r * 0.75, y + Math.sin(t * 6 - 1.57) * r * 0.75); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(t * 0.5 - 1.57) * r * 0.5, y + Math.sin(t * 0.5 - 1.57) * r * 0.5); ctx.stroke(); if (label) K.text(ctx, label, x, y + r + 80, { size: 70, color: '#ffd166' }); }
function jumpCard(ctx, K, a, label, sub) { const k = K.ph(a.t, a.d, 0, 0.25); K.text(ctx, label, 540, 560, { size: 200, color: '#ffd166', k }); if (sub) K.text(ctx, sub, 540, 760, { size: 70, color: '#ffffff', k: K.ph(a.t, a.d, 0.2, 0.4) }); }
function tunnel(ctx, K, t, water = 0) {
  bg(ctx, K, '#2a2c38', '#1b1c25'); for (let i = 0; i < 10; i++) { ctx.strokeStyle = '#3a3d4c'; ctx.lineWidth = 30; ctx.beginPath(); ctx.arc(540, 1400, 600 + i * 140, Math.PI, 0); ctx.stroke(); }
  for (let i = 0; i < 12; i++) K.R(ctx, K.X0 + 200 + i * 300, 1290, 160, 30, 6, '#6b4a2b', 5); ctx.fillStyle = '#9aa0ad'; ctx.fillRect(K.X0, 1270, K.XW, 14); ctx.fillRect(K.X0, 1320, K.XW, 14);
  floor(ctx, K, 1340, '#3a3a44');
  if (water > 0) { const wy = 1340 - water; ctx.fillStyle = 'rgba(70,130,180,0.75)'; ctx.beginPath(); ctx.moveTo(K.X0, wy); for (let x = K.X0; x <= K.X0 + K.XW; x += 60) ctx.lineTo(x, wy + Math.sin(x / 80 + t * 3) * 10); ctx.lineTo(K.X0 + K.XW, 1920); ctx.lineTo(K.X0, 1920); ctx.fill(); ctx.strokeStyle = '#bfe9ff'; ctx.lineWidth = 6; ctx.stroke(); }
}
function bridge(ctx, K, t, sag = 0, rust = 0, broken = 0) {
  bg(ctx, K, '#8fd3ff', '#d9f3ff'); ctx.fillStyle = '#3a8fd6'; ctx.fillRect(K.X0, 1250, K.XW, 700); for (let i = 0; i < 20; i++) { ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(K.X0 + ((i * 263 + t * 60) % K.XW), 1300 + (i % 5) * 60, 80, 8); }
  const col = rust ? `rgb(${120 + 80 * rust},${110 - 40 * rust},${100 - 60 * rust})` : '#7a8aa0';
  for (const x of [-500, 1580]) K.R(ctx, x - 40, 500, 80, 800, 10, col, 8);
  ctx.lineWidth = 10; ctx.strokeStyle = col; ctx.beginPath(); ctx.moveTo(-500, 520); ctx.quadraticCurveTo(540, 1150 + sag * 200, 1580, 520); ctx.stroke();
  const L = (x) => 1000 + sag * 220 * Math.sin(((x + 500) / 2080) * Math.PI);
  if (!broken) { K.R(ctx, -800, 990, 600, 40, 6, col, 7); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-500, 990); for (let x = -500; x <= 1580; x += 40) ctx.lineTo(x, L(x) - 10); ctx.lineTo(1580, 1030); for (let x = 1580; x >= -500; x -= 40) ctx.lineTo(x, L(x) + 30); ctx.fill(); ctx.strokeStyle = K.INK; ctx.lineWidth = 7; ctx.stroke(); K.R(ctx, 1580, 990, 600, 40, 6, col, 7); for (let x = -480; x <= 1560; x += 130) { ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x, L(x)); ctx.lineTo(x, 520 + (1 - ((x - 540) / 1040) ** 2) * (630 + sag * 200)); ctx.stroke(); } }
  if (rust) for (let i = 0; i < 30; i++) K.C(ctx, -480 + (i * 137) % 2060, L(-480 + (i * 137) % 2060) + 10, 10 + (i % 3) * 5, '#a8462c', 0);
}
function house(ctx, K, x, y, s, k = 0, col = '#f2c14e') { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const sag = k * 120; K.R(ctx, -200, -260, 400, 260, 8, col, 9); K.R(ctx, -60, -150, 120, 150, 6, '#8a5a34', 7); K.R(ctx, -170, -220, 90, 80, 6, k > 0.3 ? '#3a3f4a' : '#bfe6ff', 6); K.R(ctx, 80, -220, 90, 80, 6, k > 0.3 ? '#3a3f4a' : '#bfe6ff', 6); K.P(ctx, [[-240, -260], [0, -440 + sag * 1.6], [240, -260 + sag * 0.6]], '#c0392b', 9); ctx.restore(); }
function stoneFace(ctx, K, x, y, s, t, v = 0) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const g = ctx.createLinearGradient(-150, -220, 150, 220); g.addColorStop(0, '#d8d4cc'); g.addColorStop(1, '#9a958c'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, 150, 220, 0, 0, 7); ctx.fill(); ctx.lineWidth = 9; ctx.strokeStyle = K.INK; ctx.stroke();
  ctx.lineWidth = 8; ctx.strokeStyle = '#6b665e'; ctx.beginPath(); ctx.moveTo(-90, -50 - v * 6); ctx.lineTo(-30, -60); ctx.moveTo(30, -60); ctx.lineTo(90, -50 - v * 6); ctx.stroke(); K.E(ctx, -60, -10, 28, 14, '#7a756c', 0, 4); K.E(ctx, 60, -10, 28, 14, '#7a756c', 0, 4); ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(-20, 70); ctx.lineTo(15, 75); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-50, 120); ctx.quadraticCurveTo(0, 135 + v * 6, 50, 120); ctx.stroke(); if (v % 2) { ctx.fillStyle = '#7a756c'; ctx.fillRect(-120, -150, 240, 30); } ctx.restore(); }
function rushmore(ctx, K, t, z = 1) { bg(ctx, K, '#8fd3ff', '#ffe1b8'); ctx.save(); ctx.translate(540, 1300); ctx.scale(z, z); ctx.fillStyle = '#b9b2a6'; ctx.beginPath(); ctx.moveTo(-1500, 300); ctx.lineTo(-900, -500); ctx.lineTo(-300, -760); ctx.lineTo(500, -820); ctx.lineTo(1100, -560); ctx.lineTo(1700, 300); ctx.fill(); ctx.lineWidth = 9; ctx.strokeStyle = K.INK; ctx.stroke(); [-480, -120, 200, 520].forEach((x, i) => stoneFace(ctx, K, x, -380 + (i % 2) * 40, 1.05 - (i === 2 ? 0.1 : 0), t, i)); for (let i = 0; i < 14; i++) tree(ctx, K, -1400 + i * 230, 320, 0.8, t, '#2f6a3a'); ctx.restore(); }
function sun(ctx, K, x, y, r) { K.radial(ctx, x, y, r * 2.2, '#ffd166', 0.5); K.C(ctx, x, y, r, '#ffd23f', 8); }

export default {
  // 0 Si los humanos desaparecieran, ¿qué demostraría que existimos? -> ciudad vacía con un gran signo de interrogación y una huella
  0: (ctx, a, K) => {
    skyline(ctx, K, a.t); const k = K.ph(a.t, a.d, 0.1, 0.5); K.text(ctx, '?', 540, 620 + Math.sin(a.t * 3) * 12, { size: 420, color: '#ffd166', k });
    ctx.save(); ctx.globalAlpha = 0.85 * K.ph(a.t, a.d, 0.4, 0.8); K.E(ctx, 540, 1350, 90, 140, '#5b606b', 0, 0); for (let i = 0; i < 5; i++) K.C(ctx, 460 + i * 40, 1180 - Math.abs(i - 2) * 15, 22, '#5b606b', 0); ctx.restore();
    K.text(ctx, 'PROOF?', 540, 1500, { size: 90, color: '#ffffff', k: K.ph(a.t, a.d, 0.6, 0.8) });
  },
  // 1 Todos los humanos desaparecen a la vez; sin aviso, nadie queda. Y tú eres el único testigo
  1: (ctx, a, K) => {
    skyline(ctx, K, a.t); const xs = [-650, -350, -50, 250, 850, 1150, 1450, 1750]; const k = K.ph(a.t, a.d, 0.1, 0.5);
    xs.forEach((x, i) => { const al = 1 - K.clamp(k * 1.3 - i * 0.04); if (al <= 0) { K.sparkles(ctx, x, 1100, a.t + i, 4, 80); return; } ctx.save(); ctx.globalAlpha = al; stand(ctx, a, K, x, 1400, 0.12, { ...a.who, outfit: ['#2b3a66', '#7a2333', '#1f5c4a', '#a8571d'][i % 4], hair: ['short', 'long', 'curly', 'bun'][i % 4] }); ctx.restore(); });
    stand(ctx, a, K, 550, 1420, 0.15, you(a), 'shocked'); K.text(ctx, 'WITNESS', 550, 700, { size: 90, color: '#ffd166', k: K.ph(a.t, a.d, 0.6, 0.8) });
  },
  // 2 Saltaremos 1 hora, 1 día, 1 año, 100 años y 10.000. Cada salto elimina un sospechoso
  2: (ctx, a, K) => {
    bg(ctx, K, '#1b1f4a', '#3a2a6a'); const L = ['1 HOUR', '1 DAY', '1 YEAR', '100 YEARS', '10,000 YEARS'];
    ctx.lineWidth = 16; ctx.strokeStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(-700, 900); ctx.lineTo(-700 + 2500 * K.ph(a.t, a.d, 0, 0.6), 900); ctx.stroke();
    L.forEach((l, i) => { const k = K.ph(a.t, a.d, 0.05 + i * 0.1, 0.2 + i * 0.1); const x = -600 + i * 580; K.C(ctx, x, 900, 40 * K.ease.outBack(k), '#ffd166', 8); K.text(ctx, l, x, 780, { size: 60, color: '#ffffff', k }); if (i < 4) { K.R(ctx, x - 90, 980, 180, 120, 14, '#fff6e0', 6 * (k > 0)); cross(ctx, K, x, 1040, 50, K.ph(a.t, a.d, 0.6 + i * 0.08, 0.7 + i * 0.08)); } });
    K.text(ctx, '?', 1720, 1040, { size: 120, color: '#ffd166', k: K.ph(a.t, a.d, 0.8, 0.95) });
  },
  // 3 Quédate al final: lo último en pie es algo que has visto mil veces, y no es lo que crees
  3: (ctx, a, K) => {
    bg(ctx, K, '#14152a', '#2a2c50'); K.R(ctx, 140, 380, 800, 760, 30, '#3a3d4c', 10); const k = K.ph(a.t, a.d, 0.1, 0.6);
    ctx.save(); ctx.beginPath(); ctx.rect(160, 400, 760, 720); ctx.clip(); K.radial(ctx, 540, 760, 400, '#ffd166', 0.3 + 0.2 * Math.sin(a.t * 3)); ctx.fillStyle = '#05060d'; ctx.beginPath(); ctx.moveTo(200, 1100); ctx.lineTo(400, 700); ctx.lineTo(540, 640); ctx.lineTo(700, 700); ctx.lineTo(880, 1100); ctx.fill(); ctx.restore();
    ctx.fillStyle = '#7a2333'; ctx.fillRect(140, 380, 400 * (1 - k * 0.15), 760); ctx.fillRect(540 + 400 * k * 0.15, 380, 400 * (1 - k * 0.15), 760);
    K.text(ctx, 'SEEN IT 1,000 TIMES', 540, 1250, { size: 70, color: '#ffffff', k: K.ph(a.t, a.d, 0.5, 0.7) });
  },
  // 4 Mediodía en Times Square: taxis con las puertas abiertas y un café que aún humea en una mesa
  4: (ctx, a, K) => {
    skyline(ctx, K, a.t); for (let i = 0; i < 8; i++) { const x = -700 + i * 360; K.R(ctx, x, 420 + (i % 3) * 120, 260, 180, 10, ['#ff4fa3', '#4cc9f0', '#ffd166', '#2ec27e'][i % 4], 8); K.R(ctx, x + 20, 440 + (i % 3) * 120, 220, 140, 6, `rgba(255,255,255,${0.2 + 0.2 * Math.sin(a.t * 4 + i)})`, 0); }
    taxi(ctx, K, -300, 1260, 1, 0.6 + Math.sin(a.t) * 0.05); taxi(ctx, K, 400, 1280, 1.1, 0.8); taxi(ctx, K, 1350, 1260, 1, 0.5);
    K.R(ctx, 820, 1150, 260, 24, 8, '#ffffff', 6); K.R(ctx, 940, 1174, 20, 160, 4, '#5b5f6b', 4); K.prop(ctx, 'cafe', 950, 1110, 0.3, a.t); K.smoke(ctx, 950, 1040, a.t, 5, 'rgba(255,255,255,0.8)');
    K.text(ctx, '12:00', 1700, 420, { size: 90, color: '#ffffff' });
  },
  // 5 Un perro entra en la calle vacía buscando a alguien; el semáforo de peatones sigue contando para nadie
  5: (ctx, a, K) => {
    skyline(ctx, K, a.t); for (let i = 0; i < 8; i++) K.R(ctx, -600 + i * 300, 1250, 160, 380, 0, '#ffffff', 0);
    const x = -500 + K.ph(a.t, a.d, 0, 0.8) * 1200; animal(ctx, K, x, 1280, 0.9, 'dog', a.t); K.text(ctx, '?', x + 120, 1080, { size: 90, color: '#ffffff', k: K.ph(a.t, a.d, 0.5, 0.65) });
    K.R(ctx, 1500, 700, 30, 560, 8, '#3a3a44', 6); K.R(ctx, 1420, 700, 190, 200, 16, '#1b1c25', 8); K.text(ctx, String(Math.max(0, 19 - Math.floor(a.t * 2))), 1515, 800, { size: 100, color: '#ff8a00' });
  },
  // 6 En la autopista los coches se paran solos: sin manos al volante, nadie
  6: (ctx, a, K) => {
    bg(ctx, K, '#8fd3ff', '#e6f7ff'); ctx.fillStyle = '#5fae6a'; ctx.fillRect(K.X0, 950, K.XW, 1000); ctx.fillStyle = '#5b5f6b'; ctx.beginPath(); ctx.moveTo(K.X0, 1500); ctx.lineTo(K.X0 + K.XW, 1500); ctx.lineTo(1400, 1000); ctx.lineTo(-300, 1000); ctx.fill();
    for (let i = 0; i < 10; i++) { ctx.fillStyle = '#ffffff'; ctx.fillRect(540 - 8, 1020 + i * 50, 16, 26); }
    const v = Math.max(0, 1 - K.ph(a.t, a.d, 0, 0.7)); ['#ff5c5c', '#4cc9f0', '#2ec27e', '#ffd166'].forEach((c, i) => { const p = K.clamp(0.2 + i * 0.18 + (1 - v * v) * 0.12); const x = 540 + (i % 2 ? 1 : -1) * (150 + p * 350), y = 1000 + p * 450; car(ctx, K, x, y, 0.4 + p * 0.7, c); });
    K.R(ctx, 1400, 420, 420, 260, 30, '#ffffff', 8); K.text(ctx, '0 MPH', 1610, 550, { size: 80, color: '#2b3a66', k: K.ph(a.t, a.d, 0.6, 0.75) });
  },
  // 7 En una central eléctrica, la sala de control en silencio: pantallas encendidas, alarmas parpadeando y nadie
  7: (ctx, a, K) => {
    bg(ctx, K, '#2b3442', '#1b2230'); for (let i = 0; i < 8; i++) { const x = -700 + i * 340; K.R(ctx, x, 420, 300, 200, 12, '#0b1220', 8); for (let j = 0; j < 4; j++) { ctx.fillStyle = '#2ec27e'; ctx.fillRect(x + 20, 450 + j * 40, 100 + ((j * 53 + i * 31 + Math.floor(a.t * 3)) % 140), 14); } }
    K.R(ctx, K.X0, 900, K.XW, 220, 20, '#5b6478', 8); for (let i = 0; i < 26; i++) K.C(ctx, -800 + i * 110, 980, 18, ['#ffd166', '#2ec27e', '#ff3b30'][i % 3], 4);
    for (let i = 0; i < 3; i++) { const on = Math.floor(a.t * 4 + i) % 2; K.C(ctx, -300 + i * 800, 340, 40, on ? '#ff3b30' : '#5a1a1a', 6); if (on) K.radial(ctx, -300 + i * 800, 340, 200, '#ff3b30', 0.4); }
    for (let i = 0; i < 4; i++) K.R(ctx, -500 + i * 650, 1180, 140, 200, 20, '#3a3f4a', 7); floor(ctx, K, 1380, '#3a3f4a');
  },
  // 8 Una hora después. Primer sospechoso: las luces de la ciudad
  8: (ctx, a, K) => {
    skyline(ctx, K, a.t, { night: true, lights: 1 }); jumpCard(ctx, K, a, '+1 HOUR'); suspect(ctx, K, 1, 'CITY LIGHTS', 540, 1000, K.ph(a.t, a.d, 0.4, 0.6));
    clock(ctx, K, 1650, 560, 130, a.t);
  },
  // 9 Las centrales dependen de los humanos: combustible, mantenimiento, reparaciones. Sin equipos, la red se tambalea
  9: (ctx, a, K) => {
    bg(ctx, K, '#bfe6ff', '#e6f7ff'); floor(ctx, K, 1250, '#8a8f9a'); K.R(ctx, 200, 700, 700, 550, 10, '#9aa0ad', 9); for (let i = 0; i < 2; i++) { K.R(ctx, 300 + i * 300, 380, 120, 330, 10, '#c9ccd6', 8); K.smoke(ctx, 360 + i * 300, 330, a.t, 5, 'rgba(255,255,255,0.8)'); }
    const items = [['FUEL', 'gota'], ['MAINTENANCE', 'llave_antigua'], ['REPAIRS', 'escombros']]; items.forEach(([l, p], i) => { const k = K.ph(a.t, a.d, i * 0.2, 0.2 + i * 0.2); const x = -600 + (i === 2 ? 2100 : i * 300); K.prop(ctx, p, x, 800, 0.5 * k, a.t); K.text(ctx, l, x, 1000, { size: 50, color: '#2b3a66', k }); cross(ctx, K, x, 850, 120, K.ph(a.t, a.d, 0.6 + i * 0.1, 0.75 + i * 0.1)); });
    for (let i = 0; i < 6; i++) { const x = 1100 + i * 140; K.R(ctx, x - 6, 600, 12, 650, 4, '#5b5f6b', 4); ctx.strokeStyle = K.INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, 640); ctx.quadraticCurveTo(x + 70, 700 + Math.sin(a.t * 6 + i) * 20 * K.ph(a.t, a.d, 0.6, 1), x + 140, 640); ctx.stroke(); }
  },
  // 10 Un transformador se sobrecarga y estalla en chispas; luego otro; barrios enteros se apagan en ola
  10: (ctx, a, K) => {
    const k = K.ph(a.t, a.d, 0.2, 0.9); skyline(ctx, K, a.t, { night: true, lights: 1 }); for (let i = 0; i < 30; i++) { const off = (K.X0 + i * 125 + 800) / 3200 < k; if (off) { ctx.fillStyle = 'rgba(5,7,26,0.75)'; ctx.fillRect(K.X0 + i * 125, 300, 126, 840); } }
    for (let i = 0; i < 3; i++) { const t0 = a.d * (0.15 + i * 0.22), x = -500 + i * 900; K.R(ctx, x - 60, 1000, 120, 140, 10, '#5b5f6b', 7); if (a.t > t0) { const q = K.clamp((a.t - t0) / 0.5); K.starBurst(ctx, x, 990, 160 * (1 - q * 0.3), '#ffd166', 1 - q); for (let j = 0; j < 8; j++) K.C(ctx, x + Math.cos(j) * 150 * q, 990 + Math.sin(j) * 150 * q - 40 * q, 8, '#fff3a0', 0); } }
  },
  // 11 En una central nuclear, los sensores bajan las barras de control solas: el reactor se apaga. Un SCRAM
  11: (ctx, a, K) => {
    bg(ctx, K, '#1b2230', '#2b3442'); K.R(ctx, 140, 500, 800, 820, 40, '#3a4558', 10); const k = K.ease.in(K.ph(a.t, a.d, 0.15, 0.5));
    for (let i = 0; i < 6; i++) { const x = 230 + i * 120; K.R(ctx, x, 560, 60, 700, 8, '#2b3a66', 5); K.R(ctx, x + 8, 300 + k * 560, 44, 400, 8, '#9aa0ad', 5); }
    K.radial(ctx, 540, 1000, 400, '#4cc9f0', 0.6 * (1 - k)); K.text(ctx, 'SCRAM', 1500, 700, { size: 160, color: '#ff3b30', k: K.ph(a.t, a.d, 0.5, 0.65) }); K.text(ctx, 'AUTO SHUTDOWN', 1500, 880, { size: 60, color: '#ffffff', k: K.ph(a.t, a.d, 0.6, 0.75) });
  },
  // 12 Buena noticia, pero el combustible gastado en piscinas de refrigeración necesita bombas, y las bombas, electricidad
  12: (ctx, a, K) => {
    bg(ctx, K, '#dfe7ef', '#c9d3de'); floor(ctx, K, 1250, '#8a8f9a'); K.R(ctx, -300, 800, 1200, 460, 20, '#5b6478', 9); ctx.fillStyle = '#3aa0e6'; ctx.fillRect(-280, 840, 1160, 400); K.radial(ctx, 300, 1050, 500, '#4cc9f0', 0.5 + 0.15 * Math.sin(a.t * 3));
    for (let i = 0; i < 8; i++) K.R(ctx, -200 + i * 140, 950, 70, 280, 6, '#9aa0ad', 4);
    K.R(ctx, 1150, 900, 260, 340, 20, '#c9ccd6', 8); K.C(ctx, 1280, 1050, 80, '#5b5f6b', 6); ctx.save(); ctx.translate(1280, 1050); ctx.rotate(a.t * 6 * (1 - K.ph(a.t, a.d, 0.4, 0.8))); for (let j = 0; j < 4; j++) { ctx.rotate(Math.PI / 2); K.R(ctx, -10, 0, 20, 70, 6, '#ffd166', 3); } ctx.restore();
    ctx.lineWidth = 12; ctx.strokeStyle = '#3a3a44'; ctx.beginPath(); ctx.moveTo(1410, 1000); ctx.lineTo(1700, 800); ctx.stroke(); K.prop(ctx, 'rayo', 1700, 700, 0.5, a.t); cross(ctx, K, 1700, 700, 90, K.ph(a.t, a.d, 0.55, 0.75));
  },
  // 13 Los generadores diésel de reserva arrancan; aguantan días o semanas, pero nadie vendrá a repostarlos
  13: (ctx, a, K) => {
    bg(ctx, K, '#dfe7ef', '#c9d3de'); floor(ctx, K, 1250, '#8a8f9a'); const sh = Math.sin(a.t * 40) * 3; K.R(ctx, 0 + sh, 800, 900, 450, 30, '#ffd166', 10); for (let i = 0; i < 6; i++) K.R(ctx, 60 + i * 140 + sh, 860, 90, 260, 10, '#f2b12e', 5); K.smoke(ctx, 800, 760, a.t, 6, 'rgba(80,80,90,0.7)');
    const f = 1 - K.ph(a.t, a.d, 0.1, 0.95); K.C(ctx, 1450, 900, 230, '#ffffff', 10); ctx.save(); ctx.translate(1450, 900); ctx.rotate(Math.PI * (0.8 + f * 1.4)); K.R(ctx, -8, -10, 190, 20, 10, '#ff3b30', 4); ctx.restore(); K.text(ctx, 'E', 1300, 1040, { size: 60, color: '#ff3b30' }); K.text(ctx, 'F', 1600, 1040, { size: 60, color: '#2ec27e' });
    K.text(ctx, 'NO REFILL', 1450, 600, { size: 80, color: '#ff3b30', k: K.ph(a.t, a.d, 0.6, 0.75) });
  },
  // 14 Los semáforos parpadean y mueren, manzana a manzana, hasta que la ciudad solo la ilumina el sol
  14: (ctx, a, K) => {
    skyline(ctx, K, a.t); sun(ctx, K, 1700, 420, 110); const k = K.ph(a.t, a.d, 0.05, 0.85);
    for (let i = 0; i < 7; i++) { const x = -700 + i * 400, off = i / 7 < k; K.R(ctx, x - 8, 820, 16, 500, 4, '#3a3a44', 5); K.R(ctx, x - 50, 640, 100, 220, 16, '#1b1c25', 7); const blink = !off && Math.floor(a.t * 8 + i) % 3 === 0; ['#ff3b30', '#ffd166', '#2ec27e'].forEach((c, j) => K.C(ctx, x, 680 + j * 70, 26, off || blink ? '#2a2a33' : c, 4)); }
  },
  // 15 Sospechoso uno, el brillo eléctrico de la civilización: tachado. Siguiente parada, un día después
  15: (ctx, a, K) => {
    skyline(ctx, K, a.t, { night: true, lights: 0 }); suspect(ctx, K, 1, 'CITY LIGHTS', 540, 800, 1, K.ph(a.t, a.d, 0.15, 0.45)); K.text(ctx, 'NEXT: +1 DAY', 540, 1150, { size: 90, color: '#ffd166', k: K.ph(a.t, a.d, 0.6, 0.8) });
  },
  // 16 24 horas. Bajo Nueva York hay un equipo oculto que nunca duerme, hecho de bombas
  16: (ctx, a, K) => {
    skyline(ctx, K, a.t); ctx.fillStyle = '#5a4a3a'; ctx.fillRect(K.X0, 1130, K.XW, 800); for (let i = 0; i < 40; i++) K.C(ctx, K.X0 + (i * 211) % K.XW, 1200 + (i * 97) % 600, 14, '#4a3a2a', 0);
    jumpCard(ctx, K, a, '+24 HOURS'); for (let i = 0; i < 5; i++) { const x = -500 + i * 500, y = 1450; K.R(ctx, x - 90, y - 70, 180, 140, 20, '#4cc9f0', 8); ctx.save(); ctx.translate(x, y); ctx.rotate(a.t * 5 + i); K.R(ctx, -10, -50, 20, 100, 8, '#ffffff', 3); ctx.restore(); ctx.lineWidth = 12; ctx.strokeStyle = '#9aa0ad'; ctx.beginPath(); ctx.moveTo(x, y - 70); ctx.lineTo(x, 1140); ctx.stroke(); }
  },
  // 17 El metro está bajo el nivel freático: cada día las bombas sacan unos 13 millones de galones
  17: (ctx, a, K) => {
    tunnel(ctx, K, a.t, 0); ctx.fillStyle = 'rgba(70,130,180,0.35)'; ctx.fillRect(K.X0, 300, K.XW, 180); K.text(ctx, 'WATER TABLE', -500, 390, { size: 60, color: '#bfe9ff' });
    const n = K.ph(a.t, a.d, 0.2, 0.8); K.text(ctx, fmt(13_000_000 * n), 540, 620, { size: 140, color: '#4cc9f0' }); K.text(ctx, 'GALLONS / DAY', 540, 760, { size: 70, color: '#ffffff', k: K.ph(a.t, a.d, 0.5, 0.65) });
    for (let i = 0; i < 12; i++) { const q = (a.t * 0.7 + i / 12) % 1; K.E(ctx, 1500, 1200 - q * 900, 18, 26, '#4cc9f0', 0, 4); } K.R(ctx, 1460, 300, 80, 1000, 10, '#9aa0ad', 6);
  },
  // 18 Casi veinte piscinas olímpicas cada día, solo para que los trenes no se mojen
  18: (ctx, a, K) => {
    bg(ctx, K, '#e6f7ff', '#bfe6ff'); for (let i = 0; i < 20; i++) { const k = K.ph(a.t, a.d, i * 0.035, 0.1 + i * 0.035); if (k <= 0) continue; const x = -700 + (i % 5) * 560, y = 430 + Math.floor(i / 5) * 230; ctx.save(); ctx.translate(x, y); ctx.scale(K.ease.outBack(k), K.ease.outBack(k)); K.R(ctx, -220, -80, 440, 160, 16, '#ffffff', 7); ctx.fillStyle = '#3aa0e6'; ctx.fillRect(-200, -60, 400, 120); for (let l = 1; l < 6; l++) { ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(-200, -60 + l * 20, 400, 3); } ctx.restore(); }
    K.text(ctx, '≈ 20 POOLS / DAY', 540, 1380, { size: 110, color: '#1d5c8c', k: K.ph(a.t, a.d, 0.75, 0.9) });
  },
  // 19 Ahora las bombas están apagadas: el agua se filtra por las paredes del túnel y corre por las vías
  19: (ctx, a, K) => {
    tunnel(ctx, K, a.t, 40 * K.ph(a.t, a.d, 0.3, 1)); for (let i = 0; i < 10; i++) { const x = K.X0 + 300 + i * 340, q = (a.t * 0.8 + i * 0.3) % 1; ctx.strokeStyle = 'rgba(120,180,230,0.9)'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(x, 600 + (i % 3) * 80); ctx.lineTo(x + Math.sin(i) * 20, 600 + (i % 3) * 80 + q * 500); ctx.stroke(); K.E(ctx, x, 600 + (i % 3) * 80 + q * 500, 10, 14, '#8fd3ff', 0, 3); }
    K.R(ctx, 1550, 900, 200, 150, 20, '#4cc9f0', 7); K.text(ctx, 'OFF', 1650, 975, { size: 60, color: '#ff3b30' });
  },
  // 20 Según el autor Alan Weisman en «The World Without Us», algunas estaciones podrían inundarse en unas 36 horas
  20: (ctx, a, K) => {
    bg(ctx, K, '#fff6e0', '#f2dcb0'); const k = K.ph(a.t, a.d, 0, 0.3); ctx.save(); ctx.translate(-150, 850); ctx.rotate(-0.06); ctx.scale(K.ease.outBack(k), K.ease.outBack(k)); K.R(ctx, -280, -380, 560, 760, 16, '#2e7d4f', 10); K.R(ctx, -280, -380, 60, 760, 10, '#1f5c36', 6); K.text(ctx, 'THE WORLD', 30, -150, { size: 64, color: '#ffffff' }); K.text(ctx, 'WITHOUT US', 30, -60, { size: 64, color: '#ffffff' }); K.prop(ctx, 'tierra', 30, 160, 0.6, a.t); ctx.restore();
    clock(ctx, K, 1150, 820, 230, a.t * 3); K.text(ctx, '≈ 36 HOURS', 1150, 1180, { size: 100, color: '#1d5c8c', k: K.ph(a.t, a.d, 0.5, 0.7) });
  },
  // 21 En el andén, un tren vacío espera con las puertas abiertas mientras el agua sube por encima de las vías
  21: (ctx, a, K) => {
    tunnel(ctx, K, a.t, 0); K.R(ctx, K.X0, 1100, K.XW, 60, 0, '#c9ccd6', 6); K.R(ctx, -700, 700, 2600, 400, 40, '#d9dde3', 10); for (let i = 0; i < 7; i++) { const x = -600 + i * 360; K.R(ctx, x, 760, 220, 200, 16, '#1b2a3a', 6); if (i % 2) { K.R(ctx, x + 40, 760, 140, 330, 6, '#2a2c38', 5); } } K.R(ctx, -700, 980, 2600, 30, 0, '#ff8a00', 0);
    const w = 380 * K.ph(a.t, a.d, 0.1, 1); ctx.fillStyle = 'rgba(70,130,180,0.7)'; ctx.beginPath(); ctx.moveTo(K.X0, 1340 - w); for (let x = K.X0; x <= K.X0 + K.XW; x += 60) ctx.lineTo(x, 1340 - w + Math.sin(x / 80 + a.t * 3) * 10); ctx.lineTo(K.X0 + K.XW, 1920); ctx.lineTo(K.X0, 1920); ctx.fill();
  },
  // 22 Bajo la ciudad, hormigas e insectos salen en masa de los túneles huyendo del agua
  22: (ctx, a, K) => {
    tunnel(ctx, K, a.t, 120); for (let i = 0; i < 40; i++) { const q = (a.t * 0.35 + i / 40) % 1, x = K.X0 + 600 + (i * 173) % 2400, y = 1250 - q * 900; ctx.save(); ctx.translate(x + Math.sin(a.t * 6 + i) * 10, y); ctx.rotate(-1.57); K.E(ctx, 0, 0, 14, 8, '#2a1a10', 0, 0); K.C(ctx, 14, 0, 7, '#2a1a10', 0); K.C(ctx, -14, 0, 9, '#2a1a10', 0); ctx.strokeStyle = '#2a1a10'; ctx.lineWidth = 3; for (let l = -1; l <= 1; l++) { ctx.beginPath(); ctx.moveTo(l * 6, 0); ctx.lineTo(l * 6 + 4, 14 + Math.sin(a.t * 20 + i) * 4); ctx.moveTo(l * 6, 0); ctx.lineTo(l * 6 + 4, -14); ctx.stroke(); } ctx.restore(); }
    K.prop(ctx, 'hormiga', 540, 700, 1.1, a.t);
  },
  // 23 En la superficie, apagón total: las neveras se calientan y la comida empieza a estropearse
  23: (ctx, a, K) => {
    bg(ctx, K, '#3a3550', '#2a2440'); floor(ctx, K, 1260, '#4b3b2e'); const op = K.ease.out(K.ph(a.t, a.d, 0, 0.3));
    K.R(ctx, 140, 380, 560, 900, 30, '#e6e9ee', 10); ctx.save(); ctx.translate(140, 380); ctx.scale(1 - op * 0.75, 1); K.R(ctx, 0, 0, 560, 900, 30, '#d9dde3', 10); ctx.restore(); K.R(ctx, 160, 600, 520, 14, 4, '#9aa0ad', 0); K.R(ctx, 160, 860, 520, 14, 4, '#9aa0ad', 0);
    const rot = K.ph(a.t, a.d, 0.3, 1); ['manzana', 'platano', 'huevo', 'hamburguesa'].forEach((p, i) => { K.prop(ctx, p, 300 + (i % 2) * 220, 540 + Math.floor(i / 2) * 260, 0.35, a.t); if (rot > 0) { K.C(ctx, 300 + (i % 2) * 220 + 20, 520 + Math.floor(i / 2) * 260, 18 * rot, '#7a8a3a', 0); } });
    K.R(ctx, 1150, 600, 360, 400, 20, '#ffffff', 8); ctx.save(); ctx.translate(1330, 800); const tmp = 4 + rot * 20; K.text(ctx, `${Math.round(tmp)}°C`, 0, 0, { size: 110, color: rot > 0.5 ? '#ff3b30' : '#1d5c8c' }); ctx.restore(); for (let i = 0; i < 3; i++) { const q = (a.t * 0.8 + i / 3) % 1; ctx.strokeStyle = `rgba(122,138,58,${1 - q})`; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(400 + i * 80, 500 - q * 200); ctx.quadraticCurveTo(430 + i * 80, 450 - q * 200, 400 + i * 80, 400 - q * 200); ctx.stroke(); }
  },
  // 24 Supermercados, hospitales, oficinas: todo a oscuras. Un móvil vibra en un piso abandonado y su pantalla se apaga
  24: (ctx, a, K) => {
    bg(ctx, K, '#1b1f3a', '#2a2c50'); const L = [['SUPERMARKET', '#2ec27e'], ['HOSPITAL', '#ff3b30'], ['OFFICE', '#4cc9f0']];
    L.forEach(([l, c], i) => { const x = -550 + i * 520, k = K.ph(a.t, a.d, i * 0.12, 0.12 + i * 0.12); K.R(ctx, x - 220, 500, 440, 520, 14, '#3a3f4a', 8); K.R(ctx, x - 200, 440, 400, 80, 10, k > 0.5 ? '#2a2a33' : c, 6); K.text(ctx, l, x, 480, { size: 44, color: k > 0.5 ? '#555' : '#ffffff' }); for (let r = 0; r < 4; r++) for (let q = 0; q < 3; q++) { ctx.fillStyle = k > 0.5 ? '#14152a' : '#ffe9a0'; ctx.fillRect(x - 180 + q * 130, 560 + r * 110, 90, 70); } });
    const off = K.ph(a.t, a.d, 0.7, 0.75); const sh = off < 1 ? Math.sin(a.t * 60) * 6 : 0; ctx.save(); ctx.translate(1500 + sh, 900); ctx.rotate(0.15); K.R(ctx, -120, -230, 240, 460, 34, '#1b1c25', 9); K.R(ctx, -100, -200, 200, 400, 20, off < 1 ? '#4cc9f0' : '#05060d', 0); if (off < 1) K.text(ctx, 'MOM', 0, -50, { size: 50, color: '#ffffff' }); ctx.restore();
  },
  // 25 Las mascotas no entienden nada: los perros esperan junto a la puerta y los gatos miran por la ventana
  25: (ctx, a, K) => {
    bg(ctx, K, '#ffe6c9', '#f6cfa4'); floor(ctx, K, 1250, '#b07a4a'); K.R(ctx, -500, 550, 360, 700, 10, '#8a5a34', 9); K.C(ctx, -180, 900, 18, '#ffd166', 5); animal(ctx, K, -50, 1180, 0.9, 'dog', a.t, -1, 0.1); K.prop(ctx, 'corazon', 60, 1000, 0.2, a.t);
    K.R(ctx, 900, 450, 560, 520, 14, '#bfe6ff', 10); ctx.fillStyle = K.INK; ctx.fillRect(1176, 450, 8, 520); K.R(ctx, 880, 960, 600, 40, 8, '#d9a066', 7); K.prop(ctx, 'gato', 1180, 880, 0.7, a.t);
    K.R(ctx, 400, 1150, 180, 70, 30, '#c0392b', 7); K.text(ctx, '0', 490, 1185, { size: 50, color: '#ffffff' }); K.text(ctx, 'DINNER?', 1180, 380, { size: 70, color: '#2b3a66', k: K.ph(a.t, a.d, 0.5, 0.65) });
  },
  // 26 En todo el mundo pasa lo mismo en minas, túneles y sótanos, que se llenan de agua poco a poco
  26: (ctx, a, K) => {
    bg(ctx, K, '#5a4a3a', '#3a2a1a'); const w = K.ph(a.t, a.d, 0, 1); const L = [['MINE', -400], ['TUNNEL', 540], ['BASEMENT', 1480]];
    L.forEach(([l, x], i) => { K.R(ctx, x - 300, 500, 600, 700, 20, '#2a2c38', 9); ctx.save(); ctx.beginPath(); ctx.rect(x - 290, 510, 580, 680); ctx.clip(); if (i === 0) for (let j = 0; j < 4; j++) K.R(ctx, x - 250 + j * 140, 600, 20, 600, 4, '#8a5a34', 4); if (i === 1) { ctx.strokeStyle = '#3a3d4c'; ctx.lineWidth = 20; ctx.beginPath(); ctx.arc(x, 1200, 250, Math.PI, 0); ctx.stroke(); } if (i === 2) { K.R(ctx, x - 200, 900, 160, 200, 10, '#c9ccd6', 6); K.R(ctx, x + 40, 950, 200, 150, 10, '#8a5a34', 6); } const wy = 1190 - w * (500 - i * 60); ctx.fillStyle = 'rgba(70,130,180,0.75)'; ctx.fillRect(x - 290, wy + Math.sin(a.t * 3 + i) * 8, 580, 900); ctx.restore(); K.text(ctx, l, x, 420, { size: 64, color: '#ffffff' }); });
  },
  // 27 Sospechoso dos, la gran red subterránea: un río a oscuras. Tachado. Ahora, un año
  27: (ctx, a, K) => {
    tunnel(ctx, K, a.t, 300); suspect(ctx, K, 2, 'UNDERGROUND', 540, 700, 1, K.ph(a.t, a.d, 0.15, 0.45)); K.text(ctx, 'NEXT: +1 YEAR', 540, 1080, { size: 90, color: '#ffd166', k: K.ph(a.t, a.d, 0.6, 0.8) });
  },
  // 28 Un año después: la naturaleza no espera y empieza a volver; tenemos un adelanto real
  28: (ctx, a, K) => {
    skyline(ctx, K, a.t, { green: K.ph(a.t, a.d, 0.2, 1) * 0.6 }); grass(ctx, K, 1135, a.t, 50 * K.ph(a.t, a.d, 0.2, 1)); jumpCard(ctx, K, a, '+1 YEAR', 'NATURE MOVES BACK IN');
  },
  // 29 En 1986, Chernóbil obligó a evacuar una enorme zona de Ucrania; la gente se fue y lo salvaje volvió
  29: (ctx, a, K) => {
    bg(ctx, K, '#c9d6e3', '#e6eef4'); floor(ctx, K, 1220, '#7a8a5a'); for (let i = 0; i < 6; i++) { const x = -700 + i * 520; K.R(ctx, x, 560, 360, 680, 6, '#c9c4b8', 8); for (let r = 0; r < 7; r++) for (let q = 0; q < 4; q++) { ctx.fillStyle = '#3a3f4a'; ctx.fillRect(x + 25 + q * 85, 590 + r * 90, 50, 55); } }
    K.text(ctx, '1986', 540, 420, { size: 150, color: '#2b3a66', k: K.ph(a.t, a.d, 0, 0.2) }); const k = K.ph(a.t, a.d, 0.4, 0.9); for (let i = 0; i < 6; i++) tree(ctx, K, -600 + i * 520, 1240, 0.9 * k, a.t);
    const bx = -300 - K.ph(a.t, a.d, 0.15, 0.45) * 600; car(ctx, K, bx, 1250, 1.2, '#e8e2d0'); K.text(ctx, 'EVACUATED', 1500, 420, { size: 80, color: '#ff3b30', k: K.ph(a.t, a.d, 0.2, 0.35) });
  },
  // 30 Hoy, lobos, jabalíes, ciervos y hasta caballos salvajes recorren los pueblos abandonados
  30: (ctx, a, K) => {
    bg(ctx, K, '#c9e6f3', '#eaf6ea'); floor(ctx, K, 1220, '#7aae5a'); for (let i = 0; i < 5; i++) { K.R(ctx, -700 + i * 620, 620, 300, 620, 6, '#c9c4b8', 8); tree(ctx, K, -400 + i * 620, 1230, 1, a.t); }
    const L = [['wolf', -400], ['boar', 200], ['deer', 800], ['horse', 1450]]; L.forEach(([kind, x], i) => { const k = K.ph(a.t, a.d, i * 0.15, 0.2 + i * 0.15); if (k <= 0) return; animal(ctx, K, x + Math.sin(a.t + i) * 30, 1260, 1.1, kind, a.t, i % 2 ? -1 : 1, 0.4); K.text(ctx, kind.toUpperCase(), x, 1000, { size: 60, color: '#2b3a66', k }); });
  },
  // 31 Imagínalo: una manada de lobos entre bloques soviéticos y caballos pastando donde había un aparcamiento
  31: (ctx, a, K) => {
    bg(ctx, K, '#e8c9a0', '#c9d6e3'); floor(ctx, K, 1220, '#8a9a6a'); for (let i = 0; i < 5; i++) { K.R(ctx, -700 + i * 600, 480, 380, 760, 6, '#b9b2a6', 8); for (let r = 0; r < 8; r++) for (let q = 0; q < 4; q++) { ctx.fillStyle = '#3a3f4a'; ctx.fillRect(-680 + i * 600 + q * 92, 510 + r * 88, 52, 52); } }
    for (let i = 0; i < 4; i++) animal(ctx, K, -800 + ((a.t * 180 + i * 220) % 1500), 1280 + (i % 2) * 40, 0.8, 'wolf', a.t);
    for (let i = 0; i < 5; i++) { ctx.fillStyle = '#ffffff'; ctx.fillRect(900 + i * 200, 1350, 120, 10); } animal(ctx, K, 1100, 1300, 1, 'horse', a.t, -1, 0.15); animal(ctx, K, 1600, 1320, 1, 'horse', a.t, 1, 0.15); grass(ctx, K, 1230, a.t, 60, '#6fbf5a', 60);
  },
  // 32 En nuestro mundo vacío, gatos y perros se asilvestran: los pequeños lo pasan mal, los grandes forman manadas
  32: (ctx, a, K) => {
    skyline(ctx, K, a.t, { green: 0.3 }); const k = K.ph(a.t, a.d, 0.3, 0.7);
    K.prop(ctx, 'gato', -500, 1200, 0.6, a.t); K.text(ctx, 'FERAL', -500, 950, { size: 60, color: '#2b3a66' }); animal(ctx, K, 0, 1300, 0.5, 'dog', a.t, 1, 0.3); K.text(ctx, 'SMALL: HARD', 0, 1100, { size: 50, color: '#ff3b30', k });
    for (let i = 0; i < 4; i++) animal(ctx, K, 700 + i * 260 + Math.sin(a.t * 2) * 30, 1300 + (i % 2) * 30, 1.1, 'dog', a.t, -1); K.text(ctx, 'PACK', 1100, 980, { size: 90, color: '#a8571d', k: K.ph(a.t, a.d, 0.5, 0.7) });
  },
  // 33 Los animales de granja rompen las vallas rotas y salen a los campos, libres por primera vez
  33: (ctx, a, K) => {
    bg(ctx, K, '#9fe0ff', '#e6fbff'); floor(ctx, K, 1150, '#6fcf6a'); K.R(ctx, -700, 600, 500, 550, 10, '#c0392b', 9); K.P(ctx, [[-740, 600], [-450, 400], [-160, 600]], '#8a2a20', 9);
    for (let i = 0; i < 8; i++) { const x = -100 + i * 120, br = i === 3 || i === 4; ctx.save(); ctx.translate(x, 1150); if (br) ctx.rotate((i === 3 ? -1 : 1) * 0.8 * K.ph(a.t, a.d, 0.1, 0.3)); K.R(ctx, -10, -200, 20, 200, 4, '#d9a066', 5); ctx.restore(); } K.R(ctx, -100, 1000, 300, 20, 4, '#d9a066', 4);
    const run = K.ph(a.t, a.d, 0.25, 1); animal(ctx, K, 200 + run * 1300, 1250, 1, 'cow', a.t); animal(ctx, K, 0 + run * 1100, 1340, 0.9, 'cow', a.t); K.prop(ctx, 'vaca', 1700, 1000, 0.01, a.t); K.text(ctx, 'FREE!', 1500, 600, { size: 120, color: '#2ec27e', k: K.ph(a.t, a.d, 0.6, 0.8) });
  },
  // 34 En las ciudades, malas hierbas salen por las grietas: una grieta se vuelve un hueco, un hueco un jardín
  34: (ctx, a, K) => {
    bg(ctx, K, '#c9ccd6', '#a8acb8'); for (let i = 0; i < 12; i++) for (let j = 0; j < 4; j++) { ctx.strokeStyle = '#8a8f9a'; ctx.lineWidth = 4; ctx.strokeRect(K.X0 + i * 300, 400 + j * 300, 300, 300); }
    const k = K.ph(a.t, a.d, 0, 1); ctx.strokeStyle = K.INK; ctx.lineWidth = 8 + k * 40; ctx.beginPath(); ctx.moveTo(-500, 1300); ctx.lineTo(0, 1000); ctx.lineTo(400, 1100); ctx.lineTo(900, 700); ctx.lineTo(1600, 800); ctx.stroke();
    const P = [[-300, 1180], [200, 1040], [650, 900], [1200, 760]]; P.forEach(([x, y], i) => { const g = K.clamp(k * 1.6 - i * 0.15); if (g <= 0) return; for (let l = 0; l < 5; l++) K.E(ctx, x + (l - 2) * 30 * g, y - 60 * g - (l % 2) * 30 * g, 18 * g, 40 * g, '#4fae5a', (l - 2) * 0.4, 4); if (g > 0.6) K.C(ctx, x, y - 120 * g, 26 * g, ['#ff4fa3', '#ffd166', '#ffffff', '#7b5cff'][i], 5); });
    const L = ['CRACK', 'GAP', 'GARDEN']; K.text(ctx, L[Math.min(2, Math.floor(k * 3))], 1500, 450, { size: 110, color: '#2ec27e' });
  },
  // 35 Los céspedes se vuelven prados: sin cortar, la hierba llega a la cintura y el viento lleva semillas
  35: (ctx, a, K) => {
    bg(ctx, K, '#9fe0ff', '#e6fbff'); for (let i = 0; i < 5; i++) house(ctx, K, -600 + i * 600, 1150, 1, 0, ['#f2c14e', '#bfe6ff', '#ff8a65', '#c9e6a0', '#ffd1e8'][i]); floor(ctx, K, 1150, '#6fcf6a');
    const h = 40 + K.ph(a.t, a.d, 0, 0.8) * 320; grass(ctx, K, 1500, a.t, h, '#4fae5a', 260); grass(ctx, K, 1420, a.t, h * 0.9, '#6fbf5a', 200);
    for (let i = 0; i < 16; i++) { const q = (a.t * 0.25 + i / 16) % 1; const x = K.X0 + 500 + q * 3000, y = 600 + Math.sin(q * 10 + i) * 120; K.C(ctx, x, y, 6, '#ffffff', 0); ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 2; for (let r = 0; r < 6; r++) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(r) * 18, y + Math.sin(r) * 18); ctx.stroke(); } }
  },
  // 36 La lluvia arrastra tierra a las alcantarillas; las semillas la encuentran; las calles se vuelven arroyos
  36: (ctx, a, K) => {
    skyline(ctx, K, a.t, { green: 0.2 }); veil(ctx, K, '#3a4a6a', 0.3); for (let i = 0; i < 120; i++) { const x = K.X0 + (i * 157) % K.XW, y = 250 + ((a.t * 900 + i * 131) % 1100); ctx.strokeStyle = 'rgba(200,220,255,0.7)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 10, y + 40); ctx.stroke(); }
    K.R(ctx, 300, 1180, 480, 60, 10, '#3a3a44', 7); for (let i = 0; i < 6; i++) K.R(ctx, 320 + i * 75, 1192, 40, 36, 4, '#1b1c25', 0); const k = K.ph(a.t, a.d, 0.3, 0.7); for (let i = 0; i < 5; i++) K.E(ctx, 360 + i * 85, 1180 - 30 * k, 20, 50 * k, '#4fae5a', 0, 4);
    const w = K.ph(a.t, a.d, 0.6, 1); ctx.fillStyle = `rgba(70,130,180,${0.7 * w})`; ctx.fillRect(K.X0, 1250, K.XW, 200); K.text(ctx, 'SPRING', 1500, 450, { size: 90, color: '#ffffff', k: K.ph(a.t, a.d, 0.6, 0.75) });
  },
  // 37 Los insectos, que llegaron mucho antes que nosotros, entran por todas las ventanas; arañas tejen sobre los escaparates
  37: (ctx, a, K) => {
    bg(ctx, K, '#efe6d6', '#d9cbb0'); K.R(ctx, -500, 450, 1300, 800, 20, '#bfe6ff', 12); K.R(ctx, -520, 380, 1340, 100, 10, '#7a2333', 8); K.text(ctx, 'SHOP', 150, 430, { size: 64, color: '#ffffff' });
    const k = K.ph(a.t, a.d, 0.3, 0.9); ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 4; const cx = 600, cy = 650; for (let r = 0; r < 8; r++) { const an = r / 8 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(an) * 220 * k, cy + Math.sin(an) * 220 * k); ctx.stroke(); } for (let c = 1; c < 6; c++) { ctx.beginPath(); for (let r = 0; r <= 8; r++) { const an = r / 8 * Math.PI * 2, rr = c * 40 * k; r ? ctx.lineTo(cx + Math.cos(an) * rr, cy + Math.sin(an) * rr) : ctx.moveTo(cx + Math.cos(an) * rr, cy + Math.sin(an) * rr); } ctx.stroke(); }
    K.C(ctx, cx, cy - 30 + Math.sin(a.t * 2) * 10, 22, '#2a1a10', 4); for (let i = 0; i < 25; i++) { const q = (a.t * 0.4 + i / 25) % 1, x = 1700 - q * 1600, y = 600 + Math.sin(q * 12 + i) * 250; K.C(ctx, x, y, 8, '#2a1a10', 0); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.ellipse(x - 6, y - 8, 10, 5, Math.sin(a.t * 40 + i), 0, 7); ctx.fill(); }
  },
  // 38 La lluvia entra en las oficinas por las ventanas rotas: el papel se hincha, la moqueta se pudre y aparece moho
  38: (ctx, a, K) => {
    bg(ctx, K, '#c9d3de', '#a8b3c0'); floor(ctx, K, 1220, '#6b7a5a'); K.R(ctx, 1100, 400, 520, 500, 12, '#1b2a3a', 10); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(1150, 450); ctx.lineTo(1300, 600); ctx.lineTo(1250, 750); ctx.moveTo(1300, 600); ctx.lineTo(1500, 520); ctx.stroke();
    for (let i = 0; i < 30; i++) { const y = 450 + ((a.t * 700 + i * 60) % 800); ctx.strokeStyle = 'rgba(140,190,240,0.8)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(1150 + (i * 37) % 400 - (y - 450) * 0.6, y); ctx.lineTo(1140 + (i * 37) % 400 - (y - 450) * 0.6, y + 30); ctx.stroke(); }
    K.R(ctx, -300, 1000, 700, 36, 8, '#d9a066', 6); const sw = K.ph(a.t, a.d, 0.2, 0.7); for (let i = 0; i < 5; i++) { ctx.save(); ctx.translate(-200 + i * 120, 980); ctx.rotate(Math.sin(i) * 0.3 * sw); K.R(ctx, -40, -60 - sw * 20, 80, 60 + sw * 20, 10, '#ffffff', 4); ctx.restore(); }
    const m = K.ph(a.t, a.d, 0.4, 1); for (let i = 0; i < 24; i++) K.C(ctx, -700 + (i * 97) % 600, 450 + (i * 61) % 500, (20 + (i % 4) * 12) * m, ['#4a6a3a', '#3a5a2a', '#2a4a20'][i % 3], 0); K.text(ctx, 'MOLD', -400, 380, { size: 70, color: '#2a4a20', k: m });
  },
  // 39 ¿Los coches de la autopista? Siguen ahí, pero las enredaderas ya trepan por los parachoques
  39: (ctx, a, K) => {
    bg(ctx, K, '#9fe0ff', '#e6fbff'); floor(ctx, K, 1150, '#7a7f88'); grass(ctx, K, 1150, a.t, 80, '#5fae5a', 120);
    ['#ff5c5c', '#4cc9f0', '#ffd166', '#2ec27e'].forEach((c, i) => { const x = -500 + i * 650; car(ctx, K, x, 1280, 1.4, c); const k = K.ph(a.t, a.d, 0.1 + i * 0.1, 0.8 + i * 0.05); vine(ctx, K, x - 200, 1320, 300, a.t, k); vine(ctx, K, x + 220, 1320, 250, a.t, k * 0.8); });
  },
  // 40 Sin bombas, el agua de las piscinas nucleares se calienta y empieza a evaporarse
  40: (ctx, a, K) => {
    bg(ctx, K, '#dfe7ef', '#c9d3de'); floor(ctx, K, 1250, '#8a8f9a'); const k = K.ph(a.t, a.d, 0, 1); K.R(ctx, -300, 800, 1200, 460, 20, '#5b6478', 9); ctx.fillStyle = '#3aa0e6'; ctx.fillRect(-280, 840 + k * 220, 1160, 400 - k * 220); for (let i = 0; i < 8; i++) K.R(ctx, -200 + i * 140, 950, 70, 280, 6, '#9aa0ad', 4);
    for (let i = 0; i < 10; i++) { const q = (a.t * 0.5 + i / 10) % 1; ctx.fillStyle = `rgba(255,255,255,${0.7 * (1 - q) * (0.3 + k)})`; ctx.beginPath(); ctx.arc(-200 + (i * 113) % 1100, 820 - q * 400, 40 + q * 60, 0, 7); ctx.fill(); }
    K.R(ctx, 1300, 400, 90, 700, 40, '#ffffff', 8); ctx.fillStyle = '#ff3b30'; ctx.fillRect(1320, 1080 - 640 * (0.3 + 0.7 * k), 50, 640 * (0.3 + 0.7 * k)); K.C(ctx, 1345, 1120, 80, '#ff3b30', 8);
  },
  // 41 Los científicos advierten: algunos de esos sitios podrían causar daños locales; la naturaleza tendría que encargarse del resto
  41: (ctx, a, K) => {
    bg(ctx, K, '#e6eef4', '#c9d6e3'); floor(ctx, K, 1220, '#7aae5a'); K.R(ctx, 340, 800, 400, 420, 10, '#9aa0ad', 8); const k = K.ph(a.t, a.d, 0.15, 0.5);
    ctx.save(); ctx.globalAlpha = 0.45; ctx.fillStyle = '#ffd166'; ctx.beginPath(); ctx.arc(540, 1100, 200 + 300 * k, 0, 7); ctx.fill(); ctx.restore(); ctx.setLineDash([24, 18]); ctx.lineWidth = 8; ctx.strokeStyle = '#ff8a00'; ctx.beginPath(); ctx.arc(540, 1100, 200 + 300 * k, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    K.C(ctx, 540, 560, 110, '#ffd166', 9); for (let i = 0; i < 3; i++) { ctx.save(); ctx.translate(540, 560); ctx.rotate(i * 2.094); K.P(ctx, [[0, -15], [-50, -95], [50, -95]], K.INK, 0); ctx.restore(); } K.C(ctx, 540, 560, 22, K.INK, 0);
    K.text(ctx, 'LOCAL DAMAGE', 540, 380, { size: 80, color: '#ff3b30', k: K.ph(a.t, a.d, 0.3, 0.45) }); for (let i = 0; i < 6; i++) tree(ctx, K, -700 + i * 180 + (i > 2 ? 1550 : 0), 1230, 0.8 * K.ph(a.t, a.d, 0.5 + i * 0.05, 0.8 + i * 0.03), a.t);
  },
  // 42 Aun así, en sitios como Chernóbil la vida vuelve más rápido de lo esperado: la fauna no pide permiso
  42: (ctx, a, K) => {
    bg(ctx, K, '#c9e6f3', '#eaf6ea'); floor(ctx, K, 1220, '#6fbf5a'); K.R(ctx, -150, 520, 420, 720, 6, '#c9c4b8', 8); for (let r = 0; r < 7; r++) for (let q = 0; q < 4; q++) { ctx.fillStyle = '#3a3f4a'; ctx.fillRect(-125 + q * 100, 550 + r * 95, 55, 55); } vine(ctx, K, -100, 1220, 650, a.t, 1); vine(ctx, K, 220, 1220, 600, a.t, 1);
    for (let i = 0; i < 6; i++) tree(ctx, K, -700 + i * 520 + (i > 1 ? 400 : 0), 1240, 1.1, a.t); const L = ['deer', 'fox', 'boar']; L.forEach((k2, i) => animal(ctx, K, 700 + i * 400 + Math.sin(a.t * 1.5 + i) * 40, 1280 + (i % 2) * 40, 0.9, k2, a.t, i % 2 ? 1 : -1, 0.4)); for (let i = 0; i < 4; i++) bird(ctx, K, 300 + ((a.t * 200 + i * 300) % 1500), 500 + i * 60, 0.8, a.t + i);
    K.text(ctx, 'FASTER THAN EXPECTED', 1100, 420, { size: 70, color: '#2e7d4f', k: K.ph(a.t, a.d, 0.5, 0.7) });
  },
  // 43 Un año después el mundo ha cambiado, pero nada de lo que construimos ha caído aún. Dale un siglo
  43: (ctx, a, K) => {
    skyline(ctx, K, a.t, { green: 0.5 }); grass(ctx, K, 1135, a.t, 80); const k = K.ph(a.t, a.d, 0.5, 0.8);
    K.R(ctx, 1200, 380, 640, 260, 30, '#ffffff', 9); K.text(ctx, 'STILL STANDING', 1520, 510, { size: 70, color: '#2b3a66', k: K.ph(a.t, a.d, 0.2, 0.4) }); K.text(ctx, '+100 YEARS?', 540, 520, { size: 130, color: '#ffd166', k });
  },
  // 44 Cien años después: todo lo de acero se enfrenta a su peor enemigo, el agua y el aire
  44: (ctx, a, K) => {
    bg(ctx, K, '#c9d6e3', '#e6eef4'); jumpCard(ctx, K, a, '+100 YEARS'); const k = K.ph(a.t, a.d, 0.3, 1);
    for (let i = 0; i < 3; i++) { const x = -300 + i * 840; K.R(ctx, x - 160, 950, 320, 300, 20, `rgb(${122 + 80 * k},${130 - 50 * k},${140 - 80 * k})`, 9); K.text(ctx, 'STEEL', x, 1100, { size: 60, color: '#ffffff' }); }
    K.prop(ctx, 'gota', -600, 1050, 0.6, a.t); K.prop(ctx, 'viento', 1700, 1050, 0.6, a.t); for (let i = 0; i < 20; i++) K.C(ctx, -400 + (i * 131) % 1900, 980 + (i * 71) % 250, 10 * k, '#a8462c', 0);
  },
  // 45 Los puentes de acero necesitan pintura constante; sin ella, el óxido se come el metal, tornillo a tornillo
  45: (ctx, a, K) => {
    bridge(ctx, K, a.t, 0, K.ph(a.t, a.d, 0, 1)); const z = K.ph(a.t, a.d, 0.4, 1); ctx.save(); ctx.translate(1550, 700); K.C(ctx, 0, 0, 220, '#ffffff', 10); ctx.beginPath(); ctx.arc(0, 0, 210, 0, 7); ctx.clip(); ctx.fillStyle = `rgb(${120 + 80 * z},${110 - 40 * z},${100 - 60 * z})`; ctx.fillRect(-220, -220, 440, 440); K.C(ctx, 0, 0, 70 * (1 - z * 0.6), '#9aa0ad', 8); for (let i = 0; i < 12; i++) K.C(ctx, Math.cos(i) * 120, Math.sin(i * 1.7) * 120, 20 * z, '#7a2a10', 0); ctx.restore(); K.text(ctx, 'RUST', 1550, 1000, { size: 80, color: '#a8462c', k: z });
  },
  // 46 Un invierno, un puente oxidado cruje, se hunde y se parte: toneladas de metal caen al río
  46: (ctx, a, K) => {
    const k = K.ph(a.t, a.d, 0.2, 0.7), sh = K.shakeAt(a.t, a.d * 0.55, 20, 1.2); ctx.save(); ctx.translate(sh[0], sh[1]); bridge(ctx, K, a.t, k, 1, k >= 1);
    if (k >= 1) { const q = K.ph(a.t, a.d, 0.7, 1); for (let i = 0; i < 2; i++) { ctx.save(); ctx.translate(i ? 1100 : -20, 1000 + q * 260); ctx.rotate((i ? -1 : 1) * (0.5 + q * 0.3)); K.R(ctx, -500, -20, 1000, 40, 6, '#b46a4a', 7); ctx.restore(); } for (let i = 0; i < 12; i++) K.C(ctx, 300 + i * 70, 1250 - Math.sin(q * Math.PI) * (100 + (i % 4) * 60), 16, '#bfe9ff', 4); }
    for (let i = 0; i < 40; i++) { const y = 250 + ((a.t * 200 + i * 77) % 1100); K.C(ctx, K.X0 + 500 + (i * 211) % 2600, y, 6, '#ffffff', 0); } ctx.restore();
    K.text(ctx, 'CRACK!', 540, 500, { size: 140, color: '#ff3b30', k: K.ph(a.t, a.d, 0.6, 0.7) });
  },
  // 47 Otros puentes caen uno a uno; los ríos domados vuelven a sus antiguos cauces
  47: (ctx, a, K) => {
    bg(ctx, K, '#9fe0ff', '#e6fbff'); ctx.fillStyle = '#7aae5a'; ctx.fillRect(K.X0, 500, K.XW, 1400); const k = K.ph(a.t, a.d, 0.2, 1);
    ctx.lineWidth = 140; ctx.strokeStyle = '#3a8fd6'; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-800, 900); for (let x = -800; x <= 1900; x += 50) ctx.lineTo(x, 900 + Math.sin(x / 300) * 250 * k); ctx.stroke();
    ctx.setLineDash([30, 20]); ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.moveTo(-800, 900); ctx.lineTo(1900, 900); ctx.stroke(); ctx.setLineDash([]);
    for (let i = 0; i < 4; i++) { const x = -400 + i * 650, f = K.ph(a.t, a.d, i * 0.15, 0.2 + i * 0.15); ctx.save(); ctx.translate(x, 900); ctx.rotate(f * 0.4); K.R(ctx, -40, -200, 80, 400, 8, f > 0.5 ? '#a8462c' : '#7a8aa0', 7); ctx.restore(); }
  },
  // 48 Las casas de madera caen después: la lluvia empapa las vigas, llegan las termitas y los tejados se hunden en el salón
  48: (ctx, a, K) => {
    bg(ctx, K, '#9fbfd6', '#d6e3ee'); floor(ctx, K, 1250, '#6fae5a'); const k = K.ph(a.t, a.d, 0.2, 0.9); house(ctx, K, 540, 1250, 2.2, k, '#d9a066');
    for (let i = 0; i < 30; i++) { const y = 250 + ((a.t * 700 + i * 60) % 800); ctx.strokeStyle = 'rgba(150,190,230,0.8)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-200 + (i * 53) % 1500, y); ctx.lineTo(-210 + (i * 53) % 1500, y + 30); ctx.stroke(); }
    for (let i = 0; i < 12; i++) { const q = (a.t * 0.3 + i / 12) % 1; K.E(ctx, 200 + q * 600, 1180 - (i % 3) * 120, 12, 7, '#f6e7c8', 0, 3); } K.text(ctx, 'TERMITES', 1500, 600, { size: 80, color: '#8a5a34', k: K.ph(a.t, a.d, 0.3, 0.5) });
  },
  // 49 Barrios enteros se derrumban en montones de madera y salen helechos de los viejos sofás
  49: (ctx, a, K) => {
    bg(ctx, K, '#9fbfd6', '#d6e3ee'); floor(ctx, K, 1200, '#6fae5a'); for (let i = 0; i < 6; i++) { const x = -650 + i * 480; for (let j = 0; j < 7; j++) { ctx.save(); ctx.translate(x + (j - 3) * 40, 1180 - (j % 3) * 30); ctx.rotate((j - 3) * 0.3); K.R(ctx, -120, -12, 240, 24, 6, ['#8a5a34', '#b5723a', '#6b4a2b'][j % 3], 5); ctx.restore(); } }
    K.R(ctx, 300, 1100, 480, 150, 40, '#a8571d', 8); K.R(ctx, 280, 1000, 80, 250, 30, '#a8571d', 8); K.R(ctx, 720, 1000, 80, 250, 30, '#a8571d', 8); const k = K.ph(a.t, a.d, 0.2, 0.9);
    for (let f = 0; f < 5; f++) { ctx.save(); ctx.translate(380 + f * 80, 1100); ctx.rotate((f - 2) * 0.35); for (let l = 0; l < 8 * k; l++) { K.E(ctx, -18, -30 - l * 28, 18, 8, '#3f9150', -0.5, 3); K.E(ctx, 18, -30 - l * 28, 18, 8, '#3f9150', 0.5, 3); } ctx.restore(); }
  },
  // 50 Los árboles atraviesan el asfalto; las raíces levantan carreteras enteras como tabletas de chocolate
  50: (ctx, a, K) => {
    bg(ctx, K, '#9fe0ff', '#e6fbff'); floor(ctx, K, 1150, '#6fae5a'); const k = K.ph(a.t, a.d, 0.1, 0.8);
    for (let i = 0; i < 10; i++) { const x = -700 + i * 280, up = Math.max(0, 1 - Math.abs(x - 540) / 600) * k; ctx.save(); ctx.translate(x, 1250 - up * 180); ctx.rotate((x < 540 ? -1 : 1) * up * 0.5); K.R(ctx, -135, -40, 270, 80, 6, '#5b5f6b', 7); for (let q = 0; q < 2; q++) { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(-135 + q * 135, -40, 4, 80); } ctx.restore(); }
    tree(ctx, K, 540, 1250 - 100 * k, 1.6 * K.clamp(k * 1.2), a.t); for (let i = 0; i < 5; i++) { ctx.strokeStyle = '#8a5a34'; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(540, 1250); ctx.quadraticCurveTo(540 + (i - 2) * 150, 1300, 540 + (i - 2) * 300 * k, 1350); ctx.stroke(); }
    K.prop(ctx, 'chocolate', 1600, 700, 0.6, a.t, 0.2);
  },
  // 51 Los bosques se tragan los barrios: ciervos duermen en los patios y zorros crían en los garajes
  51: (ctx, a, K) => {
    bg(ctx, K, '#9fe0ff', '#d6f0d6'); floor(ctx, K, 1150, '#5fae5a'); for (let i = 0; i < 9; i++) tree(ctx, K, -800 + i * 340, 1160, 1.3, a.t, '#2f7a3a');
    K.R(ctx, -500, 800, 600, 400, 6, '#c9c4b8', 8); K.R(ctx, -450, 900, 500, 300, 6, '#2a2a33', 6); animal(ctx, K, -260, 1150, 0.7, 'fox', a.t, 1, 0.05); for (let i = 0; i < 3; i++) animal(ctx, K, -400 + i * 90, 1185, 0.3, 'fox', a.t + i, 1, 0.4);
    ctx.save(); ctx.translate(900, 1240); animal(ctx, K, 0, 0, 1.1, 'deer', a.t, -1, 0); ctx.restore(); K.text(ctx, 'z', 1050, 1000 - ((a.t * 60) % 80), { size: 60, color: '#ffffff' }); K.text(ctx, 'z', 1100, 930 - ((a.t * 60) % 80), { size: 80, color: '#ffffff' });
  },
  // 52 Los ríos inundan las viejas autopistas y los castores vuelven y construyen presas en las cunetas
  52: (ctx, a, K) => {
    bg(ctx, K, '#9fe0ff', '#e6fbff'); ctx.fillStyle = '#6fae5a'; ctx.fillRect(K.X0, 900, K.XW, 1000); ctx.fillStyle = '#5b5f6b'; ctx.fillRect(K.X0, 1050, K.XW, 250);
    const w = K.ph(a.t, a.d, 0, 0.6); ctx.fillStyle = 'rgba(58,143,214,0.8)'; ctx.fillRect(K.X0, 1100 - 60 * w, K.XW, 300); K.R(ctx, 1400, 500, 360, 140, 10, '#2e7d4f', 8); K.text(ctx, 'I-95', 1580, 570, { size: 70, color: '#ffffff' });
    const k = K.ph(a.t, a.d, 0.3, 0.9); for (let i = 0; i < 12 * k; i++) { ctx.save(); ctx.translate(200 + (i % 6) * 50, 1060 - Math.floor(i / 6) * 34); ctx.rotate((i % 3 - 1) * 0.2); K.R(ctx, -40, -10, 80, 20, 8, '#8a5a34', 4); ctx.restore(); } animal(ctx, K, 600 + Math.sin(a.t) * 80, 1050, 0.8, 'beaver', a.t, -1);
  },
  // 53 El hormigón se agrieta cuando el agua entra y se congela, una y otra vez, cada invierno
  53: (ctx, a, K) => {
    bg(ctx, K, '#dfe7ef', '#c9d3de'); K.R(ctx, -300, 400, 1700, 900, 10, '#b9b2a6', 10); const cyc = (a.t / 1.5) % 1, fr = cyc > 0.5; const k = K.ph(a.t, a.d, 0, 1);
    ctx.strokeStyle = K.INK; ctx.lineWidth = 6 + 20 * k; ctx.beginPath(); ctx.moveTo(500, 400); ctx.lineTo(450, 600); ctx.lineTo(560, 750); ctx.lineTo(480, 950 + 300 * k); ctx.stroke(); ctx.lineWidth = 10 + 10 * k; ctx.strokeStyle = fr ? '#bfe9ff' : '#3a8fd6'; ctx.beginPath(); ctx.moveTo(450, 600); ctx.lineTo(560, 750); ctx.stroke();
    K.text(ctx, fr ? 'FREEZE' : 'THAW', 1100, 600, { size: 110, color: fr ? '#4cc9f0' : '#2b3a66' }); K.prop(ctx, fr ? 'hielo' : 'gota', 1100, 900, 0.6, a.t); K.text(ctx, `WINTER ×${1 + Math.floor(a.t / 1.5)}`, 1100, 1150, { size: 70, color: '#ffffff' });
    if (fr) for (let i = 0; i < 20; i++) K.C(ctx, K.X0 + 400 + (i * 173) % 2800, 300 + ((a.t * 150 + i * 80) % 1000), 6, '#ffffff', 0);
  },
  // 54 Los rascacielos aguantan más, pero el viento, la lluvia y las heladas rompen sus ventanas; brotan plantas en las cornisas
  54: (ctx, a, K) => {
    bg(ctx, K, '#8fbfe6', '#d6e8f3'); K.R(ctx, 180, 300, 720, 1300, 6, '#9aa6b8', 10); const k = K.ph(a.t, a.d, 0.1, 0.9);
    for (let r = 0; r < 10; r++) for (let q = 0; q < 5; q++) { const x = 220 + q * 135, y = 330 + r * 120, br = ((r * 5 + q) * 37) % 10 < k * 7; K.R(ctx, x, y, 110, 90, 4, br ? '#2a2f3a' : '#cfe8ff', 5); if (br) { ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 10, y + 10); ctx.lineTo(x + 50, y + 50); ctx.lineTo(x + 30, y + 80); ctx.stroke(); } if (r % 3 === 1 && q % 2 === 0) for (let l = 0; l < 3; l++) K.E(ctx, x + 30 + l * 25, y + 95 - 20 * k, 12, 24 * k, '#4fae5a', (l - 1) * 0.4, 3); }
    for (let i = 0; i < 12; i++) { const q = (a.t * 0.8 + i / 12) % 1; ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-700 + q * 2600, 400 + i * 80); ctx.lineTo(-560 + q * 2600, 400 + i * 80); ctx.stroke(); }
  },
  // 55 Los animales se quedan con los rascacielos: halcones peregrinos anidan en las torres y los mapaches mandan en los vestíbulos
  55: (ctx, a, K) => {
    bg(ctx, K, '#8fbfe6', '#d6e8f3'); K.R(ctx, -400, 300, 700, 1300, 6, '#9aa6b8', 10); for (let i = 0; i < 3; i++) K.R(ctx, -380 + i * 230, 320, 200, 30, 4, '#7a8698', 4);
    ctx.save(); ctx.translate(-50, 380); for (let i = 0; i < 10; i++) { ctx.strokeStyle = '#8a5a34'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-90 + i * 18, -10); ctx.lineTo(-60 + i * 12, 20); ctx.stroke(); } K.prop(ctx, 'pajaro', 0, -60, 0.6, a.t); ctx.restore(); bird(ctx, K, 400 + Math.sin(a.t) * 300, 500, 1.4, a.t, '#5b4a3a');
    K.R(ctx, 800, 900, 1000, 500, 10, '#d9d0c0', 9); K.R(ctx, 850, 950, 300, 300, 6, '#2a2f3a', 6); K.text(ctx, 'LOBBY', 1300, 950, { size: 60, color: '#2b3a66' }); for (let i = 0; i < 3; i++) animal(ctx, K, 1150 + i * 220 + Math.sin(a.t * 2 + i) * 30, 1330, 1, 'raccoon', a.t, i % 2 ? 1 : -1, 0.5);
  },
  // 56 En los océanos, las ballenas por fin se oyen de nuevo: el ruido de los barcos ha desaparecido
  56: (ctx, a, K) => {
    bg(ctx, K, '#1d5c8c', '#0b2a4a'); for (let i = 0; i < 30; i++) K.C(ctx, K.X0 + (i * 233) % K.XW, 1500 - ((a.t * 80 + i * 90) % 1200), 6, 'rgba(255,255,255,0.4)', 0);
    K.prop(ctx, 'ballena', -200, 900, 1.3, a.t); K.prop(ctx, 'ballena', 1350, 800, 1.1, a.t); for (let i = 0; i < 4; i++) { const r = ((a.t * 300 + i * 200) % 800); ctx.strokeStyle = `rgba(191,233,255,${1 - r / 800})`; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(-50, 850, r, -0.5, 0.5); ctx.stroke(); ctx.beginPath(); ctx.arc(1200, 760, r, Math.PI - 0.5, Math.PI + 0.5); ctx.stroke(); }
    const k = K.ph(a.t, a.d, 0.4, 0.7); ctx.save(); ctx.globalAlpha = 1 - k; K.prop(ctx, 'barco', 540, 380, 0.7, a.t); ctx.restore(); cross(ctx, K, 540, 400, 100, k);
  },
  // 57 De noche el cielo es como no lo vemos desde hace generaciones: sin contaminación lumínica, millones de estrellas
  57: (ctx, a, K) => {
    bg(ctx, K, '#05071a', '#141a3c'); const k = K.ph(a.t, a.d, 0, 0.6); for (let i = 0; i < 700 * k; i++) { const tw = 0.5 + 0.5 * Math.sin(a.t * 2 + i); K.C(ctx, K.X0 + (i * 397) % K.XW, 230 + (i * 233) % 1000, (1 + (i % 3)) * tw, '#ffffff', 0); }
    ctx.save(); ctx.globalAlpha = 0.4 * k; ctx.fillStyle = '#c9b8ff'; ctx.beginPath(); ctx.ellipse(540, 700, 1500, 160, -0.3, 0, 7); ctx.fill(); ctx.restore();
    ctx.fillStyle = '#0b0d16'; ctx.beginPath(); ctx.moveTo(K.X0, 1300); for (let x = K.X0; x <= K.X0 + K.XW; x += 120) ctx.lineTo(x, 1250 - ((x * 7) % 200) - (x % 3) * 40); ctx.lineTo(K.X0 + K.XW, 1920); ctx.lineTo(K.X0, 1920); ctx.fill();
  },
  // 58 Sospechoso tres: puentes, casas y barrios, tachados. Pero las estructuras más grandes aún resisten
  58: (ctx, a, K) => {
    bg(ctx, K, '#c9d6e3', '#e6eef4'); suspect(ctx, K, 3, 'BRIDGES · HOUSES', 0, 760, 1, K.ph(a.t, a.d, 0.1, 0.4)); K.R(ctx, 1150, 400, 260, 900, 6, '#9aa6b8', 9); K.R(ctx, 1450, 550, 220, 750, 6, '#8a98ab', 9); K.text(ctx, 'STILL HOLDING', 1400, 1400, { size: 70, color: '#2b3a66', k: K.ph(a.t, a.d, 0.55, 0.75) }); vine(ctx, K, 1180, 1300, 500, a.t, 1);
  },
  // 59 El plástico sigue ahí, roto en trocitos, flotando en ríos y suelos durante siglos
  59: (ctx, a, K) => {
    bg(ctx, K, '#7ac0e6', '#3a8fd6'); ctx.fillStyle = '#6b4a2b'; ctx.fillRect(K.X0, 1250, K.XW, 700); for (let i = 0; i < 80; i++) { const x = K.X0 + ((i * 131 + a.t * 50 * (i % 3 + 1)) % K.XW), y = 400 + (i * 97) % 1100; ctx.save(); ctx.translate(x, y); ctx.rotate(a.t + i); ctx.fillStyle = ['#ff4fa3', '#ffd166', '#4cc9f0', '#ffffff', '#2ec27e'][i % 5]; ctx.fillRect(-8, -5, 16 + (i % 4) * 6, 10); ctx.restore(); }
    const k = K.ph(a.t, a.d, 0, 0.5); ctx.save(); ctx.translate(540, 700); ctx.scale(1 - k * 0.6, 1 - k * 0.6); ctx.globalAlpha = 1 - k; K.R(ctx, -80, -200, 160, 400, 40, '#bfe9ff', 8); K.R(ctx, -40, -240, 80, 50, 10, '#4cc9f0', 6); ctx.restore(); K.text(ctx, 'CENTURIES', 540, 1100, { size: 100, color: '#ffffff', k: K.ph(a.t, a.d, 0.5, 0.7) });
  },
  // 60 La pregunta se complica: ¿hay algo construido para durar más que todo esto?
  60: (ctx, a, K) => {
    bg(ctx, K, '#1b1f4a', '#3a2a6a'); K.R(ctx, -700, 1100, 2600, 30, 0, '#ffffff', 0); const L = ['WOOD', 'STEEL', 'CONCRETE', '???']; L.forEach((l, i) => { const k = K.ph(a.t, a.d, i * 0.15, 0.2 + i * 0.15); const h = 200 + i * 160; K.R(ctx, -500 + i * 650 - 120, 1100 - h * k, 240, h * k, 10, ['#b5723a', '#7a8aa0', '#b9b2a6', '#ffd166'][i], 8); K.text(ctx, l, -500 + i * 650, 1200, { size: 60, color: '#ffffff', k }); }); K.text(ctx, '?', 1450, 400 + Math.sin(a.t * 3) * 15, { size: 200, color: '#ffd166', k: K.ph(a.t, a.d, 0.7, 0.9) });
  },
  // 61 Diez mil años después: más que toda la historia escrita; la escritura apareció hace solo unos 5.000 años
  61: (ctx, a, K) => {
    bg(ctx, K, '#fff6e0', '#f2dcb0'); jumpCard(ctx, K, a, '+10,000 YEARS'); const k = K.ph(a.t, a.d, 0.3, 0.8);
    ctx.lineWidth = 20; ctx.strokeStyle = K.INK; ctx.beginPath(); ctx.moveTo(-600, 1050); ctx.lineTo(1700, 1050); ctx.stroke(); ctx.lineWidth = 14; ctx.strokeStyle = '#ffd166'; ctx.beginPath(); ctx.moveTo(-600, 1050); ctx.lineTo(-600 + 2300 * k, 1050); ctx.stroke();
    K.R(ctx, 550, 1000, 1150, 100, 20, 'rgba(122,35,51,0.6)', 6); K.text(ctx, 'WRITING (≈5,000 YRS)', 1125, 1170, { size: 50, color: '#7a2333', k: K.ph(a.t, a.d, 0.6, 0.75) }); K.prop(ctx, 'carta', 1100, 900, 0.4, a.t);
  },
  // 62 Las ciudades son montículos verdes: lluvia, raíces y hielo han molido vidrio, acero y hormigón hasta hacerlos tierra
  62: (ctx, a, K) => {
    bg(ctx, K, '#9fe0ff', '#e6fbff'); const k = K.ph(a.t, a.d, 0, 0.7); for (let i = 0; i < 8; i++) { const x = -700 + i * 370, h = 300 + (i * 97) % 300; ctx.fillStyle = '#5fae5a'; ctx.beginPath(); ctx.ellipse(x, 1250, 220, h * (0.6 + 0.4 * (1 - k)), 0, Math.PI, 0); ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = K.INK; ctx.stroke(); tree(ctx, K, x, 1250 - h * 0.6, 0.6, a.t); if (k < 0.5) { ctx.globalAlpha = 1 - k * 2; K.R(ctx, x - 60, 1250 - h * 1.4, 120, h * 1.4, 4, '#9aa6b8', 6); ctx.globalAlpha = 1; } }
    floor(ctx, K, 1250, '#4f8f4a'); ['GLASS', 'STEEL', 'CONCRETE'].forEach((l, i) => { K.text(ctx, l + ' → SOIL', -400 + i * 900, 1450, { size: 50, color: '#ffffff', k: K.ph(a.t, a.d, 0.4 + i * 0.15, 0.55 + i * 0.15) }); });
  },
  // 63 Los ríos han cambiado de cauce y enterrado los cimientos bajo barro, arena y piedras
  63: (ctx, a, K) => {
    bg(ctx, K, '#9fe0ff', '#e6fbff'); ctx.fillStyle = '#7aae5a'; ctx.fillRect(K.X0, 700, K.XW, 1300); const k = K.ph(a.t, a.d, 0, 1);
    const layers = [['#8a6a4a', 'MUD'], ['#e0c88a', 'SAND'], ['#9a958c', 'STONES']]; layers.forEach(([c, l], i) => { const h = 140 * K.clamp(k * 3 - i); ctx.fillStyle = c; ctx.fillRect(K.X0, 1350 - (i + 1) * 140 + (140 - h), K.XW, h); K.text(ctx, l, 1700, 1350 - i * 140 - 70, { size: 50, color: '#ffffff', k: K.clamp(k * 3 - i) }); });
    for (let i = 0; i < 5; i++) K.R(ctx, -500 + i * 400, 1240, 260, 110, 4, '#b9b2a6', 6); ctx.lineWidth = 120; ctx.strokeStyle = '#3a8fd6'; ctx.beginPath(); ctx.moveTo(-800, 800); ctx.quadraticCurveTo(540, 800 + 300 * Math.sin(k * 2), 1900, 760); ctx.stroke();
  },
  // 64 Incluso la Gran Pirámide, de unos 4.500 años, se vería muy distinta
  64: (ctx, a, K) => {
    bg(ctx, K, '#ffd9a0', '#fff1d0'); floor(ctx, K, 1250, '#e8c27a'); sun(ctx, K, 1650, 430, 100); const k = K.ph(a.t, a.d, 0.2, 0.9);
    ctx.fillStyle = '#d9b46a'; ctx.beginPath(); ctx.moveTo(-100, 1250); ctx.lineTo(540, 450 + k * 180); ctx.lineTo(1180, 1250); ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = K.INK; ctx.stroke(); for (let i = 0; i < 12; i++) { ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 4; ctx.beginPath(); const y = 520 + i * 60; ctx.moveTo(540 - (y - 450) * 0.8, y); ctx.lineTo(540 + (y - 450) * 0.8, y); ctx.stroke(); }
    for (let i = 0; i < 20 * k; i++) K.C(ctx, 540 + (i - 10) * 50, 1230 - (i % 3) * 20, 22, '#c9a45a', 5); K.text(ctx, '4,500 YRS', 540, 380, { size: 90, color: '#a8571d', k: K.ph(a.t, a.d, 0, 0.2) }); K.text(ctx, '+10,000', 1500, 700, { size: 80, color: '#ff3b30', k });
  },
  // 65 Vidrio, plástico y residuos nucleares siguen enterrados: rastros, pero nada que alguien llamaría monumento
  65: (ctx, a, K) => {
    bg(ctx, K, '#9fe0ff', '#e6fbff'); floor(ctx, K, 700, '#6b4a2b'); grass(ctx, K, 700, a.t, 40); for (let i = 0; i < 40; i++) K.C(ctx, K.X0 + (i * 211) % K.XW, 800 + (i * 97) % 800, 10, '#5a3a20', 0);
    const items = [['GLASS', '#bfe9ff', -400], ['PLASTIC', '#ff4fa3', 540], ['NUCLEAR WASTE', '#ffd166', 1450]]; items.forEach(([l, c, x], i) => { const k = K.ph(a.t, a.d, i * 0.2, 0.2 + i * 0.2); K.radial(ctx, x, 1100, 160, c, 0.5 * k); K.R(ctx, x - 60, 1060, 120, 80, 10, c, 6); K.text(ctx, l, x, 950, { size: 50, color: '#ffffff', k }); });
    K.text(ctx, 'NO MONUMENT', 540, 450, { size: 100, color: '#2b3a66', k: K.ph(a.t, a.d, 0.7, 0.85) });
  },
  // 66 Lejos de la Tierra, las sondas Voyager siguen a la deriva con un disco de oro; pero están en el espacio, no aquí
  66: (ctx, a, K) => {
    bg(ctx, K, '#05071a', '#141a3c'); for (let i = 0; i < 160; i++) K.C(ctx, K.X0 + (i * 397) % K.XW, (i * 233) % 1920, 1 + (i % 3), '#ffffff', 0); K.prop(ctx, 'tierra', 1700, 1200, 0.5, a.t);
    const x = -100 + a.t * 30; ctx.save(); ctx.translate(x, 800); ctx.rotate(-0.2); K.R(ctx, -60, -60, 120, 120, 10, '#c9ccd6', 7); K.C(ctx, 0, -170, 150, '#ffffff', 8); K.C(ctx, 0, -170, 30, '#9aa0ad', 5); ctx.strokeStyle = '#c9ccd6'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(60, 0); ctx.lineTo(360, 60); ctx.moveTo(-60, 20); ctx.lineTo(-300, 120); ctx.stroke(); K.C(ctx, 0, 0, 40, '#ffd166', 6); ctx.restore();
    K.text(ctx, 'GOLDEN RECORD', x, 1050, { size: 60, color: '#ffd166', k: K.ph(a.t, a.d, 0.3, 0.45) }); K.text(ctx, 'NOT HERE', 1500, 700, { size: 80, color: '#ff3b30', k: K.ph(a.t, a.d, 0.65, 0.8) });
  },
  // 67 Donde estaba Central Park crece un bosque más viejo que ninguno; nadie recuerda que fue un parque
  67: (ctx, a, K) => {
    bg(ctx, K, '#b8e6c8', '#e6fbea'); floor(ctx, K, 1200, '#3f7a3a'); for (let i = 0; i < 12; i++) tree(ctx, K, -800 + i * 250, 1220, 1.8 + (i % 3) * 0.3, a.t, '#2f6a3a');
    const k = K.ph(a.t, a.d, 0.3, 0.7); ctx.save(); ctx.globalAlpha = 1 - k; K.R(ctx, 400, 1000, 300, 180, 10, '#2e7d4f', 7); K.text(ctx, 'CENTRAL PARK', 550, 1090, { size: 36, color: '#ffffff' }); ctx.restore(); for (let i = 0; i < 4; i++) bird(ctx, K, -600 + ((a.t * 150 + i * 500) % 2600), 450 + i * 50, 0.8, a.t + i);
  },
  // 68 Un explorador de otro mundo cruzaría bosques infinitos sin encontrar casi nada que diga que estuvimos aquí
  68: (ctx, a, K) => {
    bg(ctx, K, '#b8e6c8', '#e6fbea'); floor(ctx, K, 1200, '#3f7a3a'); const off = a.t * 120; for (let i = 0; i < 14; i++) tree(ctx, K, K.X0 + ((i * 260 - off) % K.XW + K.XW) % K.XW, 1220, 1.5, a.t, '#2f6a3a');
    ctx.save(); ctx.translate(540, 1150 + Math.sin(a.t * 6) * 8); K.E(ctx, 0, 0, 80, 120, '#b8f0ff', 0, 8); K.C(ctx, 0, -150, 70, '#7ad97a', 8); K.C(ctx, -25, -160, 14, K.INK, 0); K.C(ctx, 25, -160, 14, K.INK, 0); ctx.strokeStyle = K.INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-30, -210); ctx.lineTo(-50, -270); ctx.moveTo(30, -210); ctx.lineTo(50, -270); ctx.stroke(); K.C(ctx, -50, -275, 12, '#ffd166', 4); K.C(ctx, 50, -275, 12, '#ffd166', 4); ctx.restore();
    K.prop(ctx, 'lupa', 680, 1050, 0.5, a.t, -0.5); K.text(ctx, '?', 700, 800, { size: 120, color: '#ffffff', k: K.ph(a.t, a.d, 0.5, 0.7) });
  },
  // 69 Entonces, en mitad de las Black Hills de Dakota del Sur, algo refleja la luz
  69: (ctx, a, K) => {
    bg(ctx, K, '#8fd3ff', '#ffe1b8'); ctx.fillStyle = '#4a6a3a'; ctx.beginPath(); ctx.moveTo(K.X0, 1300); for (let x = K.X0; x <= K.X0 + K.XW; x += 150) ctx.lineTo(x, 900 - Math.abs(Math.sin(x / 400)) * 300); ctx.lineTo(K.X0 + K.XW, 1920); ctx.lineTo(K.X0, 1920); ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = K.INK; ctx.stroke();
    for (let i = 0; i < 20; i++) tree(ctx, K, K.X0 + 400 + i * 160, 1150 + (i % 3) * 40, 0.6, a.t, '#2a4a2a'); const k = K.ph(a.t, a.d, 0.3, 0.7); K.starBurst(ctx, 900, 720, 140 * k * (1 + 0.2 * Math.sin(a.t * 8)), '#ffffff', k);
    K.text(ctx, 'BLACK HILLS, SOUTH DAKOTA', 540, 420, { size: 70, color: '#2b3a66', k: K.ph(a.t, a.d, 0, 0.2) });
  },
  // 70 Cuatro caras enormes, de 18 metros, siguen mirando al horizonte
  70: (ctx, a, K) => {
    rushmore(ctx, K, a.t, 0.8 + K.ph(a.t, a.d, 0, 1) * 0.25); const k = K.ph(a.t, a.d, 0.4, 0.6); ctx.lineWidth = 8; ctx.strokeStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(1450, 650); ctx.lineTo(1450, 1050); ctx.stroke(); K.text(ctx, '60 FT', 1600, 850, { size: 80, color: '#ffffff', k });
  },
  // 71 Monte Rushmore, tallado entre 1927 y 1941 en granito macizo, una de las rocas más duras del planeta
  71: (ctx, a, K) => {
    rushmore(ctx, K, a.t, 0.75); K.text(ctx, 'MOUNT RUSHMORE', 540, 380, { size: 110, color: '#ffffff', k: K.ph(a.t, a.d, 0, 0.2) }); K.R(ctx, -780, 1180, 520, 140, 30, '#ffffff', 8); K.text(ctx, '1927 – 1941', -520, 1250, { size: 60, color: '#2b3a66', k: K.ph(a.t, a.d, 0.3, 0.45) });
    K.R(ctx, 1400, 1150, 480, 200, 20, '#9a958c', 8); for (let i = 0; i < 20; i++) K.C(ctx, 1430 + (i * 47) % 420, 1180 + (i * 31) % 140, 6, ['#ffffff', '#2a2a2a', '#d99a8a'][i % 3], 0); K.text(ctx, 'GRANITE', 1640, 1400, { size: 60, color: '#ffffff', k: K.ph(a.t, a.d, 0.6, 0.75) });
  },
  // 72 El Servicio de Parques Nacionales estima que ese granito se erosiona solo unos 2,5 cm cada 10.000 años
  72: (ctx, a, K) => {
    bg(ctx, K, '#efe6d6', '#d9cbb0'); K.R(ctx, -300, 450, 1100, 800, 30, '#b9b2a6', 10); const k = K.ph(a.t, a.d, 0.2, 0.8);
    ctx.fillStyle = '#d9d4cc'; ctx.fillRect(-280, 470, 1060, 40 * (1 - k)); K.R(ctx, 900, 450, 60, 800, 10, '#ffd166', 7); for (let i = 0; i < 9; i++) { ctx.fillStyle = K.INK; ctx.fillRect(900, 470 + i * 90, 30, 6); } K.text(ctx, '1 INCH', 1300, 520, { size: 110, color: '#ff3b30', k });
    K.text(ctx, '/ 10,000 YEARS', 1350, 700, { size: 70, color: '#2b3a66', k: K.ph(a.t, a.d, 0.5, 0.7) });
  },
  // 73 2,5 cm. Tras diez mil años de viento, lluvia y hielo, las caras han perdido apenas el ancho de una yema de dedo
  73: (ctx, a, K) => {
    rushmore(ctx, K, a.t, 0.75); for (let i = 0; i < 40; i++) { const y = 250 + ((a.t * 600 + i * 60) % 1100); ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(K.X0 + (i * 173) % K.XW, y); ctx.lineTo(K.X0 + (i * 173) % K.XW - 10, y + 30); ctx.stroke(); }
    const k = K.ph(a.t, a.d, 0.4, 0.7); K.C(ctx, 1500, 800, 220 * K.ease.outBack(k), '#ffffff', 10); K.prop(ctx, 'mano', 1500, 820, 0.7 * k, a.t); K.text(ctx, '≈ FINGERTIP', 1500, 1100, { size: 70, color: '#ffffff', k });
  },
  // 74 Así que Washington, Jefferson, Roosevelt y Lincoln siguen ahí, esperando a que alguien pregunte quiénes eran
  74: (ctx, a, K) => {
    rushmore(ctx, K, a.t, 0.95); ['WASHINGTON', 'JEFFERSON', 'ROOSEVELT', 'LINCOLN'].forEach((n, i) => K.text(ctx, n, 540 + [-480, -120, 200, 520][i] * 0.95, 1350, { size: 44, color: '#ffffff', k: K.ph(a.t, a.d, i * 0.12, 0.15 + i * 0.12) }));
    K.text(ctx, 'WHO WERE THEY?', 540, 380, { size: 100, color: '#ffd166', k: K.ph(a.t, a.d, 0.65, 0.8) });
  },
  // 75 Rascacielos, metros, puentes, incluso centrales: todo desaparecido. Pero quedan cuatro caras de piedra
  75: (ctx, a, K) => {
    bg(ctx, K, '#1b1f4a', '#3a2a6a'); const L = [['skyline', 'SKYSCRAPERS'], ['tren', 'SUBWAYS'], ['', 'BRIDGES'], ['rayo', 'POWER PLANTS']];
    L.forEach(([p, l], i) => { const x = -650 + i * 470, k = K.ph(a.t, a.d, i * 0.12, 0.15 + i * 0.12); K.R(ctx, x - 190, 500, 380, 300, 20, '#fff6e0', 8); if (p && p !== 'skyline') K.prop(ctx, p, x, 640, 0.4, a.t); else if (p) for (let j = 0; j < 4; j++) K.R(ctx, x - 140 + j * 70, 760 - 60 - j * 30, 50, 60 + j * 30, 4, '#9aa6b8', 4); else { ctx.lineWidth = 10; ctx.strokeStyle = '#7a8aa0'; ctx.beginPath(); ctx.arc(x, 760, 130, Math.PI, 0); ctx.stroke(); } K.text(ctx, l, x, 870, { size: 40, color: '#ffffff' }); cross(ctx, K, x, 650, 120, k); });
    const k2 = K.ph(a.t, a.d, 0.6, 0.85); ctx.save(); ctx.translate(1500, 650); ctx.scale(K.ease.outBack(k2), K.ease.outBack(k2)); for (let i = 0; i < 4; i++) stoneFace(ctx, K, -180 + i * 120, 0, 0.35, a.t, i); ctx.restore(); K.text(ctx, 'REMAIN', 1500, 950, { size: 70, color: '#2ec27e', k: k2 });
  },
  // 76 La ironía: la naturaleza, que lo borró todo, nos dejó lo único que tallamos en ella
  76: (ctx, a, K) => {
    rushmore(ctx, K, a.t, 0.85); const k = K.ph(a.t, a.d, 0.1, 1); for (let i = 0; i < 6; i++) vine(ctx, K, -700 + i * 160 + (i > 2 ? 1400 : 0), 1500, 600, a.t, k);
    K.R(ctx, 1150, 380, 700, 160, 40, '#ffffff', 8); K.text(ctx, 'IRONY', 1500, 460, { size: 90, color: '#7b5cff', k: K.ph(a.t, a.d, 0.4, 0.6) });
  },
  // 77 La respuesta al misterio: lo último que demuestra que estuvimos aquí es una montaña que se nos parece
  77: (ctx, a, K) => {
    rushmore(ctx, K, a.t, 0.9 + K.ph(a.t, a.d, 0, 1) * 0.15); suspect(ctx, K, 4, 'MT. RUSHMORE', 1550, 520, K.ph(a.t, a.d, 0.2, 0.4)); K.C(ctx, 1550, 520, 210 * K.ph(a.t, a.d, 0.5, 0.7), 'rgba(46,194,126,0)', 0); if (K.ph(a.t, a.d, 0.5, 0.7) > 0) { ctx.lineWidth = 20; ctx.strokeStyle = '#2ec27e'; ctx.beginPath(); ctx.arc(1550, 520, 260, 0, Math.PI * 2 * K.ph(a.t, a.d, 0.5, 0.7)); ctx.stroke(); }
    K.text(ctx, 'LAST PROOF', 540, 380, { size: 100, color: '#ffd166', k: K.ph(a.t, a.d, 0.7, 0.85) });
  },
  // 78 Tu turno: si pudieras dejar una cosa que dure 10.000 años, ¿cuál sería?
  78: (ctx, a, K) => {
    bg(ctx, K, '#fff1e0', '#ffd9b8'); K.midShot(ctx, you(a), { x: 540, y: 950, s: 0.6, mood: 'happy', t: a.t }); K.text(ctx, '10,000 YEARS', 540, 340, { size: 100, color: '#a8571d', k: K.ph(a.t, a.d, 0, 0.2) });
    ['cofre', 'diamante', 'carta', 'trofeo'].forEach((p, i) => { const k = K.ph(a.t, a.d, 0.2 + i * 0.12, 0.35 + i * 0.12); const x = i < 2 ? -500 + i * 300 : 1300 + (i - 2) * 300, y = 800 + Math.sin(a.t * 2 + i) * 20; K.C(ctx, x, y, 130 * K.ease.outBack(k), '#ffffff', 8); K.prop(ctx, p, x, y, 0.45 * k, a.t); }); K.text(ctx, '?', 540, 1300, { size: 140, color: '#ff4fa3', k: K.ph(a.t, a.d, 0.7, 0.85) });
  },
  // 79 Cuéntanoslo en comentarios. Y mira el siguiente vídeo: ¿y si cavaras hacia abajo en línea recta?
  79: (ctx, a, K) => {
    bg(ctx, K, '#8fd3ff', '#ffe1b8'); ctx.fillStyle = '#6b4a2b'; ctx.fillRect(K.X0, 1000, K.XW, 900); ctx.fillStyle = '#c0392b'; ctx.fillRect(K.X0, 1500, K.XW, 400); const k = K.ph(a.t, a.d, 0.3, 1);
    ctx.fillStyle = '#1b1208'; ctx.fillRect(1250, 1000, 180, 600 * k); stand(ctx, a, K, 1340, 1000 + 600 * k * 0.2, 0.1, you(a), 'happy', { arms: 'up' });
    const k1 = K.ph(a.t, a.d, 0, 0.3); ctx.save(); ctx.translate(-200, 650); ctx.scale(K.ease.outBack(k1), K.ease.outBack(k1)); K.R(ctx, -380, -170, 760, 340, 40, '#ffffff', 9); K.text(ctx, 'COMMENT 👇'.replace(' 👇', ''), 0, -50, { size: 80, color: '#ff4fa3' }); K.R(ctx, -300, 30, 600, 80, 20, '#f2f2f6', 4); ctx.restore();
    K.R(ctx, 1000, 350, 680, 180, 40, '#ff3b30', 9); K.P(ctx, [[1060, 390], [1060, 490], [1140, 440]], '#ffffff', 5); K.text(ctx, 'NEXT: DIG DOWN', 1380, 440, { size: 60, color: '#ffffff', k: K.ph(a.t, a.d, 0.5, 0.65) });
  },
};
const fmt = (n) => Math.round(n).toLocaleString('en-US');

// ---------------- HORIZONTAL «CINE» (lib/cine.mjs): el mundo vacío visto desde dentro, a la altura de los ojos ----------------
import { plano, etiqueta, pastilla, cifra, panel, motas, haz } from '../../lib/cine.mjs';
import { fg, SET, glow } from '../../lib/sets.mjs';
const Y = (a) => a.who;
// Ficha de sospechoso elegante (y tachón rojo)
function ficha(ctx, K, a, n, label, x, y, k, tachado = 0) { if (k <= 0) return; const s = 0.85 + 0.15 * K.ease.outBack(K.clamp(k)); ctx.save(); ctx.globalAlpha = K.clamp(k * 1.5); ctx.translate(x, y); ctx.scale(s, s); panel(ctx, 0, 0, 560, 230, 26); etiqueta(ctx, a, `Suspect #${n}`, 0, -50, { align: 'center', size: 28, k: 1 }); K.text(ctx, label, 0, 30, { size: 60, color: '#ffe6c2' }); ctx.restore(); tacha(ctx, x, y + 30, 460, tachado); }
function tacha(ctx, x, y, w, k) { if (k <= 0) return; ctx.save(); ctx.strokeStyle = '#ff3b30'; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.shadowColor = 'rgba(255,59,48,0.6)'; ctx.shadowBlur = 16; ctx.beginPath(); ctx.moveTo(x - w / 2, y + 10); ctx.lineTo(x - w / 2 + w * Math.min(1, k), y - 10 * (2 * Math.min(1, k) - 1)); ctx.stroke(); ctx.restore(); }
const SALTO = (txt, sub) => (ctx, a) => { cifra(ctx, a, txt, 960, 430, { size: 190 }); if (sub) etiqueta(ctx, a, sub, 960, 590, { align: 'center', size: 34 }); };
function ballena(ctx, K, x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(Math.sin(t * 0.6) * 0.04); K.E(ctx, 0, 0, 300, 95, '#2a4a6a', 0, 4); K.E(ctx, 40, 40, 220, 45, '#6a8aa8', 0, 0); ctx.save(); ctx.translate(-290, -10); ctx.rotate(Math.sin(t * 1.2) * 0.3); K.P(ctx, [[0, 0], [-120, -70], [-90, 0], [-120, 70]], '#2a4a6a', 4); ctx.restore(); K.C(ctx, 210, -15, 9, '#0a0a14', 0); K.P(ctx, [[0, 40], [60, 120], [90, 40]], '#2a4a6a', 3); ctx.restore(); }
function ondas(ctx, a, x, y, n = 4) { ctx.save(); ctx.lineWidth = 4; for (let i = 0; i < n; i++) { const r = ((a.t * 120 + i * 90) % 360) + 30; ctx.globalAlpha = Math.max(0, 1 - r / 390) * 0.7; ctx.strokeStyle = '#bfe9ff'; ctx.beginPath(); ctx.arc(x, y, r, -0.6, 0.6); ctx.stroke(); } ctx.restore(); }
function chispas(ctx, a, x, y, n = 24) { for (let i = 0; i < n; i++) { const an = (i / n) * 6.28, q = (a.t * 2 + i * 0.13) % 1; ctx.fillStyle = i % 2 ? '#ffd166' : '#fff3c4'; ctx.globalAlpha = 1 - q; ctx.beginPath(); ctx.arc(x + Math.cos(an) * q * 220, y + Math.sin(an) * q * 160 + q * q * 160, 6, 0, 7); ctx.fill(); } ctx.globalAlpha = 1; }
const autos = (ctx, K, a, lst) => lst.forEach(([x, y, s, c, d]) => (c === 'taxi' ? taxi(ctx, K, x, y, s, d || 0) : car(ctx, K, x, y, s, c, d || 0)));
export const ancho = {
  // 0 Si los humanos desaparecieran, ¿qué demostraría que existimos? Tú, solo, en una plaza vacía
  0: plano.general({ set: 'plaza', o: { hora: 'atardecer' }, z: [1.1, 1], f: [960, 600], actores: [{ q: Y, x: 960, esc: 0.8, mood: 'worried' }], texto: { etiqueta: 'What proves we existed?' } }),
  // 1 Todos desaparecen a la vez; solo tú lo ves
  1: plano.primer({ set: 'plaza', o: { hora: 'atardecer' }, q: Y, mood: 'shocked', lado: 'izq', antes: (ctx, a, K) => { for (let i = 0; i < 6; i++) { const q = K.ph(a.t, a.d, 0.1 + i * 0.08, 0.3 + i * 0.08); if (q > 0 && q < 1) K.sparkles(ctx, 1100 + i * 140, 600 + (i % 2) * 40, a.t, 6, 80 * (1 - q)); } }, texto: { etiqueta: 'The only witness', } }),
  // 2 Saltos: una hora, un día, un año, cien años, diez mil
  2: plano.dato({ set: 'plaza', o: { hora: 'atardecer' }, titulo: 'Every jump knocks out a suspect', dibuja: (ctx, a) => ['1 hour', '1 day', '1 year', '100 years', '10,000 years'].forEach((w, i) => pastilla(ctx, a, w, 330 + i * 315, 560, { size: 40, k: Math.max(0, Math.min(1, (a.t / a.d - 0.1 - i * 0.14) / 0.1)) })) }),
  // 3 Lo último en pie es algo que has visto mil veces
  3: plano.dato({ set: 'montes', o: { caras: true }, look: 'atardecer', blur: 30, oscuro: 0.5, titulo: 'The last thing standing', valor: '?', sub: "you've seen it a thousand times" }),
  // 4 Mediodía en la gran plaza: taxis con puertas abiertas, un café humeando
  4: plano.general({ set: 'plaza', o: { hora: 'dia' }, look: 'dia', z: [1, 1.06], f: [960, 700],
    despues: (ctx, a, K) => { autos(ctx, K, a, [[640, 860, 0.9, 'taxi', 0.9], [1320, 830, 0.8, 'taxi', 0.6], [980, 720, 0.45, '#4c7bd0']]); K.R(ctx, 1550, 880, 200, 16, 6, '#d9d9de', 4); K.R(ctx, 1640, 896, 14, 110, 4, '#8a8f9a', 0); K.R(ctx, 1620, 840, 40, 40, 8, '#ffffff', 3); for (let i = 0; i < 3; i++) { ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(1630 + i * 10, 830); ctx.quadraticCurveTo(1615 + i * 10 + Math.sin(a.t * 3 + i) * 12, 790, 1640 + i * 10, 750 - (a.t * 20 % 30)); ctx.stroke(); } }, texto: { etiqueta: 'Noon' } }),
  // 5 Un perro entra trotando en la calle vacía; el semáforo cuenta para nadie
  5: plano.general({ set: 'calle', o: { hora: 'dia' }, look: 'dia', despues: (ctx, a, K) => { animal(ctx, K, -200 + K.ph(a.t, a.d, 0, 1) * 1600, 880, 0.8, 'dog', a.t, 1, 1); K.R(ctx, 1560, 520, 24, 400, 6, '#3a3d4c', 4); K.R(ctx, 1500, 440, 140, 120, 14, '#1c1a2b', 5); K.text(ctx, String(Math.max(0, 15 - Math.floor(a.t * 2) % 16)), 1570, 505, { size: 64, color: '#ff8a3a' }); }, delante: (ctx, a) => fg.farola(ctx, 160, a.t) }),
  // 6 En la autopista, los coches se paran solos
  6: plano.general({ set: 'autopista', look: 'dia', z: [1, 1.08], f: [960, 620], despues: (ctx, a, K) => { const k = K.ease.out(K.ph(a.t, a.d, 0, 0.7)); autos(ctx, K, a, [[760 - (1 - k) * 60, 720 + (1 - k) * 30, 0.6, '#e05a4a'], [1180 + (1 - k) * 60, 660, 0.4, '#4c7bd0'], [920, 600, 0.25, '#2ec27e'], [400 - (1 - k) * 200, 900, 1.1, '#f2c14e']]); } }),
  // 7 La sala de control de la central: pantallas encendidas, alarmas y nadie
  7: plano.general({ set: 'control', o: { alarma: 1 }, look: 'noche', z: [1, 1.08], f: [960, 500] }),
  // 8 Una hora después. Sospechoso 1: las luces de la ciudad
  8: plano.general({ set: 'avenida', o: { hora: 'noche' }, look: 'noche', despues: (ctx, a, K) => { cifra(ctx, a, '+1 HOUR', 960, 250, { size: 120 }); ficha(ctx, K, a, 1, 'CITY LIGHTS', 960, 640, K.ph(a.t, a.d, 0.4, 0.6)); } }),
  // 9 Las centrales necesitan gente: combustible, mantenimiento, reparaciones
  9: plano.general({ set: 'control', o: { alarma: 0.5 }, look: 'noche', despues: (ctx, a) => ['Fuel', 'Maintenance', 'Repairs'].forEach((w, i) => pastilla(ctx, a, w, 480 + i * 480, 560, { size: 44, k: Math.max(0, Math.min(1, (a.t / a.d - 0.1 - i * 0.2) / 0.1)) })) }),
  // 10 Un transformador revienta en chispas; los barrios se apagan en cadena
  10: plano.general({ set: 'calle', o: { hora: 'noche' }, look: 'noche', antes: (ctx, a, K) => { K.R(ctx, 860, 200, 30, 700, 6, '#3a3d4c', 4); K.R(ctx, 800, 220, 150, 120, 10, '#5b5f6b', 5); const k = K.ph(a.t, a.d, 0.1, 0.4); if (k > 0) { chispas(ctx, a, 875, 280); glow(ctx, 875, 280, 300, '#ffd166', 0.6 * (1 - k * 0.5)); } const d = K.ph(a.t, a.d, 0.4, 0.95); ctx.fillStyle = `rgba(4,6,20,${d * 0.6})`; ctx.fillRect(0, 0, 1920 * d, 1080); } }),
  // 11 En la central nuclear, las barras de control caen solas: SCRAM
  11: plano.detalle({ set: 'control', o: { alarma: 1 }, look: 'noche', dibuja: (ctx, a, K) => { panel(ctx, 960, 540, 760, 560, 30); for (let i = 0; i < 5; i++) { const x = 720 + i * 120, y = 300 + K.ease.inOut(K.ph(a.t, a.d, 0.15 + i * 0.04, 0.6 + i * 0.04)) * 300; K.R(ctx, x - 12, 300, 24, 420, 6, 'rgba(255,255,255,0.12)', 0); K.R(ctx, x - 22, y - 200, 44, 200, 8, '#9aa4b5', 3); } if (a.t / a.d > 0.65) cifra(ctx, a, 'SCRAM', 960, 700, { size: 80, color: '#2ec27e', glowCol: '#2ec27e', k: (a.t / a.d - 0.65) / 0.1 }); } }),
  // 12 Pero el combustible gastado en las piscinas necesita bombas, y las bombas, luz
  12: plano.general({ set: (ctx, t) => { const r = SET.control(ctx, t, { alarma: 0.3 }); return r; }, look: 'frio', despues: (ctx, a, K) => { K.R(ctx, 300, 640, 1320, 300, 20, '#1f6a9a', 6); for (let i = 0; i < 10; i++) K.R(ctx, 380 + i * 120, 700, 70, 200, 6, '#3a8fd6', 3); glow(ctx, 960, 780, 700, '#4cc9f0', 0.35); pastilla(ctx, a, 'Pumps need power', 960, 560); } }),
  // 13 Los generadores diésel aguantan días, quizá semanas; nadie viene a repostar
  13: plano.general({ set: 'control', o: { luces: 0.5 }, look: 'noche', despues: (ctx, a, K) => { K.R(ctx, 600, 640, 720, 300, 20, '#c9a23a', 6); K.R(ctx, 640, 680, 200, 120, 10, '#2a2a33', 4); for (let i = 0; i < 6; i++) K.R(ctx, 900 + i * 60, 680, 30, 220, 6, '#a8862a', 0); const f = 1 - K.ph(a.t, a.d, 0.1, 0.95); K.R(ctx, 1000, 560, 260, 40, 12, '#1c1a2b', 4); K.R(ctx, 1006, 566, 248 * f, 28, 8, f > 0.3 ? '#2ec27e' : '#ff3b30', 0); etiqueta(ctx, a, 'Fuel', 1130, 530, { align: 'center' }); } }),
  // 14 Los semáforos parpadean y mueren, manzana a manzana
  14: plano.general({ set: 'avenida', o: { hora: 'atardecer' }, z: [1, 1.1], f: [960, 480], despues: (ctx, a, K) => { for (let j = 0; j < 5; j++) { const k = (j + 1) / 6, x = 960 + (j % 2 ? 1 : -1) * (120 + 700 * k * k), y = 470 + 600 * k * k * 0.75, s = 0.3 + k; const off = a.t / a.d > 0.15 + (4 - j) * 0.15; K.R(ctx, x - 20 * s, y - 120 * s, 40 * s, 110 * s, 8 * s, '#1c1a2b', 3); if (!off) { K.C(ctx, x, y - 95 * s, 12 * s, Math.sin(a.t * 12) > 0 ? '#ff3b30' : '#5a1a1a', 0); glow(ctx, x, y - 95 * s, 60 * s, '#ff3b30', 0.4); } } } }),
  // 15 Sospechoso 1 tachado. Próxima parada: un día después
  15: plano.general({ set: 'avenida', o: { hora: 'noche' }, look: 'noche', despues: (ctx, a, K) => { ctx.fillStyle = 'rgba(4,6,20,0.5)'; ctx.fillRect(0, 0, 1920, 1080); ficha(ctx, K, a, 1, 'CITY LIGHTS', 960, 480, 1, K.ph(a.t, a.d, 0.15, 0.45)); pastilla(ctx, a, 'Next: +1 day', 960, 760, { k: K.ph(a.t, a.d, 0.6, 0.75) }); } }),
  // 16 Veinticuatro horas. Bajo Nueva York trabaja un equipo que nunca duerme: bombas
  16: plano.general({ set: 'anden', o: { luces: 0.7 }, look: 'noche', despues: (ctx, a, K) => { cifra(ctx, a, '+1 DAY', 960, 250, { size: 120 }); for (let i = 0; i < 3; i++) { const x = 300 + i * 260; K.R(ctx, x, 860, 160, 120, 14, '#5b6b7a', 5); K.C(ctx, x + 80, 860, 30, '#3a4a5a', 4); } } }),
  // 17 El metro está bajo el nivel freático: 13 millones de galones al día
  17: plano.dato({ set: 'anden', o: { luces: 0.8 }, look: 'frio', titulo: 'Pumped out every day', valor: '13,000,000', sub: 'gallons of groundwater' }),
  // 18 Casi veinte piscinas olímpicas cada día
  18: plano.dato({ set: 'anden', o: { luces: 0.8 }, look: 'frio', titulo: 'Every single day', dibuja: (ctx, a, K) => { for (let i = 0; i < 20; i++) { const k = K.ph(a.t, a.d, 0.05 + i * 0.03, 0.12 + i * 0.03); if (k <= 0) continue; const x = 420 + (i % 10) * 110, y = 430 + Math.floor(i / 10) * 150; ctx.globalAlpha = k; K.R(ctx, x, y, 90, 110, 8, '#3a8fd6', 3); for (let l = 0; l < 3; l++) K.R(ctx, x + 10 + l * 26, y + 10, 4, 90, 2, '#bfe9ff', 0); ctx.globalAlpha = 1; } etiqueta(ctx, a, 'About 20 Olympic pools', 960, 790, { align: 'center', k: K.ph(a.t, a.d, 0.7, 0.8) }); } }),
  // 19 Las bombas se apagan: el agua se filtra por las paredes del túnel
  19: plano.general({ set: 'anden', o: { luces: 0.5, agua: 0.05 }, look: 'noche', despues: (ctx, a, K) => { for (let i = 0; i < 8; i++) { const x = 140 + i * 230, q = (a.t * 0.8 + i * 0.3) % 1; ctx.fillStyle = 'rgba(140,200,240,0.8)'; ctx.fillRect(x, 380, 6, 380 * q); K.E(ctx, x + 3, 380 + 380 * q, 6, 9, '#bfe9ff', 0, 0); } } }),
  // 20 Según The World Without Us, algunas estaciones se inundarían en unas 36 horas
  20: plano.dato({ set: 'anden', o: { agua: 0.3, luces: 0.5 }, look: 'noche', titulo: 'Some stations could flood within', valor: '36 HOURS', sub: 'Alan Weisman · The World Without Us' }),
  // 21 En el andén, un tren vacío con las puertas abiertas; el agua sube por encima de las vías
  21: plano.general({ set: (ctx, t, o) => SET.anden(ctx, t, { ...o, agua: 0.1 + 0.4 * Math.min(1, (o.a?.t || 0) / 8) }), o: { luces: 0.55 }, look: 'noche', z: [1, 1.08], f: [1250, 600] }),
  // 22 Bajo la ciudad, hormigas e insectos huyen del agua
  22: plano.detalle({ set: 'anden', o: { agua: 0.35, luces: 0.4 }, look: 'noche', dibuja: (ctx, a, K) => { for (let i = 0; i < 40; i++) { const x = ((a.t * (120 + (i % 5) * 30) + i * 97) % 2200) - 140, y = 640 + (i % 8) * 40 + Math.sin(a.t * 6 + i) * 4; ctx.save(); ctx.translate(x, y); K.E(ctx, 0, 0, 14, 8, '#2a1a10', 0, 0); K.C(ctx, 14, 0, 7, '#2a1a10', 0); K.C(ctx, -12, 0, 8, '#2a1a10', 0); ctx.strokeStyle = '#2a1a10'; ctx.lineWidth = 2; for (const d of [-1, 0, 1]) { ctx.beginPath(); ctx.moveTo(d * 6, 0); ctx.lineTo(d * 10 + Math.sin(a.t * 20 + i) * 4, 12); ctx.moveTo(d * 6, 0); ctx.lineTo(d * 10 - Math.sin(a.t * 20 + i) * 4, -12); ctx.stroke(); } ctx.restore(); } } }),
  // 23 Ciudades enteras sin luz; las neveras se calientan y la comida se estropea
  23: plano.general({ set: 'cocina', o: { hora: 'noche', nevera: true, oscuro: 0.35 }, look: 'noche', z: [1, 1.08], f: [1700, 500], despues: (ctx, a, K) => { const k = K.ph(a.t, a.d, 0.2, 0.9); for (let i = 0; i < 3; i++) { ctx.globalAlpha = k * 0.7; K.C(ctx, 1640 + i * 70, 300 - (a.t * 30 + i * 30) % 80, 10, '#9aa86a', 0); } ctx.globalAlpha = 1; pastilla(ctx, a, '4°C  →  21°C'.replace('→', '>'), 1710, 120, { k: K.ph(a.t, a.d, 0.3, 0.5) }); } }),
  // 24 Un móvil vibra en un piso abandonado y se apaga
  24: plano.detalle({ set: 'salon', o: { hora: 'noche' }, look: 'noche', dibuja: (ctx, a, K) => { const on = a.t / a.d < 0.65, sh = on ? Math.sin(a.t * 60) * 6 : 0; ctx.save(); ctx.translate(960 + sh, 560); ctx.rotate(-0.12); panel(ctx, 0, 0, 380, 700, 50); if (on) { ctx.fillStyle = '#3a5aa8'; ctx.beginPath(); ctx.roundRect(-170, -330, 340, 660, 40); ctx.fill(); K.text(ctx, 'Mom', 0, -80, { size: 60, color: '#ffffff' }); K.text(ctx, 'calling...', 0, 0, { size: 34, color: '#bfe6ff' }); } ctx.restore(); if (on) glow(ctx, 960, 560, 500, '#6a8aff', 0.3); } }),
  // 25 Los perros esperan junto a las puertas; los gatos miran por la ventana
  25: plano.general({ set: 'salon', o: { hora: 'atardecer' }, look: 'interior', despues: (ctx, a, K) => { animal(ctx, K, 400, 900, 0.9, 'dog', a.t, 1, 0); ctx.save(); ctx.translate(1450, 560); K.E(ctx, 0, 0, 60, 50, '#5b5f6b', 0, 3); K.C(ctx, 0, -60, 40, '#5b5f6b', 3); K.P(ctx, [[-35, -80], [-25, -120], [-10, -90]], '#5b5f6b', 3); K.P(ctx, [[35, -80], [25, -120], [10, -90]], '#5b5f6b', 3); ctx.strokeStyle = '#5b5f6b'; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(50, 30); ctx.quadraticCurveTo(110, 40 + Math.sin(a.t * 2) * 20, 90, -30); ctx.stroke(); ctx.restore(); } }),
  // 26 En todo el mundo, minas, túneles y sótanos se llenan de agua
  26: plano.general({ set: (ctx, t) => SET.anden(ctx, t, { agua: 0.6, luces: 0.3, tren: false }), look: 'noche', despues: (ctx, a) => ['Mines', 'Tunnels', 'Basements'].forEach((w, i) => pastilla(ctx, a, w, 480 + i * 480, 300, { size: 44, k: Math.max(0, Math.min(1, (a.t / a.d - 0.1 - i * 0.2) / 0.1)) })) }),
  // 27 Sospechoso 2, el gran mundo subterráneo: un río a oscuras. Tachado. Ahora, un año
  27: plano.general({ set: (ctx, t) => SET.anden(ctx, t, { agua: 0.85, luces: 0.25, tren: false }), look: 'noche', despues: (ctx, a, K) => { ficha(ctx, K, a, 2, 'UNDERGROUND', 960, 420, 1, K.ph(a.t, a.d, 0.15, 0.45)); pastilla(ctx, a, 'Next: +1 year', 960, 700, { k: K.ph(a.t, a.d, 0.6, 0.75) }); } }),
  // 28 Un año después: la naturaleza vuelve
  28: plano.general({ set: 'calle', o: { hora: 'dia', maleza: 0.45 }, look: 'dia', z: [1, 1.08], despues: (ctx, a) => cifra(ctx, a, '+1 YEAR', 960, 250, { size: 120 }) }),
  // 29 En 1986, Chernóbil: todos salen de una zona enorme y lo salvaje vuelve
  29: plano.general({ set: 'bloques', o: { ruina: 0.4 }, look: 'frio', texto: { etiqueta: 'Chernobyl · 1986' } }),
  // 30 Lobos, jabalíes, ciervos y caballos salvajes por los pueblos abandonados
  30: plano.general({ set: 'bloques', look: 'atardecer', despues: (ctx, a, K) => { [['wolf', 300, 900, 0.8], ['boar', 760, 940, 0.75], ['deer', 1220, 880, 0.85], ['horse', 1640, 920, 0.9]].forEach(([k, x, y, s], i) => { animal(ctx, K, x + Math.sin(a.t * 0.5 + i) * 20, y, s, k, a.t, i % 2 ? -1 : 1, 0.5); pastilla(ctx, a, k === 'boar' ? 'wild boar' : k === 'horse' ? 'wild horses' : k + (k === 'deer' ? '' : 's'), x, y - 220, { size: 30, k: K.ph(a.t, a.d, 0.1 + i * 0.12, 0.2 + i * 0.12) }); }); } }),
  // 31 Una manada de lobos entre bloques; caballos pastando donde había un aparcamiento
  31: plano.general({ set: 'bloques', o: { ruina: 0.9 }, look: 'atardecer', z: [1, 1.08], despues: (ctx, a, K) => { for (let i = 0; i < 4; i++) animal(ctx, K, -300 + K.ph(a.t, a.d, 0, 1) * 1400 + i * 170, 960 - (i % 2) * 40, 0.7, 'wolf', a.t + i, 1, 1); animal(ctx, K, 1600, 880, 0.9, 'horse', a.t, -1, 0); }, delante: (ctx, a) => fg.arbol(ctx, 2000, a.t) }),
  // 32 Gatos y perros se vuelven salvajes; los perros grandes forman manadas
  32: plano.general({ set: 'calle', o: { hora: 'atardecer', maleza: 0.6 }, despues: (ctx, a, K) => { for (let i = 0; i < 5; i++) animal(ctx, K, 400 + i * 260 + Math.sin(a.t + i) * 20, 900 + (i % 2) * 30, 0.75 - (i % 2) * 0.1, 'dog', a.t + i, i % 2 ? -1 : 1, 0.4); } }),
  // 33 Los animales de granja rompen las vallas y salen a los campos
  33: plano.general({ set: 'granja', o: { valla: 0.6 }, look: 'dia', despues: (ctx, a, K) => { animal(ctx, K, 400 + K.ph(a.t, a.d, 0, 1) * 500, 940, 0.9, 'cow', a.t, 1, 1); animal(ctx, K, 1100 + K.ph(a.t, a.d, 0, 1) * 300, 880, 0.7, 'cow', a.t + 1, 1, 1); animal(ctx, K, 200, 860, 0.6, 'horse', a.t, 1, 0); } }),
  // 34 Las malas hierbas rompen la acera: una grieta se vuelve un jardín
  34: plano.detalle({ set: 'calle', o: { hora: 'dia', maleza: 0.5 }, look: 'dia', dibuja: (ctx, a, K) => { const k = K.ph(a.t, a.d, 0, 0.9); K.R(ctx, 0, 620, 1920, 460, 0, '#b8bcc4', 0); ctx.strokeStyle = '#3a3a40'; ctx.lineWidth = 10 + 40 * k; ctx.beginPath(); ctx.moveTo(300, 1080); ctx.lineTo(700, 820); ctx.lineTo(1100, 860); ctx.lineTo(1600, 640); ctx.stroke(); for (let i = 0; i < Math.round(18 * k); i++) { const u = i / 18, x = 300 + u * 1300, y = 1080 - u * 440 + Math.sin(i) * 20, h = 60 + (i % 4) * 40 * k; ctx.strokeStyle = ['#4fae5a', '#3f9150'][i % 2]; ctx.lineWidth = 8; for (const d of [-1, 0, 1]) { ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + d * 14, y - h * 0.6, x + d * 34, y - h); ctx.stroke(); } if (i % 5 === 0 && k > 0.6) K.C(ctx, x, y - h - 10, 14, ['#ffd166', '#ff8ab8', '#ffffff'][i % 3], 0); } } }),
  // 35 Los céspedes se vuelven praderas: hierba hasta la cintura
  35: plano.general({ set: 'suburbio', o: { ruina: 0.3 }, look: 'dia', actores: [{ q: Y, x: 960, esc: 1, mood: 'shocked' }], despues: (ctx, a, K) => { for (let i = 0; i < 160; i++) { const x = (i * 12.3) % 1920, h = 200 + Math.sin(i) * 60; ctx.strokeStyle = ['#7fb05a', '#6fa04a', '#9fc06a'][i % 3]; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(x, 1090); ctx.quadraticCurveTo(x + Math.sin(a.t * 2 + i) * 20, 1000 - h * 0.4, x + Math.sin(a.t * 2 + i) * 40, 1000 - h * 0.85); ctx.stroke(); } }, texto: { etiqueta: 'Waist-high grass' } }),
  // 36 La lluvia y las semillas atascan los desagües; las calles se vuelven arroyos
  36: plano.general({ set: 'calle', o: { hora: 'gris', maleza: 0.6 }, look: 'frio', despues: (ctx, a, K) => { ctx.save(); ctx.globalAlpha = 0.6; ctx.fillStyle = '#4f86b0'; ctx.fillRect(0, 930, 1920, 150); ctx.strokeStyle = 'rgba(220,240,255,0.6)'; ctx.lineWidth = 3; for (let i = 0; i < 6; i++) { ctx.beginPath(); for (let x = 0; x <= 1920; x += 40) { const y = 950 + i * 22 + Math.sin(x / 60 + a.t * 3 + i) * 4; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); } ctx.restore(); ctx.strokeStyle = 'rgba(200,220,255,0.5)'; ctx.lineWidth = 2; for (let i = 0; i < 120; i++) { const x = (i * 97 + a.t * 300) % 1920, y = (i * 53 + a.t * 1400) % 1080; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 8, y + 30); ctx.stroke(); } } }),
  // 37 Los insectos entran por las ventanas; telarañas en los escaparates
  37: plano.detalle({ set: 'calle', o: { hora: 'atardecer', maleza: 0.6 }, dibuja: (ctx, a, K) => { ctx.save(); ctx.translate(960, 520); ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 3; for (let i = 0; i < 12; i++) { const an = i / 12 * 6.28; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(an) * 460, Math.sin(an) * 460); ctx.stroke(); } for (let r = 40; r < 460; r += 40) { ctx.beginPath(); for (let i = 0; i <= 12; i++) { const an = i / 12 * 6.28; ctx.lineTo(Math.cos(an) * r, Math.sin(an) * r + 6); } ctx.stroke(); } K.E(ctx, 0, 0, 22, 28, '#1c1a2b', 0, 0); ctx.restore(); for (let i = 0; i < 8; i++) K.C(ctx, 300 + ((a.t * 200 + i * 230) % 1400), 200 + Math.sin(a.t * 5 + i) * 60 + i * 40, 5, '#1c1a2b', 0); } }),
  // 38 La lluvia entra en las oficinas: el papel se hincha, la moqueta se pudre, sale moho
  38: plano.general({ set: 'oficina', o: { hora: 'gris', maleza: 0.7 }, look: 'frio', despues: (ctx, a, K) => { const k = K.ph(a.t, a.d, 0, 0.9); for (let i = 0; i < 14; i++) { ctx.globalAlpha = 0.5 * k; K.C(ctx, 200 + (i * 137) % 1500, 120 + (i * 71) % 400, 30 + (i % 4) * 25 * k, ['#5a7a3a', '#3a5a3a', '#6a6a3a'][i % 3], 0); } ctx.globalAlpha = 1; ctx.strokeStyle = 'rgba(200,220,255,0.5)'; ctx.lineWidth = 2; for (let i = 0; i < 60; i++) { const x = 400 + (i * 97) % 900, y = (i * 53 + a.t * 1200) % 700; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 6, y + 26); ctx.stroke(); } } }),
  // 39 Los coches de la autopista siguen ahí, pero ya trepan enredaderas
  39: plano.general({ set: 'autopista', o: { maleza: 0.4 }, look: 'atardecer', z: [1.05, 1.12], f: [900, 760], despues: (ctx, a, K) => { autos(ctx, K, a, [[860, 820, 1.4, '#e05a4a'], [1350, 660, 0.6, '#4c7bd0']]); for (let i = 0; i < 4; i++) vine(ctx, K, 700 + i * 110, 880, 180 + i * 30, a.t, K.ph(a.t, a.d, 0.1 + i * 0.1, 0.9)); } }),
  // 40 Sin bombas, el agua de las piscinas de combustible se calienta y se evapora
  40: plano.general({ set: 'control', o: { luces: 0.2 }, look: 'frio', despues: (ctx, a, K) => { const k = K.ph(a.t, a.d, 0, 1); K.R(ctx, 300, 640, 1320, 300, 20, '#1f6a9a', 6); K.R(ctx, 306, 646 + 120 * k, 1308, 288 - 120 * k, 16, '#3a8fd6', 0); for (let i = 0; i < 10; i++) K.R(ctx, 380 + i * 120, 720, 70, 200, 6, '#9aa4b5', 3); for (let i = 0; i < 12; i++) { const q = (a.t * 0.4 + i * 0.09) % 1; ctx.globalAlpha = (1 - q) * 0.5; K.C(ctx, 360 + i * 110 + Math.sin(a.t + i) * 20, 640 - q * 400, 30 + q * 50, '#e6eef4', 0); } ctx.globalAlpha = 1; } }),
  // 41 Algunos sitios podrían causar daños locales; el resto, la naturaleza
  41: plano.dato({ set: 'control', o: { luces: 0.2 }, look: 'tension', titulo: 'Some sites', valor: 'LOCAL DAMAGE', sub: 'nature would handle the rest' }),
  // 42 Aun así, en Chernóbil la vida vuelve más rápido de lo esperado
  42: plano.general({ set: 'bloques', o: { hora: 'dia', ruina: 1 }, look: 'dia', despues: (ctx, a, K) => { animal(ctx, K, 600, 920, 0.8, 'deer', a.t, 1, 0); animal(ctx, K, 1000, 960, 0.6, 'fox', a.t, -1, 0); for (let i = 0; i < 6; i++) bird(ctx, K, 300 + i * 230 + Math.sin(a.t + i) * 30, 220 + (i % 3) * 50, 0.5, a.t + i); } }),
  // 43 Un año: el mundo ha cambiado, pero nada ha caído todavía. Dale un siglo
  43: plano.general({ set: 'calle', o: { hora: 'atardecer', maleza: 0.8 }, actores: [{ q: Y, x: 1300, esc: 1.1, mood: 'neutral' }], texto: { pastilla: ['Give it a century', 960, 200] } }),
  // 44 Cien años después: el acero contra su peor enemigo, el agua y el aire
  44: plano.general({ set: 'puente', o: { rust: 0.4 }, look: 'frio', despues: (ctx, a) => { cifra(ctx, a, '+100 YEARS', 960, 220, { size: 120 }); } }),
  // 45 Sin pintura, el óxido se come el metal tornillo a tornillo
  45: plano.detalle({ set: 'puente', o: { rust: 0.7 }, look: 'atardecer', dibuja: (ctx, a, K) => { const k = K.ph(a.t, a.d, 0, 1); K.R(ctx, 260, 340, 1400, 400, 10, '#6a6f7a', 6); for (let i = 0; i < 6; i++) { K.C(ctx, 400 + i * 230, 540, 46, '#8a8f9a', 5); K.C(ctx, 400 + i * 230, 540, 18, '#5b5f6b', 0); } ctx.save(); ctx.globalAlpha = 0.85; for (let i = 0; i < 70 * k; i++) K.C(ctx, 300 + (i * 97) % 1320, 380 + (i * 53) % 320, 12 + (i % 5) * 8, i % 3 ? '#b5582a' : '#8a3a1a', 0); ctx.restore(); } }),
  // 46 Un invierno, un puente oxidado cruje, se hunde y se parte
  46: plano.general({ set: (ctx, t, o) => SET.puente(ctx, t, { rust: 0.9, roto: Math.min(1, Math.max(0, ((o.a?.t || 0) / (o.a?.d || 1) - 0.3) / 0.4)) }), look: 'frio', despues: (ctx, a) => { ctx.fillStyle = 'rgba(255,255,255,0.8)'; for (let i = 0; i < 60; i++) { const x = (i * 97 + a.t * 60) % 1920, y = (i * 53 + a.t * 160) % 1080; ctx.beginPath(); ctx.arc(x, y, 3 + (i % 3), 0, 7); ctx.fill(); } } }),
  // 47 Otros puentes caen; los ríos vuelven a sus antiguos cauces
  47: plano.general({ set: 'puente', o: { rust: 1, roto: 1, hora: 'atardecer' }, z: [1.08, 1] }),
  // 48 Las casas de madera: lluvia, termitas y tejados hundidos
  48: plano.general({ set: 'suburbio', o: { ruina: 0.6 }, look: 'frio' }),
  // 49 Urbanizaciones enteras se derrumban; helechos saliendo de sofás viejos
  49: plano.detalle({ set: 'suburbio', o: { ruina: 1 }, look: 'atardecer', dibuja: (ctx, a, K) => { K.R(ctx, 560, 640, 800, 170, 50, '#7a6a8a', 6); K.R(ctx, 520, 740, 880, 150, 40, '#6a5a7a', 6); for (let i = 0; i < 9; i++) { const k = K.ph(a.t, a.d, i * 0.06, 0.5 + i * 0.05); ctx.save(); ctx.translate(640 + i * 80, 700); ctx.rotate(-0.6 + i * 0.15); for (let l = 0; l < 8 * k; l++) K.E(ctx, 0, -l * 26, 26 - l * 2, 10, '#4fae5a', 0.3, 0); ctx.restore(); } } }),
  // 50 Los árboles revientan el asfalto; las raíces levantan las carreteras
  50: plano.general({ set: 'autopista', o: { maleza: 0.9 }, look: 'dia', despues: (ctx, a, K) => { for (const [x, s] of [[500, 1.1], [1400, 1.3], [960, 0.6]]) { const k = K.ease.out(K.ph(a.t, a.d, 0, 0.7)); K.P(ctx, [[x - 200 * s, 1000], [x - 60 * s, 1000 - 90 * s * k], [x + 120 * s, 1000 - 60 * s * k], [x + 220 * s, 1000]], '#3a3d48', 4); tree(ctx, K, x, 1000 - 60 * s * k, 0.9 * s * k, a.t); } } }),
  // 51 Los bosques se tragan las afueras: ciervos en los patios, zorros en los garajes
  51: plano.general({ set: 'suburbio', o: { ruina: 0.9 }, look: 'atardecer', despues: (ctx, a, K) => { animal(ctx, K, 700, 900, 0.8, 'deer', a.t, 1, 0); animal(ctx, K, 1500, 950, 0.55, 'fox', a.t, -1, 0); animal(ctx, K, 1580, 980, 0.3, 'fox', a.t + 1, -1, 0); }, delante: (ctx, a) => fg.arbol(ctx, -100, a.t) }),
  // 52 Los ríos inundan las autopistas; vuelven los castores
  52: plano.general({ set: 'autopista', o: { maleza: 0.6 }, look: 'atardecer', despues: (ctx, a, K) => { ctx.save(); ctx.globalAlpha = 0.75; ctx.fillStyle = '#4f86b0'; ctx.beginPath(); ctx.moveTo(0, 760); ctx.lineTo(1920, 700); ctx.lineTo(1920, 1080); ctx.lineTo(0, 1080); ctx.fill(); ctx.restore(); for (let i = 0; i < 9; i++) K.R(ctx, 700 + i * 50, 760 - (i % 3) * 20, 40, 120, 8, '#6b4a2b', 3); animal(ctx, K, 1300, 820, 0.7, 'beaver', a.t, -1, 0); } }),
  // 53 El hormigón se agrieta: el agua entra, se congela, una y otra vez
  53: plano.detalle({ set: 'calle', o: { hora: 'gris', maleza: 0.6 }, look: 'frio', dibuja: (ctx, a, K) => { K.R(ctx, 360, 260, 1200, 560, 10, '#b8b4a8', 6); const k = K.ph(a.t, a.d, 0, 1); ctx.strokeStyle = '#3a3a40'; ctx.lineWidth = 8; ctx.beginPath(); let x = 960, y = 260; ctx.moveTo(x, y); for (let i = 0; i < 12 * k; i++) { x += (i % 2 ? 50 : -40); y += 46; ctx.lineTo(x, y); } ctx.stroke(); const fr = Math.sin(a.t * 3) > 0; ctx.fillStyle = fr ? 'rgba(220,240,255,0.7)' : 'rgba(80,140,200,0.6)'; ctx.fillRect(940, 300, 40, 400 * k); etiqueta(ctx, a, fr ? 'Freeze' : 'Thaw', 1300, 220, { k: 1 }); } }),
  // 54 Los rascacielos resisten, pero se les rompen los cristales y crecen plantas en las cornisas
  54: plano.general({ set: 'plaza', o: { hora: 'atardecer', luces: 0, ruina: 0.9 }, z: [1.1, 1], f: [960, 300] }),
  // 55 Halcones peregrinos anidan en las torres; los mapaches mandan en los vestíbulos
  55: plano.general({ set: 'oficina', o: { hora: 'atardecer', maleza: 0.8 }, despues: (ctx, a, K) => { animal(ctx, K, 700, 960, 0.8, 'raccoon', a.t, 1, 0); animal(ctx, K, 1300, 980, 0.6, 'raccoon', a.t + 1, -1, 0); bird(ctx, K, 1500, 240, 0.9, a.t, '#6b4a2b'); }, texto: { etiqueta: 'The lobby' } }),
  // 56 En el océano, las ballenas vuelven a oírse: no hay ruido de barcos
  56: plano.general({ set: 'oceano', look: 'frio', despues: (ctx, a, K) => { ballena(ctx, K, 500 + a.t * 20, 520, 0.9, a.t); ballena(ctx, K, 1500 - a.t * 15, 700, -0.6, a.t + 2); ondas(ctx, a, 760, 500); } }),
  // 57 De noche, millones de estrellas: sin contaminación lumínica
  57: plano.general({ set: 'cielo', look: 'noche', actores: [{ q: Y, x: 1300, esc: 0.9, mood: 'happy' }], z: [1, 1.05], f: [960, 300] }),
  // 58 Sospechoso 3 tachado: puentes, casas, urbanizaciones. Las grandes estructuras aguantan
  58: plano.general({ set: 'suburbio', o: { ruina: 1 }, look: 'atardecer', despues: (ctx, a, K) => { ctx.fillStyle = 'rgba(10,6,24,0.45)'; ctx.fillRect(0, 0, 1920, 1080); ficha(ctx, K, a, 3, 'BRIDGES & HOMES', 960, 460, 1, K.ph(a.t, a.d, 0.15, 0.45)); } }),
  // 59 El plástico sigue ahí, en trocitos, durante siglos
  59: plano.detalle({ set: 'bosque', look: 'dia', dibuja: (ctx, a, K) => { for (let i = 0; i < 60; i++) { const x = 300 + (i * 97) % 1320, y = 420 + (i * 53) % 440 + Math.sin(a.t + i) * 6; ctx.save(); ctx.translate(x, y); ctx.rotate(i + a.t * 0.2); ctx.fillStyle = ['#4cc9f0', '#ff8ab8', '#ffd166', '#ffffff', '#2ec27e'][i % 5]; ctx.fillRect(-8 - (i % 3) * 4, -5, 16 + (i % 3) * 8, 10); ctx.restore(); } etiqueta(ctx, a, 'Microplastics', 960, 300, { align: 'center' }); } }),
  // 60 ¿Hay algo construido para durar más que todo esto?
  60: plano.primer({ set: 'bosque', q: Y, mood: 'worried', lado: 'izq', texto: { pastilla: ['Built to last longer?', 1300, 300] } }),
  // 61 Diez mil años: más que toda la historia escrita (la escritura tiene unos cinco mil)
  61: plano.dato({ set: 'monticulos', look: 'atardecer', titulo: 'Ten thousand years later', valor: '10,000', dibuja: (ctx, a, K) => { const k = K.ph(a.t, a.d, 0.3, 0.8); ctx.fillStyle = 'rgba(255,230,194,0.25)'; ctx.fillRect(460, 680, 1000, 24); ctx.fillStyle = '#ffd166'; ctx.fillRect(460, 680, 500 * k, 24); etiqueta(ctx, a, 'Writing: ~5,000 years', 710, 740, { align: 'center', size: 24, k }); } }),
  // 62 Las ciudades son montículos verdes
  62: plano.general({ set: 'monticulos', look: 'atardecer', z: [1, 1.08] }),
  // 63 Los ríos han cambiado de curso y entierran los cimientos
  63: plano.general({ set: 'monticulos', o: { hora: 'gris' }, look: 'frio', z: [1.08, 1], f: [1200, 860] }),
  // 64 Hasta la Gran Pirámide (unos 4.500 años) se vería muy distinta
  64: plano.general({ set: (ctx, t) => { const r = SET.bosque(ctx, t, { hora: 'atardecer' }); return r; }, despues: (ctx, a, K) => { K.P(ctx, [[560, 940], [960, 380], [1360, 940]], '#c9a66a', 4); K.P(ctx, [[960, 380], [1360, 940], [1100, 940]], '#a8864a', 0); for (let i = 0; i < 10; i++) K.C(ctx, 700 + i * 60, 900 - (i % 3) * 60, 30, '#4f8f4a', 0); pastilla(ctx, a, '~4,500 years old', 960, 300); } }),
  // 65 Vidrio, plástico y residuos nucleares enterrados: rastros, no monumentos
  65: plano.detalle({ set: 'monticulos', look: 'atardecer', dibuja: (ctx, a, K) => { K.R(ctx, 0, 560, 1920, 520, 0, '#6b4a2b', 0); for (let l = 0; l < 4; l++) K.R(ctx, 0, 620 + l * 110, 1920, 10, 0, '#5a3a22', 0); [[500, 760, '#bfe9ff', 'Glass'], [960, 860, '#ff8ab8', 'Plastic'], [1420, 940, '#ffd166', 'Nuclear waste']].forEach(([x, y, c, w], i) => { K.C(ctx, x, y, 34, c, 3); pastilla(ctx, a, w, x, y - 80, { size: 30, k: K.ph(a.t, a.d, 0.1 + i * 0.2, 0.2 + i * 0.2) }); }); } }),
  // 66 Las sondas Voyager siguen a la deriva con su disco dorado, pero lejos de aquí
  66: plano.general({ set: 'espacio', look: 'espacio', despues: (ctx, a, K) => { ctx.save(); ctx.translate(900 + a.t * 15, 520); ctx.rotate(-0.2); K.C(ctx, 0, 0, 90, '#d9d9de', 4); K.C(ctx, 0, 0, 70, '#9aa4b5', 0); K.R(ctx, -14, 60, 28, 160, 4, '#8a8f9a', 3); ctx.strokeStyle = '#c9ced6'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 220); ctx.lineTo(-260, 340); ctx.moveTo(0, 160); ctx.lineTo(240, 260); ctx.stroke(); K.C(ctx, 40, 150, 30, '#ffd166', 3); ctx.restore(); pastilla(ctx, a, 'Golden record', 1340, 360, { k: K.ph(a.t, a.d, 0.3, 0.45) }); } }),
  // 67 Donde estaba Central Park crece un bosque más viejo que ninguno
  67: plano.general({ set: 'bosque', o: { hora: 'atardecer' }, z: [1, 1.08], texto: { etiqueta: 'Central Park, 10,000 years later' } }),
  // 68 Un explorador de otro mundo cruza el bosque sin encontrar casi nada
  68: plano.general({ set: 'bosque', o: { hora: 'atardecer' }, actores: [{ q: (a) => ({ ...a.who, skin: { light: '#9fd8c0', dark: '#6aa890', ear: '#8ac0a8', neck: '#7ab098' }, hair: 'bald', outfit: '#5b6bd0', glasses: true }), anda: [200, 1300], esc: 0.9, mood: 'shocked' }], delante: (ctx, a) => fg.arbol(ctx, 1900, a.t) }),
  // 69 En las Black Hills de Dakota del Sur, algo refleja la luz
  69: plano.general({ set: 'montes', o: { caras: true }, look: 'atardecer', z: [1, 1.1], f: [920, 420], despues: (ctx, a, K) => { const k = K.ph(a.t, a.d, 0.3, 0.7); if (k > 0) { K.starBurst(ctx, 920, 420, 140 * k, '#fff3c4', 1 - k * 0.5); glow(ctx, 920, 420, 300, '#fff3c4', 0.5 * k); } }, texto: { etiqueta: 'Black Hills, South Dakota' } }),
  // 70 Cuatro caras enormes, de dieciocho metros, mirando al horizonte
  70: plano.general({ set: 'montes', o: { caras: true }, look: 'atardecer', z: [1.3, 1.45], f: [930, 430], texto: { pastilla: ['60 ft tall', 1500, 220] } }),
  // 71 Monte Rushmore: tallado entre 1927 y 1941 en granito
  71: plano.general({ set: 'montes', o: { caras: true }, look: 'dia', actores: [{ q: Y, x: 1500, esc: 0.7, mood: 'shocked' }], texto: { etiqueta: 'Carved 1927 - 1941 · solid granite' } }),
  // 72 El granito se erosiona solo una pulgada cada diez mil años
  72: plano.dato({ set: 'montes', o: { caras: true }, look: 'atardecer', titulo: 'Erosion', valor: '1 INCH', sub: 'every 10,000 years · National Park Service' }),
  // 73 Una pulgada: el ancho de una yema de dedo
  73: plano.detalle({ set: 'montes', o: { caras: true }, look: 'atardecer', dibuja: (ctx, a, K) => { K.R(ctx, 860, 330, 200, 900, 100, '#e8b48a', 5); K.E(ctx, 960, 400, 70, 56, '#f6d8c4', 0, 3); K.R(ctx, 860, 560, 200, 8, 4, 'rgba(120,70,40,0.35)', 0); ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(800, 280); ctx.lineTo(1120, 280); ctx.stroke(); pastilla(ctx, a, '1 inch', 960, 220); } }),
  // 74 Así que las cuatro caras siguen ahí, esperando a que alguien pregunte quiénes eran
  74: plano.general({ set: 'montes', o: { caras: true, desgaste: 0.5 }, look: 'atardecer', z: [1.2, 1.1], f: [930, 430], texto: { etiqueta: 'Who were they?' } }),
  // 75 Rascacielos, metro, puentes y centrales: todo desaparecido. Cuatro caras de piedra
  75: plano.dato({ set: 'montes', o: { caras: true }, look: 'atardecer', titulo: 'All gone', dibuja: (ctx, a, K) => ['Skyscrapers', 'Subways', 'Bridges', 'Power plants'].forEach((w, i) => { const x = 390 + i * 380; pastilla(ctx, a, w, x, 520, { size: 38 }); tacha(ctx, x, 523, 300, K.ph(a.t, a.d, 0.2 + i * 0.12, 0.3 + i * 0.12)); }) }),
  // 76 La ironía: la naturaleza lo borró todo menos lo que tallamos en ella
  76: plano.general({ set: 'montes', o: { caras: true, hora: 'atardecer' }, z: [1, 1.1], despues: (ctx, a) => motas(ctx, a, 30) }),
  // 77 La última prueba de que existimos: una montaña con nuestra cara
  77: plano.primer({ set: 'montes', o: { caras: true }, q: Y, mood: 'happy', lado: 'izq', blur: 8, texto: { pastilla: ['A mountain that looks like us', 1300, 260] } }),
  // 78 Tu turno: ¿qué dejarías para que durase diez mil años?
  78: plano.primer({ set: 'monticulos', q: Y, mood: 'happy', lado: 'izq', texto: { pastilla: ['What would you leave behind?', 1300, 300] } }),
  // 79 Cuéntanoslo en los comentarios
  79: plano.general({ set: 'cielo', look: 'noche', actores: [{ q: Y, x: 960, esc: 1, mood: 'happy', arms: 'up' }], texto: { etiqueta: 'Tell us in the comments' } }),
};
