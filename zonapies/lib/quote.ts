import { needOptions, professionalTypes } from "@/data/quote";
import { WHATSAPP_MESSAGE } from "@/data/site";

export interface QuotePayload {
  name: string;
  company: string;
  email: string;
  phone: string;
  province: string;
  professionalType: string;
  need: string;
  message: string;
  privacy: boolean;
  /** CTA o sección desde la que se abrió el formulario (conversión por CTA) */
  source: string;
  /** Campo trampa para bots: debe llegar siempre vacío */
  honeypot?: string;
}

export type QuoteErrors = Partial<Record<keyof QuotePayload, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const phonePattern = /^[+()\d\s.-]{6,20}$/;

export const emptyQuote = (): QuotePayload => ({
  name: "",
  company: "",
  email: "",
  phone: "",
  province: "",
  professionalType: "",
  need: "",
  message: "",
  privacy: false,
  source: "",
  honeypot: "",
});

/** Recorta longitudes para no aceptar payloads enormes. */
export function sanitizeQuote(input: Partial<QuotePayload>): QuotePayload {
  const text = (value: unknown, max: number) =>
    typeof value === "string" ? value.trim().slice(0, max) : "";

  return {
    name: text(input.name, 120),
    company: text(input.company, 140),
    email: text(input.email, 160).toLowerCase(),
    phone: text(input.phone, 30),
    province: text(input.province, 60),
    professionalType: text(input.professionalType, 60),
    need: text(input.need, 60),
    message: text(input.message, 3000),
    privacy: input.privacy === true,
    source: text(input.source, 80),
    honeypot: text(input.honeypot, 200),
  };
}

export function validateQuote(data: QuotePayload): QuoteErrors {
  const errors: QuoteErrors = {};

  if (data.name.length < 2) errors.name = "Escribe tu nombre.";
  if (!emailPattern.test(data.email)) errors.email = "Revisa el email: parece que falta algo.";
  if (data.phone && !phonePattern.test(data.phone)) {
    errors.phone = "Revisa el teléfono: solo números, espacios y el prefijo.";
  }
  if (!needOptions.some((n) => n.value === data.need)) {
    errors.need = "Elige qué necesitas para que sepamos por dónde empezar.";
  }
  if (data.professionalType && !professionalTypes.some((p) => p.value === data.professionalType)) {
    errors.professionalType = "Elige una opción de la lista.";
  }
  if (!data.privacy) errors.privacy = "Necesitamos tu consentimiento para poder responderte.";

  return errors;
}

export const hasErrors = (errors: QuoteErrors) => Object.keys(errors).length > 0;

export const labelFor = (list: { value: string; label: string }[], value: string) =>
  list.find((item) => item.value === value)?.label ?? value;

/** Texto prefabricado para continuar por WhatsApp si el envío falla. */
export function quoteWhatsappText(data: Pick<QuotePayload, "name" | "company" | "need" | "message">) {
  return [
    WHATSAPP_MESSAGE,
    data.name ? `Soy ${data.name}${data.company ? ` (${data.company})` : ""}.` : "",
    data.need ? `Necesito: ${labelFor(needOptions, data.need)}.` : "",
    data.message ? `Mi consulta: ${data.message}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
