/**
 * Cejas en línea (SVG): la línea que se transforma en ceja, guías de precisión y rostro mínimo.
 * viewBox 0 0 1200 800. Línea y ceja comparten la misma estructura de curvas Bézier → se pueden
 * interpolar número a número (morph) sin librerías.
 */
export const BROW_VIEWBOX = '0 0 1200 800';
export const BROW_CX = 600;

/** Ceja izquierda (la de la izquierda del espectador). Empieza en la cabeza y rodea la silueta: M + 5 × (c1, c2, p). */
const BROW = [
  [512, 388],
  [484, 356], [436, 334], [384, 334],
  [310, 330], [226, 356], [160, 372],
  [230, 336], [310, 294], [390, 292],
  [452, 290], [505, 314], [522, 344],
  [534, 356], [530, 380], [512, 388],
];
/** Misma silueta aplastada sobre una recta: la «línea». */
const LINE_Y = 372;
const LINE = BROW.map(([x]) => [x, LINE_Y]);

const f1 = (n) => Math.round(n * 10) / 10;

/** Interpola entre línea (t=0) y ceja (t=1). `mirror` refleja respecto al eje del rostro. */
export function browD(t, mirror = false) {
  const pts = BROW.map(([x, y], i) => {
    const px = LINE[i][0] + (x - LINE[i][0]) * t;
    const py = LINE[i][1] + (y - LINE[i][1]) * t;
    return [mirror ? BROW_CX * 2 - px : px, py];
  });
  let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
  for (let i = 1; i < pts.length; i += 3) {
    d += `C${f1(pts[i][0])} ${f1(pts[i][1])} ${f1(pts[i + 1][0])} ${f1(pts[i + 1][1])} ${f1(pts[i + 2][0])} ${f1(pts[i + 2][1])}`;
  }
  return d + 'Z';
}

/** Ojo en línea fina (almendra + iris). */
function eye(mirror) {
  const m = (x) => (mirror ? BROW_CX * 2 - x : x);
  return `<path d="M${m(238)} 536 C${m(292)} 478 ${m(398)} 478 ${m(474)} 540 C${m(404)} 580 ${m(296)} 582 ${m(238)} 536Z"/>
    <circle cx="${m(356)}" cy="534" r="40"/><circle cx="${m(356)}" cy="534" r="14"/>
    <path d="M${m(238)} 536 C${m(250)} 520 ${m(264)} 512 ${m(280)} 504" opacity=".5"/>`;
}

/** Guías de medida: ejes, alineaciones con el ojo y puntos clave. */
export function guidesMarkup() {
  const rx = (x) => BROW_CX * 2 - x;
  return `<g class="bz-guides" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity=".42">
    <path class="bz-g" d="M600 150 V700" stroke-dasharray="3 7"/>
    <path class="bz-g" d="M110 372 H1090" stroke-dasharray="2 8" opacity=".55"/>
    <path class="bz-g" d="M520 250 V610" stroke-dasharray="3 7"/><path class="bz-g" d="M${rx(520)} 250 V610" stroke-dasharray="3 7"/>
    <path class="bz-g" d="M390 250 V610" stroke-dasharray="3 7"/><path class="bz-g" d="M${rx(390)} 250 V610" stroke-dasharray="3 7"/>
    <path class="bz-g" d="M160 372 L300 590" stroke-dasharray="3 7" opacity=".7"/><path class="bz-g" d="M${rx(160)} 372 L${rx(300)} 590" stroke-dasharray="3 7" opacity=".7"/>
    <path class="bz-g" d="M96 700 H1104"/>
    ${Array.from({ length: 21 }, (_, i) => `<path class="bz-g" d="M${96 + i * 50.4} 700 v${i % 5 === 0 ? 16 : 8}"/>`).join('')}
  </g>
  <g class="bz-points" fill="currentColor">
    ${[[520, 342], [390, 292], [160, 372]].flatMap(([x, y]) => [`<circle class="bz-p" cx="${x}" cy="${y}" r="5"/>`, `<circle class="bz-p" cx="${rx(x)}" cy="${y}" r="5"/>`]).join('')}
  </g>`;
}

/** Marcado completo de la escena de cejas (estado final; el JS lo anima). */
export function browMarkup(uid) {
  return `<g class="brow-art" data-uid="${uid}">
    <defs>
      <pattern id="pw-${uid}" width="26" height="26" patternUnits="userSpaceOnUse">${powder()}</pattern>
      <linearGradient id="bg-${uid}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".45" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity=".5"/></linearGradient>
      <linearGradient id="bs-${uid}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#9A5A52"/><stop offset=".5" stop-color="#6E343A"/><stop offset="1" stop-color="#8E4E48"/></linearGradient>
      <mask id="bm-${uid}-l"><path class="bz-fill-l" d="${browD(1)}" fill="url(#bg-${uid})"/></mask>
      <mask id="bm-${uid}-r"><path class="bz-fill-r" d="${browD(1, true)}" fill="url(#bg-${uid})"/></mask>
      <filter id="bf-${uid}" x="-5%" y="-30%" width="110%" height="160%"><feGaussianBlur stdDeviation="2.2"/></filter>
    </defs>
    <g class="bz-face" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" opacity=".7">${eye(false)}${eye(true)}</g>
    ${guidesMarkup()}
    <g class="bz-brows">
      <g mask="url(#bm-${uid}-l)" filter="url(#bf-${uid})" class="bz-shade"><rect x="100" y="260" width="500" height="180" fill="url(#bs-${uid})"/><rect x="100" y="260" width="500" height="180" fill="url(#pw-${uid})"/></g>
      <g mask="url(#bm-${uid}-r)" filter="url(#bf-${uid})" class="bz-shade"><rect x="600" y="260" width="500" height="180" fill="url(#bs-${uid})"/><rect x="600" y="260" width="500" height="180" fill="url(#pw-${uid})"/></g>
      <path class="bz-line bz-line-l" pathLength="1" d="${browD(1)}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
      <path class="bz-line bz-line-r" pathLength="1" d="${browD(1, true)}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
    </g>
  </g>`;
}

/** Polvo de pigmento: puntos deterministas para el «efecto sombreado». */
function powder() {
  let s = 11, out = '';
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 34; i++) {
    out += `<circle cx="${f1(rnd() * 26)}" cy="${f1(rnd() * 26)}" r="${f1(0.5 + rnd() * 1.1)}" fill="#f0c4b4" opacity="${f1(0.18 + rnd() * 0.4)}"/>`;
  }
  return out;
}

/** Punta de la ceja derecha (para el destello que se convierte en joya). */
export const BROW_TAIL_R = { x: BROW_CX * 2 - 160, y: 372 };
