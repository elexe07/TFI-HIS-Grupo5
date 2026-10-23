import type { Email } from './email';
import type { NombreRol } from './permisos';
import type { Usuario } from './usuario';

export const USUARIO_REPOSITORY = Symbol('USUARIO_REPOSITORY');

export interface UsuarioRepository {
  /** Inserta o actualiza (el id lo genera el dominio). */
  guardar(usuario: Usuario): Promise<void>;
  buscarPorId(id: string): Promise<Usuario | null>;
  buscarPorEmail(email: Email): Promise<Usuario | null>;
  listar(): Promise<Usuario[]>;
  contarActivosConRol(rol: NombreRol): Promise<number>;
}
