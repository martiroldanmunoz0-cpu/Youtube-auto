// Escenas a medida de pedido-26-01: «What If You Dug Straight Down? Where You'd Really Come Out»

const ROCK = ['#8b5a2b', '#a9825e', '#8a6a4e', '#6e5444', '#5a4238', '#4a3430'];
function farm(ctx, a, K, hora = 'dia') { // granja de Kansas: trigo dorado y un granero rojo
  K.drawPlace(ctx, 'campo', hora, a.t);
  K.R(ctx, 760, 900, 240, 200, 6, '#c0392b', 8); K.P(ctx, [[740, 900], [880, 790], [1020, 900]], '#8e2a20', 8); K.R(ctx, 845, 990, 70, 110, 4, '#f4e1c1', 6);
  ctx.fillStyle = '#e8c35a'; ctx.fillRect(0, 1120, 1080, 120); ctx.strokeStyle = '#c99a2e'; ctx.lineWidth = 5;
  for (let x = 10; x < 1080; x += 26) { const sw = Math.sin(a.t * 2 + x / 60) * 8; ctx.beginPath(); ctx.moveTo(x, 1240); ctx.lineTo(x + sw, 1120); ctx.stroke(); }
}
function section(ctx, K, top, t) { // corte del suelo por capas
  const h = (1920 - top) / ROCK.length;
  ROCK.forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(0, top + i * h); for (let x = 0; x <= 1080; x += 60) ctx.lineTo(x, top + i * h + Math.sin(x / 140 + i) * 14); ctx.lineTo(1080, 1920); ctx.lineTo(0, 1920); ctx.fill(); });
  for (let i = 0; i < 60; i++) K.C(ctx, (i * 131) % 1080, top + 40 + (i * 97) % (1900 - top), 6 + (i % 4) * 3, 'rgba(0,0,0,0.14)', 0);
  K.R(ctx, 0, top - 8, 1080, 16, 0, K.INK, 0);
}
function shovel(ctx, K, x, y, s, rot) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); K.R(ctx, -10, -320, 20, 320, 8, '#9b6b3a', 5); K.P(ctx, [[-60, 0], [60, 0], [50, 110], [0, 150], [-50, 110]], '#a9b3bd', 6); ctx.restore(); }
function globe(ctx, K, x, y, r, t, rot = 0) {
  K.C(ctx, x, y, r, '#3a8fd6', 10);
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.clip();
  const off = ((t * 40 + rot) % (r * 4));
  for (let i = -1; i < 3; i++) { const cx = x - r * 2 + off + i * r * 2; K.E(ctx, cx, y - r * 0.3, r * 0.45, r * 0.35, '#6cc070', 0.3, 6); K.E(ctx, cx + r * 0.6, y + r * 0.35, r * 0.3, r * 0.45, '#6cc070', -0.2, 6); }
  ctx.restore(); ctx.lineWidth = 10; ctx.strokeStyle = K.INK; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke();
}
function thermo(ctx, K, x, y, lvl, label, val) {
  K.R(ctx, x - 40, y - 600, 80, 620, 40, '#ffffff', 8); K.C(ctx, x, y + 40, 75, '#ff3b30', 8);
  ctx.fillStyle = '#ff3b30'; ctx.fillRect(x - 22, y - 560 * lvl, 44, 560 * lvl + 20);
  K.text(ctx, label, x, y - 680, { size: 70, color: '#ffffff' }); K.text(ctx, val, x, y + 190, { size: 90, color: '#ffd166' });
}
function derrick(ctx, K, x, base, s, t) { // torre de perforación con la broca girando
  ctx.save(); ctx.translate(x, base); ctx.scale(s, s);
  ctx.strokeStyle = '#c94b3a'; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(-160, 0); ctx.lineTo(-30, -760); ctx.lineTo(30, -760); ctx.lineTo(160, 0); ctx.stroke();
  ctx.lineWidth = 8; for (let i = 1; i < 8; i++) { const y = -i * 95, w = 160 - i * 16; ctx.beginPath(); ctx.moveTo(-w, y); ctx.lineTo(w, y - 95); ctx.moveTo(w, y); ctx.lineTo(-w, y - 95); ctx.stroke(); }
  K.R(ctx, -200, -40, 400, 60, 10, '#5a5d63', 8);
  ctx.save(); ctx.translate(0, -60); ctx.rotate(Math.sin(t * 8) * 0.05); K.R(ctx, -14, -420, 28, 420, 8, '#9aa6b2', 5); ctx.restore();
  ctx.restore();
}
function cap(ctx, K, x, y, s, t) { // tapa metálica oxidada con tornillos
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  K.E(ctx, 0, 30, 260, 70, '#5a5d63'); K.E(ctx, 0, 0, 220, 60, '#9b5a32');
  ctx.fillStyle = 'rgba(70,30,15,0.5)'; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.ellipse(-150 + (i * 47) % 300, -20 + (i * 23) % 40, 24, 8, 0.3, 0, 7); ctx.fill(); }
  for (let i = 0; i < 10; i++) { const an = i / 10 * Math.PI * 2; K.C(ctx, Math.cos(an) * 190, Math.sin(an) * 48, 10, '#3a3d44', 4); }
  ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 3); K.radial(ctx, -80, -20, 60, '#ffffff', 0.7); ctx.restore();
}
function sweat(ctx, K, x, y, t) { for (let i = 0; i < 3; i++) { const q = (t * 1.3 + i * 0.33) % 1; K.E(ctx, x + i * 50 - 50, y + q * 160, 12, 18, '#8fd3ff', 0, 4); } }
function earthCut(ctx, K, x, y, r, t, glow = 0.6) { // la Tierra cortada: corteza, manto, núcleo
  K.C(ctx, x, y, r, '#5a7d3a', 10); K.C(ctx, x, y, r * 0.93, '#d9783a', 6); K.C(ctx, x, y, r * 0.55, '#f2a93b', 6); K.C(ctx, x, y, r * 0.3, '#fff1a0', 6);
  K.radial(ctx, x, y, r * 0.5, '#fff7c4', glow * (0.7 + 0.3 * Math.sin(t * 4)));
}

export default {
  // 1. What if you dug straight down from Kansas? -> granja de Kansas, la pala se clava y una flecha apunta hacia abajo
  0: (ctx, a, K) => {
    farm(ctx, a, K);
    section(ctx, K, 1240, a.t);
    const dig = Math.abs(Math.sin(a.t * 3));
    K.drawFullBody(ctx, 380, 700, 0.2, a.who, { mood: 'shocked', t: a.t });
    shovel(ctx, K, 560, 1160 + dig * 40, 1, 0.2);
    const k = K.ph(a.t, a.d, 0.2, 0.7); if (k > 0) { ctx.save(); ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 18; ctx.setLineDash([30, 20]); ctx.beginPath(); ctx.moveTo(560, 1320); ctx.lineTo(560, 1320 + 500 * k); ctx.stroke(); ctx.restore(); K.P(ctx, [[520, 1320 + 500 * k], [600, 1320 + 500 * k], [560, 1390 + 500 * k]], '#ffd166', 6); }
    K.text(ctx, 'KANSAS', 300, 1060, { size: 80, color: '#ffffff', k: K.ph(a.t, a.d, 0.1, 0.25) });
    K.text(ctx, '?', 820, 1500, { size: 220, color: '#ffffff', k: K.ph(a.t, a.d, 0.55, 0.7) });
  },
  // 2. Everyone says you'd pop out in China -> el globo con una línea de puntos atravesándolo; etiqueta MYTH
  1: (ctx, a, K) => {
    K.drawPlace(ctx, 'espacio', 'noche', a.t);
    globe(ctx, K, 540, 1050, 380, a.t);
    const k = K.ease.inOut(K.ph(a.t, a.d, 0.05, 0.6));
    ctx.save(); ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 12; ctx.setLineDash([24, 16]); ctx.beginPath(); ctx.moveTo(540, 670); ctx.lineTo(540, 670 + 760 * k); ctx.stroke(); ctx.restore();
    K.text(ctx, 'USA', 540, 620, { size: 70, color: '#ffffff' });
    if (k > 0.95) K.text(ctx, 'CHINA?', 540, 1500, { size: 100, color: '#ffffff', k: K.ph(a.t, a.d, 0.6, 0.72) });
    const st = K.ph(a.t, a.d, 0.75, 0.85); if (st > 0) { ctx.save(); ctx.translate(800, 760); ctx.rotate(0.15); ctx.scale(1.6 - 0.6 * st, 1.6 - 0.6 * st); ctx.lineWidth = 10; ctx.strokeStyle = '#ff3b30'; ctx.strokeRect(-150, -60, 300, 120); ctx.fillStyle = '#ff3b30'; ctx.font = '80px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('MYTH', 0, 6); ctx.restore(); }
  },
  // 3. Six feet down, you're already exhausted -> corte del hoyo: estás dentro, sudando, con la pala; 6 FT
  2: (ctx, a, K) => {
    farm(ctx, a, K); section(ctx, K, 1100, a.t);
    K.R(ctx, 340, 1092, 400, 560, 10, '#2a1d14', 8);
    const dig = Math.abs(Math.sin(a.t * 2.5));
    K.drawFullBody(ctx, 540, 1080, 0.2, a.who, { mood: 'worried', t: a.t }); sweat(ctx, K, 540, 960, a.t);
    shovel(ctx, K, 660, 1500 + dig * 30, 0.9, -0.3);
    for (let i = 0; i < 4; i++) { const q = (a.t * 1.2 + i / 4) % 1; K.C(ctx, 720 + q * 180, 1080 - Math.sin(q * Math.PI) * 300, 16, '#6e5444', 4); }
    ctx.save(); ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(300, 1100); ctx.lineTo(300, 1650); ctx.stroke(); ctx.restore();
    K.text(ctx, '6 FT', 190, 1380, { size: 90, color: '#ffd166', k: K.ph(a.t, a.d, 0.15, 0.3) });
  },
  // 4. At a hundred feet, groundwater floods in -> el agua entra a chorros por las paredes y sube por el hoyo
  3: (ctx, a, K) => {
    section(ctx, K, 0, a.t);
    K.R(ctx, 340, -20, 400, 1960, 0, '#2a1d14', 8);
    const lvl = K.ease.inOut(K.ph(a.t, a.d, 0.15, 1));
    ctx.fillStyle = '#3f9fd6'; ctx.fillRect(344, 1920 - lvl * 1300, 392, lvl * 1300);
    for (let i = 0; i < 4; i++) { const y = 400 + i * 320, sx = i % 2 ? 736 : 344, dir = i % 2 ? -1 : 1; ctx.strokeStyle = '#7fd0ff'; ctx.lineWidth = 22; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(sx, y); ctx.quadraticCurveTo(sx + dir * 80, y + 20, sx + dir * 120, y + 140 + Math.sin(a.t * 8 + i) * 10); ctx.stroke(); }
    const hy = 1920 - lvl * 1300 - 80; ctx.save(); ctx.translate(540, Math.max(700, hy)); ctx.scale(0.35, 0.35); K.drawHead(ctx, 0, 0, a.who, { mood: 'shocked', t: a.t }); ctx.restore();
    K.text(ctx, '100 FT', 540, 700, { size: 120, color: '#ffd166', k: K.ph(a.t, a.d, 0, 0.15) });
  },
  // 5. Two and a half miles down, rock hits 130 degrees -> la mina más profunda: roca al rojo, termómetro a 130°F
  4: (ctx, a, K) => {
    section(ctx, K, 0, a.t); ctx.fillStyle = 'rgba(255,90,30,0.35)'; ctx.fillRect(0, 0, 1080, 1920);
    K.R(ctx, 100, 900, 880, 500, 40, '#3a2418', 8);
    for (let i = 0; i < 6; i++) K.radial(ctx, 180 + i * 150, 1150 + Math.sin(i) * 80, 120, '#ff7a3a', 0.4 + 0.2 * Math.sin(a.t * 3 + i));
    K.drawFullBody(ctx, 380, 900, 0.17, a.who, { mood: 'worried', t: a.t }); sweat(ctx, K, 380, 800, a.t);
    K.E(ctx, 380, 905, 85, 26, '#f2c12e', 0, 6); K.C(ctx, 380, 880, 18, '#fff7c4', 4);
    thermo(ctx, K, 820, 1300, K.ease.out(K.ph(a.t, a.d, 0.1, 0.7)) * 0.85, 'ROCK', '130°F');
    K.text(ctx, '2.5 MILES', 540, 700, { size: 110, color: '#ffd166', k: K.ph(a.t, a.d, 0, 0.15) });
  },
  // 6. In 1970, Soviet engineers started drilling Kola -> tundra nevada con la torre de perforación; 1970
  5: (ctx, a, K) => {
    K.drawPlace(ctx, 'montana', 'dia', a.t); ctx.fillStyle = 'rgba(210,225,245,0.35)'; ctx.fillRect(0, 0, 1080, 1920);
    ctx.fillStyle = '#eef3f8'; ctx.fillRect(0, 1400, 1080, 520); K.R(ctx, 0, 1396, 1080, 8, 0, K.INK, 0);
    derrick(ctx, K, 540, 1420, 1, a.t);
    ctx.fillStyle = 'rgba(255,255,255,0.85)'; for (let i = 0; i < 60; i++) { const x = (i * 157 + a.t * 240) % 1180 - 50, y = (i * 211 + a.t * 90) % 1920; ctx.fillRect(x, y, 7, 3); }
    K.text(ctx, '1970', 260, 720, { size: 140, color: '#ffd166', k: K.ph(a.t, a.d, 0.05, 0.2) });
    K.text(ctx, 'KOLA', 820, 1600, { size: 110, color: '#ffffff', k: K.ph(a.t, a.d, 0.3, 0.45) });
  },
  // 7. By 1989, they reached 40,230 feet -> la cámara baja por el agujero; el contador de profundidad llega a 40,230 FT
  6: (ctx, a, K) => {
    const k = K.ease.inOut(K.ph(a.t, a.d, 0.05, 0.85));
    section(ctx, K, 0, a.t);
    const off = (k * 3000) % 320; ctx.fillStyle = 'rgba(0,0,0,0.15)'; for (let y = -320; y < 1920; y += 320) ctx.fillRect(0, y - off, 1080, 18);
    K.R(ctx, 520, -10, 40, 1940, 6, '#120c08', 0);
    K.speedLines(ctx, 540, 960, a.t, 0.4);
    const d = Math.round(k * 40230).toLocaleString('en-US');
    K.R(ctx, 200, 820, 680, 220, 30, '#14152a', 8); ctx.fillStyle = '#ffd166'; ctx.font = '130px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(`${d} FT`, 540, 935);
    K.text(ctx, '1989', 540, 1250, { size: 110, color: '#ffffff', k: K.ph(a.t, a.d, 0.8, 0.92) });
  },
  // 8. The hole was barely nine inches wide -> primer plano del agujero con una regla: 9 IN (como un plato)
  7: (ctx, a, K) => {
    K.drawPlace(ctx, 'montana', 'dia', a.t); ctx.fillStyle = '#d9dee6'; ctx.fillRect(0, 900, 1080, 1020);
    K.E(ctx, 540, 1250, 230, 90, '#120c08', 0, 10);
    const k = K.ease.out(K.ph(a.t, a.d, 0.15, 0.5));
    ctx.save(); ctx.translate(310, 1100); K.R(ctx, 0, 0, 460 * k, 60, 6, '#ffd166', 6); ctx.fillStyle = K.INK; for (let i = 0; i <= 9; i++) if (i / 9 <= k) ctx.fillRect(i * 51, 0, 4, i % 3 ? 22 : 36); ctx.restore();
    K.text(ctx, '9 IN', 540, 900, { size: 140, color: '#ffffff', k: K.ph(a.t, a.d, 0.45, 0.6) });
    ctx.save(); ctx.translate(820, 1580); const hk = K.ease.outBack(K.ph(a.t, a.d, 0.55, 0.75)); ctx.scale(hk, hk); K.prop(ctx, 'mano', 0, 0, 0.8, a.t); ctx.restore();
  },
  // 9. Expected heat: 212 degrees. Found: 356 -> dos termómetros; el de la derecha revienta por arriba
  8: (ctx, a, K) => {
    section(ctx, K, 0, a.t); ctx.fillStyle = 'rgba(20,10,10,0.45)'; ctx.fillRect(0, 0, 1080, 1920);
    thermo(ctx, K, 300, 1450, K.ease.out(K.ph(a.t, a.d, 0.05, 0.4)) * 0.55, 'EXPECTED', '212°F');
    const f = K.ease.out(K.ph(a.t, a.d, 0.4, 0.8)); thermo(ctx, K, 780, 1450, f * 0.97, 'FOUND', '356°F');
    if (f > 0.9) { K.starBurst(ctx, 780, 860, 120, '#ff7a3a', K.ph(a.t, a.d, 0.8, 0.9)); K.shakeAt(a.t, a.d * 0.8, 10, 0.3); }
  },
  // 10. The rock turned soft as plastic, so they stopped -> la broca se dobla en roca blanda y aparece STOP
  9: (ctx, a, K) => {
    section(ctx, K, 0, a.t); ctx.fillStyle = 'rgba(255,90,30,0.3)'; ctx.fillRect(0, 0, 1080, 1920);
    const b = K.ease.inOut(K.ph(a.t, a.d, 0.1, 0.6));
    ctx.save(); ctx.translate(540, 0); ctx.strokeStyle = '#9aa6b2'; ctx.lineWidth = 50; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, -20); ctx.quadraticCurveTo(0, 900, b * 260, 1150 + b * 100); ctx.stroke(); ctx.lineWidth = 8; ctx.strokeStyle = K.INK; ctx.stroke(); ctx.restore();
    for (let i = 0; i < 5; i++) K.E(ctx, 540 + Math.sin(a.t * 2 + i) * 300, 1350 + i * 90, 160 + Math.sin(a.t * 3 + i) * 30, 50, '#e07a3a', Math.sin(i) * 0.2, 6);
    const st = K.ph(a.t, a.d, 0.65, 0.8); if (st > 0) { ctx.save(); ctx.translate(540, 700); ctx.scale(K.ease.outBack(st), K.ease.outBack(st)); K.P(ctx, Array.from({ length: 8 }, (_, i) => [Math.cos(i / 8 * Math.PI * 2 + Math.PI / 8) * 200, Math.sin(i / 8 * Math.PI * 2 + Math.PI / 8) * 200]), '#d62828', 10); ctx.fillStyle = '#fff'; ctx.font = '120px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('STOP', 0, 8); ctx.restore(); }
  },
  // 11. That's only 0.2 percent of the way down -> la Tierra cortada con una rayita diminuta en la superficie y una lupa: 0.2%
  10: (ctx, a, K) => {
    K.drawPlace(ctx, 'espacio', 'noche', a.t);
    earthCut(ctx, K, 540, 1150, 420, a.t, 0.4);
    K.R(ctx, 536, 728, 8, 10, 2, '#ffffff', 0);
    const k = K.ease.outBack(K.ph(a.t, a.d, 0.2, 0.45)); ctx.save(); ctx.translate(780, 620); ctx.scale(k, k); K.C(ctx, 0, 0, 150, 'rgba(255,255,255,0.25)', 10); K.R(ctx, -6, -60, 12, 30, 4, '#ffffff', 0); ctx.restore();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(545, 735); ctx.lineTo(700, 650); ctx.stroke();
    K.text(ctx, '0.2%', 540, 1700, { size: 170, color: '#ffd166', k: K.ph(a.t, a.d, 0.4, 0.55) });
  },
  // 12. Four thousand miles remain, ending in a core hot as the Sun -> zoom al núcleo brillante; al lado, el Sol
  11: (ctx, a, K) => {
    K.drawPlace(ctx, 'espacio', 'noche', a.t);
    const z = 1 + K.ease.inOut(K.ph(a.t, a.d, 0, 0.6)) * 0.5; ctx.save(); ctx.translate(540, 1150); ctx.scale(z, z); ctx.translate(-540, -1150); earthCut(ctx, K, 540, 1150, 420, a.t, 0.9); ctx.restore();
    K.text(ctx, '4,000 MILES', 380, 720, { size: 110, color: '#ffffff', k: K.ph(a.t, a.d, 0.05, 0.2) });
    const sk = K.ph(a.t, a.d, 0.55, 0.75); if (sk > 0) { ctx.save(); ctx.translate(880, 1520); ctx.scale(K.ease.outBack(sk) * 0.6, K.ease.outBack(sk) * 0.7); K.prop(ctx, 'sol', 0, 0, 1, a.t); ctx.restore(); }
    K.text(ctx, '9,800°F', 380, 1520, { size: 140, color: '#ff9500', k: K.ph(a.t, a.d, 0.4, 0.55) });
  },
  // 13. You wouldn't reach China. You'd surface in the Indian Ocean -> la línea atraviesa el globo y sale en el océano: ¡splash!
  12: (ctx, a, K) => {
    K.drawPlace(ctx, 'espacio', 'noche', a.t);
    K.C(ctx, 540, 1050, 400, '#2d7fc4', 10);
    K.E(ctx, 430, 780, 170, 110, '#6cc070', 0.2, 7); K.text(ctx, 'USA', 430, 780, { size: 56, color: '#ffffff' });
    K.E(ctx, 820, 1260, 110, 80, '#d9b26a', 0.4, 7);
    const k = K.ease.inOut(K.ph(a.t, a.d, 0.05, 0.55));
    ctx.save(); ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 12; ctx.setLineDash([24, 16]); ctx.beginPath(); ctx.moveTo(430, 800); ctx.lineTo(430 + (650 - 430) * k, 800 + (1350 - 800) * k); ctx.stroke(); ctx.restore();
    if (k >= 1) { const q = K.ph(a.t, a.d, 0.55, 0.85); for (let i = 0; i < 9; i++) K.E(ctx, 650 + Math.cos(i * 0.7 - 2.4) * 160 * q, 1350 - Math.sin(i * 0.7) * 200 * q + 260 * q * q, 16, 22, '#bfe9ff', 0, 4);
      K.text(ctx, 'INDIAN OCEAN', 540, 1600, { size: 100, color: '#7fd0ff', k: K.ph(a.t, a.d, 0.6, 0.75) }); K.text(ctx, 'SPLASH!', 820, 1180, { size: 90, color: '#ffffff', k: K.ph(a.t, a.d, 0.55, 0.65) }); }
  },
  // 14. Today, Kola sits under a rusty metal lid -> la tapa oxidada en la tundra, con ruinas detrás y nieve
  13: (ctx, a, K) => {
    K.drawPlace(ctx, 'montana', 'dia', a.t); ctx.fillStyle = 'rgba(200,215,235,0.3)'; ctx.fillRect(0, 0, 1080, 1920);
    K.R(ctx, 620, 880, 300, 300, 6, '#8d8f96', 8); for (let i = 0; i < 6; i++) K.R(ctx, 645 + (i % 3) * 90, 920 + Math.floor(i / 3) * 120, 60, 80, 4, i === 4 ? '#3a3d44' : '#5b5e66', 5);
    ctx.fillStyle = '#eef3f8'; ctx.fillRect(0, 1320, 1080, 600); K.R(ctx, 0, 1316, 1080, 8, 0, K.INK, 0);
    const z = 1 + K.ph(a.t, a.d, 0, 1) * 0.15; ctx.save(); ctx.translate(540, 1560); ctx.scale(z, z); cap(ctx, K, 0, 0, 1.2, a.t); ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,0.85)'; for (let i = 0; i < 60; i++) { const x = (i * 157 + a.t * 260) % 1180 - 50, y = (i * 211 + a.t * 90) % 1920; ctx.fillRect(x, y, 7, 3); }
    K.text(ctx, 'RUSTY LID', 300, 760, { size: 100, color: '#ffffff', k: K.ph(a.t, a.d, 0.3, 0.45), rot: -0.08 });
  },
  // 15. Grab your shovel. You've got 7,900 miles to go -> la persona coge la pala, sonríe y un cartel marca 7,900 MILES
  14: (ctx, a, K) => {
    farm(ctx, a, K); section(ctx, K, 1240, a.t);
    const g = K.ease.outBack(K.ph(a.t, a.d, 0.05, 0.3));
    K.drawFullBody(ctx, 400, 700, 0.2, a.who, { mood: 'happy', t: a.t });
    shovel(ctx, K, 560, 1100 - g * 120, 1, -0.4 + g * 0.3);
    ctx.save(); ctx.translate(820, 1240); K.R(ctx, -14, -300, 28, 300, 6, '#8a5a3a', 6); ctx.rotate(-0.05); K.R(ctx, -200, -460, 400, 170, 16, '#ffd166', 8);
    ctx.fillStyle = K.INK; ctx.font = '70px Anton'; ctx.textAlign = 'center'; ctx.fillText('7,900 MILES', 0, -390); ctx.font = '40px Poppins'; ctx.fillText('straight down', 0, -330); ctx.restore();
  },
};
