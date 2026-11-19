import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { solicitanteDe } from '../../../building-blocks/application';
import {
  PERMISOS,
  RequierePermiso,
  UsuarioActual,
  type UsuarioAutenticado,
} from '../../iam/public';
import { BuscarPacientePorIdHandler } from '../application/buscar-paciente-por-id/buscar-paciente-por-id.handler';
import { BuscarPacientePorIdQuery } from '../application/buscar-paciente-por-id/buscar-paciente-por-id.query';
import { BuscarPacientesHandler } from '../application/buscar-pacientes/buscar-pacientes.handler';
import { BuscarPacientesQuery } from '../application/buscar-pacientes/buscar-pacientes.query';
import { ObtenerPacienteDelUsuarioHandler } from '../application/obtener-paciente-del-usuario/obtener-paciente-del-usuario.handler';
import { ObtenerPacienteDelUsuarioQuery } from '../application/obtener-paciente-del-usuario/obtener-paciente-del-usuario.query';
import type { PacienteDto } from '../application/paciente.dto';
import { RegistrarPacienteCommand } from '../application/registrar-paciente/registrar-paciente.command';
import { RegistrarPacienteHandler } from '../application/registrar-paciente/registrar-paciente.handler';
import { VincularUsuarioCommand } from '../application/vincular-usuario/vincular-usuario.command';
import { VincularUsuarioHandler } from '../application/vincular-usuario/vincular-usuario.handler';
import { BuscarPacientesDto } from './dto/buscar-pacientes.dto';
import { RegistrarPacienteDto } from './dto/registrar-paciente.dto';
import { VincularUsuarioDto } from './dto/vincular-usuario.dto';

@ApiTags('pacientes')
@ApiBearerAuth()
@Controller('pacientes')
export class PacientesController {
  constructor(
    private readonly registrarPaciente: RegistrarPacienteHandler,
    private readonly buscarPacientes: BuscarPacientesHandler,
    private readonly buscarPorId: BuscarPacientePorIdHandler,
    private readonly obtenerDelUsuario: ObtenerPacienteDelUsuarioHandler,
    private readonly vincularUsuario: VincularUsuarioHandler,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequierePermiso(PERMISOS.PACIENTES_REGISTRAR)
  @ApiOperation({ summary: 'Registrar un nuevo paciente (ADM-01)' })
  @ApiCreatedResponse({ description: 'Paciente registrado exitosamente' })
  @ApiConflictResponse({ description: 'DOCUMENTO_DUPLICADO' })
  @ApiForbiddenResponse({ description: 'PERMISO_FALTANTE: requiere pacientes:registrar' })
  registrar(@Body() dto: RegistrarPacienteDto): Promise<PacienteDto> {
    return this.registrarPaciente.ejecutar(new RegistrarPacienteCommand(dto));
  }

  @Get()
  @RequierePermiso(PERMISOS.PACIENTES_LEER)
  @ApiOperation({ summary: 'Buscar pacientes por documento o apellido (ADM-02)' })
  @ApiOkResponse({ description: 'Lista de pacientes encontrados' })
  @ApiForbiddenResponse({ description: 'PERMISO_FALTANTE: requiere pacientes:leer' })
  buscar(
    @Query() dto: BuscarPacientesDto,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ): Promise<PacienteDto[]> {
    return this.buscarPacientes.ejecutar(new BuscarPacientesQuery(dto, solicitanteDe(usuario)));
  }

  // Va antes de ':id' para que Nest no intente parsear "yo" como UUID.
  @Get('yo')
  @RequierePermiso(PERMISOS.PACIENTES_LEER)
  @ApiOperation({ summary: 'Mi ficha: el paciente vinculado al usuario logueado (portal)' })
  @ApiOkResponse({ description: 'Ficha del paciente' })
  @ApiNotFoundResponse({ description: 'PACIENTE_NO_VINCULADO' })
  miFicha(@UsuarioActual() usuario: UsuarioAutenticado): Promise<PacienteDto> {
    return this.obtenerDelUsuario.ejecutar(new ObtenerPacienteDelUsuarioQuery(usuario.id));
  }

  @Get(':id')
  @RequierePermiso(PERMISOS.PACIENTES_LEER)
  @ApiOperation({ summary: 'Buscar paciente por ID' })
  @ApiOkResponse({ description: 'Paciente encontrado' })
  @ApiNotFoundResponse({ description: 'PACIENTE_NO_ENCONTRADO' })
  @ApiForbiddenResponse({ description: 'PERMISO_FALTANTE: requiere pacientes:leer' })
  obtener(
    @Param('id', ParseUUIDPipe) id: string,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ): Promise<PacienteDto> {
    return this.buscarPorId.ejecutar(new BuscarPacientePorIdQuery(id, solicitanteDe(usuario)));
  }

  @Patch(':id/usuario')
  @RequierePermiso(PERMISOS.PACIENTES_REGISTRAR)
  @ApiOperation({ summary: 'Vincular la ficha con su usuario del portal (rol PACIENTE)' })
  @ApiOkResponse({ description: 'Ficha vinculada' })
  @ApiNotFoundResponse({ description: 'PACIENTE_NO_ENCONTRADO' })
  @ApiConflictResponse({ description: 'PACIENTE_YA_VINCULADO o USUARIO_YA_VINCULADO' })
  vincular(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: VincularUsuarioDto,
  ): Promise<PacienteDto> {
    return this.vincularUsuario.ejecutar(new VincularUsuarioCommand(id, dto.usuarioId));
  }
}
