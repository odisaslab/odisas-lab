import Link from "next/link";
import type { ReactNode } from "react";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { ScanFallback } from "@/components/scene/ScanFallback";
import type { MaterialId } from "@/components/scene/textures";
import { JsonLd } from "@/components/ui/JsonLd";
import { Section } from "@/components/ui/Section";
import { breadcrumbJsonLd } from "@/lib/seo";

interface PageHeroProps {
  name: string;
  eyebrow: string;
  /** Titular (h1). `*palabra*` = resaltado. */
  title: string;
  lead: ReactNode;
  actions?: ReactNode;
  /** Fotograma de la ilustración técnica (0 portada … 7 cta) */
  frame?: number;
  material?: MaterialId;
  /** Migas de pan; se emiten también como JSON-LD */
  crumbs: { name: string; path: string }[];
  illustrationLabel?: string;
}

/**
 * Cabecera común de las páginas interiores: coherencia visual con la home (fondo técnico,
 * titular grande, ilustración de la misma escena) y migas de pan con datos estructurados.
 */
export function PageHero({ name, eyebrow, title, lead, actions, frame = 0, material = "carbono", crumbs, illustrationLabel }: PageHeroProps) {
  const trail = [{ name: "Inicio", path: "/" }, ...crumbs];
  return (
    <Section name={name} theme="dark" className="overflow-hidden !pb-16 !pt-36 md:!pb-24 md:!pt-44">
      <JsonLd data={breadcrumbJsonLd(trail)} />
      <div aria-hidden="true" className="bg-grid absolute inset-0 opacity-60" />
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(50%_60%_at_80%_40%,rgba(62,230,201,0.1),transparent_70%)]" />

      <div className="wrap relative grid items-center gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <nav aria-label="Migas de pan" className="intro" style={{ ["--d" as string]: 60 }}>
            <ol className="hud flex flex-wrap items-center gap-2 text-muted">
              {trail.map((item, index) => (
                <li key={item.path} className="flex items-center gap-2">
                  {index > 0 ? <span aria-hidden="true">/</span> : null}
                  {index < trail.length - 1 ? (
                    <Link href={item.path} className="hover:text-fg">
                      {item.name}
                    </Link>
                  ) : (
                    <span aria-current="page" className="text-fg">
                      {item.name}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          <p className="t-eyebrow intro mt-8" style={{ ["--d" as string]: 120 }}>
            {eyebrow}
          </p>
          <SplitHeading as="h1" intro delay={160} className="t-h1 mt-6" text={title} />
          <div className="t-lead intro mt-7 max-w-[36rem]" style={{ ["--d" as string]: 520 }}>
            {lead}
          </div>
          {actions ? (
            <div className="intro mt-9 flex flex-wrap gap-3" style={{ ["--d" as string]: 700 }}>
              {actions}
            </div>
          ) : null}
        </div>

        <div className="intro relative hidden lg:col-span-5 lg:block" style={{ ["--d" as string]: 400 }}>
          <div className="reg relative aspect-[4/5] w-full">
            <span className="reg-b" />
            <ScanFallback phase={frame} material={material} label={illustrationLabel} className="absolute inset-0 h-full w-full" />
          </div>
        </div>
      </div>
    </Section>
  );
}
