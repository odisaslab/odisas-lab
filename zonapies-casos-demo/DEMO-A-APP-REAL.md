# De la demo a la app real

Qué pieza de la demo se reutiliza, cuál se sustituye y qué hace falta del cliente. Las secciones citadas son las de `docs/zona-pies/PROMPT-app-casos.md`.

## Qué se reutiliza casi tal cual

| Pieza de la demo | Dónde está | En la app real |
|---|---|---|
| Nombres de estados, causas de incidencia y parámetros de diseño | `lib/domain.ts` | Los mismos (sección 5). El servidor valida las transiciones |
| Transiciones del caso | `lib/caseLogic.ts` | Se trasladan al servidor; los tests de la demo sirven de especificación |
| Tokens, tipografía y componentes de interfaz | `app/globals.css`, `components/ui.tsx` | Igual; solo cambia la fuente de los datos |
| Visores 3D y mapa de grosor | `components/three/`, `components/ThicknessMap.tsx` | Igual: consumen la malla que devuelva el servicio de geometría |
| Textos de la interfaz (semáforo, aclaraciones, seguimiento) | `components/views/` | Se mantienen y se revisan con Zona Pies |
| Prueba extremo a extremo | `scripts/e2e.mjs` | Base del Playwright de la app real (cambia la fuente de datos) |

## Qué se sustituye

| Pieza | En la demo | En la app real | Necesita del cliente |
|---|---|---|---|
| Envío, base de datos, accesos | `sessionStorage`, sin usuarios | Postgres y archivos en región UE, acceso por invitación con roles, registro de auditoría (secciones 4 y 9) | Lista de usuarios y clínicas; política de retención |
| Revisión del escaneo | Dos escaneos sintéticos, comprobaciones guionizadas | Servicio Python `/validate-scan`: cobertura, huecos, escala, lado (sección 7) | Marca y formato del escáner; 3–5 escaneos reales |
| «Interpretar mensaje» | Texto y resultado fijos | Modelo de lenguaje con salida estructurada, con datos seudonimizados y modo degradado sin IA (sección 4) | Formato real de la prescripción |
| Reglas de coherencia | `lib/rules.ts`, de ejemplo | `rule_sets` versionados con marca `validated`, editables por el administrador (secciones 5 y 6) | Reglas de decisión de los técnicos |
| Propuesta de especificación | Reglas de ejemplo | Reglas validadas; los cambios del técnico se guardan en `design_feedback` (sección 5) | Criterios de material, rigidez y forro |
| Perfiles de proceso | Grosor mínimo de ejemplo | `process_profiles` por ruta: grosor mínimo, radio mínimo de fresa, formato de entrega (sección 7) | Restricciones por proceso (PA11, EVA, resina, carbono, composite, memory) |
| Generador de la plantilla | `lib/geometry.ts` (JavaScript, aproximación) | Servicio Python `/generate-insole` calibrado con escaneos reales; mismas entradas (parámetros) y salidas (STL, malla de vista previa, estadísticas) (sección 7) | Escaneos reales, definición del largo ¾ y contornos de calzado |
| STL y hoja de fabricación | STL ilustrativo y hoja imprimible | Exportación solo tras aprobación, con versión y trazabilidad; PDF generado en servidor | Requisitos de documentación y trazabilidad de producto sanitario a medida (consultar con su responsable regulatorio) |
| Avisos y enlace público | Pantallas de ejemplo | Correos reales y enlace con token no adivinable, sin datos personales (sección 6) | Plantillas de correo |
| Panel del dueño | Datos de ejemplo + el caso simulado | Métricas calculadas desde `case_events` (mediana y percentil 90 por fase, bucles y causas) (sección 6) | Qué indicadores quieren ver |
| Integración con el portal | No existe | `PortalAdapter` con salida por webhook o CSV mientras no haya API (sección 8) | Documentación o exportación del portal actual |

## Qué se descarta

- Datos sintéticos, casos ficticios del laboratorio y datos del panel.
- El modo presentación, las notas y el cuestionario (son propios de la demo).
- La cinta «DEMO» y los avisos de «ejemplo» **a medida que cada pieza pase a ser real**: la app real mantiene la marca «no validado» en las reglas hasta que Zona Pies las confirme.

## Orden recomendado si el cliente acepta

1. **Validación del escaneo** (servicio Python): es lo más autónomo y no depende de las reglas del cliente. Necesita 3–5 escaneos reales.
2. Cimientos de la app: base de datos, accesos y máquina de estados reutilizando `lib/domain.ts` y `lib/caseLogic.ts`.
3. Prescripción y reglas con los técnicos (taller de reglas).
4. Generador de la plantilla en Python, con pruebas de paridad contra `lib/geometry.ts` (`scripts/check-geometry.mjs` documenta los valores esperables) y calibración con escaneos reales.
5. Seguimiento, avisos y panel.
6. Endurecimiento: seguridad, accesibilidad y revisión regulatoria.

## Lo que la demo NO demuestra

- Que el análisis del escaneo funcione con los archivos reales de su escáner.
- Que la IA lea correctamente sus prescripciones reales.
- Que los parámetros de diseño produzcan una ortesis clínicamente adecuada.
- Ninguna mejora de plazos, costes o calidad.
