import { Entity } from '../../../building-blocks/domain';
import { MATRIZ_PERMISOS, type NombreRol, type Permiso } from './permisos';

/**
 * Rol con sus permisos. Es una entidad de referencia: se crea por seed y no cambia en runtime.
 */
export class Rol extends Entity {
  private constructor(
    id: string,
    readonly nombre: NombreRol,
    readonly permisos: readonly Permiso[],
  ) {
    super(id);
  }

  static reconstituir(id: string, nombre: NombreRol, permisos: readonly Permiso[]): Rol {
    return new Rol(id, nombre, [...permisos]);
  }

  /** Rol con los permisos de la matriz. Lo usan el seed y los tests. */
  static conPermisosPorDefecto(id: string, nombre: NombreRol): Rol {
    return new Rol(id, nombre, MATRIZ_PERMISOS[nombre]);
  }

  tienePermiso(permiso: Permiso): boolean {
    return this.permisos.includes(permiso);
  }

  get esAdministrador(): boolean {
    return this.nombre === 'ADMINISTRADOR';
  }
}
