/**
 * ACTO FINAL · RESERVA. La cámara vuelve a acercarse a una uña (la macro de la portada) y se aleja hasta la mano
 * entera: es el cierre de la película, gemelo del arranque. Aparece «Ahora, hazlo tuyo.» con el CTA definitivo
 * hacia Booksy.
 */
import { registerScene } from '../lib/scene.js';
import { $, $$, seg, ease, lerp, spline } from '../lib/util.js';
import { createWorld } from '../lib/handworld.js';
import { HAND, handWorld } from '../../data/scene-photos.js';

export function init(el) {
  const pw = $('.final__pw', el), shade = $('.final__shade', el);
  const words = $$('.final__t .w > span', el), lock = $('.final__lock', el), cta = $('.final__cta', el), bg = $('.final__bg', el);
  const N = HAND.nailWide, HW = handWorld();
  const nailW = Math.max(N.w, HAND.nailClose.w * HW.k);
  const cMid = { x: HW.c.x + HW.c.w / 2, y: HW.c.y + HW.c.h / 2 };
  words.forEach((w) => { w.style.transition = 'none'; });
  // cambio de enfoque encadenado (inverso al de la portada): las capas de arriba se van apagando (c → cb → bb2 → b → bb → ab)
  const WIN = [[0.31, 0.39], [0.27, 0.33], [0.23, 0.29], [0.14, 0.2], [0.1, 0.16], [0.06, 0.12]];
  const world = createWorld(pw, ['a', 'ab', 'bb', 'b', 'bb2', 'cb', 'c'], WIN, { covers: ['ab'], anchor: { x: N.cx, y: N.cy }, reverse: true });

  let K, vw = 1, vh = 1, sC = 1;
  const measure = () => {
    const r = pw.getBoundingClientRect();
    vw = r.width || innerWidth; vh = r.height || innerHeight;
    const portrait = vw < 900;
    const sFill = Math.min((0.8 * vh) / N.h, (0.62 * vw) / (nailW * 1.05));
    sC = Math.max(sFill * 2, vw / (0.92 * HW.c.w), vh / (0.92 * HW.c.h));
    const sRow = portrait ? (0.84 * vw) / 343 : (0.5 * vw) / 343;
    // composición final: la mano a un lado (arriba en móvil) y el texto al otro, como en la portada
    const sEnd = portrait ? (0.9 * vw) / 600 : (vh * 1.04) / HAND.wide.h;
    const aEnd = portrait ? { x: 0.5 * vw, y: 0.17 * vh } : { x: 0.5 * vw + 0.19 * vw, y: 0.15 * vh };
    const mid = { x: 0.5 * vw, y: 0.5 * vh };
    const keys = [
      { p: 0, s: sC, fx: cMid.x, fy: cMid.y, ax: mid.x, ay: mid.y },
      { p: 0.23, s: sFill, fx: N.cx, fy: N.cy + 2, ax: mid.x, ay: mid.y },
      { p: 0.39, s: sRow, fx: HAND.tips.x, fy: HAND.tips.y, ax: mid.x, ay: mid.y },
      { p: 0.68, s: sEnd, fx: HAND.centerX, fy: HAND.top, ax: aEnd.x, ay: aEnd.y },
      { p: 1, s: sEnd * 1.03, fx: HAND.centerX, fy: HAND.top + 4, ax: aEnd.x, ay: aEnd.y },
    ];
    const xs = keys.map((q) => q.p);
    const sp = (f) => spline(xs, keys.map(f));
    K = { s: sp((k) => Math.log(k.s)), fx: sp((k) => k.fx), fy: sp((k) => k.fy), ax: sp((k) => k.ax), ay: sp((k) => k.ay) };
  };
  measure();
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { measure(); scene.force = true; }, 90); });

  const render = (p) => {
    world.cam({ s: Math.exp(K.s(p)), fx: K.fx(p), fy: K.fy(p), ax: K.ax(p), ay: K.ay(p), rot: lerp(-1.2, 2.4, seg(p, 0.1, 0.66, ease.io)) });
    world.mix(p, p < 0.06);   // uña → cuatro uñas → mano entera
    shade.style.setProperty('--shade', seg(p, 0.5, 0.7).toFixed(3));
    // titular palabra a palabra
    words.forEach((w, i) => {
      const u = seg(p, 0.58 + i * 0.035, 0.7 + i * 0.035, ease.out);
      w.style.transform = `translateY(${((1 - u) * 112).toFixed(1)}%)`;
    });
    const l = seg(p, 0.76, 0.86, ease.out);
    lock.style.opacity = l.toFixed(3);
    lock.style.transform = `translate3d(0, ${((1 - l) * 20).toFixed(1)}px, 0)`;
    const c = seg(p, 0.86, 0.95, ease.out);
    cta.style.opacity = c.toFixed(3);
    cta.style.transform = `translate3d(0, ${((1 - c) * 24).toFixed(1)}px, 0) scale(${lerp(0.92, 1, c).toFixed(3)})`;
    cta.style.visibility = c > 0.02 ? 'visible' : 'hidden';
    bg.style.opacity = (0.55 + 0.45 * seg(p, 0.3, 0.8)).toFixed(3);
  };
  const scene = registerScene(el, render, { damp: 5.5, onToggle: (on) => world.setActive(on) });
  el.classList.add('is-ready');
  return { scene };
}
