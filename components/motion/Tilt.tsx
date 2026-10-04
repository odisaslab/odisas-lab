"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Inclina el contenido en 3D hacia el cursor, con un brillo que sigue al puntero.
 * Se usa solo en paneles de datos (diagnóstico, resumen de servicio): la profundidad
 * refuerza que son interfaces reales y no capturas planas.
 */
export function Tilt({
  children,
  className = "",
  max = 5,
}: {
  children: ReactNode;
  className?: string;
  /** Inclinación máxima en grados */
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ok = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!ok.matches) return;

    let raf = 0;
    let event: PointerEvent | null = null;

    const apply = () => {
      raf = 0;
      if (!event) return;
      const rect = el.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      el.style.setProperty("--ry", `${((px - 0.5) * 2 * max).toFixed(2)}deg`);
      el.style.setProperty("--rx", `${((0.5 - py) * 2 * max).toFixed(2)}deg`);
      el.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
      el.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
    };
    const onMove = (e: PointerEvent) => {
      event = e;
      el.dataset.tilting = "true";
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      el.dataset.tilting = "false";
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [max]);

  return (
    <div className="tilt-scene">
      <div ref={ref} className={`tilt ${className}`}>
        {children}
        <span aria-hidden="true" className="tilt-glare" />
      </div>
    </div>
  );
}
