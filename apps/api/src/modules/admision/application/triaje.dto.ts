import type { Triaje } from '../domain/triaje';
import type { EstadoTriaje, NivelTriaje } from '../domain/tipos';

export interface TriajeDto {
  id: string;
  pacienteId: string;
  nivel: NivelTriaje;
  prioridad: number;
  motivo: string;
  estado: EstadoTriaje;
  llegadaEn: string;
  registradoPor: string;
}

export function aTriajeDto(t: Triaje): TriajeDto {
  return {
    id: t.id,
    pacienteId: t.pacienteId,
    nivel: t.nivel,
    prioridad: t.prioridad,
    motivo: t.motivo,
    estado: t.estado,
    llegadaEn: t.llegadaEn.toISOString(),
    registradoPor: t.registradoPor,
  };
}

