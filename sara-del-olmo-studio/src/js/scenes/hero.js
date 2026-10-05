/**
 * ACTO 1 · LA UÑA. El scroll es la cámara:
 *   0 % mano completa → 15 % las uñas → 30 % una uña llena la pantalla → 45 % textura y brillo
 *   → 60 % más cerca → 75 % el color es un universo abstracto → 90 % dentro del color → 100 % portal a «Manos».
 * De 0 a ~46 % la cámara recorre dos fotografías (mano general y macro) alineadas por la uña central; el paso
 * de una a otra es un cambio de enfoque. A partir de ahí el shader de esmalte líquido toma el relevo.
 */
import { registerScene } from '../lib/scene.js';
import { seg, bump, ease, clamp, lerp, spline, isLowEnd, isFine, $, $$ } from '../lib/util.js';
import { createWorld } from '../lib/handworld.js';
import { createLiquid } from '../lib/liquid.js';
import { COPY } from '../../data/copy.js';
import { HAND, handWorld } from '../../data/scene-photos.js';

export function init(el) {
  const pw = $('.hero__pw', el), canvas = $('.hero__gl', el), shade = $('.hero__shade', el), floor = $('.hero__floor', el);
  const bg = $('.hero__bg', el), copy = $('.hero__copy', el), caps = $$('.hero__cap', el), hint = $('.hero__hint', el), iris = $('.hero__iris', el);
  const low = isLowEnd();
  const N = HAND.nailWide, HW = handWorld();
  const nailW = Math.max(N.w, HAND.nailClose.w * HW.k);   // ancho de la uña en el mundo
  const cMid = { x: HW.c.x + HW.c.w / 2, y: HW.c.y + HW.c.h / 2 };   // centro de la macro de una uña
  // cambio de enfoque encadenado: ventanas de p en las que aparece cada capa (a → ab → bb → b → bb2 → cb → c). Se solapan un poco.
  const WIN = [[0.13, 0.22], [0.2, 0.27], [0.25, 0.32], [0.36, 0.42], [0.4, 0.46], [0.44, 0.5]];
  const world = createWorld(pw, ['a', 'ab', 'bb', 'b', 'bb2', 'cb', 'c'], WIN, { covers: ['ab'], anchor: { x: N.cx, y: N.cy } });

  /* ───── medidas de la cámara (se recalculan al cambiar el tamaño) ───── */
  let vw = 1, vh = 1, portrait = false, K = null, sC = 1;
  const measure = () => {
    const r = pw.getBoundingClientRect();
    vw = r.width || innerWidth; vh = r.height || innerHeight;
    portrait = vw < vh * 0.9;
    // la mano completa: de lado en pantallas anchas (el texto ocupa la izquierda), arriba en móvil
    const s0 = portrait ? (0.9 * vw) / 600 : (vh * 1.04) / HAND.wide.h;
    const a0 = portrait ? { x: 0.5 * vw, y: 0.2 * vh } : { x: 0.5 * vw + 0.17 * vw, y: 0.15 * vh };
    const sRow = portrait ? (0.84 * vw) / 343 : (0.5 * vw) / 343;
    const sFill = Math.min((0.8 * vh) / N.h, (0.62 * vw) / (nailW * 1.05));
    // la macro de una uña llena la pantalla (con margen) cuando el zoom llega aquí
    sC = Math.max(sFill * 2, vw / (0.92 * HW.c.w), vh / (0.92 * HW.c.h));
    const keys = [
      { p: 0, s: s0, fx: HAND.centerX, fy: HAND.top, ax: a0.x, ay: a0.y },
      { p: 0.15, s: sRow, fx: HAND.tips.x, fy: HAND.tips.y, ax: 0.5 * vw, ay: 0.5 * vh },
      { p: 0.3, s: sFill, fx: N.cx, fy: N.cy + 2, ax: 0.5 * vw, ay: 0.5 * vh },
      { p: 0.5, s: sC, fx: cMid.x, fy: cMid.y, ax: 0.5 * vw, ay: 0.5 * vh },
      { p: 0.66, s: sC * 1.06, fx: cMid.x, fy: cMid.y, ax: 0.5 * vw, ay: 0.5 * vh },
    ];
    const xs = keys.map((k) => k.p);
    const sp = (f) => spline(xs, keys.map(f));
    K = { s: sp((k) => Math.log(k.s)), fx: sp((k) => k.fx), fy: sp((k) => k.fy), ax: sp((k) => k.ax), ay: sp((k) => k.ay) };
  };
  measure();
  let rm; addEventListener('resize', () => { clearTimeout(rm); rm = setTimeout(() => { measure(); scene.force = true; }, 90); });

  /* ───── esmalte líquido (WebGL) con alternativa CSS ───── */
  const hex = '#8C0E22';   // el rojo cereza de la foto macro (un punto más vivo que el de marca, para que el fundido no se note)
  const liquid = createLiquid(canvas, { low, hex });
  let t0 = performance.now(), live = false, lastDraw = 0, acc = 0, nAcc = 0;
  let uP = 0;
  const ptr = [0, 0], ptrT = [0, 0];
  if (isFine()) addEventListener('pointermove', (e) => { ptrT[0] = (e.clientX / innerWidth - 0.5) * 2; ptrT[1] = (0.5 - e.clientY / innerHeight) * 2; }, { passive: true });

  const frameMs = low ? 1000 / 30 : 1000 / 60;
  const loop = (now) => {
    if (!live) return;
    if (now - lastDraw >= frameMs - 1) {
      const dt = now - lastDraw;
      lastDraw = now;
      ptr[0] += (ptrT[0] - ptr[0]) * 0.06; ptr[1] += (ptrT[1] - ptr[1]) * 0.06;
      liquid.draw(uP, (now - t0) / 1000, ptr);
      if (dt < 200) { acc += dt; nAcc++; }
      if (nAcc === 45) { if (acc / nAcc > (low ? 44 : 26)) liquid.degrade(); acc = nAcc = 0; }
    }
    requestAnimationFrame(loop);
  };
  const setLive = (on) => { if (on && !live && liquid && liquid.ok) { live = true; lastDraw = 0; requestAnimationFrame(loop); } else if (!on) live = false; };

  /* ───── fotograma por scroll ───── */
  let sceneActive = false;
  const render = (p) => {
    document.body.classList.toggle('is-hero-top', p < 0.04 && sceneActive !== false);
    // 1) cámara sobre las fotos
    const gl = liquid && liquid.ok;
    const camVisible = gl ? p < 0.66 : p < 0.82;
    pw.style.visibility = camVisible ? 'visible' : 'hidden';
    pw.style.opacity = gl ? '' : (1 - seg(p, 0.64, 0.8)).toFixed(3);
    // la cabecera pasa a tinta oscura cuando el portal inunda la pantalla de luz
    el.dataset.theme = p > 0.94 ? 'light' : 'dark';
    if (camVisible) {
      world.cam({ s: Math.exp(K.s(p)), fx: K.fx(p), fy: K.fy(p), ax: K.ax(p), ay: K.ay(p), rot: lerp(3, -0.8, seg(p, 0, 0.46, ease.io)) });
      world.mix(p, p >= 0.5);   // mano → uñas → una uña (cambio de enfoque encadenado)
    }
    // 2) texto de portada: sale en los primeros pasos del scroll
    const out = seg(p, 0.015, 0.1);
    copy.style.opacity = (1 - out).toFixed(3);
    copy.style.transform = `translate3d(0, ${(-out * 70).toFixed(1)}px, 0)`;
    copy.style.visibility = out >= 1 ? 'hidden' : 'visible';
    shade.style.opacity = (1 - out).toFixed(3);
    hint.style.opacity = (1 - seg(p, 0, 0.03)).toFixed(3);
    // 3) frases que acompañan el viaje
    COPY.hero.captions.forEach((c, i) => {
      const o = bump(p, c.at - 0.09, c.at - 0.045, c.at + 0.045, c.at + 0.09);
      caps[i].style.opacity = o.toFixed(3);
      caps[i].style.transform = `translate3d(0, ${((1 - o) * 26).toFixed(1)}px, 0)`;
    });
    // 4) esmalte: el shader aparece sobre la macro (fundido) y toma el relevo
    const reveal = seg(p, 0.5, 0.63, ease.io);
    canvas.style.opacity = liquid && liquid.ok ? reveal.toFixed(3) : '0';
    floor.style.opacity = (1 - seg(p, 0.5, 0.7)).toFixed(3);
    uP = clamp((p - 0.38) / 0.62);
    if (liquid && liquid.ok) {
      setLive(sceneActive && p > 0.48 && p < 0.997);
      if (p >= 0.997 || (!live && p > 0.48)) liquid.draw(uP, (performance.now() - t0) / 1000, ptr);
      iris.style.clipPath = 'circle(0% at 50% 50%)';
    } else {
      // sin WebGL: el portal es un círculo de luz que se abre
      const r = seg(p, 0.86, 1, ease.io) * 150;
      iris.style.clipPath = `circle(${r.toFixed(1)}% at 50% 50%)`;
      const u = seg(p, 0.55, 0.9);
      bg.style.background = `radial-gradient(circle at 50% 50%, rgba(231,120,143,${(0.5 * u).toFixed(3)}) 0, rgba(122,16,39,${(0.85 * u).toFixed(3)}) 42%, #12080A 100%)`;
    }
  };

  const scene = registerScene(el, render, {
    damp: 5.5,
    onToggle: (on) => { sceneActive = on; if (!on) { setLive(false); document.body.classList.remove('is-hero-top'); } else scene.force = true; },
  });
  sceneActive = true;

  /* ───── intro: de la oscuridad aparece la mano ───── */
  const start = () => {
    el.classList.add('is-ready');
    const ease1 = 'cubic-bezier(.25,.6,.2,1)';
    pw.animate([{ opacity: 0, transform: 'scale(1.06)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 2600, easing: ease1, fill: 'backwards' });
    [...copy.querySelectorAll('.lockup, .hero__place, .hero__cta')].forEach((n, i) =>
      n.animate([{ opacity: 0, transform: 'translateY(22px)' }, { opacity: 1, transform: 'none' }], { duration: 1300, delay: 1000 + i * 190, easing: 'cubic-bezier(.2,.75,.12,1)', fill: 'backwards' }));
    $('.hero__rule', el).animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 1200, delay: 1500, easing: 'cubic-bezier(.2,.75,.12,1)', fill: 'backwards' });
    hint.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1200, delay: 2600, fill: 'backwards' });
  };
  // se espera a la foto de la mano (si tarda más de 1,6 s, se arranca igualmente)
  const hand = $('.pw__a img', pw);
  const photo = hand && !hand.complete ? Promise.race([hand.decode().catch(() => {}), new Promise((r) => setTimeout(r, 1600))]) : Promise.resolve();
  const ready = Promise.all([photo, document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))]) : Promise.resolve()]);
  ready.then(() => requestAnimationFrame(start));

  return { scene, liquid };
}
