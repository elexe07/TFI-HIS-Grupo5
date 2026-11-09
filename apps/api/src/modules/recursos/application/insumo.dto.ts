import type { Insumo } from '../domain';

export interface InsumoDto {
  id: string;
  codigo: string;
  nombre: string;
  medicamentoAsociado: string | null;
  stockActual: number;
  stockMinimo: number;
  bajoMinimo: boolean;
  updatedAt: string;
}

export function mapearInsumoADto(insumo: Insumo): InsumoDto {
  return {
    id: insumo.id,
    codigo: insumo.codigo,
    nombre: insumo.nombre,
    medicamentoAsociado: insumo.medicamentoAsociado,
    stockActual: insumo.stockActual,
    stockMinimo: insumo.stockMinimo,
    bajoMinimo: insumo.estaBajoMinimo(),
    updatedAt: insumo.updatedAt.toISOString(),
  };
}
