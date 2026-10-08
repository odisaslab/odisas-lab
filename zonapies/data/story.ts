import type { MaterialId } from "@/components/scene/textures";

/**
 * Fases del recorrido «Del pie físico al modelo digital» (home).
 * Los textos se apoyan en lo que la web actual y el briefing afirman; no se añaden cifras
 * ni capacidades no confirmadas.
 */
export interface Chapter {
  id: "scan" | "analyze" | "design" | "material" | "manufacture" | "result" | "cta";
  n: string;
  hud: string;
  title: string;
  body: string;
  link?: { label: string; href: string };
  /** Selector de material (fase 04) */
  materials?: boolean;
  /** Llamada a la acción final (fase 07) */
  cta?: boolean;
}

export const chapters: Chapter[] = [
  {
    id: "scan",
    n: "01",
    hud: "SCAN",
    title: "El pie se digitaliza.",
    body: "El escaneo 3D convierte la anatomía plantar en datos. Sin depender de procesos manuales ni de espumas.",
    link: { label: "Escaneo 3D", href: "/tecnologia#escaneo" },
  },
  {
    id: "analyze",
    n: "02",
    hud: "ANALYZE",
    title: "Los datos se leen.",
    body: "Interpretamos la geometría del pie y las necesidades de cada prescripción antes de diseñar nada.",
    link: { label: "Software de prescripción", href: "/tecnologia#prescripcion" },
  },
  {
    id: "design",
    n: "03",
    hud: "DESIGN",
    title: "La geometría se vuelve diseño.",
    body: "El modelo digital se transforma en una ortesis diseñada a medida, automatizando el diseño sin perder el criterio del profesional.",
    link: { label: "Cómo diseñamos", href: "/tecnologia#diseno" },
  },
  {
    id: "material",
    n: "04",
    hud: "MATERIAL",
    title: "El material también es tecnología.",
    body: "Resina, composite, fibra de carbono, EVA, PA11, memory… Elige uno y mira cómo cambia la pieza.",
    materials: true,
    link: { label: "Explorar el Material Lab", href: "/materiales" },
  },
  {
    id: "manufacture",
    n: "05",
    hud: "MANUFACTURE",
    title: "Capas, geometría, precisión.",
    body: "La ortesis se fabrica con materiales técnicos y procesos avanzados. Plazo de fabricación: aproximadamente tres días hábiles desde la recepción del pedido.",
    link: { label: "El proceso completo", href: "/proceso" },
  },
  {
    id: "result",
    n: "06",
    hud: "RESULT",
    title: "La ortesis, terminada.",
    body: "Una pieza lista para tu paciente: fabricada según tu prescripción y enviada a cualquier punto de España.",
    link: { label: "Ver plantillas", href: "/plantillas" },
  },
  {
    id: "cta",
    n: "07",
    hud: "YOUR PATIENT",
    title: "Tu laboratorio. Tu tecnología. Tu precisión.",
    body: "Cuéntanos tu caso y te preparamos un presupuesto gratuito.",
    cta: true,
  },
];

export interface HeroTag {
  label: string;
}

/** Indicadores HUD de la portada (briefing §5). */
export const heroHud = ["3D SCAN", "DIGITAL DESIGN", "ADVANCED MANUFACTURING", "PRECISION"] as const;

export const storyMaterials: { id: MaterialId; label: string }[] = [
  { id: "carbono", label: "Fibra de carbono" },
  { id: "eva", label: "EVA" },
  { id: "pa11", label: "PA11" },
  { id: "resina", label: "Resina" },
  { id: "composite", label: "Composite" },
  { id: "memory", label: "Memory" },
];

/** Colores de muestra (solo ilustrativos) para los selectores de material. */
export const SWATCH: Record<MaterialId, string> = {
  carbono: "linear-gradient(135deg,#47505e,#07090b)",
  eva: "linear-gradient(135deg,#f1eee6,#c9c3b4)",
  pa11: "linear-gradient(135deg,#cfd1cd,#9a9c98)",
  resina: "linear-gradient(135deg,#f5b04a,#a85d12)",
  composite: "linear-gradient(135deg,#4a525b,#23282e)",
  memory: "linear-gradient(135deg,#e3e9ed,#a4afb8)",
  forro: "linear-gradient(135deg,#efebe1,#cfc9bb)",
  clay: "linear-gradient(135deg,#e0dacd,#bdb5a5)",
};
