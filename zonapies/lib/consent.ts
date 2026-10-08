/**
 * Gestión del consentimiento de cookies.
 *
 * - Nada se carga antes de que el usuario decida, salvo lo estrictamente necesario.
 * - Rechazar es tan fácil como aceptar (un clic, misma jerarquía visual).
 * - La decisión se puede cambiar en cualquier momento desde el footer.
 * - Se guarda la versión del texto para volver a preguntar si cambia.
 */

export const CONSENT_STORAGE_KEY = "zonapies-consent";
export const CONSENT_VERSION = 1;
export const CONSENT_EVENT = "zonapies-consent-change";
export const OPEN_PREFERENCES_EVENT = "zonapies-consent-open";

/** Vigencia del consentimiento: 12 meses, según criterio de la AEPD. */
export const CONSENT_MAX_AGE_DAYS = 365;

export interface Consent {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  version: number;
  decidedAt: string;
}

const make = (analytics: boolean, marketing: boolean): Consent => ({
  necessary: true,
  analytics,
  marketing,
  version: CONSENT_VERSION,
  decidedAt: new Date().toISOString(),
});

export const acceptAll = () => make(true, true);
export const rejectAll = () => make(false, false);
export const customConsent = (choice: { analytics: boolean; marketing: boolean }) =>
  make(choice.analytics, choice.marketing);

/** Devuelve el consentimiento guardado, o null si no hay uno válido y vigente. */
export function readConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Consent>;
    if (parsed.version !== CONSENT_VERSION) return null;
    if (parsed.decidedAt) {
      const age = Date.now() - new Date(parsed.decidedAt).getTime();
      if (age > CONSENT_MAX_AGE_DAYS * 24 * 60 * 60 * 1000) return null;
    }
    return {
      necessary: true,
      analytics: parsed.analytics === true,
      marketing: parsed.marketing === true,
      version: CONSENT_VERSION,
      decidedAt: parsed.decidedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function saveConsent(consent: Consent) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
  } catch {
    // Almacenamiento bloqueado: se respeta y no se insiste
  }
  window.dispatchEvent(new CustomEvent<Consent>(CONSENT_EVENT, { detail: consent }));
}

export function openCookiePreferences() {
  window.dispatchEvent(new Event(OPEN_PREFERENCES_EVENT));
}
