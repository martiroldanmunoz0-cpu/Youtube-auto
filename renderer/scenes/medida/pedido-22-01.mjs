// Escenas a medida de pedido-22-01: «Violet Jessop: la mujer que sobrevivió al Titanic y más»

function sea(ctx, a, K, hora = 'dia', horizon = 1050) { // mar abierto con olas que se mueven
  const g = ctx.createLinearGradient(0, 0, 0, horizon);
  const sky = hora === 'noche' ? ['#070b22', '#1b2350'] : hora === 'atardecer' ? ['#3d3b7a', '#ff9e6b'] : ['#5ab8ff', '#cfeaff'];
  g.addColorStop(0, sky[0]); g.addColorStop(1, sky[1]); ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, horizon);
  if (hora === 'noche') for (let i = 0; i < 80; i++) { ctx.fillStyle = `rgba(255,255,255,${0.4 + 0.5 * Math.abs(Math.sin(a.t * 2 + i))})`; ctx.fillRect((i * 137) % 1080, (i * 61) % (horizon - 100), 3, 3); }
  const w = ctx.createLinearGradient(0, horizon, 0, 1920); w.addColorStop(0, hora === 'noche' ? '#12305a' : '#2f8fc9'); w.addColorStop(1, hora === 'noche' ? '#061428' : '#155a8a');
  ctx.fillStyle = w; ctx.fillRect(0, horizon, 1080, 1920 - horizon);
  ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 5;
  for (let i = 0; i < 9; i++) { const y = horizon + 40 + i * 95, off = (a.t * 50 + i * 70) % 220; ctx.beginPath(); for (let x = -220 + off; x < 1080; x += 220) { ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 55, y - 16, x + 110, y); } ctx.stroke(); }
}
// Transatlántico de cuatro chimeneas (genérico, de época). tilt: inclinación; sink: cuánto se hunde (0..1)
function liner(ctx, K, x, y, s, { tilt = 0, sink = 0, hull = '#1c1a2b', white = '#f4f1ea', funnel = '#d9a441', cross = false, t = 0, lights = false } = {}) {
  ctx.save(); ctx.translate(x, y + sink * 260 * s); ctx.rotate(tilt); ctx.scale(s, s);
  K.P(ctx, [[-520, -60], [520, -60], [470, 90], [-480, 90]], hull, 9);
  if (cross) { K.R(ctx, -520, -66, 1040, 26, 0, '#2e9e5b', 0); }
  K.R(ctx, -420, -170, 820, 115, 10, white, 8);
  for (let i = 0; i < 14; i++) K.C(ctx, -380 + i * 58, -115, 11, lights ? (Math.sin(t * 3 + i) > -0.6 ? '#ffe08a' : '#55597a') : '#9fb6c9', 3);
  for (let i = 0; i < 4; i++) { K.R(ctx, -300 + i * 170, -330, 70, 170, 6, funnel, 7); K.R(ctx, -300 + i * 170, -330, 70, 40, 6, K.INK, 0); }
  if (cross) for (const cx of [-250, 250]) { K.R(ctx, cx - 40, -150, 80, 26, 0, '#e8505b', 0); K.R(ctx, cx - 13, -177, 26, 80, 0, '#e8505b', 0); }
  ctx.restore();
}
function badge(ctx, K, txt, y = 1760, col = '#ffd166') { ctx.save(); ctx.font = '80px Anton'; const w = ctx.measureText(txt).width + 70; K.R(ctx, 540 - w / 2, y - 60, w, 120, 30, '#14152a', 7); ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 540, y + 4); ctx.restore(); }
// Violet en plano medio con uniforme: de camarera (delantal y cofia) o de enfermera (cruz roja)
function violet(ctx, a, K, x, y, s, mood, outfit = 'camarera', extra = {}) {
  K.midShot(ctx, a.who, { x, y, s, mood, t: a.t, seed: 3, ...extra });
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (outfit === 'camarera') { K.R(ctx, -170, 420, 340, 700, 30, '#ffffff', 7); K.R(ctx, -150, -330, 300, 70, 30, '#ffffff', 7); }
  else { K.R(ctx, -160, -340, 320, 90, 20, '#ffffff', 7); K.R(ctx, -20, -330, 40, 70, 0, '#e8505b', 0); K.R(ctx, -35, -315, 70, 40, 0, '#e8505b', 0); K.R(ctx, -150, 420, 300, 680, 30, '#ffffff', 7); }
  ctx.restore();
}
function babyBundle(ctx, K, x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(Math.sin(t * 2) * 0.05); K.E(ctx, 0, 0, 120, 75, '#f6e3c8'); K.C(ctx, -60, -10, 45, '#f2c29b', 6); K.C(ctx, -72, -14, 5, K.INK, 0); K.C(ctx, -48, -14, 5, K.INK, 0); ctx.restore(); }
function year(ctx, K, y, k) { K.text(ctx, String(y), 820, 560, { size: 140, color: '#ffd166', k, rot: 0.06 }); }
function lifeboat(ctx, K, x, y, s, t, people = 3, who = null) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 1.6) * 0.06); ctx.scale(s, s);
  for (let i = 0; i < people; i++) { const px = -200 + i * 140; K.C(ctx, px, -120, 50, ['#f2c29b', '#c98d62', '#e7b48f'][i % 3], 6); K.R(ctx, px - 50, -80, 100, 90, 20, ['#3a4470', '#6b3a3a', '#2e5e4e'][i % 3], 6); }
  K.P(ctx, [[-330, -40], [330, -40], [260, 70], [-260, 70]], '#f4f1ea', 9); K.R(ctx, -330, -50, 660, 22, 8, '#c98a4b', 0);
  ctx.restore();
}

export default {
  // 1. Sobrevivió al Titanic y a sus dos hermanos -> tres transatlánticos al fondo que se van hundiendo uno tras otro; ella delante, viva
  0: (ctx, a, K) => {
    sea(ctx, a, K, 'atardecer', 980);
    for (let i = 0; i < 3; i++) { const sk = K.ph(a.t, a.d, 0.1 + i * 0.2, 0.35 + i * 0.2); liner(ctx, K, 200 + i * 340, 960, 0.3, { tilt: sk * 0.35 * (i % 2 ? -1 : 1), sink: sk * 1.4, t: a.t }); }
    ctx.fillStyle = '#155a8a'; ctx.fillRect(0, 1000, 1080, 40);
    violet(ctx, a, K, 540, 1220, 0.72, 'shocked');
    const n = Math.min(3, Math.floor(K.ph(a.t, a.d, 0.1, 0.8) * 3.99));
    K.text(ctx, `${n} / 3`, 540, 560, { size: 160, color: '#ffd166' });
  },
  // 2. ¿Cómo sobrevivió una misma mujer a los tres barcos gemelos del Titanic? -> los tres gemelos con sus nombres y la interrogación sobre ella
  1: (ctx, a, K) => {
    sea(ctx, a, K, 'dia', 900);
    ['OLYMPIC', 'TITANIC', 'BRITANNIC'].forEach((nm, i) => { const k = K.ease.outBack(K.ph(a.t, a.d, 0.05 + i * 0.12, 0.2 + i * 0.12)); if (k <= 0) return; liner(ctx, K, 400, 780 + i * 250, 0.46 * k, { t: a.t, cross: i === 2, white: i === 2 ? '#ffffff' : '#f4f1ea', hull: i === 2 ? '#ffffff' : '#1c1a2b' }); K.text(ctx, nm, 860, 760 + i * 250, { size: 56, color: '#ffd166', k }); });
    violet(ctx, a, K, 830, 1480, 0.45, 'worried');
    K.text(ctx, '?', 600, 1420, { size: 200, color: '#ffd166', k: K.ph(a.t, a.d, 0.5, 0.65), rot: 0.15 });
  },
  // 3. Violet Jessop, camarera. Tres barcos, tres intentos de hundirla -> ella en el puerto con su uniforme; aparecen 3 tachones rojos
  2: (ctx, a, K) => {
    K.drawPlace(ctx, 'playa', 'dia', a.t);
    liner(ctx, K, 540, 1000, 0.75, { t: a.t });
    violet(ctx, a, K, 540, 1150, 0.78, 'neutral');
    K.text(ctx, 'VIOLET JESSOP', 540, 1580, { size: 100, color: '#ffffff', k: K.ph(a.t, a.d, 0.05, 0.2) });
    for (let i = 0; i < 3; i++) { const k = K.ph(a.t, a.d, 0.45 + i * 0.12, 0.55 + i * 0.12); if (k <= 0) continue; ctx.save(); ctx.translate(300 + i * 240, 1760); ctx.scale(K.ease.outBack(k), K.ease.outBack(k)); ctx.strokeStyle = '#e8505b'; ctx.lineWidth = 22; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-50, -50); ctx.lineTo(50, 50); ctx.moveTo(50, -50); ctx.lineTo(-50, 50); ctx.stroke(); ctx.restore(); }
  },
  // 4. 1911. Trabaja en el gigante Olympic -> el enorme barco atracado; ella saluda desde la cubierta, diminuta al lado del casco
  3: (ctx, a, K) => {
    sea(ctx, a, K, 'dia', 1250);
    const z = K.ease.out(K.ph(a.t, a.d, 0, 1));
    liner(ctx, K, 540 - z * 120, 1220, 1.15 + z * 0.15, { t: a.t });
    ctx.save(); ctx.translate(520 - z * 140, 970); ctx.scale(0.12, 0.12); K.drawHead(ctx, 0, 0, a.who, { mood: 'happy', t: a.t }); ctx.restore();
    ctx.save(); ctx.translate(560 - z * 140, 990); ctx.rotate(Math.sin(a.t * 8) * 0.5); K.R(ctx, -6, -50, 12, 50, 6, a.who.skin.light, 0); ctx.restore();
    K.text(ctx, 'OLYMPIC', 540, 1480, { size: 90, color: '#ffffff', k: K.ph(a.t, a.d, 0.15, 0.3) });
    year(ctx, K, 1911, K.ph(a.t, a.d, 0.05, 0.2));
  },
  // 5. Un crucero de guerra le embiste el costado -> un buque gris entra de lado y choca: astillas, chorro de agua y temblor
  4: (ctx, a, K) => {
    sea(ctx, a, K, 'dia', 1000);
    const hit = 0.45, k = K.ph(a.t, a.d, 0, hit);
    const [sx, sy] = K.shakeAt(a.t, a.d * hit, 26, 0.6); ctx.save(); ctx.translate(sx, sy);
    liner(ctx, K, 640, 1050, 0.8, { t: a.t, tilt: a.t > a.d * hit ? 0.04 : 0 });
    ctx.save(); ctx.translate(-300 + K.ease.in(k) * 520, 1250); ctx.rotate(-0.5); ctx.scale(0.6, 0.6); // crucero de guerra gris
    K.P(ctx, [[-500, -40], [420, -40], [560, 40], [-480, 80]], '#7d8590', 9); K.R(ctx, -200, -170, 300, 130, 8, '#9aa3ad', 8); K.R(ctx, -60, -280, 60, 110, 6, '#6b737d', 6); K.L(ctx, [[150, -100], [320, -150]], '#5a6270', 20);
    ctx.restore();
    if (a.t > a.d * hit) { for (let i = 0; i < 9; i++) { const q = K.ph(a.t, a.d, hit, hit + 0.4); ctx.save(); ctx.translate(300 + Math.cos(i) * 260 * q, 1100 - Math.sin(i * 1.3 + 1) * 300 * q + 300 * q * q); ctx.rotate(i + a.t * 5); K.R(ctx, -20, -8, 40, 16, 3, '#8b5a2b', 4); ctx.restore(); } K.smoke(ctx, 320, 1150, a.t, 4); for (let i = 0; i < 8; i++) { const q = (a.t * 2 + i / 8) % 1; K.C(ctx, 300 + (i - 4) * 30, 1180 - Math.sin(q * Math.PI) * 300, 14, '#ffffff', 3); } }
    ctx.restore();
    K.flash(ctx, a.t, a.d * hit, 0.15);
    K.text(ctx, 'HMS HAWKE', 300, 560, { size: 90, color: '#ffffff', k: K.ph(a.t, a.d, 0.1, 0.25) });
  },
  // 6. 1912: la destinan al Titanic -> una hoja de destino cae sobre la mesa y el sello TITANIC golpea
  5: (ctx, a, K) => {
    ctx.fillStyle = '#6b4a32'; ctx.fillRect(0, 0, 1080, 1920); ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 4; for (let y = 80; y < 1920; y += 90) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1080, y + 20); ctx.stroke(); }
    const drop = K.ease.out(K.ph(a.t, a.d, 0, 0.3));
    ctx.save(); ctx.translate(540, 300 + drop * 750); ctx.rotate(0.06 - drop * 0.1);
    K.R(ctx, -330, -440, 660, 880, 10, '#f6efdc', 9); ctx.fillStyle = K.INK; ctx.font = '60px Anton'; ctx.textAlign = 'center'; ctx.fillText('WHITE STAR LINE', 0, -340);
    ctx.fillStyle = '#9aa3ad'; for (let i = 0; i < 7; i++) ctx.fillRect(-260, -240 + i * 60, i % 3 ? 520 : 360, 16);
    ctx.font = '48px Poppins'; ctx.fillStyle = K.INK; ctx.fillText('Destino: camarera', 0, 260);
    ctx.restore();
    const st = K.ph(a.t, a.d, 0.45, 0.55);
    if (st > 0) { const s = 2 - K.ease.out(st); ctx.save(); ctx.translate(540, 1250); ctx.rotate(-0.15); ctx.scale(s, s); ctx.globalAlpha = Math.min(1, st * 2); ctx.lineWidth = 14; ctx.strokeStyle = '#1f3a8a'; ctx.strokeRect(-250, -80, 500, 160); ctx.fillStyle = '#1f3a8a'; ctx.font = '120px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('TITANIC', 0, 8); ctx.restore(); ctx.globalAlpha = 1; }
    year(ctx, K, 1912, K.ph(a.t, a.d, 0.05, 0.2));
  },
  // 7. Noche de abril. Un iceberg -> el barco iluminado avanza de noche hacia un iceberg que asoma de la oscuridad
  6: (ctx, a, K) => {
    sea(ctx, a, K, 'noche', 1100);
    const k = K.ph(a.t, a.d, 0, 1);
    const ice = 0.6 + k * 0.6;
    ctx.save(); ctx.translate(880 - k * 160, 1120); ctx.scale(ice, ice); K.P(ctx, [[-260, 0], [-170, -330], [-40, -260], [40, -470], [180, -230], [260, 0]], '#dff4ff', 9); K.P(ctx, [[-40, -260], [40, -470], [60, -200]], '#b8e2f7', 0); ctx.restore();
    liner(ctx, K, 260 + k * 220, 1130, 0.55, { lights: true, t: a.t });
    if (k > 0.75) { K.flash(ctx, a.t, a.d * 0.8, 0.2, '200,230,255'); K.sparkles(ctx, 700, 1100, a.t, 6, 120); }
    K.text(ctx, '14 DE ABRIL', 540, 560, { size: 110, color: '#dff4ff', k: K.ph(a.t, a.d, 0.05, 0.2) });
  },
  // 8. La suben a un bote y le ponen un bebé en los brazos -> el bote baja por las cuerdas del costado; un marinero le da el bebé
  7: (ctx, a, K) => {
    sea(ctx, a, K, 'noche', 1300);
    K.R(ctx, -40, 0, 1160, 900, 0, '#1c1a2b', 0); for (let i = 0; i < 6; i++) K.C(ctx, 100 + i * 180, 200, 24, Math.sin(a.t * 3 + i) > -0.5 ? '#ffe08a' : '#55597a', 4); // costado del barco
    const down = K.ease.inOut(K.ph(a.t, a.d, 0, 0.8));
    ctx.strokeStyle = '#c9b48a'; ctx.lineWidth = 6; for (const x of [230, 850]) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 900 + down * 450); ctx.stroke(); }
    ctx.save(); ctx.translate(540, 980 + down * 450); ctx.scale(0.85, 0.85);
    violet(ctx, a, K, 0, -420, 0.55, 'worried');
    const give = K.ease.out(K.ph(a.t, a.d, 0.15, 0.4)); babyBundle(ctx, K, 380 - give * 340, -120, 1.1, a.t);
    K.P(ctx, [[-400, -40], [400, -40], [320, 90], [-320, 90]], '#f4f1ea', 9); K.R(ctx, -400, -50, 800, 24, 8, '#c98a4b', 0);
    ctx.restore();
    K.text(ctx, 'UN BEBÉ', 540, 560, { size: 120, color: '#ffffff', k: K.ph(a.t, a.d, 0.25, 0.4) });
  },
  // 9. Pasan la noche helada en el mar -> el bote solo en el mar negro, escarcha, vaho y estrellas; el barco ya no está
  8: (ctx, a, K) => {
    sea(ctx, a, K, 'noche', 1000);
    lifeboat(ctx, K, 540, 1250, 1.2, a.t, 4);
    for (let i = 0; i < 4; i++) { const q = (a.t * 0.6 + i / 4) % 1; ctx.globalAlpha = 0.5 * (1 - q); K.radial(ctx, 340 + i * 160 + q * 30, 1080 - q * 160, 30 + q * 40, '#ffffff', 1); } ctx.globalAlpha = 1;
    const k = K.ph(a.t, a.d, 0.1, 1); ctx.fillStyle = `rgba(180,225,255,${0.25 * k})`; ctx.fillRect(0, 0, 1080, 1920);
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 4; for (let i = 0; i < 16; i++) { const e = i % 2, p = ((i * 131) % 1000) / 1000, len = 60 + k * 180; ctx.save(); ctx.translate(e ? 1080 : 0, p * 1920); ctx.rotate(e ? Math.PI : 0); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(len, 0); ctx.moveTo(len * 0.5, 0); ctx.lineTo(len * 0.5 + 30, -30); ctx.moveTo(len * 0.5, 0); ctx.lineTo(len * 0.5 + 30, 30); ctx.stroke(); ctx.restore(); }
    K.text(ctx, '-2 °C', 540, 560, { size: 140, color: '#bfe6ff', k: K.ph(a.t, a.d, 0.15, 0.3) });
  },
  // 10. 1916: es enfermera en el Britannic, barco hospital -> el gran barco blanco con cruces rojas en el mar Egeo y ella con uniforme de enfermera
  9: (ctx, a, K) => {
    sea(ctx, a, K, 'dia', 1050);
    liner(ctx, K, 540, 1060, 0.8, { cross: true, hull: '#ffffff', white: '#ffffff', t: a.t });
    violet(ctx, a, K, 540, 1300, 0.7, 'neutral', 'enfermera');
    K.text(ctx, 'BRITANNIC', 540, 640, { size: 110, color: '#ffffff', k: K.ph(a.t, a.d, 0.05, 0.2) });
    K.text(ctx, 'MAR EGEO · 1916', 540, 1760, { size: 70, color: '#ffd166', k: K.ph(a.t, a.d, 0.2, 0.35) });
  },
  // 11. Una explosión. El barco se hunde -> explosión en la proa y el barco hospital se inclina y empieza a hundirse
  10: (ctx, a, K) => {
    sea(ctx, a, K, 'dia', 1000);
    const hit = 0.2, sk = K.ease.in(K.ph(a.t, a.d, hit, 1));
    const [sx, sy] = K.shakeAt(a.t, a.d * hit, 28, 0.6); ctx.save(); ctx.translate(sx, sy);
    liner(ctx, K, 540, 1060, 0.85, { cross: true, hull: '#ffffff', white: '#ffffff', tilt: sk * 0.35, sink: sk * 1.6, t: a.t });
    ctx.fillStyle = '#155a8a'; ctx.fillRect(0, 1180, 1080, 740);
    if (a.t > a.d * hit) { const q = K.ph(a.t, a.d, hit, hit + 0.25); if (q < 1) K.starBurst(ctx, 900, 1080, 330 * q, '#ff8a3d', 1 - q * 0.6); K.smoke(ctx, 880, 1000, a.t, 6); }
    ctx.restore();
    K.flash(ctx, a.t, a.d * hit, 0.2, '255,200,140');
  },
  // 12. Su bote se acerca a las hélices, aún girando -> popa enorme con las hélices girando; el bote es arrastrado hacia ellas
  11: (ctx, a, K) => {
    sea(ctx, a, K, 'dia', 700);
    ctx.save(); ctx.translate(780, 520); ctx.rotate(-0.5); K.P(ctx, [[-500, -200], [400, -200], [500, 300], [-500, 400]], '#ffffff', 10); K.R(ctx, -500, 60, 1000, 30, 0, '#2e9e5b', 0); ctx.restore();
    for (const [x, y] of [[620, 900], [880, 760]]) { ctx.save(); ctx.translate(x, y); ctx.rotate(a.t * 9); for (let i = 0; i < 3; i++) { ctx.rotate(Math.PI * 2 / 3); K.E(ctx, 0, -70, 34, 80, '#c9a24a'); } K.C(ctx, 0, 0, 26, '#8a7030', 6); ctx.restore(); ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 6; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(x, y, 130 + i * 40 + ((a.t * 80) % 40), a.t * 3 + i, a.t * 3 + i + 2); ctx.stroke(); } }
    const k = K.ease.in(K.ph(a.t, a.d, 0, 1));
    lifeboat(ctx, K, 200 + k * 360, 1500 - k * 420, 0.9 - k * 0.2, a.t * 2, 3);
    K.speedLines(ctx, 500, 1200, a.t, 0.25 * k);
  },
  // 13. Salta, la corriente la hunde y se golpea la cabeza -> bajo el agua, burbujas, ¡bonk! contra la quilla y estrellas
  12: (ctx, a, K) => {
    K.drawPlace(ctx, 'bajo_el_mar', 'dia', a.t);
    K.R(ctx, -40, -40, 1160, 300, 0, '#2a2f3a', 0); K.R(ctx, -40, 250, 1160, 20, 0, '#2e9e5b', 0); // quilla del barco arriba
    const sinkK = K.ph(a.t, a.d, 0, 0.45), up = K.ph(a.t, a.d, 0.45, 0.6), bonk = 0.45;
    const y = Math.max(780, 700 + sinkK * 600 - up * 900);
    ctx.save(); ctx.translate(540, y); ctx.rotate(Math.sin(a.t * 3) * 0.3); K.drawFullBody(ctx, 0, -300, 0.26, a.who, { mood: 'shocked', arms: 'up', t: a.t, closed: a.t > a.d * bonk }); ctx.restore();
    for (let i = 0; i < 12; i++) { const q = (a.t * 1.2 + i / 12) % 1; ctx.globalAlpha = 1 - q; K.C(ctx, 520 + (i % 4) * 25, y - 380 - q * 300, 10 + (i % 3) * 5, '#ffffff', 3); } ctx.globalAlpha = 1;
    if (a.t > a.d * bonk) { for (let i = 0; i < 5; i++) { const an = a.t * 4 + i * 1.25; ctx.save(); ctx.translate(540 + Math.cos(an) * 120, Math.max(330, y - 420) + Math.sin(an) * 30); ctx.scale(0.3, 0.3); K.PROPS.estrella(ctx, a.t); ctx.restore(); } }
    K.flash(ctx, a.t, a.d * bonk, 0.12);
    K.text(ctx, '¡BONK!', 780, 600, { size: 110, color: '#ffd166', k: K.ph(a.t, a.d, 0.45, 0.55), rot: 0.2 });
  },
  // 14. Y sale a flote. Sobrevive otra vez -> sale del agua boqueando, el sol brilla y llega un bote de rescate
  13: (ctx, a, K) => {
    sea(ctx, a, K, 'atardecer', 1100);
    const rise = K.ease.outBack(K.ph(a.t, a.d, 0, 0.3));
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 1080, 1260); ctx.clip(); violet(ctx, a, K, 540, 1500 - rise * 380, 0.75, 'shocked', 'enfermera'); ctx.restore();
    ctx.fillStyle = 'rgba(47,140,190,0.85)'; ctx.fillRect(0, 1260, 1080, 660);
    for (let i = 0; i < 10; i++) { const q = K.ph(a.t, a.d, 0, 0.35); K.C(ctx, 540 + Math.cos(i * 0.7) * 300 * q, 1240 - Math.sin(i * 0.7 + 0.3) * 260 * q + 200 * q * q, 16, '#ffffff', 4); }
    const boat = K.ease.out(K.ph(a.t, a.d, 0.4, 0.9)); lifeboat(ctx, K, 1300 - boat * 450, 1330, 0.8, a.t, 2);
    K.text(ctx, 'SOBREVIVE', 540, 560, { size: 130, color: '#5fd38a', k: K.ph(a.t, a.d, 0.35, 0.5) });
  },
  // 15. Antes de saltar, volvió al camarote a por su cepillo de dientes -> camarote inclinado, el agua entra por la puerta y su mano coge el cepillo
  14: (ctx, a, K) => {
    ctx.save(); ctx.translate(540, 960); ctx.rotate(0.12); ctx.translate(-540, -960);
    K.drawPlace(ctx, 'dormitorio', 'dia', a.t); ctx.restore();
    const w = K.ph(a.t, a.d, 0, 1); ctx.fillStyle = 'rgba(47,140,190,0.7)'; ctx.fillRect(0, 1700 - w * 250, 1080, 600);
    K.R(ctx, 300, 1150, 480, 60, 10, '#c98a4b', 8); // estante
    const grab = K.ease.inOut(K.ph(a.t, a.d, 0.2, 0.55));
    ctx.save(); ctx.translate(540, 1120 - grab * 260); ctx.rotate(-0.2 - grab * 0.4); K.R(ctx, -14, -150, 28, 260, 14, '#7bdff2', 6); K.R(ctx, -22, -180, 44, 70, 10, '#ffffff', 5); ctx.restore();
    if (grab >= 1) K.sparkles(ctx, 540, 860, a.t, 8, 160);
    K.text(ctx, 'SU CEPILLO', 540, 560, { size: 120, color: '#ffffff', k: K.ph(a.t, a.d, 0.5, 0.65) });
  },
  // 16. Lo había echado de menos en el Titanic -> recuerdo en sepia: se cepilla los dientes sonriendo, con el Titanic en un cuadro
  15: (ctx, a, K) => {
    K.drawPlace(ctx, 'dormitorio', 'dia', a.t);
    ctx.save(); ctx.translate(820, 640); K.R(ctx, -150, -100, 300, 200, 8, '#8b5a2b', 8); ctx.save(); ctx.beginPath(); ctx.rect(-130, -80, 260, 160); ctx.clip(); sea(ctx, { t: a.t }, K, 'dia', 0); ctx.restore(); ctx.save(); ctx.scale(0.22, 0.22); liner(ctx, K, 0, 120, 1, { t: a.t }); ctx.restore(); ctx.restore();
    violet(ctx, a, K, 420, 1100, 0.78, 'happy', 'camarera');
    const b = Math.sin(a.t * 14) * 30; ctx.save(); ctx.translate(500 + b, 1200); ctx.rotate(-0.3); K.R(ctx, -12, -20, 220, 26, 12, '#7bdff2', 5); K.R(ctx, -30, -34, 50, 40, 8, '#ffffff', 4); ctx.restore();
    for (let i = 0; i < 5; i++) { const q = (a.t * 1.5 + i / 5) % 1; ctx.globalAlpha = 1 - q; K.C(ctx, 470 + (i - 2) * 30, 1180 - q * 120, 10, '#ffffff', 3); } ctx.globalAlpha = 1;
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgba(200,160,110,0.45)'; ctx.fillRect(0, 0, 1080, 1920); ctx.restore(); // sepia de recuerdo
  },
  // 17. Murió en tierra firme, a los 83 años -> ya mayor, en el jardín de su casa de campo, tranquila; el mar queda lejos
  16: (ctx, a, K) => {
    K.drawPlace(ctx, 'campo', 'atardecer', a.t);
    K.prop(ctx, 'casa', 820, 1300, 0.9, a.t);
    for (let i = 0; i < 7; i++) { const x = 80 + i * 150; ctx.save(); ctx.translate(x, 1560); ctx.rotate(Math.sin(a.t * 2 + i) * 0.1); K.L(ctx, [[0, 0], [0, -90]], '#3e9c57', 8); K.C(ctx, 0, -100, 22, ['#ff8fab', '#ffd166', '#bb6bd9'][i % 3], 5); ctx.restore(); }
    K.midShot(ctx, { ...a.who }, { x: 400, y: 1080, s: 0.68, mood: 'happy', t: a.t, seed: 2 });
    ctx.save(); ctx.translate(400, 1080); ctx.scale(0.68, 0.68); ctx.fillStyle = 'rgba(235,235,240,0.85)'; ctx.beginPath(); ctx.ellipse(0, -170, 230, 120, 0, Math.PI, 0); ctx.fill(); ctx.restore(); // pelo canoso
    K.text(ctx, '83 AÑOS', 760, 1560, { size: 130, color: '#ffd166', k: K.ph(a.t, a.d, 0.2, 0.35) });
    K.text(ctx, 'EN TIERRA FIRME', 540, 1760, { size: 80, color: '#ffffff', k: K.ph(a.t, a.d, 0.35, 0.5) });
  },
};
