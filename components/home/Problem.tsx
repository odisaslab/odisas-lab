"use client";

import { useEffect, useRef } from "react";
import { EyeOff, Layers, LayoutTemplate, MousePointerClick, Share2, Wallet } from "lucide-react";
import { Split } from "@/components/motion/Split";
import { problem } from "@/data/home";
import { gsap, MOTION_OK } from "@/lib/gsap";
import { whenNear } from "@/lib/lazy";

const icons = [EyeOff, MousePointerClick, Wallet, Share2, Layers, LayoutTemplate];

export function Problem() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const scope = root.current;
    if (!scope) return;
    let mm: gsap.MatchMedia | undefined;
    const stop = whenNear(scope, () => {
    mm = gsap.matchMedia(scope);
    mm.add(MOTION_OK, () => {
      // Cada problema se "enciende" al cruzar el centro de la pantalla
      gsap.utils.toArray<HTMLElement>("[data-problem]").forEach((row) => {
        const chip = row.querySelector("[data-problem-chip]");
        const icon = row.querySelector("[data-problem-icon]");
        const bar = row.querySelector("[data-problem-bar]");
        gsap.set(chip, { clipPath: "inset(0 100% 0 0)" });
        gsap.set(icon, { scale: 0.6, opacity: 0 });
        gsap.set(bar, { scaleX: 0, transformOrigin: "left" });
        gsap
          .timeline({
            scrollTrigger: {
              trigger: row,
              start: "top 72%",
              end: "bottom 38%",
              toggleActions: "play reverse play reverse",
            },
          })
          .to(chip, { clipPath: "inset(0 0% 0 0)", duration: 0.7, ease: "power3.out" }, 0.1)
          .to(icon, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2)" }, 0.1)
          .to(bar, { scaleX: 1, duration: 0.7, ease: "power3.out" }, 0);
      });

      gsap.from("[data-pivot] .w > span", {
        yPercent: 112,
        duration: 1.1,
        ease: "power4.out",
        stagger: 0.08,
        scrollTrigger: { trigger: "[data-pivot]", start: "top 85%", once: true },
      });
    });
    });

    return () => {
      stop();
      mm?.revert();
    };
  }, []);

  return (
    <section ref={root} id="problema" aria-labelledby="problema-titulo" className="sec tone-light">
      <div className="wrap">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.35fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow accent mb-6" data-reveal>
              {problem.eyebrow}
            </p>
            <Split as="h2" id="problema-titulo" className="t-h2" text={problem.title} />
            <p className="t-lead muted mt-6 max-w-md" data-reveal>
              {problem.intro}
            </p>
          </div>

          <ol className="flex flex-col">
            {problem.items.map((item, index) => {
              const Icon = icons[index];
              return (
                <li key={item.title} data-problem className="hair-t relative py-8 md:py-10">
                  <span
                    aria-hidden="true"
                    data-problem-bar
                    className="absolute inset-x-0 top-0 h-[2px] bg-primary"
                  />
                  <div className="flex gap-5 md:gap-8">
                    <span
                      className="mono mt-1 w-8 shrink-0 text-[0.8rem] tracking-widest text-mute-ink"
                    >
                      0{index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="t-h3 max-w-[22ch]">
                          {item.title}
                        </h3>
                        <Icon
                          data-problem-icon
                          aria-hidden="true"
                          className="mt-1 size-6 shrink-0 text-primary-ink"
                          strokeWidth={1.5}
                        />
                      </div>
                      <p className="muted mt-3 max-w-[46ch]">
                        {item.text}
                      </p>
                      <p
                        data-problem-chip
                        className="mono mt-4 inline-block rounded-md bg-ink px-3 py-1.5 text-[0.72rem] tracking-wide text-cream"
                      >
                        <span className="text-primary">▸</span> {item.signal}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-24 md:mt-36" data-pivot>
          <Split as="p" animate={false} className="t-mega" text={problem.pivot} />
        </div>
      </div>
    </section>
  );
}
