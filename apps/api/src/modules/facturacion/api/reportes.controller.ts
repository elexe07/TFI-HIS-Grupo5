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
  ): Promise<ReporteFacturacionPeriodo> {
    return this.reporteFacturacionHandler.ejecutar({
      desde: new Date(query.desde),
      hasta: new Date(query.hasta),
    });
  }

  @Get('ocupacion')
  @ApiOperation({ summary: 'Reporte de ocupación hospitalaria' })
  @ApiOkResponse({ description: 'Estado actual de ocupación de camas' })
  async obtenerReporteOcupacion(): Promise<ResumenOcupacion> {
    return this.reporteOcupacionHandler.ejecutar();
  }
}
