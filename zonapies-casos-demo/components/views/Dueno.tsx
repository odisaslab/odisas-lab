"use client";

import { DASH_EXAMPLE, EXAMPLE_NOTICE, METRICS_EXPLAINED } from "@/lib/content";
import { INCIDENT_CAUSA_LABEL, INCIDENT_TIPO_LABEL, STATE_LABEL } from "@/lib/domain";
import { useDemo } from "@/lib/store";
import { Callout, Card, Chip, Eyebrow, ExampleChip, StateChip } from "../ui";

const fmtHours = (h: number) => `${String(h).replace(".", ",")} h`;

export function Dueno() {
  const { state, dispatch } = useDemo();
  const c = state.case;
  const d = DASH_EXAMPLE;
  const maxCause = Math.max(...d.causas.map((x) => x.n));
  const maxP90 = Math.max(...d.fases.map((x) => x.p90));
  const loops = c.incidents;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:py-12">
      <div className="flex flex-wrap items-center gap-3">
        <Eyebrow>Vista del dueño</Eyebrow>
        <ExampleChip>{EXAMPLE_NOTICE}</ExampleChip>
      </div>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Dónde se pierde el tiempo</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Hoy no hay forma de saber cuántos casos salen bien a la primera ni en qué fase se acumula el retraso. Aquí se mediría solo, a partir de los cambios de estado de cada caso.
      </p>

      <div className="mt-6">
        <Callout tone="warn" title="Datos de ejemplo">
          Los números de este panel son ilustrativos y <b>no son datos de Zona Pies</b>. No representan ninguna mejora ni resultado esperado. Lo único calculado de verdad es el caso que has simulado, más abajo.
        </Callout>
      </div>

      <div data-tour="dash" className="dash-example mt-6 grid gap-5 overflow-hidden rounded-3xl">
        <div className="grid gap-5 sm:grid-cols-3">
          <Card>
            <p className="text-sm text-muted">Casos correctos a la primera</p>
            <p className="mt-2 text-4xl font-semibold tabular-nums">
              {d.correctosPrimera} <span className="text-lg font-normal text-muted">de {d.casosTotales}</span>
            </p>
            <p className="mt-2 text-xs text-muted">Sin reescaneo, aclaración ni retoque. (Ejemplo)</p>
          </Card>
          <Card>
            <p className="text-sm text-muted">Bucles por pedido</p>
            <p className="mt-2 text-4xl font-semibold tabular-nums">0,3</p>
            <p className="mt-2 text-xs text-muted">{d.bucles} bucles en {d.casosTotales} casos. (Ejemplo)</p>
          </Card>
          <Card>
            <p className="text-sm text-muted">Casos del periodo</p>
            <p className="mt-2 text-4xl font-semibold tabular-nums">{d.casosTotales}</p>
            <p className="mt-2 text-xs text-muted">Periodo de ejemplo. (Ejemplo)</p>
          </Card>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card aria-labelledby="causas-h">
            <h2 id="causas-h" className="text-base font-semibold">
              Causa de cada bucle
            </h2>
            <ul className="mt-4 space-y-3">
              {d.causas.map((x) => (
                <li key={x.id} className="grid grid-cols-[6.5rem_1fr_2rem] items-center gap-3 text-sm">
                  <span>{x.label}</span>
                  <span className="h-3 overflow-hidden rounded-full bg-bone-100">
                    <span className="block h-full rounded-full bg-brand" style={{ width: `${(x.n / maxCause) * 100}%` }} />
                  </span>
                  <span className="text-right font-mono tabular-nums">{x.n}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card aria-labelledby="fases-h">
            <h2 id="fases-h" className="text-base font-semibold">
              Tiempo por fase
            </h2>
            <p className="mt-1 text-xs text-muted">Mediana (lo habitual) y percentil 90 (los casos malos).</p>
            <ul className="mt-4 space-y-4">
              {d.fases.map((f) => (
                <li key={f.id} className="text-sm">
                  <div className="flex items-baseline justify-between gap-2">
                    <span>{f.label}</span>
                    <span className="font-mono text-xs tabular-nums text-muted">
                      mediana {fmtHours(f.mediana)} · p90 {fmtHours(f.p90)}
                    </span>
                  </div>
                  <div className="relative mt-1.5 h-3 rounded-full bg-bone-100">
                    <span className="absolute inset-y-0 left-0 rounded-full bg-signal-dim/45" style={{ width: `${(f.p90 / maxP90) * 100}%` }} />
                    <span className="absolute inset-y-0 left-0 rounded-full bg-brand" style={{ width: `${(f.mediana / maxP90) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <Card className="mt-8" aria-labelledby="real-h" data-testid="real-case">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="real-h" className="text-lg font-semibold">
            El caso que has simulado <span className="font-mono text-sm font-normal text-muted">{c.code}</span>
          </h2>
          <Chip tone="ok" icon={false}>
            Calculado de verdad
          </Chip>
        </div>
        {!c.submitted ? (
          <div className="mt-3 text-sm text-muted">
            <p>Aún no has enviado ningún caso. Vuelve a la vista Profesional, crea uno y aquí aparecerá con sus bucles.</p>
            <button type="button" className="btn btn-ghost btn-sm mt-3" onClick={() => dispatch({ type: "view", view: "profesional" })}>
              Ir a la vista Profesional
            </button>
          </div>
        ) : (
          <div className="mt-3 grid gap-4 sm:grid-cols-[auto_1fr] sm:items-start">
            <dl className="grid gap-2 text-sm">
              <div className="flex items-center gap-2">
                <dt className="text-muted">Estado</dt>
                <dd>
                  <StateChip state={c.state} />
                </dd>
              </div>
              <div className="flex items-center gap-2">
                <dt className="text-muted">Bucles</dt>
                <dd className="font-semibold tabular-nums" data-testid="loop-count">
                  {loops.length}
                </dd>
              </div>
              <div className="flex items-center gap-2">
                <dt className="text-muted">Correcto a la primera</dt>
                <dd className="font-semibold">{loops.length === 0 ? "Sí" : "No"}</dd>
              </div>
            </dl>
            <div>
              {loops.length === 0 ? (
                <p className="text-sm text-muted">Este caso no ha tenido ningún bucle.</p>
              ) : (
                <ul className="space-y-2" data-testid="loop-list">
                  {loops.map((i) => (
                    <li key={i.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-bone-50 px-3 py-2 text-sm">
                      <Chip tone="warn" icon={false}>
                        {INCIDENT_TIPO_LABEL[i.tipo]}
                      </Chip>
                      <span className="text-muted">Causa:</span>
                      <b>{INCIDENT_CAUSA_LABEL[i.causa]}</b>
                      <span className="text-muted">· {i.nota}</span>
                      {i.auto ? <span className="ml-auto text-[11px] text-muted">Registrado solo, por el cambio de estado</span> : null}
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-xs text-muted">Estado actual del caso: {STATE_LABEL[c.state]}. Los tiempos por fase saldrían de las marcas de cada cambio de estado.</p>
            </div>
          </div>
        )}
      </Card>

      <section aria-labelledby="medir-h" className="mt-8">
        <h2 id="medir-h" className="text-lg font-semibold">
          Qué mediríamos
        </h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          {METRICS_EXPLAINED.map((m) => (
            <Card key={m.title}>
              <dt className="font-medium">{m.title}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted">{m.body}</dd>
            </Card>
          ))}
        </dl>
        <p className="mt-4 text-sm text-muted">Sin objetivos numéricos: primero hay que medir la situación de partida.</p>
      </section>
    </div>
  );
}
