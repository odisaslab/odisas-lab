import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { pillars } from "@/data/process";

export function ValueProp() {
  return (
    <Section>
      <Container>
        <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <SectionTitle
            title={
              <>
                No necesitas estar en todas partes. Necesitas estar donde están tus
                clientes.
              </>
            }
            intro={
              <>
                <p>
                  Analizamos tu negocio, tu mercado y tu presencia digital para
                  encontrar dónde hay oportunidad real de crecer. Después diseñamos y
                  ejecutamos una estrategia adaptada a eso, no una plantilla que sirve
                  para todos.
                </p>
              </>
            }
          />

          <ol className="flex flex-col">
            {pillars.map((pillar, index) => (
              <Reveal key={pillar.step} delay={index * 0.08}>
                <li className="flex gap-6 border-t border-line py-7 last:border-b">
                  <span className="font-[family-name:var(--font-display)] text-sm font-medium text-primary-ink">
                    {pillar.step}
                  </span>
                  <div>
                    <h3 className="text-h3 font-semibold">{pillar.title}</h3>
                    <p className="mt-2 text-gray">{pillar.description}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}
