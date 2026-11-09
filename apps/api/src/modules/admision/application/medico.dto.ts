import type { Medico } from '../domain/medico';

export interface MedicoDto {
  id: string;
  usuarioId: string;
  matricula: string;
  nombre: string;
  apellido: string;
  especialidad: string;
  nombreCompleto: string;
  createdAt: string;
}

export function aMedicoDto(m: Medico): MedicoDto {
  return {
    id: m.id,
    usuarioId: m.usuarioId,
    matricula: m.matricula,
    nombre: m.nombre,
    apellido: m.apellido,
    especialidad: m.especialidad,
    nombreCompleto: m.nombreCompleto,
    createdAt: m.creadoEn.toISOString(),
  };
}
