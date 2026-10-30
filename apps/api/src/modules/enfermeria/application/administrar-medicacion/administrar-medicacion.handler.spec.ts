import { EventBusEnMemoria, RelojFijo } from '../../../../building-blocks/testing';
import { Indicacion } from '../../domain/indicacion';
import {
  IndicacionNoEncontrada,
  IndicacionNoEstaPendiente,
  MedicacionYaAdministrada,
} from '../../domain/errores';
import { MEDICACION_ADMINISTRADA } from '../../domain/events/medicacion-administrada.event';
import { AdministracionMedicacionRepositoryEnMemoria } from '../../testing/administracion-medicacion.repository.en-memoria';
import { IndicacionRepositoryEnMemoria } from '../../testing/indicacion.repository.en-memoria';
import { AdministrarMedicacionCommand } from './administrar-medicacion.command';
import { AdministrarMedicacionHandler } from './administrar-medicacion.handler';

describe('AdministrarMedicacionHandler', () => {
  let indicacionRepo: IndicacionRepositoryEnMemoria;
  let administracionRepo: AdministracionMedicacionRepositoryEnMemoria;
  let bus: EventBusEnMemoria;
  let reloj: RelojFijo;
  let handler: AdministrarMedicacionHandler;

  beforeEach(() => {
    indicacionRepo = new IndicacionRepositoryEnMemoria();
    administracionRepo = new AdministracionMedicacionRepositoryEnMemoria();
    bus = new EventBusEnMemoria();
    reloj = new RelojFijo(new Date('2026-10-23T12:00:00Z'));
    handler = new AdministrarMedicacionHandler(indicacionRepo, administracionRepo, bus, reloj);
  });

  it('administra la medicación, actualiza indicación y emite MedicacionAdministrada', async () => {
    const indicacion = Indicacion.crear({
      internacionId: 'intern-1',
      pacienteId: 'pac-1',
      prescripcionId: 'presc-1',
      descripcion: 'Amoxicilina 500 mg',
      programadaPara: new Date('2026-10-23T12:00:00Z'),
    });
    await indicacionRepo.guardar(indicacion);

    const res = await handler.ejecutar(
      new AdministrarMedicacionCommand(indicacion.id, 'enfermero-1'),
    );

    expect(res.indicacionId).toBe(indicacion.id);
    expect(res.medicamento).toBe('Amoxicilina 500 mg');
    expect(res.administradaPor).toBe('enfermero-1');
    expect(res.administradaEn).toEqual(reloj.ahora());

    const indActualizada = await indicacionRepo.buscarPorId(indicacion.id);
    expect(indActualizada?.estado).toBe('EJECUTADA');

    const admGuardada = await administracionRepo.buscarPorIndicacionId(indicacion.id);
    expect(admGuardada).not.toBeNull();

    expect(bus.nombres()).toEqual([MEDICACION_ADMINISTRADA]);
  });

  it('falla si la indicación no existe', async () => {
    await expect(
      handler.ejecutar(new AdministrarMedicacionCommand('id-inexistente', 'enf-1')),
    ).rejects.toThrow(IndicacionNoEncontrada);
  });

  it('falla si la indicación no está en estado PENDIENTE', async () => {
    const indicacion = Indicacion.crear({
      internacionId: 'intern-1',
      pacienteId: 'pac-1',
      prescripcionId: 'presc-1',
      descripcion: 'Ibuprofeno 400 mg',
      programadaPara: new Date(),
    });
    indicacion.omitir('Dormido', new Date());
    await indicacionRepo.guardar(indicacion);

    await expect(
      handler.ejecutar(new AdministrarMedicacionCommand(indicacion.id, 'enf-1')),
    ).rejects.toThrow(IndicacionNoEstaPendiente);
  });

  it('falla si la medicación ya fue administrada previamente', async () => {
    const indicacion = Indicacion.crear({
      internacionId: 'intern-1',
      pacienteId: 'pac-1',
      prescripcionId: 'presc-1',
      descripcion: 'Ibuprofeno 400 mg',
      programadaPara: new Date(),
    });
    await indicacionRepo.guardar(indicacion);

    await handler.ejecutar(new AdministrarMedicacionCommand(indicacion.id, 'enf-1'));

    await expect(
      handler.ejecutar(new AdministrarMedicacionCommand(indicacion.id, 'enf-2')),
    ).rejects.toThrow(MedicacionYaAdministrada);
  });
});

