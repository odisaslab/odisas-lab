"use client";

import { NEEDS_FROM_CLIENT, REAL_VS_SIMULATED, TOUR } from "@/lib/content";
import { buildNotesMarkdown } from "@/lib/exportNotes";
import { downloadBlob } from "@/lib/stl";
import { useDemo } from "@/lib/store";
import { Callout, Card, Chip, Eyebrow, Icon, btn } from "../ui";
import type { Tone } from "@/lib/domain";

const HERE: Record<string, { tone: Tone; label: string }> = {
  real: { tone: "ok", label: "Real en la demo" },
  ejemplo: { tone: "warn", label: "Ejemplo" },
  simulado: { tone: "muted", label: "Simulado" },
};

const ANSWER: Record<string, { tone: Tone; label: string }> = {
  si: { tone: "ok", label: "Cuadra" },
  ajustar: { tone: "warn", label: "Habría que ajustarlo" },
  no: { tone: "bad", label: "No cuadra" },
};

export function Acerca() {
  const { state, dispatch } = useDemo();
  const answered = TOUR.filter((t) => state.survey[t.id]?.answer).length;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:py-12">
      <Eyebrow>Transparencia</Eyebrow>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Qué es real y qué es simulado</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Casi todo lo que has visto es una maqueta. Lo único que se calcula de verdad es la geometría de la plantilla, y aun así es una aproximación.
      </p>

      <div data-tour="cierre" className="mt-8 grid gap-6 lg:grid-cols-5">
        <Card className="overflow-x-auto lg:col-span-3" aria-labelledby="real-h">
          <h2 id="real-h" className="text-lg font-semibold">
            Pieza por pieza
          </h2>
          <ul className="mt-4 divide-y divide-line">
            {REAL_VS_SIMULATED.map((r) => (
              <li key={r.piece} className="grid gap-2 py-4 sm:grid-cols-[1fr_auto] sm:gap-4">
                <div>
                  <p className="font-medium">{r.piece}</p>
                  <p className="mt-1 text-sm text-muted">
                    <b className="text-fg">En la demo:</b> {r.demo}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    <b className="text-fg">En la versión real:</b> {r.real}
                  </p>
                </div>
                <div className="sm:text-right">
                  <Chip tone={HERE[r.here].tone} icon={false}>
                    {HERE[r.here].label}
                  </Chip>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <div className="grid content-start gap-6 lg:col-span-2">
          <Card aria-labelledby="needs-h">
            <h2 id="needs-h" className="text-lg font-semibold">
              Lo que necesitamos de vosotros
            </h2>
            <p className="mt-1 text-sm text-muted">Con esto, la versión real pasa de datos sintéticos a datos vuestros.</p>
            <ol className="mt-4 list-decimal space-y-2.5 pl-5 text-sm leading-snug">
              {NEEDS_FROM_CLIENT.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ol>
          </Card>

          <Card aria-labelledby="notas-h">
            <h2 id="notas-h" className="text-lg font-semibold">
              Vuestra opinión
            </h2>
            <p className="mt-1 text-sm text-muted" data-testid="survey-count">
              {answered} de {TOUR.length} pantallas valoradas.
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {TOUR.map((t) => {
                const sv = state.survey[t.id];
                return (
                  <li key={t.id} className="flex flex-wrap items-center gap-2">
                    <span className="min-w-0 flex-1 truncate">{t.title}</span>
                    {sv?.answer ? <Chip tone={ANSWER[sv.answer].tone}>{ANSWER[sv.answer].label}</Chip> : <span className="text-xs text-muted">Sin responder</span>}
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className={btn("primary", "sm")}
                onClick={() => downloadBlob("notas-reunion-zonapies.md", buildNotesMarkdown(state), "text/markdown;charset=utf-8")}
                data-testid="export-notes-acerca"
              >
                <Icon name="download" className="size-3.5" /> Exportar notas (.md)
              </button>
              <button type="button" className={btn("ghost", "sm")} onClick={() => dispatch({ type: "clearNotes" })}>
                Borrar notas
              </button>
            </div>
            <p className="mt-3 text-xs text-muted">Las notas se guardan solo en este navegador y no se envían a ningún sitio.</p>
          </Card>
        </div>
      </div>

      <div className="mt-8">
        <Callout tone="info" title="Reglas y datos de ejemplo">
          Ninguna regla, material ni parámetro de la demo procede de Zona Pies ni tiene validez clínica. En la app real viven en un editor versionado con marca de «validado», y todo diseño es un borrador hasta que un técnico lo aprueba.
        </Callout>
      </div>
    </div>
  );
}
