/** Test «¿No sabes qué pedir?» (dos preguntas → servicio recomendado). Sirve al prerender y al navegador. */
import { QUIZ, svcById } from '../data/services.js';
import { esc, priceHtml, bookAttrs } from './util.js';

export function quizStep(key = 'start') {
  if (key.startsWith('=')) {
    const s = svcById(key.slice(1));
    return `<div class="quiz__result"><p class="quiz__step">Te recomendamos</p><p class="quiz__name">${esc(s.name)}</p>
      <p class="quiz__meta">${priceHtml(s)} · ${esc(s.dur)}</p>
      <div class="btn-row"><a class="btn btn--solid btn--sm" ${bookAttrs('quiz', s.id)}>Pedir cita</a><button type="button" class="btn btn--ghost btn--sm" data-open-svc="${s.id}">Ver qué incluye</button></div>
      <p class="quiz__again"><button type="button" class="link" data-quiz-restart>Empezar de nuevo</button></p></div>`;
  }
  const n = QUIZ[key];
  return `<div><p class="quiz__step">Paso ${n.step} de 2</p><p class="quiz__q">${esc(n.q)}</p>
    <div class="quiz__opts">${n.opts.map(([t, nx]) => `<button type="button" class="quiz__opt" data-quiz-next="${esc(nx)}">${esc(t)}</button>`).join('')}</div></div>`;
}
