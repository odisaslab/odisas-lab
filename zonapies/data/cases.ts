import type { MaterialId } from "@/components/scene/textures";

/**
 * Casos reales (briefing §15–16): Problema → Diseño → Material → Resultado.
 *
 * NO HAY CASOS REALES TODAVÍA. Las tres fichas son EJEMPLOS ESTRUCTURALES marcados con
 * `placeholder: true`: la interfaz los etiqueta como tal. Para publicar un caso real:
 * sustituir los textos, aportar `before`/`after` (fotografías, capturas 3D o mapas), poner
 * `placeholder: false` y confirmar con el profesional que autoriza su publicación.
 */
export interface CaseStudy {
  id: string;
  placeholder: boolean;
  title: string;
  /** Perfil del caso, sin datos personales */
  context: string;
  problem: string;
  design: string;
  material: MaterialId;
  materialLabel: string;
  result: string;
  before?: string;
  after?: string;
}

export const cases: CaseStudy[] = [
  {
    id: "caso-1",
    placeholder: true,
    title: "Caso de ejemplo A",
    context: "Perfil del paciente y motivo de consulta — pendiente",
    problem: "Descripción del problema que presentaba el paciente según la prescripción del podólogo.",
    design: "Explicación del diseño digital realizado a partir del escaneo 3D.",
    material: "carbono",
    materialLabel: "Fibra de carbono",
    result: "Resultado observado y valoración del profesional.",
  },
  {
    id: "caso-2",
    placeholder: true,
    title: "Caso de ejemplo B",
    context: "Perfil del paciente y motivo de consulta — pendiente",
    problem: "Descripción del problema que presentaba el paciente según la prescripción del podólogo.",
    design: "Explicación del diseño digital realizado a partir del escaneo 3D.",
    material: "eva",
    materialLabel: "EVA",
    result: "Resultado observado y valoración del profesional.",
  },
  {
    id: "caso-3",
    placeholder: true,
    title: "Caso de ejemplo C",
    context: "Perfil del paciente y motivo de consulta — pendiente",
    problem: "Descripción del problema que presentaba el paciente según la prescripción del podólogo.",
    design: "Explicación del diseño digital realizado a partir del escaneo 3D.",
    material: "pa11",
    materialLabel: "PA11",
    result: "Resultado observado y valoración del profesional.",
  },
];
