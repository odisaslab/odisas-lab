import { LEAD_TIME } from "@/data/site";

/**
 * Preguntas frecuentes. Las seis primeras son las de la home real de zonapies.es (08/10/2026),
 * ajustadas solo para incluir PA11 y el plazo; el resto se desprenden de datos confirmados.
 */
const lead = LEAD_TIME.replace("3 días hábiles", "tres días hábiles");

export const faqPlantillas = [
  {
    q: "¿Qué tipos de plantillas a medida fabricáis y para qué sirven?",
    a: "Fabricamos plantillas de distintos materiales (resina, composite, fibra de carbono, EVA y PA11) pensadas para aliviar dolor, corregir la pisada, prevenir lesiones o mejorar el rendimiento diario o deportivo.",
  },
  {
    q: "¿En qué comunidades autónomas ofrecéis plantillas ortopédicas a medida?",
    a: "Fabricamos y enviamos plantillas ortopédicas a medida en toda España. Trabajamos en Andalucía, Aragón, Asturias, Baleares, Canarias, Cantabria, Castilla-La Mancha, Castilla y León, Cataluña, Comunidad Valenciana, Extremadura, Galicia, La Rioja, Madrid, Murcia, Navarra y País Vasco.",
  },
  {
    q: "¿Cómo funciona el proceso de escaneo 3D de los pies?",
    a: "Utilizamos escaneo 3D avanzado para capturar la forma exacta de los pies. Es un proceso rápido, cómodo y mucho más preciso que los métodos tradicionales, y permite diseñar plantillas ajustadas a cada anatomía.",
  },
  {
    q: "¿Qué materiales utilizáis en las plantillas personalizadas?",
    a: "Trabajamos con materiales técnicos de alta calidad: resina, EVA, composite, fibra de carbono y PA11, además de distintos forros que optimizan confort, control y durabilidad.",
  },
  {
    q: "¿Cuál es el tiempo de fabricación y envío a nivel nacional?",
    a: `El tiempo de fabricación es de aproximadamente ${lead} desde que recibimos el pedido hasta la entrega final, con envíos a toda España.`,
  },
  {
    q: "¿Puedo pedir plantillas para profesionales de la salud o centros podológicos?",
    a: "Sí. Ofrecemos soluciones específicas para profesionales de la salud, clínicas podológicas y centros especializados, con acabados adaptados a cada caso clínico.",
  },
  {
    q: "¿Qué diferencia a Zona Pies de un laboratorio tradicional?",
    a: "Un sistema integral de escáner 3D, software de prescripción y fabricación avanzada: se escanea el pie, se automatiza el diseño y se fabrica la ortesis sin depender de procesos manuales ni de espumas.",
  },
  {
    q: "¿Dónde está el laboratorio?",
    a: "En Calle Zarzuela, 10, Pol. Ind. Cordel de la Carrera, 28942 Fuenlabrada (Madrid). Atendemos a profesionales de toda España.",
  },
  {
    q: "¿Cómo solicito un presupuesto?",
    a: "Rellena el formulario de presupuesto gratuito, escríbenos por WhatsApp o llámanos. Te responderemos lo antes posible.",
  },
];
