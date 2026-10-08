import { QuoteButton } from "@/components/forms/QuoteProvider";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { ArrowUpRight, Lock } from "@/components/ui/Icons";
import { PageHero } from "@/components/ui/PageHero";
import { PendingText, PlaceholderBox } from "@/components/ui/Placeholder";
import { Section } from "@/components/ui/Section";
import { contact } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Acceso profesionales",
  description: "Acceso al área de clientes de Zona Pies para podólogos, clínicas y profesionales que ya trabajan con el laboratorio.",
  path: "/acceso-profesional",
  noindex: true,
});

export default function AccesoProfesionalPage() {
  const portal = contact.portal;

  return (
    <>
      <PageHero
        name="access-hero"
        eyebrow="Área de clientes"
        title={"Acceso *profesionales*."}
        lead="Entra a tu área de cliente de Zona Pies. Forma parte de la web: siempre a un clic desde el menú."
        crumbs={[{ name: "Acceso profesionales", path: "/acceso-profesional" }]}
        frame={6}
        illustrationLabel="Plantilla terminada"
      />

      <Section name="access" theme="light" label="Entrar al área de clientes" className="!pt-16 md:!pt-24">
        <div className="wrap grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="reg relative rounded-3xl border border-line-strong p-8 md:p-12 lg:col-span-7">
            <span className="reg-b" />
            <span className="grid size-14 place-items-center rounded-full bg-accent text-accent-fg">
              <Lock className="size-6" />
            </span>
            <h2 className="t-h2 mt-8">Ya trabajas con nosotros.</h2>
            <p className="t-lead mt-5 max-w-[30rem]">Accede con tus credenciales habituales.</p>

            {portal.url ? (
              <a href={portal.url} target="_blank" rel="noopener noreferrer" data-pro data-cta="access-enter" className="btn btn-primary btn-lg mt-9">
                Entrar al área de clientes <ArrowUpRight className="size-4" />
              </a>
            ) : (
              <div className="mt-9">
                <PlaceholderBox label="Enlace al área de clientes" ratio="16 / 5">
                  <p className="mt-2 text-sm text-muted">
                    <PendingText>Definir NEXT_PUBLIC_PORTAL_URL con la dirección del acceso de clientes actual</PendingText>
                  </p>
                </PlaceholderBox>
              </div>
            )}
          </div>

          <Reveal className="flex flex-col justify-between gap-10 lg:col-span-5">
            <div>
              <p className="t-eyebrow">¿Aún no eres cliente?</p>
              <SplitHeading as="h2" className="t-h3 mt-5" text={"Empieza a trabajar con *Zona Pies*."} />
              <p className="t-body mt-4">Solicita un presupuesto gratuito y te explicamos cómo incorporar el flujo digital a tu consulta.</p>
            </div>
            <div>
              <QuoteButton cta="access-quote" size="lg" prefill={{ need: "fabricacion" }}>
                Quiero trabajar con Zona Pies
              </QuoteButton>
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
