/**
 * Control en el navegador de las uñas generadas por nailMarkup: cambia forma, color y acabado
 * con animación (el esmalte «sube» desde la cutícula, aparece el brillo, se mueve la luz).
 */
import { SHAPES, colorById } from '../../data/look.js';
import { nailPath, fillFor, chromeStops, GLOSS, NUDE, BARE } from './nail-markup.js';
import { mix } from '../lib/color.js';
import { ease, lerp, REDUCED } from '../lib/util.js';

const q = (g, c) => g.querySelector('.' + c);

export class NailView {
  constructor(g) {
    this.g = g;
    this.uid = g.dataset.uid;
    this.el = {};
    ['n-clip', 'n-edge', 'n-rev', 'n-fill-a', 'n-fill-b', 'n-tip-a', 'n-tip-b', 'n-core', 'n-grain', 'n-soft', 'n-spot', 'n-rim', 'n-wet', 'n-sweep'].forEach((c) => (this.el[c] = q(g, c)));
    const stops = (k) => Array.from(g.querySelectorAll(`[id="lg${k}-${this.uid}"] stop`));
    const rstops = (k) => Array.from(g.querySelectorAll(`[id="rg${k}-${this.uid}"] stop`));
    this.lg = { A: stops('A'), B: stops('B') };
    this.rg = { A: rstops('A'), B: rstops('B') };
    this.gloss = { ...GLOSS.brillo };
    this.raf = 0;
    this.light = [0, 0];
  }

  setShapeD(d) {
    this.el['n-clip'].setAttribute('d', d);
    this.el['n-edge'].setAttribute('d', d);
  }

  /** Pinta una capa (A = actual, B = la que sube) con color y acabado. */
  layer(k, color, finish) {
    const fill = this.el['n-fill-' + k.toLowerCase()], tip = this.el['n-tip-' + k.toLowerCase()];
    if (finish === 'cromado') chromeStops(color).forEach((c, i) => this.lg[k][i].setAttribute('stop-color', c));
    if (finish === 'aura') [color, mix(color, NUDE, 0.55), NUDE].forEach((c, i) => this.rg[k][i].setAttribute('stop-color', c));
    fill.setAttribute('fill', fillFor(this.uid, k, color, finish));
    tip.style.display = finish === 'francesa' ? 'inline' : 'none';
    tip.setAttribute('fill', color);
  }

  setGloss(g) {
    this.gloss = g;
    const e = this.el;
    e['n-soft'].setAttribute('opacity', g.soft);
    e['n-spot'].setAttribute('opacity', g.spot);
    e['n-rim'].setAttribute('opacity', g.rim);
    e['n-core'].setAttribute('opacity', g.core);
    e['n-grain'].setAttribute('opacity', g.grain);
  }

  /**
   * Pinta con animación: el color nuevo sube desde la cutícula con un borde húmedo brillante,
   * mientras el brillo del acabado nuevo se funde con el anterior.
   */
  paint(color, finish, { dur = 640, delay = 0, instant = false } = {}) {
    cancelAnimationFrame(this.raf);
    clearTimeout(this.to);
    const e = this.el, g0 = { ...this.gloss }, g1 = GLOSS[finish];
    const done = () => {
      this.layer('A', color, finish);
      e['n-rev'].setAttribute('height', 0);
      e['n-wet'].setAttribute('opacity', 0);
      this.setGloss(g1);
    };
    if (instant || REDUCED() || !dur) { done(); return; }
    this.to = setTimeout(() => {
      this.layer('B', color, finish);
      e['n-rev'].setAttribute('y', 172);
      e['n-rev'].setAttribute('height', 0);
      const t0 = performance.now();
      const step = (now) => {
        const t = Math.min(1, Math.max(0, (now - t0) / dur)), h = 186 * ease.out(t);
        e['n-rev'].setAttribute('y', 172 - h);
        e['n-rev'].setAttribute('height', h);
        // borde húmedo: una línea brillante en el frente de pintura
        e['n-wet'].setAttribute('d', `M-10 ${172 - h} Q50 ${172 - h - 6} 110 ${172 - h}`);
        e['n-wet'].setAttribute('opacity', (0.75 * Math.sin(Math.PI * t)).toFixed(3));
        const k = ease.io(t);
        this.setGloss({ soft: lerp(g0.soft, g1.soft, k), spot: lerp(g0.spot, g1.spot, k), rim: lerp(g0.rim, g1.rim, k), core: lerp(g0.core, g1.core, k), grain: lerp(g0.grain, g1.grain, k) });
        if (t < 1) this.raf = requestAnimationFrame(step); else done();
      };
      this.raf = requestAnimationFrame(step);
    }, delay);
  }

  /** Mueve los reflejos para simular otra posición de la luz (dx, dy en -1..1). */
  setLight(dx, dy) {
    this.light = [dx, dy];
    const e = this.el;
    e['n-soft'].setAttribute('transform', `translate(${(dx * 9).toFixed(2)} ${(dy * 6).toFixed(2)})`);
    e['n-spot'].setAttribute('transform', `translate(${(dx * 10).toFixed(2)} ${(dy * 8).toFixed(2)}) rotate(14 72 50)`);
  }

  /** Un destello de luz que cruza la uña (se usa al terminar el look y en el final). */
  sweep(ms = 1500, delay = 0) {
    const sw = this.el['n-sweep'];
    if (!sw || !sw.animate || REDUCED()) return;
    sw.animate([{ transform: 'translateX(0px)', opacity: 0 }, { opacity: 1, offset: 0.35 }, { transform: 'translateX(250px)', opacity: 0 }], { duration: ms, delay, easing: 'cubic-bezier(.4,0,.2,1)' });
  }
}

/** Conjunto de uñas que comparten forma, color y acabado. */
export class NailSet {
  constructor(groups, { shape = 'almendra', color = 'cereza', finish = 'brillo' } = {}) {
    this.views = groups.map((g) => new NailView(g));
    this.shapeName = shape;
    this.shape = { ...SHAPES[shape], c1: [...SHAPES[shape].c1], c2: [...SHAPES[shape].c2] };
    this.color = colorById(color).hex;
    this.finish = finish;
    this.views.forEach((v) => v.setGloss({ ...GLOSS[finish] }));
  }

  paint(color, finish = this.finish, opts = {}) {
    this.color = color; this.finish = finish;
    const stag = opts.stagger ?? 90;
    this.views.forEach((v, i) => {
      const order = opts.center ? Math.abs(i - (this.views.length - 1) / 2) : i;
      v.paint(color, finish, { ...opts, delay: (opts.delay || 0) + order * stag });
    });
  }

  setShape(name, { animate = true, dur = 520 } = {}) {
    const target = SHAPES[name];
    if (!target) return;
    this.shapeName = name;
    cancelAnimationFrame(this.shapeRaf);
    const from = { y0: this.shape.y0, c1: [...this.shape.c1], c2: [...this.shape.c2], yS: this.shape.yS };
    const apply = (e) => {
      this.shape = {
        y0: lerp(from.y0, target.y0, e),
        c1: [lerp(from.c1[0], target.c1[0], e), lerp(from.c1[1], target.c1[1], e)],
        c2: [lerp(from.c2[0], target.c2[0], e), lerp(from.c2[1], target.c2[1], e)],
        yS: lerp(from.yS, target.yS, e),
      };
      const d = nailPath(this.shape);
      this.views.forEach((v) => v.setShapeD(d));
    };
    if (!animate || REDUCED()) { apply(1); return; }
    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      apply(ease.io(t));
      if (t < 1) this.shapeRaf = requestAnimationFrame(step);
    };
    this.shapeRaf = requestAnimationFrame(step);
  }

  /** Uñas al natural (sin esmalte): el punto de partida antes de pintar. */
  bare() {
    this.views.forEach((v) => {
      v.layer('A', BARE, 'brillo');
      v.setGloss({ soft: 0.22, spot: 0.35, rim: 0.2, core: 0.08, grain: 0 });
    });
  }

  setLight(dx, dy) { this.views.forEach((v) => v.setLight(dx, dy)); }
  sweep(ms, delay = 0, stagger = 140) { this.views.forEach((v, i) => v.sweep(ms, delay + i * stagger)); }
}

/** Crea un NailSet a partir de todas las uñas (.nail) dentro de un contenedor. */
export const nailSetIn = (root, look) => new NailSet(Array.from(root.querySelectorAll('.nail')), look);

export { BARE };
