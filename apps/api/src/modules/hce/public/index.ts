import { DomainEventBase } from '../../../building-blocks/domain';

export const EVOLUCION_REGISTRADA = 'hce.evolucion-registrada';
export const PRESCRIPCION_CREADA = 'hce.prescripcion-creada';

export interface PropsEvolucionRegistrada {
  readonly evolucionId: string;
  readonly pacienteId: string;
  readonly medicoId: string;
  readonly turnoId?: string;
  readonly internacionId?: string;
}

export class EvolucionRegistrada extends DomainEventBase {
  readonly nombre = EVOLUCION_REGISTRADA;
  readonly evolucionId: string;
  readonly pacienteId: string;
  readonly medicoId: string;
  readonly turnoId?: string;
  readonly internacionId?: string;
  readonly payload: PropsEvolucionRegistrada;

  constructor(
    propsOrPayload: PropsEvolucionRegistrada | { payload: PropsEvolucionRegistrada },
    ocurridoEn: Date = new Date(),
  ) {
    super(ocurridoEn);
    const data =
      'payload' in propsOrPayload && (propsOrPayload as { payload?: PropsEvolucionRegistrada }).payload
        ? (propsOrPayload as { payload: PropsEvolucionRegistrada }).payload
        : (propsOrPayload as PropsEvolucionRegistrada);

    this.evolucionId = data.evolucionId;
    this.pacienteId = data.pacienteId;
    this.medicoId = data.medicoId;
    this.turnoId = data.turnoId;
    this.internacionId = data.internacionId;
    this.payload = {
      evolucionId: this.evolucionId,
      pacienteId: this.pacienteId,
      medicoId: this.medicoId,
      turnoId: this.turnoId,
      internacionId: this.internacionId,
    };
  }
}

export interface PropsPrescripcionCreada {
  readonly prescripcionId: string;
  readonly pacienteId: string;
  readonly internacionId?: string;
  readonly medicamento: string;
  readonly dosis: string;
  readonly frecuenciaHoras: number;
  readonly duracionDias: number;
  readonly inicioEn?: Date;
}

export class PrescripcionCreadaEvent extends DomainEventBase {
  readonly nombre = PRESCRIPCION_CREADA;
  readonly prescripcionId: string;
  readonly pacienteId: string;
  readonly internacionId?: string;
  readonly medicamento: string;
  readonly dosis: string;
  readonly frecuenciaHoras: number;
  readonly duracionDias: number;
  readonly inicioEn?: Date;
  readonly payload: PropsPrescripcionCreada;

  constructor(
    propsOrPayload: PropsPrescripcionCreada | { payload: PropsPrescripcionCreada },
    ocurridoEn: Date = new Date(),
  ) {
    super(ocurridoEn);
    const data =
      'payload' in propsOrPayload && (propsOrPayload as { payload?: PropsPrescripcionCreada }).payload
        ? (propsOrPayload as { payload: PropsPrescripcionCreada }).payload
        : (propsOrPayload as PropsPrescripcionCreada);

    this.prescripcionId = data.prescripcionId;
    this.pacienteId = data.pacienteId;
    this.internacionId = data.internacionId;
    this.medicamento = data.medicamento;
    this.dosis = data.dosis;
    this.frecuenciaHoras = data.frecuenciaHoras;
    this.duracionDias = data.duracionDias;
    this.inicioEn = data.inicioEn;
    this.payload = {
      prescripcionId: this.prescripcionId,
      pacienteId: this.pacienteId,
      internacionId: this.internacionId,
      medicamento: this.medicamento,
      dosis: this.dosis,
      frecuenciaHoras: this.frecuenciaHoras,
      duracionDias: this.duracionDias,
      inicioEn: this.inicioEn,
    };
  }
}

export { PrescripcionCreadaEvent as PrescripcionCreada };
