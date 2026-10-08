"use client";

import { createElement, type CSSProperties, type ReactNode } from "react";
import { useReveal } from "./useReveal";

type Tag = "div" | "section" | "article" | "li" | "ul" | "p" | "span" | "header" | "figure" | "aside";

interface RevealProps {
  as?: Tag;
  delay?: number;
  /** Desplazamiento vertical inicial en px */
  y?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  id?: string;
}

/** Envuelve un bloque para que aparezca al hacer scroll. Solo transform + opacity (GPU). */
export function Reveal({ as = "div", delay = 0, y = 28, className, style, children, id }: RevealProps) {
  const ref = useReveal<HTMLElement>();
  return createElement(
    as,
    {
      ref,
      id,
      className,
      style: { "--rv-d": `${delay}ms`, "--rv-y": `${y}px`, ...style } as CSSProperties,
    },
    children,
  );
}
