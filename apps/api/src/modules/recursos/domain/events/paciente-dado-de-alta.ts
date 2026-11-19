import { DomainEventBase, type Id } from '../../../../building-blocks/domain';

export interface PacienteDadoDeAltaProps {
  internacionId: Id;
  pacienteId: Id;
  ingresoEn: Date;
  egresoEn: Date;
  ocurridoEn?: Date;
}

export class PacienteDadoDeAlta extends DomainEventBase {
  readonly nombre = 'recursos.paciente-dado-de-alta' as const;
  readonly internacionId: Id;
  readonly pacienteId: Id;
  readonly ingresoEn: Date;
  readonly egresoEn: Date;

  constructor(props: PacienteDadoDeAltaProps) {
    super(props.ocurridoEn ?? new Date());
    this.internacionId = props.internacionId;
    this.pacienteId = props.pacienteId;
    this.ingresoEn = props.ingresoEn;
    this.egresoEn = props.egresoEn;
  }
}
