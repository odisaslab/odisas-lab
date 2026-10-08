import type { MaterialId } from "./textures";

/** Parámetros PBR de cada material en la escena 3D (aspecto ilustrativo). */
export interface Look {
  texture: MaterialId;
  roughness: number;
  metalness: number;
  clearcoat: number;
  clearcoatRoughness: number;
  sheen: number;
  bumpScale: number;
  /** Repeticiones de la textura sobre la pieza */
  repeat: number;
  opacity: number;
  envIntensity: number;
}

export const LOOKS: Record<MaterialId, Look> = {
  carbono: { texture: "carbono", roughness: 0.42, metalness: 0.04, clearcoat: 0.55, clearcoatRoughness: 0.3, sheen: 0, bumpScale: 0.45, repeat: 5.5, opacity: 1, envIntensity: 0.62 },
  eva: { texture: "eva", roughness: 0.94, metalness: 0, clearcoat: 0, clearcoatRoughness: 0.5, sheen: 0.35, bumpScale: 1.6, repeat: 3.2, opacity: 1, envIntensity: 0.6 },
  pa11: { texture: "pa11", roughness: 0.82, metalness: 0, clearcoat: 0, clearcoatRoughness: 0.5, sheen: 0.1, bumpScale: 1.4, repeat: 4, opacity: 1, envIntensity: 0.7 },
  resina: { texture: "resina", roughness: 0.14, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.06, sheen: 0, bumpScale: 0.2, repeat: 1.4, opacity: 0.93, envIntensity: 1.5 },
  composite: { texture: "composite", roughness: 0.55, metalness: 0.08, clearcoat: 0.25, clearcoatRoughness: 0.4, sheen: 0, bumpScale: 1.0, repeat: 2.4, opacity: 1, envIntensity: 0.9 },
  memory: { texture: "memory", roughness: 1, metalness: 0, clearcoat: 0, clearcoatRoughness: 0.5, sheen: 0.7, bumpScale: 2.2, repeat: 2.2, opacity: 1, envIntensity: 0.5 },
  forro: { texture: "forro", roughness: 0.95, metalness: 0, clearcoat: 0, clearcoatRoughness: 0.5, sheen: 0.5, bumpScale: 0.8, repeat: 6, opacity: 1, envIntensity: 0.5 },
  clay: { texture: "clay", roughness: 0.9, metalness: 0, clearcoat: 0, clearcoatRoughness: 0.5, sheen: 0, bumpScale: 0.5, repeat: 2, opacity: 1, envIntensity: 0.45 },
};

export const SELECTABLE: MaterialId[] = ["carbono", "eva", "pa11", "resina", "composite", "memory"];
