import { CookiePreferencesButton } from "@/components/cookies/CookiePreferencesButton";
import { LegalBlock, LegalLayout } from "@/components/legal/LegalLayout";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Política de cookies",
  description: "Qué cookies y almacenamiento local usa la web de Zona Pies y cómo gestionar tu consentimiento.",
  path: "/politica-de-cookies",
});

export default function CookiesPage() {
  return (
    <LegalLayout title="Política de cookies" updated="octubre de 2026">
      <LegalBlock title="1. Qué usamos">
        <p>
          Esta web usa almacenamiento local del navegador de forma estrictamente necesaria y, solo si lo aceptas, cookies de analítica y de marketing. Nada se carga antes de que decidas, salvo lo imprescindible. Rechazar es tan fácil como aceptar.
        </p>
      </LegalBlock>

      <LegalBlock title="2. Detalle">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
            <caption className="sr-only">Cookies y almacenamiento usados por la web</caption>
            <thead>
              <tr className="border-b border-line-strong">
                <th scope="col" className="hud py-3 pr-4 text-muted">Nombre</th>
                <th scope="col" className="hud py-3 pr-4 text-muted">Tipo</th>
                <th scope="col" className="hud py-3 pr-4 text-muted">Finalidad</th>
                <th scope="col" className="hud py-3 text-muted">Duración</th>
              </tr>
            </thead>
            <tbody className="[&_td]:py-3 [&_td]:pr-4 [&_tr]:border-b [&_tr]:border-line">
              <tr>
                <td>zonapies-consent</td>
                <td>Necesaria (localStorage)</td>
                <td>Recuerda tu decisión sobre cookies.</td>
                <td>12 meses</td>
              </tr>
              <tr>
                <td>zp-scene-cap</td>
                <td>Necesaria (sessionStorage)</td>
                <td>Recuerda el nivel gráfico de la escena 3D si tu dispositivo va justo.</td>
                <td>Sesión</td>
              </tr>
              <tr>
                <td>Google Analytics / Tag Manager</td>
                <td>Analítica (solo con consentimiento)</td>
                <td>Mide el uso de la web de forma agregada para mejorarla.</td>
                <td>Según el proveedor</td>
              </tr>
              <tr>
                <td>Meta Pixel</td>
                <td>Marketing (solo con consentimiento)</td>
                <td>Mide la eficacia de campañas publicitarias.</td>
                <td>Según el proveedor</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>Las herramientas de analítica y marketing solo se cargan si están configuradas en la web y has dado tu consentimiento.</p>
      </LegalBlock>

      <LegalBlock title="3. Cambiar tu decisión">
        <p>Puedes modificar tu consentimiento en cualquier momento:</p>
        <p>
          <CookiePreferencesButton className="btn btn-primary" />
        </p>
        <p>También puedes eliminar el almacenamiento desde la configuración de tu navegador.</p>
      </LegalBlock>
    </LegalLayout>
  );
}
