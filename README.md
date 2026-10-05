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

## Rediseño de la home (v2)

La home es una sola página narrativa: **problema → servicios → recorrido → diagnóstico → IA →
resultados → método → sobre → contacto → FAQ**. Cada sección responde a una pregunta del
visitante y termina en un CTA que preselecciona la necesidad en el formulario.

Movimiento: GSAP + ScrollTrigger + Lenis, solo en cliente y montados de forma perezosa
(`lib/lazy.ts`, `components/motion/ScrollEffects.tsx`). Con `prefers-reduced-motion` no se
oculta ni se fija nada: el contenido ya está en su estado final y Lenis no se inicia.
El recorrido (`Journey`) se fija en escritorio y es una lista vertical en móvil.

Dónde tocar cada cosa:

```
data/home.ts          todo el copy de la home (titulares, servicios, FAQ de la home usa data/faq.ts)
data/results.ts       métricas y casos reales (ver el aviso de la cabecera del archivo)
components/home/      una sección por archivo
components/motion/    Lenis, efectos de scroll por atributos (data-reveal, data-split…), cursor, botón magnético
app/globals.css       tokens (ink / cream / orange), tipografía y animaciones CSS del hero
```

Reglas de contenido: nada inventado. Los resultados salen de `data/results.ts`; para añadir
un caso real basta agregarlo a `cases` y aparece en la home.

## Diagnóstico web gratuito (integrado en la web)

El diagnóstico que antes vivía en `odisas-audit/` ya está **dentro** de esta app:

- **En la home**: sección naranja `#analiza-tu-web` (`components/home/AuditSection.tsx`).
- **Página propia**: `/analiza-tu-web` (SEO, FAQ y esquema `WebApplication`), enlazada desde la cabecera y el pie.
- **Atajos**: el hero, el servicio "Análisis web", el diagnóstico y el CTA final llevan a la herramienta.

Cómo funciona:

```
components/audit/AuditTool.tsx   interfaz: URL → progreso → panel de resultados → captación por email
components/audit/AuditParts.tsx  piezas visuales (radar, anillo de nota, tarjetas, tabla de rendimiento)
lib/audit/engine.ts              reglas de análisis (seguridad, SEO, móvil, conversión). Solo informa de lo medido
lib/audit/safe-fetch.ts          descarga segura: bloquea IPs privadas (SSRF), limita tiempo, tamaño y redirecciones
lib/audit/email.ts               plantilla del informe (voz de equipo)
app/api/audit/analyze            análisis (10 por IP cada 10 min)
app/api/audit/performance        rendimiento con Google PageSpeed Insights
app/api/audit/report             envía el informe al cliente Y avisa al equipo con el lead
data/audit.ts                    textos de /analiza-tu-web (mantenlos alineados con el motor)
```

Funciona sin configurar nada. Para que **no se pierda ningún contacto**, configura un canal de entrega
(las variables están documentadas en `.env.example`): SMTP (Gmail con contraseña de aplicación) o Resend
para enviar el informe, y/o `CONTACT_WEBHOOK_URL` para recibir el lead en tu CRM. Si el email automático no
está disponible, el visitante ve igualmente una confirmación y el aviso llega al equipo; si no hay ningún
canal, se le ofrece pedir el informe por WhatsApp con la web y la nota ya escritas.

`odisas-audit/` (proyecto de Vercel aparte) queda como estaba: ya no hace falta para la web pública y
puedes retirarlo cuando quieras. Si lo mantienes para enviar diagnósticos a posibles clientes, su correo
sigue usando su propia plantilla.

## Hero 3D y efectos de profundidad

- `lib/hero-shader.ts`: un fragment shader (≈4 KB, sin Three.js) que dibuja la marca en 3D sobre un campo
  de puntos que reacciona al cursor. `components/home/HeroGL.tsx` lo monta **solo** con pantalla ≥1024 px,
  puntero fino, sin "reducir movimiento" y sin ahorro de datos; se carga tras el primer pintado, se pausa
  fuera de pantalla y baja la resolución (o se apaga) si el equipo va justo.
- En móvil, tablet y con "reducir movimiento" se usa `public/brand/hero-mark.webp` (15 KB), que se descarga
  solo ahí. Si cambias la marca o el material: `node scripts/generar-poster-hero.mjs` (instrucciones en el archivo).
- `components/motion/PointerEffects.tsx` (foco de cursor con rejilla escondida), `Tilt.tsx` (paneles que se
  inclinan) y `data-iris` / `data-expand` en `ScrollEffects.tsx` (transiciones de máscara solo en los tres
  momentos de conversión: diagnóstico, CTA intermedio y CTA final).

## Diagnóstico web gratuito (proyecto aparte, ya integrado arriba)

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

## Otros proyectos en este repositorio

- [`sara-del-olmo-studio/`](./sara-del-olmo-studio): web inmersiva con scrolltelling de Sara del Olmo Studio (Humanes de Madrid). Proyecto independiente (vanilla JS + esbuild) con su propio `package.json` y README.
