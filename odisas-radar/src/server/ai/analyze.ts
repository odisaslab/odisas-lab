import 'server-only';
import { z } from 'zod';
import { rulesReport } from '@/domain/rules';
import { computeScore } from '@/domain/score';
import { webFindings } from '@/domain/site';
import { CATEGORIES, FACT_FIELDS, MESSAGE_KINDS, SERVICES, SERVICE_IDS, SIZE_BANDS, STATUSES, WEB_STATUSES, type Company, type MessageKind, type Report } from '@/domain/types';
import { optOutFooter, templateMessage } from '@/domain/templates';
import { addActivity, getCompany, setFact } from '../companies';
import { nowIso, q } from '../db';
import { getSettings } from '../settings';
import { update } from '../sql';
import { AiError, aiAvailable, structured } from './client';

const COMPANY_PROFILE = `Odisas Lab es una empresa tecnológica española. Servicios:
${SERVICE_IDS.map((id) => `- ${id}: ${SERVICES[id]}`).join('\n')}`;

const rating = z.object({ value: z.number().describe('0 a 100'), reason: z.string().describe('Una frase con el motivo, citando el dato en que se apoya') });
const ReportSchema = z.object({
  description: z.string().describe('2-3 frases sobre a qué se dedica la empresa, solo con lo que consta en los datos'),
  category: z.enum(['industrial', 'distribucion', 'comercial', 'servicios', 'otro']),
  sizeEstimate: z.enum(['micro', 'pequena', 'mediana', 'grande', 'desconocido']).describe('Solo si hay indicios en los datos; si no, desconocido'),
  sizeBasis: z.string().describe('En qué se basa la estimación de tamaño, o cadena vacía'),
  observed: z.array(z.object({ title: z.string(), evidence: z.string().describe('El hecho concreto y dónde consta') })).describe('Necesidades OBSERVADAS: hechos comprobados en los datos aportados'),
  hypotheses: z.array(z.object({ title: z.string(), rationale: z.string().describe('Por qué es plausible'), validate: z.string().describe('Qué preguntar en una reunión para confirmarlo') })).describe('Oportunidades NO comprobadas que habría que validar'),
  problems: z.array(z.string()).describe('Problemas que podría tener, redactados en condicional'),
  services: z.array(z.object({ id: z.enum(SERVICE_IDS as [string, ...string[]]), fit: z.enum(['alto', 'medio', 'bajo']), why: z.string() })),
  whyInterested: z.string(),
  proposal: z.string().describe('Propuesta comercial concreta para un primer contacto'),
  missing: z.array(z.string()).describe('Información que falta por investigar'),
  ratings: z.object({ fit: rating, need: rating, potential: rating, urgency: rating }),
  flags: z.object({ automation: z.boolean().describe('Tiene procesos susceptibles de automatización'), ai: z.boolean().describe('Podría beneficiarse de inteligencia artificial') }),
  nextAction: z.string().describe('Siguiente acción comercial recomendada, en una frase'),
});

const ANALYST = `Eres analista comercial de Odisas Lab. Evalúas si una empresa puede necesitar sus servicios, para que el equipo decida a quién contactar.

${COMPANY_PROFILE}

Reglas, por orden de importancia:
1. Solo puedes afirmar lo que aparece en los datos que recibes. No inventes cifras, nombres, clientes, herramientas ni problemas. Si un dato no consta, dilo en «missing».
2. Separa siempre dos cosas. «observed» son hechos comprobados (por ejemplo: la web no es adaptable a móviles, no hay formulario, el copyright es de 2017). «hypotheses» son suposiciones razonables por el tipo de empresa (por ejemplo: gestionan los pedidos a mano) y cada una lleva la pregunta con la que se validaría en una reunión. Nunca presentes una hipótesis como un problema confirmado.
3. Las valoraciones miden la oportunidad comercial, no la cantidad de datos. Una empresa con pocos datos no puntúa menos por eso: puntúa según lo que se sabe y se deja constancia de la incertidumbre en el motivo. Una web muy completa tampoco hace a una empresa mejor cliente.
   - fit: cuánto encaja lo que hace la empresa con los servicios.
   - need: cuánta necesidad tecnológica hay, ponderando más lo comprobado que lo supuesto.
   - potential: probabilidad de que contrate y tamaño posible del proyecto (tamaño, actividad, sedes, indicios de crecimiento).
   - urgency: si hay algo que apremie ahora (web caída, sin HTTPS, expansión en curso). Sin indicios, valor bajo.
4. Sé concreto y sobrio. Escribe en español de España, sin adjetivos comerciales.`;

function dossier(c: Company): string {
  const facts = Object.entries(c.facts)
    .filter(([k]) => k in FACT_FIELDS)
    .map(([k, f]) => `- ${FACT_FIELDS[k as keyof typeof FACT_FIELDS]}: ${f.status === 'no_encontrado' ? 'NO ENCONTRADO' : `${f.value} [${f.status}; fuente: ${f.source}]`}`)
    .join('\n');
  const s = c.audit?.ok ? c.audit.signals : null;
  const web = !c.website
    ? 'No se ha encontrado página web.'
    : !c.audit
      ? 'La web no se ha revisado todavía.'
      : !c.audit.ok
        ? `No se ha podido leer la web: ${c.audit.error}`
        : [
            `Estado: ${WEB_STATUSES[c.webStatus]}. Diagnóstico técnico de la portada: ${c.audit.score ?? 's/d'}/100.`,
            s && `Señales medidas: HTTPS ${s.https ? 'sí' : 'no'}; adaptable a móvil ${s.responsive ? 'sí' : 'no'}; año de copyright ${s.copyrightYear ?? 'no consta'}; plataforma ${s.generator ?? 'no identificada'}; tienda online ${s.ecommerce ? 'sí' : 'no'}; chat o asistente ${s.chat ? 'sí' : 'no'}; WhatsApp ${s.whatsapp ? 'sí' : 'no'}; formulario ${s.form ? 'sí' : 'no'}; reserva online ${s.booking ? 'sí' : 'no'}; área de clientes ${s.clientArea ? 'sí' : 'no'}; catálogo en PDF ${s.catalogPdf ? 'sí' : 'no'}; sección de empleo ${s.careers ? 'sí' : 'no'}; idiomas ${s.languages}; analítica ${s.analytics ? 'sí' : 'no'}.`,
            webFindings(c.audit).length ? `Carencias medidas: ${webFindings(c.audit).join(' ')}` : '',
            c.audit.issues?.length ? `Problemas del diagnóstico:\n${c.audit.issues.slice(0, 10).map((i) => `  · [${i.severity}] ${i.title}: ${i.evidence}`).join('\n')}` : '',
            `Título: ${c.audit.title || '—'}`,
            `Texto visible de la web (recortado):\n"""\n${c.audit.text ?? ''}\n"""`,
          ]
            .filter(Boolean)
            .join('\n');
  return `EMPRESA: ${c.name}
Tipo según la fuente: ${CATEGORIES[c.category]}${c.sector ? ` · sector ${c.sector}` : ''}
Ubicación: ${[c.city, c.province].filter(Boolean).join(', ') || 'no consta'}
Sedes conocidas: ${c.branches}
Tamaño conocido: ${c.sizeBand ? SIZE_BANDS[c.sizeBand] : 'no consta'}

DATOS Y SU PROCEDENCIA
${facts || '- (sin datos)'}

PÁGINA WEB
${web}`;
}

/** Analiza la empresa (con IA si hay clave; si no, por reglas), calcula el RADAR SCORE y lo guarda. */
export async function analyzeCompany(id: string, opts: { forceRules?: boolean } = {}): Promise<Company> {
  const c = await getCompany(id);
  let report: Report | null = null;
  let aiNote = '';
  const patch: Record<string, unknown> = {};
  const facts = { ...c.facts };

  if (!opts.forceRules && (await aiAvailable())) {
    try {
      const { data, model } = await structured(ReportSchema, ANALYST, dossier(c), { maxTokens: 6000, effort: 'medium' });
      const clamp = (r: { value: number; reason: string }) => ({ value: Math.max(0, Math.min(100, Math.round(r.value))), reason: r.reason });
      report = {
        engine: 'ia',
        model,
        createdAt: nowIso(),
        description: data.description,
        observed: data.observed,
        hypotheses: data.hypotheses,
        problems: data.problems,
        services: data.services as Report['services'],
        whyInterested: data.whyInterested,
        proposal: data.proposal,
        missing: data.missing,
        ratings: { fit: clamp(data.ratings.fit), need: clamp(data.ratings.need), potential: clamp(data.ratings.potential), urgency: clamp(data.ratings.urgency) },
        flags: data.flags,
        nextAction: data.nextAction,
      };
      if (c.category === 'otro' && data.category !== 'otro') patch.category = data.category;
      // El tamaño que deduce la IA es una estimación y así queda anotado.
      if (!c.sizeBand && data.sizeEstimate !== 'desconocido') {
        patch.sizeBand = data.sizeEstimate;
        setFact(facts, 'sizeBand', SIZE_BANDS[data.sizeEstimate], 'estimado', `Estimación de la IA${data.sizeBasis ? `: ${data.sizeBasis}` : ''}`);
      }
      if (!c.description) patch.description = data.description;
    } catch (error) {
      aiNote = error instanceof AiError ? error.message : 'La IA no ha podido completar el análisis.';
    }
  }
  if (!report) report = rulesReport({ ...c, ...(patch as Partial<Company>) });
  if (aiNote) report.missing = [`Análisis con IA no disponible (${aiNote}). Este informe se ha generado por reglas.`, ...report.missing];

  const merged = { ...c, ...(patch as Partial<Company>), facts };
  const scoreData = computeScore(merged, report);
  const early = c.status === 'nueva' || c.status === 'pendiente_investigar';
  await update('companies', id, {
    ...patch,
    facts,
    report,
    scoreData,
    score: scoreData.total,
    priority: scoreData.priority,
    oppAutomation: report.flags.automation,
    oppAi: report.flags.ai,
    nextAction: c.nextAction && !early ? c.nextAction : report.nextAction,
    analyzedAt: nowIso(),
    updatedAt: nowIso(),
    ...(early ? { status: 'analizada' } : {}),
  });
  if (early) await addActivity(id, 'estado', `${STATUSES[c.status]} → ${STATUSES.analizada} · RADAR SCORE ${scoreData.total}`, '', null, { from: c.status, to: 'analizada' });
  return getCompany(id);
}

// ——— Mensajes comerciales ———
const MessageSchema = z.object({ subject: z.string().describe('Asunto; cadena vacía si el formato no lleva asunto'), body: z.string() });

const WRITER = `Redactas comunicaciones comerciales para Odisas Lab, de persona a persona, a partir de la ficha de una empresa ya investigada.

${COMPANY_PROFILE}

Cómo debe ser el mensaje:
- Tiene que notarse que se ha mirado esa empresa en concreto. Abre con algo específico suyo (qué hacen, dónde, algo comprobado en su web) y explica por qué se le escribe a ella.
- Usa solo datos de la ficha. Los hechos «comprobados» puedes afirmarlos; las «hipótesis» solo pueden aparecer como pregunta o posibilidad, nunca como algo que ya sabes de ellos.
- Señala una carencia con tacto: describe lo observado y lo que se ganaría, sin juzgar su trabajo.
- Nada de fórmulas genéricas («somos una empresa tecnológica», «nos ponemos en contacto para ofrecerle nuestros servicios», «soluciones innovadoras», «líderes en»). Sin listas de servicios: como mucho uno o dos, los que encajan.
- Una sola petición clara al final, pequeña (una llamada corta, una respuesta).
- Español de España, trato de tú salvo que el sector pida usted, frases cortas, sin exclamaciones ni emojis.
- No inventes nombres de personas, clientes, cifras ni casos de éxito. Si falta el nombre del destinatario, usa un saludo neutro.
- Firma con los datos del remitente tal como se dan; omite los que estén vacíos.`;

const KIND_BRIEF: Record<MessageKind, string> = {
  email: 'Correo de primer contacto. Asunto concreto de menos de 60 caracteres, que no parezca publicidad. Cuerpo de 90 a 140 palabras.',
  seguimiento: 'Correo de seguimiento tras un primer mensaje sin respuesta. Breve (50-80 palabras), aporta un dato o ángulo nuevo de la ficha en vez de repetir, y da una salida fácil para decir que no.',
  llamada: 'Guion de llamada en frío, en bloques con título en mayúsculas: APERTURA, MOTIVO (10 segundos), PREGUNTAS PARA VALIDAR (las de las hipótesis), PROPUESTA, OBJECIONES PROBABLES (2-3 con respuesta) y CIERRE. Frases que se puedan decir en voz alta.',
  linkedin: 'Mensaje de LinkedIn de menos de 300 caracteres, sin asunto, sin firma larga.',
  reunion: 'Correo proponiendo una reunión de 30 minutos tras un primer contacto positivo: 3 puntos concretos a tratar, sacados de la ficha, y propuesta de fecha.',
  resumen: 'Resumen interno para preparar una llamada (no se envía al cliente): EMPRESA, COMPROBADO, A VALIDAR, SERVICIOS QUE ENCAJAN, RIESGOS Y OBJECIONES, OBJETIVO DE LA LLAMADA. Con viñetas breves.',
};

export async function draftMessage(companyId: string, kind: MessageKind, instructions = ''): Promise<{ subject: string; body: string; engine: 'ia' | 'plantilla'; note?: string }> {
  const c = await getCompany(companyId);
  const { sender, optOutFooter: footer } = await getSettings();
  const legal = footer && (kind === 'email' || kind === 'seguimiento' || kind === 'reunion') ? optOutFooter(sender) : '';
  let note: string | undefined;
  if (await aiAvailable()) {
    const r = c.report;
    const history = await q<{ type: string; summary: string; at: string }>("SELECT type, summary, at FROM activities WHERE company_id = $1 AND type NOT IN ('sistema','estado') ORDER BY at DESC LIMIT 6", [companyId]);
    const brief = `FORMATO: ${MESSAGE_KINDS[kind]}. ${KIND_BRIEF[kind]}
${instructions ? `INDICACIONES DE QUIEN LO VA A ENVIAR: ${instructions}\n` : ''}
REMITENTE
Nombre: ${sender.name || '(sin indicar)'} · Cargo: ${sender.role || '—'} · Empresa: ${sender.company} · Teléfono: ${sender.phone || '—'} · Correo: ${sender.email || '—'} · Enlace para agendar: ${sender.meetingUrl || '—'}

DESTINATARIO
Empresa: ${c.name}${c.contactPerson ? ` · Persona de contacto: ${c.contactPerson}` : ' · Persona de contacto: no consta'}
Actividad: ${c.activity || c.sector || '—'} · Tipo: ${CATEGORIES[c.category]} · Ubicación: ${[c.city, c.province].filter(Boolean).join(', ') || '—'} · Sedes: ${c.branches}
Web: ${c.website || 'no tiene'} (${WEB_STATUSES[c.webStatus]})
Estado comercial: ${STATUSES[c.status]}

FICHA
Descripción: ${r?.description ?? c.description ?? '—'}
Comprobado:
${(r?.observed ?? []).map((o) => `- ${o.title}: ${o.evidence}`).join('\n') || '- (nada comprobado)'}
Hipótesis a validar:
${(r?.hypotheses ?? []).map((h) => `- ${h.title} (${h.rationale}) → preguntar: ${h.validate}`).join('\n') || '- (ninguna)'}
Servicios que encajan: ${(r?.services ?? []).filter((s) => s.fit !== 'bajo').map((s) => `${SERVICES[s.id]} (${s.why})`).join('; ') || '—'}
Propuesta prevista: ${r?.proposal ?? '—'}
Contactos anteriores: ${history.map((h) => `${h.at.slice(0, 10)} ${h.type}: ${h.summary}`).join(' | ') || 'ninguno'}`;
    try {
      const { data } = await structured(MessageSchema, WRITER, brief, { maxTokens: 3000, effort: 'medium' });
      return { subject: data.subject.trim(), body: data.body.trim() + legal, engine: 'ia' };
    } catch (error) {
      note = `No se ha podido usar la IA (${error instanceof Error ? error.message : 'error'}). Se ha generado un borrador con plantilla.`;
    }
  }
  const t = templateMessage(kind, c, c.report, sender);
  return { subject: t.subject, body: t.body + legal, engine: 'plantilla', note: note ?? 'Borrador de plantilla: configura la clave de IA para mensajes realmente personalizados.' };
}
