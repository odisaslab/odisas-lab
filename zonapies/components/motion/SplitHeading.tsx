"use client";

import { createElement, Fragment, type CSSProperties } from "react";
import { useReveal } from "./useReveal";

interface SplitHeadingProps {
  /** Texto del titular. `*palabras*` se resaltan con el color de acento; `\n` es salto de línea. */
  text: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "div";
  className?: string;
  /** Animación CSS en la carga (hero): no depende de JS ni retrasa el LCP */
  intro?: boolean;
  delay?: number;
  id?: string;
}

interface Part {
  text: string;
  accent: boolean;
}

/** Una palabra = tramo continuo sin espacios; puede mezclar partes resaltadas y puntuación («¿*Empezamos*?»). */
interface Token {
  parts: Part[];
  br?: boolean;
}

function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  let accent = false;
  for (const line of text.split("\n")) {
    let current: Part[] | null = null;
    for (const raw of line.split(/(\*)/)) {
      if (raw === "*") {
        accent = !accent;
        continue;
      }
      for (const piece of raw.split(/(\s+)/)) {
        if (piece === "") continue;
        if (/^\s+$/.test(piece)) {
          if (current) tokens.push({ parts: current });
          current = null;
          continue;
        }
        if (!current) current = [];
        current.push({ text: piece, accent });
      }
    }
    if (current) tokens.push({ parts: current });
    tokens.push({ parts: [], br: true });
  }
  tokens.pop(); // último salto de línea sobrante
  return tokens;
}

export const plainText = (text: string) => text.replace(/\*/g, "").replace(/\n/g, " ");

/**
 * Titular que aparece palabra a palabra. Accesible: el nombre accesible es el texto
 * completo y las palabras sueltas se ocultan al lector de pantalla.
 */
export function SplitHeading({ text, as = "h2", className = "", intro = false, delay = 0, id }: SplitHeadingProps) {
  const ref = useReveal<HTMLElement>();
  const tokens = tokenize(text);
  let index = 0;

  return createElement(
    as,
    {
      ref: intro ? undefined : ref,
      id,
      className: `split ${intro ? "split-intro" : ""} ${className}`,
      "aria-label": plainText(text),
      style: { "--rv-d": `${delay}ms` } as CSSProperties,
    },
    <span aria-hidden="true">
      {tokens.map((token, i) =>
        token.br ? (
          <br key={i} />
        ) : (
          <Fragment key={i}>
            <span className="w">
              <span className="wi" style={{ "--i": index++ } as CSSProperties}>
                {token.parts.map((part, k) => (part.accent ? <span key={k} className="t-accent">{part.text}</span> : part.text))}
              </span>
            </span>{" "}
          </Fragment>
        ),
      )}
    </span>,
  );
}
