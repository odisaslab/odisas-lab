import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "dark" | "outline" | "ghost" | "outlineLight";
type Size = "md" | "lg";

const base =
  "group inline-flex items-center justify-center gap-2 rounded-[var(--radius-pill)] font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-dark hover:bg-primary-dark",
  dark: "bg-dark text-white hover:bg-dark-soft",
  outline: "border border-dark/15 text-dark hover:border-dark hover:bg-dark hover:text-white",
  outlineLight:
    "border border-white/25 text-white hover:border-white hover:bg-white hover:text-dark",
  // Para usar encima del naranja: el texto blanco sobre naranja no cumple AA
  outlineOnPrimary:
    "border border-dark/70 text-dark hover:border-dark hover:bg-dark hover:text-white",
  ghost: "text-dark hover:text-primary-ink",
};

const sizes: Record<Size, string> = {
  md: "px-5 py-2.5 text-[0.95rem]",
  lg: "px-7 py-3.5 text-base",
};

interface CommonProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  /** Muestra una flecha que se desplaza al hacer hover */
  withArrow?: boolean;
  className?: string;
}

type ButtonAsLink = CommonProps & { href: string; external?: boolean };
type ButtonAsButton = CommonProps &
  Omit<ComponentProps<"button">, "className" | "children"> & { href?: never };

function Inner({ children, withArrow }: { children: ReactNode; withArrow?: boolean }) {
  return (
    <>
      {children}
      {withArrow ? (
        <ArrowRight
          aria-hidden="true"
          className="size-4 transition-transform duration-200 group-hover:translate-x-1"
        />
      ) : null}
    </>
  );
}

export function Button(props: ButtonAsLink | ButtonAsButton) {
  const {
    children,
    variant = "primary",
    size = "md",
    withArrow = false,
    className = "",
  } = props;

  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if ("href" in props && props.href) {
    const { href, external } = props;
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
          <Inner withArrow={withArrow}>{children}</Inner>
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        <Inner withArrow={withArrow}>{children}</Inner>
      </Link>
    );
  }

  const { variant: _v, size: _s, withArrow: _a, className: _c, children: _ch, ...rest } =
    props as ButtonAsButton;

  return (
    <button className={classes} {...rest}>
      <Inner withArrow={withArrow}>{children}</Inner>
    </button>
  );
}
