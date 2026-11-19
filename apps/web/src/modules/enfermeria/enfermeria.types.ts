/**
 * Tipos del módulo Enfermería: indicaciones, signos vitales, administración de medicación y notas.
 */
import type { PrescripcionDTO } from '@/modules/hce/hce.types';

export type EstadoIndicacion = 'PENDIENTE' | 'EJECUTADA' | 'OMITIDA';

export interface IndicacionDTO {
  id: string;
  internacionId: string;
  pacienteId: string;
  prescripcionId: string;
  descripcion: string;
  programadaPara: string;
  estado: EstadoIndicacion;
  motivoOmision: string | null;
  createdAt: string;
  updatedAt: string;
  prescripcion?: PrescripcionDTO;
}

export interface GenerarIndicacionesRequest {
  prescripcionId: string;
  pacienteId: string;
  internacionId: string;
  medicamento: string;
  dosis: string;
  frecuenciaHoras: number;
  duracionDias: number;
  inicioEn: string;
}

export interface GenerarIndicacionesResponse {
  generadas: number;
}

export interface SignosVitalesDTO {
  id: string;
  pacienteId: string;
  internacionId: string | null;
  temperatura: number | null;
  presionSistolica: number | null;
  presionDiastolica: number | null;
  frecuenciaCardiaca: number | null;
  saturacionO2: number | null;
  registradoEn: string;
  registradoPor: string;
}

export interface RegistrarSignosVitalesRequest {
  pacienteId: string;
  internacionId?: string;
  temperatura?: number;
  presionSistolica?: number;
  presionDiastolica?: number;
  frecuenciaCardiaca?: number;
  saturacionO2?: number;
}

export interface AdministracionMedicacionDTO {
  id: string;
  indicacionId: string;
  pacienteId: string;
  medicamento: string;
  administradaEn: string;
  administradaPor: string;
}

export interface NotaEnfermeriaDTO {
  id: string;
  pacienteId: string;
  internacionId: string | null;
  texto: string;
  registradoEn: string;
  registradoPor: string;
}

export interface RegistrarNotaEnfermeriaRequest {
  pacienteId: string;
  internacionId?: string;
  texto: string;
}

export interface OmitirIndicacionRequest {
  motivo: string;
}
