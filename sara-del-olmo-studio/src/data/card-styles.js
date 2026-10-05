/**
 * CARD_STYLES · diseños del vale regalo. Para añadir uno, copia una entrada.
 * `swatch` = color del selector, `bg` = fondo de la tarjeta (CSS), `ink` = texto, `accent` = brillo/detalle.
 */
export const CARD_STYLES = [
  {
    id: 'cereza',
    name: 'Cereza lacada',
    swatch: '#7A1027',
    bg: 'linear-gradient(135deg,#9B1431 0%,#7A1027 46%,#4B0A19 100%)',
    ink: '#FBECEE',
    accent: '#F6B8C4',
  },
  {
    id: 'nude',
    name: 'Nude rosado',
    swatch: '#E7CBC3',
    bg: 'linear-gradient(135deg,#F3DDD6 0%,#E7CBC3 52%,#D7A49B 100%)',
    ink: '#3A1A20',
    accent: '#7A1027',
  },
  {
    id: 'noche',
    name: 'Azul noche',
    swatch: '#1F2B4D',
    bg: 'linear-gradient(135deg,#34457A 0%,#1F2B4D 52%,#111830 100%)',
    ink: '#EEE6F2',
    accent: '#B9A5D8',
  },
  {
    id: 'cromo',
    name: 'Cromo',
    swatch: '#B9BCC6',
    bg: 'linear-gradient(135deg,#F4F4F7 0%,#B9BCC6 38%,#6D7080 62%,#D9DBE3 100%)',
    ink: '#1E1F26',
    accent: '#FFFFFF',
  },
];

/** Importes rápidos del creador de vales. Provisionales: confirmar con Sara cómo quiere venderlos. */
export const VOUCHER_AMOUNTS = [20, 30, 50, 75];
export const VOUCHER_LIMITS = { min: 10, max: 500 };
