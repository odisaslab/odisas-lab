"use client";

import { useEffect, useMemo, useRef } from "react";
import { MODOS, TECNICO_DEMO } from "@/lib/domain";
import { computeInsole, PARAM_SPECS } from "@/lib/geometry";
import { PROCESS_PROFILES, RULES_NOTICE } from "@/lib/rules";
import { useDemo } from "@/lib/store";
import { ThicknessMap } from "./ThicknessMap";
import { btn, formatParam, fmtDate, Icon } from "./ui";

/** Hoja de fabricación imprimible de una página (calculada de la versión aprobada). */
export function ManufacturingSheet() {
  const { state, dispatch } = useDemo();
  const c = state.case;
  const closeRef = useRef<HTMLButtonElement>(null);
  const approved = c.design.approved;
  const version = approved ? c.design.versions.find((v) => v.id === approved.versionId) : null;
  const spec = c.spec.final ?? c.spec.proposal;
  const profile = PROCESS_PROFILES[spec?.ruta ?? "por_confirmar"];
  const side = c.rx.lado;
  const result = useMemo(() => (version ? computeInsole(version.params, side, profile.minMm) : null), [version, side, profile.minMm]);

  const close = () => dispatch({ type: "overlay", sheet: false });

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dispatch({ type: "overlay", sheet: false });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-ink-950/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Hoja de fabricación">
      <div className="no-print mx-auto mb-3 flex max-w-[820px] justify-end gap-2">
        <button type="button" className={btn("primary", "sm")} onClick={() => window.print()} data-testid="print-sheet">
          <Icon name="print" className="size-3.5" /> Imprimir
        </button>
        <button ref={closeRef} type="button" className={btn("ghost", "sm") + " !bg-white"} onClick={close} data-testid="close-sheet">
          <Icon name="x" className="size-3.5" /> Cerrar
        </button>
      </div>

      <article className="print-sheet relative mx-auto max-w-[820px] overflow-hidden rounded-xl bg-white p-8 text-[#0b1014] shadow-2xl" data-testid="sheet">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 grid place-items-center text-center font-mono text-5xl font-bold uppercase leading-tight text-red-700/10"
          style={{ transform: "rotate(-22deg)" }}
        >
          Demo · ilustrativo
          <br />
          no apto para fabricar
        </div>

        <header className="flex items-start justify-between gap-4 border-b-2 border-[#0b1014] pb-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em]">Zona Pies · Hoja de fabricación</p>
            <h1 className="mt-1 font-mono text-3xl font-semibold">{c.code}</h1>
          </div>
          <div className="text-right text-xs">
            <p className="font-semibold">DEMO · datos simulados</p>
            <p>Impresa el {new Date().toLocaleDateString("es-ES")}</p>
          </div>
        </header>

        {!version || !result || !spec ? (
          <p className="py-10 text-center text-sm">No hay un diseño aprobado todavía.</p>
        ) : (
          <>
            <section className="mt-5 grid grid-cols-2 gap-x-8 gap-y-1 text-sm sm:grid-cols-4">
              {(
                [
                  ["Pie", side],
                  ["Paciente", c.rx.iniciales],
                  ["Material", spec.material],
                  ["Ruta", spec.rutaLabel],
                  ["Rigidez / densidad", spec.rigidez],
                  ["Forro", spec.forro],
                  ["Largo", version.params.largo === "completa" ? "Completa" : "¾"],
                  ["Servicio", MODOS.find((m) => m.id === spec.modo)?.label ?? ""],
                ] as const
              ).map(([k, v]) => (
                <div key={k}>
                  <p className="text-[11px] uppercase tracking-wide text-[#4c5760]">{k}</p>
                  <p className="font-medium first-letter:uppercase">{v}</p>
                </div>
              ))}
            </section>

            <section className="mt-6 grid gap-6 sm:grid-cols-[auto_1fr]">
              <div className="rounded-lg border border-[#c6c2b6] p-2">
                <ThicknessMap result={result} side={side} height={330} theme="light" testId="sheet-map" />
                <p className="mt-1 text-center text-[11px] text-[#4c5760]">Mapa de grosor del shell (vista desde arriba)</p>
              </div>
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide">Parámetros · versión {version.id}</h2>
                <table className="mt-2 w-full text-sm">
                  <tbody>
                    {PARAM_SPECS.map((s) => (
                      <tr key={s.key} className="border-b border-[#ecebe4]">
                        <td className="py-1 pr-3">{s.label}</td>
                        <td className="py-1 text-right font-mono">{formatParam(s, version.params[s.key])}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-3 text-xs">
                  Grosor del shell: {result.stats.minMm.toFixed(1)}–{result.stats.maxMm.toFixed(1)} mm · Largo {result.stats.lengthMm.toFixed(0)} mm · Ancho {result.stats.widthMm.toFixed(0)} mm
                </p>
                <p className="mt-1 text-xs">
                  Perfil de proceso de ejemplo: {profile.label}, mínimo {profile.minMm.toFixed(1)} mm.
                </p>
              </div>
            </section>

            <section className="mt-6 grid grid-cols-2 gap-6 border-t border-[#c6c2b6] pt-4 text-sm">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-[#4c5760]">Aprobado por</p>
                <p className="font-medium">{approved?.by ?? TECNICO_DEMO}</p>
                <p className="font-mono text-xs">{approved ? fmtDate(approved.at) : ""}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-[#4c5760]">Firma</p>
                <div className="mt-4 h-px bg-[#0b1014]" />
              </div>
            </section>

            <footer className="mt-5 border-t border-[#c6c2b6] pt-3 text-[11px] leading-snug text-[#4c5760]">
              <p>
                Documento de DEMOSTRACIÓN: el diseño es una aproximación geométrica sin calibrar y no es apto para fabricar. {RULES_NOTICE} En la app real, esta hoja llevaría la
                trazabilidad que exija la normativa de producto sanitario a medida (por confirmar con el responsable regulatorio de Zona Pies).
              </p>
            </footer>
          </>
        )}
      </article>
    </div>
  );
}
