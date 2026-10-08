import type { ReactNode } from "react";

/**
 * Marca de contenido PENDIENTE de proporcionar por Zona Pies (briefing §30).
 * Es deliberadamente visible: no debe pasar a producción sin sustituirse.
 */
export function PlaceholderTag({ children = "Placeholder" }: { children?: ReactNode }) {
  return <span className="ph-tag">{children}</span>;
}

interface PlaceholderBoxProps {
  /** Qué falta, en una frase: «Foto del laboratorio» */
  label: string;
  /** Relación de aspecto CSS: «4 / 3» */
  ratio?: string;
  className?: string;
  children?: ReactNode;
}

/** Hueco para una fotografía, vídeo o bloque que todavía no existe. */
export function PlaceholderBox({ label, ratio = "4 / 3", className = "", children }: PlaceholderBoxProps) {
  return (
    <div
      role="img"
      aria-label={`Contenido pendiente: ${label}`}
      className={`ph flex items-end rounded-2xl p-5 ${className}`}
      style={{ aspectRatio: ratio }}
    >
      <PlaceholderTag />
      <div className="relative z-[1]">
        <p className="hud text-muted">{label}</p>
        {children}
      </div>
    </div>
  );
}

/** Texto de relleno marcado. Úsalo dentro de párrafos en lugar de inventar. */
export function PendingText({ children }: { children: ReactNode }) {
  return <span className="pending">[{children}]</span>;
}
