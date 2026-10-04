/**
 * Resultados mostrados en la home.
 *
 * REGLA: aquí solo entra lo que sea real y verificable. No inventar clientes,
 * testimonios, facturación ni métricas.
 *
 * Las dos métricas de `headline` son las que ya figuraban en la web anterior.
 * Confirma que siguen vigentes antes de publicar y, si puedes, añade el caso al que
 * pertenecen (sector, qué se hizo) en `cases`.
 *
 * Para añadir un caso real, agrega un objeto a `cases` con este formato:
 *   {
 *     client: "Nombre del cliente (con su permiso)",
 *     sector: "Óptica · Madrid",
 *     did: ["SEO local", "Renovación web"],
 *     metric: { value: "+142%", label: "Visibilidad orgánica", period: "7 meses" },
 *     quote?: { text: "…", author: "…" }   // solo si el cliente lo ha dicho de verdad
 *   }
 * La home los mostrará automáticamente.
 */

export interface ResultCase {
  client: string;
  sector: string;
  did: string[];
  metric: { value: string; label: string; period: string };
  quote?: { text: string; author: string };
}

export const results = {
  eyebrow: "Resultados",
  title: "Lo que pasa cuando el marketing tiene *estrategia.*",
  headline: [
    { counter: 142, prefix: "+", suffix: "%", label: "Visibilidad orgánica" },
    { counter: 7, prefix: "", suffix: " meses", label: "Posiciones destacadas en Google" },
  ],
  source: "Datos de un proyecto de Odisas Lab.",
  honesty:
    "No prometemos primeras posiciones ni plazos que no dependen de nosotros. Te explicamos qué se puede conseguir en tu caso y cómo lo vamos a medir.",
  nextCase: {
    title: "El siguiente caso puede ser el tuyo.",
    text: "Cuéntanos tu situación y te decimos, con honestidad, qué se puede esperar y en cuánto tiempo.",
    cta: "Quiero hablar de mi caso",
  },
  cases: [] as ResultCase[],
};
