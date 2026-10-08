"use client";

import { usePathname } from "next/navigation";
import { QuoteButton } from "@/components/forms/QuoteProvider";
import { WhatsApp } from "@/components/ui/Icons";
import { whatsappUrl } from "@/data/site";

/**
 * Contacto permanente.
 * - Escritorio: botón flotante «¿Hablamos?» (WhatsApp con mensaje predefinido).
 * - Móvil: barra inferior con el CTA principal y WhatsApp, siempre al alcance del pulgar.
 */
export function FloatingContact() {
  const pathname = usePathname();
  const onContact = pathname === "/contacto";

  return (
    <aside aria-label="Contacto rápido">
      <a
        href={whatsappUrl()}
        target="_blank"
        rel="noopener noreferrer"
        data-cta="whatsapp-fab"
        aria-label="¿Hablamos? Escríbenos por WhatsApp"
        className="wa-fab fixed bottom-6 right-6 z-40 hidden items-center gap-3 rounded-full bg-[#25d366] py-3 pl-4 pr-5 text-sm font-semibold text-[#04200f] shadow-[0_12px_40px_-8px_rgba(37,211,102,0.55)] transition-transform duration-300 hover:-translate-y-0.5 md:inline-flex"
      >
        <WhatsApp className="size-6" />
        <span>¿Hablamos?</span>
      </a>

      <div
        data-theme="dark"
        className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-2 border-t border-line bg-[color-mix(in_srgb,var(--color-ink-950)_88%,transparent)] px-3 pt-2.5 backdrop-blur-xl md:hidden"
        style={{ paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" }}
      >
        <a
          href={whatsappUrl()}
          target="_blank"
          rel="noopener noreferrer"
          data-cta="mobile-bar-whatsapp"
          aria-label="¿Hablamos? WhatsApp"
          className="grid size-12 shrink-0 place-items-center rounded-full bg-[#25d366] text-[#04200f]"
        >
          <WhatsApp className="size-6" />
        </a>
        {onContact ? (
          <span className="flex-1 text-center text-sm text-muted">¿Prefieres escribirnos? Estamos en WhatsApp.</span>
        ) : (
          <QuoteButton cta="mobile-bar" size="md" className="flex-1 justify-between" />
        )}
      </div>
    </aside>
  );
}
