import type { NotaDeEnfermeria } from './nota-enfermeria';

export const NOTA_ENFERMERIA_REPOSITORY = Symbol('NOTA_ENFERMERIA_REPOSITORY');

export interface FiltrosNotasEnfermeria {
  pacienteId?: string;
  internacionId?: string;
}

/**
 * Puerto para persistir notas de enfermería (inmutable).
 * No contiene métodos de actualización ni borrado.
 */
export interface NotaEnfermeriaRepository {
  guardar(nota: NotaDeEnfermeria): Promise<void>;
  listar(filtros: FiltrosNotasEnfermeria): Promise<NotaDeEnfermeria[]>;
}

