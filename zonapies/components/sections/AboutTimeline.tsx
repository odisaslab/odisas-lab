import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { PendingText, PlaceholderBox } from "@/components/ui/Placeholder";
import { galleryNeeds, milestones } from "@/data/timeline";

interface AboutTimelineProps {
  headingAs?: "h1" | "h2";
  /** Muestra la galería de fotografías pendientes */
  gallery?: boolean;
}

/** Sobre nosotros como línea de tiempo: Experiencia → Evolución → Tecnología → Innovación → Futuro. */
export function AboutTimeline({ headingAs = "h2", gallery = true }: AboutTimelineProps) {
  const Item = headingAs === "h1" ? "h2" : "h3";
  return (
    <div className="wrap">
      <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <Reveal>
              <p className="t-eyebrow">Sobre nosotros</p>
            </Reveal>
            <SplitHeading as={headingAs} className={`${headingAs === "h1" ? "t-h1" : "t-h2"} mt-6`} text={"Experiencia que se ha vuelto *tecnología*."} />
            <Reveal delay={150}>
              <p className="t-lead mt-6 max-w-[30rem]">Una trayectoria de fabricación a medida que ha evolucionado hacia el diseño y la producción digital.</p>
            </Reveal>

            {gallery ? (
              <Reveal delay={250} className="mt-10 hidden grid-cols-2 gap-3 lg:grid">
                {galleryNeeds.slice(0, 4).map((label, index) => (
                  <PlaceholderBox key={label} label={`Foto · ${label}`} ratio={index % 3 === 0 ? "4 / 5" : "1 / 1"} className={index === 0 ? "row-span-2 !aspect-auto" : ""} />
                ))}
              </Reveal>
            ) : null}
          </div>
        </div>

        <ol className="relative lg:col-span-7">
          <span aria-hidden="true" className="absolute bottom-4 left-[1.1rem] top-4 w-px bg-line-strong" />
          {milestones.map((milestone, index) => (
            <Reveal as="li" key={milestone.n} delay={60} className="relative pb-16 pl-14 last:pb-0 md:pl-20">
              <span className="absolute left-0 top-0 grid size-9 place-items-center rounded-full border border-accent bg-surface">
                <span className="t-num text-[0.6875rem] text-accent-text">{milestone.n}</span>
              </span>
              <p className="hud text-accent-text">{milestone.label}</p>
              <Item className="t-h2 mt-4 !text-[clamp(1.6rem,1rem+2vw,2.75rem)]">{milestone.title}</Item>
              <p className="t-lead mt-5 max-w-[36rem]">{milestone.body}</p>
              {milestone.pending ? (
                <p className="mt-4 text-sm">
                  <PendingText>{milestone.pending}</PendingText>
                </p>
              ) : null}
              {index === 0 && gallery ? <PlaceholderBox label="Foto · Laboratorio e instalaciones" ratio="16 / 9" className="mt-8 lg:hidden" /> : null}
            </Reveal>
          ))}
        </ol>
      </div>
    </div>
  );
}
