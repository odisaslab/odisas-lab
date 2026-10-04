"use client";

import { useEffect, useRef } from "react";
import { FRAG, VERT } from "@/lib/hero-shader";

/**
 * Escena 3D del hero: la marca de Odisas Lab en relieve sobre un campo de puntos que reacciona al cursor.
 *
 * Solo se activa con pantalla grande, puntero fino, sin "reducir movimiento" y sin ahorro de datos.
 * Se monta tras la carga (no compite con el primer pintado), se pausa fuera de pantalla y
 * baja su resolución si el equipo no da más de sí. Si algo falla, simplemente no aparece.
 */
const QUERY = "(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

interface Uniforms {
  uRes: WebGLUniformLocation | null;
  uTime: WebGLUniformLocation | null;
  uMouse: WebGLUniformLocation | null;
  uCenter: WebGLUniformLocation | null;
  uSize: WebGLUniformLocation | null;
  uRot: WebGLUniformLocation | null;
  uIntro: WebGLUniformLocation | null;
  uDots: WebGLUniformLocation | null;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function HeroGL() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    if (!window.matchMedia(QUERY).matches) return;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (connection?.saveData) return;

    let disposed = false;
    let raf = 0;
    let cleanup = () => {};

    const start = () => {
      if (disposed) return;
      const gl = canvas.getContext("webgl", {
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: "low-power",
      });
      if (!gl) return;

      const compile = (type: number, source: string) => {
        const shader = gl.createShader(type);
        if (!shader) return null;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
      };
      const vs = compile(gl.VERTEX_SHADER, VERT);
      const fs = compile(gl.FRAGMENT_SHADER, FRAG);
      const program = gl.createProgram();
      if (!vs || !fs || !program) return;
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
      gl.useProgram(program);

      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, "aPos");
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

      const u: Uniforms = {
        uRes: gl.getUniformLocation(program, "uRes"),
        uTime: gl.getUniformLocation(program, "uTime"),
        uMouse: gl.getUniformLocation(program, "uMouse"),
        uCenter: gl.getUniformLocation(program, "uCenter"),
        uSize: gl.getUniformLocation(program, "uSize"),
        uRot: gl.getUniformLocation(program, "uRot"),
        uIntro: gl.getUniformLocation(program, "uIntro"),
        uDots: gl.getUniformLocation(program, "uDots"),
      };

      // ── Estado ──
      let scale = 0.8; // resolución interna respecto al tamaño en pantalla
      let width = 1;
      let height = 1;
      let cssW = 1;
      let cssH = 1;
      let center = { x: 0, y: 0 };
      let size = 400;

      const target = { x: -9999, y: -9999, rx: 0, ry: 0 };
      const current = { x: -9999, y: -9999, rx: 0, ry: 0 };
      let visible = true;
      let t0 = 0;
      let last = 0;
      let slowFrames = 0;
      let frames = 0;
      let frameTimeSum = 0;

      // Dónde colocar la marca: en el hueco libre a la derecha del titular
      const layout = () => {
        const section = host.parentElement as HTMLElement;
        const title = section.querySelector<HTMLElement>("[data-hero-title]");
        const text = section.querySelector<HTMLElement>("[data-hero-text]");
        // El lienzo llega hasta el panel del sistema, no más abajo
        const panel = section.querySelector<HTMLElement>("[data-hero-panel]");
        if (panel) {
          const h = panel.getBoundingClientRect().top - section.getBoundingClientRect().top - 8;
          host.style.height = `${Math.max(h, 320)}px`;
        }
        const rect = host.getBoundingClientRect();
        cssW = rect.width;
        cssH = rect.height;
        const titleRight = title ? title.getBoundingClientRect().right - rect.left : cssW * 0.6;
        const freeW = Math.max(cssW - 24 - titleRight, 220);
        size = clamp(freeW * 0.92, 240, 520);
        const textRect = text?.getBoundingClientRect();
        const centerY = textRect ? (textRect.top + textRect.bottom) / 2 - rect.top : cssH * 0.4;
        center = { x: titleRight + freeW * 0.47, y: clamp(centerY, size * 0.55, cssH - size * 0.4) };

        width = Math.max(2, Math.floor(cssW * scale * Math.min(window.devicePixelRatio || 1, 1.5)));
        height = Math.max(2, Math.floor(cssH * scale * Math.min(window.devicePixelRatio || 1, 1.5)));
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      };

      const onMove = (event: PointerEvent) => {
        const rect = host.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        target.x = x;
        target.y = cssH - y; // origen abajo-izquierda
        const dx = (event.clientX - (rect.left + center.x)) / (window.innerWidth * 0.55);
        const dy = (event.clientY - (rect.top + center.y)) / (window.innerHeight * 0.55);
        target.ry = clamp(dx, -1, 1) * 0.65;
        target.rx = clamp(dy, -1, 1) * 0.42;
      };
      const onLeave = () => {
        target.x = -9999;
        target.y = -9999;
        target.rx = 0;
        target.ry = 0;
      };

      const render = (now: number) => {
        raf = requestAnimationFrame(render);
        if (!visible || document.hidden) {
          last = 0;
          return;
        }
        if (!t0) t0 = now;
        const dt = last ? now - last : 16;
        last = now;

        // Calidad adaptativa: si va lento, baja la resolución; si sigue lento, se apaga
        frames++;
        frameTimeSum += dt;
        if (frames === 45) {
          const average = frameTimeSum / frames;
          frames = 0;
          frameTimeSum = 0;
          if (average > 26) {
            slowFrames++;
            if (scale > 0.4) {
              scale = Math.max(0.4, scale - 0.15);
              layout();
            } else if (slowFrames > 3) {
              canvas.style.display = "none";
              cancelAnimationFrame(raf);
              return;
            }
          }
        }

        const k = 1 - Math.pow(0.001, dt / 1000); // suavizado independiente de los fps
        current.x += (target.x - current.x) * k * 0.9;
        current.y += (target.y - current.y) * k * 0.9;
        current.rx += (target.rx - current.rx) * k * 0.6;
        current.ry += (target.ry - current.ry) * k * 0.6;

        const seconds = (now - t0) / 1000;
        const intro = 1 - Math.pow(1 - clamp((seconds - 0.1) / 1.8, 0, 1), 3);
        // Al hacer scroll la marca sigue girando, como si se alejara
        const scrolled = clamp(window.scrollY / Math.max(window.innerHeight, 1), 0, 1.2);

        gl.uniform2f(u.uRes, width, height);
        gl.uniform1f(u.uTime, seconds);
        // Convierte píxeles CSS a píxeles del canvas
        const sx = width / cssW;
        const sy = height / cssH;
        gl.uniform2f(u.uMouse, current.x * sx, current.y * sy);
        gl.uniform2f(u.uCenter, center.x * sx, (cssH - center.y) * sy);
        gl.uniform1f(u.uSize, size * sx);
        gl.uniform2f(u.uRot, current.rx, current.ry + scrolled * 1.1);
        gl.uniform1f(u.uIntro, intro);
        gl.uniform1f(u.uDots, intro);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        if (canvas.dataset.live !== "true") canvas.dataset.live = "true";
      };

      layout();
      const resize = new ResizeObserver(layout);
      resize.observe(host);
      const visibility = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
      visibility.observe(host);
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("mouseleave", onLeave);
      raf = requestAnimationFrame(render);

      cleanup = () => {
        cancelAnimationFrame(raf);
        resize.disconnect();
        visibility.disconnect();
        window.removeEventListener("pointermove", onMove);
        document.documentElement.removeEventListener("mouseleave", onLeave);
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      };
    };

    // Tras la carga y con el hilo principal libre
    const schedule = () => {
      const idle = (window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number })
        .requestIdleCallback;
      if (idle) idle(start, { timeout: 2500 });
      else window.setTimeout(start, 900);
    };
    let timer = 0;
    if (document.readyState === "complete") timer = window.setTimeout(schedule, 500);
    else window.addEventListener("load", () => (timer = window.setTimeout(schedule, 500)), { once: true });

    return () => {
      disposed = true;
      window.clearTimeout(timer);
      cleanup();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="block h-full w-full opacity-0 transition-opacity duration-1000 data-[live=true]:opacity-100"
    />
  );
}
