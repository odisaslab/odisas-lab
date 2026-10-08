"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { QuoteButton } from "@/components/forms/QuoteProvider";
import { Logo } from "@/components/ui/Logo";
import { Lock, Menu } from "@/components/ui/Icons";
import { mainNav, PROFESSIONAL_ACCESS } from "@/data/nav";
import { onScroll } from "@/lib/scroll-bus";
import { MobileMenu } from "./MobileMenu";

type Theme = "dark" | "light";

/**
 * Header sticky. Se compacta al hacer scroll y toma el tema (claro/oscuro) de la sección
 * que tiene debajo, para que el logo y los enlaces nunca pierdan contraste.
 */
export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => onScroll((y) => setScrolled(y > 24)), []);

  // Tema según la sección bajo el header (banda de ~4 % superior del viewport)
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("main [data-section][data-theme]"));
    if (sections.length === 0) {
      setTheme("light");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setTheme((entry.target as HTMLElement).dataset.theme === "light" ? "light" : "dark");
        }
      },
      { rootMargin: "-3% 0px -96% 0px", threshold: 0 },
    );
    sections.forEach((section) => io.observe(section));
    return () => io.disconnect();
  }, [pathname]);

  useEffect(() => setMenuOpen(false), [pathname]);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    triggerRef.current?.focus();
  }, []);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <a href="#contenido" className="sr-only-focusable fixed left-4 top-4 z-[100] rounded-full bg-fg px-5 py-3 text-sm font-semibold text-surface">
        Saltar al contenido
      </a>

      <header
        data-theme={theme}
        data-scrolled={scrolled}
        className="fixed inset-x-0 top-0 z-50 border-b border-transparent text-fg transition-[background-color,border-color,backdrop-filter] duration-500 data-[scrolled=true]:border-line data-[scrolled=true]:bg-[color-mix(in_srgb,var(--surface)_80%,transparent)] data-[scrolled=true]:backdrop-blur-xl"
      >
        <div className={`wrap flex items-center justify-between gap-6 transition-[height] duration-500 ${scrolled ? "h-16" : "h-[4.5rem]"}`}>
          <Link href="/" aria-label="Zona Pies · Inicio" className="shrink-0 rounded-full">
            <Logo />
          </Link>

          <nav aria-label="Principal" className="hidden xl:block">
            <ul className="flex items-center gap-1">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="navlink" aria-current={isActive(item.href) ? "page" : undefined}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href={PROFESSIONAL_ACCESS.href} data-pro data-cta="header-pro-access" className="navlink hidden items-center gap-2 lg:inline-flex">
              <Lock className="size-4" />
              <span className="hud !text-[0.6875rem]">{PROFESSIONAL_ACCESS.label}</span>
            </Link>

            <span className="hidden md:inline-flex">
              <QuoteButton cta="header" size="sm" magnetic arrow={false}>
                Solicitar presupuesto
              </QuoteButton>
            </span>

            <button
              ref={triggerRef}
              type="button"
              className="grid size-11 place-items-center rounded-full border border-line-strong transition-colors hover:border-fg xl:hidden"
              aria-label="Abrir menú"
              aria-expanded={menuOpen}
              aria-controls="menu-movil"
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Fuera del <header>: backdrop-filter crea un bloque contenedor y colapsaría el overlay fijo */}
      <MobileMenu open={menuOpen} onClose={closeMenu} pathname={pathname} />
    </>
  );
}
