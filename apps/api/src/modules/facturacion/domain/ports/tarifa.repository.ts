import type { ConceptoCargo } from '../enums';
import type { Tarifa } from '../tarifa';

export const TARIFA_REPOSITORY = Symbol('TARIFA_REPOSITORY');

export interface TarifaRepository {
  buscarPorConcepto(concepto: ConceptoCargo): Promise<Tarifa | null>;
  guardar(tarifa: Tarifa): Promise<void>;
  listarTodas(): Promise<Tarifa[]>;
}

