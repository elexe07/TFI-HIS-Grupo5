import type { NombreRol } from '../../domain/permisos';

export class AsignarRolCommand {
  constructor(
    readonly usuarioId: string,
    readonly rol: NombreRol,
  ) {}
}
