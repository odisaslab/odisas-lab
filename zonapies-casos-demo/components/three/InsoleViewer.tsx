"use client";

import { useEffect, useRef, useState } from "react";
import {
  buildFootMesh,
  compareLineIndex,
  heatCss,
  HEAT_MAX_MM,
  insoleTopology,
  type InsoleResult,
  type Side,
} from "@/lib/geometry";
import { createViewer, type Preset, type Viewer } from "./engine";
import { FootFallback, PresetBar } from "./ViewerParts";

interface Props {
  side: Side;
  result: InsoleResult;
  /** Versión con la que se compara (se dibuja con líneas ámbar) */
  compare?: InsoleResult | null;
  /** Altura a la que se apoya el pie fantasma sobre la ortesis */
  footLift: number;
  showFoot: boolean;
  showHeat: boolean;
}

interface Built {
  topGeo: import("three").BufferGeometry;
  bodyGeo: import("three").BufferGeometry;
  posAttr: import("three").BufferAttribute;
  colAttr: import("three").BufferAttribute;
  topMat: import("three").MeshStandardMaterial;
  foot: import("three").Mesh;
  cmpGeo: import("three").BufferGeometry;
  cmpPos: import("three").BufferAttribute;
  cmpMesh: import("three").LineSegments;
}

/** Visor del editor: ortesis con mapa de calor + pie fantasma + comparación con otra versión. */
export function InsoleViewer({ side, result, compare, footLift, showFoot, showHeat }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const builtRef = useRef<Built | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "nowebgl">("loading");
  const [preset, setPreset] = useState<Preset>("dorso");

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
      v.setPreset("dorso", false);
      viewerRef.current = v;
      setStatus("ready");
    })();
    return () => {
      cancelled = true;
      builtRef.current = null;
      viewerRef.current = null;
      v?.dispose();
    };
  }, []);

  // Construcción de los objetos (una vez por lado)
  useEffect(() => {
    const v = viewerRef.current;
    if (!v || status !== "ready") return;
    const { THREE } = v;
    const topo = insoleTopology();
    const group = new THREE.Group();

    const posAttr = new THREE.BufferAttribute(new Float32Array(topo.vertexCount * 3), 3);
    const colAttr = new THREE.BufferAttribute(new Float32Array(topo.vertexCount * 3), 3);
    const topGeo = new THREE.BufferGeometry();
    topGeo.setAttribute("position", posAttr);
    topGeo.setAttribute("color", colAttr);
    topGeo.setIndex(new THREE.BufferAttribute(topo.topIndex, 1));
    const bodyGeo = new THREE.BufferGeometry();
    bodyGeo.setAttribute("position", posAttr);
    bodyGeo.setAttribute("color", colAttr);
    bodyGeo.setIndex(new THREE.BufferAttribute(topo.bodyIndex, 1));

    const topMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55, metalness: 0.02 });
    const bodyMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, metalness: 0 });
    const topMesh = new THREE.Mesh(topGeo, topMat);
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    topMesh.frustumCulled = false;
    bodyMesh.frustumCulled = false;

    const footData = buildFootMesh(side);
    const footGeo = new THREE.BufferGeometry();
    footGeo.setAttribute("position", new THREE.BufferAttribute(footData.positions, 3));
    footGeo.setIndex(new THREE.BufferAttribute(footData.indices, 1));
    footGeo.computeVertexNormals();
    const footMat = new THREE.MeshStandardMaterial({
      color: 0xe9e2d4,
      transparent: true,
      opacity: 0.2,
      roughness: 0.7,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const foot = new THREE.Mesh(footGeo, footMat);
    foot.renderOrder = 5;

    const cmpPos = new THREE.BufferAttribute(new Float32Array(topo.vertexCount * 3), 3);
    const cmpGeo = new THREE.BufferGeometry();
    cmpGeo.setAttribute("position", cmpPos);
    cmpGeo.setIndex(new THREE.BufferAttribute(compareLineIndex(), 1));
    const cmpMat = new THREE.LineBasicMaterial({ color: 0xf2c14e, transparent: true, opacity: 0.95, depthTest: false });
    const cmpMesh = new THREE.LineSegments(cmpGeo, cmpMat);
    cmpMesh.frustumCulled = false;
    cmpMesh.renderOrder = 8;
    cmpMesh.visible = false;

    group.add(bodyMesh, topMesh, foot, cmpMesh);
    v.content.add(group);
    builtRef.current = { topGeo, bodyGeo, posAttr, colAttr, topMat, foot, cmpGeo, cmpPos, cmpMesh };

    return () => {
      builtRef.current = null;
      v.content.remove(group);
      [topGeo, bodyGeo, footGeo, cmpGeo, topMat, bodyMat, footMat, cmpMat].forEach((d) => d.dispose());
      v.requestRender();
    };
  }, [side, status]);

  // Actualización de la ortesis (cada cambio de parámetro)
  useEffect(() => {
    const b = builtRef.current;
    const v = viewerRef.current;
    if (!b || !v || status !== "ready") return;
    b.posAttr.array.set(result.positions);
    b.colAttr.array.set(result.colors);
    b.posAttr.needsUpdate = true;
    b.colAttr.needsUpdate = true;
    b.topGeo.computeVertexNormals();
    b.bodyGeo.computeVertexNormals();
    b.foot.position.z = footLift;
    v.requestRender();
  }, [result, footLift, status, side]);

  useEffect(() => {
    const b = builtRef.current;
    const v = viewerRef.current;
    if (!b || !v || status !== "ready") return;
    b.foot.visible = showFoot;
    b.topMat.vertexColors = showHeat;
    b.topMat.color.set(showHeat ? 0xffffff : 0x9fb3b8);
    b.topMat.needsUpdate = true;
    v.requestRender();
  }, [showFoot, showHeat, status, side]);

  useEffect(() => {
    const b = builtRef.current;
    const v = viewerRef.current;
    if (!b || !v || status !== "ready") return;
    if (compare) {
      b.cmpPos.array.set(compare.positions);
      b.cmpPos.needsUpdate = true;
      b.cmpMesh.visible = true;
    } else {
      b.cmpMesh.visible = false;
    }
    v.requestRender();
  }, [compare, status, side]);

  const pick = (p: Preset) => {
    setPreset(p);
    viewerRef.current?.setPreset(p);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-ink-900" data-testid="insole-viewer">
      <div ref={host} className="h-[340px] w-full lg:h-[460px]" />
      {status === "loading" ? (
        <p className="absolute inset-0 grid place-items-center text-sm text-[#9aa6ae]">Cargando visor 3D…</p>
      ) : null}
      {status === "nowebgl" ? (
        <div className="absolute inset-0 bg-ink-900">
          <FootFallback side={side} label="Vista 2D: el navegador no muestra 3D. Usa el mapa de grosor de abajo." />
        </div>
      ) : null}
      {status === "ready" ? (
        <>
          <div className="absolute bottom-3 right-3">
            <PresetBar onPick={pick} active={preset} />
          </div>
          <HeatLegend />
        </>
      ) : null}
    </div>
  );
}

/** Leyenda del mapa de calor de grosor. */
export function HeatLegend({ className = "" }: { className?: string }) {
  const stops = [0, 5, 10, 15, HEAT_MAX_MM];
  const gradient = `linear-gradient(90deg, ${Array.from({ length: 14 }, (_, i) => heatCss((i / 13) * HEAT_MAX_MM)).join(", ")})`;
  return (
    <div
      className={`absolute bottom-3 left-3 w-44 rounded-xl bg-ink-950/75 p-2.5 text-[11px] text-[#eef1f2] backdrop-blur ${className}`}
      role="img"
      aria-label={`Leyenda del grosor del shell en milímetros, de 0 a ${HEAT_MAX_MM}`}
    >
      <div className="h-2 rounded-full" style={{ background: gradient }} />
      <div className="mt-1 flex justify-between font-mono text-[10px] text-[#9aa6ae]">
        {stops.map((s) => (
          <span key={s}>{s}</span>
        ))}
      </div>
      <p className="mt-1 text-[#9aa6ae]">Grosor del shell (mm)</p>
      <p className="mt-1 flex items-center gap-1.5">
        <span aria-hidden="true" className="inline-block size-2.5 rounded-full bg-[#ff3b5c]" /> Bajo el mínimo del proceso
      </p>
    </div>
  );
}
