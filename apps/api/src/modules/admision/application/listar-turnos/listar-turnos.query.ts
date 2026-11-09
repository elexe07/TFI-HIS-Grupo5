export class ListarTurnosQuery {
  readonly pacienteId?: string;
  readonly medicoId?: string;
  readonly desde?: Date;
  readonly hasta?: Date;

  constructor(filtros?: {
    pacienteId?: string;
    medicoId?: string;
    desde?: string;
    hasta?: string;
  }) {
    this.pacienteId = filtros?.pacienteId;
    this.medicoId = filtros?.medicoId;
    this.desde = filtros?.desde ? new Date(filtros.desde) : undefined;
    this.hasta = filtros?.hasta ? new Date(filtros.hasta) : undefined;
  }
}
