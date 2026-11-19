import { DomainEventBase } from '../../../../building-blocks/domain';

export const EVOLUCION_REGISTRADA = 'hce.evolucion-registrada';

export interface EvolucionRegistradaPayload {
  readonly evolucionId: string;
  readonly pacienteId: string;
  readonly medicoId: string;
  readonly ocurridoEn?: Date;
  readonly turnoId?: string;
  readonly internacionId?: string;
}

export class EvolucionRegistrada extends DomainEventBase {
  readonly nombre = EVOLUCION_REGISTRADA;
  readonly payload: EvolucionRegistradaPayload;

  constructor(
    payloadOrEvolucionId: EvolucionRegistradaPayload | string,
    pacienteId?: string,
    medicoId?: string,
    ocurridoEn: Date = new Date(),
    turnoId?: string,
    internacionId?: string,
  ) {
    if (typeof payloadOrEvolucionId === 'string') {
      super(ocurridoEn);
      this.payload = {
        evolucionId: payloadOrEvolucionId,
        pacienteId: pacienteId!,
        medicoId: medicoId!,
        ocurridoEn,
        turnoId,
        internacionId,
      };
    } else {
      super(payloadOrEvolucionId.ocurridoEn ?? new Date());
      this.payload = payloadOrEvolucionId;
    }
  }

  get evolucionId(): string {
    return this.payload.evolucionId;
  }
  get pacienteId(): string {
    return this.payload.pacienteId;
  }
  get medicoId(): string {
    return this.payload.medicoId;
  }
  get turnoId(): string | undefined {
    return this.payload.turnoId;
  }
  get internacionId(): string | undefined {
    return this.payload.internacionId;
  }
}
