export const site = {
  name: "Odisas Lab",
  tagline: "Marketing que mueve negocios.",
  description:
    "Agencia de marketing digital. Estrategia, SEO, Google Ads, Meta Ads, diseño web e inteligencia artificial para conseguir más visibilidad y más clientes.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://odisaslab.com",
  locale: "es_ES",
  owner: "Alejandro",
  foundingYear: 2026,
} as const;

/**
 * Contacto directo.
 * Los valores por defecto son los reales, para que la web funcione aunque
 * falten las variables de entorno en el despliegue. Vacío = no se muestra.
 */
export const contact = {
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "Odisaslab@gmail.com",
  phone: process.env.NEXT_PUBLIC_PHONE ?? "+34616880063",
  /** Cómo se escribe el teléfono en pantalla */
  phoneDisplay: process.env.NEXT_PUBLIC_PHONE_DISPLAY ?? "616 88 00 63",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "+34616880063",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM ?? "",
  linkedin: process.env.NEXT_PUBLIC_LINKEDIN ?? "",
};

const digits = (value: string) => value.replace(/\D/g, "");

export const whatsappLink = contact.whatsapp
  ? `https://wa.me/${digits(contact.whatsapp)}`
  : "";

export const telLink = contact.phone ? `tel:+${digits(contact.phone)}` : "";

export const mainNav = [
  { label: "Servicios", href: "/servicios" },
  { label: "Sobre Odisas Lab", href: "/sobre-odisas-lab" },
  { label: "Proceso", href: "/proceso" },
  { label: "Contacto", href: "/contacto" },
] as const;

export const footerNav = {
  empresa: [
    { label: "Sobre Odisas Lab", href: "/sobre-odisas-lab" },
    { label: "Proceso", href: "/proceso" },
    { label: "Contacto", href: "/contacto" },
  ],
  legal: [
    { label: "Política de privacidad", href: "/politica-de-privacidad" },
    { label: "Política de cookies", href: "/politica-de-cookies" },
    { label: "Aviso legal", href: "/aviso-legal" },
  ],
};

/** Banda de confianza del hero */
export const trustBarItems = [
  "Estrategia",
  "SEO",
  "Google Ads",
  "Meta Ads",
  "Diseño web",
  "Inteligencia artificial",
  "Social media",
  "Renovación web",
];

/** Bloque "¿Por qué Odisas Lab?" */
export const trustPoints = [
  {
    title: "Sin humo",
    description:
      "No prometemos primeras posiciones ni resultados imposibles. Explicamos qué se puede conseguir y en qué plazo.",
  },
  {
    title: "Estrategia antes que ejecución",
    description:
      "Cada acción responde a un motivo. Si no sabemos por qué se hace algo, no se hace.",
  },
  {
    title: "Datos antes que opiniones",
    description:
      "Medimos lo que pasa en tu web y en tus campañas, y decidimos con esos datos delante.",
  },
  {
    title: "Tecnología con sentido",
    description:
      "Usamos IA y herramientas digitales cuando aportan una ventaja real, no porque estén de moda.",
  },
];

/**
 * Imágenes de marca.
 *
 * Los archivos viven en public/brand/ y se generan desde los originales con
 * `python3 scripts/preparar-logo.py`. Detalles en public/brand/LEEME.txt.
 *
 * Si dejas un valor vacío, la web recurre al logotipo tipográfico o a un
 * placeholder identificado en el retrato: nunca a una imagen inventada.
 *
 * Pendiente: estos PNG vienen de un JPG con fondo blanco. Si consigues el
 * logotipo en SVG, sustitúyelo aquí y pesará mucho menos.
 */
export const assets = {
  /** Símbolo + ODISAS, sin la bajada: a 28 px "MARKETING DIGITAL" no se leería */
  logo: "/brand/logo.png",
  logoInvert: "/brand/logo-blanco.png",
  /** Proporción real del archivo (614 x 180), escalada al alto de la cabecera */
  logoHeight: 28,
  logoWidth: 96,

  /**
   * Retrato para /sobre-odisas-lab. Vacío a propósito: si algún día quieres
   * poner una foto, déjala en public/brand/ y escribe aquí su ruta. Mientras
   * esté vacío, la página muestra una tarjeta de marca en su lugar, no un
   * hueco ni un placeholder.
   */
  portrait: "",
  portraitAlt: "Alejandro, fundador de Odisas Lab",
};
