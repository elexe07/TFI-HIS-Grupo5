import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  PERMISOS,
  RequierePermiso,
  UsuarioActual,
  type UsuarioAutenticado,
} from '../../iam/public';
import { RegistrarTriajeCommand } from '../application/registrar-triaje/registrar-triaje.command';
import { RegistrarTriajeHandler } from '../application/registrar-triaje/registrar-triaje.handler';
import type { TriajeDto } from '../application/triaje.dto';
import { RegistrarTriajeDto } from './dto/registrar-triaje.dto';

@ApiTags('triajes')
@ApiBearerAuth()
@Controller('triajes')
export class TriajesController {
  constructor(private readonly registrarTriaje: RegistrarTriajeHandler) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequierePermiso(PERMISOS.TRIAJE_REGISTRAR)
  @ApiOperation({ summary: 'Registrar triaje de guardia para un paciente (ADM-06)' })
  @ApiCreatedResponse({ description: 'Triaje registrado exitosamente' })
  @ApiNotFoundResponse({ description: 'PACIENTE_NO_ENCONTRADO' })
  @ApiForbiddenResponse({ description: 'PERMISO_FALTANTE: requiere triaje:registrar (Enfermero)' })
  registrar(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Body() dto: RegistrarTriajeDto,
  ): Promise<TriajeDto> {
    return this.registrarTriaje.ejecutar(
      new RegistrarTriajeCommand({
        pacienteId: dto.pacienteId,
        nivel: dto.nivel,
        motivo: dto.motivo,
        registradoPor: usuario.id,
      }),
    );
  }
}

