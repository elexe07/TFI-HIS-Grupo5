import type { AdministracionDeMedicacion } from './administracion-medicacion';

export const ADMINISTRACION_MEDICACION_REPOSITORY = Symbol('ADMINISTRACION_MEDICACION_REPOSITORY');

/**
 * Puerto para persistir administraciones de medicación (inmutable).
 * No contiene métodos de actualización ni borrado.
 */
export interface AdministracionMedicacionRepository {
  guardar(administracion: AdministracionDeMedicacion): Promise<void>;
  buscarPorIndicacionId(indicacionId: string): Promise<AdministracionDeMedicacion | null>;
  listarPorPaciente(pacienteId: string): Promise<AdministracionDeMedicacion[]>;
}

