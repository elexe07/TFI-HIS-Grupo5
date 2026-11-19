import { Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
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
import { solicitanteDe } from '../../../building-blocks/application';
import { ConsultarCuentaHandler } from '../application/consultar-cuenta/consultar-cuenta.handler';
import { CerrarCuentaManualHandler } from '../application/cerrar-cuenta/cerrar-cuenta.handler';
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
    private readonly cerrarCuentaHandler: CerrarCuentaManualHandler,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar cuentas de un paciente' })
  @ApiOkResponse({ description: 'Listado de cuentas' })
  async listar(
    @Query() query: ConsultarCuentasDto,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ): Promise<CuentaDetalleDto[]> {
    // Si pide un paciente, el caso de uso ignora `pacienteId` y devuelve solo sus cuentas.
    return this.listarCuentasHandler.ejecutar({
      pacienteId: query.pacienteId,
      solicitante: solicitanteDe(usuario),
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una cuenta con sus cargos' })
  @ApiOkResponse({ description: 'Detalle de la cuenta y saldo' })
  @ApiNotFoundResponse({ description: 'CUENTA_NO_ENCONTRADA' })
  @ApiForbiddenResponse({ description: 'CUENTA_AJENA: un paciente pidió una cuenta de otro' })
  async obtenerPorId(
    @Param('id', ParseUUIDPipe) id: string,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ): Promise<CuentaDetalleDto> {
    return this.consultarCuentaHandler.ejecutar({
      cuentaId: id,
      solicitante: solicitanteDe(usuario),
    });
  }

  @Post(':id/cerrar')
  @RequierePermiso(PERMISOS.FACTURACION_GESTIONAR)
  @ApiForbiddenResponse({ description: 'PERMISO_FALTANTE: requiere facturacion:gestionar' })
  @ApiOperation({ summary: 'Cerrar manualmente una cuenta (sea de internación o consulta)' })
  @ApiOkResponse({ description: 'Cuenta cerrada exitosamente' })
  @ApiNotFoundResponse({ description: 'CUENTA_NO_ENCONTRADA' })
  async cerrar(@Param('id', ParseUUIDPipe) id: string): Promise<CuentaDetalleDto> {
    return this.cerrarCuentaHandler.ejecutar(id);
  }
}
