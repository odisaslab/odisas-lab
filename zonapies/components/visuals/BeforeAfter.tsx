"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { PlaceholderTag } from "@/components/ui/Placeholder";

interface BeforeAfterProps {
  before?: string;
  after?: string;
  beforeAlt?: string;
  afterAlt?: string;
  className?: string;
  /** Oculta la etiqueta «Imagen pendiente» (cuando el contenedor ya lleva la suya) */
  hideTag?: boolean;
}

/**
 * Comparador antes/después. Con imágenes reales las muestra; sin ellas, dibuja huecos
 * marcados como pendientes. El control es un <input type="range"> real: accesible por teclado.
 */
export function BeforeAfter({ before, after, beforeAlt = "Antes", afterAlt = "Después", className = "", hideTag = false }: BeforeAfterProps) {
  const id = useId();
  const [position, setPosition] = useState(50);
  const missing = !before || !after;

  return (
    <div className={`relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-line-strong bg-surface-2 ${className}`}>
      {/* Después (fondo) */}
      <div className="absolute inset-0">
        {after ? (
          <Image src={after} alt={afterAlt} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" loading="lazy" />
        ) : (
          <div className="ph relative h-full">
            <span className="hud absolute bottom-4 right-4 text-muted">Después</span>
          </div>
        )}
      </div>
      {/* Antes (recortado) */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        {before ? (
          <Image src={before} alt={beforeAlt} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" loading="lazy" />
        ) : (
          <div className="relative h-full bg-surface-2" style={{ backgroundImage: "repeating-linear-gradient(135deg, transparent 0 10px, color-mix(in srgb, var(--fg) 6%, transparent) 10px 11px)" }}>
            <span className="hud absolute bottom-4 left-4 text-muted">Antes</span>
          </div>
        )}
      </div>

      <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 w-px bg-accent" style={{ left: `${position}%` }}>
        <span className="absolute left-1/2 top-1/2 grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-accent bg-surface text-accent-text">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 7-5 5 5 5M15 7l5 5-5 5" />
          </svg>
        </span>
      </span>

      <label htmlFor={id} className="sr-only">
        Comparar antes y después
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={(event) => setPosition(Number(event.target.value))}
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />

      {missing && !hideTag ? <PlaceholderTag>Imagen pendiente</PlaceholderTag> : null}
    </div>
  );
}
