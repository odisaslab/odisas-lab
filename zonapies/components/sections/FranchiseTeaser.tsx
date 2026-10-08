import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { Button } from "@/components/ui/Button";
import { pillars } from "@/data/franchise";

/** «Lleva Zona Pies a tu mercado» (briefing §19). */
export function FranchiseTeaser() {
  return (
    <div className="wrap">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <Reveal>
            <p className="t-eyebrow">Franquicias</p>
          </Reveal>
          <SplitHeading as="h2" className="t-h2 mt-6" text={"Lleva Zona Pies a tu *mercado*."} />
          <Reveal delay={150}>
            <p className="t-lead mt-6 max-w-[28rem]">Un modelo, un equipo y una tecnología para crecer con nosotros.</p>
            <div className="mt-9">
              <Button href="/franquicias" size="lg" cta="franchise-home" magnetic>
                Quiero información
              </Button>
            </div>
          </Reveal>
        </div>

        <ul className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:col-span-7">
          {pillars.map((pillar, index) => (
            <Reveal as="li" key={pillar.id} delay={(index % 2) * 90} className="group bg-surface p-7 transition-colors duration-500 hover:bg-surface-2 md:p-9">
              <span className="t-num text-sm text-muted">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="mt-8 text-xl font-medium tracking-tight">{pillar.title}</h3>
              <p className="t-body mt-2 text-[0.95rem]">{pillar.body}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </div>
  );
}
