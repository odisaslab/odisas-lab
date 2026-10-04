import type Lenis from "lenis";

let instance: Lenis | null = null;

export const setLenis = (lenis: Lenis | null) => {
  instance = lenis;
};

export const stopScroll = () => instance?.stop();
export const startScroll = () => instance?.start();

/** Desplaza hasta un id. Usa Lenis si está activo y el scroll nativo si no. */
export function scrollToId(id: string) {
  const target = document.getElementById(id);
  if (!target) return false;
  if (instance) {
    instance.scrollTo(target, { offset: 0, duration: 1.3 });
  } else {
    target.scrollIntoView({ behavior: "auto", block: "start" });
  }
  history.replaceState(null, "", `#${id}`);
  return true;
}
