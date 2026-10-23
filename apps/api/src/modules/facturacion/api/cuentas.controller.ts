import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  PERMISOS,
  RequierePermiso,
  UsuarioActual,
  type UsuarioAutenticado,
} from '../../iam/public';
import { ConsultarCuentaHandler } from '../application/consultar-cuenta/consultar-cuenta.handler';
import type { CuentaDetalleDto } from '../application/consultar-cuenta/cuenta-detalle.dto';
import { ListarCuentasPacienteHandler } from '../application/listar-cuentas-paciente/listar-cuentas-paciente.handler';
import { ConsultarCuentasDto } from './dto/consultar-cuentas.dto';

@ApiTags('facturacion')
@ApiBearerAuth()
@ApiForbiddenResponse({ description: 'PERMISO_FALTANTE: requiere facturacion:leer' })
@RequierePermiso(PERMISOS.FACTURACION_LEER)
@Controller('cuentas')
export class CuentasController {
  constructor(
    private readonly consultarCuentaHandler: ConsultarCuentaHandler,
    private readonly listarCuentasHandler: ListarCuentasPacienteHandler,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar cuentas de un paciente' })
  @ApiOkResponse({ description: 'Listado de cuentas' })
  async listar(
    @Query() query: ConsultarCuentasDto,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ): Promise<CuentaDetalleDto[]> {
    // Si es un paciente autenticado, solo puede consultar sus propias cuentas
    const pacienteId = usuario.rol === 'PACIENTE' ? usuario.id : query.pacienteId;

    if (!pacienteId) {
      return [];
    }

    return this.listarCuentasHandler.ejecutar({ pacienteId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una cuenta con sus cargos' })
  @ApiOkResponse({ description: 'Detalle de la cuenta y saldo' })
  @ApiNotFoundResponse({ description: 'CUENTA_NO_ENCONTRADA' })
  async obtenerPorId(@Param('id', ParseUUIDPipe) id: string): Promise<CuentaDetalleDto> {
    return this.consultarCuentaHandler.ejecutar({ cuentaId: id });
  }
}
