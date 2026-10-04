import { Check, Globe, MousePointerClick, Search, TrendingUp, Users } from "lucide-react";
import { CtaButton } from "@/components/home/CtaButton";
import { hero, pipeline } from "@/data/home";

const icons = {
  seo: Search,
  trafico: TrendingUp,
  web: Globe,
  conversion: MousePointerClick,
  clientes: Users,
} as const;

/** Palabras del H1 con su acento: se animan con CSS desde el primer pintado. */
function HeroTitle() {
  const parts = hero.title.split("*");
  let index = 0;
  return (
    <h1 className="t-h1 max-w-[16ch] md:max-w-[18ch] lg:max-w-[20ch]">
      {parts.map((part, partIndex) =>
        part
          .split(/(\s+)/)
          .filter(Boolean)
          .map((chunk) => {
            if (/^\s+$/.test(chunk)) return " ";
            const i = index++;
            return (
              <span key={`${partIndex}-${i}`} className="w word-in" style={{ ["--i" as string]: i }}>
                <span className={partIndex % 2 === 1 ? "accent" : undefined}>{chunk}</span>
              </span>
            );
          }),
      )}
    </h1>
  );
}

function Sparkline({ index }: { index: number }) {
  // Trazados distintos por indicador, solo ilustrativos (sin valores)
  const paths = [
    "M0 22 L12 18 L24 20 L36 12 L48 14 L60 5",
    "M0 20 L12 22 L24 14 L36 16 L48 8 L60 6",
    "M0 24 L12 20 L24 21 L36 13 L48 10 L60 4",
    "M0 23 L12 21 L24 15 L36 17 L48 9 L60 3",
  ];
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 60 28"
      className="spark h-6 w-14 overflow-visible"
      style={{ ["--i" as string]: index }}
    >
      <path
        d={paths[index % paths.length]}
        pathLength={1}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Hero() {
  let indicatorIndex = -1;

  return (
    <section
      aria-label="Presentación"
      className="tone-dark relative isolate overflow-hidden pt-28 pb-14 md:pt-36 md:pb-20 lg:pt-40"
    >
      {/* Capas de fondo: rejilla técnica con máscara y un único foco de luz */}
      <div
        aria-hidden="true"
        className="grid-bg pointer-events-none absolute inset-0 -z-10"
        style={{ maskImage: "radial-gradient(75% 65% at 50% 25%, black, transparent)" }}
      />
      <div
        aria-hidden="true"
        data-parallax="0.12"
        className="pointer-events-none absolute -top-48 right-[-12%] -z-10 size-[44rem] rounded-full opacity-40"
        style={{ background: "radial-gradient(closest-side, rgba(255,107,0,0.45), transparent)" }}
      />

      <div className="wrap">
        <p className="eyebrow rise accent mb-7" style={{ ["--d" as string]: 0.05 }}>
          {hero.eyebrow}
        </p>

        <HeroTitle />

        <div className="mt-8 flex flex-col gap-8 lg:mt-10 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <p className="t-lead muted max-w-xl rise" style={{ ["--d" as string]: 0.7 }}>
            {hero.subtitle}
          </p>

          <div className="rise flex flex-col gap-3 sm:flex-row" style={{ ["--d" as string]: 0.85 }}>
            <CtaButton need="Conseguir más clientes" source="hero-principal" className="w-full sm:w-auto">
              {hero.primary}
            </CtaButton>
            <CtaButton
              to="proceso"
              variant="ghost-light"
              arrow="down"
              source="hero-secundario"
              className="w-full sm:w-auto"
            >
              {hero.secondary}
            </CtaButton>
          </div>
        </div>

        <ul
          className="rise muted mt-8 flex flex-col gap-2 text-[0.92rem] sm:flex-row sm:flex-wrap sm:gap-x-7"
          style={{ ["--d" as string]: 1 }}
        >
          {hero.assurances.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <Check aria-hidden="true" className="size-4 shrink-0 text-primary" strokeWidth={2.25} />
              {item}
            </li>
          ))}
        </ul>

        {/* Sistema: SEO → Tráfico → Web → Conversión → Clientes */}
        <div
          className="rise mt-14 rounded-[20px] border border-hair bg-ink-2/60 p-5 backdrop-blur-sm md:mt-20 md:p-8"
          style={{ ["--d" as string]: 1.1 }}
        >
          <div className="mb-7 flex items-center justify-between gap-4">
            <p className="eyebrow muted">
              <span aria-hidden="true" className="live-dot size-1.5 rounded-full bg-primary" />
              Cómo funciona el sistema
            </p>
            <p className="mono muted hidden text-[0.7rem] tracking-wider uppercase sm:block">
              Ilustración · sin datos reales
            </p>
          </div>

          <ol className="pipe" aria-label="Del SEO a los clientes">
            {pipeline.map((node, index) => {
              const Icon = icons[node.key];
              if (node.indicator) indicatorIndex += 1;
              return (
                <li key={node.key} className="contents">
                  <div className="flex items-center gap-4 lg:w-[9.5rem] lg:shrink-0 lg:flex-col lg:items-start lg:gap-0">
                    <span
                      className="pipe-node-dot flex size-[3.3rem] shrink-0 items-center justify-center rounded-full border"
                      style={{ ["--i" as string]: index }}
                    >
                      <Icon aria-hidden="true" className="size-5 text-cream" strokeWidth={1.6} />
                    </span>
                    <div className="lg:mt-4">
                      <p className="mono text-[0.72rem] tracking-[0.14em] text-cream uppercase">
                        <span className="muted">0{index + 1} </span>
                        {node.label}
                      </p>
                      <p className="muted mt-1 text-[0.9rem]">{node.caption}</p>
                      {node.indicator ? (
                        <div className="mt-3 flex items-center gap-3 rounded-lg border border-hair bg-ink px-3 py-2">
                          <div>
                            <p className="mono muted text-[0.62rem] tracking-[0.14em] uppercase">
                              {node.indicator}
                            </p>
                            <p className="mono text-[0.7rem] text-primary">↗ en crecimiento</p>
                          </div>
                          <Sparkline index={indicatorIndex} />
                        </div>
                      ) : null}
                    </div>
                  </div>
                  {index < pipeline.length - 1 ? (
                    <span
                      aria-hidden="true"
                      className="pipe-line"
                      style={{ ["--i" as string]: index }}
                    />
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
