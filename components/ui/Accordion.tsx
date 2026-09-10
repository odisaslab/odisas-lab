import { Plus } from "lucide-react";
import type { FaqItem } from "@/types";

/**
 * Acordeón con details/summary: accesible y funcional sin JavaScript.
 */
export function Accordion({ items }: { items: FaqItem[] }) {
  return (
    <div>
      {items.map((item) => (
        <details key={item.question} className="group border-t border-line last:border-b">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 text-left font-medium text-dark transition-colors hover:text-primary-ink [&::-webkit-details-marker]:hidden">
            <span className="text-[1.05rem]">{item.question}</span>
            <Plus
              aria-hidden="true"
              className="mt-1 size-5 shrink-0 text-primary transition-transform duration-300 group-open:rotate-45"
            />
          </summary>
          <p className="max-w-2xl pb-7 text-gray">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
