"use client";

import { useEffect, useRef, useState } from "react";
import { buildFootMesh, FOOT_LENGTH_MM, type Side } from "@/lib/geometry";
import { createViewer, type Preset, type Viewer } from "./engine";
import { FootFallback, PresetBar } from "./ViewerParts";

/** Malla de un STL cargado por el usuario (sopa de triángulos). */
export interface CustomMesh {
  positions: Float32Array;
}

interface Props {
  side: Side;
  /** Dibuja el pie con el hueco simulado bajo el talón y su marcador */
  hole: boolean;
  custom?: CustomMesh | null;
  holeLabel?: string;
  testId?: string;
}

/** Visor del escaneo (pie sintético o STL propio). */
export function ScanViewer({ side, hole, custom, holeLabel = "Zona del talón sin captar", testId }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "nowebgl">("loading");
  const [preset, setPreset] = useState<Preset>("planta");

  useEffect(() => {
    let cancelled = false;
    let v: Viewer | null = null;
    (async () => {
      if (!host.current) return;
      v = await createViewer(host.current);
      if (cancelled) {
        v?.dispose();
        return;
      }
      if (!v) {
        setStatus("nowebgl");
        return;
      }
      viewerRef.current = v;
      setStatus("ready");
    })();
    return () => {
      cancelled = true;
      viewerRef.current = null;
      v?.dispose();
    };
  }, []);

  useEffect(() => {
    const v = viewerRef.current;
    if (!v || status !== "ready") return;
    const { THREE } = v;
    const group = new THREE.Group();
    const disposables: { dispose(): void }[] = [];
    let offFrame: (() => void) | null = null;

    if (custom) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(custom.positions, 3));
      geo.computeVertexNormals();
      geo.computeBoundingSphere();
      geo.center();
      const radius = geo.boundingSphere?.radius ?? 150;
      const mat = new THREE.MeshStandardMaterial({ color: 0xcfd8dc, roughness: 0.6, metalness: 0.05, side: THREE.DoubleSide });
      const wire = new THREE.MeshBasicMaterial({ color: 0x3ee6c9, wireframe: true, transparent: true, opacity: 0.06 });
      const mesh = new THREE.Mesh(geo, mat);
      group.add(mesh, new THREE.Mesh(geo, wire));
      // `content` está desplazado −L/2 en y: se compensa para que el STL quede centrado.
      group.position.set(0, FOOT_LENGTH_MM / 2, 0);
      disposables.push(geo, mat, wire);
      v.controls.minDistance = radius * 0.6;
      v.controls.maxDistance = radius * 8;
      v.camera.position.set(radius * 0.5, radius * 2.8, radius * 2.2);
      v.controls.target.set(0, 0, 0);
      v.controls.update();
    } else {
      const foot = buildFootMesh(side, { holeHeel: hole });
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(foot.positions, 3));
      geo.setIndex(new THREE.BufferAttribute(foot.indices, 1));
      geo.computeVertexNormals();
      // Color por altura: la planta (mitad inferior de la malla) deja ver el arco como un mapa de profundidad.
      const n = foot.positions.length / 3;
      const colors = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        const z = foot.positions[i * 3 + 2];
        const sole = i >= n / 2;
        const t = sole ? Math.min(1, z / 16) : 0.55;
        colors[i * 3] = 0.38 + 0.5 * t;
        colors[i * 3 + 1] = 0.5 + 0.42 * t;
        colors[i * 3 + 2] = 0.54 + 0.38 * t;
      }
      geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55, metalness: 0.08, side: THREE.DoubleSide });
      const pointsMat = new THREE.PointsMaterial({ color: 0x3ee6c9, size: 1.7, sizeAttenuation: true, transparent: true, opacity: 0.5, depthWrite: false });
      group.add(new THREE.Mesh(geo, mat), new THREE.Points(geo, pointsMat));
      disposables.push(geo, mat, pointsMat);
      v.controls.minDistance = 120;
      v.controls.maxDistance = 1100;

      if (foot.hole) {
        const R = foot.hole.radius;
        const ringGeo = new THREE.RingGeometry(R - 1.6, R + 1.6, 72);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xff3b5c, side: THREE.DoubleSide, transparent: true, opacity: 0.9, depthTest: false });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        const discGeo = new THREE.CircleGeometry(R, 72);
        const discMat = new THREE.MeshBasicMaterial({ color: 0xff3b5c, side: THREE.DoubleSide, transparent: true, opacity: 0.22, depthTest: false });
        const disc = new THREE.Mesh(discGeo, discMat);
        ring.position.set(foot.hole.x, foot.hole.y, -0.8);
        disc.position.copy(ring.position);
        ring.renderOrder = 10;
        disc.renderOrder = 9;
        group.add(disc, ring);
        disposables.push(ringGeo, ringMat, discGeo, discMat);
        // Con «reducir movimiento» el marcador queda fijo.
        const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
        if (!reduced) {
          let last = 0;
          offFrame = v.onFrame((t) => {
            if (t - last < 50) return;
            last = t;
            const k = 0.5 + 0.5 * Math.sin(t / 280);
            ring.scale.setScalar(1 + 0.1 * k);
            ringMat.opacity = 0.55 + 0.4 * k;
          });
        }
      }
    }

    v.content.add(group);
    v.requestRender();
    return () => {
      offFrame?.();
      v.content.remove(group);
      disposables.forEach((d) => d.dispose());
      v.requestRender();
    };
  }, [side, hole, custom, status]);

  const pick = (p: Preset) => {
    setPreset(p);
    viewerRef.current?.setPreset(p);
  };

  const foot = status === "nowebgl" ? buildFootMesh(side, { holeHeel: hole }) : null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-ink-900" data-testid={testId}>
      <div ref={host} className="h-[300px] w-full sm:h-[340px]" />
      {status === "loading" ? (
        <p className="absolute inset-0 grid place-items-center text-sm text-[#9aa6ae]">Cargando visor 3D…</p>
      ) : null}
      {status === "nowebgl" && foot ? (
        <div className="absolute inset-0 bg-ink-900">
          <FootFallback side={side} hole={foot.hole} />
        </div>
      ) : null}
      {status === "ready" && hole && !custom ? (
        <p className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-ink-950/75 px-3 py-1.5 text-xs font-medium text-[#eef1f2] backdrop-blur">
          <span aria-hidden="true" className="size-2.5 rounded-full bg-[#ff3b5c]" /> {holeLabel}
        </p>
      ) : null}
      {status === "ready" && custom ? (
        <p className="absolute left-3 top-3 rounded-full bg-ink-950/75 px-3 py-1.5 text-xs font-medium text-[#eef1f2] backdrop-blur">
          STL cargado por ti · solo visualización
        </p>
      ) : null}
      {status === "ready" ? (
        <div className="absolute bottom-3 right-3">
          <PresetBar onPick={pick} active={preset} />
        </div>
      ) : null}
    </div>
  );
}
