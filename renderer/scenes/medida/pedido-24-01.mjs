// Escenas a medida de pedido-24-01: «The Man Who Survived Two Atomic Bombs: Tsutomu Yamaguchi»
// Tono respetuoso: la explosión se muestra como luz y nube a lo lejos, sin víctimas.

function mushroom(ctx, K, x, base, s, k, t) { // nube en forma de hongo: tallo ancho y bajo, sombrero grande que crece
  if (k <= 0) return; ctx.save(); ctx.translate(x, base); ctx.scale(s, s);
  const e = K.ease.out(k), h = 620 * e;
  K.radial(ctx, 0, -h * 0.5, 600 * e, '#fff3c4', 0.6 * (1 - k * 0.5));
  ctx.fillStyle = '#cfc4b8'; ctx.beginPath(); ctx.moveTo(-170, 0); ctx.bezierCurveTo(-60, -h * 0.4, -110, -h * 0.75, -90, -h); ctx.lineTo(90, -h); ctx.bezierCurveTo(110, -h * 0.75, 60, -h * 0.4, 170, 0); ctx.closePath(); ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = K.INK; ctx.stroke();
  K.E(ctx, 0, -h * 0.55, 190 * e, 40 * e, '#ddd3c8', 0, 6); // anillo
  const cw = 380 * e, ch = 210 * e;
  for (let i = 0; i < 11; i++) { const an = Math.PI + i / 10 * Math.PI, r = (70 + 25 * Math.sin(i * 2.1 + t)) * e; K.C(ctx, Math.cos(an) * cw * 0.85, -h - 40 + Math.sin(an) * ch * 0.9, r, i % 2 ? '#e8e0d6' : '#c9bfb4', 6); }
  K.E(ctx, 0, -h - 40, cw, ch * 0.75, '#f0e9e1', 0, 7);
  for (let i = 0; i < 7; i++) { const an = i / 7 * Math.PI * 2 + t * 0.4; K.C(ctx, Math.cos(an) * cw * 0.5, -h - 40 + Math.sin(an) * ch * 0.35, 60 * e, '#e3dbd1', 0); }
  for (let i = 0; i < 9; i++) K.C(ctx, -320 + i * 80, -10 + Math.sin(i * 1.7) * 10, (70 + (i % 3) * 20) * e, '#c2b8ac', 6); // polvo en la base
  ctx.restore();
}
function city(ctx, a, K, hora = 'dia') { // ciudad japonesa de los años 40: casas bajas de tejado oscuro
  K.drawPlace(ctx, 'campo', hora, a.t);
  for (let i = 0; i < 9; i++) { const x = 60 + i * 120, h = 120 + (i * 53) % 90; K.R(ctx, x - 50, 1350 - h, 100, h, 4, i % 2 ? '#e8dcc4' : '#d6c6a8', 6); K.P(ctx, [[x - 70, 1350 - h], [x, 1300 - h - 50], [x + 70, 1350 - h]], '#3c3f4a', 6); }
}
function briefcase(ctx, K, x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); K.R(ctx, -70, -20, 140, 100, 10, '#7a4a2a', 6); K.R(ctx, -25, -45, 50, 30, 8, 'rgba(0,0,0,0)', 6); ctx.restore(); }
function bandage(ctx, K, x, y, s) { // venda alrededor de la frente y tirita en la mejilla (la cabeza del plano medio está en x, y)
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.06);
  K.R(ctx, -235, -215, 470, 78, 30, '#fbfbf6', 7); ctx.strokeStyle = '#d9d9d2'; ctx.lineWidth = 4; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-200 + i * 95, -210); ctx.lineTo(-170 + i * 95, -142); ctx.stroke(); }
  ctx.save(); ctx.translate(140, 70); ctx.rotate(0.5); K.R(ctx, -55, -20, 110, 40, 12, '#f2c79a', 5); ctx.restore();
  ctx.restore();
}
function card(ctx, K, x, y, k, lines) {
  if (k <= 0) return; ctx.save(); ctx.translate(x + (1 - K.ease.out(k)) * 900, y); ctx.rotate(-0.04);
  K.R(ctx, -380, -160, 760, 320, 24, '#fbf6e8', 8); K.R(ctx, -350, -120, 200, 240, 12, '#d8cbb0', 5);
  ctx.fillStyle = K.INK; ctx.textAlign = 'left'; ctx.font = '58px Anton'; ctx.fillText(lines[0], -120, -60); ctx.font = '38px Poppins'; lines.slice(1).forEach((l, i) => ctx.fillText(l, -120, 0 + i * 52));
  ctx.restore();
}
function calendarPage(ctx, K, x, y, s, top, big, k = 1) {
  if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s * K.ease.outBack(Math.min(1, k)), s * K.ease.outBack(Math.min(1, k)));
  K.R(ctx, -170, -190, 340, 380, 20, '#ffffff', 8); K.R(ctx, -170, -190, 340, 100, 20, '#d64545', 8);
  ctx.fillStyle = '#fff'; ctx.font = '58px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(top, 0, -138);
  ctx.fillStyle = K.INK; ctx.font = '170px Anton'; ctx.fillText(big, 0, 50); ctx.restore();
}
function people(ctx, K, n, k, cols, x0, y0, gap, t, fade = 1) {
  for (let i = 0; i < n; i++) { const q = K.clamp(k * n - i); if (q <= 0) break; const x = x0 + (i % cols) * gap, y = y0 + Math.floor(i / cols) * gap * 1.3;
    ctx.save(); ctx.globalAlpha = fade; ctx.translate(x, y + Math.sin(t * 2 + i) * 3); ctx.scale(K.ease.outBack(q), K.ease.outBack(q)); K.C(ctx, 0, -gap * 0.35, gap * 0.2, '#f3c9a1', 3); K.R(ctx, -gap * 0.22, -gap * 0.14, gap * 0.44, gap * 0.5, gap * 0.15, '#5b6a8a', 3); ctx.restore(); }
}

export default {
  // 1. This man survived two atomic bombs -> dos nubes de hongo a los lados y el hombre en medio; "x2"
  0: (ctx, a, K) => {
    K.drawPlace(ctx, 'campo', 'atardecer', a.t);
    mushroom(ctx, K, 220, 1350, 0.55, K.ph(a.t, a.d, 0, 0.5), a.t);
    mushroom(ctx, K, 860, 1350, 0.55, K.ph(a.t, a.d, 0.25, 0.75), a.t);
    K.drawFullBody(ctx, 540, 1080, 0.17, a.who, { mood: 'shocked', t: a.t });
    briefcase(ctx, K, 620, 1500, 0.8);
    K.text(ctx, 'x2', 540, 700, { size: 220, color: '#ffd166', k: K.ph(a.t, a.d, 0.55, 0.7), rot: -0.1 });
  },
  // 2. How did one man survive both...? -> primer plano sorprendido; dos iconos de bomba con interrogantes
  1: (ctx, a, K) => {
    K.drawPlace(ctx, 'ciudad', 'dia', a.t);
    K.midShot(ctx, a.who, { x: 540, y: 1250, s: 0.95, mood: 'shocked', t: a.t });
    for (let i = 0; i < 2; i++) { const q = K.ph(a.t, a.d, 0.15 + i * 0.2, 0.3 + i * 0.2); if (q <= 0) continue; ctx.save(); ctx.translate(220 + i * 640, 680); ctx.scale(K.ease.outBack(q), K.ease.outBack(q)); K.C(ctx, 0, 0, 120, '#ffffff', 8); mushroom(ctx, K, 0, 70, 0.16, 1, a.t); ctx.restore(); }
    K.text(ctx, '?', 540, 640, { size: 230, color: '#ffd166', k: K.ph(a.t, a.d, 0.55, 0.7) });
  },
  // 3. Tsutomu Yamaguchi, 29, engineer, business trip to Hiroshima -> su ficha entra deslizando y un tren hacia Hiroshima
  2: (ctx, a, K) => {
    K.drawPlace(ctx, 'campo', 'dia', a.t);
    K.drawFullBody(ctx, 270, 700, 0.17, a.who, { mood: 'neutral', t: a.t }); briefcase(ctx, K, 350, 1100, 0.7);
    card(ctx, K, 540, 1400, K.ph(a.t, a.d, 0.05, 0.3), ['TSUTOMU YAMAGUCHI', 'Age: 29', 'Engineer']);
    const tk = K.ph(a.t, a.d, 0.45, 1); ctx.save(); ctx.translate(1300 - tk * 900, 860); K.prop(ctx, 'tren', 0, 0, 0.7, a.t); ctx.restore();
    K.text(ctx, 'HIROSHIMA', 780, 640, { size: 90, color: '#ffffff', k: K.ph(a.t, a.d, 0.5, 0.65) });
  },
  // 4. August sixth, 1945. Walking to work with a briefcase -> camina por la calle; calendario 6 AUG 1945 y reloj 8:15
  3: (ctx, a, K) => {
    city(ctx, a, K);
    const x = 200 + K.ph(a.t, a.d, 0, 1) * 500, bob = Math.abs(Math.sin(a.t * 6)) * 12;
    K.drawFullBody(ctx, x, 1000 - bob, 0.15, a.who, { mood: 'neutral', t: a.t }); briefcase(ctx, K, x + 70, 1260 - bob, 0.6);
    calendarPage(ctx, K, 240, 720, 0.8, 'AUG 1945', '6', K.ph(a.t, a.d, 0.05, 0.25));
    ctx.save(); ctx.translate(820, 720); const ck = K.ease.outBack(K.ph(a.t, a.d, 0.2, 0.4)); ctx.scale(ck, ck); K.C(ctx, 0, 0, 130, '#ffffff', 8);
    ctx.strokeStyle = K.INK; ctx.lineCap = 'round'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(-Math.PI / 2 + 8.25 / 12 * Math.PI * 2) * 60, Math.sin(-Math.PI / 2 + 8.25 / 12 * Math.PI * 2) * 60); ctx.stroke();
    ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(-Math.PI / 2 + 0.25 * Math.PI * 2) * 95, Math.sin(-Math.PI / 2 + 0.25 * Math.PI * 2) * 95); ctx.stroke(); ctx.restore();
    K.text(ctx, '8:15 AM', 820, 920, { size: 70, color: '#ffffff', k: K.ph(a.t, a.d, 0.35, 0.5) });
  },
  // 5. Two miles away, the first atomic bomb explodes -> destello en el horizonte, el hongo sube; flecha "2 MILES"
  4: (ctx, a, K) => {
    city(ctx, a, K);
    const k = K.ph(a.t, a.d, 0.15, 1);
    mushroom(ctx, K, 760, 1250, 0.6, k, a.t);
    K.flash(ctx, a.t, a.d * 0.15, 0.25);
    K.drawFullBody(ctx, 220, 1050, 0.14, a.who, { mood: 'shocked', t: a.t });
    if (k > 0.3) { ctx.save(); ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 12; ctx.setLineDash([26, 16]); ctx.beginPath(); ctx.moveTo(300, 1500); ctx.lineTo(700, 1500); ctx.stroke(); ctx.restore(); K.text(ctx, '2 MILES', 500, 1600, { size: 90, color: '#ffd166', k: K.ph(a.t, a.d, 0.35, 0.5) }); }
  },
  // 6. The blast bursts your eardrums and blinds you -> todo blanco; ondas en los oídos; los ojos se cierran y la imagen se pierde
  5: (ctx, a, K) => {
    city(ctx, a, K);
    K.midShot(ctx, a.who, { x: 540, y: 1250, s: 1, mood: 'shocked', t: a.t });
    for (let i = 0; i < 4; i++) { const q = (a.t * 1.5 + i * 0.25) % 1; ctx.save(); ctx.globalAlpha = 1 - q; ctx.strokeStyle = '#ff3b30'; ctx.lineWidth = 10; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(540 + sx * 260, 900, 40 + q * 160, sx < 0 ? Math.PI * 0.7 : -Math.PI * 0.3, sx < 0 ? Math.PI * 1.3 : Math.PI * 0.3); ctx.stroke(); } ctx.restore(); }
    const w = K.ph(a.t, a.d, 0.35, 0.9); ctx.fillStyle = `rgba(255,255,255,${0.2 + w * 0.75})`; ctx.fillRect(0, 0, 1080, 1920);
    K.text(ctx, 'EEEEE...', 540, 520, { size: 110, color: '#ff3b30', k: K.ph(a.t, a.d, 0.1, 0.25) });
  },
  // 7. Your upper body burns. But you're alive -> sentado entre escombros con vendas; latido en un monitor: ALIVE
  6: (ctx, a, K) => {
    city(ctx, a, K, 'atardecer'); ctx.fillStyle = 'rgba(120,90,70,0.35)'; ctx.fillRect(0, 0, 1080, 1920);
    K.prop(ctx, 'escombros', 220, 1480, 0.9, a.t); K.prop(ctx, 'escombros', 880, 1500, 0.8, a.t);
    K.midShot(ctx, a.who, { x: 540, y: 1250, s: 0.9, mood: 'worried', t: a.t });
    bandage(ctx, K, 540, 1250, 0.9); K.smoke(ctx, 160, 1750, a.t, 5); K.smoke(ctx, 920, 1760, a.t + 1, 5);
    ctx.save(); ctx.strokeStyle = '#2ec27e'; ctx.lineWidth = 10; ctx.beginPath(); const off = (a.t * 300) % 400;
    for (let x = 0; x <= 1080; x += 10) { const p = (x + off) % 400, y = 520 - (p > 180 && p < 200 ? 120 : p > 200 && p < 215 ? -60 : 0); x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.restore();
    K.text(ctx, 'ALIVE', 540, 680, { size: 120, color: '#2ec27e', k: K.ph(a.t, a.d, 0.45, 0.6) });
  },
  // 8. A night in a shelter, then a train home -> noche con estrellas; el tren pasa y él va en la ventana
  7: (ctx, a, K) => {
    K.drawPlace(ctx, 'campo', 'noche', a.t);
    const k = K.ph(a.t, a.d, 0, 1);
    ctx.save(); ctx.translate(1400 - k * 1700, 1150); K.prop(ctx, 'tren', 0, 0, 1.3, a.t); ctx.restore();
    ctx.save(); ctx.translate(1400 - k * 1700 - 60, 1060); ctx.scale(0.1, 0.1); K.drawHead(ctx, 0, 0, a.who, { mood: 'sad', t: a.t }); ctx.restore();
    K.text(ctx, 'HOME →', 540, 600, { size: 110, color: '#ffffff', k: K.ph(a.t, a.d, 0.3, 0.45) });
  },
  // 9. Home is Nagasaki. Another bomb is coming -> mapa: línea de Hiroshima a Nagasaki; un avión se acerca a Nagasaki
  8: (ctx, a, K) => {
    ctx.fillStyle = '#7fc8e8'; ctx.fillRect(0, 0, 1080, 1920);
    K.P(ctx, [[640, 260], [820, 420], [760, 700], [600, 900], [430, 1000], [300, 1120], [180, 1250], [240, 1420], [380, 1380], [520, 1200], [700, 1000], [900, 760], [980, 500]], '#9fd38a', 8);
    const pts = [[560, 980], [260, 1320]];
    const k = K.ease.inOut(K.ph(a.t, a.d, 0.05, 0.5));
    ctx.save(); ctx.strokeStyle = '#d64545'; ctx.lineWidth = 12; ctx.setLineDash([24, 14]); ctx.beginPath(); ctx.moveTo(...pts[0]); ctx.lineTo(pts[0][0] + (pts[1][0] - pts[0][0]) * k, pts[0][1] + (pts[1][1] - pts[0][1]) * k); ctx.stroke(); ctx.restore();
    K.C(ctx, ...pts[0], 22, '#ffffff', 6); K.text(ctx, 'HIROSHIMA', 760, 960, { size: 60, color: '#ffffff' });
    K.C(ctx, ...pts[1], 26, '#ff3b30', 6); K.text(ctx, 'NAGASAKI', 420, 1430, { size: 70, color: '#ffd166', k: K.ph(a.t, a.d, 0.4, 0.55) });
    const pk = K.ph(a.t, a.d, 0.55, 1); if (pk > 0) { ctx.save(); ctx.translate(-120 + pk * 330, 900 + pk * 330); ctx.rotate(0.8); K.prop(ctx, 'avion', 0, 0, 0.45, a.t); ctx.restore(); }
  },
  // 10. August ninth. Bandaged, you go back to work -> oficina, calendario 9 AUG, él vendado en su mesa
  9: (ctx, a, K) => {
    K.drawPlace(ctx, 'oficina', 'dia', a.t);
    K.midShot(ctx, a.who, { x: 600, y: 1200, s: 0.85, mood: 'worried', t: a.t }); bandage(ctx, K, 600, 1200, 0.85);
    K.R(ctx, 80, 1450, 920, 60, 10, '#a8794d', 8); K.R(ctx, 140, 1360, 260, 100, 10, '#f6efdc', 6);
    calendarPage(ctx, K, 250, 700, 0.85, 'AUG 1945', '9', K.ph(a.t, a.d, 0.1, 0.3));
  },
  // 11. You tell your boss: one bomb destroyed an entire city -> el jefe duda; bocadillo "1 BOMB = 1 CITY"
  10: (ctx, a, K) => {
    K.drawPlace(ctx, 'oficina', 'dia', a.t);
    const boss = K.personaWho('yamaguchi', { who: 'boss_yamaguchi' }), me = K.personaWho(a.seed, {});
    K.midShot(ctx, me, { x: 260, y: 1300, s: 0.7, mood: 'worried', t: a.t }); bandage(ctx, K, 260, 1300, 0.7);
    K.midShot(ctx, boss, { x: 820, y: 1300, s: 0.7, mood: 'neutral', t: a.t + 1 });
    const q = K.ph(a.t, a.d, 0.1, 0.3); if (q > 0) { ctx.save(); ctx.translate(320, 700); ctx.scale(K.ease.outBack(q), K.ease.outBack(q)); K.R(ctx, -230, -110, 460, 220, 40, '#ffffff', 8); ctx.fillStyle = K.INK; ctx.font = '62px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('1 BOMB =', 0, -35); ctx.fillText('1 CITY', 0, 40); ctx.restore(); }
    K.text(ctx, '?', 840, 700, { size: 200, color: '#ffd166', k: K.ph(a.t, a.d, 0.55, 0.7), rot: 0.2 });
  },
  // 12. He thinks you're crazy. Then the window turns white -> el jefe se ríe; la ventana se pone blanca y lo llena todo
  11: (ctx, a, K) => {
    K.drawPlace(ctx, 'oficina', 'dia', a.t);
    const w = K.ph(a.t, a.d, 0.5, 1);
    K.R(ctx, 340, 330, 400, 420, 12, '#bfe3ff', 10); ctx.save(); ctx.globalAlpha = w; K.R(ctx, 340, 330, 400, 420, 12, '#ffffff', 10); ctx.restore();
    K.R(ctx, 532, 330, 16, 420, 0, K.INK, 0); K.R(ctx, 340, 532, 400, 16, 0, K.INK, 0);
    const boss = K.personaWho('yamaguchi', { who: 'boss_yamaguchi' });
    K.midShot(ctx, boss, { x: 540, y: 1400, s: 0.85, mood: w > 0.1 ? 'shocked' : 'happy', t: a.t });
    if (w < 0.1) K.text(ctx, 'CRAZY!', 540, 920, { size: 120, color: '#ffffff', k: K.ph(a.t, a.d, 0.1, 0.25), rot: -0.1 });
    if (w > 0) { K.radial(ctx, 540, 540, 300 + w * 1500, '#ffffff', w); ctx.fillStyle = `rgba(255,255,255,${w * w * 0.9})`; ctx.fillRect(0, 0, 1080, 1920); }
  },
  // 13. Second bomb. Same distance. Same man. He survives again -> el hongo tras la ciudad; él se levanta de entre los escombros
  12: (ctx, a, K) => {
    city(ctx, a, K, 'atardecer');
    mushroom(ctx, K, 540, 1200, 0.6, K.ph(a.t, a.d, 0, 0.6), a.t);
    K.flash(ctx, a.t, 0, 0.3);
    K.prop(ctx, 'escombros', 540, 1560, 1.2, a.t);
    const up = K.ease.out(K.ph(a.t, a.d, 0.45, 0.85)); ctx.save(); ctx.translate(0, (1 - up) * 400); K.drawFullBody(ctx, 540, 1150, 0.15, a.who, { mood: 'worried', t: a.t }); ctx.restore();
    K.text(ctx, 'AGAIN', 540, 560, { size: 140, color: '#ffd166', k: K.ph(a.t, a.d, 0.75, 0.9) });
  },
  // 14. Around 160 people likely lived through both -> aparecen 160 figuritas
  13: (ctx, a, K) => {
    K.drawPlace(ctx, 'ciudad', 'dia', a.t); ctx.fillStyle = 'rgba(20,21,42,0.55)'; ctx.fillRect(0, 0, 1080, 1920);
    const k = K.ease.out(K.ph(a.t, a.d, 0.05, 0.8));
    people(ctx, K, 160, k, 16, 90, 520, 60, a.t);
    K.text(ctx, `${Math.round(k * 160)}`, 540, 1580, { size: 200, color: '#ffd166' });
  },
  // 15. Japan officially recognized only one: Yamaguchi -> las figuras se apagan menos una; sello OFFICIAL
  14: (ctx, a, K) => {
    K.drawPlace(ctx, 'ciudad', 'dia', a.t); ctx.fillStyle = 'rgba(20,21,42,0.55)'; ctx.fillRect(0, 0, 1080, 1920);
    const f = 1 - K.ph(a.t, a.d, 0.05, 0.4);
    people(ctx, K, 160, 1, 16, 90, 520, 60, a.t, Math.max(0.08, f));
    const z = K.ease.out(K.ph(a.t, a.d, 0.35, 0.6)); ctx.save(); ctx.translate(540, 1100); ctx.scale(0.5 + z * 0.5, 0.5 + z * 0.5); K.midShot(ctx, a.who, { x: 0, y: 0, s: 0.8, mood: 'neutral', t: a.t }); ctx.restore();
    const st = K.ph(a.t, a.d, 0.65, 0.75); if (st > 0) { ctx.save(); ctx.translate(540, 1560); ctx.rotate(-0.12); ctx.scale(1.6 - 0.6 * st, 1.6 - 0.6 * st); ctx.lineWidth = 12; ctx.strokeStyle = '#ff3b30'; ctx.strokeRect(-280, -80, 560, 160); ctx.fillStyle = '#ff3b30'; ctx.font = '110px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('OFFICIAL', 0, 6); ctx.restore(); }
  },
  // 16. It took until 2009. Sixty-four years later -> las hojas del calendario vuelan de 1945 a 2009
  15: (ctx, a, K) => {
    K.drawPlace(ctx, 'oficina', 'dia', a.t);
    const k = K.ease.inOut(K.ph(a.t, a.d, 0.05, 0.7)), y = Math.round(1945 + k * 64);
    for (let i = 0; i < 6; i++) { const q = (a.t * 2 + i / 6) % 1; if (k >= 1) break; ctx.save(); ctx.translate(540 + q * 500 * (i % 2 ? 1 : -1), 900 - q * 600); ctx.rotate(q * 3); ctx.globalAlpha = 1 - q; K.R(ctx, -120, -140, 240, 280, 14, '#ffffff', 6); ctx.restore(); }
    calendarPage(ctx, K, 540, 1000, 1.6, 'YEAR', String(y).slice(2), 1);
    K.text(ctx, String(y), 540, 1500, { size: 150, color: '#ffd166' });
    K.text(ctx, '64 YEARS', 540, 560, { size: 110, color: '#ffffff', k: K.ph(a.t, a.d, 0.7, 0.85) });
  },
  // 17. He was ninety-three. He died the next year -> anciano tranquilo al atardecer con su taza; los pájaros cruzan
  16: (ctx, a, K) => {
    K.drawPlace(ctx, 'campo', 'atardecer', a.t);
    const old = { ...a.who, hairColor: '#e8e8e8', hair: a.who.hair };
    K.midShot(ctx, old, { x: 540, y: 1250, s: 0.9, mood: 'happy', t: a.t, prop: 'taza' });
    ctx.fillStyle = 'rgba(255,255,255,0.0)';
    for (let i = 0; i < 3; i++) { const q = (a.t * 0.15 + i * 0.3) % 1; K.prop(ctx, 'pajaro', -100 + q * 1300, 420 + i * 60 + Math.sin(a.t * 3 + i) * 20, 0.3, a.t); }
    K.text(ctx, '93', 840, 760, { size: 180, color: '#ffd166', k: K.ph(a.t, a.d, 0.1, 0.25) });
  },
};
