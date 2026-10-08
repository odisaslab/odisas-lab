import type Lenis from "lenis";

/** Instancia global de Lenis (solo existe en escritorio y sin movimiento reducido). */
let instance: Lenis | null = null;

export const setLenis = (lenis: Lenis | null) => {
  instance = lenis;
};
export const getLenis = () => instance;

/** Bloquea el scroll del documento (diálogos, menú móvil), con o sin Lenis. */
export function lockScroll(locked: boolean) {
  if (typeof document === "undefined") return;
  if (locked) {
    instance?.stop();
    document.documentElement.style.overflow = "hidden";
  } else {
    document.documentElement.style.overflow = "";
    instance?.start();
  }
}

/** Desplazamiento suave a un ancla o posición, respetando Lenis si está activo. */
export function scrollToTarget(target: string | HTMLElement | number, offset = -88) {
  if (instance) {
    instance.scrollTo(target as never, { offset, duration: 1.4 });
    return;
  }
  if (typeof target === "number") {
    window.scrollTo({ top: target, behavior: "smooth" });
    return;
  }
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
}
