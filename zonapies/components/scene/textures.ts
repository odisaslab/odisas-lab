/**
 * Texturas de material generadas por código (canvas 2D, sin archivos externos).
 * Las usa la escena 3D (mapa de color + relieve) y el «macro» 2D del Material Lab.
 *
 * Son representaciones ilustrativas del aspecto de cada familia de material, no
 * fotografías ni especificaciones del producto de Zona Pies.
 */

export type MaterialId = "resina" | "eva" | "pa11" | "composite" | "carbono" | "memory" | "forro" | "clay";

export interface TexturePair {
  color: HTMLCanvasElement;
  bump: HTMLCanvasElement;
}

/** PRNG determinista: la textura es idéntica en cada carga. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Ruido de valor periódico (teselable) con interpolación suave. */
function makeNoise(size: number, cells: number, seed: number) {
  const rand = mulberry32(seed);
  const grid = new Float32Array(cells * cells);
  for (let i = 0; i < grid.length; i++) grid[i] = rand();
  return (x: number, y: number) => {
    const fx = (x / size) * cells;
    const fy = (y / size) * cells;
    const x0 = Math.floor(fx);
    const y0 = Math.floor(fy);
    const tx = fx - x0;
    const ty = fy - y0;
    const sx = tx * tx * (3 - 2 * tx);
    const sy = ty * ty * (3 - 2 * ty);
    const at = (ix: number, iy: number) => grid[(((iy % cells) + cells) % cells) * cells + (((ix % cells) + cells) % cells)];
    const a = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * sx;
    const b = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * sx;
    return a + (b - a) * sy;
  };
}

type Rgb = [number, number, number];
const hex = (value: string): Rgb => {
  const n = parseInt(value.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const mix = (a: Rgb, b: Rgb, t: number): Rgb => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

function makeCanvas(size: number) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: false })!;
  return { canvas, ctx, image: ctx.createImageData(size, size) };
}

type Pixel = (x: number, y: number) => { color: Rgb; height: number };

function paint(size: number, pixel: Pixel): TexturePair {
  const c = makeCanvas(size);
  const b = makeCanvas(size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const { color, height } = pixel(x, y);
      const i = (y * size + x) * 4;
      c.image.data[i] = color[0];
      c.image.data[i + 1] = color[1];
      c.image.data[i + 2] = color[2];
      c.image.data[i + 3] = 255;
      const h = Math.round(clamp01(height) * 255);
      b.image.data[i] = h;
      b.image.data[i + 1] = h;
      b.image.data[i + 2] = h;
      b.image.data[i + 3] = 255;
    }
  }
  c.ctx.putImageData(c.image, 0, 0);
  b.ctx.putImageData(b.image, 0, 0);
  return { color: c.canvas, bump: b.canvas };
}

/** Tejido sarga 2×2 de fibra de carbono. */
function carbon(size: number): TexturePair {
  const cell = size / 16; // 16 hilos por baldosa
  const fine = makeNoise(size, size / 2, 11);
  const dark = hex("#07090b");
  const light = hex("#47505e");
  return paint(size, (x, y) => {
    const gx = Math.floor(x / cell);
    const gy = Math.floor(y / cell);
    const fx = (x % cell) / cell;
    const fy = (y % cell) / cell;
    const weftOver = (gx + gy) % 4 < 2;
    // Cada hilo es un cilindro: brillo máximo en su eje
    const axis = weftOver ? Math.sin(Math.PI * fy) : Math.sin(Math.PI * fx);
    const strands = weftOver ? fine(x * 0.18, y * 1.6) : fine(x * 1.6, y * 0.18);
    const s = clamp01(axis * 0.85 + (strands - 0.5) * 0.28);
    const color = mix(dark, light, s * s);
    return { color, height: 0.25 + s * 0.75 };
  });
}

/** EVA: espuma de celda cerrada, mate, poros finos. */
function eva(size: number): TexturePair {
  const pores = makeNoise(size, size / 3, 23);
  const base = hex("#ece8de");
  const shade = hex("#bdb7a8");
  return paint(size, (x, y) => {
    const n = pores(x, y);
    const pit = n < 0.2 ? (0.2 - n) / 0.2 : 0;
    return { color: mix(base, shade, pit * 0.8), height: 0.7 - pit * 0.55 };
  });
}

/** PA11: superficie granulada de sinterizado, gris cálido, muy mate. */
function pa11(size: number): TexturePair {
  const grain = makeNoise(size, size, 37);
  const soft = makeNoise(size, 6, 38);
  const base = hex("#c4c6c2");
  const dark = hex("#9d9f9b");
  return paint(size, (x, y) => {
    const g = grain(x, y);
    const t = clamp01(g * 0.7 + soft(x, y) * 0.3);
    return { color: mix(dark, base, t), height: g };
  });
}

/** Resina: ámbar translúcido, liso, con vetas suaves y alguna microburbuja. */
function resina(size: number): TexturePair {
  const flow = makeNoise(size, 3, 41);
  const flow2 = makeNoise(size, 7, 42);
  const bubbles = makeNoise(size, size / 5, 43);
  const deep = hex("#a85d12");
  const bright = hex("#f0a43c");
  return paint(size, (x, y) => {
    const t = clamp01(flow(x + flow2(x, y) * 40, y) * 0.8 + flow2(x, y) * 0.2);
    const bubble = bubbles(x, y) > 0.93 ? 0.55 : 0;
    return { color: mix(mix(deep, bright, t), hex("#ffe2a8"), bubble), height: 0.5 + bubble * 0.2 };
  });
}

/** Composite: grafito mate con filamentos cortos dispersos. */
function composite(size: number): TexturePair {
  const rand = mulberry32(53);
  const base = makeNoise(size, 8, 54);
  const c = makeCanvas(size);
  const b = makeCanvas(size);
  const baseColor = hex("#2e343b");

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const v = base(x, y);
      const col = mix(baseColor, hex("#3a424a"), v);
      const i = (y * size + x) * 4;
      c.image.data[i] = col[0];
      c.image.data[i + 1] = col[1];
      c.image.data[i + 2] = col[2];
      c.image.data[i + 3] = 255;
      const h = Math.round(120 + v * 40);
      b.image.data[i] = b.image.data[i + 1] = b.image.data[i + 2] = h;
      b.image.data[i + 3] = 255;
    }
  }
  c.ctx.putImageData(c.image, 0, 0);
  b.ctx.putImageData(b.image, 0, 0);

  for (let n = 0; n < size * 1.2; n++) {
    const x = rand() * size;
    const y = rand() * size;
    const a = rand() * Math.PI;
    const len = 4 + rand() * 14;
    const tone = rand() > 0.5 ? "rgba(120,132,145,0.55)" : "rgba(10,12,15,0.55)";
    for (const ctx of [c.ctx, b.ctx]) {
      ctx.strokeStyle = ctx === c.ctx ? tone : rand() > 0.5 ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
      ctx.stroke();
    }
  }
  return { color: c.canvas, bump: b.canvas };
}

/** Memory: espuma viscoelástica, celdas grandes y blandas. */
function memory(size: number): TexturePair {
  const big = makeNoise(size, 14, 61);
  const small = makeNoise(size, 40, 62);
  const base = hex("#d9e0e5");
  const shade = hex("#a9b4bd");
  return paint(size, (x, y) => {
    const n = big(x, y) * 0.65 + small(x, y) * 0.35;
    const pit = n < 0.36 ? (0.36 - n) / 0.36 : 0;
    return { color: mix(base, shade, pit * 0.9), height: 0.75 - pit * 0.6 };
  });
}

/** Forro: tejido fino, trama cruzada. */
function forro(size: number): TexturePair {
  const fibre = makeNoise(size, size / 2, 71);
  const base = hex("#ebe7dd");
  const shade = hex("#cfc9bb");
  return paint(size, (x, y) => {
    const weave = ((Math.floor(x / 2) + Math.floor(y / 2)) % 2) * 0.5 + fibre(x, y) * 0.5;
    return { color: mix(shade, base, weave), height: weave };
  });
}

/** Modelo anatómico (escayola / impresión neutra). */
function clay(size: number): TexturePair {
  const n = makeNoise(size, 16, 81);
  const fine = makeNoise(size, size / 2, 82);
  const base = hex("#d9d3c7");
  const shade = hex("#c3bcae");
  return paint(size, (x, y) => ({ color: mix(shade, base, clamp01(n(x, y) * 0.6 + fine(x, y) * 0.4)), height: 0.5 + fine(x, y) * 0.1 }));
}

const builders: Record<MaterialId, (size: number) => TexturePair> = {
  carbono: carbon,
  eva,
  pa11,
  resina,
  composite,
  memory,
  forro,
  clay,
};

const cache = new Map<string, TexturePair>();

/** Genera (y cachea) las texturas de un material. */
export function materialTextures(id: MaterialId, size = 256): TexturePair {
  const key = `${id}@${size}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const pair = builders[id](size);
  cache.set(key, pair);
  return pair;
}
