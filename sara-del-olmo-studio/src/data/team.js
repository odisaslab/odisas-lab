/**
 * TEAM · el equipo real, sacado de Booksy.
 * - `bio` vacío → la web muestra [ BIOGRAFÍA PENDIENTE ].
 * - `photo` → ruta de la foto real cuando Sara la entregue (ver README, «Fotos»). Mientras tanto, monograma sobre degradado.
 * - `pendingNote` → dato que Sara debe confirmar.
 */
export const TEAM = [
  {
    id: 'sara-agudo',
    name: 'Sara Agudo del Olmo',
    short: 'Sara',
    role: 'Fundadora y manicurista',
    featured: true,
    bio: 'Especialista en semipermanente con refuerzo y nivelación, manicura rusa, pedicura, extensiones y diseños a mano alzada. Forma y acompaña al equipo.',
    tags: ['Refuerzo', 'Manicura rusa', 'Mano alzada'],
    photo: null,
    tint: ['#B01329', '#46101D'],
  },
  {
    id: 'mafer',
    name: 'Mafer',
    role: 'Manos y pies',
    bio: 'Más de cinco años de experiencia y formación continua. Perfeccionista, tranquila y cercana.',
    tags: ['Manicura rusa', 'Extensiones', 'Pedicura'],
    photo: null,
    tint: ['#D7A49B', '#8C4F4A'],
  },
  {
    id: 'paula',
    name: 'Paula',
    role: 'Piercing y diseño de oreja',
    bio: 'Diseña composiciones de oreja a tu medida y cuida cada paso para que sea cómodo y seguro.',
    tags: ['Diseño de oreja', 'Titanio'],
    photo: null,
    tint: ['#BFB6C4', '#4A3F5C'],
  },
  {
    id: 'sara-micro',
    name: 'Sara',
    role: 'Micropigmentación de cejas',
    bio: 'Efecto sombreado natural que respeta tus facciones y potencia la mirada.',
    tags: ['Efecto sombreado'],
    photo: null,
    tint: ['#A57E6E', '#3E2519'],
    pendingNote: 'Apellido o apodo por confirmar',
  },
  {
    id: 'daniela',
    name: 'Daniela',
    role: 'Manicurista',
    bio: '',
    tags: ['Manicura', 'Pedicura'],
    photo: null,
    tint: ['#E3685B', '#7A1027'],
  },
  {
    id: 'bianca',
    name: 'Bianca',
    role: 'Manicurista',
    bio: '',
    tags: ['Manicura'],
    photo: null,
    tint: ['#9B7690', '#2B1519'],
  },
];
