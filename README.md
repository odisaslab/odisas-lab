# Odisas Lab · Web corporativa

Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · Framer Motion · Lucide React

## Arrancar el proyecto

```bash
npm install
cp .env.example .env.local   # ya viene con email y teléfono; añade Instagram cuando lo tengas
npm run dev                  # http://localhost:3000
```

Otros comandos:

```bash
npm run typecheck   # TypeScript sin errores
npm run build       # build de producción
```

## Preview rápido sin instalar nada

La carpeta `preview/` tiene versiones estáticas de la home, `/contacto`,
`/servicios/renovacion-web`, `/sobre-odisas-lab` y `/proceso`, solo para revisar el
diseño.
Ábrela con doble clic en el navegador. **No es la fuente de verdad**: el código real es
el de `app/` y `components/`.

## Diagnóstico web gratuito (proyecto aparte)

`odisas-audit/` es una landing independiente ("pega tu URL y recibe un mini-diagnóstico")
con sus propias funciones serverless. No es parte de esta app Next.js: se despliega como
**otro proyecto de Vercel**, importando este mismo repositorio con *Root Directory* =
`odisas-audit`. Configuración, variables de entorno y despliegue están documentados en
`odisas-audit/README.md`.

## Cómo está organizado

```
app/                 rutas, layout, metadata, robots.ts, sitemap.ts
app/contacto/        página de contacto
app/servicios/       índice y plantilla [slug] de los 7 servicios
app/sobre-odisas-lab/ quién está detrás
app/proceso/         metodología ampliada
app/politica-de-privacidad/, app/politica-de-cookies/, app/aviso-legal/
app/manifest.ts, favicon.ico, apple-icon.png, opengraph-image.png
scripts/              preparación del logotipo, imágenes y auditoría de contraste
scripts/brand-source/ originales del logotipo y la foto
AUDITORIA.md          informe de la revisión previa a publicación
odisas-audit/          landing de diagnóstico web gratuito, proyecto Vercel aparte (ver su README)
public/brand/         tu logotipo y tu foto (ver LEEME.txt)
components/cookies/  banner y panel de consentimiento
components/analytics/ carga de GA4, GTM y Meta Pixel tras consentimiento
components/legal/     marco común de las páginas legales
app/api/contacto/    recepción y entrega del formulario
components/layout/   Header, Footer, Logo
components/ui/       Button, Container, Section, SectionTitle, Reveal, JsonLd,
                     Breadcrumbs, Accordion, ServiceIcon
components/sections/ secciones de la home
components/cards/    ServiceCard, ProjectCard
components/forms/    ContactForm
components/visuals/  composición gráfica del hero y maquetas antes/después
data/                servicios, about, legal, FAQ, proceso, datos del sitio
lib/seo.ts           metadata por página y Schema.org
lib/contact.ts       validación del formulario, compartida cliente/servidor
types/               tipos compartidos
```

## Añadir contenido sin tocar componentes

- **Servicio nuevo**: añade un objeto en `data/services.ts` con su contenido de página
  (`h1`, `intro`, `signals`, `work`, `includes`, `faqs`, `related`). Aparece
  automáticamente en la home, el índice de servicios, su propia página, el footer y el
  sitemap. No hay que tocar ningún componente.
- **FAQ**: `data/faq.ts`. Alimenta también el schema `FAQPage`.

## Formulario de contacto

`/contacto` envía a `POST /api/contacto`. La ruta sanitiza, valida, descarta bots por
campo trampa y limita a 5 envíos por IP cada 10 minutos.

Para que los mensajes te lleguen, configura **una** de estas dos opciones en `.env.local`:

```bash
# Opción A · webhook (Zapier, Make, n8n o tu CRM). La más rápida de montar.
CONTACT_WEBHOOK_URL=https://hooks.zapier.com/...

# Opción B · email con Resend. Requiere dominio verificado.
RESEND_API_KEY=re_...
CONTACT_TO_EMAIL=tu@email.com
CONTACT_FROM_EMAIL=web@odisaslab.com
```

Sin ninguna de las dos, el formulario no finge que ha enviado: avisa al usuario, le
ofrece email, teléfono y WhatsApp, y la solicitud queda registrada en el log del
servidor para no perder el contacto.

## Cookies y analítica

Ningún script de terceros se carga hasta que el usuario acepta su categoría. El banner
ofrece aceptar todas, rechazar todas o configurar por categoría, con la misma jerarquía
visual para aceptar y rechazar. La decisión se guarda 12 meses en `localStorage` y se
puede cambiar desde "Configurar cookies" en el pie.

También se envía Google Consent Mode con todo denegado por defecto, por si más adelante
cargas etiquetas a través de Tag Manager.

Para activar la medición, rellena en `.env.local` los IDs reales:

```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX      # o
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX      # si hay GTM, se usa GTM y se ignora GA
NEXT_PUBLIC_META_PIXEL_ID=
```

Si un ID está vacío, ese script simplemente no existe en la web.

## Textos legales

Las tres páginas legales se generan desde `data/legal.ts`. Faltan datos que solo tú
tienes: nombre completo del titular, NIF, domicilio fiscal y proveedor de hosting.

Mientras falten, aparecen en la web marcados en naranja como `[COMPLETAR: ...]`, las
páginas se sirven con `noindex` y no entran en el sitemap. Es a propósito: preferimos que
se vea el hueco antes que inventar un NIF.

Los textos siguen la estructura habitual del RGPD y la LSSI-CE, pero no son un dictamen
jurídico. Conviene que los revise alguien con criterio legal antes de publicar.

## Identidad e imágenes

Iconos e imagen de compartición ya generados:

```
app/favicon.ico          16 / 32 / 48 px
app/apple-icon.png       180 x 180
app/opengraph-image.png  1200 x 630 (lo que se ve al compartir el enlace)
app/twitter-image.png    1200 x 630
public/icon-192.png      icono del manifest
public/icon-512.png      icono del manifest
```

Para regenerarlas después de cambiar la identidad o los textos:

```bash
pip install Pillow
python3 scripts/generar-imagenes.py
```

El script busca `SpaceGrotesk-Bold.ttf` e `Inter-Regular.ttf` en `scripts/fonts/`.
Si no están, usa la alternativa más parecida del sistema y avisa por consola. Las
imágenes del repositorio se generaron con Bricolage Grotesque como sustituto, así que
si quieres fidelidad exacta de marca, descarga esas dos fuentes y vuelve a ejecutarlo.

### Logotipo

Ya están integrados. Los assets viven en `public/brand/` y se generan desde los
originales con:

```bash
python3 scripts/preparar-logo.py    # logotipo, símbolo, favicon e iconos
python3 scripts/generar-imagenes.py # imagen de compartición
```

Los originales están en `scripts/brand-source/`. Detalles y decisiones en
`public/brand/LEEME.txt`.

**Pendiente:** el logotipo viene de un JPG con fondo blanco, así que la
transparencia se ha reconstruido por software. Si consigues el SVG original,
sustitúyelo y cambia la ruta en `data/site.ts`.

## Reglas de contenido

- No se inventan métricas, clientes ni testimonios. Si no hay dato real, se usa un
  resultado cualitativo.
- Las imágenes que faltan se muestran como placeholder identificado, nunca como stock.
- Los IDs de analítica se dejan vacíos hasta tener los reales.

## Sistema de diseño

Los tokens viven en `app/globals.css` dentro de `@theme`. Cambiar un color o un tamaño
ahí lo cambia en toda la web.

| Token | Valor | Uso |
| --- | --- | --- |
| `--color-primary` | `#FF6B00` | rellenos, iconos, barras, reglas |
| `--color-primary-ink` | `#BA4E00` | texto naranja sobre fondo claro |
| `--color-dark` | `#171717` | fondos oscuros y texto sobre naranja |
| `--color-text` | `#222222` | texto corrido |
| `--color-gray` | `#6B6B6B` | texto secundario |
| `--color-light` | `#F5F5F5` | fondos de sección |

Tipografía: Space Grotesk (titulares) e Inter (texto), cargadas con `next/font`.

**Importante sobre el naranja:** `#FF6B00` no alcanza el contraste mínimo de WCAG AA
como texto sobre blanco (2.86:1) ni con texto blanco encima. Por eso hay dos tokens: el
naranja puro para rellenos e iconos, y `--color-primary-ink` para texto naranja sobre
fondo claro. El texto que va encima del naranja es antracita, no blanco. Está explicado
en detalle en `AUDITORIA.md`.

Cada vez que cambies un color, comprueba que sigue cumpliendo:

```bash
python3 scripts/auditoria-contraste.py
```
