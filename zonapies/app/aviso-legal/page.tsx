import Link from "next/link";
import { LegalBlock, LegalLayout } from "@/components/legal/LegalLayout";
import { PendingText } from "@/components/ui/Placeholder";
import { company, contact, site } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Aviso legal",
  description: "Aviso legal y condiciones de uso de la web de Zona Pies.",
  path: "/aviso-legal",
});

export default function AvisoLegalPage() {
  return (
    <LegalLayout title="Aviso legal" updated="octubre de 2026">
      <LegalBlock title="1. Datos identificativos">
        <p>
          En cumplimiento del artículo 10 de la Ley 34/2002, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa de que el titular de este sitio web ({site.url}) es:
        </p>
        <ul>
          <li>
            <strong>Denominación social:</strong> {company.legalName}
          </li>
          <li>
            <strong>CIF:</strong> {company.taxId}
          </li>
          <li>
            <strong>Domicilio social:</strong> {company.address.street}, {company.address.postalCode} {company.address.city} ({company.address.region})
          </li>
          <li>
            <strong>Teléfono:</strong> {contact.phone.display}
          </li>
          <li>
            <strong>Email:</strong> {contact.email.address}
          </li>
          <li>
            <strong>Datos registrales:</strong> <PendingText>inscripción en el Registro Mercantil — pendiente</PendingText>
          </li>
        </ul>
      </LegalBlock>

      <LegalBlock title="2. Objeto">
        <p>
          Este sitio web tiene por objeto dar a conocer la actividad de Zona Pies —diseño y fabricación de ortesis plantares y plantillas a medida para profesionales— y facilitar el contacto, la solicitud de presupuestos y el acceso de los clientes profesionales.
        </p>
      </LegalBlock>

      <LegalBlock title="3. Condiciones de uso">
        <p>
          El acceso y uso de esta web atribuye la condición de usuario e implica la aceptación de estas condiciones. El usuario se compromete a hacer un uso adecuado de los contenidos y a no emplearlos para actividades ilícitas o contrarias a la buena fe.
        </p>
        <p>
          La información de la web, incluidas las comparativas de materiales y las ilustraciones, tiene carácter divulgativo y orientativo. No constituye una prescripción ni una valoración médica: la indicación de cualquier ortesis corresponde siempre al profesional sanitario.
        </p>
      </LegalBlock>

      <LegalBlock title="4. Propiedad intelectual e industrial">
        <p>
          Los textos, diseños, imágenes, ilustraciones, código y demás elementos de este sitio, así como las marcas y signos distintivos, son titularidad de {company.legalName} o de terceros que han autorizado su uso, y están protegidos por la normativa de propiedad intelectual e industrial. Queda prohibida su reproducción, distribución o transformación sin autorización expresa.
        </p>
      </LegalBlock>

      <LegalBlock title="5. Responsabilidad">
        <p>
          {company.legalName} procura que la información sea exacta y esté actualizada, pero no garantiza la ausencia de errores ni la disponibilidad ininterrumpida del servicio. No se responsabiliza de los daños derivados de un uso indebido de la web ni del contenido de sitios de terceros enlazados.
        </p>
      </LegalBlock>

      <LegalBlock title="6. Protección de datos y cookies">
        <p>
          El tratamiento de los datos personales se rige por la{" "}
          <Link href="/politica-de-privacidad">política de privacidad</Link> y el uso de cookies por la <Link href="/politica-de-cookies">política de cookies</Link>.
        </p>
      </LegalBlock>

      <LegalBlock title="7. Legislación y jurisdicción">
        <p>
          Estas condiciones se rigen por la legislación española. Para cualquier controversia, las partes se someten a los juzgados y tribunales que resulten competentes conforme a la normativa aplicable.
        </p>
      </LegalBlock>
    </LegalLayout>
  );
}
