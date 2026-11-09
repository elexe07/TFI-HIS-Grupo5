import type { Id } from '../../../building-blocks/domain';
import type { Internacion } from './internacion';

export interface InternacionRepository {
  buscarPorId(id: Id): Promise<Internacion | null>;
  buscarActivaPorPacienteId(pacienteId: Id): Promise<Internacion | null>;
  buscarActivaPorCamaId(camaId: Id): Promise<Internacion | null>;
  guardar(internacion: Internacion): Promise<void>;
}
