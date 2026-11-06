import { DatosDeTriajeInvalidos, Triaje } from './triaje';
import { EstadoTriaje, NivelTriaje } from './tipos';
import { NivelTriajeInvalido } from './errores';

describe('Triaje', () => {
  const ahora = new Date('2026-10-23T10:00:00Z');

  it('debería crearse correctamente en estado EN_ESPERA', () => {
    const triaje = Triaje.crear(
      {
        pacienteId: 'pac-1',
        nivel: NivelTriaje.AMARILLO,
        motivo: 'Dolor abdominal moderado',
        registradoPor: 'enf-1',
      },
      ahora,
    );

    expect(triaje.id).toBeDefined();
    expect(triaje.pacienteId).toBe('pac-1');
    expect(triaje.nivel).toBe(NivelTriaje.AMARILLO);
    expect(triaje.estado).toBe(EstadoTriaje.EN_ESPERA);
    expect(triaje.llegadaEn).toEqual(ahora);
    expect(triaje.registradoPor).toBe('enf-1');
  });

  it('debería fallar si el nivel es inválido o no se especifica', () => {
    expect(() =>
      Triaje.crear(
        {
          pacienteId: 'pac-1',
          nivel: '' as NivelTriaje,
          motivo: 'Fiebre',
          registradoPor: 'enf-1',
        },
        ahora,
      ),
    ).toThrow(NivelTriajeInvalido);
  });

  it('debería fallar si falta el motivo', () => {
    expect(() =>
      Triaje.crear(
        {
          pacienteId: 'pac-1',
          nivel: NivelTriaje.VERDE,
          motivo: '   ',
          registradoPor: 'enf-1',
        },
        ahora,
      ),
    ).toThrow(DatosDeTriajeInvalidos);
  });

  it('debería ordenar la cola de guardia por nivel de urgencia y luego por orden de llegada', () => {
    const tVerde1 = Triaje.crear(
      { pacienteId: 'p1', nivel: NivelTriaje.VERDE, motivo: 'Tos', registradoPor: 'enf-1' },
      new Date('2026-10-23T08:00:00Z'),
    );
    const tRojo1 = Triaje.crear(
      {
        pacienteId: 'p2',
        nivel: NivelTriaje.ROJO,
        motivo: 'Paro cardíaco',
        registradoPor: 'enf-1',
      },
      new Date('2026-10-23T08:30:00Z'),
    );
    const tAmarillo1 = Triaje.crear(
      { pacienteId: 'p3', nivel: NivelTriaje.AMARILLO, motivo: 'Fractura', registradoPor: 'enf-1' },
      new Date('2026-10-23T08:15:00Z'),
    );
    const tAmarillo2 = Triaje.crear(
      {
        pacienteId: 'p4',
        nivel: NivelTriaje.AMARILLO,
        motivo: 'Apendicitis',
        registradoPor: 'enf-1',
      },
      new Date('2026-10-23T08:05:00Z'),
    );

    const colaDesordenada = [tVerde1, tRojo1, tAmarillo1, tAmarillo2];
    colaDesordenada.sort(Triaje.compararParaCola);

    expect(colaDesordenada[0]?.id).toBe(tRojo1.id);
    expect(colaDesordenada[1]?.id).toBe(tAmarillo2.id);
    expect(colaDesordenada[2]?.id).toBe(tAmarillo1.id);
    expect(colaDesordenada[3]?.id).toBe(tVerde1.id);
  });
});
