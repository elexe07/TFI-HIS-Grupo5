import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
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
import type { AgendaDto } from '../application/agenda.dto';
import { DefinirAgendaCommand } from '../application/definir-agenda/definir-agenda.command';
import { DefinirAgendaHandler } from '../application/definir-agenda/definir-agenda.handler';
import { ListarMedicosHandler } from '../application/listar-medicos/listar-medicos.handler';
import type { MedicoDto } from '../application/medico.dto';
import { ObtenerAgendaHandler } from '../application/obtener-agenda/obtener-agenda.handler';
import { ObtenerAgendaQuery } from '../application/obtener-agenda/obtener-agenda.query';
import { RegistrarMedicoCommand } from '../application/registrar-medico/registrar-medico.command';
import { RegistrarMedicoHandler } from '../application/registrar-medico/registrar-medico.handler';
import { DefinirAgendaDto } from './dto/definir-agenda.dto';
import { RegistrarMedicoDto } from './dto/registrar-medico.dto';

@ApiTags('medicos')
@ApiBearerAuth()
@Controller('medicos')
export class MedicosController {
  // eslint-disable-next-line max-params -- inyección de dependencias
  constructor(
    private readonly registrarMedico: RegistrarMedicoHandler,
    private readonly listarMedicos: ListarMedicosHandler,
    private readonly definirAgenda: DefinirAgendaHandler,
    private readonly obtenerAgenda: ObtenerAgendaHandler,
  ) {}

  @Get()
  @RequierePermiso(PERMISOS.PACIENTES_LEER)
  @ApiOperation({ summary: 'Listar médicos del centro de salud' })
  @ApiOkResponse({ description: 'Lista de médicos' })
  @ApiForbiddenResponse({ description: 'PERMISO_FALTANTE' })
  listar(): Promise<MedicoDto[]> {
    return this.listarMedicos.ejecutar();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequierePermiso(PERMISOS.USUARIOS_GESTIONAR)
  @ApiOperation({ summary: 'Registrar un nuevo médico (asociado a un usuario)' })
  @ApiCreatedResponse({ description: 'Médico registrado exitosamente' })
  @ApiConflictResponse({ description: 'MATRICULA_DUPLICADA' })
  @ApiForbiddenResponse({ description: 'PERMISO_FALTANTE: requiere usuarios:gestionar' })
  registrar(@Body() dto: RegistrarMedicoDto): Promise<MedicoDto> {
    return this.registrarMedico.ejecutar(new RegistrarMedicoCommand(dto));
  }

  @Post(':id/agenda')
  @RequierePermiso(PERMISOS.AGENDA_DEFINIR)
  @ApiOperation({ summary: 'Definir agenda semanal del médico (ADM-03)' })
  @ApiOkResponse({ description: 'Agenda configurada exitosamente' })
  @ApiConflictResponse({ description: 'FRANJAS_SOLAPADAS' })
  @ApiNotFoundResponse({ description: 'MEDICO_NO_ENCONTRADO' })
  @ApiForbiddenResponse({ description: 'PERMISO_FALTANTE: requiere agenda:definir' })
  configurarAgenda(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DefinirAgendaDto,
  ): Promise<AgendaDto> {
    return this.definirAgenda.ejecutar(
      new DefinirAgendaCommand({
        medicoId: id,
        franjas: dto.franjas,
      }),
    );
  }

  @Get(':id/agenda')
  @RequierePermiso(PERMISOS.PACIENTES_LEER)
  @ApiOperation({ summary: 'Consultar agenda semanal del médico' })
  @ApiOkResponse({ description: 'Agenda del médico' })
  @ApiNotFoundResponse({ description: 'MEDICO_NO_ENCONTRADO' })
  @ApiForbiddenResponse({ description: 'PERMISO_FALTANTE' })
  consultarAgenda(@Param('id', ParseUUIDPipe) id: string): Promise<AgendaDto> {
    return this.obtenerAgenda.ejecutar(new ObtenerAgendaQuery(id));
  }
}
