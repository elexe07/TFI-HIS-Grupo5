import type { Cuenta } from '../../domain/cuenta';
import type { ConceptoCargo, EstadoCuenta, TipoCuenta } from '../../domain/enums';

export interface CargoDto {
  readonly id: string;
  readonly concepto: ConceptoCargo;
  readonly descripcion: string;
  readonly cantidad: number;
  readonly montoUnitario: number;
  readonly montoTotal: number;
  readonly origenEventoId: string;
  readonly createdAt: string;
}

export interface CuentaDetalleDto {
  readonly id: string;
  readonly pacienteId: string;
  readonly tipo: TipoCuenta;
  readonly referenciaId: string;
  readonly estado: EstadoCuenta;
  readonly coberturaValidada: boolean;
  readonly porcentajeCobertura: number | null;
  readonly totalBruto: number;
  readonly totalDescuento: number;
  readonly totalAPagar: number;
  readonly cargos: CargoDto[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export function mapearCuentaADetalleDto(cuenta: Cuenta): CuentaDetalleDto {
  return {
    id: cuenta.id,
    pacienteId: cuenta.pacienteId,
    tipo: cuenta.tipo,
    referenciaId: cuenta.referenciaId,
    estado: cuenta.estado,
    coberturaValidada: cuenta.coberturaValidada,
    porcentajeCobertura: cuenta.porcentajeCobertura,
    totalBruto: cuenta.calcularTotalBruto(),
    totalDescuento: cuenta.calcularTotalDescuento(),
    totalAPagar: cuenta.calcularTotalAPagar(),
    cargos: cuenta.cargos.map((c) => ({
      id: c.id,
      concepto: c.concepto,
      descripcion: c.descripcion,
      cantidad: c.cantidad,
      montoUnitario: c.montoUnitario,
      montoTotal: c.montoTotal,
      origenEventoId: c.origenEventoId,
      createdAt: c.createdAt.toISOString(),
    })),
    createdAt: cuenta.createdAt.toISOString(),
    updatedAt: cuenta.updatedAt.toISOString(),
  };
}

