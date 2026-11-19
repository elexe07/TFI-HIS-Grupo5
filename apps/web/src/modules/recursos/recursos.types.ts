/**
 * Tipos del módulo Recursos: habitaciones, camas, internaciones e insumos.
 */
import type { PacienteDTO, MedicoDTO } from '@/modules/admision/admision.types';

export type EstadoCama = 'LIBRE' | 'OCUPADA' | 'EN_LIMPIEZA' | 'BLOQUEADA';
export type EstadoInternacion = 'ACTIVA' | 'ALTA';

export interface HabitacionDTO {
  id: string;
  sector: string;
  numero: string;
  camas: CamaDTO[];
}

export interface CamaDTO {
  id: string;
  habitacionId: string;
  codigo: string;
  estado: EstadoCama;
  updatedAt: string;
  habitacion?: HabitacionDTO;
  internacionActiva?: InternacionDTO | null;
}

export interface MapaCamasResponse {
  habitaciones: HabitacionDTO[];
  resumen: {
    total: number;
    libres: number;
    ocupadas: number;
    enLimpieza: number;
    bloqueadas: number;
  };
}

export interface CambiarEstadoCamaRequest {
  estado: EstadoCama;
}

export interface InternacionDTO {
  id: string;
  pacienteId: string;
  camaId: string;
  medicoId: string;
  motivo: string;
  estado: EstadoInternacion;
  ingresoEn: string;
  egresoEn: string | null;
  createdAt: string;
  updatedAt: string;
  paciente?: PacienteDTO;
  cama?: CamaDTO;
  medico?: MedicoDTO;
}

export interface InternarPacienteRequest {
  pacienteId: string;
  camaId: string;
  medicoId: string;
  motivo: string;
}

export interface AltaInternacionRequest {
  internacionId: string;
}

export interface InsumoDTO {
  id: string;
  codigo: string;
  nombre: string;
  medicamentoAsociado: string | null;
  stockActual: number;
  stockMinimo: number;
  updatedAt: string;
}

export interface IngresoInsumoRequest {
  cantidad: number;
}
