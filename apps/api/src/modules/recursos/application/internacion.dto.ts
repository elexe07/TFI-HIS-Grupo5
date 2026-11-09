import type { Internacion } from '../domain';

export interface InternacionDto {
  id: string;
  pacienteId: string;
  camaId: string;
  medicoId: string;
  motivo: string;
  estado: string;
  ingresoEn: string;
  egresoEn: string | null;
  createdAt: string;
}

export function mapearInternacionADto(internacion: Internacion): InternacionDto {
  return {
    id: internacion.id,
    pacienteId: internacion.pacienteId,
    camaId: internacion.camaId,
    medicoId: internacion.medicoId,
    motivo: internacion.motivo,
    estado: internacion.estado,
    ingresoEn: internacion.ingresoEn.toISOString(),
    egresoEn: internacion.egresoEn ? internacion.egresoEn.toISOString() : null,
    createdAt: internacion.createdAt.toISOString(),
  };
}
