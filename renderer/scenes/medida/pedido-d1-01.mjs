// pedido-d1-01 — "The Army Lost a War to Birds" (Guerra de los emús, 1932) — estilo PAPEL con diálogo
import { lerp, ease, back, ph, clamp, personaje, capa, SUELO, rotulo, texto, rr, hash, paso } from '../../lib/papel.mjs';
import { campo, emu, ametralladora, casquillos, polvo, camion } from '../../lib/papel2.mjs';
const U = (a) => clamp(a.t / a.d);
const habla = (a, id) => a.speaker === id && a.t < (a.voice_dur || a.d) - 0.05;
export const MAJOR = { skin: '#e8b48c', hair: 'corto', hairCol: '#8a6a4a', ropa: '#8a7a4a', traje: true, camisa: '#d9cfa8', corbata: '#5a4a2a', medallas: true, pants: '#6b5e3a', shoes: '#3a2a1a', sombrero: 'militar', bigote: true, bigoteCol: '#8a6a4a' };
export const SOLDIER = { skin: '#d9a77c', hair: 'corto', hairCol: '#3a2a1a', ropa: '#9a8a5a', pants: '#6b5e3a', shoes: '#3a2a1a', sombrero: 'slouch' };
const F = SUELO + 40;
// manada de emús por el campo; fase de carrera opcional
function manada(ctx, t, n, y0, s, opt = {}) { for (let i = 0; i < n; i++) { const fila = i % 3; const x = (opt.x0 || -100) + (i * 137) % 1300 + (opt.vx || 0) * t * (0.8 + hash(i) * 0.4); const xx = opt.vx ? ((x % 1500) + 1500) % 1500 - 200 : x; const y = y0 + fila * 50; const k = opt.sale ? back(ph(t, i * 0.05, i * 0.05 + 0.4)) : 1; if (k <= 0) continue;
  emu(ctx, t, xx, y, s * (0.8 + fila * 0.12) * k, { dir: opt.dir || (hash(i) > 0.5 ? 1 : -1), corre: opt.vx ? t * 14 + i : null, picotea: opt.picotea ? Math.max(0, Math.sin(t * 3 + i * 1.7)) : 0, susto: opt.susto || 0 }); } }

export default {
  // 0 — SOLDIER: "Sir… we lost the war."
  0: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1, 1.1, u), fx: 540, fy: 1200, t };
    campo(ctx, t, cam, { cielo: '#e8955a', lejos: () => { const k = ease(ph(t, 1.0, 1.6)); if (k > 0) emu(ctx, t, 980, 1150 - k * 60 + 60, 0.55, { dir: -1, mira: -1 }); } });
    capa(ctx, cam, 1, () => {
      personaje(ctx, t, MAJOR, 330, F, 1.05, { mood: 'neutral', habla: habla(a, 'major'), mira: [0.7, 0], manoI: [-110, -110], manoD: [110, -120] });
      const w = paso(t, 0, 0.8, 1000, 720);
      const sal = ease(ph(t, 0.8, 1.1));
      personaje(ctx, t, SOLDIER, w.x, F, 1.0, { anda: w.anda, lado: w.lado, mood: 'triste', habla: habla(a, 'soldier'), mira: [-0.7, 0.2], manoI: [-110, -110], manoD: [lerp(110, 40, sal), lerp(-120, -390, sal)], incl: 0.03 });
    }); },
  // 1 — MAJOR: "Lost? To who?"
  1: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.5, 1.62, u), fx: 400, fy: 1000, t, temblor: t < 0.25 ? 6 : 0 };
    campo(ctx, t, cam, { cielo: '#e8955a' });
    capa(ctx, cam, 1, () => {
      const k = ease(ph(t, 0.9, 1.3)); if (k > 0) emu(ctx, t, 640, F + 30, 0.95, { dir: -1, mira: -1, susto: 0.3, picotea: 0 });
      personaje(ctx, t, MAJOR, 400, F, 1.05, { mood: t < 0.8 ? 'sorpresa' : 'enfado', habla: habla(a, 'major'), mira: [0.6, -0.1], manoI: [-140, -260], manoD: [150, -250], salto: t < 0.3 ? Math.sin(t / 0.3 * Math.PI) * 30 : 0 });
    }); },
  // 2 — SOLDIER: "Emus, sir. Twenty thousand of them."
  2: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.15, 1.0, ease(u)), fx: 540, fy: 1100, t };
    campo(ctx, t, cam, { cielo: '#e8955a', trigo: false });
    capa(ctx, cam, 0.85, () => { const n = Math.floor(lerp(3, 26, ease(ph(t, 0.3, 1.6)))); for (let i = 0; i < n; i++) emu(ctx, t, -60 + (i * 97) % 1200, 1180 + (i % 4) * 40, 0.32 + (i % 4) * 0.04, { dir: hash(i) > 0.5 ? 1 : -1, picotea: Math.max(0, Math.sin(t * 3 + i)) }); });
    capa(ctx, cam, 1, () => {
      personaje(ctx, t, SOLDIER, 760, F + 40, 1.0, { mood: 'miedo', habla: habla(a, 'soldier'), mira: [-0.4, -0.3], manoI: [-200, -300], manoD: [130, -140] });
      personaje(ctx, t, MAJOR, 300, F + 40, 1.0, { mood: t > 1.2 ? 'sorpresa' : 'neutral', mira: [0.3, -0.5], manoI: [-110, -110], manoD: [110, -120] });
    });
    rotulo(ctx, 0.9, t, '20,000', 540, 300, 170, '#ffd93d'); rotulo(ctx, 1.2, t, 'EMUS', 540, 460, 120); },
  // 3 — NARR: "Australia, 1932. Emus were eating the wheat farms bare. So the army sent machine guns."
  3: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1, 1.08, u), fx: 540, fy: 1300, t };
    campo(ctx, t, cam, { cielo: '#f0b36a' });
    capa(ctx, cam, 1, () => {
      manada(ctx, t, 6, F - 40, 0.75, { picotea: true, x0: 60 });
      const k = ease(ph(t, a.d * 0.55, a.d * 0.9)); camion(ctx, t, lerp(1500, 860, k), F + 40, 0.8, k < 1 ? 1 : 0);
      if (k > 0) ametralladora(ctx, t, lerp(1500, 860, k) - 120, F - 140, 0.5, 0, 0, -1);
    });
    rotulo(ctx, 0.1, t, 'AUSTRALIA', 540, 280, 130); rotulo(ctx, 0.4, t, '1932', 540, 430, 120, '#ffd93d'); },
  // 4 — MAJOR: "Fire!"
  4: (ctx, a) => { const t = a.t; const fuego = t > 0.35 ? 1 : 0; const cam = { z: 1.12, fx: 540, fy: 1200, t, temblor: fuego * 7 };
    campo(ctx, t, cam, { cielo: '#f0b36a' });
    capa(ctx, cam, 0.9, () => { polvo(ctx, t, 600, F - 60, fuego, 6); manada(ctx, t, 5, F - 80, 0.5, { susto: fuego, x0: 560 }); });
    capa(ctx, cam, 1, () => {
      ametralladora(ctx, t, 640, F + 60, 0.9, -0.05, fuego); casquillos(ctx, t, 560, F - 80, fuego);
      personaje(ctx, t, SOLDIER, 450, F + 60, 0.95, { mood: 'esfuerzo', cierra: fuego > 0, manoI: [140, -150], manoD: [200, -170] });
      personaje(ctx, t, MAJOR, 220, F + 60, 1.0, { mood: 'enfado', habla: habla(a, 'major'), mira: [0.8, 0], manoI: [-110, -110], manoD: [lerp(110, 230, ease(ph(t, 0, 0.2))), lerp(-120, -330, ease(ph(t, 0, 0.2)))] });
    });
    rotulo(ctx, 0.0, t, 'FIRE!', 540, 330, 200, '#ff6b4a'); },
  // 5 — NARR: "The emus split into tiny groups and ran. Thirty miles an hour."
  5: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: 1.05, fx: 540, fy: 1250, t };
    campo(ctx, t + u * 3, cam, { cielo: '#f0b36a' });
    capa(ctx, cam, 1, () => { const sp = ease(ph(t, 0, a.d * 0.4));
      for (let g = 0; g < 3; g++) for (let i = 0; i < 3; i++) { const gx = 540 + (g - 1) * lerp(80, 360, sp), gy = F - 30 + (g % 2) * 70 + i * 20; const x = gx + (i - 1) * 70 + Math.sin(t * 6 + g) * 30; emu(ctx, t, x, gy, 0.55, { corre: t * 14 + g * 2 + i, dir: g === 0 ? -1 : 1, susto: 0.4 }); }
      ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 6; for (let i = 0; i < 10; i++) { const y = 1100 + i * 50; ctx.beginPath(); ctx.moveTo(((i * 210 - t * 1800) % 1300 + 1300) % 1300 - 100, y); ctx.lineTo(((i * 210 - t * 1800) % 1300 + 1300) % 1300 + 80, y); ctx.stroke(); }
    });
    rotulo(ctx, a.d * 0.45, t, '30 MPH', 540, 330, 190, '#ffd93d'); },
  // 6 — SOLDIER: "Sir, they're dodging bullets!"
  6: (ctx, a) => { const t = a.t; const cam = { z: 1.25, fx: 500, fy: 1150, t, temblor: 5 };
    campo(ctx, t, cam, { cielo: '#f0b36a' });
    capa(ctx, cam, 0.9, () => { polvo(ctx, t, 640, F - 60, 1, 7); for (let i = 0; i < 3; i++) { const z = Math.sin(t * 5 + i * 2) * 140; emu(ctx, t, 620 + z + i * 120, F - 80 - i * 20, 0.45, { corre: t * 14 + i, dir: Math.cos(t * 5 + i * 2) > 0 ? 1 : -1, susto: 0.6 }); } });
    capa(ctx, cam, 1, () => { ametralladora(ctx, t, 520, F + 60, 0.9, Math.sin(t * 7) * 0.12, 1); casquillos(ctx, t, 440, F - 80, 1);
      personaje(ctx, t, SOLDIER, 320, F + 60, 0.95, { mood: 'miedo', habla: habla(a, 'soldier'), mira: [-0.6, -0.2], manoI: [140, -150], manoD: [200, -170] }); }); },
  // 7 — MAJOR: "Then mount the gun on the truck!"
  7: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.05, 1.0, u), fx: 540, fy: 1250, t };
    campo(ctx, t, cam, { cielo: '#f0b36a' });
    capa(ctx, cam, 1, () => { camion(ctx, t, 760, F + 50, 0.75, 0);
      personaje(ctx, t, MAJOR, 260, F + 60, 1.05, { mood: 'enfado', habla: habla(a, 'major'), mira: [0.9, 0], manoI: [-110, -110], manoD: [lerp(110, 260, ease(ph(t, 0.2, 0.5))), lerp(-120, -300, ease(ph(t, 0.2, 0.5)))], salto: Math.abs(Math.sin(t * 5)) * 10 }); });
    const k = ease(ph(t, 0.6, 1.0)); if (k > 0) { ctx.save(); ctx.globalAlpha = k; ctx.strokeStyle = '#ffd93d'; ctx.lineWidth = 12; ctx.setLineDash([24, 18]); ctx.beginPath(); ctx.moveTo(470, 1150); ctx.quadraticCurveTo(600, 900, 700, 1080); ctx.stroke(); ctx.restore(); } },
  // 8 — NARR: "The truck couldn't keep up on the rough ground. The gunner couldn't even aim."
  8: (ctx, a) => { const t = a.t; const cam = { z: 1.0, fx: 540, fy: 1250, t, temblor: 4 };
    campo(ctx, t * 3, cam, { cielo: '#f0b36a' });
    capa(ctx, cam, 1, () => { const bx = 470 + Math.sin(t * 1.3) * 30; for (let i = 0; i < 4; i++) emu(ctx, t, 820 + i * 90 + t * 40, F - 10 + (i % 2) * 40, 0.5, { corre: t * 16 + i, dir: 1 });
      camion(ctx, t, bx, F + 40, 0.75, 1);
      ctx.save(); ctx.translate(bx, F + 40 - Math.abs(Math.sin(t * 16)) * 10); ctx.rotate(Math.sin(t * 13) * 0.04);
      personaje(ctx, t, SOLDIER, -190, -172, 0.6, { mood: 'miedo', salto: Math.abs(Math.sin(t * 16)) * 30, manoI: [170, -170], manoD: [220, -190] });
      ametralladora(ctx, t, -60, -150, 0.5, Math.sin(t * 9) * 0.5, Math.sin(t * 9) > 0.3 ? 1 : 0); ctx.restore(); });
    rotulo(ctx, 0.3, t, 'TOO SLOW', 540, 300, 150, '#ff6b4a'); },
  // 9 — MAJOR: "They take bullets like tanks."
  9: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.35, 1.45, u), fx: 520, fy: 1050, t };
    campo(ctx, t, cam, { cielo: '#d98858' });
    capa(ctx, cam, 1, () => { personaje(ctx, t, MAJOR, 380, F, 1.05, { mood: 'triste', habla: habla(a, 'major'), mira: [0.6, 0], manoI: [-110, -110], manoD: [90, -300], cabeza: -0.05 });
      emu(ctx, t, 700, F + 20, 0.95, { dir: -1, mira: -1, ceja: true }); }); },
  // 10 — NARR: "Within weeks, the army pulled out. The emus kept the farms."
  10: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: 1.0, fx: 540, fy: 1250, t };
    campo(ctx, t, cam, { cielo: '#e8955a' });
    capa(ctx, cam, 1, () => { camion(ctx, t, lerp(300, -500, ease(ph(t, 0.2, a.d * 0.7))), F + 30, 0.7, 1);
      for (let i = 0; i < 5; i++) emu(ctx, t, 520 + i * 110, F - 20 + (i % 2) * 40, 0.55, { dir: -1, picotea: i % 2 ? Math.max(0, Math.sin(t * 3 + i)) : 0, corre: i % 2 ? null : (Math.sin(t * 8 + i) > 0 ? t * 8 : null) }); });
    rotulo(ctx, a.d * 0.5, t, 'EMUS 1', 540, 290, 150, '#ffd93d'); rotulo(ctx, a.d * 0.62, t, 'ARMY 0', 540, 450, 130); },
  // 11 — MAJOR: "We will never speak of this."
  11: (ctx, a) => { const t = a.t, u = U(a); const cam = { z: lerp(1.5, 1.6, u), fx: 470, fy: 1000, t };
    campo(ctx, t, cam, { cielo: '#c9705a' });
    capa(ctx, cam, 1, () => { personaje(ctx, t, MAJOR, 420, F, 1.05, { mood: 'aburrido', habla: habla(a, 'major'), mira: [-0.8, 0], manoI: [-60, -200], manoD: [60, -200] });
      emu(ctx, t, 680, F + 20, 0.95, { dir: -1, mira: -1, picotea: 0, susto: 0 }); }); },
};
