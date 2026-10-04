"use client";

import { useEffect } from "react";

/**
 * Foco de cursor en las secciones oscuras: una luz naranja sigue al puntero y
 * deja ver una rejilla técnica que está "escondida" en el fondo.
 * Función: dar sensación de profundidad y de interfaz viva, no solo decorar.
 *
 * Solo con puntero fino y sin "reducir movimiento". El resto de visitantes
 * ve exactamente las mismas secciones, sin el efecto.
 */
export function PointerEffects() {
  useEffect(() => {
    const ok = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!ok.matches) return;

    const sections = Array.from(document.querySelectorAll<HTMLElement>("section.tone-dark"));
    sections.forEach((section) => section.setAttribute("data-spot", ""));

    let raf = 0;
    let pending: PointerEvent | null = null;
    let active: HTMLElement | null = null;

    const apply = () => {
      raf = 0;
      const event = pending;
      if (!event) return;
      const target = (event.target as Element | null)?.closest<HTMLElement>("section[data-spot]") ?? null;
      if (active && active !== target) active.removeAttribute("data-spot-on");
      active = target;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      target.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      target.style.setProperty("--my", `${event.clientY - rect.top}px`);
      target.setAttribute("data-spot-on", "");
    };

    const onMove = (event: PointerEvent) => {
      pending = event;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      active?.removeAttribute("data-spot-on");
      active = null;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
      sections.forEach((section) => {
        section.removeAttribute("data-spot");
        section.removeAttribute("data-spot-on");
      });
    };
  }, []);

  return null;
}
