"use client";

import { useEffect, useRef } from "react";
import { materialTextures, type MaterialId } from "@/components/scene/textures";

interface MacroSwatchProps {
  id: MaterialId;
  label: string;
  className?: string;
  /** Relación de aspecto CSS (por defecto cuadrada) */
  ratio?: string;
}

/**
 * Vista «macro» del material: la textura procedural ampliada, con un brillo que sigue al
 * cursor y un ligero paralaje. Canvas 2D (sin WebGL): funciona en cualquier dispositivo.
 */
export function MacroSwatch({ id, label, className = "", ratio = "1 / 1" }: MacroSwatchProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const size = 360;
    canvas.width = size;
    canvas.height = size;
    const tex = materialTextures(id, 256).color;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    // Ampliación ×2.2 con teselado, para que se aprecie el detalle de la superficie
    const tile = 256 * 1.1;
    for (let x = -tile / 2; x < size; x += tile) {
      for (let y = -tile / 2; y < size; y += tile) ctx.drawImage(tex, x, y, tile, tile);
    }
    // Viñeta suave para dar volumen
    const g = ctx.createRadialGradient(size / 2, size / 2, size * 0.25, size / 2, size / 2, size * 0.75);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0.45)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }, [id]);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const ok = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!ok.matches) return;
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      const rect = box.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        box.style.setProperty("--mx", `${x * 100}%`);
        box.style.setProperty("--my", `${y * 100}%`);
        box.style.setProperty("--px", `${(x - 0.5) * -14}px`);
        box.style.setProperty("--py", `${(y - 0.5) * -14}px`);
      });
    };
    const onLeave = () => {
      box.style.setProperty("--px", "0px");
      box.style.setProperty("--py", "0px");
    };
    box.addEventListener("pointermove", onMove);
    box.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      box.removeEventListener("pointermove", onMove);
      box.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={boxRef}
      role="img"
      aria-label={`Vista macro ilustrativa de ${label}`}
      className={`reg relative overflow-hidden rounded-2xl border border-line bg-black ${className}`}
      style={{ aspectRatio: ratio, ["--mx" as string]: "50%", ["--my" as string]: "40%", ["--px" as string]: "0px", ["--py" as string]: "0px" }}
    >
      <span className="reg-b" />
      <canvas
        ref={canvasRef}
        className="absolute inset-[-8%] h-[116%] w-[116%] max-w-none transition-transform duration-300 ease-out"
        style={{ transform: "translate3d(var(--px), var(--py), 0)" }}
        aria-hidden="true"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 mix-blend-soft-light"
        style={{ background: "radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,0.75), transparent 55%)" }}
      />
      <span className="hud absolute bottom-3 left-3 rounded bg-black/55 px-2 py-1 text-white/80 backdrop-blur">Macro · ilustrativo</span>
    </div>
  );
}
