export enum TipoDocumento {
  DNI = 'DNI',
  PASAPORTE = 'PASAPORTE',
  OTRO = 'OTRO',
}

export enum Sexo {
  F = 'F',
  M = 'M',
  X = 'X',
}

export enum EstadoTurno {
  RESERVADO = 'RESERVADO',
  CANCELADO = 'CANCELADO',
  ATENDIDO = 'ATENDIDO',
}

export enum NivelTriaje {
  ROJO = 'ROJO',
  NARANJA = 'NARANJA',
  AMARILLO = 'AMARILLO',
  VERDE = 'VERDE',
  AZUL = 'AZUL',
}

export enum EstadoTriaje {
  EN_ESPERA = 'EN_ESPERA',
  ATENDIDO = 'ATENDIDO',
}

/**
 * Prioridad de atención para triaje (1 es máxima urgencia).
 * ROJO (1) > NARANJA (2) > AMARILLO (3) > VERDE (4) > AZUL (5)
 */
export const PRIORIDAD_TRIAJE: Readonly<Record<NivelTriaje, number>> = {
  [NivelTriaje.ROJO]: 1,
  [NivelTriaje.NARANJA]: 2,
  [NivelTriaje.AMARILLO]: 3,
  [NivelTriaje.VERDE]: 4,
  [NivelTriaje.AZUL]: 5,
};

