import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CrearSaludoCommand,
  type SaludoCreadoResultado,
} from '../application/crear-saludo/crear-saludo.command';
import { CrearSaludoHandler } from '../application/crear-saludo/crear-saludo.handler';
import {
  ListarSaludosHandler,
  type SaludoDto,
} from '../application/listar-saludos/listar-saludos.handler';
import { Publico } from '../../iam/public';
import { CrearSaludoDto } from './dto/crear-saludo.dto';

/**
 * Adaptador primario. Solo traduce HTTP → caso de uso → HTTP. Cero lógica de negocio.
 */
@ApiTags('ejemplo')
@Publico() // módulo de referencia, sin login. Los reales usan @RequierePermiso(...)
@Controller('ejemplo/saludos')
export class SaludosController {
  constructor(
    private readonly crearSaludo: CrearSaludoHandler,
    private readonly listarSaludos: ListarSaludosHandler,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un saludo (caso de uso de ejemplo)' })
  @ApiCreatedResponse({ description: 'Saludo creado' })
  crear(@Body() dto: CrearSaludoDto): Promise<SaludoCreadoResultado> {
    return this.crearSaludo.ejecutar(new CrearSaludoCommand(dto.destinatario));
  }

  @Get()
  @ApiOperation({ summary: 'Listar saludos' })
  @ApiOkResponse({ description: 'Lista de saludos' })
  listar(): Promise<SaludoDto[]> {
    return this.listarSaludos.ejecutar();
  }
}
