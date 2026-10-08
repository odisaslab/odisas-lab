import { CENTER, getOutlines, type V2 } from "@/components/scene/shape";
import type { ProcessStep } from "@/data/process";

/**
 * Esquemas técnicos animados, uno por etapa del proceso. SVG + CSS (sin JS ni WebGL):
 * ligeros, accesibles (decorativos, el texto va al lado) y respetan reduced-motion.
 */
const S = 120;
const { foot, insole } = getOutlines(S);
const d = (pts: V2[], k = 1) => `M${pts.map(([x, z]) => `${(CENTER[0] + k * (x - CENTER[0])).toFixed(3)},${(-(CENTER[1] + k * (z - CENTER[1]))).toFixed(3)}`).join("L")}Z`;

const FOOT_D = d(foot);
const INSOLE_D = d(insole);

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

export function ProcessVisual({ kind }: { kind: ProcessStep["visual"] }) {
  switch (kind) {
    case "scan":
      return (
        <Frame label="Escaneo 3D">
          <defs>
            <pattern id="pv-dots" width="0.07" height="0.07" patternUnits="userSpaceOnUse">
              <circle cx="0.035" cy="0.035" r="0.011" fill="var(--accent)" />
            </pattern>
            <clipPath id="pv-foot">
              <path d={FOOT_D} />
            </clipPath>
          </defs>
          <path d={FOOT_D} stroke="var(--accent)" strokeWidth="0.014" />
          <rect x="-0.6" y="-1.1" width="1.2" height="2.2" fill="url(#pv-dots)" clipPath="url(#pv-foot)" opacity="0.85" />
          <g className="anim-sweep-y" style={{ ["--sweep" as string]: "1.9px" }}>
            <rect x="-0.75" y="-0.98" width="1.5" height="0.025" fill="var(--accent)" />
            <rect x="-0.75" y="-1.1" width="1.5" height="0.2" fill="var(--accent)" opacity="0.1" />
          </g>
          <g stroke="var(--line-strong)" strokeWidth="0.008">
            <path d="M-1.4 0H-0.8M0.8 0H1.4M0 -1.1V-0.9M0 0.9V1.1" />
          </g>
        </Frame>
      );
    case "design":
      return (
        <Frame label="Diseño digital">
          <path d={FOOT_D} stroke="var(--accent)" strokeOpacity="0.3" strokeWidth="0.01" strokeDasharray="0.03 0.04" />
          {[0.3, 0.55, 0.8].map((k) => (
            <path key={k} d={d(insole, k)} stroke="var(--accent)" strokeOpacity="0.45" strokeWidth="0.008" />
          ))}
          <path d={INSOLE_D} stroke="var(--accent)" strokeWidth="0.018" className="anim-dash" />
          <g fill="var(--accent)">
            {insole.filter((_, i) => i % 18 === 0).map(([x, z], i) => (
              <circle key={i} cx={x} cy={-z} r="0.022" className="anim-blink" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </g>
        </Frame>
      );
    case "customize":
      return (
        <Frame label="Parámetros">
          {[
            { y: -0.55, label: "MATERIAL", w: 1.1 },
            { y: 0, label: "DUREZA", w: 0.7 },
            { y: 0.55, label: "ESTRUCTURA", w: 0.9 },
          ].map((row, i) => (
            <g key={row.label}>
              <text x="-1.2" y={row.y - 0.1} fill="var(--muted)" fontSize="0.085" fontFamily="var(--font-mono), monospace" letterSpacing="0.01em">
                {row.label}
              </text>
              <rect x="-1.2" y={row.y} width="2.4" height="0.03" rx="0.015" fill="var(--line-strong)" />
              <rect x="-1.2" y={row.y} width={row.w * 1.6} height="0.03" rx="0.015" fill="var(--accent)" />
              <g className="anim-sweep-x" style={{ ["--sweep" as string]: `${0.35 + i * 0.12}px`, animationDelay: `${i * 0.5}s` }}>
                <circle cx={-1.2 + row.w * 1.6 - 0.2} cy={row.y + 0.015} r="0.075" fill="var(--surface)" stroke="var(--accent)" strokeWidth="0.022" />
              </g>
            </g>
          ))}
        </Frame>
      );
    case "manufacture":
      return (
        <Frame label="Fabricación por capas">
          {[0, 1, 2].map((i) => (
            <g key={i} className="anim-float" style={{ animationDelay: `${i * 0.5}s` }} transform={`translate(0 ${-0.5 + i * 0.5})`}>
              <path d={d(insole, 0.55)} transform="scale(1 0.55)" fill="var(--accent)" fillOpacity={0.08 + i * 0.07} stroke="var(--accent)" strokeWidth="0.014" />
            </g>
          ))}
          <path d="M-1.2 -0.9V0.9" stroke="var(--line-strong)" strokeWidth="0.008" strokeDasharray="0.03 0.04" />
        </Frame>
      );
    case "deliver":
      return (
        <Frame label="Entrega">
          <g className="anim-float">
            <path d="M-0.45 -0.15 0 -0.4 0.45 -0.15V0.35L0 0.6-0.45 0.35Z" stroke="var(--accent)" strokeWidth="0.02" fill="var(--accent)" fillOpacity="0.1" />
            <path d="M-0.45 -0.15 0 0.1 0.45 -0.15M0 0.1V0.6" stroke="var(--accent)" strokeWidth="0.02" />
          </g>
          <path d="M-1.3 0.85C-0.7 0.4 0.7 0.9 1.3 0.4" stroke="var(--accent)" strokeWidth="0.014" className="anim-dash" />
          <circle cx="1.3" cy="0.4" r="0.1" fill="var(--accent)" />
          <path d="m1.26 0.4 0.03 0.04 0.06-0.08" stroke="var(--accent-fg)" strokeWidth="0.022" strokeLinecap="round" strokeLinejoin="round" />
        </Frame>
      );
  }
}
