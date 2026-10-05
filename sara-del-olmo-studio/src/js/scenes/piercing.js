/**
 * ACTO 6 · PIERCING. La línea de la ceja se recoge hasta un destello metálico; el destello se convierte
 * en una joya de titanio que gira con el scroll; la joya vuela hasta una oreja y se une a una composición.
 * Precisión · Estilo · Seguridad.
 */
import { registerScene } from '../lib/scene.js';
import { $, $$, seg, ease, lerp, clamp, isSmall } from '../lib/util.js';
import { browMarkup, browD, BROW_TAIL_R } from '../art/brow.js';
import { earMarkup, EAR_STUDS } from '../art/ear.js';
import { createJewel } from '../art/jewel.js';
import { camT, browEnd } from './cam.js';

export function init(el) {
  const stage = $('.scene__stage', el);
  const browCam = $('.piercing__browcam', el), earSvg = $('.piercing__ear', el), canvas = $('.piercing__jewel', el);

  // La ceja derecha, exactamente como terminó en la escena anterior
  browCam.innerHTML = browMarkup('pz') + `<circle class="tailpt" cx="${BROW_TAIL_R.x}" cy="${BROW_TAIL_R.y}" r="1" fill="none"/>`;
  ['.bz-face', '.bz-guides', '.bz-points', '.bz-line-l'].forEach((s) => ($(s, browCam).style.display = 'none'));
  $$('.bz-shade', browCam)[0].style.display = 'none';
  const shade = $$('.bz-shade', browCam)[1], line = $('.bz-line-r', browCam), tail = $('.tailpt', browCam);
  line.setAttribute('d', browD(1, true));
  shade.style.opacity = 1;
  const blur = $('feGaussianBlur', browCam); blur && blur.setAttribute('stdDeviation', '2.2');

  // fracción del contorno donde está la punta de la ceja (hacia ahí se recoge la línea)
  const L = line.getTotalLength();
  let tailF = 0.5, best = 1e9;
  for (let i = 0; i <= 240; i++) {
    const pt = line.getPointAtLength((i / 240) * L);
    const d = Math.hypot(pt.x - BROW_TAIL_R.x, pt.y - BROW_TAIL_R.y);
    if (d < best) { best = d; tailF = i / 240; }
  }

  earSvg.innerHTML = earMarkup('pe');
  const earPaths = $$('.ear-p', earSvg);
  const studs = $$('.ear-stud', earSvg);
  EAR_STUDS.forEach((s, i) => (studs[i].dataset.i = i));
  const conch = $('[data-stud="conch"]', earSvg);

  const jewel = createJewel(canvas);
  const glint = document.createElement('div');
  glint.className = 'glint';
  glint.setAttribute('aria-hidden', 'true');
  glint.innerHTML = '<i class="g-h"></i><i class="g-v"></i><i class="g-core"></i>';
  stage.appendChild(glint);

  const copy = $('.piercing__copy', el);
  const kicker = $('.kicker', copy), title = $('.mega', copy), lead = $('.lead', copy);
  const values = $$('.values li', copy), facts = $$('.facts li', copy), price = $('.piercing__price', copy), btns = $('.btn-row', copy);

  const center = (node, ref) => { const r = node.getBoundingClientRect(), s = ref.getBoundingClientRect(); return [r.left + r.width / 2 - s.left, r.top + r.height / 2 - s.top]; };
  let stageR = null, jewelBase = null;
  const measure = () => { stageR = stage.getBoundingClientRect(); canvas.style.transform = 'translate(-50%, -50%)'; const r = canvas.getBoundingClientRect(); jewelBase = [r.left + r.width / 2 - stageR.left, r.top + r.height / 2 - stageR.top, r.width]; };
  measure();
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { measure(); scene.force = true; }, 90); });

  const show = (n, p, s, e, dy = 24) => { const u = seg(p, s, e, ease.out); n.style.opacity = u.toFixed(3); n.style.transform = `translate3d(0, ${((1 - u) * dy).toFixed(1)}px, 0)`; return u; };

  const render = (p) => {
    const portrait = isSmall();
    const end = browEnd(portrait);
    browCam.setAttribute('transform', camT(600, 400, end.s, end.x, end.y));

    // 1) la ceja se recoge hacia su punta
    const u = seg(p, 0.04, 0.2, ease.io);
    const a0 = lerp(0, tailF, u), b0 = lerp(1, tailF, u);
    line.style.strokeDasharray = `${Math.max(0.0001, b0 - a0).toFixed(4)} 2`;
    line.style.strokeDashoffset = (-a0).toFixed(4);
    line.style.opacity = u >= 0.999 ? 0 : 1;
    shade.style.opacity = (1 - seg(p, 0.04, 0.14)).toFixed(3);
    browCam.parentNode.style.opacity = 1 - seg(p, 0.36, 0.42);

    // 2) destello metálico: nace en la punta y viaja hasta el centro de la joya
    const born = seg(p, 0.1, 0.2, ease.out), travel = seg(p, 0.18, 0.34, ease.io), gone = seg(p, 0.3, 0.38);
    const [tx, ty] = center(tail, stage);
    const jx = jewelBase[0], jy = jewelBase[1];
    const gx = lerp(tx, jx, travel), gy = lerp(ty, jy, travel);
    const size = lerp(2, 16, born) + lerp(0, 96, travel);
    glint.style.opacity = (born * (1 - gone)).toFixed(3);
    glint.style.setProperty('--s', size.toFixed(1) + 'px');
    glint.style.transform = `translate3d(${gx.toFixed(1)}px, ${gy.toFixed(1)}px, 0) rotate(${(p * 220).toFixed(1)}deg)`;

    // 3) la joya gira con el scroll; luego vuela a la oreja y se une a la composición
    const appear = seg(p, 0.27, 0.4, ease.out);
    const fly = seg(p, 0.56, 0.76, ease.io);
    const [ex, ey] = center($('.es-body', conch), stage);
    const dx = lerp(0, ex - jx, fly), dy = lerp(0, ey - jy, fly);
    const sc = lerp(lerp(0.3, 1, appear), 0.17, fly);
    canvas.style.opacity = (appear * (1 - seg(p, 0.74, 0.8))).toFixed(3);
    canvas.style.transform = `translate(-50%, -50%) translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) scale(${sc.toFixed(3)})`;
    if (appear > 0.001 && p < 0.82) jewel.draw({ rotY: 0.35 + seg(p, 0.27, 0.78, ease.linear) * Math.PI * 3.4, rotX: 0.4 + Math.sin(p * 9) * 0.12, glow: appear, t: p * 12, hue: p * 6 });

    // 4) la oreja se dibuja y las joyas aparecen una a una
    const ear = seg(p, 0.5, 0.74, ease.out);
    earPaths.forEach((pa, i) => { pa.setAttribute('pathLength', '1'); pa.style.strokeDasharray = '1 1'; pa.style.strokeDashoffset = (1 - clamp(ear * 1.4 - i * 0.12)).toFixed(4); });
    earSvg.style.opacity = seg(p, 0.48, 0.56).toFixed(3);
    studs.forEach((st, i) => {
      const s = EAR_STUDS[i];
      const t0 = s.id === 'conch' ? 0.74 : 0.62 + (i > 4 ? i - 1 : i) * 0.032;
      const k = seg(p, t0, t0 + 0.07, ease.out);
      st.style.transform = `translate(${s.x}px, ${s.y}px) scale(${k.toFixed(3)})`;
      const halo = $('.es-halo', st);
      halo.style.opacity = (Math.sin(Math.PI * clamp((p - t0) / 0.1)) * 0.9).toFixed(3);
    });

    // 5) texto
    show(kicker, p, 0.7, 0.77, 14); show(title, p, 0.72, 0.82, 44); show(lead, p, 0.78, 0.86);
    values.forEach((v, i) => show(v, p, 0.8 + i * 0.02, 0.88 + i * 0.02, 16));
    facts.forEach((v, i) => show(v, p, 0.84 + i * 0.015, 0.91 + i * 0.015, 12));
    show(price, p, 0.88, 0.94, 12);
    const bu = show(btns, p, 0.9, 0.96, 12);
    btns.style.visibility = bu > 0.02 ? 'visible' : 'hidden';
  };
  const scene = registerScene(el, render, { damp: 7, onToggle: () => { measure(); scene.force = true; } });
  el.classList.add('is-ready');
  return { scene };
}
