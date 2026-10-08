"use client";

import { useState } from "react";
import { QuoteButton } from "@/components/forms/QuoteProvider";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { PlaceholderTag } from "@/components/ui/Placeholder";
import { Plus } from "@/components/ui/Icons";
import { BeforeAfter } from "@/components/visuals/BeforeAfter";
import { cases } from "@/data/cases";

/** «De la prescripción al resultado» (briefing §15): casos con comparativa y pasos que se despliegan. */
export function Cases() {
  const [open, setOpen] = useState<string | null>(cases[0].id);

  return (
    <div className="wrap">
      <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <Reveal>
            <p className="t-eyebrow">Casos reales</p>
          </Reveal>
          <SplitHeading as="h2" className="t-h2 mt-6" text={"De la prescripción al *resultado*."} />
        </div>
        <Reveal delay={150} className="lg:col-span-4">
          <p className="t-lead">Problema, diseño, material y resultado. Cada caso, explicado por el profesional.</p>
        </Reveal>
      </div>

      <div className="mt-12 grid gap-5 lg:mt-16 lg:grid-cols-3">
        {cases.map((item, index) => {
          const expanded = open === item.id;
          return (
            <Reveal key={item.id} delay={index * 100}>
              <article className="relative flex h-full flex-col rounded-3xl border border-line-strong p-4 md:p-5">
                {item.placeholder ? <PlaceholderTag>Ejemplo · caso real pendiente</PlaceholderTag> : null}
                <BeforeAfter before={item.before} after={item.after} hideTag={item.placeholder} />

                <div className="flex flex-1 flex-col px-1 pb-1 pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="t-h3">{item.title}</h3>
                      <p className="mt-2 text-sm text-muted">{item.context}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOpen(expanded ? null : item.id)}
                      aria-expanded={expanded}
                      aria-controls={`case-${item.id}`}
                      aria-label={`${expanded ? "Ocultar" : "Ver"} los pasos de ${item.title}`}
                      className="grid size-11 shrink-0 place-items-center rounded-full border border-line-strong transition-colors hover:border-fg"
                    >
                      <Plus className={`size-5 transition-transform duration-500 ${expanded ? "rotate-45" : ""}`} />
                    </button>
                  </div>

                  <div id={`case-${item.id}`} className="expand" data-open={expanded}>
                    <div>
                      <ol className="mt-6 space-y-5 border-l border-line-strong pl-6">
                        {[
                          { k: "Problema", v: item.problem },
                          { k: "Diseño", v: item.design },
                          { k: "Material", v: item.materialLabel },
                          { k: "Resultado", v: item.result },
                        ].map((row, i) => (
                          <li key={row.k} className="relative">
                            <span aria-hidden="true" className="absolute -left-[1.78rem] top-1.5 block size-2.5 rounded-full border border-accent bg-surface" />
                            <p className="hud text-accent-text">
                              {String(i + 1).padStart(2, "0")} · {row.k}
                            </p>
                            <p className="t-body mt-1.5 text-[0.95rem]">{row.v}</p>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>

      <div className="mt-12 flex flex-wrap items-center gap-5">
        <QuoteButton cta="cases" size="lg" />
        <p className="max-w-md text-sm text-muted">Las fichas son ejemplos de estructura. Los casos reales sustituirán a estos cuando haya fotografías y autorización del profesional.</p>
      </div>
    </div>
  );
}
