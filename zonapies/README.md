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

## Estado de los datos (08/10/2026)

El acceso a `zonapies.es` desde el entorno de desarrollo fue **intermitente**: solo se pudo leer la **home**, el `robots.txt` y los sitemaps; después volvió a bloquearse (403) y las 6 páginas interiores y las imágenes no llegaron a descargarse. Lo que sigue distingue lo verificado de lo que no.

### ✅ Verificado contra la web real

| Dato | Valor | Dónde vive |
|---|---|---|
| Teléfonos | 91 606 23 73 · 640 20 37 50 | `data/site.ts` |
| WhatsApp | 34 640 203 750 (enlace `api.whatsapp.com/send?phone=34640203750`) | `data/site.ts` |
| Email | zonapiesfuenlabrada@gmail.com | `data/site.ts` |
| Dirección | Calle Zarzuela, 10, Pol. Ind. Cordel de la Carrera, 28942 Fuenlabrada (Madrid) | `data/site.ts` |
| Acceso de clientes | https://zonapies.azurewebsites.net/ | `data/site.ts` |
| Redes | Instagram @zonapies_ · Facebook · enlace de Google Maps | `data/site.ts` |
| Razón social | ZONAPIES SL | `data/site.ts` |
| Experiencia | «más de tres décadas» | `EXPERIENCE` |
| Valores | Calidad, Precisión 3D, Experiencia técnica, Asesoría profesional, Entrega ágil (textos literales) | `data/pro.ts` |
| FAQs | Las 6 de la home, literales (con PA11 añadido) | `data/faq.ts` |
| Estructura | Nav real: Sobre nosotros · Plantillas y Materiales · Sistemas de Fabricación · Franquiciados · Formación · Contacto · Acceso clientes | `DISENO.md` |
| URLs reales (sitemap) | `/sobre-nosotros`, `/plantillas-ortopedicas-a-medida`, `/sistema-de-fabricacion`, `/franciciados` (sic), `/formacion`, `/contacto` | `next.config.mjs` (301) |

Mensaje de la web real que la nueva respeta: *«Digitaliza tu consulta con plantillas 3D de alta precisión. Escanea el pie, automatiza el diseño y fabrica ortesis plantares a medida sin depender de procesos manuales ni espumas»* → **escanea el profesional en su consulta** (hay un vídeo de «escáner portátil 3D»).

### ⚠️ Por confirmar

| Qué | Por qué |
|---|---|
| **CIF B88280821** | Viene de un fragmento de buscador del aviso legal; la web real solo muestra la razón social |
| **Plazo «≈ 3 días hábiles»** | El documento funcional y el buscador dicen 3; la home dice «unos pocos días hábiles» (`LEAD_TIME`) |
| **Proceso por material** (PA11 → impresión 3D, EVA → fresado en 3 densidades, resina → termoconformado) | Deducido de los **nombres de los vídeos** de la web (`impresora-3D-ortoprotesicos`, `FRESADO-EVA`, `EVA-3-DENSIDADES`, `termoconformado-resina`, `PA11-ELASTICIDAD`); `data/materials.ts` |
| Niveles 1–5 de cada material e «indicaciones» | Comparativa orientativa mía, no datos del catálogo |
| Destino del 301 de `/sistema-de-fabricacion` | Va a `/tecnologia`; encajará mejor en `/plantillas` si esa página trata de sistemas para fabricar plantillas |
| Paleta de marca | La web usa los colores por defecto del tema Astra (azul `#046bd2`); no hay identidad cromática propia visible. Falta ver el **logotipo** |

### 📭 Falta (se ve en pantalla en ámbar: `PLACEHOLDER` / `[…]`)

La **home real no tiene testimonios** (el documento funcional dice que la web los tiene: estarán en alguna página interior, no leída).

| Falta | Archivo |
|---|---|
| Testimonios reales (texto, autor, centro, autorización) | `data/testimonials.ts` → `verified: true` |
| Casos reales con fotos antes/después | `data/cases.ts` → `placeholder: false` |
| Fotos del laboratorio, maquinaria, equipo | `components/ui/Placeholder.tsx`, `data/timeline.ts` |
| Cronología real y visión de futuro | `data/timeline.ts` |
| Formaciones: catálogo, metodología, calendario | `data/training.ts` |
| Franquicias: condiciones, perfil, territorios | `data/franchise.ts` |
| Catálogo de sistemas (¿«Sistema DUO»?) | `data/needs.ts` |
| Textos de «Sobre nosotros», «Plantillas y Materiales», «Sistemas de Fabricación», «Franquiciados», «Formación» y «Contacto» **reales** (páginas interiores sin leer) | varios `data/*` |
| Logotipo vectorial y colores oficiales | `app/globals.css`, `components/ui/Logo.tsx`, `app/icon.tsx`, `app/opengraph-image.tsx` |
| Textos legales revisados por asesoría | `app/aviso-legal`, `app/politica-de-*` |

### Fotografías reales (una orden)

La web actual tiene fotos de producto propias (plantillas PA11, EVA y resina terminadas, shell, sistemas…). No se pudieron descargar. Desde una máquina con acceso a la web:

```bash
npm run assets      # descarga a public/media/ y actualiza data/media.generated.json (1 petición cada 2,5 s)
```

Hasta entonces no se muestra nada (no hay imágenes rotas). Al ejecutarlo aparecen: la foto de cada opción de «¿Qué necesitas?» y la foto real de PA11, EVA y resina en el Material Lab. Los vídeos de la web (`ESCANER-PORTATIL-3D.mp4`, `FRESADO-EVA.mp4`, `termoconformado-resina.mp4`…) están en `zonapies.es/wp-content/uploads/2026/03|04/`; no se han incorporado (peso) pero pueden usarse con póster y carga bajo demanda.

> El `robots.txt` de la web actual desautoriza a los rastreadores genéricos y pide `Crawl-delay: 300`. Las lecturas hechas fueron mínimas y puntuales, a petición expresa del cliente.

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
