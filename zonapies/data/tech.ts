/**
 * «La tecnología detrás de cada plantilla» (briefing §10 del documento funcional).
 * Descripciones prudentes y sin marcas ni cifras: no constan los equipos ni el software
 * concretos. Validar con Zona Pies antes de publicar.
 */
export interface TechBlock {
  id: "escaneo" | "diseno" | "software" | "prescripcion" | "fabricacion" | "calidad" | "materiales";
  n: string;
  title: string;
  lead: string;
  points: string[];
}

export const techBlocks: TechBlock[] = [
  {
    id: "escaneo",
    n: "01",
    title: "Escaneo 3D",
    lead: "La anatomía plantar, convertida en un modelo digital.",
    points: ["Captura tridimensional del pie", "Sin moldes de espuma", "Punto de partida de todo el flujo"],
  },
  {
    id: "diseno",
    n: "02",
    title: "Diseño digital",
    lead: "La ortesis se diseña sobre el modelo, no a mano.",
    points: ["Diseño paramétrico a partir del escaneo", "Automatización con criterio profesional", "Geometría reproducible"],
  },
  {
    id: "software",
    n: "03",
    title: "Software",
    lead: "Un entorno que une escaneo, diseño y fabricación.",
    points: ["Flujo digital integrado", "Del dato a la máquina", "Menos pasos manuales"],
  },
  {
    id: "prescripcion",
    n: "04",
    title: "Prescripción",
    lead: "Tu criterio profesional, en el centro del proceso.",
    points: ["Software de prescripción", "Material, dureza y estructura", "Trazabilidad del caso"],
  },
  {
    id: "fabricacion",
    n: "05",
    title: "Fabricación",
    lead: "Fabricación avanzada con materiales técnicos.",
    points: ["Procesos de fabricación avanzada", "Pieza fiel al diseño digital", "Plazo aproximado de tres días hábiles"],
  },
  {
    id: "calidad",
    n: "06",
    title: "Control de calidad",
    lead: "Cada pieza se revisa antes de salir del laboratorio.",
    points: ["Revisión de la pieza final", "Comprobación frente al diseño", "Soporte y servicio postventa"],
  },
  {
    id: "materiales",
    n: "07",
    title: "Materiales",
    lead: "El material también es tecnología.",
    points: ["Resina, composite, fibra de carbono, EVA, PA11", "Amortiguación, suspensión y forros", "Material Lab interactivo"],
  },
];
