import { marquee } from "@/data/home";

/** Banda continua con los servicios: refuerza el alcance sin ocupar altura. */
export function Marquee() {
  const row = [...marquee, ...marquee];
  return (
    <section aria-label="Servicios" className="tone-orange overflow-hidden border-y border-ink/20 py-4">
      <div className="mask-fade-x overflow-hidden">
        <div className="marquee-fast" aria-hidden="true">
          {row.concat(row).map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="t-h3 flex items-center gap-8 pr-8 whitespace-nowrap uppercase"
            >
              {item}
              <span className="size-2 rotate-45 bg-ink" />
            </span>
          ))}
        </div>
        <p className="sr-only">{marquee.join(", ")}</p>
      </div>
    </section>
  );
}
