# Zona Pies · Documento de diseño

Los ocho pasos previos al código que pide el briefing (§34). Este documento manda sobre las decisiones del proyecto; el código lo implementa.

> **Idea que gobierna todo:** no mostrar una plantilla, mostrar la tecnología que la hace posible.
> `PIE → DATOS → DISEÑO → MATERIAL → FABRICACIÓN → ORTESIS`

---

## 1. Análisis de la web actual

**Limitación honesta.** El entorno de trabajo bloqueó el acceso directo a `zonapies.es` (el proxy de red deniega el dominio; también `youtube.com` y directorios). **No he podido leer la web real.** Lo que sí se obtuvo es lo que devuelven los buscadores sobre ella (fragmentos de sus propias páginas y directorios mercantiles). El análisis se apoya en eso, en el *documento funcional* y en el briefing. Todo dato obtenido por búsqueda está marcado como **por confirmar**; nada se ha inventado.

**Datos reales localizados por búsqueda (sin verificar en directo)**

| Dato | Valor | Fuente |
|---|---|---|
| Razón social / CIF | ZONAPIES SL · B88280821 | Aviso legal de la web (fragmento) |
| Domicilio | Calle Zarzuela, 10 · 28942 Fuenlabrada (Madrid) | Aviso legal, páginas amarillas |
| Teléfonos | 91 606 23 73 · 640 203 750 | Home y directorios |
| Email | zonapiesfuenlabrada@gmail.com | Home (un directorio cita otro: confirmar) |
| Instagram | @zonapies_ | Búsqueda |
| Propuesta | «Sistema integral de escáner 3D, software de prescripción y fabricación avanzada» · «Escanea el pie, automatiza el diseño y fabrica ortesis plantares a medida sin depender de procesos manuales ni espumas» | Home |
| Experiencia | «más de 30 años» (otras fuentes dicen 40 y 50: confirmar) | Datos estructurados de la home |
| Materiales citados | Resina, composite, fibra de carbono, EVA, polipropileno, amortiguación, forros | Canal de YouTube / directorios |
| URLs antiguas | `/quienes-somos/`, `/productos/`, `/condiciones-de-uso/` | Búsqueda → se redirigen (301) |
| Otros dominios | `zonapiessl.com`, un login en `zonapiesweb.azurewebsites.net` (posible acceso de clientes: confirmar) | Búsqueda |

Lo que sí se sabe de la web actual:

| Aspecto | Qué consta |
|---|---|
| Estructura | Inicio · Sobre nosotros · Plantillas y materiales · Sistemas de fabricación · Franquiciados · Formación · Contacto · Acceso para clientes |
| Mensaje de la home | «Ingeniería digital aplicada a la ortesis plantar»; escaneo 3D, fabricación avanzada, materiales técnicos, experiencia, presupuesto gratuito |
| Materiales | Resina, composite, fibra de carbono, EVA, PA11, amortiguación y suspensión, forros |
| Plazo | Fabricación en aproximadamente **tres días hábiles** desde la recepción del pedido |
| Alcance | Trabaja con profesionales sanitarios y centros especializados; **envíos a nivel nacional** |
| Trayectoria | Comunica décadas de experiencia y colaboración con profesionales sanitarios |
| Prueba social | Ya dispone de testimonios de clientes y profesionales |

**Diagnóstico.** La información existe pero se presenta como texto. El problema no es de contenido sino de *traducción*: hay que convertir cada afirmación en algo que se vea, se toque o se entienda en un vistazo. La fórmula del briefing: `experiencia + interacción + storytelling + conversión`.

## 2. Contenido: qué se mantiene, qué se reescribe, qué falta

**Se mantiene (reescrito, ordenado, visualizado, simplificado)**
- Propuesta: ortesis plantares y plantillas a medida para profesionales.
- Escaneo 3D → diseño digital → fabricación avanzada.
- Catálogo de materiales y sus familias.
- Plazo aproximado de tres días hábiles y envíos nacionales.
- Presupuesto gratuito, acceso de clientes, formación, franquicias.
- Experiencia acumulada (sin cifras: no constan).

**Pendiente de proporcionar por Zona Pies** (la web lo muestra con un marcador `PLACEHOLDER` visible hasta que se sustituya)
- Confirmar teléfono, email, dirección y que 640 203 750 sea el WhatsApp de empresa; URL del acceso de clientes.
- Testimonios reales (texto, nombre, clínica, consentimiento).
- Casos reales con fotos y material usado.
- Fotografías y vídeo del laboratorio, maquinaria y equipo.
- Fechas y contenido de formaciones.
- Condiciones del modelo de franquicia.
- Cronología real de la empresa (años, hitos).
- Manual de marca: logotipo y colores oficiales.
- Textos legales (razón social, CIF, domicilio).
- Validación técnica de las propiedades de cada material.
- URLs antiguas del sitio, para las redirecciones 301.

**Regla (briefing §30):** sin certificaciones, premios, clientes, cifras ni resultados inventados. Las cifras decorativas del HUD se limitan a indicadores de interfaz (progreso, ejes), nunca a especificaciones del producto.

## 3. Arquitectura

```
/                      Home · storytelling de scroll (7 fases)
/tecnologia            Escaneo, diseño, software, prescripción, fabricación, calidad
/proceso               Cadena de producción digital a pantalla completa (5 pasos)
/plantillas            Soluciones y sistemas (fabricamos / solo shell / fabrica las tuyas)
/materiales            Material Lab
/profesionales         «Tu laboratorio. A un click.» + colaboración podólogo → Zona Pies → paciente
/nosotros              Timeline: experiencia → evolución → tecnología → innovación → futuro
/formacion             Plataforma educativa premium
/franquicias           Landing comercial
/contacto              Presupuesto + teléfono + WhatsApp
/acceso-profesional    Entrada al área de clientes integrada en la web
/aviso-legal · /politica-de-privacidad · /politica-de-cookies
/api/presupuesto       Envío del formulario
```

**Navegación (briefing §8):** Inicio · Tecnología · Plantillas · Materiales · Proceso · Profesionales · Nosotros · Formación · Contacto. CTA permanente `SOLICITAR PRESUPUESTO`; acceso secundario `ACCESO PROFESIONALES`. Header sticky que se compacta al hacer scroll y cambia de tema (claro/oscuro) según la sección bajo él.

**Franquicias** queda fuera del menú principal (como en el briefing) y se llega desde el footer, la home y `/profesionales`.

**Home — guion de scroll**

| # | Sección | Pregunta que responde |
|---|---|---|
| 1 | Hero 3D | ¿Qué es esto? |
| 2 | Story 01–07 (scan → analyze → design → material → manufacture → result → CTA) | ¿Cómo lo hacen? |
| 3 | «Fabricamos más que plantillas» | ¿Qué hacen exactamente? |
| 4 | Proceso fullscreen (5 pasos) | ¿Cómo trabaja con mi consulta? |
| 5 | Material Lab | ¿Qué materiales hay y para qué? |
| 6 | ¿Qué necesitas? (selector) | ¿Cómo encaja conmigo? |
| 7 | Zona Profesional | ¿Qué gano trabajando con ellos? |
| 8 | Configurador | ¿Cuál es mi caso? |
| 9 | Casos | ¿Funciona? |
| 10 | Nosotros (timeline) | ¿Quién hay detrás? |
| 11 | Testimonios | ¿Qué dicen otros profesionales? |
| 12 | Formación · Franquicias | ¿Qué más ofrecen? |
| 13 | CTA final «¿Empezamos?» | ¿Cómo contacto? |

## 4. Sistema visual

**Posicionamiento:** `healthcare + engineering + digital technology + manufacturing`. Premium (Apple/Rimowa en nivel de acabado) con la claridad de una web sanitaria. Estilo base: *premium* con acento *clean*; accesibilidad WCAG 2.2 AA por encima de la estética cuando chocan.

**Paleta — PROVISIONAL.** El briefing pide partir de la identidad actual, que no he podido ver. Todos los colores son tokens (`app/globals.css`, bloque `@theme`): cambiar el color de marca es tocar dos líneas.

| Token | Valor | Uso |
|---|---|---|
| `ink-950 / 900 / 800` | `#07090B / #0C1014 / #131A20` | Fondos oscuros |
| `bone-50 / 100 / 200` | `#F6F5F1 / #ECEAE4 / #DDDAD1` | Fondos claros (blanco roto cálido, no blanco puro) |
| `brand` | `#0A7068` | Marca sobre claro (texto 5,4:1 · botón con texto blanco 5,9:1) |
| `signal` | `#3EE6C9` | Acento técnico sobre oscuro (HUD, líneas de escaneo, foco) |
| texto | `#0B1014` / `#4C5760` (claro) · `#EEF1F2` / `#9AA6AE` (oscuro) | Contraste ≥ 4,5:1 |

Un único color de acento. Los colores de material (resina ámbar, carbono negro…) viven *solo* dentro de las visualizaciones.

**Tipografía:** Geist (sans, titulares con tracking negativo, peso 500–600) + Geist Mono (HUD, etiquetas, números). Autoalojadas con `next/font/local`: sin peticiones a Google, mejor privacidad y LCP. Escala fluida con `clamp()`; titulares hasta ~9 rem en escritorio.

**Composición:** rejilla de 12 columnas, margen 16 px móvil / 40 px escritorio, ritmo vertical múltiplo de 8. Mucho espacio negativo. Líneas finas (1 px) y marcas de registro en esquinas como lenguaje de «plano técnico». Secciones claras y oscuras alternas.

**HUD (sin caer en ciencia ficción):** etiquetas mono en mayúsculas pequeñas (`3D SCAN`, `DIGITAL DESIGN`, `ADVANCED MANUFACTURING`, `PRECISION`), ejes X/Y/Z, barra de progreso de fase, marcas anatómicas. Nunca más de 4–5 elementos HUD a la vez; nunca sobre texto.

**Lenguaje 3D:** una sola escena procedural reutilizada en toda la web (hero, story, proceso, Material Lab, CTA final). Pieza hero: modelo anatómico de pie (superficie plantar) → nube de puntos → malla → plantilla → capas → pieza terminada.

## 5. Interacciones — cada una explica algo

| Interacción | Qué explica | Dónde |
|---|---|---|
| Barrido láser + nube de puntos | El pie se digitaliza | Story 01 |
| Malla + marcas anatómicas | Se analiza la geometría | Story 02 |
| Morph pie → plantilla (los dedos se pliegan al contorno) | El dato se convierte en diseño | Story 03 |
| Selector de material que cambia textura y brillo en 3D | El material condiciona la pieza | Story 04, Material Lab |
| Capas que se separan | La pieza se compone de capas | Story 05 |
| Rotación al cursor / arrastre | El 3D es real, manipulable | Hero, Material Lab, CTA |
| Contador de fase y barra de progreso | Dónde estás en el proceso | Story, Proceso |
| Botón magnético | Este es el botón principal | CTAs primarios |
| Texto que aparece por palabras | Ritmo de lectura, jerarquía | Titulares |
| Tarjetas que se expanden | Detalle bajo demanda | Casos, Formación |
| Parallax suave | Profundidad entre capas | Imágenes macro, fondos |
| Selector «¿Qué necesitas?» que reescribe el bloque | Adaptar el mensaje al perfil | Home, Plantillas |

**Reglas:** (1) si una animación no aporta información, se elimina; (2) `prefers-reduced-motion` desactiva el movimiento y deja el contenido en su estado final; (3) nada se anima por encima del texto que se está leyendo; (4) transform/opacity únicamente (GPU).

## 6. Sistema de conversión

**Un objetivo:** `SOLICITAR PRESUPUESTO`. Cinco vías de contacto, todas medidas.

| Elemento | Detalle |
|---|---|
| CTA persistente | Menú (siempre), hero, proceso, materiales, zona profesional, footer; barra inferior en móvil |
| Variantes de mensaje | Solicitar presupuesto · Hablar con un especialista · Quiero trabajar con Zona Pies · Descubrir nuestras soluciones · Acceder como profesional. Nunca «Más información» |
| WhatsApp flotante | «¿Hablamos?» con mensaje predefinido, en toda la navegación, sin tapar el CTA móvil |
| Formulario | 8 campos (nombre, empresa/clínica, email, teléfono, provincia, tipo de profesional, qué necesitas, mensaje), validación inline accesible, microcopy de confianza, preselección según el CTA de origen |
| Configurador | 5 pasos hasta «Hablemos sobre tu caso»; al enviar, precarga el formulario con la selección. **No es una valoración médica** y lo dice |
| Prueba social | Testimonios de podólogos con protagonismo; no se inventan: placeholders marcados |

**Medición (KPI §27)** — `lib/analytics.ts` emite a `dataLayer` (compatible con GTM/GA4) solo con consentimiento:

`quote_request` · `quote_form_start` · `quote_form_submit` · `whatsapp_click` · `phone_click` · `email_click` · `pro_access_click` · `material_view` · `scene_interact` · `scene_phase` · `configurator_step` · `scroll_depth` (25/50/75/100) · `cta_click` (con `cta_id` y sección → conversión por CTA).

Cualquier elemento con `data-cta="id"` se mide automáticamente.

## 7. Rendimiento, accesibilidad y degradación

**Política de escena (3 niveles):**

| Nivel | Condición | Qué ocurre |
|---|---|---|
| `full` | Escritorio con GPU razonable | Escena completa, DPR ≤ 2, ~9 k puntos |
| `lite` | Táctil / pantalla estrecha / ≤ 4 núcleos | Malla reducida, DPR ≤ 1,25, sin reflejos, sin efectos de cursor |
| `none` | Sin WebGL, `prefers-reduced-motion`, `saveData`, ≤ 2 GB o ≤ 2 núcleos, o FPS bajo sostenido | Ilustración SVG estática por fase (el mismo storytelling, sin 3D) |

- El **SVG es también el render del servidor**: el LCP no espera a Three.js. El canvas se monta tras el primer paint (idle) y se funde sobre la ilustración.
- Three.js se carga con `import()` dinámico, solo cuando la escena entra en pantalla o se acerca. Pausa el bucle cuando sale de pantalla o la pestaña está oculta.
- Un monitor de FPS degrada automáticamente `full → lite → none` si el dispositivo no puede.
- Geometría **procedural** (sin archivos .glb ni texturas externas): 0 KB de modelos. El módulo de modelo es sustituible por un `.glb` real (ver README).
- Imágenes con `next/image` (AVIF/WebP), `loading="lazy"`; sin vídeos pesados: las zonas de vídeo son placeholders con póster.
- Accesibilidad: HTML semántico, un `h1` por página, foco visible, teclado completo (tabs de materiales con flechas, selector con radiogroup), `aria-live` en el formulario, objetivos táctiles ≥ 44 px, alternativa textual a cada visualización, enlace «saltar al contenido».

## 8. Decisiones tecnológicas (cada una justificada)

| Elección | Por qué |
|---|---|
| Next.js 15 (App Router) + TypeScript | SSR/SSG para SEO, metadata por página, `next/image`, API route para el formulario |
| Tailwind CSS 4 | Tokens de diseño en CSS, cero runtime |
| Three.js (sin React Three Fiber, sin drei) | Escena procedural pequeña y muy controlada: el wrapper declarativo no aporta nada y añade peso. Un solo componente imperativo con ciclo de vida propio |
| Lenis (solo escritorio, sin reduced-motion) | Scroll suave que hace más legible el storytelling; en táctil se usa el scroll nativo |
| **Sin** GSAP ni Framer Motion | El kit propio (IntersectionObserver + CSS + un único bucle de scroll) cubre todo lo necesario con menos JS. Menos dependencias, mejor INP |
| Geist autoalojada | Rendimiento y privacidad |
| nodemailer (SMTP) / Resend / webhook | Entrega del formulario igual que el resto de proyectos del repo; sin servicios de pago obligatorios |

## 9. Pendiente de decisión del cliente

1. Colores y logotipo oficiales (la paleta es provisional).
2. Número de WhatsApp/teléfono y email de recepción de solicitudes.
3. URL del acceso de clientes actual (se enlaza, no se reimplementa).
4. Fotografía real del laboratorio y casos.
5. Textos legales definitivos.
