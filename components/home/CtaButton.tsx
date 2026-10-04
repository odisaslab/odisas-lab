"use client";

import type { ReactNode } from "react";
import { ArrowRight, ArrowDown } from "lucide-react";
import { Magnetic } from "@/components/motion/Magnetic";
import { scrollToId } from "@/lib/lenis";

export const NEED_EVENT = "odisas:need";

type Variant = "primary" | "ink" | "ghost-light" | "ghost-dark";

interface CtaButtonProps {
  children: ReactNode;
  /** Id de la sección destino (sin #) */
  to?: string;
  /** Servicio que se preselecciona en el formulario */
  need?: string;
  variant?: Variant;
  arrow?: "right" | "down" | "none";
  className?: string;
  /** Qué hace este botón para la analítica: "hero", "servicio-seo"… */
  source?: string;
}

/**
 * Enlace con aspecto de botón que lleva al formulario (o a otra sección)
 * y, si se indica, preselecciona la necesidad. Sin JavaScript sigue siendo
 * un ancla normal a #contacto.
 */
export function CtaButton({
  children,
  to = "contacto",
  need,
  variant = "primary",
  arrow = "right",
  className = "",
  source,
}: CtaButtonProps) {
  const onClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (need) window.dispatchEvent(new CustomEvent(NEED_EVENT, { detail: need }));
    if (scrollToId(to)) event.preventDefault();
  };

  return (
    <Magnetic className={className.includes("w-full") ? "w-full" : ""}>
      <a
        href={`#${to}`}
        onClick={onClick}
        data-cta={source}
        className={`btn btn-${variant} ${className}`}
      >
        {children}
        {arrow === "right" ? <ArrowRight aria-hidden="true" className="arrow size-[1.05em]" /> : null}
        {arrow === "down" ? <ArrowDown aria-hidden="true" className="size-[1.05em]" /> : null}
      </a>
    </Magnetic>
  );
}
