/** Versión simple (movimiento reducido): inserta el dibujo en su estado final, sin cámara ni scroll animado. */
import { $, $$ } from '../lib/util.js';
import { feetMarkup } from '../art/feet.js';
import { browMarkup } from '../art/brow.js';
import { earMarkup } from '../art/ear.js';
import { handMarkup } from '../art/hand.js';
import { NailSet } from '../art/nail-view.js';
import { look, lookHex, applyLookTheme, onLook } from '../lib/look.js';
import { CONFIG } from '../../data/config.js';

export function init() {
  applyLookTheme();
  const pies = $('.pies__cam'), cejas = $('.cejas__cam'), ear = $('.piercing__ear'), fin = $('.final__cam');
  const sets = [];
  if (pies) { pies.innerHTML = feetMarkup('pf', look, { skin: CONFIG.skinTone }); sets.push(new NailSet($$('.nail', pies), { ...look, shape: 'redonda' })); }
  if (cejas) cejas.innerHTML = browMarkup('bz');
  if (ear) ear.innerHTML = earMarkup('pe');
  if (fin) { fin.innerHTML = handMarkup('fh', look, { skin: CONFIG.skinTone }); sets.push(new NailSet($$('.nail', fin), look)); }
  const sync = () => sets.forEach((s) => s.paint(lookHex(), look.finish, { instant: true }));
  sync();
  onLook(sync);
}
