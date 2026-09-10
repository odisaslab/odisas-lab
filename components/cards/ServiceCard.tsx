import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import type { Service } from "@/types";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      href={`/servicios/${service.slug}`}
      className="group flex h-full flex-col rounded-[var(--radius-card)] border border-line bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-dark/15 hover:shadow-[var(--shadow-lift)]"
    >
      <ServiceIcon name={service.icon} className="size-6 text-primary" />

      <h3 className="mt-6 text-h3 font-semibold">{service.name}</h3>
      <p className="mt-2 font-medium text-dark">{service.claim}</p>
      <p className="mt-3 text-[0.95rem] text-gray">{service.summary}</p>

      <ul className="mt-6 flex flex-wrap gap-2">
        {service.includes.slice(0, 4).map((item) => (
          <li
            key={item}
            className="rounded-[var(--radius-pill)] bg-light px-3 py-1 text-xs text-gray"
          >
            {item}
          </li>
        ))}
      </ul>

      <span className="mt-auto inline-flex items-center gap-2 pt-7 text-[0.95rem] font-medium text-dark transition-colors group-hover:text-primary-ink">
        Ver servicio
        <ArrowRight
          aria-hidden="true"
          className="size-4 transition-transform duration-200 group-hover:translate-x-1"
        />
      </span>
    </Link>
  );
}
