import { PrescripcionCreadaEvent } from '../../../hce/public';
import { IndicacionRepositoryEnMemoria } from '../../testing/indicacion.repository.en-memoria';
import { GenerarIndicacionesHandler } from '../generar-indicaciones/generar-indicaciones.handler';
import { OnPrescripcionCreadaHandler } from './on-prescripcion-creada.handler';

describe('OnPrescripcionCreadaHandler', () => {
  it('reacciona al evento PrescripcionCreada y genera indicaciones', async () => {
    const repo = new IndicacionRepositoryEnMemoria();
    const useCase = new GenerarIndicacionesHandler(repo);
    const handler = new OnPrescripcionCreadaHandler(useCase);

    const evento = new PrescripcionCreadaEvent({
      prescripcionId: 'presc-1',
      pacienteId: 'pac-1',
      internacionId: 'intern-1',
      medicamento: 'Amoxicilina',
      dosis: '500 mg',
      frecuenciaHoras: 8,
      duracionDias: 1,
      inicioEn: new Date('2026-10-23T08:00:00Z'),
    });

    await handler.manejar(evento);

    const indicaciones = await repo.listar();
    expect(indicaciones).toHaveLength(3);
    expect(indicaciones[0]?.descripcion).toBe('Amoxicilina 500 mg');
  });
});
