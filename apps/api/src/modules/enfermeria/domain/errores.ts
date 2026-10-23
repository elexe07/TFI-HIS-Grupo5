import { Conflicto, ErrorDeValidacion, NoEncontrado } from '../../../building-blocks/domain';

export class IndicacionNoEncontrada extends NoEncontrado {
  constructor(id: string) {
    super(`No se encontró la indicación con id ${id}`, 'INDICACION_NO_ENCONTRADA');
  }
}

export class IndicacionNoEstaPendiente extends Conflicto {
  constructor(id: string, estadoActual: string) {
    super(
      `La indicación ${id} no está pendiente (estado actual: ${estadoActual})`,
      'INDICACION_NO_ESTA_PENDIENTE',
    );
  }
}

export class MotivoOmisionRequerido extends ErrorDeValidacion {
  constructor() {
    super('El motivo de omisión es obligatorio', 'MOTIVO_OMISION_REQUERIDO');
  }
}

export class TemperaturaInvalida extends ErrorDeValidacion {
  constructor(valor: number) {
    super(
      `La temperatura ${valor} °C está fuera del rango permitido (30 - 45 °C)`,
      'TEMPERATURA_INVALIDA',
    );
  }
}

export class SaturacionO2Invalida extends ErrorDeValidacion {
  constructor(valor: number) {
    super(
      `La saturación de oxígeno ${valor}% está fuera del rango permitido (50 - 100%)`,
      'SATURACION_O2_INVALIDA',
    );
  }
}

export class PresionArterialInvalida extends ErrorDeValidacion {
  constructor(mensaje: string) {
    super(mensaje, 'PRESION_ARTERIAL_INVALIDA');
  }
}

export class FrecuenciaCardiacaInvalida extends ErrorDeValidacion {
  constructor(valor: number) {
    super(
      `La frecuencia cardíaca ${valor} lpm está fuera del rango permitido (1 - 300 lpm)`,
      'FRECUENCIA_CARDIACA_INVALIDA',
    );
  }
}

export class SignosVitalesVacios extends ErrorDeValidacion {
  constructor() {
    super('Debe registrar al menos un signo vital', 'SIGNOS_VITALES_VACIOS');
  }
}

export class TextoNotaRequerido extends ErrorDeValidacion {
  constructor() {
    super('El texto de la nota de enfermería no puede estar vacío', 'TEXTO_NOTA_REQUERIDO');
  }
}

export class MedicacionYaAdministrada extends Conflicto {
  constructor(indicacionId: string) {
    super(
      `La indicación ${indicacionId} ya fue administrada previamente`,
      'MEDICACION_YA_ADMINISTRADA',
    );
  }
}

