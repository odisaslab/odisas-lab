import Link from "next/link";
import { QuoteButton } from "@/components/forms/QuoteProvider";
import { CookiePreferencesButton } from "@/components/cookies/CookiePreferencesButton";
import { Logo } from "@/components/ui/Logo";
import { footerNav } from "@/data/nav";
import { company, contact, mailUrl, telUrl, whatsappUrl } from "@/data/site";

function Column({ title, items }: { title: string; items: readonly { label: string; href: string }[] }) {
  return (
    <div>
      <h2 className="hud text-muted">{title}</h2>
      <ul className="mt-5 flex flex-col">
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="inline-flex min-h-11 items-center text-[0.95rem] text-fg transition-colors hover:text-accent-text">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer data-theme="dark" data-section="footer" className="relative overflow-hidden bg-surface pb-28 pt-20 text-fg md:pb-10">
      <div className="wrap relative z-10">
        <div className="grid gap-14 lg:grid-cols-[1.3fr_2fr]">
          <div className="max-w-md">
            <Logo />
            <p className="t-body mt-6">
              Laboratorio podológico de nueva generación. Fabricamos ortesis plantares y plantillas ortopédicas a medida para podólogos, clínicas y centros especializados de toda España.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <QuoteButton cta="footer" size="md" />
              <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="btn" data-cta="footer-whatsapp">
                WhatsApp
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-4">
            <Column title="Soluciones" items={footerNav.soluciones} />
            <Column title="Profesionales" items={footerNav.profesionales} />
            <Column title="Empresa" items={footerNav.empresa} />
            <div>
              <h2 className="hud text-muted">Contacto</h2>
              <ul className="mt-5 flex flex-col text-[0.95rem]">
                <li>
                  <a href={telUrl()} className="inline-flex min-h-11 items-center hover:text-accent-text" data-cta="footer-phone">
                    {contact.phone.display}
                  </a>
                </li>
                <li>
                  <a href={mailUrl()} className="inline-flex min-h-11 items-center break-all hover:text-accent-text" data-cta="footer-email">
                    {contact.email.address}
                  </a>
                </li>
                <li className="mt-2 text-muted">
                  {company.address.street}
                  <br />
                  {company.address.area}
                  <br />
                  {company.address.postalCode} {company.address.city} ({company.address.region})
                </li>
                <li className="mt-1 text-muted">Envíos a toda España.</li>
                <li className="flex flex-wrap gap-x-5">
                  <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center hover:text-accent-text" data-cta="footer-instagram">
                    Instagram
                  </a>
                  <a href={contact.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center hover:text-accent-text" data-cta="footer-facebook">
                    Facebook
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-4 border-t border-line pt-6 text-sm text-muted md:flex-row md:items-center md:justify-between">
          <p>© {year} Zona Pies. Todos los derechos reservados.</p>
          <ul className="flex flex-wrap gap-x-6">
            {footerNav.legal.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="inline-flex min-h-11 items-center hover:text-fg">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <CookiePreferencesButton className="inline-flex min-h-11 items-center hover:text-fg" />
            </li>
          </ul>
        </div>
      </div>

      {/* Marca gigante recortada: el cierre visual de la web */}
      <p aria-hidden="true" className="pointer-events-none absolute inset-x-0 -bottom-[0.18em] select-none text-center text-[clamp(4rem,19vw,19rem)] font-semibold uppercase leading-none tracking-[-0.05em] text-fg/[0.045]">
        Zona Pies
      </p>
    </footer>
  );
}
