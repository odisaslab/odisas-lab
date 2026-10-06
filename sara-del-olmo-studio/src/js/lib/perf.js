/**
 * Regulador de rendimiento. Mide el tiempo entre fotogramas mientras el usuario hace scroll; si la máquina no llega
 * (más de ~28 ms de media durante medio segundo), baja un nivel de calidad:
 *   nivel 1 → los lienzos de fotos se pintan a ≤ 1,25× y se quitan los desenfoques de la cabecera y las sombras de texto
 *   nivel 2 → lienzos a 1× (un poco menos nítidos, pero fluidos)
 * Nunca sube de nivel por sí solo en la misma visita (evita parpadeos de calidad).
 */
const listeners = new Set();
export const perf = { level: 0 };
let n = 0, sum = 0;

export const onPerfLevel = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

/** `dt` en ms entre dos fotogramas consecutivos de una racha de scroll. */
export function observeFrame(dt) {
  if (perf.level >= 2 || dt > 250) return;
  sum += dt; n++;
  if (n < 30) return;
  const avg = sum / n;
  n = 0; sum = 0;
  if (avg > 28) {
    perf.level++;
    document.documentElement.classList.add('lite', `lite-${perf.level}`);
    listeners.forEach((fn) => fn(perf.level));
  }
}
