/**
 * Par de pies ilustrados (vista cenital, dedos hacia arriba). Dibujo editorial, no fotografía.
 * viewBox 0 0 1000 1000. Las uñas de los pies reutilizan la uña lacada (más cortas y anchas).
 */
import { nailMarkup } from './nail-markup.js';
import { lighten, darken } from '../lib/color.js';

export const FEET_VIEWBOX = '0 0 1000 1060';

const f1 = (n) => Math.round(n * 10) / 10;

function smooth(pts) {
  const n = pts.length;
  let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    d += `C${f1(p1[0] + (p2[0] - p0[0]) / 6)} ${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)} ${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])} ${f1(p2[1])}`;
  }
  return d + 'Z';
}

/** Cuerpo del pie derecho (dedo gordo a la izquierda). Origen: centro del talón; y negativa = hacia los dedos. */
const BODY = smooth([
  [0, 0], [78, -22], [118, -96], [128, -210], [140, -330], [160, -440],
  [172, -540], [150, -612], [60, -640], [-60, -640], [-150, -606],
  [-176, -540], [160 * -1, -450], [-128, -360], [-108, -270],
  [-104, -190], [-110, -100], [-80, -26],
]);

/** Dedos: [cx, cy, rx, ry, ángulo, escala de uña, ancho de uña]. */
const TOES = [
  { cx: -96, cy: -672, rx: 62, ry: 98, rot: -5, nw: 0.74 },
  { cx: -6, cy: -700, rx: 40, ry: 80, rot: -2, nw: 0.7 },
  { cx: 56, cy: -676, rx: 36, ry: 70, rot: 2, nw: 0.7 },
  { cx: 104, cy: -642, rx: 32, ry: 62, rot: 6, nw: 0.7 },
  { cx: 142, cy: -598, rx: 29, ry: 54, rot: 10, nw: 0.7 },
];

function footMarkup(uid, look, skin, mirror) {
  const hi = lighten(skin, 0.4);
  const lo = darken(skin, 0.42);
  const gid = `ft-${uid}`;
  let toes = '';
  let nails = '';
  TOES.forEach((t, i) => {
    toes += `<g transform="translate(${t.cx} ${t.cy}) rotate(${t.rot})">
      <ellipse cx="0" cy="0" rx="${t.rx}" ry="${t.ry}" fill="${skin}"/>
      <ellipse cx="0" cy="0" rx="${t.rx}" ry="${t.ry}" fill="url(#${gid}-t)"/></g>`;
    const k = (t.rx * 2 * t.nw) / 88;
    const topY = -t.ry + t.ry * 0.14;
    nails += `<g transform="translate(${t.cx} ${t.cy}) rotate(${t.rot}) translate(0 ${f1(topY)}) scale(${f1(k * 100) / 100} ${f1(k * 0.66 * 100) / 100}) translate(-50 0)">${nailMarkup(`${uid}-${i}`, { ...look, shape: 'redonda' }, { edge: 0.6 })}</g>`;
  });
  return `<g transform="${mirror ? 'scale(-1 1)' : ''}">
    <defs>
      <linearGradient id="${gid}-b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${hi}" stop-opacity=".55"/><stop offset=".4" stop-color="${hi}" stop-opacity="0"/><stop offset="1" stop-color="#2a0a10" stop-opacity=".5"/></linearGradient>
      <linearGradient id="${gid}-v" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#2a0a10" stop-opacity=".45"/><stop offset=".5" stop-color="#2a0a10" stop-opacity="0"/><stop offset="1" stop-color="${hi}" stop-opacity=".12"/></linearGradient>
      <linearGradient id="${gid}-t" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${hi}" stop-opacity=".5"/><stop offset=".45" stop-color="${hi}" stop-opacity="0"/><stop offset="1" stop-color="#2a0a10" stop-opacity=".5"/></linearGradient>
    </defs>
    <path d="${BODY}" fill="${skin}"/><path d="${BODY}" fill="url(#${gid}-b)"/><path d="${BODY}" fill="url(#${gid}-v)"/>
    ${toes}
    <path d="M-92 -470 q-20 -40 -14 -92" fill="none" stroke="${lo}" stroke-width="2" stroke-linecap="round" opacity=".25"/>
    ${nails}
  </g>`;
}

/** Par de pies. `look` define color/acabado de las uñas. */
export function feetMarkup(uid, look, { skin = '#E8C4B7' } = {}) {
  return `<g class="feet" data-uid="${uid}">
    <g class="foot foot-l" transform="translate(300 900) rotate(-3)">${footMarkup(`${uid}l`, look, skin, true)}</g>
    <g class="foot foot-r" transform="translate(700 900) rotate(3)">${footMarkup(`${uid}r`, look, skin, false)}</g>
  </g>`;
}

/** Dedo gordo del pie derecho en coordenadas de mundo (centro de la uña y tamaño): destino de la cámara. */
export const BIG_TOE = (() => {
  const t = TOES[0];
  const k = (t.rx * 2 * t.nw) / 88;
  const topY = -t.ry + t.ry * 0.14;
  const ly = topY + 81 * k * 0.66; // centro de la uña en el sistema del dedo
  const r1 = (t.rot * Math.PI) / 180, r2 = (3 * Math.PI) / 180;
  const fx = t.cx + (0 * Math.cos(r1) - ly * Math.sin(r1)), fy = t.cy + (0 * Math.sin(r1) + ly * Math.cos(r1));
  return { x: 700 + fx * Math.cos(r2) - fy * Math.sin(r2), y: 900 + fx * Math.sin(r2) + fy * Math.cos(r2), w: 88 * k, h: 164 * k * 0.66 };
})();
