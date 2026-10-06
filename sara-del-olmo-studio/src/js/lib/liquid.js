/**
 * Esmalte líquido en WebGL (un solo fragment shader, sin Three.js).
 * uP recorre la inmersión: 0 superficie lacada → .5 esmalte líquido → .85 dentro del color → 1 portal de luz.
 * Calidad adaptativa: menos octavas y menor resolución en móviles, y baja sola si los fotogramas tardan.
 */
import { hexToRgb } from './color.js';

const VERT = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';

const frag = (oct) => `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
#define OCT ${oct}
uniform vec2 uRes; uniform float uT; uniform float uP; uniform vec3 uCol; uniform vec2 uPtr;

float h21(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(h21(i),h21(i+vec2(1.,0.)),f.x), mix(h21(i+vec2(0.,1.)),h21(i+vec2(1.,1.)),f.x), f.y); }
float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<OCT;i++){ v+=a*vn(p); p=p*2.03+vec2(11.7,3.1); a*=0.5; } return v; }

vec3 caustics(vec2 uv, float t){
  vec2 p = mod(uv*6.28318, 6.28318) - 250.0; vec2 i = p; float c = 1.0; float inten = 0.005;
  for (int n=0;n<4;n++){ float tt = t*(1.0 - (3.5/float(n+1)));
    i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
    c += 1.0/length(vec2(p.x/(sin(i.x+tt)/inten), p.y/(cos(i.y+tt)/inten))); }
  c /= 4.0; c = 1.17 - pow(c, 1.4); return vec3(pow(abs(c), 8.0));
}

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*uRes) / min(uRes.x, uRes.y);
  float p = uP, t = uT;
  vec3 base = uCol;
  vec3 cream = vec3(0.973, 0.933, 0.922);
  vec3 col = vec3(0.0);

  /* ── A · superficie lacada (el nail ocupa toda la pantalla) ── */
  if (p < 0.62) {
    float z = mix(1.0, 0.55, smoothstep(0.0, 0.6, p));
    vec2 q = uv * z;
    vec2 tq = q*13.0 + vec2(t*0.012, 0.0);
    float hgt = fbm(tq);
    vec2 g = vec2(fbm(tq + vec2(0.04,0.0)) - hgt, fbm(tq + vec2(0.0,0.04)) - hgt) * 25.0;
    float fine = vn(q*150.0) - 0.5;
    float peel = 0.030 * (1.0 - smoothstep(0.1, 0.5, p)) + 0.016;
    vec3 n = normalize(vec3(q.x*0.95 + g.x*peel + fine*0.008, q.y*0.95 + g.y*peel + fine*0.008, 1.0));
    vec3 V = vec3(0.0,0.0,1.0);
    vec3 L1 = normalize(vec3(-0.5 + uPtr.x*0.35, 0.62 + uPtr.y*0.3, 0.72));
    float diff = clamp(dot(n, L1), 0.0, 1.0);
    vec3 r2 = reflect(-V, n);
    vec3 R = reflect(-L1, n);
    float spec = pow(max(dot(R, V), 0.0), 70.0);
    float depthTone = 0.55 + 0.45*fbm(q*2.2 + 4.0);
    col = base * (0.30 + 0.85*diff) * depthTone;
    col += base * 0.35 * pow(1.0 - n.z, 2.2);
    vec2 sb = r2.xy - vec2(-0.30, 0.16);
    float sbox = smoothstep(0.16, 0.10, abs(sb.x)) * smoothstep(0.50, 0.40, abs(sb.y));
    vec2 sb2 = r2.xy - vec2(0.42, 0.46);
    float sdot = smoothstep(0.075, 0.03, length(vec2(sb2.x*1.8, sb2.y*0.7)));
    col = mix(col, vec3(1.0, 0.95, 0.94), sbox*0.5 + sdot*0.9);
    col += spec * vec3(1.0, 0.88, 0.88) * 0.9;
    float sweep = smoothstep(0.05, 0.0, abs(uv.x*0.8 + uv.y*0.35 - (fract(t*0.06)*2.6 - 1.3)));
    col += sweep * 0.10 * (1.0 - smoothstep(0.2, 0.5, p));
  }

  /* ── B · esmalte líquido (el color se vuelve un universo abstracto) ── */
  vec3 liq = vec3(0.0);
  if (p > 0.26 && p < 0.92) {
    float k = mix(2.0, 3.4, smoothstep(0.3, 0.9, p));
    vec2 qq = uv * k * mix(1.4, 0.7, smoothstep(0.3, 0.9, p));
    vec2 a = vec2(fbm(qq + vec2(0.0, t*0.05)), fbm(qq + vec2(5.2,1.3) - t*0.04));
    vec2 b = vec2(fbm(qq + 3.0*a + vec2(1.7,9.2) + t*0.03), fbm(qq + 3.0*a + vec2(8.3,2.8) - t*0.02));
    float f = fbm(qq + 3.4*b);
    vec3 deep = base * 0.14, mid = base * 1.05, hi = mix(base, vec3(1.0, 0.55, 0.62), 0.62);
    liq = mix(deep, mid, smoothstep(0.18, 0.68, f));
    liq = mix(liq, hi, smoothstep(0.58, 0.95, f*f*1.7 + b.x*0.32));
    float edge = smoothstep(0.015, 0.0, abs(f - 0.50)) + smoothstep(0.012, 0.0, abs(f - 0.64))*0.7;
    vec3 irid = 0.5 + 0.5*cos(6.2831*(f*1.6 + vec3(0.0, 0.33, 0.67)));
    liq += edge * mix(vec3(1.0, 0.86, 0.88), irid, 0.45) * 0.55;
    liq *= 0.8 + 0.4*fbm(qq*5.0 - t*0.05);
  }

  /* ── C · dentro del color: cáusticas, partículas y la luz del portal ── */
  vec3 tun = vec3(0.0);
  float depth = smoothstep(0.62, 0.9, p);
  if (p > 0.6) {
    float r = length(uv);
    float ang = atan(uv.y, uv.x);
    vec2 sp = vec2(ang*0.159 + t*0.02 + depth*0.2, 0.5/(r + 0.22) + depth*1.4 + t*0.05);
    vec3 cs = caustics(sp*vec2(2.0, 1.2), t*0.35);
    tun = base * (0.26 + 0.34*(1.0 - r)) + cs * mix(base, vec3(1.0, 0.5, 0.58), 0.7) * 1.7;
    vec3 pc = mix(vec3(1.0,0.78,0.82), cream, 0.4);
    float vis = smoothstep(0.55, 0.78, p) * (1.0 - smoothstep(0.92, 1.0, p));
    for (int i=0;i<3;i++){
      float fi = float(i);
      vec2 pp = uv*(5.0 + fi*4.5) * mix(1.0, 0.45, depth) + vec2(0.0, t*(0.06 + fi*0.03) + p*(1.4 + fi));
      vec2 id = floor(pp), gv = fract(pp) - 0.5;
      float rnd = h21(id + fi*17.0);
      vec2 off = (vec2(h21(id + 3.1), h21(id + 7.7)) - 0.5) * 0.6;
      float d = length(gv - off);
      float tw = 0.5 + 0.5*sin(t*2.0 + rnd*6.2831);
      tun += smoothstep(0.065 + rnd*0.05, 0.0, d) * tw * (0.35 + 0.35*fi) * pc * vis * step(0.45, rnd);
    }
    // el portal: un disco de luz que crece desde el centro
    float R = mix(0.0, 1.9, smoothstep(0.80, 1.0, p));
    float ring = smoothstep(0.045, 0.0, abs(r - R*0.96)) * smoothstep(0.78, 0.86, p) * (1.0 - smoothstep(0.96, 1.0, p));
    float portal = 1.0 - smoothstep(R*0.55, R, r);
    float glow = exp(-r*3.2) * smoothstep(0.70, 0.88, p) * 0.9;
    tun += glow * mix(vec3(1.0,0.62,0.68), cream, smoothstep(0.8, 1.0, p));
    tun += ring * vec3(1.0, 0.9, 0.92) * (0.6 + 0.4*sin(r*60.0 - t*4.0));
    tun = mix(tun, cream, portal);
  }

  float wB = smoothstep(0.26, 0.5, p) * (1.0 - smoothstep(0.7, 0.9, p));
  float wC = smoothstep(0.62, 0.88, p);
  vec3 mixAB = mix(col, liq, smoothstep(0.26, 0.5, p));
  vec3 outc = mix(mixAB, tun, wC);
  float portalDone = smoothstep(0.985, 1.0, p);
  float vig = 1.0 - dot(uv, uv) * 0.62 * (1.0 - portalDone);
  outc *= mix(vig, 1.0, wC*0.4);
  outc += (h21(gl_FragCoord.xy + fract(t)*91.0) - 0.5) * 0.03 * (1.0 - portalDone);
  outc = mix(outc, cream, portalDone);
  gl_FragColor = vec4(outc, 1.0);
}`;

export function createLiquid(canvas, { low = false, hex = '#7A1027' } = {}) {
  let gl;
  try {
    gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'default' }) || canvas.getContext('experimental-webgl');
  } catch { gl = null; }
  if (!gl) return null;

  const sh = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn('[liquid]', gl.getShaderInfoLog(s)); return null; }
    return s;
  };
  const vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, frag(low ? 3 : 5));
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const U = {};
  ['uRes', 'uT', 'uP', 'uCol', 'uPtr'].forEach((n) => (U[n] = gl.getUniformLocation(prog, n)));

  let scale = low ? 0.7 : 1;
  const maxDpr = low ? 1 : 1.25;   // el esmalte es orgánico y desenfocado: no necesita resolución Retina completa
  let w = 0, h = 0;
  const api = {
    ok: true,
    resize() {
      const dpr = Math.min(maxDpr, window.devicePixelRatio || 1) * scale;
      const cw = Math.max(2, Math.round(canvas.clientWidth * dpr)), ch = Math.max(2, Math.round(canvas.clientHeight * dpr));
      if (cw !== w || ch !== h) { w = canvas.width = cw; h = canvas.height = ch; gl.viewport(0, 0, w, h); }
    },
    color(h2) { const [r, g, b] = hexToRgb(h2); gl.uniform3f(U.uCol, r / 255, g / 255, b / 255); },
    draw(p, t, ptr = [0, 0]) {
      gl.uniform2f(U.uRes, w, h);
      gl.uniform1f(U.uT, t);
      gl.uniform1f(U.uP, p);
      gl.uniform2f(U.uPtr, ptr[0], ptr[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    /** Reduce la resolución si los fotogramas van lentos. */
    degrade() { if (scale > 0.4) { scale *= 0.8; api.resize(); return true; } return false; },
    lose() { const e = gl.getExtension('WEBGL_lose_context'); e && e.loseContext(); },
  };
  api.color(hex);
  api.resize();
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); api.ok = false; });
  return api;
}
