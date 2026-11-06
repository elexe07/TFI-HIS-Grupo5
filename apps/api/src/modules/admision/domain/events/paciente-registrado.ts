import { DomainEventBase } from '../../../../building-blocks/domain';

export const EVENTO_PACIENTE_REGISTRADO = 'admision.paciente-registrado';

export class PacienteRegistrado extends DomainEventBase {
  readonly nombre = EVENTO_PACIENTE_REGISTRADO;

  constructor(
    readonly pacienteId: string,
    ocurridoEn: Date,
  ) {
    super(ocurridoEn);
  }
}

