import { Entity, generarId, type Id } from '../../../building-blocks/domain';
import {
  FrecuenciaCardiacaInvalida,
  PresionArterialInvalida,
  SaturacionO2Invalida,
  SignosVitalesVacios,
  TemperaturaInvalida,
} from './errores';

export interface PropsCrearSignosVitales {
  readonly id?: string;
  readonly pacienteId: string;
  readonly internacionId?: string | null;
  readonly temperatura?: number | null;
  readonly presionSistolica?: number | null;
  readonly presionDiastolica?: number | null;
  readonly frecuenciaCardiaca?: number | null;
  readonly saturacionO2?: number | null;
  readonly registradoEn?: Date;
  readonly registradoPor: string;
}

export interface PropsSignosVitales {
  readonly pacienteId: string;
  readonly internacionId: string | null;
  readonly temperatura: number | null;
  readonly presionSistolica: number | null;
  readonly presionDiastolica: number | null;
  readonly frecuenciaCardiaca: number | null;
  readonly saturacionO2: number | null;
  readonly registradoEn: Date;
  readonly registradoPor: string;
}

interface ValoresSignosVitales {
  temperatura: number | null;
  presionSistolica: number | null;
  presionDiastolica: number | null;
  frecuenciaCardiaca: number | null;
  saturacionO2: number | null;
}

function validarTemperatura(valor: number | null): void {
  if (valor !== null && (valor < 30 || valor > 45)) {
    throw new TemperaturaInvalida(valor);
  }
}

function validarSaturacionO2(valor: number | null): void {
  if (valor !== null && (valor < 50 || valor > 100)) {
    throw new SaturacionO2Invalida(valor);
  }
}

function validarSistolica(sistolica: number | null): void {
  if (sistolica !== null && (sistolica <= 0 || sistolica > 300)) {
    throw new PresionArterialInvalida(
      `La presión sistólica ${sistolica} mmHg es inválida (debe estar entre 1 y 300 mmHg)`,
    );
  }
}

function validarDiastolica(diastolica: number | null): void {
  if (diastolica !== null && (diastolica <= 0 || diastolica > 200)) {
    throw new PresionArterialInvalida(
      `La presión diastólica ${diastolica} mmHg es inválida (debe estar entre 1 y 200 mmHg)`,
    );
  }
}

function validarPresionArterial(sistolica: number | null, diastolica: number | null): void {
  validarSistolica(sistolica);
  validarDiastolica(diastolica);
  if (sistolica !== null && diastolica !== null && diastolica > sistolica) {
    throw new PresionArterialInvalida(
      'La presión diastólica no puede ser mayor que la presión sistólica',
    );
  }
}

function validarFrecuenciaCardiaca(valor: number | null): void {
  if (valor !== null && (valor <= 0 || valor > 300)) {
    throw new FrecuenciaCardiacaInvalida(valor);
  }
}

function extraerValores(props: PropsCrearSignosVitales): ValoresSignosVitales {
  return {
    temperatura: props.temperatura ?? null,
    presionSistolica: props.presionSistolica ?? null,
    presionDiastolica: props.presionDiastolica ?? null,
    frecuenciaCardiaca: props.frecuenciaCardiaca ?? null,
    saturacionO2: props.saturacionO2 ?? null,
  };
}

function validarValores(valores: ValoresSignosVitales): void {
  const tieneSigno = Object.values(valores).some((v) => v !== null);
  if (!tieneSigno) {
    throw new SignosVitalesVacios();
  }
  validarTemperatura(valores.temperatura);
  validarSaturacionO2(valores.saturacionO2);
  validarPresionArterial(valores.presionSistolica, valores.presionDiastolica);
  validarFrecuenciaCardiaca(valores.frecuenciaCardiaca);
}

/**
 * SignosVitales (Entidad inmutable).
 * Registra los parámetros fisiológicos del paciente con sus rangos biológicos válidos.
 */
export class SignosVitales extends Entity<Id> {
  readonly pacienteId: string;
  readonly internacionId: string | null;
  readonly temperatura: number | null;
  readonly presionSistolica: number | null;
  readonly presionDiastolica: number | null;
  readonly frecuenciaCardiaca: number | null;
  readonly saturacionO2: number | null;
  readonly registradoEn: Date;
  readonly registradoPor: string;

  private constructor(id: Id, props: PropsSignosVitales) {
    super(id);
    this.pacienteId = props.pacienteId;
    this.internacionId = props.internacionId;
    this.temperatura = props.temperatura;
    this.presionSistolica = props.presionSistolica;
    this.presionDiastolica = props.presionDiastolica;
    this.frecuenciaCardiaca = props.frecuenciaCardiaca;
    this.saturacionO2 = props.saturacionO2;
    this.registradoEn = props.registradoEn;
    this.registradoPor = props.registradoPor;
  }

  static crear(props: PropsCrearSignosVitales): SignosVitales {
    const valores = extraerValores(props);
    validarValores(valores);

    return new SignosVitales(props.id ?? generarId(), {
      pacienteId: props.pacienteId,
      internacionId: props.internacionId ?? null,
      ...valores,
      registradoEn: props.registradoEn ?? new Date(),
      registradoPor: props.registradoPor,
    });
  }

  static reconstituir(id: Id, props: PropsSignosVitales): SignosVitales {
    return new SignosVitales(id, props);
  }
}
