/**
 * Mano ilustrada en SVG (vista del dorso, dedos hacia arriba). Es un DIBUJO editorial, no una foto.
 * Coordenadas de mundo 1000 × 1300. La cámara del hero se mueve sobre este sistema de coordenadas.
 */
import { nailMarkup, NAIL_H } from './nail-markup.js';
import { mix, lighten, darken, rgba } from '../lib/color.js';

export const HAND_VIEWBOX = '0 0 1000 1300';
export const HAND_W = 1000;
export const HAND_H = 1300;

const FINGERS = [
  { id: 'thumb', bx: 318, by: 1010, ang: -54, len: 330, w0: 150, w1: 112, nail: 0.86, joints: [0.46] },
  { id: 'index', bx: 392, by: 760, ang: -8, len: 392, w0: 126, w1: 98, nail: 0.84, joints: [0.36, 0.67] },
  { id: 'middle', bx: 522, by: 726, ang: -1, len: 430, w0: 130, w1: 101, nail: 0.84, joints: [0.35, 0.66] },
  { id: 'ring', bx: 650, by: 758, ang: 6, len: 396, w0: 122, w1: 95, nail: 0.84, joints: [0.36, 0.67] },
  { id: 'pinky', bx: 758, by: 826, ang: 15, len: 304, w0: 102, w1: 80, nail: 0.85, joints: [0.4, 0.7] },
];

const rad = (d) => (d * Math.PI) / 180;
const f1 = (n) => Math.round(n * 10) / 10;

/** Spline Catmull-Rom cerrada → Bézier cúbica (curvas suaves aunque se amplíen). */
function smoothClosed(pts, tension = 1) {
  const n = pts.length;
  let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + ((p2[0] - p0[0]) / 6) * tension, p1[1] + ((p2[1] - p0[1]) / 6) * tension];
    const c2 = [p2[0] - ((p3[0] - p1[0]) / 6) * tension, p2[1] - ((p3[1] - p1[1]) / 6) * tension];
    d += `C${f1(c1[0])} ${f1(c1[1])} ${f1(c2[0])} ${f1(c2[1])} ${f1(p2[0])} ${f1(p2[1])}`;
  }
  return d + 'Z';
}

/** Contorno de un dedo en coordenadas locales (base en y=0, punta en y=-len). */
function fingerOutline(F) {
  const { len, w0, w1 } = F;
  const r = w1 / 2;
  const straight = len - r; // hasta donde empieza el arco de la punta
  const width = (y) => {
    const u = Math.min(1, y / straight);
    let w = w0 + (w1 - w0) * Math.pow(u, 0.85);
    for (const j of F.joints) w *= 1 + 0.032 * Math.exp(-Math.pow((u - j) / 0.045, 2)); // nudillos
    return w;
  };
  const L = [], R = [];
  const N = 11;
  for (let i = 0; i <= N; i++) {
    const y = (straight * i) / N;
    L.push([-width(y) / 2, -y]);
    R.push([width(y) / 2, -y]);
  }
  const tip = [];
  for (let i = 1; i < 8; i++) {
    const a = Math.PI - (Math.PI * i) / 8;
    tip.push([r * Math.cos(a), -straight - r * Math.sin(a)]);
  }
  const base = 190;
  const pts = [[-w0 / 2, base], ...L, ...tip, ...R.reverse(), [w0 / 2, base]];
  return { d: smoothClosed(pts), r, straight };
}

/** Datos de colocación de cada uña (centro en mundo, escala, ángulo). */
export function nailSlots() {
  return FINGERS.map((F) => {
    const a = rad(F.ang);
    const dir = [Math.sin(a), -Math.cos(a)];
    const wNail = F.w1 * F.nail;
    const k = wNail / 88; // la uña mide 88 de ancho útil
    const over = 0.2 * NAIL_H * k; // borde libre que sobresale de la yema
    const tx = F.bx + dir[0] * (F.len + over);
    const ty = F.by + dir[1] * (F.len + over);
    const cx = tx - dir[0] * (81 * k);
    const cy = ty - dir[1] * (81 * k);
    return { id: F.id, k, ang: F.ang, tx, ty, cx, cy, w: wNail };
  });
}

export const NAIL_SLOTS = nailSlots();
export const slotById = (id) => NAIL_SLOTS.find((s) => s.id === id);

const PALM_D = smoothClosed([
  [318, 770], [400, 722], [525, 706], [650, 730], [770, 800], [818, 900],
  [800, 1030], [764, 1150], [736, 1250], [724, 1360], [610, 1400],
  [470, 1400], [352, 1360], [338, 1250], [316, 1140], [262, 1050],
  [240, 960], [268, 860],
]);

/**
 * Marcado de la mano completa.
 * `uid` único por documento. Cada uña lleva uid `${uid}-${dedo}` (ver nailMarkup).
 */
export function handMarkup(uid, look, { skin = '#E8C4B7', lightX = 500, lightY = 470 } = {}) {
  const hi = lighten(skin, 0.38);
  const lo = darken(skin, 0.45);
  let fingers = '';
  let nails = '';
  let creases = '';
  let clips = '';
  for (const F of FINGERS) {
    const o = fingerOutline(F);
    clips += `<path transform="translate(${F.bx} ${F.by}) rotate(${F.ang})" d="${o.d}"/>`;
    const gid = `fg-${uid}-${F.id}`;
    fingers += `<g transform="translate(${F.bx} ${F.by}) rotate(${F.ang})">
      <linearGradient id="${gid}" x1="-0.5" y1="0" x2="0.5" y2="0" gradientUnits="objectBoundingBox">
        <stop offset="0" stop-color="${hi}" stop-opacity=".5"/><stop offset=".3" stop-color="${hi}" stop-opacity=".05"/>
        <stop offset=".62" stop-color="${lo}" stop-opacity=".12"/><stop offset="1" stop-color="#2a0a10" stop-opacity=".6"/></linearGradient>
      <path d="${o.d}" fill="${skin}"/><path d="${o.d}" fill="url(#${gid})"/>
    </g>`;
    // arrugas de los nudillos (trazos finos)
    for (const j of F.joints) {
      const y = -(o.straight * j);
      const w = F.w0 * 0.3;
      creases += `<g transform="translate(${F.bx} ${F.by}) rotate(${F.ang})" fill="none" stroke="${darken(skin, 0.5)}" stroke-linecap="round" opacity=".28">
        <path d="M${f1(-w)} ${f1(y)} q${f1(w)} -5 ${f1(w * 2)} 0" stroke-width="1.6"/>
        <path d="M${f1(-w * 0.7)} ${f1(y + 9)} q${f1(w * 0.7)} -4 ${f1(w * 1.4)} 0" stroke-width="1.2"/>
        <path d="M${f1(-w * 0.6)} ${f1(y - 9)} q${f1(w * 0.6)} -4 ${f1(w * 1.2)} 0" stroke-width="1"/></g>`;
    }
  }
  const slots = NAIL_SLOTS;
  slots.forEach((s) => {
    nails += `<g class="hand-nail" data-finger="${s.id}" transform="translate(${f1(s.tx)} ${f1(s.ty)}) rotate(${s.ang}) scale(${f1(s.k * 1000) / 1000}) translate(-50 0)">${nailMarkup(`${uid}-${s.id}`, look, { edge: 0.8 })}</g>`;
  });
  return `<g class="hand" data-uid="${uid}">
    <defs>
      <clipPath id="hc-${uid}">${clips}<path d="${PALM_D}"/></clipPath>
      <radialGradient id="lm-${uid}" cx="${lightX}" cy="${lightY}" r="980" gradientUnits="userSpaceOnUse" gradientTransform="translate(0 ${lightY * 0.18}) scale(1 .82)">
        <stop offset="0" stop-color="#0c0204" stop-opacity="0"/><stop offset=".34" stop-color="#0c0204" stop-opacity=".14"/>
        <stop offset=".7" stop-color="#0c0204" stop-opacity=".74"/><stop offset="1" stop-color="#0c0204" stop-opacity=".97"/></radialGradient>
      <linearGradient id="pg-${uid}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${hi}" stop-opacity=".2"/><stop offset=".45" stop-color="${hi}" stop-opacity="0"/><stop offset="1" stop-color="#2a0a10" stop-opacity=".55"/></linearGradient>
      <linearGradient id="pf-${uid}" x1="0" y1="740" x2="0" y2="880" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="1"/></linearGradient>
      <mask id="pm-${uid}" maskUnits="userSpaceOnUse" x="0" y="600" width="1000" height="900"><rect x="0" y="600" width="1000" height="900" fill="url(#pf-${uid})"/></mask>
      <linearGradient id="tn-${uid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${hi}" stop-opacity=".16"/><stop offset="1" stop-color="${hi}" stop-opacity="0"/></linearGradient>
    </defs>
    <path d="${PALM_D}" fill="${skin}"/>
    ${fingers}
    <g mask="url(#pm-${uid})"><path d="${PALM_D}" fill="${skin}"/><path d="${PALM_D}" fill="url(#pg-${uid})"/>
      <g fill="url(#tn-${uid})"><path d="M392 790 q-6 120 -24 260 q22 -2 38 -6 q16 -120 16 -254z"/><path d="M520 770 q-2 140 -4 290 q26 0 40 -4 q-4 -150 -8 -286z"/><path d="M650 790 q14 120 30 250 q-22 4 -38 -2 q-18 -120 -20 -248z"/></g></g>
    ${creases}
    <rect class="hand-shade" clip-path="url(#hc-${uid})" x="-100" y="0" width="1200" height="1600" fill="url(#lm-${uid})"/>
    ${nails}
  </g>`;
}

export const _debug = { smoothClosed, rgba, mix };
