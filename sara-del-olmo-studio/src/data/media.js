/**
 * MEDIA · fotografías REALES. Hasta que Sara las entregue, cada hueco muestra un placeholder elegante
 * marcado como [ FOTO PENDIENTE ]. No se inventa ninguna imagen del negocio.
 *
 * Cómo poner una foto (ver README → «Fotos»):
 *   1. Copia el original (jpg/png) a  photos-src/  con el nombre de abajo, p. ej. `mesa-de-trabajo.jpg`.
 *   2. Ejecuta  npm run photos  → genera AVIF/WebP/JPG responsive en public/img/ y un manifiesto.
 *   3. En la entrada, escribe `file: 'mesa-de-trabajo'` (sin extensión) y un `alt` descriptivo.
 *
 * `tint` solo se usa para el degradado del placeholder.
 */

/** Galería del estudio (arrastrable). */
export const STUDIO_PHOTOS = [
  { key: 'estudio', label: 'El estudio', tint: ['#C98F8A', '#7A1027'], file: null, alt: '' },
  { key: 'mesa', label: 'Mesa de trabajo', tint: ['#E4C3BC', '#A86C6A'], file: null, alt: '' },
  { key: 'herramientas', label: 'Herramientas', tint: ['#9B7690', '#46101D'], file: null, alt: '' },
  { key: 'esmaltes', label: 'Esmaltes', tint: ['#D7A49B', '#5B3426'], file: null, alt: '' },
  { key: 'detalles', label: 'Detalles', tint: ['#BFB6C4', '#2B2438'], file: null, alt: '' },
  { key: 'instalaciones', label: 'Instalaciones', tint: ['#E6B8AE', '#B01329'], file: null, alt: '' },
  { key: 'ambiente', label: 'Ambiente', tint: ['#C7A3A0', '#3A1A20'], file: null, alt: '' },
];

/**
 * Trabajos reales para «See the work». Vacío = se muestran huecos pendientes.
 * Cada entrada: { file: 'trabajo-01', alt: 'Descripción', href: 'https://www.instagram.com/p/XXXX/' }
 */
export const INSTAGRAM_POSTS = [];
export const INSTAGRAM_SLOTS = 6;

/** Retratos del equipo: se rellenan desde team.js (`photo`). */
