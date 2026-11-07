import { Turno } from '../../domain/turno';
import { TurnoRepositoryEnMemoria } from '../../testing/turno.repository.en-memoria';
import { ListarTurnosHandler } from './listar-turnos.handler';
import { ListarTurnosQuery } from './listar-turnos.query';

describe('ListarTurnosHandler', () => {
  it('debería listar turnos filtrados por médico o paciente', async () => {
    const repo = new TurnoRepositoryEnMemoria();
    const handler = new ListarTurnosHandler(repo);
    const ahora = new Date('2026-10-23T10:00:00Z');

    await repo.guardar(
      Turno.crear(
        {
          pacienteId: 'p1',
          medicoId: 'm1',
          inicio: new Date('2026-10-26T08:00:00Z'),
          fin: new Date('2026-10-26T08:30:00Z'),
          creadoPor: 'recep-1',
        },
        ahora,
      ),
    );

    await repo.guardar(
      Turno.crear(
        {
          pacienteId: 'p2',
          medicoId: 'm2',
          inicio: new Date('2026-10-26T09:00:00Z'),
          fin: new Date('2026-10-26T09:30:00Z'),
          creadoPor: 'recep-1',
        },
        ahora,
      ),
    );

    const porMedico = await handler.ejecutar(new ListarTurnosQuery({ medicoId: 'm1' }));
    expect(porMedico).toHaveLength(1);
    expect(porMedico[0]?.pacienteId).toBe('p1');

    const todos = await handler.ejecutar(new ListarTurnosQuery());
    expect(todos).toHaveLength(2);
  });
});

