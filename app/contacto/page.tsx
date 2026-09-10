import { Clock, Instagram, Mail, MessageCircle, Phone } from "lucide-react";
import { ContactForm } from "@/components/forms/ContactForm";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/ui/JsonLd";
import { contact, site, telLink, whatsappLink } from "@/data/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Contacto",
  description:
    "Cuéntanos qué quieres mejorar en tu presencia digital. Analizamos tu caso y te respondemos en menos de 24 horas laborables.",
  path: "/contacto",
});

const channels = [
  contact.email
    ? {
        icon: Mail,
        label: "Email",
        value: contact.email,
        href: `mailto:${contact.email}`,
        external: false,
      }
    : null,
  telLink
    ? {
        icon: Phone,
        label: "Teléfono",
        value: contact.phoneDisplay,
        href: telLink,
        external: false,
      }
    : null,
  whatsappLink
    ? {
        icon: MessageCircle,
        label: "WhatsApp",
        value: "Escríbenos por WhatsApp",
        href: whatsappLink,
        external: true,
      }
    : null,
  contact.instagram
    ? {
        icon: Instagram,
        label: "Instagram",
        value: "@odisaslab",
        href: contact.instagram,
        external: true,
      }
    : null,
].filter(Boolean) as {
  icon: typeof Mail;
  label: string;
  value: string;
  href: string;
  external: boolean;
}[];

const steps = [
  {
    title: "Leemos tu mensaje",
    description: "Revisamos tu web y tu situación antes de contestar, no mandamos plantillas.",
  },
  {
    title: "Te respondemos en 24 h laborables",
    description: "Con una primera valoración y las preguntas que nos falten por resolver.",
  },
  {
    title: "Hablamos sin compromiso",
    description: "Una llamada o videollamada de 30 minutos para ver si tiene sentido trabajar juntos.",
  },
  {
    title: "Propuesta cerrada",
    description: "Alcance, plazos y precio por escrito. Si no encaja, te lo decimos.",
  },
];

export default function ContactoPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-line pt-14 pb-16 md:pt-20 md:pb-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 right-[-10%] -z-10 size-[30rem] rounded-full bg-primary/10 blur-3xl"
        />
        <Container>
          <div className="mb-8">
            <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Contacto" }]} />
          </div>

          <h1 className="max-w-3xl text-display font-semibold">
            Cuéntanos qué quieres mejorar
          </h1>
          <p className="mt-6 max-w-2xl text-lead text-gray">
            No hace falta que tengas nada definido. Con saber a qué te dedicas y qué te
            está frenando, ya podemos decirte por dónde empezaríamos.
          </p>
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.45fr_1fr] lg:gap-16">
            <div>
              <ContactForm />
            </div>

            <aside className="flex flex-col gap-10">
              {channels.length > 0 ? (
                <div>
                  <h2 className="text-h3 font-semibold">Contacto directo</h2>
                  <p className="mt-2 text-[0.95rem] text-gray">
                    Si prefieres saltarte el formulario.
                  </p>
                  <ul className="mt-6 flex flex-col gap-3">
                    {channels.map((channel) => (
                      <li key={channel.label}>
                        <a
                          href={channel.href}
                          {...(channel.external
                            ? { target: "_blank", rel: "noopener noreferrer" }
                            : {})}
                          className="group flex items-center gap-4 rounded-[var(--radius-card)] border border-line bg-white p-4 transition-colors hover:border-dark/20"
                        >
                          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft">
                            <channel.icon
                              aria-hidden="true"
                              className="size-4 text-primary"
                              strokeWidth={1.75}
                            />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-[0.8rem] text-gray">
                              {channel.label}
                            </span>
                            <span className="block truncate text-[0.95rem] font-medium text-dark transition-colors group-hover:text-primary">
                              {channel.value}
                            </span>
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="rounded-[var(--radius-card)] bg-light p-7">
                <div className="flex items-center gap-2 text-primary-ink">
                  <Clock aria-hidden="true" className="size-4" strokeWidth={1.75} />
                  <h2 className="text-[0.95rem] font-medium">Qué pasa después de enviar</h2>
                </div>
                <ol className="mt-6 flex flex-col gap-6">
                  {steps.map((step, index) => (
                    <li key={step.title} className="flex gap-4">
                      <span className="font-[family-name:var(--font-display)] text-sm font-medium text-primary-ink">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3 className="text-[1.05rem] font-semibold">{step.title}</h3>
                        <p className="mt-1 text-[0.9rem] text-gray">{step.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Contacto · Odisas Lab",
          url: `${site.url}/contacto`,
          isPartOf: { "@id": `${site.url}#website` },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Inicio", item: site.url },
            {
              "@type": "ListItem",
              position: 2,
              name: "Contacto",
              item: `${site.url}/contacto`,
            },
          ],
        }}
      />
    </>
  );
}
