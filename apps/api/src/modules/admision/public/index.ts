import { DomainEventBase } from '../../../building-blocks/domain';

export const PACIENTE_REGISTRADO = 'admision.paciente-registrado';

export class PacienteRegistrado extends DomainEventBase {
  readonly nombre = PACIENTE_REGISTRADO;

  constructor(
    readonly pacienteId: string,
    ocurridoEn: Date = new Date(),
  ) {
    super(ocurridoEn);
  }
}

