import { $ } from '../lib/util.js';
import { quizStep } from '../../templates/quiz.js';

export function init(root) {
  const body = $('[data-quiz-body]', root);
  const go = (key) => {
    body.innerHTML = quizStep(key);
    const f = body.querySelector('button, a');
    f && f.focus({ preventScroll: true });
  };
  root.addEventListener('click', (e) => {
    const n = e.target.closest('[data-quiz-next]');
    if (n) go(n.dataset.quizNext);
    if (e.target.closest('[data-quiz-restart]')) go('start');
  });
}
