"use client";

import { useEffect } from "react";
import { setLenis } from "@/lib/lenis";

/**
 * Scroll suave con Lenis. Justificación: el storytelling de scroll se lee mejor con
 * inercia en rueda de ratón. Solo escritorio (puntero fino) y sin movimiento reducido;
 * en táctil se mantiene el scroll nativo, que es más fiable.
 * Se arranca tras el primer pintado para no competir con el LCP.
 */
export function SmoothScroll() {
  useEffect(() => {
    const ok = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!ok.matches) return;

    let cancelled = false;
    let destroy = () => {};

    const start = async () => {
      const { default: Lenis } = await import("lenis");
      if (cancelled) return;
      const lenis = new Lenis({ autoRaf: true, lerp: 0.11, smoothWheel: true, anchors: { offset: -88 } });
      setLenis(lenis);
      destroy = () => {
        lenis.destroy();
        setLenis(null);
      };
    };

    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const handle = w.requestIdleCallback ? w.requestIdleCallback(start, { timeout: 1500 }) : window.setTimeout(start, 700);

    return () => {
      cancelled = true;
      if (!w.requestIdleCallback) window.clearTimeout(handle);
      destroy();
    };
  }, []);

  return null;
}
