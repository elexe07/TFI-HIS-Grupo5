import type { Indicacion } from '../../domain/indicacion';

export interface IndicacionDto {
  id: string;
  internacionId: string;
  pacienteId: string;
  prescripcionId: string;
  descripcion: string;
  programadaPara: Date;
  estado: string;
  motivoOmision: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const mapearIndicacionADto = (indicacion: Indicacion): IndicacionDto => ({
  id: indicacion.id,
  internacionId: indicacion.internacionId,
  pacienteId: indicacion.pacienteId,
  prescripcionId: indicacion.prescripcionId,
  descripcion: indicacion.descripcion,
  programadaPara: indicacion.programadaPara,
  estado: indicacion.estado,
  motivoOmision: indicacion.motivoOmision,
  createdAt: indicacion.createdAt,
  updatedAt: indicacion.updatedAt,
});

