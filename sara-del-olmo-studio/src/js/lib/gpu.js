/**
 * Compositor de fotos en WebGL.
 *
 * Mover y ampliar fotos enormes con transformaciones CSS obliga al navegador a volver a «pintar» miles de píxeles en cada
 * fotograma (sobre todo en pantallas Retina y en Safari), y eso es lo que hacía que el scroll fuese a tirones. Aquí cada
 * foto es una textura de la tarjeta gráfica y cada fotograma son unos pocos rectángulos texturizados: el coste no depende
 * del zoom ni del número de capas, y la nitidez es la misma.
 *
 * Es una mejora progresiva: las capas HTML (`<picture>`) siguen existiendo y se ven mientras las texturas se cargan, si
 * WebGL2 no existe o si se pierde el contexto. Las texturas solo viven mientras la escena está cerca de la pantalla.
 *
 * Coordenadas: las mismas «de mundo» que usa la cámara CSS (traslación + giro + zoom), así que el resto del código no cambia.
 */

const VS = `
attribute vec2 a;
uniform vec4 uRect;
uniform vec2 uAnchor;
uniform float uSc;
uniform mat3 uM;
varying vec2 vUv;
void main() {
  vUv = a;
  vec2 p = uRect.xy + a * uRect.zw;
  p = uAnchor + (p - uAnchor) * uSc;
  vec3 c = uM * vec3(p, 1.0);
  gl_Position = vec4(c.xy, 0.0, 1.0);
}`;

const FS = `
precision highp float;
uniform sampler2D uTex;
uniform float uO;
uniform vec2 uFade;
varying vec2 vUv;
void main() {
  float f = 1.0 - clamp((vUv.y - uFade.x) / max(uFade.y - uFade.x, 0.0001), 0.0, 1.0);
  gl_FragColor = texture2D(uTex, vUv) * (uO * f);
}`;

import { perf, onPerfLevel } from './perf.js';

const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r()));

/**
 * @param host     elemento que contiene el lienzo (se coloca como primer hijo, a pantalla completa)
 * @param els      elementos `<picture>`/`<img>` de cada capa, en orden de pintado (de abajo a arriba)
 * @param opts     low: equipo modesto (texturas más pequeñas) · before: nodo antes del cual insertar el lienzo · fade: [[m0, m1] | null, …] (se puede cambiar luego con `fade(i, f)`)
 * @returns        null si no hay WebGL2; si no, la API (cam, layer, draw, setActive, project, destroy)
 */
export function createPhotoGL(host, els, { low = false, before = null, fade = [] } = {}) {
  if (typeof WebGL2RenderingContext === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.className = 'gpu-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  let gl;
  try {
    gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: 'high-performance' });
  } catch { gl = null; }
  if (!gl) return null;

  // geometría de cada capa en px de mundo (se mide ahora, antes de que el HTML se oculte)
  const rects = els.map((el) => {
    const cs = getComputedStyle(el);
    const n = (v) => parseFloat(v) || 0;
    return [n(cs.left), n(cs.top), n(cs.width), n(cs.height)];
  });
  const anchors = els.map((el) => {
    const o = getComputedStyle(el).transformOrigin.split(' ').map(parseFloat);
    return [o[0] || 0, o[1] || 0];
  });
  if (rects.some((r) => r[2] <= 0 || r[3] <= 0)) return null;

  // programa
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
  const vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = {};
  ['uRect', 'uAnchor', 'uSc', 'uM', 'uTex', 'uO', 'uFade'].forEach((n) => (U[n] = gl.getUniformLocation(prog, n)));
  gl.uniform1i(U.uTex, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);   // las texturas van con el alfa premultiplicado
  gl.clearColor(0, 0, 0, 0);
  const maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE);

  host.insertBefore(canvas, before || host.firstChild);

  // ───── estado ─────
  const n = els.length;
  const tex = new Array(n).fill(null), op = new Array(n).fill(0), sc = new Array(n).fill(1), vis = new Array(n).fill(false);
  let camp = { s: 1, fx: 0, fy: 0, ax: 0, ay: 0, rot: 0 };
  let W = 1, H = 1, dirty = true, active = false, ready = false, token = 0, dead = false, lostCb = null, readyCb = null, scheduled = false;
  const m3 = new Float32Array(9);

  const resize = () => {
    const cw = canvas.clientWidth || host.clientWidth, ch = canvas.clientHeight || host.clientHeight;
    if (!cw || !ch) return;
    W = cw; H = ch;
    let dpr = Math.min(window.devicePixelRatio || 1, perf.level >= 2 ? 1 : perf.level === 1 ? 1.25 : low ? 1.5 : 2);
    while (cw * ch * dpr * dpr > 5.6e6 && dpr > 1) dpr = Math.max(1, dpr - 0.25);
    const pw = Math.round(cw * dpr), ph = Math.round(ch * dpr);
    if (canvas.width !== pw || canvas.height !== ph) { canvas.width = pw; canvas.height = ph; dirty = true; }
  };
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => { resize(); schedule(); }) : null;
  ro && ro.observe(host);
  const offPerf = onPerfLevel(() => { resize(); schedule(); });
  resize();

  const draw = () => {
    scheduled = false;
    if (dead || !ready) return;
    resize();
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    const { s, fx, fy, ax, ay, rot } = camp, th = (rot * Math.PI) / 180, co = Math.cos(th) * s, si = Math.sin(th) * s;
    const e = ax - (co * fx - si * fy), f = ay - (si * fx + co * fy);
    // mundo → píxeles de pantalla (a=co, b=si, c=-si, d=co) → recorte
    m3[0] = (2 * co) / W; m3[1] = (-2 * si) / H; m3[2] = 0;
    m3[3] = (-2 * si) / W; m3[4] = (-2 * co) / H; m3[5] = 0;
    m3[6] = (2 * e) / W - 1; m3[7] = 1 - (2 * f) / H; m3[8] = 1;
    gl.uniformMatrix3fv(U.uM, false, m3);
    for (let i = 0; i < n; i++) {
      if (!vis[i] || !tex[i] || op[i] <= 0.002) continue;
      const r = rects[i], a = anchors[i];
      gl.uniform4f(U.uRect, r[0], r[1], r[2], r[3]);
      gl.uniform2f(U.uAnchor, r[0] + a[0], r[1] + a[1]);
      gl.uniform1f(U.uSc, sc[i]);
      gl.uniform1f(U.uO, op[i]);
      const fd = fade[i];
      gl.uniform2f(U.uFade, fd ? fd[0] : 2, fd ? fd[1] : 3);
      gl.bindTexture(gl.TEXTURE_2D, tex[i]);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    dirty = false;
  };
  // todo lo que cambie en un mismo fotograma se pinta UNA vez (microtarea al terminar el callback del scroll)
  const schedule = () => { dirty = true; if (!scheduled) { scheduled = true; Promise.resolve().then(draw); } };

  const upload = async (i, tk) => {
    const el = els[i], im = el.tagName === 'IMG' ? el : el.querySelector('img');
    const url = im && (im.currentSrc || im.src);
    if (!url) return false;
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    try { await img.decode(); } catch { return false; }
    if (tk !== token || dead) return false;
    await nextFrame();                       // una textura por fotograma: sin tirones al cargar
    if (tk !== token || dead) return false;
    let src = img;
    const big = Math.max(img.naturalWidth, img.naturalHeight), cap = low ? 2048 : maxTex;
    if (big > cap && typeof createImageBitmap === 'function') {
      const k = cap / big;
      try { src = await createImageBitmap(img, { resizeWidth: Math.round(img.naturalWidth * k), resizeHeight: Math.round(img.naturalHeight * k), resizeQuality: 'high', premultiplyAlpha: 'premultiply' }); } catch { return false; }
    } else if (big > maxTex) return false;
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (src.close) src.close();
    if (tk !== token || dead) { gl.deleteTexture(t); return false; }
    tex[i] = t;
    return true;
  };

  const free = () => { for (let i = 0; i < n; i++) if (tex[i]) { gl.deleteTexture(tex[i]); tex[i] = null; } ready = false; };

  const api = {
    ok: true,
    canvas,
    get ready() { return ready; },
    /** Cámara (mismos parámetros que la transformación CSS del mundo). */
    cam(c) { camp = c; schedule(); },
    /** Estado de una capa: opacidad, zoom alrededor de su ancla y si se pinta. */
    layer(i, o, s, v) { if (op[i] !== o || sc[i] !== s || vis[i] !== v) { op[i] = o; sc[i] = s; vis[i] = v; schedule(); } },
    /** Desvanece la parte baja de la foto (fracciones de su alto): [desde, hasta] o null. */
    fade(i, f) { fade[i] = f; schedule(); },
    draw: schedule,
    /** Al activarse se cargan las texturas (de una en una); al desactivarse se liberan. `cb(true)` cuando están todas. */
    setActive(on, cb) {
      if (dead) return;
      readyCb = cb || readyCb;
      if (on === active) return;
      active = on;
      token++;
      if (!on) { free(); readyCb && readyCb(false); return; }
      const tk = token;
      (async () => {
        for (let i = 0; i < n; i++) {
          if (tex[i]) continue;
          const ok = await upload(i, tk);
          if (tk !== token) return;
          if (!ok) { free(); readyCb && readyCb(false); return; }   // no se pudo: se queda la versión HTML
        }
        ready = true;
        schedule();
        readyCb && readyCb(true);
      })();
    },
    destroy() { dead = true; token++; offPerf(); ro && ro.disconnect(); free(); canvas.remove(); },
  };

  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); ready = false; active = false; token++; readyCb && readyCb(false); lostCb && lostCb(); });
  api.onLost = (cb) => { lostCb = cb; };
  return api;
}
