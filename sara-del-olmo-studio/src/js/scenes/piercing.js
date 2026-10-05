/**
 * ACTO 6 · PIERCING. La ceja de la escena anterior se apaga hasta un destello metálico; el destello se convierte en
 * una joya de titanio en primer plano; la cámara se aleja y la joya resulta estar en una oreja, entre otras:
 * una composición. Precisión · Estilo · Seguridad.
 * Todo son fotografías: la ceja (misma foto y misma cámara que «Cejas»), y la joya y la oreja alineadas por el piercing
 * de la concha: la joya se desenfoca, la pantalla pasa por la penumbra y la oreja aparece con la cámara ya lejos.
 */
import { registerScene } from '../lib/scene.js';
import { $, $$, seg, ease, lerp, clamp, spline } from '../lib/util.js';
import { BROWS, EAR, earWorld } from '../../data/scene-photos.js';
import { createWorld } from '../lib/handworld.js';
import { browCam } from './cam.js';

export function init(el) {
  const stage = $('.scene__stage', el);
  const brow = $('.piercing__brow', el), bworld = $('.bw__world', brow);
  const pw = $('.piercing__pw', el), pworld = $('.pw__world', pw), shade = $('.piercing__shade', el);
  const veil = $('.piercing__veil', el);
  const sparks = $$('.spark', pw);
  const EW = earWorld();
  // joya nítida → joya borrosa → (penumbra) → oreja nítida: ventanas de p de cada capa
  const world = createWorld(pw, ['j', 'jb', 'e'], [[0.43, 0.52], [0.55, 0.64]], { covers: ['jb', 'e'], anchor: { x: EW.cx, y: EW.cy } });

  const glint = document.createElement('div');
  glint.className = 'glint';
  glint.setAttribute('aria-hidden', 'true');
  glint.innerHTML = '<i class="g-h"></i><i class="g-v"></i><i class="g-core"></i>';
  stage.appendChild(glint);

  const copy = $('.piercing__copy', el);
  const kicker = $('.kicker', copy), title = $('.mega', copy), lead = $('.lead', copy);
  const values = $$('.values li', copy), facts = $$('.facts li', copy), price = $('.piercing__price', copy), btns = $('.btn-row', copy);

  let K, vw = 1, vh = 1, bc = null, sJ = 1, jc = [0, 0];
  const measure = () => {
    const r = stage.getBoundingClientRect();
    vw = r.width || innerWidth; vh = r.height || innerHeight;
    const portrait = vw < vh * 0.95;
    bc = browCam(vw, vh, BROWS);
    // joya: la piedra llena la pantalla (y la foto de la joya la cubre entera)
    sJ = Math.max((portrait ? 0.7 * vw : 0.8 * vh) / EAR.studD, vh / (0.88 * EW.h), vw / (0.88 * EW.w));
    jc = [0.5 * vw, 0.5 * vh];
    // oreja: a un lado (arriba en móvil), el texto en el otro
    const sE = portrait ? Math.min((0.9 * vw) / 540, (0.58 * vh) / 820) : (0.84 * vh) / 820;
    const aE = portrait ? { x: 0.5 * vw, y: 0.3 * vh } : { x: 0.72 * vw, y: 0.5 * vh };
    const keys = [
      { p: 0, s: sJ, fx: EW.cx, fy: EW.cy, ax: jc[0], ay: jc[1] },
      { p: 0.48, s: sJ * 1.06, fx: EW.cx, fy: EW.cy, ax: jc[0], ay: jc[1] },
      { p: 0.78, s: sE, fx: EAR.focus.x, fy: EAR.focus.y, ax: aE.x, ay: aE.y },
      { p: 1, s: sE * 1.02, fx: EAR.focus.x, fy: EAR.focus.y, ax: aE.x, ay: aE.y },
    ];
    const xs = keys.map((k) => k.p), sp = (f) => spline(xs, keys.map(f));
    K = { s: sp((k) => Math.log(k.s)), fx: sp((k) => k.fx), fy: sp((k) => k.fy), ax: sp((k) => k.ax), ay: sp((k) => k.ay) };
  };
  measure();
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { measure(); scene.force = true; }, 90); });

  const show = (n, p, s, e, dy = 24) => { const u = seg(p, s, e, ease.out); n.style.opacity = u.toFixed(3); n.style.transform = `translate3d(0, ${((1 - u) * dy).toFixed(1)}px, 0)`; return u; };

  const render = (p) => {
    // 1) la ceja de la escena anterior (misma foto y cámara) se apaga
    bworld.style.transform = `translate(${bc.ax.toFixed(2)}px, ${bc.ay.toFixed(2)}px) scale(${bc.s.toFixed(4)}) translate(${(-bc.fx).toFixed(2)}px, ${(-bc.fy).toFixed(2)}px)`;
    brow.style.opacity = (1 - seg(p, 0.12, 0.34)).toFixed(3);
    brow.style.visibility = p > 0.36 ? 'hidden' : 'visible';

    // 2) destello metálico: nace en la cola de la ceja y viaja hasta el centro de la pantalla, donde aparece la joya
    const born = seg(p, 0.08, 0.18, ease.out), travel = seg(p, 0.16, 0.34, ease.io), gone = seg(p, 0.3, 0.4);
    const tx = bc.ax + (BROWS.right.tail[0] - bc.fx) * bc.s, ty = bc.ay + (BROWS.right.tail[1] - bc.fy) * bc.s;
    const gx = lerp(tx, jc[0], travel), gy = lerp(ty, jc[1], travel);
    const size = lerp(2, 16, born) + lerp(0, 96, travel);
    // al llegar queda un brillo sobre la faceta de la piedra que titila con el scroll
    const R = (sJ * EAR.studD) / 2;
    const twinkle = seg(p, 0.36, 0.44) * (1 - seg(p, 0.5, 0.58)) * (0.65 + 0.35 * Math.sin(p * 90));
    const gx2 = lerp(gx, jc[0] + 0.3 * R, gone), gy2 = lerp(gy, jc[1] - 0.34 * R, gone);
    glint.style.opacity = (born * (1 - gone) + twinkle).toFixed(3);
    glint.style.setProperty('--s', (lerp(size, 22, gone)).toFixed(1) + 'px');
    glint.style.transform = `translate3d(${gx2.toFixed(1)}px, ${gy2.toFixed(1)}px, 0) rotate(${(p * 220).toFixed(1)}deg)`;

    // 3) joya en primer plano → la cámara se aleja y aparece la oreja (cambio de enfoque encadenado)
    pw.style.opacity = seg(p, 0.26, 0.4, ease.out).toFixed(3);
    pw.style.visibility = p > 0.2 ? 'visible' : 'hidden';
    const s = Math.exp(K.s(p));
    world.cam({ s, fx: K.fx(p), fy: K.fy(p), ax: K.ax(p), ay: K.ay(p), rot: lerp(-1.5, 2.5, seg(p, 0.3, 0.78, ease.io)) });
    world.mix(p, p > 0.66);
    veil.style.opacity = (0.94 * seg(p, 0.46, 0.57, ease.io) * (1 - seg(p, 0.59, 0.72, ease.io))).toFixed(3);
    // 4) destellos sobre cada piercing (tamaño constante en pantalla)
    pworld.style.setProperty('--sp', `${(70 / s).toFixed(3)}px`);
    pworld.style.setProperty('--lw', `${(1.5 / s).toFixed(3)}px`);
    sparks.forEach((sp, i) => {
      const t0 = 0.74 + i * 0.028, k = seg(p, t0, t0 + 0.06, ease.out);
      sp.style.setProperty('--k', (0.4 + 0.6 * k).toFixed(3));
      sp.style.setProperty('--o', (k * (0.35 + 0.65 * Math.sin(Math.PI * clamp((p - t0) / 0.1)))).toFixed(3));
    });
    shade.style.setProperty('--shade', seg(p, 0.7, 0.86).toFixed(3));

    // 5) texto
    show(kicker, p, 0.7, 0.77, 14); show(title, p, 0.72, 0.82, 44); show(lead, p, 0.78, 0.86);
    values.forEach((v, i) => show(v, p, 0.8 + i * 0.02, 0.88 + i * 0.02, 16));
    facts.forEach((v, i) => show(v, p, 0.84 + i * 0.015, 0.91 + i * 0.015, 12));
    show(price, p, 0.88, 0.94, 12);
    const bu = show(btns, p, 0.9, 0.96, 12);
    btns.style.visibility = bu > 0.02 ? 'visible' : 'hidden';
  };
  const scene = registerScene(el, render, { damp: 5.5 });
  el.classList.add('is-ready');
  return { scene };
}
