"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { CtaButton } from "@/components/home/CtaButton";
import { Split } from "@/components/motion/Split";
import { homeServices, whatWeDo } from "@/data/home";
import { gsap, MOTION_OK, ScrollTrigger } from "@/lib/gsap";
import { whenNear } from "@/lib/lazy";
import { scrollToId } from "@/lib/lenis";

/**
 * Servicios como recorrido: a la izquierda un índice fijo que marca el servicio
 * activo; a la derecha, cada servicio ocupa su propio tramo de scroll
 * (descripción → qué hacemos → resultado → CTA → siguiente).
 */
export function Services() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const scope = root.current;
    if (!scope) return;

    let triggers: ScrollTrigger[] = [];
    let mm: gsap.MatchMedia | undefined;

    const stop = whenNear(scope, () => {
      // El índice activo funciona siempre, también con movimiento reducido
      triggers = homeServices.map((service, index) =>
        ScrollTrigger.create({
          trigger: `#servicio-${service.id}`,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => {
            if (self.isActive) setActive(index);
          },
        }),
      );

      mm = gsap.matchMedia(scope);
      mm.add(MOTION_OK, () => {
        gsap.utils.toArray<HTMLElement>("[data-service]").forEach((el) => {
          gsap.from(el.querySelectorAll("[data-s-in]"), {
            y: 36,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.08,
            scrollTrigger: { trigger: el, start: "top 72%", once: true },
          });
        });
      });
    });

    return () => {
      stop();
      triggers.forEach((trigger) => trigger.kill());
      mm?.revert();
    };
  }, []);

  const goTo = (id: string) => (event: React.MouseEvent) => {
    if (scrollToId(`servicio-${id}`)) event.preventDefault();
  };

  return (
    <section ref={root} id="que-hacemos" aria-labelledby="que-hacemos-titulo" className="sec tone-dark">
      <div className="wrap">
        <div className="max-w-5xl">
          <p className="eyebrow accent mb-6" data-reveal>
            {whatWeDo.eyebrow}
          </p>
          <Split as="h2" id="que-hacemos-titulo" className="t-h2" text={whatWeDo.title} />
          <p className="t-lead muted mt-8 max-w-2xl" data-reveal>
            {whatWeDo.text}
          </p>
          <p className="muted mt-4 max-w-2xl text-[0.95rem]" data-reveal>
            {whatWeDo.note}
          </p>
        </div>

        <div id="servicios" className="mt-20 grid gap-10 md:mt-28 lg:grid-cols-[18rem_1fr] lg:gap-16">
          {/* Índice */}
          <nav
            aria-label="Servicios"
            className="sticky top-[4.5rem] z-10 -mx-5 overflow-x-auto bg-ink/90 px-5 py-3 backdrop-blur-md md:-mx-10 md:px-10 lg:top-28 lg:mx-0 lg:self-start lg:overflow-visible lg:bg-transparent lg:p-0 lg:backdrop-blur-none"
          >
            <ol className="flex gap-2 lg:flex-col lg:gap-0">
              {homeServices.map((service, index) => {
                const on = index === active;
                return (
                  <li key={service.id} className="shrink-0">
                    <a
                      href={`#servicio-${service.id}`}
                      onClick={goTo(service.id)}
                      aria-current={on ? "true" : undefined}
                      className={`flex items-center gap-3 rounded-full border px-4 py-2 transition-colors lg:rounded-none lg:border-0 lg:border-b lg:px-0 lg:py-3.5 ${
                        on
                          ? "border-primary text-cream lg:border-b-primary"
                          : "border-hair text-mute hover:text-cream lg:border-b-hair"
                      }`}
                    >
                      <span className="mono text-[0.7rem] tracking-widest">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="font-[family-name:var(--font-display)] text-[0.95rem] whitespace-nowrap lg:text-lg">
                        {service.name}
                      </span>
                      <span
                        aria-hidden="true"
                        className={`ml-auto hidden h-px bg-primary transition-all duration-500 lg:block ${
                          on ? "w-8" : "w-0"
                        }`}
                      />
                    </a>
                  </li>
                );
              })}
            </ol>
          </nav>

          {/* Tramos */}
          <div className="flex flex-col">
            {homeServices.map((service, index) => (
              <article
                key={service.id}
                id={`servicio-${service.id}`}
                data-service
                className="hair-t py-14 first:border-t-0 first:pt-0 md:py-20 lg:min-h-[70vh]"
              >
                <p data-s-in className="mono accent text-[0.75rem] tracking-[0.18em] uppercase">
                  {String(index + 1).padStart(2, "0")} / {String(homeServices.length).padStart(2, "0")} · {service.name}
                </p>
                <h3 data-s-in className="t-h2 mt-5 max-w-[17ch]">
                  {service.claim}
                </h3>
                <p data-s-in className="t-lead muted mt-6 max-w-xl">
                  {service.description}
                </p>

                <div className="mt-10 grid gap-8 md:grid-cols-2">
                  <div data-s-in>
                    <p className="mono muted mb-4 text-[0.7rem] tracking-[0.16em] uppercase">
                      Qué hacemos
                    </p>
                    <ul className="flex flex-col gap-3">
                      {service.does.map((item) => (
                        <li key={item} className="flex gap-3">
                          <Check
                            aria-hidden="true"
                            className="mt-1 size-4 shrink-0 text-primary"
                            strokeWidth={2.25}
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div data-s-in className="rounded-2xl border border-hair bg-ink-2 p-6">
                    <p className="mono muted mb-3 text-[0.7rem] tracking-[0.16em] uppercase">
                      Lo que consigues
                    </p>
                    <p className="font-[family-name:var(--font-display)] text-xl leading-snug text-cream">
                      {service.benefit}
                    </p>
                  </div>
                </div>

                <div data-s-in className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                  <CtaButton need={service.need} source={`servicio-${service.id}`}>
                    {service.cta}
                  </CtaButton>
                  <Link
                    href={`/servicios/${service.slug}`}
                    className="link-underline inline-flex items-center gap-1 text-[0.95rem] text-cream"
                  >
                    Ver {service.name} en detalle
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
