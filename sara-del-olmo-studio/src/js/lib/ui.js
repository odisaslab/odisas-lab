/** Piezas de interfaz compartidas: aviso (toast), enlaces de WhatsApp y apertura externa. */
import { CONFIG } from '../../data/config.js';
import { $ } from './util.js';

let timer;
export function toast(msg, ms = 3400) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(timer);
  timer = setTimeout(() => t.classList.remove('show'), ms);
}

export const waHref = (text = '') => {
  const t = encodeURIComponent(text);
  return CONFIG.whatsapp ? `https://wa.me/${CONFIG.whatsapp}?text=${t}` : `https://wa.me/?text=${t}`;
};

export function openExternal(url) {
  // Sin 'noopener' en las features: con él window.open siempre devuelve null y no se puede detectar el bloqueo
  const w = window.open(url, '_blank');
  if (w) { try { w.opener = null; } catch { /* nada */ } }
  else toast('Tu navegador ha bloqueado la ventana. Permite ventanas emergentes para continuar.');
}

/** Si no hay WhatsApp configurado, lo decimos claro en vez de fallar en silencio. */
export const noteWhatsappPending = () => {
  if (!CONFIG.whatsapp) toast('[ DATOS PENDIENTES ] El WhatsApp del estudio aún no está configurado: elige un contacto para enviar el mensaje.', 5200);
};
