/**
 * Endpoints del módulo HCE: historia clínica y sus registros (backend: modules/hce/api).
 */
import { get, post } from '@/shared/http/client';
import type {
  HistoriaClinicaDTO,
  EvolucionDTO,
  CrearEvolucionRequest,
  AlergiaDTO,
  CrearAlergiaRequest,
  AntecedenteFamiliarDTO,
  CrearAntecedenteRequest,
  PrescripcionDTO,
  CrearPrescripcionRequest,
  EstudioDTO,
  CrearEstudioRequest,
} from './hce.types';

export const hceApi = {
  obtenerHistoria: (pacienteId: string) =>
    get<HistoriaClinicaDTO>(`/pacientes/${pacienteId}/historia`),

  // Evoluciones
  crearEvolucion: (pacienteId: string, data: Partial<CrearEvolucionRequest>) =>
    post<EvolucionDTO>(`/pacientes/${pacienteId}/historia/evoluciones`, data),

  // Alergias
  crearAlergia: (pacienteId: string, data: Partial<CrearAlergiaRequest>) =>
    post<AlergiaDTO>(`/pacientes/${pacienteId}/historia/alergias`, data),

  // Antecedentes
  crearAntecedente: (pacienteId: string, data: Partial<CrearAntecedenteRequest>) =>
    post<AntecedenteFamiliarDTO>(`/pacientes/${pacienteId}/historia/antecedentes`, data),

  // Prescripciones
  crearPrescripcion: (pacienteId: string, data: Partial<CrearPrescripcionRequest>) =>
    post<PrescripcionDTO>(`/pacientes/${pacienteId}/historia/prescripciones`, data),

  // Estudios
  crearEstudio: (pacienteId: string, data: Partial<CrearEstudioRequest>) =>
    post<EstudioDTO>(`/pacientes/${pacienteId}/historia/estudios`, data),
};
