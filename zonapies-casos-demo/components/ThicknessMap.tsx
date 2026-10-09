"use client";

import { useEffect, useRef } from "react";
import { INSOLE_NS, INSOLE_NY, type InsoleResult, type Side } from "@/lib/geometry";

interface Props {
  result: InsoleResult;
  side: Side;
  /** Alto del dibujo en px CSS */
  height?: number;
  /** Fondo claro (hoja impresa) u oscuro (editor) */
  theme?: "dark" | "light";
  testId?: string;
}

/** Mapa de grosor visto desde arriba (calculado de la misma malla que el 3D). */
export function ThicknessMap({ result, side, height = 300, theme = "dark", testId }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const NS = INSOLE_NS;
    const NY = INSOLE_NY;
    const pos = result.positions;
    const col = result.colors;
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < NY; i++) {
      for (let j = 0; j < NS; j++) {
        const a = (i * NS + j) * 3;
        minX = Math.min(minX, pos[a]);
        maxX = Math.max(maxX, pos[a]);
        minY = Math.min(minY, pos[a + 1]);
        maxY = Math.max(maxY, pos[a + 1]);
      }
    }
    const pad = 22;
    const spanX = maxX - minX;
    const spanY = maxY - minY;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssH = height;
    const scale = (cssH - pad * 2) / spanY;
    const cssW = Math.round(spanX * scale + pad * 2 + 24);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const sx = (x: number) => pad + 12 + (x - minX) * scale;
    const sy = (y: number) => cssH - pad - (y - minY) * scale;
    const rgb = (i: number, j: number) => {
      const a = (i * NS + j) * 3;
      return `rgb(${Math.round(col[a] * 255)},${Math.round(col[a + 1] * 255)},${Math.round(col[a + 2] * 255)})`;
    };

    for (let i = 0; i < NY - 1; i++) {
      for (let j = 0; j < NS - 1; j++) {
        const p = [
          [i, j],
          [i, j + 1],
          [i + 1, j + 1],
          [i + 1, j],
        ];
        ctx.beginPath();
        p.forEach(([ii, jj], k) => {
          const a = (ii * NS + jj) * 3;
          if (k === 0) ctx.moveTo(sx(pos[a]), sy(pos[a + 1]));
          else ctx.lineTo(sx(pos[a]), sy(pos[a + 1]));
        });
        ctx.closePath();
        const c = rgb(i, j);
        ctx.fillStyle = c;
        ctx.strokeStyle = c;
        ctx.lineWidth = 0.7;
        ctx.fill();
        ctx.stroke();
      }
    }

    // Contorno
    const ink = theme === "dark" ? "rgba(255,255,255,0.7)" : "rgba(11,16,20,0.75)";
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.2;
    for (const j of [0, NS - 1]) {
      ctx.beginPath();
      for (let i = 0; i < NY; i++) {
        const a = (i * NS + j) * 3;
        if (i === 0) ctx.moveTo(sx(pos[a]), sy(pos[a + 1]));
        else ctx.lineTo(sx(pos[a]), sy(pos[a + 1]));
      }
      ctx.stroke();
    }

    // Barra de escala (50 mm) y rótulos
    ctx.fillStyle = theme === "dark" ? "#9aa6ae" : "#4c5760";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    const bar = 50 * scale;
    ctx.fillRect(sx(minX), cssH - 10, bar, 2);
    ctx.fillText("50 mm", sx(minX) + bar + 6, cssH - 6);
    ctx.textAlign = "center";
    ctx.fillText("Antepié", (sx(minX) + sx(maxX)) / 2, 12);
    ctx.fillText("Talón", (sx(minX) + sx(maxX)) / 2, cssH - 18);
    ctx.textAlign = "left";
    const medialLeft = side === "derecho";
    ctx.fillText("medial", medialLeft ? 2 : cssW - 38, cssH / 2);
  }, [result, side, height, theme]);

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label="Mapa de grosor de la ortesis visto desde arriba, con talón abajo y antepié arriba"
      data-testid={testId}
      className="mx-auto max-w-full"
    />
  );
}
