import Link from "next/link";

export interface Crumb {
  label: string;
  /** Sin href = página actual */
  href?: string;
}

export function Breadcrumbs({ items, onDark = false }: { items: Crumb[]; onDark?: boolean }) {
  return (
    <nav aria-label="Ruta de navegación" className={`text-sm ${onDark ? "text-mute" : "text-gray"}`}>
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-2">
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            {item.href ? (
              <Link href={item.href} className="link-underline">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className={onDark ? "text-cream" : "text-dark"}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
