import {
  Body,
  Controller,
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
import { DarDeAltaCommand } from '../application/dar-de-alta/dar-de-alta.command';
import { DarDeAltaHandler } from '../application/dar-de-alta/dar-de-alta.handler';
import type { InternacionDto } from '../application/internacion.dto';
import { InternarPacienteCommand } from '../application/internar-paciente/internar-paciente.command';
import { InternarPacienteHandler } from '../application/internar-paciente/internar-paciente.handler';
import { DarDeAltaDto } from './dto/dar-de-alta.dto';
import { InternarPacienteDto } from './dto/internar-paciente.dto';

@ApiTags('internaciones')
@ApiBearerAuth()
@Controller('internaciones')
export class InternacionesController {
  constructor(
    private readonly internarPaciente: InternarPacienteHandler,
    private readonly darDeAlta: DarDeAltaHandler,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequierePermiso(PERMISOS.INTERNACIONES_GESTIONAR)
  @ApiOperation({ summary: 'Internar un paciente en una cama libre' })
  @ApiCreatedResponse({ description: 'Internación creada exitosamente' })
  @ApiNotFoundResponse({ description: 'CAMA_NO_ENCONTRADA' })
  @ApiConflictResponse({ description: 'CAMA_NO_LIBRE o PACIENTE_YA_INTERNADO' })
  @ApiForbiddenResponse({ description: 'Requiere permiso internaciones:gestionar' })
  internar(@Body() dto: InternarPacienteDto): Promise<InternacionDto> {
    return this.internarPaciente.ejecutar(
      new InternarPacienteCommand({
        pacienteId: dto.pacienteId,
        camaId: dto.camaId,
        medicoId: dto.medicoId,
        motivo: dto.motivo,
        ingresoEn: dto.ingresoEn ? new Date(dto.ingresoEn) : undefined,
      }),
    );
  }

  @Post(':id/alta')
  @HttpCode(HttpStatus.OK)
  @RequierePermiso(PERMISOS.INTERNACIONES_GESTIONAR)
  @ApiOperation({ summary: 'Dar de alta una internación activa' })
  @ApiOkResponse({ description: 'Internación dada de alta y cama liberada a limpieza' })
  @ApiNotFoundResponse({ description: 'INTERNACION_NO_ENCONTRADA o CAMA_NO_ENCONTRADA' })
  @ApiConflictResponse({ description: 'INTERNACION_YA_FINALIZADA' })
  @ApiForbiddenResponse({ description: 'Requiere permiso internaciones:gestionar' })
  alta(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DarDeAltaDto,
  ): Promise<InternacionDto> {
    return this.darDeAlta.ejecutar(
      new DarDeAltaCommand({
        internacionId: id,
        egresoEn: dto.egresoEn ? new Date(dto.egresoEn) : undefined,
      }),
    );
  }
}
