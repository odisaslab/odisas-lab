import { QuoteForm } from "@/components/forms/QuoteForm";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { FinalCta } from "@/components/sections/FinalCta";
import { Button } from "@/components/ui/Button";
import { JsonLd } from "@/components/ui/JsonLd";
import { PageHero } from "@/components/ui/PageHero";
import { PendingText } from "@/components/ui/Placeholder";
import { Section } from "@/components/ui/Section";
import { trainingBlocks } from "@/data/training";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Formación para podólogos: cursos y recursos de ortesis plantares",
  description:
    "Comparte el conocimiento: cursos, formación profesional, próximas formaciones y recursos para podólogos que quieren dominar el flujo digital de ortesis plantares.",
  path: "/formacion",
});

export default function FormacionPage() {
  return (
    <>
      <PageHero
        name="training-hero"
        eyebrow="Formación"
        title={"Comparte el *conocimiento*."}
        lead="Cursos, formación profesional, eventos y recursos para profesionales que quieren dominar el diseño y la fabricación digital de ortesis plantares."
        crumbs={[{ name: "Formación", path: "/formacion" }]}
        frame={3}
        illustrationLabel="Diseño digital de una plantilla"
        actions={
          <Button href="#inscripcion" size="lg" cta="training-hero" magnetic>
            Inscribirme
          </Button>
        }
      />

      <Section name="training-platform" theme="light" label="Plataforma de formación">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <Reveal>
                <p className="t-eyebrow">Plataforma</p>
              </Reveal>
              <SplitHeading as="h2" className="t-h2 mt-6" text={"Aprende con *método*."} />
              <Reveal delay={150}>
                <p className="t-lead mt-6">Una experiencia de formación pensada para profesionales: contenidos claros, práctica y acompañamiento.</p>
                <p className="mt-6 text-sm">
                  <PendingText>Metodología, programa y formato: pendiente de proporcionar por Zona Pies</PendingText>
                </p>
              </Reveal>
            </div>
          </div>

          <div className="grid gap-4 lg:col-span-8">
            {trainingBlocks.map((block, index) => (
              <Reveal key={block.id} delay={index * 80}>
                <article className="group relative overflow-hidden rounded-3xl border border-line-strong p-7 transition-colors duration-500 hover:border-fg md:p-10">
                  <span aria-hidden="true" className="deco-num absolute right-7 top-5" data-n={String(index + 1).padStart(2, "0")} />
                  <h3 className="t-h3">{block.title}</h3>
                  <p className="t-body mt-3 max-w-[30rem]">{block.body}</p>
                  <p className="mt-6 text-sm">
                    <PendingText>{block.pending}</PendingText>
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <Section name="training-signup" id="inscripcion" theme="dark" label="Inscripción">
        <div className="wrap grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="t-eyebrow">Inscripción</p>
            </Reveal>
            <SplitHeading as="h2" className="t-h2 mt-6" text={"Reserva tu *plaza*."} />
            <Reveal delay={150}>
              <p className="t-lead mt-6 max-w-[28rem]">Déjanos tus datos y te avisaremos de las próximas formaciones.</p>
            </Reveal>
          </div>
          <div className="reg relative rounded-3xl border border-line-strong p-6 md:p-10 lg:col-span-7">
            <span className="reg-b" />
            <QuoteForm
              source="training-signup"
              prefill={{ need: "formacion" }}
              lockedNeed
              submitLabel="Quiero inscribirme"
              messagePlaceholder="¿Qué formación te interesa? Cuéntanos tu experiencia previa."
              successTitle="Inscripción recibida."
            />
          </div>
        </div>
      </Section>

      <FinalCta scene={false} title={"Aprende *con nosotros*."} lead="Si prefieres hablar antes con alguien del equipo, escríbenos." />
    </>
  );
}
