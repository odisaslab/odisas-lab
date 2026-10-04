/**
 * Regenera public/brand/hero-mark.webp: el póster 3D de la marca que se ve en móvil,
 * tablet y con "reducir movimiento" (en escritorio se dibuja en vivo con WebGL).
 *
 * Usa el MISMO shader que el hero (lib/hero-shader.ts), así que si cambias la marca o los
 * materiales, vuelve a ejecutarlo:
 *
 *   npm i --no-save playwright-core
 *   CHROMIUM_PATH=/ruta/a/chromium node scripts/generar-poster-hero.mjs
 *
 * (En Windows/macOS basta con apuntar CHROMIUM_PATH a Chrome o Edge.)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { chromium } from "playwright-core";

const source = readFileSync(new URL("../lib/hero-shader.ts", import.meta.url), "utf8");
const grab = (name) => source.match(new RegExp(`export const ${name} = /\\* glsl \\*/ \`([\\s\\S]*?)\`;`))[1];
const SIZE = 960;

const html = `<body style="margin:0;background:#000"><canvas id="c" width="${SIZE}" height="${SIZE}"></canvas><script>
const c = document.getElementById('c');
const gl = c.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, preserveDrawingBuffer: true });
const shader = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) window.ERR = gl.getShaderInfoLog(s); return s; };
const p = gl.createProgram();
gl.attachShader(p, shader(gl.VERTEX_SHADER, ${JSON.stringify(grab("VERT"))}));
gl.attachShader(p, shader(gl.FRAGMENT_SHADER, ${JSON.stringify(grab("FRAG"))}));
gl.linkProgram(p); gl.useProgram(p);
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
const loc = gl.getAttribLocation(p, 'aPos'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
const U = (n) => gl.getUniformLocation(p, n);
gl.viewport(0, 0, ${SIZE}, ${SIZE}); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
gl.uniform2f(U('uRes'), ${SIZE}, ${SIZE}); gl.uniform1f(U('uTime'), 0); gl.uniform2f(U('uMouse'), -9999, -9999);
gl.uniform2f(U('uCenter'), ${SIZE / 2}, ${SIZE / 2}); gl.uniform1f(U('uSize'), 620); gl.uniform2f(U('uRot'), 0, 0);
gl.uniform1f(U('uIntro'), 1); gl.uniform1f(U('uDots'), 0);
gl.drawArrays(gl.TRIANGLES, 0, 3);
// Sobre negro puro: en la web se mezcla con "screen", así que el negro desaparece
const out = document.createElement('canvas'); out.width = out.height = ${SIZE};
const x = out.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, ${SIZE}, ${SIZE}); x.drawImage(c, 0, 0);
window.OUT = out.toDataURL('image/webp', 0.82);
</script></body>`;

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH,
  args: ["--no-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: SIZE, height: SIZE } });
await page.setContent(html);
const error = await page.evaluate(() => window.ERR);
if (error) throw new Error(`Error de shader: ${error}`);
const data = await page.evaluate(() => window.OUT);
const buffer = Buffer.from(data.split(",")[1], "base64");
writeFileSync(new URL("../public/brand/hero-mark.webp", import.meta.url), buffer);
console.log(`public/brand/hero-mark.webp regenerado (${(buffer.length / 1024).toFixed(1)} KB)`);
await browser.close();
