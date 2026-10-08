# PROMPT · Demo navegable de la app «Casos» de Zona Pies

Demo para enseñar al cliente **antes** de construir la app real. Todo simulado, sin servidor, con guion de presentación y recogida de opinión durante la reunión.

**Cómo usarlo:** abre una sesión nueva de Claude Code en el repositorio `odisaslab/odisas-lab`, pega todo lo que hay debajo de la línea `=== PROMPT ===` y, cuando quieras que arranque, escribe `EMPIEZA`. (Si prefieres que arranque sin esperar, borra la sección 0.)

Este prompt es independiente del de la app completa (`docs/zona-pies/PROMPT-app-casos.md`), pero lo usa como referencia del producto final.

=== PROMPT ===

## 0. Instrucción de arranque

Lee este mensaje completo y, después, lee `docs/zona-pies/PROMPT-app-casos.md` (la app real que esta demo anticipa; en especial las secciones 5, 6 y 7). **No escribas código ni crees ficheros todavía.** Responde solo con:

1. En 5–8 líneas, qué has entendido.
2. Como máximo 5 preguntas que de verdad bloqueen el trabajo. Si una no bloquea, asume un valor por defecto razonable y apúntalo en «decisiones asumidas».

Después espera a que el usuario escriba `EMPIEZA`. Cuando lo haga, ejecuta todo sin pedir confirmación en cada paso.

## 1. Objetivo

Construye una **demo navegable** de la app «Casos» para presentársela a **Zona Pies** (laboratorio de ortesis plantares a medida en Fuenlabrada, Madrid; clientes: podólogos y clínicas). La construye **Odisas Lab**.

**Para qué sirve:** que el cliente vea y toque cómo funcionaría la herramienta con su proceso, y decida si le encaja antes de invertir en la versión real. Por tanto la demo debe:

1. **Contar la historia entera en 10–15 minutos**, con un guion guiado.
2. **Sentirse real**: pantallas completas, interacciones fluidas, un visor 3D convincente.
3. **Ser honesta**: todo lo que está simulado se dice dentro de la propia demo. Nunca debe dar a entender que algo ya funciona si no es así.
4. **Recoger la opinión del cliente** durante la reunión (qué cuadra, qué no, qué falta).
5. **Ser reutilizable**: si el cliente acepta, el diseño visual, los textos, los estados y los nombres de las pantallas pasan a la app real.

## 2. Qué se simula y qué no

**Se simula (todo en el navegador, sin servidor, sin base de datos, sin llamadas a ninguna IA):**

- El envío del caso y el análisis del escaneo y de la prescripción.
- La «IA» que lee texto libre y redacta preguntas: respuestas guionizadas.
- La propuesta de especificación de fabricación.
- Los avisos por correo y los datos del panel.

**Es real dentro de la demo (se calcula de verdad en el navegador):**

- La **generación geométrica del borrador de plantilla**: sliders que modifican la ortesis en 3D al instante, mapa de calor de grosor, exportación de un STL real.
- Las medidas básicas de un archivo STL que el usuario suba (largo, ancho, plausibilidad de escala, si la malla es estanca) en la función opcional de la sección 6.

Todo lo demás es ilustrativo. **Es una aproximación en JavaScript**: la versión real la haría un servicio de geometría en Python.

## 3. Reglas innegociables

1. **Transparencia permanente.** Una cinta visible en toda la demo: «DEMO · datos y análisis simulados». Una pantalla «Qué es real y qué es simulado» accesible desde el menú (ver sección 6, paso 9).
2. **Nada inventado sobre Zona Pies.** Ninguna cifra de rendimiento, ahorro, mejora porcentual, plazo ni resultado «esperado». El panel del dueño usa datos de ejemplo con la leyenda «Ejemplo ilustrativo, no son datos de Zona Pies», y la demo no contiene ninguna promesa de ROI.
3. **Nada clínico presentado como válido.** Las reglas, materiales y parámetros son ejemplos marcados (`validated: false`) y se rotulan como «pendiente de validar por Zona Pies». Todo diseño se llama **borrador** hasta que el técnico lo aprueba.
4. **Datos de ejemplo claramente ficticios.** Clínica y profesionales ficticios («Clínica Ejemplo», «Marta, podóloga (ejemplo)»), pacientes solo con iniciales o código. No uses nombres, teléfonos ni correos reales de personas ni de clientes.
5. **Cero red externa en tiempo de ejecución** (ni CDN, ni fuentes remotas, ni analítica). La demo funciona sin conexión en un portátil durante la reunión. Compruébalo con Playwright.
6. **Calidad por encima de cantidad.** Es mejor un recorrido corto y pulido que muchas pantallas a medias.
7. Interfaz **en español**, tuteo, accesible (WCAG 2.2 AA). Estados comunicados con **icono + texto**, nunca solo con color.
8. La demo no se indexa: `robots: noindex` en todas las páginas.

## 4. Stack y estructura

Crea una app independiente en `zonapies-casos-demo/` (propio `package.json`, puerto de desarrollo 3300). No toques `zonapies/` ni la web raíz, salvo añadir la nueva carpeta al `exclude` del `tsconfig.json` raíz (igual que ya está `zonapies`; ver el commit `e0ba750`).

- **Next.js 15, TypeScript estricto, Tailwind CSS 4, Three.js, Geist autoalojada** (mismas dependencias y convenciones que `zonapies/`; léete `zonapies/README.md`, `zonapies/DISENO.md` y `zonapies/components/scene/shape.ts` para el patrón de escena procedural y de carga perezosa).
- **Exportación estática** (`output: "export"`): sin rutas API, sin funciones de servidor, sin `ImageResponse`. `images.unoptimized: true` si usas imágenes.
- **Estado de la demo:** un almacén en memoria (contexto de React o similar) persistido en `sessionStorage`, de modo que lo que haces en la vista «Profesional» aparece en las vistas «Laboratorio» y «Dueño». Botón visible **Reiniciar demo**.
- **Identidad:** paleta provisional de `zonapies/app/globals.css` (`brand #0A7068`, `signal #3EE6C9`, fondos `ink` y `bone`), sobria, tipo herramienta de trabajo y sin animaciones decorativas. Pie de página: «Preparado para Zona Pies por Odisas Lab».
- **Reutilización:** mantén en módulos separados, con los **mismos nombres** que en `PROMPT-app-casos.md`, los estados del caso (`borrador`, `enviado`, `escaneo_a_repetir`, `esperando_aclaracion`, `validado`, `diseno_borrador`, `diseno_aprobado`, `en_fabricacion`, `control_calidad`, `expedido`, `entregado`), las causas de incidencia y los parámetros de diseño. Así la app real los hereda sin renombrar.

## 5. Las tres vistas

Un selector fijo arriba: **Profesional · Laboratorio · Dueño** (cambia de vista sin recargar y conserva el estado).

- **Profesional:** móvil primero. En pantallas anchas se muestra dentro de un marco de teléfono para que se vea como lo usaría en su consulta.
- **Laboratorio:** escritorio. Lista de casos, ficha, editor de diseño.
- **Dueño:** panel de métricas con datos de ejemplo.

## 6. El recorrido (guion en 9 pasos)

Un **modo presentación** activable con un botón: panel lateral o inferior con el paso actual, el texto que dice quien presenta, botones Anterior / Siguiente (y teclas ← →), y que **cambia de vista y resalta el elemento** de cada paso. Debe poder apagarse para navegar libremente.

1. **El problema hoy.** Pantalla de apertura con un guion gráfico sencillo (WhatsApp, llamadas, escaneo repetido, plazo que se rompe), sin cifras. Pregunta al cliente: «¿Os pasa esto?».
2. **El profesional crea el caso** (móvil): pie izquierdo/derecho, subir escaneo, tipo de plantilla, peso, calzado, actividad. Menús, no texto libre. Con la opción de **pegar un mensaje desordenado** y ver cómo se rellena la ficha (guionizado).
3. **El semáforo del escaneo.** Botones «Usar escaneo de ejemplo A (con fallo)» y «B (correcto)». El A muestra **rojo** con el visor 3D marcando la zona del talón sin cubrir y el mensaje «Repite el escaneo ahora: el paciente sigue contigo». Al elegir B, pasa a **verde** con sus comprobaciones.
4. **Aclaración.** Aparece una pregunta en el propio caso (ejemplo: «Indicas uso deportivo intenso con un material muy blando. ¿Lo mantienes?») con botones de respuesta rápida. Estado `esperando_aclaracion` → `validado`.
5. **Laboratorio: lista y ficha.** El caso aparece en la lista por colores. Al abrirlo: escaneo en 3D, prescripción estructurada y **propuesta de especificación** (ruta, material, forro, largo) con **Aceptar / Cambiar**.
6. **Diseño de la plantilla** (el momento central). Editor 3D: escaneo translúcido + ortesis sólida + mapa de calor de grosor; sliders y campos numéricos para largo (completa / ¾), margen de contorno, grosor base, arco longitudinal (altura y posición), cazoleta de talón, barra retrocapital, cuña de retropié y antepié, elevación de talón y grosor de forro; avisos (por ejemplo, grosor por debajo del mínimo de un proceso de ejemplo); historial de versiones. Etiqueta «Borrador generado automáticamente: requiere validación del técnico». **Aprobar** (nombre y fecha ficticios) habilita **Exportar**: descarga un **STL real** generado en el navegador y abre una **hoja de fabricación imprimible** (vista de impresión de una página).
7. **Seguimiento.** Vista del profesional: línea `Recibido ▸ Revisado ▸ Diseño ▸ Fabricando ▸ Controlado ▸ Enviado ▸ Entregado` y un **enlace de estado público** (simulado). Un control de demo «Simular avance» en la vista del laboratorio hace progresar el caso y se refleja en la vista del profesional.
8. **Panel del dueño.** Casos correctos a la primera, bucles por pedido, causas de incidencias, y tiempo por fase (mediana y p90), con datos de ejemplo y la leyenda obligatoria. El caso que acabas de simular aparece como un bucle (escaneo repetido + aclaración) con sus tiempos. Una sección «Qué mediríamos» explica cada indicador sin dar objetivos.
9. **Cierre.** Pantalla «Qué es real y qué es simulado», «Lo que necesitamos de vosotros» (lista de la sección 13 de `PROMPT-app-casos.md`) y el **cuestionario de reunión** (sección 7).

**Funciones por prioridad:**

- **P0:** pasos 2–7 y la pantalla «Qué es real y qué es simulado», más el modo presentación mínimo.
- **P1:** paso 8 (panel), notas y cuestionario de reunión, hoja de fabricación imprimible, exportación de STL.
- **P2 (si hay tiempo y queda impecable):** botón «Cargar un STL propio» que muestra el archivo en el visor y calcula medidas **reales** (largo, ancho, plausibilidad de unidades, malla estanca o no). Todo lo demás de esa carga sigue simulado y la interfaz lo dice. Útil si el cliente trae un escaneo suyo a la reunión.

## 7. Recogida de opinión durante la reunión

- **Notas por pantalla:** un campo de notas en el modo presentación, guardado en `localStorage`.
- **Cuestionario por pantalla:** «¿Cuadra con vuestro proceso?» con tres respuestas (Sí / Habría que ajustarlo / No) y un comentario opcional.
- **Exportar a Markdown:** un botón genera un resumen descargable con todas las notas y respuestas por paso, listo para pegar en el documento de requisitos. Sin enviar nada a ningún servidor.

## 8. Geometría de la plantilla en el navegador

Debe ser **determinista y rápida** (regeneración fluida al mover un slider) y visualmente creíble, sin pretender ser anatómica.

- **Pie sintético:** generador paramétrico en TypeScript (izquierdo y derecho; variantes con defecto: hueco en el talón, antepié truncado). Declara en el README que es geométrico, no anatómico.
- **Ortesis:** a partir del mapa de alturas de la planta del pie sintético, construye la superficie superior = planta suavizada + correcciones aditivas parametrizadas (arco, cazoleta, barra retrocapital, cuñas, elevación), sobre una base plana de grosor configurable, recortada al contorno y al largo elegido. Genera una malla **cerrada** (laterales y fondo incluidos).
- **Mapa de calor de grosor** con colores de la paleta y leyenda en mm.
- **Exportación:** STL binario real de la malla generada, con nombre `caso-<código>-<pie>-v<n>.stl`.
- **Avisos** de ejemplo según un perfil de proceso ficticio y marcado como tal (grosor mínimo, etc.).

## 9. Criterios de aceptación

- `typecheck`, `lint` y `next build` (exportación estática) en verde; pega los comandos y los resultados.
- Una prueba Playwright recorre los pasos 2–7 de principio a fin (escaneo A → rojo → escaneo B → verde → aclaración → aceptar especificación → mover sliders → aprobar → exportar → avanzar estados → ver el cambio en la vista del profesional) sin errores de consola.
- **Cero peticiones a dominios externos** durante el recorrido (comprobado en Playwright).
- Funciona a 390 px y a 1440 px sin desbordes horizontales.
- axe-core sin violaciones en las pantallas principales de cada vista.
- «Reiniciar demo» devuelve todo al estado inicial; el estado sobrevive a recargar la página.
- El STL descargado se abre como malla cerrada (verifícalo con un script que cuente aristas y compruebe que cada una es compartida por dos triángulos).
- La cinta «DEMO», la leyenda de datos de ejemplo del panel y la pantalla «Qué es real y qué es simulado» están presentes.
- Ninguna cifra de mejora o ahorro aparece en ninguna parte (búscalo con `grep`).

## 10. Documentación que debes entregar

1. **`README.md`** de la demo: cómo arrancarla en menos de 5 comandos, cómo usarla sin conexión, y cómo desplegarla como sitio estático **con protección** (contraseña o enlace compartido de Vercel; la demo no debe ser pública ni indexable). **Documenta el despliegue pero no lo hagas.**
2. **`GUION-PRESENTACION.md`:** guion de la reunión de unos 15 minutos, paso a paso, con lo que se dice, lo que se enseña y **las preguntas que hay que hacer al cliente**. Entre ellas: ¿qué escáner usan y en qué formato exporta?, ¿cómo llegan hoy los pedidos?, ¿qué porcentaje aproximado de casos se repite y por qué?, ¿el portal tiene API o exportación?, ¿quién decide la especificación técnica y con qué criterios?, ¿hay requisitos de documentación como producto sanitario a medida?
3. **`DEMO-A-APP-REAL.md`:** tabla de qué pieza de la demo pasa a ser real en la app completa, con qué tecnología y qué necesita del cliente para hacerlo (apunta a las secciones de `PROMPT-app-casos.md`).

## 11. Lo que NO debes hacer

- No construyas servidor, base de datos, autenticación ni llamadas a modelos de lenguaje.
- No modifiques `zonapies/` ni la web raíz (salvo el `exclude` del `tsconfig.json` raíz).
- No crees proyectos en Vercel ni despliegues; no abras pull request salvo que el usuario lo pida.
- No uses datos reales de personas ni de Zona Pies más allá de su nombre de empresa; no inventes cifras ni testimonios.
- No presentes como real nada que sea simulado, ni como clínicamente válido ningún parámetro.
- Si hay skills de diseño disponibles en tu entorno, úsalas para elevar la calidad visual, sin romper las reglas anteriores.

## 12. Informe final

Cuando termines, entrega un informe breve con: qué pantallas y funciones están hechas (P0/P1/P2), la evidencia de verificación (comandos y resultados), decisiones asumidas, limitaciones conocidas y cómo ensayar la presentación.
