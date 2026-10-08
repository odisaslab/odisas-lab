import type { MaterialId } from "@/components/scene/textures";

/**
 * Material Lab.
 *
 * VALIDACIÓN PENDIENTE: los niveles (1–5) son una comparativa ORIENTATIVA entre familias de
 * material basada en conocimiento general, no datos técnicos del catálogo de Zona Pies.
 * `validated: false` hace que la interfaz muestre el aviso. Cuando el equipo técnico confirme
 * o corrija los valores, poner `validated: true`.
 * Las INDICACIONES clínicas no se redactan aquí: se muestran como pendientes.
 */
export interface MaterialInfo {
  id: Exclude<MaterialId, "forro" | "clay">;
  name: string;
  /** Plural/etiqueta para SEO: «plantillas de fibra de carbono» */
  seoName: string;
  family: string;
  summary: string;
  /** Niveles 1–5 */
  levels: { flexibility: number; resistance: number; comfort: number; lightness: number };
  advantages: string[];
  applications: string[];
  /**
   * Cómo se fabrica. Deducido de los nombres de los vídeos de la web real (impresora-3D, PA11-ELASTICIDAD,
   * FRESADO-EVA, EVA-3-DENSIDADES, termoconformado-resina): CONFIRMAR con Zona Pies.
   */
  process?: string;
  validated: boolean;
}

export const materials: MaterialInfo[] = [
  {
    id: "carbono",
    name: "Fibra de carbono",
    seoName: "plantillas de fibra de carbono",
    family: "Composite de alto rendimiento",
    summary: "Máxima rigidez con el mínimo grosor y peso. Respuesta firme en una pieza muy fina.",
    levels: { flexibility: 1, resistance: 5, comfort: 2, lightness: 5 },
    advantages: ["Muy ligera", "Rigidez y respuesta", "Perfil fino"],
    applications: ["Calzado deportivo", "Calzado de perfil bajo"],
    validated: false,
  },
  {
    id: "eva",
    name: "EVA",
    seoName: "plantillas EVA",
    family: "Espuma técnica",
    summary: "Ligera, flexible y amortiguadora. Una base cómoda para el uso diario.",
    levels: { flexibility: 5, resistance: 2, comfort: 5, lightness: 5 },
    advantages: ["Amortiguación", "Ligereza", "Confort"],
    applications: ["Uso diario", "Soluciones de amortiguación"],
    process: "Fresado · disponible en 3 densidades",
    validated: false,
  },
  {
    id: "pa11",
    name: "PA11",
    seoName: "plantillas PA11",
    family: "Poliamida técnica",
    summary: "Equilibrio entre flexibilidad y resistencia, pensada para fabricación digital.",
    levels: { flexibility: 3, resistance: 4, comfort: 3, lightness: 4 },
    advantages: ["Flexibilidad y resistencia", "Durabilidad", "Ligera"],
    applications: ["Uso diario", "Uso intensivo"],
    process: "Impresión 3D",
    validated: false,
  },
  {
    id: "resina",
    name: "Resina",
    seoName: "plantillas de resina",
    family: "Polímero rígido",
    summary: "Acabado liso y gran fidelidad al diseño digital. Una pieza estable y precisa.",
    levels: { flexibility: 2, resistance: 4, comfort: 3, lightness: 3 },
    advantages: ["Acabado liso", "Buena rigidez", "Fiel al diseño"],
    applications: ["Uso diario", "Calzado cerrado"],
    process: "Termoconformado",
    validated: false,
  },
  {
    id: "composite",
    name: "Composite",
    seoName: "plantillas de composite",
    family: "Material compuesto",
    summary: "Resistencia y estabilidad en un material versátil, con rigidez media-alta.",
    levels: { flexibility: 2, resistance: 4, comfort: 3, lightness: 3 },
    advantages: ["Resistencia", "Estabilidad", "Versatilidad"],
    applications: ["Uso diario", "Uso prolongado"],
    validated: false,
  },
  {
    id: "memory",
    name: "Memory",
    seoName: "plantillas memory",
    family: "Espuma viscoelástica",
    summary: "Se adapta a la forma del pie y absorbe. Confort máximo en contacto directo.",
    levels: { flexibility: 5, resistance: 1, comfort: 5, lightness: 4 },
    advantages: ["Adaptación a la forma", "Confort", "Absorción"],
    applications: ["Forros y capas de contacto", "Amortiguación"],
    validated: false,
  },
];

export const levelLabels: Record<keyof MaterialInfo["levels"], string> = {
  flexibility: "Flexibilidad",
  resistance: "Resistencia",
  comfort: "Confort",
  lightness: "Ligereza",
};

export const materialById = (id: string) => materials.find((m) => m.id === id) ?? materials[0];
