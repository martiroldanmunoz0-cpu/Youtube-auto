// Escenas a medida de pedido-21-01: «El pozo de Kola: el agujero más profundo del mundo»

const ROCK = ['#c9a27a', '#a9825e', '#8a6a4e', '#6e5444', '#5a4238', '#4a3430'];
function tundra(ctx, a, K, hora = 'dia') { // tundra rusa: cielo frío, nieve, ruinas de la estación y viento con nieve
  K.drawPlace(ctx, 'montana', hora, a.t);
  ctx.fillStyle = 'rgba(200,215,235,0.25)'; ctx.fillRect(0, 0, 1080, 1920);
  K.R(ctx, 640, 860, 300, 300, 6, '#8d8f96', 8); for (let i = 0; i < 6; i++) K.R(ctx, 665 + (i % 3) * 90, 900 + Math.floor(i / 3) * 120, 60, 80, 4, i === 4 ? '#3a3d44' : '#5b5e66', 5); // edificio abandonado
  K.P(ctx, [[640, 860], [790, 760], [940, 860]], '#6d6f76', 8);
  ctx.fillStyle = 'rgba(255,255,255,0.85)'; for (let i = 0; i < 70; i++) { const x = (i * 157 + a.t * 260) % 1180 - 50, y = (i * 211 + a.t * 90) % 1920; ctx.fillRect(x, y, 7, 3); }
}
function cap(ctx, K, x, y, s, t, glint = true) { // tapa metálica oxidada con tornillos, soldada al suelo
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  K.E(ctx, 0, 30, 260, 70, '#5a5d63'); K.E(ctx, 0, 0, 220, 60, '#9b5a32');
  ctx.fillStyle = 'rgba(70,30,15,0.5)'; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.ellipse(-150 + (i * 47) % 300, -20 + (i * 23) % 40, 24, 8, 0.3, 0, 7); ctx.fill(); }
  for (let i = 0; i < 10; i++) { const an = i / 10 * Math.PI * 2; K.C(ctx, Math.cos(an) * 190, Math.sin(an) * 48, 10, '#3a3d44', 4); }
  K.R(ctx, -90, -14, 180, 26, 6, '#7a4628', 4);
  if (glint) { ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 3); K.radial(ctx, -80, -20, 60, '#ffffff', 0.7); ctx.globalAlpha = 1; }
  ctx.restore();
}
function section(ctx, K, top, depthPx, t, holeTo = 0, glowAt = -1) { // corte de la corteza por capas con el agujero bajando
  const h = (1920 - top) / ROCK.length;
  ROCK.forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(0, top + i * h); for (let x = 0; x <= 1080; x += 60) ctx.lineTo(x, top + i * h + Math.sin(x / 140 + i) * 14); ctx.lineTo(1080, 1920); ctx.lineTo(0, 1920); ctx.fill(); });
  ctx.fillStyle = 'rgba(0,0,0,0.1)'; for (let i = 0; i < 80; i++) K.C(ctx, (i * 131) % 1080, top + 40 + (i * 97) % (1900 - top), 6 + (i % 4) * 3, 'rgba(0,0,0,0.12)', 0);
  if (holeTo > 0) { K.R(ctx, 530, top - 4, 20, holeTo, 4, '#1a1414', 0); if (glowAt >= 0) K.radial(ctx, 540, top + holeTo, 160, '#ff7a3a', glowAt); }
  K.R(ctx, 0, top - 8, 1080, 16, 0, K.INK, 0);
}
function badge(ctx, K, txt, y = 1760, col = '#ffd166') { ctx.save(); ctx.font = '80px Anton'; const w = ctx.measureText(txt).width + 70; K.R(ctx, 540 - w / 2, y - 60, w, 120, 30, '#14152a', 7); ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 540, y + 4); ctx.restore(); }
function pista(ctx, K, n, k) { // sello "PISTA N" de detective
  if (k <= 0) return; ctx.save(); ctx.translate(250, 560); ctx.rotate(-0.12); const s = K.ease.outBack(Math.min(1, k)); ctx.scale(s, s);
  K.R(ctx, -170, -70, 340, 140, 20, '#ffd166', 8); ctx.fillStyle = K.INK; ctx.font = '90px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(`PISTA ${n}`, 0, 6);
  ctx.restore(); K.prop(ctx, 'lupa', 470, 640, 0.35, 0, 0.3);
}
function derrick(ctx, K, x, base, s, t) { // torre de perforación con la broca girando
  ctx.save(); ctx.translate(x, base); ctx.scale(s, s);
  ctx.strokeStyle = '#c94b3a'; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(-160, 0); ctx.lineTo(-30, -760); ctx.lineTo(30, -760); ctx.lineTo(160, 0); ctx.stroke();
  ctx.lineWidth = 8; for (let i = 1; i < 8; i++) { const y = -i * 95, w = 160 - i * 16; ctx.beginPath(); ctx.moveTo(-w, y); ctx.lineTo(w, y - 95); ctx.moveTo(w, y); ctx.lineTo(-w, y - 95); ctx.stroke(); }
  K.R(ctx, -200, -40, 400, 60, 10, '#5a5d63', 8);
  ctx.save(); ctx.translate(0, -60); ctx.rotate(t * 8); K.R(ctx, -14, -420, 28, 420, 8, '#9aa6b2', 5); ctx.restore();
  ctx.restore();
}
function plankton(ctx, K, x, y, r, t, i) { ctx.save(); ctx.translate(x, y); ctx.rotate(t * 0.5 + i); K.radial(ctx, 0, 0, r * 2.4, '#9bfff0', 0.45); K.C(ctx, 0, 0, r, '#e9fffb', 4); ctx.strokeStyle = '#e9fffb'; ctx.lineWidth = 3; for (let k = 0; k < 8; k++) { const an = k / 8 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(Math.cos(an) * r, Math.sin(an) * r); ctx.lineTo(Math.cos(an) * r * 1.8, Math.sin(an) * r * 1.8); ctx.stroke(); } ctx.restore(); }

export default {
  // 1. ¿Por qué taparon un agujero de doce kilómetros? -> la tapa en la tundra y, debajo, el agujero que baja hasta perderse
  0: (ctx, a, K) => {
    const k = K.ease.inOut(K.ph(a.t, a.d, 0.25, 0.9));
    tundra(ctx, a, K);
    ctx.save(); ctx.translate(0, -k * 700); // la cámara baja por el agujero
    section(ctx, K, 1500, 0, a.t, 1500 * k + 200);
    cap(ctx, K, 540, 1470, 1.1, a.t);
    ctx.restore();
    if (k > 0.2) { ctx.save(); ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 10; ctx.setLineDash([24, 18]); ctx.beginPath(); ctx.moveTo(700, 900); ctx.lineTo(700, 1800); ctx.stroke(); ctx.restore(); K.text(ctx, '12 KM', 860, 1350, { size: 110, color: '#ffd166', k: K.ph(a.t, a.d, 0.35, 0.5) }); }
    K.text(ctx, '?', 300, 1150, { size: 240, color: '#ffffff', k: K.ph(a.t, a.d, 0.5, 0.65), rot: -0.15 });
  },
  // 2. Estás ante una tapa oxidada, en la tundra rusa -> la persona de pie junto a la tapa, con el viento y la nieve
  1: (ctx, a, K) => {
    tundra(ctx, a, K);
    ctx.fillStyle = '#eef3f8'; ctx.fillRect(0, 1320, 1080, 600); K.R(ctx, 0, 1316, 1080, 8, 0, K.INK, 0);
    cap(ctx, K, 650, 1560, 0.9, a.t);
    K.drawFullBody(ctx, 300, 900 + Math.sin(a.t * 2) * 4, 0.3, a.who, { mood: 'worried', t: a.t, arms: 'cross' });
    for (let i = 0; i < 3; i++) { const q = (a.t * 0.8 + i / 3) % 1; ctx.globalAlpha = 0.6 * (1 - q); K.radial(ctx, 330 + q * 80, 860 - q * 60, 30 + q * 30, '#ffffff', 1); } ctx.globalAlpha = 1; // vaho
    K.text(ctx, 'PENÍNSULA DE KOLA · RUSIA', 540, 1760, { size: 58, color: '#ffffff', k: K.ph(a.t, a.d, 0.2, 0.35) });
  },
  // 3. Pista uno: en 1970 empezaron a perforar -> sello PISTA 1, la torre de perforación se levanta y la broca gira echando chispas
  2: (ctx, a, K) => {
    tundra(ctx, a, K);
    ctx.fillStyle = '#eef3f8'; ctx.fillRect(0, 1450, 1080, 470);
    const up = K.ease.outBack(K.ph(a.t, a.d, 0.1, 0.45));
    derrick(ctx, K, 540, 1460, up, a.t);
    if (up > 0.9) { K.sparkles(ctx, 540, 1430, a.t, 8, 120); K.smoke(ctx, 540, 1440, a.t, 3); }
    pista(ctx, K, 1, K.ph(a.t, a.d, 0, 0.15));
    K.text(ctx, '1970', 820, 460, { size: 150, color: '#ffd166', k: K.ph(a.t, a.d, 0.4, 0.55) });
  },
  // 4. Tardaron casi veinte años en bajar doce mil metros -> corte de la Tierra: el agujero baja mientras los años y los metros avanzan
  3: (ctx, a, K) => {
    ctx.fillStyle = '#bcd6ee'; ctx.fillRect(0, 0, 1080, 520);
    const k = K.ease.inOut(K.ph(a.t, a.d, 0.05, 0.95));
    section(ctx, K, 520, 0, a.t, 1380 * k);
    ctx.save(); ctx.translate(540, 520 + 1380 * k); ctx.rotate(a.t * 10); K.P(ctx, [[-26, -30], [26, -30], [0, 30]], '#9aa6b2', 5); ctx.restore();
    K.sparkles(ctx, 540, 520 + 1380 * k, a.t, 5, 60);
    derrick(ctx, K, 540, 520, 0.45, a.t);
    K.text(ctx, String(1970 + Math.round(k * 19)), 250, 760, { size: 130, color: '#ffd166' });
    badge(ctx, K, `${Math.round(k * 12000).toLocaleString('es-ES')} m`, 1760, '#ffd166');
  },
  // 5. Más que el Everest, pero hacia abajo, por un hueco de 23 cm -> el Everest boca abajo al lado del agujero; luego el ancho real del hueco
  4: (ctx, a, K) => {
    ctx.fillStyle = '#bcd6ee'; ctx.fillRect(0, 0, 1080, 420);
    section(ctx, K, 420, 0, a.t, 1500);
    const ev = K.ease.out(K.ph(a.t, a.d, 0.05, 0.4));
    ctx.save(); ctx.translate(280, 420); ctx.scale(1, -1); ctx.globalAlpha = ev; K.P(ctx, [[-200, 0], [0, -1100 * ev], [200, 0]], '#e9eef5', 8); K.P(ctx, [[-70, -720 * ev], [0, -1100 * ev], [70, -720 * ev]], '#ffffff', 0); ctx.restore(); ctx.globalAlpha = 1;
    K.text(ctx, 'EVEREST 8,8 KM', 280, 1620, { size: 54, color: '#ffffff', k: ev });
    K.text(ctx, 'KOLA 12,2 KM', 760, 1860, { size: 54, color: '#ffd166', k: ev });
    const zoom = K.ease.outBack(K.ph(a.t, a.d, 0.55, 0.75));
    if (zoom > 0) { ctx.save(); ctx.translate(760, 820); ctx.scale(zoom, zoom); K.C(ctx, 0, 0, 230, '#f4f1ea', 10); K.C(ctx, 0, 0, 150, '#1a1414', 8); ctx.strokeStyle = '#e8505b'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-150, 190); ctx.lineTo(150, 190); ctx.stroke(); ctx.fillStyle = '#e8505b'; ctx.font = '60px Anton'; ctx.textAlign = 'center'; ctx.fillText('23 cm', 0, 270); ctx.restore(); }
  },
  // 6. Pista dos: agua, kilómetros bajo tierra -> grietas en la roca por las que se filtra agua brillante
  5: (ctx, a, K) => {
    section(ctx, K, 0, 0, a.t, 1920);
    const k = K.ph(a.t, a.d, 0.15, 1);
    ctx.strokeStyle = '#2a1e1a'; ctx.lineWidth = 8; for (let i = 0; i < 5; i++) { ctx.beginPath(); let x = 100 + i * 210, y = 700; ctx.moveTo(x, y); for (let j = 0; j < 6; j++) { x += Math.sin(i * 3 + j) * 40; y += 120; ctx.lineTo(x, y); } ctx.stroke(); }
    for (let i = 0; i < 14; i++) { const q = (a.t * 0.5 + i / 14) % 1; ctx.globalAlpha = Math.min(1, k * 2) * (1 - q * 0.6); K.E(ctx, 120 + (i * 77) % 840, 760 + q * 700, 16, 24, '#6fd3ff', 0, 4); K.radial(ctx, 120 + (i * 77) % 840, 760 + q * 700, 60, '#6fd3ff', 0.4); }
    ctx.globalAlpha = 1;
    pista(ctx, K, 2, K.ph(a.t, a.d, 0, 0.15));
    K.prop(ctx, 'gota', 760, 520, 0.7 * K.ease.outBack(K.ph(a.t, a.d, 0.3, 0.5)), a.t);
  },
  // 7. A seis kilómetros, microfósiles de plancton -> una lupa recorre la roca y aparecen fósiles diminutos que brillan
  6: (ctx, a, K) => {
    section(ctx, K, 0, 0, a.t, 1920);
    const lx = 300 + Math.sin(a.t * 0.9) * 220, ly = 1050 + Math.cos(a.t * 0.7) * 160;
    ctx.save(); ctx.beginPath(); ctx.arc(lx, ly, 230, 0, 7); ctx.clip(); ctx.fillStyle = '#4a3430'; ctx.fillRect(0, 0, 1080, 1920);
    for (let i = 0; i < 10; i++) plankton(ctx, K, lx - 160 + (i * 67) % 320, ly - 150 + (i * 113) % 300, 22 + (i % 3) * 8, a.t, i);
    ctx.restore();
    ctx.beginPath(); ctx.arc(lx, ly, 230, 0, 7); ctx.lineWidth = 26; ctx.strokeStyle = K.INK; ctx.stroke(); K.L(ctx, [[lx + 165, ly + 165], [lx + 330, ly + 330]], '#8b5a2b', 40);
    badge(ctx, K, 'A 6 KM: PLANCTON FÓSIL', 1760, '#9bfff0');
  },
  // 8. Pista tres: abajo hacía 180 grados -> un termómetro enorme se dispara a 180 °C y la roca se pone al rojo
  7: (ctx, a, K) => {
    const k = K.ease.inOut(K.ph(a.t, a.d, 0.1, 0.8));
    section(ctx, K, 0, 0, a.t, 1920, k);
    ctx.fillStyle = `rgba(255,90,30,${0.4 * k})`; ctx.fillRect(0, 0, 1080, 1920);
    ctx.save(); ctx.translate(780, 1100);
    K.R(ctx, -60, -600, 120, 700, 60, '#ffffff', 10); K.C(ctx, 0, 140, 110, '#e8505b', 10); K.R(ctx, -30, -560 * k + 40, 60, 560 * k + 100, 30, '#e8505b', 0);
    for (let i = 0; i < 8; i++) K.R(ctx, 60, -540 + i * 70, 40, 8, 4, K.INK, 0);
    ctx.restore();
    ctx.strokeStyle = `rgba(255,220,180,${0.5 * k})`; ctx.lineWidth = 6; for (let i = 0; i < 5; i++) { const x = 120 + i * 120; ctx.beginPath(); for (let y = 1700; y > 900; y -= 20) ctx.lineTo(x + Math.sin(y / 30 + a.t * 6 + i) * 14, y); ctx.stroke(); }
    pista(ctx, K, 3, K.ph(a.t, a.d, 0, 0.15));
    K.text(ctx, `${Math.round(k * 180)} °C`, 360, 1300, { size: 160, color: '#ffd166' });
  },
  // 9. La roca se volvía como plástico y rompía las brocas -> la broca empuja la roca blanda que se deforma y la broca se parte
  8: (ctx, a, K) => {
    ctx.fillStyle = '#3a2420'; ctx.fillRect(0, 0, 1080, 1920); K.radial(ctx, 540, 1300, 700, '#ff6a2a', 0.45);
    const push = K.ph(a.t, a.d, 0, 0.5), snap = K.ph(a.t, a.d, 0.5, 1), sq = Math.sin(push * Math.PI) * 80;
    ctx.beginPath(); ctx.moveTo(0, 1250); ctx.bezierCurveTo(300, 1250 + sq * 0.5, 420, 1250 + sq * 1.6, 540, 1250 + sq * 1.8); ctx.bezierCurveTo(660, 1250 + sq * 1.6, 780, 1250 + sq * 0.5, 1080, 1250); ctx.lineTo(1080, 1920); ctx.lineTo(0, 1920); ctx.closePath(); ctx.fillStyle = '#e0722e'; ctx.fill(); K.O(ctx, 10);
    ctx.fillStyle = 'rgba(255,220,120,0.4)'; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.ellipse(200 + i * 140, 1500 + Math.sin(a.t * 2 + i) * 40, 60, 18, 0, 0, 7); ctx.fill(); }
    const by = 600 + push * 640;
    if (snap === 0) { ctx.save(); ctx.translate(540, by); ctx.rotate(a.t * 10); K.R(ctx, -40, -700, 80, 700, 10, '#9aa6b2', 7); K.P(ctx, [[-50, 0], [50, 0], [0, 90]], '#c8ced6', 7); ctx.restore(); }
    else {
      K.R(ctx, 500, by - 700, 80, 400, 10, '#9aa6b2', 7);
      for (let i = 0; i < 4; i++) { ctx.save(); ctx.translate(540 + (i - 1.5) * 160 * snap, by - 250 - Math.sin(snap * Math.PI) * 300 * (i % 2 ? 1 : 0.6)); ctx.rotate(snap * 6 * (i - 1.5)); K.R(ctx, -30, -60, 60, 120, 8, '#9aa6b2', 6); ctx.restore(); }
      K.flash(ctx, a.t, a.d * 0.5, 0.15); K.starBurst(ctx, 540, by - 280, 200 * Math.min(1, snap * 4), '#ffd166', Math.min(1, snap * 4));
    }
    K.text(ctx, 'COMO PLÁSTICO', 540, 1780, { size: 100, color: '#ffd166', k: K.ph(a.t, a.d, 0.15, 0.3) });
  },
  // 10. Y no, nadie grabó gritos del infierno. Es un bulo -> titular sensacionalista con un fantasma; cae el sello BULO
  9: (ctx, a, K) => {
    ctx.fillStyle = '#2a2233'; ctx.fillRect(0, 0, 1080, 1920);
    ctx.save(); ctx.translate(540, 1000); ctx.rotate(-0.05);
    K.R(ctx, -420, -560, 840, 1120, 10, '#f2ead8', 10);
    ctx.fillStyle = K.INK; ctx.font = '96px Anton'; ctx.textAlign = 'center'; ctx.fillText('¿GRITOS DEL', 0, -400); ctx.fillText('INFIERNO?', 0, -290);
    ctx.fillStyle = '#9aa3ad'; for (let i = 0; i < 6; i++) ctx.fillRect(-360, 180 + i * 56, i % 2 ? 300 : 720, 18);
    const wob = Math.sin(a.t * 3) * 20; K.R(ctx, -230, -220, 460, 360, 20, '#1a1414', 6);
    ctx.save(); ctx.translate(0, -40 + wob); ctx.beginPath(); ctx.arc(0, 0, 90, Math.PI, 0); ctx.lineTo(90, 110); for (let i = 0; i < 4; i++) ctx.lineTo(90 - 45 * (i + 1), 110 + (i % 2 ? 0 : -24)); ctx.closePath(); ctx.fillStyle = '#e8ecf5'; ctx.fill(); K.C(ctx, -30, -10, 12, K.INK, 0); K.C(ctx, 30, -10, 12, K.INK, 0); ctx.restore();
    ctx.restore();
    const st = K.ph(a.t, a.d, 0.45, 0.55);
    if (st > 0) { const s = 2.2 - 1.2 * K.ease.out(st); ctx.save(); ctx.translate(540, 1000); ctx.rotate(-0.25); ctx.scale(s, s); ctx.globalAlpha = Math.min(1, st * 2); ctx.lineWidth = 16; ctx.strokeStyle = '#e8505b'; ctx.strokeRect(-260, -100, 520, 200); ctx.fillStyle = '#e8505b'; ctx.font = '170px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('BULO', 0, 10); ctx.restore(); ctx.globalAlpha = 1; if (st < 1) { const [sx] = K.shakeAt(a.t, a.d * 0.5, 20, 0.3); ctx.translate(sx, 0); } }
  },
  // 11. En 1992, cerraron el pozo -> una grúa baja la tapa sobre el agujero y los tornillos se aprietan uno a uno
  10: (ctx, a, K) => {
    tundra(ctx, a, K, 'atardecer');
    ctx.fillStyle = '#eef3f8'; ctx.fillRect(0, 1450, 1080, 470); K.R(ctx, 0, 1446, 1080, 8, 0, K.INK, 0);
    K.E(ctx, 540, 1480, 220, 55, '#1a1414');
    const down = K.ease.inOut(K.ph(a.t, a.d, 0.05, 0.5));
    ctx.strokeStyle = K.INK; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(540, 0); ctx.lineTo(540, 700 + down * 750); ctx.stroke();
    cap(ctx, K, 540, 760 + down * 720, 1, a.t, down >= 1);
    const bolts = Math.floor(K.ph(a.t, a.d, 0.55, 0.95) * 10);
    for (let i = 0; i < bolts; i++) { const an = i / 10 * Math.PI * 2; K.sparkles(ctx, 540 + Math.cos(an) * 190, 1480 + Math.sin(an) * 48, a.t, 2, 30); }
    K.text(ctx, '1992', 540, 560, { size: 160, color: '#ffd166', k: K.ph(a.t, a.d, 0.1, 0.25) });
    if (bolts >= 10) K.text(ctx, 'CERRADO', 540, 1760, { size: 100, color: '#e8505b' });
  },
  // 12. Llegaron al 0,2 % del camino al centro -> corte de la Tierra (corteza, manto, núcleo) con una aguja diminuta y la barra de progreso
  11: (ctx, a, K) => {
    K.drawPlace(ctx, 'espacio', 'noche', a.t);
    const k = K.ease.out(K.ph(a.t, a.d, 0.05, 0.4));
    ctx.save(); ctx.translate(540, 1050); ctx.scale(k, k);
    K.C(ctx, 0, 0, 420, '#3b7dd8', 10); ctx.save(); ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 420, -Math.PI / 2, 0); ctx.closePath(); ctx.clip();
    K.C(ctx, 0, 0, 420, '#c9a27a', 0); K.C(ctx, 0, 0, 395, '#ff8a3d', 0); K.C(ctx, 0, 0, 230, '#ffd166', 0); K.C(ctx, 0, 0, 120, '#fff1a8', 0); ctx.restore();
    ctx.strokeStyle = '#e8505b'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(250, -334); ctx.lineTo(251, -332); ctx.stroke();
    ctx.restore();
    K.C(ctx, 540 + 250 * k, 1050 - 334 * k, 14 + Math.sin(a.t * 6) * 4, '#e8505b', 4);
    K.R(ctx, 140, 1640, 800, 60, 30, '#2a2f4a', 6); const p = K.ph(a.t, a.d, 0.4, 0.7) * 0.002; K.R(ctx, 140, 1640, Math.max(14, 800 * p * 25), 60, 30, '#e8505b', 0);
    K.text(ctx, '0,2 %', 540, 1530, { size: 130, color: '#ffd166', k: K.ph(a.t, a.d, 0.45, 0.6) });
    K.text(ctx, 'CENTRO', 860, 1780, { size: 50, color: '#ffffff', k: 1 });
  },
  // 13. Si la Tierra fuera una manzana, ni habrían cruzado la piel -> la Tierra se convierte en manzana; con lupa, el arañazo no atraviesa la piel
  12: (ctx, a, K) => {
    ctx.fillStyle = '#fff4dc'; ctx.fillRect(0, 0, 1080, 1920); K.radial(ctx, 540, 1000, 700, '#ffd166', 0.25);
    const m = K.ph(a.t, a.d, 0.05, 0.3);
    if (m < 1) { ctx.globalAlpha = 1 - m; K.prop(ctx, 'tierra', 540, 1400, 1.6, a.t); ctx.globalAlpha = 1; }
    ctx.globalAlpha = m; K.prop(ctx, 'manzana', 540, 1500, 2.2, a.t); ctx.globalAlpha = 1;
    const z = K.ease.outBack(K.ph(a.t, a.d, 0.4, 0.6));
    if (z > 0) {
      ctx.save(); ctx.translate(760, 820); ctx.scale(z, z); K.C(ctx, 0, 0, 220, '#ffffff', 0);
      ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 210, 0, 7); ctx.clip(); ctx.fillStyle = '#f7f0d0'; ctx.fillRect(-220, -220, 440, 440); ctx.fillStyle = '#e8505b'; ctx.fillRect(-220, -220, 440, 90); ctx.fillStyle = '#8a1f2a'; ctx.fillRect(-4, -220, 8, 40); ctx.restore();
      ctx.beginPath(); ctx.arc(0, 0, 210, 0, 7); ctx.lineWidth = 20; ctx.strokeStyle = K.INK; ctx.stroke(); ctx.restore();
      K.L(ctx, [[760 + 150 * z, 820 + 150 * z], [760 + 290 * z, 820 + 290 * z]], '#8b5a2b', 34);
      K.text(ctx, 'NI LA PIEL', 540, 1760, { size: 100, color: '#e8505b', k: K.ph(a.t, a.d, 0.6, 0.75) });
    }
  },
  // 14. Esta tapa esconde lo poco que conocemos de nuestro planeta -> la tapa al atardecer; la cámara se aleja y bajo tierra todo son interrogaciones
  13: (ctx, a, K) => {
    const k = K.ease.inOut(K.ph(a.t, a.d, 0, 1));
    ctx.save(); ctx.translate(540, 1100); ctx.scale(1.4 - k * 0.5, 1.4 - k * 0.5); ctx.translate(-540, -1100);
    tundra(ctx, a, K, 'atardecer');
    section(ctx, K, 1350, 0, a.t, 600);
    cap(ctx, K, 540, 1330, 1, a.t);
    ctx.restore();
    for (let i = 0; i < 5; i++) K.text(ctx, '?', 160 + i * 190, 1650 + Math.sin(a.t * 2 + i) * 30, { size: 120, color: '#ffd166', k: K.ph(a.t, a.d, 0.3 + i * 0.08, 0.4 + i * 0.08), rot: (i - 2) * 0.15 });
  },
};
