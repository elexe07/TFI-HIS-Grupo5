import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  IniciarSesionCommand,
  type SesionIniciada,
} from '../application/iniciar-sesion/iniciar-sesion.command';
import { IniciarSesionHandler } from '../application/iniciar-sesion/iniciar-sesion.handler';
import type { UsuarioAutenticado } from '../application/ports/tokens';
import { Publico } from './decorators/publico.decorator';
import { UsuarioActual } from './decorators/usuario-actual.decorator';
import { IniciarSesionDto } from './dto/iniciar-sesion.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly iniciarSesion: IniciarSesionHandler) {}

  @Publico()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión: devuelve un JWT con rol y permisos' })
  @ApiOkResponse({ description: '{ token, usuario }' })
  @ApiUnauthorizedResponse({ description: 'CREDENCIALES_INVALIDAS' })
  login(@Body() dto: IniciarSesionDto): Promise<SesionIniciada> {
    return this.iniciarSesion.ejecutar(new IniciarSesionCommand(dto.email, dto.password));
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Quién soy: el usuario del token' })
  me(@UsuarioActual() usuario: UsuarioAutenticado): UsuarioAutenticado {
    return usuario;
  }
}
