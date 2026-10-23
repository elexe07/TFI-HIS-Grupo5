import {
  FrecuenciaCardiacaInvalida,
  PresionArterialInvalida,
  SaturacionO2Invalida,
  SignosVitalesVacios,
  TemperaturaInvalida,
} from './errores';
import { SignosVitales } from './signos-vitales';

describe('SignosVitales', () => {
  const baseProps = {
    pacienteId: 'paciente-1',
    registradoPor: 'enfermero-1',
  };

  it('permite registrar signos vitales dentro de rangos válidos', () => {
    const sv = SignosVitales.crear({
      ...baseProps,
      temperatura: 36.8,
      presionSistolica: 120,
      presionDiastolica: 80,
      frecuenciaCardiaca: 72,
      saturacionO2: 98,
    });

    expect(sv.temperatura).toBe(36.8);
    expect(sv.presionSistolica).toBe(120);
    expect(sv.presionDiastolica).toBe(80);
    expect(sv.frecuenciaCardiaca).toBe(72);
    expect(sv.saturacionO2).toBe(98);
  });

  it('falla si no se proporciona ningún signo vital', () => {
    expect(() => SignosVitales.crear(baseProps)).toThrow(SignosVitalesVacios);
  });

  it('falla si la temperatura es menor a 30 °C', () => {
    expect(() =>
      SignosVitales.crear({ ...baseProps, temperatura: 29.5 }),
    ).toThrow(TemperaturaInvalida);
  });

  it('falla si la temperatura es mayor a 45 °C', () => {
    expect(() =>
      SignosVitales.crear({ ...baseProps, temperatura: 45.1 }),
    ).toThrow(TemperaturaInvalida);
  });

  it('falla si la saturación de oxígeno es menor a 50%', () => {
    expect(() =>
      SignosVitales.crear({ ...baseProps, saturacionO2: 49 }),
    ).toThrow(SaturacionO2Invalida);
  });

  it('falla si la saturación de oxígeno es mayor a 100%', () => {
    expect(() =>
      SignosVitales.crear({ ...baseProps, saturacionO2: 101 }),
    ).toThrow(SaturacionO2Invalida);
  });

  it('falla si la presión diastólica es mayor que la sistólica', () => {
    expect(() =>
      SignosVitales.crear({
        ...baseProps,
        presionSistolica: 90,
        presionDiastolica: 100,
      }),
    ).toThrow(PresionArterialInvalida);
  });

  it('falla si la frecuencia cardíaca está fuera de rango', () => {
    expect(() =>
      SignosVitales.crear({ ...baseProps, frecuenciaCardiaca: 0 }),
    ).toThrow(FrecuenciaCardiacaInvalida);

    expect(() =>
      SignosVitales.crear({ ...baseProps, frecuenciaCardiaca: 350 }),
    ).toThrow(FrecuenciaCardiacaInvalida);
  });
});

