/**
 * Medición de KPI (documento funcional §27).
 *
 * Los eventos solo se envían si el usuario ha dado consentimiento de analítica.
 * Con GTM se empuja al dataLayer; con GA4 directo se usa gtag('event').
 * Cualquier elemento con data-cta="id" se mide automáticamente (ver Tracking.tsx).
 */
import { cleanEnv } from "@/lib/clean-env";
import { readConsent } from "@/lib/consent";

const GTM_ID = cleanEnv(process.env.NEXT_PUBLIC_GTM_ID);

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export type TrackEvent =
  | "cta_click"
  | "quote_request" // clic en cualquier vía hacia el presupuesto
  | "quote_form_start"
  | "quote_form_submit"
  | "quote_form_error"
  | "whatsapp_click"
  | "phone_click"
  | "email_click"
  | "pro_access_click"
  | "material_view"
  | "scene_interact"
  | "scene_phase"
  | "scene_degraded"
  | "configurator_step"
  | "configurator_complete"
  | "selector_choice"
  | "scroll_depth"
  | "training_signup_click"
  | "franchise_click";

export function track(event: TrackEvent, params: Record<string, string | number | boolean> = {}) {
  if (typeof window === "undefined") return;

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.debug("[track]", event, params);
  }

  if (!readConsent()?.analytics) return;

  if (GTM_ID) {
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push({ event, ...params });
  } else if (typeof window.gtag === "function") {
    window.gtag("event", event, params);
  }
}
