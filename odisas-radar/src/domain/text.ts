/** Normalización de texto para comparar empresas y detectar duplicados. */

export function fold(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

const LEGAL_FORMS = /\b(s\s?l\s?u|s\s?l\s?l|s\s?l\s?p|s\s?l|s\s?a\s?u|s\s?a\s?l|s\s?a|s\s?c\s?p|s\s?c|c\s?b|s\s?coop|sociedad limitada|sociedad anonima|soc coop)\b/g;

/** Nombre comparable: sin acentos, puntuación ni forma jurídica («Talleres Gómez, S.L.» → «talleres gomez»). */
export function normName(name: string): string {
  return fold(name)
    .replace(/&/g, ' y ')
    .replace(/[.,;:()'"´`’\-_/\\|]+/g, ' ')
    .replace(LEGAL_FORMS, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Dominio comparable de una web o un correo («https://www.Acme.es/contacto» → «acme.es»). */
export function domainOf(urlOrEmail: string): string {
  let v = (urlOrEmail || '').trim().toLowerCase();
  if (!v) return '';
  if (v.includes('@') && !v.includes('/')) v = v.split('@').pop() ?? '';
  v = v.replace(/^[a-z]+:\/\//, '').replace(/^www\./, '');
  v = v.split(/[/?#]/)[0].replace(/:\d+$/, '');
  return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(v) ? v : '';
}

/** Dominios que no identifican a una empresa: un perfil en una red o un correo gratuito. */
export const SHARED_DOMAINS = new Set([
  'facebook.com', 'instagram.com', 'linkedin.com', 'twitter.com', 'x.com', 'youtube.com', 'tiktok.com', 'wa.me',
  'google.com', 'goo.gl', 'linktr.ee', 'wixsite.com', 'wordpress.com', 'blogspot.com', 'business.site', 'webnode.es',
  'gmail.com', 'hotmail.com', 'hotmail.es', 'outlook.com', 'outlook.es', 'yahoo.es', 'yahoo.com', 'icloud.com', 'live.com', 'telefonica.net', 'movistar.es',
]);

export function isSharedDomain(domain: string): boolean {
  return [...SHARED_DOMAINS].some((d) => domain === d || domain.endsWith('.' + d));
}

/** Teléfono comparable: solo dígitos y sin el prefijo de España. */
export function normPhone(phone: string): string {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('34')) return digits.slice(2);
  if (digits.length === 13 && digits.startsWith('0034')) return digits.slice(4);
  return digits.length >= 9 ? digits : '';
}

export function formatPhone(phone: string): string {
  const d = normPhone(phone);
  return d.length === 9 ? `${d.slice(0, 3)} ${d.slice(3, 5)} ${d.slice(5, 7)} ${d.slice(7)}` : phone.trim();
}

export function normalizeWebsite(url: string): string {
  let v = (url || '').trim();
  if (!v) return '';
  if (!/^https?:\/\//i.test(v)) v = 'https://' + v;
  try {
    const u = new URL(v);
    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(u.hostname)) return '';
    u.hash = '';
    return u.href.replace(/\/$/, '');
  } catch {
    return '';
  }
}

export function clip(text: string, max: number): string {
  const t = text.trim();
  return t.length <= max ? t : t.slice(0, max - 1).trimEnd() + '…';
}
