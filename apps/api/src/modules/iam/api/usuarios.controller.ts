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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AsignarRolCommand } from '../application/asignar-rol/asignar-rol.command';
import { AsignarRolHandler } from '../application/asignar-rol/asignar-rol.handler';
import { ListarUsuariosHandler } from '../application/listar-usuarios/listar-usuarios.handler';
import { RegistrarUsuarioCommand } from '../application/registrar-usuario/registrar-usuario.command';
import { RegistrarUsuarioHandler } from '../application/registrar-usuario/registrar-usuario.handler';
import type { UsuarioDto } from '../application/usuario.dto';
import { PERMISOS } from '../domain/permisos';
import { RequierePermiso } from './decorators/requiere-permiso.decorator';
import { AsignarRolDto } from './dto/asignar-rol.dto';
import { RegistrarUsuarioDto } from './dto/registrar-usuario.dto';

/** Todo el controller exige `usuarios:gestionar` (solo ADMINISTRADOR). */
@ApiTags('usuarios')
@ApiBearerAuth()
@ApiForbiddenResponse({ description: 'PERMISO_FALTANTE: requiere usuarios:gestionar' })
@RequierePermiso(PERMISOS.USUARIOS_GESTIONAR)
@Controller('usuarios')
export class UsuariosController {
  constructor(
    private readonly registrarUsuario: RegistrarUsuarioHandler,
    private readonly listarUsuarios: ListarUsuariosHandler,
    private readonly asignarRol: AsignarRolHandler,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar usuario con un rol' })
  @ApiCreatedResponse({ description: 'Usuario creado (sin hash)' })
  @ApiConflictResponse({ description: 'EMAIL_YA_REGISTRADO' })
  registrar(@Body() dto: RegistrarUsuarioDto): Promise<UsuarioDto> {
    return this.registrarUsuario.ejecutar(new RegistrarUsuarioCommand(dto));
  }

  @Get()
  @ApiOperation({ summary: 'Listar usuarios' })
  @ApiOkResponse({ description: 'Lista de usuarios' })
  listar(): Promise<UsuarioDto[]> {
    return this.listarUsuarios.ejecutar();
  }

  @Patch(':id/rol')
  @ApiOperation({ summary: 'Asignar rol a un usuario' })
  @ApiConflictResponse({ description: 'ULTIMO_ADMINISTRADOR' })
  cambiarRol(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AsignarRolDto,
  ): Promise<UsuarioDto> {
    return this.asignarRol.ejecutar(new AsignarRolCommand(id, dto.rol));
  }
}
