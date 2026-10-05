/** Ayudas comunes de las escenas: cámara SVG, trazos que se dibujan y visibilidad. */
export const camT = (cx, cy, s, fx, fy) => `translate(${cx} ${cy}) scale(${s.toFixed(4)}) translate(${(-fx).toFixed(2)} ${(-fy).toFixed(2)})`;

/** Trazo con pathLength=1: t = 0 invisible, 1 dibujado. */
export const setDash = (el, t) => {
  el.style.strokeDasharray = '1 1';
  el.style.strokeDashoffset = (1 - Math.min(1, Math.max(0, t))).toFixed(4);
  el.style.opacity = t <= 0.0005 ? 0 : 1;
};

/** Opacidad + visibility (un elemento invisible no recibe foco ni lo lee el lector con «hidden»). */
export const vis = (el, o) => {
  el.style.opacity = o.toFixed(3);
  el.style.visibility = o <= 0.001 ? 'hidden' : 'visible';
};

export const tr = (el, x = 0, y = 0, s = 1) => { el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${s.toFixed(3)})`; };

/** Cámara final de las cejas (la comparte la escena de piercing para continuar sin cortes). */
export const browEnd = (portrait) => ({ s: portrait ? 2.0 : 1.75, x: portrait ? 860 : 800, y: 380 });
