import { LegalPage } from "@/components/legal/LegalPage";
import { CookiePreferencesButton } from "@/components/cookies/CookiePreferencesButton";
import { browserGuides, cookieTable, legalEntity, legalIsComplete } from "@/data/legal";
import { pageMeta } from "@/lib/seo";

export const metadata = {
  ...pageMeta({
    title: "Política de cookies",
    description:
      "Qué cookies usa esta web, para qué sirven, cuánto duran y cómo aceptarlas, rechazarlas o cambiar tu decisión.",
    path: "/politica-de-cookies",
  }),
  robots: legalIsComplete ? { index: true, follow: true } : { index: false, follow: true },
};

export default function CookiesPage() {
  return (
    <LegalPage
      title="Política de cookies"
      path="/politica-de-cookies"
      intro="Qué se instala en tu navegador, para qué, cuánto dura y cómo cambiar tu decisión en un clic."
    >
      <h2>1. Qué es una cookie</h2>
      <p>
        Una cookie es un pequeño archivo que una web guarda en tu navegador. Sirve para
        recordar información entre páginas o entre visitas: desde una preferencia tan
        simple como tu decisión sobre estas mismas cookies, hasta datos de navegación
        usados para medir audiencias.
      </p>

      <h2>2. Cómo funcionan en esta web</h2>
      <p>
        Al entrar por primera vez verás un aviso con tres opciones: aceptar todas,
        rechazar todas o configurar por categorías. Hasta que decidas,{" "}
        <strong>no se carga ninguna cookie de analítica ni de marketing</strong>. Rechazar
        cuesta exactamente lo mismo que aceptar: un clic.
      </p>
      <p>
        Tu decisión se guarda 12 meses. Pasado ese plazo volveremos a preguntarte, y si
        cambiamos las herramientas que usamos, también.
      </p>

      <h2>3. Cookies que utilizamos</h2>
      {cookieTable.map((group) => (
        <div key={group.category}>
          <h3>
            {group.category}
            {group.always ? " · siempre activas" : " · requieren tu consentimiento"}
          </h3>
          <table>
            <thead>
              <tr>
                <th scope="col">Cookie</th>
                <th scope="col">Proveedor</th>
                <th scope="col">Finalidad</th>
                <th scope="col">Duración</th>
              </tr>
            </thead>
            <tbody>
              {group.cookies.map((cookie) => (
                <tr key={cookie.name}>
                  <td>
                    <strong>{cookie.name}</strong>
                  </td>
                  <td>{cookie.provider}</td>
                  <td>{cookie.purpose}</td>
                  <td>{cookie.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      <p>
        Las cookies de analítica y marketing solo se instalan si has dado tu
        consentimiento para su categoría. Si no las has aceptado, esos servicios no se
        cargan en absoluto.
      </p>

      <h2>4. Cambiar tu decisión</h2>
      <p>
        Puedes revisar o modificar tu elección cuando quieras desde este botón. También
        está disponible de forma permanente en el pie de la web.
      </p>
      <p>
        <CookiePreferencesButton />
      </p>

      <h2>5. Desactivarlas desde el navegador</h2>
      <p>
        Además, tu navegador te permite bloquear o eliminar cookies de cualquier web. Ten
        en cuenta que bloquear todas puede afectar al funcionamiento de algunos sitios:
      </p>
      <ul>
        {browserGuides.map((guide) => (
          <li key={guide.name}>
            <a href={guide.url} target="_blank" rel="noopener noreferrer">
              {guide.name}
            </a>
          </li>
        ))}
      </ul>

      <h2>6. Tratamiento de datos y contacto</h2>
      <p>
        El uso de cookies de analítica y marketing implica un tratamiento de datos
        personales que se explica en detalle en nuestra{" "}
        <a href="/politica-de-privacidad">política de privacidad</a>. Si tienes dudas,
        escríbenos a{" "}
        {legalEntity.email ? (
          <a href={`mailto:${legalEntity.email}`}>{legalEntity.email}</a>
        ) : null}
        .
      </p>
    </LegalPage>
  );
}
