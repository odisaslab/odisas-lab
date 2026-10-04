"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Anillo que sigue al puntero y crece sobre elementos interactivos.
 * Solo con puntero fino y movimiento permitido: en táctil no existe.
 */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ring.current;
    if (!el) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const calm = window.matchMedia("(prefers-reduced-motion: no-preference)");
    if (!fine.matches || !calm.matches) return;

    const x = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3.out" });
    const y = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3.out" });

    const move = (event: PointerEvent) => {
      el.dataset.on = "true";
      x(event.clientX);
      y(event.clientY);
      const target = event.target as Element | null;
      el.dataset.hover = target?.closest("a, button, summary, [data-cursor]") ? "true" : "false";
    };
    const leave = () => {
      el.dataset.on = "false";
    };

    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, []);

  return <div ref={ring} aria-hidden="true" className="cursor-ring" data-on="false" />;
}
