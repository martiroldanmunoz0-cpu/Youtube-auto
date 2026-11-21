// BIBLIOTECA DE PIEZAS (estilo luminoso con contorno). Cada pieza se dibuja con la base en (0, 0) y crece hacia
// arriba; mide ~400 px de alto a escala 1. La escena "composicion" las coloca, escala y anima.
import { INK } from './brightbg.mjs';

const O = (ctx, w = 9) => { ctx.lineWidth = w; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); };
const E = (ctx, x, y, rx, ry, c, rot = 0, w = 9) => { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, 7); ctx.fillStyle = c; ctx.fill(); if (w) O(ctx, w); };
const C = (ctx, x, y, r, c, w = 9) => E(ctx, x, y, r, r, c, 0, w);
const R = (ctx, x, y, w, h, r, c, lw = 9) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fillStyle = c; ctx.fill(); if (lw) O(ctx, lw); };
const P = (ctx, pts, c, w = 9) => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fillStyle = c; ctx.fill(); if (w) O(ctx, w); };
const L = (ctx, pts, c, w) => { for (const [lw, col] of [[w + 16, INK], [w, c]]) { ctx.lineWidth = lw; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); } };
const EYE = (ctx, x, y, r = 16, look = 0) => { C(ctx, x, y, r, '#fff', 5); C(ctx, x + look * r * 0.3, y, r * 0.5, INK, 0); };
const MOUTH = (ctx, x, y, w, happy = true) => { ctx.beginPath(); happy ? ctx.arc(x, y, w, 0.2, Math.PI - 0.2) : ctx.arc(x, y + w, w, Math.PI + 0.3, -0.3); O(ctx, 7); };

export const PROPS = {
  // ---------------- Animales ----------------
  dinosaurio(ctx, t) {
    const b = Math.sin(t * 2) * 6;
    P(ctx, [[-260, -120], [-420, -60], [-440, -40], [-250, -60]], '#5cb85c');
    R(ctx, -120, -150, 90, 150, 30, '#4a9e4a'); R(ctx, 40, -150, 90, 150, 30, '#4a9e4a');
    E(ctx, -60, -230 + b, 240, 150, '#5cb85c', -0.2);
    E(ctx, 150, -420 + b, 130, 100, '#5cb85c', -0.1);
    P(ctx, [[60, -400 + b], [270, -400 + b], [270, -360 + b], [80, -350 + b]], '#5cb85c');
    for (let i = 0; i < 5; i++) P(ctx, [[110 + i * 30, -360 + b], [125 + i * 30, -335 + b], [140 + i * 30, -360 + b]], '#fff', 4);
    EYE(ctx, 160, -460 + b, 18, 1);
    L(ctx, [[60, -250 + b], [120, -210 + b]], '#5cb85c', 30);
    for (let i = 0; i < 4; i++) P(ctx, [[-200 + i * 70, -360 + b], [-170 + i * 70, -420 + b], [-140 + i * 70, -350 + b]], '#f0ad4e', 6);
  },
  perro(ctx, t) {
    const w = Math.sin(t * 10) * 0.4;
    ctx.save(); ctx.translate(150, -190); ctx.rotate(-0.8 + w); R(ctx, -12, -90, 24, 100, 12, '#c98a4b'); ctx.restore();
    for (const x of [-120, -60, 60, 120]) R(ctx, x - 22, -120, 44, 120, 18, '#c98a4b');
    E(ctx, 0, -170, 170, 90, '#d9a066');
    C(ctx, -170, -270, 90, '#d9a066'); E(ctx, -240, -300, 30, 70, '#8b5a2b', 0.3); E(ctx, -100, -310, 30, 70, '#8b5a2b', -0.3);
    EYE(ctx, -200, -290, 13); EYE(ctx, -140, -290, 13); C(ctx, -175, -245, 16, INK, 0); MOUTH(ctx, -175, -235, 18);
  },
  gato(ctx, t) {
    ctx.save(); ctx.translate(120, -80); ctx.rotate(Math.sin(t * 2) * 0.2); L(ctx, [[0, 0], [80, -80], [60, -180]], '#888', 26); ctx.restore();
    E(ctx, 0, -140, 130, 140, '#9a9a9a'); C(ctx, 0, -320, 100, '#9a9a9a');
    P(ctx, [[-90, -360], [-70, -450], [-20, -400]], '#9a9a9a'); P(ctx, [[90, -360], [70, -450], [20, -400]], '#9a9a9a');
    EYE(ctx, -38, -330, 16); EYE(ctx, 38, -330, 16); P(ctx, [[-10, -290], [10, -290], [0, -278]], '#ff8fab', 4);
    ctx.beginPath(); for (const s of [-1, 1]) for (const dy of [-6, 8]) { ctx.moveTo(s * 30, -285 + dy); ctx.lineTo(s * 110, -295 + dy * 1.6); } O(ctx, 4);
  },
  tiburon(ctx, t) {
    const sw = Math.sin(t * 3) * 0.06; ctx.rotate(sw);
    P(ctx, [[260, -200], [420, -300], [380, -200], [420, -100]], '#6c8ead');
    E(ctx, 0, -200, 300, 110, '#7fa3c4'); E(ctx, -40, -160, 220, 50, '#e8f0f7', 0, 0);
    P(ctx, [[-30, -300], [40, -420], [80, -300]], '#6c8ead'); P(ctx, [[-20, -110], [60, -40], [70, -120]], '#6c8ead');
    EYE(ctx, -200, -230, 14, -1);
    for (let i = 0; i < 6; i++) P(ctx, [[-270 + i * 22, -170], [-259 + i * 22, -150], [-248 + i * 22, -170]], '#fff', 3);
    ctx.beginPath(); ctx.moveTo(-280, -170); ctx.lineTo(-140, -170); O(ctx, 6);
  },
  ballena(ctx, t) {
    E(ctx, 0, -200, 360, 170, '#4f7fc2'); E(ctx, -20, -120, 300, 80, '#cfe0f5', 0, 0);
    P(ctx, [[330, -230], [470, -340], [440, -220], [480, -110]], '#4f7fc2');
    EYE(ctx, -230, -230, 14); ctx.beginPath(); ctx.arc(-250, -170, 60, 0.2, 1.2); O(ctx, 7);
    for (const dx of [-30, 0, 30]) { const k = (t * 1.5 + dx / 60) % 1; C(ctx, -60 + dx * (1 + k), -380 - k * 160, 14 * (1 - k) + 4, '#bfe6ff', 4); }
  },
  pez(ctx, t) {
    ctx.rotate(Math.sin(t * 4) * 0.08);
    P(ctx, [[130, -200], [220, -270], [220, -130]], '#ff9f43'); E(ctx, 0, -200, 150, 100, '#ffb347');
    for (const x of [-30, 30]) { ctx.beginPath(); ctx.arc(x, -200, 60, -1, 1); O(ctx, 6); }
    EYE(ctx, -90, -220, 16);
  },
  pajaro(ctx, t) {
    const f = Math.sin(t * 12) * 0.6;
    E(ctx, 0, -200, 120, 90, '#5ab8ff'); C(ctx, -100, -280, 70, '#5ab8ff'); P(ctx, [[-170, -285], [-230, -270], [-170, -255]], '#ffd34a', 6);
    EYE(ctx, -115, -295, 14); ctx.save(); ctx.translate(20, -230); ctx.rotate(-0.4 + f); E(ctx, 60, -40, 110, 50, '#3f8fd8', -0.4); ctx.restore();
    P(ctx, [[110, -200], [200, -240], [190, -170]], '#3f8fd8'); L(ctx, [[-30, -110], [-40, -20]], '#f0ad4e', 8); L(ctx, [[30, -110], [30, -20]], '#f0ad4e', 8);
  },
  mono(ctx, t) {
    L(ctx, [[110, -150], [220, -250], [200, -380]], '#8b5a2b', 26);
    E(ctx, 0, -170, 130, 150, '#8b5a2b'); C(ctx, 0, -380, 110, '#8b5a2b'); C(ctx, -110, -390, 40, '#d9a066'); C(ctx, 110, -390, 40, '#d9a066');
    E(ctx, 0, -360, 80, 70, '#d9a066'); EYE(ctx, -32, -390, 14); EYE(ctx, 32, -390, 14); MOUTH(ctx, 0, -340, 24);
  },
  leon(ctx, t) {
    for (const x of [-120, -50, 60, 130]) R(ctx, x - 24, -130, 48, 130, 20, '#e0a142');
    E(ctx, 20, -190, 190, 100, '#e8b04d'); L(ctx, [[200, -200], [290, -260]], '#e8b04d', 20); C(ctx, 300, -270, 22, '#a0522d');
    for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; C(ctx, -170 + Math.cos(a) * 110, -300 + Math.sin(a) * 110, 50, '#a0522d', 6); }
    C(ctx, -170, -300, 95, '#e8b04d'); EYE(ctx, -205, -320, 13); EYE(ctx, -135, -320, 13); P(ctx, [[-190, -280], [-150, -280], [-170, -262]], INK, 0);
  },
  oso(ctx, t) {
    E(ctx, 0, -200, 190, 200, '#8b5a2b'); C(ctx, -110, -470, 50, '#8b5a2b'); C(ctx, 110, -470, 50, '#8b5a2b'); C(ctx, 0, -400, 130, '#8b5a2b');
    E(ctx, 0, -370, 60, 45, '#d9a066'); C(ctx, 0, -385, 16, INK, 0); EYE(ctx, -50, -430, 14); EYE(ctx, 50, -430, 14); E(ctx, 0, -180, 110, 120, '#c98a4b', 0, 0);
  },
  vaca(ctx, t) {
    for (const x of [-140, -70, 80, 150]) R(ctx, x - 22, -140, 44, 140, 16, '#f4f1ea');
    E(ctx, 0, -210, 210, 110, '#ffffff'); E(ctx, -40, -240, 60, 40, INK, 0.3, 0); E(ctx, 90, -190, 50, 35, INK, -0.2, 0);
    E(ctx, -230, -290, 80, 95, '#ffffff'); E(ctx, -245, -240, 60, 40, '#ffb3c7'); EYE(ctx, -260, -320, 12); EYE(ctx, -205, -320, 12);
    P(ctx, [[-290, -370], [-320, -420], [-270, -380]], '#f0e0c0', 5); P(ctx, [[-180, -370], [-150, -420], [-200, -380]], '#f0e0c0', 5);
  },
  hormiga(ctx, t) {
    const s = Math.sin(t * 12) * 10;
    for (const k of [-1, 0, 1]) { L(ctx, [[k * 70, -80], [k * 90 - 40, -10 + s * k]], '#3a2a20', 6); L(ctx, [[k * 70, -80], [k * 90 + 40, -10 - s * k]], '#3a2a20', 6); }
    E(ctx, 150, -110, 90, 70, '#5a3a2a'); C(ctx, 20, -110, 55, '#5a3a2a'); C(ctx, -110, -120, 65, '#5a3a2a');
    EYE(ctx, -140, -135, 12); L(ctx, [[-130, -175], [-180, -250]], '#3a2a20', 5); L(ctx, [[-100, -180], [-90, -260]], '#3a2a20', 5);
  },
  serpiente(ctx, t) {
    const pts = []; for (let i = 0; i <= 12; i++) pts.push([-300 + i * 50, -60 - Math.sin(i * 0.9 + t * 3) * 40 - i * 8]);
    L(ctx, pts, '#6fcf97', 50); C(ctx, 320, -190, 50, '#6fcf97'); EYE(ctx, 335, -205, 12); L(ctx, [[370, -185], [410, -180 + Math.sin(t * 20) * 8]], '#e85d5d', 4);
  },
  // ---------------- Cuerpo humano ----------------
  corazon(ctx, t) {
    const k = 1 + Math.max(0, Math.sin(t * 7)) * 0.08; ctx.scale(k, k);
    ctx.beginPath(); ctx.moveTo(0, -40); ctx.bezierCurveTo(-260, -200, -200, -420, 0, -320); ctx.bezierCurveTo(200, -420, 260, -200, 0, -40);
    ctx.fillStyle = '#e8505b'; ctx.fill(); O(ctx, 10); E(ctx, -90, -300, 40, 26, 'rgba(255,255,255,0.5)', -0.5, 0);
  },
  cerebro(ctx, t) {
    E(ctx, 0, -220, 230, 170, '#ffb3c7');
    ctx.beginPath(); ctx.moveTo(0, -380); ctx.lineTo(0, -60); for (let i = 0; i < 6; i++) { ctx.moveTo(-200 + i * 30, -300 + i * 40); ctx.quadraticCurveTo(-120 + i * 10, -260 + i * 30, -60, -300 + i * 50); ctx.moveTo(200 - i * 30, -300 + i * 40); ctx.quadraticCurveTo(120 - i * 10, -260 + i * 30, 60, -300 + i * 50); } O(ctx, 6);
    R(ctx, -30, -80, 60, 80, 20, '#ff9fb7');
  },
  pulmones(ctx, t) {
    const k = 1 + Math.sin(t * 2) * 0.05;
    L(ctx, [[0, -420], [0, -300], [-60, -260]], '#ff9fb7', 24); L(ctx, [[0, -300], [60, -260]], '#ff9fb7', 24);
    ctx.save(); ctx.scale(k, 1); E(ctx, -120, -200, 100, 180, '#ff8fab', 0.1); E(ctx, 120, -200, 100, 180, '#ff8fab', -0.1); ctx.restore();
  },
  hueso(ctx) { for (const y of [-60, -340]) { C(ctx, -45, y, 50, '#fffaf0'); C(ctx, 45, y, 50, '#fffaf0'); } R(ctx, -40, -340, 80, 280, 20, '#fffaf0'); },
  ojo(ctx, t) { E(ctx, 0, -200, 240, 140, '#ffffff'); C(ctx, Math.sin(t) * 40, -200, 90, '#4f8fd8'); C(ctx, Math.sin(t) * 40, -200, 45, INK, 0); C(ctx, Math.sin(t) * 40 - 25, -230, 16, '#fff', 0); },
  diente(ctx) { ctx.beginPath(); ctx.moveTo(-120, -380); ctx.quadraticCurveTo(0, -440, 120, -380); ctx.quadraticCurveTo(140, -250, 90, -200); ctx.lineTo(70, -20); ctx.lineTo(20, -160); ctx.lineTo(-20, -160); ctx.lineTo(-70, -20); ctx.lineTo(-90, -200); ctx.quadraticCurveTo(-140, -250, -120, -380); ctx.fillStyle = '#ffffff'; ctx.fill(); O(ctx); },
  estomago(ctx) { ctx.beginPath(); ctx.moveTo(-40, -420); ctx.quadraticCurveTo(-60, -300, -150, -250); ctx.quadraticCurveTo(-220, -60, 40, -60); ctx.quadraticCurveTo(200, -80, 120, -260); ctx.quadraticCurveTo(60, -330, 40, -420); ctx.closePath(); ctx.fillStyle = '#ff9f9f'; ctx.fill(); O(ctx); },
  celula(ctx, t) { const k = 1 + Math.sin(t * 2) * 0.04; ctx.scale(k, 1 / k); E(ctx, 0, -200, 220, 190, 'rgba(255,190,220,0.85)'); C(ctx, 40, -210, 70, '#bb6bd9'); for (let i = 0; i < 6; i++) E(ctx, -120 + (i % 3) * 60, -300 + Math.floor(i / 3) * 170, 24, 12, '#ffb347', i, 4); },
  adn(ctx, t) { for (let i = 0; i < 12; i++) { const y = -20 - i * 34, a = i * 0.6 + t * 2; const x1 = Math.sin(a) * 100, x2 = -x1; L(ctx, [[x1, y], [x2, y]], '#ddd', 4); C(ctx, x1, y, 16, '#5ab8ff', 5); C(ctx, x2, y, 16, '#e8505b', 5); } },
  virus(ctx, t) { ctx.translate(0, -200); ctx.rotate(t * 0.5); for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; L(ctx, [[Math.cos(a) * 130, Math.sin(a) * 130], [Math.cos(a) * 190, Math.sin(a) * 190]], '#6fcf97', 10); C(ctx, Math.cos(a) * 200, Math.sin(a) * 200, 22, '#ff8fab', 6); } C(ctx, 0, 0, 140, '#6fcf97'); EYE(ctx, -40, -20, 18); EYE(ctx, 40, -20, 18); MOUTH(ctx, 0, 40, 30, false); },
  // ---------------- Espacio y naturaleza ----------------
  planeta(ctx, t) { C(ctx, 0, -220, 190, '#ff9f68'); ctx.save(); ctx.beginPath(); ctx.arc(0, -220, 190, 0, 7); ctx.clip(); for (let i = 0; i < 4; i++) { ctx.fillStyle = 'rgba(200,90,50,0.35)'; ctx.fillRect(-200, -380 + i * 90, 400, 30); } ctx.restore(); ctx.beginPath(); ctx.ellipse(0, -220, 310, 70, -0.3, 0.15, Math.PI - 0.15); O(ctx, 22); ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 12; ctx.stroke(); },
  tierra(ctx, t) { C(ctx, 0, -220, 200, '#3f8fd8'); ctx.save(); ctx.beginPath(); ctx.arc(0, -220, 200, 0, 7); ctx.clip(); const o = (t * 30) % 400; for (const [x, y, rx, ry] of [[-60, -280, 90, 60], [80, -160, 70, 90], [-120, -120, 50, 40]]) for (const d of [0, 400]) E(ctx, x + o - d, y, rx, ry, '#5cb85c', 0, 5); ctx.restore(); C(ctx, 0, -220, 200, 'rgba(0,0,0,0)'); },
  luna(ctx) { C(ctx, 0, -220, 180, '#e9e4d4'); for (const [x, y, r] of [[-60, -260, 40], [70, -180, 30], [20, -320, 22], [-40, -140, 26]]) C(ctx, x, y, r, '#cfc8b4', 5); },
  sol(ctx, t) { ctx.translate(0, -220); ctx.rotate(t * 0.3); for (let i = 0; i < 12; i++) { ctx.rotate(Math.PI / 6); P(ctx, [[-30, -200], [30, -200], [0, -290]], '#ffb347', 6); } C(ctx, 0, 0, 180, '#ffd166'); EYE(ctx, -55, -30, 16); EYE(ctx, 55, -30, 16); MOUTH(ctx, 0, 30, 50); },
  cohete(ctx, t) {
    for (let i = 0; i < 5; i++) { const k = (t * 3 + i / 5) % 1; C(ctx, Math.sin(t * 40 + i) * 10, 20 + k * 160, 40 * (1 - k) + 8, k < 0.4 ? '#ffd166' : '#ff8a5b', 0); }
    P(ctx, [[-110, -60], [-170, 20], [-60, -10]], '#e8505b'); P(ctx, [[110, -60], [170, 20], [60, -10]], '#e8505b');
    ctx.beginPath(); ctx.moveTo(-80, 0); ctx.lineTo(-80, -300); ctx.quadraticCurveTo(0, -500, 80, -300); ctx.lineTo(80, 0); ctx.closePath(); ctx.fillStyle = '#f4f1ea'; ctx.fill(); O(ctx);
    C(ctx, 0, -280, 45, '#5ab8ff', 8); R(ctx, -80, -40, 160, 40, 6, '#e8505b');
  },
  estrella(ctx, t) { ctx.translate(0, -200); ctx.rotate(Math.sin(t * 2) * 0.15); const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 90 : 200; pts.push([Math.cos(a) * r, Math.sin(a) * r]); } P(ctx, pts, '#ffd166'); EYE(ctx, -35, -10, 14); EYE(ctx, 35, -10, 14); },
  meteorito(ctx, t) { for (let i = 0; i < 4; i++) L(ctx, [[60 + i * 30, -260 - i * 20], [330 + i * 40, -460 - i * 40]], i % 2 ? '#ffd166' : '#ff8a5b', 20 - i * 3); C(ctx, 0, -200, 150, '#8d7b6a'); for (const [x, y, r] of [[-50, -230, 30], [50, -150, 24], [30, -270, 18]]) C(ctx, x, y, r, '#6b5d50', 5); },
  ovni(ctx, t) { const b = Math.sin(t * 3) * 14; ctx.translate(0, b); ctx.globalAlpha = 0.5; P(ctx, [[-60, -200], [60, -200], [180, 0], [-180, 0]], '#c8ffb0', 0); ctx.globalAlpha = 1; E(ctx, 0, -300, 120, 90, '#9fe7ff'); E(ctx, 0, -230, 260, 70, '#9aa6b2'); for (let i = 0; i < 5; i++) C(ctx, -180 + i * 90, -225, 14, i % 2 ? '#ffd166' : '#ff8fab', 4); },
  volcan(ctx, t) { P(ctx, [[-300, 0], [-80, -380], [80, -380], [300, 0]], '#8d6e63'); P(ctx, [[-80, -380], [80, -380], [50, -330], [10, -360], [-30, -320]], '#ff7043', 7); for (let i = 0; i < 6; i++) { const k = (t * 1.2 + i / 6) % 1; C(ctx, -40 + i * 16, -400 - k * 260, 26 * (1 - k) + 6, k < 0.5 ? '#ff7043' : '#9e9e9e', 4); } },
  arbol(ctx, t) { R(ctx, -40, -260, 80, 260, 16, '#8b5a2b'); for (const [x, y, r] of [[0, -420, 150], [-120, -330, 110], [120, -330, 110]]) C(ctx, x + Math.sin(t + x) * 4, y, r, '#4caf50'); },
  fuego(ctx, t) { for (const [c, s] of [['#ff7043', 1], ['#ffb347', 0.7], ['#ffe08a', 0.4]]) { const f = Math.sin(t * 9) * 12 * s; ctx.beginPath(); ctx.moveTo(-150 * s, 0); ctx.quadraticCurveTo(-200 * s, -200 * s, -40 * s + f, -400 * s); ctx.quadraticCurveTo(-20 * s, -250 * s, 40 * s, -300 * s); ctx.quadraticCurveTo(220 * s - f, -180 * s, 150 * s, 0); ctx.closePath(); ctx.fillStyle = c; ctx.fill(); O(ctx, s === 1 ? 9 : 0); } },
  rayo(ctx, t) { if (Math.floor(t * 6) % 3 === 0) ctx.globalAlpha = 0.4; P(ctx, [[30, -460], [-110, -200], [0, -200], [-60, 0], [130, -280], [20, -280], [100, -460]], '#ffe14d'); ctx.globalAlpha = 1; },
  gota(ctx, t) { const b = Math.sin(t * 3) * 8; ctx.beginPath(); ctx.moveTo(0, -420 + b); ctx.bezierCurveTo(140, -200, 150, -30, 0, -30); ctx.bezierCurveTo(-150, -30, -140, -200, 0, -420 + b); ctx.fillStyle = '#5ab8ff'; ctx.fill(); O(ctx); E(ctx, -50, -150, 26, 40, 'rgba(255,255,255,0.7)', 0, 0); },
  nube(ctx, t) { const d = Math.sin(t) * 10; for (const [x, y, r] of [[-120, -150, 90], [0, -210, 120], [120, -150, 90]]) C(ctx, x + d, y, r, '#ffffff'); R(ctx, -200 + d, -170, 400, 110, 50, '#ffffff', 0); },
  hielo(ctx) { R(ctx, -150, -300, 300, 300, 40, 'rgba(190,235,255,0.95)'); E(ctx, -70, -220, 30, 60, 'rgba(255,255,255,0.8)', 0.4, 0); },
  // ---------------- Vehículos ----------------
  coche_rojo(ctx, t) { const b = Math.sin(t * 10) * 3; R(ctx, -260, -170 + b, 520, 120, 40, '#e8505b'); P(ctx, [[-150, -170 + b], [-90, -280 + b], [110, -280 + b], [170, -170 + b]], '#e8505b'); P(ctx, [[-120, -175 + b], [-75, -255 + b], [20, -255 + b], [20, -175 + b]], '#bfe6ff', 6); P(ctx, [[40, -175 + b], [40, -255 + b], [100, -255 + b], [140, -175 + b]], '#bfe6ff', 6); for (const x of [-150, 150]) { C(ctx, x, -50, 60, '#2b2f3a'); C(ctx, x, -50, 24, '#9aa6b2', 5); } },
  avion(ctx, t) { ctx.translate(0, Math.sin(t * 2) * 10); E(ctx, 0, -220, 320, 70, '#f4f1ea'); P(ctx, [[-60, -220], [60, -220], [-40, -60], [-120, -60]], '#5ab8ff'); P(ctx, [[220, -230], [300, -230], [330, -380], [280, -380]], '#5ab8ff'); for (let i = 0; i < 6; i++) C(ctx, -200 + i * 60, -235, 14, '#5ab8ff', 4); P(ctx, [[-320, -220], [-270, -260], [-270, -180]], '#cfd8e3', 6); },
  barco(ctx, t) { ctx.rotate(Math.sin(t * 1.5) * 0.04); P(ctx, [[-300, -160], [300, -160], [220, 0], [-220, 0]], '#e8505b'); R(ctx, -150, -300, 260, 140, 10, '#f4f1ea'); for (let i = 0; i < 3; i++) C(ctx, -100 + i * 80, -230, 22, '#5ab8ff', 5); R(ctx, 40, -400, 60, 100, 8, '#2b2f3a'); },
  submarino(ctx, t) { ctx.translate(0, Math.sin(t * 1.5) * 10); E(ctx, 0, -200, 300, 120, '#ffd166'); R(ctx, -60, -380, 140, 90, 20, '#ffd166'); L(ctx, [[30, -380], [30, -440], [80, -440]], '#9aa6b2', 12); for (let i = 0; i < 3; i++) C(ctx, -150 + i * 110, -200, 34, '#5ab8ff', 7); P(ctx, [[280, -200], [360, -280], [360, -120]], '#f0ad4e'); },
  bicicleta(ctx, t) { for (const x of [-170, 170]) { ctx.beginPath(); ctx.arc(x, -120, 110, 0, 7); O(ctx, 14); } L(ctx, [[-170, -120], [-30, -260], [120, -260], [170, -120]], '#e8505b', 14); L(ctx, [[-30, -260], [0, -120], [120, -260]], '#e8505b', 14); L(ctx, [[120, -260], [110, -320], [160, -330]], '#2b2f3a', 10); R(ctx, -80, -300, 110, 26, 12, '#2b2f3a', 6); },
  tren(ctx, t) { R(ctx, -320, -330, 420, 260, 20, '#5ab8ff'); R(ctx, 100, -250, 220, 180, 20, '#e8505b'); R(ctx, 160, -380, 70, 130, 10, '#2b2f3a'); for (let i = 0; i < 3; i++) R(ctx, -290 + i * 130, -300, 90, 90, 10, '#e6f7ff', 6); for (const x of [-250, -60, 180, 280]) C(ctx, x, -60, 55, '#2b2f3a'); for (let i = 0; i < 3; i++) { const k = (t + i / 3) % 1; C(ctx, 195 - k * 40, -400 - k * 140, 30 + k * 30, 'rgba(230,230,230,0.9)', 4); } },
  helicoptero(ctx, t) { L(ctx, [[-260, -380], [260, -380]], '#2b2f3a', 10 + Math.abs(Math.sin(t * 30)) * 6); L(ctx, [[0, -380], [0, -320]], '#2b2f3a', 10); E(ctx, -40, -230, 170, 110, '#6fcf97'); E(ctx, -90, -250, 80, 60, '#bfe6ff', 0, 7); L(ctx, [[120, -230], [330, -270]], '#6fcf97', 30); L(ctx, [[-150, -100], [100, -100]], '#2b2f3a', 10); },
  // ---------------- Comida ----------------
  hamburguesa(ctx) { E(ctx, 0, -340, 220, 110, '#f0ad4e'); for (let i = 0; i < 6; i++) E(ctx, -120 + i * 48, -380 + (i % 2) * 20, 8, 4, '#fff', 0.5, 0); P(ctx, [[-230, -260], [230, -260], [200, -220], [-200, -220]], '#6fcf97'); R(ctx, -220, -250, 440, 70, 30, '#8b4a2b'); R(ctx, -230, -190, 460, 30, 14, '#ffd166'); R(ctx, -210, -160, 420, 110, 50, '#f0ad4e'); },
  pizza(ctx) { P(ctx, [[0, -20], [-220, -400], [220, -400]], '#ffd166'); R(ctx, -240, -440, 480, 60, 30, '#e0a142'); for (const [x, y] of [[-60, -320], [60, -300], [0, -200], [-100, -380], [110, -380]]) C(ctx, x, y, 28, '#e8505b', 5); },
  manzana(ctx) { ctx.beginPath(); ctx.moveTo(0, -330); ctx.bezierCurveTo(-120, -420, -260, -300, -200, -150); ctx.bezierCurveTo(-160, -30, -60, -10, 0, -50); ctx.bezierCurveTo(60, -10, 160, -30, 200, -150); ctx.bezierCurveTo(260, -300, 120, -420, 0, -330); ctx.fillStyle = '#e8505b'; ctx.fill(); O(ctx); R(ctx, -10, -420, 20, 80, 8, '#8b5a2b', 5); E(ctx, 50, -410, 60, 26, '#6fcf97', -0.5); },
  platano(ctx) { ctx.beginPath(); ctx.moveTo(-200, -320); ctx.quadraticCurveTo(-120, -20, 220, -120); ctx.quadraticCurveTo(-60, -110, -140, -330); ctx.closePath(); ctx.fillStyle = '#ffe14d'; ctx.fill(); O(ctx); },
  vaso_agua(ctx, t) { P(ctx, [[-130, -400], [130, -400], [100, 0], [-100, 0]], 'rgba(220,240,255,0.9)'); P(ctx, [[-118, -300 + Math.sin(t * 3) * 6], [118, -300 - Math.sin(t * 3) * 6], [100, 0], [-100, 0]], '#7fc8ff', 0); },
  cafe(ctx, t) { R(ctx, -130, -260, 260, 260, 30, '#ffffff'); ctx.beginPath(); ctx.arc(150, -140, 60, -1.3, 1.3); O(ctx, 14); E(ctx, 0, -258, 120, 26, '#6b4f3a', 0, 5); for (let i = 0; i < 3; i++) { const y = -300 - ((t * 60 + i * 40) % 120); ctx.beginPath(); ctx.moveTo(-50 + i * 50, y); ctx.quadraticCurveTo(-30 + i * 50, y - 30, -50 + i * 50, y - 60); O(ctx, 6); } },
  chocolate(ctx) { R(ctx, -150, -400, 300, 400, 16, '#6b3e26'); for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) R(ctx, -130 + i * 90, -380 + j * 95, 80, 85, 8, '#7d4a2f', 5); },
  huevo(ctx) { E(ctx, 0, -200, 150, 200, '#fffaf0'); },
  // ---------------- Objetos e historia ----------------
  castillo(ctx) { R(ctx, -260, -320, 520, 320, 6, '#b0a99a'); for (const x of [-300, 200]) { R(ctx, x, -460, 100, 460, 6, '#a39c8c'); P(ctx, [[x - 10, -460], [x + 50, -560], [x + 110, -460]], '#e8505b'); } for (let i = 0; i < 6; i++) R(ctx, -250 + i * 90, -360, 50, 40, 4, '#b0a99a', 6); R(ctx, -60, -180, 120, 180, 60, '#6b4f3a'); },
  piramide(ctx) { P(ctx, [[-340, 0], [0, -420], [340, 0]], '#e8c07a'); P(ctx, [[0, -420], [340, 0], [120, 0]], '#d4a85e'); for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-340 + i * 57, -i * 70); ctx.lineTo(340 - i * 57, -i * 70); O(ctx, 4); } },
  espada(ctx) { P(ctx, [[-30, -150], [30, -150], [20, -480], [0, -520], [-20, -480]], '#dfe6ee'); R(ctx, -110, -170, 220, 30, 10, '#c9a24a'); R(ctx, -22, -140, 44, 120, 10, '#6b4f3a'); C(ctx, 0, -15, 26, '#c9a24a'); },
  corona(ctx) { P(ctx, [[-200, -60], [-200, -320], [-110, -200], [0, -360], [110, -200], [200, -320], [200, -60]], '#ffd166'); for (const x of [-110, 0, 110]) C(ctx, x, -120, 24, ['#e8505b', '#5ab8ff', '#6fcf97'][(x / 110 + 1) | 0], 6); },
  cofre(ctx, t) { R(ctx, -230, -230, 460, 230, 16, '#a0622d'); ctx.beginPath(); ctx.moveTo(-230, -230); ctx.quadraticCurveTo(0, -380, 230, -230); ctx.closePath(); ctx.fillStyle = '#b5713a'; ctx.fill(); O(ctx); R(ctx, -40, -260, 80, 90, 10, '#ffd166', 6); for (let i = 0; i < 5; i++) C(ctx, -150 + i * 75, -250 - Math.abs(Math.sin(t * 2 + i)) * 20, 26, '#ffd166', 5); },
  diamante(ctx, t) { P(ctx, [[-180, -300], [180, -300], [0, -20]], '#8fe3ff'); P(ctx, [[-180, -300], [-100, -400], [100, -400], [180, -300]], '#bff0ff'); if (Math.sin(t * 4) > 0.6) { ctx.beginPath(); ctx.moveTo(120, -460); ctx.lineTo(120, -380); ctx.moveTo(80, -420); ctx.lineTo(160, -420); O(ctx, 6); } },
  lingote(ctx) { for (const [x, y] of [[-140, 0], [140, 0], [0, -140]]) P(ctx, [[x - 150, y], [x + 150, y], [x + 110, y - 130], [x - 110, y - 130]], '#ffcc33'); },
  bolsa_dinero(ctx) { ctx.beginPath(); ctx.moveTo(-60, -380); ctx.quadraticCurveTo(-260, -200, -200, -40); ctx.quadraticCurveTo(0, 20, 200, -40); ctx.quadraticCurveTo(260, -200, 60, -380); ctx.closePath(); ctx.fillStyle = '#c9a26b'; ctx.fill(); O(ctx); R(ctx, -80, -420, 160, 50, 20, '#a07a45'); ctx.font = '700 160px Poppins'; ctx.textAlign = 'center'; ctx.fillStyle = INK; ctx.fillText('€', 0, -110); },
  bombilla(ctx, t) { C(ctx, 0, -300, 160, '#ffe14d'); R(ctx, -70, -170, 140, 120, 20, '#9aa6b2'); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + t; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 200, -300 + Math.sin(a) * 200); ctx.lineTo(Math.cos(a) * 250, -300 + Math.sin(a) * 250); O(ctx, 8); } },
  lupa(ctx) { L(ctx, [[90, -170], [230, -30]], '#8b5a2b', 40); C(ctx, 0, -260, 150, 'rgba(190,230,255,0.7)', 26); },
  reloj_arena(ctx, t) { R(ctx, -170, -440, 340, 40, 12, '#a0622d'); R(ctx, -170, -40, 340, 40, 12, '#a0622d'); P(ctx, [[-130, -400], [130, -400], [10, -220], [130, -40], [-130, -40], [-10, -220]], 'rgba(220,240,255,0.8)'); const k = (t * 0.3) % 1; P(ctx, [[-110 + k * 100, -380 + k * 150], [110 - k * 100, -380 + k * 150], [0, -230]], '#ffd166', 0); P(ctx, [[-100 * k - 20, -50], [100 * k + 20, -50], [0, -50 - 120 * k]], '#ffd166', 0); },
  bomba(ctx, t) { C(ctx, 0, -180, 160, '#2b2f3a'); R(ctx, -40, -380, 80, 60, 10, '#555'); L(ctx, [[0, -380], [60, -440], [120, -430]], '#c9a24a', 8); C(ctx, 120 + Math.sin(t * 20) * 6, -430, 22, '#ffb347', 0); },
  trofeo(ctx) { R(ctx, -130, -60, 260, 60, 10, '#a0622d'); R(ctx, -30, -160, 60, 110, 10, '#ffd166'); ctx.beginPath(); ctx.moveTo(-170, -420); ctx.lineTo(170, -420); ctx.quadraticCurveTo(170, -160, 0, -160); ctx.quadraticCurveTo(-170, -160, -170, -420); ctx.fillStyle = '#ffd166'; ctx.fill(); O(ctx); for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * 200, -330, 60, s > 0 ? -1.6 : 1.6, s > 0 ? 1.6 : 4.7); O(ctx, 14); } },
  medalla(ctx) { P(ctx, [[-90, -460], [0, -300], [90, -460]], '#e8505b'); C(ctx, 0, -200, 140, '#ffd166'); ctx.font = '800 130px Poppins'; ctx.textAlign = 'center'; ctx.fillStyle = INK; ctx.fillText('1', 0, -150); },
  regalo(ctx) { R(ctx, -200, -320, 400, 320, 14, '#e8505b'); R(ctx, -30, -320, 60, 320, 0, '#ffd166', 6); R(ctx, -220, -360, 440, 70, 14, '#e8505b'); ctx.beginPath(); ctx.ellipse(-60, -400, 70, 40, 0.4, 0, 7); ctx.ellipse(60, -400, 70, 40, -0.4, 0, 7); O(ctx, 12); },
  ordenador(ctx) { R(ctx, -260, -440, 520, 330, 20, '#2b2f3a'); R(ctx, -230, -410, 460, 270, 10, '#6ad1ff', 0); R(ctx, -40, -110, 80, 70, 6, '#2b2f3a'); R(ctx, -180, -50, 360, 40, 12, '#9aa6b2'); },
  robot(ctx, t) { R(ctx, -150, -340, 300, 260, 30, '#9aa6b2'); R(ctx, -110, -520, 220, 170, 30, '#cfd8e3'); C(ctx, -50, -440, 26, Math.sin(t * 3) > 0.9 ? INK : '#6ad1ff'); C(ctx, 50, -440, 26, '#6ad1ff'); L(ctx, [[0, -520], [0, -580]], '#9aa6b2', 10); C(ctx, 0, -590, 18, '#e8505b', 6); for (const s of [-1, 1]) L(ctx, [[s * 150, -300], [s * 230, -200 + Math.sin(t * 3) * 20 * s]], '#9aa6b2', 30); R(ctx, -120, -80, 80, 80, 10, '#7a8592'); R(ctx, 40, -80, 80, 80, 10, '#7a8592'); },
  telescopio(ctx) { L(ctx, [[0, -200], [-120, 0]], '#8b5a2b', 14); L(ctx, [[0, -200], [120, 0]], '#8b5a2b', 14); ctx.save(); ctx.translate(0, -230); ctx.rotate(-0.5); R(ctx, -200, -50, 400, 100, 30, '#5ab8ff'); R(ctx, 160, -60, 60, 120, 12, '#2b2f3a'); ctx.restore(); },
  microscopio(ctx) { R(ctx, -180, -50, 360, 50, 16, '#2b2f3a'); L(ctx, [[60, -50], [60, -300], [-20, -380]], '#9aa6b2', 40); ctx.save(); ctx.translate(-40, -330); ctx.rotate(-0.6); R(ctx, -40, -140, 80, 200, 16, '#f4f1ea'); ctx.restore(); R(ctx, -150, -170, 220, 26, 8, '#9aa6b2'); },
  jeringa(ctx) { ctx.rotate(-0.6); R(ctx, -60, -380, 120, 300, 16, 'rgba(220,240,255,0.95)'); R(ctx, -58, -240, 116, 160, 10, '#ff8fab', 0); R(ctx, -100, -400, 200, 30, 10, '#9aa6b2'); L(ctx, [[0, -80], [0, 20]], '#9aa6b2', 6); },
  pastilla(ctx) { ctx.translate(0, -200); ctx.rotate(-0.5); R(ctx, -200, -80, 400, 160, 80, '#e8505b'); ctx.beginPath(); ctx.roundRect(0, -80, 200, 160, [0, 80, 80, 0]); ctx.fillStyle = '#ffffff'; ctx.fill(); O(ctx); },
  calavera(ctx) { C(ctx, 0, -270, 170, '#f4f1ea'); R(ctx, -90, -160, 180, 130, 30, '#f4f1ea'); C(ctx, -65, -280, 48, INK, 0); C(ctx, 65, -280, 48, INK, 0); P(ctx, [[-16, -200], [16, -200], [0, -230]], INK, 0); for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-60 + i * 40, -110); ctx.lineTo(-60 + i * 40, -60); O(ctx, 5); } },
  llave_antigua(ctx) { C(ctx, 0, -360, 90, 'rgba(0,0,0,0)', 24); ctx.strokeStyle = '#ffcc33'; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(0, -360, 90, 0, 7); ctx.stroke(); R(ctx, -22, -280, 44, 280, 10, '#ffcc33'); R(ctx, 20, -90, 80, 30, 6, '#ffcc33'); R(ctx, 20, -40, 60, 30, 6, '#ffcc33'); },
  carta(ctx) { R(ctx, -230, -300, 460, 300, 16, '#fffaf0'); P(ctx, [[-230, -300], [0, -130], [230, -300]], '#f2e6cc'); C(ctx, 0, -150, 34, '#e8505b', 6); },
  telefono_antiguo(ctx) { R(ctx, -180, -220, 360, 220, 30, '#e8505b'); R(ctx, -230, -320, 460, 90, 45, '#e8505b'); C(ctx, 0, -120, 70, '#fffaf0'); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; C(ctx, Math.cos(a) * 45, -120 + Math.sin(a) * 45, 9, INK, 0); } },
  dinero_billete(ctx) { R(ctx, -260, -180, 520, 240, 14, '#8fd18b'); C(ctx, 0, -60, 70, '#4e9a52'); ctx.font = '800 110px Poppins'; ctx.textAlign = 'center'; ctx.fillStyle = '#e8f7e6'; ctx.fillText('€', 0, -22); },
  casa(ctx) { R(ctx, -230, -300, 460, 300, 6, '#ffd166'); P(ctx, [[-280, -290], [0, -500], [280, -290]], '#e8505b'); R(ctx, -50, -170, 100, 170, 10, '#8b5a2b'); for (const x of [-170, 90]) R(ctx, x, -240, 80, 80, 8, '#bfe6ff', 7); },
  edificio(ctx, t) { R(ctx, -170, -620, 340, 620, 6, '#7aa2c8'); for (let y = -580; y < -40; y += 80) for (let x = -140; x < 140; x += 70) R(ctx, x, y, 44, 50, 4, '#e6f7ff', 4); },
  montana_pieza(ctx) { P(ctx, [[-360, 0], [-60, -440], [240, 0]], '#8ea6c8'); P(ctx, [[-60, -440], [-150, -310], [-90, -330], [-40, -300], [30, -340]], '#ffffff', 6); },
};
export const PROP_NAMES = Object.keys(PROPS);
const ALIAS = { dino: 'dinosaurio', tiranosaurio: 'dinosaurio', 't-rex': 'dinosaurio', trex: 'dinosaurio', can: 'perro', tiburón: 'tiburon', 'pájaro': 'pajaro', ave: 'pajaro', 'león': 'leon',
  'corazón': 'corazon', 'célula': 'celula', 'adn': 'adn', bacteria: 'virus', microbio: 'virus', germen: 'virus', 'volcán': 'volcan', 'árbol': 'arbol', coche: 'coche_rojo', auto: 'coche_rojo', 'avión': 'avion',
  'helicóptero': 'helicoptero', agua: 'vaso_agua', vaso: 'vaso_agua', 'café': 'cafe', 'pirámide': 'piramide', tesoro: 'cofre', oro: 'lingote', dinero: 'bolsa_dinero', billete: 'dinero_billete',
  idea: 'bombilla', 'reloj de arena': 'reloj_arena', reloj_de_arena: 'reloj_arena', medicina: 'pastilla', vacuna: 'jeringa', llave: 'llave_antigua', 'teléfono': 'telefono_antiguo', 'montaña': 'montana_pieza', montana: 'montana_pieza',
  asteroide: 'meteorito', cometa: 'meteorito', 'ovni': 'ovni', marte: 'planeta', saturno: 'planeta', 'júpiter': 'planeta', planeta_tierra: 'tierra', mundo: 'tierra' };
export function propName(n) { const k = String(n || '').toLowerCase().trim(); return PROPS[k] ? k : (ALIAS[k] || null); }
