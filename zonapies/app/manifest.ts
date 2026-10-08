import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Zona Pies · Laboratorio de ortesis plantares",
    short_name: "Zona Pies",
    description: "Ingeniería digital aplicada al movimiento: ortesis plantares y plantillas a medida para profesionales.",
    start_url: "/",
    display: "standalone",
    background_color: "#07090b",
    theme_color: "#07090b",
    lang: "es-ES",
    icons: [{ src: "/icon", sizes: "32x32", type: "image/png" }],
  };
}
