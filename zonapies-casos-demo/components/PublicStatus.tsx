"use client";

import { useEffect, useRef } from "react";
import { STATE_LABEL, STATE_RANK, TIMELINE } from "@/lib/domain";
import { useDemo } from "@/lib/store";
import { Icon, btn } from "./ui";

/** Enlace público de estado (simulado): sin ningún dato personal. */
export function PublicStatus() {
  const { state, dispatch } = useDemo();
  const c = state.case;
  const closeRef = useRef<HTMLButtonElement>(null);
  const rank = STATE_RANK[c.state];

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dispatch({ type: "overlay", publicLink: false });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-ink-950/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Enlace público de estado (simulado)">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl" data-testid="public-status">
        <div className="flex items-center gap-2 border-b border-line bg-bone-100 px-3 py-2">
          <Icon name="lock" className="size-3.5 text-muted" />
          <p className="min-w-0 flex-1 truncate font-mono text-[11px] text-muted">https://casos.ejemplo.invalid/estado/9f3c-a71d-04be</p>
          <button ref={closeRef} type="button" className={btn("ghost", "sm")} onClick={() => dispatch({ type: "overlay", publicLink: false })} aria-label="Cerrar">
            <Icon name="x" className="size-3.5" />
          </button>
        </div>
        <div className="grid gap-4 p-5">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Zona Pies · Estado del pedido</p>
            <h2 className="mt-1 font-mono text-2xl font-semibold">{c.code}</h2>
            <p className="mt-1 text-sm text-muted">Estado actual: <b className="text-fg">{STATE_LABEL[c.state]}</b></p>
          </div>
          <ol className="grid gap-2">
            {TIMELINE.map((t) => {
              const done = rank >= STATE_RANK[t.from];
              return (
                <li key={t.id} className={`flex items-center gap-3 text-sm ${done ? "font-medium" : "text-muted"}`}>
                  <span className={`grid size-6 place-items-center rounded-full ${done ? "bg-brand text-white" : "border border-line-strong"}`}>{done ? <Icon name="check" className="size-3.5" /> : null}</span>
                  {t.label}
                </li>
              );
            })}
          </ol>
          <p className="rounded-xl bg-bone-100 px-3 py-2 text-xs leading-snug text-muted">
            Este enlace no muestra el nombre del paciente ni ningún otro dato personal: solo el código del caso y su estado. Dirección de ejemplo; no existe.
          </p>
        </div>
      </div>
    </div>
  );
}
