// Persona del narrador / protagonista: distinta en cada vídeo (según su id) y la misma dentro del vídeo.
// Así las portadas y los vídeos del canal no tienen siempre la misma cara.
import { rng, rr } from './util.mjs';
import { drawEyes, blinkAt } from './parts.mjs';

const SKINS = [
  { light: '#f6d3b3', dark: '#d29a72', ear: '#d9a07a', neck: '#c98e66' },
  { light: '#e8b48a', dark: '#b97a50', ear: '#c18559', neck: '#a96f47' },
  { light: '#c98d60', dark: '#8a5434', ear: '#94603c', neck: '#7c4c2e' },
  { light: '#b47a52', dark: '#6e4229', ear: '#7e4c30', neck: '#5f3922' },
  { light: '#8a5636', dark: '#4a2a18', ear: '#5a331e', neck: '#40251a' },
];
const HAIR_STYLES = ['short', 'long', 'curly', 'buzz', 'bald', 'ponytail', 'afro', 'side', 'bun'];
const HAIR_COLORS = ['#1a100a', '#2b1a10', '#4a2c17', '#7a4a22', '#b07a3a', '#d8b46a', '#8c2e16', '#9a9a9a'];
const OUTFITS = ['#2b3a66', '#7a2333', '#1f5c4a', '#5b3a7a', '#a8571d', '#2f2f36', '#1d5c8c', '#6b6b20', '#8c3a6b', '#3d6b2f'];

export function personaFor(seed, override = {}) {
  const r = rng(`persona-${seed || 'x'}`);
  const pick = (a) => a[r.int(0, a.length - 1)];
  const hair = pick(HAIR_STYLES);
  const p = {
    skin: pick(SKINS),
    hair,
    hairColor: hair === 'bald' ? '#1a100a' : pick(HAIR_COLORS),
    outfit: pick(OUTFITS),
    glasses: r() < 0.28,
    beard: ['short', 'buzz', 'bald', 'side', 'curly'].includes(hair) && r() < 0.35,
    earrings: ['long', 'ponytail', 'bun', 'afro'].includes(hair) && r() < 0.5,
  };
  if (override.outfit) p.outfit = override.outfit;
  return p;
}

// ---- Parecido con personas reales: el guion describe a cada persona ("looks") y aquí se traduce ----
let LOOKS = {};
export function setLooks(looks) { LOOKS = {}; for (const [k, v] of Object.entries(looks || {})) LOOKS[String(k).toLowerCase()] = v || {}; }
const SKIN_BY = { muy_clara: 0, clara: 1, media: 2, morena: 3, oscura: 4 };
const HAIR_BY = { corto: 'short', largo: 'long', rizado: 'curly', rapado: 'buzz', calvo: 'bald', coleta: 'ponytail', afro: 'afro', raya: 'side', 'moño': 'bun', mono: 'bun', media_melena: 'long' };
const COLOR_BY = { negro: '#1a100a', castano_oscuro: '#2b1a10', 'castaño_oscuro': '#2b1a10', castano: '#4a2c17', 'castaño': '#4a2c17',
  castano_claro: '#7a4a22', 'castaño_claro': '#7a4a22', rubio: '#d8b46a', rubio_oscuro: '#b07a3a', pelirrojo: '#8c2e16', canoso: '#9a9a9a', blanco: '#e4e4e4' };
const OUTFIT_BY = { azul: '#2b3a66', rojo: '#7a2333', verde: '#1f5c4a', morado: '#5b3a7a', naranja: '#a8571d', negro: '#2f2f36',
  gris: '#5a5f6a', blanco: '#d9dde3', marron: '#5a3a24', 'marrón': '#5a3a24', amarillo: '#b8972a', granate: '#5e1a26', celeste: '#4a7fb0' };
function applyLook(p, L) {
  if (!L) return p;
  const q = { ...p };
  if (L.piel in SKIN_BY) q.skin = SKINS[SKIN_BY[L.piel]];
  if (HAIR_BY[L.pelo]) q.hair = HAIR_BY[L.pelo];
  if (COLOR_BY[L.color_pelo]) q.hairColor = COLOR_BY[L.color_pelo];
  else if (L.edad === 'mayor') q.hairColor = '#b5b5b5';
  if (L.ropa) q.outfit = OUTFIT_BY[String(L.ropa).toLowerCase()] || (/^#[0-9a-f]{6}$/i.test(L.ropa) ? L.ropa : q.outfit);
  if (typeof L.gafas === 'boolean') q.glasses = L.gafas;
  if (L.barba) { q.beard = ['corta', 'larga', 'si', 'sí'].includes(L.barba); q.mustache = L.barba === 'bigote'; }
  q.female = L.genero === 'mujer';
  if (q.female) { q.beard = false; q.mustache = false; if (L.pendientes !== false && !('pendientes' in L)) q.earrings = q.earrings || q.hair !== 'buzz'; }
  else if (L.genero === 'hombre' && !('pendientes' in L)) q.earrings = false;
  if (typeof L.pendientes === 'boolean') q.earrings = L.pendientes;
  q.old = L.edad === 'mayor';
  return q;
}

// Pelo de detrás (antes de dibujar la cabeza)
export function drawHairBack(ctx, cx, cy, p) {
  ctx.fillStyle = p.hairColor;
  if (p.hair === 'long') {
    ctx.beginPath();
    ctx.moveTo(cx - 250, cy - 60);
    ctx.quadraticCurveTo(cx - 300, cy + 260, cx - 230, cy + 420);
    ctx.lineTo(cx + 230, cy + 420);
    ctx.quadraticCurveTo(cx + 300, cy + 260, cx + 250, cy - 60);
    ctx.closePath(); ctx.fill();
  } else if (p.hair === 'afro') {
    for (let i = 0; i < 14; i++) {
      const a = Math.PI + (i / 13) * Math.PI;
      ctx.beginPath(); ctx.arc(cx + Math.cos(a) * 250, cy - 60 + Math.sin(a) * 270, 110, 0, 7); ctx.fill();
    }
    ctx.beginPath(); ctx.ellipse(cx, cy - 120, 320, 260, 0, 0, 7); ctx.fill();
  } else if (p.hair === 'ponytail') {
    ctx.beginPath(); ctx.ellipse(cx + 250, cy - 40, 70, 210, -0.35, 0, 7); ctx.fill();
  } else if (p.hair === 'bun') {
    ctx.beginPath(); ctx.arc(cx, cy - 330, 95, 0, 7); ctx.fill();
  }
}

// Pelo de delante (después de la cabeza)
export function drawHairFront(ctx, cx, cy, p) {
  ctx.fillStyle = p.hairColor;
  const cap = (top = -300, side = -20) => {
    ctx.beginPath();
    ctx.moveTo(cx - 240, cy + side);
    ctx.quadraticCurveTo(cx - 260, cy + top - 20, cx, cy + top);
    ctx.quadraticCurveTo(cx + 260, cy + top - 20, cx + 240, cy + side);
    ctx.quadraticCurveTo(cx + 200, cy - 180, cx + 40, cy - 190);
    ctx.quadraticCurveTo(cx - 120, cy - 200, cx - 240, cy + side);
    ctx.fill();
  };
  switch (p.hair) {
    case 'bald':
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.beginPath(); ctx.ellipse(cx - 70, cy - 200, 80, 40, -0.4, 0, 7); ctx.fill();
      break;
    case 'buzz':
      ctx.globalAlpha = 0.75; cap(-292, -60); ctx.globalAlpha = 1;
      break;
    case 'curly':
      for (let i = 0; i < 11; i++) {
        const a = Math.PI * 1.05 + (i / 10) * Math.PI * 0.9;
        ctx.beginPath(); ctx.arc(cx + Math.cos(a) * 215, cy - 40 + Math.sin(a) * 255, 70, 0, 7); ctx.fill();
      }
      break;
    case 'side':
      ctx.beginPath();
      ctx.moveTo(cx - 240, cy - 10);
      ctx.quadraticCurveTo(cx - 270, cy - 330, cx + 40, cy - 300);
      ctx.quadraticCurveTo(cx + 270, cy - 280, cx + 245, cy - 40);
      ctx.quadraticCurveTo(cx + 120, cy - 260, cx - 160, cy - 170);
      ctx.quadraticCurveTo(cx - 210, cy - 120, cx - 240, cy - 10);
      ctx.fill();
      break;
    case 'long': case 'ponytail': case 'bun':
      cap(-305, 30);
      break;
    case 'afro':
      cap(-310, -40);
      break;
    default:
      cap();
  }
}

export function drawBeard(ctx, cx, cy, p) {
  if (p.beard) {
    ctx.fillStyle = p.hairColor; ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.moveTo(cx - 215, cy + 60);
    ctx.quadraticCurveTo(cx - 190, cy + 300, cx, cy + 285);
    ctx.quadraticCurveTo(cx + 190, cy + 300, cx + 215, cy + 60);
    ctx.quadraticCurveTo(cx + 150, cy + 150, cx + 90, cy + 150);
    ctx.quadraticCurveTo(cx, cy + 130, cx - 90, cy + 150);
    ctx.quadraticCurveTo(cx - 150, cy + 150, cx - 215, cy + 60);
    ctx.fill(); ctx.globalAlpha = 1;
  }
}

export function drawFaceDetails(ctx, cx, cy, p) {
  if (p.mustache) {
    ctx.fillStyle = p.hairColor;
    ctx.beginPath(); ctx.moveTo(cx - 95, cy + 150); ctx.quadraticCurveTo(cx, cy + 105, cx + 95, cy + 150);
    ctx.quadraticCurveTo(cx, cy + 140, cx - 95, cy + 150); ctx.fill();
  }
  if (p.female) { // pestañas y labios
    ctx.strokeStyle = '#120a06'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) {
      const x0 = cx + sx * (115 + i * 16), y0 = cy - 52 + i * 4;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + sx * 18, y0 - 16); ctx.stroke();
    }
  }
  if (p.old) {
    ctx.strokeStyle = 'rgba(60,30,15,0.35)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (const y of [-150, -125]) { ctx.beginPath(); ctx.moveTo(cx - 90, cy + y); ctx.quadraticCurveTo(cx, cy + y - 10, cx + 90, cy + y); ctx.stroke(); }
    for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(cx + sx * 75, cy + 110); ctx.quadraticCurveTo(cx + sx * 100, cy + 150, cx + sx * 85, cy + 185); ctx.stroke(); }
  }
}

export function drawExtras(ctx, cx, cy, p) {
  if (p.earrings) {
    ctx.fillStyle = '#ffd36b';
    for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(cx + sx * 232, cy + 78, 13, 0, 7); ctx.fill(); }
  }
  if (p.glasses) {
    ctx.strokeStyle = '#111'; ctx.lineWidth = 10;
    for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(cx + sx * 88, cy - 18, 78, 62, 0, 0, 7); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(cx - 12, cy - 22); ctx.quadraticCurveTo(cx, cy - 34, cx + 12, cy - 22); ctx.stroke();
    ctx.fillStyle = 'rgba(180,220,255,0.10)';
    for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(cx + sx * 88, cy - 18, 72, 56, 0, 0, 7); ctx.fill(); }
  }
}

// Cabeza completa (pelo, cuello, cara, expresión). Centro de la cabeza en (cx, cy); cabeza de ~460x560 px.
// opts: { mood: neutral|happy|worried|shocked|angry|sad, t, blinkSeed, closed (ojos cerrados), neck (true) }
export function drawHead(ctx, cx, cy, who, { mood = 'neutral', t = 0, blinkSeed = 0, closed = false, neck = true } = {}) {
    drawHairBack(ctx, cx, cy, who);
    // Cuello
    if (neck) { ctx.fillStyle = who.skin.neck; rr(ctx, cx - 70, cy + 170, 140, 150, 40); ctx.fill(); }
    // Cabeza
    const hg = ctx.createRadialGradient(cx - 60, cy - 80, 40, cx, cy, 300);
    hg.addColorStop(0, who.skin.light); hg.addColorStop(1, who.skin.dark);
    ctx.fillStyle = hg;
    ctx.beginPath(); ctx.ellipse(cx, cy, 230, 280, 0, 0, Math.PI * 2); ctx.fill();
    // Orejas
    ctx.fillStyle = who.skin.ear;
    for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(cx + sx * 228, cy + 10, 34, 60, 0, 0, 7); ctx.fill(); }
    // Pelo
    drawHairFront(ctx, cx, cy, who);
    drawBeard(ctx, cx, cy, who);
    // Ojos (reutiliza los del retrovisor, más pequeños)
    const eyeMood = { neutral: 'calm', happy: 'calm', worried: 'sad', shocked: 'wide', angry: 'angry', sad: 'sad' }[mood] || 'calm';
    ctx.save(); ctx.translate(cx, cy - 20); ctx.scale(0.62, 0.62);
    drawEyes(ctx, 0, 0, 110, { mood: eyeMood, skin: who.skin.light, look: Math.sin(t * 0.7) * 0.25, blink: closed ? 1 : mood === 'shocked' ? 0 : blinkAt(t, blinkSeed) });
    ctx.restore();
    // Nariz
    ctx.strokeStyle = 'rgba(40,20,10,0.5)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx + 5, cy + 30); ctx.quadraticCurveTo(cx + 25, cy + 90, cx - 10, cy + 100); ctx.stroke();
    // Boca
    ctx.strokeStyle = who.female ? '#8a2a2a' : '#2a120a'; ctx.lineWidth = who.female ? 12 : 9;
    ctx.beginPath();
    if (mood === 'happy') { ctx.moveTo(cx - 80, cy + 160); ctx.quadraticCurveTo(cx, cy + 230, cx + 80, cy + 160); ctx.stroke(); }
    else if (mood === 'shocked') { ctx.fillStyle = '#2a0e08'; ctx.ellipse(cx, cy + 180, 36, 48 + Math.sin(t * 6) * 4, 0, 0, 7); ctx.fill(); }
    else if (mood === 'sad' || mood === 'worried') { ctx.moveTo(cx - 70, cy + 195); ctx.quadraticCurveTo(cx, cy + 150, cx + 70, cy + 195); ctx.stroke(); }
    else if (mood === 'angry') { ctx.moveTo(cx - 70, cy + 185); ctx.lineTo(cx + 70, cy + 175); ctx.stroke(); }
    else { ctx.moveTo(cx - 60, cy + 175); ctx.quadraticCurveTo(cx, cy + 190, cx + 60, cy + 175); ctx.stroke(); }
    drawFaceDetails(ctx, cx, cy, who);
    drawExtras(ctx, cx, cy, who);
    // Gota de sudor (preocupado)
    if (mood === 'worried' || mood === 'shocked') {
      const k = (t * 0.6) % 1;
      ctx.fillStyle = 'rgba(160,210,255,0.85)';
      ctx.beginPath(); ctx.ellipse(cx + 190, cy - 120 + k * 120, 14, 22, 0, 0, 7); ctx.fill();
    }
}

// Persona según "who": "protagonista" (o vacío) = la misma del vídeo en todas las escenas; cualquier otro nombre
// ("madre", "medico", "hija") = otra persona fija dentro del vídeo.
export function personaWho(seed, params = {}) {
  const who = String(params.who || 'protagonista').toLowerCase();
  const main = who === 'protagonista' || who === 'tu' || who === 'tú';
  const base = personaFor(main ? seed : `${seed}-${who}`, params);
  return applyLook(base, LOOKS[who] || (main ? LOOKS.protagonista : null));
}

const PANTS = ['#2a3a5c', '#1f2430', '#3b3b44', '#4a3a2a', '#28414a'];

// Cuerpo entero. (x, y) = centro de la cabeza; s = escala (1 = cabeza de 460 px). Mide ~2550*s de alto.
// opts: { mood, t, blinkSeed, arms: normal|none|up|cross, highlight: none|arms|legs|chest|heart|head|stomach, closed }
export function drawFullBody(ctx, x, y, s, who, opts = {}) {
  const { arms = 'normal', highlight = 'none', t = 0 } = opts;
  const pants = PANTS[Math.abs(hashCode(who.outfit + who.hair)) % PANTS.length];
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // Piernas y zapatos
  ctx.fillStyle = pants;
  rr(ctx, -200, 1250, 180, 1000, 60); ctx.fill();
  rr(ctx, 20, 1250, 180, 1000, 60); ctx.fill();
  ctx.fillStyle = '#15161c';
  rr(ctx, -230, 2200, 230, 90, 40); ctx.fill(); rr(ctx, 0, 2200, 230, 90, 40); ctx.fill();
  // Brazos (detrás del torso cuando cuelgan)
  const skin = who.skin.light, sleeve = who.outfit;
  const arm = (side, ang) => {
    ctx.save(); ctx.translate(side * 255, 380); ctx.rotate(ang);
    ctx.fillStyle = sleeve; rr(ctx, -70, -20, 140, 300, 60); ctx.fill();
    ctx.fillStyle = skin; rr(ctx, -58, 240, 116, 620, 55); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, 880, 72, 88, 0, 0, 7); ctx.fill();
    ctx.restore();
  };
  if (arms === 'normal') { arm(-1, 0.12 + Math.sin(t * 1.3) * 0.02); arm(1, -0.12 - Math.sin(t * 1.3) * 0.02); }
  // Torso
  ctx.fillStyle = who.outfit;
  ctx.beginPath();
  ctx.moveTo(-290, 420); ctx.quadraticCurveTo(-290, 300, -150, 290); ctx.lineTo(150, 290);
  ctx.quadraticCurveTo(290, 300, 290, 420); ctx.lineTo(240, 1300); ctx.lineTo(-240, 1300); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath(); ctx.moveTo(-90, 290); ctx.lineTo(0, 400); ctx.lineTo(90, 290); ctx.fill();
  ctx.fillStyle = '#2a1d14'; ctx.fillRect(-240, 1240, 480, 50);
  ctx.fillStyle = '#c9a24a'; rr(ctx, -35, 1240, 70, 50, 8); ctx.fill();
  if (arms === 'up') {
    for (const side of [-1, 1]) {
      ctx.save(); ctx.translate(side * 255, 380); ctx.rotate(side * 2.7 + Math.sin(t * 3) * 0.05 * side);
      ctx.fillStyle = sleeve; rr(ctx, -70, -20, 140, 300, 60); ctx.fill();
      ctx.fillStyle = skin; rr(ctx, -58, 240, 116, 620, 55); ctx.fill();
      ctx.beginPath(); ctx.ellipse(0, 880, 72, 88, 0, 0, 7); ctx.fill();
      ctx.restore();
    }
  } else if (arms === 'cross') {
    ctx.fillStyle = skin;
    rr(ctx, -260, 700, 520, 120, 60); ctx.fill();
    ctx.fillStyle = sleeve; rr(ctx, -300, 360, 130, 420, 60); ctx.fill(); rr(ctx, 170, 360, 130, 420, 60); ctx.fill();
  } else if (arms === 'none') {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    for (const side of [-1, 1]) { ctx.beginPath(); ctx.ellipse(side * 270, 420, 40, 90, 0, 0, 7); ctx.fill(); }
  }
  // Zona resaltada (lo que le pasa al cuerpo)
  if (highlight && highlight !== 'none') {
    const zones = { arms: [[-300, 800, 260], [300, 800, 260]], legs: [[-110, 1750, 300], [110, 1750, 300]], chest: [[0, 600, 300]],
      heart: [[-80, 560, 170]], head: [[0, 0, 360]], stomach: [[0, 1000, 260]] };
    const pulse = 0.55 + Math.sin(t * 5) * 0.25;
    for (const [zx, zy, zr] of zones[highlight] || []) {
      const g = ctx.createRadialGradient(zx, zy, 0, zx, zy, zr);
      g.addColorStop(0, `rgba(255,70,50,${0.75 * pulse})`); g.addColorStop(1, 'rgba(255,70,50,0)');
      ctx.fillStyle = g; ctx.fillRect(zx - zr, zy - zr, zr * 2, zr * 2);
    }
  }
  ctx.restore();
  // Cabeza (encima del cuello del torso)
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  drawHead(ctx, 0, 0, who, { mood: opts.mood, t, blinkSeed: opts.blinkSeed || 0, closed: opts.closed });
  ctx.restore();
}

function hashCode(str) { let h = 0; for (const c of str) h = (h * 31 + c.charCodeAt(0)) | 0; return h; }
