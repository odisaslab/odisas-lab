import type { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  id?: string;
  tone?: "white" | "light" | "dark";
  className?: string;
  ariaLabel?: string;
}

const tones = {
  white: "bg-white",
  light: "bg-light",
  dark: "bg-dark text-white",
} as const;

export function Section({
  children,
  id,
  tone = "white",
  className = "",
  ariaLabel,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={`py-20 md:py-28 ${tones[tone]} ${className}`}
    >
      {children}
    </section>
  );
}
