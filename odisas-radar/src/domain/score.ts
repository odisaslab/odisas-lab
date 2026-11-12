import { ACTIVE_STATUSES, FACT_FIELDS, type Company, type Priority, type Report, type ScoreData } from './types';

/**
 * RADAR SCORE (0-100).
 *
 * El 90 % mide la oportunidad comercial (encaje, necesidad, potencial, tamaño y
 * urgencia). Solo el 10 % depende de lo fácil que sea contactar y de cuántos datos
 * hay: tener muchos datos de una empresa no la convierte en mejor cliente. La
 * fiabilidad del análisis se muestra aparte, como «confianza».
 */
export const WEIGHTS = { fit: 25, need: 25, potential: 20, size: 10, urgency: 10, contact: 5, data: 5 } as const;

export function priorityOf(total: number): Priority {
  return total >= 80 ? 'muy_alta' : total >= 65 ? 'alta' : total >= 45 ? 'media' : 'baja';
}

type ScoreInput = Pick<Company, 'employees' | 'sizeBand' | 'branches' | 'email' | 'phone' | 'contactFormUrl' | 'contactPerson' | 'facts' | 'website' | 'socials'>;

export function sizeScore(c: Pick<Company, 'employees' | 'sizeBand' | 'branches'>): { value: number; reason: string } {
  const band = c.sizeBand;
  const base = band === 'grande' ? 90 : band === 'mediana' ? 85 : band === 'pequena' ? 70 : band === 'micro' ? 40 : 50;
  const bonus = c.branches > 1 ? Math.min(15, (c.branches - 1) * 5) : 0;
  const size = band ? `tamaño ${band === 'pequena' ? 'pequeño' : band === 'mediana' ? 'mediano' : band}` : 'tamaño desconocido (valor neutro)';
  return { value: Math.min(100, base + bonus), reason: `${size}${c.employees ? `, ${c.employees} empleados` : ''}${c.branches > 1 ? `, ${c.branches} sedes` : ''}` };
}

export function contactScore(c: ScoreInput): { value: number; reason: string } {
  const parts: string[] = [];
  let v = 0;
  if (c.email) (v += 40), parts.push('correo corporativo');
  if (c.phone) (v += 30), parts.push('teléfono');
  if (c.contactFormUrl) (v += 15), parts.push('formulario');
  if (c.contactPerson || c.socials?.linkedin) (v += 15), parts.push(c.contactPerson ? 'persona de contacto' : 'LinkedIn');
  return { value: Math.min(100, v), reason: parts.length ? `Vías de contacto: ${parts.join(', ')}` : 'No se ha encontrado ninguna vía de contacto publicada' };
}

const KEY_FIELDS = ['name', 'sector', 'activity', 'description', 'city', 'website', 'email', 'phone', 'employees', 'legalName'] as const;

export function dataScore(c: ScoreInput): { value: number; reason: string; verified: number; total: number } {
  let pts = 0;
  let verified = 0;
  for (const f of KEY_FIELDS) {
    const fact = c.facts?.[f];
    if (fact?.status === 'verificado') (pts += 1), verified++;
    else if (fact?.status === 'estimado') pts += 0.5;
  }
  const missing = KEY_FIELDS.filter((f) => !c.facts?.[f] || c.facts[f].status === 'no_encontrado').map((f) => FACT_FIELDS[f].toLowerCase());
  return {
    value: Math.round((pts / KEY_FIELDS.length) * 100),
    verified,
    total: KEY_FIELDS.length,
    reason: `${verified} de ${KEY_FIELDS.length} datos clave verificados${missing.length ? `; faltan: ${missing.slice(0, 4).join(', ')}` : ''}`,
  };
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(Number.isFinite(n) ? n : 0)));

export function computeScore(company: ScoreInput, report: Report): ScoreData {
  const size = sizeScore(company);
  const contact = contactScore(company);
  const data = dataScore(company);
  const r = report.ratings;
  const rows: [keyof typeof WEIGHTS, string, number, string][] = [
    ['fit', 'Encaje con nuestros servicios', r.fit.value, r.fit.reason],
    ['need', 'Necesidad tecnológica detectada', r.need.value, r.need.reason],
    ['potential', 'Potencial de contratación', r.potential.value, r.potential.reason],
    ['size', 'Tamaño y actividad', size.value, size.reason],
    ['urgency', 'Urgencia aparente', r.urgency.value, r.urgency.reason],
    ['contact', 'Facilidad para contactar', contact.value, contact.reason],
    ['data', 'Calidad de la información', data.value, data.reason],
  ];
  const components = rows.map(([id, label, value, reason]) => {
    const v = clamp(value);
    return { id, label, weight: WEIGHTS[id], value: v, points: Math.round((v * WEIGHTS[id]) / 10) / 10, reason };
  });
  const total = clamp(components.reduce((s, c) => s + (c.value * c.weight) / 100, 0));
  const priority = priorityOf(total);
  const confidence = data.value >= 65 && report.engine === 'ia' ? 'alta' : data.value >= 40 ? 'media' : 'baja';

  const top = [...components].filter((c) => c.weight >= 10).sort((a, b) => b.value * b.weight - a.value * a.weight);
  const weak = [...components].filter((c) => c.weight >= 10 && c.value < 45).sort((a, b) => a.value - b.value);
  const explanation = [
    `${total}/100 · prioridad ${priority.replace('_', ' ')}. El 90 % de la nota mide la oportunidad comercial; el contacto y la cantidad de datos solo aportan el 10 %.`,
    ...top.slice(0, 2).map((c) => `Lo que más suma: ${c.label.toLowerCase()} (${c.value}/100). ${c.reason}`),
    ...weak.slice(0, 2).map((c) => `Lo que resta: ${c.label.toLowerCase()} (${c.value}/100). ${c.reason}`),
    confidence === 'baja'
      ? 'Confianza baja: hay pocos datos verificados, así que la nota puede cambiar al investigar más. Que falten datos no baja el potencial de la empresa.'
      : confidence === 'media'
        ? 'Confianza media: parte de la valoración se apoya en estimaciones que conviene validar.'
        : 'Confianza alta: la valoración se apoya en datos verificados.',
  ];
  return { total, priority, components, confidence, explanation };
}

/** ¿Lleva demasiado tiempo sin seguimiento? */
export function staleInfo(c: Pick<Company, 'status' | 'lastContactAt' | 'nextFollowupAt' | 'updatedAt'>, maxDays: number, now = new Date()): { stale: boolean; reason: string; days: number } {
  if (!ACTIVE_STATUSES.includes(c.status)) return { stale: false, reason: '', days: 0 };
  const day = 86400_000;
  if (c.nextFollowupAt && new Date(c.nextFollowupAt).getTime() < now.getTime()) {
    const days = Math.floor((now.getTime() - new Date(c.nextFollowupAt).getTime()) / day);
    return { stale: true, days, reason: days <= 0 ? 'El seguimiento previsto es hoy' : `Seguimiento previsto hace ${days} día${days === 1 ? '' : 's'}` };
  }
  if (c.nextFollowupAt) return { stale: false, reason: '', days: 0 };
  const last = new Date(c.lastContactAt ?? c.updatedAt).getTime();
  const days = Math.floor((now.getTime() - last) / day);
  return days >= maxDays ? { stale: true, days, reason: `${days} días sin actividad y sin próxima fecha de seguimiento` } : { stale: false, reason: '', days };
}
