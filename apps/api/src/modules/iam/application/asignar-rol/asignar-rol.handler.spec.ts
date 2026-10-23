import { RelojFijo } from '../../../../building-blocks/testing';
import { RolNoEncontrado, UltimoAdministrador, UsuarioNoEncontrado } from '../../domain/errores';
import type { NombreRol } from '../../domain/permisos';
import {
  PasswordHasherFalso,
  RolRepositoryEnMemoria,
  UsuarioRepositoryEnMemoria,
} from '../../testing';
import { RegistrarUsuarioCommand } from '../registrar-usuario/registrar-usuario.command';
import { RegistrarUsuarioHandler } from '../registrar-usuario/registrar-usuario.handler';
import { AsignarRolCommand } from './asignar-rol.command';
import { AsignarRolHandler } from './asignar-rol.handler';

describe('AsignarRolHandler (IAM-03)', () => {
  let usuarios: UsuarioRepositoryEnMemoria;
  let roles: RolRepositoryEnMemoria;
  let handler: AsignarRolHandler;
  let registrar: RegistrarUsuarioHandler;

  const alta = async (email: string, rol: NombreRol) =>
    (
      await registrar.ejecutar(
        new RegistrarUsuarioCommand({ email, nombre: 'X', password: 'Clave1234', rol }),
      )
    ).id;

  beforeEach(() => {
    usuarios = new UsuarioRepositoryEnMemoria();
    roles = new RolRepositoryEnMemoria();
    handler = new AsignarRolHandler(usuarios, roles);
    registrar = new RegistrarUsuarioHandler(
      usuarios,
      roles,
      new PasswordHasherFalso(),
      new RelojFijo(),
    );
  });

  it('cambia el rol y lo persiste', async () => {
    const id = await alta('ana@h.com', 'RECEPCIONISTA');

    const dto = await handler.ejecutar(new AsignarRolCommand(id, 'MEDICO'));

    expect(dto.rol).toBe('MEDICO');
    expect((await usuarios.buscarPorId(id))?.rol.nombre).toBe('MEDICO');
  });

  it('no deja quitar el rol al último administrador activo', async () => {
    const id = await alta('admin@h.com', 'ADMINISTRADOR');

    await expect(handler.ejecutar(new AsignarRolCommand(id, 'MEDICO'))).rejects.toThrow(
      UltimoAdministrador,
    );
    expect((await usuarios.buscarPorId(id))?.rol.nombre).toBe('ADMINISTRADOR');
  });

  it('sí deja si queda otro administrador activo', async () => {
    const id = await alta('admin@h.com', 'ADMINISTRADOR');
    await alta('otro@h.com', 'ADMINISTRADOR');

    const dto = await handler.ejecutar(new AsignarRolCommand(id, 'MEDICO'));

    expect(dto.rol).toBe('MEDICO');
  });

  it('falla si el usuario o el rol no existen', async () => {
    await expect(handler.ejecutar(new AsignarRolCommand('no-existe', 'MEDICO'))).rejects.toThrow(
      UsuarioNoEncontrado,
    );

    const id = await alta('ana@h.com', 'MEDICO');
    roles.quitar('ENFERMERO');
    await expect(handler.ejecutar(new AsignarRolCommand(id, 'ENFERMERO'))).rejects.toThrow(
      RolNoEncontrado,
    );
  });
});
