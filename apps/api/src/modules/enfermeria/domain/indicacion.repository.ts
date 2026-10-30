import type { Indicacion } from './indicacion';

export const INDICACION_REPOSITORY = Symbol('INDICACION_REPOSITORY');

export interface FiltrosListarIndicaciones {
  internacionId?: string;
  pacienteId?: string;
  fecha?: Date;
}

export interface IndicacionRepository {
  guardar(indicacion: Indicacion): Promise<void>;
  guardarMuchas(indicaciones: Indicacion[]): Promise<void>;
  buscarPorId(id: string): Promise<Indicacion | null>;
  buscarPorPrescripcionId(prescripcionId: string): Promise<Indicacion[]>;
  listar(filtros?: FiltrosListarIndicaciones): Promise<Indicacion[]>;
  existePorPrescripcionYFecha(prescripcionId: string, programadaPara: Date): Promise<boolean>;
}

