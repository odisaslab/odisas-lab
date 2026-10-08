import type { CSSProperties, ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";

interface SectionProps {
  /** Identificador de analítica (data-section) y ancla */
  name: string;
  theme: "light" | "dark";
  id?: string;
  className?: string;
  tight?: boolean;
  style?: CSSProperties;
  children: ReactNode;
  /** Etiqueta accesible si la sección no tiene un titular propio */
  label?: string;
  labelledBy?: string;
}

/** Sección con tema claro/oscuro. El header sticky lee data-theme para cambiar su contraste. */
export function Section({ name, theme, id, className = "", tight, style, children, label, labelledBy }: SectionProps) {
  return (
    <section
      id={id ?? name}
      data-section={name}
      data-theme={theme}
      aria-label={label}
      aria-labelledby={labelledBy}
      className={`section ${tight ? "section-tight" : ""} ${className}`}
      style={style}
    >
      {children}
    </section>
  );
}

interface SectionHeadProps {
  eyebrow?: string;
  title: string;
  lead?: ReactNode;
  as?: "h1" | "h2";
  size?: "h1" | "h2" | "display";
  align?: "left" | "center";
  id?: string;
  className?: string;
  titleClassName?: string;
}

/** Cabecera de sección: eyebrow + titular por palabras + entradilla. */
export function SectionHead({ eyebrow, title, lead, as = "h2", size = "h2", align = "left", id, className = "", titleClassName = "" }: SectionHeadProps) {
  const sizeClass = size === "display" ? "t-display" : size === "h1" ? "t-h1" : "t-h2";
  return (
    <header className={`${align === "center" ? "mx-auto text-center" : ""} ${className}`}>
      {eyebrow ? (
        <Reveal>
          <p className="t-eyebrow">{eyebrow}</p>
        </Reveal>
      ) : null}
      <SplitHeading as={as} id={id} text={title} className={`${sizeClass} ${eyebrow ? "mt-6" : ""} ${titleClassName}`} />
      {lead ? (
        <Reveal delay={150} className={`t-lead mt-7 ${align === "center" ? "mx-auto" : ""} max-w-[40rem]`}>
          {lead}
        </Reveal>
      ) : null}
    </header>
  );
}
