"use client";

import { useState } from "react";
import { DEMO_NOTICE } from "@/lib/content";
import type { View } from "@/lib/domain";
import { useDemo, useTourControls } from "@/lib/store";
import { Inicio } from "./views/Inicio";
import { Profesional } from "./views/Profesional";
import { Laboratorio } from "./views/Laboratorio";
import { Dueno } from "./views/Dueno";
import { Acerca } from "./views/Acerca";
import { TourPanel } from "./TourPanel";
import { ManufacturingSheet } from "./ManufacturingSheet";
import { PublicStatus } from "./PublicStatus";
import { Icon, btn } from "./ui";

const TABS: { id: View; label: string }[] = [
  { id: "inicio", label: "Inicio" },
  { id: "profesional", label: "Profesional" },
  { id: "laboratorio", label: "Laboratorio" },
  { id: "dueno", label: "Dueño" },
  { id: "acerca", label: "Qué es real" },
];

export function Shell() {
  const { state, dispatch } = useDemo();
  const { goto } = useTourControls();
  const [confirmReset, setConfirmReset] = useState(false);

  const view = state.view;
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="sticky top-0 z-40 flex h-9 items-center justify-between gap-3 bg-ink-950 px-4 text-[11px] font-medium uppercase tracking-[0.12em] text-signal">
        <span data-testid="demo-ribbon">{DEMO_NOTICE}</span>
        <span className="hidden text-[#9aa6ae] sm:inline">Preparado para Zona Pies por Odisas Lab</span>
      </div>

      <header className="sticky top-9 z-30 border-b border-line bg-bone-50/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg bg-ink-900 font-mono text-sm font-semibold text-signal" aria-hidden="true">
              ZP
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold">Casos</p>
              <p className="text-[11px] text-muted">Demo para Zona Pies</p>
            </div>
          </div>

          <nav aria-label="Vistas de la demo" className="order-3 -mx-1 flex w-full gap-1 overflow-x-auto px-1 md:order-none md:ml-4 md:w-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                aria-current={view === t.id ? "page" : undefined}
                onClick={() => dispatch({ type: "view", view: t.id })}
                data-testid={`tab-${t.id}`}
                className="min-h-10 shrink-0 rounded-lg px-3.5 text-sm font-medium text-muted transition-colors hover:bg-bone-100 hover:text-fg aria-[current=page]:bg-ink-900 aria-[current=page]:text-white"
              >
                {t.label}
              </button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              className={btn(state.tour.active ? "dark" : "primary", "sm")}
              aria-pressed={state.tour.active}
              onClick={() => (state.tour.active ? dispatch({ type: "tour", patch: { active: false } }) : goto(state.tour.step))}
              data-testid="tour-toggle"
            >
              <Icon name="play" className="size-3.5" />
              <span className="hidden sm:inline">{state.tour.active ? "Cerrar presentación" : "Presentación guiada"}</span>
              <span className="sm:hidden">{state.tour.active ? "Cerrar" : "Presentación"}</span>
            </button>
            {confirmReset ? (
              <span className="flex items-center gap-1.5" role="group" aria-label="Confirmar reinicio">
                <button
                  type="button"
                  className={btn("danger", "sm")}
                  onClick={() => {
                    dispatch({ type: "reset" });
                    setConfirmReset(false);
                  }}
                  data-testid="reset-confirm"
                >
                  Sí, reiniciar
                </button>
                <button type="button" className={btn("ghost", "sm")} onClick={() => setConfirmReset(false)}>
                  Cancelar
                </button>
              </span>
            ) : (
              <button
                type="button"
                className={btn("ghost", "sm")}
                onClick={() => setConfirmReset(true)}
                title="Reinicia la simulación; las notas de la reunión se conservan"
                data-testid="reset"
              >
                <Icon name="reset" className="size-3.5" />
                <span className="sr-only sm:not-sr-only">Reiniciar demo</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main id="contenido" className="flex-1" style={{ paddingBottom: "var(--tour-h, 0px)" }}>
        {!state.ready ? (
          <p className="p-10 text-center text-sm text-muted">Cargando la demo…</p>
        ) : view === "inicio" ? (
          <Inicio />
        ) : view === "profesional" ? (
          <Profesional />
        ) : view === "laboratorio" ? (
          <Laboratorio />
        ) : view === "dueno" ? (
          <Dueno />
        ) : (
          <Acerca />
        )}
      </main>

      {state.ready && state.tour.active ? <TourPanel /> : null}
      {state.sheetOpen ? <ManufacturingSheet /> : null}
      {state.publicOpen ? <PublicStatus /> : null}
    </div>
  );
}
