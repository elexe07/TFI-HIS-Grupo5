/**
 * Tipos del portal del paciente. Turnos, médicos y paciente reutilizan los de Admisión (coinciden
 * con la API); la cuenta se define acá porque el portal usa los totales que calcula el backend
 * (backend: facturacion/application/consultar-cuenta/cuenta-detalle.dto.ts).
 */
import type {
  ConceptoCargo,
  EstadoCuenta,
  TipoCuenta,
} from '@/modules/facturacion/facturacion.types';

export interface CargoDeCuenta {
  id: string;
  concepto: ConceptoCargo;
  descripcion: string;
  cantidad: number;
  montoUnitario: number;
  montoTotal: number;
  createdAt: string;
}

export interface CuentaDelPaciente {
  id: string;
  pacienteId: string;
  tipo: TipoCuenta;
  estado: EstadoCuenta;
  coberturaValidada: boolean;
  porcentajeCobertura: number | null;
  totalBruto: number;
  totalDescuento: number;
  totalAPagar: number;
  cargos: CargoDeCuenta[];
  createdAt: string;
}
