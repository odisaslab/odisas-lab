/**
 * Limpia el valor de una variable de entorno.
 * Al pegar variables desde algunos editores se cuela un carácter invisible (BOM, U+FEFF)
 * o un espacio que rompe enlaces tel:/mailto:/wa.me y cabeceras HTTP.
 *
 * Devuelve `undefined` solo si la variable no existe; una variable vacía devuelve "".
 */
export function cleanEnv(value: string | undefined): string | undefined {
  return value === undefined ? undefined : value.replace(/[﻿​-‍⁠]/g, "").trim();
}

/** Variable de servidor (acceso dinámico por nombre; no sirve para NEXT_PUBLIC_*). */
export const serverEnv = (name: string): string => cleanEnv(process.env[name]) ?? "";
