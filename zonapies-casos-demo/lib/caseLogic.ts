/**
 * Transiciones del caso de la demo: funciones puras, sin React.
 * La máquina de estados replica la de la app real (ver PROMPT-app-casos.md, sección 5).
 */
import {
  DEMO_CASE_CODE,
  DEMO_RX,
  SAMPLES,
  STATE_RANK,
  TECNICO_DEMO,
  type CaseState,
  type CustomScanInfo,
  type DemoCase,
  type Incident,
  type Prescription,
  type ScanSampleId,
  type SpecProposal,
} from "./domain";
import { analyzeCustom, analyzeSample, initialParams, needsClarification, proposeSpec } from "./rules";
import type { InsoleParams } from "./geometry";

const rank = (s: CaseState) => STATE_RANK[s];

export function newCase(rx: Prescription): DemoCase {
  return {
    code: DEMO_CASE_CODE,
    rx,
    scan: { sample: null, analysis: null, attempts: [] },
    clarification: { item: null, answer: null },
    spec: { proposal: null, final: null, accepted: false, edits: [] },
    design: { versions: [], draft: null, approved: null },
    state: "borrador",
    events: [],
    incidents: [],
    submitted: false,
  };
}

export function withState(c: DemoCase, state: CaseState, at: number, note?: string): DemoCase {
  if (c.state === state) return c;
  return { ...c, state, events: [...c.events, { state, at, note }] };
}

function addAutoIncident(c: DemoCase, inc: Omit<Incident, "id" | "auto">): DemoCase {
  if (c.incidents.some((i) => i.auto && i.tipo === inc.tipo)) return c;
  return { ...c, incidents: [...c.incidents, { ...inc, id: c.incidents.length + 1, auto: true }] };
}

/** Aplica el resultado del análisis del escaneo al estado del caso (solo antes de enviarlo). */
function settleScan(c: DemoCase, at: number): DemoCase {
  if (c.submitted || !c.scan.analysis) return c;
  const red = c.scan.analysis.status === "rojo";
  const note = !red && c.state === "escaneo_a_repetir" ? "Escaneo corregido" : undefined;
  let next = withState(c, red ? "escaneo_a_repetir" : "borrador", at, note);
  if (red) {
    const bad = c.scan.analysis.checks.find((k) => k.status === "bad");
    next = addAutoIncident(next, {
      tipo: "reescaneo",
      causa: "escaneo",
      nota: bad ? bad.label : "Escaneo a repetir",
    });
  }
  return next;
}

export function scanSample(c: DemoCase, id: ScanSampleId, at: number): DemoCase {
  const sample = SAMPLES.find((s) => s.id === id)!;
  const analysis = analyzeSample(sample, c.rx);
  const next: DemoCase = {
    ...c,
    scan: { sample: id, analysis, attempts: [...c.scan.attempts, id] },
  };
  return settleScan(next, at);
}

export function scanCustom(c: DemoCase, info: CustomScanInfo, at: number): DemoCase {
  const analysis = analyzeCustom(info, c.rx);
  const next: DemoCase = {
    ...c,
    scan: { sample: "custom", analysis, attempts: [...c.scan.attempts, `STL propio (${info.name})`] },
  };
  return settleScan(next, at);
}

/** Cambiar la ficha invalida las comprobaciones dependientes (lado, talla). */
export function patchRx(c: DemoCase, patch: Partial<Prescription>, at: number): DemoCase {
  const rx = { ...c.rx, ...patch };
  let next: DemoCase = { ...c, rx };
  if (c.submitted) return next;
  if (c.scan.sample === "A" || c.scan.sample === "B") {
    next = { ...next, scan: { ...next.scan, analysis: analyzeSample(SAMPLES.find((s) => s.id === c.scan.sample)!, rx) } };
    next = settleScan(next, at);
  } else if (c.scan.sample === "custom" && c.scan.analysis?.custom) {
    next = { ...next, scan: { ...next.scan, analysis: analyzeCustom(c.scan.analysis.custom, rx) } };
    next = settleScan(next, at);
  }
  return next;
}

export function submitCase(c: DemoCase, at: number): DemoCase {
  return withState({ ...c, submitted: true }, "enviado", at);
}

/** Revisión de la ficha con las reglas de ejemplo: o hay aclaración, o queda validado. */
export function reviewCase(c: DemoCase, at: number): DemoCase {
  const q = needsClarification(c.rx);
  if (q) {
    let next: DemoCase = { ...c, clarification: { item: q, answer: null } };
    next = withState(next, "esperando_aclaracion", at);
    return addAutoIncident(next, {
      tipo: "aclaracion",
      causa: "prescripcion",
      nota: "Material muy blando con actividad intensa",
    });
  }
  return withState({ ...c, spec: { ...c.spec, proposal: proposeSpec(c.rx) } }, "validado", at);
}

export function answerCase(c: DemoCase, option: "mantener" | "pa11", at: number): DemoCase {
  const rx: Prescription = option === "pa11" ? { ...c.rx, material: "pa11" } : c.rx;
  const next: DemoCase = {
    ...c,
    rx,
    clarification: { ...c.clarification, answer: option },
    spec: { ...c.spec, proposal: proposeSpec(rx) },
  };
  return withState(next, "validado", at);
}

export function specSet(c: DemoCase, patch: Partial<SpecProposal>, edit: string): DemoCase {
  const base = c.spec.final ?? c.spec.proposal;
  if (!base) return c;
  return {
    ...c,
    spec: { ...c.spec, final: { ...base, ...patch }, edits: [...c.spec.edits, edit] },
  };
}

export function specAccept(c: DemoCase, at: number): DemoCase {
  const final = c.spec.final ?? c.spec.proposal;
  if (!final) return c;
  const params = initialParams(c.rx, final);
  const next: DemoCase = {
    ...c,
    spec: { ...c.spec, final, accepted: true },
    design: {
      versions: [
        {
          id: 1,
          by: "Sistema · propuesta inicial (ejemplo)",
          at,
          note: "Parámetros iniciales deducidos de la prescripción",
          params,
        },
      ],
      draft: params,
      approved: null,
    },
  };
  return withState(next, "diseno_borrador", at);
}

export function setDraft(c: DemoCase, params: InsoleParams): DemoCase {
  return { ...c, design: { ...c.design, draft: params } };
}

const sameParams = (a: InsoleParams, b: InsoleParams) => JSON.stringify(a) === JSON.stringify(b);

export function saveVersion(c: DemoCase, note: string, at: number, by = TECNICO_DEMO): DemoCase {
  if (!c.design.draft) return c;
  const last = c.design.versions[c.design.versions.length - 1];
  if (last && sameParams(last.params, c.design.draft)) return c;
  const id = c.design.versions.length + 1;
  return {
    ...c,
    design: {
      ...c.design,
      versions: [...c.design.versions, { id, by, at, note, params: c.design.draft }],
    },
  };
}

export function approveDesign(c: DemoCase, at: number): DemoCase {
  if (!c.design.draft) return c;
  const saved = saveVersion(c, "Ajustes del técnico antes de aprobar", at);
  const last = saved.design.versions[saved.design.versions.length - 1];
  const next: DemoCase = {
    ...saved,
    design: { ...saved.design, approved: { by: TECNICO_DEMO, at, versionId: last.id } },
  };
  return withState(next, "diseno_aprobado", at);
}

export function reopenDesign(c: DemoCase, at: number): DemoCase {
  if (rank(c.state) > rank("diseno_aprobado")) return c;
  return withState({ ...c, design: { ...c.design, approved: null } }, "diseno_borrador", at);
}

const ADVANCE: CaseState[] = ["diseno_aprobado", "en_fabricacion", "control_calidad", "expedido", "entregado"];

export function advanceCase(c: DemoCase, at: number): DemoCase {
  const i = ADVANCE.indexOf(c.state);
  if (i < 0 || i >= ADVANCE.length - 1) return c;
  return withState(c, ADVANCE[i + 1], at);
}

export function addIncident(c: DemoCase, inc: Omit<Incident, "id" | "auto">): DemoCase {
  return { ...c, incidents: [...c.incidents, { ...inc, id: c.incidents.length + 1, auto: false }] };
}

/** Lleva el caso hacia delante hasta el estado indicado (para saltar pasos en la presentación). */
export function ensureState(c: DemoCase, target: CaseState, at: number): DemoCase {
  let x = c;
  let t = at;
  const tick = () => (t += 1);
  if (rank(x.state) >= rank(target) && x.submitted) return x;
  if (rank(target) <= rank("borrador")) return x;

  if (!x.submitted) {
    if (!x.rx.iniciales) x = { ...x, rx: { ...DEMO_RX } };
    x = scanSample(x, "A", tick());
    x = scanSample(x, "B", tick());
    x = submitCase(x, tick());
    x = reviewCase(x, tick());
  }
  if (x.state === "esperando_aclaracion" && rank(target) > rank("esperando_aclaracion")) {
    x = answerCase(x, "pa11", tick());
  }
  if (rank(target) >= rank("diseno_borrador") && rank(x.state) < rank("diseno_borrador")) {
    x = specAccept(x, tick());
  }
  if (rank(target) >= rank("diseno_aprobado") && rank(x.state) < rank("diseno_aprobado")) {
    x = approveDesign(x, tick());
  }
  while (rank(x.state) < rank(target) && rank(x.state) >= rank("diseno_aprobado")) {
    const before = x.state;
    x = advanceCase(x, tick());
    if (x.state === before) break;
  }
  return x;
}

/** Bucles del caso para el panel: incidencias automáticas y manuales. */
export function loopsOf(c: DemoCase) {
  return c.incidents;
}
