"use client";

/**
 * Almacén de la demo: contexto + reductor, persistido en sessionStorage.
 * Todo vive en el navegador: no sale ningún dato.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type Dispatch, type ReactNode } from "react";
import * as L from "./caseLogic";
import {
  BLANK_RX,
  MESSY_RESULT,
  type CaseState,
  type CustomScanInfo,
  type DemoCase,
  type Incident,
  type Prescription,
  type ScanSampleId,
  type SpecProposal,
  type View,
} from "./domain";
import type { InsoleParams } from "./geometry";
import { TOUR } from "./content";

export type ProfScreen = "lista" | "nuevo" | "detalle";
export type LabTab = "resumen" | "especificacion" | "diseno" | "fabricacion";
export type Busy = null | "scan" | "review" | "ia";
export type SurveyAnswer = "si" | "ajustar" | "no" | null;

export interface DemoState {
  ready: boolean;
  view: View;
  tour: { active: boolean; step: number; expanded: boolean };
  profScreen: ProfScreen;
  labTab: LabTab;
  labSelected: string | null;
  case: DemoCase;
  notes: Record<string, string>;
  survey: Record<string, { answer: SurveyAnswer; comment: string }>;
  sheetOpen: boolean;
  publicOpen: boolean;
  /** Campos rellenados por la «IA» simulada (se resaltan en la ficha) */
  aiFilled: string[];
  busy: Busy;
}

const STORAGE_KEY = "zp-casos-demo-v1";

export const initialState = (): DemoState => ({
  ready: false,
  view: "inicio",
  tour: { active: false, step: 0, expanded: true },
  profScreen: "lista",
  labTab: "resumen",
  labSelected: null,
  case: L.newCase({ ...BLANK_RX }),
  notes: {},
  survey: {},
  sheetOpen: false,
  publicOpen: false,
  aiFilled: [],
  busy: null,
});

type Action =
  | { type: "hydrate"; state: Partial<DemoState> }
  | { type: "view"; view: View }
  | { type: "tour"; patch: Partial<DemoState["tour"]> }
  | { type: "profScreen"; screen: ProfScreen }
  | { type: "labTab"; tab: LabTab }
  | { type: "labSelect"; code: string | null }
  | { type: "busy"; busy: Busy }
  | { type: "rx"; patch: Partial<Prescription>; at: number }
  | { type: "aiFill"; at: number }
  | { type: "scan"; id: ScanSampleId; at: number }
  | { type: "scanCustom"; info: CustomScanInfo; at: number }
  | { type: "submit"; at: number }
  | { type: "review"; at: number }
  | { type: "answer"; option: "mantener" | "pa11"; at: number }
  | { type: "specSet"; patch: Partial<SpecProposal>; edit: string }
  | { type: "specAccept"; at: number }
  | { type: "draft"; params: InsoleParams }
  | { type: "saveVersion"; note: string; at: number }
  | { type: "approve"; at: number }
  | { type: "reopen"; at: number }
  | { type: "advance"; at: number }
  | { type: "incident"; incident: Omit<Incident, "id" | "auto"> }
  | { type: "ensure"; target: CaseState; at: number }
  | { type: "newCase" }
  | { type: "overlay"; sheet?: boolean; publicLink?: boolean }
  | { type: "note"; id: string; text: string }
  | { type: "survey"; id: string; answer?: SurveyAnswer; comment?: string }
  | { type: "clearNotes" }
  | { type: "reset" };

function reduce(s: DemoState, a: Action): DemoState {
  const upd = (c: DemoCase): DemoState => ({ ...s, case: c });
  switch (a.type) {
    case "hydrate":
      return { ...s, ...a.state, busy: null, ready: true };
    case "view":
      return { ...s, view: a.view };
    case "tour":
      return { ...s, tour: { ...s.tour, ...a.patch } };
    case "profScreen":
      return { ...s, profScreen: a.screen };
    case "labTab":
      return { ...s, labTab: a.tab };
    case "labSelect":
      return { ...s, labSelected: a.code, labTab: a.code ? s.labTab : "resumen" };
    case "busy":
      return { ...s, busy: a.busy };
    case "rx":
      return { ...upd(L.patchRx(s.case, a.patch, a.at)), aiFilled: s.aiFilled.filter((k) => !(k in a.patch)) };
    case "aiFill":
      return {
        ...upd(L.patchRx(s.case, MESSY_RESULT, a.at)),
        aiFilled: Object.keys(MESSY_RESULT),
        busy: null,
      };
    case "scan":
      return { ...upd(L.scanSample(s.case, a.id, a.at)), busy: null };
    case "scanCustom":
      return { ...upd(L.scanCustom(s.case, a.info, a.at)), busy: null };
    case "submit":
      return upd(L.submitCase(s.case, a.at));
    case "review":
      return { ...upd(L.reviewCase(s.case, a.at)), busy: null };
    case "answer":
      return upd(L.answerCase(s.case, a.option, a.at));
    case "specSet":
      return upd(L.specSet(s.case, a.patch, a.edit));
    case "specAccept":
      return { ...upd(L.specAccept(s.case, a.at)), labTab: "diseno" };
    case "draft":
      return upd(L.setDraft(s.case, a.params));
    case "saveVersion":
      return upd(L.saveVersion(s.case, a.note, a.at));
    case "approve":
      return upd(L.approveDesign(s.case, a.at));
    case "reopen":
      return upd(L.reopenDesign(s.case, a.at));
    case "advance":
      return upd(L.advanceCase(s.case, a.at));
    case "incident":
      return upd(L.addIncident(s.case, a.incident));
    case "ensure":
      return upd(L.ensureState(s.case, a.target, a.at));
    case "newCase":
      return { ...s, case: L.newCase({ ...BLANK_RX }), aiFilled: [], profScreen: "nuevo", labSelected: null, labTab: "resumen" };
    case "overlay":
      return {
        ...s,
        sheetOpen: a.sheet ?? s.sheetOpen,
        publicOpen: a.publicLink ?? s.publicOpen,
      };
    case "note":
      return { ...s, notes: { ...s.notes, [a.id]: a.text } };
    case "survey": {
      const cur = s.survey[a.id] ?? { answer: null, comment: "" };
      return {
        ...s,
        survey: {
          ...s.survey,
          [a.id]: { answer: a.answer === undefined ? cur.answer : a.answer, comment: a.comment ?? cur.comment },
        },
      };
    }
    case "clearNotes":
      return { ...s, notes: {}, survey: {} };
    case "reset": {
      // Reinicia la simulación, pero conserva las notas y respuestas de la reunión.
      const fresh = initialState();
      return { ...fresh, ready: true, notes: s.notes, survey: s.survey };
    }
    default:
      return s;
  }
}

interface Ctx {
  state: DemoState;
  dispatch: Dispatch<Action>;
  actions: ReturnType<typeof makeActions>;
}

const DemoContext = createContext<Ctx | null>(null);

function makeActions(dispatch: Dispatch<Action>) {
  const now = () => Date.now();
  return {
    runScan(id: ScanSampleId) {
      dispatch({ type: "busy", busy: "scan" });
      window.setTimeout(() => dispatch({ type: "scan", id, at: now() }), 700);
    },
    runScanCustom(info: CustomScanInfo) {
      dispatch({ type: "busy", busy: "scan" });
      window.setTimeout(() => dispatch({ type: "scanCustom", info, at: now() }), 500);
    },
    interpretMessage() {
      dispatch({ type: "busy", busy: "ia" });
      window.setTimeout(() => dispatch({ type: "aiFill", at: now() }), 1100);
    },
    submit() {
      dispatch({ type: "submit", at: now() });
      dispatch({ type: "busy", busy: "review" });
      window.setTimeout(() => dispatch({ type: "review", at: now() }), 1200);
    },
    advanceTo(target: CaseState) {
      dispatch({ type: "ensure", target, at: now() });
    },
  };
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reduce, undefined, initialState);
  const actions = useMemo(() => makeActions(dispatch), []);
  const hydrated = useRef(false);

  // Hidratación tras el primer render (evita desajustes con el HTML estático).
  useEffect(() => {
    let saved: Partial<DemoState> | null = null;
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) saved = JSON.parse(raw) as Partial<DemoState>;
    } catch {
      saved = null;
    }
    dispatch({ type: "hydrate", state: saved ?? {} });
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current || !state.ready) return;
    try {
      const { ready: _r, busy: _b, ...rest } = state;
      void _r;
      void _b;
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
    } catch {
      /* sin almacenamiento: la demo sigue funcionando */
    }
  }, [state]);

  const value = useMemo(() => ({ state, dispatch, actions }), [state, actions]);
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo(): Ctx {
  const v = useContext(DemoContext);
  if (!v) throw new Error("useDemo fuera de DemoProvider");
  return v;
}

/** Atajo para los pasos del recorrido guiado. */
export function useTourControls() {
  const { state, dispatch, actions } = useDemo();
  const step = TOUR[state.tour.step];
  const goto = useCallback(
    (i: number) => {
      const idx = Math.max(0, Math.min(TOUR.length - 1, i));
      const t = TOUR[idx];
      dispatch({ type: "tour", patch: { active: true, step: idx } });
      dispatch({ type: "view", view: t.view });
      if (t.view === "profesional") dispatch({ type: "profScreen", screen: idx === 1 || idx === 2 ? "nuevo" : "detalle" });
      if (t.view === "laboratorio") {
        dispatch({ type: "labSelect", code: "ZP-0420" });
        dispatch({ type: "labTab", tab: t.id === "diseno" ? "diseno" : "resumen" });
      }
    },
    [dispatch],
  );
  return { state, step, goto, dispatch, actions };
}
