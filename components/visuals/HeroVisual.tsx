import { ArrowUpRight, Sparkles } from "lucide-react";

const traffic = [
  { label: "Ene", value: 34 },
  { label: "Feb", value: 41 },
  { label: "Mar", value: 38 },
  { label: "Abr", value: 52 },
  { label: "May", value: 61 },
  { label: "Jun", value: 74 },
  { label: "Jul", value: 88 },
];

const keywords = [
  { term: "óptica en Bilbao", position: 3 },
  { term: "gafas progresivas", position: 6 },
  { term: "revisión de la vista", position: 9 },
];

const channels = [
  { label: "SEO", share: 46 },
  { label: "Google Ads", share: 31 },
  { label: "Meta Ads", share: 23 },
];

/**
 * Composición construida con SVG y CSS: sin fotografías de stock.
 * Los datos son de ejemplo y sirven como ilustración del tipo de trabajo,
 * no como resultado atribuido a un cliente concreto.
 */
export function HeroVisual() {
  return (
    <div aria-hidden="true" className="relative select-none">
      {/* Panel principal: evolución de visibilidad */}
      <div className="rounded-[var(--radius-card)] border border-line bg-white p-6 shadow-[var(--shadow-lift)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-gray">Visibilidad orgánica</p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-3xl font-semibold text-dark">
              +142%
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] bg-primary-soft px-3 py-1 text-sm font-medium text-primary-ink">
            <ArrowUpRight className="size-3.5" />
            7 meses
          </span>
        </div>

        <svg
          viewBox="0 0 320 110"
          role="presentation"
          className="mt-6 h-28 w-full overflow-visible"
        >
          {traffic.map((item, index) => {
            const barWidth = 26;
            const gap = 18;
            const height = (item.value / 100) * 88;
            const x = index * (barWidth + gap);
            const isLast = index === traffic.length - 1;
            return (
              <g key={item.label}>
                <rect
                  x={x}
                  y={88 - height}
                  width={barWidth}
                  height={height}
                  rx="5"
                  fill={isLast ? "var(--color-primary)" : "#EFEFEF"}
                />
                <text
                  x={x + barWidth / 2}
                  y="105"
                  textAnchor="middle"
                  fontSize="9"
                  fill="var(--color-gray)"
                >
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-line pt-5">
          {channels.map((channel) => (
            <div key={channel.label}>
              <p className="text-xs text-gray">{channel.label}</p>
              <p className="mt-1 font-[family-name:var(--font-display)] text-lg font-semibold text-dark">
                {channel.share}%
              </p>
              <div className="mt-2 h-1 w-full rounded-full bg-light">
                <div
                  className="h-1 rounded-full bg-primary"
                  style={{ width: `${channel.share}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Panel secundario: posiciones en buscador */}
      <div className="mt-4 rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)] md:absolute md:-left-10 md:top-[58%] md:mt-0 md:w-[16.5rem]">
        <p className="text-sm font-medium text-dark">Posiciones en Google</p>
        <ul className="mt-4 flex flex-col gap-3">
          {keywords.map((keyword) => (
            <li key={keyword.term} className="flex items-center justify-between gap-3">
              <span className="truncate text-sm text-gray">{keyword.term}</span>
              <span className="shrink-0 rounded-md bg-light px-2 py-0.5 text-xs font-medium text-dark">
                #{keyword.position}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Chip de IA */}
      <div className="mt-4 inline-flex items-center gap-2.5 rounded-[var(--radius-card)] bg-dark px-4 py-3 text-sm text-white shadow-[var(--shadow-lift)] md:absolute md:-right-6 md:-top-6 md:mt-0">
        <Sparkles className="size-4 text-primary" />
        <span>IA: 3 oportunidades detectadas</span>
      </div>
    </div>
  );
}
