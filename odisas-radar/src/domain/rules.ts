import { CATEGORIES, FACT_FIELDS, SERVICES, WEB_STATUSES, type Company, type Report, type ServiceId } from './types';
import { webFindings } from './site';

/**
 * Análisis por reglas: se usa cuando no hay clave de IA configurada (o si la IA falla).
 * Solo afirma lo medido en la web pública; todo lo demás va como hipótesis a validar.
 */
type Input = Pick<Company, 'name' | 'category' | 'sector' | 'activity' | 'description' | 'city' | 'province' | 'website' | 'webStatus' | 'audit' | 'employees' | 'sizeBand' | 'branches' | 'email' | 'phone' | 'facts'>;

export function rulesReport(c: Input, now = new Date()): Report {
  const s = c.audit?.ok ? c.audit.signals : undefined;
  const observed: Report['observed'] = [];
  const hypotheses: Report['hypotheses'] = [];
  const problems: string[] = [];
  const services = new Map<ServiceId, { fit: 'alto' | 'medio' | 'bajo'; why: string }>();
  const want = (id: ServiceId, fit: 'alto' | 'medio' | 'bajo', why: string) => {
    const rank = { alto: 3, medio: 2, bajo: 1 };
    const cur = services.get(id);
    if (!cur || rank[fit] > rank[cur.fit]) services.set(id, { fit, why });
  };

  // ——— Hechos observados ———
  if (c.webStatus === 'sin_web') {
    observed.push({ title: 'No se ha encontrado página web', evidence: 'Ninguna de las fuentes consultadas publica una web de la empresa.' });
    want('web', 'alto', 'No tiene presencia web propia localizable.');
    problems.push('Podría estar perdiendo clientes que buscan proveedores en internet.');
  } else if (c.webStatus === 'caida') {
    observed.push({ title: 'La web no responde', evidence: c.audit?.error ?? 'La dirección publicada no carga.' });
    want('web', 'alto', 'La web publicada no está operativa.');
    problems.push('Quien intente informarse por la web no puede hacerlo.');
  } else if (c.webStatus === 'desactualizada' || c.webStatus === 'mejorable') {
    for (const f of webFindings(c.audit, now)) observed.push({ title: WEB_STATUSES[c.webStatus], evidence: f });
    want('web', c.webStatus === 'desactualizada' ? 'alto' : 'medio', 'La web presenta carencias técnicas medidas.');
  }
  for (const i of (c.audit?.issues ?? []).filter((x) => x.severity === 'critical' || x.severity === 'high').slice(0, 3)) {
    observed.push({ title: i.title, evidence: i.evidence });
  }
  if (s) {
    if (!s.form && !s.whatsapp) observed.push({ title: 'Sin formulario ni WhatsApp en la portada', evidence: 'No se detecta formulario de contacto ni enlace a WhatsApp.' });
    if (!s.chat) hypotheses.push({ title: 'Atención al cliente sin automatizar', rationale: 'La web no carga ningún asistente ni chat.', validate: 'Preguntar cuántas consultas repetitivas reciben y por qué canal.' });
    if (s.catalogPdf && !s.ecommerce) {
      observed.push({ title: 'Catálogo en PDF', evidence: 'La web enlaza un catálogo o tarifa descargable y no tiene tienda o área de pedidos.' });
      want('software', 'medio', 'Un catálogo digital con pedidos sustituiría al PDF.');
    }
    if (s.careers) observed.push({ title: 'Publica ofertas de empleo', evidence: 'La web tiene una sección de empleo: indicio de actividad o crecimiento.' });
  }
  if (c.branches > 1) observed.push({ title: 'Varias sedes o establecimientos', evidence: `Constan ${c.branches} ubicaciones en la fuente consultada.` });

  // ——— Hipótesis según el tipo de empresa ———
  const cat = c.category;
  if (cat === 'industrial') {
    hypotheses.push(
      { title: 'Procesos productivos con margen de mejora', rationale: 'Es habitual en empresas industriales de este tamaño; no hay evidencia directa.', validate: 'Recorrer el flujo de producción y medir tiempos y reprocesos.' },
      { title: 'Documentación y partes gestionados a mano', rationale: 'Suposición propia del sector, sin comprobar.', validate: 'Preguntar cómo registran órdenes, partes y calidad.' },
    );
    want('procesos', 'alto', 'Encaje natural con empresas industriales.');
    want('automatizacion', 'medio', 'Tareas repetitivas de planta y oficina técnica.');
    want('software', 'medio', 'Gestión a medida de producción y documentación.');
    want('ia', 'bajo', 'A valorar tras conocer sus datos y procesos.');
  } else if (cat === 'distribucion') {
    hypotheses.push(
      { title: 'Pedidos gestionados por teléfono o correo', rationale: s?.ecommerce || s?.clientArea ? 'Tiene canal online; habría que ver cuánto se usa.' : 'No se detecta canal de pedidos online.', validate: 'Preguntar cómo entran los pedidos y cuánto tiempo consumen.' },
      { title: 'Catálogo difícil de mantener actualizado', rationale: 'Frecuente en distribución; sin evidencia directa.', validate: 'Preguntar cómo actualizan precios y referencias.' },
    );
    want('automatizacion', 'alto', 'Pedidos, stock y avisos a clientes son automatizables.');
    want('software', 'alto', 'Catálogo digital y área de pedidos para clientes.');
    want('ia', 'medio', 'Atención automática de consultas de producto y pedidos.');
  } else if (cat === 'comercial') {
    hypotheses.push({ title: 'Venta online poco desarrollada', rationale: s?.ecommerce ? 'Tiene tienda online; habría que revisar su rendimiento.' : 'No se detecta tienda online.', validate: 'Preguntar qué parte de la venta llega por internet.' });
    want('web', s?.ecommerce ? 'medio' : 'alto', 'La web es su escaparate principal.');
    want('digitalizacion', 'medio', 'Captación y fidelización de clientes.');
    want('ia', 'bajo', 'Atención al cliente fuera de horario.');
  } else {
    hypotheses.push({ title: 'Citas, presupuestos y consultas gestionados a mano', rationale: s?.booking ? 'Hay reserva online; habría que ver si cubre todo el proceso.' : 'No se detecta reserva ni solicitud online.', validate: 'Preguntar cómo gestionan citas, presupuestos y seguimiento.' });
    want('automatizacion', 'medio', 'Citas, recordatorios y presupuestos.');
    want('digitalizacion', 'medio', 'Ordenar la gestión diaria del negocio.');
    want('ia', 'bajo', 'Respuesta automática a consultas frecuentes.');
  }
  if (c.branches > 1) want('software', 'medio', 'Varias sedes suelen necesitar gestión unificada.');

  // ——— Valoraciones ———
  const webNeed = { sin_web: 85, caida: 85, desactualizada: 75, mejorable: 50, correcta: 20, desconocido: 35 }[c.webStatus];
  const catFit = { industrial: 75, distribucion: 80, comercial: 60, servicios: 60, otro: 45 }[cat];
  const sizeUp = c.sizeBand === 'mediana' || c.sizeBand === 'grande' ? 20 : c.sizeBand === 'pequena' ? 10 : c.sizeBand === 'micro' ? -15 : 0;
  const potential = Math.max(15, Math.min(90, 45 + sizeUp + (c.branches > 1 ? 10 : 0) + (s?.careers ? 5 : 0)));
  const urgency = c.webStatus === 'caida' ? 80 : c.webStatus === 'sin_web' ? 60 : s && !s.https ? 60 : c.webStatus === 'desactualizada' ? 50 : 25;

  const missing: string[] = (Object.keys(FACT_FIELDS) as (keyof typeof FACT_FIELDS)[])
    .filter((f) => ['employees', 'email', 'phone', 'legalName', 'description'].includes(f) && (!c.facts[f] || c.facts[f].status === 'no_encontrado'))
    .map((f) => FACT_FIELDS[f]);
  missing.push('Persona responsable de la decisión', 'Herramientas de gestión que utilizan');

  const place = [c.city, c.province].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(', ');
  const list = [...services.entries()].sort((a, b) => ({ alto: 0, medio: 1, bajo: 2 })[a[1].fit] - { alto: 0, medio: 1, bajo: 2 }[b[1].fit]);
  const best = list.slice(0, 2).map(([id]) => SERVICES[id].toLowerCase());
  return {
    engine: 'reglas',
    createdAt: now.toISOString(),
    description: c.description || `${c.name}: empresa ${CATEGORIES[cat].toLowerCase()}${c.activity ? ` (${c.activity})` : ''}${place ? ` en ${place}` : ''}. Descripción generada a partir de los datos de la fuente; no hay texto propio de la empresa.`,
    observed,
    hypotheses,
    problems,
    services: list.map(([id, v]) => ({ id, ...v })),
    whyInterested: observed.length
      ? `Hay ${observed.length} punto${observed.length === 1 ? '' : 's'} comprobado${observed.length === 1 ? '' : 's'} que justifica${observed.length === 1 ? '' : 'n'} el contacto: ${observed[0].title.toLowerCase()}.`
      : 'No hay carencias comprobadas; el interés dependería de hipótesis del sector que hay que validar.',
    proposal: best.length ? `Proponer una primera conversación centrada en ${best.join(' y ')}, empezando por lo ya comprobado y validando el resto en la reunión.` : 'Sin propuesta clara: investigar más antes de contactar.',
    missing,
    ratings: {
      fit: { value: Math.round((catFit + webNeed) / 2), reason: `Empresa ${CATEGORIES[cat].toLowerCase()}; ${WEB_STATUSES[c.webStatus].toLowerCase()}.` },
      need: { value: Math.min(95, webNeed + Math.min(15, observed.length * 3)), reason: observed.length ? `${observed.length} carencia(s) comprobada(s) en fuentes públicas.` : 'Sin carencias comprobadas.' },
      potential: { value: potential, reason: 'Estimado por tamaño, sedes e indicios de actividad; sin datos de facturación.' },
      urgency: { value: urgency, reason: c.webStatus === 'caida' ? 'La web no funciona ahora mismo.' : 'No hay indicios de urgencia más allá del estado de la web.' },
    },
    flags: { automation: (services.get('automatizacion')?.fit ?? 'bajo') !== 'bajo', ai: !!s && !s.chat && cat !== 'otro' },
    nextAction: c.email || c.phone ? 'Preparar un primer contacto personalizado con los puntos comprobados.' : 'Localizar una vía de contacto antes de escribir.',
  };
}
