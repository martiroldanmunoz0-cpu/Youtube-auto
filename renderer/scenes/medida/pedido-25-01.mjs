// Escenas a medida de pedido-25-01: «What Happens If You Stop Sleeping? The 11-Day Record»

function room(ctx, a, K, hora = 'noche') { K.drawPlace(ctx, 'dormitorio', hora, a.t); }
function counter(ctx, K, txt, y = 700, col = '#ffd166', k = 1) { // marcador de horas sin dormir
  if (k <= 0) return; ctx.save(); ctx.translate(540, y); const s = K.ease.outBack(Math.min(1, k)); ctx.scale(s, s);
  ctx.font = '120px Anton'; const w = ctx.measureText(txt).width + 90; K.R(ctx, -w / 2, -85, w, 170, 40, '#14152a', 8);
  ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, 6); ctx.restore();
}
function bed(ctx, K, x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); K.R(ctx, -420, -40, 840, 200, 30, '#8a5a3a', 8); K.R(ctx, -400, -110, 800, 120, 30, '#7fb3e0', 8); K.R(ctx, -380, -170, 220, 90, 40, '#ffffff', 7); K.R(ctx, -440, -260, 60, 420, 20, '#8a5a3a', 8); ctx.restore(); }
function clock(ctx, K, x, y, r, t, speed = 1) {
  K.C(ctx, x, y, r, '#ffffff', 8); ctx.save(); ctx.translate(x, y); ctx.strokeStyle = K.INK; ctx.lineCap = 'round';
  ctx.lineWidth = r * 0.08; ctx.beginPath(); ctx.moveTo(0, 0); const ah = t * speed * 0.5; ctx.lineTo(Math.sin(ah) * r * 0.5, -Math.cos(ah) * r * 0.5); ctx.stroke();
  ctx.lineWidth = r * 0.05; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(t * speed * 6) * r * 0.8, -Math.cos(t * speed * 6) * r * 0.8); ctx.stroke(); ctx.restore();
}
function eyes(ctx, K, cx, cy, s, open, t, red = 0) { // un par de ojos enormes con venitas rojas
  for (const dx of [-230, 230]) { ctx.save(); ctx.translate(cx + dx * s, cy); ctx.scale(s, s);
    K.E(ctx, 0, 0, 190, 190 * Math.max(0.05, open), '#ffffff', 0, 10);
    if (open > 0.2) { ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, 190, 190 * open, 0, 0, 7); ctx.clip(); ctx.strokeStyle = `rgba(220,40,40,${red})`; ctx.lineWidth = 5; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(Math.cos(i) * 190, Math.sin(i) * 190); ctx.lineTo(Math.cos(i) * 90, Math.sin(i * 1.7) * 60); ctx.stroke(); }
      K.C(ctx, Math.sin(t * 0.7) * 20, 0, 80, '#5a8fd6', 6); K.C(ctx, Math.sin(t * 0.7) * 20, 0, 40, K.INK, 0); K.C(ctx, Math.sin(t * 0.7) * 20 + 22, -22, 14, '#ffffff', 0); ctx.restore(); }
    ctx.restore(); }
}
function zzz(ctx, K, x, y, t, n = 3, col = '#ffffff') { for (let i = 0; i < n; i++) { const q = (t * 0.6 + i / n) % 1; ctx.save(); ctx.globalAlpha = 1 - q; ctx.fillStyle = col; ctx.font = `${50 + i * 20}px Anton`; ctx.fillText('Z', x + q * 120 + i * 30, y - q * 260 - i * 40); ctx.restore(); } }

export default {
  // 1. This teenager stayed awake for 11 days -> en la cama con los ojos como platos; el reloj gira loco; 264 HOURS
  0: (ctx, a, K) => {
    room(ctx, a, K);
    bed(ctx, K, 540, 1500, 1);
    ctx.save(); ctx.translate(400, 1280); ctx.scale(0.55, 0.55); K.drawHead(ctx, 0, 0, a.who, { mood: 'shocked', t: a.t }); ctx.restore();
    clock(ctx, K, 800, 900, 130, a.t, 12);
    const h = Math.round(K.ease.out(K.ph(a.t, a.d, 0, 0.8)) * 264);
    counter(ctx, K, `${h} HOURS`, 700, '#ff3b30', K.ph(a.t, a.d, 0, 0.15));
  },
  // 2. What happens to your body without sleep? -> silueta del cuerpo: cerebro y corazón palpitan, interrogantes
  1: (ctx, a, K) => {
    room(ctx, a, K);
    K.drawFullBody(ctx, 540, 700, 0.3, a.who, { mood: 'worried', t: a.t });
    const p = 1 + Math.max(0, Math.sin(a.t * 6)) * 0.12;
    ctx.save(); ctx.translate(220, 760); ctx.scale(p, p); K.prop(ctx, 'cerebro', 0, 0, 0.7, a.t); ctx.restore();
    ctx.save(); ctx.translate(860, 1060); ctx.scale(p, p); K.prop(ctx, 'corazon', 0, 0, 0.6, a.t); ctx.restore();
    K.text(ctx, '?', 220, 520, { size: 160, color: '#ffd166', k: K.ph(a.t, a.d, 0.2, 0.35) }); K.text(ctx, '?', 860, 820, { size: 160, color: '#ffd166', k: K.ph(a.t, a.d, 0.35, 0.5) });
  },
  // 3. Randy Gardner, 17, wanted a science fair project -> chico con su cartel de feria de ciencias; 1964
  2: (ctx, a, K) => {
    K.drawPlace(ctx, 'salon', 'dia', a.t);
    K.midShot(ctx, a.who, { x: 330, y: 1250, s: 0.75, mood: 'happy', t: a.t });
    const k = K.ease.outBack(K.ph(a.t, a.d, 0.1, 0.35)); ctx.save(); ctx.translate(760, 1150); ctx.scale(k, k); ctx.rotate(0.04);
    K.R(ctx, -230, -300, 460, 560, 14, '#ffffff', 8); K.R(ctx, -230, -300, 460, 90, 14, '#2f80ed', 8);
    ctx.fillStyle = '#fff'; ctx.font = '50px Anton'; ctx.textAlign = 'center'; ctx.fillText('SCIENCE FAIR', 0, -238);
    ctx.fillStyle = K.INK; ctx.font = '44px Anton'; ctx.fillText('HOW LONG CAN', 0, -130); ctx.fillText('YOU STAY AWAKE?', 0, -75);
    clock(ctx, K, 0, 80, 90, a.t, 2); ctx.restore();
    K.text(ctx, 'RANDY, 17', 330, 640, { size: 100, color: '#ffffff', k: K.ph(a.t, a.d, 0.3, 0.45) });
    K.text(ctx, '1964', 860, 560, { size: 90, color: '#ffd166', k: K.ph(a.t, a.d, 0.45, 0.6) });
  },
  // 4. Hour 24: you react like a drunk driver -> el coche hace eses por la carretera; HOUR 24
  3: (ctx, a, K) => {
    K.drawPlace(ctx, 'calle', 'atardecer', a.t);
    const x = 540 + Math.sin(a.t * 2.4) * 260, r = Math.cos(a.t * 2.4) * 0.35;
    ctx.save(); ctx.translate(x, 1350); ctx.rotate(r); K.prop(ctx, 'coche_rojo', 0, 0, 1.1, a.t); ctx.restore();
    ctx.strokeStyle = 'rgba(40,40,40,0.35)'; ctx.lineWidth = 14; ctx.beginPath(); for (let y = 1920; y > 1400; y -= 20) { const tt = a.t - (1920 - y) / 600; const xx = 540 + Math.sin(tt * 2.4) * 260; y === 1920 ? ctx.moveTo(xx, y) : ctx.lineTo(xx, y); } ctx.stroke();
    counter(ctx, K, 'HOUR 24', 700, '#ffd166', K.ph(a.t, a.d, 0, 0.15));
    K.text(ctx, '= DRUNK', 540, 900, { size: 110, color: '#ff3b30', k: K.ph(a.t, a.d, 0.4, 0.55), rot: -0.08 });
  },
  // 5. Your vision blurs, and everything goes dark -> ojos que parpadean cada vez más lento; todo se desenfoca y oscurece
  4: (ctx, a, K) => {
    room(ctx, a, K, 'dia');
    const k = K.ph(a.t, a.d, 0.1, 1);
    ctx.save(); ctx.filter = `blur(${Math.round(k * 14)}px)`; K.midShot(ctx, a.who, { x: 540, y: 1250, s: 0.95, mood: 'worried', t: a.t }); ctx.restore();
    const open = Math.sin(a.t * (3 + k * 3)) > 0.4 - k ? 0.15 : 1;
    eyes(ctx, K, 540, 600, 0.55, open * (1 - k * 0.7), a.t, 0.4);
    const v = ctx.createRadialGradient(540, 960, 200 + (1 - k) * 700, 540, 960, 1200); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${0.3 + k * 0.7})`); ctx.fillStyle = v; ctx.fillRect(0, 0, 1080, 1920);
  },
  // 6. At 48 hours, your brain steals microsleeps -> cerebro que se apaga a ratos (zzz) y se enciende; HOUR 48
  5: (ctx, a, K) => {
    K.drawPlace(ctx, 'oficina', 'dia', a.t);
    const off = Math.sin(a.t * 5) > 0.6;
    ctx.save(); ctx.translate(540, 1100); const s = 1.4 + Math.sin(a.t * 3) * 0.03; ctx.scale(s, s); ctx.globalAlpha = off ? 0.45 : 1; K.prop(ctx, 'cerebro', 0, 0, 1, a.t); ctx.restore();
    if (off) { ctx.fillStyle = 'rgba(10,10,30,0.35)'; ctx.fillRect(0, 0, 1080, 1920); zzz(ctx, K, 700, 900, a.t, 3, '#9bd1ff'); }
    counter(ctx, K, 'HOUR 48', 700, '#ffd166', K.ph(a.t, a.d, 0, 0.15));
    K.text(ctx, 'MICROSLEEP', 540, 1650, { size: 100, color: '#9bd1ff', k: K.ph(a.t, a.d, 0.3, 0.45) });
  },
  // 7. Seconds of blackout, eyes wide open -> ojos abiertos de par en par y la pantalla se va a negro a golpes
  6: (ctx, a, K) => {
    K.drawPlace(ctx, 'oficina', 'dia', a.t);
    eyes(ctx, K, 540, 1000, 1, 1, a.t, 0.8);
    const bl = (Math.sin(a.t * 2.2) > 0.55) || (a.t > a.d * 0.5 && a.t < a.d * 0.65);
    if (bl) { ctx.fillStyle = 'rgba(0,0,0,0.93)'; ctx.fillRect(0, 0, 1080, 1920); K.text(ctx, 'BLACKOUT', 540, 960, { size: 140, color: '#ff3b30' }); }
  },
  // 8. Friends Bruce and Joe kept shaking him awake -> dos amigos lo zarandean; reloj 3 AM
  7: (ctx, a, K) => {
    K.drawPlace(ctx, 'salon', 'noche', a.t);
    const me = K.personaWho(a.seed, {}), sh = Math.sin(a.t * 18) * 25;
    K.midShot(ctx, K.personaWho('sleep', { who: 'bruce' }), { x: 180, y: 1350, s: 0.6, mood: 'worried', t: a.t });
    K.midShot(ctx, K.personaWho('sleep', { who: 'joe' }), { x: 900, y: 1350, s: 0.6, mood: 'worried', t: a.t + 1 });
    ctx.save(); ctx.translate(sh, 0); K.midShot(ctx, me, { x: 540, y: 1250, s: 0.75, mood: 'sad', t: a.t }); ctx.restore();
    K.text(ctx, 'WAKE UP!', 540, 720, { size: 110, color: '#ffd166', k: K.ph(a.t, a.d, 0.2, 0.35), rot: -0.08 });
    clock(ctx, K, 880, 520, 90, a.t, 1); K.text(ctx, '3 AM', 880, 660, { size: 60, color: '#ffffff' });
  },
  // 9. By 72 hours, your memory slips -> los recuerdos (notas) se escapan volando de la cabeza; HOUR 72
  8: (ctx, a, K) => {
    K.drawPlace(ctx, 'salon', 'noche', a.t);
    K.midShot(ctx, a.who, { x: 540, y: 1300, s: 0.85, mood: 'worried', t: a.t });
    const words = ['NAME?', 'WHERE?', 'WHY?', 'KEYS', 'DAY?'];
    words.forEach((w, i) => { const q = (a.t * 0.5 + i / words.length) % 1; ctx.save(); ctx.globalAlpha = 1 - q; ctx.translate(540 + Math.cos(i * 1.3) * 380 * q, 1000 - q * 600); ctx.rotate(Math.sin(i) * 0.3);
      K.R(ctx, -110, -45, 220, 90, 10, '#fff7a8', 6); ctx.fillStyle = K.INK; ctx.font = '44px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(w, 0, 4); ctx.restore(); });
    counter(ctx, K, 'HOUR 72', 700, '#ffd166', K.ph(a.t, a.d, 0, 0.15));
  },
  // 10. Your heart races. The world looks wrong -> el corazón late a tope y la habitación se deforma y cambia de color
  9: (ctx, a, K) => {
    ctx.save(); ctx.translate(540, 960); ctx.rotate(Math.sin(a.t * 1.5) * 0.08); ctx.scale(1.1 + Math.sin(a.t * 2) * 0.05, 1.1 - Math.sin(a.t * 2) * 0.05); ctx.translate(-540, -960);
    K.drawPlace(ctx, 'salon', 'noche', a.t); ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'hue'; ctx.fillStyle = `hsl(${(a.t * 90) % 360},80%,50%)`; ctx.globalAlpha = 0.45; ctx.fillRect(0, 0, 1080, 1920); ctx.restore();
    const b = 1 + Math.max(0, Math.sin(a.t * 12)) * 0.25; ctx.save(); ctx.translate(540, 1100); ctx.scale(b, b); K.prop(ctx, 'corazon', 0, 0, 1.6, a.t); ctx.restore();
    K.text(ctx, 'THUMP', 540, 1650, { size: 120, color: '#ff3b30', k: Math.sin(a.t * 12) > 0.5 ? 1 : 0.8 });
  },
  // 11. Randy mistook a street sign for a person -> en la niebla, la señal se convierte en una persona y vuelve a ser señal
  10: (ctx, a, K) => {
    K.drawPlace(ctx, 'calle', 'noche', a.t); ctx.fillStyle = 'rgba(200,210,230,0.35)'; ctx.fillRect(0, 0, 1080, 1920);
    const m = (Math.sin(a.t * 2) + 1) / 2;
    ctx.save(); ctx.globalAlpha = 1 - m; K.prop(ctx, 'senal_trafico', 700, 1150, 1.4, a.t); ctx.restore();
    ctx.save(); ctx.globalAlpha = m; ctx.fillStyle = '#2a2d3a'; K.C(ctx, 700, 760, 90, '#2a2d3a', 0); K.R(ctx, 610, 860, 180, 500, 80, '#2a2d3a', 0); ctx.restore();
    K.midShot(ctx, a.who, { x: 260, y: 1400, s: 0.6, mood: 'shocked', t: a.t });
    K.text(ctx, 'HELLO?', 300, 900, { size: 90, color: '#ffffff', k: K.ph(a.t, a.d, 0.3, 0.45) });
  },
  // 12. Day four: he believed he was a pro football player -> con casco de fútbol americano imaginario, el público le aclama
  11: (ctx, a, K) => {
    ctx.fillStyle = '#2e8b57'; ctx.fillRect(0, 0, 1080, 1920); ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 8; for (let y = 300; y < 1920; y += 220) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1080, y); ctx.stroke(); }
    K.midShot(ctx, a.who, { x: 540, y: 1250, s: 0.9, mood: 'happy', t: a.t });
    ctx.save(); ctx.translate(540, 1250); ctx.scale(0.9, 0.9); ctx.beginPath(); ctx.arc(0, -40, 270, Math.PI * 1.05, Math.PI * 1.95); ctx.lineTo(260, 40); ctx.lineTo(-260, 40); ctx.closePath(); ctx.fillStyle = 'rgba(30,90,200,0.85)'; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = K.INK; ctx.stroke();
    ctx.strokeStyle = '#d0d0d0'; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(-150, 90); ctx.lineTo(150, 90); ctx.moveTo(-150, 150); ctx.lineTo(150, 150); ctx.stroke(); ctx.restore();
    K.text(ctx, 'DAY 4', 540, 700, { size: 120, color: '#ffd166', k: K.ph(a.t, a.d, 0, 0.15) });
    K.text(ctx, 'PRO PLAYER?!', 540, 1650, { size: 100, color: '#ffffff', k: K.ph(a.t, a.d, 0.35, 0.5), rot: -0.06 });
    K.sparkles(ctx, 540, 900, a.t, 8);
  },
  // 13. Researcher William Dement watched: lucid, barely -> el investigador apunta en su carpeta; LUCID... BARELY
  12: (ctx, a, K) => {
    K.drawPlace(ctx, 'oficina', 'noche', a.t);
    K.midShot(ctx, K.personaWho('sleep', { who: 'dement' }), { x: 540, y: 1250, s: 0.85, mood: 'worried', t: a.t, prop: 'papel' });
    K.R(ctx, 120, 620, 840, 160, 30, '#ffffff', 8); ctx.fillStyle = K.INK; ctx.font = '72px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const txt = 'LUCID... BARELY'; ctx.fillText(txt.slice(0, Math.floor(K.ph(a.t, a.d, 0.15, 0.7) * txt.length)), 540, 705);
  },
  // 14. Day eleven, he held a press conference -> micrófonos delante y flashes de cámaras
  13: (ctx, a, K) => {
    K.drawPlace(ctx, 'salon', 'dia', a.t);
    K.midShot(ctx, a.who, { x: 540, y: 1200, s: 0.85, mood: 'neutral', t: a.t });
    for (let i = 0; i < 4; i++) { const x = 300 + i * 160; K.L(ctx, [[x, 1920], [x + (540 - x) * 0.3, 1450]], '#3a3d44', 14); K.C(ctx, x + (540 - x) * 0.3, 1420, 46, '#22232b', 6); }
    for (let i = 0; i < 4; i++) { const on = Math.sin(a.t * 7 + i * 2.1) > 0.92; if (on) K.radial(ctx, 120 + i * 280, 500 + (i % 2) * 300, 220, '#ffffff', 0.95); }
    K.text(ctx, 'DAY 11', 540, 700, { size: 120, color: '#ffd166', k: K.ph(a.t, a.d, 0, 0.15) });
  },
  // 15. Then he slept fourteen hours, and woke up fine -> duerme, el reloj corre 14 h y se despierta estirándose
  14: (ctx, a, K) => {
    const day = K.ph(a.t, a.d, 0, 0.7);
    room(ctx, a, K, day < 0.5 ? 'noche' : 'dia');
    bed(ctx, K, 540, 1500, 1);
    const awake = a.t > a.d * 0.7;
    ctx.save(); ctx.translate(400, 1280); ctx.scale(0.55, 0.55); K.drawHead(ctx, 0, 0, a.who, { mood: awake ? 'happy' : 'neutral', t: a.t, closed: !awake }); ctx.restore();
    if (!awake) zzz(ctx, K, 520, 1150, a.t);
    clock(ctx, K, 800, 900, 120, a.t, awake ? 1 : 25);
    counter(ctx, K, `${Math.round(Math.min(1, day / 0.95) * 14)} HRS`, 700, '#9bd1ff', 1);
    if (awake) K.text(ctx, 'FINE!', 760, 1180, { size: 110, color: '#2ec27e', k: K.ph(a.t, a.d, 0.72, 0.85) });
  },
  // 16. Record books stopped tracking it. Too dangerous -> el libro de récords se cierra y cae el sello NO LONGER ACCEPTED
  15: (ctx, a, K) => {
    K.drawPlace(ctx, 'oficina', 'dia', a.t);
    const c = K.ease.inOut(K.ph(a.t, a.d, 0.35, 0.6));
    ctx.save(); ctx.translate(540, 1100);
    K.R(ctx, -380, -300, 760, 600, 20, '#f6efdc', 9); ctx.fillStyle = K.INK; ctx.font = '64px Anton'; ctx.textAlign = 'center'; ctx.fillText('WORLD RECORDS', 0, -200);
    ctx.font = '40px Poppins'; ctx.fillText('Longest awake: 264 hours', 0, -90); ctx.fillText('Randy Gardner · 1964', 0, -30);
    // la tapa se cierra: la portada roja tapa la página desde el lomo
    if (c > 0.02) { K.R(ctx, -380, -300, 760 * c, 600, 20, '#b23a3a', 9); if (c > 0.85) { ctx.fillStyle = '#ffd166'; ctx.font = '90px Anton'; ctx.textAlign = 'center'; ctx.fillText('WORLD', 0, -40); ctx.fillText('RECORDS', 0, 70); } }
    ctx.restore();
    const st = K.ph(a.t, a.d, 0.7, 0.8); if (st > 0) { ctx.save(); ctx.translate(540, 1500); ctx.rotate(-0.12); ctx.scale(1.6 - 0.6 * st, 1.6 - 0.6 * st); ctx.lineWidth = 12; ctx.strokeStyle = '#ff3b30'; ctx.strokeRect(-400, -80, 800, 160); ctx.fillStyle = '#ff3b30'; ctx.font = '80px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('TOO DANGEROUS', 0, 6); ctx.restore(); }
  },
  // 17. Decades later, Randy battled severe insomnia -> los años pasan 1964 → 2017; ya mayor, despierto en la cama
  16: (ctx, a, K) => {
    room(ctx, a, K, 'noche');
    const y = Math.round(1964 + K.ease.inOut(K.ph(a.t, a.d, 0, 0.6)) * 53);
    bed(ctx, K, 540, 1500, 1);
    const old = { ...a.who, hairColor: '#dcdcdc' };
    ctx.save(); ctx.translate(400, 1280); ctx.scale(0.55, 0.55); K.drawHead(ctx, 0, 0, old, { mood: 'worried', t: a.t }); ctx.restore();
    counter(ctx, K, String(y), 700, '#ffd166', 1);
    clock(ctx, K, 800, 900, 110, a.t, 0.5);
  },
  // 18. The boy who refused to sleep... couldn't -> habitación a oscuras, luna en la ventana; los ojos abiertos en la oscuridad
  17: (ctx, a, K) => {
    room(ctx, a, K, 'noche'); ctx.fillStyle = 'rgba(5,8,25,0.7)'; ctx.fillRect(0, 0, 1080, 1920);
    K.radial(ctx, 820, 500, 220, '#fff7d0', 0.5); K.C(ctx, 820, 500, 90, '#fff7d0', 6);
    const k = K.ph(a.t, a.d, 0.2, 0.6);
    eyes(ctx, K, 540, 1150, 0.5 + k * 0.3, 1, a.t, 0.6);
  },
};
