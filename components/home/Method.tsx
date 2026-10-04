"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Split } from "@/components/motion/Split";
import { method } from "@/data/home";
import { processDetail, processSteps } from "@/data/process";
import { gsap, MOTION_OK } from "@/lib/gsap";
import { whenNear } from "@/lib/lazy";

/** Una línea vertical conecta los cinco pasos y avanza con el scroll. */
export function Method() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const scope = root.current;
    if (!scope) return;
    let mm: gsap.MatchMedia | undefined;
    const stop = whenNear(scope, () => {
    mm = gsap.matchMedia(scope);
    mm.add(MOTION_OK, () => {
      const list = scope.querySelector("[data-m-list]");
      gsap.fromTo(
        "[data-m-line]",
        { scaleY: 0 },
        {
          scaleY: 1,
          transformOrigin: "top",
          ease: "none",
          scrollTrigger: { trigger: list, start: "top 60%", end: "bottom 60%", scrub: 0.4 },
        },
      );

      gsap.utils.toArray<HTMLElement>("[data-m-step]").forEach((step) => {
        const node = step.querySelector("[data-m-node]");
        const body = step.querySelectorAll("[data-m-body]");
        gsap.set(body, { opacity: 0, y: 24 });
        gsap
          .timeline({
            scrollTrigger: { trigger: step, start: "top 62%", toggleActions: "play none none reverse" },
          })
          .to(node, { backgroundColor: "#ff6b00", scale: 1.25, duration: 0.3 }, 0)
          .to(body, { opacity: 1, y: 0, duration: 0.6, stagger: 0.06, ease: "power3.out" }, 0);
      });
    });
    });

    return () => {
      stop();
      mm?.revert();
    };
  }, []);

  return (
    <section ref={root} id="proceso" aria-labelledby="proceso-titulo" className="sec tone-dark">
      <div className="wrap">
        <p className="eyebrow accent mb-6" data-reveal>
          {method.eyebrow}
        </p>
        <Split as="h2" id="proceso-titulo" className="t-h2 max-w-[16ch]" text={method.title} />

        <ol data-m-list className="relative mt-16 md:mt-24 md:ml-[8%]">
          <span aria-hidden="true" className="absolute top-2 bottom-2 left-[0.7rem] w-px bg-hair" />
          <span
            aria-hidden="true"
            data-m-line
            className="absolute top-2 bottom-2 left-[0.7rem] w-px bg-primary"
          />
          {processSteps.map((step, index) => (
            <li key={step.step} data-m-step className="relative pb-14 pl-14 last:pb-0 md:pl-20">
              <span
                aria-hidden="true"
                data-m-node
                className="absolute top-2 left-0 size-[1.45rem] rounded-full border border-primary bg-ink"
              />
              <p data-m-body className="mono accent text-[0.75rem] tracking-[0.18em]">
                {step.step}
              </p>
              <h3 data-m-body className="t-h2 mt-2 uppercase">
                {step.title}
              </h3>
              <p data-m-body className="t-lead muted mt-4 max-w-xl">
                {step.description}
              </p>
              <p data-m-body className="mt-4 max-w-xl text-[0.95rem] text-cream">
                <span className="mono muted mr-2 text-[0.68rem] tracking-[0.16em] uppercase">Recibes</span>
                {processDetail[index].youGet}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-16 md:ml-[8%]" data-reveal>
          <Link href="/proceso" className="link-underline inline-flex items-center gap-2 text-cream">
            {method.link}
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
