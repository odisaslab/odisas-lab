"use client";

import { useState } from "react";
import { MODOS, STATE_RANK, type SpecProposal } from "@/lib/domain";
import { RULES_NOTICE, SPEC_FORROS, SPEC_MATERIALS } from "@/lib/rules";
import { useDemo } from "@/lib/store";
import { Callout, Card, Chip, Field, Icon, Segmented, btn } from "../../ui";

function SpecTable({ spec }: { spec: SpecProposal }) {
  const rows: [string, string][] = [
    ["Ruta de fabricación", spec.rutaLabel],
    ["Material", spec.material],
    ["Rigidez / densidad", spec.rigidez],
    ["Forro", spec.forro],
    ["Largo", spec.largo === "completa" ? "Completa" : "¾"],
    ["Servicio", MODOS.find((m) => m.id === spec.modo)?.label ?? ""],
  ];
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm" data-testid="spec-table">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-muted">{k}</dt>
          <dd className="font-medium">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function SpecPanel() {
  const { state, dispatch } = useDemo();
  const c = state.case;
  const [editing, setEditing] = useState(false);
  const spec = c.spec.final ?? c.spec.proposal;

  if (!spec) {
    return (
      <Callout tone="muted" title="Todavía no hay propuesta de especificación">
        {STATE_RANK[c.state] < STATE_RANK.validado
          ? "La ficha tiene que pasar primero por las reglas del laboratorio (y, si hace falta, esperar la respuesta de la clínica)."
          : "No se ha podido generar la propuesta."}
      </Callout>
    );
  }

  const accepted = c.spec.accepted;
  const set = (patch: Partial<SpecProposal>, edit: string) => dispatch({ type: "specSet", patch, edit });

  return (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
      <Card className="grid content-start gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold">{accepted ? "Especificación aceptada" : "Propuesta de especificación"}</h2>
          <Chip tone="warn">{RULES_NOTICE}</Chip>
        </div>
        <SpecTable spec={spec} />

        {!accepted ? (
          <>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={btn("primary", "md")} onClick={() => dispatch({ type: "specAccept", at: Date.now() })} data-testid="spec-accept">
                <Icon name="check" /> Aceptar propuesta
              </button>
              <button type="button" className={btn("ghost", "md")} aria-expanded={editing} onClick={() => setEditing((v) => !v)} data-testid="spec-change">
                Cambiar
              </button>
            </div>
            {editing ? (
              <div className="grid gap-3 rounded-xl border border-line bg-bone-50 p-4" data-testid="spec-edit">
                <Field label="Material" htmlFor="sp-mat">
                  <select
                    id="sp-mat"
                    className="input"
                    value={spec.material}
                    onChange={(e) => {
                      const m = SPEC_MATERIALS.find((x) => x.material === e.target.value);
                      if (m) set({ material: m.material, ruta: m.ruta, rutaLabel: m.rutaLabel, rigidez: m.rigidez }, `Material: ${spec.material} → ${m.material}`);
                    }}
                  >
                    {SPEC_MATERIALS.map((m) => (
                      <option key={m.material}>{m.material}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Forro" htmlFor="sp-forro">
                  <select id="sp-forro" className="input" value={spec.forro} onChange={(e) => set({ forro: e.target.value }, `Forro: ${spec.forro} → ${e.target.value}`)}>
                    {SPEC_FORROS.map((f) => (
                      <option key={f}>{f}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Largo">
                  <Segmented
                    label="Largo"
                    value={spec.largo}
                    onChange={(v) => set({ largo: v }, `Largo: ${spec.largo} → ${v}`)}
                    options={[
                      { id: "completa", label: "Completa" },
                      { id: "tres_cuartos", label: "¾" },
                    ]}
                  />
                </Field>
                <p className="text-xs text-muted">Cada cambio queda registrado y se verá en el historial de la especificación.</p>
              </div>
            ) : null}
          </>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button type="button" className={btn("primary", "md")} onClick={() => dispatch({ type: "labTab", tab: "diseno" })}>
              Ir al diseño de la plantilla <Icon name="arrow" />
            </button>
          </div>
        )}
      </Card>

      <div className="grid content-start gap-4">
        <Card>
          <h2 className="text-base font-semibold">Por qué se propone</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-snug">
            {spec.reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="text-base font-semibold">Cambios registrados</h2>
          {c.spec.edits.length === 0 ? (
            <p className="mt-2 text-sm text-muted">Ninguno todavía.</p>
          ) : (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm" data-testid="spec-edits">
              {c.spec.edits.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs leading-snug text-muted">
            Estos cambios son la semilla de un futuro copiloto de diseño. En la app real solo se registran: no se entrena ningún modelo hasta tener histórico suficiente.
          </p>
        </Card>
      </div>
    </div>
  );
}
