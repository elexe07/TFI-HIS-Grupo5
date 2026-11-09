import { EventBusEnMemoria } from '../../../../building-blocks/testing';
import {
  Cama,
  CamaNoEncontrada,
  CamaNoLibre,
  EstadoCama,
  EstadoInternacion,
  PacienteInternado,
  PacienteYaInternado,
} from '../../domain';
import { CamaRepositoryEnMemoria, InternacionRepositoryEnMemoria } from '../../testing';
import { InternarPacienteCommand } from './internar-paciente.command';
import { InternarPacienteHandler } from './internar-paciente.handler';

describe('InternarPacienteHandler (REC-01)', () => {
  let camas: CamaRepositoryEnMemoria;
  let internaciones: InternacionRepositoryEnMemoria;
  let eventBus: EventBusEnMemoria;
  let handler: InternarPacienteHandler;

  const camaId = '11111111-1111-1111-1111-111111111111';
  const habitacionId = '22222222-2222-2222-2222-222222222222';
  const pacienteId = '33333333-3333-3333-3333-333333333333';
  const medicoId = '44444444-4444-4444-4444-444444444444';

  const comandoValido = () =>
    new InternarPacienteCommand({
      pacienteId,
      camaId,
      medicoId,
      motivo: 'Insuficiencia respiratoria',
      ingresoEn: new Date('2026-10-23T10:00:00Z'),
    });

  beforeEach(async () => {
    camas = new CamaRepositoryEnMemoria();
    internaciones = new InternacionRepositoryEnMemoria();
    eventBus = new EventBusEnMemoria();
    handler = new InternarPacienteHandler(camas, internaciones, eventBus);

    await camas.guardar(
      Cama.reconstituir({
        id: camaId,
        habitacionId,
        codigo: 'G-1A',
        estado: EstadoCama.LIBRE,
      }),
    );
  });

  it('interna al paciente en cama libre, cambia cama a OCUPADA y publica PacienteInternado', async () => {
    const dto = await handler.ejecutar(comandoValido());

    expect(dto).toMatchObject({
      pacienteId,
      camaId,
      medicoId,
      motivo: 'Insuficiencia respiratoria',
      estado: EstadoInternacion.ACTIVA,
    });

    const camaGuardada = await camas.buscarPorId(camaId);
    expect(camaGuardada?.estado).toBe(EstadoCama.OCUPADA);

    const internacionGuardada = await internaciones.buscarPorId(dto.id);
    expect(internacionGuardada?.estado).toBe(EstadoInternacion.ACTIVA);

    expect(eventBus.publicados).toHaveLength(1);
    expect(eventBus.publicados[0]).toBeInstanceOf(PacienteInternado);
    const ev = eventBus.publicados[0] as PacienteInternado;
    expect(ev.pacienteId).toBe(pacienteId);
    expect(ev.camaId).toBe(camaId);
  });

  it('falla con CamaNoLibre si la cama no está en estado LIBRE', async () => {
    const camaOcupada = Cama.reconstituir({
      id: camaId,
      habitacionId,
      codigo: 'G-1A',
      estado: EstadoCama.OCUPADA,
    });
    await camas.guardar(camaOcupada);

    await expect(handler.ejecutar(comandoValido())).rejects.toThrow(CamaNoLibre);
  });

  it('falla con CamaNoEncontrada si la cama no existe', async () => {
    const cmd = new InternarPacienteCommand({
      ...comandoValido(),
      camaId: '99999999-9999-9999-9999-999999999999',
    });

    await expect(handler.ejecutar(cmd)).rejects.toThrow(CamaNoEncontrada);
  });

  it('falla con PacienteYaInternado si el paciente ya tiene una internación activa', async () => {
    await handler.ejecutar(comandoValido());

    // Crear otra cama libre para intentar asignarle
    const otraCamaId = '55555555-5555-5555-5555-555555555555';
    await camas.guardar(
      Cama.reconstituir({
        id: otraCamaId,
        habitacionId,
        codigo: 'G-1B',
        estado: EstadoCama.LIBRE,
      }),
    );

    const cmdSegundo = new InternarPacienteCommand({
      ...comandoValido(),
      camaId: otraCamaId,
    });

    await expect(handler.ejecutar(cmdSegundo)).rejects.toThrow(PacienteYaInternado);
  });
});
