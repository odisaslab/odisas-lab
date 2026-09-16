# Odisas Lab · Diagnóstico web gratuito

Landing donde el cliente pega la URL de su web y recibe al momento un mini-dashboard
real (nota, amenazas y errores) y puede solicitar el informe completo.

## Qué analiza (datos reales, sin inventar)
- **Seguridad (amenazas):** HTTPS, redirección HTTP→HTTPS, HSTS, contenido mixto,
  protección clickjacking, CSP, X-Content-Type-Options, versiones de software expuestas.
- **SEO:** title, meta description (incluye textos por defecto del CMS), H1, noindex,
  canonical, Schema.org/JSON-LD, Open Graph, robots.txt y sitemap.xml.
- **Móvil y accesibilidad:** viewport, zoom bloqueado, atributo lang, imágenes sin alt,
  campos sin etiqueta, tiempo de respuesta del servidor, peso del HTML, nº de scripts.
- **Conversión:** teléfono clicable, WhatsApp, email, formulario de contacto.
- **Rendimiento:** Google PageSpeed Insights (Lighthouse móvil: LCP, CLS, TBT, FCP, Speed Index).
  Si Google no responde se muestra "No disponible" con el motivo y no cuenta en la nota.

Nota: cada categoría parte de 100 y resta por problema (crítico 30, alto 15, medio 8, bajo 3).
La nota global es la media de las categorías realmente medidas.

## Email personalizado a la empresa
Debajo del dashboard, la empresa escribe su correo (el nombre se detecta solo y se puede corregir),
acepta la casilla de consentimiento y pulsa "Enviar diagnóstico". Recibe al momento un email de Odisas Lab:
- saludo con el nombre de la empresa y el dominio analizado;
- nota general y por categorías;
- los problemas más importantes con "Por qué importa" y "Qué haríamos";
- lo que ya hacen bien;
- los servicios de Odisas Lab relacionados con sus puntos débiles;
- botón para agendar una llamada de 15 minutos, más teléfono y respuesta directa.

Odisas Lab recibe una copia oculta (CCO) de cada email para hacer el seguimiento.
El email solo puede contener datos firmados por el servidor (nadie puede cambiar el texto),
y hay límites de envío por IP y por análisis para evitar abusos.

## Publicar en Vercel (gratis)
1. Sube esta carpeta a un repositorio de GitHub.
2. En vercel.com → *Add New Project* → importa el repositorio → *Deploy*.
3. En *Settings → Environment Variables* añade:

| Variable | Obligatoria | Para qué |
|---|---|---|
| `AUDIT_SECRET` | Sí | Texto largo y aleatorio (p. ej. 40 caracteres). Firma los datos del email. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Opción A | Enviar desde Gmail: `smtp.gmail.com`, `465`, `Odisaslab@gmail.com` y una *contraseña de aplicación* (Cuenta de Google → Seguridad → Verificación en 2 pasos → Contraseñas de aplicaciones). |
| `RESEND_API_KEY`, `MAIL_FROM` | Opción B | Resend.com con dominio propio verificado, p. ej. `MAIL_FROM=Odisas Lab <hola@odisaslab.com>`. Mejor entregabilidad para muchos envíos. |
| `MEETING_URL` | Recomendada | Enlace de Calendly o Google Calendar para el botón "Agendar una llamada". Sin él, el botón abre un email de respuesta. |
| `PAGESPEED_API_KEY` | Recomendada | Clave gratuita de Google PageSpeed Insights API. |
| `SENDER_NAME` | No | Firma del email (por defecto "Alejandro"). |
| `REPLY_TO_EMAIL`, `CONTACT_PHONE` | No | Por defecto Odisaslab@gmail.com y 616 88 00 63. |
| `INTERNAL_COPY_EMAIL` | No | Dónde recibir la copia de cada envío (por defecto el de respuesta). |
| `PUBLIC_BASE_URL` | No | URL pública de la web, para el logo del email si usas dominio propio. |

4. Vuelve a desplegar (*Deployments → Redeploy*).

Gmail permite unos 500 envíos al día; si el volumen crece, pasa a Resend con dominio propio.

## Probar en local
```
npm install
npm run dev      # http://localhost:3000  (Node 18+)
```
Sin SMTP ni Resend configurados, los emails no se envían: se guardan en la carpeta `outbox/`
para que puedas abrirlos y revisar cómo quedan.

## Estructura
```
public/index.html            Landing + dashboard + formulario de email
public/logo-icon.png         Icono del logo
api/analyze.js               Análisis de la página (seguridad, SEO, móvil, conversión)
api/performance.js           Rendimiento vía Google PageSpeed Insights
api/send-report.js           Envío del email personalizado a la empresa
api/_lib/audit.js            Reglas de análisis, impacto de negocio y puntuación
api/_lib/email-template.js   Plantilla del email (HTML + texto)
api/_lib/mailer.js           Envío por SMTP o Resend
api/_lib/token.js            Firma de los resultados
api/_lib/safe-fetch.js       Descarga segura (bloquea IPs internas, límites de tiempo y tamaño)
dev-server.js                Servidor local
```
