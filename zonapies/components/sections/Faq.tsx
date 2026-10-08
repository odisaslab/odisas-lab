import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { JsonLd } from "@/components/ui/JsonLd";
import { Plus } from "@/components/ui/Icons";
import { faqJsonLd } from "@/lib/seo";

export interface FaqItem {
  q: string;
  a: string;
}

/** Preguntas frecuentes con <details> nativo (accesible, sin JS) y datos estructurados FAQPage. */
export function Faq({ items, title = "Preguntas *frecuentes*." }: { items: FaqItem[]; title?: string }) {
  return (
    <div className="wrap">
      <JsonLd data={faqJsonLd(items)} />
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <Reveal>
            <p className="t-eyebrow">Dudas habituales</p>
          </Reveal>
          <SplitHeading as="h2" className="t-h2 mt-6" text={title} />
        </div>
        <div className="lg:col-span-8">
          {items.map((item, index) => (
            <Reveal key={item.q} delay={Math.min(index, 4) * 60}>
              <details className="group border-t border-line last:border-b">
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-[1.0625rem] font-medium tracking-tight marker:hidden md:text-xl [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span className="grid size-10 shrink-0 place-items-center rounded-full border border-line-strong transition-transform duration-500 group-open:rotate-45">
                    <Plus className="size-4" />
                  </span>
                </summary>
                <p className="t-body max-w-[42rem] pb-7 pr-12">{item.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
