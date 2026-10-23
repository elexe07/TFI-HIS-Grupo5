import { Entity, generarId, type Id } from '../../../building-blocks/domain';

export interface PropsAdministracionMedicacion {
  readonly indicacionId: string;
  readonly pacienteId: string;
  readonly medicamento: string;
  readonly administradaEn: Date;
  readonly administradaPor: string;
}

/**
 * Administración de Medicación (inmutable).
 * Registra la ejecución de una indicación médica.
 */
export class AdministracionDeMedicacion extends Entity<Id> {
  readonly indicacionId: string;
  readonly pacienteId: string;
  readonly medicamento: string;
  readonly administradaEn: Date;
  readonly administradaPor: string;

  private constructor(id: Id, props: PropsAdministracionMedicacion) {
    super(id);
    this.indicacionId = props.indicacionId;
    this.pacienteId = props.pacienteId;
    this.medicamento = props.medicamento;
    this.administradaEn = props.administradaEn;
    this.administradaPor = props.administradaPor;
  }

  static crear(props: PropsAdministracionMedicacion, id: Id = generarId()): AdministracionDeMedicacion {
    return new AdministracionDeMedicacion(id, props);
  }

  static reconstituir(id: Id, props: PropsAdministracionMedicacion): AdministracionDeMedicacion {
    return new AdministracionDeMedicacion(id, props);
  }
}

