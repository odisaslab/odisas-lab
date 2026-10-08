import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { FinalCta } from "@/components/sections/FinalCta";
import { NeedsSelector } from "@/components/sections/NeedsSelector";
import { ProZone } from "@/components/sections/ProZone";
import { Testimonials } from "@/components/sections/Testimonials";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Lock } from "@/components/ui/Icons";
import { JsonLd } from "@/components/ui/JsonLd";
import { Section } from "@/components/ui/Section";
import { breadcrumbJsonLd, pageMetadata, serviceJsonLd } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Zona profesional: laboratorio de plantillas para podólogos",
  description:
    "Tu laboratorio, a un click. Fabricación especializada de ortesis plantares para podólogos y clínicas: precisión, materiales, soporte, rapidez y envíos a toda España.",
  path: "/profesionales",
});

export default function ProfesionalesPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Inicio", path: "/" }, { name: "Profesionales", path: "/profesionales" }])} />
      <JsonLd
        data={serviceJsonLd({
          name: "Laboratorio de plantillas para podólogos y clínicas",
          description: "Fabricación especializada de ortesis plantares a medida para profesionales sanitarios, con soporte y envíos nacionales.",
          path: "/profesionales",
        })}
      />

      <Section name="pro-zone" theme="light" className="!pt-36 md:!pt-44" label="Zona profesional">
        <ProZone headingAs="h1" />
      </Section>

      <Section name="needs" theme="dark" label="¿Qué necesitas?">
        <NeedsSelector context="home" />
      </Section>

      <Section name="pro-access" theme="light" label="Acceso profesionales" className="!py-20 md:!py-28">
        <div className="wrap">
          <div className="grid items-center gap-10 rounded-3xl border border-line-strong p-8 md:p-14 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Reveal>
                <p className="t-eyebrow">Ya trabajas con nosotros</p>
              </Reveal>
              <SplitHeading as="h2" className="t-h2 mt-6" text={"Tu área de *cliente*."} />
              <Reveal delay={150}>
                <p className="t-lead mt-5 max-w-[34rem]">El acceso profesional forma parte de la web: entra desde aquí o desde el menú, en cualquier momento.</p>
              </Reveal>
            </div>
            <Reveal delay={200} className="flex flex-wrap gap-3 lg:col-span-5 lg:justify-end">
              <Link href="/acceso-profesional" data-pro data-cta="pro-page-access" className="btn btn-primary btn-lg">
                <Lock className="size-4" /> Acceso profesionales
              </Link>
            </Reveal>
          </div>
        </div>
      </Section>

      <Section name="testimonials" theme="dark" label="Testimonios">
        <Testimonials />
      </Section>

      <Section name="pro-cross" theme="light" label="Más para profesionales" className="!py-20 md:!py-28">
        <div className="wrap grid gap-4 md:grid-cols-2">
          {[
            { href: "/formacion", title: "Formación", body: "Cursos, recursos y próximas formaciones.", cta: "Ver formación" },
            { href: "/franquicias", title: "Franquicias", body: "Lleva Zona Pies a tu mercado.", cta: "Quiero información" },
          ].map((item, i) => (
            <Reveal key={item.href} delay={i * 100}>
              <Link href={item.href} data-cta={`pro-cross-${item.title.toLowerCase()}`} className="group flex h-full flex-col justify-between gap-12 rounded-3xl border border-line-strong p-8 transition-colors duration-500 hover:bg-surface-2 md:p-10">
                <div>
                  <h2 className="t-h2 !text-[clamp(1.75rem,1rem+2vw,3rem)]">{item.title}</h2>
                  <p className="t-body mt-3">{item.body}</p>
                </div>
                <span className="link-arrow !min-h-0">
                  {item.cta} <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
        <div className="wrap mt-10">
          <Button href="/contacto" variant="ghost" size="lg" cta="pro-contact">
            Hablar con un especialista
          </Button>
        </div>
      </Section>

      <FinalCta scene={false} title={"Tu laboratorio, *a un click*."} lead="Cuéntanos tu consulta y empieza a trabajar con Zona Pies." prefillNeed="fabricacion" />
    </>
  );
}
