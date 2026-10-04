"use client";

import { useEffect, useRef } from "react";
import { BarChart3, Cpu, FileText, Workflow, Zap } from "lucide-react";
import { CtaButton } from "@/components/home/CtaButton";
import { Split } from "@/components/motion/Split";
import { ai } from "@/data/home";
import { gsap, MOTION_OK } from "@/lib/gsap";
import { whenNear } from "@/lib/lazy";

const blockIcons = [BarChart3, Workflow, FileText, Zap];

export function AiSection() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const scope = root.current;
    if (!scope) return;
    let mm: gsap.MatchMedia | undefined;
    const stop = whenNear(scope, () => {
    mm = gsap.matchMedia(scope);
    mm.add(MOTION_OK, () => {
      // "LA MULTIPLICA." crece y se asienta con el scroll
      gsap.fromTo(
        "[data-ai-giant]",
        { scale: 0.82, opacity: 0.2, transformOrigin: "left center" },
        {
          scale: 1,
          opacity: 1,
          ease: "none",
          scrollTrigger: { trigger: "[data-ai-giant]", start: "top 95%", end: "top 45%", scrub: true },
        },
      );

      // Los datos entran al sistema y salen transformados
      const tl = gsap.timeline({
        scrollTrigger: { trigger: "[data-ai-system]", start: "top 75%", once: true },
      });
      tl.from("[data-ai-in]", { x: -30, opacity: 0, stagger: 0.1, duration: 0.7, ease: "power3.out" })
        .from("[data-ai-core]", { scale: 0.6, opacity: 0, duration: 0.8, ease: "back.out(1.6)" }, 0.3)
        .from("[data-ai-out]", { x: 30, opacity: 0, stagger: 0.1, duration: 0.7, ease: "power3.out" }, 0.8);
    });
    });

    return () => {
      stop();
      mm?.revert();
    };
  }, []);

  return (
    <section
      ref={root}
      id="ia"
      aria-labelledby="ia-titulo"
      className="sec tone-dark overflow-hidden"
    >
      <div
        aria-hidden="true"
        data-parallax="0.1"
        className="pointer-events-none absolute top-1/4 left-1/2 -z-0 size-[60rem] -translate-x-1/2 rounded-full opacity-25"
        style={{ background: "radial-gradient(closest-side, rgba(255,107,0,0.35), transparent)" }}
      />
      <div className="wrap relative">
        <p className="eyebrow accent mb-6" data-reveal>
          {ai.eyebrow}
        </p>
        <Split as="h2" id="ia-titulo" className="t-h2 max-w-[16ch]" text={ai.title} />
        <p data-ai-giant className="t-mega accent mt-3 font-[family-name:var(--font-display)]" aria-hidden="true">
          {ai.giant}
        </p>
        <p className="t-lead muted mt-10 max-w-2xl" data-reveal>
          {ai.text}
        </p>

        {/* Datos → sistema → resultado */}
        <div
          data-ai-system
          className="mt-16 grid items-center gap-8 rounded-[20px] border border-hair bg-ink-2/70 p-6 md:mt-24 md:p-10 lg:grid-cols-[1fr_auto_1fr] lg:gap-6"
        >
          <div>
            <p className="mono muted mb-4 text-[0.7rem] tracking-[0.16em] uppercase">Entra</p>
            <ul className="flex flex-col gap-4">
              {ai.inputs.map((item, index) => (
                <li key={item} data-ai-in className="flex items-center gap-4">
                  <span className="mono w-32 shrink-0 rounded-md border border-hair bg-ink px-3 py-2 text-[0.75rem] text-cream">
                    {item}
                  </span>
                  <span aria-hidden="true" className="flow flex-1" style={{ ["--i" as string]: index }} />
                </li>
              ))}
            </ul>
          </div>

          <div data-ai-core className="mx-auto flex flex-col items-center gap-3 py-4">
            <div className="relative flex size-36 items-center justify-center md:size-44">
              <span aria-hidden="true" className="core-ring absolute inset-0 rounded-full border border-dashed border-primary/60" />
              <span aria-hidden="true" className="core-ring-rev absolute inset-4 rounded-full border border-hair" />
              <span className="core-pulse flex size-20 items-center justify-center rounded-2xl bg-primary text-ink md:size-24">
                <Cpu aria-hidden="true" className="size-9" strokeWidth={1.5} />
              </span>
            </div>
            <p className="mono text-[0.7rem] tracking-[0.18em] text-cream uppercase">
              Odisas · estrategia + IA
            </p>
          </div>

          <div>
            <p className="mono muted mb-4 text-[0.7rem] tracking-[0.16em] uppercase lg:text-right">Sale</p>
            <ul className="flex flex-col gap-4">
              {ai.outputs.map((item, index) => (
                <li key={item} data-ai-out className="flex items-center gap-4 lg:flex-row-reverse">
                  <span className="mono w-40 shrink-0 rounded-md border border-primary/60 bg-primary/10 px-3 py-2 text-[0.75rem] text-cream lg:text-right">
                    {item}
                  </span>
                  <span aria-hidden="true" className="flow flex-1" style={{ ["--i" as string]: index + 2 }} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bloques */}
        <div
          data-reveal-stagger
          className="mt-16 grid gap-px overflow-hidden rounded-[20px] border border-hair bg-hair sm:grid-cols-2 lg:grid-cols-4"
        >
          {ai.blocks.map((block, index) => {
            const Icon = blockIcons[index];
            return (
              <div key={block.title} className="bg-ink p-7">
                <Icon aria-hidden="true" className="size-5 text-primary" strokeWidth={1.6} />
                <h3 className="t-h3 mt-6 uppercase">{block.title}</h3>
                <p className="muted mt-3 text-[0.95rem]">{block.text}</p>
              </div>
            );
          })}
        </div>

        <ul
          data-reveal
          aria-label="Para qué usamos la IA"
          className="mt-10 flex flex-wrap gap-2.5"
        >
          {ai.uses.map((use) => (
            <li key={use} className="mono rounded-full border border-hair px-4 py-2 text-[0.72rem] tracking-wider text-cream uppercase">
              {use}
            </li>
          ))}
        </ul>

        <div className="mt-12" data-reveal>
          <CtaButton need="IA / automatización" source="ia">
            Quiero aplicar IA a mi negocio
          </CtaButton>
        </div>
      </div>
    </section>
  );
}
