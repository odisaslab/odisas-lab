/**
 * ACTO 1 · LA UÑA. El scroll es la cámara:
 *   0 % mano completa → 15 % las uñas → 30 % una uña llena la pantalla → 45 % textura y brillo
 *   → 60 % más cerca → 75 % el color es un universo abstracto → 90 % dentro del color → 100 % portal a «Manos».
 * De 0 a ~46 % la cámara recorre el dibujo vectorial (nítido a cualquier zoom); a partir de ahí
 * el shader de esmalte líquido toma el relevo.
 */
import { registerScene } from '../lib/scene.js';
import { seg, bump, ease, clamp, lerp, spline, isLowEnd, isFine, $, $$, mq } from '../lib/util.js';
import { slotById } from '../art/hand.js';
import { createLiquid } from '../lib/liquid.js';
import { COPY } from '../../data/copy.js';
import { colorById, DEFAULT_LOOK } from '../../data/look.js';

export function init(el) {
  const svg = $('.hero__svg', el), cam = $('.hero__cam', el), canvas = $('.hero__gl', el);
  const bg = $('.hero__bg', el), copy = $('.hero__copy', el), caps = $$('.hero__cap', el), hint = $('.hero__hint', el), iris = $('.hero__iris', el);
  const mid = slotById('middle');
  const low = isLowEnd();

  /* ───── medidas de la cámara (se recalculan al cambiar el tamaño) ───── */
  let vw = 1, vh = 1, unit = 1, K = null;
  const measure = () => {
    const r = svg.getBoundingClientRect();
    vw = r.width || innerWidth; vh = r.height || innerHeight;
    unit = Math.min(vw / 1000, vh / 1300);
    const nailW = 88 * mid.k, nailH = 164 * mid.k;
    const sFill = (0.86 * vh) / (nailH * unit);
    const sCover = Math.max(vw / (nailW * unit), vh / (nailH * unit)) * 1.18;
    const sRow = clamp((0.84 * vw) / (470 * unit), 1.5, 3.6);
    const s0 = vw < vh * 0.9 ? 0.96 : 1.06;
    const keys = [
      { p: 0, s: s0, x: 500, y: 770 },
      { p: 0.15, s: sRow, x: 560, y: 420 },
      { p: 0.3, s: sFill, x: mid.cx, y: mid.cy },
      { p: 0.46, s: sCover, x: mid.cx, y: mid.cy + 4 },
      { p: 0.64, s: sCover * 2.4, x: mid.cx, y: mid.cy + 6 },
    ];
    const xs = keys.map((k) => k.p);
    K = {
      s: spline(xs, keys.map((k) => Math.log(k.s))),
      x: spline(xs, keys.map((k) => k.x)),
      y: spline(xs, keys.map((k) => k.y)),
    };
  };
  measure();
  let rm; addEventListener('resize', () => { clearTimeout(rm); rm = setTimeout(() => { measure(); scene.force = true; }, 90); });

  /* ───── esmalte líquido (WebGL) con alternativa CSS ───── */
  const hex = colorById(DEFAULT_LOOK.color).hex;
  const liquid = createLiquid(canvas, { low, hex });
  let t0 = performance.now(), live = false, lastDraw = 0, acc = 0, nAcc = 0;
  let uP = 0, glOpacity = 0;
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
    // 1) cámara sobre el dibujo
    const gl = liquid && liquid.ok;
    const camVisible = gl ? p < 0.5 : p < 0.82;
    svg.style.visibility = camVisible ? 'visible' : 'hidden';
    svg.style.opacity = gl ? '' : (1 - seg(p, 0.64, 0.8)).toFixed(3);
    // la cabecera pasa a tinta oscura cuando el portal inunda la pantalla de luz
    el.dataset.theme = p > 0.94 ? 'light' : 'dark';
    if (camVisible) {
      const s = Math.exp(K.s(p));
      const shift = 1 - seg(p, 0, 0.14);
      const portrait = vw < vh * 0.9;
      const ox = portrait ? 0 : (0.15 * vw * shift) / unit / s;
      const oy = portrait ? (-0.15 * vh * shift) / unit / s : 0;
      const rot = lerp(4, -1.5, seg(p, 0, 0.46, ease.io));
      cam.setAttribute('transform', `translate(${500 + ox * s} ${650 + oy * s}) rotate(${rot.toFixed(2)}) scale(${s.toFixed(4)}) translate(${-K.x(p).toFixed(2)} ${-K.y(p).toFixed(2)})`);
    }
    // 2) texto de portada: sale en los primeros pasos del scroll
    const out = seg(p, 0.015, 0.1);
    copy.style.opacity = (1 - out).toFixed(3);
    copy.style.transform = `translate3d(0, ${(-out * 70).toFixed(1)}px, 0)`;
    copy.style.visibility = out >= 1 ? 'hidden' : 'visible';
    hint.style.opacity = (1 - seg(p, 0, 0.03)).toFixed(3);
    // 3) frases que acompañan el viaje
    COPY.hero.captions.forEach((c, i) => {
      const o = bump(p, c.at - 0.09, c.at - 0.045, c.at + 0.045, c.at + 0.09);
      caps[i].style.opacity = o.toFixed(3);
      caps[i].style.transform = `translate3d(0, ${((1 - o) * 26).toFixed(1)}px, 0)`;
    });
    // 4) esmalte: el shader toma el relevo cuando una uña llena la pantalla
    glOpacity = seg(p, 0.34, 0.47);
    canvas.style.opacity = glOpacity.toFixed(3);
    uP = clamp((p - 0.38) / 0.62);
    if (liquid && liquid.ok) {
      setLive(sceneActive && p > 0.33 && p < 0.997);
      if (p >= 0.997 || (!live && p > 0.33)) liquid.draw(uP, (performance.now() - t0) / 1000, ptr);
      iris.style.clipPath = 'circle(0% at 50% 50%)';
    } else {
      // sin WebGL: el portal es un círculo de luz que se abre
      const r = seg(p, 0.86, 1, ease.io) * 150;
      iris.style.clipPath = `circle(${r.toFixed(1)}% at 50% 50%)`;
      canvas.style.opacity = '0';
      const u = seg(p, 0.55, 0.9);
      bg.style.background = `radial-gradient(circle at 50% 50%, rgba(231,120,143,${(0.5 * u).toFixed(3)}) 0, rgba(122,16,39,${(0.85 * u).toFixed(3)}) 42%, #12080A 100%)`;
    }
  };

  const scene = registerScene(el, render, {
    damp: 7,
    onToggle: (on) => { sceneActive = on; if (!on) { setLive(false); document.body.classList.remove('is-hero-top'); } else scene.force = true; },
  });
  sceneActive = true;

  /* ───── intro: de la oscuridad aparece la mano ───── */
  const nails = $$('.hand-nail', svg);
  const glint = (n, delay = 0) => {
    const sw = n.querySelector('.n-sweep');
    if (!sw || !sw.animate) return;
    sw.animate([{ transform: 'translateX(0px)', opacity: 0 }, { opacity: 1, offset: 0.35 }, { transform: 'translateX(250px)', opacity: 0 }], { duration: 1500, delay, easing: 'cubic-bezier(.4,0,.2,1)' });
  };
  const start = () => {
    el.classList.add('is-ready');
    const ease1 = 'cubic-bezier(.25,.6,.2,1)';
    svg.animate([{ opacity: 0, transform: 'scale(1.05)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 2800, easing: ease1, fill: 'both' });
    [...copy.querySelectorAll('.lockup, .hero__place, .hero__cta')].forEach((n, i) =>
      n.animate([{ opacity: 0, transform: 'translateY(22px)' }, { opacity: 1, transform: 'none' }], { duration: 1300, delay: 1000 + i * 190, easing: 'cubic-bezier(.2,.75,.12,1)', fill: 'backwards' }));
    $('.hero__rule', el).animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 1200, delay: 1500, easing: 'cubic-bezier(.2,.75,.12,1)', fill: 'backwards' });
    hint.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1200, delay: 2600, fill: 'backwards' });
    ['index', 'middle', 'ring', 'pinky', 'thumb'].forEach((f, i) => glint(nails.find((n) => n.dataset.finger === f) || nails[i], 1700 + i * 260));
  };
  const ready = document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))]) : Promise.resolve();
  ready.then(() => requestAnimationFrame(start));

  // destello ocasional mientras se está en la portada
  setInterval(() => {
    if (!sceneActive || scene.p > 0.06 || document.hidden) return;
    glint(nails[Math.floor(Math.random() * nails.length)]);
  }, 5200);

  return { scene, liquid };
}
