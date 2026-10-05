/** Versión simple (movimiento reducido): todo son fotografías ya presentes en el HTML; solo falta el color del look en «pies». */
import { applyLookTheme } from '../lib/look.js';

export function init() {
  applyLookTheme();   // el color del look (si lo hay) tiñe el fondo de «pies»
}
