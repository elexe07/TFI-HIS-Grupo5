/**
 * Endpoints del módulo Enfermería: indicaciones, signos vitales y notas (backend: modules/enfermeria/api).
 */
import { get, post } from '@/shared/http/client';
import type {
  EstadoIndicacion,
  IndicacionDTO,
  GenerarIndicacionesRequest,
  GenerarIndicacionesResponse,
  SignosVitalesDTO,
  RegistrarSignosVitalesRequest,
  AdministracionMedicacionDTO,
  NotaEnfermeriaDTO,
  RegistrarNotaEnfermeriaRequest,
} from './enfermeria.types';

export const enfermeriaApi = {
  // Indicaciones
  listarIndicaciones: (params: { pacienteId: string; estado?: EstadoIndicacion }) =>
    get<IndicacionDTO[]>('/enfermeria/indicaciones', { params }),
  generarIndicaciones: (data: GenerarIndicacionesRequest) =>
    post<GenerarIndicacionesResponse>('/enfermeria/indicaciones/generar', data),
  administrarIndicacion: (id: string) =>
    post<AdministracionMedicacionDTO>(`/enfermeria/indicaciones/${id}/administrar`),
  omitirIndicacion: (id: string, motivo: string) =>
    post<IndicacionDTO>(`/enfermeria/indicaciones/${id}/omitir`, { motivo }),

  // Signos vitales
  listarSignosVitales: (params: { pacienteId: string }) =>
    get<SignosVitalesDTO[]>('/enfermeria/signos-vitales', { params }),
  registrarSignosVitales: (data: RegistrarSignosVitalesRequest) =>
    post<SignosVitalesDTO>('/enfermeria/signos-vitales', data),

  // Notas
  listarNotas: (params: { pacienteId: string }) =>
    get<NotaEnfermeriaDTO[]>('/enfermeria/notas', { params }),
  crearNota: (data: RegistrarNotaEnfermeriaRequest) =>
    post<NotaEnfermeriaDTO>('/enfermeria/notas', data),
};
