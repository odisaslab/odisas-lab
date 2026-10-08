"use client";

import { useEffect, useRef, useState } from "react";

interface CounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
  /** Dígitos mínimos (relleno con ceros): «03» */
  pad?: number;
}

/** Número animado. El valor final está en el HTML del servidor; la cuenta es solo realce. */
export function Counter({ value, suffix = "", prefix = "", duration = 1400, className = "", pad = 0 }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // El HTML del servidor trae el valor final; al hidratar se parte de 0 y se cuenta al verse
    setShown(0);

    let frame = 0;
    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 4);
        setShown(Math.round(value * eased));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          io.disconnect();
          run();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  const text = pad ? String(shown).padStart(pad, "0") : String(shown);
  return (
    <span ref={ref} className={`t-num ${className}`}>
      {prefix}
      {text}
      {suffix}
    </span>
  );
}
