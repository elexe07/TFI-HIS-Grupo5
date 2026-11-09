import { DomainEventBase } from '../../../building-blocks/domain';

export const MEDICACION_ADMINISTRADA = 'enfermeria.medicacion-administrada';

export interface PropsMedicacionAdministrada {
  readonly administracionId: string;
  readonly indicacionId?: string;
  readonly pacienteId: string;
  readonly internacionId: string;
  readonly medicamento: string;
  readonly administradaPor?: string;
}

export class MedicacionAdministradaEvent extends DomainEventBase {
  readonly nombre = MEDICACION_ADMINISTRADA;
  readonly administracionId: string;
  readonly indicacionId?: string;
  readonly pacienteId: string;
  readonly internacionId: string;
  readonly medicamento: string;
  readonly administradaPor?: string;
  readonly payload: PropsMedicacionAdministrada;

  constructor(
    propsOrPayload: PropsMedicacionAdministrada | { payload: PropsMedicacionAdministrada },
    ocurridoEn: Date = new Date(),
  ) {
    super(ocurridoEn);
    const data =
      'payload' in propsOrPayload &&
      (propsOrPayload as { payload?: PropsMedicacionAdministrada }).payload
        ? (propsOrPayload as { payload: PropsMedicacionAdministrada }).payload
        : (propsOrPayload as PropsMedicacionAdministrada);

    this.administracionId = data.administracionId;
    this.indicacionId = data.indicacionId;
    this.pacienteId = data.pacienteId;
    this.internacionId = data.internacionId;
    this.medicamento = data.medicamento;
    this.administradaPor = data.administradaPor;
    this.payload = {
      administracionId: this.administracionId,
      indicacionId: this.indicacionId,
      pacienteId: this.pacienteId,
      internacionId: this.internacionId,
      medicamento: this.medicamento,
      administradaPor: this.administradaPor,
    };
  }
}

export { MedicacionAdministradaEvent as MedicacionAdministrada };
