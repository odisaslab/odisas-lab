import { LEAD_TIME } from "@/data/site";

/** Preguntas frecuentes: SOLO respuestas que se desprenden de datos confirmados por la web actual. */
const lead = LEAD_TIME.replace("3 días hábiles", "tres días hábiles");

export const faqPlantillas = [
  {
    q: "¿Qué plazo de fabricación tienen las plantillas?",
    a: `El plazo de fabricación es de aproximadamente ${lead} desde la recepción del pedido.`,
  },
  {
    q: "¿Hacéis envíos a toda España?",
    a: "Sí. Zona Pies realiza envíos a nivel nacional a podólogos, clínicas y centros especializados, incluidos los de Madrid y su área.",
  },
  {
    q: "¿Con qué materiales se fabrican las plantillas?",
    a: "Trabajamos con resina, composite, fibra de carbono, EVA, PA11 y memory, además de soluciones de amortiguación y suspensión y distintos forros.",
  },
  {
    q: "¿Para quién fabricáis?",
    a: "Para profesionales sanitarios: podólogos, clínicas podológicas, centros médicos, ortopedias y centros deportivos que necesitan un laboratorio fiable para fabricar ortesis plantares según sus prescripciones.",
  },
  {
    q: "¿Qué diferencia a Zona Pies de un laboratorio tradicional?",
    a: "Un sistema integral de escáner 3D, software de prescripción y fabricación avanzada: se escanea el pie, se automatiza el diseño y se fabrica la ortesis sin depender de procesos manuales ni de espumas.",
  },
  {
    q: "¿Dónde está el laboratorio?",
    a: "Zona Pies tiene su sede en Fuenlabrada (Madrid) y atiende a profesionales de toda España.",
  },
  {
    q: "¿Cómo solicito un presupuesto?",
    a: "Rellena el formulario de presupuesto gratuito, escríbenos por WhatsApp o llámanos. Te responderemos lo antes posible.",
  },
];
