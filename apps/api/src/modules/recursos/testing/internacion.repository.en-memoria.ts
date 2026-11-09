import type { Id } from '../../../building-blocks/domain';
import { EstadoInternacion, type Internacion, type InternacionRepository } from '../domain';

export class InternacionRepositoryEnMemoria implements InternacionRepository {
  private readonly internaciones = new Map<Id, Internacion>();

  guardar(internacion: Internacion): Promise<void> {
    this.internaciones.set(internacion.id, internacion);
    return Promise.resolve();
  }

  buscarPorId(id: Id): Promise<Internacion | null> {
    return Promise.resolve(this.internaciones.get(id) ?? null);
  }

  buscarActivaPorPacienteId(pacienteId: Id): Promise<Internacion | null> {
    const activa = [...this.internaciones.values()].find(
      (i) => i.pacienteId === pacienteId && i.estado === EstadoInternacion.ACTIVA,
    );
    return Promise.resolve(activa ?? null);
  }

  buscarActivaPorCamaId(camaId: Id): Promise<Internacion | null> {
    const activa = [...this.internaciones.values()].find(
      (i) => i.camaId === camaId && i.estado === EstadoInternacion.ACTIVA,
    );
    return Promise.resolve(activa ?? null);
  }

  buscarTodas(params?: { estado?: string }): Promise<Internacion[]> {
    let list = [...this.internaciones.values()];
    if (params?.estado) {
      list = list.filter((i) => i.estado === params.estado);
    }
    return Promise.resolve(list);
  }
}
