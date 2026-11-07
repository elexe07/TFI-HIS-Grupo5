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
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PERMISOS, RequierePermiso, UsuarioActual, type UsuarioAutenticado } from '../../iam/public';
import {
  ConsultarHistoriaHandler,
  ConsultarHistoriaQuery,
} from '../application/consultar-historia/consultar-historia.handler';
import {
  CrearPrescripcionCommand,
  CrearPrescripcionHandler,
} from '../application/crear-prescripcion/crear-prescripcion.handler';
import type { HistoriaClinicaDto } from '../application/historia-clinica.dto';
import {
  RegistrarAlergiaCommand,
  RegistrarAlergiaHandler,
} from '../application/registrar-alergia/registrar-alergia.handler';
import {
  RegistrarAntecedenteCommand,
  RegistrarAntecedenteHandler,
} from '../application/registrar-antecedente/registrar-antecedente.handler';
import {
  RegistrarEstudioCommand,
  RegistrarEstudioHandler,
} from '../application/registrar-estudio/registrar-estudio.handler';
import {
  RegistrarEvolucionCommand,
  RegistrarEvolucionHandler,
} from '../application/registrar-evolucion/registrar-evolucion.handler';
import {
  CrearPrescripcionDto,
  RegistrarAlergiaDto,
  RegistrarAntecedenteDto,
  RegistrarEstudioDto,
  RegistrarEvolucionDto,
} from './dto/hce.dtos';

@ApiTags('hce')
@ApiBearerAuth()
@Controller('pacientes/:id/historia')
export class HceController {
  constructor(
    private readonly consultarHistoria: ConsultarHistoriaHandler,
    private readonly registrarEvolucion: RegistrarEvolucionHandler,
    private readonly registrarAlergia: RegistrarAlergiaHandler,
    private readonly registrarAntecedente: RegistrarAntecedenteHandler,
    private readonly crearPrescripcion: CrearPrescripcionHandler,
    private readonly registrarEstudio: RegistrarEstudioHandler,
  ) {}

  @Get()
  @RequierePermiso(PERMISOS.HCE_LEER)
  @ApiOperation({ summary: 'Consultar la historia clínica completa de un paciente' })
  @ApiOkResponse({ description: 'Historia clínica detallada' })
  consultar(
    @Param('id', ParseUUIDPipe) pacienteId: string,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ): Promise<HistoriaClinicaDto> {
    return this.consultarHistoria.ejecutar(
      new ConsultarHistoriaQuery(pacienteId, {
        id: usuario.id,
        rol: usuario.rol,
        pacienteId: usuario.rol === 'PACIENTE' ? usuario.id : undefined,
      }),
    );
  }

  @Post('evoluciones')
  @RequierePermiso(PERMISOS.HCE_ESCRIBIR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar una evolución médica (inmutable)' })
  @ApiCreatedResponse({ description: 'Evolución registrada' })
  evolucionar(
    @Param('id', ParseUUIDPipe) pacienteId: string,
    @Body() dto: RegistrarEvolucionDto,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ): Promise<{ id: string }> {
    return this.registrarEvolucion.ejecutar(
      new RegistrarEvolucionCommand(
        pacienteId,
        usuario.id,
        dto.motivo,
        dto.diagnostico,
        dto.tratamiento,
        dto.turnoId,
        dto.internacionId,
      ),
    );
  }

  @Post('alergias')
  @RequierePermiso(PERMISOS.HCE_ESCRIBIR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar una alergia' })
  @ApiCreatedResponse({ description: 'Alergia registrada' })
  alergia(
    @Param('id', ParseUUIDPipe) pacienteId: string,
    @Body() dto: RegistrarAlergiaDto,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ): Promise<{ id: string }> {
    return this.registrarAlergia.ejecutar(
      new RegistrarAlergiaCommand(
        pacienteId,
        dto.sustancia,
        dto.severidad,
        usuario.id,
      ),
    );
  }

  @Post('antecedentes')
  @RequierePermiso(PERMISOS.HCE_ESCRIBIR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar un antecedente familiar' })
  @ApiCreatedResponse({ description: 'Antecedente registrado' })
  antecedente(
    @Param('id', ParseUUIDPipe) pacienteId: string,
    @Body() dto: RegistrarAntecedenteDto,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ): Promise<{ id: string }> {
    return this.registrarAntecedente.ejecutar(
      new RegistrarAntecedenteCommand(
        pacienteId,
        dto.parentesco,
        dto.condicion,
        usuario.id,
      ),
    );
  }

  @Post('prescripciones')
  @RequierePermiso(PERMISOS.PRESCRIPCIONES_CREAR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una prescripción médica' })
  @ApiCreatedResponse({ description: 'Prescripción creada' })
  prescribir(
    @Param('id', ParseUUIDPipe) pacienteId: string,
    @Body() dto: CrearPrescripcionDto,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ): Promise<{ id: string }> {
    return this.crearPrescripcion.ejecutar(
      new CrearPrescripcionCommand(
        pacienteId,
        usuario.id,
        dto.medicamento,
        dto.dosis,
        dto.frecuenciaHoras,
        dto.duracionDias,
        dto.evolucionId,
        dto.internacionId,
      ),
    );
  }

  @Post('estudios')
  @RequierePermiso(PERMISOS.HCE_ESCRIBIR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar un estudio complementario' })
  @ApiCreatedResponse({ description: 'Estudio registrado' })
  estudio(
    @Param('id', ParseUUIDPipe) pacienteId: string,
    @Body() dto: RegistrarEstudioDto,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ): Promise<{ id: string }> {
    return this.registrarEstudio.ejecutar(
      new RegistrarEstudioCommand(
        pacienteId,
        dto.tipo,
        dto.descripcion,
        new Date(dto.fecha),
        usuario.id,
        dto.resultado,
      ),
    );
  }
}

