"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useMemo, useState, type MouseEvent, type ReactNode } from "react";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/Button";
import { track } from "@/lib/analytics";
import { scrollToTarget } from "@/lib/lenis";
import { QUOTE_HREF } from "@/data/nav";
import type { QuotePayload } from "@/lib/quote";

const QuoteDialog = dynamic(() => import("./QuoteDialog"), { ssr: false });

interface OpenOptions {
  /** Identificador del CTA de origen (conversión por CTA) */
  source: string;
  prefill?: Partial<QuotePayload>;
}

interface QuoteContextValue {
  open: (options: OpenOptions) => void;
}

const QuoteContext = createContext<QuoteContextValue>({ open: () => {} });

export const useQuote = () => useContext(QuoteContext);

/**
 * Presupuesto en un clic desde cualquier página: el CTA abre un diálogo con el formulario
 * sin sacar al visitante de lo que está leyendo. Mejora progresiva: sin JS, el enlace lleva
 * a /contacto#presupuesto.
 */
export function QuoteProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ open: boolean; mounted: boolean; options: OpenOptions }>({
    open: false,
    mounted: false,
    options: { source: "cta" },
  });

  const open = useCallback((options: OpenOptions) => {
    track("quote_request", { source: options.source });
    setState({ open: true, mounted: true, options });
  }, []);

  const close = useCallback(() => setState((prev) => ({ ...prev, open: false })), []);
  const value = useMemo(() => ({ open }), [open]);

  return (
    <QuoteContext.Provider value={value}>
      {children}
      {state.mounted && state.open ? <QuoteDialog source={state.options.source} prefill={state.options.prefill} onClose={close} /> : null}
    </QuoteContext.Provider>
  );
}

interface QuoteButtonProps {
  /** Identificador del CTA: se mide como data-cta y viaja con la solicitud */
  cta: string;
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  arrow?: boolean;
  magnetic?: boolean;
  className?: string;
  prefill?: Partial<QuotePayload>;
}

export function QuoteButton({
  cta,
  children = "Solicitar presupuesto",
  variant = "primary",
  size = "md",
  arrow = true,
  magnetic = false,
  className,
  prefill,
}: QuoteButtonProps) {
  const { open } = useQuote();
  const pathname = usePathname();

  const params = new URLSearchParams();
  if (prefill?.need) params.set("need", prefill.need);
  if (prefill?.message) params.set("msg", prefill.message);
  if (prefill?.professionalType) params.set("pro", prefill.professionalType);
  const query = params.toString();
  const href = query ? `/contacto?${query}#presupuesto` : QUOTE_HREF;

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    if (pathname === "/contacto") {
      track("quote_request", { source: cta });
      scrollToTarget("#presupuesto");
      return;
    }
    open({ source: cta, prefill });
  };

  return (
    <Button href={href} cta={cta} variant={variant} size={size} arrow={arrow} magnetic={magnetic} className={className} onClick={onClick}>
      {children}
    </Button>
  );
}
