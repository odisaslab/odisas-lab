"use client";

import { useId, useState } from "react";
import { QuoteButton } from "@/components/forms/QuoteProvider";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { PendingText } from "@/components/ui/Placeholder";
import { needDetails } from "@/data/needs";
import { needs } from "@/data/quote";
import { track } from "@/lib/analytics";

interface NeedsSelectorProps {
  headingAs?: "h1" | "h2";
  title?: string;
  context?: "home" | "plantillas";
}

/**
 * «¿Qué necesitas?» (briefing §8): selector interactivo. La web adapta el mensaje y el CTA
 * a la opción elegida, y el formulario llega ya precargado.
 */
export function NeedsSelector({ headingAs = "h2", title = "¿Qué *necesitas*?", context = "home" }: NeedsSelectorProps) {
  const [value, setValue] = useState<(typeof needDetails)[number]["value"]>("fabricacion");
  const groupId = useId();
  const detail = needDetails.find((d) => d.value === value) ?? needDetails[0];

  const choose = (next: typeof value) => {
    setValue(next);
    track("selector_choice", { need: next, context });
  };

  return (
    <div className="wrap">
      <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <Reveal>
            <p className="t-eyebrow">A tu medida</p>
          </Reveal>
          <SplitHeading as={headingAs} className={`${headingAs === "h1" ? "t-h1" : "t-h2"} mt-6`} text={title} />
        </div>
        <Reveal delay={150} className="lg:col-span-5">
          <p className="t-lead">Elige cómo quieres trabajar con Zona Pies y la web te muestra cómo encaja.</p>
        </Reveal>
      </div>

      <div role="radiogroup" aria-label="¿Qué necesitas?" className="mt-12 grid gap-3 md:grid-cols-3 lg:mt-16">
        {needs.map((need, index) => {
          const selected = need.value === value;
          return (
            <Reveal key={need.value} delay={index * 90}>
              <label className="group relative block h-full cursor-pointer">
                <input
                  type="radio"
                  name={`${groupId}-need`}
                  value={need.value}
                  checked={selected}
                  onChange={() => choose(need.value as typeof value)}
                  className="peer absolute inset-0 z-10 cursor-pointer opacity-0"
                />
                <span
                  className={`flex h-full flex-col justify-between rounded-3xl border p-6 transition-all duration-500 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-[var(--accent)] md:min-h-[14rem] md:p-8 ${
                    selected ? "border-accent bg-accent text-accent-fg" : "border-line-strong hover:border-fg"
                  }`}
                >
                  <span className={`t-num text-sm ${selected ? "" : "opacity-70"}`}>{String(index + 1).padStart(2, "0")}</span>
                  <span>
                    <span className="block min-h-[2.2em] text-[clamp(1.25rem,1rem+1vw,1.75rem)] font-medium leading-[1.1] tracking-[-0.03em]">{need.title}</span>
                    <span className={`mt-3 block text-sm leading-snug ${selected ? "opacity-95" : "text-muted"}`}>{need.audience}</span>
                  </span>
                </span>
              </label>
            </Reveal>
          );
        })}
      </div>

      {/* Contenido adaptativo */}
      <div aria-live="polite" className="mt-6 overflow-hidden rounded-3xl border border-line md:mt-8">
        <div key={detail.value} className="panel-in grid gap-10 p-6 md:p-10 lg:grid-cols-12 lg:gap-12 lg:p-14">
          <div className="lg:col-span-5">
            <p className="hud text-accent-text">{detail.tag}</p>
            <h3 className="t-h2 mt-4">{detail.headline}</h3>
            <p className="t-lead mt-5">{detail.lead}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <QuoteButton cta={`needs-${detail.value}`} size="lg" prefill={{ need: detail.value }}>
                {detail.cta}
              </QuoteButton>
            </div>
            {detail.pending ? (
              <p className="mt-6 text-sm text-muted">
                <PendingText>{detail.pending}</PendingText>
              </p>
            ) : null}
          </div>

          <ol className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line lg:col-span-7">
            {[
              { k: "Tú", v: detail.you },
              { k: "Nosotros", v: detail.us },
              { k: "Recibes", v: detail.result },
            ].map((row, index) => (
              <li key={row.k} className="flex gap-6 bg-surface p-6 md:p-8">
                <span className="t-num mt-1 w-8 shrink-0 text-sm text-accent-text">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <p className="hud text-muted">{row.k}</p>
                  <p className="mt-2 text-[1.0625rem] leading-snug tracking-tight md:text-xl">{row.v}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
