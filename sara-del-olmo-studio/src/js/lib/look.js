/**
 * Estado compartido del look de la clienta. Lo elige en «Diseña tu look» y luego lo heredan
 * los pies (el color inunda la pantalla) y la mano terminada del final: la película es suya.
 */
import { DEFAULT_LOOK, colorById, SHAPES, FINISHES } from '../../data/look.js';
import { inkOn } from './color.js';

const subs = new Set();
export const look = { ...DEFAULT_LOOK, touched: new Set(), done: false };

export const lookHex = () => colorById(look.color).hex;
export const lookLabel = () => `${SHAPES[look.shape].label} · ${colorById(look.color).name} · ${FINISHES[look.finish].label}`;

/** Aplica al documento los colores que dependen del look (fondo y tinta de la escena de pies). */
export function applyLookTheme() {
  const hex = lookHex();
  const root = document.documentElement;
  root.style.setProperty('--pies-bg', hex);
  root.style.setProperty('--pies-ink', inkOn(hex));
  root.style.setProperty('--pies-ink-2', inkOn(hex) === '#2B1519' ? 'rgba(43,21,25,.78)' : 'rgba(251,241,238,.8)');
}

export function setLook(patch, key) {
  Object.assign(look, patch);
  if (key) look.touched.add(key);
  applyLookTheme();
  subs.forEach((fn) => fn(look, key));
}
export const onLook = (fn) => { subs.add(fn); return () => subs.delete(fn); };
