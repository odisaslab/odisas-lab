"use client";

import { useState } from "react";
import { labGroup, SEED_CASES } from "@/lib/content";
import { CLINICA_DEMO, type CaseState } from "@/lib/domain";
import { useDemo, type LabTab } from "@/lib/store";
import { Callout, Card, Chip, Eyebrow, ExampleChip, Icon, StateChip, btn } from "../ui";
import { Resumen } from "./lab/Resumen";
import { SpecPanel } from "./lab/SpecPanel";
import { DesignEditor } from "./lab/DesignEditor";
import { ShipPanel } from "./lab/ShipPanel";

type Filter = "todos" | "listo" | "espera" | "repetir" | "curso";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "listo", label: "Listos" },
  { id: "espera", label: "Esperando" },
  { id: "repetir", label: "A repetir" },
  { id: "curso", label: "En curso" },
];

interface Row {
  code: string;
  lado: string;
  material: string;
  state: CaseState;
  clinic: string;
  since: string;
  demo: boolean;
}

const TABS: { id: LabTab; label: string }[] = [
  { id: "resumen", label: "Resumen" },
  { id: "especificacion", label: "Especificación" },
  { id: "diseno", label: "Diseño de la plantilla" },
  { id: "fabricacion", label: "Fabricación y envío" },
];

export function Laboratorio() {
  const { state, dispatch } = useDemo();
  const c = state.case;
  const [filter, setFilter] = useState<Filter>("todos");

  const demoRow: Row | null = c.submitted
    ? {
        code: c.code,
        lado: c.rx.lado,
        material: (c.spec.final ?? c.spec.proposal)?.material ?? "Por definir",
        state: c.state,
        clinic: CLINICA_DEMO,
        since: "ahora",
        demo: true,
      }
    : null;
  const rows: Row[] = [...(demoRow ? [demoRow] : []), ...SEED_CASES.map((s) => ({ ...s, demo: false }))];
  const count = (g: Filter) => rows.filter((r) => labGroup(r.state) === g).length;
  const shown = rows.filter((r) => filter === "todos" || labGroup(r.state) === filter);
  const selected = state.labSelected ?? (c.submitted ? c.code : null);
  const seedSel = SEED_CASES.find((s) => s.code === selected);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:py-8">
      <div className="flex flex-wrap items-center gap-3">
        <Eyebrow>Vista del laboratorio</Eyebrow>
        <ExampleChip>Casos de ejemplo salvo {c.code}</ExampleChip>
      </div>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Casos de hoy</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,400px)_1fr]">
        <section data-tour="lab-lista" aria-labelledby="lista-h" className="grid content-start gap-4 rounded-2xl">
          <Card className="grid gap-4">
            <h2 id="lista-h" className="sr-only">
              Lista de casos
            </h2>
            <div className="flex flex-wrap gap-2" aria-label="Resumen por colores" data-testid="lab-counters">
              <Chip tone="ok">Listos · {count("listo")}</Chip>
              <Chip tone="warn">Esperando respuesta · {count("espera")}</Chip>
              <Chip tone="bad">Escaneo a repetir · {count("repetir")}</Chip>
            </div>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar casos">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={filter === f.id}
                  onClick={() => setFilter(f.id)}
                  className="min-h-9 rounded-full border border-line-strong px-3 text-xs font-medium text-muted transition-colors hover:bg-bone-100 aria-pressed:border-ink-900 aria-pressed:bg-ink-900 aria-pressed:text-white"
                >
                  {f.label}
                </button>
              ))}
            </div>
            {!c.submitted ? (
              <Callout tone="muted" title="Aún no ha llegado ningún caso nuevo">
                <p>Vuelve a la vista Profesional, crea un caso y aparecerá aquí al enviarlo.</p>
                <button type="button" className={btn("ghost", "sm") + " mt-2"} onClick={() => dispatch({ type: "view", view: "profesional" })}>
                  Ir a la vista Profesional
                </button>
              </Callout>
            ) : null}
            <ul className="grid gap-2" data-testid="lab-list">
              {shown.map((r) => (
                <li key={r.code}>
                  <button
                    type="button"
                    aria-current={selected === r.code ? "true" : undefined}
                    onClick={() => dispatch({ type: "labSelect", code: r.code })}
                    data-testid={`row-${r.code}`}
                    className="grid w-full gap-1.5 rounded-xl border border-line bg-bone-50 p-3 text-left transition-colors hover:border-line-strong aria-[current=true]:border-brand aria-[current=true]:bg-[#eaf5f2]"
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold">{r.code}</span>
                        {r.demo ? (
                          <Chip tone="info" icon={false}>
                            Interactivo
                          </Chip>
                        ) : null}
                      </span>
                      <StateChip state={r.state} />
                    </span>
                    <span className="text-xs text-muted">
                      Pie {r.lado} · {r.material} · {r.clinic} · {r.since}
                    </span>
                  </button>
                </li>
              ))}
              {shown.length === 0 ? <li className="text-sm text-muted">Ningún caso con este filtro.</li> : null}
            </ul>
          </Card>
        </section>

        <section aria-label="Ficha del caso" className="min-w-0">
          {selected === c.code && c.submitted ? (
            <CaseDetail />
          ) : seedSel ? (
            <Card className="grid gap-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-mono text-xl font-semibold">{seedSel.code}</h2>
                <StateChip state={seedSel.state} />
              </div>
              <Callout tone="muted" title="Caso de ejemplo">
                En la demo solo el caso <b>{c.code}</b>, el que creas en la vista Profesional, es interactivo.
              </Callout>
            </Card>
          ) : (
            <Card className="grid place-items-center gap-2 py-16 text-center text-muted">
              <Icon name="file" className="size-8" />
              <p className="text-sm">Selecciona un caso de la lista para ver su ficha.</p>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}

function CaseDetail() {
  const { state, dispatch } = useDemo();
  const c = state.case;
  const tab = state.labTab;
  return (
    <div className="grid gap-4" data-testid="case-detail">
      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xl font-semibold">{c.code}</p>
          <p className="text-sm text-muted">
            Pie {c.rx.lado} · {c.rx.iniciales} · {CLINICA_DEMO}
          </p>
        </div>
        <StateChip state={c.state} />
      </Card>

      <div role="tablist" aria-label="Secciones de la ficha" className="flex gap-1 overflow-x-auto rounded-xl border border-line bg-bone-100 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => dispatch({ type: "labTab", tab: t.id })}
            data-testid={`lab-tab-${t.id}`}
            className="min-h-10 shrink-0 rounded-lg px-4 text-sm font-medium text-muted transition-colors hover:text-fg aria-selected:bg-white aria-selected:text-fg aria-selected:shadow-sm"
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "resumen" ? <Resumen /> : tab === "especificacion" ? <SpecPanel /> : tab === "diseno" ? <DesignEditor /> : <ShipPanel />}
    </div>
  );
}
