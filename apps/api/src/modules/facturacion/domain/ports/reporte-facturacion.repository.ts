import type { ConceptoCargo } from '../enums';

export const REPORTE_FACTURACION_REPOSITORY = Symbol('REPORTE_FACTURACION_REPOSITORY');

export interface ItemReporteFacturacion {
  readonly concepto: ConceptoCargo;
  readonly cantidadTotal: number;
  readonly montoTotal: number;
}

export interface ReporteFacturacionPeriodo {
  readonly desde: Date;
  readonly hasta: Date;
  readonly items: ItemReporteFacturacion[];
  readonly granTotal: number;
}

export interface ReporteFacturacionRepository {
  generarReporte(desde: Date, hasta: Date): Promise<ReporteFacturacionPeriodo>;
}

