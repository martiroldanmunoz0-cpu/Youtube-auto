// pedido-e1-01 — "What If All the Water on Earth Vanished?" — estilo PAPEL con diálogo
import { lerp, ease, back, ph, clamp, personaje, capa, SUELO, rotulo, texto, rr, hash, pez, exterior, sol, salpica, impacto, cae } from '../../lib/papel.mjs';
import { mar, barco, botella, planta, grifo, fosa } from '../../lib/papel3.mjs';
import { bocadillo } from '../../lib/papel2.mjs';
const U = (a) => clamp(a.t / a.d);
const habla = (a, id) => a.speaker === id && a.t < (a.voice_dur || a.d) - 0.05;
export const SCI = { skin: '#f2c9a5', hair: 'mono', hairCol: '#3a2a1a', ropa: '#8fd0e8', bata: true, pants: '#3b3550', shoes: '#2c2433', gafas: true, mujer: true };
export const YOU = { skin: '#e8b48c', hair: 'punta', hairCol: '#5a3a22', ropa: '#ffb36a', pants: '#4a5a6e', shoes: '#f1ece4' };
const F = SUELO + 40;
// suelo agrietado y seco
function grietas(ctx, y0 = SUELO - 20) { ctx.save(); ctx.strokeStyle = 'rgba(70,45,25,0.55)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  for (let i = 0; i < 16; i++) { let x = -100 + hash(i) * 1300, y = y0 + hash(i + 7) * 260; ctx.beginPath(); ctx.moveTo(x, y); for (let j = 0; j < 4; j++) { x += 40 + hash(i * 3 + j) * 60; y += (hash(i + j * 5) - 0.5) * 50; ctx.lineTo(x, y); } ctx.stroke(); } ctx.restore(); }
// lecho marino seco con barco varado
function fondo(ctx, t, cam, { barcoY = 1330, rot = -0.12, peces = true } = {}) {
  mar(ctx, t, cam, { horizonte: 820, seco: 1 });
  capa(ctx, cam, 0.85, () => { barco(ctx, t, 760, barcoY, 0.72, rot); });
  capa(ctx, cam, 1, () => { grietas(ctx, SUELO - 60); if (peces) for (let i = 0; i < 3; i++) { const sx = 200 + i * 290, j = Math.abs(Math.sin(t * 6 + i * 2)); ctx.save(); ctx.translate(sx, F + 40 - j * 40); ctx.rotate(Math.sin(t * 9 + i) * 0.6); pez(ctx, t, 0, 0, 0.6); ctx.restore(); } });
}
// tierra firme seca, sol a tope
function seco(ctx, t, cam, extra) { mar(ctx, t, cam, { horizonte: 820, seco: 1, cielo: ['#9fd0ee', '#f4e6c8'] }); capa(ctx, cam, 0.35, () => sol(ctx, t, 880, 680, 80)); if (extra) capa(ctx, cam, 0.9, extra); capa(ctx, cam, 1, () => grietas(ctx, SUELO - 60)); }
// gota que brilla dentro de "tú"
function gotaDentro(ctx, t, x, y, k) { if (k <= 0) return; ctx.save(); ctx.translate(x, y); const s = back(clamp(k)) * (1 + Math.sin(t * 5) * 0.05); ctx.scale(s, s);
  const g = ctx.createRadialGradient(0, 0, 10, 0, 0, 170); g.addColorStop(0, 'rgba(120,210,255,0.7)'); g.addColorStop(1, 'rgba(120,210,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 170, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.moveTo(0, -70); ctx.quadraticCurveTo(50, 0, 40, 30); ctx.arc(0, 30, 40, 0, Math.PI); ctx.quadraticCurveTo(-50, 0, 0, -70); ctx.fillStyle = '#5fb3e9'; ctx.fill(); ctx.strokeStyle = '#2a2230'; ctx.lineWidth = 5; ctx.stroke(); ctx.restore(); }
// cuenta atrás grande (pantalla)
function reloj(ctx, t, x, y, seg0, s = 1, rojo = false) { const sg = Math.max(0, Math.floor(seg0 - t)); const h = Math.floor(sg / 3600), m = Math.floor(sg / 60) % 60, ss = sg % 60;
  const p = (n) => String(n).padStart(2, '0'); ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(ctx, -330, -100, 660, 200, 24); ctx.fillStyle = '#231a24'; ctx.fill(); ctx.strokeStyle = rojo ? '#ff4a4a' : '#ffd93d'; ctx.lineWidth = 10; ctx.stroke();
  texto(ctx, `${p(h)}:${p(m)}:${p(ss)}`, 0, 8, 150, rojo ? '#ff6b4a' : '#ffd93d'); ctx.restore(); }
const SOSTB = (nivel, sh = 0) => (c) => botella(c, 0, 60, 0.9, nivel, sh);

export default {
  // 0 — SCI: "Every drop of water on Earth just vanished." (imagen de choque ya en pantalla)
  0: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.08, 1.0, u), fx: 540, fy: 1150, t, temblor: t < 0.3 ? 8 : 0 };
    fondo(ctx, t, cam);
    capa(ctx, cam, 1, () => {
      personaje(ctx, t, SCI, 330, F, 0.95, { mood: 'sorpresa', habla: habla(a, 'sci'), mira: [0.6, 0], manoI: [-120, -260], manoD: [150, -300] });
      personaje(ctx, t, YOU, 550, F + 20, 0.95, { mood: 'miedo', mira: [0.8, -0.2], manoI: [-140, -300], manoD: [140, -300], cabeza: Math.sin(t * 4) * 0.1 });
    });
    rotulo(ctx, -1, t, 'ALL WATER:', 540, 300, 140, '#ffffff'); rotulo(ctx, -1, t, 'GONE', 540, 460, 200, '#ff6b4a'); },
  // 1 — SCI: "Except the water inside you."
  1: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.4, 1.5, u), fx: 470, fy: 1100, t };
    fondo(ctx, t, cam, { peces: false });
    capa(ctx, cam, 1, () => {
      personaje(ctx, t, SCI, 260, F, 0.95, { mood: 'neutral', habla: habla(a, 'sci'), mira: [0.7, 0], manoD: [200, -250] });
      personaje(ctx, t, YOU, 470, F + 20, 0.95, { mood: 'sorpresa', mira: [-0.1, 0.4], manoI: [-60, -230], manoD: [60, -230] });
      gotaDentro(ctx, t, 470, F - 260, ph(t, 0.4, 0.8));
    });
    rotulo(ctx, 0.5, t, 'EXCEPT YOU', 540, 300, 150, '#8fe3ff'); },
  // 2 — NARR: "In one second, the oceans are gone. Every ship drops onto the seafloor."
  2: (ctx, a) => { const t = a.t, u = U(a), d = a.d; const T0 = d * 0.15, T1 = T0 + 0.9; const sk = ease(ph(t, T0, T1));
    const yB = sk < 1 ? lerp(1010, 1330, sk * sk) : 1330; const choque = ph(t, T1, T1 + 0.6);
    const cam = { z: lerp(1.0, 1.06, u), fx: 600, fy: 1100, t, temblor: choque > 0 && choque < 0.5 ? 14 : 0 };
    mar(ctx, t, cam, { horizonte: 820, seco: sk });
    capa(ctx, cam, 0.85, () => { barco(ctx, t, 760, yB, 0.72, lerp(0, -0.12, sk)); salpica(ctx, 760, 1330, choque, '#c9a874', 12, 260); });
    capa(ctx, cam, 1, () => { if (sk > 0.6) grietas(ctx, SUELO - 60); impacto(ctx, t, 760, 1330, choque, 260, '#fff'); });
    rotulo(ctx, 0.1, t, '1 SECOND', 540, 300, 150, '#ffd93d'); rotulo(ctx, T1, t, 'SHIPS: STUCK', 540, 460, 110, '#ffffff'); },
  // 3 — NARR: "The deepest spot is now a hole eleven kilometers deep. Mount Everest would fit inside."
  3: (ctx, a) => { const t = a.t, u = U(a), d = a.d; const cam = { z: lerp(1.0, 1.08, u), fx: 540, fy: 1100, t };
    mar(ctx, t, cam, { horizonte: 700, seco: 1 });
    capa(ctx, cam, 1, () => fosa(ctx, t, 540, 1500, 1.0, ph(t, d * 0.5, d * 0.75)));
    rotulo(ctx, 0.2, t, '11 KM DEEP', 540, 300, 150, '#ffd93d'); rotulo(ctx, d * 0.6, t, 'EVEREST FITS', 540, 460, 120, '#ffffff'); },
  // 4 — YOU: "Fine. I'll just buy a bottle."
  4: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.3, 1.38, u), fx: 520, fy: 1100, t };
    const sacude = t > 0.9 ? Math.sin(t * 22) * 0.25 : 0;
    seco(ctx, t, cam);
    capa(ctx, cam, 1, () => {
      personaje(ctx, t, YOU, 480, F, 1.0, { mood: t > 0.9 ? 'sorpresa' : 'feliz', habla: habla(a, 'guy'), mira: [0.5, -0.2], manoI: [-120, -150], manoD: [150, -330], sostieneD: SOSTB(0, sacude) });
    });
    if (t > 1.0) rotulo(ctx, 1.0, t, 'EMPTY', 540, 320, 160, '#ff6b4a'); },
  // 5 — SCI: "Empty. So is every pipe, every lake, every cloud."
  5: (ctx, a) => { const t = a.t, u = U(a), d = a.d; const cam = { z: lerp(1.05, 1.12, u), fx: 540, fy: 1100, t };
    seco(ctx, t, cam, () => { const k = ph(t, d * 0.55, d * 0.8); ctx.fillStyle = '#8a6a44'; ctx.beginPath(); ctx.ellipse(760, 1240, 260, 50, 0, 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(60,40,20,0.6)'; ctx.lineWidth = 4; ctx.stroke(); if (k > 0) { ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = '#c0392b'; ctx.font = '60px Anton'; ctx.textAlign = 'center'; ctx.fillText('LAKE', 760, 1180); ctx.restore(); } });
    capa(ctx, cam, 1, () => {
      rr(ctx, 540, 980, 40, 470, 8); ctx.fillStyle = '#9aa4b0'; ctx.fill(); grifo(ctx, t, 560, 1000, 1.2, 0);
      personaje(ctx, t, SCI, 260, F, 0.95, { mood: 'neutral', habla: habla(a, 'sci'), mira: [0.6, -0.1], manoD: [220, -330] });
      personaje(ctx, t, YOU, 820, F + 20, 0.9, { mood: 'triste', mira: [-0.6, -0.1], manoI: [-200, -360], manoD: [80, -150], incl: -0.05 });
    });
    rotulo(ctx, 0.2, t, 'PIPES', 540, 290, 110, '#ffffff'); rotulo(ctx, d * 0.35, t, 'LAKES', 540, 410, 110, '#ffffff'); rotulo(ctx, d * 0.65, t, 'CLOUDS', 540, 530, 110, '#ff6b4a'); },
  // 6 — NARR: "No clouds means no rain. Ever again."
  6: (ctx, a) => { const t = a.t, u = U(a), d = a.d; const cam = { z: lerp(1.0, 1.15, u), fx: 540, fy: 900, t };
    seco(ctx, t, cam);

    capa(ctx, cam, 1, () => { ctx.save(); ctx.globalAlpha = 0.25 + 0.1 * Math.sin(t * 7); ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; for (let i = 0; i < 6; i++) { const x = 200 + i * 130; ctx.beginPath(); for (let y = 1000; y < 1400; y += 20) ctx.lineTo(x + Math.sin(y * 0.05 + t * 6) * 10, y); ctx.stroke(); } ctx.restore(); });
    rotulo(ctx, 0.2, t, 'NO RAIN', 540, 300, 170, '#ffd93d'); rotulo(ctx, d * 0.55, t, 'EVER.', 540, 470, 150, '#ff6b4a'); },
  // 7 — YOU: "Then I'll eat a salad."
  7: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.3, 1.36, u), fx: 520, fy: 1100, t };
    seco(ctx, t, cam);
    capa(ctx, cam, 1, () => {
      planta(ctx, t, 760, F + 10, 1.1, 0);
      personaje(ctx, t, YOU, 420, F, 1.0, { mood: 'feliz', habla: habla(a, 'guy'), mira: [0.7, 0.1], manoI: [-120, -150], manoD: [200, -200] });
    }); },
  // 8 — SCI: "Plants lost their water too. Only yours survived."
  8: (ctx, a) => { const t = a.t, u = U(a), d = a.d; const cam = { z: lerp(1.05, 1.12, u), fx: 540, fy: 1100, t };
    const sk = ease(ph(t, 0.1, d * 0.5));
    seco(ctx, t, cam);
    capa(ctx, cam, 1, () => {
      for (let i = 0; i < 3; i++) planta(ctx, t, 560 + i * 170, F + 20 - i * 10, 0.8, sk);
      personaje(ctx, t, SCI, 230, F, 0.95, { mood: 'neutral', habla: habla(a, 'sci'), mira: [0.6, 0], manoD: [220, -250] });
      personaje(ctx, t, YOU, 400, F + 30, 0.9, { mood: sk > 0.5 ? 'triste' : 'sorpresa', mira: [0.7, 0.2] });
      gotaDentro(ctx, t, 400, F - 220, ph(t, d * 0.6, d * 0.8) * 0.7);
    });
    rotulo(ctx, 0.3, t, 'PLANTS: DRY', 540, 300, 130, '#ffd93d'); rotulo(ctx, d * 0.6, t, 'ONLY YOU', 540, 460, 140, '#8fe3ff'); },
  // 9 — NARR: "And you lose water with every breath. Most people last about three days without a drink."
  9: (ctx, a) => { const t = a.t, u = U(a), d = a.d; const cam = { z: lerp(1.35, 1.45, u), fx: 520, fy: 1000, t };
    seco(ctx, t, cam);
    capa(ctx, cam, 1, () => {
      personaje(ctx, t, YOU, 520, F, 1.0, { mood: 'triste', mira: [0.2, 0.2], cierra: Math.sin(t * 2) > 0.95, incl: 0.03 });
      for (let i = 0; i < 4; i++) { const k = ((t * 0.7 + i * 0.25) % 1); ctx.save(); ctx.globalAlpha = 0.6 * (1 - k); ctx.fillStyle = '#d8f0ff'; ctx.beginPath(); ctx.arc(620 + k * 160, 960 - k * 140, 24 + k * 50, 0, 7); ctx.fill(); ctx.restore(); }
    });
    rotulo(ctx, 0.3, t, 'EVERY BREATH', 540, 300, 120, '#8fe3ff'); rotulo(ctx, d * 0.6, t, '3 DAYS', 540, 470, 190, '#ff6b4a'); },
  // 10 — YOU: "So how long do I have?"
  10: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.45, 1.55, u), fx: 400, fy: 1050, t };
    seco(ctx, t, cam);
    capa(ctx, cam, 1, () => {
      personaje(ctx, t, SCI, 220, F, 0.95, { mood: 'neutral', mira: [0.7, 0] });
      personaje(ctx, t, YOU, 480, F + 10, 1.0, { mood: 'miedo', habla: habla(a, 'guy'), mira: [-0.7, -0.1], manoI: [-150, -280], manoD: [150, -280] });
    });
    rotulo(ctx, 0.5, t, 'HOW LONG?', 540, 300, 150, '#ffd93d'); },
  // 11 — SCI: "Three days. Starting… now."
  11: (ctx, a) => { const t = a.t, u = U(a), d = a.d; const cam = { z: lerp(1.15, 1.25, u), fx: 400, fy: 1100, t };
    const on = ph(t, d * 0.55, d * 0.6);
    seco(ctx, t, cam);
    capa(ctx, cam, 1, () => {
      personaje(ctx, t, SCI, 260, F, 0.95, { mood: 'neutral', habla: habla(a, 'sci'), mira: [0.6, 0], manoD: [lerp(100, 220, on), lerp(-140, -420, on)] });
      personaje(ctx, t, YOU, 520, F + 20, 0.95, { mood: on > 0 ? 'miedo' : 'triste', mira: [-0.2, -0.6] });
    });
    if (on > 0) { ctx.save(); const s = back(on); reloj(ctx, on > 0.99 ? t - d * 0.6 : 0, 540, 400, 72 * 3600, s, true); ctx.restore(); } },
};
