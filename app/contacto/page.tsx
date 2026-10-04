import { LeadForm } from "@/components/home/LeadForm";
import { JsonLd } from "@/components/ui/JsonLd";
import { site } from "@/data/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Contacto",
  description:
    "Cuéntanos qué quieres mejorar en tu presencia digital. Analizamos tu caso y te respondemos en menos de 24 horas laborables.",
  path: "/contacto",
});

export default function ContactoPage() {
  return (
    <>
      <div className="tone-dark -mt-[4.5rem] pt-[4.5rem]">
        <LeadForm titleAs="h1" />
      </div>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Contacto · Odisas Lab",
          url: `${site.url}/contacto`,
          isPartOf: { "@id": `${site.url}#website` },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Inicio", item: site.url },
            { "@type": "ListItem", position: 2, name: "Contacto", item: `${site.url}/contacto` },
          ],
        }}
      />
    </>
  );
}
