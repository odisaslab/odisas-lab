import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export const metadata = {
  title: "Página no encontrada",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col justify-center py-24">
      <p className="font-[family-name:var(--font-display)] text-sm font-medium text-primary-ink">
        Error 404
      </p>
      <h1 className="mt-4 text-h2 font-semibold">Esta página no existe</h1>
      <p className="mt-5 max-w-xl text-lead text-gray">
        La dirección que has abierto no corresponde a ninguna página de Odisas Lab.
        Puedes volver al inicio o contarnos qué buscabas.
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Button href="/" withArrow>
          Volver al inicio
        </Button>
        <Button href="/contacto" variant="outline">
          Contactar
        </Button>
      </div>
    </Container>
  );
}
