// Comprobación de la geometría en Node (sin navegador). Uso: node scripts/check-geometry.mjs
import {
  DEFAULT_PARAMS, PARAM_SPECS, computeInsole, insoleTopology, edgeStats, signedVolume,
  insoleToSTL, buildFootMesh, FOOT_LENGTH_MM,
} from '../lib/geometry.ts';

let failures = 0;
const check = (ok, msg) => { console.log(`${ok ? 'OK  ' : 'FALLA'} ${msg}`); if (!ok) failures++; };

const topo = insoleTopology();
const closed = edgeStats([topo.topIndex, topo.bodyIndex]);
check(closed.closed, `topología cerrada: ${closed.triangles} triángulos, ${closed.edges} aristas, frontera=${closed.boundary}, no-manifold=${closed.nonManifold}`);

for (const side of ['derecho', 'izquierdo']) {
  for (const largo of ['completa', 'tres_cuartos']) {
    const p = { ...DEFAULT_PARAMS, largo };
    const r = computeInsole(p, side, 2.0);
    const finite = r.positions.every(Number.isFinite) && r.colors.every(Number.isFinite);
    const vol = signedVolume(r.positions, [topo.topIndex, topo.bodyIndex]);
    check(finite, `${side}/${largo}: sin NaN`);
    check(vol > 1000, `${side}/${largo}: volumen firmado positivo = ${vol.toFixed(0)} mm³ (caras hacia fuera)`);
    check(r.stats.minMm >= p.grosorBase - 1e-6, `${side}/${largo}: grosor mín ${r.stats.minMm.toFixed(2)} ≥ base ${p.grosorBase}`);
    console.log(`     largo=${r.stats.lengthMm.toFixed(0)} mm, ancho=${r.stats.widthMm.toFixed(0)} mm, grosor ${r.stats.minMm.toFixed(1)}–${r.stats.maxMm.toFixed(1)} mm, talón z=${r.stats.heelTopZ.toFixed(1)}`);
  }
}

// Extremos de cada parámetro: sin NaN y volumen positivo
for (const spec of PARAM_SPECS) {
  for (const val of [spec.min, spec.max]) {
    const p = { ...DEFAULT_PARAMS, [spec.key]: val };
    const r = computeInsole(p, 'derecho', 2.0);
    const vol = signedVolume(r.positions, [topo.topIndex, topo.bodyIndex]);
    const ok = r.positions.every(Number.isFinite) && vol > 0;
    if (!ok) check(false, `extremo ${spec.key}=${val}`);
  }
}
check(true, `extremos de ${PARAM_SPECS.length} parámetros evaluados`);

// Una combinación exigente
const hard = { ...DEFAULT_PARAMS, arcoAltura: 16, cazoletaProf: 18, elevacionTalon: 12, cunaRetropie: 6, cunaAntepie: -6, barraAltura: 8 };
const rh = computeInsole(hard, 'izquierdo', 2.0);
check(signedVolume(rh.positions, [topo.topIndex, topo.bodyIndex]) > 0, `combinación exigente OK (grosor máx ${rh.stats.maxMm.toFixed(1)} mm, avisos: ${rh.stats.warnings.length})`);

// Aviso por debajo del mínimo
const thin = computeInsole({ ...DEFAULT_PARAMS, grosorBase: 1.2 }, 'derecho', 2.0);
check(thin.stats.belowMin > 0 && thin.stats.warnings.length > 0, `aviso de grosor mínimo se activa con base 1.2 (${thin.stats.belowMin} vértices)`);

// STL
const stl = insoleToSTL(computeInsole(DEFAULT_PARAMS, 'derecho', 2.0).positions, 'test');
const dv = new DataView(stl);
const n = dv.getUint32(80, true);
check(stl.byteLength === 84 + n * 50 && n === closed.triangles, `STL binario coherente: ${n} triángulos, ${stl.byteLength} bytes`);

// Pie sintético
for (const side of ['derecho', 'izquierdo']) {
  const f = buildFootMesh(side);
  const fh = buildFootMesh(side, { holeHeel: true });
  check(f.positions.every(Number.isFinite) && f.indices.length > 0, `pie ${side}: ${f.indices.length / 3} triángulos, ancho ${f.widthMm} mm`);
  check(fh.hole !== null && fh.indices.length < f.indices.length, `pie ${side} con hueco: ${(f.indices.length - fh.indices.length) / 3} triángulos omitidos`);
}
console.log(`\nLongitud del pie sintético: ${FOOT_LENGTH_MM} mm`);
if (failures) { console.error(`\n${failures} comprobaciones fallidas`); process.exit(1); }
console.log('\nTodas las comprobaciones de geometría pasan.');
