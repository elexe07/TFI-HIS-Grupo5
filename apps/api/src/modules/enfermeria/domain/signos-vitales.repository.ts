import type { SignosVitales } from './signos-vitales';

export const SIGNOS_VITALES_REPOSITORY = Symbol('SIGNOS_VITALES_REPOSITORY');

export interface FiltrosSignosVitales {
  pacienteId?: string;
  internacionId?: string;
}

/**
 * Puerto para persistir signos vitales (inmutable).
 * No contiene métodos de actualización ni borrado.
 */
export interface SignosVitalesRepository {
  guardar(signosVitales: SignosVitales): Promise<void>;
  listar(filtros: FiltrosSignosVitales): Promise<SignosVitales[]>;
}

