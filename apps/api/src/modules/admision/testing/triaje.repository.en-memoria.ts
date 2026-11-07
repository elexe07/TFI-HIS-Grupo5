import { Triaje } from '../domain/triaje';
import type { TriajeRepository } from '../domain/triaje.repository';
import { EstadoTriaje } from '../domain/tipos';

export class TriajeRepositoryEnMemoria implements TriajeRepository {
  private readonly triajes = new Map<string, Triaje>();

  guardar(triaje: Triaje): Promise<void> {
    this.triajes.set(triaje.id, triaje);
    return Promise.resolve();
  }

  buscarPorId(id: string): Promise<Triaje | null> {
    return Promise.resolve(this.triajes.get(id) ?? null);
  }

  obtenerColaGuardia(): Promise<Triaje[]> {
    const enEspera = [...this.triajes.values()].filter((t) => t.estado === EstadoTriaje.EN_ESPERA);
    enEspera.sort(Triaje.compararParaCola);
    return Promise.resolve(enEspera);
  }
}

