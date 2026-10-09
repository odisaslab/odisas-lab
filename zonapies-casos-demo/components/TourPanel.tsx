"use client";

import { useEffect, useRef } from "react";
import { TOUR } from "@/lib/content";
import { STATE_LABEL, STATE_RANK } from "@/lib/domain";
import { buildNotesMarkdown } from "@/lib/exportNotes";
import { downloadBlob } from "@/lib/stl";
import { useTourControls, type SurveyAnswer } from "@/lib/store";
import { Icon, btn } from "./ui";

const ANSWERS: { id: Exclude<SurveyAnswer, null>; label: string }[] = [
  { id: "si", label: "Sí" },
  { id: "ajustar", label: "Habría que ajustarlo" },
  { id: "no", label: "No" },
];

/** Panel del modo presentación: guion, notas y cuestionario de la reunión. */
export function TourPanel() {
  const { state, step, goto, dispatch, actions } = useTourControls();
  const ref = useRef<HTMLElement>(null);
  const i = state.tour.step;
  const expanded = state.tour.expanded;
  const sv = state.survey[step.id] ?? { answer: null, comment: "" };

  const behind =
    STATE_RANK[state.case.state] < STATE_RANK[step.minState] ||
    (step.minState !== "borrador" && !state.case.submitted);

  // Altura del panel → variable CSS que reserva espacio en la página
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const set = () => document.documentElement.style.setProperty("--tour-h", `${el.offsetHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => {
      ro.disconnect();
      document.documentElement.style.removeProperty("--tour-h");
    };
  }, []);

  // Teclas ← → para avanzar sin tocar el ratón
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      if (e.key === "ArrowRight") goto(i + 1);
      if (e.key === "ArrowLeft") goto(i - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goto, i]);

  // Resalta el elemento del paso y lo trae a la vista
  useEffect(() => {
    let tries = 0;
    let timer = 0;
    let el: Element | null = null;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const find = () => {
      el = document.querySelector(`[data-tour="${step.target}"]`);
      if (el) {
        el.setAttribute("data-tour-hl", "true");
        el.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
      } else if (tries++ < 12) {
        timer = window.setTimeout(find, 180);
      }
    };
    timer = window.setTimeout(find, 120);
    return () => {
      window.clearTimeout(timer);
      document.querySelectorAll("[data-tour-hl]").forEach((n) => n.removeAttribute("data-tour-hl"));
    };
  }, [step.target, state.view, state.profScreen, state.case.state]);

  return (
    <section
      ref={ref}
      aria-label="Presentación guiada"
      data-testid="tour-panel"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-signal/40 bg-ink-950 text-[#eef1f2] shadow-[0_-12px_30px_-12px_rgba(0,0,0,0.5)]"
    >
      <div className="mx-auto max-w-[1400px] px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-signal" data-testid="tour-step">
            Paso {i + 1} / {TOUR.length}
          </p>
          <h2 className="text-sm font-semibold sm:text-base">{step.title}</h2>
          <div className="hidden items-center gap-1 md:flex" aria-hidden="true">
            {TOUR.map((t, k) => (
              <span key={t.id} className={`h-1.5 w-6 rounded-full ${k === i ? "bg-signal" : k < i ? "bg-signal/40" : "bg-white/15"}`} />
            ))}
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-1.5">
            <button type="button" className={`${btn("ghost", "sm")} !border-white/25 !text-[#eef1f2] hover:!bg-white/10`} disabled={i === 0} onClick={() => goto(i - 1)} data-testid="tour-prev">
              <Icon name="back" className="size-3.5" /> Anterior
            </button>
            <button type="button" className={`${btn("primary", "sm")} !bg-signal !text-ink-950 hover:!bg-signal-dim`} disabled={i === TOUR.length - 1} onClick={() => goto(i + 1)} data-testid="tour-next">
              Siguiente <Icon name="arrow" className="size-3.5" />
            </button>
            <button
              type="button"
              className={`${btn("ghost", "sm")} !border-white/25 !text-[#eef1f2] hover:!bg-white/10`}
              onClick={() => downloadBlob("notas-reunion-zonapies.md", buildNotesMarkdown(state), "text/markdown;charset=utf-8")}
              data-testid="export-notes"
            >
              <Icon name="download" className="size-3.5" /> Notas
            </button>
            <button
              type="button"
              className={`${btn("ghost", "sm")} !border-white/25 !text-[#eef1f2] hover:!bg-white/10`}
              aria-expanded={expanded}
              onClick={() => dispatch({ type: "tour", patch: { expanded: !expanded } })}
            >
              {expanded ? "Ocultar detalle" : "Mostrar detalle"}
            </button>
            <button type="button" className={`${btn("ghost", "sm")} !border-white/25 !text-[#eef1f2] hover:!bg-white/10`} aria-label="Cerrar la presentación" onClick={() => dispatch({ type: "tour", patch: { active: false } })}>
              <Icon name="x" className="size-3.5" />
            </button>
          </div>
        </div>

        {expanded ? (
          <div className="mt-3 grid max-h-[40vh] gap-4 overflow-y-auto pb-1 md:grid-cols-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#9aa6ae]">Qué decir</p>
              <ul className="mt-1.5 list-disc space-y-1.5 pl-4 text-[13px] leading-snug text-[#dfe5e8]">
                {step.say.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              <p className="mt-3 rounded-lg border border-signal/30 bg-signal/10 px-3 py-2 text-[13px] leading-snug">
                <span className="font-semibold text-signal">Pregunta al cliente:</span> {step.ask}
              </p>
              {behind ? (
                <div className="mt-3 rounded-lg border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-[13px]">
                  <p>El caso simulado aún no ha llegado a «{STATE_LABEL[step.minState]}».</p>
                  <button type="button" className={`${btn("primary", "sm")} mt-2 !bg-signal !text-ink-950`} onClick={() => actions.advanceTo(step.minState)} data-testid="tour-prepare">
                    Preparar el caso hasta aquí
                  </button>
                </div>
              ) : null}
            </div>

            <div>
              <label htmlFor="tour-notes" className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#9aa6ae]">
                Notas de este paso
              </label>
              <textarea
                id="tour-notes"
                value={state.notes[step.id] ?? ""}
                onChange={(e) => dispatch({ type: "note", id: step.id, text: e.target.value })}
                placeholder="Lo que comenta el cliente, dudas, cambios…"
                className="mt-1.5 h-28 w-full resize-y rounded-xl border border-white/20 bg-ink-900 p-3 text-[13px] text-[#eef1f2] placeholder:text-[#7b8790]"
                data-testid="tour-notes"
              />
            </div>

            <fieldset>
              <legend className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#9aa6ae]">¿Cuadra con vuestro proceso?</legend>
              <div className="mt-1.5 flex flex-wrap gap-1.5" role="radiogroup" aria-label="¿Cuadra con vuestro proceso?">
                {ANSWERS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    role="radio"
                    aria-checked={sv.answer === a.id}
                    onClick={() => dispatch({ type: "survey", id: step.id, answer: sv.answer === a.id ? null : a.id })}
                    className="min-h-10 rounded-lg border border-white/25 px-3 text-[13px] font-medium transition-colors hover:bg-white/10 aria-checked:border-signal aria-checked:bg-signal aria-checked:text-ink-950"
                    data-testid={`survey-${a.id}`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
              <label htmlFor="tour-comment" className="sr-only">
                Comentario
              </label>
              <input
                id="tour-comment"
                type="text"
                value={sv.comment}
                onChange={(e) => dispatch({ type: "survey", id: step.id, comment: e.target.value })}
                placeholder="Comentario (opcional)"
                className="mt-2 min-h-10 w-full rounded-xl border border-white/20 bg-ink-900 px-3 text-[13px] text-[#eef1f2] placeholder:text-[#7b8790]"
              />
            </fieldset>
          </div>
        ) : null}
      </div>
    </section>
  );
}
