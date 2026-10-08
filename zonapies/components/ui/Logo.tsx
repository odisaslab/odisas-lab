/**
 * Marca PROVISIONAL de Zona Pies: huella estilizada con línea de escaneo.
 * Sustituir por el logotipo oficial cuando se reciba el manual de marca.
 */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M12.2 28c-2.1 0-3.5-1.7-3.3-3.8.3-2.6 1.6-3.7 1.5-6.2-.1-2.5-1.6-4.4-1.2-7.3C9.6 7.7 12 5.5 15 5.5c3.1 0 5.7 2.1 6 5.4.3 3-1 4.8-1.2 7.1-.2 2.6 1.3 3.5 1.1 5.9-.2 2.5-2.2 4.1-5 4.1h-3.7Z" />
      <path d="M3.5 17h25" strokeWidth="1" opacity="0.7" />
      <circle cx="24.5" cy="17" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className="size-7" />
      <span className="text-[0.95rem] font-semibold uppercase leading-none tracking-[0.24em]">
        Zona Pies
      </span>
    </span>
  );
}
