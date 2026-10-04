import { ArrowRight, MessageCircle } from "lucide-react";
import { CtaButton } from "@/components/home/CtaButton";
import { Split } from "@/components/motion/Split";
import { finalCta } from "@/data/home";
import { whatsappLink } from "@/data/site";

export const whatsappHello =
  "Hola Odisas Lab, he visto vuestra web y me gustaría hablar sobre mi negocio.";

export function FinalCta() {
  return (
    <section
      aria-labelledby="final-titulo"
      className="tone-dark relative overflow-hidden py-28 md:py-44"
    >
      <div
        aria-hidden="true"
        className="grid-bg pointer-events-none absolute inset-0"
        style={{ maskImage: "radial-gradient(60% 60% at 50% 50%, black, transparent)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-30%] left-1/2 size-[50rem] -translate-x-1/2 rounded-full opacity-35"
        style={{ background: "radial-gradient(closest-side, rgba(255,107,0,0.5), transparent)" }}
      />
      <div className="wrap relative">
        <Split as="h2" id="final-titulo" className="t-mega max-w-[15ch]" text={finalCta.title} />
        <p className="t-lead muted mt-10 max-w-xl" data-reveal>
          {finalCta.text}
        </p>
        <div className="mt-12 flex flex-col gap-3 sm:flex-row" data-reveal>
          <CtaButton need="Conseguir más clientes" source="cta-final" className="w-full sm:w-auto">
            {finalCta.primary}
          </CtaButton>
          {whatsappLink ? (
            <a
              href={`${whatsappLink}?text=${encodeURIComponent(whatsappHello)}`}
              target="_blank"
              rel="noopener noreferrer"
              data-cta="cta-final-whatsapp"
              className="btn btn-ghost-light w-full sm:w-auto"
            >
              <MessageCircle aria-hidden="true" className="size-5" />
              {finalCta.secondary}
              <ArrowRight aria-hidden="true" className="arrow size-[1.05em]" />
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
