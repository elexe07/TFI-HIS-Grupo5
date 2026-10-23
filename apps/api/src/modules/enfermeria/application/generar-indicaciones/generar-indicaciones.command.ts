export interface PropsGenerarIndicaciones {
  readonly prescripcionId: string;
  readonly pacienteId: string;
  readonly internacionId: string;
  readonly medicamento: string;
  readonly dosis: string;
  readonly frecuenciaHoras: number;
  readonly duracionDias: number;
  readonly inicioEn: Date;
}

export class GenerarIndicacionesCommand {
  readonly prescripcionId: string;
  readonly pacienteId: string;
  readonly internacionId: string;
  readonly medicamento: string;
  readonly dosis: string;
  readonly frecuenciaHoras: number;
  readonly duracionDias: number;
  readonly inicioEn: Date;

  constructor(props: PropsGenerarIndicaciones) {
    this.prescripcionId = props.prescripcionId;
    this.pacienteId = props.pacienteId;
    this.internacionId = props.internacionId;
    this.medicamento = props.medicamento;
    this.dosis = props.dosis;
    this.frecuenciaHoras = props.frecuenciaHoras;
    this.duracionDias = props.duracionDias;
    this.inicioEn = props.inicioEn;
  }
}

export interface GenerarIndicacionesResultado {
  readonly prescripcionId: string;
  readonly generadas: number;
  readonly omitidasPorExistentes: number;
}

