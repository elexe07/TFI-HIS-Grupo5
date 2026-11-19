/**
 * Endpoints del módulo Recursos: camas, internaciones e insumos (backend: modules/recursos/api).
 */
import { get, post, patch } from '@/shared/http/client';
import type {
  EstadoCama,
  EstadoInternacion,
  CamaDTO,
  MapaCamasResponse,
  InternacionDTO,
  InternarPacienteRequest,
  InsumoDTO,
} from './recursos.types';

export const recursosApi = {
  // Mapa de camas
  obtenerMapaCamas: () => get<MapaCamasResponse>('/camas/mapa'),
  cambiarEstadoCama: (id: string, estado: EstadoCama) =>
    patch<CamaDTO>(`/camas/${id}/estado`, { estado }),

  // Internaciones
  listarInternaciones: (params?: { estado?: EstadoInternacion }) =>
    get<InternacionDTO[]>('/internaciones', { params }),
  internarPaciente: (data: InternarPacienteRequest) => post<InternacionDTO>('/internaciones', data),
  darAlta: (internacionId: string) => post<void>(`/internaciones/${internacionId}/alta`),

  // Insumos
  listarInsumos: (params?: { bajoMinimo?: boolean }) => get<InsumoDTO[]>('/insumos', { params }),
  ingresarInsumo: (id: string, cantidad: number) =>
    post<InsumoDTO>(`/insumos/${id}/ingresos`, { cantidad }),
  egresarInsumo: (id: string, cantidad: number) =>
    post<InsumoDTO>(`/insumos/${id}/egresos`, { cantidad }),
};
