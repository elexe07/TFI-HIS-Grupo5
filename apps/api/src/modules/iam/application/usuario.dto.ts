import type { NombreRol } from '../domain/permisos';
import type { Usuario } from '../domain/usuario';
import type { UsuarioAutenticado } from './ports/tokens';

/** Lo que la API devuelve de un usuario. Nunca incluye el hash. */
export interface UsuarioDto {
  id: string;
  email: string;
  nombre: string;
  rol: NombreRol;
  activo: boolean;
  creadoEn: string;
}

export const aUsuarioDto = (u: Usuario): UsuarioDto => ({
  id: u.id,
  email: u.email.valor,
  nombre: u.nombre,
  rol: u.rol.nombre,
  activo: u.activo,
  creadoEn: u.creadoEn.toISOString(),
});

export const aUsuarioAutenticado = (u: Usuario): UsuarioAutenticado => ({
  id: u.id,
  email: u.email.valor,
  nombre: u.nombre,
  rol: u.rol.nombre,
  permisos: [...u.rol.permisos],
});
