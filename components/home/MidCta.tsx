import { CtaButton } from "@/components/home/CtaButton";
import { Split } from "@/components/motion/Split";
import { midCta } from "@/data/home";

export function MidCta() {
  return (
    <section aria-labelledby="analizamos-titulo" className="bg-ink">
      {/* El naranja se abre como un iris sobre fondo oscuro: el CTA intermedio no puede pasar desapercibido */}
      <div data-iris className="tone-orange relative overflow-hidden py-24 md:py-36">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #0a0a0b 1px, transparent 1px), linear-gradient(to bottom, #0a0a0b 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      <div className="wrap relative">
        <Split as="h2" id="analizamos-titulo" className="t-mega max-w-[14ch]" text={midCta.title.replaceAll("*", "")} />
        <p className="t-lead mt-8 max-w-xl" data-reveal>
          {midCta.text}
        </p>
        <div className="mt-10" data-reveal>
          <CtaButton variant="ink" need="No lo tengo claro" source="cta-intermedio" className="w-full sm:w-auto">
            {midCta.button}
          </CtaButton>
        </div>
      </div>
      </div>
    </section>
  );
}
