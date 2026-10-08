/**
 * Línea de tiempo de la escena. Es una función PURA del «tiempo de historia» T (0–7):
 * la escena 3D y el fallback SVG leen de aquí, así que nunca se desincronizan.
 *
 *   T 0–1  SCAN         el pie se digitaliza (barrido láser → nube de puntos)
 *   T 1–2  ANALYZE      malla y puntos de análisis
 *   T 2–3  DESIGN       el pie se transforma en plantilla; la plantilla se construye
 *   T 3–4  MATERIAL     se explora el material
 *   T 4–5  MANUFACTURE  capas y trayectoria de fabricación
 *   T 5–6  RESULT       pieza terminada
 *   T 6–7  CTA          la pieza flota; llamada a la acción
 */
import { clamp, lerp, smoothstep as ss } from "./shape";

export const STORY_END = 7;

export interface Phase {
  id: "scan" | "analyze" | "design" | "material" | "manufacture" | "result" | "cta";
  n: string;
  hud: string;
}

export const PHASES: Phase[] = [
  { id: "scan", n: "01", hud: "SCAN" },
  { id: "analyze", n: "02", hud: "ANALYZE" },
  { id: "design", n: "03", hud: "DESIGN" },
  { id: "material", n: "04", hud: "MATERIAL" },
  { id: "manufacture", n: "05", hud: "MANUFACTURE" },
  { id: "result", n: "06", hud: "RESULT" },
  { id: "cta", n: "07", hud: "YOUR PATIENT" },
];

export const phaseIndex = (T: number) => Math.min(PHASES.length - 1, Math.max(0, Math.floor(T)));

export type ClipMode = "none" | "ahead" | "behind";

export interface SceneState {
  /** Pie (true) o plantilla (false) en la losa principal */
  slabFoot: boolean;
  slabVisible: boolean;
  /** «ahead»: se ve lo que está por delante del plano; «behind»: lo que queda detrás */
  slabClip: ClipMode;
  slabClipZ: number;
  /** Morfología 0 = pie, 1 = plantilla */
  morph: number;
  pointsOpacity: number;
  /** Los puntos solo se ven detrás del láser mientras dura el barrido */
  pointsClipZ: number;
  wireOpacity: number;
  laserAlpha: number;
  laserZ: number;
  /** Perfil de la sección que corta el láser, sobre el pie */
  profile: boolean;
  contour: { opacity: number; draw: number; lift: number; toolpath: boolean };
  anatomyMarkers: number;
  layerMarkers: number;
  layersVisible: boolean;
  layersClip: ClipMode;
  layersClipZ: number;
  explode: number;
  /** Giro de la pieza para enseñar el shell por debajo */
  flip: number;
  /** Peso del giro continuo de «turntable» */
  spin: number;
  /** Peso de la flotación final */
  float: number;
  /** Escala del conjunto */
  scale: number;
  /** Brillo del suelo técnico */
  platform: number;
}

export function sceneState(T: number): SceneState {
  const t = clamp(T, 0, STORY_END);

  // --- SCAN -----------------------------------------------------------------
  const scanActive = t >= 0.05 && t < 1.2;
  const scanP = ss(0.06, 0.96, t);
  const scanZ = lerp(-1.18, 1.18, scanP);
  const scanLaser = ss(0.05, 0.12, t) * (1 - ss(0.98, 1.1, t));

  // --- DESIGN: construcción de la plantilla ----------------------------------
  const buildP = ss(2.5, 3.35, t);
  const buildZ = lerp(-1.18, 0.85, buildP);
  const buildLaser = ss(2.5, 2.58, t) * (1 - ss(3.3, 3.42, t));

  // --- MANUFACTURE: sustitución de la losa por capas -------------------------
  const swapP = ss(3.95, 4.28, t);
  const swapZ = lerp(-1.18, 0.85, swapP);
  const swapLaser = ss(3.95, 4.02, t) * (1 - ss(4.2, 4.3, t));
  const swapping = t >= 3.95 && t < 4.32;

  let slabVisible = false;
  let slabFoot = false;
  let slabClip: ClipMode = "none";
  let slabClipZ = 0;

  if (t < 1.25) {
    slabVisible = true;
    slabFoot = true;
    slabClip = scanActive ? "ahead" : "none";
    slabClipZ = scanZ;
  } else if (t < 3.95) {
    slabVisible = t >= 2.5;
    slabClip = buildP < 1 ? "behind" : "none";
    slabClipZ = buildZ;
  } else if (swapping) {
    slabVisible = true;
    slabClip = "ahead";
    slabClipZ = swapZ;
  }

  const laserAlpha = Math.max(scanLaser, buildLaser, swapLaser);
  const laserZ = t < 1.5 ? scanZ : t < 3.6 ? buildZ : swapZ;

  // --- Contorno de plantilla / trayectoria ------------------------------------
  const hero = 1 - ss(0.05, 0.32, t);
  const designC = ss(1.7, 2.02, t) * (1 - ss(2.7, 3.0, t));
  const tool = ss(4.05, 4.25, t) * (1 - ss(4.85, 5.1, t));
  const contourOpacity = Math.max(hero, designC, tool);
  const toolpath = t > 3.5;
  const draw = t < 1.5 ? 1 : t < 3.5 ? ss(1.7, 2.3, t) : ss(4.1, 4.8, t);
  const lift = t < 1.5 ? 0.15 * hero + 0.012 : 0.012;

  // --- Capas --------------------------------------------------------------------
  const explode = ss(4.2, 4.6, t) * (1 - ss(4.95, 5.45, t));

  return {
    slabFoot,
    slabVisible,
    slabClip,
    slabClipZ,
    morph: ss(1.9, 2.55, t),
    pointsOpacity: scanActive || t >= 1.2 ? (1 - ss(2.7, 3.2, t)) * (1 - 0.62 * ss(1.05, 1.6, t)) : 0,
    pointsClipZ: t < 1.2 ? scanZ : 2,
    wireOpacity: ss(0.95, 1.45, t) * (1 - ss(2.75, 3.2, t)),
    laserAlpha,
    laserZ,
    profile: t < 1.15,
    contour: { opacity: contourOpacity, draw, lift, toolpath },
    anatomyMarkers: ss(1.05, 1.4, t) * (1 - ss(1.9, 2.2, t)),
    layerMarkers: ss(4.45, 4.65, t) * (1 - ss(4.95, 5.2, t)),
    layersVisible: t >= 3.95,
    layersClip: swapping ? "behind" : "none",
    layersClipZ: swapZ,
    explode,
    flip: ss(5.25, 5.95, t),
    spin: ss(5.0, 5.6, t),
    float: ss(5.9, 6.6, t),
    scale: lerp(1, 1.12, ss(5.9, 6.8, t)),
    platform: 0.35 + 0.65 * (1 - ss(5.4, 6.4, t)),
  };
}

/* -------------------------------------------------------------------------- */
/* Cámara                                                                     */
/* -------------------------------------------------------------------------- */

export interface CameraPose {
  /** Azimut en grados */
  az: number;
  /** Elevación en grados */
  el: number;
  dist: number;
  /** Punto al que mira */
  ty: number;
  tz: number;
}

// Azimut ~180°: la cámara mira desde el talón, los dedos quedan hacia el fondo (arriba en pantalla)
const KEYS: [number, CameraPose][] = [
  [0, { az: 148, el: 31, dist: 4.1, ty: 0.02, tz: -0.02 }],
  [1, { az: 165, el: 38, dist: 4.6, ty: 0.02, tz: 0.0 }],
  [1.5, { az: 180, el: 64, dist: 4.6, ty: 0.0, tz: 0.0 }],
  [2.2, { az: 190, el: 50, dist: 4.4, ty: 0.0, tz: -0.1 }],
  [3.0, { az: 202, el: 34, dist: 4.0, ty: 0.02, tz: -0.2 }],
  [3.6, { az: 218, el: 26, dist: 3.5, ty: 0.03, tz: -0.2 }],
  [4.3, { az: 206, el: 14, dist: 5.0, ty: 0.05, tz: -0.2 }],
  [5.0, { az: 186, el: 20, dist: 5.1, ty: 0.04, tz: -0.2 }],
  [5.7, { az: 152, el: 30, dist: 4.1, ty: 0.02, tz: -0.2 }],
  [6.5, { az: 138, el: 24, dist: 4.5, ty: 0.05, tz: -0.2 }],
  [7, { az: 126, el: 22, dist: 4.8, ty: 0.06, tz: -0.2 }],
];

export function cameraPose(T: number): CameraPose {
  const t = clamp(T, 0, STORY_END);
  let i = 0;
  while (i < KEYS.length - 2 && t > KEYS[i + 1][0]) i++;
  const [t0, a] = KEYS[i];
  const [t1, b] = KEYS[i + 1];
  const f = ss(t0, t1, t);
  return {
    az: lerp(a.az, b.az, f),
    el: lerp(a.el, b.el, f),
    dist: lerp(a.dist, b.dist, f),
    ty: lerp(a.ty, b.ty, f),
    tz: lerp(a.tz, b.tz, f),
  };
}
