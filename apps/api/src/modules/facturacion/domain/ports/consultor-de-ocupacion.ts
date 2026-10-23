export const CONSULTOR_DE_OCUPACION = Symbol('CONSULTOR_DE_OCUPACION');

export interface ResumenOcupacion {
  readonly totalCamas: number;
  readonly ocupadas: number;
  readonly libres: number;
  readonly enLimpieza: number;
  readonly bloqueadas: number;
  readonly porcentajeOcupacion: number;
}

export interface ConsultorDeOcupacion {
  consultarOcupacion(): Promise<ResumenOcupacion>;
}

