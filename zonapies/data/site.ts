import { cleanEnv } from "@/lib/clean-env";

/**
 * Datos de contacto y de empresa.
 *
 * VERIFICADO el 08/10/2026 contra la home real de zonapies.es (JSON-LD, pie y enlaces):
 * teléfonos, email, dirección, WhatsApp, acceso de clientes, Instagram, Facebook y Maps.
 * SIN verificar: el CIF (viene de un fragmento del aviso legal en buscadores; confirmar).
 * Cualquier variable NEXT_PUBLIC_* de .env.local sustituye estos valores (ver .env.example).
 */

const phoneEnv = cleanEnv(process.env.NEXT_PUBLIC_PHONE);
const phoneDisplayEnv = cleanEnv(process.env.NEXT_PUBLIC_PHONE_DISPLAY);
const emailEnv = cleanEnv(process.env.NEXT_PUBLIC_CONTACT_EMAIL);
const whatsappEnv = cleanEnv(process.env.NEXT_PUBLIC_WHATSAPP);
const portalEnv = cleanEnv(process.env.NEXT_PUBLIC_PORTAL_URL);
const siteUrlEnv = cleanEnv(process.env.NEXT_PUBLIC_SITE_URL);
const instagramEnv = cleanEnv(process.env.NEXT_PUBLIC_INSTAGRAM_URL);
const facebookEnv = cleanEnv(process.env.NEXT_PUBLIC_FACEBOOK_URL);

export const site = {
  name: "Zona Pies",
  url: (siteUrlEnv || "https://zonapies.es").replace(/\/$/, ""),
  locale: "es_ES",
  tagline: "Ingeniería digital aplicada al movimiento",
  description:
    "Laboratorio podológico de nueva generación en Fuenlabrada (Madrid): sistema integral de escáner 3D, software de prescripción y fabricación avanzada de ortesis plantares y plantillas a medida para podólogos y clínicas de toda España.",
} as const;

/** Datos mercantiles. Razón social y dirección: web real. CIF: por confirmar (ver arriba). */
export const company = {
  legalName: "ZONAPIES SL",
  taxId: "B88280821",
  address: {
    street: "Calle Zarzuela, 10",
    area: "Pol. Ind. Cordel de la Carrera",
    postalCode: "28942",
    city: "Fuenlabrada",
    region: "Madrid",
  },
} as const;

export const contact = {
  phone: {
    tel: phoneEnv || "+34916062373",
    display: phoneDisplayEnv || (phoneEnv ? phoneEnv : "91 606 23 73"),
  },
  email: {
    address: emailEnv || "zonapiesfuenlabrada@gmail.com",
  },
  whatsapp: {
    /** Enlace de WhatsApp de la web actual: api.whatsapp.com/send?phone=34640203750 */
    number: (whatsappEnv || "34640203750").replace(/\D/g, ""),
    display: "640 20 37 50",
  },
  /** Acceso de clientes existente. Se enlaza; no se reimplementa. */
  portal: {
    url: portalEnv || "https://zonapies.azurewebsites.net/",
    placeholder: false,
  },
  instagram: instagramEnv || "https://www.instagram.com/zonapies_/",
  facebook: facebookEnv || "https://www.facebook.com/profile.php?id=61566621413475",
  mapsUrl: "https://maps.app.goo.gl/PDYKofRS6BWUXDmRA",
} as const;

export const WHATSAPP_MESSAGE =
  "Hola, estoy interesado/a en las soluciones de Zona Pies y me gustaría recibir información.";

export function whatsappUrl(text: string = WHATSAPP_MESSAGE): string {
  return `https://wa.me/${contact.whatsapp.number}?text=${encodeURIComponent(text)}`;
}

export const telUrl = () => `tel:${contact.phone.tel.replace(/[^\d+]/g, "")}`;
export const mailUrl = (subject?: string) =>
  `mailto:${contact.email.address}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;

/**
 * Plazo de fabricación. El documento funcional y la web (página de materiales) indican unos 3 días hábiles;
 * la home dice «unos pocos días hábiles». CONFIRMAR con Zona Pies cuál es el compromiso.
 */
export const LEAD_TIME = "3 días hábiles";

/** Experiencia: la web real dice «más de tres décadas» (JSON-LD: «más de 30 años»). */
export const EXPERIENCE = "más de 30 años";
