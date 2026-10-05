/**
 * Joya facetada de titanio dibujada en Canvas 2D con geometría 3D propia (sin librerías):
 * 33 facetas, orden de pintor, luz de estudio y destellos especulares. Girarla = mover `rotY`.
 */
const N = 8;

function build() {
  const ring = (r, y, off = 0) =>
    Array.from({ length: N }, (_, i) => {
      const a = ((i + off) / N) * Math.PI * 2;
      return [Math.cos(a) * r, y, Math.sin(a) * r];
    });
  const table = ring(0.52, 0.62);
  const crown = ring(1.0, 0.2);
  const girdle = ring(1.0, 0.1);
  const mid = ring(0.56, -0.42);
  const culet = [0, -0.98, 0];
  const faces = [{ k: 'table', v: table }];
  for (let i = 0; i < N; i++) {
    const j = (i + 1) % N;
    faces.push({ k: 'crown', v: [table[i], table[j], crown[j], crown[i]], i });
    faces.push({ k: 'girdle', v: [crown[i], crown[j], girdle[j], girdle[i]], i });
    faces.push({ k: 'pav', v: [girdle[i], girdle[j], mid[j], mid[i]], i });
    faces.push({ k: 'tip', v: [mid[i], mid[j], culet], i });
  }
  return faces;
}
const FACES = build();

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm3 = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const mixc = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

const L1 = norm3([-0.5, 0.85, 0.7]);
const L2 = norm3([0.8, 0.1, 0.5]);
// paleta de titanio: del gris acero al blanco, con un toque rosado/azulado anodizado
const TONES = [[22, 26, 38], [58, 64, 84], [118, 126, 150], [188, 196, 214], [246, 247, 252]];
const toneAt = (s) => {
  const x = Math.min(0.999, Math.max(0, s)) * (TONES.length - 1), i = Math.floor(x);
  return mixc(TONES[i], TONES[i + 1], x - i);
};

export function createJewel(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height, cx = W / 2, cy = H / 2;
  const scale = W * 0.31, cam = 4.2;

  function draw({ rotY = 0, rotX = 0.42, glow = 1, t = 0, hue = 0 } = {}) {
    ctx.clearRect(0, 0, W, H);
    // aura
    const g = ctx.createRadialGradient(cx, cy, W * 0.05, cx, cy, W * 0.5);
    g.addColorStop(0, `rgba(255,236,240,${0.16 * glow})`);
    g.addColorStop(0.5, `rgba(231,120,143,${0.07 * glow})`);
    g.addColorStop(1, 'rgba(231,120,143,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    const cyw = Math.cos(rotY), syw = Math.sin(rotY), cxw = Math.cos(rotX), sxw = Math.sin(rotX);
    const tr = (p) => {
      const x = p[0] * cyw + p[2] * syw, z0 = -p[0] * syw + p[2] * cyw;
      const y = p[1] * cxw - z0 * sxw, z = p[1] * sxw + z0 * cxw;
      return [x, y, z];
    };
    const drawn = [];
    for (const f of FACES) {
      const v = f.v.map(tr);
      const n = norm3(cross(sub(v[1], v[0]), sub(v[2], v[0])));
      // la normal debe apuntar hacia fuera (al centro de la joya)
      const c = v.reduce((a, p) => [a[0] + p[0], a[1] + p[1], a[2] + p[2]], [0, 0, 0]).map((q) => q / v.length);
      const nn = dot(n, c) < 0 ? [-n[0], -n[1], -n[2]] : n;
      if (nn[2] < -0.04) continue; // cara trasera
      drawn.push({ f, v, n: nn, z: c[2] });
    }
    drawn.sort((a, b) => a.z - b.z);
    for (const d of drawn) {
      const { n } = d;
      const key = Math.max(0, dot(n, L1)), fill = Math.max(0, dot(n, L2));
      const R = [2 * dot(n, [0, 0, 1]) * n[0], 2 * dot(n, [0, 0, 1]) * n[1], 2 * dot(n, [0, 0, 1]) * n[2] - 1];
      const spec = Math.pow(Math.max(0, dot(norm3(R), L1)), 26);
      let s = 0.12 + 0.62 * key + 0.28 * fill;
      if (d.f.k === 'table') s = 0.35 + 0.5 * key + 0.15 * Math.sin(t * 0.8 + rotY * 2);
      // bandas de reflejo de «entorno» que cambian al girar: sensación de metal pulido
      s += 0.18 * Math.sin((n[0] * 3.1 + n[1] * 2.3) + rotY * 1.6) * (d.f.k === 'tip' || d.f.k === 'pav' ? 1 : 0.5);
      let col = toneAt(s);
      const irid = 0.5 + 0.5 * Math.sin(n[0] * 4 + n[1] * 3 + rotY * 1.2 + hue);
      col = mixc(col, [214, 150, 176], 0.16 * irid * (0.4 + key)); // reflejo rosado anodizado
      col = mixc(col, [255, 255, 255], Math.min(1, spec * 0.95));
      ctx.beginPath();
      d.v.forEach((p, i) => {
        const k = cam / (cam + p[2] * 0.0 + 0.0 + (cam - cam)); // proyección ortográfica suave
        const px = cx + p[0] * scale * (1 + p[2] * 0.06) * k, py = cy - p[1] * scale * (1 + p[2] * 0.06) * k;
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      });
      ctx.closePath();
      ctx.fillStyle = `rgb(${col.map(Math.round).join(',')})`;
      ctx.fill();
      ctx.lineWidth = 1.1;
      ctx.strokeStyle = `rgba(255,255,255,${0.1 + 0.2 * spec + 0.08 * key})`;
      ctx.stroke();
      if (spec > 0.35) {
        // destello puntual en la faceta que mira a la luz
        const m = d.v.reduce((a, p) => [a[0] + p[0], a[1] + p[1]], [0, 0]).map((q) => q / d.v.length);
        const sx = cx + m[0] * scale, sy = cy - m[1] * scale, r = W * 0.05 * spec;
        const gg = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
        gg.addColorStop(0, `rgba(255,255,255,${0.9 * spec})`);
        gg.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gg;
        ctx.fillRect(sx - r, sy - r, r * 2, r * 2);
      }
    }
  }
  return { draw };
}
