import { Indicacion } from '../../domain/indicacion';
import { IndicacionRepositoryEnMemoria } from '../../testing/indicacion.repository.en-memoria';
import { ListarIndicacionesHandler } from './listar-indicaciones.handler';
import { ListarIndicacionesQuery } from './listar-indicaciones.query';

describe('ListarIndicacionesHandler', () => {
  let repo: IndicacionRepositoryEnMemoria;
  let handler: ListarIndicacionesHandler;

  beforeEach(() => {
    repo = new IndicacionRepositoryEnMemoria();
    handler = new ListarIndicacionesHandler(repo);
  });

  it('lista indicaciones filtrando por fecha y paciente', async () => {
    const ind1 = Indicacion.crear({
      internacionId: 'intern-1',
      pacienteId: 'pac-1',
      prescripcionId: 'presc-1',
      descripcion: 'Amoxicilina 500 mg',
      programadaPara: new Date('2026-10-23T08:00:00Z'),
    });
    const ind2 = Indicacion.crear({
      internacionId: 'intern-1',
      pacienteId: 'pac-1',
      prescripcionId: 'presc-1',
      descripcion: 'Amoxicilina 500 mg',
      programadaPara: new Date('2026-10-24T08:00:00Z'),
    });
    const ind3 = Indicacion.crear({
      internacionId: 'intern-2',
      pacienteId: 'pac-2',
      prescripcionId: 'presc-2',
      descripcion: 'Paracetamol 500 mg',
      programadaPara: new Date('2026-10-23T09:00:00Z'),
    });

    await repo.guardarMuchas([ind1, ind2, ind3]);

    const resultadoDia23Pac1 = await handler.ejecutar(
      new ListarIndicacionesQuery({
        pacienteId: 'pac-1',
        fecha: new Date('2026-10-23T12:00:00Z'),
      }),
    );

    expect(resultadoDia23Pac1).toHaveLength(1);
    expect(resultadoDia23Pac1[0]?.id).toBe(ind1.id);
  });
});

