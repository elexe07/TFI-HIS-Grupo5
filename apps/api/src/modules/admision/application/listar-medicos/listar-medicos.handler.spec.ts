import { Medico } from '../../domain/medico';
import { MedicoRepositoryEnMemoria } from '../../testing/medico.repository.en-memoria';
import { ListarMedicosHandler } from './listar-medicos.handler';

describe('ListarMedicosHandler', () => {
  it('debería listar todos los médicos', async () => {
    const repo = new MedicoRepositoryEnMemoria();
    const handler = new ListarMedicosHandler(repo);
    const ahora = new Date('2026-10-23T10:00:00Z');

    await repo.guardar(
      Medico.crear(
        {
          usuarioId: 'u1',
          matricula: 'M1',
          nombre: 'Juan',
          apellido: 'Pérez',
          especialidad: 'Pediatría',
        },
        ahora,
      ),
    );

    const res = await handler.ejecutar();
    expect(res).toHaveLength(1);
    expect(res[0]?.matricula).toBe('M1');
  });
});
