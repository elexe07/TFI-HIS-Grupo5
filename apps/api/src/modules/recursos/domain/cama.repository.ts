import type { Id } from '../../../building-blocks/domain';
import type { Cama } from './cama';

export interface CamaRepository {
  buscarPorId(id: Id): Promise<Cama | null>;
  buscarPorCodigo(codigo: string): Promise<Cama | null>;
  listarTodas(): Promise<Cama[]>;
  guardar(cama: Cama): Promise<void>;
}
