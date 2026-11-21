// Escenas a medida de pedido-20-01: «¿Y si caes en arenas movedizas? La verdad del cine»
// Cada plano muestra literalmente lo que dice la voz. a.t = segundos del plano, a.d = duración.

const SAND = '#b8865a', SAND_D = '#8f6440', SAND_L = '#d6a877';

function estuary(ctx, a, K, hora = 'dia') { // estuario con marea baja: arena mojada, canales de agua y gaviotas
  K.drawPlace(ctx, 'playa', hora, a.t);
  ctx.fillStyle = SAND_L; ctx.fillRect(0, 1180, 1080, 740);
  ctx.fillStyle = 'rgba(90,160,200,0.55)';
  for (const [y, w] of [[1260, 380], [1420, 520], [1640, 300]]) { ctx.beginPath(); ctx.ellipse(((y * 7 + a.t * 6) % 1300) - 100, y, w, 26, 0, 0, 7); ctx.fill(); }
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; for (let i = 0; i < 30; i++) ctx.fillRect((i * 151) % 1080, 1200 + (i * 97) % 700, 14, 4);
}
function pit(ctx, K, cx, cy, rx, ry, t) { // charco de arena movediza que burbujea
  ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 7); ctx.fillStyle = SAND_D; ctx.fill(); K.O(ctx, 8);
  ctx.beginPath(); ctx.ellipse(cx, cy - 6, rx * 0.85, ry * 0.7, 0, 0, 7); ctx.fillStyle = SAND; ctx.fill();
  for (let i = 0; i < 6; i++) { const q = (t * 0.8 + i / 6) % 1; ctx.globalAlpha = 1 - q; K.C(ctx, cx - rx * 0.6 + ((i * 137) % (rx * 1.2)), cy - 8 + Math.sin(i) * ry * 0.3, 6 + q * 14, '#c9976b', 3); }
  ctx.globalAlpha = 1;
}
function sandUp(ctx, K, y, t) { // tapa todo lo que queda por debajo de y con arena (la persona queda hundida)
  ctx.beginPath(); ctx.moveTo(0, 1920); ctx.lineTo(0, y);
  for (let x = 0; x <= 1080; x += 30) ctx.lineTo(x, y + Math.sin(x / 70 + t * 2) * 8 + (Math.abs(x - 540) < 200 ? -14 : 0));
  ctx.lineTo(1080, 1920); ctx.closePath(); ctx.fillStyle = SAND; ctx.fill(); K.O(ctx, 8);
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; for (let i = 0; i < 40; i++) ctx.fillRect((i * 151) % 1080, y + 30 + (i * 83) % (1920 - y), 10, 10);
  for (let i = 0; i < 4; i++) { const q = (t * 0.7 + i / 4) % 1; ctx.globalAlpha = 1 - q; ctx.strokeStyle = SAND_D; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(540, y + 10, 120 + q * 260, 18 + q * 30, 0, 0, 7); ctx.stroke(); }
  ctx.globalAlpha = 1;
}
function body(ctx, a, K, x, y, s, mood, extra = {}) { K.drawFullBody(ctx, x, y, s, a.who, { mood, t: a.t, ...extra }); }
function hat(ctx, K, x, y, s, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); K.E(ctx, 0, 0, 200, 50, '#c9a24a'); K.R(ctx, -110, -120, 220, 120, 40, '#d9b45a'); K.R(ctx, -112, -40, 224, 34, 8, '#7a3b2e', 0); ctx.restore(); }
function badge(ctx, K, txt, y = 1760, col = '#ffd166') { ctx.save(); ctx.font = '80px Anton'; const w = ctx.measureText(txt).width + 70; K.R(ctx, 540 - w / 2, y - 60, w, 120, 30, '#14152a', 7); ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 540, y + 4); ctx.restore(); }
function hand(ctx, K, x, y, s, skin, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(Math.sin(t * 5) * 0.12); K.R(ctx, -60, -40, 120, 260, 50, skin, 8); for (let i = 0; i < 4; i++) K.R(ctx, -58 + i * 30, -150 - Math.abs(i - 1.5) * -10, 26, 120, 13, skin, 6); K.R(ctx, 50, -60, 26, 100, 13, skin, 6); ctx.restore(); }
function waterLevel(ctx, K, y, t) { ctx.beginPath(); ctx.moveTo(0, 1920); ctx.lineTo(0, y); for (let x = 0; x <= 1080; x += 30) ctx.lineTo(x, y + Math.sin(x / 60 + t * 3) * 14); ctx.lineTo(1080, 1920); ctx.closePath(); ctx.fillStyle = 'rgba(47,140,190,0.78)'; ctx.fill(); K.O(ctx, 6); for (let i = 0; i < 8; i++) K.C(ctx, (i * 140 + t * 60) % 1080, y + Math.sin(i + t * 3) * 14, 10, '#ffffff', 3); }

export default {
  // 1. ¿Y si caes en arenas movedizas? -> la escena de película: una mano se hunde en la arena y el sombrero queda flotando
  0: (ctx, a, K) => {
    K.drawPlace(ctx, 'desierto', 'dia', a.t);
    pit(ctx, K, 540, 1450, 430, 150, a.t);
    const k = K.ph(a.t, a.d, 0, 1);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 1080, 1440); ctx.clip();
    hand(ctx, K, 560, 1300 + k * 320, 1.1, a.who.skin.light, a.t); ctx.restore();
    hat(ctx, K, 380 + Math.sin(a.t * 1.5) * 12, 1420 + Math.sin(a.t * 2) * 6, 0.9, Math.sin(a.t * 1.3) * 0.08);
    for (let i = 0; i < 3; i++) { const q = (a.t * 1.2 + i / 3) % 1; ctx.globalAlpha = 1 - q; K.C(ctx, 560 + (i - 1) * 50, 1430 - q * 120, 12 + q * 10, '#c9976b', 3); } ctx.globalAlpha = 1;
    K.text(ctx, '?', 840, 1050, { size: 220, color: '#ffd166', k: K.ph(a.t, a.d, 0.3, 0.45), rot: 0.15 });
  },
  // 2. Tranquilo: no te traga. Lo peligroso es otra cosa -> hundido a la cintura, tranquilo y diciendo que no con el dedo; detrás, la marea se acerca
  1: (ctx, a, K) => {
    estuary(ctx, a, K);
    const tide = K.ph(a.t, a.d, 0.4, 1);
    if (tide > 0) { ctx.fillStyle = 'rgba(47,140,190,0.7)'; ctx.beginPath(); ctx.moveTo(1080, 1180); ctx.lineTo(1080 - tide * 300, 1180); for (let y = 1180; y <= 1920; y += 40) ctx.lineTo(1080 - tide * 300 + Math.sin(y / 50 + a.t * 3) * 20, y); ctx.lineTo(1080, 1920); ctx.fill(); }
    body(ctx, a, K, 540, 700, 0.42, 'happy');
    sandUp(ctx, K, 1280, a.t);
    ctx.save(); ctx.translate(820, 1000); ctx.rotate(Math.sin(a.t * 8) * 0.35); hand(ctx, K, 0, 0, 0.8, a.who.skin.light, 0); ctx.restore(); // dedo: no, no
    K.text(ctx, 'NO TE TRAGA', 540, 560, { size: 100, color: '#5fd38a', k: K.ph(a.t, a.d, 0.05, 0.2) });
    K.text(ctx, '…PERO', 820, 1500, { size: 90, color: '#ff6b6b', k: K.ph(a.t, a.d, 0.55, 0.7) });
  },
  // 3. Caminas descalzo por un estuario, marea baja -> la persona camina descalza y deja huellas, gaviotas
  2: (ctx, a, K) => {
    estuary(ctx, a, K);
    const k = K.ph(a.t, a.d, 0, 1), x = 200 + k * 650;
    for (let i = 0; i < 8; i++) { const fx = x - 80 - i * 70; if (fx < 0) break; ctx.fillStyle = 'rgba(120,85,55,0.5)'; ctx.beginPath(); ctx.ellipse(fx, 1660 + (i % 2) * 40, 22, 34, 0.3, 0, 7); ctx.fill(); }
    ctx.save(); ctx.translate(x, 640 - Math.abs(Math.sin(a.t * 5)) * 18); ctx.rotate(Math.sin(a.t * 5) * 0.03); body(ctx, a, K, 0, 0, 0.42, 'happy'); ctx.restore();
    for (let i = 0; i < 3; i++) { const bx = (a.t * 120 + i * 300) % 1200 - 60, by = 320 + i * 60; const f = Math.sin(a.t * 9 + i) * 0.6; ctx.strokeStyle = K.INK; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(bx - 34, by - 14 * f); ctx.quadraticCurveTo(bx - 16, by - 22 * f - 8, bx, by); ctx.quadraticCurveTo(bx + 16, by - 22 * f - 8, bx + 34, by - 14 * f); ctx.stroke(); }
    badge(ctx, K, 'MAREA BAJA', 1780, '#7bdff2');
  },
  // 4. El suelo cede. Segundo uno: hundido hasta las rodillas -> se hunde de golpe con salpicadura de barro
  3: (ctx, a, K) => {
    estuary(ctx, a, K);
    const drop = K.ease.out(K.ph(a.t, a.d, 0.2, 0.4)), y = 640 + drop * 330;
    const [sx, sy] = K.shakeAt(a.t, a.d * 0.2, 20, 0.5); ctx.save(); ctx.translate(sx, sy);
    body(ctx, a, K, 540, y, 0.42, drop > 0 ? 'shocked' : 'happy', { arms: drop > 0.3 ? 'up' : 'normal' });
    sandUp(ctx, K, 1560, a.t); ctx.restore();
    if (drop > 0 && drop < 1) for (let i = 0; i < 10; i++) { const an = -Math.PI * (0.1 + i * 0.08); K.C(ctx, 540 + Math.cos(an) * 260 * drop, 1540 + Math.sin(an) * 260 * drop, 14, SAND_D, 3); }
    badge(ctx, K, 'SEGUNDO 1');
  },
  // 5. Patalear empeora todo: la arena se licúa y luego se compacta -> corte bajo tierra: las piernas patalean, los granos se separan (agua) y luego se aprietan
  4: (ctx, a, K) => {
    ctx.fillStyle = '#87c4e8'; ctx.fillRect(0, 0, 1080, 760);
    ctx.fillStyle = SAND_D; ctx.fillRect(0, 760, 1080, 1160); K.R(ctx, 0, 752, 1080, 16, 0, K.INK, 0);
    const kick = K.ph(a.t, a.d, 0.05, 0.55), pack = K.ph(a.t, a.d, 0.55, 0.9);
    ctx.save(); ctx.translate(540, 760); ctx.scale(0.42, 0.42); ctx.translate(-540, -760);
    body(ctx, a, K, 540, -120, 1, pack > 0 ? 'shocked' : 'worried'); ctx.restore();
    // granos de arena alrededor de las piernas
    for (let i = 0; i < 260; i++) {
      const gx = (i * 73) % 1080, gy = 800 + (i * 131) % 1100;
      const near = Math.max(0, 1 - Math.hypot(gx - 540, gy - 1250) / 420);
      const loose = kick > 0 && pack === 0 ? near * 30 * Math.sin(a.t * 12 + i) : 0;
      const tight = pack * near * 0.5;
      const x = gx + loose + (540 - gx) * tight * 0.4, y = gy + loose * 0.5 + (1250 - gy) * tight * 0.25;
      K.C(ctx, x, y, 9 - tight * 3, '#d6a877', 0);
    }
    if (kick > 0 && pack === 0) { ctx.globalAlpha = 0.5; for (let i = 0; i < 12; i++) K.C(ctx, 400 + (i * 47) % 280, 1300 - ((a.t * 300 + i * 60) % 450), 10, '#7bdff2', 0); ctx.globalAlpha = 1; for (const s of [-1, 1]) K.speedLines(ctx, 540 + s * 60, 1350, a.t, 0.15); }
    K.text(ctx, pack > 0 ? 'SE COMPACTA' : 'SE LICÚA', 540, 1760, { size: 100, color: pack > 0 ? '#ff6b6b' : '#7bdff2', k: 1 });
  },
  // 6. Segundo diez: cintura. Y ahí paras -> baja hasta la cintura y se frena en seco en la línea de "tope"
  5: (ctx, a, K) => {
    estuary(ctx, a, K);
    const k = K.ease.out(K.ph(a.t, a.d, 0.05, 0.55)), stop = K.ph(a.t, a.d, 0.55, 0.65);
    const y = 300 + k * 520 - Math.sin(stop * Math.PI) * 20;
    body(ctx, a, K, 540, y, 0.42, 'shocked', { arms: 'up' });
    sandUp(ctx, K, 1300, a.t);
    ctx.setLineDash([30, 20]); ctx.strokeStyle = '#ff6b6b'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(60, 1300); ctx.lineTo(1020, 1300); ctx.stroke(); ctx.setLineDash([]);
    K.text(ctx, 'TOPE', 900, 1240, { size: 80, color: '#ff6b6b', k: K.ph(a.t, a.d, 0.55, 0.7) });
    badge(ctx, K, 'SEGUNDO 10');
  },
  // 7. La arena mojada es dos veces más densa que tú. Flotas -> balanza: tú contra un bloque de arena el doble de pesado; luego flotas como una boya
  6: (ctx, a, K) => {
    ctx.fillStyle = '#fff1d6'; ctx.fillRect(0, 0, 1080, 1920); K.radial(ctx, 540, 900, 700, '#ffd166', 0.25);
    const tilt = K.ease.inOut(K.ph(a.t, a.d, 0.1, 0.45)) * 0.28, flo = K.ph(a.t, a.d, 0.55, 1);
    if (flo === 0) {
      ctx.save(); ctx.translate(540, 1100);
      K.P(ctx, [[-60, 500], [60, 500], [20, 0], [-20, 0]], '#9aa6b2'); ctx.rotate(-tilt);
      K.R(ctx, -420, -14, 840, 28, 14, '#5a6070');
      ctx.save(); ctx.translate(-360, -14); ctx.rotate(tilt); body(ctx, a, K, 0, -380, 0.15, 'worried'); ctx.restore();
      ctx.save(); ctx.translate(360, -14); ctx.rotate(tilt); K.R(ctx, -130, -260, 260, 260, 16, SAND, 8); ctx.fillStyle = '#ffffff'; ctx.font = '90px Anton'; ctx.textAlign = 'center'; ctx.fillText('×2', 0, -100); ctx.restore();
      ctx.restore();
    } else {
      ctx.fillStyle = SAND; ctx.fillRect(0, 1200, 1080, 720);
      body(ctx, a, K, 540, 760 + Math.sin(a.t * 3) * 25, 0.42, 'happy', { arms: 'up' });
      sandUp(ctx, K, 1200 + Math.sin(a.t * 3) * 10, a.t);
      for (let i = 0; i < 3; i++) { const q = (a.t + i / 3) % 1; ctx.strokeStyle = `rgba(0,0,0,${0.3 * (1 - q)})`; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(540, 1210, 200 + q * 260, 30 + q * 30, 0, 0, 7); ctx.stroke(); }
      K.text(ctx, '¡FLOTAS!', 540, 560, { size: 130, color: '#5fd38a', k: K.ph(a.t, a.d, 0.6, 0.75) });
    }
  },
  // 8. Tirar de una pierna exige la fuerza de levantar un coche -> tira de su pierna con todas sus fuerzas; encima, un coche con "1.000 kg"
  7: (ctx, a, K) => {
    estuary(ctx, a, K);
    const strain = Math.sin(a.t * 14) * 6;
    ctx.save(); ctx.translate(strain, 0); K.midShot(ctx, a.who, { x: 540, y: 980, s: 0.7, mood: 'angry', t: a.t, seed: 1 }); ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; K.radial(ctx, 540, 980, 220, '#ff5a4a', 0.6); ctx.restore(); // cara roja del esfuerzo
    sandUp(ctx, K, 1500, a.t);
    const lift = K.ph(a.t, a.d, 0.25, 0.6);
    ctx.save(); ctx.translate(540, 520 - lift * 40 + Math.sin(a.t * 3) * 8); ctx.scale(0.9, 0.9); K.PROPS.coche_rojo(ctx, a.t); ctx.restore();
    K.L(ctx, [[540, 600], [540, 690]], '#ffffff', 10); K.P(ctx, [[510, 680], [570, 680], [540, 730]], '#ffffff', 0);
    K.text(ctx, '1.000 KG', 820, 360, { size: 90, color: '#ffd166', k: K.ph(a.t, a.d, 0.2, 0.35), rot: 0.1 });
    for (let i = 0; i < 2; i++) { const q = (a.t * 1.5 + i / 2) % 1; K.E(ctx, 700 + i * 30, 900 + q * 100, 10, 16, '#8fd3ff', 0, 3); }
  },
  // 9. Hora tres. El sol quema, la boca se seca -> sol enorme latiendo, ondas de calor, labios agrietados y sudor que se evapora
  8: (ctx, a, K) => {
    estuary(ctx, a, K);
    const k = K.ph(a.t, a.d, 0.05, 0.9);
    K.radial(ctx, 900, 260, 520 + Math.sin(a.t * 4) * 50, '#fff1a8', 0.85); K.C(ctx, 900, 260, 120 + Math.sin(a.t * 4) * 8, '#ffd84a', 8);
    K.midShot(ctx, a.who, { x: 540, y: 1000, s: 0.72, mood: 'worried', t: a.t, seed: 5 });
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; K.radial(ctx, 540, 1000, 260, '#ff6a4a', 0.55 * k); ctx.restore();
    ctx.strokeStyle = '#7a2a2a'; ctx.lineWidth = 4; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(500 + i * 25, 1115); ctx.lineTo(505 + i * 25, 1135); ctx.stroke(); } // grietas en los labios
    for (let i = 0; i < 3; i++) { const q = (a.t * 0.9 + i / 3) % 1; ctx.globalAlpha = 0.6 * (1 - q); K.radial(ctx, 420 + i * 120, 860 - q * 300, 40 + q * 40, '#ffffff', 1); } ctx.globalAlpha = 1;
    ctx.strokeStyle = `rgba(255,255,255,${0.3 * k})`; ctx.lineWidth = 6; for (let i = 0; i < 6; i++) { const x = 120 + i * 170; ctx.beginPath(); for (let y = 1700; y > 1250; y -= 20) ctx.lineTo(x + Math.sin(y / 30 + a.t * 6 + i) * 14, y); ctx.stroke(); }
    sandUp(ctx, K, 1520, a.t);
    badge(ctx, K, `HORA ${Math.min(3, 1 + Math.floor(k * 3))}`);
  },
  // 10. Entonces oyes el mar. Sube la marea -> gira la cabeza, ondas de sonido y el agua avanzando hacia él
  9: (ctx, a, K) => {
    estuary(ctx, a, K, 'atardecer');
    const k = K.ease.inOut(K.ph(a.t, a.d, 0.25, 1));
    ctx.fillStyle = 'rgba(47,140,190,0.8)'; ctx.beginPath(); ctx.moveTo(1080, 1180); for (let y = 1180; y <= 1920; y += 30) ctx.lineTo(1080 - 120 - k * 380 + Math.sin(y / 50 + a.t * 4) * 25, y); ctx.lineTo(1080, 1920); ctx.fill(); K.O(ctx, 6);
    ctx.save(); ctx.translate(480, 0); body(ctx, a, K, 0, 700, 0.42, 'shocked'); ctx.restore();
    sandUp(ctx, K, 1320, a.t);
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 9; for (let i = 0; i < 4; i++) { const q = (a.t * 1.3 + i / 4) % 1; ctx.globalAlpha = 1 - q; ctx.beginPath(); ctx.arc(1050, 760, 80 + q * 360, Math.PI * 0.75, Math.PI * 1.25); ctx.stroke(); } ctx.globalAlpha = 1;
    K.text(ctx, 'SUBE LA MAREA', 540, 1760, { size: 90, color: '#7bdff2', k: K.ph(a.t, a.d, 0.3, 0.45) });
  },
  // 11. La arena no te traga, pero el agua sí te tapa -> atrapado a la cintura; el agua sube del pecho a la barbilla, burbujas
  10: (ctx, a, K) => {
    estuary(ctx, a, K, 'atardecer');
    body(ctx, a, K, 540, 780, 0.42, 'shocked', { arms: 'up' });
    sandUp(ctx, K, 1450, a.t);
    const k = K.ease.inOut(K.ph(a.t, a.d, 0.1, 0.9));
    waterLevel(ctx, K, 1450 - k * 520, a.t);
    if (k > 0.6) for (let i = 0; i < 6; i++) { const q = (a.t * 1.4 + i / 6) % 1; ctx.globalAlpha = 1 - q; K.C(ctx, 520 + (i % 3) * 25, 960 - q * 200, 10 + q * 8, '#ffffff', 3); }
    ctx.globalAlpha = 1;
    K.text(ctx, 'EL AGUA, SÍ', 540, 560, { size: 110, color: '#ff6b6b', k: K.ph(a.t, a.d, 0.45, 0.6) });
  },
  // 12. El truco: échate atrás y mueve las piernas en círculos lentos -> se tumba hacia atrás; corte bajo tierra con las piernas girando en círculos
  11: (ctx, a, K) => {
    estuary(ctx, a, K, 'atardecer');
    const lean = K.ease.inOut(K.ph(a.t, a.d, 0.05, 0.4));
    ctx.save(); ctx.translate(540, 1100); ctx.rotate(-lean * 1.25); body(ctx, a, K, 0, -460, 0.42, 'neutral'); ctx.restore();
    sandUp(ctx, K, 1150, a.t);
    ctx.save(); ctx.beginPath(); ctx.rect(240, 1260, 600, 460); ctx.clip(); ctx.fillStyle = SAND_D; ctx.fillRect(240, 1260, 600, 460); // ventana bajo tierra
    for (let s = -1; s <= 1; s += 2) { const an = a.t * 2 + (s > 0 ? Math.PI : 0); K.L(ctx, [[540 + s * 60, 1260], [540 + s * 60 + Math.cos(an) * 60, 1500 + Math.sin(an) * 60]], '#3a4470', 60); }
    ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 8; for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(540 + s * 60, 1500, 95, a.t * 2, a.t * 2 + 4.5); ctx.stroke(); }
    ctx.restore(); ctx.strokeStyle = K.INK; ctx.lineWidth = 8; ctx.strokeRect(240, 1260, 600, 460);
    K.text(ctx, '1. ATRÁS', 300, 560, { size: 80, color: '#ffffff', k: K.ph(a.t, a.d, 0.05, 0.2) });
    K.text(ctx, '2. CÍRCULOS LENTOS', 600, 680, { size: 80, color: '#ffd166', k: K.ph(a.t, a.d, 0.4, 0.55) });
  },
  // 13. Sales rodando hasta suelo firme, justo antes de la ola -> rueda hacia la hierba mientras la ola rompe donde estaba
  12: (ctx, a, K) => {
    estuary(ctx, a, K, 'atardecer');
    ctx.fillStyle = '#6fbf58'; ctx.beginPath(); ctx.moveTo(0, 1250); ctx.quadraticCurveTo(260, 1200, 420, 1260); ctx.lineTo(420, 1920); ctx.lineTo(0, 1920); ctx.fill(); K.O(ctx, 8);
    const roll = K.ease.out(K.ph(a.t, a.d, 0.05, 0.6)), x = 760 - roll * 520;
    ctx.save(); ctx.translate(x, 1280); ctx.rotate(-roll * Math.PI * 4); ctx.translate(0, -0); body(ctx, a, K, 0, -320, 0.22, roll < 1 ? 'shocked' : 'happy'); ctx.restore();
    const wave = K.ph(a.t, a.d, 0.4, 0.9);
    if (wave > 0) { ctx.save(); ctx.translate(1100 - wave * 380, 1500); ctx.scale(0.9, 0.9); K.PROPS.ola_gigante(ctx, a.t); ctx.restore(); }
    if (roll >= 1) K.text(ctx, '¡A SALVO!', 300, 900, { size: 110, color: '#5fd38a', k: K.ph(a.t, a.d, 0.62, 0.75) });
  },
  // 14. El enemigo nunca fue la arena, sino el reloj -> la arena se tacha y aparece un reloj de marea enorme con el agua subiendo dentro
  13: (ctx, a, K) => {
    ctx.fillStyle = '#1e2440'; ctx.fillRect(0, 0, 1080, 1920);
    const k = K.ph(a.t, a.d, 0, 0.35), clk = K.ease.outBack(K.ph(a.t, a.d, 0.35, 0.55));
    if (clk < 0.3) { K.text(ctx, 'ARENA', 540, 900, { size: 170, color: SAND_L }); if (k > 0.5) { ctx.strokeStyle = '#ff6b6b'; ctx.lineWidth = 26; ctx.beginPath(); ctx.moveTo(300, 960); ctx.lineTo(300 + 480 * Math.min(1, (k - 0.5) * 2), 840); ctx.stroke(); } }
    if (clk > 0) {
      ctx.save(); ctx.translate(540, 1000); ctx.scale(clk, clk);
      ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 330, 0, 7); ctx.clip(); ctx.fillStyle = '#f4f1ea'; ctx.fillRect(-340, -340, 680, 680);
      const lvl = 330 - K.ph(a.t, a.d, 0.5, 1) * 560; ctx.fillStyle = 'rgba(47,140,190,0.75)'; ctx.beginPath(); ctx.moveTo(-340, 340); ctx.lineTo(-340, lvl); for (let x = -340; x <= 340; x += 20) ctx.lineTo(x, lvl + Math.sin(x / 40 + a.t * 4) * 10); ctx.lineTo(340, 340); ctx.fill(); ctx.restore();
      ctx.beginPath(); ctx.arc(0, 0, 330, 0, 7); ctx.lineWidth = 20; ctx.strokeStyle = K.INK; ctx.stroke();
      for (let i = 0; i < 12; i++) { const an = i / 12 * Math.PI * 2; K.C(ctx, Math.cos(an) * 280, Math.sin(an) * 280, 10, K.INK, 0); }
      ctx.save(); ctx.rotate(a.t * 4); K.L(ctx, [[0, 0], [0, -240]], '#e8505b', 12); ctx.restore(); K.C(ctx, 0, 0, 24, K.INK, 0);
      ctx.restore();
      K.text(ctx, 'EL RELOJ', 540, 1560, { size: 130, color: '#ffd166', k: K.ph(a.t, a.d, 0.5, 0.65) });
    }
  },
  // 15. Debajo de un sombrero flotando, alguien espera ese truco -> el sombrero flota y por debajo asoman unos ojos que parpadean
  14: (ctx, a, K) => {
    K.drawPlace(ctx, 'desierto', 'dia', a.t);
    pit(ctx, K, 540, 1450, 430, 150, a.t);
    const peek = K.ease.out(K.ph(a.t, a.d, 0.3, 0.55));
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 1080, 1440); ctx.clip();
    K.face(ctx, a.who, 540, 1560 - peek * 200, 0.9, { mood: 'worried', t: a.t });
    ctx.restore();
    hat(ctx, K, 540 + Math.sin(a.t * 1.5) * 8, 1400 - peek * 120 + Math.sin(a.t * 2) * 6, 1.1, Math.sin(a.t * 1.3) * 0.06);
    K.text(ctx, '…', 760, 1100, { size: 150, color: '#ffffff', k: K.ph(a.t, a.d, 0.6, 0.75) });
  },
};
