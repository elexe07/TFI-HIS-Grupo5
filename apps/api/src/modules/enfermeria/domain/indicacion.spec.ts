import { ESTADOS_INDICACION } from './estado-indicacion';
import { IndicacionNoEstaPendiente, MotivoOmisionRequerido } from './errores';
import { Indicacion } from './indicacion';
import { MEDICACION_ADMINISTRADA } from './events/medicacion-administrada.event';

describe('Indicacion', () => {
  const fecha = new Date('2026-10-23T10:00:00Z');

  const crearIndicacion = () =>
    Indicacion.crear({
      internacionId: 'internacion-1',
      pacienteId: 'paciente-1',
      prescripcionId: 'prescripcion-1',
      descripcion: 'Amoxicilina 500 mg',
      programadaPara: fecha,
    });

  it('se crea en estado PENDIENTE sin motivo de omisión', () => {
    const indicacion = crearIndicacion();

    expect(indicacion.estado).toBe(ESTADOS_INDICACION.PENDIENTE);
    expect(indicacion.motivoOmision).toBeNull();
    expect(indicacion.descripcion).toBe('Amoxicilina 500 mg');
  });

  it('permite administrar la medicación si está pendiente y emite MedicacionAdministrada', () => {
    const indicacion = crearIndicacion();
    const administradaEn = new Date('2026-10-23T10:05:00Z');

    const administracion = indicacion.administrar('enfermero-1', administradaEn);

    expect(indicacion.estado).toBe(ESTADOS_INDICACION.EJECUTADA);
    expect(indicacion.updatedAt).toEqual(administradaEn);
    expect(administracion.indicacionId).toBe(indicacion.id);
    expect(administracion.medicamento).toBe('Amoxicilina 500 mg');
    expect(administracion.administradaPor).toBe('enfermero-1');

    const eventos = indicacion.extraerEventos();
    expect(eventos).toHaveLength(1);
    expect(eventos[0]?.nombre).toBe(MEDICACION_ADMINISTRADA);
  });

  it('falla si se intenta administrar cuando no está pendiente', () => {
    const indicacion = crearIndicacion();
    indicacion.administrar('enfermero-1', new Date());

    expect(() => indicacion.administrar('enfermero-2', new Date())).toThrow(
      IndicacionNoEstaPendiente,
    );
  });

  it('permite omitir la indicación con un motivo si está pendiente', () => {
    const indicacion = crearIndicacion();
    const omitidaEn = new Date('2026-10-23T10:10:00Z');

    indicacion.omitir('Paciente dormido', omitidaEn);

    expect(indicacion.estado).toBe(ESTADOS_INDICACION.OMITIDA);
    expect(indicacion.motivoOmision).toBe('Paciente dormido');
    expect(indicacion.updatedAt).toEqual(omitidaEn);
  });

  it('falla al omitir si no se provee motivo', () => {
    const indicacion = crearIndicacion();

    expect(() => indicacion.omitir('   ', new Date())).toThrow(MotivoOmisionRequerido);
  });

  it('falla al omitir si la indicación ya fue ejecutada u omitida', () => {
    const indicacion = crearIndicacion();
    indicacion.omitir('Paciente rechaza medicación', new Date());

    expect(() => indicacion.omitir('Otro motivo', new Date())).toThrow(
      IndicacionNoEstaPendiente,
    );
  });
});
