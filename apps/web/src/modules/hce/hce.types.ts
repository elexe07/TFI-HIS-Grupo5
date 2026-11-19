/**
 * Tipos del módulo HCE: historia clínica, evoluciones, alergias, antecedentes, prescripciones y estudios.
 */
import type { NivelTriaje, EstadoTriaje } from '@/modules/admision/admision.types';

export type SeveridadAlergia = 'LEVE' | 'MODERADA' | 'GRAVE';
export type EstadoPrescripcion = 'ACTIVA' | 'SUSPENDIDA' | 'FINALIZADA';
export type TipoEstudio = 'LABORATORIO' | 'IMAGEN' | 'OTRO';

export interface HistoriaClinicaDTO {
  id: string;
  pacienteId: string;
  origenEventoId: string;
  createdAt: string;
  evoluciones: EvolucionDTO[];
  alergias: AlergiaDTO[];
  antecedentes: AntecedenteFamiliarDTO[];
  prescripciones: PrescripcionDTO[];
  estudios: EstudioDTO[];
  triajes?: {
    id: string;
    nivel: NivelTriaje;
    motivo: string;
    estado: EstadoTriaje;
    llegadaEn: string;
  }[];
}

export interface EvolucionDTO {
  id: string;
  historiaId: string;
  turnoId: string | null;
  internacionId: string | null;
  medicoId: string;
  motivo: string;
  diagnostico: string;
  tratamiento: string | null;
  registradoEn: string;
  medicoNombre?: string;
}

export interface CrearEvolucionRequest {
  historiaId?: string;
  turnoId?: string;
  internacionId?: string;
  motivo: string;
  diagnostico: string;
  tratamiento?: string;
}

export interface AlergiaDTO {
  id: string;
  historiaId: string;
  sustancia: string;
  severidad: SeveridadAlergia;
  registradoEn: string;
  registradoPor: string;
}

export interface CrearAlergiaRequest {
  historiaId?: string;
  sustancia: string;
  severidad: SeveridadAlergia;
}

export interface AntecedenteFamiliarDTO {
  id: string;
  historiaId: string;
  parentesco: string;
  condicion: string;
  registradoEn: string;
  registradoPor: string;
}

export interface CrearAntecedenteRequest {
  historiaId?: string;
  parentesco: string;
  condicion: string;
}

export interface PrescripcionDTO {
  id: string;
  historiaId: string;
  evolucionId: string | null;
  medicoId: string;
  medicamento: string;
  dosis: string;
  frecuenciaHoras: number;
  duracionDias: number;
  estado: EstadoPrescripcion;
  createdAt: string;
  updatedAt: string;
  medicoNombre?: string;
}

export interface CrearPrescripcionRequest {
  historiaId?: string;
  evolucionId?: string;
  medicamento: string;
  dosis: string;
  frecuenciaHoras: number;
  duracionDias: number;
}

export interface EstudioDTO {
  id: string;
  historiaId: string;
  tipo: TipoEstudio;
  descripcion: string;
  resultado: string | null;
  fecha: string;
  registradoPor: string;
  createdAt: string;
}

export interface CrearEstudioRequest {
  historiaId?: string;
  tipo: TipoEstudio;
  descripcion: string;
  resultado?: string;
  fecha: string; // YYYY-MM-DD
}
