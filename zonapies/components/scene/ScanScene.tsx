"use client";

import { useEffect, useRef, useState, type MutableRefObject } from "react";
import { track } from "@/lib/analytics";
import type { SceneEngine } from "./engine";
import { detectPolicy, lower, writeCap, type ScenePolicy } from "./policy";
import { ScanFallback } from "./ScanFallback";
import type { MaterialId } from "./textures";

/** Estado que el padre muta (sin re-render) y que el motor lee en cada fotograma. */
export interface SceneControl {
  time: number;
  material: MaterialId;
}

interface ScanSceneProps {
  control: MutableRefObject<SceneControl>;
  /** Fotograma de la ilustración SVG (render del servidor y fallback) */
  frame: number;
  material: MaterialId;
  /** Descripción para lectores de pantalla */
  label: string;
  className?: string;
  /** Monta el 3D en cuanto el navegador esté libre (hero). Si no, al acercarse a pantalla. */
  priority?: boolean;
  /** Permite girar la pieza arrastrando */
  drag?: boolean;
  /** Marcadores HUD (anatomía, capas) */
  markers?: boolean;
  /** Desplazamiento horizontal del modelo en escritorio (fracción del ancho) */
  desktopOffsetX?: number;
  /** Desplazamiento vertical del modelo cuando el texto va debajo (fracción del alto) */
  stackedOffsetY?: number;
  /** Igual, pero durante la portada (T≈0), que tiene el texto en otra posición */
  stackedHeroOffsetY?: number;
  /** En equipos «lite» (móvil) usar solo la ilustración SVG */
  svgOnLite?: boolean;
  eventContext?: string;
}

/**
 * Escena 3D con degradación elegante:
 *  - el servidor y los equipos sin capacidad muestran la ilustración SVG;
 *  - el 3D se monta tras el primer pintado y se funde sobre la ilustración;
 *  - se pausa fuera de pantalla y con la pestaña oculta;
 *  - si los FPS son bajos de forma sostenida, baja de nivel (full → lite → SVG).
 */
export function ScanScene({
  control,
  frame,
  material,
  label,
  className = "",
  priority = false,
  drag = false,
  markers = false,
  desktopOffsetX = 0,
  stackedOffsetY = 0,
  stackedHeroOffsetY,
  svgOnLite = false,
  eventContext = "scene",
}: ScanSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const levelRef = useRef<ScenePolicy | null>(null);
  const [generation, setGeneration] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let level = levelRef.current ?? detectPolicy();
    if (level === "lite" && svgOnLite) level = "none";
    levelRef.current = level;
    if (level === "none") {
      setReady(false);
      return;
    }

    let cancelled = false;
    let engine: SceneEngine | null = null;
    let inView = false;
    let started = false;
    let idleHandle: number | undefined;

    const sync = () => engine?.setVisible(inView && !document.hidden);

    const degrade = (reason: string) => {
      const next = lower(level as ScenePolicy);
      track("scene_degraded", { from: level as string, to: next, reason, context: eventContext });
      writeCap(next);
      levelRef.current = next === "lite" && svgOnLite ? "none" : next;
      setReady(false);
      setGeneration((g) => g + 1);
    };

    const boot = async () => {
      if (started || cancelled) return;
      started = true;
      try {
        const { SceneEngine } = await import("./engine");
        const canvas = canvasRef.current;
        if (cancelled || !canvas) return;

        engine = new SceneEngine({
          canvas,
          host,
          tier: level as "full" | "lite",
          drag,
          markers,
          govern: !new URLSearchParams(window.location.search).has("scene"),
          getInput: () => {
            const wide = host.clientWidth >= 1024;
            const time = control.current.time;
            const heroY = stackedHeroOffsetY ?? stackedOffsetY;
            const blend = Math.min(1, Math.max(0, (time - 0.02) / 0.33));
            return {
              time,
              material: control.current.material,
              offsetX: wide ? desktopOffsetX : 0,
              offsetY: wide ? 0 : heroY + (stackedOffsetY - heroY) * (blend * blend * (3 - 2 * blend)),
            };
          },
          onSlow: () => degrade("low_fps"),
          onContextLost: () => degrade("context_lost"),
          onInteract: () => track("scene_interact", { context: eventContext }),
        });
        engine.renderOnce();
        setReady(true);
        sync();
      } catch (error) {
        if (process.env.NODE_ENV !== "production") console.error("[scene] no se pudo iniciar el 3D:", error);
        if (!cancelled) degrade("init_error");
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        inView = entries.some((entry) => entry.isIntersecting);
        if (inView && !priority) void boot();
        sync();
      },
      { rootMargin: "240px 0px" },
    );
    io.observe(host);

    if (priority) {
      const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
      idleHandle = w.requestIdleCallback ? w.requestIdleCallback(() => void boot(), { timeout: 900 }) : window.setTimeout(() => void boot(), 250);
    }

    document.addEventListener("visibilitychange", sync);

    return () => {
      cancelled = true;
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      if (idleHandle !== undefined) {
        const w = window as Window & { cancelIdleCallback?: (h: number) => void };
        if (w.cancelIdleCallback) w.cancelIdleCallback(idleHandle);
        else window.clearTimeout(idleHandle);
      }
      engine?.dispose();
      engine = null;
    };
    // control es una ref estable; el resto de props son de configuración estática
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generation]);

  return (
    <div ref={hostRef} className={`absolute inset-0 ${className}`} role="img" aria-label={label}>
      {/* La ilustración se desplaza igual que el modelo 3D, para que el fundido entre ambos no «salte» */}
      <div
        className={`fb-shift absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-0" : "opacity-100"}`}
        style={{ ["--fx" as string]: desktopOffsetX, ["--fy" as string]: frame === 0 ? (stackedHeroOffsetY ?? stackedOffsetY) : stackedOffsetY }}
      >
        <ScanFallback phase={frame} material={material} className="absolute inset-0 h-full w-full" />
      </div>
      <canvas
        key={generation}
        ref={canvasRef}
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}
        style={{ touchAction: "pan-y" }}
      />
    </div>
  );
}
