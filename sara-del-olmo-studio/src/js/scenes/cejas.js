/**
 * ACTO 5 · CEJAS. En la oscuridad aparece un rostro. Se dibujan las guías de medida (precisión, simetría: eje de la
 * nariz, comisuras, arco y cola), la cámara se acerca a la ceja y aparece el texto.
 * El rostro es una fotografía; las guías son un dibujo SVG en las mismas coordenadas, dentro del mismo «mundo».
 */
import { registerScene } from '../lib/scene.js';
import { $, $$, seg, ease, lerp, clamp, spline, warmImages } from '../lib/util.js';
import { BROWS } from '../../data/scene-photos.js';
import { setDash, browCam } from './cam.js';

export function init(el) {
  const bw = $('.cejas__bw', el), world = $('.bw__world', el), svg = $('.bw__guides', el), shade = $('.cejas__shade', el);
  warmImages(bw, 600);
  const guides = $$('.bz-g', svg), points = $$('.bz-p', svg);
  points.forEach((pt) => { pt.style.transformBox = 'fill-box'; pt.style.transformOrigin = 'center'; });
  const kicker = $('.kicker', el), title = $('.mega', el), lead = $('.lead', el);
  const facts = $$('.facts li', el), prices = $$('.price-pair > div', el), btns = $('.btn-row', el);

  let K, vw = 1, vh = 1;
  const measure = () => {
    const r = bw.getBoundingClientRect();
    vw = r.width || innerWidth; vh = r.height || innerHeight;
    const portrait = vw < vh * 0.95;
    // plano general: las dos cejas y los ojos
    const s0 = portrait ? (0.96 * vw) / 1175 : Math.max(vw / BROWS.img.refW, vh / BROWS.img.refH) * 1.04;
    const a0 = { x: 0.5 * vw, y: portrait ? 0.27 * vh : 0.5 * vh };
    const f0 = { x: BROWS.center.x, y: portrait ? 620 : 560 };
    const e = browCam(vw, vh, BROWS);
    const keys = [
      { p: 0, s: s0, fx: f0.x, fy: f0.y, ax: a0.x, ay: a0.y },
      { p: 0.4, s: s0 * 1.1, fx: f0.x, fy: f0.y, ax: a0.x, ay: a0.y },
      { p: 0.76, s: e.s, fx: e.fx, fy: e.fy, ax: e.ax, ay: e.ay },
      { p: 1, s: e.s, fx: e.fx, fy: e.fy, ax: e.ax, ay: e.ay },
    ];
    const xs = keys.map((k) => k.p), sp = (f) => spline(xs, keys.map(f));
    K = { s: sp((k) => Math.log(k.s)), fx: sp((k) => k.fx), fy: sp((k) => k.fy), ax: sp((k) => k.ax), ay: sp((k) => k.ay) };
  };
  measure();
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { measure(); scene.force = true; }, 90); });

  const render = (p) => {
    // 1) el rostro emerge de la oscuridad
    bw.style.opacity = seg(p, 0, 0.14, ease.out).toFixed(3);
    // 2) cámara: mirada general → se acerca a la ceja
    const s = Math.exp(K.s(p));
    world.style.transform = `translate(${K.ax(p).toFixed(2)}px, ${K.ay(p).toFixed(2)}px) scale(${s.toFixed(4)}) translate(${(-K.fx(p)).toFixed(2)}px, ${(-K.fy(p)).toFixed(2)}px)`;
    // 3) guías de medida y puntos (precisión, simetría); el trazo mide lo mismo en pantalla a cualquier zoom
    svg.style.setProperty('--sw', `${(1.7 / s).toFixed(3)}px`);
    const gp = seg(p, 0.1, 0.4, ease.out);
    guides.forEach((g, i) => setDash(g, clamp(gp * 1.7 - (i / guides.length) * 0.7)));
    points.forEach((pt, i) => {
      const u = seg(p, 0.3 + i * 0.012, 0.4 + i * 0.012, ease.out);
      pt.style.transform = `scale(${u})`; pt.style.opacity = u;
    });
    svg.style.opacity = (0.78 * (1 - seg(p, 0.5, 0.64))).toFixed(3);
    // 4) el lado izquierdo (arriba en móvil) se oscurece para dejar limpio el texto
    shade.style.opacity = seg(p, 0.56, 0.74).toFixed(3);
    // 5) texto
    const a = (n, st, en, dy = 26) => { const u = seg(p, st, en, ease.out); n.style.opacity = u.toFixed(3); n.style.transform = `translate3d(0, ${((1 - u) * dy).toFixed(1)}px, 0)`; return u; };
    a(kicker, 0.62, 0.7, 14); a(title, 0.64, 0.76, 40); a(lead, 0.72, 0.8);
    facts.forEach((f, i) => a(f, 0.76 + i * 0.015, 0.84 + i * 0.015, 14));
    prices.forEach((f, i) => a(f, 0.8 + i * 0.02, 0.88 + i * 0.02, 14));
    const u = a(btns, 0.86, 0.94, 14);
    btns.style.visibility = u > 0.02 ? 'visible' : 'hidden';
  };
  const scene = registerScene(el, render, { damp: 5.5 });
  el.classList.add('is-ready');
  return { scene };
}
