/**
 * Testimonios (briefing §17): «No lo decimos nosotros.»
 *
 * NO SE HAN PODIDO RECUPERAR los testimonios reales de la web actual (zonapies.es no era
 * accesible). No se inventa ninguno. Para publicarlos: copiar el texto literal, nombre,
 * clínica/centro y ciudad, confirmar la autorización y poner `verified: true`.
 * Mientras `verified` sea false, la interfaz muestra un hueco marcado como pendiente.
 */
export interface Testimonial {
  id: string;
  verified: boolean;
  quote?: string;
  name?: string;
  role?: string;
  place?: string;
}

export const testimonials: Testimonial[] = [
  { id: "t1", verified: false },
  { id: "t2", verified: false },
  { id: "t3", verified: false },
];
