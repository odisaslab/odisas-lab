"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { QuoteButton } from "@/components/forms/QuoteProvider";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { ArrowRight, Check } from "@/components/ui/Icons";
import { ProcessVisual } from "@/components/visuals/ProcessVisual";
import { processSteps } from "@/data/process";

const stepLinks = [
  { label: "Escaneo 3D", href: "/tecnologia#escaneo" },
  { label: "Diseño digital", href: "/tecnologia#diseno" },
  { label: "Explorar materiales", href: "/materiales" },
  { label: "Fabricación avanzada", href: "/tecnologia#fabricacion" },
];

interface ProcessSectionProps {
  headingAs?: "h1" | "h2";
  context?: "home" | "process-page";
}

/**
 * Cadena de producción digital (briefing §10): cada paso ocupa casi toda la pantalla y el
 * número de etapa, fijo a la izquierda, cambia al avanzar. En móvil, bloques apilados.
 */
export function ProcessSection({ headingAs = "h2", context = "home" }: ProcessSectionProps) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: "-42% 0px -42% 0px", threshold: 0 },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const total = processSteps.length;

  return (
    <div className="wrap">
      <div className="grid gap-12 lg:grid-cols-12">
        {/* Columna fija: número de etapa */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <Reveal>
              <p className="t-eyebrow">El proceso</p>
            </Reveal>
            <SplitHeading
              as={headingAs}
              className={`${headingAs === "h1" ? "t-h1" : "t-h2"} mt-6`}
              text={context === "home" ? "Una cadena de producción *digital*." : "Del escaneo a tu consulta, paso a paso."}
            />
            <Reveal delay={150}>
              <p className="t-lead mt-6 max-w-[28rem]">Cinco etapas conectadas: del pie del paciente a una ortesis fabricada según tu prescripción.</p>
            </Reveal>

            <div className="mt-10 hidden items-end gap-6 lg:flex" aria-hidden="true">
              <span key={active} className="num-in t-num block text-[clamp(6rem,11vw,11rem)] font-medium leading-[0.8] tracking-[-0.06em]">
                {String(active + 1).padStart(2, "0")}
              </span>
              <div className="pb-2">
                <p className="hud text-accent-text">{processSteps[active].verb}</p>
                <div className="mt-4 h-px w-28 bg-line-strong">
                  <span className="block h-full bg-accent transition-[width] duration-700 ease-out" style={{ width: `${((active + 1) / total) * 100}%` }} />
                </div>
                <p className="hud mt-3 text-muted">
                  {active + 1} / {total}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Etapas */}
        <ol className="lg:col-span-7">
          {processSteps.map((step, index) => (
            <li
              key={step.n}
              ref={(el) => {
                refs.current[index] = el;
              }}
              data-index={index}
              className="flex min-h-[85svh] flex-col justify-center border-t border-line py-14 first:border-t-0 lg:min-h-[90svh]"
            >
              <Reveal>
                <p className="hud flex items-center gap-4 text-muted">
                  <span className="t-num text-2xl text-fg lg:hidden">{step.n}</span>
                  Etapa {step.n} · {step.verb}
                </p>
                <h3 className="t-h2 mt-5 max-w-[16ch]">{step.title}</h3>
                <p className="t-lead mt-5 max-w-[34rem]">{step.body}</p>
              </Reveal>
              <Reveal delay={100} className="mt-8">
                <ProcessVisual kind={step.visual} />
              </Reveal>
              <Reveal delay={150} as="ul" className="mt-8 grid gap-3 sm:grid-cols-2">
                {step.points.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-[0.95rem]">
                    <Check className="mt-1 size-4 shrink-0 text-accent-text" />
                    <span>{point}</span>
                  </li>
                ))}
              </Reveal>
              <Reveal delay={200} className="mt-8">
                {index < stepLinks.length ? (
                  <Link href={stepLinks[index].href} className="link-arrow" data-cta={`process-${step.n}`}>
                    {stepLinks[index].label} <ArrowRight className="size-4" />
                  </Link>
                ) : (
                  <QuoteButton cta="process" size="lg" magnetic />
                )}
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
