import { ServiceCard } from "@/components/cards/ServiceCard";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { services } from "@/data/services";

export function Services() {
  return (
    <Section id="servicios" tone="light">
      <Container>
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionTitle
            label="Servicios"
            title="Todo lo que necesita tu negocio para crecer online"
            intro="Puedes contratar un servicio concreto o una estrategia completa. Lo decidimos después de analizar tu caso."
          />
          <Button href="/servicios" variant="outline" withArrow className="shrink-0">
            Ver todos los servicios
          </Button>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <Reveal key={service.slug} delay={(index % 3) * 0.06}>
              <ServiceCard service={service} />
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
