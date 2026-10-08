import { QuoteForm } from "@/components/forms/QuoteForm";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { FinalCta } from "@/components/sections/FinalCta";
import { Button } from "@/components/ui/Button";
import { JsonLd } from "@/components/ui/JsonLd";
import { PageHero } from "@/components/ui/PageHero";
import { PendingText } from "@/components/ui/Placeholder";
import { Section } from "@/components/ui/Section";
import { franchisePending, pillars } from "@/data/franchise";
import { pageMetadata, serviceJsonLd } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Franquicias Zona Pies: lleva el laboratorio de ortesis a tu mercado",
  description:
    "Lleva Zona Pies a tu mercado: un modelo apoyado en tecnología de escaneo 3D, fabricación avanzada, formación y acompañamiento del equipo.",
  path: "/franquicias",
});

export default function FranquiciasPage() {
  return (
    <>
      <JsonLd
        data={serviceJsonLd({
          name: "Franquicia de laboratorio de ortesis plantares",
          description: "Modelo de negocio con tecnología de escaneo 3D, fabricación avanzada, formación y acompañamiento.",
          path: "/franquicias",
        })}
      />
      <PageHero
        name="franchise-hero"
        eyebrow="Franquicias"
        title={"Lleva Zona Pies a tu *mercado*."}
        lead="Un modelo, un equipo y una tecnología para crecer con nosotros: escáner 3D, software de prescripción y fabricación avanzada, con formación y acompañamiento."
        crumbs={[{ name: "Franquicias", path: "/franquicias" }]}
        frame={7}
        illustrationLabel="Plantilla de fibra de carbono"
        actions={
          <Button href="#informacion" size="lg" cta="franchise-hero" magnetic>
            Quiero información
          </Button>
        }
      />

      <Section name="franchise-pillars" theme="light" label="El modelo">
        <div className="wrap">
          <Reveal>
            <p className="t-eyebrow">El modelo</p>
          </Reveal>
          <SplitHeading as="h2" className="t-h2 mt-6 max-w-[16ch]" text={"Seis pilares para *crecer*."} />
          <ul className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
            {pillars.map((pillar, index) => (
              <Reveal as="li" key={pillar.id} delay={(index % 3) * 80} className="group bg-surface p-8 transition-colors duration-500 hover:bg-surface-2 md:p-10">
                <span className="t-num text-sm text-muted">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-12 text-2xl font-medium tracking-tight">{pillar.title}</h3>
                <p className="t-body mt-3">{pillar.body}</p>
              </Reveal>
            ))}
          </ul>
          <p className="mt-8 text-sm">
            <PendingText>{franchisePending}</PendingText>
          </p>
        </div>
      </Section>

      <Section name="franchise-contact" id="informacion" theme="dark" label="Solicitar información">
        <div className="wrap grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="t-eyebrow">Hablemos</p>
            </Reveal>
            <SplitHeading as="h2" className="t-h2 mt-6" text={"Quiero *información*."} />
            <Reveal delay={150}>
              <p className="t-lead mt-6 max-w-[28rem]">Cuéntanos tu mercado y tu experiencia. Un responsable de Zona Pies se pondrá en contacto contigo.</p>
            </Reveal>
          </div>
          <div className="reg relative rounded-3xl border border-line-strong p-6 md:p-10 lg:col-span-7">
            <span className="reg-b" />
            <QuoteForm
              source="franchise-info"
              prefill={{ need: "franquicia" }}
              lockedNeed
              submitLabel="Quiero información"
              messagePlaceholder="Cuéntanos en qué zona te gustaría operar y tu experiencia en el sector."
              successTitle="Solicitud recibida."
            />
          </div>
        </div>
      </Section>

      <FinalCta scene={false} title={"Crezcamos *juntos*."} lead="Si prefieres una primera conversación informal, escríbenos o llámanos." />
    </>
  );
}
