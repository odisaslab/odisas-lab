"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { QuoteButton } from "@/components/forms/QuoteProvider";
import { ScanScene, type SceneControl } from "@/components/scene/ScanScene";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { Reveal } from "@/components/motion/Reveal";
import { PendingText } from "@/components/ui/Placeholder";
import { ArrowRight } from "@/components/ui/Icons";
import { MacroSwatch } from "@/components/visuals/MacroSwatch";
import { levelLabels, materials, type MaterialInfo } from "@/data/materials";
import { SWATCH } from "@/data/story";
import { track } from "@/lib/analytics";

interface MaterialLabProps {
  /** h1 en la página /materiales, h2 en la home */
  headingAs?: "h1" | "h2";
  title?: string;
  lead?: string;
  /** Enlaza a la página completa (solo en la home) */
  linkToPage?: boolean;
  context?: "home" | "materials-page";
}

/**
 * Material Lab (briefing §11): explorar materiales «dentro de un laboratorio».
 * Al elegir un material cambian: el modelo 3D (textura, brillo), la vista macro, las
 * propiedades, las ventajas y las aplicaciones.
 */
export function MaterialLab({
  headingAs = "h2",
  title = "El material también es *tecnología*.",
  lead = "Resina, composite, fibra de carbono, EVA, PA11 y memory. Selecciona un material y compara cómo se comporta.",
  linkToPage = false,
  context = "home",
}: MaterialLabProps) {
  const [activeId, setActiveId] = useState<MaterialInfo["id"]>("carbono");
  const control = useRef<SceneControl>({ time: 3.55, material: "carbono" });
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const first = useRef(true);

  useEffect(() => {
    control.current.material = activeId;
    if (first.current) {
      first.current = false;
      return;
    }
    track("material_view", { material: activeId, context });
  }, [activeId, context]);

  const active = materials.find((m) => m.id === activeId) ?? materials[0];
  // Sin saltos de nivel: bajo un h1 (página /materiales) los títulos de panel son h2
  const Item = headingAs === "h1" ? "h2" : "h3";

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const keys = ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    let next = index;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") next = (index + 1) % materials.length;
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = (index - 1 + materials.length) % materials.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = materials.length - 1;
    const id = materials[next].id;
    setActiveId(id);
    tabRefs.current[id]?.focus();
  };

  return (
    <div>
      <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <Reveal>
            <p className="t-eyebrow">Material Lab</p>
          </Reveal>
          <SplitHeading as={headingAs} className={`${headingAs === "h1" ? "t-h1" : "t-h2"} mt-6`} text={title} />
        </div>
        <Reveal delay={150} className="lg:col-span-5">
          <p className="t-lead">{lead}</p>
        </Reveal>
      </div>

      <div className="mt-12 grid gap-6 lg:mt-16 lg:grid-cols-12 lg:gap-8">
        {/* Selector */}
        <div className="min-w-0 lg:col-span-3">
          <div
            role="tablist"
            aria-label="Materiales"
            aria-orientation="vertical"
            className="no-scrollbar -mx-4 flex snap-x gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0"
          >
            {materials.map((material, index) => {
              const selected = material.id === activeId;
              return (
                <button
                  key={material.id}
                  ref={(el) => {
                    tabRefs.current[material.id] = el;
                  }}
                  role="tab"
                  type="button"
                  id={`tab-${material.id}`}
                  aria-selected={selected}
                  aria-controls={`panel-${material.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActiveId(material.id)}
                  onKeyDown={(event) => onKeyDown(event, index)}
                  className={`group relative flex shrink-0 snap-start items-center gap-4 rounded-2xl border px-4 py-3.5 text-left transition-colors duration-300 lg:rounded-none lg:border-0 lg:border-b lg:px-0 lg:py-5 ${
                    selected ? "border-accent text-fg lg:border-line" : "border-line text-muted hover:text-fg lg:border-line"
                  }`}
                >
                  <span className="t-num text-xs text-muted">{String(index + 1).padStart(2, "0")}</span>
                  <span aria-hidden="true" className="size-6 shrink-0 rounded-full border border-line-strong" style={{ background: SWATCH[material.id] }} />
                  <span className="flex min-w-0 flex-col">
                    <span className="text-base font-medium leading-tight tracking-tight lg:text-lg">{material.name}</span>
                    <span className="hidden text-xs text-muted lg:block">{material.family}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={`absolute -left-px top-1/2 hidden h-8 w-[3px] -translate-y-1/2 rounded-full bg-accent transition-opacity lg:block ${selected ? "opacity-100" : "opacity-0"}`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Visor 3D */}
        <div className="min-w-0 lg:col-span-5">
          <div data-theme="dark" className="reg relative h-[22rem] overflow-hidden rounded-3xl border border-line bg-surface sm:h-[26rem] lg:h-[36rem]">
            <span className="reg-b" />
            <div aria-hidden="true" className="bg-grid absolute inset-0 opacity-50" />
            <ScanScene
              control={control}
              frame={4}
              material={activeId}
              label={`Modelo 3D de una plantilla en ${active.name}. Arrastra para girarla.`}
              drag
              svgOnLite
              eventContext="material-lab"
            />
            <div className="pointer-events-none absolute left-5 top-5 flex items-center gap-3">
              <span className="chip">
                <span className="dot-live" aria-hidden="true" /> Material Lab
              </span>
            </div>
            <div className="pointer-events-none absolute inset-x-5 bottom-5 flex items-end justify-between gap-4">
              <div>
                <p className="hud text-muted">Material</p>
                <p className="mt-1 text-xl font-medium tracking-tight text-fg">{active.name}</p>
              </div>
              <p className="hud hidden text-muted sm:block">Arrastra para girar</p>
            </div>
          </div>
        </div>

        {/* Información */}
        <div className="min-w-0 lg:col-span-4">
          {materials.map((material) => {
            const selected = material.id === activeId;
            return (
              <div key={material.id} role="tabpanel" id={`panel-${material.id}`} aria-labelledby={`tab-${material.id}`} hidden={!selected} className="panel-in">
                {selected ? <MacroSwatch id={material.id} label={material.name} ratio="16 / 8" /> : null}

                <Item className="t-h3 mt-6">{material.name}</Item>
                <p className="t-body mt-2">{material.summary}</p>

                <ul className="mt-6 space-y-4" aria-label="Propiedades">
                  {(Object.keys(levelLabels) as (keyof MaterialInfo["levels"])[]).map((key) => (
                    <li key={key}>
                      <div className="flex items-baseline justify-between">
                        <span className="hud text-muted">{levelLabels[key]}</span>
                        <span className="t-num text-sm">
                          {material.levels[key]}
                          <span className="text-muted">/5</span>
                          <span className="sr-only"> de 5</span>
                        </span>
                      </div>
                      <div className="level-bar mt-2 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
                        <i style={{ ["--v" as string]: material.levels[key] / 5 }} />
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
                  <div>
                    <p className="hud text-muted">Ventajas</p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {material.advantages.map((item) => (
                        <li key={item} className="chip !normal-case !tracking-normal text-fg">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="hud text-muted">Aplicaciones</p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {material.applications.map((item) => (
                        <li key={item} className="chip !normal-case !tracking-normal">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <p className="mt-5 text-sm text-muted">
                  Indicaciones: <PendingText>pendiente de validar por el equipo técnico</PendingText>
                </p>
                {!material.validated ? (
                  <p className="mt-2 text-xs text-muted">Valores orientativos de comparación entre familias. Consulta con nuestro equipo qué material encaja con tu prescripción.</p>
                ) : null}

                <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <QuoteButton cta={`material-${material.id}`} prefill={{ need: "fabricacion", message: `Me interesan las plantillas de ${material.name}.` }} />
                  {linkToPage ? (
                    <Link href="/materiales" className="link-arrow" data-cta="material-lab-page">
                      Todos los materiales <ArrowRight className="size-4" />
                    </Link>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
