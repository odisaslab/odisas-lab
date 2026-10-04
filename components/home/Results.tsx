import { CtaButton } from "@/components/home/CtaButton";
import { Split } from "@/components/motion/Split";
import { results } from "@/data/results";

/**
 * Solo muestra datos reales (data/results.ts). Si hay casos, aparecen debajo
 * de las métricas; si no, la sección es honesta sobre lo que no promete.
 */
export function Results() {
  return (
    <section id="resultados" aria-labelledby="resultados-titulo" className="sec tone-light">
      <div className="wrap">
        <p className="eyebrow accent mb-6" data-reveal>
          {results.eyebrow}
        </p>
        <Split as="h2" id="resultados-titulo" className="t-h2 max-w-[20ch]" text={results.title} />

        <dl className="mt-16 grid gap-px overflow-hidden rounded-[20px] border border-ink bg-ink md:mt-24 md:grid-cols-2">
          {results.headline.map((metric) => (
            <div key={metric.label} className="tone-dark flex flex-col justify-between gap-12 p-8 md:p-12">
              <dt className="mono muted text-[0.75rem] tracking-[0.16em] uppercase">{metric.label}</dt>
              <dd
                data-counter={metric.counter}
                data-prefix={metric.prefix}
                data-suffix={metric.suffix}
                className="t-mega accent font-[family-name:var(--font-display)]"
              >
                {metric.prefix}
                {metric.counter}
                {metric.suffix}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mono muted mt-4 text-[0.72rem] tracking-wider uppercase">{results.source}</p>

        {results.cases.length > 0 ? (
          <ul className="mt-16 grid gap-6 md:grid-cols-2">
            {results.cases.map((item) => (
              <li key={item.client} className="rounded-[20px] border border-hair-ink p-8">
                <p className="mono accent text-[0.72rem] tracking-[0.16em] uppercase">{item.sector}</p>
                <h3 className="t-h3 mt-3">{item.client}</h3>
                <p className="t-h2 accent mt-6">{item.metric.value}</p>
                <p className="muted mt-1">
                  {item.metric.label} · {item.metric.period}
                </p>
                <p className="muted mt-4 text-[0.9rem]">{item.did.join(" · ")}</p>
                {item.quote ? (
                  <blockquote className="mt-6 border-l-2 border-primary pl-4">
                    <p>“{item.quote.text}”</p>
                    <footer className="muted mt-2 text-[0.85rem]">{item.quote.author}</footer>
                  </blockquote>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-16 grid items-end gap-10 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <p className="t-lead muted max-w-xl" data-reveal>
            {results.honesty}
          </p>
          <div data-reveal className="rounded-[20px] border border-hair-ink p-7 md:p-9">
            <h3 className="t-h3 max-w-[16ch]">{results.nextCase.title}</h3>
            <p className="muted mt-3 max-w-md">{results.nextCase.text}</p>
            <div className="mt-7">
              <CtaButton variant="ink" need="Conseguir más clientes" source="resultados">
                {results.nextCase.cta}
              </CtaButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
