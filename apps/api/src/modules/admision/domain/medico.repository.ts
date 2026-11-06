import type { Medico } from './medico';

export const MEDICO_REPOSITORY = Symbol('MEDICO_REPOSITORY');

export interface MedicoRepository {
  guardar(medico: Medico): Promise<void>;
  buscarPorId(id: string): Promise<Medico | null>;
  buscarPorUsuarioId(usuarioId: string): Promise<Medico | null>;
  buscarPorMatricula(matricula: string): Promise<Medico | null>;
  listar(): Promise<Medico[]>;
}

