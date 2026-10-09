"use client";

import { FOOT_LENGTH_MM, footWidths, type Side } from "@/lib/geometry";
import type { Preset } from "./engine";

const PRESETS: { id: Preset; label: string }[] = [
  { id: "planta", label: "Planta" },
  { id: "dorso", label: "Dorso" },
  { id: "lateral", label: "Lateral" },
];

export function PresetBar({ onPick, active }: { onPick: (p: Preset) => void; active?: Preset }) {
  return (
    <div className="flex gap-1 rounded-full bg-ink-950/70 p-1 backdrop-blur" role="group" aria-label="Punto de vista">
      {PRESETS.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onPick(p.id)}
          aria-pressed={active === p.id}
          className="min-h-9 rounded-full px-3 text-xs font-medium text-[#eef1f2] transition-colors hover:bg-white/10 aria-pressed:bg-signal aria-pressed:text-ink-950"
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

/** Alternativa 2D cuando el navegador no puede mostrar WebGL. */
export function FootFallback({
  side,
  hole,
  label = "Vista 2D de la planta (el navegador no muestra 3D)",
}: {
  side: Side;
  hole?: { x: number; y: number; radius: number } | null;
  label?: string;
}) {
  const pts: string[] = [];
  const N = 60;
  const left: [number, number][] = [];
  const right: [number, number][] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const y = t * FOOT_LENGTH_MM;
    const { med, lat } = footWidths(t);
    const xMin = side === "derecho" ? -med : -lat;
    const xMax = side === "derecho" ? lat : med;
    left.push([xMin, y]);
    right.push([xMax, y]);
  }
  const all = [...left, ...right.reverse()];
  for (const [x, y] of all) pts.push(`${(x + 70).toFixed(1)},${(FOOT_LENGTH_MM - y + 10).toFixed(1)}`);
  return (
    <svg viewBox="0 0 140 285" role="img" aria-label={label} className="mx-auto h-full max-h-[320px] w-auto py-3">
      <polygon points={pts.join(" ")} fill="#1c262e" stroke="#3ee6c9" strokeWidth="1.2" />
      {hole ? (
        <circle cx={hole.x + 70} cy={FOOT_LENGTH_MM - hole.y + 10} r={hole.radius} fill="rgba(255,59,92,0.25)" stroke="#ff3b5c" strokeWidth="1.5" />
      ) : null}
    </svg>
  );
}
