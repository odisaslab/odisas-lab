import { LEAD_TIME } from "@/data/site";

/** Zona Profesional: «Tu laboratorio. A un click.» (briefing §13). */
export interface Benefit {
  id: string;
  title: string;
  body: string;
}

export const benefits: Benefit[] = [
  { id: "fabricacion", title: "Fabricación especializada", body: "Plantillas anatómicas y ortopédicas adaptadas a cada caso, fabricadas para profesionales." },
  { id: "precision", title: "Precisión 3D", body: "Cada par se diseña mediante escaneo 3D, logrando un ajuste exacto y totalmente personalizado." },
  { id: "materiales", title: "Materiales técnicos", body: "Materiales de alto rendimiento que aportan durabilidad, confort y eficacia: resina, composite, fibra de carbono, EVA, PA11." },
  { id: "soporte", title: "Asesoría profesional", body: "Te acompañamos en todo el proceso con soporte especializado para elegir la mejor solución." },
  { id: "personalizacion", title: "Personalización", body: "Material, dureza y estructura según cada prescripción." },
  { id: "rapidez", title: "Entrega ágil", body: `Fabricación eficiente y servicio postventa eficaz, sin esperas innecesarias. Plazo aproximado: ${LEAD_TIME.replace("3 días hábiles", "tres días hábiles")}.` },
  { id: "experiencia", title: "Experiencia técnica", body: "Más de tres décadas perfeccionando la fabricación de plantillas anatómicas y ortopédicas." },
  { id: "cobertura", title: "Cobertura nacional", body: "Fabricamos y enviamos a toda España, también a Madrid y su área." },
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
