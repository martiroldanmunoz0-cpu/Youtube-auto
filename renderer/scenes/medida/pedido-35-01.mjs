// pedido-35-01 — "A Spoonful of Neutron Star" — estilo PAPEL (un plano por frase)
import { W, H, lerp, ease, back, ph, clamp, REPARTO, personaje, capa, SUELO, laboratorio, mesaLab, cuchara, rotulo,
  exterior, grua, espacio, estrellaN, sol, ciudad, corteTierra, signo, impacto, rr, volumen, texto, hash, paso, silla, salpica, cae, vaso } from '../../lib/papel.mjs';
const { DRA, TOM } = REPARTO;
const U = (a) => clamp(a.t / a.d);
function hueco(ctx, t, x, k) { if (k <= 0) return; ctx.fillStyle = '#1b120d'; ctx.beginPath(); ctx.ellipse(x, SUELO + 40, 110 * k, 32 * k, 0, 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(40,30,28,0.85)'; ctx.lineWidth = 5; ctx.stroke(); ctx.fillStyle = '#9fe6ff'; ctx.globalAlpha = 0.35 + 0.2 * Math.sin(t * 9); ctx.beginPath(); ctx.ellipse(x, SUELO + 46, 70 * k, 16 * k, 0, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
function balanza(ctx, t, x, y, ang, izq, der, sc = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); rr(ctx, -20, 0, 40, 300, 8); volumen(ctx, '#8a6a4a', -20, 0, 40, 300, 4); rr(ctx, -120, 290, 240, 30, 8); volumen(ctx, '#6a4f36', -120, 290, 240, 30, 4);
  ctx.rotate(ang); rr(ctx, -380, -14, 760, 28, 10); volumen(ctx, '#b08a52', -380, -14, 760, 28, 4);
  for (const [k, fn] of [[-1, izq], [1, der]]) { ctx.save(); ctx.translate(k * 360, 0); ctx.rotate(-ang); ctx.strokeStyle = '#4a3a2a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-90, 160); ctx.moveTo(0, 0); ctx.lineTo(90, 160); ctx.stroke(); ctx.beginPath(); ctx.ellipse(0, 165, 120, 24, 0, 0, 7); volumen(ctx, '#c9a066', -120, 141, 240, 48, 4); fn(ctx); ctx.restore(); }
  ctx.restore();
}
function gente(ctx, t, n) { const cols = ['#e2683c', '#3f6fb5', '#4f9a6b', '#c94f4f', '#7a4fa0', '#e0a640']; for (let i = 0; i < n; i++) { const x = -90 + (i % 6) * 36, y = 150 - Math.floor(i / 6) * 40; ctx.beginPath(); ctx.arc(x, y - 34, 14, 0, 7); ctx.fillStyle = ['#f2c9a5', '#b9825a', '#8a5a3a'][i % 3]; ctx.fill(); rr(ctx, x - 14, y - 22, 28, 30, 8); ctx.fillStyle = cols[i % 6]; ctx.fill(); } }

const alcanzaD = (t, dobla) => [lerp(140, 230, ease(ph(t, 0, 0.4))), lerp(-150, -110, ease(ph(t, 0, 0.4))) + dobla * 0.6];
const linterna = (on) => (c) => { if (on) { c.save(); c.beginPath(); c.moveTo(10, -20); c.lineTo(520, 200); c.lineTo(400, 360); c.closePath(); const g = c.createLinearGradient(0, 0, 450, 250); g.addColorStop(0, 'rgba(255,240,160,0.7)'); g.addColorStop(1, 'rgba(255,240,160,0)'); c.fillStyle = g; c.fill(); c.restore(); } c.rotate(0.6); rr(c, -14, -50, 28, 80, 8); c.fillStyle = '#d9483b'; c.fill(); c.strokeStyle = '#231a24'; c.lineWidth = 4; c.stroke(); rr(c, -20, -66, 40, 22, 6); c.fillStyle = '#ccc'; c.fill(); c.stroke(); };

export default {
  // 0 — Esta cuchara pesa más que todos los humanos juntos
  0: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1, 1.08, u), fx: 560, fy: 1300, t };
    laboratorio(ctx, t, cam);
    capa(ctx, cam, 1, () => {
      mesaLab(ctx, 540, 1250, 520);
      silla(ctx, 850, SUELO + 40, 0.95, '#3f6b5c'); const bebe = t < 0.9 ? Math.sin(Math.PI * ph(t, 0.1, 0.9)) : 0;
      personaje(ctx, t, TOM, 850, SUELO + 40, 0.95, { sentado: 1, mood: t > 1 ? 'sorpresa' : 'neutral', cierra: bebe > 0.5, mira: [-0.8, -0.2], manoI: [-90, -150], manoD: [lerp(130, 50, bebe), lerp(-200, -320, bebe)], sostieneD: (c) => vaso(c, 0, 20, 0.8, 0.6, '#8a5a3a', -bebe * 1.1) });
      const w = paso(t, 0, 1.0, -120, 290); const sub = ease(ph(t, 0.9, 1.4));
      const p = personaje(ctx, t, DRA, w.x, SUELO + 60, 1.05, { anda: w.anda, lado: 1, mood: 'feliz', habla: t > 1.0, mira: [0.6, -0.4], manoI: [-120, -110], manoD: [lerp(130, 150, sub), lerp(-180, -330, sub)] });
      cuchara(ctx, t, p.manoD[0] + 10, p.manoD[1] - 40, 0.42, 0.25);
    });
    rotulo(ctx, 0.1, t, 'THIS SPOON', 540, 270, 150); rotulo(ctx, 0.7, t, 'OUTWEIGHS', 540, 430, 110, '#ffd93d'); rotulo(ctx, 1.1, t, 'EVERY HUMAN', 540, 560, 120, '#8fe3ff'); },

  // 1 — Mil millones de toneladas (balanza: cuchara contra toda la humanidad)
  1: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: 1.04, fx: 540, fy: 1200, t };
    laboratorio(ctx, t, cam);
    capa(ctx, cam, 1, () => { const ang = lerp(0, -0.26, back(ph(t, 0.3, 1.1)));
      balanza(ctx, t, 560, 1060, ang, (c) => { cuchara(c, t, 0, 100, 0.32, 0); }, (c) => gente(c, t, 24), 0.62);
      const emp = Math.sin(t * 18) * 6 * ph(t, 0.8, 1.0); personaje(ctx, t, TOM, 900 + emp, SUELO + 40, 0.8, { mood: t > 0.8 ? 'esfuerzo' : 'sorpresa', mira: [-1, -0.6], incl: t > 0.8 ? -0.2 : 0, piernas: t > 0.8 ? [-0.3, 0.6] : [0, 0], manoI: t > 0.8 ? [-170, -420] : [-60, -330], manoD: t > 0.8 ? [-110, -440] : [60, -330] });
      personaje(ctx, t, DRA, 250, SUELO + 60, 0.85, { mood: 'feliz', habla: true, mira: [1, -0.5], manoI: [-110, -120], manoD: [160, -260] });
    });
    rotulo(ctx, 0.2, t, '1 BILLION', 540, 290, 170, '#8fe3ff'); rotulo(ctx, 0.6, t, 'TONS', 540, 470, 170, '#ffd93d'); },

  // 2 — Agarras el mango y la mesa cruje
  2: (ctx, a) => { const t = a.t, u = U(a); const dobla = ease(ph(t, 0.4, 1.2)) * 110;
    const cam = { z: 1.12, fx: 600, fy: 1300, t, temblor: t > 0.4 && t < 1.4 ? 5 : 0 };
    laboratorio(ctx, t, cam);
    capa(ctx, cam, 1, () => { mesaLab(ctx, 600, 1250, 560, dobla);
      const susto = t > 0.7;
      personaje(ctx, t, TOM, 880, SUELO + 40, 0.95, { mood: susto ? 'miedo' : 'neutral', mira: [-1, 0.6], manoI: susto ? [-60, -380] : [-90, -150], manoD: susto ? [60, -380] : [110, -110] });
      cuchara(ctx, t, 600, 1225 + dobla, 0.42, Math.PI / 2 - 0.15);
      personaje(ctx, t, DRA, 330, SUELO + 60, 1.05, { mood: susto ? 'sorpresa' : 'neutral', mira: [1, 0.8], manoI: [-120, -110], manoD: alcanzaD(t, dobla) });
      { const vx = 760 + ease(ph(t, 0.6, 0.9)) * 120; const vy = t < 0.9 ? 1250 + ease(ph(t, 0.5, 0.9)) * 50 : cae(t, 0.9, 1300, SUELO + 40, 0.35); vaso(ctx, vx, vy, 0.8, t < 1.25 ? 0.6 : 0, '#8a5a3a', t < 0.9 ? 0.3 : 1.5); salpica(ctx, 900, SUELO + 30, ph(t, 1.25, 1.8), '#8a5a3a'); }
      if (t > 0.5) rotulo(ctx, 0.5, t, 'CREEEAK!', 720, 980, 96, '#ffb347');
    });
    rotulo(ctx, 0.1, t, 'THE TABLE', 540, 290, 140); rotulo(ctx, 0.5, t, 'GROANS', 540, 450, 150, '#ffb347'); },

  // 3 — El brazo no se mueve
  3: (ctx, a) => { const t = a.t, u = U(a); const tira = Math.sin(t * 22) * 5;
    const cam = { z: lerp(1.18, 1.28, u), fx: 600, fy: 1300, t, temblor: 2 };
    laboratorio(ctx, t, cam);
    capa(ctx, cam, 1, () => { mesaLab(ctx, 640, 1250, 560, 110); cuchara(ctx, t, 640, 1335, 0.42, Math.PI / 2 - 0.15);
      const ayuda = ease(ph(t, 0.5, 1.0)); const w = paso(t, 0.1, 0.6, 980, 880);
      personaje(ctx, t, TOM, w.x + (ayuda >= 1 ? -tira : 0), SUELO + 40, 0.95, { anda: w.anda, lado: -1, mood: ayuda > 0.5 ? 'esfuerzo' : 'sorpresa', mira: [-1, 0.5], incl: 0.12 * ayuda, piernas: ayuda >= 1 ? [-0.3, 0.5] : [0, 0], manoI: [lerp(-140, -160, ayuda), lerp(-200, -230, ayuda)], manoD: [lerp(120, -110, ayuda), lerp(-200, -240, ayuda)] });
      personaje(ctx, t, DRA, 330 + tira, SUELO + 60, 1.05, { mood: 'esfuerzo', mira: [1, 0.5], incl: -0.16, cabeza: -0.08, piernas: [-0.5, 0.3], manoI: [170, -120], manoD: [200, -140] });
      for (let i = 0; i < 3; i++) { const k = (t * 1.5 + i / 3) % 1; ctx.globalAlpha = 1 - k; ctx.fillStyle = '#8fe3ff'; ctx.beginPath(); ctx.arc(300 + i * 40 - k * 40, 900 + k * 120, 10, 0, 7); ctx.fill(); } ctx.globalAlpha = 1;
    });
    rotulo(ctx, 0.1, t, 'NOT ONE', 540, 280, 150); rotulo(ctx, 0.45, t, 'INCH', 540, 450, 190, '#ff6b3d'); },

  // 4 — Ninguna grúa podría levantarla
  4: (ctx, a) => { const t = a.t, u = U(a); const dobla = ease(ph(t, 0.4, 1.6)); const cam = { z: 1.02, fx: 540, fy: 1250, t, temblor: dobla > 0 && dobla < 1 ? 3 : 0 };
    exterior(ctx, t, cam, { cielo: 'dia', suelo: 'cemento' });
    capa(ctx, cam, 1, () => { const [gx, gy] = grua(ctx, t, 220, SUELO + 20, 0.75, dobla, 380);
      ctx.strokeStyle = '#333'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx, SUELO - 10); ctx.stroke();
      cuchara(ctx, t, gx, SUELO - 20, 0.42, Math.PI / 2);
      const pal = ease(ph(t, 0.15, 0.5)); rr(ctx, 700, SUELO - 120, 110, 160, 10); volumen(ctx, '#e0a640', 700, SUELO - 120, 110, 160, 4); ctx.save(); ctx.translate(755, SUELO - 120); ctx.rotate(lerp(-0.6, 0.6, pal)); rr(ctx, -8, -150, 16, 150, 6); ctx.fillStyle = '#555'; ctx.fill(); ctx.beginPath(); ctx.arc(0, -150, 20, 0, 7); ctx.fillStyle = '#d9483b'; ctx.fill(); ctx.restore();
      const lx = 755 + Math.sin(lerp(-0.6, 0.6, pal)) * 150 - 900, ly = SUELO - 120 - Math.cos(lerp(-0.6, 0.6, pal)) * 150 - (SUELO + 40);
      personaje(ctx, t, TOM, 900, SUELO + 40, 0.8, { mood: dobla > 0.5 ? 'miedo' : 'esfuerzo', mira: [-1, -0.3], incl: -0.08, manoI: dobla > 0.6 ? [-60, -330] : [lx / 0.8, ly / 0.8], manoD: dobla > 0.6 ? [80, -330] : [lx / 0.8 + 30, ly / 0.8 + 10] });
      if (dobla > 0.3) impacto(ctx, t, 560, 760, (t * 1.5) % 1, 80, '#ff6b3d');
    });
    rotulo(ctx, 0.1, t, 'NO CRANE', 540, 290, 160); rotulo(ctx, 0.5, t, 'CAN LIFT IT', 540, 460, 120, '#ffd93d'); },

  // 5 — La sueltas... y no llega a tocar el suelo
  5: (ctx, a) => { const t = a.t, u = U(a); const cae = ease(ph(t, 0.3, 1.3)); const cam = { z: lerp(1.05, 1.15, u), fx: 600, fy: 1350, t };
    laboratorio(ctx, t, cam);
    capa(ctx, cam, 1, () => { hueco(ctx, t, 620, ease(ph(t, 1.1, 1.3)));
      if (cae < 1) { ctx.save(); ctx.beginPath(); ctx.rect(-400, -400, W + 800, SUELO + 440); ctx.clip(); cuchara(ctx, t, 620, lerp(1000, SUELO + 240, cae), 0.42, Math.PI); ctx.restore(); }
      const mira = t > 1.1;
      personaje(ctx, t, DRA, 330, SUELO + 60, 1.05, { mood: mira ? 'sorpresa' : 'neutral', mira: [1, mira ? 1 : -0.2], manoI: [-120, -110], manoD: t < 0.3 ? [260, -440] : [200, -360] });
      const oye = t > 0.25 && t < 1.2; personaje(ctx, t, TOM, 880, SUELO + 40, 0.95, { mood: mira ? 'miedo' : 'esfuerzo', cierra: oye, mira: [-1, 1], incl: mira ? -0.12 : 0, manoI: oye ? [-90, -360] : [-120, -300], manoD: oye ? [90, -360] : [110, -300] });
    });
    rotulo(ctx, 0.2, t, 'LET GO...', 540, 290, 150); rotulo(ctx, 0.9, t, 'NO THUD', 540, 460, 150, '#8fe3ff'); },

  // 6 — Lo atraviesa (primer plano del agujero, se asoman)
  6: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.3, 1.45, u), fx: 600, fy: 1420, t };
    laboratorio(ctx, t, cam);
    capa(ctx, cam, 1, () => { hueco(ctx, t, 600, 1.1);
      for (let i = 0; i < 10; i++) { const k = ((t * 0.8 + hash(i)) % 1); ctx.globalAlpha = 1 - k; ctx.fillStyle = '#b9a58a'; ctx.fillRect(560 + hash(i + 3) * 80, SUELO + 40 + k * 60, 14, 10); } ctx.globalAlpha = 1;
      personaje(ctx, t, DRA, 400, SUELO + 60, 1, { mood: 'sorpresa', mira: [1, 1], incl: 0.22, cabeza: 0.15, manoI: [-60, -200], manoD: [120, -150] });
      personaje(ctx, t, TOM, 800, SUELO + 40, 0.95, { mood: 'miedo', mira: [-1, 1], incl: -0.22, cabeza: -0.15, manoI: [-130, -200], manoD: [-60, -220 + Math.sin(t * 3) * 15], sostieneD: (c) => { c.scale(-1, 1); linterna(true)(c); } });
    });
    rotulo(ctx, 0.1, t, 'IT GOES', 540, 290, 150); rotulo(ctx, 0.4, t, 'THROUGH', 540, 460, 170, '#ff6b3d'); },

  // 7 — Atraviesa las baldosas y la roca (corte del subsuelo bajando)
  7: (ctx, a) => { const t = a.t, u = U(a); const off = u * 1400;
    ctx.fillStyle = '#b9a58a'; ctx.fillRect(0, 0, W, H);
    const capas = [['#b9a58a', 'TILES'], ['#6b4a34', 'DIRT'], ['#8a7a6a', 'CLAY'], ['#5a5a66', 'BEDROCK'], ['#4a4050', 'DEEPER'], ['#7a3a2a', 'MANTLE']];
    capas.forEach(([c, n], i) => { const y = i * 520 - off + 200; ctx.fillStyle = c; ctx.fillRect(0, y, W, 520); for (let j = 0; j < 30; j++) { ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.beginPath(); ctx.ellipse(hash(i * 40 + j) * W, y + hash(i * 40 + j + 7) * 520, 20 + hash(j) * 40, 10 + hash(j + 1) * 16, 0, 0, 7); ctx.fill(); } texto(ctx, n, 160, y + 80, 60, 'rgba(255,255,255,0.85)', 'left'); });
    ctx.fillStyle = 'rgba(150,230,255,0.35)'; ctx.fillRect(520, 0, 40, 1100);
    cuchara(ctx, t, 540, 1150 + Math.sin(t * 8) * 6, 0.62, Math.PI);
    for (let i = 0; i < 12; i++) { const k = (t * 2 + hash(i)) % 1; ctx.fillStyle = '#d9c9b0'; ctx.fillRect(480 + hash(i + 2) * 120, 1250 - k * 500, 14, 10); }
    rotulo(ctx, 0.1, t, 'THROUGH', 540, 280, 140); rotulo(ctx, 0.4, t, 'SOLID ROCK', 540, 440, 140, '#ffd93d'); },

  // 8 — Hacia el centro de la Tierra
  8: (ctx, a) => { const t = a.t, u = U(a); espacio(ctx, t, { z: 1, fx: 540, fy: 960, t });
    corteTierra(ctx, t, 540, 1180, 440, ease(u), (x, y) => cuchara(ctx, t, x, y, 0.28, Math.PI));
    texto(ctx, 'CORE', 540, 1270, 52, '#fff7c0');
    rotulo(ctx, 0.1, t, "TO EARTH'S", 540, 290, 140); rotulo(ctx, 0.4, t, 'CORE', 540, 460, 190, '#ff6b3d'); },

  // 9 — La estrella mide 20 km de ancho
  9: (ctx, a) => { const t = a.t, u = U(a); espacio(ctx, t, { z: lerp(1, 1.06, u), fx: 540, fy: 1100, t });
    const r = 230 * back(ph(t, 0, 0.6)); estrellaN(ctx, t, 540, 1150, r);
    const k = ease(ph(t, 0.6, 1.2)); ctx.strokeStyle = '#ffd93d'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(540 - 230 * k, 1450); ctx.lineTo(540 + 230 * k, 1450); ctx.moveTo(540 - 230 * k, 1420); ctx.lineTo(540 - 230 * k, 1480); ctx.moveTo(540 + 230 * k, 1420); ctx.lineTo(540 + 230 * k, 1480); ctx.stroke();
    if (k > 0.5) texto(ctx, '12 MILES', 540, 1540, 80, '#ffd93d');
    rotulo(ctx, 0.1, t, 'THE STAR IS', 540, 290, 130); rotulo(ctx, 0.5, t, 'TINY', 540, 460, 190, '#8fe3ff'); },

  // 10 — Más pequeña que una ciudad, más pesada que el Sol
  10: (ctx, a) => { const t = a.t, u = U(a); espacio(ctx, t, { z: 1, fx: 540, fy: 960, t });
    if (u < 0.5) { ciudad(ctx, t, 540, 1500, 900, 1.1); estrellaN(ctx, t, 540, 1080, 150 * back(ph(t, 0.1, 0.5))); rotulo(ctx, 0.1, t, 'SMALLER THAN', 540, 290, 130); rotulo(ctx, 0.3, t, 'A CITY', 540, 460, 170, '#8fe3ff'); }
    else { const t2 = t - a.d * 0.5; const ang = lerp(0, -0.25, back(ph(t2, 0.1, 0.8)));
      balanza(ctx, t, 540, 1000, ang, (c) => estrellaN(c, t, 0, 110, 40), (c) => sol(c, t, 0, 30, 140));
      rotulo(ctx, 0, t2, 'HEAVIER THAN', 540, 290, 130); rotulo(ctx, 0.2, t2, 'THE SUN', 540, 460, 170, '#ffc93d'); } },

  // 11 — Y por eso mismo… (vuelve al laboratorio: bucle)
  11: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.1, 1.0, u), fx: 560, fy: 1300, t };
    laboratorio(ctx, t, cam);
    capa(ctx, cam, 1, () => { mesaLab(ctx, 540, 1250, 520); cuchara(ctx, t, 540, 1225, 0.42, Math.PI / 2 - 0.15);
      const w = paso(t, 0.1, 0.9, 120, 300);
      personaje(ctx, t, DRA, w.x, SUELO + 60, 1.05, { anda: w.anda, lado: 1, habla: t > 0.9, mira: [0.8, 0.2], manoI: [-120, -110], manoD: t > 0.9 ? [170, -280] : [130, -150] });
      silla(ctx, 850, SUELO + 40, 0.95, '#3f6b5c');
      personaje(ctx, t, TOM, 850, SUELO + 40, 0.95, { sentado: 1, mood: 'sorpresa', mira: [-0.8, 0.4], manoI: [-150, -200], manoD: [130, -200], sostieneD: (c) => vaso(c, 0, 20, 0.8, 0.6, '#8a5a3a', 0) });
      signo(ctx, t, 0.3, 830, 760, '?', '#ffd93d');
    });
    rotulo(ctx, 0.1, t, "AND THAT'S", 540, 290, 140); rotulo(ctx, 0.4, t, 'EXACTLY WHY...', 540, 450, 110, '#ffd93d'); },
};
