// Persona del narrador / protagonista: distinta en cada vídeo (según su id) y la misma dentro del vídeo.
// Así las portadas y los vídeos del canal no tienen siempre la misma cara.
import { rng } from './util.mjs';

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
