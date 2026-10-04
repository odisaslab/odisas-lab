"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** Retardo en segundos, para escalonar elementos de una misma fila */
  delay?: number;
  className?: string;
}

/**
 * Aparición al entrar en pantalla con IntersectionObserver y transición CSS.
 * Sin librerías: el contenido es visible si no hay JavaScript o hay movimiento reducido.
 */
export function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"visible" | "hidden" | "shown">("visible");

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    setState("hidden");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState("shown");
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${className} ${
        state === "hidden" ? "translate-y-5 opacity-0" : "translate-y-0 opacity-100"
      } transition-[opacity,transform] duration-700 ease-out`}
      style={{ transitionDelay: state === "shown" ? `${delay}s` : undefined }}
    >
      {children}
    </div>
  );
}
