import { Counter } from "@/components/motion/Counter";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { Section } from "@/components/ui/Section";
import { FlowChain } from "@/components/visuals/FlowChain";

/** «Fabricamos más que plantillas» (briefing §9). Sección clara tras el recorrido 3D. */
export function WhatWeDo() {
  return (
    <Section name="what-we-do" theme="light" labelledBy="what-title">
      <div className="wrap">
        <Reveal>
          <p className="t-eyebrow">¿Qué hacemos?</p>
        </Reveal>
        <SplitHeading id="what-title" as="h2" className="t-display mt-8 max-w-[14ch]" text={"Fabricamos más que *plantillas*."} />

        <div className="mt-12 grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-6 lg:col-start-1">
            <p className="t-lead text-fg">Convertimos prescripciones y datos del pie en soluciones plantares fabricadas a medida.</p>
          </Reveal>
          <Reveal delay={150} className="lg:col-span-5 lg:col-start-8">
            <p className="t-body">
              Somos un laboratorio podológico especializado en plantillas ortopédicas a medida y ortesis plantares para podólogos, clínicas y centros especializados de toda España.
            </p>
          </Reveal>
        </div>

        <FlowChain />

        <dl className="mt-20 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-3 md:mt-28">
          <Reveal className="bg-surface p-8 md:p-10">
            <dt className="hud text-muted">Fabricación</dt>
            <dd className="mt-4 flex items-baseline gap-2">
              <span className="t-h1 !leading-none">
                <span aria-hidden="true">≈</span>
                <Counter value={3} />
              </span>
              <span className="text-lg text-muted">días hábiles</span>
            </dd>
            <dd className="t-body mt-3">Plazo aproximado desde la recepción del pedido.</dd>
          </Reveal>
          <Reveal delay={120} className="bg-surface p-8 md:p-10">
            <dt className="hud text-muted">Trayectoria</dt>
            <dd className="mt-4 flex items-baseline gap-2">
              <span className="t-h1 !leading-none">
                <Counter value={30} prefix="+" />
              </span>
              <span className="text-lg text-muted">años</span>
            </dd>
            <dd className="t-body mt-3">De experiencia fabricando plantillas a medida.</dd>
          </Reveal>
          <Reveal delay={240} className="bg-surface p-8 md:p-10">
            <dt className="hud text-muted">Cobertura</dt>
            <dd className="mt-4">
              <span className="t-h1 !leading-none">España</span>
            </dd>
            <dd className="t-body mt-3">Envíos a nivel nacional, a profesionales y centros especializados.</dd>
          </Reveal>
        </dl>
      </div>
    </Section>
  );
}
