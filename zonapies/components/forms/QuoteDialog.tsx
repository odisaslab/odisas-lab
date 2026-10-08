"use client";

import { useEffect, useRef } from "react";
import { lockScroll } from "@/lib/lenis";
import type { QuotePayload } from "@/lib/quote";
import { Close } from "@/components/ui/Icons";
import { QuoteForm } from "./QuoteForm";

interface QuoteDialogProps {
  source: string;
  prefill?: Partial<QuotePayload>;
  onClose: () => void;
}

/** Diálogo nativo <dialog>: foco atrapado, Escape y retorno del foco los gestiona el navegador. */
export default function QuoteDialog({ source, prefill, onClose }: QuoteDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    lockScroll(true);

    const onCloseEvent = () => {
      lockScroll(false);
      onClose();
    };
    dialog.addEventListener("close", onCloseEvent);
    return () => {
      dialog.removeEventListener("close", onCloseEvent);
      if (dialog.open) dialog.close();
      lockScroll(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <dialog
      ref={ref}
      className="sheet"
      data-theme="light"
      aria-labelledby="quote-dialog-title"
      onClick={(event) => {
        if (event.target === ref.current) ref.current?.close();
      }}
    >
      <div className="max-h-[calc(100dvh-1.5rem)] overflow-y-auto p-6 sm:p-9">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="t-eyebrow">Presupuesto gratuito</p>
            <h2 id="quote-dialog-title" className="t-h3 mt-3">
              Cuéntanos qué necesitas.
            </h2>
          </div>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            aria-label="Cerrar formulario"
            className="grid size-11 shrink-0 place-items-center rounded-full border border-line-strong transition-colors hover:border-fg"
          >
            <Close className="size-5" />
          </button>
        </div>
        <div className="mt-7">
          <QuoteForm source={source} prefill={prefill} compact />
        </div>
      </div>
    </dialog>
  );
}
