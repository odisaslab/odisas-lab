/**
 * Geometría de la demo: pie sintético + generador paramétrico de la ortesis.
 *
 * Módulo PURO (sin dependencias, sin DOM) para poder verificarlo en Node.
 *
 * IMPORTANTE (README): el pie es GEOMÉTRICO, no anatómico, y el generador de la ortesis es una
 * aproximación en JavaScript pensada para la demo. La versión real lo haría un servicio de
 * geometría en Python, calibrado con escaneos reales del escáner de Zona Pies.
 *
 * Sistema de coordenadas (mm): x = transversal, y = longitudinal (talón 0 → dedos L), z = vertical.
 * Pie derecho: el lado medial (arco) está en x < 0. Pie izquierdo: el medial está en x > 0.
 */

export type Side = "derecho" | "izquierdo";

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/** Interpolación cúbica monótona (PCHIP) sobre puntos de control. */
function makePchip(xs: number[], ys: number[]): (x: number) => number {
  const n = xs.length;
  const h: number[] = [];
  const d: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    h[i] = xs[i + 1] - xs[i];
    d[i] = (ys[i + 1] - ys[i]) / h[i];
  }
  const m: number[] = new Array(n).fill(0);
  m[0] = d[0];
  m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) {
    if (d[i - 1] * d[i] <= 0) {
      m[i] = 0;
    } else {
      const w1 = 2 * h[i] + h[i - 1];
      const w2 = h[i] + 2 * h[i - 1];
      m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]);
    }
  }
  return (x: number) => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0;
    while (x > xs[i + 1]) i++;
    const t = (x - xs[i]) / h[i];
    const t2 = t * t;
    const t3 = t2 * t;
    return (
      (2 * t3 - 3 * t2 + 1) * ys[i] +
      (t3 - 2 * t2 + t) * h[i] * m[i] +
      (-2 * t3 + 3 * t2) * ys[i + 1] +
      (t3 - t2) * h[i] * m[i + 1]
    );
  };
}

/* -------------------------------------------------------------------------- */
/*  Pie sintético                                                             */
/* -------------------------------------------------------------------------- */

/** Longitud del pie sintético (mm). Equivale aproximadamente a una talla 41-42. */
export const FOOT_LENGTH_MM = 265;

const T_CTRL = [0.0, 0.012, 0.04, 0.12, 0.3, 0.45, 0.6, 0.72, 0.85, 0.93, 0.98, 1.0];
const MED_CTRL = [0, 15, 28, 36, 33, 26, 37, 46, 44, 31, 14, 0];
const LAT_CTRL = [0, 17, 32, 38, 39, 41, 48, 50, 42, 28, 12, 0];
const medCurve = makePchip(T_CTRL, MED_CTRL);
const latCurve = makePchip(T_CTRL, LAT_CTRL);
const domeCurve = makePchip(
  [0, 0.05, 0.15, 0.3, 0.5, 0.7, 0.85, 1.0],
  [20, 55, 72, 62, 44, 30, 22, 10],
);

/** Semianchos medial y lateral del contorno plantar en t = y / L. */
export function footWidths(t: number) {
  return { med: Math.max(0, medCurve(t)), lat: Math.max(0, latCurve(t)) };
}

/** Altura de la planta del pie sobre el plano de apoyo (arco medial y elevación de los dedos). */
function soleHeight(t: number, mu: number) {
  const arch = 15 * Math.exp(-(((t - 0.38) / 0.13) ** 2)) * Math.pow(clamp(mu, 0, 1), 1.6);
  const toe = 7 * Math.pow(smoothstep(0.88, 1, t), 2);
  return arch + toe;
}

export interface FootMesh {
  positions: Float32Array;
  indices: Uint32Array;
  side: Side;
  lengthMm: number;
  widthMm: number;
  /** Hueco simulado en la planta (escaneo con fallo) */
  hole: { x: number; y: number; radius: number } | null;
}

const FOOT_NT = 120;
const FOOT_NS = 48;
const HOLE_T = 0.115;
const HOLE_RADIUS = 17;

export function buildFootMesh(side: Side, opts: { holeHeel?: boolean } = {}): FootMesh {
  const NT = FOOT_NT;
  const NS = FOOT_NS;
  const count = NT * NS;
  const positions = new Float32Array(count * 2 * 3);
  const top = (i: number, j: number) => i * NS + j;
  const bot = (i: number, j: number) => count + i * NS + j;
  let widest = 0;

  for (let i = 0; i < NT; i++) {
    const t = (1 - Math.cos((Math.PI * i) / (NT - 1))) / 2;
    const y = t * FOOT_LENGTH_MM;
    const { med, lat } = footWidths(t);
    widest = Math.max(widest, med + lat);
    for (let j = 0; j < NS; j++) {
      const u = j / (NS - 1);
      const s = -1 + 2 * u;
      const x = side === "derecho" ? lerp(-med, lat, u) : lerp(-lat, med, u);
      const mu = side === "derecho" ? 1 - u : u;
      const zs = soleHeight(t, mu);
      const dome = domeCurve(t) * Math.sqrt(Math.max(0, 1 - s * s));
      const a = top(i, j) * 3;
      positions[a] = x;
      positions[a + 1] = y;
      positions[a + 2] = zs + dome;
      const b = bot(i, j) * 3;
      positions[b] = x;
      positions[b + 1] = y;
      positions[b + 2] = zs;
    }
  }

  let hole: FootMesh["hole"] = null;
  if (opts.holeHeel) {
    const { med, lat } = footWidths(HOLE_T);
    const cx = side === "derecho" ? (-med + lat) / 2 : (-lat + med) / 2;
    hole = { x: cx, y: HOLE_T * FOOT_LENGTH_MM, radius: HOLE_RADIUS };
  }

  const idx: number[] = [];
  for (let i = 0; i < NT - 1; i++) {
    for (let j = 0; j < NS - 1; j++) {
      const a = top(i, j);
      const b = top(i, j + 1);
      const c = top(i + 1, j + 1);
      const d = top(i + 1, j);
      idx.push(a, b, c, a, c, d);

      // Planta (cara inferior): se omite el cuadrante si cae dentro del hueco.
      if (hole) {
        const p = [bot(i, j), bot(i, j + 1), bot(i + 1, j + 1), bot(i + 1, j)];
        let cx = 0;
        let cy = 0;
        for (const q of p) {
          cx += positions[q * 3];
          cy += positions[q * 3 + 1];
        }
        cx /= 4;
        cy /= 4;
        if (Math.hypot(cx - hole.x, cy - hole.y) < hole.radius) continue;
      }
      const a2 = bot(i, j);
      const b2 = bot(i, j + 1);
      const c2 = bot(i + 1, j + 1);
      const d2 = bot(i + 1, j);
      idx.push(a2, c2, b2, a2, d2, c2);
    }
  }

  return {
    positions,
    indices: Uint32Array.from(idx),
    side,
    lengthMm: FOOT_LENGTH_MM,
    widthMm: Math.round(widest),
    hole,
  };
}

/* -------------------------------------------------------------------------- */
/*  Ortesis paramétrica                                                       */
/* -------------------------------------------------------------------------- */

export interface InsoleParams {
  largo: "completa" | "tres_cuartos";
  /** Retranqueo respecto al contorno del pie (mm) */
  margen: number;
  grosorBase: number;
  arcoAltura: number;
  /** Posición del arco como fracción de la longitud del pie */
  arcoPosicion: number;
  cazoletaProf: number;
  barraAltura: number;
  barraPosicion: number;
  /** Grados: positivo eleva el lado medial (varo), negativo el lateral (valgo) */
  cunaRetropie: number;
  cunaAntepie: number;
  elevacionTalon: number;
  /** Solo informativo: el forro no forma parte del STL del shell */
  grosorForro: number;
}

export const DEFAULT_PARAMS: InsoleParams = {
  largo: "completa",
  margen: 3,
  grosorBase: 3,
  arcoAltura: 8,
  arcoPosicion: 0.4,
  cazoletaProf: 10,
  barraAltura: 3,
  barraPosicion: 0.62,
  cunaRetropie: 0,
  cunaAntepie: 0,
  elevacionTalon: 0,
  grosorForro: 1.5,
};

export interface ParamSpec {
  key: Exclude<keyof InsoleParams, "largo">;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  group: "Contorno y base" | "Arco y talón" | "Antepié" | "Cuñas y elevación";
  hint?: string;
}

export const PARAM_SPECS: ParamSpec[] = [
  { key: "margen", label: "Retranqueo del contorno", unit: "mm", min: 0, max: 8, step: 0.5, group: "Contorno y base", hint: "Cuánto queda la ortesis por dentro del contorno del pie" },
  { key: "grosorBase", label: "Grosor base del shell", unit: "mm", min: 1.2, max: 6, step: 0.1, group: "Contorno y base" },
  { key: "grosorForro", label: "Grosor del forro", unit: "mm", min: 0, max: 3, step: 0.5, group: "Contorno y base", hint: "Informativo: el forro no entra en el STL del shell" },
  { key: "arcoAltura", label: "Altura del arco longitudinal", unit: "mm", min: 0, max: 16, step: 0.5, group: "Arco y talón" },
  { key: "arcoPosicion", label: "Posición del arco", unit: "% largo", min: 0.3, max: 0.5, step: 0.01, group: "Arco y talón" },
  { key: "cazoletaProf", label: "Cazoleta de talón", unit: "mm", min: 0, max: 18, step: 0.5, group: "Arco y talón" },
  { key: "barraAltura", label: "Barra retrocapital", unit: "mm", min: 0, max: 8, step: 0.5, group: "Antepié" },
  { key: "barraPosicion", label: "Posición de la barra", unit: "% largo", min: 0.55, max: 0.7, step: 0.01, group: "Antepié" },
  { key: "cunaRetropie", label: "Cuña de retropié", unit: "°", min: -6, max: 6, step: 0.5, group: "Cuñas y elevación", hint: "+ varo (eleva el medial) · − valgo (eleva el lateral)" },
  { key: "cunaAntepie", label: "Cuña de antepié", unit: "°", min: -6, max: 6, step: 0.5, group: "Cuñas y elevación" },
  { key: "elevacionTalon", label: "Elevación de talón", unit: "mm", min: 0, max: 12, step: 0.5, group: "Cuñas y elevación" },
];

export const INSOLE_NY = 150;
export const INSOLE_NS = 44;

/** Índices de la malla (topología fija, independiente de los parámetros). */
export interface InsoleTopology {
  topIndex: Uint32Array;
  bodyIndex: Uint32Array;
  vertexCount: number;
}

let topologyCache: InsoleTopology | null = null;

export function insoleTopology(): InsoleTopology {
  if (topologyCache) return topologyCache;
  const NY = INSOLE_NY;
  const NS = INSOLE_NS;
  const half = NY * NS;
  const T = (i: number, j: number) => i * NS + j;
  const B = (i: number, j: number) => half + i * NS + j;
  const top: number[] = [];
  const body: number[] = [];

  for (let i = 0; i < NY - 1; i++) {
    for (let j = 0; j < NS - 1; j++) {
      const a = T(i, j);
      const b = T(i, j + 1);
      const c = T(i + 1, j + 1);
      const d = T(i + 1, j);
      top.push(a, b, c, a, c, d);
      const a2 = B(i, j);
      const b2 = B(i, j + 1);
      const c2 = B(i + 1, j + 1);
      const d2 = B(i + 1, j);
      body.push(a2, c2, b2, a2, d2, c2);
    }
  }
  // Paredes laterales (j = 0 mira a −x, j = NS−1 mira a +x)
  for (let i = 0; i < NY - 1; i++) {
    let p0 = T(i, 0);
    let p1 = T(i + 1, 0);
    let p2 = B(i + 1, 0);
    let p3 = B(i, 0);
    body.push(p0, p1, p2, p0, p2, p3);
    p0 = T(i, NS - 1);
    p1 = T(i + 1, NS - 1);
    p2 = B(i + 1, NS - 1);
    p3 = B(i, NS - 1);
    body.push(p0, p2, p1, p0, p3, p2);
  }
  // Tapas de los extremos (i = 0 mira a −y, i = NY−1 mira a +y)
  for (let j = 0; j < NS - 1; j++) {
    let a = T(0, j);
    let b = T(0, j + 1);
    let c = B(0, j + 1);
    let d = B(0, j);
    body.push(a, c, b, a, d, c);
    a = T(NY - 1, j);
    b = T(NY - 1, j + 1);
    c = B(NY - 1, j + 1);
    d = B(NY - 1, j);
    body.push(a, b, c, a, c, d);
  }

  topologyCache = {
    topIndex: Uint32Array.from(top),
    bodyIndex: Uint32Array.from(body),
    vertexCount: half * 2,
  };
  return topologyCache;
}

/** Líneas guía de la superficie superior (para dibujar la versión comparada sin tapar el mapa de calor). */
let linesCache: Uint32Array | null = null;
export function compareLineIndex(): Uint32Array {
  if (linesCache) return linesCache;
  const NY = INSOLE_NY;
  const NS = INSOLE_NS;
  const T = (i: number, j: number) => i * NS + j;
  const idx: number[] = [];
  for (let i = 0; i < NY; i += 10) for (let j = 0; j < NS - 1; j++) idx.push(T(i, j), T(i, j + 1));
  for (const j of [0, 8, 16, 24, 32, 40, NS - 1]) for (let i = 0; i < NY - 1; i++) idx.push(T(i, j), T(i + 1, j));
  linesCache = Uint32Array.from(idx);
  return linesCache;
}

export interface InsoleStats {
  minMm: number;
  maxMm: number;
  meanMm: number;
  /** Cuántos vértices quedan por debajo del grosor mínimo del proceso */
  belowMin: number;
  lengthMm: number;
  widthMm: number;
  /** Altura de la superficie superior en el centro del talón (para alinear el pie fantasma) */
  heelTopZ: number;
  warnings: string[];
}

export interface InsoleResult {
  positions: Float32Array;
  colors: Float32Array;
  stats: InsoleStats;
}

/** Escala del mapa de calor de grosor (mm). */
export const HEAT_MAX_MM = 20;
const HEAT_STOPS: [number, [number, number, number]][] = [
  [0, [0.04, 0.25, 0.26]],
  [4, [0.07, 0.55, 0.5]],
  [8, [0.24, 0.9, 0.79]],
  [12, [0.95, 0.76, 0.3]],
  [HEAT_MAX_MM, [0.91, 0.38, 0.3]],
];
const WARN_COLOR: [number, number, number] = [1, 0.18, 0.35];
const BODY_COLOR: [number, number, number] = [0.16, 0.21, 0.25];

export function heatColor(mm: number): [number, number, number] {
  if (mm <= HEAT_STOPS[0][0]) return HEAT_STOPS[0][1];
  for (let k = 0; k < HEAT_STOPS.length - 1; k++) {
    const [a, ca] = HEAT_STOPS[k];
    const [b, cb] = HEAT_STOPS[k + 1];
    if (mm <= b) {
      const t = (mm - a) / (b - a);
      return [lerp(ca[0], cb[0], t), lerp(ca[1], cb[1], t), lerp(ca[2], cb[2], t)];
    }
  }
  return HEAT_STOPS[HEAT_STOPS.length - 1][1];
}

export const heatCss = (mm: number) => {
  const [r, g, b] = heatColor(mm);
  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
};

const END_ROUND_BACK = 16;
const END_ROUND_FRONT = 9;
const MIN_HALF_WIDTH = 0.4;

function shellHeight(
  p: InsoleParams,
  y: number,
  y0: number,
  t: number,
  u: number,
  mu: number,
  width: number,
): number {
  const L = FOOT_LENGTH_MM;
  const arch = p.arcoAltura * Math.exp(-(((t - p.arcoPosicion) / 0.12) ** 2)) * Math.pow(mu, 1.7);
  const heel = p.elevacionTalon * (1 - smoothstep(0.1, 0.62, t));
  const dEdge = Math.min(Math.min(u, 1 - u) * width, y - y0);
  const cup = p.cazoletaProf * (1 - smoothstep(0, 14, dEdge)) * (1 - smoothstep(0.17, 0.3, t));
  const yBar = p.barraPosicion * L;
  const bar =
    p.barraAltura *
    Math.exp(-(((y - yBar) / 9) ** 2)) *
    smoothstep(0.08, 0.2, u) *
    (1 - smoothstep(0.8, 0.92, u));
  const wedge = (deg: number) => {
    const k = Math.tan((Math.abs(deg) * Math.PI) / 180);
    return deg >= 0 ? k * (mu * width) : k * ((1 - mu) * width);
  };
  const rear = wedge(p.cunaRetropie) * (1 - smoothstep(0.28, 0.46, t));
  const fore = wedge(p.cunaAntepie) * smoothstep(0.52, 0.72, t);
  return p.grosorBase + arch + heel + cup + bar + rear + fore;
}

function insoleRange(p: InsoleParams) {
  const L = FOOT_LENGTH_MM;
  const tEnd = p.largo === "completa" ? 0.965 : 0.68;
  const y0 = Math.max(0.6, p.margen);
  const y1 = tEnd * L - p.margen * 0.5;
  return { y0, y1 };
}

/** Genera la ortesis para unos parámetros. Determinista y rápido (≈ms). */
export function computeInsole(
  params: InsoleParams,
  side: Side,
  minThicknessMm: number,
): InsoleResult {
  const NY = INSOLE_NY;
  const NS = INSOLE_NS;
  const half = NY * NS;
  const positions = new Float32Array(half * 2 * 3);
  const colors = new Float32Array(half * 2 * 3);
  const { y0, y1 } = insoleRange(params);
  const L = FOOT_LENGTH_MM;

  let min = Infinity;
  let max = -Infinity;
  let sum = 0;
  let belowMin = 0;
  let widest = 0;

  for (let i = 0; i < NY; i++) {
    const v = (1 - Math.cos((Math.PI * i) / (NY - 1))) / 2;
    const y = y0 + v * (y1 - y0);
    const t = y / L;
    const { med, lat } = footWidths(t);
    const fBack = Math.sqrt(1 - clamp((y0 + END_ROUND_BACK - y) / END_ROUND_BACK, 0, 1) ** 2);
    const fFront = Math.sqrt(1 - clamp((y - (y1 - END_ROUND_FRONT)) / END_ROUND_FRONT, 0, 1) ** 2);
    const f = fBack * fFront;
    const m = Math.max(MIN_HALF_WIDTH, (med - params.margen) * f);
    const l = Math.max(MIN_HALF_WIDTH, (lat - params.margen) * f);
    const width = m + l;
    widest = Math.max(widest, width);

    for (let j = 0; j < NS; j++) {
      const u = j / (NS - 1);
      const x = side === "derecho" ? lerp(-m, l, u) : lerp(-l, m, u);
      const mu = side === "derecho" ? 1 - u : u;
      const h = shellHeight(params, y, y0, t, u, mu, width);

      const a = (i * NS + j) * 3;
      positions[a] = x;
      positions[a + 1] = y;
      positions[a + 2] = h;
      const b = (half + i * NS + j) * 3;
      positions[b] = x;
      positions[b + 1] = y;
      positions[b + 2] = 0;

      min = Math.min(min, h);
      max = Math.max(max, h);
      sum += h;
      const low = h < minThicknessMm;
      if (low) belowMin++;
      const c = low ? WARN_COLOR : heatColor(h);
      colors[a] = c[0];
      colors[a + 1] = c[1];
      colors[a + 2] = c[2];
      colors[b] = BODY_COLOR[0];
      colors[b + 1] = BODY_COLOR[1];
      colors[b + 2] = BODY_COLOR[2];
    }
  }

  const heelY = clamp(35, y0 + 2, y1 - 2);
  const heelT = heelY / L;
  const { med: hm, lat: hl } = footWidths(heelT);
  const heelTopZ = shellHeight(params, heelY, y0, heelT, 0.5, 0.5, Math.max(0, hm + hl - 2 * params.margen));

  const warnings: string[] = [];
  if (belowMin > 0) {
    warnings.push(
      `Hay zonas por debajo del grosor mínimo del proceso (${minThicknessMm.toFixed(1)} mm, valor de ejemplo). Se marcan en rojo en el mapa.`,
    );
  }
  if (params.largo === "tres_cuartos" && Math.abs(params.cunaAntepie) > 0) {
    warnings.push("Con largo ¾ la cuña de antepié queda recortada en parte.");
  }
  if (params.cazoletaProf > 0 && params.elevacionTalon > 0 && params.cazoletaProf + params.elevacionTalon > 24) {
    warnings.push("Cazoleta y elevación de talón suman mucho volumen: revisa que quepa en el calzado.");
  }

  return {
    positions,
    colors,
    stats: {
      minMm: min,
      maxMm: max,
      meanMm: sum / half,
      belowMin,
      lengthMm: y1 - y0,
      widthMm: widest,
      heelTopZ,
      warnings,
    },
  };
}

/* -------------------------------------------------------------------------- */
/*  Exportación STL y comprobación de malla cerrada                           */
/* -------------------------------------------------------------------------- */

/** STL binario de la ortesis (sin forro). Unidades: mm. */
export function insoleToSTL(positions: Float32Array, name: string): ArrayBuffer {
  const { topIndex, bodyIndex } = insoleTopology();
  const triCount = (topIndex.length + bodyIndex.length) / 3;
  const buffer = new ArrayBuffer(84 + triCount * 50);
  const view = new DataView(buffer);
  const header = `ZonaPies DEMO ${name}`.slice(0, 79);
  for (let i = 0; i < header.length; i++) view.setUint8(i, header.charCodeAt(i) & 0x7f);
  view.setUint32(80, triCount, true);

  let offset = 84;
  const write = (arr: Uint32Array) => {
    for (let k = 0; k < arr.length; k += 3) {
      const ia = arr[k] * 3;
      const ib = arr[k + 1] * 3;
      const ic = arr[k + 2] * 3;
      const ax = positions[ia];
      const ay = positions[ia + 1];
      const az = positions[ia + 2];
      const ux = positions[ib] - ax;
      const uy = positions[ib + 1] - ay;
      const uz = positions[ib + 2] - az;
      const vx = positions[ic] - ax;
      const vy = positions[ic + 1] - ay;
      const vz = positions[ic + 2] - az;
      let nx = uy * vz - uz * vy;
      let ny = uz * vx - ux * vz;
      let nz = ux * vy - uy * vx;
      const len = Math.hypot(nx, ny, nz) || 1;
      nx /= len;
      ny /= len;
      nz /= len;
      view.setFloat32(offset, nx, true);
      view.setFloat32(offset + 4, ny, true);
      view.setFloat32(offset + 8, nz, true);
      offset += 12;
      for (const ii of [ia, ib, ic]) {
        view.setFloat32(offset, positions[ii], true);
        view.setFloat32(offset + 4, positions[ii + 1], true);
        view.setFloat32(offset + 8, positions[ii + 2], true);
        offset += 12;
      }
      view.setUint16(offset, 0, true);
      offset += 2;
    }
  };
  write(topIndex);
  write(bodyIndex);
  return buffer;
}

/** Cuenta aristas por triángulos (malla cerrada ⇔ toda arista aparece exactamente dos veces). */
export function edgeStats(indexArrays: Uint32Array[]) {
  const counts = new Map<string, number>();
  let triangles = 0;
  for (const arr of indexArrays) {
    for (let k = 0; k < arr.length; k += 3) {
      triangles++;
      const t = [arr[k], arr[k + 1], arr[k + 2]];
      for (let e = 0; e < 3; e++) {
        const a = t[e];
        const b = t[(e + 1) % 3];
        const key = a < b ? `${a}_${b}` : `${b}_${a}`;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
  }
  let boundary = 0;
  let nonManifold = 0;
  for (const c of counts.values()) {
    if (c === 1) boundary++;
    else if (c > 2) nonManifold++;
  }
  return { triangles, edges: counts.size, boundary, nonManifold, closed: boundary === 0 && nonManifold === 0 };
}

/** Volumen firmado (mm³) para comprobar la orientación de las caras. */
export function signedVolume(positions: Float32Array, indexArrays: Uint32Array[]) {
  let vol = 0;
  for (const arr of indexArrays) {
    for (let k = 0; k < arr.length; k += 3) {
      const a = arr[k] * 3;
      const b = arr[k + 1] * 3;
      const c = arr[k + 2] * 3;
      const ax = positions[a], ay = positions[a + 1], az = positions[a + 2];
      const bx = positions[b], by = positions[b + 1], bz = positions[b + 2];
      const cx = positions[c], cy = positions[c + 1], cz = positions[c + 2];
      vol += (ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx)) / 6;
    }
  }
  return vol;
}
