export interface NavItem {
  label: string;
  href: string;
}

/** Menú principal (briefing §8). Franquicias se enlaza desde el footer y la zona profesional. */
export const mainNav: NavItem[] = [
  { label: "Inicio", href: "/" },
  { label: "Tecnología", href: "/tecnologia" },
  { label: "Plantillas", href: "/plantillas" },
  { label: "Materiales", href: "/materiales" },
  { label: "Proceso", href: "/proceso" },
  { label: "Profesionales", href: "/profesionales" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Formación", href: "/formacion" },
  { label: "Contacto", href: "/contacto" },
];

export const footerNav = {
  soluciones: [
    { label: "Plantillas a medida", href: "/plantillas" },
    { label: "Materiales", href: "/materiales" },
    { label: "Tecnología", href: "/tecnologia" },
    { label: "El proceso", href: "/proceso" },
  ],
  profesionales: [
    { label: "Zona profesional", href: "/profesionales" },
    { label: "Formación", href: "/formacion" },
    { label: "Franquicias", href: "/franquicias" },
    { label: "Acceso profesionales", href: "/acceso-profesional" },
  ],
  empresa: [
    { label: "Nosotros", href: "/nosotros" },
    { label: "Contacto", href: "/contacto" },
  ],
  legal: [
    { label: "Aviso legal", href: "/aviso-legal" },
    { label: "Política de privacidad", href: "/politica-de-privacidad" },
    { label: "Política de cookies", href: "/politica-de-cookies" },
  ],
} as const;

export const PROFESSIONAL_ACCESS = { label: "Acceso profesionales", href: "/acceso-profesional" } as const;
export const QUOTE_HREF = "/contacto#presupuesto";
