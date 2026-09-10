import { BarChart3, FileText, Workflow, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";

const uses = [
  {
    icon: BarChart3,
    title: "Análisis",
    description:
      "Procesamos datos de tu web y tus campañas para encontrar patrones que a mano tardarías semanas en ver.",
  },
  {
    icon: Workflow,
    title: "Automatización",
    description:
      "Tareas repetitivas resueltas por sistemas, para dedicar el tiempo a lo que sí requiere criterio.",
  },
  {
    icon: FileText,
    title: "Contenido",
    description:
      "Producción más rápida de textos y creatividades, siempre con revisión y criterio humano detrás.",
  },
  {
    icon: Zap,
    title: "Optimización",
    description:
      "Detección temprana de qué campañas, páginas y mensajes están rindiendo y cuáles hay que corregir.",
  },
];

export function AiSection() {
  return (
    <Section tone="dark">
      <Container>
        <div className="grid gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
          <div>
            <SectionTitle
              label="Inteligencia artificial"
              title="La IA no sustituye la estrategia. La potencia."
              intro="No usamos inteligencia artificial porque esté de moda. La usamos cuando nos permite analizar más rápido, decidir mejor y darte una ventaja real frente a tu competencia."
              invert
            />
            <div className="mt-10">
              <Button href="/servicios/analisis-web-ia" variant="outlineLight" withArrow>
                Análisis web con IA
              </Button>
            </div>
          </div>

          <div className="grid gap-px overflow-hidden rounded-[var(--radius-card)] bg-white/10 sm:grid-cols-2">
            {uses.map((use, index) => (
              <Reveal key={use.title} delay={index * 0.06}>
                <div className="h-full bg-dark p-7">
                  <use.icon
                    aria-hidden="true"
                    className="size-5 text-primary"
                    strokeWidth={1.75}
                  />
                  <h3 className="mt-5 text-h3 font-semibold text-white">{use.title}</h3>
                  <p className="mt-2 text-[0.95rem] text-white/60">{use.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
