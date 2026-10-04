import { createElement, type ReactNode } from "react";

/**
 * Parte un texto en palabras para el text reveal.
 * Las palabras entre asteriscos van en naranja: "Hacemos que *crezca*".
 * El texto sigue siendo un solo encabezado para lectores de pantalla y buscadores.
 */
export function Split({
  text,
  as = "h2",
  className = "",
  id,
  animate = true,
}: {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  id?: string;
  animate?: boolean;
}) {
  const segments = text.split("*");
  const nodes: ReactNode[] = [];
  let count = 0;

  segments.forEach((segment, segmentIndex) => {
    const accent = segmentIndex % 2 === 1;
    segment
      .split(/(\s+)/)
      .filter(Boolean)
      .forEach((chunk) => {
        if (/^\s+$/.test(chunk)) {
          nodes.push(" ");
          return;
        }
        nodes.push(
          <span key={`${segmentIndex}-${count}`} className="w" aria-hidden="true">
            <span className={accent ? "accent" : undefined}>{chunk}</span>
          </span>,
        );
        count += 1;
      });
  });

  return createElement(
    as,
    { className, id, ...(animate ? { "data-split": "" } : {}) },
    <span className="sr-only">{text.replaceAll("*", "")}</span>,
    ...nodes,
  );
}
