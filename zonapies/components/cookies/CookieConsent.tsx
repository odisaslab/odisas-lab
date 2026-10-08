"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Close } from "@/components/ui/Icons";
import {
  acceptAll,
  customConsent,
  OPEN_PREFERENCES_EVENT,
  readConsent,
  rejectAll,
  saveConsent,
  type Consent,
} from "@/lib/consent";

const categories = [
  {
    key: "necessary" as const,
    title: "Necesarias",
    description: "Imprescindibles para que la web funcione: navegación, seguridad y el recuerdo de esta decisión. No se pueden desactivar.",
    locked: true,
  },
  {
    key: "analytics" as const,
    title: "Analítica",
    description: "Nos dicen qué páginas se visitan y cómo se usan, para mejorar la web. Los datos se tratan de forma agregada.",
    locked: false,
  },
  {
    key: "marketing" as const,
    title: "Marketing",
    description: "Permiten medir la eficacia de nuestras campañas y mostrar publicidad relevante en otras plataformas.",
    locked: false,
  },
];

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [choice, setChoice] = useState({ analytics: false, marketing: false });

  useEffect(() => {
    const stored = readConsent();
    if (!stored) {
      setVisible(true);
      return;
    }
    setChoice({ analytics: stored.analytics, marketing: stored.marketing });
  }, []);

  useEffect(() => {
    const onOpen = () => {
      const stored = readConsent();
      if (stored) setChoice({ analytics: stored.analytics, marketing: stored.marketing });
      setVisible(true);
      setShowPanel(true);
    };
    window.addEventListener(OPEN_PREFERENCES_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_PREFERENCES_EVENT, onOpen);
  }, []);

  const decide = useCallback((consent: Consent) => {
    saveConsent(consent);
    setChoice({ analytics: consent.analytics, marketing: consent.marketing });
    setShowPanel(false);
    setVisible(false);
  }, []);

  useEffect(() => {
    if (!showPanel) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowPanel(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showPanel]);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-title"
      aria-describedby="cookie-description"
      data-theme="dark"
      className="menu-in fixed inset-x-0 bottom-[4.75rem] z-[70] p-3 md:bottom-0 md:right-auto md:p-5"
    >
      <div className="max-h-[80svh] w-full max-w-[28rem] overflow-y-auto rounded-2xl border border-line-strong bg-ink-900 p-5 text-fg shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)]">
        <h2 id="cookie-title" className="text-[1.05rem] font-semibold tracking-tight">
          Cookies
        </h2>
        <p id="cookie-description" className="mt-1.5 text-[0.875rem] leading-relaxed text-muted">
          Usamos cookies necesarias para que la web funcione. Con tu permiso, también de analítica y marketing. Puedes rechazarlas y navegar con normalidad.{" "}
          <Link href="/politica-de-cookies" className="text-fg underline underline-offset-4">
            Política de cookies
          </Link>
          .
        </p>

        {showPanel ? (
          <div>
            <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
              <h3 className="text-[0.9rem] font-medium">Configurar por categoría</h3>
              <button type="button" onClick={() => setShowPanel(false)} aria-label="Cerrar configuración" className="grid size-9 place-items-center rounded-full text-muted hover:text-fg">
                <Close className="size-4" />
              </button>
            </div>
            <ul className="mt-3 flex flex-col gap-2.5">
              {categories.map((category) => {
                const checked = category.key === "necessary" ? true : choice[category.key];
                return (
                  <li key={category.key} className="rounded-xl border border-line p-3.5">
                    <div className="flex items-start gap-3">
                      <input
                        id={`cookie-${category.key}`}
                        type="checkbox"
                        checked={checked}
                        disabled={category.locked}
                        onChange={(event) => category.key !== "necessary" && setChoice((prev) => ({ ...prev, [category.key]: event.target.checked }))}
                        className="mt-1 size-5 shrink-0 accent-[var(--color-signal)] disabled:opacity-50"
                      />
                      <div>
                        <label htmlFor={`cookie-${category.key}`} className="text-[0.92rem] font-medium">
                          {category.title}
                          {category.locked ? <span className="ml-2 text-[0.75rem] font-normal text-muted">siempre activas</span> : null}
                        </label>
                        <p className="mt-1 text-[0.82rem] text-muted">{category.description}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => decide(acceptAll())} className="btn btn-primary btn-sm flex-1">
            Aceptar todas
          </button>
          <button type="button" onClick={() => decide(rejectAll())} className="btn btn-sm flex-1">
            Rechazar todas
          </button>
          {showPanel ? (
            <button type="button" onClick={() => decide(customConsent(choice))} className="min-h-11 w-full px-2 text-[0.9rem] text-fg underline underline-offset-4">
              Guardar selección
            </button>
          ) : (
            <button type="button" onClick={() => setShowPanel(true)} className="min-h-11 w-full px-2 text-[0.9rem] text-muted underline underline-offset-4 hover:text-fg">
              Configurar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
