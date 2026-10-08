"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Botón magnético: se acerca ligeramente al puntero para marcar la acción principal.
 * Solo puntero fino y sin movimiento reducido. Únicamente transform (GPU).
 */
export function Magnetic({
  children,
  strength = 0.22,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ok = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!ok.matches) return;

    let frame = 0;
    let tx = 0;
    let ty = 0;
    const apply = () => {
      frame = 0;
      el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    };
    const move = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      tx = (event.clientX - (rect.left + rect.width / 2)) * strength;
      ty = (event.clientY - (rect.top + rect.height / 2)) * strength;
      el.style.transition = "transform 0.15s linear";
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const reset = () => {
      tx = 0;
      ty = 0;
      el.style.transition = "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)";
      if (!frame) frame = requestAnimationFrame(apply);
    };

    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", reset);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", reset);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [strength]);

  return (
    <span ref={ref} className={`inline-flex will-change-transform ${className}`}>
      {children}
    </span>
  );
}
