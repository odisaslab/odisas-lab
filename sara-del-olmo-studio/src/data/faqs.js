/**
 * FAQS · preguntas frecuentes. Se pintan en la página y se publican como FAQPage (JSON-LD).
 * Solo respuestas con datos reales del estudio.
 */
import { CONFIG } from './config.js';

export const FAQS = [
  {
    q: '¿Necesito pedir cita?',
    a: 'Sí, trabajamos solo con cita previa. Puedes reservar online a cualquier hora desde el botón «Pedir cita».',
  },
  {
    q: '¿Dónde está Sara del Olmo Studio?',
    a: `En ${CONFIG.address.street}, ${CONFIG.address.postalCode} ${CONFIG.address.city}.`,
  },
  {
    q: '¿Cuánto dura la manicura con refuerzo y semipermanente?',
    a: 'Entre 3 y 4 semanas, según el crecimiento de tu uña y tu día a día.',
  },
  {
    q: '¿Las decoraciones están incluidas en el precio?',
    a: 'Los precios corresponden al servicio básico. Decoraciones, efectos y suplementos se calculan el día de la cita según el diseño que elijas.',
  },
  {
    q: '¿Cuánto cuesta retirar el gel o el acrílico?',
    a: '10 € si después te haces otro servicio y 20 € si solo vienes a retirarlo y dejar tus uñas limpias.',
  },
  {
    q: '¿Cada cuánto tengo que hacer el relleno de acrílico?',
    a: 'Recomendamos no pasar de 4 semanas para evitar levantamientos y mantener la forma.',
  },
  {
    q: '¿La micropigmentación de cejas necesita retoque?',
    a: 'Sí. Hacemos un retoque unos 35 días después, cuando la piel ya ha cicatrizado, para perfeccionar el resultado.',
  },
  {
    q: '¿Qué joyas usáis en los piercings?',
    a: 'Titanio de grado implante. Te asesoramos para elegir la pieza y el tamaño que mejor encajan contigo.',
  },
  {
    q: '¿Cómo cuidáis la higiene?',
    a: 'Cada clienta tiene su propio paquete de herramientas esterilizado e individual, y trabajamos con guantes y mascarilla.',
  },
];
