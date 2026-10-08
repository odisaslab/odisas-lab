import Link from "next/link";
import { QuoteButton } from "@/components/forms/QuoteProvider";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";
import { NeedsSelector } from "@/components/sections/NeedsSelector";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "@/components/ui/Icons";
import { JsonLd } from "@/components/ui/JsonLd";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { faqPlantillas } from "@/data/faq";
import { materials } from "@/data/materials";
import { SWATCH } from "@/data/story";
import { pageMetadata, serviceJsonLd } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Plantillas ortopédicas a medida para podólogos y clínicas",
  description:
    "Fabricación de plantillas ortopédicas a medida y ortesis plantares para profesionales: resina, composite, fibra de carbono, EVA y PA11. Laboratorio podológico en Madrid con envíos a toda España.",
  path: "/plantillas",
});

export default function PlantillasPage() {
  return (
    <>
      <JsonLd
        data={serviceJsonLd({
          name: "Fabricación de plantillas ortopédicas a medida",
          description: "Plantillas a medida y ortesis plantares fabricadas para podólogos, clínicas y centros especializados de toda España.",
          path: "/plantillas",
        })}
      />
      <PageHero
        name="templates-hero"
        eyebrow="Plantillas"
        title={"Plantillas ortopédicas a medida, fabricadas para *profesionales*."}
        lead="Laboratorio podológico especializado en la fabricación de plantillas a medida y ortesis plantares. Tú prescribes; nosotros diseñamos y fabricamos con tecnología 3D y materiales técnicos."
        crumbs={[{ name: "Plantillas", path: "/plantillas" }]}
        frame={4}
        illustrationLabel="Plantilla ortopédica a medida"
        actions={
          <>
            <QuoteButton cta="templates-hero" size="lg" magnetic />
            <Button href="/materiales" variant="ghost" size="lg" cta="templates-materials">
              Ver materiales
            </Button>
          </>
        }
      />

      <Section name="needs" theme="light" label="¿Qué necesitas?">
        <NeedsSelector context="plantillas" />
      </Section>

      <Section name="templates-materials" theme="dark" label="Materiales disponibles">
        <div className="wrap">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <Reveal>
                <p className="t-eyebrow">Materiales</p>
              </Reveal>
              <SplitHeading as="h2" className="t-h2 mt-6" text={"Plantillas de resina, composite, *fibra de carbono*, EVA y PA11."} />
            </div>
            <Reveal delay={150} className="lg:col-span-4">
              <p className="t-lead">Cada material aporta algo distinto. Explóralos en el Material Lab.</p>
            </Reveal>
          </div>

          <ul className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
            {materials.map((m, index) => (
              <Reveal as="li" key={m.id} delay={(index % 3) * 80} className="group relative bg-surface">
                <Link href="/materiales" className="flex h-full flex-col justify-between p-7 transition-colors duration-500 hover:bg-surface-2 md:p-9" data-cta={`templates-material-${m.id}`}>
                  <div className="flex items-center justify-between">
                    <span className="t-num text-sm text-muted">{String(index + 1).padStart(2, "0")}</span>
                    <span aria-hidden="true" className="size-9 rounded-full border border-line-strong" style={{ background: SWATCH[m.id] }} />
                  </div>
                  <div className="mt-14">
                    <h3 className="text-2xl font-medium tracking-tight">{m.name}</h3>
                    <p className="t-body mt-2 text-[0.95rem]">{m.summary}</p>
                    <span className="link-arrow mt-4 !min-h-0">
                      Ver en el Material Lab <ArrowRight className="size-4" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </Section>

      <Section name="faq" theme="light" label="Preguntas frecuentes">
        <Faq items={faqPlantillas} />
      </Section>

      <FinalCta scene={false} title={"Hablemos de tus *plantillas*."} lead="Cuéntanos qué necesitas y te preparamos un presupuesto gratuito." />
    </>
  );
}
