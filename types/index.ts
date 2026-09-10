export type ServiceSlug =
  | "seo"
  | "google-ads"
  | "meta-ads"
  | "diseno-web"
  | "renovacion-web"
  | "social-media"
  | "analisis-web-ia";

export interface Service {
  slug: ServiceSlug;
  /** Nombre corto para navegación y tarjetas */
  name: string;
  /** Titular comercial del servicio */
  claim: string;
  /** Descripción corta para tarjeta y metadatos */
  summary: string;
  /** Qué incluye el servicio */
  includes: string[];
  /** Nombre del icono de lucide-react */
  icon: string;
  /** Marcar servicios que deben destacarse visualmente */
  featured?: boolean;

  /* ── Contenido de la página individual ── */
  /** Title de la etiqueta <title>, sin la marca */
  metaTitle: string;
  metaDescription: string;
  /** H1 de la página del servicio */
  h1: string;
  /** Párrafos de entrada */
  intro: string[];
  /** Señales de que el negocio necesita este servicio */
  signals: string[];
  /** Bloques de trabajo concreto */
  work: { title: string; description: string }[];
  /** Preguntas específicas del servicio */
  faqs: FaqItem[];
  /** Servicios relacionados a sugerir al final */
  related: ServiceSlug[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ProcessStep {
  step: string;
  title: string;
  description: string;
}
