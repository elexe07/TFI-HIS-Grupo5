/**
 * Endpoints del módulo Facturación: cuentas, pagos, cobertura y reportes (backend: modules/facturacion/api).
 */
import { get, post } from '@/shared/http/client';
import type {
  ObraSocialDTO,
  TarifaDTO,
  CuentaDTO,
  PagoDTO,
  ValidarCoberturaRequest,
  ValidarCoberturaResponse,
  ReporteFacturacionDTO,
  ReporteOcupacionDTO,
} from './facturacion.types';

export const facturacionApi = {
  // Cuentas
  listarCuentas: (params?: { pacienteId?: string }) => get<CuentaDTO[]>('/cuentas', { params }),
  obtenerCuenta: (id: string) => get<CuentaDTO>(`/cuentas/${id}`),
  cerrarCuenta: (id: string) => post<CuentaDTO>(`/cuentas/${id}/cerrar`),

  // Pagos
  registrarPago: (
    cuentaId: string,
    data: { monto: number; metodoPago: string; observaciones?: string },
  ) => post<PagoDTO>(`/cuentas/${cuentaId}/pagos`, data),

  // Cobertura
  validarCobertura: (data: ValidarCoberturaRequest) =>
    post<ValidarCoberturaResponse>('/cobertura/validar', data),

  // Reportes
  reporteFacturacion: (desde: string, hasta: string) =>
    get<ReporteFacturacionDTO>('/reportes/facturacion', {
      params: { desde, hasta },
    }),
  reporteOcupacion: () => get<ReporteOcupacionDTO>('/reportes/ocupacion'),

  // Tarifas y obras sociales (admin)
  listarObrasSociales: () => get<ObraSocialDTO[]>('/obras-sociales'),
  listarTarifas: () => get<TarifaDTO[]>('/tarifas'),
};
