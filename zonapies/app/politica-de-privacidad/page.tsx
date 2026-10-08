import Link from "next/link";
import { LegalBlock, LegalLayout } from "@/components/legal/LegalLayout";
import { company, contact } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Política de privacidad",
  description: "Cómo trata Zona Pies los datos personales de quienes solicitan un presupuesto, se inscriben en formaciones o contactan con el laboratorio.",
  path: "/politica-de-privacidad",
});

export default function PrivacidadPage() {
  return (
    <LegalLayout title="Política de privacidad" updated="octubre de 2026">
      <LegalBlock title="1. Responsable del tratamiento">
        <ul>
          <li>
            <strong>Responsable:</strong> {company.legalName} (CIF {company.taxId})
          </li>
          <li>
            <strong>Dirección:</strong> {company.address.street}, {company.address.postalCode} {company.address.city} ({company.address.region})
          </li>
          <li>
            <strong>Contacto para cuestiones de privacidad:</strong> {contact.email.address}
          </li>
        </ul>
      </LegalBlock>

      <LegalBlock title="2. Qué datos tratamos y para qué">
        <p>Tratamos los datos que nos facilitas voluntariamente en los formularios de la web (nombre, clínica o empresa, email, teléfono, provincia, tipo de profesional, necesidad y mensaje) para:</p>
        <ul>
          <li>Atender tu solicitud de presupuesto, consulta, inscripción en formación o información sobre franquicias.</li>
          <li>Mantener contacto comercial con relación a la solicitud realizada.</li>
        </ul>
        <p>No te pedimos datos de salud de pacientes a través de la web. Te rogamos que no los incluyas en el campo de mensaje.</p>
      </LegalBlock>

      <LegalBlock title="3. Base jurídica">
        <p>
          La base legal es tu consentimiento (art. 6.1.a RGPD), que otorgas al marcar la casilla del formulario, y la aplicación de medidas precontractuales a petición tuya (art. 6.1.b RGPD) cuando solicitas un presupuesto.
        </p>
      </LegalBlock>

      <LegalBlock title="4. Destinatarios">
        <p>
          No cedemos tus datos a terceros salvo obligación legal. Pueden acceder a ellos proveedores que nos prestan servicios técnicos (alojamiento de la web, correo electrónico o herramientas de gestión) con los que existe el correspondiente contrato de encargo de tratamiento.
        </p>
      </LegalBlock>

      <LegalBlock title="5. Conservación">
        <p>Conservaremos tus datos mientras sea necesario para atender tu solicitud y, después, durante los plazos legales de prescripción de posibles responsabilidades.</p>
      </LegalBlock>

      <LegalBlock title="6. Tus derechos">
        <p>
          Puedes ejercer los derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad escribiendo a {contact.email.address}, acreditando tu identidad. Si consideras que no hemos atendido tus derechos, puedes presentar una reclamación ante la Agencia Española de Protección de Datos (<a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">aepd.es</a>).
        </p>
      </LegalBlock>

      <LegalBlock title="7. Cookies y analítica">
        <p>
          La medición de uso de la web (páginas visitadas, clics en llamadas a la acción, profundidad de lectura) solo se activa si aceptas las cookies de analítica. Más información en la <Link href="/politica-de-cookies">política de cookies</Link>.
        </p>
      </LegalBlock>
    </LegalLayout>
  );
}
