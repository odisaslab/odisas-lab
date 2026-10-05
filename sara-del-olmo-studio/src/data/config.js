/**
 * CONFIG · todo lo que Sara (o quien mantenga la web) puede tocar sin entrar en el código visual.
 *
 * Regla de oro: aquí solo van datos REALES. Lo que falta se deja vacío y la web lo marca
 * como [DATOS PENDIENTES] hasta que se rellene. Nada se inventa.
 */
export const CONFIG = {
  /* ───────── Marca ───────── */
  name: 'Sara del Olmo Studio',
  shortName: 'Sara del Olmo',
  owner: 'Sara Agudo del Olmo',
  /** Dominio definitivo. [DATOS PENDIENTES] hasta confirmar el dominio de Sara. */
  siteUrl: 'https://saradelolmostudio.es',
  siteUrlConfirmed: false,

  /* ───────── Reservas ───────── */
  /** Todos los botones «Pedir cita» apuntan aquí. */
  bookingUrl:
    'https://booksy.com/es-es/143498_sara-del-olmo-studio_salon-de-unas_53737_humanes-de-madrid',

  /* ───────── Contacto (NO publicados todavía → [DATOS PENDIENTES]) ───────── */
  /** Formato internacional, p. ej. '+34600000000'. */
  phone: '',
  /** Cómo se muestra, p. ej. '600 00 00 00'. */
  phoneDisplay: '',
  /** Solo dígitos con prefijo, p. ej. '34600000000'. */
  whatsapp: '',
  email: '',

  /* ───────── Redes ───────── */
  instagram: 'https://www.instagram.com/saradelolmostudio/',
  instagramHandle: '@saradelolmostudio',
  /** Facebook figura como «saramagicnails» (antiguo nombre). Hasta que Sara confirme que es suya, no se muestra. */
  facebook: 'https://www.facebook.com/saramagicnails/',
  facebookConfirmed: false,

  /* ───────── Ubicación ───────── */
  address: {
    street: 'C. Madrid, 40, local 3',
    streetFull: 'Calle Madrid, 40, local 3',
    postalCode: '28970',
    city: 'Humanes de Madrid',
    region: 'Madrid',
    country: 'ES',
  },
  /** Cámbialo por el enlace a la ficha de Google Business cuando exista. */
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=Calle%20Madrid%2040%2C%2028970%20Humanes%20de%20Madrid',
  /** Municipios cercanos, para SEO local. Editable. */
  areaServed: ['Humanes de Madrid', 'Fuenlabrada', 'Moraleja de Enmedio', 'Griñón'],

  /* ───────── Horario ───────── */
  /**
   * Solo se vio «09:30 a 20:00» un miércoles; los días no están confirmados.
   * Rellena `days` (p. ej. 'Lunes a viernes') y quita `pending` cuando Sara lo confirme.
   * Para JSON-LD añade también `schema` (p. ej. { dayOfWeek: ['Monday', …], opens: '09:30', closes: '20:00' }).
   */
  hours: [{ days: '', time: '09:30 a 20:00', pending: true }],

  /* ───────── Valoración (Booksy) ───────── */
  rating: {
    value: 5.0,
    count: 291,
    source: 'Booksy',
    distribution: [
      { stars: 5, n: 283 },
      { stars: 4, n: 7 },
      { stars: 3, n: 1 },
      { stars: 2, n: 0 },
      { stars: 1, n: 0 },
    ],
  },

  /* ───────── Formularios y vales ───────── */
  /** Formspree u otro servicio. Vacío → el formulario abre WhatsApp. */
  formEndpoint: '',
  /** Tienda de vales. Vacío → el vale se pide por WhatsApp. */
  voucherUrl: '',

  /* ───────── Analítica ───────── */
  /** ID de Google Tag Manager (GTM-XXXXXXX). Vacío → solo se rellena dataLayer. GA4 se configura dentro de GTM. */
  gtmId: '',

  /* ───────── Aspecto ───────── */
  /** Tono de piel de la mano ilustrada. Es un dibujo, no una fotografía. */
  skinTone: '#E8C4B7',
};

/** Textos de la barra de [DATOS PENDIENTES]. */
export const PENDING = '[ DATOS PENDIENTES ]';

/** Ayudas derivadas (no editar). */
export const has = {
  phone: () => Boolean(CONFIG.phone),
  whatsapp: () => Boolean(CONFIG.whatsapp),
};
