import { RelojFijo } from '../../../../building-blocks/testing';
import { Indicacion } from '../../domain/indicacion';
import {
  IndicacionNoEncontrada,
  IndicacionNoEstaPendiente,
  MotivoOmisionRequerido,
} from '../../domain/errores';
import { IndicacionRepositoryEnMemoria } from '../../testing/indicacion.repository.en-memoria';
import { OmitirIndicacionCommand } from './omitir-indicacion.command';
import { OmitirIndicacionHandler } from './omitir-indicacion.handler';

describe('OmitirIndicacionHandler', () => {
  let repo: IndicacionRepositoryEnMemoria;
  let reloj: RelojFijo;
  let handler: OmitirIndicacionHandler;

  beforeEach(() => {
    repo = new IndicacionRepositoryEnMemoria();
    reloj = new RelojFijo(new Date('2026-10-23T14:00:00Z'));
    handler = new OmitirIndicacionHandler(repo, reloj);
  });

  it('omite la indicación guardando el motivo y fecha', async () => {
    const indicacion = Indicacion.crear({
      internacionId: 'intern-1',
      pacienteId: 'pac-1',
      prescripcionId: 'presc-1',
      descripcion: 'Amoxicilina 500 mg',
      programadaPara: new Date('2026-10-23T14:00:00Z'),
    });
    await repo.guardar(indicacion);

    const res = await handler.ejecutar(
      new OmitirIndicacionCommand(indicacion.id, 'Paciente en ayunas por cirugía', 'enf-1'),
    );

    expect(res.estado).toBe('OMITIDA');
    expect(res.motivoOmision).toBe('Paciente en ayunas por cirugía');
    expect(res.updatedAt).toEqual(reloj.ahora());

    const guardada = await repo.buscarPorId(indicacion.id);
    expect(guardada?.estado).toBe('OMITIDA');
    expect(guardada?.motivoOmision).toBe('Paciente en ayunas por cirugía');
  });

  it('falla si la indicación no existe', async () => {
    await expect(
      handler.ejecutar(new OmitirIndicacionCommand('id-inexistente', 'motivo', 'enf-1')),
    ).rejects.toThrow(IndicacionNoEncontrada);
  });

  it('falla si el motivo está vacío', async () => {
    const indicacion = Indicacion.crear({
      internacionId: 'intern-1',
      pacienteId: 'pac-1',
      prescripcionId: 'presc-1',
      descripcion: 'Amoxicilina 500 mg',
      programadaPara: new Date(),
    });
    await repo.guardar(indicacion);

    await expect(
      handler.ejecutar(new OmitirIndicacionCommand(indicacion.id, '  ', 'enf-1')),
    ).rejects.toThrow(MotivoOmisionRequerido);
  });

  it('falla si la indicación no está en estado PENDIENTE', async () => {
    const indicacion = Indicacion.crear({
      internacionId: 'intern-1',
      pacienteId: 'pac-1',
      prescripcionId: 'presc-1',
      descripcion: 'Amoxicilina 500 mg',
      programadaPara: new Date(),
    });
    indicacion.administrar('enf-1', new Date());
    await repo.guardar(indicacion);

    await expect(
      handler.ejecutar(new OmitirIndicacionCommand(indicacion.id, 'Motivo', 'enf-1')),
    ).rejects.toThrow(IndicacionNoEstaPendiente);
  });
});

