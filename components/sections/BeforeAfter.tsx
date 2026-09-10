"use client";

import { useId, useState, type ReactNode } from "react";
import { MoveHorizontal } from "lucide-react";

interface BeforeAfterProps {
  before: ReactNode;
  after: ReactNode;
  beforeLabel?: string;
  afterLabel?: string;
  /** Texto que describe la comparación para lectores de pantalla */
  description: string;
  /** Nota visible, por ejemplo cuando el contenido es una ilustración */
  note?: string;
}

/**
 * Comparador con control deslizante.
 * Usa un input range real, así funciona con ratón, dedo y teclado
 * (flechas, Inicio y Fin) sin lógica de arrastre propia.
 */
export function BeforeAfter({
  before,
  after,
  beforeLabel = "Antes",
  afterLabel = "Después",
  description,
  note,
}: BeforeAfterProps) {
  const [position, setPosition] = useState(50);
  const inputId = useId();

  return (
    <figure className="m-0">
      <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-line bg-light">
        <div className="relative aspect-[16/10] w-full">
          {/* Después: capa de fondo */}
          <div className="absolute inset-0">{after}</div>

          {/* Antes: capa recortada por la posición del control */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
          >
            {before}
          </div>

          {/* Línea divisoria y tirador */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 z-10 w-px bg-primary"
            style={{ left: `${position}%` }}
          >
            <span className="absolute top-1/2 left-1/2 inline-flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-white shadow-[var(--shadow-lift)]">
              <MoveHorizontal className="size-5" />
            </span>
          </div>

          <span className="absolute top-4 left-4 z-10 rounded-[var(--radius-pill)] bg-dark/85 px-3 py-1 text-xs font-medium text-white">
            {beforeLabel}
          </span>
          <span className="absolute top-4 right-4 z-10 rounded-[var(--radius-pill)] bg-primary px-3 py-1 text-xs font-medium text-dark">
            {afterLabel}
          </span>

          <label htmlFor={inputId} className="sr-only">
            {description}
          </label>
          <input
            id={inputId}
            type="range"
            min={0}
            max={100}
            step={1}
            value={position}
            onChange={(event) => setPosition(Number(event.target.value))}
            aria-valuetext={`${position}% visible del estado anterior`}
            className="absolute inset-0 z-20 h-full w-full cursor-ew-resize appearance-none bg-transparent focus-visible:outline-none [&::-moz-range-thumb]:h-10 [&::-moz-range-thumb]:w-11 [&::-moz-range-thumb]:cursor-ew-resize [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-transparent [&::-webkit-slider-thumb]:h-10 [&::-webkit-slider-thumb]:w-11 [&::-webkit-slider-thumb]:cursor-ew-resize [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-transparent"
          />
        </div>
      </div>

      <figcaption className="mt-4 flex flex-col gap-1 text-sm text-gray">
        <span>Arrastra el control o usa las flechas del teclado para comparar.</span>
        {note ? <span>{note}</span> : null}
      </figcaption>
    </figure>
  );
}
