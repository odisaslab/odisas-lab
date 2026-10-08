import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { Star } from "@/components/ui/Icons";
import { PendingText, PlaceholderTag } from "@/components/ui/Placeholder";
import { testimonials } from "@/data/testimonials";

/**
 * «Los profesionales hablan» (briefing §17): diseño editorial con citas grandes.
 * Mientras no haya testimonios verificados, se muestra el hueco marcado: no se inventa nada.
 */
export function Testimonials({ headingAs = "h2" }: { headingAs?: "h1" | "h2" }) {
  const allPending = testimonials.every((t) => !t.verified);

  return (
    <div className="wrap">
      <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <Reveal>
            <p className="t-eyebrow">No lo decimos nosotros</p>
          </Reveal>
          <SplitHeading as={headingAs} className={`${headingAs === "h1" ? "t-h1" : "t-h2"} mt-6`} text={"Los profesionales *hablan*."} />
        </div>
        <Reveal delay={150} className="lg:col-span-4">
          <p className="t-lead">Opiniones de podólogos y profesionales que trabajan con Zona Pies.</p>
        </Reveal>
      </div>

      <div className="mt-14 grid gap-5 lg:mt-20 lg:grid-cols-3">
        {testimonials.map((item, index) => (
          <Reveal key={item.id} delay={index * 110} className={index === 1 ? "lg:mt-14" : ""}>
            {item.verified ? (
              <figure className="flex h-full flex-col justify-between rounded-3xl border border-line-strong p-8 md:p-10">
                <div>
                  <p className="flex gap-1 text-accent-text" aria-label="Valoración de cinco estrellas">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="size-4" />
                    ))}
                  </p>
                  <blockquote className="mt-6 text-[clamp(1.25rem,1rem+1vw,1.75rem)] font-medium leading-snug tracking-[-0.025em]">“{item.quote}”</blockquote>
                </div>
                <figcaption className="mt-10 border-t border-line pt-5">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted">
                    {item.role}
                    {item.place ? ` · ${item.place}` : ""}
                  </p>
                </figcaption>
              </figure>
            ) : (
              <figure className="ph relative flex h-full min-h-[22rem] flex-col justify-between rounded-3xl p-8 md:p-10">
                <PlaceholderTag>Testimonio pendiente</PlaceholderTag>
                <div className="pt-8">
                  <span aria-hidden="true" className="block text-[5rem] font-medium leading-none text-accent-text/40">“</span>
                  <blockquote className="text-lg leading-snug text-muted">Aquí irá la opinión real de un podólogo o profesional, tal como la escribió.</blockquote>
                </div>
                <figcaption className="mt-8 border-t border-line pt-5 text-sm text-muted">Nombre · Clínica o centro · Ciudad</figcaption>
              </figure>
            )}
          </Reveal>
        ))}
      </div>

      {allPending ? (
        <p className="mt-8 max-w-2xl text-sm text-muted">
          <PendingText>
            La web actual ya dispone de testimonios reales: copiar texto literal, autor y centro, confirmar la autorización y marcarlos como verificados en data/testimonials.ts
          </PendingText>
        </p>
      ) : null}
    </div>
  );
}
