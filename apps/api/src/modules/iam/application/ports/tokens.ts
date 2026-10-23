import type { NombreRol, Permiso } from '../../domain/permisos';

export const TOKENS = Symbol('TOKENS');

/** Lo que viaja dentro del token y lo que reciben los controllers con `@UsuarioActual()`. */
export interface UsuarioAutenticado {
  id: string;
  email: string;
  nombre: string;
  rol: NombreRol;
  permisos: Permiso[];
}

/** Puerto: emitir y verificar tokens. JWT es el adaptador (ADR-005), no el contrato. */
export interface Tokens {
  emitir(usuario: UsuarioAutenticado): Promise<string>;
  /** Devuelve `null` si el token es inválido o venció. */
  verificar(token: string): Promise<UsuarioAutenticado | null>;
}
