import Image from "next/image";
import { Check } from "lucide-react";
import { Cta } from "@/components/sections/Cta";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/ui/JsonLd";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { about } from "@/data/about";
import { assets, site, trustPoints } from "@/data/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Sobre Odisas Lab",
  description:
    "Detrás de Odisas Lab está Alejandro. Marketing digital con trato directo, estrategias a medida y orientación a resultados.",
  path: "/sobre-odisas-lab",
});

export default function SobrePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-line pt-14 pb-16 md:pt-20 md:pb-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 right-[-10%] -z-10 size-[30rem] rounded-full bg-primary/10 blur-3xl"
        />
        <Container>
          <div className="mb-8">
            <Breadcrumbs
              items={[{ label: "Inicio", href: "/" }, { label: "Sobre Odisas Lab" }]}
            />
          </div>

          <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
            <div>
              <h1 className="text-display font-semibold">
                Detrás de Odisas Lab está{" "}
                <span className="text-primary-ink">Alejandro</span>
              </h1>

              <div className="mt-8 flex max-w-2xl flex-col gap-4 text-lead text-gray">
                {about.intro.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                ))}
              </div>

              <div className="mt-10">
                <Button href="/contacto" size="lg" withArrow>
                  Hablemos de tu negocio
                </Button>
              </div>
            </div>

            {/* Retrato si existe; si no, tarjeta de marca. Nunca un placeholder. */}
            <div className="lg:pt-4">
              <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-white">
                {assets.portrait ? (
                  <div className="relative aspect-[4/5] w-full">
                    <Image
                      src={assets.portrait}
                      alt={assets.portraitAlt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover"
                      priority
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-start justify-center gap-7 bg-light px-8 py-12">
                    <Image
                      src="/brand/simbolo.png"
                      alt=""
                      width={72}
                      height={76}
                      aria-hidden="true"
                      className="h-16 w-auto"
                    />
                    <p className="font-[family-name:var(--font-display)] text-h3 font-semibold text-dark">
                      {site.tagline}
                    </p>
                  </div>
                )}
                <div className="p-6">
                  <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-dark">
                    {site.owner}
                  </p>
                  <p className="mt-1 text-[0.95rem] text-gray">
                    Estrategia, ejecución y análisis en {site.name}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Ventajas de una estructura pequeña */}
      <Section tone="light">
        <Container>
          <SectionTitle
            label="Cómo se trabaja aquí"
            title="Lo que gana un cliente al no tratar con una agencia grande"
            intro="Una estructura pequeña tiene límites, pero también ventajas que conviene decir en voz alta."
          />

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {about.advantages.map((advantage, index) => (
              <Reveal key={advantage.title} delay={index * 0.06}>
                <div className="h-full rounded-[var(--radius-card)] border border-line bg-white p-7">
                  <span
                    aria-hidden="true"
                    className="block h-1 w-8 rounded-full bg-primary"
                  />
                  <h3 className="mt-6 text-h3 font-semibold">{advantage.title}</h3>
                  <p className="mt-3 text-[0.95rem] text-gray">{advantage.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* Qué no vas a encontrar */}
      <Section tone="dark">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
            <SectionTitle
              label="Sin humo"
              title="Qué no vas a encontrar aquí"
              intro="Decir lo que no hacemos suele ser más útil que repetir lo buenos que somos."
              invert
            />
            <ul className="flex flex-col gap-5">
              {about.limits.map((limit) => (
                <li key={limit.slice(0, 24)} className="flex gap-4 border-t border-white/10 pt-5">
                  <span aria-hidden="true" className="mt-3 h-px w-6 shrink-0 bg-primary" />
                  <span className="text-lead text-white/75">{limit}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      {/* Principios */}
      <Section>
        <Container>
          <SectionTitle
            label="Principios"
            title="Cuatro cosas que no se negocian"
            align="center"
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {trustPoints.map((point, index) => (
              <Reveal key={point.title} delay={index * 0.06}>
                <div className="h-full rounded-[var(--radius-card)] bg-light p-7">
                  <h3 className="text-h3 font-semibold">{point.title}</h3>
                  <p className="mt-3 text-[0.95rem] text-gray">{point.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* Herramientas */}
      <Section tone="light">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
            <SectionTitle
              label="Herramientas"
              title="Con qué se trabaja"
              intro="Las herramientas no hacen la estrategia, pero sí determinan si puedes medir lo que haces."
            />
            <dl className="grid gap-6 sm:grid-cols-2">
              {about.tools.map((tool) => (
                <div key={tool.group}>
                  <dt className="text-[0.95rem] font-medium text-dark">{tool.group}</dt>
                  <dd>
                    <ul className="mt-3 flex flex-col gap-2">
                      {tool.items.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-[0.95rem] text-gray">
                          <Check
                            aria-hidden="true"
                            className="size-3.5 shrink-0 text-primary"
                            strokeWidth={2.5}
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </Section>

      <Cta />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "Sobre Odisas Lab",
          url: `${site.url}/sobre-odisas-lab`,
          isPartOf: { "@id": `${site.url}#website` },
          about: { "@id": `${site.url}#organization` },
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
              name: "Sobre Odisas Lab",
              item: `${site.url}/sobre-odisas-lab`,
            },
          ],
        }}
      />
    </>
  );
}
