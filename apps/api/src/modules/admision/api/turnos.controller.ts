import {
  Body,
  Controller,
  Delete,
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
import {
  PERMISOS,
  RequierePermiso,
  UsuarioActual,
  type UsuarioAutenticado,
} from '../../iam/public';
import { CancelarTurnoCommand } from '../application/cancelar-turno/cancelar-turno.command';
import { CancelarTurnoHandler } from '../application/cancelar-turno/cancelar-turno.handler';
import { ListarTurnosHandler } from '../application/listar-turnos/listar-turnos.handler';
import { ListarTurnosQuery } from '../application/listar-turnos/listar-turnos.query';
import { ReservarTurnoCommand } from '../application/reservar-turno/reservar-turno.command';
import { ReservarTurnoHandler } from '../application/reservar-turno/reservar-turno.handler';
import type { TurnoDto } from '../application/turno.dto';
import { ListarTurnosDto } from './dto/listar-turnos.dto';
import { ReservarTurnoDto } from './dto/reservar-turno.dto';

@ApiTags('turnos')
@ApiBearerAuth()
@Controller('turnos')
export class TurnosController {
  constructor(
    private readonly reservarTurno: ReservarTurnoHandler,
    private readonly cancelarTurno: CancelarTurnoHandler,
    private readonly listarTurnos: ListarTurnosHandler,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequierePermiso(PERMISOS.TURNOS_RESERVAR)
  @ApiOperation({ summary: 'Reservar un turno con un médico (ADM-04)' })
  @ApiCreatedResponse({ description: 'Turno reservado exitosamente' })
  @ApiConflictResponse({ description: 'FRANJA_OCUPADA o TURNO_FUERA_DE_AGENDA' })
  @ApiNotFoundResponse({ description: 'PACIENTE_NO_ENCONTRADO o MEDICO_NO_ENCONTRADO' })
  @ApiForbiddenResponse({ description: 'PERMISO_FALTANTE: requiere turnos:reservar' })
  reservar(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Body() dto: ReservarTurnoDto,
  ): Promise<TurnoDto> {
    return this.reservarTurno.ejecutar(
      new ReservarTurnoCommand({
        pacienteId: dto.pacienteId,
        medicoId: dto.medicoId,
        inicio: dto.inicio,
        fin: dto.fin,
        motivoConsulta: dto.motivoConsulta,
        creadoPor: usuario.id,
      }),
    );
  }

  @Delete(':id')
  @RequierePermiso(PERMISOS.TURNOS_CANCELAR)
  @ApiOperation({ summary: 'Cancelar un turno reservado (ADM-05)' })
  @ApiOkResponse({ description: 'Turno cancelado' })
  @ApiConflictResponse({ description: 'TURNO_NO_CANCELABLE: solo turnos en estado RESERVADO' })
  @ApiNotFoundResponse({ description: 'TURNO_NO_ENCONTRADO' })
  @ApiForbiddenResponse({ description: 'PERMISO_FALTANTE o turno de otro paciente' })
  cancelar(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TurnoDto> {
    return this.cancelarTurno.ejecutar(
      new CancelarTurnoCommand({
        turnoId: id,
        usuarioId: usuario.id,
        esPaciente: usuario.rol === 'PACIENTE',
      }),
    );
  }

  @Get()
  @RequierePermiso(PERMISOS.PACIENTES_LEER)
  @ApiOperation({ summary: 'Listar turnos' })
  @ApiOkResponse({ description: 'Lista de turnos' })
  @ApiForbiddenResponse({ description: 'PERMISO_FALTANTE: requiere pacientes:leer' })
  listar(@Query() dto: ListarTurnosDto): Promise<TurnoDto[]> {
    return this.listarTurnos.ejecutar(new ListarTurnosQuery(dto));
  }
}

