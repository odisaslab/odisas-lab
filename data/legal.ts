import { contact } from "@/data/site";

/**
 * ⚠️ DATOS PENDIENTES DE COMPLETAR ANTES DE PUBLICAR
 *
 * Los campos vacíos aparecen en la web marcados en naranja como
 * [COMPLETAR: ...] y las páginas legales se sirven con noindex hasta que
 * estén todos rellenos. Es intencionado: preferimos que se vea el hueco
 * antes que inventar un NIF o un domicilio.
 *
 * Lo que hace falta:
 * - holder: nombre y apellidos completos del titular (o razón social)
 * - taxId: NIF / CIF
 * - address: domicilio fiscal completo
 * - hostingProvider + hostingCountry: quién aloja la web (Vercel, IONOS, etc.)
 *
 * Y un aviso honesto: estos textos siguen la estructura habitual del RGPD y
 * de la LSSI-CE, pero no son un dictamen jurídico. Conviene que los revise
 * alguien con criterio legal antes de publicar.
 */
export const legalEntity = {
  tradeName: "Odisas Lab",
  holder: "",
  taxId: "",
  address: "",
  email: contact.email,
  phoneDisplay: contact.phoneDisplay,
  activity: "Servicios de marketing digital y desarrollo web",
  hostingProvider: "",
  hostingCountry: "",
};

/** true cuando no queda ningún hueco por rellenar */
export const legalIsComplete = [
  legalEntity.holder,
  legalEntity.taxId,
  legalEntity.address,
  legalEntity.hostingProvider,
].every((value) => value.trim().length > 0);

/** Fecha de última actualización de los textos legales */
export const legalUpdatedAt = "2026-09-10";

export const legalUpdatedLabel = new Date(legalUpdatedAt).toLocaleDateString("es-ES", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/**
 * Cookies que la web puede instalar.
 * Las de analítica y marketing solo se cargan tras consentimiento expreso,
 * y únicamente si el ID correspondiente está configurado en el entorno.
 */
export const cookieTable = [
  {
    category: "Necesarias",
    always: true,
    cookies: [
      {
        name: "odisas-consent",
        provider: "Odisas Lab (propia)",
        purpose: "Recordar tu decisión sobre las cookies para no volver a preguntarte.",
        duration: "12 meses",
      },
    ],
  },
  {
    category: "Analítica",
    always: false,
    cookies: [
      {
        name: "_ga, _ga_*",
        provider: "Google Analytics 4 (Google Ireland Ltd.)",
        purpose:
          "Distinguir usuarios y sesiones para medir de forma agregada qué páginas se visitan y cómo se navega.",
        duration: "Hasta 24 meses",
      },
      {
        name: "_gid",
        provider: "Google Analytics 4 (Google Ireland Ltd.)",
        purpose: "Diferenciar usuarios durante la sesión.",
        duration: "24 horas",
      },
    ],
  },
  {
    category: "Marketing",
    always: false,
    cookies: [
      {
        name: "_fbp",
        provider: "Meta Platforms Ireland Ltd.",
        purpose:
          "Medir la eficacia de nuestros anuncios y mostrar publicidad relevante en Facebook e Instagram.",
        duration: "3 meses",
      },
    ],
  },
];

/** Enlaces para desactivar cookies en cada navegador */
export const browserGuides = [
  { name: "Google Chrome", url: "https://support.google.com/chrome/answer/95647" },
  {
    name: "Mozilla Firefox",
    url: "https://support.mozilla.org/es/kb/Borrar%20cookies",
  },
  { name: "Safari", url: "https://support.apple.com/es-es/guide/safari/sfri11471/mac" },
  {
    name: "Microsoft Edge",
    url: "https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09",
  },
];
