import { About } from "@/components/sections/About";
import { AiSection } from "@/components/sections/AiSection";
import { Cta } from "@/components/sections/Cta";
import { Faq } from "@/components/sections/Faq";
import { Hero } from "@/components/sections/Hero";
import { Methodology } from "@/components/sections/Methodology";
import { Services } from "@/components/sections/Services";
import { TrustBar } from "@/components/sections/TrustBar";
import { ValueProp } from "@/components/sections/ValueProp";
import { WhyUs } from "@/components/sections/WhyUs";
import { JsonLd } from "@/components/ui/JsonLd";
import { faqs } from "@/data/faq";
import { faqSchema, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Agencia de marketing digital · SEO, Google Ads y diseño web",
  description:
    "Odisas Lab diseña estrategias digitales que combinan marketing, tecnología e inteligencia artificial para conseguir más visibilidad y más clientes.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <ValueProp />
      <Services />
      <AiSection />
      <Methodology />
      <About />
      <WhyUs />
      <Faq />
      <Cta />
      <JsonLd data={faqSchema(faqs)} />
    </>
  );
}
