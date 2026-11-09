import { Inject, Injectable } from '@nestjs/common';
import type { CasoDeUso } from '../../../../building-blocks/application/caso-de-uso';
import { ErrorDeValidacion } from '../../../../building-blocks/domain';
import {
  REPORTE_FACTURACION_REPOSITORY,
  type ReporteFacturacionPeriodo,
  type ReporteFacturacionRepository,
} from '../../domain/ports/reporte-facturacion.repository';

export interface ReporteFacturacionQuery {
  readonly desde: Date;
  readonly hasta: Date;
}

@Injectable()
export class ReporteFacturacionHandler implements CasoDeUso<
  ReporteFacturacionQuery,
  ReporteFacturacionPeriodo
> {
  constructor(
    @Inject(REPORTE_FACTURACION_REPOSITORY)
    private readonly reporteRepo: ReporteFacturacionRepository,
  ) {}

  async ejecutar(query: ReporteFacturacionQuery): Promise<ReporteFacturacionPeriodo> {
    if (query.hasta < query.desde) {
      throw new ErrorDeValidacion('La fecha hasta no puede ser menor a la fecha desde');
    }
    return this.reporteRepo.generarReporte(query.desde, query.hasta);
  }
}
