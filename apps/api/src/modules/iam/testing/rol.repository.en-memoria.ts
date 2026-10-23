import { type NombreRol, ROLES } from '../domain/permisos';
import { Rol } from '../domain/rol';
import type { RolRepository } from '../domain/rol.repository';

/** Viene precargado con los 5 roles y los permisos de la matriz, igual que la base tras el seed. */
export class RolRepositoryEnMemoria implements RolRepository {
  private readonly roles = new Map<NombreRol, Rol>(
    ROLES.map((nombre) => [
      nombre,
      Rol.conPermisosPorDefecto(`rol-${nombre.toLowerCase()}`, nombre),
    ]),
  );

  buscarPorNombre(nombre: NombreRol): Promise<Rol | null> {
    return Promise.resolve(this.roles.get(nombre) ?? null);
  }

  /** Para simular un rol que no está sembrado. */
  quitar(nombre: NombreRol): void {
    this.roles.delete(nombre);
  }
}
