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
import { PERMISOS, RequierePermiso, UsuarioActual, type UsuarioAutenticado } from '../../iam/public';
import { AdministrarMedicacionCommand } from '../application/administrar-medicacion/administrar-medicacion.command';
import { AdministrarMedicacionHandler } from '../application/administrar-medicacion/administrar-medicacion.handler';
import {
  GenerarIndicacionesCommand,
  type GenerarIndicacionesResultado,
} from '../application/generar-indicaciones/generar-indicaciones.command';
import { GenerarIndicacionesHandler } from '../application/generar-indicaciones/generar-indicaciones.handler';
import { ListarIndicacionesHandler } from '../application/listar-indicaciones/listar-indicaciones.handler';
import { ListarIndicacionesQuery } from '../application/listar-indicaciones/listar-indicaciones.query';
import {
  ListarNotasEnfermeriaHandler,
  ListarNotasEnfermeriaQuery,
} from '../application/listar-notas-enfermeria/listar-notas-enfermeria.handler';
import {
  ListarSignosVitalesHandler,
  ListarSignosVitalesQuery,
} from '../application/listar-signos-vitales/listar-signos-vitales.handler';
import { OmitirIndicacionCommand } from '../application/omitir-indicacion/omitir-indicacion.command';
import { OmitirIndicacionHandler } from '../application/omitir-indicacion/omitir-indicacion.handler';
import { RegistrarNotaEnfermeriaCommand } from '../application/registrar-nota-enfermeria/registrar-nota-enfermeria.command';
import { RegistrarNotaEnfermeriaHandler } from '../application/registrar-nota-enfermeria/registrar-nota-enfermeria.handler';
import { RegistrarSignosVitalesCommand } from '../application/registrar-signos-vitales/registrar-signos-vitales.command';
import { RegistrarSignosVitalesHandler } from '../application/registrar-signos-vitales/registrar-signos-vitales.handler';
import type { AdministracionMedicacionDto } from '../application/dtos/administracion-medicacion.dto';
import type { IndicacionDto } from '../application/dtos/indicacion.dto';
import type { NotaEnfermeriaDto } from '../application/dtos/nota-enfermeria.dto';
import type { SignosVitalesDto } from '../application/dtos/signos-vitales.dto';
import { GenerarIndicacionesDto } from './dto/generar-indicaciones.dto';
import { ListarFiltrosDto } from './dto/listar-filtros.dto';
import { ListarIndicacionesDto } from './dto/listar-indicaciones.dto';
import { OmitirIndicacionDto } from './dto/omitir-indicacion.dto';
import { RegistrarNotaEnfermeriaDto } from './dto/registrar-nota-enfermeria.dto';
import { RegistrarSignosVitalesDto } from './dto/registrar-signos-vitales.dto';

@ApiTags('enfermeria')
@ApiBearerAuth()
@ApiForbiddenResponse({ description: 'PERMISO_FALTANTE: permisos insuficientes' })
@Controller('enfermeria')
export class EnfermeriaController {
  // eslint-disable-next-line max-params
  constructor(
    private readonly generarIndicaciones: GenerarIndicacionesHandler,
    private readonly listarIndicacionesHandler: ListarIndicacionesHandler,
    private readonly administrarMedicacionHandler: AdministrarMedicacionHandler,
    private readonly omitirIndicacionHandler: OmitirIndicacionHandler,
    private readonly registrarSignosVitalesHandler: RegistrarSignosVitalesHandler,
    private readonly listarSignosVitalesHandler: ListarSignosVitalesHandler,
    private readonly registrarNotaHandler: RegistrarNotaEnfermeriaHandler,
    private readonly listarNotasHandler: ListarNotasEnfermeriaHandler,
  ) {}

  @Post('indicaciones/generar')
  @HttpCode(HttpStatus.CREATED)
  @RequierePermiso(PERMISOS.ENFERMERIA_REGISTRAR)
  @ApiOperation({ summary: 'Generar indicaciones a partir de prescripción (manual o test)' })
  @ApiCreatedResponse({ description: 'Indicaciones generadas' })
  generar(@Body() dto: GenerarIndicacionesDto): Promise<GenerarIndicacionesResultado> {
    return this.generarIndicaciones.ejecutar(
      new GenerarIndicacionesCommand({
        prescripcionId: dto.prescripcionId,
        pacienteId: dto.pacienteId,
        internacionId: dto.internacionId,
        medicamento: dto.medicamento,
        dosis: dto.dosis,
        frecuenciaHoras: dto.frecuenciaHoras,
        duracionDias: dto.duracionDias,
        inicioEn: new Date(dto.inicioEn),
      }),
    );
  }

  @Get('indicaciones')
  @RequierePermiso(PERMISOS.ENFERMERIA_LEER)
  @ApiOperation({ summary: 'Listar indicaciones programadas (filtro por internación, paciente, fecha)' })
  @ApiOkResponse({ description: 'Listado de indicaciones' })
  listarIndicaciones(@Query() dto: ListarIndicacionesDto): Promise<IndicacionDto[]> {
    return this.listarIndicacionesHandler.ejecutar(
      new ListarIndicacionesQuery({
        internacionId: dto.internacionId,
        pacienteId: dto.pacienteId,
        fecha: dto.fecha ? new Date(dto.fecha) : undefined,
      }),
    );
  }

  @Post('indicaciones/:id/administrar')
  @HttpCode(HttpStatus.CREATED)
  @RequierePermiso(PERMISOS.ENFERMERIA_REGISTRAR)
  @ApiOperation({ summary: 'Administrar medicación correspondiente a una indicación pendiente' })
  @ApiCreatedResponse({ description: 'Medicación administrada y evento publicado' })
  @ApiNotFoundResponse({ description: 'INDICACION_NO_ENCONTRADA' })
  @ApiConflictResponse({ description: 'INDICACION_NO_ESTA_PENDIENTE o MEDICACION_YA_ADMINISTRADA' })
  administrar(
    @Param('id', ParseUUIDPipe) id: string,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ): Promise<AdministracionMedicacionDto> {
    return this.administrarMedicacionHandler.ejecutar(
      new AdministrarMedicacionCommand(id, usuario.id),
    );
  }

  @Post('indicaciones/:id/omitir')
  @HttpCode(HttpStatus.OK)
  @RequierePermiso(PERMISOS.ENFERMERIA_REGISTRAR)
  @ApiOperation({ summary: 'Omitir indicación médica con motivo obligatorio' })
  @ApiOkResponse({ description: 'Indicación omitida' })
  @ApiNotFoundResponse({ description: 'INDICACION_NO_ENCONTRADA' })
  @ApiConflictResponse({ description: 'INDICACION_NO_ESTA_PENDIENTE' })
  omitir(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: OmitirIndicacionDto,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ): Promise<IndicacionDto> {
    return this.omitirIndicacionHandler.ejecutar(
      new OmitirIndicacionCommand(id, dto.motivo, usuario.id),
    );
  }

  @Post('signos-vitales')
  @HttpCode(HttpStatus.CREATED)
  @RequierePermiso(PERMISOS.ENFERMERIA_REGISTRAR)
  @ApiOperation({ summary: 'Registrar signos vitales del paciente' })
  @ApiCreatedResponse({ description: 'Signos vitales registrados' })
  registrarSignosVitales(
    @Body() dto: RegistrarSignosVitalesDto,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ): Promise<SignosVitalesDto> {
    return this.registrarSignosVitalesHandler.ejecutar(
      new RegistrarSignosVitalesCommand(dto.pacienteId, usuario.id, {
        internacionId: dto.internacionId,
        temperatura: dto.temperatura,
        presionSistolica: dto.presionSistolica,
        presionDiastolica: dto.presionDiastolica,
        frecuenciaCardiaca: dto.frecuenciaCardiaca,
        saturacionO2: dto.saturacionO2,
      }),
    );
  }

  @Get('signos-vitales')
  @RequierePermiso(PERMISOS.ENFERMERIA_LEER)
  @ApiOperation({ summary: 'Listar registros de signos vitales por paciente o internación' })
  @ApiOkResponse({ description: 'Listado de signos vitales' })
  listarSignosVitales(@Query() dto: ListarFiltrosDto): Promise<SignosVitalesDto[]> {
    return this.listarSignosVitalesHandler.ejecutar(new ListarSignosVitalesQuery(dto));
  }

  @Post('notas')
  @HttpCode(HttpStatus.CREATED)
  @RequierePermiso(PERMISOS.ENFERMERIA_REGISTRAR)
  @ApiOperation({ summary: 'Registrar nota de evolución de enfermería' })
  @ApiCreatedResponse({ description: 'Nota registrada' })
  registrarNota(
    @Body() dto: RegistrarNotaEnfermeriaDto,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ): Promise<NotaEnfermeriaDto> {
    return this.registrarNotaHandler.ejecutar(
      new RegistrarNotaEnfermeriaCommand({
        pacienteId: dto.pacienteId,
        texto: dto.texto,
        registradoPor: usuario.id,
        internacionId: dto.internacionId,
      }),
    );
  }

  @Get('notas')
  @RequierePermiso(PERMISOS.ENFERMERIA_LEER)
  @ApiOperation({ summary: 'Listar notas de enfermería por paciente o internación' })
  @ApiOkResponse({ description: 'Listado de notas de enfermería' })
  listarNotas(@Query() dto: ListarFiltrosDto): Promise<NotaEnfermeriaDto[]> {
    return this.listarNotasHandler.ejecutar(new ListarNotasEnfermeriaQuery(dto));
  }
}
