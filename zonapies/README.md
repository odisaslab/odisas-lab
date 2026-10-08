# Zona Pies · Web

Rediseño de la web de **Zona Pies**, laboratorio de ortesis plantares: «Ingeniería digital aplicada al movimiento».

Next.js 15 (App Router) · TypeScript estricto · Tailwind CSS 4 · Three.js · Lenis. Sin GSAP ni Framer Motion (ver `DISENO.md` §8).

> Esta app vive en `/zonapies` y es **independiente** del sitio raíz del repositorio (Odisas Lab). Tiene su propio `package.json`. Para desplegarla en Vercel, crear un proyecto con *Root Directory* = `zonapies`.

## Arrancar

```bash
cd zonapies
npm install
cp .env.example .env.local   # opcional: ver variables más abajo
npm run dev                  # http://localhost:3100
npm run typecheck
npm run build && npm start
```

Para probar niveles de la escena 3D: `?scene=full`, `?scene=lite` o `?scene=none` en cualquier URL (fuerza el nivel y desactiva el monitor de FPS).

## ⚠️ Lo primero que hay que saber

**No se pudo leer `zonapies.es`**: el proxy del entorno de desarrollo bloqueó el dominio. El contenido se ha construido a partir del *documento funcional*, del briefing y de lo que devuelven los buscadores sobre la web (fragmentos de sus propias páginas y directorios mercantiles). **Todo lo obtenido por búsqueda está sin verificar.** Detalle en `DISENO.md` §1.

### Datos reales localizados (CONFIRMAR antes de publicar)

| Dato | Valor usado | Dónde se cambia |
|---|---|---|
| Razón social / CIF | ZONAPIES SL · B88280821 | `data/site.ts` (`company`) |
| Domicilio | Calle Zarzuela, 10 · 28942 Fuenlabrada (Madrid) | `data/site.ts` |
| Teléfono | 91 606 23 73 | `NEXT_PUBLIC_PHONE(_DISPLAY)` |
| WhatsApp | 640 203 750 (móvil de un directorio; **¿es el WhatsApp de empresa?**) | `NEXT_PUBLIC_WHATSAPP` |
| Email | zonapiesfuenlabrada@gmail.com (otro directorio cita otro) | `NEXT_PUBLIC_CONTACT_EMAIL` |
| Instagram | @zonapies_ | `NEXT_PUBLIC_INSTAGRAM_URL` |
| Experiencia | «más de 30 años» (otras fuentes dicen 40 y 50) | `EXPERIENCE` en `data/site.ts` |
| Plazo | ≈ 3 días hábiles (consta en la web actual) | `LEAD_TIME` en `data/site.ts` |

### Contenido que falta (marcado en pantalla en ámbar: `PLACEHOLDER` / `[…]`)

Cada hueco se ve en la propia web, así que no puede pasar a producción sin que nadie lo note. Al sustituirlo por el dato real, la marca desaparece.

| Falta | Archivo |
|---|---|
| **Testimonios reales** (la web actual ya los tiene: copiar texto literal, autor y centro, con autorización) | `data/testimonials.ts` → `verified: true` |
| **Casos reales** con fotos antes/después | `data/cases.ts` → `placeholder: false` |
| Fotografías del laboratorio, maquinaria, equipo, vídeo de fabricación | `components/ui/Placeholder.tsx` (`PlaceholderBox`), `data/timeline.ts` |
| Cronología real (años, hitos) y visión de futuro | `data/timeline.ts` |
| Formaciones: catálogo, metodología, calendario, recursos | `data/training.ts` |
| Franquicias: condiciones, perfil, territorios | `data/franchise.ts` |
| Catálogo de sistemas para «fabricar mis propias plantillas» | `data/needs.ts` |
| **Validación técnica** de los niveles de cada material y de sus indicaciones | `data/materials.ts` → `validated: true` |
| Validación de los textos de tecnología (no constan equipos ni software) | `data/tech.ts` |
| URL del **acceso de clientes** actual (en el buscador aparece un login en `zonapiesweb.azurewebsites.net`: confirmar) | `NEXT_PUBLIC_PORTAL_URL` |
| **Logotipo y colores oficiales** (paleta y marca son provisionales) | `app/globals.css` (`--color-brand`, `--color-signal`), `components/ui/Logo.tsx`, `app/icon.tsx`, `app/opengraph-image.tsx` |
| Textos legales revisados por asesoría (datos registrales) | `app/aviso-legal`, `app/politica-de-*` |
| Resto de **URLs antiguas** para las redirecciones 301 | `next.config.mjs` (`redirects()`) |

Ya redirigidas (localizadas por búsqueda): `/quienes-somos` → `/nosotros`, `/productos` → `/plantillas`, `/condiciones-de-uso` → `/aviso-legal`.

## Estructura

```
app/                      Rutas: / tecnologia proceso plantillas materiales profesionales nosotros
                          formacion franquicias contacto acceso-profesional + legales + api/presupuesto
components/
  scene/                  Escena 3D: shape (geometría), timeline (la historia), engine (Three.js),
                          ScanScene (montaje perezoso + degradación), ScanFallback (SVG), textures, policy
  home/Story.tsx          Recorrido de scroll de la home (portada + 7 fases)
  sections/               Material Lab, Proceso, ¿Qué necesitas?, Zona Profesional, Configurador, Casos…
  visuals/                Esquemas técnicos SVG, comparador antes/después, macro de material
  forms/                  Formulario de presupuesto, diálogo global, precarga por URL
  motion/                 Kit propio: Reveal, SplitHeading, Magnetic, Counter, SmoothScroll
  layout/ cookies/ analytics/
data/                     Todo el contenido, separado del diseño
lib/                      analytics, consent, seo, quote (validación), mail, delivery, rate-limit
```

## La escena 3D

Una sola escena **procedural** (0 KB de modelos) que cuenta `PIE → DATOS → DISEÑO → MATERIAL → FABRICACIÓN → ORTESIS`. Es una función pura del «tiempo de historia» `T` (0–7) definida en `components/scene/timeline.ts`; la leen la escena 3D y el fallback SVG, así que nunca se desincronizan.

- **Geometría** (`shape.ts`): pie y plantilla comparten topología (malla polar), de modo que el pie *se transforma* en plantilla interpolando vértice a vértice (los dedos se pliegan al contorno). Es una representación **ilustrativa**, no anatómica.
- **Materiales** (`textures.ts`, `materials3d.ts`): texturas generadas en canvas (sarga de carbono, poros de EVA, grano de PA11…), sin archivos.
- **Rendimiento**: Three.js se carga con `import()` dinámico solo cuando la escena está cerca de pantalla; se pausa fuera de pantalla y con la pestaña oculta; tres niveles (`full` / `lite` / `none`) según dispositivo; un monitor de FPS degrada solo `full → lite → SVG` si el equipo va justo.
- **Fallback**: la ilustración SVG es también el render del servidor (el LCP no espera a WebGL) y se usa con `prefers-reduced-motion`, sin WebGL o con ahorro de datos.

### Sustituir el modelo por uno real

La geometría está aislada en `shape.ts` y los materiales en `materials3d.ts`. Para usar un `.glb` real: cargarlo con `GLTFLoader` dentro de `engine.ts` en lugar de `buildShapeModel`, comprimirlo (Draco/Meshopt, objetivo < 1,5 MB) y mantener el SVG como respaldo. El morph pie→plantilla requiere que ambos modelos compartan topología; si no, se puede sustituir por un fundido.

## Conversión y medición

Un objetivo: **Solicitar presupuesto**. CTA persistente (menú, hero, fases, materiales, zona profesional, footer, barra móvil), diálogo de presupuesto sin salir de la página (mejora progresiva: sin JS lleva a `/contacto#presupuesto`), WhatsApp flotante con mensaje predefinido, formulario de 8 campos con validación accesible.

Eventos (solo con consentimiento de analítica; `dataLayer` para GTM o `gtag` para GA4): `cta_click` (con `cta_id` y sección → conversión por CTA), `quote_request`, `quote_form_start/submit/error`, `whatsapp_click`, `phone_click`, `email_click`, `pro_access_click`, `material_view`, `scene_phase`, `scene_interact`, `selector_choice`, `configurator_step/complete`, `scroll_depth` (25/50/75/100). Cualquier elemento con `data-cta="id"` se mide solo.

### Recepción de solicitudes

`/api/presupuesto` valida en servidor, descarta bots con *honeypot*, limita a 5 envíos / IP / 10 min y entrega por **webhook** (`QUOTE_WEBHOOK_URL`) o **email** (SMTP o Resend, `QUOTE_TO_EMAIL`). Sin canal configurado responde `503` y el formulario ofrece WhatsApp / teléfono: nunca finge un envío correcto. En desarrollo, `MAIL_DEV_OUTBOX=./.mail-outbox` guarda los correos en disco.

## Verificado

Comprobado con la build de producción y Playwright (Chromium, WebGL por software):

- `tsc` y `next build` sin errores; 23 rutas estáticas; home 145 kB de JS inicial (Three.js va en un chunk aparte).
- axe-core (WCAG 2.2 AA + buenas prácticas): **0 violaciones** en 12 páginas (escritorio).
- Sin desbordes horizontales a 390 px y 1440 px; un solo `h1` por página; sin errores de consola.
- Formulario: validación con foco en el primer error, precarga por URL, entrega, honeypot, rate-limit.
- Diálogo y menú móvil: foco atrapado, `Escape` cierra, el foco vuelve al disparador.
- `prefers-reduced-motion`: sin fijado de scroll, fases como bloques de lectura.
- Medición: 0 eventos sin consentimiento; con él, todos los de la lista anterior.

**No se ha podido medir** Lighthouse/Core Web Vitals sobre hardware real ni probar en dispositivos móviles físicos. Conviene hacerlo antes de publicar.
