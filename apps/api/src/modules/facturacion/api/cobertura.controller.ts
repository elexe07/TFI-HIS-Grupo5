import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PERMISOS, RequierePermiso } from '../../iam/public';
import type { ValidarCoberturaResultado } from '../application/validar-cobertura/validar-cobertura.command';
import { ValidarCoberturaHandler } from '../application/validar-cobertura/validar-cobertura.handler';
import { ValidarCoberturaDto } from './dto/validar-cobertura.dto';

@ApiTags('facturacion')
@ApiBearerAuth()
@ApiForbiddenResponse({ description: 'PERMISO_FALTANTE: requiere cobertura:validar' })
@RequierePermiso(PERMISOS.COBERTURA_VALIDAR)
@Controller('cobertura')
export class CoberturaController {
  constructor(private readonly validarCoberturaHandler: ValidarCoberturaHandler) {}

  @Post('validar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validar cobertura de obra social o seguro' })
  @ApiOkResponse({ description: 'Resultado de la validación' })
  async validar(@Body() dto: ValidarCoberturaDto): Promise<ValidarCoberturaResultado> {
    return this.validarCoberturaHandler.ejecutar({
      pacienteId: dto.pacienteId,
      codigoObraSocial: dto.codigoObraSocial,
      numeroAfiliado: dto.numeroAfiliado,
      cuentaId: dto.cuentaId,
    });
  }
}
