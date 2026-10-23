import { RelojFijo } from '../../../../building-blocks/testing';
import { EmailInvalido } from '../../domain/email';
import { EmailYaRegistrado, RolNoEncontrado } from '../../domain/errores';
import { PasswordDebil } from '../../domain/password';
import {
  PasswordHasherFalso,
  RolRepositoryEnMemoria,
  UsuarioRepositoryEnMemoria,
} from '../../testing';
import { RegistrarUsuarioCommand } from './registrar-usuario.command';
import { RegistrarUsuarioHandler } from './registrar-usuario.handler';

describe('RegistrarUsuarioHandler (IAM-01)', () => {
  let usuarios: UsuarioRepositoryEnMemoria;
  let roles: RolRepositoryEnMemoria;
  let handler: RegistrarUsuarioHandler;

  const comando = (email = 'ana@h.com') =>
    new RegistrarUsuarioCommand({ email, nombre: 'Ana', password: 'Clave1234', rol: 'MEDICO' });

  beforeEach(() => {
    usuarios = new UsuarioRepositoryEnMemoria();
    roles = new RolRepositoryEnMemoria();
    handler = new RegistrarUsuarioHandler(
      usuarios,
      roles,
      new PasswordHasherFalso(),
      new RelojFijo(),
    );
  });

  it('crea el usuario con el rol y guarda la contraseña hasheada', async () => {
    const dto = await handler.ejecutar(comando());

    expect(dto).toMatchObject({ email: 'ana@h.com', nombre: 'Ana', rol: 'MEDICO', activo: true });
    const guardado = await usuarios.buscarPorId(dto.id);
    expect(guardado?.passwordHash).toBe('hash(Clave1234)');
    expect(JSON.stringify(dto)).not.toContain('Clave1234');
  });

  it('falla si el email ya está registrado (aunque cambie mayúsculas)', async () => {
    await handler.ejecutar(comando('ana@h.com'));

    await expect(handler.ejecutar(comando('ANA@H.COM'))).rejects.toThrow(EmailYaRegistrado);
    expect(await usuarios.listar()).toHaveLength(1);
  });

  it('falla con password débil sin guardar nada', async () => {
    const debil = new RegistrarUsuarioCommand({ ...comando(), password: '1234' });

    await expect(handler.ejecutar(debil)).rejects.toThrow(PasswordDebil);
    expect(await usuarios.listar()).toHaveLength(0);
  });

  it('falla con email inválido', async () => {
    await expect(handler.ejecutar(comando('no-es-email'))).rejects.toThrow(EmailInvalido);
  });

  it('falla si el rol no existe en la base', async () => {
    roles.quitar('MEDICO');

    await expect(handler.ejecutar(comando())).rejects.toThrow(RolNoEncontrado);
  });
});
