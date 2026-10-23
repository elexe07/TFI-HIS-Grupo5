import { RelojFijo } from '../../../../building-blocks/testing';
import { CredencialesInvalidas } from '../../domain/errores';
import { PERMISOS } from '../../domain/permisos';
import {
  PasswordHasherFalso,
  RolRepositoryEnMemoria,
  TokensFalsos,
  UsuarioRepositoryEnMemoria,
} from '../../testing';
import { RegistrarUsuarioCommand } from '../registrar-usuario/registrar-usuario.command';
import { RegistrarUsuarioHandler } from '../registrar-usuario/registrar-usuario.handler';
import { IniciarSesionCommand } from './iniciar-sesion.command';
import { IniciarSesionHandler } from './iniciar-sesion.handler';

describe('IniciarSesionHandler (IAM-02)', () => {
  let usuarios: UsuarioRepositoryEnMemoria;
  let tokens: TokensFalsos;
  let handler: IniciarSesionHandler;

  beforeEach(async () => {
    usuarios = new UsuarioRepositoryEnMemoria();
    tokens = new TokensFalsos();
    const hasher = new PasswordHasherFalso();
    handler = new IniciarSesionHandler(usuarios, hasher, tokens);

    const registrar = new RegistrarUsuarioHandler(
      usuarios,
      new RolRepositoryEnMemoria(),
      hasher,
      new RelojFijo(),
    );
    await registrar.ejecutar(
      new RegistrarUsuarioCommand({
        email: 'ana@h.com',
        nombre: 'Ana',
        password: 'Clave1234',
        rol: 'MEDICO',
      }),
    );
  });

  it('devuelve un token que trae rol y permisos', async () => {
    const sesion = await handler.ejecutar(new IniciarSesionCommand('Ana@H.com', 'Clave1234'));

    expect(sesion.usuario).toMatchObject({ email: 'ana@h.com', rol: 'MEDICO' });
    expect(sesion.usuario.permisos).toContain(PERMISOS.HCE_ESCRIBIR);
    expect(sesion.usuario.permisos).not.toContain(PERMISOS.USUARIOS_GESTIONAR);

    const dentroDelToken = await tokens.verificar(sesion.token);
    expect(dentroDelToken).toEqual(sesion.usuario);
  });

  it.each([
    ['password incorrecta', 'ana@h.com', 'Otra1234'],
    ['email inexistente', 'nadie@h.com', 'Clave1234'],
    ['email mal formado', 'no-es-email', 'Clave1234'],
  ])('rechaza %s con el mismo error', async (_caso, email, password) => {
    await expect(handler.ejecutar(new IniciarSesionCommand(email, password))).rejects.toThrow(
      CredencialesInvalidas,
    );
  });

  it('rechaza a un usuario desactivado', async () => {
    const [ana] = await usuarios.listar();
    ana!.desactivar();

    await expect(
      handler.ejecutar(new IniciarSesionCommand('ana@h.com', 'Clave1234')),
    ).rejects.toThrow(CredencialesInvalidas);
  });
});
