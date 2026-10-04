/**
 * Shader del hero: el símbolo de Odisas Lab (dos píldoras que forman una flecha) en 3D,
 * trazado por rayos sobre campos de distancia, con reflejos de estudio y un halo naranja,
 * más un campo de puntos que reacciona al cursor y a la marca.
 *
 * Todo ocurre en un fragment shader: sin Three.js ni modelos descargados (≈4 KB).
 * Compatible con WebGL 1.
 */

export const VERT = /* glsl */ `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

export const FRAG = /* glsl */ `
precision highp float;

uniform vec2  uRes;     // tamaño del canvas en píxeles
uniform float uTime;    // segundos
uniform vec2  uMouse;   // posición del cursor en píxeles (origen abajo-izquierda)
uniform vec2  uCenter;  // centro de la marca en píxeles
uniform float uSize;    // alto de la marca en píxeles
uniform vec2  uRot;     // x: inclinación, y: giro (rad)
uniform float uIntro;   // 0 → 1 al aparecer
uniform float uDots;    // 0 → 1 intensidad del campo de puntos

// ── Geometría: dos cápsulas que dibujan la flecha ">" de la marca ──
float sdCapsule(vec3 p, vec3 a, vec3 b, float r) {
  vec3 pa = p - a;
  vec3 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - r;
}

float smin(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * 0.25;
}

vec2 pills(vec3 p) {
  p.z *= 1.55; // aplasta las píldoras en profundidad
  float top = sdCapsule(p, vec3(-0.485,  0.56, 0.0), vec3(0.505,  0.10, 0.0), 0.43);
  float bot = sdCapsule(p, vec3(-0.485, -0.56, 0.0), vec3(0.505, -0.10, 0.0), 0.43);
  return vec2(top, bot);
}

float map(vec3 p) {
  vec2 d = pills(p);
  return smin(d.x, d.y, 0.12) * 0.78;
}

vec3 calcNormal(vec3 p) {
  vec2 e = vec2(0.0025, -0.0025);
  return normalize(
    e.xyy * map(p + e.xyy) +
    e.yyx * map(p + e.yyx) +
    e.yxy * map(p + e.yxy) +
    e.xxx * map(p + e.xxx)
  );
}

float calcAO(vec3 p, vec3 n) {
  float occ = 0.0;
  float sca = 1.0;
  for (int i = 0; i < 4; i++) {
    float h = 0.03 + 0.13 * float(i);
    occ += (h - map(p + n * h)) * sca;
    sca *= 0.8;
  }
  return clamp(1.0 - 2.0 * occ, 0.0, 1.0);
}

// ── Entorno de estudio: fondo oscuro con cajas de luz que se reflejan en las píldoras ──
vec3 env(vec3 r) {
  float up = r.y * 0.5 + 0.5;
  vec3 c = mix(vec3(0.02, 0.012, 0.01), vec3(0.16, 0.09, 0.06), up);
  // Caja de luz superior
  c += vec3(1.0, 0.95, 0.88) * smoothstep(0.45, 0.80, r.y) * smoothstep(0.95, 0.35, abs(r.x)) * 2.2;
  // Franja vertical izquierda, fría
  c += vec3(0.80, 0.88, 1.00) * smoothstep(0.10, 0.02, abs(r.x + 0.78)) * smoothstep(-0.5, 0.2, r.y) * 1.6;
  // Franja derecha, naranja
  c += vec3(1.00, 0.45, 0.08) * smoothstep(0.14, 0.02, abs(r.x - 0.82)) * 1.8;
  // Rebote inferior cálido
  c += vec3(1.00, 0.35, 0.05) * smoothstep(-0.35, -0.9, r.y) * 0.7;
  return c;
}

vec3 srgb(vec3 c) {
  return pow(c, vec3(2.2));
}

vec3 shade(vec3 pObj, vec3 nWorld, vec3 rdWorld) {
  vec2 d = pills(pObj);
  float overlap = smoothstep(0.03, -0.14, max(d.x, d.y));

  // Naranja de la marca: degradado del logo y zona de solape más oscura
  float g = clamp(0.5 + (-pObj.y * 0.55 + pObj.x * 0.45), 0.0, 1.0);
  vec3 base = mix(srgb(vec3(1.0, 0.55, 0.0)), srgb(vec3(1.0, 0.28, 0.0)), g);
  base = mix(base, srgb(vec3(0.87, 0.23, 0.02)), overlap * 0.9);

  vec3 l = normalize(vec3(-0.45 + 0.4 * sin(uTime * 0.55), 0.80, 0.70)); // la luz se desliza despacio
  float ndl = dot(nWorld, l);
  float dif = max(ndl, 0.0);
  float wrap = clamp(ndl * 0.5 + 0.5, 0.0, 1.0);
  vec3 col = base * (0.10 + 0.85 * dif + 0.30 * wrap * wrap);

  float ndv = max(dot(nWorld, -rdWorld), 0.0);
  float fr = pow(1.0 - ndv, 3.0);
  vec3 refl = reflect(rdWorld, nWorld);
  // Reflejo de barniz: las cajas de luz dibujan bandas curvas a lo largo de las píldoras
  col += env(refl) * (0.20 + 0.55 * fr) * mix(vec3(1.0), base * 2.2, 0.35);

  vec3 h = normalize(l - rdWorld);
  col += vec3(1.0, 0.92, 0.82) * pow(max(dot(nWorld, h), 0.0), 48.0) * 0.55;
  col += srgb(vec3(1.0, 0.45, 0.05)) * pow(1.0 - ndv, 2.5) * 0.8;
  return col;
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// ── Campo de puntos que reacciona al cursor y a la marca ──
// Devuelve (opacidad, proximidad).
vec2 dotField(vec2 px) {
  float cell = 28.0;
  vec2 g = px / cell;
  vec2 id = floor(g);
  vec2 f = fract(g) - 0.5;
  vec2 c = (id + 0.5) * cell;

  float dm = length(c - uMouse) / (uSize * 0.85);
  float dc = length(c - uCenter) / uSize;
  float prox = exp(-dm * dm * 2.4) + 0.8 * exp(-dc * dc * 0.9);
  float wave = 0.5 + 0.5 * sin(dc * 5.5 - uTime * 1.3);

  float rad = 0.04 + 0.17 * prox * (0.55 + 0.45 * wave);
  float a = smoothstep(rad, rad - 0.07, length(f));
  // Los puntos se apagan hacia el texto (izquierda) para no restar legibilidad
  float side = smoothstep(0.08, 0.62, px.x / uRes.x);
  float strength = (0.05 + 0.62 * prox) * uDots * side;
  return vec2(a * strength, prox);
}

void main() {
  vec2 px = gl_FragCoord.xy;
  float size = uSize * (0.84 + 0.16 * uIntro);
  vec2 uvw = (px - uCenter) / (size * 0.5);

  // Fondo: halo naranja + puntos
  float halo = exp(-2.4 * max(length(uvw * vec2(0.92, 0.88)) - 0.72, 0.0)) * (0.35 + 0.65 * uIntro);
  vec2 df = dotField(px);
  vec3 dotCol = mix(vec3(0.95, 0.92, 0.88), vec3(1.0, 0.45, 0.08), clamp(df.y, 0.0, 1.0));
  vec3 outC = vec3(1.0, 0.42, 0.05) * halo * 0.30 + dotCol * df.x;
  float outA = clamp(halo * 0.30 + df.x, 0.0, 1.0);

  // Marca 3D
  // Postura de reposo de 3/4 que respira despacio; el ratón la modifica
  float ry = uRot.y - 0.5 + (1.0 - uIntro) * (-1.5) + 0.18 * sin(uTime * 0.5);
  float rx = uRot.x + 0.14 + 0.05 * sin(uTime * 0.45);
  mat3 Ry = mat3(cos(ry), 0.0, -sin(ry), 0.0, 1.0, 0.0, sin(ry), 0.0, cos(ry));
  mat3 Rx = mat3(1.0, 0.0, 0.0, 0.0, cos(rx), sin(rx), 0.0, -sin(rx), cos(rx));
  mat3 R = Ry * Rx;

  const float D = 6.0;
  vec3 ro = vec3(0.0, 0.0, D);
  vec3 rd = normalize(vec3(uvw, -D));
  vec3 roO = ro * R; // equivale a transpose(R) * ro
  vec3 rdO = rd * R;

  float b = dot(roO, rdO);
  float c = dot(roO, roO) - 1.6 * 1.6;
  float disc = b * b - c;
  if (disc > 0.0) {
    float sq = sqrt(disc);
    float t = -b - sq;
    float tEnd = -b + sq;
    float pxWorld = 2.0 / (size * 1.0); // tamaño de un píxel en unidades del objeto
    float minD = 1e3;
    float tMin = t;
    bool hit = false;
    for (int i = 0; i < 56; i++) {
      vec3 p = roO + rdO * t;
      float d = map(p);
      if (d < minD) { minD = d; tMin = t; }
      if (d < 0.0018) { hit = true; break; }
      t += d;
      if (t > tEnd) break;
    }
    float cover = hit ? 1.0 : 1.0 - smoothstep(0.0, pxWorld * 1.6, minD);
    if (cover > 0.001) {
      float ts = hit ? t : tMin;
      vec3 p = roO + rdO * ts;
      vec3 nO = calcNormal(p);
      vec3 nW = R * nO;
      vec3 col = shade(p, nW, rd);
      col *= mix(0.55, 1.0, calcAO(p, nO));
      col = col / (1.0 + col * 0.55);        // tonemap suave
      col = pow(col, vec3(1.0 / 2.2));       // a sRGB
      outC = mix(outC, col, cover);
      outA = mix(outA, 1.0, cover);
    }
  }

  outC += (hash(px + uTime) - 0.5) / 255.0 * outA;
  gl_FragColor = vec4(outC, outA);
}
`;
