# Sara del Olmo Studio · Dossier creativo

> «From nail to art.» Una película interactiva en la que el scroll es la cámara.

Este documento recoge lo que pedía el encargo antes de construir: concepto, arquitectura, storyboard del scroll,
dirección visual, sistema de animaciones y estrategia de conversión.

---

## 1. Concepto creativo

**Idea madre: FROM NAIL TO ART.** La uña no es un adorno de la página: es el portal.
El visitante empieza mirando una uña lacada, hace scroll, la cámara se acerca hasta *entrar en el esmalte*
y al otro lado descubre el universo del estudio (manos, pies, cejas, piercing, el equipo, las clientas) hasta
volver a una mano terminada que le dice: **«Now make it yours.»** y le lleva a reservar.

Hilo conductor, en voz alta, a lo largo del viaje:

| Frase | Dónde vive |
|---|---|
| **Nails with art.** | Portada |
| **Every detail matters.** | Primer acercamiento de la cámara (el concepto: detalle, cuidado, personalización) |
| **From hands to feet.** | Transición a pedicura |
| **Behind the beauty.** | El equipo |
| **Make it yours.** | Eventos |
| **See the work.** | Instagram |
| **Now make it yours.** | Final · reserva |

El **look que elige la clienta** viaja con ella: el color que diseña en «Diseña tu look» inunda la pantalla de los pies
y es el esmalte de la mano terminada del final. La película es suya.

> Regla de contenido (obligatoria): solo datos reales. Lo que falta se marca `[ DATOS PENDIENTES ]`.
> No hay fotografías inventadas: las manos, pies, cejas y oreja son **ilustraciones vectoriales** hechas para la web.
> Las fotos reales se sustituyen cuando Sara las entregue (ver README).

## 2. Arquitectura

```
Datos editables (src/data/*.js)  ──►  Plantillas (src/templates/*.js)  ──►  HTML estático prerenderizado
                                                                              │
Arte vectorial (src/js/art/*.js) ──►  se usa en el HTML y en el navegador     │
                                                                              ▼
Motor de escenas (src/js/lib/scene.js) ◄── escenas (src/js/scenes/*.js) ◄── scroll
```

- **Sin framework.** HTML + CSS + JavaScript (módulos ES). Un build de esbuild divide el código (*code splitting*):
  la portada se carga primero y cada escena/pieza interactiva llega cuando el navegador está libre. Peso total medido en producción: HTML 29 kB + CSS 15 kB + JS 42 kB + fuentes 86 kB (todo gzip, ≈ 172 kB sin contar fotos).
- **Prerender:** todo el contenido (los 25 servicios, el equipo, las FAQ, el JSON-LD) está en el HTML, así que Google lo ve sin ejecutar JS.
- **Escenas = contenedor alto + escenario `position: sticky`.** No se usa `pin` de librerías: la altura de cada escena está
  fijada en CSS (`--len` × alto de pantalla), así que no hay saltos de layout aunque los módulos carguen después.
- **Motor propio** (`lib/scene.js`): calcula el progreso `p` (0–1) de cada escena, lo amortigua (inercia cinematográfica) y llama a
  `render(p)`. Solo trabaja mientras la escena está cerca de la pantalla. No hace falta GSAP/ScrollTrigger.
- **Modo reducido:** con `prefers-reduced-motion`, sin JS o si una escena falla, cada escena degrada a una composición estática
  legible (arte en su estado final + texto), sin pines ni cámara.

### Estructura de la película

```
INTRO ► LA UÑA ► ZOOM ► ENTRAR EN EL ESMALTE ► MANOS ► DISEÑA TU LOOK ► COLOR ► PIES ► CEJAS ► PIERCING
► SEGURIDAD ► SERVICIOS ► TARIFAS ► NOSOTRAS ► ESTUDIO ► CLIENTAS ► VALES ► EVENTOS ► INSTAGRAM ► FAQ/CONTACTO ► RESERVA
```

Siete escenas son **escenas de cámara controladas por el scroll** (portada→portal, pies, cejas, piercing, seguridad, estudio, final);
el resto son secciones normales con interacción propia (diseñador, tarifas, vale 3D…) y títulos que se resuelven con el scroll.

## 3. Storyboard del scroll

### Acto 1 · La uña (escena de 600 % de pantalla)

| Scroll | Cámara | Qué ocurre |
|---|---|---|
| 0 % | Mano completa | Surge de la oscuridad, destellos en las uñas, aparece el logo, «Nails with art.», Humanes de Madrid y el CTA «Pedir cita» (con forma de uña lacada) |
| 15 % | Las uñas | «Every detail matters.» |
| 30 % | Una uña llena la pantalla | El dibujo vectorial sigue nítido a cualquier zoom |
| 45 % | Textura y brillo | Relevo al **shader de esmalte líquido** (WebGL): reflejos, micro-textura, luz |
| 60 % | Más cerca | «Textura. Brillo. Reflejo.» |
| 75 % | El color es un universo abstracto | El esmalte se vuelve líquido (domain warping, contornos irisados) · «Color.» |
| 90 % | Dentro del color | Vórtice de cáusticas, partículas, el portal de luz crece |
| 100 % | La superficie se transforma | Luz crema que inunda la pantalla = el fondo de la siguiente sección |

### Resto de escenas

| Escena | Secuencia |
|---|---|
| **Pies** (360 %) | La cámara está dentro de la uña de tu look → se aleja: uña → dedo → pie → los dos pies. Aparece «From hands to feet.» y los 6 servicios reales. Al final la pantalla se oscurece. |
| **Cejas** (420 %) | Oscuridad → una línea se dibuja desde el centro → se transforma en dos cejas simétricas → guías de medida, ojos, puntos clave (precisión) → la cámara se acerca → el pigmento «sombreado» se asienta → texto y precios. |
| **Piercing** (440 %) | La línea de la ceja se recoge hasta su punta → destello metálico → **joya de titanio facetada que gira con el scroll** → vuela a una oreja → composición de joyas que aparecen una a una → Precisión · Estilo · Seguridad. |
| **Seguridad** (340 %) | Un escáner barre la pantalla y deja un fondo clínico → por cada elemento: se dibuja un instrumental, una línea lo rodea y se transforma en icono (Esterilización · Protección · Materiales de calidad). |
| **Estudio** (240 %) | La cámara está dentro de la primera foto y se aleja hasta mostrar el estudio entero; después, galería horizontal arrastrable (ratón con inercia, dedo, flechas y teclado). |
| **Final** (460 %) | Macro de una uña (la tuya) con la luz recorriéndola → la cámara se aleja a la mano terminada → «Now make it yours.» → SARA DEL OLMO STUDIO / Humanes de Madrid → **PEDIR CITA** (Booksy). |

Momentos WOW: ① la cámara entra en la uña · ② el esmalte se vuelve un universo de color · ③ la uña se diseña en tiempo real ·
④ la línea de la ceja se convierte en una joya · ⑤ la cámara vuelve a la mano terminada y aparece el CTA.

## 4. Dirección visual: «Cherry lacquer»

- **Paleta:** fondo `#F8EEEB`, texto `#2B1519`, acento `#7A1027`, escenario oscuro `#2A1418`, superficie `#F1DFDB` (+ `#12080A` para la penumbra y `#E7788F` como rosa de contraste sobre oscuro). Nada de rosa chicle.
- **Tipografía:** Bodoni Moda (titulares, grandes, con mucho espacio negativo) + Albert Sans (texto), autoalojadas (subconjunto latino, variables, `font-display: swap`).
- **Ritmo claro/oscuro:** la película alterna mundos: oscuro (portada) → luz (manos) → escenario (diseñador) → color propio (pies) → penumbra (cejas, piercing) → clínico blanco (seguridad) → real (estudio) → cereza (eventos) → oscuro (final). La cabecera y el pincel de progreso cambian de tinta según el mundo.
- **Motivo:** el arco con forma de uña (retratos, fotos, vales, ilustraciones) y el reflejo lacado (botones, tarjetas, uñas).
- **Editorial:** titulares enormes, jerarquías muy marcadas, texto alineado a la izquierda, composiciones asimétricas.
- **Sin modo oscuro automático** (a diferencia de la versión anterior): la película ya alterna claro y oscuro con intención.

## 5. Sistema de animaciones

Regla: **cada animación cuenta algo.** Hay tres familias:

1. **Cámara por scroll** (`lib/scene.js` + `scenes/*.js`): `render(p)` calcula el fotograma. Zoom en logaritmo con spline monótona
   (sin rebotes), trazos que se dibujan (`stroke-dashoffset`), morph numérico línea→ceja, transformaciones de cámara SVG,
   shader WebGL, canvas 2D 3D (la joya).
2. **Interacción en vivo:** el esmalte sube desde la cutícula con borde húmedo, la forma de la uña se transforma (Bézier interpolado),
   el brillo cambia según el acabado, la luz sigue al cursor, la tarjeta del vale se inclina en 3D.
3. **Micro-movimiento de interfaz:** revelado por palabras, contadores y estrellas ligados al scroll, barrido de brillo en los CTA,
   pestañas, ficha lateral.

Rendimiento: solo `transform`/`opacity` en la mayoría de efectos; SVG vectorial (nítido a ×40 sin imágenes); el shader baja resolución
y octavas en móvil y se degrada solo si los fotogramas tardan; nada corre fuera de pantalla; el pincel de progreso es una sola variable CSS.
Accesibilidad: `prefers-reduced-motion` → versión estática; todo contenido existe en el DOM; foco visible; `dialog` nativo.

## 6. Estrategia de conversión

Objetivo único: **PEDIR CITA → Booksy.** 44 puntos de entrada, cada uno medible (`data-track`, `data-loc`, `data-svc`).

| Momento | CTA | Evento |
|---|---|---|
| Cabecera (siempre) | Pedir cita | `reservation_click` · `header` |
| Portada | Pedir cita (uña lacada integrada en la escena) | `reservation_click` · `hero` |
| Manos | Ver servicios · Pedir cita | `service_view` / `reservation_click` · `manos` |
| Diseñador | Quiero este diseño (WhatsApp con el look) · Pedir cita | `whatsapp_click` / `reservation_click` · `disena_tu_look` |
| Pies · Cejas · Piercing | Descubrir … · Reservar este servicio | `service_view` / `reservation_click` |
| Servicios | Reservar este servicio (por categoría) | `reservation_click` · `servicios` |
| Tarifas | Pedir cita (por fila y en la ficha) | `reservation_click` · `tarifas` + servicio |
| Equipo | Conoce nuestros servicios | `service_view` · `nosotras` |
| Vales | Regalar una experiencia · Crear vale | `gift_voucher_click` (start / submit) |
| Eventos | Organiza tu experiencia (WhatsApp) | `whatsapp_click` · `eventos` |
| Móvil | Barra fija Llamar · WhatsApp · Pedir cita | `phone_click` / `whatsapp_click` / `reservation_click` |
| Final | PEDIR CITA (el CTA definitivo) | `reservation_click` · `final` |

Eventos para GA4/GTM: `reservation_click`, `phone_click`, `whatsapp_click`, `gift_voucher_click`, `contact_form_submit`,
`service_view`, `pricing_view` (+ `instagram_click`, `maps_click`). Todos llevan `location` (sección), y los de servicio, `service` (id).
Con GTM se responde a: ¿qué sección genera más reservas? (`location`), ¿qué servicio interesa más? (`service`), ¿desde dónde se hace clic en Booksy? (`location`).

Confianza antes de reservar: valoración 5,0 · 291 reseñas visibles ya en la portada, bloque de seguridad, equipo real, precios y duraciones claros,
FAQ con datos reales. Sin urgencias falsas, sin testimonios inventados.
