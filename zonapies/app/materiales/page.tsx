import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { FinalCta } from "@/components/sections/FinalCta";
import { MaterialLab } from "@/components/sections/MaterialLab";
import { JsonLd } from "@/components/ui/JsonLd";
import { Section } from "@/components/ui/Section";
import { levelLabels, materials } from "@/data/materials";
import { breadcrumbJsonLd, pageMetadata, serviceJsonLd } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Materiales para plantillas: fibra de carbono, EVA, PA11, resina y composite",
  description:
    "Material Lab: compara las plantillas de fibra de carbono, EVA, PA11, resina, composite y memory. Flexibilidad, resistencia, confort, ventajas y aplicaciones.",
  path: "/materiales",
});

export default function MaterialesPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Inicio", path: "/" }, { name: "Materiales", path: "/materiales" }])} />
      <JsonLd
        data={serviceJsonLd({
          name: "Plantillas en materiales técnicos",
          description: "Plantillas de fibra de carbono, EVA, PA11, resina, composite y memory fabricadas a medida para profesionales.",
          path: "/materiales",
        })}
      />

      <Section name="material-lab" theme="light" className="!pt-36 md:!pt-44" label="Material Lab">
        <div className="wrap">
          <MaterialLab
            headingAs="h1"
            title={"Plantillas en materiales *técnicos*."}
            lead="Fibra de carbono, EVA, PA11, resina, composite y memory. Selecciona un material y mira cómo cambia la pieza, su comportamiento y sus aplicaciones."
            context="materials-page"
          />
        </div>
      </Section>

      <Section name="materials-compare" theme="dark" label="Comparativa de materiales">
        <div className="wrap">
          <Reveal>
            <p className="t-eyebrow">Comparativa</p>
          </Reveal>
          <SplitHeading as="h2" className="t-h2 mt-6 max-w-[18ch]" text={"Seis materiales, un vistazo."} />
          <Reveal delay={150}>
            <p className="t-lead mt-6 max-w-[38rem]">Niveles orientativos de 1 a 5 entre familias de material. Tu prescripción decide cuál encaja en cada caso.</p>
          </Reveal>

          <Reveal delay={200} className="mt-12 overflow-x-auto rounded-3xl border border-line">
            <table className="w-full min-w-[40rem] border-collapse text-left">
              <caption className="sr-only">Comparativa orientativa de los materiales de las plantillas</caption>
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="hud p-5 text-muted md:p-6">
                    Material
                  </th>
                  {(Object.keys(levelLabels) as (keyof typeof levelLabels)[]).map((key) => (
                    <th key={key} scope="col" className="hud p-5 text-muted md:p-6">
                      {levelLabels[key]}
                    </th>
                  ))}
                  <th scope="col" className="hud p-5 text-muted md:p-6">
                    Familia
                  </th>
                </tr>
              </thead>
              <tbody>
                {materials.map((m) => (
                  <tr key={m.id} className="border-b border-line last:border-b-0">
                    <th scope="row" className="p-5 text-lg font-medium tracking-tight md:p-6">
                      {m.name}
                    </th>
                    {(Object.keys(levelLabels) as (keyof typeof levelLabels)[]).map((key) => (
                      <td key={key} className="p-5 md:p-6">
                        <span className="flex items-center gap-2" role="img" aria-label={`${m.levels[key]} de 5`}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} aria-hidden="true" className={`size-2.5 rounded-full ${i < m.levels[key] ? "bg-accent" : "bg-line-strong"}`} />
                          ))}
                        </span>
                      </td>
                    ))}
                    <td className="p-5 text-sm text-muted md:p-6">{m.family}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
          <p className="mt-5 text-sm text-muted">Valores orientativos de comparación entre familias, pendientes de validación por el equipo técnico de Zona Pies.</p>
        </div>
      </Section>

      <Section name="materials-extra" theme="light" label="Amortiguación, suspensión y forros">
        <div className="wrap grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="t-eyebrow">Además</p>
            </Reveal>
            <SplitHeading as="h2" className="t-h2 mt-6" text={"Amortiguación, suspensión y *forros*."} />
          </div>
          <Reveal delay={150} className="lg:col-span-6 lg:col-start-7">
            <p className="t-lead">
              Cada ortesis puede completarse con soluciones de amortiguación y suspensión y con distintos forros, para ajustar el comportamiento y el acabado de la pieza a lo que pide la prescripción.
            </p>
          </Reveal>
        </div>
      </Section>

      <FinalCta scene={false} title={"¿Qué material necesita tu *caso*?"} lead="Cuéntanos qué buscas y un especialista te recomienda opciones." />
    </>
  );
}
