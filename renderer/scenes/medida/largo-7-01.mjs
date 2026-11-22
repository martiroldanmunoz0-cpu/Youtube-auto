// Escenas a medida de largo-7-01: «What If You Were the Last Person on Earth? (1,000 Years)»
// Vídeo horizontal: los fondos van de K.X0 a K.X0 + K.XW (todo el ancho); lo importante, en la franja y≈300-1700.

function bg(ctx, K, c1, c2) { const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, c1); g.addColorStop(1, c2); ctx.fillStyle = g; ctx.fillRect(K.X0, 0, K.XW, 1920); }
// Skyline de Manhattan: rascacielos con ventanas (encendidas o apagadas) y algo de vegetación según los años
function skyline(ctx, K, t, { lights = 0, green = 0, ruin = 0, night = false } = {}) {
  for (let x = K.X0 - 40, i = 0; x < K.X0 + K.XW + 40; i++) {
    const w = 110 + (i * 37) % 90, h = 380 + (i * 173) % 620, top = 1450 - h + ruin * ((i * 61) % 200);
    const col = night ? ['#2a2f45', '#323854', '#262a3e'][i % 3] : ['#8fa3c4', '#a7b6d1', '#7f93b5'][i % 3];
    K.R(ctx, x, top, w, 1450 - top, 4, col, 6);
    if (i % 4 === 1 && ruin < 0.5) K.R(ctx, x + w / 2 - 6, top - 80, 12, 80, 2, col, 4);
    for (let wy = top + 30; wy < 1420; wy += 50) for (let wx = x + 14; wx < x + w - 20; wx += 32) {
      const on = lights > 0 && ((wx * 7 + wy * 13) % 100) / 100 < lights;
      ctx.fillStyle = on ? '#ffe28a' : night ? '#1b1e2e' : 'rgba(255,255,255,0.35)'; ctx.fillRect(wx, wy, 16, 24);
    }
    if (green > 0) { ctx.fillStyle = `rgba(70,150,70,${0.25 + green * 0.6})`; for (let k = 0; k < 6 * green; k++) { const vy = top + ((k * 97 + i * 31) % (1450 - top)); ctx.beginPath(); ctx.ellipse(x + (k * 41) % w, vy, 28 * green + 10, 40 * green + 10, 0, 0, 7); ctx.fill(); } }
    x += w + 8;
  }
}
function street(ctx, K, t, { grass = 0, night = false } = {}) {
  ctx.fillStyle = night ? '#24262f' : '#55595f'; ctx.fillRect(K.X0, 1450, K.XW, 470); K.R(ctx, K.X0, 1446, K.XW, 8, 0, K.INK, 0);
  ctx.fillStyle = '#e8e2c8'; for (let x = K.X0; x < K.X0 + K.XW; x += 180) ctx.fillRect(x, 1680, 100, 16);
  if (grass > 0) { ctx.fillStyle = '#5fb35a'; for (let x = K.X0; x < K.X0 + K.XW; x += 22) { const h = (20 + ((x * 13) % 60)) * grass; ctx.beginPath(); ctx.moveTo(x, 1460 + (x % 3) * 140); ctx.lineTo(x + 8 + Math.sin(t * 2 + x) * 4, 1460 + (x % 3) * 140 - h); ctx.lineTo(x + 16, 1460 + (x % 3) * 140); ctx.fill(); } }
}
function taxi(ctx, K, x, y, s, door = 0) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); K.R(ctx, -170, -70, 340, 90, 24, '#f6c344', 7); K.R(ctx, -100, -130, 190, 70, 20, '#f6c344', 7); K.R(ctx, -80, -118, 70, 48, 8, '#bfe3ff', 5); K.R(ctx, 0, -118, 70, 48, 8, '#bfe3ff', 5); K.C(ctx, -100, 25, 34, '#22232b', 6); K.C(ctx, 110, 25, 34, '#22232b', 6);
  if (door) { ctx.save(); ctx.translate(20, -70); ctx.rotate(-0.9 * door); K.R(ctx, 0, 0, 80, 70, 6, '#e8b33a', 6); ctx.restore(); } ctx.restore(); }
function tree(ctx, K, x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); K.R(ctx, -18, -160, 36, 170, 10, '#7a5230', 6); K.C(ctx, 0, -230, 110, '#4fa65a', 7); K.C(ctx, -70, -190, 70, '#5fb86a', 6); K.C(ctx, 70, -190, 70, '#5fb86a', 6); ctx.restore(); }
function deer(ctx, K, x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const st = Math.sin(t * 4) * 8;
  K.E(ctx, 0, 0, 120, 60, '#b9824f', 0, 7); K.R(ctx, -90, 30, 18, 110 + st, 8, '#a8743f', 5); K.R(ctx, 70, 30, 18, 110 - st, 8, '#a8743f', 5); K.R(ctx, 90, -110, 40, 110, 14, '#b9824f', 6); K.E(ctx, 125, -120, 50, 32, '#b9824f', 0.3, 6);
  ctx.strokeStyle = '#6b4a2a'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(110, -150); ctx.lineTo(90, -210); ctx.lineTo(70, -230); ctx.moveTo(90, -210); ctx.lineTo(120, -240); ctx.stroke(); K.C(ctx, 140, -128, 6, K.INK, 0); ctx.restore(); }
function bigYear(ctx, K, txt, k, y = 620, col = '#ffd166') { K.text(ctx, txt, 540, y, { size: 180, color: col, k }); }
function flashlight(ctx, K, x, y, r, a) { ctx.save(); ctx.globalAlpha = a; K.radial(ctx, x, y, r * 2.5, '#fff7d0', 0.8); K.C(ctx, x, y, r, '#fffbe6', 0); ctx.restore(); }

export default {
  // 1. What if you were Earth's last person? -> la Tierra de noche desde el espacio y UNA sola luz que parpadea
  0: (ctx, a, K) => {
    bg(ctx, K, '#070a1f', '#101634'); for (let i = 0; i < 120; i++) K.C(ctx, K.X0 + (i * 397) % K.XW, (i * 233) % 1920, 2 + (i % 3), '#ffffff', 0);
    const z = 1 + K.ph(a.t, a.d, 0, 1) * 0.15; ctx.save(); ctx.translate(540, 1150); ctx.scale(z, z);
    K.C(ctx, 0, 0, 560, '#1d3c6e', 12); ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 560, 0, 7); ctx.clip(); K.E(ctx, -150, -120, 300, 200, '#2c4a2e', 0.3, 0); K.E(ctx, 230, 150, 200, 260, '#2c4a2e', -0.2, 0); ctx.restore();
    const blink = Math.sin(a.t * 5) > 0.3; if (blink) { K.radial(ctx, -120, -60, 90, '#fff2a0', 0.9); K.C(ctx, -120, -60, 12, '#fff8d0', 0); }
    ctx.restore();
    K.text(ctx, 'LAST ONE LEFT', 540, 560, { size: 130, color: '#ffffff', k: K.ph(a.t, a.d, 0.3, 0.45) });
  },
  // 2. You wake up tomorrow and every human is gone -> despiertas en tu cama, la ventana muestra la ciudad vacía
  1: (ctx, a, K) => {
    K.drawPlace(ctx, 'dormitorio', 'dia', a.t);
    const up = K.ease.out(K.ph(a.t, a.d, 0.1, 0.4));
    K.R(ctx, 120, 1350, 840, 220, 30, '#8a5a3a', 8); K.R(ctx, 140, 1270, 800, 120, 30, '#7fb3e0', 8);
    ctx.save(); ctx.translate(380, 1300 - up * 180); ctx.scale(0.5, 0.5); K.drawHead(ctx, 0, 0, a.who, { mood: up > 0.8 ? 'worried' : 'neutral', t: a.t, closed: up < 0.3 }); ctx.restore();
    K.text(ctx, 'HELLO?', 760, 820, { size: 110, color: '#ffffff', k: K.ph(a.t, a.d, 0.55, 0.7) });
  },
  // 3. Stay until the end: something out there is blinking -> horizonte oscuro con una luz que parpadea a lo lejos
  2: (ctx, a, K) => {
    bg(ctx, K, '#0b1030', '#1b2246'); skyline(ctx, K, a.t, { night: true }); street(ctx, K, a.t, { night: true });
    const on = (a.t % 1.2) < 0.25 || ((a.t % 1.2) > 0.4 && (a.t % 1.2) < 0.6);
    if (on) { K.radial(ctx, 900, 950, 160, '#ffffff', 0.9); K.C(ctx, 900, 950, 14, '#ffffff', 0); }
    K.text(ctx, '?', 900, 760, { size: 150, color: '#ffd166', k: K.ph(a.t, a.d, 0.3, 0.45) });
  },
  // 4. Taxis and delivery trucks sit frozen, doors hanging open -> calle con taxis parados y puertas abiertas balanceándose
  6: (ctx, a, K) => {
    bg(ctx, K, '#9fd3ff', '#e8f4ff'); skyline(ctx, K, a.t); street(ctx, K, a.t);
    for (let i = 0; i < 5; i++) taxi(ctx, K, K.X0 + 260 + i * (K.XW / 5), 1600 + (i % 2) * 120, 1.1, 0.6 + Math.sin(a.t * 1.5 + i) * 0.15);
    K.R(ctx, 620, 1360, 300, 200, 14, '#ffffff', 8); K.R(ctx, 920, 1430, 110, 130, 10, '#c0392b', 8);
    for (let i = 0; i < 6; i++) { const q = (a.t * 0.2 + i / 6) % 1; ctx.save(); ctx.globalAlpha = 0.7; ctx.translate(K.X0 + q * K.XW, 1700 - Math.sin(q * 9 + i) * 40); ctx.rotate(q * 6); K.R(ctx, -20, -14, 40, 28, 4, '#f6efdc', 3); ctx.restore(); }
  },
  // 5. You scream into the empty street -> gritas en medio de la avenida; el eco rebota en los edificios
  12: (ctx, a, K) => {
    bg(ctx, K, '#9fd3ff', '#e8f4ff'); skyline(ctx, K, a.t); street(ctx, K, a.t);
    K.drawFullBody(ctx, 540, 900, 0.22, a.who, { mood: 'shocked', t: a.t, arms: 'up' });
    for (let i = 0; i < 4; i++) { const q = (a.t * 0.8 + i * 0.25) % 1; ctx.save(); ctx.globalAlpha = 1 - q; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(540, 900, 120 + q * 900, 0, 7); ctx.stroke(); ctx.restore(); }
    K.text(ctx, 'ANYONE?!', 540, 560, { size: 150, color: '#ffd166', k: K.ph(a.t, a.d, 0.1, 0.25) });
  },
  // 6. By midnight, Manhattan is pitch black -> las ventanas se apagan de una en una de río a río
  18: (ctx, a, K) => {
    bg(ctx, K, '#0b1030', '#1b2246');
    skyline(ctx, K, a.t, { lights: Math.max(0, 1 - K.ph(a.t, a.d, 0.05, 0.85)), night: true }); street(ctx, K, a.t, { night: true });
    K.text(ctx, '12:00 AM', 540, 520, { size: 120, color: '#ffffff', k: K.ph(a.t, a.d, 0, 0.15) });
  },
  // 7. One week later. The hum is gone -> calendario arrancando hojas; la persona escucha (onda que se apaga)
  21: (ctx, a, K) => {
    K.drawPlace(ctx, 'salon', 'dia', a.t);
    const d = Math.min(7, 1 + Math.floor(K.ph(a.t, a.d, 0, 0.5) * 7));
    ctx.save(); ctx.translate(300, 900); K.R(ctx, -170, -190, 340, 380, 20, '#ffffff', 8); K.R(ctx, -170, -190, 340, 100, 20, '#d64545', 8); ctx.fillStyle = '#fff'; ctx.font = '60px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('DAY', 0, -138); ctx.fillStyle = K.INK; ctx.font = '170px Anton'; ctx.fillText(String(d), 0, 50); ctx.restore();
    K.midShot(ctx, a.who, { x: 760, y: 1300, s: 0.8, mood: 'worried', t: a.t });
    const amp = 1 - K.ph(a.t, a.d, 0.5, 0.9); ctx.strokeStyle = '#2f80ed'; ctx.lineWidth = 8; ctx.beginPath(); for (let x = K.X0; x < K.X0 + K.XW; x += 10) { const y = 420 + Math.sin(x / 20 + a.t * 10) * 40 * amp; x === K.X0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke();
    K.text(ctx, 'SILENCE', 540, 560, { size: 100, color: '#ffffff', k: K.ph(a.t, a.d, 0.8, 0.92) });
  },
  // 8. Plant after plant drops off the grid -> mapa de EE. UU. con puntos de luz que se apagan en cadena
  24: (ctx, a, K) => {
    bg(ctx, K, '#0a1028', '#141c3c');
    K.P(ctx, [[140, 700], [420, 640], [720, 660], [960, 720], [1000, 900], [900, 1050], [940, 1260], [760, 1240], [560, 1320], [380, 1250], [200, 1180], [120, 950]], '#1f2b4a', 8);
    const off = K.ph(a.t, a.d, 0.05, 0.9);
    for (let i = 0; i < 40; i++) { const x = 180 + (i * 97) % 760, y = 720 + (i * 53) % 520, o = (i / 40) < off; if (!o) { K.radial(ctx, x, y, 40, '#ffd166', 0.8); K.C(ctx, x, y, 7, '#fff3b0', 0); } else K.C(ctx, x, y, 6, '#3a4466', 0); }
    K.text(ctx, 'GRID: OFF', 540, 560, { size: 120, color: '#ff3b30', k: K.ph(a.t, a.d, 0.8, 0.9) });
  },
  // 9. Electric fences stop working, locks stop holding -> la valla del zoo se apaga y un león sale por la puerta
  30: (ctx, a, K) => {
    K.drawPlace(ctx, 'campo', 'dia', a.t);
    const k = K.ph(a.t, a.d, 0.3, 1);
    ctx.strokeStyle = '#5a5d63'; ctx.lineWidth = 8; for (let x = K.X0; x < K.X0 + K.XW; x += 60) { ctx.beginPath(); ctx.moveTo(x, 900); ctx.lineTo(x, 1400); ctx.stroke(); } for (let y = 950; y < 1400; y += 90) { ctx.beginPath(); ctx.moveTo(K.X0, y); ctx.lineTo(K.X0 + K.XW, y); ctx.stroke(); }
    if (a.t < a.d * 0.3 && Math.sin(a.t * 40) > 0) { ctx.strokeStyle = '#7fe0ff'; ctx.lineWidth = 6; ctx.beginPath(); for (let x = K.X0; x < K.X0 + K.XW; x += 30) ctx.lineTo(x, 950 + ((x / 30) % 2) * 20); ctx.stroke(); }
    K.R(ctx, 420, 1000, 240, 400, 10, '#3a3d44', 8); ctx.save(); ctx.translate(420, 1000); ctx.rotate(-1.2 * K.ease.out(Math.min(1, k * 2))); K.R(ctx, 0, 0, 240, 400, 10, '#6b737d', 8); ctx.restore();
    ctx.save(); ctx.translate(540 + K.ease.inOut(k) * 380, 1400); K.prop(ctx, 'leon', 0, -120, 1, a.t); ctx.restore();
    K.text(ctx, 'ZOO', 300, 820, { size: 100, color: '#ffffff' });
  },
  // 10. Day thirty. One whole month alone -> marcas de tiza en la pared hasta 30
  43: (ctx, a, K) => {
    bg(ctx, K, '#6b5a4a', '#4a3e33'); ctx.fillStyle = 'rgba(0,0,0,0.12)'; for (let y = 300; y < 1920; y += 80) ctx.fillRect(K.X0, y, K.XW, 6);
    const n = Math.round(K.ph(a.t, a.d, 0.05, 0.85) * 30);
    ctx.strokeStyle = '#f5f1e6'; ctx.lineWidth = 10; ctx.lineCap = 'round';
    for (let i = 0; i < n; i++) { const g = Math.floor(i / 5), j = i % 5, x = 120 + (g % 3) * 300 + j * 45, y = 420 + Math.floor(g / 3) * 260; ctx.beginPath(); if (j < 4) { ctx.moveTo(x, y); ctx.lineTo(x + 6, y + 170); } else { ctx.moveTo(x - 190, y + 150); ctx.lineTo(x + 10, y + 20); } ctx.stroke(); }
    K.text(ctx, `DAY ${n}`, 540, 1080, { size: 150, color: '#ffd166' });
  },
  // 11. Honey basically never spoils -> un tarro de miel brillante con la etiqueta "3,000 YEARS"
  48: (ctx, a, K) => {
    K.drawPlace(ctx, 'cocina', 'dia', a.t);
    const z = K.ease.outBack(K.ph(a.t, a.d, 0, 0.3)); ctx.save(); ctx.translate(540, 1150); ctx.scale(z, z);
    K.R(ctx, -200, -260, 400, 480, 60, '#f4a825', 10); K.R(ctx, -150, -320, 300, 80, 20, '#a8743f', 8); K.R(ctx, -130, -60, 260, 150, 20, '#fff7e0', 6);
    ctx.fillStyle = K.INK; ctx.font = '70px Anton'; ctx.textAlign = 'center'; ctx.fillText('HONEY', 0, 40); K.radial(ctx, -90, -150, 80, '#ffffff', 0.5); ctx.restore();
    for (let i = 0; i < 3; i++) { const q = (a.t * 0.5 + i / 3) % 1; K.prop(ctx, 'hormiga', 200 + q * 300, 1500 - i * 20, 0.2, a.t); }
    K.text(ctx, 'NEVER SPOILS', 540, 560, { size: 120, color: '#ffd166', k: K.ph(a.t, a.d, 0.35, 0.5) });
  },
  // 12. One pack spots you in the open, and you run -> una manada de perros salvajes te persigue por la calle
  60: (ctx, a, K) => {
    bg(ctx, K, '#9fd3ff', '#e8f4ff'); ctx.save(); ctx.translate(-((a.t * 300) % 400), 0); skyline(ctx, K, a.t, { green: 0.3 }); ctx.restore(); street(ctx, K, a.t, { grass: 0.3 });
    K.speedLines(ctx, 540, 1100, a.t, 0.4);
    const bob = Math.abs(Math.sin(a.t * 10)) * 20; K.drawFullBody(ctx, 760, 850 - bob, 0.2, a.who, { mood: 'shocked', t: a.t });
    for (let i = 0; i < 3; i++) { const bx = 200 + i * 150 + Math.sin(a.t * 3 + i) * 30, by = 1500 - Math.abs(Math.sin(a.t * 10 + i)) * 40; ctx.save(); ctx.translate(bx, by); K.prop(ctx, 'perro', 0, 0, 0.55, a.t); ctx.restore(); }
    K.text(ctx, 'RUN!', 760, 560, { size: 160, color: '#ff3b30', k: K.ph(a.t, a.d, 0.1, 0.2) });
  },
  // 13. One year in. Nature has been waiting -> la hierba y las enredaderas crecen sobre la ciudad en vivo
  68: (ctx, a, K) => {
    const g = K.ease.inOut(K.ph(a.t, a.d, 0.1, 1));
    bg(ctx, K, '#9fd3ff', '#e8f4ff'); skyline(ctx, K, a.t, { green: g }); street(ctx, K, a.t, { grass: g });
    for (let i = 0; i < 6; i++) tree(ctx, K, K.X0 + 150 + i * (K.XW / 6), 1700, 0.4 + g * 0.8, a.t);
    bigYear(ctx, K, 'YEAR 1', K.ph(a.t, a.d, 0, 0.15));
  },
  // 14. The pumps have no power -> el metro se inunda: el agua sube por el andén y la estación
  72: (ctx, a, K) => {
    bg(ctx, K, '#3a3f4a', '#23262e'); K.R(ctx, K.X0, 1100, K.XW, 40, 0, '#e8d27a', 0);
    for (let x = K.X0 + 100; x < K.X0 + K.XW; x += 420) { K.R(ctx, x, 500, 60, 600, 6, '#5a6070', 6); }
    ctx.fillStyle = '#c8c8c8'; ctx.font = '70px Anton'; ctx.textAlign = 'center'; ctx.fillText('SUBWAY', 540, 440);
    const lvl = K.ease.inOut(K.ph(a.t, a.d, 0.05, 1));
    ctx.fillStyle = 'rgba(60,150,200,0.75)'; ctx.fillRect(K.X0, 1920 - lvl * 1100, K.XW, lvl * 1100);
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 6; for (let i = 0; i < 6; i++) { const y = 1920 - lvl * 1100 + 10; const x = K.X0 + ((i * 300 + a.t * 120) % K.XW); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 80, y); ctx.stroke(); }
    K.text(ctx, 'FLOODED', 540, 1050, { size: 140, color: '#7fd0ff', k: K.ph(a.t, a.d, 0.6, 0.75) });
  },
  // 15. Entire avenues start to look like meadows -> la avenida es un prado con flores y ciervos paseando
  78: (ctx, a, K) => {
    bg(ctx, K, '#9fd3ff', '#e8f4ff'); skyline(ctx, K, a.t, { green: 0.8 });
    ctx.fillStyle = '#7cc46a'; ctx.fillRect(K.X0, 1450, K.XW, 470); street(ctx, K, a.t, { grass: 1 });
    for (let i = 0; i < 40; i++) K.C(ctx, K.X0 + (i * 173) % K.XW, 1500 + (i * 71) % 380, 10, ['#ff8fab', '#ffd166', '#ffffff'][i % 3], 3);
    deer(ctx, K, 400 + Math.sin(a.t * 0.5) * 60, 1560, 1, a.t); deer(ctx, K, 820, 1620, 0.8, a.t + 1);
    K.text(ctx, 'TIMES SQUARE', 540, 560, { size: 100, color: '#ffffff', k: K.ph(a.t, a.d, 0.2, 0.35) });
  },
  // 16. Years ten through fifty: cities crumble -> la ciudad envejece: óxido, grietas, pedazos que caen
  90: (ctx, a, K) => {
    const r = K.ease.inOut(K.ph(a.t, a.d, 0.1, 1));
    bg(ctx, K, '#c9d3dc', '#e8ecef'); skyline(ctx, K, a.t, { green: 0.9, ruin: r }); street(ctx, K, a.t, { grass: 1 });
    for (let i = 0; i < 8; i++) { const q = (a.t * 0.7 + i / 8) % 1; K.R(ctx, K.X0 + (i * 211) % K.XW, 700 + q * 800, 30, 22, 4, '#8a8f99', 4); }
    bigYear(ctx, K, `YEAR ${Math.round(10 + r * 40)}`, 1);
  },
  // 17. Skyscrapers suffer too -> un rascacielos con las ventanas reventadas y una grieta que crece
  96: (ctx, a, K) => {
    bg(ctx, K, '#c9d3dc', '#e8ecef'); street(ctx, K, a.t, { grass: 1 });
    K.R(ctx, 340, 300, 400, 1150, 6, '#8f9db0', 9); for (let y = 340; y < 1420; y += 70) for (let x = 370; x < 720; x += 60) { const br = ((x * 3 + y) % 7) < 3; K.R(ctx, x, y, 36, 44, 3, br ? '#2a2d36' : '#bfe3ff', 3); }
    const c = K.ph(a.t, a.d, 0.1, 0.9); ctx.strokeStyle = K.INK; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(540, 300); let x = 540; for (let y = 300; y < 300 + 1100 * c; y += 60) { x += ((y / 60) % 2 ? 30 : -30); ctx.lineTo(x, y); } ctx.stroke();
    ctx.fillStyle = 'rgba(70,150,70,0.6)'; for (let i = 0; i < 10; i++) { ctx.beginPath(); ctx.ellipse(350 + (i * 37) % 380, 1300 - i * 90, 30, 50, 0, 0, 7); ctx.fill(); }
  },
  // 18. Nobody comes. The fire keeps spreading -> incendio que avanza por los edificios
  102: (ctx, a, K) => {
    bg(ctx, K, '#3a2a2a', '#7a3a20'); skyline(ctx, K, a.t, { green: 0.5, ruin: 0.5, night: true }); street(ctx, K, a.t, { grass: 0.8, night: true });
    const front = K.X0 + K.ph(a.t, a.d, 0, 1) * K.XW;
    for (let x = K.X0; x < front; x += 120) { ctx.save(); ctx.translate(x + 60, 1300 - ((x * 7) % 300)); K.prop(ctx, 'fuego', 0, 0, 1.2 + Math.sin(a.t * 6 + x) * 0.1, a.t); ctx.restore(); }
    K.smoke(ctx, 540, 600, a.t, 10, 'rgba(60,60,60,0.7)');
  },
  // 19. You're old, gray-haired, still walking -> la persona ya mayor camina con bastón entre las ruinas verdes
  108: (ctx, a, K) => {
    bg(ctx, K, '#ffcf9a', '#ffe8cc'); skyline(ctx, K, a.t, { green: 1, ruin: 0.7 }); street(ctx, K, a.t, { grass: 1 });
    const old = { ...a.who, hairColor: '#dcdcdc' }, x = 200 + K.ph(a.t, a.d, 0, 1) * 600, bob = Math.abs(Math.sin(a.t * 3)) * 6;
    K.drawFullBody(ctx, x, 900 - bob, 0.2, old, { mood: 'neutral', t: a.t });
    ctx.strokeStyle = '#7a5230'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(x + 90, 1170); ctx.lineTo(x + 130, 1370); ctx.stroke();
  },
  // 20. Fast forward 1,000 years -> el reloj de arena gira y el contador sube a 1,000
  113: (ctx, a, K) => {
    bg(ctx, K, '#1b1f4a', '#3a2a7a'); for (let i = 0; i < 80; i++) K.C(ctx, K.X0 + (i * 397) % K.XW, (i * 233) % 1920, 2 + (i % 3), '#ffffff', 0);
    ctx.save(); ctx.translate(540, 1050); ctx.rotate(a.t * 3); K.prop(ctx, 'reloj_arena', 0, 0, 1.6, a.t); ctx.restore();
    bigYear(ctx, K, `YEAR ${Math.round(K.ease.inOut(K.ph(a.t, a.d, 0.05, 0.85)) * 1000).toLocaleString('en-US')}`, 1, 520);
  },
  // 21. Forests cover every city, rivers carve new paths -> vista aérea: bosque sobre la cuadrícula de calles y un río serpenteante
  114: (ctx, a, K) => {
    bg(ctx, K, '#3f7f45', '#2f6a37');
    ctx.strokeStyle = 'rgba(30,60,30,0.4)'; ctx.lineWidth = 10; for (let x = K.X0; x < K.X0 + K.XW; x += 160) { ctx.beginPath(); ctx.moveTo(x, 300); ctx.lineTo(x, 1800); ctx.stroke(); } for (let y = 300; y < 1800; y += 160) { ctx.beginPath(); ctx.moveTo(K.X0, y); ctx.lineTo(K.X0 + K.XW, y); ctx.stroke(); }
    for (let i = 0; i < 70; i++) K.C(ctx, K.X0 + (i * 151) % K.XW, 320 + (i * 89) % 1460, 40 + (i % 3) * 14, ['#4fa65a', '#5fb86a', '#3f9150'][i % 3], 5);
    const k = K.ph(a.t, a.d, 0, 0.8); ctx.strokeStyle = '#4cc3f0'; ctx.lineWidth = 60; ctx.lineCap = 'round'; ctx.beginPath(); for (let y = 300; y < 300 + 1500 * k; y += 20) { const x = 540 + Math.sin(y / 180) * 260; y === 300 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke();
  },
  // 22. The pyramids of Giza still stand -> las pirámides al atardecer, intactas, con la arena volando
  120: (ctx, a, K) => {
    K.drawPlace(ctx, 'desierto', 'atardecer', a.t);
    K.prop(ctx, 'piramide', 380, 1350, 1.5, a.t); K.prop(ctx, 'piramide', 760, 1380, 1.1, a.t);
    ctx.fillStyle = 'rgba(255,220,160,0.6)'; for (let i = 0; i < 50; i++) { const x = K.X0 + ((i * 157 + a.t * 300) % K.XW), y = 1300 + (i * 37) % 400; ctx.fillRect(x, y, 10, 3); }
    K.text(ctx, 'STILL STANDING', 540, 520, { size: 110, color: '#ffd166', k: K.ph(a.t, a.d, 0.3, 0.45) });
  },
  // 23. Footprints on the Moon: only tiny meteorites wear them down -> huella en la Luna y micrometeoritos cayendo
  126: (ctx, a, K) => {
    bg(ctx, K, '#05060f', '#11132a'); for (let i = 0; i < 80; i++) K.C(ctx, K.X0 + (i * 397) % K.XW, (i * 233) % 900, 2, '#ffffff', 0);
    ctx.fillStyle = '#b9bcc6'; ctx.fillRect(K.X0, 1200, K.XW, 720); K.R(ctx, K.X0, 1196, K.XW, 8, 0, K.INK, 0);
    ctx.save(); ctx.translate(540, 1330); ctx.rotate(-1.3); K.R(ctx, -90, -180, 180, 360, 80, '#8d909b', 6); ctx.fillStyle = '#7a7d88'; for (let i = 0; i < 6; i++) ctx.fillRect(-80, -150 + i * 55, 160, 18); ctx.restore();
    for (let i = 0; i < 6; i++) { const q = (a.t * 0.6 + i / 6) % 1; K.C(ctx, K.X0 + (i * 311 + q * 200) % K.XW, 300 + q * 900, 5, '#ffd166', 0); }
    K.prop(ctx, 'tierra', 860, 650, 0.8, a.t);
  },
  // 24. Something catches your eye on the horizon -> de noche, una luz lejana se enciende tras las colinas
  132: (ctx, a, K) => {
    bg(ctx, K, '#0b1030', '#1b2246'); for (let i = 0; i < 80; i++) K.C(ctx, K.X0 + (i * 397) % K.XW, (i * 233) % 1100, 2, '#ffffff', 0);
    ctx.fillStyle = '#1d2a1f'; ctx.beginPath(); ctx.moveTo(K.X0, 1350); for (let x = K.X0; x <= K.X0 + K.XW; x += 100) ctx.lineTo(x, 1300 + Math.sin(x / 200) * 60); ctx.lineTo(K.X0 + K.XW, 1920); ctx.lineTo(K.X0, 1920); ctx.fill();
    const l = K.ph(a.t, a.d, 0.3, 0.6); if (l > 0) flashlight(ctx, K, 860, 1260, 14, l);
    const old = { ...a.who, hairColor: '#dcdcdc' }; K.midShot(ctx, old, { x: 300, y: 1150, s: 0.6, mood: 'shocked', t: a.t });
  },
  // 25. Three short flashes, then a pause -> la luz parpadea en morse: tres cortos y pausa
  135: (ctx, a, K) => {
    bg(ctx, K, '#0b1030', '#1b2246');
    ctx.fillStyle = '#1d2a1f'; ctx.fillRect(K.X0, 1300, K.XW, 620);
    const ph = a.t % 2.2, on = ph < 1.2 && (ph % 0.4) < 0.2; flashlight(ctx, K, 540, 1000, 24, on ? 1 : 0.1);
    for (let i = 0; i < 3; i++) K.C(ctx, 380 + i * 160, 1250, 30, (ph > i * 0.4 && ph < 1.2) ? '#ffd166' : '#3a4466', 6);
  },
  // 26. That's SOS -> las letras S O S en morse: · · · — — — · · ·
  138: (ctx, a, K) => {
    bg(ctx, K, '#0b1030', '#1b2246');
    const k = K.ph(a.t, a.d, 0, 0.7), marks = [0, 0, 0, 1, 1, 1, 0, 0, 0];
    marks.forEach((m, i) => { if (i / 9 > k) return; const x = 140 + i * 100 + Math.floor(i / 3) * 30; m ? K.R(ctx, x - 40, 860, 80, 30, 14, '#ffd166', 5) : K.C(ctx, x, 875, 20, '#ffd166', 5); });
    K.text(ctx, 'S O S', 540, 1150, { size: 220, color: '#ffffff', k: K.ph(a.t, a.d, 0.6, 0.75) });
  },
  // 27. The light stops. Only silence -> la luz se apaga; solo estrellas y la silueta mirando
  141: (ctx, a, K) => {
    bg(ctx, K, '#05060f', '#11132a'); for (let i = 0; i < 100; i++) K.C(ctx, K.X0 + (i * 397) % K.XW, (i * 233) % 1300, 2, '#ffffff', 0);
    ctx.fillStyle = '#0d150e'; ctx.fillRect(K.X0, 1350, K.XW, 570);
    flashlight(ctx, K, 860, 1300, 14, 1 - K.ph(a.t, a.d, 0, 0.3));
    ctx.fillStyle = '#05060a'; K.C(ctx, 300, 1100, 70, '#05060a', 0); K.R(ctx, 230, 1170, 140, 300, 60, '#05060a', 0);
  },
  // 28. So... are you really the last person on Earth? -> primer plano con la luz lejana reflejada en los ojos
  144: (ctx, a, K) => {
    bg(ctx, K, '#0b1030', '#1b2246');
    const old = { ...a.who, hairColor: '#dcdcdc' }; const z = 1 + K.ph(a.t, a.d, 0, 1) * 0.2; ctx.save(); ctx.translate(540, 1250); ctx.scale(z, z); K.midShot(ctx, old, { x: 0, y: 0, s: 0.9, mood: 'shocked', t: a.t }); ctx.restore();
    if (Math.sin(a.t * 4) > 0) { K.radial(ctx, 900, 500, 120, '#ffffff', 0.9); }
    K.text(ctx, '?', 200, 600, { size: 220, color: '#ffd166', k: K.ph(a.t, a.d, 0.4, 0.55) });
  },
};
