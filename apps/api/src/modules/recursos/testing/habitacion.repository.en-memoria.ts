import type { Id } from '../../../building-blocks/domain';
import type { Habitacion, HabitacionRepository } from '../domain';

export class HabitacionRepositoryEnMemoria implements HabitacionRepository {
  private readonly habitaciones = new Map<Id, Habitacion>();

  guardar(habitacion: Habitacion): Promise<void> {
    this.habitaciones.set(habitacion.id, habitacion);
    return Promise.resolve();
  }

  buscarPorId(id: Id): Promise<Habitacion | null> {
    return Promise.resolve(this.habitaciones.get(id) ?? null);
  }

  listarTodas(): Promise<Habitacion[]> {
    return Promise.resolve([...this.habitaciones.values()]);
  }
}
