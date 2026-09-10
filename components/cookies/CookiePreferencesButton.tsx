"use client";

import { SlidersHorizontal } from "lucide-react";
import { openCookiePreferences } from "@/lib/consent";

interface CookiePreferencesButtonProps {
  /** "link" para el footer, "button" para el cuerpo de las páginas */
  variant?: "link" | "button";
  label?: string;
}

export function CookiePreferencesButton({
  variant = "button",
  label = "Configurar cookies",
}: CookiePreferencesButtonProps) {
  if (variant === "link") {
    return (
      <button
        type="button"
        onClick={openCookiePreferences}
        className="text-left text-[0.95rem] text-white/75 transition-colors hover:text-primary"
      >
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={openCookiePreferences}
      className="group inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-dark/15 px-5 py-2.5 text-[0.95rem] font-medium text-dark no-underline transition-colors hover:border-dark hover:bg-dark hover:text-white"
    >
      <SlidersHorizontal aria-hidden="true" className="size-4" strokeWidth={1.75} />
      {label}
    </button>
  );
}
