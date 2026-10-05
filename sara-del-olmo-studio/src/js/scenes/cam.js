/** Ayudas comunes de las escenas: trazos que se dibujan, visibilidad y la cámara compartida de las cejas. */
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

/**
 * Cámara final de las cejas (la comparte la escena de piercing para continuar sin cortes): el punto (fx, fy) de la foto
 * del rostro queda anclado al píxel (ax, ay) de la pantalla, con el zoom s.
 */
export const browCam = (vw, vh, BROWS) => {
  const portrait = vw < vh * 0.95;
  const s = portrait ? (0.96 * vw) / 520 : Math.min((0.54 * vw) / 520, (1.5 * vh) / 520);
  return { s, fx: BROWS.focus.x + 40, fy: BROWS.focus.y + 10, ax: portrait ? 0.5 * vw : 0.7 * vw, ay: portrait ? 0.27 * vh : 0.46 * vh };
};
