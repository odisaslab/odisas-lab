import Link from "next/link";
import type { MouseEventHandler, ReactNode } from "react";
import { Magnetic } from "@/components/motion/Magnetic";
import { ArrowRight } from "./Icons";

export type ButtonVariant = "primary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", extra = "") {
  return ["btn", variant === "primary" ? "btn-primary" : "", size === "lg" ? "btn-lg" : size === "sm" ? "btn-sm" : "", extra]
    .filter(Boolean)
    .join(" ");
}

interface ButtonProps {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Identificador para medir la conversión por CTA (data-cta) */
  cta?: string;
  arrow?: boolean;
  magnetic?: boolean;
  className?: string;
  ariaLabel?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

/** Enlace con aspecto de botón. Interno → next/link; tel:, mailto:, wa.me, https → <a>. */
export function Button({
  href,
  children,
  variant = "primary",
  size = "md",
  cta,
  arrow = true,
  magnetic = false,
  className = "",
  ariaLabel,
  onClick,
}: ButtonProps) {
  const external = /^(https?:|tel:|mailto:)/.test(href);
  const cls = buttonClass(variant, size, className);
  const content = (
    <>
      <span className="inline-flex items-center gap-2.5">{children}</span>
      {arrow ? <ArrowRight className="arrow" /> : null}
    </>
  );

  const node = external ? (
    <a
      href={href}
      className={cls}
      data-cta={cta}
      aria-label={ariaLabel}
      onClick={onClick}
      {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {content}
    </a>
  ) : (
    <Link href={href} className={cls} data-cta={cta} aria-label={ariaLabel} onClick={onClick}>
      {content}
    </Link>
  );

  return magnetic ? <Magnetic>{node}</Magnetic> : node;
}
