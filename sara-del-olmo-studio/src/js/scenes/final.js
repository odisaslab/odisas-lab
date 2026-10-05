/**
 * ACTO FINAL · RESERVA. La cámara vuelve a acercarse a una uña: ahora es la TUYA (el look que has diseñado),
 * en una mano terminada. La luz recorre la superficie, la cámara se aleja y aparece «Ahora, hazlo tuyo.»
 * con el CTA definitivo hacia Booksy.
 */
import { registerScene } from '../lib/scene.js';
import { $, $$, seg, ease, lerp, spline, clamp } from '../lib/util.js';
import { handMarkup, slotById } from '../art/hand.js';
import { NailSet } from '../art/nail-view.js';
import { look, onLook, lookHex } from '../lib/look.js';
import { CONFIG } from '../../data/config.js';
import { camT } from './cam.js';

export function init(el) {
  const svg = $('.final__svg', el), cam = $('.final__cam', el);
  const words = $$('.final__t .w > span', el), lock = $('.final__lock', el), cta = $('.final__cta', el), bg = $('.final__bg', el);
  cam.innerHTML = handMarkup('fh', look, { skin: CONFIG.skinTone, lightX: 500, lightY: 470 });
  const nails = new NailSet($$('.nail', cam), look);
  const mid = slotById('middle');
  const midNail = $$('.nail', cam)[2];
  const sync = () => { nails.setShape(look.shape, { animate: false }); nails.paint(lookHex(), look.finish, { instant: true }); };
  sync();
  onLook(() => { sync(); });
  words.forEach((w) => { w.style.transition = 'none'; });

  let K, vw = 1, vh = 1, unit = 1, end = { dx: 0, dy: 0 };
  const measure = () => {
    const r = svg.getBoundingClientRect();
    vw = r.width || innerWidth; vh = r.height || innerHeight;
    unit = Math.min(vw / 1000, vh / 1300);
    const portrait = vw < 900;
    const nailH = 164 * mid.k, nailW = 88 * mid.k;
    const sMacro = Math.max((0.9 * vh) / (nailH * unit), (0.5 * vw) / (nailW * unit)) * 1.05;
    // composición final: la mano a un lado (arriba en móvil) y el texto al otro, como en la portada
    const sEnd = portrait ? clamp((0.8 * vw) / (520 * unit), 0.8, 1.7) : Math.min(1.2, (0.46 * vw) / (520 * unit));
    const tipY = 300;
    const fyEnd = tipY + (0.5 - (portrait ? 0.21 : 0.2)) * vh / (unit * sEnd);
    end = portrait ? { dx: 0, dy: 0 } : { dx: 0.2 * vw, dy: 0 };
    const keys = [
      { p: 0, s: sMacro * 1.18, x: mid.cx, y: mid.cy },
      { p: 0.3, s: sMacro, x: mid.cx, y: mid.cy },
      { p: 0.46, s: lerp(sMacro, sEnd, 0.5), x: lerp(mid.cx, 520, 0.6), y: lerp(mid.cy, fyEnd, 0.5) },
      { p: 0.64, s: sEnd, x: 520, y: fyEnd },
      { p: 1, s: sEnd * 1.03, x: 520, y: fyEnd + 4 },
    ];
    const xs = keys.map((q) => q.p);
    K = { s: spline(xs, keys.map((q) => Math.log(q.s))), x: spline(xs, keys.map((q) => q.x)), y: spline(xs, keys.map((q) => q.y)) };
  };
  measure();
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { measure(); scene.force = true; }, 90); });

  const render = (p) => {
    const sh = seg(p, 0.3, 0.64, ease.io);
    cam.setAttribute('transform', camT(500 + (end.dx * sh) / unit, 650, Math.exp(K.s(p)), K.x(p), K.y(p)));
    // la luz recorre la uña (el barrido está controlado por el scroll, no es una animación suelta)
    const sw = $('.n-sweep', midNail);
    const sp = seg(p, 0.04, 0.3, ease.io);
    sw.style.transform = `translateX(${lerp(-30, 250, sp).toFixed(1)}px)`;
    sw.style.opacity = (Math.sin(Math.PI * sp) * 0.95).toFixed(3);
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
  const scene = registerScene(el, render, { damp: 7 });
  el.classList.add('is-ready');
  return { scene, nails };
}
