/**
 * Un único listener de scroll/resize para toda la web, sincronizado con requestAnimationFrame.
 * Los componentes se suscriben aquí en lugar de añadir listeners propios (menos trabajo en INP).
 */
export type ScrollListener = (scrollY: number, viewportHeight: number) => void;

const listeners = new Set<ScrollListener>();
let frame = 0;
let bound = false;

function flush() {
  frame = 0;
  const y = window.scrollY;
  const vh = window.innerHeight;
  listeners.forEach((listener) => listener(y, vh));
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(flush);
}

function bind() {
  if (bound) return;
  bound = true;
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
}

function unbind() {
  if (!bound) return;
  bound = false;
  window.removeEventListener("scroll", schedule);
  window.removeEventListener("resize", schedule);
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
}

/** Suscribe un listener. Se llama una vez al suscribirse para fijar el estado inicial. */
export function onScroll(listener: ScrollListener): () => void {
  listeners.add(listener);
  bind();
  schedule();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) unbind();
  };
}

/** Progreso (0–1) de un contenedor «pegajoso»: 0 al empezar a fijarse, 1 al terminar. */
export function stickyProgress(el: HTMLElement, viewportHeight: number): number {
  const rect = el.getBoundingClientRect();
  const distance = rect.height - viewportHeight;
  if (distance <= 0) return 0;
  return Math.min(1, Math.max(0, -rect.top / distance));
}
