/**
 * Gestión del consentimiento de cookies.
 *
 * Reglas que se respetan aquí:
 * - Nada se carga antes de que el usuario decida, salvo lo estrictamente necesario.
 * - Rechazar es tan fácil como aceptar (un solo clic, misma jerarquía visual).
 * - La decisión se puede cambiar en cualquier momento desde el footer.
 * - Se guarda la versión del texto, para volver a pedir consentimiento si cambia.
 */

export const CONSENT_STORAGE_KEY = "odisas-consent";
export const CONSENT_VERSION = 1;
export const CONSENT_EVENT = "odisas-consent-change";

/** Vigencia del consentimiento: 12 meses, según criterio de la AEPD. */
export const CONSENT_MAX_AGE_DAYS = 365;

export interface Consent {
  /** Siempre true: sin ellas la web no funciona */
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  version: number;
  /** Marca de tiempo ISO de la decisión */
  decidedAt: string;
}

export const acceptAll = (): Consent => ({
  necessary: true,
  analytics: true,
  marketing: true,
  version: CONSENT_VERSION,
  decidedAt: new Date().toISOString(),
});

export const rejectAll = (): Consent => ({
  necessary: true,
  analytics: false,
  marketing: false,
  version: CONSENT_VERSION,
  decidedAt: new Date().toISOString(),
});

export const customConsent = (choice: {
  analytics: boolean;
  marketing: boolean;
}): Consent => ({
  necessary: true,
  analytics: choice.analytics,
  marketing: choice.marketing,
  version: CONSENT_VERSION,
  decidedAt: new Date().toISOString(),
});

/** Devuelve el consentimiento guardado, o null si no hay uno válido y vigente. */
export function readConsent(): Consent | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<Consent>;

    // Texto actualizado: hay que volver a preguntar
    if (parsed.version !== CONSENT_VERSION) return null;

    // Consentimiento caducado
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
    // Modo privado o almacenamiento bloqueado: se respeta y no se insiste
  }
  window.dispatchEvent(new CustomEvent<Consent>(CONSENT_EVENT, { detail: consent }));
}

/** Abre el panel de configuración desde cualquier parte de la web. */
export const OPEN_PREFERENCES_EVENT = "odisas-consent-open";

export function openCookiePreferences() {
  window.dispatchEvent(new Event(OPEN_PREFERENCES_EVENT));
}
