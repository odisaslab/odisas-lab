"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { QuoteButton } from "@/components/forms/QuoteProvider";
import { Close, Lock, Phone, WhatsApp } from "@/components/ui/Icons";
import { Logo } from "@/components/ui/Logo";
import { mainNav, PROFESSIONAL_ACCESS } from "@/data/nav";
import { contact, telUrl, whatsappUrl } from "@/data/site";
import { lockScroll } from "@/lib/lenis";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  pathname: string;
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function MobileMenu({ open, onClose, pathname }: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      lockScroll(false);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      id="menu-movil"
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Menú principal"
      data-theme="dark"
      className="menu-in fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-surface text-fg"
    >
      <div className="wrap flex h-[4.5rem] shrink-0 items-center justify-between">
        <Logo />
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Cerrar menú" className="grid size-11 place-items-center rounded-full border border-line-strong">
          <Close className="size-5" />
        </button>
      </div>

      <nav aria-label="Principal" className="wrap flex-1 py-6">
        <ul className="flex flex-col">
          {mainNav.map((item, index) => (
            <li key={item.href} className="border-b border-line">
              <Link
                href={item.href}
                onClick={onClose}
                aria-current={pathname === item.href ? "page" : undefined}
                className="flex min-h-16 items-baseline gap-4 py-3 text-[clamp(1.75rem,7vw,2.75rem)] font-medium leading-none tracking-[-0.035em] aria-[current=page]:text-accent-text"
              >
                <span className="hud w-8 text-muted">{String(index + 1).padStart(2, "0")}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="wrap flex shrink-0 flex-col gap-3 pb-8 pt-4">
        <QuoteButton cta="menu-movil" size="lg" className="w-full justify-between" />
        <Link href={PROFESSIONAL_ACCESS.href} onClick={onClose} data-pro className="btn w-full justify-between">
          <span className="inline-flex items-center gap-2">
            <Lock className="size-4" /> {PROFESSIONAL_ACCESS.label}
          </span>
        </Link>
        <div className="grid grid-cols-2 gap-3">
          <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="btn btn-sm" data-cta="menu-whatsapp">
            <WhatsApp className="size-4" /> WhatsApp
          </a>
          <a href={telUrl()} className="btn btn-sm" data-cta="menu-phone" aria-label={`Llamar al ${contact.phone.display}`}>
            <Phone className="size-4" /> Llamar
          </a>
        </div>
      </div>
    </div>
  );
}
