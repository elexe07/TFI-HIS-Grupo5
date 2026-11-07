import type { AgendaMedico } from './agenda';

export const AGENDA_REPOSITORY = Symbol('AGENDA_REPOSITORY');

export interface AgendaRepository {
  guardar(agenda: AgendaMedico): Promise<void>;
  buscarPorMedicoId(medicoId: string): Promise<AgendaMedico | null>;
}
