import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PERMISOS, RequierePermiso } from '../../iam/public';
import type { ResumenOcupacion } from '../domain/ports/consultor-de-ocupacion';
import type { ReporteFacturacionPeriodo } from '../domain/ports/reporte-facturacion.repository';
import { ReporteFacturacionHandler } from '../application/reportes/reporte-facturacion.handler';
import { ReporteOcupacionHandler } from '../application/reportes/reporte-ocupacion.handler';
import { RangoFechasDto } from './dto/rango-fechas.dto';

@ApiTags('facturacion')
@ApiBearerAuth()
@ApiForbiddenResponse({ description: 'PERMISO_FALTANTE: requiere reportes:leer' })
@RequierePermiso(PERMISOS.REPORTES_LEER)
@Controller('reportes')
export class ReportesController {
  constructor(
    private readonly reporteFacturacionHandler: ReporteFacturacionHandler,
    private readonly reporteOcupacionHandler: ReporteOcupacionHandler,
  ) {}

  @Get('facturacion')
  @ApiOperation({ summary: 'Reporte de facturación por período' })
  @ApiOkResponse({ description: 'Totales facturados discriminados por concepto' })
  async obtenerReporteFacturacion(
    @Query() query: RangoFechasDto,
  ): Promise<any> {
    const raw = await this.reporteFacturacionHandler.ejecutar({
      desde: new Date(query.desde),
      hasta: new Date(query.hasta),
    });

    const porConcepto: Record<string, { cantidad: number; monto: number }> = {};
    let totalCargos = 0;
    let totalMonto = raw.granTotal ?? 0;

    for (const item of raw.items || []) {
      porConcepto[item.concepto] = {
        cantidad: item.cantidadTotal,
        monto: item.montoTotal,
      };
      totalCargos += item.cantidadTotal;
    }

    const porObraSocial: Record<string, { cantidad: number; monto: number }> = {};
    for (const item of raw.porObraSocial || []) {
      porObraSocial[item.obraSocial] = {
        cantidad: item.cantidad,
        monto: item.monto,
      };
    }

    return {
      desde: raw.desde,
      hasta: raw.hasta,
      totalCargos,
      totalMonto,
      porConcepto,
      porObraSocial,
      items: raw.items,
      granTotal: raw.granTotal,
    };
  }

  @Get('ocupacion')
  @ApiOperation({ summary: 'Reporte de ocupación hospitalaria' })
  @ApiOkResponse({ description: 'Estado actual de ocupación de camas' })
  async obtenerReporteOcupacion(): Promise<any> {
    const res = await this.reporteOcupacionHandler.ejecutar();
    return {
      ...res,
      porSector: (res as any).porSector ?? {
        General: {
          total: res.totalCamas,
          ocupadas: res.ocupadas,
          porcentaje: res.porcentajeOcupacion,
        },
      },
    };
  }
}
