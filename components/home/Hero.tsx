import { Check, Globe, MousePointerClick, Search, TrendingUp, Users } from "lucide-react";
import { AnchorLink } from "@/components/home/AnchorLink";
import { CtaButton } from "@/components/home/CtaButton";
import { HeroGL } from "@/components/home/HeroGL";
import { hero, pipeline } from "@/data/home";
import { ScanSearch } from "lucide-react";

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
    <h1 data-hero-title className="t-h1 max-w-[16ch] md:max-w-[18ch] lg:max-w-[13ch] xl:max-w-[13ch]">
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

      {/* Póster de la marca en 3D: móvil, tablet y "reducir movimiento" (la imagen solo se descarga ahí) */}
      {/* React 19 sube este preload al <head>: el póster empieza a bajar antes de que el CSS lo pida */}
      <link rel="preload" as="image" href="/brand/hero-mark.webp" media="(max-width: 1023px)" fetchPriority="low" />
      <div aria-hidden="true" className="hero-poster pointer-events-none absolute -z-10" />

      {/* Escena 3D (solo escritorio con puntero fino): la marca y un campo de puntos que reacciona al cursor */}
      <div
        aria-hidden="true"
        data-hero-gl
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[min(100%,56rem)]"
        style={{ maskImage: "linear-gradient(to bottom, black 78%, transparent)" }}
      >
        <HeroGL />
      </div>

      <div className="wrap">
        <div data-hero-text>
        <p className="eyebrow rise accent mb-7" style={{ ["--d" as string]: 0.05 }}>
          {hero.eyebrow}
        </p>

        <HeroTitle />

        <div className="mt-8 flex flex-col gap-8 lg:mt-10">
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

        <p className="rise mt-7 text-[0.98rem]" style={{ ["--d" as string]: 0.95 }}>
          <span className="muted">{hero.auditLink.lead} </span>
          <AnchorLink
            to="analiza-tu-web"
            source="hero-auditoria"
            className="link-underline inline-flex items-center gap-1.5 font-medium text-cream"
          >
            <ScanSearch aria-hidden="true" className="size-4 text-primary" />
            {hero.auditLink.cta}
          </AnchorLink>
        </p>

        <ul
          className="rise muted mt-6 flex flex-col gap-2 text-[0.92rem] sm:flex-row sm:flex-wrap sm:gap-x-7"
          style={{ ["--d" as string]: 1 }}
        >
          {hero.assurances.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <Check aria-hidden="true" className="size-4 shrink-0 text-primary" strokeWidth={2.25} />
              {item}
            </li>
          ))}
        </ul>
        </div>

        {/* Sistema: SEO → Tráfico → Web → Conversión → Clientes */}
        <div
          data-hero-panel
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
