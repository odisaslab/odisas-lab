import { Suspense } from "react";
import { PrefilledQuoteForm } from "@/components/forms/PrefilledQuoteForm";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { Mail, Phone, WhatsApp } from "@/components/ui/Icons";
import { JsonLd } from "@/components/ui/JsonLd";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { company, contact, mailUrl, telUrl, whatsappUrl } from "@/data/site";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contacto y presupuesto gratuito de plantillas a medida",
  description:
    "Solicita un presupuesto gratuito de ortesis plantares y plantillas a medida. Habla con un especialista de Zona Pies por teléfono, WhatsApp o formulario. Laboratorio en Fuenlabrada (Madrid).",
  path: "/contacto",
});

const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${company.address.street}, ${company.address.postalCode} ${company.address.city}`,
)}`;

export default function ContactoPage() {
  const channels = [
    {
      id: "phone",
      icon: <Phone className="size-5" />,
      label: "Llamar",
      value: contact.phone.display,
      href: telUrl(),
      cta: "contact-phone",
    },
    {
      id: "whatsapp",
      icon: <WhatsApp className="size-5" />,
      label: "WhatsApp",
      value: "¿Hablamos?",
      href: whatsappUrl(),
      cta: "contact-whatsapp",
    },
    {
      id: "email",
      icon: <Mail className="size-5" />,
      label: "Email",
      value: contact.email.address,
      href: mailUrl("Consulta desde la web"),
      cta: "contact-email",
    },
  ];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Inicio", path: "/" }, { name: "Contacto", path: "/contacto" }])} />
      <PageHero
        name="contact-hero"
        eyebrow="Contacto"
        title={"Hablemos de tu *caso*."}
        lead="Solicita un presupuesto gratuito o habla con un especialista de Zona Pies. Te responderemos lo antes posible."
        crumbs={[{ name: "Contacto", path: "/contacto" }]}
        frame={7}
        illustrationLabel="Plantilla de fibra de carbono"
      />

      <Section name="quote" id="presupuesto" theme="light" label="Presupuesto" className="!pt-16 md:!pt-24">
        <div className="wrap grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="min-w-0 lg:col-span-5">
            <Reveal>
              <p className="t-eyebrow">Presupuesto gratuito</p>
            </Reveal>
            <SplitHeading as="h2" className="t-h2 mt-6" text={"Cuéntanos qué *necesitas*."} />
            <Reveal delay={150}>
              <p className="t-lead mt-6 max-w-[30rem]">Cuanto más contexto nos des, mejor podremos ayudarte. Si lo prefieres, escríbenos o llámanos directamente.</p>
            </Reveal>

            <ul className="mt-10 grid gap-3">
              {channels.map((channel, index) => (
                <Reveal as="li" key={channel.id} delay={index * 90} className="min-w-0">
                  <a
                    href={channel.href}
                    data-cta={channel.cta}
                    {...(channel.id === "whatsapp" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="group flex items-center gap-5 rounded-2xl border border-line-strong p-5 transition-colors duration-500 hover:border-accent hover:bg-surface-2"
                  >
                    <span className="grid size-12 shrink-0 place-items-center rounded-full border border-line-strong text-accent-text transition-colors duration-500 group-hover:bg-accent group-hover:text-accent-fg">{channel.icon}</span>
                    <span className="min-w-0">
                      <span className="hud block text-muted">{channel.label}</span>
                      <span className="mt-1 block text-lg font-medium tracking-tight [overflow-wrap:anywhere] md:text-xl">{channel.value}</span>
                    </span>
                  </a>
                </Reveal>
              ))}
            </ul>

            <Reveal delay={300}>
              <address className="mt-8 not-italic text-[0.95rem] leading-relaxed text-muted">
                <span className="hud block">Laboratorio</span>
                <span className="mt-2 block text-fg">
                  {company.legalName}
                  <br />
                  {company.address.street}
                  <br />
                  {company.address.postalCode} {company.address.city} ({company.address.region})
                </span>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="link-arrow mt-2" data-cta="contact-map">
                  Cómo llegar ↗
                </a>
              </address>
            </Reveal>
          </div>

          <div className="min-w-0 lg:col-span-7">
            <div className="reg relative rounded-3xl border border-line-strong p-6 md:p-10">
              <span className="reg-b" />
              <h3 className="t-h3 mb-8">Solicita tu presupuesto</h3>
              <Suspense fallback={<p className="text-muted">Cargando formulario…</p>}>
                <PrefilledQuoteForm />
              </Suspense>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
