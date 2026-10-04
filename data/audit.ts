/**
 * Contenido de /analiza-tu-web.
 * Las listas de comprobaciones reflejan exactamente lo que hace lib/audit/engine.ts:
 * si se añade o quita una regla allí, actualízalo aquí.
 */

export const auditPage = {
  h1: "¿Qué le está costando clientes a tu web?",
  lead: "Pega la dirección de tu página. Detectamos sus errores y amenazas principales en un resumen rápido y, si quieres, te enviamos el informe completo con cada punto explicado.",
};

export const auditChecks = [
  {
    title: "Seguridad",
    description: "Lo que cualquiera puede ver desde fuera, sin pruebas intrusivas.",
    items: [
      "HTTPS y redirección desde HTTP",
      "Cabecera HSTS",
      "Contenido mixto (recursos inseguros)",
      "Protección frente a clickjacking",
      "Content-Security-Policy y X-Content-Type-Options",
      "Versiones de software expuestas",
    ],
  },
  {
    title: "SEO",
    description: "Lo que Google necesita para entender y mostrar tu página.",
    items: [
      "Título y meta description",
      "Encabezado H1",
      "Bloqueos por noindex o robots.txt",
      "URL canónica",
      "Datos estructurados (Schema.org)",
      "Open Graph y sitemap.xml",
    ],
  },
  {
    title: "Móvil y accesibilidad",
    description: "Cómo se ve y se usa tu web desde el teléfono.",
    items: [
      "Meta viewport y zoom permitido",
      "Idioma de la página",
      "Imágenes con texto alternativo",
      "Campos de formulario con etiqueta",
      "Tiempo de respuesta del servidor",
      "Peso del HTML y número de scripts",
    ],
  },
  {
    title: "Conversión",
    description: "Si quien te visita tiene una forma fácil de contactarte.",
    items: [
      "Teléfono clicable",
      "Acceso directo a WhatsApp",
      "Formulario de contacto en la portada",
      "Alguna vía de contacto directa",
    ],
  },
  {
    title: "Rendimiento",
    description: "Medido por Google PageSpeed Insights (Lighthouse, simulación móvil).",
    items: [
      "LCP: carga del contenido principal",
      "CLS: estabilidad visual",
      "TBT: bloqueo de interacción",
      "FCP y Speed Index",
    ],
  },
];

export const auditSteps = [
  { title: "Pega tu dirección", text: "Solo necesitas el enlace de tu web. Sin registro y sin instalar nada." },
  { title: "Lo analizamos", text: "Descargamos la página como lo haría un visitante y revisamos más de 30 puntos." },
  { title: "Recibes el resumen", text: "Nota, errores y amenazas ordenados por gravedad, en menos de un minuto." },
  { title: "Tú decides", text: "Pide el informe completo por email o habla con nosotros. Sin compromiso." },
];

export const auditFaqs = [
  {
    question: "¿De verdad es gratis?",
    answer:
      "Sí. El resumen en pantalla es gratuito y no hay que registrarse. Si pides el informe por email, te lo enviamos igualmente sin coste y sin compromiso.",
  },
  {
    question: "¿Qué analizáis exactamente?",
    answer:
      "La página que nos indiques, no el sitio completo. Descargamos su código y sus cabeceras como lo haría cualquier visitante, y medimos el rendimiento con Google PageSpeed. Solo informamos de lo que hemos medido o detectado, nunca de suposiciones.",
  },
  {
    question: "¿Es seguro analizar mi web?",
    answer:
      "Sí. Hacemos las mismas peticiones que un navegador normal. No intentamos entrar, no probamos contraseñas ni lanzamos ataques: solo revisamos lo que cualquiera puede ver desde fuera.",
  },
  {
    question: "¿Qué hacéis con mis datos?",
    answer:
      "No guardamos tu análisis. Solo si nos pides el informe por email guardamos tu contacto y el resumen del resultado para enviártelo y poder ayudarte. Puedes pedirnos que lo borremos cuando quieras.",
  },
  {
    question: "Mi nota es baja, ¿es grave?",
    answer:
      "Depende de qué la baje. Un fallo de seguridad o de SEO básico pesa más que un detalle de accesibilidad. Por eso el informe ordena los problemas por gravedad y explica por qué importa cada uno, y en una llamada breve te decimos por dónde empezaríamos.",
  },
  {
    question: "¿Por qué a veces no se puede analizar una web?",
    answer:
      "Algunas webs bloquean a los robots o responden con errores. En ese caso te lo decimos con claridad y no mostramos resultados, porque preferimos no darte datos que no hemos podido comprobar.",
  },
];
