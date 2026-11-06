import type { Paciente } from './paciente';
import type { TipoDocumento } from './tipos';

export const PACIENTE_REPOSITORY = Symbol('PACIENTE_REPOSITORY');

export interface FiltrosBuscarPaciente {
  documento?: string;
  apellido?: string;
}

export interface PacienteRepository {
  guardar(paciente: Paciente): Promise<void>;
  buscarPorId(id: string): Promise<Paciente | null>;
  buscarPorDocumento(tipo: TipoDocumento, numero: string): Promise<Paciente | null>;
  buscarPorUsuarioId(usuarioId: string): Promise<Paciente | null>;
  buscar(filtros: FiltrosBuscarPaciente): Promise<Paciente[]>;
}

