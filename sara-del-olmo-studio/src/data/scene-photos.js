/**
 * FOTOS DE LAS ESCENAS (portada, pies y final) — originales en scene-src/, optimizadas con `npm run scene-photos`.
 *
 * ⚠ Imágenes PROVISIONALES generadas con IA. Son ambientación (no son trabajos de Sara del Olmo Studio) y deben
 *   sustituirse por fotografías reales del estudio cuando existan. Para cambiarlas: pon la foto nueva en scene-src/
 *   con el mismo nombre, actualiza las medidas de abajo y ejecuta `npm run scene-photos`.
 *
 * La mano en plano general y la macro se alinean por la UÑA CENTRAL: misma posición y mismo alto en un «mundo»
 * común (coordenadas de la foto general). Así la cámara puede acercarse a una y «enfocar» la otra sin saltos.
 */
export const SCENE_DIR = '/img/scene';

export const HAND = {
  alt: 'Mano con las uñas pintadas en rojo cereza',
  // «blur» = la misma foto desenfocada (para el cambio de enfoque entre la foto general y la macro)
  wide: { file: 'mano-2048', blur: 'mano-blur', w: 1024, h: 1536 },
  close: { file: 'mano-cerca-3072', blur: 'mano-cerca-blur', w: 3072, h: 2048, refW: 1536, refH: 1024 },
  // uña del dedo corazón medida en cada foto original (px): centro, ancho y alto
  nailWide: { cx: 536, cy: 278, w: 49, h: 99 },
  nailClose: { cx: 774, cy: 315, w: 124, h: 289 },
  // macro de una uña (la inmersión final): se alinea con la macro de las cuatro uñas por el ancho de la uña y el borde de la cutícula
  macro: { file: 'macro-una-3072', blur: 'macro-una-blur', w: 3072, h: 2048, refW: 1536, refH: 1024, nail: { cx: 815, bottom: 934, w: 880 }, look: { x: 800, y: 470 } },
  // puntos útiles de la foto general
  tips: { x: 590, y: 345 },       // centro de las cuatro uñas
  top: 229,                       // punta del dedo más alto
  centerX: 485,                   // eje de la mano
};

/** Dónde caen la macro de las cuatro uñas (b) y la macro de una uña (c) dentro del mundo (px de la foto general). */
export function handWorld() {
  const k = HAND.nailWide.h / HAND.nailClose.h;
  const b = {
    x: HAND.nailWide.cx - HAND.nailClose.cx * k,
    y: HAND.nailWide.cy - HAND.nailClose.cy * k,
    w: HAND.close.refW * k,
    h: HAND.close.refH * k,
  };
  // c: en px de la macro b → ancho de la uña y borde inferior (cutícula) coinciden
  const m = HAND.macro, kc = HAND.nailClose.w / m.nail.w;
  const cb = { x: HAND.nailClose.cx - m.nail.cx * kc, y: HAND.nailClose.cy + HAND.nailClose.h / 2 - m.nail.bottom * kc };
  const toWorld = (px, py) => ({ x: b.x + px * k, y: b.y + py * k });
  const c0 = toWorld(cb.x, cb.y);
  const c = { x: c0.x, y: c0.y, w: m.refW * kc * k, h: m.refH * kc * k, k: kc * k };
  const look = { x: c.x + m.look.x * c.k, y: c.y + m.look.y * c.k };
  return { k, ...b, b, c, look };
}

export const FEET = {
  alt: 'Un par de pies con las uñas pintadas en rojo cereza',
  img: { file: 'pies-2048', w: 1024, h: 1536 },
  bigToes: { x: 516, y: 340, span: 345 },        // punto medio entre los dos dedos gordos y lo que ocupan
  core: { x0: 85, x1: 940, y0: 280, yLand: 1250, yPort: 900 }, // zona que se muestra (el resto se difumina)
};

/** Cejas: foto del rostro (px de la foto original 1536×1024). Las guías de medida se dibujan en estas coordenadas. */
export const BROWS = {
  alt: 'Primer plano de unos ojos con las cejas definidas',
  img: { file: 'cejas-3072', w: 3072, h: 2048, refW: 1536, refH: 1024 },
  left: { head: [632, 602], peak: [415, 477], tail: [195, 583] },
  right: { head: [905, 603], peak: [1120, 478], tail: [1370, 585] },
  axis: 768,                         // eje de la nariz
  eyes: { y: 745, inL: 585, inR: 955 }, // altura de los ojos y comisuras internas
  focus: { x: 1130, y: 540 },        // ceja derecha: hacia ahí se acerca la cámara
  center: { x: 768, y: 560 },
};

/** Piercing: oreja con joyas y macro de una joya (se alinean por el piercing de la concha). */
export const EAR = {
  alt: 'Oreja con varios piercings con joyas de titanio',
  jewelAlt: 'Joya de titanio con circonita en primer plano',
  ear: { file: 'oreja-2048', blur: 'oreja-blur', w: 1024, h: 1536 },
  jewel: { file: 'joya-2508', blur: 'joya-blur', w: 2508, h: 2508, refW: 1254, refH: 1254, stone: { cx: 675, cy: 660, d: 440 } },
  studs: [
    { id: 'helix', x: 695, y: 460 }, { id: 'forward', x: 702, y: 606 }, { id: 'conch', x: 523, y: 687 },
    { id: 'tragus', x: 316, y: 738 }, { id: 'lobe1', x: 463, y: 946 }, { id: 'lobe2', x: 374, y: 982 },
  ],
  studD: 26,                          // diámetro de la cabeza de cada piercing en la foto de la oreja
  focus: { x: 540, y: 700 },          // centro de la composición
};

/** Dónde cae la macro de la joya dentro de la foto de la oreja (la piedra coincide con el piercing de la concha). */
export function earWorld() {
  const j = EAR.jewel, conch = EAR.studs.find((s) => s.id === 'conch');
  const k = EAR.studD / j.stone.d;
  return { k, x: conch.x - j.stone.cx * k, y: conch.y - j.stone.cy * k, w: j.refW * k, h: j.refH * k, cx: conch.x, cy: conch.y };
}
