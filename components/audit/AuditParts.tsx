import type { AuditCategory, AuditIssue, PerfResult, Severity } from "@/lib/audit/types";

/* ──────────────────────────────────────────────────────────────
   Piezas visuales del diagnóstico. Sin estado: la lógica vive en AuditTool.
   ────────────────────────────────────────────────────────────── */

export const scoreTone = (score: number) => (score >= 80 ? "ok" : score >= 50 ? "warn" : "alert");
export const scoreColor = (score: number) =>
  score >= 80 ? "var(--color-ok)" : score >= 50 ? "var(--color-warn)" : "var(--color-alert)";

export const verdict = (score: number) =>
  score >= 80
    ? "Buen estado general, con mejoras puntuales"
    : score >= 50
      ? "Tu web funciona, pero tiene problemas que te restan clientes"
      : "Tu web tiene problemas importantes que conviene resolver pronto";

const SEV_LABEL: Record<Severity, string> = { critical: "Crítico", high: "Alto", medium: "Medio", low: "Bajo" };
const SEV_CLASS: Record<Severity, string> = {
  critical: "bg-alert/15 text-alert",
  high: "bg-primary/15 text-primary",
  medium: "bg-warn/15 text-warn",
  low: "bg-cream/10 text-mute",
};
const SEV_DOT: Record<Severity, string> = {
  critical: "bg-alert",
  high: "bg-primary",
  medium: "bg-warn",
  low: "bg-mute",
};

/** Radar decorativo: barrido, anillos y tres hallazgos de ejemplo. */
export function Scope() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[26rem]" aria-hidden="true">
      <svg viewBox="0 0 500 500" className="size-full overflow-visible">
        <defs>
          <radialGradient
            id="audit-sweep"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(250 250) scale(230)"
          >
            <stop offset="0" stopColor="#ff6b00" stopOpacity="0" />
            <stop offset="1" stopColor="#ff6b00" stopOpacity="0.38" />
          </radialGradient>
        </defs>
        <circle cx="250" cy="250" r="230" fill="rgba(243,239,232,0.03)" stroke="rgba(255,107,0,0.4)" />
        <circle cx="250" cy="250" r="172" fill="none" stroke="rgba(243,239,232,0.1)" />
        <circle cx="250" cy="250" r="114" fill="none" stroke="rgba(243,239,232,0.1)" />
        <circle cx="250" cy="250" r="56" fill="none" stroke="rgba(243,239,232,0.1)" />
        <line x1="20" y1="250" x2="480" y2="250" stroke="rgba(243,239,232,0.1)" />
        <line x1="250" y1="20" x2="250" y2="480" stroke="rgba(243,239,232,0.1)" />
        <g className="scope-sweep">
          <path d="M250 250 L250 20 A230 230 0 0 1 412.6 87.4 Z" fill="url(#audit-sweep)" />
          <line x1="250" y1="250" x2="412.6" y2="87.4" stroke="#ff6b00" strokeWidth="2" />
        </g>
        <circle className="scope-blip" cx="165" cy="140" r="8" fill="var(--color-alert)" />
        <circle className="scope-blip" cx="360" cy="285" r="8" fill="var(--color-warn)" style={{ animationDelay: "1s" }} />
        <circle className="scope-blip" cx="205" cy="360" r="8" fill="var(--color-ok)" style={{ animationDelay: "2s" }} />
        <circle cx="250" cy="250" r="44" fill="#0a0a0b" stroke="rgba(243,239,232,0.18)" />
        <path d="M232 262 L250 232 L268 262 L259 262 L250 247 L241 262 Z" fill="#ff6b00" />
      </svg>

      <div className="absolute top-[8%] left-[-4%] flex items-center gap-3 rounded-2xl border border-hair bg-ink-2 px-4 py-2.5 text-[0.85rem] shadow-xl max-sm:left-[-2%] max-sm:px-3 max-sm:py-2 max-sm:text-[0.78rem]">
        <span className="flex size-7 items-center justify-center rounded-lg bg-alert font-bold text-ink">!</span>
        <span>
          Errores
          <small className="muted block text-[0.74rem] max-sm:hidden">que frenan tu posicionamiento</small>
        </span>
      </div>
      <div className="absolute top-[46%] right-[-6%] flex items-center gap-3 rounded-2xl border border-hair bg-ink-2 px-4 py-2.5 text-[0.85rem] shadow-xl max-sm:right-[-2%] max-sm:px-3 max-sm:py-2 max-sm:text-[0.78rem]">
        <span className="flex size-7 items-center justify-center rounded-lg bg-warn font-bold text-ink">⚠</span>
        <span>
          Amenazas
          <small className="muted block text-[0.74rem] max-sm:hidden">visibles desde fuera</small>
        </span>
      </div>
      <div className="absolute bottom-[9%] left-[6%] flex items-center gap-3 rounded-2xl border border-hair bg-ink-2 px-4 py-2.5 text-[0.85rem] shadow-xl max-sm:px-3 max-sm:py-2 max-sm:text-[0.78rem]">
        <span className="flex size-7 items-center justify-center rounded-lg bg-ok font-bold text-ink">✓</span>
        <span>Lo que ya funciona</span>
      </div>
    </div>
  );
}

/** Nota global en anillo. */
export function ScoreRing({ score }: { score: number }) {
  const circumference = 326.7;
  return (
    <div className="relative size-[9.5rem] shrink-0 md:size-[11.25rem]">
      <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden="true">
        <circle cx="60" cy="60" r="52" fill="none" strokeWidth="11" stroke="rgba(243,239,232,0.1)" />
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - score / 100)}
          stroke={scoreColor(score)}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.22, 1, 0.36, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <b className="block font-[family-name:var(--font-display)] text-5xl leading-none font-bold tracking-tight md:text-6xl">
            {score}
          </b>
          <span className="muted mt-1 block text-[0.8rem]">de 100</span>
        </div>
      </div>
    </div>
  );
}

export function CategoryCard({
  label,
  score,
  stats,
  unavailable,
}: {
  label: string;
  score: number | null;
  stats?: string;
  unavailable?: string;
}) {
  return (
    <div className="rounded-2xl border border-hair bg-ink p-4">
      <p className="muted min-h-[2.4em] text-[0.85rem]">{label}</p>
      {score == null ? (
        <>
          <p className="mt-1.5 font-[family-name:var(--font-display)] text-3xl font-bold">—</p>
          <p className="muted mt-2.5 text-[0.82rem] leading-snug">{unavailable ?? "No disponible"}</p>
        </>
      ) : (
        <>
          <p className="mt-1.5 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
            {score}
            <small className="muted ml-1 text-[0.85rem] font-semibold">/100</small>
          </p>
          <div className="my-2.5 h-[5px] overflow-hidden rounded-full bg-cream/10">
            <div
              className="h-full rounded-full transition-[width] duration-1000"
              style={{ width: `${score}%`, background: scoreColor(score) }}
            />
          </div>
          <p className="muted text-[0.78rem]">{stats}</p>
        </>
      )}
    </div>
  );
}

export const categoryStats = (c: AuditCategory) =>
  `${c.errors} ${c.errors === 1 ? "error" : "errores"} · ${c.warnings} ${c.warnings === 1 ? "aviso" : "avisos"}`;

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={`inline-flex shrink-0 rounded-md px-2 py-0.5 text-[0.72rem] font-semibold ${SEV_CLASS[severity]}`}>
      {SEV_LABEL[severity]}
    </span>
  );
}

export function SeverityCount({ severity, count }: { severity: Severity; count: number }) {
  const labels: Record<Severity, string> = { critical: "Críticos", high: "Altos", medium: "Medios", low: "Bajos" };
  return (
    <span className="inline-flex items-center gap-2 rounded-xl bg-cream/[0.06] px-3 py-2 text-[0.88rem]">
      <i aria-hidden="true" className={`inline-block size-2.5 rounded-[3px] ${SEV_DOT[severity]}`} />
      <b className="text-base">{count}</b>
      {labels[severity]}
    </span>
  );
}

export function IssueList({
  items,
  max,
  empty,
  moreText,
}: {
  items: AuditIssue[];
  max: number;
  empty: string;
  moreText: string;
}) {
  if (!items.length) {
    return <p className="mt-4 rounded-xl bg-ok/10 p-3.5 text-[0.92rem]">{empty}</p>;
  }
  return (
    <>
      <ul className="mt-4 grid gap-2.5">
        {items.slice(0, max).map((issue) => (
          <li key={`${issue.category}-${issue.title}`} className="rounded-xl border border-hair bg-ink p-4">
            <div className="flex items-start justify-between gap-3">
              <h4 className="text-[0.97rem] leading-snug font-semibold">{issue.title}</h4>
              <SeverityBadge severity={issue.severity} />
            </div>
            <p className="muted mt-1.5 text-[0.84rem] break-words">
              {issue.evidence}
              <span className="ml-1.5 rounded-md border border-hair px-1.5 py-0.5 text-[0.7rem]">
                {issue.source === "medido" ? "Medido" : "Detectado"}
              </span>
            </p>
            <p className="mt-2 text-[0.88rem] leading-snug">{issue.recommendation}</p>
          </li>
        ))}
      </ul>
      {items.length > max ? (
        <p className="muted mt-3 text-[0.88rem]">
          +{items.length - max} {moreText}
        </p>
      ) : null}
    </>
  );
}

const PERF_STATUS: Record<string, { label: string; className: string }> = {
  good: { label: "Bueno", className: "bg-ok/15 text-ok" },
  "needs-improvement": { label: "Mejorable", className: "bg-warn/15 text-warn" },
  poor: { label: "Malo", className: "bg-alert/15 text-alert" },
};

export function PerfTable({ perf }: { perf: Extract<PerfResult, { available: true }> }) {
  return (
    <div className="mt-3.5 overflow-x-auto">
      <table className="w-full min-w-[30rem] border-collapse text-[0.88rem]">
        <thead>
          <tr className="text-left">
            {["Métrica", "Valor", "Estado", "Referencia"].map((h) => (
              <th key={h} className="muted border-b border-hair px-2 py-2.5 text-[0.78rem] font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {perf.metrics.map((metric) => (
            <tr key={metric.id}>
              <td className="border-b border-hair px-2 py-2.5">{metric.label}</td>
              {metric.value == null ? (
                <>
                  <td className="border-b border-hair px-2 py-2.5">No disponible</td>
                  <td className="border-b border-hair px-2 py-2.5" />
                  <td className="border-b border-hair px-2 py-2.5" />
                </>
              ) : (
                <>
                  <td className="border-b border-hair px-2 py-2.5">{metric.display ?? String(metric.value)}</td>
                  <td className="border-b border-hair px-2 py-2.5">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[0.75rem] font-semibold whitespace-nowrap ${PERF_STATUS[metric.status]?.className ?? ""}`}
                    >
                      {PERF_STATUS[metric.status]?.label ?? metric.status}
                    </span>
                  </td>
                  <td className="muted border-b border-hair px-2 py-2.5">{metric.threshold}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
