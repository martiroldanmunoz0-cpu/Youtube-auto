// Escenas a medida de pedido-23-01: «What If You Fell Into the Grand Canyon? Movies vs Reality»

const WALL = ['#e0784a', '#c95f3a', '#b04f33', '#d98a55', '#9c4630', '#c46a42'];
function sky(ctx, K, hora, t) { K.drawPlace(ctx, 'desierto', hora, t); }
// Cañón visto de frente: paredes rojas por capas a izquierda y derecha, con escalones, y el río al fondo
function canyon(ctx, a, K, { hora = 'dia', depth = 0, river = true } = {}) {
  sky(ctx, K, hora, a.t);
  ctx.save(); ctx.translate(0, -depth);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 6; i++) {
      const y0 = 700 + i * 260, inset = 80 + i * 55;
      ctx.beginPath();
      if (side < 0) { ctx.moveTo(-20, y0); ctx.lineTo(380 - inset * 0.6 + Math.sin(i * 2) * 30, y0); ctx.lineTo(330 - inset * 0.6, y0 + 260); ctx.lineTo(-20, y0 + 260); }
      else { ctx.moveTo(1100, y0); ctx.lineTo(700 + inset * 0.6 + Math.cos(i * 2) * 30, y0); ctx.lineTo(750 + inset * 0.6, y0 + 260); ctx.lineTo(1100, y0 + 260); }
      ctx.closePath(); ctx.fillStyle = WALL[(i + (side > 0 ? 2 : 0)) % 6]; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = K.INK; ctx.stroke();
      ctx.fillStyle = 'rgba(0,0,0,0.1)'; for (let k = 0; k < 5; k++) ctx.fillRect(side < 0 ? 20 + k * 60 : 760 + k * 60, y0 + 60 + (k % 3) * 50, 40, 8);
    }
  }
  if (river) { ctx.fillStyle = '#3fa7d6'; ctx.beginPath(); ctx.moveTo(360, 2260); ctx.bezierCurveTo(480, 2200, 600, 2300, 720, 2260); ctx.lineTo(760, 2400); ctx.lineTo(320, 2400); ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = K.INK; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 5; for (let i = 0; i < 4; i++) { const x = 400 + ((i * 90 + a.t * 60) % 300); ctx.beginPath(); ctx.moveTo(x, 2290 + i * 15); ctx.lineTo(x + 40, 2290 + i * 15); ctx.stroke(); } }
  ctx.restore();
}
// Persona cayendo (cuerpo entero girando)
function faller(ctx, a, K, x, y, s, rot, mood = 'shocked') {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); K.drawFullBody(ctx, 0, -1100 * s, s, a.who, { mood, t: a.t, arms: 'up' }); ctx.restore();
}
// Claqueta de cine (MOVIE) que se cierra de golpe
function clapper(ctx, K, x, y, s, k, txt = 'MOVIE') {
  if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s * K.ease.outBack(Math.min(1, k * 1.4)), s * K.ease.outBack(Math.min(1, k * 1.4)));
  K.R(ctx, -170, -60, 340, 200, 16, '#22232b', 8);
  ctx.save(); ctx.translate(-170, -60); ctx.rotate(-0.5 * (1 - Math.min(1, k * 2))); K.R(ctx, 0, -60, 340, 60, 8, '#ffffff', 8); ctx.fillStyle = '#22232b'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(20 + i * 70, -60); ctx.lineTo(55 + i * 70, -60); ctx.lineTo(35 + i * 70, 0); ctx.lineTo(0 + i * 70, 0); ctx.fill(); } ctx.restore();
  ctx.fillStyle = '#ffd166'; ctx.font = '78px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, 45);
  ctx.restore();
}
function stamp(ctx, K, txt, x, y, k, col = '#2ec27e') {
  if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(-0.14); const s = 1.8 - 0.8 * K.ease.out(Math.min(1, k)); ctx.scale(s, s); ctx.globalAlpha = Math.min(1, k * 2);
  ctx.font = '110px Anton'; const w = ctx.measureText(txt).width + 70; ctx.lineWidth = 12; ctx.strokeStyle = col; ctx.strokeRect(-w / 2, -80, w, 160); ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, 6); ctx.restore();
}
function sweat(ctx, K, x, y, t) { for (let i = 0; i < 3; i++) { const q = (t * 1.3 + i * 0.33) % 1; K.E(ctx, x + i * 60 - 60, y + q * 200, 14, 22, '#8fd3ff', 0, 4); } }
function heat(ctx, t) { ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 6; for (let i = 0; i < 7; i++) { ctx.beginPath(); for (let y = 0; y < 400; y += 20) { const x = 120 + i * 140 + Math.sin(y / 40 + t * 5 + i) * 18; y ? ctx.lineTo(x, 1500 - y - (t * 120 % 80)) : ctx.moveTo(x, 1500); } ctx.stroke(); } ctx.restore(); }
function thermo(ctx, K, x, y, lvl, label) {
  K.R(ctx, x - 40, y - 600, 80, 620, 40, '#ffffff', 8); K.C(ctx, x, y + 40, 75, '#ff3b30', 8);
  ctx.fillStyle = '#ff3b30'; ctx.fillRect(x - 22, y - 560 * lvl, 44, 560 * lvl + 20);
  for (let i = 0; i < 6; i++) { ctx.fillStyle = '#22232b'; ctx.fillRect(x + 42, y - 80 - i * 90, 26, 6); }
  if (label) K.text(ctx, label, x, y - 700, { size: 90, color: '#ffd166' });
}

export default {
  // 1. What if you fell into the Grand Canyon? -> en el borde al atardecer, una piedra cae y la cámara baja hacia el abismo
  0: (ctx, a, K) => {
    const k = K.ease.inOut(K.ph(a.t, a.d, 0.2, 1));
    canyon(ctx, a, K, { hora: 'atardecer', depth: k * 260 });
    ctx.save(); ctx.translate(0, -k * 260);
    K.R(ctx, -20, 1180, 440, 70, 10, '#d98a55', 8);
    K.drawFullBody(ctx, 250, 760, 0.18, a.who, { mood: 'shocked', t: a.t });
    const pk = K.ph(a.t, a.d, 0.15, 1); K.C(ctx, 440 + pk * 60, 1210 + pk * pk * 1100, 18, '#8a6a4e', 5);
    ctx.restore();
    K.text(ctx, '?', 800, 760, { size: 260, color: '#ffffff', k: K.ph(a.t, a.d, 0.4, 0.55), rot: 0.15 });
  },
  // 2. Forget the movies. Here's the truth. -> claqueta MOVIE tachada y sello TRUTH
  1: (ctx, a, K) => {
    sky(ctx, K, 'atardecer', a.t);
    clapper(ctx, K, 540, 820, 1.6, K.ph(a.t, a.d, 0, 0.25));
    const x = K.ph(a.t, a.d, 0.3, 0.45); if (x > 0) { ctx.save(); ctx.strokeStyle = '#ff3b30'; ctx.lineWidth = 30; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(300, 620); ctx.lineTo(300 + 480 * x, 620 + 400 * x); ctx.stroke(); ctx.restore(); }
    stamp(ctx, K, 'THE TRUTH', 540, 1350, K.ph(a.t, a.d, 0.55, 0.7));
  },
  // 3. Your foot slips. -> primer plano del pie en el borde: la roca se desmorona y el pie resbala
  2: (ctx, a, K) => {
    sky(ctx, K, 'atardecer', a.t);
    const s = K.ph(a.t, a.d, 0.35, 0.6), [sx, sy] = K.shakeAt(a.t, a.d * 0.35, 16, 0.5);
    ctx.save(); ctx.translate(sx, sy);
    K.P(ctx, [[-20, 1100], [640, 1100], [700, 1180], [660, 1920], [-20, 1920]], '#c95f3a', 9);
    ctx.save(); ctx.translate(420 + s * 260, 1010 + s * s * 300); ctx.rotate(s * 0.9);
    K.R(ctx, -60, -380, 160, 380, 40, '#2d4a7a', 8); K.R(ctx, -90, -40, 300, 100, 40, '#f2f2f2', 8); ctx.fillStyle = '#d64545'; ctx.fillRect(-70, 10, 260, 22);
    ctx.restore();
    for (let i = 0; i < 8; i++) { const q = K.ph(a.t, a.d, 0.35 + i * 0.03, 1); if (q <= 0) continue; K.C(ctx, 640 + (i * 37) % 90 + q * 40, 1110 + q * q * 900, 12 + (i % 3) * 8, '#8a6a4e', 4); }
    ctx.restore();
    K.text(ctx, 'SLIP!', 820, 760, { size: 150, color: '#ffd166', k: K.ph(a.t, a.d, 0.4, 0.5), rot: 0.1 });
  },
  // 4. Movie version: you plunge a full mile, nonstop -> caída recta por una pared lisa, con líneas de velocidad
  3: (ctx, a, K) => {
    ctx.fillStyle = '#f2b36b'; ctx.fillRect(0, 0, 1080, 1920);
    const off = (a.t * 2600) % 300; ctx.fillStyle = '#c95f3a'; ctx.fillRect(0, 0, 330, 1920); ctx.fillRect(750, 0, 330, 1920);
    ctx.fillStyle = 'rgba(0,0,0,0.15)'; for (let y = -300; y < 1920; y += 300) { ctx.fillRect(0, y + off, 330, 20); ctx.fillRect(750, y + off + 150, 330, 20); }
    K.speedLines(ctx, 540, 900, a.t, 0.8);
    faller(ctx, a, K, 540, 1000 + Math.sin(a.t * 3) * 30, 0.2, Math.sin(a.t * 2) * 0.4);
    clapper(ctx, K, 540, 1640, 0.9, K.ph(a.t, a.d, 0, 0.2));
    K.text(ctx, 'NONSTOP', 540, 600, { size: 110, color: '#ffffff', k: K.ph(a.t, a.d, 0.4, 0.55) });
  },
  // 5. Reality: about a mile deep -> corte del cañón con una cinta métrica que baja hasta 1 MILE y torres para comparar
  4: (ctx, a, K) => {
    sky(ctx, K, 'dia', a.t);
    K.P(ctx, [[-20, 420], [380, 420], [460, 1700], [-20, 1700]], '#c95f3a', 9); K.P(ctx, [[1100, 420], [700, 420], [620, 1700], [1100, 1700]], '#b04f33', 9);
    const k = K.ease.inOut(K.ph(a.t, a.d, 0.05, 0.7));
    ctx.save(); ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 16; ctx.setLineDash([30, 20]); ctx.beginPath(); ctx.moveTo(540, 420); ctx.lineTo(540, 420 + 1260 * k); ctx.stroke(); ctx.restore();
    K.R(ctx, 500, 400, 80, 60, 10, '#ffd166', 7);
    for (let i = 0; i < 4; i++) { const q = K.ph(a.t, a.d, 0.25 + i * 0.12, 0.35 + i * 0.12); if (q <= 0) continue; ctx.save(); ctx.translate(700, 1700 - i * 300); ctx.scale(0.5, 0.5 * K.ease.outBack(q)); K.prop(ctx, 'edificio', 0, -300, 1, a.t); ctx.restore(); }
    K.text(ctx, '1 MILE', 260, 1150, { size: 120, color: '#ffd166', k: K.ph(a.t, a.d, 0.6, 0.75), rot: -0.1 });
  },
  // 6. ~120 mph -> velocímetro gigante con la aguja subiendo y la persona cayendo al lado
  5: (ctx, a, K) => {
    canyon(ctx, a, K, { depth: (a.t * 300) % 260 });
    const k = K.ease.out(K.ph(a.t, a.d, 0, 0.8));
    ctx.save(); ctx.translate(540, 1150); K.C(ctx, 0, 0, 330, '#22232b', 12); K.C(ctx, 0, 0, 290, '#ffffff', 6);
    for (let i = 0; i <= 12; i++) { const an = Math.PI * 0.8 + i / 12 * Math.PI * 1.4; ctx.save(); ctx.rotate(an); ctx.fillStyle = i > 9 ? '#ff3b30' : '#22232b'; ctx.fillRect(220, -6, 50, 12); ctx.restore(); }
    ctx.save(); ctx.rotate(Math.PI * 0.8 + k * Math.PI * 1.4 + Math.sin(a.t * 30) * 0.02); K.R(ctx, -10, -12, 250, 24, 12, '#ff3b30', 5); ctx.restore(); K.C(ctx, 0, 0, 34, '#22232b', 0);
    ctx.fillStyle = '#22232b'; ctx.font = '120px Anton'; ctx.textAlign = 'center'; ctx.fillText(`${Math.round(k * 120)}`, 0, 190); ctx.font = '44px Poppins'; ctx.fillText('MPH', 0, 250);
    ctx.restore();
    faller(ctx, a, K, 860, 500, 0.1, a.t * 3);
  },
  // 7. Movie: you land in a cool, calm river -> chapuzón en un río azul, sonriendo, con salpicadura
  6: (ctx, a, K) => {
    sky(ctx, K, 'dia', a.t);
    K.P(ctx, [[-20, 300], [300, 300], [260, 1400], [-20, 1400]], '#c95f3a', 9); K.P(ctx, [[1100, 300], [780, 300], [820, 1400], [1100, 1400]], '#b04f33', 9);
    ctx.fillStyle = '#4cc3f0'; ctx.fillRect(0, 1300, 1080, 620); K.R(ctx, 0, 1296, 1080, 10, 0, K.INK, 0);
    const k = K.ph(a.t, a.d, 0, 0.35);
    if (k < 1) faller(ctx, a, K, 540, 300 + k * 1000, 0.16, 0.3, 'happy');
    else { const b = Math.sin(a.t * 3) * 10; ctx.save(); ctx.translate(540, 1240 + b); ctx.scale(0.5, 0.5); K.drawHead(ctx, 0, 0, a.who, { mood: 'happy', t: a.t }); ctx.restore();
      for (let i = 0; i < 10; i++) { const q = K.ph(a.t, a.d, 0.35, 0.7); if (q >= 1) break; K.E(ctx, 540 + Math.cos(i * 0.7 - 2.4) * 260 * q, 1300 - Math.sin(i * 0.7) * 300 * q + 400 * q * q, 22, 30, '#bfe9ff', 0, 5); } }
    clapper(ctx, K, 540, 1650, 0.9, K.ph(a.t, a.d, 0, 0.2));
    K.text(ctx, 'AHHH!', 800, 900, { size: 100, color: '#ffffff', k: K.ph(a.t, a.d, 0.5, 0.6) });
  },
  // 8. Reality: the inner canyon runs 20 degrees hotter -> dos termómetros: borde y fondo; el del fondo sube +20°
  7: (ctx, a, K) => {
    sky(ctx, K, 'dia', a.t);
    ctx.fillStyle = '#d98a55'; ctx.fillRect(0, 1600, 1080, 320);
    const k = K.ease.out(K.ph(a.t, a.d, 0.15, 0.8));
    thermo(ctx, K, 300, 1450, 0.45, 'RIM');
    thermo(ctx, K, 780, 1450, 0.45 + 0.4 * k, 'BOTTOM');
    heat(ctx, a.t);
    K.text(ctx, '+20°F', 780, 520, { size: 130, color: '#ff3b30', k: K.ph(a.t, a.d, 0.6, 0.75) });
  },
  // 9. At Phantom Ranch, summer days pass 110 degrees -> cartel de Phantom Ranch, sol enorme, persona sudando
  8: (ctx, a, K) => {
    sky(ctx, K, 'dia', a.t);
    ctx.fillStyle = 'rgba(255,140,60,0.25)'; ctx.fillRect(0, 0, 1080, 1920);
    const sp = 1 + Math.sin(a.t * 4) * 0.05; ctx.save(); ctx.translate(820, 420); ctx.scale(sp, sp); K.prop(ctx, 'sol', 0, 0, 1.3, a.t); ctx.restore();
    ctx.save(); ctx.translate(250, 1500); K.R(ctx, -20, -350, 40, 350, 8, '#8a5a3a', 6); ctx.rotate(-0.04); K.R(ctx, -200, -480, 400, 150, 14, '#c98a4e', 8); ctx.fillStyle = '#3a2416'; ctx.font = '54px Anton'; ctx.textAlign = 'center'; ctx.fillText('PHANTOM', 0, -410); ctx.fillText('RANCH', 0, -350); ctx.restore();
    K.midShot(ctx, a.who, { x: 680, y: 1150, s: 0.8, mood: 'worried', t: a.t });
    sweat(ctx, K, 680, 820, a.t); heat(ctx, a.t);
    K.text(ctx, '110°F', 540, 1650, { size: 160, color: '#ff3b30', k: K.ph(a.t, a.d, 0.3, 0.45) });
  },
  // 10. Movie: a helicopter scoops you up for free -> el helicóptero entra, baja una cuerda y te sube; cartel FREE
  9: (ctx, a, K) => {
    canyon(ctx, a, K, { depth: 200 });
    const k = K.ease.out(K.ph(a.t, a.d, 0, 0.35)), up = K.ease.inOut(K.ph(a.t, a.d, 0.5, 1));
    const hx = 1300 - k * 700, hy = 560 - up * 120;
    ctx.save(); ctx.translate(hx, hy + Math.sin(a.t * 6) * 8); K.prop(ctx, 'helicoptero', 0, 0, 1.1, a.t); ctx.restore();
    if (k > 0.9) { const ry = 1250 - up * 650; ctx.strokeStyle = K.INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(hx, hy + 80); ctx.lineTo(hx, ry - 200); ctx.stroke(); K.drawFullBody(ctx, hx, ry - 200, 0.13, a.who, { mood: 'happy', t: a.t, arms: 'up' }); }
    clapper(ctx, K, 260, 1600, 0.75, K.ph(a.t, a.d, 0, 0.2));
    stamp(ctx, K, 'FREE', 760, 1450, K.ph(a.t, a.d, 0.55, 0.7), '#2ec27e');
  },
  // 11. Reality: rangers run hundreds of rescues every year -> guardas con sombrero y un contador de rescates subiendo
  10: (ctx, a, K) => {
    canyon(ctx, a, K, { depth: 100 });
    const n = Math.round(K.ease.out(K.ph(a.t, a.d, 0.1, 0.85)) * 300);
    for (let i = 0; i < 3; i++) { const q = K.ph(a.t, a.d, 0.05 + i * 0.1, 0.25 + i * 0.1); if (q <= 0) continue; const x = 260 + i * 280;
      ctx.save(); ctx.translate(0, (1 - K.ease.outBack(q)) * 300); K.drawFullBody(ctx, x, 1000, 0.2, K.personaWho('canyon', { who: 'ranger' + i }), { mood: 'neutral', t: a.t + i });
      K.E(ctx, x, 960, 95, 22, '#7a5a2e', 0, 6); K.R(ctx, x - 48, 905, 96, 58, 20, '#8c6a36', 6); ctx.restore(); }
    K.R(ctx, 240, 420, 600, 220, 30, '#14152a', 8); ctx.fillStyle = '#ffd166'; ctx.font = '150px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(`${n}+`, 540, 535);
    K.text(ctx, 'RESCUES / YEAR', 540, 720, { size: 70, color: '#ffffff', k: K.ph(a.t, a.d, 0.2, 0.35) });
  },
  // 12. An air ambulance can cost tens of thousands -> la factura se desenrolla hasta el suelo: $30,000+
  11: (ctx, a, K) => {
    sky(ctx, K, 'dia', a.t);
    const k = K.ease.out(K.ph(a.t, a.d, 0.05, 0.6));
    ctx.save(); ctx.translate(540, 300); K.R(ctx, -300, 0, 600, 200 + 1200 * k, 8, '#fbfaf4', 8);
    ctx.fillStyle = K.INK; ctx.font = '56px Anton'; ctx.textAlign = 'center'; ctx.fillText('AIR AMBULANCE', 0, 90);
    ctx.fillStyle = '#c8c8c8'; for (let i = 0; i < Math.floor(14 * k); i++) ctx.fillRect(-240, 160 + i * 70, i % 2 ? 300 : 420, 18);
    ctx.restore();
    K.prop(ctx, 'helicoptero', 830, 470, 0.6, a.t);
    if (k > 0.8) { K.text(ctx, '$30,000+', 540, 1350, { size: 170, color: '#ff3b30', k: K.ph(a.t, a.d, 0.55, 0.7), rot: -0.08 });
      for (let i = 0; i < 8; i++) { const q = (a.t * 0.6 + i * 0.13) % 1; K.prop(ctx, 'dinero_billete', 100 + i * 120, -100 + q * 2100, 0.35, a.t, q * 6 + i); } }
  },
  // 13. Now, here's what almost nobody knows -> la persona se acerca y susurra; bombilla encendiéndose
  12: (ctx, a, K) => {
    K.drawPlace(ctx, 'desierto', 'atardecer', a.t);
    ctx.fillStyle = 'rgba(20,10,40,0.45)'; ctx.fillRect(0, 0, 1080, 1920);
    const z = 1 + K.ease.inOut(K.ph(a.t, a.d, 0, 1)) * 0.25; ctx.save(); ctx.translate(540, 1200); ctx.scale(z, z); ctx.translate(-540, -1200);
    K.midShot(ctx, a.who, { x: 540, y: 1200, s: 1, mood: 'neutral', t: a.t }); ctx.restore();
    const l = K.ph(a.t, a.d, 0.35, 0.5); if (l > 0) { K.radial(ctx, 820, 520, 260 * l, '#fff3a0', 0.8); K.prop(ctx, 'bombilla', 820, 520, 0.9 * K.ease.outBack(l), a.t); }
    K.text(ctx, 'SHHH...', 280, 560, { size: 110, color: '#ffffff', k: K.ph(a.t, a.d, 0.1, 0.25), rot: -0.12 });
  },
  // 14. The canyon isn't one sheer wall; it's a staircase of ledges -> la pared lisa se transforma en escalones
  13: (ctx, a, K) => {
    sky(ctx, K, 'dia', a.t);
    const k = K.ease.inOut(K.ph(a.t, a.d, 0.15, 0.7));
    // pared: de una rampa lisa (k=0) a una escalera de salientes (k=1)
    ctx.beginPath(); ctx.moveTo(-20, 300); ctx.lineTo(120, 300);
    for (let i = 0; i < 8; i++) {
      const y0 = 300 + i * 190, x0 = 120 + i * 80;
      ctx.lineTo(x0 + 80 * (1 - k) * 0.5 + 80 * k, y0 + 95 * (1 - k)); // esquina del escalón (en la rampa: punto medio)
      ctx.lineTo(x0 + 80, y0 + 190);
    }
    ctx.lineTo(760, 1920); ctx.lineTo(-20, 1920); ctx.closePath(); ctx.fillStyle = '#c95f3a'; ctx.fill(); ctx.lineWidth = 9; ctx.strokeStyle = K.INK; ctx.stroke();
    for (let i = 0; i < 8; i++) { const q = K.ph(a.t, a.d, 0.5 + i * 0.05, 0.6 + i * 0.05); if (q <= 0) continue; ctx.save(); ctx.globalAlpha = q; K.R(ctx, 120 + i * 80 - 10, 300 + i * 190 - 12, 100, 24, 10, '#ffd166', 5); ctx.restore(); }
    K.text(ctx, 'A STAIRCASE', 720, 560, { size: 110, color: '#ffd166', k: K.ph(a.t, a.d, 0.6, 0.75), rot: -0.06 });
  },
  // 15. You land on a ledge. That's why some survive. -> cae, aterriza en un saliente con polvo, se levanta con tiritas
  14: (ctx, a, K) => {
    sky(ctx, K, 'dia', a.t);
    K.P(ctx, [[-20, 1250], [800, 1250], [760, 1350], [-20, 1350]], '#d98a55', 9); K.P(ctx, [[-20, 1350], [700, 1350], [640, 1920], [-20, 1920]], '#c95f3a', 9);
    const k = K.ph(a.t, a.d, 0, 0.3);
    if (k < 1) faller(ctx, a, K, 460, 200 + K.ease.in(k) * 1050, 0.14, 1 - k);
    else { const up = K.ease.out(K.ph(a.t, a.d, 0.45, 0.7)); ctx.save(); ctx.translate(460, 1250); ctx.rotate((1 - up) * 1.4); K.drawFullBody(ctx, 0, -320, 0.14, a.who, { mood: up > 0.5 ? 'happy' : 'worried', t: a.t }); ctx.restore();
      K.smoke(ctx, 460, 1240, K.ph(a.t, a.d, 0.3, 0.6)); if (up > 0.9) K.text(ctx, 'ALIVE!', 760, 900, { size: 120, color: '#2ec27e', k: K.ph(a.t, a.d, 0.7, 0.8) }); }
    if (Math.abs(a.t - a.d * 0.3) < 0.15) K.flash(ctx, a.t, a.d * 0.3, 0.1);
  },
  // 16. The same canyon that pulls you in is built to catch you -> panorámica al atardecer; los escalones brillan uno a uno
  15: (ctx, a, K) => {
    const z = 1 + K.ph(a.t, a.d, 0, 1) * 0.1; ctx.save(); ctx.translate(540, 960); ctx.scale(z, z); ctx.translate(-540, -960);
    canyon(ctx, a, K, { hora: 'atardecer', depth: 150 });
    for (let i = 0; i < 6; i++) { const q = K.ph(a.t, a.d, 0.15 + i * 0.1, 0.3 + i * 0.1); if (q <= 0) continue; ctx.save(); ctx.globalAlpha = q * (0.6 + 0.4 * Math.sin(a.t * 4 + i)); ctx.fillStyle = '#ffe28a';
      ctx.fillRect(i % 2 ? 680 : 180, 560 + i * 250, 220, 16); ctx.restore(); }
    ctx.restore();
    K.sparkles(ctx, 540, 900, a.t, 10);
  },
};
