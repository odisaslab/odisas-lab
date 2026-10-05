/**
 * «Mundo» de fotos: varias fotos alineadas dentro de un mismo contenedor, movidas por UNA cámara CSS
 * (traslación + rotación + zoom). Para pasar de una foto a la siguiente se encadena un cambio de enfoque con
 * capas apiladas en el orden del viaje, p. ej. (portada):
 *     general nítida → general borrosa → macro borrosa → macro nítida → macro borrosa → uña borrosa → uña nítida
 * Cada paso es un fundido entre dos imágenes idénticas (nítida/borrosa) o entre dos manchas de color, así que
 * no se ven «uñas dobles» aunque las fotos no coincidan fuera del punto de alineación, y no hace falta ningún
 * filtro en tiempo real (las borrosas son diminutas y el navegador las estira suavemente).
 * `mix(u)`: u va de 0 (solo la primera capa) a N-1 (solo la última); cada capa aparece en un tramo de 1.
 * Lo usan la portada (general → uña), el cierre (uña → general) y el piercing (joya → oreja).
 */
import { $, ease, clamp } from './util.js';

/**
 * @param root     contenedor `.pw`
 * @param names    clases de las capas sin el prefijo `pw__`, en orden de apilado (de abajo a arriba)
 * @param covers   nombres de capas que tapan por completo a la anterior (esta puede ocultarse cuando aquella es opaca)
 */
export function createWorld(root, names = ['a', 'ab', 'bb', 'b', 'bb2', 'cb', 'c'], covers = ['ab']) {
  const world = $('.pw__world', root);
  const L = names.map((n) => $('.pw__' + n, root));
  const cov = names.map((n) => covers.includes(n));
  const last = L.length - 1;
  let shown = '', mixed = '';
  const op = new Array(L.length).fill(0);
  return {
    /** Cámara: punto (fx, fy) del mundo anclado al píxel (ax, ay) de la pantalla, con zoom s y giro rot (grados). */
    cam({ s, fx, fy, ax, ay, rot = 0 }) {
      const t = `translate(${ax.toFixed(2)}px, ${ay.toFixed(2)}px) rotate(${rot.toFixed(3)}deg) scale(${s.toFixed(4)}) translate(${(-fx).toFixed(2)}px, ${(-fy).toFixed(2)}px)`;
      if (t !== shown) { world.style.transform = t; shown = t; }
    },
    /** u = 0 primera foto · u = N-1 última. `solo`: oculta todo lo que queda bajo la última capa opaca (cuando ya llena la pantalla). */
    mix(u, solo = false) {
      const key = u.toFixed(4) + solo;
      if (key === mixed) return;
      mixed = key;
      for (let i = 0; i <= last; i++) op[i] = i === 0 ? 1 : ease.smooth(clamp(u - (i - 1)));
      let top = 0;
      if (solo) for (let i = last; i > 0; i--) if (op[i] >= 0.999) { top = i; break; }
      for (let i = 0; i <= last; i++) {
        const covered = (i < last && cov[i + 1] && op[i + 1] >= 0.999) || (solo && i < top);
        const v = !covered && (i === 0 || op[i] > 0.002) ? 'visible' : 'hidden';
        if (L[i].style.visibility !== v) L[i].style.visibility = v;
        L[i].style.opacity = op[i].toFixed(3);
      }
    },
  };
}
