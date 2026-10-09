/**
 * Dominio de la demo. Los NOMBRES de estados, causas y parámetros coinciden con los de
 * `docs/zona-pies/PROMPT-app-casos.md` para que la app real los herede sin renombrar.
 */
import type { InsoleParams, Side } from "./geometry";

export type View = "inicio" | "profesional" | "laboratorio" | "dueno" | "acerca";

export type CaseState =
  | "borrador"
  | "escaneo_a_repetir"
  | "enviado"
  | "esperando_aclaracion"
  | "validado"
  | "diseno_borrador"
  | "diseno_aprobado"
  | "en_fabricacion"
  | "control_calidad"
  | "expedido"
  | "entregado";

/** Orden de avance (las ramas «a repetir» y «aclaración» quedan entre medias). */
export const STATE_RANK: Record<CaseState, number> = {
  borrador: 0,
  escaneo_a_repetir: 0.5,
  enviado: 1,
  esperando_aclaracion: 1.5,
  validado: 2,
  diseno_borrador: 3,
  diseno_aprobado: 4,
  en_fabricacion: 5,
  control_calidad: 6,
  expedido: 7,
  entregado: 8,
};

export type Tone = "ok" | "warn" | "bad" | "info" | "muted";

export const STATE_LABEL: Record<CaseState, string> = {
  borrador: "Borrador",
  escaneo_a_repetir: "Escaneo a repetir",
  enviado: "Recibido",
  esperando_aclaracion: "Esperando aclaración",
  validado: "Validado",
  diseno_borrador: "Diseño en borrador",
  diseno_aprobado: "Diseño aprobado",
  en_fabricacion: "En fabricación",
  control_calidad: "Control de calidad",
  expedido: "Expedido",
  entregado: "Entregado",
};

export const STATE_TONE: Record<CaseState, Tone> = {
  borrador: "muted",
  escaneo_a_repetir: "bad",
  enviado: "info",
  esperando_aclaracion: "warn",
  validado: "ok",
  diseno_borrador: "info",
  diseno_aprobado: "ok",
  en_fabricacion: "info",
  control_calidad: "info",
  expedido: "info",
  entregado: "ok",
};

export const SIGNALS = "estados";

/** Pasos de la línea de seguimiento que ve el profesional. */
export const TIMELINE: { id: string; label: string; from: CaseState }[] = [
  { id: "recibido", label: "Recibido", from: "enviado" },
  { id: "revisado", label: "Revisado", from: "validado" },
  { id: "diseno", label: "Diseño", from: "diseno_aprobado" },
  { id: "fabricando", label: "Fabricando", from: "en_fabricacion" },
  { id: "controlado", label: "Controlado", from: "control_calidad" },
  { id: "enviado", label: "Enviado", from: "expedido" },
  { id: "entregado", label: "Entregado", from: "entregado" },
];

export type Actividad = "sedentaria" | "caminar" | "intenso";
export type TipoPlantilla = "deportiva" | "diario" | "descarga";
export type MaterialPref = "sin_preferencia" | "eva_blando" | "eva_medio" | "pa11" | "resina" | "carbono";
export type ModoServicio = "fabricacion" | "shell";

export const ACTIVIDADES: { id: Actividad; label: string }[] = [
  { id: "sedentaria", label: "Sedentaria" },
  { id: "caminar", label: "Camina a diario" },
  { id: "intenso", label: "Deporte intenso" },
];

export const TIPOS: { id: TipoPlantilla; label: string }[] = [
  { id: "deportiva", label: "Deportiva" },
  { id: "diario", label: "Uso diario" },
  { id: "descarga", label: "Descarga" },
];

export const MATERIALES: { id: MaterialPref; label: string }[] = [
  { id: "sin_preferencia", label: "Sin preferencia" },
  { id: "eva_blando", label: "EVA blando (muy amortiguado)" },
  { id: "eva_medio", label: "EVA de densidad media" },
  { id: "pa11", label: "PA11" },
  { id: "resina", label: "Resina" },
  { id: "carbono", label: "Fibra de carbono" },
];

export const CALZADOS = ["Zapatilla deportiva", "Zapato cerrado", "Zapato de vestir", "Bota de trabajo", "Sandalia o calzado abierto"];

export const MODOS: { id: ModoServicio; label: string }[] = [
  { id: "fabricacion", label: "Fabricación completa" },
  { id: "shell", label: "Solo el shell" },
];

export interface Prescription {
  iniciales: string;
  lado: Side;
  talla: number;
  peso: number;
  tipo: TipoPlantilla;
  actividad: Actividad;
  calzado: string;
  material: MaterialPref;
  modo: ModoServicio;
  observaciones: string;
}

/** Ficha precargada con el escenario de la demo (editable). */
export const DEMO_RX: Prescription = {
  iniciales: "J.M.",
  lado: "derecho",
  talla: 42,
  peso: 82,
  tipo: "deportiva",
  actividad: "intenso",
  calzado: "Zapatilla deportiva",
  material: "eva_blando",
  modo: "fabricacion",
  observaciones: "Dolor en el talón al correr. Pádel tres veces por semana.",
};

export const BLANK_RX: Prescription = {
  iniciales: "",
  lado: "derecho",
  talla: 42,
  peso: 70,
  tipo: "diario",
  actividad: "caminar",
  calzado: "Zapato cerrado",
  material: "sin_preferencia",
  modo: "fabricacion",
  observaciones: "",
};

/** Mensaje «desordenado» de ejemplo y la ficha que se deduce de él (guionizado). */
export const MESSY_MESSAGE =
  "Hola, os paso un caso: J.M., 82 kg, juega al pádel tres veces por semana y le duele el talón derecho al correr. Zapatilla deportiva, talla 42. Yo pondría algo blandito tipo EVA. Un abrazo, Marta";

export const MESSY_RESULT: Partial<Prescription> = {
  iniciales: "J.M.",
  lado: "derecho",
  talla: 42,
  peso: 82,
  tipo: "deportiva",
  actividad: "intenso",
  calzado: "Zapatilla deportiva",
  material: "eva_blando",
  observaciones: "Dolor en el talón al correr. Pádel tres veces por semana.",
};

export type ScanSampleId = "A" | "B";

export interface ScanSample {
  id: ScanSampleId;
  title: string;
  blurb: string;
  side: Side;
  hole: boolean;
}

export const SAMPLES: ScanSample[] = [
  { id: "A", title: "Escaneo de ejemplo A", blurb: "Con fallo a propósito: falta superficie en el talón", side: "derecho", hole: true },
  { id: "B", title: "Escaneo de ejemplo B", blurb: "Correcto", side: "derecho", hole: false },
];

export interface ScanCheck {
  id: string;
  label: string;
  status: "ok" | "warn" | "bad";
  detail: string;
}

export interface ScanAnalysis {
  status: "verde" | "ambar" | "rojo";
  checks: ScanCheck[];
  /** Datos medidos sobre un STL real cargado por el usuario (función opcional) */
  custom?: CustomScanInfo;
  holeDiameterMm?: number;
}

export interface CustomScanInfo {
  name: string;
  triangles: number;
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  watertight: boolean;
}

export interface Clarification {
  id: string;
  question: string;
  detail: string;
  options: { id: "mantener" | "pa11"; label: string; sub: string }[];
}

export type Ruta = "impresion_3d" | "fresado" | "termoconformado" | "por_confirmar";

export interface SpecProposal {
  ruta: Ruta;
  rutaLabel: string;
  material: string;
  rigidez: string;
  forro: string;
  largo: "completa" | "tres_cuartos";
  modo: ModoServicio;
  reasons: string[];
}

export interface DesignVersion {
  id: number;
  by: string;
  at: number;
  note: string;
  params: InsoleParams;
}

export interface Incident {
  id: number;
  tipo: "reescaneo" | "aclaracion" | "retoque" | "rehecho";
  causa: "escaneo" | "prescripcion" | "diseno" | "material" | "fabricacion" | "transporte" | "otra";
  nota: string;
  auto: boolean;
}

export const INCIDENT_TIPO_LABEL: Record<Incident["tipo"], string> = {
  reescaneo: "Reescaneo",
  aclaracion: "Aclaración",
  retoque: "Retoque",
  rehecho: "Pieza rehecha",
};

export const INCIDENT_CAUSA_LABEL: Record<Incident["causa"], string> = {
  escaneo: "Escaneo",
  prescripcion: "Prescripción",
  diseno: "Diseño",
  material: "Material",
  fabricacion: "Fabricación",
  transporte: "Transporte",
  otra: "Otra",
};

export interface CaseEvent {
  state: CaseState;
  at: number;
  note?: string;
}

export interface DemoCase {
  code: string;
  rx: Prescription;
  scan: {
    sample: ScanSampleId | "custom" | null;
    analysis: ScanAnalysis | null;
    /** Intentos de escaneo, en orden */
    attempts: string[];
  };
  clarification: { item: Clarification | null; answer: "mantener" | "pa11" | null };
  spec: { proposal: SpecProposal | null; final: SpecProposal | null; accepted: boolean; edits: string[] };
  design: {
    versions: DesignVersion[];
    draft: InsoleParams | null;
    approved: { by: string; at: number; versionId: number } | null;
  };
  state: CaseState;
  events: CaseEvent[];
  incidents: Incident[];
  submitted: boolean;
}

export const DEMO_CASE_CODE = "ZP-0420";
export const TECNICO_DEMO = "Técnico del laboratorio (ejemplo)";
export const PROFESIONAL_DEMO = "Marta, podóloga (ejemplo)";
export const CLINICA_DEMO = "Clínica Ejemplo";
