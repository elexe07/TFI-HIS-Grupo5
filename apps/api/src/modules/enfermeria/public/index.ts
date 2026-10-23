import { DomainEventBase } from '../../../building-blocks/domain';

export const MEDICACION_ADMINISTRADA = 'enfermeria.medicacion-administrada';

export class MedicacionAdministrada extends DomainEventBase {
  readonly nombre = MEDICACION_ADMINISTRADA;

  constructor(
    readonly payload: {
      readonly administracionId: string;
      readonly pacienteId: string;
      readonly internacionId: string;
      readonly medicamento: string;
    },
    ocurridoEn: Date = new Date(),
  ) {
    super(ocurridoEn);
  }
}

