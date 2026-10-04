"use client";

import { useEffect, useRef } from "react";
import { Check } from "lucide-react";
import { CtaButton } from "@/components/home/CtaButton";
import { Split } from "@/components/motion/Split";
import { Tilt } from "@/components/motion/Tilt";
import { diagnostic } from "@/data/home";
import { gsap, MOTION_OK } from "@/lib/gsap";
import { whenNear } from "@/lib/lazy";

/** Interfaz tipo dashboard: el análisis recorre siete áreas y termina en oportunidades. */
export function Diagnostic() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const scope = root.current;
    if (!scope) return;
    let mm: gsap.MatchMedia | undefined;
    const stop = whenNear(scope, () => {
    mm = gsap.matchMedia(scope);
    mm.add(MOTION_OK, () => {
      const rows = gsap.utils.toArray<HTMLElement>("[data-d-row]");
      const found = gsap.utils.toArray<HTMLElement>("[data-d-found]");

      gsap.set("[data-d-bar]", { scaleX: 0, transformOrigin: "left" });
      gsap.set("[data-d-done]", { opacity: 0 });
      gsap.set("[data-d-pending]", { opacity: 1 });
      gsap.set(found, { opacity: 0, y: 16 });
      gsap.set("[data-d-foundwrap]", { opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: "[data-d-panel]", start: "top 70%", once: true },
      });

      rows.forEach((row, i) => {
        const at = i * 0.55;
        tl.to(row.querySelector("[data-d-bar]"), { scaleX: 1, duration: 0.7, ease: "power2.out" }, at);
        tl.to(row.querySelector("[data-d-pending]"), { opacity: 0, duration: 0.2 }, at + 0.6);
        tl.to(row.querySelector("[data-d-done]"), { opacity: 1, duration: 0.3 }, at + 0.65);
      });
      const end = rows.length * 0.55 + 0.3;
      tl.to("[data-d-foundwrap]", { opacity: 1, duration: 0.5 }, end);
      tl.to(found, { opacity: 1, y: 0, duration: 0.55, stagger: 0.14, ease: "power3.out" }, end + 0.1);
    });
    });

    return () => {
      stop();
      mm?.revert();
    };
  }, []);

  return (
    <section ref={root} id="diagnostico" aria-labelledby="diagnostico-titulo" className="sec tone-light">
      <div className="wrap grid items-start gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div className="lg:sticky lg:top-28">
          <p className="eyebrow accent mb-6" data-reveal>
            {diagnostic.eyebrow}
          </p>
          <Split as="h2" id="diagnostico-titulo" className="t-h2" text={diagnostic.title} />
          <p className="t-h3 mt-8 max-w-[20ch]" data-reveal>
            {diagnostic.text}
          </p>
          <p className="t-lead muted mt-6 max-w-md" data-reveal>
            {diagnostic.body}
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row" data-reveal>
            <CtaButton variant="ink" to="analiza-tu-web" source="diagnostico-web" className="w-full sm:w-auto">
              {diagnostic.cta}
            </CtaButton>
            <CtaButton
              variant="ghost-dark"
              need="No lo tengo claro"
              arrow="none"
              source="diagnostico-negocio"
              className="w-full sm:w-auto"
            >
              {diagnostic.ctaSecondary}
            </CtaButton>
          </div>
        </div>

        <div data-reveal>
        <Tilt max={4} className="rounded-[20px]">
        <div
          data-d-panel
          className="tone-dark overflow-hidden rounded-[20px] border border-ink shadow-[0_30px_80px_-30px_rgba(10,10,11,0.5)]"
        >
          <div className="flex items-center justify-between border-b border-hair px-5 py-3.5">
            <div className="flex items-center gap-2" aria-hidden="true">
              <span className="size-2.5 rounded-full bg-[#3a3a40]" />
              <span className="size-2.5 rounded-full bg-[#3a3a40]" />
              <span className="size-2.5 rounded-full bg-primary" />
            </div>
            <p className="mono muted text-[0.68rem] tracking-[0.16em] uppercase">
              Diagnóstico · Odisas Lab
            </p>
          </div>

          <ul className="px-5 py-3 md:px-7">
            {diagnostic.modules.map((module, index) => (
              <li key={module} data-d-row className="py-3.5">
                <div className="flex items-center justify-between gap-4">
                  <span className="mono text-[0.75rem] tracking-[0.14em] text-cream uppercase">
                    <span className="muted">0{index + 1} </span>
                    {module}
                  </span>
                  <span className="grid justify-items-end">
                    <span
                      data-d-pending
                      className="mono muted col-start-1 row-start-1 text-[0.68rem] tracking-wider uppercase"
                    >
                      Analizando…
                    </span>
                    <span
                      data-d-done
                      className="mono col-start-1 row-start-1 flex items-center gap-1.5 text-[0.68rem] tracking-wider whitespace-nowrap text-primary uppercase"
                    >
                      <Check aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
                      Revisado
                    </span>
                  </span>
                </div>
                <div className="mt-3 h-[3px] overflow-hidden rounded bg-hair">
                  <div data-d-bar className="h-full w-full bg-primary" />
                </div>
              </li>
            ))}
          </ul>

          <div data-d-foundwrap className="border-t border-hair bg-ink-2 px-5 py-6 md:px-7">
            <p className="mono accent mb-4 flex items-center gap-2 text-[0.72rem] tracking-[0.16em] uppercase">
              <span aria-hidden="true" className="live-dot size-1.5 rounded-full bg-primary" />
              {diagnostic.foundTitle}
            </p>
            <ul className="flex flex-col gap-3">
              {diagnostic.found.map((item) => (
                <li key={item.text} data-d-found className="flex gap-3 text-[0.95rem]">
                  <span className="mono mt-0.5 w-24 shrink-0 text-[0.68rem] tracking-wider text-primary uppercase">
                    {item.area}
                  </span>
                  <span className="text-cream">{item.text}</span>
                </li>
              ))}
            </ul>
            <p className="muted mt-5 text-[0.82rem]">{diagnostic.foundNote}</p>
          </div>
        </div>
        </Tilt>
        </div>
      </div>
    </section>
  );
}
