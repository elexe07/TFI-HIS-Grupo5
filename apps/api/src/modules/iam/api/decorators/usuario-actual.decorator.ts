import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { UsuarioAutenticado } from '../../application/ports/tokens';
import { TokenInvalido } from '../../domain/errores';
import type { RequestConUsuario } from '../request-con-usuario';

/**
 * Inyecta el usuario del token en un parámetro del controller:
 *   reservar(@UsuarioActual() usuario: UsuarioAutenticado, @Body() dto: ReservarTurnoDto)
 */
export const UsuarioActual = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UsuarioAutenticado => {
    const usuario = ctx.switchToHttp().getRequest<RequestConUsuario>().usuario;
    if (!usuario) throw new TokenInvalido();
    return usuario;
  },
);
