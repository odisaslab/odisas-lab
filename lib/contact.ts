import { services } from "@/data/services";

export const needOptions = [
  ...services.map((service) => service.name),
  "Otro",
] as const;

export const budgetOptions = [
  "Todavía no lo sé",
  "Menos de 1.000 €",
  "1.000 € – 3.000 €",
  "3.000 € – 6.000 €",
  "Más de 6.000 €",
  "Presupuesto mensual recurrente",
] as const;

export interface ContactPayload {
  name: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  need: string;
  budget: string;
  message: string;
  privacy: boolean;
  /** Campo trampa para bots: debe llegar siempre vacío */
  honeypot?: string;
}

export type ContactErrors = Partial<Record<keyof ContactPayload, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const phonePattern = /^[+()\d\s.-]{6,20}$/;

/** Elimina espacios sobrantes y recorta longitudes para no aceptar payloads enormes. */
export function sanitizeContact(input: Partial<ContactPayload>): ContactPayload {
  const text = (value: unknown, max: number) =>
    typeof value === "string" ? value.trim().slice(0, max) : "";

  return {
    name: text(input.name, 120),
    company: text(input.company, 120),
    email: text(input.email, 160).toLowerCase(),
    phone: text(input.phone, 30),
    website: text(input.website, 200),
    need: text(input.need, 80),
    budget: text(input.budget, 80),
    message: text(input.message, 3000),
    privacy: input.privacy === true,
    honeypot: text(input.honeypot, 200),
  };
}

export function validateContact(data: ContactPayload): ContactErrors {
  const errors: ContactErrors = {};

  if (data.name.length < 2) {
    errors.name = "Escribe tu nombre.";
  }

  if (!emailPattern.test(data.email)) {
    errors.email = "Revisa el email: parece que falta algo.";
  }

  if (data.phone && !phonePattern.test(data.phone)) {
    errors.phone = "Revisa el teléfono. Solo números, espacios y el prefijo.";
  }

  if (!data.need) {
    errors.need = "Elige qué necesitas para que sepamos por dónde empezar.";
  }

  if (data.message.length < 10) {
    errors.message = "Cuéntanos algo más, aunque sean dos líneas.";
  }

  if (!data.privacy) {
    errors.privacy = "Necesitamos tu consentimiento para poder responderte.";
  }

  return errors;
}

export const hasErrors = (errors: ContactErrors) => Object.keys(errors).length > 0;
