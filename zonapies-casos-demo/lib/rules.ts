/**
 * Reglas de la demo. TODAS son EJEMPLOS marcados como no validados: ninguna procede de Zona Pies
 * ni es clínica. En la app real viven en un editor versionado con la marca `validated`.
 */
import {
  FOOT_LENGTH_MM,
  DEFAULT_PARAMS,
  type InsoleParams,
  type Side,
} from "./geometry";
import type {
  Clarification,
  CustomScanInfo,
  Prescription,
  Ruta,
  ScanAnalysis,
  ScanCheck,
  ScanSample,
  SpecProposal,
} from "./domain";

export const RULES_VALIDATED = false;
export const RULES_NOTICE = "Reglas y valores de ejemplo, pendientes de validar por Zona Pies.";

/** Perfiles de proceso de ejemplo (grosor mínimo del shell). */
export const PROCESS_PROFILES: Record<Ruta, { label: string; minMm: number }> = {
  impresion_3d: { label: "Impresión 3D (PA11)", minMm: 2.0 },
  fresado: { label: "Fresado (EVA)", minMm: 3.0 },
  termoconformado: { label: "Termoconformado (resina)", minMm: 1.8 },
  por_confirmar: { label: "Proceso por confirmar", minMm: 1.2 },
};

/** Longitud de pie esperada para una talla (aproximación de ejemplo). */
export const expectedLengthMm = (talla: number) => 6.667 * talla - 10;

function statusOf(checks: ScanCheck[]): ScanAnalysis["status"] {
  if (checks.some((c) => c.status === "bad")) return "rojo";
  if (checks.some((c) => c.status === "warn")) return "ambar";
  return "verde";
}

/** Comprobaciones de escala y lado comunes a cualquier escaneo. */
function commonChecks(side: Side, lengthMm: number, rx: Prescription): ScanCheck[] {
  const checks: ScanCheck[] = [];
  checks.push(
    side === rx.lado
      ? { id: "lado", label: `Pie ${side} detectado`, status: "ok", detail: "Coincide con el lado indicado en la ficha." }
      : {
          id: "lado",
          label: "Lado incoherente",
          status: "bad",
          detail: `El archivo parece un pie ${side}, pero en la ficha has indicado ${rx.lado}. Revisa cuál has escaneado.`,
        },
  );
  const expected = expectedLengthMm(rx.talla);
  const diff = Math.abs(lengthMm - expected);
  checks.push(
    diff <= 15
      ? {
          id: "escala",
          label: "Escala coherente con la talla",
          status: "ok",
          detail: `Longitud del pie ≈ ${Math.round(lengthMm)} mm, razonable para la talla ${rx.talla} (regla de ejemplo).`,
        }
      : {
          id: "escala",
          label: "La escala no cuadra con la talla",
          status: "warn",
          detail: `Longitud ≈ ${Math.round(lengthMm)} mm frente a unos ${Math.round(expected)} mm esperables para la talla ${rx.talla}. Revisa la talla o la escala del escáner.`,
        },
  );
  return checks;
}

/** Análisis (simulado) de uno de los dos escaneos de ejemplo. */
export function analyzeSample(sample: ScanSample, rx: Prescription): ScanAnalysis {
  const checks = commonChecks(sample.side, FOOT_LENGTH_MM, rx);
  const holeDiameterMm = sample.hole ? 34 : undefined;
  if (sample.hole) {
    checks.push({
      id: "talon",
      label: "Zona del talón sin captar",
      status: "bad",
      detail: `Hay un hueco de unos ${holeDiameterMm} mm en la planta, bajo el talón. Repite el escaneo ahora: el paciente sigue contigo.`,
    });
    checks.push({
      id: "malla",
      label: "Malla con hueco abierto",
      status: "bad",
      detail: "Con un hueco abierto en la planta no se puede generar el diseño.",
    });
  } else {
    checks.push({ id: "talon", label: "Talón y planta completos", status: "ok", detail: "Toda la superficie plantar está captada." });
    checks.push({ id: "malla", label: "Malla sin huecos", status: "ok", detail: "La superficie es continua y apta para diseñar." });
  }
  checks.push({ id: "dedos", label: "Dedos y antepié captados", status: "ok", detail: "Cobertura correcta de la parte delantera del pie." });
  return { status: statusOf(checks), checks, holeDiameterMm };
}

/** Análisis de un STL real cargado por el usuario: las MEDIDAS son reales, el resto sigue simulado. */
export function analyzeCustom(info: CustomScanInfo, rx: Prescription): ScanAnalysis {
  const checks: ScanCheck[] = [];
  const plausible = info.lengthMm >= 150 && info.lengthMm <= 340;
  checks.push(
    plausible
      ? {
          id: "unidades",
          label: "Unidades y escala plausibles",
          status: "ok",
          detail: `Longitud medida: ${info.lengthMm.toFixed(0)} mm (dentro de 150–340 mm).`,
        }
      : {
          id: "unidades",
          label: "Escala sospechosa",
          status: "bad",
          detail: `Longitud medida: ${info.lengthMm.toFixed(1)} mm. Fuera de 150–340 mm: puede estar en centímetros o en otra escala.`,
        },
  );
  if (plausible) {
    const expected = expectedLengthMm(rx.talla);
    const diff = Math.abs(info.lengthMm - expected);
    checks.push(
      diff <= 15
        ? { id: "talla", label: "Coherente con la talla indicada", status: "ok", detail: `Esperable ≈ ${Math.round(expected)} mm para la talla ${rx.talla} (regla de ejemplo).` }
        : { id: "talla", label: "No cuadra con la talla indicada", status: "warn", detail: `Esperable ≈ ${Math.round(expected)} mm para la talla ${rx.talla}.` },
    );
  }
  checks.push(
    info.watertight
      ? { id: "malla", label: "Malla cerrada (estanca)", status: "ok", detail: "Todas las aristas pertenecen a dos triángulos." }
      : {
          id: "malla",
          label: "Malla abierta",
          status: "warn",
          detail: "Hay aristas sueltas (huecos o bordes). Es normal en escaneos de la planta: la versión real lo evaluaría por zonas.",
        },
  );
  checks.push({
    id: "simulado",
    label: "Resto del análisis simulado",
    status: "warn",
    detail: "Lado, cobertura de talón y antepié no se calculan en la demo con archivos propios.",
  });
  return { status: statusOf(checks), checks, custom: info };
}

/** Regla de ejemplo: deporte intenso + material muy blando ⇒ pedir confirmación. */
export function needsClarification(rx: Prescription): Clarification | null {
  if (rx.actividad === "intenso" && rx.material === "eva_blando") {
    return {
      id: "material_actividad",
      question: "Indicas deporte intenso y un material muy blando (EVA blando). ¿Lo mantienes?",
      detail: "Regla de ejemplo del laboratorio: con actividad intensa y un material muy blando se pide confirmación antes de fabricar.",
      options: [
        { id: "mantener", label: "Mantener EVA blando", sub: "Lo tengo claro, adelante" },
        { id: "pa11", label: "Cambiar a PA11", sub: "Propuesta del laboratorio" },
      ],
    };
  }
  return null;
}

/** Materiales entre los que el técnico puede cambiar la propuesta. */
export const SPEC_MATERIALS: { material: string; ruta: Ruta; rutaLabel: string; rigidez: string }[] = [
  { material: "EVA", ruta: "fresado", rutaLabel: "Fresado", rigidez: "Densidad media" },
  { material: "PA11", ruta: "impresion_3d", rutaLabel: "Impresión 3D", rigidez: "Rigidez media" },
  { material: "Resina", ruta: "termoconformado", rutaLabel: "Termoconformado", rigidez: "Rigidez alta" },
  { material: "Fibra de carbono", ruta: "por_confirmar", rutaLabel: "Proceso por confirmar", rigidez: "Rigidez muy alta" },
];

export const SPEC_FORROS = ["Memory", "Forro estándar", "Sin forro (lo coloca el profesional)"];

const MATERIAL_ROUTE: Record<string, { ruta: Ruta; label: string; material: string; rigidez: string }> = {
  eva_blando: { ruta: "fresado", label: "Fresado", material: "EVA", rigidez: "Densidad baja" },
  eva_medio: { ruta: "fresado", label: "Fresado", material: "EVA", rigidez: "Densidad media" },
  pa11: { ruta: "impresion_3d", label: "Impresión 3D", material: "PA11", rigidez: "Rigidez media" },
  resina: { ruta: "termoconformado", label: "Termoconformado", material: "Resina", rigidez: "Rigidez alta" },
  carbono: { ruta: "por_confirmar", label: "Proceso por confirmar", material: "Fibra de carbono", rigidez: "Rigidez muy alta" },
};

/** Propuesta de especificación por reglas de ejemplo (el técnico confirma o cambia). */
export function proposeSpec(rx: Prescription): SpecProposal {
  const reasons: string[] = [];
  let key = rx.material;
  if (key === "sin_preferencia") {
    if (rx.tipo === "deportiva" || rx.actividad === "intenso") {
      key = "pa11";
      reasons.push("Sin material indicado y con perfil deportivo: se propone PA11 (flexibilidad y resistencia).");
    } else if (rx.tipo === "descarga") {
      key = "eva_blando";
      reasons.push("Plantilla de descarga sin material indicado: se propone EVA de baja densidad.");
    } else {
      key = "eva_medio";
      reasons.push("Uso diario sin material indicado: se propone EVA de densidad media.");
    }
  } else {
    reasons.push(`Material elegido por el profesional: ${MATERIAL_ROUTE[key].material}.`);
  }
  const m = MATERIAL_ROUTE[key];
  const shell = rx.modo === "shell";
  const forro = shell ? "Sin forro (lo coloca el profesional)" : key === "eva_blando" ? "Memory" : rx.tipo === "deportiva" ? "Memory" : "Forro estándar";
  if (shell) reasons.push("Servicio «solo shell»: se entrega sin forro.");
  const largo: "completa" | "tres_cuartos" =
    rx.tipo === "diario" && rx.calzado === "Zapato de vestir" ? "tres_cuartos" : "completa";
  reasons.push(
    largo === "tres_cuartos"
      ? "Zapato de vestir: se propone largo ¾ para que quepa."
      : "Se propone largo completo.",
  );
  if (m.ruta === "por_confirmar") {
    reasons.push("El proceso de la fibra de carbono está por confirmar con Zona Pies.");
  } else {
    reasons.push("Ruta de fabricación deducida del material (por confirmar con Zona Pies).");
  }
  return {
    ruta: m.ruta,
    rutaLabel: m.label,
    material: m.material,
    rigidez: m.rigidez,
    forro,
    largo,
    modo: rx.modo,
    reasons,
  };
}

const BASE_BY_ROUTE: Record<Ruta, number> = { impresion_3d: 3, fresado: 4, termoconformado: 2.6, por_confirmar: 2 };

/** Parámetros iniciales del borrador (en la app real, deducidos de la prescripción con apoyo de IA). */
export function initialParams(rx: Prescription, spec: SpecProposal): InsoleParams {
  const p: InsoleParams = { ...DEFAULT_PARAMS };
  p.largo = spec.largo;
  p.grosorBase = BASE_BY_ROUTE[spec.ruta];
  p.grosorForro = spec.forro.startsWith("Sin forro") ? 0 : 1.5;
  if (rx.tipo === "deportiva") {
    p.arcoAltura = 9;
    p.cazoletaProf = 12;
    p.barraAltura = 2.5;
  } else if (rx.tipo === "descarga") {
    p.arcoAltura = 6;
    p.cazoletaProf = 11;
    p.barraAltura = 4.5;
  } else {
    p.arcoAltura = 7;
    p.cazoletaProf = 9;
    p.barraAltura = 3;
  }
  return p;
}

/** Sugerencia de causa de una incidencia a partir del texto (simulada con palabras clave). */
export function suggestCause(text: string) {
  const t = text.toLowerCase();
  if (/escane|hueco|talón|talon|malla/.test(t)) return "escaneo" as const;
  if (/ficha|prescrip|dato|falta|peso|talla/.test(t)) return "prescripcion" as const;
  if (/arco|diseñ|diseno|cazoleta|cuña|cuna/.test(t)) return "diseno" as const;
  if (/material|blando|duro|eva|pa11|resina/.test(t)) return "material" as const;
  if (/rotur|acabado|borde|fabric/.test(t)) return "fabricacion" as const;
  if (/envío|envio|transporte|mensajer|retras/.test(t)) return "transporte" as const;
  return "otra" as const;
}
