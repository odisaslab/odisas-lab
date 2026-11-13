import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

/**
 * Prueba de extremo a extremo del servidor contra servicios simulados en local:
 * webs de empresas, OpenStreetMap (Overpass y Nominatim), el webhook del CRM y la
 * API de Anthropic. La base de datos es un PostgreSQL embebido en memoria.
 */
process.env.RADAR_DB = 'memory';
process.env.ALLOW_PRIVATE_HOSTS = '1';
process.env.AUTH_SECRET = 'x'.repeat(40);

const OLD_SITE = `<html><head><title>Suministros Peña · distribución de peluquería</title>
<meta name="description" content="Distribuidor mayorista de productos profesionales de peluquería en Sevilla desde 1994.">
<meta name="generator" content="WordPress 4.9"></head><body><h1>Suministros Peña</h1>
<p>Servimos a más de 300 salones de Andalucía. Pedidos por teléfono de lunes a viernes.</p>
<a href="/contacto">Contacto</a> <a href="/aviso-legal">Aviso legal</a> <a href="/empleo">Trabaja con nosotros</a>
<a href="/docs/catalogo-2019.pdf">Descargar catálogo</a>
<a href="https://www.linkedin.com/company/suministros-pena">LinkedIn</a>
<footer>© 2018 Suministros Peña</footer></body></html>`;
const CONTACT = `<html><body><h1>Contacto</h1><form><input type="email" name="email"><textarea name="mensaje"></textarea></form>
<a href="mailto:info@suministrospena.test">info@suministrospena.test</a> <a href="tel:+34954123456">954 12 34 56</a></body></html>`;
const LEGAL = `<html><body><p>El titular de esta web es Suministros Peña, S.L. con CIF: B-41234567 y domicilio en Sevilla.</p></body></html>`;

const hits: { crm: unknown[]; ai: { system: string; user: string; tools: boolean }[]; overpass: string[] } = { crm: [], ai: [], overpass: [] };
let server: http.Server;
let port = 0;
let aiMode: 'report' | 'message' | 'search' = 'report';

const AI_REPORT = {
  description: 'Distribuidor mayorista de productos de peluquería en Sevilla.', category: 'distribucion', sizeEstimate: 'pequena', sizeBasis: 'Dice servir a más de 300 salones',
  observed: [{ title: 'Web sin adaptar a móviles', evidence: 'La portada no declara viewport' }],
  hypotheses: [{ title: 'Pedidos gestionados por teléfono', rationale: 'La web indica pedidos por teléfono', validate: '¿Cuántos pedidos entran al día y por qué canal?' }],
  problems: ['Podría estar perdiendo pedidos fuera de horario'],
  services: [{ id: 'web', fit: 'alto', why: 'Web antigua' }, { id: 'automatizacion', fit: 'alto', why: 'Pedidos' }],
  whyInterested: 'Su web lleva años sin actualizarse y el catálogo es un PDF de 2019.', proposal: 'Catálogo digital con pedidos online.', missing: ['Número de empleados'],
  ratings: { fit: { value: 88, reason: 'Distribución con catálogo' }, need: { value: 84, reason: 'Web de 2018' }, potential: { value: 75, reason: '300 clientes' }, urgency: { value: 150, reason: 'Sin HTTPS' } },
  flags: { automation: true, ai: true }, nextAction: 'Enviar correo sobre el catálogo.',
};

function aiReply(): unknown {
  if (aiMode === 'message') return [{ type: 'text', text: JSON.stringify({ subject: 'El catálogo de Suministros Peña', body: 'Hola:\n\nHe visto que vuestro catálogo es un PDF de 2019.\n\nAlex' }) }];
  if (aiMode === 'search')
    return [
      { type: 'server_tool_use', id: 'srvtoolu_1', name: 'web_search', input: { query: 'distribuidoras peluquería' } },
      { type: 'web_search_tool_result', tool_use_id: 'srvtoolu_1', content: [{ type: 'web_search_result', url: 'https://directorio.test/belleza-pro', title: 'Belleza Pro', encrypted_content: 'x', page_age: null }] },
      { type: 'text', text: 'He encontrado dos.\n```json\n[{"name":"Belleza Pro Distribución","website":"https://bellezapro.test","city":"Valencia","activity":"Distribución de cosmética","employees":null,"sourceUrl":"https://directorio.test/belleza-pro"},{"name":"Inventada SL","sourceUrl":"https://no-citada.test/x"}]\n```' },
    ];
  return [{ type: 'text', text: JSON.stringify(AI_REPORT) }];
}

beforeAll(async () => {
  server = http.createServer((req, res) => {
    const host = (req.headers.host ?? '').split(':')[0];
    const url = new URL(req.url ?? '/', 'http://x');
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      const send = (status: number, type: string, data: string) => (res.writeHead(status, { 'content-type': type }), res.end(data));
      if (url.pathname === '/v1/messages') {
        const b = JSON.parse(body);
        hits.ai.push({ system: b.system, user: JSON.stringify(b.messages), tools: !!b.tools });
        return send(200, 'application/json', JSON.stringify({ id: 'msg_1', type: 'message', role: 'assistant', model: b.model, content: aiReply(), stop_reason: 'end_turn', stop_sequence: null, usage: { input_tokens: 10, output_tokens: 10 } }));
      }
      if (url.pathname === '/saturado') return send(504, 'text/plain', 'Gateway Timeout');
      if (url.pathname === '/crm') return hits.crm.push(JSON.parse(body)), send(200, 'application/json', '{"id":"CRM-77"}');
      if (url.pathname === '/nominatim/search') return send(200, 'application/json', JSON.stringify([{ osm_type: 'relation', osm_id: 342563, display_name: 'Sevilla, Andalucía, España' }]));
      if (url.pathname === '/overpass') {
        hits.overpass.push(decodeURIComponent(body));
        return send(200, 'application/json', JSON.stringify({ elements: [
          { type: 'node', id: 1, lat: 37.4, lon: -5.9, tags: { name: 'Suministros Peña', shop: 'wholesale', wholesale: 'hairdresser_supply', website: `http://127.0.0.2:${port}`, 'addr:city': 'Sevilla', 'addr:street': 'Calle Feria', 'addr:housenumber': '12' } },
          { type: 'node', id: 2, lat: 37.41, lon: -5.91, tags: { name: 'Almacenes Rivas', shop: 'wholesale', phone: '+34 955 111 222', 'addr:city': 'Sevilla' } },
          { type: 'way', id: 3, center: { lat: 37.42, lon: -5.92 }, tags: { name: 'Almacenes Rivas', shop: 'wholesale', 'addr:city': 'Dos Hermanas' } },
          { type: 'node', id: 4, tags: { name: 'Web Caída SL', shop: 'trade', website: `http://127.0.0.3:${port}` } },
          { type: 'node', id: 5, tags: { name: 'Cerrado a Robots', shop: 'trade', website: `http://127.0.0.4:${port}` } },
          { type: 'node', id: 6, tags: { shop: 'wholesale' } },
        ] }));
      }
      if (host === '127.0.0.3') return send(500, 'text/html', 'error');
      if (host === '127.0.0.4') return url.pathname === '/robots.txt' ? send(200, 'text/plain', 'User-agent: *\nDisallow: /') : send(200, 'text/html', '<html><body>secreto@privado.test</body></html>');
      if (host === '127.0.0.2') {
        if (url.pathname === '/robots.txt') return send(200, 'text/plain', 'User-agent: *\nDisallow: /admin/');
        if (url.pathname === '/') return send(200, 'text/html; charset=utf-8', OLD_SITE);
        if (url.pathname === '/contacto') return send(200, 'text/html; charset=utf-8', CONTACT);
        if (url.pathname === '/aviso-legal') return send(200, 'text/html; charset=utf-8', LEGAL);
      }
      send(404, 'text/plain', 'no');
    });
  });
  await new Promise<void>((r) => server.listen(0, '0.0.0.0', r));
  port = (server.address() as AddressInfo).port;
  process.env.OVERPASS_URL = `http://127.0.0.1:${port}/overpass`;
  process.env.NOMINATIM_URL = `http://127.0.0.1:${port}/nominatim`;
});

afterAll(async () => {
  const { closeDb } = await import('@/server/db');
  await closeDb();
  server.close();
});

const user = { id: 'u1', email: 'a@o.test', name: 'Alex', role: 'admin' as const };

describe('ODISAS RADAR · flujo completo', () => {
  let penaId = '';

  it('robots.txt se respeta', async () => {
    const { robotsAllows } = await import('@/server/research');
    expect(robotsAllows('User-agent: *\nDisallow: /', '/')).toBe(false);
    expect(robotsAllows('User-agent: *\nDisallow: /admin/', '/contacto')).toBe(true);
    expect(robotsAllows('User-agent: *\nDisallow: /\nAllow: /publico', '/publico/x')).toBe(true);
    expect(robotsAllows('User-agent: otro\nDisallow: /', '/')).toBe(true);
    expect(robotsAllows('', '/')).toBe(true);
  });

  it('busca en OpenStreetMap, une sedes de una misma empresa y no duplica al repetir', async () => {
    const { providerById } = await import('@/server/providers');
    const { importCandidates } = await import('@/server/companies');
    const found = await providerById('osm')!.search({ sector: 'mayorista', province: 'Sevilla', limit: 50 });
    expect(found).toHaveLength(5); // el elemento sin nombre se descarta
    expect(hits.overpass[0]).toContain('area["ISO3166-2"~"^ES-(SE)$"]->.a;'); // la provincia no necesita geocodificador
    expect(hits.overpass[0]).toContain('out tags center');
    expect(hits.overpass[0]).toContain('["shop"="wholesale"]');
    const first = await importCandidates(found, { userId: user.id });
    expect(first.added.map((c) => c.name).sort()).toEqual(['Almacenes Rivas', 'Cerrado a Robots', 'Suministros Peña', 'Web Caída SL']);
    const rivas = first.added.find((c) => c.name === 'Almacenes Rivas')!;
    expect(rivas.branches).toBe(2);
    expect(rivas.webStatus).toBe('sin_web');
    expect(rivas.facts.phone).toMatchObject({ status: 'verificado', source: 'OpenStreetMap' });
    const second = await importCandidates(await providerById('osm')!.search({ sector: 'mayorista', province: 'Sevilla' }), { userId: user.id });
    expect(second.added).toHaveLength(0);
    expect(second.duplicates).toHaveLength(4);
    // Mismo negocio escrito de otra forma y con el mismo teléfono: sigue siendo duplicado.
    const third = await importCandidates([{ name: 'ALMACENES RIVAS, S.L.', phone: '955111222', source: 'Listado', reliability: 'estimado' }]);
    expect(third.added).toHaveLength(0);
    penaId = first.added.find((c) => c.name === 'Suministros Peña')!.id;
  });

  it('ciudades: usa Nominatim y, si no responde, busca el municipio por nombre; prueba espejos de Overpass', async () => {
    const { providerById } = await import('@/server/providers');
    await providerById('osm')!.search({ sector: 'mayorista', city: 'Dos Hermanas', province: 'Sevilla' });
    expect(hits.overpass.at(-1)).toContain('area(3600342563)->.a;');
    const nominatim = process.env.NOMINATIM_URL;
    process.env.NOMINATIM_URL = `http://127.0.0.1:${port}/no-existe`;
    await providerById('osm')!.search({ sector: 'mayorista', city: 'Dos Hermanas', province: 'Sevilla' });
    expect(hits.overpass.at(-1)).toContain('area["ISO3166-2"~"^ES-(SE)$"]->.p;rel(area.p)["boundary"="administrative"]["admin_level"~"^(7|8)$"]["name"~"^Dos Hermanas$",i];map_to_area->.a;');
    process.env.NOMINATIM_URL = nominatim;
    // El primer servidor falla (504) y el segundo responde.
    const overpassUrl = process.env.OVERPASS_URL;
    process.env.OVERPASS_URL = `http://127.0.0.1:${port}/saturado,${overpassUrl}`;
    expect(await providerById('osm')!.search({ sector: 'mayorista', province: 'Sevilla' })).toHaveLength(5);
    process.env.OVERPASS_URL = `http://127.0.0.1:${port}/saturado`;
    await expect(providerById('osm')!.search({ sector: 'mayorista', province: 'Sevilla' })).rejects.toThrow(/saturado/);
    process.env.OVERPASS_URL = overpassUrl;
    // Sin zona: toda España.
    await providerById('osm')!.search({ sector: 'mayorista' });
    expect(hits.overpass.at(-1)).toContain('area["ISO3166-1"="ES"][admin_level=2]->.a;');
  });

  it('investiga la web: datos verificados con su página de origen, y nada inventado', async () => {
    const { researchCompany } = await import('@/server/research');
    const c = await researchCompany(penaId);
    expect(c.email).toBe('info@suministrospena.test');
    expect(c.facts.email).toMatchObject({ status: 'verificado', source: 'Web de la empresa', url: `http://127.0.0.2:${port}/contacto` });
    expect(c.phone).toBe('954 12 34 56');
    expect(c.legalName).toBe('Suministros Peña S.L.');
    expect(c.taxId).toBe('B41234567');
    expect(c.contactFormUrl).toBe(`http://127.0.0.2:${port}/contacto`);
    expect(c.socials.linkedin).toContain('linkedin.com/company/suministros-pena');
    expect(c.description).toContain('Distribuidor mayorista');
    expect(c.facts.employees.status).toBe('no_encontrado');
    expect(c.employees).toBeNull();
    expect(c.webStatus).toBe('desactualizada');
    expect(c.audit?.signals).toMatchObject({ https: false, responsive: false, copyrightYear: 2018, catalogPdf: true, careers: true, chat: false });
    expect(c.audit?.pages).toHaveLength(3);
    const { q } = await import('@/server/db');
    expect((await q('SELECT type FROM signals WHERE company_id = $1', [penaId])).map((s) => s.type)).toEqual(['contratando']);
  });

  it('una web caída o cerrada a robots no se lee ni se inventa', async () => {
    const { researchCompany } = await import('@/server/research');
    const { listCompanies } = await import('@/server/companies');
    const all = (await listCompanies({})).items;
    const down = await researchCompany(all.find((c) => c.name === 'Web Caída SL')!.id);
    expect(down.webStatus).toBe('caida');
    expect(down.email).toBe('');
    const closed = await researchCompany(all.find((c) => c.name === 'Cerrado a Robots')!.id);
    expect(closed.audit?.robotsBlocked).toBe(true);
    expect(closed.email).toBe('');
    expect(closed.webStatus).toBe('desconocido');
  });

  it('sin clave de IA analiza por reglas, puntúa y pasa a «analizada»', async () => {
    const { analyzeCompany } = await import('@/server/ai/analyze');
    const c = await analyzeCompany(penaId);
    expect(c.report?.engine).toBe('reglas');
    expect(c.status).toBe('analizada');
    expect(c.score).toBeGreaterThanOrEqual(60);
    expect(c.scoreData?.components).toHaveLength(7);
    expect(c.report?.observed.some((o) => /móviles/.test(o.evidence))).toBe(true);
    expect(c.oppAutomation).toBe(true);
  });

  it('con IA: informe estructurado, hipótesis separadas y valores acotados', async () => {
    const { setSecret } = await import('@/server/settings');
    process.env.ANTHROPIC_BASE_URL = `http://127.0.0.1:${port}`;
    await setSecret('anthropic', 'sk-ant-prueba');
    aiMode = 'report';
    const { analyzeCompany } = await import('@/server/ai/analyze');
    const c = await analyzeCompany(penaId);
    expect(c.report?.engine).toBe('ia');
    expect(c.report?.hypotheses[0].validate).toContain('pedidos');
    expect(c.report?.ratings.urgency.value).toBe(100);
    expect(c.priority).toBe('muy_alta');
    expect(c.sizeBand).toBe('pequena');
    expect(c.facts.sizeBand).toMatchObject({ status: 'estimado' });
    const sent = hits.ai.at(-1)!;
    expect(sent.user).toContain('NO ENCONTRADO');
    expect(sent.user).toContain('verificado; fuente: Web de la empresa');
    expect(sent.system).toContain('Nunca presentes una hipótesis como un problema confirmado');
  });

  it('genera mensajes editables con IA y con plantilla, con la línea de baja', async () => {
    const { draftMessage } = await import('@/server/ai/analyze');
    aiMode = 'message';
    const m = await draftMessage(penaId, 'email');
    expect(m).toMatchObject({ engine: 'ia', subject: 'El catálogo de Suministros Peña' });
    expect(m.body).toContain('BAJA');
    expect(hits.ai.at(-1)!.user).toContain('Pedidos gestionados por teléfono');
    const li = await draftMessage(penaId, 'linkedin');
    expect(li.body).not.toContain('BAJA');
  });

  it('la búsqueda con IA solo trae empresas con fuente y las marca como estimadas', async () => {
    aiMode = 'search';
    const { providerById } = await import('@/server/providers');
    const found = await providerById('ia')!.search({ text: 'distribuidoras de productos de peluquería', location: 'España' });
    expect(hits.ai.at(-1)!.tools).toBe(true);
    expect(found.map((f) => [f.name, f.source, f.reliability])).toEqual([
      ['Belleza Pro Distribución', 'Búsqueda web (IA)', 'estimado'],
      ['Inventada SL', 'Búsqueda web (IA, fuente sin confirmar)', 'estimado'],
    ]);
  });

  it('guarda en el pipeline, crea la tarea y sincroniza con el CRM', async () => {
    const { saveSettings } = await import('@/server/settings');
    await saveSettings({ crmWebhookUrl: `http://127.0.0.1:${port}/crm` });
    const { saveToCrm, addContact } = await import('@/server/crm');
    const r = await saveToCrm(penaId, user);
    expect(r.company).toMatchObject({ inCrm: true, status: 'pendiente_contactar', crmId: 'CRM-77' });
    expect(r.taskCreated).toBe(true);
    expect(r.sync.ok).toBe(true);
    expect((hits.crm[0] as { event: string; company: { name: string } }).event).toBe('company.saved');
    expect((await saveToCrm(penaId, user)).taskCreated).toBe(false); // no duplica la tarea
    const contacts = await addContact(penaId, { name: 'Marta Peña', role: 'Gerente' });
    expect(contacts).toHaveLength(1);
    const { getCompany } = await import('@/server/companies');
    expect((await getCompany(penaId)).contactPerson).toBe('Marta Peña');
  });

  it('la cola analiza en bloque, archiva por debajo del mínimo y crea tareas para las prioritarias', async () => {
    const { setSecret } = await import('@/server/settings');
    await setSecret('anthropic', null);
    const { importCandidates, getCompany } = await import('@/server/companies');
    const { enqueue, workJobs } = await import('@/server/jobs');
    const { added } = await importCandidates([
      { name: 'Clínica Dental Sol', city: 'Cádiz', category: 'servicios', source: 'Listado', reliability: 'estimado' },
      { name: 'Metalúrgica del Sur', city: 'Huelva', category: 'industrial', employees: 80, source: 'Listado', reliability: 'estimado' },
    ]);
    expect(await enqueue(added.map((c) => c.id), { research: true, analyze: true, minScore: 62, createTasks: true })).toBe(2);
    expect(await enqueue(added.map((c) => c.id), {})).toBe(0); // ya están en cola
    expect((await getCompany(added[0].id)).status).toBe('pendiente_investigar');
    const done = await workJobs(20000);
    expect(done).toMatchObject({ processed: 2, pending: 0, failed: 0 });
    const [clinic, metal] = await Promise.all(added.map((c) => getCompany(c.id)));
    expect(clinic.status).toBe('analizada');
    expect(clinic.archived).toBe(true);
    expect(clinic.archiveReason).toContain('por debajo del mínimo');
    expect(metal.archived).toBe(false);
    expect(metal.score).toBeGreaterThanOrEqual(65);
    const { q } = await import('@/server/db');
    expect(await q("SELECT title FROM tasks WHERE company_id = $1 AND origin = 'automatizacion'", [metal.id])).toHaveLength(1);
  });

  it('exclusiones: no se vuelve a importar ni a contactar', async () => {
    const { addExclusion, importCandidates, isExcluded, getCompany } = await import('@/server/companies');
    await addExclusion('dominio', 'https://www.nomolestar.test/', 'Pidió la baja');
    await addExclusion('email', 'INFO@suministrospena.test', 'Pidió la baja');
    const r = await importCandidates([{ name: 'No Molestar', website: 'nomolestar.test', source: 'Listado', reliability: 'estimado' }]);
    expect(r.added).toHaveLength(0);
    expect(r.excluded[0].reason).toBe('Pidió la baja');
    expect((await getCompany(penaId)).doNotContact).toBe(true);
    expect(await isExcluded({ email: 'otro@nomolestar.test' })).toBe('Pidió la baja');
  });

  it('automatizaciones: búsqueda periódica, avisos de seguimiento e informe', async () => {
    const { saveAutomation, runAutomation, tick } = await import('@/server/automations');
    const { q } = await import('@/server/db');
    const { update } = await import('@/server/sql');
    const list = await saveAutomation({ name: 'Mayoristas Sevilla', type: 'busqueda', frequency: 'semanal', config: { provider: 'osm', query: { sector: 'mayorista', province: 'Sevilla' }, minScore: 40, createTasks: true } });
    expect(list).toHaveLength(1);
    expect(await runAutomation(list[0].id)).toMatch(/5 encontradas · 0 nuevas · 4 ya estaban/);
    await expect(saveAutomation({ type: 'busqueda', config: {} })).rejects.toThrow(/al menos un sector/);

    // Una oportunidad abierta sin tocar desde hace 20 días genera aviso.
    await update('companies', penaId, { lastContactAt: new Date(Date.now() - 20 * 86400_000).toISOString(), nextFollowupAt: null });
    const [, seg] = await saveAutomation({ type: 'seguimiento', frequency: 'diaria' });
    expect(await runAutomation(seg.id)).toMatch(/1 oportunidades sin seguimiento · 1 tareas nuevas/);
    expect(await runAutomation(seg.id)).toMatch(/0 tareas nuevas/);

    await saveAutomation({ type: 'informe', frequency: 'semanal' });
    await q('UPDATE automations SET next_run_at = NULL');
    const t = await tick(15000);
    expect(t.automations).toBe(3);
    expect(await q('SELECT 1 FROM reports')).toHaveLength(1);
    expect((await q<{ next_run_at: string }>('SELECT next_run_at FROM automations')).every((a) => a.next_run_at > new Date().toISOString())).toBe(true);
  });

  it('panel, recomendaciones, informe y exportación', async () => {
    const { dashboard } = await import('@/server/stats');
    const { addActivity, setStatus } = await import('@/server/companies');
    await addActivity(penaId, 'correo', 'Primer correo', '', user.id);
    await addActivity(penaId, 'respuesta', 'Responde interesada', '', user.id);
    await setStatus(penaId, 'reunion_concertada', user.id);
    await setStatus(penaId, 'cliente', user.id);
    const d = await dashboard();
    expect(d.kpis).toMatchObject({ contactsMade: 1, replies: 1, meetings: 1, won: 1, conversion: 100 });
    expect(d.kpis.found).toBeGreaterThanOrEqual(5);
    expect(d.weeks).toHaveLength(12);
    expect(d.weeks.at(-1)!.won).toBe(1);
    expect(d.sectors.length).toBeGreaterThan(0);
    expect(d.recommended.every((r) => r.reasons.length > 0 && !r.doNotContact)).toBe(true);
    const { generateReport, companiesCsv } = await import('@/server/reports');
    const rep = await generateReport(7);
    expect(rep.data.counts.won).toBe(1);
    expect(rep.data.wins[0].name).toBe('Suministros Peña');
    const csv = await companiesCsv();
    expect(csv).toContain('Suministros Peña');
    expect(csv.split('\r\n')[0]).toContain('RADAR SCORE');
  });

  it('borrado definitivo con exclusión (derecho de supresión)', async () => {
    const { deleteCompany, importCandidates } = await import('@/server/companies');
    const { q } = await import('@/server/db');
    await deleteCompany(penaId, true);
    expect(await q('SELECT 1 FROM companies WHERE id = $1', [penaId])).toHaveLength(0);
    expect(await q('SELECT 1 FROM activities WHERE company_id = $1', [penaId])).toHaveLength(0);
    const again = await importCandidates([{ name: 'Suministros Peña', website: `http://127.0.0.2:${port}`, source: 'OpenStreetMap', reliability: 'verificado' }]);
    expect(again.added).toHaveLength(0);
    expect(again.excluded).toHaveLength(1);
  });

  it('importa un CSV con cabeceras en español', async () => {
    const { csvToCandidates } = await import('@/server/providers');
    const list = csvToCandidates('Empresa;Web;Teléfono;Ciudad;Empleados\n"Talleres Ruiz, S.L.";talleresruiz.test;956 000 111;Jerez;35\n;;;;\n', 'Cámara de Comercio');
    expect(list).toEqual([{ source: 'Cámara de Comercio', reliability: 'estimado', name: 'Talleres Ruiz, S.L.', website: 'talleresruiz.test', phone: '956 000 111', city: 'Jerez', employees: 35 }]);
  });
});
