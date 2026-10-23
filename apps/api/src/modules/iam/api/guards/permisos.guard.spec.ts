import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { UsuarioAutenticado } from '../../application/ports/tokens';
import { PermisoFaltante, TokenInvalido } from '../../domain/errores';
import { MATRIZ_PERMISOS, PERMISOS } from '../../domain/permisos';
import { TokensFalsos } from '../../testing';
import { Publico } from '../decorators/publico.decorator';
import { RequierePermiso } from '../decorators/requiere-permiso.decorator';
import type { RequestConUsuario } from '../request-con-usuario';
import { PermisosGuard } from './permisos.guard';

/** Controller de juguete con los tres tipos de endpoint. */
@RequierePermiso(PERMISOS.CAMAS_LEER)
class ControllerDePrueba {
  @Publico() abierto() {}
  soloAutenticado() {}
  @RequierePermiso(PERMISOS.HCE_ESCRIBIR) soloMedicos() {}
}

const enfermero: UsuarioAutenticado = {
  id: 'u1',
  email: 'enf@h.com',
  nombre: 'Enf',
  rol: 'ENFERMERO',
  permisos: [...MATRIZ_PERMISOS.ENFERMERO],
};

describe('PermisosGuard (IAM-04)', () => {
  const tokens = new TokensFalsos();
  const guard = new PermisosGuard(new Reflector(), tokens);

  function contexto(metodo: keyof ControllerDePrueba, authorization?: string) {
    const request = { headers: { authorization } } as RequestConUsuario;
    const ctx = {
      getHandler: () => ControllerDePrueba.prototype[metodo],
      getClass: () => ControllerDePrueba,
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
    return { ctx, request };
  }

  it('deja pasar un endpoint @Publico() sin token', async () => {
    await expect(guard.canActivate(contexto('abierto').ctx)).resolves.toBe(true);
  });

  it.each([undefined, 'Bearer', 'Basic abc', 'Bearer token-roto'])(
    'responde 401 (TokenInvalido) con authorization = %s',
    async (authorization) => {
      await expect(
        guard.canActivate(contexto('soloAutenticado', authorization).ctx),
      ).rejects.toThrow(TokenInvalido);
    },
  );

  it('con token válido cuelga el usuario del request', async () => {
    const { ctx, request } = contexto(
      'soloAutenticado',
      `Bearer ${await tokens.emitir(enfermero)}`,
    );

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(request.usuario).toEqual(enfermero);
  });

  it('usa el permiso del controller cuando el método no define uno', async () => {
    const { ctx } = contexto('soloAutenticado', `Bearer ${await tokens.emitir(enfermero)}`);
    await expect(guard.canActivate(ctx)).resolves.toBe(true); // enfermero tiene camas:leer

    const sinCamas = { ...enfermero, permisos: [PERMISOS.HCE_LEER] };
    const { ctx: ctx2 } = contexto('soloAutenticado', `Bearer ${await tokens.emitir(sinCamas)}`);
    await expect(guard.canActivate(ctx2)).rejects.toThrow(PermisoFaltante);
  });

  it('responde 403 (PermisoFaltante) si el usuario no tiene el permiso del método', async () => {
    const { ctx } = contexto('soloMedicos', `Bearer ${await tokens.emitir(enfermero)}`);

    await expect(guard.canActivate(ctx)).rejects.toThrow(PermisoFaltante);
  });
});
