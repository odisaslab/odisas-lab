/**
 * Lectura de un STL cargado por el usuario (función opcional de la demo).
 * Las MEDIDAS que devuelve son reales (caja envolvente, triángulos, malla cerrada);
 * el resto del análisis del escaneo sigue siendo simulado.
 */
import type { CustomScanInfo } from "./domain";

export function parseSTL(buffer: ArrayBuffer): Float32Array {
  const view = new DataView(buffer);
  if (buffer.byteLength >= 84) {
    const n = view.getUint32(80, true);
    if (buffer.byteLength === 84 + n * 50) {
      const out = new Float32Array(n * 9);
      let o = 84;
      for (let t = 0; t < n; t++) {
        o += 12; // normal
        for (let k = 0; k < 9; k++) {
          out[t * 9 + k] = view.getFloat32(o, true);
          o += 4;
        }
        o += 2;
      }
      return out;
    }
  }
  const text = new TextDecoder().decode(buffer);
  const nums: number[] = [];
  const re = /vertex\s+(\S+)\s+(\S+)\s+(\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) nums.push(Number(m[1]), Number(m[2]), Number(m[3]));
  if (nums.length < 9 || nums.length % 9 !== 0 || nums.some((v) => !Number.isFinite(v))) {
    throw new Error("No se reconoce el archivo como STL válido.");
  }
  return Float32Array.from(nums);
}

export function measureSTL(name: string, positions: Float32Array): CustomScanInfo {
  const tris = positions.length / 9;
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i], y = positions[i + 1], z = positions[i + 2];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  }
  const dims = [maxX - minX, maxY - minY, maxZ - minZ].sort((a, b) => b - a);

  let watertight = false;
  if (tris <= 300_000) {
    const q = (v: number) => Math.round(v * 1000);
    const ids = new Map<string, number>();
    const vid = (k: number) => {
      const key = `${q(positions[k])},${q(positions[k + 1])},${q(positions[k + 2])}`;
      let id = ids.get(key);
      if (id === undefined) {
        id = ids.size;
        ids.set(key, id);
      }
      return id;
    };
    const edges = new Map<string, number>();
    for (let t = 0; t < tris; t++) {
      const v = [vid(t * 9), vid(t * 9 + 3), vid(t * 9 + 6)];
      for (let e = 0; e < 3; e++) {
        const a = v[e];
        const b = v[(e + 1) % 3];
        const key = a < b ? `${a}_${b}` : `${b}_${a}`;
        edges.set(key, (edges.get(key) ?? 0) + 1);
      }
    }
    watertight = true;
    for (const c of edges.values()) {
      if (c !== 2) {
        watertight = false;
        break;
      }
    }
  }
  return { name, triangles: tris, lengthMm: dims[0], widthMm: dims[1], heightMm: dims[2], watertight };
}

export function downloadBlob(filename: string, data: BlobPart, type: string) {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}
