"use client";

import { useEffect, useRef, useState } from "react";
import {
  ACTIVIDADES,
  CALZADOS,
  CLINICA_DEMO,
  MATERIALES,
  MESSY_MESSAGE,
  MODOS,
  PROFESIONAL_DEMO,
  SAMPLES,
  STATE_RANK,
  TIMELINE,
  TIPOS,
  type DemoCase,
  type Prescription,
} from "@/lib/domain";
import { parseSTL, measureSTL } from "@/lib/stl";
import { useDemo } from "@/lib/store";
import { ScanViewer, type CustomMesh } from "../three/ScanViewer";
import { Callout, Card, Chip, ExampleChip, Field, Icon, Segmented, StateChip, btn, fmtDate } from "../ui";

const TALLAS = Array.from({ length: 12 }, (_, i) => 36 + i);

const NOTICES: { from: DemoCase["state"]; text: string }[] = [
  { from: "enviado", text: "Hemos recibido tu caso y lo estamos revisando." },
  { from: "validado", text: "Tu caso está validado: pasa a diseño." },
  { from: "en_fabricacion", text: "Tu caso está en fabricación." },
  { from: "expedido", text: "Tu pedido ha salido hacia tu consulta." },
  { from: "entregado", text: "Pedido entregado. Gracias por confiar en Zona Pies." },
];

export function Profesional() {
  const { state, dispatch } = useDemo();
  const screen = state.profScreen;
  const screenRef = useRef<HTMLDivElement>(null);

  // Al cambiar de pantalla dentro del móvil se vuelve arriba.
  useEffect(() => {
    screenRef.current?.scrollTo({ top: 0 });
  }, [screen]);

  return (
    <div className="px-3 py-6 sm:px-4">
      <div className="phone" data-testid="phone">
        <div className="phone-screen" ref={screenRef}>
          <header className="phone-header flex items-center gap-2 border-b border-line bg-bone-50 px-4 py-2.5">
            {screen !== "lista" ? (
              <button type="button" aria-label="Volver a mis casos" className="grid size-9 place-items-center rounded-lg hover:bg-bone-100" onClick={() => dispatch({ type: "profScreen", screen: "lista" })} data-testid="prof-back">
                <Icon name="back" />
              </button>
            ) : null}
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold">Zona Pies · Casos</p>
              <p className="truncate text-[11px] text-muted">
                {CLINICA_DEMO} · {PROFESIONAL_DEMO}
              </p>
            </div>
          </header>
          <div className="p-4">{screen === "lista" ? <Lista /> : screen === "nuevo" ? <Nuevo /> : <Detalle />}</div>
        </div>
      </div>
      <p className="mx-auto mt-4 max-w-md text-center text-xs text-muted">Así lo vería el profesional en el móvil de su consulta. Maqueta con datos simulados.</p>
    </div>
  );
}

/* ------------------------------ lista ------------------------------ */

function Lista() {
  const { state, dispatch } = useDemo();
  const c = state.case;
  const inProgress = !c.submitted && (c.scan.sample !== null || c.rx.iniciales !== "");
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold tracking-tight">Mis casos</h1>
      <button
        type="button"
        className={btn("primary", "lg") + " w-full"}
        disabled={c.submitted}
        onClick={() => dispatch({ type: "profScreen", screen: "nuevo" })}
        data-testid="new-case"
      >
        <Icon name="plus" /> {inProgress ? "Continuar el caso" : "Nuevo caso"}
      </button>
      {c.submitted ? <p className="-mt-2 text-xs text-muted">En la demo solo hay un caso interactivo. Reinicia la demo para repetirlo.</p> : null}

      {c.submitted ? (
        <button type="button" className="text-left" onClick={() => dispatch({ type: "profScreen", screen: "detalle" })} data-testid="open-case">
          <Card className="grid gap-2 hover:border-line-strong">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-sm font-semibold">{c.code}</span>
              <StateChip state={c.state} />
            </div>
            <p className="text-sm text-muted">
              Pie {c.rx.lado} · {c.rx.iniciales || "—"} · {c.rx.tipo === "deportiva" ? "Deportiva" : c.rx.tipo === "descarga" ? "Descarga" : "Uso diario"}
            </p>
          </Card>
        </button>
      ) : inProgress ? (
        <Card className="grid gap-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold">Borrador en curso</span>
            <StateChip state={c.state} />
          </div>
          <p className="text-sm text-muted">Aún no se ha enviado al laboratorio.</p>
        </Card>
      ) : null}

      <section aria-labelledby="ant-h" className="mt-2 grid gap-2">
        <div className="flex items-center gap-2">
          <h2 id="ant-h" className="text-sm font-semibold text-muted">
            Anteriores
          </h2>
          <ExampleChip />
        </div>
        {[
          ["ZP-0398", "Pie izquierdo · R.P."],
          ["ZP-0391", "Pie derecho · A.G."],
        ].map(([code, text]) => (
          <Card key={code} className="flex items-center justify-between gap-2 !p-3.5 opacity-80">
            <div>
              <p className="font-mono text-sm font-semibold">{code}</p>
              <p className="text-xs text-muted">{text}</p>
            </div>
            <Chip tone="ok">Entregado</Chip>
          </Card>
        ))}
      </section>
    </div>
  );
}

/* --------------------------- nuevo caso ---------------------------- */

function Nuevo() {
  const { state, dispatch, actions } = useDemo();
  const c = state.case;
  const locked = c.submitted;
  const busy = state.busy;
  const [message, setMessage] = useState(MESSY_MESSAGE);
  const [custom, setCustom] = useState<CustomMesh | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const patch = (p: Partial<Prescription>) => dispatch({ type: "rx", patch: p, at: Date.now() });
  const ai = (k: keyof Prescription) =>
    state.aiFilled.includes(k) ? (
      <Chip tone="info" icon={false}>
        IA · simulado
      </Chip>
    ) : null;

  const analysis = c.scan.analysis;
  const sampleDef = SAMPLES.find((s) => s.id === c.scan.sample);

  const onFile = async (file: File | undefined) => {
    setFileError(null);
    if (!file) return;
    if (file.size > 60 * 1024 * 1024) {
      setFileError("El archivo es demasiado grande para la demo (máx. 60 MB).");
      return;
    }
    try {
      const positions = parseSTL(await file.arrayBuffer());
      const info = measureSTL(file.name, positions);
      setCustom({ positions });
      actions.runScanCustom(info);
    } catch (e) {
      setFileError(e instanceof Error ? e.message : "No se ha podido leer el archivo.");
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const missing: string[] = [];
  if (!c.rx.iniciales.trim()) missing.push("las iniciales del paciente");
  if (!analysis) missing.push("subir un escaneo");
  else if (analysis.status === "rojo") missing.push("repetir el escaneo (está en rojo)");
  const canSubmit = !locked && missing.length === 0 && busy === null;

  return (
    <div className="grid gap-5">
      <h1 className="text-2xl font-semibold tracking-tight">Nuevo caso</h1>
      {locked ? (
        <Callout tone="info" title="Este caso ya está enviado">
          La ficha queda bloqueada. Reinicia la demo para volver a empezar.
        </Callout>
      ) : null}

      <div data-tour="form-caso" className="grid gap-5 rounded-2xl">
        <Card className="grid gap-3">
          <details open={!locked} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-semibold">
              <span className="flex items-center gap-2">
                <Icon name="chat" className="size-4 text-brand" /> ¿Prefieres pegar un mensaje?
              </span>
              <ExampleChip>Simulado</ExampleChip>
            </summary>
            <div className="mt-3 grid gap-2">
              <label htmlFor="msg" className="sr-only">
                Mensaje del profesional
              </label>
              <textarea id="msg" className="input" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} disabled={locked} data-testid="msg" />
              <button
                type="button"
                className={btn("ghost", "md")}
                disabled={locked || busy !== null}
                onClick={() => actions.interpretMessage()}
                data-testid="interpret"
              >
                <Icon name="sparkle" /> {busy === "ia" ? "Leyendo el mensaje…" : "Interpretar mensaje"}
              </button>
              <p className="text-xs leading-snug text-muted">
                En la versión real lo hace un modelo de lenguaje con salida estructurada y sin datos identificables. Aquí el resultado está guionizado.
              </p>
            </div>
          </details>
        </Card>

        <Card className="grid gap-4">
          <h2 className="text-base font-semibold">Ficha del paciente</h2>
          <Field label="Iniciales del paciente" htmlFor="ini" badge={ai("iniciales")} hint="Solo iniciales: nada identificable.">
            <input id="ini" className="input" maxLength={6} value={c.rx.iniciales} disabled={locked} onChange={(e) => patch({ iniciales: e.target.value.toUpperCase() })} data-testid="f-iniciales" />
          </Field>
          <Field label="Pie" badge={ai("lado")}>
            <Segmented
              label="Pie"
              value={c.rx.lado}
              disabled={locked}
              onChange={(v) => patch({ lado: v })}
              options={[
                { id: "derecho", label: "Derecho" },
                { id: "izquierdo", label: "Izquierdo" },
              ]}
              testId="f-lado"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Talla" htmlFor="talla" badge={ai("talla")}>
              <select id="talla" className="input" value={c.rx.talla} disabled={locked} onChange={(e) => patch({ talla: Number(e.target.value) })}>
                {TALLAS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Peso (kg)" htmlFor="peso" badge={ai("peso")}>
              <input id="peso" type="number" inputMode="numeric" min={20} max={200} className="input" value={c.rx.peso} disabled={locked} onChange={(e) => patch({ peso: Number(e.target.value) })} data-testid="f-peso" />
            </Field>
          </div>
          <Field label="Tipo de plantilla" badge={ai("tipo")}>
            <Segmented label="Tipo de plantilla" value={c.rx.tipo} disabled={locked} onChange={(v) => patch({ tipo: v })} options={TIPOS} testId="f-tipo" />
          </Field>
          <Field label="Actividad" htmlFor="act" badge={ai("actividad")}>
            <select id="act" className="input" value={c.rx.actividad} disabled={locked} onChange={(e) => patch({ actividad: e.target.value as Prescription["actividad"] })} data-testid="f-actividad">
              {ACTIVIDADES.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Calzado habitual" htmlFor="calz" badge={ai("calzado")}>
            <select id="calz" className="input" value={c.rx.calzado} disabled={locked} onChange={(e) => patch({ calzado: e.target.value })}>
              {CALZADOS.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field>
          <Field label="Material preferido" htmlFor="mat" badge={ai("material")}>
            <select id="mat" className="input" value={c.rx.material} disabled={locked} onChange={(e) => patch({ material: e.target.value as Prescription["material"] })} data-testid="f-material">
              {MATERIALES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="¿Qué necesitas?">
            <Segmented label="Servicio" value={c.rx.modo} disabled={locked} onChange={(v) => patch({ modo: v })} options={MODOS} />
          </Field>
          <Field label="Observaciones" htmlFor="obs" badge={ai("observaciones")}>
            <textarea id="obs" className="input" rows={3} value={c.rx.observaciones} disabled={locked} onChange={(e) => patch({ observaciones: e.target.value })} />
          </Field>
        </Card>
      </div>

      <Card className="grid gap-4" data-tour="semaforo">
        <div>
          <h2 className="text-base font-semibold">Escaneo</h2>
          <p className="mt-1 text-xs text-muted">Los dos escaneos de ejemplo son de un pie derecho. Revisa que coincida con la ficha.</p>
        </div>
        <div className="grid gap-2" role="group" aria-label="Escaneos de ejemplo">
          {SAMPLES.map((s) => (
            <button
              key={s.id}
              type="button"
              disabled={locked || busy !== null}
              aria-pressed={c.scan.sample === s.id}
              onClick={() => actions.runScan(s.id)}
              data-testid={`sample-${s.id}`}
              className="flex items-start gap-3 rounded-xl border border-line-strong bg-white p-3 text-left transition-colors hover:bg-bone-50 disabled:opacity-60 aria-pressed:border-brand aria-pressed:bg-[#eaf5f2]"
            >
              <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-ink-900 text-signal">
                <Icon name="camera" className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{s.title}</span>
                <span className="block text-xs text-muted">{s.blurb}</span>
              </span>
            </button>
          ))}
          <label className={`${btn("ghost", "sm")} cursor-pointer ${locked || busy !== null ? "pointer-events-none opacity-50" : ""}`}>
            <Icon name="download" className="size-3.5 rotate-180" /> Cargar un STL propio
            <input ref={fileRef} type="file" accept=".stl,model/stl" className="sr-only" disabled={locked || busy !== null} onChange={(e) => onFile(e.target.files?.[0])} data-testid="stl-input" />
          </label>
          <p className="text-[11px] leading-snug text-muted">Opcional: con un STL tuyo se miden largo, ancho y si la malla es cerrada. El resto del análisis sigue simulado.</p>
        </div>
        {fileError ? <Callout tone="bad">{fileError}</Callout> : null}

        {busy === "scan" ? (
          <p className="flex items-center gap-2 text-sm text-muted" role="status" data-testid="scan-busy">
            <span className="size-3 animate-spin rounded-full border-2 border-brand border-t-transparent motion-reduce:animate-none" aria-hidden="true" /> Analizando el escaneo…
          </p>
        ) : analysis ? (
          <div className="grid gap-3" aria-live="polite">
            <Semaforo status={analysis.status} />
            <ul className="grid gap-2" data-testid="scan-checks">
              {analysis.checks.map((k) => (
                <li key={k.id} className={`callout callout-${k.status}`}>
                  <Icon name={k.status === "ok" ? "check" : k.status === "warn" ? "alert" : "x"} className="mt-0.5 size-4 shrink-0" />
                  <div className="text-[13px] leading-snug">
                    <p className="font-semibold">{k.label}</p>
                    <p>{k.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
            {c.scan.sample === "custom" && !custom ? (
              <Callout tone="muted">Vuelve a cargar el STL para verlo en 3D (no se guarda al recargar la página).</Callout>
            ) : (
              <ScanViewer side={sampleDef?.side ?? c.rx.lado} hole={c.scan.sample === "A"} custom={c.scan.sample === "custom" ? custom : null} testId="scan-viewer" />
            )}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-line-strong p-4 text-sm text-muted">Elige un escaneo para ver el análisis al instante.</p>
        )}
      </Card>

      <div className="grid gap-2">
        <button
          type="button"
          className={btn("primary", "lg") + " w-full"}
          disabled={!canSubmit}
          onClick={() => {
            actions.submit();
            dispatch({ type: "profScreen", screen: "detalle" });
          }}
          data-testid="submit-case"
        >
          Enviar caso al laboratorio
        </button>
        {!locked && missing.length > 0 ? (
          <p className="text-center text-xs text-muted" data-testid="missing">
            Falta: {missing.join(" y ")}.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function Semaforo({ status }: { status: "verde" | "ambar" | "rojo" }) {
  const text = status === "verde" ? "Escaneo correcto" : status === "ambar" ? "Escaneo con avisos" : "Escaneo a repetir";
  const sub =
    status === "verde"
      ? "Se puede enviar el caso."
      : status === "ambar"
        ? "Puedes enviar el caso, pero conviene revisar los avisos."
        : "No se puede enviar con este escaneo.";
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-ink-900 p-4 text-[#eef1f2]" data-testid="semaforo-status" data-status={status}>
      <div className="flex flex-col gap-1.5 rounded-full bg-ink-950 p-2" aria-hidden="true">
        <span className={`size-5 rounded-full ${status === "rojo" ? "bg-[#ff3b5c] shadow-[0_0_14px_#ff3b5c]" : "bg-[#3a2227]"}`} />
        <span className={`size-5 rounded-full ${status === "ambar" ? "bg-amber-300 shadow-[0_0_14px_#fcd34d]" : "bg-[#3a3523]"}`} />
        <span className={`size-5 rounded-full ${status === "verde" ? "bg-signal shadow-[0_0_14px_#3ee6c9]" : "bg-[#1d3a35]"}`} />
      </div>
      <div>
        <p className="text-lg font-semibold">{text}</p>
        <p className="text-sm text-[#9aa6ae]">{sub}</p>
      </div>
    </div>
  );
}

/* ----------------------------- detalle ----------------------------- */

function Detalle() {
  const { state, dispatch } = useDemo();
  const c = state.case;
  if (!c.submitted) {
    return (
      <div className="grid gap-3">
        <p className="text-sm text-muted">Aún no has enviado ningún caso.</p>
        <button type="button" className={btn("primary", "md")} onClick={() => dispatch({ type: "profScreen", screen: "nuevo" })}>
          Crear el caso
        </button>
      </div>
    );
  }
  const rank = STATE_RANK[c.state];
  const reached = TIMELINE.map((t) => rank >= STATE_RANK[t.from]);
  const currentIdx = reached.lastIndexOf(true);
  const at = (from: DemoCase["state"]) => c.events.find((e) => e.state === from)?.at;
  const spec = c.spec.final ?? c.spec.proposal;

  return (
    <div className="grid gap-5">
      <div>
        <div className="flex items-center justify-between gap-2">
          <h1 className="font-mono text-2xl font-semibold tracking-tight">{c.code}</h1>
          <StateChip state={c.state} />
        </div>
        <p className="mt-1 text-sm text-muted">
          Pie {c.rx.lado} · {c.rx.iniciales}
        </p>
      </div>

      {state.busy === "review" ? (
        <p className="flex items-center gap-2 text-sm text-muted" role="status" data-testid="reviewing">
          <span className="size-3 animate-spin rounded-full border-2 border-brand border-t-transparent motion-reduce:animate-none" aria-hidden="true" /> Revisando la ficha con las reglas del laboratorio…
        </p>
      ) : null}

      {c.state === "esperando_aclaracion" && c.clarification.item ? (
        <Card className="grid gap-3 border-[#f0d595] bg-[#fffaf0]" data-tour="aclaracion" data-testid="aclaracion">
          <Chip tone="warn">Una pregunta del laboratorio</Chip>
          <p className="text-base font-semibold leading-snug">{c.clarification.item.question}</p>
          <p className="text-xs leading-snug text-muted">{c.clarification.item.detail}</p>
          <div className="grid gap-2">
            {c.clarification.item.options.map((o) => (
              <button
                key={o.id}
                type="button"
                className="rounded-xl border border-line-strong bg-white p-3 text-left transition-colors hover:border-brand hover:bg-[#eaf5f2]"
                onClick={() => dispatch({ type: "answer", option: o.id, at: Date.now() })}
                data-testid={`clar-${o.id}`}
              >
                <span className="block text-sm font-semibold">{o.label}</span>
                <span className="block text-xs text-muted">{o.sub}</span>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted">La IA solo redacta la pregunta; lo que la dispara lo deciden las reglas del laboratorio (de ejemplo).</p>
        </Card>
      ) : null}

      {c.clarification.answer ? (
        <Callout tone="ok" title="Aclaración respondida">
          {c.clarification.answer === "pa11" ? "Has cambiado el material a PA11." : "Has mantenido el material elegido."}
        </Callout>
      ) : null}

      <Card data-tour="timeline" data-testid="timeline">
        <h2 className="text-base font-semibold">Seguimiento</h2>
        <ol className="mt-4 grid gap-0">
          {TIMELINE.map((t, i) => {
            const done = reached[i];
            const cur = i === currentIdx;
            const when = at(t.from);
            return (
              <li key={t.id} className="relative flex gap-3 pb-4 last:pb-0" aria-current={cur ? "step" : undefined} data-done={done} data-testid={`tl-${t.id}`}>
                {i < TIMELINE.length - 1 ? <span aria-hidden="true" className={`absolute left-[13px] top-7 h-[calc(100%-1.25rem)] w-0.5 ${reached[i + 1] ? "bg-brand" : "bg-line-strong"}`} /> : null}
                <span
                  className={`relative z-[1] grid size-7 shrink-0 place-items-center rounded-full border-2 ${done ? "border-brand bg-brand text-white" : "border-line-strong bg-white text-muted"} ${cur ? "ring-4 ring-brand/20" : ""}`}
                >
                  {done ? <Icon name="check" className="size-3.5" /> : <span className="size-1.5 rounded-full bg-line-strong" />}
                </span>
                <div className="pt-0.5">
                  <p className={`text-sm ${done ? "font-semibold" : "text-muted"}`}>
                    {t.label}
                    {cur && c.state !== "entregado" ? <span className="ml-2 text-xs font-normal text-brand">en curso</span> : null}
                  </p>
                  {done && when ? <p className="text-[11px] text-muted">{fmtDate(when)}</p> : null}
                </div>
              </li>
            );
          })}
        </ol>
        <button type="button" className={btn("ghost", "sm") + " mt-4 w-full"} onClick={() => dispatch({ type: "overlay", publicLink: true })} data-testid="open-public">
          <Icon name="link" className="size-3.5" /> Ver el enlace público de estado
        </button>
      </Card>

      <Card aria-labelledby="av-h">
        <div className="flex items-center justify-between gap-2">
          <h2 id="av-h" className="text-base font-semibold">
            Avisos por correo
          </h2>
          <ExampleChip>Simulado</ExampleChip>
        </div>
        <ul className="mt-3 grid gap-2 text-sm" data-testid="notices">
          {NOTICES.filter((n) => rank >= STATE_RANK[n.from]).map((n) => (
            <li key={n.from} className="flex gap-2">
              <Icon name="chat" className="mt-0.5 size-4 shrink-0 text-brand" /> <span>{n.text}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] text-muted">No se envía ningún correo real en la demo.</p>
      </Card>

      <Card aria-labelledby="fi-h">
        <h2 id="fi-h" className="text-base font-semibold">
          Ficha
        </h2>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
          {(
            [
              ["Pie", c.rx.lado],
              ["Talla", String(c.rx.talla)],
              ["Peso", `${c.rx.peso} kg`],
              ["Tipo", TIPOS.find((t) => t.id === c.rx.tipo)?.label ?? ""],
              ["Actividad", ACTIVIDADES.find((a) => a.id === c.rx.actividad)?.label ?? ""],
              ["Calzado", c.rx.calzado],
              ["Material", spec ? `${spec.material} · ${spec.rutaLabel}` : (MATERIALES.find((m) => m.id === c.rx.material)?.label ?? "")],
            ] as const
          ).map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-muted">{k}</dt>
              <dd className="font-medium first-letter:uppercase">{v}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}
