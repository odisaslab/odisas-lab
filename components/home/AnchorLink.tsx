"use client";

import type { ReactNode } from "react";
import { scrollToId } from "@/lib/lenis";

/** Enlace a una sección de la misma página con desplazamiento suave (Lenis). Sin JS sigue siendo un ancla. */
export function AnchorLink({
  to,
  children,
  className = "",
  source,
}: {
  to: string;
  children: ReactNode;
  className?: string;
  source?: string;
}) {
  return (
    <a
      href={`#${to}`}
      data-cta={source}
      className={className}
      onClick={(event) => {
        if (scrollToId(to)) event.preventDefault();
      }}
    >
      {children}
    </a>
  );
}
