import Link from "next/link";
import { QuoteButton } from "@/components/forms/QuoteProvider";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { Lock } from "@/components/ui/Icons";
import { CollabFlow } from "@/components/visuals/CollabFlow";
import { audiences, benefits } from "@/data/pro";

interface ProZoneProps {
  headingAs?: "h1" | "h2";
}

/** Zona Profesional: «Tu laboratorio. A un click.» (briefing §13). */
export function ProZone({ headingAs = "h2" }: ProZoneProps) {
  const Item = headingAs === "h1" ? "h2" : "h3";
  return (
    <div className="wrap">
      <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <Reveal>
            <p className="t-eyebrow">Zona profesional</p>
          </Reveal>
          <SplitHeading as={headingAs} className={`${headingAs === "h1" ? "t-h1" : "t-display"} mt-6`} text={"Tu laboratorio.\nA un *click*."} />
        </div>
        <Reveal delay={150} className="lg:col-span-4">
          <p className="t-lead">Fabricación especializada para podólogos, clínicas y centros. Tú prescribes; nosotros nos ocupamos del resto.</p>
        </Reveal>
      </div>

      <CollabFlow />

      <ul className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
        {benefits.map((benefit, index) => (
          <Reveal as="li" key={benefit.id} delay={(index % 4) * 80} className="group relative bg-surface p-7 transition-colors duration-500 hover:bg-surface-2 md:p-8">
            <span className="t-num text-sm text-muted">{String(index + 1).padStart(2, "0")}</span>
            <Item className="mt-10 text-xl font-medium tracking-tight">{benefit.title}</Item>
            <p className="t-body mt-3 text-[0.95rem]">{benefit.body}</p>
            <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-700 ease-out group-hover:scale-x-100" />
          </Reveal>
        ))}
      </ul>

      <div className="mt-12 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <QuoteButton cta="pro-zone" size="lg" magnetic prefill={{ need: "fabricacion" }}>
            Quiero trabajar con Zona Pies
          </QuoteButton>
          <Link href="/acceso-profesional" data-pro data-cta="pro-zone-access" className="btn btn-lg">
            <Lock className="size-4" /> Acceder como profesional
          </Link>
        </div>
        <p className="hud max-w-md text-muted">Para: {audiences.join(" · ")}</p>
      </div>
    </div>
  );
}
