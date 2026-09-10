import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { CookiePreferencesButton } from "@/components/cookies/CookiePreferencesButton";
import { Logo } from "@/components/layout/Logo";
import { contact, footerNav, site, telLink, whatsappLink } from "@/data/site";
import { services } from "@/data/services";

const columnTitle = "mb-5 text-sm font-medium text-white/50";
const columnLink =
  "text-[0.95rem] text-white/75 transition-colors hover:text-primary";

export function Footer() {
  const year = new Date().getFullYear();

  const socials = [
    contact.instagram ? { label: "Instagram", href: contact.instagram } : null,
    contact.linkedin ? { label: "LinkedIn", href: contact.linkedin } : null,
    whatsappLink ? { label: "WhatsApp", href: whatsappLink } : null,
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <footer className="bg-dark text-white">
      <Container className="py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo invert />
            <p className="mt-5 max-w-xs text-[0.95rem] text-white/60">
              {site.tagline} Estrategia, ejecución y tecnología para negocios que
              quieren crecer.
            </p>
            <div className="mt-6 flex flex-col items-start gap-2 text-[0.95rem]">
              {contact.email ? (
                <a href={`mailto:${contact.email}`} className="link-underline text-white">
                  {contact.email}
                </a>
              ) : null}
              {telLink ? (
                <a href={telLink} className="link-underline text-white">
                  {contact.phoneDisplay}
                </a>
              ) : null}
            </div>
          </div>

          <div>
            <h2 className={columnTitle}>Servicios</h2>
            <ul className="flex flex-col gap-3">
              {services.map((service) => (
                <li key={service.slug}>
                  <Link href={`/servicios/${service.slug}`} className={columnLink}>
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className={columnTitle}>Empresa</h2>
            <ul className="flex flex-col gap-3">
              {footerNav.empresa.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={columnLink}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className={columnTitle}>Legal</h2>
            <ul className="flex flex-col gap-3">
              {footerNav.legal.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={columnLink}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <CookiePreferencesButton variant="link" />
              </li>
            </ul>

            {socials.length > 0 ? (
              <>
                <h2 className={`${columnTitle} mt-8`}>Redes</h2>
                <ul className="flex flex-col gap-3">
                  {socials.map((item) => (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={columnLink}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}. Todos los derechos reservados.
          </p>
          <p>Hecho en Madrid.</p>
        </div>
      </Container>
    </footer>
  );
}
