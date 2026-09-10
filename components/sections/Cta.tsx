import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { contact, telLink, whatsappLink } from "@/data/site";

/** Solo se muestran los canales que están configurados. */
const directContact = [
  contact.email
    ? { label: contact.email, href: `mailto:${contact.email}`, external: false }
    : null,
  telLink
    ? { label: contact.phoneDisplay, href: telLink, external: false }
    : null,
  whatsappLink ? { label: "WhatsApp", href: whatsappLink, external: true } : null,
].filter(Boolean) as { label: string; href: string; external: boolean }[];

export function Cta() {
  return (
    <section className="bg-dark py-20 md:py-28">
      <Container>
        <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-primary px-8 py-14 md:px-14 md:py-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-white/10"
          />
          <div className="relative max-w-2xl">
            <h2 className="text-h2 font-semibold text-dark">
              ¿Tienes un proyecto en mente?
            </h2>
            <p className="mt-5 text-lead text-dark/80">
              Cuéntanos qué quieres mejorar y descubramos juntos cómo llevar tu presencia
              digital al siguiente nivel.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button href="/contacto" variant="dark" size="lg" withArrow>
                Hablemos
              </Button>
              <Button
                href="/proceso"
                variant="outlineOnPrimary"
                size="lg"
              >
                Cómo trabajamos
              </Button>
            </div>

            {directContact.length > 0 ? (
              <p className="mt-8 text-sm text-dark/80">
                O escríbenos directamente:{" "}
                {directContact.map((item, index) => (
                  <span key={item.label}>
                    {index > 0 ? <span aria-hidden="true"> · </span> : null}
                    <a
                      href={item.href}
                      className="underline"
                      {...(item.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {item.label}
                    </a>
                  </span>
                ))}
              </p>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
