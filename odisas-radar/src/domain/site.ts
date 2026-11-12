import { createHash } from 'node:crypto';
import type { SiteSignals, WebAudit, WebStatus } from './types';
import { domainOf, fold, isSharedDomain, normPhone } from './text';

/** Lectura del HTML público de una empresa: solo se extrae lo que la página publica. */

export interface Link {
  href: string;
  text: string;
}

const decode = (s: string) =>
  s
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));

export function visibleText(html: string): string {
  return decode(
    html
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<(script|style|noscript|svg|template|iframe)\b[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/tr|\/section)\b[^>]*>/gi, '\n')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/[ \t\r\f\v]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

export function extractLinks(html: string, base: string): Link[] {
  const out: Link[] = [];
  const re = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) && out.length < 600) {
    const href = m[1].match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const raw = decode((href?.[1] ?? href?.[2] ?? href?.[3] ?? '').trim());
    if (!raw || raw.startsWith('#') || /^javascript:/i.test(raw)) continue;
    let abs = raw;
    if (!/^(mailto|tel|whatsapp|sms):/i.test(raw)) {
      try {
        abs = new URL(raw, base).href;
      } catch {
        continue;
      }
    }
    out.push({ href: abs, text: visibleText(m[2]).slice(0, 80) });
  }
  return out;
}

const JUNK_EMAIL = /(example|ejemplo|dominio|domain|tuemail|tucorreo|email\.com|sentry|wixpress|godaddy|schema\.org|w3\.org|\.(png|jpe?g|gif|webp|svg|css|js)$)/i;
const GENERIC_BOX = /^(info|informacion|contacto|contact|hola|hello|comercial|ventas|sales|administracion|admin|oficina|pedidos|atencion|atencionalcliente|clientes|general|empresa|marketing|rrhh|presupuestos|recepcion)\b/;

export interface FoundEmail {
  email: string;
  /** Buzón genérico de empresa (info@, comercial@…) frente a uno que parece de una persona. */
  generic: boolean;
  ownDomain: boolean;
}

export function extractEmails(html: string, siteDomain: string): FoundEmail[] {
  const found = new Map<string, FoundEmail>();
  const text = decode(html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' '));
  for (const m of text.matchAll(/[a-z0-9][a-z0-9._%+-]{0,63}@[a-z0-9-]+(?:\.[a-z0-9-]+)+/gi)) {
    const email = m[0].toLowerCase().replace(/\.$/, '');
    if (JUNK_EMAIL.test(email) || found.has(email)) continue;
    const domain = domainOf(email);
    if (!domain) continue;
    found.set(email, { email, generic: GENERIC_BOX.test(email.split('@')[0]), ownDomain: !!siteDomain && (domain === siteDomain || domain.endsWith('.' + siteDomain) || siteDomain.endsWith('.' + domain)) });
  }
  // Primero los buzones genéricos del propio dominio: son los adecuados para un primer contacto B2B.
  return [...found.values()].sort((a, b) => Number(b.ownDomain) + Number(b.generic) * 2 - (Number(a.ownDomain) + Number(a.generic) * 2));
}

export function extractPhones(html: string, links: Link[]): string[] {
  const out: string[] = [];
  const add = (v: string) => {
    const n = normPhone(v);
    if (n.length === 9 && /^[6-9]/.test(n) && !out.includes(n)) out.push(n);
  };
  links.filter((l) => /^tel:/i.test(l.href)).forEach((l) => add(l.href.slice(4)));
  const text = visibleText(html);
  for (const m of text.matchAll(/(?:\+34|0034)?[\s.-]?[6-9]\d{2}[\s.-]?\d{2,3}[\s.-]?\d{2,3}[\s.-]?\d{0,3}(?!\d)/g)) add(m[0]);
  return out.slice(0, 5);
}

const SOCIAL: [string, RegExp][] = [
  ['linkedin', /linkedin\.com\/(company|in|school)\/[^/?#\s]+/i],
  ['facebook', /facebook\.com\/(?!sharer|share|tr\b|plugins|dialog)[^/?#\s]+/i],
  ['instagram', /instagram\.com\/(?!p\/|explore)[^/?#\s]+/i],
  ['x', /(?:twitter|x)\.com\/(?!intent|share|home)[^/?#\s]+/i],
  ['youtube', /youtube\.com\/(channel\/|c\/|user\/|@)[^/?#\s]+/i],
  ['tiktok', /tiktok\.com\/@[^/?#\s]+/i],
];

export function extractSocials(links: Link[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const l of links) for (const [name, re] of SOCIAL) if (!out[name] && re.test(l.href)) out[name] = l.href.split('?')[0];
  return out;
}

/** Páginas internas donde las empresas publican sus datos de contacto y legales. */
export function keyPages(links: Link[], base: string): { contact: string[]; legal: string[]; about: string[]; careers: string[] } {
  const host = new URL(base).hostname.replace(/^www\./, '');
  const pick = (re: RegExp) => {
    const seen = new Set<string>();
    for (const l of links) {
      if (!/^https?:/i.test(l.href)) continue;
      let u: URL;
      try {
        u = new URL(l.href);
      } catch {
        continue;
      }
      if (u.hostname.replace(/^www\./, '') !== host) continue;
      if (/\.(pdf|jpe?g|png|zip|docx?)$/i.test(u.pathname)) continue;
      if (re.test(fold(u.pathname + ' ' + l.text))) seen.add(u.origin + u.pathname);
    }
    return [...seen].slice(0, 2);
  };
  return {
    contact: pick(/contact|contacto|donde-estamos|localizacion|ubicacion/),
    legal: pick(/aviso[- ]?legal|legal|privacidad|privacy/),
    about: pick(/quienes[- ]?somos|sobre[- ]?nosotros|nosotros|empresa|about|conocenos|historia/),
    careers: pick(/empleo|trabaja[- ]con|careers|ofertas[- ]de[- ]trabajo|unete|talento/),
  };
}

export function extractLegal(text: string): { legalName: string; taxId: string } {
  const taxId = text.match(/\b(?:C\.?I\.?F\.?|N\.?I\.?F\.?)[\s:.-]*([ABCDEFGHJNPQRSUVW][-\s.]?\d{7}[-\s.]?[0-9A-J])\b/i)?.[1]?.replace(/[-\s.]/g, '').toUpperCase() ?? '';
  const name = text.match(/([A-ZÁÉÍÓÚÑ0-9][A-Za-zÁÉÍÓÚÑáéíóúñü0-9&.' -]{2,70}?),?\s+(S\.\s?L\.\s?U\.|S\.\s?L\.\s?L\.|S\.\s?L\.|S\.\s?A\.\s?U\.|S\.\s?A\.|SLU|SL|SAU|SA|S\.\s?Coop\.?)(?=[\s,.;)]|$)/);
  let legalName = name ? `${name[1].trim()} ${name[2].replace(/\s/g, '')}`.replace(/\s+/g, ' ') : '';
  // Las frases legales suelen empezar por «titular: …» o «propiedad de …»: se queda el nombre.
  legalName = legalName.replace(/^.*(?:^|\s)(?:titular(?:idad)?|propiedad de|denominaci[oó]n social|raz[oó]n social|responsable|es)\s*:?\s+(?=[A-ZÁÉÍÓÚÑ0-9])/s, '');
  return { legalName: legalName.length > 4 && legalName.length < 90 ? legalName : '', taxId };
}

export function detectSignals(html: string, finalUrl: string, links: Link[]): SiteSignals {
  const h = html.toLowerCase();
  const text = visibleText(html);
  const years = [...text.matchAll(/(?:©|&copy;|copyright)[^0-9]{0,40}(?:(?:19|20)\d{2}\s*[-–]\s*)?((?:19|20)\d{2})/gi)].map((m) => Number(m[1]));
  const gen = html.match(/<meta[^>]+name=["']generator["'][^>]*content=["']([^"']+)["']/i)?.[1] ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]*name=["']generator["']/i)?.[1] ?? null;
  const platform = gen ?? (h.includes('wp-content') ? 'WordPress' : h.includes('cdn.shopify') ? 'Shopify' : h.includes('prestashop') ? 'PrestaShop' : h.includes('wixstatic') ? 'Wix' : h.includes('squarespace') ? 'Squarespace' : null);
  const hrefs = links.map((l) => l.href.toLowerCase());
  const langs = new Set([...html.matchAll(/hreflang=["']([a-z]{2})/gi)].map((m) => m[1].toLowerCase()));
  return {
    https: finalUrl.startsWith('https://'),
    responsive: /<meta[^>]+name=["']viewport["']/i.test(html),
    copyrightYear: years.length ? Math.max(...years) : null,
    generator: platform ? platform.slice(0, 60) : null,
    ecommerce: /woocommerce|cdn\.shopify|prestashop|add[-_]to[-_]cart|añadir al carrito|anadir al carrito|carrito de compra|\/cart\b|\/cesta\b|magento/i.test(h),
    chat: /tawk\.to|crisp\.chat|intercom|tidio|livechatinc|zendesk|hs-scripts|hubspot|drift\.com|smartsupp|chatbot|landbot|jivo/i.test(h),
    whatsapp: hrefs.some((x) => /wa\.me\/|api\.whatsapp\.com|whatsapp:/.test(x)),
    form: /<form\b/i.test(html) && /type=["'](email|tel)["']|name=["'][^"']*(mail|phone|telefono|nombre|name|mensaje|message)/i.test(html),
    analytics: /googletagmanager|google-analytics|gtag\(|matomo|plausible\.io|fbq\(/i.test(h),
    booking: /calendly|reserva online|reservar cita|pedir cita|booking|cita previa|bookitit|doctoralia/i.test(h),
    clientArea: /area (de )?clientes?|área (de )?clientes?|acceso clientes|zona clientes|portal (del |de )?cliente|mi cuenta|login/i.test(h),
    catalogPdf: hrefs.some((x) => /\.pdf(\?|$)/.test(x) && /catalog|tarifa|producto/.test(x)) || /descargar cat[aá]logo|cat[aá]logo en pdf/i.test(h),
    careers: hrefs.some((x) => /empleo|trabaja-con|careers|ofertas-de-trabajo|unete/.test(x)),
    languages: Math.max(1, langs.size),
    wordCount: text.split(/\s+/).filter(Boolean).length,
  };
}

/** Estado de la web a partir de hechos medidos (no de opiniones). */
export function webStatusOf(website: string, audit: WebAudit | null, now = new Date()): WebStatus {
  if (!website) return 'sin_web';
  if (!audit) return 'desconocido';
  if (!audit.ok) return audit.robotsBlocked ? 'desconocido' : 'caida';
  const s = audit.signals;
  if (!s) return 'desconocido';
  const age = s.copyrightYear ? now.getFullYear() - s.copyrightYear : 0;
  const old = [!s.responsive, !s.https, age >= 4, (audit.score ?? 100) < 45].filter(Boolean).length;
  if (old >= 2 || !s.responsive) return 'desactualizada';
  if (old === 1 || (audit.score ?? 100) < 70 || age >= 2 || s.wordCount < 120) return 'mejorable';
  return 'correcta';
}

/** Motivos concretos por los que una web se considera antigua o mejorable. */
export function webFindings(audit: WebAudit | null, now = new Date()): string[] {
  const s = audit?.signals;
  if (!audit?.ok || !s) return [];
  const out: string[] = [];
  if (!s.responsive) out.push('La web no está adaptada a móviles (no declara «viewport»).');
  if (!s.https) out.push('La web no usa conexión segura HTTPS.');
  if (s.copyrightYear && now.getFullYear() - s.copyrightYear >= 2) out.push(`El pie de página indica ${s.copyrightYear} como último año de copyright.`);
  if (audit.score != null && audit.score < 70) out.push(`Diagnóstico técnico de la portada: ${audit.score}/100.`);
  if (s.wordCount < 120) out.push('La portada tiene muy poco contenido.');
  return out;
}

export function contentHash(text: string): string {
  // Se ignoran números y espacios para que una fecha o un contador no cuenten como cambio.
  return createHash('sha256').update(fold(text).replace(/[\d\s]+/g, ' ')).digest('hex').slice(0, 32);
}

export const isCompanyDomain = (domain: string) => !!domain && !isSharedDomain(domain);
