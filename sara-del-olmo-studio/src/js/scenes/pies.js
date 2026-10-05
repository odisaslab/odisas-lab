/**
 * ACTO 4 · DE LAS MANOS A LOS PIES. El color de TU look inunda la pantalla y sobre él aparecen los dedos gordos
 * (la cámara está encima de las uñas); después se aleja: la uña es un dedo, el dedo un pie, y aparecen los dos.
 * Al final la pantalla se oscurece para dar paso a las cejas.
 * Los pies son una fotografía recortada (transparente) que se mueve con una transformación CSS.
 */
import { registerScene } from '../lib/scene.js';
import { $, $$, seg, ease, lerp, spline, warmImages } from '../lib/util.js';
import { applyLookTheme, onLook } from '../lib/look.js';
import { FEET } from '../../data/scene-photos.js';

export function init(el) {
  const feet = $('.pies__feet', el), stage = $('.scene__stage', el);
  const k = $('.kicker', el), t1 = $('.pies__t1', el), t2 = $('.pies__t2', el), lead = $('.pies__lead', el);
  const items = $$('.mini-list li', el), cta = $('.pies__cta', el);

  warmImages(feet, 600);
  applyLookTheme();
  onLook(() => { scene.force = true; });

  let K, W = 1, H = 1, end = { dx: 0, dy: 0 };
  const measure = () => {
    const r = stage.getBoundingClientRect();
    W = r.width || innerWidth; H = r.height || innerHeight;
    const portrait = W < H * 0.95;
    const c = FEET.core, yEnd = portrait ? c.yPort : c.yLand;
    const coreW = c.x1 - c.x0, coreH = yEnd - c.y0, cy = (c.y0 + yEnd) / 2;
    // zona donde se colocan los pies al final (el texto ocupa el resto)
    const area = portrait ? { w: 0.9 * W, h: 0.4 * H, cx: W / 2, cy: 64 + 14 + 0.2 * H } : { w: 0.54 * W, h: H - 110, cx: 0.7 * W, cy: 38 + H / 2 };
    const sFeet = Math.min((0.94 * area.w) / coreW, (0.94 * area.h) / coreH);
    end = { dx: area.cx - W / 2, dy: area.cy - H / 2 };
    const sStart = portrait ? 1.1 : (0.8 * W) / (FEET.bigToes.span + 120);
    const bt = FEET.bigToes;
    const sMid = Math.max(sFeet * 1.9, sStart / 1.7);
    const keys = [
      { p: 0, s: sStart, x: bt.x, y: bt.y + 20 },
      { p: 0.1, s: sStart * 0.95, x: bt.x, y: bt.y + 20 },
      { p: 0.36, s: sMid, x: lerp(bt.x, 512, 0.4), y: lerp(bt.y, cy, 0.45) },
      { p: 0.62, s: sFeet, x: 512, y: cy },
      { p: 1, s: sFeet * 1.02, x: 512, y: cy + 2 },
    ];
    const xs = keys.map((q) => q.p);
    K = { s: spline(xs, keys.map((q) => Math.log(q.s))), x: spline(xs, keys.map((q) => q.x)), y: spline(xs, keys.map((q) => q.y)) };
    // en vertical solo se ve hasta el empeine: lo de debajo se difumina antes de llegar al texto
    feet.classList.toggle('is-fade', portrait);
    feet.style.setProperty('--m0', `${(((yEnd - 130) / FEET.img.h) * 100).toFixed(1)}%`);
    feet.style.setProperty('--m1', `${(((yEnd + 90) / FEET.img.h) * 100).toFixed(1)}%`);
  };
  measure();
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { measure(); scene.force = true; }, 90); });

  const show = (node, p, a, b, dy = 30) => {
    const u = seg(p, a, b, ease.out);
    node.style.opacity = u.toFixed(3);
    node.style.transform = `translate3d(0, ${((1 - u) * dy).toFixed(1)}px, 0)`;
    return u;
  };

  const render = (p) => {
    const s = Math.exp(K.s(p));
    const sh = seg(p, 0.3, 0.64, ease.io);
    const ax = W / 2 + end.dx * sh, ay = H / 2 + end.dy * sh;
    feet.style.transform = `translate(${ax.toFixed(2)}px, ${ay.toFixed(2)}px) scale(${s.toFixed(4)}) translate(${(-K.x(p)).toFixed(2)}px, ${(-K.y(p)).toFixed(2)}px)`;
    show(k, p, 0.56, 0.64, 16);
    show(t1, p, 0.58, 0.7, 50);
    show(t2, p, 0.63, 0.75, 50);
    show(lead, p, 0.7, 0.78, 24);
    items.forEach((li, i) => show(li, p, 0.73 + i * 0.018, 0.82 + i * 0.018, 18));
    const u = show(cta, p, 0.84, 0.92, 18);
    cta.style.visibility = u > 0.02 ? 'visible' : 'hidden';
    // al final, la pantalla se oscurece (las cejas empiezan en la penumbra)
    stage.style.setProperty('--dark', seg(p, 0.93, 1, ease.io).toFixed(3));
  };
  const scene = registerScene(el, render, { damp: 5.5 });
  el.classList.add('is-ready');
  return { scene };
}
