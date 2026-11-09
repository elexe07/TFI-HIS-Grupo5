export interface ReservarTurnoDatos {
  pacienteId: string;
  medicoId: string;
  inicio: string; // ISO DateTime
  fin?: string; // Optional, ISO DateTime (if omitted, calculated from agenda duration)
  motivoConsulta?: string | null;
  creadoPor: string;
}

export class ReservarTurnoCommand {
  readonly pacienteId: string;
  readonly medicoId: string;
  readonly inicio: Date;
  readonly fin?: Date;
  readonly motivoConsulta: string | null;
  readonly creadoPor: string;

  constructor(datos: ReservarTurnoDatos) {
    this.pacienteId = datos.pacienteId;
    this.medicoId = datos.medicoId;
    this.inicio = new Date(datos.inicio);
    this.fin = datos.fin ? new Date(datos.fin) : undefined;
    this.motivoConsulta = datos.motivoConsulta ?? null;
    this.creadoPor = datos.creadoPor;
  }
}
