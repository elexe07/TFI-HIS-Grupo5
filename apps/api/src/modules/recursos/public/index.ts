import { DomainEventBase } from '../../../building-blocks/domain';

export const PACIENTE_INTERNADO = 'recursos.paciente-internado';
export const PACIENTE_DADO_DE_ALTA = 'recursos.paciente-dado-de-alta';

export class PacienteInternado extends DomainEventBase {
  readonly nombre = PACIENTE_INTERNADO;

  constructor(
    readonly payload: {
      readonly internacionId: string;
      readonly pacienteId: string;
      readonly camaId: string;
      readonly ingresoEn: Date;
    },
    ocurridoEn: Date = new Date(),
  ) {
    super(ocurridoEn);
  }
}

export class PacienteDadoDeAlta extends DomainEventBase {
  readonly nombre = PACIENTE_DADO_DE_ALTA;

  constructor(
    readonly payload: {
      readonly internacionId: string;
      readonly pacienteId: string;
      readonly ingresoEn: Date;
      readonly egresoEn: Date;
    },
    ocurridoEn: Date = new Date(),
  ) {
    super(ocurridoEn);
  }
}

