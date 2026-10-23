import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule, type JwtSignOptions } from '@nestjs/jwt';
import type { Env } from '../../config/env';
import { AuthController } from './api/auth.controller';
import { PermisosGuard } from './api/guards/permisos.guard';
import { UsuariosController } from './api/usuarios.controller';
import { AsignarRolHandler } from './application/asignar-rol/asignar-rol.handler';
import { IniciarSesionHandler } from './application/iniciar-sesion/iniciar-sesion.handler';
import { ListarUsuariosHandler } from './application/listar-usuarios/listar-usuarios.handler';
import { TOKENS } from './application/ports/tokens';
import { RegistrarUsuarioHandler } from './application/registrar-usuario/registrar-usuario.handler';
import { PASSWORD_HASHER } from './domain/password-hasher';
import { ROL_REPOSITORY } from './domain/rol.repository';
import { USUARIO_REPOSITORY } from './domain/usuario.repository';
import { BcryptPasswordHasher } from './infrastructure/bcrypt.password-hasher';
import { JwtTokens } from './infrastructure/jwt.tokens';
import { RolRepositoryPrisma } from './infrastructure/rol.repository.prisma';
import { UsuarioRepositoryPrisma } from './infrastructure/usuario.repository.prisma';

/**
 * Identidad y Accesos. Registra el guard global: desde que este módulo está importado,
 * toda la API exige token salvo los endpoints marcados con @Publico().
 */
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        secret: config.get('JWT_SECRET', { infer: true }),
        signOptions: {
          expiresIn: config.get('JWT_EXPIRES_IN', { infer: true }) as JwtSignOptions['expiresIn'],
        },
      }),
    }),
  ],
  controllers: [AuthController, UsuariosController],
  providers: [
    // casos de uso
    RegistrarUsuarioHandler,
    IniciarSesionHandler,
    AsignarRolHandler,
    ListarUsuariosHandler,
    // guard global de autenticación + permisos
    { provide: APP_GUARD, useClass: PermisosGuard },
    // puertos → adaptadores
    { provide: USUARIO_REPOSITORY, useClass: UsuarioRepositoryPrisma },
    { provide: ROL_REPOSITORY, useClass: RolRepositoryPrisma },
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
    { provide: TOKENS, useClass: JwtTokens },
  ],
})
export class IamModule {}
