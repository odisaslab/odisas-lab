import { SERVICES, type Company, type MessageKind, type Report } from './types';

/**
 * Mensajes de reserva cuando no hay IA configurada. Se construyen solo con datos
 * comprobados de la empresa; son un punto de partida para editar, no un envío masivo.
 */
export interface Sender {
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
  meetingUrl: string;
}

export function templateMessage(kind: MessageKind, c: Pick<Company, 'name' | 'city' | 'activity' | 'sector' | 'contactPerson' | 'website'>, report: Report | null, sender: Sender): { subject: string; body: string } {
  const hi = c.contactPerson ? `Hola, ${c.contactPerson.split(' ')[0]}:` : 'Buenos días:';
  const facts = (report?.observed ?? []).slice(0, 2);
  const svc = (report?.services ?? []).filter((s) => s.fit !== 'bajo').slice(0, 2).map((s) => SERVICES[s.id].toLowerCase());
  const what = c.activity || c.sector || 'vuestra actividad';
  const seen = facts.length
    ? `Al revisar ${c.website ? 'vuestra web' : 'vuestra presencia en internet'} he visto ${facts.map((f) => f.evidence.replace(/\.$/, '').replace(/^./, (x) => x.toLowerCase())).join('; y además ')}.`
    : `He estado viendo lo que hacéis en ${what}${c.city ? ` desde ${c.city}` : ''}.`;
  const offer = svc.length ? `En ${sender.company} trabajamos justo en eso: ${svc.join(' y ')}.` : `En ${sender.company} ayudamos a empresas como la vuestra a ordenar su parte digital.`;
  const sign = [sender.name, [sender.role, sender.company].filter(Boolean).join(' · '), sender.phone, sender.email].filter(Boolean).join('\n');
  const meet = sender.meetingUrl ? `Si te encaja, puedes elegir hueco aquí: ${sender.meetingUrl}` : '¿Te vendría bien una llamada de 15 minutos esta semana o la próxima?';

  switch (kind) {
    case 'email':
      return { subject: `${c.name}: una idea sobre ${facts[0]?.title.toLowerCase() ?? what}`, body: `${hi}\n\n${seen}\n\n${offer} No os propongo nada cerrado: prefiero entender primero cómo trabajáis.\n\n${meet}\n\nUn saludo,\n${sign}` };
    case 'seguimiento':
      return { subject: `Re: ${c.name}`, body: `${hi}\n\nTe escribí hace unos días a propósito de ${facts[0]?.title.toLowerCase() ?? what}. Por si se quedó atrás, lo retomo en una línea: ${offer}\n\n${meet}\n\nSi no es buen momento, dímelo y no insisto.\n\nUn saludo,\n${sign}` };
    case 'linkedin':
      return { subject: '', body: `${hi.replace(':', '')} ${seen} ${offer} ¿Te parece si lo comentamos en una llamada corta?` };
    case 'reunion':
      return { subject: `Propuesta de reunión · ${c.name}`, body: `${hi}\n\nGracias por la respuesta. Te propongo una reunión de 30 minutos para:\n\n1. Entender cómo trabajáis hoy en ${what}.\n2. Revisar juntos ${facts[0]?.title.toLowerCase() ?? 'los puntos que hemos visto'}.\n3. Ver si tiene sentido que os preparemos una propuesta.\n\n${meet}\n\nUn saludo,\n${sign}` };
    case 'llamada':
      return {
        subject: `Guion de llamada · ${c.name}`,
        body: [
          `APERTURA\nBuenos días, soy ${sender.name}, de ${sender.company}. ¿Hablo con la persona que lleva ${svc[0] ? 'la parte digital' : 'la gerencia'} en ${c.name}?`,
          `MOTIVO (10 segundos)\n${seen}`,
          `PREGUNTAS PARA VALIDAR\n${(report?.hypotheses ?? []).slice(0, 3).map((h) => `· ${h.validate}`).join('\n') || '· ¿Cómo gestionáis hoy vuestra parte digital?'}`,
          `PROPUESTA\n${offer} Lo que os propongo es una reunión corta, sin compromiso.`,
          `SI DICEN QUE NO\nAgradecer, preguntar si puedo enviar un correo con el resumen y cuándo sería mejor momento.`,
        ].join('\n\n'),
      };
    case 'resumen':
      return {
        subject: `Preparación de llamada · ${c.name}`,
        body: [
          `EMPRESA\n${report?.description ?? c.name}`,
          `COMPROBADO\n${facts.length ? (report?.observed ?? []).map((f) => `· ${f.title}: ${f.evidence}`).join('\n') : '· Nada comprobado todavía.'}`,
          `A VALIDAR\n${(report?.hypotheses ?? []).map((h) => `· ${h.title} → ${h.validate}`).join('\n') || '· Sin hipótesis.'}`,
          `SERVICIOS QUE ENCAJAN\n${(report?.services ?? []).map((s) => `· ${SERVICES[s.id]} (${s.fit}): ${s.why}`).join('\n') || '· Por determinar.'}`,
          `FALTA POR SABER\n${(report?.missing ?? []).map((m) => `· ${m}`).join('\n') || '· —'}`,
        ].join('\n\n'),
      };
  }
}

/** Línea de baja obligatoria en comunicaciones comerciales por correo (LSSI, art. 21). */
export function optOutFooter(sender: Sender): string {
  return `\n\n—\nTe escribimos a esta dirección porque figura publicada como contacto profesional de la empresa. Si no quieres recibir más mensajes de ${sender.company}, responde a este correo con la palabra BAJA y no volveremos a escribirte.`;
}
