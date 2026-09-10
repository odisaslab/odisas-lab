import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { HeroVisual } from "@/components/visuals/HeroVisual";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-14 pb-20 md:pt-20 md:pb-28">
      {/* Fondo sutil: rejilla técnica y halo naranja */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(23,23,23,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(23,23,23,0.035) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(80% 60% at 50% 0%, black, transparent)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-[-10%] -z-10 size-[34rem] rounded-full bg-primary/10 blur-3xl"
      />

      <Container>
        <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          <div>
            <p className="mb-6 inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-line bg-white px-4 py-1.5 text-sm text-gray">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-primary" />
              Odisas Lab · Marketing digital
            </p>

            <h1 className="text-display font-semibold text-dark">
              Hacemos que tu negocio se vea,{" "}
              <span className="text-primary-ink">crezca y convierta</span>.
            </h1>

            <p className="mt-7 max-w-xl text-lead text-gray">
              Diseñamos estrategias digitales que combinan marketing, tecnología e
              inteligencia artificial para conseguirte más visibilidad, más clientes y
              una marca más sólida.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button href="/contacto" size="lg" withArrow>
                Quiero hacer crecer mi negocio
              </Button>
              <Button href="/servicios" variant="outline" size="lg">
                Ver servicios
              </Button>
            </div>
          </div>

          <div className="lg:pl-6">
            <HeroVisual />
          </div>
        </div>
      </Container>
    </section>
  );
}
