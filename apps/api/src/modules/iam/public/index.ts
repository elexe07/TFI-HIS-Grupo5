/**
 * Superficie pública de IAM. Lo único que los demás módulos pueden importar de acá.
 *
 *   import { PERMISOS, RequierePermiso, UsuarioActual } from '../../iam/public';
 *
 *   @RequierePermiso(PERMISOS.TURNOS_RESERVAR)
 *   @Post()
 *   reservar(@UsuarioActual() usuario: UsuarioAutenticado, @Body() dto: ReservarTurnoDto) { ... }
 *
 * El guard es global: todo endpoint exige token salvo que tenga @Publico().
 * Para tests de controllers de otros módulos: `TokensFalsos` en '../../iam/testing'.
 */
export { Publico } from '../api/decorators/publico.decorator';
export { RequierePermiso } from '../api/decorators/requiere-permiso.decorator';
export { UsuarioActual } from '../api/decorators/usuario-actual.decorator';
export type { UsuarioAutenticado } from '../application/ports/tokens';
export { esNombreRol, type NombreRol, PERMISOS, type Permiso, ROLES } from '../domain/permisos';
