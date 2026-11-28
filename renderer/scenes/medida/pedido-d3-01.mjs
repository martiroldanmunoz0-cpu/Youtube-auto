// pedido-d3-01 — "He Sold the Eiffel Tower. Twice." (Victor Lustig, París 1925) — estilo PAPEL con diálogo
import { lerp, ease, back, ph, clamp, REPARTO, personaje, capa, SUELO, rotulo, texto, rr, volumen, hash, paso, silla, puerta, pared, suelo } from '../../lib/papel.mjs';
import { salonHotel, mesita, fajo, maletin, calleParis, tren, torreEiffel } from '../../lib/papel2.mjs';
const { POLI } = REPARTO;
const U = (a) => clamp(a.t / a.d);
const habla = (a, id) => a.speaker === id && a.t < (a.voice_dur || a.d) - 0.05;
export const CON = { skin: '#f0c4a0', hair: 'corto', hairCol: '#2a1d16', ropa: '#34344a', traje: true, camisa: '#f4efe2', corbata: '#7a2e8a', pants: '#34344a', shoes: '#1a1a1a', sombrero: 'bombin', bigote: true, bigoteCol: '#2a1d16' };
export const BUYER = { skin: '#e8b48c', hair: 'corto', hairCol: '#8a5a32', ropa: '#6b5a4a', traje: true, camisa: '#e8e0c8', corbata: '#3a5a3a', pants: '#5a4a3a', shoes: '#2a1a10', ancho: 1.3, gafas: true };
const F = SUELO + 40;
const cartel = (txt, col = '#c0392b') => (c) => { c.save(); c.translate(0, -120); c.strokeStyle = '#5a3a22'; c.lineWidth = 10; c.beginPath(); c.moveTo(0, 120); c.lineTo(0, 0); c.stroke(); rr(c, -150, -110, 300, 120, 10); volumen(c, '#f4efe2', -150, -110, 300, 120, 4); texto(c, txt, 0, -50, 54, col); c.restore(); };
const maleta = (c) => maletin(c, 0, 90, 0.45, 0, false);
function hotel(ctx, t, a, cam, poseC = {}, poseB = {}, extra) {
  salonHotel(ctx, t, cam);
  capa(ctx, cam, 1, () => { mesita(ctx, 540, 1250, 260); if (extra) extra();
    personaje(ctx, t, CON, 290, F + 20, 1.0, { mood: 'feliz', habla: habla(a, 'con'), mira: [0.7, 0], manoI: [-110, -120], manoD: [120, -130], ...poseC });
    silla(ctx, 800, F + 40, 0.95, '#8a2030');
    personaje(ctx, t, BUYER, 800, F + 40, 0.95, { sentado: 1, mood: 'neutral', habla: habla(a, 'buyer'), mira: [-0.7, 0], manoI: [-90, -150], manoD: [90, -150], ...poseB }); });
}

export default {
  // 0 — CON: "I'm selling the Eiffel Tower. Interested?"
  0: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.05, 1.1, u), fx: 540, fy: 1100, t };
    const k = ease(ph(t, 0.1, 0.5));
    hotel(ctx, t, a, cam, { manoD: [lerp(120, 260, k), lerp(-130, -380, k)], mira: [0.5, -0.4] }, { mood: t > 1.3 ? 'sorpresa' : 'neutral', mira: [-0.4, -0.6] });
    rotulo(ctx, 0.9, t, 'FOR SALE', 540, 300, 150, '#ffd93d'); },
  // 1 — BUYER: "That's not yours to sell."
  1: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.55, 1.62, u), fx: 790, fy: 1020, t };
    hotel(ctx, t, a, cam, {}, { mood: 'enfado', manoI: [-140, -290], manoD: [90, -150], cabeza: Math.sin(t * 4) * 0.04 }); },
  // 2 — CON: "The city can't afford to fix it. It's going for scrap. Seven thousand tons of iron."
  2: (ctx, a) => { const t = a.t, u = U(a), d = a.d; const cam = { z: lerp(1.0, 1.06, u), fx: 540, fy: 1100, t };
    calleParis(ctx, t, cam, { torreX: 640, torreS: 1.0 });
    capa(ctx, cam, 1, () => { const w = paso(t, 0, 1.2, 200, 330);
      personaje(ctx, t, CON, w.x, F + 30, 1.0, { anda: w.anda, lado: 1, mood: 'feliz', habla: habla(a, 'con'), mira: [0.6, -0.5], manoI: [-110, -120], manoD: [230, -360 + Math.sin(t * 3) * 20] });
      personaje(ctx, t, BUYER, 820, F + 30, 0.95, { mood: 'sorpresa', mira: [-0.4, -0.7], manoI: [-100, -130], manoD: [100, -130] }); });
    rotulo(ctx, d * 0.35, t, 'SCRAP', 540, 270, 150, '#ff6b4a'); rotulo(ctx, d * 0.65, t, '7,000 TONS', 540, 430, 120, '#ffd93d'); },
  // 3 — NARR: "Paris, 1925. A con man named Victor Lustig was posing as a government official."
  3: (ctx, a) => { const t = a.t, u = U(a), d = a.d; const cam = { z: lerp(1.1, 1.2, u), fx: 400, fy: 1100, t };
    salonHotel(ctx, t, cam);
    capa(ctx, cam, 1, () => { const k = back(ph(t, d * 0.45, d * 0.6));
      personaje(ctx, t, CON, 400, F + 20, 1.05, { mood: 'feliz', mira: [0, 0], manoI: [-110, -120], manoD: [lerp(110, 150, k), lerp(-130, -300, k)], sostieneD: k > 0 ? (c) => { c.save(); c.scale(k, k); rr(c, -70, -50, 140, 100, 8); volumen(c, '#2a3a6a', -70, -50, 140, 100, 3); c.beginPath(); c.arc(0, -4, 26, 0, 7); c.fillStyle = '#e8c04a'; c.fill(); texto(c, 'RF', 0, -2, 22, '#2a3a6a'); c.restore(); } : null }); });
    rotulo(ctx, 0.1, t, 'PARIS', 540, 270, 140); rotulo(ctx, 0.35, t, '1925', 540, 410, 110, '#ffd93d'); rotulo(ctx, d * 0.6, t, 'FAKE OFFICIAL', 540, 540, 90, '#ff6b4a'); },
  // 4 — CON: "This is top secret. Not a word to anyone."
  4: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.6, 1.7, u), fx: 330, fy: 1000, t };
    hotel(ctx, t, a, cam, { mood: 'neutral', mira: [0.6, 0], incl: 0.08, manoD: [60, -360], manoI: [-110, -120] });
    ctx.save(); const g = ctx.createRadialGradient(400, 900, 200, 400, 900, 900); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(10,5,20,0.65)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920); ctx.restore();
    rotulo(ctx, 0.2, t, 'TOP SECRET', 540, 300, 140, '#ff6b4a'); },
  // 5 — NARR: "One scrap dealer believed him. He paid for the tower… plus a bribe on top."
  5: (ctx, a) => { const t = a.t, u = U(a), d = a.d; const cam = { z: lerp(1.15, 1.2, u), fx: 540, fy: 1150, t };
    const ab = ease(ph(t, 0.3, 0.8)), sb = ease(ph(t, d * 0.6, d * 0.8));
    hotel(ctx, t, a, cam, { mood: 'feliz', mira: [0.5, 0.4] }, { mood: 'feliz', manoD: [lerp(90, -140, sb), lerp(-150, -260, sb)], sostieneD: sb > 0 ? (c) => fajo(c, 0, 0, 0.9) : null, mira: [-0.6, 0.2] },
      () => { maletin(ctx, 540, 1250, 0.7, ab); });
    rotulo(ctx, 0.5, t, 'PAID', 540, 280, 150, '#9fe07a'); rotulo(ctx, d * 0.7, t, '+ A BRIBE', 540, 430, 120, '#ffd93d'); },
  // 6 — BUYER: "So when do I get my tower?"
  6: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.15, 1.25, u), fx: 600, fy: 1100, t };
    salonHotel(ctx, t, cam);
    capa(ctx, cam, 1, () => { mesita(ctx, 540, 1250, 260);
      personaje(ctx, t, BUYER, 760, F + 40, 0.98, { mood: t > 1.2 ? 'triste' : 'feliz', habla: habla(a, 'buyer'), mira: [-0.8, Math.sin(t * 2) * 0.2], manoI: [-140, -300], manoD: [100, -150] }); }); },
  // 7 — NARR: "Never. Lustig grabbed the cash and fled to Austria."
  7: (ctx, a) => { const t = a.t, u = U(a), d = a.d; const cam = { z: 1.0, fx: 540, fy: 1200, t };
    calleParis(ctx, t, cam, { noche: true, torreX: 240, torreS: 0.7 });
    capa(ctx, cam, 1, () => { const k = ph(t, d * 0.35, d); tren(ctx, t, lerp(500, 1600, k * k), F - 10, 0.7, 1);
      const w = paso(t, 0, d * 0.5, 150, 560, 16); if (k < 0.05) personaje(ctx, t, CON, w.x, F + 30, 0.95, { anda: w.anda, lado: 1, mood: 'feliz', mira: [0.8, 0], manoD: [120, -120], sostieneD: maleta, manoI: [-100, -150], sombrero: 'bombin' }); });
    rotulo(ctx, 0.0, t, 'NEVER.', 540, 290, 170, '#ff6b4a'); rotulo(ctx, d * 0.5, t, '→ AUSTRIA', 540, 450, 110, '#ffd93d'); },
  // 8 — NARR: "And the dealer was too embarrassed to go to the police."
  8: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.05, 1.12, u), fx: 540, fy: 1150, t };
    calleParis(ctx, t, cam, { torreX: 900, torreS: 0.6, farolas: [140] });
    capa(ctx, cam, 1, () => { rr(ctx, 380, 760, 560, 720, 6); volumen(ctx, '#d9d2c4', 380, 760, 560, 720, 4); rr(ctx, 420, 780, 480, 90, 6); volumen(ctx, '#2a3a6a', 420, 780, 480, 90, 3); texto(ctx, 'POLICE', 660, 826, 64, '#fff'); puerta(ctx, 560, F + 30, 200, 460, 0, '#2a3a6a');
      const w = paso(t, 0, 0.8, 300, 560); const vuelve = ph(t, 1.2, 2.2); const x = vuelve > 0 ? paso(t, 1.2, 2.4, 560, 200) : w;
      personaje(ctx, t, BUYER, x.x, F + 40, 0.98, { anda: x.anda, lado: x.lado, mood: vuelve > 0 ? 'triste' : 'neutral', mira: [vuelve > 0 ? -0.8 : 0.8, 0.3], manoI: [-60, -330], manoD: [60, -330] });
      if (vuelve > 0) { ctx.save(); ctx.globalAlpha = 0.45; ctx.fillStyle = '#ff6b8a'; ctx.beginPath(); ctx.ellipse(x.x - 40, F - 340, 22, 12, 0, 0, 7); ctx.ellipse(x.x + 40, F - 340, 22, 12, 0, 0, 7); ctx.fill(); ctx.restore(); } });
    rotulo(ctx, 1.3, t, 'TOO EMBARRASSED', 540, 300, 100, '#ffd93d'); },
  // 9 — NARR: "So Lustig came back… and tried to sell it again. This time the buyer called the cops. He still got away."
  9: (ctx, a) => { const t = a.t, u = U(a), d = a.d; const cam = { z: 1.0, fx: 540, fy: 1200, t };
    calleParis(ctx, t, cam, { torreX: 540, torreS: 0.9 });
    capa(ctx, cam, 1, () => { const huye = ph(t, d * 0.55, d * 0.85);
      const c = huye > 0 ? paso(t, d * 0.55, d * 0.85, 520, 1300, 18) : paso(t, 0, d * 0.25, 1250, 520);
      personaje(ctx, t, CON, c.x, F + 30, 0.95, { anda: c.anda, lado: c.lado, mood: huye > 0 ? 'miedo' : 'feliz', mira: [huye > 0 ? 0.8 : -0.6, 0], manoD: [huye > 0 ? 120 : -240, huye > 0 ? -130 : -260], sostieneD: huye > 0 ? null : cartel('FOR SALE'), manoI: [-100, -150] });
      const p = paso(t, d * 0.45, d * 0.95, -250, 900, 18); if (p.k > 0) personaje(ctx, t, POLI, p.x, F + 40, 1.0, { anda: p.anda, lado: 1, mood: 'enfado', mira: [0.8, 0], manoD: [200, -300], manoI: [-100, -150] }); });
    rotulo(ctx, d * 0.1, t, 'AGAIN?!', 540, 290, 150, '#ffd93d'); rotulo(ctx, d * 0.6, t, 'COPS!', 540, 440, 120, '#8fe3ff'); },
  // 10 — CON: "The tower's still for sale. Any offers?"
  10: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.15, 1.25, u), fx: 540, fy: 1100, t };
    calleParis(ctx, t, cam, { torreX: 620, torreS: 1.1, noche: true });
    capa(ctx, cam, 1, () => { personaje(ctx, t, CON, 480, F + 30, 1.05, { mood: 'feliz', habla: habla(a, 'con'), mira: [0, 0.1], manoD: [260, -260], sostieneD: cartel('FOR SALE'), manoI: [-100, -160], cierra: t > a.d * 0.7 && t < a.d * 0.78 }); });
    rotulo(ctx, 0.4, t, 'ANY OFFERS?', 540, 300, 130, '#ffd93d'); },
};
