export interface DefinirFranjaDatos {
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
  duracionTurnoMin: number;
}

export class DefinirAgendaCommand {
  readonly medicoId: string;
  readonly franjas: DefinirFranjaDatos[];

  constructor(datos: { medicoId: string; franjas: DefinirFranjaDatos[] }) {
    this.medicoId = datos.medicoId;
    this.franjas = datos.franjas;
  }
}
