import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { BeforeAfter } from "@/components/sections/BeforeAfter";
import { Accordion } from "@/components/ui/Accordion";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/ui/JsonLd";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { NewWebMockup, OldWebMockup } from "@/components/visuals/WebMockup";
import { getService, getServices, services } from "@/data/services";
import { site } from "@/data/site";
import { faqSchema, pageMeta } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const service = getService(slug);

  if (!service) {
    return { title: "Servicio no encontrado", robots: { index: false } };
  }

  return pageMeta({
    title: service.metaTitle,
    description: service.metaDescription,
    path: `/servicios/${service.slug}`,
  });
}

export default async function ServicioPage({ params }: PageProps) {
  const { slug } = await params;
  const service = getService(slug);

  if (!service) notFound();

  const related = getServices(service.related);
  const url = `${site.url}/servicios/${service.slug}`;

  return (
    <>
      {/* Cabecera */}
      <section className="relative overflow-hidden border-b border-line pt-14 pb-16 md:pt-20 md:pb-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 right-[-10%] -z-10 size-[30rem] rounded-full bg-primary/10 blur-3xl"
        />
        <Container>
          <div className="mb-8">
            <Breadcrumbs
              items={[
                { label: "Inicio", href: "/" },
                { label: "Servicios", href: "/servicios" },
                { label: service.name },
              ]}
            />
          </div>

          <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
            <div>
              <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary-soft">
                <ServiceIcon name={service.icon} className="size-5 text-primary" />
              </span>

              <h1 className="mt-7 text-display font-semibold">{service.h1}</h1>

              <div className="mt-7 flex max-w-2xl flex-col gap-4 text-lead text-gray">
                {service.intro.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                ))}
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Button href="/contacto" size="lg" withArrow>
                  Quiero hablar de {service.name}
                </Button>
                <Button href="/proceso" variant="outline" size="lg">
                  Cómo trabajamos
                </Button>
              </div>
            </div>

            <div className="rounded-[var(--radius-card)] border border-line bg-white p-7 shadow-[var(--shadow-card)] lg:mt-16">
              <h2 className="text-[0.95rem] font-medium text-gray">
                Esto es para ti si te suena alguna de estas
              </h2>
              <ul className="mt-6 flex flex-col gap-4">
                {service.signals.map((signal) => (
                  <li key={signal} className="flex gap-3">
                    <Check
                      aria-hidden="true"
                      className="mt-1 size-4 shrink-0 text-primary"
                      strokeWidth={2.5}
                    />
                    <span className="text-[0.95rem] text-text">{signal}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* Qué hacemos */}
      <Section tone="light">
        <Container>
          <SectionTitle
            label="Qué hacemos"
            title="Trabajo concreto, no una lista de palabras"
            intro={service.claim}
          />

          <div className="mt-14 grid gap-px overflow-hidden rounded-[var(--radius-card)] bg-line sm:grid-cols-2 lg:grid-cols-3">
            {service.work.map((item, index) => (
              <Reveal key={item.title} delay={(index % 3) * 0.06}>
                <div className="h-full bg-white p-7">
                  <span
                    aria-hidden="true"
                    className="block h-1 w-8 rounded-full bg-primary"
                  />
                  <h3 className="mt-6 text-h3 font-semibold">{item.title}</h3>
                  <p className="mt-3 text-[0.95rem] text-gray">{item.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* Antes / Después: protagonismo en renovación web */}
      {service.slug === "renovacion-web" ? (
        <Section>
          <Container>
            <SectionTitle
              label="Antes y después"
              title="La diferencia se ve en cinco segundos"
              intro="Lo que cambia no es solo el aspecto: cambia la velocidad, la claridad del mensaje y el número de personas que acaban contactando."
            />
            <div className="mt-12">
              <BeforeAfter
                before={<OldWebMockup />}
                after={<NewWebMockup />}
                description="Comparador entre una web anticuada y su versión renovada"
                note="Ilustración de ejemplo. Sustituir por capturas reales de proyectos cuando estén disponibles."
              />
            </div>
          </Container>
        </Section>
      ) : null}

      {/* Qué incluye */}
      <Section tone={service.slug === "renovacion-web" ? "light" : "white"}>
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
            <SectionTitle
              label="Qué incluye"
              title="Todo lo que entra en el servicio"
              intro="Si algo de tu caso no está aquí, lo hablamos y lo ajustamos antes de presupuestar."
            />
            <ul className="grid gap-4 sm:grid-cols-2">
              {service.includes.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 rounded-[var(--radius-card)] border border-line bg-white p-4"
                >
                  <Check
                    aria-hidden="true"
                    className="size-4 shrink-0 text-primary"
                    strokeWidth={2.5}
                  />
                  <span className="text-[0.95rem] font-medium text-dark">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      {/* FAQ del servicio */}
      <Section tone={service.slug === "renovacion-web" ? "white" : "light"}>
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <SectionTitle
              label="Preguntas frecuentes"
              title={`Dudas habituales sobre ${service.name}`}
              intro="Si tu duda no está aquí, escríbenos y te contestamos sin compromiso."
            />
            <Accordion items={service.faqs} />
          </div>
        </Container>
      </Section>

      {/* Servicios relacionados */}
      {related.length > 0 ? (
        <Section>
          <Container>
            <h2 className="text-h2 font-semibold">Suele combinarse con</h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={`/servicios/${item.slug}`}
                  className="group flex flex-col rounded-[var(--radius-card)] border border-line bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
                >
                  <ServiceIcon name={item.icon} className="size-5 text-primary" />
                  <h3 className="mt-5 text-h3 font-semibold">{item.name}</h3>
                  <p className="mt-2 text-[0.95rem] text-gray">{item.summary}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-[0.95rem] font-medium text-dark transition-colors group-hover:text-primary-ink">
                    Ver servicio
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      {/* CTA final del servicio */}
      <section className="bg-dark py-20 md:py-28">
        <Container>
          <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-primary px-8 py-14 md:px-14 md:py-20">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-white/10"
            />
            <div className="relative max-w-2xl">
              <h2 className="text-h2 font-semibold text-dark">
                ¿Hablamos de tu caso?
              </h2>
              <p className="mt-5 text-lead text-dark/80">
                Cuéntanos tu situación y te decimos si {service.name} es lo que necesitas
                ahora o si hay algo más urgente que atender primero.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Button href="/contacto" variant="dark" size="lg" withArrow>
                  Hablemos
                </Button>
                <Button
                  href="/servicios"
                  variant="outlineOnPrimary"
                  size="lg"
                >
                  Ver todos los servicios
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: service.name,
          serviceType: service.name,
          description: service.metaDescription,
          url,
          provider: { "@id": `${site.url}#organization` },
          areaServed: { "@type": "Country", name: "España" },
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: `Qué incluye ${service.name}`,
            itemListElement: service.includes.map((item) => ({
              "@type": "Offer",
              itemOffered: { "@type": "Service", name: item },
            })),
          },
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
              name: "Servicios",
              item: `${site.url}/servicios`,
            },
            { "@type": "ListItem", position: 3, name: service.name, item: url },
          ],
        }}
      />
      <JsonLd data={faqSchema(service.faqs)} />
    </>
  );
}
