import type { Saludo } from './saludo';

/** Token de inyección: las interfaces no existen en runtime. */
export const SALUDO_REPOSITORY = Symbol('SALUDO_REPOSITORY');

/**
 * Puerto de salida. Lo define el dominio, lo implementa infrastructure.
 * Solo expone lo que el negocio necesita (si el agregado fuera inmutable, acá no habría `actualizar`).
 */
export interface SaludoRepository {
  guardar(saludo: Saludo): Promise<void>;
  listar(): Promise<Saludo[]>;
}
