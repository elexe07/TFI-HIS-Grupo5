import type { Triaje } from './triaje';

export const TRIAJE_REPOSITORY = Symbol('TRIAJE_REPOSITORY');

export interface TriajeRepository {
  guardar(triaje: Triaje): Promise<void>;
  buscarPorId(id: string): Promise<Triaje | null>;
  obtenerColaGuardia(): Promise<Triaje[]>;
}

