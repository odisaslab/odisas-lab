import type { Metadata } from "next";
import { company, contact, site } from "@/data/site";

interface PageMeta {
  title: string;
  description: string;
  /** Ruta absoluta del sitio: «/materiales» */
  path: string;
  noindex?: boolean;
}

/** Metadata coherente por página: title, description, canonical, Open Graph y Twitter. */
export function pageMetadata({ title, description, path, noindex }: PageMeta): Metadata {
  const url = `${site.url}${path === "/" ? "" : path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "website",
      locale: site.locale,
      siteName: site.name,
      title,
      description,
      url,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "@id": `${site.url}/#organization`,
    name: site.name,
    legalName: company.legalName,
    taxID: company.taxId,
    url: site.url,
    description: site.description,
    telephone: [contact.phone.tel, `+${contact.whatsapp.number}`],
    email: contact.email.address,
    address: {
      "@type": "PostalAddress",
      streetAddress: `${company.address.street}, ${company.address.area}`,
      postalCode: company.address.postalCode,
      addressLocality: company.address.city,
      addressRegion: company.address.region,
      addressCountry: "ES",
    },
    areaServed: { "@type": "Country", name: "España" },
    sameAs: [contact.instagram, contact.facebook],
    knowsAbout: [
      "Ortesis plantares",
      "Plantillas ortopédicas a medida",
      "Escaneo 3D del pie",
      "Fabricación de plantillas para podólogos",
      "Plantillas de fibra de carbono, EVA y PA11",
    ],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    url: site.url,
    name: site.name,
    inLanguage: "es-ES",
    publisher: { "@id": `${site.url}/#organization` },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${site.url}${item.path === "/" ? "" : item.path}`,
    })),
  };
}

export function serviceJsonLd({ name, description, path }: { name: string; description: string; path: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: `${site.url}${path}`,
    provider: { "@id": `${site.url}/#organization` },
    areaServed: { "@type": "Country", name: "España" },
    audience: { "@type": "Audience", audienceType: "Podólogos, clínicas podológicas y profesionales sanitarios" },
  };
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}
