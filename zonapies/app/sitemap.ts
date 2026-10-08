import type { MetadataRoute } from "next";
import { site } from "@/data/site";

const routes: { path: string; priority: number; changeFrequency: "weekly" | "monthly" | "yearly" }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/plantillas", priority: 0.9, changeFrequency: "monthly" },
  { path: "/materiales", priority: 0.9, changeFrequency: "monthly" },
  { path: "/tecnologia", priority: 0.8, changeFrequency: "monthly" },
  { path: "/proceso", priority: 0.8, changeFrequency: "monthly" },
  { path: "/profesionales", priority: 0.8, changeFrequency: "monthly" },
  { path: "/contacto", priority: 0.8, changeFrequency: "monthly" },
  { path: "/nosotros", priority: 0.6, changeFrequency: "monthly" },
  { path: "/formacion", priority: 0.6, changeFrequency: "monthly" },
  { path: "/franquicias", priority: 0.6, changeFrequency: "monthly" },
  { path: "/aviso-legal", priority: 0.2, changeFrequency: "yearly" },
  { path: "/politica-de-privacidad", priority: 0.2, changeFrequency: "yearly" },
  { path: "/politica-de-cookies", priority: 0.2, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return routes.map((route) => ({
    url: `${site.url}${route.path === "/" ? "" : route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
