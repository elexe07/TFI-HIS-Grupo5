import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PERMISOS, RequierePermiso } from '../../iam/public';
import { ObtenerColaGuardiaHandler } from '../application/obtener-cola-guardia/obtener-cola-guardia.handler';
import type { TriajeDto } from '../application/triaje.dto';

@ApiTags('guardia')
@ApiBearerAuth()
@Controller('guardia')
export class GuardiaController {
  constructor(private readonly obtenerCola: ObtenerColaGuardiaHandler) {}

  @Get('cola')
  @RequierePermiso(PERMISOS.GUARDIA_LEER)
  @ApiOperation({ summary: 'Ver cola de guardia ordenada por prioridad y llegada (ADM-07)' })
  @ApiOkResponse({ description: 'Cola de guardia ordenada' })
  @ApiForbiddenResponse({ description: 'PERMISO_FALTANTE: requiere guardia:leer' })
  verCola(): Promise<TriajeDto[]> {
    return this.obtenerCola.ejecutar();
  }
}

