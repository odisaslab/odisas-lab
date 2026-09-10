import type { ProcessStep } from "@/types";

export const processSteps: ProcessStep[] = [
  {
    step: "01",
    title: "Analizamos",
    description:
      "Negocio, mercado, competencia y presencia digital actual. Antes de proponer nada, entendemos dónde estás.",
  },
  {
    step: "02",
    title: "Detectamos",
    description:
      "Qué está frenando el crecimiento y qué oportunidades no se están aprovechando.",
  },
  {
    step: "03",
    title: "Diseñamos",
    description:
      "Una estrategia concreta: qué canales, con qué mensaje, con qué prioridad y con qué objetivo.",
  },
  {
    step: "04",
    title: "Ejecutamos",
    description:
      "Web, campañas, contenidos y SEO. Trabajo hecho, no presentaciones bonitas.",
  },
  {
    step: "05",
    title: "Optimizamos",
    description:
      "Medimos resultados, aprendemos de los datos y mejoramos lo que ya funciona.",
  },
];

export const pillars = [
  {
    step: "01",
    title: "Estrategia",
    description: "Antes de hacer, analizamos. Sin diagnóstico no hay plan.",
  },
  {
    step: "02",
    title: "Ejecución",
    description: "Convertimos la estrategia en acciones concretas y medibles.",
  },
  {
    step: "03",
    title: "Optimización",
    description: "Medimos, aprendemos y mejoramos de forma continua.",
  },
];

/**
 * Versión ampliada de la metodología para la página /proceso.
 * Cada paso explica qué hacemos, qué recibes y qué necesitamos de ti.
 */
export const processDetail = [
  {
    step: "01",
    title: "Analizamos",
    summary:
      "Antes de proponer nada, entendemos dónde estás. Sin diagnóstico, cualquier plan es una suposición.",
    weDo: [
      "Revisamos tu negocio: qué vendes, a quién y con qué margen",
      "Auditamos tu web: velocidad, estructura, contenido y errores técnicos",
      "Miramos tus datos reales de analítica y Search Console",
      "Analizamos a quién tienes por delante en Google y en redes",
    ],
    youGet: "Un diagnóstico claro de tu situación digital, sin tecnicismos innecesarios.",
    fromYou: "Accesos de lectura a tu web y a tus cuentas de analítica y publicidad.",
  },
  {
    step: "02",
    title: "Detectamos",
    summary:
      "De todo lo que se puede mejorar, identificamos qué está frenando el crecimiento de verdad.",
    weDo: [
      "Señalamos los puntos de fuga: dónde llegan visitas y no pasa nada",
      "Separamos lo urgente de lo importante y de lo que puede esperar",
      "Detectamos oportunidades que no estás aprovechando",
      "Descartamos acciones que en tu caso no compensan",
    ],
    youGet: "Una lista de problemas y oportunidades ordenada por impacto y esfuerzo.",
    fromYou: "Una conversación honesta sobre presupuesto, plazos y prioridades.",
  },
  {
    step: "03",
    title: "Diseñamos",
    summary:
      "La estrategia concreta: qué canales, con qué mensaje, en qué orden y con qué objetivo.",
    weDo: [
      "Definimos objetivos medibles, no intenciones",
      "Elegimos los canales que encajan con tu negocio y tu presupuesto",
      "Trabajamos el mensaje: qué te diferencia y cómo se cuenta",
      "Planificamos el calendario y el reparto de la inversión",
    ],
    youGet: "Un plan por escrito con acciones, plazos y responsables de cada parte.",
    fromYou: "Validación del plan antes de mover un dedo. Nada empieza sin tu visto bueno.",
  },
  {
    step: "04",
    title: "Ejecutamos",
    summary:
      "Web, campañas, contenidos y SEO. Trabajo hecho, no presentaciones bonitas.",
    weDo: [
      "Construimos y publicamos lo acordado",
      "Configuramos la medición antes de lanzar, no después",
      "Te mantenemos al día de qué se está haciendo y en qué punto está",
      "Ajustamos sobre la marcha cuando los datos dicen otra cosa",
    ],
    youGet: "El trabajo entregado y funcionando, con la medición bien montada.",
    fromYou: "Materiales que solo tú tienes: fotos reales, datos del negocio, respuestas rápidas.",
  },
  {
    step: "05",
    title: "Optimizamos",
    summary:
      "Medimos resultados, aprendemos de los datos y mejoramos lo que ya funciona.",
    weDo: [
      "Revisamos qué está rindiendo y qué no",
      "Reasignamos presupuesto y esfuerzo a lo que trae clientes",
      "Probamos cambios de uno en uno para saber qué los provoca",
      "Te explicamos qué se cambió, por qué y qué esperamos que pase",
    ],
    youGet: "Un informe periódico legible y una reunión para comentarlo.",
    fromYou: "Feedback de lo que ves desde dentro: qué clientes entran y de dónde vienen.",
  },
];

/** Lo que hace falta por tu parte para que un proyecto salga bien. */
export const collaboration = [
  {
    title: "Acceso a la información",
    description:
      "Cuanto antes tengamos accesos y datos del negocio, antes empieza el trabajo de verdad.",
  },
  {
    title: "Una persona que decida",
    description:
      "Alguien que pueda validar y responder. Los proyectos que se atascan casi siempre se atascan aquí.",
  },
  {
    title: "Sinceridad con el presupuesto",
    description:
      "Saber cuánto hay disponible nos permite proponer lo que encaja, no lo que suena bien.",
  },
  {
    title: "Paciencia con lo que la requiere",
    description:
      "La publicidad se ve rápido. El SEO y la marca, no. Conviene tenerlo claro desde el día uno.",
  },
];
