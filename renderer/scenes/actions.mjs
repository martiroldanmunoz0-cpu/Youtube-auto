// ACCIONES: pequeñas animaciones con principio y final para que "lo que se dice, se vea".
// params: { tipo, lugar, hora, who, mood, objeto, label }. Cada acción reparte sus fases en la duración del plano.
import { W, H, clamp, ease } from '../lib/util.mjs';
import { PROPS, DRAW } from '../lib/props.mjs';
import { drawPlace, midShot, grade } from './bright.mjs';
import { personaWho } from '../lib/persona.mjs';
import { INK } from '../lib/brightbg.mjs';
import { comicWord, speedLines, sparkles, smoke, flash, shakeAt, starBurst } from '../lib/impact.mjs';
import { MORE_ACTIONS, MORE_ALIAS } from './actions2.mjs';

const { O, E, C, R, P, L } = DRAW;
const ph = (t, d, a, b) => clamp((t / d - a) / (b - a)); // progreso 0..1 de una fase (fracciones de la duración)

function prop(ctx, name, x, y, s, t, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); PROPS[name](ctx, t); ctx.restore(); }

const ACTIONS = {
  // Dedo sobre la tabla: entra el cuchillo, ¡zas!, corte rojo, gota de sangre, ¡AY!
  cortarse(ctx, t, d, who) {
    drawPlace(ctx, 'cocina', 'dia', t);
    ctx.fillStyle = 'rgba(255,244,220,0.35)'; ctx.fillRect(0, 0, W, H);
    const [sx, sy] = shakeAt(t, d * 0.35); ctx.save(); ctx.translate(sx, sy);
    ctx.translate(540, 1120); ctx.scale(1.75, 1.75); ctx.translate(-600, -1120); // primer plano del dedo
    R(ctx, 60, 1160, 960, 260, 30, '#d9a066'); // tabla
    const skin = who.skin.light;
    const enter = ease.out(ph(t, d, 0, 0.15));
    ctx.save(); ctx.translate(-500 + enter * 520, 0);
    R(ctx, -60, 1000, 520, 230, 110, skin);            // mano
    R(ctx, 380, 1060, 420, 120, 60, skin);             // dedo índice
    E(ctx, 760, 1120, 40, 46, '#ffe6ee', 0, 6);        // uña
    for (const yy of [1015, 1205]) R(ctx, 120, yy, 260, 40, 20, skin, 7);
    const cut = ph(t, d, 0.33, 0.4);
    if (cut > 0) { ctx.beginPath(); ctx.moveTo(600, 1062); ctx.lineTo(594, 1062 + 116 * cut); ctx.lineWidth = 16; ctx.strokeStyle = '#d63c46'; ctx.lineCap = 'round'; ctx.stroke(); }
    const drop = ph(t, d, 0.45, 0.9);
    if (drop > 0) { const y = 1180 + ease.inOut(drop) * 220, r = 18 + drop * 10; ctx.beginPath(); ctx.moveTo(596, y - r * 2.2); ctx.bezierCurveTo(596 + r, y - r, 596 + r, y + r, 596, y + r); ctx.bezierCurveTo(596 - r, y + r, 596 - r, y - r, 596, y - r * 2.2); ctx.fillStyle = '#e8505b'; ctx.fill(); O(ctx, 6); }
    ctx.restore();
    // cuchillo: baja desde arriba y corta
    const k1 = ease.inOut(ph(t, d, 0.12, 0.35)), k2 = ease.in(ph(t, d, 0.35, 0.55));
    ctx.save(); ctx.translate(560 + k2 * 260, 300 + k1 * 640 - k2 * 500); ctx.rotate(-0.5 + k2 * 0.6);
    P(ctx, [[-30, 0], [30, 0], [24, 330], [-10, 380], [-30, 330]], '#dfe6ee'); R(ctx, -38, -170, 76, 180, 20, '#6b4f3a');
    ctx.restore();
    ctx.restore();
    flash(ctx, t, d * 0.35, 0.15, '255,80,80');
    comicWord(ctx, 'ay', 760, 640, t - d * 0.37);
  },
  // Algo cae desde arriba y se rompe en pedazos: ¡CRAC!
  caer_romper(ctx, t, d, who, params) {
    drawPlace(ctx, params.lugar || 'salon', params.hora || 'dia', t);
    const hit = 0.4, k = ph(t, d, 0, hit);
    const [sx, sy] = shakeAt(t, d * hit); ctx.save(); ctx.translate(sx, sy);
    if (k < 1) prop(ctx, params.objeto && PROPS[params.objeto] ? params.objeto : 'vaso_agua', W / 2, 200 + ease.in(k) * 1350, 0.8, t, k * 2.5);
    else {
      const f = ph(t, d, hit, 1);
      for (let i = 0; i < 9; i++) {
        const a = -Math.PI + (i / 8) * Math.PI, dist = ease.out(f) * (180 + (i % 3) * 90);
        ctx.save(); ctx.translate(W / 2 + Math.cos(a) * dist, 1550 + Math.sin(a) * dist * 0.6 + f * f * 120); ctx.rotate(i + f * 6);
        P(ctx, [[-30, -20], [40, -10], [10, 40]], i % 2 ? 'rgba(200,235,255,0.95)' : '#7fc8ff', 5); ctx.restore();
      }
    }
    ctx.restore();
    flash(ctx, t, d * hit, 0.15);
    comicWord(ctx, 'crac', W / 2, 900, t - d * hit);
  },
  // Mecha que se consume y ¡BOOM!: destello, onda, humo, escombros y temblor
  explosion(ctx, t, d, who, params) {
    drawPlace(ctx, params.lugar || 'desierto', params.hora || 'dia', t);
    const at = 0.35, k = ph(t, d, at, 1);
    const [sx, sy] = shakeAt(t, d * at, 40, 0.8); ctx.save(); ctx.translate(sx, sy);
    if (t < d * at) prop(ctx, 'bomba', W / 2, 1500, 1.1, t);
    else {
      starBurst(ctx, W / 2, 1250, 520, '#ffb347', ease.out(clamp(k * 3)), 18);
      starBurst(ctx, W / 2, 1250, 330, '#ffe14d', ease.out(clamp(k * 3)), 14);
      smoke(ctx, W / 2, 1400, t * 1.5, 10);
      for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2, r = ease.out(k) * 700; R(ctx, W / 2 + Math.cos(a) * r - 20, 1250 + Math.sin(a) * r - 20, 40, 40, 6, '#8d6e63', 5); }
    }
    ctx.restore();
    flash(ctx, t, d * at, 0.3, '255,240,200');
    comicWord(ctx, 'boom', W / 2, 620, t - d * at - 0.05, { size: 170 });
  },
  // La persona bebe: el vaso sube, el agua baja, ¡GLUP!
  beber(ctx, t, d, who, params) {
    drawPlace(ctx, params.lugar || 'cocina', params.hora || 'dia', t);
    midShot(ctx, who, { x: W / 2 - 60, y: 900, s: 0.8, mood: 'happy', t });
    const up = ease.inOut(ph(t, d, 0.1, 0.35)), lvl = ph(t, d, 0.35, 0.85);
    ctx.save(); ctx.translate(W / 2 + 200 - up * 150, 1500 - up * 520); ctx.rotate(-up * 1.1); ctx.scale(0.55, 0.55);
    P(ctx, [[-130, -400], [130, -400], [100, 0], [-100, 0]], 'rgba(220,240,255,0.95)');
    P(ctx, [[-118 + lvl * 15, -300 + lvl * 280], [118 - lvl * 15, -300 + lvl * 280], [100, 0], [-100, 0]], '#7fc8ff', 0);
    ctx.restore();
    if (lvl > 0.2) comicWord(ctx, 'glup', 800, 560, t - d * 0.45, { size: 110 });
  },
  // Comida que va desapareciendo a mordiscos: ¡ÑAM!
  comer(ctx, t, d, who, params) {
    drawPlace(ctx, params.lugar || 'fondo', params.hora || 'dia', t);
    const name = params.objeto && PROPS[params.objeto] ? params.objeto : 'hamburguesa';
    const bites = Math.floor(ph(t, d, 0.15, 0.9) * 4);
    ctx.save(); ctx.translate(W / 2, 1250); ctx.scale(1.4, 1.4);
    if (bites) { // los mordiscos recortan la comida (sin borrar el fondo)
      for (let b = 0; b < bites; b++) for (let i = 0; i < 3; i++) { // cada mordisco recorta por separado
        ctx.beginPath(); ctx.rect(-2000, -2000, 4000, 4000); ctx.moveTo(230 - b * 90 + 62, -230 + (i - 1) * 75);
        ctx.arc(230 - b * 90, -230 + (i - 1) * 75, 62, 0, Math.PI * 2); ctx.clip('evenodd');
      }
    }
    PROPS[name](ctx, t);
    ctx.restore();
    if (bites) comicWord(ctx, 'ñam', 300 + ((bites - 1) % 2) * 480, 640, t - d * (0.15 + (bites - 1) * 0.19), { size: 100 });
  },
  // Se enciende una bombilla encima de la cabeza: ¡idea!
  idea(ctx, t, d, who, params) {
    drawPlace(ctx, params.lugar || 'oficina', params.hora || 'dia', t);
    midShot(ctx, who, { x: W / 2, y: 980, s: 0.75, mood: t > d * 0.3 ? 'happy' : 'neutral', t });
    const k = ease.outBack(ph(t, d, 0.25, 0.4));
    if (k > 0) { prop(ctx, 'bombilla', W / 2, 640, 0.75 * k, t); sparkles(ctx, W / 2, 420, t, 8, 260 * k); }
    flash(ctx, t, d * 0.3, 0.2, '255,250,200');
  },
  // La persona da un salto del susto, con exclamaciones y líneas
  sorpresa(ctx, t, d, who, params) {
    drawPlace(ctx, params.lugar || 'salon', params.hora || 'dia', t);
    const j = ph(t, d, 0.2, 0.45), jump = Math.sin(j * Math.PI) * 160;
    if (j > 0 && j < 1) speedLines(ctx, W / 2, 1000, t, 0.4);
    midShot(ctx, who, { x: W / 2, y: 960 - jump, s: 0.78, mood: j > 0 ? 'shocked' : 'neutral', t });
    for (const [x, r] of [[200, -0.3], [880, 0.3]]) { const k = ease.outBack(ph(t, d, 0.22, 0.35)); if (k > 0) { ctx.save(); ctx.translate(x, 520); ctx.rotate(r); ctx.scale(k, k); ctx.font = '220px Anton'; ctx.textAlign = 'center'; ctx.lineWidth = 22; ctx.strokeStyle = INK; ctx.strokeText('!', 0, 0); ctx.fillStyle = '#ffd166'; ctx.fillText('!', 0, 0); ctx.restore(); } }
  },
  // De semilla a planta con flor
  crecer(ctx, t, d, who, params) {
    drawPlace(ctx, params.lugar || 'campo', params.hora || 'dia', t);
    const k = ease.inOut(ph(t, d, 0.05, 0.9));
    R(ctx, W / 2 - 130, 1500, 260, 220, 30, '#d9774b');
    const hgt = 40 + k * 700;
    L(ctx, [[W / 2, 1500], [W / 2 + Math.sin(t * 2) * 20, 1500 - hgt]], '#4caf50', 22);
    for (let i = 1; i <= 3; i++) if (k > i * 0.2) { const y = 1500 - hgt * i * 0.25; E(ctx, W / 2 + (i % 2 ? 70 : -70), y, 70 * Math.min(1, (k - i * 0.2) * 4), 30, '#6fcf97', i % 2 ? -0.4 : 0.4); }
    if (k > 0.8) { const f = ease.outBack((k - 0.8) * 5); for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; C(ctx, W / 2 + Math.cos(a) * 70 * f, 1500 - hgt + Math.sin(a) * 70 * f, 46 * f, '#ff8fab', 6); } C(ctx, W / 2, 1500 - hgt, 40 * f, '#ffd166', 6); sparkles(ctx, W / 2, 1500 - hgt, t, 6, 200); }
  },
  // Un coche entra rápido y choca: ¡PUM!, humo y temblor
  choque(ctx, t, d, who, params) {
    drawPlace(ctx, params.lugar || 'calle', params.hora || 'dia', t);
    const at = 0.4, k = ph(t, d, 0, at);
    const [sx, sy] = shakeAt(t, d * at, 30); ctx.save(); ctx.translate(sx, sy);
    R(ctx, 840, 1180, 240, 380, 10, '#b0a99a'); // muro
    const x = -400 + ease.in(k) * 980;
    if (t < d * at) speedLines(ctx, x, 1450, t, 0.35);
    prop(ctx, 'coche_rojo', x, 1560, 1.1, t, t > d * at ? -0.06 : 0);
    if (t > d * at) smoke(ctx, 760, 1400, t, 6);
    ctx.restore();
    flash(ctx, t, d * at, 0.18);
    comicWord(ctx, 'pum', 640, 900, t - d * at);
  },
  // Se duerme: ojos cerrados y Zzz flotando, de noche
  dormir(ctx, t, d, who, params) {
    drawPlace(ctx, 'dormitorio', 'noche', t);
    midShot(ctx, who, { x: W / 2, y: 1000, s: 0.75, mood: 'neutral', t: 0 });
    ctx.save(); ctx.translate(W / 2, 1000); ctx.scale(0.75, 0.75); E(ctx, -100, -20, 70, 14, '#3a2a20', 0, 0); E(ctx, 100, -20, 70, 14, '#3a2a20', 0, 0); ctx.restore();
    for (let i = 0; i < 3; i++) { const k = (t * 0.6 + i / 3) % 1; ctx.save(); ctx.globalAlpha = 1 - k; ctx.font = `${70 + i * 30}px Anton`; ctx.lineWidth = 10; ctx.strokeStyle = INK; ctx.strokeText('Z', W / 2 + 200 + k * 120, 760 - k * 380); ctx.fillStyle = '#ffffff'; ctx.fillText('Z', W / 2 + 200 + k * 120, 760 - k * 380); ctx.restore(); }
    grade(ctx, 'noche');
  },
  // Un rayo cae del cielo: destello y chispas
  rayo(ctx, t, d, who, params) {
    drawPlace(ctx, params.lugar || 'campo', 'noche', t);
    const at = 0.3;
    if (t > d * at && t < d * at + 0.5) { ctx.save(); ctx.translate(W / 2, 1450); ctx.scale(2.6, 2.6); PROPS.rayo(ctx, 0.1); ctx.restore(); }
    if (t > d * at) { sparkles(ctx, W / 2, 1450, t, 8, 200); smoke(ctx, W / 2, 1500, t, 5); }
    flash(ctx, t, d * at, 0.35, '230,240,255');
    comicWord(ctx, 'zas', W / 2, 600, t - d * at);
  },
};
Object.assign(ACTIONS, MORE_ACTIONS); // acciones detalladas (vista nublada, hincharse, desmayarse, latido...)
export const ACTION_NAMES = Object.keys(ACTIONS);
const ALIAS = { cortar: 'cortarse', corte: 'cortarse', herirse: 'cortarse', caer: 'caer_romper', romper: 'caer_romper', romperse: 'caer_romper', explotar: 'explosion', 'explosión': 'explosion',
  bomba: 'explosion', beber_agua: 'beber', tomar: 'beber', comida: 'comer', morder: 'comer', pensar: 'idea', descubrir: 'idea', susto: 'sorpresa', asustarse: 'sorpresa', sorprenderse: 'sorpresa',
  crecimiento: 'crecer', planta: 'crecer', chocar: 'choque', accidente: 'choque', dormirse: 'dormir', sueno: 'dormir', 'sueño': 'dormir', tormenta: 'rayo', relampago: 'rayo', 'relámpago': 'rayo', ...MORE_ALIAS };

export const accion = {
  setup(p, r) { return { seed: r.int(0, 99) }; },
  draw(ctx, s, { t, dur, params, seed }) {
    const k = String(params.tipo || params.accion || '').toLowerCase().trim();
    const fn = ACTIONS[k] || ACTIONS[ALIAS[k]] || ACTIONS.sorpresa;
    const d = Math.max(1.8, dur || 3);
    fn(ctx, t, d, personaWho(seed, params), params);
    if (params.label) {
      const text = String(params.label).toUpperCase();
      ctx.save(); ctx.font = '700 46px Poppins'; const w = Math.min(W - 80, ctx.measureText(text).width + 60);
      ctx.beginPath(); ctx.roundRect((W - w) / 2, 1739, w, 82, 41); ctx.fillStyle = '#ffd166'; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke();
      ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, W / 2, 1782, w - 40); ctx.restore();
    }
  },
};
