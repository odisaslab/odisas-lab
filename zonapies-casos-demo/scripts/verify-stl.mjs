// Comprueba que un STL binario es una malla cerrada: cada arista compartida por exactamente dos triángulos.
// Uso: node scripts/verify-stl.mjs fichero.stl
import { readFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) { console.error('Uso: node scripts/verify-stl.mjs fichero.stl'); process.exit(2); }
const buf = readFileSync(file);
const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
const n = dv.getUint32(80, true);
if (buf.byteLength !== 84 + n * 50) { console.error(`STL binario incoherente: ${n} triángulos y ${buf.byteLength} bytes`); process.exit(1); }

const ids = new Map();
const vid = (x, y, z) => {
  const key = `${x},${y},${z}`;
  let id = ids.get(key);
  if (id === undefined) { id = ids.size; ids.set(key, id); }
  return id;
};
const edges = new Map();
let degenerate = 0;
let vol = 0;
let minZ = Infinity, maxZ = -Infinity, minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
for (let t = 0; t < n; t++) {
  let o = 84 + t * 50 + 12;
  const v = [], p = [];
  for (let k = 0; k < 3; k++) {
    const x = dv.getFloat32(o, true), y = dv.getFloat32(o + 4, true), z = dv.getFloat32(o + 8, true);
    o += 12;
    v.push(vid(x, y, z)); p.push([x, y, z]);
    minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z);
  }
  if (v[0] === v[1] || v[1] === v[2] || v[0] === v[2]) degenerate++;
  for (let e = 0; e < 3; e++) {
    const a = v[e], b = v[(e + 1) % 3];
    const key = a < b ? `${a}_${b}` : `${b}_${a}`;
    edges.set(key, (edges.get(key) ?? 0) + 1);
  }
  const [a, b, c] = p;
  vol += (a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0])) / 6;
}
let boundary = 0, nonManifold = 0;
for (const c of edges.values()) { if (c === 1) boundary++; else if (c > 2) nonManifold++; }
console.log(`triángulos: ${n} · vértices únicos: ${ids.size} · aristas: ${edges.size}`);
console.log(`aristas abiertas: ${boundary} · aristas no-manifold: ${nonManifold} · triángulos degenerados: ${degenerate}`);
console.log(`volumen firmado: ${(vol / 1000).toFixed(1)} cm³ · caja: ${(maxX - minX).toFixed(0)} × ${(maxY - minY).toFixed(0)} × ${(maxZ - minZ).toFixed(1)} mm`);
const ok = boundary === 0 && nonManifold === 0 && degenerate === 0 && vol > 0;
console.log(ok ? 'MALLA CERRADA: OK' : 'MALLA NO VÁLIDA');
process.exit(ok ? 0 : 1);
