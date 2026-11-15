import type { HistoriaClinica } from './historia-clinica';

export const HISTORIA_CLINICA_REPOSITORY = Symbol('HISTORIA_CLINICA_REPOSITORY');

/**
 * PUERTO del repositorio de HCE.
 *
 * Cumpliendo la regla clave de inmutabilidad (ADR-008):
 * - NO TIENE métodos actualizarEvolucion, eliminarEvolucion, etc.
 * - Toda la persistencia es append-only para las evoluciones y antecedentes.
 */
export interface TriajeInfo {
  id: string;
  nivel: string;
  motivo: string;
  estado: string;
  llegadaEn: Date;
}

export interface HistoriaClinicaRepository {
  guardar(historia: HistoriaClinica): Promise<void>;
  buscarPorId(id: string): Promise<HistoriaClinica | null>;
  buscarPorPacienteId(pacienteId: string): Promise<HistoriaClinica | null>;
  buscarPorOrigenEventoId(origenEventoId: string): Promise<HistoriaClinica | null>;
  obtenerTriajesPorPaciente?(pacienteId: string): Promise<TriajeInfo[]>;
}
