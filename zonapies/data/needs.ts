/**
 * Contenido adaptativo del selector «¿Qué necesitas?» (briefing §8).
 * Los valores coinciden con data/quote.ts para precargar el formulario.
 */
export interface NeedDetail {
  value: "fabricacion" | "shell" | "sistemas";
  tag: string;
  headline: string;
  lead: string;
  /** Qué haces tú / qué hacemos nosotros / qué recibes */
  you: string;
  us: string;
  result: string;
  cta: string;
  /** Pendiente de contenido real (catálogo, condiciones…) */
  pending?: string;
}

export const needDetails: NeedDetail[] = [
  {
    value: "fabricacion",
    tag: "Externaliza la fabricación",
    headline: "Tú prescribes. Nosotros fabricamos.",
    lead: "Para profesionales que quieren externalizar la fabricación de sus plantillas y centrarse en sus pacientes.",
    you: "Envías el escaneo y la prescripción.",
    us: "Diseñamos y fabricamos la ortesis a medida.",
    result: "Recibes la pieza lista para tu paciente, en aproximadamente tres días hábiles desde la recepción del pedido.",
    cta: "Solicitar presupuesto",
  },
  {
    value: "shell",
    tag: "Solo el shell",
    headline: "Nosotros la base. Tú el acabado.",
    lead: "Para profesionales que realizan parte del proceso en su centro y necesitan el shell fabricado con precisión.",
    you: "Defines el caso y completas el proceso en tu centro.",
    us: "Fabricamos el shell con materiales técnicos.",
    result: "Recibes la base para terminar la ortesis con tu criterio.",
    cta: "Pedir presupuesto del shell",
  },
  {
    value: "sistemas",
    tag: "Fabrica tus plantillas",
    headline: "Tu propia producción, con nuestra tecnología.",
    lead: "Para profesionales que quieren fabricar sus propias plantillas. Soluciones y sistemas disponibles: escáner 3D, software de prescripción y fabricación avanzada.",
    you: "Eliges el sistema que encaja con tu centro.",
    us: "Te explicamos las soluciones y sistemas disponibles.",
    result: "Produces tus plantillas con un flujo digital completo.",
    cta: "Quiero información de sistemas",
    pending: "Catálogo y condiciones de los sistemas: pendiente de proporcionar por Zona Pies",
  },
];
