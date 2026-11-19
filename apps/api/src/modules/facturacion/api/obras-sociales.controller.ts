import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ListarObrasSocialesHandler,
  type ObraSocialDto,
} from '../application/listar-obras-sociales/listar-obras-sociales.handler';
import {
  ListarTarifasHandler,
  type TarifaDto,
} from '../application/listar-tarifas/listar-tarifas.handler';

@ApiTags('facturacion')
@ApiBearerAuth()
@Controller()
export class ObrasSocialesYTarifasController {
  constructor(
    private readonly listarObrasSocialesHandler: ListarObrasSocialesHandler,
    private readonly listarTarifasHandler: ListarTarifasHandler,
  ) {}

  @Get('obras-sociales')
  @ApiOperation({ summary: 'Listar obras sociales' })
  @ApiOkResponse({ description: 'Listado de obras sociales disponibles' })
  listarObrasSociales(): Promise<ObraSocialDto[]> {
    return this.listarObrasSocialesHandler.ejecutar();
  }

  @Get('tarifas')
  @ApiOperation({ summary: 'Listar tarifas vigentes' })
  @ApiOkResponse({ description: 'Listado de tarifas' })
  listarTarifas(): Promise<TarifaDto[]> {
    return this.listarTarifasHandler.ejecutar();
  }
}
