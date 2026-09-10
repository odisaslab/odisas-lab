import Image from "next/image";
import Link from "next/link";
import { assets, site } from "@/data/site";

/**
 * Si hay logotipo en data/site.ts se usa la imagen.
 * Si no, se dibuja el logotipo tipográfico con la tipografía de la marca.
 */
export function Logo({ invert = false }: { invert?: boolean }) {
  const source = invert ? assets.logoInvert || assets.logo : assets.logo;

  return (
    <Link
      href="/"
      aria-label={`${site.name}, ir a la página de inicio`}
      className="inline-flex items-center"
    >
      {source ? (
        <Image
          src={source}
          alt={site.name}
          width={assets.logoWidth}
          height={assets.logoHeight}
          priority
          style={{ height: assets.logoHeight, width: "auto" }}
        />
      ) : (
        <span className="inline-flex items-baseline gap-1.5 font-[family-name:var(--font-display)] text-xl font-semibold tracking-[-0.03em]">
          <span className={invert ? "text-white" : "text-dark"}>Odisas</span>
          <span className="text-primary">Lab</span>
          <span aria-hidden="true" className="mb-0.5 size-1.5 rounded-full bg-primary" />
        </span>
      )}
    </Link>
  );
}
