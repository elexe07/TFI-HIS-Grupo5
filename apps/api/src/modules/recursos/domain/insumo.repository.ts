import type { Id } from '../../../building-blocks/domain';
import type { Insumo } from './insumo';

export interface FiltroInsumos {
  bajoMinimo?: boolean;
}

export interface InsumoRepository {
  buscarPorId(id: Id): Promise<Insumo | null>;
  buscarPorCodigo(codigo: string): Promise<Insumo | null>;
  buscarPorMedicamentoAsociado(medicamento: string): Promise<Insumo | null>;
  listar(filtro?: FiltroInsumos): Promise<Insumo[]>;
  guardar(insumo: Insumo): Promise<void>;
}
