// Escenas a medida de largo-12-01: «The Girl Who Survived a 2-Mile Fall: Juliane Koepcke's True Story»
// Historia real: tono respetuoso (sin víctimas ni heridas explícitas). Personas reales dibujadas como personajes genéricos.
// Horizontal: se ve x ≈ -850…1930 e y ≈ 230…1800 (lo importante en y 350-1350).

const girl = (a, extra = {}) => ({ ...a.who, hair: 'ponytail', hairColor: '#5a3418', beard: false, mustache: false, female: true, earrings: false, outfit: '#d9dde3', ...extra });
const mom = (a) => ({ ...a.who, hair: 'bun', hairColor: '#7a4a22', beard: false, mustache: false, female: true, glasses: true, outfit: '#5b3a7a' });
function bg(ctx, K, c1, c2) { const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, c1); g.addColorStop(1, c2); ctx.fillStyle = g; ctx.fillRect(K.X0, 0, K.XW, 1920); }
function canopy(ctx, K, t, y = 300, dark = 0) { // copas de árboles de la selva a todo lo ancho
  for (let row = 0; row < 3; row++) for (let i = 0; i < 26; i++) { const x = K.X0 + (i * 131 + row * 60) % K.XW, yy = y + row * 120 + Math.sin(i * 1.7) * 30; K.C(ctx, x, yy + Math.sin(t + i) * 4, 110 + (i % 3) * 30, ['#2f7a3a', '#3f9150', '#25602e'][(i + row) % 3], 6); }
  if (dark) { ctx.fillStyle = `rgba(0,10,0,${dark})`; ctx.fillRect(K.X0, 0, K.XW, 1920); }
}
function jungle(ctx, a, K, { night = false, rain = false, river = false } = {}) {
  bg(ctx, K, night ? '#0a1a12' : '#2c5a36', night ? '#050d08' : '#1a3a22');
  for (let i = 0; i < 18; i++) { const x = K.X0 + (i * 173) % K.XW; K.R(ctx, x - 25, 200, 50, 1300, 20, night ? '#2a1e14' : '#5a3e26', 6); }
  canopy(ctx, K, a.t, 230, night ? 0.5 : 0);
  ctx.strokeStyle = night ? '#1f4a24' : '#4fa65a'; ctx.lineWidth = 10; for (let i = 0; i < 14; i++) { const x = K.X0 + (i * 211) % K.XW; ctx.beginPath(); ctx.moveTo(x, 300); ctx.quadraticCurveTo(x + 40 + Math.sin(a.t + i) * 20, 700, x + 10, 1000 + (i % 4) * 80); ctx.stroke(); }
  ctx.fillStyle = night ? '#0f2a14' : '#3d7a3a'; ctx.fillRect(K.X0, 1350, K.XW, 570);
  for (let i = 0; i < 30; i++) { const x = K.X0 + (i * 97) % K.XW; K.E(ctx, x, 1360, 90, 40, night ? '#1a3a1e' : '#4fa65a', Math.sin(i), 5); }
  if (river) { ctx.fillStyle = night ? '#1a2a3a' : '#6a7a5a'; ctx.beginPath(); ctx.moveTo(K.X0, 1420); ctx.bezierCurveTo(0, 1380, 1000, 1460, K.X0 + K.XW, 1400); ctx.lineTo(K.X0 + K.XW, 1920); ctx.lineTo(K.X0, 1920); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 5; for (let i = 0; i < 10; i++) { const x = K.X0 + ((i * 260 + a.t * 80) % K.XW); ctx.beginPath(); ctx.moveTo(x, 1500 + (i % 3) * 60); ctx.lineTo(x + 70, 1500 + (i % 3) * 60); ctx.stroke(); } }
  if (rain) { ctx.strokeStyle = 'rgba(200,220,255,0.5)'; ctx.lineWidth = 3; for (let i = 0; i < 90; i++) { const x = K.X0 + (i * 97) % K.XW, y = (i * 61 + a.t * 1400) % 1900; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 8, y + 40); ctx.stroke(); } }
}
function storm(ctx, a, K, flashAt = -1) {
  bg(ctx, K, '#1b2030', '#3a4258');
  for (let i = 0; i < 20; i++) { const x = K.X0 + (i * 171) % K.XW; K.C(ctx, x + Math.sin(a.t * 0.5 + i) * 40, 300 + (i * 97) % 500, 160 + (i % 3) * 40, ['#4a5268', '#3a4156', '#5a6278'][i % 3], 0); }
  ctx.strokeStyle = 'rgba(200,210,230,0.5)'; ctx.lineWidth = 3; for (let i = 0; i < 70; i++) { const x = K.X0 + (i * 113) % K.XW, y = (i * 67 + a.t * 1500) % 1900; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 12, y + 50); ctx.stroke(); }
  if (flashAt >= 0 && Math.abs(a.t - flashAt) < 0.25) { ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(K.X0, 0, K.XW, 1920); }
}
function electra(ctx, K, x, y, s, t, opts = {}) { // avión de hélice de los 70 (cuatro motores)
  ctx.save(); ctx.translate(x, y); ctx.rotate(opts.rot || 0); ctx.scale(s, s);
  K.R(ctx, -520, -70, 1040, 140, 70, '#e8ecf2', 10); K.P(ctx, [[480, -40], [620, -10], [480, 40]], '#e8ecf2', 9);
  K.P(ctx, [[-480, -60], [-560, -220], [-440, -220], [-380, -60]], '#c94b3a', 9);
  K.P(ctx, [[-80, 10], [140, 10], [40, 260], [-160, 260]], '#d6dbe3', 9);
  for (let i = 0; i < 9; i++) K.C(ctx, -380 + i * 90, -15, 18, '#7fb3e0', 5);
  K.R(ctx, -520, 0, 1040, 22, 8, '#c94b3a', 0);
  for (const ex of [-40, 80]) { K.R(ctx, ex - 30, 120, 60, 90, 20, '#9aa3ad', 6); ctx.save(); ctx.translate(ex, 210); ctx.rotate(t * 30); K.R(ctx, -6, -70, 12, 140, 6, '#3a3d44', 0); ctx.restore(); }
  ctx.restore();
}
function seatRow(ctx, K, x, y, s, rot, who, t, mood = 'shocked') { // fila de tres asientos con ella atada en el del medio
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  for (let i = -1; i <= 1; i++) { K.R(ctx, i * 170 - 75, -160, 150, 230, 30, '#3a6fb0', 8); K.R(ctx, i * 170 - 80, 60, 160, 60, 20, '#2f5a90', 8); }
  if (who) { ctx.save(); ctx.translate(0, -120); ctx.scale(0.35, 0.35); K.drawHead(ctx, 0, 0, who, { mood, t }); ctx.restore(); K.R(ctx, -70, -20, 140, 90, 30, who.outfit, 6); K.R(ctx, -80, 20, 160, 16, 6, '#c0c4cc', 3); }
  ctx.restore();
}
function cabin(ctx, a, K, shake = 0) {
  const [sx, sy] = shake ? [Math.sin(a.t * 37) * shake, Math.cos(a.t * 41) * shake] : [0, 0]; ctx.save(); ctx.translate(sx, sy);
  bg(ctx, K, '#e8e2d0', '#cfc6ae'); K.R(ctx, K.X0, 260, K.XW, 120, 0, '#bfb59a', 0);
  for (let i = 0; i < 9; i++) { const x = K.X0 + 200 + i * 340; K.R(ctx, x, 290, 220, 70, 10, '#a89c7e', 5); K.E(ctx, x + 110, 560, 70, 95, '#5a6a8a', 0, 8); K.E(ctx, x + 110, 560, 50, 72, shake ? '#1b2030' : '#7fc8f8', 0, 0); }
  ctx.fillStyle = '#8a7f6a'; ctx.fillRect(K.X0, 1350, K.XW, 570);
  ctx.restore(); return [sx, sy];
}
function hut(ctx, K, x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); for (let i = 0; i < 4; i++) K.R(ctx, -260 + i * 160, -40, 24, 260, 6, '#6b4a2a', 5); K.R(ctx, -280, -100, 560, 200, 10, '#a8794d', 8); K.P(ctx, [[-340, -100], [0, -320], [340, -100]], '#c9a24e', 9); ctx.strokeStyle = '#8a6a2a'; ctx.lineWidth = 6; for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.moveTo(-300 + i * 80, -100); ctx.lineTo(-20 + i * 10, -300); ctx.stroke(); } ctx.restore(); }
function canoe(ctx, K, x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(-320, -20); ctx.quadraticCurveTo(0, 90, 320, -20); ctx.lineTo(280, -50); ctx.lineTo(-280, -50); ctx.closePath(); ctx.fillStyle = '#7a4a2a'; ctx.fill(); ctx.lineWidth = 9; ctx.strokeStyle = K.INK; ctx.stroke(); ctx.restore(); }
function candy(ctx, K, x, y, s, rot, col) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); K.P(ctx, [[-90, -30], [-60, 0], [-90, 30]], col, 5); K.P(ctx, [[90, -30], [60, 0], [90, 30]], col, 5); K.E(ctx, 0, 0, 65, 40, col, 0, 6); ctx.restore(); }
function calendarDay(ctx, K, x, y, n, k = 1) { if (k <= 0) return; ctx.save(); ctx.translate(x, y); const s = K.ease.outBack(Math.min(1, k)); ctx.scale(s, s); K.R(ctx, -150, -170, 300, 340, 20, '#ffffff', 8); K.R(ctx, -150, -170, 300, 90, 20, '#d64545', 8); ctx.fillStyle = '#fff'; ctx.font = '54px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('DAY', 0, -124); ctx.fillStyle = K.INK; ctx.font = '150px Anton'; ctx.fillText(String(n), 0, 40); ctx.restore(); }
function walkGirl(ctx, a, K, x, y, s, extra = {}, mood = 'worried') { const bob = Math.abs(Math.sin(a.t * 4)) * 10; K.drawFullBody(ctx, x, y - bob, s, girl(a, extra), { mood, t: a.t }); }
function bird(ctx, K, x, y, s, t, col = '#e8505b') { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); K.E(ctx, 0, 0, 60, 34, col, 0, 6); K.C(ctx, 50, -20, 26, col, 6); K.P(ctx, [[72, -22], [100, -14], [72, -8]], '#ffd166', 4); ctx.save(); ctx.rotate(Math.sin(t * 10) * 0.6); K.E(ctx, -10, -30, 50, 18, '#4cc9f0', -0.4, 5); ctx.restore(); ctx.restore(); }

export default {
  // 0 Could you survive a two-mile fall? -> caída desde las nubes sobre la selva con regla "2 MILES"
  0: (ctx, a, K) => {
    bg(ctx, K, '#7fb8e8', '#cfe8f8'); canopy(ctx, K, a.t, 1450);
    const k = K.ph(a.t, a.d, 0, 1); seatRow(ctx, K, 540, 400 + k * 700, 0.9, a.t * 2, girl(a), a.t);
    ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 12; ctx.setLineDash([30, 20]); ctx.beginPath(); ctx.moveTo(1300, 300); ctx.lineTo(1300, 1400); ctx.stroke(); ctx.setLineDash([]);
    K.text(ctx, '2 MILES', 1550, 850, { size: 130, color: '#ffd166', k: K.ph(a.t, a.d, 0.2, 0.35) }); K.text(ctx, '?', -200, 800, { size: 260, color: '#ffffff', k: K.ph(a.t, a.d, 0.5, 0.65) });
  },
  // 1 Christmas Eve, 1971, a 17-year-old girl -> calendario 24 DIC 1971 y la chica de 17 años con un regalo
  1: (ctx, a, K) => {
    bg(ctx, K, '#1f3a5a', '#0f1f33'); for (let i = 0; i < 40; i++) K.C(ctx, K.X0 + (i * 211) % K.XW, (i * 97) % 1300, 4, ['#ffd166', '#ff4f8b', '#7fd0ff'][i % 3], 0);
    K.R(ctx, -450, 450, 520, 560, 30, '#ffffff', 10); K.R(ctx, -450, 450, 520, 140, 30, '#d64545', 10); K.text(ctx, 'DEC 1971', -190, 520, { size: 70, color: '#ffffff' }); K.text(ctx, '24', -190, 790, { size: 240, color: '#ffffff' });
    K.midShot(ctx, girl(a), { x: 700, y: 1100, s: 0.75, mood: 'happy', t: a.t, prop: 'regalo' });
    K.text(ctx, 'AGE 17', 1500, 700, { size: 120, color: '#ffd166', k: K.ph(a.t, a.d, 0.3, 0.45) });
  },
  // 2 Boarding in Lima with your mother after graduating -> pista del aeropuerto de Lima: madre e hija suben la escalerilla
  2: (ctx, a, K) => {
    bg(ctx, K, '#8fc8f0', '#e8f4ff'); ctx.fillStyle = '#7a7f88'; ctx.fillRect(K.X0, 1250, K.XW, 670);
    electra(ctx, K, 700, 900, 1.0, a.t);
    K.P(ctx, [[160, 1260], [260, 960], [320, 960], [260, 1260]], '#d6dbe3', 7);
    const k = K.ph(a.t, a.d, 0.1, 0.9); K.drawFullBody(ctx, 120 + k * 120, 830 - k * 260, 0.11, mom(a), { mood: 'happy', t: a.t }); K.drawFullBody(ctx, 30 + k * 120, 900 - k * 200, 0.11, girl(a), { mood: 'happy', t: a.t });
    K.text(ctx, 'LIMA', -350, 600, { size: 140, color: '#ffffff', k: K.ph(a.t, a.d, 0.05, 0.2) }); K.prop(ctx, 'medalla', -350, 900, 0.6, a.t);
  },
  // 3 Flight 508 packed: 92 people heading home for Christmas -> cabina llena de pasajeros con regalos; contador 92
  3: (ctx, a, K) => {
    cabin(ctx, a, K);
    for (let i = 0; i < 8; i++) { const x = -600 + i * 330; seatRow(ctx, K, x, 1100, 0.7, 0, K.personaWho('f508', { who: 'p' + i }), a.t + i, ['happy', 'neutral'][i % 2]); K.prop(ctx, 'regalo', x, 330, 0.35, a.t); }
    K.text(ctx, `${Math.round(K.ease.out(K.ph(a.t, a.d, 0.1, 0.6)) * 92)} ON BOARD`, 540, 800, { size: 130, color: '#ffffff' });
    K.text(ctx, 'FLIGHT 508', 1500, 500, { size: 100, color: '#d64545', k: K.ph(a.t, a.d, 0.05, 0.2) });
  },
  // 4 Lockheed Electra, Lima to Pucallpa, over the Andes into the Amazon -> mapa de Perú: ruta animada sobre los Andes hasta la selva
  4: (ctx, a, K) => {
    bg(ctx, K, '#7fc8e8', '#7fc8e8');
    K.P(ctx, [[-300, 300], [400, 350], [900, 500], [1300, 700], [1400, 1300], [900, 1500], [300, 1450], [-200, 1200], [-400, 700]], '#9fd38a', 9);
    for (let i = 0; i < 7; i++) K.P(ctx, [[100 + i * 90, 1100 - i * 80], [160 + i * 90, 900 - i * 80], [220 + i * 90, 1100 - i * 80]], '#a8805a', 6);
    ctx.fillStyle = '#3f9150'; ctx.beginPath(); ctx.ellipse(1000, 900, 330, 300, 0, 0, 7); ctx.fill(); K.text(ctx, 'AMAZON', 1050, 1000, { size: 70, color: '#ffffff' });
    const k = K.ease.inOut(K.ph(a.t, a.d, 0.1, 0.8)), sx = 0, sy = 1150, ex = 950, ey = 820;
    ctx.save(); ctx.strokeStyle = '#d64545'; ctx.lineWidth = 12; ctx.setLineDash([24, 16]); ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(450, 600, sx + (ex - sx) * k, sy + (ey - sy) * k); ctx.stroke(); ctx.restore();
    K.C(ctx, sx, sy, 22, '#ffffff', 6); K.text(ctx, 'LIMA', sx - 150, sy + 60, { size: 60, color: '#ffffff' }); K.C(ctx, ex, ey, 22, '#d64545', 6); K.text(ctx, 'PUCALLPA', ex + 220, ey - 40, { size: 60, color: '#ffffff', k: k > 0.95 ? 1 : 0 });
    K.text(ctx, '~1 HOUR', 1600, 450, { size: 100, color: '#ffffff', k: K.ph(a.t, a.d, 0.6, 0.75) });
  },
  // 5 Mother at the window, you in the middle seat -> fila de tres desde delante: madre en la ventana, ella en medio
  5: (ctx, a, K) => {
    cabin(ctx, a, K);
    K.midShot(ctx, mom(a), { x: 150, y: 1150, s: 0.65, mood: 'happy', t: a.t });
    K.midShot(ctx, girl(a), { x: 620, y: 1150, s: 0.65, mood: 'neutral', t: a.t + 1 });
    K.midShot(ctx, K.personaWho('f508', { who: 'vecino' }), { x: 1090, y: 1150, s: 0.65, mood: 'neutral', t: a.t + 2 });
    K.text(ctx, 'WINDOW', 150, 420, { size: 70, color: '#ffffff' }); K.text(ctx, 'MIDDLE', 620, 420, { size: 70, color: '#d64545' });
  },
  // 6 The sky turns black; the cabin shakes like a truck on gravel -> las ventanillas se oscurecen y todo tiembla
  6: (ctx, a, K) => {
    const sh = 6 + K.ph(a.t, a.d, 0, 1) * 18; cabin(ctx, a, K, sh);
    for (let i = 0; i < 6; i++) seatRow(ctx, K, -500 + i * 400 + Math.sin(a.t * 37) * sh, 1100, 0.7, Math.sin(a.t * 30 + i) * 0.05, K.personaWho('f508', { who: 'p' + i }), a.t, 'worried');
    if (Math.sin(a.t * 3) > 0.9) { ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(K.X0, 0, K.XW, 1920); }
    K.text(ctx, 'TURBULENCE', 1500, 800, { size: 110, color: '#d64545', k: K.ph(a.t, a.d, 0.2, 0.35), rot: Math.sin(a.t * 30) * 0.03 });
  },
  // 7 Bags tumble out; mother grabs your hand -> maletas cayendo de los compartimentos; dos manos se agarran
  7: (ctx, a, K) => {
    cabin(ctx, a, K, 10);
    for (let i = 0; i < 6; i++) { const q = (a.t * 0.8 + i / 6) % 1; ctx.save(); ctx.translate(-500 + i * 400, 360 + q * 800); ctx.rotate(q * 4 + i); K.R(ctx, -80, -60, 160, 120, 16, ['#7a4a2a', '#2f80ed', '#c94b3a'][i % 3], 7); ctx.restore(); }
    const k = K.ease.out(K.ph(a.t, a.d, 0.3, 0.6)); ctx.save(); ctx.translate(540, 1050); K.prop(ctx, 'mano', -200 + k * 120, 0, 1, a.t, 1.5); K.prop(ctx, 'mano', 200 - k * 120, 0, 1, a.t, -1.5); ctx.restore();
    K.text(ctx, '"THIS ISN\'T RIGHT"', 1450, 600, { size: 80, color: '#ffffff', k: K.ph(a.t, a.d, 0.55, 0.7) });
  },
  // 8 Blinding flash: lightning hits the plane -> el rayo cae sobre el ala con destello total
  8: (ctx, a, K) => {
    storm(ctx, a, K, a.d * 0.35);
    electra(ctx, K, 540, 850, 1.1, a.t, { rot: Math.sin(a.t * 3) * 0.05 });
    if (a.t > a.d * 0.3) { ctx.save(); ctx.strokeStyle = '#fff7a0'; ctx.lineWidth = 22; ctx.beginPath(); ctx.moveTo(300, 230); ctx.lineTo(380, 480); ctx.lineTo(320, 520); ctx.lineTo(440, 800); ctx.stroke(); ctx.restore(); K.starBurst(ctx, 440, 820, 160, '#ffd166', 1); }
    K.text(ctx, 'SNAP', 1500, 600, { size: 160, color: '#ffffff', k: K.ph(a.t, a.d, 0.45, 0.6) });
  },
  // 9 The aircraft breaks apart two miles up; hands slip -> el avión se parte en dos y los asientos salen volando
  9: (ctx, a, K) => {
    storm(ctx, a, K);
    const k = K.ease.out(K.ph(a.t, a.d, 0.05, 0.8));
    ctx.save(); ctx.translate(-k * 400, k * 150); ctx.rotate(-k * 0.4); electra(ctx, K, 300, 820, 0.9, a.t); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(540, 0, 2000, 1920); ctx.clip(); ctx.translate(k * 400, k * 300); ctx.rotate(k * 0.5); electra(ctx, K, 540, 820, 0.9, a.t); ctx.restore();
    for (let i = 0; i < 6; i++) { ctx.save(); ctx.translate(540 + Math.cos(i) * 600 * k, 820 + Math.sin(i * 1.7) * 400 * k); ctx.rotate(a.t * 3 + i); K.R(ctx, -40, -30, 80, 60, 10, ['#3a6fb0', '#7a4a2a', '#c94b3a'][i % 3], 6); ctx.restore(); }
  },
  // 10 Ten thousand feet, no parachute, no oxygen, no plan -> altímetro 10,000 FT y tres iconos tachados
  10: (ctx, a, K) => {
    bg(ctx, K, '#3a4258', '#6a7a98');
    K.R(ctx, -400, 480, 760, 260, 40, '#14152a', 10); K.text(ctx, '10,000 FT', -20, 610, { size: 140, color: '#ffd166' });
    ['PARACHUTE', 'OXYGEN', 'PLAN'].forEach((t, i) => { const x = 700 + i * 450, q = K.ph(a.t, a.d, 0.2 + i * 0.15, 0.3 + i * 0.15); K.R(ctx, x - 200, 850, 400, 200, 30, '#ffffff', 8); ctx.fillStyle = K.INK; ctx.font = '64px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(t, x, 950); if (q > 0) { ctx.save(); ctx.strokeStyle = '#ff3b30'; ctx.lineWidth = 18; ctx.beginPath(); ctx.moveTo(x - 180, 870); ctx.lineTo(x - 180 + 360 * q, 1030); ctx.stroke(); ctx.restore(); } });
  },
  // 11 Outside, strapped into the seats, spinning through the storm -> la fila de asientos gira entre nubes y lluvia
  11: (ctx, a, K) => {
    storm(ctx, a, K);
    seatRow(ctx, K, 540 + Math.sin(a.t) * 200, 800, 1.1, a.t * 3, girl(a), a.t);
    K.speedLines(ctx, 540, 800, a.t, 0.5);
    K.text(ctx, 'SPINNING', 1500, 1100, { size: 110, color: '#ffffff', k: K.ph(a.t, a.d, 0.3, 0.45) });
  },
  // 12 How does anyone live through that? A few things go right -> tres casillas vacías que se marcan: 1, 2, 3
  12: (ctx, a, K) => {
    bg(ctx, K, '#14152a', '#1f2547');
    K.text(ctx, 'HOW?', 540, 450, { size: 180, color: '#ffd166', k: K.ph(a.t, a.d, 0, 0.15) });
    for (let i = 0; i < 3; i++) { const x = 0 + i * 540, q = K.ph(a.t, a.d, 0.3 + i * 0.15, 0.4 + i * 0.15); K.R(ctx, x - 160, 750, 320, 320, 40, '#ffffff', 10); K.text(ctx, String(i + 1), x, 910, { size: 160, color: '#ffffff' }); if (q > 0) { ctx.save(); ctx.strokeStyle = '#2ec27e'; ctx.lineWidth = 30; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x + 60, 1050); ctx.lineTo(x + 110, 1100); ctx.lineTo(x + 110 + 120 * q, 980); ctx.stroke(); ctx.restore(); } }
  },
  // 13 A row of three can spin like a helicopter blade, slowing the fall -> los asientos giran como un rotor y bajan más despacio
  13: (ctx, a, K) => {
    bg(ctx, K, '#7fb8e8', '#cfe8f8');
    ctx.save(); ctx.translate(540, 820); ctx.scale(1, 0.35); ctx.rotate(a.t * 8); seatRow(ctx, K, 0, 0, 1.2, 0, null, a.t); ctx.restore();
    K.prop(ctx, 'helicoptero', 1450, 700, 0.9, a.t);
    for (let i = 0; i < 3; i++) { ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(540, 820, 300 + i * 60, a.t * 4 + i, a.t * 4 + i + 1.2); ctx.stroke(); ctx.restore(); }
    K.text(ctx, 'SLOWER', -250, 820, { size: 130, color: '#ffffff', k: K.ph(a.t, a.d, 0.4, 0.55) });
  },
  // 14 Storm updrafts may have cushioned her, like an invisible hand -> flechas de corriente ascendente y una mano gigante transparente debajo
  14: (ctx, a, K) => {
    storm(ctx, a, K);
    for (let i = 0; i < 8; i++) { const q = (a.t * 0.8 + i / 8) % 1; const x = -400 + i * 320; ctx.save(); ctx.globalAlpha = 1 - q; K.P(ctx, [[x - 40, 1300 - q * 900], [x + 40, 1300 - q * 900], [x, 1220 - q * 900]], '#7fd0ff', 5); ctx.fillStyle = '#7fd0ff'; ctx.fillRect(x - 12, 1300 - q * 900, 24, 120); ctx.restore(); }
    ctx.save(); ctx.globalAlpha = 0.35; K.prop(ctx, 'mano', 540, 1150, 2.2, a.t, Math.PI); ctx.restore();
    seatRow(ctx, K, 540, 650 + Math.sin(a.t * 2) * 30, 0.8, Math.sin(a.t) * 0.3, girl(a), a.t);
    K.text(ctx, 'UPDRAFT', 1500, 500, { size: 110, color: '#ffffff', k: K.ph(a.t, a.d, 0.2, 0.35) });
  },
  // 15 The springy canopy works like a giant net -> las copas se doblan como una red elástica
  15: (ctx, a, K) => {
    bg(ctx, K, '#7fb8e8', '#cfe8f8');
    const b = Math.sin(a.t * 6) * 40 * (1 - K.ph(a.t, a.d, 0.3, 1));
    for (let i = 0; i < 26; i++) { const x = K.X0 + (i * 131) % K.XW, dx = Math.abs(x - 540), dip = Math.max(0, 1 - dx / 700) * (80 + b); K.C(ctx, x, 1100 + dip, 140, ['#2f7a3a', '#3f9150', '#25602e'][i % 3], 6); }
    ctx.save(); ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 6; for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.moveTo(-400 + i * 180, 1000); ctx.quadraticCurveTo(540, 1150 + b, 1500 - i * 80, 1000); ctx.stroke(); } ctx.restore();
    seatRow(ctx, K, 540, 950 + b, 0.7, 0.2, girl(a), a.t);
    K.text(ctx, 'NATURE\'S NET', 1500, 500, { size: 110, color: '#ffffff', k: K.ph(a.t, a.d, 0.3, 0.45) });
  },
  // 16 Crash through the branches; everything goes black -> ramas que se rompen y fundido a negro
  16: (ctx, a, K) => {
    jungle(ctx, a, K);
    const k = K.ph(a.t, a.d, 0, 0.5); seatRow(ctx, K, 540, 300 + k * 900, 0.8, k * 2, girl(a), a.t);
    for (let i = 0; i < 10; i++) { const q = K.ph(a.t, a.d, 0.1 + i * 0.03, 0.6); ctx.save(); ctx.translate(540 + Math.cos(i) * 500 * q, 500 + i * 60 + q * 300); ctx.rotate(i + q * 4); K.R(ctx, -60, -8, 120, 16, 6, '#5a3e26', 4); ctx.restore(); }
    ctx.fillStyle = `rgba(0,0,0,${K.ph(a.t, a.d, 0.5, 0.9)})`; ctx.fillRect(K.X0, 0, K.XW, 1920);
  },
  // 17 Survived something that killed 91 others; nightmare beginning -> una sola luz encendida entre 92 apagadas
  17: (ctx, a, K) => {
    bg(ctx, K, '#0a0d1a', '#14152a');
    const k = K.ph(a.t, a.d, 0.1, 0.7);
    for (let i = 0; i < 92; i++) { const x = -500 + (i % 23) * 90, y = 520 + Math.floor(i / 23) * 160; const on = i === 45 || (i / 92) > k; K.C(ctx, x, y, 26, on ? (i === 45 ? '#ffd166' : '#5a6070') : '#1b1e2e', 4); }
    K.text(ctx, '1 OF 92', 540, 1300, { size: 150, color: '#ffd166', k: K.ph(a.t, a.d, 0.6, 0.75) });
  },
  // 18 Wakes up the next day, still strapped in; rain drips -> abre los ojos bajo la lluvia, atada al asiento entre helechos
  18: (ctx, a, K) => {
    jungle(ctx, a, K, { rain: true });
    seatRow(ctx, K, 540, 1150, 1.1, 0.15, girl(a), a.t, a.t < a.d * 0.4 ? 'sad' : 'worried');
    for (let i = 0; i < 6; i++) { const q = (a.t * 0.9 + i / 6) % 1; K.E(ctx, 300 + i * 90, 700 + q * 400, 10, 16, '#bfe9ff', 0, 3); }
    K.text(ctx, 'NEXT DAY', 1500, 600, { size: 110, color: '#ffffff', k: K.ph(a.t, a.d, 0.05, 0.2) });
  },
  // 19 Broken collarbone, swollen eye, cut leg, no glasses, one sandal -> ficha de "daños" con iconos que aparecen uno a uno
  19: (ctx, a, K) => {
    jungle(ctx, a, K);
    K.drawFullBody(ctx, 100, 600, 0.17, girl(a, { glasses: false }), { mood: 'sad', t: a.t });
    const items = ['COLLARBONE', 'EYE', 'LEG CUT', 'NO GLASSES', '1 SANDAL']; items.forEach((t, i) => { const q = K.ph(a.t, a.d, 0.1 + i * 0.14, 0.2 + i * 0.14); if (q <= 0) return; ctx.save(); ctx.translate(900 + (i % 2) * 520, 480 + i * 170); ctx.scale(K.ease.outBack(q), K.ease.outBack(q)); K.R(ctx, -240, -60, 480, 120, 30, '#ffffff', 8); ctx.fillStyle = '#d64545'; ctx.font = '60px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(t, 0, 4); ctx.restore(); });
  },
  // 20 Calls for her mother; only birds and insects answer -> grita "MOM?" y responden pájaros e insectos con bocadillos
  20: (ctx, a, K) => {
    jungle(ctx, a, K);
    K.midShot(ctx, girl(a, { glasses: false }), { x: 400, y: 1150, s: 0.75, mood: 'sad', t: a.t });
    K.text(ctx, 'MOM?', 400, 450, { size: 150, color: '#ffffff', k: K.ph(a.t, a.d, 0.05, 0.2) });
    bird(ctx, K, 1100, 500, 1, a.t); bird(ctx, K, 1500, 700, 0.8, a.t + 1, '#ffd166');
    ['CAW!', 'BZZZ', 'CHIRP'].forEach((t, i) => K.text(ctx, t, 1000 + i * 300, 900 + (i % 2) * 120, { size: 80, color: '#ffd166', k: K.ph(a.t, a.d, 0.35 + i * 0.12, 0.45 + i * 0.12), rot: (i - 1) * 0.15 }));
  },
  // 21 Searches for her a while; nothing -> camina apartando hojas, con un camino de huellas que se pierde
  21: (ctx, a, K) => {
    jungle(ctx, a, K);
    const x = -300 + K.ph(a.t, a.d, 0, 1) * 1200; walkGirl(ctx, a, K, x, 640, 0.16, { glasses: false });
    for (let i = 0; i < 8; i++) { const fx = -500 + i * 140; if (fx < x - 100) K.E(ctx, fx, 1420 + (i % 2) * 30, 22, 12, '#2a4a24', 0, 0); }
    K.text(ctx, 'NOTHING', 1550, 600, { size: 110, color: '#ffffff', k: K.ph(a.t, a.d, 0.6, 0.75) });
  },
  // 22 Her name is Juliane Koepcke; her parents' work saved her -> nombre que aparece como en un expediente
  22: (ctx, a, K) => {
    jungle(ctx, a, K); ctx.fillStyle = 'rgba(10,20,10,0.55)'; ctx.fillRect(K.X0, 0, K.XW, 1920);
    K.midShot(ctx, girl(a), { x: 200, y: 1150, s: 0.8, mood: 'neutral', t: a.t });
    const q = K.ph(a.t, a.d, 0.1, 0.3); ctx.save(); ctx.translate(1200 + (1 - K.ease.out(q)) * 900, 800); K.R(ctx, -450, -160, 900, 320, 30, '#fbf6e8', 10); ctx.fillStyle = K.INK; ctx.font = '90px Anton'; ctx.textAlign = 'center'; ctx.fillText('JULIANE KOEPCKE', 0, -20); ctx.font = '50px Poppins'; ctx.fillText('17 · Peru, 1971', 0, 80); ctx.restore();
  },
  // 23 Mother an ornithologist, father a zoologist -> los padres en su estudio: ella con prismáticos y un pájaro, él con una mariposa
  23: (ctx, a, K) => {
    jungle(ctx, a, K);
    K.midShot(ctx, mom(a), { x: 150, y: 1150, s: 0.7, mood: 'happy', t: a.t }); bird(ctx, K, 150, 520, 0.9, a.t);
    K.midShot(ctx, K.personaWho('koepcke', { who: 'padre' }), { x: 1000, y: 1150, s: 0.7, mood: 'happy', t: a.t + 1 }); K.prop(ctx, 'lupa', 1250, 750, 0.5, a.t);
    K.text(ctx, 'BIRDS', 150, 400, { size: 90, color: '#ffd166', k: K.ph(a.t, a.d, 0.15, 0.3) }); K.text(ctx, 'ANIMALS', 1000, 400, { size: 90, color: '#ffd166', k: K.ph(a.t, a.d, 0.35, 0.5) });
  },
  // 24 She spent time at their research station deep in the jungle -> la casita de investigación con libretas, ella aprendiendo
  24: (ctx, a, K) => {
    jungle(ctx, a, K, { river: true });
    hut(ctx, K, 300, 1150, 1.3);
    K.drawFullBody(ctx, 900, 700, 0.15, girl(a, { outfit: '#4a7fb0' }), { mood: 'happy', t: a.t }); K.prop(ctx, 'carta', 1050, 1000, 0.5, a.t);
    bird(ctx, K, 1400 + Math.sin(a.t) * 60, 450, 0.7, a.t, '#2ec27e');
    K.text(ctx, 'RESEARCH STATION', 600, 400, { size: 90, color: '#ffffff', k: K.ph(a.t, a.d, 0.1, 0.25) });
  },
  // 25 Prepared, but preparation can't fix a broken collarbone -> balanza: "SKILLS" contra un hueso roto
  25: (ctx, a, K) => {
    jungle(ctx, a, K); ctx.fillStyle = 'rgba(10,20,10,0.45)'; ctx.fillRect(K.X0, 0, K.XW, 1920);
    const tl = Math.sin(a.t * 1.5) * 0.12; ctx.save(); ctx.translate(540, 700); ctx.rotate(tl); K.R(ctx, -600, -12, 1200, 24, 10, '#c9a24e', 6);
    K.R(ctx, -700, 0, 200, 120, 20, '#2ec27e', 8); ctx.fillStyle = '#fff'; ctx.font = '50px Anton'; ctx.textAlign = 'center'; ctx.fillText('SKILLS', -600, 80);
    ctx.save(); ctx.translate(600, 60); K.prop(ctx, 'hueso', 0, 0, 0.7, a.t); ctx.restore(); ctx.restore();
    K.P(ctx, [[540, 700], [480, 1100], [600, 1100]], '#8a6a2a', 8);
  },
  // 26 Father's advice: water leads somewhere; stream becomes a river -> recuerdo en burbuja: arroyito que crece hasta un río
  26: (ctx, a, K) => {
    jungle(ctx, a, K);
    K.midShot(ctx, girl(a, { glasses: false }), { x: 150, y: 1200, s: 0.7, mood: 'neutral', t: a.t });
    ctx.save(); ctx.translate(1000, 750); K.E(ctx, 0, 0, 650, 380, '#fbf6e8', 0, 10); const k = K.ph(a.t, a.d, 0.15, 0.85);
    ctx.strokeStyle = '#4cc3f0'; ctx.lineCap = 'round'; for (let i = 0; i < 20; i++) { const q = i / 20; if (q > k) break; ctx.lineWidth = 6 + q * 70; ctx.beginPath(); ctx.moveTo(-520 + q * 1040, Math.sin(q * 8) * 120); ctx.lineTo(-520 + (q + 0.05) * 1040, Math.sin((q + 0.05) * 8) * 120); ctx.stroke(); } ctx.restore();
    K.text(ctx, 'FOLLOW THE WATER', 1000, 360, { size: 90, color: '#ffd166', k: K.ph(a.t, a.d, 0.3, 0.45) });
  },
  // 27 Finds a tiny creek and wades downstream, feeling ahead with her feet -> camina por el arroyo con el agua por las rodillas
  27: (ctx, a, K) => {
    jungle(ctx, a, K, { river: true });
    const x = -200 + K.ph(a.t, a.d, 0, 1) * 1100; walkGirl(ctx, a, K, x, 950, 0.18, { glasses: false });
    ctx.fillStyle = 'rgba(106,122,90,0.85)'; ctx.fillRect(K.X0, 1420, K.XW, 500);
    for (let i = 0; i < 3; i++) { const q = (a.t * 0.8 + i / 3) % 1; ctx.save(); ctx.globalAlpha = 1 - q; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(x, 1440, 60 + q * 160, 14 + q * 30, 0, 0, 7); ctx.stroke(); ctx.restore(); }
    K.text(ctx, 'DOWNSTREAM →', 1500, 600, { size: 90, color: '#ffffff', k: K.ph(a.t, a.d, 0.2, 0.35) });
  },
  // 28 Stingrays and snakes hide in murky water; shuffling warns them -> vista bajo el agua: pie arrastrándose y raya y serpiente que se apartan
  28: (ctx, a, K) => {
    bg(ctx, K, '#5a6a4a', '#2a3424');
    const sx = 300 + Math.sin(a.t * 2) * 80; K.R(ctx, sx - 60, 300, 120, 600, 50, '#e0b088', 8); K.E(ctx, sx + 30, 920, 110, 50, '#e0b088', 0, 8);
    const k = K.ph(a.t, a.d, 0.2, 0.8);
    ctx.save(); ctx.translate(800 + k * 600, 1100); K.E(ctx, 0, 0, 200, 110, '#8a7a5a', 0, 8); K.L(ctx, [[-200, 0], [-380, 30]], '#8a7a5a', 12); K.C(ctx, 60, -20, 10, K.INK, 0); ctx.restore();
    ctx.save(); ctx.translate(-200 - k * 500, 700); K.prop(ctx, 'serpiente', 0, 0, 0.8, a.t); ctx.restore();
    K.text(ctx, 'SHUFFLE!', 540, 450, { size: 130, color: '#ffd166', k: K.ph(a.t, a.d, 0.1, 0.25) });
  },
  // 29 Night falls; frogs, insects; curls up by a fallen tree -> de noche junto a un tronco caído, ojos brillando en la oscuridad
  29: (ctx, a, K) => {
    jungle(ctx, a, K, { night: true });
    K.R(ctx, -300, 1180, 1300, 160, 80, '#3a2a1a', 10);
    ctx.save(); ctx.translate(700, 1150); ctx.scale(0.4, 0.4); K.drawHead(ctx, 0, 0, girl(a, { glasses: false }), { mood: 'sad', t: a.t }); ctx.restore();
    for (let i = 0; i < 6; i++) { const on = Math.sin(a.t * 2 + i * 1.7) > 0.3; if (on) { K.C(ctx, -400 + i * 380, 700 + (i % 2) * 150, 10, '#d6ff6a', 0); K.C(ctx, -370 + i * 380, 700 + (i % 2) * 150, 10, '#d6ff6a', 0); } }
    K.text(ctx, 'RIBBIT', 1450, 900, { size: 70, color: '#7fd06a', k: Math.sin(a.t * 3) > 0 ? 1 : 0 });
  },
  // 30 Search planes circling overhead; she waves and screams -> avioneta sobre las copas; ella agita los brazos abajo
  30: (ctx, a, K) => {
    bg(ctx, K, '#8fc8f0', '#dff1ff');
    const px = -500 + ((a.t * 0.3) % 1) * 2300; K.prop(ctx, 'avion', px, 380, 0.7, a.t);
    canopy(ctx, K, a.t, 700);
    ctx.fillStyle = '#1a3a22'; ctx.fillRect(K.X0, 1000, K.XW, 920);
    K.drawFullBody(ctx, 540, 1000, 0.13, girl(a, { glasses: false }), { mood: 'shocked', t: a.t, arms: 'up' });
    K.text(ctx, 'HERE!', 900, 1150, { size: 110, color: '#ffffff', k: K.ph(a.t, a.d, 0.2, 0.35) });
  },
  // 31 The canopy that saved her now hides her -> vista desde el avión: solo verde; un círculo muestra dónde está, invisible
  31: (ctx, a, K) => {
    bg(ctx, K, '#3f9150', '#2f7a3a');
    for (let i = 0; i < 90; i++) K.C(ctx, K.X0 + (i * 151) % K.XW, 300 + (i * 89) % 1400, 70 + (i % 3) * 20, ['#2f7a3a', '#3f9150', '#25602e', '#4fa65a'][i % 4], 5);
    const k = K.ph(a.t, a.d, 0.3, 0.6); if (k > 0) { ctx.save(); ctx.setLineDash([24, 16]); ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(540, 850, 160, 0, Math.PI * 2 * k); ctx.stroke(); ctx.restore(); }
    K.text(ctx, 'SHE IS HERE', 540, 1100, { size: 90, color: '#ffffff', k: K.ph(a.t, a.d, 0.5, 0.65) }); K.text(ctx, 'INVISIBLE', 1500, 500, { size: 100, color: '#ff8a65', k: K.ph(a.t, a.d, 0.65, 0.8) });
  },
  // 32 The next problem: food -> un plato vacío que gira y un estómago que ruge
  32: (ctx, a, K) => {
    jungle(ctx, a, K); ctx.fillStyle = 'rgba(10,20,10,0.4)'; ctx.fillRect(K.X0, 0, K.XW, 1920);
    ctx.save(); ctx.translate(300, 850); ctx.rotate(a.t); K.C(ctx, 0, 0, 260, '#ffffff', 10); K.C(ctx, 0, 0, 180, '#eef1f5', 4); ctx.restore();
    const g = 1 + Math.max(0, Math.sin(a.t * 8)) * 0.1; ctx.save(); ctx.translate(1100, 850); ctx.scale(g, g); K.prop(ctx, 'estomago', 0, 0, 1.2, a.t); ctx.restore();
    K.text(ctx, 'GRRR', 1500, 500, { size: 120, color: '#ffd166', k: Math.sin(a.t * 8) > 0 ? 1 : 0.8 });
  },
  // 33 What do you eat when nothing is safe? -> frutas con signos de interrogación y calaveras alternándose
  33: (ctx, a, K) => {
    jungle(ctx, a, K);
    for (let i = 0; i < 6; i++) { const x = -450 + i * 380, y = 650 + (i % 2) * 220; K.C(ctx, x, y, 80, ['#ff6b4a', '#ffd166', '#b84ad6', '#4ad66b', '#ff9f1c', '#e8505b'][i], 8); const bad = Math.sin(a.t * 2 + i * 1.3) > 0; if (bad) K.prop(ctx, 'calavera', x, y - 160, 0.35, a.t); else K.text(ctx, '?', x, y - 150, { size: 90, color: '#ffd166' }); }
    K.text(ctx, 'SAFE?', 540, 1200, { size: 150, color: '#ffffff', k: K.ph(a.t, a.d, 0.3, 0.45) });
  },
  // 34 One small bag of candy: her entire food supply -> la bolsita de caramelos sola sobre una hoja gigante
  34: (ctx, a, K) => {
    jungle(ctx, a, K);
    K.E(ctx, 540, 1000, 600, 200, '#4fa65a', 0.05, 10);
    ctx.save(); ctx.translate(540, 820 + Math.sin(a.t * 2) * 10); K.P(ctx, [[-160, -200], [160, -200], [200, 180], [-200, 180]], '#f2e6d0', 10); K.text(ctx, 'CANDY', 0, 20, { size: 80, color: '#d64545' }); ctx.restore();
    for (let i = 0; i < 4; i++) candy(ctx, K, 200 + i * 220, 1020, 0.8, i * 0.4, ['#ff4f8b', '#ffd166', '#7fd0ff', '#2ec27e'][i]);
    K.text(ctx, 'THAT\'S ALL', 1550, 600, { size: 100, color: '#ffffff', k: K.ph(a.t, a.d, 0.5, 0.65) });
  },
  // 35 Nibbles one piece at a time; sugar doesn't last -> barra de energía que sube con cada caramelo y baja enseguida
  35: (ctx, a, K) => {
    jungle(ctx, a, K);
    K.midShot(ctx, girl(a, { glasses: false }), { x: 300, y: 1150, s: 0.75, mood: 'neutral', t: a.t, prop: 'chocolate' });
    const e = 0.3 + 0.5 * Math.max(0, Math.sin(a.t * 1.5)) * (1 - K.ph(a.t, a.d, 0, 1) * 0.5);
    K.R(ctx, 1100, 500, 180, 700, 30, '#ffffff', 10); K.R(ctx, 1115, 515 + 670 * (1 - e), 150, 670 * e, 20, e < 0.35 ? '#ff3b30' : '#2ec27e', 0); K.text(ctx, 'ENERGY', 1190, 1290, { size: 70, color: '#ffffff' });
  },
  // 36 Fruit hangs all around, but she touches none -> la mano se acerca a una fruta y se retira
  36: (ctx, a, K) => {
    jungle(ctx, a, K);
    for (let i = 0; i < 8; i++) { const x = -500 + i * 300; K.L(ctx, [[x, 230], [x, 560]], '#3f6a2a', 6); K.C(ctx, x, 600 + Math.sin(a.t * 2 + i) * 10, 60, ['#ff6b4a', '#ffd166', '#b84ad6', '#ff9f1c'][i % 4], 7); }
    const r = Math.sin(K.ph(a.t, a.d, 0.1, 0.9) * Math.PI); K.prop(ctx, 'mano', 540, 1300 - r * 500, 1.2, a.t, 0);
    K.text(ctx, 'NO.', 1500, 1000, { size: 150, color: '#ff3b30', k: K.ph(a.t, a.d, 0.6, 0.75) });
  },
  // 37 Many Amazon plants are toxic: cramps, vomiting, worse -> cartel de veneno con hojas y bayas marcadas
  37: (ctx, a, K) => {
    jungle(ctx, a, K); ctx.fillStyle = 'rgba(40,0,60,0.35)'; ctx.fillRect(K.X0, 0, K.XW, 1920);
    ctx.save(); ctx.translate(540, 800); ctx.rotate(Math.sin(a.t * 2) * 0.05); K.P(ctx, [[0, -300], [300, 220], [-300, 220]], '#ffd166', 12); K.text(ctx, '!', 0, 60, { size: 260, color: '#ffffff' }); ctx.restore();
    for (let i = 0; i < 4; i++) { const x = i < 2 ? -300 - i * 250 : 1400 + (i - 2) * 250; K.C(ctx, x, 800, 60, '#b84ad6', 8); K.prop(ctx, 'calavera', x, 640, 0.3, a.t); }
    K.text(ctx, 'TOXIC', 540, 1250, { size: 140, color: '#b84ad6', k: K.ph(a.t, a.d, 0.3, 0.45) });
  },
  // 38 Without glasses: snake or floating log? -> imagen borrosa del río: una silueta que cambia entre serpiente y tronco
  38: (ctx, a, K) => {
    ctx.save(); ctx.filter = 'blur(10px)'; jungle(ctx, a, K, { river: true }); ctx.restore();
    const m = (Math.sin(a.t * 2) + 1) / 2; ctx.save(); ctx.filter = 'blur(6px)';
    ctx.globalAlpha = m; K.prop(ctx, 'serpiente', 540, 1450, 1.2, a.t); ctx.globalAlpha = 1 - m; K.R(ctx, 300, 1420, 500, 70, 35, '#5a3e26', 8); ctx.restore();
    K.text(ctx, 'SNAKE?', 200, 700, { size: 110, color: '#ffffff', k: m }); K.text(ctx, 'LOG?', 1100, 700, { size: 110, color: '#ffffff', k: 1 - m });
  },
  // 39 Cold, wet nights, sleeping sitting up hugging her knees -> se abraza las rodillas mientras la lluvia cae y la luna asoma
  39: (ctx, a, K) => {
    jungle(ctx, a, K, { night: true, rain: true });
    K.C(ctx, 1500, 420, 90, '#fff7d0', 6);
    const sh = Math.sin(a.t * 25) * 3; ctx.save(); ctx.translate(540 + sh, 1100); K.E(ctx, 0, 120, 200, 140, '#d9dde3', 0, 8); ctx.scale(0.45, 0.45); K.drawHead(ctx, 0, -120, girl(a, { glasses: false }), { mood: 'sad', t: a.t, closed: true }); ctx.restore();
    K.text(ctx, 'COLD', -200, 700, { size: 120, color: '#7fd0ff', k: K.ph(a.t, a.d, 0.2, 0.35) });
  },
  // 40 No phone, no map, no lighter: just a lesson and her legs -> tres objetos tachados y unas piernas que siguen caminando
  40: (ctx, a, K) => {
    jungle(ctx, a, K);
    ['telefono_antiguo', 'carta', 'fuego'].forEach((p, i) => { const x = -400 + i * 400, q = K.ph(a.t, a.d, 0.1 + i * 0.15, 0.2 + i * 0.15); K.prop(ctx, p, x, 650, 0.7, a.t); if (q > 0) { ctx.save(); ctx.strokeStyle = '#ff3b30'; ctx.lineWidth = 20; ctx.beginPath(); ctx.moveTo(x - 130, 520); ctx.lineTo(x - 130 + 260 * q, 780); ctx.stroke(); ctx.restore(); } });
    walkGirl(ctx, a, K, 1300 + Math.sin(a.t) * 40, 640, 0.16, { glasses: false });
    K.text(ctx, 'KEEP WALKING', 1300, 400, { size: 90, color: '#ffd166', k: K.ph(a.t, a.d, 0.6, 0.75) });
  },
  // 41 Days blur; wades, rests, wades; something wrong with her arm -> collage de días que pasan rápido y un brazo con un "!"
  41: (ctx, a, K) => {
    jungle(ctx, a, K, { river: true });
    const d = 2 + Math.floor(K.ph(a.t, a.d, 0, 0.7) * 3); calendarDay(ctx, K, -300, 750, d);
    walkGirl(ctx, a, K, 540, 900, 0.18, { glasses: false });
    K.text(ctx, '!', 900, 900, { size: 220, color: '#ff3b30', k: K.ph(a.t, a.d, 0.75, 0.85) });
    ctx.fillStyle = `rgba(255,255,255,${0.15 * Math.abs(Math.sin(a.t * 3))})`; ctx.fillRect(K.X0, 0, K.XW, 1920);
  },
  // 42 Day five: an infection, and this one is alive -> microscopio con microbios que se mueven; DAY 5
  42: (ctx, a, K) => {
    bg(ctx, K, '#1a2a1a', '#0f1a0f');
    calendarDay(ctx, K, -300, 750, 5);
    ctx.save(); ctx.translate(700, 820); K.C(ctx, 0, 0, 380, '#e8f4e0', 12); ctx.beginPath(); ctx.arc(0, 0, 370, 0, 7); ctx.clip(); for (let i = 0; i < 10; i++) K.prop(ctx, 'bacteria', Math.cos(i * 2 + a.t) * 200, Math.sin(i * 1.3 + a.t * 0.7) * 200, 0.35, a.t); ctx.restore();
    K.text(ctx, 'INFECTION', 1500, 600, { size: 110, color: '#ff8a65', k: K.ph(a.t, a.d, 0.3, 0.45) });
  },
  // 43 Flies laid eggs in the wound -> una mosca ronda el brazo vendado (sin mostrar la herida)
  43: (ctx, a, K) => {
    jungle(ctx, a, K);
    ctx.save(); ctx.translate(540, 900); ctx.rotate(-0.2); K.R(ctx, -500, -90, 1000, 180, 90, '#e0b088', 10); K.R(ctx, -120, -100, 240, 200, 30, '#f2e6d0', 8); ctx.restore();
    const fx = 540 + Math.cos(a.t * 3) * 300, fy = 650 + Math.sin(a.t * 5) * 120; ctx.save(); ctx.translate(fx, fy); K.E(ctx, 0, 0, 40, 26, '#22232b', 0, 4); ctx.globalAlpha = 0.6; K.E(ctx, -10, -26, 30, 16, '#bfe3ff', -0.4, 3); K.E(ctx, 14, -26, 30, 16, '#bfe3ff', 0.4, 3); ctx.restore();
    K.text(ctx, 'BZZZ', fx + 120, fy - 60, { size: 70, color: '#ffffff' });
  },
  // 44 She can only feel it: something wriggles under her skin -> el vendaje se mueve con pequeñas ondas y ella hace una mueca
  44: (ctx, a, K) => {
    jungle(ctx, a, K); ctx.fillStyle = 'rgba(10,20,10,0.4)'; ctx.fillRect(K.X0, 0, K.XW, 1920);
    K.midShot(ctx, girl(a, { glasses: false }), { x: 300, y: 1150, s: 0.75, mood: 'worried', t: a.t });
    ctx.save(); ctx.translate(1100, 850); K.R(ctx, -300, -90, 600, 180, 90, '#e0b088', 10); K.R(ctx, -120, -100, 240, 200, 30, '#f2e6d0', 8); ctx.strokeStyle = '#c9b89a'; ctx.lineWidth = 5; for (let i = 0; i < 4; i++) { ctx.beginPath(); for (let x = -100; x <= 100; x += 10) { const y = -60 + i * 40 + Math.sin(x / 15 + a.t * 8 + i) * 6; x === -100 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); } ctx.restore();
    K.text(ctx, 'ITCH...', 1100, 550, { size: 100, color: '#ffd166', k: K.ph(a.t, a.d, 0.2, 0.35) });
  },
  // 45 No tweezers, no medicine, no doctor -> botiquín vacío que se abre y no tiene nada
  45: (ctx, a, K) => {
    jungle(ctx, a, K);
    const o = K.ease.out(K.ph(a.t, a.d, 0.1, 0.4)); ctx.save(); ctx.translate(540, 900); K.R(ctx, -350, -200, 700, 400, 30, '#ffffff', 10); ctx.save(); ctx.translate(0, -200); ctx.rotate(-o * 1.2); K.R(ctx, -350, -120, 700, 120, 30, '#ffffff', 10); K.R(ctx, -40, -100, 80, 80, 8, '#d64545', 0); ctx.restore(); ctx.restore();
    ['TWEEZERS', 'MEDICINE', 'DOCTOR'].forEach((t, i) => K.text(ctx, `NO ${t}`, -500 + i * 1000 * (i === 1 ? 0.54 : 1), 450 + i * 0, { size: 70, color: '#ff8a65', k: K.ph(a.t, a.d, 0.4 + i * 0.12, 0.5 + i * 0.12) }));
    K.text(ctx, 'EMPTY', 540, 900, { size: 120, color: '#ffffff', k: K.ph(a.t, a.d, 0.35, 0.5) });
  },
  // 46 Fever, hunger, blurry vision, infection — all at once -> cuatro amenazas orbitando alrededor de ella
  46: (ctx, a, K) => {
    jungle(ctx, a, K); ctx.fillStyle = 'rgba(40,10,10,0.4)'; ctx.fillRect(K.X0, 0, K.XW, 1920);
    K.drawFullBody(ctx, 540, 600, 0.16, girl(a, { glasses: false }), { mood: 'sad', t: a.t });
    ['FEVER', 'HUNGER', 'BLUR', 'INFECTION'].forEach((t, i) => { const an = a.t * 0.8 + i * Math.PI / 2; const x = 540 + Math.cos(an) * 700, y = 820 + Math.sin(an) * 330; K.R(ctx, x - 200, y - 60, 400, 120, 40, '#14152a', 8); ctx.fillStyle = '#ff8a65'; ctx.font = '60px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(t, x, y + 4); });
  },
  // 47 Day ten: a small hut on the riverbank with a boat -> a través de la neblina aparece la cabaña con una barca
  47: (ctx, a, K) => {
    jungle(ctx, a, K, { river: true });
    const c = K.ph(a.t, a.d, 0.1, 0.8); ctx.save(); ctx.filter = `blur(${Math.round((1 - c) * 12)}px)`; hut(ctx, K, 1000, 1150, 1.2); canoe(ctx, K, 1100, 1450, 1); ctx.restore();
    walkGirl(ctx, a, K, 0, 880, 0.15, { glasses: false });
    calendarDay(ctx, K, -500, 550, 10, K.ph(a.t, a.d, 0, 0.15)); K.text(ctx, 'A HUT!', 1000, 450, { size: 120, color: '#ffd166', k: K.ph(a.t, a.d, 0.7, 0.85) });
  },
  // 48 Nobody inside: a boat motor and a can of gasoline -> dentro de la cabaña: el motor y la lata de gasolina iluminados
  48: (ctx, a, K) => {
    bg(ctx, K, '#6b4a2a', '#3a2614'); ctx.fillStyle = 'rgba(0,0,0,0.25)'; for (let x = K.X0; x < K.X0 + K.XW; x += 120) ctx.fillRect(x, 0, 10, 1920);
    K.radial(ctx, 900, 500, 500, '#ffe8a0', 0.4);
    K.R(ctx, -200, 800, 380, 380, 30, '#4a5162', 10); K.C(ctx, -10, 900, 70, '#2a2d33', 6); K.text(ctx, 'MOTOR', -10, 1250, { size: 60, color: '#ffffff' });
    const k = K.ease.outBack(K.ph(a.t, a.d, 0.3, 0.5)); ctx.save(); ctx.translate(900, 1000); ctx.scale(k, k); K.R(ctx, -160, -230, 320, 460, 30, '#d62828', 10); K.R(ctx, 60, -290, 70, 70, 10, '#d62828', 8); K.text(ctx, 'GAS', 0, 0, { size: 100, color: '#ffffff' }); ctx.restore();
    K.sparkles(ctx, 900, 900, a.t, 8);
  },
  // 49 A jungle trick: gasoline drives maggots out of a wound -> idea con bombilla: lata + vendaje = flecha
  49: (ctx, a, K) => {
    bg(ctx, K, '#6b4a2a', '#3a2614');
    K.midShot(ctx, girl(a, { glasses: false }), { x: 200, y: 1200, s: 0.75, mood: 'worried', t: a.t });
    const l = K.ph(a.t, a.d, 0.1, 0.3); K.radial(ctx, 200, 450, 200 * l, '#fff3a0', 0.8); K.prop(ctx, 'bombilla', 200, 450, 0.8 * K.ease.outBack(l), a.t);
    K.R(ctx, 900, 650, 220, 300, 24, '#d62828', 8); K.text(ctx, '+', 1250, 800, { size: 160, color: '#ffffff', k: K.ph(a.t, a.d, 0.35, 0.5) }); K.R(ctx, 1400, 720, 300, 160, 60, '#f2e6d0', 8);
    K.text(ctx, 'TERRIBLE IDEA', 1300, 450, { size: 90, color: '#ff8a65', k: K.ph(a.t, a.d, 0.6, 0.75) });
  },
  // 50 She pours it on; it burns; the maggots come out (~30) -> la lata se inclina, chorro, estrellas de dolor y contador hasta 30
  50: (ctx, a, K) => {
    bg(ctx, K, '#6b4a2a', '#3a2614');
    const tilt = K.ease.out(K.ph(a.t, a.d, 0.05, 0.3)); ctx.save(); ctx.translate(500, 600); ctx.rotate(tilt * 1.6); K.R(ctx, -110, -160, 220, 320, 24, '#d62828', 8); ctx.restore();
    if (tilt > 0.9) { ctx.strokeStyle = 'rgba(230,200,80,0.8)'; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(680, 640); ctx.quadraticCurveTo(720, 760, 700, 900); ctx.stroke(); }
    K.R(ctx, 300, 880, 900, 180, 90, '#e0b088', 10);
    if (a.t > a.d * 0.35) { K.starBurst(ctx, 700, 970, 160, '#ff8a00', K.ph(a.t, a.d, 0.35, 0.45)); K.text(ctx, 'AAAH!', -200, 700, { size: 140, color: '#ff3b30', k: K.ph(a.t, a.d, 0.35, 0.45) }); }
    K.text(ctx, `${Math.round(K.ph(a.t, a.d, 0.5, 0.9) * 30)}`, 1500, 800, { size: 200, color: '#ffd166', k: K.ph(a.t, a.d, 0.5, 0.6) });
  },
  // 51 Lies down in the hut, exhausted; safe but doesn't know it -> duerme en la cabaña; el río y una luz cálida
  51: (ctx, a, K) => {
    bg(ctx, K, '#3a2a3a', '#1a1220');
    hut(ctx, K, 540, 1250, 1.6); K.radial(ctx, 540, 1050, 300, '#ffd9a0', 0.4);
    ctx.save(); ctx.translate(540, 1080); ctx.scale(0.35, 0.35); K.drawHead(ctx, 0, 0, girl(a, { glasses: false }), { mood: 'neutral', t: a.t, closed: true }); ctx.restore();
    for (let i = 0; i < 3; i++) { const q = (a.t * 0.5 + i / 3) % 1; ctx.save(); ctx.globalAlpha = 1 - q; ctx.fillStyle = '#ffffff'; ctx.font = `${50 + i * 15}px Anton`; ctx.fillText('Z', 620 + q * 100, 1000 - q * 250); ctx.restore(); }
    K.text(ctx, 'SAFE', 1500, 650, { size: 130, color: '#2ec27e', k: K.ph(a.t, a.d, 0.5, 0.65) });
  },
  // 52 Next morning, voices: three forest workers arrive -> amanecer; tres hombres salen de entre los árboles
  52: (ctx, a, K) => {
    bg(ctx, K, '#ffcf9a', '#ffe8cc'); canopy(ctx, K, a.t, 250);
    hut(ctx, K, -300, 1200, 1.1);
    for (let i = 0; i < 3; i++) { const x = 1700 - K.ease.out(K.ph(a.t, a.d, 0.1 + i * 0.1, 0.6 + i * 0.1)) * (600 + i * 150); K.drawFullBody(ctx, x, 760, 0.15, K.personaWho('rescate', { who: 'w' + i }), { mood: 'neutral', t: a.t + i }); }
    K.text(ctx, 'VOICES!', 400, 500, { size: 120, color: '#ffffff', k: K.ph(a.t, a.d, 0.05, 0.2) });
  },
  // 53 They can hardly believe she's real -> caras sorprendidas de los tres; ojos como platos
  53: (ctx, a, K) => {
    bg(ctx, K, '#ffcf9a', '#ffe8cc'); canopy(ctx, K, a.t, 250);
    for (let i = 0; i < 3; i++) K.midShot(ctx, K.personaWho('rescate', { who: 'w' + i }), { x: -300 + i * 500, y: 1150, s: 0.7, mood: 'shocked', t: a.t + i });
    K.text(ctx, 'REAL?!', 1500, 600, { size: 140, color: '#d64545', k: K.ph(a.t, a.d, 0.2, 0.35) });
  },
  // 54 She explains in Spanish she was on the crashed plane -> bocadillo en español y el avión dibujado dentro
  54: (ctx, a, K) => {
    bg(ctx, K, '#ffcf9a', '#ffe8cc');
    K.midShot(ctx, girl(a, { glasses: false }), { x: 150, y: 1150, s: 0.75, mood: 'worried', t: a.t });
    const q = K.ph(a.t, a.d, 0.1, 0.3); ctx.save(); ctx.translate(1000, 650); ctx.scale(K.ease.outBack(q), K.ease.outBack(q)); K.R(ctx, -480, -230, 960, 460, 60, '#ffffff', 10); K.P(ctx, [[-380, 200], [-300, 200], [-460, 320]], '#ffffff', 8); electra(ctx, K, -150, -20, 0.3, a.t, { rot: 0.3 }); K.text(ctx, '"¡EL AVIÓN!"', 220, 0, { size: 80, color: '#ffffff' }); ctx.restore();
    K.text(ctx, '10 DAYS?!', 1000, 1150, { size: 110, color: '#d64545', k: K.ph(a.t, a.d, 0.6, 0.75) });
  },
  // 55 Food, cleaned wounds, hours by canoe to a village -> canoa río abajo con ella envuelta en una manta
  55: (ctx, a, K) => {
    jungle(ctx, a, K, { river: true });
    const x = -600 + K.ph(a.t, a.d, 0, 1) * 1800; canoe(ctx, K, x, 1460, 1.2);
    ctx.save(); ctx.translate(x - 100, 1380); ctx.scale(0.3, 0.3); K.drawHead(ctx, 0, 0, girl(a, { glasses: false }), { mood: 'neutral', t: a.t }); ctx.restore(); K.E(ctx, x - 100, 1430, 70, 40, '#c94b3a', 0, 5);
    for (let i = 0; i < 2; i++) { ctx.save(); ctx.translate(x + 60 + i * 150, 1380); ctx.scale(0.28, 0.28); K.drawHead(ctx, 0, 0, K.personaWho('rescate', { who: 'w' + i }), { mood: 'neutral', t: a.t + i }); ctx.restore(); }
    K.text(ctx, 'TO THE VILLAGE', 1400, 500, { size: 90, color: '#ffffff', k: K.ph(a.t, a.d, 0.3, 0.45) });
  },
  // 56 A small plane to the hospital in Pucallpa; her father waiting -> avioneta aterriza; el padre corre a abrazarla
  56: (ctx, a, K) => {
    bg(ctx, K, '#8fc8f0', '#e8f4ff'); ctx.fillStyle = '#7a7f88'; ctx.fillRect(K.X0, 1250, K.XW, 670);
    const k = K.ease.out(K.ph(a.t, a.d, 0, 0.4)); K.prop(ctx, 'avion', -500 + k * 700, 700 + k * 450, 0.8, a.t);
    const h = K.ease.inOut(K.ph(a.t, a.d, 0.45, 0.8)); K.drawFullBody(ctx, 1500 - h * 500, 850, 0.15, K.personaWho('koepcke', { who: 'padre' }), { mood: 'happy', t: a.t }); K.drawFullBody(ctx, 700, 850, 0.14, girl(a, { glasses: false }), { mood: 'happy', t: a.t });
    if (h > 0.95) K.prop(ctx, 'corazon', 850, 650, 0.5, a.t);
    K.text(ctx, 'PUCALLPA', 300, 450, { size: 110, color: '#ffffff', k: K.ph(a.t, a.d, 0.1, 0.25) });
  },
  // 57 Her mother also survived the fall but died before help came -> una vela encendida junto a unos prismáticos (homenaje)
  57: (ctx, a, K) => {
    bg(ctx, K, '#1a1424', '#0f0b16');
    K.R(ctx, 440, 800, 200, 400, 20, '#f6efdc', 8); const fl = 1 + Math.sin(a.t * 10) * 0.08; ctx.save(); ctx.translate(540, 780); ctx.scale(fl, fl); K.E(ctx, 0, -40, 40, 80, '#ffd166', 0, 5); ctx.restore(); K.radial(ctx, 540, 740, 400, '#ffd9a0', 0.35);
    ctx.save(); ctx.translate(1150, 1100); K.C(ctx, -60, 0, 60, '#3a3d44', 7); K.C(ctx, 60, 0, 60, '#3a3d44', 7); K.R(ctx, -20, -20, 40, 40, 6, '#3a3d44', 5); ctx.restore();
    bird(ctx, K, -200, 600 + Math.sin(a.t) * 30, 0.8, a.t, '#fff7d0');
    K.text(ctx, 'MARIA', 540, 450, { size: 110, color: '#ffffff', k: K.ph(a.t, a.d, 0.3, 0.45) });
  },
  // 58 The news explodes: one out of 92 walked out -> periódicos girando con titulares "MIRACLE GIRL"
  58: (ctx, a, K) => {
    bg(ctx, K, '#e8e2d0', '#cfc6ae');
    for (let i = 0; i < 3; i++) { const q = K.ease.out(K.ph(a.t, a.d, i * 0.15, 0.3 + i * 0.15)); if (q <= 0) continue; ctx.save(); ctx.translate(-300 + i * 700, 820); ctx.rotate((1 - q) * 6 + (i - 1) * 0.1); ctx.scale(q, q); K.R(ctx, -300, -380, 600, 760, 10, '#fbfaf4', 8); ctx.fillStyle = K.INK; ctx.font = '70px Anton'; ctx.textAlign = 'center'; ctx.fillText(['MIRACLE', 'SOLE', 'ALIVE!'][i], 0, -230); ctx.fillText(['GIRL', 'SURVIVOR', '1 OF 92'][i], 0, -150); ctx.fillStyle = '#bbbbbb'; for (let j = 0; j < 6; j++) ctx.fillRect(-240, -60 + j * 60, 480, 20); ctx.restore(); }
  },
  // 59 One out of ninety-two; about eleven days -> línea de tiempo de 11 días con el avión al principio y la cabaña al final
  59: (ctx, a, K) => {
    bg(ctx, K, '#14152a', '#1f2547');
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(-500, 850); ctx.lineTo(1600, 850); ctx.stroke();
    const k = K.ph(a.t, a.d, 0.05, 0.8); for (let i = 0; i <= 11; i++) { const x = -500 + i * 190; K.C(ctx, x, 850, 22, i / 11 <= k ? '#ffd166' : '#3a4466', 6); }
    electra(ctx, K, -500, 650, 0.25, a.t); hut(ctx, K, 1600, 700, 0.4);
    K.text(ctx, '11 DAYS', 540, 1150, { size: 150, color: '#ffd166', k: K.ph(a.t, a.d, 0.6, 0.75) });
  },
  // 60 Two endings; the first involves a famous filmmaker -> claqueta y bobina de cine; "ENDING 1"
  60: (ctx, a, K) => {
    bg(ctx, K, '#1a1424', '#2a1f3a');
    ctx.save(); ctx.translate(200, 820); ctx.rotate(a.t); K.C(ctx, 0, 0, 280, '#3a3d44', 10); for (let i = 0; i < 6; i++) { const an = i * Math.PI / 3; K.C(ctx, Math.cos(an) * 160, Math.sin(an) * 160, 60, '#1a1424', 4); } ctx.restore();
    ctx.save(); ctx.translate(900, 820); K.R(ctx, -250, -80, 500, 280, 20, '#22232b', 8); ctx.rotate(-0.4 * Math.max(0, Math.sin(a.t * 3))); K.R(ctx, -250, -160, 500, 80, 10, '#ffffff', 8); ctx.restore();
    K.text(ctx, 'ENDING 1', 1500, 500, { size: 110, color: '#ffd166', k: K.ph(a.t, a.d, 0.4, 0.55) });
  },
  // 61 A German director had booked a seat on that exact flight -> billete de avión con su asiento reservado
  61: (ctx, a, K) => {
    bg(ctx, K, '#e8e2d0', '#cfc6ae');
    ctx.save(); ctx.translate(540, 820); ctx.rotate(-0.05); K.R(ctx, -600, -240, 1200, 480, 30, '#ffffff', 10); K.R(ctx, -600, -240, 1200, 120, 30, '#2f80ed', 10); ctx.fillStyle = '#fff'; ctx.font = '70px Anton'; ctx.textAlign = 'left'; ctx.fillText('BOARDING PASS', -560, -155);
    ctx.fillStyle = K.INK; ctx.font = '60px Anton'; ctx.fillText('FLIGHT 508 · LIMA → PUCALLPA', -560, -20); ctx.fillText('FILM DIRECTOR · SEAT RESERVED', -560, 80); ctx.restore();
    K.text(ctx, 'DEC 24, 1971', 540, 400, { size: 90, color: '#d64545', k: K.ph(a.t, a.d, 0.3, 0.45) });
  },
  // 62 Last-minute change: he never boarded -> el billete se rompe por la mitad; el avión despega sin él
  62: (ctx, a, K) => {
    bg(ctx, K, '#8fc8f0', '#e8f4ff');
    const r = K.ease.out(K.ph(a.t, a.d, 0.1, 0.4));
    ctx.save(); ctx.translate(-300 - r * 120, 700); ctx.rotate(-r * 0.3); K.R(ctx, -200, -150, 400, 300, 20, '#ffffff', 8); ctx.restore(); ctx.save(); ctx.translate(100 + r * 120, 700); ctx.rotate(r * 0.3); K.R(ctx, -200, -150, 400, 300, 20, '#ffffff', 8); ctx.restore();
    const k = K.ph(a.t, a.d, 0.4, 1); electra(ctx, K, 900 + k * 600, 1100 - k * 600, 0.5, a.t, { rot: -0.3 });
    K.text(ctx, 'NOT BOARDING', -100, 1050, { size: 90, color: '#d64545', k: K.ph(a.t, a.d, 0.3, 0.45) });
  },
  // 63 Decades later: a documentary in 2000, "Wings of Hope" -> cartel de película con unas alas y el año 2000
  63: (ctx, a, K) => {
    bg(ctx, K, '#1a1424', '#2a1f3a');
    ctx.save(); ctx.translate(540, 820); K.R(ctx, -330, -460, 660, 920, 20, '#2a3a5a', 10);
    for (const sd of [-1, 1]) { ctx.save(); ctx.scale(sd, 1); ctx.rotate(Math.sin(a.t * 2) * 0.1); for (let i = 0; i < 5; i++) K.E(ctx, 80 + i * 30, -80 + i * 30, 160 - i * 18, 40, '#ffffff', 0.3, 5); ctx.restore(); }
    ctx.fillStyle = '#ffd166'; ctx.font = '70px Anton'; ctx.textAlign = 'center'; ctx.fillText('WINGS OF', 0, 260); ctx.fillText('HOPE', 0, 340); ctx.restore();
    K.text(ctx, '2000', 1500, 700, { size: 160, color: '#ffffff', k: K.ph(a.t, a.d, 0.3, 0.45) });
  },
  // 64 He flew her back to the crash site; she retraced her steps on camera -> cámara de cine grabando a la adulta en la selva
  64: (ctx, a, K) => {
    jungle(ctx, a, K);
    K.drawFullBody(ctx, 900, 640, 0.16, girl(a, { outfit: '#4a7fb0', glasses: true }), { mood: 'neutral', t: a.t });
    ctx.save(); ctx.translate(-150, 900); K.R(ctx, -200, -100, 400, 200, 20, '#22232b', 8); K.C(ctx, 240, 0, 80, '#3a3d44', 8); K.C(ctx, -120, -160, 80, '#22232b', 6); K.C(ctx, 80, -160, 80, '#22232b', 6); ctx.restore();
    if (Math.sin(a.t * 4) > 0) K.C(ctx, -300, 760, 16, '#ff3b30', 0); K.text(ctx, 'REC', -230, 760, { size: 50, color: '#ff3b30' });
  },
  // 65 But the second ending is better -> "ENDING 2" con escalofríos (piel de gallina) y brillo
  65: (ctx, a, K) => {
    bg(ctx, K, '#14152a', '#1f2547');
    K.text(ctx, 'ENDING 2', 540, 820, { size: 220, color: '#ffd166', k: K.ph(a.t, a.d, 0.1, 0.3) });
    K.sparkles(ctx, 540, 820, a.t, 14, 600);
    K.text(ctx, 'CHILLS', 1500, 1150, { size: 100, color: '#7fd0ff', k: K.ph(a.t, a.d, 0.5, 0.65), rot: Math.sin(a.t * 20) * 0.03 });
  },
  // 66 She became a biologist and studied Amazon wildlife -> con bata y cuaderno, rodeada de mariposas y pájaros
  66: (ctx, a, K) => {
    jungle(ctx, a, K);
    K.midShot(ctx, girl(a, { outfit: '#f2f2f2', glasses: true }), { x: 540, y: 1150, s: 0.8, mood: 'happy', t: a.t, prop: 'lupa' });
    for (let i = 0; i < 5; i++) { const an = a.t * 0.7 + i * 1.25; bird(ctx, K, 540 + Math.cos(an) * 800, 650 + Math.sin(an) * 250, 0.6, a.t + i, ['#e8505b', '#ffd166', '#4cc9f0', '#2ec27e', '#b84ad6'][i]); }
    K.text(ctx, 'BIOLOGIST', 1500, 450, { size: 110, color: '#ffffff', k: K.ph(a.t, a.d, 0.3, 0.45) });
  },
  // 67 Today she runs Panguana, the research station her parents founded -> cartel "PANGUANA" en la estación entre árboles
  67: (ctx, a, K) => {
    jungle(ctx, a, K, { river: true });
    hut(ctx, K, 200, 1150, 1.3); hut(ctx, K, 900, 1180, 1.0);
    ctx.save(); ctx.translate(1450, 1100); K.R(ctx, -14, -260, 28, 260, 6, '#6b4a2a', 6); K.R(ctx, -280, -420, 560, 170, 16, '#2f7a3a', 9); ctx.fillStyle = '#ffffff'; ctx.font = '80px Anton'; ctx.textAlign = 'center'; ctx.fillText('PANGUANA', 0, -310); ctx.restore();
    K.text(ctx, 'SINCE 1968', -300, 500, { size: 90, color: '#ffd166', k: K.ph(a.t, a.d, 0.4, 0.55) });
  },
  // 68 The jungle tried to kill her; she spent her life protecting it -> dos manos protegen un pequeño árbol que crece
  68: (ctx, a, K) => {
    bg(ctx, K, '#ffcf9a', '#ffe8cc'); canopy(ctx, K, a.t, 1300);
    const g = K.ease.out(K.ph(a.t, a.d, 0.05, 0.8)); ctx.save(); ctx.translate(540, 1050); ctx.scale(0.4 + g * 0.8, 0.4 + g * 0.8); K.prop(ctx, 'arbol', 0, 0, 1, a.t); ctx.restore();
    K.prop(ctx, 'mano', 200, 1150, 1.2, a.t, 0.8); K.prop(ctx, 'mano', 880, 1150, 1.2, a.t, -0.8);
    K.text(ctx, 'PROTECTED', 1500, 600, { size: 110, color: '#2f7a3a', k: K.ph(a.t, a.d, 0.5, 0.65) });
  },
  // 69 Comments: follow the water, or wait by the wreck? -> camino que se divide: río a un lado, restos del avión al otro
  69: (ctx, a, K) => {
    jungle(ctx, a, K);
    ctx.fillStyle = '#4cc3f0'; ctx.beginPath(); ctx.moveTo(540, 1350); ctx.quadraticCurveTo(200, 1000, -400, 900); ctx.lineTo(-400, 1000); ctx.quadraticCurveTo(200, 1100, 480, 1400); ctx.fill();
    ctx.save(); ctx.translate(1300, 1000); ctx.rotate(0.3); K.R(ctx, -200, -60, 400, 120, 60, '#d6dbe3', 8); ctx.restore();
    K.text(ctx, 'WATER?', -300, 700, { size: 110, color: '#ffffff', k: K.ph(a.t, a.d, 0.1, 0.25) }); K.text(ctx, 'WRECK?', 1400, 700, { size: 110, color: '#ffffff', k: K.ph(a.t, a.d, 0.25, 0.4) });
    const q = K.ph(a.t, a.d, 0.5, 0.65); if (q > 0) { ctx.save(); ctx.translate(540, 450); ctx.scale(K.ease.outBack(q), K.ease.outBack(q)); K.R(ctx, -330, -80, 660, 160, 50, '#ffffff', 10); ctx.fillStyle = '#14152a'; ctx.font = '80px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('COMMENT!', 0, 4); ctx.restore(); }
  },
  // 70 Next video: jumping out of a plane without a parachute -> una puerta de avión abierta al cielo; NEXT VIDEO
  70: (ctx, a, K) => {
    bg(ctx, K, '#7fb8e8', '#cfe8f8'); for (let i = 0; i < 8; i++) K.C(ctx, K.X0 + ((i * 300 + a.t * 200) % K.XW), 900 + (i % 3) * 200, 120, '#ffffff', 0);
    K.R(ctx, -700, 200, 900, 1500, 0, '#e8ecf2', 12); K.R(ctx, -300, 450, 380, 800, 30, '#7fb8e8', 10);
    const k = K.ph(a.t, a.d, 0.3, 1); ctx.save(); ctx.translate(-100 + k * 900, 850 + k * 500); ctx.rotate(k * 3); K.drawFullBody(ctx, 0, -280, 0.12, a.who, { mood: 'shocked', t: a.t, arms: 'up' }); ctx.restore();
    K.text(ctx, 'NEXT VIDEO', 1300, 450, { size: 110, color: '#ffffff', k: K.ph(a.t, a.d, 0.1, 0.25) });
  },
};
