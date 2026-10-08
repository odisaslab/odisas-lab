import { EXPERIENCE } from "@/data/site";

/**
 * Sobre nosotros: Experiencia → Evolución → Tecnología → Innovación → Futuro.
 * Sin años ni hitos concretos (no constan): `pending` marca lo que falta.
 */
export interface Milestone {
  n: string;
  label: string;
  title: string;
  body: string;
  pending?: string;
}

export const milestones: Milestone[] = [
  {
    n: "01",
    label: "Experiencia",
    title: `${EXPERIENCE[0].toUpperCase()}${EXPERIENCE.slice(1)} fabricando plantillas.`,
    body: "Una trayectoria dedicada a fabricar plantillas y prótesis plantares a medida, en colaboración con profesionales sanitarios y centros especializados.",
    pending: "Cronología real: año de origen, hitos y personas — pendiente de proporcionar",
  },
  {
    n: "02",
    label: "Evolución",
    title: "De los procesos manuales al flujo digital.",
    body: "La experiencia acumulada se ha trasladado a procesos digitales que eliminan los moldes de espuma y los pasos manuales.",
  },
  {
    n: "03",
    label: "Tecnología",
    title: "Un sistema integral.",
    body: "Escáner 3D, software de prescripción y fabricación avanzada, integrados en un único flujo de trabajo.",
  },
  {
    n: "04",
    label: "Innovación",
    title: "Materiales técnicos, diseño digital.",
    body: "Fibra de carbono, PA11, resina, composite o EVA, combinados con diseño digital para ajustar cada ortesis a su prescripción.",
  },
  {
    n: "05",
    label: "Futuro",
    title: "Un laboratorio de nueva generación.",
    body: "El objetivo: seguir llevando precisión y tecnología a cada profesional que trabaja con Zona Pies.",
    pending: "Visión y próximos hitos — pendiente de validar por la dirección",
  },
];

export const galleryNeeds = ["Laboratorio", "Maquinaria", "Fabricación", "Equipo"];
