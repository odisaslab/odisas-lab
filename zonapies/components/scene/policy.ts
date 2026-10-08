/**
 * Política de rendimiento de la escena 3D.
 *
 *  full → escritorio con GPU razonable: escena completa
 *  lite → táctil, pantalla estrecha o equipo modesto: malla y DPR reducidos, sin reflejos
 *  none → sin WebGL, movimiento reducido, ahorro de datos o equipo muy limitado: ilustración SVG
 *
 * Para pruebas: ?scene=full|lite|none en la URL fuerza el nivel.
 */
export type ScenePolicy = "full" | "lite" | "none";

const DOWNGRADE_KEY = "zp-scene-cap";
const ORDER: ScenePolicy[] = ["none", "lite", "full"];

function webglAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl2") || canvas.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/** Límite máximo recordado en esta sesión si el equipo ya demostró ir justo. */
export function readCap(): ScenePolicy | null {
  try {
    const value = window.sessionStorage.getItem(DOWNGRADE_KEY) as ScenePolicy | null;
    return value && ORDER.includes(value) ? value : null;
  } catch {
    return null;
  }
}

export function writeCap(cap: ScenePolicy) {
  try {
    window.sessionStorage.setItem(DOWNGRADE_KEY, cap);
  } catch {
    /* almacenamiento bloqueado: se ignora */
  }
}

export function detectPolicy(): ScenePolicy {
  if (typeof window === "undefined") return "none";

  const forced = new URLSearchParams(window.location.search).get("scene") as ScenePolicy | null;
  if (forced && ORDER.includes(forced)) return forced;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "none";

  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return "none";
  if (!webglAvailable()) return "none";

  const memory = nav.deviceMemory;
  const cores = navigator.hardwareConcurrency || 4;
  if ((memory !== undefined && memory <= 2) || cores <= 2) return "none";

  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.innerWidth < 900;
  let policy: ScenePolicy = coarse || narrow || cores <= 4 || (memory !== undefined && memory <= 4) ? "lite" : "full";

  const cap = readCap();
  if (cap && ORDER.indexOf(cap) < ORDER.indexOf(policy)) policy = cap;
  return policy;
}

export const lower = (policy: ScenePolicy): ScenePolicy => ORDER[Math.max(0, ORDER.indexOf(policy) - 1)];
