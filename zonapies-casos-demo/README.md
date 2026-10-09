# Zona Pies · Casos · Demo navegable

Maqueta de la app «Casos» para enseñársela a Zona Pies **antes** de construir la versión real. La construye Odisas Lab.

> **Todo está simulado salvo la geometría de la plantilla.** La propia demo lo dice (cinta «DEMO» en todas las pantallas y la vista «Qué es real»). No hay servidor, base de datos, autenticación ni llamadas a ninguna IA: todo ocurre en el navegador y no sale ningún dato.

Documentos relacionados:

- `GUION-PRESENTACION.md`: guion de la reunión (≈ 15 min) y preguntas para el cliente.
- `DEMO-A-APP-REAL.md`: qué pieza de la demo pasa a ser real y con qué.
- `../docs/zona-pies/PROMPT-app-casos.md`: la app completa que esta demo anticipa.

## Arrancar

```bash
cd zonapies-casos-demo
npm install
npm run dev        # http://localhost:3300 (desarrollo)
```

### Sin conexión (para la reunión)

```bash
npm run build      # exporta la demo estática a out/
npm run serve      # sirve out/ en http://localhost:3300, sin red
```

La demo no hace **ninguna petición a dominios externos** (sin CDN, fuentes remotas ni analítica): la prueba automática lo comprueba. Las fuentes (Geist) van incluidas.

## Cómo se usa

1. Pulsa **Presentación guiada** (o «Empezar la presentación guiada» en Inicio). Aparece un panel con el guion de cada paso, un campo de notas y un «¿Cuadra con vuestro proceso?». Las teclas ← → cambian de paso.
2. Cada paso cambia de vista y resalta el elemento. Si saltas pasos, **«Preparar el caso hasta aquí»** lleva el caso simulado hasta el punto necesario sin hacer los pasos anteriores.
3. **Exportar notas (.md)** descarga un resumen con las notas y respuestas de la reunión, listo para pegar en el documento de requisitos.
4. **Reiniciar demo** vuelve la simulación al principio. **Conserva las notas y respuestas de la reunión** (para no perder lo que diga el cliente); se borran con «Borrar notas» en la vista «Qué es real».
5. El estado se guarda en `sessionStorage`: sobrevive a recargar la página y se pierde al cerrar la pestaña.

También se puede navegar libremente sin presentación: Inicio, Profesional (móvil), Laboratorio, Dueño y «Qué es real».

## Qué es real y qué es simulado

| Pieza | En la demo |
|---|---|
| Diseño de la plantilla (sliders, mapa de calor, avisos, versiones, comparación) | **Real**: se calcula en el navegador. Es una aproximación en JavaScript, no anatómica |
| STL exportado y hoja de fabricación | **Real** (malla cerrada comprobada), pero ilustrativos y **no aptos para fabricar** |
| Medidas de un STL propio (largo, ancho, malla cerrada) | **Real** (función opcional: «Cargar un STL propio») |
| Resto del análisis del escaneo | Simulado: dos escaneos sintéticos con comprobaciones de ejemplo |
| «Interpretar mensaje» | Simulado: texto y resultado fijos |
| Reglas de coherencia, propuesta de especificación y perfiles de proceso | Ejemplo, **no clínicos** y marcados como pendientes de validar |
| Envío, avisos por correo, enlace público | Simulado |
| Panel del dueño | Datos de ejemplo con leyenda en pantalla; solo el caso que simulas es real |

**Reglas de contenido de la demo:** ninguna cifra de ahorro, mejora ni plazo; ningún nombre real de personas ni de pacientes (solo iniciales y clínica/profesional ficticios); todo diseño es un *borrador* hasta que el técnico lo aprueba y solo entonces se puede exportar.

## Desplegarla como sitio estático (documentado, no realizado)

La demo es un sitio estático (`output: "export"`): `npm run build` deja el resultado en `out/`.

1. Crear un proyecto en Vercel con **Root Directory = `zonapies-casos-demo`** y framework Next.js.
2. **No dejarla pública.** Opciones de protección de Vercel (según el plan): Vercel Authentication, enlaces compartidos o contraseña. Comprueba en la documentación de Vercel qué incluye vuestro plan. Alternativa sin nube: abrirla en local con `npm run serve` durante la reunión.
3. Ya lleva `robots: noindex` en todas las páginas y `public/robots.txt` con `Disallow: /`. Es una medida de cortesía con los buscadores, **no** de seguridad.

## Estructura

```
app/                  layout (metadatos noindex), página única, estilos y tokens
components/
  Shell.tsx           cinta DEMO, cabecera y cambio de vista
  TourPanel.tsx       presentación guiada: guion, notas y cuestionario
  views/              Inicio, Profesional (móvil), Laboratorio (+ lab/), Dueño, Acerca
  three/              motor Three.js (carga perezosa), visor del escaneo y del editor
  ThicknessMap.tsx    mapa de grosor 2D (misma malla que el 3D)
  ManufacturingSheet  hoja de fabricación imprimible
lib/
  geometry.ts         pie sintético + generador paramétrico + STL (módulo puro)
  domain.ts           estados, causas y parámetros (mismos nombres que la app real)
  caseLogic.ts        transiciones del caso (funciones puras)
  rules.ts            reglas de EJEMPLO (no clínicas)
  content.ts          casos ficticios, datos del panel, guion y textos de transparencia
  store.tsx           estado + persistencia en sessionStorage
scripts/              pruebas y utilidades (ver abajo)
```

## La geometría

`lib/geometry.ts` es un módulo sin dependencias:

- **Pie sintético** (`buildFootMesh`): contorno plantar con curvas PCHIP, arco medial y elevación de dedos. Es **geométrico, no anatómico**, y los defectos de los escaneos de ejemplo (hueco bajo el talón) son un recorte de la malla.
- **Ortesis paramétrica** (`computeInsole`): malla de 150 × 44 puntos cuya cara superior es la suma de base + arco + elevación de talón + cazoleta + barra retrocapital + cuñas, con contorno redondeado. Cara inferior plana, paredes y tapas para obtener una malla **cerrada**.
- **Exportación** (`insoleToSTL`): STL binario, unidades en mm. Se ejecuta en el momento (≈ ms por regeneración).

Los rangos de los parámetros y el perfil de proceso (grosor mínimo por ruta) son **valores de ejemplo**. Hay que calibrarlos con escaneos reales del escáner de Zona Pies antes de la app real.

## Pruebas

```bash
npm run typecheck         # TypeScript estricto
npm run lint              # ESLint (next/core-web-vitals + typescript)
npm run check:geometry    # geometría en Node: malla cerrada, orientación, NaN, STL
npm run build && npm run test:e2e
```

`test:e2e` abre la demo estática en Chromium (WebGL por software) y comprueba: el recorrido completo (escaneo A rojo → B verde → aclaración → especificación → diseño con sliders, avisos y versiones → aprobación → exportación de un STL real → hoja → avance hasta «Entregado» → panel del dueño), el STL descargado como malla cerrada (`scripts/verify-stl.mjs`), la carga de un STL propio, la presentación guiada completa, la persistencia al recargar, el reinicio, la **ausencia de peticiones externas**, **cero errores de consola**, **sin desbordes a 390 y 1440 px** y **axe-core (WCAG 2.2 AA) sin violaciones** en todas las vistas principales. Guarda capturas en `test-results/` (ignorado por Git).

La ruta de Chromium se puede cambiar con `CHROMIUM_PATH`.

## Limitaciones conocidas

- El pie y los escaneos de ejemplo son sintéticos; el diseño no es apto para fabricar.
- Un STL propio solo se visualiza en la vista del profesional (no se guarda al recargar).
- Sin WebGL, los visores muestran una vista 2D y el mapa de grosor sigue disponible.
- No se ha medido Lighthouse ni probado en dispositivos móviles físicos.
- La demo no sustituye ninguna validación clínica ni regulatoria.
