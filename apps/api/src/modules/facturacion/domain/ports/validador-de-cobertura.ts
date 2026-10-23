export const VALIDADOR_DE_COBERTURA = Symbol('VALIDADOR_DE_COBERTURA');

export interface ResultadoValidacionCobertura {
  readonly aprobada: boolean;
  readonly porcentajeCobertura: number;
  readonly motivoRechazo?: string;
}

export interface ValidadorDeCobertura {
  validar(
    pacienteId: string,
    codigoObraSocial: string,
    numeroAfiliado: string,
  ): Promise<ResultadoValidacionCobertura>;
}

