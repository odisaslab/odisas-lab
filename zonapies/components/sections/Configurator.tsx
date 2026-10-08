"use client";

import { useEffect, useRef, useState } from "react";
import { QuoteButton } from "@/components/forms/QuoteProvider";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { ArrowRight } from "@/components/ui/Icons";
import { professionalTypes } from "@/data/quote";
import { track } from "@/lib/analytics";
import { labelFor } from "@/lib/quote";

interface Option {
  value: string;
  label: string;
  hint?: string;
}

interface Step {
  id: "solution" | "material" | "activity" | "need" | "professional";
  question: string;
  options: Option[];
}

const steps: Step[] = [
  {
    id: "solution",
    question: "¿Qué necesitas fabricar?",
    options: [
      { value: "fabricacion", label: "Plantillas a medida", hint: "Vosotros fabricáis" },
      { value: "shell", label: "Solo el shell", hint: "Yo termino el proceso" },
      { value: "sistemas", label: "Fabricar en mi centro", hint: "Sistemas y soluciones" },
      { value: "otro", label: "Aún no lo sé", hint: "Quiero asesoramiento" },
    ],
  },
  {
    id: "material",
    question: "¿Qué material te interesa?",
    options: [
      { value: "Fibra de carbono", label: "Fibra de carbono" },
      { value: "EVA", label: "EVA" },
      { value: "PA11", label: "PA11" },
      { value: "Resina", label: "Resina" },
      { value: "Composite", label: "Composite" },
      { value: "Memory", label: "Memory" },
      { value: "Que me aconsejéis", label: "Que me aconsejéis" },
    ],
  },
  {
    id: "activity",
    question: "¿Qué actividad tiene el uso previsto?",
    options: [
      { value: "Uso diario", label: "Uso diario" },
      { value: "Deporte", label: "Deporte" },
      { value: "Trabajo de pie", label: "Trabajo de pie" },
      { value: "Otro uso", label: "Otro uso" },
    ],
  },
  {
    id: "need",
    question: "¿Qué prioridad buscas en la pieza?",
    options: [
      { value: "Amortiguación y confort", label: "Amortiguación y confort" },
      { value: "Control y soporte", label: "Control y soporte" },
      { value: "Máxima ligereza", label: "Máxima ligereza" },
      { value: "Prescripción personalizada", label: "Prescripción personalizada" },
    ],
  },
  {
    id: "professional",
    question: "¿Qué tipo de profesional eres?",
    options: professionalTypes.map((p) => ({ value: p.value, label: p.label })),
  },
];

/**
 * Configurador comercial (briefing §14): ayuda a plantear la consulta y la envía precargada.
 * NO realiza ninguna valoración médica y lo indica.
 */
export function Configurator() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const headingRef = useRef<HTMLHeadingElement>(null);
  const mounted = useRef(false);

  const done = step >= steps.length;
  const current = steps[Math.min(step, steps.length - 1)];

  // Foco en el titular de cada paso (teclado y lectores de pantalla)
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  const choose = (id: Step["id"], value: string) => setAnswers((prev) => ({ ...prev, [id]: value }));

  const next = () => {
    track(done ? "configurator_complete" : "configurator_step", { step: step + 1, answer: answers[current.id] ?? "" });
    if (step === steps.length - 1) track("configurator_complete", { solution: answers.solution ?? "", professional: answers.professional ?? "" });
    setStep((s) => Math.min(steps.length, s + 1));
  };

  const summary = [
    { k: "Solución", v: answers.solution ? (steps[0].options.find((o) => o.value === answers.solution)?.label ?? answers.solution) : "" },
    { k: "Material", v: answers.material ?? "" },
    { k: "Uso", v: answers.activity ?? "" },
    { k: "Prioridad", v: answers.need ?? "" },
    { k: "Profesional", v: answers.professional ? labelFor(professionalTypes, answers.professional) : "" },
  ];

  const summaryList = (
    <dl className="mt-10 divide-y divide-line border-y border-line" aria-label="Resumen de tu solicitud">
      {summary.map((row) => (
        <div key={row.k} className="flex items-baseline justify-between gap-6 py-3.5">
          <dt className="hud text-muted">{row.k}</dt>
          <dd className={`text-right text-[0.95rem] ${row.v ? "text-fg" : "text-muted/60"}`}>{row.v || "—"}</dd>
        </div>
      ))}
    </dl>
  );

  const message = `Configurador · ${summary.filter((s) => s.v).map((s) => `${s.k}: ${s.v}`).join(" · ")}`;

  return (
    <div className="wrap">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <Reveal>
            <p className="t-eyebrow">Configurador</p>
          </Reveal>
          <SplitHeading as="h2" className="t-h2 mt-6" text={"¿Qué necesitas *fabricar*?"} />
          <Reveal delay={150}>
            <p className="t-lead mt-6 max-w-[28rem]">Cinco preguntas para plantear tu consulta y llegar al presupuesto con todo claro.</p>
            <p className="mt-6 max-w-[28rem] rounded-2xl border border-line p-4 text-sm leading-snug text-muted">
              Es una herramienta comercial: orienta tu consulta, <strong className="font-medium text-fg">no realiza ninguna valoración médica</strong>.
            </p>
          </Reveal>

          {/* Tu solicitud (escritorio: bajo el titular) */}
          <Reveal delay={200} className="hidden lg:block">
            {summaryList}
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          <div className="reg relative rounded-3xl border border-line-strong p-6 md:p-10 lg:sticky lg:top-28">
            <span className="reg-b" />

            {/* Progreso */}
            <div className="flex items-center gap-3" role="progressbar" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={Math.min(step, steps.length)} aria-label="Progreso del configurador">
              {steps.map((s, index) => (
                <span key={s.id} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${index < step ? "bg-accent" : index === step && !done ? "bg-accent/50" : "bg-line-strong"}`} />
              ))}
            </div>
            <p className="hud mt-4 text-muted">{done ? "Listo" : `Paso ${step + 1} de ${steps.length}`}</p>

            {!done ? (
              <div key={current.id} className="panel-in">
                <h3 ref={headingRef} tabIndex={-1} className="t-h3 mt-4 outline-none">
                  {current.question}
                </h3>
                <div role="radiogroup" aria-label={current.question} className="mt-7 flex flex-wrap gap-2.5">
                  {current.options.map((option) => {
                    const checked = answers[current.id] === option.value;
                    return (
                      <label key={option.value} className="need-chip">
                        <input type="radio" name={`cfg-${current.id}`} value={option.value} checked={checked} onChange={() => choose(current.id, option.value)} />
                        <span className="!min-h-12 !px-5 !text-base">
                          {option.label}
                          {option.hint ? <small className="ml-3 hidden text-[0.75rem] opacity-70 sm:inline">{option.hint}</small> : null}
                        </span>
                      </label>
                    );
                  })}
                </div>
                <div className="mt-10 flex items-center justify-between gap-4">
                  <button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="link-arrow disabled:pointer-events-none disabled:opacity-0">
                    <span aria-hidden="true">←</span> Atrás
                  </button>
                  <button type="button" onClick={next} disabled={!answers[current.id]} className="btn btn-primary btn-lg">
                    <span>{step === steps.length - 1 ? "Ver mi resumen" : "Siguiente"}</span>
                    <ArrowRight className="arrow" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="panel-in">
                <h3 ref={headingRef} tabIndex={-1} className="t-h2 mt-4 outline-none">
                  Hablemos sobre tu caso.
                </h3>
                <p className="t-lead mt-5 max-w-[32rem]">Con lo que has indicado, un especialista de Zona Pies puede preparar tu presupuesto. Te lo enviamos precargado en el formulario.</p>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {summary
                    .filter((s) => s.v)
                    .map((s) => (
                      <li key={s.k} className="chip !normal-case !tracking-normal text-fg">
                        {s.v}
                      </li>
                    ))}
                </ul>
                <div className="mt-9 flex flex-wrap items-center gap-4">
                  <QuoteButton
                    cta="configurator"
                    size="lg"
                    magnetic
                    prefill={{ need: answers.solution || "otro", professionalType: answers.professional, message }}
                  />
                  <button type="button" onClick={() => setStep(0)} className="link-arrow">
                    Empezar de nuevo
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="lg:hidden">{summaryList}</div>
        </div>
      </div>
    </div>
  );
}
