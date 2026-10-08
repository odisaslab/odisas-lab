"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";
import { onScroll } from "@/lib/scroll-bus";

const DEPTHS = [25, 50, 75, 100] as const;

/**
 * Medición automática de KPI (documento funcional §27), sin tocar cada componente:
 * - cualquier elemento con data-cta="id" → cta_click (con id y sección → conversión por CTA);
 * - enlaces wa.me / tel: / mailto: / acceso profesional;
 * - profundidad de scroll 25 / 50 / 75 / 100 % por página.
 * `track` solo emite si hay consentimiento de analítica.
 */
export function Tracking() {
  const pathname = usePathname();
  const fired = useRef<Set<number>>(new Set());

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target) return;

      const cta = target.closest<HTMLElement>("[data-cta]");
      if (cta) {
        track("cta_click", {
          cta_id: cta.dataset.cta ?? "",
          section: cta.closest<HTMLElement>("[data-section]")?.dataset.section ?? "",
          label: (cta.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 60),
          page: window.location.pathname,
        });
      }

      const link = target.closest<HTMLAnchorElement>("a[href]");
      if (!link) return;
      const href = link.getAttribute("href") ?? "";
      const where = link.dataset.cta ?? "";
      if (href.startsWith("https://wa.me")) track("whatsapp_click", { cta_id: where, page: window.location.pathname });
      else if (href.startsWith("tel:")) track("phone_click", { cta_id: where, page: window.location.pathname });
      else if (href.startsWith("mailto:")) track("email_click", { cta_id: where, page: window.location.pathname });
      else if (link.hasAttribute("data-pro") || href.startsWith("/acceso-profesional")) track("pro_access_click", { cta_id: where, page: window.location.pathname });
    };

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  useEffect(() => {
    fired.current = new Set();
    return onScroll((y, vh) => {
      const total = document.documentElement.scrollHeight;
      if (total <= vh) return;
      const percent = ((y + vh) / total) * 100;
      for (const depth of DEPTHS) {
        if (percent >= depth - 1 && !fired.current.has(depth)) {
          fired.current.add(depth);
          track("scroll_depth", { depth, page: window.location.pathname });
        }
      }
    });
  }, [pathname]);

  return null;
}
