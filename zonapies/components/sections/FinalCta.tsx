"use client";

import { useRef } from "react";
import { QuoteButton } from "@/components/forms/QuoteProvider";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { ScanScene, type SceneControl } from "@/components/scene/ScanScene";
import { Button } from "@/components/ui/Button";
import { Phone, WhatsApp } from "@/components/ui/Icons";
import { Section } from "@/components/ui/Section";
import { contact, telUrl, whatsappUrl } from "@/data/site";

interface FinalCtaProps {
  /** Con pieza 3D flotando (home) o solo texto (páginas interiores) */
  scene?: boolean;
  title?: string;
  lead?: string;
  prefillNeed?: string;
}

/** Cierre de la web: «¿Empezamos?» sobre fondo oscuro, con la plantilla flotando. */
export function FinalCta({
  scene = true,
  title = "¿*Empezamos*?",
  lead = "Cuéntanos qué necesitas y nuestro equipo te ayudará a encontrar la solución adecuada.",
  prefillNeed,
}: FinalCtaProps) {
  const control = useRef<SceneControl>({ time: 6.3, material: "carbono" });

  return (
    <Section name="final-cta" theme="dark" className={`overflow-hidden !py-0 ${scene ? "min-h-[100svh]" : ""}`} labelledBy="final-title">
      {scene ? (
        <>
          <div aria-hidden="true" className="bg-grid absolute inset-0 opacity-60" />
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(60%_60%_at_72%_50%,rgba(62,230,201,0.13),transparent_70%)]" />
          <ScanScene
            control={control}
            frame={7}
            material="carbono"
            label="Plantilla de fibra de carbono flotando sobre una plataforma técnica. Arrastra para girarla."
            drag
            svgOnLite
            desktopOffsetX={0.3}
            stackedOffsetY={0.2}
            eventContext="final-cta"
          />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-surface via-surface/90 to-transparent lg:hidden" />
        </>
      ) : null}

      <div className={`wrap relative flex flex-col justify-end py-24 lg:justify-center ${scene ? "min-h-[100svh] pb-28 lg:pb-24" : "md:py-32"}`}>
        <div className="max-w-[40rem]">
          <Reveal>
            <p className="t-eyebrow">Tu laboratorio. Tu tecnología. Tu precisión.</p>
          </Reveal>
          <SplitHeading id="final-title" as="h2" className="t-display mt-7" text={title} />
          <Reveal delay={150}>
            <p className="t-lead mt-7 max-w-[32rem] text-[color:var(--fg)]/75">{lead}</p>
          </Reveal>
          <Reveal delay={250} className="mt-10 flex flex-wrap gap-3">
            <QuoteButton cta="final-cta" size="lg" magnetic prefill={prefillNeed ? { need: prefillNeed } : undefined} />
            <Button href={whatsappUrl()} variant="ghost" size="lg" cta="final-whatsapp" arrow={false}>
              <WhatsApp className="size-5" /> Hablar por WhatsApp
            </Button>
            <Button href={telUrl()} variant="ghost" size="lg" cta="final-phone" arrow={false}>
              <Phone className="size-5" /> Llamar
            </Button>
          </Reveal>
          <Reveal delay={320}>
            <p className="mt-6 text-sm text-muted">
              Te responderemos lo antes posible · {contact.phone.display}
            </p>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
