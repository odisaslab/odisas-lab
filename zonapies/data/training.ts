/**
 * Formación (briefing §18). Contenido real de cursos, fechas y recursos pendiente:
 * `pending` marca cada bloque que debe proporcionar Zona Pies.
 */
export interface TrainingBlock {
  id: string;
  title: string;
  body: string;
  pending: string;
}

export const trainingBlocks: TrainingBlock[] = [
  {
    id: "cursos",
    title: "Cursos",
    body: "Formación específica sobre diseño y fabricación digital de ortesis plantares.",
    pending: "Catálogo de cursos, programa y duración",
  },
  {
    id: "formacion",
    title: "Formación profesional",
    body: "Itinerarios para profesionales que quieren incorporar el flujo digital a su consulta.",
    pending: "Metodología y contenidos",
  },
  {
    id: "eventos",
    title: "Eventos",
    body: "Próximas formaciones y encuentros con el equipo de Zona Pies.",
    pending: "Calendario de próximas formaciones",
  },
  {
    id: "recursos",
    title: "Recursos",
    body: "Material de apoyo para profesionales: guías, vídeos y documentación técnica.",
    pending: "Recursos descargables y vídeos",
  },
];
