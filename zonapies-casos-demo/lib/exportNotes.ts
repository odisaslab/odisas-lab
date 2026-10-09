import { TOUR } from "./content";
import { STATE_LABEL } from "./domain";
import type { DemoState } from "./store";

const ANSWER: Record<string, string> = {
  si: "Sí, cuadra",
  ajustar: "Habría que ajustarlo",
  no: "No cuadra",
};

/** Resumen en Markdown de las notas y respuestas de la reunión (se genera en el navegador). */
export function buildNotesMarkdown(s: DemoState): string {
  const date = new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
  const lines: string[] = [];
  lines.push("# Zona Pies · Demo de la app «Casos»: notas de la reunión");
  lines.push("");
  lines.push(`Fecha: ${date}`);
  lines.push(`Estado del caso simulado al terminar: ${STATE_LABEL[s.case.state]}`);
  lines.push("");
  lines.push("> Demo con datos y análisis simulados. Estas notas pueden pegarse en el documento de requisitos.");
  lines.push("");
  let answered = 0;
  TOUR.forEach((step, i) => {
    const sv = s.survey[step.id];
    const note = (s.notes[step.id] ?? "").trim();
    lines.push(`## ${i + 1}. ${step.title}`);
    lines.push("");
    lines.push(`**¿Cuadra con vuestro proceso?** ${sv?.answer ? ANSWER[sv.answer] : "Sin responder"}`);
    if (sv?.answer) answered++;
    if (sv?.comment?.trim()) lines.push(`- Comentario: ${sv.comment.trim()}`);
    lines.push(`**Pregunta al cliente:** ${step.ask}`);
    lines.push("");
    lines.push(note ? `**Notas:**\n\n${note}` : "_Sin notas._");
    lines.push("");
  });
  lines.push("---");
  lines.push(`Pantallas valoradas: ${answered} de ${TOUR.length}.`);
  return lines.join("\n");
}
