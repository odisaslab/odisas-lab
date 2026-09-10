import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { processSteps } from "@/data/process";

export function Methodology() {
  return (
    <Section id="proceso" tone="light">
      <Container>
        <SectionTitle
          label="Metodología"
          title="No empezamos diseñando. Empezamos entendiendo."
          intro="Cinco pasos que se repiten en todos los proyectos, sea una web, una campaña o una estrategia completa."
        />

        <ol className="mt-14 grid gap-px overflow-hidden rounded-[var(--radius-card)] bg-line md:grid-cols-2 lg:grid-cols-5">
          {processSteps.map((item, index) => (
            <Reveal key={item.step} delay={index * 0.06}>
              <li className="flex h-full flex-col bg-white p-7">
                <span className="font-[family-name:var(--font-display)] text-sm font-medium text-primary-ink">
                  {item.step}
                </span>
                <h3 className="mt-5 text-h3 font-semibold">{item.title}</h3>
                <p className="mt-3 text-[0.95rem] text-gray">{item.description}</p>
              </li>
            </Reveal>
          ))}
        </ol>

        <div className="mt-12">
          <Button href="/proceso" variant="outline" withArrow>
            Ver el proceso en detalle
          </Button>
        </div>
      </Container>
    </Section>
  );
}
