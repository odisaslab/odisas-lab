import { Check } from "lucide-react";
import { AuditTool } from "@/components/audit/AuditTool";
import { Split } from "@/components/motion/Split";
import { audit } from "@/data/home";

/**
 * Diagnóstico gratuito integrado: el visitante prueba el valor antes de contactar.
 * Sección naranja (la marca) con el panel de la herramienta en oscuro.
 */
export function AuditSection() {
  return (
    <section id="analiza-tu-web" aria-labelledby="audit-titulo" className="bg-cream">
      {/* La sección crece desde una tarjeta redondeada: marca el paso del concepto (diagnóstico) a la herramienta */}
      <div data-expand className="sec tone-orange">
      <div className="wrap">
        <div className="grid items-end gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          <div>
            <p className="eyebrow mb-6" data-reveal>
              {audit.eyebrow}
            </p>
            <Split as="h2" id="audit-titulo" className="t-h2 max-w-[18ch]" text={audit.title} />
          </div>
          <div data-reveal>
            <p className="t-lead muted max-w-md">{audit.text}</p>
            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[0.95rem] font-medium">
              {audit.bullets.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check aria-hidden="true" className="size-4" strokeWidth={3} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          data-reveal
          className="tone-dark mt-12 rounded-[28px] border border-ink p-5 shadow-[0_40px_90px_-30px_rgba(10,10,11,0.65)] sm:p-8 md:mt-16 md:p-12"
        >
          <AuditTool />
        </div>
      </div>
      </div>
    </section>
  );
}
