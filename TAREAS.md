# Odisas Lab · Plan de trabajo y seguimiento

Documento de control. Se actualiza al cerrar cada tarea.

**Estado global:** Fase 1 y 2 completadas · Fase 3 casi cerrada (solo queda el blog y verificar el build)
**Última actualización:** 10/09/2026

---

## FASE 1 · Núcleo — COMPLETADA

Lo imprescindible para que la web exista, se entienda y convierta.

### Setup y arquitectura
- [x] Proyecto Next.js 15 con App Router y TypeScript estricto
- [x] Tailwind CSS 4, PostCSS y alias `@/*`
- [x] `.env.example` con contacto y analítica (sin IDs ficticios)
- [x] `.gitignore` y scripts `dev` / `build` / `typecheck`
- [x] Estructura de carpetas: `app`, `components`, `data`, `lib`, `types`

### Design system
- [x] Tokens de color en `@theme` (#FF6B00 · #171717 · #222 · #6B6B6B · #F5F5F5)
- [x] Tipografía Space Grotesk + Inter con `next/font`
- [x] Escala tipográfica fluida (display, h2, h3, lead)
- [x] Radios, sombras, contenedor de 1200 px y ritmo vertical
- [x] Estilos de foco visible, selección y `prefers-reduced-motion`

### Componentes base
- [x] `Button` con 5 variantes, 2 tamaños y flecha animada en hover
- [x] `Container`, `Section` (blanco / claro / oscuro), `SectionTitle`
- [x] `Reveal` para scroll reveal, con respeto a movimiento reducido
- [x] `JsonLd` para datos estructurados
- [x] `ServiceCard` y `ProjectCard`

### Header y Footer
- [x] Header sticky con logo, navegación y botón Hablemos en naranja
- [x] Menú móvil a pantalla completa: bloqueo de scroll, cierre con Escape, `aria-expanded`
- [x] Estado activo de navegación según la ruta
- [x] Footer con servicios, empresa, legal, redes y copyright dinámico
- [x] Enlace "Saltar al contenido"

### Home completa
- [x] Hero con titular, subtítulo, dos CTAs y composición tecnológica propia (SVG, sin stock)
- [x] Barra de confianza con movimiento continuo suave
- [x] Propuesta de valor con los tres pilares
- [x] Grid de los 7 servicios
- [x] Sección diferencial de IA sobre fondo oscuro
- [x] Portfolio con Óptica Laga y estado vacío si no hay proyectos
- [x] Metodología en 5 pasos
- [x] Sobre Odisas Lab con las tres ventajas
- [x] Bloque "¿Por qué Odisas Lab?" con las 4 ideas
- [x] FAQ accesible con `details/summary`
- [x] CTA final con contacto directo condicional
- [x] Orden de conversión de la especificación (§29)

### Datos separados del diseño
- [x] `data/services.ts` — 7 servicios
- [x] `data/projects.ts` — solo el proyecto real, con `published` y placeholders marcados
- [x] `data/process.ts`, `data/faq.ts`, `data/site.ts`
- [x] `types/index.ts` con la plantilla completa de proyecto (slug, challenge, solution, results, images, year…)

### SEO técnico base
- [x] `metadataBase`, title template, canonical, Open Graph y Twitter
- [x] Helper `pageMeta()` reutilizable por página
- [x] Schema `ProfessionalService` + `WebSite` + `FAQPage` (solo datos verdaderos)
- [x] `robots.ts` y `sitemap.ts` generados desde los datos
- [x] HTML semántico, jerarquía de encabezados y `lang="es"`

### Responsive y accesibilidad
- [x] Mobile first, breakpoints 375 → 1440, sin scroll horizontal
- [x] Cards a una columna en móvil y H1 reducido con `clamp()`
- [x] Foco visible, `aria` en menú e iconos, labels y textos alternativos
- [x] Página 404 propia

### Extra
- [x] Previews estáticos en `preview/` (home, contacto, servicio, sobre y proceso) para revisar el diseño sin instalar dependencias
- [x] README con arranque, estructura y reglas de contenido

**Pendiente de tu parte para cerrar Fase 1 al 100%:** ejecutar `npm install`,
`npm run typecheck` y `npm run build` en tu máquina, y rellenar `.env.local`.
No tengo acceso a red en este entorno, así que el build no está verificado aún.

---

## FASE 2 · Páginas internas y captación — PENDIENTE

Lo que convierte la home en una web corporativa completa.

### Páginas de servicios — COMPLETADO
- [x] `/servicios` — índice con los 7 servicios y bloque de metodología
- [x] `/servicios/[slug]` — plantilla única que genera las 7 páginas
- [x] Contenido propio por servicio: intro, señales, 6 bloques de trabajo, qué incluye y FAQ
- [x] `generateStaticParams` + `generateMetadata` con title y descripción únicos por servicio
- [x] Schema `Service` + `OfferCatalog` + `BreadcrumbList` + `FAQPage` por página
- [x] Enlazado interno: cada servicio sugiere 3 relacionados
- [x] Componente `BeforeAfter`: comparador con ratón, dedo y teclado (flechas, Inicio, Fin)
- [x] Protagonismo del ANTES → DESPUÉS en `/servicios/renovacion-web`
- [x] Maquetas ilustrativas de web antigua y renovada mientras no haya capturas reales
- [x] Componentes reutilizables extraídos: `Breadcrumbs`, `Accordion`, `ServiceIcon`
- [x] Preview estático de `/servicios/renovacion-web` con el comparador funcional

### Servicios — pendiente
- [ ] Sustituir las maquetas ilustrativas por capturas reales de antes/después
- [ ] Revisar los textos de los 7 servicios y ajustarlos a tu forma de hablar

### Portfolio — DESCARTADO
Decisión del cliente: la sección de proyectos no se hace. Eliminada de la web
(navegación, home, footer, sitemap, tipos y datos). El comparador antes/después se
conservó y vive en `/servicios/renovacion-web`.
- [x] `/proyectos` y `/proyectos/[slug]` retirados
- [x] Enlaces reemplazados: los CTA apuntan ahora a `/servicios` y `/proceso`
- [x] Sin enlaces roto ni rutas huérfanas

### Páginas de marca — COMPLETADO
- [x] `/sobre-odisas-lab`: intro, ventajas de la estructura pequeña, "qué no vas a
      encontrar aquí", principios y herramientas
- [x] Retrato con placeholder identificado hasta tener foto real
- [x] `/proceso`: los 5 pasos ampliados con qué hacemos, qué recibes y qué necesitamos
      de ti, más colaboración y embudo de conversión
- [x] Índice navegable de pasos con anclas
- [x] Schema `AboutPage`, `HowTo` y `BreadcrumbList`
- [x] Componente `Breadcrumbs` reutilizado en todas las páginas internas
- [x] Datos de la home y de `/sobre-odisas-lab` unificados en `data/about.ts`

### Contacto y conversión — COMPLETADO
- [x] `/contacto` con el formulario completo (nombre, empresa, email, teléfono, web, qué necesitas, presupuesto, mensaje, privacidad)
- [x] Validación compartida cliente/servidor en `lib/contact.ts`
- [x] Estados de carga, éxito y error, con foco automático en el primer campo con fallo
- [x] API route `/api/contacto` con sanitización y validación en servidor
- [x] Anti-spam por campo trampa y rate limiting de 5 envíos por IP cada 10 minutos
- [x] Entrega por webhook (Zapier, Make, n8n, CRM) o email con Resend
- [x] Sin canal configurado: no se finge el envío, se avisa y se registra el lead en el log
- [x] Pantalla de confirmación tras enviar
- [x] Contacto directo: email, teléfono, WhatsApp e Instagram (condicional)
- [x] Bloque "qué pasa después de enviar" en 4 pasos
- [x] Cláusula informativa de protección de datos en el punto de recogida
- [x] Breadcrumb visible y schema `ContactPage` + `BreadcrumbList`
- [x] Accesibilidad: labels, `aria-invalid`, `aria-describedby`, errores con `role="alert"`

### Contacto — pendiente
- [ ] Configurar `CONTACT_WEBHOOK_URL` o Resend para que los envíos lleguen de verdad
- [ ] CTA fijo inferior en móvil (WhatsApp + Hablemos)
- [ ] Componentes `TestimonialCard` y `LogoCloud` preparados y ocultos hasta tener material real

### Contenido pendiente de tu parte
- [ ] Datos legales: nombre completo, NIF, domicilio fiscal y proveedor de hosting
- [x] Foto y logotipo recibidos e integrados
- [ ] **DECIDIR: ¿la marca es "Odisas" u "Odisas Lab"?** El logotipo dice ODISAS
      y toda la web dice Odisas Lab. Hay que unificarlo antes de publicar
- [ ] Logotipo en SVG, si se puede conseguir
- [ ] Opcional: si algún día quieres foto en `/sobre-odisas-lab`, déjala en
      `public/brand/` y escribe la ruta en `data/site.ts`. La web ya está preparada
- [ ] Capturas de antes/después reales para `/servicios/renovacion-web`
- [ ] Trayectoria personal para `/sobre-odisas-lab`, si quieres añadirla
- [ ] Perfiles de Instagram y LinkedIn

---

## FASE 3 · Escalado, medición y pulido — PENDIENTE

Lo que hace la web sostenible en el tiempo.

### Blog
- [ ] `/blog` y `/blog/[slug]` con arquitectura de contenidos
- [ ] Categorías: SEO, Google Ads, Meta Ads, Diseño Web, IA, Marketing Digital, Redes Sociales
- [ ] Componente de artículo, autor, fecha, tiempo de lectura y relacionados
- [ ] Schema `Article` + sitemap del blog

### Analítica y cookies — COMPLETADO
- [x] Banner con Necesarias / Analítica / Marketing y panel de configuración
- [x] Aceptar y rechazar con el mismo peso visual y un solo clic
- [x] Nada de terceros se carga antes del consentimiento
- [x] Carga condicional de GA4, GTM y Meta Pixel según categoría aceptada
- [x] Google Consent Mode con todo denegado por defecto
- [x] Consentimiento guardado 12 meses, con versionado para volver a pedirlo si cambia el texto
- [x] Reapertura del panel desde "Configurar cookies" en el pie y en la política
- [x] Si un ID de analítica está vacío, ese script no se inserta
- [ ] Google Search Console y verificación de dominio

### Legal — COMPLETADO (pendiente de tus datos)
- [x] `/politica-de-privacidad`: responsable, datos, finalidades, base legal, plazos, destinatarios, derechos y AEPD
- [x] `/politica-de-cookies`: funcionamiento, tabla de cookies por categoría, cambio de decisión y guías por navegador
- [x] `/aviso-legal`: datos identificativos LSSI, objeto, condiciones de uso, propiedad intelectual, responsabilidad y legislación
- [x] Enlazadas desde el pie y desde el banner de cookies
- [x] Cláusula informativa en el propio formulario de contacto
- [x] Los huecos sin rellenar se marcan como `[COMPLETAR: ...]`, con `noindex` y fuera del sitemap hasta completarse
- [ ] **Rellenar en `data/legal.ts`:** nombre completo del titular, NIF, domicilio fiscal y proveedor de hosting
- [ ] Revisión por alguien con criterio legal antes de publicar

### Seguridad
- [ ] Sanitización de entradas y protección anti-spam (honeypot o similar)
- [ ] Rate limiting en la API de contacto
- [ ] Cabeceras de seguridad y revisión de que no hay secretos en el cliente

### Identidad e imágenes — COMPLETADO
- [x] Favicon multi-tamaño (16 / 32 / 48) con la marca "O." en naranja
- [x] `apple-icon.png` 180x180 e iconos maskable de 192 y 512 para el manifest
- [x] Imagen Open Graph y Twitter propias, 1200x630, con titular, servicios y dominio
- [x] `app/manifest.ts` con nombre, colores e iconos
- [x] Script reproducible en `scripts/generar-imagenes.py`
- [x] `Logo` y retrato preparados para usar tus archivos reales en cuanto los dejes
      en `public/brand/` y los declares en `data/site.ts`
- [x] Logotipo real integrado: símbolo + ODISAS con transparencia reconstruida
- [x] Versiones para fondo claro y oscuro, con y sin la bajada
- [x] Favicon e iconos regenerados desde el símbolo real de la marca
- [x] Imagen de compartición con el logotipo real
- [x] Retrato retirado por decisión del cliente; en su lugar, tarjeta de marca
      con el símbolo y el claim, sin placeholders visibles
- [x] Script `preparar-logo.py` para regenerar todo desde los originales
- [ ] Conseguir el logotipo en SVG y sustituir los PNG
- [ ] Sustituir el sustituto tipográfico por Space Grotesk real y regenerar

### Rendimiento y calidad
- [ ] Optimización de imágenes reales, lazy loading y scripts de terceros
- [x] Auditoría de contraste WCAG AA: 10 fallos detectados y corregidos, 0 pendientes
- [x] Token `--color-primary-ink` para texto naranja; antracita sobre fondo naranja
- [x] Jerarquía de encabezados correcta en las 9 rutas (un salto h1→h3 corregido)
- [x] Revisión de nombres accesibles, labels, `aria-*` y elementos interactivos
- [x] Revisión de enlaces internos: ninguno roto
- [x] Metadatos únicos por página verificados
- [x] Informe completo en `AUDITORIA.md` y script reejecutable en `scripts/`
- [ ] **En tu máquina:** `npm run typecheck` y `npm run build` sin errores
- [ ] **En tu máquina:** auditoría Lighthouse con la web servida
- [ ] **En tu máquina:** recorrido con teclado y prueba con lector de pantalla
- [ ] Despliegue

---

## Cómo seguimos

Dime qué bloque quieres siguiente y lo hago completo antes de pasar al próximo.
Mi recomendación de orden dentro de la Fase 2:

1. ~~`/contacto` con formulario funcional~~ — hecho
2. ~~`/servicios` y `/servicios/[slug]`~~ — hecho
3. ~~`/sobre-odisas-lab` y `/proceso`~~ — hecho
4. ~~Legal, cookies y analítica~~ — hecho
5. ~~Favicon, iconos e imagen Open Graph~~ — hecho
6. ~~Auditoría de accesibilidad y contraste~~ — hecho
7. Queda: verificar el build en tu máquina y, si algún día escribes, el blog
