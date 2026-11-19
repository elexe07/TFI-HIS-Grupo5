/**
 * Tipos del módulo Facturación: cuentas, cargos, pagos, cobertura y reportes.
 */
import type { PacienteDTO } from '@/modules/admision/admision.types';

export type ConceptoCargo = 'CONSULTA' | 'MEDICACION' | 'DIA_CAMA';
export type TipoCuenta = 'CONSULTA' | 'INTERNACION';
export type EstadoCuenta = 'ABIERTA' | 'CERRADA';

export interface ObraSocialDTO {
  id: string;
  codigo: string;
  nombre: string;
  porcentajeCobertura: number;
}

export interface TarifaDTO {
  id: string;
  concepto: ConceptoCargo;
  monto: number;
}

export interface CuentaDTO {
  id: string;
  numero: string;
  pacienteId: string;
  tipo: TipoCuenta;
  referenciaId: string;
  coberturaValidada: boolean;
  porcentajeCobertura: number | null;
  estado: EstadoCuenta;
  createdAt: string;
  updatedAt: string;
  fecha: string;
  cargos: CargoDTO[];
  detalles: CargoDTO[];
  pagos: PagoDTO[];
  total: number;
  pagado: number;
  saldo: number;
  cobertura?: ObraSocialDTO;
  coberturaPorcentaje: number;
  paciente?: PacienteDTO;
}

export interface PagoDTO {
  id: string;
  cuentaId: string;
  fecha: string;
  metodoPago: string;
  monto: number;
  observaciones: string | null;
  createdAt: string;
}

export interface CargoDTO {
  id: string;
  cuentaId: string;
  concepto: ConceptoCargo;
  descripcion: string;
  cantidad: number;
  montoUnitario: number;
  montoTotal: number;
  origenEventoId: string;
  createdAt: string;
}

export interface ValidarCoberturaRequest {
  pacienteId: string;
  codigoObraSocial: string;
  numeroAfiliado: string;
  cuentaId?: string;
}

export interface ValidarCoberturaResponse {
  aprobada: boolean;
  porcentajeCobertura: number;
  motivoRechazo?: string | null;
  mensaje?: string;
  cuentaActualizada?: boolean;
}

export interface ReporteFacturacionDTO {
  desde: string;
  hasta: string;
  totalCargos: number;
  totalMonto: number;
  porConcepto: Record<ConceptoCargo, { cantidad: number; monto: number }>;
  porObraSocial: Record<string, { cantidad: number; monto: number }>;
}

export interface ReporteOcupacionDTO {
  totalCamas: number;
  ocupadas: number;
  libres: number;
  enLimpieza: number;
  bloqueadas: number;
  porcentajeOcupacion: number;
  porSector: Record<string, { total: number; ocupadas: number; porcentaje: number }>;
}
