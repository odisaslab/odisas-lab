import { LegalPage } from "@/components/legal/LegalPage";
import { Pending } from "@/components/legal/Pending";
import { legalEntity, legalIsComplete } from "@/data/legal";
import { pageMeta } from "@/lib/seo";

export const metadata = {
  ...pageMeta({
    title: "Política de privacidad",
    description:
      "Cómo tratamos los datos personales que nos facilitas a través de esta web: finalidad, base legal, conservación y tus derechos.",
    path: "/politica-de-privacidad",
  }),
  robots: legalIsComplete ? { index: true, follow: true } : { index: false, follow: true },
};

export default function PrivacidadPage() {
  return (
    <LegalPage
      title="Política de privacidad"
      path="/politica-de-privacidad"
      intro="Qué hacemos con los datos que nos das, por qué podemos tratarlos y qué puedes exigirnos en cualquier momento."
    >
      <h2>1. Responsable del tratamiento</h2>
      <ul>
        <li>
          <strong>Titular:</strong>{" "}
          <Pending label="nombre y apellidos del titular" value={legalEntity.holder} />
        </li>
        <li>
          <strong>Nombre comercial:</strong> {legalEntity.tradeName}
        </li>
        <li>
          <strong>NIF:</strong> <Pending label="NIF" value={legalEntity.taxId} />
        </li>
        <li>
          <strong>Domicilio:</strong>{" "}
          <Pending label="domicilio fiscal" value={legalEntity.address} />
        </li>
        <li>
          <strong>Email:</strong>{" "}
          {legalEntity.email ? (
            <a href={`mailto:${legalEntity.email}`}>{legalEntity.email}</a>
          ) : (
            <Pending label="email de contacto" value="" />
          )}
        </li>
        <li>
          <strong>Actividad:</strong> {legalEntity.activity}
        </li>
      </ul>

      <h2>2. Qué datos recogemos</h2>
      <p>
        Solo los que nos facilitas voluntariamente. En el formulario de contacto:
        nombre, empresa, email, teléfono, dirección web, el servicio que te interesa, el
        presupuesto aproximado y el mensaje que escribas.
      </p>
      <p>
        Si nos escribes por email, teléfono o WhatsApp, tratamos los datos que incluyas en
        esa comunicación. No recogemos datos de categorías especiales y te pedimos que no
        los incluyas en tus mensajes.
      </p>
      <p>
        Con tu consentimiento, las herramientas de analítica recogen además datos de
        navegación de forma agregada. Lo tienes detallado en la{" "}
        <a href="/politica-de-cookies">política de cookies</a>.
      </p>

      <h2>3. Para qué los usamos y con qué base legal</h2>
      <ul>
        <li>
          <strong>Responder a tu solicitud y enviarte una propuesta.</strong> Base legal:
          tu consentimiento al enviar el formulario, y el interés legítimo en atender una
          consulta comercial que tú has iniciado.
        </li>
        <li>
          <strong>Gestionar la relación contractual</strong> si acabamos trabajando
          juntos. Base legal: ejecución del contrato.
        </li>
        <li>
          <strong>Cumplir obligaciones legales</strong> en materia fiscal y contable. Base
          legal: obligación legal.
        </li>
        <li>
          <strong>Medir el uso de la web y la eficacia de nuestros anuncios.</strong> Base
          legal: tu consentimiento, revocable en cualquier momento.
        </li>
      </ul>
      <p>
        No usamos tus datos para enviarte comunicaciones comerciales no solicitadas ni
        para elaborar perfiles con efectos jurídicos sobre ti.
      </p>

      <h2>4. Cuánto tiempo los conservamos</h2>
      <ul>
        <li>
          <strong>Consultas que no derivan en contrato:</strong> hasta un año desde el
          último contacto, salvo que pidas antes la supresión.
        </li>
        <li>
          <strong>Clientes:</strong> durante la relación y después el plazo legal de
          conservación de documentación fiscal y contable.
        </li>
        <li>
          <strong>Datos de analítica:</strong> según los plazos indicados en la política
          de cookies.
        </li>
      </ul>

      <h2>5. Con quién los compartimos</h2>
      <p>
        No vendemos ni cedemos tus datos. Solo acceden a ellos los proveedores que
        necesitamos para funcionar, y siempre como encargados del tratamiento con
        contrato firmado:
      </p>
      <ul>
        <li>
          <strong>Alojamiento web:</strong>{" "}
          <Pending label="proveedor de hosting" value={legalEntity.hostingProvider} />
        </li>
        <li>
          <strong>Correo electrónico y herramientas de gestión</strong> utilizadas para
          responderte.
        </li>
        <li>
          <strong>Analítica y publicidad</strong> (Google, Meta), únicamente si has dado
          tu consentimiento.
        </li>
      </ul>
      <p>
        Algunos de estos proveedores pueden realizar transferencias internacionales de
        datos. En ese caso se amparan en las decisiones de adecuación de la Comisión
        Europea o en cláusulas contractuales tipo.
      </p>

      <h2>6. Tus derechos</h2>
      <p>
        Puedes ejercer en cualquier momento tus derechos de acceso, rectificación,
        supresión, oposición, limitación del tratamiento y portabilidad, así como retirar
        el consentimiento que hayas dado. Basta con escribirnos a{" "}
        {legalEntity.email ? (
          <a href={`mailto:${legalEntity.email}`}>{legalEntity.email}</a>
        ) : (
          <Pending label="email de contacto" value="" />
        )}{" "}
        indicando qué derecho quieres ejercer. Te responderemos en el plazo máximo de un
        mes.
      </p>
      <p>
        Si consideras que no hemos atendido correctamente tu solicitud, puedes presentar
        una reclamación ante la Agencia Española de Protección de Datos (
        <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">
          aepd.es
        </a>
        ).
      </p>

      <h2>7. Seguridad</h2>
      <p>
        Aplicamos medidas técnicas y organizativas razonables para proteger tus datos:
        conexión cifrada, validación de los formularios en servidor, limitación de envíos
        para frenar el spam y acceso restringido a la información. Ningún sistema es
        infalible, pero trabajamos para que el riesgo sea el mínimo posible.
      </p>

      <h2>8. Cambios en esta política</h2>
      <p>
        Si modificamos esta política, actualizaremos la fecha del encabezado. Si el cambio
        afecta a la finalidad del tratamiento o a la base legal, te lo comunicaremos y, si
        procede, te pediremos de nuevo tu consentimiento.
      </p>
    </LegalPage>
  );
}
