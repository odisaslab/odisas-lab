"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, MessageCircle, X } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { nav } from "@/data/home";
import { whatsappLink } from "@/data/site";
import { scrollToId, startScroll, stopScroll } from "@/lib/lenis";

/**
 * Navegación fija. En la home arranca transparente sobre el hero y, al hacer
 * scroll, se condensa en una píldora flotante. En el resto de páginas
 * es siempre la píldora, para que se lea sobre fondos claros.
 */
export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<string>("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Sección visible → enlace activo
  useEffect(() => {
    if (!isHome) {
      setCurrent("");
      return;
    }
    // Todas las secciones con id: las que no están en el menú limpian el enlace activo
    const ids = ["problema", "que-hacemos", "servicios", "recorrido", "diagnostico", "ia", "resultados", "proceso", "sobre", "contacto", "faq"];
    const inNav = new Set<string>(nav.map((item) => item.id));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setCurrent(inNav.has(entry.target.id) ? entry.target.id : "");
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [isHome]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Menú móvil: bloquea el scroll (también el de Lenis) y se cierra con Escape
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    stopScroll();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      startScroll();
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const condensed = scrolled || !isHome || open;

  const go = (id: string) => (event: React.MouseEvent) => {
    setOpen(false);
    if (isHome) {
      // Dejar que el cierre del menú libere el scroll antes de desplazar
      requestAnimationFrame(() => scrollToId(id));
      event.preventDefault();
    }
  };

  const hrefFor = (id: string) => (isHome ? `#${id}` : `/#${id}`);

  return (
    <>
      {!isHome ? <div aria-hidden="true" className="h-[4.5rem]" /> : null}

      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-6">
        <div
          className={`mx-auto flex h-14 items-center justify-between gap-4 rounded-full border px-4 transition-all duration-500 ease-out md:h-16 md:px-6 ${
            condensed
              ? "max-w-[1040px] border-hair bg-ink/90 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl"
              : "max-w-[1320px] border-transparent bg-transparent"
          }`}
        >
          <Logo invert />

          <nav aria-label="Navegación principal" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {nav.map((item) => {
                const active = current === item.id;
                return (
                  <li key={item.id}>
                    <Link
                      href={hrefFor(item.id)}
                      onClick={go(item.id)}
                      aria-current={active ? "location" : undefined}
                      className={`relative rounded-full px-4 py-2 text-[0.92rem] transition-colors ${
                        active ? "text-cream" : "text-mute hover:text-cream"
                      }`}
                    >
                      {item.label}
                      <span
                        aria-hidden="true"
                        className={`absolute inset-x-4 -bottom-0.5 h-px origin-left bg-primary transition-transform duration-300 ${
                          active ? "scale-x-100" : "scale-x-0"
                        }`}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href={hrefFor("contacto")}
              onClick={go("contacto")}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-primary px-4 py-2 font-[family-name:var(--font-display)] text-[0.9rem] font-semibold text-ink transition-colors hover:bg-[#ff8533] md:px-5"
            >
              Hablemos
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="menu-movil"
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              className="inline-flex size-10 items-center justify-center rounded-full border border-hair text-cream lg:hidden"
            >
              {open ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Fuera de <header>: backdrop-filter convertiría al header en el bloque contenedor del panel fixed */}
      {open ? (
        <div
          id="menu-movil"
          className="rise fixed inset-0 z-[45] bg-ink pt-24 lg:hidden"
          style={{ ["--d" as string]: 0 }}
        >
          <div className="wrap flex h-full flex-col justify-between pb-8">
            <nav aria-label="Navegación principal móvil">
              <ul>
                {nav.map((item, index) => (
                  <li key={item.id} className="hair-t">
                    <Link
                      href={hrefFor(item.id)}
                      onClick={go(item.id)}
                      className="flex min-h-16 items-center justify-between py-3 font-[family-name:var(--font-display)] text-[1.9rem] font-medium tracking-tight text-cream"
                    >
                      <span>
                        <span className="mono mr-4 text-[0.72rem] tracking-widest text-primary">
                          0{index + 1}
                        </span>
                        {item.label}
                      </span>
                      <ArrowRight aria-hidden="true" className="size-5 text-mute" />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex flex-col gap-3">
              <Link
                href={hrefFor("contacto")}
                onClick={go("contacto")}
                className="btn btn-primary w-full"
              >
                Quiero hacer crecer mi negocio
                <ArrowRight aria-hidden="true" className="arrow size-[1.05em]" />
              </Link>
              {whatsappLink ? (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost-light w-full"
                >
                  <MessageCircle aria-hidden="true" className="size-5" />
                  WhatsApp
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
