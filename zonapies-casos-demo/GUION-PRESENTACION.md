# Guion de la reunión · Demo de la app «Casos» (≈ 15 minutos)

**Objetivo de la reunión:** que Zona Pies vea cómo funcionaría la herramienta con su proceso y decida si le encaja, y recoger lo que necesitamos para pasar de maqueta a app real. **No** es una venta de resultados: la demo no contiene cifras de ahorro, mejora ni plazos, y no hay que prometer ninguno.

## Antes de empezar (5 minutos antes)

- [ ] Abrir la demo (local con `npm run serve`, o el enlace protegido) en un portátil con **Chrome o Edge actualizado** y pantalla de ≥ 1440 px de ancho. Pantalla completa (F11).
- [ ] Comprobar que el visor 3D se ve (vista Profesional → Nuevo caso → «Escaneo A»). Si no hay 3D, la demo muestra una vista 2D; se puede presentar igual.
- [ ] **Reiniciar demo** para empezar de cero (las notas de reuniones anteriores se conservan: borrarlas en «Qué es real» → «Borrar notas»).
- [ ] Abrir **Presentación guiada**. Usar ← → para cambiar de paso.
- [ ] Si el cliente trae un escaneo propio (STL), tenerlo a mano: se puede cargar en el paso 3 (solo se miden largo, ancho y si la malla es cerrada).

## Reglas de la reunión

1. Decir al principio y repetir al final: **casi todo es simulado**. Lo único calculado de verdad es la geometría de la plantilla, y es una aproximación.
2. **No prometer** cifras, plazos ni resultados. El panel del dueño usa datos de ejemplo, y está rotulado como tal.
3. **No presentar nada como clínicamente válido.** Las reglas y parámetros son de ejemplo, pendientes de validar por Zona Pies.
4. Escuchar más que explicar: cada paso termina con una pregunta; apuntar las respuestas en el campo de notas.

## Guion paso a paso

| # | Paso | Tiempo | Qué se enseña |
|---|---|---|---|
| 1 | El problema de hoy | 1,5 min | Inicio: las cuatro escenas (mensajes, escaneo con hueco, paciente que vuelve, plazo que se estira) |
| 2 | El profesional crea el caso | 2 min | Móvil: ficha con menús y «Interpretar mensaje» |
| 3 | El semáforo del escaneo | 2 min | Escaneo A (rojo, zona marcada en 3D) → B (verde) |
| 4 | Una pregunta a tiempo | 1,5 min | Aclaración: deporte intenso + material muy blando |
| 5 | El laboratorio lo ve ordenado | 1,5 min | Lista por colores y ficha del caso; propuesta de especificación |
| 6 | Diseño de la plantilla | 3 min | Editor 3D: sliders, mapa de calor, avisos, versiones; aprobar y exportar |
| 7 | Seguimiento sin llamar | 1 min | Línea de estado, enlace público, «Simular avance» |
| 8 | El panel del dueño | 1,5 min | Datos de ejemplo + el caso simulado como bucle |
| 9 | Qué es real y qué necesitamos | 1 min + cuestionario | «Qué es real» y la lista de lo que necesitamos |

El texto de «qué decir» de cada paso está en el panel de la presentación. Resumen de lo esencial:

1. **Problema:** «Un caso viaja entre la clínica y el laboratorio por WhatsApp, correo y teléfono. Si el escaneo sale mal, el laboratorio se entera al recibirlo.» → *¿Os pasa? ¿Con qué frecuencia y en qué casos?*
2. **Crear caso:** «Del paciente solo van las iniciales. Si prefiere pegar un mensaje, la IA lo lee y rellena la ficha (aquí está simulado).» → *¿Qué datos pedís hoy que no estén en esta ficha? ¿Cuáles sobran?*
3. **Semáforo:** «El aviso llega con el paciente delante, así que se repite en el momento. En la versión real serían medidas sobre el archivo real.» → *¿Qué escáner usáis y en qué formato exporta? ¿Cuáles son los fallos de captura más habituales?*
4. **Aclaración:** «La IA solo redacta la pregunta; lo que bloquea lo deciden las reglas del laboratorio.» → *¿Qué combinaciones os generan llamadas hoy? ¿Quién las resuelve y con qué criterio?*
5. **Laboratorio:** «Cada cambio del técnico queda registrado: es la semilla de un futuro copiloto de diseño. No se entrena nada hasta tener histórico.» → *¿Quién decide hoy material, dureza y proceso? ¿Se puede escribir como reglas?*
6. **Diseño:** «Este es el único módulo calculado de verdad. Es un borrador y hasta que el técnico lo aprueba no se puede exportar.» → *¿Qué parámetros ajusta hoy un técnico a mano? ¿Cuáles faltan o sobran?*
7. **Seguimiento:** «El profesional ve el estado sin llamar. El enlace público no muestra datos personales.» → *¿Qué os preguntan más los clientes durante el plazo?*
8. **Panel:** «Estos números son de ejemplo. Lo real es el caso que acabamos de simular, que aparece como bucle.» → *¿Qué indicador querríais ver cada lunes?*
9. **Cierre:** repasar «Qué es real» y la lista «Lo que necesitamos de vosotros». Pedir que marquen en cada pantalla si cuadra.

## Preguntas clave y qué escuchar

| Pregunta | Por qué importa |
|---|---|
| ¿Qué escáner usáis y en qué formato exporta? | Decide si el análisis real del escaneo es viable y con qué archivos |
| ¿Cómo llegan hoy los pedidos (portal, WhatsApp, correo, teléfono)? | Define dónde tiene que vivir la entrada del caso |
| ¿Qué porcentaje aproximado de casos se repite (reescaneo, aclaración, retoque) y por qué? | Si casi nunca ocurre, el valor se desplaza a otras ideas |
| ¿El portal actual tiene API o exportación? | Decide si se integra o se deja un adaptador |
| ¿Quién decide la especificación técnica y con qué criterios? | Son las reglas que hay que escribir con los técnicos |
| ¿Qué parámetros de diseño ajusta hoy un técnico? | Valida la lista de controles del editor |
| ¿Hay requisitos de documentación como producto sanitario a medida? | Condiciona la hoja de fabricación y la trazabilidad (consultar con su responsable) |
| ¿Qué cambiaríais? ¿Qué falta para que os sirviera el primer día? | El criterio para decidir si seguimos |

## Cierre y decisión

1. Exportar las notas (**Notas** en el panel, o «Exportar notas (.md)» en «Qué es real»).
2. Acordar quién aporta cada elemento de la lista «Lo que necesitamos de vosotros».
3. Preguntar de forma explícita: «¿Seguimos con la versión real?».

## Si algo falla

| Síntoma | Qué hacer |
|---|---|
| El 3D no aparece | Se muestra una vista 2D y el mapa de grosor sigue visible. Probar otro navegador o recargar |
| Algo raro en el caso simulado | **Reiniciar demo** (conserva las notas). O, en la presentación, «Preparar el caso hasta aquí» |
| Se recarga la página | El estado se conserva (sessionStorage), incluida la presentación |
| El cliente pregunta «¿esto ya funciona?» | Mostrar «Qué es real y qué es simulado» y responder con franqueza |
| El cliente pide una cifra de ahorro | No darla: «Primero hay que medir la situación de partida; para eso sirve el panel» |
