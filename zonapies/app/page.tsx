import { Story } from "@/components/home/Story";
import { AboutTimeline } from "@/components/sections/AboutTimeline";
import { Cases } from "@/components/sections/Cases";
import { Configurator } from "@/components/sections/Configurator";
import { FinalCta } from "@/components/sections/FinalCta";
import { FranchiseTeaser } from "@/components/sections/FranchiseTeaser";
import { MaterialLab } from "@/components/sections/MaterialLab";
import { NeedsSelector } from "@/components/sections/NeedsSelector";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { ProZone } from "@/components/sections/ProZone";
import { Testimonials } from "@/components/sections/Testimonials";
import { TrainingTeaser } from "@/components/sections/TrainingTeaser";
import { WhatWeDo } from "@/components/sections/WhatWeDo";
import { JsonLd } from "@/components/ui/JsonLd";
import { Section } from "@/components/ui/Section";
import { site } from "@/data/site";
import { pageMetadata, serviceJsonLd } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Zona Pies | Laboratorio de ortesis plantares y plantillas a medida",
  description: site.description,
  path: "/",
});

export default function Home() {
  return (
    <>
      <JsonLd
        data={serviceJsonLd({
          name: "Fabricación de ortesis plantares y plantillas a medida para profesionales",
          description: "Escaneo 3D, diseño digital y fabricación avanzada de plantillas ortopédicas a medida en resina, composite, fibra de carbono, EVA y PA11.",
          path: "/",
        })}
      />
      <Story />
      <WhatWeDo />
      <Section name="process" theme="dark" label="El proceso">
        <ProcessSection />
      </Section>
      <Section name="material-lab" theme="light" label="Material Lab">
        <div className="wrap">
          <MaterialLab linkToPage />
        </div>
      </Section>
      <Section name="needs" theme="dark" label="¿Qué necesitas?">
        <NeedsSelector />
      </Section>
      <Section name="pro-zone" theme="light" label="Zona profesional">
        <ProZone />
      </Section>
      <Section name="configurator" theme="dark" label="Configurador">
        <Configurator />
      </Section>
      <Section name="cases" theme="light" label="Casos reales">
        <Cases />
      </Section>
      <Section name="about" theme="dark" label="Sobre nosotros">
        <AboutTimeline />
      </Section>
      <Section name="testimonials" theme="light" label="Testimonios">
        <Testimonials />
      </Section>
      <Section name="training" theme="dark" label="Formación">
        <TrainingTeaser />
      </Section>
      <Section name="franchise" theme="light" label="Franquicias">
        <FranchiseTeaser />
      </Section>
      <FinalCta />
    </>
  );
}
