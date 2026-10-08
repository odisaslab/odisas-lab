"use client";

import { Reveal } from "@/components/motion/Reveal";
import { useReveal } from "@/components/motion/useReveal";

/** PRESCRIPCIÓN → DATOS → DISEÑO → FABRICACIÓN → ORTESIS (briefing §9). */
const steps = [
  { label: "Prescripción", note: "Criterio del profesional" },
  { label: "Datos", note: "Escaneo 3D del pie" },
  { label: "Diseño", note: "Modelo digital" },
  { label: "Fabricación", note: "Materiales técnicos" },
  { label: "Ortesis", note: "Pieza a medida" },
];

function Icon({ index }: { index: number }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (index) {
    case 0:
      return (
        <svg viewBox="0 0 48 48" className="size-full" aria-hidden="true" {...common}>
          <path d="M14 6h15l7 7v29H14z" />
          <path d="M29 6v7h7M19 22h12M19 28h12M19 34h7" />
        </svg>
      );
    case 1:
      return (
        <svg viewBox="0 0 48 48" className="size-full" aria-hidden="true" {...common}>
          {[12, 24, 36].map((x) => [12, 24, 36].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="2" fill="currentColor" stroke="none" />))}
          <path d="M6 24h36" strokeDasharray="2 3" />
        </svg>
      );
    case 2:
      return (
        <svg viewBox="0 0 48 48" className="size-full" aria-hidden="true" {...common}>
          <path d="M24 6c8 0 13 6 12 14-1 7-4 9-4 16 0 4-3 6-8 6s-8-2-8-6c0-7-3-9-4-16-1-8 4-14 12-14Z" />
          <path d="M24 6v36M14 20h20M15 30h18" opacity="0.5" />
        </svg>
      );
    case 3:
      return (
        <svg viewBox="0 0 48 48" className="size-full" aria-hidden="true" {...common}>
          <path d="M6 18 24 10l18 8-18 8z" />
          <path d="m6 26 18 8 18-8M6 34l18 8 18-8" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 48 48" className="size-full" aria-hidden="true" {...common}>
          <path d="M24 5c9 0 14 6 13 15-1 8-5 11-5 17 0 4-3 6-8 6s-8-2-8-6c0-6-4-9-5-17-1-9 4-15 13-15Z" fill="currentColor" fillOpacity="0.12" />
          <path d="m16 24 6 6 11-12" />
        </svg>
      );
  }
}

export function FlowChain() {
  const ref = useReveal<HTMLOListElement>("0px 0px -12% 0px");
  return (
    <ol ref={ref} className="flow-root relative mt-16 grid gap-10 md:mt-20 md:grid-cols-5 md:gap-0">
      {steps.map((step, index) => (
        <li key={step.label} className="relative md:pr-6">
          <Reveal delay={index * 140} y={20}>
            <div className="relative flex items-center gap-4 md:block">
              <span className="relative grid size-16 shrink-0 place-items-center rounded-full border border-line-strong bg-surface p-4 text-accent-text md:size-20 md:p-5">
                <Icon index={index} />
                <span className="t-num absolute -right-1 -top-1 grid size-6 place-items-center rounded-full bg-fg text-[0.625rem] text-surface">{index + 1}</span>
              </span>
              {index < steps.length - 1 ? (
                <span aria-hidden="true" className="flow-line absolute left-20 right-6 top-10 hidden h-px bg-gradient-to-r from-[var(--accent)] to-[var(--line-strong)] md:block" style={{ ["--i" as string]: index }} />
              ) : null}
              <div className="md:mt-6">
                <p className="t-h3">{step.label}</p>
                <p className="mt-1 text-sm text-muted">{step.note}</p>
              </div>
            </div>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
