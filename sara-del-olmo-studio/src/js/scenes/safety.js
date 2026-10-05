/**
 * ACTO 7 · SEGURIDAD. Cambio de mundo limpio y clínico: una línea de escáner barre la pantalla y deja
 * un fondo blanco. Después, por cada elemento: aparece un instrumental, se dibuja una línea alrededor
 * y el instrumental se transforma en un icono.
 */
import { registerScene } from '../lib/scene.js';
import { $, $$, seg, ease, clamp, lerp } from '../lib/util.js';
import { setDash } from './cam.js';

export function init(el) {
  const cover = $('.safety__cover', el), scan = $('.safety__scan', el);
  const head = $('.safety__head', el);
  const items = $$('.safe', el).map((n) => ({
    n,
    tool: $$('.safe__tool path', n), ring: $('.safe__ring circle', n), icon: $$('.safe__icon path', n),
    toolSvg: $('.safe__tool', n), iconSvg: $('.safe__icon', n),
    t: $('.safe__t', n), p: $('.safe__p', n),
  }));
  items.forEach((it) => { [...it.tool, it.ring, ...it.icon].forEach((e) => e.setAttribute('pathLength', '1')); });

  const render = (p) => {
    // barrido clínico: la línea desciende y revela el fondo claro
    const sweep = seg(p, 0.02, 0.2, ease.io);
    cover.style.clipPath = `inset(${(sweep * 100).toFixed(2)}% 0 0 0)`;
    scan.style.transform = `translate3d(0, ${(sweep * innerHeight).toFixed(1)}px, 0)`;
    scan.style.opacity = (sweep > 0 && sweep < 1 ? 1 : 0);
    const h = seg(p, 0.14, 0.3, ease.out);
    head.style.opacity = h.toFixed(3);
    head.style.transform = `translate3d(0, ${((1 - h) * 26).toFixed(1)}px, 0)`;

    items.forEach((it, i) => {
      const a = 0.26 + i * 0.2; // cada elemento ocupa ~20 % del recorrido
      const u = seg(p, a, a + 0.2, ease.linear);
      const toolD = seg(u, 0, 0.42, ease.out);
      const ringD = seg(u, 0.36, 0.64, ease.io);
      const toolOut = seg(u, 0.56, 0.74, ease.io);
      const iconD = seg(u, 0.6, 0.92, ease.out);
      it.tool.forEach((pa, k) => setDash(pa, clamp(toolD * 1.5 - k * 0.12)));
      it.toolSvg.style.opacity = (1 - toolOut).toFixed(3);
      it.toolSvg.style.transform = `scale(${lerp(1, 0.55, toolOut).toFixed(3)})`;
      setDash(it.ring, ringD);
      it.icon.forEach((pa, k) => setDash(pa, clamp(iconD * 1.4 - k * 0.1)));
      const txt = seg(u, 0.64, 0.95, ease.out);
      [it.t, it.p].forEach((n, k) => { const v = seg(u, 0.64 + k * 0.08, 0.98, ease.out); n.style.opacity = v.toFixed(3); n.style.transform = `translate3d(0, ${((1 - v) * 14).toFixed(1)}px, 0)`; });
      void txt;
    });
  };
  const scene = registerScene(el, render, { damp: 8 });
  el.classList.add('is-ready');
  return { scene };
}
