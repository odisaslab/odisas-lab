import type { MetadataRoute } from "next";
import { site } from "@/data/site";
import { services } from "@/data/services";
import { legalIsComplete } from "@/data/legal";

/**
 * Sitemap generado a partir de las estructuras de datos.
 * Al añadir un servicio, aparece aquí automáticamente.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [
    { path: "/", priority: 1 },
    { path: "/servicios", priority: 0.9 },
    { path: "/sobre-odisas-lab", priority: 0.7 },
    { path: "/proceso", priority: 0.7 },
    { path: "/contacto", priority: 0.8 },
    // Las páginas legales solo entran en el sitemap cuando el texto está completo
    ...(legalIsComplete
      ? [
          { path: "/politica-de-privacidad", priority: 0.2 },
          { path: "/politica-de-cookies", priority: 0.2 },
          { path: "/aviso-legal", priority: 0.2 },
        ]
      : []),
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${site.url}${route.path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: route.priority,
    })),
    ...services.map((service) => ({
      url: `${site.url}/servicios/${service.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
