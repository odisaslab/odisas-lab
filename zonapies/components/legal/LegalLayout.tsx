import type { ReactNode } from "react";
import { PendingText } from "@/components/ui/Placeholder";
import { Section } from "@/components/ui/Section";

interface LegalLayoutProps {
  title: string;
  updated: string;
  children: ReactNode;
}

/** Plantilla de las páginas legales: titular + texto legible, sin adornos. */
export function LegalLayout({ title, updated, children }: LegalLayoutProps) {
  return (
    <Section name="legal" theme="light" className="!pt-36 md:!pt-44" labelledBy="legal-title">
      <div className="wrap-narrow">
        <p className="t-eyebrow">Información legal</p>
        <h1 id="legal-title" className="t-h1 mt-6">
          {title}
        </h1>
        <p className="mt-6 text-sm text-muted">Última actualización: {updated}</p>
        <p className="mt-6 rounded-2xl border border-line-strong p-4 text-sm">
          <PendingText>Texto orientativo. Dirección, teléfono y email proceden de la web actual; el CIF está por confirmar. Debe revisarlo y validarlo la asesoría legal de Zona Pies antes de publicarse</PendingText>
        </p>
        <div className="legal mt-12">{children}</div>
      </div>
    </Section>
  );
}

export function LegalBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-line py-8">
      <h2 className="text-xl font-medium tracking-tight md:text-2xl">{title}</h2>
      <div className="t-body mt-4 space-y-4 [&_a]:text-fg [&_a]:underline [&_a]:underline-offset-4 [&_li]:ml-5 [&_li]:list-disc [&_strong]:font-medium [&_strong]:text-fg">{children}</div>
    </section>
  );
}
