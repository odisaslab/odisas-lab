import { EXPERIENCE, LEAD_TIME } from "@/data/site";

/** Zona Profesional: «Tu laboratorio. A un click.» (briefing §13). */
export interface Benefit {
  id: string;
  title: string;
  body: string;
}

export const benefits: Benefit[] = [
  { id: "fabricacion", title: "Fabricación especializada", body: "Ortesis plantares y plantillas a medida, fabricadas para profesionales." },
  { id: "precision", title: "Precisión", body: "Del escaneo 3D al diseño digital, sin pasos manuales innecesarios." },
  { id: "materiales", title: "Materiales", body: "Resina, composite, fibra de carbono, EVA, PA11 y más." },
  { id: "soporte", title: "Soporte", body: "Un equipo que te acompaña durante todo el proceso." },
  { id: "personalizacion", title: "Personalización", body: "Material, dureza y estructura según cada prescripción." },
  { id: "rapidez", title: "Rapidez", body: `Fabricación en aproximadamente ${LEAD_TIME.replace("3 días hábiles", "tres días hábiles")} desde la recepción del pedido.` },
  { id: "experiencia", title: "Experiencia", body: `${EXPERIENCE[0].toUpperCase()}${EXPERIENCE.slice(1)} fabricando plantillas y prótesis plantares a medida.` },
  { id: "cobertura", title: "Cobertura nacional", body: "Envíos a toda España, también a Madrid y su área." },
];

export const collaboration = [
  { id: "podologo", label: "Podólogo", action: "Prescribe" },
  { id: "zonapies", label: "Zona Pies", action: "Diseña y fabrica" },
  { id: "paciente", label: "Paciente", action: "Recibe la solución" },
] as const;

export const audiences = [
  "Podólogos",
  "Clínicas podológicas",
  "Centros médicos",
  "Ortopedias",
  "Profesionales sanitarios",
  "Centros deportivos",
];
