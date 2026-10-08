import assets from "./media.assets.json";
import generated from "./media.generated.json";

/**
 * Fotografías reales de producto, tomadas de la web actual de Zona Pies (son suyas).
 * No se incluyen en el repositorio hasta que alguien las descargue: `npm run assets`
 * (necesita acceso a zonapies.es) las guarda en public/media y actualiza media.generated.json.
 * Mientras no estén, los componentes no muestran nada: nunca hay imágenes rotas.
 */
export interface MediaAsset {
  key: string;
  file: string;
  url: string;
  alt: string;
  width: number;
  height: number;
}

const available = new Set<string>(generated.files);

/** Devuelve la imagen si se ha descargado; si no, null. */
export function media(key: string): (MediaAsset & { src: string }) | null {
  const asset = (assets as MediaAsset[]).find((item) => item.key === key);
  if (!asset || !available.has(asset.file)) return null;
  return { ...asset, src: `/media/${asset.file}` };
}
