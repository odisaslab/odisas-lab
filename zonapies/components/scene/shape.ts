/**
 * Geometría procedural del pie (superficie plantar) y de la plantilla.
 * Matemática pura, sin Three.js: la usan la escena 3D y el fallback SVG.
 *
 * Convenciones: x = ancho (lado medial hacia -x), z = largo (talón en -1, dedos en +1),
 * y = altura. Unidades: el pie mide 2.0 de largo (≈ 26 cm → 1 unidad ≈ 13 cm).
 *
 * Idea clave: pie y plantilla comparten TOPOLOGÍA. Ambos son una malla polar (anillos
 * concéntricos + radios) cuyo contorno se parametriza por el mismo índice. Así el pie se
 * transforma en plantilla interpolando vértice a vértice: los dedos se pliegan sobre el
 * borde delantero.
 *
 * Es una representación ilustrativa y estilizada, NO un modelo anatómico clínico.
 * Para usar un modelo real, ver el README (sección «Sustituir el modelo 3D»).
 */

export type V2 = [number, number];

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
const gauss = (x: number, z: number, cx: number, cz: number, sx: number, sz: number) =>
  Math.exp(-(((x - cx) / sx) ** 2 + ((z - cz) / sz) ** 2));

/** Centro de la malla polar. */
export const CENTER: V2 = [-0.02, -0.12];
/** Plano de apoyo del modelo de pie (la base de «escayola»). */
export const FOOT_BASE_Y = -0.085;
/** Grosor de la plantilla (exagerado a propósito para que se lea en pantalla). */
export const INSOLE_THICKNESS = 0.075;

/* -------------------------------------------------------------------------- */
/* Contorno                                                                   */
/* -------------------------------------------------------------------------- */

// Dedos: [centro x, semiancho, z de la punta]. De lateral (5.º) a medial (hallux).
// Cada dedo es una cápsula elíptica; entre dedos queda una hendidura poco profunda.
const TOE_CAPS: [number, number, number][] = [
  [0.29, 0.06, 0.8],
  [0.17, 0.058, 0.87],
  [0.06, 0.058, 0.915],
  [-0.055, 0.062, 0.945],
  [-0.215, 0.105, 0.99],
];

function buildFootControl(): V2[] {
  const points: V2[] = [
    // Talón y borde lateral
    [0.0, -1.0],
    [0.16, -0.97],
    [0.255, -0.87],
    [0.29, -0.7],
    [0.285, -0.46],
    [0.275, -0.2],
    [0.31, 0.08],
    [0.37, 0.3],
    [0.392, 0.46],
    [0.378, 0.6],
  ];

  TOE_CAPS.forEach(([xc, w, zTip], index) => {
    const h = Math.min(0.12, w * 1.15);
    const zc = zTip - h;
    // Hendidura previa (entre el dedo anterior y éste): a la altura del ecuador del más bajo
    if (index > 0) {
      const [pxc, pw, pzTip] = TOE_CAPS[index - 1];
      const prevZc = pzTip - Math.min(0.12, pw * 1.15);
      points.push([(pxc - pw + xc + w) / 2, Math.min(prevZc, zc) - 0.004]);
    }
    for (const deg of [0, 35, 70, 90, 110, 145, 180]) {
      const a = (deg * Math.PI) / 180;
      // Se omiten los extremos que coinciden con la hendidura para no duplicar puntos
      if (index > 0 && deg === 0) continue;
      points.push([xc + w * Math.cos(a), zc + h * Math.sin(a)]);
    }
  });

  points.push(
    // Borde medial hacia el talón, con el arco
    [-0.345, 0.77],
    [-0.39, 0.62],
    [-0.41, 0.46],
    [-0.36, 0.26],
    [-0.28, 0.06],
    [-0.235, -0.14],
    [-0.24, -0.38],
    [-0.265, -0.62],
    [-0.255, -0.82],
    [-0.19, -0.94],
    [-0.1, -0.99],
  );
  return points;
}

const FOOT_CONTROL: V2[] = buildFootControl();

/** Catmull-Rom centrípeta cerrada → polilínea densa. */
function densify(points: V2[], perSegment = 28): V2[] {
  const n = points.length;
  const out: V2[] = [];
  const dist = (a: V2, b: V2) => Math.hypot(b[0] - a[0], b[1] - a[1]) || 1e-6;

  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];
    const t0 = 0;
    const t1 = t0 + Math.sqrt(dist(p0, p1));
    const t2 = t1 + Math.sqrt(dist(p1, p2));
    const t3 = t2 + Math.sqrt(dist(p2, p3));

    for (let k = 0; k < perSegment; k++) {
      const t = t1 + ((t2 - t1) * k) / perSegment;
      const mix = (a: V2, b: V2, ta: number, tb: number): V2 => {
        const f = (t - ta) / (tb - ta);
        return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
      };
      const a1 = mix(p0, p1, t0, t1);
      const a2 = mix(p1, p2, t1, t2);
      const a3 = mix(p2, p3, t2, t3);
      const b1 = mix(a1, a2, t0, t2);
      const b2 = mix(a2, a3, t1, t3);
      out.push(mix(b1, b2, t1, t2));
    }
  }
  return out;
}

/** Remuestrea una polilínea cerrada en `count` puntos equidistantes en longitud de arco. */
function resample(poly: V2[], count: number): V2[] {
  const n = poly.length;
  const cumulative = new Float64Array(n + 1);
  for (let i = 0; i < n; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % n];
    cumulative[i + 1] = cumulative[i] + Math.hypot(b[0] - a[0], b[1] - a[1]);
  }
  const total = cumulative[n];
  const out: V2[] = [];
  let seg = 0;
  for (let j = 0; j < count; j++) {
    const target = (j / count) * total;
    while (seg < n - 1 && cumulative[seg + 1] < target) seg++;
    const span = cumulative[seg + 1] - cumulative[seg] || 1e-9;
    const f = (target - cumulative[seg]) / span;
    const a = poly[seg];
    const b = poly[(seg + 1) % n];
    out.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]);
  }
  return out;
}

/** Dónde se corta la plantilla y cómo se redondea su borde delantero (mínimo suave: sin ganchos). */
function toInsole([x, z]: V2): V2 {
  const arc = 0.64 - 0.17 * Math.min(1, Math.abs(x) / 0.43) ** 2.2;
  const k = 46;
  const soft = -Math.log(Math.exp(-k * z) + Math.exp(-k * arc)) / k;
  return [x * (1 - 0.04 * smoothstep(0.3, 0.6, soft)), soft];
}

export interface Outlines {
  foot: V2[];
  insole: V2[];
}

const outlineCache = new Map<number, Outlines>();

/** Contornos de pie y plantilla con `count` puntos correspondientes uno a uno. */
export function getOutlines(count: number): Outlines {
  const cached = outlineCache.get(count);
  if (cached) return cached;
  const foot = resample(densify(FOOT_CONTROL), count);
  const insole = foot.map(toInsole);
  const result = { foot, insole };
  outlineCache.set(count, result);
  return result;
}

/* -------------------------------------------------------------------------- */
/* Campos de altura                                                           */
/* -------------------------------------------------------------------------- */

const TOES: [number, number, number][] = [
  [-0.2, 0.9, 0.09],
  [-0.015, 0.85, 0.045],
  [0.085, 0.81, 0.04],
  [0.185, 0.77, 0.04],
  [0.295, 0.7, 0.045],
];

/** Relieve de la superficie plantar del pie (arco elevado, talón y antepié en relieve, dedos). */
export function footHeight(x: number, z: number): number {
  const arch = gauss(x, z, -0.16, -0.06, 0.15, 0.3) * 0.17;
  const heel = gauss(x, z, 0.0, -0.7, 0.22, 0.2) * 0.065;
  const ball = gauss(x, z, 0.0, 0.38, 0.36, 0.1) * 0.06;
  let toes = 0;
  for (const [tx, tz, tw] of TOES) toes += gauss(x, z, tx, tz, tw, 0.09) * 0.05;
  return 0.03 + arch + heel + ball + toes;
}

/** Superficie superior de la plantilla: soporte del arco, copa de talón, bordes. */
export function insoleHeight(x: number, z: number, rn: number): number {
  const arch = gauss(x, z, -0.16, -0.06, 0.16, 0.33) * 0.15;
  const heelWeight = 1 - smoothstep(-0.55, -0.12, z);
  const cup = smoothstep(0.6, 1.0, rn) * heelWeight * 0.135;
  const rim = smoothstep(0.82, 1.0, rn) * (1 - heelWeight) * 0.03;
  const pad = gauss(x, z, -0.05, 0.27, 0.2, 0.08) * 0.028;
  return 0.04 + arch + cup + rim + pad;
}

/* -------------------------------------------------------------------------- */
/* Malla                                                                      */
/* -------------------------------------------------------------------------- */

export interface ShapeSpec {
  /** Anillos concéntricos */
  rings: number;
  /** Puntos del contorno (múltiplo de 8) */
  segments: number;
}

export type ShapeState = "foot" | "insole";

export interface ShapeModel {
  spec: ShapeSpec;
  /** Vértices de la superficie superior: 1 (centro) + rings × segments */
  topCount: number;
  /** Vértices totales de la losa: superior + inferior + pared (2 × segments) */
  vertexCount: number;
  outline: Outlines;
  /** Índices de triángulos de la losa cerrada */
  indices: Uint32Array;
  /** Índices de segmentos de la rejilla de alambre (sobre los vértices superiores) */
  wireIndices: Uint32Array;
  /** Radio normalizado (0–1) de cada vértice superior */
  rn: Float32Array;
  /** Posiciones de la losa completa en cada estado (para interpolar en CPU) */
  slab: Record<ShapeState, Float32Array>;
  normals: Record<ShapeState, Float32Array>;
  /** Contorno de la plantilla elevado sobre la superficie del pie / de la plantilla */
  topIndex: (ring: number, seg: number) => number;
  /** Rango x del pie a una z dada (para el perfil del escáner) */
  footXRange: (z: number) => [number, number];
}

const ringRadius = (k: number, rings: number) => Math.sqrt(k / rings);

function computeNormals(positions: Float32Array, indices: Uint32Array): Float32Array {
  const normals = new Float32Array(positions.length);
  for (let i = 0; i < indices.length; i += 3) {
    const a = indices[i] * 3;
    const b = indices[i + 1] * 3;
    const c = indices[i + 2] * 3;
    const ux = positions[b] - positions[a];
    const uy = positions[b + 1] - positions[a + 1];
    const uz = positions[b + 2] - positions[a + 2];
    const vx = positions[c] - positions[a];
    const vy = positions[c + 1] - positions[a + 1];
    const vz = positions[c + 2] - positions[a + 2];
    const nx = uy * vz - uz * vy;
    const ny = uz * vx - ux * vz;
    const nz = ux * vy - uy * vx;
    for (const idx of [a, b, c]) {
      normals[idx] += nx;
      normals[idx + 1] += ny;
      normals[idx + 2] += nz;
    }
  }
  for (let i = 0; i < normals.length; i += 3) {
    const l = Math.hypot(normals[i], normals[i + 1], normals[i + 2]) || 1;
    normals[i] /= l;
    normals[i + 1] /= l;
    normals[i + 2] /= l;
  }
  return normals;
}

/**
 * Posiciones de una losa (superficie superior + inferior + pared) en un estado.
 * `f0`/`f1` recortan la losa de la plantilla en una capa: fracción del grosor.
 */
export function slabPositions(model: Pick<ShapeModel, "spec" | "outline" | "rn">, state: ShapeState, f0 = 0, f1 = 1): Float32Array {
  const { rings, segments } = model.spec;
  const topCount = 1 + rings * segments;
  const out = new Float32Array((2 * topCount + 2 * segments) * 3);
  const outline = state === "foot" ? model.outline.foot : model.outline.insole;
  const [cx, cz] = CENTER;

  const put = (index: number, x: number, y: number, z: number) => {
    out[index * 3] = x;
    out[index * 3 + 1] = y;
    out[index * 3 + 2] = z;
  };
  const surface = (x: number, z: number, rn: number) => (state === "foot" ? footHeight(x, z) : insoleHeight(x, z, rn));
  const topY = (x: number, z: number, rn: number) => surface(x, z, rn) - (state === "insole" ? INSOLE_THICKNESS * f0 : 0);
  const bottomY = (x: number, z: number, rn: number) =>
    state === "foot" ? FOOT_BASE_Y : surface(x, z, rn) - INSOLE_THICKNESS * f1;

  // Centro
  put(0, cx, topY(cx, cz, 0), cz);
  put(topCount, cx, bottomY(cx, cz, 0), cz);

  for (let k = 1; k <= rings; k++) {
    const r = ringRadius(k, rings);
    for (let j = 0; j < segments; j++) {
      const x = cx + r * (outline[j][0] - cx);
      const z = cz + r * (outline[j][1] - cz);
      const i = 1 + (k - 1) * segments + j;
      put(i, x, topY(x, z, r), z);
      put(topCount + i, x, bottomY(x, z, r), z);
    }
  }

  // Pared: copia del último anillo, arriba y abajo (aristas vivas)
  const wallTop = 2 * topCount;
  const wallBottom = wallTop + segments;
  for (let j = 0; j < segments; j++) {
    const x = outline[j][0];
    const z = outline[j][1];
    put(wallTop + j, x, topY(x, z, 1), z);
    put(wallBottom + j, x, bottomY(x, z, 1), z);
  }
  return out;
}

const modelCache = new Map<string, ShapeModel>();

export function buildShapeModel(spec: ShapeSpec): ShapeModel {
  const key = `${spec.rings}x${spec.segments}`;
  const cached = modelCache.get(key);
  if (cached) return cached;

  const { rings, segments } = spec;
  const topCount = 1 + rings * segments;
  const vertexCount = 2 * topCount + 2 * segments;
  const outline = getOutlines(segments);
  const topIndex = (ring: number, seg: number) => (ring === 0 ? 0 : 1 + (ring - 1) * segments + (((seg % segments) + segments) % segments));

  // Radio normalizado por vértice superior
  const rn = new Float32Array(topCount);
  for (let k = 1; k <= rings; k++) {
    const r = ringRadius(k, rings);
    for (let j = 0; j < segments; j++) rn[topIndex(k, j)] = r;
  }

  // Triángulos
  const tri: number[] = [];
  const bottom = (i: number) => topCount + i;
  // Abanico central
  for (let j = 0; j < segments; j++) {
    const a = topIndex(1, j);
    const b = topIndex(1, j + 1);
    tri.push(0, b, a); // superior (normal +y)
    tri.push(bottom(0), bottom(a), bottom(b)); // inferior (normal -y)
  }
  for (let k = 1; k < rings; k++) {
    for (let j = 0; j < segments; j++) {
      const a = topIndex(k, j);
      const b = topIndex(k, j + 1);
      const c = topIndex(k + 1, j);
      const d = topIndex(k + 1, j + 1);
      tri.push(a, b, c, b, d, c);
      tri.push(bottom(a), bottom(c), bottom(b), bottom(b), bottom(c), bottom(d));
    }
  }
  // Pared
  const wallTop = 2 * topCount;
  const wallBottom = wallTop + segments;
  for (let j = 0; j < segments; j++) {
    const j2 = (j + 1) % segments;
    tri.push(wallTop + j, wallBottom + j, wallTop + j2, wallTop + j2, wallBottom + j, wallBottom + j2);
  }
  const indices = new Uint32Array(tri);

  // Rejilla de alambre: anillos pares y radios espaciados, sobre la superficie superior
  const wire: number[] = [];
  for (let k = 3; k <= rings; k += 3) {
    for (let j = 0; j < segments; j++) wire.push(topIndex(k, j), topIndex(k, j + 1));
  }
  const spokeEvery = Math.max(6, Math.round(segments / 22));
  const firstSpokeRing = Math.max(4, Math.round(rings * 0.3));
  for (let j = 0; j < segments; j += spokeEvery) {
    for (let k = firstSpokeRing; k < rings; k++) wire.push(topIndex(k, j), topIndex(k + 1, j));
  }
  const wireIndices = new Uint32Array(wire);

  const partial = { spec, outline, rn };
  const slab = {
    foot: slabPositions(partial, "foot"),
    insole: slabPositions(partial, "insole"),
  };
  const normals = {
    foot: computeNormals(slab.foot, indices),
    insole: computeNormals(slab.insole, indices),
  };

  // Rango x del contorno del pie por altura z (tabla de 256 posiciones)
  const BINS = 256;
  const ranges: [number, number][] = [];
  for (let b = 0; b < BINS; b++) {
    const z = -1 + (2 * (b + 0.5)) / BINS;
    let min = Infinity;
    let max = -Infinity;
    for (let j = 0; j < segments; j++) {
      const [x1, z1] = outline.foot[j];
      const [x2, z2] = outline.foot[(j + 1) % segments];
      if ((z1 <= z && z2 > z) || (z2 <= z && z1 > z)) {
        const x = x1 + ((z - z1) / (z2 - z1)) * (x2 - x1);
        min = Math.min(min, x);
        max = Math.max(max, x);
      }
    }
    ranges.push(Number.isFinite(min) ? [min, max] : [0, 0]);
  }
  const footXRange = (z: number): [number, number] => ranges[Math.min(BINS - 1, Math.max(0, Math.floor(((z + 1) / 2) * BINS)))];

  const model: ShapeModel = { spec, topCount, vertexCount, outline, indices, wireIndices, rn, slab, normals, topIndex, footXRange };
  modelCache.set(key, model);
  return model;
}

/* -------------------------------------------------------------------------- */
/* Nube de puntos del escaneo                                                 */
/* -------------------------------------------------------------------------- */

export interface PointCloud {
  count: number;
  foot: Float32Array;
  insole: Float32Array;
}

/** Puntos repartidos con la secuencia R2 (baja discrepancia: parecen datos de escáner, sin grumos). */
export function buildPointCloud(count: number, segments: number): PointCloud {
  const { foot, insole } = getOutlines(segments);
  const g = 1.32471795724474602596; // constante plástica
  const a1 = 1 / g;
  const a2 = 1 / (g * g);
  const [cx, cz] = CENTER;

  const footPts = new Float32Array(count * 3);
  const insolePts = new Float32Array(count * 3);

  // Pseudo-ruido determinista
  let seed = 1337;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647 - 0.5;
  };

  const sample = (outline: V2[], s: number): V2 => {
    const f = s * segments;
    const i = Math.floor(f) % segments;
    const t = f - Math.floor(f);
    const p = outline[i];
    const q = outline[(i + 1) % segments];
    return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
  };

  for (let i = 0; i < count; i++) {
    const s = (0.5 + a1 * (i + 1)) % 1;
    const u = (0.5 + a2 * (i + 1)) % 1;
    const r = Math.sqrt(u);

    const pf = sample(foot, s);
    const xf = cx + r * (pf[0] - cx);
    const zf = cz + r * (pf[1] - cz);
    footPts[i * 3] = xf + rand() * 0.006;
    footPts[i * 3 + 1] = footHeight(xf, zf) + rand() * 0.008;
    footPts[i * 3 + 2] = zf + rand() * 0.006;

    const pi = sample(insole, s);
    const xi = cx + r * (pi[0] - cx);
    const zi = cz + r * (pi[1] - cz);
    insolePts[i * 3] = xi;
    insolePts[i * 3 + 1] = insoleHeight(xi, zi, r) + 0.004;
    insolePts[i * 3 + 2] = zi;
  }
  return { count, foot: footPts, insole: insolePts };
}

/** Puntos anatómicos de referencia para el HUD (solo regiones, sin medidas). */
export const ANATOMY_MARKS: { id: string; label: string; x: number; z: number }[] = [
  { id: "heel", label: "Talón", x: 0.0, z: -0.7 },
  { id: "arch", label: "Arco longitudinal", x: -0.2, z: -0.05 },
  { id: "fifth", label: "Borde lateral", x: 0.28, z: 0.1 },
  { id: "ball", label: "Antepié", x: 0.02, z: 0.4 },
  { id: "hallux", label: "Hallux", x: -0.2, z: 0.9 },
];
