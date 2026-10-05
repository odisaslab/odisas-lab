/**
 * LOOK · opciones del diseñador «Diseña tu look»: formas, 12 colores y 5 acabados.
 * Los parámetros de las formas son curvas Bézier sobre una uña de 100 × 164 unidades
 * (ver src/js/art/nail.js). Para añadir un color basta con una entrada nueva.
 */
export const COLORS = [
  { id: 'cereza', name: 'Cereza lacada', hex: '#7A1027' },
  { id: 'rojo', name: 'Rojo clásico', hex: '#B01329' },
  { id: 'nude', name: 'Nude rosado', hex: '#D7A49B' },
  { id: 'milky', name: 'Blanco lechoso', hex: '#F3E6E0' },
  { id: 'malva', name: 'Malva', hex: '#9B7690' },
  { id: 'lavanda', name: 'Lavanda', hex: '#B9A5D8' },
  { id: 'coral', name: 'Coral', hex: '#E3685B' },
  { id: 'mocha', name: 'Mocha', hex: '#5B3426' },
  { id: 'oliva', name: 'Oliva', hex: '#6D6A3B' },
  { id: 'noche', name: 'Azul noche', hex: '#1F2B4D' },
  { id: 'burdeos', name: 'Burdeos', hex: '#46101D' },
  { id: 'negro', name: 'Negro', hex: '#1B1416' },
];

export const SHAPES = {
  almendra: { label: 'Almendra', y0: 2, c1: [68, 6], c2: [94, 44], yS: 84 },
  redonda: { label: 'Redonda', y0: 4, c1: [78, 4], c2: [94, 24], yS: 56 },
  cuadrada: { label: 'Cuadrada', y0: 6, c1: [86, 6], c2: [94, 8], yS: 22 },
  bailarina: { label: 'Bailarina', y0: 8, c1: [72, 8], c2: [80, 16], yS: 98 },
  stiletto: { label: 'Stiletto', y0: 0, c1: [56, 20], c2: [94, 62], yS: 106 },
};

export const FINISHES = {
  brillo: { label: 'Brillo', hint: 'Reflejo limpio de lámpara' },
  mate: { label: 'Mate', hint: 'Sin reflejo, aterciopelado' },
  cromado: { label: 'Cromado', hint: 'Efecto espejo metálico' },
  aura: { label: 'Aura', hint: 'Color difuminado desde el centro' },
  francesa: { label: 'Francesa', hint: 'Fondo natural y punta de color' },
};

/** Look inicial (también el de la mano del hero y del final si la clienta no diseña nada). */
export const DEFAULT_LOOK = { shape: 'almendra', color: 'cereza', finish: 'brillo' };

export const colorById = (id) => COLORS.find((c) => c.id === id) || COLORS[0];
