import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <Section name="not-found" theme="dark" className="flex min-h-[100svh] items-center !py-0" label="Página no encontrada">
      <div className="bg-grid absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="wrap relative">
        <p className="t-eyebrow">Error 404</p>
        <h1 className="t-display mt-6 max-w-[14ch]">Esta página no está en el mapa.</h1>
        <p className="t-lead mt-6 max-w-[30rem]">Puede que el enlace haya cambiado. Vuelve al inicio o cuéntanos qué buscabas.</p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Button href="/" size="lg" cta="404-home">
            Volver al inicio
          </Button>
          <Button href="/contacto" variant="ghost" size="lg" cta="404-contact">
            Contactar
          </Button>
        </div>
      </div>
    </Section>
  );
}
