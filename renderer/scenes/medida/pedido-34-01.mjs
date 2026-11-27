// pedido-34-01 — "The 382-Day Fast" (Short vertical, estilo nuevo). Persona real → personaje genérico.
import { W, H, INK, V, sm, lerp, ph, hs, fondo, D, cielo, ln, circ, caja, titular, sello } from '../../lib/corto.mjs';

let CAST = null;
function cast(K) {
  if (CAST) return CAST;
  const sin = { sombrero: null, corbata: null, barba: false, bigote: false };
  const [MAN, DOC, DAD] = K.reparto('pedido-34', 3, [
    { ...sin, estilo: 'gordito', pelo: 'raya', peloCol: '#6a3a1a', ropa: '#3aa7a3' },
    { ...sin, estilo: 'limpio', pelo: 'corto', peloCol: '#d9d9d9', ropa: '#ffffff', bigote: true },
    { ...sin, estilo: 'gordito', pelo: 'calvo', peloCol: '#7a7a7a', ropa: '#e63946', bigote: true },
  ]);
  return (CAST = { MAN, DOC, DAD });
}
// El protagonista adelgaza: escala horizontal según peso (456 → 180)
function hombre(K, ctx, a, x, gy, s, peso, o = {}) { const f = lerp(0.72, 1.35, (peso - 180) / (456 - 180)); ctx.save(); ctx.translate(x, gy); ctx.scale(f, 1); D(K, ctx, a, cast(K).MAN, 0, 0, s, { sombra: true, ...o }); ctx.restore(); }
function calendario(ctx, x, y, n, s = 1, txt = 'DAY') { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); caja(ctx, -150, -160, 300, 320, 24, '#ffffff', 9); caja(ctx, -150, -160, 300, 80, [24, 24, 0, 0], '#e63946', 9); ctx.fillStyle = '#fff'; ctx.font = '54px Anton'; ctx.textAlign = 'center'; ctx.fillText(txt, 0, -102); ctx.fillStyle = INK; ctx.font = (String(n).length > 2 ? 150 : 190) + 'px Anton'; ctx.fillText(String(n), 0, 120); ctx.restore(); }
function bascula(ctx, x, y, v) { caja(ctx, x - 180, y - 60, 360, 70, 20, '#d9dde3', 8); caja(ctx, x - 110, y - 50, 220, 50, 10, '#2b2d42', 5); ctx.fillStyle = '#6bff8a'; ctx.font = '44px Anton'; ctx.textAlign = 'center'; ctx.fillText(v + ' LB', x, y - 10); }
function plato(ctx, x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#ffffff'; ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.beginPath(); ctx.ellipse(0, 0, 160, 50, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore(); }
function huevo(ctx, x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#fffaf0'; ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(0, -30, 46, 60, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore(); }
function tostada(ctx, x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); caja(ctx, -60, -110, 120, 110, 30, '#e7b46a', 6); caja(ctx, -44, -94, 88, 80, 20, '#ffe2a8', 0); ctx.restore(); }
function hospital(ctx, a) { const gy = fondo(ctx, a, 'despacho', { hora: 'dia' }, { cx: 540 }); return gy; }

const PLANOS = {
  // 0 — Dejas de comer. Un hombre lo hizo 382 días.
  0: (ctx, a, K) => { const n = Math.max(1, Math.round(sm(ph(a, 0.15, 0.85)) * 382));
    K.camara(ctx, a, () => { const gy = fondo(ctx, a, 'salon', { hora: 'dia' }, { cx: 540 }); plato(ctx, 300, gy - 260, 0.8); ln(ctx, [[180, gy - 380], [420, gy - 160]], '#ff3b4e', 16);
      hombre(K, ctx, a, 700, gy, 1.6, 456, { pose: 'cruza', mood: 'decidido', mira: -1 }); calendario(ctx, 760, 820, n, 0.9); }, { ...V, de: 1, a: 1.1, foco: [W / 2, 1100] });
    titular(ctx, a, 'STOP EATING', W / 2, 260, { size: 140 }); titular(ctx, a, '382 DAYS', W / 2, 430, { size: 160, col: '#ffd93d', p0: 0.35 }); },
  // 1 — Los médicos le dejaron
  1: (ctx, a, K) => { const { DOC } = cast(K);
    K.camara(ctx, a, () => { const gy = hospital(ctx, a); hombre(K, ctx, a, 330, gy, 1.5, 456, { pose: 'quieto', mood: 'neutral', mira: 1 }); D(K, ctx, a, DOC, 780, gy, 1.55, { pose: 'senala', mood: 'feliz', mira: -1, habla: true }); K.globo(ctx, a, 'OK!', 780, 900, { p0: 0.35 }); }, { ...V, de: 1, a: 1.08, foco: [W / 2, 1200] });
    titular(ctx, a, 'DOCTORS', W / 2, 260, { size: 150 }); titular(ctx, a, 'LET HIM', W / 2, 420, { size: 150, col: '#6bcb77', p0: 0.3 }); },
  // 2 — Hora 24: el azúcar se acaba; quemas grasa (depósito de azúcar se vacía, llama sobre la grasa)
  2: (ctx, a, K) => { const k = sm(ph(a, 0.05, 0.6));
    K.camara(ctx, a, () => { cielo(ctx, '#2b2d42', '#4a4f7a'); caja(ctx, 160, 700, 300, 600, 40, '#ffffff', 9); caja(ctx, 172, 700 + 588 * k, 276, 588 * (1 - k) + 1, 30, '#ff8cc6', 0); caja(ctx, 160, 700, 300, 600, 40, null, 9);
      ctx.fillStyle = '#fff'; ctx.font = '60px Anton'; ctx.textAlign = 'center'; ctx.fillText('SUGAR', 310, 1380);
      caja(ctx, 600, 900, 340, 400, 120, '#ffe08a', 9); ctx.fillStyle = INK; ctx.fillText('FAT', 770, 1120); if (k > 0.7) K.prop(ctx, 'fuego', 770, 880, 0.7, a.t); }, { ...V, de: 1, a: 1.08, foco: [W / 2, 1000] });
    titular(ctx, a, 'HOUR 24', W / 2, 260, { size: 160, col: '#ffd93d' }); K.etiqueta(ctx, a, 'NOW YOU BURN FAT', W / 2, 1550, { size: 56, p0: 0.6 }); },
  // 3 — Día 3: aliento afrutado, el cerebro funciona con grasa
  3: (ctx, a, K) => { K.camara(ctx, a, () => { const gy = fondo(ctx, a, 'salon', { hora: 'dia' }, { cx: 600 }); const y = (() => { hombre(K, ctx, a, 330, gy, 1.7, 430, { pose: 'quieto', mood: 'feliz', mira: 1, habla: true }); return null; })();
      for (let i = 0; i < 5; i++) { const f = (a.t * 0.5 + i / 5) % 1; ctx.save(); ctx.globalAlpha = 1 - f; circ(ctx, 520 + f * 300, 900 - f * 200, 26 + f * 20, i % 2 ? '#ffb3d1' : '#ffd166', 4); ctx.restore(); }
      K.prop(ctx, 'cerebro', 820, 600, 0.6, a.t); ctx.fillStyle = INK; ctx.font = '50px Anton'; ctx.textAlign = 'center'; ctx.fillText('RUNS ON FAT', 820, 780); }, { ...V, de: 1, a: 1.1, foco: [W / 2, 1100] });
    calendario(ctx, W / 2, 330, 3, 0.7); titular(ctx, a, 'FRUITY BREATH', W / 2, 600, { size: 90, col: '#ff8cc6', p0: 0.3 }); },
  // 4 — El hambre se apaga
  4: (ctx, a, K) => { const k = ph(a, 0.2, 0.7);
    K.camara(ctx, a, () => { const gy = fondo(ctx, a, 'salon', { hora: 'tarde' }, { cx: 600 }); hombre(K, ctx, a, W / 2, gy, 1.8, 420, { pose: 'quieto', mood: k > 0.5 ? 'feliz' : 'triste', mira: 0 });
      ctx.save(); ctx.globalAlpha = 1 - k; K.prop(ctx, 'estomago', W / 2, 700, 0.6, a.t); ctx.fillStyle = INK; ctx.font = '70px Anton'; ctx.textAlign = 'center'; ctx.fillText('GRRR', W / 2, 560); ctx.restore(); }, { ...V, de: 1, a: 1.12, foco: [W / 2, 1100] });
    titular(ctx, a, 'HUNGER', W / 2, 260, { size: 160 }); titular(ctx, a, 'FADES', W / 2, 430, { size: 160, col: '#8fe3ff', p0: 0.4 }); },
  // 5 — Dundee, Escocia, 1965, 456 libras (báscula)
  5: (ctx, a, K) => { const v = Math.round(sm(ph(a, 0.1, 0.6)) * 456);
    K.camara(ctx, a, () => { const gy = fondo(ctx, a, 'calle', { hora: 'nublado' }, { cx: 400 }); bascula(ctx, W / 2, gy + 10, v); hombre(K, ctx, a, W / 2, gy - 50, 1.7, 456, { pose: 'quieto', mood: 'duda', mira: 0 }); }, { ...V, de: 1, a: 1.08, foco: [W / 2, 1200] });
    K.contador(ctx, a, 'DUNDEE · 1965', W / 2, 200, { size: 60 }); titular(ctx, a, '456 LB', W / 2, 380, { size: 180, col: '#ffd93d', p0: 0.5 }); },
  // 6 — Los médicos esperan unos días. Sigues.
  6: (ctx, a, K) => { const { DOC } = cast(K); const n = Math.round(lerp(3, 60, sm(ph(a, 0.2, 0.9))));
    K.camara(ctx, a, () => { const gy = hospital(ctx, a); D(K, ctx, a, DOC, 260, gy, 1.5, { pose: 'sorpresa', mood: n > 20 ? 'sorpresa' : 'neutral', mira: 1 }); hombre(K, ctx, a, 720, gy, 1.5, lerp(450, 400, n / 60), { pose: 'anda', mood: 'decidido', mira: 1 }); calendario(ctx, 760, 760, n, 0.6); }, { ...V, de: 1, a: 1.08, foco: [W / 2, 1150] });
    titular(ctx, a, 'A FEW DAYS?', W / 2, 260, { size: 130 }); titular(ctx, a, 'KEEP GOING', W / 2, 420, { size: 130, col: '#6bcb77', p0: 0.4 }); },
  // 7 — Té, café, agua con gas, vitaminas (aparecen uno a uno)
  7: (ctx, a, K) => { K.camara(ctx, a, () => { cielo(ctx, '#fff4e0', '#ffe0c2'); [['cafe', 'TEA', 0.05], ['cafe', 'COFFEE', 0.25], ['vaso_agua', 'SPARKLING', 0.45], ['pastilla', 'VITAMINS', 0.65]].forEach(([p, t, p0], i) => { const k = sm(ph(a, p0, p0 + 0.15)); if (k <= 0) return; const x = 290 + (i % 2) * 500, y = 760 + Math.floor(i / 2) * 520; ctx.save(); ctx.translate(x, y); ctx.scale(k, k); K.prop(ctx, p, 0, 0, 0.75, a.t); if (i === 2) K.sparkles(ctx, 0, -60, a.t, 5, 60); ctx.fillStyle = INK; ctx.font = '64px Anton'; ctx.textAlign = 'center'; ctx.fillText(t, 0, 200); ctx.restore(); }); }, { ...V, de: 1, a: 1.05, foco: [W / 2, 1000] });
    titular(ctx, a, 'ONLY THIS', W / 2, 280, { size: 140 }); },
  // 8 — Sigue friendo pescado con patatas en la tienda de papá
  8: (ctx, a, K) => { const { DAD } = cast(K);
    K.camara(ctx, a, () => { const gy = fondo(ctx, a, 'cafeteria', { hora: 'dia' }, { cx: 540 }); caja(ctx, 100, gy - 360, 880, 60, 10, '#c0c6d0', 8); K.smoke(ctx, 540, gy - 400, a.t, 5);
      hombre(K, ctx, a, 430, gy, 1.5, 380, { pose: 'sostiene', mood: 'triste', mira: 1, objeto: (c, mx, my) => { caja(c, mx - 10, my - 20, 120, 20, 8, '#5a5a62', 5); } }); D(K, ctx, a, DAD, 820, gy, 1.45, { pose: 'quieto', mood: 'feliz', mira: -1 });
      K.prop(ctx, 'pez', 600, gy - 420, 0.4, a.t); }, { ...V, de: 1, a: 1.1, foco: [W / 2, 1200] });
    titular(ctx, a, 'FISH & CHIPS', W / 2, 260, { size: 130, col: '#ffd93d' }); K.etiqueta(ctx, a, 'AND HE DOESN\'T EAT ANY', W / 2, 410, { size: 50, p0: 0.3 }); },
  // 9 — Al baño una vez cada cuarenta días
  9: (ctx, a, K) => { const n = Math.round(sm(ph(a, 0.05, 0.75)) * 40);
    K.camara(ctx, a, () => { const gy = fondo(ctx, a, 'bano', { hora: 'dia' }, { cx: 540 }); hombre(K, ctx, a, 330, gy, 1.6, 360, { pose: 'quieto', mood: n >= 40 ? 'sorpresa' : 'aburrido', mira: 1 }); calendario(ctx, 780, 900, n, 0.8); }, { ...V, de: 1, a: 1.08, foco: [W / 2, 1150] });
    titular(ctx, a, 'BATHROOM:', W / 2, 260, { size: 130 }); titular(ctx, a, 'EVERY 40 DAYS', W / 2, 420, { size: 110, col: '#ffd93d', p0: 0.5 }); },
  // 10 — Sin potasio el corazón podría pararse; lo vigilan
  10: (ctx, a, K) => { const { DOC } = cast(K); const lat = Math.pow(Math.max(0, Math.sin(a.t * 5)), 8);
    K.camara(ctx, a, () => { const gy = hospital(ctx, a); caja(ctx, 560, 560, 440, 280, 20, '#14213d', 9); ln(ctx, Array.from({ length: 40 }, (_, i) => { const x = 580 + i * 10, f = ((i / 40) + a.t * 0.8) % 1; return [x, 700 - (Math.abs(f - 0.5) < 0.03 ? 90 : 0)]; }), '#6bff8a', 6);
      ctx.save(); ctx.translate(780, 950); ctx.scale(1 + lat * 0.12, 1 + lat * 0.12); K.prop(ctx, 'corazon', 0, 0, 0.5, a.t); ctx.restore();
      D(K, ctx, a, DOC, 300, gy, 1.6, { pose: 'sostiene', mood: 'duda', mira: 1, objeto: (c, mx, my) => caja(c, mx - 50, my - 130, 100, 140, 10, '#f5f0e6', 6) }); }, { ...V, de: 1, a: 1.1, foco: [W / 2, 1100] });
    titular(ctx, a, 'POTASSIUM', W / 2, 260, { size: 140, col: '#ff8cc6' }); K.etiqueta(ctx, a, 'OR THE HEART COULD STOP', W / 2, 410, { size: 50, p0: 0.3 }); },
  // 11 — Mes a mes encoges: 456, 300, 180
  11: (ctx, a, K) => { const k = sm(ph(a, 0.05, 0.9)); const peso = Math.round(lerp(456, 180, k));
    K.camara(ctx, a, () => { const gy = fondo(ctx, a, 'salon', { hora: 'dia' }, { cx: 540 }); bascula(ctx, W / 2, gy + 10, peso); hombre(K, ctx, a, W / 2, gy - 50, 1.7, peso, { pose: k > 0.9 ? 'vitorea' : 'quieto', mood: k > 0.6 ? 'feliz' : 'neutral', mira: 0 }); }, { ...V, de: 1, a: 1.08, foco: [W / 2, 1200] });
    titular(ctx, a, peso + ' LB', W / 2, 330, { size: 200, col: peso < 200 ? '#6bcb77' : '#ffd93d' }); },
  // 12 — Luego comes: un huevo cocido, una rebanada de pan
  12: (ctx, a, K) => { K.camara(ctx, a, () => { const gy = fondo(ctx, a, 'cocina', { hora: 'dia' }, { cx: 540 }); caja(ctx, 120, gy - 300, 840, 40, 10, '#b5773f', 8); plato(ctx, 700, gy - 320, 1); if (ph(a, 0.1, 0.2) > 0) huevo(ctx, 640, gy - 330, 1); if (ph(a, 0.35, 0.45) > 0) tostada(ctx, 790, gy - 320, 0.9);
      hombre(K, ctx, a, 300, gy, 1.6, 180, { pose: 'vitorea', mood: 'feliz', mira: 1 }); K.sparkles(ctx, 700, gy - 400, a.t, 6, 120); }, { ...V, de: 1, a: 1.1, foco: [W / 2, 1200] });
    titular(ctx, a, 'FIRST MEAL', W / 2, 260, { size: 150, col: '#ffd93d' }); K.etiqueta(ctx, a, '1 EGG · 1 SLICE OF BREAD', W / 2, 410, { size: 50, p0: 0.3 }); },
  // 13 — 382 días, 276 libras menos: el ayuno más largo registrado
  13: (ctx, a, K) => { K.camara(ctx, a, () => { cielo(ctx, '#1f2a5a', '#4d5fa8'); K.sparkles(ctx, W / 2, 1000, a.t, 14, 460); calendario(ctx, 300, 900, 382, 0.85, 'DAYS'); caja(ctx, 620, 740, 300, 320, 24, '#ffffff', 9); ctx.fillStyle = '#e63946'; ctx.font = '110px Anton'; ctx.textAlign = 'center'; ctx.fillText('-276', 770, 900); ctx.fillStyle = INK; ctx.font = '60px Anton'; ctx.fillText('LB', 770, 990);
      hombre(K, ctx, a, W / 2, 1650, 1.25, 180, { pose: 'vitorea', mood: 'feliz', mira: 0 }); }, { ...V, de: 1, a: 1.05, foco: [W / 2, 1000] });
    titular(ctx, a, 'LONGEST FAST', W / 2, 300, { size: 140, col: '#ffd93d' }); sello(ctx, a, 'ON RECORD', W / 2, 520, { p0: 0.4, size: 80 }); },
  // 14 — Y ese es el récord para cualquiera que pueda... (bucle al plato vacío)
  14: (ctx, a, K) => { K.camara(ctx, a, () => { const gy = fondo(ctx, a, 'salon', { hora: 'dia' }, { cx: 540 }); plato(ctx, W / 2, gy - 260, 1); hombre(K, ctx, a, W / 2, gy + 30, 1.7, 456, { pose: 'senala', mood: 'sorpresa', mira: 0 }); }, { ...V, de: 1, a: 1.12, foco: [W / 2, 1100] });
    titular(ctx, a, "AND THAT'S THE RECORD", W / 2, 260, { size: 90, col: '#ffd93d' }); titular(ctx, a, 'FOR ANYONE WHO...', W / 2, 400, { size: 90, p0: 0.4 }); },
};
const BASE = (fn) => (ctx, a, K) => { cielo(ctx, '#fff4e0', '#ffe0c2'); fn(ctx, a, K); };
export default Object.fromEntries(Object.entries(PLANOS).map(([k, f]) => [k, BASE(f)]));
