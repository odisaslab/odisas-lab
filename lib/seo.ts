import type { Metadata } from "next";
import { contact, site } from "@/data/site";
import { services } from "@/data/services";

interface PageMetaInput {
  title: string;
  description: string;
  /** Ruta absoluta del sitio, por ejemplo "/servicios/seo" */
  path: string;
}

/** Genera metadata coherente para cada página, con canonical y Open Graph. */
export function pageMeta({ title, description, path }: PageMetaInput): Metadata {
  const url = `${site.url}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: site.name,
      locale: site.locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/**
 * Schema.org. Solo se incluyen propiedades verdaderas:
 * si un dato no existe todavía, no se declara.
 */
export function organizationSchema() {
  const sameAs = [contact.instagram, contact.linkedin].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${site.url}#organization`,
    name: site.name,
    url: site.url,
    slogan: site.tagline,
    description: site.description,
    foundingDate: String(site.foundingYear),
    founder: { "@type": "Person", name: site.owner },
    ...(contact.email ? { email: contact.email } : {}),
    ...(contact.phone ? { telephone: contact.phone } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
    areaServed: { "@type": "Country", name: "España" },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Servicios de marketing digital",
      itemListElement: services.map((service) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service.name,
          description: service.summary,
          url: `${site.url}/servicios/${service.slug}`,
        },
      })),
    },
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}#website`,
    url: site.url,
    name: site.name,
    inLanguage: "es-ES",
    publisher: { "@id": `${site.url}#organization` },
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
