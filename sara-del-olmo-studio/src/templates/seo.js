/** SEO local: metadatos, Open Graph y Schema.org (NailSalon, WebSite, FAQPage) generados desde los datos. */
import { CONFIG } from '../data/config.js';
import { SERVICES, CATS } from '../data/services.js';
import { FAQS } from '../data/faqs.js';
import { esc } from './util.js';

export const SEO = {
  title: 'Sara del Olmo Studio | Manicura, uñas y cejas en Humanes de Madrid',
  description:
    'Estudio de uñas en Humanes de Madrid: manicura con refuerzo y semipermanente, extensión de uñas, pedicura spa, micropigmentación de cejas y piercing con titanio. 5,0 en Booksy. Reserva online.',
  ogTitle: 'Sara del Olmo Studio | Uñas con arte en Humanes de Madrid',
  ogDescription: 'Manicura, extensiones, pedicura spa, micropigmentación de cejas y piercing. Reserva online.',
  keywords: [
    'Sara del Olmo Studio', 'uñas Humanes de Madrid', 'manicura Humanes', 'manicura cerca de Humanes', 'pedicura Humanes',
    'uñas semipermanentes Humanes', 'nail art Humanes', 'micropigmentación cejas Humanes', 'piercing Humanes', 'diseño de oreja Humanes',
  ],
};

const base = () => CONFIG.siteUrl.replace(/\/$/, '');

export function offerCatalog() {
  return {
    '@type': 'OfferCatalog',
    name: 'Servicios',
    itemListElement: Object.entries(CATS).map(([k, cat]) => ({
      '@type': 'OfferCatalog',
      name: cat.label,
      itemListElement: SERVICES.filter((s) => s.cat === k).map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.name, description: s.desc, serviceType: cat.label },
        priceCurrency: 'EUR',
        ...(s.from ? { priceSpecification: { '@type': 'PriceSpecification', minPrice: s.price, priceCurrency: 'EUR' } } : { price: s.price }),
      })),
    })),
  };
}

export function jsonLd() {
  const a = CONFIG.address;
  const sameAs = [CONFIG.instagram, CONFIG.bookingUrl];
  if (CONFIG.facebookConfirmed) sameAs.push(CONFIG.facebook);
  const salon = {
    '@type': 'NailSalon',
    '@id': `${base()}/#estudio`,
    name: CONFIG.name,
    url: `${base()}/`,
    description: 'Estudio de uñas, micropigmentación de cejas y piercing en Humanes de Madrid.',
    image: `${base()}/og.png`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: a.streetFull,
      addressLocality: a.city,
      postalCode: a.postalCode,
      addressRegion: a.region,
      addressCountry: a.country,
    },
    areaServed: CONFIG.areaServed,
    sameAs,
    founder: { '@type': 'Person', name: CONFIG.owner },
    makesOffer: undefined,
    hasOfferCatalog: offerCatalog(),
    potentialAction: { '@type': 'ReserveAction', target: { '@type': 'EntryPoint', urlTemplate: CONFIG.bookingUrl, actionPlatform: ['http://schema.org/DesktopWebPlatform', 'http://schema.org/MobileWebPlatform'] }, result: { '@type': 'Reservation', name: 'Cita en Sara del Olmo Studio' } },
  };
  if (CONFIG.phone) salon.telephone = CONFIG.phone;
  if (CONFIG.email) salon.email = CONFIG.email;
  const spec = CONFIG.hours.filter((h) => h.schema && !h.pending).map((h) => ({ '@type': 'OpeningHoursSpecification', ...h.schema }));
  if (spec.length) salon.openingHoursSpecification = spec;
  const graph = [
    salon,
    { '@type': 'WebSite', '@id': `${base()}/#web`, url: `${base()}/`, name: CONFIG.name, inLanguage: 'es-ES', publisher: { '@id': `${base()}/#estudio` } },
    {
      '@type': 'FAQPage',
      '@id': `${base()}/#faq`,
      mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ];
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}

export function headTags({ fonts = [], js, css }) {
  const url = `${base()}/`;
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(SEO.title)}</title>
<meta name="description" content="${esc(SEO.description)}">
<meta name="keywords" content="${esc(SEO.keywords.join(', '))}">
<meta name="author" content="${esc(CONFIG.name)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="${esc(url)}">
${CONFIG.siteUrlConfirmed ? '' : '<!-- [DATOS PENDIENTES] dominio definitivo: cambia CONFIG.siteUrl en src/data/config.js (canonical, Open Graph, sitemap y Schema.org salen de ahí) -->'}
<meta name="theme-color" content="#2A1418">
<meta name="color-scheme" content="light">
<meta name="format-detection" content="telephone=no">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_ES">
<meta property="og:site_name" content="${esc(CONFIG.name)}">
<meta property="og:title" content="${esc(SEO.ogTitle)}">
<meta property="og:description" content="${esc(SEO.ogDescription)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(base())}/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Sara del Olmo Studio: una mano con las uñas pintadas en rojo cereza">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(SEO.ogTitle)}">
<meta name="twitter:description" content="${esc(SEO.ogDescription)}">
<meta name="twitter:image" content="${esc(base())}/og.png">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
${fonts.filter((f) => f.includes('wght-normal')).map((f) => `<link rel="preload" href="${f}" as="font" type="font/woff2" crossorigin>`).join('\n')}
<link rel="stylesheet" href="${css}">
<link rel="modulepreload" href="${js}">
<script type="application/ld+json">${jsonLd()}</script>`;
}

export function gtmHead() {
  if (!CONFIG.gtmId) {
    return `<!-- Google Tag Manager: pon el ID en CONFIG.gtmId (src/data/config.js) y se inserta solo. GA4 se configura dentro de GTM.
     Eventos que ya se envían a dataLayer: reservation_click, phone_click, whatsapp_click, gift_voucher_click, contact_form_submit, service_view, pricing_view -->`;
  }
  return `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${esc(CONFIG.gtmId)}');</script>`;
}
export const gtmBody = () =>
  CONFIG.gtmId ? `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${esc(CONFIG.gtmId)}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>` : '';
