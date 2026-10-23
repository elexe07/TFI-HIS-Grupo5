import { DomainEventBase } from '../../../building-blocks/domain';

export const PRESCRIPCION_CREADA = 'hce.prescripcion-creada';

export interface PropsPrescripcionCreada {
  readonly prescripcionId: string;
  readonly pacienteId: string;
  readonly internacionId: string;
  readonly medicamento: string;
  readonly dosis: string;
  readonly frecuenciaHoras: number;
  readonly duracionDias: number;
  readonly inicioEn: Date;
}

export class PrescripcionCreadaEvent extends DomainEventBase {
  readonly nombre = PRESCRIPCION_CREADA;
  readonly prescripcionId: string;
  readonly pacienteId: string;
  readonly internacionId: string;
  readonly medicamento: string;
  readonly dosis: string;
  readonly frecuenciaHoras: number;
  readonly duracionDias: number;
  readonly inicioEn: Date;

  constructor(props: PropsPrescripcionCreada, ocurridoEn: Date = new Date()) {
    super(ocurridoEn);
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

