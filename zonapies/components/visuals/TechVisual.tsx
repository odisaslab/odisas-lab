import { ProcessVisual } from "@/components/visuals/ProcessVisual";
import type { TechBlock } from "@/data/tech";

function Frame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="reg relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-line bg-surface-2/60">
      <span className="reg-b" />
      <span className="hud absolute left-4 top-4 text-muted">{label}</span>
      <svg viewBox="-1.5 -1.15 3 2.3" className="absolute inset-0 h-full w-full" aria-hidden="true" fill="none" preserveAspectRatio="xMidYMid meet">
        {children}
      </svg>
    </div>
  );
}

/** Esquemas animados de cada bloque tecnológico. Reutiliza los del proceso donde coinciden. */
export function TechVisual({ id }: { id: TechBlock["id"] }) {
  switch (id) {
    case "escaneo":
      return <ProcessVisual kind="scan" />;
    case "diseno":
      return <ProcessVisual kind="design" />;
    case "fabricacion":
      return <ProcessVisual kind="manufacture" />;
    case "software":
      return (
        <Frame label="Software">
          <rect x="-1.25" y="-0.8" width="2.5" height="1.6" rx="0.08" stroke="var(--line-strong)" strokeWidth="0.014" />
          <path d="M-1.25 -0.58H1.25" stroke="var(--line-strong)" strokeWidth="0.01" />
          {[-1.1, -1.0, -0.9].map((x) => (
            <circle key={x} cx={x} cy="-0.69" r="0.026" fill="var(--line-strong)" />
          ))}
          <rect x="-1.12" y="-0.45" width="0.7" height="1.15" rx="0.04" stroke="var(--accent)" strokeOpacity="0.5" strokeWidth="0.01" />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x="-1.04" y={-0.36 + i * 0.26} width={0.3 + (i % 2) * 0.18} height="0.06" rx="0.03" fill="var(--accent)" fillOpacity="0.55" className="anim-blink" style={{ animationDelay: `${i * 0.3}s` }} />
          ))}
          <path d="M-0.3 0.55C-0.1 -0.1 0.3 0.4 0.55 -0.2S0.95 0.1 1.1 -0.1" stroke="var(--accent)" strokeWidth="0.02" className="anim-dash" />
          <circle cx="0.55" cy="-0.2" r="0.045" fill="var(--accent)" />
        </Frame>
      );
    case "prescripcion":
      return (
        <Frame label="Prescripción">
          <g className="anim-float">
            <path d="M-1.05 -0.65h0.7l0.28 0.28v1.1h-0.98z" stroke="var(--fg)" strokeOpacity="0.8" strokeWidth="0.018" strokeLinejoin="round" />
            {[-0.25, -0.05, 0.15].map((y) => (
              <path key={y} d={`M-0.9 ${y}h0.55`} stroke="var(--muted)" strokeWidth="0.018" strokeLinecap="round" />
            ))}
          </g>
          <path d="M-0.3 0.05H0.5" stroke="var(--accent)" strokeWidth="0.02" className="anim-dash" />
          <path d="m0.42 -0.03 0.1 0.08-0.1 0.08" stroke="var(--accent)" strokeWidth="0.02" strokeLinecap="round" strokeLinejoin="round" />
          {[0, 1, 2].map((r) =>
            [0, 1, 2, 3].map((c) => (
              <circle key={`${r}${c}`} cx={0.75 + c * 0.17} cy={-0.3 + r * 0.3} r="0.04" fill="var(--accent)" className="anim-blink" style={{ animationDelay: `${(r + c) * 0.18}s` }} />
            )),
          )}
        </Frame>
      );
    case "calidad":
      return (
        <Frame label="Control de calidad">
          <circle cx="0" cy="0" r="0.62" stroke="var(--accent)" strokeWidth="0.02" />
          <circle cx="0" cy="0" r="0.8" stroke="var(--line-strong)" strokeWidth="0.01" strokeDasharray="0.03 0.05" className="anim-spin" />
          <path d="m-0.26 0.02 0.18 0.2 0.36-0.42" stroke="var(--accent)" strokeWidth="0.05" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M-1.3 0H-0.9M0.9 0H1.3M0 -1V-0.9M0 0.9V1" stroke="var(--line-strong)" strokeWidth="0.012" />
        </Frame>
      );
    case "materiales":
      return (
        <Frame label="Materiales">
          {[
            { x: -0.95, c: "#47505e" },
            { x: -0.5, c: "#e9e5da" },
            { x: -0.05, c: "#c4c6c2" },
            { x: 0.4, c: "#f0a43c" },
            { x: 0.85, c: "#4a525b" },
          ].map((m, i) => (
            <g key={m.c} className="anim-float" style={{ animationDelay: `${i * 0.35}s` }}>
              <rect x={m.x - 0.18} y="-0.45" width="0.36" height="0.9" rx="0.1" fill={m.c} stroke="var(--line-strong)" strokeWidth="0.012" />
            </g>
          ))}
        </Frame>
      );
  }
}
