import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { about } from "@/data/about";


export function About() {
  return (
    <Section id="sobre">
      <Container>
        <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <SectionTitle
              label="Sobre Odisas Lab"
              title="Detrás de Odisas Lab está Alejandro"
              intro={
                <>
                  {about.intro.slice(0, 2).map((paragraph, index) => (
                    <p key={paragraph.slice(0, 24)} className={index > 0 ? "mt-4" : ""}>
                      {paragraph}
                    </p>
                  ))}
                </>
              }
            />
            <div className="mt-10">
              <Button href="/sobre-odisas-lab" variant="outline" withArrow>
                Conocer Odisas Lab
              </Button>
            </div>
          </div>

          <dl className="flex flex-col">
            {about.advantages.map((advantage) => (
              <div key={advantage.title} className="border-t border-line py-7 last:border-b">
                <dt className="text-h3 font-semibold text-dark">{advantage.title}</dt>
                <dd className="mt-2 text-gray">{advantage.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </Section>
  );
}
