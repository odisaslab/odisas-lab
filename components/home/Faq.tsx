"use client";

import { useId, useState } from "react";
import { Plus } from "lucide-react";
import { Split } from "@/components/motion/Split";
import { faqs } from "@/data/faq";

export function Faq() {
  const uid = useId();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" aria-labelledby="faq-titulo" className="sec tone-light">
      <div className="wrap grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow accent mb-6" data-reveal>
            Preguntas frecuentes
          </p>
          <Split as="h2" id="faq-titulo" className="t-h2" text="Lo que *todos* preguntan antes de empezar." />
        </div>

        <div data-reveal>
          {faqs.map((item, index) => {
            const isOpen = open === index;
            return (
              <div key={item.question} className="hair-t last:border-b last:border-hair-ink">
                <h3>
                  <button
                    type="button"
                    id={`${uid}-q-${index}`}
                    aria-expanded={isOpen}
                    aria-controls={`${uid}-a-${index}`}
                    onClick={() => setOpen(isOpen ? null : index)}
                    className="group flex min-h-[4.5rem] w-full items-center justify-between gap-6 py-5 text-left font-[family-name:var(--font-display)] text-[1.15rem] font-medium md:text-[1.35rem]"
                  >
                    <span className="transition-colors group-hover:text-primary-ink">{item.question}</span>
                    <span
                      aria-hidden="true"
                      className={`flex size-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                        isOpen ? "rotate-45 border-primary bg-primary text-ink" : "border-hair-ink"
                      }`}
                    >
                      <Plus className="size-4" />
                    </span>
                  </button>
                </h3>
                <div
                  id={`${uid}-a-${index}`}
                  role="region"
                  aria-labelledby={`${uid}-q-${index}`}
                  data-open={isOpen}
                  className="acc-panel"
                >
                  <div>
                    <p className="muted max-w-2xl pb-7 text-[1.02rem]">{item.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
