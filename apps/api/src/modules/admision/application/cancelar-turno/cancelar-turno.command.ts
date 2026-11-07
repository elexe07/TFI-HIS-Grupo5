export interface CancelarTurnoDatos {
  turnoId: string;
  usuarioId: string;
  esPaciente?: boolean;
}

export class CancelarTurnoCommand {
  readonly turnoId: string;
  readonly usuarioId: string;
  readonly esPaciente: boolean;

  constructor(datos: CancelarTurnoDatos) {
    this.turnoId = datos.turnoId;
    this.usuarioId = datos.usuarioId;
    this.esPaciente = datos.esPaciente ?? false;
  }
}
