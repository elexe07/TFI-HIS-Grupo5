import { IndicacionRepositoryEnMemoria } from '../../testing/indicacion.repository.en-memoria';
import { GenerarIndicacionesCommand } from './generar-indicaciones.command';
import { GenerarIndicacionesHandler } from './generar-indicaciones.handler';

describe('GenerarIndicacionesHandler', () => {
  let repo: IndicacionRepositoryEnMemoria;
  let handler: GenerarIndicacionesHandler;

  beforeEach(() => {
    repo = new IndicacionRepositoryEnMemoria();
    handler = new GenerarIndicacionesHandler(repo);
  });

  it('genera la cantidad correcta de indicaciones según frecuencia y duración', async () => {
    // 8 horas de frecuencia, 2 días de duración -> (24 / 8) * 2 = 6 indicaciones
    const inicio = new Date('2026-10-23T08:00:00Z');
    const command = new GenerarIndicacionesCommand({
      prescripcionId: 'presc-1',
      pacienteId: 'pac-1',
      internacionId: 'intern-1',
      medicamento: 'Ibuprofeno',
      dosis: '400 mg',
      frecuenciaHoras: 8,
      duracionDias: 2,
      inicioEn: inicio,
    });

    const res = await handler.ejecutar(command);

    expect(res.generadas).toBe(6);
    expect(res.omitidasPorExistentes).toBe(0);

    const guardadas = await repo.listar();
    expect(guardadas).toHaveLength(6);
    expect(guardadas[0]?.descripcion).toBe('Ibuprofeno 400 mg');
    expect(guardadas[0]?.programadaPara).toEqual(inicio);
    expect(guardadas[1]?.programadaPara).toEqual(new Date('2026-10-23T16:00:00Z'));
    expect(guardadas[2]?.programadaPara).toEqual(new Date('2026-10-24T00:00:00Z'));
  });

  it('es idempotente: si ya se generaron indicaciones para la misma prescripción y fecha, no las duplica', async () => {
    const inicio = new Date('2026-10-23T08:00:00Z');
    const command = new GenerarIndicacionesCommand({
      prescripcionId: 'presc-1',
      pacienteId: 'pac-1',
      internacionId: 'intern-1',
      medicamento: 'Paracetamol',
      dosis: '500 mg',
      frecuenciaHoras: 12,
      duracionDias: 1,
      inicioEn: inicio,
    });

    const primeraVez = await handler.ejecutar(command);
    expect(primeraVez.generadas).toBe(2);

    const segundaVez = await handler.ejecutar(command);
    expect(segundaVez.generadas).toBe(0);
    expect(segundaVez.omitidasPorExistentes).toBe(2);

    const guardadas = await repo.listar();
    expect(guardadas).toHaveLength(2);
  });
});
