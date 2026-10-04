"use client";

import { useEffect, useRef } from "react";
import { CtaButton } from "@/components/home/CtaButton";
import { Split } from "@/components/motion/Split";
import { journey } from "@/data/home";
import { gsap, MOTION_DESKTOP, MOTION_OK, ScrollTrigger } from "@/lib/gsap";

/**
 * Narrativa SEO → Ads → Web → Conversión → Odisas.
 * Escritorio con movimiento: la sección se fija y el scroll avanza el recorrido.
 * Móvil / tablet / movimiento reducido: lista vertical que se dibuja al hacer scroll.
 * El HTML es el mismo en ambos casos.
 */
export function Journey() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const scope = root.current;
    if (!scope) return;
    const mm = gsap.matchMedia(scope);

    mm.add(MOTION_DESKTOP, () => {
      scope.dataset.mode = "pin";
      const steps = gsap.utils.toArray<HTMLElement>("[data-j-step]");
      const dots = gsap.utils.toArray<HTMLElement>("[data-j-dot]");
      const labels = gsap.utils.toArray<HTMLElement>("[data-j-label]");
      const fill = scope.querySelector("[data-j-fill]");

      gsap.set(steps.slice(1), { opacity: 0, y: 50 });
      gsap.set(fill, { scaleX: 0, transformOrigin: "left" });
      gsap.set(labels[0], { color: "#f3efe8" });

      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
          trigger: scope.querySelector("[data-j-stage]"),
          start: "top top",
          end: "+=380%",
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          refreshPriority: 1,
          invalidateOnRefresh: true,
        },
      });

      tl.to(fill, { scaleX: 1, ease: "none", duration: steps.length - 1 }, 0);
      dots.forEach((dot, i) => {
        tl.to(dot, { backgroundColor: "#ff6b00", scale: 1.4, duration: 0.2 }, Math.max(0, i - 0.1));
        if (i > 0) tl.to(labels[i], { color: "#f3efe8", duration: 0.2 }, i - 0.1);
      });
      steps.forEach((step, i) => {
        if (i === 0) return;
        tl.to(steps[i - 1], { opacity: 0, y: -50, duration: 0.35 }, i - 0.45);
        tl.to(step, { opacity: 1, y: 0, duration: 0.4 }, i - 0.3);
      });
      tl.to({}, { duration: 0.6 }); // pausa final sobre "Crecimiento"

      return () => {
        delete scope.dataset.mode;
      };
    });

    mm.add(MOTION_OK, () => {
      // Lista vertical: la línea se dibuja a medida que avanzas
      const list = scope.querySelector("[data-j-list]");
      if (!list) return;
      const mobile = window.matchMedia("(max-width: 1023px)").matches;
      if (!mobile) return;
      const line = scope.querySelector("[data-j-vline]");
      gsap.fromTo(
        line,
        { scaleY: 0 },
        {
          scaleY: 1,
          transformOrigin: "top",
          ease: "none",
          scrollTrigger: { trigger: list, start: "top 70%", end: "bottom 70%", scrub: true },
        },
      );
      gsap.utils.toArray<HTMLElement>("[data-j-step]").forEach((step) => {
        gsap.from(step, {
          opacity: 0,
          x: 20,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: { trigger: step, start: "top 80%", once: true },
        });
      });
    });

    const refresh = () => ScrollTrigger.refresh();
    if (document.fonts?.ready) document.fonts.ready.then(refresh);

    return () => mm.revert();
  }, []);

  return (
    <section ref={root} id="recorrido" aria-labelledby="recorrido-titulo" className="journey tone-dark">
      <div data-j-stage className="journey-stage wrap">
        <div className="journey-head">
          <p className="eyebrow accent mb-5" data-reveal>
            {journey.eyebrow}
          </p>
          <Split as="h2" id="recorrido-titulo" className="t-h2 max-w-[18ch]" text={journey.title} />
        </div>

        <div className="journey-body">
          <ol data-j-list className="journey-list relative">
            <span
              aria-hidden="true"
              data-j-vline
              className="absolute top-2 bottom-2 left-[0.45rem] w-px bg-primary/70 lg:hidden"
            />
            {journey.steps.map((step, index) => (
              <li key={step.tag} data-j-step className="journey-step pl-9 lg:pl-0">
                <span
                  aria-hidden="true"
                  className="absolute top-2 left-0 size-[0.95rem] rounded-full border border-primary bg-ink lg:hidden"
                />
                <p className="mono accent text-[0.75rem] tracking-[0.18em] uppercase">
                  0{index + 1} · {step.tag}
                </p>
                <p className="journey-outcome mt-2 font-[family-name:var(--font-display)] font-semibold uppercase">
                  → {step.outcome}
                </p>
                <p className="t-lead muted mt-3 max-w-xl">{step.text}</p>
              </li>
            ))}
          </ol>

          {/* Pista de estaciones: solo en modo fijado */}
          <div aria-hidden="true" className="journey-track">
            <div className="relative h-px bg-hair">
              <span data-j-fill className="absolute inset-0 bg-primary" />
            </div>
            <div className="mt-0 flex justify-between">
              {journey.steps.map((step, index) => (
                <div
                  key={step.tag}
                  data-j-label
                  className="mono -mt-[7px] flex flex-col items-center gap-3 text-[0.7rem] tracking-[0.14em] text-mute uppercase first:items-start last:items-end"
                >
                  <span data-j-dot className="block size-[13px] rounded-full bg-[#3a3a40]" />
                  {step.tag}
                  <span className="sr-only">{index}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <div className="wrap pb-24 md:pb-32">
        <CtaButton need="Conseguir más clientes" source="recorrido">
          Quiero que me encuentren
        </CtaButton>
      </div>
    </section>
  );
}
