import type { Cama, EstadoCama } from '../domain';

export interface CamaDto {
  id: string;
  habitacionId: string;
  codigo: string;
  estado: EstadoCama;
  updatedAt: string;
}

export function mapearCamaADto(cama: Cama): CamaDto {
  return {
    id: cama.id,
    habitacionId: cama.habitacionId,
    codigo: cama.codigo,
    estado: cama.estado,
    updatedAt: cama.updatedAt.toISOString(),
  };
}
