// COMPOSICIÓN: lugar + hora + hasta 4 piezas de la biblioteca (posición, tamaño, animación) + persona opcional.
// Así cada vídeo tiene escenas propias (un dinosaurio en la playa, un corazón gigante en la oficina, un tiburón bajo el mar...).
import { W, H, clamp, ease } from '../lib/util.mjs';
import { PROPS, propName } from '../lib/props.mjs';
import { drawPlace, midShot, grade, EXTERIOR, placeName, ambientFront } from './bright.mjs';
import { personaWho, drawFullBody } from '../lib/persona.mjs';
import { brightBg, INK } from '../lib/brightbg.mjs';

const POS = { izquierda: [270, 1560], centro: [540, 1560], derecha: [810, 1560], fondo: [540, 1180], arriba: [540, 760], 'arriba_izquierda': [280, 760], 'arriba_derecha': [800, 760] };
const SKY = new Set(['sol', 'luna', 'estrella', 'nube', 'avion', 'pajaro', 'helicoptero', 'ovni', 'meteorito', 'rayo', 'planeta', 'tierra']);
const SIZE = { pequeno: 0.55, 'pequeño': 0.55, mediano: 0.9, grande: 1.35, gigante: 2.2 };

function placeProp(ctx, item, t, dur, idx, noGround = false) {
  const name = propName(item.pieza || item.nombre || item.name);
  if (!name) return;
  let [x0, y0] = POS[item.pos || item.posicion] || POS.centro;
  if (noGround && y0 > 1300) y0 -= 330; // sin suelo (fondo liso, espacio): piezas más centradas
  let s = SIZE[item.tamano || item.tamaño || item.size] ?? item._defSize ?? 0.9;
  if ((item.pos || item.posicion) === 'fondo') s *= 0.7;
  const a = String(item.anim || item.animacion || 'crecer');
  const t0 = t - idx * 0.15; // las piezas aparecen una tras otra
  let x = x0, y = y0, rot = 0, sc = s, alpha = 1;
  const k = clamp(t0 / 0.5);
  if (a === 'caer') y = y0 - (1 - ease.out(k)) * 1400;
  else if (a === 'entrar_izq' || a === 'entrar') x = x0 - (1 - ease.out(clamp(t0 / 0.8))) * 1200;
  else if (a === 'entrar_der') x = x0 + (1 - ease.out(clamp(t0 / 0.8))) * 1200;
  else if (a === 'crecer') sc = s * ease.outBack(k);
  else if (a === 'flotar') { y = y0 + Math.sin(t * 2 + idx) * 25; sc = s * ease.outBack(k); }
  else if (a === 'temblar') { x = x0 + Math.sin(t * 40) * 10; y = y0 + Math.cos(t * 37) * 6; }
  else if (a === 'girar') { rot = t * 1.5; sc = s * ease.outBack(k); }
  else if (a === 'latir') sc = s * (1 + Math.max(0, Math.sin(t * 7)) * 0.08);
  else if (a === 'acercarse') sc = s * (0.5 + 0.5 * ease.inOut(clamp(t / Math.max(1, dur))));
  if (t0 < 0) return;
  // Vida después de aparecer: ninguna pieza se queda congelada (balanceo y respiración suaves)
  if (a !== 'temblar' && a !== 'girar') {
    const life = clamp((t0 - 0.5) / 0.4);
    y += Math.sin(t * 2.2 + idx * 1.9) * 14 * life;
    rot += Math.sin(t * 1.6 + idx) * 0.05 * life;
    sc *= 1 + Math.sin(t * 3 + idx) * 0.025 * life;
  }
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y);
  // sombra en el suelo
  if (y0 > 1300) { ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.beginPath(); ctx.ellipse(0, 8, 230 * sc, 30 * sc, 0, 0, 7); ctx.fill(); }
  if (rot) { ctx.translate(0, -200 * sc); ctx.rotate(rot); ctx.translate(0, 200 * sc); }
  ctx.scale(sc * (item.espejo ? -1 : 1), sc);
  try { PROPS[name](ctx, t); } catch (e) { /* una pieza rota no tumba la escena */ }
  ctx.restore();
}

export const composicion = {
  setup(p, r) { return { seed: r.int(0, 99) }; },
  draw(ctx, s, { t, dur, params, seed }) {
    const hora = ['dia', 'atardecer', 'noche'].includes(params.hora) ? params.hora : 'dia';
    const lugar = placeName(params.lugar || 'fondo');
    drawPlace(ctx, lugar, hora, t);
    let items = params.piezas || params.objetos || [];
    if (typeof items === 'string') { try { items = JSON.parse(items); } catch { items = items.split(/[,;]/); } }
    if (!Array.isArray(items)) items = [items];
    items = items.slice(0, 4).map((it) => (typeof it === 'string' ? { pieza: it.trim() } : it || {}))
      .filter((it) => { const ok = !!propName(it.pieza || it.nombre || it.name); if (!ok && !s.warned) console.error(`AVISO pieza desconocida: ${it.pieza || it.nombre || JSON.stringify(it)}`); return ok; });
    if (!items.length) { // nunca un fondo vacío: algo con sentido en su lugar
      if (!s.warned) { console.error('AVISO escena con error: composición sin piezas válidas'); s.warned = true; }
      items = [{ pieza: 'bombilla', tamano: 'grande', anim: 'flotar' }];
    }
    s.warned = true;
    const persona = params.persona || 'no';
    // Reparto automático de las piezas sin posición (para que no se amontonen)
    const conPersona = persona === 'medio' || persona === 'entero';
    const nSuelo = items.filter((it) => !SKY.has(propName(it.pieza || it.nombre))).length;
    const libres = conPersona ? ['derecha', 'fondo', 'izquierda'] : ({ 1: ['centro'], 2: ['izquierda', 'derecha'] }[nSuelo] || ['izquierda', 'derecha', 'fondo']);
    const libresCielo = conPersona ? ['arriba_derecha', 'arriba_izquierda', 'arriba'] : ['arriba', 'arriba_derecha', 'arriba_izquierda'];
    const usadas = new Set(items.map((it) => it.pos || it.posicion).filter(Boolean));
    let li = 0;
    items = items.map((it) => {
      if (it.pos || it.posicion) return it;
      if (SKY.has(propName(it.pieza || it.nombre))) {
        const pos = libresCielo.find((p) => !usadas.has(p)) || 'arriba'; usadas.add(pos);
        return { ...it, pos, _defSize: 0.7 };
      }
      while (li < libres.length - 1 && usadas.has(libres[li])) li++;
      const pos = libres[li++] || 'centro'; usadas.add(pos);
      return { ...it, pos, _defSize: nSuelo === 1 && !conPersona ? 1.35 : nSuelo >= 3 ? 0.85 : 0.95 };
    });
    const behind = items.filter((it) => (it.pos || it.posicion) === 'fondo' || (it.tamano || it.tamaño) === 'gigante' || String(it.pos || '').startsWith('arriba'));
    const front = items.filter((it) => !behind.includes(it));
    const noGround = lugar === 'fondo' || lugar === 'espacio';
    behind.forEach((it) => placeProp(ctx, it, t, dur, items.indexOf(it), noGround));
    if (persona === 'medio' || persona === 'entero') {
      const who = personaWho(seed, params);
      const firstPos = (items[0] && (items[0].pos || items[0].posicion)) || 'derecha';
      const side = firstPos === 'izquierda' ? 1 : -1;
      if (persona === 'entero') drawFullBody(ctx, W / 2 + side * 250, 760, 0.36, who, { mood: params.mood, arms: params.arms, t, blinkSeed: s.seed });
      else midShot(ctx, who, { x: W / 2 + side * 200, y: 980, s: 0.7, mood: params.mood, prop: params.objeto || 'none', t, seed: s.seed });
    }
    front.forEach((it) => placeProp(ctx, it, t, dur, items.indexOf(it), noGround));
    ambientFront(ctx, lugar, t, hora);
    if (lugar !== 'fondo') grade(ctx, hora);
    if (params.label) {
      const text = String(params.label).toUpperCase();
      ctx.save(); ctx.font = '700 46px Poppins'; const w = Math.min(W - 80, ctx.measureText(text).width + 60);
      ctx.beginPath(); ctx.roundRect((W - w) / 2, 1739, w, 82, 41); ctx.fillStyle = '#ffd166'; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke();
      ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, W / 2, 1782, w - 40); ctx.restore();
    }
  },
};
