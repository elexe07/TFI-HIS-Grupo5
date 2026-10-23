import { type CanActivate, type ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TOKENS, type Tokens, type UsuarioAutenticado } from '../../application/ports/tokens';
import { PermisoFaltante, TokenInvalido } from '../../domain/errores';
import type { Permiso } from '../../domain/permisos';
import { ES_PUBLICO } from '../decorators/publico.decorator';
import { PERMISO_REQUERIDO } from '../decorators/requiere-permiso.decorator';
import type { RequestConUsuario } from '../request-con-usuario';

/**
 * Guard global (APP_GUARD en iam.module.ts). Para cada request:
 *   1. si el endpoint es @Publico() → pasa;
 *   2. si no hay Bearer token válido → 401 TOKEN_INVALIDO;
 *   3. si el endpoint tiene @RequierePermiso(p) y el usuario no lo tiene → 403 PERMISO_FALTANTE.
 * Los errores son de dominio, así el body tiene el mismo formato que el resto de la API.
 */
@Injectable()
export class PermisosGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(TOKENS) private readonly tokens: Tokens,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    if (this.metadato<boolean>(ctx, ES_PUBLICO) === true) return true;

    const request = ctx.switchToHttp().getRequest<RequestConUsuario>();
    request.usuario = await this.autenticar(request);

    const permiso = this.metadato<Permiso>(ctx, PERMISO_REQUERIDO);
    if (permiso && !request.usuario.permisos.includes(permiso)) throw new PermisoFaltante(permiso);
    return true;
  }

  private async autenticar(request: RequestConUsuario): Promise<UsuarioAutenticado> {
    const [esquema, token] = request.headers.authorization?.split(' ') ?? [];
    if (esquema !== 'Bearer' || !token) throw new TokenInvalido();
    const usuario = await this.tokens.verificar(token);
    if (!usuario) throw new TokenInvalido();
    return usuario;
  }

  /** El metadato del método pisa al de la clase. */
  private metadato<T>(ctx: ExecutionContext, clave: string): T | undefined {
    return this.reflector.getAllAndOverride<T | undefined>(clave, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
  }
}
