import type { EventosProcesadosRepository } from '../domain/eventos-procesados.repository';

export class EventosProcesadosRepositoryEnMemoria
  implements EventosProcesadosRepository
{
  private readonly procesados = new Set<string>();

  haSidoProcesado(eventoId: string): Promise<boolean> {
    return Promise.resolve(this.procesados.has(eventoId));
  }

  registrarProcesado(eventoId: string): Promise<void> {
    this.procesados.add(eventoId);
    return Promise.resolve();
  }
}
