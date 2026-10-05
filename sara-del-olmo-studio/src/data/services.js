/**
 * SERVICES · los 25 servicios publicados en Booksy.
 * Precios y duraciones tal cual aparecían al documentar la web. Revisar con Sara antes de publicar.
 *
 * - `from: true`  → «desde»: el precio final depende del diseño o de la joya.
 * - `star: true`  → servicio destacado de su categoría.
 * - `incl`        → «qué incluye» (solo cuando está documentado).
 */
export const CATS = {
  manos: { label: 'Manos', short: 'Manos' },
  pies: { label: 'Pies', short: 'Pies' },
  cejas: { label: 'Cejas', short: 'Cejas' },
  piercing: { label: 'Piercing y joyería', short: 'Piercing' },
};

const DECO =
  'Decoraciones, efectos y suplementos se calculan según el diseño que elijas el día de tu cita.';

export const SERVICES = [
  /* ───── MANOS ───── */
  {
    id: 'm1', cat: 'manos', star: true,
    name: 'Manicura combinada con refuerzo y semipermanente',
    price: 25, from: true, dur: '1 h 10 min',
    desc: 'El servicio estrella del estudio. Trabajamos sobre tu propio largo: nivelamos la uña para corregir asimetrías y que no se rompa, y terminamos con el color semipermanente que elijas o con un acabado traslúcido natural.',
    incl: [
      'Manicura combinada con torno para una cutícula impecable',
      'Nivelación o refuerzo en tono natural traslúcido',
      'Esmaltado semipermanente, si lo quieres',
      'Dura aproximadamente de 3 a 4 semanas',
    ],
    note: DECO,
  },
  {
    id: 'm2', cat: 'manos',
    name: 'Retirada de acrílico, gel o acrigel',
    price: 10, from: true, dur: '30 min',
    desc: 'Retiramos el producto con cuidado y hacemos manicura combinada para que tus uñas queden limpias y sanas.',
    note: '10 € si después te haces otro servicio y 20 € si solo vienes a retirar.',
  },
  {
    id: 'm3', cat: 'manos',
    name: 'Arreglo de una uña',
    price: 1, dur: '15 min',
    desc: 'Reparamos una uña rota o levantada para que tu manicura siga perfecta.',
  },
  {
    id: 'm4', cat: 'manos',
    name: 'Retirada de acrílico o gel + extensión de uñas',
    price: 45, from: true, dur: '2 h',
    desc: 'Retiramos todo el producto anterior y empezamos de cero con una puesta nueva de extensión, siempre con manicura combinada previa.',
    note: DECO,
  },
  {
    id: 'm5', cat: 'manos',
    name: 'Retirada de acrílico o gel + refuerzo en uña natural',
    price: 35, from: true, dur: '1 h 40 min',
    desc: 'Quitamos el producto anterior y reforzamos tu uña natural para darle estructura y evitar que se parta. Dura de 3 a 4 semanas.',
    note: DECO,
  },
  {
    id: 'm6', cat: 'manos',
    name: 'Manicura combinada sin esmalte',
    price: 15, dur: '30 min',
    desc: 'Para llevar tus uñas naturales cuidadas y sin color: cutícula limpia con torno, forma a tu gusto y aceite regenerador.',
  },
  {
    id: 'm7', cat: 'manos',
    name: 'Retirada de semipermanente con refuerzo + manicura',
    price: 15, dur: '30 min',
    desc: 'Para dar un descanso a tus uñas: retiramos el semipermanente sin dañar la uña natural y terminamos con manicura y aceite de cutículas.',
  },
  {
    id: 'm8', cat: 'manos',
    name: 'Extensión de uñas acrigel o soft gel',
    price: 35, from: true, dur: '1 h 30 min',
    desc: 'Uñas largas con la forma que quieras, esculpidas con detalle para que sean resistentes y elegantes. Mantenimiento recomendado cada 3 o 4 semanas.',
    note: DECO,
  },
  {
    id: 'm9', cat: 'manos',
    name: 'Relleno acrílico',
    price: 28, from: true, dur: '1 h 30 min',
    desc: 'El mantenimiento de tus uñas acrílicas: renovamos producto, forma y acabado para que luzcan como recién hechas. Mejor no pasar de 4 semanas entre rellenos.',
    note: DECO,
  },

  /* ───── PIES ───── */
  {
    id: 'p1', cat: 'pies',
    name: 'Arreglo de uñas sin esmaltar',
    price: 15, dur: '30 min',
    desc: 'Corte, limado y limpieza de cutículas con torno para unos pies cuidados, sin color.',
  },
  {
    id: 'p2', cat: 'pies',
    name: 'Retirar esmalte y arreglo de uñas',
    price: 15, dur: '30 min',
    desc: 'Retiramos el esmalte, cortamos, limamos, limpiamos la cutícula, pulimos y aplicamos aceite.',
  },
  {
    id: 'p3', cat: 'pies',
    name: 'Retirada de esmalte y pedicura completa sin esmaltar',
    price: 25, dur: '40 min',
    desc: 'Pedicura completa sin color, empezando por retirar el esmalte que lleves.',
  },
  {
    id: 'p4', cat: 'pies', star: true,
    name: 'Pedicura spa con semipermanente',
    price: 33, from: true, dur: '1 h',
    desc: 'Un momento de spa para tus pies: baño, cuidado de uñas y cutículas, durezas, exfoliación, semipermanente de larga duración y masaje con crema hidratante.',
    incl: [
      'Baño de pies relajante',
      'Talones y durezas',
      'Exfoliación suave',
      'Semipermanente de 5 a 6 semanas',
      'Masaje de 5 minutos',
    ],
    note: DECO,
  },
  {
    id: 'p5', cat: 'pies',
    name: 'Semipermanente en pies',
    price: 25, from: true, dur: '40 min',
    desc: 'Color impecable y duradero sin la pedicura completa: corte, limado, cutícula con torno y semipermanente de 5 a 6 semanas.',
    note: DECO,
  },
  {
    id: 'p6', cat: 'pies',
    name: 'Pedicura completa sin esmaltado',
    price: 25, dur: '40 min',
    desc: 'Baño, uñas y cutículas, durezas, exfoliación e hidratación con masaje, sin color.',
  },

  /* ───── CEJAS ───── */
  {
    id: 'c1', cat: 'cejas', star: true,
    name: 'Micropigmentación de cejas efecto sombreado',
    price: 150, dur: '2 h',
    desc: 'Cejas definidas y naturales para levantarte cada día sin maquillarlas. Diseñamos la forma a partir de las medidas de tu rostro y la dibujamos antes para que la veas.',
    incl: [
      'Diseño personalizado según tus facciones',
      'Dibujo previo para validar la forma',
      'Retoque recomendado a los 35 días (se reserva aparte)',
    ],
  },
  {
    id: 'c2', cat: 'cejas',
    name: 'Retoque de pigmentación',
    price: 50, dur: '1 h 15 min',
    desc: 'Unos 35 días después de la primera sesión perfeccionamos el sombreado y reforzamos donde haga falta para conseguir el resultado definitivo.',
  },

  /* ───── PIERCING ───── */
  {
    id: 'x1', cat: 'piercing', star: true,
    name: 'Diseño de oreja con joyas',
    price: 25, from: true, dur: '45 min',
    desc: 'Diseñamos una composición de oreja armónica con joyas de titanio escogidas según tu estilo y tu anatomía. Si ya tienes agujeros, podemos rediseñarla cambiando o añadiendo piezas.',
    incl: ['Asesoramiento completo', 'Elección de joyas', 'Perforaciones necesarias'],
  },
  {
    id: 'x2', cat: 'piercing',
    name: 'Corrección y rediseño del lóbulo',
    price: 25, from: true, dur: '45 min',
    desc: 'Para perforaciones desalineadas o hechas con pistola: valoramos la zona y añadimos nuevas perforaciones para equilibrarla.',
    note: 'Incluye joya básica de titanio grado implante.',
  },
  {
    id: 'x3', cat: 'piercing',
    name: 'Piercing de ombligo flotante',
    price: 35, from: true, dur: '30 min',
    desc: 'Pensado para ombligos que se pliegan al sentarse, con joya de base plana que evita roces y presión.',
  },
  {
    id: 'x4', cat: 'piercing',
    name: 'Piercing de ombligo tradicional',
    price: 35, from: true, dur: '30 min',
    desc: 'Perforación clásica para ombligos con pliegue definido, con titanio de grado implante.',
  },
  {
    id: 'x5', cat: 'piercing',
    name: 'Piercing septum',
    price: 35, from: true, dur: '45 min',
    desc: 'Perforación simétrica y cómoda que respeta tu anatomía, con opción de joya fácil de ocultar.',
  },
  {
    id: 'x6', cat: 'piercing',
    name: 'Piercing nostril',
    price: 25, from: true, dur: '30 min',
    desc: 'El puntito en la nariz, con labret recto de titanio para una cicatrización limpia antes de pasar al aro.',
  },
  {
    id: 'x7', cat: 'piercing',
    name: 'Asesoramiento y cambio de joyería',
    price: 10, from: true, dur: '20 min',
    desc: 'Para piercings ya curados: medimos calibre y diámetro, te ayudamos a elegir y colocamos la joya en el momento.',
    note: 'Joyas desde 10 €.',
  },
  {
    id: 'x8', cat: 'piercing',
    name: 'Cambio de barrita',
    price: 10, from: true, dur: '15 min',
    desc: 'Cambiamos a una barrita más corta pasadas unas tres semanas para ayudar a que termine de cicatrizar.',
  },
];

export const svcById = (id) => SERVICES.find((s) => s.id === id);
export const svcsByCat = (cat) => SERVICES.filter((s) => s.cat === cat);
export const starOf = (cat) => SERVICES.find((s) => s.cat === cat && s.star) || svcsByCat(cat)[0];

/** «Qué tipo de servicio busco» → recomendación (test de dos preguntas). */
export const QUIZ = {
  start: {
    q: '¿Qué buscas para tus uñas?',
    step: 1,
    opts: [
      ['Mis uñas, pero más bonitas y fuertes', 'natural'],
      ['Más largo que mi uña natural', 'largo'],
      ['Solo cuidarlas, sin color', 'cuidado'],
    ],
  },
  natural: { q: '¿Llevas ahora gel o acrílico?', step: 2, opts: [['Sí', '=m5'], ['No', '=m1']] },
  largo: {
    q: '¿Ya llevas extensiones?',
    step: 2,
    opts: [
      ['Sí, me toca mantenimiento', '=m9'],
      ['Sí, pero quiero empezar de cero', '=m4'],
      ['No, sería la primera vez', '=m8'],
    ],
  },
  cuidado: { q: '¿Llevas semipermanente puesto?', step: 2, opts: [['Sí', '=m7'], ['No', '=m6']] },
};
