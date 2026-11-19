import type { Id } from '../../../building-blocks/domain';
import type { Habitacion } from './habitacion';

export const HABITACION_REPOSITORY = Symbol('HabitacionRepository');

export interface HabitacionRepository {
  buscarPorId(id: Id): Promise<Habitacion | null>;
  listarTodas(): Promise<Habitacion[]>;
  guardar(habitacion: Habitacion): Promise<void>;
}
