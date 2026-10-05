# Sara del Olmo Studio · Web inmersiva

Web one-page con **scrolltelling real** («De la uña al arte»): el scroll controla una cámara que entra en una uña, atraviesa el esmalte
y recorre manos, pies, cejas y piercing hasta la reserva en Booksy. Vanilla JS + CSS (sin framework), SEO local, analítica preparada
y un único fichero de datos por tema para que Sara pueda cambiar lo que quiera.

> Dossier creativo (concepto, arquitectura, storyboard, dirección visual, animaciones y conversión): [`DISENO.md`](./DISENO.md)

## Arrancar

```bash
cd sara-del-olmo-studio
npm install
npm run dev        # http://localhost:4173 (reconstruye al guardar)
npm run build      # genera dist/ (HTML prerenderizado + JS/CSS minificados + sitemap + robots)
npm run preview    # sirve dist/ tal cual saldría a producción
npm run check      # valida los datos y lista lo que sigue pendiente de Sara
npm run photos     # optimiza fotos reales (AVIF/WebP/JPG responsive)
npm run scene-photos  # prepara las fotos de las escenas (portada, pies, cejas, piercing, final) desde scene-src/
```

Requiere Node 20+. El resultado (`dist/`) es estático: sirve cualquier hosting. Con Vercel basta con apuntar el proyecto a esta carpeta
(`vercel.json` ya incluye caché larga para `/assets` y cabeceras de seguridad); con Netlify o similar: build `npm run build`, publicar `dist`.

## Dónde se cambia cada cosa

Todo lo que no es diseño está en `src/data/`. Tras editar: `npm run build` (o `npm run dev`).

| Archivo | Contiene |
|---|---|
| `config.js` | `CONFIG`: Booksy, teléfono, WhatsApp, Instagram, horarios, dirección, valoración, dominio, GTM, formulario, tienda de vales |
| `services.js` | `SERVICES` (los 25 servicios reales: precio, «desde», duración, qué incluye, nota), `CATS`, test «¿qué pedir?» |
| `team.js` | `TEAM` (equipo, rol, bio, especialidades, foto) |
| `faqs.js` | `FAQS` (se pintan y salen como `FAQPage` en JSON-LD) |
| `promos.js` | `PROMOS` (vacía: la sección no se muestra hasta que haya una) |
| `card-styles.js` | `CARD_STYLES` (diseños del vale) e importes rápidos |
| `look.js` | Los 12 colores, 5 formas y 5 acabados del diseñador |
| `media.js` | Fotos del estudio y de Instagram (huecos hasta que haya fotos) |
| `copy.js` | Titulares y microcopy de la experiencia |

**Regla de oro: no se inventa nada.** Lo que falta se deja vacío y la web lo marca como `[ DATOS PENDIENTES ]`
(teléfono, WhatsApp, horario por días, biografías de Daniela y Bianca, fotos…). `npm run check` imprime la lista completa.

Cuando Sara dé el **teléfono** y el **WhatsApp**: rellena `CONFIG.phone`, `phoneDisplay` y `whatsapp` y desaparecen las marcas
de pendiente y los botones «Llamar» / «WhatsApp» (barra móvil, contacto, vales, eventos, diseñador, fichas) pasan a funcionar.

### Fotos reales

1. Copia los originales a `photos-src/` (p. ej. `mesa-de-trabajo.jpg`, `sara.jpg`).
2. `npm run photos` → genera `public/img/*` (AVIF, WebP y JPG en 480/960/1600 px) y `src/data/photo-manifest.json`.
3. Pon el nombre sin extensión en la entrada: `file: 'mesa-de-trabajo'` (y un `alt` descriptivo) en `media.js`, o `photo: 'sara'` en `team.js`.
4. `npm run build`. Se pintan como `<picture>` con `loading="lazy"`, y el placeholder «[ FOTO PENDIENTE ]» desaparece.

### Analítica (GA4 / GTM)

Pon el ID en `CONFIG.gtmId` (GTM-XXXXXXX) y el snippet se inserta solo; GA4 se configura dentro de GTM. Mientras tanto, los eventos ya se
envían a `window.dataLayer`: `reservation_click`, `phone_click`, `whatsapp_click`, `gift_voucher_click`, `contact_form_submit`,
`service_view`, `pricing_view` (+ `instagram_click`, `maps_click`). Cada uno lleva `location` (sección desde la que se hizo clic),
y los de servicio, `service` (id). Cualquier botón nuevo se mide con `data-track="…" data-loc="…"`.

> El banner/gestión de cookies y los textos legales están **pendientes** (`/aviso-legal.html`, `/privacidad.html`, `/cookies.html` son
> esqueletos con `[ DATOS PENDIENTES ]`). Antes de activar GTM hay que decidir el aviso de cookies con la asesoría de Sara.

### SEO local

`src/templates/seo.js` genera título, meta description, Open Graph/Twitter, canonical y JSON-LD (`NailSalon` con catálogo de los 25 servicios
y `ReserveAction` hacia Booksy, `WebSite`, `FAQPage`) a partir de los mismos datos. `sitemap.xml` y `robots.txt` se crean en el build.
Pendiente: confirmar el **dominio** (`CONFIG.siteUrl`, `siteUrlConfirmed: true`) y, cuando haya, teléfono y horario con formato Schema.org
(`CONFIG.hours[].schema`). La imagen para redes (`public/og.png`) y los iconos se regeneran con `node scripts/make-assets.mjs`.

## Cómo está construido

```
src/
  data/        datos editables (arriba)
  templates/   HTML como funciones: page.js, sections-a/b/c.js, seo.js, quiz.js, media.js
  css/         tokens · base · chrome (cabecera, menú, pincel, barra móvil, ficha) · scenes · sections
  js/
    main.js    arranque + carga perezosa de módulos
    lib/       scene.js (motor «scroll = cámara»), handworld.js (fotos alineadas + cambio de enfoque), liquid.js (shader WebGL), look.js, util, color, ui
    art/       arte vectorial del diseñador de uñas y de los iconos: nail-markup, hand, nail-view, icons
    scenes/    hero, pies, cejas, piercing, safety, studio, final, static (modo reducido)
    ui/        links+analítica, nav, effects, designer, tarifas, drawer, voucher, forms, quiz, gallery
scripts/       build, dev, serve, check-data, photos, scene-photos, make-assets
scene-src/     fotos originales de las escenas (se versionan; salida en public/img/scene/)
```

- **Escenas:** `section.scene` (alto = `--len` × pantalla) + `.scene__stage` sticky. `registerScene(el, render)` entrega `p` de 0 a 1.
  Para mover la cámara de una escena basta con editar su `render(p)`; los tramos se definen con `seg(p, desde, hasta, easing)`.
- **Escenas con fotografías.** La cámara es una transformación CSS (traslación + giro + zoom, `lib/handworld.js`) sobre varias fotos
  alineadas en un mismo «mundo». Para saltar de una foto a la siguiente se encadena un **cambio de enfoque**: nítida → borrosa →
  (borrosa) → nítida. Las versiones borrosas son diminutas (3–10 kB), así que no hay filtros en tiempo real ni «uñas dobles».
  - **Portada:** mano → cuatro uñas → macro de una uña (se alinean por la uña central) → el shader de esmalte líquido
    (`lib/liquid.js`) toma el relevo. Sin WebGL, un portal CSS lo sustituye; con `prefers-reduced-motion`, versión estática.
  - **Pies:** foto con el fondo verde recortado (croma) sobre el color del look. **Cejas:** rostro + guías de medida SVG en las
    mismas coordenadas. **Piercing:** la ceja de la escena anterior → destello → joya macro → penumbra → oreja.
  - **Final:** el mismo viaje de la portada a la inversa.
- Las coordenadas de alineación están en `src/data/scene-photos.js` (uña central, borde de la cutícula, piercing de la concha…).

### Fotos de las escenas — ⚠ PROVISIONALES (generadas con IA)

Las imágenes de `scene-src/` (mano, macro de uña, pies, rostro con cejas, oreja, joya) son **ambientación generada con IA**; no son
trabajos de Sara del Olmo Studio, y la web no las presenta como tales (los `alt` las describen de forma genérica). Antes de publicar:
sustituirlas por fotos reales del estudio (con consentimiento de las clientas) o, si se mantienen, indicar en la web que son imágenes
generadas con IA. Para cambiar una: copia la foto nueva en `scene-src/` con el mismo nombre, ajusta las medidas en
`src/data/scene-photos.js` (la mano y la macro se alinean por la uña central; la joya y la oreja, por el piercing de la concha) y
ejecuta `npm run scene-photos && npm run build`. Con fotos reales los pies/mano ya **no** adoptan el color del look: solo lo hace el fondo de «Pies».

### Rendimiento, accesibilidad y responsive

- Peso total medido: HTML 29 kB + CSS 15 kB + JS 42 kB + fuentes 86 kB (gzip). Fuentes autoalojadas y precargadas; JS en módulos que se cargan en reposo.
- Animaciones GPU-friendly (`transform`/`opacity`), nada se calcula fuera de pantalla, el shader se adapta al dispositivo.
- HTML semántico, enlace «Saltar al contenido», foco visible, pestañas con flechas, `dialog` nativo (Esc cierra, foco devuelto), formularios con etiquetas
  y errores enlazados, contraste AA, `prefers-reduced-motion`.
- Probado a 390, 430, 768, 1024, 1440 y 1920 px: sin scroll horizontal accidental, consola limpia y sin errores. En móvil se mantiene la
  historia y se simplifican los efectos pesados (menos octavas y resolución del shader, menos elementos en pantalla).

## Puntos a confirmar con Sara

- Precios y duraciones: se mantienen **tal cual** estaban en Booksy (p. ej. «Arreglo de una uña» figura a 1 €). Revisar antes de publicar.
- Biografías: las de Sara, Mafer, Paula y la otra Sara se conservan de la versión anterior; faltan Daniela y Bianca. Apellido o apodo de la otra Sara.
- Facebook (`/saramagicnails`) no se muestra hasta que confirme que es suyo (`CONFIG.facebookConfirmed`).
- Importes rápidos de los vales (`VOUCHER_AMOUNTS`): provisionales; falta definir cómo se venderán y cobrarán.
- `areaServed` (Fuenlabrada, Moraleja de Enmedio, Griñón) es una ayuda de SEO local editable en `CONFIG.areaServed`.
