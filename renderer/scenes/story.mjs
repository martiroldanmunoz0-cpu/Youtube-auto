// Escenas para HISTORIAS REALES (casos reales, biografías, medicina, récords):
// persona de cuerpo entero, hospital, quirófano, médico, documento, cita, salto de años y grupo de personas.
// Todas usan la misma persona "protagonista" del vídeo (ver lib/persona.mjs) salvo que se indique otro "who".
import { W, H, PALETTE as P, rr, radial, rgba, seg, ease, lerp, clamp, noise1 } from '../lib/util.mjs';
import { makeBokeh, drawBokeh, makeDust, drawDust } from '../lib/fx.mjs';
import { linearBg } from './vehicle.mjs';
import { personaWho, drawFullBody, drawHead } from '../lib/persona.mjs';

const BGS = {
  night: ['#07080f', '#141a30', '#08080d'], warm: ['#0d0806', '#2a160c', '#0b0605'], cold: ['#05080c', '#0e1c2a', '#05070a'],
  red: ['#0a0405', '#2a0a0e', '#080304'], hospital: ['#0b1418', '#18303a', '#0a1216'], room: ['#120c08', '#3a2616', '#120c08'],
};
function bg(ctx, name) { ctx.fillStyle = linearBg(ctx, 0, 0, 0, H, BGS[name] || BGS.night); ctx.fillRect(0, 0, W, H); }

export function pill(ctx, text, x, y, { color = P.amber, ink = '#1a1206', size = 44, alpha = 1 } = {}) {
  text = String(text || '').toUpperCase(); if (!text) return;
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.font = `700 ${size}px Poppins`;
  const w = Math.min(W - 80, ctx.measureText(text).width + size * 1.2), h = size * 1.7;
  ctx.fillStyle = color; rr(ctx, x - w / 2, y - h / 2, w, h, h / 2); ctx.fill();
  ctx.fillStyle = ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y + 2, w - size); ctx.restore();
}

function wrap(ctx, text, maxW) {
  const words = String(text || '').split(/\s+/); const lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur); return lines;
}

// Persona de cuerpo entero. params: { who, mood, arms: normal|none|up|cross, highlight: none|arms|legs|chest|heart|head|stomach, label, bg }
export const person = {
  setup(p, r) { return { bokeh: makeBokeh(r, 12, { rMin: 60, rMax: 150 }), seed: r.int(0, 99) }; },
  draw(ctx, s, { t, params, seed }) {
    bg(ctx, params.bg || 'night'); drawBokeh(ctx, s.bokeh, t);
    const who = personaWho(seed, params);
    radial(ctx, W / 2, 900, 700, params.highlight && params.highlight !== 'none' ? P.red : P.amber, 0.14);
    // suelo
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(W / 2, 1680, 300, 45, 0, 0, 7); ctx.fill();
    drawFullBody(ctx, W / 2, 640 + Math.sin(t * 1.5) * 4, 0.45, who, { mood: params.mood, arms: params.arms, highlight: params.highlight, t, blinkSeed: s.seed });
    if (params.label) pill(ctx, params.label, W / 2, 1790, { alpha: clamp(t * 3), color: params.highlight && params.highlight !== 'none' ? '#ff5a4a' : P.amber, ink: '#140606' });
  },
};

// Paciente en la cama del hospital. params: { who, state: sleeping|awake, mood, monitor: normal|alarm, label }
export const hospital = {
  setup(p, r) { return { seed: r.int(0, 99) }; },
  draw(ctx, s, { t, params, seed }) {
    bg(ctx, 'hospital');
    ctx.save(); ctx.translate(0, 240);
    // ventana
    ctx.fillStyle = '#0a1a2a'; rr(ctx, 90, 260, 300, 420, 14); ctx.fill();
    ctx.strokeStyle = '#2a4458'; ctx.lineWidth = 12; ctx.strokeRect(90, 260, 300, 420); ctx.beginPath(); ctx.moveTo(240, 260); ctx.lineTo(240, 680); ctx.stroke();
    for (let i = 0; i < 18; i++) { ctx.fillStyle = `rgba(255,255,255,${0.3 + noise1(i, 3) * 0.6})`; ctx.fillRect(100 + (i * 53) % 280, 280 + (i * 97) % 380, 3, 3); }
    // monitor
    const alarm = params.monitor === 'alarm';
    ctx.fillStyle = '#1b2228'; rr(ctx, 640, 250, 360, 260, 20); ctx.fill();
    ctx.fillStyle = '#050a08'; rr(ctx, 662, 272, 316, 216, 12); ctx.fill();
    ctx.strokeStyle = alarm ? '#ff4a4a' : '#3dff8a'; ctx.lineWidth = 5; ctx.beginPath();
    for (let x = 0; x <= 300; x += 4) {
      const ph = ((x / 300) * 2 + t * (alarm ? 2.2 : 1.1)) % 1;
      const yb = ph > 0.45 && ph < 0.5 ? -70 : ph > 0.5 && ph < 0.55 ? 50 : 0;
      ctx.lineTo(670 + x, 380 + yb);
    }
    ctx.stroke();
    ctx.fillStyle = alarm ? '#ff4a4a' : '#3dff8a'; ctx.font = '700 40px Poppins'; ctx.fillText(alarm ? '!!' : String(68 + Math.round(Math.sin(t) * 3)), 900, 310);
    if (alarm) radial(ctx, 820, 380, 360, P.red, 0.25 + Math.sin(t * 8) * 0.12);
    // gotero
    ctx.strokeStyle = '#9aa6b2'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(560, 300); ctx.lineTo(560, 1100); ctx.stroke();
    ctx.fillStyle = 'rgba(200,230,255,0.5)'; rr(ctx, 515, 330, 90, 150, 30); ctx.fill();
    ctx.restore();
    // cama
    const who = personaWho(seed, params);
    ctx.fillStyle = '#c7d0d8'; rr(ctx, 110, 1020, 860, 70, 20); ctx.fill();
    ctx.fillStyle = '#6a7684'; ctx.fillRect(150, 1090, 20, 330); ctx.fillRect(910, 1090, 20, 330);
    ctx.fillStyle = '#eef3f7'; rr(ctx, 170, 860, 360, 190, 80); ctx.fill(); // almohada
    ctx.save(); ctx.translate(330, 860); ctx.scale(0.42, 0.42);
    drawHead(ctx, 0, 0, who, { mood: params.mood || (params.state === 'awake' ? 'worried' : 'neutral'), t, blinkSeed: s.seed, closed: params.state !== 'awake', neck: false });
    ctx.restore();
    const bl = ctx.createLinearGradient(0, 900, 0, 1100); bl.addColorStop(0, '#7fa6c9'); bl.addColorStop(1, '#4d7396');
    ctx.fillStyle = bl; ctx.beginPath(); ctx.moveTo(380, 960 + Math.sin(t * 1.8) * 6); ctx.quadraticCurveTo(700, 900, 960, 960); ctx.lineTo(960, 1060); ctx.lineTo(300, 1060); ctx.closePath(); ctx.fill();
    if (params.label) pill(ctx, params.label, W / 2, 1560, { alpha: clamp(t * 3) });
  },
};

// Quirófano visto desde arriba-lateral. params: { team: 2-4, label, intensity: calm|tense }
export const surgery = {
  setup(p, r) { return { seed: r.int(0, 99) }; },
  draw(ctx, s, { t, params, seed }) {
    bg(ctx, 'hospital');
    ctx.save(); ctx.translate(0, 130);
    // lámpara
    const lg = ctx.createLinearGradient(0, 160, 0, 1300); lg.addColorStop(0, 'rgba(230,250,255,0.55)'); lg.addColorStop(1, 'rgba(230,250,255,0)');
    ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(380, 230); ctx.lineTo(700, 230); ctx.lineTo(980, 1300); ctx.lineTo(100, 1300); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d8e2ea'; rr(ctx, 360, 170, 360, 80, 40); ctx.fill();
    ctx.fillStyle = '#fffbe8'; rr(ctx, 400, 230, 280, 22, 11); ctx.fill();
    ctx.restore();
    // equipo
    const n = clamp(Math.round(Number(params.team) || 3), 2, 4);
    const xs = n === 2 ? [330, 750] : n === 3 ? [250, 540, 830] : [200, 420, 660, 880];
    xs.forEach((x, i) => {
      const who = personaWho(seed, { who: `cirujano${i}` });
      const bob = Math.sin(t * 2 + i) * 6;
      ctx.fillStyle = '#2f7f74'; rr(ctx, x - 130, 820 + bob, 260, 360, 90); ctx.fill();
      ctx.save(); ctx.translate(x, 700 + bob); ctx.scale(0.4, 0.4);
      drawHead(ctx, 0, 0, who, { mood: params.intensity === 'tense' ? 'worried' : 'neutral', t, blinkSeed: i, neck: false });
      ctx.fillStyle = '#3c9a8d'; ctx.beginPath(); ctx.ellipse(0, -150, 250, 170, 0, Math.PI, 0); ctx.fill(); // gorro
      ctx.fillStyle = '#9fd3e6'; rr(ctx, -170, 60, 340, 200, 60); ctx.fill(); // mascarilla
      ctx.restore();
    });
    // mesa y paciente tapado
    ctx.fillStyle = '#5f7080'; ctx.fillRect(200, 1180, 680, 40); ctx.fillRect(520, 1220, 40, 300);
    ctx.fillStyle = '#d9e8f0'; rr(ctx, 180, 1080, 720, 110, 40); ctx.fill(); ctx.fillStyle = '#9fc0d4'; rr(ctx, 180, 1150, 720, 40, 20); ctx.fill();
    if (params.label) pill(ctx, params.label, W / 2, 1620, { alpha: clamp(t * 3) });
  },
};

// Médico/a hablando (busto con bata). params: { who, mood, say (texto corto en bocadillo), label }
export const doctor = {
  setup(p, r) { return { bokeh: makeBokeh(r, 10, { rMin: 60, rMax: 140 }), seed: r.int(0, 99) }; },
  draw(ctx, s, { t, params, seed }) {
    bg(ctx, 'hospital'); drawBokeh(ctx, s.bokeh, t);
    const who = personaWho(seed, { ...params, who: params.who || 'medico' });
    const cx = W / 2, cy = 1120 + Math.sin(t * 1.4) * 5;
    // bata
    ctx.fillStyle = '#eef2f6'; ctx.beginPath();
    ctx.moveTo(cx - 430, H + 40); ctx.quadraticCurveTo(cx - 410, cy + 330, cx - 150, cy + 290);
    ctx.lineTo(cx + 150, cy + 290); ctx.quadraticCurveTo(cx + 410, cy + 330, cx + 430, H + 40); ctx.fill();
    ctx.fillStyle = who.outfit; ctx.beginPath(); ctx.moveTo(cx - 120, cy + 290); ctx.lineTo(cx, cy + 520); ctx.lineTo(cx + 120, cy + 290); ctx.fill();
    ctx.strokeStyle = '#2b2f36'; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(cx - 140, cy + 300); ctx.quadraticCurveTo(cx - 170, cy + 560, cx - 40, cy + 600); ctx.stroke();
    ctx.fillStyle = '#9aa3ad'; ctx.beginPath(); ctx.arc(cx - 40, cy + 610, 30, 0, 7); ctx.fill();
    drawHead(ctx, cx, cy, who, { mood: params.mood || 'neutral', t, blinkSeed: s.seed });
    if (params.say) {
      const k = ease.out(clamp(t * 3));
      ctx.save(); ctx.globalAlpha = k; ctx.font = '600 50px Poppins';
      const lines = wrap(ctx, `«${params.say}»`, 760).slice(0, 3);
      const bh = lines.length * 64 + 60;
      ctx.fillStyle = '#ffffff'; rr(ctx, 100, 560 - bh / 2, 880, bh, 36); ctx.fill();
      ctx.beginPath(); ctx.moveTo(560, 560 + bh / 2 - 4); ctx.lineTo(620, 560 + bh / 2 + 70); ctx.lineTo(650, 560 + bh / 2 - 4); ctx.fill();
      ctx.fillStyle = '#14161c'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      lines.forEach((l, i) => ctx.fillText(l, W / 2, 560 - bh / 2 + 62 + i * 64));
      ctx.restore();
    }
    if (params.label) pill(ctx, params.label, W / 2, 1800, { alpha: clamp(t * 3) });
  },
};

// Documento / informe / carta. params: { title, lines: ["...", ...] (máx 5), highlight: índice 0-4, stamp: texto corto }
export const document = {
  setup() { return {}; },
  draw(ctx, s, { t, params }) {
    bg(ctx, 'room');
    radial(ctx, W / 2, 900, 700, P.amber, 0.16);
    const k = ease.out(clamp(t * 2.2));
    ctx.save(); ctx.translate(W / 2, 960 + (1 - k) * 200); ctx.rotate(-0.04);
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; rr(ctx, -370, -500, 760, 1040, 20); ctx.fill();
    ctx.fillStyle = '#f6f0e2'; rr(ctx, -390, -520, 760, 1040, 20); ctx.fill();
    ctx.fillStyle = '#1a2340'; ctx.font = '700 52px Poppins'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    const title = String(params.title || 'INFORME').toUpperCase();
    wrap(ctx, title, 640).slice(0, 2).forEach((l, i) => ctx.fillText(l, -340, -420 + i * 62));
    ctx.fillStyle = '#c94a3a'; ctx.fillRect(-340, -330, 200, 8);
    const lines = Array.isArray(params.lines) ? params.lines.slice(0, 5) : [];
    for (let i = 0; i < 9; i++) {
      const y = -250 + i * 80;
      const txt = lines[i];
      if (txt) {
        if (Number(params.highlight) === i) { ctx.fillStyle = `rgba(255,215,90,${0.7 * clamp((t - 0.6) * 2)})`; ctx.fillRect(-350, y - 44, 680 * clamp((t - 0.6) * 2), 60); }
        ctx.fillStyle = '#2a2f3a'; ctx.font = '500 38px Poppins'; ctx.fillText(String(txt).slice(0, 34), -340, y);
      } else { ctx.fillStyle = 'rgba(40,50,70,0.18)'; rr(ctx, -340, y - 24, 520 + noise1(i, 2) * 140, 18, 9); ctx.fill(); }
    }
    if (params.stamp) {
      const ks = ease.out(clamp((t - 0.8) * 4));
      ctx.save(); ctx.translate(160, 380); ctx.rotate(-0.25); ctx.scale(2 - ks, 2 - ks); ctx.globalAlpha = ks;
      ctx.strokeStyle = '#c62f2f'; ctx.lineWidth = 10; ctx.font = '800 64px Poppins';
      const w = ctx.measureText(String(params.stamp).toUpperCase()).width + 60;
      rr(ctx, -w / 2, -60, w, 120, 16); ctx.stroke();
      ctx.fillStyle = '#c62f2f'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(params.stamp).toUpperCase(), 0, 4);
      ctx.restore();
    }
    ctx.restore();
  },
};

// Cita textual en una nota. params: { text, author }
export const quote = {
  setup(p, r) { return { dust: makeDust(r, 40) }; },
  draw(ctx, s, { t, params }) {
    bg(ctx, 'night'); drawDust(ctx, s.dust, t);
    const k = ease.out(clamp(t * 3));
    ctx.save(); ctx.translate(W / 2, 900); ctx.rotate(-0.035 + (1 - k) * 0.2); ctx.scale(0.8 + 0.2 * k, 0.8 + 0.2 * k);
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; rr(ctx, -385, -305, 790, 640, 14); ctx.fill();
    ctx.fillStyle = '#ffe98a'; rr(ctx, -400, -320, 800, 640, 14); ctx.fill();
    ctx.fillStyle = '#1d1a10'; ctx.font = '700 64px Poppins'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const lines = wrap(ctx, `«${params.text || ''}»`, 680).slice(0, 5);
    lines.forEach((l, i) => ctx.fillText(l, 0, -((lines.length - 1) * 40) + i * 80 - 30));
    if (params.author) { ctx.font = '500 42px Poppins'; ctx.fillStyle = '#5a4a20'; ctx.fillText(`— ${params.author}`, 0, 250); }
    ctx.restore();
  },
};

// Salto de años: contador animado. params: { from: 1998, to: 2021, label: "23 años después" }
export const year_jump = {
  setup(p, r) { return { dust: makeDust(r, 50) }; },
  draw(ctx, s, { t, dur, params }) {
    bg(ctx, 'night'); drawDust(ctx, s.dust, t, '#bcd0ff', 0.4);
    const a = Number(params.from) || 2000, b = Number(params.to) || a + 10;
    const k = ease.inOut(clamp(t / Math.max(0.8, dur * 0.6)));
    const y = Math.round(lerp(a, b, k));
    radial(ctx, W / 2, 860, 600, P.ui, 0.25);
    ctx.font = '230px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 16; ctx.strokeStyle = '#000'; ctx.strokeText(String(y), W / 2, 860);
    ctx.fillStyle = k >= 1 ? P.amber : '#ffffff'; ctx.fillText(String(y), W / 2, 860);
    // línea de tiempo
    ctx.fillStyle = 'rgba(255,255,255,0.15)'; rr(ctx, 140, 1080, 800, 14, 7); ctx.fill();
    ctx.fillStyle = P.amber; rr(ctx, 140, 1080, 800 * k, 14, 7); ctx.fill();
    ctx.font = '600 40px Poppins'; ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText(String(a), 170, 1150); ctx.fillText(String(b), 910, 1150);
    if (params.label) pill(ctx, params.label, W / 2, 1320, { alpha: clamp((k - 0.8) * 5) });
  },
};

// Grupo: protagonista con otras personas (familia, amigos, equipo). params: { count: 2-4, kids: true|false, mood, label }
export const group = {
  setup(p, r) { return { bokeh: makeBokeh(r, 12, { rMin: 60, rMax: 150 }), seed: r.int(0, 99) }; },
  draw(ctx, s, { t, params, seed }) {
    bg(ctx, params.bg || 'warm'); drawBokeh(ctx, s.bokeh, t);
    radial(ctx, W / 2, 1000, 700, P.amber, 0.16);
    const n = clamp(Math.round(Number(params.count) || 3), 2, 4);
    const kids = params.kids === true || params.kids === 'true';
    const spots = { 2: [[380, 0.42], [720, 0.42]], 3: [[300, 0.4], [560, 0.42], [820, 0.4]], 4: [[220, 0.36], [440, 0.4], [660, 0.4], [880, 0.36]] }[n];
    const order = spots.map((sp, i) => ({ sp, i })).sort((a, b) => (a.i === 0 ? 1 : 0) - (b.i === 0 ? 1 : 0));
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(W / 2, 1680, 460, 60, 0, 0, 7); ctx.fill();
    for (const { sp: [x, sc], i } of order) {
      const isMain = i === Math.floor(n / 2);
      const small = kids && !isMain;
      const others = Array.isArray(params.people) ? params.people : [];
      const k = i < Math.floor(n / 2) ? i : i - 1;
      const who = personaWho(seed, { who: isMain ? 'protagonista' : (others[k] || `familiar${i}`) });
      const scale = small ? sc * 0.66 : sc;
      drawFullBody(ctx, x, 1680 - 2290 * scale, scale, who, { mood: params.mood || 'happy', t: t + i, blinkSeed: i });
    }
    if (params.label) pill(ctx, params.label, W / 2, 1800, { alpha: clamp(t * 3) });
  },
};
