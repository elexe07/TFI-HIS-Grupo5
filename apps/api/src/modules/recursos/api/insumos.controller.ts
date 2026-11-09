import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PERMISOS, RequierePermiso } from '../../iam/public';
import type { InsumoDto } from '../application/insumo.dto';
import { ListarInsumosHandler } from '../application/listar-insumos/listar-insumos.handler';
import { ListarInsumosQuery } from '../application/listar-insumos/listar-insumos.query';
import { RegistrarIngresoInsumoCommand } from '../application/registrar-ingreso-insumo/registrar-ingreso-insumo.command';
import { RegistrarIngresoInsumoHandler } from '../application/registrar-ingreso-insumo/registrar-ingreso-insumo.handler';
import { IngresoInsumoDto } from './dto/ingreso-insumo.dto';
import { EgresoInsumoDto } from './dto/egreso-insumo.dto';
import { ListarInsumosQueryDto } from './dto/listar-insumos-query.dto';
import { RegistrarEgresoInsumoCommand } from '../application/registrar-egreso-insumo/registrar-egreso-insumo.command';
import { RegistrarEgresoInsumoHandler } from '../application/registrar-egreso-insumo/registrar-egreso-insumo.handler';

@ApiTags('insumos')
@ApiBearerAuth()
@RequierePermiso(PERMISOS.INSUMOS_GESTIONAR)
@ApiForbiddenResponse({ description: 'Requiere permiso insumos:gestionar' })
@Controller('insumos')
export class InsumosController {
  constructor(
    private readonly registrarIngresoInsumo: RegistrarIngresoInsumoHandler,
    private readonly registrarEgresoInsumo: RegistrarEgresoInsumoHandler,
    private readonly listarInsumos: ListarInsumosHandler,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar insumos (opcionalmente solo bajo mínimo)' })
  @ApiOkResponse({ description: 'Listado de insumos' })
  listar(@Query() query: ListarInsumosQueryDto): Promise<InsumoDto[]> {
    return this.listarInsumos.ejecutar(new ListarInsumosQuery({ bajoMinimo: query.bajoMinimo }));
  }

  @Post(':id/ingresos')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar ingreso de stock de insumo' })
  @ApiCreatedResponse({ description: 'Stock actualizado exitosamente' })
  @ApiNotFoundResponse({ description: 'INSUMO_NO_ENCONTRADO' })
  registrarIngreso(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: IngresoInsumoDto,
  ): Promise<InsumoDto> {
    return this.registrarIngresoInsumo.ejecutar(
      new RegistrarIngresoInsumoCommand({
        insumoId: id,
        cantidad: dto.cantidad,
      }),
    );
  }

  @Post(':id/egresos')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Registrar egreso o consumo manual de stock de insumo' })
  @ApiOkResponse({ description: 'Stock descontado exitosamente' })
  @ApiNotFoundResponse({ description: 'INSUMO_NO_ENCONTRADO' })
  registrarEgreso(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: EgresoInsumoDto,
  ): Promise<InsumoDto> {
    return this.registrarEgresoInsumo.ejecutar(
      new RegistrarEgresoInsumoCommand({
        insumoId: id,
        cantidad: dto.cantidad,
      }),
    );
  }
}
