import { DomainEventBase } from '../../../../building-blocks/domain';

export const MEDICACION_ADMINISTRADA = 'enfermeria.medicacion-administrada';

export interface PropsMedicacionAdministrada {
  readonly administracionId: string;
  readonly indicacionId: string;
  readonly pacienteId: string;
  readonly internacionId: string;
  readonly medicamento: string;
  readonly administradaPor: string;
}

export class MedicacionAdministradaEvent extends DomainEventBase {
  readonly nombre = MEDICACION_ADMINISTRADA;
  readonly administracionId: string;
  readonly indicacionId: string;
  readonly pacienteId: string;
  readonly internacionId: string;
  readonly medicamento: string;
  readonly administradaPor: string;

  constructor(props: PropsMedicacionAdministrada, ocurridoEn: Date = new Date()) {
    super(ocurridoEn);
    this.administracionId = props.administracionId;
    this.indicacionId = props.indicacionId;
    this.pacienteId = props.pacienteId;
    this.internacionId = props.internacionId;
    this.medicamento = props.medicamento;
    this.administradaPor = props.administradaPor;
  }
}

