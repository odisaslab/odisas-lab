# Auditoría previa a publicación

Fecha: 10/09/2026

Revisión estática del proyecto: contraste, accesibilidad, estructura de encabezados,
metadatos y enlaces. Al final está lo que **no** se ha podido verificar y por qué.

---

## Resumen

| Área | Antes | Después |
| --- | --- | --- |
| Contraste WCAG AA | 10 fallos de 20 pares | 0 fallos |
| Jerarquía de encabezados | 1 salto de nivel | correcta en las 9 rutas |
| Enlaces internos roto | 0 | 0 |
| Imágenes sin `alt` | 0 | 0 |
| Campos de formulario sin `label` | 0 | 0 |
| `onClick` en elementos no interactivos | 0 | 0 |
| Metadatos duplicados | 0 | 0 |

---

## 1. Contraste: el hallazgo importante

El naranja de marca `#FF6B00` tiene una luminancia que **no alcanza el mínimo de
WCAG AA en dos usos muy habituales**:

- Como texto sobre blanco: **2.86:1** (mínimo 4.5)
- Con texto blanco encima: **2.86:1** (mínimo 4.5, y tampoco llega al 3.0 de texto grande)

Esto afectaba al botón primario, al bloque CTA, a todas las etiquetas de sección,
a la numeración de los pasos, a los mensajes de error del formulario y a las palabras
destacadas de los titulares. Lighthouse lo habría marcado y habría hundido la
puntuación de accesibilidad que pide la especificación (95+).

### Cómo se ha resuelto

La solución mantiene la identidad naranja y separa dos usos del color:

| Token | Valor | Para qué |
| --- | --- | --- |
| `--color-primary` | `#FF6B00` | Rellenos, iconos, barras, reglas, puntos, fondos |
| `--color-primary-ink` | `#BA4E00` | Texto naranja sobre fondo claro |

Y el texto que va **encima** del naranja pasa de blanco a antracita (`#171717`),
que da 6.28:1.

Decisiones concretas:

- **Botón primario**: naranja con texto antracita. Se lee mejor y da un aspecto más
  actual que el blanco sobre naranja.
- **Bloque CTA**: caja naranja con titular y texto en antracita.
- **Etiquetas, numeración, errores y palabras destacadas** sobre fondo claro: naranja
  oscurecido `#BA4E00`. Sigue leyéndose como naranja de marca, más profundo.
- **Naranja puro sobre fondo antracita**: se mantiene. Ahí da 6.28:1 y cumple sin
  cambios, así que las secciones oscuras conservan el naranja vivo.
- **Iconos y gráficos decorativos**: mantienen `#FF6B00`. Van con `aria-hidden` y
  acompañados de texto, así que no son contenido que haya que descifrar por color.
- **Logotipo**: mantiene el naranja puro. WCAG 1.4.3 exceptúa expresamente los
  logotipos y nombres de marca.

Otros ajustes menores del mismo bloque:

- El `placeholder` de los campos del formulario pasó de gris al 60% (2.43:1) a gris
  completo (5.33:1).
- El copyright del pie pasó de blanco al 45% (4.48:1) a blanco al 60% (7.02:1).
- La nota del comparador antes/después pasó de gris al 80% (3.50:1) a gris completo.
- El borde del botón de contorno sobre naranja pasó a antracita al 70%, para cumplir
  el 3:1 que exige WCAG 1.4.11 para componentes de interfaz.

Todo esto es verificable en cualquier momento:

```bash
python3 scripts/auditoria-contraste.py
```

El script devuelve código de salida 1 si alguna combinación incumple, así que sirve
para un hook de git o para CI.

---

## 2. Jerarquía de encabezados

Un fallo real: en `/servicios`, el grid de tarjetas saltaba de `h1` a `h3`, porque la
sección no tenía encabezado propio. Corregido con un `h2` para lectores de pantalla
(`sr-only`): el `h1` ya describe la sección visualmente, así que un encabezado visible
habría sido redundante.

Las nueve rutas tienen ahora exactamente un `h1` y ningún salto de nivel.

---

## 3. Accesibilidad revisada

Verificado por inspección del código:

- Todos los elementos interactivos son `<button>` o `<a>` reales. No hay ni un `onClick`
  sobre un `div` o un `span`, así que todo es alcanzable con teclado y anunciable.
- Todos los botones tienen texto visible o `aria-label` (el de menú y el de cerrar el
  panel de cookies usan `aria-label`).
- Los 10 campos del formulario tienen su `label` asociado por `htmlFor`, más
  `aria-invalid` y `aria-describedby` cuando hay error, y los mensajes de error usan
  `role="alert"`.
- El comparador antes/después usa un `input type="range"` real: funciona con flechas,
  Inicio y Fin, y tiene `aria-valuetext` con el porcentaje.
- El acordeón de FAQ usa `details`/`summary` nativos: funciona sin JavaScript.
- Enlace "Saltar al contenido" al inicio del `body`.
- `:focus-visible` con contorno naranja de 3px y separación, en toda la web.
- `prefers-reduced-motion` respetado: se desactivan las animaciones, el desplazamiento
  suave y la banda en movimiento.
- Los iconos decorativos van con `aria-hidden`, directamente o heredado de un
  contenedor que ya lo tiene.
- El banner de cookies es `role="dialog"` no modal, cerrable con Escape en su panel de
  configuración y con la misma jerarquía visual para aceptar y rechazar.

---

## 4. SEO técnico

- Las 9 rutas tienen `title` y `description` únicos. Las 7 páginas de servicio los
  generan desde sus propios datos.
- Ningún enlace interno apunta a una ruta inexistente.
- Datos estructurados: `ProfessionalService`, `WebSite`, `FAQPage`, `Service`,
  `OfferCatalog`, `AboutPage`, `HowTo`, `ContactPage`, `WebPage`, `ItemList` y
  `BreadcrumbList`, todos con datos verdaderos.
- `robots.ts` permite el rastreo completo y apunta al sitemap.
- Las páginas legales van con `noindex` y fuera del sitemap hasta que se completen los
  datos del titular.
- La página 404 va con `noindex`.
- Imagen Open Graph con su texto alternativo en `opengraph-image.alt.txt`.

---

## 5. Lo que NO se ha podido verificar

Con honestidad, porque importa saber qué queda por comprobar en tu máquina.

Este entorno no tiene acceso a red, así que **no se ha podido ejecutar
`npm install`** y, por tanto, tampoco:

- [ ] `npm run typecheck` — TypeScript sin errores
- [ ] `npm run build` — que el build de producción compile
- [ ] Auditoría Lighthouse real (Performance, Accessibility, Best Practices, SEO)
- [ ] Core Web Vitals con datos reales
- [ ] Comprobación en navegadores (Chrome, Safari, Firefox) y en móvil físico
- [ ] Prueba con un lector de pantalla real (NVDA, VoiceOver)
- [ ] Recorrido completo con teclado en el navegador

Todo lo anterior de este informe es revisión estática: cálculo de contraste sobre los
valores reales de la paleta e inspección del código. Es fiable en lo que mide, pero no
sustituye a un build.

### Qué ejecutar en tu ordenador

```bash
npm install
npm run typecheck     # si sale algún error de tipos, pásame la consola
npm run build         # debe terminar sin errores
npm run dev           # y revisa la web en el navegador
```

Después, con la web servida, pasa Lighthouse desde las DevTools de Chrome
(pestaña Lighthouse, modo escritorio y modo móvil).

Si algo falla, mándame la salida y lo corrijo.
