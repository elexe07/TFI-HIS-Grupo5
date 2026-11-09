import { Controller, Get, Inject } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  OBRA_SOCIAL_REPOSITORY,
  type ObraSocialRepository,
} from '../domain/ports/obra-social.repository';
import { TARIFA_REPOSITORY, type TarifaRepository } from '../domain/ports/tarifa.repository';

@ApiTags('facturacion')
@ApiBearerAuth()
@Controller()
export class ObrasSocialesYTarifasController {
  constructor(
    @Inject(OBRA_SOCIAL_REPOSITORY)
    private readonly obrasSocialesRepo: ObraSocialRepository,
    @Inject(TARIFA_REPOSITORY)
    private readonly tarifasRepo: TarifaRepository,
  ) {}

  @Get('obras-sociales')
  @ApiOperation({ summary: 'Listar obras sociales' })
  @ApiOkResponse({ description: 'Listado de obras sociales disponibles' })
  async listarObrasSociales() {
    const lista = await this.obrasSocialesRepo.listarTodas();
    return lista.map((os) => ({
      id: os.id,
      codigo: os.codigo,
      nombre: os.nombre,
      porcentajeCobertura: os.porcentajeCobertura,
    }));
  }

  @Get('tarifas')
  @ApiOperation({ summary: 'Listar tarifas vigentes' })
  @ApiOkResponse({ description: 'Listado de tarifas' })
  async listarTarifas() {
    const lista = await this.tarifasRepo.listarTodas();
    return lista.map((t) => ({
      id: t.id,
      concepto: t.concepto,
      monto: t.monto,
    }));
  }
}
