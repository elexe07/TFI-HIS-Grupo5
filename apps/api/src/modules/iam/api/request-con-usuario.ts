import type { Request } from 'express';
import type { UsuarioAutenticado } from '../application/ports/tokens';

/** El guard cuelga el usuario autenticado del request; `@UsuarioActual()` lo lee de ahí. */
export interface RequestConUsuario extends Request {
  usuario?: UsuarioAutenticado;
}
