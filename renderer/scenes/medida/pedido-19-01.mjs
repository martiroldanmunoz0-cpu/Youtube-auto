// Escenas a medida de pedido-19-01: «¿Qué te pasa si te cae un rayo? Milésima a milésima»
// Cada plano muestra literalmente lo que dice la voz. a.t = segundos del plano, a.d = duración.

// ---- utilidades de este vídeo ----
function storm(ctx, a, K, dark = 0.55) { // campo al atardecer con nubes de tormenta que se mueven
  K.drawPlace(ctx, 'campo', 'atardecer', a.t);
  ctx.fillStyle = `rgba(20,18,40,${dark})`; ctx.fillRect(0, 0, K.W, K.H);
  for (let i = 0; i < 7; i++) {
    const x = ((i * 190 + a.t * 40) % 1400) - 160, y = 120 + (i % 3) * 70;
    ctx.globalAlpha = 0.95; K.C(ctx, x, y, 120, '#3a3d55', 0); K.C(ctx, x + 110, y + 20, 100, '#454862', 0); K.C(ctx, x - 100, y + 30, 90, '#33364d', 0);
  }
  ctx.globalAlpha = 1;
  ctx.strokeStyle = 'rgba(200,215,255,0.35)'; ctx.lineWidth = 3;
  for (let i = 0; i < 40; i++) { const x = (i * 97 + a.t * 500) % 1200 - 60, y = (i * 211 + a.t * 1300) % 1920; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 18, y + 55); ctx.stroke(); }
}
function bolt(ctx, x0, y0, x1, y1, seed, width = 18, glow = true, K) { // rayo en zigzag con ramas
  const pts = [[x0, y0]]; const n = 9;
  for (let i = 1; i < n; i++) { const k = i / n; pts.push([x0 + (x1 - x0) * k + Math.sin(seed * 13 + i * 7.3) * 70, y0 + (y1 - y0) * k]); }
  pts.push([x1, y1]);
  if (glow) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; K.radial(ctx, x1, y1, 420, '#bcd4ff', 0.6); ctx.restore(); }
  for (const [w, c] of [[width + 22, 'rgba(150,190,255,0.45)'], [width, '#ffffff']]) {
    ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineJoin = 'miter'; ctx.lineCap = 'round'; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
  }
  ctx.strokeStyle = '#e6eeff'; ctx.lineWidth = width * 0.35; // ramas
  for (const i of [3, 5, 7]) { const [x, y] = pts[i]; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.sin(seed + i) * 160, y + 110); ctx.lineTo(x + Math.sin(seed + i) * 230, y + 190); ctx.stroke(); }
}
function skeleton(ctx, x, y, s) { // esqueleto blanco (efecto rayos X del destello)
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 34; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, 0, 200, 0, 7); ctx.stroke();
  ctx.fillStyle = '#ffffff'; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(sx * 75, -10, 45, 0, 7); ctx.fill(); }
  const ln = (p) => { ctx.beginPath(); p.forEach(([a, b], i) => (i ? ctx.lineTo(a, b) : ctx.moveTo(a, b))); ctx.stroke(); };
  ln([[0, 240], [0, 1250]]); for (let i = 0; i < 5; i++) ln([[-200, 450 + i * 120], [0, 420 + i * 120], [200, 450 + i * 120]]);
  ln([[-260, 380], [-330, 860], [-300, 1260]]); ln([[260, 380], [330, 860], [300, 1260]]);
  ln([[-120, 1260], [-140, 1760], [-120, 2250]]); ln([[120, 1260], [140, 1760], [120, 2250]]);
  ctx.restore();
}
function arcs(ctx, cx, cy, r, t, n = 7) { // chispas eléctricas alrededor de un punto
  ctx.strokeStyle = '#cfe0ff'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const a0 = i * 0.9 + Math.floor(t * 18) * 1.7; ctx.beginPath();
    for (let k = 0; k <= 5; k++) { const a = a0 + k * 0.18, rr = r + Math.sin(t * 50 + i * 3 + k * 2) * 40; const px = cx + Math.cos(a) * rr, py = cy + Math.sin(a) * rr; k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.stroke();
  }
}
function timer(ctx, K, txt, x = 540, y = 1760, col = '#ffd166') { // marcador de tiempo abajo
  ctx.save(); ctx.font = '86px Anton'; const w = ctx.measureText(txt).width + 70;
  K.R(ctx, x - w / 2, y - 62, w, 124, 30, '#14152a', 7); ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, x, y + 4); ctx.restore();
}
function heartShape(ctx, x, y, s, col, K) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(0, 90); ctx.bezierCurveTo(-260, -80, -140, -300, 0, -170); ctx.bezierCurveTo(140, -300, 260, -80, 0, 90); ctx.fillStyle = col; ctx.fill(); K.O(ctx, 12); ctx.restore(); }
function ecg(ctx, t, y, rate, flatFrom = Infinity, col = '#3cff8f') {
  ctx.strokeStyle = col; ctx.lineWidth = 10; ctx.lineJoin = 'round'; ctx.beginPath();
  for (let x = 0; x <= 1080; x += 6) {
    const tx = t - (1080 - x) / 600; let yy = y;
    if (tx < flatFrom) { const p = ((tx * rate) % 1 + 1) % 1; yy = y - (p > 0.45 && p < 0.5 ? 200 : p > 0.5 && p < 0.55 ? -110 : 0); }
    x ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy);
  }
  ctx.stroke();
}
function fern(ctx, x, y, ang, len, depth, grow, K) { // figura de Lichtenberg (helecho) que se va dibujando
  if (depth <= 0 || grow <= 0 || len < 6) return;
  const g = Math.min(1, grow), x2 = x + Math.cos(ang) * len * g, y2 = y + Math.sin(ang) * len * g;
  ctx.lineWidth = Math.max(2, depth * 2.2); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke();
  if (grow < 1) return;
  const rest = grow - 1;
  fern(ctx, x2, y2, ang - 0.5, len * 0.72, depth - 1, rest * 1.6, K);
  fern(ctx, x2, y2, ang + 0.45, len * 0.68, depth - 1, rest * 1.6, K);
  fern(ctx, x2, y2, ang + 0.05, len * 0.6, depth - 1, rest * 1.4, K);
}
function rangerHat(ctx, x, y, s, K) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); K.E(ctx, 0, 0, 330, 60, '#8a6a3a'); K.P(ctx, [[-170, 0], [-120, -190], [0, -150], [120, -190], [170, 0]], '#a07c45'); K.R(ctx, -165, -40, 330, 36, 10, '#5a3e22', 0); ctx.restore(); }
function person(ctx, a, K, x, y, s, mood, extra = {}) { K.drawFullBody(ctx, x, y, s, a.who, { mood, t: a.t, ...extra }); }

export default {
  // 1. ¿Qué te pasa si te cae un rayo?  -> tormenta, la persona mira al cielo y el rayo le cae: destello con esqueleto
  0: (ctx, a, K) => {
    storm(ctx, a, K);
    const hit = 0.45 * a.d, after = a.t - hit;
    const [sx, sy] = K.shakeAt(a.t, hit, 26, 0.6); ctx.save(); ctx.translate(sx, sy);
    person(ctx, a, K, 540, 860, 0.36, after > 0 ? 'shocked' : 'worried', { arms: after > 0 ? 'up' : 'normal' });
    if (after > 0 && after < 0.35) { ctx.fillStyle = 'rgba(40,60,140,0.55)'; ctx.fillRect(0, 0, 1080, 1920); skeleton(ctx, 540, 860, 0.36); }
    if (after > -0.08 && after < 0.45) bolt(ctx, 520, 0, 540, 760, Math.floor(a.t * 20), 20, true, K);
    if (after > 0) { K.sparkles(ctx, 540, 760, a.t, 10, 240); for (let i = 0; i < 5; i++) { const q = (after * 0.8 + i / 5) % 1; ctx.globalAlpha = 0.4 * (1 - q); K.radial(ctx, 500 + i * 20, 760 - q * 400, 60 + q * 80, '#dddddd', 1); } ctx.globalAlpha = 1; }
    if (after < 0) { ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 4; for (let i = 0; i < 3; i++) { const q = (a.t * 2 + i / 3) % 1; ctx.globalAlpha = 1 - q; ctx.beginPath(); ctx.arc(540, 600, 60 + q * 120, -2.6, -0.5); ctx.stroke(); } ctx.globalAlpha = 1; }
    ctx.restore();
    K.flash(ctx, a.t, hit, 0.25, '235,240,255');
  },
  // 2. Tienes una milésima de segundo para descubrirlo -> cámara superlenta: el rayo baja poco a poco y un cronómetro
  1: (ctx, a, K) => {
    storm(ctx, a, K, 0.65);
    const k = K.ph(a.t, a.d, 0, 1);
    person(ctx, a, K, 540, 880, 0.36, 'shocked', { arms: 'normal' });
    bolt(ctx, 520, -40, 525 + Math.sin(a.t) * 10, -40 + k * 640, 3, 16, false, K);
    ctx.fillStyle = 'rgba(120,170,255,0.12)'; ctx.fillRect(0, 0, 1080, 1920); // tinte de cámara lenta
    // cronómetro
    ctx.save(); ctx.translate(820, 560); K.C(ctx, 0, 0, 150, '#f4f1ea', 12); K.R(ctx, -30, -200, 60, 50, 10, '#9aa6b2'); ctx.rotate(a.t * 18); K.L(ctx, [[0, 0], [0, -120]], '#e8505b', 10); ctx.restore(); K.C(ctx, 820, 560, 16, K.INK, 0);
    timer(ctx, K, `0,${String(Math.floor(k * 1000)).padStart(3, '0')} s`, 540, 1760);
    K.text(ctx, 'CÁMARA LENTA', 540, 1560, { size: 70, color: '#bcd4ff', k: K.ph(a.t, a.d, 0.05, 0.2) });
  },
  // 3. Cero segundos: el rayo te toca -> el rayo toca la cabeza, chispas por todo el cuerpo y el pelo de punta
  2: (ctx, a, K) => {
    storm(ctx, a, K, 0.6);
    const [sx, sy] = K.shakeAt(a.t, 0.15, 30, a.d); ctx.save(); ctx.translate(sx * 0.6, sy * 0.6);
    K.midShot(ctx, a.who, { x: 540, y: 1000, s: 0.85, mood: 'shocked', t: a.t, seed: 9 });
    ctx.strokeStyle = '#2a1a10'; ctx.lineWidth = 14; ctx.lineCap = 'round'; // pelo de punta
    for (let i = 0; i < 11; i++) { const ang = -Math.PI / 2 + (i - 5) * 0.16, r0 = 230, r1 = 330 + Math.sin(a.t * 40 + i) * 20; ctx.beginPath(); ctx.moveTo(540 + Math.cos(ang) * r0 * 0.85, 1000 + Math.sin(ang) * r0 * 1.05); ctx.lineTo(540 + Math.cos(ang) * r1, 1000 + Math.sin(ang) * r1); ctx.stroke(); }
    bolt(ctx, 500, -40, 540, 730, Math.floor(a.t * 25), 18, true, K);
    arcs(ctx, 540, 1150, 330, a.t, 9); arcs(ctx, 540, 1000, 260, a.t + 1, 5);
    ctx.restore();
    ctx.fillStyle = `rgba(180,200,255,${0.25 + 0.2 * Math.sin(a.t * 30)})`; ctx.fillRect(0, 0, 1080, 1920);
    timer(ctx, K, '0,000 s');
  },
  // 4. Una milésima: trescientos millones de voltios -> medidor con la aguja disparada y el contador subiendo
  3: (ctx, a, K) => {
    ctx.fillStyle = '#121327'; ctx.fillRect(0, 0, 1080, 1920);
    K.radial(ctx, 540, 1000, 700, '#5a7dff', 0.3);
    const k = K.ease.out(K.ph(a.t, a.d, 0.05, 0.6));
    ctx.save(); ctx.translate(540, 1150);
    ctx.beginPath(); ctx.arc(0, 0, 400, Math.PI, 0); ctx.lineTo(0, 0); ctx.closePath(); ctx.fillStyle = '#f4f1ea'; ctx.fill(); K.O(ctx, 14);
    for (let i = 0; i <= 10; i++) { const an = Math.PI + i * Math.PI / 10; ctx.strokeStyle = i > 7 ? '#e8505b' : K.INK; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(Math.cos(an) * 330, Math.sin(an) * 330); ctx.lineTo(Math.cos(an) * 390, Math.sin(an) * 390); ctx.stroke(); }
    const ang = Math.PI + Math.min(1.02, k * 1.02 + (k > 0.98 ? Math.sin(a.t * 40) * 0.03 : 0)) * Math.PI;
    K.L(ctx, [[0, 0], [Math.cos(ang) * 340, Math.sin(ang) * 340]], '#e8505b', 14); K.C(ctx, 0, 0, 34, K.INK, 0);
    ctx.restore();
    if (k > 0.95) { K.sparkles(ctx, 540 + 340, 1150, a.t, 10, 200); for (let i = 0; i < 4; i++) { const q = (a.t * 0.8 + i / 4) % 1; ctx.globalAlpha = 0.35 * (1 - q); K.radial(ctx, 860, 1100 - q * 400, 60 + q * 70, '#cccccc', 1); } ctx.globalAlpha = 1; }
    const v = Math.round(k * 300000000).toLocaleString('es-ES');
    K.text(ctx, `${v} V`, 540, 1420, { size: 110, color: '#ffd166' });
    timer(ctx, K, '0,001 s');
  },
  // 5. Dos milésimas: tu corazón se para -> el corazón late, se para de golpe y el electro se queda plano
  4: (ctx, a, K) => {
    ctx.fillStyle = '#170d1c'; ctx.fillRect(0, 0, 1080, 1920);
    const stop = a.d * 0.45, stopped = a.t > stop;
    const beat = stopped ? 0 : Math.pow(Math.max(0, Math.sin(a.t * 2.6 * Math.PI * 2)), 8);
    if (!stopped) K.radial(ctx, 540, 900, 600, '#ff3b5c', 0.3 + beat * 0.3);
    heartShape(ctx, 540, 1000, 1.6 + beat * 0.2, stopped ? '#7a6f78' : '#ff4d6d', K);
    if (stopped) { ctx.strokeStyle = '#2a2230'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(470, 760); ctx.lineTo(520, 860); ctx.lineTo(480, 940); ctx.lineTo(560, 1060); ctx.stroke(); }
    ecg(ctx, a.t, 1500, 2.6, stop, stopped ? '#ff5a5a' : '#3cff8f');
    K.flash(ctx, a.t, stop, 0.15, '255,80,80');
    timer(ctx, K, stopped ? '0 lpm' : '0,002 s', 540, 1760, stopped ? '#ff5a5a' : '#ffd166');
  },
  // 6. Tres: el sudor es vapor y tu ropa sale volando -> vapor que sale del cuerpo, zapatos y camiseta salen disparados
  5: (ctx, a, K) => {
    storm(ctx, a, K, 0.5);
    const k = K.ph(a.t, a.d, 0.15, 1), fly = K.ease.out(K.ph(a.t, a.d, 0.3, 0.9));
    person(ctx, a, K, 540, 860, 0.36, 'shocked', { arms: 'up' });
    for (let i = 0; i < 10; i++) { const q = (a.t * 0.9 + i / 10) % 1; ctx.globalAlpha = 0.35 * (1 - q) * Math.min(1, k * 3); K.radial(ctx, 420 + (i * 37) % 240 + Math.sin(a.t * 3 + i) * 30, 1450 - q * 900, 50 + q * 90, '#ffffff', 1); }
    ctx.globalAlpha = 1;
    if (fly > 0) {
      for (const [s, dx] of [[-1, -380], [1, 420]]) { ctx.save(); ctx.translate(540 + s * 70 + dx * fly, 1700 - 900 * fly + 1100 * fly * fly); ctx.rotate(a.t * 8 * s); K.R(ctx, -70, -30, 160, 70, 30, '#15161c', 6); ctx.restore(); } // zapatos
      ctx.save(); ctx.translate(540 + 300 * fly, 1150 - 1000 * fly); ctx.rotate(a.t * 5); K.P(ctx, [[-120, -100], [-40, -120], [40, -120], [120, -100], [150, 0], [90, 20], [80, 160], [-80, 160], [-90, 20], [-150, 0]], a.who.outfit, 7); ctx.restore(); // camiseta
      K.speedLines(ctx, 540, 1000, a.t, 0.25);
    }
    timer(ctx, K, '0,003 s');
  },
  // 7. Cuatro milésimas: ya acabó. Menos que un parpadeo -> primer plano de un ojo que parpadea una sola vez
  6: (ctx, a, K) => {
    K.drawPlace(ctx, 'campo', 'atardecer', a.t); ctx.fillStyle = 'rgba(20,18,40,0.35)'; ctx.fillRect(0, 0, 1080, 1920);
    const bl = Math.sin(K.ph(a.t, a.d, 0.35, 0.6) * Math.PI); // un parpadeo
    K.face(ctx, a.who, 540, 1060, 2.5, { mood: 'neutral', t: 0, closed: bl > 0.5 });
    const k = K.ph(a.t, a.d, 0, 0.35);
    if (k < 1) { ctx.strokeStyle = `rgba(230,240,255,${1 - k})`; ctx.lineWidth = 30; ctx.beginPath(); ctx.moveTo(420, -20); ctx.lineTo(470, 500 * (1 - k)); ctx.stroke(); }
    timer(ctx, K, '0,004 s'); K.text(ctx, 'FIN', 540, 1560, { size: 120, color: '#ffffff', k: K.ph(a.t, a.d, 0.62, 0.8) });
  },
  // 8. Diez segundos: en el suelo, el corazón suele arrancar solo -> tumbado en la hierba; el electro plano vuelve a latir
  7: (ctx, a, K) => {
    K.drawPlace(ctx, 'campo', 'atardecer', a.t); ctx.fillStyle = 'rgba(20,18,40,0.3)'; ctx.fillRect(0, 0, 1080, 1920);
    ctx.save(); ctx.translate(560, 1430); ctx.rotate(-Math.PI / 2); person(ctx, a, K, 0, -420, 0.3, 'neutral', { closed: a.t < a.d * 0.55 }); ctx.restore();
    const start = a.d * 0.45, on = a.t > start;
    const beat = on ? Math.pow(Math.max(0, Math.sin((a.t - start) * 1.4 * Math.PI * 2)), 8) : 0;
    heartShape(ctx, 540, 720, 0.75 + beat * 0.15, on ? '#ff4d6d' : '#7a6f78', K);
    if (on) K.radial(ctx, 540, 700, 280, '#ff4d6d', 0.25 + beat * 0.3);
    ctx.save(); ctx.translate(0, -520); ecg(ctx, Math.max(0, a.t - start) + 10, 1500, on ? 1.4 : 0, on ? Infinity : -1, on ? '#3cff8f' : '#ff5a5a'); ctx.restore();
    K.flash(ctx, a.t, start, 0.15, '120,255,160');
    timer(ctx, K, on ? '10 s · ¡LATE!' : '10 s', 540, 1760, on ? '#3cff8f' : '#ffd166');
  },
  // 9. Treinta minutos: tu piel dibuja un helecho rojo -> primer plano del brazo y el helecho de Lichtenberg creciendo
  8: (ctx, a, K) => {
    ctx.fillStyle = a.who.skin.light; ctx.fillRect(0, 0, 1080, 1920);
    const g = ctx.createLinearGradient(0, 0, 1080, 0); g.addColorStop(0, 'rgba(0,0,0,0.18)'); g.addColorStop(0.5, 'rgba(255,255,255,0.08)'); g.addColorStop(1, 'rgba(0,0,0,0.2)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
    ctx.fillStyle = 'rgba(80,40,20,0.12)'; for (let i = 0; i < 60; i++) ctx.fillRect((i * 173) % 1080, (i * 331) % 1920, 4, 14); // vello y poros
    const grow = K.ph(a.t, a.d, 0.05, 0.9) * 6;
    ctx.strokeStyle = 'rgba(200,40,50,0.85)'; ctx.lineCap = 'round';
    fern(ctx, 540, 1750, -Math.PI / 2, 360, 6, grow, K);
    fern(ctx, 540, 1750, -Math.PI / 2 - 0.6, 260, 5, grow - 0.5, K);
    fern(ctx, 540, 1750, -Math.PI / 2 + 0.6, 260, 5, grow - 0.5, K);
    timer(ctx, K, '30 MIN', 540, 300);
  },
  // 10. Unas horas después, ha desaparecido -> el helecho se borra mientras las agujas del reloj corren
  9: (ctx, a, K) => {
    ctx.fillStyle = a.who.skin.light; ctx.fillRect(0, 0, 1080, 1920);
    const k = K.ph(a.t, a.d, 0.1, 0.85);
    ctx.globalAlpha = 1 - k; ctx.strokeStyle = 'rgba(200,40,50,0.85)'; ctx.lineCap = 'round';
    fern(ctx, 540, 1750, -Math.PI / 2, 360, 6, 6, K); fern(ctx, 540, 1750, -Math.PI / 2 - 0.6, 260, 5, 6, K); fern(ctx, 540, 1750, -Math.PI / 2 + 0.6, 260, 5, 6, K);
    ctx.globalAlpha = 1;
    ctx.save(); ctx.translate(850, 470); K.C(ctx, 0, 0, 150, '#ffffff', 12); for (let i = 0; i < 12; i++) { const an = i / 12 * Math.PI * 2; K.C(ctx, Math.cos(an) * 120, Math.sin(an) * 120, 8, K.INK, 0); }
    ctx.save(); ctx.rotate(a.t * 9); K.L(ctx, [[0, 0], [0, -110]], K.INK, 10); ctx.restore(); ctx.save(); ctx.rotate(a.t * 0.75); K.L(ctx, [[0, 0], [0, -70]], '#e8505b', 12); ctx.restore(); ctx.restore();
    if (k > 0.9) K.sparkles(ctx, 540, 1300, a.t, 8, 300);
    timer(ctx, K, `+${Math.max(1, Math.round(k * 6))} HORAS`, 540, 1760);
  },
  // 11. Cerca del noventa por ciento sobrevive -> 10 personas; caen rayos; 9 se levantan en verde
  10: (ctx, a, K) => {
    K.drawPlace(ctx, 'campo', 'dia', a.t);
    const k = K.ph(a.t, a.d, 0.1, 0.9);
    for (let i = 0; i < 10; i++) {
      const col = i % 5, row = Math.floor(i / 5), x = 160 + col * 190, y = 900 + row * 470;
      const hitAt = 0.1 + i * 0.05, hit = K.ph(a.t, a.d, hitAt, hitAt + 0.05) > 0, up = K.ph(a.t, a.d, hitAt + 0.15, hitAt + 0.25);
      const dead = i === 7, standing = !hit || (up >= 1 && !dead);
      ctx.save(); ctx.translate(x, y + 330); if (hit && !standing) ctx.rotate(-Math.PI / 2 * (dead ? 1 : 1 - up)); ctx.translate(-x, -(y + 330));
      ctx.globalAlpha = dead && hit ? 0.45 : 1;
      K.drawFullBody(ctx, x, y, 0.15, a.who, { mood: hit && !dead ? 'happy' : 'neutral', t: a.t + i });
      ctx.restore(); ctx.globalAlpha = 1;
      if (K.ph(a.t, a.d, hitAt, hitAt + 0.06) > 0 && K.ph(a.t, a.d, hitAt, hitAt + 0.06) < 1) bolt(ctx, x, 0, x, y - 30, i, 8, false, K);
      if (up >= 1 && !dead) { K.C(ctx, x, y - 120, 42, '#5fd38a', 6); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - 20, y - 120); ctx.lineTo(x - 4, y - 102); ctx.lineTo(x + 22, y - 140); ctx.stroke(); }
    }
    K.text(ctx, `${Math.round(k * 90)}%`, 540, 600, { size: 170, color: '#5fd38a' });
    K.text(ctx, 'SOBREVIVE', 540, 760, { size: 80, color: '#ffffff', k: K.ph(a.t, a.d, 0.2, 0.35) });
  },
  // 12. Pero a un hombre le cayeron siete -> Roy, y 7 rayos uno tras otro con el contador
  11: (ctx, a, K) => {
    storm(ctx, a, K, 0.5);
    const n = Math.min(7, Math.floor(K.ph(a.t, a.d, 0.1, 0.95) * 7.99));
    K.midShot(ctx, a.who, { x: 540, y: 1080, s: 0.75, mood: n > 0 ? 'shocked' : 'neutral', t: a.t, seed: 4 });
    rangerHat(ctx, 540, 830, 1, K);
    const cur = K.ph(a.t, a.d, 0.1, 0.95) * 7.99 % 1;
    if (n > 0 && cur < 0.35) { bolt(ctx, 200 + (n * 157) % 700, 0, 540 + (n % 2 ? -60 : 60), 820, n, 16, true, K); ctx.fillStyle = 'rgba(220,230,255,0.25)'; ctx.fillRect(0, 0, 1080, 1920); }
    for (let i = 0; i < 7; i++) { const on = i < n; ctx.save(); ctx.translate(150 + i * 130, 1700); ctx.scale(0.18, 0.18); ctx.globalAlpha = on ? 1 : 0.25; K.PROPS.rayo(ctx, 0); ctx.restore(); }
    ctx.globalAlpha = 1;
    K.text(ctx, `${n} / 7`, 540, 560, { size: 150, color: '#ffd166' });
  },
  // 13. Roy Sullivan, guardabosques de Virginia -> en el bosque con su sombrero de guardabosques y la placa
  12: (ctx, a, K) => {
    K.drawPlace(ctx, 'montana', 'dia', a.t);
    for (const [x, s] of [[110, 1.2], [960, 1.1], [300, 0.8], [800, 0.85]]) { ctx.save(); ctx.translate(x, 1420); ctx.rotate(Math.sin(a.t * 1.2 + x) * 0.04); K.P(ctx, [[-110 * s, 0], [0, -420 * s], [110 * s, 0]], '#2e7d5b', 7); ctx.restore(); }
    const ent = K.ease.out(K.ph(a.t, a.d, 0, 0.3));
    K.midShot(ctx, a.who, { x: 540 + (1 - ent) * 600, y: 1080, s: 0.78, mood: 'happy', t: a.t, seed: 2 });
    rangerHat(ctx, 540 + (1 - ent) * 600, 820, 1, K);
    ctx.save(); ctx.translate(400 + (1 - ent) * 600, 1440); K.P(ctx, [[0, -60], [50, -20], [40, 50], [0, 70], [-40, 50], [-50, -20]], '#ffd166', 6); ctx.restore(); // placa
    K.text(ctx, 'ROY SULLIVAN', 540, 1590, { size: 100, color: '#ffffff', k: K.ph(a.t, a.d, 0.3, 0.45) });
    K.text(ctx, 'GUARDABOSQUES · VIRGINIA', 540, 1710, { size: 56, color: '#ffd166', k: K.ph(a.t, a.d, 0.4, 0.55) });
  },
  // 14. Durante treinta y cinco años -> línea del tiempo 1942→1977 con los 7 rayos marcándose
  13: (ctx, a, K) => {
    ctx.fillStyle = '#1b2240'; ctx.fillRect(0, 0, 1080, 1920); K.radial(ctx, 540, 960, 800, '#3b4c8f', 0.4);
    const k = K.ease.inOut(K.ph(a.t, a.d, 0.05, 0.9));
    const year = Math.round(1942 + k * 35);
    K.text(ctx, String(year), 540, 760, { size: 230, color: '#ffd166' });
    K.R(ctx, 90, 1180, 900, 26, 13, '#3a4470', 0); K.R(ctx, 90, 1180, 900 * k, 26, 13, '#ffd166', 0);
    for (const [y, i] of [[1942, 0], [1969, 1], [1970, 2], [1972, 3], [1973, 4], [1976, 5], [1977, 6]]) {
      const p = (y - 1942) / 35; if (k < p) continue;
      ctx.save(); ctx.translate(90 + 900 * p, 1160); ctx.scale(0.16, 0.16); K.PROPS.rayo(ctx, 0); ctx.restore();
      K.text(ctx, String(y), 90 + 900 * p, 1290 + (i % 2) * 70, { size: 40, color: '#ffffff' });
    }
    K.text(ctx, '35 AÑOS', 540, 1560, { size: 110, color: '#ffffff', k: K.ph(a.t, a.d, 0.5, 0.65) });
  },
  // 15. Perdió una uña, las cejas, y su pelo ardió dos veces -> primer plano: la uña sale volando, las cejas hacen ¡puf! y el pelo arde
  14: (ctx, a, K) => {
    K.drawPlace(ctx, 'montana', 'dia', a.t);
    const e1 = K.ph(a.t, a.d, 0.25, 0.32), f1 = K.ph(a.t, a.d, 0.45, 0.65), f2 = K.ph(a.t, a.d, 0.75, 0.95);
    K.face(ctx, a.who, 640, 1000, 1.55, { mood: f1 > 0 ? 'shocked' : 'worried', t: a.t });
    if (e1 < 1) for (const sx of [-1, 1]) K.R(ctx, 640 + sx * 105 - 55, 920, 110, 22, 10, '#2a1a10', 0); // cejas (antes de quemarse)
    if (e1 > 0 && e1 < 1) K.smoke(ctx, 640, 930, a.t, 5);
    // la mano con la uña que sale volando
    const nail = K.ph(a.t, a.d, 0.05, 0.3);
    K.R(ctx, 60, 1450, 250, 140, 60, a.who.skin.light, 8); K.R(ctx, 260, 1480, 170, 70, 35, a.who.skin.light, 7);
    if (nail < 0.2) K.E(ctx, 410, 1515, 26, 22, '#ffe6ee', 0, 5); else { ctx.save(); ctx.translate(410 + nail * 300, 1515 - nail * 500 + nail * nail * 300); ctx.rotate(a.t * 12); K.E(ctx, 0, 0, 26, 22, '#ffe6ee', 0, 5); ctx.restore(); }
    for (const f of [f1, f2]) if (f > 0 && f < 1) for (let i = 0; i < 9; i++) { // pelo en llamas
      const x = 640 - 200 + i * 50, h = 120 + Math.sin(a.t * 18 + i * 2) * 40;
      ctx.beginPath(); ctx.moveTo(x - 30, 760); ctx.quadraticCurveTo(x - 20, 760 - h * 0.6, x, 760 - h); ctx.quadraticCurveTo(x + 20, 760 - h * 0.6, x + 30, 760); ctx.fillStyle = i % 2 ? '#ff8a3d' : '#ffd166'; ctx.fill();
    }
    const items = ['UÑA', 'CEJAS', 'PELO ×2']; [0.1, 0.3, 0.5].forEach((p, i) => K.text(ctx, items[i], 220 + i * 320, 1760, { size: 70, color: '#ffd166', k: K.ph(a.t, a.d, p, p + 0.12) }));
  },
  // 16. El último le alcanzó pescando -> en la barca con la caña; el rayo baja por la caña y un pez salta
  15: (ctx, a, K) => {
    storm(ctx, a, K, 0.4);
    ctx.fillStyle = '#2f6f99'; ctx.fillRect(0, 1250, 1080, 670);
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 5; for (let i = 0; i < 6; i++) { const y = 1300 + i * 90, off = (a.t * 60 + i * 50) % 200; ctx.beginPath(); for (let x = -200 + off; x < 1080; x += 200) { ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 50, y - 16, x + 100, y); } ctx.stroke(); }
    const hit = a.d * 0.5, after = a.t - hit;
    ctx.save(); ctx.translate(540, 1330 + Math.sin(a.t * 2) * 10); ctx.rotate(Math.sin(a.t * 1.6) * 0.05);
    ctx.save(); ctx.translate(-120, -330); ctx.scale(0.45, 0.45); K.drawHead(ctx, 0, 0, a.who, { mood: after > 0 ? 'shocked' : 'happy', t: a.t }); ctx.restore();
    rangerHat(ctx, -120, -430, 0.45, K);
    K.L(ctx, [[-20, -200], [360, -620]], '#8b5a2b', 10); ctx.strokeStyle = '#dddddd'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(360, -620); ctx.lineTo(420, 0); ctx.stroke(); // caña y sedal
    K.PROPS.barca(ctx, a.t); ctx.restore();
    if (after > -0.05 && after < 0.4) { bolt(ctx, 880, 0, 900, 700, 5, 16, true, K); arcs(ctx, 900, 710, 70, a.t, 5); }
    const jump = K.ph(a.t, a.d, 0.55, 0.85); if (jump > 0 && jump < 1) { ctx.save(); ctx.translate(780 + jump * 200, 1300 - Math.sin(jump * Math.PI) * 300); ctx.rotate(-1 + jump * 2); ctx.scale(0.5, 0.5); K.PROPS.pez(ctx, a.t); ctx.restore(); }
    K.flash(ctx, a.t, hit, 0.25, '235,240,255');
    K.text(ctx, 'Nº 7', 540, 600, { size: 140, color: '#ffd166', k: K.ph(a.t, a.d, 0.52, 0.62) });
  },
  // 17. Sobrevivió a todos y entró en el Libro Guinness -> un gran libro dorado se abre con 7 rayos y su nombre
  16: (ctx, a, K) => {
    ctx.fillStyle = '#251a3d'; ctx.fillRect(0, 0, 1080, 1920); K.radial(ctx, 540, 900, 800, '#ffd166', 0.25);
    const open = K.ease.out(K.ph(a.t, a.d, 0.1, 0.45));
    ctx.save(); ctx.translate(540, 1050);
    K.R(ctx, -420, -300, 840, 600, 20, '#f4f1ea', 10); // páginas
    ctx.fillStyle = '#9aa3ad'; for (let i = 0; i < 6; i++) { ctx.fillRect(-380, -200 + i * 70, 320, 12); }
    ctx.save(); ctx.scale(1 - open * 2, 1); K.R(ctx, 0, -310, 430, 620, 20, '#1f3a8a', 10); ctx.fillStyle = '#ffd166'; ctx.font = '80px Anton'; ctx.textAlign = 'center'; if (open < 0.5) ctx.fillText('RÉCORDS', 215, 20); ctx.restore();
    ctx.restore();
    if (open > 0.5) {
      K.text(ctx, 'ROY SULLIVAN', 760, 900, { size: 60, color: '#1f3a8a', k: K.ph(a.t, a.d, 0.45, 0.55) });
      for (let i = 0; i < 7; i++) if (K.ph(a.t, a.d, 0.5 + i * 0.05, 0.55 + i * 0.05) > 0) { ctx.save(); ctx.translate(560 + (i % 4) * 110, 1080 + Math.floor(i / 4) * 150); ctx.scale(0.16, 0.16); K.PROPS.rayo(ctx, 0); ctx.restore(); }
      K.sparkles(ctx, 540, 1050, a.t, 10, 520);
    }
    K.text(ctx, '7 RAYOS · VIVO', 540, 1560, { size: 110, color: '#ffd166', k: K.ph(a.t, a.d, 0.75, 0.9) });
  },
};
