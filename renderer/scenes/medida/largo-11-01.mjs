// Escenas a medida de largo-11-01: «What If You Landed on Every Planet Without a Spacesuit?»
// Horizontal: se ve x ≈ -850…1930 e y ≈ 230…1800 (los subtítulos tapan abajo: lo importante en y 350-1350).

const COL = { sun: ['#ffd23f', '#ff8a00'], jupiter: ['#e9c89a', '#b5835a'], venus: ['#f2d58a', '#d9a94e'], mercury: ['#b7b2aa', '#7f7a73'],
  moon: ['#d9d9de', '#9fa0a8'], mars: ['#e0734a', '#a8462c'], titan: ['#f2b45a', '#c9822f'], earth: ['#3a8fd6', '#2f6fb0'], saturn: ['#f0d9a0', '#c9a860'] };
function space(ctx, a, K, tint = '#070a1f') {
  const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, tint); g.addColorStop(1, '#141a3c'); ctx.fillStyle = g; ctx.fillRect(K.X0, 0, K.XW, 1920);
  for (let i = 0; i < 160; i++) { const tw = 0.6 + 0.4 * Math.sin(a.t * 2 + i); K.C(ctx, K.X0 + (i * 397) % K.XW, (i * 233) % 1920, (1 + (i % 3)) * tw, '#ffffff', 0); }
}
function planet(ctx, K, x, y, r, kind, t, rot = 0) {
  const [c1, c2] = COL[kind];
  if (kind === 'sun') { K.radial(ctx, x, y, r * 1.8, '#ffb347', 0.6); }
  ctx.save(); ctx.translate(x, y);
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r); g.addColorStop(0, c1); g.addColorStop(1, c2);
  ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fillStyle = g; ctx.fill(); ctx.save(); ctx.clip();
  if (kind === 'jupiter' || kind === 'saturn') { for (let i = -5; i <= 5; i++) { ctx.fillStyle = i % 2 ? 'rgba(160,100,60,0.35)' : 'rgba(255,240,210,0.25)'; ctx.fillRect(-r, i * r * 0.18 + Math.sin(t + i) * 3, r * 2, r * 0.1); } if (kind === 'jupiter') K.E(ctx, r * 0.35, r * 0.3, r * 0.22, r * 0.12, '#c8553d', 0, 4); }
  if (kind === 'mercury' || kind === 'moon') for (let i = 0; i < 9; i++) K.C(ctx, Math.cos(i * 2.3) * r * 0.6, Math.sin(i * 1.7) * r * 0.6, r * (0.08 + (i % 3) * 0.04), 'rgba(0,0,0,0.15)', 0);
  if (kind === 'mars') { K.C(ctx, 0, -r * 0.85, r * 0.3, '#ffffff', 0); for (let i = 0; i < 6; i++) K.E(ctx, Math.cos(i * 2) * r * 0.5, Math.sin(i * 1.3) * r * 0.5, r * 0.2, r * 0.08, 'rgba(120,40,20,0.35)', i, 0); }
  if (kind === 'venus') for (let i = 0; i < 6; i++) K.E(ctx, Math.sin(t * 0.5 + i) * r * 0.3, -r * 0.6 + i * r * 0.25, r * 0.9, r * 0.08, 'rgba(255,255,255,0.25)', 0.1, 0);
  if (kind === 'earth') { K.E(ctx, -r * 0.3, -r * 0.2, r * 0.45, r * 0.3, '#5fb35a', 0.3, 0); K.E(ctx, r * 0.4, r * 0.3, r * 0.3, r * 0.4, '#5fb35a', -0.2, 0); }
  if (kind === 'sun') for (let i = 0; i < 14; i++) K.C(ctx, Math.cos(i * 2.1 + t * 0.3) * r * 0.6, Math.sin(i * 1.3) * r * 0.6, r * 0.1, 'rgba(255,240,150,0.5)', 0);
  ctx.restore(); ctx.lineWidth = Math.max(6, r * 0.03); ctx.strokeStyle = K.INK; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.stroke();
  if (kind === 'saturn') { ctx.rotate(-0.3); ctx.lineWidth = r * 0.12; ctx.strokeStyle = '#e8d4a0'; ctx.beginPath(); ctx.ellipse(0, 0, r * 1.8, r * 0.45, 0, Math.PI * 0.05, Math.PI * 0.95, true); ctx.stroke(); }
  ctx.restore();
}
function body(ctx, a, K, x, y, s, mood = 'shocked', opts = {}) { K.drawFullBody(ctx, x, y, s, a.who, { mood, t: a.t, ...opts }); }
function rank(ctx, K, n, name, k, x = 540, y = 470, col = '#ffd166') { if (k <= 0) return; K.text(ctx, `#${n}`, x - 260, y, { size: 200, color: col, k }); K.text(ctx, name, x + 140, y, { size: 150, color: '#ffffff', k }); }
function thermo(ctx, K, x, y, lvl, label, col = '#ff3b30') {
  K.R(ctx, x - 40, y - 600, 80, 620, 40, '#ffffff', 8); K.C(ctx, x, y + 40, 75, col, 8);
  ctx.fillStyle = col; ctx.fillRect(x - 22, y - 560 * lvl, 44, 560 * lvl + 20);
  if (label) K.text(ctx, label, x, y - 680, { size: 90, color: '#ffd166' });
}
function gauge(ctx, K, x, y, r, k, label) {
  K.C(ctx, x, y, r, '#ffffff', 10); for (let i = 0; i <= 10; i++) { const an = Math.PI * 0.8 + i / 10 * Math.PI * 1.4; ctx.save(); ctx.translate(x, y); ctx.rotate(an); ctx.fillStyle = i > 7 ? '#ff3b30' : K.INK; ctx.fillRect(r * 0.72, -5, r * 0.18, 10); ctx.restore(); }
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI * 0.8 + k * Math.PI * 1.4); K.R(ctx, -8, -10, r * 0.8, 20, 10, '#ff3b30', 4); ctx.restore(); K.C(ctx, x, y, r * 0.1, K.INK, 0);
  if (label) K.text(ctx, label, x, y + r + 80, { size: 70, color: '#ffffff' });
}
function ground(ctx, K, y, col, dots = 'rgba(0,0,0,0.12)') { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(K.X0, y); for (let x = K.X0; x <= K.X0 + K.XW; x += 80) ctx.lineTo(x, y + Math.sin(x / 210) * 24); ctx.lineTo(K.X0 + K.XW, 1920); ctx.lineTo(K.X0, 1920); ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = K.INK; ctx.stroke();
  for (let i = 0; i < 40; i++) K.E(ctx, K.X0 + (i * 211) % K.XW, y + 80 + (i * 67) % 300, 40, 12, dots, 0, 0); }
function sky(ctx, K, c1, c2) { const g = ctx.createLinearGradient(0, 0, 0, 1400); g.addColorStop(0, c1); g.addColorStop(1, c2); ctx.fillStyle = g; ctx.fillRect(K.X0, 0, K.XW, 1920); }
function haze(ctx, K, col, a) { ctx.fillStyle = col; ctx.globalAlpha = a; ctx.fillRect(K.X0, 0, K.XW, 1920); ctx.globalAlpha = 1; }
function portal(ctx, K, x, y, r, t) { for (let i = 0; i < 6; i++) { ctx.save(); ctx.translate(x, y); ctx.rotate(t * (1 + i * 0.3)); ctx.strokeStyle = ['#7b5cff', '#ff4fa3', '#4cc9f0'][i % 3]; ctx.lineWidth = 16; ctx.beginPath(); ctx.ellipse(0, 0, r - i * 22, (r - i * 22) * 0.4, 0, 0, Math.PI * 1.6); ctx.stroke(); ctx.restore(); } }
function sweat(ctx, K, x, y, t) { for (let i = 0; i < 3; i++) { const q = (t * 1.3 + i * 0.33) % 1; K.E(ctx, x + i * 50 - 50, y + q * 160, 12, 18, '#8fd3ff', 0, 4); } }
function bubbles(ctx, K, x, y, t, n = 8, col = '#bfe9ff') { for (let i = 0; i < n; i++) { const q = (t * 0.9 + i / n) % 1; K.C(ctx, x + Math.sin(i * 2 + t) * 50, y - q * 260, 8 + (i % 3) * 5, col, 3); } }
function storm(ctx, K, x, y, r, t) { for (let i = 0; i < 5; i++) { ctx.save(); ctx.translate(x, y); ctx.rotate(t * 1.5 + i); ctx.strokeStyle = `rgba(200,85,61,${0.9 - i * 0.15})`; ctx.lineWidth = 18; ctx.beginPath(); ctx.ellipse(0, 0, r - i * 30, (r - i * 30) * 0.5, 0, 0, 5); ctx.stroke(); ctx.restore(); } }
function chamber(ctx, a, K, airK = 1) { // cámara de vacío de la NASA (1965)
  ctx.fillStyle = '#3a4050'; ctx.fillRect(K.X0, 0, K.XW, 1920); ctx.fillStyle = '#4a5162'; ctx.fillRect(K.X0, 1300, K.XW, 620);
  K.R(ctx, 140, 300, 800, 1050, 400, `rgba(200,220,240,${0.15 + 0.25 * airK})`, 14);
  for (let i = 0; i < 12; i++) { const an = i / 12 * Math.PI * 2; K.C(ctx, 540 + Math.cos(an) * 420, 825 + Math.sin(an) * 540, 16, '#8a909c', 5); }
}
function astro(ctx, K, x, y, s, t, opts = {}) { // traje espacial años 60 (sin cara reconocible)
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(opts.rot || 0);
  K.R(ctx, -150, -60, 300, 420, 120, opts.slack ? '#dfe3e8' : '#f2f4f7', 10); K.R(ctx, -140, 340, 110, 300, 50, '#e6e9ee', 9); K.R(ctx, 30, 340, 110, 300, 50, '#e6e9ee', 9);
  K.R(ctx, -230, -20, 90, 320, 45, '#e6e9ee', 9); K.R(ctx, 140, -20, 90, 320, 45, '#e6e9ee', 9);
  K.C(ctx, 0, -190, 140, '#e9edf2', 10); K.C(ctx, 0, -190, 100, '#2b3a55', 6); K.E(ctx, -30, -220, 30, 18, 'rgba(255,255,255,0.5)', -0.5, 0);
  K.R(ctx, -60, 60, 120, 80, 14, '#c94b3a', 6); ctx.restore();
}
const fmt = (n) => Math.round(n).toLocaleString('en-US');

export default {
  // 0 How long would you survive on every planet? -> los planetas en fila y la persona flotando con un cronómetro
  0: (ctx, a, K) => {
    space(ctx, a, K);
    ['sun', 'mercury', 'venus', 'moon', 'mars', 'jupiter', 'titan'].forEach((p, i) => { const q = K.ph(a.t, a.d, i * 0.06, 0.2 + i * 0.06); if (q > 0) planet(ctx, K, -650 + i * 380, 760 + Math.sin(a.t + i) * 20, (p === 'sun' ? 170 : p === 'jupiter' ? 150 : 90) * K.ease.outBack(q), p, a.t); });
    body(ctx, a, K, 540, 980, 0.12, 'shocked', { arms: 'up' });
    K.text(ctx, '?', 700, 1000, { size: 160, color: '#ffd166', k: K.ph(a.t, a.d, 0.6, 0.75) });
  },
  // 1 Teleport you to every world, no spacesuit, ranked -> portal giratorio que te absorbe; lista 7…1
  1: (ctx, a, K) => {
    space(ctx, a, K, '#1a0f3a');
    portal(ctx, K, 400, 820, 380, a.t);
    const k = K.ph(a.t, a.d, 0.2, 0.7); ctx.save(); ctx.translate(400, 820); ctx.rotate(k * 6); ctx.scale(1 - k * 0.8, 1 - k * 0.8); body(ctx, a, K, 0, -250, 0.12, 'shocked', { arms: 'up' }); ctx.restore();
    for (let i = 7; i >= 1; i--) { const q = K.ph(a.t, a.d, 0.1 + (7 - i) * 0.08, 0.2 + (7 - i) * 0.08); K.text(ctx, `#${i}`, 1100 + ((7 - i) % 4) * 190, 520 + Math.floor((7 - i) / 4) * 300, { size: 110, color: i === 1 ? '#2ec27e' : '#ff8a65', k: q }); }
    K.text(ctx, 'NO SUIT', 1380, 1150, { size: 100, color: '#ffffff', k: K.ph(a.t, a.d, 0.7, 0.85), rot: -0.08 });
  },
  // 2 One you'd last less than a second; number one is not where you think -> cronómetro 0.1 s y un "#1" tapado con interrogante
  2: (ctx, a, K) => {
    space(ctx, a, K);
    K.C(ctx, 200, 800, 260, '#ffffff', 12); const sw = (a.t * 6) % (Math.PI * 2); ctx.save(); ctx.translate(200, 800); ctx.rotate(sw); K.R(ctx, -8, -230, 16, 230, 8, '#ff3b30', 0); ctx.restore(); K.text(ctx, '< 1 SEC', 200, 1170, { size: 100, color: '#ff3b30', k: K.ph(a.t, a.d, 0.15, 0.3) });
    const q = K.ph(a.t, a.d, 0.45, 0.6); ctx.save(); ctx.translate(1000, 800); ctx.scale(K.ease.outBack(q), K.ease.outBack(q)); K.R(ctx, -260, -260, 520, 520, 60, '#2ec27e', 12); K.text(ctx, '#1', 0, -60, { size: 200, color: '#ffffff' }); K.R(ctx, -200, 60, 400, 140, 30, '#14152a', 0); K.text(ctx, '???', 0, 130, { size: 110, color: '#ffd166' }); ctx.restore();
  },
  // 3 A place where you'd only need a mask and a warm coat -> abrigo y mascarilla flotando con brillo, y un mundo naranja misterioso
  3: (ctx, a, K) => {
    space(ctx, a, K);
    planet(ctx, K, 1500, 800, 300, 'titan', a.t); ctx.save(); ctx.globalAlpha = 0.7; K.text(ctx, '?', 1500, 800, { size: 260, color: '#ffffff' }); ctx.restore();
    const f = Math.sin(a.t * 2) * 20;
    ctx.save(); ctx.translate(150, 760 + f); K.R(ctx, -170, -200, 340, 460, 60, '#7a4a2a', 10); K.R(ctx, -30, -200, 60, 460, 10, '#5a3218', 0); K.R(ctx, -200, -160, 80, 330, 40, '#7a4a2a', 8); K.R(ctx, 120, -160, 80, 330, 40, '#7a4a2a', 8); K.E(ctx, 0, -210, 150, 50, '#f2e6d0', 0, 8); ctx.restore();
    ctx.save(); ctx.translate(620, 760 - f); K.E(ctx, 0, 0, 150, 110, '#e8edf2', 0, 10); K.C(ctx, -50, 0, 40, '#9aa6b2', 6); K.C(ctx, 50, 0, 40, '#9aa6b2', 6); ctx.strokeStyle = K.INK; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-150, -20); ctx.lineTo(-280, -80); ctx.moveTo(150, -20); ctx.lineTo(280, -80); ctx.stroke(); ctx.restore();
    K.sparkles(ctx, 380, 760, a.t, 10);
  },
  // 4 Number seven: the Sun, ~10,000 °F -> apareces sobre la superficie del Sol; ranking #7
  4: (ctx, a, K) => {
    sky(ctx, K, '#ff8a00', '#ffd23f');
    for (let i = 0; i < 30; i++) K.C(ctx, K.X0 + (i * 173) % K.XW, 1150 + (i * 59) % 500, 60 + (i % 4) * 25, i % 2 ? '#ffb347' : '#ffd23f', 0);
    for (let i = 0; i < 4; i++) { ctx.save(); ctx.strokeStyle = '#ff6a00'; ctx.lineWidth = 30; ctx.beginPath(); const x = -400 + i * 700; ctx.arc(x, 1250, 200 + Math.sin(a.t + i) * 30, Math.PI, 0); ctx.stroke(); ctx.restore(); }
    rank(ctx, K, 7, 'THE SUN', K.ph(a.t, a.d, 0, 0.15));
    body(ctx, a, K, 540, 700, 0.14, 'shocked');
    K.text(ctx, '10,000°F', 1500, 800, { size: 130, color: '#ffffff', k: K.ph(a.t, a.d, 0.4, 0.55) });
  },
  // 5 Five times hotter than lava -> comparativa: volcán con lava a un lado, el Sol ×5 al otro
  5: (ctx, a, K) => {
    sky(ctx, K, '#3a1a12', '#7a2a10');
    K.prop(ctx, 'volcan', 100, 1200, 1.6, a.t); K.text(ctx, 'LAVA', 100, 520, { size: 100, color: '#ff8a65' });
    for (let i = 0; i < 5; i++) { const q = K.ph(a.t, a.d, 0.15 + i * 0.1, 0.25 + i * 0.1); if (q > 0) planet(ctx, K, 760 + i * 230, 850, 95 * K.ease.outBack(q), 'sun', a.t); }
    K.text(ctx, 'x5', 1220, 1150, { size: 150, color: '#ffd166', k: K.ph(a.t, a.d, 0.7, 0.85) });
  },
  // 6 Vaporized in a fraction of a second -> la silueta se convierte en una nube de gas caliente
  6: (ctx, a, K) => {
    sky(ctx, K, '#ff8a00', '#ffe08a');
    const k = K.ph(a.t, a.d, 0.2, 0.5);
    if (k < 1) { ctx.save(); ctx.globalAlpha = 1 - k; body(ctx, a, K, 540, 650, 0.15, 'shocked'); ctx.restore(); }
    if (k > 0) { for (let i = 0; i < 14; i++) { const q = K.ph(a.t, a.d, 0.2, 1); K.C(ctx, 540 + Math.cos(i * 0.9) * 300 * q, 900 - Math.sin(i * 1.3) * 250 * q - q * 200, 50 + (i % 3) * 20, `rgba(255,${200 + (i % 3) * 15},150,${0.8 - q * 0.5})`, 0); } }
    K.flash(ctx, a.t, a.d * 0.2, 0.15);
    K.text(ctx, 'POOF', 1300, 700, { size: 150, color: '#ffffff', k: K.ph(a.t, a.d, 0.3, 0.45) });
  },
  // 7 Sun's gravity 28 times Earth's -> báscula aplastada que marca ×28
  7: (ctx, a, K) => {
    sky(ctx, K, '#ff9a2a', '#ffd23f');
    const k = K.ease.out(K.ph(a.t, a.d, 0.1, 0.6));
    ctx.save(); ctx.translate(540, 1150); ctx.scale(1 + k * 0.3, 1 - k * 0.45); K.R(ctx, -300, -120, 600, 160, 30, '#e8edf2', 10); K.R(ctx, -200, -90, 400, 80, 14, '#14152a', 6); ctx.restore();
    K.text(ctx, `x${Math.round(1 + k * 27)}`, 540, 1080 - k * 30, { size: 100, color: '#ff3b30' });
    for (let i = 0; i < 6; i++) { ctx.save(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(-100 + i * 260, 300 + ((a.t * 900 + i * 90) % 500)); ctx.lineTo(-100 + i * 260, 420 + ((a.t * 900 + i * 90) % 500)); ctx.stroke(); ctx.restore(); }
    K.text(ctx, 'GRAVITY', 1500, 700, { size: 120, color: '#ffffff', k: K.ph(a.t, a.d, 0.2, 0.35) });
  },
  // 8 Good news / bad news: six more worlds -> tablero de 7 casillas: la del Sol tachada, quedan 6
  8: (ctx, a, K) => {
    space(ctx, a, K);
    ['sun', 'jupiter', 'venus', 'mercury', 'moon', 'mars', 'titan'].forEach((p, i) => { const x = -500 + i * 340; K.R(ctx, x - 140, 650, 280, 360, 30, '#1f2547', 8); planet(ctx, K, x, 800, 90, p, a.t); if (i === 0) { const q = K.ph(a.t, a.d, 0.1, 0.3); ctx.strokeStyle = '#ff3b30'; ctx.lineWidth = 22; ctx.beginPath(); ctx.moveTo(x - 120, 680); ctx.lineTo(x - 120 + 240 * q, 680 + 300 * q); ctx.stroke(); } });
    K.text(ctx, '6 TO GO', 540, 1200, { size: 130, color: '#ffd166', k: K.ph(a.t, a.d, 0.45, 0.6) });
  },
  // 9 Number six: Jupiter; 1,000 Earths fit inside -> Júpiter enorme llenándose de tierras pequeñitas
  9: (ctx, a, K) => {
    space(ctx, a, K);
    planet(ctx, K, 700, 850, 520, 'jupiter', a.t);
    const n = Math.floor(K.ph(a.t, a.d, 0.2, 0.9) * 60);
    ctx.save(); ctx.beginPath(); ctx.arc(700, 850, 500, 0, 7); ctx.clip(); for (let i = 0; i < n; i++) planet(ctx, K, 260 + (i % 10) * 90, 420 + Math.floor(i / 10) * 90, 36, 'earth', a.t); ctx.restore();
    rank(ctx, K, 6, 'JUPITER', K.ph(a.t, a.d, 0, 0.15), 540, 380);
    K.text(ctx, '1,000+', 1600, 900, { size: 140, color: '#ffffff', k: K.ph(a.t, a.d, 0.6, 0.75) });
  },
  // 10 No ground: you just fall -> caída sin suelo, con flechas que señalan "no ground"
  10: (ctx, a, K) => {
    sky(ctx, K, '#e9c89a', '#8a5a3a');
    const off = (a.t * 500) % 400; for (let i = -1; i < 6; i++) K.E(ctx, (i * 470) % 2200 - 600, i * 400 - off + 400, 380, 90, 'rgba(255,240,210,0.45)', 0, 0);
    ctx.save(); ctx.translate(540, 800); ctx.rotate(a.t * 2); body(ctx, a, K, 0, -280, 0.13, 'shocked', { arms: 'up' }); ctx.restore();
    K.speedLines(ctx, 540, 800, a.t, 0.5);
    K.text(ctx, 'NO GROUND', 1400, 600, { size: 120, color: '#ffffff', k: K.ph(a.t, a.d, 0.3, 0.45) });
  },
  // 11 Freezing clouds, winds over 400 mph -> la persona da vueltas arrastrada por el viento helado; velocímetro 400
  11: (ctx, a, K) => {
    sky(ctx, K, '#bcd6e8', '#6b86a0');
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 10; ctx.lineCap = 'round'; for (let i = 0; i < 14; i++) { const x = K.X0 + ((i * 260 + a.t * 1400) % K.XW), y = 350 + i * 70; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 260, y); ctx.stroke(); }
    ctx.save(); ctx.translate(200 + Math.sin(a.t * 3) * 120, 820); ctx.rotate(a.t * 4); body(ctx, a, K, 0, -280, 0.12, 'shocked', { arms: 'up' }); ctx.restore();
    gauge(ctx, K, 1300, 820, 230, K.ease.out(K.ph(a.t, a.d, 0.1, 0.7)), '400 MPH');
    K.prop(ctx, 'hielo', 800, 500, 0.6, a.t);
  },
  // 12 Great Red Spot as wide as Earth, raging for centuries -> la gran mancha roja girando con la Tierra al lado
  12: (ctx, a, K) => {
    space(ctx, a, K);
    ctx.save(); ctx.beginPath(); ctx.arc(540, 2100, 1800, 0, 7); ctx.clip(); ctx.fillStyle = '#d9b48a'; ctx.fillRect(K.X0, 0, K.XW, 1920); for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? 'rgba(160,100,60,0.35)' : 'rgba(255,240,210,0.3)'; ctx.fillRect(K.X0, 400 + i * 110, K.XW, 60); } ctx.restore();
    storm(ctx, K, 540, 850, 380, a.t);
    const q = K.ph(a.t, a.d, 0.3, 0.5); if (q > 0) { planet(ctx, K, 1350, 600, 180 * K.ease.outBack(q), 'earth', a.t); K.text(ctx, '=', 1050, 700, { size: 140, color: '#ffffff', k: q }); }
    K.text(ctx, '300+ YEARS', 540, 1300, { size: 110, color: '#ffd166', k: K.ph(a.t, a.d, 0.6, 0.75) });
  },
  // 13 Gravity 2.5x: 180 lb would weigh 450 -> báscula que salta de 180 a 450 y la persona aplastada
  13: (ctx, a, K) => {
    sky(ctx, K, '#e9c89a', '#b5835a');
    const k = K.ease.out(K.ph(a.t, a.d, 0.2, 0.7));
    ctx.save(); ctx.translate(540, 1240); ctx.scale(1 + k * 0.08, 1 - k * 0.2); body(ctx, a, K, 0, -560, 0.2, k > 0.5 ? 'worried' : 'neutral'); ctx.restore();
    K.R(ctx, 340, 1180, 400, 110, 24, '#e8edf2', 10); K.R(ctx, 420, 1200, 240, 70, 10, '#14152a', 0);
    ctx.fillStyle = k > 0.5 ? '#ff3b30' : '#2ec27e'; ctx.font = '60px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(`${Math.round(180 + k * 270)} LB`, 540, 1236);
    K.text(ctx, 'x2.5', 1300, 700, { size: 160, color: '#ffd166', k: K.ph(a.t, a.d, 0.5, 0.65) });
  },
  // 14 Into the dark, pressure climbs, air heats -> desciendes a la oscuridad; termómetro y manómetro suben
  14: (ctx, a, K) => {
    const d = K.ph(a.t, a.d, 0, 1);
    sky(ctx, K, `rgb(${Math.round(90 - d * 70)},${Math.round(60 - d * 45)},${Math.round(40 - d * 30)})`, '#0a0604');
    ctx.save(); ctx.translate(540, 700 + Math.sin(a.t * 2) * 30); ctx.rotate(Math.sin(a.t) * 0.5); body(ctx, a, K, 0, -280, 0.12, 'worried', { arms: 'up' }); ctx.restore();
    thermo(ctx, K, -300, 1250, 0.3 + d * 0.6, 'HEAT'); gauge(ctx, K, 1450, 800, 220, 0.2 + d * 0.7, 'PRESSURE');
  },
  // 15 Thousands, then millions of times the pressure; no bottom -> contador de presión que se dispara y un fondo que nunca llega
  15: (ctx, a, K) => {
    sky(ctx, K, '#140a06', '#000000');
    const k = K.ph(a.t, a.d, 0.05, 0.8), v = Math.pow(10, 3 + k * 3);
    K.R(ctx, -200, 560, 1480, 260, 40, '#1f2547', 10); K.text(ctx, `${fmt(v)}x`, 540, 690, { size: 150, color: '#ff8a65' });
    ctx.save(); ctx.setLineDash([30, 30]); ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(540, 900); ctx.lineTo(540, 1350); ctx.stroke(); ctx.restore();
    K.text(ctx, 'NO BOTTOM', 1500, 1100, { size: 110, color: '#ffffff', k: K.ph(a.t, a.d, 0.6, 0.75) });
  },
  // 16 Gone within minutes, falling through a sky with no floor -> Júpiter de lejos, una chispa que se apaga; "minutes"
  16: (ctx, a, K) => {
    space(ctx, a, K);
    planet(ctx, K, 540, 850, 420, 'jupiter', a.t);
    const f = 1 - K.ph(a.t, a.d, 0.2, 0.7); if (f > 0) { K.radial(ctx, 640, 700, 60, '#ffffff', f); }
    rank(ctx, K, 6, 'GONE', K.ph(a.t, a.d, 0.5, 0.65), 540, 380, '#ff8a65');
    K.text(ctx, 'MINUTES', 1500, 850, { size: 120, color: '#ffd166', k: K.ph(a.t, a.d, 0.6, 0.75) });
  },
  // 17 Number five: Venus, Earth's evil twin -> la Tierra y Venus como gemelas; Venus con cuernos de diablo
  17: (ctx, a, K) => {
    space(ctx, a, K);
    planet(ctx, K, 180, 820, 300, 'earth', a.t); planet(ctx, K, 1000, 820, 290, 'venus', a.t);
    const q = K.ph(a.t, a.d, 0.35, 0.5); if (q > 0) { ctx.save(); ctx.translate(1000, 820); ctx.scale(K.ease.outBack(q), K.ease.outBack(q)); K.P(ctx, [[-200, -220], [-150, -380], [-100, -250]], '#d62828', 8); K.P(ctx, [[200, -220], [150, -380], [100, -250]], '#d62828', 8); ctx.restore(); }
    rank(ctx, K, 5, 'VENUS', K.ph(a.t, a.d, 0, 0.15), 540, 380);
    K.text(ctx, 'EVIL TWIN', 590, 1250, { size: 110, color: '#ff8a65', k: K.ph(a.t, a.d, 0.5, 0.65) });
  },
  // 18 900 °F, hot enough to melt lead like butter -> sartén con un lingote de plomo derritiéndose
  18: (ctx, a, K) => {
    sky(ctx, K, '#f2c66a', '#c98a3a'); ground(ctx, K, 1150, '#b36a2e');
    const m = K.ph(a.t, a.d, 0.1, 0.8);
    K.E(ctx, 540, 1120, 340, 90, '#3a3d44', 0, 10); K.R(ctx, 860, 1100, 380, 40, 18, '#2a2d33', 8);
    ctx.save(); ctx.translate(540, 1080); ctx.scale(1 + m * 0.8, 1 - m * 0.75); K.R(ctx, -130, -90, 260, 110, 18, '#8d95a3', 8); ctx.restore();
    for (let i = 0; i < 4; i++) { ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 8; ctx.beginPath(); for (let y = 0; y < 300; y += 20) { const x = 400 + i * 90 + Math.sin(y / 30 + a.t * 5 + i) * 15; y ? ctx.lineTo(x, 960 - y) : ctx.moveTo(x, 960); } ctx.stroke(); }
    K.text(ctx, '900°F', 1500, 700, { size: 150, color: '#ff3b30', k: K.ph(a.t, a.d, 0.2, 0.35) }); K.text(ctx, 'LEAD', 540, 640, { size: 90, color: '#ffffff', k: K.ph(a.t, a.d, 0.3, 0.45) });
  },
  // 19 Pressure 90x: like diving nearly 3,000 ft -> corte del océano con la profundidad bajando hasta 3,000 ft
  19: (ctx, a, K) => {
    const g = ctx.createLinearGradient(0, 300, 0, 1900); g.addColorStop(0, '#4cc3f0'); g.addColorStop(1, '#05122a'); ctx.fillStyle = g; ctx.fillRect(K.X0, 0, K.XW, 1920);
    const k = K.ease.inOut(K.ph(a.t, a.d, 0.05, 0.8));
    ctx.save(); ctx.translate(200, 400 + k * 900); body(ctx, a, K, 0, -280, 0.11, 'worried'); ctx.restore(); bubbles(ctx, K, 200, 400 + k * 900 - 300, a.t);
    ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(700, 400); ctx.lineTo(700, 400 + k * 950); ctx.stroke();
    K.text(ctx, `${fmt(k * 3000)} FT`, 1150, 400 + k * 900, { size: 110, color: '#ffffff' });
    K.text(ctx, 'x90', 1600, 600, { size: 150, color: '#ffd166', k: K.ph(a.t, a.d, 0.4, 0.55) });
  },
  // 20 A submarine at that depth… now picture yourself without one -> submarino a la izquierda; tú, sin él, aplastado y cociéndose
  20: (ctx, a, K) => {
    const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, '#0a2a4a'); g.addColorStop(1, '#03101f'); ctx.fillStyle = g; ctx.fillRect(K.X0, 0, K.XW, 1920);
    ctx.save(); ctx.translate(-150, 820); K.prop(ctx, 'submarino', 0, 0, 1.5, a.t); ctx.restore();
    const sq = 1 - Math.abs(Math.sin(a.t * 3)) * 0.12; ctx.save(); ctx.translate(1150, 1250); ctx.scale(sq, 1 / sq); body(ctx, a, K, 0, -560, 0.2, 'shocked'); ctx.restore();
    for (let i = 0; i < 8; i++) { const an = i / 8 * Math.PI * 2; ctx.save(); ctx.translate(1150 + Math.cos(an) * 380, 900 + Math.sin(an) * 380); ctx.rotate(an + Math.PI); K.P(ctx, [[0, -20], [70, 0], [0, 20]], '#ffd166', 5); ctx.restore(); }
    K.radial(ctx, 1150, 950, 300, '#ff6a00', 0.3 + 0.2 * Math.sin(a.t * 4));
  },
  // 21 Clouds of sulfuric acid overhead -> nubes amarillas goteando ácido que chisporrotea en el suelo
  21: (ctx, a, K) => {
    sky(ctx, K, '#e8c24a', '#c98a3a'); ground(ctx, K, 1250, '#a86a30');
    for (let i = 0; i < 6; i++) { const x = -500 + i * 420 + Math.sin(a.t * 0.4 + i) * 60; K.C(ctx, x, 470, 140, '#f2e27a', 7); K.C(ctx, x + 120, 450, 110, '#e8d26a', 7); K.C(ctx, x - 110, 490, 100, '#e8d26a', 7); }
    for (let i = 0; i < 18; i++) { const q = (a.t * 0.9 + i / 18) % 1; K.E(ctx, -500 + (i * 157) % 2400, 560 + q * 700, 10, 18, '#c6ff4a', 0, 3); if (q > 0.9) K.C(ctx, -500 + (i * 157) % 2400, 1250, 18, 'rgba(200,255,80,0.6)', 0); }
    K.text(ctx, 'ACID', 540, 900, { size: 160, color: '#c6ff4a', k: K.ph(a.t, a.d, 0.3, 0.45) });
  },
  // 22 Venus hotter than Mercury though twice as far -> Sol, Mercurio cerca, Venus más lejos y con termómetro más alto
  22: (ctx, a, K) => {
    space(ctx, a, K);
    planet(ctx, K, -500, 850, 320, 'sun', a.t);
    planet(ctx, K, 250, 850, 80, 'mercury', a.t); planet(ctx, K, 1050, 850, 130, 'venus', a.t);
    thermo(ctx, K, 250, 1350, 0.55, '800°F'); thermo(ctx, K, 1050, 1350, 0.75 * K.ease.out(K.ph(a.t, a.d, 0.2, 0.6)) + 0.1, '900°F');
    K.text(ctx, '?!', 1500, 700, { size: 200, color: '#ffd166', k: K.ph(a.t, a.d, 0.6, 0.75) });
  },
  // 23 Thick CO2 air traps heat like a blanket -> una manta gruesa envuelve Venus; rayos de calor rebotan dentro
  23: (ctx, a, K) => {
    space(ctx, a, K);
    planet(ctx, K, 540, 850, 330, 'venus', a.t);
    const k = K.ph(a.t, a.d, 0.1, 0.4); ctx.save(); ctx.globalAlpha = 0.85 * k; ctx.lineWidth = 80; ctx.strokeStyle = '#c94b6a'; ctx.beginPath(); ctx.arc(540, 850, 400, 0, 7); ctx.stroke(); ctx.lineWidth = 6; ctx.strokeStyle = K.INK; ctx.beginPath(); ctx.arc(540, 850, 440, 0, 7); ctx.arc(540, 850, 360, 0, 7); ctx.stroke(); ctx.restore();
    for (let i = 0; i < 6; i++) { const an = i + a.t * 0.8; ctx.save(); ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(540 + Math.cos(an) * 340, 850 + Math.sin(an) * 340); ctx.lineTo(540 + Math.cos(an + 0.4) * 230, 850 + Math.sin(an + 0.4) * 230); ctx.lineTo(540 + Math.cos(an + 0.8) * 340, 850 + Math.sin(an + 0.8) * 340); ctx.stroke(); ctx.restore(); }
    K.text(ctx, 'CO2 BLANKET', 1500, 700, { size: 100, color: '#ffffff', k: K.ph(a.t, a.d, 0.3, 0.45) });
  },
  // 24 Venera probe built like a tank lasted ~2 hours -> la sonda en el suelo con un reloj de 2 horas que se agota
  24: (ctx, a, K) => {
    sky(ctx, K, '#e8b84a', '#b5732e'); ground(ctx, K, 1200, '#9c5c28');
    ctx.save(); ctx.translate(540, 1080); K.R(ctx, -200, -80, 400, 160, 40, '#9aa3ad', 10); K.C(ctx, 0, -130, 120, '#7d8590', 10); K.R(ctx, -280, -10, 80, 40, 10, '#5a6270', 6); K.R(ctx, 200, -10, 80, 40, 10, '#5a6270', 6); ctx.restore();
    const k = K.ph(a.t, a.d, 0.1, 0.9); K.C(ctx, 1450, 750, 200, '#ffffff', 10); ctx.save(); ctx.translate(1450, 750); ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 180, -Math.PI / 2, -Math.PI / 2 + (1 - k) * Math.PI * 2); ctx.closePath(); ctx.fillStyle = '#ffd166'; ctx.fill(); ctx.restore();
    K.text(ctx, '2 HOURS', 1450, 1050, { size: 100, color: '#ffffff' }); K.text(ctx, 'VENERA', 540, 760, { size: 90, color: '#ffffff', k: K.ph(a.t, a.d, 0.1, 0.25) });
    if (k > 0.95) K.smoke(ctx, 540, 950, a.t, 6);
  },
  // 25 You have no tank; leave the oven -> la persona sale volando de un horno gigante hacia Mercurio
  25: (ctx, a, K) => {
    space(ctx, a, K);
    K.R(ctx, -500, 450, 800, 800, 40, '#3a3d44', 12); K.R(ctx, -440, 520, 680, 560, 20, '#ff8a00', 8); K.radial(ctx, -100, 800, 300, '#ffd23f', 0.6);
    const k = K.ease.inOut(K.ph(a.t, a.d, 0.1, 0.9)); ctx.save(); ctx.translate(-100 + k * 1300, 800 - k * 200); ctx.rotate(-0.5); body(ctx, a, K, 0, -280, 0.11, 'happy', { arms: 'up' }); ctx.restore();
    planet(ctx, K, 1600, 600, 130, 'mercury', a.t);
    K.text(ctx, 'BYE!', 600, 500, { size: 120, color: '#ffffff', k: K.ph(a.t, a.d, 0.2, 0.35) });
  },
  // 26 Number four: Mercury, smallest and closest to the Sun -> Mercurio diminuto junto al Sol gigante
  26: (ctx, a, K) => {
    space(ctx, a, K);
    planet(ctx, K, -700, 850, 700, 'sun', a.t);
    planet(ctx, K, 700, 850, 110 + Math.sin(a.t) * 4, 'mercury', a.t);
    rank(ctx, K, 4, 'MERCURY', K.ph(a.t, a.d, 0, 0.15), 1100, 450);
    ctx.save(); ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 8; ctx.setLineDash([20, 14]); ctx.beginPath(); ctx.moveTo(0, 850); ctx.lineTo(580, 850); ctx.stroke(); ctx.restore();
    K.text(ctx, 'CLOSEST', 1300, 1100, { size: 100, color: '#ffffff', k: K.ph(a.t, a.d, 0.4, 0.55) });
  },
  // 27 Sunny side 800 °F, like a pizza oven -> de pie dentro de un horno de pizza gigante
  27: (ctx, a, K) => {
    ctx.fillStyle = '#5a3a2a'; ctx.fillRect(K.X0, 0, K.XW, 1920);
    ctx.save(); ctx.beginPath(); ctx.arc(540, 1300, 1100, Math.PI, 0); ctx.closePath(); ctx.fillStyle = '#2a1410'; ctx.fill(); ctx.lineWidth = 14; ctx.strokeStyle = K.INK; ctx.stroke(); ctx.restore();
    for (let i = 0; i < 9; i++) { const x = -300 + i * 230; ctx.save(); ctx.translate(x, 1300); K.prop(ctx, 'fuego', 0, 0, 0.8 + Math.sin(a.t * 6 + i) * 0.1, a.t); ctx.restore(); }
    body(ctx, a, K, 540, 650, 0.15, 'shocked'); sweat(ctx, K, 540, 560, a.t);
    K.prop(ctx, 'pizza', 1350, 1150, 0.7, a.t);
    K.text(ctx, '800°F', 540, 400, { size: 130, color: '#ffd166', k: K.ph(a.t, a.d, 0.2, 0.35) });
  },
  // 28 Skin burns in seconds, almost no air -> piel enrojeciendo, burbuja de aire vacía "no air"
  28: (ctx, a, K) => {
    sky(ctx, K, '#14152a', '#000000'); ground(ctx, K, 1200, '#8f8a82');
    const r = K.ph(a.t, a.d, 0.1, 0.8);
    K.midShot(ctx, a.who, { x: 400, y: 1050, s: 0.75, mood: 'shocked', t: a.t });
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = `rgba(255,${Math.round(255 - r * 140)},${Math.round(255 - r * 160)},1)`; ctx.fillRect(100, 500, 600, 900); ctx.restore();
    K.C(ctx, 1300, 800, 230, 'rgba(180,220,255,0.15)', 8); K.text(ctx, 'NO AIR', 1300, 800, { size: 100, color: '#ffffff' });
    ctx.save(); ctx.strokeStyle = '#ff3b30'; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(1140, 640); ctx.lineTo(1460, 960); ctx.stroke(); ctx.restore();
  },
  // 29 Heat escapes into space when the Sun goes down -> el Sol se oculta y ondas de calor se escapan al espacio
  29: (ctx, a, K) => {
    const k = K.ph(a.t, a.d, 0.05, 0.6);
    sky(ctx, K, `rgb(${Math.round(255 - k * 235)},${Math.round(170 - k * 150)},${Math.round(90 - k * 60)})`, '#08091a');
    planet(ctx, K, 540, 1100 + k * 500, 220, 'sun', a.t); ground(ctx, K, 1200, '#8f8a82');
    for (let i = 0; i < 6; i++) { const q = (a.t * 0.6 + i / 6) % 1; ctx.save(); ctx.globalAlpha = 1 - q; ctx.strokeStyle = '#ff8a65'; ctx.lineWidth = 10; ctx.beginPath(); for (let x = 0; x < 300; x += 20) { const y = 1150 - q * 900 - x * 0; ctx.lineTo(-200 + i * 320 + x, y + Math.sin(x / 30 + a.t * 4) * 20); } ctx.stroke(); ctx.restore(); }
    K.text(ctx, 'HEAT ESCAPES', 1500, 500, { size: 100, color: '#ffffff', k: K.ph(a.t, a.d, 0.4, 0.55) });
  },
  // 30 Night: -290 °F, a swing of 1,000 degrees -> termómetro que baja en picado; hielo cubriendo el suelo
  30: (ctx, a, K) => {
    sky(ctx, K, '#0a0d24', '#1b2246'); ground(ctx, K, 1200, '#9fb3c8');
    const k = K.ease.inOut(K.ph(a.t, a.d, 0.05, 0.7)); thermo(ctx, K, 540, 1300, 0.9 - k * 0.85, `${Math.round(800 - k * 1090)}°F`, '#4cc9f0');
    for (let i = 0; i < 10; i++) { const q = K.ph(a.t, a.d, 0.3 + i * 0.04, 0.5 + i * 0.04); if (q > 0) K.prop(ctx, 'hielo', -500 + i * 250, 1250, 0.4 * q, a.t); }
    K.text(ctx, '1,000° SWING', 1450, 600, { size: 100, color: '#7fd0ff', k: K.ph(a.t, a.d, 0.6, 0.75) });
  },
  // 31 Frozen solid; one Mercury day = 176 Earth days -> persona congelada en bloque de hielo; calendario de 176 días
  31: (ctx, a, K) => {
    sky(ctx, K, '#0a0d24', '#1b2246'); ground(ctx, K, 1250, '#c8d8e8');
    body(ctx, a, K, 400, 680, 0.15, 'shocked'); K.R(ctx, 220, 560, 360, 720, 30, 'rgba(180,230,255,0.55)', 10); K.sparkles(ctx, 400, 900, a.t, 6);
    const n = Math.round(K.ease.out(K.ph(a.t, a.d, 0.2, 0.8)) * 176);
    K.R(ctx, 1050, 560, 520, 560, 30, '#ffffff', 10); K.R(ctx, 1050, 560, 520, 130, 30, '#d64545', 10); K.text(ctx, '1 DAY', 1310, 625, { size: 70, color: '#ffffff' }); K.text(ctx, `${n}`, 1310, 860, { size: 200, color: '#14152a' }); K.text(ctx, 'EARTH DAYS', 1310, 1040, { size: 60, color: '#14152a' });
  },
  // 32 Burns you or freezes you -> pantalla partida: mitad fuego, mitad hielo, la moneda cae
  32: (ctx, a, K) => {
    ctx.fillStyle = '#ff6a00'; ctx.fillRect(K.X0, 0, 540 - K.X0, 1920); ctx.fillStyle = '#4cc9f0'; ctx.fillRect(540, 0, K.X0 + K.XW - 540, 1920);
    K.prop(ctx, 'fuego', 0, 1050, 1.8, a.t); K.prop(ctx, 'hielo', 1100, 1000, 1.6, a.t);
    const f = a.t * 8; ctx.save(); ctx.translate(540, 700 + Math.abs(Math.sin(a.t * 3)) * -200); ctx.scale(Math.cos(f), 1); K.C(ctx, 0, 0, 110, '#ffd166', 10); ctx.restore();
    K.text(ctx, 'BURN', 0, 450, { size: 140, color: '#ffffff' }); K.text(ctx, 'FREEZE', 1100, 450, { size: 140, color: '#ffffff' });
  },
  // 33 Number three: the Moon; bust a movie myth -> la Luna con cartel de película y sello MYTH
  33: (ctx, a, K) => {
    space(ctx, a, K);
    planet(ctx, K, 540, 850, 360, 'moon', a.t);
    rank(ctx, K, 3, 'THE MOON', K.ph(a.t, a.d, 0, 0.15), 540, 380);
    K.R(ctx, 1200, 650, 420, 260, 20, '#22232b', 8); K.text(ctx, 'MOVIES', 1410, 780, { size: 90, color: '#ffd166' });
    const st = K.ph(a.t, a.d, 0.55, 0.65); if (st > 0) { ctx.save(); ctx.translate(1410, 780); ctx.rotate(-0.2); ctx.scale(1.6 - 0.6 * st, 1.6 - 0.6 * st); ctx.lineWidth = 10; ctx.strokeStyle = '#ff3b30'; ctx.strokeRect(-170, -60, 340, 120); ctx.fillStyle = '#ff3b30'; ctx.font = '80px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('MYTH', 0, 6); ctx.restore(); }
  },
  // 34 In movies someone explodes out of an airlock — wrong -> esclusa de película, el muñeco se infla como globo… y una X roja
  34: (ctx, a, K) => {
    space(ctx, a, K);
    K.R(ctx, -500, 350, 700, 1000, 40, '#9aa3ad', 12); K.R(ctx, -380, 500, 460, 700, 20, '#3a3d44', 8);
    const k = K.ph(a.t, a.d, 0.05, 0.5); ctx.save(); ctx.translate(300 + k * 600, 820); ctx.rotate(k * 3); ctx.scale(1 + k * 0.6, 1 + k * 0.6); K.C(ctx, 0, 0, 120, '#ff8fab', 8); K.C(ctx, -35, -20, 12, K.INK, 0); K.C(ctx, 35, -20, 12, K.INK, 0); ctx.restore();
    if (a.t > a.d * 0.5) { K.starBurst(ctx, 900, 820, 200, '#ffd166', 1); const x = K.ph(a.t, a.d, 0.6, 0.75); ctx.save(); ctx.strokeStyle = '#ff3b30'; ctx.lineWidth = 40; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(700, 620); ctx.lineTo(700 + 400 * x, 620 + 400 * x); ctx.moveTo(1100, 620); ctx.lineTo(1100 - 400 * x, 620 + 400 * x); ctx.stroke(); ctx.restore(); }
    K.text(ctx, 'WRONG', 1600, 500, { size: 120, color: '#ff3b30', k: K.ph(a.t, a.d, 0.7, 0.85) });
  },
  // 35 Don't hold your breath: exhale -> unos pulmones que se vacían; flecha "EXHALE"
  35: (ctx, a, K) => {
    space(ctx, a, K, '#0d1030');
    const b = 1 - K.ph(a.t, a.d, 0.2, 0.8) * 0.4; ctx.save(); ctx.translate(540, 820); ctx.scale(b, b); K.prop(ctx, 'pulmones', 0, 0, 1.6, a.t); ctx.restore();
    for (let i = 0; i < 6; i++) { const q = (a.t * 1.2 + i / 6) % 1; K.C(ctx, 540 + Math.sin(i) * 40, 450 - q * 250, 20 * (1 - q), '#bfe9ff', 4); }
    K.text(ctx, 'EXHALE!', 1500, 700, { size: 140, color: '#2ec27e', k: K.ph(a.t, a.d, 0.2, 0.35) });
    K.text(ctx, "DON'T HOLD IT", -200, 700, { size: 90, color: '#ffd166', k: K.ph(a.t, a.d, 0.05, 0.2) });
  },
  // 36 Moisture on your tongue bubbles; liquids boil at low pressure -> primer plano de la lengua con burbujas
  36: (ctx, a, K) => {
    space(ctx, a, K, '#0d1030');
    ctx.save(); ctx.translate(540, 820); K.E(ctx, 0, 0, 420, 300, '#c0392b', 0, 12); K.E(ctx, 0, 60, 300, 180, '#ff6b81', 0, 10); ctx.restore();
    for (let i = 0; i < 16; i++) { const q = (a.t * 1.4 + i / 16) % 1; K.C(ctx, 380 + (i * 37) % 320, 860 - q * 120, 10 + (i % 3) * 8, 'rgba(255,255,255,0.9)', 3); }
    K.text(ctx, 'BUBBLING', 1500, 600, { size: 110, color: '#7fd0ff', k: K.ph(a.t, a.d, 0.2, 0.35) });
    gauge(ctx, K, -300, 800, 200, 0.05, 'PRESSURE');
  },
  // 37 Your body swells to twice its size; skin holds -> la persona se hincha y la piel aguanta (mancha elástica)
  37: (ctx, a, K) => {
    space(ctx, a, K, '#0d1030');
    const s = 1 + K.ease.inOut(K.ph(a.t, a.d, 0.1, 0.7)) * 0.7;
    ctx.save(); ctx.translate(540, 1250); ctx.scale(s * 1.1, s * 0.95); body(ctx, a, K, 0, -560, 0.18, 'shocked'); ctx.restore();
    K.text(ctx, 'x2', 1400, 650, { size: 180, color: '#ffd166', k: K.ph(a.t, a.d, 0.5, 0.65) });
    K.text(ctx, 'SKIN HOLDS', -250, 650, { size: 90, color: '#2ec27e', k: K.ph(a.t, a.d, 0.65, 0.8) });
  },
  // 38 No explosion; oxygen runs out: 15 seconds -> cuenta atrás de 15 segundos sobre la cara
  38: (ctx, a, K) => {
    space(ctx, a, K, '#0d1030');
    K.midShot(ctx, a.who, { x: 300, y: 1100, s: 0.75, mood: 'worried', t: a.t });
    const n = Math.max(0, 15 - Math.floor(K.ph(a.t, a.d, 0.1, 1) * 15));
    K.C(ctx, 1300, 780, 280, '#14152a', 12); ctx.save(); ctx.translate(1300, 780); ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 250, -Math.PI / 2, -Math.PI / 2 + n / 15 * Math.PI * 2); ctx.closePath(); ctx.fillStyle = '#ff3b30'; ctx.fill(); ctx.restore();
    K.text(ctx, String(n), 1300, 790, { size: 220, color: '#ffffff' }); K.text(ctx, 'SECONDS', 1300, 1150, { size: 80, color: '#ffd166' });
  },
  // 39 You black out; brain starved of oxygen -> la pantalla se va a negro y un cerebro con la batería vacía
  39: (ctx, a, K) => {
    space(ctx, a, K, '#0d1030');
    K.prop(ctx, 'cerebro', 540, 820, 1.4, a.t);
    const b = 1 - K.ph(a.t, a.d, 0.1, 0.8); K.R(ctx, 1200, 700, 360, 170, 20, '#14152a', 10); K.R(ctx, 1560, 750, 30, 70, 6, '#14152a', 0); K.R(ctx, 1215, 715, 330 * b, 140, 14, b < 0.3 ? '#ff3b30' : '#2ec27e', 0);
    K.text(ctx, 'O2', 1380, 950, { size: 90, color: '#ffffff' });
    const v = ctx.createRadialGradient(540, 820, 100 + b * 600, 540, 820, 1400); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${0.95 - b * 0.6})`); ctx.fillStyle = v; ctx.fillRect(K.X0, 0, K.XW, 1920);
  },
  // 40 Death in 1-2 minutes; Moon 250° in sun, -200 at night -> la Luna mitad iluminada y mitad en sombra con dos termómetros
  40: (ctx, a, K) => {
    space(ctx, a, K);
    planet(ctx, K, 540, 850, 380, 'moon', a.t); ctx.save(); ctx.beginPath(); ctx.arc(540, 850, 380, -Math.PI / 2, Math.PI / 2); ctx.closePath(); ctx.fillStyle = 'rgba(5,8,30,0.7)'; ctx.fill(); ctx.restore();
    thermo(ctx, K, -300, 1300, 0.85, '250°F'); thermo(ctx, K, 1400, 1300, 0.08, '-200°F', '#4cc9f0');
    K.text(ctx, '1-2 MIN', 540, 380, { size: 110, color: '#ff8a65', k: K.ph(a.t, a.d, 0.1, 0.25) });
  },
  // 41 Has anyone tested this? One man lived through it -> expediente secreto "TESTED ON A HUMAN?" que se abre
  41: (ctx, a, K) => {
    ctx.fillStyle = '#3a2a1e'; ctx.fillRect(K.X0, 0, K.XW, 1920);
    const o = K.ease.out(K.ph(a.t, a.d, 0.1, 0.5)); ctx.save(); ctx.translate(540, 820); K.R(ctx, -400, -300, 800, 600, 20, '#e2b866', 10); ctx.save(); ctx.translate(-400, -300); ctx.scale(1 - o * 0.9, 1); K.R(ctx, 0, 0, 800, 600, 20, '#d4a64e', 10); ctx.restore();
    if (o > 0.8) { K.R(ctx, -330, -230, 660, 460, 10, '#fbf6e8', 6); ctx.fillStyle = K.INK; ctx.font = '70px Anton'; ctx.textAlign = 'center'; ctx.fillText('TESTED ON', 0, -70); ctx.fillText('A HUMAN?', 0, 30); } ctx.restore();
    K.text(ctx, 'YES.', 1500, 820, { size: 180, color: '#ffd166', k: K.ph(a.t, a.d, 0.6, 0.75) });
  },
  // 42 Houston, Texas, 1965, the space race -> edificio de la NASA de los 60, cohete en el horizonte, 1965
  42: (ctx, a, K) => {
    sky(ctx, K, '#7fc8f8', '#dff1ff'); ground(ctx, K, 1250, '#8fbf6a');
    K.R(ctx, -200, 700, 900, 560, 10, '#e8e2d0', 10); for (let i = 0; i < 12; i++) K.R(ctx, -160 + (i % 6) * 140, 760 + Math.floor(i / 6) * 220, 90, 140, 6, '#7fb3e0', 6); K.text(ctx, 'HOUSTON', 250, 640, { size: 90, color: '#14152a' });
    const k = K.ph(a.t, a.d, 0.3, 1); ctx.save(); ctx.translate(1400, 1150 - k * 700); K.prop(ctx, 'cohete', 0, 0, 1, a.t); ctx.restore(); if (k > 0) K.smoke(ctx, 1400, 1200, a.t, 8);
    K.text(ctx, '1965', 1000, 450, { size: 160, color: '#ffd166', k: K.ph(a.t, a.d, 0.05, 0.2) });
  },
  // 43 Jim LeBlanc, NASA technician, tests suits in a vacuum chamber -> ficha del técnico y el traje espacial
  43: (ctx, a, K) => {
    chamber(ctx, a, K);
    astro(ctx, K, 540, 850, 0.9, a.t);
    const q = K.ph(a.t, a.d, 0.15, 0.35); ctx.save(); ctx.translate(1450 + (1 - K.ease.out(q)) * 800, 720); K.R(ctx, -320, -150, 640, 300, 24, '#fbf6e8', 8); ctx.fillStyle = K.INK; ctx.textAlign = 'left'; ctx.font = '60px Anton'; ctx.fillText('JIM LEBLANC', -280, -50); ctx.font = '40px Poppins'; ctx.fillText('NASA technician', -280, 20); ctx.fillText('Suit tester', -280, 80); ctx.restore();
  },
  // 44 The chamber copies 120,000 feet -> el aire sale por las bombas; altímetro hasta 120,000 ft
  44: (ctx, a, K) => {
    ctx.save(); ctx.translate(540, 820); ctx.scale(0.75, 0.75); ctx.translate(-540, -820);
    const k = K.ph(a.t, a.d, 0.05, 0.8); chamber(ctx, a, K, 1 - k);
    astro(ctx, K, 540, 850, 0.8, a.t);
    for (let i = 0; i < 10; i++) { const q = (a.t * 1.5 + i / 10) % 1; K.C(ctx, 540 + (i % 2 ? 1 : -1) * (300 + q * 500), 600 + (i * 47) % 500, 14 * (1 - q), '#cfe8ff', 3); }
    K.text(ctx, `${fmt(k * 120000)} FT`, 1500, 700, { size: 120, color: '#ffd166' });
    K.prop(ctx, 'avion', -400, 600, 0.5, a.t);
    ctx.restore();
  },
  // 45 A hose came loose; air rushing out -> la manguera se suelta y escupe aire, alarma roja
  45: (ctx, a, K) => {
    chamber(ctx, a, K, 0.1);
    astro(ctx, K, 540, 850, 0.8, a.t, { rot: Math.sin(a.t * 6) * 0.03 });
    const sw = Math.sin(a.t * 10) * 0.5; ctx.save(); ctx.translate(640, 800); ctx.rotate(sw); ctx.strokeStyle = '#3a3d44'; ctx.lineWidth = 30; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(200, 100, 350, -50); ctx.stroke(); ctx.restore();
    for (let i = 0; i < 12; i++) { const q = (a.t * 2 + i / 12) % 1; K.C(ctx, 990 + q * 400, 750 - q * 200 + Math.sin(i) * 60, 12 + q * 20, 'rgba(220,240,255,0.7)', 0); }
    if (Math.sin(a.t * 8) > 0) { ctx.fillStyle = 'rgba(255,0,0,0.25)'; ctx.fillRect(K.X0, 0, K.XW, 1920); }
    K.text(ctx, 'LEAK!', 1500, 500, { size: 150, color: '#ff3b30', k: K.ph(a.t, a.d, 0.1, 0.25) });
  },
  // 46 The suit went slack; chamber nearly airless -> el traje se arruga y se queda flojo; manómetro a cero
  46: (ctx, a, K) => {
    ctx.save(); ctx.translate(540, 760); ctx.scale(1.45, 1.45); ctx.translate(-540, -760);
    chamber(ctx, a, K, 0);
    const s = 1 - K.ph(a.t, a.d, 0.1, 0.6) * 0.15; ctx.save(); ctx.translate(540, 850); ctx.scale(s, 1); astro(ctx, K, 0, 0, 0.8, a.t, { slack: true }); ctx.restore();
    gauge(ctx, K, 1400, 800, 220, 0.6 * (1 - K.ph(a.t, a.d, 0.05, 0.6)), 'SUIT');
    K.text(ctx, '!', -200, 700, { size: 260, color: '#ff3b30', k: K.ph(a.t, a.d, 0.4, 0.55) });
    ctx.restore();
  },
  // 47 Saliva on his tongue bubbling, then boiling; everything fades -> el casco por dentro: burbujas que hierven y fundido a blanco
  47: (ctx, a, K) => {
    ctx.fillStyle = '#0e1626'; ctx.fillRect(K.X0, 0, K.XW, 1920);
    K.C(ctx, 540, 820, 560, '#2b3a55', 14); K.C(ctx, 540, 820, 520, '#1b2538', 0);
    for (let i = 0; i < 20; i++) { const q = (a.t * (1 + K.ph(a.t, a.d, 0, 1) * 2) + i / 20) % 1; K.C(ctx, 300 + (i * 53) % 480, 1000 - q * 300, 8 + (i % 4) * 6, '#bfe9ff', 3); }
    const f = K.ph(a.t, a.d, 0.55, 1); ctx.fillStyle = `rgba(255,255,255,${f * 0.95})`; ctx.fillRect(K.X0, 0, K.XW, 1920);
    K.text(ctx, 'BOILING...', 1500, 600, { size: 100, color: '#7fd0ff', k: K.ph(a.t, a.d, 0.15, 0.3) });
  },
  // 48 About 14 seconds later he lost consciousness -> reloj de 14 segundos y el traje que se desploma
  48: (ctx, a, K) => {
    ctx.save(); ctx.translate(700, 900); ctx.scale(0.85, 0.85); ctx.translate(-700, -900);
    chamber(ctx, a, K, 0);
    const fall = K.ease.in(K.ph(a.t, a.d, 0.6, 0.85)); ctx.save(); ctx.translate(540, 850 + fall * 300); ctx.rotate(fall * 1.4); astro(ctx, K, 0, 0, 0.8, a.t, { slack: true }); ctx.restore();
    const n = Math.min(14, Math.floor(K.ph(a.t, a.d, 0, 0.6) * 14)); K.text(ctx, `${n}s`, 1450, 700, { size: 200, color: '#ffd166' });
    K.text(ctx, 'SAME AS THE MOON', -150, 450, { size: 80, color: '#ffffff', k: K.ph(a.t, a.d, 0.7, 0.85) });
    ctx.restore();
  },
  // 49 Coworkers outside started letting air back in -> compañeros tras el cristal giran la válvula a toda prisa
  49: (ctx, a, K) => {
    ctx.fillStyle = '#2a2f3a'; ctx.fillRect(K.X0, 0, K.XW, 1920);
    K.R(ctx, -700, 350, 1400, 900, 30, 'rgba(150,190,230,0.2)', 12); astro(ctx, K, -100, 950, 0.6, a.t, { slack: true, rot: 1.3 });
    for (let i = 0; i < 2; i++) K.midShot(ctx, K.personaWho('nasa', { who: 'tech' + i }), { x: 1000 + i * 380, y: 1150, s: 0.6, mood: 'shocked', t: a.t + i });
    ctx.save(); ctx.translate(1550, 650); ctx.rotate(a.t * 6); K.C(ctx, 0, 0, 120, '#d62828', 10); for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); K.R(ctx, -14, 0, 28, 150, 10, '#d62828', 6); } ctx.restore();
    K.text(ctx, 'AIR IN!', 1550, 400, { size: 110, color: '#2ec27e', k: K.ph(a.t, a.d, 0.2, 0.35) });
  },
  // 50 Under half a minute the air was back; Jim woke up fine -> el traje se infla otra vez, se levanta, pulgar arriba
  50: (ctx, a, K) => {
    ctx.save(); ctx.translate(540, 900); ctx.scale(1.25, 1.25); ctx.translate(-540, -900);
    const k = K.ph(a.t, a.d, 0.05, 0.6); chamber(ctx, a, K, k);
    const up = K.ease.out(K.ph(a.t, a.d, 0.35, 0.8)); ctx.save(); ctx.translate(540, 1150 - up * 300); ctx.rotate((1 - up) * 1.4); astro(ctx, K, 0, 0, 0.8, a.t, { slack: up < 0.5 }); ctx.restore();
    if (up > 0.9) K.text(ctx, 'OK!', 1000, 600, { size: 150, color: '#2ec27e', k: K.ph(a.t, a.d, 0.8, 0.9) });
    K.text(ctx, '< 30 s', -250, 600, { size: 130, color: '#ffd166', k: K.ph(a.t, a.d, 0.1, 0.25) });
    ctx.restore();
  },
  // 51 Rare real data: survivable if rescued fast -> gráfica que dibuja una línea: tiempo de rescate vs supervivencia
  51: (ctx, a, K) => {
    ctx.fillStyle = '#14152a'; ctx.fillRect(K.X0, 0, K.XW, 1920);
    K.R(ctx, -300, 400, 1700, 900, 30, '#1f2547', 10); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-200, 450); ctx.lineTo(-200, 1200); ctx.lineTo(1300, 1200); ctx.stroke();
    const k = K.ph(a.t, a.d, 0.1, 0.8); ctx.strokeStyle = '#2ec27e'; ctx.lineWidth = 16; ctx.beginPath(); for (let x = 0; x <= 1500 * k; x += 20) { const y = 500 + 700 / (1 + Math.exp(-(x - 700) / 120)); x ? ctx.lineTo(-200 + x, y) : ctx.moveTo(-200, y); } ctx.stroke();
    K.text(ctx, 'SURVIVAL', -200, 380, { size: 70, color: '#2ec27e' }); K.text(ctx, 'RESCUE TIME', 1100, 1270, { size: 60, color: '#ffffff' });
    K.text(ctx, 'FAST = ALIVE', 1600, 700, { size: 90, color: '#ffd166', k: K.ph(a.t, a.d, 0.6, 0.75) });
  },
  // 52 Back on the Moon: nobody's coming. Next: Mars -> la Luna vacía, tu silueta sola, y Marte apareciendo
  52: (ctx, a, K) => {
    space(ctx, a, K); ground(ctx, K, 1150, '#c8c8ce');
    body(ctx, a, K, 300, 620, 0.14, 'sad');
    K.text(ctx, 'NOBODY', 300, 450, { size: 110, color: '#ffffff', k: K.ph(a.t, a.d, 0.1, 0.25) });
    const q = K.ph(a.t, a.d, 0.5, 0.8); if (q > 0) planet(ctx, K, 1400, 650, 220 * K.ease.outBack(q), 'mars', a.t);
    planet(ctx, K, 900, 450, 70, 'earth', a.t);
  },
  // 53 Number two: Mars, the planet everyone wants to colonize -> Marte con cohetes y banderitas de colonias llegando
  53: (ctx, a, K) => {
    space(ctx, a, K);
    planet(ctx, K, 540, 950, 420, 'mars', a.t);
    for (let i = 0; i < 3; i++) { const q = (a.t * 0.25 + i / 3) % 1; ctx.save(); ctx.translate(-600 + q * 1000 + i * 300, 300 + q * 400); ctx.rotate(0.8); K.prop(ctx, 'cohete', 0, 0, 0.5, a.t); ctx.restore(); }
    for (let i = 0; i < 4; i++) { ctx.save(); ctx.translate(300 + i * 160, 560 + Math.abs(i - 1.5) * 30); K.R(ctx, -4, -100, 8, 100, 2, '#ffffff', 0); K.R(ctx, 4, -100, 70, 44, 4, ['#2f80ed', '#2ec27e', '#ffd166', '#ff4fa3'][i], 4); ctx.restore(); }
    rank(ctx, K, 2, 'MARS', K.ph(a.t, a.d, 0, 0.15), 1300, 450);
  },
  // 54 Air pressure less than 1% of Earth's, like 20 miles up -> barra de presión: Tierra llena, Marte casi vacía
  54: (ctx, a, K) => {
    sky(ctx, K, '#e9a27a', '#c8603e'); ground(ctx, K, 1250, '#b5532f');
    const k = K.ph(a.t, a.d, 0.1, 0.5);
    K.R(ctx, 100, 450, 220, 700, 30, '#ffffff', 10); K.R(ctx, 115, 465 + 670 * (1 - k), 190, 670 * k, 20, '#3a8fd6', 0); K.text(ctx, 'EARTH', 210, 1200, { size: 70, color: '#ffffff' });
    K.R(ctx, 500, 450, 220, 700, 30, '#ffffff', 10); K.R(ctx, 515, 1135 - 8 * k, 190, 8 * k, 4, '#e0734a', 0); K.text(ctx, 'MARS', 610, 1200, { size: 70, color: '#ffffff' });
    K.text(ctx, '<1%', 1300, 700, { size: 200, color: '#ffd166', k: K.ph(a.t, a.d, 0.4, 0.55) });
  },
  // 55 Below the Armstrong limit: saliva boils, you swell and pass out -> línea de Armstrong y la persona hinchándose
  55: (ctx, a, K) => {
    sky(ctx, K, '#e9a27a', '#c8603e'); ground(ctx, K, 1250, '#b5532f');
    ctx.save(); ctx.setLineDash([30, 20]); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(K.X0, 500); ctx.lineTo(K.X0 + K.XW, 500); ctx.stroke(); ctx.restore(); K.text(ctx, 'ARMSTRONG LIMIT', 1300, 440, { size: 70, color: '#ffffff' });
    const s = 1 + K.ph(a.t, a.d, 0.2, 0.7) * 0.4; ctx.save(); ctx.translate(540, 1250); ctx.scale(s, s * 0.95); ctx.rotate(K.ph(a.t, a.d, 0.75, 1) * 1.2); body(ctx, a, K, 0, -560, 0.18, 'shocked'); ctx.restore();
    bubbles(ctx, K, 540, 650, a.t, 6);
  },
  // 56 Average -80 °F, like Alaska's coldest day -> Marte helado con un termómetro y un oso polar de broma con bufanda
  56: (ctx, a, K) => {
    sky(ctx, K, '#d9a088', '#a8462c'); ground(ctx, K, 1200, '#c8a090');
    for (let i = 0; i < 40; i++) { const x = K.X0 + ((i * 157 + a.t * 120) % K.XW), y = (i * 211 + a.t * 160) % 1900; ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(x, y, 8, 8); }
    thermo(ctx, K, 1350, 1250, 0.12, '-80°F', '#4cc9f0');
    K.prop(ctx, 'oso', 300, 1050, 0.9, a.t); ctx.strokeStyle = '#d62828'; ctx.lineWidth = 26; ctx.beginPath(); ctx.moveTo(220, 900); ctx.lineTo(380, 900); ctx.stroke();
    K.text(ctx, 'ALASKA COLD', 700, 450, { size: 100, color: '#ffffff', k: K.ph(a.t, a.d, 0.3, 0.45) });
  },
  // 57 95% carbon dioxide, no oxygen -> gráfico de quesitos: 95 % CO2 y un O2 diminuto
  57: (ctx, a, K) => {
    sky(ctx, K, '#e9a27a', '#c8603e');
    const k = K.ease.out(K.ph(a.t, a.d, 0.05, 0.6)); ctx.save(); ctx.translate(540, 820); K.C(ctx, 0, 0, 380, '#ffffff', 10);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 370, -Math.PI / 2, -Math.PI / 2 + k * 0.95 * Math.PI * 2); ctx.closePath(); ctx.fillStyle = '#7d8590'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 370, -Math.PI / 2 + 0.95 * Math.PI * 2, Math.PI * 1.5); ctx.closePath(); ctx.fillStyle = '#ffd166'; ctx.fill(); ctx.restore();
    K.text(ctx, '95% CO2', 540, 820, { size: 120, color: '#ffffff', k: K.ph(a.t, a.d, 0.4, 0.55) });
    K.text(ctx, 'O2? 0', 1500, 650, { size: 120, color: '#ff3b30', k: K.ph(a.t, a.d, 0.6, 0.75) });
  },
  // 58 Dust storms swallow the planet; strong radiation -> una tormenta de polvo cubre Marte; símbolo de radiación
  58: (ctx, a, K) => {
    space(ctx, a, K);
    planet(ctx, K, 540, 850, 380, 'mars', a.t);
    const k = K.ph(a.t, a.d, 0.05, 0.7); ctx.save(); ctx.beginPath(); ctx.arc(540, 850, 385, 0, 7); ctx.clip(); ctx.globalAlpha = 0.85; ctx.fillStyle = '#d9a088'; ctx.beginPath(); ctx.arc(540 - 380 + k * 760, 850, 300 + k * 500, 0, 7); ctx.fill(); ctx.restore();
    ctx.save(); ctx.translate(1450, 800); ctx.rotate(a.t); K.C(ctx, 0, 0, 200, '#ffd166', 10); for (let i = 0; i < 3; i++) { ctx.rotate(Math.PI * 2 / 3); ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 170, -0.5, 0.5); ctx.closePath(); ctx.fillStyle = K.INK; ctx.fill(); } K.C(ctx, 0, 0, 30, K.INK, 0); ctx.restore();
    K.text(ctx, 'WEEKS', -250, 700, { size: 120, color: '#ffffff', k: K.ph(a.t, a.d, 0.4, 0.55) });
  },
  // 59 A couple of minutes at most -> reloj de arena marciano que se vacía rápido
  59: (ctx, a, K) => {
    sky(ctx, K, '#e9a27a', '#c8603e'); ground(ctx, K, 1250, '#b5532f');
    ctx.save(); ctx.translate(540, 800); ctx.rotate(Math.sin(a.t) * 0.05); K.prop(ctx, 'reloj_arena', 0, 0, 1.5, a.t); ctx.restore();
    K.text(ctx, '~2 MIN', 1350, 750, { size: 150, color: '#ffd166', k: K.ph(a.t, a.d, 0.2, 0.35) });
    rank(ctx, K, 2, 'MARS', 1, -150, 450);
  },
  // 60 Mars, Earth's twin? Not really. One world where you'd survive -> foto de "gemelas" rota y un rayo de luz hacia un mundo misterioso
  60: (ctx, a, K) => {
    space(ctx, a, K);
    planet(ctx, K, 0, 850, 220, 'earth', a.t); planet(ctx, K, 520, 850, 200, 'mars', a.t);
    const c = K.ph(a.t, a.d, 0.15, 0.35); ctx.save(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(260, 600); ctx.lineTo(260 + 30 * c, 700 * c + 600 - 600 * c + 100); ctx.lineTo(260 - 20 * c, 1100); ctx.stroke(); ctx.restore();
    const q = K.ph(a.t, a.d, 0.5, 0.8); if (q > 0) { K.radial(ctx, 1450, 800, 300 * q, '#ffe28a', 0.6); planet(ctx, K, 1450, 800, 170 * q, 'titan', a.t); K.text(ctx, '?', 1450, 800, { size: 200, color: '#ffffff', k: q }); }
  },
  // 61 Number one: Titan, Saturn's biggest moon, 700 million miles away -> Saturno con Titán orbitando; #1 TITAN
  61: (ctx, a, K) => {
    space(ctx, a, K);
    planet(ctx, K, 200, 850, 300, 'saturn', a.t);
    const an = a.t * 0.6; planet(ctx, K, 200 + Math.cos(an) * 800, 850 + Math.sin(an) * 250, 110, 'titan', a.t);
    rank(ctx, K, 1, 'TITAN', K.ph(a.t, a.d, 0.05, 0.2), 1250, 450, '#2ec27e');
    K.text(ctx, '700,000,000 MI', 1300, 1150, { size: 90, color: '#ffffff', k: K.ph(a.t, a.d, 0.5, 0.65) });
  },
  // 62 Bigger than Mercury; thick nitrogen atmosphere like ours -> Titán junto a Mercurio (más grande) y una capa de aire alrededor
  62: (ctx, a, K) => {
    space(ctx, a, K);
    planet(ctx, K, 0, 850, 280, 'titan', a.t); ctx.save(); ctx.globalAlpha = 0.4 + 0.1 * Math.sin(a.t * 2); ctx.lineWidth = 70; ctx.strokeStyle = '#ffcf7a'; ctx.beginPath(); ctx.arc(0, 850, 330, 0, 7); ctx.stroke(); ctx.restore();
    planet(ctx, K, 700, 900, 230, 'mercury', a.t);
    K.text(ctx, '>', 360, 880, { size: 200, color: '#ffffff', k: K.ph(a.t, a.d, 0.2, 0.35) });
    K.text(ctx, 'N2 AIR', 1450, 700, { size: 140, color: '#7fd0ff', k: K.ph(a.t, a.d, 0.5, 0.65) });
  },
  // 63 Pressure 1.5x Earth's, like 15 feet down in a pool -> piscina con la persona buceando a 15 pies, tranquila
  63: (ctx, a, K) => {
    sky(ctx, K, '#7fc8f8', '#dff1ff'); K.R(ctx, -500, 600, 2000, 800, 20, '#4cc3f0', 12);
    ctx.save(); ctx.translate(540 + Math.sin(a.t) * 60, 1100); ctx.rotate(1.4); body(ctx, a, K, 0, -280, 0.12, 'happy'); ctx.restore(); bubbles(ctx, K, 540, 1000, a.t, 6);
    ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(1200, 600); ctx.lineTo(1200, 1100); ctx.stroke(); K.text(ctx, '15 FT', 1400, 850, { size: 110, color: '#ffffff' });
    K.text(ctx, 'x1.5', 0, 450, { size: 150, color: '#ffd166', k: K.ph(a.t, a.d, 0.3, 0.45) });
  },
  // 64 No boiling saliva, no swelling, no pressure suit -> tres iconos tachados con check verde
  64: (ctx, a, K) => {
    sky(ctx, K, '#f2b45a', '#c9822f');
    ['BOILING', 'SWELLING', 'PRESSURE SUIT'].forEach((t, i) => { const q = K.ph(a.t, a.d, 0.1 + i * 0.2, 0.25 + i * 0.2); const x = -250 + i * 700; K.R(ctx, x - 280, 620, 560, 300, 30, '#ffffff', 10); ctx.fillStyle = K.INK; ctx.font = '70px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(t, x, 770); if (q > 0) { ctx.save(); ctx.strokeStyle = '#ff3b30'; ctx.lineWidth = 20; ctx.beginPath(); ctx.moveTo(x - 240, 660); ctx.lineTo(x - 240 + 480 * q, 880); ctx.stroke(); ctx.restore(); } });
    K.text(ctx, 'NOT NEEDED', 540, 1150, { size: 120, color: '#2ec27e', k: K.ph(a.t, a.d, 0.75, 0.9) });
  },
  // 65 -290 °F and no oxygen: you'd need a mask -> persona tiritando en el paisaje naranja de Titán con mascarilla
  65: (ctx, a, K) => {
    sky(ctx, K, '#f2a64a', '#e07a2a'); ground(ctx, K, 1200, '#8a5a2e');
    const sh = Math.sin(a.t * 30) * 4; body(ctx, a, K, 540 + sh, 650, 0.15, 'worried');
    K.E(ctx, 540 + sh, 690, 60, 40, '#e8edf2', 0, 6);
    thermo(ctx, K, 1400, 1250, 0.1, '-290°F', '#4cc9f0');
    K.text(ctx, 'NO O2', -200, 650, { size: 120, color: '#ffffff', k: K.ph(a.t, a.d, 0.4, 0.55) });
  },
  // 66 Orange sky; rivers and lakes of methane; rain made of fuel -> lago de metano bajo cielo naranja con lluvia
  66: (ctx, a, K) => {
    sky(ctx, K, '#f08a2a', '#f2c46a'); ground(ctx, K, 1100, '#7a4e2a');
    K.E(ctx, 540, 1250, 1100, 160, '#2a3a4a', 0, 10); for (let i = 0; i < 8; i++) { const q = (a.t * 0.5 + i / 8) % 1; ctx.save(); ctx.globalAlpha = 1 - q; ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(-300 + (i * 237) % 1700, 1250, 30 + q * 80, 10 + q * 25, 0, 0, 7); ctx.stroke(); ctx.restore(); }
    for (let i = 0; i < 40; i++) { const q = (a.t * 0.8 + i / 40) % 1; ctx.strokeStyle = 'rgba(80,60,40,0.6)'; ctx.lineWidth = 4; ctx.beginPath(); const x = K.X0 + (i * 97) % K.XW; ctx.moveTo(x, q * 1200); ctx.lineTo(x - 10, q * 1200 + 40); ctx.stroke(); }
    K.text(ctx, 'METHANE LAKE', 540, 500, { size: 110, color: '#ffffff', k: K.ph(a.t, a.d, 0.3, 0.45) });
  },
  // 67 All you need: a warm coat and an oxygen mask -> la persona se pone el abrigo y la mascarilla y sonríe; check verde
  67: (ctx, a, K) => {
    sky(ctx, K, '#f2a64a', '#e07a2a'); ground(ctx, K, 1200, '#8a5a2e');
    body(ctx, a, K, 540, 650, 0.15, 'happy');
    const c = K.ease.out(K.ph(a.t, a.d, 0.1, 0.4)); ctx.save(); ctx.globalAlpha = c; K.R(ctx, 440, 730, 200, 300, 40, '#7a4a2a', 8); ctx.restore();
    const m = K.ease.out(K.ph(a.t, a.d, 0.35, 0.6)); ctx.save(); ctx.globalAlpha = m; K.E(ctx, 540, 690, 60, 40, '#e8edf2', 0, 6); ctx.restore();
    const q = K.ph(a.t, a.d, 0.65, 0.8); if (q > 0) { ctx.save(); ctx.translate(1300, 700); ctx.scale(K.ease.outBack(q), K.ease.outBack(q)); K.C(ctx, 0, 0, 200, '#2ec27e', 10); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 40; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-90, 0); ctx.lineTo(-20, 80); ctx.lineTo(100, -80); ctx.stroke(); ctx.restore(); }
  },
  // 68 Gravity 1/7 of Earth's: every step a leap -> saltos enormes a cámara lenta sobre Titán
  68: (ctx, a, K) => {
    sky(ctx, K, '#f2a64a', '#e07a2a'); ground(ctx, K, 1250, '#8a5a2e');
    const p = (a.t * 0.4) % 1, x = -400 + p * 1900, y = 1250 - Math.sin(p * Math.PI) * 650;
    ctx.save(); ctx.translate(x, y); body(ctx, a, K, 0, -560, 0.18, 'happy', { arms: 'up' }); ctx.restore();
    ctx.save(); ctx.setLineDash([20, 20]); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 8; ctx.beginPath(); for (let q = 0; q <= p; q += 0.02) { const xx = -400 + q * 1900, yy = 1250 - Math.sin(q * Math.PI) * 650 - 300; q ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke(); ctx.restore();
    K.text(ctx, '1/7 GRAVITY', 1500, 450, { size: 110, color: '#ffd166', k: K.ph(a.t, a.d, 0.1, 0.25) });
  },
  // 69 Thick air + low gravity: with wings you could fly by flapping -> alas atadas a los brazos que se abren y aletean
  69: (ctx, a, K) => {
    sky(ctx, K, '#f2a64a', '#e07a2a'); ground(ctx, K, 1350, '#8a5a2e');
    const fl = Math.sin(a.t * 6) * 0.5, up = K.ph(a.t, a.d, 0.3, 1) * 300;
    for (const sd of [-1, 1]) { ctx.save(); ctx.translate(540 + sd * 60, 800 - up); ctx.rotate(sd * (0.4 + fl)); ctx.scale(sd, 1); for (let i = 0; i < 5; i++) K.E(ctx, 170 + i * 30, 20 + i * 30, 200 - i * 20, 50, i % 2 ? '#ffffff' : '#e8edf2', 0.3, 6); ctx.restore(); }
    body(ctx, a, K, 540, 650 - up, 0.15, 'happy', { arms: 'up' });
    K.text(ctx, 'FLAP!', 1400, 600, { size: 140, color: '#ffffff', k: Math.sin(a.t * 6) > 0 ? 1 : 0.85 });
  },
  // 70 The most survivable place is the only place you could fly like a bird -> vuelas junto a pájaros sobre el lago de Titán
  70: (ctx, a, K) => {
    sky(ctx, K, '#f08a2a', '#f2c46a'); ground(ctx, K, 1300, '#7a4e2a'); K.E(ctx, 540, 1400, 1100, 120, '#2a3a4a', 0, 8);
    const x = -500 + ((a.t * 0.25) % 1) * 2200; ctx.save(); ctx.translate(x, 700 + Math.sin(a.t * 2) * 60); ctx.rotate(1.3); body(ctx, a, K, 0, -280, 0.12, 'happy', { arms: 'up' }); ctx.restore();
    for (let i = 0; i < 4; i++) K.prop(ctx, 'pajaro', x - 200 - i * 150, 600 + Math.sin(a.t * 3 + i) * 40 + i * 30, 0.4, a.t);
    K.text(ctx, 'LIKE A BIRD', 1500, 1050, { size: 100, color: '#ffffff', k: K.ph(a.t, a.d, 0.3, 0.45) });
  },
  // 71 The ranking, from vaporized to flapping -> podio con los 7 mundos ordenados del #7 al #1
  71: (ctx, a, K) => {
    space(ctx, a, K);
    ['sun', 'jupiter', 'venus', 'mercury', 'moon', 'mars', 'titan'].forEach((p, i) => { const q = K.ph(a.t, a.d, i * 0.08, 0.15 + i * 0.08); if (q <= 0) return; const x = -600 + i * 370, h = 120 + i * 80; K.R(ctx, x - 150, 1350 - h, 300, h, 14, i === 6 ? '#2ec27e' : '#3a4466', 8); planet(ctx, K, x, 1350 - h - 110, 90 * K.ease.outBack(q), p, a.t); K.text(ctx, `#${7 - i}`, x, 1350 - h / 2, { size: 70, color: '#ffffff' }); });
    K.text(ctx, 'THE RANKING', 540, 380, { size: 120, color: '#ffd166', k: K.ph(a.t, a.d, 0.6, 0.75) });
  },
  // 72 Would you go to Titan to fly, or Mars? Comments -> votación: Titán contra Marte, con un bocadillo de comentario
  72: (ctx, a, K) => {
    space(ctx, a, K);
    planet(ctx, K, 0, 850, 260, 'titan', a.t); planet(ctx, K, 1100, 850, 250, 'mars', a.t);
    K.text(ctx, 'VS', 550, 850, { size: 180, color: '#ffffff', k: K.ph(a.t, a.d, 0.1, 0.25) });
    const q = K.ph(a.t, a.d, 0.4, 0.6); if (q > 0) { ctx.save(); ctx.translate(550, 450); ctx.scale(K.ease.outBack(q), K.ease.outBack(q)); K.R(ctx, -380, -90, 760, 180, 50, '#ffffff', 10); K.P(ctx, [[-60, 85], [-20, 85], [-70, 150]], '#ffffff', 8); ctx.fillStyle = '#14152a'; ctx.font = '90px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('COMMENT!', 0, 4); ctx.restore(); }
  },
  // 73 Next video: falling into a black hole -> un agujero negro con espiral que se traga la pantalla; NEXT
  73: (ctx, a, K) => {
    space(ctx, a, K);
    for (let i = 0; i < 8; i++) { ctx.save(); ctx.translate(540, 820); ctx.rotate(a.t * (0.8 + i * 0.1) + i); ctx.strokeStyle = ['#ff8a00', '#ffd166', '#ff4fa3'][i % 3]; ctx.lineWidth = 18 - i; ctx.beginPath(); ctx.ellipse(0, 0, 560 - i * 50, 180 - i * 15, 0, 0, Math.PI * 1.3); ctx.stroke(); ctx.restore(); }
    K.C(ctx, 540, 820, 170, '#000000', 10);
    const k = K.ph(a.t, a.d, 0.3, 1); ctx.save(); ctx.translate(540 - 700 * (1 - k), 820); ctx.rotate(k * 8); ctx.scale(1 - k * 0.9, 1 - k * 0.9); body(ctx, a, K, 0, -280, 0.12, 'shocked', { arms: 'up' }); ctx.restore();
    K.text(ctx, 'NEXT VIDEO', 1500, 450, { size: 110, color: '#ffffff', k: K.ph(a.t, a.d, 0.1, 0.25) });
  },
};
