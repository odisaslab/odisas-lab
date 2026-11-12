import 'server-only';
import { nanoid } from 'nanoid';
import { auditPage } from '@/lib/audit/engine';
import { AuditError, safeFetch, UA, type SafeFetchResult } from '@/lib/audit/safe-fetch';
import { contentHash, detectSignals, extractEmails, extractLegal, extractLinks, extractPhones, extractSocials, keyPages, visibleText, webStatusOf } from '@/domain/site';
import { clip, domainOf, formatPhone, normPhone } from '@/domain/text';
import type { Company, Facts, SignalType, WebAudit } from '@/domain/types';
import { getCompany, setFact } from './companies';
import { nowIso, q, q1 } from './db';
import { insert, update } from './sql';

/**
 * Investigación automática: lee únicamente la web pública de la propia empresa
 * (portada y, como mucho, sus páginas de contacto, aviso legal y «quiénes somos»),
 * respeta robots.txt y anota de dónde sale cada dato. No inventa nada: lo que no
 * aparece publicado queda como «no encontrado».
 */

const WEB = 'Web de la empresa';

/** ¿Permite robots.txt que un robot genérico lea esta ruta? */
export function robotsAllows(robots: string, path: string, agent = 'odisasradar'): boolean {
  const groups: { agents: string[]; rules: { allow: boolean; path: string }[] }[] = [];
  let cur: (typeof groups)[number] | null = null;
  let lastWasAgent = false;
  for (const raw of robots.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, '').trim();
    const m = line.match(/^(user-agent|allow|disallow)\s*:\s*(.*)$/i);
    if (!m) continue;
    const key = m[1].toLowerCase();
    const value = m[2].trim();
    if (key === 'user-agent') {
      if (!cur || !lastWasAgent) (cur = { agents: [], rules: [] }), groups.push(cur);
      cur.agents.push(value.toLowerCase());
      lastWasAgent = true;
    } else {
      lastWasAgent = false;
      if (cur && value) cur.rules.push({ allow: key === 'allow', path: value });
    }
  }
  const group = groups.find((g) => g.agents.some((a) => a !== '*' && agent.includes(a))) ?? groups.find((g) => g.agents.includes('*'));
  if (!group) return true;
  const matches = (rule: string) => {
    const re = new RegExp('^' + rule.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\\\$$/, '$'));
    return re.test(path);
  };
  const hit = group.rules.filter((r) => matches(r.path)).sort((a, b) => b.path.length - a.path.length || Number(b.allow) - Number(a.allow))[0];
  return hit ? hit.allow : true;
}

async function fetchRobots(origin: string): Promise<string> {
  try {
    const r = await safeFetch(origin + '/robots.txt', { timeout: 6000, accept: 'text/plain,*/*' });
    return r.status === 200 && !/<html/i.test(r.body.slice(0, 300)) ? r.body.slice(0, 100_000) : '';
  } catch {
    return '';
  }
}

async function addSignal(companyId: string, type: SignalType, title: string, detail: string, source: string, url: string, reliability: 'verificado' | 'estimado') {
  const recent = await q1('SELECT 1 FROM signals WHERE company_id = $1 AND type = $2 AND detected_at > $3', [companyId, type, new Date(Date.now() - 60 * 86400_000).toISOString()]);
  if (recent) return;
  await insert('signals', { id: nanoid(12), companyId, type, title: clip(title, 200), detail: clip(detail, 800), source, url, reliability, detectedAt: nowIso() });
}
export { addSignal };

export async function researchCompany(id: string): Promise<Company> {
  const c = await getCompany(id);
  const facts: Facts = { ...c.facts };
  const patch: Record<string, unknown> = { researchedAt: nowIso(), updatedAt: nowIso() };
  const now = nowIso();

  if (!c.website) {
    setFact(facts, 'website', '', 'no_encontrado', 'Fuentes consultadas');
    for (const f of ['email', 'phone', 'legalName', 'employees', 'description']) if (!facts[f]) setFact(facts, f, '', 'no_encontrado', 'Fuentes consultadas');
    await update('companies', id, { ...patch, facts, webStatus: 'sin_web', audit: null });
    return getCompany(id);
  }

  let audit: WebAudit = { url: c.website, checkedAt: now, ok: false };
  let home: SafeFetchResult | null = null;
  const start = new URL(c.website);
  const robots = await fetchRobots(start.origin);
  if (robots && !robotsAllows(robots, start.pathname || '/', UA.toLowerCase())) {
    audit = { ...audit, robotsBlocked: true, error: 'El archivo robots.txt de la web no permite la lectura automática. Hay que revisarla a mano.' };
  } else {
    try {
      home = await safeFetch(c.website, { timeout: 12000 });
      if ([401, 403, 429, 503].includes(home.status)) (audit = { ...audit, robotsBlocked: true, error: `La web rechaza el acceso automático (HTTP ${home.status}). Hay que revisarla a mano.` }), (home = null);
      else if (home.status >= 400) (audit = { ...audit, error: `La web responde con un error HTTP ${home.status}.` }), (home = null);
      else if (!/html/i.test(home.headers.get('content-type') ?? 'html')) (audit = { ...audit, error: 'La dirección no devuelve una página web.' }), (home = null);
    } catch (e) {
      audit = { ...audit, error: e instanceof AuditError ? e.message : 'No se ha podido conectar con la web.' };
    }
  }

  if (home) {
    const finalUrl = home.url;
    const links = extractLinks(home.body, finalUrl);
    const text = visibleText(home.body);
    const siteDomain = domainOf(finalUrl);
    audit = {
      url: finalUrl,
      checkedAt: now,
      ok: true,
      signals: detectSignals(home.body, finalUrl, links),
      title: clip(visibleText(home.body.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? ''), 200),
      metaDescription: clip(visibleText(home.body.match(/<meta[^>]+(?:name|property)=["'](?:description|og:description)["'][^>]*content=["']([^"']*)["']/i)?.[1] ?? home.body.match(/<meta[^>]+content=["']([^"']*)["'][^>]*(?:name|property)=["'](?:description|og:description)["']/i)?.[1] ?? ''), 400),
      text: clip(text, 6000),
      hash: contentHash(text),
      responseMs: home.headersMs,
      pages: [finalUrl],
    };
    try {
      const a = await auditPage(new URL(finalUrl), home);
      audit.score = a.score;
      audit.categories = a.categories.map((x) => ({ id: x.id, label: x.label, score: x.score }));
      audit.issues = a.issues.slice(0, 14).map((i) => ({ severity: i.severity, title: i.title, evidence: i.evidence, category: i.category }));
    } catch {
      /* el diagnóstico técnico es opcional: las señales básicas ya están */
    }

    // Páginas donde las empresas publican sus datos: contacto, aviso legal y presentación.
    const pages = keyPages(links, finalUrl);
    const extra: { kind: string; url: string; body: string }[] = [];
    for (const [kind, url] of [['contact', pages.contact[0]], ['legal', pages.legal[0]], ['about', pages.about[0]]] as const) {
      if (!url || url === finalUrl || (robots && !robotsAllows(robots, new URL(url).pathname, UA.toLowerCase()))) continue;
      try {
        const r = await safeFetch(url, { timeout: 9000 });
        if (r.status === 200) extra.push({ kind, url: r.url, body: r.body }), audit.pages!.push(r.url);
      } catch {
        /* una página secundaria que falla no invalida el resto */
      }
    }
    const all = [{ kind: 'home', url: finalUrl, body: home.body }, ...extra];

    setFact(facts, 'website', finalUrl.replace(/\/$/, ''), 'verificado', WEB, finalUrl);
    if (audit.metaDescription) setFact(facts, 'description', audit.metaDescription, 'verificado', WEB, finalUrl) && (patch.description = audit.metaDescription);

    // Correo: primero los buzones genéricos del propio dominio.
    for (const p of [...all].sort((a, b) => Number(b.kind === 'contact') - Number(a.kind === 'contact'))) {
      const best = extractEmails(p.body, siteDomain)[0];
      if (!best) continue;
      const src = best.generic ? WEB : `${WEB} (buzón nominal: tratar como dato personal)`;
      if (setFact(facts, 'email', best.email, 'verificado', src, p.url)) patch.email = best.email;
      break;
    }
    for (const p of all) {
      const phone = extractPhones(p.body, extractLinks(p.body, p.url))[0];
      if (!phone) continue;
      if (setFact(facts, 'phone', formatPhone(phone), 'verificado', WEB, p.url)) (patch.phone = formatPhone(phone)), (patch.phoneNorm = normPhone(phone));
      break;
    }
    const socials = { ...c.socials };
    for (const p of all) for (const [k, v] of Object.entries(extractSocials(extractLinks(p.body, p.url)))) socials[k] ??= v;
    if (Object.keys(socials).length) (patch.socials = socials), setFact(facts, 'socials', Object.keys(socials).join(', '), 'verificado', WEB, finalUrl);
    const formPage = extra.find((p) => p.kind === 'contact' && /<form\b/i.test(p.body)) ?? (audit.signals?.form ? all[0] : undefined);
    if (formPage && setFact(facts, 'contactForm', formPage.url, 'verificado', WEB, formPage.url)) patch.contactFormUrl = formPage.url;
    for (const p of [...extra.filter((x) => x.kind === 'legal'), ...all]) {
      const legal = extractLegal(visibleText(p.body));
      if (legal.legalName && setFact(facts, 'legalName', legal.legalName, 'verificado', WEB, p.url)) patch.legalName = legal.legalName;
      if (legal.taxId && setFact(facts, 'taxId', legal.taxId, 'verificado', WEB, p.url)) patch.taxId = legal.taxId;
      if (legal.legalName || legal.taxId) break;
    }
    const about = extra.find((p) => p.kind === 'about');
    if (about) audit.text = clip(`${audit.text}\n\n[Página «${new URL(about.url).pathname}»]\n${visibleText(about.body)}`, 9000);

    // Señales de oportunidad a partir de la propia web.
    if (pages.careers.length || audit.signals?.careers) await addSignal(id, 'contratando', `${c.name} tiene sección de empleo en su web`, 'Tener ofertas publicadas suele indicar actividad o crecimiento. Conviene abrir la página para confirmar que hay vacantes vigentes.', WEB, pages.careers[0] ?? finalUrl, 'estimado');
    if (c.audit?.ok && c.audit.hash && audit.hash && c.audit.hash !== audit.hash) await addSignal(id, 'cambio_web', `${c.name} ha cambiado el contenido de su portada`, `El contenido difiere del de la revisión del ${c.audit.checkedAt.slice(0, 10)}.`, WEB, finalUrl, 'verificado');
  }

  for (const f of ['email', 'phone', 'legalName', 'employees', 'description', 'contactForm']) if (!facts[f]) setFact(facts, f, '', 'no_encontrado', home ? WEB : 'Fuentes consultadas');
  await update('companies', id, { ...patch, facts, audit, webStatus: webStatusOf(c.website, audit) });
  return getCompany(id);
}

/** Empresas guardadas cuya web conviene volver a revisar (las más antiguas primero). */
export async function dueForRecheck(limit: number): Promise<string[]> {
  const rows = await q<{ id: string }>("SELECT id FROM companies WHERE NOT archived AND website <> '' AND status NOT IN ('descartada','perdida') ORDER BY researched_at ASC NULLS FIRST LIMIT $1", [limit]);
  return rows.map((r) => r.id);
}
