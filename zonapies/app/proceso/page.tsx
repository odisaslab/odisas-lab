import { FinalCta } from "@/components/sections/FinalCta";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { QuoteButton } from "@/components/forms/QuoteProvider";
import { Button } from "@/components/ui/Button";
import { JsonLd } from "@/components/ui/JsonLd";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { pageMetadata, serviceJsonLd } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "El proceso: del escaneo 3D a la ortesis plantar terminada",
  description:
    "Cinco etapas conectadas: digitalizar, diseñar, personalizar, fabricar y entregar. Fabricación de ortesis plantares a medida en aproximadamente tres días hábiles y envíos a toda España.",
  path: "/proceso",
});

export default function ProcesoPage() {
  return (
    <>
      <JsonLd
        data={serviceJsonLd({
          name: "Proceso de fabricación de ortesis plantares a medida",
          description: "Digitalizamos, diseñamos, personalizamos, fabricamos y entregamos: de la prescripción al resultado.",
          path: "/proceso",
        })}
      />
      <PageHero
        name="process-hero"
        eyebrow="Proceso"
        title={"Una cadena de producción *digital*."}
        lead="Cinco etapas conectadas entre sí. Del pie del paciente a una ortesis fabricada según tu prescripción, con un plazo aproximado de tres días hábiles desde la recepción del pedido."
        crumbs={[{ name: "Proceso", path: "/proceso" }]}
        frame={5}
        illustrationLabel="Capas de una ortesis plantar durante la fabricación"
        actions={
          <>
            <QuoteButton cta="process-hero" size="lg" magnetic />
            <Button href="/tecnologia" variant="ghost" size="lg" cta="process-tech">
              Ver la tecnología
            </Button>
          </>
        }
      />

      <Section name="process" theme="light" label="Etapas del proceso">
        <ProcessSection context="process-page" />
      </Section>

      <Section name="process-facts" theme="dark" label="Plazos y envíos" className="!py-20 md:!py-28">
        <div className="wrap">
          <dl className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-3">
            {[
              { k: "Plazo de fabricación", v: "≈ 3 días hábiles", n: "Desde la recepción del pedido." },
              { k: "Cobertura", v: "Toda España", n: "Envíos a nivel nacional, a profesionales y centros." },
              { k: "Soporte", v: "Postventa", n: "Un equipo que te acompaña durante todo el proceso." },
            ].map((fact, i) => (
              <Reveal key={fact.k} delay={i * 100} className="bg-surface p-8 md:p-10">
                <dt className="hud text-muted">{fact.k}</dt>
                <dd className="t-h2 mt-5 !leading-none">{fact.v}</dd>
                <dd className="t-body mt-4">{fact.n}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </Section>

      <FinalCta scene={false} title={"Empieza a trabajar con *Zona Pies*."} lead="Solicita un presupuesto gratuito y te explicamos cómo incorporar este flujo a tu consulta." />
    </>
  );
}
