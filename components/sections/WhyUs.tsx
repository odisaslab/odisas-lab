import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { trustPoints } from "@/data/site";

export function WhyUs() {
  return (
    <Section tone="light">
      <Container>
        <SectionTitle
          label="¿Por qué Odisas Lab?"
          title="Cuatro cosas que puedes esperar siempre"
          align="center"
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {trustPoints.map((point, index) => (
            <Reveal key={point.title} delay={index * 0.06}>
              <div className="h-full rounded-[var(--radius-card)] border border-line bg-white p-7">
                <span
                  aria-hidden="true"
                  className="block h-1 w-8 rounded-full bg-primary"
                />
                <h3 className="mt-6 text-h3 font-semibold">{point.title}</h3>
                <p className="mt-3 text-[0.95rem] text-gray">{point.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
