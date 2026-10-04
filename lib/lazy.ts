/**
 * Ejecuta `init` cuando `el` está a menos de una pantalla de entrar en el viewport.
 * Así las animaciones de scroll no se montan todas durante la hidratación,
 * sino a medida que el visitante se acerca a cada sección.
 * Devuelve la función de limpieza.
 */
export function whenNear(el: Element, init: () => void, margin = "100% 0px") {
  if (typeof IntersectionObserver === "undefined") {
    init();
    return () => {};
  }
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        init();
      }
    },
    { rootMargin: margin },
  );
  observer.observe(el);
  return () => observer.disconnect();
}
