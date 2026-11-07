import { RelojFijo } from '../../../../building-blocks/testing';
import { MedicoYaExiste } from '../../domain/errores';
import { MedicoRepositoryEnMemoria } from '../../testing/medico.repository.en-memoria';
import { RegistrarMedicoCommand } from './registrar-medico.command';
import { RegistrarMedicoHandler } from './registrar-medico.handler';

describe('RegistrarMedicoHandler', () => {
  let repo: MedicoRepositoryEnMemoria;
  let handler: RegistrarMedicoHandler;
  const ahora = new Date('2026-10-23T10:00:00Z');

  beforeEach(() => {
    repo = new MedicoRepositoryEnMemoria();
    handler = new RegistrarMedicoHandler(repo, new RelojFijo(ahora));
  });

  it('debería registrar un nuevo médico', async () => {
    const res = await handler.ejecutar(
      new RegistrarMedicoCommand({
        usuarioId: 'usr-med-1',
        matricula: 'MN-12345',
        nombre: 'Esteban',
        apellido: 'Quito',
        especialidad: 'Traumatología',
      }),
    );

    expect(res.id).toBeDefined();
    expect(res.matricula).toBe('MN-12345');
    expect(res.especialidad).toBe('Traumatología');
  });

  it('debería fallar si la matrícula ya existe', async () => {
    await handler.ejecutar(
      new RegistrarMedicoCommand({
        usuarioId: 'usr-med-1',
        matricula: 'MN-12345',
        nombre: 'Esteban',
        apellido: 'Quito',
        especialidad: 'Traumatología',
      }),
    );

    await expect(
      handler.ejecutar(
        new RegistrarMedicoCommand({
          usuarioId: 'usr-med-2',
          matricula: 'MN-12345',
          nombre: 'Otro',
          apellido: 'Médico',
          especialidad: 'Clínica',
        }),
      ),
    ).rejects.toThrow(MedicoYaExiste);
  });
});

