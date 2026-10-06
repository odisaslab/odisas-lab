/**
 * «Mundo» de fotos: varias fotos alineadas dentro de un mismo contenedor, movidas por UNA cámara CSS
 * (traslación + rotación + zoom). Para pasar de una foto a la siguiente se encadena un cambio de enfoque con
 * capas apiladas en el orden del viaje, p. ej. (portada):
 *     general nítida → general borrosa → macro borrosa → macro nítida → macro borrosa → uña borrosa → uña nítida
 * Cada paso es un fundido entre dos imágenes idénticas (nítida/borrosa) o entre dos manchas de color, así que
 * no se ven «uñas dobles» aunque las fotos no coincidan fuera del punto de alineación, y no hace falta ningún
 * filtro en tiempo real (las borrosas son diminutas y el navegador las estira suavemente).
 *
 * Cada capa tiene su ventana de fundido en términos del progreso `p` de la escena; las ventanas se solapan un poco,
 * así el paso de una foto a otra no tiene «escalones». Además cada capa que entra llega con un pequeño zoom
 * (1 - ZOOM → 1) y la que queda debajo se infla un poco (1 → 1 + ZOOM_UNDER) alrededor del punto de alineación:
 * el ojo lee el cambio de foto como una continuación del movimiento de cámara, no como un fundido encima.
 *
 * Lo usan la portada (general → uña, `reverse: false`), el cierre (uña → general, `reverse: true`: las capas de arriba
 * se van apagando) y el piercing (joya → oreja).
 */
import { $, clamp, ease, warmImages, isLowEnd } from './util.js';
import { createPhotoGL } from './gpu.js';

const ZOOM = 0.1, ZOOM_UNDER = 0.05;

/**
 * @param root     contenedor `.pw`
 * @param names    clases de las capas sin el prefijo `pw__`, en orden de apilado (de abajo a arriba)
 * @param windows  [p0, p1] de cada capa (salvo la primera): tramo de p en el que aparece (o desaparece, si `reverse`)
 * @param opts     covers: capas que tapan por completo a la anterior · anchor: punto del mundo alrededor del que se infla ·
 *                 reverse: las capas se apagan en lugar de encenderse
 */
export function createWorld(root, names, windows, { covers = [], anchor = { x: 0, y: 0 }, reverse = false } = {}) {
  const world = $('.pw__world', root);
  const L = names.map((n) => $('.pw__' + n, root));
  const cov = names.map((n) => covers.includes(n));
  const last = L.length - 1;
  // el origen de la transformación de cada capa, en coordenadas de la propia capa (están colocadas con left/top en px de mundo)
  L.forEach((el) => { el.style.transformOrigin = `${anchor.x - (parseFloat(el.style.left) || 0)}px ${anchor.y - (parseFloat(el.style.top) || 0)}px`; });
  // Compositor WebGL: si está disponible, las fotos se pintan en la tarjeta gráfica y las capas HTML solo quedan de reserva
  const gpu = createPhotoGL(root, L, { low: isLowEnd() });
  let glOn = false;
  if (gpu) gpu.onLost(() => { glOn = false; root.classList.remove('is-gl'); shown = ''; mixed = ''; });
  else warmImages(root);
  let shown = '', mixed = '', camp = { s: 1, fx: 0, fy: 0, ax: 0, ay: 0, rot: 0 };
  const op = new Array(L.length).fill(1), sc = new Array(L.length).fill(1), vis = new Array(L.length).fill(false);
  return {
    /** Cámara: punto (fx, fy) del mundo anclado al píxel (ax, ay) de la pantalla, con zoom s y giro rot (grados). */
    cam(c) {
      camp = { rot: 0, ...c };
      gpu && gpu.cam(camp);
      if (glOn) return;
      const { s, fx, fy, ax, ay, rot } = camp;
      const t = `translate(${ax.toFixed(2)}px, ${ay.toFixed(2)}px) rotate(${rot.toFixed(3)}deg) scale(${s.toFixed(4)}) translate(${(-fx).toFixed(2)}px, ${(-fy).toFixed(2)}px)`;
      if (t !== shown) { world.style.transform = t; shown = t; }
    },
    /** Dónde cae un punto del mundo en la pantalla (para colocar elementos HTML sobre la foto). */
    project(x, y) {
      const { s, fx, fy, ax, ay, rot } = camp, th = (rot * Math.PI) / 180, co = Math.cos(th) * s, si = Math.sin(th) * s;
      return [ax + co * (x - fx) - si * (y - fy), ay + si * (x - fx) + co * (y - fy)];
    },
    /** La escena entra/sale del área cercana a la pantalla: se cargan/liberan las texturas. */
    setActive(on) {
      if (!gpu) return;
      gpu.setActive(on, (ready) => { glOn = ready; root.classList.toggle('is-gl', ready); if (!ready) { shown = ''; mixed = ''; } });
    },
    /** Pinta el estado de las capas para el progreso p. `solo`: oculta lo que queda bajo la última capa opaca (cuando ya llena la pantalla). */
    mix(p, solo = false) {
      const key = p.toFixed(4) + solo + glOn;
      if (key === mixed) return;
      mixed = key;
      for (let i = 1; i <= last; i++) {
        const t = ease.smooth(clamp((p - windows[i - 1][0]) / (windows[i - 1][1] - windows[i - 1][0])));
        op[i] = reverse ? 1 - t : t;
      }
      op[0] = 1;
      let top = 0;
      if (solo) for (let i = last; i > 0; i--) if (op[i] >= 0.999) { top = i; break; }
      for (let i = 0; i <= last; i++) {
        const next = i < last ? op[i + 1] : 0;
        // la capa que entra llega con un poco menos de zoom; la que queda debajo se infla un poco al ser cubierta
        sc[i] = (i === 0 ? 1 : 1 - ZOOM * (1 - op[i])) * (1 + ZOOM_UNDER * next);
        const covered = (i < last && cov[i + 1] && op[i + 1] >= 0.999) || (solo && i < top);
        vis[i] = !covered && (i === 0 || op[i] > 0.002);
        gpu && gpu.layer(i, op[i], sc[i], vis[i]);
        if (glOn) continue;
        const el = L[i], v = vis[i] ? 'visible' : 'hidden';
        if (el.style.visibility !== v) el.style.visibility = v;
        if (i > 0) el.style.opacity = op[i].toFixed(3);
        if (vis[i]) el.style.transform = `scale(${sc[i].toFixed(4)})`;
      }
    },
  };
}
