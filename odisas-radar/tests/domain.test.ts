import { describe, expect, it } from 'vitest';
import { parseQuery } from '@/domain/catalog';
import { rulesReport } from '@/domain/rules';
import { computeScore, priorityOf, staleInfo } from '@/domain/score';
import { detectSignals, extractEmails, extractLegal, extractLinks, extractPhones, extractSocials, keyPages, webStatusOf } from '@/domain/site';
import { domainOf, normName, normPhone } from '@/domain/text';
import { templateMessage } from '@/domain/templates';
import type { Company, Report, WebAudit } from '@/domain/types';

describe('normalización', () => {
  it('compara nombres sin forma jurídica, acentos ni puntuación', () => {
    expect(normName('Talleres Gómez, S.L.')).toBe('talleres gomez');
    expect(normName('TALLERES GOMEZ SL')).toBe('talleres gomez');
    expect(normName('Distribuciones Peña & Hijos S.A.U.')).toBe('distribuciones pena y hijos');
  });
  it('extrae el dominio de webs y correos', () => {
    expect(domainOf('https://www.Acme.es/contacto?x=1')).toBe('acme.es');
    expect(domainOf('info@acme.es')).toBe('acme.es');
    expect(domainOf('no es una web')).toBe('');
  });
  it('normaliza teléfonos españoles', () => {
    expect(normPhone('+34 912 34 56 78')).toBe('912345678');
    expect(normPhone('0034-612.345.678')).toBe('612345678');
    expect(normPhone('123')).toBe('');
  });
});

describe('búsqueda en lenguaje natural', () => {
  it('empresas industriales de Madrid', () => {
    const { query } = parseQuery('Empresas industriales de Madrid');
    expect(query).toMatchObject({ sector: 'industria', category: 'industrial', province: 'Madrid' });
  });
  it('distribuidoras de productos de peluquería en España', () => {
    const { query } = parseQuery('Distribuidoras de productos de peluquería en España');
    expect(query.location).toBe('España');
    expect(['mayorista', 'peluqueria']).toContain(query.sector);
  });
  it('logística de más de 20 trabajadores', () => {
    const { query } = parseQuery('Empresas de logística de más de 20 trabajadores');
    expect(query).toMatchObject({ sector: 'logistica', minEmployees: 20 });
  });
  it('sin web, webs antiguas y automatización', () => {
    expect(parseQuery('Empresas que no tienen página web en Sevilla').query).toMatchObject({ web: 'sin_web', province: 'Sevilla' });
    expect(parseQuery('Empresas con páginas web antiguas').post.webOutdated).toBe(true);
    expect(parseQuery('Negocios que podrían automatizar la atención al cliente').post.automation).toBe(true);
  });
});

const HTML = `<html><head><title>Suministros Peña</title><meta name="viewport" content="width=device-width">
<meta name="generator" content="WordPress 4.9"></head><body>
<a href="/contacto">Contacto</a> <a href="/aviso-legal">Aviso legal</a> <a href="/empleo">Trabaja con nosotros</a>
<a href="mailto:info@suministrospena.es">Escríbenos</a> <a href="tel:+34954123456">954 12 34 56</a>
<a href="https://www.linkedin.com/company/suministros-pena">LinkedIn</a> <a href="https://www.facebook.com/sharer.php?u=x">Compartir</a>
<a href="/docs/catalogo-2019.pdf">Descargar catálogo</a>
<p>Escribe a juan.perez@suministrospena.es o a ventas@gmail.com. Imagen logo@2x.png</p>
<form><input type="email" name="email"></form>
<footer>© 2018 Suministros Peña, S.L. · CIF: B-41234567</footer></body></html>`;

describe('lectura de la web', () => {
  const links = extractLinks(HTML, 'https://www.suministrospena.es/');
  it('encuentra el correo genérico del propio dominio antes que uno nominal o gratuito', () => {
    const emails = extractEmails(HTML, 'suministrospena.es');
    expect(emails[0]).toMatchObject({ email: 'info@suministrospena.es', generic: true, ownDomain: true });
    expect(emails.map((e) => e.email)).not.toContain('logo@2x.png');
  });
  it('encuentra teléfono, redes y páginas clave', () => {
    expect(extractPhones(HTML, links)).toContain('954123456');
    expect(extractSocials(links)).toEqual({ linkedin: 'https://www.linkedin.com/company/suministros-pena' });
    const pages = keyPages(links, 'https://www.suministrospena.es/');
    expect(pages.contact[0]).toBe('https://www.suministrospena.es/contacto');
    expect(pages.legal[0]).toBe('https://www.suministrospena.es/aviso-legal');
    expect(pages.careers).toHaveLength(1);
  });
  it('lee razón social y CIF del pie legal', () => {
    expect(extractLegal('El titular es Suministros Peña, S.L. con CIF: B-41234567 y domicilio en Sevilla')).toEqual({ legalName: 'Suministros Peña S.L.', taxId: 'B41234567' });
    expect(extractLegal('Sin datos legales aquí')).toEqual({ legalName: '', taxId: '' });
  });
  it('mide las señales técnicas y clasifica la web', () => {
    const s = detectSignals(HTML, 'http://www.suministrospena.es/', links);
    expect(s).toMatchObject({ https: false, responsive: true, copyrightYear: 2018, generator: 'WordPress 4.9', form: true, chat: false, catalogPdf: true, careers: true, ecommerce: false });
    const audit: WebAudit = { url: 'x', checkedAt: '', ok: true, signals: s, score: 60 };
    expect(webStatusOf('http://www.suministrospena.es', audit, new Date('2026-01-01'))).toBe('desactualizada');
    expect(webStatusOf('', null)).toBe('sin_web');
    expect(webStatusOf('https://x.es', { url: 'x', checkedAt: '', ok: false, error: 'caída' })).toBe('caida');
    expect(webStatusOf('https://x.es', { url: 'x', checkedAt: '', ok: true, score: 92, signals: { ...s, https: true, copyrightYear: 2026, wordCount: 800 } }, new Date('2026-06-01'))).toBe('correcta');
  });
});

const base = { name: 'Suministros Peña', category: 'distribucion', sector: 'mayorista', activity: 'Venta al por mayor', description: '', city: 'Sevilla', province: 'Sevilla', website: 'http://x.es', webStatus: 'desactualizada', audit: null, employees: null, sizeBand: null, branches: 1, email: '', phone: '', facts: {}, contactFormUrl: '', contactPerson: '', socials: {} } as unknown as Company;

describe('RADAR SCORE', () => {
  const report = (v: number): Report => ({ ...rulesReport(base), ratings: { fit: { value: v, reason: '' }, need: { value: v, reason: '' }, potential: { value: v, reason: '' }, urgency: { value: v, reason: '' } } });
  it('clasifica por tramos', () => {
    expect([priorityOf(85), priorityOf(70), priorityOf(50), priorityOf(20)]).toEqual(['muy_alta', 'alta', 'media', 'baja']);
  });
  it('tener muchos datos y contacto fácil no convierte una mala oportunidad en buena', () => {
    const rich = { ...base, email: 'a@x.es', phone: '954123456', contactFormUrl: 'x', contactPerson: 'Ana', facts: Object.fromEntries(['name', 'sector', 'activity', 'description', 'city', 'website', 'email', 'phone', 'employees', 'legalName'].map((f) => [f, { value: 'x', status: 'verificado', source: 's', at: '' }])) } as unknown as Company;
    const poorOpportunity = computeScore(rich, report(20));
    const goodOpportunityNoData = computeScore(base, report(85));
    expect(poorOpportunity.total).toBeLessThan(45);
    expect(poorOpportunity.priority).toBe('baja');
    expect(goodOpportunityNoData.total).toBeGreaterThan(poorOpportunity.total + 30);
    expect(goodOpportunityNoData.confidence).toBe('baja');
    // Contacto y datos juntos nunca pueden aportar más de 10 puntos.
    expect(computeScore(rich, report(0)).total).toBeLessThanOrEqual(15);
  });
  it('explica la nota', () => {
    const s = computeScore(base, report(70));
    expect(s.components).toHaveLength(7);
    expect(s.components.reduce((a, c) => a + c.weight, 0)).toBe(100);
    expect(s.explanation.join(' ')).toMatch(/prioridad/);
  });
});

describe('análisis por reglas', () => {
  it('separa lo comprobado de las hipótesis y no afirma lo que no ha medido', () => {
    const r = rulesReport({ ...base, webStatus: 'sin_web', website: '' });
    expect(r.engine).toBe('reglas');
    expect(r.observed.map((o) => o.title)).toContain('No se ha encontrado página web');
    expect(r.hypotheses.length).toBeGreaterThan(0);
    expect(r.hypotheses.every((h) => h.validate.length > 10)).toBe(true);
    expect(r.services.find((s) => s.id === 'web')?.fit).toBe('alto');
    expect(r.missing).toContain('Número de empleados');
  });
  it('enfoca distinto una industrial', () => {
    const r = rulesReport({ ...base, category: 'industrial', webStatus: 'correcta' });
    expect(r.services[0].id).toBe('procesos');
  });
});

describe('seguimiento y plantillas', () => {
  it('avisa de oportunidades abiertas sin seguimiento', () => {
    const now = new Date('2026-06-20T10:00:00Z');
    expect(staleInfo({ status: 'pendiente_respuesta', lastContactAt: '2026-06-01T10:00:00Z', nextFollowupAt: null, updatedAt: '2026-06-01T10:00:00Z' }, 7, now).stale).toBe(true);
    expect(staleInfo({ status: 'pendiente_respuesta', lastContactAt: '2026-06-18T10:00:00Z', nextFollowupAt: null, updatedAt: '2026-06-18T10:00:00Z' }, 7, now).stale).toBe(false);
    expect(staleInfo({ status: 'negociacion', lastContactAt: null, nextFollowupAt: '2026-06-19T10:00:00Z', updatedAt: '2026-06-19T10:00:00Z' }, 7, now).stale).toBe(true);
    expect(staleInfo({ status: 'cliente', lastContactAt: '2020-01-01T00:00:00Z', nextFollowupAt: null, updatedAt: '2020-01-01T00:00:00Z' }, 7, now).stale).toBe(false);
  });
  it('la plantilla usa lo comprobado de la empresa y no una fórmula genérica', () => {
    const r = rulesReport({ ...base, webStatus: 'sin_web', website: '' });
    const m = templateMessage('email', base, r, { name: 'Alex', role: '', company: 'Odisas Lab', email: 'a@o.com', phone: '', meetingUrl: '' });
    expect(m.subject).toContain('Suministros Peña');
    expect(m.body).not.toMatch(/somos una empresa tecnol/i);
    expect(m.body).toContain('Alex');
  });
});
