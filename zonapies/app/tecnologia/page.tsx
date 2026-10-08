import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { FinalCta } from "@/components/sections/FinalCta";
import { Button } from "@/components/ui/Button";
import { JsonLd } from "@/components/ui/JsonLd";
import { PageHero } from "@/components/ui/PageHero";
import { Check } from "@/components/ui/Icons";
import { Section } from "@/components/ui/Section";
import { TechVisual } from "@/components/visuals/TechVisual";
import { QuoteButton } from "@/components/forms/QuoteProvider";
import { techBlocks } from "@/data/tech";
import { pageMetadata, serviceJsonLd } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Tecnología: escaneo 3D, diseño digital y fabricación de plantillas",
  description:
    "La tecnología detrás de cada plantilla: escaneo 3D, diseño digital, software de prescripción, fabricación avanzada y control de calidad para ortesis plantares a medida.",
  path: "/tecnologia",
});

export default function TecnologiaPage() {
  return (
    <>
      <JsonLd
        data={serviceJsonLd({
          name: "Escaneo 3D, diseño digital y fabricación avanzada de ortesis plantares",
          description: "Sistema integral de escáner 3D, software de prescripción y fabricación avanzada de plantillas a medida.",
          path: "/tecnologia",
        })}
      />
      <PageHero
        name="tech-hero"
        eyebrow="Tecnología"
        title={"La tecnología detrás de cada *plantilla*."}
        lead="Un sistema integral de escáner 3D, software de prescripción y fabricación avanzada. Del pie al producto final, sin depender de procesos manuales ni de espumas."
        crumbs={[{ name: "Tecnología", path: "/tecnologia" }]}
        frame={2}
        illustrationLabel="Malla digital del pie con puntos de análisis"
        actions={
          <>
            <QuoteButton cta="tech-hero" size="lg" magnetic />
            <Button href="/proceso" variant="ghost" size="lg" cta="tech-process">
              Descubrir el proceso
            </Button>
          </>
        }
      />

      {techBlocks.map((block, index) => {
        const dark = index % 2 === 1;
        return (
          <Section key={block.id} name={`tech-${block.id}`} id={block.id} theme={dark ? "dark" : "light"} className="!py-20 md:!py-28" labelledBy={`tech-title-${block.id}`}>
            <div className="wrap grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
              <div className={`lg:col-span-6 ${index % 2 === 1 ? "lg:order-2" : ""}`}>
                <Reveal>
                  <p className="hud flex items-center gap-4 text-muted">
                    <span className="t-num text-3xl text-fg">{block.n}</span>
                    {block.title}
                  </p>
                </Reveal>
                <SplitHeading id={`tech-title-${block.id}`} as="h2" className="t-h2 mt-6 max-w-[16ch]" text={block.lead} />
                <Reveal as="ul" delay={150} className="mt-8 grid gap-3">
                  {block.points.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-[1.0625rem]">
                      <Check className="mt-1.5 size-4 shrink-0 text-accent-text" />
                      <span>{point}</span>
                    </li>
                  ))}
                </Reveal>
                {block.id === "materiales" ? (
                  <Reveal delay={220} className="mt-8">
                    <Link href="/materiales" className="link-arrow" data-cta="tech-materials">
                      Explorar el Material Lab →
                    </Link>
                  </Reveal>
                ) : null}
              </div>
              <Reveal delay={100} className={`lg:col-span-6 ${index % 2 === 1 ? "lg:order-1" : ""}`}>
                <TechVisual id={block.id} />
              </Reveal>
            </div>
          </Section>
        );
      })}

      <FinalCta scene={false} title={"¿Quieres ver la tecnología en tu *consulta*?"} lead="Cuéntanos tu caso y un especialista te explica cómo encaja el flujo digital de Zona Pies." />
    </>
  );
}
