import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/ui/JsonLd";
import { legalIsComplete, legalUpdatedLabel } from "@/data/legal";
import { site } from "@/data/site";

interface LegalPageProps {
  title: string;
  path: string;
  intro?: string;
  children: ReactNode;
}

export function LegalPage({ title, path, intro, children }: LegalPageProps) {
  return (
    <>
      <section className="border-b border-line pt-14 pb-12 md:pt-20 md:pb-16">
        <Container>
          <div className="mb-8">
            <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: title }]} />
          </div>
          <h1 className="max-w-3xl text-h2 font-semibold">{title}</h1>
          {intro ? <p className="mt-5 max-w-2xl text-lead text-gray">{intro}</p> : null}
          <p className="mt-6 text-sm text-gray">
            Última actualización: {legalUpdatedLabel}
          </p>
        </Container>
      </section>

      <section className="py-14 md:py-20">
        <Container>
          {!legalIsComplete ? (
            <div className="mb-12 flex gap-3 rounded-[var(--radius-card)] border border-primary/30 bg-primary-soft p-5 text-[0.9rem] text-dark">
              <AlertTriangle
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-primary"
              />
              <div>
                <p className="font-medium">Texto pendiente de completar</p>
                <p className="mt-1 text-gray">
                  Faltan datos del titular. Rellénalos en <code>data/legal.ts</code> antes
                  de publicar la web. Mientras falten, esta página no se indexa en
                  buscadores.
                </p>
              </div>
            </div>
          ) : null}

          <div className="prose-odisas max-w-3xl">{children}</div>
        </Container>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: title,
          url: `${site.url}${path}`,
          isPartOf: { "@id": `${site.url}#website` },
        }}
      />
    </>
  );
}
