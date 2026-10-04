import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };

/** Condiciones de movimiento: todo lo que oculta o fija contenido vive dentro de estas. */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";
export const MOTION_DESKTOP = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";
