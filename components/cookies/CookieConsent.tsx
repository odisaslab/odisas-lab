"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
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
    description:
      "Imprescindibles para que la web funcione: navegación, seguridad y el propio recuerdo de esta decisión. No se pueden desactivar.",
    locked: true,
  },
  {
    key: "analytics" as const,
    title: "Analítica",
    description:
      "Nos dicen qué páginas se visitan y cómo, para mejorar la web. Los datos se tratan de forma agregada.",
    locked: false,
  },
  {
    key: "marketing" as const,
    title: "Marketing",
    description:
      "Permiten medir la eficacia de nuestros anuncios y mostrar publicidad relevante en otras plataformas.",
    locked: false,
  },
];

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [choice, setChoice] = useState({ analytics: false, marketing: false });

  // Primera visita o consentimiento caducado
  useEffect(() => {
    const stored = readConsent();
    if (!stored) {
      setVisible(true);
      return;
    }
    setChoice({ analytics: stored.analytics, marketing: stored.marketing });
  }, []);

  // Reapertura desde el footer
  useEffect(() => {
    const onOpen = () => {
      const stored = readConsent();
      if (stored) {
        setChoice({ analytics: stored.analytics, marketing: stored.marketing });
      }
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

  // Escape cierra el panel, no el banner: la decisión sigue pendiente
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
    <AnimatePresence>
      <motion.div
        key="cookie-banner"
        role="dialog"
        aria-modal="false"
        aria-labelledby="cookie-title"
        aria-describedby="cookie-description"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 bottom-0 z-[70] p-3 sm:p-5"
      >
        <div className="mx-auto max-w-4xl overflow-hidden rounded-[var(--radius-card)] border border-line bg-white shadow-[0_24px_60px_-24px_rgba(23,23,23,0.35)]">
          <div className="p-5 sm:p-7">
            <div className="flex items-start gap-4">
              <span className="hidden size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft sm:inline-flex">
                <Cookie aria-hidden="true" className="size-5 text-primary" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 id="cookie-title" className="text-[1.05rem] font-semibold text-dark">
                  Cookies
                </h2>
                <p id="cookie-description" className="mt-2 text-[0.9rem] text-gray">
                  Usamos cookies necesarias para que la web funcione. Con tu permiso,
                  también de analítica y marketing para entender qué se visita y medir
                  nuestros anuncios. Puedes rechazarlas y navegar con normalidad.{" "}
                  <Link href="/politica-de-cookies" className="underline">
                    Política de cookies
                  </Link>
                  .
                </p>
              </div>
            </div>

            {/* Panel de configuración por categorías */}
            <AnimatePresence initial={false}>
              {showPanel ? (
                <motion.div
                  key="cookie-panel"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden"
                >
                  <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
                    <h3 className="text-[0.9rem] font-medium text-dark">
                      Configurar por categoría
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowPanel(false)}
                      aria-label="Cerrar configuración"
                      className="inline-flex size-8 items-center justify-center rounded-full text-gray transition-colors hover:text-dark"
                    >
                      <X aria-hidden="true" className="size-4" />
                    </button>
                  </div>

                  <ul className="mt-4 flex flex-col gap-3">
                    {categories.map((category) => {
                      const checked =
                        category.key === "necessary" ? true : choice[category.key];
                      return (
                        <li
                          key={category.key}
                          className="rounded-[10px] border border-line p-4"
                        >
                          <div className="flex items-start gap-3">
                            <input
                              id={`cookie-${category.key}`}
                              type="checkbox"
                              checked={checked}
                              disabled={category.locked}
                              onChange={(event) =>
                                category.key !== "necessary" &&
                                setChoice((previous) => ({
                                  ...previous,
                                  [category.key]: event.target.checked,
                                }))
                              }
                              className="mt-1 size-4 shrink-0 accent-[var(--color-primary)] disabled:opacity-50"
                            />
                            <div>
                              <label
                                htmlFor={`cookie-${category.key}`}
                                className="text-[0.95rem] font-medium text-dark"
                              >
                                {category.title}
                                {category.locked ? (
                                  <span className="ml-2 text-[0.75rem] font-normal text-gray">
                                    siempre activas
                                  </span>
                                ) : null}
                              </label>
                              <p className="mt-1 text-[0.85rem] text-gray">
                                {category.description}
                              </p>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <Button onClick={() => decide(acceptAll())} className="sm:order-3">
                Aceptar todas
              </Button>
              <Button
                variant="outline"
                onClick={() => decide(rejectAll())}
                className="sm:order-2"
              >
                Rechazar todas
              </Button>
              {showPanel ? (
                <Button
                  variant="ghost"
                  onClick={() => decide(customConsent(choice))}
                  className="sm:order-1 sm:mr-auto"
                >
                  Guardar selección
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => setShowPanel(true)}
                  className="sm:order-1 sm:mr-auto"
                >
                  Configurar
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
