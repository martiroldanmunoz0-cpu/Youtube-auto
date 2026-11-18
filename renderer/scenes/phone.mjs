// Móvil en mano con distintas pantallas (chat, notificación, llamada, mapa, búsqueda, perfil).
import { W, H, PALETTE as P, rr, radial, rgba, seg, ease, lerp, clamp } from '../lib/util.mjs';
import { makeBokeh, drawBokeh } from '../lib/fx.mjs';
import { drawPhoneInHands } from '../lib/parts.mjs';
import { linearBg } from './vehicle.mjs';

const F = (w, s) => `${w} ${s}px Poppins`;

function wrapText(ctx, text, maxW) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; } else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

const screens = {
  // params: { contact, messages: [{from:'them'|'me', text}] }
  chat(ctx, x, y, w, h, s, t, params, dur) {
    ctx.fillStyle = '#0e1018'; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#171a26'; ctx.fillRect(x, y, w, 150 * s);
    ctx.fillStyle = '#3a3f55'; ctx.beginPath(); ctx.arc(x + 70 * s, y + 100 * s, 30 * s, 0, 7); ctx.fill();
    ctx.fillStyle = P.white; ctx.font = F(600, 28 * s);
    ctx.fillText(params.contact || 'Desconocido', x + 120 * s, y + 98 * s);
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = F(400, 20 * s);
    ctx.fillText(params.status || 'en línea', x + 120 * s, y + 126 * s);
    const msgs = params.messages || [];
    const step = Math.max(0.6, (dur * 0.8) / Math.max(1, msgs.length));
    let cy = y + 190 * s;
    ctx.font = F(400, 26 * s);
    msgs.forEach((m, i) => {
      const k = ease.outBack(seg(t, 0.2 + i * step, 0.35));
      if (k <= 0) return;
      const lines = wrapText(ctx, m.text, w * 0.62);
      const bw = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 44 * s;
      const bh = lines.length * 36 * s + 30 * s;
      const me = m.from === 'me';
      const bx = me ? x + w - bw - 26 * s : x + 26 * s;
      ctx.save();
      ctx.globalAlpha = clamp(k);
      ctx.translate(0, (1 - k) * 30);
      ctx.fillStyle = me ? P.ui : '#262a3a';
      if (m.alert) ctx.fillStyle = '#b3262e';
      rr(ctx, bx, cy, bw, bh, 22 * s); ctx.fill();
      ctx.fillStyle = P.white;
      lines.forEach((l, li) => ctx.fillText(l, bx + 22 * s, cy + 46 * s + li * 36 * s));
      ctx.restore();
      cy += bh + 18 * s;
    });
    // "escribiendo..."
    if (params.typing) {
      const dots = Math.floor(t * 3) % 4;
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = F(400, 22 * s);
      ctx.fillText('escribiendo' + '.'.repeat(dots), x + 30 * s, y + h - 60 * s);
    }
  },
  // params: { time, date, notifications: [{app, title, text}] }
  notification(ctx, x, y, w, h, s, t, params) {
    const g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, '#1b1530'); g.addColorStop(1, '#07070d');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = P.white; ctx.textAlign = 'center';
    ctx.font = F(600, 110 * s); ctx.fillText(params.time || '03:17', x + w / 2, y + 260 * s);
    ctx.font = F(400, 24 * s); ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText(params.date || 'martes, 14 de noviembre', x + w / 2, y + 130 * s);
    ctx.textAlign = 'left';
    const list = params.notifications || [{ app: 'Mensajes', title: 'Desconocido', text: 'Sé dónde estás.' }];
    list.forEach((n, i) => {
      const k = ease.out(seg(t, 0.3 + i * 0.9, 0.4));
      if (k <= 0) return;
      const ny = y + 360 * s + i * 170 * s;
      ctx.save(); ctx.globalAlpha = k; ctx.translate(0, (1 - k) * -40);
      ctx.fillStyle = 'rgba(40,40,60,0.85)'; rr(ctx, x + 22 * s, ny, w - 44 * s, 150 * s, 30 * s); ctx.fill();
      ctx.fillStyle = n.alert ? P.red : P.ui; rr(ctx, x + 44 * s, ny + 24 * s, 40 * s, 40 * s, 10 * s); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = F(500, 20 * s); ctx.fillText((n.app || 'Mensajes').toUpperCase(), x + 100 * s, ny + 52 * s);
      ctx.fillStyle = P.white; ctx.font = F(600, 24 * s); ctx.fillText(n.title || '', x + 44 * s, ny + 96 * s);
      ctx.font = F(400, 22 * s); ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fillText(wrapText(ctx, n.text || '', w - 100 * s)[0] || '', x + 44 * s, ny + 128 * s);
      ctx.restore();
    });
  },
  // params: { caller, label }
  call(ctx, x, y, w, h, s, t, params) {
    const g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, '#20253a'); g.addColorStop(1, '#090a10');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = F(400, 24 * s);
    ctx.fillText(params.label || 'Llamada entrante', x + w / 2, y + 170 * s);
    ctx.fillStyle = P.white; ctx.font = F(600, 44 * s);
    ctx.fillText(params.caller || 'Número oculto', x + w / 2, y + 230 * s);
    const pulse = (t * 1.2) % 1;
    ctx.strokeStyle = rgba('#ffffff', 0.4 * (1 - pulse)); ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(x + w / 2, y + 420 * s, (80 + pulse * 80) * s, 0, 7); ctx.stroke();
    ctx.fillStyle = '#3a3f55'; ctx.beginPath(); ctx.arc(x + w / 2, y + 420 * s, 80 * s, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = F(600, 70 * s); ctx.fillText('?', x + w / 2, y + 445 * s);
    const by = y + h - 160 * s;
    ctx.fillStyle = '#e5384a'; ctx.beginPath(); ctx.arc(x + w * 0.27, by, 50 * s, 0, 7); ctx.fill();
    ctx.fillStyle = '#2fc26b'; ctx.beginPath(); ctx.arc(x + w * 0.73, by + Math.sin(t * 10) * 6, 50 * s, 0, 7); ctx.fill();
    ctx.textAlign = 'left';
  },
  // params: { title, subtitle, status: 'ok'|'alert', route: bool }
  map(ctx, x, y, w, h, s, t, params, dur) {
    ctx.fillStyle = '#121528'; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = 'rgba(120,130,200,0.18)'; ctx.lineWidth = 2;
    for (let i = 0; i < 12; i++) {
      ctx.beginPath(); ctx.moveTo(x + i * 44 * s, y); ctx.lineTo(x + i * 44 * s + 40, y + h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y + i * 70 * s); ctx.lineTo(x + w, y + i * 70 * s - 20); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(90,108,255,0.35)'; ctx.lineWidth = 26 * s;
    ctx.beginPath(); ctx.moveTo(x, y + h * 0.45); ctx.bezierCurveTo(x + w * 0.3, y + h * 0.4, x + w * 0.6, y + h * 0.5, x + w, y + h * 0.42); ctx.stroke();
    const alert = params.status === 'alert';
    if (params.route !== false) {
      const pts = [[0.45, 0.62], [0.45, 0.5], [0.6, 0.38], [0.6, 0.22], [0.66, 0.1]];
      const k = clamp(t / Math.max(1, dur * 0.7));
      ctx.strokeStyle = alert ? '#ff6b6b' : '#7f8cff'; ctx.lineWidth = 10 * s; ctx.lineJoin = 'round';
      ctx.beginPath();
      const n = (pts.length - 1) * k;
      pts.forEach(([px, py], i) => {
        if (i > Math.ceil(n)) return;
        let [qx, qy] = [px, py];
        if (i === Math.ceil(n) && i > 0) { const f = n - (i - 1); qx = lerp(pts[i - 1][0], px, f); qy = lerp(pts[i - 1][1], py, f); }
        i ? ctx.lineTo(x + qx * w, y + qy * h) : ctx.moveTo(x + qx * w, y + qy * h);
      });
      ctx.stroke();
      ctx.fillStyle = P.white; ctx.beginPath(); ctx.arc(x + 0.66 * w, y + 0.1 * h, 16 * s, 0, 7); ctx.fill();
    }
    radial(ctx, x + w * 0.45, y + h * 0.62, 60 * s, alert ? P.red : P.ui, 0.6);
    ctx.fillStyle = P.white; ctx.beginPath(); ctx.moveTo(x + w * 0.45, y + h * 0.6 - 22 * s); ctx.lineTo(x + w * 0.45 + 16 * s, y + h * 0.6 + 14 * s); ctx.lineTo(x + w * 0.45 - 16 * s, y + h * 0.6 + 14 * s); ctx.fill();
    // Tarjeta inferior
    ctx.fillStyle = 'rgba(28,30,48,0.95)'; rr(ctx, x + 20 * s, y + h - 260 * s, w - 40 * s, 230 * s, 30 * s); ctx.fill();
    ctx.textAlign = 'center';
    if (params.title) {
      if (alert) { ctx.fillStyle = '#e5384a'; rr(ctx, x + 60 * s, y + h - 225 * s, w - 120 * s, 70 * s, 16 * s); ctx.fill(); }
      ctx.fillStyle = P.white; ctx.font = F(600, 30 * s); ctx.fillText(params.title, x + w / 2, y + h - 178 * s);
    }
    if (params.subtitle) {
      ctx.fillStyle = alert ? '#ff9b9b' : '#9aa4ff'; ctx.font = F(600, 36 * s); ctx.fillText(params.subtitle, x + w / 2, y + h - 90 * s);
    }
    ctx.textAlign = 'left';
  },
  // params: { query, results: [..] }
  search(ctx, x, y, w, h, s, t, params) {
    ctx.fillStyle = '#0f1017'; ctx.fillRect(x, y, w, h);
    const q = params.query || '¿qué significa...?';
    const n = Math.floor(clamp(t / Math.max(0.8, q.length * 0.06)) * q.length);
    ctx.fillStyle = '#1f2230'; rr(ctx, x + 24 * s, y + 120 * s, w - 48 * s, 80 * s, 40 * s); ctx.fill();
    ctx.fillStyle = P.white; ctx.font = F(400, 26 * s);
    ctx.fillText(q.slice(0, n) + (Math.floor(t * 2) % 2 ? '|' : ''), x + 60 * s, y + 170 * s);
    const res = params.results || [];
    res.forEach((r, i) => {
      const k = seg(t, q.length * 0.06 + 0.3 + i * 0.4, 0.3);
      if (k <= 0) return;
      ctx.globalAlpha = k;
      ctx.fillStyle = '#9aa4ff'; ctx.font = F(600, 24 * s);
      wrapText(ctx, r, w - 80 * s).slice(0, 2).forEach((l, li) => ctx.fillText(l, x + 40 * s, y + 270 * s + i * 120 * s + li * 32 * s));
      ctx.globalAlpha = 1;
    });
  },
  // params: { name, label }
  profile(ctx, x, y, w, h, s, t, params) {
    const g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, '#1d1a2e'); g.addColorStop(1, '#0a0a10');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = F(400, 24 * s); ctx.fillText(params.label || 'Tu conductor', x + w / 2, y + 140 * s);
    ctx.fillStyle = '#d9dcf0'; ctx.beginPath(); ctx.arc(x + w / 2, y + 330 * s, 130 * s, 0, 7); ctx.fill();
    ctx.fillStyle = '#6a7090'; ctx.beginPath(); ctx.arc(x + w / 2, y + 300 * s, 50 * s, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + w / 2, y + 420 * s, 90 * s, 60 * s, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = P.white; ctx.font = F(600, 42 * s); ctx.fillText(params.name || 'Andrés', x + w / 2, y + 540 * s);
    if (params.detail) { ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = F(400, 24 * s); ctx.fillText(params.detail, x + w / 2, y + 590 * s); }
    ctx.textAlign = 'left';
  },
};

// params: { screen: 'chat'|'notification'|'call'|'map'|'search'|'profile', ...según pantalla }
export const phone = {
  setup(p, r) { return { bokeh: makeBokeh(r, 18, { rMin: 40, rMax: 140, colors: [P.amber, P.warm, '#f4f1ea'] }) }; },
  draw(ctx, s, { t, params, dur, prog }) {
    ctx.fillStyle = linearBg(ctx, 0, 0, 0, H, ['#07070b', '#18120f', '#0b0a0c']);
    ctx.fillRect(0, 0, W, H);
    drawBokeh(ctx, s.bokeh, t);
    const fn = screens[params.screen] || screens.chat;
    const alert = params.status === 'alert' || (params.messages || []).some((m) => m.alert);
    drawPhoneInHands(ctx, W / 2 + 10, 1200 + Math.sin(t * 1.3) * 6, {
      scale: 1.22, tilt: -0.04 + Math.sin(t * 0.7) * 0.01,
      screenGlow: alert ? P.red : P.ui,
      drawScreen: (c, x, y, w, h, sc) => fn(c, x, y, w, h, sc, t, params, dur),
    });
  },
};
