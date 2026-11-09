import type { Turno } from './turno';

export const TURNO_REPOSITORY = Symbol('TURNO_REPOSITORY');

export interface FiltrosListarTurnos {
  pacienteId?: string;
  medicoId?: string;
  desde?: Date;
  hasta?: Date;
}

export interface TurnoRepository {
  guardar(turno: Turno): Promise<void>;
  buscarPorId(id: string): Promise<Turno | null>;
  buscarSuperpuesto(
    medicoId: string,
    inicio: Date,
    fin: Date,
    excluirTurnoId?: string,
  ): Promise<Turno | null>;
  listar(filtros?: FiltrosListarTurnos): Promise<Turno[]>;
}
