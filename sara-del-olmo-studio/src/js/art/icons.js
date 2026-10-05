/**
 * Iconos y piezas de línea. Todos son trazos (stroke) con pathLength="1" para poder «dibujarlos»
 * con stroke-dashoffset. Las ilustraciones por categoría reutilizan la silueta de uña.
 */

/** Silueta de uña para símbolos pequeños. */
export const NAIL_SYMBOL =
  'M50 2 C68 6 94 44 94 84 L94 132 C94 152 76 162 50 162 C24 162 6 152 6 132 L6 84 C6 44 32 6 50 2Z';

export const svgSprite = () => `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
  <defs>
    <symbol id="i-nail" viewBox="0 0 100 164"><path fill="currentColor" d="${NAIL_SYMBOL}"/></symbol>
    <symbol id="i-nail-o" viewBox="0 0 100 164"><path d="${NAIL_SYMBOL}"/></symbol>
    <symbol id="i-star" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2.8l2.7 6 6.5.6-4.9 4.3 1.5 6.4L12 16.8 6.2 20.1l1.5-6.4L2.8 9.4l6.5-.6z"/></symbol>
    <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></symbol>
    <symbol id="i-close" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></symbol>
    <symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M20 20l-3.6-3.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></symbol>
    <symbol id="i-phone" viewBox="0 0 24 24"><path d="M6.6 3h2.8l1.6 4.2-2 1.3a11 11 0 0 0 5.5 5.5l1.3-2L20 13.6v2.8A2.6 2.6 0 0 1 17.4 19 14.4 14.4 0 0 1 5 6.6 2.6 2.6 0 0 1 6.6 3Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></symbol>
    <symbol id="i-wa" viewBox="0 0 24 24"><path d="M4 20l1.2-4.1A8 8 0 1 1 8.2 18.9L4 20Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M9.2 8.6c.2 2.6 2.7 5.1 5.3 5.4l1.3-1.2-1.9-1.1-.9.7c-.9-.4-1.7-1.2-2.1-2.1l.7-.9-1.1-1.9-1.3 1.1Z" fill="currentColor"/></symbol>
    <symbol id="i-ig" viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="17" cy="7" r="1.1" fill="currentColor"/></symbol>
    <symbol id="i-pin" viewBox="0 0 24 24"><path d="M12 21s7-6.2 7-11.2A7 7 0 0 0 5 9.8C5 14.8 12 21 12 21Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="12" cy="9.8" r="2.4" fill="none" stroke="currentColor" stroke-width="1.6"/></symbol>
    <symbol id="i-gift" viewBox="0 0 24 24"><rect x="3.5" y="9" width="17" height="11" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3 9h18v3H3zM12 9v11M12 9c-2.6 0-4-1-4-2.4S9 4 10.2 4C11.6 4 12 6.2 12 9Zm0 0c2.6 0 4-1 4-2.4S15 4 13.8 4C12.4 4 12 6.2 12 9Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></symbol>
  </defs>
</svg>`;

/* ───────────── Seguridad: instrumental → icono ───────────── */

/** Cada pieza: `tool` (instrumental, viewBox 0 0 200 200), `icon` (viewBox 0 0 64 64). */
export const SAFETY = [
  {
    id: 'esterilizacion',
    title: 'Esterilización',
    text: 'Cada clienta estrena su propio paquete de herramientas, esterilizado e individual.',
    // sobre esterilizado con herramienta dentro
    tool: [
      'M56 30 H144 A8 8 0 0 1 152 38 V162 A8 8 0 0 1 144 170 H56 A8 8 0 0 1 48 162 V38 A8 8 0 0 1 56 30 Z',
      'M48 56 H152',
      'M100 82 V146 M92 82 H108 M96 146 H104',
    ],
    icon: [
      'M17 8 H47 A5 5 0 0 1 52 13 V53 A5 5 0 0 1 47 58 H17 A5 5 0 0 1 12 53 V13 A5 5 0 0 1 17 8 Z',
      'M12 19 H52',
      'M23 37 L29 43 L42 29',
    ],
  },
  {
    id: 'proteccion',
    title: 'Protección',
    text: 'Trabajamos con guantes y mascarilla en todos los servicios.',
    // guante
    tool: [
      'M70 172 V96 C70 86 84 86 84 96 V50 C84 40 98 40 98 50 V40 C98 30 112 30 112 40 V54 C112 44 126 44 126 54 V102 C126 92 140 92 140 102 V132 C140 156 124 172 104 172 Z',
      'M70 150 H138',
    ],
    icon: [
      'M22 56 V31 C22 28 26.5 28 26.5 31 V17 C26.5 14 31 14 31 17 V14 C31 11 35.5 11 35.5 14 V18 C35.5 15 40 15 40 18 V33 C40 30 44.5 30 44.5 33 V44 C44.5 51 39 56 33 56 Z',
      'M22 50 H44',
    ],
  },
  {
    id: 'materiales',
    title: 'Materiales de calidad',
    text: 'Torno para una cutícula limpia y precisa, y joyería de titanio de grado implante en piercing.',
    // torno / fresa y joya
    tool: [
      'M100 22 V108',
      'M92 22 H108 M94 22 V60 H106 V22',
      'M96 108 H104 L100 140 Z',
      'M100 150 L132 172 L100 194 L68 172 Z',
      'M68 172 H132 M100 150 L88 172 L100 194 L112 172 Z',
    ],
    icon: [
      'M20 12 H44 L55 25 L32 53 L9 25 Z',
      'M9 25 H55 M26 12 L22 25 L32 53 L42 25 L38 12',
    ],
  },
];

/* ───────────── Ilustraciones de categoría (línea sobre uñas) ───────────── */

export const catIllustration = (cat) => {
  const n = (x, y, w, h, rot = 0) =>
    `<use class="ill-nail" href="#i-nail-o" x="${x}" y="${y}" width="${w}" height="${h}"${rot ? ` transform="rotate(${rot} ${x + w / 2} ${y + h})"` : ''}/>`;
  if (cat === 'manos')
    return `<svg viewBox="0 0 260 220" aria-hidden="true" focusable="false">${n(46, 44, 62, 102, -14)}${n(98, 14, 68, 112)}${n(156, 44, 62, 102, 14)}<path class="ill-line" d="M40 176 C 90 198 170 198 222 176"/></svg>`;
  if (cat === 'pies')
    return `<svg viewBox="0 0 240 120" aria-hidden="true" focusable="false">${n(22, 30, 40, 64, -12)}${n(72, 40, 30, 48, -4)}${n(112, 48, 26, 42)}${n(148, 56, 22, 36, 5)}${n(180, 66, 18, 30, 10)}</svg>`;
  if (cat === 'cejas')
    return `<svg viewBox="0 0 240 120" aria-hidden="true" focusable="false"><path class="ill-brow-fill" d="M16 98 C56 52 136 34 224 66 C216 76 208 78 198 77 C138 66 76 78 24 106 Z"/><path class="ill-line" d="M16 98 C56 52 136 34 224 66 C216 76 208 78 198 77 C138 66 76 78 24 106 Z"/><path class="ill-line" d="M52 86 l10 -12 M76 76 l10 -12 M100 70 l10 -12 M124 66 l10 -11 M148 64 l10 -10 M172 64 l10 -8"/></svg>`;
  return `<svg viewBox="0 0 160 170" aria-hidden="true" focusable="false"><path class="ill-line" d="M86 10 C44 10 18 44 20 82 C22 110 42 120 46 142 C50 162 76 166 86 152 C96 138 88 128 98 118 C124 96 140 72 134 44 C128 22 112 10 86 10 Z"/><path class="ill-line" d="M88 38 C62 36 48 58 52 78 C56 94 76 92 80 78"/><circle class="ill-jewel" cx="122" cy="28" r="3.6"/><circle class="ill-jewel" cx="131" cy="44" r="3"/><circle class="ill-jewel" cx="60" cy="146" r="4"/></svg>`;
};

/* ───────────── Especialidades de manos (mini-ilustraciones de uña) ───────────── */

/** Cada técnica se dibuja sobre una uña en trazo. viewBox 0 0 120 190. */
export const TECHNIQUES = {
  manicura: `<path class="t-line" d="M60 8 C80 12 106 54 106 98 V150 C106 172 86 184 60 184 C34 184 14 172 14 150 V98 C14 54 40 12 60 8Z"/><path class="t-line" d="M26 154 C44 170 76 170 94 154" opacity=".7"/><path class="t-line" d="M40 176 l4 8 M60 180 v8 M80 176 l-4 8" opacity=".6"/>`,
  semipermanente: `<path class="t-fill" d="M60 8 C80 12 106 54 106 98 V150 C106 172 86 184 60 184 C34 184 14 172 14 150 V98 C14 54 40 12 60 8Z"/><path class="t-gloss" d="M32 70 C32 100 34 130 38 150" /><ellipse class="t-gloss-dot" cx="84" cy="52" rx="4" ry="11" transform="rotate(16 84 52)"/>`,
  refuerzo: `<path class="t-line" d="M60 8 C80 12 106 54 106 98 V150 C106 172 86 184 60 184 C34 184 14 172 14 150 V98 C14 54 40 12 60 8Z"/><path class="t-line" d="M24 150 C40 128 80 128 96 150" opacity=".6"/><path class="t-line" d="M24 126 C40 104 80 104 96 126" opacity=".45"/><path class="t-line" d="M28 100 C42 80 78 80 92 100" opacity=".3"/>`,
  extensiones: `<path class="t-line" d="M60 -6 C82 0 108 54 108 104 V152 C108 172 88 184 60 184 C32 184 12 172 12 152 V104 C12 54 38 0 60 -6Z"/><path class="t-line" d="M16 112 C40 92 80 92 104 112" opacity=".6"/><path class="t-line" d="M60 -6 V30" opacity=".5" stroke-dasharray="2 5"/>`,
  nailart: `<path class="t-line" d="M60 8 C80 12 106 54 106 98 V150 C106 172 86 184 60 184 C34 184 14 172 14 150 V98 C14 54 40 12 60 8Z"/><path class="t-line t-art" d="M32 130 C40 100 52 140 62 108 S78 130 88 90" /><circle class="t-dot" cx="44" cy="70" r="3"/><circle class="t-dot" cx="76" cy="62" r="2"/>`,
  rusa: `<path class="t-line" d="M60 8 C80 12 106 54 106 98 V150 C106 172 86 184 60 184 C34 184 14 172 14 150 V98 C14 54 40 12 60 8Z"/><path class="t-line" d="M20 156 C38 176 82 176 100 156" opacity=".9"/><circle class="t-line" cx="60" cy="168" r="3"/><path class="t-line" d="M60 171 V190" opacity=".7"/>`,
};
