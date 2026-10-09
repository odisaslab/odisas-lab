"use client";

import { useState } from "react";
import {
  INCIDENT_CAUSA_LABEL,
  INCIDENT_TIPO_LABEL,
  STATE_LABEL,
  STATE_RANK,
  type CaseState,
  type Incident,
} from "@/lib/domain";
import { suggestCause } from "@/lib/rules";
import { useDemo } from "@/lib/store";
import { Callout, Card, Chip, ExampleChip, Field, Icon, btn, fmtDate } from "../../ui";

const NEXT: Partial<Record<CaseState, CaseState>> = {
  diseno_aprobado: "en_fabricacion",
  en_fabricacion: "control_calidad",
  control_calidad: "expedido",
  expedido: "entregado",
};

const QC = ["Pieza comprobada frente al diseño aprobado", "Acabado y bordes revisados", "Par correcto: pie izquierdo o derecho y etiqueta del caso"];

export function ShipPanel() {
  const { state, dispatch } = useDemo();
  const c = state.case;
  const next = NEXT[c.state];
  const [qc, setQc] = useState<boolean[]>([false, false, false]);
  const [tipo, setTipo] = useState<Incident["tipo"]>("retoque");
  const [causa, setCausa] = useState<Incident["causa"]>("otra");
  const [nota, setNota] = useState("");
  const [suggested, setSuggested] = useState(false);

  const early = STATE_RANK[c.state] < STATE_RANK.diseno_aprobado;

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card className="grid content-start gap-4">
        <h2 className="text-base font-semibold">Fabricación y envío</h2>
        {early ? (
          <Callout tone="muted" title="Todavía no se puede fabricar">
            Hay que validar el caso, aceptar la especificación y aprobar el diseño. Estado actual: <b>{STATE_LABEL[c.state]}</b>.
          </Callout>
        ) : (
          <>
            <p className="text-sm">
              Estado actual: <Chip tone="info" icon={false}>{STATE_LABEL[c.state]}</Chip>
            </p>
            {next ? (
              <button type="button" className={btn("primary", "md")} onClick={() => dispatch({ type: "advance", at: Date.now() })} data-testid="advance">
                <Icon name="arrow" /> Simular avance: pasar a «{STATE_LABEL[next]}»
              </button>
            ) : (
              <Callout tone="ok" title="Caso entregado">
                Fin del recorrido. Mira el panel del dueño para ver cómo queda registrado.
              </Callout>
            )}
            <p className="text-xs text-muted">«Simular avance» sustituye a las acciones reales del taller. Se refleja al instante en la vista del profesional.</p>

            {c.state === "control_calidad" ? (
              <fieldset className="grid gap-2 rounded-xl border border-line bg-bone-50 p-3">
                <legend className="px-1 text-sm font-semibold">Control de calidad</legend>
                {QC.map((q, i) => (
                  <label key={q} className="flex min-h-9 cursor-pointer items-start gap-2 text-sm">
                    <input type="checkbox" className="mt-1 size-4 accent-brand" checked={qc[i]} onChange={(e) => setQc(qc.map((v, k) => (k === i ? e.target.checked : v)))} />
                    {q}
                  </label>
                ))}
                <p className="text-xs text-muted">Lista de ejemplo; en la app real la define el laboratorio.</p>
              </fieldset>
            ) : null}
          </>
        )}

        <div>
          <h3 className="text-sm font-semibold">Cambios de estado</h3>
          <ol className="mt-2 grid gap-1.5 text-sm">
            {c.events.map((e, i) => (
              <li key={`${e.state}-${i}`} className="flex items-baseline justify-between gap-3">
                <span>{STATE_LABEL[e.state]}{e.note ? ` · ${e.note}` : ""}</span>
                <span className="font-mono text-xs text-muted">{fmtDate(e.at)}</span>
              </li>
            ))}
          </ol>
        </div>
      </Card>

      <Card className="grid content-start gap-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold">Incidencias</h2>
          <ExampleChip>Simulado</ExampleChip>
        </div>
        <ul className="grid gap-2" data-testid="incidents">
          {c.incidents.length === 0 ? <li className="text-sm text-muted">Sin incidencias.</li> : null}
          {c.incidents.map((i) => (
            <li key={i.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-bone-50 px-3 py-2 text-sm">
              <Chip tone="warn" icon={false}>
                {INCIDENT_TIPO_LABEL[i.tipo]}
              </Chip>
              <span className="text-muted">Causa:</span> <b>{INCIDENT_CAUSA_LABEL[i.causa]}</b>
              <span className="text-muted">· {i.nota}</span>
              {i.auto ? <span className="ml-auto text-[11px] text-muted">Automática</span> : null}
            </li>
          ))}
        </ul>

        <form
          className="grid gap-3 rounded-xl border border-line p-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!nota.trim()) return;
            dispatch({ type: "incident", incident: { tipo, causa, nota: nota.trim() } });
            setNota("");
            setSuggested(false);
          }}
        >
          <h3 className="text-sm font-semibold">Registrar una incidencia</h3>
          <Field label="Tipo" htmlFor="inc-tipo">
            <select id="inc-tipo" className="input" value={tipo} onChange={(e) => setTipo(e.target.value as Incident["tipo"])}>
              {Object.entries(INCIDENT_TIPO_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Qué ha pasado" htmlFor="inc-nota">
            <textarea id="inc-nota" className="input" rows={2} value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Ej.: el arco quedó alto y el paciente lo nota al caminar" data-testid="inc-nota" />
          </Field>
          <Field label="Causa" htmlFor="inc-causa" hint={suggested ? "Sugerencia simulada a partir del texto: confirma o cambia la causa." : undefined}>
            <select id="inc-causa" className="input" value={causa} onChange={(e) => setCausa(e.target.value as Incident["causa"])} data-testid="inc-causa">
              {Object.entries(INCIDENT_CAUSA_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </Field>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={btn("ghost", "sm")}
              disabled={!nota.trim()}
              onClick={() => {
                setCausa(suggestCause(nota));
                setSuggested(true);
              }}
              data-testid="suggest-cause"
            >
              <Icon name="sparkle" className="size-3.5" /> Sugerir causa (IA simulada)
            </button>
            <button type="submit" className={btn("primary", "sm")} disabled={!nota.trim()} data-testid="add-incident">
              Registrar
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
