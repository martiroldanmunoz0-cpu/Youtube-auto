// Escenas a medida de largo-1-01: «7 lugares donde está prohibido entrar (y el peligro eres tú)» — VÍDEO LARGO
// En horizontal se ve la franja central (y ≈ 430-1610): todo lo importante va ahí.

function badgeN(ctx, K, n, name, k, y = 700) { // rótulo grande "Nº 7 · ÁREA 51"
  if (k <= 0) return; const s = K.ease.outBack(Math.min(1, k));
  ctx.save(); ctx.translate(540, y); ctx.scale(s, s);
  K.R(ctx, -330, -95, 660, 190, 30, '#e8505b', 10); ctx.fillStyle = '#fff'; ctx.font = '110px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(`Nº ${n}`, 0, -18);
  ctx.font = '46px Anton'; ctx.fillStyle = '#ffd166'; ctx.fillText(name, 0, 58); ctx.restore();
}
function fence(ctx, K, y, t, col = '#9aa6b2') { // valla metálica con alambre
  ctx.strokeStyle = col; ctx.lineWidth = 6; for (let x = -40; x < 1120; x += 60) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 60, y + 220); ctx.moveTo(x + 60, y); ctx.lineTo(x, y + 220); ctx.stroke(); }
  for (let x = 0; x < 1080; x += 180) K.R(ctx, x, y - 40, 18, 280, 4, '#5a5d63', 4);
  ctx.strokeStyle = '#c9ced6'; ctx.lineWidth = 4; for (let x = 0; x < 1080; x += 30) { ctx.beginPath(); ctx.arc(x, y - 30 + Math.sin(x + t) * 2, 12, 0, 7); ctx.stroke(); }
}
function sign(ctx, K, x, y, s, lines, col = '#e8505b', rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); K.R(ctx, -14, 0, 28, 260, 6, '#5a5d63', 5);
  K.R(ctx, -230, -230, 460, 240, 16, '#f4f1ea', 9); K.R(ctx, -230, -230, 460, 70, 16, col, 0);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.font = '52px Anton'; ctx.fillText(lines[0], 0, -195);
  ctx.fillStyle = K.INK; ctx.font = '40px Anton'; lines.slice(1).forEach((l, i) => ctx.fillText(l, 0, -120 + i * 52)); ctx.restore();
}
function globeLocks(ctx, a, K) { // la Tierra girando con 7 candados que se cierran
  K.drawPlace(ctx, 'espacio', 'noche', a.t);
  K.prop(ctx, 'tierra', 540, 1250, 2.2, a.t);
  const pts = [[-0.9, -0.4], [-0.3, -0.9], [0.5, -0.7], [0.85, -0.1], [0.4, 0.4], [-0.5, 0.3], [0, -0.3]];
  pts.forEach(([px, py], i) => { const k = K.ph(a.t, a.d, 0.1 + i * 0.09, 0.2 + i * 0.09); if (k <= 0) return; const s = K.ease.outBack(k) * 0.9;
    ctx.save(); ctx.translate(540 + px * 260, 960 + py * 260); ctx.scale(s, s); K.R(ctx, -32, -10, 64, 54, 10, '#ffd166', 6); ctx.beginPath(); ctx.arc(0, -10, 22, Math.PI, 0); ctx.lineWidth = 10; ctx.strokeStyle = K.INK; ctx.stroke(); ctx.restore(); });
}
function cave(ctx, a, K, dark = 0) { // cueva con pinturas de animales
  ctx.fillStyle = '#5a4030'; ctx.fillRect(0, 0, 1080, 1920);
  ctx.beginPath(); ctx.ellipse(540, 1000, 620, 560, 0, 0, 7); ctx.fillStyle = '#c99a6a'; ctx.fill();
  const g = ctx.createRadialGradient(540, 1000, 100, 540, 1000, 620); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(40,20,10,0.85)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
  const animal = (x, y, s, col, t0) => { ctx.save(); ctx.translate(x + Math.sin(a.t * 1.5 + t0) * 6, y); ctx.scale(s, s); ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, 0, 120, 60, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(110, -40, 40, 30, -0.4, 0, 7); ctx.fill();
    ctx.strokeStyle = col; ctx.lineWidth = 14; for (const lx of [-70, -30, 40, 80]) { ctx.beginPath(); ctx.moveTo(lx, 40); ctx.lineTo(lx + Math.sin(a.t * 3 + lx) * 8, 120); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(130, -60); ctx.quadraticCurveTo(160, -130, 120, -150); ctx.stroke(); ctx.restore(); };
  animal(380, 860, 1, '#7a2e1e', 0); animal(700, 1080, 0.8, '#2b1a12', 1); animal(420, 1250, 0.7, '#a8562a', 2);
  if (dark) { ctx.fillStyle = `rgba(0,0,0,${dark})`; ctx.fillRect(0, 0, 1080, 1920); }
}
function virusSwarm(ctx, a, K, cx, cy, r, n, k) { for (let i = 0; i < n; i++) { const an = i * 2.4 + a.t * 0.8, rr = r * (0.3 + ((i * 37) % 10) / 14) * k; ctx.save(); ctx.translate(cx + Math.cos(an) * rr, cy + Math.sin(an) * rr * 0.7); ctx.scale(0.22, 0.22); ctx.rotate(a.t + i); K.PROPS.virus(ctx, a.t); ctx.restore(); } }

export default {
  // 1. ¿Dónde en la Tierra te prohíben entrar? -> la Tierra girando y 7 candados que se cierran sobre ella
  0: (ctx, a, K) => {
    globeLocks(ctx, a, K);
    K.text(ctx, 'PROHIBIDO', 540, 690, { size: 150, color: '#e8505b', k: K.ph(a.t, a.d, 0.05, 0.2) });
  },
  // 3. Y en el número uno descubrirás que el peligro... eres tú -> un dedo gigante señala a cámara
  2: (ctx, a, K) => {
    K.drawPlace(ctx, 'calle', 'atardecer', a.t); ctx.fillStyle = 'rgba(20,10,30,0.45)'; ctx.fillRect(0, 0, 1080, 1920);
    const k = K.ease.out(K.ph(a.t, a.d, 0.2, 0.6));
    K.radial(ctx, 540, 1050, 600, '#e8505b', 0.4 * k);
    ctx.save(); ctx.translate(540, 1300); ctx.scale(1 + k * 1.2, 1 + k * 1.2); K.prop(ctx, 'mano', 0, 0, 1, a.t); ctx.restore();
    K.text(ctx, '¿TÚ?', 540, 700, { size: 180, color: '#ffd166', k: K.ph(a.t, a.d, 0.5, 0.65) });
  },
  // 6. Número siete: el Área 51 -> desierto de noche, base al fondo con focos que barren, y el rótulo Nº 7
  5: (ctx, a, K) => {
    K.drawPlace(ctx, 'desierto', 'noche', a.t);
    for (const [x, w] of [[200, 260], [520, 200], [760, 180]]) K.R(ctx, x, 1060, w, 120, 6, '#3a3f4e', 6);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const [x, ph] of [[300, 0], [800, 2]]) { const an = -Math.PI / 2 + Math.sin(a.t * 0.9 + ph) * 0.6; const g = ctx.createLinearGradient(x, 1060, x + Math.cos(an) * 900, 1060 + Math.sin(an) * 900); g.addColorStop(0, 'rgba(255,250,200,0.45)'); g.addColorStop(1, 'rgba(255,250,200,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, 1060); ctx.lineTo(x + Math.cos(an - 0.08) * 900, 1060 + Math.sin(an - 0.08) * 900); ctx.lineTo(x + Math.cos(an + 0.08) * 900, 1060 + Math.sin(an + 0.08) * 900); ctx.fill(); } ctx.restore();
    fence(ctx, K, 1300, a.t);
    badgeN(ctx, K, 7, 'ÁREA 51 · NEVADA', K.ph(a.t, a.d, 0.15, 0.35));
  },
  // 7. Avisa de que pueden usar fuerza letal -> el cartel real de advertencia aparece de golpe tras la valla
  7: (ctx, a, K) => {
    K.drawPlace(ctx, 'desierto', 'atardecer', a.t);
    fence(ctx, K, 1260, a.t);
    const k = K.ph(a.t, a.d, 0.1, 0.3); const [sx, sy] = K.shakeAt(a.t, a.d * 0.1, 18, 0.4);
    ctx.save(); ctx.translate(sx, sy); sign(ctx, K, 540, 1100, 1.2 * K.ease.outBack(Math.min(1, k * 1.2)) || 0.01, ['ATENCIÓN', 'ZONA RESTRINGIDA', 'SE AUTORIZA', 'FUERZA LETAL']); ctx.restore();
    K.flash(ctx, a.t, a.d * 0.1, 0.15, '255,80,80');
  },
  // 14. Desde abajo, su fuselaje brillaba con el sol... como un objeto extraño -> el U-2 altísimo brilla como una luz misteriosa
  13: (ctx, a, K) => {
    K.drawPlace(ctx, 'desierto', 'atardecer', a.t); ctx.fillStyle = 'rgba(30,20,60,0.35)'; ctx.fillRect(0, 0, 1080, 1920);
    const x = 100 + K.ph(a.t, a.d, 0, 1) * 880;
    K.radial(ctx, x, 620, 200 + Math.sin(a.t * 8) * 30, '#fff3c4', 0.9);
    ctx.save(); ctx.translate(x, 620); ctx.scale(0.25, 0.25); K.PROPS.avion(ctx, a.t); ctx.restore();
    K.drawFullBody(ctx, 300, 1050, 0.25, a.who, { mood: 'shocked', arms: 'up', t: a.t });
    K.text(ctx, '20.000 m', x, 760, { size: 60, color: '#ffd166', k: K.ph(a.t, a.d, 0.3, 0.45) });
  },
  // 15. Muchos testigos vieron luces y pensaron en extraterrestres -> la luz se transforma en un ovni... y vuelve a ser el avión
  14: (ctx, a, K) => {
    K.drawPlace(ctx, 'desierto', 'noche', a.t);
    const m = Math.sin(K.ph(a.t, a.d, 0, 1) * Math.PI);
    K.radial(ctx, 540, 700, 260, '#a0ffcf', 0.6);
    ctx.save(); ctx.translate(540, 760); ctx.globalAlpha = m; ctx.scale(0.8, 0.8); K.PROPS.ovni(ctx, a.t); ctx.restore();
    ctx.save(); ctx.translate(540, 720); ctx.globalAlpha = 1 - m; ctx.scale(0.4, 0.4); K.PROPS.avion(ctx, a.t); ctx.restore(); ctx.globalAlpha = 1;
    for (let i = 0; i < 3; i++) K.drawFullBody(ctx, 260 + i * 260, 1150, 0.2, a.who, { mood: 'shocked', arms: i === 1 ? 'up' : 'normal', t: a.t + i });
  },
  // 19. Número seis: la Bóveda Global de Semillas de Svalbard -> la entrada de hormigón en la montaña nevada, con aurora
  18: (ctx, a, K) => {
    K.drawPlace(ctx, 'montana', 'noche', a.t);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3; i++) { ctx.strokeStyle = `rgba(${i ? 120 : 80},255,${170 + i * 30},0.25)`; ctx.lineWidth = 60; ctx.beginPath(); for (let x = 0; x <= 1080; x += 40) ctx.lineTo(x, 500 + i * 60 + Math.sin(x / 160 + a.t + i) * 50); ctx.stroke(); } ctx.restore();
    K.P(ctx, [[300, 1250], [540, 820], [780, 1250]], '#e9eef5', 8);
    K.R(ctx, 470, 980, 140, 300, 6, '#8d929b', 8); K.R(ctx, 490, 1000, 100, 260, 4, '#5a5d63', 0);
    ctx.save(); ctx.globalAlpha = 0.6 + 0.4 * Math.sin(a.t * 2); K.R(ctx, 480, 990, 120, 40, 4, '#7bdff2', 0); ctx.restore();
    badgeN(ctx, K, 6, 'BÓVEDA DE SEMILLAS · NORUEGA', K.ph(a.t, a.d, 0.15, 0.35));
  },
  // 28-29. Siria: primera retirada -> cajas que salen de la bóveda y vuelan hacia Alepo en un avión
  28: (ctx, a, K) => {
    K.drawPlace(ctx, 'ciudad', 'atardecer', a.t); ctx.fillStyle = 'rgba(60,40,30,0.35)'; ctx.fillRect(0, 0, 1080, 1920);
    K.smoke(ctx, 540, 1100, a.t, 6);
    for (let i = 0; i < 4; i++) { const k = K.ph(a.t, a.d, 0.1 + i * 0.12, 0.6 + i * 0.1); if (k <= 0) continue; ctx.save(); ctx.translate(100 + k * 880, 1200 - Math.sin(k * Math.PI) * 500); ctx.rotate(k * 4); K.R(ctx, -50, -40, 100, 80, 8, '#c98a4b', 6); K.R(ctx, -50, -8, 100, 14, 0, '#8b5a2b', 0); ctx.restore(); }
    K.text(ctx, 'ALEPO · 2015', 540, 690, { size: 100, color: '#ffd166', k: K.ph(a.t, a.d, 0.05, 0.2) });
  },
  // 33. Número cinco: el santuario interior de Ise -> bosque de cedros y torii de madera, rótulo Nº 5
  32: (ctx, a, K) => {
    K.drawPlace(ctx, 'selva', 'dia', a.t);
    for (const x of [80, 260, 820, 1000]) { K.R(ctx, x - 30, 500, 60, 1100, 10, '#7a4a2a', 6); K.P(ctx, [[x - 120, 900], [x, 450], [x + 120, 900]], '#2e6b44', 6); }
    ctx.save(); ctx.translate(540, 1500); K.R(ctx, -260, -520, 40, 520, 8, '#c9a072', 8); K.R(ctx, 220, -520, 40, 520, 8, '#c9a072', 8); K.R(ctx, -330, -560, 660, 50, 10, '#a77a4a', 8); K.R(ctx, -290, -470, 580, 34, 8, '#a77a4a', 8); ctx.restore();
    badgeN(ctx, K, 5, 'SANTUARIO DE ISE · JAPÓN', K.ph(a.t, a.d, 0.15, 0.35));
  },
  // 40. Cada veinte años lo derriban y lo construyen otra vez -> el santuario se desmonta pieza a pieza y se vuelve a levantar
  39: (ctx, a, K) => {
    K.drawPlace(ctx, 'selva', 'dia', a.t);
    const p = K.ph(a.t, a.d, 0, 1), down = Math.min(1, p * 2), up = Math.max(0, p * 2 - 1);
    const parts = 6, visible = p < 0.5 ? Math.round(parts * (1 - down)) : Math.round(parts * up);
    ctx.save(); ctx.translate(540, 1450);
    for (let i = 0; i < parts; i++) if (i < visible) { const y = -i * 90; K.R(ctx, -240 + i * 10, y - 90, 480 - i * 20, 90, 6, i === parts - 1 ? '#6b4a2a' : '#d8b27a', 6); }
    if (visible === parts) K.P(ctx, [[-300, -540], [0, -700], [300, -540]], '#6b4a2a', 8);
    ctx.restore();
    if (p > 0.45 && p < 0.55) K.smoke(ctx, 540, 1350, a.t, 5);
    K.text(ctx, 'CADA 20 AÑOS', 540, 690, { size: 120, color: '#ffd166', k: K.ph(a.t, a.d, 0.05, 0.2) });
  },
  // 45. Número cuatro: la isla de las serpientes -> isla verde y rocosa en el mar con serpientes asomando
  44: (ctx, a, K) => {
    K.drawPlace(ctx, 'playa', 'dia', a.t);
    ctx.fillStyle = '#2f9ec9'; ctx.fillRect(0, 1150, 1080, 770);
    ctx.beginPath(); ctx.moveTo(150, 1200); ctx.quadraticCurveTo(300, 760, 540, 800); ctx.quadraticCurveTo(820, 760, 930, 1200); ctx.closePath(); ctx.fillStyle = '#3e8c4a'; ctx.fill(); K.O(ctx, 9);
    for (let i = 0; i < 5; i++) { const k = K.ph(a.t, a.d, 0.2 + i * 0.1, 0.35 + i * 0.1); if (k <= 0) continue; ctx.save(); ctx.translate(280 + i * 120, 1000 + (i % 2) * 80 - k * 40); ctx.scale(0.3, 0.3); K.PROPS.serpiente(ctx, a.t + i); ctx.restore(); }
    badgeN(ctx, K, 4, 'ISLA DE LAS SERPIENTES · BRASIL', K.ph(a.t, a.d, 0.05, 0.25));
  },
  // 50-51. "Una serpiente por metro cuadrado"... es un mito -> cuadrícula llena de serpientes que se vacía con un sello MITO
  50: (ctx, a, K) => {
    ctx.fillStyle = '#3e8c4a'; ctx.fillRect(0, 0, 1080, 1920);
    const st = K.ph(a.t, a.d, 0.35, 0.45), gone = K.ph(a.t, a.d, 0.45, 0.9);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 3; for (let x = 140; x <= 940; x += 160) { ctx.beginPath(); ctx.moveTo(x, 500); ctx.lineTo(x, 1500); ctx.stroke(); } for (let y = 500; y <= 1500; y += 160) { ctx.beginPath(); ctx.moveTo(140, y); ctx.lineTo(940, y); ctx.stroke(); }
    let i = 0; for (let x = 220; x < 940; x += 160) for (let y = 580; y < 1500; y += 160) { i++; if (gone > 0 && (i * 7) % 10 < gone * 10.5) continue; ctx.save(); ctx.translate(x, y + 30); ctx.scale(0.16, 0.16); K.PROPS.serpiente(ctx, a.t + i); ctx.restore(); }
    if (st > 0) { const s = 2 - K.ease.out(st); ctx.save(); ctx.translate(540, 1000); ctx.rotate(-0.2); ctx.scale(s, s); ctx.globalAlpha = Math.min(1, st * 2); ctx.lineWidth = 18; ctx.strokeStyle = '#e8505b'; ctx.strokeRect(-230, -100, 460, 200); ctx.fillStyle = '#e8505b'; ctx.font = '170px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('MITO', 0, 10); ctx.restore(); ctx.globalAlpha = 1; }
  },
  // 59. Número tres: Surtsey -> rótulo y la isla negra humeante en mitad del mar
  58: (ctx, a, K) => {
    K.drawPlace(ctx, 'playa', 'atardecer', a.t); ctx.fillStyle = '#2a6f99'; ctx.fillRect(0, 1100, 1080, 820);
    K.P(ctx, [[220, 1200], [420, 900], [660, 880], [860, 1200]], '#2b2b30', 9);
    K.smoke(ctx, 540, 880, a.t, 6);
    badgeN(ctx, K, 3, 'SURTSEY · ISLANDIA', K.ph(a.t, a.d, 0.1, 0.3));
  },
  // 60-61. El mar empezó a hervir... y nació una isla -> burbujas, explosión y la isla subiendo del agua
  59: (ctx, a, K) => {
    ctx.fillStyle = '#5a6b80'; ctx.fillRect(0, 0, 1080, 1100); ctx.fillStyle = '#1f6f99'; ctx.fillRect(0, 1100, 1080, 820);
    const rise = K.ease.out(K.ph(a.t, a.d, 0.35, 1));
    for (let i = 0; i < 16; i++) { const q = (a.t * 1.5 + i / 16) % 1; K.C(ctx, 300 + (i * 61) % 480, 1150 - q * 200, 10 + (i % 3) * 6, '#ffffff', 3); }
    ctx.save(); ctx.translate(540, 1150 + (1 - rise) * 300); K.P(ctx, [[-320, 0], [-120, -300], [120, -320], [320, 0]], '#2b2b30', 9); ctx.restore();
    ctx.fillStyle = 'rgba(31,111,153,0.9)'; ctx.fillRect(0, 1150, 1080, 770);
    if (rise > 0) { K.starBurst(ctx, 540, 900, 160 + Math.sin(a.t * 10) * 30, '#ff8a3d', Math.min(1, rise * 2)); K.smoke(ctx, 540, 820, a.t, 7); }
    K.text(ctx, '1963', 540, 690, { size: 140, color: '#ffd166', k: K.ph(a.t, a.d, 0.05, 0.2) });
  },
  // 68-70. Apareció una tomatera... de los excrementos de un investigador... y la arrancaron -> la tomatera crece y una mano la arranca
  67: (ctx, a, K) => {
    K.drawPlace(ctx, 'playa', 'dia', a.t); ctx.fillStyle = '#2b2b30'; ctx.fillRect(0, 1250, 1080, 670);
    const g = K.ease.out(K.ph(a.t, a.d, 0, 0.6)), pull = K.ph(a.t, a.d, 0.7, 1);
    ctx.save(); ctx.translate(540, 1250 - pull * 600); ctx.rotate(pull * 0.6);
    K.L(ctx, [[0, 0], [0, -300 * g]], '#4caf50', 16); for (let i = 1; i < 4; i++) if (g > i * 0.25) K.E(ctx, (i % 2 ? 60 : -60), -80 * i, 50, 22, '#6fcf97', i % 2 ? -0.4 : 0.4);
    if (g > 0.8) for (const [x, y] of [[50, -220], [-45, -160], [30, -280]]) K.C(ctx, x, y, 26, '#e8505b', 6);
    ctx.restore();
    if (pull > 0) { ctx.save(); ctx.translate(540, 1000 - pull * 600); K.prop(ctx, 'mano', 0, 0, 0.9, 0); ctx.restore(); }
    K.text(ctx, '¡UNA TOMATERA!', 540, 690, { size: 100, color: '#e8505b', k: K.ph(a.t, a.d, 0.3, 0.45) });
  },
  // 74. Número dos: la cueva de Lascaux -> la entrada de la cueva y el rótulo Nº 2
  73: (ctx, a, K) => {
    cave(ctx, a, K, 0.2);
    badgeN(ctx, K, 2, 'CUEVA DE LASCAUX · FRANCIA', K.ph(a.t, a.d, 0.1, 0.3));
  },
  // 77. Te asomas con una linterna y los animales parecen moverse -> haz de linterna que recorre las pinturas
  76: (ctx, a, K) => {
    cave(ctx, a, K, 0.75);
    const lx = 300 + Math.sin(a.t * 0.8) * 260, ly = 1000 + Math.cos(a.t * 0.6) * 200;
    ctx.save(); ctx.beginPath(); ctx.arc(lx, ly, 280, 0, 7); ctx.clip(); cave(ctx, a, K, 0); ctx.restore();
    K.radial(ctx, lx, ly, 300, '#fff1c8', 0.3);
  },
  // 80-82. Cada aliento suelta CO2, humedad y calor... crecen algas y manchas -> nubes de aliento y las manchas verdes se comen las pinturas
  79: (ctx, a, K) => {
    cave(ctx, a, K, 0.1);
    for (let i = 0; i < 6; i++) { const q = (a.t * 0.6 + i / 6) % 1; ctx.globalAlpha = 0.45 * (1 - q); K.radial(ctx, 150 + q * 700, 1450 - q * 500 + i * 20, 80 + q * 80, '#ffffff', 1); }
    ctx.globalAlpha = 1;
    const k = K.ph(a.t, a.d, 0.3, 1);
    for (let i = 0; i < 26; i++) { const r = 20 + ((i * 37) % 40) * k; if (k <= 0) break; ctx.fillStyle = `rgba(${60 + (i % 3) * 20},${120 + (i % 4) * 15},50,${0.55 * k})`; ctx.beginPath(); ctx.arc(250 + (i * 97) % 600, 750 + (i * 131) % 600, r, 0, 7); ctx.fill(); }
    K.text(ctx, 'CO2 · HUMEDAD · CALOR', 540, 690, { size: 70, color: '#ffffff', k: K.ph(a.t, a.d, 0.05, 0.2) });
  },
  // 88. Número uno: la isla Sentinel del Norte -> isla de selva rodeada de arrecife, rótulo Nº 1 con más dramatismo
  87: (ctx, a, K) => {
    K.drawPlace(ctx, 'playa', 'atardecer', a.t); ctx.fillStyle = '#1f7fa9'; ctx.fillRect(0, 1050, 1080, 870);
    ctx.beginPath(); ctx.ellipse(540, 1200, 400, 160, 0, 0, 7); ctx.fillStyle = '#f0d9a0'; ctx.fill(); K.O(ctx, 8);
    for (let i = 0; i < 9; i++) K.C(ctx, 250 + i * 70, 1120 - Math.abs(i - 4) * 10, 70, i % 2 ? '#2e7d4f' : '#3e9c57', 6);
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(540, 1200, 470 + Math.sin(a.t * 2) * 8, 200, 0, 0, 7); ctx.stroke();
    badgeN(ctx, K, 1, 'ISLA SENTINEL DEL NORTE · INDIA', K.ph(a.t, a.d, 0.1, 0.3));
    K.flash(ctx, a.t, a.d * 0.1, 0.2, '255,220,120');
  },
  // 93. De repente, una flecha se clava en la arena, cerca de ti -> la flecha vuela y se clava temblando junto a la barca
  92: (ctx, a, K) => {
    K.drawPlace(ctx, 'playa', 'dia', a.t);
    const hit = 0.45, k = K.ph(a.t, a.d, 0, hit);
    K.prop(ctx, 'barca', 760, 1250, 0.6, a.t);
    ctx.save(); const x = 100 + K.ease.in(k) * 520, y = 600 + K.ease.in(k) * 620; ctx.translate(x, y); ctx.rotate(0.9 + (a.t > a.d * hit ? Math.sin(a.t * 40) * 0.05 * Math.max(0, 1 - (a.t - a.d * hit) * 2) : 0));
    K.L(ctx, [[-160, 0], [40, 0]], '#8b5a2b', 8); K.P(ctx, [[40, -18], [80, 0], [40, 18]], '#5a5d63', 4); K.P(ctx, [[-160, 0], [-190, -24], [-130, 0], [-190, 24]], '#e8505b', 3); ctx.restore();
    if (a.t > a.d * hit) { K.smoke(ctx, 640, 1250, a.t, 3); }
    K.flash(ctx, a.t, a.d * hit, 0.1);
  },
  // 100-101. Sus defensas no conocen nuestros virus: un resfriado tuyo podría acabar con ellos -> nube de virus que sale de ti hacia la isla
  99: (ctx, a, K) => {
    K.drawPlace(ctx, 'playa', 'dia', a.t);
    K.midShot(ctx, a.who, { x: 280, y: 1100, s: 0.55, mood: 'worried', t: a.t, seed: 4 });
    const k = K.ease.out(K.ph(a.t, a.d, 0.15, 0.9));
    virusSwarm(ctx, a, K, 300 + k * 450, 1000, 260, 14, Math.max(0.2, k));
    K.text(ctx, 'NI UN RESFRIADO', 600, 690, { size: 110, color: '#e8505b', k: K.ph(a.t, a.d, 0.3, 0.45) });
  },
  // 102. En este lugar tú eres el arma -> primer plano tuyo y una diana roja encima: TÚ
  101: (ctx, a, K) => {
    K.drawPlace(ctx, 'playa', 'atardecer', a.t); ctx.fillStyle = 'rgba(40,10,20,0.4)'; ctx.fillRect(0, 0, 1080, 1920);
    K.face(ctx, a.who, 540, 1050, 1.5, { mood: 'shocked', t: a.t });
    const k = K.ease.outBack(K.ph(a.t, a.d, 0.2, 0.45));
    ctx.save(); ctx.translate(540, 1000); ctx.scale(k, k); ctx.strokeStyle = '#e8505b'; ctx.lineWidth = 16; for (const r of [420, 300]) { ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(-480, 0); ctx.lineTo(480, 0); ctx.moveTo(0, -480); ctx.lineTo(0, 480); ctx.stroke(); ctx.restore();
    K.text(ctx, 'TÚ ERES EL ARMA', 540, 690, { size: 110, color: '#ffd166', k: K.ph(a.t, a.d, 0.4, 0.55) });
  },
  // 105. Una tomatera, un aliento, un resfriado: el hilo de toda la lista -> tres iconos unidos por un hilo rojo
  104: (ctx, a, K) => {
    ctx.fillStyle = '#2a2233'; ctx.fillRect(0, 0, 1080, 1920); K.radial(ctx, 540, 1000, 700, '#e8505b', 0.2);
    const pts = [[260, 760, 'TOMATERA'], [820, 1000, 'ALIENTO'], [300, 1300, 'RESFRIADO']];
    const k = K.ph(a.t, a.d, 0.1, 0.9);
    ctx.strokeStyle = '#e8505b'; ctx.lineWidth = 10; ctx.setLineDash([24, 14]); ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); if (k > 0.33) ctx.lineTo(pts[1][0], pts[1][1]); if (k > 0.66) ctx.lineTo(pts[2][0], pts[2][1]); ctx.stroke(); ctx.setLineDash([]);
    pts.forEach(([x, y, l], i) => { const kk = K.ph(a.t, a.d, 0.05 + i * 0.3, 0.2 + i * 0.3); if (kk <= 0) return; K.C(ctx, x, y, 110 * K.ease.outBack(Math.min(1, kk)), '#f4f1ea', 8); K.text(ctx, l, x, y + 170, { size: 56, color: '#ffd166', k: kk });
      if (i === 0) { K.C(ctx, x, y, 40, '#e8505b', 6); } else if (i === 1) { for (let j = 0; j < 3; j++) K.radial(ctx, x - 30 + j * 30, y, 40, '#9fb6c9', 0.8); } else { ctx.save(); ctx.translate(x, y); ctx.scale(0.28, 0.28); ctx.rotate(a.t); K.PROPS.virus(ctx, a.t); ctx.restore(); } });
  },
  // 106. Protege a un pueblo entero -> la isla al atardecer con humo de hogueras y un escudo de luz que la rodea
  106: (ctx, a, K) => {
    K.drawPlace(ctx, 'playa', 'atardecer', a.t); ctx.fillStyle = '#1f7fa9'; ctx.fillRect(0, 1050, 1080, 870);
    ctx.beginPath(); ctx.ellipse(540, 1200, 400, 160, 0, 0, 7); ctx.fillStyle = '#f0d9a0'; ctx.fill(); K.O(ctx, 8);
    for (let i = 0; i < 9; i++) K.C(ctx, 250 + i * 70, 1120 - Math.abs(i - 4) * 10, 70, i % 2 ? '#2e7d4f' : '#3e9c57', 6);
    for (const x of [420, 650]) for (let j = 0; j < 4; j++) { const q = (a.t * 0.5 + j / 4) % 1; ctx.globalAlpha = 0.5 * (1 - q); K.radial(ctx, x + Math.sin(a.t + j) * 20, 1060 - q * 250, 30 + q * 40, '#cccccc', 1); }
    ctx.globalAlpha = 1;
    const k = K.ease.out(K.ph(a.t, a.d, 0.2, 0.7));
    ctx.save(); ctx.globalAlpha = 0.6 * k; ctx.beginPath(); ctx.ellipse(540, 1150, 520, 360, 0, Math.PI, 0); ctx.lineWidth = 14; ctx.strokeStyle = '#7bdff2'; ctx.stroke(); K.radial(ctx, 540, 1000, 500, '#7bdff2', 0.15 * k); ctx.restore();
  },
};
