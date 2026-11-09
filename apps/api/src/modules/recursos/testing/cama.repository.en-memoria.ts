import type { Id } from '../../../building-blocks/domain';
import type { Cama, CamaRepository } from '../domain';

export class CamaRepositoryEnMemoria implements CamaRepository {
  private readonly camas = new Map<Id, Cama>();

  guardar(cama: Cama): Promise<void> {
    this.camas.set(cama.id, cama);
    return Promise.resolve();
  }

  buscarPorId(id: Id): Promise<Cama | null> {
    return Promise.resolve(this.camas.get(id) ?? null);
  }

  buscarPorCodigo(codigo: string): Promise<Cama | null> {
    const encontrada = [...this.camas.values()].find((c) => c.codigo === codigo);
    return Promise.resolve(encontrada ?? null);
  }

  listarTodas(): Promise<Cama[]> {
    return Promise.resolve([...this.camas.values()]);
  }
}
