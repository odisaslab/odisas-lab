import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { Button } from "@/components/ui/Button";
import { PendingText } from "@/components/ui/Placeholder";
import { trainingBlocks } from "@/data/training";

/** «Comparte el conocimiento» (briefing §18): vista previa de la plataforma de formación. */
export function TrainingTeaser() {
  return (
    <div className="wrap">
      <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <Reveal>
            <p className="t-eyebrow">Formación</p>
          </Reveal>
          <SplitHeading as="h2" className="t-h2 mt-6" text={"Comparte el *conocimiento*."} />
        </div>
        <Reveal delay={150} className="lg:col-span-4">
          <p className="t-lead">Cursos, formación profesional, eventos y recursos para dominar el flujo digital de ortesis plantares.</p>
        </Reveal>
      </div>

      <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:mt-16">
        {trainingBlocks.map((block, index) => (
          <Reveal as="li" key={block.id} delay={(index % 2) * 100} className="group relative overflow-hidden rounded-3xl border border-line-strong p-7 transition-colors duration-500 hover:border-fg md:p-10">
            <span aria-hidden="true" className="deco-num absolute right-7 top-5" data-n={String(index + 1).padStart(2, "0")} />
            <h3 className="t-h3">{block.title}</h3>
            <p className="t-body mt-3 max-w-[26rem]">{block.body}</p>
            <p className="mt-6 text-sm">
              <PendingText>{block.pending}</PendingText>
            </p>
          </Reveal>
        ))}
      </ul>

      <Reveal className="mt-12">
        <Button href="/formacion" size="lg" cta="training-home" magnetic>
          Ver formación
        </Button>
      </Reveal>
    </div>
  );
}
