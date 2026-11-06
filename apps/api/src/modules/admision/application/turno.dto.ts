import type { Turno } from '../domain/turno';
import type { EstadoTurno } from '../domain/tipos';

export interface TurnoDto {
  id: string;
  pacienteId: string;
  medicoId: string;
  inicio: string;
  fin: string;
  estado: EstadoTurno;
  motivoConsulta: string | null;
  creadoPor: string;
  createdAt: string;
  updatedAt: string;
}

export function aTurnoDto(t: Turno): TurnoDto {
  return {
    id: t.id,
    pacienteId: t.pacienteId,
    medicoId: t.medicoId,
    inicio: t.inicio.toISOString(),
    fin: t.fin.toISOString(),
    estado: t.estado,
    motivoConsulta: t.motivoConsulta,
    creadoPor: t.creadoPor,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}

