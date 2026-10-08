import { LEAD_TIME } from "@/data/site";

/** Cadena de producción digital (briefing §10). Textos fieles al documento funcional. */
export interface ProcessStep {
  n: string;
  verb: string;
  title: string;
  body: string;
  points: string[];
  /** Visual técnico asociado */
  visual: "scan" | "design" | "customize" | "manufacture" | "deliver";
}

export const processSteps: ProcessStep[] = [
  {
    n: "01",
    verb: "Digitalizamos",
    title: "El pie, convertido en un modelo digital.",
    body: "El escaneo 3D captura la anatomía plantar con precisión y la prescripción del profesional queda asociada al modelo.",
    points: ["Escaneo 3D de la anatomía plantar", "Prescripción asociada al modelo", "Sin espumas ni procesos manuales"],
    visual: "scan",
  },
  {
    n: "02",
    verb: "Diseñamos",
    title: "Del dato a la geometría de la ortesis.",
    body: "Se interpreta la geometría y las necesidades del caso, y se diseña digitalmente la ortesis a partir del modelo.",
    points: ["Análisis de la geometría", "Diseño digital de la ortesis", "Automatización con criterio profesional"],
    visual: "design",
  },
  {
    n: "03",
    verb: "Personalizamos",
    title: "Material, dureza, estructura.",
    body: "Cada ortesis combina las características que pide la prescripción: material, dureza, estructura y acabado.",
    points: ["Resina, composite, fibra de carbono, EVA, PA11…", "Amortiguación, suspensión y forros", "Características según prescripción"],
    visual: "customize",
  },
  {
    n: "04",
    verb: "Fabricamos",
    title: "Fabricación avanzada con materiales técnicos.",
    body: "La pieza se fabrica con materiales técnicos y procesos avanzados, capa a capa, a partir del diseño digital.",
    points: ["Materiales técnicos", "Procesos de fabricación avanzada", "Geometría fiel al diseño"],
    visual: "manufacture",
  },
  {
    n: "05",
    verb: "Entregamos",
    title: "Lista para tu paciente.",
    body: `Resultado final preparado para el profesional. Plazo de fabricación: aproximadamente ${LEAD_TIME.replace("3 días hábiles", "tres días hábiles")} desde la recepción del pedido, con envíos a toda España.`,
    points: ["Plazo aproximado: tres días hábiles", "Envíos a toda España", "Soporte y servicio postventa"],
    visual: "deliver",
  },
];
