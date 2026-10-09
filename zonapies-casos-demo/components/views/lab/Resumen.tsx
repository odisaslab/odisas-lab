"use client";

import {
  ACTIVIDADES,
  MATERIALES,
  MODOS,
  SAMPLES,
  STATE_LABEL,
  TIPOS,
} from "@/lib/domain";
import { useDemo } from "@/lib/store";
import { ScanViewer } from "../../three/ScanViewer";
import { Callout, Card, Chip, fmtDate } from "../../ui";

export function Resumen() {
  const { state } = useDemo();
  const c = state.case;
  const sample = SAMPLES.find((s) => s.id === c.scan.sample);
  const rows: [string, string][] = [
    ["Pie", c.rx.lado],
    ["Talla", String(c.rx.talla)],
    ["Peso", `${c.rx.peso} kg`],
    ["Tipo de plantilla", TIPOS.find((t) => t.id === c.rx.tipo)?.label ?? ""],
    ["Actividad", ACTIVIDADES.find((a) => a.id === c.rx.actividad)?.label ?? ""],
    ["Calzado", c.rx.calzado],
    ["Material preferido", MATERIALES.find((m) => m.id === c.rx.material)?.label ?? ""],
    ["Servicio", MODOS.find((m) => m.id === c.rx.modo)?.label ?? ""],
  ];

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card className="grid content-start gap-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold">Escaneo</h2>
          {c.scan.analysis ? (
            <Chip tone={c.scan.analysis.status === "verde" ? "ok" : c.scan.analysis.status === "ambar" ? "warn" : "bad"}>
              {c.scan.analysis.status === "verde" ? "Correcto" : c.scan.analysis.status === "ambar" ? "Con avisos" : "A repetir"}
            </Chip>
          ) : null}
        </div>
        {c.scan.sample === "custom" ? (
          <Callout tone="muted">El STL propio solo se visualiza en la vista del profesional, donde se cargó.</Callout>
        ) : (
          <ScanViewer side={sample?.side ?? c.rx.lado} hole={c.scan.sample === "A"} testId="lab-scan-viewer" />
        )}
        <p className="text-xs text-muted">
          Intentos de escaneo: {c.scan.attempts.length ? c.scan.attempts.map((a) => (a === "A" || a === "B" ? `Escaneo ${a}` : a)).join(" → ") : "—"}
        </p>
      </Card>

      <div className="grid content-start gap-4">
        <Card>
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold">Prescripción estructurada</h2>
            <Chip tone="info" icon={false}>
              Datos validados
            </Chip>
          </div>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm">
            {rows.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-muted">{k}</dt>
                <dd className="font-medium first-letter:uppercase">{v}</dd>
              </div>
            ))}
          </dl>
          {c.rx.observaciones ? <p className="mt-3 rounded-xl bg-bone-50 p-3 text-sm text-muted">«{c.rx.observaciones}»</p> : null}
        </Card>

        {c.clarification.item ? (
          <Card>
            <h2 className="text-base font-semibold">Aclaración</h2>
            <p className="mt-2 text-sm">{c.clarification.item.question}</p>
            <p className="mt-2 text-sm text-muted">
              Respuesta: <b className="text-fg">{c.clarification.answer === "pa11" ? "Cambiar a PA11" : c.clarification.answer === "mantener" ? "Mantener el material" : "Pendiente"}</b>
            </p>
          </Card>
        ) : null}

        <Card>
          <h2 className="text-base font-semibold">Historial del caso</h2>
          <ol className="mt-3 grid gap-1.5 text-sm" data-testid="events">
            {c.events.map((e, i) => (
              <li key={`${e.state}-${i}`} className="flex items-baseline justify-between gap-3">
                <span>{STATE_LABEL[e.state]}{e.note ? ` · ${e.note}` : ""}</span>
                <span className="font-mono text-xs text-muted">{fmtDate(e.at)}</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </div>
  );
}
