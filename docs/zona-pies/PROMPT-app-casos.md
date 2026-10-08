# PROMPT · App «Casos» de Zona Pies

Recepción y validación de casos + propuesta de fabricación + **diseño paramétrico de la plantilla** + seguimiento + panel de métricas.

**Cómo usarlo:** abre una sesión nueva de Claude Code en el repositorio `odisaslab/odisas-lab`, pega todo lo que hay debajo de la línea `=== PROMPT ===` y, cuando quieras que arranque, escribe `EMPIEZA`. (Si prefieres que arranque sin esperar, borra la sección 0.)

=== PROMPT ===

## 0. Instrucción de arranque

Lee este mensaje completo. **No escribas código ni crees ficheros todavía.** Responde solo con:

1. En 5–8 líneas, qué has entendido.
2. Como máximo 5 preguntas que de verdad bloqueen el trabajo. Si una pregunta no bloquea, asume un valor por defecto razonable y apúntalo en una lista de «decisiones asumidas».

Después espera a que el usuario escriba `EMPIEZA`. Cuando lo haga, ejecuta las fases 1–10 completas sin pedir confirmación en cada paso. Solo te detienes si surge algo que necesita una decisión del usuario o un dato que no puedes obtener.

## 1. Rol y objetivo

Eres ingeniero/a senior full-stack con criterio de producto. Vas a construir de principio a fin una aplicación web para **Zona Pies** (ZONAPIES SL, laboratorio de ortesis plantares a medida en Fuenlabrada, Madrid; clientes: podólogos, clínicas, ortopedias; plazo prometido ≈ 3 días hábiles). La construye **Odisas Lab**.

**Problema que resuelve:** los casos (escaneo 3D del pie + prescripción) llegan incompletos o mal capturados y se descubre tarde, lo que rompe el plazo y obliga a repetir escaneos, aclarar por teléfono o rehacer piezas.

**Qué hace la app:**

1. Recibe el caso desde un enlace sencillo (escaneo + ficha guiada).
2. Revisa el escaneo y la prescripción en el momento y devuelve un semáforo con lo que falta.
3. Propone la especificación de fabricación (proceso, material, forro, shell o pieza completa).
4. **Genera un borrador de diseño de la plantilla** a partir del escaneo y la prescripción, que el técnico revisa en 3D, ajusta y aprueba.
5. Informa del estado al profesional en una línea de seguimiento.
6. Mide dónde se pierde el tiempo (panel).

**Hipótesis de partida (deducidas del repositorio, no verificadas con el cliente):** la causa principal de retrasos son bucles de repetición al principio de la cadena. Si los datos del cliente la contradicen, dilo en el informe final; no la ocultes.

## 2. Contexto del repositorio (léelo antes de decidir nada)

El repositorio contiene tres apps independientes, cada una con su `package.json`:

- Raíz: web de Odisas Lab. **No la toques**, salvo añadir la nueva carpeta al `exclude` de su `tsconfig.json` (como ya está hecho con `zonapies` y `odisas-audit`; ver el commit `e0ba750`).
- `zonapies/`: web comercial de Zona Pies (Next.js 15, TypeScript estricto, Tailwind 4, Three.js, Lenis, Geist autoalojada). **No la toques.** Léela para copiar convenciones: `zonapies/README.md`, `zonapies/DISENO.md`, `zonapies/lib/{delivery,mail,rate-limit,clean-env,quote}.ts`, `zonapies/app/api/presupuesto/route.ts`, `zonapies/data/{materials,needs,process,tech}.ts`, `zonapies/components/scene/shape.ts`.
- `odisas-audit/`: herramienta aparte.
- Documento funcional del cliente: `docs/zona-pies/documento-funcional.md`.

**Crea la app nueva en `zonapies-casos/`** (independiente, con su propio `package.json`, puerto de desarrollo 3200). Copia los patrones útiles de `zonapies/lib`; no importes de esa carpeta.

**Lo que consta del negocio (en el repositorio):**

- Tres modos de servicio: *fabricación completa*, *solo el shell*, *«fabrico yo mis plantillas»* (más formación y franquicias). El escaneo lo hace el profesional en su consulta con escáner portátil.
- Materiales: resina, composite, fibra de carbono, EVA, PA11, memory; forros; amortiguación y suspensión. Procesos deducidos de los vídeos de la web (por confirmar): PA11 → impresión 3D; EVA → fresado en 3 densidades; resina → termoconformado.
- Ya existe un portal de clientes en `https://zonapies.azurewebsites.net/` y un «software de prescripción con trazabilidad». **No se reimplementan.** Se dejan adaptadores para conectarlos (ver fase 8). Se desconoce si tienen API.
- La atención al cliente hoy pasa por Gmail, WhatsApp y teléfono. Sin canal de entrega configurado, el formulario actual responde 503 y nunca finge un envío correcto: mantén esa filosofía.

## 3. Reglas innegociables

1. **No inventes.** No hay reglas clínicas, umbrales de material ni cifras de rendimiento validados por Zona Pies. Todo valor de ese tipo vive en configuración editable con `validated: false` y `source: "pendiente de validar por Zona Pies"`, y la interfaz muestra un aviso visible mientras no esté validado (igual que `data/materials.ts` en la web). Las semillas son **ejemplos marcados como tales**. Los límites de plausibilidad física (p. ej. longitud de pie entre 150 y 340 mm) no son clínicos y pueden ir como valores por defecto documentados.
2. **La IA nunca decide nada clínico ni libera nada.** El modelo de lenguaje solo extrae datos de texto y redacta preguntas. Las **reglas deterministas** deciden qué bloquea. Todo diseño es un **borrador** hasta que un técnico lo aprueba con nombre y fecha. No se puede exportar a fabricación un diseño sin aprobar.
3. **No envíes datos identificables al modelo de lenguaje.** Pseudonimiza antes (código de caso o iniciales; nunca nombre completo, DNI, teléfono ni dirección del paciente) y comprueba con tests que el texto enviado está limpio.
4. **Datos de salud (RGPD, art. 9):** región UE para base de datos y archivos, cifrado en reposo, URLs firmadas con caducidad, registro de auditoría, política de retención configurable, sin analítica de terceros dentro del área autenticada.
5. **Honestidad en los resultados:** distingue siempre «verificado» (con la salida del comando que lo prueba) de «supuesto». Si un test falla, dilo con su salida.
6. Interfaz **en español**, tuteo, accesible WCAG 2.2 AA. Cada estado (semáforo, estados del caso) se comunica con **icono + texto**, nunca solo con color.
7. Ante un hueco que depende de datos del cliente, **implementa el contrato y deja un adaptador** o configuración claramente señalada; no dejes un `TODO` que finja funcionar.

## 4. Stack (valores por defecto; puedes cambiar uno justificándolo en el informe)

- **Web:** Next.js 15 (App Router), TypeScript estricto, Tailwind CSS 4, Three.js para el visor 3D (patrón de carga perezosa de `zonapies/components/scene`), Geist autoalojada. Marca provisional: `brand #0A7068`, `signal #3EE6C9`, fondos `ink` / `bone` (tokens de `zonapies/app/globals.css`). Es una herramienta de trabajo: sobria, densa en información y sin animaciones decorativas.
- **Base de datos:** PostgreSQL con Drizzle ORM y migraciones. En local, Postgres por `docker compose`. Documenta el despliegue en una región UE (Neon o Supabase UE son candidatos; no crees recursos externos).
- **Archivos (escaneos, STL, PDFs):** interfaz `Storage` con adaptador de sistema de ficheros para local y adaptador S3-compatible para producción (bucket privado UE, URLs firmadas).
- **Autenticación:** acceso **solo por invitación** (administrador del laboratorio invita a clínicas y técnicos), enlace mágico por email, cookie de sesión `httpOnly`, roles `profesional`, `tecnico`, `admin`. No guardes contraseñas salvo mediante una librería probada. Comprueba permisos a nivel de dato: un profesional solo ve los casos de su clínica.
- **Servicio de geometría (aparte):** Python 3.12 + FastAPI + `trimesh`, `numpy`, `scipy`, `shapely` y `manifold3d` (o equivalente) para análisis y generación de mallas. Dockerfile y tests con `pytest`. No es público: la web lo llama con un secreto compartido en cabecera. Motivo de separarlo: las librerías de malla 3D son pesadas para funciones serverless. El cliente ya usa Azure, así que documenta Azure Container Apps como opción de despliegue.
- **IA:** SDK `@anthropic-ai/sdk`. **Antes de escribir código con la API de Claude, carga la skill `claude-api`.** Modelo configurable por `ANTHROPIC_MODEL` (por defecto `claude-sonnet-5-5`; documenta cuándo conviene `claude-opus-5-5`). Usa salida estructurada con esquema JSON, temperatura baja, prompts en español. Modo `LLM_MODE=mock` para tests y demo sin clave. Si la IA falla o no hay clave, el flujo **no se bloquea**: se cae al formulario guiado y a las reglas.
- **Correo:** copia el patrón de `zonapies/lib/mail.ts` (SMTP o Resend, `MAIL_DEV_OUTBOX` en desarrollo).
- **Pruebas:** Vitest (TypeScript), Pytest (geometría), Playwright (flujo extremo a extremo), axe-core (accesibilidad).

## 5. Modelo de datos (mínimo; amplía si lo justificas)

- `organizations` (clínica o centro), `users` (rol, organización).
- `cases`: código de caso, organización, modo (`fabricacion` | `shell`), estado, paciente seudonimizado (iniciales o código), fechas.
- `scans`: archivo, lado declarado, talla declarada, resultado de validación (JSON con comprobaciones, métricas y regiones problemáticas), estado.
- `prescriptions`: texto original, datos estructurados (JSON validado con esquema), completitud, preguntas pendientes y respuestas.
- `specs`: ruta de fabricación, material, densidad o dureza, grosor, forro, largo (completa o ¾), solo shell o completa, razón de cada propuesta, confirmada por quién.
- `designs`: versiones con parámetros (JSON), archivo STL, malla de vista previa, estadísticas de grosor, avisos, creada por (`sistema` | usuario), aprobada por y cuándo.
- `design_feedback`: cada edición de un técnico (parámetros antes y después) junto con las características de la prescripción. **Solo se guarda; no se entrena nada ahora.** Prepara el terreno para un futuro copiloto de diseño.
- `case_events`: **append-only**. Cada cambio de estado con marca de tiempo y actor. De aquí salen los tiempos por fase.
- `incidents`: tipo (`reescaneo` | `aclaracion` | `retoque` | `rehecho`), causa (`escaneo` | `prescripcion` | `diseno` | `material` | `fabricacion` | `transporte` | `otra`), notas. Sugerencia de causa con IA, confirmada por una persona.
- `rule_sets` (versionados, con `validated` y `source`) y `process_profiles` (restricciones por proceso: grosor mínimo, radio mínimo de fresa, formato de exportación).
- `audit_log` y `notifications`.

**Estados del caso:** `borrador` → `enviado` → (`escaneo_a_repetir` | `esperando_aclaracion`) → `validado` → `diseno_borrador` → `diseno_aprobado` → `en_fabricacion` → `control_calidad` → `expedido` → `entregado`. Define las transiciones permitidas y compruébalas en el servidor.

## 6. Funcionalidad por rol

### Profesional (móvil primero)

- Crear caso: pie izquierdo o derecho, subir escaneo (STL, PLY, OBJ; límite de tamaño), tipo de plantilla, peso, calzado, actividad, observaciones. Menús en lugar de texto libre; opción de pegar un mensaje desordenado para que la IA rellene la ficha, siempre con revisión del usuario antes de enviar.
- **Semáforo del escaneo en segundos**, con el visor 3D marcando la región problemática (p. ej. talón sin cubrir) y la instrucción concreta («repite el escaneo ahora»).
- Preguntas de aclaración dentro del propio caso, con botones de respuesta rápida.
- Línea de seguimiento y **enlace de estado** público con token no adivinable que no muestra ningún dato personal.
- Avisos por correo (deja la interfaz de canal preparada para añadir WhatsApp más adelante; no lo integres ahora).

### Técnico del laboratorio

- Lista de casos por color/estado, filtros, y tiempo en la fase actual.
- Ficha de caso: escaneo en 3D, prescripción estructurada, preguntas, propuesta de especificación con botones **Aceptar / Cambiar** (cada cambio se registra en `design_feedback` y `audit_log`).
- **Editor de diseño de plantilla** (sección 7).
- Registrar controles de calidad, incidencias y reproceso; marcar expedido.

### Administrador / dueño

- Invitar usuarios y clínicas.
- **Editor de reglas** (con historial de versiones y marca de validación) y de perfiles de proceso.
- **Panel:** casos correctos a la primera, bucles por pedido, causas de las incidencias, horas desde el envío hasta «listo para producir», plazo total y por fase (mediana y percentil 90), llamadas o mensajes evitados si se registran. **Sin objetivos numéricos inventados**: muestra la línea base cuando haya datos.

## 7. Módulo «Diseño de la plantilla» (parametrizado, no «IA mágica»)

**Qué es:** un generador paramétrico que, a partir del escaneo validado y de los parámetros de la prescripción, produce un **borrador** de ortesis plantar (malla cerrada, lista para fabricar) que el técnico revisa y ajusta. La IA interviene solo para convertir la prescripción en parámetros iniciales; la geometría la produce un algoritmo determinista y reproducible. **No entrenes ningún modelo.** No hay histórico: lo que sí haces es registrar las ediciones del técnico para un futuro copiloto.

**Servicio de geometría (FastAPI), contratos mínimos:**

- `POST /validate-scan` → entrada: archivo, lado declarado, talla declarada. Salida: `{status, checks:[{id,label,status,detail,region?}], metrics:{length_mm,width_mm,...}, problem_regions:[...]}`.
- `POST /generate-insole` → entrada: referencia al escaneo + parámetros + perfil de proceso. Salida: `{stl_url, preview_mesh, thickness_stats, warnings}`.
- `GET /health`.

**Pasos del algoritmo (afínalos con datos sintéticos y documenta lo que cambies):**

1. **Preparación:** cargar la malla, detectar unidades (si la longitud no cae en rango plausible, avisar), fusionar vértices, eliminar degenerados, rellenar huecos pequeños, quedarse con el mayor componente, comprobar si es estanca.
2. **Orientación:** ejes con PCA (talón → antepié) y normal plantar; detectar pie izquierdo o derecho por asimetría medial y comparar con el lado declarado (si no coincide, aviso).
3. **Superficie plantar:** extraer el mapa de alturas z(x, y) por trazado de rayos desde abajo, a 1 mm de resolución.
4. **Contorno:** máscara de la proyección plantar → polígono (`shapely`), suavizado, desplazamiento (parámetro de margen) y recorte según el largo (completa o ¾; el punto del ¾ es parámetro configurable).
5. **Cuerpo de la ortesis:** base plana a grosor `base_thickness_mm`; cara superior = superficie plantar suavizada + correcciones aditivas parametrizadas.
6. **Correcciones (todas en mm o grados, con valor por defecto 0 y rangos configurables):** altura y posición del arco longitudinal, profundidad y paredes de la cazoleta de talón, barra o botón retrocapital (altura, posición, anchura), cuñas de retropié y antepié (varo/valgo en grados), elevación de talón, zonas de descarga (lista de x, y, radio, profundidad), grosor del forro.
7. **Mallado:** generar un sólido cerrado y múltiple (*manifold*), comprobar volumen positivo y grosor mínimo según el perfil de proceso, y exportar STL.
8. **Avisos:** grosor por debajo del mínimo del proceso, radio cóncavo menor que el de la fresa, voladizos problemáticos, lado incoherente, escala sospechosa.

**Visor y editor en la web:**

- Escaneo translúcido + ortesis sólida + mapa de calor de grosor; orbitar, activar capas y comparar versiones.
- Sliders y campos numéricos para cada parámetro con regeneración (con *debounce*) y estado de carga; historial de versiones.
- Botón **Aprobar** (guarda quién y cuándo). Solo entonces se habilita **Exportar**: STL + `parametros.json` + **hoja de fabricación en PDF** de una página (código de caso, lado, material, proceso, mapa de grosor, parámetros, aprobador).
- Etiqueta permanente «Borrador generado automáticamente: requiere validación del técnico» hasta la aprobación.

**Datos de prueba:** no hay escaneos reales. Crea `scripts/make_synthetic_foot.py`, un generador paramétrico de pies sintéticos (izquierdo y derecho, con defectos opcionales: hueco en el talón, antepié truncado, escala errónea). Úsalo para tests, demo y semillas. Declara en el README que **es geométrico, no anatómico**, y que los parámetros por defecto del módulo hay que calibrarlos con escaneos reales del escáner de Zona Pies.

## 8. Integraciones (adaptadores, sin inventar APIs)

- **Salida de casos:** webhook configurable (`CASE_READY_WEBHOOK_URL`) y exportación CSV. Mismo contrato que `deliverToTeam`: si no hay canal configurado, falla de forma visible; nunca finge un envío.
- **Portal actual (Azure):** define una interfaz `PortalAdapter` (`pushOrder`, `getStatus`) con una implementación «sin conexión» que escribe en el webhook o CSV. Documenta qué haría falta del portal (API o exportación) para implementarla de verdad.
- **Canal de WhatsApp:** solo la interfaz `NotificationChannel`; la implementación activa es correo.

## 9. Seguridad

Validación de archivos subidos (tamaño, tipo, parseo dentro del servicio de geometría con límites de tiempo y memoria, nunca ejecutar nada), limitación de peticiones (patrón de `lib/rate-limit.ts`), protección CSRF, cabeceras de seguridad (copia las de `zonapies/next.config.mjs` y adáptalas), tokens de estado no adivinables, comprobación de permisos en el servidor en cada ruta y acción, registro de auditoría de accesos a casos, y revisión final con la skill `security-review`.

## 10. Fases y entregables

Trabaja en este orden. **Al cerrar cada fase:** ejecuta `typecheck`, los tests de esa fase y, si procede, `next build`; haz un commit pequeño y descriptivo en la rama de trabajo que te indique la sesión.

1. **Cimientos:** carpeta `zonapies-casos/`, configuración, Docker Compose (Postgres + servicio de geometría), esquema y migraciones, autenticación por invitación con roles, sistema de diseño básico, `.env.example` documentado (con `clean-env` para valores vacíos).
2. **Caso y archivos:** crear caso, subida de escaneo, almacenamiento con URLs firmadas, seudonimización, máquina de estados con eventos.
3. **Servicio de geometría, validación:** `/validate-scan`, generador de pies sintéticos, visor 3D con regiones problemáticas, semáforo.
4. **Prescripción:** esquema estructurado, extracción con IA desde texto libre o PDF (con `LLM_MODE=mock` y un conjunto de ≥20 prescripciones sintéticas en español para evaluar), reglas de completitud y coherencia, generación de preguntas, bucle de respuestas.
5. **Especificación:** propuesta por reglas (ruta, material, forro, largo), confirmación del técnico y registro de cambios.
6. **Diseño de plantilla:** `/generate-insole`, editor 3D, versiones, aprobación, exportación STL + PDF, `design_feedback`.
7. **Seguimiento y avisos:** línea de estado, enlace público, correos, panel del laboratorio.
8. **Incidencias y panel del dueño:** codificación de causas, métricas, tiempos por fase (mediana y p90). Adaptadores de integración.
9. **Reglas y administración:** editor de reglas y de perfiles de proceso con versiones, invitaciones, avisos de «no validado».
10. **Endurecimiento y entrega:** seguridad, accesibilidad (axe sin violaciones en las pantallas principales), prueba Playwright del flujo completo, README, documento de despliegue.

**Flujo extremo a extremo que debe pasar en Playwright:** un profesional envía un caso con escaneo defectuoso → recibe rojo con la región marcada → sube uno correcto → verde → responde una aclaración → el técnico acepta la especificación → revisa y ajusta el diseño → lo aprueba → exporta → el caso avanza hasta «entregado» → el panel refleja el bucle y los tiempos.

## 11. Criterios de aceptación

- `typecheck`, `lint`, `next build`, `vitest`, `pytest` y `playwright` en verde (pega los comandos y resultados en el informe).
- Cero violaciones axe en: inicio de sesión, crear caso, semáforo, ficha del técnico, editor de diseño y panel.
- Ningún texto enviado al modelo contiene datos identificables (test automatizado).
- Un diseño sin aprobar no puede exportarse (test).
- Un profesional no puede leer casos de otra clínica (test).
- Todas las reglas y perfiles semilla tienen `validated: false` y la interfaz lo muestra.
- La app funciona sin clave de IA (modo degradado) y sin integraciones configuradas.
- README con arranque en menos de 5 comandos, variables de entorno y cómo sustituir los datos sintéticos por reales.

## 12. Lo que NO debes hacer

- No modifiques `zonapies/` ni la web raíz (salvo el `exclude` del `tsconfig.json` raíz).
- No crees proyectos en Vercel, bases de datos en la nube, buckets ni claves reales; no despliegues. Deja la documentación.
- No abras pull request salvo que el usuario lo pida.
- No presentes como clínicamente válido ningún parámetro, regla ni diseño.
- No entrenes ni simules «aprendizaje»; solo registra datos.
- No dejes funciones vacías que aparenten funcionar.

## 13. Entradas pendientes del cliente (déjalas listadas en el README)

1. Marca y modelo del escáner y formato de exportación; **3–5 escaneos reales** de muestra (pueden ser anonimizados).
2. Formulario o formato real de la prescripción.
3. Reglas de decisión de los técnicos (qué revisan a ojo y qué bloquea un caso).
4. Por proceso (PA11, EVA, resina, carbono, composite, memory): grosor mínimo, radio mínimo de fresa, formato de entrega, restricciones.
5. Cómo se define el largo ¾ y los contornos de calzado que usan.
6. Documentación o exportación del portal actual (API, base de datos o CSV).
7. Si fabrican como producto sanitario a medida: requisitos de documentación y trazabilidad que debe cumplir la hoja de fabricación (**consúltalo con su responsable regulatorio; no lo des por resuelto**).

## 14. Informe final

Cuando termines, entrega un informe breve con: qué está construido; la evidencia de verificación (comandos y resultados); decisiones asumidas; limitaciones conocidas; y qué necesitas del cliente para pasar de datos sintéticos a reales.
