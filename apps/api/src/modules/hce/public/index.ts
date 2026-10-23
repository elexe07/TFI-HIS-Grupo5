import { DomainEventBase } from '../../../building-blocks/domain';

export const EVOLUCION_REGISTRADA = 'hce.evolucion-registrada';
export const PRESCRIPCION_CREADA = 'hce.prescripcion-creada';

export class EvolucionRegistrada extends DomainEventBase {
  readonly nombre = EVOLUCION_REGISTRADA;

  constructor(
    readonly payload: {
      readonly evolucionId: string;
      readonly pacienteId: string;
      readonly medicoId: string;
      readonly turnoId?: string;
      readonly internacionId?: string;
    },
    ocurridoEn: Date = new Date(),
  ) {
    super(ocurridoEn);
  }
}

export class PrescripcionCreada extends DomainEventBase {
  readonly nombre = PRESCRIPCION_CREADA;

  constructor(
    readonly payload: {
      readonly prescripcionId: string;
      readonly pacienteId: string;
      readonly internacionId?: string;
      readonly medicamento: string;
      readonly dosis: string;
      readonly frecuenciaHoras: number;
      readonly duracionDias: number;
      readonly inicioEn?: Date;
    },
    ocurridoEn: Date = new Date(),
  ) {
    super(ocurridoEn);
  }
}

