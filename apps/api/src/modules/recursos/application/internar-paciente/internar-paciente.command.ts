export class InternarPacienteCommand {
  readonly pacienteId: string;
  readonly camaId: string;
  readonly medicoId: string;
  readonly motivo: string;
  readonly ingresoEn?: Date;

  constructor(props: {
    pacienteId: string;
    camaId: string;
    medicoId: string;
    motivo: string;
    ingresoEn?: Date;
  }) {
    this.pacienteId = props.pacienteId;
    this.camaId = props.camaId;
    this.medicoId = props.medicoId;
    this.motivo = props.motivo;
    this.ingresoEn = props.ingresoEn;
  }
}
