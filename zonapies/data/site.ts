import { cleanEnv } from "@/lib/clean-env";

/**
 * Datos de contacto y de empresa.
 *
 * ORIGEN Y FIABILIDAD: zonapies.es no era accesible desde el entorno de desarrollo (el
 * proxy de red lo bloqueaba). Los valores por defecto de abajo proceden de fragmentos de
 * búsqueda web de páginas de la propia empresa (aviso legal, home) y de directorios
 * mercantiles. NO están verificados directamente: hay que confirmarlos antes de publicar.
 * Cualquier variable NEXT_PUBLIC_* de .env.local los sustituye (ver .env.example).
 */

const phoneEnv = cleanEnv(process.env.NEXT_PUBLIC_PHONE);
const phoneDisplayEnv = cleanEnv(process.env.NEXT_PUBLIC_PHONE_DISPLAY);
const emailEnv = cleanEnv(process.env.NEXT_PUBLIC_CONTACT_EMAIL);
const whatsappEnv = cleanEnv(process.env.NEXT_PUBLIC_WHATSAPP);
const portalEnv = cleanEnv(process.env.NEXT_PUBLIC_PORTAL_URL);
const siteUrlEnv = cleanEnv(process.env.NEXT_PUBLIC_SITE_URL);
const instagramEnv = cleanEnv(process.env.NEXT_PUBLIC_INSTAGRAM_URL);

export const site = {
  name: "Zona Pies",
  url: (siteUrlEnv || "https://zonapies.es").replace(/\/$/, ""),
  locale: "es_ES",
  tagline: "Ingeniería digital aplicada al movimiento",
  description:
    "Laboratorio podológico de nueva generación en Fuenlabrada (Madrid): escaneo 3D, software de prescripción y fabricación avanzada de ortesis plantares y plantillas a medida para podólogos y clínicas de toda España.",
} as const;

/** Datos mercantiles (aviso legal de la web actual, según búsqueda). Por confirmar. */
export const company = {
  legalName: "ZONAPIES SL",
  taxId: "B88280821",
  address: {
    street: "Calle Zarzuela, 10",
    postalCode: "28942",
    city: "Fuenlabrada",
    region: "Madrid",
  },
} as const;

export const contact = {
  phone: {
    tel: phoneEnv || "+34916062373",
    display: phoneDisplayEnv || (phoneEnv ? phoneEnv : "91 606 23 73"),
    /** true = valor por defecto sin confirmar con el cliente */
    unconfirmed: !phoneEnv,
  },
  email: {
    address: emailEnv || "zonapiesfuenlabrada@gmail.com",
    unconfirmed: !emailEnv,
  },
  whatsapp: {
    /** El móvil 640 203 750 figura en un directorio; falta confirmar que sea el WhatsApp de empresa */
    number: (whatsappEnv || "34640203750").replace(/\D/g, ""),
    unconfirmed: !whatsappEnv,
  },
  /** Acceso de clientes existente. Se enlaza; no se reimplementa. Pendiente de confirmar la URL. */
  portal: {
    url: portalEnv || "",
    placeholder: !portalEnv,
  },
  instagram: instagramEnv || "https://www.instagram.com/zonapies_/",
} as const;

export const WHATSAPP_MESSAGE =
  "Hola, estoy interesado/a en las soluciones de Zona Pies y me gustaría recibir información.";

export function whatsappUrl(text: string = WHATSAPP_MESSAGE): string {
  return `https://wa.me/${contact.whatsapp.number}?text=${encodeURIComponent(text)}`;
}

export const telUrl = () => `tel:${contact.phone.tel.replace(/[^\d+]/g, "")}`;
export const mailUrl = (subject?: string) =>
  `mailto:${contact.email.address}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;

/** Plazo de fabricación que comunica la web actual («Nuestro tiempo de fabricación es de 3 días hábiles»). */
export const LEAD_TIME = "3 días hábiles";

/** Experiencia que declara la propia web de Zona Pies. Otras fuentes citan 40 y 50 años: confirmar. */
export const EXPERIENCE = "más de 30 años";
