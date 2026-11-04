import { DomainEventBase } from '../../../building-blocks/domain';

export class EvolucionRegistrada extends DomainEventBase {
  readonly nombre = 'hce.evolucion-registrada';

  constructor(
    readonly evolucionId: string,
    readonly pacienteId: string,
    readonly medicoId: string,
    ocurridoEn: Date,
    readonly turnoId?: string,
    readonly internacionId?: string,
  ) {
    super(ocurridoEn);
  }
}

export class PrescripcionCreada extends DomainEventBase {
  readonly nombre = 'hce.prescripcion-creada';

  constructor(
    readonly prescripcionId: string,
    readonly pacienteId: string,
    readonly medicamento: string,
    readonly dosis: string,
    readonly frecuenciaHoras: number,
    readonly duracionDias: number,
    readonly inicioEn: Date,
    readonly internacionId?: string,
  ) {
    super(inicioEn);
  }
}

