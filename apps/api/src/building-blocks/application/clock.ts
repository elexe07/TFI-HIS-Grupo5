/**
 * Puerto para obtener la hora actual. Nunca usar `new Date()` en dominio o aplicación:
 * con un Clock inyectado los tests pueden fijar la fecha.
 */
export const CLOCK = Symbol('CLOCK');

export interface Clock {
  ahora(): Date;
}
