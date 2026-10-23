export interface ValidarCoberturaCommand {
  readonly pacienteId: string;
  readonly codigoObraSocial: string;
  readonly numeroAfiliado: string;
  readonly cuentaId?: string;
}

export interface ValidarCoberturaResultado {
  readonly aprobada: boolean;
  readonly porcentajeCobertura: number;
  readonly motivoRechazo?: string;
  readonly cuentaActualizada?: boolean;
}

