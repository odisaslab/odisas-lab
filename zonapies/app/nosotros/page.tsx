import { FinalCta } from "@/components/sections/FinalCta";
import { AboutTimeline } from "@/components/sections/AboutTimeline";
import { Testimonials } from "@/components/sections/Testimonials";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { JsonLd } from "@/components/ui/JsonLd";
import { PlaceholderBox } from "@/components/ui/Placeholder";
import { Section } from "@/components/ui/Section";
import { galleryNeeds } from "@/data/timeline";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Sobre nosotros: más de 30 años fabricando plantillas a medida",
  description:
    "Zona Pies: experiencia, evolución y tecnología. Un laboratorio podológico que ha pasado de los procesos manuales al escaneo 3D, el diseño digital y la fabricación avanzada.",
  path: "/nosotros",
});

export default function NosotrosPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Inicio", path: "/" }, { name: "Nosotros", path: "/nosotros" }])} />

      <Section name="about" theme="dark" className="!pt-36 md:!pt-44" label="Sobre nosotros">
        <AboutTimeline headingAs="h1" />
      </Section>

      <Section name="about-gallery" theme="light" label="Laboratorio, equipo y maquinaria">
        <div className="wrap">
          <Reveal>
            <p className="t-eyebrow">El laboratorio</p>
          </Reveal>
          <SplitHeading as="h2" className="t-h2 mt-6 max-w-[16ch]" text={"Las personas y las máquinas."} />
          <Reveal delay={150}>
            <p className="t-lead mt-6 max-w-[36rem]">Fotografías del laboratorio, la maquinaria, los procesos y el equipo. Pendientes de proporcionar por Zona Pies.</p>
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {galleryNeeds.map((label, index) => (
              <Reveal key={label} delay={index * 90}>
                <PlaceholderBox label={`Foto · ${label}`} ratio={index % 2 === 0 ? "4 / 5" : "1 / 1"} />
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <Section name="testimonials" theme="dark" label="Testimonios">
        <Testimonials />
      </Section>

      <FinalCta scene={false} title={"Trabajemos *juntos*."} lead="Cuéntanos tu consulta y te explicamos cómo trabajamos con podólogos y clínicas." />
    </>
  );
}
