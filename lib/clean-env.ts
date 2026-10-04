/**
 * Limpia el valor de una variable de entorno.
 * Al pegar variables desde algunos editores de Windows se cuela un carácter invisible
 * (BOM, U+FEFF) o un espacio: rompe `new URL()`, los enlaces mailto:/tel: y las cabeceras
 * HTTP (p. ej. la clave de Resend), sin que se vea nada raro en el panel de Vercel.
 *
 * Devuelve `undefined` solo si la variable no existe; una variable vacía devuelve "".
 */
export function cleanEnv(value: string | undefined): string | undefined {
  return value === undefined ? undefined : value.replace(/[﻿​-‍⁠]/g, "").trim();
}

/** Variable de servidor (acceso dinámico por nombre; no sirve para NEXT_PUBLIC_*). */
export const serverEnv = (name: string): string => cleanEnv(process.env[name]) ?? "";
