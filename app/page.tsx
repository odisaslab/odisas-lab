import { About } from "@/components/home/About";
import { AiSection } from "@/components/home/AiSection";
import { AuditSection } from "@/components/home/AuditSection";
import { Diagnostic } from "@/components/home/Diagnostic";
import { Faq } from "@/components/home/Faq";
import { FinalCta } from "@/components/home/FinalCta";
import { Hero } from "@/components/home/Hero";
import { Journey } from "@/components/home/Journey";
import { LeadForm } from "@/components/home/LeadForm";
import { Marquee } from "@/components/home/Marquee";
import { Method } from "@/components/home/Method";
import { MidCta } from "@/components/home/MidCta";
import { Problem } from "@/components/home/Problem";
import { Results } from "@/components/home/Results";
import { Services } from "@/components/home/Services";
import { PointerEffects } from "@/components/motion/PointerEffects";
import { ScrollEffects } from "@/components/motion/ScrollEffects";
import { JsonLd } from "@/components/ui/JsonLd";
import { faqs } from "@/data/faq";
import { faqSchema, pageMeta } from "@/lib/seo";

export const metadata = {
  ...pageMeta({
    title: "Odisas Lab · Marketing, SEO y diseño web que trae clientes",
    description:
      "Marketing, tecnología e IA para que tu negocio se vea, crezca y convierta. SEO, Google Ads, Meta Ads y diseño web orientados a conseguir clientes.",
    path: "/",
  }),
  title: { absolute: "Odisas Lab · Marketing, SEO y diseño web que trae clientes" },
};

export default function HomePage() {
  return (
    <>
      <ScrollEffects />
      <PointerEffects />
      <Hero />
      <Marquee />
      <Problem />
      <Services />
      <Journey />
      <Diagnostic />
      <AuditSection />
      <AiSection />
      <Results />
      <Method />
      <About />
      <MidCta />
      <LeadForm />
      <Faq />
      <FinalCta />
      <JsonLd data={faqSchema(faqs)} />
    </>
  );
}
