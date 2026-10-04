/**
 * Contenido de la home.
 *
 * Reglas de este archivo:
 *  - Ningún dato inventado: sin clientes, testimonios ni métricas que no existan.
 *  - Las métricas reales viven en data/results.ts.
 *  - `need` debe coincidir con una opción de needOptions (lib/contact.ts).
 */

export const nav = [
  { label: "Qué hacemos", id: "que-hacemos" },
  { label: "Servicios", id: "servicios" },
  { label: "Proceso", id: "proceso" },
  { label: "Sobre Odisas", id: "sobre" },
  { label: "FAQ", id: "faq" },
] as const;

/** Acceso destacado al diagnóstico gratuito (junto al CTA de la cabecera) */
export const auditNav = { label: "Analiza tu web", short: "Analizar web", id: "analiza-tu-web" } as const;

export const hero = {
  eyebrow: "Marketing · Tecnología · IA",
  title: "Hacemos que tu negocio se *vea,* *crezca* y *convierta.*",
  subtitle:
    "Marketing, tecnología e inteligencia artificial para conseguir más visibilidad, más oportunidades y más clientes.",
  primary: "Quiero hacer crecer mi negocio",
  secondary: "Descubrir cómo trabajamos",
  auditLink: { lead: "¿Quieres ver cómo está tu web ahora mismo?", cta: "Analízala gratis" },
  assurances: [
    "Hablas con quien hace el trabajo",
    "Presupuesto cerrado antes de empezar",
    "Respuesta en menos de 24 h laborables",
  ],
};

/** Sistema que se anima en el hero. Los indicadores son ilustrativos: no llevan cifras. */
export const pipeline = [
  { key: "seo", label: "SEO", caption: "Te encuentran", indicator: "Visibilidad" },
  { key: "trafico", label: "Tráfico", caption: "Llegan a tu web", indicator: "Tráfico" },
  { key: "web", label: "Web", caption: "Entienden y confían", indicator: null },
  { key: "conversion", label: "Conversión", caption: "Deciden contactar", indicator: "Conversiones" },
  { key: "clientes", label: "Clientes", caption: "Te escriben", indicator: "Leads" },
] as const;

export const marquee = [
  "SEO",
  "Google Ads",
  "Meta Ads",
  "Diseño web",
  "Renovación web",
  "Redes sociales",
  "IA y automatización",
  "Análisis web",
];

export const problem = {
  eyebrow: "El problema",
  title: "Tu problema probablemente no es hacer *más* marketing.",
  intro:
    "Casi nunca falta actividad. Falta que cada pieza empuje en la misma dirección. Esto es lo que vemos una y otra vez:",
  items: [
    {
      title: "Nadie encuentra tu negocio.",
      text: "Buscan lo que vendes en Google y aparece tu competencia. Tú, no.",
      signal: "búsquedas ▸ tu web: sin presencia",
    },
    {
      title: "Tu web recibe visitas, pero no contactos.",
      text: "La gente entra, mira y se va. Nadie le ha dicho qué hacer a continuación.",
      signal: "visitas ▸ contactos: nada",
    },
    {
      title: "Gastas en publicidad sin saber qué funciona.",
      text: "Sin conversiones bien medidas, cada euro invertido es un acto de fe.",
      signal: "inversión ▸ clientes: sin medir",
    },
    {
      title: "Publicas en redes, pero no entran clientes.",
      text: "Likes y alcance que no se convierten en una sola conversación comercial.",
      signal: "publicaciones ▸ oportunidades: 0",
    },
    {
      title: "Tienes demasiadas herramientas y ninguna estrategia.",
      text: "Cada canal va por su lado y nadie decide qué es prioritario.",
      signal: "herramientas ▸ plan: desconectado",
    },
    {
      title: "Tu web está anticuada.",
      text: "Lenta, difícil en móvil y con un aspecto que no está a la altura de tu negocio.",
      signal: "primera impresión: pierdes la confianza",
    },
  ],
  pivot: "Ahí entramos *nosotros.*",
};

export const whatWeDo = {
  eyebrow: "Qué hacemos",
  title: "No hacemos marketing por *hacer* marketing.",
  text: "Construimos sistemas digitales pensados para conseguir algo muy concreto: que más personas descubran tu negocio, confíen en él y terminen contactando o comprando.",
  note: "Sirve para pymes, negocios locales y profesionales con un negocio real detrás.",
};

export interface HomeService {
  id: string;
  name: string;
  claim: string;
  description: string;
  does: string[];
  benefit: string;
  cta: string;
  /** Necesidad que se preselecciona en el formulario */
  need: string;
  /** Página de detalle (existente en /servicios/[slug]) */
  slug: string;
  /** Sección a la que lleva el CTA si no es el formulario de contacto */
  to?: string;
}

export const homeServices: HomeService[] = [
  {
    id: "seo",
    name: "SEO",
    claim: "Haz que tus clientes te encuentren cuando buscan lo que vendes.",
    description:
      "Trabajamos tu posicionamiento para que aparezcas en Google cuando alguien busca lo que ofreces, sin depender solo de la publicidad.",
    does: ["Auditoría y SEO técnico", "Keyword research con intención de compra", "SEO on page y SEO local", "Contenidos y arquitectura web"],
    benefit: "Visibilidad que no desaparece cuando dejas de pagar.",
    cta: "Quiero mejorar mi visibilidad",
    need: "SEO",
    slug: "seo",
  },
  {
    id: "google-ads",
    name: "Google Ads",
    claim: "Aparece delante de personas que ya están buscando tus servicios.",
    description:
      "Campañas pensadas para conversión, no para clics: estructura clara, medición correcta y optimización continua.",
    does: ["Campañas de Search y Performance Max", "Remarketing y Display", "Medición de formularios, llamadas y WhatsApp", "Informe de qué se cambia y por qué"],
    benefit: "Saber qué parte de tu inversión trae clientes y cuál no.",
    cta: "Quiero conseguir clientes",
    need: "Publicidad",
    slug: "google-ads",
  },
  {
    id: "meta-ads",
    name: "Meta Ads",
    claim: "Haz que Instagram y Facebook generen oportunidades.",
    description:
      "Publicidad en redes con segmentación, creatividades y seguimiento, orientada a captar contactos y no solo alcance.",
    does: ["Estrategia y segmentación de audiencias", "Creatividades para captación", "Campañas de remarketing", "Optimización semanal con datos"],
    benefit: "Llegar a quien aún no te conoce, con un mensaje que le interesa.",
    cta: "Quiero mejorar mis campañas",
    need: "Publicidad",
    slug: "meta-ads",
  },
  {
    id: "diseno-web",
    name: "Diseño web",
    claim: "Una web bonita está bien. Una web que consigue clientes es mejor.",
    description:
      "Webs rápidas, claras y construidas alrededor de una acción: que el visitante te contacte.",
    does: ["UX/UI y diseño responsive", "Landing pages y webs corporativas", "Ecommerce", "Optimización de conversión (CRO)"],
    benefit: "Una web que explica lo que haces y empuja al contacto.",
    cta: "Quiero mejorar mi web",
    need: "Mejorar mi web",
    slug: "diseno-web",
  },
  {
    id: "renovacion-web",
    name: "Renovación web",
    claim: "Tu web ya existe. Lo que falta es que trabaje para ti.",
    description:
      "Analizamos la que tienes y decidimos con datos si conviene mejorarla o rehacerla, sin perder el posicionamiento ganado.",
    does: ["Análisis de la web actual", "Detección de errores y mejora de velocidad", "Rediseño completo cuando compensa", "Migración sin perder SEO"],
    benefit: "Una web actual, rápida y creíble sin empezar de cero.",
    cta: "Quiero mejorar mi web",
    need: "Mejorar mi web",
    slug: "renovacion-web",
  },
  {
    id: "social-media",
    name: "Redes sociales",
    claim: "No publicamos por publicar.",
    description:
      "Contenido con objetivo comercial: cada publicación tiene un motivo y un siguiente paso para quien la ve.",
    does: ["Estrategia de contenidos", "Calendario editorial", "Diseño, reels y copywriting", "Gestión de perfiles"],
    benefit: "Una presencia coherente que genera conversaciones, no solo alcance.",
    cta: "Quiero que mis redes traigan clientes",
    need: "Redes sociales",
    slug: "social-media",
  },
  {
    id: "ia",
    name: "IA y automatización",
    claim: "La IA no sustituye la estrategia. La multiplica.",
    description:
      "Usamos inteligencia artificial donde aporta una ventaja real: analizar más rápido, producir más y quitar tareas repetitivas.",
    does: ["Análisis de datos y detección de patrones", "Automatización de procesos repetitivos", "Producción de contenido con revisión humana", "Optimización de campañas"],
    benefit: "Más velocidad y mejores decisiones, con criterio humano detrás.",
    cta: "Quiero automatizar mi marketing",
    need: "IA / automatización",
    slug: "analisis-web-ia",
  },
  {
    id: "analisis-web",
    name: "Análisis web",
    claim: "Antes de gastar más, averigua qué te está frenando.",
    description:
      "Una revisión completa de tu web: conversión, SEO, velocidad, contenido y competencia, con un plan de mejoras priorizado.",
    does: ["Análisis de UX y conversión", "Revisión SEO y de velocidad", "Análisis de competencia", "Plan de mejoras ordenado por impacto"],
    benefit: "Claridad sobre dónde está el problema y qué arreglar primero.",
    cta: "Analizar mi web gratis",
    need: "Mejorar mi web",
    to: "analiza-tu-web",
    slug: "analisis-web-ia",
  },
];

export const journey = {
  eyebrow: "El recorrido",
  title: "Cada pieza tiene un trabajo. Juntas, *funcionan.*",
  steps: [
    { tag: "SEO", outcome: "Te encuentran", text: "Apareces cuando alguien busca lo que vendes." },
    { tag: "Ads", outcome: "Te descubren", text: "La publicidad te pone delante de quien aún no te conoce." },
    { tag: "Web", outcome: "Confían", text: "Una web clara y rápida que genera confianza en segundos." },
    { tag: "Conversión", outcome: "Contactan", text: "Cada página lleva a una acción: llamar, escribir o pedir presupuesto." },
    { tag: "Odisas", outcome: "Crecimiento", text: "Medimos, optimizamos y repetimos lo que funciona." },
  ],
};

export const diagnostic = {
  eyebrow: "Diagnóstico",
  title: "No necesitas contratarlo *todo.*",
  text: "Necesitas saber qué está frenando tu crecimiento.",
  body: "Antes de proponerte nada, revisamos tu negocio de arriba abajo. A veces la solución es una campaña. Otras, arreglar la web. Y otras, no gastar en algo que no te compensa.",
  modules: ["Negocio", "Mercado", "Competencia", "Web", "SEO", "Publicidad", "Conversión"],
  foundTitle: "Oportunidades detectadas",
  foundNote: "Ejemplos del tipo de hallazgos que buscamos. Tu análisis se hace con tus datos reales.",
  found: [
    { area: "Conversión", text: "Páginas que reciben visitas y no generan ningún contacto." },
    { area: "SEO", text: "Búsquedas con intención de compra en las que no apareces." },
    { area: "Publicidad", text: "Inversión sin conversión medida: no se sabe qué funciona." },
    { area: "Competencia", text: "Huecos que tu competencia no está cubriendo y tú sí puedes." },
  ],
  cta: "Analizar mi web gratis",
  ctaSecondary: "Analizar mi negocio",
};

export const audit = {
  eyebrow: "Diagnóstico gratuito",
  title: "Pega tu web. *Te decimos* qué te está costando clientes.",
  text: "Revisamos seguridad, SEO, móvil, conversión y velocidad en menos de un minuto. Sin registro y sin letra pequeña. Después, si quieres, te enviamos el informe con cada punto explicado.",
  bullets: ["Sin registro", "Resultado en menos de 1 minuto", "Solo datos medidos, nunca inventados"],
};

export const ai = {
  eyebrow: "Inteligencia artificial",
  title: "La IA no sustituye la estrategia.",
  giant: "LA MULTIPLICA.",
  text: "No usamos IA porque esté de moda. La usamos cuando nos permite analizar más rápido, decidir mejor y darte una ventaja real frente a tu competencia. La estrategia y las decisiones siguen siendo humanas.",
  inputs: ["Tu web", "Tus campañas", "Búsquedas", "Competencia"],
  outputs: ["Patrones", "Oportunidades", "Contenido", "Campañas mejoradas"],
  blocks: [
    { title: "Analizamos", text: "Procesamos datos de tu web y tus campañas para ver patrones que a mano tardarías semanas en encontrar." },
    { title: "Automatizamos", text: "Tareas repetitivas resueltas por sistemas, para dedicar el tiempo a lo que requiere criterio." },
    { title: "Creamos", text: "Producción más rápida de textos y creatividades, siempre revisados por una persona." },
    { title: "Optimizamos", text: "Detectamos pronto qué campañas, páginas y mensajes rinden y cuáles hay que corregir." },
  ],
  uses: [
    "Analizar datos",
    "Detectar patrones",
    "Automatizar procesos",
    "Crear contenido",
    "Optimizar campañas",
    "Encontrar oportunidades",
  ],
};

export const method = {
  eyebrow: "Cómo trabajamos",
  title: "Cinco pasos. Ninguno *improvisado.*",
  link: "Ver el proceso completo",
};

export const about = {
  eyebrow: "Sobre Odisas Lab",
  title: "No vas a hablar con una agencia grande.",
  title2: "Vas a hablar con el equipo que hace *el trabajo.*",
  text: [
    "Odisas Lab es un equipo pequeño. Las personas que analizan tu negocio, diseñan la estrategia y la ejecutan son las mismas con las que hablas. Sin comerciales que prometen y equipos que no se enteran.",
    "Trabajamos con pocos proyectos a la vez, y por eso cada uno se atiende de verdad.",
  ],
  pillars: [
    { title: "Trato directo", text: "Preguntas algo y te responde quien tiene la respuesta." },
    { title: "Estrategia a medida", text: "Cada negocio tiene su mercado, su competencia y su margen. El plan parte de ahí." },
    { title: "Datos antes que opiniones", text: "Medimos lo que pasa y decidimos con los números delante." },
    { title: "Tecnología con sentido", text: "IA y herramientas solo cuando aportan una ventaja real." },
  ],
  chainBig: ["Tú", "Comercial", "Gestor de cuenta", "Equipo"],
  chainSmall: ["Tú", "El equipo de Odisas"],
  link: "Conocer Odisas Lab",
};

export const midCta = {
  title: "¿Y si analizamos tu *negocio?*",
  text: "Cuéntanos qué haces, qué quieres conseguir y qué crees que está fallando.",
  button: "QUIERO HABLAR CON ODISAS",
};

export const finalCta = {
  title: "Tu próximo cliente puede estar buscándote *ahora mismo.*",
  text: "La pregunta es si te va a encontrar a ti o a tu competencia.",
  primary: "HABLEMOS",
  secondary: "WHATSAPP",
};

export const form = {
  eyebrow: "Contacto",
  title: "Cuéntanos tu caso. Nosotros hacemos *el resto.*",
  text: "Tres pasos, menos de un minuto. Revisamos tu situación antes de contestar y te respondemos en menos de 24 horas laborables.",
  needs: [
    { value: "Conseguir más clientes", label: "Conseguir más clientes" },
    { value: "Mejorar mi web", label: "Mejorar mi web" },
    { value: "SEO", label: "SEO" },
    { value: "Publicidad", label: "Publicidad" },
    { value: "Redes sociales", label: "Redes sociales" },
    { value: "IA / automatización", label: "IA / automatización" },
    { value: "No lo tengo claro", label: "No lo tengo claro" },
  ],
  submit: "QUIERO QUE ANALICÉIS MI NEGOCIO",
};
