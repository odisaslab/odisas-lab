import { useId } from "react";
import { CENTER, getOutlines, type V2 } from "./shape";
import type { MaterialId } from "./textures";

/**
 * Ilustración SVG del recorrido pie → ortesis. Cumple tres funciones:
 *  1. Es el render del SERVIDOR: el LCP no espera a Three.js.
 *  2. Es el fallback si no hay WebGL, hay movimiento reducido o el equipo va justo.
 *  3. Cuenta la misma historia por fases (0–6), sincronizada con la línea de tiempo 3D.
 */

const SEGMENTS = 160;

const flip = ([x, z]: V2): string => `${x.toFixed(4)},${(-z).toFixed(4)}`;
const pathOf = (points: V2[]) => `M${points.map(flip).join("L")}Z`;
const scaled = (points: V2[], r: number): V2[] =>
  points.map(([x, z]) => [CENTER[0] + r * (x - CENTER[0]), CENTER[1] + r * (z - CENTER[1])]);

const outlines = getOutlines(SEGMENTS);
const FOOT = pathOf(outlines.foot);
const INSOLE = pathOf(outlines.insole);
const RINGS = [0.3, 0.52, 0.74, 0.92].map((r) => pathOf(scaled(outlines.foot, r)));

const FILLS: Record<MaterialId, [string, string]> = {
  carbono: ["#3b4352", "#0b0d10"],
  eva: ["#f1eee6", "#c9c3b4"],
  pa11: ["#cfd1cd", "#9a9c98"],
  resina: ["#f5b04a", "#a85d12"],
  composite: ["#4a525b", "#23282e"],
  memory: ["#e3e9ed", "#a4afb8"],
  forro: ["#efebe1", "#cfc9bb"],
  clay: ["#e0dacd", "#bdb5a5"],
};

const MARKS: { label: string; x: number; z: number }[] = [
  { label: "TALÓN", x: 0.0, z: -0.7 },
  { label: "ARCO", x: -0.2, z: -0.05 },
  { label: "ANTEPIÉ", x: 0.04, z: 0.4 },
  { label: "HALLUX", x: -0.2, z: 0.9 },
];

/** Fotograma de la ilustración para un tiempo de historia T: 0 portada, 1 scan … 7 CTA. */
export const fallbackFrame = (T: number) => (T < 0.12 ? 0 : Math.min(7, Math.floor(T) + 1));

interface ScanFallbackProps {
  /** Fotograma (0 portada · 1 scan · 2 analyze · 3 design · 4 material · 5 manufacture · 6 result · 7 cta) */
  phase: number;
  material?: MaterialId;
  className?: string;
  /** Texto alternativo; si se omite, la ilustración es decorativa */
  label?: string;
}

export function ScanFallback({ phase, material = "carbono", className = "", label }: ScanFallbackProps) {
  const uid = useId().replace(/:/g, "");
  const id = (name: string) => `${uid}-${name}`;
  const [lite, dark] = FILLS[material];

  return (
    <svg
      viewBox="-0.95 -1.18 1.9 2.32"
      className={`zp-fallback ${className}`}
      data-phase={phase}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      preserveAspectRatio="xMidYMid meet"
      fill="none"
    >
      <defs>
        <linearGradient id={id("clay")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={FILLS.clay[0]} />
          <stop offset="1" stopColor={FILLS.clay[1]} />
        </linearGradient>
        <linearGradient id={id("mat")} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor={lite} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
        <linearGradient id={id("forro")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={FILLS.forro[0]} />
          <stop offset="1" stopColor={FILLS.forro[1]} />
        </linearGradient>
        <linearGradient id={id("cushion")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={FILLS.memory[0]} />
          <stop offset="1" stopColor={FILLS.memory[1]} />
        </linearGradient>
        <linearGradient id={id("sheen")} x1="0" y1="0" x2="1" y2="0.6">
          <stop offset="0" stopColor="#fff" stopOpacity="0.38" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={id("shadow")} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#000" stopOpacity="0.55" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <pattern id={id("dots")} width="0.05" height="0.05" patternUnits="userSpaceOnUse">
          <circle cx="0.025" cy="0.025" r="0.0085" fill="#3ee6c9" />
        </pattern>
        <pattern id={id("weave")} width="0.05" height="0.05" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="0.05" height="0.025" fill="#fff" opacity="0.1" />
          <rect y="0.025" width="0.05" height="0.025" fill="#000" opacity="0.18" />
        </pattern>
        <clipPath id={id("foot")}>
          <path d={FOOT} />
        </clipPath>
        <clipPath id={id("insole")}>
          <path d={INSOLE} />
        </clipPath>
      </defs>

      {/* Suelo técnico */}
      <g stroke="#3ee6c9" strokeWidth="0.004" opacity="0.4">
        <ellipse cx="0" cy="0" rx="0.84" ry="1.1" />
        <ellipse cx="0" cy="0" rx="0.66" ry="0.9" opacity="0.5" />
        <path d="M-0.95 0H0.95M0 -1.15V1.1" opacity="0.35" />
      </g>
      <ellipse cx="-0.02" cy="0.06" rx="0.52" ry="1.0" fill={`url(#${id("shadow")})`} />

      {/* 00 · modelo anatómico */}
      <g data-show="0" className="zp-fb">
        <path d={FOOT} fill={`url(#${id("clay")})`} stroke="#fff" strokeOpacity="0.25" strokeWidth="0.006" />
        {RINGS.slice(0, 3).map((d, i) => (
          <path key={i} d={d} stroke="#000" strokeOpacity="0.1" strokeWidth="0.005" />
        ))}
        {/* Contorno de la plantilla, flotando sobre el pie */}
        <path d={INSOLE} stroke="#3ee6c9" strokeWidth="0.008" className="anim-dash" style={{ transform: "translateY(-0.06px)" }} />
        <g className="anim-sweep-y" style={{ ["--sweep" as string]: "1.6px" }}>
          <rect x="-0.5" y="-0.9" width="1" height="0.012" fill="#3ee6c9" opacity="0.55" />
        </g>
      </g>

      {/* 01 · escaneo: nube de puntos y barrido */}
      <g data-show="1" className="zp-fb">
        <path d={FOOT} stroke="#3ee6c9" strokeOpacity="0.5" strokeWidth="0.006" />
        <rect x="-0.6" y="-1.1" width="1.2" height="2.2" fill={`url(#${id("dots")})`} clipPath={`url(#${id("foot")})`} opacity="0.9" />
        <g className="anim-sweep-y" style={{ ["--sweep" as string]: "1.9px" }}>
          <rect x="-0.55" y="-1" width="1.1" height="0.02" fill="#3ee6c9" />
          <rect x="-0.55" y="-1.06" width="1.1" height="0.12" fill="#3ee6c9" opacity="0.12" />
        </g>
      </g>

      {/* 02 · análisis: malla y puntos anatómicos */}
      <g data-show="2" className="zp-fb">
        <path d={FOOT} stroke="#3ee6c9" strokeWidth="0.008" />
        {RINGS.map((d, i) => (
          <path key={i} d={d} stroke="#3ee6c9" strokeOpacity="0.5" strokeWidth="0.004" />
        ))}
        <g stroke="#3ee6c9" strokeOpacity="0.35" strokeWidth="0.004">
          {outlines.foot
            .filter((_, i) => i % 16 === 0)
            .map((p, i) => (
              <line key={i} x1={CENTER[0]} y1={-CENTER[1]} x2={p[0]} y2={-p[1]} />
            ))}
        </g>
        {MARKS.map((mark) => (
          <g key={mark.label}>
            <circle cx={mark.x} cy={-mark.z} r="0.024" fill="#3ee6c9" fillOpacity="0.25" stroke="#3ee6c9" strokeWidth="0.006" />
            <text x={mark.x + 0.05} y={-mark.z + 0.012} fill="#3ee6c9" fontSize="0.04" fontFamily="var(--font-mono), monospace" letterSpacing="0.004em">
              {mark.label}
            </text>
          </g>
        ))}
      </g>

      {/* 03 · diseño: la plantilla aparece */}
      <g data-show="3" className="zp-fb">
        <path d={FOOT} stroke="#3ee6c9" strokeOpacity="0.28" strokeWidth="0.005" strokeDasharray="0.02 0.03" />
        <path d={INSOLE} fill={`url(#${id("mat")})`} fillOpacity="0.2" stroke="#3ee6c9" strokeWidth="0.01" />
        {RINGS.map((d, i) => (
          <path key={i} d={d} stroke="#3ee6c9" strokeOpacity="0.35" strokeWidth="0.004" clipPath={`url(#${id("insole")})`} />
        ))}
      </g>

      {/* 04 · material (también resultado y CTA) */}
      <g data-show="4 6 7" className="zp-fb">
        <path d={INSOLE} fill={`url(#${id("mat")})`} />
        {material === "carbono" ? <path d={INSOLE} fill={`url(#${id("weave")})`} /> : null}
        <path d={INSOLE} fill={`url(#${id("sheen")})`} />
        <path d={INSOLE} stroke="#fff" strokeOpacity="0.28" strokeWidth="0.006" />
      </g>

      {/* 05 · fabricación: capas */}
      <g data-show="5" className="zp-fb">
        <g transform="translate(0.08,0.24)">
          <path d={INSOLE} fill={`url(#${id("mat")})`} />
          <text x="0.43" y="-0.3" fill="currentColor" fontSize="0.04" fontFamily="var(--font-mono), monospace">SHELL</text>
        </g>
        <g transform="translate(0.04,0.02)">
          <path d={INSOLE} fill={`url(#${id("cushion")})`} fillOpacity="0.96" stroke="#fff" strokeOpacity="0.3" strokeWidth="0.005" />
          <text x="0.43" y="-0.3" fill="currentColor" fontSize="0.04" fontFamily="var(--font-mono), monospace">AMORTIGUACIÓN</text>
        </g>
        <g transform="translate(0,-0.2)">
          <path d={INSOLE} fill={`url(#${id("forro")})`} fillOpacity="0.96" stroke="#fff" strokeOpacity="0.3" strokeWidth="0.005" />
          <text x="0.43" y="-0.3" fill="currentColor" fontSize="0.04" fontFamily="var(--font-mono), monospace">FORRO</text>
          <path d={INSOLE} stroke="#3ee6c9" strokeWidth="0.01" className="anim-dash" />
        </g>
      </g>
    </svg>
  );
}
