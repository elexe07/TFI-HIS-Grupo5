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
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PERMISOS, RequierePermiso } from '../../iam/public';
import { BuscarPacientePorIdHandler } from '../application/buscar-paciente-por-id/buscar-paciente-por-id.handler';
import { BuscarPacientePorIdQuery } from '../application/buscar-paciente-por-id/buscar-paciente-por-id.query';
import { BuscarPacientesHandler } from '../application/buscar-pacientes/buscar-pacientes.handler';
import { BuscarPacientesQuery } from '../application/buscar-pacientes/buscar-pacientes.query';
import type { PacienteDto } from '../application/paciente.dto';
import { RegistrarPacienteCommand } from '../application/registrar-paciente/registrar-paciente.command';
import { RegistrarPacienteHandler } from '../application/registrar-paciente/registrar-paciente.handler';
import { BuscarPacientesDto } from './dto/buscar-pacientes.dto';
import { RegistrarPacienteDto } from './dto/registrar-paciente.dto';

@ApiTags('pacientes')
@ApiBearerAuth()
@Controller('pacientes')
export class PacientesController {
  constructor(
    private readonly registrarPaciente: RegistrarPacienteHandler,
    private readonly buscarPacientes: BuscarPacientesHandler,
    private readonly buscarPorId: BuscarPacientePorIdHandler,
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
  buscar(@Query() dto: BuscarPacientesDto): Promise<PacienteDto[]> {
    return this.buscarPacientes.ejecutar(new BuscarPacientesQuery(dto));
  }

  @Get(':id')
  @RequierePermiso(PERMISOS.PACIENTES_LEER)
  @ApiOperation({ summary: 'Buscar paciente por ID' })
  @ApiOkResponse({ description: 'Paciente encontrado' })
  @ApiNotFoundResponse({ description: 'PACIENTE_NO_ENCONTRADO' })
  @ApiForbiddenResponse({ description: 'PERMISO_FALTANTE: requiere pacientes:leer' })
  obtener(@Param('id', ParseUUIDPipe) id: string): Promise<PacienteDto> {
    return this.buscarPorId.ejecutar(new BuscarPacientePorIdQuery(id));
  }
}
