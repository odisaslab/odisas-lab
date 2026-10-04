"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/data/site";

const message = "Hola Odisas Lab, he visto vuestra web y me gustaría hablar sobre mi negocio.";

/**
 * Acceso permanente a WhatsApp. En móvil es un botón circular siempre visible;
 * en escritorio aparece como píldora con texto tras empezar a hacer scroll.
 */
export function WhatsAppFloat() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!whatsappLink) return null;

  return (
    <a
      href={`${whatsappLink}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir a Odisas Lab por WhatsApp"
      data-cta="whatsapp-flotante"
      className={`fixed right-4 bottom-4 z-40 flex h-14 items-center gap-3 rounded-full bg-[#25d366] px-[0.95rem] font-[family-name:var(--font-display)] font-semibold text-ink shadow-[0_12px_34px_-10px_rgba(37,211,102,0.7)] transition-all duration-500 hover:bg-[#3ee27a] md:right-6 md:bottom-6 md:px-5 ${
        shown ? "translate-y-0 opacity-100" : "md:pointer-events-none md:translate-y-6 md:opacity-0"
      }`}
    >
      <MessageCircle aria-hidden="true" className="size-6 shrink-0" strokeWidth={2} />
      <span className="hidden md:inline">¿Hablamos por WhatsApp?</span>
    </a>
  );
}
