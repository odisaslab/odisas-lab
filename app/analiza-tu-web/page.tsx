import Link from "next/link";
import { Check } from "lucide-react";
import { AuditTool } from "@/components/audit/AuditTool";
import { CtaButton } from "@/components/home/CtaButton";
import { Split } from "@/components/motion/Split";
import { PointerEffects } from "@/components/motion/PointerEffects";
import { ScrollEffects } from "@/components/motion/ScrollEffects";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/ui/JsonLd";
import { auditChecks, auditFaqs, auditPage, auditSteps } from "@/data/audit";
import { audit as auditCopy } from "@/data/home";
import { site } from "@/data/site";
import { faqSchema, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Diagnóstico web gratuito · Analiza tu web",
  description:
    "Pega la dirección de tu web y detectamos sus errores y amenazas principales: seguridad, SEO, móvil, conversión y velocidad. Gratis y sin registro.",
  path: "/analiza-tu-web",
});

export default function AnalizaTuWebPage() {
  return (
    <>
      <ScrollEffects />
      <PointerEffects />

      {/* La cabecera es fija: este bloque sube bajo ella para que el fondo oscuro llegue arriba */}
      <section className="tone-dark relative -mt-[4.5rem] overflow-hidden pt-[calc(4.5rem+3rem)] pb-20 md:pb-28">
        <div
          aria-hidden="true"
          className="grid-bg pointer-events-none absolute inset-0"
          style={{ maskImage: "radial-gradient(75% 60% at 50% 20%, black, transparent)" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 right-[-12%] size-[40rem] rounded-full opacity-40"
          style={{ background: "radial-gradient(closest-side, rgba(255,107,0,0.45), transparent)" }}
        />
        <div className="wrap relative">
          <div className="mb-8">
            <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Analiza tu web" }]} onDark />
          </div>
          <p className="eyebrow accent mb-6">{auditCopy.eyebrow}</p>
          <h1 className="t-h1 max-w-[16ch]">{auditPage.h1}</h1>
          <p className="t-lead muted mt-6 max-w-2xl">{auditPage.lead}</p>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[0.95rem]">
            {auditCopy.bullets.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check aria-hidden="true" className="size-4 text-primary" strokeWidth={3} />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-12 rounded-[28px] border border-hair bg-ink-2 p-5 sm:p-8 md:p-12">
            <AuditTool />
          </div>
        </div>
      </section>

      <section aria-labelledby="que-revisamos" className="sec tone-light">
        <div className="wrap">
          <p className="eyebrow accent mb-6" data-reveal>
            Qué revisamos
          </p>
          <Split as="h2" id="que-revisamos" className="t-h2 max-w-[20ch]" text="Más de 30 puntos, *medidos* y no supuestos." />
          <div className="mt-14 grid gap-px overflow-hidden rounded-[20px] border border-ink bg-ink md:mt-20 md:grid-cols-2 lg:grid-cols-3">
            {auditChecks.map((group) => (
              <div key={group.title} className="tone-dark p-7 md:p-9">
                <h3 className="t-h3">{group.title}</h3>
                <p className="muted mt-2 text-[0.95rem]">{group.description}</p>
                <ul className="mt-5 flex flex-col gap-2.5 text-[0.95rem]">
                  {group.items.map((item) => (
                    <li key={item} className="flex gap-3">
                      <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-primary" strokeWidth={2.5} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="como-funciona" className="sec tone-dark">
        <div className="wrap">
          <p className="eyebrow accent mb-6" data-reveal>
            Cómo funciona
          </p>
          <Split as="h2" id="como-funciona" className="t-h2 max-w-[18ch]" text="De la dirección al plan, en *cuatro* pasos." />
          <ol className="mt-14 grid gap-px overflow-hidden rounded-[20px] border border-hair bg-hair md:mt-20 md:grid-cols-2 lg:grid-cols-4" data-reveal>
            {auditSteps.map((step, index) => (
              <li key={step.title} className="bg-ink p-7 md:p-9">
                <span className="mono accent text-[0.75rem] tracking-[0.18em]">0{index + 1}</span>
                <h3 className="t-h3 mt-4">{step.title}</h3>
                <p className="muted mt-3 text-[0.95rem]">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="audit-faq" className="sec tone-light">
        <div className="wrap grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow accent mb-6" data-reveal>
              Preguntas frecuentes
            </p>
            <Split as="h2" id="audit-faq" className="t-h2" text="Lo que *conviene* saber del diagnóstico." />
          </div>
          <div data-reveal>
            {auditFaqs.map((item) => (
              <details key={item.question} className="group hair-t last:border-b last:border-hair-ink">
                <summary className="flex min-h-[4.5rem] cursor-pointer list-none items-center justify-between gap-6 py-5 font-[family-name:var(--font-display)] text-[1.15rem] font-medium md:text-[1.3rem] [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <span
                    aria-hidden="true"
                    className="flex size-9 shrink-0 items-center justify-center rounded-full border border-hair-ink text-xl transition-transform duration-300 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="muted max-w-2xl pb-7 text-[1.02rem]">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="audit-cta" className="tone-orange relative overflow-hidden py-24 md:py-32">
        <div className="wrap relative">
          <Split as="h2" id="audit-cta" className="t-h1 max-w-[16ch]" text="¿Quieres que lo resolvamos contigo?" />
          <p className="t-lead muted mt-6 max-w-xl" data-reveal>
            Cuéntanos qué has visto y qué te preocupa. Revisamos tu caso y te decimos por dónde empezaríamos.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row" data-reveal>
            <Link href="/contacto" className="btn btn-ink w-full sm:w-auto">
              QUIERO HABLAR CON ODISAS
            </Link>
            <Link href="/" className="btn btn-ghost-dark w-full sm:w-auto">
              Ver cómo trabajamos
            </Link>
          </div>
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Diagnóstico web gratuito de Odisas Lab",
          url: `${site.url}/analiza-tu-web`,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          inLanguage: "es-ES",
          description: auditPage.lead,
          offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
          provider: { "@id": `${site.url}#organization` },
        }}
      />
      <JsonLd data={faqSchema(auditFaqs)} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Inicio", item: site.url },
            { "@type": "ListItem", position: 2, name: "Analiza tu web", item: `${site.url}/analiza-tu-web` },
          ],
        }}
      />
    </>
  );
}
