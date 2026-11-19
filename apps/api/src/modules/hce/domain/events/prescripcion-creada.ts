import { DomainEventBase } from '../../../../building-blocks/domain';

export const PRESCRIPCION_CREADA = 'hce.prescripcion-creada';

export interface PrescripcionCreadaPayload {
  readonly prescripcionId: string;
  readonly pacienteId: string;
  readonly medicamento: string;
  readonly dosis: string;
  readonly frecuenciaHoras: number;
  readonly duracionDias: number;
  readonly inicioEn?: Date;
  readonly internacionId?: string;
}

export class PrescripcionCreada extends DomainEventBase {
  readonly nombre = PRESCRIPCION_CREADA;
  readonly payload: PrescripcionCreadaPayload;

  constructor(
    payloadOrPrescripcionId: PrescripcionCreadaPayload | string,
    pacienteId?: string,
    medicamento?: string,
    dosis?: string,
    frecuenciaHoras?: number,
    duracionDias?: number,
    inicioEn: Date = new Date(),
    internacionId?: string,
  ) {
    if (typeof payloadOrPrescripcionId === 'string') {
      super(inicioEn);
      this.payload = {
        prescripcionId: payloadOrPrescripcionId,
        pacienteId: pacienteId!,
        medicamento: medicamento!,
        dosis: dosis!,
        frecuenciaHoras: frecuenciaHoras!,
        duracionDias: duracionDias!,
        inicioEn,
        internacionId,
      };
    } else {
      super(payloadOrPrescripcionId.inicioEn ?? new Date());
      this.payload = payloadOrPrescripcionId;
    }
  }

  get prescripcionId(): string {
    return this.payload.prescripcionId;
  }
  get pacienteId(): string {
    return this.payload.pacienteId;
  }
  get medicamento(): string {
    return this.payload.medicamento;
  }
  get dosis(): string {
    return this.payload.dosis;
  }
  get frecuenciaHoras(): number {
    return this.payload.frecuenciaHoras;
  }
  get duracionDias(): number {
    return this.payload.duracionDias;
  }
  get inicioEn(): Date | undefined {
    return this.payload.inicioEn;
  }
  get internacionId(): string | undefined {
    return this.payload.internacionId;
  }
}

export { PrescripcionCreada as PrescripcionCreadaEvent };
