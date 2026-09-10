import { ArrowRight, Check } from "lucide-react";
import { Cta } from "@/components/sections/Cta";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/ui/JsonLd";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { collaboration, processDetail } from "@/data/process";
import { site } from "@/data/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Nuestro proceso de trabajo",
  description:
    "Analizamos, detectamos, diseñamos, ejecutamos y optimizamos. Cinco pasos, qué recibes en cada uno y qué necesitamos de ti.",
  path: "/proceso",
});

export default function ProcesoPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-line pt-14 pb-16 md:pt-20 md:pb-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 right-[-10%] -z-10 size-[30rem] rounded-full bg-primary/10 blur-3xl"
        />
        <Container>
          <div className="mb-8">
            <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Proceso" }]} />
          </div>

          <h1 className="max-w-3xl text-display font-semibold">
            No empezamos diseñando. Empezamos{" "}
            <span className="text-primary-ink">entendiendo</span>.
          </h1>
          <p className="mt-7 max-w-2xl text-lead text-gray">
            El mismo orden en todos los proyectos, sea una web, una campaña o una
            estrategia completa. Cinco pasos, con lo que recibes en cada uno y lo que
            necesitamos de tu parte para que salga bien.
          </p>

          {/* Resumen navegable de los cinco pasos */}
          <ol className="mt-12 flex flex-wrap items-center gap-x-3 gap-y-3">
            {processDetail.map((step, index) => (
              <li key={step.step} className="flex items-center gap-3">
                <a
                  href={`#paso-${step.step}`}
                  className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-line bg-white px-4 py-2 text-[0.95rem] transition-colors hover:border-dark/25"
                >
                  <span className="font-[family-name:var(--font-display)] text-sm font-medium text-primary-ink">
                    {step.step}
                  </span>
                  {step.title}
                </a>
                {index < processDetail.length - 1 ? (
                  <ArrowRight aria-hidden="true" className="size-4 text-gray/50" />
                ) : null}
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Los cinco pasos en detalle */}
      <Section>
        <Container>
          <ol className="flex flex-col gap-16 md:gap-20">
            {processDetail.map((step) => (
              <li key={step.step} id={`paso-${step.step}`} className="scroll-mt-28">
                <Reveal>
                  <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
                    <div>
                      <span
                        aria-hidden="true"
                        className="font-[family-name:var(--font-display)] text-5xl font-semibold text-primary/25"
                      >
                        {step.step}
                      </span>
                      <h2 className="mt-4 text-h2 font-semibold">{step.title}</h2>
                      <p className="mt-5 max-w-md text-lead text-gray">{step.summary}</p>
                    </div>

                    <div className="flex flex-col gap-6">
                      <div className="rounded-[var(--radius-card)] border border-line bg-white p-7">
                        <h3 className="text-[0.95rem] font-medium text-gray">
                          Qué hacemos
                        </h3>
                        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                          {step.weDo.map((item) => (
                            <li key={item} className="flex gap-2.5">
                              <Check
                                aria-hidden="true"
                                className="mt-1 size-4 shrink-0 text-primary"
                                strokeWidth={2.5}
                              />
                              <span className="text-[0.95rem] text-text">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-[var(--radius-card)] bg-light p-6">
                          <h3 className="text-[0.85rem] font-medium text-primary-ink">
                            Qué recibes
                          </h3>
                          <p className="mt-2 text-[0.95rem] text-text">{step.youGet}</p>
                        </div>
                        <div className="rounded-[var(--radius-card)] bg-light p-6">
                          <h3 className="text-[0.85rem] font-medium text-primary-ink">
                            Qué necesitamos de ti
                          </h3>
                          <p className="mt-2 text-[0.95rem] text-text">{step.fromYou}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* Colaboración */}
      <Section tone="light">
        <Container>
          <SectionTitle
            label="Para que salga bien"
            title="Lo que hace que un proyecto funcione o se atasque"
            intro="No es cuestión de trabajar más horas. Los proyectos que salen bien tienen casi siempre estas cuatro cosas."
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {collaboration.map((item, index) => (
              <Reveal key={item.title} delay={index * 0.06}>
                <div className="h-full rounded-[var(--radius-card)] border border-line bg-white p-7">
                  <h3 className="text-h3 font-semibold">{item.title}</h3>
                  <p className="mt-3 text-[0.95rem] text-gray">{item.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* Embudo de conversión de la especificación */}
      <Section tone="dark">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
            <SectionTitle
              label="Qué buscamos"
              title="El objetivo no es tráfico. Es que alguien te contrate."
              intro="Todo el trabajo persigue mover a una persona de no conocerte a confiar en ti lo suficiente para escribirte."
              invert
            />
            <ol className="flex flex-col">
              {[
                ["Descubrimiento", "Alguien te encuentra: en Google, en redes o por recomendación."],
                ["Confianza", "Ve una web cuidada, un mensaje claro y motivos para creerte."],
                ["Interés", "Entiende qué haces y cómo se aplica a su problema concreto."],
                ["Prueba", "Encuentra señales de que sabes hacerlo: método, criterio, transparencia."],
                ["Contacto", "Te escribe, te llama o rellena el formulario."],
              ].map(([title, description], index) => (
                <li
                  key={title}
                  className="flex gap-5 border-t border-white/10 py-5 last:border-b"
                >
                  <span className="font-[family-name:var(--font-display)] text-sm font-medium text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-h3 font-semibold text-white">{title}</h3>
                    <p className="mt-1 text-[0.95rem] text-white/60">{description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="rounded-[var(--radius-card)] border border-line bg-light p-8 md:p-12">
            <h2 className="max-w-2xl text-h2 font-semibold">
              El primer paso es siempre el análisis
            </h2>
            <p className="mt-5 max-w-2xl text-lead text-gray">
              Y no cuesta nada empezar por ahí. Cuéntanos tu situación y te decimos qué
              vemos, sin compromiso y sin presentarte un presupuesto de golpe.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/contacto" size="lg" withArrow>
                Quiero el análisis
              </Button>
              <Button href="/servicios" variant="outline" size="lg">
                Ver servicios
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      <Cta />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: "Cómo trabajamos en Odisas Lab",
          description:
            "Metodología de cinco pasos: analizamos, detectamos, diseñamos, ejecutamos y optimizamos.",
          step: processDetail.map((step, index) => ({
            "@type": "HowToStep",
            position: index + 1,
            name: step.title,
            text: step.summary,
            url: `${site.url}/proceso#paso-${step.step}`,
          })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Inicio", item: site.url },
            {
              "@type": "ListItem",
              position: 2,
              name: "Proceso",
              item: `${site.url}/proceso`,
            },
          ],
        }}
      />
    </>
  );
}
