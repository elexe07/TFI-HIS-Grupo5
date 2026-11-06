import type { AgendaMedico } from '../domain/agenda';
import type { AgendaRepository } from '../domain/agenda.repository';

export class AgendaRepositoryEnMemoria implements AgendaRepository {
  private readonly agendas = new Map<string, AgendaMedico>();

  guardar(agenda: AgendaMedico): Promise<void> {
    this.agendas.set(agenda.medicoId, agenda);
    return Promise.resolve();
  }

  buscarPorMedicoId(medicoId: string): Promise<AgendaMedico | null> {
    return Promise.resolve(this.agendas.get(medicoId) ?? null);
  }
}

