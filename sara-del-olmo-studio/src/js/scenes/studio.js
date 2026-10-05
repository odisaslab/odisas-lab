/**
 * ACTO 11 · EL ESTUDIO. Después de estar «dentro» de las uñas, salimos al mundo real: la cámara
 * está dentro de la primera fotografía y se aleja hasta mostrar el estudio entero (la galería arrastrable).
 */
import { registerScene } from '../lib/scene.js';
import { $, seg, ease, lerp } from '../lib/util.js';

export function init(el) {
  const zoom = $('[data-zoom]', el), head = $('.studio__head', el), strip = $('[data-strip]', el);
  const render = (p) => {
    const first = strip.firstElementChild;
    if (first) {
      // el origen del zoom es el centro de la primera foto, medido con offsets (no se altera por la escala)
      const ox = strip.offsetLeft + first.offsetLeft + first.offsetWidth / 2 - strip.scrollLeft;
      const oy = strip.offsetTop + first.offsetTop + first.offsetHeight / 2;
      zoom.style.transformOrigin = `${Math.max(0, ox).toFixed(0)}px ${oy.toFixed(0)}px`;
    }
    const u = seg(p, 0.02, 0.72, ease.io);
    const s = lerp(innerWidth < 760 ? 2.1 : 2.7, 1, u);
    zoom.style.transform = `scale(${s.toFixed(4)})`;
    const h = seg(p, 0.46, 0.86, ease.out);
    head.style.opacity = h.toFixed(3);
    head.style.transform = `translate3d(0, ${((1 - h) * 34).toFixed(1)}px, 0)`;
  };
  const scene = registerScene(el, render, { damp: 8 });
  el.classList.add('is-ready');
  return { scene };
}
