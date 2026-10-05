/**
 * ACTO 5 · CEJAS. En la oscuridad aparece una línea. La línea se transforma en dos cejas simétricas,
 * se dibujan las guías de medida (precisión), la cámara se acerca y el «efecto sombreado» se llena de pigmento.
 */
import { registerScene } from '../lib/scene.js';
import { $, $$, seg, ease, lerp, clamp, isSmall } from '../lib/util.js';
import { browMarkup, browD } from '../art/brow.js';
import { camT, setDash, browEnd } from './cam.js';

export function init(el) {
  const cam = $('.cejas__cam', el), svgEl = $('.cejas__svg', el);
  cam.innerHTML = browMarkup('bz');
  const lineL = $('.bz-line-l', cam), lineR = $('.bz-line-r', cam);
  const shades = $$('.bz-shade', cam), blur = $('feGaussianBlur', cam);
  const guides = $$('.bz-g', cam), points = $$('.bz-p', cam), face = $('.bz-face', cam);
  guides.forEach((g, i) => { g.setAttribute('pathLength', '1'); g.dataset.i = i; });
  const kicker = $('.kicker', el), title = $('.mega', el), lead = $('.lead', el);
  const facts = $$('.facts li', el), prices = $$('.price-pair > div', el), btns = $('.btn-row', el);

  const render = (p) => {
    const portrait = isSmall();
    // 1) la línea se dibuja desde el centro hacia fuera, y se transforma en ceja
    const draw = seg(p, 0.06, 0.2, ease.out);
    const morph = seg(p, 0.2, 0.42, ease.io);
    const d0 = browD(morph), d1 = browD(morph, true);
    lineL.setAttribute('d', d0); lineR.setAttribute('d', d1);
    // 0..0.5 = la línea (ida); 0.5..1 = vuelta que cierra la silueta
    const strokeFrac = lerp(0.5 * draw, 1, morph);
    [lineL, lineR].forEach((l) => { l.style.strokeDasharray = '1 1'; l.style.strokeDashoffset = (1 - strokeFrac).toFixed(4); l.style.opacity = draw > 0 ? 1 : 0; });
    // 2) guías de medida y puntos (precisión, simetría)
    const gp = seg(p, 0.4, 0.56, ease.out);
    guides.forEach((g, i) => setDash(g, clamp(gp * 1.6 - (i / guides.length) * 0.6)));
    points.forEach((pt, i) => {
      const u = seg(p, 0.46 + i * 0.012, 0.54 + i * 0.012, ease.out);
      pt.style.transformBox = 'fill-box'; pt.style.transformOrigin = 'center';
      pt.style.transform = `scale(${u})`; pt.style.opacity = u;
    });
    face.style.opacity = (0.7 * seg(p, 0.42, 0.56)).toFixed(3);
    // 3) cámara: se acerca a la ceja
    const end = browEnd(portrait);
    const zoom = seg(p, 0.46, 0.76, ease.io);
    cam.setAttribute('transform', camT(600, 400, lerp(1, end.s, zoom), lerp(600, end.x, zoom), lerp(400, end.y, zoom)));
    // 4) sombreado (pigmento): aparece y se asienta
    const sh = seg(p, 0.54, 0.8, ease.out);
    shades.forEach((s) => (s.style.opacity = sh.toFixed(3)));
    blur && blur.setAttribute('stdDeviation', lerp(7, 2.2, sh).toFixed(2));
    // el lado izquierdo se funde para dejar limpio el texto (en móvil el texto va abajo)
    svgEl.style.setProperty('--lm', (portrait ? 1 : 1 - seg(p, 0.6, 0.78)).toFixed(3));
    // 5) texto
    const a = (n, s, e, dy = 26) => { const u = seg(p, s, e, ease.out); n.style.opacity = u.toFixed(3); n.style.transform = `translate3d(0, ${((1 - u) * dy).toFixed(1)}px, 0)`; return u; };
    a(kicker, 0.62, 0.7, 14); a(title, 0.64, 0.76, 40); a(lead, 0.72, 0.8);
    facts.forEach((f, i) => a(f, 0.76 + i * 0.015, 0.84 + i * 0.015, 14));
    prices.forEach((f, i) => a(f, 0.8 + i * 0.02, 0.88 + i * 0.02, 14));
    const u = a(btns, 0.86, 0.94, 14);
    btns.style.visibility = u > 0.02 ? 'visible' : 'hidden';
  };
  const scene = registerScene(el, render, { damp: 7 });
  el.classList.add('is-ready');
  return { scene };
}
