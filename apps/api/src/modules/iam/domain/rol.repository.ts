import type { NombreRol } from './permisos';
import type { Rol } from './rol';

export const ROL_REPOSITORY = Symbol('ROL_REPOSITORY');

export interface RolRepository {
  buscarPorNombre(nombre: NombreRol): Promise<Rol | null>;
}
