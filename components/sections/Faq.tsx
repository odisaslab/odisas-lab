import { Accordion } from "@/components/ui/Accordion";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { faqs } from "@/data/faq";

export function Faq() {
  return (
    <Section id="faq">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <SectionTitle
            label="Preguntas frecuentes"
            title="Lo que suelen preguntarnos antes de empezar"
            intro="Si tu duda no está aquí, escríbenos y te la resolvemos sin compromiso."
          />
          <Accordion items={faqs} />
        </div>
      </Container>
    </Section>
  );
}
