import { Body, Controller, Get, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PERMISOS, RequierePermiso } from '../../iam/public';
import type { CamaDto } from '../application/cama.dto';
import { CambiarEstadoCamaCommand } from '../application/cambiar-estado-cama/cambiar-estado-cama.command';
import { CambiarEstadoCamaHandler } from '../application/cambiar-estado-cama/cambiar-estado-cama.handler';
import type { MapaCamasDto } from '../application/obtener-mapa-camas/mapa-camas.dto';
import { ObtenerMapaCamasHandler } from '../application/obtener-mapa-camas/obtener-mapa-camas.handler';
import { ObtenerMapaCamasQuery } from '../application/obtener-mapa-camas/obtener-mapa-camas.query';
import { CambiarEstadoCamaDto } from './dto/cambiar-estado-cama.dto';

@ApiTags('camas')
@ApiBearerAuth()
@Controller('camas')
export class CamasController {
  constructor(
    private readonly obtenerMapaCamas: ObtenerMapaCamasHandler,
    private readonly cambiarEstadoCama: CambiarEstadoCamaHandler,
  ) {}

  @Get('mapa')
  @RequierePermiso(PERMISOS.CAMAS_LEER)
  @ApiOperation({ summary: 'Obtener mapa de camas con totales por estado' })
  @ApiOkResponse({ description: 'Mapa de camas con conteo y detalle por habitación' })
  @ApiForbiddenResponse({ description: 'Requiere permiso camas:leer' })
  obtenerMapa(): Promise<MapaCamasDto> {
    return this.obtenerMapaCamas.ejecutar(new ObtenerMapaCamasQuery());
  }

  @Patch(':id/estado')
  @RequierePermiso(PERMISOS.CAMAS_GESTIONAR)
  @ApiOperation({ summary: 'Cambiar estado de una cama' })
  @ApiOkResponse({ description: 'Estado de la cama actualizado exitosamente' })
  @ApiNotFoundResponse({ description: 'CAMA_NO_ENCONTRADA' })
  @ApiConflictResponse({ description: 'TRANSICION_CAMA_INVALIDA' })
  @ApiForbiddenResponse({ description: 'Requiere permiso camas:gestionar' })
  cambiarEstado(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CambiarEstadoCamaDto,
  ): Promise<CamaDto> {
    return this.cambiarEstadoCama.ejecutar(
      new CambiarEstadoCamaCommand({
        camaId: id,
        nuevoEstado: dto.estado,
      }),
    );
  }
}
