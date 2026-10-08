/**
 * Franquicias: «Lleva Zona Pies a tu mercado.» (briefing §14 / §19).
 * No consta ningún dato del modelo (condiciones, inversión, territorios): no se inventa.
 */
export interface Pillar {
  id: string;
  title: string;
  body: string;
}

export const pillars: Pillar[] = [
  { id: "modelo", title: "Modelo", body: "Un modelo de negocio construido sobre la fabricación digital de ortesis plantares." },
  { id: "soporte", title: "Soporte", body: "El respaldo del equipo de Zona Pies en el día a día." },
  { id: "tecnologia", title: "Tecnología", body: "Escáner 3D, software de prescripción y fabricación avanzada." },
  { id: "fabricacion", title: "Fabricación", body: "Materiales técnicos y procesos de fabricación avanzados." },
  { id: "formacion", title: "Formación", body: "Formación para dominar el flujo de trabajo digital." },
  { id: "acompanamiento", title: "Acompañamiento", body: "Una relación continua desde el primer contacto." },
];

export const franchisePending = "Condiciones del modelo, perfil de franquiciado y territorios disponibles";
