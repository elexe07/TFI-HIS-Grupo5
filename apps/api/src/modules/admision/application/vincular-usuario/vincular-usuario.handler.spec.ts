import { RelojFijo } from '../../../../building-blocks/testing';
import { Documento } from '../../domain/documento';
import {
  PacienteNoEncontrado,
  PacienteYaVinculado,
  UsuarioYaVinculado,
} from '../../domain/errores';
import { Paciente } from '../../domain/paciente';
import { Sexo, TipoDocumento } from '../../domain/tipos';
import { PacienteRepositoryEnMemoria } from '../../testing';
import { VincularUsuarioCommand } from './vincular-usuario.command';
import { VincularUsuarioHandler } from './vincular-usuario.handler';

describe('VincularUsuarioHandler', () => {
  const ahora = new Date('2026-11-19T10:00:00Z');
  let repo: PacienteRepositoryEnMemoria;
  let handler: VincularUsuarioHandler;

  const nuevoPaciente = async (numeroDocumento: string, usuarioId?: string): Promise<Paciente> => {
    const paciente = Paciente.crear(
      {
        usuarioId,
        documento: Documento.crear(TipoDocumento.DNI, numeroDocumento),
        nombre: 'Ana',
        apellido: 'López',
        fechaNacimiento: new Date('1992-04-12'),
        sexo: Sexo.F,
      },
      ahora,
    );
    await repo.guardar(paciente);
    return paciente;
  };

  beforeEach(() => {
    repo = new PacienteRepositoryEnMemoria();
    handler = new VincularUsuarioHandler(repo, new RelojFijo(ahora));
  });

  it('vincula la ficha con el usuario', async () => {
    const paciente = await nuevoPaciente('30111222');

    const ficha = await handler.ejecutar(new VincularUsuarioCommand(paciente.id, 'usuario-1'));

    expect(ficha.usuarioId).toBe('usuario-1');
    expect((await repo.buscarPorUsuarioId('usuario-1'))?.id).toBe(paciente.id);
  });

  it('volver a vincular el mismo usuario no falla', async () => {
    const paciente = await nuevoPaciente('30111222', 'usuario-1');

    await expect(
      handler.ejecutar(new VincularUsuarioCommand(paciente.id, 'usuario-1')),
    ).resolves.toMatchObject({ usuarioId: 'usuario-1' });
  });

  it('una ficha ya vinculada no se puede pasar a otro usuario', async () => {
    const paciente = await nuevoPaciente('30111222', 'usuario-1');

    await expect(
      handler.ejecutar(new VincularUsuarioCommand(paciente.id, 'usuario-2')),
    ).rejects.toThrow(PacienteYaVinculado);
  });

  it('un usuario no puede quedar vinculado a dos fichas', async () => {
    await nuevoPaciente('30111222', 'usuario-1');
    const otro = await nuevoPaciente('30333444');

    await expect(
      handler.ejecutar(new VincularUsuarioCommand(otro.id, 'usuario-1')),
    ).rejects.toThrow(UsuarioYaVinculado);
  });

  it('si la ficha no existe lanza PacienteNoEncontrado', async () => {
    await expect(
      handler.ejecutar(new VincularUsuarioCommand('inexistente', 'usuario-1')),
    ).rejects.toThrow(PacienteNoEncontrado);
  });
});
