"use client";

import type { ReactNode } from "react";
import { STATE_LABEL, STATE_TONE, type CaseState, type Tone } from "@/lib/domain";
import type { InsoleParams, ParamSpec } from "@/lib/geometry";

/* ------------------------------ iconos ------------------------------ */

const PATHS: Record<string, ReactNode> = {
  check: <path d="M5 12.5l4.2 4.2L19 7" />,
  alert: (
    <>
      <path d="M12 4l9 16H3z" />
      <path d="M12 10v4.5M12 17.6v.1" />
    </>
  ),
  x: <path d="M6 6l12 12M18 6L6 18" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  back: <path d="M19 12H5M11 6l-6 6 6 6" />,
  download: <path d="M12 4v11M7 11l5 5 5-5M5 20h14" />,
  print: (
    <>
      <path d="M7 9V4h10v5M7 17H5v-6h14v6h-2" />
      <path d="M7 14h10v6H7z" />
    </>
  ),
  reset: <path d="M4 12a8 8 0 1 0 3-6.2M4 4v5h5" />,
  play: <path d="M8 5l11 7-11 7z" />,
  link: <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />,
  flask: <path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3" />,
  camera: (
    <>
      <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
      <circle cx="12" cy="13.5" r="3.5" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  sparkle: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  file: (
    <>
      <path d="M7 3h7l5 5v13H7z" />
      <path d="M14 3v5h5" />
    </>
  ),
  chat: <path d="M4 5h16v11H9l-5 4z" />,
  phone: <path d="M6 3h4l2 5-2.5 1.5a11 11 0 0 0 5 5L16 12l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2z" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
};

export function Icon({ name, className = "size-4" }: { name: keyof typeof PATHS | string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {PATHS[name] ?? null}
    </svg>
  );
}

/* ------------------------------- chips ------------------------------ */

const TONE_ICON: Record<Tone, string> = { ok: "check", warn: "alert", bad: "x", info: "clock", muted: "file" };

export function Chip({ tone = "muted", children, icon = true }: { tone?: Tone; children: ReactNode; icon?: boolean }) {
  return (
    <span className={`chip chip-${tone}`}>
      {icon ? <Icon name={TONE_ICON[tone]} className="size-3.5" /> : null}
      {children}
    </span>
  );
}

export function StateChip({ state }: { state: CaseState }) {
  return <Chip tone={STATE_TONE[state]}>{STATE_LABEL[state]}</Chip>;
}

export function ExampleChip({ children = "Ejemplo" }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-dashed border-line-strong px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted">
      {children}
    </span>
  );
}

/* ------------------------------ botones ----------------------------- */

export function btn(variant: "primary" | "ghost" | "dark" | "danger" = "primary", size: "md" | "lg" | "sm" = "md") {
  return `btn btn-${variant} btn-${size}`;
}

/* ------------------------------ tarjetas ---------------------------- */

export function Card({
  children,
  className = "",
  ...rest
}: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-2xl border border-line bg-white p-5 shadow-[0_1px_0_rgba(11,16,20,0.04)] ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted">{children}</p>;
}

export function Callout({
  tone = "info",
  title,
  children,
}: {
  tone?: Tone;
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className={`callout callout-${tone}`} role={tone === "bad" ? "alert" : "note"}>
      <Icon name={TONE_ICON[tone]} className="mt-0.5 size-4 shrink-0" />
      <div className="text-sm leading-snug">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className={title ? "mt-0.5" : ""}>{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------ formularios ------------------------- */

export function Field({
  label,
  htmlFor,
  hint,
  badge,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  badge?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={htmlFor} className="text-sm font-medium text-fg">
          {label}
        </label>
        {badge}
      </div>
      {children}
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export function Segmented<T extends string>({
  label,
  value,
  onChange,
  options,
  disabled,
  testId,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string }[];
  disabled?: boolean;
  testId?: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-xl border border-line-strong bg-bone-100 p-1" data-testid={testId}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          disabled={disabled}
          onClick={() => onChange(o.id)}
          className="min-h-10 flex-1 rounded-lg px-3 text-sm font-medium text-muted transition-colors hover:text-fg disabled:cursor-not-allowed disabled:opacity-60 aria-checked:bg-white aria-checked:text-fg aria-checked:shadow-sm"
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

const isPct = (spec: ParamSpec) => spec.unit.startsWith("%");

export function formatParam(spec: ParamSpec, v: number) {
  if (isPct(spec)) return `${Math.round(v * 100)} ${spec.unit}`;
  const digits = spec.step < 1 ? 1 : 0;
  return `${v.toFixed(digits)} ${spec.unit}`;
}

export function SliderField({
  spec,
  params,
  onChange,
  disabled,
}: {
  spec: ParamSpec;
  params: InsoleParams;
  onChange: (key: ParamSpec["key"], value: number) => void;
  disabled?: boolean;
}) {
  const v = params[spec.key];
  const id = `p-${spec.key}`;
  const k = isPct(spec) ? 100 : 1;
  return (
    <div className="grid gap-1">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-[13px] font-medium text-fg">
          {spec.label}
        </label>
        <output htmlFor={id} className="font-mono text-xs tabular-nums text-muted" data-testid={`val-${spec.key}`}>
          {formatParam(spec, v)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={spec.min * k}
        max={spec.max * k}
        step={spec.step * k}
        value={v * k}
        disabled={disabled}
        onChange={(e) => onChange(spec.key, Number(e.target.value) / k)}
        aria-describedby={spec.hint ? `${id}-hint` : undefined}
        className="range"
        data-testid={`slider-${spec.key}`}
      />
      {spec.hint ? (
        <p id={`${id}-hint`} className="text-[11px] leading-snug text-muted">
          {spec.hint}
        </p>
      ) : null}
    </div>
  );
}

export const fmtDate = (at: number) =>
  new Date(at).toLocaleString("es-ES", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
