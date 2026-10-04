"use client";

import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Efectos de scroll genéricos para toda la home, activados por atributos:
 *   data-reveal            aparece desde abajo
 *   data-reveal-stagger    sus hijos aparecen escalonados
 *   data-split             texto por palabras que sube desde una máscara
 *   data-counter="142"     cuenta hasta el valor (data-prefix / data-suffix)
 *   data-parallax="0.15"   desplazamiento suave respecto al scroll
 *   data-line="x|y"        línea que se dibuja
 *   data-iris              el elemento se abre como un iris (círculo) a medida que su sección entra
 *   data-expand            el elemento crece desde una tarjeta redondeada hasta ocupar todo el ancho
 *
 * Cada elemento se prepara solo cuando está a menos de una pantalla de entrar
 * (IntersectionObserver), no todos de golpe al cargar. Con movimiento reducido
 * no se hace nada: el contenido simplemente está visible.
 */
const SELECTOR =
  "[data-reveal],[data-reveal-stagger],[data-split],[data-counter],[data-parallax],[data-line],[data-iris],[data-expand]";

export function ScrollEffects() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {});

    const prepare = (el: HTMLElement) => {
      ctx.add(() => {
        const d = el.dataset;

        if ("reveal" in d) {
          gsap.from(el, {
            y: 44,
            opacity: 0,
            duration: 0.9,
            ease: "power3.out",
            delay: Number(d.delay ?? 0),
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          });
        }

        if ("revealStagger" in d) {
          gsap.from(el.children, {
            y: 40,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.09,
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          });
        }

        if ("split" in d) {
          gsap.from(el.querySelectorAll(".w > span"), {
            yPercent: 112,
            duration: 1,
            ease: "power4.out",
            stagger: 0.045,
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          });
        }

        if ("counter" in d) {
          const target = Number(d.counter);
          const prefix = d.prefix ?? "";
          const suffix = d.suffix ?? "";
          const state = { value: 0 };
          el.textContent = `${prefix}0${suffix}`;
          gsap.to(state, {
            value: target,
            duration: 2.2,
            ease: "power2.out",
            onUpdate: () => {
              el.textContent = `${prefix}${Math.round(state.value)}${suffix}`;
            },
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          });
        }

        if ("parallax" in d) {
          const amount = Number(d.parallax) * 100;
          gsap.fromTo(
            el,
            { yPercent: -amount },
            {
              yPercent: amount,
              ease: "none",
              scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
            },
          );
        }

        // Transiciones de máscara: solo en los momentos de conversión (diagnóstico, CTA intermedio y final)
        if ("iris" in d) {
          gsap.fromTo(
            el,
            { clipPath: "circle(0% at 50% 55%)" },
            {
              clipPath: "circle(150% at 50% 55%)",
              ease: "none",
              scrollTrigger: { trigger: el.parentElement ?? el, start: "top 92%", end: "top 18%", scrub: true },
            },
          );
        }

        if ("expand" in d) {
          gsap.fromTo(
            el,
            { clipPath: "inset(12% 4% 0% 4% round 56px 56px 0px 0px)" },
            {
              clipPath: "inset(0% 0% 0% 0% round 0px 0px 0px 0px)",
              ease: "none",
              scrollTrigger: { trigger: el.parentElement ?? el, start: "top 96%", end: "top 38%", scrub: true },
            },
          );
        }

        if ("line" in d) {
          const vertical = d.line === "y";
          gsap.from(el, {
            [vertical ? "scaleY" : "scaleX"]: 0,
            transformOrigin: vertical ? "top" : "left",
            ease: "power2.out",
            duration: 1.2,
            scrollTrigger: { trigger: el, start: "top 92%", once: true },
          });
        }
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          prepare(entry.target as HTMLElement);
        });
      },
      { rootMargin: "100% 0px" },
    );
    document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => observer.observe(el));

    // Las fuentes y el layout pueden mover los puntos de inicio: recalcular una vez asentado
    const refresh = () => ScrollTrigger.refresh();
    if (document.readyState === "complete") refresh();
    else window.addEventListener("load", refresh, { once: true });

    return () => {
      observer.disconnect();
      ctx.revert();
      window.removeEventListener("load", refresh);
    };
  }, []);

  return null;
}
