# ODISAS RADAR

Herramienta interna de Odisas Lab para **buscar empresas, investigarlas, detectar qué servicios
podrían necesitar, puntuarlas y gestionar el contacto hasta la venta**.

Es una aplicación independiente dentro del repositorio de la web (como `odisas-audit/`): se
despliega como **otro proyecto de Vercel** con *Root Directory* = `odisas-radar`.

Next.js 16 · TypeScript · PostgreSQL · Claude (Anthropic) · sin dependencias de interfaz.

## Arrancar en local

```bash
npm install
```

```bash
npm run dev
```

Abre <http://localhost:3200>. La primera vez pide crear la cuenta de administración. En local
no hace falta configurar nada: los datos se guardan en `./data` con un PostgreSQL embebido.

| Comando | Qué hace |
|---|---|
| `npm run dev` | Desarrollo en el puerto 3200 |
| `npm run build` / `npm start` | Compilación y servidor de producción |
| `npm run typecheck` | Comprobación de tipos |
| `npm test` | Pruebas automáticas (33) |

## Qué hace

| Sección | Función |
|---|---|
| Dashboard | Indicadores, embudo, evolución semanal, sectores y zonas, y **oportunidades recomendadas** para hoy con su motivo |
| Buscar empresas | Búsqueda en lenguaje natural o por filtros; importación de listados CSV; alta manual. Nunca duplica |
| Empresas encontradas | Listado con filtros (sin web, web desactualizada, automatizables, candidatas a IA, varias sedes, tamaño…) |
| Análisis de oportunidades | Informe por empresa: lo **comprobado** frente a las **hipótesis a validar** |
| Empresas prioritarias | Las de RADAR SCORE ≥ 65 con su siguiente paso |
| Generador de mensajes | Correo, seguimiento, guion de llamada, LinkedIn, propuesta de reunión y resumen de llamada; siempre editables |
| Seguimiento comercial | Pipeline de 13 estados, historial, tareas, contactos y alertas de falta de seguimiento |
| Automatizaciones | Búsquedas periódicas, análisis, avisos, señales e informes; se activan y desactivan |
| Informes | Resumen semanal o mensual comparado con el periodo anterior; exportación CSV |
| Configuración | Claves, remitente, fuentes, CRM, exclusiones y usuarios |

## Credenciales necesarias

Todas van como variables de entorno (ver `.env.example`).

| Variable | Para qué | Obligatoria |
|---|---|---|
| `DATABASE_URL` | PostgreSQL alojado (Neon, Supabase, Vercel Postgres). Sin ella, en Vercel los datos son temporales | Sí, en producción |
| `AUTH_SECRET` | Cifra las claves guardadas desde la app (≥ 32 caracteres) | Sí, en producción |
| `SETUP_CODE` | Código para crear la primera cuenta de administración | Sí, en producción |
| `CRON_SECRET` | Autoriza el cron diario de Vercel que lanza las automatizaciones | Para automatizaciones periódicas |
| `ANTHROPIC_API_KEY` | Análisis con IA, mensajes a medida, búsqueda de empresas y noticias en internet | Recomendada |
| `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` | Enviar correos desde RADAR (solo al pulsar «Enviar») | Opcional |

La clave de Anthropic y el token del CRM también pueden guardarse, cifrados, desde
*Configuración*.

## Fuentes de datos

Arquitectura por proveedores (`src/server/providers`): añadir uno nuevo es implementar la
interfaz `SearchProvider` y registrarlo.

| Fuente | Qué aporta | Requiere |
|---|---|---|
| OpenStreetMap (Overpass + Nominatim) | Negocios por sector y zona, con dirección y, si constan, web, teléfono y correo. Datos abiertos (ODbL) | Nada |
| Búsqueda con IA | Claude busca en internet y devuelve cada empresa con la página de origen | `ANTHROPIC_API_KEY` |
| Web pública de la empresa | Correo, teléfono, formulario, redes, razón social, CIF y diagnóstico técnico | Nada |
| Listado propio (CSV) | Empresas de ferias, cámaras de comercio, etc. | Nada |

No se han incluido directorios cuyas condiciones impiden este uso (por ejemplo, Google Places
no permite construir listados de prospección con sus datos). Para un registro mercantil o un
proveedor de datos de pago basta añadir otro `SearchProvider`.

## RADAR SCORE

0-100. El 90 % mide la oportunidad comercial y solo el 10 % la facilidad de contacto y la
cantidad de datos, para que una empresa con muchos datos no parezca mejor cliente de lo que es.

| Componente | Peso |
|---|---|
| Encaje con los servicios | 25 |
| Necesidad tecnológica detectada | 25 |
| Potencial de contratación | 20 |
| Tamaño y actividad | 10 |
| Urgencia aparente | 10 |
| Facilidad para contactar | 5 |
| Calidad de la información | 5 |

Prioridad: muy alta ≥ 80 · alta ≥ 65 · media ≥ 45 · baja < 45. La **confianza** del análisis
se muestra aparte y no altera la nota.

## Conexión con el CRM

RADAR lleva su propio pipeline. Si en *Configuración → Conexión con el CRM* se indica un
webhook, cada empresa guardada en el pipeline y cada cambio (estado, contacto, actividad) se
envía en JSON (`company.saved`, `company.status`, `company.updated`, `contact.added`,
`activity.added`). Si el CRM responde con un `id`, queda enlazado en la ficha. Para un CRM con
API propia, implementa `CrmConnector` en `src/server/crm.ts`.

## Protección de datos

- Solo se leen fuentes públicas: la web de la propia empresa (respetando `robots.txt`) y datos abiertos.
- Cada dato guarda **procedencia, enlace y fecha**, y se marca como verificado, estimado o no encontrado. Nada se inventa.
- Lista de **exclusión** (dominio, correo, empresa, teléfono): no se vuelve a importar ni a contactar.
- «Borrar y excluir» elimina todos los datos de una empresa (derecho de supresión).
- **Ningún envío es automático.** Los correos llevan la línea de baja (art. 21 LSSI).

Esto facilita el cumplimiento, pero no sustituye al registro de actividades de tratamiento ni
al asesoramiento jurídico.

## Despliegue en Vercel

1. Nuevo proyecto importando este repositorio, con **Root Directory** = `odisas-radar`.
2. Añadir una base de datos PostgreSQL (Storage → Neon) o pegar una `DATABASE_URL`.
3. Definir `AUTH_SECRET`, `SETUP_CODE` y `CRON_SECRET`; opcionalmente `ANTHROPIC_API_KEY` y `SMTP_*`.
4. Desplegar, abrir la URL y crear la cuenta de administración con el `SETUP_CODE`.

`vercel.json` programa un cron diario (05:00 UTC) que ejecuta las automatizaciones y avanza la
cola de análisis. Además, mientras alguien tiene RADAR abierto, la cola se procesa sola.

## Organización del código

```
src/domain/     lógica pura y probada: catálogos, puntuación, lectura de HTML, reglas, plantillas
src/server/     base de datos, API (api.ts), investigación, IA, cola, automatizaciones, CRM
src/server/providers/   fuentes de datos intercambiables
src/lib/audit/  motor de diagnóstico web, compartido con la web de Odisas Lab
src/app/        pantallas (una por sección) y la API en /api/[...path]
tests/          pruebas de dominio y de extremo a extremo contra servicios simulados
```

## Limitaciones conocidas

- La cobertura de OpenStreetMap es desigual: buena en comercio y servicios, floja en industria. Para nichos, usa la búsqueda con IA o importa un listado.
- El número de empleados casi nunca está publicado: queda como «no encontrado» o como estimación de la IA, marcada como tal.
- En el plan gratuito de Vercel el cron corre una vez al día, así que las automatizaciones «diarias» son el máximo de frecuencia.
- Las llamadas a OpenStreetMap, a Anthropic y a las webs reales no se han podido probar desde el entorno de desarrollo (sin salida a internet): están probadas contra servicios simulados.
