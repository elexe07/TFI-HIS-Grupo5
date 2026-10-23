import { SetMetadata } from '@nestjs/common';
import type { Permiso } from '../../domain/permisos';

export const PERMISO_REQUERIDO = 'iam:permiso';

/**
 * Exige un permiso del catálogo para entrar al endpoint (o a todo el controller).
 *   @RequierePermiso(PERMISOS.HCE_LEER)
 * Sin token → 401. Con token pero sin el permiso → 403.
 */
export const RequierePermiso = (permiso: Permiso) => SetMetadata(PERMISO_REQUERIDO, permiso);
