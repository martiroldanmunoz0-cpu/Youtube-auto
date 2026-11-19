import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import fs from 'node:fs';
GlobalFonts.registerFromPath('/home/user/shorts-factory/assets/fonts/Poppins-Bold.ttf', 'Poppins');
const S = 800, out = '/home/user/shorts-factory/assets/branding/';
const AMBER = '#ffb35c';
function radial(x, ctx, cx, cy, r, c0, c1) { const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, c0); g.addColorStop(1, c1); ctx.fillStyle = g; ctx.fillRect(0, 0, S, S); }
function base(ctx, glow = 'rgba(255,179,92,0.35)') {
  const g = ctx.createRadialGradient(S/2, S/2, 50, S/2, S/2, S*0.72); g.addColorStop(0, '#1b2140'); g.addColorStop(1, '#05060c');
  ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
  for (let i = 0; i < 90; i++) { const a = (i * 137.5) % 360, r = 120 + (i * 53) % 280; ctx.fillStyle = `rgba(255,255,255,${0.15 + (i % 5) * 0.08})`; ctx.beginPath(); ctx.arc(S/2 + Math.cos(a) * r, S/2 + Math.sin(a) * r, 1 + (i % 3) * 0.7, 0, 7); ctx.fill(); }
  const h = ctx.createRadialGradient(S/2, S/2, 0, S/2, S/2, 330); h.addColorStop(0, glow); h.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = h; ctx.fillRect(0, 0, S, S);
}
function save(c, name) { fs.writeFileSync(out + name, c.encodeSync('png')); }

// 1) Bombilla con signo de interrogación
{ const c = createCanvas(S, S), ctx = c.getContext('2d'); base(ctx);
  ctx.save(); ctx.shadowColor = AMBER; ctx.shadowBlur = 80;
  ctx.fillStyle = '#ffd99a'; ctx.beginPath(); ctx.arc(400, 350, 175, Math.PI * 0.82, Math.PI * 2.18); ctx.lineTo(470, 560); ctx.lineTo(330, 560); ctx.closePath(); ctx.fill(); ctx.restore();
  const g = ctx.createRadialGradient(360, 290, 20, 400, 360, 230); g.addColorStop(0, '#fff6e0'); g.addColorStop(1, '#ffb35c');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(400, 350, 165, Math.PI * 0.82, Math.PI * 2.18); ctx.lineTo(465, 552); ctx.lineTo(335, 552); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#8f96a8'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.roundRect(325, 565 + i * 34, 150, 26, 12); ctx.fill(); }
  ctx.fillStyle = '#5b6276'; ctx.beginPath(); ctx.roundRect(355, 667, 90, 26, 13); ctx.fill();
  ctx.fillStyle = '#1b2140'; ctx.font = '700 230px Poppins'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 402, 372);
  save(c, 'perfil_1_bombilla.png'); }

// 2) Luna creciente formando una C + estrella
{ const c = createCanvas(S, S), ctx = c.getContext('2d'); base(ctx, 'rgba(255,179,92,0.25)');
  const moon = createCanvas(S, S), m = moon.getContext('2d');
  const g = m.createLinearGradient(200, 150, 560, 650); g.addColorStop(0, '#fff1c9'); g.addColorStop(1, '#ff9f45');
  m.fillStyle = g; m.beginPath(); m.arc(390, 400, 240, 0, Math.PI * 2); m.fill();
  m.globalCompositeOperation = 'destination-out'; m.beginPath(); m.arc(495, 345, 210, 0, Math.PI * 2); m.fill();
  ctx.save(); ctx.shadowColor = AMBER; ctx.shadowBlur = 70; ctx.drawImage(moon, 0, 0); ctx.restore();
  // estrella
  ctx.save(); ctx.translate(540, 360); ctx.shadowColor = '#fff'; ctx.shadowBlur = 40; ctx.fillStyle = '#fffbe8';
  ctx.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? 22 : 80, a = (i / 8) * Math.PI * 2 - Math.PI / 2; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); ctx.restore();
  save(c, 'perfil_2_luna.png'); }

// 3) Lupa con un planeta dentro
{ const c = createCanvas(S, S), ctx = c.getContext('2d'); base(ctx);
  ctx.save(); ctx.translate(370, 360);
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 175, 0, 7); ctx.clip();
  const sky = ctx.createRadialGradient(0, 0, 10, 0, 0, 180); sky.addColorStop(0, '#2b3770'); sky.addColorStop(1, '#0d1330'); ctx.fillStyle = sky; ctx.fillRect(-200, -200, 400, 400);
  const pg = ctx.createRadialGradient(-40, -40, 10, 0, 0, 90); pg.addColorStop(0, '#fff3d0'); pg.addColorStop(0.3, '#ffb35c'); pg.addColorStop(1, '#a8512a');
  ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(0, 10, 85, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(255,228,180,0.85)'; ctx.lineWidth = 14; ctx.beginPath(); ctx.ellipse(0, 10, 150, 38, -0.3, 0.15, Math.PI - 0.15); ctx.stroke();
  for (let i = 0; i < 20; i++) { ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(-160 + (i * 61) % 320, -160 + (i * 97) % 320, 3, 3); }
  ctx.restore();
  ctx.shadowColor = AMBER; ctx.shadowBlur = 50; ctx.strokeStyle = '#ffcf8a'; ctx.lineWidth = 34; ctx.beginPath(); ctx.arc(0, 0, 190, 0, 7); ctx.stroke();
  ctx.shadowBlur = 0; ctx.lineCap = 'round'; ctx.strokeStyle = '#d98a3c'; ctx.lineWidth = 60; ctx.beginPath(); ctx.moveTo(140, 140); ctx.lineTo(265, 265); ctx.stroke();
  ctx.restore();
  save(c, 'perfil_3_lupa.png'); }

// Hoja de comparación (recorte circular como en YouTube)
{ const names = ['perfil_1_bombilla.png', 'perfil_2_luna.png', 'perfil_3_lupa.png'];
  const { loadImage } = await import('@napi-rs/canvas');
  const sheet = createCanvas(3 * 420 + 40, 520), x = sheet.getContext('2d');
  x.fillStyle = '#f2f2f2'; x.fillRect(0, 0, sheet.width, sheet.height);
  for (let i = 0; i < 3; i++) {
    const img = await loadImage(out + names[i]);
    x.save(); x.beginPath(); x.arc(220 + i * 420, 220, 190, 0, 7); x.clip(); x.drawImage(img, 30 + i * 420, 30, 380, 380); x.restore();
    x.fillStyle = '#222'; x.font = '700 30px Poppins'; x.textAlign = 'center'; x.fillText(`Opción ${i + 1}`, 220 + i * 420, 460);
    x.font = '700 22px Poppins'; x.fillStyle = '#666'; x.fillText(['Bombilla «?»', 'Luna «C» + estrella', 'Lupa + planeta'][i], 220 + i * 420, 495);
  }
  fs.writeFileSync(out + 'comparativa.png', sheet.encodeSync('png'));
}
console.log('ok');
