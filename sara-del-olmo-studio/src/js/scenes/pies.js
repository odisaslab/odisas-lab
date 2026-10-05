/**
 * ACTO 4 · DE LAS MANOS A LOS PIES. El color de TU look inunda la pantalla (la cámara está dentro de una
 * uña del dedo gordo), después se aleja: la uña es un dedo, el dedo un pie, y aparecen los dos.
 * Al final la pantalla se oscurece para dar paso a las cejas.
 */
import { registerScene } from '../lib/scene.js';
import { $, $$, seg, ease, lerp, spline, clamp } from '../lib/util.js';
import { feetMarkup, BIG_TOE } from '../art/feet.js';
import { NailSet } from '../art/nail-view.js';
import { look, onLook, lookHex, applyLookTheme } from '../lib/look.js';
import { CONFIG } from '../../data/config.js';
import { camT, vis, tr } from './cam.js';

export function init(el) {
  const svg = $('.pies__svg', el), cam = $('.pies__cam', el), stage = $('.scene__stage', el);
  const k = $('.kicker', el), t1 = $('.pies__t1', el), t2 = $('.pies__t2', el), lead = $('.pies__lead', el);
  const items = $$('.mini-list li', el), cta = $('.pies__cta', el);

  cam.innerHTML = feetMarkup('pf', look, { skin: CONFIG.skinTone });
  const nails = new NailSet($$('.nail', cam), { ...look, shape: 'redonda' });
  const sync = () => nails.paint(lookHex(), look.finish, { instant: true });
  sync();
  applyLookTheme();
  onLook(() => { sync(); scene.force = true; });

  let K, W = 1, H = 1, unit = 1, end = { dx: 0, dy: 0 };
  const measure = () => {
    const r = svg.getBoundingClientRect();
    W = r.width || innerWidth; H = r.height || innerHeight;
    unit = Math.min(W / 1000, H / 1060);
    const portrait = W < H * 0.95;
    // zona donde se colocan los pies al final (el texto ocupa el resto)
    const area = portrait ? { w: 0.9 * W, h: 0.34 * H, cx: W / 2, cy: 64 + 14 + 0.17 * H } : { w: 0.54 * W, h: H - 110, cx: 0.7 * W, cy: 38 + H / 2 };
    const sFeet = Math.min((0.92 * area.w) / (780 * unit), (0.92 * area.h) / (715 * unit));
    end = { dx: area.cx - W / 2, dy: area.cy - H / 2 };
    const sMacro = Math.max(W / (BIG_TOE.w * unit), H / (BIG_TOE.h * unit)) * (portrait ? 1.0 : 1.4);
    const sMid = Math.max(sFeet * 1.9, sMacro / 3.4);
    const keys = [
      { p: 0, s: sMacro, x: BIG_TOE.x, y: BIG_TOE.y },
      { p: 0.1, s: sMacro * 0.93, x: BIG_TOE.x, y: BIG_TOE.y },
      { p: 0.36, s: sMid, x: lerp(BIG_TOE.x, 500, 0.4), y: lerp(BIG_TOE.y, 560, 0.45) },
      { p: 0.62, s: sFeet, x: 500, y: 548 },
      { p: 1, s: sFeet * 1.02, x: 500, y: 550 },
    ];
    const xs = keys.map((q) => q.p);
    K = { s: spline(xs, keys.map((q) => Math.log(q.s))), x: spline(xs, keys.map((q) => q.x)), y: spline(xs, keys.map((q) => q.y)) };
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
    cam.setAttribute('transform', camT(500 + (end.dx * sh) / unit, 530 + (end.dy * sh) / unit, s, K.x(p), K.y(p)));
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
  const scene = registerScene(el, render, { damp: 7 });
  el.classList.add('is-ready');
  return { scene, nails };
}
