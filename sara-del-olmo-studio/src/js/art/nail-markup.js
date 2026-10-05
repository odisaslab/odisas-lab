/**
 * Uña lacada en SVG (100 × 164 unidades, punta arriba, cutícula abajo).
 * Funciones puras: generan marcado como texto, así sirven al prerender (HTML estático) y al navegador.
 * Todo vectorial: se puede ampliar ×40 sin perder nitidez (clave del zoom del hero).
 */
import { SHAPES, DEFAULT_LOOK, colorById } from '../../data/look.js';
import { mix, lighten, darken } from '../lib/color.js';

export const NAIL_W = 100;
export const NAIL_H = 164;
export const NUDE = '#EFD3CB';
export const BARE = '#EDCFC7';

/** Zona de la punta (para la manicura francesa): curva de «sonrisa». */
export const TIP_D = 'M-10 -10 H110 V66 C80 34 20 34 -10 66 Z';

const f2 = (n) => Math.round(n * 100) / 100;

export function nailPath(s) {
  return `M50 ${f2(s.y0)} C${f2(s.c1[0])} ${f2(s.c1[1])} ${f2(s.c2[0])} ${f2(s.c2[1])} 94 ${f2(s.yS)} L94 132 C94 152 76 162 50 162 C24 162 6 152 6 132 L6 ${f2(s.yS)} C${f2(100 - s.c2[0])} ${f2(s.c2[1])} ${f2(100 - s.c1[0])} ${f2(s.c1[1])} 50 ${f2(s.y0)}Z`;
}

/** Brillo base por acabado: [reflejo largo, destello, borde de luz, reflejo difuso]. */
export const GLOSS = {
  brillo: { soft: 0.5, spot: 0.9, rim: 0.4, core: 0.22, grain: 0 },
  mate: { soft: 0.05, spot: 0, rim: 0.1, core: 0.06, grain: 0.4 },
  cromado: { soft: 0.75, spot: 1, rim: 0.65, core: 0.1, grain: 0 },
  aura: { soft: 0.4, spot: 0.8, rim: 0.34, core: 0.3, grain: 0 },
  francesa: { soft: 0.46, spot: 0.85, rim: 0.36, core: 0.2, grain: 0 },
};

/** Puntitos deterministas para el grano del acabado mate. */
function grainDots() {
  let s = 7, out = '';
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 170; i++) {
    out += `<circle cx="${f2(rnd() * 44)}" cy="${f2(rnd() * 44)}" r="${f2(0.16 + rnd() * 0.3)}" fill="${rnd() > 0.5 ? '#fff' : '#000'}" opacity="${f2(0.08 + rnd() * 0.2)}"/>`;
  }
  return out;
}
const GRAIN = grainDots();

/**
 * Marcado de una uña. `uid` debe ser único por documento (los ids de gradientes y recortes lo llevan).
 * Devuelve un <g class="nail"> sin transform: quien lo use lo coloca.
 */
export function nailMarkup(uid, look = DEFAULT_LOOK, opts = {}) {
  const shape = SHAPES[look.shape] || SHAPES.almendra;
  const color = colorById(look.color).hex;
  const fin = look.finish || 'brillo';
  const d = nailPath(shape);
  const g = GLOSS[fin];
  const baseFill = fillFor(uid, 'A', color, fin);
  const gradStops = (k) => {
    const [a, b, c, e, h] = chromeStops(color);
    return `<linearGradient id="lg${k}-${uid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${a}"/><stop offset=".3" stop-color="${b}"/><stop offset=".52" stop-color="${c}"/><stop offset=".74" stop-color="${e}"/><stop offset="1" stop-color="${h}"/></linearGradient>
    <radialGradient id="rg${k}-${uid}" cx=".5" cy=".58" r=".62">
      <stop offset="0" stop-color="${color}"/><stop offset=".5" stop-color="${mix(color, NUDE, 0.55)}"/><stop offset="1" stop-color="${NUDE}"/></radialGradient>`;
  };
  return `<g class="nail" data-uid="${uid}">
  <defs>
    <clipPath id="nc-${uid}"><path class="n-clip" d="${d}"/></clipPath>
    <clipPath id="nv-${uid}"><rect class="n-rev" x="-10" y="172" width="120" height="0"/></clipPath>
    ${gradStops('A')}${gradStops('B')}
    <radialGradient id="dp-${uid}" cx="50" cy="92" r="84" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".55" stop-color="#000" stop-opacity=".04"/><stop offset="1" stop-color="#1a0408" stop-opacity=".5"/></radialGradient>
    <radialGradient id="co-${uid}" cx="46" cy="70" r="70" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <linearGradient id="sb-${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".12" stop-color="#fff" stop-opacity="1"/><stop offset=".8" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <linearGradient id="sw-${uid}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <linearGradient id="cu-${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1a0408" stop-opacity="0"/><stop offset="1" stop-color="#1a0408" stop-opacity=".55"/></linearGradient>
    <pattern id="gr-${uid}" width="44" height="44" patternUnits="userSpaceOnUse">${GRAIN}</pattern>
  </defs>
  <g class="n-body" clip-path="url(#nc-${uid})">
    <rect class="n-bare" x="-10" y="-10" width="120" height="190" fill="${BARE}"/>
    <g class="n-layer-a"><rect class="n-fill-a" x="-10" y="-10" width="120" height="190" fill="${baseFill}"/><path class="n-tip-a" d="${TIP_D}" fill="${color}" style="display:${fin === 'francesa' ? 'inline' : 'none'}"/></g>
    <g clip-path="url(#nv-${uid})"><g class="n-layer-b"><rect class="n-fill-b" x="-10" y="-10" width="120" height="190" fill="${color}"/><path class="n-tip-b" d="${TIP_D}" fill="${color}" style="display:none"/></g></g>
    <rect class="n-core" x="-10" y="-10" width="120" height="190" fill="url(#co-${uid})" opacity="${g.core}"/>
    <rect class="n-depth" x="-10" y="-10" width="120" height="190" fill="url(#dp-${uid})"/>
    <rect class="n-grain" x="-10" y="-10" width="120" height="190" fill="url(#gr-${uid})" opacity="${g.grain}"/>
    <g class="n-light">
      <rect class="n-soft" x="17" y="26" width="13" height="104" rx="6.5" fill="url(#sb-${uid})" opacity="${g.soft}"/>
      <ellipse class="n-spot" cx="72" cy="50" rx="3.6" ry="10" fill="#fff" opacity="${g.spot}" transform="rotate(14 72 50)"/>
      <path class="n-rim" d="M10 128 C8 100 9 70 20 40" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity="${g.rim}"/>
      <path class="n-wet" d="M-10 0 H110" stroke="#fff" stroke-width="3" opacity="0" fill="none"/>
    </g>
    <g class="n-sweep" opacity="0"><rect x="-60" y="-30" width="34" height="230" fill="url(#sw-${uid})" transform="skewX(-18)"/></g>
    <rect class="n-cuticle" x="-10" y="116" width="120" height="60" fill="url(#cu-${uid})"/>
  </g>
  <path class="n-edge" d="${d}" fill="none" stroke="rgba(30,6,10,.22)" stroke-width="${opts.edge ?? 0.9}" vector-effect="non-scaling-stroke"/>
</g>`;
}

/** Relleno de una capa según acabado (usa los gradientes del propio nail). */
export function fillFor(uid, layer, color, finish) {
  if (finish === 'cromado') return `url(#lg${layer}-${uid})`;
  if (finish === 'aura') return `url(#rg${layer}-${uid})`;
  if (finish === 'francesa') return NUDE;
  if (finish === 'mate') return mix(color, '#8a8a8a', 0.08);
  return color;
}

/** Cinco paradas del degradado metálico (reflejos claros y oscuros alternados). */
export function chromeStops(color) {
  return [
    mix(color, '#ffffff', 0.62),
    color,
    mix(color, '#000000', 0.42),
    mix(color, '#ffffff', 0.45),
    mix(color, '#000000', 0.18),
  ];
}

export { lighten, darken };
