import { ServiceCard } from "@/components/cards/ServiceCard";
import { Cta } from "@/components/sections/Cta";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/ui/JsonLd";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { processSteps } from "@/data/process";
import { services } from "@/data/services";
import { site } from "@/data/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Servicios de marketing digital",
  description:
    "SEO, Google Ads, Meta Ads, diseño web, renovación web, redes sociales y análisis web con IA. Un servicio concreto o una estrategia completa.",
  path: "/servicios",
});

export default function ServiciosPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-line pt-14 pb-16 md:pt-20 md:pb-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 right-[-10%] -z-10 size-[30rem] rounded-full bg-primary/10 blur-3xl"
        />
        <Container>
          <div className="mb-8">
            <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Servicios" }]} />
          </div>

          <h1 className="max-w-3xl text-display font-semibold">
            Servicios de marketing digital
          </h1>
          <p className="mt-6 max-w-2xl text-lead text-gray">
            Puedes contratar un servicio concreto o una estrategia completa. La diferencia
            la decide tu situación, no nuestro catálogo: primero analizamos y después te
            decimos qué necesitas de verdad y en qué orden.
          </p>
        </Container>
      </section>

      <Section>
        <Container>
          {/* El h1 ya describe la sección, así que este encabezado solo existe
              para lectores de pantalla y para no saltar de h1 a h3 */}
          <h2 className="sr-only">Servicios que ofrecemos</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <Reveal key={service.slug} delay={(index % 3) * 0.06}>
                <ServiceCard service={service} />
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="light">
        <Container>
          <SectionTitle
            label="Cómo trabajamos"
            title="El mismo método en todos los servicios"
            intro="Da igual si el proyecto es una campaña, una web o una estrategia completa: el orden no cambia."
          />
          <ol className="mt-12 grid gap-px overflow-hidden rounded-[var(--radius-card)] bg-line md:grid-cols-2 lg:grid-cols-5">
            {processSteps.map((step) => (
              <li key={step.step} className="flex h-full flex-col bg-white p-6">
                <span className="font-[family-name:var(--font-display)] text-sm font-medium text-primary-ink">
                  {step.step}
                </span>
                <h3 className="mt-4 text-[1.05rem] font-semibold">{step.title}</h3>
                <p className="mt-2 text-[0.9rem] text-gray">{step.description}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Cta />

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
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Servicios de Odisas Lab",
          itemListElement: services.map((service, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: service.name,
            url: `${site.url}/servicios/${service.slug}`,
          })),
        }}
      />
    </>
  );
}
