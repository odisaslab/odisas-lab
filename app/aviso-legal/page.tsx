import { LegalPage } from "@/components/legal/LegalPage";
import { Pending } from "@/components/legal/Pending";
import { legalEntity, legalIsComplete } from "@/data/legal";
import { site } from "@/data/site";
import { pageMeta } from "@/lib/seo";

export const metadata = {
  ...pageMeta({
    title: "Aviso legal",
    description:
      "Datos identificativos del titular de esta web, condiciones de uso, propiedad intelectual y legislación aplicable.",
    path: "/aviso-legal",
  }),
  robots: legalIsComplete ? { index: true, follow: true } : { index: false, follow: true },
};

export default function AvisoLegalPage() {
  return (
    <LegalPage
      title="Aviso legal"
      path="/aviso-legal"
      intro="Quién está detrás de esta web y en qué condiciones puedes utilizarla."
    >
      <h2>1. Datos identificativos</h2>
      <p>
        En cumplimiento del deber de información recogido en la Ley 34/2002 de Servicios
        de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se facilitan
        los siguientes datos:
      </p>
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
          <strong>Teléfono:</strong> {legalEntity.phoneDisplay || <Pending label="teléfono" value="" />}
        </li>
        <li>
          <strong>Actividad:</strong> {legalEntity.activity}
        </li>
        <li>
          <strong>Sitio web:</strong> {site.url}
        </li>
        <li>
          <strong>Alojamiento:</strong>{" "}
          <Pending label="proveedor de hosting" value={legalEntity.hostingProvider} />
          {legalEntity.hostingCountry ? ` (${legalEntity.hostingCountry})` : null}
        </li>
      </ul>

      <h2>2. Objeto</h2>
      <p>
        Esta web tiene una finalidad informativa y comercial: presentar los servicios de{" "}
        {legalEntity.tradeName} y permitir que quien esté interesado se ponga en contacto.
        No se realizan ventas ni contrataciones directas a través del sitio.
      </p>

      <h2>3. Condiciones de uso</h2>
      <p>
        Al acceder a esta web asumes la condición de usuario y te comprometes a hacer un
        uso lícito de sus contenidos. En particular, no está permitido:
      </p>
      <ul>
        <li>Utilizar la web con fines fraudulentos o para actividades ilícitas.</li>
        <li>
          Introducir código malicioso, intentar acceder a áreas restringidas o alterar el
          funcionamiento del sitio.
        </li>
        <li>
          Utilizar los formularios para enviar contenido publicitario no solicitado o
          información falsa.
        </li>
        <li>
          Extraer de forma automatizada y masiva los contenidos del sitio sin
          autorización.
        </li>
      </ul>

      <h2>4. Propiedad intelectual e industrial</h2>
      <p>
        Los textos, el diseño, la estructura de navegación, el código y los elementos
        gráficos de esta web son titularidad de {legalEntity.tradeName} o se utilizan con
        la autorización correspondiente. Queda prohibida su reproducción, distribución o
        transformación sin consentimiento expreso.
      </p>
      <p>
        Las marcas, nombres comerciales y logotipos de terceros que puedan aparecer
        pertenecen a sus respectivos titulares y se muestran únicamente a título
        informativo o descriptivo.
      </p>

      <h2>5. Responsabilidad</h2>
      <p>
        Los contenidos de esta web son de carácter general y no constituyen asesoramiento
        profesional aplicable a un caso concreto. Cualquier decisión que tomes basándote
        en ellos es de tu responsabilidad.
      </p>
      <p>
        Procuramos que la información esté actualizada y sin errores, pero no podemos
        garantizar la disponibilidad continua del servicio ni la ausencia de fallos
        técnicos ajenos a nuestro control.
      </p>

      <h2>6. Enlaces a terceros</h2>
      <p>
        Esta web puede incluir enlaces a sitios de terceros. No controlamos sus contenidos
        ni sus políticas de privacidad, por lo que no asumimos responsabilidad sobre
        ellos. Te recomendamos revisar sus condiciones antes de facilitarles datos.
      </p>

      <h2>7. Protección de datos</h2>
      <p>
        El tratamiento de datos personales se detalla en la{" "}
        <a href="/politica-de-privacidad">política de privacidad</a> y el uso de cookies
        en la <a href="/politica-de-cookies">política de cookies</a>.
      </p>

      <h2>8. Legislación aplicable</h2>
      <p>
        Estas condiciones se rigen por la legislación española. Para cualquier
        controversia serán competentes los juzgados y tribunales del domicilio del
        titular, salvo que la normativa de consumo establezca otro fuero.
      </p>
    </LegalPage>
  );
}
