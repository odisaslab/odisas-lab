import type { Service, ServiceSlug } from "@/types";

export const services: Service[] = [
  {
    slug: "seo",
    name: "SEO",
    claim: "Haz que tus clientes te encuentren.",
    summary:
      "Trabajamos tu posicionamiento para que aparezcas cuando alguien busca lo que ofreces, sin depender solo de la publicidad.",
    includes: [
      "Auditoría SEO",
      "Keyword research",
      "SEO técnico",
      "SEO On Page",
      "SEO local",
      "Contenidos y arquitectura",
    ],
    icon: "Search",
    metaTitle: "Agencia SEO · Posicionamiento en Google",
    metaDescription:
      "Auditoría SEO, keyword research, SEO técnico y local. Trabajamos tu posicionamiento para que te encuentren cuando buscan lo que ofreces.",
    h1: "Posicionamiento SEO para que te encuentren cuando te buscan",
    intro: [
      "El SEO es el trabajo de aparecer en Google sin pagar por cada clic. Es más lento que la publicidad, pero lo que se construye no desaparece cuando dejas de invertir.",
      "No hay atajos ni trucos. Hay una web técnicamente correcta, un contenido que responde a lo que la gente busca de verdad y una estructura que Google entiende.",
    ],
    signals: [
      "Tu web existe pero no aparece cuando buscas tus propios servicios",
      "Todo tu tráfico viene de publicidad y se corta en cuanto paras las campañas",
      "Tienes competencia por encima que no ofrece nada mejor que tú",
      "Nadie ha revisado tu web a nivel técnico desde que se hizo",
    ],
    work: [
      {
        title: "Auditoría SEO",
        description:
          "Revisión completa de indexación, velocidad, estructura, contenido duplicado, enlazado interno y errores que están frenando tu visibilidad.",
      },
      {
        title: "Keyword research",
        description:
          "Qué busca de verdad tu cliente, con qué intención y con qué competencia. No las palabras que suenan bien, las que traen negocio.",
      },
      {
        title: "SEO técnico",
        description:
          "Velocidad, Core Web Vitals, rastreo, indexación, sitemap, datos estructurados y todo lo que hace que Google pueda leer tu web sin obstáculos.",
      },
      {
        title: "SEO On Page",
        description:
          "Titles, meta descriptions, encabezados, contenido y enlazado interno de cada página trabajados uno a uno.",
      },
      {
        title: "SEO local",
        description:
          "Ficha de Google Business Profile, señales locales y contenido orientado a tu zona, para negocios que dependen de clientes cercanos.",
      },
      {
        title: "Contenidos y arquitectura",
        description:
          "Qué páginas debe tener tu web, cómo se relacionan entre ellas y qué contenido falta por crear.",
      },
    ],
    faqs: [
      {
        question: "¿Cuánto tarda el SEO en dar resultados?",
        answer:
          "Los cambios técnicos se notan en semanas. El posicionamiento de contenidos nuevos suele moverse entre el tercer y el sexto mes, y depende de tu competencia y del punto de partida. Cualquiera que te prometa la primera posición en un mes te está vendiendo humo.",
      },
      {
        question: "¿Garantizáis salir primero en Google?",
        answer:
          "No, y nadie puede. Google no vende posiciones orgánicas. Lo que sí podemos garantizar es el trabajo: una web técnicamente sana, contenido que responde a búsquedas reales y un informe de qué se ha hecho y qué ha cambiado.",
      },
      {
        question: "¿Sirve el SEO si mi negocio es local?",
        answer:
          "Es donde más rápido se nota. Competir por 'óptica en tu barrio' es mucho más asequible que competir a nivel nacional, y la intención de compra de esas búsquedas es altísima.",
      },
    ],
    related: ["google-ads", "analisis-web-ia", "diseno-web"],
  },
  {
    slug: "google-ads",
    name: "Google Ads",
    claim: "Convierte las búsquedas en oportunidades.",
    summary:
      "Campañas orientadas a conversión, no a clics. Estructura clara, seguimiento correcto y optimización continua.",
    includes: [
      "Campañas de Search",
      "Performance Max",
      "Remarketing",
      "Display",
      "Seguimiento de conversiones",
      "Optimización y analítica",
    ],
    icon: "Target",
    metaTitle: "Gestión de Google Ads para empresas",
    metaDescription:
      "Campañas de Google Ads orientadas a conversión: Search, Performance Max, remarketing y medición correcta. Optimización continua del presupuesto.",
    h1: "Campañas de Google Ads que traen clientes, no solo clics",
    intro: [
      "Google Ads es el canal más directo que existe: alguien está buscando exactamente lo que vendes y tú apareces. El problema es que también es el canal donde más dinero se tira si la estructura está mal montada.",
      "Trabajamos con el presupuesto como si fuera nuestro: campañas bien segmentadas, conversiones medidas de verdad y decisiones tomadas con datos, no con corazonadas.",
    ],
    signals: [
      "Tienes campañas activas pero no sabes qué te está funcionando",
      "Gastas el presupuesto y no sabes cuántos clientes has conseguido",
      "Nunca se han configurado las conversiones o están midiendo mal",
      "Necesitas clientes ya y el SEO va a tardar demasiado",
    ],
    work: [
      {
        title: "Estructura de campañas",
        description:
          "Organización por servicio, zona e intención de búsqueda, para saber en todo momento qué parte del presupuesto genera negocio.",
      },
      {
        title: "Campañas de Search",
        description:
          "Palabras clave, concordancias, negativos y anuncios trabajados por grupo. Aquí es donde está la intención de compra.",
      },
      {
        title: "Performance Max",
        description:
          "Campañas automatizadas con señales y creatividades bien alimentadas, para ampliar alcance sin perder el control del coste.",
      },
      {
        title: "Remarketing y Display",
        description:
          "Recuperar a quien ya visitó tu web y no contactó. Suele ser el tráfico más barato de convertir.",
      },
      {
        title: "Medición de conversiones",
        description:
          "Formularios, llamadas y WhatsApp medidos correctamente. Sin esto, optimizar es adivinar.",
      },
      {
        title: "Optimización continua",
        description:
          "Revisión periódica de pujas, búsquedas reales, anuncios y páginas de destino, con informe de qué se cambió y por qué.",
      },
    ],
    faqs: [
      {
        question: "¿Cuánto presupuesto necesito para empezar?",
        answer:
          "Depende de tu sector y de tu zona: el coste por clic de un abogado y de una peluquería no tienen nada que ver. Antes de proponerte una cifra revisamos qué se paga por tus búsquedas y qué volumen hay. Sin ese dato, cualquier número sería inventado.",
      },
      {
        question: "¿La inversión en anuncios va aparte?",
        answer:
          "Sí. El presupuesto de publicidad lo pagas directamente a Google desde tu propia cuenta, así que siempre ves lo que se gasta. Nuestro trabajo de gestión se factura por separado.",
      },
      {
        question: "¿Me quedo con la cuenta si dejamos de trabajar juntos?",
        answer:
          "Siempre. Las campañas se montan en tu cuenta de Google Ads, no en una nuestra. Es tu histórico y tu activo.",
      },
    ],
    related: ["seo", "meta-ads", "diseno-web"],
  },
  {
    slug: "meta-ads",
    name: "Meta Ads",
    claim: "Haz que tu marca llegue a las personas adecuadas.",
    summary:
      "Publicidad en Instagram y Facebook con segmentación trabajada y creatividades pensadas para tu público.",
    includes: [
      "Estrategia de campañas",
      "Segmentación de audiencias",
      "Creatividades",
      "Campañas de captación",
      "Remarketing",
      "Optimización",
    ],
    icon: "Megaphone",
    metaTitle: "Meta Ads · Publicidad en Instagram y Facebook",
    metaDescription:
      "Campañas en Instagram y Facebook con segmentación trabajada, creatividades propias y optimización continua orientada a captar clientes.",
    h1: "Publicidad en Instagram y Facebook con criterio",
    intro: [
      "En Google la gente te busca. En Instagram y Facebook hay que interrumpir con algo que merezca la pena mirar. Son dos juegos distintos y se trabajan distinto.",
      "Aquí manda la creatividad: el mejor targeting del mundo no salva un anuncio que nadie para de scrollear. Trabajamos el mensaje, el formato y la audiencia como un conjunto.",
    ],
    signals: [
      "Tu producto o servicio se entiende mejor viéndolo que buscándolo",
      "Promocionas publicaciones desde el móvil y no sabes si sirve de algo",
      "Quieres darte a conocer en una zona o en un público concreto",
      "Tienes buen contenido pero no llega más allá de tus seguidores",
    ],
    work: [
      {
        title: "Estrategia y objetivo",
        description:
          "Qué buscamos: notoriedad, contactos o ventas. Cada objetivo se configura y se mide de forma diferente.",
      },
      {
        title: "Audiencias",
        description:
          "Segmentación por intereses, comportamiento y zona, más audiencias personalizadas y similares a partir de tus propios datos.",
      },
      {
        title: "Creatividades",
        description:
          "Imágenes, vídeos y textos pensados para el formato. Varias versiones para saber cuál funciona en lugar de suponerlo.",
      },
      {
        title: "Campañas de captación",
        description:
          "Formularios instantáneos o tráfico a tu web, según dónde convierta mejor tu público.",
      },
      {
        title: "Remarketing",
        description:
          "Volver a mostrarte a quien ya interactuó con tu perfil, tu web o tus vídeos.",
      },
      {
        title: "Optimización e informes",
        description:
          "Revisión de resultados por creatividad y audiencia, y reasignación del presupuesto a lo que rinde.",
      },
    ],
    faqs: [
      {
        question: "¿Meta Ads sirve para negocios B2B?",
        answer:
          "Puede funcionar, pero no siempre es el mejor canal. Si vendes a otras empresas con un ciclo de decisión largo, normalmente rinden más Google Ads y LinkedIn. Te lo diremos antes de empezar, no después.",
      },
      {
        question: "¿Necesito tener el perfil de Instagram cuidado?",
        answer:
          "Ayuda mucho. Cuando alguien ve tu anuncio, lo primero que hace es mirar tu perfil. Si está abandonado, pierdes parte de lo que has pagado. Si hace falta, lo trabajamos junto con el servicio de redes sociales.",
      },
      {
        question: "¿Quién hace las creatividades?",
        answer:
          "Nosotros, salvo que ya tengas material propio que funcione. Si tienes fotos o vídeos reales de tu negocio, mejor: suelen rendir más que cualquier diseño genérico.",
      },
    ],
    related: ["social-media", "google-ads", "diseno-web"],
  },
  {
    slug: "diseno-web",
    name: "Diseño web",
    claim: "Tu web debería trabajar para tu negocio.",
    summary:
      "Diseñamos webs rápidas, claras y pensadas para convertir visitas en contactos o ventas.",
    includes: [
      "UX/UI",
      "Diseño responsive",
      "Landing pages",
      "Web corporativa",
      "Ecommerce",
      "CRO",
    ],
    icon: "MonitorSmartphone",
    metaTitle: "Diseño web profesional orientado a conversión",
    metaDescription:
      "Diseño y desarrollo de webs corporativas, landing pages y ecommerce. Rápidas, accesibles, preparadas para SEO y pensadas para convertir.",
    h1: "Diseño web pensado para convertir visitas en clientes",
    intro: [
      "Una web bonita que no genera contactos es un gasto. Una web clara, rápida y bien estructurada es una herramienta comercial que trabaja mientras tú atiendes el negocio.",
      "Diseñamos partiendo de lo que tu cliente necesita entender y decidir, y desde ahí construimos la estructura, el mensaje y el diseño.",
    ],
    signals: [
      "No tienes web, o la que tienes no la enseñarías a un cliente",
      "Recibes visitas pero casi nadie te escribe ni te llama",
      "En el móvil se ve mal, va lenta o cuesta encontrar el teléfono",
      "Cada cambio pequeño depende de terceros y tarda semanas",
    ],
    work: [
      {
        title: "Arquitectura y UX",
        description:
          "Qué páginas hacen falta, qué se cuenta en cada una y en qué orden, para que el visitante llegue al contacto sin fricción.",
      },
      {
        title: "Diseño visual",
        description:
          "Identidad propia, jerarquía clara y espacio para respirar. Sin plantillas reconocibles ni fotos de stock genéricas.",
      },
      {
        title: "Desarrollo",
        description:
          "Código limpio y componentes reutilizables, para poder añadir páginas y servicios sin rehacer el diseño.",
      },
      {
        title: "Velocidad y SEO técnico",
        description:
          "Imágenes optimizadas, HTML semántico, metadatos, sitemap y datos estructurados desde el primer día.",
      },
      {
        title: "Conversión y medición",
        description:
          "Formularios que funcionan, llamadas a la acción visibles y analítica configurada para saber qué canal trae clientes.",
      },
      {
        title: "Entrega y autonomía",
        description:
          "Te explicamos cómo editar el contenido y qué mantener. La web es tuya, no queda secuestrada.",
      },
    ],
    faqs: [
      {
        question: "¿Cuánto tarda en estar lista una web?",
        answer:
          "Una landing page puede estar en una o dos semanas. Una web corporativa completa suele llevar entre cuatro y ocho, y el plazo depende sobre todo de la rapidez con la que se cierren textos e imágenes.",
      },
      {
        question: "¿Trabajáis con WordPress?",
        answer:
          "Depende del proyecto. Si necesitas publicar contenido a diario, WordPress tiene sentido. Para webs corporativas y landings priorizamos tecnología más rápida y segura. Te explicamos las dos opciones y decides con la información delante.",
      },
      {
        question: "¿El precio incluye los textos y las imágenes?",
        answer:
          "Los textos sí: forman parte del diseño. Para imágenes, lo ideal son fotos reales de tu negocio. Si no las hay, lo indicamos en el presupuesto y buscamos la mejor alternativa.",
      },
    ],
    related: ["renovacion-web", "seo", "analisis-web-ia"],
  },
  {
    slug: "renovacion-web",
    name: "Renovación web",
    claim: "¿Tu web parece de hace 10 años? Es hora de cambiarla.",
    summary:
      "Analizamos tu web actual, detectamos qué falla y la transformamos en una experiencia moderna, rápida y orientada a resultados.",
    includes: [
      "Análisis de la web actual",
      "Detección de errores",
      "Rediseño completo",
      "Mejora de velocidad",
      "Migración sin perder SEO",
      "Antes y después",
    ],
    icon: "RefreshCw",
    featured: true,
    metaTitle: "Renovación y rediseño de páginas web",
    metaDescription:
      "Rediseñamos webs anticuadas: análisis de lo que falla, rediseño moderno, mejora de velocidad y migración sin perder el posicionamiento.",
    h1: "De una web anticuada a una web que trabaja",
    intro: [
      "Una web desactualizada no es solo un problema estético. Transmite dejadez, va lenta, se ve mal en el móvil y hace que gente que estaba a punto de contactarte se vaya a otro sitio.",
      "La buena noticia es que casi nunca hay que empezar de cero. Normalmente hay contenido, posicionamiento e histórico que se pueden aprovechar. Lo primero es saber qué se conserva y qué se tira.",
    ],
    signals: [
      "Tu web se hizo hace años y no la has vuelto a tocar",
      "En el móvil hay que hacer zoom para leer o se descuadra",
      "Tarda en cargar y lo notas tú mismo al abrirla",
      "Te da reparo mandar el enlace a un cliente potencial",
    ],
    work: [
      {
        title: "Análisis de la web actual",
        description:
          "Velocidad, errores técnicos, estructura, contenido, visibilidad en Google y comportamiento de las visitas. El diagnóstico antes del tratamiento.",
      },
      {
        title: "Plan de mejoras",
        description:
          "Qué se conserva, qué se rehace y en qué orden, priorizando lo que más afecta a que entren clientes.",
      },
      {
        title: "Rediseño",
        description:
          "Diseño actual, mensaje ordenado y navegación clara, respetando tu identidad si funciona o actualizándola si no.",
      },
      {
        title: "Migración sin perder SEO",
        description:
          "Redirecciones una a una, URLs controladas y seguimiento posterior en Search Console para no perder el posicionamiento que ya tenías.",
      },
      {
        title: "Velocidad y accesibilidad",
        description:
          "Optimización de imágenes, código y fuentes, contraste suficiente y navegación con teclado.",
      },
      {
        title: "Antes y después",
        description:
          "Documentamos el punto de partida y el resultado, para que se vea con claridad qué ha cambiado.",
      },
    ],
    faqs: [
      {
        question: "¿Voy a perder el posicionamiento que tengo en Google?",
        answer:
          "No si la migración se hace bien. El riesgo real existe y por eso se planifican las redirecciones antes de publicar y se vigila Search Console las semanas siguientes. Es la parte del trabajo que más cuidado requiere.",
      },
      {
        question: "¿Es mejor renovar o hacer una web nueva?",
        answer:
          "Lo decide el análisis. Si la base técnica es razonable, se mejora. Si arrastra problemas de fondo, rehacerla sale más rentable que ir parcheando. Te decimos cuál de los dos casos es el tuyo antes de presupuestar.",
      },
      {
        question: "¿Puedo mantener mi dominio y mi correo?",
        answer:
          "Sí. El dominio y el correo son tuyos y se mantienen. Solo cambia a dónde apunta el dominio, y se hace de forma coordinada para que no haya cortes.",
      },
    ],
    related: ["diseno-web", "analisis-web-ia", "seo"],
  },
  {
    slug: "social-media",
    name: "Redes sociales",
    claim: "Construimos una marca que la gente recuerde.",
    summary:
      "Contenido con criterio: qué se publica, para quién y con qué objetivo. Nada de publicar por publicar.",
    includes: [
      "Estrategia de contenidos",
      "Calendario editorial",
      "Diseño y copywriting",
      "Reels y stories",
      "Gestión de perfiles",
      "Imagen de marca",
    ],
    icon: "Instagram",
    metaTitle: "Gestión de redes sociales para empresas",
    metaDescription:
      "Estrategia de contenidos, calendario editorial, diseño, copywriting y gestión de perfiles. Redes sociales con objetivo, no por rellenar.",
    h1: "Redes sociales con estrategia, no por rellenar el feed",
    intro: [
      "Publicar todos los días no es una estrategia. Lo que construye marca es saber qué quieres que piense la gente de ti y ser constante con ese mensaje.",
      "Trabajamos el contenido como parte del negocio: qué se cuenta, con qué tono y con qué objetivo, y qué hacemos con quien responde.",
    ],
    signals: [
      "Publicas a rachas, cuando te acuerdas o cuando tienes tiempo",
      "No sabes qué contar más allá de promociones",
      "Tu perfil no se parece a la calidad de tu trabajo real",
      "Recibes mensajes pero se quedan sin contestar días",
    ],
    work: [
      {
        title: "Estrategia y posicionamiento",
        description:
          "Qué quieres que se piense de tu marca, a quién le hablas y qué te diferencia de quien tienes al lado.",
      },
      {
        title: "Calendario editorial",
        description:
          "Temas, formatos y frecuencia planificados, para dejar de improvisar cada semana.",
      },
      {
        title: "Diseño y copywriting",
        description:
          "Piezas con identidad reconocible y textos que dicen algo, no frases de relleno con emojis.",
      },
      {
        title: "Reels y stories",
        description:
          "Formatos de vídeo pensados para tu negocio, con guiones sencillos que puedas grabar tú si hace falta.",
      },
      {
        title: "Gestión y comunidad",
        description:
          "Publicación, respuesta a comentarios y mensajes, y derivación de las consultas comerciales.",
      },
      {
        title: "Informes",
        description:
          "Qué contenido funcionó, qué se aprendió y qué se ajusta el mes siguiente.",
      },
    ],
    faqs: [
      {
        question: "¿En cuántas redes debería estar?",
        answer:
          "En las que esté tu cliente y puedas mantener con calidad. Para la mayoría de negocios locales, un Instagram bien trabajado rinde más que cinco perfiles abandonados.",
      },
      {
        question: "¿Tengo que aparecer yo en los vídeos?",
        answer:
          "No es obligatorio, pero ayuda. En negocios pequeños la cara detrás de la marca genera confianza. Si no te sientes cómodo, trabajamos con producto, proceso y resultados.",
      },
      {
        question: "¿Las redes traen clientes o solo seguidores?",
        answer:
          "Depende de para qué se usen. Si el objetivo es captar, el contenido se orienta a eso y se mide. Si el objetivo es marca, los resultados son más lentos y se notan en que la gente ya te conoce cuando llega. Lo definimos al principio para no medir mal.",
      },
    ],
    related: ["meta-ads", "diseno-web", "analisis-web-ia"],
  },
  {
    slug: "analisis-web-ia",
    name: "Análisis web + IA",
    claim: "Tu web tiene datos. Nosotros encontramos las oportunidades.",
    summary:
      "Combinamos análisis web e inteligencia artificial para detectar dónde pierdes clientes: UX, conversión, SEO, velocidad, contenido y embudos.",
    includes: [
      "Análisis de UX y conversión",
      "Revisión SEO y velocidad",
      "Contenido y estructura",
      "Análisis de competencia",
      "Embudos de conversión",
      "Plan de mejoras priorizado",
    ],
    icon: "Sparkles",
    featured: true,
    metaTitle: "Análisis web con IA · Auditoría de conversión",
    metaDescription:
      "Auditoría de tu web con análisis de datos e inteligencia artificial: UX, conversión, SEO, velocidad, contenido, competencia y embudos.",
    h1: "Análisis web con IA para saber dónde pierdes clientes",
    intro: [
      "Tu web ya está generando datos: qué páginas se visitan, dónde se abandona, qué se busca y qué no se encuentra. El problema es que casi nadie los mira.",
      "Cruzamos esos datos con inteligencia artificial para detectar patrones y puntos de fuga que a mano llevarían semanas, y los convertimos en una lista de mejoras ordenada por impacto.",
    ],
    signals: [
      "Tienes visitas pero muy pocos contactos y no sabes por qué",
      "Tienes Google Analytics instalado y nunca lo abres",
      "Sospechas que algo no funciona pero no sabes qué",
      "Antes de invertir más en publicidad quieres arreglar la web",
    ],
    work: [
      {
        title: "Recogida de datos",
        description:
          "Analítica, Search Console, velocidad y comportamiento de las visitas, comprobando primero que lo que se está midiendo es correcto.",
      },
      {
        title: "UX y conversión",
        description:
          "Dónde se abandona, qué fricciones hay en formularios y qué falta para que alguien se decida a contactar.",
      },
      {
        title: "SEO y velocidad",
        description:
          "Errores técnicos, indexación, Core Web Vitals y páginas que están perdiendo visibilidad.",
      },
      {
        title: "Contenido y estructura",
        description:
          "Qué se entiende y qué no, qué páginas sobran, cuáles faltan y cómo debería reorganizarse la navegación.",
      },
      {
        title: "Competencia",
        description:
          "Qué están haciendo mejor los que aparecen por encima de ti y qué hueco puedes ocupar tú.",
      },
      {
        title: "Plan priorizado",
        description:
          "Un informe con las mejoras ordenadas por impacto y esfuerzo, para que puedas ejecutarlas con quien quieras.",
      },
    ],
    faqs: [
      {
        question: "¿Qué me entregáis exactamente?",
        answer:
          "Un informe con los problemas detectados, las mejoras propuestas y su prioridad, más una reunión para explicártelo. Es un documento accionable, no cien páginas de gráficas.",
      },
      {
        question: "¿Para qué usáis la IA aquí?",
        answer:
          "Para procesar volumen: cruzar datos de analítica, contenido y competencia, y detectar patrones. La interpretación y las decisiones son nuestras. La IA acelera el análisis, no lo sustituye.",
      },
      {
        question: "¿Tengo que contratar la ejecución con vosotros?",
        answer:
          "No. El análisis se entrega como servicio independiente y puedes implementarlo tú o con tu equipo. Si prefieres que lo hagamos nosotros, te presupuestamos aparte.",
      },
    ],
    related: ["seo", "diseno-web", "renovacion-web"],
  },
];

export const getService = (slug: string) =>
  services.find((service) => service.slug === slug);

export const getServices = (slugs: ServiceSlug[]) =>
  slugs
    .map((slug) => services.find((service) => service.slug === slug))
    .filter(Boolean) as Service[];
