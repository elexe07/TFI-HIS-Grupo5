import { EventBusEnMemoria } from '../../../../building-blocks/testing';
import {
  Cama,
  EstadoCama,
  EstadoInternacion,
  Internacion,
  InternacionNoEncontrada,
  InternacionYaFinalizada,
  PacienteDadoDeAlta,
} from '../../domain';
import { CamaRepositoryEnMemoria, InternacionRepositoryEnMemoria } from '../../testing';
import { DarDeAltaCommand } from './dar-de-alta.command';
import { DarDeAltaHandler } from './dar-de-alta.handler';

describe('DarDeAltaHandler (REC-02)', () => {
  let camas: CamaRepositoryEnMemoria;
  let internaciones: InternacionRepositoryEnMemoria;
  let eventBus: EventBusEnMemoria;
  let handler: DarDeAltaHandler;

  const camaId = '11111111-1111-1111-1111-111111111111';
  const habitacionId = '22222222-2222-2222-2222-222222222222';
  const pacienteId = '33333333-3333-3333-3333-333333333333';
  const medicoId = '44444444-4444-4444-4444-444444444444';
  const internacionId = '55555555-5555-5555-5555-555555555555';
  const ingresoEn = new Date('2026-10-20T10:00:00Z');

  beforeEach(async () => {
    camas = new CamaRepositoryEnMemoria();
    internaciones = new InternacionRepositoryEnMemoria();
    eventBus = new EventBusEnMemoria();
    handler = new DarDeAltaHandler(internaciones, camas, eventBus);

    await camas.guardar(
      Cama.reconstituir({
        id: camaId,
        habitacionId,
        codigo: 'G-1A',
        estado: EstadoCama.OCUPADA,
      }),
    );

    const internacion = Internacion.reconstituir({
      id: internacionId,
      pacienteId,
      camaId,
      medicoId,
      motivo: 'Control postquirúrgico',
      estado: EstadoInternacion.ACTIVA,
      ingresoEn,
      egresoEn: null,
    });
    await internaciones.guardar(internacion);
  });

  it('da de alta la internación, pasa la cama a EN_LIMPIEZA y emite PacienteDadoDeAlta', async () => {
    const egresoEn = new Date('2026-10-23T14:00:00Z');
    const dto = await handler.ejecutar(new DarDeAltaCommand({ internacionId, egresoEn }));

    expect(dto.estado).toBe(EstadoInternacion.ALTA);
    expect(dto.egresoEn).toBe(egresoEn.toISOString());

    const camaGuardada = await camas.buscarPorId(camaId);
    expect(camaGuardada?.estado).toBe(EstadoCama.EN_LIMPIEZA);

    expect(eventBus.publicados).toHaveLength(1);
    expect(eventBus.publicados[0]).toBeInstanceOf(PacienteDadoDeAlta);
    const ev = eventBus.publicados[0] as PacienteDadoDeAlta;
    expect(ev.internacionId).toBe(internacionId);
    expect(ev.pacienteId).toBe(pacienteId);
    expect(ev.egresoEn).toEqual(egresoEn);
  });

  it('falla con InternacionNoEncontrada si la internación no existe', async () => {
    const cmd = new DarDeAltaCommand({ internacionId: '99999999-9999-9999-9999-999999999999' });
    await expect(handler.ejecutar(cmd)).rejects.toThrow(InternacionNoEncontrada);
  });

  it('falla con InternacionYaFinalizada si ya había sido dada de alta', async () => {
    await handler.ejecutar(
      new DarDeAltaCommand({ internacionId, egresoEn: new Date('2026-10-23T10:00:00Z') }),
    );

    await expect(
      handler.ejecutar(
        new DarDeAltaCommand({ internacionId, egresoEn: new Date('2026-10-23T11:00:00Z') }),
      ),
    ).rejects.toThrow(InternacionYaFinalizada);
  });
});
