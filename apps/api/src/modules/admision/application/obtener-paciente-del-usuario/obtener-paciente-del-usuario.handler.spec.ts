import { Documento } from '../../domain/documento';
import { PacienteNoVinculado } from '../../domain/errores';
import { Paciente } from '../../domain/paciente';
import { Sexo, TipoDocumento } from '../../domain/tipos';
import { PacienteRepositoryEnMemoria } from '../../testing';
import { ObtenerPacienteDelUsuarioHandler } from './obtener-paciente-del-usuario.handler';
import { ObtenerPacienteDelUsuarioQuery } from './obtener-paciente-del-usuario.query';

describe('ObtenerPacienteDelUsuarioHandler', () => {
  let repo: PacienteRepositoryEnMemoria;
  let handler: ObtenerPacienteDelUsuarioHandler;

  beforeEach(() => {
    repo = new PacienteRepositoryEnMemoria();
    handler = new ObtenerPacienteDelUsuarioHandler(repo);
  });

  it('devuelve la ficha vinculada al usuario', async () => {
    const paciente = Paciente.crear(
      {
        usuarioId: 'usuario-1',
        documento: Documento.crear(TipoDocumento.DNI, '30111222'),
        nombre: 'Juan',
        apellido: 'Pérez',
        fechaNacimiento: new Date('1990-05-15'),
        sexo: Sexo.M,
      },
      new Date('2026-11-19T10:00:00Z'),
    );
    await repo.guardar(paciente);

    const ficha = await handler.ejecutar(new ObtenerPacienteDelUsuarioQuery('usuario-1'));

    expect(ficha.id).toBe(paciente.id);
  });

  it('si el usuario no tiene ficha vinculada lanza PacienteNoVinculado', async () => {
    await expect(
      handler.ejecutar(new ObtenerPacienteDelUsuarioQuery('usuario-sin-ficha')),
    ).rejects.toThrow(PacienteNoVinculado);
  });
});
