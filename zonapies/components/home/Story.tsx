"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { QuoteButton } from "@/components/forms/QuoteProvider";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { ScanFallback, fallbackFrame } from "@/components/scene/ScanFallback";
import { ScanScene, type SceneControl } from "@/components/scene/ScanScene";
import type { MaterialId } from "@/components/scene/textures";
import { Button } from "@/components/ui/Button";
import { ArrowRight, WhatsApp } from "@/components/ui/Icons";
import { chapters, heroHud, storyMaterials, SWATCH } from "@/data/story";
import { whatsappUrl } from "@/data/site";
import { track } from "@/lib/analytics";
import { scrollToTarget } from "@/lib/lenis";
import { onScroll } from "@/lib/scroll-bus";
import { clamp } from "@/components/scene/shape";

/** Pantallas de scroll fijadas: portada + 7 fases (cada una ocupa 1 pantalla). */
const HERO_HOLD = 0.9;
const CHAPTER_SPAN = 1;
const PINNED = HERO_HOLD + chapters.length * CHAPTER_SPAN + 0.1;

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = () => setReduced(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/** Selector de material: radiogroup nativo (teclado con flechas). */
function MaterialPicker({ value, onChange }: { value: MaterialId; onChange: (id: MaterialId) => void }) {
  return (
    <div role="radiogroup" aria-label="Material de la ortesis" className="mt-6 flex flex-wrap gap-2">
      {storyMaterials.map((item) => (
        <label key={item.id} className="need-chip">
          <input type="radio" name="story-material" value={item.id} checked={value === item.id} onChange={() => onChange(item.id)} />
          <span className="gap-2.5">
            <i aria-hidden="true" className="block size-4 rounded-full border border-white/25" style={{ background: SWATCH[item.id] }} />
            {item.label}
          </span>
        </label>
      ))}
    </div>
  );
}

export function Story() {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const control = useRef<SceneControl>({ time: 0, material: "carbono" });
  const seen = useRef<Set<number>>(new Set());

  const [chapter, setChapter] = useState(-1); // -1 = portada
  const [material, setMaterial] = useState<MaterialId>("carbono");

  // Scroll → tiempo de historia (sin re-renders: solo cambia el capítulo activo)
  useEffect(() => {
    if (reduced) return;
    return onScroll((_y, vh) => {
      const container = containerRef.current;
      const stage = stageRef.current;
      if (!container || !stage) return;
      const unit = stage.clientHeight || vh;
      const u = clamp(-container.getBoundingClientRect().top / unit, 0, PINNED);
      const T = clamp((u - HERO_HOLD) / CHAPTER_SPAN, 0, chapters.length);
      control.current.time = T;

      const hero = heroRef.current;
      if (hero) {
        const fade = 1 - clamp(u / 0.7);
        hero.style.opacity = String(fade);
        hero.style.transform = `translate3d(0, ${-u * 48}px, 0)`;
        hero.style.pointerEvents = fade < 0.4 ? "none" : "auto";
        hero.toggleAttribute("inert", fade < 0.4);
      }
      railRef.current?.style.setProperty("--p", String(T / chapters.length));
      barRef.current?.style.setProperty("--p", String(T / chapters.length));

      const index = T < 0.14 ? -1 : Math.min(chapters.length - 1, Math.floor(T));
      setChapter((previous) => (previous === index ? previous : index));
    });
  }, [reduced]);

  // Medición: fases del 3D alcanzadas
  useEffect(() => {
    if (chapter < 0 || seen.current.has(chapter)) return;
    seen.current.add(chapter);
    track("scene_phase", { phase: chapters[chapter].id, index: chapter + 1 });
  }, [chapter]);

  useEffect(() => {
    control.current.material = material;
  }, [material]);

  const jumpTo = (index: number) => {
    const container = containerRef.current;
    const stage = stageRef.current;
    if (!container || !stage) return;
    const top = window.scrollY + container.getBoundingClientRect().top;
    scrollToTarget(top + (HERO_HOLD + index + 0.5) * stage.clientHeight, 0);
  };

  const frame = chapter < 0 ? 0 : chapter + 1;
  const current = chapter >= 0 ? chapters[chapter] : null;

  const heroBlock = (
    <div className="wrap relative flex h-full flex-col justify-between pb-24 pt-24 md:pb-10 lg:grid lg:grid-cols-12 lg:items-center lg:gap-8 lg:py-0">
      <div className="lg:col-span-6 lg:pb-8 xl:col-span-6">
        <p className="chip intro" style={{ ["--d" as string]: 100 }}>
          <span className="dot-live" aria-hidden="true" />
          Laboratorio de ortesis plantares
        </p>
        <SplitHeading as="h1" intro delay={180} className="t-hero mt-6 lg:mt-8" text={"Ingeniería digital aplicada al *movimiento*."} />
        <p className="t-lead intro mt-6 max-w-[34rem] text-[color:var(--fg)]/75 max-sm:hidden lg:max-sm:block" style={{ ["--d" as string]: 650 }}>
          Diseñamos y fabricamos ortesis plantares a medida combinando tecnología 3D, ingeniería y materiales técnicos de alto rendimiento.
        </p>
        <p className="intro mt-5 max-w-[28rem] text-base leading-snug text-muted sm:hidden" style={{ ["--d" as string]: 650 }}>
          Ortesis plantares a medida con tecnología 3D, ingeniería y materiales técnicos de alto rendimiento.
        </p>
      </div>

      <div className="lg:col-span-6 xl:col-span-7 lg:self-end lg:pb-14">
        <div className="intro flex flex-wrap gap-3" style={{ ["--d" as string]: 850 }}>
          <QuoteButton cta="hero" size="lg" magnetic />
          <Button href="/tecnologia" variant="ghost" size="lg" cta="hero-technology">
            Descubrir la tecnología
          </Button>
        </div>
        <ul className="intro mt-7 hidden flex-wrap gap-2 sm:flex" style={{ ["--d" as string]: 1000 }} aria-label="Indicadores">
          {heroHud.map((tag) => (
            <li key={tag} className="chip">
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  /* ---- Movimiento reducido: sin fijar nada, cada fase es un bloque de lectura ---- */
  if (reduced) {
    return (
      <section ref={containerRef} id="inicio" data-section="story" data-theme="dark" className="relative bg-surface text-fg">
        <div className="relative min-h-[100svh] overflow-hidden">
          <div className="pointer-events-none absolute inset-0 opacity-70 lg:left-[38%]">
            <ScanFallback phase={0} material={material} label="Modelo de un pie con el contorno de la plantilla" className="absolute inset-0 h-full w-full" />
          </div>
          <div className="relative min-h-[100svh]">{heroBlock}</div>
        </div>
        {chapters.map((item, index) => (
          <div key={item.id} className="border-t border-line py-20 md:py-28">
            <div className="wrap grid items-center gap-10 lg:grid-cols-2">
              <div>
                <p className="hud text-accent-text">
                  {item.n} — {item.hud}
                </p>
                <h2 className="t-h2 mt-4">{item.title}</h2>
                <p className="t-lead mt-5 max-w-[32rem]">{item.body}</p>
                {item.materials ? <MaterialPicker value={material} onChange={setMaterial} /> : null}
                <div className="mt-7 flex flex-wrap gap-3">
                  {item.cta ? (
                    <>
                      <QuoteButton cta="story-cta" size="lg" />
                      <Button href={whatsappUrl()} variant="ghost" size="lg" cta="story-whatsapp">
                        Hablar con un especialista
                      </Button>
                    </>
                  ) : item.link ? (
                    <Link href={item.link.href} className="link-arrow">
                      {item.link.label} <ArrowRight className="size-4" />
                    </Link>
                  ) : null}
                </div>
              </div>
              <div className="relative aspect-[4/3] max-h-[420px] w-full">
                <ScanFallback phase={index + 1} material={material} label={`Fase ${item.n}: ${item.hud}`} className="absolute inset-0 h-full w-full" />
              </div>
            </div>
          </div>
        ))}
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      id="inicio"
      data-section="story"
      data-theme="dark"
      className="relative bg-surface text-fg"
      style={{ height: `calc(${PINNED + 1} * 100svh)` }}
    >
      <div ref={stageRef} className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Fondo técnico */}
        <div aria-hidden="true" className="bg-grid absolute inset-0 opacity-60" />
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(55%_55%_at_72%_46%,rgba(62,230,201,0.11),transparent_70%)]" />

        {/* Escena */}
        <ScanScene
          control={control}
          frame={frame}
          material={material}
          label="Modelo 3D de un pie que se escanea, se analiza, se convierte en plantilla y se fabrica por capas"
          priority
          markers
          desktopOffsetX={0.2}
          stackedOffsetY={0.15}
          stackedHeroOffsetY={-0.07}
          eventContext="story"
        />

        {/* Velo inferior en móvil para garantizar la legibilidad del texto */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-surface via-surface/90 to-transparent lg:hidden" />

        {/* Portada */}
        <div ref={heroRef} className="absolute inset-0 will-change-transform">
          {heroBlock}
          <div aria-hidden="true" className="intro absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex" style={{ ["--d" as string]: 1400 }}>
            <span className="hud text-muted">Desliza</span>
            <span className="relative block h-10 w-px overflow-hidden bg-line-strong">
              <span className="anim-sweep-y absolute left-0 top-0 block h-4 w-px bg-accent" style={{ ["--sweep" as string]: "24px" }} />
            </span>
          </div>
        </div>

        {/* Fases */}
        <div className="pointer-events-none absolute inset-0">
          <div className="wrap relative h-full lg:grid lg:grid-cols-12">
            <div className="relative h-full lg:col-span-5 xl:col-span-5">
              {chapters.map((item, index) => {
                const active = chapter === index;
                return (
                  <article
                    key={item.id}
                    className="chap absolute inset-x-0 bottom-[5.5rem] flex flex-col justify-end md:bottom-10 lg:bottom-0 lg:top-0 lg:justify-center"
                    data-active={active}
                    inert={!active}
                    aria-labelledby={`story-${item.id}`}
                  >
                    <p className="hud text-accent-text" style={{ ["--s" as string]: 0 }}>
                      <span className="t-num mr-3 text-fg">{item.n}</span>
                      {item.hud}
                    </p>
                    <h2 id={`story-${item.id}`} className="t-chapter mt-4 max-w-[16ch] lg:max-w-[14ch]" style={{ ["--s" as string]: 1 }}>
                      {item.title}
                    </h2>
                    <p className="t-lead mt-4 max-w-[30rem] text-[color:var(--fg)]/75" style={{ ["--s" as string]: 2 }}>
                      {item.body}
                    </p>
                    {item.materials ? (
                      <div style={{ ["--s" as string]: 3 }}>
                        <MaterialPicker value={material} onChange={setMaterial} />
                      </div>
                    ) : null}
                    <div className="mt-6 flex flex-wrap gap-3" style={{ ["--s" as string]: 4 }}>
                      {item.cta ? (
                        <>
                          <QuoteButton cta="story-cta" size="lg" magnetic />
                          <Button href={whatsappUrl()} variant="ghost" size="lg" cta="story-whatsapp" arrow={false}>
                            <WhatsApp className="size-4" /> Hablar con un especialista
                          </Button>
                        </>
                      ) : item.link ? (
                        <Link href={item.link.href} className="link-arrow" data-cta={`story-${item.id}`}>
                          {item.link.label} <ArrowRight className="size-4" />
                        </Link>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>

        {/* HUD móvil: fase y progreso */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[4.6rem] lg:hidden">
          <div className="wrap flex items-center gap-3">
            <span className="hud t-num text-accent-text">{current ? `${current.n} / 07` : "00 / 07"}</span>
            <span className="hud text-muted">{current?.hud ?? "SCAN"}</span>
            <div ref={barRef} className="relative ml-auto h-px w-24 bg-line-strong">
              <span className="absolute inset-y-0 left-0 block bg-accent" style={{ width: "calc(var(--p, 0) * 100%)" }} />
            </div>
          </div>
        </div>

        {/* Carril de fases (escritorio) */}
        <nav aria-label="Fases del recorrido" className="absolute right-6 top-1/2 hidden -translate-y-1/2 lg:block xl:right-10">
          <div ref={railRef} className="relative">
            <span aria-hidden="true" className="absolute bottom-3 right-[0.9rem] top-3 block w-px bg-line-strong" />
            <span aria-hidden="true" className="absolute right-[0.9rem] top-3 block w-px origin-top bg-accent" style={{ height: "calc((100% - 1.5rem) * var(--p, 0))" }} />
            <ol className="relative flex flex-col gap-1">
              {chapters.map((item, index) => {
                const active = chapter === index;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => jumpTo(index)}
                      aria-label={`Ir a la fase ${item.n}: ${item.hud}`}
                      aria-current={active ? "step" : undefined}
                      className="group flex min-h-9 w-full items-center justify-end gap-3 rounded-full px-1 py-1"
                    >
                      <span className={`hud transition-all duration-500 ${active ? "translate-x-0 text-fg opacity-100" : "translate-x-2 text-muted opacity-0 group-hover:translate-x-0 group-hover:opacity-100"}`}>{item.hud}</span>
                      <span className={`t-num grid size-7 place-items-center rounded-full border text-[0.6875rem] transition-colors duration-500 ${active ? "border-accent bg-accent text-accent-fg" : "border-line-strong bg-surface text-muted group-hover:text-fg"}`}>
                        {item.n}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </nav>
      </div>
    </section>
  );
}
